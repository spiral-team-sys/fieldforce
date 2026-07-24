import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { MessageInfo, UUIDGenerator } from '../../Core/Helper';
import { REPORT } from '../../API/ReportAPI';
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import {
  TODAY,
  alertConfirm,
  checkNetwork,
  deviceWidth,
} from '../../Core/Utility';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { toastError } from '../../Utils/configToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VerifyDetailModal } from './Page/VerifyDetailModal';
import { VerifyCard } from './Page/VerifyCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const groupByWeek = (list = []) => {
  const grouped = {};

  list.forEach(item => {
    const key = `Tuần ${item.weekByYear}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return Object.keys(grouped)
    .sort((a, b) => {
      const numA = parseInt(a.replace('Tuần ', ''), 10);
      const numB = parseInt(b.replace('Tuần ', ''), 10);
      return numB - numA;
    })
    .map(title => ({
      title,
      data: grouped[title].sort(
        (a, b) => new Date(b.salesDate) - new Date(a.salesDate),
      ),
    }));
};

const getStatusSummary = (list = [], dataTab = []) => {
  return dataTab.reduce((summary, tab) => {
    if (!tab?.ref_Code) return summary;

    summary[tab.ref_Code] =
      tab.ref_Id == null
        ? list.length
        : list.filter(x => isTabMatched(x, tab, dataTab)).length;

    return summary;
  }, {});
};

const getTabField = (tab = {}) => {
  return tab.ref_Name || tab.ref_Field || 'confirm';
};

const getTabKey = (tab = {}) => {
  if (tab.ref_Id == null) return 'ALL';

  return `${getTabField(tab)}:${normalizeTabValue(tab.ref_Id)}`;
};

const normalizeTabValue = value => {
  if (value === false) return '0';
  if (value === true) return '1';
  return String(value);
};

const hasTabByField = (dataTab = [], fieldName) => {
  return dataTab.some(tab => getTabField(tab) === fieldName);
};

const isTabMatched = (item = {}, tab = {}, dataTab = []) => {
  const field = getTabField(tab);
  if (
    field === 'confirm' &&
    normalizeTabValue(tab.ref_Id) === '0' &&
    hasTabByField(dataTab, 'yeuCauGiaiTrinh') &&
    normalizeTabValue(item?.yeuCauGiaiTrinh) === '0'
  ) {
    return false;
  }

  return normalizeTabValue(item?.[field]) === normalizeTabValue(tab.ref_Id);
};

const normalizeDataTab = (dataTab = []) => {
  return Array.isArray(dataTab)
    ? [...dataTab].sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0))
    : [];
};

const colorStatusMapping = dataStatus => {
  let colorByData = {};
  dataStatus.forEach(tab => {
    if (tab.ref_Id != null && getTabField(tab) === 'confirm') {
      colorByData[tab.ref_Id] = tab.isColor;
    }
  });
  return colorByData;
};

const lableStatusMapping = dataStatus => {
  let lableByData = {};
  dataStatus.forEach(tab => {
    if (tab.ref_Id != null && getTabField(tab) === 'confirm') {
      lableByData[tab.ref_Id] = tab.nameVN;
    }
  });
  return lableByData;
};

/**
 * ==========================
 * COMPONENT
 * ==========================
 */
const getCacheDate = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}${month}${day}`;
};

const createDefaultFilter = () => ({
  year: new Date().getFullYear(),
  yearname: `Năm ${new Date().getFullYear()}`,
  month: new Date().getMonth() + 1,
  monthname: `Tháng ${new Date().getMonth() + 1}`,
  cacheDate: getCacheDate(),
});

const HomeSaleExplain = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const employee = route.params?.employee || {};
  const routeFilter = route.params?.filter || null;
  const defaultFilter = createDefaultFilter();
  const initialFilter = routeFilter
    ? {
        ...defaultFilter,
        ...routeFilter,
        monthname:
          routeFilter.monthname ||
          `Tháng ${routeFilter.month || defaultFilter.month}`,
        yearname:
          routeFilter.yearname ||
          `Năm ${routeFilter.year || defaultFilter.year}`,
        cacheDate: routeFilter.cacheDate || getCacheDate(),
      }
    : defaultFilter;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataTab, setDataTab] = useState([]);
  const [dataInput, setDataInput] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [visibleDetail, setVisibleDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState(initialFilter);
  const [colorStatus, setColorStatus] = useState({});
  const [lableStatus, setLableStatus] = useState({});

  const [currentRole, setCurrentRole] = useState(null); // "leader"/"employee" để chuyển đổi form

  const KeyStore = `SALEEXPLAIN_${userinfo.employeeId}_${kpiinfo.id}`;

  const buildFilterCache = (selectedFilter = filter) => ({
    ...selectedFilter,
    cacheDate: getCacheDate(),
  });

  const getValidCacheFilter = async () => {
    const dataCache = await AsyncStorage.getItem(KeyStore);
    if (!dataCache) return null;

    const itemCache = JSON.parse(dataCache || '{}');
    if (itemCache.cacheDate !== getCacheDate()) {
      await AsyncStorage.removeItem(KeyStore);
      return null;
    }

    return itemCache;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (reload, selectedFilter = filter) => {
    try {
      setLoading(true);
      const cacheData =
        reload || employee?.employeeId > 0
          ? selectedFilter
          : (await getValidCacheFilter()) || createDefaultFilter();

      const month = cacheData?.month || selectedFilter.month;
      const year = cacheData?.year || selectedFilter.year;
      const params = {
        reportId: kpiinfo.id,
        month,
        year,
        userId: employee?.employeeId || null,
        typeReport: 'GET_DATA',
      };
      if (selectedFilter.month != month || selectedFilter.year != year) {
        setFilter({
          ...selectedFilter,
          month,
          year,
          monthname: cacheData.monthname || `Tháng ${month}`,
          yearname: cacheData.yearname || `Năm ${year}`,
        });
      }

      await REPORT.GetDataReportByShop_RealTime(params, async mData => {
        const dataResult = mData[0] || [];

        const rawData = JSON.parse(dataResult.dataMain || '[]');
        const normalizedData = rawData.map(item => ({
          ...item,
          guid: item.guid || UUIDGenerator(),
          photos: Array.isArray(item.photos) ? item.photos : [],
        }));
        setData(normalizedData);

        const parsedDataTab = normalizeDataTab(
          JSON.parse(dataResult.dataTab || '[]'),
        );
        setLableStatus(lableStatusMapping(parsedDataTab));
        setColorStatus(colorStatusMapping(parsedDataTab));
        // setData(JSON.parse(dataResult.dataMain || '[]'));
        setDataTab(parsedDataTab);

        setDataInput(JSON.parse(dataResult.dataInput || '[]'));
        setCurrentRole(dataResult.typeAction || 'employee');
      });
    } catch (error) {
      toastError('Thông báo', 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (selectedStatus === 'ALL') return data;
    const selectedTab = dataTab.find(tab => getTabKey(tab) === selectedStatus);
    if (!selectedTab) return data;

    return data.filter(item => isTabMatched(item, selectedTab, dataTab));
  }, [data, dataTab, selectedStatus]);

  const sections = useMemo(() => groupByWeek(filteredData), [filteredData]);
  const summary = useMemo(
    () => getStatusSummary(data, dataTab),
    [data, dataTab],
  );

  const onOpenDetail = item => {
    setSelectedItem({
      ...item,
      guid: item.guid || UUIDGenerator(),
    });
    setVisibleDetail(true);
  };

  const onCloseDetail = () => {
    setVisibleDetail(false);
    setSelectedItem(null);
  };

  const onSubmitExplain = async formData => {
    const isNetwork = await checkNetwork();

    if (!isNetwork) {
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    const payload = {
      ...formData,
      photos: JSON.stringify(formData.photos || []),
      confirm: 3,
      typeAction: 'employee',
    };

    alertConfirm(
      'Gửi thông tin',
      'Bạn có chắc chắn muốn gửi thông tin không ?',
      async () => {
        try {
          setSubmitting(true);

          const shop = {
            shopId: formData.shopId,
            auditDate: TODAY,
          };

          const result = await REPORT.UploadDataRaw_Realtime(
            payload,
            shop,
            kpiinfo.id,
          );

          if (result.statusId == 200) {
            const newData = data.map(item =>
              item.id === formData.id
                ? {
                    ...item,
                    verifyNote: formData.verifyNote,
                    verifyIMEI: formData.verifyIMEI,
                    photos: formData.photos || [],
                    guid: formData.guid || item.guid || UUIDGenerator(),
                    confirm: 3,
                  }
                : item,
            );

            setData(newData);
            onCloseDetail();
            MessageInfo(
              result.messager ||
                'Gửi giải trình thành công, đang chờ leader duyệt.',
            );
          } else {
            MessageInfo(result.messager || 'Gửi giải trình thất bại.');
          }
        } catch (error) {
          console.log('onSubmitExplain error', error);
          MessageInfo('Có lỗi khi gửi giải trình, vui lòng thử lại sau.');
        } finally {
          setSubmitting(false);
        }
      },
    );
  };

  const onLeaderConfirm = async payload => {
    alertConfirm(
      'Gửi thông tin',
      `Bạn có chắc chắn muốn ${
        payload.confirm == -1 ? 'Từ chối' : 'đồng ý'
      } giải trình này không ?`,
      async () => {
        try {
          setSubmitting(true);

          const shop = {
            shopId: payload.shopId,
            auditDate: TODAY,
          };

          const result = await REPORT.UploadDataRaw_Realtime(
            payload,
            shop,
            kpiinfo.id,
          );

          if (result.statusId == 200) {
            setData(prev =>
              prev.map(item =>
                item.id === payload.id
                  ? {
                      ...item,
                      confirm: payload.confirm,
                      confirmNote: payload.confirmNote,
                      confirmTime: new Date().toISOString(),
                    }
                  : item,
              ),
            );

            onCloseDetail();

            MessageInfo(
              result.messager ||
                `Đã ${
                  payload.confirm == -1 ? 'từ chối' : 'đồng ý'
                } giải trình.`,
            );
          } else {
            MessageInfo(
              result.messager ||
                `Xử lý thất bại, không thể ${
                  payload.confirm == -1 ? 'từ chối' : 'đồng ý'
                } giải trình.`,
            );
          }
        } catch (error) {
          console.log('onLeaderConfirm error', error);
          MessageInfo(
            `Có lỗi khi xử lý giải trình, không thể ${
              payload.confirm == -1 ? 'từ chối' : 'đồng ý'
            } giải trình.`,
          );
        } finally {
          setSubmitting(false);
        }
      },
    );
  };

  const onBack = () => {
    navigation.goBack();
  };

  const handleCloseMonth = async () => {
    const itemFilter = buildFilterCache({
      ...filter,
      month: filter.month,
      monthname: `Tháng ${filter.month}`,
      year: filter.year,
      yearname: `Năm ${filter.year}`,
    });
    await AsyncStorage.setItem(KeyStore, JSON.stringify(itemFilter));
    setFilter(itemFilter);
    loadData(true, itemFilter);
  };

  const onSelectYear = searchInfo => {
    setFilter({ ...filter, ...searchInfo });
  };
  const showMonth = () => {
    SheetManager.show('monthSheet');
  };

  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  return (
    <View style={styles.container}>
      <HeaderCustom
        title={'Giải trình số bán'}
        leftFunc={onBack}
        rightFunc={() => showMonth()}
        iconRight={'calendar'}
      />
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        {employee?.employeeId > 0 && (
          <View style={styles.employeeInfoWrap}>
            <Text style={styles.employeeInfoName}>
              {employee.employeeName} - {employee.employeeCode}
            </Text>
          </View>
        )}

        <View style={{ height: 80, padding: 4 }}>
          <SummaryTabs
            summary={summary}
            selectedStatus={selectedStatus}
            onSelect={setSelectedStatus}
            dataTab={dataTab}
            styles={styles}
          />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => `${item.id}`}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <VerifyCard
                item={item}
                onPress={() => onOpenDetail(item)}
                colorStatus={colorStatus}
                lableStatus={lableStatus}
                dataTab={dataTab}
                styles={styles}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Không có dữ liệu</Text>
              </View>
            }
          />
        )}
        {!!selectedItem?.guid != null && (
          <VerifyDetailModal
            visible={visibleDetail}
            item={selectedItem}
            role={currentRole}
            onClose={onCloseDetail}
            onSubmitExplain={onSubmitExplain}
            onLeaderConfirm={onLeaderConfirm}
            lableStatus={lableStatus}
            dataTab={dataTab}
            submitting={submitting}
            styles={styles}
            dataInput={dataInput}
            appcolor={appcolor}
          />
        )}
        {/* <VerifyDetailModal
                    visible={visibleDetail}
                    item={selectedItem}
                    role={currentRole}
                    onClose={onCloseDetail}
                    onSubmitExplain={onSubmitExplain}
                    onLeaderConfirm={onLeaderConfirm}
                    lableStatus={lableStatus}
                    submitting={submitting}
                    styles={styles}
                    dataInput={dataInput}
                    appcolor={appcolor}
                /> */}
      </View>
      <ActionSheet
        id={'monthSheet'}
        containerStyle={{
          backgroundColor: appcolor.surface,
          borderWidth: 0.2,
          borderColor: appcolor.dark,
          paddingBottom: insets.bottom,
        }}
        onClose={() => handleCloseMonth()}
        initialOffsetFromBottom={1}
        gestureEnabled={true}
        indicatorColor={'#f0f0f0'}
        defaultOverlayOpacity={0.5}
      >
        <View
          style={{ width: deviceWidth, minHeight: '40%', paddingBottom: 30 }}
        >
          <YearMonthSelected
            option={filter}
            onYearMonth={search => onSelectYear(search)}
            numMonth={4}
          />
        </View>
      </ActionSheet>
    </View>
  );
};

