import React, { PureComponent } from 'react';
import {
  ScrollView,
  View,
  Text,
  SectionList,
  TextInput,
  Dimensions,
  Picker,
  Platform,
  RefreshControl,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ButtonGroup, CheckBox, Card } from '@rneui/themed';
import {
  GetCTSSHistory,
  insertDisplayResult,
} from '../Controller/WorkController';
import * as Progress from 'react-native-progress';
import {
  ConvertDateFromInt,
  checkNetwork,
  alertToast,
  deviceWidth,
} from '../Core/Utility';
import {
  DEFAULT_COLOR,
  URL_GET_CTSS_HISTORY,
  URL_GET_REQUEST_ITEMS,
  URL_POST_SURVEY_UPLOAD,
} from '../Core/URLs';
import {
  UploadData,
  fetchGet,
  Message,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../Core/Helper';
// //import NumberFormat from "react-number-format";
import moment from 'moment';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
//import { AppCreateAction } from '../Core/ReduxController';
import { HeaderCustom } from '../Content/HeaderCustom';
//import DatePicker from 'react-native-date-picker';
const styles = StyleSheet.create({
  textbox: {
    fontSize: 15,
    paddingLeft: 15,
    paddingRight: 15,
    color: 'black',
    minHeight: 30,
    maxHeight: 30,
    textAlign: 'left',
    borderWidth: 0,
  },
  number: {
    padding: 10,
    color: 'black',
    minHeight: 37,
    borderWidth: 0.6,
    textAlign: 'right',
    borderColor: 'gray',
  },
  line: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 4,
    marginTop: 4,
  },
});

const delay = ms => new Promise(res => setTimeout(res, ms));

