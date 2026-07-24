import React, { PureComponent, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import PageHeader from '../Content/PageHeader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  getStatusCompetitorResult,
  getUploadDisplayCompetitorResult,
  updateStatusCompetitorResult,
  uploadDisplayCompetitor,
  insertCompetitorResult,
} from '../Controller/WorkController';
import { checkNetwork } from '../Core/Utility';
import * as Progress from 'react-native-progress';
import { Message } from '../Core/Helper';
import { getLstCompetitors } from '../Controller/CompetitorController';
import Moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
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
  labelSellout: {
    padding: 3,
    color: 'black',
    fontWeight: '600',
    fontSize: 17,
  },
});

//import { AppCreateAction } from '../Core/ReduxController';

class CompetitorReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      workinfo: {},
      Categories: [],
      Division: [],
      CompetitorResult: [],
      lstShow: [],
      seletedCategory: null,
      LblCompetitor: 'Ngành hàng',
      Status: 0,
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  async componentDidMount() {
    await this.loadData();
  }
  async refreshView() {
    await this.loadData();
  }
  async CompetitorAutoMap(lstDivision, CompetitorRes) {
    let MapArray = [];
    let CompeMap = {};
    lstDivision.forEach(item => {
      if (!CompeMap[item.name]) {
        CompeMap[item.name] = [];
        let itemRes = !Array.isArray(CompetitorRes)
          ? []
          : CompetitorRes.filter(itemRe => itemRe.divisionId === item.id);
        let itemPush = {
          ...item,
          workId: this.state.workinfo.workId,
          workDate: this.state.workinfo.workDate,
          divisionId: item.id,
          division: item.name,
          upload: 0,
        };
        if (itemRes.length > 0) {
          itemRes.map(itemR => {
            itemPush = {
              ...itemPush,
              quantity: itemR.quantity == 'undefined' ? '' : itemR.quantity,
              upload: 0,
            };
          });
        }

        MapArray.push(itemPush);
      }
    });

    return MapArray;
  }
  async loadData() {
    // alert(8)
    const workinfo = this.props.route.params.workinfo;
    // alertPrint(workinfo)
    let CompetitorRes = await getStatusCompetitorResult(workinfo);
    let status = CompetitorRes.length > 0 ? CompetitorRes[0].upload : 0;
    let division = await getLstCompetitors();
    this.setState({
      workinfo: workinfo,
      Status: status,
      Division: division,
      CompetitorResult: CompetitorRes,
      lstShow: await this.CompetitorAutoMap(division, CompetitorRes),
    });
  }

  changeValue = (text, item) => {
    this.insertDefault(item, text);
  };
  async uploadAction() {
    let competitorRes = await getUploadDisplayCompetitorResult(
      this.state.workinfo,
    );
    if (competitorRes.length == 0) {
      alert('Bạn chưa làm báo cáo.');
      return;
    }

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => this.UploadAction(competitorRes),
    );
  }
  UploadAction = async competitorRes => {
    if (this.state.Status === 1) {
      MessageInfo('Bạn đã gửi báo cáo.');
      return;
    }

    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    this.setShowProgress(true);
    let res = uploadDisplayCompetitor(competitorRes, this.state.workinfo);
    if (res) {
      this.setShowProgress(false);
      await updateStatusCompetitorResult(this.state.workinfo);
      this.refreshView();
    } else {
      this.setShowProgress(false);
      alert('Gửi báo cáo không thành công.');
    }
  };
  render() {
    const lstShowAll = this.state.lstShow;
    const WordInfo = this.props.route.params.workinfo;

    return (
      <View style={{ height: '100%', width: '100%' }}>
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          type="font-awesome"
          Title={this.props.route.params.titlePage}
          righticon="cloud-upload-alt"
          rightcolor={this.props.appcolor.white}
          rightclick={
            this.state.Status === 1
              ? () => {
                  alert('Báo cáo này đã hoàn thành.');
                }
              : () => this.uploadAction()
          }
        ></PageHeader>
        <ScrollView
          style={{ height: '68%', zIndex: 0, backgroundColor: 'white' }}
        >
          <KeyboardAwareScrollView
            enableAutomaticScroll={true}
            resetScrollToCoords={{ x: 0, y: 0 }}
            scrollEnabled={true}
          >
            <View>
              <FlatList
                ItemSeparatorComponent={() => <View style={styles.line} />}
                keyExtractor={this.keyExtractor}
                data={lstShowAll}
                renderItem={({ item }) => (
                  <RenderRow
                    item={item}
                    reload={() => this.refreshView()}
                    WordInfo={WordInfo}
                    Status={this.state.Status}
                  ></RenderRow>
                )}
                numColumns={1}
              />
            </View>
          </KeyboardAwareScrollView>
          <View
            style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }}
          />
        </ScrollView>
        {this.state.showProgress === true && (
          <Progress.Circle
            thickness={1}
            size={65}
            indeterminate={true}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          />
        )}
      </View>
    );
  }
}
const InsertDefault = (item, text, reload, workinfo) => {
  let itemInsert = {
    workId: workinfo.workId,
    workDate: workinfo.workDate,
    divisionId: item.divisionId,
    division: item.division,
    quantity: text !== '' ? parseInt(text) : null,
    upload: 0,
  };

  insertCompetitorResult(itemInsert);
  reload();
};
const RenderRow = ({ item, WordInfo, reload, Status }) => {
  const [quantity, setQuantity] = useState(
    item.quantity !== 'undefined' &&
      item.quantity !== null &&
      item.quantity !== undefined
      ? item.quantity + ''
      : '',
  );
  return (
    <View
      style={{
        height: 70,
        width: '100%',
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
      }}
    >
      <Text style={styles.labelSellout}>{item.name}</Text>
      <View style={{ width: '40%', alignSelf: 'center' }}>
        <TextInput
          keyboardType={'number-pad'}
          editable={Status === 0 ? true : false}
          onChangeText={text => {
            InsertDefault(item, text, reload, WordInfo);
          }}
          defaultValue={quantity !== 'null' ? quantity : ''}
          style={{
            fontSize: 15,
            color: 'black',
            minHeight: 37,
            textAlign: 'center',
            borderWidth: 0.6,
            borderColor: 'gray',
            width: '98%',
            backgroundColor: Status === 0 ? 'white' : 'lightgray',
          }}
          placeholder="Nhập số lượng"
        />
      </View>
    </View>
  );
};
function mapStateToProps(state) {
  return {
    appcolor: state.GAppState.appcolor,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(CompetitorReport);
