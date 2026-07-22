import React, { useEffect, useRef, useState } from "react"
import { Animated, DeviceEventEmitter, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import base64 from "react-native-base64"
import DeviceInfo from "react-native-device-info"
import { Icon } from '@rneui/themed'
import { useDispatch, useSelector } from "react-redux"
import WebViewUI from "../../../Content/WebViewUI"
import { GetEmployeeInfo, Token } from "../../../Core/Helper"
//import { ACTION } from "../../../Core/ReduxController"
import { AppNameBuild, TRAINEEKEY } from "../../../Core/URLs"
import { deviceWidth, TODAY } from "../../../Core/Utility"
import { GetMenu } from "../../../Controller/UserController"
import { scaleSize } from "../../../Themes/AppsStyle"
import ShopList from "../../Shops/ShopList"
import { getStoreList } from "../../../Controller/WorkController"
import { LoadingView } from "../../../Control/ItemLoading"
import { SHOP_RELOAD_EVENT, ScreenShops } from '../../Shops/Page/ScreenShops'


const SPACING = 15
const ICON_SIZE = 65
const ITEM_SIZE = ICON_SIZE + SPACING * 3

export const MenuHomeTF = ({ navigation, isLoading }) => {
    const [scrollX] = useState(new Animated.Value(0));
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataMenu: [], isShowToday: false, currentTab: 1 })
    const [dataMenu, setDataMenu] = useState([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState(null)
    const [selected, setSelected] = useState(false)
    const [isShowToday, setShowToday] = useState(false)
    const [currentTab, setCurrentTab] = useState({})
    const [_, setMutate] = useState(false)
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    const LoadData = async () => {
        await setLoading(true)
        const _menu = await GetMenu(0);
        let isHaveToday = false
        let listMenu = []
        await _menu.forEach(it => {
            if (it.id == 24) {
                isHaveToday = true;
                loadShop()
            } else {
                listMenu.push(it)
            }
        })
        await setData({ dataMenu: listMenu, isShowToday: isHaveToday, currentTab: isShowToday ? data.currentTab : 2 })
        await setLoading(false)
        // await setDataMenu(_menu)
    }
    const loadShop = async () => {
        const _shops = await getStoreList('', TODAY);
        await setShops(_shops);
    }

    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
    });

    const onItemPress = async (item) => {
        let token = await Token();
        const einfo = await GetEmployeeInfo();
        const deviceId = await DeviceInfo.getUniqueId()
        console.log(item, 'itemitemitem');
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
        } else if (item.reportItem !== null && item.reportItem.includes("https")) {
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
            setUrl(item.reportItem + app_access)
            setSelected(true);
            setTitle(item.menuNameVN);
        } else {
            await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item })
            if (item.pageName !== 'gallary')
                navigation.navigate(item.pageName, { menuitem: item });
            else
                navigation.navigate(item.pageName);
        }
    }
    // View
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [isLoading])

    const renderItem = ({ item, index }) => {
        const inputRange = [
            -1,
            0,
            ITEM_SIZE * index,
            ITEM_SIZE * (index + 2)
        ]
        const opacityInputRange = [
            -1,
            0,
            ITEM_SIZE * index,
            ITEM_SIZE * (index + 0.5)
        ]
        const scale = scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 1, 0]
        })
        const opacity = scrollY.interpolate({
            inputRange: opacityInputRange,
            outputRange: [1, 1, 1, 0]
        })

        return (
            <Animated.View key={"hk3d2-" + index} style={{
                transform: [{ scale }], opacity,
                justifyContent: 'flex-end', height: ICON_SIZE, marginBottom: 10, marginHorizontal: SPACING
            }} onPress={() => onItemPress(item)}>
                <TouchableOpacity
                    style={{ width: '100%', height: '70%', justifyContent: 'flex-end' }}
                    onPress={() => onItemPress(item)}
                >
                    <View style={{
                        backgroundColor: index == 0 ? appcolor.primary : appcolor.light,
                        width: '100%', height: '100%', borderRadius: 10, justifyContent: "center",
                        shadowColor: appcolor.black, bottom: 3,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2, shadowRadius: 5, elevation: 3
                    }}>
                        <View style={{ width: '70%', left: 70 }}>
                            <Text style={{ color: index == 0 ? appcolor.white : appcolor.dark, fontWeight: '700' }}>{item.menuNameVN}</Text>
                            <Text style={{ color: index == 0 ? appcolor.white : appcolor.dark, opacity: 0.5, fontWeight: '600', fontSize: scaleSize(9), }}>{item.menuName}</Text>
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: index == 0 ? appcolor.primary : appcolor.light,
                        position: 'absolute', left: 0, bottom: 0, height: ICON_SIZE, width: ICON_SIZE, borderRadius: 8,
                        justifyContent: 'center', alignItems: 'center',
                        shadowColor: appcolor.black, elevation: 3, // Cho Android
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5,
                    }}>
                        <Icon containerStyle={{ alignItems: 'flex-start' }} name={item.iconName} color={index == 0 ? appcolor.white : appcolor.primary}
                            type={item.iconType || "font-awesome-5"} size={30} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        titleMain: { padding: 0, fontSize: 18, fontWeight: '700', alignSelf: 'center', color: appcolor.dark },
        titleMenu: { color: appcolor.dark, fontSize: 12, fontWeight: '600', marginTop: 5, minHeight: 30, textAlign: 'center' },
        itemMenuMain: { alignItems: 'center', padding: 8, borderRadius: 8 },
        scrollIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'center', },
        indicator: { width: `${100 - (dataMenu.length <= 4 ? 0 : (dataMenu.length * 10) - (dataMenu.length >= 10 ? 30 : 8))}%`, height: 6, borderRadius: 8, backgroundColor: appcolor.primary },
        mainIndicator: { height: 6, width: '15%', backgroundColor: '#feeaeb', borderRadius: 8, alignSelf: 'center', marginTop: 8, overflow: "hidden" }
    })
    const handleSelectTab = (type) => {
        if (type == 1) {
            DeviceEventEmitter.emit(SHOP_RELOAD_EVENT, true);
        }
        data.currentTab = type
        setMutate(e => !e)
    }
    const scrollY = useRef(new Animated.Value(0)).current
    return (
        <View style={styles.mainContainer}>
            <View style={{ width: deviceWidth }}>
                {
                    data.isShowToday && <View style={{ display: data.currentTab == 1 ? 'flex' : "none", width: '100%', height: '100%', backgroundColor: appcolor.light, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 40, width: deviceWidth }}>
                        {isLoading && <LoadingView isLoading={isLoading} title=' ' styles={{ marginTop: 16 }} />}
                        {/* {!isLoading && <ShopList shops={shops} header="none" navigation={navigation} loading={loading} />} */}
                        {!isLoading &&
                            <ScreenShops navigation={navigation} isDownloadData={loading} isShowHeader={false} inHome={true} />
                        }
                    </View>
                }

                <View style={{ display: data.currentTab == 2 ? 'flex' : "none", marginTop: 8 }}>
                    {isLoading && <LoadingView isLoading={isLoading} title=' ' styles={{ marginTop: 16 }} />}
                    {!isLoading &&
                        <Animated.FlatList data={data.dataMenu}
                            showsVerticalScrollIndicator={false}
                            key={'menuitems'}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: true }
                            )}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderItem}
                            ListHeaderComponent={<View style={{ height: 50 }} />}
                            ListFooterComponent={<View style={{ height: 100 }} />}
                        />
                    }
                </View>
                <Modal visible={selected}>
                    <WebViewUI urlPage={url} onClose={() => setSelected(false)} pageName={title} />
                </Modal>
            </View>
            {/* item Tab */}
            <View style={{ position: 'absolute', top: -40, left: 0, height: 80, width: deviceWidth }}>
                <View style={{
                    marginHorizontal: 60, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.light, flex: 1,
                    shadowColor: appcolor.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.6,
                    shadowRadius: 5,
                    elevation: 3, // Cho Android
                }}>
                    {
                        data.isShowToday &&
                        <TouchableOpacity
                            onPress={() => handleSelectTab(1)}
                            style={{ width: 70, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ borderRadius: 50, borderWidth: 0.6, borderColor: appcolor.switchEnable, backgroundColor: data?.currentTab == 1 ? appcolor.switchEnable : appcolor.light, width: 35, height: 35, justifyContent: 'center', alignItems: 'center', }}>
                                <Icon name="today" type="MaterialIcons" size={18} color={data?.currentTab == 1 ? appcolor.white : appcolor.switchEnable} />
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: '500', color: appcolor.switchEnable, paddingTop: 3 }}>Hôm nay</Text>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        onPress={() => handleSelectTab(2)}
                        style={{ width: 70, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ borderRadius: 50, backgroundColor: data?.currentTab == 2 ? appcolor.info : appcolor.light, borderWidth: 0.6, borderColor: appcolor.info, width: 35, height: 35, justifyContent: 'center', alignItems: 'center', }}>
                            <Icon name="view-list" type="MaterialIcons" size={18} color={data?.currentTab == 2 ? appcolor.white : appcolor.info} />
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: '500', color: appcolor.info, paddingTop: 3 }}>Chức năng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}