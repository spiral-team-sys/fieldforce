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
import { URLDEFAULT } from '../../Core/URLs';
import { getLstMessengerNotSeen } from '../../Controller/WorkController';
import { deviceWidth } from '../../Core/Utility';

export const HeaderSharp = ({ navigation, onShowMenu }) => {
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
      backgroundColor: appcolor.transparent,
      alignItems: 'center',
      paddingTop: topPadding,
      flex: 1,
      justifyContent: 'center',
    },
    titleCode: {
      paddingBottom: 8,
      paddingTop: 0,
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.greylight,
      fontStyle: 'italic',
    },
    titleName: {
      paddingTop: 8,
      paddingBottom: 0,
      fontSize: 12,
      fontWeight: '400',
      color: appcolor.primary,
      fontStyle: 'italic',
    },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View
        style={{
          flexDirection: 'row',
          margin: 3,
          justifyContent: 'space-between',
          width: deviceWidth,
        }}
      >
        <View
          style={{
            minHeight: 54,
            flexDirection: 'row',
            alignItems: 'center',
            width: '70%',
          }}
        >
          <TouchableOpacity
            style={{
              marginLeft: 10,
              borderWidth: 0.4,
              borderColor: appcolor.primary,
              backgroundColor: appcolor.light,
              borderRadius: 16,
              height: 48,
              width: 48,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handlerPressMenu}
          >
            <SpiralIcon
              name="bars"
              type="font-awesome"
              size={20}
              color={appcolor.primary}
              style={{ margin: 5, padding: 5 }}
            />
          </TouchableOpacity>
          <View style={{ width: '55%', height: '100%', marginLeft: 10 }}>
            <Text style={styles.titleName}>{userinfo.employeeName}</Text>
            <Text style={styles.titleCode}>{userinfo.employeeCode}</Text>
          </View>
        </View>
        <View
          style={{
            width: '30%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingRight: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              borderWidth: 0.4,
              borderColor: appcolor.primary,
              borderRadius: 25,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 8,
              }}
              onPress={handlerNotifyDetails}
            >
              <SpiralIcon
                name="bell"
                type="font-awesome"
                size={16}
                color={appcolor.primary}
                style={{ margin: 5, padding: 5 }}
              />
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
                  top: 0,
                  right: quantityMessage > 99 ? -10 : -6,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ zIndex: 1000 }}
              onPress={() => navigation.navigate('Profile')}
            >
              {userinfo.photo !== undefined && userinfo.photo !== null ? (
                <Avatar
                  size={45}
                  rounded
                  source={{
                    uri: userinfo.photo.includes('uploaded')
                      ? URLDEFAULT + userinfo.photo
                      : userinfo.photo || '',
                  }}
                />
              ) : (
                <Avatar
                  size={45}
                  rounded
                  icon={{
                    name: 'user',
                    type: 'font-awesome',
                    color: appcolor.primary,
                  }}
                  containerStyle={{ backgroundColor: appcolor.darklight }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
