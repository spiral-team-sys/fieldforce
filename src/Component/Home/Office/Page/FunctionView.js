import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import ShopList from "../../../Shops/List/ShopList";
import { getDataStoreList } from "../../../../Controller/ShopController";
import { menuController } from "../../../../Controller/MenuController";
import MenuList from "../../../../Content/Menu/MenuList";
import { LGHomeDashboard } from "../../../LG/LGHomeDashboard";

const FunctionView = ({ navigation, isReloadData }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [dataMenu, setDataMenu] = useState([])
    const [dataShop, setDataShop] = useState([])

    // Handler
    const LoadData = async () => {
        await menuController.getMenu(0, setDataMenu)
        await getDataStoreList(setDataShop)
    }
    // Action

    //
    useEffect(() => {
        const reload_store = DeviceEventEmitter.addListener('RELOAD_DATA_SHOP', LoadData)
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => {
            isMounted = false
            reload_store.remove()
        }
    }, [isReloadData])

    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1 },
        headerTab: { backgroundColor: appcolor.primary },
        labelTabStyle: { fontSize: 14, color: appcolor.dark, fontWeight: fontWeightBold },
        indicatorStyle: { backgroundColor: appcolor.primary },
        tabStyle: { minWidth: deviceWidth / 2, height: 38 },
        tabContainer: { flex: 1, backgroundColor: appcolor.light, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        contentPage: { width: '100%', height: '100%', marginTop: 48 }
    })
    return (
        <View style={styles.mainContainer}>
            <Tabs.Container
                pagerProps={{ scrollEnabled: true }}
                headerContainerStyle={styles.headerTab}
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={styles.labelTabStyle}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        indicatorStyle={styles.indicatorStyle}
                        tabStyle={styles.tabStyle}
                        style={styles.tabContainer}
                    />
                )}>
                {
                    userinfo.employeeId > 0 && ('pm,leader,sup').includes(userinfo.groupType.toLowerCase()) &&
                    <Tabs.Tab label={userinfo.groupType.toLowerCase() === 'pm' ? "Thống kê" : "Follow Daily"} name={userinfo.groupType.toLowerCase() === 'pm' ? "Thống kê" : "Follow Daily"}>
                        <View style={{ backgroundColor: appcolor.surface, marginTop: 40, width: deviceWidth }}>
                            <LGHomeDashboard navigation={navigation} />
                        </View>
                    </Tabs.Tab>
                }
                {
                    ('asm, pg,mer,leader').includes(userinfo.groupType.toLowerCase()) &&
                    <Tabs.Tab label="Hôm nay" name="Hôm nay">
                        <View style={styles.contentPage}>
                            <ShopList navigation={navigation} data={dataShop} />
                        </View>
                    </Tabs.Tab>
                }

                <Tabs.Tab label="Chức năng" name="Chức năng">
                    <View style={styles.contentPage}>
                        <MenuList menus={dataMenu} navigation={navigation} />
                    </View>
                </Tabs.Tab>
            </Tabs.Container>
        </View>
    )
}

export default FunctionView
