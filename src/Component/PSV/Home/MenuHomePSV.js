import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import DeviceInfo from 'react-native-device-info';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import {
  GetEmployeeInfo,
  Token,
  removeVietnameseTones,
} from '../../../Core/Helper';
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import { deviceWidth } from '../../../Core/Utility';
import { SetKpiInfo } from '../../../Redux/action';

export const MenuHomePSV = ({ navigation, menus }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const _setdata = setDataMenu(menus);
    return () => _setdata;
  }, [menus]);

  const onItemPress = async item => {
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    const deviceId = await DeviceInfo.getUniqueId();
    if (item.pageName.includes('trainee')) {
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
      const shareInfo = {
        employeeId: einfo.employeeId,
        employeeName: removeVietnameseTones(einfo.employeeName),
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
      navigation.navigate(item.pageName, {
        pageName: item.menuNameVN,
        urlPage: item.reportItem + app_access,
      });
    } else {
      dispatch(SetKpiInfo(item));
      if (item.pageName !== 'gallary')
        navigation.navigate(item.pageName, { menuitem: item });
      else navigation.navigate(item.pageName);
    }
  };
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => onItemPress(item)}>
        <View key={`MN_${index}`} style={styles.itemMenuMain}>
          <View
            style={{
              backgroundColor: appcolor.info,
              borderRadius: 10,
              marginEnd: 8,
              width: 45,
              height: 45,
              justifyContent: 'center',
            }}
          >
            <SpiralIcon
              name={item.iconName}
              type={item.iconType || 'font-awesome-5'}
              size={20}
              color={appcolor.light}
              style={{ textAlign: 'center' }}
            />
          </View>
          <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
          <SpiralIcon
            name="angle-right"
            type="font-awesome-5"
            size={15}
            color={appcolor.dark}
            style={{ padding: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1.35, backgroundColor: appcolor.light },
    titleMain: {
      width: '95%',
      padding: 8,
      fontSize: 21,
      fontWeight: '700',
      alignSelf: 'center',
      color: appcolor.dark,
    },
    itemMenuMain: {
      width: '100%',
      padding: 8,
      backgroundColor: appcolor.surface,
      borderRadius: 15,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleMenu: {
      width: '78%',
      color: appcolor.dark,
      fontSize: 15,
      fontWeight: '600',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleMain}>Chức năng</Text>
      <FlatList
        style={{ flex: 1, padding: 8 }}
        key={'menuhome'}
        keyExtractor={(_, index) => index.toString()}
        data={dataMenu}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: deviceWidth / 10 }} />}
      />
    </View>
  );
};
