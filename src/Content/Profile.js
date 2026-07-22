import React, { PureComponent, createRef, useState, } from 'react';
import { View, ImageBackground, Switch, Text, StyleSheet, Dimensions, FlatList, Alert, TouchableOpacity, Keyboard, SafeAreaView, Modal, Linking, } from "react-native";
import { Avatar, Input, Button, ButtonGroup, Icon, Image, } from '@rneui/themed';
import { GetAsyncStorage, Token, formatByTemplate, getPureNumber, ToastError, GetEmployeeInfo, MessageAcept, MessageAction, MessageInfo, } from '../Core/Helper';
import { scaleSize } from '../Themes/AppsStyle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppNameBuild, CONTENT_COLOR, DEFAULT_COLOR, DEFAULT_LIGHT_COLOR, EMPLOYEE_TYPE_PHOTO, lgApp, nokiaApp, URLDEFAULT, URL_CHANGEPASS, URL_EMPLOYEEINFO, URL_EMPLOYEEINFO_UPDATE } from '../Core/URLs';
import { checkNetwork, TODAY, alertNotify, alertWarning, onValidPassword, onValidPhoneNumber } from '../Core/Utility';
import LinearGradient from 'react-native-linear-gradient';
import { getIdMaxPhotos, getIdMaxImage, uploadCMND, uploadFileCMND, getIdPhotoCMND } from '../Controller/WorkController';
import * as Progress from 'react-native-progress';
import DatePicker from 'react-native-date-picker'
import Moment from 'moment';
import { deviceWidth, deviceHeight, } from '../Themes/AppsStyle'
import ActionSheet from "react-native-actions-sheet";
import { InsertPhotosItem, uploadAllDataPhoto } from '../Controller/PhotoController';
import { launchImageLibrary } from 'react-native-image-picker';
import { HeaderCustom } from '../Content/HeaderCustom'
import FormGroup from './FormGroup';
//import { AppCreateAction } from '../Core/ReduxController';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import Swiper from 'react-native-swiper';
import DeviceInfo from 'react-native-device-info';
const bottomSheet = createRef();
import dvhcvn from '../Themes/filedata/dvhcvn.json'
import base64 from 'react-native-base64';
// import Mailer from 'react-native-mail';
import { CheckProfileEmployee } from '../Controller/EmployeeController';
import NativeCamera from '../Control/NativeCamera';

const templateFormat = {
  cmnd: "###-##-####",
  cancuoc: "###-#-##-### ###"
}
const PROVINCE = 'Tỉnh/Thành phố'
const DISTRICT = 'Quận/Huyện'
const TOWN = 'Phường/Xã'

