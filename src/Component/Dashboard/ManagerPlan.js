import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { useSelector } from "react-redux";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { HeaderCustom } from "../../Content/HeaderCustom";
import { GetDataManagerPlan } from "../../Controller/DashboardController";
import { GET_ListWeek } from "../../Controller/PlanController";
import { LoadingView } from '../../Control/ItemLoading/index'
import ModalItem from "../../Control/ModalItem";
import { deviceWidth } from "../../Themes/AppsStyle";
import Swiper from "react-native-swiper";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import moment from 'moment';

const ManagerPlan = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isLoading, setIsLoading] = useState(true)
    const [isWeekLoading, setIsWeekLoading] = useState(true)
    const [dataWeek, setDataWeek] = useState([])
    const [data, setData] = useState({ dataPlan: [], employeeList: [] })
    const [pageNum, setPageNum] = useState()
    const [dataModal, setDataModal] = useState({ titleModal: 'Danh sách nhân viên', visible: false, dataSelect: [], dataFilter: [] })

    const LoadWeek = async () => {
        await GET_ListWeek(async (_, dataWeek) => {
            const indexWeek = dataWeek.findIndex(i => i.value == moment().week())
            await setPageNum(indexWeek)
            await setDataWeek(dataWeek)
            await setIsWeekLoading(false)
            await LoadData(dataWeek[indexWeek])
        })
    }
    const LoadData = async (dateChoose) => {
        await GetDataManagerPlan(dateChoose.firstDateWeek, dateChoose.lastDateWeek, async (mData, mEmployee) => {
            await setData({ dataPlan: mData, employeeList: mEmployee })
            await setDataModal({ titleModal: 'Danh sách nhân viên', visible: false, dataSelect: mEmployee, dataFilter: mEmployee })
        })
        await setIsLoading(false)
    }
    const handlerIndexChange = async (index) => {
        await setPageNum(index)
        await setIsLoading(true)
        await LoadData(dataWeek[index])
    }
    const handlerChooseItem = async (item) => {
        const employeeList = dataModal.dataFilter.map(i => i.employeeId == item.employeeId ? { ...i, isSelect: 1 } : i)
        await setDataModal({ ...dataModal, dataFilter: employeeList, dataSelect: employeeList, visible: false })
    }
    const handlerCloseModal = () => {
        setDataModal({ ...dataModal, visible: false })
    }
    const handlerSearch = async (text) => {
        if (text) {
            let dataFilter = dataModal.dataFilter.filter(e => {
                const labelFilter = e.name.toUpperCase()
                return labelFilter.indexOf(text.toUpperCase()) > -1
            })
            await setDataModal({ ...dataModal, dataSelect: dataFilter, dataFilter: dataFilter })
        } else {
            await setDataModal({ ...dataModal, dataSelect: data.employeeList, dataFilter: data.employeeList })
        }
    }
    const handlerClearItem = async () => {
        await setDataModal({ ...dataModal, dataFilter: data.employeeList, dataSelect: data.employeeList, visible: false })
    }
    useEffect(() => {
        LoadWeek();
        return () => false
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.light, width: '100%', height: '100%' },
        employeeContainer: { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 8 },
        weekContainer: { flex: 1, alignItems: 'center', backgroundColor: appcolor.light, padding: 8 },
        weekStyle: { width: deviceWidth / 7.5, flexDirection: 'column', paddingTop: 8, paddingBottom: 8, paddingStart: 8, paddingEnd: 8, alignItems: 'center', backgroundColor: appcolor.grayLight },
        styleNonePlan: { width: '100%', height: 'auto', backgroundColor: appcolor.info, padding: 3, marginTop: 6, borderRadius: 50, alignItems: 'center' },
        headerView: { width: '100%', flexDirection: 'row', alignItems: 'center' },
        headerItem: { flex: 1, borderRadius: 10, borderWidth: 1.5, margin: 8, padding: 0, backgroundColor: appcolor.light, minHeight: (deviceWidth / 4 - 30), alignItems: 'center', justifyContent: 'center' },
        iconHeader: { marginBottom: 8 },
        titleHeader: { fontSize: 12, fontWeight: '700' }
    })
    const renderWeekPlan = ({ item, index }) => {
        const iconStatusWork = item.IsWorking == 0 ? "times" : item.IsWorking > 1 ? "check-square" : null
        const colorWorking = item.IsWorking == 1 ? appcolor.light : item.IsWorking == 2 ? 'green' : item.IsWorking == 3 ? appcolor.danger : appcolor.dark
        return (
            <View key={`IP_${index}`} style={styles.weekStyle}>
                <Text style={{ color: appcolor.dark, fontWeight: 'bold', fontSize: 15 }}>{item.DayView}</Text>
                {item.IsWorking > 1 && <Icon style={{ marginTop: 8 }} name={iconStatusWork} solid size={18} color={colorWorking} />}
                {item.IsWorking == 0 && <Icon style={{ marginTop: 8 }} name={iconStatusWork} solid size={18} color={colorWorking} />}
                {item.IsWorking == 1 &&
                    <View style={styles.styleNonePlan}>
                        <Text style={{ color: colorWorking, fontSize: 12, fontWeight: '800' }} >{item.TypeOff}</Text>
                    </View>
                }
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        const dataWeek = JSON.parse(item?.DataWeek || '[]')
        return (
            <View key={`W_${index}`} style={styles.weekContainer}>
                <View style={styles.employeeContainer}>
                    <Icon name="user-circle" size={24} color={appcolor.dark} solid />
                    <Text style={{ color: appcolor.dark, marginLeft: 8, fontWeight: '700', fontSize: 15 }}>{item.EmployeeName}</Text>
                </View>
                <FlatList
                    style={{ borderRadius: 8, backgroundColor: appcolor.lightgray }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={dataWeek}
                    renderItem={renderWeekPlan}
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
        )
    }
    const ItemPageWeek = () => {
        let uiView = []
        dataWeek?.forEach((item, index) => {
            uiView.push(
                <View key={index} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: appcolor.greylight }}>
                    <Text style={{ fontSize: 18, color: appcolor.dark, textAlign: 'center', padding: 8, fontWeight: '700' }}>{item.label}</Text>
                </View >
            )
        })
        return uiView
    }
    const TopTabScroll = () => {
        const tablist = []
        data.dataPlan.forEach((i, index) => {
            const dataDetail = JSON.parse(i.dataDetail)
            tablist.push(
                <Tabs.Tab key={`TT_${index}`} name={`${i.titleName} (${i.countItem})`}>
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <FlatList
                            style={{ borderRadius: 8, backgroundColor: appcolor.lightgray }}
                            showsVerticalScrollIndicator={false}
                            data={dataDetail}
                            nestedScrollEnabled={true}
                            renderItem={renderItem}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </View>
                </Tabs.Tab>
            )
        });
        return (
            <Tabs.Container
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.light }}
                        tabStyle={{ minWidth: deviceWidth / 2, height: 38 }}
                    />
                )}
                ref={(ref) => this._refTabView = ref}>
                {tablist}
            </Tabs.Container>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={route?.params.menuitem.menuNameVN}
                leftFunc={() => navigation.goBack()}
            // rightFunc={() => setDataModal({ ...dataModal, visible: true })}
            // iconRight='search'
            />
            <LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' styles={{ marginTop: 8 }} />
            <View style={{ width: '100%', height: '80%' }}>
                {!isLoading && <TopTabScroll />}
            </View>
            <View style={{ width: '100%', height: '8%', alignSelf: 'center', marginBottom: 8, position: 'absolute', bottom: 8 }}>
                {!isWeekLoading &&
                    <Swiper
                        key={data.dataPlan.length}
                        index={pageNum}
                        loop={false}
                        showsPagination={false}
                        showsButtons={true}
                        nextButton={<Icon name='chevron-right' size={21} color={appcolor.dark} style={{ padding: 8 }} />}
                        prevButton={<Icon name='chevron-left' size={21} color={appcolor.dark} style={{ padding: 8 }} />}
                        onIndexChanged={handlerIndexChange}>
                        {ItemPageWeek()}
                    </Swiper>
                }
            </View >
            <ModalItem key='modalEmployee' dataModal={dataModal}
                actionResultModal={handlerCloseModal}
                actionCloseModal={handlerCloseModal}
                actionChooseItem={handlerChooseItem}
                actionSearch={handlerSearch}
                actionClearItem={handlerClearItem}
            />
        </View >
    )
}
export default ManagerPlan;