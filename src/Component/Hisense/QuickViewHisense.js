import React, { Fragment, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, FlatList, AppState } from 'react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { GetDataDashboard } from '../../Controller/DashboardController';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const tDay = new Date();
const totalDay = new Date(tDay.getFullYear(), tDay.getMonth() + 1, 0).getDate();
const currentDay = tDay.getDate();
const dayPecent = currentDay / totalDay;
const processWith =
  (deviceWidth / totalDay) * (currentDay < 4 ? 3 : currentDay);
export const QuickViewHisense = ({ navigation }) => {
  const [data, setData] = useState([{ name: 1 }, { name: 2 }]);
  const [loading, setLoading] = useState(false);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const onLoad = async () => {
    await GetDataDashboard(result => {
      setData(result);
      // console.log(result);
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
    const _load = onLoad();
    return () => {
      _load;
      subscription.remove();
    };
  }, []);
  const dayTemple = ({ item, index }) => {
    const _chart = JSON.parse(item?.chartData || '[{}]')[0];
    let cardColor = appcolor.info;
    if (dayPecent * 100 >= _chart?.Percent) cardColor = appcolor.danger;
    else if (dayPecent * 100 < _chart?.Percent) cardColor = appcolor.success;
    return (
      <View style={{ width: deviceWidth * 0.96 }} key={index + '_wd9'}>
        <TouchableOpacity
          style={{ borderBottomRightRadius: 40 }}
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
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: deviceHeight * 0.26,
            }}
          >
            <View
              style={{
                position: 'absolute',
                right: -20,
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
                marginTop: 30,
                justifyContent: 'center',
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
                  {_chart?.Unit}
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
                    {_chart?.Target}
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
                    {_chart?.Actual}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: appcolor.grey,
                left: -20,
                position: 'absolute',
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                top: 12,
              }}
            >
              <View style={{ width: deviceWidth, flexDirection: 'row' }}>
                <View
                  style={{
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    height: 28,
                    backgroundColor: appcolor.grey,
                    width: '96%',
                  }}
                >
                  <View
                    style={{
                      textAlignVertical: 'center',
                      borderTopRightRadius: 20,
                      borderBottomRightRadius: 20,
                      fontSize: 12,
                      color: appcolor.light,
                      width:
                        processWith > deviceWidth - 40
                          ? deviceWidth * 0.95
                          : processWith,
                      backgroundColor: cardColor,
                      height: 28,
                      justifyContent: 'center',
                    }}
                  ></View>
                  <Text
                    style={{
                      color: appcolor.white,
                      textAlignVertical: 'center',
                      marginLeft: 20,
                      position: 'absolute',
                      width: '100%',
                      fontSize: scaleSize(16),
                    }}
                  >
                    {((currentDay / totalDay) * 100).toFixed(2) > 100
                      ? 100
                      : ((currentDay / totalDay) * 100).toFixed(2)}{' '}
                    %
                  </Text>
                </View>
              </View>
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
        contentContainerStyle={{ width: '100%', padding: 7 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={dayTemple}
        keyExtractor={(item, index) => index.toString()}
      />
    </Fragment>
  );
};
