import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import HeaderView from "./Page/HeaderView";
import FunctionView from "./Page/FunctionView";
import LoadingDefault from "../../../Control/ItemLoading/LoadingDefault";

const HomeHonor = ({ navigation, isReloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)

    const LoadData = () => {
    }

    useEffect(() => {
        LoadData()
    }, [isReloadData])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.primary },
        contentFunction: { width: '100%', height: '90%' }
    })

    if (loading) return <LoadingDefault isLoading={loading} />

    return (
        <SafeAreaView style={styles.mainContainer}>
            <HeaderView navigation={navigation} />
            <View style={styles.contentFunction}>
                <FunctionView
                    navigation={navigation}
                    isReloadData={isReloadData} />
            </View>
        </SafeAreaView>
    )
}

export default HomeHonor;