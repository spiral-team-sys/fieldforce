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

export const HeaderToshiba = ({ navigation, onShowMenu }) => {
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
      justifyContent: 'flex-end',
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
    homeMain: {
      backgroundColor: appcolor.light,
      borderRadius: 50,
      height: 48,
      width: 48,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowOpacity: 0.5,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 1, height: 1 },
    },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <View style={{ width: '15%', paddingLeft: 16 }}>
          <TouchableOpacity style={styles.homeMain} onPress={handlerPressMenu}>
            <SpiralIcon
              name="home"
              type="font-awesome"
              size={20}
              color={appcolor.primary}
              style={{ margin: 5, padding: 5 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ width: '85%', paddingHorizontal: 16 }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 50,
              borderWidth: 1,
              borderColor: appcolor.primary,
              alignItems: 'center',
            }}
          >
            <View
              style={{ width: '15%', height: '100%', justifyContent: 'center' }}
            >
              <TouchableOpacity
                style={{ minHeight: 48, minWidth: 48, padding: 1 }}
                onPress={() => navigation.navigate('Profile')}
              >
                {userinfo.photo !== undefined && userinfo.photo !== null ? (
                  <Avatar
                    size={48}
                    rounded
                    source={{
                      uri: userinfo.photo.includes('uploaded')
                        ? URLDEFAULT + userinfo.photo
                        : userinfo.photo || '',
                    }}
                  />
                ) : (
                  <Avatar
                    size={48}
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
            <View style={{ width: '55%', height: '100%' }}>
              <Text style={styles.titleName}>{userinfo.employeeName}</Text>
              <Text style={styles.titleCode}>{userinfo.employeeCode}</Text>
            </View>
            <View
              style={{
                width: '20%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handlerNotifyDetails}
              >
                <SpiralIcon
                  name="bell"
                  type="font-awesome"
                  size={18}
                  color={appcolor.primary}
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
                    backgroundColor: appcolor.primary,
                    borderColor: appcolor.light,
                    borderWidth: 1,
                  }}
                  containerStyle={{
                    position: 'absolute',
                    top: 0,
                    right: quantityMessage > 99 ? -6 : 0,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
