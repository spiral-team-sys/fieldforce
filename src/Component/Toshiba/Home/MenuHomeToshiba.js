import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import DeviceInfo from 'react-native-device-info';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { GetEmployeeInfo, Token } from '../../../Core/Helper';
//import { ACTION } from "../../../Core/ReduxController"
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import { deviceWidth, TODAY } from '../../../Core/Utility';
import { GetMenu } from '../../../Controller/UserController';
import { fontWeightBold, scaleSize } from '../../../Themes/AppsStyle';
import { getStoreList } from '../../../Controller/WorkController';
import ShopOneMoreToshiba from '../Shops/ShopOneMoreToshiba';

{
  /* userinfo.dropCategory : đóng danh sách shop Bên ngoài */
}

export const MenuHomeToshiba = ({ navigation, isLoading, downloadData }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataMenu: [],
    isShowToday: false,
    currentTab: 1,
  });
  const [dataMenu, setDataMenu] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState(null);
  const [selected, setSelected] = useState(false);
  const [isShowToday, setShowToday] = useState(false);
  const [_, setMutate] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const LoadData = async () => {
    await setLoading(true);
    const _menu = await GetMenu(0);
    let isHaveToday = false;
    await loadShop();
    await setData({
      dataMenu: _menu,
      isShowToday: isHaveToday,
      currentTab: isShowToday ? data.currentTab : 2,
    });
    await setLoading(false);
    // await setDataMenu(_menu)
  };
  const loadShop = async () => {
    const _shops = await getStoreList('', TODAY);
    await setShops(_shops);
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
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      setUrl(item.reportItem + app_access);
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
        key={'hk3d2-' + index}
        style={{
          justifyContent: 'flex-end',
          height: 70,
          minWidth: deviceWidth * 0.4,
          paddingRight: userinfo.dropCategory !== 1 ? 8 : 0,
        }}
        onPress={() => onItemPress(item)}
        activeOpacity={0.8}
      >
        <View
          style={{
            height: 66,
            flexDirection: 'row',
            borderRadius: 50,
            backgroundColor: appcolor.surface,
            alignItems: 'center',
            padding: 4,
          }}
        >
          <View
            style={{
              backgroundColor: appcolor.primary,
              borderRadius: 50,
              height: 52,
              width: 52,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SpiralIcon
              containerStyle={{ alignItems: 'flex-start' }}
              name={item.iconName}
              color={appcolor.white}
              type={item.iconType || 'font-awesome-5'}
              size={24}
            />
          </View>
          <View style={{ paddingHorizontal: 10, justifyContent: 'center' }}>
            <Text style={{ color: appcolor.primary, fontWeight: '700' }}>
              {item.menuNameVN}
            </Text>
            <Text
              style={{
                color: appcolor.greylight,
                opacity: 0.5,
                fontWeight: '600',
                fontSize: scaleSize(10),
              }}
            >
              {item.menuName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: appcolor.transparent,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    titleMain: {
      padding: 0,
      fontSize: 18,
      fontWeight: '700',
      alignSelf: 'center',
      color: appcolor.dark,
    },
    titleMenu: {
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 5,
      minHeight: 30,
      textAlign: 'center',
    },
    itemMenuMain: { alignItems: 'center', padding: 8, borderRadius: 8 },
    scrollIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
    },
    indicator: {
      width: `${
        100 -
        (dataMenu.length <= 4
          ? 0
          : dataMenu.length * 10 - (dataMenu.length >= 10 ? 30 : 8))
      }%`,
      height: 6,
      borderRadius: 8,
      backgroundColor: appcolor.primary,
    },
    mainIndicator: {
      height: 6,
      width: '15%',
      backgroundColor: '#feeaeb',
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 8,
      overflow: 'hidden',
    },
  });
  return (
    <View style={styles.mainContainer}>
      {userinfo.dropCategory !== 1 ? (
        <View style={{ width: deviceWidth, paddingLeft: 10 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: fontWeightBold,
              color: appcolor.placeholderText,
              padding: 4,
            }}
          >
            Chức năng
          </Text>
          {!isLoading && (
            <FlatList
              data={data.dataMenu}
              showsHorizontalScrollIndicator={false}
              key={'menuitems'}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1, padding: 10 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: fontWeightBold,
              color: appcolor.placeholderText,
              padding: 4,
            }}
          >
            Chức năng
          </Text>
          {!isLoading && (
            <FlatList
              data={data.dataMenu}
              showsVerticalScrollIndicator={false}
              key={'menuitems'}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
            />
          )}
        </View>
      )}
      {userinfo.dropCategory !== 1 && shops.length > 0 && (
        <View
          style={{
            width: deviceWidth,
            padding: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '500',
              color: appcolor.primary,
              padding: 8,
            }}
          >
            Cửa hàng{' '}
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
            onPress={() => navigation.navigate('ShopList')}
          >
            <SpiralIcon
              name="arrow-right"
              color={appcolor.primary}
              size={28}
              style={{ alignItems: 'center' }}
            />
            <Text
              style={{
                color: appcolor.primary,
                fontWeight: '500',
                fontSize: 12,
              }}
            >
              Tất cả ({shops?.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {userinfo.dropCategory !== 1 && shops.length > 0 && (
        <View style={{ flex: 1 }}>
          {!isLoading && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ height: '100%' }}
              // refreshControl={<RefreshControl refreshing={false} onRefresh={downloadData} />}
            >
              <ShopOneMoreToshiba
                shops={shops}
                navigation={navigation}
                loading={loading}
              />
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};
