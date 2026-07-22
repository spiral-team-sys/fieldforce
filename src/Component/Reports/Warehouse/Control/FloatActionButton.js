import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceHeight } from "../../../Core/Utility";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { ActionItem } from "../../../Control/ActionItem";
import { fontWeightBold } from "../../../Themes/AppsStyle";

export const FloatActionButton = ({ visible = true, info, groupInfo, tabInfo, showMenu, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const _fadeInDown = FadeInDown.duration(500).withInitialValues({ transform: [{ translateY: 420 }] })
    const _fadeOutDown = FadeOutDown.duration(100).withInitialValues({ transform: [{ translateY: 420 }] })
    // 
    useEffect(() => {
        return () => false
    }, [info])
    // View
    const styles = StyleSheet.create({
        mainContainer: { alignItems: 'flex-end', position: 'absolute', bottom: deviceHeight / 7, end: 8, zIndex: 1000 },
        viewActionMain: { width: 50, height: 50, justifyContent: 'center', margin: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, shadowColor: appcolor.dark, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, borderRadius: 50 },
        titleName: { width: '100%', fontSize: 13, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        contentAction: {},
        contentMenu: { alignItems: 'flex-end' }
    })
    const renderItemMenu = () => {
        return (
            <Animated.View entering={_fadeInDown} exiting={_fadeOutDown} style={styles.contentMenu}>
                <ActionItem
                    typeAction='SORT'
                    title='Kho đã cập nhật loại'
                    iconName='checkmark-outline'
                    onPress={handlerChange} />
                <ActionItem
                    typeAction='RESET_DATA'
                    title='Xóa tất cả dữ liệu'
                    iconName='sync-outline'
                    onPress={handlerChange} />
            </Animated.View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            {visible && info.isOpen && renderItemMenu()}
            <View style={styles.contentAction}>
                {visible &&
                    <ActionItem
                        isMain
                        typeAction='MAIN'
                        title={info.title}
                        iconName={info.isOpen ? 'chevron-down-outline' : info.type !== null && info.type.length > 0 ? 'close' : 'settings'}
                        onPress={showMenu} />
                }
            </View>
        </View>
    )
}