import React, { useEffect, useState } from "react"
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native"
import { GetDataIncentive } from "../../../Controller/DashboardController";
import moment from 'moment';
import { useSelector } from "react-redux";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Divider, Badge } from "@rneui/base";
import { toCurrency } from '../../../Core/Utility'
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { LoadingView } from "../../../Control/ItemLoading/index";
import ModalItem from "../../../Control/ModalItem";
import { IncentiveByEmployee } from "./RenderKPI5/IncentiveByEmployee";
import RenderKPI6 from "./RenderKPI6/ViewIncentiveDashboard";

export const KPIIncentive = ({ navigation }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({ KPI1: [], KPI2: [], KPI3: [], KPI4: [], KPI5: [], KPI6: [], dataWorkingDay: [] })
    const [dataModal, setDataModal] = useState({ titleModal: 'Tháng ' + (moment().month() + 1) + '-' + moment().year(), visible: false, dataSelect: [], dataFilter: [] })
    const [_, setMutate] = useState(false)
    const loadData = async (jsonCalendar) => {
        setLoading(true)
        const dataJson = jsonCalendar || JSON.stringify({ year: moment().year(), month: moment().month() + 1 });
        await GetDataIncentive(dataJson, async (listKPI) => {
            const dataJson = jsonCalendar ? JSON.parse(jsonCalendar || '{}') : { year: moment().year(), month: moment().month() + 1 }
            await setData({
                KPI1: listKPI.table,
                KPI2: listKPI.table1,
                KPI3: listKPI.table2,
                dataWorkingDay: listKPI.table4,
                KPI4: listKPI.table5,
                KPI5: listKPI.table6,
                KPI6: listKPI.table7
            })
            await setDataModal({
                titleModal: `Tháng ${dataJson.month}-${dataJson.year}`,
                visible: false,
                dataSelect: listKPI.table3,
                dataFilter: listKPI.table3
            })
        })
        setLoading(false)
    }
    const handlerViewDetail = async (type) => {
        switch (type) {
            case 1:
                data.KPI1[0].viewDetail = !data.KPI1[0].viewDetail
                break;
            case 2:
                data.KPI2[0].viewDetail = !data.KPI1[0].viewDetail
                break;
            case 3:
                data.KPI3[0].viewDetail = !data.KPI1[0].viewDetail
                break;
        }
        setMutate(e => !e)
    }
    const handlerChooseMonth = async (item, index, value) => {
        dataModal.visible = false
        // await setDataModal({ ...dataModal, visible: false })
        await loadData(item.jsonCalendar)
    }
    useEffect(() => {
        const _load = loadData()
        return () => _load;
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light, marginTop: 8 },
        mainKPI: { backgroundColor: appcolor.surface, padding: 8, marginBottom: 5, borderRadius: 10 },
        headMonth: { width: '100%', fontSize: 15, fontWeight: '700', color: appcolor.dark, textAlign: 'center', padding: 8 }
    })
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={dataModal.titleModal || "Thưởng KPI"}
                iconRight="calendar-alt"
                leftFunc={() => navigation.goBack()}
                rightFunc={() => setDataModal({ ...dataModal, visible: true })}
            />
            <LoadingView isLoading={loading} title={'Đang cập nhật dữ liệu'} styles={{ marginTop: 8 }} />
            {!loading &&
                <ScrollView
                    style={{ flex: 1, margin: 8 }}
                    showsVerticalScrollIndicator={false}
                >
                    {data.dataWorkingDay.length > 0 && <RenderWorkingDay mData={data.dataWorkingDay} styles={styles} appcolor={appcolor} />}
                    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                        <Text style={{ padding: 8, color: appcolor.dark, fontWeight: '700', fontSize: 16 }}>{`Incentive ${dataModal.titleModal}`}</Text>
                        {data.KPI1?.length > 0 && <RenderKPI1 mData={data.KPI1} styles={styles} appcolor={appcolor} onViewDetail={handlerViewDetail} />}
                        {data.KPI2?.length > 0 && <RenderKPI2 mData={data.KPI2} styles={styles} appcolor={appcolor} />}
                        {data.KPI3?.length > 0 && <RenderKPI3 mData={data.KPI3} styles={styles} appcolor={appcolor} />}
                        {data.KPI4?.length > 0 && <RenderKPI4 mData={data.KPI4} styles={styles} appcolor={appcolor} />}
                        {data.KPI5?.length > 0 && <IncentiveByEmployee dataKPI={data.KPI5} navigation={navigation} />}
                        {data.KPI6?.length > 0 && <RenderKPI6 dataKPI={data.KPI6} navigation={navigation} />}

                    </View>
                </ScrollView>
            }
            <ModalItem
                groupType={'EMPLOYEE'}
                styles={styles} dataModal={dataModal}
                actionResultModal={() => setDataModal({ ...dataModal, visible: false })}
                actionCloseModal={() => setDataModal({ ...dataModal, visible: false })}
                actionChooseItem={handlerChooseMonth}
            />
        </View >
    )
}

