import React, { PureComponent, createRef } from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import PageHeader from '../../Content/PageHeader';
import { Card, Avatar, Text, Button, Icon, Image } from '@rneui/themed';
import { appcolor } from '../../Themes/AppColor';
import { URL_GET_HISTORY_REPORT, DEFAULT_COLOR } from '../../Core/URLs';
import { Token } from '../../Core/Helper';
import { alertError } from '../../Core/Utility';
import { Modalize } from 'react-native-modalize';
import ReportSellOut from './ReportSellOut';
import ReportDisplay from './ReportDisplay';
import ReportOOS from './ReportOOS';
import ReportInventory from './ReportInventory';
import ProgressCircleSnail from '../../Content/ProgressCircleSnail';
import FBCollage from 'react-native-fb-collage';
import ActionFilter from './ActionFilter';
import moment from 'moment';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const styles = StyleSheet.create({
  styleRow: {
    ...(Platform.OS !== 'android' && { zIndex: 10 }),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

const DETAIL_modalizeRef = createRef();
const filterRef = createRef();

let mSellOut = 'SellOut';
let mDisplay = 'Display';
let mOOS = 'OOS';
let mInventory = 'Inventory';
class ViewReportDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingData: true,
      titlePage: JSON.parse(props.route.params.titlePage),
      dataRenderAll: [],
      lstHistoryReport: [],
      reportData: [],
      dataDetailPhoto: [],
      strSearch: null,
      fetchDataServer: false,
      showSellOut: false,
      showDisplay: false,
      showOOS: false,
      showInventory: false,
      toDay: moment(new Date()).format('YYYY-MM-DD').toString(),
      markingType: 'custom',
      markedDates: {
        [moment(new Date()).format('YYYY-MM-DD').toString()]: {
          selected: true,
          marked: true,
          selectedColor: 'blue',
        },
      },
      isStartDay: false,
      isEndDay: false,
      startDate: '',
      dateFilter: [],
      isFilter: false,
    };
    this.onPage = 1;
    this.markedDatesDefault = {
      [this.state.toDay]: {
        selected: true,
        marked: true,
        selectedColor: 'blue',
      },
    };
    this.markingTypeDefault = 'custom';

    this.handlerSelectDate = this.handlerSelectDate.bind(this);
  }

  async componentDidMount() {
    await this.DATA_FetchFromServer();
  }

  getListImage(jsonImage, titleShop) {
    const arraysConvert = [];
    JSON.parse(jsonImage).forEach(item => {
      // const dataPhoto = {
      //     photos: { thumbnail: { uri: item.PhotoPath } },
      //     viewList: JSON.parse(jsonImage),
      //     shopName: titleShop
      // }
      arraysConvert.push(item.PhotoPath);
    });
    return arraysConvert;
  }

  showModalReport = item => {
    this.setState({ reportData: item });
    DETAIL_modalizeRef.current.open('top');
  };

  selectItemReport = rowData => {
    let KPIName = rowData.Name;
    if (KPIName === mSellOut)
      this.setState({ showSellOut: !this.state.showSellOut });
    if (KPIName === mDisplay)
      this.setState({ showDisplay: !this.state.showDisplay });
    if (KPIName === mOOS) this.setState({ showOOS: !this.state.showOOS });
    if (KPIName === mInventory)
      this.setState({ showInventory: !this.state.showInventory });
  };

  handler_REPORT_UNSHOW = () => {
    this.setState({
      showSellOut: false,
      showDisplay: false,
      showOOS: false,
      showInventory: false,
    });
  };

  handlerViewChange = async ({ viewableItems }) => {
    viewableItems.forEach(item => {
      if (!this.state.fetchDataServer) {
        let index = item['item']['id'];
        let getData = this.state.lstHistoryReport.length - 5;
        if (index === getData) {
          this.setState({ fetchDataServer: true }, () =>
            this.DATA_FetchFromServer(),
          );
        }
      }
    });
  };

  // Filter Event

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
    const sortList = [];
    if (typeFilter == 'APPLY') {
      if (this.state.dateFilter.length > 0) {
        this.state.dataRenderAll.filter(item => {
          let items = this.state.dateFilter.filter(
            mFilter => item.dateView.indexOf(mFilter) > -1,
          );
          if (items.length > 0) {
            sortList.push(item);
          }
        });
      } else {
        sortList = { ...this.state.dataRenderAll };
      }
      this.setState({ lstHistoryReport: sortList, isFilter: true });
      filterRef.current.close();
    } else {
      this.setState({
        isFilter: false,
        dateFilter: [],
        lstHistoryReport: this.state.dataRenderAll,
        markedDates: this.markedDatesDefault,
        markingType: this.markingTypeDefault,
      });
    }
  };

  // Filter Event

  // Fetch Data
  DATA_FetchFromServer = async () => {
    try {
      let access_token = await Token();
      fetch(URL_GET_HISTORY_REPORT, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + access_token,
          PageLoad: this.onPage,
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          const dataRender = this.state.lstHistoryReport.concat(responseJson);
          this.setState({
            dataRenderAll: dataRender,
            lstHistoryReport: dataRender,
            isLoadingData: false,
            fetchDataServer: false,
          });
          this.onPage = this.onPage + 1;
          this.handlerSortData(responseJson);
        });
    } catch (e) {
      alertError('' + e);
    }
  };

  handlerSortData = responseJson => {
    if (responseJson.length > this.state.lstHistoryReport.length) {
      this.onPage = this.onPage + 1;
      this.setState({
        dataRenderAll: responseJson,
        lstHistoryReport: responseJson,
      });
    } else if (responseJson.length < this.state.lstHistoryReport.length) {
      this.setState({
        dataRenderAll: responseJson,
        lstHistoryReport: responseJson,
      });
    }
    if (this.state.isFilter) {
      const sortList = [];
      if (this.state.dateFilter.length > 0) {
        this.state.dataRenderAll.filter(item => {
          let items = this.state.dateFilter.filter(
            mFilter => item.dateView.indexOf(mFilter) > -1,
          );
          if (items.length > 0) {
            sortList.push(item);
          }
        });
      } else {
        sortList = { ...this.state.dataRenderAll };
      }
      this.setState({ lstHistoryReport: sortList });
    }

    this.setState({ isLoadingData: false, fetchDataServer: false });
  };

  // Fetch Data

  LOADING_renderFooter = () => {
    return (
      <View>
        {this.state.fetchDataServer ? (
          <ActivityIndicator style={{ padding: 8 }} />
        ) : null}
      </View>
    );
  };

  REPORT_renderItem = ({ item }) => {
    return (
      <Card
        containerStyle={{
          borderRadius: 8,
          flexDirection: 'column',
          borderWidth: 0,
          padding: 8,
          margin: 8,
        }}
      >
        <View style={styles.styleRow}>
          <Avatar
            rounded
            size="small"
            size={28}
            icon={{ name: 'home', type: 'material-community', color: 'white' }}
            overlayContainerStyle={{
              flex: 1,
              backgroundColor: appcolor.greydark,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ marginStart: 8, fontSize: 13, fontWeight: '700' }}>
              {item.employeeName}
            </Text>
            <Text style={{ marginStart: 8, fontSize: 10 }}>
              {item.shopName}
            </Text>
            <Text style={{ marginStart: 8, fontSize: 10 }}>
              {item.dateView}
            </Text>
          </View>
          <Button
            type="clear"
            title="Báo cáo"
            iconRight
            icon={
              <SpiralIcon
                name="arrow-right-circle"
                type="material-community"
                color={appcolor.yellow}
              />
            }
            titleStyle={{
              marginEnd: 3,
              fontSize: 12,
              color: appcolor.greydark,
            }}
            onPress={() => this.showModalReport(JSON.parse(item.reportKPI))}
          />
        </View>
        <View style={{ justifyContent: 'center' }}>
          <FBCollage
            borderRadius={5}
            images={this.getListImage(item.dataPhoto, item.shopName)}
            imageOnPress={() =>
              this.props.navigation.navigate('ViewDetailPhoto', {
                dataPhoto: JSON.parse(item.dataPhoto),
                shopName: item.shopName,
              })
            }
          />
        </View>
      </Card>
    );
  };

  MODAL_DETAIL_renderItem = ({ item }) => {
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: DEFAULT_COLOR,
            padding: 8,
            marginBottom: 5,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              flex: 1,
              margin: 0,
              color: 'white',
              fontSize: 13,
              fontWeight: '700',
            }}
          >
            {item.KPIName}
          </Text>
          <SpiralIcon
            style={{ flex: 1 }}
            name="plus"
            type="material-community"
            color="white"
            size={20}
            onPress={() => this.selectItemReport(item)}
          />
        </View>
        {item.Name == mSellOut && this.state.showSellOut ? (
          <ReportSellOut dataReport={item.ReportSellOut} />
        ) : null}
        {item.Name == mDisplay && this.state.showDisplay ? (
          <ReportDisplay dataReport={item.ReportDisplay} />
        ) : null}
        {item.Name == mOOS && this.state.showOOS ? (
          <ReportOOS dataReport={item.ReportOOS} />
        ) : null}
        {item.Name == mInventory && this.state.showInventory ? (
          <ReportInventory dataReport={item.ReportInventory} />
        ) : null}
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <PageHeader
          Title={this.state.titlePage.employeeName}
          leftclick={() => this.props.navigation.goBack()}
          rightclick={() => filterRef.current.open('top')}
          righticon="filter"
          type="material-community"
          rightcolor="white"
          {...this.props}
        />

        <ProgressCircleSnail
          Title="Đang cập nhật dữ liệu"
          isShowing={this.state.isLoadingData}
        />

        <FlatList
          extraData={this.state}
          keyExtractor={item => item.toString()}
          data={this.state.lstHistoryReport}
          renderItem={this.REPORT_renderItem}
          ListFooterComponent={this.LOADING_renderFooter}
          contentContainerStyle={{ paddingBottom: 24 }}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          //Event
          onViewableItemsChanged={this.handlerViewChange}
        />

        <Modalize
          ref={DETAIL_modalizeRef}
          modalHeight={500}
          onOverlayPress={this.handler_REPORT_UNSHOW}
        >
          <View View style={{ flex: 1, margin: 8, flexDirection: 'column' }}>
            <FlatList
              extraData={this.state}
              keyExtractor={item => item.toString()}
              data={this.state.reportData}
              renderItem={this.MODAL_DETAIL_renderItem}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          </View>
        </Modalize>

        <Modalize ref={filterRef} modalHeight={450}>
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

export default ViewReportDetail;
