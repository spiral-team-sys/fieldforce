import React, { useEffect, useState } from "react";
import { TouchableOpacity, UIManager, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { Text } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { YearMonthSelected } from "../../Control/YearMonthSelected";
import { Platform } from "react-native";
import { _competitorId } from "../../Core/URLs";
import RNFS from 'react-native-fs'
import GmailStyleSwipeableRow from "../../Core/GmailStyleSwipeableRow";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ItemHomeResRow = ({ item, index, handleDelete }) => {
    const { appcolor } = useSelector(state => state.GAppState);

    // useEffect(() => {
    //     const _Load = loadData()
    //     return () => _Load
    // }, [])
    return (
        <GmailStyleSwipeableRow key={`kj${index}12`} enableRight={false}
            deleteItem={() => handleDelete(item)}
        >
            <View style={{ padding: 4, flexDirection: "row", alignItems: 'center', backgroundColor: appcolor.surface, borderRadius: 8, marginTop: 4 }}>
                <View style={{ padding: 4, width: '80%' }}>
                    <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>Hãng : {<Text>{item.competitorName}</Text>} </Text>
                    {(item.categoryName !== undefined && item.categoryName !== null) && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>Ngành hàng : {<Text>{item.categoryName}</Text>} </Text>}
                    {(item.year !== undefined && item.month !== undefined && item.year !== null && item.month !== null)
                        && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>Tháng : {<Text>{`${item.month}-${item.year}`}</Text>} </Text>}
                    {(item.note !== undefined && item.note !== null && item.note !== '') && <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>Ghi chú : {<Text>{item.note}</Text>} </Text>}
                </View>
                <View style={{ padding: 4, width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 50, backgroundColor: appcolor.info, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', fontSize: 16, color: appcolor.white }}> {<Text>{item.quantity}</Text>} </Text>

                    </View>
                </View>
            </View>
        </GmailStyleSwipeableRow >
    )
}




