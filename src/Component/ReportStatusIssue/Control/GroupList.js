import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { Text } from '@rneui/themed';

export const GroupList = ({
  defaultValue,
  dataMain,
  handlerChange,
  isEnableChoose = true,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataGroup, setDataGroup] = useState([]);
  const ref = useRef();
  //
  const LoadData = async () => {
    const _dataGroup = _.uniqBy(dataMain, 'GroupIssueId');
    await setDataGroup(_dataGroup);
  };
  // Handler
  const onScrollToIndex = () => {
    if (dataGroup !== null && dataGroup.length > 0) {
      const _index = _.findIndex(
        dataGroup,
        e => e.GroupIssueId == defaultValue,
        0,
      );
      if (_index > 0)
        ref.current.scrollToIndex({ index: _index, animated: true });
    }
  };
  const onItemPress = item => {
    isEnableChoose && handlerChange(item, 'GROUP');
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataMain]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    itemMain: {
      minWidth: 80,
      padding: 8,
      margin: 8,
      marginEnd: 1,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: appcolor.greylight,
    },
    itemChoose: {
      minWidth: 80,
      padding: 8,
      margin: 8,
      marginEnd: 1,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
    },
    titleView: {
      width: '100%',
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      color: appcolor.dark,
      textAlign: 'center',
    },
  });

  const renderItem = ({ item, index }) => {
    const pressItem = () => {
      onItemPress(item);
    };
    const isChoose = item.GroupIssueId == defaultValue;
    const styleDefault = {
      ...styles.itemMain,
      marginEnd: index + 1 == dataGroup.length ? 8 : 1,
    };
    const styleChoose = {
      ...styles.itemChoose,
      marginEnd: index + 1 == dataGroup.length ? 8 : 1,
    };
    return (
      <TouchableOpacity
        key={`igi_${index}`}
        style={isChoose ? styleChoose : styleDefault}
        onPress={isEnableChoose ? pressItem : null}
      >
        <Text
          style={{
            ...styles.titleView,
            color: isChoose ? appcolor.light : appcolor.dark,
          }}
        >
          {item.ItemName || 'NONE'}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FlatList
        ref={ref}
        horizontal
        key="groupListIssue"
        keyExtractor={(_item, index) => index.toString()}
        data={dataGroup}
        onScrollToIndexFailed={() => {}}
        renderItem={renderItem}
        onLayout={onScrollToIndex}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
