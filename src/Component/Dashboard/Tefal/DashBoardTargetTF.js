import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, FlatList, Platform, StyleSheet } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from "react-redux";
import { DataSummary } from "../../../Controller/DashboardController";
import { deviceHeight, deviceWidth, isFloat } from "../../../Core/Utility";
import { IconAnimation } from "../../../Control/IconAnimation/IconAnimation";
import { SafeAreaView } from "react-native";
import FormGroup from "../../../Content/FormGroup";
import _ from 'lodash';
import { Modal } from "react-native";
import { formatNumber } from "../../../Core/Helper";

export const DashBoardTargetTF = ({ navigation, typeDashboard, viewHeight, bgViewItem = null }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataDashboard, _setDataDashboard] = useState({ dashboardMain: [] })
    const [isLoading, setLoading] = useState(false)
    const [configSheet, _setConfigSheet] = useState({ itemSelect: {}, dataItem: [], visible: false })
    const [_Mutate, setMutate] = useState(false)
    //
    const LoadData = () => {
        setLoading(true)
        DataSummary(typeDashboard, (mData) => {

            if (mData.length > 0) {
                dataDashboard.dashboardMain = mData
                setMutate(e => !e)
            }
            // await setDataDashboard([...mData])
        });
        setLoading(false)
    }
    // Handler
    const handlerSelectItem = (item) => {
        const listStoreInactive = JSON.parse(item.listStoreInactive || '[]')
        configSheet.itemSelect = item
        configSheet.dataItem = listStoreInactive
        configSheet.visible = true
        setMutate(e => !e)
    }
    const handleCloseModal = () => {
        configSheet.itemSelect = {}
        configSheet.dataItem = []
        configSheet.visible = false
        setMutate(e => !e)
    }
    const onViewDetail = () => {
        navigation.navigate(dataDashboard.dashboardMain?.[0]?.pageName || 'dashboardDetail')
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return

        LoadData()
        return () => { isMounted = false }
    }, [])

    // View 
    const styles = StyleSheet.create({
        viewMain: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 6, backgroundColor: '#F6F8FB', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: appcolor.grayLight },
        titleHeadName: { width: '22%', fontSize: 10, color: appcolor.placeholderText, fontWeight: '700', paddingVertical: 4 },
        titleHeadValue: { width: '26%', fontSize: 10, textAlign: 'right', color: appcolor.placeholderText, paddingVertical: 4, fontWeight: '700' },
        viewHeadName: { width: '22%', justifyContent: 'center' },
        viewHeadValue: { width: '26%', alignItems: 'flex-end', justifyContent: 'center' },
        itemRow: { flexDirection: 'row', alignItems: 'center', minHeight: 32, width: '100%', paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        itemView: { width: '96%', minHeight: 24, alignItems: 'flex-end', justifyContent: 'center', backgroundColor: (bgViewItem || appcolor.light), borderRadius: 5, overflow: 'hidden', paddingHorizontal: 5, borderWidth: 0.5, borderColor: appcolor.grayLight },
        rowNameWrap: { width: '100%', flexDirection: 'row', alignItems: 'center' },
        rowDot: { width: 5, height: 18, borderRadius: 3, backgroundColor: '#2563EB', marginRight: 5 },
        rowName: { flex: 1, fontSize: 11, color: appcolor.dark, fontWeight: '800' },
        valueView: { fontWeight: '700', fontSize: 10, color: appcolor.dark },
        viewPercent: { height: '100%', backgroundColor: '#16A34A', position: 'absolute', top: 0, left: 0, opacity: 0.12 },
        fewList: { paddingHorizontal: 7, paddingTop: 3 },
        fewCard: { backgroundColor: appcolor.light, borderRadius: 7, borderWidth: 0.5, borderColor: appcolor.grayLight, paddingHorizontal: 7, paddingVertical: 5, marginBottom: 4 },
        fewTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        fewCells: { flexDirection: 'row', alignItems: 'stretch' },
        fewCell: { flex: 1, minHeight: 30, borderRadius: 5, backgroundColor: '#F6F8FB', paddingHorizontal: 4, paddingVertical: 3, marginHorizontal: 2, overflow: 'hidden', justifyContent: 'center' },
        fewLabel: { fontSize: 8, fontWeight: '700', marginBottom: 2 },
        fewValue: { fontSize: 10, fontWeight: '800', textAlign: 'right' },
    })
    const getCellColor = (column) => {
        if (column == 1) return '#2563EB'
        if (column == 2) return '#16A34A'
        return '#F97316'
    }
    const getColumnValue = (item, column) => {
        if (column == 1) {
            return `${item.actualByDay == '_' ? '' : item.actualByDay ? isFloat(item.actualByDay) ? item.actualByDay : formatNumber(item.actualByDay, ',') : 0}${item.unit1 ? item.unit1 : ''}${item.isHideTarget == 1 ? '' : `/${item.targetByDay ? (isFloat(item.targetByDay) ? item.targetByDay : formatNumber(item.targetByDay, ',')) : 0}`}${item.unit4 ? item.unit4 : ''}`
        }
        if (column == 2) {
            return `${item.actualByWeek == '_' ? '' : item.actualByWeek ? isFloat(item.actualByWeek) ? item.actualByWeek : formatNumber(item.actualByWeek, ',') : 0}${item.unit2 ? item.unit2 : ''}${item.isHideTarget == 1 ? '' : `/${item.targetByWeek ? (isFloat(item.targetByWeek) ? item.targetByWeek : formatNumber(item.targetByWeek, ',')) : 0}`}${item.unit5 ? item.unit5 : ''}`
        }
        return `${item.actualByMonth || 0}${item.unit3 ? item.unit3 : ''}${item.isHideTarget == 1 ? '' : `/${item.targetByMonth || 0}`}${item.unit6 ? item.unit6 : ''}`
    }
    const UIByCate = () => {
        var uiDashboard = [];
        const isFewItems = dataDashboard.dashboardMain?.length > 0 && dataDashboard.dashboardMain?.length <= 3
        if (isFewItems) {
            dataDashboard.dashboardMain?.forEach((item, index) => {
                const widthDay = `${(((item.actualByDay * (item.unit1 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByDay * (item.unit4 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByDay * (item.unit1 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByDay * (item.unit4 == 'B' ? 1000000000 : 1))}%`
                const widthWeek = `${(((item.actualByWeek * (item.unit2 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByWeek * (item.unit5 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByWeek * (item.unit2 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByWeek * (item.unit5 == 'B' ? 1000000000 : 1))}%`
                const widthMonth = `${(((item.actualByMonth * (item.unit3 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByMonth * (item.unit6 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByMonth * (item.unit3 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByMonth * (item.unit6 == 'B' ? 1000000000 : 1))}%`
                const listStoreInactive = JSON.parse(item.listStoreInactive || '[]')
                const labels = [item.titleC1 || 'Ngày', item.titleC2 || 'Tuần', item.titleC3 || 'Tháng']
                const widths = [widthDay, widthWeek, widthMonth]
                uiDashboard.push(
                    <View key={index.toString()} style={styles.fewCard}>
                        <View style={styles.fewTitle}>
                            <View style={[styles.rowDot, { backgroundColor: getCellColor((index % 3) + 1) }]} />
                            <Text numberOfLines={1} style={styles.rowName}>{item.titleRow}</Text>
                        </View>
                        <View style={styles.fewCells}>
                            {[1, 2, 3].map(column => {
                                const cellContent = (
                                    <View style={styles.fewCell}>
                                        <View style={{ ...styles.viewPercent, width: item.isHidePercent == 1 ? 0 : widths[column - 1], backgroundColor: getCellColor(column) }} />
                                        <Text numberOfLines={1} style={[styles.fewLabel, { color: getCellColor(column) }]}>{labels[column - 1]}</Text>
                                        <Text numberOfLines={1} style={[styles.fewValue, { color: getCellColor(column) }]}>{getColumnValue(item, column)}</Text>
                                    </View>
                                )
                                return column == 1 ? (
                                    <TouchableOpacity key={`few_${column}`} disabled={listStoreInactive.length == 0} onPress={() => handlerSelectItem(item)} style={{ flex: 1 }}>
                                        {cellContent}
                                    </TouchableOpacity>
                                ) : <View key={`few_${column}`} style={{ flex: 1 }}>{cellContent}</View>
                            })}
                        </View>
                    </View>
                )
            })
            return <View style={styles.fewList}>{uiDashboard}</View>
        }
        uiDashboard.push(
            <View key="e92" style={styles.viewMain} >
                <Text style={styles.titleHeadName} />
                <Text style={[styles.titleHeadValue, { color: getCellColor(1) }]}>{`${dataDashboard.dashboardMain?.[0]?.titleC1 || 'Ngày'}`}</Text>
                <Text style={[styles.titleHeadValue, { color: getCellColor(2) }]}>{`${(dataDashboard.dashboardMain?.[0]?.titleC2 || 'Tuần')}`}</Text>
                <Text style={[styles.titleHeadValue, { color: getCellColor(3) }]}>{`${(dataDashboard.dashboardMain?.[0]?.titleC3 || 'Tháng')}`}</Text>
            </View>
        )
        dataDashboard.dashboardMain?.forEach((item, index) => {
            const widthDay = `${(((item.actualByDay * (item.unit1 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByDay * (item.unit4 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByDay * (item.unit1 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByDay * (item.unit4 == 'B' ? 1000000000 : 1))}%`
            const widthWeek = `${(((item.actualByWeek * (item.unit2 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByWeek * (item.unit5 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByWeek * (item.unit2 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByWeek * (item.unit5 == 'B' ? 1000000000 : 1))}%`
            const widthMonth = `${(((item.actualByMonth * (item.unit3 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByMonth * (item.unit6 == 'B' ? 1000000000 : 1)) > 100 ? 100 : (((item.actualByMonth * (item.unit3 == 'B' ? 1000000000 : 1)) || 0) * 100) / (item.targetByMonth * (item.unit6 == 'B' ? 1000000000 : 1))}%`
            const listStoreInactive = JSON.parse(item.listStoreInactive || '[]')
            uiDashboard.push(
                <View key={index.toString()} style={[styles.itemRow, { backgroundColor: index % 2 == 0 ? appcolor.light : '#FAFBFC' }]}>
                    <View style={styles.viewHeadName}>
                        <View style={styles.rowNameWrap}>
                            <View style={[styles.rowDot, { backgroundColor: getCellColor((index % 3) + 1) }]} />
                            <Text numberOfLines={1} style={styles.rowName}>{item.titleRow} </Text>
                        </View>
                    </View>
                    <View style={styles.viewHeadValue}>
                        <TouchableOpacity
                            disabled={listStoreInactive.length == 0}
                            onPress={() => handlerSelectItem(item)} style={{ width: '100%' }} >
                            <View style={[styles.itemView, { backgroundColor: item.actualByWeek == '_' ? 'transparent' : (bgViewItem || appcolor.light) }]}>
                                <View style={{ ...styles.viewPercent, width: item.isHidePercent == 1 ? 0 : widthDay, backgroundColor: getCellColor(1) }} />
                                <Text numberOfLines={1} style={[styles.valueView, { color: getCellColor(1) }]}>{getColumnValue(item, 1)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.viewHeadValue}>
                        <View style={[styles.itemView, { backgroundColor: item.actualByWeek == '_' ? 'transparent' : (bgViewItem || appcolor.light) }]}>
                            <View style={{ ...styles.viewPercent, width: item.isHidePercent == 1 ? 0 : widthWeek, backgroundColor: getCellColor(2) }} />
                            <Text numberOfLines={1} style={[styles.valueView, { color: getCellColor(2) }]}>{getColumnValue(item, 2)}</Text>
                        </View>
                    </View>
                    <View style={styles.viewHeadValue}>
                        <View style={styles.itemView}>
                            <View style={{ ...styles.viewPercent, width: item.isHidePercent == 1 ? 0 : widthMonth, backgroundColor: getCellColor(3) }} />
                            <Text numberOfLines={1} style={[styles.valueView, { color: getCellColor(3) }]}>{getColumnValue(item, 3)}</Text>
                        </View>
                    </View>
                </View>
            )
        })
        return uiDashboard;
    }

    if (isLoading) {
        return <View></View>
    } else {
        return (
            <View
                style={{
                    width: (viewHeight != undefined && viewHeight > 0 ? deviceWidth - 16 : '100%'), backgroundColor: appcolor.surface,
                    height: (viewHeight != undefined && viewHeight > 0 ? viewHeight - 40 : ((deviceHeight / 2) * 0.7) - 60)
                }}>
                <View style={{ flexDirection: 'row', alignItems: "center", width: '100%', justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 7, paddingBottom: 4, backgroundColor: appcolor.light }}>
                    <TouchableOpacity onPress={onViewDetail} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chart-bar" type="font-awesome-5" size={12} color={appcolor.light} />
                        </View>
                        <Text style={{
                            color: appcolor.dark, fontSize: 13, marginRight: 5, marginLeft: 6, fontWeight: '700', flex: 1
                        }}>{dataDashboard.dashboardMain?.length > 0 ? dataDashboard.dashboardMain?.[0]?.title : ''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={isLoading ? null : LoadData} style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 0.3, borderColor: appcolor.grayLight, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.surface, overflow: 'hidden' }}>
                        <IconAnimation isLoop={isLoading} sourceIcon={require('../../../Themes/lotties/sync_load.json')} />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '100%', flex: 1, alignItems: 'center', paddingTop: 2, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 10 }}>
                            {UIByCate()}
                        </ScrollView>
                    </View>
                </View >

                <Modal
                    animationType="slide"
                    style={{ flex: 1 }}
                    visible={configSheet.visible}>
                    {
                        configSheet.dataItem?.length > 0 &&
                        <ViewDetailDashboard configSheet={configSheet} appcolor={appcolor} typeDashboard={typeDashboard} handleCloseModal={handleCloseModal} />
                    }
                </Modal>
            </View >
        )
    }
}
const ViewDetailDashboard = ({ configSheet, appcolor, typeDashboard, handleCloseModal }) => {
    const [data, setData] = useState({ dataView: configSheet.dataItem, dataViewF: configSheet.dataItem })
    const [_, setMutate] = useState(false)
    const [search, setSearch] = useState('')
    const contains = (shop, query) => {
        const { ShopCode, ShopName, Address, LevelName, AreaVN, DealerName, listEmployee } = shop;
        let Saddress = Address === null ? Address : Address?.toLowerCase();
        let SshopCode = ShopCode === null ? ShopCode : ShopCode?.toLowerCase();
        let SshopName = ShopName === null ? ShopName : ShopName?.toLowerCase();
        let SareaVN = AreaVN === null ? AreaVN : AreaVN?.toLowerCase();
        let SlevelName = LevelName === null ? LevelName : LevelName?.toLowerCase();
        // let SlevelName = LevelName === null ? LevelName : LevelName?.replace(/\s/g, "").toLowerCase();
        let SdealerName = DealerName === null ? DealerName : DealerName?.toLowerCase();
        let SlistEmployee = listEmployee === null ? listEmployee : listEmployee?.toLowerCase();
        if (SshopName?.includes(query) || SshopCode?.includes(query) || Saddress?.includes(query) || SlevelName?.includes(query) || SareaVN?.includes(query) || SdealerName?.includes(query) || SlistEmployee?.includes(query)) {
            return true;
        }
        return false;
    };
    const handleSearch = text => {
        const formattedQuery = text.toLowerCase();
        const filteredData = _.filter(data.dataViewF, shop => {
            return contains(shop, formattedQuery);
        });

        setSearch(text);
        if (formattedQuery === undefined || formattedQuery === '') {
            data.dataView = data.dataViewF
        } else
            data.dataView = filteredData
        setMutate(e => !e)
    };

    const renderItemFilter = ({ item, index }) => {
        const listEmployee = JSON.parse(item.listEmployee || '[]')
        return (
            <View key={item.ShopId + "_d"} style={{ padding: 8, margin: 8, borderRadius: 8, backgroundColor: appcolor.surface }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.dark }}>{item.ShopCode + " - " + item.ShopName}</Text>
                <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{item.Address}</Text>
                {item.LevelName !== null && item.LevelName !== undefined && item.LevelName !== '' && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>{item.LevelName}</Text>}
                {item.ShopFormat !== null && item.ShopFormat !== undefined && item.ShopFormat !== '' && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>{item.ShopFormat}</Text>}
                {item.DealerName !== null && item.DealerName !== undefined && item.DealerName !== '' && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>{item.DealerName}</Text>}
                {item.AreaVN !== null && item.AreaVN !== undefined && item.AreaVN !== '' && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>{item.AreaVN}</Text>}
                {
                    listEmployee.length > 0 &&
                    <View style={{ borderRadius: 4, padding: 4, minHeight: 25, borderWidth: 0.5, borderColor: appcolor.primary }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: appcolor.dark, width: '80%' }}>Nhân viên</Text>
                        <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, width: '80%' }}>{listEmployee?.map((it, idx) => { return `${it.EmployeeName} - ${it.EmployeeCode}` + `${(listEmployee.length - 1 == idx) ? '' : '\n'}` })}</Text>
                    </View>
                }
            </View>
        )
    }
    return (
        <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 8, paddingTop: 40 }}>
            <TouchableOpacity onPress={handleCloseModal}
                style={{ position: 'absolute', right: 20, top: Platform.OS == 'ios' ? 40 : 20, zIndex: 100, borderRadius: 5, borderWidth: 1, padding: 3, paddingHorizontal: 10, borderColor: appcolor.primary }}>
                <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}>Đóng</Text>
            </TouchableOpacity>
            <FormGroup
                editable
                containerStyle={{ backgroundColor: appcolor.surface, padding: 5, marginTop: 50, margin: 8 }}
                inputStyle={{ fontSize: 14 }}
                placeholder={`Tìm kiếm`}
                iconName='search'
                value={search}
                handleChangeForm={handleSearch}
            />
            <FlatList
                key={'listDetail_' + typeDashboard}
                windowSize={10}
                initialNumToRender={10}
                data={data.dataView}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItemFilter}
                ListFooterComponent={<View style={{ height: deviceHeight / 4 }} />}
            />
        </SafeAreaView>
    )
}
