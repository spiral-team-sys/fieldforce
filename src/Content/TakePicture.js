import React, { Component } from 'react';
import { RNCamera } from 'react-native-camera';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Platform,
  Linking,
  BackHandler,
  DeviceEventEmitter,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import Moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import { alertToast } from '../Core/Utility';
import {
  APPNAME,
  EMPLOYEE_TYPE_PHOTO,
  GO_OVERVIEW,
  SYNC_DATA_ATT,
} from '../Core/URLs';
import {
  check,
  RESULTS,
  PERMISSIONS,
  request,
  openSettings,
} from 'react-native-permissions';
import {
  GetEmployeeInfo,
  MessageAction,
  MessageAction2,
  MessageInfo,
  MessageSetting,
  OnTime,
  requestTimeout,
} from '../Core/Helper';
const delay = ms => new Promise(res => setTimeout(res, ms));
const landmarkSize = 2;
import * as Progress from 'react-native-progress';
import DeviceInfo from 'react-native-device-info';
import BarcodeMask from 'react-native-barcode-mask';
import { getDistance } from 'geolib';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { HeaderCustom } from './HeaderCustom';
import { CountTimeAutoTake } from '../Control/CountTimeAutoTake';
import RNFS from 'react-native-fs';

class TakePicture extends Component {
  timeoutID = null;
  constructor(props) {
    super(props);
    this.state = {
      isPermissCamera: false,
      isFullCamera: false,
      isPermissLocation: false,
      goBackData: this.props.navigation.goBackData,
      photoInfo: this.props.route.params,
      photo: '',
      type:
        this.props.route.params.reportId === 1 ||
        this.props.route.params.photoType === EMPLOYEE_TYPE_PHOTO
          ? RNCamera.Constants.Type.front
          : RNCamera.Constants.Type.back,
      flash: RNCamera.Constants.FlashMode.off,
      flashcolor: 'orange',
      latitudePo: 0,
      longitudePo: 0,
      accuracyPo: 0,
      canDetectFaces: false,
      canDetectText: false,
      faces: [],
      textBlocks: [],
      barcodes: [],
      progress: 0,
      countNumber: 0,
      statusFace: '',
      isEnabled: false,
      DoneTakePhoto: false,
      offAutoTake: true,
      timestamp: 0,
      mocked: false,
      isMoveView: false,
      isTimeoutLocation: false,
      statusDistance: null,
      distanceLimit: 0,
      countGetLoction: 0,
      messageLocationMatch: '',
      timeAutoTake: 0,
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  requestLocation() {
    // alert(0)
    try {
      request(
        Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        }),
      ).then(res => {
        //   alertPrint(res)
        if (res == RESULTS.GRANTED) {
          this.setState({ isPermissLocation: true });
        } else {
          this.setState({ isPermissLocation: false });
        }
      });
    } catch (error) {
      // //console.log("location set error:", error);
    }
  }
  checkLocation() {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    )
      .then(async result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            MessageSetting(
              'Thông báo',
              Platform.OS === 'ios'
                ? 'Vui lòng bật Dịch vụ định vị, Quyền riêng tư -> Dịch vụ định vị -> Dịch vụ định vị (Bật)'
                : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị',
              () => {
                Platform.OS === 'ios'
                  ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                  : openSettings().catch(() =>
                      console.warn('cannot open settings'),
                    );
              },
            );
            break;
          case RESULTS.DENIED:
            this.requestLocation();
            break;
          case RESULTS.GRANTED:
            this.setState({ isPermissLocation: true });
            requestTimeout(10000, this.getLocationUserFast(), async er => {
              await this.setState({
                isTimeoutLocation:
                  this.state.latitudePo !== 0 || this.state.longitudePo !== 0
                    ? false
                    : true,
              });
            });

            break;
          case RESULTS.BLOCKED:
            MessageSetting(
              'Thông báo',
              Platform.OS === 'ios'
                ? 'Vui lòng cho phép App sử dụng Dịch vụ định vị, Quyền riêng tư -> Dịch vụ định vị -> tìm đến App ' +
                    APPNAME +
                    ' -> tích chọn khi dùng Ứng dụng & chính xác cao'
                : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị',
              () => {
                Platform.OS === 'ios'
                  ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                  : openSettings().catch(() =>
                      console.warn('cannot open settings'),
                    );
              },
            );
            break;
        }
      })
      .catch(error => {
        // alert(error+'')
      });
  }
  getLocationUserFast(again) {
    Geolocation.getCurrentPosition(
      async info => {
        const latitude = info.coords.latitude;
        const longitude = info.coords.longitude;
        const accuracy = info.coords.accuracy;
        const mocked = info.mocked;
        const timestamp = info.timestamp;

        this.setState({
          latitudePo: latitude,
          longitudePo: longitude,
          accuracyPo: accuracy,
          timestamp: timestamp,
          mocked: mocked,
          isTimeoutLocation: false,
        });

        latitude !== 0 &&
          longitude !== 0 &&
          this.checkDistanceVsShop(latitude, longitude);
        if (mocked) {
          MessageInfo(
            'Chú ý, Bạn đang sử dụng phần mềm tìm cách thay đổi vị trí của bạn, điều này là không được phép trong việc chấm công.',
          );
          this.props.navigation.goBack();
          return;
        }
        again !== undefined &&
          this.setState({ countGetLoction: this.state.countGetLoction + 1 });
      },
      error => alertToast(error.message),
      // { timeout: 15000, distanceFilter:0.5 },
    );
  }
  getLocationLast() {
    Geolocation.getCurrentPosition(
      info => {
        const latitude = info.coords.latitude;
        const longitude = info.coords.longitude;
        const accuracy = info.coords.accuracy;
        const mocked = info.mocked;
        const timestamp = info.timestamp;
        this.setState({
          messageLocationMatch: '',
          countGetLoction: 0,
          latitudePo: latitude,
          longitudePo: longitude,
          accuracyPo: accuracy,
          timestamp: timestamp,
          mocked: mocked,
          isTimeoutLocation: false,
        });
      },
      error => alertToast(error.message),
    );
  }
  requestCamera() {
    try {
      request(
        Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        }),
      ).then(res => {
        if (res !== RESULTS.GRANTED) {
          MessageSetting(
            'Thông báo',
            Platform.OS === 'ios'
              ? 'Vui lòng cho phép App sử dụng camera, Quyền riêng tư -> camera -> tìm đến App ' +
                  APPNAME +
                  ' -> cho phép (Bật).'
              : 'Vui lòng cho phép sử dụng chụp hình trong phần cài đặt của thiết bị',
            () => {
              Platform.OS === 'ios'
                ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                : openSettings().catch(() =>
                    console.warn('cannot open settings'),
                  );
            },
          );
        }
      });
    } catch (error) {
      // //console.log("location set error:", error);
    }
  }
  checkCamera() {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(async result => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          await MessageSetting(
            'Thông báo',
            Platform.OS === 'ios'
              ? 'Vui lòng bật Dịch vụ định vị, Quyền riêng tư -> camera -> tìm đến App ' +
                  APPNAME +
                  ' -> cho phép (Bật).'
              : 'Vui lòng cho phép chức năng chụp hình trong phần cài đặt của thiết bị',
            () => {
              Platform.OS === 'ios'
                ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                : openSettings().catch(() =>
                    console.warn('cannot open settings'),
                  );
            },
          );
          break;
        case RESULTS.DENIED:
          await this.requestCamera();
          break;
        case RESULTS.GRANTED:
          await this.setState({ isPermissCamera: true });
          break;
        case RESULTS.BLOCKED:
          MessageSetting(
            'Thông báo',
            Platform.OS === 'ios'
              ? 'Vui lòng cho phép App sử dụng camera, Quyền riêng tư -> camera -> tìm đến App ' +
                  APPNAME +
                  ' -> cho phép (Bật).'
              : 'Vui lòng cho phép sử dụng chụp hình trong phần cài đặt của thiết bị',
            () => {
              Platform.OS === 'ios'
                ? Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
                : openSettings().catch(() =>
                    console.warn('cannot open settings'),
                  );
            },
          );
          break;
      }
    });
  }
  checkCam = async () => {
    let resultCam = await DeviceInfo.isCameraPresentSync();
    return resultCam;
  };
  checkDistanceVsShop = async (latitudePo, longitudePo) => {
    if (
      this.state.photoInfo.shopLat != null &&
      this.state.photoInfo.shopLong != null &&
      this.state.distanceLimit > 0
    ) {
      let distance = await this.calculatorDistance(latitudePo, longitudePo);

      if (
        this.state.statusDistance === 1 &&
        distance > this.state.distanceLimit
      ) {
        await this.setState({
          messageLocationMatch:
            'Vị trí bạn đang Checkin/Checkout cách vị trí cửa hàng lớn hơn ' +
            this.state.distanceLimit +
            'm',
        });
        if (this.state.countGetLoction > 4) {
          MessageAction2(
            'Hệ thống ghi nhận vị trí bạn chấm công đang cách cửa hàng hơn ' +
              this.state.distanceLimit +
              'm, bạn muốn tiếp tục chấm công hay lấy lại vị trí ?',
            () => {
              this.getLocationLast();
            },
            () => {
              this.props.navigation.goBack();
              // DeviceEventEmitter.emit(GO_OVERVIEW, null)
              MessageAction(
                'Chọn Đi đến để tới chi tiết cửa hàng, chọn Bản đồ -> Bấm vào biểu tượng góc phải bản đồ để kiểm tra/lấy lại vị trí hiện tại',
                async () => {
                  DeviceEventEmitter.emit('GO_SHOP_MAP', null);
                  DeviceEventEmitter.emit(GO_OVERVIEW, null);
                },
                'Không',
                'Đi đến',
              );
            },
            'Lấy lại vị trí',
            'Chấm công',
          );
        } else {
          await delay(1000);
          await this.getLocationUserFast(true);
        }
      } else if (
        this.state.statusDistance === 2 &&
        distance > this.state.distanceLimit
      ) {
        this.setState({
          messageLocationMatch: 'Đang định lại vị trí, vui lòng đợi... ',
        });

        if (this.state.countGetLoction > 4) {
          this.setState({ messageLocationMatch: '' });
        } else {
          await delay(1000);
          this.getLocationUserFast(true);
        }
      } else if (
        this.state.statusDistance === 3 &&
        distance > this.state.distanceLimit
      ) {
        this.setState({
          messageLocationMatch: 'Đang định lại vị trí, vui lòng đợi... ',
        });

        if (this.state.countGetLoction > 4) {
          MessageAction2(
            'Hệ thống ghi nhận vị trí bạn chấm công đang cách cửa hàng hơn ' +
              this.state.distanceLimit +
              'm, bạn muốn lấy lại vị trí ?',
            () => {
              this.getLocationLast();
              this.props.navigation.goBack();
              MessageAction(
                'Chọn Đi đến để tới chi tiết cửa hàng, chọn Bản đồ -> Bấm vào biểu tượng góc phải bản đồ để kiểm tra/lấy lại vị trí hiện tại',
                async () => {
                  DeviceEventEmitter.emit('GO_SHOP_MAP', null);
                  DeviceEventEmitter.emit(GO_OVERVIEW, null);
                },
                'Không',
                'Đi đến',
              );
            },
            () => {
              this.props.navigation.goBack();
              // DeviceEventEmitter.emit(GO_OVERVIEW, null)
            },
            'Không',
            'Lấy lại vị trí',
          );
        } else {
          await delay(1000);
          this.getLocationUserFast(true);
        }
      }
    }
  };

  getConfigServ = () => {
    let distanceLimit = 0;
    let statusDistance = 0;
    let configInfo = this.state.photoInfo.shopinfo?.config;
    if (configInfo != undefined && configInfo != null && configInfo != 'null') {
      let jsonRes = JSON.parse(configInfo);
      distanceLimit = jsonRes.Distance;
      statusDistance = jsonRes.statusDistance;
      this.setState({
        statusDistance: statusDistance,
        distanceLimit: distanceLimit,
      });
    }
  };
  async componentDidMount() {
    // this.timeoutID = requestTimeout(300000, ()=>{} ,async (er) => {
    //   this.props.navigation.goBack()
    // })
    if (Platform.OS === 'ios') {
      await this.checkCamera();
      await this.checkLocation();
    } else {
      let resultCam = await DeviceInfo.isCameraPresent();
      if (!resultCam) {
        this.checkCam();
      }
      await this.checkLocation();
    }

    let eminfo = await GetEmployeeInfo();
    if (eminfo !== undefined) {
      let eminfoObj = eminfo;
      if (eminfoObj.typeId === 110) {
        await this.setState({ isFullCamera: true });
        await this.setState({ type: RNCamera.Constants.Type.back });
      }
    }
    DeviceEventEmitter.addListener('BACK_DATA', data => this.getBackData(data));
    await this.loadFlashMode();
    await BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    (await (this.props.route.params.QRCode === 1)) &&
      (await this.setState({
        isFullCamera: false,
        type: RNCamera.Constants.Type.back,
      }));
    this.getConfigServ();
  }
  async componentWillUnmount() {
    clearTimeout(this.timeoutID);
    DeviceEventEmitter.removeAllListeners('BACK_DATA');
  }
  flipCamera = () =>
    this.setState({
      type:
        this.state.type === RNCamera.Constants.Type.back
          ? RNCamera.Constants.Type.front
          : RNCamera.Constants.Type.back,
    });
  checkYaw(faces, isOk, isNotOk) {
    faces.map(item => {
      item.yawAngle.toFixed(0) < -12 || item.yawAngle.toFixed(0) > 12
        ? isNotOk()
        : isOk();
    });
  }
  checkEyes(faces, isOk, isNotOk) {
    faces.map(item => {
      item.rightEyeOpenProbability < 0.15 || item.leftEyeOpenProbability < 0.15
        ? isNotOk()
        : isOk();
    });
  }
  checkOutScreen(faces, isOk, isNotOk) {
    faces.map(item => {
      item.bounds.origin.y + item.bounds.size.height >
        Dimensions.get('screen').height - 100 ||
      item.bounds.origin.x + item.bounds.size.width >
        Dimensions.get('screen').width
        ? isNotOk()
        : isOk();
    });
  }
  checkOut1Screen(faces, isOk, isNotOk) {
    faces.map(item => {
      item.bounds.origin.x < 0 ? isNotOk() : isOk();
    });
  }
  checkOut2Screen(faces, isOk, isNotOk) {
    faces.map(item => {
      item.bounds.origin.y < 40 ? isNotOk() : isOk();
    });
  }
  checkFarFace(faces, isOk, isNotOk) {
    faces.map(item => {
      ((item.bounds.origin.x + item.bounds.size.width) * 100) /
        Dimensions.get('screen').width <
      60
        ? isNotOk()
        : isOk();
    });
  }
  checkNearFace(faces, isOk, isNotOk) {
    faces.map(item => {
      ((item.bounds.origin.x + item.bounds.size.width) * 100) /
        Dimensions.get('screen').width >
      82
        ? isNotOk()
        : isOk();
    });
  }
  async checkDetectFace(faces, type, pass, notpass) {
    // let note = ''
    // let isOut = false
    // if (faces.length === 0) {
    //   note = 'Vui lòng đưa máy vào chính diện khuôn mặt bạn để chụp chấm công'
    //   if (type === 1 && this.state.isEnabled === false) {
    //     MessageInfo(note)
    //   }
    //   this.setState({ statusFace: note })
    //   return
    // }
    // let faceMax = 0
    // let IDFace = 0
    // this.state.faces.map(face => {
    //   if (face.bounds.size.width > faceMax) {
    //     faceMax = face.bounds.size.width
    //     IDFace = face.faceID
    //   }
    // })
    // let faceOne = this.state.faces.filter(item => item.faceID === IDFace)
    // this.checkOutScreen(faceOne, () => { }, () => {
    //   isOut = true
    //   note = 'Khuôn mặt bên ngoài. Vui lòng chụp để khuôn mặt trong khung hình khi chấm công.'
    // })
    // this.checkOut1Screen(faceOne, () => { }, () => {
    //   isOut = true
    //   note = 'Khuôn mặt bên ngoài. Vui lòng chụp để khuôn mặt trong khung hình khi chấm công.'
    // })
    // this.checkOut2Screen(faceOne, () => { }, () => {
    //   isOut = true
    //   note = 'Khuôn mặt bên ngoài. Vui lòng chụp để khuôn mặt trong khung hình khi chấm công.'
    // })
    // if (isOut === false) {
    //   this.checkYaw(faceOne, () => { }, () => {
    //     note = 'Khuôn mặt chụp nghiêng. Vui lòng chụp chính diện khuôn mặt bạn.'
    //   })
    //   this.checkEyes(faceOne, () => { }, () => {
    //     note = 'Bạn nhắm mắt khi chụp. Vui lòng không nhắm mắt khi chụp chấm công.'
    //   })
    //   // this.checkFarFace(faceOne,()=>{},()=>{
    //   //   note = 'Bạn để khuôn mặt hơi xa . Vui lòng để máy lại gần hơn.'
    //   // })
    //   this.checkNearFace(faceOne, () => { }, () => {
    //     note = 'Bạn để khuôn mặt gần máy. Vui lòng để máy ra xa hơn.'
    //   })
    //   if (note === '') {
    //     this.setState({ statusFace: '' })
    //     pass()
    //     if (this.state.isEnabled === true && this.state.DoneTakePhoto == false) {
    //       this.setState({ DoneTakePhoto: true })
    //       await delay(1000)
    //       this.takePicture()
    //     }
    //   } else {
    //     (type === 1 && this.state.isEnabled === false) && MessageInfo(note)
    //     this.setState({ statusFace: note })
    //     notpass();
    //   }
    // }
    // else {
    //   if (type === 1) {
    //     this.setState({ DoneTakePhoto: false, statusFace: note })
    //     this.state.isEnabled === false && MessageInfo(note)
    //   }
    //   notpass();
    // }
  }
  calculatorDistance(latitudePo, longitudePo) {
    var distance = getDistance(
      { latitude: latitudePo, longitude: longitudePo },
      {
        latitude: this.state.photoInfo?.shopLat,
        longitude: this.state.photoInfo?.shopLong,
      },
    );

    return distance;
  }
  newPathImage = async photoData => {
    const name = photoData.uri.substring(
      photoData.uri.lastIndexOf('/') + 1,
      photoData.uri?.length,
    );
    const extension = Platform.OS === 'android' ? 'file://' : '';
    const path = `${extension}${
      RNFS.DocumentDirectoryPath
        ? RNFS.DocumentDirectoryPath
        : RNFS.LibraryDirectoryPath
    }/Camera/`;
    const pathFile = `${path}${name}`;
    const base64Data = photoData.base64;
    try {
      // Tạo thư mục nếu nó không tồn tại
      const dirExists = await RNFS.exists(path);
      if (!dirExists) {
        await RNFS.mkdir(path);
      }
      await RNFS.writeFile(pathFile, base64Data, 'base64');
      return pathFile;
    } catch (error) {
      console.log(error);
      return photoData.uri;
    }
  };
  takePicture = async () => {
    let datetimeGMT = new Date() + '';
    if (datetimeGMT.indexOf('GMT+0700') <= -1) {
      MessageInfo(
        'Sai múi giờ. Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy',
      );
      return;
    }
    try {
      const cameraConfig = JSON.parse(
        this.props.shopinfo?.cameraConfig || '{}',
      );
      const isAutoSave =
        this.state.photoInfo.reportId === 1 &&
        (cameraConfig?.isAutoSave || false) > true;
      const options = { quality: 0.8, base64: true };
      const photopath = await this.camera.takePictureAsync(options);
      const newUrl = await this.newPathImage(photopath);

      const photoinfo = await [
        {
          shopId: this.state.photoInfo?.shopId,
          shopCode: this.state.photoInfo?.shopCode,
          shopLat: this.state.photoInfo?.shopLat,
          shopLong: this.state.photoInfo?.shopLong,
          photoDate: parseInt(Moment(new Date()).format('YYYYMMDD')),
          photoType:
            this.state.photoInfo?.photoType !== undefined
              ? '' + this.state.photoInfo?.photoType
              : '',
          photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
          photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
          photoPath: newUrl,
          reportId: this.state.photoInfo?.reportId,
          guid: this.state.photoInfo?.guiId,
          latitude: this.state.latitudePo,
          longitude: this.state.longitudePo,
          accuracy: this.state.accuracyPo,
          photoDesc: this.state.photoInfo?.photoDesc,
          fileUpload: 0,
          dataUpload: 0,
          workStatus: this.props.workinfo?.workStatus,
          dataLocation: this.state.photoInfo?.dataLocation,
        },
      ];

      if (this.state.photoInfo?.reportId === 1) {
        if (photoinfo[0].latitude === 0 || photoinfo[0].longitude === 0) {
          alert(
            'Chưa lấy được thông số vị trí của bạn. Vui lòng cấu hình cho phép sử dụng định vị sau đó thử lại.',
          );
          return;
        }
      }

      if (this.state.photoInfo?.reportId === 1) {
        if (
          this.state.photoInfo?.shopLat != null &&
          this.state.photoInfo?.shopLong != null &&
          this.state.distanceLimit > 0
        ) {
          let distance = this.calculatorDistance(
            this.state.latitudePo,
            this.state.longitudePo,
          );
          if (
            distance > this.state.distanceLimit &&
            this.state.statusDistance === 2
          ) {
            MessageInfo(
              ` Vị trí của bạn so với vị trí cửa hàng lớn hơn ${
                this.state.distanceLimit
              }m vui lòng đến gần cửa hàng hơn, Khoảng cách giữa bạn và cửa hàng hiện là: \n\n${distance} Mét\nHay\n${
                distance / 1000
              } Kilomet`,
            );
            return;
          }
          OnTime(
            () => {
              this.props.navigation.navigate('Review', {
                isAutoSave: isAutoSave,
                photo: photoinfo[0],
                // callBack: this.getBackData,
                shopinfo: {
                  ...this.state.photoInfo?.shopinfo,
                  shopLat: this.state.photoInfo?.shopLat || null,
                  shopLong: this.state.photoInfo?.shopLong || null,
                },
              });
            },
            () => {
              this.props.navigation.goBack();
            },
          );
        } else {
          OnTime(
            () => {
              this.props.navigation.navigate('Review', {
                isAutoSave: isAutoSave,
                photo: photoinfo[0],
                // callBack: this.getBackData,
                shopinfo: {
                  ...this.state.photoInfo?.shopinfo,
                  shopLat: this.state.photoInfo?.shopLat || null,
                  shopLong: this.state.photoInfo?.shopLong || null,
                },
              });
            },
            () => this.props.navigation.goBack(),
          );
        }
      } else {
        this.props.navigation.navigate('Review', {
          isAutoSave: isAutoSave,
          photo: photoinfo[0],
          // callBack: this.getBackData,
          QRCode: this.props.route.params?.QRCode || null,
        });
      }
    } catch (err) {
      MessageInfo('err: ', err);
    }
  };
  getBackData = data => {
    if (data === true) {
      if (
        this.state.photoInfo.reportId == 1 ||
        this.state.photoInfo.reportId == -1 ||
        this.state.photoInfo.photoType === EMPLOYEE_TYPE_PHOTO
      ) {
        this.props.navigation.goBack();
        this.state.photoInfo.reportId == 1 &&
          DeviceEventEmitter.emit(SYNC_DATA_ATT);
      } else if (this.props.route.params.closeTakePhoto) {
        //chụp một tấm
        typeof this.props.route.params.callBackReport === 'function' &&
          this.props.route.params.callBackReport();
        this.props.navigation.goBack(null);
      }
    } else {
      this.setState({
        DoneTakePhoto: false,
        statusFace:
          'Vui lòng đưa máy vào chính diện khuôn mặt bạn để chụp chấm công',
      });
    }
  };
  loadFlashMode = () => {
    let value = this.state.flash;
    switch (value) {
      case RNCamera.Constants.FlashMode.auto:
        this.setState({ flashcolor: 'orange' });
        break;
      case RNCamera.Constants.FlashMode.on:
        this.setState({ flashcolor: '#2AF0F3' });
        break;
      default:
        this.setState({ flashcolor: '#7F7F7F' });
        break;
    }
  };
  flashPress = () => {
    let value = this.state.flash;
    switch (value) {
      case RNCamera.Constants.FlashMode.auto:
        value = RNCamera.Constants.FlashMode.on;
        this.setState({ flashcolor: '#2AF0F3' });
        break;
      case RNCamera.Constants.FlashMode.on:
        value = RNCamera.Constants.FlashMode.off;
        this.setState({ flashcolor: '#7F7F7F' });
        break;
      default:
        value = RNCamera.Constants.FlashMode.auto;
        this.setState({ flashcolor: 'orange' });
        break;
    }
    this.setState({ flash: value });
  };
  facesDetected = ({ faces }) => {
    this.setState({ faces });
    this.checkDetectFace(
      faces,
      2,
      () => {},
      () => {},
    );
  };
  renderFaces = () => (
    <View style={stylesDetect.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>
  );
  renderLandmarks = () => (
    <View style={stylesDetect.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>
  );
  renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => (
    <View
      key={faceID}
      transform={[
        { perspective: 600 },
        { rotateZ: `${rollAngle.toFixed(0)}deg` },
        { rotateY: `${yawAngle.toFixed(0)}deg` },
      ]}
      style={[
        stylesDetect.face,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}
    >
      {/* <Text style={stylesDetect.faceText}>percent: {(bounds.origin.x + bounds.size.width)*100/Dimensions.get('screen').width}</Text> */}
    </View>
  );
  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            stylesDetect.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return <View key={`landmarks-${face.faceID}`}></View>;
  }
  async goBackView(barcodes) {
    if (!this.state.isMoveView) {
      await this.setState({ isMoveView: true });
      this.props.route.params.callBack(barcodes);
      this.props.navigation.pop();
    }
  }

  barcodeRecognized = ({ barcodes }) => {
    barcodes.length > 0 && this.goBackView(barcodes);
  };

  handleBackButtonClick() {
    typeof this.props.route.params.callBackReport === 'function' &&
      this.props.route.params.callBackReport();
    this.props.navigation.goBack(null);
    return true;
  }

  render() {
    const cameraConfig = JSON.parse(this.props.shopinfo?.cameraConfig || '{}');
    const typeCameraId =
      cameraConfig?.cameraId == 'front'
        ? RNCamera.Constants.Type.front
        : cameraConfig?.cameraId == 'back'
        ? RNCamera.Constants.Type.back
        : this.state.type;
    const type = typeCameraId;
    const isEnabled = this.state.isEnabled;
    const flashmode = this.state.flash;
    const flashcolor = this.state.flashcolor;
    const { canDetectFaces } = this.state;
    return (
      <View style={stylesDetect.container}>
        <HeaderCustom
          title={'Chụp hình'}
          leftFunc={() => {
            typeof this.props.route.params.callBackReport === 'function' &&
              this.props.route.params.callBackReport(),
              this.props.navigation.goBack();
          }}
        />

        <View style={{ flex: 1 }}>
          <RNCamera
            ref={cam => {
              this.camera = cam;
            }}
            type={type}
            flashMode={flashmode}
            autoFocus="on"
            useNativeZoom={true}
            captcappureAudio={false}
            // trackingEnabled
            androidCameraPermissionOptions={{
              title: 'Cấp quyền sử dụng',
              message: 'Hệ thống yêu cầu bạn cấp quyền sử dụng máy ảnh?',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            captureAudio={false}
            // androidRecordAudioPermissionOptions={{
            //   title: 'Cấp quyền sử dụng',
            //   message: 'Hệ thống yêu cầu bạn cấp quyền sử dụng micro?',
            //   buttonPositive: 'Ok',
            //   buttonNegative: 'Cancel',
            // }}
            style={{ flex: 1 }}
            onGoogleVisionBarcodesDetected={
              this.props.route.params.QRCode === 1
                ? this.barcodeRecognized
                : null
            }
            googleVisionBarcodeType={
              RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL
            }
          >
            <View
              style={{
                width: '100%',
                position: 'absolute',
                alignSelf: 'center',
                bottom: 10,
                padding: cameraConfig?.isFlipCamera ? 15 : 0,
                backgroundColor: 'transparent',
                flexDirection: 'column',
                alignContent: 'center',
              }}
            >
              {this.state.photoInfo.reportId === 1 &&
                this.state.statusFace !== null &&
                this.state.statusFace.length > 0 && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 15,
                      fontWeight: '600',
                      padding: 5,
                      backgroundColor: 'white',
                      opacity: 0.6,
                    }}
                  >
                    {this.state.statusFace}
                  </Text>
                )}
              <View
                style={{
                  padding: cameraConfig?.isFlipCamera ? 15 : 0,
                  flexDirection: 'row',
                  alignContent: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                {this.props.route.params.QRCode !== 1 && (
                  <View style={camerestyles.bottomButtonsStart}>
                    <TouchableOpacity onPress={this.flashPress}>
                      <SpiralIcon
                        name="bolt"
                        type="font-awesome"
                        size={35}
                        color={flashcolor}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {this.state.longitudePo !== 0 &&
                this.props.route.params?.QRCode !== 1 &&
                this.state?.statusDistance === null ? (
                  <View style={camerestyles.bottomButtons}>
                    <TouchableOpacity onPress={this.takePicture}>
                      <SpiralIcon name="camera" size={60} color="orange" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  this.state.messageLocationMatch === '' && (
                    <View>
                      {(cameraConfig?.timeAutoTake || 0) == 0 ? (
                        <View style={camerestyles.bottomButtons}>
                          <TouchableOpacity onPress={this.takePicture}>
                            <SpiralIcon
                              name="camera"
                              size={60}
                              color="orange"
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <CountTimeAutoTake
                          cameraConfig={cameraConfig || {}}
                          navigation={this.props.navigation}
                          time={cameraConfig?.timeAutoTake || 0}
                          actionResult={this.takePicture}
                        />
                      )}
                    </View>
                  )
                )}

                {cameraConfig?.isFlipCamera ? (
                  <View style={camerestyles.bottomButtonsEnd}>
                    <TouchableOpacity onPress={this.flipCamera}>
                      <SpiralIcon name="sync" size={35} color="orange" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={camerestyles.bottomButtonsEnd} />
                )}
              </View>
            </View>
            {!!canDetectFaces && this.renderFaces()}
            {!!canDetectFaces && this.renderLandmarks()}
            {this.props.route.params.QRCode === 1 && (
              <BarcodeMask width={300} height={200} />
            )}
          </RNCamera>
          <View style={{ height: 0 }} />
          {this.state.longitudePo === 0 && (
            <View
              style={{
                width: '100%',
                position: 'absolute',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: Dimensions.get('window').height / 2,
              }}
            >
              <Progress.Circle thickness={1} size={65} indeterminate={true} />
              <Text style={{ color: '#007AFF' }}>Đang xác định vị trí...</Text>
            </View>
          )}
          {this.state.isTimeoutLocation === true && (
            <View
              style={{
                width: '100%',
                position: 'absolute',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: Dimensions.get('window').height / 2 + 100,
              }}
            >
              <Button
                style={{ color: '#007AFF' }}
                onPress={async () => this.getLocationUserFast()}
                title={'Thử lại'}
                titleStyle={{ fontSize: 15 }}
              />
              <Text
                style={{ color: 'orange', fontStyle: 'italic', fontSize: 13 }}
              >
                Vị trí chưa được xác định! vui lòng bấm Thử lại!
              </Text>
            </View>
          )}
          {this.state.messageLocationMatch !== '' &&
            this.state.countGetLoction < 6 && (
              <View
                style={{
                  width: '100%',
                  position: 'absolute',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: Dimensions.get('window').height / 2,
                }}
              >
                <Progress.Circle thickness={1} size={65} indeterminate={true} />
                <Text style={{ color: 'red', fontSize: 20 }}>
                  {this.state.countGetLoction}
                </Text>
                <Text
                  style={{
                    color: '#007AFF',
                    padding: 20,
                    textAlign: 'justify',
                  }}
                >
                  {this.state.messageLocationMatch}
                </Text>
              </View>
            )}
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  return {
    appcolor: state.GAppState.appcolor,
    shopinfo: state.GAppState.shopinfo,
    workinfo: state.GAppState.workinfo,
    isEdit: state.GAppState.isEdit,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(TakePicture);

const stylesDetect = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'transparent', //'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
const camerestyles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  topButtons: {
    flex: 1,
    width: Dimensions.get('window').width,
    alignItems: 'flex-start',
  },
  bottomButtons: {
    flex: 1,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
  },
  bottomButtonsEnd: {
    flex: 1,
    alignSelf: 'center',
    width: Dimensions.get('window').width,
    justifyContent: 'flex-end',
  },
  bottomButtonsStart: {
    flex: 1,
    width: Dimensions.get('window').width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  flipButton: {
    flex: 1,
    marginTop: 20,
    right: 20,
    alignSelf: 'flex-end',
  },
});
