import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { ScreenMain } from "./Views/ScreenMain";

export const DashboardListOOS = ({ navigation, info }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    //
    const LoadData = () => {
        const _data = JSON.parse(info.chartData || '[]')
        setData(_data)
    }
    const handlerShowDetails = () => {
        const _dataDetails = JSON.parse(info.detailData || '[]')
        navigation.navigate('view_oosdetails', { dataDetails: _dataDetails })
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [info])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light, marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
        contentMain: { width: '100%', height: '100%', margin: 1 }
    })
    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentMain}>
                <ScreenMain
                    key={`screen-oos-main`}
                    title={info.chartName}
                    dashboardData={data}
                    onShowDetail={handlerShowDetails} />
            </View>
        </View>
    )
}