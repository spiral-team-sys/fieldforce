import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Icon, Badge, Button, Divider } from '@rneui/themed';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { ToastError, ToastSuccess, UploadData } from '../../Core/Helper';
import { MarketGetList, MarketUpload } from '../../Controller/WorkController';
import { URL_POST_MARKET_UPLOAD, DEFAULT_COLOR } from '../../Core/URLs';
import { ConvertDateFromInt, checkNetwork } from '../../Core/Utility';
import Moment from 'moment';
import { getAllPhotosUploaded } from '../../Controller/WorkController';
import * as Progress from 'react-native-progress';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { SpeedDial } from '@rneui/themed';
const takePhotoCell = (workinfo, kpiinfo, navigation) => {
  let item = {
    reportId: kpiinfo.id,
    shopId: workinfo.shopId,
    photoType: kpiinfo.id,
    photoDate: workinfo.workDate,
  };
  navigation.navigate('Camera', item);
};
const showALbumCell = (workinfo, kpiinfo, navigation) => {
  let item = {
    reportId: kpiinfo.id,
    shopId: workinfo.shopId,
    photoType: kpiinfo.id,
    photoDate: workinfo.workDate,
  };
  navigation.navigate('AlbumPhoto', item);
};

const SwipeableRow = ({ item, index, appcolor }) => {
  return (
    <View
      key={`kja${index}20`}
      style={{ flex: 1, backgroundColor: appcolor.light, marginBottom: 7 }}
    >
      <TouchableOpacity
        style={{ flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 7,
          }}
        >
          <Badge
            status={item.upload == 0 ? 'error' : 'success'}
            containerStyle={{
              height: 30,
              width: 40,
              position: 'absolute',
              top: 10,
              right: 10,
            }}
            value={item.upload == 0 ? 'NO' : 'OK'}
          />
          <View style={{ padding: 7, flexGrow: 0.2 }}>
            <Text
              style={{
                fontWeight: '700',
                color: appcolor.dark,
                fontSize: 12,
                marginEnd: 7,
              }}
            >
              {'Ngành hàng: ' + item.categoryName}
            </Text>
            <Text style={{ color: appcolor.dark, fontSize: 10, marginEnd: 7 }}>
              {'Hạng mục: ' + item.optionName}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 10, marginEnd: 7 }}
              numberOfLines={2}
            >
              {'Vấn đề:' + item.surveyDisplayName}
            </Text>
            <Text
              style={{ color: appcolor.dark, fontSize: 10, marginEnd: 7 }}
              numberOfLines={4}
            >
              {'Ghi chú: ' + item.content}
            </Text>
          </View>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </TouchableOpacity>
    </View>
  );
};
class Market extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      data: [],
      open: false,
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  async selloutLoad() {
    const workinfo = this.props.workinfo;
    if (workinfo !== undefined) {
      const data = await MarketGetList(workinfo);
      await this.setState({ data: data });
    }
  }
  componentDidMount() {
    this.selloutLoad();
  }
  async Upload() {
    const { workinfo, kpiinfo } = this.props;
    let isNetwork = await checkNetwork();
    const data = await MarketUpload(workinfo);
    const photoList = await getAllPhotosUploaded(
      kpiinfo.id,
      workinfo.shopId,
      workinfo.workDate,
    );
    if (photoList.length < 2) {
      ToastError('Bạn phải chụp tối thiểu 2 tấm hình');
      return;
    }
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    if (data?.length > 0) {
      var details = [];
      data.forEach(item => {
        // alertPrint(item)
        details.push({
          categoryId: item.categoryId,
          surveyDisplayId: item.surveyDisplayId,
          guiId: item.guiId,
          content: item.content,
          status: item.status,
          trafficId: item.trafficId,
          noteTraffic: item.noteTraffic,
        });
      });
      let itemsPhoto = [];
      photoList?.forEach(photoInfo => {
        let ImgName = photoInfo.photoPath.substring(
          photoInfo.photoPath.lastIndexOf('/') + 1,
          photoInfo.photoPath.length,
        );
        let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName;
        let dataItem = {
          shopId: photoInfo.shopId,
          photoName: ImgName,
          latitude: photoInfo.latitude,
          longitude: photoInfo.longitude,
          accuracy: -1,
          reportId: photoInfo.reportId,
          photoTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          photoType: '' + parseInt(photoInfo.photoType),
          photoDate: photoInfo.photoDate,
          photoPath: pathPhoto,
          guid: photoInfo.guid,
        };
        itemsPhoto.push(dataItem);
      });

      var MarketInfo = JSON.stringify({
        ShopId: workinfo.shopId,
        WorkDate: ConvertDateFromInt(
          workinfo.workDate,
          'YYYYMMDD',
          'YYYY-MM-DD',
        ),
        Details: JSON.stringify(details),
        Photos: JSON.stringify(itemsPhoto),
      });
      await this.setShowProgress(true);
      var Results = await UploadData(URL_POST_MARKET_UPLOAD, MarketInfo);
      if (Results != null && Results.status == 200) {
        await this.setShowProgress(false);
        await ToastSuccess('Đã gửi dữ liệu');
        const sql = `Update market set upload=1 WHERE WorkId=${workinfo.workId}`;
        await QueryStringSql(sql);
        await this.selloutLoad();
        await uploadAllDataPhoto(resPhotos);
      } else {
        // console.log(Results, "Results")
        await this.setShowProgress(false);
        ToastError('Chưa gửi được dữ liệu');
      }
    }
  }

  render() {
    const { appcolor, workinfo, kpiinfo, navigation } = this.props;
    return (
      <SafeAreaView
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: appcolor.surface,
        }}
      >
        <HeaderCustom
          leftFunc={() => this.props.navigation.goBack()}
          title="Báo cáo thị trường"
          iconRight={'cloud-upload-alt'}
          rightFunc={() => this.Upload()}
        />
        <View style={{ flex: 1, margin: 7 }}>
          <FlatList
            data={this.state.data}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  borderColor: appcolor.surface,
                  borderWidth: 1,
                  width: '100%',
                }}
              />
            )}
            renderItem={({ item, index }) => (
              <SwipeableRow item={item} index={index} appcolor={appcolor} />
            )}
            keyExtractor={(item, index) => `message ${index}`}
          />
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
        </View>
        <SpeedDial
          isOpen={this.state.open}
          icon={{ name: 'add', color: appcolor.light }}
          openIcon={{ name: 'close', color: appcolor.light }}
          containerStyle={{
            color: appcolor.dark,
            backgroundColor: appcolor.dark,
          }}
          onOpen={() => this.setState({ open: true })}
          onClose={() => this.setState({ open: false })}
        >
          <SpeedDial.Action
            icon={{ name: 'add', color: appcolor.white }}
            iconContainerStyle={{ backgroundColor: appcolor.danger }}
            title="Thêm"
            onPress={() => this.props.navigation.navigate('marketcreate')}
          />
          {this.state.data?.length > 0 && (
            <SpeedDial.Action
              iconContainerStyle={{ backgroundColor: appcolor.primary }}
              icon={{ name: 'camera', color: appcolor.white }}
              title="Chụp hình"
              onPress={() => takePhotoCell(workinfo, kpiinfo, navigation)}
            />
          )}
          {this.state.data?.length > 0 && (
            <SpeedDial.Action
              iconContainerStyle={{ backgroundColor: appcolor.success }}
              icon={{ name: 'photo', color: appcolor.white }}
              title="Hình đã chụp"
              onPress={() => showALbumCell(workinfo, kpiinfo, navigation)}
            />
          )}
        </SpeedDial>
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
export default connect(mapStateToProps, mapDispatchToProps)(Market);
