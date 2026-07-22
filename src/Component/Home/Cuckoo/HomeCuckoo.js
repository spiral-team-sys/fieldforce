import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import HeaderView from "./Page/HeaderView";
import FunctionView from "./Page/FunctionView";
import { QuickViewCuckoo } from "./Page/QuickViewCuckoo";
import { deviceHeight } from "../../../Themes/AppsStyle";

const HomeCuckoo = ({ navigation, isReloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    // Handler
    const LoadData = async () => {

    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [isReloadData])

    const styles = StyleSheet.create({
        contentDashboard: { width: '100%', height: deviceHeight / 4, backgroundColor: appcolor.light, overflow: 'hidden' },
        mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    })
    return (
        <SafeAreaView style={styles.mainContainer} edges={['top']}>
            <HeaderView navigation={navigation} />
            <View style={styles.contentDashboard}>
                <QuickViewCuckoo navigation={navigation} isReloadData={isReloadData} />
            </View>
            <View style={styles.mainContainer}>
                <FunctionView
                    navigation={navigation}
                    isReloadData={isReloadData} />

            </View>
        </SafeAreaView>
    );
}

export default HomeCuckoo;