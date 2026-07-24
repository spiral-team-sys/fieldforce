import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/base';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import { REPORT } from '../../../../API/ReportAPI';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { LoadingView } from '../../../../Control/ItemLoading';
import { removeVietnameseTones } from '../../../../Core/Helper';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import { toastSuccess } from '../../../../Utils/configToast';
import ItemProgramResult from './Items/ItemProgramResult';
import QuarterStatisticsView from './Items/QuarterStatisticsView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const ProgramResultScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);
  const monthList = Array.from({ length: currentMonth }).map(
    (_, index) => index + 1,
  );
  const contentAnim = useRef(new Animated.Value(0)).current;

  const [isLoading, setLoading] = useState(false);
  const [isStatisticsLoading, setStatisticsLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [statisticsPrograms, setStatisticsPrograms] = useState([]);
  const [statisticsTimeMode, setStatisticsTimeMode] = useState('MONTH');
  const [statisticsPickerMode, setStatisticsPickerMode] = useState('MONTH');
  const [selectedStatisticsMonth, setSelectedStatisticsMonth] =
    useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedProgramId, setSelectedProgramId] = useState(0);
  const [selectedTypeData, setSelectedTypeData] = useState('');
  const [selectedStatus, setSelectedStatus] = useState({
    title: '',
    subtitle: '',
    shops: [],
    color: 'primary',
  });
  const [shopSearchText, setShopSearchText] = useState('');
  const [filter, setFilter] = useState({
    timeMode: 'RESULT',
    month: currentMonth,
    year: currentYear,
  });

  useEffect(() => {
    LoadData();
  }, []);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [
    selectedProgramId,
    selectedTypeData,
    filter.timeMode,
    filter.month,
    statisticsTimeMode,
    statisticsPickerMode,
    selectedStatisticsMonth,
    selectedQuarter,
  ]);

  const LoadData = async (currentFilter = filter) => {
    setLoading(true);
    try {
      const dataFilter = {
        shopId: 0,
        reportId: kpiinfo.id,
        month: currentFilter.month,
        year: currentFilter.year,
        quarter: Math.ceil(currentFilter.month / 3),
      };
      await REPORT.GetDataReportByShop_RealTime(
        dataFilter,
        (mData, message) => {
          message && toastSuccess('Thông báo', message);
          const nextPrograms = handlerNormalizeResultPrograms(mData);
          const currentProgram =
            nextPrograms.find(item => item.programId == selectedProgramId) ||
            nextPrograms[0];
          const currentType =
            currentProgram?.typeData.find(
              item => item.TypeData === selectedTypeData,
            ) || currentProgram?.typeData[0];

          setPrograms(nextPrograms);
          setSelectedProgramId(currentProgram?.programId || 0);
          setSelectedTypeData(currentType?.TypeData || '');
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handlerGetJsonArray = value => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };

  const handlerNormalizeResultPrograms = data => {
    return (data || [])
      .map(program => ({
        ...program,
        typeData: handlerGetJsonArray(program.jsonTypeData).map(type => ({
          ...type,
          statuses: handlerGetJsonArray(type.jsonStatuses).map(status => ({
            ...status,
            shops: handlerGetJsonArray(status.jsonShops),
          })),
        })),
      }))
      .filter(handlerHasResultData);
  };

  const handlerHasResultData = program => {
    return (program?.typeData || []).some(type =>
      (type?.statuses || []).some(status => (status?.shops || []).length > 0),
    );
  };

  const handlerHasStatisticsData = program => {
    return (program?.typeData || []).some(type =>
      (type?.statuses || []).some(
        status => Number(status?.TotalShops || 0) > 0,
      ),
    );
  };

  const handlerNormalizeStatisticsPrograms = (
    data,
    timeMode = statisticsTimeMode,
    timeValue = selectedStatisticsMonth,
  ) => {
    if (timeMode === 'MONTH') {
      return handlerNormalizeMonthStatisticsPrograms(data, timeValue);
    }
    return handlerNormalizeQuarterStatisticsPrograms(data, timeValue);
  };

  const handlerNormalizeMonthStatisticsPrograms = (
    data,
    month = selectedStatisticsMonth,
  ) => {
    return (data || [])
      .map(program => {
        const resultTypes = handlerGetJsonArray(program.jsonTypeData);
        const monthStatus = handlerGetJsonArray(program.jsonMonthStatus);
        const typeMap = resultTypes.reduce((acc, item) => {
          acc[item.TypeData] = item.Title;
          return acc;
        }, {});
        const selectedMonthStatus = monthStatus.find(
          item => Number(item.Month || 0) === Number(month),
        );
        return {
          ...program,
          typeData: handlerGetJsonArray(selectedMonthStatus?.jsonTypeData).map(
            type => ({
              TypeData: type.TypeData,
              Title: type.Title || typeMap[type.TypeData] || type.TypeData,
              statuses: handlerGetJsonArray(type.jsonStatuses),
            }),
          ),
        };
      })
      .filter(handlerHasStatisticsData);
  };

  const handlerNormalizeQuarterStatisticsPrograms = (
    data,
    quarter = selectedQuarter,
  ) => {
    const quarterStartMonth = (quarter - 1) * 3 + 1;
    const quarterEndMonth = quarter * 3;
    return (data || [])
      .map(program => {
        const resultTypes = handlerGetJsonArray(program.jsonTypeData);
        const quarterStatus = handlerGetJsonArray(program.jsonQuarterStatus);
        if (quarterStatus.length === 0) {
          return {
            ...program,
            typeData: resultTypes.map(type => ({
              ...type,
              statuses: handlerGetJsonArray(type.jsonStatuses),
            })),
          };
        }
        const typeMap = resultTypes.reduce((acc, item) => {
          acc[item.TypeData] = item.Title;
          return acc;
        }, {});
        const hasQuarterData = quarterStatus.some(
          item => item.Quarter !== undefined || item.quarter !== undefined,
        );
        const groupedType = quarterStatus
          .filter(item => {
            if (hasQuarterData) {
              return (
                Number(item.Quarter || item.quarter || 0) === Number(quarter)
              );
            }
            return (
              Number(item.Month || 0) >= quarterStartMonth &&
              Number(item.Month || 0) <= quarterEndMonth
            );
          })
          .reduce((acc, item) => {
            const typeData = item.TypeData || '';
            const statusKey = `${item.StatusCode}_${item.StatusTitle}`;
            if (!acc[typeData]) {
              acc[typeData] = {
                TypeData: typeData,
                Title: typeMap[typeData] || item.TypeDataName || typeData,
                statusMap: {},
              };
            }
            if (!acc[typeData].statusMap[statusKey]) {
              acc[typeData].statusMap[statusKey] = {
                StatusCode: item.StatusCode,
                StatusTitle: item.StatusTitle,
                ColorTheme: item.ColorTheme,
                TotalShops: 0,
              };
            }
            acc[typeData].statusMap[statusKey].TotalShops += Number(
              item.TotalShops || 0,
            );
            return acc;
          }, {});

        return {
          ...program,
          typeData: Object.values(groupedType).map(type => ({
            TypeData: type.TypeData,
            Title: type.Title,
            statuses: Object.values(type.statusMap),
          })),
        };
      })
      .filter(handlerHasStatisticsData);
  };

  const LoadStatisticsData = async (
    timeMode = statisticsTimeMode,
    timeValue = timeMode === 'MONTH'
      ? selectedStatisticsMonth
      : selectedQuarter,
  ) => {
    setStatisticsLoading(true);
    try {
      const month =
        timeMode === 'MONTH'
          ? timeValue
          : Math.min(timeValue * 3, currentMonth);
      const quarter =
        timeMode === 'MONTH' ? Math.ceil(timeValue / 3) : timeValue;
      const dataFilter = {
        shopId: 0,
        reportId: kpiinfo.id,
        month,
        year: currentYear,
        quarter,
      };
      await REPORT.GetDataReportByShop_RealTime(
        dataFilter,
        (mData, message) => {
          message && toastSuccess('Thông báo', message);
          setStatisticsPrograms(
            handlerNormalizeStatisticsPrograms(mData, timeMode, timeValue),
          );
        },
      );
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handlerGetShopDetail = item => {
    return handlerGetJsonArray(item?.jsonDetail);
  };

  const handlerGetProgramTotalShops = program => {
    const shopIds = new Set();
    program.typeData.forEach(type => {
      type.statuses.forEach(status => {
        status.shops.forEach(shop =>
          shopIds.add(`${shop.ShopId}-${shop.Guid}`),
        );
      });
    });
    return shopIds.size;
  };

  const handlerGetTypeTotalShops = type => {
    return type.statuses.reduce(
      (total, status) => total + status.shops.length,
      0,
    );
  };

  const handlerGetSelectedShops = () => {
    const valueSearch = removeVietnameseTones(
      shopSearchText || '',
    ).toLowerCase();
    if (!valueSearch) return selectedStatus.shops;
    return selectedStatus.shops.filter(
      shop =>
        removeVietnameseTones(shop.ShopName || '')
          .toLowerCase()
          .includes(valueSearch) ||
        removeVietnameseTones(shop.ShopCode || '')
          .toLowerCase()
          .includes(valueSearch) ||
        removeVietnameseTones(shop.StoreAddress || '')
          .toLowerCase()
          .includes(valueSearch),
    );
  };

  const onBack = () => {
    navigation.goBack();
  };

  const onChangeMonth = month => {
    const nextFilter = { ...filter, month };
    setFilter(nextFilter);
    LoadData(nextFilter);
  };

  const onChangeTimeMode = timeMode => {
    if (filter.timeMode === timeMode) return;
    setFilter({ ...filter, timeMode });
    if (timeMode === 'STATISTICS' && statisticsPrograms.length === 0) {
      LoadStatisticsData(
        statisticsTimeMode,
        statisticsTimeMode === 'MONTH'
          ? selectedStatisticsMonth
          : selectedQuarter,
      );
    }
  };

  const onChangeStatisticsTimeMode = timeMode => {
    if (statisticsPickerMode === timeMode) return;
    setStatisticsPickerMode(timeMode);
  };

  const onChangeStatisticsMonth = month => {
    if (statisticsTimeMode === 'MONTH' && selectedStatisticsMonth === month)
      return;
    setStatisticsTimeMode('MONTH');
    setStatisticsPickerMode('MONTH');
    setSelectedStatisticsMonth(month);
    LoadStatisticsData('MONTH', month);
  };

  const onChangeQuarter = quarter => {
    if (statisticsTimeMode === 'QUARTER' && selectedQuarter === quarter) return;
    setStatisticsTimeMode('QUARTER');
    setStatisticsPickerMode('QUARTER');
    setSelectedQuarter(quarter);
    LoadStatisticsData('QUARTER', quarter);
  };

  const onSelectProgram = program => {
    setSelectedProgramId(program.programId);
    setSelectedTypeData(program.typeData[0]?.TypeData || '');
  };

  const onSelectTypeData = item => {
    setSelectedTypeData(item.TypeData);
  };

  const onOpenStatus = item => {
    setShopSearchText('');
    setSelectedStatus({
      title: item.StatusTitle,
      subtitle: `${selectedProgram?.title || ''} · ${selectedType?.Title || ''
        }`,
      shops: item.shops,
      color: item.ColorTheme || 'primary',
    });
    SheetManager.show('program-result-shop-sheet');
  };

  const onToggleShopDetail = item => {
    const nextShops = selectedStatus.shops.map(shop => {
      const isCurrentShop =
        shop.ShopId == item.ShopId && shop.Guid == item.Guid;
      return isCurrentShop
        ? { ...shop, isViewDetail: !shop.isViewDetail }
        : shop;
    });
    setSelectedStatus({ ...selectedStatus, shops: nextShops });
  };

  const onSearchShop = text => {
    setShopSearchText(text);
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
    },
    sectionMeta: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    modeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      padding: 4,
      borderRadius: 16,
      backgroundColor: appcolor.surface,
    },
    modeButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
      marginLeft: 6,
    },
    monthScroll: { height: 56, maxHeight: 56, flexGrow: 0 },
    monthContent: { paddingHorizontal: 16, alignItems: 'center' },
    monthChip: {
      minWidth: 52,
      minHeight: 44,
      borderRadius: 9999,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      borderWidth: 0.5,
    },
    monthText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
    },
    programScroll: { maxHeight: 126, flexGrow: 0 },
    programContent: { paddingHorizontal: 16, paddingBottom: 8 },
    programCard: {
      width: 248,
      minHeight: 104,
      borderRadius: 20,
      padding: 16,
      marginRight: 12,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.surface,
    },
    programCardSelected: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    programTop: { flexDirection: 'row', alignItems: 'center' },
    programIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
      marginRight: 10,
    },
    programInfo: { flex: 1 },
    programTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: appcolor.dark,
    },
    programMeta: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 4,
    },
    programTitleSelected: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      color: appcolor.light,
    },
    programMetaSelected: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.light,
      marginTop: 4,
    },
    selectedMark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    typeScroll: { height: 56, maxHeight: 56, flexGrow: 0 },
    typeContent: { paddingHorizontal: 16, alignItems: 'center' },
    typeChip: {
      minHeight: 44,
      borderRadius: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      borderWidth: 0.5,
    },
    typeText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
      marginLeft: 8,
    },
    statusContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    statusCard: {
      minHeight: 88,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    statusIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    statusInfo: { flex: 1 },
    statusTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    statusSubtitle: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 3,
    },
    statusCount: {
      minWidth: 44,
      height: 32,
      borderRadius: 9999,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    statusCountText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.light,
    },
    chevron: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    emptyWrap: { alignItems: 'center', paddingTop: 48 },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    emptyTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
      color: appcolor.dark,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 4,
    },
    sheetContainer: { backgroundColor: appcolor.light },
    sheetContent: { maxHeight: deviceHeight * 0.84, padding: 16 },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sheetHeaderIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sheetHeaderInfo: { flex: 1 },
    sheetTitle: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
      letterSpacing: -0.3,
      color: appcolor.dark,
    },
    sheetSubtitle: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 2,
    },
    sheetCount: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.primary,
      marginTop: 3,
    },
    sheetSearch: { marginHorizontal: -16, marginBottom: 8 },
    sheetList: { height: deviceHeight * 0.56 },
    shopCard: {
      minHeight: 72,
      borderRadius: 16,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderLeftWidth: 4,
    },
    shopIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    shopInfo: { flex: 1, marginLeft: 10 },
    shopName: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.dark,
    },
    shopCode: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginTop: 2,
    },
    shopAddress: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      color: appcolor.placeholderText,
      marginTop: 2,
    },
  });

  const selectedProgram =
    programs.find(item => item.programId == selectedProgramId) || programs[0];
  const selectedType =
    selectedProgram?.typeData.find(
      item => item.TypeData === selectedTypeData,
    ) || selectedProgram?.typeData[0];
  const selectedShops = handlerGetSelectedShops();
  const contentAnimatedStyle = {
    opacity: contentAnim,
    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  const renderProgramItem = (program, programIndex = 0) => {
    const isSelected = program.programId == selectedProgram?.programId;
    return (
      <TouchableOpacity
        key={`${program.programId || 'program'}_${programIndex}`}
        activeOpacity={0.7}
        style={[styles.programCard, isSelected && styles.programCardSelected]}
        onPress={() => onSelectProgram(program)}
      >
        <View style={styles.programTop}>
          <View style={styles.programIcon}>
            <SpiralIcon
              type="ionicon"
              name="trophy-outline"
              size={20}
              color={appcolor.primary}
            />
          </View>
          <View style={styles.programInfo}>
            <Text
              style={
                isSelected ? styles.programTitleSelected : styles.programTitle
              }
              numberOfLines={2}
            >
              {program.title}
            </Text>
          </View>
          {isSelected ? (
            <View style={styles.selectedMark}>
              <SpiralIcon
                type="ionicon"
                name="checkmark"
                size={16}
                color={appcolor.primary}
              />
            </View>
          ) : null}
        </View>
        <Text
          style={isSelected ? styles.programMetaSelected : styles.programMeta}
        >
          {`${handlerGetProgramTotalShops(program)} cửa hàng tham gia`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTypeItem = (item, typeIndex = 0) => {
    const isSelected = item.TypeData === selectedType?.TypeData;
    return (
      <TouchableOpacity
        key={`${item.TypeData || 'type'}_${typeIndex}`}
        activeOpacity={0.7}
        style={[
          styles.typeChip,
          {
            backgroundColor: isSelected ? appcolor.primary : appcolor.surface,
            borderColor: isSelected ? appcolor.primary : appcolor.grayLight,
          },
        ]}
        onPress={() => onSelectTypeData(item)}
      >
        <SpiralIcon
          type="ionicon"
          name={
            item.TypeData === 'DISPLAY'
              ? 'images-outline'
              : 'document-text-outline'
          }
          size={17}
          color={isSelected ? appcolor.light : appcolor.primary}
        />
        <Text
          style={[
            styles.typeText,
            { color: isSelected ? appcolor.light : appcolor.dark },
          ]}
        >
          {item.Title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStatusItem = ({ item }) => {
    const statusColor = appcolor[item.ColorTheme] || appcolor.primary;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.statusCard}
        onPress={() => onOpenStatus(item)}
      >
        <View style={[styles.statusIcon, { backgroundColor: statusColor }]}>
          <SpiralIcon
            type="ionicon"
            name="storefront-outline"
            size={20}
            color={appcolor.light}
          />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>{item.StatusTitle}</Text>
          <Text style={styles.statusSubtitle}>
            Nhấn để xem danh sách cửa hàng
          </Text>
        </View>
        <View style={[styles.statusCount, { backgroundColor: statusColor }]}>
          <Text style={styles.statusCountText}>{item.TotalShops}</Text>
        </View>
        <View style={styles.chevron}>
          <SpiralIcon
            type="ionicon"
            name="chevron-forward"
            size={16}
            color={appcolor.placeholderText}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderShopItem = ({ item }) => {
    const colorStatus = appcolor[selectedStatus.color] || appcolor.primary;
    const dataDetail = handlerGetShopDetail(item);
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.shopCard, { borderLeftColor: colorStatus }]}
          onPress={() => onToggleShopDetail(item)}
        >
          <View style={styles.shopIcon}>
            <SpiralIcon
              type="ionicon"
              name="storefront-outline"
              size={18}
              color={colorStatus}
            />
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName} numberOfLines={1}>
              {item.ShopName}
            </Text>
            <Text style={styles.shopCode}>{item.ShopCode}</Text>
            {item.StoreAddress ? (
              <Text style={styles.shopAddress} numberOfLines={2}>
                {item.StoreAddress}
              </Text>
            ) : null}
          </View>
          <View style={styles.chevron}>
            <SpiralIcon
              type="ionicon"
              name={item.isViewDetail ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={appcolor.placeholderText}
            />
          </View>
        </TouchableOpacity>
        {item.isViewDetail ? <ItemProgramResult data={dataDetail} /> : null}
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
          <SpiralIcon
            type="ionicon"
            name="file-tray-outline"
            size={24}
            color={appcolor.placeholderText}
          />
        </View>
        <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
        <Text style={styles.emptyText}>
          Chưa có kết quả trong tháng đã chọn
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={kpiinfo.menuNameVN} leftFunc={onBack} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thời gian</Text>
        <Text style={styles.sectionMeta}>{currentYear}</Text>
      </View>
      <View style={styles.modeContainer}>
        {[
          { key: 'RESULT', title: 'Kết quả', icon: 'list-outline' },
          { key: 'STATISTICS', title: 'Thống kê', icon: 'pie-chart-outline' },
        ].map(item => {
          const isSelected = filter.timeMode === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => onChangeTimeMode(item.key)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: isSelected
                    ? appcolor.primary
                    : appcolor.surface,
                },
              ]}
            >
              <SpiralIcon
                type="ionicon"
                name={item.icon}
                size={17}
                color={isSelected ? appcolor.light : appcolor.primary}
              />
              <Text
                style={[
                  styles.modeText,
                  { color: isSelected ? appcolor.light : appcolor.dark },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filter.timeMode === 'RESULT' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthScroll}
          contentContainerStyle={styles.monthContent}
        >
          {monthList.map(month => {
            const isSelected = filter.month === month;
            return (
              <TouchableOpacity
                key={month}
                activeOpacity={0.7}
                style={[
                  styles.monthChip,
                  {
                    backgroundColor: isSelected
                      ? appcolor.primary
                      : appcolor.surface,
                    borderColor: isSelected
                      ? appcolor.primary
                      : appcolor.grayLight,
                  },
                ]}
                onPress={() => onChangeMonth(month)}
              >
                <Text
                  style={[
                    styles.monthText,
                    { color: isSelected ? appcolor.light : appcolor.dark },
                  ]}
                >
                  {`Tháng ${month}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {filter.timeMode === 'STATISTICS' ? (
        isStatisticsLoading ? (
          <View style={{ flex: 1 }}>
            <LoadingView isLoading title="Đang tải dữ liệu" />
          </View>
        ) : (
          <QuarterStatisticsView
            programs={statisticsPrograms}
            timeMode={statisticsTimeMode}
            pickerMode={statisticsPickerMode}
            month={selectedStatisticsMonth}
            maxMonth={currentMonth}
            quarter={selectedQuarter}
            maxQuarter={currentQuarter}
            onChangeTimeMode={onChangeStatisticsTimeMode}
            onChangeMonth={onChangeStatisticsMonth}
            onChangeQuarter={onChangeQuarter}
          />
        )
      ) : isLoading ? (
        <View style={{ flex: 1 }}>
          <LoadingView isLoading title="Đang tải dữ liệu" />
        </View>
      ) : programs.length === 0 ? (
        renderEmpty()
      ) : (
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chương trình</Text>
            <Text
              style={styles.sectionMeta}
            >{`${programs.length} chương trình`}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.programScroll}
            contentContainerStyle={styles.programContent}
          >
            {programs.map((program, programIndex) =>
              renderProgramItem(program, programIndex),
            )}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Loại kết quả</Text>
            <Text style={styles.sectionMeta}>{`${selectedProgram?.typeData.length || 0
              } loại`}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeContent}
          >
            {(selectedProgram?.typeData || []).map((item, typeIndex) =>
              renderTypeItem(item, typeIndex),
            )}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trạng thái cửa hàng</Text>
            <Text style={styles.sectionMeta}>{`${handlerGetTypeTotalShops(
              selectedType || { statuses: [] },
            )} cửa hàng`}</Text>
          </View>
          <View style={styles.statusContainer}>
            <CustomListView
              data={selectedType?.statuses || []}
              extraData={[selectedProgramId, selectedTypeData]}
              renderItem={renderStatusItem}
              onRefresh={() => LoadData(filter)}
              isRefresh={isLoading}
              bottomView={{ paddingBottom: 24 }}
              ListEmpty={renderEmpty()}
            />
          </View>
        </Animated.View>
      )}

      <ActionSheet
        id="program-result-shop-sheet"
        containerStyle={StyleSheet.flatten([
          styles.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View
              style={[
                styles.sheetHeaderIcon,
                {
                  backgroundColor:
                    appcolor[selectedStatus.color] || appcolor.primary,
                },
              ]}
            >
              <SpiralIcon
                type="ionicon"
                name="storefront-outline"
                size={20}
                color={appcolor.light}
              />
            </View>
            <View style={styles.sheetHeaderInfo}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {selectedStatus.title}
              </Text>
              <Text style={styles.sheetSubtitle} numberOfLines={2}>
                {selectedStatus.subtitle}
              </Text>
              <Text
                style={styles.sheetCount}
              >{`${selectedShops.length}/${selectedStatus.shops.length} cửa hàng`}</Text>
            </View>
          </View>
          <View style={styles.sheetSearch}>
            <SearchData
              placeholder="Tìm cửa hàng"
              onSearchData={onSearchShop}
              value={shopSearchText}
            />
          </View>
          <View style={styles.sheetList}>
            <CustomListView
              data={selectedShops}
              extraData={selectedShops}
              renderItem={renderShopItem}
              bottomView={{ paddingBottom: 24 }}
              ListEmpty={renderEmpty()}
            />
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};

export default ProgramResultScreen;
