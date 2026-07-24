import React, { forwardRef, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle';
//import NumberFormat from "react-number-format";
import ActionSheet from 'react-native-actions-sheet';
import { KeyboardInput } from './KeyBoardInput';
import { updateItemCompetitor } from '../../../../Controller/DisplayController';
import { ToastError } from '../../../../Core/Helper';
import { toCurrency } from '../../../../Core/Utility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const InputItemProduct = forwardRef((props, ref) => {
  const insets = useSafeAreaInsets();
  const { inputItem, item, listInput, index, data, onEditing } = props;
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const [inputSelect, setInputSelect] = useState({
    itemSelect: {},
    indexSelect: null,
  });
  //
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      padding: 8,
      backgroundColor: appcolor.light,
      zIndex: 10000,
    },
    inputContainer: {
      width: '100%',
      padding: 3,
      backgroundColor: appcolor.dark,
    },
    inputStyle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    inputHeader: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
  });

  const handlerSelectInput = (itemInput, indexInput) => {
    inputSelect.itemSelect = itemInput;
    inputSelect.indexInput = indexInput;
    setMutate(e => !e);
  };
  const handlerSelectNum = number => {
    try {
      const itemName = inputSelect?.itemSelect?.displayType;
      let itemEdit = inputItem?.item;
      let isError = 0;

      if (itemEdit !== null && itemName !== undefined && itemName !== null) {
        let currentStr = itemEdit[itemName]
          ? JSON.stringify(itemEdit[itemName])
          : null;
        let newStr = null;
        if (number == '_') {
          newStr = currentStr ? currentStr?.slice(0, -1) || '' : '';
          itemEdit[itemName] = newStr == '' ? null : parseInt(newStr);
        } else {
          newStr = (currentStr || '') + number;
          if (
            newStr <
            (inputSelect.itemSelect?.min && inputSelect.itemSelect?.min !== ''
              ? inputSelect.itemSelect?.min
              : 0)
          ) {
            ToastError(
              `Nhập ${inputSelect.itemSelect?.name} không được nhỏ hơn ${
                inputSelect.itemSelect?.min || 0
              }!`,
              'Lỗi',
              'top',
            );
          } else if (
            newStr >
            (inputSelect.itemSelect?.max && inputSelect.itemSelect?.max !== ''
              ? inputSelect.itemSelect?.max
              : 1000000000)
          ) {
            isError = 1;
            ToastError(
              `Nhập ${inputSelect.itemSelect?.name} không được lớn hơn ${
                inputSelect.itemSelect?.max || 1000000000
              }!`,
              'Lỗi',
              'top',
            );
          } else {
            isError = 0;
          }
          isError == 0 &&
            (itemEdit[itemName] = newStr == 0 ? 0 : parseInt(newStr));
        }

        if (itemEdit?.displayCompetitorId && isError == 0) {
          const indexF = data.dataShowF.findIndex(
            it => it.displayCompetitorId === itemEdit.displayCompetitorId,
          );
          const index = data.dataShow.findIndex(
            it => it.displayCompetitorId === itemEdit.displayCompetitorId,
          );
          data.dataShowF[indexF][itemName] = parseInt(newStr);
          data.dataShow[index][itemName] = parseInt(newStr);
          updateItemCompetitor(itemEdit, workinfo);
        }
      } else {
        ToastError(`Nhập ${JSON.stringify(itemEdit)} lois}!`, 'Lỗi', 'top');
      }
      setMutate(e => !e);
    } catch (e) {
      ToastError(`Lỗi ${JSON.stringify(itemEdit)} lois!`, 'Lỗi', 'top');
    }
  };

  const RenderItemInput = ({ itemInput, indexInput }) => {
    const itemName = itemInput.displayType || null;
    const itemEdit = inputItem?.item || null;
    const value =
      itemName != null && itemEdit !== null
        ? itemEdit[itemName] == 0
          ? 0
          : itemEdit[itemName] || null
        : null;
    return (
      <View
        style={{
          flexDirection: 'column',
          width: deviceWidth / 2.2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={styles.inputHeader}>{`${itemInput.name} `}</Text>
        <TouchableOpacity
          onPress={() => handlerSelectInput(itemInput, indexInput)}
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor:
                inputSelect.itemSelect?.id == itemInput.id
                  ? appcolor.primary
                  : appcolor.surface,
              width: 40,
              height: 30,
              borderRadius: 8,
              justifyContent: 'center',
              width: '80%',
              marginTop: 4,
            }}
          >
            {value !== null ? (
              <Text
                style={{
                  color:
                    inputSelect.itemSelect?.id == itemInput.id
                      ? appcolor.white
                      : appcolor.dark,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {value === 0 ? value : toCurrency(value || '')}
              </Text>
            ) : (
              <Text
                style={{
                  color:
                    inputSelect.itemSelect?.id == itemInput.id
                      ? appcolor.white
                      : appcolor.greydark,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {itemInput?.placeholder || 'Số lượng'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View key={`InputItemProduct`} style={styles.mainContainer}>
      <ActionSheet
        id="sheetInputProduct"
        onClose={() => onEditing()}
        defaultOverlayOpacity={0.3}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View
          style={{
            width: deviceWidth,
            height: deviceWidth + 150,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              marginTop: 20,
              height: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {Object.keys(inputItem?.item || {}).length > 0 &&
              listInput?.length > 0 &&
              listInput?.map((it, idx) => {
                return (
                  <RenderItemInput
                    key={`${inputItem?.item?.displayCompetitorId}_${index}_${it.id}`}
                    itemInput={it}
                    indexInput={idx}
                  />
                );
              })}
          </View>
          <KeyboardInput
            onSelectNum={handlerSelectNum}
            disableKeyboard={
              inputSelect.itemSelect?.id == undefined &&
              inputSelect.itemSelect?.id == null
            }
          />
        </View>
      </ActionSheet>
    </View>
  );
});
