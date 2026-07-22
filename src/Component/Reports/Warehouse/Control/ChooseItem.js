import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import _ from 'lodash';

export const ChooseItem = ({ item, dataItem, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    //
    const LoadData = () => {
        setData(dataItem || [])
    }
    // Handler
    const handlerChoose = (itemChild) => {
        item.WareType = item.WareType == itemChild.ItemName ? null : itemChild.ItemName
        handlerChange(item)
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted) return
        LoadData()
        //
        return () => {
            isMounted = false
        }
    }, [dataItem])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        contentMain: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end' },
        itemMain: { flexDirection: 'row', alignItems: 'center', borderRadius: 4, marginEnd: 8, marginTop: 4 },
        titleName: { fontSize: 12, padding: 8, paddingVertical: 5, fontStyle: 'italic', color: appcolor.greylight, fontWeight: fontWeightBold },
        dotView: { width: 3, height: 3, borderRadius: 5, backgroundColor: appcolor.greylight, marginStart: 8 },
        actionView: { borderRadius: 3, paddingHorizontal: 3 }
    })
    const renderItem = (it, index) => {
        const onPress = () => {
            handlerChoose(it)
        }
        const isValue = (item.WareType || null) !== null && it.ItemName == item.WareType
        const colorChoose = isValue ? appcolor.light : appcolor.greylight
        const backgroundColorChoose = isValue ? appcolor.primary : appcolor.surface
        return (
            <View key={`ci-${index}`} style={styles.itemMain}>
                <TouchableOpacity onPress={onPress} style={{ ...styles.actionView, backgroundColor: backgroundColorChoose }}>
                    <Text style={{ ...styles.titleName, color: colorChoose }}>{it.ItemName}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentMain}>
                {data !== null && data.length > 0 && data.map((it, index) => { return renderItem(it, index) })}
            </View>
        </View>
    )
}