class Profile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isShowPassOld: false,
      isShowPassNew: false,
      isShowPassNew1: false,
      banks: [],
      banksName: null,
      provinceList: [],
      lstRawBanks: [],
      dateStart: new Date(),
      isCalendar: false,
      isCalendarBirthday: false,
      photoNewest: null,
      showProgress: false,
      employee: {},
      password: '',
      newpass: '',
      repass: '',
      employeeData: null,
      employeeData1: null,
      employeeData2: null,
      clothingSize: '',
      genderValue: '',
      isShowChangePass: false,
      isUploadCMND: false,
      isUseCanCuoc: false,
      indexSelect: 0,
      titleImageCMND: 'CMND mặt trước',
      photoTypeCMND: 'CMND_BEFORE',
      currentBS: {},
      visibleModalAddress: false,
      dataModalAddress: {
        dataProvince: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
        dataDistrict: [],
        dataTown: [],
        dataProvincePrototype: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
        dataDistrictPrototype: [],
        dataTownPrototype: [],
        dataProvinceF: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
        dataDistrictF: [],
        dataTownF: [],
      },
      isPermanent: false,
      isUpdateAvatar: false,
      isUpdateCMND: false,
      urlPage: '',
      titlePage: '',
      isHaveLink: true,
      AvatarPath: '',
      CMNDBeforePath: '',
      CMNDAfterPath: '',
      minDateResign: 0,
      selectPastDate: 0,
      listPlaceIssued: []

    }
    this.aCamera = 'CAMERA';
    this.aUploadFile = 'UPLOADFILE';
    this.aViewPhoto = 'VIEWPHOTO';
    this.workDate = parseInt(Moment(new Date()).format('YYYYMMDD'))
    this.inputRef = {}
    this.swiper = createRef({})
  }
  setShowProgress = (check) => {
    this.setState({ showProgress: check });
  }
  mapBankName = (lstBanks) => {
    let lstTem = [];
    if (lstBanks !== undefined && Array.isArray(lstBanks)) {
      // lstBanks.map((item) => { lstTem.push(item.bankName) })
      // lstBanks.forEach(i => {
      //   let item = {
      //     "label": i.bankName,
      //     "value": i.bankName
      //   }
      //   lstTem.push(item);
      // })
      // return lstTem
    }
    return lstBanks
  }
  handleChangeForm = async (value, stateName, baseState) => {
    if (stateName === "identityCardNumber") {
      const template = this.state.isUseCanCuoc ? templateFormat.cancuoc : templateFormat.cmnd
      let prevValue = await getPureNumber(this.state[baseState]?.[stateName])
      value = await getPureNumber(value)
      if (this.state.isUseCanCuoc && value.length > 12 && value.length > prevValue.length) return
      if (!this.state.isUseCanCuoc && value.length > 9 && value.length > prevValue.length) return
      value = formatByTemplate(value, template)
    } else if (stateName === 'mobile') {
      let prevValue = await getPureNumber(this.state[baseState]?.[stateName])
      value = await getPureNumber(value)
      if (value.length > 10 && value.length > prevValue.length) return
      value = formatByTemplate(value, "##########")
    }

    this.setState({
      [baseState]: {
        ...this.state[baseState],
        [stateName]: value,
      }
    })
  }
  async getEmployeeInfo() {
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    const shareInfo = {
      employeeId: einfo.employeeId,
      employeeName: einfo.employeeName,
      accountId: einfo.accountId,
      typeId: einfo.typeId,
      loginName: einfo.loginName,
      mobile: einfo.mobile,
      deviceId: await DeviceInfo.getUniqueId(),
      AppId: AppNameBuild,
      "token": token
    }
    const app_access = await base64.encode(JSON.stringify(shareInfo));
    let titlePage = 'Bổ sung thông tin nhân viên'

    await fetch(URL_EMPLOYEEINFO, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + token,
        'id': this.state.employee.employeeId,
      },
    })
      .then((response) => {
        return response.json()
      }).then(async res => {

        const empinfo = res.table[0]
        const checkCanCuoc = empinfo?.identityCardNumber?.toString()?.length === 12
        const identityCardNumber = formatByTemplate(empinfo.identityCardNumber, checkCanCuoc ? templateFormat.cancuoc : templateFormat.cmnd)
        const employeeData2 = res.table1.filter(it => it.workingStatusId === 1)
        empinfo.identityCardNumber = identityCardNumber
        empinfo.initialIDNumber = { id: identityCardNumber, checkCanCuoc }
        let province = []
        try { province = JSON.parse(empinfo.province) }
        catch (e) { province = [] }
        let urlPage = empinfo?.hyperLink + app_access

        this.setState({
          banks: JSON.parse(JSON.stringify(res.table3)),
          lstRawBanks: res.table3,
          banksName: JSON.parse(JSON.stringify(res.table3)),
          employeeData: empinfo,
          provinceList: JSON.parse(JSON.stringify(province)),
          initProvinceList: JSON.parse(JSON.stringify(province)),
          employeeData1: res.table1[0],
          employeeData2: employeeData2[0],
          showProgress: false,
          isUseCanCuoc: checkCanCuoc,
          isUpdateAvatar: !empinfo.photo ? false : true,
          isUpdateCMND: (!empinfo.cmndAfter || !empinfo.cmndBefore) ? false : true,
          urlPage: urlPage,
          titlePage: titlePage,
          isHaveLink: empinfo?.hyperLink !== '' ? true : false,
          minDateResign: empinfo.minDateResign,
          selectPastDate: empinfo.selectPastDate,
          listPlaceIssued: JSON.parse(empinfo.listPlaceIssued || '[]')
        })
      }).catch(() => {
        this.setState({
          showProgress: false
        })
      })
  }
  async loadPhotoLocal() {
    let lstPhoto = await getIdMaxImage(TODAY)
    if (lstPhoto !== undefined && Array.isArray(lstPhoto)) {
      let photoInfo = lstPhoto[0];

      this.setState({
        photoNewest: photoInfo
      })
    }
  }
  async componentDidMount() {
    this.setShowProgress(true)
    await GetAsyncStorage('Employee').then((value) => {
      let EmployeeInfo = JSON.parse(value);
      this.setState({ employee: EmployeeInfo });
    });

    await this.getEmployeeInfo();
    await this.loadPhotoLocal()

    this._unsubscribe = this.props.navigation.addListener('focus', async (res) => {
      if (this.state.isUploadCMND === true) {
        let lstPhotoCMND = await getIdPhotoCMND(TODAY);
        let photoInfo = lstPhotoCMND[0];
        if (photoInfo) {
          if (photoInfo?.photoType == 'CMND_BEFORE') {
            this.setState({
              employeeData: { ...this.state.employeeData, cmndBefore: photoInfo.photoPath }
            })
          } else {
            this.setState({
              employeeData: { ...this.state.employeeData, cmndAfter: photoInfo.photoPath }
            })
          }
        }
      } else {

        await this.loadNewAvatar()
      }
    });
  }
  loadNewAvatar = async () => {
    let lstPhoto = await getIdMaxPhotos(TODAY)
    if (lstPhoto !== undefined && Array.isArray(lstPhoto) && lstPhoto.length > 0) {
      let photoInfo = lstPhoto[0];
      let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
      let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
      await this.setState({
        photoNewest: photoInfo,
        employeeData: { ...this.state.employeeData, photo: pathPhoto },
        AvatarPath: pathPhoto
      })
      await uploadAllDataPhoto([photoInfo], async () => {
        await this.changeEmployeeInfo()
      }, () => {
        ToastError('Xảy ra vấn đề khi lưu ảnh!', 'Thông báo')
      });
      // await this.changeEmployeeInfo()
    }
  }
  onFilterBankBS = (value) => {
    const filterList = this.state.banks.filter(e => {
      const nameFilter = e.bankName ? e.bankName.toUpperCase() : ''.toUpperCase();
      return nameFilter.indexOf(value.toUpperCase()) > -1
    })
    this.setState({
      banksName: JSON.parse(JSON.stringify(filterList)),
    })
  }
  onFilterProvinceBS = (value) => {
    const filterList = this.state.initProvinceList.filter(e => {
      const nameFilter = e.Province ? e.Province.toUpperCase() : ''.toUpperCase();
      return nameFilter.indexOf(value.toUpperCase()) > -1
    })
    this.setState({
      provinceList: JSON.parse(JSON.stringify(filterList)),
    })
  }
  onChangePress = async () => {
    const dataPassword = { oldPassword: this.state.password, newPassword: this.state.newpass, confirmNewPassword: this.state.repass }
    if (!onValidPassword(dataPassword)) {
      return
    }
    await this.ChangePass();
  }
  async ChangePass() {
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối.");
      return
    }

    this.setShowProgress(true);
    let token = await Token();

    await fetch(URL_CHANGEPASS, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + token,
        'oldpass': this.state.password,
        'newpass': this.state.newpass
      },
    })
      .then((response) => {
        return response.json()
      }).then(res => {
        alertNotify(res.messager)
        this.setShowProgress(false);
      })
  }
  setChangeForm(index) {
    this.setState({ indexSelect: index });
    switch (index) {
      case 0:
        this.setState({ isShowChangePass: false, isUploadCMND: false })
        break;
      case 1:
        this.setState({ isShowChangePass: true, isUploadCMND: false })
        break;
      case 2:
        this.setState({ isUploadCMND: true, isShowChangePass: false })
        break;
    }
  }
  onSubmitEditing = (index, lastInput) => {
    if (lastInput) {
      Keyboard.dismiss()
      return
    }
    this.inputRef[index + 1].focus()
  }
  changeEmployeeInfo = async () => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alert("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
      return
    }

    let token = await Token();
    const {
      email, mobile, identityCardNumber, identityCardDate, identityCardBy,
      address, addressProvince, addressDistrict, addressTown, permanentAddress, permanentProvince, permanentDistrict, permanentTown
    } = this.state.employeeData
    const regEmail = /^\S+@\S+\.\S+$/g
    if (!regEmail.test(email) && email) {
      alertWarning("Định dạng email không chính xác!")
      return
    }
    let pureID = null;
    //chi kiem tra khi nhap 
    if (identityCardNumber !== null && identityCardNumber !== "") {
      pureID = await getPureNumber(identityCardNumber)
      if (this.state.isUseCanCuoc && pureID.length !== 12) {
        alertWarning("Số căn cước phải đúng 12 số!")
        return
      } else if (!this.state.isUseCanCuoc && pureID.length !== 9) {
        alertWarning("Số CMND phải đúng 9 số!")
        return
      }
      if (await identityCardDate === null || await identityCardDate === '') {
        alertWarning("Chưa chọn ngày cấp chứng minh/thẻ căn cước!")
        return;
      }
      if (await identityCardBy === null || await identityCardBy === '') {
        alertWarning("Chưa chọn nơi cấp chứng minh/thẻ căn cước!")
        return;
      }
    }
    if (mobile !== null && mobile !== "") {
      const checkMobilePhone = onValidPhoneNumber(mobile.trim())
      if (checkMobilePhone !== null) {
        alertWarning(checkMobilePhone)
        return
      }
      this.state.employeeData.mobile = await getPureNumber(mobile)
    }
    if (address !== null && address !== "") {
      if ((addressProvince == null && addressProvince !== PROVINCE) || (addressDistrict == null && addressDistrict !== DISTRICT) || (addressTown == null && addressTown !== TOWN)) {
        alertWarning('Vui lòng chọn đầy đủ ' + PROVINCE + ' - ' + DISTRICT + ' - ' + TOWN + ' của Địa chỉ thường trú')
        return
      }
    }
    if (permanentAddress !== null && permanentAddress !== "") {
      if ((permanentProvince == null && permanentProvince !== PROVINCE) || (permanentDistrict == null && permanentDistrict !== DISTRICT) || (permanentTown == null && permanentTown !== TOWN)) {
        alertWarning('Vui lòng chọn đầy đủ ' + PROVINCE + ' - ' + DISTRICT + ' - ' + TOWN + ' của Địa chỉ tạm trú')
        return
      }
    }

    // Kiểm tra trường bắt buộc nhập
    const checkValue = await this.checkInputEmployee(this.state.employeeData)
    if (checkValue) {
      this.state.employeeData.identityCardNumber = pureID
      this.setShowProgress(true)
      const empinfoUpdate = { ...this.state.employeeData, photo: this.state.AvatarPath !== '' ? this.state.AvatarPath : this.state.employeeData.photo, accountId: this.state.employee.accountId }

      await fetch(URL_EMPLOYEEINFO_UPDATE, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(empinfoUpdate),
      })
        .then((response) => {
          return response.text()
        }).then(async res => {
          if (this.state.employeeData.photo) {
            if (this.state.employeeData.photo !== this.props.userInfo) {
              let newUserInfo = this.props.userInfo
              newUserInfo.photo = this.state.employeeData.photo
              await this.props.GAppController.SetUserInfo(newUserInfo);
            }
            this.setState({ isUpdateAvatar: true })
          }
          this.setShowProgress(false)
          await this.getEmployeeInfo();
          await this.checkProfile(res)
          // alertNotify(res.toString())
        })
    }
  }
  checkInputEmployee = async (employee) => {
    let strValid = ''
    const {
      gender, birthday, email, mobile,
      permanentAddress, address, accountNumber, bankId,
      identityCardNumber, identityCardDate, identityCardBy
    } = employee
    //
    if (gender == null || gender == 0)
      strValid += '- Giới tính\n'
    if ((birthday || '').length == 0)
      strValid += '- Ngày sinh\n'
    if ((email || '').length == 0)
      strValid += '- Email\n'
    if ((mobile || '').length == 0)
      strValid += '- Số điện thoại\n'
    if ((permanentAddress || '').length == 0)
      strValid += '- Địa chỉ thường trú\n'
    if ((address || '').length == 0)
      strValid += '- Địa chỉ tạm trú\n'
    if ((accountNumber || '').length == 0)
      strValid += '- Số tài khoản\n'
    if (bankId == null || bankId == 0)
      strValid += '- Ngân hàng\n'
    if ((identityCardNumber || '').length == 0)
      strValid += '- CMND/CCCD\n'
    if ((identityCardDate || '').length == 0)
      strValid += '- Ngày cấp CMND/CCCD\n'
    if ((identityCardBy || '').length == 0)
      strValid += '- Nơi cấp CMND/CCCD'
    //
    if (strValid !== null && strValid.length > 0) {
      alertWarning(`Vui lòng cập nhật đầy đủ các thông tin:\n${strValid}`)
      return false
    }
    return true
  }
  checkProfile = async (res) => {
    const resulCheck = await CheckProfileEmployee()
    if (resulCheck.status == 500) {
      if (resulCheck.isConstraint == 1) {
        MessageInfo(resulCheck.message)
      }
    } else if (resulCheck.status == 200) {
      if (res !== null && res !== undefined && res?.length > 0) {
        alertNotify(res.toString())
      }
    }
  }
  handleDisplayBS = (boolean, type, stateName, baseState) => {
    if (boolean) {
      bottomSheet.current?.show()
      this.setState({
        currentBS: {
          ...this.state.currentBS,
          type: type,
          selectedDay: (type == 'DATE' || stateName == 'workingDate') ? Moment(this.state?.[baseState]?.[stateName]?.toString()).format('YYYY-MM-DD') : this.state?.[baseState]?.[stateName]?.toString() || Moment().format("yyyy-MM-DD"),
          stateName: stateName,
          baseState: baseState,
        },
        banksName: JSON.parse(JSON.stringify(this.state.banks)),
        provinceList: JSON.parse(JSON.stringify(this.state.initProvinceList)),
      })
    } else {
      bottomSheet.current.hide();
    }
  }
  takePhoto = () => {
    let item = {
      "photoType": EMPLOYEE_TYPE_PHOTO
    }
    this.props.navigation.navigate('Camera', item);
  }
  onSwitchID = () => {
    const { id, checkCanCuoc } = this.state.employeeData?.initialIDNumber || {}
    this.setState({
      isUseCanCuoc: !this.state.isUseCanCuoc,
      employeeData: {
        ...this.state.employeeData,
        identityCardNumber: checkCanCuoc !== this.state.isUseCanCuoc ? id || "" : "",
      }
    })
  }
  handlerActionButton = (typeAction) => {
    switch (typeAction) {
      case this.aCamera:
        this.cameraCMND()
        break
      case this.aUploadFile:
        this.getPhotoFromGallery()
        break
    }
  }
  cameraCMND = () => {
    let photoInfo = {
      "reportId": 0,
      "shopId": 0,
      "shopCode": 'profile',
      "photoType": this.state.photoTypeCMND,
      "photoDate": this.workDate
    }
    this.props.navigation.navigate('Camera', { ...photoInfo, closeTakePhoto: true });
  }
  getPhotoFromGallery = async () => {
    let photoinfo = {};
    let options = {
      mediaType: 'photo', maxWidth: 800, maxHeight: 1024, quality: 0.4, includeBase64: true
    };
    await launchImageLibrary(options, async (response) => {
      if (!response.didCancel) {
        let { assets } = await response || []
        if (assets !== undefined) {
          await assets?.forEach(async res => {
            const newImageUrl = await NativeCamera.resizeImage(await res.uri)
            photoinfo = {
              shopId: 0,
              shopCode: 'profile',
              photoDate: this.workDate,
              photoType: this.state.photoTypeCMND,
              photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
              photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
              photoPath: newImageUrl?.uri || res.uri,
              reportId: 0,
              latitude: 0,
              longitude: 0,
              photoDesc: 0,
              fileUpload: 0,
              dataUpload: 0
            }

            await InsertPhotosItem(photoinfo);
            if (this.state.photoTypeCMND === 'CMND_AFTER')
              this.setState({ employeeData: { ...this.state.employeeData, cmndAfter: photoinfo.photoPath }, CMNDAfterPath: photoinfo.photoPath })
            else
              this.setState({ employeeData: { ...this.state.employeeData, cmndBefore: photoinfo.photoPath }, CMNDBeforePath: photoinfo.photoPath })
          });
        }
      }
    });
  }
  renderButtonAction = (appcolor, title, icon, typeAction) => {
    return (
      <Button type='clear'
        icon={<Icon type='material-community' name={icon} size={20} color={appcolor.primary} />}
        containerStyle={{ alignItems: 'flex-start', borderTopColor: '#c2c2c2', borderTopWidth: 0.5 }}
        title={title}
        titleStyle={{ fontSize: 13, color: appcolor.dark, marginStart: 3 }}
        buttonStyle={{ height: 35, marginBottom: 3 }}
        onPress={() => this.handlerActionButton(typeAction)} />
    )
  }
  handlerUploadCMND = async () => {
    await uploadCMND(async (message) => {
      alertNotify(message.toString());
    })
    await uploadFileCMND();
    if (this.state.employeeData.cmndBefore && this.state.employeeData.cmndAfter) {
      this.setState({ isUpdateCMND: true })
    }
  }
  handlerSetTypeCMND = async (type) => {
    this.setState({
      titleImageCMND: type == 'CMND_BEFORE' ? 'CMND mặt trước' : 'CMND mặt sau',
      photoTypeCMND: type
    })
  }
  getStringPhotoCMND = (photoPath) => {
    let result = '';
    if (photoPath.substring(0, 4) === 'file')
      result = photoPath;
    else if (photoPath.substring(0, 7) === 'content')
      result = photoPath
    else
      result = URLDEFAULT + photoPath;
    return result
  }
  handlerUploadData = () => {
    this.state.isShowChangePass === true ? this.onChangePress() :
      this.state.isUploadCMND === true ? this.handlerUploadCMND() :
        this.changeEmployeeInfo();
  }
  uploadFile = async (e) => {
    let photoinfo = {};
    let options = {
      mediaType: 'photo', maxWidth: 800, maxHeight: 1024, quality: 0.4, includeBase64: true
    };
    await launchImageLibrary(options, async (response) => {
      if (!response.didCancel) {
        let { assets } = await response || []
        if (assets !== undefined) {
          await assets?.forEach(async res => {
            const newImageUrl = await NativeCamera.resizeImage(await res.uri)
            photoinfo = {
              reportId: 0,
              shopId: 0,
              shopCode: 'profile',
              photoDate: parseInt(Moment(new Date()).format('YYYYMMDD')),
              photoType: EMPLOYEE_TYPE_PHOTO,
              photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
              photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
              photoPath: newImageUrl?.uri || res.uri,
              latitude: 0,
              longitude: 0,
              fileUpload: 0,
              dataUpload: 0
            }
            await InsertPhotosItem(photoinfo);
            await this.loadNewAvatar()
          });
        }
      }
    });
  }
  optionAVATA = () => {
    Alert.alert(
      'Chức năng',
      'Thêm hình cho profile',
      [
        {
          text: 'Huỷ',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Chụp hình',
          onPress: () => {
            this.takePhoto()
          },
        },
        {
          text: 'Thư viện hình ảnh',
          onPress: () => {
            this.uploadFile()
          }
        },
      ],
      { cancelable: false },
    );
  }

  // address choose
  onSwipe = (index) => {
    this.swiper.current?.scrollTo(index)
  }
  onIndexModalAddressChanged = (index) => {
    switch (index) {
      case 0:
        this.state.dataModalAddress.dataProvince = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataProvincePrototype));
        this.state.dataModalAddress.dataProvinceF = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataProvincePrototype));
        this.state.dataModalAddress.searchProvince = '';
        break;
      case 1:
        this.state.dataModalAddress.dataDistrict = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataDistrictPrototype));
        this.state.dataModalAddress.dataDistrictF = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataDistrictPrototype));
        this.state.dataModalAddress.searchDistrict = ''
        break;
      case 2:
        this.state.dataModalAddress.dataTown = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataTownPrototype));
        this.state.dataModalAddress.dataTownF = JSON.parse(JSON.stringify(this.state.dataModalAddress.dataTownPrototype));
        this.state.dataModalAddress.searchTown = ''
        break;
    }
    this.state.dataModalAddress.search = ""
  }
  onOpenModalAddress = (visible, indexScrollSwipe, isPermanent, type, item) => {
    this.setState({ visibleModalAddress: visible, isPermanent: isPermanent })
    setTimeout(() => {
      this.swiper.current?.scrollBy(indexScrollSwipe)
    }, 500)
  }
  onSelectAddress = (dropdownItem, indexAnswer, isPermanent, TypeSave) => {
    try {
      switch (indexAnswer) {
        case 1:
          const level2s = dropdownItem?.level2s || []
          this.setState({
            dataModalAddress: {
              ...this.state.dataModalAddress,
              dataDistrict: JSON.parse(JSON.stringify(level2s)),
              dataDistrictPrototype: JSON.parse(JSON.stringify(level2s))
            },
            employeeData: {
              ...this.state.employeeData,
              permanentProvince: isPermanent && TypeSave == PROVINCE ? dropdownItem.name : this.state.employeeData.permanentProvince,
              addressProvince: !isPermanent && TypeSave == PROVINCE ? dropdownItem.name : this.state.employeeData.addressProvince,
            }
          })
          this.onSwipe(indexAnswer)
          break;
        case 2:
          const level3s = dropdownItem?.level3s || []
          this.setState({
            dataModalAddress: {
              ...this.state.dataModalAddress,
              dataTown: JSON.parse(JSON.stringify(level3s)),
              dataTownPrototype: JSON.parse(JSON.stringify(level3s))
            },
            employeeData: {
              ...this.state.employeeData,
              permanentDistrict: isPermanent && TypeSave == DISTRICT ? dropdownItem.name : this.state.employeeData.permanentDistrict,
              addressDistrict: !isPermanent && TypeSave == DISTRICT ? dropdownItem.name : this.state.employeeData.addressDistrict,
            }
          })
          this.onSwipe(indexAnswer)
          break;
        case 3:
          this.onOpenModalAddress(false)
          this.setState({
            employeeData: {
              ...this.state.employeeData,
              permanentTown: isPermanent && TypeSave == TOWN ? dropdownItem.name : this.state.employeeData.permanentTown,
              addressTown: !isPermanent && TypeSave == TOWN ? dropdownItem.name : this.state.employeeData.addressTown,
            }
          })
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }
  onFilterModalAddress = (value, nameField) => {
    let dataFilter = []
    switch (nameField) {
      case 'searchProvince':
        if (value !== null && value !== undefined && value.length > 0) {
          dataFilter = this.state.dataModalAddress?.dataProvinceF.filter(i => i.name.toLowerCase().match(value.toLowerCase()))
        } else {
          dataFilter = this.state.dataModalAddress?.dataProvinceF
        }

        this.setState({
          dataModalAddress: {
            ...this.state.dataModalAddress,
            dataProvince: dataFilter,
            searchProvince: value
          }
        })
        break;

      case 'searchDistrict':
        if (value !== null && value !== undefined && value.length > 0) {
          dataFilter = this.state.dataModalAddress?.dataDistrictF.filter(i => i.name.toLowerCase().match(value.toLowerCase()))
        } else {
          dataFilter = this.state.dataModalAddress?.dataDistrictF
        }

        this.setState({
          dataModalAddress: {
            ...this.state.dataModalAddress,
            dataDistrict: dataFilter,
            searchDistrict: value
          }
        })
        break;

      case 'searchTown':
        if (value !== null && value !== undefined && value.length > 0) {
          dataFilter = this.state.dataModalAddress?.dataTownF.filter(i => i.name.toLowerCase().match(value.toLowerCase()))
        } else {
          dataFilter = this.state.dataModalAddress?.dataTownF
        }

        this.setState({
          dataModalAddress: {
            ...this.state.dataModalAddress,
            dataTown: dataFilter,
            searchTown: value
          }
        })
        break;

      default:
        break;
    }
  }

  onGoback = async () => {
    const resulCheck = await CheckProfileEmployee();
    let isConstraint = null;
    let isConstraintImage = null;
    if (resulCheck.status == 500) {
      isConstraint = resulCheck.isConstraint || null
      isConstraintImage = resulCheck.isCheckImage || null
    }

    if (isConstraint == 1) {
      if (resulCheck.status == 500) {
        if (resulCheck.isConstraint == 1) {
          MessageInfo(resulCheck.message)
        }
      } else if (isConstraintImage == 1) {
        if (!this.state.employeeData.photo || !this.state.employeeData.cmndBefore || !this.state.employeeData.cmndAfter) {
          ToastError('Bạn chưa chụp ' + (!this.state.employeeData.photo ? 'ảnh đại diện' : '') + (!this.state.employeeData.cmndBefore ? ', mặt trước CMND' : '') + (!this.state.employeeData.cmndAfter ? ', mặt sau CMND' : '') + '!!!')
          return
        } else if (this.state.isUpdateAvatar === false || this.state.isUpdateCMND === false) {
          ToastError('Bạn đã chụp hình nhưng chưa nhấn nút cập nhật thông tin' + (!this.state.isUpdateAvatar ? ' ảnh đại diện ' : '') + (!this.state.isUpdateCMND ? ' ảnh CMND trước/sau' : '') + '!!!')
          return
        }
        this.props.navigation.goBack()
      } else {
        this.props.navigation.goBack()
      }
    } else {
      this.props.navigation.goBack()
    }
  }
  handlerSendMail = async () => {
    const info = this.state.employeeData
    // Mailer.mail({
    //   subject: 'Support Mail',
    //   recipients: [info.parentEmail],
    //   ccRecipients: [info.parentEmail],
    //   isHTML: true
    // }, (error, event) => {
    //   Alert.alert(
    //     error,
    //     event,
    //     [{ text: 'Ok', onPress: () => console.log('OK: Email Error Response') }, { text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response') }],
    //     { cancelable: true }
    //   )
    // });
  }
  render() {
    let info = this.state.employee;
    const appcolor = this.props.appcolor;
    return (
      <View style={{ height: '100%', width: '100%', backgroundColor: appcolor.light }}>
        <HeaderCustom
          leftFunc={() => this.onGoback()}
          title={'Thông tin nhân viên'}
          iconRight='cloud-upload-alt'
          rightFunc={this.handlerUploadData}
        />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}
          scrollsToTop={false} scrollToOverflowEnabled={true} scrollEnabled={true}  >
          <LinearGradient
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            colors={[DEFAULT_COLOR, DEFAULT_LIGHT_COLOR]}
            style={stylesGradient.linearGradient}>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', flex: 1 }}>
              <View style={{ width: '100%', height: 180, borderWidth: 0 }}>
                <View style={{
                  alignContent: 'center', alignSelf: 'center', alignItems: 'center',
                  justifyContent: 'center', width: '100%', height: '100%', borderWidth: 0
                }}>
                  {
                    (this.state.photoNewest !== null && this.state.photoNewest !== undefined) ?
                      <Image resizeMode='cover'
                        style={{ height: 100, width: 100, padding: 5, borderRadius: 50 }} source={{ uri: this.state.photoNewest.photoPath }} /> :
                      (this.state.employeeData !== null ? <Image resizeMode='cover'
                        style={{ height: 100, width: 100, padding: 5, borderRadius: 50 }} source={{ uri: this.state.employeeData.photo?.includes('uploaded') ? (URLDEFAULT + this.state.employeeData.photo) : (this.state.employeeData.photo || null) }} /> :
                        <Avatar size="large" showEditButton rounded icon={{ name: 'person', size: 60, color: 'white' }} ></Avatar>)
                  }
                  {/* <View style={{
                    position: 'absolute', top: 35, justifyContent: 'space-between',
                    left: Dimensions.get('window').width / 2 + 40, paddingLeft: 5, paddingRight: 5, borderRadius: 5, borderWidth: 1.0,
                    borderColor: appcolor.light, alignContent: 'center', alignSelf: 'center', alignItems: 'center'
                  }}>
                    <Text style={{ color: appcolor.dark, fontSize: 12, fontWeight: '300', width: '100%', height: '100%', textAlign: 'center' }}>{this.state.employeeData !== null ? this.state.employeeData.positionName : ''}</Text>
                    </View> */}
                  <View style={{ position: 'absolute', top: 95, justifyContent: 'space-between', left: Dimensions.get('window').width / 2 - 53, paddingLeft: 5, paddingRight: 5, borderRadius: 5, borderWidth: 0, alignContent: 'center', alignSelf: 'center', alignItems: 'center' }}>
                    {!this.state.isUploadCMND && <Icon
                      name='camera'
                      type='evilicon'
                      color={CONTENT_COLOR}
                      size={30}
                      onPress={() => {
                        this.optionAVATA()
                      }}
                    />
                    }
                  </View>
                  <Text style={{ color: appcolor.dark, marginTop: 10, fontSize: 14, fontWeight: '600' }}>{info.employeeName}</Text>
                  {this.state.employeeData?.city !== null &&
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                      <Icon
                        containerStyle={{ paddingTop: 5 }}
                        name='location'
                        type='evilicon'
                        color={CONTENT_COLOR}
                        size={20}
                      />
                      <Text style={{ color: appcolor.dark, marginTop: 5, fontSize: 12, fontWeight: '300' }}>{this.state.employeeData !== null ? this.state.employeeData.city : ''}</Text>
                    </View>
                  }
                  {/* <View style={{position:'absolute',top:35,justifyContent:'space-between',left:Dimensions.get('window').width/2 + 20,paddingLeft:5,paddingRight:5,borderRadius:5,borderWidth:1.0,borderColor:'white',alignContent:'center',alignSelf:'center',alignItems:'center'}}><Text style={{color:'#FFFFFF',fontSize:12,fontWeight:'300',width:'100%',height:'100%',textAlign:'center'}}>{this.state.employeeData !== null ? this.state.employeeData.positionName:''}</Text></View> */}
                </View>
              </View>
            </View>
            <ButtonGroup
              buttonStyle={{ backgroundColor: 'none' }}
              onPress={(index) => this.setChangeForm(index)}
              containerStyle={{
                borderStyle: 'dashed',
                backgroundColor: 'clear', borderWidth: 0
              }}
              textStyle={{ fontSize: 12, color: appcolor.white, fontWeight: '600' }}
              selectedButtonStyle={{ backgroundColor: 'clear' }}
              selectedTextStyle={{ textDecorationLine: 'underline' }}
              // disabledSelectedTextStyle={true}
              // disabledSelectedStyle={true}
              selectedIndex={this.state.indexSelect}
              buttons={['Thông tin', 'Thay đổi mật khẩu', 'Hình ảnh CMND']}
            />
            {
              this.state?.employeeData?.showResign === 1 &&
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('employeeresigns', { employeeInfo: info, minDateResign: this.state.minDateResign, selectPastDate: this.state.selectPastDate })}
                style={{ position: 'absolute', top: 10, left: 10 }}>
                <Icon
                  containerStyle={{ paddingTop: 5 }}
                  name='toolbox'
                  type='font-awesome-5'
                  color={CONTENT_COLOR}
                  size={20}
                />
                <Text style={{ color: appcolor.white, marginTop: 5, fontSize: 12, fontWeight: '300' }}>Nghỉ việc</Text>
              </TouchableOpacity>
            }

          </LinearGradient>
          {
            this.state.isShowChangePass === true ?
              <ImageBackground style={{ height: '100%', width: '100%', backgroundColor: appcolor.light, paddingBottom: 40 }}>
                <View style={{
                  flex: 1, justifyContent: 'flex-start', backgroundColor: appcolor.light,
                }}>
                  <View style={{ padding: 12, backgroundColor: appcolor.surface, margin: 7, borderRadius: 12 }}>
                    <Text style={{ color: appcolor.grey }}>Tên nhân viên</Text>
                    <Input style={{ color: appcolor.dark }}
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      disabled={true} value={info.employeeName}></Input>
                  </View>
                  <View style={{ padding: 12, backgroundColor: appcolor.surface, margin: 7, borderRadius: 12 }}>
                    <Text style={{ color: appcolor.grey }}>Tên đăng nhập</Text>
                    <Input inputContainerStyle={{ borderBottomWidth: 0 }} disabled={true} style={{ color: appcolor.dark, }}>{info.loginName}</Input>
                  </View>
                  <View style={{
                    paddingTop: 12, paddingLeft: 12, paddingRight: 12, backgroundColor: appcolor.light,
                    margin: 7, borderRadius: 12, borderColor: appcolor.surface, borderWidth: 1
                  }}>
                    <Text style={{ color: appcolor.grey }}>Mật khẩu cũ</Text>
                    <Input
                      rightIcon={
                        <Icon
                          size={20}
                          name={this.state.isShowPassOld ? 'eye' : 'eye-with-line'}
                          type='entypo'
                          onPress={(e) => this.setState({ isShowPassOld: this.state.isShowPassOld ? false : true })}
                        />}
                      secureTextEntry={this.state.isShowPassOld ? false : true} placeholder='Nhập mật khẩu' inputContainerStyle={{ borderBottomWidth: 0 }} onChangeText={(value) => this.setState({ password: value })}
                      style={{ color: appcolor.dark }}></Input>
                  </View>
                  <View style={{
                    paddingTop: 12, paddingLeft: 12, paddingRight: 12, backgroundColor: appcolor.light,
                    margin: 7, borderRadius: 12, borderColor: appcolor.surface, borderWidth: 1
                  }}>
                    <Text style={{ color: appcolor.grey }}>Mật khẩu mới</Text>
                    <Input
                      rightIcon={
                        <Icon
                          size={20}
                          name={this.state.isShowPassNew ? 'eye' : 'eye-with-line'}
                          type='entypo'
                          onPress={(e) => this.setState({ isShowPassNew: this.state.isShowPassNew ? false : true })}
                        />}
                      secureTextEntry={this.state.isShowPassNew ? false : true}
                      placeholder='Nhập mật khẩu' inputContainerStyle={{ borderBottomWidth: 0, marginBottom: 0 }} onChangeText={(value) => this.setState({ newpass: value })}
                      style={{ color: appcolor.dark, }}></Input>
                  </View>
                  <View style={{
                    paddingTop: 12, paddingLeft: 12, paddingRight: 12, backgroundColor: appcolor.light,
                    margin: 7, borderRadius: 12, borderColor: appcolor.surface, borderWidth: 1
                  }}>
                    <Text style={{ color: appcolor.grey }}>Nhập lại mật khẩu mới</Text>
                    <Input
                      rightIcon={
                        <Icon
                          size={20}
                          name={this.state.isShowPassNew1 ? 'eye' : 'eye-with-line'}
                          type='entypo'
                          onPress={(e) => this.setState({ isShowPassNew1: this.state.isShowPassNew1 ? false : true })}
                        />}
                      secureTextEntry={this.state.isShowPassNew1 ? false : true}
                      placeholder='Nhập mật khẩu' inputContainerStyle={{ borderBottomWidth: 0 }}
                      style={{ color: appcolor.dark, }} onChangeText={(value) => this.setState({ repass: value })}
                    ></Input>
                  </View>

                </View>
              </ImageBackground>
              :
              this.state.isUploadCMND === true ?
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ flex: 1, flexDirection: 'row', margin: 8 }}>
                    <Image
                      source={{ uri: this.state.CMNDBeforePath !== '' ? this.state.CMNDBeforePath : this.getStringPhotoCMND(this.state.employeeData.cmndBefore !== null ? this.state.employeeData.cmndBefore : '') }}
                      style={{ width: 200, height: 120, marginEnd: 5, marginStart: -5 }}
                      onPress={() => this.handlerSetTypeCMND('CMND_BEFORE')} />
                    <Image
                      source={{ uri: this.state.CMNDAfterPath !== '' ? this.state.CMNDAfterPath : this.getStringPhotoCMND(this.state.employeeData.cmndAfter !== null ? this.state.employeeData.cmndAfter : '') }}
                      style={{ width: 200, height: 120 }}
                      onPress={() => this.handlerSetTypeCMND('CMND_AFTER')} />
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column', marginStart: 16, marginEnd: 16 }}>
                    <Text style={{ color: appcolor.dark, textAlign: 'center', marginBottom: 8 }}>{this.state.titleImageCMND}</Text>
                    {this.renderButtonAction(appcolor, 'Chụp hình', 'camera', this.aCamera)}
                    {this.renderButtonAction(appcolor, 'Chọn hình ảnh từ thư viện', 'upload', this.aUploadFile)}
                  </View>
                </View>
                :
                <View style={{ alignItems: 'center', flex: 1, backgroundColor: appcolor.light }}>
                  <View width='95%' >
                    <Text style={{ padding: 7, color: appcolor.grey, fontSize: scaleSize(12), }}>Thông tin cơ bản</Text>
                    <View>
                      <RenderFormGroup index={-1} title="Mã nhân viên" editable={false} stateName="employeeCode" baseState={'employeeData1'} state={this.state} />
                      <RenderFormGroup index={-1} title="Tên nhân viên" editable={(AppNameBuild === nokiaApp || AppNameBuild === lgApp) ? false : true} stateName="fullName" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} />
                      <RenderFormGroup index={-1} title="Giới tính" editable={false} stateName="genderNameVN" baseState={'employeeData'} state={this.state} iconRight="venus-mars" typeBS="GENDER" handleDisplayBS={this.handleDisplayBS} />
                      <RenderFormGroup index={-1} title="Ngày sinh" editable={false} stateName="birthday" baseState={'employeeData'} state={this.state} iconRight="calendar" typeBS="DATE" handleDisplayBS={this.handleDisplayBS} />
                      <RenderFormGroup index={1} title="Email" stateName="email" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      <RenderFormGroup index={2} title="Số điện thoại" keyboardType="numeric" stateName="mobile" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      <RenderFormGroup index={3} title="Địa chỉ thường trú (Nhập số nhà,tên đường)" placeholder={'Số nhà, tên đường'} stateName="permanentAddress" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      <RenderAddress item={this.state.employeeData} appcolor={appcolor} onOpenModalAddress={this.onOpenModalAddress} isPermanent={true} />
                      <RenderFormGroup index={4} title="Địa chỉ tạm trú (Nhập số nhà,tên đường)" placeholder={'Số nhà, tên đường'} stateName="address" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      <RenderAddress item={this.state.employeeData} appcolor={appcolor} onOpenModalAddress={this.onOpenModalAddress} isPermanent={false} />
                      <RenderFormGroup index={5} title="Số tài khoản" stateName="accountNumber" baseState={'employeeData'} state={this.state} handleChangeForm={this.handleChangeForm} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      {this.state.banksName !== null && (
                        <RenderFormGroup index={-1} title="Ngân hàng" editable={false} stateName="bankBrand" baseState={'employeeData'} state={this.state} iconRight="university" typeBS="BANK" handleDisplayBS={this.handleDisplayBS} />
                      )}
                      <View style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ color: appcolor.dark }}>{`Thông tin ${this.state.isUseCanCuoc ? "căn cước" : "CMND"}`}</Text>
                        <Switch value={this.state.isUseCanCuoc} trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={this.state.isUseCanCuoc ? "#f5dd4b" : "#f4f3f4"} ios_backgroundColor="#3e3e3e" onValueChange={this.onSwitchID} />
                      </View>
                      <RenderFormGroup index={6} title={`Số ${this.state.isUseCanCuoc ? "căn cước" : "CMND"}`}
                        placeholder={this.state.isUseCanCuoc ? templateFormat.cancuoc : templateFormat.cmnd}
                        keyboardType="numeric" stateName="identityCardNumber" baseState={'employeeData'} state={this.state}
                        handleChangeForm={this.handleChangeForm} lastInput returnKeyType={'done'} onSubmitEditing={this.onSubmitEditing} inputRef={this.inputRef} />
                      <RenderFormGroup index={-1} title="Ngày cấp" editable={false} stateName="identityCardDate" baseState={'employeeData'} state={this.state} iconRight="calendar" typeBS="DATE" handleDisplayBS={this.handleDisplayBS} />
                      <RenderFormGroup index={-1} title="Nơi cấp" editable={false} stateName="identityCardBy" baseState={'employeeData'} state={this.state} iconRight="map-marker-alt" typeBS="PROVINCE" handleDisplayBS={this.handleDisplayBS} multiline={true} />
                      <RenderFormGroup index={-1} title="Size quần áo" editable={false} stateName="uniform" baseState={'employeeData'} state={this.state} iconRight="tshirt" typeBS="SIZE" handleDisplayBS={this.handleDisplayBS} />
                    </View>
                  </View>
                  {
                    this.state.isHaveLink &&
                    <View width='95%'>
                      <TouchableOpacity
                        // onPress={() => Linking.openURL('https://lg-e.spiral.com.vn/form/formresult?publicKey=2642af2b-ff0b-48c7-a455-49134946091f')}
                        onPress={() => this.props.navigation.navigate('WebView', { urlPage: this.state.urlPage, pageName: this.state.titlePage })}
                        style={{ backgroundColor: appcolor.primary, borderRadius: 10, padding: 15, justifyContent: 'center', alignItems: "center" }}>
                        <Text style={{ color: appcolor.white, fontSize: 16, fontWeight: '700' }}>Thông tin khác (Bắt buộc)</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  <View width='95%'>
                    <Text style={{ padding: 7, fontSize: scaleSize(12), color: appcolor.grey }}>Thông tin công tác</Text>
                    <View style={{ paddingBottom: deviceHeight / 3 }}>
                      <RenderFormGroup index={-1} title="Ngày vào làm" editable={false} stateName="workingDate" baseState={'employeeData'} state={this.state} />
                      <RenderFormGroup index={-1} title={"Ngày làm Chính thức"} editable={false} stateName="fromDate" baseState={'employeeData'} state={this.state} />
                      <RenderFormGroup index={-1} title="Chức vụ" editable={false} stateName="workingStatus" baseState={'employeeData1'} state={this.state} />
                      <RenderFormGroup index={-1} title="Bộ phận" editable={false} stateName="typeName" baseState={'employeeData'} state={this.state} />
                      <RenderFormGroup index={-1} title="Khu vực" editable={false} stateName="city" baseState={'employeeData'} state={this.state} />
                      <RenderFormGroup index={-1} title="Người quản lý" editable={false} stateName="parentName" baseState={'employeeData'} state={this.state} />
                      <RenderFormGroup index={-1} title="Email người quản lý" editable={false} stateName="parentEmail" baseState={'employeeData'} state={this.state}
                        handleDisplayBS={this.handlerSendMail} iconRight="paper-plane"
                      />
                      <RenderFormGroup index={-1} title="SĐT người quản lý" editable={false} stateName="parentPhone" baseState={'employeeData'} state={this.state} />
                    </View>
                  </View>
                </View>
          }
        </KeyboardAwareScrollView>
        {
          this.state.showProgress === true && <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }}><Progress.Circle thickness={1} size={65} indeterminate={true} /><Text style={{ color: '#007AFF' }}>Vui lòng chờ...</Text></View>
        }
        <ActionSheet ref={bottomSheet} initialOffsetFromBottom={0.6}
          containerStyle={{ backgroundColor: appcolor.light, }} closeOnPressBack={true}
          indicatorColor={appcolor.success} defaultOverlayOpacity={0.3}>
          <View nestedScrollEnabled={true} style={{ width: deviceWidth, height: deviceHeight, padding: 12 }}>
            {this.state.currentBS?.type === 'DATE' ? (
              <RenderCalendarBS appcolor={appcolor}
                currentBS={this.state.currentBS} handleDisplayBS={this.handleDisplayBS}
                onSelect={this.handleChangeForm}
              />
            ) : (this.state.currentBS?.type === 'GENDER') ? (
              <RenderGenderBS appcolor={appcolor}
                onSelect={this.handleChangeForm}
                employeeData={this.state.employeeData}
                handleDisplayBS={this.handleDisplayBS} />
            ) : (this.state.currentBS?.type === 'SIZE') ? (
              <RenderSizeUniformBS appcolor={appcolor}
                onSelect={this.handleChangeForm}
                employeeData={this.state.employeeData}
                handleDisplayBS={this.handleDisplayBS} />
            ) : (this.state.currentBS?.type === 'BANK') ? (
              <RenderBankBS appcolor={appcolor}
                onSelect={this.handleChangeForm}
                onFilterContentBS={this.onFilterBankBS}
                banksName={this.state.banksName || []}
                employeeData={this.state.employeeData}
                handleDisplayBS={this.handleDisplayBS} />
            ) : (this.state.currentBS?.type === 'PROVINCE') && (
              (this.state.currentBS?.stateName == 'identityCardBy' && this.state.isUseCanCuoc == true) ?
                <RenderPlaceIssued appcolor={appcolor}
                  onSelect={this.handleChangeForm}
                  provinceList={this.state.listPlaceIssued || []}
                  employeeData={this.state.employeeData}
                  handleDisplayBS={this.handleDisplayBS} />
                :
                <RenderProvinceBS appcolor={appcolor}
                  onSelect={this.handleChangeForm}
                  provinceList={this.state.provinceList || []}
                  onFilterContentBS={this.onFilterProvinceBS}
                  employeeData={this.state.employeeData}
                  handleDisplayBS={this.handleDisplayBS} />
            )}
          </View>
        </ActionSheet>
        {/* // Modal Item Address */}
        <Modal visible={this.state.visibleModalAddress} animationType="slide">
          <SafeAreaView style={{ backgroundColor: appcolor.light, flex: 1, height: deviceHeight, padding: 10, overflow: 'hidden', }}>
            <Swiper ref={this.swiper} loop={false} showsPagination={false} onIndexChanged={this.onIndexModalAddressChanged}>
              <View key={1} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                  <TouchableOpacity onPress={() => this.onOpenModalAddress(false)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="times" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{PROVINCE}</Text>
                  <TouchableOpacity onPress={() => this.onSwipe(1)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="chevron-right" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                </View>
                <FormGroup iconName="search" editable={true} value={this.state.dataModalAddress?.searchProvince || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => this.onFilterModalAddress(e, 'searchProvince', 'dataProvince')} />
                <FlatList data={this.state.dataModalAddress?.dataProvince || []}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => {
                    const indexAnswer = 1
                    const answerAddressItem = this.state.currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                    const isSelected = answerAddressItem?.anwserValue === item.name
                    return (
                      <View key={index} style={{ margin: 5, }}>
                        <TouchableOpacity disabled={false} onPress={() => this.onSelectAddress(item, indexAnswer, this.state.isPermanent, PROVINCE)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                          <Icon type='font-awesome-5' name="map-marker-alt" size={16} color={appcolor.dark} />
                          <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  }} />
              </View>
              <View key={2} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                  <TouchableOpacity onPress={() => this.onSwipe(-1)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="chevron-left" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{DISTRICT}</Text>
                  <TouchableOpacity onPress={() => this.onSwipe(1)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="chevron-right" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                </View>
                <FormGroup iconName="search" editable={true} value={this.state.dataModalAddress?.searchDistrict || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => this.onFilterModalAddress(e, 'searchDistrict', 'dataDistrict')} stateName="search" />
                <FlatList data={this.state.dataModalAddress?.dataDistrict || []}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => {
                    const indexAnswer = 2
                    const answerAddressItem = this.state.currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                    const isSelected = answerAddressItem?.anwserValue === item.name
                    return (
                      <View key={index} style={{ margin: 5, }}>
                        <TouchableOpacity disabled={false} onPress={() => this.onSelectAddress(item, indexAnswer, this.state.isPermanent, DISTRICT)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                          <Icon type='font-awesome-5' name="map-pin" size={16} color={appcolor.dark} />
                          <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  }} />
              </View>
              <View key={3} style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                  <TouchableOpacity onPress={() => this.onSwipe(-1)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="chevron-left" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: appcolor.dark }}>{TOWN}</Text>
                  <TouchableOpacity onPress={() => this.onOpenModalAddress(false)} style={{ padding: 15, }}>
                    <Icon type='font-awesome-5' name="times" size={20} color={appcolor.dark} />
                  </TouchableOpacity>
                </View>
                <FormGroup iconName="search" editable={true} value={this.state.dataModalAddress?.searchTown || ''} placeholder="Tìm kiếm..." handleChangeForm={(e) => this.onFilterModalAddress(e, 'searchTown', 'dataTown')} stateName="search" />
                <FlatList data={this.state.dataModalAddress?.dataTown || []}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => {
                    const indexAnswer = 3
                    const answerAddressItem = this.state.currentBS?.itemParent?.anwserItem?.[indexAnswer] || {}
                    const isSelected = answerAddressItem?.anwserValue === item.name
                    return (
                      <View key={index} style={{ margin: 5, }}>
                        <TouchableOpacity disabled={false} onPress={() => this.onSelectAddress(item, indexAnswer, this.state.isPermanent, TOWN)} style={{ backgroundColor: isSelected ? appcolor.darklight : 'transparent', flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                          <Icon type='font-awesome-5' name="compass" size={16} color={appcolor.dark} />
                          <Text style={{ fontSize: 16, marginLeft: 10, color: appcolor.dark }}>{item.name}</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  }} />
              </View>
            </Swiper>
          </SafeAreaView>
        </Modal>
      </View >
    )
  }
}
var stylesGradient = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  linearGradient: {
    flex: 1,
    borderWidth: 0,
    marginTop: -5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  viewSelect: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    shadowColor: DEFAULT_COLOR,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    shadowOffset: {
      width: 0,
      height: 3
    },
    elevation: 5,
  },
  viewNotSelect: {
    backgroundColor: '#ffffff'
  }
});
function mapStateToProps(state) {
  return {
    userInfo: state.GAppState.userinfo,
    appcolor: state.GAppState.appcolor
  }
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile);

// Control Render Input
const RenderFormGroup = ({ title, inputRef, state, baseState, stateName, index, editable = true, lastInput, returnKeyType = "next", onSubmitEditing, handleChangeForm, keyboardType, handleDisplayBS, iconRight, typeBS, placeholder, multiline = false }) => {
  // title == 'Chức vụ' && 
  const onChange = (text) => {

    // if (text) {
    //   console.log(text, 'check value2');
    handleChangeForm(text, stateName, baseState)
    // }
  }
  const onSubmit = () => {
    onSubmitEditing(index, lastInput)
  }
  const onRightFunc = () => {
    handleDisplayBS(true, typeBS, stateName, baseState)
  }
  const isDisplayBS = typeof handleDisplayBS === 'function'
  const valueItem = (typeBS == 'DATE' || stateName == 'workingDate') ? Moment(state?.[baseState]?.[stateName]?.toString()).format('YYYY-MM-DD') : state?.[baseState]?.[stateName]?.toString() || ""
  return (
    <FormGroup title={title} value={valueItem} handleChangeForm={onChange} editable={editable}
      index={index} inputRef={inputRef} onSubmitEditing={onSubmit} blurOnSubmit={false} useClearAndroid={false}
      keyboardType={keyboardType} iconRight={isDisplayBS ? iconRight : null}
      rightFunc={isDisplayBS ? onRightFunc : null} multiline={multiline}
      returnKeyType={returnKeyType} placeholder={placeholder} />
  )
}
const RenderCalendarBS = ({ appcolor, currentBS, onSelect, handleDisplayBS, }) => {
  const [date, setDate] = useState(new Date(currentBS.selectedDay))
  const onSeleted = async () => {
    if (Moment(date).isAfter(Moment())) {
      alertWarning("Ngày chọn không được lớn hơn ngày hiện tại!")
      return
    }
    await handleDisplayBS(false)
    await onSelect(Moment(date).format("YYYY-MM-DD"), currentBS.stateName, currentBS.baseState)
  }
  const onDateChange = async (event) => {
    await setDate(event)
    await onSelect(Moment(event).format("YYYY-MM-DD"), currentBS.stateName, currentBS.baseState)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, overflow: 'hidden' }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark }}>Chọn ngày</Text>
        <TouchableOpacity onPress={onSeleted}>
          <Icon color={appcolor.dark} type='font-awesome-5' name="times" size={22} />
        </TouchableOpacity>
      </View>
      <DatePicker maximumDate={new Date()} style={{ width: deviceWidth }}
        textColor={appcolor.dark}
        mode="date" date={date} onDateChange={onDateChange} />
    </View>
  )
}
const RenderGenderBS = ({ appcolor, onSelect, handleDisplayBS, }) => {
  const onSelectGender = async (id, value) => {
    await onSelect(id, 'gender', 'employeeData')
    await onSelect(value, 'genderNameVN', 'employeeData')
    await handleDisplayBS(false)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, padding: 10, overflow: 'hidden', }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', }}>Chọn giới tính</Text>
        <TouchableOpacity onPress={() => handleDisplayBS(false)}>
          <Icon color={appcolor.dark} type='font-awesome-5' name="times" size={22} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => onSelectGender(2, 'Nam')} style={{ padding: 20, }}>
          <Text style={{ fontSize: 17, color: appcolor.dark }}>Nam</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelectGender(1, 'Nữ')} style={{ padding: 20, }}>
          <Text style={{ fontSize: 17, color: appcolor.dark }}>Nữ</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
