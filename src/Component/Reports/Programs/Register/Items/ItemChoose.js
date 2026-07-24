import { Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { formatNumber } from '../../../../../Core/Helper';

const ItemChoose = ({
  dataRegister,
  type,
  title,
  data = [],
  keyValue,
  isEdit = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);

  const LoadData = () => {
    if (type == 'DEALER' && data.length == 1) {
      const itemDealer = data[0] || {};
      dataRegister.DealerId = itemDealer.DealerId;
      dataRegister.DealerName = itemDealer.DealerName;
      dataRegister.ItemDealer = itemDealer;
      setMutate(e => !e);
    }
  };

  const onPress = () => {
    SheetManager.show('choose-item-sheet', {
      payload: { type, title, data, dataMain: data },
    });
  };

  useEffect(() => {
    LoadData();
  }, [dataRegister]);

  const styles = StyleSheet.create({
    viewItemChoose: {},
    titleHead: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
    },
    actionContainer: {
      padding: 12,
      borderWidth: 0.5,
      borderColor: dataRegister[keyValue] ? appcolor.grayLight : appcolor.red,
      borderRadius: 8,
      marginVertical: 8,
    },
    titleAction: { fontSize: 12, color: appcolor.dark },
    titleName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    requireText: { fontSize: 12, color: appcolor.red },
  });

  const InfomationView = () => {
    if (type == 'DEALER') {
      const itemInfo = dataRegister?.ItemDealer || {};
      return (
        <View>
          <Text style={styles.titleName}>{itemInfo.DealerName}</Text>
          <Text style={styles.subTitleName}>{itemInfo.AddressDealer}</Text>
        </View>
      );
    }
    if (type == 'PROGRAM') {
      const itemInfo = dataRegister?.ItemProgram || {};
      return (
        <View>
          <Text style={styles.titleName}>{itemInfo.ProgramName}</Text>
          <Text style={styles.subTitleName}>{itemInfo.ProgramTypeName}</Text>
          <Text style={styles.subTitleName}>
            {itemInfo.AwardTypeName == '%'
              ? `${formatNumber(itemInfo.TargetAmount, ',')} VNĐ`
              : itemInfo.AwardName}
          </Text>
          <Text
            style={styles.subTitleName}
          >{`Thời gian tham gia: ${itemInfo.FromDate} - ${itemInfo.ToDate}`}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.viewItemChoose}>
      {title && (
        <Text style={styles.titleHead}>
          {title} <Text style={styles.requireText}>*</Text>
        </Text>
      )}
      <TouchableOpacity
        style={styles.actionContainer}
        onPress={onPress}
        disabled={!isEdit}
      >
        {dataRegister[keyValue] ? (
          <InfomationView />
        ) : (
          <Text
            style={styles.titleAction}
          >{`Chọn ${title.toLowerCase()}`}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ItemChoose;
