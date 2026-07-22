import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import { Badge, Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { getDataSuggestTimeSheet, UpdateSuggestTimeSheet } from "../../Controller/TimeSheetController";
import { groupDataByKey, MessageAction, MessageInfo, UUIDGenerator } from "../../Core/Helper";
import { deviceHeight, deviceWidth } from "../../Core/Utility";
import FormGroup from "../../Content/FormGroup";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { LoadingView } from "../../Control/ItemLoading";
import NativeCamera from "../../Control/NativeCamera";
import { deleteItemPhotoByType, deleteItemPhotoDuplicate, getPhotoByTypeDesc } from "../../Controller/DisplayController";
import { MultipleShowImage } from "../../Control/MultipleShowImage";
import { URLDEFAULT } from "../../Core/URLs";
import UploadController from "../../Controller/UploadController";
import { REPORT } from "../../API/ReportAPI";
import InputIdea from "../Kaizen/Page/InputIdea";
import { PhotoInput } from "./Page/PhotoInput";
import { toastError, toastSuccess } from "../../Utils/configToast";
import { Overlay } from "@rneui/base";
import { deletePhoto } from "../../Controller/PhotoController";
import ViewPictures from "../../Control/Gallary/ViewPictures";

const itemTimeSheet = [
    { 'code': 1, 'id': 1, 'name': 'Default', 'nameVN': 'Đề xuất', 'nameData': 'dataDefault', 'nameJson': 'jsonDataDefault' },
    { 'code': 2, 'id': 2, 'name': 'Submit', 'nameVN': 'Chờ xác nhận', 'nameData': 'dataSubmit', 'nameJson': 'jsonDataSubmit' },
    { 'code': 3, 'id': 3, 'name': 'Confirm', 'nameVN': 'Xác nhận', 'nameData': 'dataConfirm', 'nameJson': 'jsonDataConfirm' },
    { 'code': 4, 'id': 4, 'name': 'Reject', 'nameVN': 'Từ chối', 'nameData': 'dataReject', 'nameJson': 'jsonDataReject' },
    { 'code': 5, 'id': 5, 'name': 'Lock', 'nameVN': 'Khóa', 'nameData': 'dataLock', 'nameJson': 'jsonDataLock' },
]
const DATE = new Date()

export const AttendantIssue = ({ navigation, route }) => {
    const { appcolor, kpiinfo, userInfo } = useSelector(state => state.GAppState)
    const { menuitem } = route?.params || {};
    const [indexTab, setIndexTab] = useState(itemTimeSheet[0])
    const [itemDate, setItemDate] = useState({ fromDate: '', toDate: '', currentYear: parseInt(moment().format("YYYY")), currentMonth: parseInt(moment().format("MM")) })
    const [data, setData] = useState({ dataDefault: [], dataSubmit: [], dataConfirm: [], dataReject: [], dataLock: [] })
    const monthSheet = useRef()
    const tabRef = useRef()
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })

    const loadAllData = async (fromDate, toDate) => {
        await setLoading(true)
        let groupData = { dataDefault: [], dataSubmit: [], dataConfirm: [], dataReject: [], dataLock: [] }
        let jsonData = { jsonDataDefault: '', jsonDataSubmit: '', jsonDataConfirm: '', jsonDataReject: '', jsonDataLock: '' }
        await itemTimeSheet.map(async it => {
            jsonData[it.nameJson] = JSON.stringify({ "pageType": kpiinfo.id, "fromDate": fromDate || moment().format("YYYYMM01"), "toDate": toDate || moment().format("YYYYMMDD"), "statusId": it.code })
        })
        const listData = [
            getDataSuggestTimeSheet(jsonData.jsonDataDefault, 'dataDefault', 1),
            getDataSuggestTimeSheet(jsonData.jsonDataSubmit, 'dataSubmit', 2),
            getDataSuggestTimeSheet(jsonData.jsonDataConfirm, 'dataConfirm', 3),
            getDataSuggestTimeSheet(jsonData.jsonDataReject, 'dataReject', 4),
            getDataSuggestTimeSheet(jsonData.jsonDataLock, 'dataLock', 5)
        ]

        await Promise.all(listData)
            .then(async (datas) => {
                await datas.map(async res => {
                    const { arr } = groupDataByKey({
                        arr: res.data,
                        key: "employeeId"
                    })
                    groupData[res.nameData] = res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr

                })
            })
            .catch((error) => {
                console.log('error');
            })
        await setData(groupData)
        await setLoading(false)
        // await setData({ dataDefault: dataDefault, dataSubmit: dataSubmit, dataConfirm: dataConfirm, dataReject: dataReject, dataLock: dataLock })
    }

    const loadAllDataNew = async (fromDate, toDate) => {
        await setLoading(true)
        let dataGroup = { dataDefault: [], dataSubmit: [], dataConfirm: [], dataReject: [], dataLock: [] }
        const jsonFilter = { reportId: kpiinfo.id, pageType: kpiinfo.id, fromDate: fromDate || moment().format("YYYYMM01"), toDate: toDate || moment().format("YYYYMMDD"), statusId: 1 }

        await REPORT.GetDataReportByShop_RealTime(jsonFilter, async (mData) => {
            const dataMain = mData || []
            const dataDefault = JSON.parse(dataMain[0]?.dataDefault || '[]')
            const dataSubmit = JSON.parse(dataMain[0]?.dataSubmit || '[]')
            const dataConfirm = JSON.parse(dataMain[0]?.dataConfirm || '[]')
            const dataReject = JSON.parse(dataMain[0]?.dataReject || '[]')
            const dataLock = JSON.parse(dataMain[0]?.dataLock || '[]')
            dataGroup = {
                dataDefault: groupData(dataDefault, 'dataDefault'),
                dataSubmit: groupData(dataSubmit, 'dataSubmit'),
                dataConfirm: groupData(dataConfirm, 'dataConfirm'),
                dataReject: groupData(dataReject, 'dataReject'),
                dataLock: groupData(dataLock, 'dataLock'),
            };
            setData(dataGroup)
        })

        await setLoading(false)
    }

    const groupData = useCallback((data, tabType) => {
        let dataGroup = []
        const { arr } = groupDataByKey({
            arr: data,
            key: "employeeId"
        })
        dataGroup = (tabType !== 'dataDefault' && tabType !== 'dataSubmit' ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr)
        return dataGroup
    }, [])

    const filterData = (data) => {
        let dataFilter = []

        data.map(item => {
            if (item.isParent) {
                let dataByEmployee = []
                data.map(it => {
                    if (it.employeeId === item.employeeId) {
                        dataByEmployee.push(it)
                    }
                })
                dataFilter.push({
                    employeeId: item.employeeId,
                    employeeName: item.employeeName,
                    dataByEmployee: dataByEmployee,
                    totalRow: data.length
                })
            }
        })
        return dataFilter
    }

    const loadData = async (fromDate, toDate, itemTab, itemTabUpdate) => {
        await setLoading(true)
        let jsonTab = JSON.stringify({ "pageType": kpiinfo.id, "fromDate": fromDate || moment().format("YYYYMM01"), "toDate": toDate || moment().format("YYYYMMDD"), "statusId": itemTab.code })
        let jsonTabUpdate = JSON.stringify({ "pageType": kpiinfo.id, "fromDate": fromDate || moment().format("YYYYMM01"), "toDate": toDate || moment().format("YYYYMMDD"), "statusId": itemTabUpdate.code })
        let dataTab = []
        let dataTabUpdate = []
        const listData = [
            getDataSuggestTimeSheet(jsonTab, itemTab.nameData, itemTab.code),
            getDataSuggestTimeSheet(jsonTabUpdate, itemTabUpdate.nameData, itemTabUpdate.code),
        ]
        await Promise.all(listData)
            .then(async (datas) => {
                await datas.map(async res => {
                    if (res.statusId === 200) {
                        const { arr } = groupDataByKey({
                            arr: res.data,
                            key: "employeeId"
                        })
                        if (res.code == itemTab.code) {
                            dataTab = res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr
                        } else {
                            dataTabUpdate = res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr
                        }

                    } else {
                        toastError('Cảnh báo', res.messager)
                    }
                })
            })
            .catch((error) => {
                console.log('error');
            })
        await setData({ ...data, [itemTab.nameData]: dataTab, [itemTabUpdate.nameData]: dataTabUpdate })
        await setLoading(false)
        // await setLoading(true)
        // let arrData = [] 
        // let json = JSON.stringify({ "fromDate": fromDate || moment().format("YYYYMM01"), "toDate": toDate || moment().format("YYYYMMDD"), "statusId": item?.code || 1 })
        // const res = await getDataSuggestTimeSheet(json, item ? item.nameData : 'dataDefault', item?.code || 1 )
        // if (res.statusId === 200) {
        //     const { arr } = groupDataByKey({
        //         arr: res.data,
        //         key: "employeeId"
        //     })
        //     console.log(arr);
        //     arrData = (res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr)
        //     // res.code > 2 ? (setData({ ...data, [item.nameData]: res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr })) : (setData({ ...data, dataSubmit: arr }))
        // } else {
        //     MessageInfo(res.messager)
        // }
        // await setData({ ...data, [item ? item.nameData : 'dataDefault' ]: arrData })
        // await setLoading(false)
    }

    const deletePhoto = async () => {
        await deleteItemPhotoByType('AttendantIssue')
    }

    useEffect(() => {
        deletePhoto()
        // loadAllData()
        loadAllDataNew()
        return () => false
    }, [])

    const handleSelectTab = (item, index) => {
        setIndexTab(item)
        tabRef.current.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5
        })
    }

    const renderItem = ({ item, index }) => {
        const onPress = () => {
            handleSelectTab(item, index)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ minWidth: 50, padding: 8, borderRadius: 40, backgroundColor: indexTab.code == item.code ? appcolor.primary : appcolor.light, marginRight: item.code == 5 ? 20 : 5, marginHorizontal: 5 }}
            >
                <Text style={{ color: indexTab.code == item.code ? appcolor.white : appcolor.dark, fontWeight: '600', fontSize: 16 }}>
                    {item.nameVN}
                </Text>
                {
                    (data[item.nameData][0]?.totalRow > 0 || data[item.nameData].length > 0) &&
                    <Badge value={item.code > 2 ? (data[item.nameData][0]?.totalRow || 0) : data[item.nameData].length} status={'warning'} containerStyle={{ position: 'absolute', top: -5, right: -5 }} />
                }
            </TouchableOpacity>
        )
    }

    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }

    const handleCloseMonth = async () => {
        let coverMonth = filter.month < 10 ? '0' + filter.month.toString() : filter.month.toString()
        let coverYear = filter.year.toString()
        let coverDay = new Date(coverYear, coverMonth, 0).getDate().toString()
        setItemDate({ ...itemDate, fromDate: `${coverYear}${coverMonth}01`, toDate: `${coverYear}${coverMonth}${coverDay}`, currentMonth: filter.month })
        loadAllDataNew(`${coverYear}${coverMonth}01`, `${coverYear}${coverMonth}${coverDay}`)
    }

    const showMonth = async () => {
        await monthSheet.current.show()
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.onBackground }}>
            <HeaderCustom
                rightFunc={() => showMonth()}
                iconRight="calendar"
                // titleRight={removeList?.length + ""}
                leftFunc={() => navigation.goBack()} title={menuitem?.menuNameVN || "Đề xuất chấm công"} />

            <View style={{
                height: '100%', width: deviceWidth, width: deviceWidth,
            }}>
                <View style={{ padding: 5, borderRadius: 40, margin: 5 }}>
                    <FlatList
                        ref={tabRef}
                        data={itemTimeSheet}
                        contentContainerStyle={{ borderRadius: 40, padding: 5 }}
                        style={{ borderRadius: 40, }}
                        horizontal
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={renderItem}
                        showsHorizontalScrollIndicator={false}

                    />
                </View>
                <View style={{ flex: 1 }}>
                    {
                        loading &&
                        <LoadingView isLoading={loading} title='Đang lấy dữ liệu' />
                        // <View style={{ width: '100%', position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
                        //     <Progress.CircleSnail thickness={1} size={65} indeterminate={true} />
                        //     <Text style={{ color: '#007AFF' }}>Đang lấy dữ liệu...</Text>
                        // </View>
                    }

                    {
                        !loading && indexTab.code < 3 &&
                        <FlatList
                            key={`listTimeSheet_${indexTab.code}`}
                            data={indexTab.code == 1 ? data.dataDefault : (indexTab.code == 2 ? data.dataSubmit : indexTab.code == 3 ? data.dataConfirm : (indexTab.code == 4 ? data.dataReject : data.dataLock))}
                            keyExtractor={(_, index) => index.toString()}
                            style={{ padding: 5, flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
                            renderItem={({ item, index }) => <RenderItemTimeSheet key={indexTab.code + item.workDate} item={item} index={index} appcolor={appcolor} indexTab={indexTab} itemDate={itemDate} loadAllDataNew={loadAllDataNew} />}
                            ListFooterComponent={<View style={{ height: deviceHeight / 2, width: deviceWidth }} />}
                            showsHorizontalScrollIndicator={false}
                            refreshing={loading}
                            onRefresh={() => loadAllDataNew(itemDate.fromDate, itemDate.toDate)}
                        />
                    }
                    {
                        (!loading && indexTab.code > 2) &&
                        <FlatList
                            key={`listTimeSheet_${indexTab.code}`}
                            data={indexTab.code == 3 ? data.dataConfirm : (indexTab.code == 4 ? data.dataReject : data.dataLock)}
                            keyExtractor={(_, index) => index.toString()}
                            style={{ padding: 5, flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, }}
                            renderItem={({ item, index }) => <ViewTimeSheet item={item} index={index} appcolor={appcolor} indexTab={indexTab} itemDate={itemDate} data={data} />}
                            ListFooterComponent={<View style={{ height: deviceHeight / 2, width: deviceWidth }} />}
                            showsHorizontalScrollIndicator={false}
                            refreshing={loading}
                            onRefresh={() => loadAllDataNew(itemDate.fromDate, itemDate.toDate)}
                        />
                    }
                </View>
            </View>

            <ActionSheet
                ref={monthSheet}
                containerStyle={{ backgroundColor: appcolor.surface, borderWidth: 0.2, borderColor: appcolor.dark }}
                onClose={() => handleCloseMonth()}
                initialOffsetFromBottom={1}
                gestureEnabled={true}
                indicatorColor={'#f0f0f0'}
                defaultOverlayOpacity={0.5}
            >
                <View style={{ width: deviceWidth, minHeight: '40%', paddingBottom: 30 }} >
                    <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                </View>
            </ActionSheet>
        </View>
    )
}

