import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import { deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle';
import useNotification from '../../../../Hooks/useNotification';
import { DataSummary } from '../../../../Controller/DashboardController';

const HeaderView = ({ navigation }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const { countNotification } = useNotification();
  const [itemSummary, setItemSummary] = useState({});

  const LoadData = async () => {
    await DataSummary('ATTENDANT', result => {
      setItemSummary(result?.[0] || {});
    });
  };

  const handlerNotifyPress = () => {
    navigation.navigate('Notification');
  };
  const handlerMenuPress = () => {
    navigation && navigation.openDrawer();
  };
  const handlerShowDashboard = () => {
    navigation.navigate('attendanthistory');
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    contentMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    contentTitle: { alignContent: 'space-around' },
    contentButton: { flexDirection: 'row', justifyContent: 'center' },
    titleWelcome: {
      color: appcolor.light,
      fontWeight: fontWeightBold,
      fontSize: 16,
    },
    titleEmployeeCode: {
      fontSize: 12,
      fontWeight: '500',
      fontStyle: 'italic',
      color: appcolor.grayLight,
    },
    viewTop: {
      borderTopRightRadius: deviceWidth / 3,
      opacity: 0.3,
      backgroundColor: appcolor.light,
      width: '50%',
      position: 'absolute',
      top: -60,
      bottom: -10,
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
    titleQuantity: { fontSize: 13, color: appcolor.light },
    valueAmount: {
      fontSize: 28,
      fontWeight: fontWeightBold,
      color: appcolor.success,
    },
    titleAmount: { fontSize: 13, color: appcolor.light },
    titleDashboardName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.light,
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
          <Text style={styles.titleWelcome}>{`Xin chào, ${
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
              color={appcolor.primary}
              type="ionicon"
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
              type="ionicon"
              name="menu"
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.titleDashboardName}>{itemSummary?.cname || ''}</Text>
    </View>
  );
};

export default HeaderView;