const RenderKPI1 = ({ mData, styles, appcolor, onViewDetail }) => {
    const titleKPI = mData[0]?.kpi || "";
    const actual = mData[0]?.actual || '0'
    const target = mData[0]?.target || '0'
    const percent = mData[0]?.percent || '0'
    const reward = mData[0]?.reward || '0'
    const additional = mData[0]?.additional || '0'
    const viewDetail = mData[0]?.viewDetail || 0 == 1 ? true : false
    return (
        <TouchableOpacity onPress={() => onViewDetail(1)} >
            <View style={styles.mainKPI}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon color={appcolor.info} name="chart-line" size={18} solid />
                    <Text style={{ width: '60%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
                </View>
                {!viewDetail ?
                    <View style={{ marginTop: 8 }} >
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }} >
                            <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                Reward
                            </Text>
                            <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                Additional
                            </Text>
                        </View>
                        <View style={{ borderColor: appcolor.grayLight, borderWidth: 1, height: 1, width: '100%' }} />
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: '50%', alignItems: 'center' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.success, paddingTop: 5, paddingBottom: 5 }}>{toCurrency(reward)}</Text>
                            </View>
                            <View style={{ width: '50%', alignItems: 'center' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.secondary, paddingTop: 5, paddingBottom: 5 }}>{toCurrency(additional)}</Text>
                            </View>
                        </View>
                    </View>
                    :
                    <View style={{ marginTop: 8 }} >
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }} >
                            <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                Target
                            </Text>
                            <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                Submitted
                            </Text>
                            <Text style={{ width: '33%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                %
                            </Text>
                        </View>
                        <View style={{ borderColor: appcolor.grayLight, borderWidth: 1, height: 1, width: '100%' }} />
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: '33%', alignItems: 'center' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.yellow, paddingTop: 5, paddingBottom: 5 }}>{target}</Text>
                            </View>
                            <View style={{ width: '33%', alignItems: 'center' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{actual}</Text>
                            </View>
                            <View style={{ width: '33%' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{percent}</Text>
                            </View>
                        </View>
                    </View>
                }
            </View>
        </TouchableOpacity>
    )
}
const RenderKPI2 = ({ mData, styles, appcolor }) => {
    const titleKPI = mData[0]?.kpi || "";
    const quantity = mData[0]?.quantity || "0";
    const incentive = mData[0]?.incentive || "0";
    return (
        <View style={styles.mainKPI}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon color={appcolor.info} name="coins" size={18} solid />
                <Text style={{ width: '40%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
            </View>
            <View style={{ marginTop: 8 }} >
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }} >
                    <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Quantity
                    </Text>
                    <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Incentive
                    </Text>
                </View>
                <View style={{ borderColor: appcolor.grayLight, borderWidth: 1, height: 1, width: '100%' }} />
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '50%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{quantity}</Text>
                    </View>
                    <View style={{ width: '50%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.success, paddingTop: 5, paddingBottom: 5 }}>{toCurrency(incentive)}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
const RenderKPI3 = ({ mData, styles, appcolor }) => {
    const titleKPI = mData[0]?.kpi || "";
    return (
        <View style={styles.mainKPI}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon color={appcolor.info} name="medal" size={18} solid />
                <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
            </View>
            <ScrollView style={{ flex: 1, marginTop: 8 }} >
                {mData.map((item, index) => {
                    return (
                        <View key={index} style={{ flex: 1, marginTop: 5 }} >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Badge
                                    containerStyle={{ alignSelf: 'center' }}
                                    textStyle={{ fontSize: 13, fontWeight: 'bold', color: appcolor.black }}
                                    badgeStyle={{ backgroundColor: appcolor.yellowdark, height: 25, width: 25, borderRadius: 20, borderColor: appcolor.yellowdark }}
                                    value={item.top} />
                                <Text style={{ width: '100%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: 'bold', fontSize: 13 }}>{item.group}</Text>
                            </View>
                            <View style={{ marginTop: 8 }} >
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }} >
                                    <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                        Reward
                                    </Text>
                                    <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                                        %
                                    </Text>
                                </View>
                                <View style={{ borderColor: appcolor.grayLight, borderWidth: 1, height: 1, width: '100%' }} />
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: '50%', alignItems: 'center' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.secondary, paddingTop: 5, paddingBottom: 5 }}>{toCurrency(item.reward)}</Text>
                                    </View>
                                    <View style={{ width: '50%', alignItems: 'center' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 18, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.percent}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}
const RenderKPI4 = ({ mData, styles, appcolor }) => {
    const titleKPI = mData[0]?.title || "";
    return (
        <View style={styles.mainKPI}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon color={appcolor.info} name="medal" size={18} solid />
                <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
            </View>

            <ScrollView style={{ flex: 1, marginTop: 8 }} >
                {mData.map((item, index) => {
                    return (
                        <View key={item.chartName + index} style={{ flex: 1, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }} >
                            <View style={{
                                width: '40%', flexDirection: 'row', backgroundColor: item.color ? item.color : appcolor.light, alignItems: 'center',
                                borderWidth: 0.5, borderColor: appcolor.grey, padding: 4, borderRadius: 4
                            }}>
                                <Text style={{ width: '100%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: 'bold', fontSize: 14 }}>{item.chartName}</Text>
                            </View>
                            <View style={{
                                width: '59.5%', backgroundColor: item.color ? item.color : appcolor.light, borderRadius: 4,
                                borderWidth: 0.5, borderColor: appcolor.grey, padding: 4, justifyContent: 'center', alignItems: 'center'
                            }} >
                                <Text style={{ width: '100%', marginEnd: 8, textAlign: 'center', color: appcolor.dark, marginStart: 8, fontWeight: '500', fontSize: 13 }}>{item.amountIncentive || '-'}</Text>
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}
const RenderWorkingDay = ({ mData, styles, appcolor }) => {
    const item = mData[0];
    const titleKPI = item.title || ""
    const min = item.min
    const max = item.max
    const actual = item.actual == item.min || item.actual == item.max ? '' : item.actual
    const processStatus = `${((item.actual / item.max) * 100 | 0)}%`
    const processForTitle = `${((item.actual / item.max) * 100 | 0) + 1}%`
    const maxProgress = processStatus == '100%' ? '100%' : `${100 - ((item.actual / item.max) * 100 | 0)}%`
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <Text style={{ padding: 8, color: appcolor.dark, fontWeight: '700', fontSize: 16 }}>{'Lương ngày công tạm tính'}</Text>
            <View style={styles.mainKPI}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon color={appcolor.info} name="briefcase" size={18} solid />
                    <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
                </View>
                <View style={{ width: '100%', padding: 8, alignSelf: 'center' }} >
                    <View style={{ width: '100%', height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <View style={{ zIndex: 10 }}>
                            <Icon color={appcolor.greylight} name="circle" size={13} solid />
                        </View>
                        <View style={{ width: '100%', alignSelf: 'center' }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
                                <View style={{ width: processStatus, height: 2, backgroundColor: appcolor.secondary }} />
                                {actual.length > 0 && <Icon style={{ zIndex: 10 }} color={appcolor.secondary} name="circle" size={13} solid />}
                                <View style={{ width: maxProgress, height: 2, backgroundColor: appcolor.greylight }} />
                            </View>
                        </View>
                        <View style={{ zIndex: 10 }}>
                            <Icon color={appcolor.greylight} name="circle" size={13} solid />
                        </View>
                    </View>
                    <View style={{ width: '100%', height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <View style={{ zIndex: 10 }}>
                            <Text style={{ color: appcolor.greylight, fontWeight: '600', fontSize: 15 }}>{min}</Text>
                        </View>
                        <View style={{ width: '100%', alignSelf: 'center' }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
                                <View style={{ width: processForTitle }} />
                                <Text style={{ color: appcolor.secondary, fontWeight: '700', fontSize: 15 }}>{actual}</Text>
                            </View>
                        </View>
                        <View style={{ zIndex: 10 }}>
                            <Text style={{ color: appcolor.greylight, fontWeight: '600', fontSize: 15 }}>{max}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ width: '90%', flexDirection: 'row', alignSelf: 'center' }}>
                    <Text style={{ textAlign: 'left', color: appcolor.secondary, fontWeight: '700', fontSize: 23, padding: 8, width: '50%' }}>{item.actual}/{item.max}</Text>
                    <Text style={{ textAlign: 'right', color: appcolor.secondary, fontWeight: '700', fontSize: 23, padding: 8, width: '50%' }}>
                        {item.amount > 0 ? toCurrency(item.amount) : 0}
                    </Text>
                </View>
            </View>
        </View>
    )
}
// const RenderKPI4 = ({ mData, styles, appcolor }) => {
//     const titleKPI = mData[0]?.title || "";
//     return (
//         <View style={styles.mainKPI}>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Icon color={appcolor.info} name="medal" size={18} solid />
//                 <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}>{titleKPI}</Text>
//             </View>

//             <ScrollView style={{ flex: 1, marginTop: 8 }} >
//                 {mData.map((item, index) => {
//                     return (
//                         <View key={item.chartName + index} style={{ flex: 1, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }} >
//                             <View style={{
//                                 width: '40%', flexDirection: 'row', backgroundColor: item.color ? item.color : appcolor.light, alignItems: 'center',
//                                 borderWidth: 0.5, borderColor: appcolor.grey, padding: 4, borderRadius: 4
//                             }}>
//                                 <Text style={{ width: '100%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: 'bold', fontSize: 14 }}>{item.chartName}</Text>
//                             </View>
//                             <View style={{
//                                 width: '59.5%', backgroundColor: item.color ? item.color : appcolor.light, borderRadius: 4,
//                                 borderWidth: 0.5, borderColor: appcolor.grey, padding: 4, justifyContent: 'center', alignItems: 'center'
//                             }} >
//                                 <Text style={{ width: '100%', marginEnd: 8, textAlign: 'center', color: appcolor.dark, marginStart: 8, fontWeight: '500', fontSize: 13 }}>{item.amountIncentive || '-'}</Text>
//                             </View>
//                         </View>
//                     )
//                 })}
//             </ScrollView>
//         </View>
//     )
// }
