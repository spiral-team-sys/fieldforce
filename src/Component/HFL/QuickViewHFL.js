import React, { Fragment, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, FlatList, AppState } from 'react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { GetDataDashboard } from '../../Controller/DashboardController';
import { PercentView } from '../../Control/PercentView';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const tDay = new Date();
const totalDay = new Date(tDay.getFullYear(), tDay.getMonth() + 1, 0).getDate();
const currentDay = tDay.getDate();
const dayPecent = currentDay / totalDay;
const processWith =
  (deviceWidth / totalDay) * (currentDay < 4 ? 3 : currentDay);
export const QuickViewHFL = ({ navigation }) => {
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
    onLoad();
    return () => {
      subscription.remove();
    };
  }, []);
  const dayTemple = ({ item, index }) => {
    const _chart = JSON.parse(item?.chartData || '[{}]')[0];
    let cardColor = appcolor.info;
    if (dayPecent * 100 >= _chart.Percent) cardColor = appcolor.danger;
    else if (dayPecent * 100 < _chart.Percent) cardColor = appcolor.success;
    return (
      <View style={{ width: deviceWidth, padding: 7 }} key={index + '_wd9'}>
        <TouchableOpacity
          style={{ width: '100%', borderBottomRightRadius: 40 }}
          onPress={() =>
            item.pageName != null
              ? navigation.navigate('dashboardDetail', {
                listMonth: item?.listMonth,
              })
              : null
          }
        >
          <View
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: 210,
            }}
          >
            <PercentView actual={currentDay} target={totalDay} width="97%" />
            <View
              style={{
                position: 'absolute',
                right: -9,
                opacity: 0.25,
                borderTopLeftRadius: 120,
                borderBottomRightRadius: 20,
                backgroundColor: appcolor.light,
                height: 580,
                width: '58%',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                zIndex: 100,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexGrow: 1,
                  width: deviceWidth * 0.5,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    fontWeight: 'bold',
                    color: appcolor.dark,
                    fontSize: scaleSize(28),
                  }}
                >
                  {_chart.Unit}
                </Text>
                <Text
                  numberOfLines={7}
                  style={{
                    padding: 12,
                    color: appcolor.dark,
                    fontSize: scaleSize(16),
                  }}
                >
                  {item?.chartName}
                </Text>
              </View>
              <View style={{ height: 150, width: deviceWidth * 0.5 }}>
                <LottieView
                  autoPlay
                  style={{ height: '100%' }}
                  source={require('../../Themes/lotties/saleshome.json')}
                />
              </View>
            </View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                position: 'absolute',
                zIndex: 200,
                bottom: 0,
              }}
            >
              <TouchableOpacity style={{ flexGrow: 1, marginEnd: 3 }}>
                <View
                  style={{
                    backgroundColor: appcolor.danger,
                    borderRadius: 40,
                    flexDirection: 'row',
                  }}
                >
                  <SpiralIcon
                    color={appcolor.white}
                    containerStyle={{
                      paddingTop: 12,
                      paddingLeft: 12,
                      paddingBottom: 12,
                    }}
                    name="clock"
                    type="feather"
                  />
                  <Text
                    style={{
                      color: appcolor.white,
                      padding: 12,
                      color: appcolor.dark,
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}
                  >
                    {_chart.Target}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexGrow: 1, marginLeft: 3 }}>
                <View
                  style={{
                    backgroundColor: appcolor.info,
                    borderRadius: 40,
                    flexDirection: 'row',
                  }}
                >
                  <SpiralIcon
                    color={appcolor.white}
                    containerStyle={{
                      paddingTop: 12,
                      paddingLeft: 12,
                      paddingBottom: 12,
                    }}
                    name="dollar-sign"
                    type="feather"
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      color: appcolor.white,
                      padding: 12,
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}
                  >
                    {_chart.Actual}
                  </Text>
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
      <FlatList
        data={data}
        contentContainerStyle={{ padding: 7 }}
        pagingEnabled={true}
        nestedScrollEnabled={true}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={dayTemple}
        keyExtractor={(item, index) => index.toString()}
      />
    </Fragment>
  );
};
