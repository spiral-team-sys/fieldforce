import React, { useEffect, useState } from 'react';
import {
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { ToastError, groupDataByKey } from '../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/base';
import { AttendantSummary } from '../Page/AttendantSummary';
import { DisplaySummary } from '../Page/DisplaySummary';
import { SellOutSummary } from '../Page/SellOutSummary';
import { SellInSummary } from '../Page/SellInSummary';
import { InventorySummary } from '../Page/InventorySummary';
import { deviceHeight } from '../../../../Core/Utility';
import { LoadingView } from '../../../../Control/ItemLoading';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const SummaryDataByShop = ({ navigation }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    await DashboardAPI.GetSummaryDataByShop(
      shopinfo.shopId,
      async (mData, message) => {
        message && ToastError(message);
        const { arr } = await groupDataByKey({
          arr: mData,
          key: 'groupId',
        });
        await setData(arr);
      },
    );
    await setLoading(false);
  };
  // Handler
  const onBack = () => {
    navigation.goBack();
  };
  const showDataItem = item => {
    item.isChoose = !(item.isChoose || false);
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentMain: { width: '100%', height: deviceHeight },
    itemMain: { width: '100%', padding: 8 },
    groupTitle: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
  });
  const renderItem = ({ item, index }) => {
    const dashboardData = JSON.parse(item.dashboardData);
    const onPress = () => {
      showDataItem(item);
    };
    const SummaryItem = () => {
      switch (item.ref_Name) {
        case 'ATTENDANT':
          return (
            <AttendantSummary
              key={`ATTENDANT_${index}`}
              summaryData={dashboardData}
            />
          );
        case 'DISPLAY':
          return (
            <DisplaySummary
              key={`DISPLAY_${index}`}
              summaryData={dashboardData}
            />
          );
        case 'SELLOUT':
          return (
            <SellOutSummary
              key={`SELLOUT_${index}`}
              summaryData={dashboardData}
            />
          );
        case 'SELLIN':
          return (
            <SellInSummary
              key={`SELLIN_${index}`}
              summaryData={dashboardData}
            />
          );
        case 'INVENTORY':
          return (
            <InventorySummary
              key={`INVENTORY_${index}`}
              summaryData={dashboardData}
            />
          );
      }
    };
    return (
      <View key={`sdbs_${index}`} style={styles.itemMain}>
        {item.isParent && (
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.groupTitle}>{item.itemName}</Text>
          </TouchableOpacity>
        )}
        {item.isChoose && (
          <View style={styles.contentData}>{SummaryItem()}</View>
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={shopinfo.shopName} leftFunc={onBack} />
      {/* // Content Dashboard */}
      <View style={styles.contentMain}>
        <LoadingView
          isLoading={isLoading}
          title="Đang cập nhật dữ liệu thống kê"
        />
        <FlashList
          keyExtractor={(item, _index) => item.itemId.toString()}
          data={data}
          extraData={[_mutate, data]}
          renderItem={renderItem}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 10 }} />
          }
        />
      </View>
    </View>
  );
};
