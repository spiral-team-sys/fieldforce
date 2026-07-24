import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Text } from '@rneui/themed';
import { SET_EmployeeInfo } from '../../../../../../Redux/action';

export const GroupListTown = ({ type, keyValue, keyInfo, dataDetails }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  //
  const LoadData = async () => {
    await setData(dataDetails);
  };
  //
  const handlerOpenDetails = async item => {
    const _isOpen = !(item.isChoose || false);
    if (_isOpen) {
      const newEmployeeInfo = { ...employeeInfo, [keyInfo]: item[keyValue] };
      await dispatch(SET_EmployeeInfo(newEmployeeInfo));
    }
    const listUpdate = _.map(data, e => {
      return item[keyValue] == e[keyValue]
        ? { ...e, isChoose: _isOpen }
        : { ...e, isChoose: false };
    });
    setData(listUpdate);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataDetails]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      backgroundColor: appcolor.light,
      alignSelf: 'center',
    },
    itemViewMain: {
      width: '90%',
      flexDirection: 'row',
      padding: 3,
      margin: 8,
      marginTop: 0,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.3,
      borderRadius: 8,
    },
    titleHead: {
      width: '100%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 8,
    },
    titleHeadChoose: {
      width: '100%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.light,
      padding: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerOpenDetails(item);
    };
    return (
      <TouchableOpacity
        key={`it_${type}_${index}`}
        style={{
          ...styles.itemViewMain,
          backgroundColor: item.isChoose ? appcolor.primary : appcolor.light,
        }}
        onPress={onPress}
      >
        <Text style={item.isChoose ? styles.titleHeadChoose : styles.titleHead}>
          {item[keyValue]}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FlashList
        key={`datagrouplist_${type}`}
        keyExtractor={(_item, index) => index.toString()}
        estimatedItemSize={100}
        numColumns={2}
        data={data}
        scrollEnabled={false}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 5 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
