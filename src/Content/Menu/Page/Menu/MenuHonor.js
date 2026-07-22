import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { Icon } from "@rneui/themed"
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle"
import LinearGradient from "react-native-linear-gradient"
import { StyleSheet } from "react-native"
import { DEFAULT_LIGHT_COLOR } from "../../../../Core/URLs"

export const MenuHonor = ({ item, onPress, appcolor, index }) => {

    const styles = StyleSheet.create({
        itemContainer: { margin: 8, height: (deviceWidth / 4), alignItems: 'center', justifyContent: 'center' },
        gradientContainer: { flex: 1, borderRadius: 8, margin: 4 },
        iconContainer: { borderRadius: 50, borderWidth: 0.6, borderColor: appcolor.switchEnable, backgroundColor: appcolor.light, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
        titleContainer: { marginTop: 8 },
        titleName: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.light, textAlign: 'center' },
        subTitleName: { fontSize: 10, fontWeight: '500', color: appcolor.grayLight, textAlign: 'center' }
    })
    return (
        <LinearGradient colors={[appcolor.primary, DEFAULT_LIGHT_COLOR]} style={styles.gradientContainer}   >
            <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item)}>
                <View style={styles.iconContainer}>
                    <Icon name={item.iconName} type={item.iconType || "font-awesome-5"} size={18} color={appcolor.switchEnable} />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleName} numberOfLines={1}>{item.menuNameVN}</Text>
                    <Text style={styles.subTitleName}>{item.menuName}</Text>
                </View>
            </TouchableOpacity>
        </LinearGradient>
    )
}