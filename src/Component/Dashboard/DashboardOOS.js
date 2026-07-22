import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, Platform, Modal, StyleSheet, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Divider, Badge } from "@rneui/base";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { groupDataByKey } from "../../Core/Helper";
import { toCurrency } from "../../Core/Utility";
import { scaleSize } from "../../Themes/AppsStyle";

export const DashboardOOS = ({ info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [viewDetail, setViewDetail] = useState(false)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        viewAll.push(
            <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ width: '20%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>

                </Text>
                <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Tổng
                </Text>
                <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    SL
                </Text>
                <Text style={{ width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Tỷ lệ (%)
                </Text>
            </View>
        )
        viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        data.forEach((item, index) => {
            viewAll.push(
                <View key={"mn_2" + index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontSize: 15, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.RTime}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.second, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                    </View>
                </View>
            )
            viewAll.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        });
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu doanh số</Text>)
    }
    const onViewDetail = () => {
        setViewDetail(e => !e)
    }
    return (
        <TouchableOpacity style={{ backgroundColor: appcolor.surface, padding: 8, borderRadius: 10, marginBottom: 8 }}
            onPress={onViewDetail}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon color={appcolor.info} name="chart-bar" size={23} />
                <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
            </View>
            <View style={{ marginTop: 16 }}>
                {viewAll}
            </View>
            <Modal style={{ zIndex: 1000 }} visible={viewDetail}>
                <DetailData
                    dataDetail={JSON.parse(info.detailData)}
                    appcolor={appcolor}
                    title={info.chartName}
                    onClose={() => setViewDetail(false)} />
            </Modal>
        </TouchableOpacity >
    )
}

const DetailData = ({ title, dataDetail, appcolor, onClose }) => {
    const [data, setData] = useState([])

    const LoadData = async () => {
        const { arr } = await groupDataByKey({
            arr: dataDetail,
            key: 'CategoryId'
        })
        await setData(arr)
    }
    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={styles.itemContainer}>
                {item.isParent &&
                    <Text style={styles.titleHead}>{item.CategoryName}</Text>
                }
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ ...styles.itemText, color: item.OOS == 1 ? appcolor.red : appcolor.dark }}>{`${index + 1}. ${item.ProductName}`}</Text>
                    {item.OOS == 1 && <Text style={{ flex: 2, color: appcolor.red, fontSize: 12, fontWeight: '600' }}>{`Hết hàng`}</Text>}
                </View>
            </View>
        )
    }
    useEffect(() => {
        LoadData()
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        titleHead: { width: '100%', fontSize: 15, fontWeight: 'bold', color: appcolor.dark, padding: 5 },
        itemText: { flex: 8, color: appcolor.dark, fontSize: 14, fontWeight: '500', padding: 5 }
    })
    return (
        <View style={styles.mainContainer}>
            <SafeAreaView style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.primary, padding: 5, alignItems: 'center' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}>
                    <Icon name={'times'} size={scaleSize(23)} solid={true} color={appcolor.white} />
                </TouchableOpacity>
                <Text style={{ width: '80%', textAlign: 'center', fontSize: scaleSize(18), fontWeight: '700', padding: 5, color: appcolor.white }}>{title}</Text>
            </SafeAreaView>
            <FlatList
                showsVerticalScrollIndicator={false}
                style={{ height: '100%', padding: 5, marginBottom: Platform.OS == 'ios' ? 16 : 0 }}
                keyExtractor={(_, index) => index.toString()}
                data={data}
                renderItem={renderItem}
            />
        </View>
    )
}