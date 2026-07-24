import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import HeaderView from './Page/HeaderView';
import FunctionView from './Page/FunctionView';
import DashboardView from './Page/DashboardView';

const HomeHonor = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
    headerSafeArea: { backgroundColor: appcolor.primary },
    contentContainer: {
      flex: 1,
      backgroundColor: appcolor.surface,
    },
    contentFunction: { flex: 1, backgroundColor: 'red' },
  });

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={styles.headerSafeArea}
      >
        <HeaderView navigation={navigation} />
      </SafeAreaView>
      <View style={styles.contentContainer}>
        <DashboardView navigation={navigation} isReloadData={isReloadData} />
        <View style={styles.contentFunction}>
          <FunctionView navigation={navigation} isReloadData={isReloadData} />
        </View>
      </View>
    </View>
  );
};

export default HomeHonor;
