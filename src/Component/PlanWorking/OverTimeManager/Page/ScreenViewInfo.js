import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import moment from 'moment';

export const ScreenViewInfo = ({ info, dataConfig }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemRequest, setItemRequest] = useState({
    typeId: 0,
    employeeId: 0,
    employeeCode: null,
    employeeName: null,
    shopId: 0,
    shopCode: null,
    shopName: null,
    shiftCode: null,
    shiftName: null,
    workingDay: null,
    timeFrom: null,
    timeTo: null,
    reasonId: 0,
    reasonName: null,
    reasonOther: null,
    totalTimeView: null,
  });

  useEffect(() => {
    setItemRequest(info);
  }, [info]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', backgroundColor: appcolor.primary },
    titleHead: {
      fontSize: 15,
      fontWeight: '700',
      color: appcolor.light,
      marginStart: 8,
    },
    titleContent: {
      fontSize: 12,
      fontWeight: Platform.OS == 'android' ? '700' : '600',
      color: appcolor.light,
      padding: 2,
      paddingHorizontal: 0,
    },
    viewCamera: {
      width: 42,
      height: 42,
      backgroundColor: appcolor.light,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 50,
      bottom: 0,
      end: 0,
    },
  });

  return (
    <View style={styles.mainContainer}>
      {dataConfig?.shopPermission?.length > 0 && (
        <Text style={styles.titleContent}>{`Cửa hàng: ${
          itemRequest?.shopName || ''
        } (${itemRequest?.shopCode || '-'})`}</Text>
      )}
      {dataConfig?.employeeList?.length > 0 && (
        <Text style={styles.titleContent}>{`Nhân viên: ${
          itemRequest.employeeName || ''
        } (${itemRequest.employeeCode || '-'})`}</Text>
      )}
      <Text style={styles.titleContent}>{`Ca OT: ${
        itemRequest?.shiftName || ''
      }`}</Text>
      <Text style={styles.titleContent}>{`Thời gian ${
        itemRequest.totalTimeView || ''
      }: ${
        itemRequest.workingDay &&
        moment(itemRequest.workingDay).format('DD/MM/YYYY')
      } (${
        itemRequest.timeFrom
          ? moment(itemRequest.timeFrom).format('HH:mm')
          : '00:00'
      } - ${
        itemRequest.timeTo
          ? moment(itemRequest.timeTo).format('HH:mm')
          : '00:00'
      })`}</Text>
      <Text style={styles.titleContent}>{`Lí do: ${
        itemRequest?.reasonName || ''
      } - ${itemRequest.reasonOther || ''}`}</Text>
    </View>
  );
};
