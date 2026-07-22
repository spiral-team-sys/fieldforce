import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import { removeVietnameseTones } from "../../../../../Core/Helper";
import FormGroup from "../../../../../Content/FormGroup";
import _ from 'lodash'

export const ListItemProducts = ({ dataMain, callBackRender, timeLoading = 2000 }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [_mutate, setMutate] = useState(false)
    //
    const LoadData = async () => {
        await setData(dataMain)
        await setTimeout(async () => {
            await callBackRender(false)
        }, timeLoading);
    }
    const handleSearch = (text) => {
        search.text = text
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        const listSearch = _.filter(dataMain, (e) => removeVietnameseTones(e.ProductName).toLowerCase().match(valueSearch))
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
        itemMain: { width: '100%', padding: 8, backgroundColor: appcolor.placeholderBody, borderRadius: 8, marginVertical: 4, flexDirection: 'row', alignItems: 'center' },
        titleContent: { width: '100%', fontSize: 13, color: appcolor.blacklight, fontWeight: '500' },
        viewContent: { width: '100%' },
        searchContainer: { width: '100%', marginTop: 8, padding: Platform.OS == 'android' ? 2 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { width: '100%', marginTop: 8, padding: Platform.OS == 'android' ? 2 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary },
        badgeQuantity: { width: 28, height: 28, backgroundColor: appcolor.blacklight, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginEnd: 8 },
        titleBadge: { fontSize: 13, fontWeight: 'bold', color: appcolor.light }
    })
    const renderItem = ({ item, index }) => {
        const color = item.isProductOOS == 1 ? appcolor.redgray : appcolor.dark
        const oosStatus = item.isProductOOS == 1 ? ' - Hết hàng' : ''
        return (
            <View key={`${index}_iig3`} style={styles.itemMain}>
                <View style={{ ...styles.badgeQuantity, backgroundColor: color }}>
                    <Text style={styles.titleBadge}>{`${item.Quantity || ''}`}</Text>
                </View>
                <View style={styles.viewContent}>
                    <Text style={{ ...styles.titleContent, color }}>{`Sản phẩm: ${item.ProductName} ${oosStatus}`}</Text>
                    {item.Price !== undefined && <Text style={styles.titleContent}>{`Giá: ${item.Price} ${item.UnitPrice}`}</Text>}
                    {item.SellQuantity !== undefined && <Text style={styles.titleContent}>{`Số lượng bán: ${item.SellQuantity}`}</Text>}
                </View>
            </View>
        )
    }
    return (
        <View style={{ width: '100%' }}>
            {dataMain !== null && dataMain.length > 9 &&
                <FormGroup
                    editable
                    placeholder='Tìm kiếm sản phẩm'
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
