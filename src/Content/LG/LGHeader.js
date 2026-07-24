import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text, Badge, Icon } from '@rneui/themed';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { useSelector } from 'react-redux';
import { LGSummaryTop } from '../../Controller/DashboardController';

export const LGHeader = ({
  iconRight,
  leftFunc,
  rightFunc,
  navigation,
  countNotify,
  info,
}) => {
  const topPadding =
    Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 0;
  const [data, setData] = useState({});
  const { userinfo, appcolor } = useSelector(state => state.GAppState);
  const onLoadData = async () => {
    const result = await LGSummaryTop();
    if (result.statusId === 200) {
      const _list = (await result.data) || [];
      _list?.length > 0 ? setData(_list[0]) : setData({});
      // console.log(_list, "topload")
    }
  };
  useEffect(() => {
    onLoadData();
    //Clear Up
    return () => false;
  }, []);

  const onSelectDashboard = () => {
    if (data.dashboardName == 'Sellout') {
      navigation.navigate('dashboardDetail');
    } else if (data.dashboardName == 'SellIn') {
      navigation.navigate('dashboardhomesellin', {
        detailDashboard: info || {},
        listMonth: info?.listMonth,
        titlePage: 'Chi tiết',
      });
    }
  };
  return (
    <View style={{ paddingTop: topPadding }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: deviceWidth,
        }}
      >
        <View
          style={{
            borderBottomRightRadius: 70,
            borderTopRightRadius: 200,
            opacity: 0.5,
            backgroundColor: '#bfc2c7',
            width: '47%',
            marginTop: -60,
            height: 400,
            position: 'absolute',
          }}
        />
        <View
          style={{ flex: 1, alignContent: 'space-around', paddingLeft: 20 }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: appcolor.primary,
              fontWeight: '400',
              fontSize: scaleSize(18),
            }}
          >
            Xin chào, {userinfo.fisrtName}
          </Text>
          <Text
            style={{
              fontSize: scaleSize(12),
              fontStyle: 'italic',
              color: appcolor.dark,
            }}
          >
            Mã {userinfo?.employeeCode}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {typeof rightFunc === 'function' && (
            <TouchableOpacity
              onPress={rightFunc}
              style={{
                position: 'relative',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {typeof iconRight === 'string' && (
                <SpiralIcon
                  reverse
                  size={20}
                  color="#450"
                  type="iconic"
                  name={'notifications'}
                />
              )}
              {typeof iconRight === 'string' && countNotify > 0 && (
                <Badge
                  value={countNotify > 99 ? '99+' : countNotify}
                  textStyle={{ fontSize: scaleSize(10), color: appcolor.white }}
                  badgeStyle={{
                    height: 22,
                    minWidth: 22,
                    borderRadius: 20,
                    left: 0,
                  }}
                  status="error"
                  containerStyle={{ position: 'absolute', top: 5, right: -5 }}
                  onPress={rightFunc}
                />
              )}
            </TouchableOpacity>
          )}
          {typeof leftFunc === 'function' && (
            <TouchableOpacity onPress={leftFunc}>
              <SpiralIcon
                reverse
                name="menu"
                color={appcolor.primary}
                type="iconic"
                size={20}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => onSelectDashboard()}>
        <View
          style={{
            height: 50,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: deviceWidth,
          }}
        >
          <View style={{ width: '35%', paddingRight: 10, marginLeft: 10 }}>
            <Text
              style={{
                fontSize: scaleSize(30),
                fontWeight: '600',
                color: appcolor.red,
                textAlign: 'right',
              }}
            >
              {data?.v1 || 0}{' '}
            </Text>
            {data.l2 !== undefined && (
              <Text
                style={{
                  fontSize: scaleSize(13),
                  textAlign: 'right',
                  color: appcolor.dark,
                }}
              >
                {data.l1}{' '}
              </Text>
            )}
          </View>
          <View style={{ width: '15%', flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => onLoadData()}>
              <SpiralIcon
                reverse
                name="trending-up"
                color={appcolor.success}
                size={22}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: '45%',
              marginRight: 10,
              paddingLeft: 10,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: scaleSize(30),
                fontWeight: '600',
                color: appcolor.success,
              }}
            >
              {data?.v2 || 0}{' '}
            </Text>
            {data.l2 !== undefined && (
              <Text style={{ fontSize: scaleSize(13), color: appcolor.dark }}>
                {data.l2}{' '}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <View style={{ width: '100%', alignItems: 'center', padding: 3 }}>
        <Text style={{ color: appcolor.dark, fontSize: scaleSize(12) }}>
          {data?.cname || ''}
        </Text>
      </View>
    </View>
  );
};
