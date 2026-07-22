import React, { PureComponent } from "react";
import { View, StyleSheet, Image, Text, PermissionsAndroid, Platform, DeviceEventEmitter } from 'react-native'
import ImageZoom from "./ImageZoom";
import { uploadAttendant, uploadPhotoData, InsertPhotosItem, UpdatePhotosDataStatus, UpdatePhotosFileStatus, UpdateUrlPhotosShop, uploadAllDataPhoto } from '../Controller/PhotoController'
import { checkNetwork } from "../Core/Utility";
import { defaultSetting, OnTime, ToastError, ToastSuccess } from '../Core/Helper';
let RNFS = require('react-native-fs');
import { APPNAME, AppNameBuild, EMPLOYEE_TYPE_PHOTO, hpiApp, URLDEFAULT, _competitorName } from "../Core/URLs";
import moment from 'moment';
import { getDistance } from 'geolib'
import { HeaderCustom } from "./HeaderCustom";
import { connect } from 'react-redux'
//import { AppCreateAction } from '../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { LoadingView } from "../Control/ItemLoading/index";
import ViewShot from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { deviceWidth } from "../Themes/AppsStyle";
import AsyncStorage from '@react-native-async-storage/async-storage'

class ImageReview extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isEdited: false,
            showProgress: false,
            photo: this.props.route.params.photo,
            isSaved: false,
            widthViewShot: 0,
            heightViewShot: 0,
            jsonSetting: {},
            countSave: 0,
            isAutoSave: this.props.route?.params?.isAutoSave || false
        }
    }
    async componentDidMount() {
        if (this.state.isAutoSave) {
            await this.setShowProgress(true)
            this.timeOut = await setTimeout(async () => {
                await this.SavePhoto()
            }, 2000)
        } else {
            this.onImageLoaded()
            this.loadJsonSetting()
        }
        const cameraConfig = JSON.parse(this.props.shopinfo?.cameraConfig || '{}')
        this.timeoutView = setTimeout(() => { this.goBackView() }, cameraConfig?.timeOutSave || 30000)
    }
    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    calculatorDistance() {
        var distance = getDistance(
            { latitude: this.state.photo.latitude, longitude: this.state.photo.longitude },
            { latitude: this.props.shopinfo.shopLat, longitude: this.props.shopinfo.shopLong }
        );
        return distance
    }
    SavePhoto = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đóngó thử lại.");
            return
        }
        //
        await this.setState({ isSaved: true })
        let count = this.state.countSave + 1

        if (this.state.photo.photoType === EMPLOYEE_TYPE_PHOTO) {
            await InsertPhotosItem(this.state.photo);
            await this.goBackView()
        } else if (this.state.photo.reportId === 1) {
            const countDate = new Date().getDay();
            let distanceLimit = 0
            let statusDistance = 0
            let configInfo = this.props.shopinfo.config
            if (configInfo != undefined && configInfo != null) {
                let jsonRes = JSON.parse(configInfo)
                distanceLimit = jsonRes.Distance
                statusDistance = jsonRes.statusDistance
            }
            if (this.props.shopinfo.shopLat != null && this.props.shopinfo.shopLong != null && distanceLimit > 0) {
                let distance = this.calculatorDistance();
                if (AppNameBuild === hpiApp) {
                    if (distance > distanceLimit && countDate != 0) // chu nhat
                    {
                        ToastError(` Vị trí của bạn so với vị trí cửa hàng lớn hơn ${distanceLimit}m vui lòng đến gần cửa hàng hơn, Khoảng cách giữa bạn và cửa hàng hiện là: \n\n${distance} Mét\nHay\n${distance / 1000} Kilomet`);
                        return
                    }
                }
                else {
                    if (distance > distanceLimit && statusDistance === 2) // chu nhat
                    {
                        ToastError(` Vị trí của bạn so với vị trí cửa hàng lớn hơn ${distanceLimit}m vui lòng đến gần cửa hàng hơn, Khoảng cách giữa bạn và cửa hàng hiện là: \n\n${distance} Mét\nHay\n${distance / 1000} Kilomet`);
                        return
                    }
                }
            }
            if (count == 1) {
                this.setState({ countSave: count })
                if (this.state?.jsonSetting?.exportAttendant === true) {
                    if (Object.keys(this.props.userinfo).length === 0) {
                        ToastError(`Lỗi khi lấy thông tin nhân viên, vui lòng tải lại dữ liệu!!!`);
                        await this.goBackView()
                        return
                    }
                }
                await OnTime(async () => {
                    await this.setShowProgress(true)
                    await this.state?.jsonSetting?.exportAttendant === true && await this.AttendantScreen();
                    await InsertPhotosItem(this.state.photo);
                    await uploadAttendant(this.state.photo, "TAKE");
                    await this.setShowProgress(false)
                    await this.goBackView()
                })
            }
        } else if (this.state.photo.reportId === -1) {
            await InsertPhotosItem(this.state.photo);
            let resUploadData = await uploadPhotoData(this.state.photo)
            if (resUploadData) {
                await UpdatePhotosDataStatus(this.state.photo.shopId, this.state.photo.photoDate, this.state.photo.photoType);
                await uploadAllDataPhoto([this.state.photo], async () => {
                    await UpdatePhotosFileStatus(this.state.photo.shopId, this.state.photo.photoDate, this.state.photo.photoType);
                    let shopContent = await this.props.GAppState.shopinfo
                    shopContent.imageUrl = this.state.photo.photoPath
                    if (shopContent.latitude == 0 || shopContent.longitude == 0) {
                        await UpdateUrlPhotosShop(this.state.photo.shopId, this.state.photo.photoPath, this.state.photo.latitude, this.state.photo.longitude)
                        shopContent.latitude = this.state.photo.latitude
                        shopContent.longitude = this.state.photo.longitude
                    } else {
                        await UpdateUrlPhotosShop(this.state.photo.shopId, this.state.photo.photoPath, shopContent.latitude, shopContent.longitude)
                    }
                    await this.props.GAppController.SetShopInfo(shopContent)
                    this.goBackView()
                }, () => {
                    ToastError('Gửi File hình ảnh photo overview không thành công. Vui lòng bấm nút refresh trên tấm hình để gửi lại.');
                    this.goBackView()
                })
            }
            else {
                await ToastError('Gửi hình ảnh photo overview không thành công. Vui lòng bấm nút refresh trên tấm hình để gửi lại.');
                await this.goBackView()
            }
        } else {
            await InsertPhotosItem(this.state.photo);
            await this.goBackView()
        }
    }
    AttendantScreen = async () => {
        try {
            const path = await this.refs.viewShot.capture()
            if (Platform.OS === "android") {
                ToastSuccess("Đang tiến hành...");
                const granted = Platform.Version < 33 && await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Yêu cầu quyền",
                        message: "Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục",
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.Version < 33 && Platform.OS === "android") {
                    alert("Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!");
                    return;
                } else {
                    await CameraRoll.save(path, { type: 'photo', album: APPNAME });
                    await ToastSuccess("Lưu ảnh chấm công về thư viện thành công");
                }
            } else {
                await CameraRoll.save(path, { type: 'photo', album: APPNAME },)
                    .then(res => {
                        console.log('***RES**');
                        console.log(res);
                        console.log('***RES**');
                        ToastSuccess("Lưu ảnh chấm công về thư viện thành công");
                    })
                    .catch(error => {
                        console.log('*****');
                        console.log(error);
                        console.log('*****');
                        alert("Lưu ảnh chấm công về thư viện không thành công");
                    });

            }
        } catch (err) {
            console.log(err)
            ToastError("Lỗi, Ứng dụng chưa được cấp quyền");
        }
    }
    goBackView() {
        clearTimeout(this.timeOut)
        clearTimeout(this.timeoutView)
        DeviceEventEmitter.emit('BACK_DATA', this.state.isSaved)
        this.props.navigation.pop();
    }
    loadJsonSetting = async () => {
        const json = await AsyncStorage.getItem("SETTINGS")
        const setting = await JSON.parse(json) || defaultSetting
        await this.setState({ jsonSetting: setting })
    }
    onImageLoaded = async () => {
        Image.getSize(this.state.photo.photoPath, (width, height) => {
            this.setState({
                widthViewShot: deviceWidth,
                heightViewShot: height * (deviceWidth / width)
            });
        }, () => { })
    }
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: this.props.appcolor.black }}>
                <HeaderCustom
                    iconRight='save'
                    leftFunc={() => this.goBackView()}
                    rightFunc={!this.state.isAutoSave && (!this.state.showProgress ? () => this.SavePhoto() : null)}
                />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ViewShot
                        ref="viewShot"
                        style={{ width: this.state.widthViewShot === 0 ? '100%' : this.state.widthViewShot, height: this.state.heightViewShot === 0 ? '80%' : this.state.heightViewShot }}
                        options={{ format: "jpg", quality: 1 }}>
                        <ImageZoom ImagePath={this.state.photo.photoPath} />
                        {this.state.photo.reportId === 1 && this.state.jsonSetting?.exportAttendant === true &&
                            <View style={{
                                position: 'absolute', width: '100%', height: '100%', right: 0, top: 0, bottom: 0, left: 0,
                                justifyContent: "space-between"
                            }}>
                                <View style={{ paddingRight: 10, paddingTop: 5 }}>
                                    <Text style={{ color: 'red', width: '100%', fontWeight: '600', textAlign: 'right', fontSize: 10 }}>
                                        {`${this.props.shopinfo?.address}`}
                                    </Text>
                                    <Text style={{ color: 'red', fontWeight: '600', textAlign: 'right', fontSize: 10 }}>
                                        {`${this.props.shopinfo?.shopName} [${this.props.shopinfo?.shopCode?.toUpperCase()}]`}
                                    </Text>
                                </View>
                                {
                                    (URLDEFAULT.includes("spiral") || URLDEFAULT.includes("sucbat")) &&
                                    <Image
                                        source={require('../Themes/Images/watermark.png')}
                                        resizeMode={"contain"}
                                        style={{ height: 300, width: '100%', opacity: 0.5 }}
                                    />
                                }
                                <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
                                    <Text style={{ color: 'red', width: '100%', fontWeight: '600', fontSize: 10 }}>
                                        {`${(this.state.photo?.photoType % 2 == 0 ? `CheckIn` : 'Check out').toUpperCase()}`}_{`${moment().format('DD/MM/YYYY, h:mm:ss A')}`}
                                    </Text>
                                    <Text style={{ color: 'red', width: '100%', fontWeight: '600', fontSize: 10 }}>
                                        {`[${this.props.userinfo?.employeeCode}] ${this.props.userinfo?.employeeName}`}
                                    </Text>

                                </View>
                            </View>
                        }
                    </ViewShot>
                </View >
                <LoadingView styles={{ zIndex: 100, position: 'absolute', top: '40%', left: 0, right: 0 }}
                    title="Đang gửi hình ảnh... "
                    isLoading={this.state.showProgress}
                />
            </View >
        )
    }
}
const mapStateToProps = (state) => {
    return {
        GAppState: state.GAppState,
        appcolor: state.GAppState.appcolor,
        shopinfo: state.GAppState.shopinfo,
        userinfo: state.GAppState.userinfo,
        kpiinfo: state.GAppState.kpiinfo
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch),
    }
}
export default connect(mapStateToProps, mapDispathToProps)(ImageReview);