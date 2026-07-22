import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { DataSummary } from "../../../Controller/DashboardController";
import { Icon, Text } from "@rneui/base";
import { IconAnimation } from "../../../Control/IconAnimation/IconAnimation";
import { ProgressPercent } from "../../../Control/ProgressPercent";
import { fontWeightBold } from "../../../Themes/AppsStyle";

export const DashboardAttendant = ({ navigation, typeDashboard, viewHeight }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataDashboard, setDataDashboard] = useState([])
    const [itemMain, setItemMain] = useState({})
    const [isLoading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [animation, setAnimation] = useState(new Animated.Value(0))

    const LoadData = async () => {
        await setLoading(true)
        await DataSummary(typeDashboard, async (mData) => {
            await setDataDashboard(mData)
            await setItemMain(mData[0] || {})
        })
        await setLoading(false)
    }
    // Handler 
    const showDetails = () => {
        navigation.navigate('attendanthistory')
    }
    // View
    useEffect(() => {
        let _dashboard = false
        if (dataDashboard.length == 0) {
            _dashboard = LoadData()
        }
        return () => _dashboard
    }, [])

    useEffect(() => {
        Animated.timing(animation, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false
        }).start()
    }, [progress])

    const styles = StyleSheet.create({
        mainContainer: { flexDirection: 'column', justifyContent: 'space-between' },
        titleDashboard: { width: '80%', fontSize: 16, fontWeight: fontWeightBold, color: appcolor.blacklight },
        headerContent: { flexDirection: 'row', marginTop: 8, alignItems: 'center', },
        actionSync: { borderRadius: 30, borderWidth: 0.3, borderColor: appcolor.dark, padding: 5, position: 'absolute', end: 0, backgroundColor: appcolor.surface },
        actionDetails: { borderRadius: 5, borderWidth: 0.3, borderColor: appcolor.dark, padding: 8, position: 'absolute', end: 0 },
        contentItem: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        viewPercent: { overflow: 'hidden', alignItems: 'center', minHeight: 30, position: 'absolute' },
        descriptionView: { flexDirection: 'row-reverse', justifyContent: 'center' },
        progressItem: { marginBottom: 16 },
        progressHeader: { flexDirection: 'row', marginBottom: 8, justifyContent: 'space-between' },
        progressTitle: { fontSize: 14, color: appcolor.dark, fontWeight: fontWeightBold, textAlign: 'left' },
        progressValue: { width: '80%', fontSize: 12, color: appcolor.dark, fontWeight: fontWeightBold, textAlign: 'right' }
    })
    const renderItem = (item, index) => {
        const progress = parseFloat(item.percent) || 0;
        return (
            <View key={index} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>{item.titleName}</Text>
                    <Text style={styles.progressValue}>{item.actual} / {item.target}</Text>
                </View>
                <ProgressPercent
                    progress={progress}
                    color={appcolor.success}
                />
            </View>
        );
    }
    return (
        <TouchableOpacity onPress={showDetails} style={{ flex: 1, padding: 8, maxHeight: viewHeight - 40, height: viewHeight }}>
            <View style={styles.mainContainer}>
                <View style={styles.headerContent}>
                    <Icon name="chart-bar" type="font-awesome-5" size={18} color={appcolor.primary} style={{ padding: 5 }} />
                    <Text style={styles.titleDashboard}>{itemMain.dashboardName}</Text>
                    <TouchableOpacity onPress={isLoading ? null : LoadData} style={styles.actionSync}>
                        <IconAnimation isLoop={isLoading} sourceIcon={require('../../../Themes/lotties/sync_load.json')} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                    {dataDashboard.map(renderItem)}
                </View>
                {!isLoading && <View style={styles.descriptionView}>
                    <Text style={{ fontSize: 10, fontWeight: '400', color: appcolor.dark, marginStart: 8, marginEnd: 3 }}>{itemMain.descriptionTarget}</Text>
                    <Icon name="square" type="font-awesome-5" solid size={15} color={appcolor.success} style={{ opacity: 0.4 }} />
                    <Text style={{ fontSize: 10, fontWeight: '400', color: appcolor.dark, marginStart: 8, marginEnd: 8, opacity: 0.9 }}>{itemMain.descriptionActual}</Text>
                    <Icon name="square" type="font-awesome-5" solid size={15} color={appcolor.success} />
                </View>}

            </View>
        </TouchableOpacity>
    )
}