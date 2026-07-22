import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceHeight } from "../../Themes/AppsStyle";
import { PressItem } from "./ActionType/PressItem";

export const TypeFAB = {
    scrollToTop: 'SCROLL_TO_TOP',
    pressItem: 'PRESS_ITEM'
}
export const FloatActionButton = ({ typeAction, titleAction, isCloseAction, iconActionName, onAction, onClose, containerStyle = {} }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    const LoadData = () => {

    }
    // Handler
    const handlerPressItem = () => {
        onAction()
    }
    const handlerPressClose = () => {
        onClose()
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])

    // View
    const styles = StyleSheet.create({
        viewCircleMainFloat: {
            minWidth: titleAction ? 42 : 48, minHeight: titleAction ? 42 : 48, borderRadius: 100, backgroundColor: appcolor.primary, alignItems: 'center', justifyContent: 'center',
            position: 'absolute', bottom: 48, end: 16, overflow: 'hidden',
            shadowColor: appcolor.greylight, shadowRadius: 20, shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.5, elevation: 5, backgroundColor: appcolor.primary,
            ...containerStyle
        }
    })

    const renderActionType = () => {
        switch (typeAction) {
            case TypeFAB.scrollToTop:
                return null;
            case TypeFAB.pressItem:
                return <PressItem
                    key={`PRESS_ITEM`}
                    isClose={isCloseAction}
                    title={titleAction}
                    iconName={iconActionName}
                    onPress={handlerPressItem}
                    handlerClose={handlerPressClose}
                />
            default:
                return null
        }
    }

    return (
        <View style={styles.viewCircleMainFloat}>
            {renderActionType()}
        </View>
    )
}