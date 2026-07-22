import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import useNotification from "../../../../Hooks/useNotification";
import { Avatar, Icon, Text } from "@rneui/base";
import { URLDEFAULT } from "../../../../Core/URLs";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

const HeaderView = ({ navigation }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState);
    const { countNotification } = useNotification()

    // Handler
    const handlerNotifyPress = () => {
        navigation.navigate('Notification')
    }
    const handlerMenuPress = () => {
        navigation.openDrawer()
    }
    //
    useEffect(() => {
        let isMounted = true;
        if (!isMounted)
            return
        return () => { isMounted = false }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        contentMenu: { position: 'absolute', top: 8, start: 16, zIndex: 10 },
        contentEmployeeInfo: { alignItems: 'center', justifyContent: 'center' },
        contentNotify: { position: 'absolute', top: 8, end: 16, zIndex: 10 },
        viewPhoto: { backgroundColor: appcolor.light, padding: 3, margin: 8 },
        titleEmployee: { color: appcolor.light, fontSize: 18, fontWeight: 'bold' },
        subTitleEmployee: { color: appcolor.grayLight, fontSize: 13 },
        buttonAction: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 },
        badgeNotify: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -8, end: -8, backgroundColor: appcolor.danger, borderRadius: 16 },
        titleBadge: { fontSize: 11, color: appcolor.light },
    })

    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentMenu}>
                <TouchableOpacity style={styles.buttonAction} onPress={handlerMenuPress}>
                    <Icon size={28} color={appcolor.light} type="ionic" name='menu' />
                </TouchableOpacity>
            </View>
            <View style={styles.contentEmployeeInfo}>
                {userinfo.photo ?
                    <Avatar
                        rounded
                        size='xlarge'
                        source={{ uri: `${URLDEFAULT}${userinfo.photo}` }}
                        containerStyle={styles.viewPhoto}
                    />
                    :
                    <Avatar
                        rounded
                        size='xlarge'
                        icon={{ name: "person", type: "ionicon", color: appcolor.primary }}
                        containerStyle={styles.viewPhoto}
                    />
                }
                <Text style={styles.titleEmployee}>{`Xin chào, ${userinfo.employeeName}`}</Text>
                <Text style={styles.subTitleEmployee}>{`${userinfo.employeeCode}`}</Text>
            </View>
            <View style={styles.contentNotify}>
                <TouchableOpacity style={styles.buttonAction} onPress={handlerNotifyPress}>
                    <Icon size={28} color={appcolor.light} type="ionic" name='notifications' />
                    {countNotification > 0 &&
                        <View style={styles.badgeNotify}>
                            <Text style={styles.titleBadge}>{countNotification > 99 ? '99+' : countNotification}</Text>
                        </View>
                    }
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default HeaderView;