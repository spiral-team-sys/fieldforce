import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Switch, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Platform } from "react-native";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SR_PLAN_GETLIST, PLANSR_ACTION } from "../../../Controller/PlanController";
import { alertError, alertWarning, alertNotify, alertConfirm } from "../../../Core/Utility";
import { LoadingView } from "../../../Control/ItemLoading/index";
import { groupDataByKey } from "../../../Core/Helper";
import { Text } from "react-native";
import { Modal } from "react-native";
import FormGroup from "../../../Content/FormGroup";
import ReactNativeCalendarStrip from "react-native-calendar-strip";
import { DEFAULT_COLOR } from "../../../Core/URLs";
import moment from 'moment';
import { useSelector } from "react-redux";
import { deviceWidth } from "../../../Themes/AppsStyle";

const LG_ConfirmPlanMD = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState({ mPlanList: [], dataMain: [] })
    const [dataModal, setDataModal] = useState({ type: '', dataSelect: [], dataFilter: [], visibleModal: false })
    const [configDate, setConfigDate] = useState({ dateChoose: moment().format('YYYY-MM-DD'), markedDates: [], customDatesStyles: [] })
    const [dataModified, setDataModified] = useState({})
    const [mListIndex, setListIndex] = useState([])
    const [_, setMutate] = useState(false)
    // Config Data
    const LoadDataPlan = async (dateSelect) => {
        await setRefreshing(true)
        await setDataModified({})
        const dataHeader = {
            "PlanDate": parseInt(moment(dateSelect).format('YYYYMMDD')),
            "Week": moment(dateSelect).isoWeek(),
            "Year": moment(dateSelect).year()
        }
        await SR_PLAN_GETLIST(dataHeader, async (mDataPlan, mDataWeek, mDataIndex) => {
            const { arr } = groupDataByKey({
                arr: mDataPlan,
                key: "auditDate"
            })
            await setData({ mPlanList: arr, dataMain: arr })
            await ConfigCalendar(dateSelect, mDataWeek)
            await setListIndex(mDataIndex.length > 0 ? (JSON.parse(mDataIndex[0].mListIndex || '[]') || []) : [])
        }, (error) => {
            alertError('Dữ liệu lỗi, vui lòng thử lại sau (' + error + ')')
        })
        await setRefreshing(false)
    }
    const ConfigCalendar = async (dateSelect, mDataWeek) => {
        let markedDates = [], customDatesStyles = []
        mDataWeek.forEach(e => {
            let i = 0;
            let date = moment(e.planDate).format('YYYY-MM-DD');
            let dots = [];
            dots.push({ color: e.colorPlan });
            markedDates.push({ date, dots });
            i++
        });
        const ok = "#ff6600"
        customDatesStyles.push({
            startDate: new Date(),
            dateNameStyle: { color: ok },
            dateNumberStyle: { color: ok },
            highlightDateNameStyle: { color: ok },
            highlightDateNumberStyle: { color: ok },
        });
        await setConfigDate({ dateChoose: dateSelect == undefined ? moment().format('YYYY-MM-DD') : dateSelect, markedDates: markedDates, customDatesStyles: customDatesStyles })
    }
    const assignData = async (index) => {
        dataModified[index] = true
    }
    // Handler Action
    const handlerNotes = async (index, text, item, typeInput) => {
        switch (typeInput) {
            case 'SHIFT':
            case 'SHOP':
                data.mPlanList[index].notes = text
                data.dataMain[item.mainIndex].notes = text
                break;
            case 'LATE':
                data.mPlanList[index].noteLate = text
                data.dataMain[item.mainIndex].noteLate = text
                break;
            case 'EARLIER':
                data.mPlanList[index].noteEarlier = text
                data.dataMain[item.mainIndex].noteEarlier = text
                break;
        }
        setMutate(e => !e)
    }
    const handlerShopAction = async (item, index, value) => {
        let valueChange = value ? 1 : 0
        let statusChange = item.status
        let lastStatus = null
        if (valueChange === item.statusMain) {
            statusChange = item.statusMain
            lastStatus = null
        } else {
            statusChange = valueChange
            lastStatus = valueChange == 0 ? 'DEL' : 'ADD'
        }
        // Update dong gia
        data.mPlanList[0].lastStatus = lastStatus
        //
        data.mPlanList[index].status = statusChange
        data.mPlanList[index].lastStatus = lastStatus
        data.mPlanList[index].confirmShop = 3
        data.dataMain[item.mainIndex].status = statusChange
        data.dataMain[item.mainIndex].lastStatus = lastStatus
        data.dataMain[item.mainIndex].confirmShop = 3
        assignData(index)
        setMutate(e => !e)
    }
    const searchShops = async (text) => {
        if (text && text !== undefined) {
            let filterShops = data.dataMain.filter(i => i.mainIndex === 0 ||
                (i.shopName.toLowerCase().match(text.toLowerCase()) || i.address.toLowerCase().match(text.toLowerCase()) || i.shopCode.toLowerCase().match(text.toLowerCase())))
            await setData({ ...data, mPlanList: filterShops })
        } else {
            await setData({ ...data, mPlanList: data.dataMain })
        }
    }
    const handlerShowViewChoose = async (index, item, listSelect, typeBS) => {
        switch (typeBS) {
            case 'NOTE':
                let changeItem = item.ref_Code == null ? listSelect.filter(i => i.Ref_Code == 'ON') : listSelect.filter(i => i.Ref_Code == item.ref_Code);
                const mModalNote = {
                    type: typeBS,
                    dataSelect: changeItem.map(i => (i.title == item.reasonName ? { ...i, isSelect: 1 } : i)),
                    dataFilter: changeItem,
                    visibleModal: true
                }
                setDataModal(mModalNote)
                break;
            case 'SHIFT':
                const mModalShift = {
                    type: typeBS,
                    dataSelect: listSelect.map(i => (i.Name == item.shiftChange ? { ...i, isSelect: 1 } : i)),
                    dataFilter: listSelect,
                    visibleModal: true
                }
                setDataModal(mModalShift)
                break;
            default:
                const mModal = {
                    type: typeBS,
                    dataSelect: listSelect,
                    dataFilter: listSelect,
                    visibleModal: true
                }
                setDataModal(mModal)
                break;
        }
    }
    const searchModal = async (text) => {
        if (text.length > 0) {
            const filterShift = dataModal.type == 'SHIFT' ?
                dataModal.dataFilter.filter((i) => i.Name.toLowerCase().match(text.toLowerCase()) || i.ShiftCode.toLowerCase().match(text.toLowerCase()))
                :
                dataModal.type == 'NOTE' ?
                    dataModal.dataFilter.filter((i) => i.title !== undefined && i.title.toLowerCase().match(text.toLowerCase()) || i.Ref_Code.toLowerCase().match(text.toLowerCase())) :
                    dataModal.dataFilter.filter((i) => i.ShopName !== undefined && i.ShopName.toLowerCase().match(text.toLowerCase()))
            await setDataModal({ ...dataModal, dataSelect: filterShift })
        } else {
            await setDataModal({ ...dataModal, dataSelect: dataModal.dataFilter })
        }
    }
    const chooseItemModal = async (item, index, value, typeModal) => {
        let isShiftOff = item.ShiftGroup == 'OFF' ? 1 : 0
        // Action changep
        if (typeModal == 'SHIFT') {
            data.mPlanList[0].shiftChange = value
            data.mPlanList[0].reasonName = 'Chọn lí do thay đổi'
            data.mPlanList[0].ref_Code = item.ShiftGroup
            data.mPlanList[0].supConfirm = 3

            let listIndex = mListIndex.length > 0 ? mListIndex : JSON.parse(data.dataMain[0].listIndex)
            for (let i = 0, lenList = listIndex.length; i < lenList; i++) {
                let mainIndex = listIndex[i].MainIndex;
                data.mPlanList[mainIndex].isLocked = isShiftOff
            }
            await handlerChangeDataModal(item)
        }
        if (typeModal == 'NOTE') {
            data.mPlanList[0].reasonName = value
            setDataModal({ ...dataModal, visibleModal: false })
        }
        assignData(0)
    }
    const clearItemModal = async (item, index, typeModal) => {
        if (typeModal == 'SHIFT') {
            data.mPlanList[0].shiftChange = 'Chọn loại nghỉ phép'
            data.mPlanList[0].reasonName = 'Chọn lí do thay đổi'
            data.mPlanList[0].ref_Code = null
            data.mPlanList[0].isLocked = 0
            data.mPlanList[0].notes = null
            data.mPlanList[0].supConfirm = 0
            //
            let listIndex = mListIndex.length > 0 ? mListIndex : JSON.parse(data.dataMain[0].listIndex)
            for (let i = 0, lenList = listIndex.length; i < lenList; i++) {
                let mainIndex = listIndex[i].MainIndex;
                data.mPlanList[mainIndex].isLocked = 0
            }
        }
        if (typeModal == 'NOTE') {
            data.mPlanList[0].reasonName = 'Chọn lí do thay đổi'
            data.mPlanList[0].notes = null
            if (item.shiftChange == undefined || item.shiftChange == 'Chọn loại nghỉ phép') {
                data.mPlanList[0].ref_Code = null
                data.mPlanList[0].isLocked = 0
            } else {
                data.mPlanList[0].ref_Code = 'OFF'
                data.mPlanList[0].isLocked = 1
            }
        }
        setDataModal({ ...dataModal, visibleModal: false })
        assignData(0)
    }
    const handlerChangeDataModal = async (item) => {
        let changeItem = JSON.parse(data.mPlanList[0].refList).filter(i => i.Ref_Code == item.ShiftGroup);
        let dataModal = changeItem.map(i => (i.title == item.notes ? { ...i, isSelect: 1 } : i))
        await setDataModal({ ...dataModal, type: 'NOTE', dataSelect: dataModal, dataFilter: dataModal })
    }
    const handlerSave = async () => {
        const listModified = Object.keys(dataModified)
        if (listModified.length > 0) {
            let countShopAdd = 0
            let contentMessage = ''
            let checkData = null;
            let dataSave = [];

            let itemOFF = data.dataMain[0];
            // Check Off 
            let dataShiftOFF = JSON.parse(itemOFF.shiftList).filter(c => c.Name == itemOFF.shiftChange);
            let dataNote = JSON.parse(itemOFF.refList || '[]').filter(s => s.title == itemOFF.reasonName);

            if (dataShiftOFF.length > 0 && dataNote.length == 0) {
                checkData = 'Vui lòng nhập lí do xin nghỉ phép';
            } else if (dataShiftOFF.length == 0 && dataNote.length > 0 && dataNote[0].Ref_Code == 'OFF') {
                checkData = 'Vui lòng chọn loại nghỉ phép';
            } else {
                if (dataNote.length > 0 && dataNote[0].Id == 100) {
                    if (itemOFF.notes == null || itemOFF.notes.length == 0) {
                        checkData = 'Vui lòng nhập lí do khác';
                    } else if (itemOFF.notes.length < 5) {
                        checkData = 'Lí do quá ngắn, vui lòng nhập lại';
                    }
                }
            }
            let itemSaveOFF = {
                'PlanId': itemOFF.planId,
                'ShopId': itemOFF.shopId,
                'PlanDate': itemOFF.auditDate,
                'Status': itemOFF.status ? 1 : 0,
                'LastStatus': itemOFF.lastStatus,
                'ShiftType': itemOFF.shiftType,
                'ShiftChange': dataShiftOFF.length > 0 ? dataShiftOFF[0].ShiftCode : null,
                'ReasonId': dataNote.length > 0 ? dataNote[0].Id : null,
                'Notes': dataNote.length > 0 ? (dataNote[0].Id == 100 ? itemOFF.notes : dataNote[0].title) : null,
                'SupConfirm': itemOFF.supConfirm
            }
            dataSave.push(itemSaveOFF);
            // Data Status Add Shop
            data.dataMain.forEach((i, index) => {
                if (index == 0) return
                // Check Add-Del Shop 
                if (i.confirmShop == 3) {
                    if (i.lastStatus == 'ADD' || i.lastStatus == 'DEL') {
                        if (i.auditDate == moment(new Date()).format('YYYY-MM-DD')) {
                            countShopAdd++
                        }
                        if (i.checkNote == 1) {
                            // if (moment(new Date()).isoWeek() == moment(configDate.dateChoose).isoWeek()) {
                            if (dataNote.length == 0) {
                                if (i.notes == null || i.notes.length == 0) {
                                    checkData = "Vui lòng nhập lí do thay đổi cửa hàng " + i.shopName;
                                } else if (i.notes.length < 5) {
                                    checkData = "Lí do thay đổi cửa hàng " + i.shopName + " quá ngắn";
                                }
                                // }
                            }
                        }
                        let itemSave = {
                            'PlanId': i.planId,
                            'ShopId': i.shopId,
                            'PlanDate': i.auditDate,
                            'Status': i.status ? 1 : 0,
                            'LastStatus': i.lastStatus,
                            'ShiftType': i.shiftType,
                            'ShiftChange': null,
                            'ReasonId': null,
                            'Notes': i.notes,
                            'ConfirmPlan': 1 // i.confirmShop
                        }
                        dataSave.push(itemSave);
                    }
                }
                contentMessage = "Nhân viên " + i.fullName + " yêu cầu thay đổi lịch làm việc ngày " + i.dateView
            })
            if (checkData !== null) {
                alertWarning(checkData);
                return;
            }
            alertConfirm("Thông báo", "Bạn có muốn thay đổi lịch làm việc như bên dưới không ?", async () => {
                const dataUpload = { dataPlan: JSON.stringify(dataSave), contentMessage: contentMessage }
                const result = await PLANSR_ACTION(dataUpload, itemOFF.parentList)
                if (result.statusId === 200) {
                    alertNotify(result.messager)
                    await LoadDataPlan(configDate.dateChoose)
                } else {
                    alertError(result.messager)
                }
            })
        } else {
            alertWarning("Bạn chưa có yêu cầu thay đổi lịch làm việc nào, vui lòng thay đổi trước khi gửi dữ liệu lên hệ thống")
        }
    }
    // Render View
    const renderItem = ({ item, index }) => {
        const visibleOffView = item.checkWP > 0 ? 'flex' : 'none'
        return (
            <View key={index} style={{ flex: 1 }}>
                {item.isParent ?
                    <ViewItemOFF
                        appcolor={appcolor}
                        item={item} index={index} styles={styles} visibleView={visibleOffView}
                        actionNotes={handlerNotes}
                        actionChooseItem={handlerShowViewChoose}
                    />
                    :
                    <ViewItemStore
                        appcolor={appcolor}
                        item={item} index={index} styles={styles}
                        onValueChange={handlerShopAction}
                        actionNotes={handlerNotes}
                    />
                }
            </View>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemOFFView: { flex: 1, marginBottom: 8, backgroundColor: appcolor.homebackground, padding: 8, borderRadius: 8 },
        itemShopView: { flex: 1, marginBottom: 8, backgroundColor: appcolor.light, padding: 8, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight },
        styleSwitchView: { ...(Platform.OS === 'ios' && { transform: [{ scaleX: .8 }, { scaleY: .8 }] }) },
        inputView: { flex: 1, color: appcolor.dark, padding: 8, marginTop: 8, borderRadius: 8, borderWidth: 0.5, fontSize: 14, textAlignVertical: 'center', borderColor: appcolor.greydark },
        titleShiftType: { flex: 1, fontSize: 15, fontWeight: '700', fontStyle: "italic", color: appcolor.dark },
        chooseItem: { flex: 1, padding: 8, borderRadius: 8, borderRadius: 8, borderWidth: 0.5 },
        statusText: { width: '100%', fontSize: 14, fontWeight: '700', color: appcolor.dark, marginStart: 8, marginBottom: 3, marginTop: 5 },
        filterStyle: { marginStart: 8, marginEnd: 8 }
    })
    useEffect(() => {
        LoadDataPlan();
        return () => false
    }, [])
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={route?.params?.menuitem.menuNameVN || "Lịch làm việc MD"}
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                rightFunc={handlerSave}
            />
            <ReactNativeCalendarStrip
                style={{ flexDirection: 'row', height: 100, alignItems: 'center' }}
                minDate={'2021-01-01'}
                calendarHeaderStyle={{ color: 'white', marginBottom: 16 }}
                calendarColor={DEFAULT_COLOR}
                dateNumberStyle={{ color: 'white' }}
                dateNameStyle={{ color: 'white' }}
                customDatesStyles={configDate.customDatesStyles}
                highlightDateContainerStyle={{ backgroundColor: 'white' }}
                highlightDateNumberStyle={{ color: 'black' }}
                highlightDateNameStyle={{ color: 'black' }}
                disabledDateNameStyle={{ color: 'grey' }}
                disabledDateNumberStyle={{ color: 'grey' }}
                iconLeft={require('../../../Themes/Images/chevron-left.png')}
                iconRight={require('../../../Themes/Images/chevron-right.png')}
                iconContainer={{ flex: 0.1 }}
                markedDates={configDate.markedDates}
                selectedDate={configDate.dateChoose}
                //Event
                scrollToOnSetSelectedDate={false}
                onDateSelected={(date) => { LoadDataPlan(date) }}
            />
            <FormGroup
                containerStyle={{ margin: 8, padding: 3, paddingEnd: 8 }}
                inputStyle={{ fontSize: 14 }} iconName='search'
                placeholder={"Tìm kiếm cửa hàng"} value={null} editable
                handleChangeForm={searchShops}
            />
            <LoadingView title={'Đang cập nhật dữ liệu'} isLoading={refreshing} styles={{ marginTop: 8 }} />
            <FlatList
                style={{ flex: 1, padding: 8, marginBottom: Platform.OS == 'ios' ? 12 : 0 }}
                keyExtractor={(_, index) => index.toString()}
                data={data.mPlanList}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={false} onRefresh={LoadDataPlan} />}
                ListFooterComponent={<View style={{ height: 320 }} />}
            />
            <ModalItem
                styles={styles} dataModal={dataModal}
                actionResultModal={() => setDataModal({ ...dataModal, visibleModal: false })}
                actionSearch={searchModal}
                actionChooseItem={chooseItemModal}
                actionClearItem={clearItemModal}
            />
        </View>
    )
}
// Render Child View 
const ViewItemOFF = ({ item, index, styles, visibleView, actionNotes, actionChooseItem, appcolor }) => {
    const shiftList = JSON.parse(item.shiftList)
    const reasonList = JSON.parse(item.refList)
    const colorStatusShift = item.colorStatusShift == '#' ? appcolor.dark : item.colorStatusShift
    return (
        <View key={index} style={[styles.itemOFFView, { display: visibleView }]}>
            <Text style={[styles.statusText, { color: colorStatusShift }]} >{item.shiftStatus}</Text>
            {item.supNote !== null && item.supNote.length > 0 && <Text style={[styles.statusText, { color: colorStatusShift }]} >{item.supNote}</Text>}
            <RenderChooseItem item={item} styles={styles} appcolor={appcolor} typeBS='SHIFT' listSelect={shiftList} value={item.shiftChange} handlerChooseItem={actionChooseItem} />
            <Text style={styles.statusText} >Lý do thay đổi</Text>
            <RenderChooseItem item={item} styles={styles} appcolor={appcolor} typeBS='NOTE' listSelect={reasonList} value={item.reasonName} handlerChooseItem={actionChooseItem} />
            <RenderTextInput index={index} typeInput="SHIFT" item={item} isLock={item.isLockShift} value={item.notes} handlenotes={actionNotes} styles={styles} appcolor={appcolor} />
        </View>
    )
}
const ViewItemStore = ({ item, index, styles, onValueChange, actionNotes, appcolor }) => {
    const visibleStatusChange = item.statusChangeShop.length > 0 ? 'flex' : 'none'
    const visibleSupNoteConfirm = item.confirmPlanNote !== null && item.confirmPlanNote.length > 0 ? 'flex' : 'none'
    const colorStatusChange = item.confirmShop == 1 ? appcolor.success : item.confirmShop == -1 ? appcolor.danger : appcolor.rejection
    const indexData = item.mainIndex
    return (
        <View key={index} style={styles.itemShopView}>
            <Text style={{ display: visibleStatusChange, width: '100%', fontSize: 14, fontWeight: '700', color: colorStatusChange }} >{item.statusChangeShop}</Text>
            <Text style={{ display: visibleSupNoteConfirm, width: '100%', fontSize: 14, fontWeight: '700', color: colorStatusChange }}>Quản lý ghi chú: {item.confirmPlanNote}</Text>
            <View style={{ flex: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='store' size={21} color={appcolor.dark} />
                <Text style={{ width: '80%', paddingStart: 8, paddingEnd: 8, fontSize: 15, fontWeight: '700', color: appcolor.dark }} >{indexData}. Cửa hàng: {item.shopName}</Text>
                {item.isLocked == 0 &&
                    <Switch
                        disabled={item.isLockStatus == 1}
                        style={styles.styleSwitchView}
                        ios_backgroundColor={appcolor.greydark}
                        trackColor={{ true: appcolor.success, false: appcolor.greylight }}
                        thumbColor={appcolor.dark}
                        //Event 
                        value={item.status == 1}
                        onValueChange={(value) => onValueChange(item, index, value)}
                    />
                }
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }} >
                <Text style={{ width: '80%', fontSize: 14, color: appcolor.dark }} >Mã cửa hàng: {item.shopCode} </Text>
                <Text style={{ width: '80%', fontSize: 14, color: appcolor.dark }} >Địa chỉ: {item.address} </Text>
                <RenderTextInput
                    styles={styles} appcolor={appcolor}
                    index={index} typeInput="SHOP" item={item} isLock={item.isLockStatus} value={item.notes} handlenotes={actionNotes} />
            </View>
        </View>
    )
}
const renderItemModal = (item, index, dataModal, actionChooseItem, actionClearItem, appcolor) => {
    const value = dataModal.type == 'SHIFT' ? item.Name : (dataModal.type == 'NOTE' ? item.title : item.ShopName)
    const chooseItem = () => {
        actionChooseItem(item, index, value, dataModal.type)
    }
    const clearItem = () => {
        actionClearItem(item, index, dataModal.type)
    }
    return (
        <View key={index} style={{ flexDirection: 'row', backgroundColor: appcolor.homebackground, marginBottom: 8, borderRadius: 8 }}>
            <TouchableOpacity style={{ flex: 8, padding: 12 }} onPress={chooseItem}>
                <Text style={{ width: '80%', fontSize: 15, fontWeight: '500', color: appcolor.dark }} >{index + 1}. {value}</Text>
            </TouchableOpacity>
            {item.isSelect == 1 &&
                <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={clearItem} >
                    <Icon name="backspace" size={18} color={appcolor.dark} />
                </TouchableOpacity>
            }
        </View>
    )
}
const ModalItem = ({ dataModal, styles, actionSearch, actionResultModal, actionChooseItem, actionClearItem }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const titleModal = dataModal.type == 'SHIFT' ? 'Xin nghỉ phép' : (dataModal.type == 'NOTE' ? 'Lí do chuyển ca' : 'Danh sách cửa hàng')
    return (
        <Modal animationType="slide" visible={dataModal.visibleModal}>
            <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
                    <Text style={{ fontSize: 21, padding: 8, fontWeight: '700', color: appcolor.dark, textAlign: 'center' }}>{titleModal}</Text>
                    <TouchableOpacity style={{ padding: 10 }} onPress={actionResultModal}>
                        <Icon name="times" size={25} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
                <FormGroup
                    containerStyle={styles.filterStyle}
                    placeholder={"Tìm kiếm ..."} editable handleChangeForm={actionSearch} multiline iconName='search' />
                <FlatList
                    style={{ flex: 1, padding: 8 }}
                    keyExtractor={(_, index) => index.toString()}
                    data={dataModal.dataSelect}
                    renderItem={({ item, index }) => renderItemModal(item, index, dataModal, actionChooseItem, actionClearItem, appcolor)}
                    removeClippedSubviews={true}
                />
            </SafeAreaView>
        </Modal>
    )
}
// Control
const RenderTextInput = ({ index, typeInput, item, value, styles, handlenotes, isLock, appcolor }) => {
    const handleChange = (inputText) => {
        handlenotes(index, inputText, item, typeInput)
    }
    return (
        <TextInput
            editable={isLock == 1 ? false : true}
            blurOnSubmit={true}
            defaultValue={value}
            style={styles.inputView}
            placeholderTextColor={appcolor.grey} placeholder="Ghi chú..."
            onChangeText={(text) => handleChange(text)}
        />
    )
}
const RenderChooseItem = ({ index, item, styles, appcolor, typeBS, listSelect, value, titleStyle = null, handlerChooseItem }) => {
    const handlerChoose = () => {
        handlerChooseItem(index, item, listSelect, typeBS)
    }
    return (
        <TouchableOpacity key={index} disabled={item.isLockShift == 1 ? true : false} style={styles.chooseItem} onPress={handlerChoose}>
            <Text style={{ ...titleStyle, color: appcolor.dark }} >{value}</Text>
        </TouchableOpacity>
    )
}
export default LG_ConfirmPlanMD;