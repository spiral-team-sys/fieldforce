import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CheckBox, Text } from '@rneui/themed';
import FormGroup from '../../../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../../../../../Core/Utility';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { SET_EmployeeInfo } from '../../../../../Redux/action';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SelectItem = ({ itemMain, keyValue }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [defaultValue, setDefaultValue] = useState('');
  const dispatch = useDispatch();

  const LoadData = async () => {
    const _listCheck = JSON.parse(itemMain.FilterList || '[]');
    await setData(_listCheck);
    await setDefaultValue(employeeInfo[keyValue] || '');
  };
  //
  const onChangeValue = async item => {
    const newEmployeeInfo = { ...employeeInfo, [keyValue]: item.itemName };
    // employeeInfo[keyValue] = item.itemName
    setDefaultValue(item.itemName);

    // await dispatch(SET_EmployeeInfo(employeeInfo))
    dispatch(SET_EmployeeInfo(newEmployeeInfo));
    SheetManager.hide(`selectitem_${itemMain.ItemId}`);
  };
  const handlerShowList = () => {
    SheetManager.show(`selectitem_${itemMain.ItemId}`);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginVertical: 5 },
    contentValue: {
      width: '100%',
      borderRadius: 8,
      padding: 3,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      flexDirection: 'row',
    },
    titleValueView: { fontSize: 14, fontWeight: '500', color: appcolor.dark },
    checkboxContainer: {
      padding: 0,
      borderWidth: 0,
      backgroundColor: appcolor.transparent,
    },
    inputContainer: {
      padding: 3,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    sheetContent: { padding: 8, width: '100%', minHeight: deviceHeight / 3.5 },
    contentMain: { width: '100%', minHeight: deviceHeight / 3 },
    titleHeader: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      marginBottom: 8,
    },
    itemMain: {
      width: '100%',
      paddingVertical: 5,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
    },
  });
  const renderItem = ({ item, index }) => {
    const onChecked = () => {
      onChangeValue(item);
    };
    return (
      <View key={`itcb_${index}`} style={styles.itemMain}>
        <CheckBox
          title={item.itemName}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.titleValueView}
          checked={defaultValue == item.itemName}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          size={20}
          checkedColor={appcolor.dark}
          uncheckedColor={appcolor.grayLight}
          onPress={onChecked}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable={false}
        useClearAndroid={false}
        iconRight="list-alt"
        defaultValue={employeeInfo[keyValue] || ''}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        rightFunc={handlerShowList}
      />
      <ActionSheet
        id={`selectitem_${itemMain.ItemId}`}
        containerStyle={StyleSheet.flatten([
          styles.sheetContent,
          { paddingBottom: insets.bottom },
        ])}
      >
        <View style={styles.contentMain}>
          <Text style={styles.titleHeader}>{itemMain.ItemName}</Text>
          <CustomListView
            data={data}
            extraData={data}
            renderItem={renderItem}
            bottomView={{ paddingBottom: 0 }}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
