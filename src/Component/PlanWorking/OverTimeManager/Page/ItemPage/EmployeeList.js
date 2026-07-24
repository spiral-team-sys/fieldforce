import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/themed';
import { removeVietnameseTones } from '../../../../../Core/Helper';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import { FlashList } from '@shopify/flash-list';
import _ from 'lodash';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

export const EmployeeList = ({ data, info, callIndex }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [dataEmployee, setDataEmployee] = useState([]);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    await setDataMain(data);
    await setDataEmployee(data);
  };
  // Handler
  const onItemChoose = item => {
    item.typeId = item.TypeId;
    item.employeeId = item.EmployeeId;
    item.employeeCode = item.EmployeeCode;
    item.employeeName = item.EmployeeName;
    //
    const objectUpdate = { item, type: 'EMPLOYEE' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    callIndex(2);
    setMutate(e => !e);
  };
  const handlerSearchInfo = text => {
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    const lstFilter = _.filter(dataMain, e => {
      return (
        removeVietnameseTones(e.EmployeeName)
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.EmployeeCode).toLowerCase().match(valueSearch)
      );
    });
    setDataEmployee(lstFilter);
  };
  //
  useEffect(() => {
    LoadData();
  }, [data]);

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    inputStyle: { fontSize: 12, color: appcolor.homebackground },
    contentItem: { flex: 1 },
    itemContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 5,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    titleMain: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      padding: 5,
      paddingHorizontal: 0,
    },
    subTitleMain: { fontSize: 11, fontWeight: '500', color: appcolor.gray },
    viewIconSelected: { padding: 8, paddingStart: 0, justifyContent: 'center' },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      onItemChoose(item);
    };
    const isChoose = info.employeeId == item.EmployeeId;
    const colorChoose = isChoose ? appcolor.success : appcolor.grey;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewIconSelected}>
          <SpiralIcon
            type="ionicon"
            name={isChoose ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color={colorChoose}
          />
        </View>
        <View style={{ width: '90%' }}>
          <TouchableOpacity key={`spi_${index}`} onPress={onPress}>
            <Text style={styles.titleMain}>{`${index + 1}. ${item.EmployeeName
              }`}</Text>
            <Text
              style={styles.subTitleMain}
            >{`Mã nhân viên: ${item.EmployeeCode}`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder="Tìm kiếm nhân viên"
        iconName="users"
        onSearchData={handlerSearchInfo}
        inputStyle={styles.inputStyle}
      />
      <View style={styles.contentItem}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataEmployee}
          extraData={[dataEmployee]}
          renderItem={renderItem}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ paddingBottom: 32 }} />}
        />
      </View>
    </View>
  );
};
