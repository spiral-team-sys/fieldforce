import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GetMenu } from '../../Controller/UserController';
import { Avatar } from '@rneui/themed';
import { ColorRand, GetEmployeeInfo, Token } from '../../Core/Helper';
import base64 from 'react-native-base64'
import { useDispatch, useSelector } from 'react-redux';
import { scaleSize } from '../../Themes/AppsStyle';
import WebViewUI from '../../Content/WebViewUI';
import DeviceInfo from 'react-native-device-info'
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import { deviceWidth } from '../../Core/Utility';
//import { ACTION } from '../../Core/ReduxController';
export const MenuHPI = ({ navigation, menus }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataMenu, setDataMenu] = useState(menus)
    const [selected, setSelected] = useState(false)
    const [url, setUrl] = useState(null)
    const [title, setTitle] = useState('')
    const dispatch = useDispatch()
    const LoadDataMenu = async () => {
        const lstMenu = await GetMenu(0);
        await setDataMenu(lstMenu)
    }
    const styles = StyleSheet.create({
        itemMenu: { width: '100%', padding: 7, flexDirection: 'row', alignItems: 'center' },
        titleMenu: { width: '100%', marginStart: 8, fontSize: 15, color: appcolor.dark }
    })
    const handlerItemClick = async (item) => {
        let token = await Token();
        const einfo = await GetEmployeeInfo();
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
        else if (item.reportItem !== null && item.reportItem.includes("https")) {
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
                "token": token
            }
            const app_access = await base64.encode(JSON.stringify(shareInfo));
            // await console.log(app_access)
            await setUrl(item.reportItem + app_access)
            await setSelected(true);
            await setTitle(item.menuNameVN);
        } else {
            // console.log(item.pageName)
            dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item })
            navigation.navigate(item.pageName, { menuitem: item });
        }
    }
    useEffect(() => {
        const _load = LoadDataMenu()
        return () => _load
    }, [menus])
    return (
        <View style={{ padding: 12 }}>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                {
                    dataMenu?.map((item, index) => {
                        return (
                            <TouchableOpacity style={{ width: deviceWidth / 3, alignItems: 'center' }} key={"kkd2-" + index} onPress={() => handlerItemClick(item)}>
                                <Avatar
                                    size={54}
                                    rounded
                                    icon={{ name: item.iconName, type: item.iconType || 'font-awesome' }}
                                    containerStyle={{ backgroundColor: ColorRand(index) }}
                                />
                                <Text numberOfLines={2} style={{
                                    padding: 7, textAlign: 'center', width: deviceWidth / 3, fontSize: scaleSize(10),
                                    color: appcolor.dark,
                                }}>{item.menuNameVN}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
            <Modal visible={selected}>
                <WebViewUI urlPage={url} onClose={() => setSelected(false)} pageName={title} />
            </Modal>
        </View>
    )
}