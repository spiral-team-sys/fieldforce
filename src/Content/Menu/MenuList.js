import React, { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, Modal, StyleSheet, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import base64 from "react-native-base64";
import DeviceInfo from "react-native-device-info";
import {
    AppNameBuild,
    cuckooApp,
    honorApp,
    lgApp,
    officeApp,
    psvApp,
    TRAINEEKEY,
} from "../../Core/URLs";
import CustomListView from "../../Control/Custom/CustomListView";
import { GetEmployeeInfo, Token } from "../../Core/Helper";
import { SetKpiInfo, SetShopInfo } from "../../Redux/action";
import WebViewScreen from "../../Control/Webview/WebViewScreen";
import MenuDefault from "./Page/Menu/MenuDefault";
import { MenuHonor } from "./Page/Menu/MenuHonor";
import MenuOffice from "./Page/Menu/MenuOffice";
import MenuLG from "./Page/Menu/MenuLG";

const MenuList = ({ navigation, route, menus }) => {
    const { appcolor } = useSelector((state) => state.GAppState);
    const [menuList, setMenuList] = useState([]);
    const [traineeURL, setTraineeURL] = useState(null);
    const [isWebviewModalVisible, setIsWebviewModalVisible] = useState(false);
    const dispatch = useDispatch();

    const LoadMenus = useCallback(() => {
        setMenuList(menus || []);
    }, [menus]);

    const onRefresh = () => {
        DeviceEventEmitter.emit("REDOWNLOAD_DATA");
    };

    const openWebviewSheet = async (item, einfo, token) => {
        if (item.reportItem?.includes("trainee")) {
            const deviceId = await DeviceInfo.getUniqueId();

            const shareKey = {
                AccountId: einfo.accountId,
                CoachingID: 0,
                DeviceID: deviceId,
                EmployeeId: einfo.employeeId,
                LoginID: TRAINEEKEY,
                LoginIDForRP: "",
                ShopId: 0,
                RefLoginType: 2,
            };

            const appShare = base64.encode(JSON.stringify(shareKey));
            const urlPage = item.reportItem + appShare;

            setTraineeURL({
                pageName: item.menuNameVN,
                urlPage,
            });
            setIsWebviewModalVisible(true);
            return true;
        }

        if (item.reportItem?.includes("https")) {
            const shareInfo = {
                employeeId: einfo.employeeId,
                employeeName: einfo.employeeName,
                accountId: einfo.accountId,
                typeId: einfo.typeId,
                loginName: einfo.loginName,
                mobile: einfo.mobile,
                menuId: item.id,
                deviceId: await DeviceInfo.getUniqueId(),
                AppId: AppNameBuild,
                token: token,
            };

            const appAccess = base64.encode(JSON.stringify(shareInfo));
            const urlPage = item.reportItem + appAccess;

            setTraineeURL({
                pageName: item.menuNameVN,
                urlPage,
            });
            setIsWebviewModalVisible(true);
            return true;
        }

        return false;
    };

    const handleMenuNavigation = useCallback(async (item) => {
        if (!item) return;

        const token = await Token();
        const einfo = await GetEmployeeInfo();

        dispatch(SetKpiInfo(item));
        dispatch(SetShopInfo({}));

        const openedWebview = await openWebviewSheet(item, einfo, token);
        if (openedWebview) return;

        if (item.pageName !== "gallary") {
            navigation.navigate(item.pageName, { menuitem: item });
        } else {
            navigation.navigate(item.pageName);
        }
    }, [dispatch, navigation]);

    const onItemPress = useCallback(async (item) => {

        const reportConfig = item.reportItem?.trim().startsWith("{")
            ? JSON.parse(item.reportItem)
            : {};
        const { isShopPermission } = reportConfig;
        if (isShopPermission) {
            navigation.navigate("shopPermission", { menuitem: item });
            return;
        }
        await handleMenuNavigation(item);
    }, [handleMenuNavigation, navigation]);

    const onHideTrainee = () => {
        setIsWebviewModalVisible(false);
        setTraineeURL(null);
    };

    useEffect(() => {
        LoadMenus();
    }, [LoadMenus]);

    useEffect(() => {
        const permissionPassed = route?.params?.permissionPassed;
        const menuitem = route?.params?.menuitem;

        if (permissionPassed && menuitem) {
            onItemPress(menuitem);
            navigation.setParams({ permissionPassed: false, menuitem: null });
        }
    }, [
        route?.params?.permissionPassed,
        route?.params?.menuitem,
        navigation,
        onItemPress,
    ]);

    const styles = StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: appcolor.light,
        },
        sheetStyle: {
            flex: 1,
            backgroundColor: appcolor.primary,
        },
    });

    const componentMap = {
        [lgApp]: MenuLG,
        [honorApp]: MenuHonor,
        [officeApp]: MenuOffice
    }

    const SelectedComponent = componentMap[AppNameBuild];
    const numColumnsApps = [lgApp, psvApp, honorApp, cuckooApp, officeApp];
    const horizontalApps = [cuckooApp];

    const isHorizontal = horizontalApps.includes(AppNameBuild);
    const numberColumns = numColumnsApps.includes(AppNameBuild)
        ? AppNameBuild === officeApp
            ? 4
            : 3
        : 1;

    const renderItem = ({ item, index }) => {
        if (!SelectedComponent) return null;

        return (
            <SelectedComponent
                index={index}
                key={item.id}
                item={item}
                onPress={onItemPress}
                appcolor={appcolor}
                viewHorizontal={isHorizontal}
            />
        );
    };

    return (
        <View style={styles.mainContainer}>
            {SelectedComponent ? (
                <CustomListView
                    data={menuList}
                    horizontal={isHorizontal}
                    numColumns={numberColumns}
                    renderItem={renderItem}
                    onRefresh={onRefresh}
                    bottomView={{ paddingBottom: 0 }}
                />
            ) : (
                <MenuDefault
                    menus={menuList}
                    onPress={onItemPress}
                    onRefresh={onRefresh}
                />
            )}

            <Modal
                visible={isWebviewModalVisible}
                animationType="false"
                presentationStyle="fullScreen"
                statusBarTranslucent
                onRequestClose={onHideTrainee}
            >
                <View style={styles.sheetStyle}>
                    <WebViewScreen
                        pageName={traineeURL?.pageName}
                        urlPage={traineeURL?.urlPage}
                        onClose={onHideTrainee}
                    />
                </View>
            </Modal>
        </View>
    );
};

export default MenuList;
