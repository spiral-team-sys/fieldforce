import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { OOSAPI } from '../../../../API/OOSAPI';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/themed';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { ToastError } from '../../../../Core/Helper';

export const ScreenWareType = ({ actionType }) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const LoadData = async () => {
    try {
      await OOSAPI.GetListWareType(
        shopinfo.shopId,
        kpiinfo.id || 0,
        (mData, message) => {
          message && ToastError(message);
          setData(mData);
          actionType && actionType(mData !== null && mData.length > 0);
        },
      );
    } catch (error) {
      console.error('Lỗi: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      minHeight: 50,
      padding: 8,
      paddingBottom: 0,
    },
    itemMain: {
      padding: 8,
      backgroundColor: appcolor.primary,
      borderRadius: 8,
      marginEnd: 8,
    },
    titleHead: {
      width: '100%',
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    titleContent: {
      width: '100%',
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.surface,
      fontStyle: 'italic',
    },
  });

  const renderItem = ({ item, index }) => (
    <View key={`wti-${index}`} style={styles.itemMain}>
      <Text style={styles.titleHead}>{item.wareType}</Text>
      <Text style={styles.titleContent}>{item.wareHouseName}</Text>
      <Text style={styles.titleContent}>{item.wareHouseCode}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <ActivityIndicator
          size="small"
          color={appcolor.primary}
          style={{ marginTop: 8 }}
        />
      </View>
    );
  }

  return (
    data !== null &&
    data.length > 0 && (
      <View style={styles.mainContainer}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={data}
          estimatedItemSize={100}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    )
  );
};
