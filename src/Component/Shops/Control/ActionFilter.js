import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { deviceHeight, fontWeightBold } from '../../../Themes/AppsStyle';
import { FilterData } from './FilterData';
import { SheetManager } from 'react-native-actions-sheet';
import { SET_SearchData } from '../../../Redux/action';

export const ActionFilter = ({ itemFilter, handlerFilterData }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);

  //
  const onCloseView = async () => {
    await SheetManager.hide('sheetSortStore');
  };
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
    mainContainer: {
      width: '100%',
      height: deviceHeight / 1.3,
      backgroundColor: appcolor.light,
    },
    titleHead: {
      width: '85%',
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 16,
    },
    contentFilter: { width: '100%', padding: 8, paddingTop: 0 },
    viewSortMain: {
      width: '100%',
      flexDirection: 'row',
      paddingVertical: 8,
      paddingBottom: 50,
    },
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
    actionDealder: { width: '15%', alignItems: 'center', padding: 8 },
    viewTitlteHead: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionCloseView: { width: '15%', padding: 8, alignItems: 'center' },
    titleReset: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.dark,
      paddingEnd: 5,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewTitlteHead}>
        <Text style={styles.titleHead}>Lọc theo</Text>
        <TouchableOpacity style={styles.actionCloseView} onPress={onCloseView}>
          <SpiralIcon
            name="close"
            type="ionicon"
            color={appcolor.dark}
            size={24}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.contentFilter}
        showsVerticalScrollIndicator={false}
      >
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
        <DealerFilter
          styles={styles}
          appcolor={appcolor}
          reportId={kpiinfo.id}
        />
      </ScrollView>
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
  const titleValue = newestValue ? 'Lớn nhất' : 'Nhỏ nhất';
  const iconName = newestValue ? 'arrow-down-outline' : 'arrow-up-outline';
  return (
    <TouchableOpacity style={styles.viewSortMain} onPress={onSortData}>
      <View style={styles.headAction}>
        <SpiralIcon
          type="ionicon"
          name="business-outline"
          color={appcolor.dark}
        />
        <Text style={styles.titleAction}>Quy mô</Text>
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
export const DealerFilter = ({ styles, appcolor, reportId }) => {
  const dispatch = useDispatch();
  //
  const onResetFilter = async () => {
    await dispatch(
      SET_SearchData({ areaName: null, provinceName: null, dealerName: null }),
    );
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    return () => {
      isMounted = false;
    };
  }, []);
  //
  return (
    <View style={{ ...styles.viewSortMain, flexDirection: 'column' }}>
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ ...styles.headAction, width: '85%' }}>
          <SpiralIcon
            type="ionicon"
            name="list-circle-outline"
            color={appcolor.dark}
          />
          <Text style={styles.titleAction}>NPP - Miền - Tỉnh/TP</Text>
        </View>
        <TouchableOpacity style={styles.actionDealder} onPress={onResetFilter}>
          <SpiralIcon
            name={'sync'}
            type="ionicon"
            size={24}
            color={appcolor.dark}
          />
        </TouchableOpacity>
      </View>
      <FilterData reportId={reportId} />
    </View>
  );
};
