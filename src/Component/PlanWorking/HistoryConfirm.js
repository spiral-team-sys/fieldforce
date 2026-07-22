import React, { useEffect, useState } from "react";
import { GetHistoryConfirm } from "../../Controller/PlanController";
import { FlatList, View, StyleSheet, Platform, Text, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, ScrollView, SafeAreaView, } from "react-native";
import { ListItem, Card, Icon } from '@rneui/themed'
import { groupDataByKey, debounce } from "../../Core/Helper";
import FormGroup from "../../Content/FormGroup";
import { deviceWidth } from "../../Themes/AppsStyle";
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from "../../Control/ItemLoading/index";
import { useSelector } from "react-redux";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { deviceHeight, minWidthTab } from "../../Core/Utility";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
import moment from "moment";

const TYPE_SHIFT = 'SHIFT'
const TYPE_OFF = 'OFF'
const TYPE_LATE = 'LATE'
const TYPE_EARLIER = 'EARLIER'
const DATE = new Date()
const HistoryConfirm = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ dataConfirm: [], dataMain: [] });
    const [dataEmployee, setDataEmployee] = useState([]);
    const [menuSelected, setMenuSelected] = useState({ type: 'SHIFT', employeeId: '', month: '', year: '' })
    const [indexTab, setIndexTab] = useState(0)
    const [dataModal, setDataModal] = useState({ visibleModal: false, list: [] })
    var [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const LoadData = async (typeConfirm, ChildEmployee, Month, Year) => {
        await setMenuSelected({ type: typeConfirm, employeeId: ChildEmployee, month: Month, year: Year })
        await setLoading(true)
        await GetHistoryConfirm(typeConfirm, ChildEmployee, Month, Year, async (mData, mEmployee, monthList) => {
            await setData({ dataConfirm: mData, dataMain: mData })
            await setDataEmployee(mEmployee)
        })
        await setLoading(false)
    }
    const handlerLoadType = async (typeConfirm) => {
        await setMenuSelected({ ...menuSelected, type: typeConfirm })
        await LoadData(typeConfirm, '', filter.month, filter.year)
    }
    const handlerFilter = async (text) => {
        if (text) {
            let dataFilter = dataModal.listFilter.filter(e => {
                const labelFilter = e.employeeName.toUpperCase()
                return labelFilter.indexOf(text.toUpperCase()) > -1
            })
            await setDataEmployee(dataFilter)
        } else {
            await setDataEmployee(dataModal.listFilter)
        }

    }
    const showEmployee = async () => {
        await setDataModal({ list: dataEmployee, listFilter: dataEmployee })
        await SheetManager.show("sheetEmp")
    }
    const clearItemSelect = async () => {
        await setDataModal({ list: [], listFilter: [] })
        await LoadData(menuSelected.type, '', filter.month, filter.year)
    }
    const handleSelectedChange = async (item) => {
        await setMenuSelected({ ...menuSelected, employeeId: item.employeeId })
        await setDataModal({
            ...dataModal,
            list: dataModal.listFilter.map(i => i.employeeId == item.employeeId ?
                { ...i, isSelect: item.isSelect === 1 ? 0 : 1 } : { ...i, isSelect: 0 })
        })
        await LoadData(menuSelected.type, item.employeeId, filter.month, filter.year)
    }
    const onFilterChange = (searchInfo) => {
        filter = { ...filter, ...searchInfo }
        setFilter(filter)
    }
    const handlerChooseMonth = async () => {
        SheetManager.hide("sheetYear")
        await LoadData(menuSelected.type, menuSelected.employeeId, filter.month, filter.year)
    }
    useEffect(() => {
        LoadData(TYPE_SHIFT, '', filter.month, filter.year)
        return () => false
    }, []);
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        filterStyle: { width: '95%', fontSize: 10, alignSelf: 'center', borderWidth: 0.5, padding: 3 },
        employeeContainer: { flexDirection: 'row', width: '100%', alignItems: 'center', margin: 8 },
        titleContainer: {
            flexDirection: 'row', justifyContent: 'flex-start',
            alignItems: 'center', width: '100%', padding: 8
        },
        headerView: { width: '100%', flexDirection: 'row', alignItems: 'center' },
        headerItem: { flex: 1, borderRadius: 10, borderWidth: 1.5, margin: 8, padding: 0, backgroundColor: appcolor.light, minHeight: (deviceWidth / 4 - 30), alignItems: 'center', justifyContent: 'center', },
        iconHeader: { marginBottom: 8 },
        titleHeader: { fontSize: 12, fontWeight: '700' },
        itemContainer: { flex: 1, margin: 5, padding: 8, backgroundColor: appcolor.light, borderRadius: 5, borderColor: appcolor.light, borderWidth: 0.5 },
        textItem: { flex: 1, fontWeight: '400', fontSize: 14, color: appcolor.dark },
        bottomContainer: { width: '100%', height: '100%', alignSelf: 'center', backgroundColor: appcolor.light },
        modalStyle: { width: '100%', height: '100%', backgroundColor: appcolor.light, padding: 12 },
        itemMonthStyle: { alignSelf: 'center', width: '100%', height: 'auto', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: appcolor.greylight },
        titleMonth: { width: '100%', fontSize: 16, color: appcolor.dark }
    })
    const TopTabScroll = () => {
        const getIndexTab = debounce((event) => {
            setIndexTab(event.i)
        }, 100)
        const colorTab = indexTab == 0 ? appcolor.helper : appcolor.danger
        const tablist = []
        data.dataConfirm.forEach(i => {
            const { arr } = groupDataByKey({
                arr: JSON.parse(i.tabData),
                key: "EmployeeId",
                keyLayer2: "AuditDate",
            })
            tablist.push(
                <Tabs.Tab key={i.tabName} label={i.tabName} name={i.tabName} >
                    <View key={"Hình ảnh"} style={{ backgroundColor: appcolor.surface, marginTop: 40, padding: 6, width: deviceWidth, height: deviceHeight / 1.5 }}>
                        {/* <View style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }} key={i.tabName} tabLabel={i.tabName} > */}
                        <FlatList
                            key={i.tabName}
                            data={arr}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderItem}
                            refreshControl={<RefreshControl
                                refreshing={false}
                                onRefresh={() => LoadData(menuSelected.type, '', filter.month, filter.year)}
                            />}
                        />
                    </View>
                </Tabs.Tab>
            )
        });
        return (
            // <View></View>
            <Tabs.Container
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        scrollEnabled={true}
                        tabStyle={{ minWidth: minWidthTab(tablist), height: 32 }}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        style={{ backgroundColor: appcolor.light }}
                    />
                )}
                containerStyle={{ backgroundColor: appcolor.light }}>
                {tablist}
            </Tabs.Container>
        )
    }
    const renderItem = ({ item, index }) => {
        const ItemShift = () => (
            <View style={{ flex: 1 }} >
                {item.LastChangeName !== undefined && <Text style={styles.textItem} >{item.LastChangeName}</Text>}
                {item.NoteShift !== undefined && <Text style={styles.textItem} >{item.NoteShift}</Text>}
                {item.ConfirmNote !== undefined && <Text style={[styles.textItem, { color: appcolor.danger }]} >{item.ConfirmNote}</Text>}
            </View>
        )
        const ItemLate = () => (
            <View style={{ flex: 1 }} >
                {item.TimeLate !== undefined && <Text style={styles.textItem} >{item.TimeLate}</Text>}
                {item.NoteLate !== undefined && <Text style={styles.textItem} >{item.NoteLate}</Text>}
                {item.ConfirmNoteLate !== undefined && <Text style={[styles.textItem, { color: appcolor.danger }]}>{item.ConfirmNoteLate}</Text>}
            </View>
        )
        const ItemEarlier = () => (
            <View style={{ flex: 1 }} >
                {item.TimeEarlier !== undefined && <Text style={styles.textItem} >{item.TimeEarlier}</Text>}
                {item.NoteEarlier !== undefined && <Text style={styles.textItem} >{item.NoteEarlier}</Text>}
                {item.ConfirmNoteEarlier !== undefined && <Text style={[styles.textItem, { color: appcolor.danger }]} >{item.ConfirmNoteEarlier}</Text>}
            </View>
        )
        return (
            <View style={{ flex: 1, }} key={index.toString()} >
                {item.isParent &&
                    <View style={styles.employeeContainer}>
                        <View style={{ backgroundColor: appcolor.secondary, padding: 8, borderRadius: 50 }} >
                            <Icon name="user" type="font-awesome" size={15} color={appcolor.light} />
                        </View>
                        <ListItem.Title style={{ color: appcolor.dark, marginLeft: 8, fontWeight: '700', fontSize: 15 }}>{item.EmployeeName}</ListItem.Title>
                    </View>
                }
                <Card containerStyle={styles.itemContainer}>
                    <ListItem.Content>
                        <View style={{ flex: 1, flexDirection: 'row' }} >
                            <Icon name='store' type="font-awesome-5" size={15} color={appcolor.dark} />
                            <Text style={[styles.textItem, { marginStart: 5, fontWeight: '700', flex: 6 }]} >{item.ShopName}</Text>
                            {item[`${item.EmployeeId}${item.AuditDate}`] &&
                                <Text style={[styles.textItem, { flex: 2.5, fontWeight: '700', color: appcolor.tomato, textAlign: 'right' }]} >{moment(item.AuditDate, "YYYYMMDD").format("D-MMM-YY")}</Text>}
                        </View>
                        {item.Address !== undefined && <Text style={[styles.textItem, { marginStart: 0, marginTop: 3, marginBottom: 3, fontWeight: '500' }]} >{item.Address}</Text>}
                        <Text style={styles.textItem} >{item.ShiftName}</Text>
                        {(menuSelected.type == TYPE_SHIFT || menuSelected.type == TYPE_OFF) && <ItemShift />}
                        {menuSelected.type == TYPE_LATE && <ItemLate />}
                        {menuSelected.type == TYPE_EARLIER && <ItemEarlier />}
                    </ListItem.Content>
                </Card>
            </View>
        )
    }
    return (
        <View style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }} >
            <HeaderCustom
                title={route?.params?.titlePage || 'Lịch sử xác nhận LLV'}
                iconRight='search'
                leftFunc={() => navigation.goBack()}
                rightFunc={() => showEmployee()}
            />
            <View style={styles.mainContainer} >
                <TouchableOpacity onPress={() => SheetManager.show("sheetYear")}>
                    <View style={{ backgroundColor: appcolor.primary, padding: 3 }}>
                        <Text style={{ color: appcolor.white, fontWeight: '700', textAlign: 'center', padding: 7 }}>{filter.monthname}/{filter.yearname}</Text>
                    </View>
                </TouchableOpacity>
                <RenderHeader styles={styles} appcolor={appcolor} onSelectItem={handlerLoadType} menuSelected={menuSelected.type} />

                <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" styles={{ marginTop: 8 }} />
                {!loading && <TopTabScroll />}
            </View>

            <ActionSheet containerStyle={{ backgroundColor: appcolor.light }} id="sheetYear">
                <View>
                    <YearMonthSelected option={filter} onYearMonth={(search) => onFilterChange(search)} numMonth={4} />
                    <TouchableOpacity onPress={() => handlerChooseMonth()}
                        style={{ marginBottom: 12, borderTopWidth: 0.31, borderTopColor: appcolor.primary }}>
                        <Text style={{ padding: 12, textAlign: 'center', color: appcolor.primary }}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            <ActionSheet containerStyle={{ backgroundColor: appcolor.light }} id="sheetEmp">
                <SafeAreaView style={{ backgroundColor: appcolor.surface }}>
                    <View style={{ padding: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 12, color: appcolor.dark, textAlign: 'center' }}>Danh sách nhân viên</Text>
                        <TouchableOpacity style={{ padding: 8 }} onPress={() => SheetManager.hide("sheetEmp")}>
                            <Icon name="close" size={22} color={appcolor.dark} />
                        </TouchableOpacity>
                    </View>
                    <FormGroup
                        appcolor={appcolor}
                        iconName='search'
                        containerStyle={styles.filterStyle}
                        placeholder={"Tìm kiếm ..."} editable
                        onClearTextAndroid={clearItemSelect}
                        handleChangeForm={handlerFilter}
                    />
                    <FlatList
                        data={dataModal.list}
                        extraData={dataModal.list}
                        listKey="dataModal"
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => renderItemModal(item, index, handleSelectedChange, clearItemSelect, appcolor)} />
                </SafeAreaView>
            </ActionSheet>
        </View>
    )
}
const RenderHeader = ({ styles, appcolor, onSelectItem, menuSelected }) => {
    const colorShiftSelect = menuSelected == TYPE_SHIFT ? appcolor.primary : appcolor.dark
    const colorOffSelect = menuSelected == TYPE_OFF ? appcolor.primary : appcolor.dark
    const colorLateSelect = menuSelected == TYPE_LATE ? appcolor.primary : appcolor.dark
    const colorEarlierSelect = menuSelected == TYPE_EARLIER ? appcolor.primary : appcolor.dark
    return (
        <View style={[styles.headerView]} >
            <TouchableOpacity onPress={() => onSelectItem(TYPE_SHIFT)} style={[styles.headerItem, { borderColor: colorShiftSelect, }]} >
                <Icon name='exchange-alt' type="font-awesome-5" size={21} color={colorShiftSelect} style={styles.iconHeader} />
                <Text style={[styles.titleHeader, { color: colorShiftSelect, textAlign: 'center' }]} >Chuyển ca</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelectItem(TYPE_OFF)} style={[styles.headerItem, { borderColor: colorOffSelect, }]} >
                <Icon name='window-close' type="font-awesome-5" size={21} color={colorOffSelect} style={styles.iconHeader} />
                <Text style={[styles.titleHeader, { color: colorOffSelect, textAlign: 'center' }]}>Nghỉ Phép</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelectItem(TYPE_LATE)} style={[styles.headerItem, { borderColor: colorLateSelect, }]} >
                <Icon name='clock' type="font-awesome-5" size={21} color={colorLateSelect} style={styles.iconHeader} />
                <Text style={[styles.titleHeader, { color: colorLateSelect, textAlign: 'center' }]}>Đi trễ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelectItem(TYPE_EARLIER)} style={[styles.headerItem, { borderColor: colorEarlierSelect, }]} >
                <Icon name='business-time' type="font-awesome-5" size={21} color={colorEarlierSelect} style={styles.iconHeader} />
                <Text style={[styles.titleHeader, { color: colorEarlierSelect, textAlign: 'center' }]}>Về sớm</Text>
            </TouchableOpacity>
        </View >
    )
}
const renderItemModal = (item, index, handleSelectedChange, clearItemSelect, appcolor) => {
    const mPress = () => {
        handleSelectedChange(item, index)
    }
    return (
        <ListItem bottomDivider onPress={mPress}
            containerStyle={{ backgroundColor: item.isSelect === 1 ? appcolor.primary : appcolor.light }} >
            <ListItem.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '15%', marginEnd: 8, backgroundColor: item.isData > 0 ? appcolor.yellow : appcolor.dark, padding: 5, borderRadius: 50, alignItems: 'center' }} >
                        <Text style={{ fontWeight: '700', fontSize: 15, color: appcolor.light }}>{item.isData}</Text>
                    </View>
                    <ListItem.Title style={{ color: appcolor.dark, fontSize: 14 }}>{item.typeName + ': ' + item.employeeName}</ListItem.Title>
                </View>
            </ListItem.Content>
        </ListItem>
    )
}
export default HistoryConfirm;