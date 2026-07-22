import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { useSelector } from "react-redux";
import { DataKPIResult } from "../../API/KPIEmployeeAPI";
import FormGroup from "../../Content/FormGroup";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { LoadingView } from "../../Control/ItemLoading";
import { deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
import { Text } from '@rneui/themed';
import { groupDataByKey, ToastSuccess } from "../../Core/Helper";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { CalendarSelected } from "../../Control/CalendarSelected";
import moment from "moment";

export const KPIResult = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dataKPI, setDataKPI] = useState([])
    const [filter, setFilter] = useState({ fromDate: '', toDate: '', fromValue: 0, toValue: 0 })
    const tabRef = useRef()

    const LoadData = async (fromDate, toDate) => {
        await setLoading(true)
        await DataKPIResult(
            fromDate || filter.fromValue,
            toDate || filter.toValue,
            async (info) => {
                if (info.data !== null && info.data.length > 0)
                    setDataKPI(info.data)
                else {
                    setDataKPI([])
                    ToastSuccess('Không có dữ liệu chấm điểm')
                }
            })
        await setLoading(false)
    }
    // Handler
    const showFilter = () => {
        SheetManager.show('sheetFilter')
    }
    const handlerChooseDate = async (fromDate, toDate) => {
        const fromValue = moment(fromDate).format('YYYYMMDD')
        const toValue = moment(toDate).format('YYYYMMDD')
        await setFilter({
            fromDate: moment(fromDate).format('DD/MM/YYYY'),
            toDate: moment(toDate).format('DD/MM/YYYY'),
            fromValue: fromDate,
            toValue: toValue,
        })
        if (toDate !== null) {
            SheetManager.hide('sheetFilter')
            await LoadData(fromValue, toValue)
        }
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentView: { flex: 1 },
        headerDate: { width: '100%', fontSize: 15, fontWeight: '700', color: appcolor.info, padding: 3, marginTop: 8 },
        titleKPI: { width: '85%', fontSize: 14, color: appcolor.dark, padding: 8 },
        scoreResultKPI: { width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '800', color: appcolor.success, padding: 12 },
        pointView: { width: '15%', alignItems: 'center', padding: 8 },
        managerView: { backgroundColor: appcolor.surface, padding: 8, margin: 8, marginBottom: 0, borderRadius: 8 },
        noteView: { paddingStart: 8, paddingEnd: 8, width: '100%', paddingTop: 8 },
        titleManager: { width: '100%', fontSize: 14, fontWeight: '600', color: appcolor.blacklight, fontStyle: 'italic' },
        titleNote: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.info }
    })
    useEffect(() => {
        LoadData()
        return () => loading
    }, [])
    const renderItem = ({ item, index }) => {
        const keyLayer2 = item[`${item.AuditDate}${item.ParentName}`]

        return (
            <View key={`iiemwd_${index}`} >
                {item.isParent && <Text style={styles.headerDate}>{`Ngày ${item.AuditDate}`}</Text>}
                {keyLayer2 && item.ParentCode &&
                    <View style={styles.managerView}>
                        <Text style={styles.titleManager}>{`Quản lí: (${item.ParentCode}) - ${item.ParentName}`}</Text>
                    </View>
                }
                {item.Note.length > 0 && <View style={styles.noteView}>
                    <Text style={styles.titleNote}>{`Ghi chú: ${item.Note}`}</Text>
                </View>}
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight }}>
                    <View style={styles.pointView}>
                        <Text style={{ color: appcolor.red, fontSize: 14, fontWeight: '500' }}>{`${item.mPoint}`}</Text>
                    </View>
                    <Text style={styles.titleKPI}>{`${item.KPIName}`}</Text>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight='search'
                rightFunc={showFilter}
                leftFunc={() => navigation.goBack()}
            />
            <LoadingView isLoading={loading} />
            <View style={styles.contentView}>
                {dataKPI.length > 0 && <Text style={styles.scoreResultKPI}>{dataKPI[0].totalKPI}</Text>}
                {dataKPI.length > 0 &&
                    <Tabs.Container
                        ref={tabRef}
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                style={{ margin: 5 }}
                                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                inactiveColor={appcolor.greylight}
                                activeColor={appcolor.tomato}
                                tabStyle={{ margin: 5, borderRadius: 30, backgroundColor: appcolor.surface, minWidth: minWidthTab(dataKPI), height: 38 }}
                                scrollEnabled={true}
                            />
                        )}
                        containerStyle={{ backgroundColor: appcolor.surface }}>
                        {dataKPI.map((it, i) => {
                            const { arr } = groupDataByKey({
                                arr: JSON.parse(it.detail) || [],
                                key: 'AuditDate',
                                keyLayer2: 'ParentName'
                            })
                            return (
                                <Tabs.Tab key={`itemOsas_${i}`} label={it.groupName} name={it.groupName} >
                                    <View style={{ backgroundColor: appcolor.light, marginTop: 62, paddingBottom: 16, padding: 5, width: deviceWidth }}>
                                        <FlatList
                                            key={'listresultkpi'}
                                            extraData={arr}
                                            keyExtractor={(_item, index) => index.toString()}
                                            data={arr}
                                            removeClippedSubviews={true}
                                            initialNumToRender={2}
                                            maxToRenderPerBatch={1}
                                            updateCellsBatchingPeriod={100}
                                            windowSize={7}
                                            renderItem={renderItem}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    </View>
                                </Tabs.Tab>
                            )
                        })}
                    </Tabs.Container>
                }
                <ActionSheet id="sheetFilter"
                    initialOffsetFromBottom={0.6}
                    statusBarTranslucent
                    gestureEnabled
                    drawUnderStatusBar={Platform.OS == 'ios'}
                >
                    <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 8 }}>
                        <View style={{ margin: 8 }}>
                            <FormGroup
                                containerStyle={{ width: '100%', padding: 5, backgroundColor: appcolor.placeholderBody }}
                                inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
                                title='Từ ngày - Đến ngày'
                                iconRight='calendar-alt'
                                value={`${filter.fromDate} - ${filter.toDate}`}
                            />
                            <CalendarSelected onChangeData={handlerChooseDate} />
                        </View>
                    </SafeAreaView>
                </ActionSheet>
            </View>
        </View>
    )
}