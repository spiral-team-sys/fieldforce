import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, Platform, Modal, StyleSheet, SafeAreaView } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { Divider, Badge } from "@rneui/base";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { groupDataByKey } from "../../Core/Helper";
import { toCurrency } from "../../Core/Utility";
import { scaleSize } from "../../Themes/AppsStyle";

export const DashboardSellOutByMonth = ({ info }) => {
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
                    Chỉ tiêu
                </Text>
                <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Đã đạt
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
        // sendNavigate.navigate('dashboardDetail', { detailDashboard: info, listMonth: info.listMonth, titlePage: 'Chi tiết' })
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
                    dataSellOut={JSON.parse(info.detailData)}
                    appcolor={appcolor}
                    title={info.chartName}
                    onClose={() => setViewDetail(false)} />
            </Modal>
        </TouchableOpacity >
    )
}

const DetailData = ({ title, dataSellOut, appcolor, onClose }) => {
    const [data, setData] = useState([])

    const LoadData = async () => {
        const { arr } = await groupDataByKey({
            arr: dataSellOut,
            key: 'CategoryId',
            keyLayer2: 'SellDate'
        })
        await setData(arr)
    }
    const renderItem = ({ item, index }) => {
        const keyLayer2 = `${item.CategoryId}${item.SellDate}`
        return (
            <View key={index} style={styles.itemContainer}>
                {item.isParent &&
                    <View style={{ margin: 3, borderRadius: 5, backgroundColor: appcolor.info }}>
                        <Text style={styles.titleHead}>{item.CategoryName}</Text>
                    </View>
                }
                {item[keyLayer2] && <Text style={styles.titleSecond}>{item.SellDate}</Text>}
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Badge
                        containerStyle={{ alignSelf: 'center' }}
                        status={appcolor.red}
                        textStyle={{ fontSize: 15, fontWeight: '500', color: appcolor.black, fontWeight: '700' }}
                        badgeStyle={{ backgroundColor: appcolor.yellowdark, borderColor: appcolor.yellowdark, height: 28, width: 28, borderRadius: 20 }}
                        value={item.Quantity} />
                    <View style={styles.itemStyle} key={index}>
                        <Text style={styles.itemText}>Sản phẩm: {item.ProductName}</Text>
                        <Text style={styles.itemText}>Khách hàng: {item.ContactName}</Text>
                        <Text style={styles.itemText}>Số điện thoại: {item.Phone}</Text>
                        {item.Price !== null && item.Price !== undefined && <Text style={styles.itemText}>{`Giá: ${toCurrency(item.Price)} VNĐ`} </Text>}
                    </View>
                </View>
            </View>
        )
    }
    useEffect(() => {
        LoadData()
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { paddingBottom: 8, alignItems: 'center' },
        itemStyle: { alignSelf: 'center', width: '90%', borderRadius: 8, margin: 3, padding: 5, backgroundColor: appcolor.surface },
        titleHead: { width: '100%', fontSize: 15, fontWeight: 'bold', color: appcolor.light, padding: 5 },
        itemText: { color: appcolor.dark, fontSize: 14, fontWeight: '500' },
        titleSecond: { width: '100%', color: appcolor.tomato, fontSize: 14, fontWeight: '700', marginBottom: 5, marginEnd: 32, textAlign: 'right' }
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
                style={{ height: '100%', padding: 5, marginBottom: Platform.OS == 'ios' ? 8 : 0 }}
                keyExtractor={(_, index) => index.toString()}
                data={data}
                renderItem={renderItem}
            />
        </View>
    )
}