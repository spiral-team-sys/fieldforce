import React, { useEffect, useState } from "react"
import { FlatList, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { WorkingPlanAPI } from "../../API/WorkingPlanApi"
import { HeaderCustom } from "../../Content/HeaderCustom"
import { LoadingView } from "../../Control/ItemLoading"
import PagerView from "react-native-pager-view"
import { Badge, Divider, Icon, Image, Text } from '@rneui/themed'
import { alertConfirm, alertNotify, alertWarning, deviceHeight, deviceWidth } from "../../Core/Utility"
import ActionSheet, { SheetManager } from "react-native-actions-sheet"
//import DatePicker from "react-native-date-picker"
import moment from "moment"
import _ from 'lodash'
import FormGroup from "../../Content/FormGroup"
import { scaleSize } from "../../Themes/AppsStyle"
import { groupDataByKey, ToastError, ToastSuccess, UUIDGenerator } from "../../Core/Helper"
import { YearMonthSelected } from "../../Control/YearMonthSelected"
import { URLDEFAULT } from "../../Core/URLs"

import NativeCamera from "../../Control/NativeCamera"
import { deletePhoto, GetPhotosEvident } from "../../Controller/PhotoController"
import UploadController from "../../Controller/UploadController"

const SHIFT_MODE = { ON: "ON", OFF: "OFF" }
const DATE = new Date()
const TotalMinute = 48 * 60
const _sheetheight = (deviceHeight * 0.83)
const _scrollheight = (deviceHeight * 0.7) - 190;
export const WeekLyPlan = ({ navigation }) => {
    const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState(
        {
            "date": null,
            "weekly": null,
            "year": DATE.getFullYear(),
            "yearname": `Năm ${DATE.getFullYear()}`,
            "month": DATE.getMonth() + 1,
            "monthname": `Tháng ${DATE.getMonth() + 1}`,
            "fromDate": null,
            "toDate": null
        }
    );
    const [planTime, setPlanTime] = useState([])
    const [countTotaByWeek, setCountTotalWeek] = useState(0)
    const [dataCalendar, setDataCalendar] = useState([])
    const [dataShop, setDataShop] = useState([])
    const [dataShopMain, setDataShopMain] = useState([])
    const [photoAttendant, setPhotoAttendant] = useState([])
    const [dataShiftList, setDataShiftList] = useState([])
    const [planDate, setPlanDate] = useState([])
    const [tabActive, setTabActive] = useState(0)
    const [weekIndex, setWeekIndex] = useState(0)
    const [note, setNote] = useState(null)
    const [noteShop, setNoteShop] = useState(null)
    const [noteEvident, setNoteEvident] = useState(null)
    const [shiftOFF, setShiftOFF] = useState({ name: null, code: null })
    const [dataPhoto, setDataPhoto] = useState([])
    const [mutate, setMutate] = useState(false)
    // Template Update 
    const [dataPlanList, setPlanList] = useState([])

    const LoadData = async (year, month, weekByYear) => {
        await setDataCalendar([])
        await setLoading(true)
        const yearValue = year || moment().format('YYYY')
        const monthValue = month || moment().format('M')
        const calendarResult = await WorkingPlanAPI.GetCalendar(yearValue, monthValue);
        if (calendarResult.statusId === 200) {
            await setWeekIndex(weekByYear || calendarResult.data[0]?.isWeekNum)
            await setDataCalendar(calendarResult.data)
            const items = calendarResult.data[0] || {}
            const fromDate = moment(items.fromDate).format('YYYY-MM-DD').toString()
            const toDate = moment(items.toDate).format('YYYY-MM-DD').toString()
            await setFilter({ ...filter, "fromDate": fromDate, "toDate": toDate })
            // dataPlan
            const resultStore = await WorkingPlanAPI.GetStorePlan(fromDate, toDate)
            if (resultStore.statusId === 200) {
                await countTotalTime(calendarResult.data, resultStore.data, 'ON', async (dataReulst) => {
                    await setCountTotalWeek(dataReulst[calendarResult.data[0]?.isWeekNum].minutePlan || 0)
                })
                await setDataShop(resultStore.data)
                await setDataShopMain(resultStore.data)
                const shiftList = JSON.parse(resultStore.data[0].shitList)
                await setDataShiftList(shiftList)
            }
        }
        await setLoading(false)
    }
    const uploadData = async () => {
        if (dataPlanList.length == 0) {
            ToastError('Bạn chưa có yêu cầu thay đổi lịch làm việc')
            return
        }
        let dataUpload = []
        let dateSend = ''
        await dataPlanList.forEach((item, _) => {
            const itemSave = {
                'shiftMode': item.shiftMode,
                'shopId': item.shopId,
                'workDate': item.workDate,
                'shiftType': item.shiftType || null,
                'timeIn': moment(item.timeIn).format('HH:mm:00'),
                'timeOut': moment(item.timeOut).format('HH:mm:00'),
                'note': item.note || null
            }
            dataUpload.push(itemSave)
            dateSend += `${item.workDate},`
        })

        const bodyNotify = `Nhân viên ${userinfo.employeeName} thay đổi lịch làm việc từ ${dataCalendar[weekIndex].fromDateWeek} đến ${dataCalendar[weekIndex].toDateWeek}. Vui lòng xem chi tiết trong xác nhận lịch làm việc`
        let dataUploadInfo = {
            "isSendNotify": 1,
            "dataPlan": JSON.stringify(dataUpload),
            "contentMessage": bodyNotify
        }

        alertConfirm('Thông báo', 'Bạn có chắc chắn muốn gửi đề xuất thay đổi ?', async () => {
            const uploadResult = await WorkingPlanAPI.uploadPlanbyWeek(dataUploadInfo)
            if (uploadResult.statusId == 200) {
                await setPlanList([])
                await LoadData(filter.year, filter.month, weekIndex)
                await ToastSuccess(uploadResult.messager)
            } else {
                await ToastError(uploadResult.messager)
            }
        })
    }
    const summaryTime = async () => {
        const fromDate = dataCalendar[weekIndex].fromDateWeek
        const toDate = dataCalendar[weekIndex].toDateWeek
        const lstShopON = dataShop.filter(i => i.shiftMode === 'ON' && i.workDate >= fromDate && i.workDate <= toDate)
        const totalItem = _.sumBy(lstShopON, 'totalMinute')

        await setCountTotalWeek(parseFloat(totalItem / 60).toFixed(1))
    }
    const handlerChangeWeek = async (e) => {
        const position = await e.nativeEvent.position;
        await setWeekIndex(position)
        //
        const i = dataCalendar[position]
        const totalTimeByWeek = await (_.filter(planTime, (ie) => ie.weekNum == i.weekNum))[0]?.minutePlan || 0
        await setCountTotalWeek(totalTimeByWeek);
    }
    const onDaySelected = (item) => {
        setFilter({ ...filter, "date": item.Date === filter.date ? null : item.Date, "weekly": item.Weekly })
        const dataDate = dataShopMain.filter(a => a.workDate === item.Date)
        if (dataDate !== null && dataDate.length > 0) {
            const photos = JSON.parse(dataDate[0].photoList)
            if (photos !== null && photos.length > 0) {
                const { arr } = groupDataByKey({
                    arr: photos,
                    key: 'ShopName'
                })
                setPhotoAttendant(arr)
                SheetManager.show('sheetPhotos')
            } else {
                setPhotoAttendant([])
            }
        }
    }
    const onViewDay = async () => {
        const dataDate = dataShopMain.filter(a => a.workDate === filter.date && a.shiftMode == SHIFT_MODE.ON)
        setPlanDate(dataDate || dataShopMain);
        const imageData = await GetPhotosEvident(0, moment(filter.date).format('YYYYMMDD'), kpiinfo.id)
        await setDataPhoto(imageData)
        SheetManager.show('sheetAdd')
    }
    const handlerConfirmTime = async (item) => {
        if (item.timeIn !== null && item.timeOut !== null) {
            if (moment(item.timeOut).hours() == moment(item.timeIn).hours() && moment(item.timeOut).minutes() == moment(item.timeIn).minutes()) {
                alertWarning('Thời gian kết thúc phải lớn hơn thời gian bắt đầu')
                return
            }
            if (moment(item.timeOut) < moment(item.timeIn)) {
                alertWarning('Thời gian bắt đầu không được lớn hơn thời gian kết thúc')
                return
            }
        } else {
            alertWarning('Chưa chọn thời gian làm việc')
            return
        }
        if (item.isCheckNote == 1 && (noteShop == null || noteShop.length < 5)) {
            alertWarning('Vui lòng nhập lí do thay đổi thời gian làm việc (Tối thiểu 5 kí tự)')
            return
        }

        const difference = moment(item.timeOut).diff(moment(item.timeIn))
        const minuteRegister = moment.duration(difference).asMinutes()

        const itemPlan = {
            "shopId": item.shopId,
            "shopName": item.shopName,
            "workDate": item.workDate,
            "timeIn": item.timeIn,
            "timeOut": item.timeOut,
            "shiftMode": SHIFT_MODE.ON,
            "totalMinute": minuteRegister,
            "note": noteShop
        }
        await _.remove(dataPlanList, (n) => {
            return n.shopId === item.shopId && n.workDate === item.workDate
        })
        dataPlanList.push(itemPlan)
        const lstPlan = await _.uniqWith(dataPlanList, _.isEqual)
        // 
        const lstShopON = dataShop.filter(i => i.shiftMode === 'ON' && i.workDate === item.workDate && i.shopId === item.shopId)
        lstShopON[0].timeIn = item.timeIn
        lstShopON[0].timeOut = item.timeOut
        lstShopON[0].totalMinute = minuteRegister
        await summaryTime()

        await handlerAddForDate(item.workDate, lstPlan, SHIFT_MODE.ON)
        await setPlanList(lstPlan)
        ToastSuccess('Thêm lịch thành công', 'Thông báo', 'top')
    }
    const onSelectOFF = (item) => {
        let _editOff = [...dataShiftList]
        _editOff.forEach(e => {
            if (e.ShiftCode === item.ShiftCode) {
                item.Selected === 0 ? setShiftOFF({ name: item.ShiftNameVN, code: item.ShiftCode }) : setShiftOFF({ name: null, code: null })
                e.Selected = item.Selected === 1 ? 0 : 1
            } else {
                e.Selected = 0
            }
        })
        setDataShiftList(_editOff)
    }
    const handlerConfirmOFF = async () => {
        if (note == null) {
            alertWarning('Vui lòng nhập lý do nghỉ phép')
            return
        }
        if (note !== null && note.length < 5) {
            alertWarning('Lý do nghỉ phép quá ngắn, vui lòng nhập lại (Tối thiểu 5 kí tự)')
            return
        }
        if (shiftOFF.name == null) {
            alertWarning('Chưa chọn loại nghỉ phép')
            return
        }
        //
        await _.remove(dataPlanList, (n) => {
            return n.workDate === filter.date
        })
        const itemOFF = {
            "shopId": userinfo.employeeId,
            "workDate": filter.date,
            "shiftType": shiftOFF.code,
            "shiftName": shiftOFF.name,
            "note": note,
            "shiftMode": SHIFT_MODE.OFF,
            "totalMinute": 0
        }
        dataPlanList.push(itemOFF)

        const lstShopON = dataShop.filter(i => i.shiftMode === 'ON' && i.workDate === filter.date)
        lstShopON[0].timeIn = null
        lstShopON[0].timeOut = null
        lstShopON[0].totalMinute = 0
        await summaryTime()
        await handlerAddForDate(filter.date, dataPlanList, SHIFT_MODE.OFF)
        await setPlanList(dataPlanList)
        await closeAction()
    }
    const handlerAddForDate = async (workDate, lstShopPlan, shiftMode) => {
        const weekData = JSON.parse(dataCalendar[weekIndex].weekData || [])
        const index = weekData.findIndex(i => i.Date === workDate)
        const dataShopPlans = lstShopPlan.filter(i => i.workDate === workDate)
        const itemEdit = {
            ...weekData[index],
            "planList": JSON.stringify(dataShopPlans)
        }
        //
        weekData.splice(index, 1, itemEdit)
        dataCalendar[weekIndex].weekData = JSON.stringify(weekData)
    }
    const closeAction = () => {
        setTabActive(0)
        setShiftOFF({ name: null, code: null })
        setNote(null)
        SheetManager.hide('sheetAdd')
    }
    const countTotalTime = async (calendarList, shopData, shiftMode, actionResult) => {
        let _planTimes = []
        await calendarList.map((i, _index) => {
            const weekData = JSON.parse(i.weekData)
            const fromDate = _.minBy(weekData, 'Date')?.Date
            const toDate = _.maxBy(weekData, 'Date')?.Date
            if (shiftMode == SHIFT_MODE.OFF) {
                let plans = shopData.filter(item => item.workDate >= fromDate && item.workDate <= toDate && item.workDate !== filter.date)
                const totalItem = _.sumBy(plans, 'totalMinute')
                const itemTime = {
                    "weekNum": i.weekNum,
                    "minutePlan": (totalItem / 60).toFixed(1)
                }
                _planTimes.push(itemTime)
            } else {
                let plans = shopData.filter(item => item.workDate >= fromDate && item.workDate <= toDate)
                const totalItem = _.sumBy(plans, 'totalMinute')
                const itemTime = {
                    "weekNum": i.weekNum,
                    "minutePlan": (totalItem / 60).toFixed(1)
                }
                _planTimes.push(itemTime)
            }
        })
        await setPlanTime(_planTimes)
        await actionResult(_planTimes)
    }
    //
    const itemShop = ({ item, index }) => {
        const workingTime = `${moment(item.timeIn).format('HH:mm')} - ${moment(item.timeOut).format('HH:mm')}`
        const workingUpdateTime = item.timeInUpdate !== null ? `${moment(item.timeInUpdate).format('HH:mm')} - ${moment(item.timeOutUpdate).format('HH:mm')}` : 0
        const colorStatus = item.confirmPlan == 3 ? appcolor.rejection : item.confirmPlan == 1 ? appcolor.success : item.confirmPlan == -1 ? appcolor.danger : appcolor.dark
        const statusName = `${item.confirmStatus || ''} ${item.supNote || ''}`
        return (
            item.timeIn !== null &&
            <View key={`shopLists_${index}`} style={{ width: '100%' }}>
                <Text style={{ color: colorStatus, fontSize: 14, fontWeight: '400' }}>{statusName}</Text>
                <Text style={{ color: appcolor.dark, fontSize: 14, fontWeight: '300' }}>{item.shopName}</Text>
                <Text style={{ color: item.timeIn !== null ? appcolor.dark : appcolor.danger, fontSize: 13, fontWeight: '400', fontStyle: 'italic' }}>
                    {`Ca hiện tại: ${workingTime}`}
                </Text>
                {item.isUpdate == 1 && workingUpdateTime !== 0 && <Text style={{ color: item.timeIn !== null ? appcolor.dark : appcolor.danger, fontSize: 13, fontWeight: '400', fontStyle: 'italic' }}>
                    {`Ca thay đổi: ${workingUpdateTime} `}
                </Text>}
                {item.isUpdate == 1 && item.note !== null && <Text style={{ color: appcolor.danger, fontSize: 13, fontWeight: '400', fontStyle: 'italic' }}>
                    {`Lí do thay đổi: ${item.note} `}
                </Text>}
            </View>
        )
    }
    const rowItemDay = ({ item, index }) => {
        const onPress = () => { onDaySelected(item) }
        const itemChooseStyle = item.Date === filter.date ? { borderRightWidth: 10, borderRightColor: appcolor.warning } : {}
        const planList = (item.planList !== undefined ? JSON.parse(item.planList || '[]') : dataShop.filter(i => i.workDate === item.Date)).filter(i => i.shiftMode == SHIFT_MODE.ON)
        const OFFPlan = (item.planList !== undefined ? JSON.parse(item.planList || '[]') : dataShop.filter(i => i.workDate === item.Date)).filter(i => i.shiftMode == SHIFT_MODE.OFF)
        const shiftMode = item.shiftMode || SHIFT_MODE.ON
        const titleItem = shiftMode === SHIFT_MODE.ON && OFFPlan.length == 0 ? `Cửa hàng trong ngày ${planList.filter(i => i.timeIn !== null).length}` : 'Nghỉ phép'
        const totalMinuteItem = _.sumBy(planList, 'totalMinute') || 0

        const itemOffPlan = OFFPlan[0] || {}
        const workingTime = `${moment(itemOffPlan.timeIn).format('HH:mm')} - ${moment(itemOffPlan.timeOut).format('HH:mm')}`
        return (
            <View key={`itemday_${index}`} style={styles.dateView}>
                <View style={{ width: deviceWidth / 6, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                    <Badge status={item.ShortDate === 'CN' ? "error" : 'success'} />
                    <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                        <Text style={{ color: appcolor.dark, fontSize: 17 }}>{moment(item.Date).format('DD')}</Text>
                        <Text style={{ color: appcolor.dark, fontSize: 10, textAlign: 'center' }}>{item.ShortDate}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onPress} style={{ width: '82%' }}>
                    <View style={[{ width: '100%', flexGrow: 1, minHeight: 80, backgroundColor: appcolor.light, borderRadius: 10, padding: 5 }, itemChooseStyle]}>
                        <Text style={{ color: appcolor.greenBlueLight, fontSize: 14, fontWeight: '600' }}>{`${titleItem} (${(totalMinuteItem / 60).toFixed(1)}h)`}</Text>
                        {shiftMode === SHIFT_MODE.ON &&
                            <FlatList
                                key={'planListItem'}
                                keyExtractor={(_, index) => index.toString()}
                                data={planList}
                                renderItem={itemShop}
                                showsVerticalScrollIndicator={false}
                            />
                        }
                        {OFFPlan !== null && OFFPlan.length !== 0 &&
                            <View>
                                <Text style={{ color: (itemOffPlan.confirmPlan == 3 ? appcolor.rejection : itemOffPlan.confirmPlan == 1 ? appcolor.success : itemOffPlan.confirmPlan == -1 ? appcolor.danger : appcolor.dark), fontSize: 12, fontWeight: '400', fontStyle: 'italic' }}>
                                    {`${itemOffPlan.confirmStatus || ''} ${itemOffPlan.supNote || ''}`}
                                </Text>
                                <Text style={{ color: appcolor.danger, fontSize: 12, fontWeight: '400', fontStyle: 'italic' }}>
                                    {`Ca hiện tại: ${itemOffPlan?.shiftType} - ${itemOffPlan?.shiftName}`}
                                </Text>
                                {itemOffPlan?.shiftChange !== undefined && itemOffPlan?.shiftChange !== null &&
                                    <Text style={{ color: appcolor.danger, fontSize: 12, fontWeight: '400', fontStyle: 'italic' }}>
                                        {`Ca thay đổi: ${itemOffPlan?.shiftChange} - ${itemOffPlan?.shiftChangeName}`}
                                    </Text>
                                }
                                <Text style={{ color: appcolor.danger, fontSize: 12, fontWeight: '400', fontStyle: 'italic' }}>{`Lý do: ${itemOffPlan?.note || ''}`}</Text>
                            </View>
                        }
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const rowItemShop = ({ item, index }) => {
        // console.log(item)
        const showExpanderTime = () => {
            if (item.isLockDay == 0) {
                item.showTime = item.showTime === 0 || item.showTime == undefined ? 1 : 0
                let edit = { ...item, "timeIn": item.timeIn || DATE, "timeOut": item.timeOut || DATE }
                const _list = [...planDate]
                _list[index] = edit;
                setPlanDate(_list)
            }
        }
        const onDateChangeTimeIn = (date) => {
            const dateValue = moment(date).toDate()
            console.log(date, dateValue)
            const timeOut = date > item.timeOut ? date : item.timeOut
            const difference = moment(item.timeOut).diff(moment(dateValue))
            const edit = { ...item, "timeIn": dateValue, "timeOut": timeOut, 'totalMinute': moment.duration(difference).asMinutes() }
            const _list = [...planDate]
            _list[index] = edit;
            setPlanDate(_list)
        }
        const onDateChangeTimeOut = (date) => {
            const dateValue = moment(date).toDate()
            const timeIn = date < item.timeIn ? date : item.timeIn
            const difference = moment(date).diff(moment(dateValue))
            const edit = { ...item, "timeIn": timeIn, "timeOut": dateValue, 'totalMinute': moment.duration(difference).asMinutes() }
            const _list = [...planDate]
            _list[index] = edit;
            setPlanDate(_list)
        }
        const onPressConfirm = () => {
            const valueLock = item.btnConfirm === 0 ? 1 : 0
            item.btnConfirm = valueLock
            //
            handlerConfirmTime(item)
        }
        const timeIn = item.timeIn != null ? moment(item.timeIn).toDate() : DATE
        const timeOut = item.timeOut != null ? moment(item.timeOut).toDate() : DATE
        const titleTime = `${moment(timeIn).format('HH:mm')} - ${moment(timeOut).format('HH:mm')}`
        return (
            <View key={`itemshops_${index}`} style={{ width: '100%', backgroundColor: appcolor.surface, padding: 5, borderRadius: 5, marginBottom: 5 }}>
                <Text style={styles.titleView} >{item.shopName}</Text>
                <Text style={{ ...styles.titleView, fontSize: 13, fontWeight: '300' }} >{item.address}</Text>
                <View style={{ marginVertical: 3, borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                <TouchableOpacity onPress={showExpanderTime}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: appcolor.dark, flexGrow: 1, padding: 7 }}>Thời gian</Text>
                        <Text style={{ color: appcolor.dark, flexGrow: 1, padding: 7, textAlign: 'right' }}>{titleTime}</Text>
                        {/* <RNDateTimePicker mode="time" value={timeIn}
                            date={timeIn} minuteInterval={5}
                            onChange={onDateChangeTimeIn}
                            testID="datePicker" />
                        <RNDateTimePicker mode="time" value={timeOut}
                            date={timeOut} minuteInterval={5}
                            onChange={onDateChangeTimeOut} minimumDate={timeIn}
                            testID="datePicker" /> */}
                    </View>
                </TouchableOpacity>
                {item.showTime === 1 &&
                    <View style={{ width: '100%' }}>
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <DatePicker
                                style={{ height: 100, width: deviceWidth / 2.5 }}
                                androidVariant='iosClone'
                                mode='time'
                                minuteInterval={5}
                                date={timeIn}
                                onDateChange={onDateChangeTimeIn}
                            />
                            <DatePicker
                                style={{ height: 100, width: deviceWidth / 2.5 }}
                                androidVariant='iosClone'
                                mode='time'
                                minuteInterval={5}
                                date={timeOut}
                                onDateChange={onDateChangeTimeOut}
                            />
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                        <TouchableOpacity onPress={item.btnConfirm == 1 ? null : onPressConfirm} >
                            <Text style={{ fontSize: 14, textAlign: 'right', color: appcolor.success, fontWeight: '600', padding: 8, marginTop: 8 }}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.surface },
        contentView: { flex: 1, padding: 8 },
        pagerView: { flex: 1 },
        dateView: { width: '100%', flexDirection: 'row', marginBottom: 3 },
        actionItemView: { position: 'absolute', bottom: 20, right: 15, borderRadius: 50, backgroundColor: appcolor.warning, padding: 12 },
        titleView: { width: '100%', color: appcolor.dark, fontSize: 14, fontWeight: '600' },
        titleAttendant: { fontSize: 14, fontWeight: '500', fontStyle: 'italic' }
    })
    //
    const onFilterChange = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }
    const handlerChooseMonth = async () => {
        SheetManager.hide("sheetYear")
        await LoadData(filter.year, filter.month)
    }
    // Image Evident
    const takePhoto = async (item) => {
        if (noteEvident !== null && noteEvident.length > 0) {
            const photoinfo = {
                "shopId": 0,
                "shopCode": null,
                "reportId": kpiinfo.id,
                "photoDate": moment(filter.date).format('YYYYMMDD'),
                "photoTime": new Date().getTime(),
                "photoType": 'ISSUE_FILE',
                "photoDesc": noteEvident,
                "dataUpload": 0,
                "fileUpload": 0,
                "photoPath": null,
                "shopLat": null,
                "shopLong": null,
                "guid": UUIDGenerator(),
                "photoFullTime": moment().format("YYYY-MM-DD HH:mm:ss")
            }
            await NativeCamera.cameraStart(photoinfo, (res) => photoEvidentResult(item, res));
        } else {
            alertWarning('Vui lòng nhập ghi chú trước khi chụp hình')
        }
    }
    const choosePhoto = async (item) => {
        if (noteEvident !== null && noteEvident.length > 0) {
            const photoinfo = {
                "shopId": 0,
                "shopCode": null,
                "reportId": kpiinfo.id,
                "photoDate": moment(filter.date).format('YYYYMMDD'),
                "photoTime": new Date().getTime(),
                "photoType": 'ISSUE_FILE',
                "photoDesc": noteEvident,
                "dataUpload": 0,
                "fileUpload": 0,
                "photoPath": null,
                "shopLat": null,
                "shopLong": null,
                "guid": UUIDGenerator(),
                "photoFullTime": moment().format("YYYY-MM-DD HH:mm:ss")
            }
            await NativeCamera.imageGalleryLaunch(photoinfo, (res) => photoEvidentResult(item, res));
        } else {
            alertWarning('Vui lòng nhập ghi chú trước khi chọn hình ảnh')
        }
    }
    const photoEvidentResult = async () => {
        const imageData = await GetPhotosEvident(0, moment(filter.date).format('YYYYMMDD'), kpiinfo.id)
        await setDataPhoto(imageData)
    }
    const handleRemoveImage = async (item, indexImage) => {
        dataPhoto.splice(indexImage, 1)
        await deletePhoto(item)
        setMutate(e => !e)
    }
    const handlerUploadPhotoEvident = async () => {
        const workInfo = {
            shopId: 0,
            workDate: moment(filter.date).format('YYYYMMDD'),
            reportId: kpiinfo.id
        }
        const result = await UploadController.DataPhoto(workInfo);
        alertNotify(result.messager || "");
        if (result.statusId === 200) {
            await UploadController.PostFile();
        }
        await photoEvidentResult()
    }
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Lịch làm việc (WeekLy)'}
                leftFunc={() => navigation.goBack()}
                rightFunc={() => uploadData()}
                iconRight='cloud-upload-alt'
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            {!loading &&
                <View style={styles.contentView}>
                    <TouchableOpacity onPress={() => SheetManager.show("sheetYear")} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 8, start: 8, zIndex: 10 }}>
                        <Text style={{ color: appcolor.primary, marginEnd: 7, fontSize: 14 }}>{filter.monthname} {filter.yearname}</Text>
                        <Icon name='angle-right' size={22} type='font-awesome-5' color={appcolor.primary} />
                    </TouchableOpacity>
                    {dataCalendar.length > 0 &&
                        <PagerView
                            overdrag={true}
                            initialPage={weekIndex}
                            showPageIndicator={true}
                            style={styles.pagerView}
                            onPageSelected={handlerChangeWeek} >
                            {dataCalendar.map((i, idx) => {
                                const weekData = JSON.parse(i.weekData).sort((a, b) => moment(a.Date) - moment(b.Date))
                                // const totalTimeByWeek = (_.filter(planTime, (ie) => ie.weekNum == i.weekNum))[0]?.minutePlan || 0
                                const colorTotalTime = (countTotaByWeek * 60) < TotalMinute ? appcolor.red : appcolor.success
                                return (
                                    <View key={`weekData_${idx}`} style={{ width: '100%' }}>
                                        <Text style={{ width: '100%', textAlign: 'right', fontSize: 16, fontWeight: '500', color: appcolor.primary }}>Tuần {i.weekNum}</Text>
                                        <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '700', color: colorTotalTime, padding: 8 }}>{`Tổng thời gian: ${countTotaByWeek || 0}h`}</Text>
                                        <FlatList
                                            key={'dayinwekkly'}
                                            keyExtractor={(_, index) => index.toString()}
                                            data={weekData}
                                            renderItem={rowItemDay}
                                            showsVerticalScrollIndicator={false}
                                            ListFooterComponent={<View style={{ marginBottom: 25 }} />}
                                        />
                                    </View>
                                )
                            })}
                        </PagerView>
                    }
                    <TouchableOpacity onPress={onViewDay}
                        style={{ ...styles.actionItemView, display: filter.date !== null ? 'flex' : 'none' }}>
                        <Icon name='add' size={23} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
            }
            <ActionSheet id="sheetAdd"
                containerStyle={{ backgroundColor: appcolor.light }}>
                <View style={{ width: '100%', height: deviceHeight / 1.3, backgroundColor: appcolor.light }}>
                    <View style={{ padding: 12, flexDirection: 'row', backgroundColor: appcolor.light, borderBottomColor: appcolor.grayLight, borderBottomWidth: 0.5 }}>
                        <TouchableOpacity onPress={() => setTabActive(0)} style={{ flexGrow: 1 }}>
                            <Text style={{ color: appcolor.dark, textAlign: 'center', fontWeight: tabActive === 0 ? '900' : 'normal' }}>Cửa hàng</Text>
                        </TouchableOpacity>
                        <View style={{ width: 2, height: 20, backgroundColor: appcolor.surface }} />
                        <TouchableOpacity onPress={() => setTabActive(1)} style={{ flexGrow: 1 }}>
                            <Text style={{ color: appcolor.red, textAlign: 'center', fontWeight: tabActive === 1 ? '900' : 'normal' }}>Nghỉ</Text>
                        </TouchableOpacity>
                        <View style={{ width: 2, height: 20, backgroundColor: appcolor.surface }} />
                        <TouchableOpacity onPress={() => setTabActive(2)} style={{ flexGrow: 1 }}>
                            <Text style={{ color: appcolor.info, textAlign: 'center', fontWeight: tabActive === 2 ? '900' : 'normal' }}>Hình ảnh</Text>
                        </TouchableOpacity>
                    </View>
                    {tabActive === 0 && <PlanON key={`ONPLan`} props={{ planDate, noteShop, setNoteShop, rowItemShop }} />}
                    {tabActive === 1 && <PlanOFF key={`OFFPLan`} props={{ dataShiftList, onSelectOFF, note, setNote, handlerConfirmOFF }} />}
                    {tabActive === 2 && <ImageEvident key={`ImageEvident`} props={{ takePhoto, choosePhoto, dataPhoto, setNoteEvident, handleRemoveImage, handlerUploadPhotoEvident }} />}
                </View>
            </ActionSheet>
            <ActionSheet id="sheetYear"
                containerStyle={{ backgroundColor: appcolor.light }} >
                <View>
                    <YearMonthSelected option={filter} onYearMonth={(search) => onFilterChange(search)} numMonth={4} />
                    <TouchableOpacity onPress={() => handlerChooseMonth()}
                        style={{ marginBottom: 12, borderTopWidth: 0.31, borderTopColor: appcolor.primary }}>
                        <Text style={{ padding: 12, textAlign: 'center', color: appcolor.primary }}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            <ActionSheet id="sheetPhotos"
                containerStyle={{ height: deviceHeight / 2, backgroundColor: appcolor.light }}>
                <ScrollView>
                    <FlatList
                        style={{ width: '100%', padding: 8 }}
                        key={'photoAttendants'}
                        keyExtractor={(_, index) => index.toString()}
                        data={photoAttendant}
                        showsVerticalScrollIndicator={false}
                        numColumns={2}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => {
                            return (
                                <View key={`pat_${index}`} style={{ flex: 1, alignSelf: 'center', marginRight: 7, }} >
                                    <Text style={styles.titleAttendant}>{item.isParent ? item.ShopName : ''}</Text>
                                    <Text style={styles.titleAttendant} >{item.isParent ? item.ShiftType : ''}</Text>
                                    <Text style={styles.titleAttendant}>{item.AttendantType} {`(${moment(item.AttendentTime).format("HH:mm")})`}</Text>
                                    <Text style={{ width: '100%', marginLeft: '-20%', padding: 3, color: appcolor.dark, fontWeight: '700' }}>{
                                        item.AttendantType?.includes("CHECKOUT") && item.TotalTime !== null ? item?.TotalTime : ''}</Text>
                                    {/* <Text style={styles.titleAttendant}>{URLDEFAULT + item.Photo}</Text> */}
                                    <Image
                                        source={{ uri: URLDEFAULT + item.Photo }}
                                        style={{ width: 180, height: 120, borderRadius: 5 }} resizeMode="cover" />
                                </View>
                            )
                        }}
                    />
                </ScrollView>
            </ActionSheet>
        </View>
    )
}
const PlanOFF = ({ props }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { dataShiftList, onSelectOFF, note, setNote, handlerConfirmOFF } = props

    return (
        <View style={{ backgroundColor: appcolor.light, marginTop: 8 }}>
            <FormGroup
                containerStyle={{ marginLeft: 8, marginRight: 8 }}
                handleChangeForm={(e) => setNote(e)} value={note}
                onClearTextAndroid={(e) => setNote(null)}
                editable={true} placeholder="Ghi chú..." title={"Lý do nghỉ phép"} />
            <ScrollView style={{ height: _scrollheight }} showsVerticalScrollIndicator={false}>
                {
                    dataShiftList.length > 0 &&
                    dataShiftList?.map((item, index) => {
                        return (
                            <TouchableOpacity key={`iip_off_${index}`} onPress={() => onSelectOFF(item)}>
                                <View style={{ padding: 12, backgroundColor: item.Selected === 1 ? appcolor.red : appcolor.light, flexDirection: 'row', alignItems: 'center' }}>
                                    <Badge value={item.ShiftCode} badgeStyle={{ borderColor: 'transparent' }} containerStyle={{ minWidth: 50, marginRight: 10 }} />
                                    <View style={{ flexGrow: 1 }} key={`offitem_${index}`}>
                                        <Text style={{ fontSize: scaleSize(13), color: appcolor.dark }}>{item.ShiftNameVN}</Text>
                                        <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>{item.ShiftName}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
            <TouchableOpacity style={{ width: '100%', marginBottom: 16, paddingTop: 8, bottom: 8 }} onPress={handlerConfirmOFF} >
                <Text style={{
                    fontSize: 14, textAlign: 'center', color: appcolor.success,
                    fontWeight: '600', padding: 8, marginTop: 8
                }}>Xác nhận</Text>
            </TouchableOpacity>
        </View>
    )
}
const PlanON = ({ props }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { planDate, noteShop, setNoteShop, rowItemShop } = props

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light, marginTop: 8 }}>
            <FormGroup
                containerStyle={{ marginLeft: 8, marginRight: 8 }}
                handleChangeForm={(e) => setNoteShop(e)}
                value={noteShop}
                onClearTextAndroid={(e) => setNoteShop(null)}
                editable={true}
                placeholder="Ghi chú..."
                title="Lý do thay đổi" />
            <FlatList
                style={{ margin: 8, flex: 1 }}
                key='storeplan'
                keyExtractor={(_, index) => index.toString()}
                data={planDate}
                renderItem={rowItemShop}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}
const ImageEvident = ({ props }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { setNoteEvident, takePhoto, choosePhoto, handlerUploadPhotoEvident, dataPhoto, handleRemoveImage } = props
    const styles = StyleSheet.create({
        imageDetail: { textAlign: 'center', fontSize: 15, },
        styleViewSelectImage: { flexDirection: 'row', width: '95%', backgroundColor: appcolor.surface, borderRadius: 10, padding: 8, alignSelf: 'center', marginTop: 8 }
    })
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
                <FormGroup
                    containerStyle={{ marginLeft: 8, marginRight: 8 }}
                    handleChangeForm={(e) => setNoteEvident(e)}
                    onClearTextAndroid={(e) => setNoteEvident(null)}
                    editable={true}
                    placeholder="Ghi chú"
                    title="Ghi chú" />
                <View style={{ width: '100%' }}>
                    <TouchableOpacity onPress={takePhoto} style={styles.styleViewSelectImage}  >
                        <Icon solid name="camera" type='font-awesome-5' size={21} style={{ width: 30, textAlign: 'center', }} color={appcolor.dark} />
                        <Text style={{ fontSize: 15, marginLeft: 5, color: appcolor.dark }}>Chụp hình</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={choosePhoto} style={styles.styleViewSelectImage} >
                        <Icon solid name="images" type='font-awesome-5' size={21} style={{ width: 30, textAlign: 'center', }} color={appcolor.dark} />
                        <Text style={{ fontSize: 15, marginLeft: 5, color: appcolor.dark }}>Chọn hình từ thư viện</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    {dataPhoto.map((item, index) => {
                        return (
                            <View key={index} style={{ alignSelf: 'center', borderRadius: 10 }}>
                                <Text style={{ width: '95%', textAlign: 'left', color: appcolor.dark, fontSize: 15, fontWeight: '600', padding: 5, marginBottom: 0 }}>{item.photoDesc}</Text>
                                <View style={{ alignItems: 'center', backgroundColor: appcolor.background, marginTop: 8 }}>
                                    <Image source={{ uri: item.photoPath }} style={{ width: deviceWidth - 20, height: deviceWidth / 2, borderRadius: 8, resizeMode: 'cover', }} />
                                    <TouchableOpacity onPress={() => item.dataUpload == 0 ? handleRemoveImage(item, index) : null} style={{ position: 'absolute', top: 5, right: 16, }}>
                                        <Icon name={item.dataUpload == 0 ? "times" : "check"} type='font-awesome-5'
                                            size={23} color={item.dataUpload == 0 ? appcolor.danger : appcolor.green} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
            <View style={{ height: '10%', alignItems: 'center', }}>
                <TouchableOpacity onPress={handlerUploadPhotoEvident} style={{ height: 38, backgroundColor: appcolor.secondary, width: deviceWidth / 2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', }}>
                    <Text style={{ fontSize: 16, color: appcolor.light }}>Gửi hình ảnh</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}