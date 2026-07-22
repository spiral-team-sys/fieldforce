import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useDispatch, useSelector } from "react-redux";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";
import { SET_SearchData } from "../../../../../Redux/action";
export const ItemFilter = ({ data, title, keyValue }) => {
    const { appcolor, searchData } = useSelector(state => state.GAppState)
    const [dataFilter, setDataFilter] = useState({ main: [], view: [] })
    const dispatch = useDispatch()
    //

    const LoadData = () => {
        setDataFilter(data)
    }
    // Handler
    const handlerChoose = async (item) => {
        const _value = searchData[keyValue] == item[keyValue] ? null : item[keyValue]
        const search = { ...searchData, [`${keyValue}`]: _value }
        await dispatch(SET_SearchData(search))
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [data])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        titleHead: { fontSize: 13, fontStyle: 'italic', color: appcolor.greylight, fontWeight: fontWeightBold, paddingHorizontal: 8 },
        contentListMain: { width: '100%', flexDirection: 'row', flexGrow: 1, flexWrap: 'wrap', padding: 8 },
        itemMain: { margin: 4, backgroundColor: appcolor.surface, padding: 8, borderRadius: 5 },
        titleName: { fontSize: 12, fontWeight: '500', color: appcolor.dark }
    })
    const renderItem = (item, index) => {
        const onPress = () => {
            handlerChoose(item)
        }
        const isChoose = item[keyValue] == (searchData[keyValue] || null)
        const backgroundColor = isChoose ? appcolor.primary : appcolor.surface
        const color = isChoose ? appcolor.light : appcolor.dark
        return (
            <TouchableOpacity key={`item-fd-${index}`} style={{ ...styles.itemMain, backgroundColor }} onPress={onPress}>
                <Text style={{ ...styles.titleName, color }}>{item[keyValue] || 'Tất cả'}</Text>
            </TouchableOpacity>
        )
    }
    if (data.main == null || data.main.length == 0) return null
    return (
        <View style={styles.mainContainer}>
            {title && <Text style={styles.titleHead}>{title}</Text>}
            <View style={styles.contentListMain}>
                {dataFilter.view.map((item, index) => { return renderItem(item, index) })}
            </View>
        </View>
    )
}