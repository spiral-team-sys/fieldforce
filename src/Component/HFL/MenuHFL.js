import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { GetMenu } from '../../Controller/UserController';
import { Icon } from '@rneui/themed';
import { GetEmployeeInfo, Token } from '../../Core/Helper';
import base64 from 'react-native-base64';
import { useDispatch, useSelector } from 'react-redux';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import WebViewUI from '../../Content/WebViewUI';
import DeviceInfo from 'react-native-device-info';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import { FlatList } from 'react-native';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
//import { ACTION } from '../../Core/ReduxController';
export const MenuHFL = ({ navigation, menus }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [dataMenu, setDataMenu] = useState(menus);
  const [selected, setSelected] = useState(false);
  const [url, setUrl] = useState(null);
  const [appshare, setappShare] = useState();
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();
  const LoadDataMenu = async () => {
    const lstMenu = await GetMenu(0);
    await setDataMenu(lstMenu);
  };

  const handlerItemClick = async item => {
    // dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item })
    // navigation.navigate("approach", { menuitem: item });
    // return
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    const deviceId = await DeviceInfo.getUniqueId();
    if (item.pageName.includes('trainee')) {
      await setSelected(item);
      const shareKey = {
        AccountId: einfo.accountId,
        CoachingID: 0,
        DeviceID: deviceId,
        EmployeeId: einfo.employeeId,
        LoginID: TRAINEEKEY,
        LoginIDForRP: '',
        ShopId: 0,
      };
      const appShare = await base64.encode(JSON.stringify(shareKey));
      const urlPage = item.reportItem + appShare;
      navigation.navigate('trainee', {
        pageName: item.menuNameVN,
        urlPage: urlPage,
      });
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
      // await console.log(app_access)
      await setUrl(item.reportItem + app_access);
      await setSelected(true);
      // console.log(item.reportItem + app_access)
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
  const menuItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={'hk3d2-' + index}
        style={{
          width: deviceWidth * 0.45,
          height: deviceWidth * 0.3,
          marginRight: 12,
          borderRadius: 20,
          backgroundColor: index == 0 ? appcolor.primary : appcolor.light,
          marginBottom: 10,
        }}
        onPress={() => handlerItemClick(item)}
      >
        <View style={{ width: '100%', height: '100%', padding: 12 }}>
          <SpiralIcon
            containerStyle={{ alignItems: 'flex-start' }}
            name={item.iconName}
            color={index == 0 ? appcolor.white : appcolor.primary}
            type={item.iconType || 'font-awesome-5'}
            size={38}
          />
          <View style={{ flexGrow: 1 }} />
          <View style={{ width: '100%', bottom: 10, alignItems: 'flex-end' }}>
            <Text style={{ color: appcolor.dark, fontWeight: '700' }}>
              {item.menuNameVN}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                opacity: 0.3,
                fontWeight: '600',
                fontSize: scaleSize(9),
              }}
            >
              {item.menuName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{ backgroundColor: appcolor.surface, padding: 12, paddingTop: 2 }}
    >
      <FlatList data={dataMenu} numColumns={2} renderItem={menuItem} />
      <Modal visible={selected}>
        <WebViewUI
          urlPage={url}
          appShare={appshare}
          onClose={() => setSelected(false)}
          pageName={title}
        />
      </Modal>
    </View>
  );
};
