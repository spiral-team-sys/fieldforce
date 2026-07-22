import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { ScreenViewInfo } from "./Page/ScreenViewInfo";
import { ScreenRequestInfo } from "./Page/ScreenRequestInfo";
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import { ScreenDetailsData } from "./Page/ScreenDetailsData";
import { OVERTIMEAPI } from "../../../API/OverTimeAPI";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { MessageAction, MessageInfo, ToastError, UUIDGenerator } from "../../../Core/Helper";
import { deviceHeight } from "../../../Themes/AppsStyle"; 
import { getDataPhotos } from "../../../Controller/PhotoController";
import { TODAY } from "../../../Core/Utility";
import moment from "moment";
import _ from 'lodash';

export const HomeOTManager = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dataMain, setDataMain] = useState({ parentList: null, employeeList: [], shopPermission: [], shiftList: [], reasonList: [], dataDetails: [] })
    const [dataManager, setDataManager] = useState({ parentList: null, employeeList: [], shopPermission: [], shiftList: [], reasonList: [], dataDetails: [] })
    const [requestInfo, setRequestInfo] = useState({
        typeId: 0,
        employeeId: 0,
        employeeCode: null,
        employeeName: null,
        shopId: 0,
        shopCode: null,
        shopName: null,
        workingDay: null,
        timeFrom: null,
        timeTo: null,
        shiftValue: 0,
        shiftCode: null,
        shiftName: null,
        reasonId: 0,
        reasonName: null,
        reasonOther: null,
        guid: null
    })
    const [_mutate, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        if (requestInfo.guid == null) {
            requestInfo.guid = UUIDGenerator()
        }
        await OVERTIMEAPI.GetManagerOT(async (mData) => {
            const itemData = mData[0] || {}
            if (itemData !== null && Object.keys(mData).length > 0) {
                const _employeeList = JSON.parse(itemData.employeeList) || []
                const _shopPermission = JSON.parse(itemData.shopPermission) || []
                const _shiftList = JSON.parse(itemData.shiftList) || []
                const _reasonList = JSON.parse(itemData.reasonList) || []
                const _dataDetails = JSON.parse(itemData.dataDetails) || []
                //
                await setDataMain({
                    parentList: itemData.parentList,
                    employeeList: _employeeList,
                    shopPermission: _shopPermission,
                    shiftList: _shiftList,
                    reasonList: _reasonList,
                    dataDetails: _dataDetails
                })
                await setDataManager({
                    parentList: itemData.parentList,
                    employeeList: _employeeList,
                    shopPermission: _shopPermission,
                    shiftList: _shiftList,
                    reasonList: _reasonList,
                    dataDetails: _dataDetails
                })
            }
        })
        await setLoading(false)
    }
    const handlerUploadData = async () => {
        const _validData = await validData()
        if (!_validData)
            return
        const dataUpload = {
            ...requestInfo,
            workingDay: moment(requestInfo.workingDay).format('YYYY-MM-DD'),
            timeFrom: moment(requestInfo.timeFrom).format('YYYY-MM-DD HH:mm:ss'),
            timeTo: moment(requestInfo.timeTo).format('YYYY-MM-DD HH:mm:ss')
        }
        // Check Data From Server 
        await OVERTIMEAPI.CheckDataManagerOT(dataUpload, async (result) => {
            if (result.statusId == 200) {
                const mCheckList = await result.data || []
                if (mCheckList !== null && mCheckList.length > 0) {
                    const _itemCheck = await mCheckList[0] || {}
                    const _contentCheck = `Cửa hàng ${_itemCheck.shopName}\nNhân viên ${_itemCheck.employeeName}\nĐã có lịch ngày ${moment(_itemCheck.workingDay).format('DD/MM/YYYY')} (${_itemCheck.shiftName} ${_itemCheck.timeFrom} - ${_itemCheck.timeTo})`
                    MessageInfo(_contentCheck)
                } else {
                    const dataMessage = await getDataMessage()
                    const dataPhoto = await getDataPhotos(requestInfo.shopId, TODAY, 'OT_EVIDENT', kpiinfo.id, requestInfo.guid, true)

                    const itemUpload = {
                        typeAction: 'ADD',
                        shopId: requestInfo.shopId,
                        reportId: kpiinfo.id,
                        photoDate: TODAY,
                        jsonData: JSON.stringify(dataUpload),
                        jsonPhoto: JSON.stringify(dataPhoto),
                        dataMessage: JSON.stringify(dataMessage)
                    }

                    MessageAction(`Bạn có muốn "Gửi yêu cầu đề xuất" đăng kí tăng ca không ?`, async () => {
                        await OVERTIMEAPI.SaveManagerOT(itemUpload, async (result) => {
                            MessageInfo(result.messager)
                            if (result.statusId == 200) {
                                resetForm()
                            }
                        })
                    })
                }
            } else {
                MessageInfo(result.messager)
            }
        })
    }
    // Handler
    const getTimeOnWorkingDay = (value, workingDay) => {
        if (!value) return null

        const time = moment(value, ['HH:mm', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true)
        if (!time.isValid()) return null

        return moment(workingDay)
            .startOf('day')
            .hour(time.hour())
            .minute(time.minute())
            .second(0)
            .millisecond(0)
    }
    const validData = () => {
        if (dataManager.shopPermission.length > 0 && requestInfo.shopId == 0) {
            ToastError(`Chưa chọn cửa hàng`, 'Dữ liệu', 'top')
            return false
        }
        if (dataManager.employeeList.length > 0 && requestInfo.employeeId == 0) {
            ToastError(`Chưa chọn nhân viên`, 'Dữ liệu', 'top')
            return false
        }
        if ((requestInfo.shiftCode || '').length == 0) {
            ToastError(`Chưa chọn ca làm việc`, 'Dữ liệu', 'top')
            return false
        }
        if (requestInfo.workingDay == null || requestInfo.timeFrom == null || requestInfo.timeTo == null) {
            ToastError(`Chưa chọn thời gian làm việc`, 'Dữ liệu', 'top')
            return false
        }
        const requestDate = moment(requestInfo.workingDay).format('YYYY-MM-DD')
        const requestFrom = getTimeOnWorkingDay(requestInfo.timeFrom, requestDate)
        const requestTo = getTimeOnWorkingDay(requestInfo.timeTo, requestDate)
        if (requestFrom && requestTo && !requestTo.isAfter(requestFrom)) {
            requestTo.add(1, 'day')
        }
        if (!requestFrom || !requestTo || !requestTo.isAfter(requestFrom)) {
            ToastError(`Khung giờ làm việc không hợp lệ`, 'Dữ liệu', 'top')
            return false
        }
        const durationMinutes = requestTo.diff(requestFrom, 'minutes')
        const maximumMinutes = Number(requestInfo.shiftValue || 0) * 60
        if (maximumMinutes > 0 && durationMinutes > maximumMinutes) {
            ToastError(`Ca ${requestInfo.shiftName} tối đa ${requestInfo.shiftValue}h, vui lòng chọn lại thời gian`, 'Dữ liệu', 'top')
            return false
        }
        for (const item of dataManager.dataDetails) {
            if (item.WorkingDay != requestDate) {
                continue
            }
            const confirmValue = Number(item?.Confirm)
            if (confirmValue === -1) {
                continue
            }
            const itemFrom = getTimeOnWorkingDay(item.TimeFrom, requestDate)
            const itemTo = getTimeOnWorkingDay(item.TimeTo, requestDate)
            if (!itemFrom || !itemTo) {
                continue
            }
            if (!itemTo.isAfter(itemFrom)) {
                itemTo.add(1, 'day')
            }
            const isOverlap = requestFrom.isBefore(itemTo) && requestTo.isAfter(itemFrom)
            if (isOverlap) {
                ToastError(`Đã có lịch ngày ${moment(requestInfo.workingDay).format('DD/MM/YYYY')} (${item.ShiftName} ${item.TimeFrom} - ${item.TimeTo})`, 'Dữ liệu', 'top')
                return false
            }
        }
        if (requestInfo.reasonId == 0) {
            ToastError(`Chưa chọn lí do`, 'Dữ liệu', 'top')
            return false
        } else if (requestInfo.reasonId == 100 && (requestInfo.reasonOther || '').length == 0) {
            ToastError(`Chưa nhập lí do khác`, 'Dữ liệu', 'top')
            return false
        }
        return true
    }
    const getDataMessage = () => {
        const workingDay = moment(requestInfo.workingDay).format('DD/MM/YYYY')
        const _title = `Đề xuất tăng ca ngày ${workingDay}`
        const _content = `Gửi đề xuất tăng ca ngày ${workingDay}: Nhân viên ${requestInfo.employeeName} - Ca làm việc: ${requestInfo.shiftName} (${requestInfo.timeFrom} - ${requestInfo.timeTo})`
        return [{ title: _title, content: _content, parentList: dataMain.parentList }]
    }
    const onBack = () => {
        navigation.goBack()
    }
    const handlerUpdateInfo = ({ item, type }) => {
        switch (type) {
            case 'SHOP':
                requestInfo.shopId = item.shopId
                requestInfo.shopCode = item.shopCode
                requestInfo.shopName = item.shopName
                break
            case 'EMPLOYEE':
                requestInfo.typeId = item.typeId
                requestInfo.employeeId = item.employeeId
                requestInfo.employeeCode = item.employeeCode
                requestInfo.employeeName = item.employeeName
                DeviceEventEmitter.emit('SET_DATA_SHIFT', item.typeId)
                break
            case 'SHIFT':
                requestInfo.shiftValue = item.shiftValue
                requestInfo.shiftCode = item.shiftCode
                requestInfo.shiftName = item.shiftName
                requestInfo.workingDay = item.workingDay
                requestInfo.timeFrom = item.timeFrom
                requestInfo.timeTo = item.timeTo
                requestInfo.totalTimeView = item.totalTimeView
                break
            case 'REASON':
                requestInfo.reasonId = item.reasonId
                requestInfo.reasonName = item.reasonName
                requestInfo.reasonOther = item.reasonOther || null
                break
        }
        //    
        setMutate(e => !e)
    }
    const handlerDetails = () => {
        SheetManager.show('requestmanager')
    }
    const resetForm = async () => {
        await setDataManager({ parentList: null, employeeList: [], shopPermission: [], shiftList: [], reasonList: [], dataDetails: [] })
        await setRequestInfo({
            typeId: 0,
            employeeId: 0,
            employeeCode: null,
            employeeName: null,
            shopId: 0,
            shopCode: null,
            shopName: null,
            workingDay: null,
            timeFrom: null,
            timeTo: null,
            shiftValue: 0,
            shiftCode: null,
            shiftName: null,
            reasonId: 0,
            reasonName: null,
            reasonOther: null,
            guid: null
        })
        await LoadData()
        DeviceEventEmitter.emit('RELOAD_REQUEST_INFO')
    }
    //
    useEffect(() => {
        const _reloadData = DeviceEventEmitter.addListener('RELOAD_DATA_OT', LoadData)
        const _requestinfo = DeviceEventEmitter.addListener('UPDATE_REQUEST_INFO', handlerUpdateInfo)
        LoadData()
        return () => {
            _requestinfo.remove()
            _reloadData.remove()
        }
    }, [requestInfo])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.primary },
        contentMain: { width: '100%', height: deviceHeight, backgroundColor: appcolor.light, borderTopStartRadius: 20, borderTopEndRadius: 20, overflow: 'hidden', padding: 8 },
        viewInfo: { padding: 8, margin: 8, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.light },
        viewRequest: { width: '100%', height: deviceHeight / 1.4 }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title='Danh sách đăng kí OT'
                leftFunc={onBack}
                iconMiddle='bars'
                middleFunc={handlerDetails}
                iconRight='cloud-upload-alt'
                rightFunc={handlerUploadData}
            />
            <View style={styles.viewInfo}>
                <ScreenViewInfo info={requestInfo} dataConfig={dataManager} />
            </View>
            <View style={styles.contentMain}>
                {loading && <ActivityIndicator size='small' color={appcolor.primary} />}
                <View style={styles.viewRequest}>
                    <ScreenRequestInfo info={requestInfo} dataConfig={dataManager} />
                </View>
            </View>
            <ActionSheet id="requestmanager">
                <ScreenDetailsData data={dataManager.dataDetails} />
            </ActionSheet>
        </View>
    )
}
