import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { FlashList } from "@shopify/flash-list";
import { SheetManager } from 'react-native-actions-sheet'
import { deviceHeight, fontWeightBold } from "../../../../Themes/AppsStyle";
import { ActionItem } from "../../../../Control/ActionItem";
import { ItemWarehouse } from "../Items/ItemWarehouse";
import { removeVietnameseTones } from "../../../../Core/Helper";
import { getDataByReport, saveJsonData } from "../../../../Controller/ReportController";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import _ from 'lodash';
import CustomListView from "../../../../Control/Custom/CustomListView";

export const ScreenListResult = ({ isReload }) => {
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [_mutate, setMutate] = useState(false)
    const listRef = useRef()

    const LoadData = async () => {
        const result = await getDataByReport(shopinfo.shopId, kpiinfo.id)
        if (result.data !== null && result.data !== null) {
            const _wareTypeList = _.filter(result.data, (e) => e.WareType !== undefined && e.WareType !== null)
            setDataMain(result.data)
            setData(_wareTypeList)
        } else {
            setDataMain([])
            setData([])
        }
    }
    // Handler
    const onPlusItem = () => {
        SheetManager.show('plus-warehouse')
    }
    const handlerChangeType = async (itemUpdate) => {
        const dataUpdate = _.map(dataMain, (e) => {
            if (e.WareHouseId === itemUpdate.WareHouseId) {
                return itemUpdate
            } else return e
        })
        await saveJsonData(shopinfo.shopId, kpiinfo.id, shopinfo.auditDate, dataUpdate)
        await LoadData()
    }
    const onSearchData = (text) => {
        search.text = text
        setMutate(e => !e)
        // 
        const listUpdate = _searchData(dataMain)
        setData(listUpdate)
    }
    const _searchData = (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        const searchData = _.filter(filterList, (e) => (
            removeVietnameseTones(e.WareHouseName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.WareHouseCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.Address).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.DealerCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.DealerName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.ProvinceName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.DistrictName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.TownName).toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    //
    useEffect(() => {
        let isMounted = true
        if (isMounted) LoadData()
        else return
        return () => {
            isMounted = false
        }
    }, [isReload])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        contentMain: { flex: 1, zIndex: 1, padding: 8 },
        actionPlusView: { alignItems: 'flex-end', position: 'absolute', bottom: 120, end: 16, zIndex: 1000 },
        searchContainer: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary, fontWeight: '500' },
        bottomView: { paddingBottom: deviceHeight / 8 },
        contentPlus: { width: '100%', height: deviceHeight },
        titleWare: { fontSize: 15, fontWeight: fontWeightBold, width: '100%', textAlign: 'center', padding: 8 },
        contentWareList: { width: '100%', height: deviceHeight }
    })
    const renderItem = ({ item, index }) => {
        return <ItemWarehouse
            key={`slw-${index}`}
            item={item}
            index={index}
            onChange={handlerChangeType} />
    }
    return (
        <View style={styles.mainContainer}>
            <SearchData
                placeholder='Tìm kiếm kho'
                onSearchData={onSearchData}
            />
            <View style={styles.contentMain}>
                <CustomListView

                    ref={listRef}
                    data={data}
                    extraData={data}
                    renderItem={renderItem}
                    onRefresh={LoadData}
                />
            </View>
            <View style={styles.actionPlusView}>
                <ActionItem
                    isMain
                    typeAction='MAIN'
                    iconSize={18}
                    iconName='plus'
                    iconType='font-awesome-5'
                    onPress={onPlusItem} />
            </View>
        </View>
    )
}