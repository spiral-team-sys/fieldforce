
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import _ from 'lodash';
import { ViewByGroup } from "../Control/ViewByGroup";

export const ViewListImage = ({ navigation, route, data, handleShowMenu }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    // const [data, setData] = useState({ dataConfig: {}, dataView: [], dataMain: [] })
    const [_mutate, setMutate] = useState(false)

    useEffect(() => {
        let isMounted = true;
        return () => {
            isMounted = false;
        };
    }, [])

    const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
        search.text = null
        const listChooseGroup = await _.map(data.dataMain, (it, _idx) => {
            if (item.keyValue == it[keyValue]) {
                return { ...it, isChooseTag: 1 }
            }
            else
                return isMultiple ? it : { ...it, isChooseTag: 0 }
        })
        data.dataView = listChooseGroup
        await setMutate(e => !e)
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <GroupListData
                dataMain={data.dataView}
                keyValue={'GroupName'}
                keyName={'GroupName'}
                handlerChange={handlerSearchByGroup}
            />
            <ViewByGroup dataMain={data.dataView} handleShowMenu={handleShowMenu} />
        </View>
    )
}

const GroupListData = ({ dataMain, keyValue, keyName, handlerChange }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const refGroup = useRef()
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', minHeight: 56 },
        itemMain: { minWidth: 80, margin: 8, marginTop: 5, borderWidth: 1, borderColor: appcolor.primary, borderRadius: 20, backgroundColor: appcolor.primary, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
        titleView: { paddingHorizontal: 8, paddingEnd: 16, fontSize: 13, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.light, textAlign: 'center' },
        viewSumValue: { borderWidth: 1.5, backgroundColor: appcolor.light, borderColor: appcolor.primary, borderRadius: 20, minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
        titleSumValue: { fontSize: 12, fontWeight: 'bold', color: appcolor.dark },
        viewGroupTag: { flexDirection: 'row', alignItems: 'center' },
        viewCloseTag: { backgroundColor: appcolor.primary, minWidth: 30, minHeight: 30, borderRadius: 50, justifyContent: 'center', marginHorizontal: 8 }
    })
    const onItemPress = async (item, index) => {
        await scrollOnPress(item, index)
        const _item = {
            keyValue: item[keyValue],
            keyName: item[keyName]
        }
        await handlerChange(_item, keyValue)
    }
    const scrollOnPress = async (item, index) => {
        refGroup.current.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5
        })
    }
    const renderItem = ({ item, index }) => {
        const pressItem = () => {
            onItemPress(item, index)
        }
        const dataItem = JSON.parse(item.DataByGroup || '[]')
        const sumByTag = dataItem.length
        const colorValue = item.isChooseTag == 1 ? appcolor.dark : appcolor.light
        const colorText = item.isChooseTag == 1 ? appcolor.light : appcolor.dark
        const bgColorView = item.isChooseTag == 1 ? appcolor.light : appcolor.primary
        const borderColorView = item.isChooseTag == 1 ? appcolor.primary : appcolor.light
        const styleDefault = {
            ...styles.itemMain,
            backgroundColor: borderColorView
        }
        return (
            <TouchableOpacity key={`igi_${index}`} style={styleDefault} onPress={pressItem}>
                <View style={{ ...styles.viewSumValue, backgroundColor: bgColorView, borderColor: borderColorView }}>
                    <Text style={{ ...styles.titleSumValue, color: colorValue, paddingHorizontal: sumByTag > 10 ? 8 : 0 }}>{sumByTag}</Text>
                </View>
                <Text style={[styles.titleView, { color: colorText }]}>{item[keyName] || ''}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FlatList
                ref={refGroup}
                horizontal
                keyExtractor={(_item, index) => index.toString()}
                data={dataMain}
                renderItem={renderItem}
                removeClippedSubviews
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

