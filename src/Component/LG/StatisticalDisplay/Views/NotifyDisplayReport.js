import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { ToastError, ToastSuccess } from '../../../../Core/Helper';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { FlashList } from '@shopify/flash-list';
import { NotificationAPI } from '../../../../API/NotificationAPI';

export const NotifyDisplayReport = ({ itemData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    try {
      await DashboardAPI.GetDataRequiredReport(
        itemData.shopId,
        itemData.reportId,
        async (mData, message) => {
          message && ToastError(message);
          setData(mData);
        },
      );
    } catch (e) {
      ToastError(`Lỗi dữ liệu: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handlerSendRequest = async item => {
    item.isSended = 1;
    setMutate(e => !e);
    //
    const itemSend = {
      ...item,
      title: 'Quản lí yêu cầu làm báo cáo',
      body: `Quản lí yêu cầu bạn làm báo cáo Trưng bày của cửa hàng ${item.shopCode} - ${item.shopName} trước khi Check-Out, Vui lòng thực hiện sau đó bạn mới được Check-Out !`,
    };
    await NotificationAPI.RequestReportNotify(itemSend, async result => {
      ToastSuccess(result.messager, 'Thông báo', 'top');
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [itemData]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    loadingView: {
      position: 'absolute',
      top: 0,
      end: 0,
      bottom: 0,
      start: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleHead: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      padding: 8,
      textAlign: 'center',
      color: appcolor.dark,
    },
    titleContentHead: {
      fontSize: 12,
      fontWeight: '500',
      padding: 8,
      textAlign: 'center',
      color: appcolor.dark,
      textDecorationLine: 'underline',
    },
    contentMain: { width: '100%', minHeight: 100 },
    itemMain: {
      width: '100%',
      padding: 8,
      paddingBottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewHeader: { width: '60%' },
    titleMain: { flexDirection: 'row', alignItems: 'center' },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    contentName: { fontSize: 11, fontWeight: '500', color: appcolor.greylight },
    viewActionRequest: { width: '40%', alignItems: 'flex-end', paddingEnd: 16 },
    actionRequest: {
      backgroundColor: appcolor.surface,
      padding: 5,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    titleRequest: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
  });

  if (loading)
    return (
      <ActivityIndicator
        size="small"
        color={appcolor.dark}
        style={styles.loadingView}
      />
    );
  const renderItem = ({ item, index }) => {
    const onPress = () =>
      item.isSended == 1 ? null : handlerSendRequest(item);
    const backgroundColor =
      item.isSended == 1 ? appcolor.light : appcolor.surface;
    const color = item.isSended == 1 ? appcolor.success : appcolor.dark;
    return (
      <View key={`ndr-i${index}`} style={styles.itemMain}>
        <View style={styles.viewHeader}>
          <View style={styles.titleMain}>
            <SpiralIcon
              type="ionicon"
              name="person-circle"
              size={24}
              color={appcolor.dark}
              style={{ padding: 8 }}
            />
            <View>
              <Text style={styles.titleName}>{item.employeeName}</Text>
              <Text style={styles.contentName}>{item.employeeCode}</Text>
              <Text style={{ ...styles.contentName, fontStyle: 'italic' }}>
                {item.statusDisplay}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.viewActionRequest}>
          <TouchableOpacity
            style={{ ...styles.actionRequest, backgroundColor }}
            onPress={onPress}
          >
            <Text style={{ ...styles.titleRequest, color }}>
              {item.isSended == 1 ? 'Đã gửi' : 'Yêu cầu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleHead}>{itemData.shopName}</Text>
      <Text style={styles.titleContentHead}>
        {data.length > 0
          ? `Lịch làm việc hôm nay`
          : `Không có nhân viên làm việc hôm nay`}
      </Text>
      <View style={styles.contentMain}>
        <FlashList
          key="notify-dislay-report"
          keyExtractor={(_item, index) => index.toString()}
          estimatedItemSize={50}
          data={data}
          extraData={[data]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};
