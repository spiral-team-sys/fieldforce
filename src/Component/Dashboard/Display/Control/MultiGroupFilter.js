import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import _ from 'lodash';

const MultiGroupFilter = ({
  isReloadFilter = false,
  pageName,
  data = [],
  containerStyle,
  handlerChangeData,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { dashboardFilter } = useSelector(state => state.dashboard);
  const [dataMain, setDataMain] = useState([]);
  const [dataView, setDataView] = useState([]);
  const [filter, _setFilter] = useState({
    group1: null,
    group2: null,
    group3: null,
  });
  const [itemData, _setItemData] = useState({
    data1: [],
    data2: [],
    data3: [],
  });
  const [_mutate, setMutate] = useState(false);
  const refList = useRef();
  // Data
  const maxGroupLevel = useMemo(() => {
    return data.reduce((max, item) => {
      const keys = Object.keys(item).filter(k => /^group\d+$/.test(k));
      const levels = keys.map(k => parseInt(k.replace('group', ''), 10));
      return Math.max(max, ...levels);
    }, 0);
  }, [data]);

  const LoadData = async () => {
    await setDataMain(data);
    //
    const masterFilter = dashboardFilter[`${pageName}`] || {};
    console.log(masterFilter);

    filter.group1 = masterFilter.group1 || null;
    filter.group2 = masterFilter.group2 || null;
    filter.group3 = masterFilter.group3 || null;
    //
    let dataChange = [];
    if (filter.group3 !== null) {
      dataChange = await onDataFilterChange(3);
    } else if (filter.group2 !== null) {
      dataChange = await onDataFilterChange(2);
    } else if (filter.group1 !== null) {
      dataChange = await onDataFilterChange(1);
    } else {
      dataChange = await onDataFilterChange(0);
    }
    await setDataView(dataChange);
  };
  // Action
  const onHeaderPress = async key => {
    let i = key;
    while (filter[`group${i}`] !== undefined) {
      filter[`group${i}`] = null;
      i++;
    }
    setMutate(e => !e);
    //
    const dataChange = await onDataFilterChange(key - 1);
    await setDataView(dataChange);
    dataChange.length > 0 &&
      refList.current.scrollToIndex({ index: 0, animated: true });
    //
    handlerChangeData && handlerChangeData(filter);
  };
  const onItemPress = async item => {
    const value = filter[`group${item.key}`] == item.name ? null : item.name;
    filter[`group${item.key}`] = value;
    setMutate(e => !e);
    //
    const dataChange = await onDataFilterChange(item.key);
    await setDataView(dataChange);
    dataChange.length > 0 &&
      refList.current.scrollToIndex({ index: 0, animated: true });
    //
    handlerChangeData && handlerChangeData(filter);
  };
  const onDataFilterChange = async level => {
    onClearFilter(level);
    let filteredData = [...dataMain];
    for (let i = 1; i <= level; i++) {
      const name = filter[`group${i}`];
      if (name !== null) {
        filteredData = filteredData.filter(
          item => item[`groupName${i}`] === name,
        );
      }
    }

    const nextLevel = level + 1;
    if (nextLevel <= maxGroupLevel) {
      const nextData = await _.chain(filteredData)
        .uniqBy(`groupName${nextLevel}`)
        .map(item => ({
          id: item[`group${nextLevel}`],
          name: item[`groupName${nextLevel}`],
          key: nextLevel,
        }))
        .value();
      itemData[`data${nextLevel}`] = nextData;
      return nextData;
    }
    return [];
  };
  const onClearFilter = level => {
    for (let i = level + 1; i <= maxGroupLevel; i++) {
      filter[`group${i}`] = null;
    }
  };
  // View
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [data, isReloadFilter]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    itemContainer: {
      minWidth: 80,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      borderRadius: 50,
      marginStart: 8,
      paddingHorizontal: 16,
    },
    headerContainer: { flexDirection: 'row', paddingBottom: 8 },
    titleName: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: fontWeightBold,
      padding: 6,
      textAlign: 'center',
    },
    itemHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
      borderRadius: 50,
      paddingHorizontal: 4,
      marginStart: 8,
    },
    titleHeaderName: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: fontWeightBold,
      padding: 6,
      textAlign: 'center',
    },
  });
  const HeaderFilter = () => {
    let viewItem = [];
    for (let i = 1; i <= maxGroupLevel; i++) {
      const nameKey = `group${i}`;
      if (filter[nameKey]) {
        viewItem.push(
          <TouchableOpacity
            key={nameKey}
            style={styles.itemHeaderContainer}
            onPress={() => onHeaderPress(i)}
          >
            <SpiralIcon
              type="ionicon"
              name="close"
              size={18}
              color={appcolor.light}
            />
            <Text style={styles.titleHeaderName}>{filter[nameKey]}</Text>
          </TouchableOpacity>,
        );
      }
    }
    return <View style={styles.headerContainer}>{viewItem}</View>;
  };
  const renderItem = ({ item }) => {
    const onPress = () => onItemPress(item);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <Text style={styles.titleName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <HeaderFilter />
      {dataView.length > 0 && (
        <FlashList
          ref={refList}
          keyExtractor={(_item, index) => index.toString()}
          horizontal
          data={dataView}
          extraData={[dataView]}
          renderItem={renderItem}
          estimatedItemSize={50}
          estimatedListSize={{ height: 38, width: 80 }}
          ListFooterComponent={<View style={{ paddingEnd: 8 }} />}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};
export default MultiGroupFilter;