export default HomeSaleExplain;

const SummaryTabs = ({
  summary,
  selectedStatus,
  onSelect,
  dataTab,
  styles,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsWrap}
    >
      {dataTab.map(tab => {
        const tabStatus = getTabKey(tab);
        const isActive = selectedStatus === tabStatus;

        return (
          <TouchableOpacity
            key={String(tabStatus)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelect(tabStatus)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.nameVN} ({summary[tab.ref_Code] || 0})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    headerWrap: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      backgroundColor: appcolor.light,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 12,
      color: appcolor.dark,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: appcolor.surface,
      marginRight: 8,
    },
    tabsWrap: {
      height: 50,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: appcolor.light,
      marginBottom: 8,
    },
    tabItem: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: appcolor.surface,
      borderRadius: 18,
      marginRight: 8,
    },
    tabItemActive: { backgroundColor: appcolor.primary },
    tabText: { color: appcolor.dark, fontWeight: '600' },
    tabTextActive: { color: appcolor.white },
    sectionHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: appcolor.dark },
    card: {
      backgroundColor: appcolor.light,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      padding: 14,
      shadowColor: appcolor.dark,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      alignItems: 'center',
    },
    cardDate: { fontSize: 14, fontWeight: '700', color: appcolor.dark },
    cardModel: {
      fontSize: 16,
      fontWeight: '700',
      color: appcolor.dark,
      marginBottom: 6,
    },
    cardSub: { fontSize: 13, color: appcolor.greylight, marginBottom: 3 },
    cardReason: {
      marginTop: 6,
      fontSize: 13,
      color: appcolor.highlightDate,
      fontWeight: '600',
    },
    cardNote: { marginTop: 8, fontSize: 13, color: appcolor.placeholderText },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    badgeText: { color: appcolor.light, fontSize: 12, fontWeight: '700' },
    emptyWrap: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: appcolor.greyDark, fontSize: 15 },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: appcolor.greyDark },
    modalContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: appcolor.surface,
      position: 'relative',
    },
    modalHeader: {
      paddingTop: Platform.OS === 'ios' ? 54 : 18,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: appcolor.light,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: appcolor.dark },
    modalClose: { color: appcolor.danger, fontWeight: '700', fontSize: 15 },
    modalBody: { flex: 1, minHeight: 0 },
    modalScroll: { flex: 1 },
    modalScrollContent: { paddingBottom: 120 },
    infoBlock: {
      backgroundColor: appcolor.light,
      marginTop: 12,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 14,
    },
    infoBlockTitle: { fontSize: 16, fontWeight: '700', color: appcolor.dark },
    infoRow: { marginBottom: 10 },
    infoLabel: { fontSize: 13, color: appcolor.greyDark, marginBottom: 3 },
    infoValue: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: '600',
    },
    infoValueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: '700',
      marginBottom: 8,
      marginTop: 8,
    },
    input: {
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.danger,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      color: '#111827',
    },
    textArea: { minHeight: 110 },
    disabledInput: {
      backgroundColor: appcolor.surface,
      color: appcolor.greylight,
    },
    photoRow: { flexDirection: 'row', alignItems: 'center' },
    photoItem: {
      width: 100,
      height: 100,
      borderRadius: 14,
      overflow: 'hidden',
      marginRight: 10,
      position: 'relative',
      backgroundColor: appcolor.surface,
    },
    photoImage: { width: '100%', height: '100%' },
    removePhotoBtn: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removePhotoText: { color: appcolor.light, fontWeight: '700' },
    addPhotoBox: {
      width: 100,
      height: 100,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: appcolor.greylight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addPhotoText: { fontWeight: '700', color: appcolor.greylight },
    bottomActions: {
      padding: 16,
      paddingBottom: Platform.OS === 'ios' ? 28 : 16,
      backgroundColor: appcolor.light,
    },
    primaryButton: {
      backgroundColor: appcolor.info,
      borderRadius: 14,
      minHeight: 48,
      paddingVertical: 10,
    },
    secondaryButton: { borderRadius: 14, minHeight: 48, paddingVertical: 10 },
    leaderActionRow: { flexDirection: 'row', marginHorizontal: -4 },
    leaderActionButton: { flex: 1, marginHorizontal: 4 },
    employeeInfoWrap: {
      backgroundColor: appcolor.light,
      margin: 10,
      padding: 8,
      borderRadius: 16,
    },
    employeeInfoName: { fontSize: 15, fontWeight: '700', color: appcolor.dark },
    employeeInfoSub: { marginTop: 4, fontSize: 13, color: appcolor.greylight },
  });
