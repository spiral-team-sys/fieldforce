import React, { useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { isValidField } from '../../../../Utils/validateData';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import InputFields from '../../../../Control/Input/InputFields';
import { optionConfirm } from '../../../../Core/Utility';
import moment from 'moment';

const ByDateItem = ({ item, index }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const inputRef = useRef();

  const handlerChangeStatus = () => {
    item.status = item.status == 1 ? 0 : 1;
    item.confirmPlan =
      item.status !== item.defaultStatus ? 3 : item.defaultConfirmPlan;
    setMutate(e => !e);
  };

  const onChangeText = text => {
    item.note = text;
    setMutate(e => !e);
  };

  const onChangeFullNote = () => {
    const options = [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: () => {
          DeviceEventEmitter.emit('PLAN_UPDATE_LIST', {
            note: item.note,
            type: 'NOTE',
          });
        },
      },
    ];
    optionConfirm(
      'Xác nhận',
      'Bạn có muốn áp dụng ghi chú này cho tất cả cửa hàng khác không ?',
      options,
    );
  };

  const statusColor =
    item.status == 1
      ? item.disabledStatus == 1
        ? appcolor.greylight
        : appcolor.primary
      : appcolor.greylight;
  const statusIcon = item.status == 1 ? 'checkbox' : 'square-outline';
  const styles = StyleSheet.create({
    itemMain: {
      flexDirection: 'row',
      width: '100%',
      padding: 8,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 1,
    },
    contentTitle: { flex: 1, marginStart: 8 },
    subTitleTime: {
      fontSize: 10,
      fontWeight: '500',
      color: appcolor.greylight,
      fontStyle: 'italic',
      textAlign: 'right',
      marginEnd: 8,
      marginTop: 4,
    },
    subTitleStatus: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.greylight,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 4,
    },
    contentStatus: { alignSelf: 'center', padding: 8 },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    viewStatusTime: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

  return (
    <View key={index} style={styles.itemMain}>
      <TouchableOpacity
        style={styles.contentStatus}
        onPress={handlerChangeStatus}
        disabled={item.disabledStatus == 1}
      >
        <SpiralIcon
          type="ionicon"
          name={statusIcon}
          color={statusColor}
          size={24}
        />
      </TouchableOpacity>
      <View style={styles.contentTitle}>
        {/* Info */}
        <Text style={styles.titleName}>{`${index + 1}. ${item.shopName}`}</Text>
        <Text style={styles.subTitleName}>{`Code: ${item.shopCode}`}</Text>
        {isValidField(item.address) && (
          <Text style={styles.subTitleName}>{`ĐC: ${item.address}`}</Text>
        )}
        <Text
          style={styles.subTitleName}
        >{`Ca làm việc: ${item.shiftType} - ${item.shiftName}`}</Text>
        {isValidField(item.attendantTime) && (
          <Text style={styles.subTitleName}>{`ĐC: ${item.address}`}</Text>
        )}
        {item.disabledStatus == 1 && isValidField(item.note) && (
          <Text style={styles.subTitleName}>{`Ghi chú: ${item.note}`}</Text>
        )}
        {/* Note */}
        <InputFields
          ref={inputRef}
          index={index}
          isScrollToIndex
          visible={item.disabledStatus == 0}
          value={item.note}
          placeholder="Nhập ghi chú"
          iconLeft="chatbox-outline"
          iconRight={item.note && 'checkmark-done-outline'}
          onRightPress={onChangeFullNote}
          onChangeText={onChangeText}
        />
        {/* Status & Time */}
        <View style={styles.viewStatusTime}>
          <Text
            style={[
              styles.subTitleStatus,
              { color: appcolor[item.colorConfirmStatus] },
            ]}
          >
            {isValidField(item.confirmStatus) ? `${item.confirmStatus}` : ''}
          </Text>
          <View>
            {!isValidField(item.updatedDate) &&
              isValidField(item.createdDate) && (
                <Text style={styles.subTitleTime}>{`Tạo bởi ${
                  item.createdByName
                }: ${moment(item.createdDate).fromNow()}`}</Text>
              )}
            {isValidField(item.updatedDate) && (
              <Text style={styles.subTitleTime}>{`Câp nhật ${moment(
                item.updatedDate,
              ).fromNow()}`}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ByDateItem;
