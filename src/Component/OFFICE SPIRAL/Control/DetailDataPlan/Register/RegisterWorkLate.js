import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Slider, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { BORDER_WIDTH, getTimeDefault } from '../../UtilityOffice';
import FormGroup from '../../../../../Content/FormGroup';
import moment from 'moment';
import { WorkingPlanAPI } from '../../../../../API/WorkingPlanApi';
import { ToastError, ToastSuccess } from '../../../../../Core/Helper';
import { alertConfirm } from '../../../../../Core/Utility';

export const RegisterWorkLate = ({ dataDetail, itemMain, actionBack }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [sliderValue, setSliderValue] = useState(0);
  const [itemData, setItemData] = useState();
  const [errorValue, setErrorValue] = useState(null);
  const [registerSave, _setRegisterSave] = useState({
    lateNote: null,
    lateTime: '00:00',
    lateTitle: '0 Phút',
  });
  const [_mutate, setMutate] = useState(false);

  const LoadData = () => {
    const itemDetail = dataDetail[0] || {};
    registerSave.lateNote = itemDetail?.WPLateNote || null;
    registerSave.lateTime = itemDetail?.WPLate || '00:00';
    if ((itemDetail?.LateTime || null) !== null) {
      const hour = parseInt(moment(new Date(itemDetail.LateTime)).format('HH'));
      const minute = parseInt(
        moment(new Date(itemDetail.LateTime)).format('mm'),
      );
      registerSave.lateTitle = `${hour > 0 ? `${hour}H ` : ''}${minute} Phút`;
      setSliderValue(minute + hour * 60);
    }
    setItemData(itemDetail);
    setMutate(e => !e);
  };
  const handlerSendRegister = async () => {
    const checkData = await validData();
    if (checkData) {
      const itemSave = {
        ...registerSave,
        planId: itemMain.planId,
      };
      await WorkingPlanAPI.PlanOfficeRegister(
        'LATE',
        itemSave,
        async result => {
          ToastSuccess(result.messeger, 'Thông báo', 'top');
          if (result.status == 200) actionBack();
        },
      );
    }
  };
  const handlerCancel = () => {
    alertConfirm(
      'Huỷ yêu cầu',
      'Bạn có muốn huỷ yêu cầu xin đi trễ không?',
      async () => {
        const itemSave = {
          lateNote: null,
          lateTime: null,
          planId: itemMain.planId,
        };
        await WorkingPlanAPI.PlanOfficeRegister(
          'CANCEL_LATE',
          itemSave,
          async result => {
            ToastSuccess(result.messeger, 'Thông báo', 'top');
            if (result.status == 200) actionBack();
          },
        );
      },
    );
  };
  // Handler
  const validData = () => {
    if (sliderValue > 0) {
      if (
        registerSave?.lateNote == null ||
        registerSave.lateNote?.length == 0
      ) {
        setErrorValue('*Vui lòng nhập lí do xin đi trễ');
        return false;
      }
    } else {
      setErrorValue('*Vui lòng chọn thời gian đi trễ và nhập lí do');
      return false;
    }
    return true;
  };
  const onChangeTime = value => {
    setSliderValue(value);
    const timeDefault = getTimeDefault();
    const change = moment(timeDefault).add('minute', value);
    registerSave.lateTime = change.format('HH:mm:ss');
    registerSave.lateTitle = `${
      change.hour() > 0 ? `${change.hour()}H ` : ''
    }${change.minute()} Phút`;
    if (value > 0) setErrorValue(null);
    setMutate(e => !e);
  };
  const onChangeNote = text => {
    registerSave.lateNote = text;
    if (text !== null && text.length > 0) setErrorValue(null);
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _itemdata = LoadData();
    return () => _itemdata;
  }, [dataDetail]);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: deviceWidth - 32,
      backgroundColor: appcolor.light,
      paddingTop: 8,
      paddingBottom: 8,
    },
    titleSummary: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.greylight,
    },
    contentView: { marginTop: 8 },
    mainButtonAction: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonChangeTime: {
      width: '25%',
      borderRadius: 5,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      marginEnd: 8,
    },
    buttonConfirm: {
      width: deviceWidth / 2.2,
      borderRadius: 25,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
    },
    buttonCancel: {
      width: deviceWidth / 2.2,
      borderRadius: 25,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.primary,
      marginEnd: 8,
    },
    titleNameButton: {
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.light,
      textAlign: 'center',
    },
    mainInput: {
      marginTop: 8,
      borderColor: appcolor.greylight,
      borderWidth: BORDER_WIDTH,
      borderRadius: 5,
    },
    inputStyle: { fontSize: 13, color: appcolor.dark },
    titleStyle: { fontWeight: '500', fontSize: 13 },
    errorView: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.red,
      textAlign: 'center',
      padding: 8,
      marginBottom: 8,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleSummary}>{itemMain.titlePage}</Text>
      <View style={styles.contentView}>
        <View
          style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={styles.buttonChangeTime}>
            <Text
              style={{ ...styles.titleNameButton, color: appcolor.primary }}
            >
              {registerSave.lateTitle}
            </Text>
          </View>
          <View style={{ flex: 1, marginEnd: 8 }}>
            <Text
              style={{
                position: 'absolute',
                end: 0,
                fontSize: 12,
                fontWeight: '500',
                fontStyle: 'italic',
                top: -8,
              }}
            >{`${(itemData?.MaxTime || 60) / 60}H`}</Text>
            {(itemData?.MaxTime || 0) > 0 && (
              <Slider
                value={sliderValue}
                minimumValue={0}
                maximumValue={itemData?.MaxTime || 60}
                step={5}
                allowTouchTrack
                minimumTrackTintColor={appcolor.info}
                thumbStyle={{ width: 20, height: 20 }}
                thumbTintColor={appcolor.info}
                onValueChange={onChangeTime}
              />
            )}
          </View>
        </View>
        <FormGroup
          editable
          title="Lý do đi trễ"
          useClearAndroid={false}
          clearButtonMode="never"
          containerStyle={styles.mainInput}
          inputStyle={styles.inputStyle}
          titleStyle={styles.titleStyle}
          value={registerSave.lateNote}
          handleChangeForm={onChangeNote}
        />
        {errorValue && <Text style={styles.errorView}>{errorValue}</Text>}
        <View style={styles.mainButtonAction}>
          {(itemData?.WPLateConfirm || 0) == 3 && (
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={handlerCancel}
            >
              <Text
                style={{ ...styles.titleNameButton, color: appcolor.primary }}
              >
                Hủy yêu cầu
              </Text>
            </TouchableOpacity>
          )}
          {(itemData?.WPLateConfirm || 0) == 0 &&
            (itemData?.isLockSend || 0) == 0 && (
              <TouchableOpacity
                style={styles.buttonConfirm}
                onPress={handlerSendRegister}
              >
                <Text style={styles.titleNameButton}>Gửi</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
};
