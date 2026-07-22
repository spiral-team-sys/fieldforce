import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Avatar, Badge, Icon, Text } from "@rneui/base";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import useNotification from "../../../../Hooks/useNotification";
import { LGSummaryTop } from "../../../../Controller/DashboardController";

const HeaderView = ({ navigation }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState);
    const { countNotification } = useNotification()
    const [itemSummary, setItemSummary] = useState({})
    //
    const LoadData = async () => {
        await LGSummaryTop(async (result) => {
            setItemSummary(result[0] || {})
        })
    }
    // Handler
    const handlerNotifyPress = () => {
        navigation.navigate('Notification')
    }
    const handlerMenuPress = () => {
        navigation && navigation.openDrawer()
    }
    const handlerShowDashboard = () => {
        let pageName = ''
        switch (itemSummary?.dashboardName) {
            case 'Sellout':
                pageName = 'dashboardDetail'
                break;
            case 'SellIn':
                pageName = 'dashboardhomesellin'
                break;
        }
        navigation.navigate(pageName)
    }
    //
    useEffect(() => {
        let isMounted = true;
        if (!isMounted)
            return
        LoadData()
        return () => { isMounted = false }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', backgroundColor: appcolor.primary },
        contentMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingStart: 16, paddingEnd: 8 },
        contentTitle: { alignContent: 'space-around' },
        contentButton: { flexDirection: 'row', justifyContent: 'center' },
        titleWelcome: { color: appcolor.primary, fontWeight: fontWeightBold, fontSize: 16 },
        titleEmployeeCode: { fontSize: 12, fontWeight: '500', fontStyle: 'italic', color: appcolor.dark },
        buttonAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        badgeNotify: { width: 28, height: 24, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, end: 0, backgroundColor: appcolor.danger, borderRadius: 16 },
        titleBadge: { fontSize: 11, color: appcolor.light },
        contentSummary: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        itemSummary: { alignItems: 'center', paddingHorizontal: 8 },
        valueQuantity: { fontSize: 28, fontWeight: fontWeightBold, color: appcolor.danger },
        titleQuantity: { fontSize: 13, color: appcolor.dark },
        valueAmount: { fontSize: 28, fontWeight: fontWeightBold, color: appcolor.success },
        titleAmount: { fontSize: 13, color: appcolor.dark },
        titleDashboardName: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center', padding: 8, paddingBottom: 16 },
    })

    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentMain}>
                <View style={styles.contentTitle}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Icon name="align-left" type='feather' size={30} color={appcolor.white} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexGrow: 1, justifyContent: 'center', }}>
                    <Text style={{ fontSize: 16, color: appcolor.white, textAlign: 'center', fontWeight: fontWeightBold }}>Trang chủ</Text>
                </View>
                <View style={{ width: 50, justifyContent: 'center', marginRight: 12, justifyContent: 'flex-end' }}>
                    <TouchableOpacity style={styles.buttonAction} onPress={handlerNotifyPress}>
                        <Icon reverse size={28} color={appcolor.primary} type="iconic" name='notifications' />
                        {countNotification > 0 &&
                            <View style={styles.badgeNotify}>
                                <Text style={styles.titleBadge}>{countNotification > 99 ? '99+' : countNotification}</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default HeaderView;