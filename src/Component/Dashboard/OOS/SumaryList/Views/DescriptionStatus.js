import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, DeviceEventEmitter } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@rneui/base";
import { deviceWidth, fontWeightBold } from "../../../../../Themes/AppsStyle";
import { ToastError } from "../../../../../Core/Helper";
import { OOSAPI } from "../../../../../API/OOSAPI";
import _ from 'lodash';

export const DescriptionStatus = ({ }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [_mutate, setMutate] = useState(false)

    const LoadData = async () => {
        try {
            await OOSAPI.GetListSummary('DESCRIPTION', {}, (mData, message) => {
                message && ToastError(message)
                setData(mData)
            })
        } catch (error) {
            console.error("Lỗi: ", error)
        } finally {
            setLoading(false)
        }
    }

    const handlerChooseTag = (item) => {
        const _value = !(item.isChoose || false)
        const _dataFilter = _.map(data, (e) => {
            if (e.itemId == item.itemId)
                return { ...e, isChoose: _value }
            else
                return { ...e, isChoose: false }
        })
        setData(_dataFilter)
        DeviceEventEmitter.emit('SORT_TAG_OOS', _value ? item.itemName : null)
    }

    useEffect(() => {
        LoadData()
        return () => false
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { minHeight: 50, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: appcolor.light },
        itemMain: { width: (deviceWidth / data.length) - 10, paddingVertical: 5, backgroundColor: appcolor.primary, borderRadius: 50, marginEnd: 8 },
        titleHead: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.light, textAlign: 'center' }
    })

    const renderItem = ({ item, index }) => {
        const onPress = () => {
            handlerChooseTag(item)
        }
        const backgroundColor = item.isChoose ? appcolor.light : item.colorStatus
        const color = item.isChoose ? item.colorStatus : appcolor.light
        return (
            <TouchableOpacity key={`wti-${index}`} style={{ ...styles.itemMain, backgroundColor }} onPress={onPress} >
                <Text style={{ ...styles.titleHead, color }}>{item.itemName}</Text>
            </TouchableOpacity>
        )
    }

    if (loading) {
        return (
            <View style={styles.mainContainer}>
                <ActivityIndicator size="small" color={appcolor.primary} />
            </View>
        )
    }

    return (
        data !== null && data.length > 0 &&
        <View style={styles.mainContainer}>
            <FlashList
                keyExtractor={(_item, index) => index.toString()}
                data={data}
                extraData={[data]}
                estimatedItemSize={100}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}
