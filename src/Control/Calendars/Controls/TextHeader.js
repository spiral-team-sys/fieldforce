import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../Themes/AppsStyle";

export const TextHeader = ({ title, sizeView, type, handlerPress, styleMain, colorDefault }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    const onPressItem = () => {
        handlerPress(type)
    }

    useEffect(() => {
        return () => false
    }, [])

    const styles = StyleSheet.create({
        mainContainerDefault: { width: '100%', height: sizeView || 38, justifyContent: 'center', alignItems: 'center' },
        mainButtonAction: { backgroundColor: 'transparent' },
        titleHeader: { fontSize: 15, fontWeight: fontWeightBold, color: colorDefault || appcolor.dark }
    })

    return (
        <TouchableOpacity style={styleMain || styles.mainButtonAction} onPress={onPressItem}>
            <View style={styles.mainContainerDefault}>
                <Text style={styles.titleHeader}>{title || ''}</Text>
            </View>
        </TouchableOpacity>
    )
}