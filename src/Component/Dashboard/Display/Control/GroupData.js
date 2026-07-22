import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import { formatNumber } from "../../../../Core/Helper";

export const GroupData = ({ data, type }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataGroup, setDataGroup] = useState([])

    const LoadData = async () => {
        await setDataGroup(data)
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [data])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        itemMain: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: appcolor.greylight },
        itemTitle: { width: '22%' },
        titleView: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', textAlign: 'center' }
    })

    const renderItem = ({ item, index }) => {
        const borderBottom = (index + 1) == dataGroup.length ? 0 : 0.5
        return (
            <View key={`tdds_${index}`} >
                <View style={{ ...styles.itemMain, borderBottomWidth: borderBottom }}>
                    <View style={{ ...styles.itemTitle, width: '34%', paddingStart: 8 }}>
                        <Text style={{ ...styles.titleView, textAlign: 'left', color: appcolor.greylight, fontSize: 13 }}>      {item.itemName}</Text>
                    </View>
                    <View style={styles.itemTitle}>
                        <Text style={{ ...styles.titleView, color: appcolor.success }}>{item.actual > 0 ? formatNumber(item.actual, ',') : 0}</Text>
                    </View>
                    <View style={styles.itemTitle}>
                        <Text style={{ ...styles.titleView, color: appcolor.red }} >{item.target > 0 ? formatNumber(item.target, ',') : 0}</Text>
                    </View>
                    <View style={styles.itemTitle}>
                        <Text style={{ ...styles.titleView, color: appcolor.info }}>{`${item.percentValue}%`}</Text>
                    </View>
                </View>
                <GroupData data={item.dataGroup} type={item.itemName} />
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <FlatList
                key={`grouplist_${type}`}
                keyExtractor={(item, _index) => item.itemId.toString()}
                estimatedItemSize={80}
                data={dataGroup}
                extraData={data}
                renderItem={renderItem}
            />
        </View>
    )
}