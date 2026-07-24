import { Icon, Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import moment from 'moment';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const ItemScanID = ({
  navigation,
  dataRegister,
  title,
  keyValue,
  enabled = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => { };

  const onGetInformation = async data => {
    const arrayInfo = data.split('|');
    const info = {
      identityCardNumber: arrayInfo[0],
      fullName: arrayInfo[2],
      birthday: moment(arrayInfo[3], 'DDMMYYYY').format('DD/MM/YYYY'),
      gender: arrayInfo[4],
      permanentAddress: arrayInfo[5],
      identityCardDate: moment(arrayInfo[6], 'DDMMYYYY').format('DD/MM/YYYY'),
    };
    dataRegister[keyValue] = info;
    setMutate(e => !e);
    DeviceEventEmitter.emit('UPDATE_ITEM_PROGRAM', dataRegister);
  };

  const onScanId = async () => {
    navigation.navigate('qrcode', { onSuccess: onGetInformation });
  };

  useEffect(() => {
    LoadData();
  }, [dataRegister]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    titleHead: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
    },
    actionContainer: {
      padding: 12,
      borderWidth: 0.5,
      borderColor:
        Object.keys(dataRegister[keyValue] || {}).length > 0
          ? appcolor.grayLight
          : appcolor.red,
      borderRadius: 8,
      margin: 8,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    requireText: { fontSize: 12, color: appcolor.red },
  });
  if (!enabled) return null;

  return (
    <View style={styles.mainContainer}>
      {title && (
        <Text style={styles.titleHead}>
          {title} <Text style={styles.requireText}>*</Text>
        </Text>
      )}
      <TouchableOpacity
        style={styles.actionContainer}
        onPress={onScanId}
        activeOpacity={0.6}
      >
        {dataRegister?.CCCDInfo?.identityCardNumber ? (
          <View>
            <Text
              style={styles.titleName}
            >{`${dataRegister.CCCDInfo.identityCardNumber}`}</Text>
            <Text
              style={styles.subTitleName}
            >{`${dataRegister.CCCDInfo.fullName}`}</Text>
            <Text
              style={styles.subTitleName}
            >{`${dataRegister.CCCDInfo.birthday}`}</Text>
            <Text
              style={styles.subTitleName}
            >{`${dataRegister.CCCDInfo.permanentAddress}`}</Text>
          </View>
        ) : (
          <View>
            <SpiralIcon
              type="ionicon"
              name="qr-code-outline"
              color={appcolor.placeholderText}
              size={24}
            />
            <Text
              style={[
                styles.subTitleName,
                { textAlign: 'center', marginTop: 4 },
              ]}
            >{`Quét thông tin CCCD`}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ItemScanID;
