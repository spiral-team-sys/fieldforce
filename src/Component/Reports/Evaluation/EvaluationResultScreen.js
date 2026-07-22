import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { REPORT } from "../../../API/ReportAPI";
import { SearchData } from "../../../Control/SearchData/SearchData";
import { LoadingView } from "../../../Control/ItemLoading";
import CustomTab from "../../../Control/Custom/CustomTab";
import { toastError } from "../../../Utils/configToast";
import { groupDataByKey } from "../../../Core/Helper";
import CustomListView from "../../../Control/Custom/CustomListView";
import { Icon, Text } from "@rneui/base";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import moment from "moment";
import _ from 'lodash';

const EvaluationResultScreen = ({ navigation }) => {
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [dataGroup, setDataGroup] = useState([])

    const LoadData = async () => {
        await setLoading(true)
        const params = {
            shopId: shopinfo.shopId || 0,
            reportId: kpiinfo.id
        }
        await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
            message && toastError('Thông báo', message)
            const grouplist = _.unionBy(mData, 'provinceName')
            const { arr } = groupDataByKey({
                arr: mData,
                key: 'shopId'
            })
            setData(arr)
            setDataMain(arr)
            setDataGroup(grouplist)
        })
        await setLoading(false)
    }

    const onShowSummary = (item) => {
        navigation.navigate('evaluationdashboard', { item: item })
    }

    const onSearchData = (text) => {
        if (!text || text.trim() === '') {
            setData(dataMain)
            return
        }
        const keyword = text.trim().toLowerCase()
        const filtered = _.filter(dataMain, (e) =>
            e.employeeName?.toLowerCase().includes(keyword) ||
            e.employeeCode?.toLowerCase().includes(keyword)
        )
        setData(filtered)
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.5)' },
        tabContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { padding: 8, margin: 8, marginBottom: 0, borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8 },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 11, color: appcolor.greylight, fontWeight: '500' },
        viewTitle: { flexDirection: 'row', alignItems: 'center' },
        viewInfo: { flex: 1 },
        viewScore: { alignItems: 'center', justifyContent: 'center', padding: 6, paddingHorizontal: 8, borderRadius: 4, backgroundColor: appcolor.primary },
        titleScore: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.light },
        viewShopInfo: { padding: 8, margin: 8, marginBottom: 0, backgroundColor: appcolor.primary + '20', borderRadius: 8 },
        titleShop: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.primary },
        subTitleShop: { fontSize: 11, color: appcolor.blacklight, fontWeight: '500' },
        titleTime: { fontSize: 10, color: appcolor.greylight, fontWeight: '400', fontStyle: 'italic', paddingTop: 8, textAlign: 'right' },
    })

    const renderTab = (item) => {
        const dataDetails = _.filter(data, (e) => e.provinceName === item.provinceName)
        return (
            <View style={styles.tabContainer}>
                <CustomListView
                    data={dataDetails}
                    extraData={dataDetails}
                    renderItem={renderItem}
                    onRefresh={LoadData}
                />
            </View>
        )
    }

    const renderItem = ({ item }) => {
        const onPress = () => onShowSummary(item)
        return (
            <View>
                {item.isParent &&
                    <View style={styles.viewShopInfo}>
                        <Text style={styles.titleShop}>{item.shopName}</Text>
                        <Text style={styles.subTitleShop}>{`Code: ${item.shopCode}`}</Text>
                        <Text style={styles.subTitleShop}>{`Khu vực: ${item.area}`}</Text>
                        <Text style={styles.subTitleShop}>{`CoVisit: ${item.coVisit}`}</Text>
                    </View>
                }
                <TouchableOpacity style={styles.itemContainer} onPress={onPress} activeOpacity={0.6}>
                    <View style={styles.viewTitle}>
                        <Icon name='person-circle' type='ionicon' size={32} color={appcolor.primary} style={{ marginEnd: 8 }} />
                        <View style={styles.viewInfo}>
                            <Text style={styles.titleName}>{`${item.employeeName}`}</Text>
                            <Text style={styles.subTitleName}>{`Code: ${item.employeeCode}`}</Text>
                            <Text style={styles.subTitleName}>{`Loại: ${item.typeName}`}</Text>
                            <Text style={styles.subTitleName}>{`Kinh nghiệm: ${item.workingDate}`}</Text>
                        </View>
                        <View style={styles.viewScore}>
                            <Text style={styles.titleScore}>{`${item.avgPoint}`}</Text>
                        </View>
                    </View>
                    <Text style={styles.titleTime}>{`Người đánh giá: ${item.evaluatorName} - ${moment(item.evaluationDate).fromNow()}`}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Kết quả đánh giá'}
                leftFunc={onBack}
            />
            <SearchData
                placeholder='Tìm kiếm nhân viên'
                onSearchData={onSearchData}
            />
            <LoadingView isLoading={isLoading} styles={styles.loadingView} />
            <CustomTab
                data={dataGroup}
                dataMain={data}
                keyTabName="provinceName"
                renderItem={renderTab}
            />
        </View>
    )
}

export default EvaluationResultScreen;