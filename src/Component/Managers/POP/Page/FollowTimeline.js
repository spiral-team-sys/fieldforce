import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

const FollowTimeline = ({ itemMain = {} }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const colorTimeline = appcolor.primary + 20;
  const [stepOrder, setStepOrder] = useState([]);

  const LoadData = () => {
    setStepOrder(JSON.parse(itemMain.Step || '[]'));
  };

  useEffect(() => {
    LoadData();
  }, [itemMain]);

  const styles = StyleSheet.create({
    mainContainer: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    viewHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleOrder: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    viewStatus: { borderRadius: 20, backgroundColor: colorTimeline },
    titleOrderStatus: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.primary,
      padding: 6,
      paddingHorizontal: 16,
    },
    viewTimeline: { width: '100%', alignItems: 'center' },
    line: {
      width: '100%',
      height: 2,
      backgroundColor: appcolor.grayLight,
      position: 'absolute',
      justifyContent: 'center',
      top: 0,
      bottom: 0,
      end: 0,
      start: 0,
    },
    itemContainer: { marginTop: 24 },
    iconStyle: {
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: colorTimeline,
      width: 32,
      height: 32,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      paddingStart: 1,
    },
    viewDelivery: { justifyContent: 'center', alignItems: 'center' },
    timeLine: {
      width: '100%',
      height: 2,
      backgroundColor: appcolor.primary,
      position: 'absolute',
      top: 16,
      bottom: 0,
      end: 0,
      start: 0,
    },
    titleStatusOrder: {
      textAlign: 'center',
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      paddingVertical: 4,
    },
    subTitleStatusOrder: {
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    viewTitle: { width: 95, marginVertical: 8 },
  });

  const renderItem = ({ item, index }) => {
    return (
      <View key={index} style={styles.itemContainer}>
        <View style={styles.viewDelivery}>
          <View
            style={{
              ...styles.timeLine,
              backgroundColor:
                item.isStepValue == 1 ? appcolor.primary : colorTimeline,
            }}
          />
          <View
            style={{
              ...styles.iconStyle,
              backgroundColor:
                item.isStepValue == 1 ? appcolor.primary : appcolor.light,
            }}
          >
            <SpiralIcon
              type="ionicon"
              name="checkmark"
              color={item.isStepValue == 1 ? appcolor.white : 'transparent'}
              size={18}
            />
          </View>
        </View>
        <View style={styles.viewTitle}>
          <Text
            style={{
              ...styles.titleStatusOrder,
              color: item.isStepValue == 1 ? appcolor.dark : appcolor.greylight,
            }}
          >
            {item.TitleOrder}
          </Text>
          <Text style={styles.subTitleStatusOrder}>{item.CreatedDate}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewHead}>
        <Text style={styles.titleOrder}>Trạng thái đơn hàng</Text>
        <View style={styles.viewStatus}>
          <Text style={styles.titleOrderStatus}>{itemMain.OrderStatus}</Text>
        </View>
      </View>
      <View style={styles.viewTimeline}>
        <FlatList
          keyExtractor={(_item, index) => index.toString()}
          pagingEnabled
          horizontal
          data={stepOrder}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default FollowTimeline;
