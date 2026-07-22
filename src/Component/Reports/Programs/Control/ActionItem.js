import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";

export const ActionItem = ({ visible = true, isMain = false, typeAction = null, typeAction2 = null, title = null, title2 = null, iconType, iconSize, iconName, onPress }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const onPressMenu = () => {
        onPress(typeAction, title)
    }
    const onPressItem = () => {
        onPress(typeAction, title)
    }
    const onPressItem2 = () => {
        onPress(typeAction2, title2)
    }

    useEffect(() => {
        return () => false
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 4, },
        viewIconMain: { width: 48, height: 48, backgroundColor: appcolor.light, justifyContent: 'center', margin: 5, padding: 8, borderWidth: 0.5, borderColor: appcolor.surface, borderRadius: 48, elevation: 30, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2 },
        viewChip: { minWidth: 160, minHeight: 40, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, borderRadius: 999, flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        titleName: { fontSize: 13, color: isMain ? appcolor.red : appcolor.dark, fontWeight: fontWeightBold, textAlign: 'left' },
        viewContent: { flexDirection: 'column', width: deviceWidth / 2.5 },
        viewClose: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.surface, borderRadius: 30, marginLeft: 8 },
    })

    if (!visible) return null
    if (title) {
        return (
            <View style={styles.mainContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                    {typeAction !== 'MAIN' && <View style={styles.viewIconMain}>
                        <Icon type='ionicon' name={iconName || ''} size={24} color={appcolor.primary} />
                    </View>}
                    <View style={styles.viewContent}>
                        <TouchableOpacity style={styles.viewChip} onPress={onPressItem}>
                            <Text style={styles.titleName}>{title || ''}</Text>
                            {typeAction == 'MAIN' && <View style={styles.viewClose}>
                                <Icon type='ionicon' name={'close'} size={20} color={appcolor.red} />
                            </View>}
                        </TouchableOpacity>
                        {title2 &&
                            <TouchableOpacity style={styles.viewChip} onPress={onPressItem2}>
                                <Text style={styles.titleName}>{title2 || ''}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity style={styles.viewIconMain} onPress={onPressMenu}>
                <Icon
                    type={iconType || 'ionicon'}
                    name={iconName || ''}
                    size={iconSize || 24}
                    color={isMain && title ? appcolor.red : appcolor.primary} />
            </TouchableOpacity>
        </View>
    )
}
