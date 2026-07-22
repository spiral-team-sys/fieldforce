import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Text } from "@rneui/base";
import _ from 'lodash';

export const GroupType = ({ dataMain, keyValue, keyName, handlerChange, handlerCloseTag, isMultiple = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataGroup, setDataGroup] = useState([])
    const [isCloseTag, setCloseTag] = useState(false)
    const refList = useRef()

    const LoadData = async () => {
        if (dataMain !== null && dataMain.length > 0) {
            const _dataGroup = _.uniqBy(dataMain, keyValue)
            const _isCloseTag = _.filter(_dataGroup, (e) => e.isChooseTag == 1)
            await setCloseTag(_isCloseTag !== null && _isCloseTag.length > 0)
            await setDataGroup(_dataGroup)
        }
    }
    // Handler
    const onItemPress = (item, index) => {
        if (dataMain !== null && dataMain.length > 0) {
            refList.current.scrollToIndex({ index: index, animated: true })
            const _item = {
                keyValue: item[keyValue],
                keyName: item[keyName],
                dataDetail: item.DataDetail
            }
            handlerChange(_item, keyValue, isMultiple)
        }
    }
    const onCloseTag = () => {
        if (dataMain !== null && dataMain.length > 0) {
            refList.current.scrollToIndex({ index: 0, animated: true })
            handlerCloseTag()
        }
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [dataMain])

    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        itemMain: { minWidth: 80, minHeight: 30, margin: 8, marginTop: 8, borderWidth: 1, borderColor: appcolor.primary, borderRadius: 20, backgroundColor: appcolor.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
        titleView: { paddingHorizontal: 8, fontSize: 13, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.light, textAlign: 'center' },
        viewGroupTag: { flexDirection: 'row', alignItems: 'center' },
        viewCloseTag: { backgroundColor: appcolor.primary, minWidth: 30, minHeight: 30, borderRadius: 50, justifyContent: 'center', marginHorizontal: 8 }
    })
    const renderItem = ({ item, index }) => {
        const pressItem = () => {
            onItemPress(item, index)
        }
        const colorText = item.isChooseTag == 1 ? appcolor.light : appcolor.dark
        const borderColorView = item.isChooseTag == 1 ? appcolor.primary : appcolor.light
        const styleDefault = {
            ...styles.itemMain,
            marginEnd: (index + 1) == dataGroup.length ? 8 : 0,
            backgroundColor: borderColorView
        }
        return (
            <TouchableOpacity key={`igi_${index}`} style={styleDefault} onPress={pressItem}>
                <Text style={{ ...styles.titleView, color: colorText }}>{item[keyName] || ''}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.viewGroupTag}>
                {isMultiple && isCloseTag &&
                    <TouchableOpacity style={styles.viewCloseTag} onPress={onCloseTag}>
                        <Icon name="close" type="ionicon" size={18} color={appcolor.light} />
                    </TouchableOpacity>
                }
                <FlatList
                    ref={refList}
                    horizontal
                    keyExtractor={(_item, index) => index.toString()}
                    data={dataGroup}
                    renderItem={renderItem}
                    removeClippedSubviews
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    )
}