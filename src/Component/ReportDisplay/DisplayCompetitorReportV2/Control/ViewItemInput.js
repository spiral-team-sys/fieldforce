import React, { forwardRef, useEffect, useState } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { deviceWidth } from "../../../Home";
import { toCurrency } from "../../../../Core/Utility";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const ViewItemInput = forwardRef((props, ref) => {
    const { itemInput, indexInput, dataItem, itemIndex } = props
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState()
    useEffect(() => {
        const _load = setMutate(e => !e)
        return () => _load
    }, [dataItem])

    const styles = StyleSheet.create({
        inputHeader: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        inputStyle: { fontSize: 13, fontWeight: fontWeightBold, color: (dataItem[itemInput.displayType] == 0 || (dataItem[itemInput.displayType] || -1) >= 0) ? appcolor.dark : appcolor.placeholderText },
        itemMain: { width: (deviceWidth - ((12 * 2) + 50)) / 2, flexDirection: 'row', padding: 2, paddingLeft: 8 },
        titleHead: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
    })

    return (
        <View key={`${dataItem.displayCompetitorId}_${indexInput}_${itemInput.id}`} style={styles.itemMain}>
            <Text style={styles.inputHeader}>{`${itemInput.name} : `}</Text>
            <View style={{ borderRadius: 20, borderWidth: 0.5, borderColor: appcolor.warning, paddingVertical: 2, paddingHorizontal: 4, justifyContent: "center", alignItems: "center", minWidth: 50 }}>
                <Text style={styles.inputStyle}>{(dataItem[itemInput.displayType] == 0 || (dataItem[itemInput.displayType] || -1)) > 0 ? `${dataItem[itemInput.displayType] == 0 ? 0 : toCurrency(dataItem[itemInput.displayType])}` : `${itemInput.placeholder || 'Số lượng'}`}</Text>
            </View>

        </View>
    )
})