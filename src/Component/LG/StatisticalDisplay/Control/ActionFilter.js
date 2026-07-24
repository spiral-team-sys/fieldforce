import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const ActionFilter = ({ itemFilter, handlerFilterData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    return () => {
      isMounted = false;
    };
  }, []);

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', backgroundColor: appcolor.light },
    titleHead: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 16,
    },
    contentFilter: { width: '100%', padding: 8, paddingTop: 0 },
    viewSortMain: { width: '100%', flexDirection: 'row', paddingVertical: 8 },
    titleAction: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
    titleValueAction: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
      padding: 8,
      paddingEnd: 3,
    },
    headAction: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingStart: 8,
    },
    valueAction: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingEnd: 8,
    },
    actionHCP: {
      backgroundColor: appcolor.surface,
      marginEnd: 8,
      borderRadius: 5,
      paddingHorizontal: 4,
    },
    titleHCPAction: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 8,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleHead}>Lọc theo</Text>
      <View style={styles.contentFilter}>
        <SortList
          key="sort-list"
          styles={styles}
          appcolor={appcolor}
          itemFilter={itemFilter}
          onFilter={handlerFilterData}
        />
        <HeadCountPlan
          key="headcount-plan-list"
          styles={styles}
          appcolor={appcolor}
          itemFilter={itemFilter}
          onFilter={handlerFilterData}
        />
      </View>
    </View>
  );
};
export const SortList = ({ styles, appcolor, itemFilter, onFilter }) => {
  const [newestValue, setNewestValue] = useState(true);
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    setNewestValue(itemFilter.newest);
    return () => {
      isMounted = false;
    };
  }, [itemFilter.newest]);

  const onSortData = () => {
    const _value = !newestValue;
    itemFilter.newest = _value;
    onFilter(itemFilter);
    setNewestValue(_value);
  };
  //
  const titleValue = newestValue ? 'Mới nhất' : 'Cũ nhất';
  const iconName = newestValue ? 'arrow-down-outline' : 'arrow-up-outline';
  return (
    <TouchableOpacity style={styles.viewSortMain} onPress={onSortData}>
      <View style={styles.headAction}>
        <SpiralIcon
          type="ionicon"
          name="calendar-outline"
          color={appcolor.dark}
        />
        <Text style={styles.titleAction}>Ngày báo cáo</Text>
      </View>
      <View style={styles.valueAction}>
        <Text style={styles.titleValueAction}>{titleValue}</Text>
        <SpiralIcon
          type="ionicon"
          name={iconName}
          color={appcolor.primary}
          size={16}
        />
      </View>
    </TouchableOpacity>
  );
};
export const HeadCountPlan = ({ styles, appcolor, itemFilter, onFilter }) => {
  const [headCountType, setHeadCountType] = useState(null);
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    setHeadCountType(itemFilter.headcount);
    return () => {
      isMounted = false;
    };
  }, [itemFilter.headcount]);

  const handlerChoose = value => {
    itemFilter.headcount = value;
    onFilter(itemFilter);
    setHeadCountType(value);
  };
  const onChoose_PCShop = () => {
    const _value = headCountType == 'PC Shop' ? null : 'PC Shop';
    handlerChoose(_value);
  };
  const onChoose_NON_PCShop = () => {
    const _value = headCountType == 'Non-PC Shop' ? null : 'Non-PC Shop';
    handlerChoose(_value);
  };
  //
  return (
    <View style={styles.viewSortMain}>
      <View style={styles.headAction}>
        <SpiralIcon
          type="ionicon"
          name="people-circle-outline"
          color={appcolor.dark}
        />
        <Text style={styles.titleAction}>Head Count Plan</Text>
      </View>
      <View style={{ ...styles.valueAction, paddingEnd: 0 }}>
        <TouchableOpacity
          style={{
            ...styles.actionHCP,
            backgroundColor:
              headCountType == 'PC Shop' ? appcolor.primary : appcolor.surface,
          }}
          onPress={onChoose_PCShop}
        >
          <Text
            style={{
              ...styles.titleHCPAction,
              color:
                headCountType == 'PC Shop' ? appcolor.light : appcolor.dark,
            }}
          >
            {`PC Shop`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.actionHCP,
            backgroundColor:
              headCountType == 'Non-PC Shop'
                ? appcolor.primary
                : appcolor.surface,
          }}
          onPress={onChoose_NON_PCShop}
        >
          <Text
            style={{
              ...styles.titleHCPAction,
              color:
                headCountType == 'Non-PC Shop' ? appcolor.light : appcolor.dark,
            }}
          >
            {`Non-PC Shop`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
