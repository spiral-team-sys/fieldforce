import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  AppState,
  InteractionManager,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Themes/AppsStyle';
import LottieView from 'lottie-react-native';
import { Text } from '@rneui/themed';
import useApp from '../../Hooks/useApp';
import { Image } from '@rneui/base';
import {
  checkMultiplePermission,
  checkNotificationsPermission,
  PERMISSTION_LIST,
} from '../../Utils/permissions';
import {
  AppNameBuild,
  aquaApp,
  bekoApp,
  casperApp,
  cuckooApp,
  daikinApp,
  dsmHvnApp,
  hafeleApp,
  hpiApp,
  lgApp,
  officeApp,
  psvApp,
  sharpApp,
  signifyApp,
  tefalApp,
  viessmannApp,
} from '../../Core/URLs';

const WelcomeScreen = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { isLoggedIn } = useApp();
  //
  const LoadData = async () => {
    await checkNotificationsPermission();
    await checkMultiplePermission(PERMISSTION_LIST);
  };

  const handlerNavigate = () => {
    if (isLoggedIn) navigation.replace('Home');
    else navigation.navigate('Login');
  };

  useEffect(() => {
    let isMounted = true;
    let didRequestPermissions = false;

    const requestPermissionsWhenActive = () => {
      if (!isMounted || didRequestPermissions) return;
      didRequestPermissions = true;
      InteractionManager.runAfterInteractions(() => {
        if (isMounted) {
          LoadData();
        }
      });
    };

    if (AppState.currentState === 'active') {
      requestPermissionsWhenActive();
    }

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        requestPermissionsWhenActive();
      }
    });
    const timer = setTimeout(handlerNavigate, 2000);

    return () => {
      isMounted = false;
      subscription.remove();
      clearTimeout(timer);
    };
  }, [isLoggedIn]);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: appcolor.primary,
    },
    lottieContainer: { height: '30%' },
    titleWelcome: {
      width: '100%',
      textAlign: 'center',
      fontSize: 40,
      color: appcolor.light,
    },
    infoCompany: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flex: 1,
      alignItems: 'center',
    },
    titleHead: { color: appcolor.light, fontSize: 15, fontWeight: '700' },
    titleSubText: {
      color: appcolor.light,
      fontSize: 12,
      fontWeight: '300',
      textAlign: 'center',
    },
    titleCompany: {
      textAlign: 'center',
      fontSize: 15,
      color: appcolor.light,
      fontWeight: 'bold',
    },
    addressCompany: {
      fontSize: 11,
      textAlign: 'center',
      color: appcolor.light,
      fontWeight: '500',
    },
  });

  const byAccount = () => {
    switch (AppNameBuild) {
      case lgApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome.json')}
          />
        );
      case hpiApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome_hpi.json')}
          />
        );
      case psvApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome4.json')}
          />
        );
      case cuckooApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/screencuckoo.json')}
          />
        );
      case casperApp:
      case sharpApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/casper_welcome.json')}
          />
        );
      case bekoApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome_bk.json')}
          />
        );
      case hafeleApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/hfl_welcome.json')}
          />
        );
      case daikinApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/daikin_welcome.json')}
          />
        );
      case signifyApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/cargill_welcome.json')}
          />
        );
      case aquaApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome_aqua.json')}
          />
        );
      case viessmannApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome_vsm.json')}
          />
        );
      case tefalApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome_tefal.json')}
          />
        );
      case officeApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            loop={false}
            speed={3}
            source={require('../../Themes/lotties/welcome_office.json')}
          />
        );
      case dsmHvnApp:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            loop={true}
            source={require('../../Themes/lotties/welcome_hvn.json')}
          />
        );
      default:
        return (
          <LottieView
            autoPlay
            style={styles.lottieContainer}
            source={require('../../Themes/lotties/welcome2.json')}
          />
        );
    }
  };
  const defaultView = () => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        {byAccount()}
        <Text style={styles.titleWelcome}>Welcome</Text>
        <View style={styles.infoCompany}>
          <Text style={styles.titleHead}>Công ty TNHH Sức bật</Text>
          <Text style={styles.titleSubText}>
            27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
          </Text>
        </View>
      </SafeAreaView>
    );
  };
  const officeView = () => {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Image
          source={require('../../Themes/Images/office/logo_spi.png')}
          resizeMethod="scale"
          resizeMode="contain"
          placeholderStyle={{ backgroundColor: 'transparent' }}
          style={{ width: deviceWidth, height: 50, marginBottom: 12 }}
        />
        <ActivityIndicator size="small" color={appcolor.light} />
      </SafeAreaView>
    );
  };
  return AppNameBuild == officeApp ? officeView() : defaultView();
};
export default WelcomeScreen;
