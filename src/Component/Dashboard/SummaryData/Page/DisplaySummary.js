import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { TableData } from '../Controls/TableData';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const DisplaySummary = ({ summaryData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataDisplay, setDataDisplay] = useState([]);

  const LoadData = async () => {
    await setDataDisplay(summaryData);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [summaryData]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    itemMain: { width: '100%' },
    contentMain: {
      width: '100%',
      backgroundColor: appcolor.light,
      borderRadius: 8,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 0 },
      shadowOpacity: 0.5,
      elevation: 3,
      overflow: 'hidden',
    },
    titleSummary: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
      padding: 8,
    },
  });
  const renderItem = (item, index) => {
    const dataSummary = JSON.parse(item.JsonData || '[]');
    return (
      <View key={`ds_${index}`} style={styles.itemMain}>
        <Text style={styles.titleSummary}>{item.DashboardName}</Text>
        <View style={styles.contentMain}>
          <TableData
            titleActual="Thực tế"
            titleTarget="Trưng bày"
            titlePercent="Tỉ lệ (%)"
            data={dataSummary}
          />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {dataDisplay !== null &&
        dataDisplay.length > 0 &&
        dataDisplay.map((item, index) => {
          return renderItem(item, index);
        })}
    </View>
  );
};
