import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from '../../Content/HeaderCustom'
import { DataKPI, DataScoreKPI, UploadScoreKPI } from '../../API/KPIEmployeeAPI'
import { ToastError, ToastSuccess } from "../../Core/Helper";
import { LoadingView } from '../../Control/ItemLoading/index'
import FormGroup from '../../Content/FormGroup'
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Text } from '@rneui/themed';
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { alertConfirm, deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
import Icon from 'react-native-vector-icons/FontAwesome5'
import _, { debounce } from "lodash";
import { CalendarSelected } from "../../Control/CalendarSelected";
import moment from "moment";

export const ScoreKPI = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const configData = JSON.parse(kpiinfo?.reportItem)
    const tabRef = useRef()
    const [loading, setLoading] = useState(false)
    const [dataScore, setDataScore] = useState({ shopList: [], employeeList: [] })
    const [dataFilter, setDataFilter] = useState([])
    const [dataKPI, setDataKPI] = useState([])
    const [settings, setSettings] = useState({ shopId: 0, shopName: '', shopCode: '', userId: 0, fullName: '', employeeCode: '', resultItem: '' })
    const [dateKPI, setDateKPI] = useState({ value: moment().format('YYYYMMDD'), date: moment().format('YYYY-MM-DD'), isView: false })
    const [_, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        await DataScoreKPI(configData.byShop || 0, 0, 0, async ({ messager, data }) => {
            messager !== null && ToastError(messager)
            messager == null && setDataScore({
                shopList: data.table,
                employeeList: data.table1
            })
            messager == null && setDataFilter(data.table)
        })
        await getDataKPI()
        await setLoading(false)
        await showFilterData()
    }
    const getDataKPI = async (shopId, userId, workDate) => {
        await setLoading(true)
        await DataKPI(
            userId || settings.userId,
            shopId || settings.shopId,
            workDate || dateKPI.value,
            async ({ messager, data }) => {
                messager !== null && ToastError(messager)
                messager == null && await setDataKPI(data)
            })
        await setLoading(false)
    }
    const UploadData = async () => {
        alertConfirm('Gửi dữ liệu', 'Sau khi gửi bảng chấm điểm KPI dữ liệu sẽ khoá, Vui lòng kiểm tra kỹ trước khi xác nhận', async () => {
            await UploadScoreKPI(dataKPI, async (info) => {
                if (info.status == 200) {
                    ToastSuccess(info.messeger)
                    await getDataKPI(settings.shopId, settings.userId, dateKPI.value)
                } else
                    ToastError(info.messeger)
            })
        }, null, 'Xác nhận', 'Huỷ')
    }
    // Handler Action
    const handlerAnswer = (item, index) => {
        const value = item.IsChecked == 1 ? 0 : 1
        const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId)

        const detail = JSON.parse(dataKPI[indexData].detail)
        const itemDetail = detail[index]
        itemDetail.IsChecked = value

        dataKPI[indexData].detail = JSON.stringify(detail)
        setMutate(e => !e)
    }
    const showFilterData = () => {
        SheetManager.show('sheetFilterKPI')
    }
    const showCalendar = () => {
        setDateKPI({ ...dateKPI, isView: !dateKPI.isView })
    }
    const hanlerChooseDate = (date) => {
        const dateView = moment(date).format('DD MMM, YYYY')
        const dateValue = moment(date).format('YYYYMMDD')
        dataKPI.map((item, index) => {
            item.auditDate = dateView
            item.workDate = dateValue
        })
        setDateKPI({ value: dateValue, date: date, isView: false })
        setMutate(e => !e)
    }
    const handlerChooseItem = async (item) => {
        if (item.typeName == 'STORE') {
            const employeeList = dataScore.employeeList.filter(i => i.shopId == item.shopId)
            setSettings({ ...settings, shopId: item.shopId, shopName: item.shopName, shopCode: item.shopCode })
            setDataFilter(employeeList)
        } else {
            await getDataKPI(settings.shopId, item.employeeId)
            SheetManager.hide('sheetFilterKPI')
            setSettings({ ...settings, userId: item.employeeId, fullName: item.employeeName, employeeCode: item.employeeCode })
            setDataFilter(dataScore.shopList)
        }

    }
    const handlerNote = (text, item, i) => {
        dataKPI[i].note = text
        setMutate(e => !e)
    }
    const handlerFilterItem = debounce((text) => {
        // const filterList = _.filter(dataMain, (i) => {
        //     const shopName = i.shopName || ''
        //     const shopCode = i.shopCode || ''
        //     const employeeName = i.employeeName || ''
        //     const employeeCode = i.employeeCode || ''
        //     return shopName.toLowerCase().match(text.toLowerCase()) || shopCode.toLowerCase().match(text.toLowerCase()) ||
        //         employeeName.toLowerCase().match(text.toLowerCase()) || employeeCode.toLowerCase().match(text.toLowerCase())
        // })
        // setDataView(filterList)
    }, 200)
    //
    useEffect(() => {
        LoadData()
        return () => loading
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentView: { flex: 1 },
        titleHeader: { width: '75%', fontSize: 14, fontWeight: '500', color: appcolor.dark, padding: 8 },
        pointView: { width: '15%', alignItems: 'center', padding: 8 },
        viewDate: { margin: 8 }
    })
    const renderItemKPI = ({ item, index }) => {
        const onPressItem = () => {
            handlerAnswer(item, index)
        }
        return (
            <TouchableOpacity key={`iiemwd_${index}`} onPress={item.isLock == 1 ? null : onPressItem}>
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight }}>
                    <Icon
                        style={{ textAlign: 'center', width: '8%' }}
                        name={item.IsChecked == 1 ? "minus-circle" : "circle"} size={18}
                        color={item.IsChecked == 1 ? appcolor.red : appcolor.dark}
                    />
                    <Text style={styles.titleHeader}>{`${item.KPIName}`}</Text>
                    <View style={styles.pointView}>
                        <Text style={{ color: appcolor.red, fontSize: 14, fontWeight: '500' }}>{`${item.mPoint}`}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    const renderItemFilter = (item, index) => {
        const onChoose = () => {
            handlerChooseItem(item)
        }
        const titleShop = `CH: (${item.shopCode}) - ${item.shopName}`
        const titleEmployee = `NV: ${item.employeeName}`
        return (
            <TouchableOpacity key={`11)__${index}`} onPress={onChoose}>
                <View style={{ width: '100%', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight, alignSelf: 'center' }}>
                    <Text style={{ padding: 8, paddingBottom: 0, fontSize: 14, fontWeight: '600', color: appcolor.dark }}>
                        {item.typeName == 'STORE' ? titleShop : titleEmployee}
                    </Text>
                    <Text style={{ padding: 8, paddingTop: 0, fontSize: 13, fontWeight: '400', color: appcolor.greylight }}>
                        {item.typeName == 'STORE' ? `Đc: ${item.address}` : `Code: ${item.employeeCode}`}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconMiddle='poll-h'
                iconRight='cloud-upload-alt'
                middleFunc={showFilterData}
                rightFunc={UploadData}
                leftFunc={() => navigation.goBack()}
            />
            {dataKPI.length > 0 && <HeaderInfoKPI item={settings} dataKPI={dataKPI} />}
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            <View style={styles.contentView}>
                <Tabs.Container
                    ref={tabRef}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            style={{ margin: 5 }}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.transparent }}
                            inactiveColor={appcolor.greylight}
                            activeColor={appcolor.info}
                            tabStyle={{ margin: 5, borderRadius: 30, backgroundColor: appcolor.surface, minWidth: minWidthTab(dataKPI), height: 38 }}
                            scrollEnabled={true}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    {dataKPI.length > 0 && dataKPI.map((it, i) => {
                        let dataItem = JSON.parse(it.detail) || []
                        const noteAction = (text) => {
                            handlerNote(text, it, i)
                        }
                        return (
                            <Tabs.Tab key={`itemOsas_${i}`} label={it.groupName} name={it.groupName} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 62, padding: 5, width: deviceWidth }}>
                                    <FormGroup
                                        containerStyle={{ backgroundColor: appcolor.placeholderBody, margin: 8 }}
                                        editable={it.isLock == 0}
                                        title='Ghi chú'
                                        placeholder='Nhập ghi chú'
                                        defaultValue={it.note}
                                        handleChangeForm={noteAction}
                                    />
                                    <FlatList
                                        key={'listanswerkpi'}
                                        extraData={dataItem}
                                        keyExtractor={(_item, index) => index.toString()}
                                        data={dataItem}
                                        removeClippedSubviews={true}
                                        initialNumToRender={2}
                                        maxToRenderPerBatch={1}
                                        updateCellsBatchingPeriod={100}
                                        windowSize={7}
                                        renderItem={renderItemKPI}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            </Tabs.Tab>
                        )
                    })}
                </Tabs.Container>
                <ActionSheet id='sheetFilterKPI'
                    initialOffsetFromBottom={0.6}
                    statusBarTranslucent
                    gestureEnabled
                    drawUnderStatusBar={Platform.OS == 'ios'}>
                    <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 8 }}>
                        <View style={styles.viewDate}>
                            <FormGroup
                                containerStyle={{ width: '100%', padding: 5, backgroundColor: appcolor.placeholderBody }}
                                inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.greylight }}
                                title='Ngày chấm điểm'
                                iconRight='calendar-alt'
                                value={dateKPI.date}
                                rightFunc={showCalendar}
                            />
                            {dateKPI.isView && <CalendarSelected onChangeData={hanlerChooseDate} isBetween={false} disibleFuture={configData.isFuture == 1} />}
                        </View>
                        <View style={{ width: '100%', height: deviceHeight, paddingBottom: deviceHeight / 4.5 }}>
                            <FormGroup
                                editable
                                containerStyle={{ backgroundColor: appcolor.surface, padding: 5 }}
                                inputStyle={{ fontSize: 14 }}
                                placeholder={`Tìm kiếm`}
                                iconName='search'
                                handleChangeForm={handlerFilterItem}
                            />
                            <ScrollView style={{ width: '100%', height: deviceHeight }}>
                                {dataFilter.map((item, index) => {
                                    return renderItemFilter(item, index)
                                })}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </ActionSheet>
            </View>
        </View>
    )
}
const HeaderInfoKPI = ({ item, dataKPI }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const styles = StyleSheet.create({
        titleView: { fontSize: 14, fontStyle: 'italic', fontWeight: '700', color: appcolor.dark },
        titleResultView: { fontSize: 14, fontStyle: 'italic', fontWeight: '700', color: appcolor.success }
    })
    const itemKPI = dataKPI[0] || {}
    const dateTitle = itemKPI?.auditDate !== null ? `Ngày ${itemKPI?.auditDate}` : 'Ngày chấm điểm:'
    const employeeTitle = item.userId > 0 ? `Nhân viên (${item.employeeCode}) - ${item.fullName}` : 'Nhân viên:'
    const shopTitle = item.shopId > 0 ? `Cửa hàng (${item.shopCode}) - ${item.shopName}` : 'Cửa hàng:'
    return (
        <View style={{ padding: 8 }}>
            <Text style={styles.titleView}>{dateTitle}</Text>
            <Text style={styles.titleView}>{shopTitle}</Text>
            <Text style={styles.titleView}>{employeeTitle}</Text>
            <Text style={styles.titleResultView}>{itemKPI?.resultItem || ''}</Text>
        </View>
    )
} 