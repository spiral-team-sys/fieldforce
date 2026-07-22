import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "@rneui/base";
import { useSelector } from "react-redux";
import { ListItemView } from "./ListItemView";
import { ListItemProducts } from "./ListItemProducts";
import { removeVietnameseTones } from "../../../../../Core/Helper";
import FormGroup from "../../../../../Content/FormGroup";
import _ from 'lodash'

export const SubGroupItemView = ({ dataMain, indexMain }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [_mutate, setMutate] = useState(false)
    //
    const LoadData = async () => {
        await setData(dataMain)
    }
    // Handler
    const onShopGroup = async (item) => {
        DeviceEventEmitter.emit('SCROLL_TO_ITEM', indexMain)
        //
        const listUpdate = await _.map(data, (e) => {
            const _value = (e.g2 == item.g2 && item.isChoose == 0) ? 1 : 0
            return { ...e, isChoose: _value, waitRender: _value }
        })
        await setData(listUpdate)
    }
    const handlerRenderAction = async (value) => {
        const listUpdate = await _.map(data, (e) => { return { ...e, waitRender: value } })
        await setData(listUpdate)
    }
    const handleSearch = (text) => {
        search.text = text
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        const listSearch = _.filter(dataMain, (e) => removeVietnameseTones(e.n2).toLowerCase().match(valueSearch))
        setData(listSearch)
    }
    const onFocusSearch = () => {
        search.isSearch = !search.isSearch
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [dataMain])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', backgroundColor: appcolor.light },
        viewItemContentMain: { width: '100%' },
        itemMain: { width: '100%', padding: 8, borderRadius: 5, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 1 }, elevation: 3, backgroundColor: appcolor.light, marginBottom: 4, marginTop: 4 },
        titleGroupHead: { width: '90%', fontSize: 14, color: appcolor.dark, fontWeight: Platform.OS == 'ios' ? '600' : '700' },
        titleSubGroupHead: { width: '90%', fontSize: 12, color: appcolor.dark, fontWeight: '500' },
        titleContentValue: { fontSize: 13, color: appcolor.greylight, fontWeight: '500' },
        viewHead: { width: '100%', flexDirection: 'row', alignItems: 'center' },
        viewSummary: { width: '82%' },
        subView: { width: '100%', paddingHorizontal: 8, backgroundColor: appcolor.light, zIndex: 1000 },
        searchContainer: { width: '100%', marginTop: 8, padding: Platform.OS == 'android' ? 2 : 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { width: '100%', marginTop: 8, padding: Platform.OS == 'android' ? 2 : 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary }
    })
    const renderItem = ({ item, index }) => {
        const onPress = () => {
            onShopGroup(item)
        }
        return (
            <View key={`${index}_sig2`} style={styles.viewItemContentMain} >
                <TouchableOpacity style={styles.itemMain} onPress={onPress} disabled={item.waitRender == 1} >
                    <View style={styles.viewHead}>
                        <Icon type="ionicon" name={item.iconG2 || "reorder-three"} size={18} color={appcolor.blacklight} style={{ paddingEnd: 8 }} />
                        <View style={{ ...styles.viewSummary, width: item.waitRender == 1 ? '82%' : '86%' }}>
                            <Text style={styles.titleGroupHead}>{item.n2}</Text>
                            {item.subn2 && <Text style={styles.titleSubGroupHead}>{item.subn2}</Text>}
                            {item.TotalSaleValue && <Text style={styles.titleContentValue}>{item.TotalSaleValue}</Text>}
                        </View>
                        {item.waitRender == 1 ?
                            <ActivityIndicator size='small' color={appcolor.primary} style={{ padding: 8 }} />
                            :
                            <Icon type="ionicon" name={item.isChoose == 1 ? 'chevron-up' : 'chevron-down'} size={16} color={appcolor.blacklight} />
                        }
                    </View>
                </TouchableOpacity>
                {item.isChoose == 1 &&
                    <View style={styles.subView}>
                        {item.isProductList == 1 ?
                            <ListItemProducts
                                key={`listitem_${item.g2}_${index}`}
                                dataMain={item.DataSubGroup}
                                timeLoading={item.DataSubGroup.length * 60}
                                callBackRender={handlerRenderAction} />
                            :
                            <ListItemView
                                key={`listitem_${item.g2}_${index}`}
                                dataMain={item.DataSubGroup}
                                timeLoading={item.DataSubGroup.length * 60}
                                callBackRender={handlerRenderAction} />
                        }
                    </View>
                }
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            {dataMain !== null && dataMain.length > 9 &&
                <FormGroup
                    editable
                    placeholder='Tìm kiếm dữ liệu'
                    iconName='search'
                    defaultValue={search.text}
                    iconColor={search.isSearch ? appcolor.light : appcolor.primary}
                    useClearAndroid={search.text !== null && search.text.length > 0}
                    placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
                    containerStyle={search.isSearch ? styles.searchContainerInput : styles.searchContainer}
                    inputStyle={search.isSearch ? styles.searchInputStyle : styles.searchStyle}
                    handleChangeForm={handleSearch}
                    onClearTextAndroid={handleSearch}
                    onFocus={onFocusSearch}
                    onEndEditing={onFocusSearch}
                />
            }
            <View style={{ width: '100%', paddingHorizontal: 3 }}>
                {data.map((item, index) => renderItem({ item, index }))}
            </View>
        </View>
    )
}
