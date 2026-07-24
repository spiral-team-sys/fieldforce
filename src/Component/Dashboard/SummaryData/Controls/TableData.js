import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../../../Core/Helper';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const TableData = ({ data, titleActual, titleTarget, titlePercent }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataTable, setDataTable] = useState([]);

  const LoadData = async () => {
    await setDataTable(data);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [data]);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      backgroundColor: appcolor.light,
      padding: 8,
    },
    itemMain: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.greylight,
    },
    itemTitle: { width: '22%' },
    titleView: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      fontStyle: 'italic',
      textAlign: 'center',
      color: appcolor.greylight,
    },
  });
  const renderHeader = () => {
    return (
      <View style={{ ...styles.itemMain, paddingBottom: 8, paddingTop: 0 }}>
        <View style={{ ...styles.itemTitle, width: '34%', paddingStart: 8 }} />
        <View style={styles.itemTitle}>
          <Text
            style={{
              ...styles.titleView,
              color: appcolor.success,
              fontSize: 13,
            }}
          >
            {titleActual || 'Actual'}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{ ...styles.titleView, color: appcolor.red, fontSize: 13 }}
          >
            {titleTarget || 'Target'}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{ ...styles.titleView, color: appcolor.info, fontSize: 13 }}
          >
            {titlePercent || 'Percent'}
          </Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const borderBottom = index + 1 == dataTable.length ? 0 : 0.5;
    return (
      <View
        key={`td_${index}`}
        style={{ ...styles.itemMain, borderBottomWidth: borderBottom }}
      >
        <View style={{ ...styles.itemTitle, width: '34%', paddingStart: 8 }}>
          <Text
            style={{
              ...styles.titleView,
              textAlign: 'left',
              color: appcolor.greylight,
              fontSize: 13,
            }}
          >
            {item.GroupName}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text style={{ ...styles.titleView, color: appcolor.success }}>
            {item.ActualValue > 0 ? formatNumber(item.ActualValue, ',') : 0}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text style={{ ...styles.titleView, color: appcolor.red }}>
            {item.TargetValue > 0 ? formatNumber(item.TargetValue, ',') : 0}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{ ...styles.titleView, color: appcolor.info }}
          >{`${item.PercentValue}%`}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {renderHeader()}
      <FlashList
        keyExtractor={(item, _index) => item.GroupId.toString()}
        estimatedItemSize={80}
        data={dataTable}
        extraData={[dataTable]}
        renderItem={renderItem}
      />
    </View>
  );
};
