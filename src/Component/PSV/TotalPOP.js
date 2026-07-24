import React, { Component } from 'react';
import {
  View,
  Modal,
  Dimensions,
  TextInput,
  StatusBar,
  ActivityIndicator,
  SectionList,
  RefreshControl,
  Platform,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Card,
  ListItem,
  Badge,
  Image,
  SearchBar,
  Input,
  Text,
} from '@rneui/themed';
import { checkNetwork, deviceWidth, minWidthTab } from '../../Core/Utility';
import {
  DEFAULT_COLOR,
  URL_DOWNLOAD_TOTALPOP,
  URL_DOWNLOAD_WARNINGPOP,
} from '../../Core/URLs';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import {
  GetEmployeeInfo,
  MessageInfo,
  Token,
  UUIDGenerator,
} from '../../Core/Helper';
import * as Progress from 'react-native-progress';
// import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view';

import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';

import { uploadPOPData } from '../../Controller/WorkController';
import {
  updateWarehouse,
  uploadOrderPOP,
} from '../../Controller/POPController';
import PageHeader from '../../Content/PageHeader';
import ActionSheet from 'react-native-actions-sheet';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { AppCreateAction } from '../../Core/ReduxController';

const styles = StyleSheet.create({
  line: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 4,
    marginTop: 4,
  },
  svgCurve: {
    position: 'absolute',
    width: Dimensions.get('window').width,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

class TotalPOP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      EmployInfo: null,
      lstShow: [],
      lstFirst: [],
      lstResult: [],
      groupName: '',
      lstGroup: [],
      lstWareHouse: [],
      isEnterPop: false,
      isMyCart: false,
      POPSelected: null,
      wareHouseName: null,
      refreshing: false,
      wareHouseId: this.props.route.params.wareHouseId,
      search: '',
      quantityEnter: undefined,
      address: '',
      tabSaved: 0,
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  async componentDidMount() {
    let EmployeeInfo = await GetEmployeeInfo();
    let emObj = EmployeeInfo;
    this.setState({ EmployInfo: emObj, address: emObj.address });

    if (
      this.props.route.params.kpiId === 1 ||
      this.props.route.params.kpiId === 2 ||
      this.props.route.params.kpiId === 4
    ) {
      if (
        this.props.route.params.wareHouseList !== undefined &&
        this.props.route.params.wareHouseList.length > 0
      ) {
        let lst = eval(this.props.route.params.wareHouseList);
        this.setState({
          lstWareHouse: lst,
          wareHouseName: lst[0].WareHouseName,
          wareHouseId: lst[0].WareHouseId,
        });
      }
    }

    this.loadData();
  }
  isIndicator = async value => {
    this.setState({ refreshing: value });
  };
  async loadData() {
    let url = '';
    switch (this.props.route.params.kpiId) {
      case 3:
        url = URL_DOWNLOAD_WARNINGPOP;
        break;
      default:
        url = URL_DOWNLOAD_TOTALPOP;
        break;
    }

    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    await this.isIndicator(true);
    let token = await Token();

    await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        WarehouseId: this.state.wareHouseId,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(async res => {
        // get group
        this.getGroup(res);

        await this.isIndicator(false);
        await this.setState({ lstShow: [] });
        await this.setState({
          lstShow: await this.DisplayItemMap(res),
          lstFirst: res,
        });
        this.handleChangeTab({ i: this.state.tabSaved });
      });
  }
  async getGroup(total) {
    let MapArr = [];
    let itemMap = {};
    total.map((item, i) => {
      if (!itemMap[item.groupName]) {
        itemMap[item.groupName] = [];
        MapArr.push(item.groupName);
      }
    });

    await this.setState({ lstGroup: MapArr });
  }
  DisplayItemMap(total) {
    let MapArr = [];
    let itemMap = {};
    let items = {};
    let groupName = '';

    total.map((item, i) => {
      var isnew = 0;
      if (!itemMap[item.groupName]) {
        itemMap[item.groupName] = [];
        items = {};
        groupName = '';
        isnew = 1;
      }

      itemMap[item.groupName].push(item);
      items = itemMap[item.groupName];
      groupName = item.groupName;

      if (isnew == 1) {
        groupName != '' &&
          MapArr.push({ title: { name: groupName }, data: items });
      }
    });
    return MapArr;
  }
  checkSearch = (item, text) => {
    return item.popName.toLowerCase().indexOf(text.toLowerCase()) > -1;
  };
  updateSearch = text => {
    this.setState({ search: text });

    if (text === '') {
      this.setState({ lstShow: this.DisplayItemMap(this.state.lstFirst) });
    } else {
      let dataFilter = this.state.lstFirst.filter(item => {
        return this.checkSearch(item, text);
      });

      this.setState({ lstShow: this.DisplayItemMap(dataFilter) });
    }
  };
  changeValueDamage = async (text, item) => {
    await this.setState({
      lstShow: this.state.lstShow.map(itp =>
        itp.title.name === item.groupName
          ? {
            ...itp,
            data: itp.data.map(it =>
              it.popId === item.popId
                ? { ...it, damagedInWarehouse: text === '' ? '' : text }
                : it,
            ),
          }
          : itp,
      ),
      lstFirst: this.state.lstFirst.map(it =>
        it.popId === item.popId
          ? { ...it, damagedInWarehouse: text === '' ? '' : text }
          : it,
      ),
    });
  };
  addQuantity = item => {
    this.setState({
      isEnterPop: this.state.isEnterPop ? false : true,
      POPSelected: item,
    });
  };
  renderItem = ({ item }) => (
    <View style={{ width: '100%' }}>
      {this.props.route.params.kpiId === 2 && (
        <View
          style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
        >
          {/* <Text>{JSON.stringify(item)}</Text> */}
          <View style={{ width: '30%', paddingLeft: 10 }}>
            <Image
              style={{ width: 100, height: 100, alignSelf: 'flex-start' }}
              source={{ uri: item.image }}
              PlaceholderContent={<ActivityIndicator />}
            />
          </View>

          <View style={{ flexDirection: 'column', width: '70%' }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '700',
                  textAlign: 'left',
                  width: '70%',
                }}
              >
                {item.popName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  width: '30%',
                  textAlign: 'left',
                  borderWidth: 1,
                  borderRadius: 7,
                  borderColor: 'lightgray',
                  padding: 10,
                  backgroundColor: 'lightgray',
                }}
              >
                {item.quantity}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  textAlign: 'left',
                  width: '70%',
                }}
              >
                {'Hư hỏng khi vận chuyển'}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  width: '30%',
                  textAlign: 'left',
                  borderWidth: 1,
                  borderRadius: 7,
                  borderColor: 'lightgray',
                  padding: 10,
                  backgroundColor: 'lightgray',
                }}
              >
                {item.damagedShipping}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  textAlign: 'left',
                  width: '70%',
                }}
              >
                {'Hư hỏng khi nhập kho'}
              </Text>
              <TextInput
                onChangeText={text => this.changeValueDamage(text, item)}
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  width: '30%',
                  textAlign: 'left',
                  borderWidth: 1,
                  borderRadius: 7,
                  borderColor: 'lightgray',
                  height: 35,
                  paddingLeft: 10,
                }}
                keyboardType="numeric"
                value={item.damagedInWarehouse + ''}
              />
            </View>
          </View>
        </View>
      )}
      {(this.props.route.params.kpiId === 1 ||
        this.props.route.params.kpiId === 3) && (
          <View
            style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{ width: '30%', paddingLeft: 10 }}>
              <Image
                style={{ width: 100, height: 100 }}
                source={{ uri: item.image }}
                PlaceholderContent={<ActivityIndicator />}
              />
            </View>

            <View style={{ flexDirection: 'column', width: '70%' }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  padding: 5,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: 'black',
                    fontWeight: '700',
                    textAlign: 'left',
                    width: '62%',
                  }}
                >
                  {item.popName}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'black',
                    fontWeight: '600',
                    width: '38%',
                    textAlign: 'left',
                    borderWidth: 1,
                    borderRadius: 7,
                    borderColor: 'lightgray',
                    padding: 10,
                  }}
                >
                  {item.quantity}
                </Text>
              </View>
            </View>
          </View>
        )}
      {this.props.route.params.kpiId === 4 && (
        <View
          style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: '30%', paddingLeft: 10 }}>
            <Image
              style={{ width: 100, height: 100, alignSelf: 'flex-start' }}
              source={{ uri: item.image }}
              PlaceholderContent={<ActivityIndicator />}
            />
          </View>

          <View style={{ flexDirection: 'column', width: '70%' }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: 'black',
                  fontWeight: '700',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {item.popName}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  textAlign: 'left',
                  width: '70%',
                }}
              >
                {'Tồn kho tổng: '}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  width: '30%',
                  textAlign: 'left',
                }}
              >
                {item.quantity}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  textAlign: 'left',
                  width: '70%',
                }}
              >
                {'Tồn kho cá nhân: '}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontWeight: '600',
                  width: '30%',
                  textAlign: 'left',
                }}
              >
                {item.quantityMyHouse || '0'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 5,
                alignItems: 'center',
                bottom: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: 'red',
                  fontWeight: '600',
                  width: '100%',
                  textAlign: 'right',
                  right: 50,
                }}
              >
                {item.UserInput !== undefined ? '' + item.UserInput : ''}
              </Text>
            </View>
            <SpiralIcon
              type="ionicon"
              style={{ bottom: 3, right: 15, position: 'absolute' }}
              size={30}
              name="add-circle-outline"
              onPress={() => this.addQuantity(item)}
              color={'black'}
            />
          </View>
        </View>
      )}
    </View>
  );
  renderItemCard = ({ item }) => (
    <View
      style={{ width: '100%', height: 200, paddingTop: 8, paddingBottom: 8 }}
    >
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ width: '30%' }}>
          <Image
            style={{ width: 100, height: 100, alignSelf: 'flex-start' }}
            source={{ uri: item.image }}
            PlaceholderContent={<ActivityIndicator />}
          />
        </View>

        <View
          style={{
            flexDirection: 'column',
            width: '70%',
            alignSelf: 'flex-end',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              top: 3,
              height: '33%',
            }}
          >
            <ListItem.Title
              style={{
                fontSize: 15,
                color: 'black',
                fontWeight: '700',
                width: '100%',
                textAlign: 'left',
                marginLeft: 8,
              }}
            >
              {item.popName}
            </ListItem.Title>
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              top: 3,
              height: '33%',
            }}
          >
            <ListItem.Title
              style={{
                fontSize: 11,
                color: 'black',
                fontWeight: '600',
                width: '100%',
                textAlign: 'left',
                marginLeft: 8,
              }}
            >
              {'Tồn kho cá nhân: ' + item.quantity}
            </ListItem.Title>
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              top: 3,
              height: '33%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ListItem.Title
              style={{
                fontSize: 11,
                color: 'black',
                fontWeight: '600',
                width: '30%',
                textAlign: 'left',
                marginLeft: 8,
              }}
            >
              Đề xuất:{' '}
            </ListItem.Title>
            <Input
              onChangeText={text => this.UpdateQuantityToList(item, text)}
              containerStyle={{
                height: 35,
                width: '30%',
                borderColor: 'lightgray',
                borderWidth: 2,
                borderRadius: 5,
              }}
              labelStyle={{ textAlign: 'center', fontSize: 11 }}
              inputContainerStyle={{ borderBottomColor: '#fff', bottom: 5 }}
              inputStyle={{
                textAlign: 'center',
                borderBottomColor: '#fff',
                fontSize: 13,
              }}
              keyboardType="number-pad"
              defaultValue={item.UserInput + ''}
            />
            {/* <Button containerStyle={{width:'30%'}} title={'Xoá'}></Button> */}
            <SpiralIcon
              type="ionicon"
              style={{ left: 15, width: '30%' }}
              size={35}
              name="trash-outline"
              onPress={() => this.UpdateQuantityToList(item, undefined)}
              color={'black'}
            />
          </View>
        </View>
      </View>
      <View style={styles.line} />
    </View>
  );

  isRandomColor = () => {
    let ColorCode =
      'rgb(' +
      Math.floor(Math.random() * 256) +
      ',' +
      Math.floor(Math.random() * 256) +
      ',' +
      Math.floor(Math.random() * 256) +
      ')';
    return ColorCode;
  };
  uploadDamageAction = async () => {
    updateWarehouse(this.state.lstFirst, () => {
      this.loadData();
    });
  };
  RenderTabItem = () => {
    return this.state.lstGroup.map(item => {
      return (
        <Tabs.Tab key={item} label={item} name={item}>
          <View
            style={{
              backgroundColor: this.props.appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
            }}
          >
            {/* <View tabLabel={item}> */}
            <SectionList
              contentContainerStyle={{
                bottom: Platform.OS === 'android' ? 10 : 0,
              }}
              style={{ top: 10 }}
              contentInset={{ bottom: 60 }}
              automaticallyAdjustContentInsets={false}
              sections={this.state.lstShow}
              ItemSeparatorComponent={RenderSeparatorStyle}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => item + index}
              // initialNumToRender={1}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
            {/* </View> */}
          </View>
        </Tabs.Tab>
      );
    });
  };
  SaveQuantityToList = async itemSave => {
    if (
      this.state.quantityEnter !== '' &&
      this.state.quantityEnter !== undefined
    ) {
      if (parseInt(this.state.quantityEnter) <= 0) {
        MessageInfo('Số lượng đề xuất lớn hơn 0.');
        return;
      } else {
        // if (parseInt(this.state.quantityEnter) > itemSave.totalPOP) {
        //   MessageInfo('Số lượng đề xuất không được lớn hơn tồn kho tổng.')
        //   return
        // }

        let myHouse = itemSave.quantity != null ? itemSave.quantity : 0;
        if (parseInt(this.state.quantityEnter) > myHouse) {
          MessageInfo(
            'Số lượng đề xuất không được lớn hơn tồn kho tổng.' + myHouse,
          );
          return;
        }
      }
    }

    let lstShowSave = this.state.lstFirst.map(itemChild =>
      itemChild.popId === itemSave.popId
        ? { ...itemChild, UserInput: this.state.quantityEnter }
        : itemChild,
    );

    let lstSort = lstShowSave.filter(item => {
      return item.groupName === this.state.groupName;
    });

    this.setState({
      lstFirst: lstShowSave,
      lstShow: this.DisplayItemMap(lstSort),
      quantityEnter: undefined,
      isEnterPop: false,
    });
  };
  UpdateQuantityToList = async (itemSave, quantity) => {
    let lstShowSave = this.state.lstFirst.map(itemChild =>
      itemChild.popId === itemSave.popId
        ? { ...itemChild, UserInput: quantity }
        : itemChild,
    );

    let lstSort = lstShowSave.filter(item => {
      return item.groupName === this.state.groupName;
    });

    this.setState({
      lstFirst: lstShowSave,
      lstShow: this.DisplayItemMap(lstSort),
    });
  };
  ShowMyCart = () => {
    this.setState({ address: '', isMyCart: true });
  };
  UploadItems = async () => {
    let lstUpload = this.state.lstFirst.filter(item => {
      return item.UserInput !== undefined && item.UserInput !== 0;
    });
    if (lstUpload.length === 0) {
      MessageInfo('Chưa có pop đề xuất, Vui lòng đề xuất POP trong danh sách.');
      return;
    }

    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    if (this.state.address === undefined || this.state.address === '') {
      MessageInfo('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }

    this.setShowProgress(false);

    // alertPrint(this.props)
    await uploadOrderPOP(
      lstUpload,
      this.state.wareHouseId,
      UUIDGenerator(),
      this.state.address,
      () => {
        this.setShowProgress(false);
        this.setState({ isMyCart: false });
        this.loadData();
      },
      () => {
        this.setShowProgress(false);
        MessageInfo('Lỗi không thể đề xuất POP');
      },
    );
  };
  handleChangeTab = async ({ i, ref, from }) => {
    // alert(i)
    await this.setState({ tabSaved: i });
    if (this.state.lstShow.length > 0) {
      this.setState({ groupName: this.state.lstGroup[i] });

      let lstSort = this.state.lstFirst.filter(item => {
        return item.groupName === this.state.lstGroup[i];
      });

      await this.setState({ lstShow: this.DisplayItemMap(lstSort) });
    }
  };
  itemSelect = async item => {
    await this.setState({
      wareHouseName: item.WareHouseName,
      wareHouseId: item.WareHouseId,
    });
    await this.loadData();
    this._bottomSheet.hide();
  };
  renderItemWarhouse = ({ item }) => (
    // <View style={{ height: 50, width: '100%',backgroundColor:'red' }} >
    <TouchableOpacity onPress={() => this.itemSelect(item)}>
      <Card containerStyle={{ borderColor: 'lightgray' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
          {item.WareHouseName}
        </Text>
      </Card>
    </TouchableOpacity>
  );
  render() {
    let number = this.state.lstFirst.filter(item => {
      return item.UserInput !== undefined && item.UserInput !== 0;
    }).length;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: '#fff',
        }}
      >
        <StatusBar hidden={true}></StatusBar>
        {/* <WavyHeader customStyles={styles.svgCurve} flip={true}></WavyHeader> */}
        <HeaderCustom
          leftFunc={() => this.props.navigation.goBack()}
          title={this.props.route.params.menuName}
          iconRight={
            this.props.route.params.kpiId === 2 ? 'cloud-upload-alt' : null
          }
          rightFunc={() =>
            this.props.route.params.kpiId === 2 && this.uploadDamageAction()
          }
        />
        {
          <View
            style={{
              borderRadius: 10,
              alignContent: 'center',
              justifyContent: 'space-between',
              flexDirection: 'column',
              top: 8,
            }}
          >
            {(this.props.route.params.kpiId === 4 ||
              this.props.route.params.kpiId === 1) && (
                <Button
                  buttonStyle={{
                    backgroundColor: '#fff',
                    borderColor: 'black',
                    borderWidth: 1,
                    marginRight: 10,
                    width: this.props.route.params.kpiId === 4 ? '80%' : '98%',
                  }}
                  containerStyle={{ height: 50, marginLeft: 10 }}
                  titleStyle={{ fontSize: 14, fontWeight: '600', color: 'black' }}
                  title={this.state.wareHouseName}
                  onPress={() => this._bottomSheet.show()}
                />
              )}
            <SearchBar
              containerStyle={{
                backgroundColor: '#fff',
                // height: 45,
                borderWidth: 0,
                borderColor: '#fff',
                borderBottomColor: 'transparent',
                borderTopColor: 'transparent',
              }}
              inputContainerStyle={{
                height: 35,
                borderColor: 'gray',
                borderWidth: 1,
              }}
              inputStyle={{ fontSize: 15 }}
              lightTheme={true}
              clearIcon={true}
              height={30}
              placeholder="Nhập tìm kiếm ở đây"
              onChangeText={this.updateSearch}
              value={this.state.search}
            />
            {this.props.route.params.kpiId === 4 && (
              <View
                style={{
                  width: 50,
                  position: 'absolute',
                  right: 10,
                  alignSelf: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <SpiralIcon
                  type="ionicon"
                  name="cart-outline"
                  size={35}
                  onPress={e => this.ShowMyCart()}
                />
                {number > 0 && (
                  <Badge
                    value={number > 99 ? '99+' : number}
                    textStyle={{ fontSize: 11, color: 'white' }}
                    badgeStyle={{ width: 20, height: 20, borderRadius: 12.5 }}
                    status="error"
                    containerStyle={{ position: 'absolute', top: -8, left: 10 }}
                    onPress={() => this.ShowMyCart()}
                  />
                )}
              </View>
            )}
          </View>
        }
        {this.state.lstGroup.length > 0 && (
          <Tabs.Container
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                indicatorStyle={{
                  backgroundColor: this.props.appcolor.primary,
                }}
                inactiveColor={this.props.appcolor.dark}
                activeColor={this.props.appcolor.dark}
                scrollEnabled={true}
                style={{ backgroundColor: this.props.appcolor.light }}
                tabStyle={{
                  minWidth: minWidthTab(this.state.lstGroup),
                  height: 36,
                }}
              />
            )}
          >
            {this.RenderTabItem()}
          </Tabs.Container>
        )}
        {/* {
          <ScrollableTabView
            style={{ backgroundColor: 'white', marginLeft: 15, marginRight: 15, marginBottom: 20, paddingTop: 0, borderRadius: 10, }}
            initialPage={0}
            onChangeTab={this.handleChangeTab}
            renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}
          >
            {
              this.state.lstGroup.length > 0 &&
              this.state.lstGroup.map(item => {
                return (
                  <View tabLabel={item}>
                    <SectionList
                      contentContainerStyle={{ bottom: Platform.OS === 'android' ? 10 : 0 }}
                      style={{ top: 10 }}
                      contentInset={{ bottom: 60 }}
                      automaticallyAdjustContentInsets={false}
                      sections={this.state.lstShow}
                      ItemSeparatorComponent={RenderSeparatorStyle}
                      renderItem={this.renderItem}
                      keyExtractor={(item, index) => item + index}
                      // initialNumToRender={1}
                      maxToRenderPerBatch={10}
                      windowSize={10}
                    />
                  </View>
                )
              })
            }
          </ScrollableTabView>
        } */}
        {this.state.showProgress === true && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          >
            <Progress.CircleSnail
              color={DEFAULT_COLOR}
              thickness={8}
              size={100}
            />
          </View>
        )}
        {this.state.POPSelected !== null && (
          <Modal animationType="slide" visible={this.state.isEnterPop}>
            <View
              style={{ height: '55%', backgroundColor: 'white', padding: 7 }}
            >
              <TouchableOpacity
                style={{
                  width: 45,
                  height: 45,
                  alignSelf: 'flex-end',
                  right: 7,
                }}
                onPress={() => this.setState({ isEnterPop: false })}
              >
                <SpiralIcon
                  type="ionicon"
                  name="close-outline"
                  size={35}
                  color={DEFAULT_COLOR}
                />
              </TouchableOpacity>

              <View
                style={{
                  width: '100%',
                  height: '100%',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <View style={{ width: '85%' }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {this.state.POPSelected.popName}
                  </Text>
                </View>

                <View style={{ width: '30%', top: 15 }}>
                  <Image
                    style={{ width: 100, height: 100, alignSelf: 'flex-start' }}
                    source={{ uri: this.state.POPSelected.image }}
                    PlaceholderContent={<ActivityIndicator />}
                  />
                </View>

                {/* <Text>{JSON.stringify(this.state.POPSelected)}</Text> */}

                <Text
                  style={{
                    width: '100%',
                    top: 45,
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                >
                  {'Tồn kho tổng: ' + this.state.POPSelected.quantity}
                </Text>
                <Text
                  style={{
                    width: '100%',
                    top: 45,
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                >
                  {'Tồn kho cá nhân: ' +
                    (this.state.POPSelected.quantityMyHouse != null
                      ? this.state.POPSelected.quantityMyHouse
                      : 0) || 0}
                </Text>

                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    top: 50,
                    backgroundColor: 'white',
                  }}
                >
                  <TextInput
                    value={this.state.POPSelected.quantity}
                    onChangeText={text =>
                      this.setState({ quantityEnter: text })
                    }
                    ref={ref => (this.refInput = ref)}
                    style={{
                      width: '73%',
                      marginRight: 10,
                      height: 45,
                      textAlign: 'center',
                      fontSize: 15,
                      fontWeight: '600',
                      borderColor: 'gray',
                      borderWidth: 1,
                      backgroundColor: 'white',
                    }}
                    keyboardType="number-pad"
                    placeholder={'0'}
                  ></TextInput>

                  <Button
                    containerStyle={{ width: '25%' }}
                    title={'Thêm'}
                    onPress={() =>
                      this.SaveQuantityToList(this.state.POPSelected)
                    }
                  ></Button>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {this.state.lstFirst.length > 0 && (
          <Modal
            presentationStyle="overFullScreen"
            animated={true}
            animationType="slide"
            visible={this.state.isMyCart}
            transparent={true}
          >
            <View style={{ ...styles.overlay }}>
              <Card containerStyle={{ height: '80%' }}>
                <View
                  style={{
                    height: '8%',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    containerStyle={{ width: '30%' }}
                    title={'Upload'}
                    onPress={() => this.UploadItems()}
                  ></Button>
                  <Button
                    containerStyle={{ width: '30%' }}
                    title={'Đóng'}
                    onPress={() => {
                      this.setState({ isMyCart: false });
                    }}
                  ></Button>
                </View>
                <View style={styles.line} />

                <View style={{ flexDirection: 'column', height: '15%' }}>
                  <Text style={{ paddingTop: 2, paddingBottom: 2 }}>
                    {'Địa chỉ nhận: '}
                  </Text>
                  <TextInput
                    multiline={true}
                    style={{
                      width: '100%',
                      borderColor: 'lightgray',
                      borderWidth: 1,
                      borderRadius: 10,
                      height: 70,
                    }}
                    keyboardType={'default'}
                    value={this.state.address}
                    onChangeText={text => this.setState({ address: text })}
                  />
                </View>

                {/* <View style={styles.line} /> */}

                <FlatList
                  style={{ height: '77%' }}
                  scrollEnabled={true}
                  keyExtractor={(item, index) => item + index}
                  data={this.state.lstFirst.filter(item => {
                    return item.UserInput !== undefined && item.UserInput !== 0;
                  })}
                  renderItem={this.renderItemCard}
                  numColumns={1}
                />
              </Card>
            </View>
          </Modal>
        )}
        <ActionSheet
          ref={ref => (this._bottomSheet = ref)}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            padding: 0,
            height: Platform.OS === 'android' ? '80%' : null,
          }}
        >
          {/* <Text>{JSON.stringify(this.props.route.params.wareHouseList)}</Text> */}
          <FlatList
            style={{
              width: '100%',
              height: '50%',
              marginBottom: Platform.OS == 'ios' ? 20 : 0,
            }}
            keyExtractor={(item, index) => item + index}
            data={this.state.lstWareHouse}
            renderItem={this.renderItemWarhouse}
          />
        </ActionSheet>
      </View>
      // </View>
    );
  }
}
function mapStateToProps(state) {
  return {
    appcolor: state.GAppState.appcolor,
    shopinfo: state.GAppState.shopinfo,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(TotalPOP);
const RenderSeparatorStyle = () => {
  return (
    <View style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }} />
  );
};
