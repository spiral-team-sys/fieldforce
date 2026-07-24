import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { GetMenu } from '../../Controller/UserController';
import { Icon, Divider } from '@rneui/themed';
import { GetEmployeeInfo, GetToken, Token } from '../../Core/Helper';
import base64 from 'react-native-base64';
import { useDispatch, useSelector } from 'react-redux';
import { scaleSize } from '../../Themes/AppsStyle';
import WebViewUI from '../../Content/WebViewUI';
import DeviceInfo from 'react-native-device-info';
import { TRAINEEKEY } from '../../Core/URLs';
//import { ACTION } from '../../Core/ReduxController';
export const MenuHomeWhirlPool = ({ navigation, menus }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [dataMenu, setDataMenu] = useState(menus);
  const [selected, setSelected] = useState(false);
  const [url, setUrl] = useState(null);
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();
  const LoadDataMenu = async () => {
    const lstMenu = await GetMenu(0);
    await setDataMenu(lstMenu);
  };
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    itemMenu: {
      width: '100%',
      padding: 7,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleMenu: {
      width: '100%',
      marginStart: 8,
      fontSize: 15,
      color: appcolor.dark,
    },
  });
  const handlerItemClick = async item => {
    console.log(item, 'check menu item whirlpool');
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    const deviceId = await DeviceInfo.getUniqueId();
    if (item.pageName.includes('trainee')) {
      const shareKey = {
        LoginID: TRAINEEKEY,
        AccountId: einfo.accountId,
        EmployeeId: einfo.employeeId,
        DeviceID: deviceId,
      };
      const appShare = await base64.encode(JSON.stringify(shareKey));
      // console.log(item)
      const traineeURL = item.reportItem + appShare;
      await setUrl(traineeURL);
      await setSelected(true);
      await setTitle(item.menuNameVN);
    } else if (item.reportItem !== null && item.reportItem.includes('https')) {
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
        token: token,
      };
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      await console.log(app_access);
      await setUrl(item.reportItem + app_access);
      await setSelected(true);
      await setTitle(item.menuNameVN);
    } else {
      dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item });
      navigation.navigate(item.pageName, { menuitem: item });
    }
  };
  useEffect(() => {
    LoadDataMenu();
    return () => false;
  }, [menus]);
  return (
    <View style={styles.mainContainer}>
      {dataMenu?.map((item, index) => {
        return (
          <TouchableOpacity
            key={'kkd2-' + index}
            style={{ alignItems: 'center', backgroundColor: appcolor.light }}
            onPress={() => handlerItemClick(item)}
          >
            <View style={styles.itemMenu}>
              <SpiralIcon
                containerStyle={{ opacity: 0.8 }}
                reverse
                name={item.iconName}
                type={item.iconType || 'font-awesome-5'}
                size={28}
                color={appcolor.lightgrey}
                solid
              />
              <View style={{ flexGrow: 1 }}>
                <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
                <Text
                  style={{
                    color: appcolor.dark,
                    opacity: 0.7,
                    fontSize: scaleSize(12),
                    marginStart: 7,
                  }}
                >
                  {item.menuName}
                </Text>
              </View>
              <SpiralIcon
                name="arrow-right"
                size={32}
                containerStyle={{ alignContent: 'flex-end' }}
              />
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: appcolor.surface,
                width: '80%',
                height: 1,
              }}
            />
          </TouchableOpacity>
        );
      })}
      <Modal visible={selected}>
        <WebViewUI
          urlPage={url}
          onClose={() => setSelected(false)}
          pageName={title}
        />
      </Modal>
    </View>
  );
};
