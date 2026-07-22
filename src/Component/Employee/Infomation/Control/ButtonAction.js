import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from '@rneui/themed';
import { useSelector } from "react-redux";

export const ButtonAction = ({ typeAction, iconName, iconSize, iconColor, sizeView, backgroundColor, onPress }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const handlerPress = () => {
        onPress(typeAction)
    }

    useEffect(() => {
        return () => false
    }, [])

    const styles = StyleSheet.create({
        mainContainer: {
            width: sizeView || 42, height: sizeView || 42,
            justifyContent: 'center', borderRadius: 50, margin: 8, backgroundColor: backgroundColor || appcolor.light, padding: 8,
            shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 }, elevation: 3, shadowOpacity: 0.5
        }
    })

    return (
        <TouchableOpacity style={styles.mainContainer} onPress={handlerPress} >
            <Icon type='ionicon' name={iconName || ''} size={iconSize || 24} color={iconColor || appcolor.dark} />
        </TouchableOpacity>
    )
}