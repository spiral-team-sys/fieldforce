import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux"

export const HeaderBusiness = ({ onBack, onForward, typeArrow, isHighLight = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const styles = StyleSheet.create({
        headerView: { width: '100%', backgroundColor: appcolor.light },
        actionView: { zIndex: 5, padding: 8, position: 'absolute' },
        headerName: { width: '100%', padding: 8, fontSize: 18, fontWeight: '600', color: isHighLight ? appcolor.danger : appcolor.blacklight, textAlign: 'center' }
    })

    return (
        <View style={styles.headerView}>
            <TouchableOpacity style={{ ...styles.actionView, start: 8 }} onPress={onBack}>
                <Icon name={typeArrow.typeBack} size={24} color={appcolor.dark} />
            </TouchableOpacity>
            <Text style={styles.headerName}>{typeArrow.titleHeader}</Text>
            <TouchableOpacity style={{ ...styles.actionView, end: 8 }} onPress={onForward}>
                <Icon name={typeArrow.typeForward} size={24} color={appcolor.dark} />
            </TouchableOpacity>
        </View>
    )
}


