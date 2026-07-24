import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import CustomListView from '../../../Control/Custom/CustomListView';
import {
  getAllPhotosLocal,
  getPhotosNotUploadReport,
  uploadAllDataPhoto,
} from '../../../Controller/PhotoController';
import { menuController } from '../../../Controller/MenuController';
import ViewPictures from '../../../Control/Gallary/ViewPictures';
import {
  getPhotoTime,
  getPhotoUri,
  getReportName,
  isUploaded,
} from './PhotoManageHelpers';

const FILTER_TYPE = {
  ALL: 'ALL',
  ATTENDANT: 'ATTENDANT',
  REPORT: 'REPORT',
};
const FILTER_OPTIONS = [
  { key: FILTER_TYPE.ALL, label: 'Tất cả', icon: 'th-large' },
  { key: FILTER_TYPE.REPORT, label: 'Báo cáo', icon: 'clipboard-list' },
  { key: FILTER_TYPE.ATTENDANT, label: 'Chấm công', icon: 'user-check' },
];
const getGroupKey = (item = {}) => `${item?.shopId ?? 0}`;

const PhotoManageScreen = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(FILTER_TYPE.ALL);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYYMMDD'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showShopPicker, setShowShopPicker] = useState(false);
  const [dataPhotos, setDataPhotos] = useState([]);
  const [reportNameMap, setReportNameMap] = useState({});
  const [pictureShow, setPictureShow] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [isUploadingPending, setUploadingPending] = useState(false);
  const [allPendingPhotos, setAllPendingPhotos] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(0);

  // ===== Styles =====
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.surface },
        content: { flex: 1, paddingHorizontal: 10, paddingTop: 8 },
        loadingWrap: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingText: { marginTop: 8, color: appcolor.dark, fontSize: 14 },
        filterWrap: {
          flexDirection: 'row',
          marginBottom: 10,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          borderRadius: 12,
          backgroundColor: appcolor.light,
          padding: 4,
        },
        filterBtn: {
          flex: 1,
          borderRadius: 9,
          paddingVertical: 9,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        filterBtnGap: { marginLeft: 6 },
        filterActive: { backgroundColor: appcolor.primary },
        filterText: {
          fontSize: 12,
          fontWeight: '700',
          color: appcolor.dark,
          marginLeft: 6,
        },
        filterTextActive: { color: appcolor.light },
        topUploadBtn: {
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E4572E',
          backgroundColor: '#E4572E',
          flexDirection: 'row',
          alignItems: 'center',
        },
        topUploadBtnDisabled: {
          backgroundColor: appcolor.grayLight,
          borderColor: appcolor.grayLight,
        },
        topUploadBtnText: {
          fontSize: 12,
          fontWeight: '700',
          color: appcolor.light,
          marginLeft: 6,
        },
        dateFilterWrap: {
          marginBottom: 10,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          borderRadius: 12,
          backgroundColor: appcolor.light,
          padding: 10,
        },
        dateFilterTop: { flexDirection: 'row', alignItems: 'center' },
        dateFilterIconWrap: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: appcolor.surface,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        },
        dateFilterInfo: { flex: 1 },
        dateFilterLabel: {
          fontSize: 12,
          color: appcolor.greylight,
          fontWeight: '600',
        },
        dateFilterValue: {
          marginTop: 3,
          fontSize: 16,
          color: appcolor.dark,
          fontWeight: '700',
        },
        dateFilterSubValue: {
          marginTop: 2,
          fontSize: 12,
          color: appcolor.greylight,
          fontWeight: '500',
        },
        dateFilterActions: {
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
        },
        dateFilterActionBtn: {
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.surface,
          flexDirection: 'row',
          alignItems: 'center',
        },
        dateFilterActionPrimary: {
          backgroundColor: appcolor.primary,
          borderColor: appcolor.primary,
        },
        dateFilterActionUpload: {
          backgroundColor: '#E4572E',
          borderColor: '#E4572E',
        },
        dateFilterActionDisabled: {
          backgroundColor: appcolor.grayLight,
          borderColor: appcolor.grayLight,
        },
        dateFilterActionText: {
          fontSize: 12,
          fontWeight: '700',
          color: appcolor.dark,
          marginLeft: 6,
        },
        dateFilterActionTextPrimary: { color: appcolor.light },
        listContent: { paddingBottom: 20 },
        groupContainer: {
          marginBottom: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.light,
          padding: 8,
        },
        groupHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          paddingHorizontal: 2,
        },
        groupTitle: {
          flex: 1,
          fontSize: 13,
          fontWeight: '700',
          color: appcolor.dark,
          marginRight: 8,
        },
        groupCount: {
          fontSize: 11,
          fontWeight: '700',
          color: appcolor.greylight,
        },
        photoGridItem: {
          width: '90%',
          marginBottom: 12,
          marginHorizontal: '5%',
          aspectRatio: 1,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: appcolor.grayLight,
        },
        photoThumb: { width: '100%', height: '100%' },
        uploadTag: {
          position: 'absolute',
          top: 6,
          right: 6,
          borderRadius: 16,
          paddingHorizontal: 7,
          paddingVertical: 3,
        },
        uploadTagText: {
          fontSize: 10,
          fontWeight: '700',
          color: appcolor.light,
        },
        overlayInfo: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 6,
          paddingVertical: 6,
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        reportName: { fontSize: 10, color: appcolor.light, fontWeight: '700' },
        photoShopCode: {
          fontSize: 10,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: '600',
          textAlign: 'center',
        },
        photoTime: {
          fontSize: 10,
          color: appcolor.light,
          marginTop: 1,
          fontWeight: '500',
          textAlign: 'center',
        },
        emptyText: {
          textAlign: 'center',
          marginTop: 30,
          color: appcolor.greylight,
          fontSize: 14,
          fontWeight: '600',
        },
        dateModalContainer: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        dateModalPressable: { flex: 1 },
        dateModalContent: {
          backgroundColor: appcolor.light,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 32,
          paddingHorizontal: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
        dateModalHeader: {
          paddingTop: 12,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        dateModalTitleWrap: { flex: 1, paddingRight: 8 },
        dateModalTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: appcolor.dark,
        },
        dateModalHint: {
          marginTop: 2,
          fontSize: 12,
          color: appcolor.greylight,
          fontWeight: '500',
        },
        dateCloseBtn: {
          minWidth: 70,
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.surface,
          alignItems: 'center',
        },
        dateCloseText: {
          fontSize: 12,
          fontWeight: '700',
          color: appcolor.dark,
        },
        selectedDateChip: {
          alignSelf: 'flex-start',
          marginBottom: 10,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 14,
          backgroundColor: appcolor.primary,
        },
        selectedDateChipText: {
          fontSize: 12,
          fontWeight: '700',
          color: appcolor.light,
        },
        calendarWrap: {
          borderRadius: 14,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          overflow: 'hidden',
        },
        shopModalListWrap: {
          borderRadius: 14,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          maxHeight: 360,
          overflow: 'hidden',
        },
        shopModalItem: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: appcolor.light,
          borderBottomWidth: 1,
          borderBottomColor: appcolor.grayLight,
        },
        shopModalItemActive: { backgroundColor: appcolor.surface },
        shopModalItemText: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: appcolor.dark,
          marginRight: 8,
        },
        shopModalItemTextActive: { color: appcolor.primary },
      }),
    [appcolor],
  );

  // ===== Actions =====
  const actionLoadData = async () => {
    await setLoading(true);
    const [photoRes, menuRes, pendingRes] = await Promise.all([
      getAllPhotosLocal('photoTime'),
      menuController.getMenu(1),
      getPhotosNotUploadReport(-1),
    ]);
    const mapName = (menuRes || []).reduce((acc, item) => {
      acc[item.id] = item.menuNameVN || item.menuName || `Báo cáo #${item.id}`;
      return acc;
    }, {});

    await setReportNameMap(mapName);
    await setDataPhotos(photoRes || []);
    await setAllPendingPhotos(pendingRes || []);
    await setLoading(false);
  };

  useEffect(() => {
    actionLoadData();
  }, []);

  // ===== Data =====
  const filteredByDateAndType = useMemo(() => {
    let result = dataPhotos.filter(
      item => `${item.photoDate || ''}` === `${selectedDate}`,
    );
    if (filterType === FILTER_TYPE.ATTENDANT)
      return result.filter(item => item.reportId === 1);
    if (filterType === FILTER_TYPE.REPORT)
      return result.filter(item => item.reportId !== 1);
    return result;
  }, [dataPhotos, filterType, selectedDate]);

  const shopOptions = useMemo(() => {
    const map = filteredByDateAndType.reduce((acc, item) => {
      const shopId = Number(item?.shopId || 0);
      if (!shopId) return acc;
      if (!acc[shopId]) {
        acc[shopId] = {
          shopCode: item.wShopCode || item.shopCode || `Shop ${shopId}`,
          shopName: item.shopName || `Cửa hàng ${shopId}`,
        };
      }
      return acc;
    }, {});
    return Object.keys(map)
      .map(key => ({
        shopId: Number(key),
        shopLabel: map[key].shopCode,
        shopName: map[key].shopName,
      }))
      .sort((a, b) => `${a.shopName}`.localeCompare(`${b.shopName}`));
  }, [filteredByDateAndType]);

  const filteredPhotos = useMemo(() => {
    if (selectedShopId === 0) return filteredByDateAndType;
    return filteredByDateAndType.filter(
      item => Number(item?.shopId || 0) === selectedShopId,
    );
  }, [filteredByDateAndType, selectedShopId]);

  const groupedReportData = useMemo(() => {
    const sortedPhotos = [...filteredPhotos].sort(
      (a, b) => (b.photoTime || 0) - (a.photoTime || 0),
    );
    const groupedMap = sortedPhotos.reduce((acc, item) => {
      const shopKey = getGroupKey(item);
      if (!acc[shopKey]) {
        acc[shopKey] = {
          key: shopKey,
          shopId: item.shopId,
          shopName: item.shopName || `Cửa hàng #${item.shopId}`,
          shopCode: item.wShopCode || item.shopCode || '',
          photos: [],
        };
      }
      acc[shopKey].photos.push(item);
      return acc;
    }, {});

    return Object.values(groupedMap).sort((a, b) => {
      const timeA = a.photos?.[0]?.photoTime || 0;
      const timeB = b.photos?.[0]?.photoTime || 0;
      return timeB - timeA;
    });
  }, [filteredPhotos]);

  const selectedDateLabel = useMemo(
    () => moment(selectedDate, 'YYYYMMDD').format('DD/MM/YYYY'),
    [selectedDate],
  );
  const selectedDateForCalendar = useMemo(
    () => moment(selectedDate, 'YYYYMMDD').format('YYYY-MM-DD'),
    [selectedDate],
  );
  const selectedShopLabel = useMemo(() => {
    if (selectedShopId === 0) return 'Tất cả shop';
    const selectedShop = shopOptions.find(
      item => item.shopId === selectedShopId,
    );
    return selectedShop?.shopLabel || `Shop ${selectedShopId}`;
  }, [selectedShopId, shopOptions]);
  const pendingVisiblePhotos = useMemo(
    () => filteredPhotos.filter(item => !isUploaded(item)),
    [filteredPhotos],
  );
  const pendingVisibleCount = pendingVisiblePhotos.length;

  // ===== Handles =====
  const handleSelectFilter = type => {
    setFilterType(type);
  };
  const handleSelectShop = shopId => {
    setSelectedShopId(shopId);
    setShowShopPicker(false);
  };

  const handleSelectDate = date => {
    setSelectedDate(moment(date, 'YYYY-MM-DD').format('YYYYMMDD'));
    setShowDatePicker(false);
  };

  const handleCloseImage = () => {
    setPictureShow({ visible: false, photos: [], index: 0 });
  };

  const handleSelectToday = () => {
    setSelectedDate(moment().format('YYYYMMDD'));
  };

  const handlerUploadPending = async () => {
    if (isUploadingPending || pendingVisibleCount === 0) return;

    setUploadingPending(true);
    try {
      const visiblePhotoIds = new Set(
        pendingVisiblePhotos
          .map(item => Number(item.id))
          .filter(id => !Number.isNaN(id)),
      );
      const photosNeedUpload = allPendingPhotos.filter(item =>
        visiblePhotoIds.has(Number(item.id)),
      );
      if (photosNeedUpload.length > 0) {
        await uploadAllDataPhoto(photosNeedUpload);
        await actionLoadData();
      }
    } finally {
      setUploadingPending(false);
    }
  };

  // ===== Views =====
  const renderPhotoItem = ({ item: photo }) => {
    const groupPhotos =
      groupedReportData.find(group => group.key === getGroupKey(photo))
        ?.photos || [];
    const currentIndex = groupPhotos.findIndex(item => item.id === photo.id);
    return (
      <TouchableOpacity
        key={`photo_${photo.id || photo.photoTime}`}
        style={styles.photoGridItem}
        onPress={() =>
          setPictureShow({
            visible: true,
            photos: groupPhotos,
            index: currentIndex > -1 ? currentIndex : 0,
          })
        }
      >
        <Image
          source={{ uri: getPhotoUri(photo) }}
          style={styles.photoThumb}
          resizeMode="cover"
        />
        <View
          style={[
            styles.uploadTag,
            { backgroundColor: photo.fileUpload == 1 ? '#0EA35A' : '#E4572E' },
          ]}
        >
          <SpiralIcon
            type="font-awesome-6"
            name="cloud-upload-alt"
            size={11}
            color={appcolor.light}
          />
        </View>
        <View style={styles.overlayInfo}>
          <Text numberOfLines={1} style={styles.photoShopCode}>
            {getReportName(photo, reportNameMap)}
          </Text>
          <Text numberOfLines={1} style={styles.photoTime}>
            {getPhotoTime(photo)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupContainer}>
      <View style={styles.groupHeader}>
        <Text
          numberOfLines={1}
          style={styles.groupTitle}
        >{`[${item.shopCode.toUpperCase()}] ${item.shopName}`}</Text>
        <Text style={styles.groupCount}>{`${item.photos.length} ảnh`}</Text>
      </View>
      <CustomListView
        data={item.photos}
        renderItem={renderPhotoItem}
        numColumns={3}
        scrollEnabled={false}
        bottomView={{ paddingBottom: 0 }}
      />
    </View>
  );

  const renderFilterSection = () => (
    <View style={styles.filterWrap}>
      {FILTER_OPTIONS.map((option, index) => {
        const isActive = filterType === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterBtn,
              index > 0 && styles.filterBtnGap,
              isActive && styles.filterActive,
            ]}
            onPress={() => handleSelectFilter(option.key)}
          >
            <SpiralIcon
              type="font-awesome-6"
              name={option.icon}
              size={12}
              color={isActive ? appcolor.light : appcolor.dark}
            />
            <Text
              style={[styles.filterText, isActive && styles.filterTextActive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDateFilterSection = () => (
    <View style={styles.dateFilterWrap}>
      <View style={styles.dateFilterTop}>
        <View style={styles.dateFilterIconWrap}>
          <SpiralIcon
            type="font-awesome-6"
            name="calendar-alt"
            size={16}
            color={appcolor.primary}
          />
        </View>
        <View style={styles.dateFilterInfo}>
          <Text style={styles.dateFilterLabel}>Ngày hiển thị</Text>
          <Text style={styles.dateFilterValue}>{selectedDateLabel}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.topUploadBtn,
            pendingVisibleCount === 0 && styles.topUploadBtnDisabled,
          ]}
          onPress={handlerUploadPending}
          disabled={pendingVisibleCount === 0 || isUploadingPending}
        >
          <SpiralIcon
            type="font-awesome-6"
            name="cloud-upload-alt"
            size={11}
            color={appcolor.light}
          />
          <Text style={styles.topUploadBtnText}>
            {isUploadingPending
              ? 'Đang gửi...'
              : `Gửi lại (${pendingVisibleCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateFilterActions}>
        <TouchableOpacity
          style={styles.dateFilterActionBtn}
          onPress={handleSelectToday}
        >
          <SpiralIcon
            type="font-awesome-6"
            name="dot-circle"
            size={11}
            color={appcolor.dark}
          />
          <Text style={styles.dateFilterActionText}>Hôm nay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateFilterActionBtn}
          onPress={() => setShowShopPicker(true)}
        >
          <SpiralIcon
            type="font-awesome-6"
            name="store"
            size={11}
            color={appcolor.dark}
          />
          <Text style={styles.dateFilterActionText} numberOfLines={1}>
            {selectedShopLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateFilterActionBtn, styles.dateFilterActionPrimary]}
          onPress={() => setShowDatePicker(true)}
        >
          <SpiralIcon
            type="font-awesome-6"
            name="calendar-week"
            size={11}
            color={appcolor.light}
          />
          <Text
            style={[
              styles.dateFilterActionText,
              styles.dateFilterActionTextPrimary,
            ]}
          >
            Chọn ngày
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDateModal = () => (
    <Modal
      transparent
      statusBarTranslucent
      visible={showDatePicker}
      animationType="fade"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={styles.dateModalContainer}>
        <Pressable
          style={styles.dateModalPressable}
          onPress={() => setShowDatePicker(false)}
        />
        <View style={styles.dateModalContent}>
          <View style={styles.dateModalHeader}>
            <View style={styles.dateModalTitleWrap}>
              <Text style={styles.dateModalTitle}>Chọn ngày hiển thị</Text>
              <Text style={styles.dateModalHint}>
                Vuốt trái/phải để đổi tháng
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dateCloseBtn}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.dateCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedDateChip}>
            <Text
              style={styles.selectedDateChipText}
            >{`Đang chọn: ${selectedDateLabel}`}</Text>
          </View>

          <View style={styles.calendarWrap}>
            <Calendar
              current={selectedDateForCalendar}
              firstDay={1}
              enableSwipeMonths
              markedDates={{
                [selectedDateForCalendar]: {
                  selected: true,
                  selectedColor: appcolor.primary,
                  selectedTextColor: appcolor.light,
                },
                [moment().format('YYYY-MM-DD')]: {
                  ...(selectedDateForCalendar === moment().format('YYYY-MM-DD')
                    ? {
                        selected: true,
                        selectedColor: appcolor.primary,
                        selectedTextColor: appcolor.light,
                      }
                    : {
                        marked: true,
                        dotColor: appcolor.primary,
                      }),
                },
              }}
              onDayPress={day => handleSelectDate(day.dateString)}
              theme={{
                backgroundColor: appcolor.light,
                calendarBackground: appcolor.light,
                textSectionTitleColor: appcolor.greylight,
                textDayHeaderFontWeight: '600',
                dayTextColor: appcolor.dark,
                todayTextColor: appcolor.primary,
                monthTextColor: appcolor.dark,
                arrowColor: appcolor.primary,
                textDisabledColor: appcolor.grayLight,
                textMonthFontWeight: '700',
                textMonthFontSize: 16,
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderShopModal = () => (
    <Modal
      transparent
      statusBarTranslucent
      visible={showShopPicker}
      animationType="fade"
      onRequestClose={() => setShowShopPicker(false)}
    >
      <View style={styles.dateModalContainer}>
        <Pressable
          style={styles.dateModalPressable}
          onPress={() => setShowShopPicker(false)}
        />
        <View style={styles.dateModalContent}>
          <View style={styles.dateModalHeader}>
            <View style={styles.dateModalTitleWrap}>
              <Text style={styles.dateModalTitle}>Chọn cửa hàng</Text>
              <Text style={styles.dateModalHint}>
                Danh sách cửa hàng theo bộ lọc hiện tại
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dateCloseBtn}
              onPress={() => setShowShopPicker(false)}
            >
              <Text style={styles.dateCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shopModalListWrap}>
            <TouchableOpacity
              style={[
                styles.shopModalItem,
                selectedShopId === 0 && styles.shopModalItemActive,
              ]}
              onPress={() => handleSelectShop(0)}
            >
              <Text
                style={[
                  styles.shopModalItemText,
                  selectedShopId === 0 && styles.shopModalItemTextActive,
                ]}
              >
                Tất cả shop
              </Text>
              {selectedShopId === 0 && (
                <SpiralIcon
                  type="font-awesome-6"
                  name="check"
                  size={12}
                  color={appcolor.primary}
                />
              )}
            </TouchableOpacity>
            {shopOptions.map(shop => {
              const isActive = selectedShopId === shop.shopId;
              return (
                <TouchableOpacity
                  key={`modal_shop_${shop.shopId}`}
                  style={[
                    styles.shopModalItem,
                    isActive && styles.shopModalItemActive,
                  ]}
                  onPress={() => handleSelectShop(shop.shopId)}
                >
                  <Text
                    style={[
                      styles.shopModalItemText,
                      isActive && styles.shopModalItemTextActive,
                    ]}
                  >
                    {shop.shopName}
                  </Text>
                  {isActive && (
                    <SpiralIcon
                      type="font-awesome-6"
                      name="check"
                      size={12}
                      color={appcolor.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderCustom
          title="Quản lý hình ảnh"
          leftFunc={() => navigation.goBack()}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={appcolor.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách hình ảnh...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Quản lý hình ảnh'}
        leftFunc={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {renderFilterSection()}
        {renderDateFilterSection()}

        {groupedReportData.length === 0 ? (
          <Text style={styles.emptyText}>
            Chưa có hình ảnh phù hợp với bộ lọc đã chọn.
          </Text>
        ) : (
          <CustomListView
            data={groupedReportData}
            renderItem={renderGroupItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bottomView={{ paddingBottom: 0 }}
            onRefresh={actionLoadData}
          />
        )}
      </View>
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.photos.map(item => ({
          ...item,
          photoPath: getPhotoUri(item),
        }))}
        initialIndex={pictureShow.index}
        onSwipeDown={handleCloseImage}
      />
      {renderDateModal()}
      {renderShopModal()}
    </View>
  );
};

export default PhotoManageScreen;
