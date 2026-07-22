

import React, { useEffect, useState } from 'react'
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { GetListDocument } from '../../Controller/DocumentController'
import Icon from '@react-native-vector-icons/fontawesome6';
import { deviceWidth } from '../../Themes/AppsStyle'
import { HeaderCustom } from '../../Content/HeaderCustom'
import { useSelector } from 'react-redux'
import { REPORT } from '../../API/ReportAPI'

export const DocumentGroupByShop = ({ navigation }) => {
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [group, setGroup] = useState([]);
    const loadGroup = async () => {
        const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
        await REPORT.GetDataReportByShop_RealTime(params, async (mData) => {
            await setGroup(mData);
        })
    }
    const onSelected = (item) => {
        navigation.navigate("documentlist", { titlePage: item.groupName, documentData: JSON.parse(item.detailDocument) })
    }
    const styles = StyleSheet.create({
        itemGroup: { backgroundColor: appcolor.homebackground, borderRadius: 8, borderColor: appcolor.dark, margin: 8, padding: 8, width: deviceWidth / 3 - 20, height: deviceWidth / 4, alignItems: 'center', justifyContent: 'space-around' }
    })
    useEffect(() => {
        loadGroup();
    }, [])
    const renderItem = ({ item, index }) => {
        const onSelectItem = () => {
            onSelected(item)
        }
        return (
            <TouchableOpacity onPress={onSelectItem} style={styles.itemGroup} key={index} >
                <Icon color={appcolor.primary} size={42} name='folder-open' solid />
                <Text style={{ padding: 3, marginTop: 5, color: appcolor.dark, textAlign: 'center' }}>{item.groupName}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title="Quản lí tài liệu"
                leftFunc={() => navigation.goBack()} />
            <View style={{ flex: 1, alignSelf: group.length > 2 ? 'center' : 'auto' }}>
                <FlatList
                    style={{}}
                    keyExtractor={(_, index) => index.toString}
                    data={group}
                    numColumns="3"
                    renderItem={renderItem} />
            </View>
        </View>
    )
}