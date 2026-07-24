import { Avatar, BackgroundImage, Divider, Icon, Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { URLDEFAULT } from '../../../Core/URLs';
import { deviceHeight } from '../../../Themes/AppsStyle';
import { EmployeeAPI } from '../../../API/EmployeeAPI';
import Geolocation from '@react-native-community/geolocation';
import { LOCATION_INFO } from '../../../Utils/LocationInfo';
import { formatNumber } from '../../../Core/Helper';
import DeviceInfo from 'react-native-device-info';

const CheckInScreen = ({ navigation }) => {
  const { appcolor, userinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [isCheckIn, setCheckIn] = useState(false);
  const [messageError, setMessageError] = useState(null);

  const LoadData = async () => {
    await EmployeeAPI.CheckInYEP('DATA', null, async isSuccess => {
      if (isSuccess) {
        setCheckIn(true);
        setLoading(false);
      } else {
        await onCheckLocation();
      }
    });
  };
  const onReloadChecking = async () => {
    await setMessageError(null);
    await setCheckIn(false);
    await setLoading(true);
    await onCheckLocation();
  };
  const onCheckLocation = async () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const pointCheck = JSON.parse(kpiinfo.reportItem || '{}');
        const distance = LOCATION_INFO.getDistance(
          latitude,
          longitude,
          pointCheck.latitudeCheck,
          pointCheck.longitudeCheck,
          true,
        );
        if (distance > pointCheck.distance) {
          setMessageError(
            `Bạn đang đứng xa hơn vị trí CHECK-IN "${formatNumber(
              distance,
              ',',
            )}m"\nVui lòng di chuyển đến gần hơn "${formatNumber(
              pointCheck.distance,
              ',',
            )}m" và thử lại`,
          );
          setLoading(false);
        } else {
          await onCheckIn({ latitude, longitude });
        }
      },
      error => {
        setMessageError(error.message);
        setLoading(false);
      },
      {
        // enableHighAccuracy: true,
        // timeout: 15000,
        // distanceFilter: 50,
        // fastestInterval: 5000,
      },
    );
  };
  const onCheckIn = async info => {
    const itemUpload = {
      ...info,
      reportId: kpiinfo.id,
      deviceId: await DeviceInfo.getUniqueId(),
    };
    await EmployeeAPI.CheckInYEP('UPLOAD', itemUpload, async isSuccess => {
      setCheckIn(isSuccess);
      setLoading(false);
    });
  };
  const onBack = () => {
    navigation.goBack();
  };
  useEffect(() => {
    LoadData();
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.dark },
    mainBackground: {
      flex: 1,
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
    },
    contentContainer: {
      flex: 1,
      position: 'absolute',
      top: 48,
      alignItems: 'center',
      width: '80%',
    },
    transparentViewContent: {
      flex: 1,
      backgroundColor: appcolor.black,
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      opacity: 0.8,
      margin: 16,
      borderRadius: 24,
      zIndex: 0,
    },
    viewContent: {
      width: '100%',
      height: deviceHeight / 1.9,
      position: 'absolute',
      bottom: 38,
      start: 0,
      end: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      overflow: 'hidden',
    },
    iconLogoView: {
      borderRadius: 128,
      width: 216,
      height: 216,
      overflow: 'hidden',
      backgroundColor: appcolor.white,
      marginBottom: 16,
      borderWidth: 3,
      borderColor: appcolor.light,
    },
    viewFooter: {
      alignItems: 'center',
      position: 'absolute',
      bottom: 32,
      start: 0,
      end: 0,
    },
    buttonClose: {
      width: 128,
      height: 38,
      borderRadius: 48,
      borderWidth: 1,
      borderColor: appcolor.light,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleWelcome: { fontSize: 26, color: appcolor.light, textAlign: 'center' },
    titleName: {
      fontSize: 20,
      color: appcolor.light,
      fontWeight: 'bold',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    subTitleName: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: '400',
      textAlign: 'center',
      margin: 8,
    },
    titleClose: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    lineWelcome: { width: 200, height: 2, marginBottom: 8 },
    titleError: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.light,
      textAlign: 'center',
      paddingHorizontal: 16,
      marginTop: 16,
    },
    iconActionView: {
      borderRadius: 56,
      width: 56,
      height: 56,
      borderWidth: 1,
      borderColor: appcolor.surface,
      overflow: 'hidden',
      padding: 16,
      backgroundColor: appcolor.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewAction: { alignItems: 'center', justifyContent: 'center', margin: 16 },
    viewError: { alignItems: 'center' },
  });
  const actionView = () => {
    if (isLoading)
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={appcolor.light} />
          <Text style={styles.subTitleName}>{`Đang xác nhận thông tin`}</Text>
        </View>
      );
    if (messageError !== null && messageError.length > 0) {
      return (
        <View style={styles.viewError}>
          <TouchableOpacity
            style={styles.iconActionView}
            onPress={onReloadChecking}
          >
            <SpiralIcon
              type="ionicon"
              name="refresh"
              color={appcolor.primary}
              size={20}
            />
          </TouchableOpacity>
          <Text style={styles.titleError}>{messageError}</Text>
        </View>
      );
    }
    return null;
  };
  const resultView = () => {
    return (
      <View style={styles.contentContainer}>
        <Avatar
          source={{ uri: `${URLDEFAULT}${userinfo.photo}` }}
          containerStyle={styles.iconLogoView}
        />
        <Text style={styles.titleWelcome}>{`WELCOME`}</Text>
        <Divider color={appcolor.light} style={styles.lineWelcome} />
        <Text style={styles.titleName}>{userinfo.employeeName}</Text>
      </View>
    );
  };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.mainContainer}>
      <BackgroundImage
        style={[styles.mainBackground]}
        resizeMode="cover"
        resizeMethod="resize"
        source={require('../../../Themes/Images/office/bgyep.jpg')}
      />
      <View style={styles.viewContent}>
        <View style={styles.transparentViewContent}>
          <BackgroundImage
            style={styles.mainBackground}
            resizeMode="cover"
            resizeMethod="resize"
            source={require('../../../Themes/Images/office/congulation.png')}
          />
        </View>
        {isLoading || !isCheckIn ? actionView() : resultView()}
        <View style={styles.viewFooter}>
          <TouchableOpacity onPress={onBack} style={styles.buttonClose}>
            <Text style={styles.titleClose}>
              {!isCheckIn ? `Quay lại` : `Đóng`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CheckInScreen;
