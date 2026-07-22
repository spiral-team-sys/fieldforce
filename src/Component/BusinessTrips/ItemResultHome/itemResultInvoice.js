import React, { memo, useEffect, useState } from "react";
import { LayoutAnimation, Platform, ScrollView, TouchableOpacity, UIManager, View } from "react-native";
import { Badge, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { formatNumber, MessageAction, MessageInfo } from "../../../Core/Helper";
import { ACTION_UPLOAD, provinceByAddress } from "../UtilityBusiness";
import { GetDataTripBillsDetail, SaveNextBill, SendInvoice } from "../../../Controller/BussinessTripController"
import { AppNameBuild, aquaApp, hisenApp, hpiApp, lgApp, sharpApp, tefalApp, toshibaApp } from "../../../Core/URLs";
import { ModalNotify } from "../../../Control/ModalNotify";
import { deviceHeight, deviceWidth } from "../../../Core/Utility";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ItemResultInvoice = ({ item, index, ItemView, filterInvoice, handleReloadInvoice, handlerUploadDocument, styles, currentIndexHome }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [note, setNote] = useState(item.note || '')
    const [isVisible, setVisible] = useState(false)
    const [messager, setMessager] = useState('')

    useEffect(() => {
        return () => false
    }, [])
    const supportFood = `Chi phí ăn uống ${item.foodCosts > 0 ? formatNumber(item.foodCosts, ',') : 0} VNĐ`
    const supportHotel = `Chi phí khách sạn ${item.hotelCosts > 0 ? formatNumber(item.hotelCosts, ',') : 0} VNĐ`
    const supportKM = (AppNameBuild == hpiApp ? `Chi phí di chuyển máy bay ${item.supportKMCosts > 0 ? formatNumber(item.supportKMCosts, ',') : 0} VNĐ` : `Chi phí di chuyển ${AppNameBuild == lgApp ? '' : 'Km '}${item.supportKMCosts > 0 ? formatNumber(item.supportKMCosts, ',') : 0} VNĐ`)
    const supportKMCosts = (AppNameBuild == hisenApp || AppNameBuild == toshibaApp || AppNameBuild == sharpApp || AppNameBuild == hpiApp) ? `Chi phí di chuyển ${item.moveCosts > 0 ? formatNumber(item.moveCosts, ',') : 0} VNĐ` :
        (AppNameBuild == tefalApp ? `Chi phí thuê xe ${item.moveCosts > 0 ? formatNumber(item.moveCosts, ',') : 0} VNĐ` :
            `Chi phí di chuyển khác ${item.moveCosts > 0 ? formatNumber(item.moveCosts, ',') : 0} VNĐ`)
    const supportOther = `Chi phí khác ${item.otherCosts > 0 ? formatNumber(item.otherCosts || 0, ',') : 0} VNĐ`
    const supportWork = `${AppNameBuild == lgApp ? `Chi phí phụ cấp ` : 'Chi phí tiếp khách '}${item.workCosts > 0 ? formatNumber(item.workCosts || 0, ',') : 0} VNĐ`
    const provincePlan = `${item.provinceFrom}${!item.districtFrom ? '' : `(${item.districtFrom})`} - ${item.provinceTo}${!item.districtTo ? '' : `(${item.districtTo})`}`
    const listProvinceWork = JSON.parse(item.provinceList) || []
    const totalSupport = `Tổng chi phí ${item.totalCosts > 0 ? formatNumber(item.totalCosts || 0, ',') : 0} VNĐ`
    const statusItem = `Trạng thái : ${item.statusName || ''}`
    const confirmNote = `Quản trị viên ghi chú : ${item.confirmNote || ''}`

    const onShowInvoice = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const dataDetail = await GetDataTripBillsDetail(item.detailId)
        const jsonDetail = dataDetail[0]
        await handlerUploadDocument(jsonDetail, item, currentIndexHome)
    }
    const onSubmitItem = async () => {
        const dataUpload = { detailId: item.detailId, note: note }
        const dataDetail = await GetDataTripBillsDetail(item.detailId)
        const jsonDetail = dataDetail[0]
        const fileFoodCosts = JSON.parse((JSON.parse(jsonDetail.foodCosts || '[]')[0].billFile) || '[]').length
        const fileHotelCosts = JSON.parse((JSON.parse(jsonDetail.hotelCosts || '[]')[0].billFile) || '[]').length
        const fileMoveCosts = JSON.parse((JSON.parse(jsonDetail.moveCosts || '[]')[0].billFile) || '[]').length
        const fileOtherCosts = JSON.parse((JSON.parse(jsonDetail.otherCosts || '[]')[0].billFile) || '[]').length
        const fileSupportKMCosts = JSON.parse((JSON.parse(jsonDetail.supportKMCosts || '[]')[0].billFile) || '[]').length
        if (fileFoodCosts == 0 && fileHotelCosts == 0 && fileMoveCosts == 0 && fileOtherCosts == 0 && fileSupportKMCosts == 0) {
            MessageAction('Chuyến đi chưa được đính kèm hóa đơn bạn có muốn tiếp tục gửi?', () => uploadAction(dataUpload, 'submit', 'Gửi xác nhận'))
            return
        }
        MessageAction('Bạn có chắc chắn muốn gửi xác nhận là đã gửi hết chứng từ?', () => uploadAction(dataUpload, 'submit', 'Gửi xác nhận'))
    }
    const uploadAction = async (dataUpload, sendType, messageText) => {
        const result = await SendInvoice(JSON.stringify({ ...dataUpload, "sendType": sendType }))
        if (result.statusId === 200) {
            handleReloadInvoice()
            MessageInfo(`${messageText} thành công!`)
        } else {
            MessageInfo(`Xảy ra lỗi khi ${messageText} chứng từ`)
        }
    }
    const onNextTrim = () => {
        const dataUpload = {
            "note": note,
            "typeNext": "trip",
            "month": filterInvoice.month,
            "year": filterInvoice.year,
            "billInfoId": item.billInfoId,
            "detailId": item.detailId
        }
        MessageAction(`Bạn chắc chắn muốn chuyển sang kỳ sau?`, async () => {
            const result = await SaveNextBill(JSON.stringify(dataUpload))
            if (result.statusId === 200) {
                if (result.data[0]?.status === 200) {
                    MessageInfo(`Cập nhật chuyển kỳ sau thành công!`)
                    handleReloadInvoice()
                } else if (result.status === 500) {
                    MessageInfo(result.message)
                }
            } else {
                MessageInfo(`Xảy ra lỗi khi chuyển kỳ sau!`)
            }
        })
    }
    const onCancelItem = () => {
        if (note.length == 0 || note == undefined || note == null) {
            MessageInfo(`Bạn chưa nhập ghi chú khi bỏ quyết toán!`)
            return
        }
        if (note.length < 5) {
            MessageInfo(`Ghi chú phải lớn hơn 5 kí tự`)
            return
        }
        const dataUpload = { detailId: item.detailId, note: note }
        MessageAction('Bạn chắc chắn muốn bỏ quyết toán?', () => uploadAction(dataUpload, 'cancel', 'Bỏ quyết toánn'))
    }
    const handleChangeNote = (text) => {
        setNote(text)
    }
    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }
    const onPressPoint = async () => {
        let pointUI = []

        for (let index = 0; index < listProvinceWork.length; index++) {
            const element = listProvinceWork[index];
            pointUI.push(
                <View key={'ViewPoint_' + element.id} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                        <Text style={{ width: (element.addressPoint == null || element.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (element.addressPoint == null || element.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {element.id + 1}</Text>
                        {
                            (element.distance !== null && element.distance > 0) &&
                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{element.distanceText}</Text>
                            </View>
                        }
                    </View>
                    {
                        (element.addressPoint !== null && element.addressPoint !== '') &&
                        <View style={{ width: '100%', borderRadius: 4 }}>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.addressPoint}</Text>}</Text>
                            </View>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Vị trí :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.locationPoint}</Text>}</Text>
                            </View>
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Thông tin lưu trú : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Đêm lưu trú : {element.numberDay || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Ngày ăn : {element.eatDay || 0}</Text>}</Text>
                            </View>
                        </View>
                    }
                </View>
            )
        }
        await setMessager(<View style={{ height: deviceHeight * 0.3, width: deviceWidth * 0.8 }}>
            <ScrollView style={{ flex: 1 }} >
                {pointUI}
            </ScrollView>
        </View>)
        await handleVisibleModal(true)
    }

    const onPressStage = async () => {
        let pointUI = []
        for (let index = 0; index < listProvinceWork.length; index++) {
            const element = listProvinceWork[index];
            pointUI.push(
                <View key={`ViewPoint_${element.workDate}_${element.provinceTo}_${element.addressPoint}`} style={{ borderRadius: 8, backgroundColor: appcolor.surface, padding: 4, marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: "center" }}>
                        {element.id !== null && element.id >= 0 && <Text style={{ width: (element.addressPoint == null || element.addressPoint == '') ? '100%' : '50%', fontWeight: '600', fontSize: 12, color: (element.addressPoint == null || element.addressPoint == '') ? appcolor.tomato : appcolor.dark, paddingHorizontal: 4 }}>Điểm {element.id + 1}</Text>}
                        {element.workDate && <Text style={{ width: '100%', fontWeight: '600', fontSize: 12, color: appcolor.tomato, paddingHorizontal: 4 }}>Ngày đi {element.workDate}</Text>}
                        {
                            (element.distance !== null && element.distance > 0) &&
                            <View style={{ justifyContent: "center", padding: 4, backgroundColor: appcolor.light, borderRadius: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.primary }}>Khoảng cách ~{element.distanceText}</Text>
                            </View>
                        }
                    </View>
                    <View style={{ width: '100%', borderRadius: 4 }}>
                        {
                            (element.addressPoint !== null || element.shopVisit !== null) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Địa chỉ :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.addressPoint || element.shopVisit}</Text>}</Text>
                            </View>
                        }
                        {
                            (element.provinceTo !== null) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: element.addressPoint !== null ? appcolor.dark : appcolor.tomato }}>Tỉnh đến :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.provinceTo}</Text>}</Text>
                            </View>
                        }
                        {
                            ((element.amountHotel != null && element.amountHotel >= 0) ||
                                (element.amountAllowance != null && element.amountAllowance >= 0) ||
                                (element.amountTransport != null && element.amountTransport >= 0)) &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 2 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.dark }}>Chi phí : {<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Khách sạn : {formatNumber(element.amountHotel, ',') || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Phụ cấp : {element.amountAllowance || 0} | </Text>}{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Di chuyển : {element.amountTransport || 0}</Text>}</Text>
                            </View>
                        }
                        {
                            (element.remark !== null && element.remark !== '') &&
                            <View style={{ width: '100%', flexDirection: "row", paddingHorizontal: 4, paddingBottom: 4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 12, color: appcolor.tomato }}>Ghi chú :{<Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{element.remark}</Text>}</Text>
                            </View>
                        }
                    </View>
                </View>
            )
        }
        await setMessager(<View style={{ height: deviceHeight * 0.3, width: deviceWidth * 0.8 }}>
            <ScrollView style={{ flex: 1 }} >
                {pointUI}
            </ScrollView>
        </View>)
        await handleVisibleModal(true)
    }
    return (
        <View key={`int))_${index}`} style={{ width: '100%', paddingStart: 5, paddingEnd: 5, alignSelf: 'center', }}>
            <View style={styles.itemTrips}>
                <View >
                    <ItemView styleView={{ ...styles.titleView, width: '92%' }} value={`Từ ${item.fromDate} Đến ${item.toDate}`} iconName='calendar-alt' />
                    {
                        item.isUsePoint == 1 && listProvinceWork.length > 0 ?
                            <View >
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                                    <TouchableOpacity onPress={() => (AppNameBuild == lgApp ? onPressStage() : onPressPoint())} style={{ padding: 4, backgroundColor: appcolor.light, borderRadius: 8 }}>
                                        <Text key={`NumPoint`}
                                            style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
                                            {`Tổng số điểm đến : ${listProvinceWork.length}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    contentContainerStyle={{ padding: 5 }}
                                    style={{ alignSelf: 'center', width: '100%' }}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    nestedScrollEnabled
                                >
                                    {(item.provinceFrom !== null && item.provinceFrom !== undefined) &&
                                        <Text key={`iib_${index}`} style={styles.titleView}>
                                            {(provinceByAddress(item.provinceFrom)).province || ''} -
                                        </Text>
                                    }

                                    {listProvinceWork.map((item, index) => {
                                        return (
                                            <Text key={`iib_${index}`} style={styles.titleView}>
                                                {`${index > 0 ? ' -' : ''} ${item.provinceName} (${AppNameBuild == aquaApp ? item.numberStore : item.numberDay})`}
                                            </Text>
                                        )
                                    })}
                                </ScrollView>
                            </View>
                            :
                            (listProvinceWork.length > 0 ?
                                (
                                    AppNameBuild == lgApp ? <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                                        <TouchableOpacity onPress={() => onPressStage()} style={{ padding: 4, backgroundColor: appcolor.light, borderRadius: 8 }}>
                                            <Text key={`NumPoint`}
                                                style={{ ...styles.titleDateLine, color: appcolor.info, fontSize: 15 }}>
                                                {`Xem các điểm đến : ${listProvinceWork.length}`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View> : <ScrollView
                                        contentContainerStyle={{ padding: 5 }}
                                        style={{ alignSelf: 'center', width: '100%' }}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        nestedScrollEnabled
                                    >
                                        {listProvinceWork.map((item, index) => {
                                            return (
                                                <Text key={`iib_${index}`} style={styles.titleView}>
                                                    {`${index > 0 ? ' -' : ''} ${item.provinceName}${!item.district ? '' : `(${item.district})`} (${item.numberDay})`}
                                                </Text>
                                            )
                                        })}
                                    </ScrollView>
                                )
                                :
                                <ItemView styleView={{ ...styles.titleView, width: '92%' }} value={provincePlan} iconName='plane-departure' />
                            )
                    }

                    {/* <ItemView styleView={[styles.contentView, { color: item.colorHightlight || appcolor.dark, fontWeight: "600" }]} value={statusItem} iconName='info-circle' /> */}
                    {(AppNameBuild !== lgApp) && <ItemView styleView={styles.contentView} value={supportFood} iconName='utensils' />}
                    {(AppNameBuild !== hisenApp && AppNameBuild !== toshibaApp && AppNameBuild !== sharpApp) && <ItemView styleView={styles.contentView} value={supportKM} iconName='road' />}
                    {(AppNameBuild !== lgApp) && <ItemView styleView={styles.contentView} value={supportKMCosts} iconName='road' />}
                    <ItemView styleView={styles.contentView} value={supportHotel} iconName='hotel' />
                    {item.workCosts !== 0 && item.workCosts && <ItemView styleView={styles.contentView} value={supportWork} iconName='road' />}
                    {(AppNameBuild !== toshibaApp && AppNameBuild !== sharpApp && AppNameBuild !== tefalApp && AppNameBuild !== lgApp) && <ItemView styleView={styles.contentView} value={supportOther} iconName='road' />}
                    <ItemView styleView={styles.contentView} value={totalSupport} iconName='money-bill' />
                    {item.confirmNote?.length > 0 && <ItemView styleView={{ ...styles.contentView, width: '90%' }} value={confirmNote} iconName='comment-alt' />}
                </View>
                {
                    (item.isCanCancel == 1 || item.isCanNext == 1 || item.isCanSubmit == 1) &&
                    <FormGroup
                        containerStyle={{ padding: 3, marginTop: 5, backgroundColor: appcolor.light }}
                        inputStyle={{ fontSize: 13 }}
                        editable={true}
                        value={note || ''}
                        title={`Ghi chú`}
                        placeholder='Nhập ghi chú'
                        iconName={'comment-alt'}
                        onClearTextAndroid={handleChangeNote}
                        handleChangeForm={handleChangeNote}
                    />
                }
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', paddingEnd: 8 }}>
                <View style={{ flexDirection: 'row', end: 0 }}>
                    {item.isCanCancel == 1 && item.isCancelInView == 1 &&
                        <ActionPress
                            title='Bỏ quyết toán'
                            type={ACTION_UPLOAD.CANCEL}
                            colorAction={appcolor.red}
                            itemAction={item}
                            onPress={onCancelItem}
                        />
                    }
                    {item.isCanNext == 1 && item.isCanNextInView == 1 &&
                        <ActionPress
                            title='Chuyển kì sau'
                            type={ACTION_UPLOAD.NEXT}
                            colorAction={appcolor.yellow}
                            itemAction={item}
                            onPress={onNextTrim} />
                    }
                    {item.isCanSubmit == 1 &&
                        <ActionPress
                            title='Xác nhận'
                            type={ACTION_UPLOAD.SUBMIT}
                            colorAction={appcolor.success}
                            itemAction={item}
                            onPress={onSubmitItem} />
                    }
                    {item.isDocument == 1 &&
                        <ActionPress
                            title='Chứng từ'
                            type={ACTION_UPLOAD.DOCUMENT}
                            colorAction={appcolor.bluesky}
                            itemAction={item}
                            onPress={onShowInvoice} />
                    }
                </View>
            </View>
            {isVisible &&
                <ModalNotify messager={messager} visible={isVisible} titleConfirm={'Đóng'} handleVisibleModal={handleVisibleModal} />
            }
        </View>
    )
}
const CountFile = memo(({ item }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [countFile, setCountFile] = useState(0)

    useEffect(() => {
        loadDataDetail()
        return () => false
    }, [])

    const loadDataDetail = async () => {
        const dataDetail = await GetDataTripBillsDetail(item.detailId)
        const jsonDetail = dataDetail[0]
        const fileFoodCosts = JSON.parse(JSON.parse(jsonDetail.foodCosts || '[]')[0]?.billFile || '[]').length
        const fileHotelCosts = JSON.parse(JSON.parse(jsonDetail.hotelCosts || '[]')[0]?.billFile || '[]').length
        const fileMoveCosts = JSON.parse(JSON.parse(jsonDetail.moveCosts || '[]')[0]?.billFile || '[]').length
        const fileOtherCosts = JSON.parse(JSON.parse(jsonDetail.otherCosts || '[]')[0]?.billFile || '[]').length
        const fileSupportKMCosts = JSON.parse(JSON.parse(jsonDetail.supportKMCosts || '[]')[0]?.billFile || '[]').length
        const fileWorkCosts = JSON.parse(JSON.parse(jsonDetail.workCosts || '[]')[0]?.billFile || '[]').length
        setCountFile(fileFoodCosts + fileHotelCosts + fileMoveCosts + fileOtherCosts + fileSupportKMCosts + fileWorkCosts)
    }
    return (
        <Badge
            containerStyle={{ position: 'absolute', top: -5, end: -10 }}
            textStyle={{ color: appcolor.white, fontSize: 11, fontWeight: '500' }}
            badgeStyle={{ minWidth: 17, height: 17, backgroundColor: appcolor.tomato, borderRadius: 50 }}
            value={countFile}
        />
    )
})
const ActionPress = ({ type, title, onPress, colorAction, itemAction }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const actionItem = () => {
        onPress(itemAction, type)
    }
    return (
        <TouchableOpacity style={{ margin: 3, padding: 8, backgroundColor: colorAction, borderRadius: 3 }} onPress={actionItem}>
            {type === ACTION_UPLOAD.DOCUMENT && <CountFile item={itemAction} />}
            <Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.white }}>{title}</Text>
        </TouchableOpacity>
    )
}

