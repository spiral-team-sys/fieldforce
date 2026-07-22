import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { LoadingView } from "../../../Control/ItemLoading";
import { REPORT } from "../../../API/ReportAPI";
import { toastError } from "../../../Utils/configToast";
import CustomListView from "../../../Control/Custom/CustomListView";
import { Text } from "@rneui/base";
import DashboardArea from "./Page/Summary/DashboardArea"
import DashboardCategory from "./Page/Summary/DashboardCategory";
import DashboardAVG from "./Page/Summary/DashboardAVG";

const EvaluationDashboardScreen = ({ navigation, route }) => {
    const { item } = route.params
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState([])

    const LoadData = async () => {
        await setLoading(true)
        const params = {
            shopId: shopinfo.shopId || 0,
            reportId: kpiinfo.id,
            typeReport: 'SUMMARY_DETAIL',
            jsonData: JSON.stringify(item)
        }
        await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
            message && toastError('Thông báo', message)
            setData(mData)
        })
        await setLoading(false)
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: 'rgba(255,255,255,0.5)' }
    })

    const renderItem = ({ item }) => {
        switch (item.typeName) {
            case 'AREA':
                return <DashboardArea title={item.chartName} data={item.dataSummary} />
            case 'CATEGORY':
                return <DashboardCategory title={item.chartName} data={item.dataSummary} />
            case 'AVG':
                return <DashboardAVG title={item.chartName} data={item.dataSummary} />
            default:
                return <Text style={{ color: appcolor.text, fontSize: 16, fontWeight: '500', padding: 12 }}>{item.typeName}</Text>
        }
    }

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={"Kết quả đánh giá"}
                leftFunc={onBack}
            />
            <LoadingView isLoading={isLoading} styles={styles.loadingView} />
            <CustomListView
                data={data}
                extraData={data}
                renderItem={renderItem}
                bottomView={{ paddingBottom: 16 }}
            />
        </View>
    )
}

export default EvaluationDashboardScreen;