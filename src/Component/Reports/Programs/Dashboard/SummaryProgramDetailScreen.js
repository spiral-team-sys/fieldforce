import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import SummaryProgramDetailPage from "./Page/SummaryProgramDetailPage";

const SummaryProgramDetailScreen = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const rawData = Array.isArray(route?.params?.rawData) ? route.params.rawData : []
    const typeData = route?.params?.typeData || null

    const titleByType = {
        SALE: 'Chi tiết Sale',
        DISPLAY: 'Chi tiết Display',
        DELIVERY: 'Chi tiết Delivery',
        PROGRAM: 'Chi tiết chương trình',
    }

    const screenTitle = titleByType[typeData] || 'Chi tiết chương trình'

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: appcolor.light,
        },
        body: {
            paddingBottom: 20,
        },
    })

    return (
        <View style={styles.container}>
            <HeaderCustom
                title={screenTitle}
                leftFunc={() => navigation.goBack()}
            />
            <SummaryProgramDetailPage
                appcolor={appcolor}
                data={rawData}
                typeData={typeData}
            />
        </View>
    )
}

export default SummaryProgramDetailScreen;