const ViewTimeSheet = ({ item, index, appcolor, indexTab, itemDate, data }) => {
    const [isShowTimeSheet, setShowTimeSheet] = useState(false)
    const [itemTab, setItemTab] = useState(indexTab)
    if (indexTab.code !== itemTab.code) {
        setShowTimeSheet(false)
        setItemTab(indexTab)
    }
    return (
        <View>
            <TouchableOpacity
                onPress={() => indexTab.code > 2 ? setShowTimeSheet(e => !e) : null}
                style={{ padding: 8, marginTop: index !== 0 ? 20 : 5, margin: 5, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', }}>
                    <Icon size={20} color={appcolor.dark} style={{ paddingRight: 20 }} name={isShowTimeSheet ? "chevron-down" : "chevron-right"} type="font-awesome-5" />
                    <Text style={{ color: appcolor.dark, fontWeight: '900', fontSize: 16 }}>{`${item.employeeName}`}</Text>
                </View>
                <Text style={{ color: appcolor.dark, fontWeight: '900', fontSize: 18 }}>{item.dataByEmployee?.length}</Text>
            </TouchableOpacity>
            {
                isShowTimeSheet &&
                <FlatList
                    key={'listTimeSheet'}
                    data={item.dataByEmployee}
                    keyExtractor={(_, index) => index.toString()}
                    style={{ padding: 5, flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, }}
                    renderItem={({ item, index }) => <RenderItemTimeSheet key={`itemAttendant_${item.tabId}_${item.attendantId}_${item.workDate}`} item={item} index={index} appcolor={appcolor} indexTab={indexTab} itemDate={itemDate} data={data} />}
                    ListFooterComponent={((index + 1) == item.totalRow) ? <View style={{ height: deviceHeight / 2, width: deviceWidth }} /> : <View />}
                    showsHorizontalScrollIndicator={false}
                />
            }
        </View>
    )
}
const RenderItemTimeSheet = ({ item, index, indexTab, itemDate, loadAllDataNew }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [isShowShop, setShowShop] = useState(false)
    const [isShowReason, setShowReason] = useState(false)
    const [isShowShift, setShowShift] = useState(false)
    const [selectReason, setSelectReason] = useState({})
    const [note, setNote] = useState('')
    const [subNote, setSubNote] = useState('')
    const reasonSheet = useRef()
    const shopSheet = useRef()
    const shiftSheet = useRef()
    const listReason = Array.isArray(item.listReason) ? item.listReason : JSON.parse(item.listReason ?? '[]')
    const shopDetail = Array.isArray(item.shopDetail) ? item.shopDetail : JSON.parse(item.shopDetail ?? '[]')
    const listShift = Array.isArray(item.shiftDetail) ? item.shiftDetail : JSON.parse(item.shiftDetail ?? '[]')
    // 
    const [currentShift, setCurrentShift] = useState(item.shiftCode)
    const [shiftPlan, setShiftPlan] = useState(item.shiftPlan)
    const [checkTotalTime, setCheckTotalTime] = useState(false)

    const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 })
    const [visible, setVisible] = useState(false)
    const [reload, setReload] = useState(false)
    const [mutate, setMutate] = useState(false)

    const [shopPermission, setShopPermission] = useState(Array.isArray(item.shopPermission) ? item.shopPermission : JSON.parse(item.shopPermission ?? '[]'))
    const [overlayVisible, setOverlayVisible] = useState(false)
    const [configCheckTimeStore, setConfigCheckTimeStore] = useState({ isCheckTimeStore: item.isCheckTimeStore || 0, isAddNewStore: item.isAddNewStore || 0, isEditShopEmpty: item.isEditShopEmpty || 0 })

    const [showShopList, setShowShopList] = useState(false)
    const [isHideReasonButton, setHideReasonButton] = useState(false)
    const isSkipReason = Number(item.isCountExplain) === 1 || Number(item.isCountExplain) === 2

    const handleAddStore = (itemStore) => {
        // check NumberValue in item attendantIssueShopPermission to add store in shopDetail = NumberValue in shiftDetail
        const countShop = shopDetail.filter(it => it.ShopId > 0 && it.isShopAdded == 1).length
        const checkShift = listShift.find(it => it.ShiftCode === currentShift)
        if (checkShift?.NumberValue && countShop >= checkShift.NumberValue) {
            MessageInfo(`Bạn chỉ được thêm tối đa ${checkShift.NumberValue} cửa hàng trong ca ${checkShift.ShiftName}`)
            return
        }
        const newShop = {
            ShopId: itemStore.ShopId,
            ShopCode: itemStore.ShopCode,
            ShopName: itemStore.ShopName,
            TimeCI: null,
            TimeCO: null,
            TimeCI_Update: null,
            TimeCO_Update: null,
            TotalTime_Update: null,
            isCheckTimeStore: configCheckTimeStore.isCheckTimeStore || 1,
            Evidence: [],
            guid: UUIDGenerator(),
            isAddEvidence: 1,
            isShopAdded: 1
        }
        shopDetail.push(newShop)
        setShowShop(false)
        setShowShopList(false)

    }

    const [listPhotoItem, setListPhotoItem] = useState({
        itemTakePicture: {
            photoName: "camera",
            photoType: 'AttendantIssue',
            photoDesc: `${item.tabId}_${item.attendantId}`,
            reportId: kpiinfo.id,
            shopId: 0,
            shopCode: '0',
            photoDate: moment(new Date()).format('YYYYMMDD').toString(),
            photoPath: null
        },
        listPhoto: []
    })
    const loadListPhoto = () => {
        const listEvident = JSON.parse(item.evidence || '[]')
        listPhotoItem.listPhoto = listEvident
        setReload(e => !e)
    }
    const reloadView = () => {
        setReload(e => !e)
    }

    useEffect(() => {
        if (JSON.parse(item.evidence || '[]').length > 0) {
            loadListPhoto()
        }
        return () => false
    }, [])

    const renderItemReason = ({ item, index }) => {
        const onSelectReason = () => {
            if (selectReason.Code === item.Code) {
                setSelectReason({})
            } else {
                setSelectReason(item)
                reasonSheet.current.hide()
            }
        }
        return (
            <TouchableOpacity
                onPress={() => onSelectReason()}
                style={{ width: '100%', padding: 8, backgroundColor: selectReason.Code == item.Code ? appcolor.grayLight : appcolor.light, marginVertical: 5, borderRadius: 10 }}
            >
                <Text style={{ fontSize: 12, color: selectReason.Code == item.Code ? appcolor.black : appcolor.dark, }}>{item.Reason}</Text>
            </TouchableOpacity>
        )
    }
    const handleSelectShift = async (itemShift) => {
        // clear data shop detail when change shift
        const listShopDetail = [...shopDetail]
        listShopDetail.forEach((it, idx) => {
            if (it.isShopAdded == 1) {
                const index = shopDetail.findIndex(x => x.ShopId === it.ShopId);
                if (index !== -1) {
                    shopDetail.splice(index, 1);
                }
            }
        })
        // clear data reason when change shift
        if (itemShift.RefCode == 'OFF') {
            setHideReasonButton(true)
            setSelectReason({})
        } else {
            const checkTime = checkHalfShiftOver4Hours(itemShift)
            if (checkTime.isHalfShift) {
                if (!checkTime.isValid) {
                    setHideReasonButton(false)
                } else {
                    setHideReasonButton(true)
                    setSelectReason({})
                }
            } else {
                setHideReasonButton(false)
            }
        }

        await setCurrentShift(itemShift.ShiftCode)
        await setShiftPlan(itemShift.RefCode)
        // await setCheckTotalTime(checkHalfShiftOver4Hours(itemShift))
        await shiftSheet.current.hide()
    }

    const checkHalfShiftOver4Hours = (selectedShift, type) => {

        const isHalfOnShift =
            selectedShift?.RefCode === 'ON' &&
            Number(selectedShift?.TotalTime) === 0.5;

        if (!isHalfOnShift) return { isHalfShift: false, totalMinutes: 0, totalHours: 0, isValid: false }; // > 4 tiếng;

        let totalMinutes = 0;

        //kiểm tra nếu isCheckTimeStore == 1 thì lấy shop id > 0, ngược lại thì lấy shopId = null || shopId = 0
        const isCheckTimeStore = Number(configCheckTimeStore?.isCheckTimeStore);

        if (type != 'update') {
            const [inHourTotal, inMinuteTotal] = item.totalActual.split(':').map(Number);
            if (!isNaN(inHourTotal) && !isNaN(inMinuteTotal)) {
                totalMinutes += inHourTotal * 60 + inMinuteTotal;
            } else {
                const timeCI = item.timeCI?.split('/')?.[0] || "";
                const timeCO = item.timeCO?.split('/')?.[0] || "";

                if (timeCI && timeCO && timeCI !== '00:00' && timeCO !== '00:00') {
                    const [inHour, inMinute] = timeCI.split(':').map(Number);
                    const [outHour, outMinute] = timeCO.split(':').map(Number);
                    if (!isNaN(inHour) && !isNaN(inMinute) && !isNaN(outHour) && !isNaN(outMinute)) {
                        const startMinutes = inHour * 60 + inMinute;
                        const endMinutes = outHour * 60 + outMinute;
                        if (endMinutes > startMinutes) {
                            totalMinutes += (endMinutes - startMinutes);
                        }
                    }
                }
            }
        }
        else {
            const shopFilter = shopDetail.filter(shop => {
                if (isCheckTimeStore === 1 && shopPermission.length > 0) {
                    return shop.ShopId > 0;
                } else {
                    return shop.ShopId == null || shop.ShopId == 0;
                }
            });
            for (const shop of shopFilter) {
                const timeIn = (type == 'update' ? (shop.TimeCI_Update || shop?.TimeCI) : shop?.TimeCI);
                const timeOut = (type == 'update' ? (shop.TimeCO_Update || shop?.TimeCO) : shop?.TimeCO);

                // Bỏ qua dòng không hợp lệ
                if (!timeIn || !timeOut || timeIn === '00:00' || timeOut === '00:00') {
                    continue;
                }

                const [inHour, inMinute] = timeIn.split(':').map(Number);
                const [outHour, outMinute] = timeOut.split(':').map(Number);

                if (
                    isNaN(inHour) || isNaN(inMinute) ||
                    isNaN(outHour) || isNaN(outMinute)
                ) {
                    continue;
                }

                const startMinutes = inHour * 60 + inMinute;
                const endMinutes = outHour * 60 + outMinute;

                // Chỉ cộng nếu giờ ra > giờ vào
                if (endMinutes > startMinutes) {
                    totalMinutes += (endMinutes - startMinutes);
                }
            }
        }
        return {
            isHalfShift: true,
            totalMinutes,
            totalHours: totalMinutes / 60,
            isValid: totalMinutes >= 240
        }; // > 4 tiếng
    };

    const handlerOnCloseShopSheet = () => {
        setShowShop(e => !e)
        setShowShopList(false)
    }

    const renderItemShift = (item, index, keyItemShift) => {
        return (
            <TouchableOpacity
                key={'item_' + keyItemShift}
                onPress={() => handleSelectShift(item)}
                style={{ width: '100%', padding: 8, backgroundColor: currentShift == item.ShiftCode ? appcolor.grayLight : appcolor.light, marginVertical: 5, borderRadius: 10 }}
            >
                <Text style={{ fontSize: 12, color: currentShift == item.ShiftCode ? appcolor.black : appcolor.dark, }}>{item.ShiftName || 'null'}</Text>
            </TouchableOpacity>
        )
    }
    const isValidTime24 = (time) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
        return regex.test(time)
    }
    const handlerEditTime = (value, item, type) => {
        const cleaned = value.replace(/[^0-9]/g, '')
        let time = null
        if (cleaned.length <= 2) { time = cleaned }
        else (time = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4))
        if (type == 'CI') {
            item.TimeCI_Update = time
        } else if (type == 'CO') {
            item.TimeCO_Update = time
        }

        setMutate(e => !e)
    }

    const isValidRange = (ci, co) => {
        if (!isValidTime24(ci) || !isValidTime24(co)) return false
        return toMinutes(co) > toMinutes(ci)
    }
    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
    }
    const calcTotalTime = (ci, co) => {
        if (!isValidRange(ci, co)) return "00:00"
        const diff = toMinutes(co) - toMinutes(ci)
        const h = String(Math.floor(diff / 60)).padStart(2, "0")
        const m = String(diff % 60).padStart(2, "0")
        return `${h}:${m}`
    }
    const handlerEndEditTime = (item) => {
        if ((!isValidTime24(item.TimeCI_Update) && item.TimeCI_Update != null) || (!isValidTime24(item.TimeCO_Update) && item.TimeCO_Update != null)) {
            MessageInfo(`Thời gian "${!isValidTime24(item.TimeCI_Update) && item.TimeCI_Update != null ? 'Check IN' : 'Check OUT'}" không hợp lệ, vui lòng nhập lại theo định dạng HH:mm`)
            return
        }
        if (item.TimeCI_Update != null && item.TimeCO_Update != null) {
            if (!isValidRange(item.TimeCI_Update, item.TimeCO_Update)) {
                MessageInfo(`Thời gian "Check OUT" phải lớn hơn "Check IN", vui lòng nhập lại`)
                return
            }
            const total = calcTotalTime(item.TimeCI_Update, item.TimeCO_Update)
            item.TotalTime_Update = total
        }
        setMutate(e => !e)
    }

    const renderItemShop = (item, index, itemMain) => {
        const guidByShop = (item.guid ? item.guid : UUIDGenerator());
        ((item.guid == null || item.guid == '' || item.guid != guidByShop) ? item.guid = guidByShop : null);
        const listEvidence = item.Evidence ? (Array.isArray(item.Evidence) ? item.Evidence : JSON.parse(item.Evidence)) : []
        const onEditValueCI = (value) => {
            handlerEditTime(value, item, 'CI')
        }
        const onEditValueCO = (value) => {
            handlerEditTime(value, item, 'CO')
        }
        return (
            <View key={`${item.ShopId}_${item.EmployeeId}_${itemMain.workDate}_${index}`} style={{ width: '100%', padding: 8, backgroundColor: appcolor.light, marginVertical: 5, borderRadius: 10 }}>
                <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 16, padding: 5, color: appcolor.dark }}>{item.ShopName}</Text>
                {!item.isShopAdded > 0 &&
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>CheckIn</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>{item.TimeCI}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>CheckOut</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>{item.TimeCO}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>Tổng thời gian</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>{item.TotalTime}</Text>
                        </View>
                    </View>}
                {(item.ShopId > 0 || configCheckTimeStore.isEditShopEmpty == 1) && configCheckTimeStore.isCheckTimeStore == 1 &&
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>CheckIn</Text>
                            <FormGroup
                                value={item.TimeCI_Update ?? ''}
                                inputStyle={{ padding: 0, margin: 0, height: 28, textAlign: 'center' }}
                                containerStyle={{ margin: 4, marginRight: 5, borderWidth: 1, marginBottom: 2 }}
                                editable={indexTab.id == 1} placeholder={'Nhập CI'}
                                useClearAndroid={false}
                                keyboardType="number-pad"
                                onEndEditing={() => handlerEndEditTime(item)}
                                handleChangeForm={onEditValueCI}
                            // handleChangeForm={(value) => handlerEditTime(value, item, 'CI')} multiline
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>CheckOut</Text>
                            <FormGroup
                                value={item.TimeCO_Update || ''}
                                inputStyle={{ padding: 0, margin: 0, height: 28, textAlign: 'center' }}
                                containerStyle={{ margin: 4, marginRight: 5, borderWidth: 1, marginBottom: 2 }}
                                editable={indexTab.id == 1} placeholder={'Nhập CO'}
                                useClearAndroid={false}
                                keyboardType="number-pad"
                                onEndEditing={() => handlerEndEditTime(item)}
                                handleChangeForm={onEditValueCO}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: appcolor.dark }}>Tổng thời gian</Text>
                            <FormGroup
                                value={item.TotalTime_Update || ''}
                                inputStyle={{ padding: 0, margin: 0, height: 28, textAlign: 'center' }}
                                containerStyle={{ margin: 4, marginRight: 5, borderWidth: 1, marginBottom: 2 }}
                                editable={false} placeholder={'Tổng thời gian'}
                                useClearAndroid={false}
                            />
                        </View>
                    </View>
                }
                {
                    (item.ShopId > 0 || configCheckTimeStore.isEditShopEmpty == 1) && configCheckTimeStore.isCheckTimeStore == 1 &&
                    <PhotoInput _guid={guidByShop} itemInput={item} reload={reload} listPhoto={indexTab != 1 ? listEvidence : null} indexTab={indexTab} />
                }
                {
                    item.isShopAdded == 1 &&
                    <TouchableOpacity
                        onPress={() => {
                            const indexShop = shopDetail.findIndex(it => it.guid === item.guid)
                            if (indexShop > -1) {
                                shopDetail.splice(indexShop, 1)
                                setMutate(e => !e)
                            }
                        }}
                        style={{ position: 'absolute', top: 5, right: 5, padding: 8 }}>
                        <Icon name="close" type="antdesign" size={20} color={appcolor.danger} />
                    </TouchableOpacity>
                }
            </View>
        )
    }

    const handleSubmit = async (type) => {
        const checkTime = checkHalfShiftOver4Hours(listShift.find(it => it.ShiftCode === currentShift))
        if (!isSkipReason && (Object.keys(selectReason).length == 0 || selectReason === undefined) && type == 2 && shiftPlan !== 'OFF' && isHideReasonButton == false) {
            toastError('Cảnh báo', 'Chọn lí do trước khi gửi, ngày ' + item.workDate + '!!!')
            return
        } else if (!isSkipReason && selectReason.Code == 100 && type == 2) {
            if (note.replace(/ /g, '') == '') {
                toastError('Cảnh báo', 'Nhập ghi chú trước khi gửi, ngày ' + item.workDate + '!!!')
                return
            } else if (note.replace(/ /g, '').length < 10) {
                toastError('Cảnh báo', 'Nhập ghi chú ít nhất 10 kí tự, ngày ' + item.workDate + '!!!')
                return
            }
        }
        // kiểm tra nếu có isCheckTimeStore = 1 thì phải có ảnh bằng chứng và đã nhập thời gian check in check out
        if (configCheckTimeStore.isCheckTimeStore == 1 && isHideReasonButton == false) {
            let hasShopWithoutEvidence = false
            let hasShopWithoutTime = ''
            let dataShopDetail = Array.isArray(item.shopDetail) ? item.shopDetail : JSON.parse(item.shopDetail || '[]')
            for (let i = 0; i < dataShopDetail.length; i++) {
                let itemShop = dataShopDetail[i]
                const listEvident = (Array.isArray(itemShop.Evidence) ? itemShop.Evidence : JSON.parse(itemShop.Evidence || '[]'))
                if ((itemShop.ShopId > 0 || (configCheckTimeStore.isEditShopEmpty && !itemShop.ShopId)) && listEvident?.length == 0) {
                    hasShopWithoutEvidence = true
                    break
                }
                if ((itemShop.ShopId > 0 || (configCheckTimeStore.isEditShopEmpty && !itemShop.ShopId)) && (!itemShop.TimeCI_Update || !itemShop.TimeCO_Update)) {
                    hasShopWithoutTime = `Ngày ${item.workDate} cửa hàng ${itemShop.ShopCode || ''} thời gian ${!itemShop.TimeCI_Update ? '"Check IN"' : '"Check OUT"'} chưa được nhập, vui lòng kiểm tra lại!!!`
                    break
                }
            }
            if (hasShopWithoutEvidence) {
                toastError('Cảnh báo', `Ngày ${item.workDate} có cửa hàng chưa có ảnh bằng chứng, vui lòng kiểm tra lại!!!`)
                return
            }
            if (hasShopWithoutTime) {
                toastError('Cảnh báo', hasShopWithoutTime)
                return
            }
            // kiểm tra số lượng cửa hàng có đúng với số lượng được phép theo ca không
            const countShop = dataShopDetail.filter(it => it.ShopId > 0).length
            const checkShift = listShift.find(it => it.ShiftCode === currentShift && it.isShopAdded == 1)
            if (checkShift?.NumberValue && countShop != checkShift.NumberValue) {
                toastError('Cảnh báo', `Vui lòng chọn đủ ${checkShift.NumberValue} cửa hàng theo ca đã chọn, ngày ${item.workDate}!!!`)
                return
            }
        }

        if (checkTime.isHalfShift && !checkTime.isValid) {
            const checkTimeUpdate = checkHalfShiftOver4Hours(listShift.find(it => it.ShiftCode === currentShift), 'update')
            if (!checkTimeUpdate.isValid) {
                toastError('Cảnh báo', `Tổng thời gian làm việc chỉ có ${Math.floor(checkTimeUpdate.totalMinutes / 60)}h${checkTimeUpdate.totalMinutes % 60}p, không đủ 4h theo quy định của ca ${currentShift}, ngày ${item.workDate}!!!`)
                return
            }
        }

        let isHaveEvident = false
        if (configCheckTimeStore.isCheckTimeStore == 1 && !isHideReasonButton) {
            let dataShopDetail = Array.isArray(item.shopDetail) ? item.shopDetail : JSON.parse(item.shopDetail || '[]')
            for (let i = 0; i < dataShopDetail.length; i++) {
                let itemShop = dataShopDetail[i]
                const listEvident = (Array.isArray(itemShop.Evidence) ? itemShop.Evidence : JSON.parse(itemShop.Evidence || '[]'))
                if ((itemShop.TimeCI_Update && !isValidTime24(itemShop.TimeCI_Update)) || (itemShop.TimeCO_Update && !isValidTime24(itemShop.TimeCO_Update))) {
                    toastError('Cảnh báo', `Ngày ${item.workDate} ${itemShop.shopId ? `cửa hàng ${itemShop.ShopCode} ` : ''}có thời gian ${!isValidTime24(itemShop.TimeCI_Update) && itemShop.TimeCI_Update ? '"Check IN" không hợp lệ' : '"Check OUT" không hợp lệ'}, định dạng HH:mm!!!`)
                    return
                }
                if (itemShop.TimeCI_Update && itemShop.TimeCO_Update) {
                    if (!isValidRange(itemShop.TimeCI_Update, itemShop.TimeCO_Update)) {
                        toastError('Cảnh báo', `Ngày ${item.workDate} cửa hàng ${itemShop.ShopCode} phải có thời gian "Check OUT" lớn hơn "Check IN", vui lòng nhập lại!!!`)
                        return
                    }
                }
                if ((itemShop.TimeCI_Update && !itemShop.TimeCO_Update) || (!itemShop.TimeCI_Update && itemShop.TimeCO_Update)) {
                    toastError('Cảnh báo', `Ngày ${item.workDate} cửa hàng ${itemShop.ShopCode} phải có đầy đủ thời gian "Check IN" và "Check OUT", vui lòng nhập lại!!!`)
                    return
                }
                if (listEvident?.length > 0) {
                    isHaveEvident = true
                    break
                }
            }
        }

        let photoUpload = [];
        listPhotoItem?.listPhoto.forEach(element => {
            if (element.photoPath != null) {
                let fileName = element.photoPath
                if (!element.photoPath.includes('uploaded')) {
                    let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                    fileName = '/uploaded/' + element.photoDate + '/' + ImgName
                }
                photoUpload.push({ photo: fileName, photoPath: fileName });
            }
        });
        const reasonSubmit = isSkipReason ? '' : (selectReason.Code == 5 ? subNote : selectReason.Reason)
        let notify = `Nhân viên ${item.employeeName} vừa ${type == 1 ? 'hủy' : 'gửi'} đề xuất chấm công ngày ${item.workDate}${type == 1 || isSkipReason ? '' : ` với lí do : ${reasonSubmit}`}`
        let dataSubmit = JSON.stringify({
            "reportId": kpiinfo.id,
            "employeeId": item.employeeId,
            "workDate": item.workDate,
            "tabId": item.tabId,
            "statusId": type,
            "subNote": reasonSubmit,
            "note": note,
            "notify": notify,
            "shiftCode": currentShift,
            "evidence": JSON.stringify(photoUpload || '[]') || '[]',
            "shopDetail": item.shopDetail,
            "shiftPlan": shiftPlan
        })

        let indexTabUpdate = itemTimeSheet.find(it => it.code == (type == 2 ? (indexTab.code + 1) : (indexTab.code - 1)));
        (photoUpload.length || isHaveEvident) && await UploadController.PostFile()
        MessageAction('Bạn chắc chắn muốn ' + (type == 1 ? 'hủy' : 'gửi') + ' đề xuất ngày : ' + item.workDate + '?', async () => {
            const result = await UpdateSuggestTimeSheet(dataSubmit)
            if (result.statusId === 200) {
                loadAllDataNew(itemDate.fromDate, itemDate.toDate)
                toastSuccess('Thông báo', result?.messager)
            } else {
                toastError('Cảnh báo', result?.messager)
            }
        })
    }

    const openSheet = (type) => {
        if (type === 'SHOW_SHOP') {
            shopSheet.current.show()
            setShowShop(true)
        } else if (type === 'SHOW_REASON') {
            reasonSheet.current.show()
            setShowReason(true)
        } else if (type === 'SHOW_SHIFT') {
            shiftSheet.current.show()
            setShowShift(true)
        }
    }

    const showItemImage = async (indexImage) => {
        await setDataPhoto({ listPhoto: listPhotoItem.listPhoto, indexImage: indexImage })
        await setVisible(true)
    }

    let noteValue = `${indexTab.code !== 1 && item.submitNote ? 'Ghi chú : ' : ''}${indexTab.code == 1 ? note : (item.submitNote || '')}`

    return (
        <View key={indexTab.code + item.workDate} >
            {
                item.isParent && indexTab.code < 3 &&
                <View style={{ padding: 8, marginTop: index !== 0 ? 20 : 5, margin: 5, borderRadius: 10, flexDirection: 'row' }}>
                    <Text style={{ color: appcolor.dark, fontWeight: '900', fontSize: 16 }}>{`${item.employeeName}`}</Text>
                </View>
            }

            <View style={{ flex: 1, padding: 5, backgroundColor: appcolor.light, margin: 5, borderRadius: 10 }}>
                {
                    indexTab.code == 2 &&
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: item.statusColor || appcolor.dark }}>{item.statusTitle}</Text>
                    </View>
                }

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>{item.workDate}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, paddingRight: 5, color: appcolor.dark }}>{moment(item.endTime).calendar()} </Text>
                        <Icon size={17} name={"stopwatch"} color={appcolor.dark} type="font-awesome-5" />
                    </View>
                </View>
                <View
                    onPress={() => setShowTime(e => !e)}
                    style={{ justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View onPress={() => setShowTime(e => !e)} style={{ flex: 1, padding: 5, flexDirection: 'row' }} >
                            <Text style={{ fontSize: 12, color: appcolor.dark }}>Tổng thời gian : </Text>
                            <Badge value={item.totalActual} status={'error'} />
                        </View>
                        <View style={{ flex: 1, padding: 5, }} ><Text style={{ fontSize: 12, color: appcolor.dark }}>Tại cửa hàng : {item.timeInStore}</Text></View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, padding: 5, }} ><Text style={{ fontSize: 12, color: appcolor.dark }}>Thời gian bắt đầu : {item.timeCI}</Text></View>
                        <View style={{ flex: 1, padding: 5, }} ><Text style={{ fontSize: 12, color: appcolor.dark }}>Thời gian kết thúc : {item.timeCO}</Text></View>
                    </View>
                </View>

                {
                    item.reason && <View style={{ flex: 1, padding: 8, borderRadius: 10, margin: 5, borderWidth: 0.2, borderColor: appcolor.dark }}                >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>* Lý do: {item.reason}</Text>
                        </View>
                    </View>
                }
                {
                    shiftPlan != 'OFF' && !isHideReasonButton &&
                    <TouchableOpacity
                        onPress={() => openSheet('SHOW_SHOP')}
                        style={{ flex: 1, padding: 8, borderRadius: 10, margin: 5, borderWidth: 0.2, borderColor: appcolor.dark }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                <Icon size={18} color={appcolor.dark} style={{ height: 20, width: 20 }} name={isShowShop ? "chevron-down" : "chevron-right"} type="font-awesome-5" />
                                <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>Cửa hàng đi trong ngày </Text>
                            </View>
                            <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>{item.totalShopActual} </Text>
                        </View>
                    </TouchableOpacity>

                }
                <TouchableOpacity
                    onPress={() => indexTab.code == 1 ? openSheet('SHOW_SHIFT') : null} opacity={indexTab.code == 1 ? 0.5 : 1}
                    style={{
                        flex: 1, padding: 10, margin: 5, borderWidth: item.tabId == 1 ? 0.2 : 0, justifyContent: 'center',
                        borderColor: appcolor.dark, backgroundColor: item.tabId == 1 ? appcolor.light : appcolor.surface, borderRadius: 8, height: 35
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        {item.tabId == 1 && <Icon size={18} color={appcolor.dark} style={{ height: 20, width: 20 }} name={isShowShift ? "chevron-down" : "chevron-right"} type="font-awesome-5" />}
                        <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>{currentShift || `${indexTab.code == 1 ? 'Chọn ca' : ''}`}</Text>
                    </View>
                </TouchableOpacity>
                {
                    (indexTab.code == 1 && !isHideReasonButton && !isSkipReason) &&
                    <TouchableOpacity
                        onPress={() => openSheet('SHOW_REASON')}
                        style={{ flex: 1, padding: 8, borderRadius: 10, margin: 5, borderWidth: 0.2, borderColor: appcolor.dark }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: "center" }}>
                            <Icon size={18} color={appcolor.dark} style={{ height: 20, width: 20 }} name={isShowReason ? "chevron-down" : "chevron-right"} type="font-awesome-5" />
                            <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>{selectReason.Reason || 'Chọn lí do'}</Text>
                        </View>
                    </TouchableOpacity>
                }
                {
                    (indexTab.code == 1 && !isHideReasonButton) && Number(item.isCountExplain) == 1 &&
                    <View
                        onPress={() => openSheet('SHOW_REASON')}
                        style={{ flex: 1, padding: 8, borderRadius: 10, margin: 5, borderWidth: 0.2, borderColor: appcolor.dark }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: "center" }}>
                            {/* <Icon size={18} color={appcolor.dark} style={{ height: 20, width: 20 }} name={isShowReason ? "chevron-down" : "chevron-right"} type="font-awesome-5" /> */}
                            <Text style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}>Số lượt còn lại: {item.remainingExplanation}</Text>
                        </View>
                    </View>
                }
                <View >
                    {/* {
                        (selectReason.Code == 100 || indexTab.code !== 1) && <FormGroup value={`${indexTab.code !== 1 ? 'Lí do : ' : ''}${indexTab.code == 1 ? subNote : (item.subNote || '')}`} containerStyle={{ marginLeft: 5, padding: 5, marginBottom: 5, marginRight: 5, borderWidth: 1 }} editable={indexTab.code == 1 ? true : false} multiline placeholder={'Nhập lí do khác'} handleChangeForm={setSubNote} />
                    } */}
                    {
                        (indexTab.code == 1 || (noteValue != '' && indexTab.code != 2)) &&
                        <FormGroup value={noteValue == '' ? null : noteValue} containerStyle={{ marginLeft: 5, marginRight: 5, borderWidth: 1, marginBottom: 5, padding: 5 }} editable={indexTab.code == 1 ? true : false} placeholder={'Nhập ghi chú'} handleChangeForm={setNote} multiline />
                    }
                    {
                        (indexTab.code > 2 && indexTab.code !== 5) && <FormGroup value={'Quản lí ghi chú : ' + (item.confirmNote || ' ')} containerStyle={{ marginLeft: 5, marginRight: 5, borderWidth: 0.2, marginBottom: 0, padding: 5 }} editable={false} multiline />
                    }
                </View>
                <ViewPhotoEvidence key={`photoById_${item.tabId}_${item.attendantId}`} itemAttendant={item} indexAttendant={index} listPhotoItem={listPhotoItem} showItemImage={showItemImage} reload={reload} reloadView={reloadView} />

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                    {
                        indexTab.code < 3 ?
                            <View style={{ flexDirection: 'row', padding: 5 }}>
                                <Icon size={17} name={"clock"} color={appcolor.dark} type="font-awesome-5" />
                                <Text style={{ paddingLeft: 5, color: appcolor.dark, }}>Đếm ngược : </Text>
                                <CountTime item={item} />
                            </View>
                            :
                            <View>

                                {
                                    indexTab.code !== 5 &&
                                    <View style={{ flexDirection: 'row', padding: 5 }}>
                                        <Icon size={17} name={"clock"} color={appcolor.dark} type="font-awesome-5" />
                                        <Text style={{ paddingLeft: 5, color: appcolor.dark, fontSize: 12 }}>Thời gian {indexTab.nameVN} : {moment(item.confirmTime).calendar()}</Text>
                                    </View>
                                }
                                {
                                    indexTab.code !== 5 &&
                                    <View style={{ flexDirection: 'row', padding: 5 }}>
                                        <Icon size={17} name={"user"} color={appcolor.dark} type="font-awesome-5" />
                                        <Text style={{ paddingLeft: 5, color: appcolor.dark, fontSize: 12 }}>{indexTab.nameVN} bởi : {item.confirmBy}</Text>
                                    </View>
                                }
                            </View>
                    }
                    <View style={{ flexDirection: "row" }}>
                        {
                            indexTab.code == 2 && item.isHiddenCancel != 1 &&
                            <TouchableOpacity
                                onPress={() => handleSubmit(1)}
                                style={{ width: 60, justifyContent: 'center', alignItems: 'center', padding: 8, borderRadius: 10, borderWidth: 0.2, borderColor: appcolor.dark }}
                            >
                                <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark, }} >Hủy</Text>
                            </TouchableOpacity>
                        }
                        {
                            indexTab.code == 1 && item.isHiddenSend != 1 &&
                            <TouchableOpacity
                                onPress={() => handleSubmit(2)}
                                style={{ width: 60, justifyContent: 'center', alignItems: 'center', padding: 8, borderRadius: 10, borderWidth: 0.2, borderColor: appcolor.dark }}
                            >
                                <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark, }}>Gửi</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <ActionSheet
                    ref={reasonSheet}
                    containerStyle={{ backgroundColor: appcolor.surface, borderWidth: 0.2, borderColor: appcolor.dark }}
                    onClose={() => setShowReason(e => !e)}
                    initialOffsetFromBottom={1}
                    gestureEnabled={true}
                    indicatorColor={'#f0f0f0'}
                    defaultOverlayOpacity={0.5}
                    keyboardHandlerEnabled={false}
                >
                    <View style={{ width: deviceWidth, maxHeight: deviceHeight / 1.5, minHeight: deviceHeight / 2.5 }} >
                        <FlatList
                            key={item.rowNum + 'ReasonSheet'}
                            style={{ padding: 5 }}
                            keyExtractor={(_, index) => index.toString()}
                            data={listReason}
                            renderItem={renderItemReason}
                        />
                    </View>
                </ActionSheet>
                <ActionSheet
                    ref={shiftSheet}
                    containerStyle={{ backgroundColor: appcolor.surface, borderWidth: 0.2, borderColor: appcolor.dark }}
                    onClose={() => setShowShift(e => !e)}
                    initialOffsetFromBottom={1}
                    keyboardHandlerEnabled={false}
                    gestureEnabled={false}
                    indicatorColor={'#f0f0f0'}
                    defaultOverlayOpacity={0.5}
                >
                    <View style={{ paddingTop: 20, width: deviceWidth, maxHeight: deviceHeight / 1.5, minHeight: deviceHeight / 2.5, paddingBottom: 50 }} >
                        {/* <FlatList
                            key={item.rowNum + 'ShiftSheet'}
                            style={{ padding: 5 }}
                            keyExtractor={(_, index) => index.toString()}
                            data={listShift}
                            renderItem={renderItemShift}
                        /> */}
                        <ScrollView >
                            {
                                listShift.length > 0 &&
                                listShift.map((it, index) => {
                                    return (
                                        renderItemShift(it, index, `${item.tabId}_${item.attendantId}_${it.ShiftCode}`)
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </ActionSheet>
                <ActionSheet
                    ref={shopSheet}
                    containerStyle={{ backgroundColor: appcolor.surface, borderWidth: 0.2, borderColor: appcolor.dark }}
                    onClose={handlerOnCloseShopSheet}
                    initialOffsetFromBottom={1}
                    gestureEnabled={false}
                    indicatorColor={appcolor.light}
                    keyboardHandlerEnabled={false}
                    defaultOverlayOpacity={0.5}
                >
                    {
                        showShopList && <View style={{ padding: 5, paddingBottom: 30, width: deviceWidth, height: deviceHeight * 0.8 }} >
                            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: appcolor.dark }}>Danh sách cửa hàng</Text>
                            <FlatList
                                data={shopPermission}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => {
                                    const checkExist = shopDetail.find(it => it.ShopId == item.ShopId)
                                    if (checkExist) return null
                                    return (
                                        <TouchableOpacity
                                            style={{
                                                padding: 8,
                                                borderBottomWidth: 1,
                                                borderBottomColor: appcolor.surface,
                                                backgroundColor: appcolor.light,
                                                borderRadius: 12, marginBottom: 4
                                            }}
                                            onPress={() => handleAddStore(item)}
                                        >
                                            <Text style={{ color: appcolor.dark, fontSize: 16 }}>{item.ShopCode} - {item.ShopName}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            <TouchableOpacity
                                style={{ marginTop: 10, alignItems: 'center' }}
                                onPress={() => setShowShopList(false)}
                            >
                                <Text style={{ color: 'red' }}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        !showShopList &&
                        <View style={{ padding: 5, paddingBottom: 30, width: deviceWidth, height: deviceHeight * 0.8 }} >
                            <ScrollView>
                                {
                                    shopDetail.length > 0 &&
                                    shopDetail.map((it, index) => {
                                        return (
                                            renderItemShop(it, index, item)
                                        )
                                    })
                                }
                                <View style={{ height: 100 }} />
                            </ScrollView>
                            {
                                (configCheckTimeStore.isCheckTimeStore == 1 && item.tabId == 1 && shopPermission.length > 0) && shiftPlan !== 'OFF' &&
                                <TouchableOpacity style={{ backgroundColor: appcolor.primary, padding: 8, borderRadius: 12, margin: 5, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => setShowShopList(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 30 }}>
                                        <Icon size={30} name='add' color={appcolor.white} />
                                        <Text style={{ paddingHorizontal: 4, color: appcolor.white, textAlignVertical: 'center', fontSize: 20 }}>Thêm cửa hàng</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        </View>
                    }

                </ActionSheet>
            </View >
            <ViewPictures
                visible={visible}
                images={dataPhoto.listPhoto || []}
                initialIndex={dataPhoto.indexImage}
                onSwipeDown={() => setVisible(false)}
            />
        </View >

    )
}
const ViewPhotoEvidence = ({ itemAttendant, indexAttendant, listPhotoItem, showItemImage, reload, reloadView }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [isShowDelete, setIsShowDelete] = useState(false)
    const [numDelete, setNumDelete] = useState(0)
    const [_, setMutate] = useState(false)

    const handleSelectImage = async (indexImage) => {
        showItemImage(indexImage)
    }

    const RenderItemPhoto = ({ item, index, listPhotoItem }) => {
        const onLongPressImage = () => {
            item.isDelete = item.isDelete ? false : true;

            (item.photoPath !== null && !isShowDelete) ? setNumDelete(1) : setNumDelete(0)
            if (isShowDelete) {
                listPhotoItem.listPhoto.map(it => {
                    it.isDelete = false
                })
            }
            setNumDelete(0)
            setIsShowDelete(e => !e)
        }
        const pressOnShowDelete = () => {
            const count = item.isDelete ? (numDelete - 1) : (numDelete + 1)
            item.isDelete = item.isDelete ? false : true;
            setNumDelete(count)
        }
        const onSelectImage = () => {
            handleSelectImage(index)
        }
        const imageUrl = item.photoPath !== null ? (item.photoPath.indexOf('file://') > -1 || item.photoPath.indexOf('https://') > -1 ? item.photoPath : URLDEFAULT + item.photoPath) : null
        return (
            (item.photoPath === null && index == -1) ?
                <TouchableOpacity key={index} style={{ width: deviceWidth / 5, height: deviceWidth / 5, backgroundColor: appcolor.surface, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}
                    onPress={() => isShowDelete ? null : SheetManager.show(`ref_takePhoto_${itemAttendant.tabId}_${itemAttendant.attendantId}`)}
                >
                    <Icon
                        color={appcolor.primary}
                        name={'camera'}
                        type='ionicon'
                        size={40}
                    />
                </TouchableOpacity>
                :
                <TouchableOpacity key={index}
                    style={{ borderRadius: 12, width: deviceWidth / 5, height: deviceWidth / 5, backgroundColor: appcolor.surface, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}
                    onPress={() => isShowDelete ? pressOnShowDelete() : onSelectImage()}
                >
                    <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                    {
                        listPhotoItem.listPhoto.length >= 1 && itemAttendant.tabId == 1 &&
                        <TouchableOpacity
                            style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", }}
                            onPress={() => deleteItemImage(item)}
                        >
                            <Icon type='ionicon' name="trash-bin" color={appcolor.red} size={20} />
                        </TouchableOpacity>
                    }
                </TouchableOpacity>
        )
    }

    const takePhoto = async () => {
        const guiIdPhoto = UUIDGenerator()
        let photoinfo = {
            "photoType": 'AttendantIssue',
            "photoDesc": `${itemAttendant.tabId}_${itemAttendant.attendantId}`,
            "dataUpload": 0,
            "fileUpload": 0,
            "shopId": 0,
            "photoPath": null,
            "guiId": guiIdPhoto,
            "reportId": kpiinfo.id,
            "photoDate": moment(new Date()).format("YYYYMMDD"),
            "photoTime": new Date().getTime(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        }
        NativeCamera.cameraStart(photoinfo, reloadpage);
    }
    const uploadFilePhoto = async () => {
        const photoinfo = {
            "shopId": 0,
            "shopCode": '0',
            "reportId": kpiinfo.id,
            "photoDate": moment(new Date()).format("YYYYMMDD"),
            "photoTime": new Date().getTime(),
            "photoType": 'AttendantIssue',
            "photoDesc": `${itemAttendant.tabId}_${itemAttendant.attendantId}`,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.imageGalleryLaunch(photoinfo, reloadpage);
    }

    const reloadpage = async () => {
        const itemPhotoByGuiId = await getPhotoByTypeDesc('AttendantIssue', `${itemAttendant.tabId}_${itemAttendant.attendantId}`)
        listPhotoItem.listPhoto = itemPhotoByGuiId
        await setMutate(e => !e)
        await reloadView()
        // await setListPhotoItem(itemPhotoByGuiId)
    }

    const deleteItemImage = async (itemDelete) => {
        listPhotoItem.listPhoto = listPhotoItem.listPhoto.filter(it => it.id != itemDelete.id)
        deletePhoto(itemDelete)
        setMutate(e => !e)
    }

    return (
        <View style={{ flexDirection: 'column', width: '100%' }}>
            <View style={{ padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {((itemAttendant.tabId == 1) || (itemAttendant.tabId == 2 && listPhotoItem?.listPhoto !== undefined && listPhotoItem?.listPhoto?.length > 0)) &&
                    <Text style={{ color: appcolor.dark, padding: 5 }}>{'Hình ảnh'}</Text>
                }
                {
                    isShowDelete &&
                    <TouchableOpacity style={{ width: 60, height: 30, borderRadius: 10, backgroundColor: appcolor.surface, justifyContent: "center", alignItems: 'center', marginRight: 5 }}
                        onPress={() => deleteItemImage()}
                    >
                        <Icon name='trash-alt' type="font-awesome-5" size={15} color={appcolor.red} />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                {
                    (listPhotoItem?.itemTakePicture !== undefined && itemAttendant.tabId === 1) &&
                    <RenderItemPhoto item={listPhotoItem.itemTakePicture} index={-1} listPhotoItem={listPhotoItem} />
                }
                {
                    listPhotoItem?.listPhoto !== undefined &&
                    <FlatList
                        horizontal
                        key={'listPhoto'}
                        keyExtractor={(_, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        data={listPhotoItem.listPhoto}
                        renderItem={({ item, index }) => <RenderItemPhoto item={item} index={index} listPhotoItem={listPhotoItem} />}
                    />
                }
            </View>
            <ActionSheet
                // onClose={() => SheetManager.hide('ref_takePhoto')}
                id={`ref_takePhoto_${itemAttendant.tabId}_${itemAttendant.attendantId}`}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
            >
                <View style={{ padding: 8, width: '100%', height: '50%' }}>
                    <View style={{ padding: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600' }}>Chụp Hình</Text>

                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 }}>
                        <TouchableOpacity
                            style={{ padding: 5, width: '48%', justifyContent: 'center', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 0.5, borderRadius: 10, backgroundColor: appcolor.light, }}
                            onPress={() => takePhoto()}>
                            <Text style={{ color: appcolor.dark, padding: 5 }} >Máy ảnh</Text>
                            <Icon color={appcolor.dark} name='camera' type='ionicon' size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 5, width: '48%', justifyContent: 'center', alignItems: 'center', borderColor: appcolor.primary, borderWidth: 0.5, borderRadius: 10, backgroundColor: appcolor.light, }}
                            onPress={() => uploadFilePhoto()}
                        >
                            <Text style={{ color: appcolor.dark, padding: 5 }} >Chọn ảnh</Text>
                            <Icon color={appcolor.dark} name='attach' type='ionicon' size={30} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
        </View>
    )
}

const CountTime = ({ item }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const startTimeRef = useRef(null);
    const calculateTimeLeft = useCallback(() => {
        const newTime = new Date();
        const difference = moment(item.endTime, 'YYYY-MM-DD HH:mm:ss').diff(moment(newTime, 'YYYY-MM-DD HH:mm:ss'));

        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }, [item.endTime]);

    const countDown = useCallback(() => {
        setRemainingTime(calculateTimeLeft());
        startTimeRef.current = requestAnimationFrame(countDown);
    }, [calculateTimeLeft]);

    useEffect(() => {
        startTimeRef.current = requestAnimationFrame(countDown);
        return () => cancelAnimationFrame(startTimeRef.current);
    }, [countDown]);

    return (
        <Text style={{ color: appcolor.dark }}>{(remainingTime.days > 0) ? `${remainingTime.days} ngày ` : ''}{remainingTime.hours < 10 ? '0' : ''}{remainingTime.hours}:{remainingTime.minutes < 10 ? '0' : ''}{remainingTime.minutes}:{remainingTime.seconds < 10 ? '0' : ''}{remainingTime.seconds}</Text>
    );
}
