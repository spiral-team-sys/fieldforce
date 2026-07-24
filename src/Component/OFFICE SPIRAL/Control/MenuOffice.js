import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import DeviceInfo from 'react-native-device-info';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import WebViewUI from '../../../Content/WebViewUI';
import { GetEmployeeInfo, Token } from '../../../Core/Helper';
//import { ACTION } from "../../../Core/ReduxController"
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import { deviceWidth, unicodeToBase64 } from '../../../Core/Utility';
import { GetMenu } from '../../../Controller/UserController';
import { scaleSize } from '../../../Themes/AppsStyle';
import { COLOR } from './UtilityOffice';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const MenuOffice = ({ navigation, isLoading }) => {
  const [scrollX] = useState(new Animated.Value(0));
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState(null);
  const [selected, setSelected] = useState(false);
  const dispatch = useDispatch();

  const LoadData = async () => {
    const _menu = await GetMenu(0);
    await setDataMenu(_menu);
  };
  const onItemPress = async item => {
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
      const app_access = await unicodeToBase64(JSON.stringify(shareInfo));
      console.log(app_access);
      setUrl(item.reportItem + app_access);
      // console.log(item.reportItem + app_access)
      setSelected(true);
      setTitle(item.menuNameVN);
    } else {
      await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item });
      if (item.pageName !== 'gallary')
        navigation.navigate(item.pageName, { menuitem: item });
      else navigation.navigate(item.pageName);
    }
  };
  // View
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [isLoading]);
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={`menuoffc_${index}`}
        style={{ width: deviceWidth / 4.2 }}
        onPress={() => onItemPress(item)}
      >
        <View style={styles.itemMenuMain}>
          <View style={{ padding: 8, minWidth: deviceWidth / 5 }}>
            <SpiralIcon
              color={COLOR.ColorRand(index)}
              name={item.iconName}
              type={item.iconType}
              size={scaleSize(28)}
            />
          </View>
          <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { backgroundColor: appcolor.light, borderRadius: 8 },
    titleMenu: {
      color: appcolor.blacklight,
      fontSize: 11,
      fontWeight: '500',
      minHeight: 24,
      textAlign: 'center',
    },
    itemMenuMain: { alignItems: 'center', padding: 8, borderRadius: 8 },
  });
  return (
    <View style={styles.mainContainer}>
      {!isLoading && (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <FlatList
            key={'menu_home_office'}
            scrollEnabled={false}
            data={dataMenu}
            numColumns={4}
            renderItem={renderItem}
          />
        </View>
      )}
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
