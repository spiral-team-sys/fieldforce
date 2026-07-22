import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AttendantController } from "../../../Controller/AttendantController";
import { Text } from '@rneui/themed';
import LottieView from "lottie-react-native";
import { Message, MessageInfo, OnTime, UUIDGenerator } from "../../../Core/Helper";
import { toastError, toastSuccess } from "../../../Utils/configToast";
import { checkNetwork } from "../../../Core/Utility";
import { SheetManager } from "react-native-actions-sheet";
import moment from "moment";
import { deviceHeight } from "../../../Themes/AppsStyle";
import FormGroup from "../../../Content/FormGroup";
import { ATTENDANT_API } from "../../../API/AttendantAPI";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateImageUrl } from "../../../Controller/PhotoController";
import { MultipleShowImage } from "../../../Control/MultipleShowImage";
import { Image } from "react-native";
import { Modal } from "react-native";

export const ScreenWorkingStatus = ({ locationInfo, workingInfo, navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState(null)
    const [_mutate, setMutate] = useState(false)
    const [isNoteEarly, setNoteEarly] = useState(false)
    const [isNoteLate, setNoteLate] = useState(false)
    const [showNoteDone, setShowNoteDone] = useState(false)
    const [isShowImage, setIsShowImage] = useState({ index: 0, visible: false, data: [] })
    const startImageUrl = workingInfo?.start?.imageUrl
    const endImageUrl = workingInfo?.end?.imageUrl

    //
    const getLocation = async () => {
        if (workingInfo.isStartAction && workingInfo.isEndAction)
            return
        //
        await ATTENDANT_API.GetAddressbyGeo(`${locationInfo.latitude},${locationInfo.longitude}`).then(async (address) => {
            await setAddress(address)
        })
    }
    // Handler
    const onUploadWorkingStatus = async (shopCode) => {
        await setLoading(true)
        const requestInfo = {
            "shopCode": shopCode,
            "latlong": `${locationInfo.latitude},${locationInfo.longitude}`,
            "address": address,
            "note": workingInfo.note,
            "noteEarly": workingInfo.noteEarly
        }
        const result = await ATTENDANT_API.StartStopWork(requestInfo);
        if (result.statusId == 200) {
            await DeviceEventEmitter.emit("RELOAD_WORKING_STATUS")
            await SheetManager.hide('workingstatus')
            const message = shopCode === "1" ? "Chúc bạn ngày mới làm việc vui vẻ" : "Hôm nay, bạn đã hoàn thành công việc của mình"
            await toastSuccess("Thông báo", message)
        } else
            await toastError("Error", "Lỗi chưa thực hiện được");
        await setLoading(false)
    }
    const validData = async () => {
        let datetimeGMT = new Date() + '';
        if (datetimeGMT.indexOf('GMT+0700') <= -1) {
            MessageInfo('Sai múi giờ. Vui lòng chỉnh múi giờ ở Việt Nam trong cài đặt của máy')
            return false
        }
        if (address == null || address.length == 0) {
            MessageInfo("Chưa lấy được địa chỉ hiện tại của bạn, Vui lòng kiểm tra và thử lại sau")
            return false
        }
        if ((locationInfo.latitude || 0) == 0 || (locationInfo.longitude || 0) == 0) {
            MessageInfo("Chưa lấy được vị trí hiện tại của bạn, Vui lòng kiểm tra lại vị trí và thử lại sau vài giây")
            return false
        }
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.", "Internet", "top");
            return false
        }
        const startConfig = JSON.parse(workingInfo.start.config || '{}')
        if (!workingInfo.isStartAction && startConfig.isNoteLateStart == 1 && startConfig.minuteLate > 0 && isNoteLate) {
            if (workingInfo.note == null || workingInfo.note?.length == 0) {
                MessageInfo('Bạn đi trễ giờ làm việc, Vui lòng nhập lí do "Đi trễ giờ làm việc"');
                return false
            }
        }


        //
        const endConfig = JSON.parse(workingInfo.end.config || '{}')
        if (workingInfo.isStartAction && !workingInfo.isEndAction) {
            const checkAttendant = await AttendantController.checkHaveAttendant()
            if (!checkAttendant) {
                if ((endConfig.isNoteStop || 0) == 1 && (workingInfo.note == null || workingInfo.note.length == 0)) {
                    MessageInfo(`Vui lòng nhập lí do "Chưa hoàn thành chấm công"`);
                    return false
                }
            }
            // 
            if (endConfig.isNoteEarlyStop == 1) {
                let isResult = true
                if (endConfig.timeEnd && isNoteEarly) {
                    const validTime = moment(endConfig.timeEnd, 'HH:mm:ss')
                    if (workingInfo.noteEarly == null || workingInfo.noteEarly?.length == 0) {
                        MessageInfo(`Bạn kết thúc thời gian làm việc trước ${moment(validTime).format('HH:mm')}, Vui lòng nhập lí do "Kết thúc ngày làm việc sớm" để hoàn thành công việc`);
                        isResult = false
                        return
                    }
                } else {
                    await ATTENDANT_API.validTimeAttendant('OUT', async (itemTime, message) => {
                        message && toastError('Lỗi dữ liệu', message)
                        //
                        if (itemTime.isCheckTimeOut == 1) {
                            const defaultTime = itemTime.timeCheckOut ? moment(itemTime.timeCheckOut) : moment()
                            const validTime = moment(workingInfo.end?.timeOut)
                            //
                            const minuteBetween = defaultTime.diff(validTime, 'minute')
                            if (minuteBetween < 0) {
                                if (workingInfo.noteEarly == null || workingInfo.noteEarly?.length == 0) {
                                    MessageInfo(`Bạn kết thúc thời gian làm việc trước ${moment(validTime).format('HH:mm')}, Vui lòng nhập lí do "Kết thúc ngày làm việc sớm" để hoàn thành công việc`);
                                    isResult = false
                                    return
                                }
                            }
                        }
                    })
                }
                return isResult
            }
        }
        //
        return true
    }
    const handlerPressWork = async () => {
        // Start Work
        if (!workingInfo.isStartAction) {
            handlerWorkingStatus('1')
            return
        }
        // End Work
        if (workingInfo.isStartAction && !workingInfo.isEndAction) {
            const checkShopNotFinish = await AttendantController.getShopNotFinish()
            const shopNotFinish = Array.isArray(checkShopNotFinish) ? checkShopNotFinish : []
            const listText = shopNotFinish.map(it => `${it.shopName}`).join(', ')
            if (workingInfo.isDoneShop && shopNotFinish.length > 0) {
                MessageInfo(`Bạn còn ${shopNotFinish.length} shop chưa chấm công: ${listText}. Vui lòng hoàn thành đầy đủ. Nếu không đi vui lòng tắt shop trong mục lịch làm việc.`)
                return
            } else {
                handlerWorkingStatus('Z')
                return
            }
        }
    }
    const handlerWorkingStatus = async (shopCode) => {
        const _valid = await validData()
        if (!_valid) return
        //
        await OnTime(async () => {
            const titleUpload = shopCode === '1' ? 'Bạn có muốn bắt đầu ngày làm việc không?' : 'Bạn có muốn kết thúc ngày làm việc không?'
            Message('Thông báo', titleUpload, async () => {
                if ((shopCode === '1' && workingInfo.isTakePicture) || (shopCode === 'Z' && workingInfo.isTakePicture)) {
                    let itemPhotoInfo = {
                        shopLat: locationInfo.latitude,
                        shopLong: locationInfo.longitude,
                        latitudePo: locationInfo.latitudePo,
                        longitudePo: locationInfo.longitudePo,
                        accuracyPo: locationInfo.accuracyPo,
                        guiId: UUIDGenerator(),
                        mocked: locationInfo.mocked,
                        shopinfo: {
                            shopId: 0,
                            shopName: 'NONE',
                        },
                        reportId: 0,
                        photoDesc: shopCode === '1' ? 'START' : 'END',
                        photoType: shopCode === '1' ? 'START' : 'END',
                    }
                    const syncListener = DeviceEventEmitter.addListener('RELOAD_PHOTO_ATTENDANT', async (data) => {
                        syncListener.remove()
                        if (data?.photoPath) {
                            await updateImageUrl(itemPhotoInfo.photoType, data.photoPath)
                        }
                        await onUploadWorkingStatus(shopCode)
                    })
                    await SheetManager.hide('workingstatus')
                    navigation.navigate('Camera', itemPhotoInfo)
                } else {
                    await onUploadWorkingStatus(shopCode)
                }
            })
        })
    }
    const onBackAction = () => {
        SheetManager.hide('workingstatus')
    }
    const onNoteChange = (text) => {
        workingInfo.note = text
        setMutate(e => !e)
    }
    const onNoteEarlyChange = (text) => {
        workingInfo.noteEarly = text
        setMutate(e => !e)
    }
    const onNoteLateChange = (text) => {
        workingInfo.note = text
        setMutate(e => !e)
    }

    const onViewAttendantImage = (index) => {
        const list = []
        if (startImageUrl) list.push({ photoPath: startImageUrl, photoDesc: 'Check In' })
        if (endImageUrl) list.push({ photoPath: endImageUrl, photoDesc: 'Check Out' })
        if (list.length === 0) return
        const safeIndex = index < list.length ? index : 0
        isShowImage.visible = true
        isShowImage.data = list
        isShowImage.index = safeIndex
        setMutate(e => !e)
    }

    const handlerValidViewNote = async () => {
        const checkAttendant = await AttendantController.checkHaveAttendant()
        const startConfig = JSON.parse(workingInfo.start.config || '{}')
        const endConfig = JSON.parse(workingInfo.end.config || '{}')
        if (!workingInfo.isStartAction && startConfig.isNoteLateStart == 1 && startConfig.minuteLate > 0) {
            const currentTime = moment()
            const today = moment().format('YYYY-MM-DD')
            const startTime = moment(`${today} ${startConfig.timeStart}`, 'YYYY-MM-DD HH:mm:ss')
            if (startTime.isValid()) {
                const minuteBetween = currentTime.diff(startTime, 'minute')
                setNoteLate(minuteBetween >= startConfig.minuteLate)
            }
        }
        if (!checkAttendant)
            if ((endConfig.isNoteStop || 0) == 1 && (workingInfo.note == null || workingInfo.note.length == 0)) {
                setShowNoteDone(true)
            }

        if (endConfig.timeEnd) {
            const currentTime = moment()
            const today = moment().format('YYYY-MM-DD')
            const endTime = moment(`${today} ${endConfig.timeEnd}`, 'YYYY-MM-DD HH:mm:ss')
            if (endTime.isValid()) {
                const minuteBetween = currentTime.diff(endTime, 'minute')
                setNoteEarly(minuteBetween < 0)
            }
        } else {
            await ATTENDANT_API.validTimeAttendant('OUT', async (itemTime, message) => {
                const defaultTime = moment(itemTime.timeCheckOut)
                const validTime = moment(workingInfo.end?.timeOut)
                //
                const minuteBetween = defaultTime.diff(validTime, 'minute')
                setNoteEarly(minuteBetween < 0)
            })
        }
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        const _load = getLocation()
        const _checkNote = handlerValidViewNote()
        return () => //{isMounted = false}
        {
            _load
            _checkNote
            isMounted = false
        }
    }, [locationInfo])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light },
        viewTitleMain: { width: '100%', justifyContent: 'center', alignItems: 'center', padding: 8 },
        titleView: { fontSize: 18, textAlign: 'center', color: appcolor.dark, fontWeight: '700' },
        titleBackView: { fontSize: 15, textAlign: 'center', color: appcolor.danger, fontWeight: '700' },
        titleContentView: { color: appcolor.light, position: 'absolute', fontWeight: 'bold', textAlign: 'center', width: '100%', fontSize: 18 },
        actionMain: { width: '100%', height: '60%' },
        actionResultMain: { margin: 8, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }, backgroundColor: appcolor.light, elevation: 3, borderRadius: 8, padding: 16 },
        viewActionWorking: { width: '100%', height: '50%', justifyContent: 'center' },
        viewInfo: { width: '100%', height: '50%' },
        titleInfoHead: { fontSize: 16, fontWeight: 'bold', color: appcolor.dark },
        titleInfoContent: { fontSize: 14, color: appcolor.placeholderText, fontWeight: '500' },
        actionBackView: { width: '30%', alignSelf: 'center', marginTop: 32 },
        searchContainer: { margin: 8, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.greylight },
        searchStyle: { fontSize: 13, color: appcolor.dark },
        imageStyle: { width: 150, height: 150, borderRadius: 8, marginTop: 8 },
        titleAttendant: { textAlign: 'center', fontSize: 13, color: appcolor.primary, fontWeight: 'bold', marginTop: 4 },
    })
    const StartUI = () => {
        const startConfig = JSON.parse(workingInfo.start.config || '{}')
        return (
            <View style={styles.actionMain}>
                <View style={styles.viewTitleMain}>
                    <Text style={styles.titleView}>Nhấn "Bắt đầu" để bắt đầu thực hiện công việc</Text>
                </View>
                <TouchableOpacity style={styles.viewActionWorking} onPress={handlerPressWork}>
                    <LottieView autoPlay style={{ height: '80%' }} source={require('../../../Themes/lotties/call.json')} />
                    {loading ? <ActivityIndicator size='small' color={appcolor.light} style={styles.titleContentView} /> : <Text style={styles.titleContentView}>Bắt đầu</Text>}
                </TouchableOpacity>
                <View style={styles.viewInfo}>
                    <View style={{ padding: 6, paddingHorizontal: 20 }}>
                        <Text style={styles.titleInfoHead}>Thông tin</Text>
                        <Text style={styles.titleInfoContent}>{`Ví trí hiện tại: ${address}`}</Text>
                        <Text style={styles.titleInfoContent}>{`Tọa độ: Latitude ${locationInfo.latitude}, Longitude: ${locationInfo.longitude}`}</Text>
                    </View>
                    {startConfig.isNoteLateStart == 1 && startConfig.minuteLate > 0 && !workingInfo.isStartAction && isNoteLate &&
                        <FormGroup
                            editable
                            placeholder='Ghi chú lí do "Đi trễ giờ làm việc"'
                            iconName='comment-alt'
                            defaultValue={workingInfo.note || ''}
                            useClearAndroid={workingInfo.note !== null && workingInfo.note?.length > 0}
                            containerStyle={styles.searchContainer}
                            inputStyle={styles.searchStyle}
                            handleChangeForm={onNoteLateChange}
                            onClearTextAndroid={onNoteLateChange}
                        />
                    }
                </View>
            </View>
        )
    }
    const StartResult = () => {
        return (
            <View style={{ width: '100%', marginTop: 8 }}>
                <View style={styles.actionResultMain}>
                    <Text style={{ ...styles.titleInfoHead, color: appcolor.primary }}>Thông tin điểm bắt đầu</Text>
                    <Text style={styles.titleInfoContent}>{`Địa điểm: ${workingInfo.start?.address || 'Không xác định'}`}</Text>
                    <Text style={styles.titleInfoContent}>{`Thời gian ${moment(workingInfo.start?.timeIn, "YYYYMMDDHHmmss").format('HH:mm - dddd, DD MMMM')}`}</Text>
                </View>

            </View>
        )
    }
    const EndUI = () => {
        const endConfig = JSON.parse(workingInfo.end.config || '{}')
        const endTimeFormat = endConfig?.timeEnd
            ? moment(endConfig.timeEnd, 'HH:mm:ss').format('HH:mm')
            : moment(workingInfo?.end?.timeOut, "YYYYMMDDHHmmss").format('HH:mm')
        return (
            <View style={styles.actionMain}>
                <View style={styles.viewTitleMain}>
                    <Text style={styles.titleView}>Nhấn "Kết thúc" để kết thúc ngày làm việc</Text>
                </View>
                {workingInfo.isTakePicture &&
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 16, }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <TouchableOpacity
                                activeOpacity={workingInfo.start?.imageUrl ? 0.8 : 1}
                                onPress={() => workingInfo.start?.imageUrl && onViewAttendantImage(0)}
                            >
                                <View style={{
                                    borderRadius: 12, overflow: 'hidden', borderColor: appcolor.primary,
                                    shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 4,
                                    backgroundColor: appcolor.greylight
                                }}>
                                    {workingInfo.start?.imageUrl
                                        ? <TouchableOpacity onPress={() => onViewAttendantImage(0)}>
                                            <Image source={{ uri: workingInfo.start.imageUrl }} style={{ width: 150, height: 150 }} resizeMode='cover' />
                                        </TouchableOpacity>
                                        : null
                                    }
                                    <View style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        backgroundColor: appcolor.dark, paddingVertical: 4
                                    }}>
                                        <Text style={styles.titleAttendant}>Check In</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {workingInfo.start?.timeIn
                                ? <Text style={{ fontSize: 11, color: appcolor.primary, marginTop: 4, fontWeight: '600' }}>
                                    {moment(workingInfo.start.timeIn, 'YYYYMMDDHHmmss').format('HH:mm')}
                                </Text>
                                : null
                            }
                        </View>
                    </View>}
                <TouchableOpacity style={styles.viewActionWorking} onPress={handlerPressWork}>
                    <LottieView autoPlay style={{ height: '60%' }} source={require('../../../Themes/lotties/stopwork.json')} />
                    {loading ? <ActivityIndicator size='small' color={appcolor.light} style={styles.titleContentView} /> : <Text style={styles.titleContentView}>Kết thúc</Text>}
                </TouchableOpacity>
                <View style={styles.viewInfo}>
                    <View style={{ padding: 8, paddingHorizontal: 20 }}>
                        <Text style={styles.titleInfoHead}>Thông tin</Text>
                        <Text style={styles.titleInfoContent}>{`Ví trí hiện tại: ${address}`}</Text>
                        <Text style={styles.titleInfoContent}>{`Tọa độ: Latitude ${locationInfo.latitude}, Longitude: ${locationInfo.longitude}`}</Text>
                    </View>
                    {(endConfig.isNoteStop || 0) == 1 && showNoteDone &&
                        <FormGroup
                            editable
                            placeholder='Ghi chú "Chưa hoàn thành chấm công"'
                            iconName='comment-alt'
                            defaultValue={workingInfo.note || ''}
                            useClearAndroid={workingInfo.note !== null && workingInfo.note.length > 0}
                            containerStyle={styles.searchContainer}
                            inputStyle={styles.searchStyle}
                            handleChangeForm={onNoteChange}
                            onClearTextAndroid={onNoteChange}
                        />
                    }
                    {(endConfig.isNoteEarlyStop || 0) == 1 && isNoteEarly &&
                        <FormGroup
                            editable
                            placeholder={`Ghi chú lí do "Kết thúc ngày làm việc sớm hơn ${endTimeFormat}"`}
                            iconName='comment-alt'
                            defaultValue={workingInfo.noteEarly || ''}
                            useClearAndroid={workingInfo.noteEarly !== null && workingInfo.noteEarly?.length > 0}
                            containerStyle={styles.searchContainer}
                            inputStyle={styles.searchStyle}
                            handleChangeForm={onNoteEarlyChange}
                            onClearTextAndroid={onNoteEarlyChange}
                        />
                    }
                </View>
            </View>
        )
    }
    const EndResult = () => {
        return (
            <View style={styles.actionResultMain}>
                <Text style={{ ...styles.titleInfoHead, color: appcolor.primary }}>Thông tin điểm kết thúc</Text>
                <Text style={styles.titleInfoContent}>{`Địa điểm: ${workingInfo.end?.address || 'Không xác định'}`}</Text>
                <Text style={styles.titleInfoContent}>{`Thời gian ${moment(workingInfo.end?.timeIn, "YYYYMMDDHHmmss").format('HH:mm - dddd, DD MMMM')}`}</Text>
            </View>
        )
    }
    return (
        <>
            <ScrollView style={{ width: '100%', height: deviceHeight }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                <SafeAreaView style={styles.mainContainer}>
                    <Text style={{ ...styles.titleInfoHead, textAlign: 'center' }}>{`Hôm nay ${moment().format('LLLL')}`}</Text>
                    {workingInfo.isEndAction &&
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 16 }}>
                            {startImageUrl && <TouchableOpacity style={{ flex: 1, flexDirection: 'column' }} onPress={() => onViewAttendantImage(0)}>
                                <Image
                                    source={{ uri: startImageUrl }}
                                    style={styles.imageStyle}
                                />
                                <Text style={styles.titleAttendant}>CHECKIN</Text>
                            </TouchableOpacity>}
                            {endImageUrl && <TouchableOpacity style={{ flex: 1, flexDirection: 'column' }} onPress={() => onViewAttendantImage(startImageUrl ? 1 : 0)}>
                                <Image
                                    source={{ uri: endImageUrl }}
                                    style={styles.imageStyle}
                                />
                                <Text style={styles.titleAttendant}>CHECKOUT</Text>
                            </TouchableOpacity>}
                        </View>}
                    {!workingInfo.isStartAction ? StartUI() : StartResult()}
                    {workingInfo.isStartAction && (!workingInfo.isEndAction ? EndUI() : EndResult())}
                    <TouchableOpacity style={styles.actionBackView} onPress={onBackAction}>
                        <Text style={styles.titleBackView}>Quay lại</Text>
                    </TouchableOpacity>
                </SafeAreaView>
                <View style={{ width: '100%', height: deviceHeight / 5 }} />
            </ScrollView>
            {isShowImage.visible && isShowImage.data.length > 0 &&
                <Modal
                    visible={isShowImage.visible}
                    animationType='slide'
                    onRequestClose={() => setIsShowImage(e => ({ ...e, visible: false }))}>
                    <MultipleShowImage
                        listItem={isShowImage.data}
                        indexItem={isShowImage.index}
                        closeShowImage={() => setIsShowImage(e => ({ ...e, visible: false }))}
                        isUseTool={false}
                        useDeleteTool={false}
                        useEditImage={false}
                    />
                </Modal>
            }
        </>
    )
}
