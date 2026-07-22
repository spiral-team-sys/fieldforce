import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";

const HistoryPlanScreen = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const LoadData = async () => {

    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light }
    })

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={'Screen Title'}
                leftFunc={onBack}
            />
        </View>
    )
}

export default HistoryPlanScreen;