import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { SafeAreaView, View, StyleSheet, TextInput, Platform, FlatList, RefreshControl, Modal, TouchableOpacity, KeyboardAvoidingView, Switch, LayoutAnimation, UIManager, Keyboard, ScrollView, Dimensions } from "react-native";
import { Text, ListItem } from '@rneui/themed';
import { ACTION_CONFIRM_SR, GetDataConfirmBySR } from '../../../Controller/PlanController';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import { groupDataByKey, isCoincidenceShift, debounce, isSameDate, GetEmployeeInfo, } from '../../../Core/Helper';
import { alertWarning, alertNotify, alertConfirm } from '../../../Core/Utility';
import FormGroup from '../../../Content/FormGroup';
import { DEFAULT_COLOR } from '../../../Core/URLs';
import { LoadingView } from '../../../Control/ItemLoading/index';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { scaleSize } from '../../../Themes/AppsStyle';
const PaddingTopIPX = Platform.OS == 'ios' ? 40 : 0;
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

const ConfirmSR = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
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
    const [dataModified, setDataModified] = useState({});

    const LoadDataPlan = async (weekChange) => {
        await setRefreshing(true)
        const dataEmp = await GetEmployeeInfo();
        setIndexContainer({})
        setDataModified({})
        setEmployeeInfo(dataEmp);
        try {
            let week = weekChange !== undefined ? weekChange : moment(new Date()).isoWeek()
            const dataBody = { 'Week': week, "Year": moment(new Date()).year() }

            await GetDataConfirmBySR(dataBody, async (mDataPlan, mDataWeek, dataEmp) => {
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
                setRefreshing(false)
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
        await setRefreshing(true)
        await setMutate(e => !e)
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
        await setRefreshing(false)
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
                        const { shopId, bShopId, confirm, supNote, employeeId, shiftType, shiftChange, shopName, employeeName, auditDate, shopList, typeId, reasonId } = mainData[listModified[i]]

                        if ((confirm === REJECT_VALUE(typeId) && !supNote) || (supNote && supNote.length < 5)) {
                            errorStr = "Vui lòng nhập lí do không xác nhận chuyển ca cửa hàng " + shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                        }
                        let dataShopList = []
                        JSON.parse(shopList).forEach(s => {
                            if (s.TypeList == 1 && s.confirm == REJECT_VALUE(typeId) && s.confirmPlanNote.length < 5) {
                                errorStr = "Vui lòng nhập lí do không đồng ý cửa hàng " + s.shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                                return
                            }

                            // if (s.confirm == 0 && s.lastStatus == 'ADD' && s.confirmPlanNote.length < 5) {
                            //     errorStr = "Vui lòng nhập lí do thêm cửa hàng cửa hàng " + s.shopName + " - " + employeeName + " (Tối thiểu 5 kí tự)"
                            //     return
                            // }

                            let shopItem = {
                                "EmployeeId": employeeId,
                                "ShopId": s.shopId,
                                "WorkingDay": auditDate,
                                "Status": s.status,
                                "LastStatus": s.lastStatus,
                                "Confirm": s.confirm,
                                "SupNoteShop": s.confirmPlanNote == undefined ? '' : s.confirmPlanNote
                            }
                            dataShopList.push(shopItem)
                        })
                        let item = {
                            "EmployeeId": employeeId,
                            "ShopId": shopId,
                            "BShopId": bShopId,
                            "PlanDate": auditDate,
                            "ShiftType": shiftType,
                            "Confirm": confirm,
                            "LastChanged": shiftChange,
                            "ReasonId": reasonId,
                            "SupNote": supNote,
                            "ShopList": JSON.stringify(dataShopList)
                        }
                        dataPlan.push(item);
                        listEmployees.push(employeeId)
                    }
                    if (errorStr !== null) {
                        currentBS.employee = ""
                        alertWarning(errorStr)
                        return
                    }
                    await ACTION_CONFIRM_SR(dataPlan, listEmployees.join(","), async (message) => {
                        alertNotify(message)
                        await LoadDataPlan(0);
                        setDateSelected(undefined)
                    });
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
    const refreshDataPlan = async () => {
        setDateSelected(undefined)
        await LoadDataPlan(0);
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
                keyFilter = "label"
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
                const labelFilter = e[keyFilter] ? e[keyFilter].toUpperCase() : ''.toUpperCase();
                return labelFilter.indexOf(value.toUpperCase()) > -1
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
        let setColorConfirm = appcolor.darklight
        let setColorReject = appcolor.darklight
        let confirmValue = 0

        //console.log(CONFIRM_VALUE(item.typeId), 'CONFIRM_VALUE');
        //console.log(REJECT_VALUE(item.typeId), 'REJECT_VALUE');

        switch (typeConfirm) {
            case 'SHIFT':
                const prevConfirm = item.confirm
                setColorConfirm = prevConfirm === isConfirm ? appcolor.darklight : isConfirm == CONFIRM_VALUE(item.typeId) ? 'green' : appcolor.darklight
                setColorReject = prevConfirm === isConfirm ? appcolor.darklight : isConfirm == REJECT_VALUE(item.typeId) ? 'red' : appcolor.darklight
                confirmValue = prevConfirm === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmShift", setColorConfirm)
                assignData(index, "colorRejectShift", setColorReject)
                assignData(index, "confirm", confirmValue)
                break;
            case 'LATE':
                const prevConfirmLate = item.confirmLate
                setColorConfirm = prevConfirmLate === isConfirm ? appcolor.dark : isConfirm == CONFIRM_VALUE(item.typeId) ? appcolor.success : appcolor.darklight
                setColorReject = prevConfirmLate === isConfirm ? appcolor.dark : isConfirm == REJECT_VALUE(item.typeId) ? appcolor.danger : appcolor.darklight
                confirmValue = prevConfirmLate === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmLate", setColorConfirm)
                assignData(index, "colorRejectLate", setColorReject)
                assignData(index, "confirmLate", confirmValue)
                break;
            case 'EARLIER':
                const prevConfirmEarlier = item.confirmEarlier
                setColorConfirm = prevConfirmEarlier === isConfirm ? appcolor.dark : isConfirm == CONFIRM_VALUE(item.typeId) ? appcolor.success : appcolor.darklight
                setColorReject = prevConfirmEarlier === isConfirm ? appcolor.dark : isConfirm == REJECT_VALUE(item.typeId) ? appcolor.danger : appcolor.darklight
                confirmValue = prevConfirmEarlier === isConfirm ? 0 : isConfirm
                assignData(index, "colorConfirmEarlier", setColorConfirm)
                assignData(index, "colorRejectEarlier", setColorReject)
                assignData(index, "confirmEarlier", confirmValue)
                break;
        }
        setMutate(e => !e)
    }
    const handlerConfirmShop = async (item, isConfirm, index, indexMain) => {
        let dataShopList = JSON.parse(data[indexMain].shopList)
        let confirmShop = item.confirm === isConfirm ? 0 : isConfirm
        let colorConfirm = item.confirm === isConfirm ? appcolor.dark : isConfirm == CONFIRM_VALUE(item.typeId) ? appcolor.success : appcolor.darklight
        let colorReject = item.confirm === isConfirm ? appcolor.dark : isConfirm == REJECT_VALUE(item.typeId) ? appcolor.danger : appcolor.darklight

        dataShopList[index].colorConfirmShop = colorConfirm
        dataShopList[index].colorRejectShop = colorReject
        dataShopList[index].confirm = confirmShop

        assignData(indexMain, "shopList", JSON.stringify(dataShopList))
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
                    <Icon name={icon} size={15} style={[styles.iconStyle, { color: statusColor }]} />
                    <Text style={[styles.tabHeader, { color: statusColor }]} >{statusConfirm}</Text>
                    {isLock !== 1 && <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                        <Icon name="window-close" size={28} color={colorReject} style={{ padding: 3 }} onPress={onReject} />
                        <Icon name="check-square" size={28} color={colorConfirm} solid style={{ padding: 3 }} onPress={onConfirm} />
                    </View>}
                </View>
                <Text style={{ padding: 3, color: appcolor.dark }}>{valueChange}</Text>
                <Text style={{ padding: 3, color: appcolor.dark }}>{noteChange}</Text>
            </View>
        )
    }
    const renderItemShopList = (item, index, indexMain) => {
        const colorConfirmShop = item.confirm == CONFIRM_VALUE(item.typeId) ? appcolor.success : item.confirm == REJECT_VALUE(item.typeId) ? appcolor.danger : appcolor.rejection
        return (
            <View style={{ flex: 1 }}>
                {item.statusChangeShop !== undefined && item.statusChangeShop.length > 0 &&
                    <Text style={[styles.titleView, { marginStart: 8, color: colorConfirmShop, fontWeight: '500' }]}> {item.statusChangeShop}</Text>}
                {item.shopId !== item.employeeId &&
                    <ListItem.Content style={[styles.shopContainer, { marginStart: 8, marginEnd: 8 }]}>
                        <View style={[styles.itemShopContainer, { paddingStart: 2, paddingBottom: 5 }]}>
                            <Icon name="home" size={18} style={[styles.iconStyle]} />
                            <ListItem.Title style={[styles.itemShopText, { fontWeight: '700', fontSize: 15, width: '75%' }]}>{item.shopName}</ListItem.Title >
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                {item.TypeList == 0 ?
                                    <Switch
                                        disabled={item.isLockConfirm == 1}
                                        style={styles.styleSwitchView}
                                        ios_backgroundColor={appcolor.gray}
                                        trackColor={{ true: appcolor.success, false: appcolor.lightgray }}
                                        thumbColor={appcolor.dark}
                                        //Event
                                        value={item.status == 1} onValueChange={() => toggleSwitch(index, indexMain)} />
                                    :
                                    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                        <Icon name="window-close" size={28} color={item.colorRejectShop} style={{ padding: 3 }}
                                            onPress={() => handlerConfirmShop(item, REJECT_VALUE(item.typeId), index, indexMain)} />
                                        <Icon name="check-square" size={28} color={item.colorConfirmShop} solid style={{ padding: 3 }}
                                            onPress={() => handlerConfirmShop(item, CONFIRM_VALUE(item.typeId), index, indexMain)} />
                                    </View>
                                }
                            </View>
                        </View>
                        <Text style={[styles.itemShopText, { fontSize: 13 }]}>{item.address}</Text>
                        <Text style={[styles.itemShopText, { fontSize: 13, fontWeight: '700' }]}>{item.notes}</Text>
                        <RenderTextInput item={item} index={index} handleChangeNote_SHOP={handleChangeNote_SHOP} typeConfirm="SHOP" styles={styles} appcolor={appcolor} indexMain={indexMain} />
                    </ListItem.Content>
                }
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        const indexMain = item.indexMain;
        if (index === 0 && !item.isParent) {
            item.isParent = true
        }
        if (index === 0 && !item[`${item.employeeId}${item.auditDate}`]) {
            item[`${item.employeeId}${item.auditDate}`] = true
        }
        return (
            <Fragment>
                {
                    item.isParent &&
                    <View style={[styles.titleContainer, { marginLeft: 12 }]}>
                        <Icon solid name="user" size={18} style={{ color: appcolor.primary, paddingEnd: 8 }} />
                        <ListItem.Title style={{ color: appcolor.primary, fontSize: scaleSize(16), fontWeight: 'bold' }}>Nhân viên: {item.employeeName}</ListItem.Title>
                    </View>
                }
                < View style={{ flex: 1, backgroundColor: appcolor.surface, margin: 7 }}>
                    <View key={index}>
                        {item[`${item.employeeId}${item.auditDate}`] &&
                            <View >
                                <View style={[styles.titleContainer, { marginStart: 8 }]}>
                                    <Icon solid name="calendar-day" size={18} style={{ color: appcolor.dark, paddingEnd: 8 }} />
                                    <ListItem.Title style={{ color: appcolor.dark, fontSize: 16 }}>{item.dayName}</ListItem.Title>
                                </View>
                                <ListItem.Content style={[styles.shopContainer, { marginStart: 8, marginEnd: 8 }]}>
                                    <View style={[styles.itemShopContainer, { paddingStart: 2, paddingBottom: 5 }]}>
                                        <Icon name="home" size={18} style={[styles.iconStyle]} />
                                        <ListItem.Subtitle style={[styles.itemShopText, { fontWeight: '700', fontSize: 15 }]}>{item.shopName}</ListItem.Subtitle>
                                    </View>
                                    {item.shiftName !== null && (
                                        <View style={[styles.itemShopContainer, { paddingStart: 2, paddingBottom: 5 }]}>
                                            <Icon name="dot-circle" size={18} style={[styles.iconStyle]} />
                                            <ListItem.Subtitle style={[styles.itemShopText, { fontSize: 13 }]}>{item.shiftName}</ListItem.Subtitle>
                                        </View>
                                    )}
                                    {item.confirmStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="SHIFT" />}
                                    {item.confirmStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="SHIFT" styles={styles} appcolor={appcolor} />)}
                                    {item.confirmLateStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="LATE" />}
                                    {item.confirmLateStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="LATE" styles={styles} appcolor={appcolor} />)}
                                    {item.confirmEarlierStatus !== null && <RenderViewConfirm item={item} index={index} dataIndex={index} typeConfirm="EARLIER" />}
                                    {item.confirmEarlierStatus !== null && (<RenderTextInput item={item} index={index} handleChangeNote={handleChangeNote} typeConfirm="EARLIER" styles={styles} appcolor={appcolor} />)}
                                </ListItem.Content>
                                {item.shopList !== '[]' &&
                                    <TouchableOpacity onPress={() => handleExpanded(item, index)} style={styles.shopListView}>
                                        <Text style={{ color: appcolor.primary, fontSize: 15, fontWeight: '700' }}>Danh sách cửa hàng</Text>
                                        <Icon name="chevron-down" size={18} style={{ color: appcolor.primary, marginRight: 8, position: 'absolute', end: 0 }} solid={true} />
                                    </TouchableOpacity>
                                }
                            </View>
                        }
                        {item.expandShops == 1 &&
                            <View>
                                <FlatList
                                    style={{ flex: 1, backgroundColor: appcolor.grayLight, margin: 8, padding: 8, borderRadius: 10 }}
                                    keyExtractor={(_, idx) => idx.toString()}
                                    data={JSON.parse(item.shopList)}
                                    renderItem={({ item, index }) => renderItemShopList(item, index, indexMain)}
                                />
                            </View>
                        }
                    </View>
                </View >
            </Fragment>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        shopContainer: { padding: 10, borderRadius: 10, backgroundColor: appcolor.lightgray, marginBottom: 5 },
        itemShopContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', textAlignVertical: 'center', padding: 0, width: '100%', },
        itemShopText: { color: appcolor.dark, fontSize: 13, width: '90%', padding: 3, fontWeight: '500' },
        iconContainer: { width: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
        iconHeaderStyle: { color: appcolor.primary },
        iconStyle: { color: appcolor.dark, paddingEnd: 5 },
        inputShop: { width: '100%', color: appcolor.dark, borderColor: appcolor.darkslategray, borderWidth: 0.5, borderRadius: 3, padding: 8, marginBottom: 3 },
        checkBoxContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '50%', },
        filterStyle: { width: '95%', fontSize: 13, alignSelf: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greylight, padding: 8 },
        titleConfirm: { marginStart: 3, flexDirection: 'row', alignItems: "center" },
        titleContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', padding: 8 },
        titleView: { color: appcolor.dark, fontWeight: '500', fontSize: 14, padding: 3 },
        tabHeader: { color: appcolor.primary, fontWeight: '600', fontSize: 15, padding: 3 },
        bordertab: { width: '100%', borderTopColor: appcolor.darkslategray, borderTopWidth: 1, flexDirection: 'column' },
        shopListView: { padding: 8, borderRadius: 10, backgroundColor: appcolor.light, marginBottom: 5, marginStart: 8, marginEnd: 8, flexDirection: 'row', alignItems: 'center' }
    })
    useEffect(() => {
        LoadDataPlan(0)
    }, []);
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom title={route?.params?.titlePage || 'Xác nhận lịch làm  việc SR'}
                iconRight='cloud-upload-alt'
                iconMiddle='search'
                leftFunc={() => navigation.goBack()}
                rightFunc={handleSubmit}
                middleFunc={() => handleDisplayBS("EMPLOYEE")}
            />
            <View style={styles.mainContainer}>
                <CalendarStrip
                    scrollable={true}
                    scrollerPaging={true}
                    style={{ flexDirection: 'row', height: 80, paddingTop: 8, paddingBottom: 8 }}
                    minDate={'2023-01-01'}
                    calendarHeaderStyle={{ color: 'white', marginBottom: 16 }}
                    calendarColor={DEFAULT_COLOR}
                    dateNumberStyle={{ color: 'white' }}
                    dateNameStyle={{ color: 'white' }}
                    customDatesStyles={customDatesStyles}
                    highlightDateContainerStyle={{ backgroundColor: 'white' }}
                    highlightDateNumberStyle={{ color: 'black' }}
                    highlightDateNameStyle={{ color: 'black' }}
                    disabledDateNameStyle={{ color: 'grey' }}
                    disabledDateNumberStyle={{ color: 'grey' }}
                    iconLeft={require('../../../Themes/Images/chevron-left.png')}
                    iconRight={require('../../../Themes/Images/chevron-right.png')}
                    iconContainer={{ flex: 0.1 }}
                    markedDates={markedDates}
                    selectedDate={dateSelected}
                    onDateSelected={loadPlanByDate}
                    scrollToOnSetSelectedDate={false}
                    // onWeekChanged={ANDROID_loadPlanByWeek}
                    calendarAnimation='sequence'
                />
                {!refreshing && data.length === 0 && (
                    <View style={{ width: "100%", justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Text style={{ color: appcolor.onBackground, fontSize: 18 }}>Không có yêu cầu phê duyệt</Text>
                    </View>
                )}
                <LoadingView title={'Đang tải dữ liệu...'} isLoading={refreshing} styles={{ marginTop: 8 }} />
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 50}>
                    <View >
                        <FlatList
                            refreshControl={<RefreshControl
                                progressBackgroundColor={appcolor.warning}
                                colors={[appcolor.info, appcolor.warning]}
                                titleColor={appcolor.onBackground}
                                tintColor={appcolor.onBackground}
                                refreshing={false}
                                onRefresh={refreshDataPlan}
                            />}
                            nestedScrollEnabled={true}
                            style={{ width: '100%', height: '100%', marginBottom: 20 }}
                            keyExtractor={useCallback((_, index) => index.toString(), [])}
                            data={data}
                            renderItem={renderItem} />
                    </View>
                </KeyboardAvoidingView>
            </View>
            <Modal animationType="slide" visible={visibleBS}>
                <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.surface, height: '100%', padding: 10, overflow: 'hidden' }}>
                    <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: PaddingTopIPX }}>
                        <Text h4 style={{ fontWeight: '500', color: appcolor.dark, textAlign: 'center' }}>
                            Danh sách nhân viên
                        </Text>
                        <TouchableOpacity onPress={() => setVisibleBS(false)}>
                            <Icon name="times" size={25} color={appcolor.primary} />
                        </TouchableOpacity>
                    </View>
                    <FormGroup containerStyle={styles.filterStyle} placeholder={"Tìm kiếm..."}
                        editable handleChangeForm={onFilterContentBS} multiline iconName='search' />
                    <RenderContentModal currentBS={currentBS} onSelectItemBS={onSelectItemBS}
                        appcolor={appcolor} onClearItemSelectedBS={onClearItemSelectedBS} />
                </SafeAreaView>
            </Modal>
        </View>
    )
}
const RenderContentModal = ({ appcolor, onSelectItemBS, currentBS, onClearItemSelectedBS }) => {
    const key = currentBS.type === "EMPLOYEE" ? "employeeName" : currentBS.type === "SHIFT" ? "Name" : "title"
    return (
        <FlatList
            showsVerticalScrollIndicator={true}
            data={currentBS.list}
            listKey="list"
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
                const isExists = currentBS.type === "EMPLOYEE" ? currentBS.employee === item : currentBS.label === item[key]
                return (
                    <ListItem key={index} onPress={() => onSelectItemBS(item)} containerStyle={{ backgroundColor: isExists ? appcolor.primary : appcolor.light }} >
                        <ListItem.Content style={{ color: appcolor.dark, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                            {item.isShiftSelectable && <Icon name="thumbs-up" size={16} style={{ color: appcolor.helper, marginRight: 7, }} />}
                            {item.isShiftExisted && <Icon name="check-circle" size={16} style={{ color: appcolor.info, marginRight: 7, }} />}
                            {item.isShiftCoincident && <Icon name="exclamation" size={16} style={{ color: appcolor.warning, marginRight: 7, }} />}
                            <ListItem.Title style={{ color: appcolor.dark, fontSize: 16, padding: 1, }}>{item[key]}</ListItem.Title>
                        </ListItem.Content>
                        {isExists && (
                            <TouchableOpacity onPress={() => onClearItemSelectedBS(currentBS.index)}>
                                <Icon name="backspace" size={18} color={appcolor.primary} />
                            </TouchableOpacity>
                        )}
                    </ListItem>)
            }} />
    )
}
const RenderTextInput = ({ item, index, handleChangeNote, handleChangeNote_SHOP, typeConfirm, styles, appcolor, indexMain }) => {
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
    return (
        <TextInput editable={isLock == 0 ? true : false} defaultValue={value} multiline={true} style={styles.inputShop}
            placeholderTextColor={appcolor.placeholderText} placeholder={titleNote} onChangeText={handleChange} />
    )
}
export default ConfirmSR;
