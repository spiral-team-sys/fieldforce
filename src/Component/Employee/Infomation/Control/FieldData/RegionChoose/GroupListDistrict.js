import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Icon, Text } from '@rneui/themed';
import { GroupListTown } from './GroupListTown';
import { fontWeightBold } from '../../../../../../Themes/AppsStyle';
import { SET_EmployeeInfo } from '../../../../../../Redux/action';
import SpiralIcon from '../../../../../../Control/Icon/SpiralIcon';

export const GroupListDistrict = ({ type, keyValue, keyInfo, dataDetails }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  //
  const LoadData = async () => {
    await setData(dataDetails);
  };
  //
  const handlerOpenDetails = async item => {
    const _isOpen = !(item.isOpen || false);
    let lstChoose = [];
    if (_isOpen) {
      _.map(data, e => {
        item[keyValue] == e[keyValue] &&
          lstChoose.push({ ...e, isOpen: _isOpen });
      });
      const newEmployeeInfo = { ...employeeInfo, [keyInfo]: item[keyValue] };
      await dispatch(SET_EmployeeInfo(newEmployeeInfo));
    } else lstChoose = dataDetails;
    setData(lstChoose);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataDetails]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', backgroundColor: appcolor.light },
    itemViewMain: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      marginHorizontal: 8,
      backgroundColor: appcolor.light,
      marginBottom: 8,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.3,
      borderRadius: 8,
    },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerOpenDetails(item);
    };
    const townList = item.level3s || [];
    return (
      <View key={`it_${type}_${index}`}>
        <TouchableOpacity style={styles.itemViewMain} onPress={onPress}>
          {item.isOpen && (
            <SpiralIcon
              type="ionicon"
              name="checkmark-circle"
              size={18}
              color={appcolor.primary}
              style={{ marginStart: 8 }}
            />
          )}
          <Text style={styles.titleHead}>{item[keyValue]}</Text>
        </TouchableOpacity>
        {item.isOpen && (
          <GroupListTown
            key={`group_itt_${item.level2_id}`}
            type="TownCode"
            keyValue="name"
            keyInfo="addressTown"
            dataDetails={townList}
          />
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FlashList
        key={`datagrouplist_${type}`}
        keyExtractor={(_item, index) => index.toString()}
        estimatedItemSize={100}
        data={data}
        scrollEnabled={false}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
