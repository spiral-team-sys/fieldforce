import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ChooseItem } from '../Control/ChooseItem';
import { Text } from '@rneui/themed';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const ItemWarehouse = ({ item, index, onChange }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    return () => {
      isMounted = false;
    };
  }, [item]);

  const styles = StyleSheet.create({
    itemMain: {
      width: '100%',
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
      alignItems: 'flex-end',
    },
    titleHead: {
      width: '100%',
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleContent: {
      width: '100%',
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    infoView: { width: '100%' },
  });

  return (
    <View key={`islw-${index}`} style={styles.itemMain}>
      <View style={styles.infoView}>
        <Text style={styles.titleHead}>{`${index + 1}. ${
          item.WareHouseName
        }`}</Text>
        <Text
          style={styles.titleContent}
        >{`Mã kho: ${item.WareHouseCode}`}</Text>
        <Text style={styles.titleContent}>{`ĐC: ${item.Address}`}</Text>
      </View>
      <ChooseItem
        key={`ci-ist-${index}`}
        dataItem={item.WareHouseType}
        item={item}
        handlerChange={onChange}
      />
    </View>
  );
};
