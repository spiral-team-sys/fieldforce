import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { fontWeightBold } from "../Themes/AppsStyle";
// import { Shadow } from "react-native-shadow-2";

export const ActionItem = ({ visible = true, isMain = false, typeAction, title, iconType, iconSize, iconName, onPress }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    const onPressMenu = () => {
        onPress(typeAction, title)
    }
    useEffect(() => {
        return () => false
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        viewActionMain: { width: 48, height: 48, justifyContent: 'center', margin: 5, padding: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, borderRadius: 48 },
        viewTitleName: { backgroundColor: appcolor.light, padding: 8, paddingHorizontal: 16, borderRadius: 48 },
        titleName: { fontSize: 13, color: isMain ? appcolor.red : appcolor.dark, fontWeight: fontWeightBold }
    })
    if (!visible) return null
    return (
        <TouchableOpacity style={styles.mainContainer} activeOpacity={0.75} onPress={onPressMenu}>
            {title &&
                <Shadow distance={3} startColor={appcolor.surface} radius={48} style={{ marginEnd: 4 }} >
                    <View style={styles.viewTitleName}>
                        <Text style={styles.titleName}>{title || ''}</Text>
                    </View>
                </Shadow>
            }
            <Shadow distance={3} startColor={appcolor.surface} offset={[5, 5]} radius={48}>
                <View style={styles.viewActionMain}>
                    <Icon
                        type={iconType || 'ionicon'}
                        name={iconName || ''}
                        size={iconSize || 24}
                        color={isMain && title ? appcolor.red : appcolor.primary} />
                </View>
            </Shadow>
        </TouchableOpacity>
    )
}
