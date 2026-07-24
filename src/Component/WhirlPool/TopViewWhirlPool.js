import React, { Fragment, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, FlatList, AppState } from 'react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';
import { Icon } from '@rneui/themed';
import { ColorRand } from '../../Core/Helper';
import { GetDataDashboard } from '../../Controller/DashboardController';
import { DashboardRouting } from '../../Content/Beko/DashboardRouting';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const tDay = new Date();
const totalDay = new Date(tDay.getFullYear(), tDay.getMonth() + 1, 0).getDate();
const currentDay = tDay.getDate();
const dayPecent = currentDay / totalDay;
const processWith =
  (deviceWidth / totalDay) * (currentDay < 4 ? 3 : currentDay);
export const TopViewWhirlPool = ({ navigation }) => {
  const [data, setData] = useState([{ name: 1 }, { name: 2 }]);
  const [loading, setLoading] = useState(false);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const onLoad = async () => {
    await GetDataDashboard(result => {
      setData(result);
      // console.log(userinfo);
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
    let cardColor = appcolor.primary;
    if (dayPecent * 100 >= _chart.Percent) cardColor = appcolor.danger;
    else if (dayPecent * 100 < _chart.Percent) cardColor = appcolor.success;
    return (
      <View key={index + '_wd9'}>
        <TouchableOpacity
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
              shadowOpacity: 0.8,
              width: deviceWidth / 1.17,
              height: '96%',
              shadowOffset: { width: 0.4, height: 4 },
              paddingTop: 7,
              borderRadius: 20,
              backgroundColor: index === 0 ? cardColor : ColorRand(index),
              marginStart: 20,
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: appcolor.dark }}>{item?.chartName}</Text>
            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
              <SpiralIcon
                color={appcolor.primary}
                reverse
                name="dollar-sign"
                size={30}
                type="font-awesome-5"
              />
              <View style={{ flexGrow: 1 }}>
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: 'bold',
                    fontSize: scaleSize(30),
                  }}
                >
                  {_chart.Target || 0}
                </Text>
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    color: appcolor.surface,
                    fontStyle: 'italic',
                  }}
                >
                  Chỉ tiêu
                </Text>
                <Text style={{ fontSize: scaleSize(30), fontWeight: 'bold' }}>
                  {_chart.Actual || 0}
                </Text>
                <Text
                  style={{
                    fontSize: scaleSize(12),
                    color: appcolor.surface,
                    fontStyle: 'italic',
                  }}
                >
                  Đã đạt
                </Text>
              </View>
              <SpiralIcon name="arrow-right" size={20} type="font-awesome-5" />
              <View>
                <Text
                  style={{
                    fontSize: scaleSize(30),
                    fontWeight: 'bold',
                    color: appcolor.white,
                    justifyContent: 'center',
                  }}
                >
                  {(_chart.Percent || '0') + '%'}{' '}
                </Text>
                <Text
                  style={{
                    color: appcolor.white,
                    justifyContent: 'center',
                    paddingEnd: 7,
                  }}
                >
                  {_chart.RTime || ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                opacity: 0.25,
                borderTopLeftRadius: 120,
                borderBottomRightRadius: 20,
                backgroundColor: appcolor.light,
                height: 180,
                width: '50%',
              }}
            />
            <View
              style={{
                backgroundColor: appcolor.light,
                left: 0,
                position: 'absolute',
                bottom: 22,
              }}
            >
              <View style={{ width: deviceWidth - 40, flexDirection: 'row' }}>
                <View
                  style={{
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    height: 28,
                    backgroundColor: appcolor.light,
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
                        processWith > deviceWidth - 40 ? '93%' : processWith,
                      backgroundColor:
                        currentDay > 20
                          ? appcolor.danger
                          : currentDay > 12
                            ? appcolor.warning
                            : appcolor.success,
                      height: 28,
                    }}
                  ></View>
                  <Text
                    style={{
                      color: appcolor.dark,
                      textAlignVertical: 'center',
                      height: 28,
                      marginLeft: 20,
                      position: 'absolute',
                      width: '100%',
                      fontSize: scaleSize(16),
                      top: 5,
                      bottom: 5,
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
      {userinfo.groupType === 'MER' ? (
        <View style={{ height: 240, paddingEnd: 0 }}>
          {data.length > 0 && (
            <DashboardRouting
              navigation={navigation}
              data={data.length > 0 ? data[0] : {}}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={{
            alignItems: 'center',
            height: 240,
            paddingEnd: 20,
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={dayTemple}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </Fragment>
  );
};
