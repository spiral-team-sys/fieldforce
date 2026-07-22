import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Platform, Modal, TouchableOpacity, LayoutAnimation, UIManager, Keyboard } from "react-native";
import { Text } from '@rneui/themed';
import { ACTION_CONFIRM_PG, GetDataConfirmByPG } from '../../../Controller/PlanController';
import Icon from '@react-native-vector-icons/fontawesome6';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import { groupDataByKey, isCoincidenceShift, debounce, isSameDate, GetEmployeeInfo, removeVietnameseTones, } from '../../../Core/Helper';
import { alertWarning, alertNotify, alertConfirm } from '../../../Core/Utility';
import { HeaderCustom } from '../../../Content/HeaderCustom'
import { DEFAULT_COLOR } from '../../../Core/URLs';
import { LoadingView } from '../../../Control/ItemLoading/index';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth, fontWeightBold } from '../../../Themes/AppsStyle';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SearchData } from '../../../Control/SearchData/SearchData';
import CustomListView from '../../../Control/Custom/CustomListView';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CONFIRM_VALUE = (typeId) => {
    let confirmValue = 0
    switch (typeId) {
        case 183:
            confirmValue = 2
            break;
        case 184:
            confirmValue = 1
            break;
        default:
            confirmValue = 1
            break
    }
    return confirmValue;
}
const REJECT_VALUE = (typeId) => {
    let rejectValue = 0
    switch (typeId) {
        case 183:
            rejectValue = -1
            break;
        case 184:
            rejectValue = -1
            break;
        default:
            rejectValue = -1
            break
    }
    return rejectValue;
}
const getStyles = (appcolor) => StyleSheet.create({
    // layout
    flex1: { flex: 1 },
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    // shop list
    shopContainer: { padding: 8, borderRadius: 8, backgroundColor: appcolor.grayLight, marginBottom: 5 },
    shopContainerInner: { padding: 8, borderRadius: 8, backgroundColor: appcolor.surface, marginBottom: 5, marginHorizontal: 8 },
    itemShopContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', textAlignVertical: 'center', padding: 0, width: '100%' },
    itemShopRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', textAlignVertical: 'center', padding: 0, width: '100%', paddingStart: 2 },
    itemShopText: { color: appcolor.dark, fontSize: 12, width: '90%', padding: 3, fontWeight: '500' },
    itemShopNameText: { color: appcolor.dark, fontSize: 13, width: '90%', padding: 3, fontWeight: fontWeightBold },
    // icons
    iconContainer: { width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    iconHeaderStyle: { color: appcolor.success },
    iconStyle: { color: appcolor.dark, paddingEnd: 5 },
    iconUser: { paddingEnd: 8 },
    iconCalendar: { color: appcolor.dark, paddingEnd: 8 },
    iconPad: { padding: 3 },
    // input
    inputShop: { width: '100%', color: appcolor.dark, borderColor: appcolor.darkslategray, borderWidth: 0.5, borderRadius: 8, padding: 4, paddingHorizontal: 8 },
    // misc
    checkBoxContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '50%' },
    filterStyle: { width: '95%', fontSize: 13, alignSelf: 'center', padding: 8 },
    // confirm section
    titleConfirm: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    confirmActionsRow: { flex: 1, flexDirection: 'row-reverse' },
    confirmText: { fontSize: 12, fontWeight: '500', color: appcolor.dark, marginStart: 4 },
    // containers
    titleContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', padding: 8 },
    titleContainerEmployee: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', padding: 8, backgroundColor: appcolor.primary + '20' },
    titleContainerDate: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', padding: 8, marginStart: 8 },
    tabHeader: { color: appcolor.success, fontWeight: fontWeightBold, fontSize: 13 },
    bordertab: { width: '100%', borderTopColor: appcolor.grey, borderTopWidth: 0.5, marginVertical: 8 },
    shopListView: { padding: 8, borderRadius: 10, backgroundColor: appcolor.white, marginBottom: 5, marginStart: 8, marginEnd: 8, flexDirection: 'row', alignItems: 'center' },
    // employee / date text
    employeeNameText: { color: appcolor.primary, fontSize: 13, fontWeight: fontWeightBold },
    dayNameText: { color: appcolor.dark, fontSize: 13, fontWeight: '500' },
    // count stats
    countRow: { width: '98%', alignSelf: 'center', flexDirection: 'row', margin: 8, padding: 8, backgroundColor: appcolor.surface, borderRadius: 10 },
    countCell: { width: deviceWidth / 3, alignSelf: 'center' },
    countNumber: { color: appcolor.info, fontSize: 25, textAlign: 'center', fontWeight: '800' },
    countLabel: { color: appcolor.dark, fontSize: 14, fontWeight: '500', textAlign: 'center' },
    // calendar strip
    calendarStrip: { height: 86, paddingTop: 8, paddingBottom: 8 },
    calendarHeader: { color: appcolor.light, marginBottom: 16, fontSize: 14 },
    calendarDateNumber: { color: appcolor.light, fontSize: 14 },
    calendarDateName: { color: appcolor.light, fontSize: 12 },
    calendarHighlightContainer: { backgroundColor: appcolor.light },
    calendarHighlightDateNumber: { color: appcolor.dark, fontSize: 14 },
    calendarHighlightDateName: { color: appcolor.dark, fontSize: 12 },
    calendarDisabledDateName: { color: appcolor.grey, fontSize: 12 },
    calendarDisabledDateNumber: { color: appcolor.grey, fontSize: 14 },
    calendarIconContainer: { flex: 0.1 },
    // list
    loadingMargin: { marginTop: 8 },
    listBottomPad: { paddingBottom: deviceHeight / 2.5 },
    // modal
    safeAreaModal: { flex: 1, backgroundColor: appcolor.light, padding: 8, overflow: 'hidden' },
    modalHeader: { padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontWeight: '700', color: appcolor.dark, textAlign: 'center' },
    modalCloseBtn: { padding: 5 },
    itemModal: { flexDirection: 'row', backgroundColor: appcolor.surface, borderRadius: 8, margin: 8, marginTop: 0 },
    modalItemTouch: { flex: 8, padding: 12 },
    modalItemText: { width: '80%', fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
    modalClearBtn: { padding: 12, alignItems: 'center' },
})

const LG_ConfirmPlanPC = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const styles = useMemo(() => getStyles(appcolor), [appcolor])
    const [EmployeeInfo, setEmployeeInfo] = useState({})
    const [customDatesStyles, setCustomDatesStyles] = useState([])
    const [dateSelected, setDateSelected] = useState();
    const [data, setData] = useState([]);
    const [mainData, setMainData] = useState([]);
    const [indexContainer, setIndexContainer] = useState({})
    const [dataEmployee, setDataEmployee] = useState({});
    const [markedDates, setMarkedDates] = useState([]);
    const [currentBS, setCurrentBS] = useState([])
    const [dataBS, setDataBS] = useState({})
    const [visibleBS, setVisibleBS] = useState(false);
    const [shiftRegistered, setShiftRegistered] = useState({})
    const [_, setMutate] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const [dataModified, setDataModified] = useState({})

    const LoadDataPlan = async (weekChange) => {
        await setRefreshing(true)
        const dataEmp = await GetEmployeeInfo();
        setIndexContainer({})
        setDataModified({})
        setEmployeeInfo(dataEmp);
        try {
            let week = weekChange !== undefined ? weekChange : moment(new Date()).isoWeek()
            const dataBody = { 'Week': week, "Year": moment(new Date()).year() }

            await GetDataConfirmByPG(dataBody, async (mDataPlan, mDataWeek, dataEmp) => {
                const { arr, anonymous } = await groupDataByKey({
                    arr: mDataPlan,
                    key: "employeeId",
                    keyLayer2: "auditDate",
                    func: mapDataAnonymous,
                })
                await setData(JSON.parse(JSON.stringify(arr)))
                await setMainData(JSON.parse(JSON.stringify(arr)))
                await setDataBS({
                    listShift: arr[0] ? JSON.parse(arr[0].shiftList) : [],
                    listShiftPrototype: arr[0] ? JSON.parse(arr[0].shiftList) : [],
                    listReason: arr[0] ? JSON.parse(arr[0].refList) : [],
                })
                await dataMarkedDates(mDataWeek)
                await setDataEmployee({ ...dataEmployee, list: dataEmp || [] })
                await setIndexContainer(anonymous.indexContainer || {})
                await setShiftRegistered(anonymous.shiftRegistered || {})
            }, (_) => {
                // setRefreshing(false)
            })
        } catch (e) {
            console.log(e.message)
        }
        setRefreshing(false)
    }
    const mapDataAnonymous = (item, anonymous, index) => {
        // * Index Container
        const planId = `${item.id}_${item.planId}`
        if (anonymous.indexContainer !== undefined) {
            anonymous.indexContainer[planId] = index
        } else {
            anonymous.indexContainer = {}
            anonymous.indexContainer[planId] = index
        }
        // * Map Shift Registered
        const fromToObj = { from: item.from, to: item.to, code: item.lastChanged }
        const keyRegistered = `${item.employeeId}${item.auditDate}`
        if (anonymous.shiftRegistered) {
            if (anonymous.shiftRegistered[keyRegistered]) {
                anonymous.shiftRegistered[keyRegistered][index] = fromToObj
            } else {
                anonymous.shiftRegistered[keyRegistered] = {}
                anonymous.shiftRegistered[keyRegistered][index] = fromToObj
            }
        } else {
            anonymous.shiftRegistered = {}
            anonymous.shiftRegistered[keyRegistered] = {}
            anonymous.shiftRegistered[keyRegistered][index] = fromToObj
        }
        // * Map Init Data
        item.initLastChanged = item.lastChanged
        item.initLastChangedName = item.lastChangedName
        item.initRefId = item.refId
        item.initRefListName = item.refListName
        item.initFrom = item.from
        item.initTo = item.to
        item.initRefCode = item.ref_Code
    }
    const assignData = (index, key, value) => {
        const mainIndex = indexContainer[`${data[index].id}_${data[index].planId}`]
        data[index][key] = value
        mainData[mainIndex][key] = value
        dataModified[mainIndex] = true
    }
    const toggleSwitch = (index, indexMain) => {
        let dataShopList = JSON.parse(data[indexMain]["shopList"])
        const status = dataShopList[index].status
        dataShopList[index].status = status == 1 ? 0 : 1
        dataShopList[index].lastStatus = status == 1 ? 'DEL' : 'ADD'

        assignData(indexMain, "shopList", JSON.stringify(dataShopList))
        setMutate(e => !e)
    }
    const loadPlanByDate = async (mDate) => {
        let dateChange = mDate == undefined ? mDate : new Date(mDate).getTime() === new Date(dateSelected).getTime() ? undefined : mDate
        setDateSelected(dateChange)
        const mDateFormat = moment(mDate).format('YYYYMMDD')
        currentBS.employee = ""
        if (dateChange !== undefined) {
            const dateFilter = mainData.filter(e => e.auditDate == mDateFormat)
            const { arr } = groupDataByKey({
                arr: dateFilter,
                key: "employeeId",
                keyLayer2: "auditDate",
            })
            setData(JSON.parse(JSON.stringify(arr)))
        } else {
            const { arr } = groupDataByKey({
                arr: mainData,
                key: "employeeId",
                keyLayer2: "auditDate",
            })
            setData(JSON.parse(JSON.stringify(arr)))
        }
    }
    const handleExpanded = (item, index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        data[index].expandShops = item.expandShops === 0 ? 1 : 0
        data[index].indexMain = index
        setMutate(e => !e)
    }
    const handleSubmit = async () => {
        Keyboard.dismiss()
        if (data.length > 0) {
            alertConfirm("Xác nhận", "Bạn có muốn phê duyệt/từ chối lịch làm việc như bên dưới không?", async () => {
                const listModified = Object.keys(dataModified), listEmployees = []
                let errorStr = null
                if (listModified.length > 0) {
                    const dataPlan = []
                    for (let i = 0, lenList = listModified.length; i < lenList; i++) {
                        const {
                            shopId, confirm, supNote, confirmLate, supNoteLate, confirmEarlier, supNoteEarlier,
                            planId, employeeId, shiftType, shiftChange, reasonId, shopName, employeeName, auditDate, typeId
                        } = mainData[listModified[i]]
                        if ((confirm === REJECT_VALUE(typeId) && !supNote) || (supNote && supNote.length < 5)) {
                            errorStr = "Vui lòng nhập lí do " + (confirm === REJECT_VALUE(typeId) ? "không xác nhận" : "xác nhận") + " chuyển ca cửa hàng " + shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                        }
                        if ((confirmLate === REJECT_VALUE(typeId) && !supNoteLate) || (supNoteLate && supNoteLate.length < 5)) {
                            errorStr = "Vui lòng nhập ghi chú lí do " + (confirmLate === REJECT_VALUE(typeId) ? "không xác nhận" : "xác nhận") + " đi trễ cửa hàng " + shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                        }
                        if ((confirmEarlier === REJECT_VALUE(typeId) && !supNoteEarlier) || (supNoteEarlier && supNoteEarlier.length < 5)) {
                            errorStr = "Vui lòng nhập ghi chú lí do " + (confirmEarlier === REJECT_VALUE(typeId) ? "không xác nhận" : "xác nhận") + " về sớm cửa hàng " + shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                        }
                        let item = {
                            "PlanId": planId,
                            "EmployeeId": employeeId,
                            "ShopId": shopId,
                            "PlanDate": auditDate,
                            "ShiftType": shiftType,
                            "Confirm": confirm,
                            "LastChanged": shiftChange,
                            "ReasonId": reasonId,
                            "SupNote": supNote,
                            "ConfirmLate": confirmLate,
                            "ConfirmEarlier": confirmEarlier,
                            "SupNoteLate": supNoteLate,
                            "SupNoteEarlier": supNoteEarlier
                        }
                        if (confirm !== 0)
                            dataPlan.push(item);
                        listEmployees.push(employeeId)
                    }
                    if (errorStr !== null) {
                        currentBS.employee = ""
                        setData(JSON.parse(JSON.stringify(mainData)))
                        alertWarning(errorStr)
                        return
                    }

                    await ACTION_CONFIRM_PG(dataPlan, listEmployees.join(","), (message) => {
                        alertNotify(message || "")
                        LoadDataPlan(0, 0);
                    });
                } else {
                    alertWarning("Bạn chưa thực hiện phê duyệt/từ chối yêu cầu nào, Vui lòng phê duyệt/từ chối các yêu cầu bên dưới trước khi gửi dữ liệu")
                }
            })
        } else {
            alertNotify("Không có yêu cầu thay đổi lịch làm việc")
        }
    }
    const dataMarkedDates = (mDataWeek) => {
        let markedDates = [], customDatesStyles = []
        for (let i = 0, lenData = mDataWeek.length; i < lenData; i++) {
            let date = moment(mDataWeek[i].planDate)
            let dots = [{ color: mDataWeek[i].colorPlan }]
            markedDates.push({ date, dots });
        }
        customDatesStyles.push({
            startDate: new Date(),
            dateNameStyle: { color: appcolor.highlightDate },
            dateNumberStyle: { color: appcolor.highlightDate },
            highlightDateNameStyle: { color: appcolor.highlightDate },
            highlightDateNumberStyle: { color: appcolor.highlightDate },
        });
        setMarkedDates(markedDates)
        setCustomDatesStyles(customDatesStyles)
    }
    const loadPlanByWeek = async (_, end) => {
        let weekChange = moment(end).isoWeek()
        await LoadDataPlan(weekChange);
    }
    const ANDROID_loadPlanByWeek = async (_, end) => {
        if (Platform.OS === 'android') {
            let weekChange = moment(end).isoWeek()
            await LoadDataPlan(weekChange);
        }
    }
    const refreshDataPlan = () => {
        setDateSelected(undefined)
        LoadDataPlan(0);
    }
    const handleChangeNote = debounce((value, index, typeConfirm) => {
        switch (typeConfirm) {
            case 'SHIFT':
                assignData(index, "supNote", value)
                break;
            case 'LATE':
                assignData(index, "supNoteLate", value)
                break;
            case 'EARLIER':
                assignData(index, "supNoteEarlier", value)
                break;
        }
        setMutate(e => !e)
    }, 700)
    const handleChangeNote_SHOP = debounce((value, index, indexMain) => {
        let dataShopList = JSON.parse(data[indexMain].shopList)
        dataShopList[index].confirmPlanNote = value
        assignData(indexMain, "shopList", JSON.stringify(dataShopList))
        setMutate(e => !e)
    }, 100)
    const onFilterContentBS = (value) => {
        let listFilter = [], keyFilter = ""
        switch (currentBS.type) {
            case "EMPLOYEE":
                keyFilter = "employeeName"
                listFilter = dataEmployee.list
                break;
            case "SHIFT":
                keyFilter = "Name"
                listFilter = dataBS.listShift
                break;
            case "REASON":
                keyFilter = "title"
                listFilter = dataBS.listReason
                break;
        }
        if (value) {
            const filterList = listFilter.filter(e => {
                const labelFilter = e[keyFilter] ? e[keyFilter] : ''
                return removeVietnameseTones(labelFilter.toLowerCase()).includes(removeVietnameseTones(value.toLowerCase()))
            })
            setCurrentBS({ ...currentBS, list: filterList })
        } else {
            setCurrentBS({ ...currentBS, list: listFilter })
        }
    }
    const onSelectItemBS = async (item) => {
        const { type, index } = currentBS
        if (type === "EMPLOYEE") {
            let filterEmployee = await mainData.filter(e => e.employeeName == item.employeeName)
            await setData(JSON.parse(JSON.stringify(filterEmployee)))
            currentBS.employee = item
            await setVisibleBS(false)
            return
        }
        const mainIndex = indexContainer[`${data[index].id}_${data[index].planId}`]
        switch (type) {
            case 'SHIFT':
                if (!item.isShiftSelectable) {
                    if (item.isShiftBeforeCurrentTime) {
                        alertWarning("Ca thay đổi phải lớn hơn giờ hiện tại!")
                    } else {
                        alertWarning("Trùng ca trong ngày!")
                    }
                    return
                }
                assignData(index, "lastChangedName", item.Name)
                assignData(index, "lastChanged", item.Code)
                assignData(index, "ref_Code", item.Ref_Code)
                assignData(index, "from", item.From)
                assignData(index, "to", item.To)

                // * Reassign Shift Registered
                const keyRegistered = `${data[index].employeeId}${data[index].auditDate}`
                shiftRegistered[keyRegistered] = {
                    ...shiftRegistered[keyRegistered],
                    [mainIndex]: { from: item.From, to: item.To, code: item.Code }
                }
                break;
            case 'REASON':
                assignData(index, "refId", item.Id)
                assignData(index, "refListName", item.title)
                break;
        }
        setMutate(e => !e)
        setVisibleBS(false)
    }
    const onClearItemSelectedBS = (index) => {
        const { type } = currentBS
        if (type === "EMPLOYEE") {
            currentBS.employee = ""
            if (dateSelected) {
                const mDateFormat = moment(dateSelected).format('YYYYMMDD')
                const dateFilter = mainData.filter(e => e.auditDate === mDateFormat)
                setData(JSON.parse(JSON.stringify(dateFilter)))
            } else {
                setData(JSON.parse(JSON.stringify(mainData)))
            }
        } else {
            clearValue(index)
        }
        setVisibleBS(false)
    }
    const clearValue = (index) => {
        assignData(index, "lastChangedName", data[index].initLastChangedName)
        assignData(index, "lastChanged", data[index].initLastChanged)
        assignData(index, "refId", data[index].initRefId)
        assignData(index, "refListName", data[index].initRefListName)
        assignData(index, "from", data[index].initFrom)
        assignData(index, "to", data[index].initTo)
        assignData(index, "ref_Code", data[index].initRefCode)
    }
    const isShiftBeforeCurrentTime = (dateCheck, from, to) => {
        from = moment(from, "HH:mm")
        to = moment(to, "HH:mm")
        if (isSameDate(dateCheck, moment()) && (from - moment() <= 0 || to - moment() <= 0)) {
            return true
        }
        return false
    }
    const handleDisplayBS = (type, index = -1) => {
        let label = "", list = []
        switch (type) {
            case "EMPLOYEE":
                label = currentBS.employee
                list = dataEmployee.list
                break;
            case "SHIFT":
                label = data[index].lastChangedName
                const listShift = JSON.parse(JSON.stringify(dataBS.listShiftPrototype || [])) || []
                for (let i = 0, lenArr = listShift.length; i < lenArr; i++) {
                    let isValidShift = true
                    for (const value of Object.values(shiftRegistered[`${data[index].employeeId}${data[index].auditDate}`])) {
                        if ((listShift[i].Code === value.code) || (listShift[i].From === value.from && listShift[i].To === value.to) && listShift[i].From !== undefined && listShift[i].To !== undefined) {
                            listShift[i].isShiftExisted = true
                            isValidShift = false
                        }
                        if (isCoincidenceShift(listShift[i].From, listShift[i].To, value.from, value.to) && data[index].from !== value.from && data[index].to !== value.to) {
                            listShift[i].isShiftCoincident = true
                            isValidShift = false
                        }
                        if (isShiftBeforeCurrentTime(data[index].auditDate, listShift[i].From, listShift[i].To)) {
                            listShift[i].isShiftBeforeCurrentTime = true
                            listShift[i].isShiftCoincident = true
                            isValidShift = false
                        }
                    }
                    if (isValidShift) {
                        listShift[i].isShiftSelectable = true
                    }
                }
                dataBS.listShift = JSON.parse(JSON.stringify(listShift))
                list = listShift
                break;
            case "REASON":
                label = data[index].refListName
                list = dataBS.listReason.filter(e => e.Ref_Code === data[index].ref_Code)
                break;
        }
        setCurrentBS({ ...currentBS, type, list, index, label })
        setVisibleBS(true)
    }
    const handlerConfirm = (item, typeConfirm, isConfirm, index) => {
        let setColorConfirm = appcolor.greylight
        let setColorReject = appcolor.greylight
        let confirmValue = 0
        switch (typeConfirm) {
            case 'SHIFT':
                const prevConfirm = item.confirm
                setColorConfirm = prevConfirm === isConfirm ? appcolor.greylight : isConfirm == CONFIRM_VALUE(item.typeId) ? 'green' : appcolor.greylight
                setColorReject = prevConfirm === isConfirm ? appcolor.greylight : isConfirm == REJECT_VALUE(item.typeId) ? 'red' : appcolor.greylight
                confirmValue = prevConfirm === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmShift", setColorConfirm)
                assignData(index, "colorRejectShift", setColorReject)
                assignData(index, "confirm", confirmValue)
                break;
            case 'LATE':
                const prevConfirmLate = item.confirmLate
                setColorConfirm = prevConfirmLate === isConfirm ? appcolor.greylight : isConfirm == CONFIRM_VALUE(item.typeId) ? 'green' : appcolor.greylight
                setColorReject = prevConfirmLate === isConfirm ? appcolor.greylight : isConfirm == REJECT_VALUE(item.typeId) ? 'red' : appcolor.greylight
                confirmValue = prevConfirmLate === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmLate", setColorConfirm)
                assignData(index, "colorRejectLate", setColorReject)
                assignData(index, "confirmLate", confirmValue)
                break;
            case 'EARLIER':
                const prevConfirmEarlier = item.confirmEarlier
                setColorConfirm = prevConfirmEarlier === isConfirm ? appcolor.greylight : isConfirm == CONFIRM_VALUE(item.typeId) ? 'green' : appcolor.greylight
                setColorReject = prevConfirmEarlier === isConfirm ? appcolor.greylight : isConfirm == REJECT_VALUE(item.typeId) ? 'red' : appcolor.greylight
                confirmValue = prevConfirmEarlier === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmEarlier", setColorConfirm)
                assignData(index, "colorRejectEarlier", setColorReject)
                assignData(index, "confirmEarlier", confirmValue)
                break;
        }
        setMutate(e => !e)
    }
    const RenderViewConfirm = ({ item, typeConfirm, index }) => {
        const icon = typeConfirm == 'SHIFT' ? 'sync' : 'clock'
        const statusConfirm = typeConfirm == 'SHIFT' ? item.confirmStatus : typeConfirm == 'LATE' ? item.confirmLateStatus : item.confirmEarlierStatus
        const valueChange = typeConfirm == 'SHIFT' ? "Ca chuyển: " + item.lastChangedName || "" : typeConfirm == 'LATE' ? item.timeLate : item.timeEarlier
        const noteChange = typeConfirm == 'SHIFT' ? "Lý do :" + item.changeNote || "" : typeConfirm == 'LATE' ? item.noteLate : item.noteEarlier
        const colorConfirm = typeConfirm == 'SHIFT' ? item.colorConfirmShift : typeConfirm == 'LATE' ? item.colorConfirmLate : item.colorConfirmEarlier
        const colorReject = typeConfirm == 'SHIFT' ? item.colorRejectShift : typeConfirm == 'LATE' ? item.colorRejectLate : item.colorRejectEarlier
        const statusColor = typeConfirm == 'SHIFT' ? item.statusConfirmShift : typeConfirm == 'LATE' ? item.statusConfirmLate : item.statusConfirmEarlier
        const isLock = typeConfirm == 'SHIFT' ? item.isLockConfirm : typeConfirm == 'LATE' ? item.isLockConfirmLate : item.isLockConfirmEarlier

        const onConfirm = () => { isLock == 1 ? null : handlerConfirm(item, typeConfirm, CONFIRM_VALUE(item.typeId), index) }
        const onReject = () => { isLock == 1 ? null : handlerConfirm(item, typeConfirm, REJECT_VALUE(item.typeId), index) }
        const onPressSHIFT = () => handleDisplayBS("SHIFT", index)
        const onPressREASON = () => handleDisplayBS("REASON", index)

        return (
            <View style={styles.bordertab}>
                <View style={styles.titleConfirm}>
                    <Icon name={icon} size={12} style={[styles.iconStyle, { color: statusColor }]} />
                    <Text style={[styles.tabHeader, { color: statusColor }]} >{statusConfirm}</Text>
                    {isLock !== 1 &&
                        <View style={styles.confirmActionsRow}>
                            <Icon name="window-close" size={28} color={colorReject} style={styles.iconPad} onPress={onReject} />
                            <Icon name="check-square" size={28} color={colorConfirm} solid style={styles.iconPad} onPress={onConfirm} />
                        </View>
                    }
                </View>
                <Text style={styles.confirmText}>{valueChange}</Text>
                <Text style={styles.confirmText}>{noteChange}</Text>
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        if (index === 0 && !item.isParent) {
            item.isParent = true
        }
        if (index === 0 && !item[`${item.employeeId}${item.auditDate}`]) {
            item[`${item.employeeId}${item.auditDate}`] = true
        }
        return (
            <View key={index} style={styles.flex1}>
                {item.isParent &&
                    <View style={styles.flex1}>
                        <View style={styles.titleContainerEmployee}>
                            <Icon solid name="user" size={16} color={appcolor.primary} style={styles.iconUser} />
                            <Text style={styles.employeeNameText}>Nhân viên: {item.employeeName}</Text>
                        </View>
                        {item.isShowCount == 1 &&
                            <View style={styles.countRow}>
                                <View style={styles.countCell}>
                                    <Text style={styles.countNumber}>{item.countChangeShift}</Text>
                                    <Text style={styles.countLabel}>{item.titleChangeShift} </Text>
                                </View>
                                <View style={styles.countCell}>
                                    <Text style={styles.countNumber}>{item.countLate}</Text>
                                    <Text style={styles.countLabel}>{item.titleLate} </Text>
                                </View>
                                <View style={styles.countCell}>
                                    <Text style={styles.countNumber}>{item.countEarlier}</Text>
                                    <Text style={styles.countLabel}>{item.titleEarlier} </Text>
                                </View>
                            </View>
                        }
                    </View>
                }
                <View key={index}>
                    {item[`${item.employeeId}${item.auditDate}`] &&
                        <View>
                            <View style={styles.titleContainerDate}>
                                <Icon solid name="calendar-day" size={16} color={appcolor.primary} style={styles.iconCalendar} />
                                <Text style={styles.dayNameText}>{item.dayName}</Text>
                            </View>
                            <View style={styles.shopContainerInner}>
                                <View style={styles.itemShopRow}>
                                    <Icon name="home" size={16} style={styles.iconStyle} color={appcolor.dark} />
                                    <Text style={styles.itemShopNameText}>{item.shopName}</Text>
                                </View>
                                {item.shiftName !== null && (
                                    <Text style={styles.itemShopText}>{item.shiftName}</Text>
                                )}
                                {item.confirmStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="SHIFT" />}
                                {item.confirmStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="SHIFT" styles={styles} appcolor={appcolor} />)}
                                {item.confirmLateStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="LATE" />}
                                {item.confirmLateStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="LATE" styles={styles} appcolor={appcolor} />)}
                                {item.confirmEarlierStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="EARLIER" />}
                                {item.confirmEarlierStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="EARLIER" styles={styles} appcolor={appcolor} />)}
                            </View>
                        </View>
                    }
                </View>
            </View>
        )
    }
    useEffect(() => {
        LoadDataPlan(0)
    }, []);

    return (
        <View style={styles.flex1}>
            <HeaderCustom
                title={route?.params?.menuitem.menuNameVN || 'Xác nhận LLV PC'}
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                iconMiddle='search'
                rightFunc={handleSubmit}
                middleFunc={() => handleDisplayBS("EMPLOYEE")}
            />
            <View style={styles.mainContainer}>
                <CalendarStrip
                    scrollable
                    style={styles.calendarStrip}
                    scrollerPaging={true}
                    minDate={'2023-01-01'}
                    calendarHeaderStyle={styles.calendarHeader}
                    calendarColor={DEFAULT_COLOR}
                    dateNumberStyle={styles.calendarDateNumber}
                    dateNameStyle={styles.calendarDateName}
                    customDatesStyles={customDatesStyles}
                    highlightDateContainerStyle={styles.calendarHighlightContainer}
                    highlightDateNumberStyle={styles.calendarHighlightDateNumber}
                    highlightDateNameStyle={styles.calendarHighlightDateName}
                    disabledDateNameStyle={styles.calendarDisabledDateName}
                    disabledDateNumberStyle={styles.calendarDisabledDateNumber}
                    iconLeft={require('../../../Themes/Images/chevron-left.png')}
                    iconRight={require('../../../Themes/Images/chevron-right.png')}
                    iconContainer={styles.calendarIconContainer}
                    markedDates={markedDates}
                    scrollToOnSetSelectedDate={false}
                    selectedDate={dateSelected}
                    onDateSelected={loadPlanByDate}
                />
                <LoadingView title={'Đang tải dữ liệu...'} isLoading={refreshing} styles={styles.loadingMargin} />
                <CustomListView
                    data={data}
                    extraData={data}
                    onRefresh={refreshDataPlan}
                    renderItem={renderItem}
                    bottomView={styles.listBottomPad}
                />
            </View>
            <Modal animationType="slide" statusBarTranslucent visible={visibleBS}>
                <SafeAreaProvider>
                    <SafeAreaView style={styles.safeAreaModal}>
                        <View style={styles.modalHeader}>
                            <Text h4 style={styles.modalTitle}>
                                {'Danh sách nhân viên'}
                            </Text>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setVisibleBS(false)}>
                                <Icon name="times" size={25} color={appcolor.dark} />
                            </TouchableOpacity>
                        </View>
                        <SearchData
                            placeholder='Tìm kiếm dữ liệu'
                            onSearchData={onFilterContentBS}
                        />
                        <RenderContentModal styles={styles} currentBS={currentBS} onSelectItemBS={onSelectItemBS} appcolor={appcolor} onClearItemSelectedBS={onClearItemSelectedBS} />
                    </SafeAreaView>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}