const KETQUA = 'Kết quả';
class SurveyCTSS extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      RequestId: 0,
      selectedIndex: 0,
      selectedGroup: '',
      showProgress: false,
      AllData: [],
      lstShow: [],
      Groups: [],
      lstQuestion: [],
      LstResult: [],
      Status: 0,
      showDate: false,
      dateSelected: new Date(),
      guiId: '',
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check, loading: check });
  };
  DisplayItemMap(lstItemsProgram) {
    let MapArr = [];
    let itemMap = {};
    let items = {};
    let refName = '';

    lstItemsProgram.map((item, i) => {
      var isnew = 0;
      if (!itemMap[item.questionName]) {
        itemMap[item.questionName] = [];
        items = {};
        refName = '';
        isnew = 1;
      }

      let itemInput = {
        parent: item.questionName,
        answerId: item.id,
        answer: item.name,
        check: false,
        modelName: '',
        refCode: item.fieldSetting,
        fieldValue: item.fieldValue,
      };

      itemMap[item.questionName].push(itemInput);
      items = itemMap[item.questionName];
      refName = item.questionName;

      if (isnew == 1) {
        refName != '' && MapArr.push({ title: refName, data: items });
      }
    });

    return MapArr;
  }
  insertDefault(text, item) {
    let itemInsert = {
      workId: this.props.workinfo.workId,
      displayId: this.props.route.params.DisplayItem.id,
      itemId: item.itemId,
      quanity: text != '' ? parseInt(text) : '',
      displayRef: item.refName,
      displayComment: item.displayComment,
      upload: 0,
    };

    insertDisplayResult(itemInsert);
    this.refreshView();
  }
  async refreshView() {
    this.setState({
      noteSaved: '',
      cateSaved: '',
    });

    await this.loadData();
    this.forceUpdate();
  }
  componentDidMount() {
    this.fetchData();
    this.fetchDataHistory();
  }
  fetchData = async () => {
    this.setShowProgress(true);
    var data = await fetchGet(URL_GET_REQUEST_ITEMS);
    this.setShowProgress(false);
    this.loadData(data.resquestItem);
  };
  fetchDataHistory = async () => {
    // alert(9)
    this.setShowProgress(true);
    var dataRes = await GetCTSSHistory(
      URL_GET_CTSS_HISTORY,
      parseInt(moment(this.state.dateSelected).format('YYYYMMDD')),
      this.props.workinfo.shopId,
    );
    // alertPrint(dataRes)
    this.setState({ LstResult: dataRes });
    this.setShowProgress(false);
    this.forceUpdate();
  };

  loadData(lstMaster) {
    var RequestIdSave = 0;
    if (lstMaster.length > 0) {
      let lstGroup = [];

      lstMaster.forEach(item => {
        if (lstGroup.indexOf(item.groupName) === -1) {
          RequestIdSave = item.requestId;
          lstGroup.push(item.groupName);
        }
      });

      lstGroup.push(KETQUA);

      this.setState({
        RequestId: RequestIdSave,
        AllData: lstMaster,
        Groups: lstGroup,
      });

      this.loadDataShow(lstGroup[0]);
    }
  }
  refreshData = groupName => {
    this.loadDataShow(groupName);
  };
  loadDataShow = async groupName => {
    let lstItemsProgram = this.state.AllData.filter(
      item => item.groupName === groupName,
    );

    let lstQuestion = [];
    lstItemsProgram.forEach(item => {
      if (lstQuestion.indexOf(item.questionName) === -1) {
        lstQuestion.push(item.questionName);
      }
    });

    if (lstQuestion.length > 0) {
      this.setState({ lstQuestion: lstQuestion });
    }

    // alertPrint(lstItemsProgram);

    this.setState({
      lstShow: this.DisplayItemMap(lstItemsProgram),
    });

    this.setState({ guiId: UUIDGenerator() });
  };
  updateIndex = selectedIndex => {
    this.setState({
      selectedIndex: selectedIndex,
      selectedGroup: this.state.Groups[selectedIndex],
    });

    this.loadDataShow(this.state.Groups[selectedIndex]);
    this.forceUpdate();
  };

  isFinishReport() {
    //D: Decimal,T :TEXT , N: NUMBER, C: CHECKBOX, R: RADIO, L: LIST
    var count = 0;
    this.state.lstShow.map(itemA => {
      let lstCheckR = itemA.data.filter(
        itemD => itemD.check === true && itemD.refCode !== 'R',
      );
      let lstCheckC = itemA.data.filter(
        itemD => itemD.check === true && itemD.refCode !== 'C',
      );
      let lstCheckD = itemA.data.filter(
        itemD => itemD.modelName !== '' && itemD.refCode === 'D',
      );
      let lstCheckT = itemA.data.filter(
        itemD => itemD.modelName !== '' && itemD.refCode === 'T',
      );
      let lstCheckN = itemA.data.filter(
        itemD => itemD.modelName !== '' && itemD.refCode === 'N',
      );
      let lstCheckL = itemA.data.filter(
        itemD => itemD.modelName !== '' && itemD.refCode === 'L',
      );

      if (Array.isArray(lstCheckR) && lstCheckR.length > 0) {
        count += 1;
      }
      if (Array.isArray(lstCheckC) && lstCheckC.length > 0) {
        count += 1;
      }
      if (Array.isArray(lstCheckD) && lstCheckD.length > 0) {
        count += 1;
      }
      if (Array.isArray(lstCheckT) && lstCheckT.length > 0) {
        count += 1;
      }
      if (Array.isArray(lstCheckN) && lstCheckN.length > 0) {
        count += 1;
      }
      if (Array.isArray(lstCheckL) && lstCheckL.length > 0) {
        count += 1;
      }
    });

    if (count === this.state.lstQuestion.length) {
      // alertToast('Bạn đã hoàn thành khảo sát')
      return true;
    } else {
      alertToast('Bạn chưa hoàn thành khảo sát');
      return false;
    }
  }
  uploadAction = async () => {
    if (!this.isFinishReport()) {
      return;
    }

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => this.UploadSurvey(),
    );
  };
  async UploadSurvey() {
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    if (this.state.lstShow != null && this.state.lstShow.length > 0) {
      var details = [];
      this.state.lstShow.forEach(itemS => {
        itemS.data.map(itemD => {
          details.push({
            ItemId: itemD.answerId,
            RequestId: this.state.RequestId,
            guiId: this.state.guiId,
            FieldText:
              itemD.modelName !== ''
                ? itemD.modelName
                : itemD.check === true
                ? '1'
                : 'NULL',
          });
        });
      });
      var SurveyInfo = JSON.stringify({
        ShopId: this.props.workinfo.shopId,
        WorkDate: ConvertDateFromInt(
          this.props.workinfo.workDate,
          'YYYYMMDD',
          'YYYY-MM-DD',
        ),
        Details: JSON.stringify(details),
      });

      this.setShowProgress(true);
      var Results = await UploadData(URL_POST_SURVEY_UPLOAD, SurveyInfo);
      if (Results != null && Results.status == 200) {
        this.setShowProgress(false);
        this.setState({ lstShow: [] });
        ToastSuccess('Đã gửi dữ liệu');
        this.fetchData();
      } else {
        this.setShowProgress(false);
        ToastError('Chưa gửi được dữ liệu');
      }
    } else {
      ToastError('Đã gửi hết dữ liệu');
    }
  }
  SeparatorStyle = () => {
    return (
      <View
        style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }}
      />
    );
  };
  renderSectionHeader = ({ section: { title } }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 55,
        backgroundColor: '#A9A9A9',
        paddingTop: 17,
        paddingBottom: 15,
        paddingLeft: 10,
        paddingRight: 5,
      }}
    >
      <View style={{ marginLeft: 5 }}>
        <Text style={{ fontSize: 15, color: 'black' }}>{title}</Text>
      </View>
    </View>
  );
  isCheckSurvey = (e, item) => {
    this.setState({
      lstShow: this.state.lstShow.map(itemS =>
        itemS.title === item.parent
          ? {
              ...itemS,
              data: itemS.data.map(itemD =>
                itemD.refCode === 'R'
                  ? itemD.answerId === item.answerId
                    ? { ...itemD, check: true }
                    : { ...itemD, check: false }
                  : itemD.answerId === item.answerId
                  ? { ...itemD, check: itemD.check === false ? true : false }
                  : itemD,
              ),
            }
          : itemS,
      ),
    });
  };
  enterModel = (item, textVal) => {
    this.setState({
      lstShow: this.state.lstShow.map(itemS =>
        itemS.title === item.parent
          ? {
              ...itemS,
              data: itemS.data.map(itemD =>
                itemD.answerId === item.answerId
                  ? { ...itemD, modelName: textVal }
                  : itemD,
              ),
            }
          : itemS,
      ),
    });
  };
  fetchListForPicker(itemP) {
    return <Picker.Item label={itemP.name} value={itemP.id} />;
  }
  rowTypeEnter = item => {
    let lstPick = [{ id: '0', name: '-- Chọn --' }];
    let lstPickTem = JSON.parse(item.fieldValue);
    if (Array.isArray(lstPickTem) && lstPickTem?.length > 0) {
      lstPickTem?.map(itemPT => lstPick.push(itemPT));
    }
    const { appcolor } = this.props;
    switch (item.refCode) {
      case 'R':
        return (
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ width: '90%', alignSelf: 'center' }}>
              {<Text style={{ color: appcolor.dark }}>{item.answer}</Text>}
            </View>
            <View style={{ width: '10%', alignSelf: 'center' }}>
              <CheckBox
                center
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                iconType="font-awesome"
                checked={item.check}
                onPress={e => this.isCheckSurvey(e, item)}
              />
            </View>
          </View>
        );
      case 'T':
        return (
          <View style={{ width: '100%', alignSelf: 'center' }}>
            <TextInput
              onChangeText={text => this.enterModel(item, text)}
              value={item.model}
              style={{ ...styles.textbox, width: '100%' }}
              placeholder="Nhập model"
            />
          </View>
        );
      case 'N':
        return (
          <View style={{ width: '100%', alignSelf: 'center' }}>
            <NumberFormat
              value={Quantity}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (
                <TextInput
                  keyboardType="numeric"
                  style={styles.number}
                  onChangeText={text => enterModel(item, text)}
                  placeholder=""
                ></TextInput>
              )}
            />
          </View>
        );
      case 'C':
        return (
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ width: '90%', alignSelf: 'center' }}>
              {<Text>{item.answer}</Text>}
            </View>
            <View style={{ width: '10%', alignSelf: 'center' }}>
              <CheckBox
                center
                iconType="font-awesome"
                checked={item.check}
                onPress={e => this.isCheckSurvey(e, item)}
              />
            </View>
          </View>
        );
      case 'L':
        return (
          <View
            style={{
              width: '100%',
              height: 60,
              borderWidth: 0.8,
              borderColor: 'black',
              marginTop: 10,
            }}
          >
            {lstPick.length > 0 && (
              <Picker
                selectedValue={item.modelName}
                style={{ ...styles.textbox, height: 50, width: '100%' }}
                onValueChange={(itemValue, itemIndex) =>
                  this.enterModel(item, itemValue)
                }
              >
                {lstPick.map(itemP => this.fetchListForPicker(itemP))}
              </Picker>
            )}
          </View>
        );
      default:
        return <View />;
    }
  };
  renderRow = ({ item }) => (
    <View>
      <View
        style={{
          height: 70,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 35,
          paddingRight: 15,
        }}
      >
        {this.rowTypeEnter(item)}
      </View>
    </View>
  );
  renderRowRes = ({ item }) => (
    <Card style={{ height: 160, width: '100%' }}>
      <Card.Title
        style={{ fontSize: 13, fontWeight: '700', textAlign: 'left' }}
      >
        {item.groupName}
      </Card.Title>
      <Card.Title
        style={{ fontSize: 11, fontWeight: '400', textAlign: 'left' }}
      >
        {item.groupId === 1
          ? 'Model: ' + item.model
          : 'Model thay thế: ' + item.model}
      </Card.Title>
      <Card.Title
        style={{ fontSize: 11, fontWeight: '200', textAlign: 'left' }}
      >
        {item.createDate}
      </Card.Title>
      <Card.Title style={{ fontSize: 11, textAlign: 'left' }}>
        {item.detail}
      </Card.Title>
    </Card>
  );
  showDatepicker = () => {
    this.setState({ showDate: this.state.showDate === true ? false : true });
  };
  onChange = async (event, dateSelect) => {
    const currentDate = dateSelect || date;
    this.setState({ dateSelected: currentDate });
    // this.showDatepicker()
    await delay(500);
    this.fetchDataHistory();
  };
  render() {
    const lstShowAll = this.state.lstShow;
    const { appcolor, kpiinfo } = this.props;
    return (
      <SafeAreaView style={{ height: '100%', width: '100%' }}>
        <HeaderCustom
          title={kpiinfo?.menuName || 'Report HORIZONS'}
          leftFunc={() => this.props.navigation.goBack()}
          iconRight="cloud-upload-alt"
          rightFunc={() => this.uploadAction()}
        />
        {this.state.Groups.length > 0 && (
          <View style={{ backgroundColor: appcolor.light }}>
            <ButtonGroup
              onPress={this.updateIndex}
              containerStyle={{ marginBottom: 8, flex: 0 }}
              textStyle={{ fontSize: 11, color: appcolor.dark }}
              selectedIndex={this.state.selectedIndex}
              buttons={this.state.Groups}
            />
          </View>
        )}
        <View
          style={{
            backgroundColor: appcolor.light,
            width: '100%',
            height: Dimensions.get('window').height - 60,
          }}
        >
          {
            <View
              style={{
                position: 'absolute',
                marginTop: 0,
                width: '100%',
                height: '85%',
                zIndex: 0,
              }}
            >
              <View
                style={{
                  zIndex: 0,
                  width: '100%',
                  position: this.state.isHiddenNote ? 'relative' : 'absolute',
                  backgroundColor: appcolor.surface,
                  height: '100%',
                }}
              >
                <SectionList
                  sections={lstShowAll}
                  ItemSeparatorComponent={this.SeparatorStyle}
                  renderItem={this.renderRow}
                  renderSectionHeader={this.renderSectionHeader}
                  keyExtractor={(item, index) => item + index}
                />
              </View>
            </View>
          }
          {/* <Text>{JSON.stringify(this.state.LstResult)}</Text> */}
          {this.state.selectedGroup === KETQUA && (
            <View>
              <TouchableOpacity onPress={this.showDatepicker}>
                <View
                  style={{
                    padding: 7,
                    margin: 7,
                    borderRadius: 10,
                    backgroundColor: appcolor.light,
                  }}
                >
                  <Text
                    style={{
                      zIndex: 1,
                      width: '100%',
                      textAlign: 'center',
                      color: appcolor.dark,
                    }}
                  >
                    {`Chọn ngày xem khảo sát ${moment(
                      this.state.dateSelected,
                    ).format('DD-MM-YYYY')}`}
                  </Text>
                </View>
              </TouchableOpacity>
              <View>
                {this.state.showDate && (
                  <DatePicker
                    maximumDate={new Date()}
                    style={{ width: deviceWidth }}
                    textColor={appcolor.dark}
                    mode="date"
                    date={this.state.dateSelected}
                    onDateChange={(e, date) => {
                      this.onChange(e, date);
                      this.showDatepicker();
                    }}
                  />
                )}
                {
                  // this.state.LstResult.length > 0 ?
                  <ScrollView
                    contentContainerStyle={{
                      height: Dimensions.get('screen').height - 250,
                    }}
                    nestedScrollEnabled={true}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.loading}
                        color={'blue'}
                        titleColor={'red'}
                        tintColor={'red'}
                        title={'Đang tải dữ liệu...'}
                        onRefresh={() => this.fetchDataHistory()}
                      />
                    }
                    showsVerticalScrollIndicator={false}
                  >
                    <FlatList
                      contentContainerStyle={{ paddingTop: 10 }}
                      keyExtractor={(item, index) => item + index}
                      data={this.state.LstResult}
                      renderItem={this.renderRowRes}
                    />
                  </ScrollView>
                  // <View style={{height:'100%',width:'100%',alignItems:'center'}}><View style={styles.line}/><Text style={{height:'100%',width:'100%',textAlign:'center',marginTop:50}}>Không có báo cáo Khảo sát CTSS.</Text></View>
                }
              </View>
            </View>
          )}
        </View>

        {this.state.showProgress === true && (
          <Progress.Circle
            color={DEFAULT_COLOR}
            thickness={5}
            size={90}
            indeterminate={true}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          />
        )}
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
export default connect(mapStateToProps, mapDispatchToProps)(SurveyCTSS);
