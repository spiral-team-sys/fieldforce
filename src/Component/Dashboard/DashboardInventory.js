import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { groupDataByKey } from '../../Core/Helper';
import { toCurrency } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';

export const DashboardInventory = ({ info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [item, setItemData] = useState({})
    const [viewDetail, setViewDetail] = useState(false)
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.surface, padding: 8, borderRadius: 10, marginBottom: 8 }
    })
    const LoadData = async () => {
        await setItemData(JSON.parse(info.chartData)[0] || {})
    }
    useEffect(() => {
        LoadData()
    }, [])
    return (
        <TouchableOpacity onPress={() => setViewDetail(e => !e)}>
            <View style={styles.mainContainer} >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon color={appcolor.info} name="chart-line" size={23} />
                    <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
                </View>
                <View style={{ flex: 1, marginTop: 8 }} >
                    {item.ALable && <Text style={{ flex: 1, fontSize: 21, fontWeight: '700', color: appcolor.tomato, textAlign: 'center' }}>{item.ALable}</Text>}
                    {item.ALable2 && <Text style={{ flex: 1, fontSize: 21, fontWeight: '700', color: appcolor.dark, textAlign: 'center' }}>{item.ALable2}</Text>}
                </View>
                <View style={{ marginTop: 8, flexDirection: 'row', alignSelf: 'center' }} >
                    <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.dark, textAlign: 'center' }}>{item.QLable}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.dark, textAlign: 'center' }}>{item.AQuantity}</Text>
                </View>
            </View >
            <Modal visible={viewDetail}>
                <DetailData title={info.chartName} data={JSON.parse(info.detailData)} appcolor={appcolor} onClose={() => setViewDetail(false)} />
            </Modal>
        </TouchableOpacity>
    )
}

export const DetailData = ({ title, data, appcolor, onClose }) => {
    const [lstDetail, setDetail] = useState([])
    const LoadData = async () => {
        const { arr } = await groupDataByKey({
            arr: data,
            key: "CategoryName"
        })
        await setDetail(arr)
    }
    const renderItem = ({ item, index }) => {
        return (
            <View key={index}>
                {item.isParent &&
                    <View style={{ borderRadius: 5, backgroundColor: appcolor.secondary, padding: 5 }}>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: 'bold', fontStyle: 'italic', color: appcolor.black, textAlign: 'center' }}>{item.CategoryName}</Text>
                    </View>
                }
                <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, padding: 8, borderBottomColor: appcolor.grey }}>
                    <Text style={{ width: '90%', fontSize: 14, color: appcolor.dark, fontWeight: '500' }}>{item.ProductName}</Text>
                    <Text style={{ width: '10%', textAlign: 'center', color: appcolor.dark, fontSize: 15, fontWeight: '700' }}>{item.Stock}</Text>
                </View>
            </View >
        )
    }
    useEffect(() => {
        LoadData()
    }, [])
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <SafeAreaView style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.primary, padding: 5, alignItems: 'center' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}>
                    <Icon name={'times'} size={scaleSize(23)} solid={true} color={appcolor.white} />
                </TouchableOpacity>
                <Text style={{ width: '80%', textAlign: 'center', fontSize: scaleSize(18), fontWeight: '700', padding: 5, color: appcolor.white }}>{title}</Text>
            </SafeAreaView>
            <FlatList
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, margin: 8 }}
                keyExtractor={(_, index) => index.toString()}
                data={lstDetail}
                renderItem={renderItem}
            />
        </View>
    )
}