import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { GroupData } from "./Control/GroupData";
import { Icon, Text } from "@rneui/base";
import { deviceHeight, deviceWidth, fontWeightBold } from "../../../Themes/AppsStyle";
import { TableGroupData } from "./Control/TableGroupData";
import { _competitorName } from "../../../Core/URLs";

export const DashboardDisplayShareByType = ({ info, navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataTable, setDataTable] = useState([])
    const [dataDetails, setDataDetails] = useState([])

    const LoadData = async () => {
        const _data = JSON.parse(info.chartData || '[]')
        const _dataDetails = JSON.parse(info.detailData || '[]')
        await setDataTable(_data)
        await setDataDetails(_dataDetails)
    }

    const handlerDetails = () => {
        navigation.navigate('displaydetails', { typeDisplay: "DISPLAYSHARE", data: dataDetails || [] })
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [info])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', minHeight: deviceHeight / 4, backgroundColor: appcolor.light, marginBottom: 12, borderRadius: 8, elevation: 3, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.5, shadowRadius: 8 },
        contentMain: { width: deviceWidth, height: '100%', paddingTop: 40, zIndex: 1 },
        viewTitleChart: { flexDirection: 'row', alignItems: 'center', padding: 8 },
        titleChart: { width: '90%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: fontWeightBold, fontSize: 15 }
    })

    return (
        <TouchableOpacity style={styles.mainContainer} onPress={handlerDetails}>
            <View style={styles.viewTitleChart}>
                <Icon color={appcolor.primary} type="font-awesome-5" name="chart-pie" size={23} />
                <Text style={styles.titleChart}> {info !== null ? info.chartName : ''}</Text>
            </View>
            <TableGroupData
                data={dataTable}
                titleActual={_competitorName}
                titleTarget='Đối thủ'
                titlePercent='Thị phần (%)'
            />
        </TouchableOpacity>
    )
}