import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import _ from 'lodash';

export const ScreenMain = ({ title, dashboardData, onShowDetail }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  //
  const LoadData = () => {
    setData(dashboardData);
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [dashboardData]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    itemMain: { width: '100%', padding: 8 },
    viewTitleChart: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    titleChart: {
      width: '90%',
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      fontSize: 15,
      marginHorizontal: 8,
    },
    titleHead: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
    titleContent: {
      fontSize: 12,
      color: appcolor.placeholderText,
      fontWeight: '500',
    },
    detailView: { position: 'absolute', end: 16, bottom: 0 },
    titleDetails: {
      fontSize: 12,
      color: appcolor.placeholderText,
      fontWeight: '500',
      fontStyle: 'italic',
      textAlign: 'right',
      paddingEnd: 16,
    },
  });
  const renderItem = ({ item, index }) => {
    const _listProducts = _.split(item.OOSProducts, ',').filter(
      product => product.trim() !== '',
    );
    return (
      <View key={`ism_r-${index}`} style={styles.itemMain}>
        <Text
          style={styles.titleHead}
        >{`${item.GroupMain}: ${_listProducts.length}`}</Text>
        <Text style={styles.titleContent}>{item.OOSProducts}</Text>
      </View>
    );
  };
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={onShowDetail}>
      <View style={styles.viewTitleChart}>
        <SpiralIcon
          color={appcolor.primary}
          type="font-awesome-5"
          name="chart-bar"
          size={23}
        />
        <Text style={styles.titleChart}> {title}</Text>
      </View>
      <Text style={styles.titleDetails}>{`Chi tiết -->`}</Text>
      <FlashList
        keyExtractor={(_item, index) => index.toString()}
        estimatedItemSize={100}
        data={data}
        extraData={[data]}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </TouchableOpacity>
  );
};
