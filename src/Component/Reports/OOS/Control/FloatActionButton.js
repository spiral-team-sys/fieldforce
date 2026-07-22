import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceHeight } from "../../../../Core/Utility";
import { ActionItem } from "../../../../Control/ActionItem";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const FloatActionButton = ({ visible = true, info, groupInfo, tabInfo, showMenu, handlerChange, containerStyle }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    useEffect(() => {
        return () => false
    }, [info])
    // View
    const styles = StyleSheet.create({
        mainContainer: { alignItems: 'flex-end', position: 'absolute', bottom: deviceHeight / 7, end: 8, zIndex: 1000, elevation: 20 },
        viewActionMain: { width: 50, height: 50, justifyContent: 'center', margin: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, shadowColor: appcolor.dark, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, borderRadius: 50 },
        titleName: { width: '100%', fontSize: 13, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        contentAction: {},
        contentMenu: { alignItems: 'flex-end' }
    })
    const renderItemMenu = () => {
        return (
            <View style={styles.contentMenu}>
                <ActionItem
                    typeAction='CHECKALL'
                    title='Chọn tất cả còn hàng'
                    iconName='checkmark-outline'
                    onPress={handlerChange} />
                <ActionItem
                    typeAction='SORT'
                    title='Sản phẩm hết hàng'
                    iconName={info.type === 'SORT' ? 'close' : 'funnel-outline'}
                    onPress={handlerChange} />
                <ActionItem
                    typeAction='DELETE'
                    title={`Xóa dữ liệu ngành hàng ${tabInfo.tabName} - ${groupInfo.groupName}`}
                    iconName='trash-bin-outline'
                    onPress={handlerChange} />
                <ActionItem
                    typeAction='RESET_DATA'
                    title='Xóa tất cả dữ liệu'
                    iconName='sync-outline'
                    onPress={handlerChange} />
            </View>
        )
    }
    return (
        <View style={[styles.mainContainer, containerStyle]}>
            {visible && info.isOpen && renderItemMenu()}
            <View style={styles.contentAction}>
                {visible &&
                    <ActionItem
                        isMain
                        typeAction='MAIN'
                        title={info.title}
                        iconName={info.isOpen ? 'chevron-down-outline' : 'settings'}
                        onPress={showMenu} />
                }
            </View>
        </View>
    )
}
