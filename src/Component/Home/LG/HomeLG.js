import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import HeaderView from './Page/HeaderView';
import { deviceHeight } from '../../../Themes/AppsStyle';
import DashboardAttendance from '../../Dashboard/Attendance/DashboardAttendance';
import FunctionView from './Page/FunctionView';

const HomeLG = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  useEffect(() => {
    return () => false;
  }, [isReloadData]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    contentDashboard: {
      width: '100%',
      height: deviceHeight / 5,
      backgroundColor: appcolor.primary,
      borderTopStartRadius: 50,
      borderTopEndRadius: 50,
      padding: 8,
      overflow: 'hidden',
    },
    contentFunction: { flex: 1, width: '100%' },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <HeaderView navigation={navigation} />
      <View style={styles.contentDashboard}>
        <DashboardAttendance navigation={navigation} />
      </View>
      <View style={styles.contentFunction}>
        <FunctionView navigation={navigation} isReloadData={isReloadData} />
      </View>
    </SafeAreaView>
  );
};

export default HomeLG;
