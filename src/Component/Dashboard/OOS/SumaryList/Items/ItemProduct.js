import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';

export const ItemProduct = ({ item, index, onLayout, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  const onShowStore = () => {
    onPress(item);
  };
  //
  const styles = StyleSheet.create({
    itemContainer: {
      padding: 8,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 0 },
      shadowOpacity: 0.3,
    },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleContent: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    viewStatus: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: item.colorHighlight || appcolor.light,
      borderRadius: 50,
      position: 'absolute',
      top: 0,
      end: 0,
    },
    viewTitle: { width: '100%', marginBottom: 8 },
    viewSummary: { width: '100%', flexDirection: 'row' },
    viewContentValue: {
      width: '100%',
      flexDirection: 'row',
      padding: 5,
      paddingTop: 0,
    },
    viewContentTitle: {
      width: '100%',
      flexDirection: 'row',
      padding: 5,
      paddingBottom: 0,
    },
    viewProgress: {
      width: '100%',
      height: 16,
      flexDirection: 'row',
      borderRadius: 3,
      overflow: 'hidden',
    },
    valueShopDisplay: {
      width: `${100 / 3}%`,
      textAlign: 'left',
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    valuePercentOOS: {
      width: `${100 / 3}%`,
      textAlign: 'center',
      color: item.colorHighlight,
      fontSize: 13,
      fontWeight: fontWeightBold,
    },
    valueShopOOS: {
      width: `${100 / 3}%`,
      textAlign: 'right',
      color: item.colorHighlight,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    titleShopDisplay: {
      width: `50%`,
      textAlign: 'left',
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    titleShopOOS: {
      width: `50%`,
      textAlign: 'right',
      color: item.colorHighlight,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    viewDetailTitle: { position: 'absolute', top: 0, end: 0 },
    titleDetails: {
      fontSize: 11,
      color: appcolor.greylight,
      textDecorationLine: 'underline',
    },
  });
  //
  return (
    <TouchableOpacity
      key={`it-pd-${index}`}
      onLayout={onLayout}
      style={styles.itemContainer}
      onPress={onShowStore}
    >
      <View style={styles.viewTitle}>
        <Text style={styles.titleHead}>{`${index + 1}. ${
          item.productName
        }`}</Text>
        <Text style={styles.titleContent}>{`Code: ${item.productCode}`}</Text>
        <View style={styles.viewDetailTitle}>
          <Text style={styles.titleDetails}>{`Chi tiết -->`}</Text>
        </View>
      </View>
      {/* // Value */}
      <View style={styles.viewContentValue}>
        <Text style={styles.valueShopDisplay}>{item.shopDisplay}</Text>
        <Text style={styles.valuePercentOOS}>{item.percentOOS}%</Text>
        <Text style={styles.valueShopOOS}>{item.shopOOS}</Text>
      </View>
      {/* // Progress */}
      <View style={styles.viewProgress}>
        <View
          style={{
            width: `${100 - item.percentOOS}%`,
            backgroundColor: appcolor.surface,
          }}
        />
        <View
          style={{
            width: `${item.percentOOS}%`,
            backgroundColor: item.colorHighlight,
          }}
        />
      </View>
      {/* // Title */}
      <View style={styles.viewContentTitle}>
        <Text style={styles.titleShopDisplay}>{item.titleShopDisplay}</Text>
        <Text style={styles.titleShopOOS}>{item.titleShopOOS}</Text>
      </View>
    </TouchableOpacity>
  );
};
