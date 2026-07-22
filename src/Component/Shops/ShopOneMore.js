import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Platform, TouchableOpacity, RefreshControl, Linking } from "react-native";
import { scaleSize } from "../../Themes/AppsStyle";
import { Image, Divider, Icon } from '@rneui/themed';
import { getStoreList } from "../../Controller/WorkController"
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux'
import { URLDEFAULT } from "../../Core/URLs";
import LottieView from 'lottie-react-native';
import { MessageInfo, MessageSetting, ToastSuccess, ToastError, distanceBetween2Points } from "../../Core/Helper";
import Geolocation from '@react-native-community/geolocation';
import { check, RESULTS, PERMISSIONS, request, openSettings } from 'react-native-permissions'
//import { ACTION } from '../../Core/ReduxController';
import { AttendantController } from "../../Controller/AttendantController";
import ActionSheet from "react-native-actions-sheet";
// import NumberFormat from "react-number-format";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deviceWidth } from "../../Core/Utility";
import { ATTENDANT_API } from "../../API/AttendantAPI";
const ShopOneMore = ({ shops, navigation }) => {
    const { appcolor, userinfo, } = useSelector(state => state.GAppState);
    const [shoplist, setShopList] = useState([]);
    const [loading, setLoading] = useState(false)
    const [myLocation, setMyLocation] = useState({});
    const [isTimeoutLocation, setTimeOutGPS] = useState(false)
    const dispatch = useDispatch();
    const _sheetWork = useRef()
    useEffect(() => {
        dispatch({ type: ACTION.SELECT_SHOP, shopinfo: null })
        const _load = LoadData('')
        const _loadcation = getLocationUserFast();
        const _check = CheckLocation();
        return () => {
            return {
                _load,
                _loadcation,
                _check,
            }
        }
    }, [shops])
    LoadData = async (search) => {
        const Today = parseInt(moment().format('YYYYMMDD'));
        const lst = await getStoreList(search, Today);
        await setShopList(lst)
    }
    RequestLocation = (setStatus) => {
        try {
            request(
                Platform.select({
                    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                })
            ).then(res => {
                if (res === RESULTS.GRANTED) {
                    setStatus(true)
                }
                else {
                    setStatus(false)
                }
            });
        } catch (error) {
            // //console.log("location set error:", error);
        }
    }
    CheckLocation = () => {
        check(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then((result) => {
                // console.log(result, "CheckLocation")
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        RequestLocation((res) => res === true)
                        break;
                    case RESULTS.DENIED:
                        RequestLocation((res) => res === true)
                        break;
                    case RESULTS.GRANTED:
                        getLocationUserFast()
                        break;
                    case RESULTS.BLOCKED:
                        MessageSetting('Chú ý', Platform.OS === 'ios' ? 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị, Privacy -> Location Services-> Location Services(ON)' : 'Vui lòng cho phép chức năng vị trí trong phần cài đặt của thiết bị', () => {
                            Platform.OS === 'ios' ? Linking.openURL("App-Prefs:root=Privacy&path=LOCATION") :
                                openSettings().catch(() => ToastError('cannot open settings'));;
                        })
                        break;
                }
            })
            .catch((error) => {
                // alert(error+'')
            });
    }
    getLocationUserFast = async () => {
        await Geolocation.getCurrentPosition(async info => {
            await setMyLocation(info.coords)
            await setTimeOutGPS(isTimeoutLocation)
        }, (error) => ToastError(error.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }
    uploadWorkingStatus = async (type) => {

        let datetimeGMT = new Date() + '';
        if (datetimeGMT.indexOf('GMT+0700') <= -1) {
            await MessageInfo('Sai múi giờ. Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy')
            return
        } else {
            const requestInfo = {
                "shopCode": type,
                "latlong": `${myLocation.latitude},${myLocation.longitude}`,
                "address": myLocation.address
            }
            const result = await ATTENDANT_API.StartStopWork(requestInfo);
            if (result.statusId === 200) {
                const mes = type === "1" ? "Chúc bạn ngày mới làm việc vui vẻ" : "Hôm nay, bạn đã hoàn thành công việc của mình"
                await ToastSuccess(mes, "Thông báo", "top")
                await LoadData('');
            }
            else
                await ToastError("Lỗi chưa thực hiện được", "Error", "top");
        }
    }
    onItemPress = (item) => {
        dispatch({ type: ACTION.SELECT_SHOP, shopinfo: item })
        AsyncStorage.getItem("ATTENDANT").then(value => {
            const lastTime = value !== undefined && value !== null ? parseInt(value) : 0
            const currentHour = parseInt(moment().format("HH"))
            if (currentHour - lastTime > 1)//Đồng bộ dữ liệu sau 1 tiếng
                AttendantController.SyncFromServer({ "shopId": item.shopId, "workDate": item.auditDate })
            else {
                console.log("don't sync", value)
            }
        })
        navigation.navigate('ShopPage', { shopInfo: item });
    }
    renderItem = ({ item, index }) => {
        const _distant = item.latitude > 0 && myLocation?.latitude > 0 ? distanceBetween2Points(myLocation.latitude, myLocation.longitude, item.latitude, item.longitude) : null
        const sourceImage = item.imageUrl !== null && item.imageUrl.indexOf('file://') === - 1 ? URLDEFAULT + item.imageUrl : item.imageUrl
        return (
            index < 2 ?
                <View key={"shoddp-" + index.toString()}
                    style={{ marginLeft: 7, marginRight: 7, borderRadius: 12, }}>
                    <TouchableOpacity onPress={() => onItemPress(item)}>
                        <View style={{ borderRadius: 20, borderColor: appcolor.surface, borderWidth: 1.7, width: deviceWidth * .8 }}>
                            {sourceImage !== null ?
                                <Image
                                    source={{ uri: sourceImage }}
                                    style={{ borderRadius: 10, height: deviceWidth * 0.6, resizeMode: 'cover' }}
                                    resizeMethod='resize'
                                /> : <Image
                                    source={require('../../Themes/Images/store.png')}
                                    style={{ borderRadius: 10, height: deviceWidth * 0.6, resizeMode: 'cover' }}
                                    resizeMethod='resize'
                                />
                            }
                            <View style={{
                                borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 7, width: '100%',
                                position: 'absolute', bottom: 2, backgroundColor: appcolor.surface, opacity: 0.9
                            }}>
                                <Text style={{ fontSize: scaleSize(14), fontWeight: '700', color: appcolor.dark }}>{item.title}</Text>
                                <Text style={{ paddingLeft: 7, color: appcolor.dark }}>{'Mã CH:' + item.shopCode}</Text>
                                <Text numberOfLines={2}
                                    style={{ paddingLeft: 7, color: appcolor.dark, fontSize: scaleSize(12) }}>
                                    {item.address || ""}</Text>
                                <View style={{ flexGrow: 1 }}></View>
                                <Text style={{ paddingLeft: 7, textAlign: 'right', color: appcolor.dark, fontSize: scaleSize(12) }}>
                                    {moment(item.auditDate, "YYYYMMDD").format('dddd D MMMM')}
                                </Text>
                                <NumberFormat key={item.shopId + "-fe"}
                                    displayType="text" prefix={'KM'}
                                    thousandSeparator={true} format='####'
                                    value={_distant}
                                    renderText={(value) => <Text style={{ color: appcolor.danger, textAlign: 'right' }}>{
                                        _distant !== null ? "Khoảng cách ~ " + value + " Km" : 'Chưa xác định được khoảng cách'}
                                    </Text>}
                                />
                            </View>
                            {
                                item.finish > 0 && item.finish % 2 === 0 &&
                                <LottieView
                                    style={{ width: 40, height: 40, position: "absolute", top: 0, left: 0 }}
                                    source={require('../../Themes/Images/check-mark-success.json')}
                                    autoPlay
                                    loop={false}
                                />
                            }
                        </View>
                    </TouchableOpacity>
                </View>
                : index === 2 ?
                    <TouchableOpacity style={{ alignItems: 'center', alignContent: 'center', justifyContent: 'center', padding: 40 }} onPress={() => navigation.navigate("ShopList")}>
                        <Icon raised name='arrow-right' color={appcolor.primary} size={28}
                            style={{ alignItems: 'center' }} />
                        <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 12 }}>Nhiều hơn</Text>
                    </TouchableOpacity> : null
        )
    }
    return (
        <View style={{ width: '100%', backgroundColor: appcolor.light }}>
            <FlatList horizontal
                keyExtractor={(_, index) => index.toString()}
                data={userinfo.employeeId === undefined ? [] : shoplist}
                refreshControl={
                    <RefreshControl
                        title="Cập nhật cửa hàng..."
                        refreshing={loading}
                        titleColor={appcolor.primary}
                        onRefresh={() => LoadData('')} />
                }
                renderItem={renderItem}
            />
            <ActionSheet
                drawUnderStatusBar
                containerStyle={{ backgroundColor: appcolor.surface, padding: 12 }}
                ref={_sheetWork}>
                <View style={{ height: '96%' }}>
                    <View style={{ padding: 12, backgroundColor: appcolor.light }}>
                        <Text style={{ fontSize: scaleSize(18), fontWeight: 'bold', color: appcolor.dark, textAlign: 'center' }}>Hôm nay {moment().format('LLLL')}</Text>
                    </View>
                    <View style={{ width: '100%', padding: 12, alignItems: 'center', position: 'absolute', bottom: 0 }}>
                        <TouchableOpacity onPress={() => _sheetWork?.current?.hide()}>
                            <View style={{ borderColor: appcolor.surface, borderWidth: 1, width: '100%', marginBottom: 7 }} />
                            <Text style={{ textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(18), marginTop: 12 }}>Trở về</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
        </View>
    );
}
export default ShopOneMore;