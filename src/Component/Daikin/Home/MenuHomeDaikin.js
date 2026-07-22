import React, { useEffect, useState } from "react"
import { FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import base64 from "react-native-base64"
import deviceInfoModule from "react-native-device-info"
import { Divider, Icon } from '@rneui/themed'
import { useDispatch, useSelector } from "react-redux"
import WebViewUI from "../../../Content/WebViewUI"
import { GetEmployeeInfo, Token } from "../../../Core/Helper"
//import { ACTION } from "../../../Core/ReduxController"
import { AppNameBuild } from "../../../Core/URLs"
import { deviceWidth } from "../../../Core/Utility"

export const MenuHomeDaikin = ({ navigation, menus, isLoading, ViewHeader, onDowload }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataMenu, setDataMenu] = useState([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState(null)
    const [selected, setSelected] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setDataMenu(menus)
        return () => false
    }, [menus])

    const onItemPress = async (item) => {
        let token = await Token();
        await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item })
        if (item.reportItem !== null && item.reportItem.includes("https")) {
            await setSelected(item);
            const einfo = await GetEmployeeInfo();
            const shareInfo = {
                employeeId: einfo.employeeId,
                employeeName: einfo.employeeName,
                accountId: einfo.accountId,
                typeId: einfo.typeId,
                loginName: einfo.loginName,
                mobile: einfo.mobile,
                menuId: item.id,
                deviceId: await deviceInfoModule.getUniqueId(),
                AppId: AppNameBuild,
                "token": token
            }
            const app_access = await base64.encode(JSON.stringify(shareInfo));
            setUrl(item.reportItem + app_access)
            setSelected(true);
            setTitle(item.menuNameVN);
        } else {
            if (item.pageName !== 'gallary')
                navigation.navigate(item.pageName, { menuitem: item });
            else
                navigation.navigate(item.pageName);
        }
    }
    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => onItemPress(item)}>
                <View key={`MN_${index}`} style={styles.itemMenuMain}>
                    <View style={{ borderRadius: 50, marginEnd: 8, width: 45, height: 45, justifyContent: 'center', backgroundColor: appcolor.homebackground, padding: 12 }}>
                        <Icon name={item.iconName} type={item.iconType || "font-awesome-5"} size={18} color={appcolor.dark} style={{ textAlign: 'center' }} />
                    </View>
                    <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
                    <Icon name="angle-right" type="font-awesome-5" size={15} color={appcolor.dark} style={{ padding: 8 }} />
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '70%', alignSelf: 'center' }} />
            </TouchableOpacity>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1.2, backgroundColor: appcolor.light },

        itemMenuMain: { width: '100%', padding: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
        titleMenu: { width: '78%', color: appcolor.dark, fontSize: 15, fontWeight: '500' }
    })
    return (
        <View style={styles.mainContainer}>

            <FlatList
                style={{ flex: 1, padding: 8 }}
                key={'menuhome'}
                refreshControl={<RefreshControl
                    refreshing={isLoading}
                    onRefresh={onDowload} />}
                ListHeaderComponent={ViewHeader != undefined ? ViewHeader : null}
                keyExtractor={(_, index) => index.toString()}
                data={dataMenu}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={{ height: deviceWidth / 10 }} />}
            />
            <Modal visible={selected}>
                <WebViewUI urlPage={url} onClose={() => setSelected(false)} pageName={title} />
            </Modal>
        </View>
    )
}