import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { DashboardWorking } from './Dashboard/DashboardWorking';
import { DashboardStatus } from './Dashboard/DashboardStatus';

const type = {
  Menu: 'MENU',
  Working: 'WORKING',
  Status: 'STATUS',
};
export const SummaryOffice = ({ navigation, isLoadMain }) => {
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
  }, [isLoadMain]);
  const styles = StyleSheet.create({
    contentMain: { width: '100%', minHeight: 100, marginTop: 8 },
    cardView: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 8,
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
      {dataMenu?.match(type.Status) && (
        <View key={`db_status`} style={styles.cardView}>
          <DashboardStatus
            navigation={navigation}
            typeDashboard={type.Status}
            isLoadMain={isLoadMain}
          />
        </View>
      )}
      {dataMenu?.match(type.Working) && (
        <View key={`db_working`} style={styles.cardView}>
          <DashboardWorking
            navigation={navigation}
            typeDashboard={type.Working}
            isLoadMain={isLoadMain}
          />
        </View>
      )}
    </View>
  );
};
