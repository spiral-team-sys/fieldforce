import React, { useEffect, useRef, useState } from "react";
import { Platform, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SheetManager } from 'react-native-actions-sheet'
import { OOSAPI } from "../../../../../API/OOSAPI";
import { ToastError, removeVietnameseTones } from "../../../../../Core/Helper";
import { FlashList } from "@shopify/flash-list";
import { deviceHeight } from "../../../../../Core/Utility";
import { LoadingView } from "../../../../../Control/ItemLoading";
import FormGroup from "../../../../../Content/FormGroup";
import { Icon, Text } from "@rneui/base";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";
import { ItemStore } from "../Items/ItemStore";
import _ from 'lodash';

export const ScreenListStore = ({ navigation, itemMain, itemGroup, callBack }) => {
    const { appcolor, searchData } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [_mutate, setMutate] = useState(false)
    const dispath = useDispatch()

    // Size Item
    const [estimatedSize, setEstimatedSize] = useState(0);
    const totalHeight = useRef(0)
    const itemCount = useRef(0)
    //
    const LoadData = async () => {
        await setLoading(true)
        const _itemFitler = { ...itemMain, ...itemGroup, ...searchData }
        await OOSAPI.GetListSummary('SHOP', _itemFitler, (mData, message) => {
            message && ToastError(message)
            setData(mData)
            setDataMain(mData)
            callBack(mData.length >= 5 ? deviceHeight : deviceHeight / 2)
        })
        await setLoading(false)
    }
    // Handler  
    const handleItemLayout = (event) => {
        const { height } = event.nativeEvent.layout
        totalHeight.current += parseInt(height)
        itemCount.current += 1
        setEstimatedSize(totalHeight.current / itemCount.current)
    }
    const onSearchData = (text) => {
        search.text = text
        setMutate(e => !e)
        // 
        const listUpdate = _searchData(dataMain)
        setData(listUpdate)
    }
    const onFocusSearch = () => {
        search.isSearch = !search.isSearch
        setMutate(e => !e)
    }
    const _searchData = (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        const searchData = _.filter(filterList, (e) => (
            removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.address).toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    const handlerShowProfile = async (item) => {
        SheetManager.hide('oos-store')
        await dispath({ type: "SELECT_SHOP", shopinfo: item });
        navigation.navigate("profileshops");
    }
    const onCloseView = () => {
        SheetManager.hide('oos-store')
    }
    //
    useEffect(() => {
        if (itemCount.current > 0) {
            setEstimatedSize(totalHeight.current / itemCount.current);
        }
    }, [itemCount.current]);
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [])

    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1 },
        bottomView: { paddingBottom: deviceHeight / 6 },
        titleHead: { width: '100%', textAlign: 'center', padding: 8, paddingBottom: 0, color: appcolor.dark, fontSize: 14, fontWeight: fontWeightBold },
        opacityView: { width: '100%', height: '100%', position: 'absolute', zIndex: 2, top: 0, backgroundColor: appcolor.light, opacity: 0.8 },
        loadingView: { width: '100%', height: '80%', justifyContent: 'center', position: 'absolute', zIndex: 3 },
        searchContainer: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary, fontWeight: '500' },
        viewHeadProduct: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8 },
        actionClose: { position: "absolute", top: 14, start: 16, zIndex: 1000 }
    })
    const renderItem = ({ item, index }) => {
        return <ItemStore item={item} index={index} onLayout={handleItemLayout} onPress={handlerShowProfile} />
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.viewHeadProduct}>
                <TouchableOpacity style={styles.actionClose} onPress={onCloseView}>
                    <Icon type="ionicon" name="arrow-back-outline" color={appcolor.dark} size={24} />
                </TouchableOpacity>
                <Text style={styles.titleHead}>{`Model: ${itemMain.productName}`}</Text>
            </View>
            {dataMain.length >= 5 &&
                <FormGroup
                    editable
                    placeholder='Tìm kiếm cửa hàng'
                    iconName='search'
                    defaultValue={search.text}
                    iconColor={search.isSearch ? appcolor.light : appcolor.primary}
                    useClearAndroid={search.text !== null && search.text.length > 0}
                    placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
                    containerStyle={search.isSearch ? styles.searchContainerInput : styles.searchContainer}
                    inputStyle={search.isSearch ? styles.searchInputStyle : styles.searchStyle}
                    handleChangeForm={onSearchData}
                    onClearTextAndroid={onSearchData}
                    onFocus={onFocusSearch}
                    onEndEditing={onFocusSearch}
                />
            }
            {isLoading && <View style={styles.opacityView} />}
            <LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' styles={styles.loadingView} />
            <FlashList
                keyExtractor={(_item, index) => index.toString()}
                data={data}
                extraData={[data]}
                renderItem={renderItem}
                estimatedItemSize={estimatedSize || 100}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={false} onRefresh={LoadData} />}
                ListFooterComponent={<View style={styles.bottomView} />}
            />
        </View>
    )
}