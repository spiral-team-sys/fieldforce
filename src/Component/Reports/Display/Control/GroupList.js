import React, { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/themed';
import _ from 'lodash';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const GroupList = ({
  dataMain = [],
  listValue = [],
  keyValue,
  keyName,
  handlerChange,
  handlerCloseTag,
  isMultiple = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const refList = useRef();
  const dataGroup = useMemo(
    () => _.uniqBy(dataMain, keyValue),
    [dataMain, keyValue],
  );
  const isCloseTag = useMemo(
    () => _.some(dataGroup, e => e.isChooseTag == 1),
    [dataGroup],
  );
  const countAll = useMemo(
    () => _.countBy(dataMain, keyValue),
    [dataMain, keyValue],
  );
  const countSelected = useMemo(
    () => _.countBy(listValue, keyValue),
    [listValue, keyValue],
  );

  // Handler
  const onItemPress = useCallback(
    (item, index) => {
      try {
        if (dataGroup.length > 0 && index < dataGroup.length) {
          refList.current.scrollToIndex({ index: index, animated: true });
          const _item = {
            keyValue: item[keyValue],
            keyName: item[keyName],
          };
          handlerChange(_item, keyValue, isMultiple);
        }
      } catch (e) {
        console.log(e);
      }
    },
    [dataGroup.length, handlerChange, isMultiple, keyName, keyValue],
  );

  const onCloseTag = () => {
    try {
      if (dataGroup.length > 0) {
        refList.current.scrollToIndex({ index: 0, animated: true });
        handlerCloseTag();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    itemMain: {
      minWidth: 80,
      margin: 8,
      marginTop: 5,
      borderWidth: 1,
      borderColor: appcolor.primary,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    titleView: {
      paddingHorizontal: 8,
      paddingEnd: 16,
      fontSize: 13,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      color: appcolor.light,
      textAlign: 'center',
    },
    viewSumValue: {
      borderWidth: 1.5,
      backgroundColor: appcolor.light,
      borderColor: appcolor.primary,
      borderRadius: 20,
      minWidth: 30,
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleSumValue: { fontSize: 12, fontWeight: 'bold', color: appcolor.dark },
    viewGroupTag: { flexDirection: 'row', alignItems: 'center' },
    viewCloseTag: {
      backgroundColor: appcolor.primary,
      minWidth: 30,
      minHeight: 30,
      borderRadius: 50,
      justifyContent: 'center',
      marginHorizontal: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const pressItem = () => {
      onItemPress(item, index);
    };
    const groupKey = item[keyValue];
    const groupCount =
      item.isChooseTag == 1
        ? countSelected[groupKey] || 0
        : countAll[groupKey] || 0;

    const colorValue = item.isChooseTag == 1 ? appcolor.dark : appcolor.light;
    const colorText = item.isChooseTag == 1 ? appcolor.light : appcolor.dark;
    const bgColorView =
      item.isChooseTag == 1 ? appcolor.light : appcolor.primary;
    const borderColorView =
      item.isChooseTag == 1 ? appcolor.primary : appcolor.light;
    const styleDefault = {
      ...styles.itemMain,
      marginEnd: index + 1 == dataGroup.length ? 8 : 0,
      backgroundColor: borderColorView,
    };
    return (
      <TouchableOpacity
        key={`igi_${index}`}
        style={styleDefault}
        onPress={pressItem}
      >
        <View
          style={{
            ...styles.viewSumValue,
            backgroundColor: bgColorView,
            borderColor: borderColorView,
          }}
        >
          <Text
            style={{
              ...styles.titleSumValue,
              color: colorValue,
              paddingHorizontal: groupCount > 10 ? 8 : 0,
            }}
          >
            {groupCount}
          </Text>
        </View>
        <Text style={{ ...styles.titleView, color: colorText }}>
          {item[keyName] || ''}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewGroupTag}>
        {isMultiple && isCloseTag && (
          <TouchableOpacity style={styles.viewCloseTag} onPress={onCloseTag}>
            <SpiralIcon
              name="close"
              type="ionicon"
              size={18}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}
        <FlatList
          ref={refList}
          horizontal
          keyExtractor={(_item, index) => index.toString()}
          data={dataGroup}
          renderItem={renderItem}
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};
