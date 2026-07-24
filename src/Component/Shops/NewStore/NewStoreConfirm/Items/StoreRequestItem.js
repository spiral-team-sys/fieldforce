import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../StoreRequestUtils';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const StoreRequestItem = ({ item, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const rawStatus = item.Status || item.status;
  const statusName =
    item.titleConfirm ||
    item.TitleConfirm ||
    item.StatusName ||
    item.statusName ||
    STATUS_LABELS[rawStatus] ||
    rawStatus ||
    'Chờ xác nhận';
  const statusColor = appcolor[STATUS_COLORS[statusName]] || appcolor.primary;
  const rawRequestType = (
    item.RequestType ||
    item.requestType ||
    item.typeWaiting ||
    item.TypeWaiting ||
    ''
  )
    .toString()
    .toUpperCase();
  const requestType =
    item.RequestTypeName ||
    item.requestTypeName ||
    REQUEST_TYPE_LABELS[rawRequestType] ||
    rawRequestType ||
    '-';
  const shopName =
    item.ShopName ||
    item.shopName ||
    item.StoreName ||
    item.storeName ||
    item.shopNameVN ||
    '-';
  const createdDate =
    item.CreatedDate || item.createdDate || item.CreateDate || item.createDate;

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 8,
      marginVertical: 5,
      padding: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    title: {
      flex: 1,
      color: appcolor.blacklight,
      fontSize: 14,
      fontWeight: '700',
    },
    status: {
      color: statusColor,
      fontSize: 12,
      fontWeight: '700',
      marginStart: 8,
    },
    content: { color: appcolor.dark, fontSize: 13, marginTop: 3 },
    date: {
      color: appcolor.greylight,
      fontSize: 12,
      marginTop: 8,
      textAlign: 'right',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.header}>
        <SpiralIcon
          name="store"
          type="font-awesome-5"
          size={15}
          color={statusColor}
        />
        <Text style={styles.title} numberOfLines={1}>
          {' '}
          {requestType}
        </Text>
        <Text style={styles.status} numberOfLines={1}>
          {statusName}
        </Text>
      </View>
      <Text style={styles.content} numberOfLines={2}>
        {shopName}
      </Text>
      <Text style={styles.date}>
        {createdDate ? moment(createdDate).format('DD/MM/YYYY HH:mm') : '-'}
      </Text>
    </TouchableOpacity>
  );
};

export default StoreRequestItem;
