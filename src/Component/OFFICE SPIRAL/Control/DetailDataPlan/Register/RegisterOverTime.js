import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { View } from 'react-native';
import { Slider, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { BORDER_WIDTH, TimeDefault, getTimeDefault } from '../../UtilityOffice';
import FormGroup from '../../../../../Content/FormGroup';
import moment from 'moment';
import { WorkingPlanAPI } from '../../../../../API/WorkingPlanApi';
import { ToastSuccess } from '../../../../../Core/Helper';
import {
  alertConfirm,
  alertWarning,
  deviceHeight,
} from '../../../../../Core/Utility';

export const RegisterOverTime = ({ dataDetail, itemMain, actionBack }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemData, setItemData] = useState({});
  const [dataType, setDataType] = useState([]);
  const [registerSave, _setRegisterSave] = useState({
    typeOT: null,
    typeOTCode: null,
    timeOTFrom: '00:00',
    timeOTTo: '00:00',
    otNote: null,
    stepTime: 5,
    sliderValueFrom: 0,
    sliderValueTo: 0,
    sliderFromMin: '08:30',
    sliderFromMax: '12:00',
    sliderToMin: '13:00',
    sliderToMax: '17:30',
    fromMinValue: TimeDefault.FROM_MIN,
    fromMaxValue: TimeDefault.FROM_MAX,
    toMinValue: TimeDefault.TO_MIN,
    toMaxValue: TimeDefault.TO_MAX,
  });
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = () => {
    const itemDetail = dataDetail[0] || {};
    if ((itemDetail?.OTCode || null) !== null) {
      registerSave.typeOT = itemDetail.OTTypeName;
      registerSave.typeOTCode = itemDetail.OTCode;
      registerSave.timeOTFrom = itemDetail.OTFrom;
      registerSave.timeOTTo = itemDetail.OTTo;
      registerSave.otNote = itemDetail.OTNote;
      if ((itemDetail?.TimeFrom || null) !== null) {
        const hour = parseInt(
          moment(new Date(itemDetail.TimeFrom)).format('HH'),
        );
        const minute = parseInt(
          moment(new Date(itemDetail.TimeFrom)).format('mm'),
        );
        registerSave.sliderValueFrom = minute + hour * 60;
      }
      if ((itemDetail?.TimeTo || null) !== null) {
        const hour = parseInt(moment(new Date(itemDetail.TimeTo)).format('HH'));
        const minute = parseInt(
          moment(new Date(itemDetail.TimeTo)).format('mm'),
        );
        registerSave.sliderValueTo = minute + hour * 60;
      }
    }
    setItemData(itemDetail);
    setDataType(itemDetail.DataOTType);
  };
  // Handler
  const handlerSendRegister = async () => {
    const checkData = await validData();
    if (checkData) {
      const itemSave = {
        ...registerSave,
        planId: itemMain.planId,
      };
      await WorkingPlanAPI.PlanOfficeRegister('OT', itemSave, async result => {
        ToastSuccess(result.messeger, 'Thông báo', 'top');
        if (result.status == 200) actionBack();
      });
    }
  };
  const validData = async () => {
    if (
      registerSave.typeOT == null ||
      registerSave.typeOT == '' ||
      registerSave.typeOT.length == 0
    ) {
      alertWarning(`Vui lòng chọn loại tăng ca`);
      return false;
    }
    if (registerSave.sliderValueFrom == 0 || registerSave.sliderValueTo == 0) {
      alertWarning(`Vui lòng chọn đầy đủ thời gian tăng ca`);
      return false;
    }
    if (registerSave.otNote == null || registerSave.otNote.length < 5) {
      alertWarning(`Vui lòng nhập lí do tăng ca (Tối thiểu 5 kí tự)`);
      return false;
    }
    return true;
  };
  const handlerCancel = () => {
    alertConfirm(
      'Huỷ yêu cầu',
      'Bạn có muốn huỷ yêu cầu xin nghỉ không?',
      async () => {
        const itemSave = {
          typeOT: null,
          typeOTCode: null,
          otNote: null,
          planId: itemMain.planId,
        };
        await WorkingPlanAPI.PlanOfficeRegister(
          'CANCEL_OT',
          itemSave,
          async result => {
            ToastSuccess(result.messeger, 'Thông báo', 'top');
            if (result.status == 200) actionBack();
          },
        );
      },
    );
  };
  const onSelected = async item => {
    await _setRegisterSave({});
    const isDuplicate = item.ItemName == registerSave.typeOT;
    registerSave.typeOT = isDuplicate ? null : item.ItemName;
    registerSave.typeOTCode = isDuplicate ? null : item.Code;

    const jsonTime = JSON.parse(item.DataTimeSlider || '{}');
    if (jsonTime !== null && Object.keys(jsonTime).length > 0) {
      registerSave.timeOTTo = '00:00';
      registerSave.timeOTFrom = '00:00';
      registerSave.sliderValueFrom = 0;
      registerSave.sliderValueTo = 0;
      registerSave.fromMaxValue = jsonTime.fromMaxValue;
      registerSave.fromMinValue = jsonTime.fromMinValue;
      registerSave.sliderFromMax = jsonTime.sliderFromMax;
      registerSave.sliderFromMin = jsonTime.sliderFromMin;
      registerSave.sliderToMax = jsonTime.sliderToMax;
      registerSave.sliderToMin = jsonTime.sliderToMin;
      registerSave.toMaxValue = jsonTime.toMaxValue;
      registerSave.toMinValue = jsonTime.toMinValue;
    }
    await _setRegisterSave(registerSave);
    setMutate(e => !e);
  };
  const onChangeNote = text => {
    registerSave.otNote = text;
    setMutate(e => !e);
  };
  const onChangeTimeFrom = time => {
    const timeDefault = getTimeDefault();
    const changeFrom = moment(timeDefault).add('minute', time);
    registerSave.timeOTFrom = changeFrom.format('HH:mm');
    registerSave.sliderValueFrom = time;
    setMutate(e => !e);
  };
  const onChangeTimeTo = time => {
    const timeDefault = getTimeDefault();
    const changeTo = moment(timeDefault).add('minute', time);
    registerSave.timeOTTo = changeTo.format('HH:mm');
    registerSave.sliderValueTo = time;
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
    buttonChange: {
      borderRadius: 5,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      margin: 8,
      marginStart: 0,
      marginBottom: 0,
    },
    buttonSelected: {
      borderRadius: 5,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.red,
      margin: 8,
      marginStart: 0,
      marginBottom: 0,
      backgroundColor: appcolor.red,
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
      backgroundColor: appcolor.light,
      marginEnd: 8,
    },
    titleNameButton: {
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.light,
      textAlign: 'center',
    },
    mainButtonAction: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    mainInput: {
      marginTop: 8,
      borderColor: appcolor.greylight,
      borderWidth: BORDER_WIDTH,
      borderRadius: 5,
    },
    inputStyle: { fontSize: 13, color: appcolor.dark },
    titleStyle: { fontWeight: '500', fontSize: 13 },
    buttonChangeTime: {
      width: (deviceWidth - 40) / 2,
      borderRadius: 5,
      padding: 8,
      marginTop: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      marginEnd: 8,
    },
    titleTimeButton: {
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.primary,
      textAlign: 'center',
    },
    mainTimer: {
      borderRadius: 5,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      marginTop: 8,
    },
    titleTimeHeader: { fontSize: 13, fontWeight: '600', color: appcolor.red },
  });
  const renderTypeOTView = () => {
    const renderItem = (item, index) => {
      const handlerSelected = () => {
        onSelected(item);
      };
      const isChoose = item.ItemName == registerSave.typeOT;
      return (
        <View key={`idpa_${index}`}>
          <TouchableOpacity
            style={isChoose ? styles.buttonSelected : styles.buttonChange}
            onPress={handlerSelected}
          >
            <Text
              style={{
                ...styles.titleNameButton,
                color: isChoose ? appcolor.light : appcolor.greylight,
                textAlign: 'left',
              }}
            >
              {`${item.ItemName}`}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };
    return (
      dataType !== null &&
      dataType.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {dataType.map((item, index) => {
            return renderItem(item, index);
          })}
        </View>
      )
    );
  };
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleSummary}>{itemMain.titlePage}</Text>
      <View style={styles.contentView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: -8 }}>{renderTypeOTView()}</View>
          <View style={styles.mainTimer}>
            <Text
              style={styles.titleTimeHeader}
            >{`Thời gian: Từ ${registerSave.timeOTFrom} - Đến ${registerSave.timeOTTo}`}</Text>
            <View style={{ marginEnd: 8, marginTop: 16 }}>
              <Text
                style={{
                  position: 'absolute',
                  start: 0,
                  fontSize: 11,
                  fontWeight: '500',
                  fontStyle: 'italic',
                  top: -5,
                }}
              >{`${registerSave.sliderFromMin}`}</Text>
              <Text
                style={{
                  position: 'absolute',
                  end: 0,
                  fontSize: 11,
                  fontWeight: '500',
                  fontStyle: 'italic',
                  top: -5,
                }}
              >{`${registerSave.sliderFromMax}`}</Text>
              {registerSave !== null &&
                Object.keys(registerSave).length > 0 && (
                  <Slider
                    value={registerSave.sliderValueFrom}
                    minimumValue={registerSave.fromMinValue}
                    maximumValue={registerSave.fromMaxValue}
                    step={registerSave.stepTime || 5}
                    allowTouchTrack
                    minimumTrackTintColor={appcolor.info}
                    thumbStyle={{ width: 20, height: 20 }}
                    thumbTintColor={appcolor.info}
                    onValueChange={onChangeTimeFrom}
                  />
                )}
            </View>
            <View style={{ marginEnd: 8, marginTop: 8 }}>
              <Text
                style={{
                  position: 'absolute',
                  start: 0,
                  fontSize: 11,
                  fontWeight: '500',
                  fontStyle: 'italic',
                  top: -5,
                }}
              >{`${registerSave.sliderToMin}`}</Text>
              <Text
                style={{
                  position: 'absolute',
                  end: 0,
                  fontSize: 11,
                  fontWeight: '500',
                  fontStyle: 'italic',
                  top: -5,
                }}
              >{`${registerSave.sliderToMax}`}</Text>
              {registerSave !== null &&
                Object.keys(registerSave).length > 0 && (
                  <Slider
                    value={registerSave.sliderValueTo}
                    minimumValue={registerSave.toMinValue}
                    maximumValue={registerSave.toMaxValue}
                    step={registerSave.stepTime || 5}
                    allowTouchTrack
                    minimumTrackTintColor={appcolor.info}
                    thumbStyle={{ width: 20, height: 20 }}
                    thumbTintColor={appcolor.info}
                    onValueChange={onChangeTimeTo}
                  />
                )}
            </View>
          </View>
          <FormGroup
            editable
            title="Lý do tăng ca"
            useClearAndroid={false}
            clearButtonMode="never"
            containerStyle={styles.mainInput}
            inputStyle={styles.inputStyle}
            titleStyle={styles.titleStyle}
            value={registerSave.otNote}
            handleChangeForm={onChangeNote}
          />
          <View style={styles.mainButtonAction}>
            {(itemData?.OTConfirm || 0) == 3 && (
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
            {(itemData?.OTConfirm || 0) == 0 &&
              (itemData?.isLockSend || 0) == 0 && (
                <TouchableOpacity
                  style={styles.buttonConfirm}
                  onPress={handlerSendRegister}
                >
                  <Text style={styles.titleNameButton}>Gửi</Text>
                </TouchableOpacity>
              )}
          </View>
          <View style={{ height: deviceHeight / 5 }} />
        </ScrollView>
      </View>
    </View>
  );
};
