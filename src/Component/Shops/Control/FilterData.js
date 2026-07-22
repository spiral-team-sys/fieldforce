import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DashboardAPI } from "../../../API/DashboardAPI";
import { ToastError } from "../../../Core/Helper";
import { ItemFilter } from "../../Dashboard/OOS/SumaryList/Items/ItemFilter";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import _ from 'lodash';

export const FilterData = ({ reportId }) => {
    const { appcolor, searchData } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(true)
    const [dataDealer, _setDataDealer] = useState({ main: [], view: [] })
    const [dataArea, _setDataArea] = useState({ main: [], view: [] })
    const [dataProvince, _setDataProvince] = useState({ main: [], view: [] })
    const [dataDistrict, _setDataDistrict] = useState({ main: [], view: [] })
    const [_mutate, setMutate] = useState([])
    //
    const LoadData = async () => {
        try {
            const _dataLocal = JSON.parse(await AsyncStorage.getItem('FILTER_OOS') || '[]')
            if (_dataLocal !== null && _dataLocal.length > 0) {
                configData(_dataLocal)
            } else {
                await DashboardAPI.GetListFilter(reportId, async (mData, message) => {
                    message && ToastError(message)
                    await AsyncStorage.setItem('FILTER_OOS', JSON.stringify(mData))
                    configData(mData)
                })
            }
        } catch (e) {
            ToastError(`Lỗi dữ liệu: ${e}`)
        } finally {
            setLoading(false)
        }
    }
    const configData = (mData) => {
        const dataMap = _.filter(mData, (e) => (
            (searchData.dealerName == null || e.dealerName == searchData.dealerName) &&
            (searchData.areaName == null || e.areaName == searchData.areaName) &&
            (searchData.provinceName == null || e.provinceName == searchData.provinceName) &&
            (searchData.districtName == null || e.districtName == searchData.districtName)
        ))
        //
        const _dealerlist = _.unionBy(dataMap, 'dealerName')
        const _arealist = _.unionBy(dataMap, 'areaName')
        const _provincelist = _.unionBy(dataMap, 'provinceName')
        const _districtlist = _.unionBy(dataMap, 'districtName')
        //
        dataDealer.main = _dealerlist
        dataDealer.view = _dealerlist
        dataArea.main = _arealist
        dataArea.view = _arealist
        dataProvince.main = _provincelist
        dataProvince.view = _provincelist
        dataDistrict.main = _districtlist
        dataDistrict.view = _districtlist
        //
        setMutate(e => !e)
    }
    const handlerConfigData = async () => {
        const _dataLocal = JSON.parse(await AsyncStorage.getItem('FILTER_OOS') || '[]')
        if (_dataLocal !== null && _dataLocal.length > 0) {
            configData(_dataLocal)
        }
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [])
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        handlerConfigData()
        return () => { isMounted = false }
    }, [searchData])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', marginTop: 8 },
        titleHead: { width: '70%', textAlign: 'center', color: appcolor.dark, fontSize: 14, fontWeight: fontWeightBold },
        contentMain: { width: '100%', height: '100%' },
        buttonRemove: { backgroundColor: appcolor.primary, alignSelf: 'center', padding: 7, borderRadius: 6 },
        textRemove: { color: appcolor.light },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, bottom: 0, start: 0, end: 0 },
        viewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: appcolor.grey },
        actionButton: { padding: 8, alignSelf: 'center', borderRadius: 20, backgroundColor: appcolor.primary },
        titleButton: { fontSize: 12, fontWeight: '500', color: appcolor.light, paddingHorizontal: 8 }
    })
    if (isLoading) return <ActivityIndicator size='small' color={appcolor.primary} style={styles.loadingView} />
    return (
        <View style={styles.mainContainer}>
            {/* // Content Filter */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.contentMain}>
                    <ItemFilter
                        key={`filter-dealer`}
                        data={dataDealer}
                        title='Nhà phân phối'
                        keyValue='dealerName' />
                    <ItemFilter
                        key={`filter-area`}
                        data={dataArea}
                        title='Miền'
                        keyValue='areaName' />
                    <ItemFilter
                        key={`filter-province`}
                        data={dataProvince}
                        title='Tỉnh/Thành phố'
                        keyValue='provinceName' />
                    <ItemFilter
                        key={`filter-district`}
                        data={dataDistrict}
                        title='Quận/Huyện'
                        keyValue='districtName' />
                </View>
            </ScrollView>
        </View>
    )
}