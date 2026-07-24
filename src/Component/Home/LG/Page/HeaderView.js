import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import { deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle';
import useNotification from '../../../../Hooks/useNotification';
import { LGSummaryTop } from '../../../../Controller/DashboardController';
import { DrawerActions } from '@react-navigation/native';

const HeaderView = ({ navigation }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const { countNotification } = useNotification();
  const [itemSummary, setItemSummary] = useState({});
  //
  const LoadData = async () => {
    await LGSummaryTop(async result => {
      setItemSummary(result[0] || {});
    });
  };
  // Handler
  const handlerNotifyPress = () => {
    navigation.navigate('Notification');
  };
  const handlerMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const handlerShowDashboard = () => {
    let pageName = '';
    switch (itemSummary?.dashboardName) {
      case 'Sellout':
        pageName = 'dashboardDetail';
        break;
      case 'SellIn':
        pageName = 'dashboardhomesellin';
        break;
    }
    navigation.navigate(pageName);
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    contentMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingStart: 16,
      paddingEnd: 8,
    },
    contentTitle: { alignContent: 'space-around' },
    contentButton: { flexDirection: 'row', justifyContent: 'center' },
    titleWelcome: {
      color: appcolor.primary,
      fontWeight: fontWeightBold,
      fontSize: 16,
    },
    titleEmployeeCode: {
      fontSize: 12,
      fontWeight: '500',
      fontStyle: 'italic',
      color: appcolor.dark,
    },
    viewTop: {
      borderTopRightRadius: deviceWidth / 3,
      opacity: 0.5,
      backgroundColor: appcolor.grayLight,
      width: '50%',
      position: 'absolute',
      top: -60,
      bottom: 0,
      start: 0,
    },
    buttonAction: { flexDirection: 'row', alignItems: 'center' },
    badgeNotify: {
      width: 28,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      end: 0,
      backgroundColor: appcolor.danger,
      borderRadius: 16,
    },
    titleBadge: { fontSize: 11, color: appcolor.light },
    contentSummary: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemSummary: { alignItems: 'center', paddingHorizontal: 8 },
    valueQuantity: {
      fontSize: 28,
      fontWeight: fontWeightBold,
      color: appcolor.danger,
    },
    titleQuantity: { fontSize: 13, color: appcolor.dark },
    valueAmount: {
      fontSize: 28,
      fontWeight: fontWeightBold,
      color: appcolor.success,
    },
    titleAmount: { fontSize: 13, color: appcolor.dark },
    titleDashboardName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
      padding: 8,
      paddingBottom: 16,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewTop} />
      <View style={styles.contentMain}>
        <View style={styles.contentTitle}>
          <Text numberOfLines={1} style={styles.titleWelcome}>{`Xin chào, ${
            userinfo.fisrtName || userinfo.employeeName
          }`}</Text>
          <Text
            style={styles.titleEmployeeCode}
          >{`Mã ${userinfo?.employeeCode}`}</Text>
        </View>
        <View style={styles.contentButton}>
          <TouchableOpacity
            style={styles.buttonAction}
            onPress={handlerNotifyPress}
          >
            <SpiralIcon
              reverse
              size={20}
              color={appcolor.success}
              type="iconic"
              name="notifications"
            />
            {countNotification > 0 && (
              <View style={styles.badgeNotify}>
                <Text style={styles.titleBadge}>
                  {countNotification > 99 ? '99+' : countNotification}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonAction}
            onPress={handlerMenuPress}
          >
            <SpiralIcon
              reverse
              size={20}
              color={appcolor.primary}
              type="iconic"
              name="menu"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.contentSummary}
        onPress={handlerShowDashboard}
      >
        <View style={styles.itemSummary}>
          <Text style={styles.valueQuantity}>{itemSummary?.v1 || 0}</Text>
          <Text style={styles.titleQuantity}>{itemSummary?.l1}</Text>
        </View>
        <View style={styles.itemSummary}>
          <TouchableOpacity onPress={LoadData}>
            <SpiralIcon
              reverse
              name="trending-up"
              color={appcolor.primary}
              size={24}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.itemSummary}>
          <Text style={styles.valueAmount}>{itemSummary?.v2 || 0}</Text>
          <Text style={styles.titleAmount}>{itemSummary?.l2}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.titleDashboardName}>{itemSummary?.cname || ''}</Text>
    </View>
  );
};

export default HeaderView;
