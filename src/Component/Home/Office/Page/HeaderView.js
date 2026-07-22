import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Avatar, Badge, Icon, Text } from "@rneui/base";
import { LGSummaryTop } from "../../../../Controller/DashboardController";
import moment from "moment";
import useNotification from "../../../../Hooks/useNotification";
import { URLDEFAULT } from "../../../../Core/URLs";

const HeaderView = ({ navigation }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState);
    const { countNotification } = useNotification()
    //
    const LoadData = async () => {
        console.log(countNotification);

    }
    // Handler
    const handlerNotifyDetails = () => {
        navigation.navigate('Notification')
    }
    const handlerPressMenu = () => {
        navigation && navigation.openDrawer()
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
        mainContainer: { width: '100%', backgroundColor: appcolor.primary, paddingHorizontal: 8 },
        titleHeader: { padding: 8, paddingBottom: 0, fontSize: 13, fontWeight: '500', color: appcolor.light, fontStyle: 'italic' },
        titleContent: { padding: 8, paddingTop: 0, fontSize: 16, fontWeight: '700', color: appcolor.light, fontStyle: 'italic' },
        bottomview: { width: '100%', minHeight: 80, backgroundColor: appcolor.light, padding: 8, borderTopStartRadius: 5, borderTopEndRadius: 5, position: 'absolute', bottom: 0 },
        iconLogoView: { borderRadius: 56, width: 56, height: 56, overflow: 'hidden', backgroundColor: appcolor.white, borderWidth: 2, borderColor: appcolor.light },
    })

    return (
        <View style={styles.mainContainer}>
            <View style={{ flexDirection: "row", padding: 8, alignItems: 'center' }}>
                <View style={{ width: '85%', flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar
                        source={{ uri: `${URLDEFAULT}${userinfo.photo}` }}
                        imageProps={{ resizeMode: 'cover', resizeMethod: 'resize' }}
                        containerStyle={styles.iconLogoView} />
                    <View style={{ width: '70%' }}>
                        <Text style={styles.titleHeader}>{moment().format('ddd - ll')}</Text>
                        <Text style={styles.titleContent}>{userinfo.employeeName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={{ position: 'absolute', end: 56 }} onPress={handlerNotifyDetails}>
                    <Icon name="bell" type="feather" size={26} color={appcolor.light} style={{ margin: 5, padding: 8 }} />
                    {countNotification > 0 && <Badge
                        value={countNotification > 99 ? '99+' : countNotification}
                        textStyle={{ fontSize: 9, color: appcolor.red, fontWeight: '500' }}
                        badgeStyle={{ minWidth: 25, minHeight: 25, borderRadius: 25, backgroundColor: appcolor.light, borderColor: appcolor.red }}
                        containerStyle={{ position: 'absolute', top: 0, right: 0 }}
                    />
                    }
                </TouchableOpacity>
                <TouchableOpacity style={{ position: 'absolute', end: 0 }} onPress={handlerPressMenu}>
                    <Icon name="align-justify" type="feather" size={26} color={appcolor.light} style={{ margin: 5, padding: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default HeaderView;