import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { REPORT } from '../../../../API/ReportAPI';
import { toastError } from '../../../../Utils/configToast';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { Button, Divider, Icon, Text } from '@rneui/base';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ProgramDetails from '../Page/ProgramDetails';
import { formatNumber, removeVietnameseTones } from '../../../../Core/Helper';
import CustomTab from '../../../../Control/Custom/CustomTab';
import moment from 'moment';
import _ from 'lodash';

const ProgramScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [itemDetail, setItemDetail] = useState({});

  const LoadData = async () => {
    const params = {
      shopId: shopinfo.shopId,
      reportId: kpiinfo.id,
    };
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      const grouplist = _.unionBy(mData, 'programTypeName');
      setDataTab(grouplist);
      setDataMain(mData);
      setData(mData);
    });
  };
  const onRegiserProgram = async item => {
    await SheetManager.hide('detail-item-sheet');
    await navigation.navigate('registerprogram', item);
  };
  const onSearchData = async text => {
    const dataFilter = await _searchData(text);
    setData(dataFilter);
  };
  const _searchData = async text => {
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    return await _.filter(
      dataMain,
      e =>
        removeVietnameseTones(e.programName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.programCode).toLowerCase().match(valueSearch),
    );
  };
  const onBack = () => {
    navigation.goBack();
  };
  const onShowDetail = item => {
    SheetManager.show('detail-item-sheet', { payload: item });
  };
  const onCloseSheet = () => {
    SheetManager.hide('detail-item-sheet');
  };

  useEffect(() => {
    const reload_data = DeviceEventEmitter.addListener(
      'RELOAD_DATA_PROGRAMS',
      LoadData,
    );
    LoadData();
    return () => {
      reload_data.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1 },
    viewInfo: {
      backgroundColor: appcolor.surface,
      padding: 8,
      marginVertical: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
    },
    itemInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: { fontSize: 12, color: appcolor.dark, fontWeight: '500' },
    subTitleValue: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
      textAlign: 'right',
    },
    tagName: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      padding: 4,
    },
    itemContainer: {
      flex: 1,
      padding: 8,
      margin: 8,
      marginBottom: 0,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    sheetContainer: { flex: 1, backgroundColor: appcolor.light },
    sheetContent: {
      height: deviceHeight * 0.92,
      marginTop: Platform.OS == 'ios' ? 42 : 8,
      marginHorizontal: 8,
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      padding: 8,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    tagProgram: {
      backgroundColor: appcolor.red,
      minWidth: 90,
      borderRadius: 16,
      alignItems: 'center',
      padding: 2,
      paddingHorizontal: 8,
    },
    viewHeader: { alignItems: 'flex-start' },
    actionRegister: {
      backgroundColor: appcolor.warning,
      width: 90,
      borderRadius: 16,
      alignItems: 'center',
      alignSelf: 'flex-end',
      padding: 2,
    },
    registerName: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.black,
      padding: 4,
    },
    viewAction: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textAlign: 'center',
      padding: 8,
    },
    titleConfirm: {
      fontSize: 12,
      color: appcolor.placeholderText,
      fontWeight: fontWeightBold,
      textAlign: 'right',
      fontStyle: 'italic',
    },
  });
  const renderItem = ({ item }) => {
    const onPress = () => onShowDetail(item);
    const onRegiser = () => onRegiserProgram(item);
    return (
      <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
        <View style={styles.viewHeader}>
          <Text style={styles.titleName}>{`${item.programName}`}</Text>
          <Text
            style={[styles.subTitleName, { color: appcolor.placeholderText }]}
          >{`${item.fromDate} - ${item.toDate}`}</Text>
        </View>
        <View style={styles.viewInfo}>
          <View style={styles.itemInfo}>
            <Text style={styles.subTitleName}>{`${
              item.t1 || `Hình thức thưởng`
            }`}</Text>
            <Text style={styles.subTitleValue}>
              {item.awardValue
                ? `${formatNumber(item.awardValue, ',')} ${
                    item.awardTypeName || ''
                  }`
                : '--'}
            </Text>
          </View>
          {item.targetAmount > 0 && (
            <View style={styles.itemInfo}>
              <Text style={styles.subTitleName}>{`${
                item.t2 || `Doanh số mục tiêu`
              }`}</Text>
              <Text style={styles.subTitleValue}>{`${formatNumber(
                item.targetAmount,
                ', ',
              )} VNĐ`}</Text>
            </View>
          )}
          {item.totalAwardValue > 0 && (
            <View style={styles.itemInfo}>
              <Text style={styles.subTitleName}>{`${
                item.t3 || `Tổng thưởng`
              }`}</Text>
              <Text style={styles.subTitleValue}>{`${formatNumber(
                item.totalAwardValue,
                ',',
              )} VNĐ`}</Text>
            </View>
          )}
          {item.awardName && (
            <Text
              style={[styles.subTitleValue, { marginTop: 8 }]}
            >{`${item.awardName}`}</Text>
          )}
        </View>
        {item.isLockRegister == 0 ? (
          <View>
            <Divider color={appcolor.gray} style={{ marginBottom: 8 }} />
            <TouchableOpacity onPress={onRegiser} style={styles.actionRegister}>
              <Text style={styles.registerName}>{`Đăng ký`}</Text>
            </TouchableOpacity>
          </View>
        ) : item.confirmStatus ? (
          <View>
            <Divider color={appcolor.gray} style={{ marginBottom: 8 }} />
            <View style={styles.createDate}>
              <Text
                style={[
                  styles.titleConfirm,
                  { color: appcolor[item.confirmColor] },
                ]}
              >{`${item.confirmStatus || ''} ${
                item.confirmDate ? moment(item.confirmDate).fromNow() : ''
              }`}</Text>
            </View>
          </View>
        ) : (
          <View />
        )}
      </TouchableOpacity>
    );
  };
  const renderTab = item => {
    const dataDetails = _.filter(
      data,
      e => e.programTypeName == item.programTypeName,
    );
    return (
      <CustomListView
        data={dataDetails}
        extraData={dataDetails}
        renderItem={renderItem}
        onRefresh={LoadData}
      />
    );
  };
  // console.log('itemDetail', itemDetail)
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title="Danh sách gói bày" leftFunc={onBack} />
      <SearchData
        placeholder="Tìm kiếm gói trưng bày"
        onSearchData={onSearchData}
      />
      <View style={styles.contentContainer}>
        <CustomTab
          data={dataTab}
          dataMain={data}
          keyTabName="programTypeName"
          renderItem={renderTab}
        />
      </View>
      <ActionSheet
        id="detail-item-sheet"
        drawUnderStatusBar
        statusBarTranslucent={false}
        safeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onBeforeShow={setItemDetail}
        containerStyle={StyleSheet.flatten([
          styles.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.sheetContent}>
          <Text style={styles.titleHead}>{itemDetail.programName}</Text>
          <CustomListView
            data={['DETAILS']}
            renderItem={() => {
              return (
                <ProgramDetails item={itemDetail} onShowDocument={() => {}} />
              );
            }}
            bottomView={{ paddingBottom: 8 }}
          />
          <View style={styles.viewAction}>
            <Button
              title="Đóng"
              containerStyle={{
                width: itemDetail.isLockRegister == 0 ? '40%' : '100%',
              }}
              buttonStyle={{
                backgroundColor: appcolor.light,
                borderRadius: 32,
                borderWidth: 1,
                borderColor: appcolor.primary,
              }}
              titleStyle={{
                fontSize: 13,
                fontWeight: fontWeightBold,
                color: appcolor.primary,
                padding: 8,
              }}
              onPress={onCloseSheet}
            />
            {itemDetail.isLockRegister == 0 && (
              <Button
                iconRight
                title="Đăng ký ngay"
                containerStyle={{ width: '59%' }}
                buttonStyle={{
                  backgroundColor: appcolor.second,
                  borderRadius: 32,
                }}
                titleStyle={{
                  fontSize: 13,
                  fontWeight: fontWeightBold,
                  color: appcolor.light,
                  padding: 8,
                }}
                icon={
                  <SpiralIcon
                    type="ionicon"
                    name="send"
                    color={appcolor.light}
                    size={16}
                  />
                }
                onPress={() => onRegiserProgram(itemDetail)}
              />
            )}
          </View>
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};

export default ProgramScreen;
