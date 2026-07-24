import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Badge, Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { URLDEFAULT } from '../../../Core/URLs';
import { getLstMessengerNotSeen } from '../../../Controller/WorkController';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const HeaderTF = ({ navigation, onShowMenu }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [quantityMessage, setQuantityMessage] = useState(0);
  const LoadDataMessenger = async () => {
    let lstMessenger = await getLstMessengerNotSeen();
    if (Array.isArray(lstMessenger)) {
      setQuantityMessage(lstMessenger.length);
    }
  };
  const handlerPressMenu = async () => {
    await onShowMenu();
  };
  const handlerNotifyDetails = () => {
    navigation.navigate('Notification');
  };
  useEffect(() => {
    DeviceEventEmitter.addListener('RELOAD_NOTIFY_LIST', () =>
      LoadDataMessenger(),
    );
    const _messageList = LoadDataMessenger();
    return () => {
      DeviceEventEmitter.removeAllListeners('RELOAD_NOTIFY_LIST');
      _messageList;
    };
  }, []);

  const topPadding =
    Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 0;
  const styles = StyleSheet.create({
    mainContainer: {
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      paddingTop: topPadding,
    },
    titleHeader: {
      padding: 8,
      paddingBottom: 0,
      fontSize: 18,
      fontWeight: '700',
      color: appcolor.light,
      fontStyle: 'italic',
    },
    titleContent: {
      padding: 8,
      paddingTop: 0,
      fontSize: 13,
      fontWeight: '400',
      color: appcolor.light,
      fontStyle: 'italic',
    },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ flexDirection: 'row', padding: 8, alignItems: 'center' }}>
        <TouchableOpacity onPress={handlerPressMenu}>
          {userinfo.photo !== undefined && userinfo.photo !== null ? (
            <Avatar
              size={50}
              rounded
              source={{
                uri: userinfo.photo.includes('uploaded')
                  ? URLDEFAULT + userinfo.photo
                  : userinfo.photo || '',
              }}
            />
          ) : (
            <Avatar
              size={50}
              rounded
              icon={{
                name: 'user',
                type: 'font-awesome',
                color: appcolor.dark,
              }}
              containerStyle={{ backgroundColor: appcolor.light }}
            />
          )}
        </TouchableOpacity>

        <View style={{ width: '68%' }}>
          <Text style={styles.titleHeader}>{userinfo.employeeName}</Text>
          <Text style={styles.titleContent}>Code: {userinfo.employeeCode}</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: appcolor.light, borderRadius: 50 }}
          onPress={handlerNotifyDetails}
        >
          <SpiralIcon
            name="bell"
            type="font-awesome"
            size={18}
            color={appcolor.dark}
            style={{ margin: 5, padding: 5 }}
          />

          {/* material-community */}
          <Badge
            value={quantityMessage > 99 ? '99+' : quantityMessage}
            textStyle={{
              fontSize: 9,
              color: appcolor.white,
              fontWeight: '500',
            }}
            badgeStyle={{
              minWidth: 18,
              minHeight: 16,
              borderRadius: 25,
              backgroundColor: appcolor.success,
              borderColor: appcolor.light,
            }}
            containerStyle={{
              position: 'absolute',
              top: -5,
              right: quantityMessage > 99 ? -10 : -6,
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
