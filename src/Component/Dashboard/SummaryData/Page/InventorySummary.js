import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const InventorySummary = ({ summaryData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataInventory, setDataInventory] = useState([]);

  const LoadData = async () => {
    await setDataInventory(summaryData);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [summaryData]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    titleSummary: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
      padding: 8,
    },
    contentMain: {
      width: '100%',
      backgroundColor: appcolor.info,
      borderRadius: 8,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 0 },
      shadowOpacity: 0.5,
      elevation: 3,
      overflow: 'hidden',
    },
    itemView: { width: '100%', padding: 8, alignItems: 'center' },
    titleView: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      fontStyle: 'italic',
    },
    subTitleView: { fontSize: 15, fontWeight: '500', color: appcolor.light },
    titlePriceView: {
      fontSize: 24,
      fontWeight: 'bold',
      color: appcolor.yellowdark,
    },
    sellView: { width: '100%', padding: 8, alignItems: 'center' },
  });
  const renderItem = (item, index) => {
    const dataSummary = JSON.parse(item.JsonData || '[]');
    return (
      <View key={`is_${index}`} style={styles.itemMain}>
        <Text style={styles.titleSummary}>{item.DashboardName}</Text>
        <View style={styles.contentMain}>
          {dataSummary !== null &&
            dataSummary.length > 0 &&
            dataSummary.map((i, idx) => {
              return (
                <View key={`isi_${idx}`} style={styles.itemView}>
                  <Text style={styles.titleView}>{i.RTime}</Text>
                  {i.ALable2 && (
                    <View style={styles.sellView}>
                      <Text style={styles.subTitleView}>{i.ALable}</Text>
                      <Text style={styles.titlePriceView}>{i.ALable2}</Text>
                    </View>
                  )}
                  <Text style={styles.titleView}>
                    {i.QLable}
                    {i.AQuantity}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {dataInventory !== null &&
        dataInventory.length > 0 &&
        dataInventory.map((item, index) => {
          return renderItem(item, index);
        })}
    </View>
  );
};
