import React, { createRef } from 'react';
import { PureComponent } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  fetchSellOutDuplicate,
  confirmDuplicate,
  updatePhoneNumber,
} from '../../Controller/SellOutController';
import PageHeader from '../../Content/PageHeader';
import { Button, Icon, Badge, SearchBar } from '@rneui/themed';
import { DEFAULT_COLOR } from '../../Core/URLs';
import { appcolor } from '../../Themes/AppColor';
import { Modalize } from 'react-native-modalize';
import { Message } from '../../Core/Helper';
import ActionFilter from '../ReportHistory/ActionFilter';
import moment from 'moment';
import { alertWarning, minWidthTab } from '../../Core/Utility';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const modalRef = createRef();
const styles = StyleSheet.create({
  inputNumber: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#c2c2c2',
    borderRadius: 5,
    padding: 8,
    margin: 3,
  },
});

class SellOutDuplicate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lstDataContent: [],
      lstData: [],
      lstTabView: [],
      dateFilter: [],
      keySearch: null,
      isFilter: false,
      toDay: moment(new Date()).format('YYYY-MM-DD').toString(),
      markedDates: {
        [moment(new Date()).format('YYYY-MM-DD').toString()]: {
          selected: true,
          marked: true,
          selectedColor: DEFAULT_COLOR,
        },
      },
      isStartDay: false,
      isEndDay: false,
      startDate: '',
    };
    this.markedDatesDefault = {
      [this.state.toDay]: {
        selected: true,
        marked: true,
        selectedColor: DEFAULT_COLOR,
      },
    };
    this.markingTypeDefault = 'custom';
    this.regexPhone = /^0|08[0-9]{9,}$/;
  }

  async componentDidMount() {
    await this.handlerGetData();
  }
  handlerGetData = async () => {
    let mDataSellOut = await fetchSellOutDuplicate();
    let mDataTab = [
      { tabId: 1, tabName: 'Kiểm tra trùng SP' },
      { tabId: 0, tabName: 'Cập nhật SĐT' },
    ];
    if (mDataSellOut != null && mDataSellOut.length > 0) {
      let phone = 0;
      mDataSellOut.forEach((item, index) => {
        if (item.phone === phone) {
          phone = item.phone;
          mDataSellOut[index].contactName = '';
        } else {
          phone = item.phone;
        }
      });
    }

    this.setState({
      lstData: mDataSellOut,
      lstDataContent: mDataSellOut,
      lstTabView: mDataTab,
    });
  };
  handlerActionDuplicate = async item => {
    const labelAlert =
      item.duplicatePS == 0
        ? 'Bạn có muốn xoá sản phẩm này không ?'
        : 'Sản phẩm đang chờ xác nhận, Bạn có muốn huỷ không ?';
    if (item.isPhoneInput === 1) {
      Message('Thông báo', labelAlert, async () => {
        let lstDataDelete = this.state.lstData.map(i =>
          i.itemId == item.itemId
            ? {
              ...i,
              duplicatePS: i.duplicatePS == 1 ? 0 : 1,
              titleConfirmResult:
                i.duplicatePS == 0 ? 'Đang chờ xác nhận' : '',
            }
            : i,
        );
        this.setState({
          lstData: lstDataDelete,
        });
        await confirmDuplicate(item.itemId, item.duplicatePS == 1 ? 0 : 1);
      });
    } else {
      if (
        item.phone == null ||
        item.phone == undefined ||
        item.phone.length < 1
      ) {
        alertWarning('Vui lòng nhập số điện thoại');
        return;
      }
      if (item.phone.length < 10) {
        alertWarning('Số điện thoại không đúng định dạng, vui lòng thử lại');
        return;
      }
      if (
        item.phone != null &&
        item.phone.length > 9 &&
        !this.regexPhone.test(item.phone)
      ) {
        alertWarning('Số điện thoại không đúng định dạng, vui lòng thử lại');
        return;
      }
      await updatePhoneNumber(item.itemId, item.phone);
    }
  };
  handlerUpdatePhone = (item, str) => {
    let mUpdatePhone = this.state.lstData.map(i =>
      i.itemId === item.itemId ? { ...i, phone: str } : i,
    );
    this.setState({
      lstData: mUpdatePhone,
    });
  };
  handlerSelectDate = dateString => {
    if (dateString !== null && dateString !== undefined) {
      if (
        this.state.startDate === dateString ||
        dateString < this.state.startDate
      ) {
        this.setState({
          markedDates: this.markedDatesDefault,
          markingType: this.markingTypeDefault,
          isStartDay: false,
          isEndDay: false,
          startDate: '',
        });
      }
      if (!this.state.isStartDay) {
        const markedDates = {};
        const dateFilter = [];
        markedDates[dateString] = {
          startingDay: true,
          color: '#ffa500',
          textColor: 'white',
        };
        dateFilter.push(dateString);
        this.setState({
          dateFilter: dateFilter,
          markingType: 'period',
          markedDates: markedDates,
          isStartDay: true,
          isEndDay: false,
          startDate: dateString,
        });
      } else {
        const markedDates = { ...this.state.markedDates };
        const dateFilter = this.state.dateFilter;
        //
        let startDate = moment(this.state.startDate);
        let endDate = moment(dateString);
        let range = endDate.diff(startDate, 'days');

        if (range > 0) {
          for (let i = 1; i <= range; i++) {
            let tempDate = startDate.add(1, 'day');
            tempDate = moment(tempDate).format('YYYY-MM-DD');
            dateFilter.push(tempDate);
            if (i < range) {
              markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
            } else {
              markedDates[tempDate] = {
                endingDay: true,
                color: '#ffa500',
                textColor: 'white',
              };
            }
          }
          this.setState({
            dateFilter: dateFilter,
            markingType: 'period',
            markedDates: markedDates,
            isStartDay: false,
            isEndDay: true,
            startDate: '',
          });
        }
      }
    } else {
      this.setState({
        markedDates: this.markedDatesDefault,
        markingType: this.markingTypeDefault,
      });
    }
  };
  handlerApplyFilter = typeFilter => {
    let sortList = [];
    if (typeFilter == 'APPLY') {
      if (this.state.dateFilter.length > 0) {
        this.state.lstDataContent.filter(item => {
          let items = this.state.dateFilter.filter(
            mFilter => item.sellDate.indexOf(mFilter) > -1,
          );
          if (items.length > 0) {
            sortList.push(item);
          }
        });
      } else {
        sortList = { ...this.state.lstDataContent };
      }
      this.setState({ lstData: sortList, isFilter: true });
      modalRef.current.close();
    } else {
      this.setState({
        isFilter: false,
        dateFilter: [],
        lstData: this.state.lstDataContent,
        markedDates: this.markedDatesDefault,
        markingType: this.markingTypeDefault,
      });
    }
  };
  handlerInputKeyFilter = strKey => {
    let lstFilter = this.state.lstDataContent.filter(
      i =>
        i.productName.toLowerCase().match(strKey.toLowerCase()) ||
        i.contactName.toLowerCase().match(strKey.toLowerCase()) ||
        i.phone.toLowerCase().match(strKey.toLowerCase()),
    );
    this.setState({
      lstData:
        strKey !== null && strKey !== undefined
          ? lstFilter
          : this.state.lstDataContent,
    });
  };
  renderTabBar = () => {
    return (
      <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />
    );
  };
  renderTabView = () => {
    let dataGroup = [];
    return this.state.lstTabView.map(item => {
      dataGroup = this.state.lstData.filter(i => i.duplicate === item.tabId);
      return (
        <Tabs.Tab key={item.tabName} label={item.tabName} name={item.tabName}>
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
              height: '100%',
            }}
          >
            {/* <View style={{ flex: 1, flexDirection: 'column' }} tabLabel={item.tabName}> */}
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={200}
            >
              <FlatList
                style={{ padding: 8 }}
                keyExtractor={item => item.itemId}
                data={dataGroup}
                renderItem={this.renderItem}
              />
            </KeyboardAvoidingView>
            {/* </View > */}
          </View>
        </Tabs.Tab>
      );
    });
  };
  renderItem = ({ item }) => {
    const mIconDuplicate = item.duplicatePS == 0 ? 'delete' : '';
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 15,
            marginBottom: 8,
            padding: 8,
            display: item.contactName.length > 0 ? 'flex' : 'none',
            backgroundColor: '#ffd600',
          }}
        >
          {item.contactName}
        </Text>
        <View
          style={{
            marginBottom: 8,
            borderColor: '#e2e2e2',
            borderWidth: 0.5,
            borderRadius: 5,
          }}
        >
          <View style={{ padding: 8, flex: 1, flexDirection: 'column' }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Badge
                status="primary"
                badgeStyle={{
                  height: 32,
                  width: 32,
                  borderRadius: 20,
                  marginEnd: 8,
                }}
                value={item.quantity}
              />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
                {item.productName}
              </Text>
              <Button
                type="outline"
                icon={
                  item.isPhoneInput == 1 ? (
                    <SpiralIcon
                      type="material-community"
                      name={mIconDuplicate}
                      size={20}
                      color={item.colorConfirmTL}
                    />
                  ) : (
                    <SpiralIcon
                      type="material-community"
                      name="update"
                      size={20}
                      color={DEFAULT_COLOR}
                    />
                  )
                }
                style={{ flex: 1 }}
                title={item.titleConfirmResult}
                disabled={item.confirmTL !== null}
                titleStyle={{ fontSize: 13, color: item.colorConfirmTL }}
                buttonStyle={{ borderColor: item.colorConfirmTL, height: 35 }}
                onPress={() => {
                  this.handlerActionDuplicate(item);
                }}
              />
            </View>
            <Text style={{ paddingBottom: 3 }}>{item.shopName}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.sellDate}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.fullName}</Text>
            <View
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text>SĐT: </Text>
              <TextInput
                keyboardType="phone-pad"
                editable={item.isPhoneInput == 0}
                maxLength={11}
                value={item.phone}
                style={{
                  ...styles.inputNumber,
                  marginStart: 0,
                  width: 150,
                  textAlign: 'left',
                }}
                placeholder="Số điện thoại"
                onChangeText={text => this.handlerUpdatePhone(item, text)}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          Title={'Kiểm tra trùng số bán'}
          righticon={'filter'}
          rightclick={() => modalRef.current.open('top')}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <SearchBar
            containerStyle={{
              borderTopColor: 'white',
              backgroundColor: appcolor.transparent,
              borderBottomColor: appcolor.transparent,
            }}
            inputContainerStyle={{ backgroundColor: '#e2e2e2', height: 38 }}
            inputStyle={{ fontSize: 13, color: 'black' }}
            placeholder="Tìm kiếm sản phẩm"
            lightTheme
            round
            clearIcon
            value={this.state.keySearch}
            onChangeText={this.handlerInputKeyFilter}
          />
          <Tabs.Container
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                scrollEnabled={true}
                tabStyle={{
                  minWidth: minWidthTab(this.state.lstTabView),
                  height: 32,
                }}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                indicatorStyle={{ backgroundColor: appcolor.primary }}
                inactiveColor={appcolor.dark}
                activeColor={appcolor.dark}
                style={{ backgroundColor: appcolor.light }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.surface }}
          >
            {this.renderTabView()}
          </Tabs.Container>
          {/* <ScrollableTabView
                        style={{ marginBottom: 20 }}
                        initialPage={0}
                        tabBarBackgroundColor={DEFAULT_COLOR}
                        tabBarTextStyle={{ fontSize: 15, color: 'white' }}
                        tabBarUnderlineStyle={{ height: 2, backgroundColor: 'white' }}
                        renderTabBar={this.renderTabBar}>
                        {this.renderTabView()}
                    </ScrollableTabView> */}
        </View>

        <Modalize ref={modalRef} modalHeight={450}>
          <View View style={{ flex: 1, margin: 8 }}>
            <View
              style={{ flex: 1, marginBottom: 8, flexDirection: 'row-reverse' }}
            >
              <Button
                type="solid"
                title="Áp dụng"
                titleStyle={{ fontSize: 12 }}
                buttonStyle={{ marginStart: 5 }}
                onPress={() => this.handlerApplyFilter('APPLY')}
              />
              <Button
                type="outline"
                title="Làm mới"
                titleStyle={{ fontSize: 12 }}
                onPress={() => this.handlerApplyFilter('CLEAR')}
              />
            </View>
            <ActionFilter
              handlerSelectDate={this.handlerSelectDate.bind(this)}
              mState={this.state}
            />
          </View>
        </Modalize>
      </View>
    );
  }
}

export default SellOutDuplicate;
