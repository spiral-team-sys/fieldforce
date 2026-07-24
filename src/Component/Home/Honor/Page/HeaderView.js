import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import useNotification from '../../../../Hooks/useNotification';
import { Avatar, Icon, Text } from '@rneui/base';
import { URLDEFAULT } from '../../../../Core/URLs';

const HeaderView = ({ navigation }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const { countNotification } = useNotification();

  // Handler
  const handlerNotifyPress = () => {
    navigation.navigate('Notification');
  };
  const handlerMenuPress = () => {
    navigation.openDrawer();
  };
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Chào buổi sáng,'
      : currentHour < 18
      ? 'Chào buổi chiều,'
      : 'Chào buổi tối,';

  // View
  const styles = StyleSheet.create({
    backgroundContainer: {
      width: '100%',
      backgroundColor: appcolor.light,
    },
    mainContainer: {
      width: '100%',
      paddingBottom: 20,
      backgroundColor: appcolor.primary,
      borderBottomStartRadius: 24,
      borderBottomEndRadius: 24,
    },
    topBar: {
      minHeight: 62,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      width: 38,
      height: 38,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    pageTitle: {
      flex: 1,
      marginStart: 12,
      color: appcolor.light,
      fontSize: 20,
      fontWeight: '800',
    },
    notifyButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentEmployeeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: 8,
    },
    avatarContainer: { position: 'relative' },
    viewPhoto: {
      backgroundColor: appcolor.light,
      borderWidth: 2,
      borderColor: appcolor.light,
    },
    employeeText: { flex: 1, marginStart: 14 },
    greeting: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 14,
      fontWeight: '600',
    },
    titleEmployee: {
      color: appcolor.light,
      fontSize: 18,
      fontWeight: '800',
      marginTop: 2,
    },
    subTitleEmployee: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 11,
      marginTop: 3,
    },
    badgeNotify: {
      minWidth: 17,
      height: 17,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 2,
      end: 1,
      backgroundColor: appcolor.danger,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: appcolor.primary,
    },
    titleBadge: { fontSize: 8, fontWeight: '700', color: appcolor.light },
  });

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.mainContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handlerMenuPress}
          >
            <SpiralIcon
              size={22}
              color={appcolor.primary}
              type="ionicon"
              name="menu"
            />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Trang chủ</Text>
          <TouchableOpacity
            style={styles.notifyButton}
            onPress={handlerNotifyPress}
          >
            <SpiralIcon
              size={25}
              color={appcolor.light}
              type="ionicon"
              name="notifications-outline"
            />
            {countNotification > 0 && (
              <View style={styles.badgeNotify}>
                <Text style={styles.titleBadge}>
                  {countNotification > 99 ? '99+' : countNotification}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.contentEmployeeInfo}>
          <View style={styles.avatarContainer}>
            {userinfo.photo ? (
              <Avatar
                rounded
                size={62}
                source={{ uri: `${URLDEFAULT}${userinfo.photo}` }}
                containerStyle={styles.viewPhoto}
              />
            ) : (
              <Avatar
                rounded
                size={62}
                icon={{
                  name: 'person',
                  type: 'ionicon',
                  color: appcolor.primary,
                }}
                containerStyle={styles.viewPhoto}
              />
            )}
          </View>
          <View style={styles.employeeText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text numberOfLines={1} style={styles.titleEmployee}>
              {userinfo.employeeName}
            </Text>
            {!!userinfo.employeeCode && (
              <Text style={styles.subTitleEmployee}>
                {userinfo.employeeCode}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HeaderView;
