import React, { Fragment, useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  AppState,
  DeviceEventEmitter,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { FlashList } from '@shopify/flash-list';
import { GetDataDashboard } from '../../../../Controller/DashboardController';
import { deviceWidth, scaleSize } from '../../../../Themes/AppsStyle';
import { PercentView } from '../../../../Control/PercentView';

const tDay = new Date();
const totalDay = new Date(tDay.getFullYear(), tDay.getMonth() + 1, 0).getDate();
const currentDay = tDay.getDate();
const dayPecent = currentDay / totalDay;
const processWith =
  (deviceWidth / totalDay) * (currentDay < 4 ? 3 : currentDay);
export const QuickViewCuckoo = ({ navigation, isReloadData }) => {
  const [data, setData] = useState([{ name: 1 }, { name: 2 }]);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const onLoad = async () => {
    await GetDataDashboard(async result => {
      await setData(result);
      console.log(result);
    });
  };

  const handlerDownloadData = () => {
    DeviceEventEmitter.emit('REDOWNLOAD_DATA');
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        onLoad(); //load lai du lieu chart khi mo app
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    const _load = onLoad();
    return () => {
      _load;
      subscription.remove();
    };
  }, []);
  const styles = StyleSheet.create({
    viewItemStyle: {
      width: deviceWidth,
      height: '100%',
      backgroundColor: appcolor.primary,
      borderBottomStartRadius: 50,
      borderBottomEndRadius: 50,
    },
    buttonItemStyle: {
      width: '100%',
      height: '100%',
      borderBottomRightRadius: 50,
      borderBottomLeftRadius: 50,
    },
    percentStyle: { paddingHorizontal: 30 },
    itemContentStyle: {
      width: '100%',
      height: '80%',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    viewPlaceHolder: {
      position: 'absolute',
      right: -9,
      opacity: 0.25,
      borderTopLeftRadius: 120,
      borderBottomRightRadius: 20,
      backgroundColor: appcolor.light,
      height: 580,
      width: '58%',
    },
    contentChartStyle: {
      flexDirection: 'row',
      zIndex: 100,
      alignItems: 'center',
    },
    leftContent: {
      flexGrow: 1,
      width: deviceWidth * 0.5,
      alignItems: 'center',
    },
    titleContent: {
      fontSize: scaleSize(14),
      fontWeight: 'bold',
      color: appcolor.white,
      fontSize: scaleSize(22),
    },
    viewLottie: { height: 120, width: deviceWidth * 0.5 },
    itemBottom: { flexGrow: 1, marginEnd: 3 },
    footerStyle: {
      alignItems: 'center',
      flexDirection: 'row',
      position: 'absolute',
      zIndex: 200,
      bottom: 10,
      paddingHorizontal: 20,
    },
    bottomLeft: {
      backgroundColor: appcolor.danger,
      borderRadius: 40,
      flexDirection: 'row',
    },
    iconStyle: { paddingTop: 12, paddingLeft: 12, paddingBottom: 12 },
    titleBottomItem: {
      textAlign: 'center',
      color: appcolor.white,
      padding: 12,
      fontWeight: 'bold',
      fontSize: 20,
    },
  });
  const dayTemple = ({ item, index }) => {
    const _chart = JSON.parse(item?.chartData || '[{}]')[0];
    let cardColor = appcolor.info;
    if (dayPecent * 100 >= _chart.Percent) cardColor = appcolor.danger;
    else if (dayPecent * 100 < _chart.Percent) cardColor = appcolor.success;
    return (
      <View style={styles.viewItemStyle} key={index + '_wd9'}>
        <TouchableOpacity
          style={styles.buttonItemStyle}
          onPress={() =>
            item.pageName != null
              ? navigation.navigate('dashboardDetail', {
                  listMonth: item?.listMonth,
                })
              : null
          }
        >
          <View style={styles.percentStyle}>
            <PercentView actual={currentDay} target={totalDay} width="100%" />
          </View>
          <View style={[styles.itemContentStyle]}>
            <View style={styles.contentChartStyle} />

            <View style={styles.contentChartStyle}>
              <View style={styles.leftContent}>
                <Text style={styles.titleContent}>{_chart.Unit}</Text>
                <Text numberOfLines={7} style={styles.titleContent}>
                  {item?.chartName}
                </Text>
              </View>
              <View style={styles.viewLottie}>
                <LottieView
                  style={{ height: '100%' }}
                  autoPlay
                  source={require('../../../../Themes/lotties/saleshome.json')}
                />
              </View>
            </View>

            <View style={styles.footerStyle}>
              <TouchableOpacity style={styles.itemBottom}>
                <View style={styles.bottomLeft}>
                  <SpiralIcon
                    color={appcolor.white}
                    containerStyle={styles.iconStyle}
                    name="clock"
                    type="feather"
                  />
                  <Text style={styles.titleBottomItem}>{_chart.Target}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.itemBottom}>
                <View
                  style={{
                    backgroundColor: appcolor.info,
                    borderRadius: 40,
                    flexDirection: 'row',
                  }}
                >
                  <SpiralIcon
                    color={appcolor.white}
                    containerStyle={styles.iconStyle}
                    name="dollar-sign"
                    type="feather"
                  />
                  <Text style={styles.titleBottomItem}>{_chart.Actual}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <Fragment>
      <FlashList
        data={data}
        pagingEnabled={true}
        nestedScrollEnabled={true}
        estimatedItemSize={120}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={dayTemple}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handlerDownloadData} />
        }
      />
    </Fragment>
  );
};
