import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
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
import WebViewUI from '../../../Content/WebViewUI';
import { GetEmployeeInfo, Token } from '../../../Core/Helper';
//import { ACTION } from "../../../Core/ReduxController"
import { AppNameBuild, TRAINEEKEY } from '../../../Core/URLs';
import { deviceWidth } from '../../../Core/Utility';
import { GetMenu } from '../../../Controller/UserController';
import { scaleSize } from '../../../Themes/AppsStyle';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const MenuHomeVSM = ({ navigation, isLoading }) => {
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
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
    },
  );
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
  const renderItem = (item, index) => {
    return (
      <TouchableOpacity
        style={{ justifyContent: 'center', width: deviceWidth / 4 }}
        key={`vsmm_${index}`}
        onPress={() => onItemPress(item)}
      >
        <View style={styles.itemMenuMain}>
          <View
            style={{
              backgroundColor: appcolor.primary,
              padding: 16,
              borderRadius: 24,
              minWidth: deviceWidth / 5,
            }}
          >
            <SpiralIcon
              color={appcolor.light}
              name={item.iconName}
              type={item.iconType}
              size={scaleSize(24)}
            />
          </View>
          <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light, marginTop: 8 },
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
      width: `${100 -
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
      {!isLoading && (
        <ScrollView
          key={'menuvsm'}
          horizontal
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {dataMenu !== null &&
            dataMenu.length > 0 &&
            dataMenu.map((item, index) => renderItem(item, index))}
        </ScrollView>
      )}
      <View style={styles.mainIndicator}>
        <Animated.View
          style={[
            styles.scrollIndicator,
            {
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [0, deviceWidth - dataMenu.length * 10],
                    outputRange: [0, deviceWidth / dataMenu.length],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.indicator} />
        </Animated.View>
      </View>
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
