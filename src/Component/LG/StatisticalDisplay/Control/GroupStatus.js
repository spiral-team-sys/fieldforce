import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import _ from 'lodash';
import { removeVietnameseTones } from '../../../../Core/Helper';

export const GroupStatus = ({ onChange, itemFilter, data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataGroup, setDataGroup] = useState([]);
  const [groupCount, setGroupCount] = useState({});
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = () => {
    const _grouplist = _.unionBy(data, 'groupName');
    const _groupCount = _.countBy(data, 'groupName');
    //
    setDataGroup(_grouplist);
    setGroupCount(_groupCount);
  };

  const handlerChangeGroup = item => {
    const _value = item.groupName == item.valueChoose ? null : item.groupName;
    const dataUpdate = _.map(dataGroup, e => {
      return { ...e, valueChoose: _value };
    });
    setDataGroup(dataUpdate);
    //
    if (_value !== null) {
      const _data = _.filter(data, e => e.groupName == _value);
      onChange(_data, _value);
    } else {
      onChange(data, _value);
    }
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [data]);

  useEffect(() => {
    const valueSearch = removeVietnameseTones(itemFilter.search).toLowerCase();
    const filteredData = _.filter(data, e => {
      const matchesHeadCount =
        itemFilter.headcount != null
          ? e.headCountType === itemFilter.headcount
          : true;
      const matchesSearch =
        removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.address).toLowerCase().match(valueSearch);
      return matchesHeadCount && matchesSearch;
    });
    const _groupCountHeadType = _.countBy(filteredData, 'groupName');
    setGroupCount(_groupCountHeadType);
  }, [itemFilter.headcount, itemFilter.search]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grey,
    },
    contentMain: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    itemMain: {
      width: '30%',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      margin: 8,
      marginTop: 0,
      padding: 8,
      borderRadius: 8,
    },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    titleContent: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.light,
      textAlign: 'center',
    },
    bottomLine: {
      width: '100%',
      height: 5,
      backgroundColor: appcolor.red,
      position: 'absolute',
      bottom: 0,
      borderRadius: 8,
    },
  });
  const renderItem = (item, index) => {
    const onPress = () => {
      handlerChangeGroup(item);
    };
    const sumShop =
      itemFilter.headcount != null
        ? data.filter(item => item.headCountType === itemFilter.headcount)
            .length
        : data.length;
    const countStore = `(${
      groupCount[item.groupName] == undefined ? 0 : groupCount[item.groupName]
    }/${sumShop})\nCửa hàng`;
    const countPercent = `${(
      ((groupCount[item.groupName] == undefined
        ? 0
        : groupCount[item.groupName]) /
        sumShop) *
      100
    ).toFixed(2)} %`;
    const backgroundColor =
      item.valueChoose == item.groupName
        ? appcolor.light
        : appcolor[item.colorGroup];
    const color =
      item.valueChoose == item.groupName
        ? appcolor[item.colorGroup]
        : appcolor.light;
    return (
      <TouchableOpacity
        key={`gss-${index}`}
        style={{ ...styles.itemMain, backgroundColor }}
        onPress={onPress}
      >
        <Text style={{ ...styles.titleName, color }}>{item.groupName}</Text>
        <Text style={{ ...styles.titleContent, color }}>{countStore}</Text>
        <Text style={{ ...styles.titleName, color }}>{countPercent}</Text>
        <View
          style={{
            ...styles.bottomLine,
            backgroundColor: appcolor[item.colorGroup],
          }}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentMain}>
        {dataGroup.map((item, index) => {
          return renderItem(item, index);
        })}
      </View>
    </View>
  );
};
