import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";

export const ItemStore = ({ item, index, onLayout, onPress }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    const onShowStore = () => {
        onPress(item)
    }
    //
    const styles = StyleSheet.create({
        itemContainer: { padding: 8, margin: 8, marginBottom: 0, borderRadius: 8, backgroundColor: appcolor.light, elevation: 3, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.3 },
        titleHead: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        titleContent: { fontSize: 13, fontWeight: '500', color: appcolor.greylight },
        viewStatus: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: item.colorHighlight || appcolor.light, borderRadius: 50, position: 'absolute', top: 0, end: 0 },
        viewTitle: { width: '100%', marginBottom: 8 },
        titleDetails: { textAlign: 'right', fontSize: 11, color: appcolor.greylight, textDecorationLine: 'underline' }
    })
    //
    return (
        <TouchableOpacity key={`it-pd-${index}`} onLayout={onLayout} style={styles.itemContainer} onPress={onShowStore}>
            <View style={styles.viewTitle}>
                <Text style={styles.titleHead}>{`Cửa hàng: ${item.shopName}`}</Text>
                <Text style={styles.titleContent}>{`Mã CH: ${item.shopCode}`}</Text>
                <Text style={styles.titleContent}>{`ĐC: ${item.address}`}</Text>
            </View>
            <Text style={styles.titleDetails}>{`Thống kê cửa hàng -->`}</Text>
        </TouchableOpacity>
    )
}