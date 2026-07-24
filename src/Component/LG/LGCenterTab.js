import React, { Fragment, useState, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ViewBase,
} from 'react-native';
import {
  DataSummary,
  LGPLanbyWeekly,
} from '../../Controller/DashboardController';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceWidth, TODAY } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';
import moment from 'moment';
import { Button, Divider, Icon } from '@rneui/themed';
import { LoadingView } from '../../Control/ItemLoading/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardRouting } from '../../Content/Beko/DashboardRouting';
import { DashboardRoutingLG } from '../Dashboard/LG/DashboardRoutingLG';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const CALENDAR_DATA = 'CALENDAR_DATA';

const typeButton = {
  Menu: 'MENU',
  Attendant: 'ATTENDANT',
  SellOut: 'SELLOUT',
  SellIn: 'SELLIN',
  KPI5: 'KPI5',
  Target: 'TARGET',
  Routing: 'ROUTING',
};

export const LGCenterTab = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const _flatRef = useRef();
  const [dashboardItem, setDashboardItem] = useState(typeButton.Attendant);
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataRouting, setDataRouing] = useState({});
  const [dataMenu, setDataMenu] = useState([]);
  const onLoad = async (pageNum, date) => {
    const jsonStr = await AsyncStorage.getItem(CALENDAR_DATA);
    const localData = await JSON.parse(jsonStr);
    const _hour = parseInt(moment().format('H'));
    await setLoading(true);
    const filter = {
      pageNum: pageNum,
      planDate: date,
    };
    const sFilter = JSON.stringify(filter);
    // console.log(localData, "localData")//21 ko load
    const result =
      jsonStr === null || _hour !== 21
        ? await LGPLanbyWeekly(sFilter)
        : localData;
    if (result.statusId === 200) {
      let _temp = result?.data;
      if (_temp.length === 7) {
        await _temp.unshift({
          dayName: 'arrow-left',
          pageNum: -7,
          date: _temp[0].date,
        });
        await _temp.push({
          dayName: 'arrow-right',
          pageNum: 7,
          date: _temp[7].date,
        });
      }
      await setData(_temp);
      if (_temp.length > 5)
        await _flatRef.current.scrollToIndex({
          index: 4,
          animated: true,
          viewPosition: 0.5,
        });
      // /console.log(_temp, "load");
      //set local data
      await AsyncStorage.setItem(CALENDAR_DATA, JSON.stringify(result));
    }
    await setTimeout(() => {
      setLoading(false);
    }, 30000);
    await setLoading(false);
  };
  const LoadMenu = async () => {
    await DataSummary(typeButton.Menu, async mData => {
      await setDataMenu(mData);
      await setLoading(false);
    });
  };
  useEffect(() => {
    const _load = LoadMenu();
    return () => _load;
  }, []);
  useEffect(() => {
    const _load = onLoad(0, moment().format('YYYY-MM-DD'));
    return () => _load;
  }, []);
  const handlerSelectDashboard = async type => {
    if (loading) return;
    await setDashboardItem(type);
    if (type == 'ATTENDANT') {
      onLoad(0, moment().format('YYYY-MM-DD'));
    } else {
      await LoadDashboard(type);
    }
  };
  const LoadDashboard = async typeGroup => {
    await setLoading(true);
    typeGroup == typeButton.Attendant &&
      onLoad(0, moment().format('YYYY-MM-DD'));
    typeGroup == typeButton.Routing &&
      (await DataSummary(typeButton.Routing, async mData => {
        await setDataRouing(JSON.parse(mData[0].chartData)[0]);
      }));
    await setLoading(false);
  };
  const dayTemple = ({ item, index }) => {
    const dayInt = parseInt(moment(item.date, 'YYYY-MM-DD').format('YYYYMMDD'));
    const dayColor = dayInt === TODAY ? appcolor.redgray : appcolor.primary;
    return item.pageNum === 7 || item.pageNum === -7 ? (
      <TouchableOpacity
        onPress={() => onLoad(item.pageNum, item.date)}
        style={{ marginRight: 7 }}
      >
        <View
          style={{
            borderRadius: 50,
            alignContent: 'center',
            alignSelf: 'center',
            width: 50,
            padding: 12,
            justifyContent: 'center',
            height: 50,
            backgroundColor: appcolor.light,
          }}
        >
          <SpiralIcon
            color={appcolor.primary}
            type="font-awesome-5"
            size={20}
            name={item.dayName}
          />
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('attendanthistory', {
            planDate: moment(item.date).format('YYYY-MM-DD'),
          })
        }
        key={index + '_29'}
        style={{
          marginRight: 7,
          elevation: 5,
          borderRadius: 12,
        }}
      >
        <View
          style={{
            shadowOpacity: 0.8,
            width: deviceWidth / 7,
            height: dataMenu.length > 0 ? '94%' : '97%',
            shadowOffset: { width: 0.4, height: 4 },
            paddingTop: 7,
            borderRadius: 12,
            backgroundColor: dayColor,
            elevation: 5,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: appcolor.white,
              borderRadius: 20,
              minWidth: 33,
              padding: 2,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: appcolor.black,
                fontSize: scaleSize(9),
              }}
            >
              {item.dayName}
            </Text>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: appcolor.grayLight,
                width: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                fontSize: scaleSize(10),
                color: appcolor.black,
              }}
            >
              {moment(item.date).format('DD')}
            </Text>
          </View>
          <Text style={{ fontSize: scaleSize(11) }}>{item.target || '-'}</Text>
          <Text style={{ fontSize: scaleSize(9), color: appcolor.white }}>
            {item.l1}
          </Text>
          <Text style={{ fontSize: scaleSize(11) }}>{item.i}</Text>
          <Text style={{ fontSize: scaleSize(9), color: appcolor.white }}>
            {item.l2}
          </Text>
          <Text style={{ fontSize: scaleSize(11) }}>{item.o}</Text>
          <Text style={{ fontSize: scaleSize(11) }}>{item.actual}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    btnSelect: {
      backgroundColor: appcolor.dark,
      borderRadius: 10,
      padding: 5,
      margin: 5,
      marginEnd: 3,
      paddingStart: 8,
      paddingEnd: 8,
    },
    btnNonSelect: {
      backgroundColor: appcolor.light,
      borderRadius: 10,
      padding: 5,
      margin: 5,
      marginEnd: 3,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      paddingStart: 8,
      paddingEnd: 8,
    },
    titleView: { fontSize: 14, fontWeight: '600', color: appcolor.light },
    titleNonView: { fontSize: 14, fontWeight: '600', color: appcolor.dark },
  });
  const RenderButton = ({ }) => {
    const dataButtonMenu =
      dataMenu !== undefined && dataMenu !== null
        ? dataMenu[0]?.menuList || ''
        : '';
    return (
      <ScrollView
        pagingEnabled
        style={{ position: 'absolute', bottom: -15 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Button
            key={'attendant'}
            onPress={() => handlerSelectDashboard(typeButton.Attendant)}
            title="Attendant"
            type="solid"
            buttonStyle={
              dashboardItem == typeButton.Attendant
                ? styles.btnSelect
                : styles.btnNonSelect
            }
            titleStyle={
              dashboardItem == typeButton.Attendant
                ? styles.titleView
                : styles.titleNonView
            }
          />
          {dataButtonMenu.match(typeButton.Routing) && (
            <Button
              key={'routing'}
              onPress={() => handlerSelectDashboard(typeButton.Routing)}
              title="Routing"
              type="solid"
              buttonStyle={
                dashboardItem == typeButton.Routing
                  ? styles.btnSelect
                  : styles.btnNonSelect
              }
              titleStyle={
                dashboardItem == typeButton.Routing
                  ? styles.titleView
                  : styles.titleNonView
              }
            />
          )}
        </View>
      </ScrollView>
    );
  };
  return (
    <View style={{ height: '100%' }}>
      <LoadingView
        styles={{ zIndex: 100, position: 'absolute', top: '10%', left: '40%' }}
        isLoading={loading}
      />
      <View
        style={{
          backgroundColor: appcolor.primary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        <Fragment>
          {dashboardItem !== typeButton.Routing && (
            <FlatList
              data={data}
              ref={_flatRef}
              onScrollToIndexFailed={({ index, averageItemLength }) => {
                _flatRef.current?.scrollToOffset({ index: 4, animated: true });
              }}
              contentContainerStyle={{ alignItems: 'center' }}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10, marginLeft: 12, marginRight: 12 }}
              renderItem={dayTemple}
              keyExtractor={(item, index) => index.toString()}
              key="date"
            />
          )}
          {dashboardItem == typeButton.Routing &&
            !loading &&
            dataRouting !== null && (
              <DashboardRoutingLG navigation={navigation} data={dataRouting} />
            )}
          {dataMenu?.length > 0 && <RenderButton key={'buttondashboard'} />}
        </Fragment>
      </View>
    </View>
  );
};
