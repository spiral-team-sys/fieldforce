import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../Themes/AppsStyle";


const ButtonConfirm = ({ mainContainerStyle, onAccept, onCannel }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        acceptButton: { width: '50%', backgroundColor: appcolor.primary, borderRadius: 5, borderWidth: 0.5, borderColor: appcolor.primary },
        acceptTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light, textAlign: 'center', padding: 8 },
        rejectButton: { width: '30%', backgroundColor: appcolor.light, marginEnd: 8, borderRadius: 5, borderWidth: 0.5, borderColor: appcolor.grey },
        rejectTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.greylight, textAlign: 'center', padding: 8 },
    })

    return (
        <View style={[styles.mainContainer, mainContainerStyle]}>
            <TouchableOpacity style={styles.rejectButton} onPress={onCannel}>
                <Text style={styles.rejectTitle}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                <Text style={styles.acceptTitle}>Đồng ý</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ButtonConfirm;