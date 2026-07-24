import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import CustomListView from '../../../Control/Custom/CustomListView';

export const SummaryPlanMonth = ({ dataSummaryPlan }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataSummary, setDataSummary] = useState([]);

  const LoadData = () => {
    const itemData = dataSummaryPlan[0] || {};
    setDataSummary(JSON.parse(itemData.dataSummary || '[]'));
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataSummaryPlan]);

  const styles = StyleSheet.create({
    summaryMain: {
      flexDirection: 'row',
      padding: 5,
      borderRadius: 5,
      alignItems: 'center',
    },
    valueSummary: {
      fontSize: 32,
      fontWeight: '800',
      color: appcolor.helper,
      textAlign: 'center',
    },
    titleSummary: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.blacklight,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    contentSummary: {
      padding: 5,
      width: deviceWidth / 5.35,
      backgroundColor: appcolor.surface,
      marginEnd: 4,
    },
  });

  const renderItem = ({ item }) => {
    return (
      <View style={styles.contentSummary}>
        <Text
          style={{ ...styles.valueSummary, color: appcolor[item.colorItem] }}
        >{`${item.valueItem || '0'}`}</Text>
        <Text style={styles.titleSummary}>{`${
          item.titleItem || 'Chưa có thông tin'
        }`}</Text>
      </View>
    );
  };
  return (
    dataSummary !== null &&
    dataSummary.length > 0 && (
      <CustomListView
        horizontal
        data={dataSummary}
        extraData={dataSummary}
        renderItem={renderItem}
        endView={{ paddingEnd: 0 }}
      />
    )
  );
};
