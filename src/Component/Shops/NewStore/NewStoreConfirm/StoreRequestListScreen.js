import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { LoadingView } from '../../../../Control/ItemLoading';
import StoreRequestItem from './Items/StoreRequestItem';
import { getListData, STATUS_LABELS } from './StoreRequestUtils';
import { REPORT } from '../../../../API/ReportAPI';
import { toastError } from '../../../../Utils/configToast';

const StoreRequestListScreen = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const reportId = route?.params?.reportId || 21;

  const typeReport = route?.params?.typeReport || 'History';
  const getStatusValue = item => item.Status || item.status;
  const getStatusLabel = item =>
    item.titleConfirm ||
    item.TitleConfirm ||
    STATUS_LABELS[getStatusValue(item)] ||
    'Không xác định';
  const statusTabs = [
    { value: 'ALL', label: 'Tất cả', count: data.length },
    ...Object.values(
      data.reduce((result, item) => {
        const statusValue = getStatusValue(item);
        const key =
          statusValue === null || statusValue === undefined
            ? getStatusLabel(item)
            : statusValue;
        if (!result[key])
          result[key] = { value: key, label: getStatusLabel(item), count: 0 };
        result[key].count += 1;
        return result;
      }, {}),
    ),
  ];
  const dataFilter =
    statusFilter === 'ALL'
      ? data
      : data.filter(item => {
          const statusValue = getStatusValue(item);
          const key =
            statusValue === null || statusValue === undefined
              ? getStatusLabel(item)
              : statusValue;
          return key == statusFilter;
        });

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    tabScroll: { maxHeight: 48, backgroundColor: appcolor.light },
    tabContent: { paddingHorizontal: 8, paddingVertical: 8 },
    tabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      marginEnd: 8,
    },
    tabItemActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    tabText: { color: appcolor.dark, fontSize: 12, fontWeight: '700' },
    tabTextActive: { color: appcolor.light },
    tabCount: {
      minWidth: 20,
      textAlign: 'center',
      marginStart: 6,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
      color: appcolor.dark,
      fontSize: 11,
      fontWeight: '800',
    },
    empty: { padding: 24, alignItems: 'center' },
    emptyText: { color: appcolor.greylight, fontSize: 13, textAlign: 'center' },
  });

  const loadData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    await REPORT.GetDataReportByShop_RealTime(
      { reportId, typeReport },
      async (mData, message) => {
        if (message) toastError('Thông báo', message);
        setData(getListData(mData));
      },
    );
    isRefresh ? setRefreshing(false) : setLoading(false);
  };

  const handleOpenDetail = item => {
    navigation.navigate('storerequestform', {
      requestData: item,
      requestType:
        item.RequestType ||
        item.requestType ||
        item.typeWaiting ||
        item.TypeWaiting,
      reportId,
      isHistory: true,
      title: 'Chi tiết yêu cầu cửa hàng',
    });
  };

  useEffect(() => {
    loadData();
    const reloadEvent = DeviceEventEmitter.addListener(
      'RELOAD_STORE_REQUEST',
      () => loadData(true),
    );
    return () => {
      reloadEvent.remove();
    };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route?.params?.title || 'Lịch sử request'}
        leftFunc={() => navigation.goBack()}
      />
      <LoadingView
        isLoading={loading}
        styles={{ marginTop: 8 }}
        title="Đang cập nhật dữ liệu"
      />
      <ScrollView
        horizontal
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
        showsHorizontalScrollIndicator={false}
      >
        {statusTabs.map(tab => {
          const isActive = statusFilter === tab.value;
          return (
            <TouchableOpacity
              key={`${tab.value}`}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setStatusFilter(tab.value)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <Text style={styles.tabCount}>{tab.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <CustomListView
        data={dataFilter}
        renderItem={({ item }) => (
          <StoreRequestItem item={item} onPress={handleOpenDetail} />
        )}
        onRefresh={() => loadData(true)}
        isRefresh={refreshing}
        ListEmpty={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Không có yêu cầu cửa hàng</Text>
          </View>
        }
      />
    </View>
  );
};

export default StoreRequestListScreen;