const RenderSizeUniformBS = ({ appcolor, onSelect, handleDisplayBS, }) => {
  const onSelectSize = async (value) => {
    await onSelect(value, 'uniform', 'employeeData')
    await handleDisplayBS(false)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, overflow: 'hidden', }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark }}>Chọn size quần áo</Text>
        <TouchableOpacity onPress={() => handleDisplayBS(false)}>
          <Icon color={appcolor.dark} type='font-awesome-5' name="times" size={22} />
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          scrollEnabled={true}
          style={{}}
          keyExtractor={(_, index) => index.toString()}
          data={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']}
          renderItem={({ item, index }) => (
            <TouchableOpacity key={index} onPress={() => onSelectSize(item)} style={{ padding: 20, }}>
              <Text style={{ fontSize: 17, color: appcolor.dark }}>{item}</Text>
            </TouchableOpacity>
          )} />
      </View>
    </View>
  )
}
const RenderBankBS = ({ appcolor, onSelect, handleDisplayBS, banksName, employeeData, onFilterContentBS, }) => {
  const onSelectBank = async (item) => {
    await onSelect(item?.bankName || null, 'bankBrand', 'employeeData')
    await onSelect(item?.bankName || null, 'bankName', 'employeeData')
    await onSelect(item?.id || null, 'bankId', 'employeeData')
    await handleDisplayBS(false)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, overflow: 'hidden', marginBottom: 100, }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', }}>Chọn ngân hàng</Text>
        <TouchableOpacity onPress={() => handleDisplayBS(false)}>
          <Icon type='font-awesome-5' color={appcolor.primary} name="times" size={22} />
        </TouchableOpacity>
      </View>
      <FormGroup iconName="search" editable={true}
        placeholder="Tìm kiếm..." handleChangeForm={onFilterContentBS} stateName="search" />
      <FlatList
        scrollEnabled={true}
        style={{ backgroundColor: appcolor.light, marginBottom: 50 }}
        keyExtractor={(_, index) => index.toString()}
        data={banksName}
        renderItem={({ item, index }) => {
          const isSelected = employeeData?.bankId === item.id
          return (
            <TouchableOpacity key={index} onPress={() => onSelectBank(item)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#e3e3e3',
                backgroundColor: isSelected ? appcolor.primary : appcolor.transparent,
              }}>
              <Text style={{ color: appcolor.dark, padding: 7 }}>{item.bankName}</Text>
              {isSelected && (
                <TouchableOpacity onPress={() => onSelectBank(null)}>
                  <Icon type='font-awesome-5' name="backspace" size={18} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )
        }} />
    </View>
  )
}
const RenderProvinceBS = ({ appcolor, onSelect, handleDisplayBS, employeeData, onFilterContentBS, provinceList, }) => {
  const onSelectBank = async (value) => {
    await onSelect(value, 'identityCardBy', 'employeeData')
    await handleDisplayBS(false)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, overflow: 'hidden', marginBottom: 100, }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark }}>Chọn Tỉnh</Text>
        <TouchableOpacity onPress={() => handleDisplayBS(false)}>
          <Icon type='font-awesome-5' name="times" size={22} />
        </TouchableOpacity>
      </View>
      <FormGroup iconName="search" editable={true} placeholder="Tìm kiếm..."
        handleChangeForm={onFilterContentBS} stateName="search" />
      <FlatList
        scrollEnabled={true}
        style={{ backgroundColor: appcolor.light, marginBottom: 50 }}
        keyExtractor={(_, index) => index.toString()}
        data={provinceList}
        renderItem={({ item, index }) => {
          const isSelected = employeeData?.identityCardBy === item.Province
          return (
            <TouchableOpacity key={index} onPress={() => onSelectBank(item.Province)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10,
                borderBottomWidth: 1, borderBottomColor: appcolor.darklight, backgroundColor: isSelected ? appcolor.primary : 'transparent',
              }}>
              <Text style={{ color: appcolor.dark }}>{item.Province}</Text>
              {isSelected && (
                <TouchableOpacity onPress={() => onSelectBank(null)}>
                  <Icon color={appcolor.dark} type='font-awesome-5' name="backspace" size={18} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )
        }} />
    </View>
  )
}
const RenderPlaceIssued = ({ appcolor, onSelect, handleDisplayBS, employeeData, onFilterContentBS, provinceList, }) => {
  const onSelectBank = async (value) => {
    await onSelect(value, 'identityCardBy', 'employeeData')
    await handleDisplayBS(false)
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, overflow: 'hidden', marginBottom: 100, }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: appcolor.dark }}>Chọn nơi cấp</Text>
        <TouchableOpacity onPress={() => handleDisplayBS(false)}>
          <Icon type='font-awesome-5' name="times" size={22} />
        </TouchableOpacity>
      </View>
      {/* <FormGroup iconName="search" editable={true} placeholder="Tìm kiếm..."
        handleChangeForm={onFilterContentBS} stateName="search" /> */}
      <FlatList
        scrollEnabled={true}
        style={{ backgroundColor: appcolor.light, marginBottom: 50 }}
        keyExtractor={(_, index) => index.toString()}
        data={provinceList}
        renderItem={({ item, index }) => {
          const isSelected = employeeData?.identityCardBy === item.name
          return (
            <TouchableOpacity key={index} onPress={() => onSelectBank(item.name)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10,
                borderBottomWidth: 1, borderBottomColor: appcolor.darklight, backgroundColor: isSelected ? appcolor.primary : 'transparent',
              }}>
              <Text style={{ color: appcolor.dark }}>{item.name}</Text>
              {isSelected && (
                <TouchableOpacity onPress={() => onSelectBank(null)}>
                  <Icon color={appcolor.dark} type='font-awesome-5' name="backspace" size={18} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )
        }} />
    </View>
  )
}
const RenderAddress = ({ appcolor, item, isSubmitted, onOpenModalAddress, isPermanent }) => {
  const provinceValue = item !== null ? isPermanent ? (!!item.permanentProvince ? item.permanentProvince : PROVINCE) : (!!item.addressProvince ? item.addressProvince : PROVINCE) : PROVINCE
  const districtValue = item !== null ? isPermanent ? (!!item.permanentDistrict ? item.permanentDistrict : DISTRICT) : (!!item.addressDistrict ? item.addressDistrict : DISTRICT) : DISTRICT
  const townValue = item !== null ? isPermanent ? (!!item.permanentTown ? item.permanentTown : TOWN) : (!!item.addressTown ? item.addressTown : TOWN) : TOWN

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light, paddingBottom: 8, paddingTop: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderRadius: 8, borderColor: appcolor.surface }}>
      <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 0, isPermanent, PROVINCE, item)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1.2, borderEndWidth: 1, borderColor: appcolor.greydark }}>
        <Icon type='font-awesome-5' name="map-marker-alt" size={16} color={appcolor.dark} style={{ marginStart: 8 }} />
        <Text style={{ fontSize: 14, color: appcolor.dark, textAlign: "center", flex: 1 }}>{provinceValue}</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 1, isPermanent, DISTRICT, item)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderEndWidth: 1, borderColor: appcolor.greydark }}>
        <Icon type='font-awesome-5' name="map-pin" size={16} color={appcolor.dark} style={{ marginStart: 8 }} />
        <Text style={{ fontSize: 14, color: appcolor.dark, textAlign: 'center', flex: 1 }}>{districtValue}</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={isSubmitted} onPress={() => onOpenModalAddress(true, 2, isPermanent, TOWN, item)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Icon type='font-awesome-5' name="compass" size={16} color={appcolor.dark} style={{ marginStart: 8 }} />
        <Text style={{ fontSize: 14, color: appcolor.dark, textAlign: 'center', flex: 1 }}>{townValue}</Text>
      </TouchableOpacity>
    </View>
  )
} 
