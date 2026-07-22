import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import { GetMenu } from '../../Controller/UserController';
import { Icon, Divider } from '@rneui/themed';
import { GetEmployeeInfo, Token } from '../../Core/Helper';
import { useDispatch, useSelector } from 'react-redux';
import WebViewUI from '../../Content/WebViewUI';
import DeviceInfo from 'react-native-device-info'
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import base64 from 'react-native-base64';
//import { ACTION } from '../../Core/ReduxController';

const MenuHomeAqua = ({ navigation, menus }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataMenu, setDataMenu] = useState(menus)
    const [selected, setSelected] = useState(false)
    const [url, setUrl] = useState(null)
    const [title, setTitle] = useState('')
    const dispatch = useDispatch();
    const LoadDataMenu = async () => {
        const lstMenu = await GetMenu(0);
        await setDataMenu(lstMenu)
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        itemMenu: { width: '100%', padding: 7, flexDirection: 'row', alignItems: 'center' },
        titleMenu: { width: '100%', marginStart: 8, fontSize: 15, color: appcolor.dark }
    })
    const handlerItemClick = async (item) => {
        const einfo = await GetEmployeeInfo();
        let token = await Token();
        const deviceId = await DeviceInfo.getUniqueId()
        if (item.pageName.includes("trainee")) {
            await setSelected(item);
            const shareKey = {
                "AccountId": einfo.accountId,
                "CoachingID": 0,
                "DeviceID": deviceId,
                "EmployeeId": einfo.employeeId,
                "LoginID": TRAINEEKEY,
                "LoginIDForRP": '',
                "ShopId": 0
            }
            const appShare = await base64.encode(JSON.stringify(shareKey));
            const urlPage = item.reportItem + appShare
            navigation.navigate("trainee", { pageName: item.menuNameVN, urlPage: urlPage })
        }
        else if (item.reportItem !== null && item.reportItem.includes("http") && item.pageName.includes("webview")) {
            await setSelected(item);
            const shareInfo = {
                employeeId: einfo.employeeId,
                employeeName: einfo.employeeName,
                accountId: einfo.accountId,
                typeId: einfo.typeId,
                loginName: einfo.loginName,
                mobile: einfo.mobile,
                menuId: item.id,
                deviceId: deviceId,
                AppId: AppNameBuild,
                token: token
            }
            const shareAccess = await base64.encode(JSON.stringify(shareInfo));
            const urlGo = item.reportItem.includes("appShare") ? `${item.renderItem}${shareAccess}` : item.renderItem;
            await setUrl(urlGo)
            await setSelected(true);
            await setTitle(item.menuNameVN);
        } else {
            await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item })
            if (item.pageName !== 'gallary')
                navigation.navigate(item.pageName, { menuitem: item });
            else
                navigation.navigate(item.pageName);
        }
    }
    useEffect(() => {
        LoadDataMenu()
        return () => false;
    }, [menus])
    const renderItem = ({ item, index }) => {
        const onItemPress = () => {
            handlerItemClick(item)
        }
        return (
            <TouchableOpacity key={index + "aw"} style={{ alignItems: 'center', backgroundColor: appcolor.light }} onPress={onItemPress}>
                <View style={styles.itemMenu}>
                    <Icon raised type={item.iconType || 'font-awesome'} name={item.iconName} size={21} color={appcolor.primary} solid />
                    <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '95%', height: 0.5 }} />
            </TouchableOpacity>
        )
    }
    useEffect(() => { LoadDataMenu() }, [])
    return (
        <View style={styles.mainContainer}>
            <FlatList
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                style={{ width: '100%', height: '100%' }}
                keyExtractor={(_, index) => index.toString()}
                data={dataMenu}
                renderItem={renderItem}
            />
            <Modal visible={selected}>
                <WebViewUI urlPage={url}
                    onClose={() => setSelected(false)} pageName={title} />
            </Modal>
        </View>
    )
}
export default MenuHomeAqua;