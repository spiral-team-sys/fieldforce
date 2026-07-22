import React, { useEffect, useState } from "react";
import { StyleSheet, View, processColor } from "react-native";
import { useSelector } from "react-redux";
import { PieChart } from "react-native-charts-wrapper";

export const PieChartView = ({ itemMain }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [dataDashboard, setDataDashboard] = useState({})
    const [percentValue, setPercentValue] = useState('0')

    const LoadData = async () => {
        await setLoading(true)
        const data = {
            dataSets: [{
                values: [{ value: itemMain.ActualValue || 0 }, { value: (itemMain.TargetValue || 1) - (itemMain.ActualValue || 0) }],
                config: {
                    colors: [processColor(appcolor.success), processColor(appcolor.red)],
                    sliceSpace: 1,
                    valueTextColor: processColor('transparent')
                },
                label: ''
            }],
        }
        await setDataDashboard(data)
        await setPercentValue(`${itemMain.PercentValue}%`)
        await setLoading(false)
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [itemMain])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', alignItems: 'center' }
    })
    return (
        <View style={styles.mainContainer}>
            <View style={{ width: 135, height: 135 }}>
                {!isLoading &&
                    <PieChart
                        style={{ flex: 1 }}
                        chartBackgroundColor={processColor('transparent')}
                        chartDescription={{ text: '' }}
                        data={dataDashboard}
                        legend={{ enabled: false }}
                        extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}
                        entryLabelColor={processColor('transparent')}
                        entryLabelTextSize={20}
                        entryLabelFontFamily={'HelveticaNeue-Medium'}
                        styledCenterText={{ text: percentValue, color: processColor(appcolor.dark), size: 13 }}
                        centerTextRadiusPercent={100}
                        holeRadius={50}
                        maxAngle={360}
                        onChange={(event) => console.log(event.nativeEvent)}
                    />
                }
            </View>
        </View>
    )
}