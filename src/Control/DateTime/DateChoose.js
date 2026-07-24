import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@rneui/base';
import moment from 'moment';
import { useSelector } from 'react-redux';
//import DatePicker from 'react-native-date-picker';
import { fontWeightBold } from '../../Themes/AppsStyle';

const DateChoose = ({
  onChooseDate,
  title = null,
  valueDate = null,
  typeDateSelect = null,
  isCheckResult = false,
  containerStyle = {},
  mainContainerStyle = {},
  titleDateStyle = {},
  titleViewStyle = {},
  disabled = false,
  minimumDate = undefined,
  maximumDate = undefined,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isOpen, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState(
    valueDate ? new Date(valueDate) : new Date(),
  );
  const [tempDate, setTempDate] = useState(
    valueDate ? new Date(valueDate) : new Date(),
  );

  const handlerChange = () => {
    setTempDate(dateValue);
    setOpen(true);
  };
  const handlerChooseDate = async (event, date) => {
    setOpen(false);
    if (event.type !== 'dismissed') {
      if (onChooseDate) {
        const result = await onChooseDate(date, typeDateSelect);
        if (isCheckResult) {
          if (result) {
            await setDateValue(date);
          }
        } else {
          await setDateValue(date);
        }
      } else {
        await setDateValue(date);
      }
    }
  };
  const onIosCancel = () => {
    setOpen(false);
    setTempDate(dateValue);
  };
  const onIosDone = async () => {
    const date = tempDate || dateValue;
    setOpen(false);
    if (onChooseDate) {
      const result = await onChooseDate(date, typeDateSelect);
      if (isCheckResult) {
        if (result) await setDateValue(date);
      } else {
        await setDateValue(date);
      }
    } else {
      await setDateValue(date);
    }
  };
  useEffect(() => {
    if (valueDate) {
      const d = new Date(valueDate);
      setDateValue(d);
      setTempDate(d);
    }
  }, [valueDate]);

  const styles = StyleSheet.create({
    containerStyle: { flex: 1, marginHorizontal: 4 },
    mainContainer: {
      width: '100%',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: appcolor.primary,
      marginEnd: 8,
    },
    titleView: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      padding: 4,
      textAlign: 'center',
    },
    titleDate: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      padding: 4,
      textAlign: 'center',
    },
    datetimepicker: { backgroundColor: appcolor.primary },
    iosModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    iosModalSheet: {
      backgroundColor: appcolor.light,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingBottom: 12,
    },
    iosModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    iosModalBtn: { paddingVertical: 6, paddingHorizontal: 8 },
    iosModalBtnText: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    iosModalBtnTextDanger: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.danger,
    },
  });
  return (
    <View style={{ ...styles.containerStyle, ...containerStyle }}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => handlerChange()}
        style={{ ...styles.mainContainer, ...mainContainerStyle }}
      >
        {title && (
          <Text style={{ ...styles.titleView, ...titleViewStyle }}>
            {title}
          </Text>
        )}
        <Text style={{ ...styles.titleDate, ...titleDateStyle }}>
          {moment(dateValue).format('DD/MM/YYYY')}
        </Text>
      </TouchableOpacity>
      {isOpen && Platform.OS !== 'ios' && (
        <RNDateTimePicker
          mode="date"
          value={dateValue}
          style={styles.datetimepicker}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handlerChooseDate}
        />
      )}
      {isOpen && Platform.OS === 'ios' && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={onIosCancel}
        >
          <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalSheet}>
              <View style={styles.iosModalHeader}>
                <TouchableOpacity
                  style={styles.iosModalBtn}
                  onPress={onIosCancel}
                >
                  <Text style={styles.iosModalBtnTextDanger}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iosModalBtn}
                  onPress={onIosDone}
                >
                  <Text style={styles.iosModalBtnText}>Xong</Text>
                </TouchableOpacity>
              </View>
              <DatePicker
                mode="date"
                date={tempDate}
                textColor={appcolor.dark}
                themeVariant="light"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onDateChange={date => date && setTempDate(date)}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DateChoose;
