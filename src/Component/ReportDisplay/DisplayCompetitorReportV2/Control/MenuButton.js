import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceHeight } from "../../../../Core/Utility";
import { ActionItem } from "./ActionItem";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const MenuButton = ({ visible = true, info, Status, tabInfo, showMenu, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const _fadeInDown = FadeInDown.duration(500).withInitialValues({ transform: [{ translateY: 420 }] })
    const _fadeOutDown = FadeOutDown.duration(100).withInitialValues({ transform: [{ translateY: 420 }] })
    const [_mutate, setMutate] = useState(false)
    const handleSelectMenu = () => {
        info.isOpen = (info.isOpen ? false : true)
        setMutate(e => !e)
        // showMenu()
    }
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
                {
                    Status !== 1 &&
                    <ActionItem
                        typeAction='ADD'
                        title='Thêm sản phẩm'
                        type={'font-awesome-5'}
                        iconName={info.type == 'ADD' ? 'close' : 'plus'}
                        onPress={handlerChange} />
                }
                <ActionItem
                    typeAction='LIST_ADD'
                    title='Sản phẩm đã thêm'
                    type={'font-awesome-5'}
                    iconName={info.type == 'LIST_ADD' ? 'times' : 'book-medical'}
                    onPress={handlerChange} />
                <ActionItem
                    typeAction='LIST_DONE'
                    title='Sản phẩm đã nhập'
                    type={'font-awesome-5'}
                    iconName={info.type == 'LIST_DONE' ? 'times' : 'book-medical'}
                    onPress={handlerChange} />
                {/* <ActionItem
                    typeAction='DELETE'
                    title={`Xóa dữ liệu ngành hàng ${tabInfo.tabName} - ${groupInfo.groupName}`}
                    iconName='trash-bin-outline'
                    onPress={handlerChange} /> */}
                {
                    Status !== 1 &&
                    <ActionItem
                        typeAction='RESET_DATA'
                        title='Xóa tất cả dữ liệu'
                        iconName='sync-outline'
                        onPress={handlerChange} />
                }
                <ActionItem
                    typeAction='CAMERA'
                    title='Chụp hình sản phẩm'
                    iconName='camera-outline'
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
                        onPress={() => handleSelectMenu()} />
                }
            </View>
        </View>
    )
}