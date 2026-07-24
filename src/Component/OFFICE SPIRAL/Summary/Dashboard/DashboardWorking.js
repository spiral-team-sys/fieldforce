import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../../Controller/DashboardController';
import { Text } from '@rneui/themed';
import { COLOR } from '../../Control/UtilityOffice';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const DashboardWorking = ({ typeDashboard, isLoadMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataDashboard, setDataDashboard] = useState([]);

  const LoadDashBoard = async () => {
    await DataSummary(typeDashboard, async mData => {
      await setDataDashboard(mData);
    });
  };
  useEffect(() => {
    LoadDashBoard();
  }, [isLoadMain]);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      backgroundColor: appcolor.light,
      padding: 8,
    },
    titleHeader: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      fontStyle: 'italic',
      color: appcolor.primary,
    },
    contentMain: { padding: 8 },
    titleView: {
      fontSize: 14,
      fontWeight: '700',
      fontStyle: 'italic',
      padding: 8,
      paddingStart: 0,
    },
    valueView: { fontSize: 13, fontWeight: '700' },
    percentView: {
      fontSize: 12,
      fontWeight: '700',
      position: 'absolute',
      end: 5,
      top: -16,
    },
    lineProgress: {
      width: '100%',
      height: 8,
      backgroundColor: appcolor.grey,
      borderRadius: 8,
      overflow: 'hidden',
    },
    valueLineProgressView: { height: 8, borderRadius: 8, paddingEnd: 12 },
  });

  const renderItem = ({ item, index }) => {
    return (
      <View key={`iomm_${index}`}>
        <Text style={styles.titleView}>{item.titlePage}</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <Text
            style={{ ...styles.percentView, color: COLOR.ColorRand(index) }}
          >
            {`${item.actualValue}`} / {`${item.percentValue}%`}
          </Text>
        </View>
        <View style={styles.lineProgress}>
          <View
            style={{
              ...styles.valueLineProgressView,
              width: `${item.percentValue}%`,
              backgroundColor: COLOR.ColorRand(index),
            }}
          />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleHeader}>Thống kê chấm công</Text>
      <View style={styles.contentMain}>
        <CustomListView
          data={dataDashboard}
          renderItem={renderItem}
          bottomView={{ paddingBottom: 0 }}
        />
      </View>
    </View>
  );
};
