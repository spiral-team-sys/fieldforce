import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DashboardAttendant } from '../../Dashboard/Viessmann/DashboardAttendant';
import { DashboardSellOutVSM } from '../../Dashboard/Viessmann/DashboardSellOut';
import { DashboardRoute } from '../../Dashboard/Viessmann/DashboardRoute';
import { DataSummary } from '../../../Controller/DashboardController';
import { DashboardSellInVSM } from '../../Dashboard/Viessmann/DashboardSellIn';
import { DashboardAttendantTF } from '../../Dashboard/Tefal/DashboardAttendantTF';
import { DashboardSellOutTF } from '../../Dashboard/Tefal/DashboardSellOut';
import { DashboardSellInTF } from '../../Dashboard/Tefal/DashboardSellIn';
import { DashboardTargetTF } from '../../Dashboard/Tefal/DashBoardTargetTF';

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
export const SummarySharp = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState(null);

  const LoadMenu = async () => {
    await DataSummary(type.Menu, async mData => {
      if (mData !== null && mData.length > 0)
        await setDataMenu(mData[0].menuList);
    });
  };
  useEffect(() => {
    const _load = LoadMenu();
    return () => _load;
  }, []);
  const styles = StyleSheet.create({
    contentMain: { width: '100%', minHeight: 100, padding: 10 },
    cardView: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 35,
      marginBottom: 10,
      overflow: 'hidden',
      padding: 4,
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
      {dataMenu?.match(type.Attendant) && (
        <View key={`db_plan`} style={styles.cardView}>
          <DashboardAttendantTF
            navigation={navigation}
            typeDashboard={type.Attendant}
          />
        </View>
      )}
      {dataMenu?.match(type.SellOut) && (
        <View key={`db_sellout`} style={styles.cardView}>
          <DashboardSellOutTF
            navigation={navigation}
            typeDashboard={type.SellOut}
          />
        </View>
      )}
      {dataMenu?.match(type.SellIn) && (
        <View key={`db_sellin`} style={styles.cardView}>
          <DashboardSellInTF
            navigation={navigation}
            typeDashboard={type.SellIn}
          />
        </View>
      )}
      {dataMenu?.match(type.Routing) && (
        <View key={`db_route`} style={styles.cardView}>
          <DashboardRoute
            navigation={navigation}
            typeDashboard={type.Routing}
          />
        </View>
      )}
    </View>
  );
};
