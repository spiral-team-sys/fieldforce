import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { FlashList } from "@shopify/flash-list";
import LoadingView from "../../../Control/LoadingView";
import { Icon, Text } from "@rneui/base";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import { ColorRand, ToastError, ToastSuccess } from "../../../Core/Helper";
import { DEFAULT_COLOR } from "../../../Core/URLs";
import { POPAPI } from "../../../API/POPAPI";

const POPMenuScreen = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(true)
    const [dataMenu, setDataMenu] = useState([])

    const LoadData = async () => {
        !isLoading && await setLoading(true)
        await POPAPI.GetDataMenu((mData, message) => {
            message && ToastError(message, 'Thông báo', 'top')
            setDataMenu(mData)
        })
        await setLoading(false)
    }

    const handlerPressMenu = (item) => {
        if (item.pageName !== null && item.pageName.length > 0) {
            navigation.navigate(item.pageName, { popMenu: item })
        } else {
            ToastSuccess("Chức năng hiện tại đang trong quá trình hoàn thiện, Vui lòng bỏ qua mục này !", 'Thông báo')
        }
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        const reload_menu = DeviceEventEmitter.addListener('RELOAD_MENU_POP', LoadData)
        LoadData()
        return () => { reload_menu.remove() }
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentContainer: { flex: 1, margin: 8 },
        itemContainer: {
            flex: 1, minHeight: 150, justifyContent: 'center', margin: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8, padding: 8, backgroundColor: appcolor.light,
            elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4
        },
        viewIcon: { width: 75, height: 75, backgroundColor: appcolor.surface, padding: 16, borderRadius: 100, justifyContent: 'center', alignSelf: 'center' },
        viewInfo: { marginTop: 8 },
        titleMenu: { fontSize: 13, fontWeight: '500', color: appcolor.dark, textAlign: 'center' },
        titleDetailMenu: { fontSize: 18, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        loadingView: { marginTop: 8, zIndex: 100 },
        badgeView: { backgroundColor: appcolor.danger, position: 'absolute', width: 25, height: 25, borderRadius: 25, alignItems: 'center', justifyContent: 'center', top: 0, end: -8 },
        titleBadge: { fontSize: 11, color: appcolor.white, fontWeight: fontWeightBold }
    })

    const renderItem = ({ item, index }) => {
        const onPress = () => handlerPressMenu(item)
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
                <View style={styles.viewIcon}>
                    <Icon
                        type="font-awesome-5"
                        name={item.imageItem}
                        size={25}
                        color={ColorRand(index)}
                    />
                    {item.numberNotify > 0 &&
                        <View style={styles.badgeView}>
                            <Text style={styles.titleBadge}>{item.numberNotify}</Text>
                        </View>
                    }
                </View>
                <View style={styles.viewInfo}>
                    {item.detailMenu && <Text style={styles.titleDetailMenu}>{item.detailMenu}</Text>}
                    <Text style={styles.titleMenu}>{item.menuName}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    if (isLoading)
        return <LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' styles={styles.loadingView} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title='Quản lí POSM'
                leftFunc={onBack}
            />
            <View style={styles.contentContainer}>
                <FlashList
                    keyExtractor={(_item, index) => index.toString()}
                    data={dataMenu}
                    extraData={[dataMenu]}
                    renderItem={renderItem}
                    estimatedItemSize={100}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    )
}

export default POPMenuScreen;