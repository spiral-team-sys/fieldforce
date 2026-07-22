import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LineChartView } from "../../Controls/LineChartView";

export const ScreenDashboard = ({ data }) => {
    const [dataDashboard, setDataDashboard] = useState([])

    const LoadData = async () => {
        await setDataDashboard([])
        await setDataDashboard(data || [])
    }

    useEffect(() => {
        LoadData()
    }, [data])

    const styles = StyleSheet.create({
        mainContainer: { width: '96%' }
    })

    return (
        <View style={styles.mainContainer}>
            {dataDashboard !== null && dataDashboard.length > 0 &&
                <LineChartView item={dataDashboard} />
            }
        </View>
    )
}