const RenderContentModal = ({ styles, appcolor, onSelectItemBS, currentBS, onClearItemSelectedBS }) => {
    const key = currentBS.type === "EMPLOYEE" ? "employeeName" : currentBS.type === "SHIFT" ? "Name" : "title"
    return (
        <CustomListView
            data={currentBS.list}
            extraData={currentBS.list}
            renderItem={({ item, index }) => {
                const isExists = currentBS.type === "EMPLOYEE" ? currentBS.employee === item : currentBS.label === item[key]
                return (
                    <View key={index} style={styles.itemModal}>
                        <TouchableOpacity style={styles.modalItemTouch} onPress={() => onSelectItemBS(item)}>
                            <Text style={styles.modalItemText}>{index + 1}. {item.employeeName}</Text>
                        </TouchableOpacity>
                        {isExists == 1 &&
                            <TouchableOpacity style={styles.modalClearBtn} onPress={onClearItemSelectedBS}>
                                <Icon name="backspace" size={18} color={appcolor.dark} />
                            </TouchableOpacity>
                        }
                    </View>
                )
            }} />
    )
}
const RenderTextInput = ({ item, index, handleChangeNote, handleChangeNote_SHOP, typeConfirm, appcolor, indexMain }) => {
    const value = typeConfirm == 'EARLIER' ? item.supNoteEarlier : typeConfirm == 'LATE' ? item.supNoteLate : item.supNote
    const isLock = typeConfirm == 'EARLIER' ? item.isLockConfirmEarlier : typeConfirm == 'LATE' ? item.isLockConfirmLate : item.isLockConfirm
    const titleNote = typeConfirm == 'SHOP' ? 'Quản lý ghi chú' : 'Ghi chú'
    const handleChange = (e) => {
        if (typeConfirm == 'SHOP') {
            handleChangeNote_SHOP(e, index, indexMain)
        } else {
            handleChangeNote(e, index, typeConfirm)
        }
    }

    const styles = StyleSheet.create({
        inputShop: { width: '100%', color: appcolor.dark, fontSize: 12, borderColor: appcolor.greylight, borderWidth: 0.5, borderRadius: 8, padding: 4, paddingHorizontal: 8 },
    })

    return (
        <TextInput
            editable={isLock == 0 ? true : false}
            defaultValue={value} multiline={true}
            style={styles.inputShop}
            placeholderTextColor={appcolor.greylight}
            placeholder={titleNote}
            onChangeText={handleChange} />
    )
}
export default LG_ConfirmPlanPC;
