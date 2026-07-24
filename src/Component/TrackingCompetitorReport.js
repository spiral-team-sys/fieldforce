import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  VirtualizedList,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { CheckBox, Divider, Icon } from '@rneui/themed';
import {
  getCategory,
  GetCometitorTracking,
} from '../Controller/WorkController';
import {
  checkNetwork,
  deviceHeight,
  deviceWidth,
  minWidthTab,
} from '../Core/Utility';
import * as Progress from 'react-native-progress';
import {
  isNotInteger,
  Message,
  ToastError,
  ToastSuccess,
} from '../Core/Helper';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
//import { AppCreateAction } from '../Core/ReduxController';
import { HeaderCustom } from '../Content/HeaderCustom';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadController from '../Controller/UploadController';
import SpiralIcon from '../Control/Icon/SpiralIcon';
class TrackingCompetitorReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      Categories: [],
      CompetitorResult: [],
      KeyReport: '',
      total: 0,
      uploaded: 0,
    };
  }
  async componentDidMount() {
    await this.loadData();
  }
  async refreshView() {
    await this.loadData();
    this.forceUpdate();
  }
  async loadData() {
    const { workinfo, kpiinfo } = this.props;
    if (kpiinfo.id !== undefined) {
      let category = await getCategory();
      const KEYSTORE_REPORT = `D${workinfo.workDate}S${workinfo.shopId}R${kpiinfo.id}`;
      const localStore = await AsyncStorage.getItem(KEYSTORE_REPORT);
      if (localStore == undefined || localStore == null) {
        //chua co trong store
        const cometitorList = await GetCometitorTracking();
        await this.setState({
          Categories: category,
          CompetitorResult: cometitorList,
          KeyReport: KEYSTORE_REPORT,
        });
      } else {
        // in localscore
        const localData = JSON.parse(localStore);
        const listLock = localData?.filter(f => f?.isAdd === 1);
        await this.setState({
          Categories: category,
          CompetitorResult: localData,
          KeyReport: KEYSTORE_REPORT,
          uploaded: listLock?.length > 0 ? 0 : 1,
        });
      }
    }
    // console.log(cometitorList, "CompetitorRes")
  }
  onTextChange = (key, e, item) => {
    var addList = [...this.state.CompetitorResult];
    var index = addList.findIndex(
      f => f.categoryId === item.categoryId && f.id === item.id && f.isAdd == 1,
    );
    var edit = { ...item };
    if (key === 'model') edit[key] = e;
    else {
      var quantity = parseInt(e);
      edit[key] = quantity;
    }
    addList[index] = edit;
    addList = addList.sort((a, b) => a.id - b.id);
    this.setState({ CompetitorResult: addList });
  };
  onAddModel = item => {
    // console.log(item)
    if (item.categoryId === 300 && item.gaming == undefined) {
      ToastError('Bạn chưa chọn dòng laptop');
      return;
    }
    if (item.model === undefined || item.model.length < 4) {
      ToastError('Vui lòng nhập đầy đủ tên sản phẩm');
      return;
    }
    if (item.quantity == undefined) {
      ToastError('Vui lòng nhập số lượng');
      return;
    } else if (item.quantity !== undefined && isNotInteger(item.quantity)) {
      ToastError('Số lượng không hợp lệ');
      return;
    }
    //Save
    var editsList = [...this.state.CompetitorResult];
    const index = editsList.findIndex(
      e => e.model == item.model && e.isAdd === 0,
    );
    if (index > -1) {
      ToastError(
        'Mã sản phẩm này bạn đã thêm vào trước đó, vui lòng kiểm tra lại',
      );
      return;
    }
    // Reset row input
    const indexDf = editsList.findIndex(
      e => e.model == item.model && e.isAdd === 1,
    );
    editsList[indexDf] = { ...editsList[indexDf], model: '' };
    //
    var rowAdd = { ...item, isAdd: 0 };
    editsList.push(rowAdd);
    this.setState({ CompetitorResult: editsList });
    AsyncStorage.setItem(this.state.KeyReport, JSON.stringify(editsList));
  };
  onPostData = async () => {
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    const { workinfo, kpiinfo } = this.props;
    const { CompetitorResult, KeyReport } = this.state;
    const data = await CompetitorResult.filter(
      c => c.model !== undefined && c.isAdd === 0 && c.quantity > 0,
    );
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () =>
        UploadController.uploadServer(
          { ...workinfo, reportId: kpiinfo.id },
          data,
          result => {
            console.log(result, 'ac');
            if (result.statusId === 200) {
              SheetManager.hide('sheetSummary');
              AsyncStorage.setItem(KeyReport, JSON.stringify(data));
              this.setState({ CompetitorResult: data, uploaded: 1 });
              ToastSuccess('Đã gửi', result.messager, 'top');
            } else {
              ToastError('Lỗi gửi', result.messager, 'top');
            }
          },
          error => {
            ToastError('Lỗi kết nối', error.messager, 'top');
          },
        ),
    );
  };
  onRemoveModel = item => {
    Message('Thông báo', 'Bạn có chắc muốn xoá mục này đi không', () => {
      var delList = [...this.state.CompetitorResult];
      const index = delList.findIndex(
        a => a.model == item.model && a.isAdd == 0,
      );
      delList.splice(index, 1);
      this.setState({ CompetitorResult: delList });
      AsyncStorage.setItem(this.state.KeyReport, JSON.stringify(delList));
    });
  };
  renderRow = ({ item, index }) => {
    const { appcolor } = this.props;
    return item.isAdd === 1 ? (
      <View //key={`${item.categoryId}192${index}2khjad`}
        style={{}}
      >
        {item.isAdd === 1 && (
          <Text
            style={{
              padding: 7,
              fontWeight: '700',
              fontSize: 10,
              marginLeft: 10,
              color: appcolor.dark,
            }}
          >
            {item?.name}
          </Text>
        )}
        {item.categoryId === 300 && (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              backgroundColor: appcolor.light,
            }}
          >
            <CheckBox
              key="gaming"
              title="gaming"
              onPress={() => this.onTextChange('gaming', 1, item)}
              containerStyle={{
                backgroundColor: appcolor.light,
                flexGrow: 0.5,
              }}
              checked={
                item.gaming == undefined
                  ? null
                  : item.gaming === 1
                    ? true
                    : false
              }
            ></CheckBox>
            <CheckBox
              key="non-gaming"
              title="non-gaming"
              onPress={() => this.onTextChange('gaming', 0, item)}
              containerStyle={{
                backgroundColor: appcolor.light,
                flexGrow: 0.5,
              }}
              checked={
                item.gaming == undefined
                  ? null
                  : item.gaming === 1
                    ? false
                    : true
              }
            ></CheckBox>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            backgroundColor: appcolor.light,
            padding: 3,
          }}
        >
          <TextInput
            keyboardType={'ascii-capable'}
            autoCorrect={false}
            selectTextOnFocus={true}
            value={item?.model || ''}
            onChangeText={e => this.onTextChange('model', e, item)}
            style={{
              fontSize: 12,
              width: '60%',
              padding: 3,
              color: appcolor.dark,
              borderWidth: 0.2,
              borderColor: appcolor.grey,
            }}
            placeholderTextColor={appcolor.grey}
            placeholder="Tên model"
          />
          <TextInput
            selectTextOnFocus={true}
            keyboardType={'number-pad'}
            onChangeText={e => this.onTextChange('quantity', e, item)}
            style={{
              fontSize: 12,
              color: 'black',
              textAlign: 'center',
              borderWidth: 0.2,
              borderColor: appcolor.grey,
              width: 90,
            }}
            placeholder="số lượng"
            placeholderTextColor={appcolor.grey}
          />
          <TouchableOpacity
            onPress={() => this.onAddModel(item)}
            style={{ alignSelf: 'flex-end' }}
          >
            <SpiralIcon
              name={item.isAdd === 1 ? 'add' : 'close'}
              size={14}
              raised
              color={item.isAdd === 1 ? appcolor.primary : appcolor.danger}
            />
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <View //key={`${item.categoryId}koq${index}`}
        style={{ flex: 1, marginTop: 3 }}
      >
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            backgroundColor: item.isAdd == 1 ? appcolor.light : appcolor.light,
            padding: 3,
          }}
        >
          <Text
            style={{
              padding: 7,
              width: '60%',
              color: appcolor.dark,
              fontSize: 12,
              textAlignVertical: 'center',
              fontWeight: 'bold',
            }}
          >
            {item.model}{' '}
            {item.gaming == undefined
              ? ''
              : item.gaming == 1
                ? 'gaming'
                : 'non-gaming'}
          </Text>
          <Text
            style={{
              padding: 7,
              width: 90,
              textAlign: 'center',
              fontWeight: 'bold',
              color: appcolor.dark,
              fontSize: 12,
              textAlignVertical: 'center',
            }}
          >
            {item.quantity}
          </Text>
          {this.state.uploaded === 0 && (
            <TouchableOpacity
              onPress={() => this.onRemoveModel(item)}
              style={{ alignSelf: 'flex-end' }}
            >
              <SpiralIcon
                name={item.isAdd === 1 ? 'add' : 'close'}
                size={14}
                raised
                color={item.isAdd === 1 ? appcolor.primary : appcolor.danger}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  showSummary = () => {
    const { Categories, CompetitorResult } = this.state;
    var total = 0;
    var _sumlist = [];
    Categories?.map(c => {
      var _temp = CompetitorResult.filter(
        r => r.isAdd === 0 && r.categoryId == c.id && r.quantity > 0,
      );
      totalq = 0;
      _temp?.forEach(s => {
        totalq += s.quantity;
        total += s.quantity; //total
      });
      _sumlist.push({ category: c.name, quantity: totalq });
    });
    _sumlist.push({ category: 'Tổng đã nhập', quantity: total });
    this.setState({ summdata: _sumlist, total: total });
    SheetManager.show('sheetSummary');
  };
  rowSummary = ({ item, index }) => {
    const { appcolor } = this.props;
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: appcolor.light,
            padding: 7,
          }}
        >
          <Text style={{ flexGrow: 1, color: appcolor.dark }}>
            {item.category}
          </Text>
          <Text
            style={{ textAlign: 'center', width: 100, color: appcolor.dark }}
          >
            {item.quantity || 0}
          </Text>
        </View>
      </View>
    );
  };
  render() {
    const {
      Categories,
      CompetitorResult,
      showProgress,
      summdata,
      total,
      uploaded,
    } = this.state;
    const { appcolor, kpiinfo } = this.props;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.surface }}>
        <HeaderCustom
          leftFunc={() => this.props.navigation.goBack()}
          type="font-awesome"
          title={kpiinfo?.menuNameVN || 'Báo cáo đối thủ'}
          iconRight={uploaded == 0 ? 'cloud-upload-alt' : 'chart-line'}
          rightFunc={this.showSummary}
        />
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
          <Tabs.Container
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                labelStyle={{
                  fontSize: 15,
                  color: appcolor.light,
                  fontWeight: '600',
                }}
                indicatorStyle={{ backgroundColor: appcolor.white }}
                inactiveColor={appcolor.white}
                activeColor={appcolor.white}
                tabStyle={{
                  minWidth: minWidthTab(Categories || []),
                  height: 42,
                }}
                scrollEnabled={true}
                style={{ backgroundColor: appcolor.primary }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.surface, flex: 1 }}
          >
            {Categories?.map((cateinfo, idx) => {
              const dataByCate = CompetitorResult.filter(
                a => a?.categoryId === cateinfo.id,
              ).sort((a, b) => a.id - b.id);
              return (
                <Tabs.Tab
                  key={`mens${idx}`}
                  label={cateinfo.name}
                  name={cateinfo.name}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: appcolor.surface,
                      marginTop: 40,
                      padding: 6,
                      width: deviceWidth,
                    }}
                  >
                    <VirtualizedList
                      data={dataByCate}
                      key={`34k${cateinfo.id}19`}
                      showsVerticalScrollIndicator={false}
                      keyExtractor={(_, index) => {
                        `${cateinfo.id}sf${index}2als`;
                      }}
                      getItemCount={() => dataByCate.length}
                      getItem={(_data, index) => _data[index]}
                      renderItem={this.renderRow}
                    />
                  </View>
                </Tabs.Tab>
              );
            })}
          </Tabs.Container>
        </View>
        {showProgress === true && (
          <Progress.Circle
            thickness={1}
            size={65}
            indeterminate={true}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              marginTop: deviceHeight * 0.4,
            }}
          />
        )}
        <ActionSheet
          containerStyle={{ backgroundColor: appcolor.light }}
          id="sheetSummary"
        >
          <Text
            style={{
              fontSize: 16,
              color: appcolor.primary,
              padding: 7,
              textAlign: 'center',
            }}
          >
            Kết quả
          </Text>
          <View style={{ backgroundColor: appcolor.surface, padding: 7 }}>
            <FlatList
              data={summdata}
              keyExtractor={(e, idx) => idx.toString()}
              renderItem={this.rowSummary}
            />
            {uploaded === 0 && total > 0 && (
              <TouchableOpacity
                onPress={this.onPostData}
                style={{
                  width: '100%',
                  padding: 7,
                  backgroundColor: appcolor.primary,
                  marginBottom: 20,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color: appcolor.white,
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                >
                  Gửi báo cáo lên hệ thống
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ActionSheet>
      </SafeAreaView>
    );
  }
}
function mapStateToProps(state) {
  return {
    workinfo: state.GAppState.workinfo,
    kpiinfo: state.GAppState.kpiinfo,
    appcolor: state.GAppState.appcolor,
    shopinfo: state.GAppState.shopinfo,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TrackingCompetitorReport);
