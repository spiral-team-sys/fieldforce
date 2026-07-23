import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { ActionItem } from "../../../../Control/ActionItem";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

export const FloatActionButton = ({ visible = true, info, showMenu, containerStyle }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    // 
    useEffect(() => {
        return () => false
    }, [info])
    // View
    const styles = StyleSheet.create({
        mainContainer: { alignItems: 'flex-end', position: 'absolute', bottom: 0, end: 16, zIndex: 1000 },
        viewActionMain: { width: 50, height: 50, justifyContent: 'center', margin: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, borderRadius: 50 },
        titleName: { width: '100%', fontSize: 13, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        contentMenu: { alignItems: 'flex-end' }
    })
    return (
        <View style={[styles.mainContainer, containerStyle]}>
            {visible &&
                <ActionItem
                    isMain
                    typeAction='MAIN'
                    title={info.title}
                    iconName={'filter'}
                    onPress={showMenu} />
            }
        </View>
    )
}