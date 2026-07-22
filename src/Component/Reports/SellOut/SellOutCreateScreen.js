import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { REPORT } from "../../../API/ReportAPI";
import { toastError } from "../../../Utils/configToast";
import useReport from "../../../Hooks/useReport";
import { isValidData } from "../../../Utils/validateData";
import CreateSellOut from "./Page/CreateSellOut";

const SellOutCreateScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const { sellout } = useReport()
    const [dataConfig, setDataConfig] = useState({})

    const LoadData = async () => {
        const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
        await REPORT.GetDataConfigReport(params, (mData, message) => {
            message && toastError('Thông báo', message)
            if (isValidData(mData)) {
                const itemConfig = mData[0] || {}
                setDataConfig(itemConfig)
            }
        })
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentMain: { flex: 1, padding: 8 }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={'Nhập số bán'}
                leftFunc={onBack}
            />
            <View style={styles.contentMain}>
                <CreateSellOut config={dataConfig} onSaved={onBack} />
            </View>
        </View>
    )
}

export default SellOutCreateScreen;