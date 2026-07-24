import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../Themes/AppsStyle';
import { FlashList } from '@shopify/flash-list';
import { DashboardAPI } from '../../API/DashboardAPI';
import { ToastError } from '../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { alertConfirm } from '../../Core/Utility';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const DashboardStoreSummary = ({ info, isReload = false, navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [dataPlan, setDataPlan] = useState([]);
  const [dataSummary, setDataSummary] = useState([]);
  const [dataSheet, setDataSheet] = useState([]);
  const [isShowDetail, setShowDetail] = useState(false);
  //
  const LoadData = async () => {
    await DashboardAPI.GetDashboardStoreSummary(
      shopinfo.shopId,
      async (mData, message) => {
        message && ToastError(message, 'GetDashboardStoreSummary', 'top');
        //
        setDataSummary(mData?.table || []);
        setDataPlan(mData?.table1 || []);
      },
    );
  };
  const handlerShowSummary = () => {
    setShowDetail(e => !e);
  };
  // Action
  const onCallAction = phoneNumber => {
    alertConfirm(
      'Gọi điện thoại',
      `Bạn có chắc muốn gọi đến số điện thoại ${phoneNumber} không?`,
      () => {
        let call =
          Platform.OS == 'ios'
            ? `telprompt:${phoneNumber}`
            : `tel:${phoneNumber}`;
        Linking.canOpenURL(call)
          .then(supported => {
            if (!supported) {
              ToastError(
                'Số điện thoại không đúng hoặc sai định dạng, vui lòng kiểm tra và thử lại sau',
                'Số điện thoại',
              );
            } else {
              return Linking.openURL(call);
            }
          })
          .catch(error => {
            ToastError(`Lỗi: ${error}`);
          });
      },
      () => { },
      'Gọi ngay',
      'Không',
    );
  };
  const handleSelectItem = item => {
    const dataInfo = JSON.parse(item.dataPlan || '[]');
    if (dataInfo.length > 0)
      SheetManager.show('plan-detail-sheet', { payload: dataInfo });
  };
  //
  useEffect(() => {
    LoadData();
  }, [isReload]);

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: appcolor.light,
      marginBottom: 12,
      paddingBottom: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    viewTitleChart: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingBottom: 0,
    },
    itemContainer: {
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      margin: 8,
      marginBottom: 0,
      borderRadius: 8,
      padding: 8,
    },
    titleChart: {
      width: '85%',
      marginEnd: 8,
      color: appcolor.dark,
      marginStart: 8,
      fontWeight: fontWeightBold,
      fontSize: 14,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    titlePage: {
      width: '100%',
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginTop: 8,
    },
    itemPlanContainer: {
      backgroundColor: appcolor.surface,
      margin: 8,
      marginBottom: 0,
      borderRadius: 8,
      padding: 8,
      flexDirection: 'row',
    },
    viewStoreInfo: {
      backgroundColor: appcolor.light,
      margin: 8,
      paddingBottom: 8,
      borderRadius: 8,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    viewPlanByShop: {
      backgroundColor: appcolor.light,
      margin: 8,
      paddingBottom: 8,
      borderRadius: 8,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    viewCall: {
      position: 'absolute',
      end: 8,
      width: 38,
      height: 38,
      borderRadius: 38,
      backgroundColor: appcolor.light,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    viewTitleDate: { flexDirection: 'row', alignItems: 'center' },
    viewSheet: { width: '100%', height: deviceHeight / 1.6 },
    titleSheet: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
  });

  const headerSummary = () => {
    const item = dataSummary[0] || {};
    const dataPCType = JSON.parse(item.typePC || '[]');
    const typePCName =
      dataPCType.length > 0
        ? _.join(
          _.map(
            dataPCType,
            i => `      ${i.CategoryName} - (${i.TotalQuantity})`,
          ),
          '\n',
        )
        : null;
    return (
      <View style={styles.itemContainer}>
        {item.address && (
          <Text style={styles.titleName}>{`Địa chỉ: ${item.address}`}</Text>
        )}
        {item.storeManager && (
          <Text style={styles.titleName}>{`${item.storeManager}`}</Text>
        )}
        {item.openYear && (
          <Text style={styles.titleName}>{`${item.openYear}`}</Text>
        )}
        {item.storeGrade && (
          <Text style={styles.titleName}>{`${item.storeGrade}`}</Text>
        )}
        {item.numberofFSM && (
          <Text style={styles.titleName}>{`${item.numberofFSM}`}</Text>
        )}
        {typePCName && (
          <Text
            style={styles.titleName}
          >{`${item.titleTypePC}\n${typePCName}`}</Text>
        )}
      </View>
    );
  };
  const renderItemPlan = ({ item, index }) => {
    const onCall = () => onCallAction(item?.mobile);
    const onPress = () => handleSelectItem(item);
    return (
      <View>
        {index == 0 && (
          <View style={styles.viewTitleChart}>
            <SpiralIcon
              color={appcolor.primary}
              type="font-awesome-5"
              name="users"
              size={18}
            />
            <Text style={styles.titleChart}>{`Thống kê PG tại cửa hàng`}</Text>
          </View>
        )}
        <TouchableOpacity
          disabled={item.employeeId == 0}
          onPress={onPress}
          style={styles.itemPlanContainer}
        >
          <View style={styles.viewTitleEmployee}>
            <Text style={styles.titleName}>{item.fullName}</Text>
            {item.experience && (
              <Text style={styles.subTitleName}>{item.experience}</Text>
            )}
            {item.shiftType && (
              <Text style={styles.subTitleName}>{`${item.shiftType} ${item.shiftName || ''
                }`}</Text>
            )}
          </View>
          {item?.mobile && (
            <TouchableOpacity onPress={onCall} style={styles.viewCall}>
              <SpiralIcon name="phone" size={16} color={appcolor.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  const renderItemDetail = ({ item }) => {
    return (
      <View style={{ ...styles.itemContainer, flexDirection: 'column' }}>
        <View style={styles.viewTitleDate}>
          <SpiralIcon
            color={appcolor.dark}
            type="font-awesome-5"
            name="calendar-day"
            size={16}
            style={{ marginEnd: 5 }}
          />
          <Text style={styles.titleName}>{item.DateView}</Text>
        </View>
        <Text
          style={styles.subTitleName}
        >{`        ${item.ShiftType} ${item.ShiftName}`}</Text>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.viewTitleChart}
        onPress={handlerShowSummary}
      >
        <SpiralIcon
          color={appcolor.primary}
          type="font-awesome-5"
          name="store"
          size={20}
        />
        <Text style={styles.titleChart}>
          {info !== null ? info.chartName : ''}
        </Text>
        <SpiralIcon
          color={appcolor.greylight}
          type="font-awesome-5"
          name={isShowDetail ? 'caret-up' : 'caret-down'}
          size={18}
        />
      </TouchableOpacity>
      {isShowDetail && (
        <FlashList
          keyExtractor={(_it, index) => index.toString()}
          data={dataPlan}
          extraData={[dataPlan]}
          renderItem={renderItemPlan}
          ListHeaderComponent={headerSummary}
          estimatedItemSize={deviceWidth}
          showsVerticalScrollIndicator={false}
        />
      )}
      <ActionSheet
        id="plan-detail-sheet"
        gestureEnabled
        onBeforeShow={setDataSheet}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.viewSheet}>
          <Text style={styles.titleSheet}>Chi tiết kế hoạch làm việc</Text>
          <FlashList
            keyExtractor={(_it, index) => index.toString()}
            data={dataSheet}
            extraData={[dataSheet]}
            renderItem={renderItemDetail}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            estimatedItemSize={deviceWidth}
            ListFooterComponent={<View style={styles.bottomView} />}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      </ActionSheet>
    </View>
  );
};

export default DashboardStoreSummary;
