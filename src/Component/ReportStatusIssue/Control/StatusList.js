import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import _ from 'lodash';
import { Text } from '@rneui/themed';

export const StatusList = ({ defaultValue, dataMain, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataStatus, setDataStatus] = useState([])

    const LoadData = async () => {
        const _dataStatus = _.uniqBy(dataMain, 'IssueStatus')
        await setDataStatus(_dataStatus)
    }

    const onItemPress = (item) => {
        handlerChange(item, 'STATUS')
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [dataMain])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        itemMain: { minWidth: 80, padding: 8, margin: 8, marginEnd: 1, borderRadius: 20, borderWidth: 0.5, borderColor: appcolor.greylight },
        itemChoose: { minWidth: 80, padding: 8, margin: 8, marginEnd: 1, borderRadius: 20, borderWidth: 0.5 },
        titleView: { width: '100%', fontSize: 14, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.dark, textAlign: 'center' }
    })

    const renderItem = ({ item, index }) => {
        const pressItem = () => {
            onItemPress(item)
        }
        const isChoose = item.IssueStatus == defaultValue
        const styleDefault = { ...styles.itemMain, marginEnd: (index + 1) == dataStatus.length ? 8 : 1 }
        const styleChoose = { ...styles.itemChoose, borderColor: item.ColorCode, backgroundColor: item.ColorCode, marginEnd: (index + 1) == dataStatus.length ? 8 : 1 }
        return (
            <TouchableOpacity key={`isi_${index}`} style={isChoose ? styleChoose : styleDefault} onPress={pressItem}>
                <Text style={{ ...styles.titleView, color: isChoose ? appcolor.light : appcolor.dark }}>{item.ItemName || 'NONE'}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <FlatList
                horizontal
                key='statusListIssue'
                keyExtractor={(_item, index) => index.toString()}
                data={dataStatus}
                renderItem={renderItem}
            />
        </View>
    )
}