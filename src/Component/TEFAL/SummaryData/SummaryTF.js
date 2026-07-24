import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { deviceHeight, deviceWidth } from '../../../Core/Utility';
import { DashboardAttendantTF } from '../../Dashboard/Tefal/DashboardAttendantTF';
import { DashboardSellInTF } from '../../Dashboard/Tefal/DashboardSellIn';
import { DashboardSellOutTF } from '../../Dashboard/Tefal/DashboardSellOut';
import { DashBoardTargetTF } from '../../Dashboard/Tefal/DashBoardTargetTF';
import { DashboardRoutingMain } from '../../Dashboard/Tefal/DashboardRoutingMain';

const type = {
  Menu: 'MENU',
  Attendant: 'ATTENDANT',
  SellOut: 'SELLOUT',
  SellIn: 'SELLIN',
  KPI5: 'KPI5',
  Target: 'TARGET',
  Routing: 'ROUTING',
  SSub: 'SSUB',
  TargetBySr: 'TARGETBYSR',
  TargetBy: 'TARGETBY',
};
// TARGETSELLTHRU
// TARGETSELLIN
// TARGETNEWSTORE
// TARGETSELLTHRU
// AVERAGEBYNEWSTORE
const WIDTH_DB_DEFAULT = deviceWidth * 0.88;
const WIDTH_OTHER = (deviceWidth - WIDTH_DB_DEFAULT) / 2;
const WIDTH_DEFAULT = 6;
// const ALTURA_BACKDROP = height * 0.5;

export const SummaryTF = ({ navigation, refreshing }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState([]);
  const LoadMenu = async () => {
    await DataSummary(type.Menu, async mData => {
      if (mData !== null && mData.length > 0) {
        let arr = mData[0].menuList.split(',');
        await setDataMenu(arr);
      }
    });
  };
  useEffect(() => {
    const _load = LoadMenu();
    return () => {
      _load;
    };
  }, [refreshing]);
  const styles = StyleSheet.create({
    contentMain: { width: '100%', height: '100%', overflow: 'hidden' },
    cardView: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 10,
      overflow: 'hidden',
    },
    titleMain: {
      padding: 8,
      fontSize: 18,
      fontWeight: '700',
      alignSelf: 'center',
      color: appcolor.dark,
    },
  });
  return (
    <View style={styles.contentMain}>
      <ViewDashboard
        key={'ViewDashboard'}
        dataMenu={dataMenu}
        navigation={navigation}
      />
    </View>
  );
};

const ViewDashboard = ({ dataMenu, navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const scrollX = useRef(new Animated.Value(0)).current;
  return (
    <Animated.FlatList
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      )}
      showsHorizontalScrollIndicator={false}
      horizontal={true}
      snapToAlignment="start"
      contentContainerStyle={{
        paddingTop: 30,
        paddingHorizontal: WIDTH_OTHER,
      }}
      snapToInterval={WIDTH_DB_DEFAULT}
      decelerationRate={0}
      scrollEventThrottle={16}
      data={dataMenu}
      keyExtractor={useCallback((_, index) => index.toString(), [])}
      renderItem={({ item, index }) => {
        const inputRange = [
          (index - 1) * WIDTH_DB_DEFAULT,
          index * WIDTH_DB_DEFAULT,
          (index + 1) * WIDTH_DB_DEFAULT,
        ];

        const scrollY = scrollX.interpolate({
          inputRange,
          outputRange: [0, -20, 0],
        });
        return (
          <View key={'Dashboard' + index} style={{ width: WIDTH_DB_DEFAULT }}>
            <Animated.View
              style={{
                marginHorizontal: WIDTH_DEFAULT,
                padding: WIDTH_DEFAULT,
                borderRadius: 34,
                overflow: 'hidden',
                backgroundColor: appcolor.light,
                alignItems: 'center',
                transform: [{ translateY: scrollY }],
              }}
            >
              {/* <RenderItemDashboard item={item} /> */}
              {/* Attendant */}
              {JSON.parse(item) == type.Attendant && (
                <View key={'Attendant_' + index} style={{ flex: 1 }}>
                  <DashboardAttendantTF
                    navigation={navigation}
                    typeDashboard={type.Attendant}
                  />
                </View>
              )}
              {/* Sell-In Daily */}
              {JSON.parse(item) == type.SellIn && (
                <View key={'SellIn_' + index} style={{ width: '100%' }}>
                  <DashboardSellInTF
                    navigation={navigation}
                    typeDashboard={type.SellIn}
                  />
                </View>
              )}
              {/* Sell-Out Daily */}
              {JSON.parse(item) == type.SellOut && (
                <View key={'SellOut_' + index}>
                  <DashboardSellOutTF
                    navigation={navigation}
                    typeDashboard={type.SellOut}
                  />
                </View>
              )}
              {JSON.parse(item) == type.Routing && (
                <View key={'Routing_' + index} style={{ width: '100%' }}>
                  <DashboardRoutingMain
                    navigation={navigation}
                    typeDashboard={type.Routing}
                  />
                </View>
              )}
              {JSON.parse(item) !== type.SellOut &&
                JSON.parse(item) !== type.SellIn &&
                JSON.parse(item) !== type.Attendant &&
                JSON.parse(item) !== type.Routing && (
                  <View
                    key={'Dashboard_' + index}
                    style={{ width: '100%', height: deviceHeight / 3.5 }}
                  >
                    <DashBoardTargetTF
                      navigation={navigation}
                      typeDashboard={JSON.parse(item)}
                    />
                  </View>
                )}
            </Animated.View>
          </View>
        );
      }}
    />
  );
};
