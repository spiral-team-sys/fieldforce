import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import { TODAY, deviceHeight, deviceWidth } from '../../../Core/Utility';
import { REPORT } from '../../../API/ReportAPI';
import { ToastError, removeVietnameseTones } from '../../../Core/Helper';
import { saveJsonData } from '../../../Controller/ReportController';
import { Icon, Switch, Text } from '@rneui/base';
import FormGroup from '../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import _ from 'lodash';
import { FieldCoachingDetails } from './FieldCoachingDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const FieldCoachingForEmployee = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [dataCoaching, setDataCoaching] = useState([]);
  const [beforeData, setBeforeData] = useState({});
  const [_mutate, setMutate] = useState(false);
  //
  const parseList = value => {
    try {
      if (Array.isArray(value)) {
        return value;
      }
      return JSON.parse(value || '[]');
    } catch (_e) {
      return [];
    }
  };
  const LoadData = async () => {
    await setLoading(true);
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
      mesager && ToastError(mesager);
      const listData = Array.isArray(mData) ? mData : [];
      await setDataMain(listData);
      await setDataCoaching(listData);
    });
    await setLoading(false);
  };
  // Handler
  const onFilterEmployee = text => {
    const keyword = removeVietnameseTones(text || '').toLowerCase();
    const dataSearch = _.filter(dataMain, e => {
      return removeVietnameseTones(e.EmployeeName || '')
        .toLowerCase()
        .match(keyword);
    });
    setDataCoaching(dataSearch);
  };
  const onChooseCoaching = (item, dataGroup) => {
    item.DataGroup = JSON.stringify(dataGroup);
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMain);
  };
  const onShowDetail = (itemCoaching, mData, mDetails) => {
    // Validate Data
    const lstCoach = _.filter(mData, e => {
      return e.isSelected == true;
    });
    if (lstCoach !== null && lstCoach.length > 0) {
      const data = {
        itemCoaching: itemCoaching,
        dataCoach: lstCoach,
        dataDetails: mDetails,
      };
      SheetManager.show('detailcoaching', { payload: data });
    } else {
      ToastError(
        `Bạn chưa chọn bài đánh giá của ${itemCoaching.EmployeeCode} - ${itemCoaching.EmployeeName} trước khi đánh giá tiêu chí`,
      );
    }
  };
  const onBeforeShowDetail = data => {
    setBeforeData(data?.payload || data || {});
  };
  const onSaveDataDetails = () => {
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMain);
  };
  const onCloseView = item => {
    const lstUpdate = _.map(dataMain, e => {
      return e.EmployeeCode == item.EmployeeCode ? { ...e, isUploaded: 1 } : e;
    });
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, lstUpdate);
    SheetManager.hideAll();
    LoadData();
  };
  //
  useEffect(() => {
    const _loaddata = LoadData();
    return () => _loaddata;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    titleHeader: {
      width: '95%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.light,
    },
    viewHeader: {
      flexDirection: 'row',
      padding: 8,
      backgroundColor: appcolor.info,
      alignItems: 'center',
    },
    searchView: { margin: 8, padding: 5, borderRadius: 20 },
    searchInputView: { fontSize: 13, color: appcolor.dark },
    mainItem: {
      margin: 8,
      borderWidth: 0.8,
      borderRadius: 8,
      overflow: 'hidden',
      borderColor: appcolor.info,
    },
    childItemMain: { padding: 8, flexDirection: 'row', alignItems: 'center' },
    childTitleMain: {
      flex: 1,
      fontSize: 13,
      fontWeight: '400',
      color: appcolor.dark,
    },
    contentAction: { width: '100%', height: '100%' },
    sheetContainer: {
      height: deviceHeight * 0.92,
      width: deviceWidth,
      backgroundColor: appcolor.light,
    },
  });
  // View
  const renderItem = ({ item, index }) => {
    const dataGroup = parseList(item.DataGroup);
    const dataSurvey = parseList(item.DataSurvey);
    const lockUploaded = (item?.isUploaded || 0) == 1;
    const handlerShowDetail = () => {
      onShowDetail(item, dataGroup, dataSurvey);
    };
    return (
      <View key={`chbpg_${index}`} style={styles.mainItem}>
        <TouchableOpacity style={styles.viewHeader} onPress={handlerShowDetail}>
          <Text
            style={styles.titleHeader}
          >{`${item.EmployeeCode} - ${item.EmployeeName}`}</Text>
          <SpiralIcon
            type="font-awesome-5"
            name="angle-right"
            color={appcolor.light}
            size={20}
          />
        </TouchableOpacity>
        <View>
          {dataGroup !== null &&
            dataGroup.length > 0 &&
            dataGroup.map((i, idx) => {
              const handlerChangeValue = value => {
                i.isSelected = value;
                onChooseCoaching(item, dataGroup);
              };
              return (
                <View key={`child_pp_${idx}`} style={styles.childItemMain}>
                  <Text style={styles.childTitleMain}>{i.GroupName}</Text>
                  <Switch
                    disabled={lockUploaded}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    trackColor={{ true: appcolor.success }}
                    thumbColor={appcolor.white}
                    value={i.isSelected}
                    onValueChange={handlerChangeValue}
                  />
                </View>
              );
            })}
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => {
          navigation.goBack();
        }}
      />
      <FormGroup
        editable
        containerStyle={styles.searchView}
        inputStyle={styles.searchInputView}
        placeholder="Tìm kiếm nhân viên"
        iconName="search"
        handleChangeForm={onFilterEmployee}
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <FlatList
        key="coaching"
        keyExtractor={(_item, index) => index.toString()}
        data={dataCoaching}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={{ paddingBottom: deviceHeight / 2 }} />
        }
      />
      <ActionSheet
        id="detailcoaching"
        gestureEnabled
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={StyleSheet.flatten([
          styles.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
        onBeforeShow={onBeforeShowDetail}
      >
        <View style={styles.contentAction}>
          <FieldCoachingDetails
            key={beforeData?.itemCoaching?.EmployeeCode || 'detailcoaching'}
            itemCoaching={beforeData?.itemCoaching || {}}
            dataGroup={beforeData?.dataCoach || []}
            dataDetails={beforeData?.dataDetails || []}
            onSaveData={onSaveDataDetails}
            onCloseView={onCloseView}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
