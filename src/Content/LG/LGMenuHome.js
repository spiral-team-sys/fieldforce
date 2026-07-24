import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { deviceWidth } from '../../Themes/AppsStyle';
import { useDispatch, useSelector } from 'react-redux';
import WebViewUI from '../WebViewUI';
import CustomListView from '../../Control/Custom/CustomListView';
import DeviceInfo from 'react-native-device-info';
import { GetEmployeeInfo, Token } from '../../Core/Helper';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import { SetKpiInfo } from '../../Redux/action';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const LGMenuHome = ({ navigation, menus }) => {
  const [menulist, setMenu] = useState(menus);
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [url, setUrl] = useState(null);
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    setMenu(menus);
    return () => false;
  }, [menus]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    itemMain: {
      width: deviceWidth / 3.3,
      backgroundColor: appcolor.light,
      margin: 8,
      marginTop: 0,
      borderWidth: 1,
      padding: 8,
      borderRadius: 8,
      borderColor: appcolor.surface,
      shadowColor: appcolor.grey,
      shadowOffset: { width: 1, height: 0 },
      shadowRadius: 8,
      shadowOpacity: 0.3,
      elevation: 3,
    },
    itemContent: { alignItems: 'center', padding: 8 },
    iconStyle: {
      shadowColor: appcolor.light,
      shadowOpacity: 0.6,
      shadowOffset: { width: 0, height: 3 },
    },
    titleName: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.dark,
      width: '100%',
      textAlign: 'center',
    },
  });

  const onItemPress = async item => {
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    dispatch(SetKpiInfo(item));
    if (item.reportItem !== null && item.reportItem.includes('trainee')) {
      await setSelected(item);
      const deviceId = await DeviceInfo.getUniqueId();
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
        deviceId: await DeviceInfo.getUniqueId(),
        AppId: AppNameBuild,
        token: token,
      };
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      setUrl(item.reportItem + app_access);
      setSelected(true);
      setTitle(item.menuNameVN);
    } else {
      if (item.pageName !== 'gallary')
        navigation.navigate(item.pageName, { menuitem: item });
      else navigation.navigate(item.pageName);
    }
  };
  const renderItem = ({ item }) => {
    const onPress = () => onItemPress(item);
    return (
      <View style={styles.itemMain}>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.itemContent}>
            <SpiralIcon
              color={appcolor.primary}
              name={item.iconName}
              type={item.iconType || 'fontawesome'}
              style={styles.iconStyle}
              size={56}
            />
            <Text style={styles.titleName}>{item.menuNameVN}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <CustomListView data={menulist} numColumns={3} renderItem={renderItem} />
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
