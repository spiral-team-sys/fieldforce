import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { StyleSheet } from 'react-native';
import moment from 'moment';
import { LoadingView } from '../../Control/ItemLoading';
import { fontWeightBold } from '../../Themes/AppsStyle';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Calendar } from 'react-native-calendars';
import { Image } from 'react-native';
import { URLDEFAULT } from '../../Core/URLs';
import { REPORT } from '../../API/ReportAPI';
import { Icon } from '@rneui/themed';
import CustomListView from '../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const TOUCH_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const isWorkingPlanItem = item =>
  `${item?.TableName || item?.tableName || ''}`.toLowerCase() === 'workingplan';

const getWorkingDate = item => {
  const template = `${item?.Template || ''}`;
  const dateMatch = template.match(/(\d{2}\/\d{2}\/\d{4})/);
  return dateMatch?.[1] || moment().format('DD/MM/YYYY');
};

export const ReportZalo = ({ navigation }) => {
  const { kpiinfo, appcolor, userinfo } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState([]);

  const buildDisplayData = inputData => {
    const apiData = Array.isArray(inputData) ? inputData : [];
    const shops = apiData.filter(it => !isWorkingPlanItem(it));
    const workingPlans = apiData.filter(it => isWorkingPlanItem(it));
    const merged = [];
    if (shops.length > 0) {
      merged.push({
        isHeader: true,
        id: 'header_shop',
        title: 'Danh sách shop',
      });
      merged.push(...shops);
    }
    if (workingPlans.length > 0) {
      merged.push({
        isHeader: true,
        id: 'header_working_plan',
        title: 'Lịch làm việc',
      });
      merged.push(...workingPlans);
    }
    return merged;
  };

  const displayData = useMemo(() => buildDisplayData(data), [data]);

  const LoadData = async () => {
    await setLoading(true);
    const workDate = moment(selected || new Date()).format('YYYYMMDD');
    const result = await REPORT.GetDataReportZalo(workDate, '');
    setData(result?.data || []);
    await setLoading(false);
  };
  useEffect(() => {
    const _load = LoadData();
    return () => {
      _load;
    };
  }, []);
  // Handler
  const onSelectShop = item => {
    navigation.navigate('shopreportzalo', {
      dataMain: item,
      date: selected || moment().format('YYYY-MM-DD'),
    });
  };
  const handleDayPress = async day => {
    await setLoading(true);
    setSelected(day.dateString);
    const workDate = moment(day.dateString).format('YYYYMMDD');
    const result = await REPORT.GetDataReportZalo(workDate, '');
    setData(result?.data || []);
    await setLoading(false);
  };
  const onShowDate = () => {
    SheetManager.show('calender-sheet');
  };
  // View
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.surface },
    content: { flex: 1, width: '100%' },
    listContent: { paddingBottom: 24, paddingHorizontal: 16, paddingTop: 12 },
    listHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 8,
      paddingTop: 12,
    },
    listHeaderText: {
      color: appcolor.dark,
      fontSize: 16,
      fontWeight: fontWeightBold,
      letterSpacing: -0.3,
    },
    listHeaderBadge: {
      backgroundColor: appcolor.light,
      borderRadius: 9999,
      minWidth: 28,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    listHeaderBadgeText: {
      color: appcolor.primary,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    cardWrap: { flex: 1, paddingBottom: 12 },
    shopCard: {
      backgroundColor: appcolor.light,
      borderRadius: 16,
      elevation: 1,
      flexDirection: 'row',
      padding: 12,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    imageOverview: {
      backgroundColor: appcolor.grey,
      borderRadius: 12,
      height: 92,
      width: 92,
    },
    infoWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 12 },
    rowMeta: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 6 },
    metaIcon: { marginTop: 2 },
    shopName: {
      color: appcolor.primary,
      fontSize: 16,
      fontWeight: fontWeightBold,
      letterSpacing: -0.3,
    },
    desShop: {
      color: appcolor.dark,
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 6,
    },
    tag: {
      alignSelf: 'flex-start',
      backgroundColor: appcolor.surface,
      borderRadius: 9999,
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: { color: appcolor.dark, fontSize: 12, fontWeight: '600' },
    chevronWrap: { alignItems: 'center', justifyContent: 'center', width: 24 },
    emptyState: {
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderRadius: 16,
      justifyContent: 'center',
      marginHorizontal: 16,
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    emptyIconWrap: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      marginBottom: 12,
      width: 56,
    },
    emptyTitle: {
      color: appcolor.dark,
      fontSize: 16,
      fontWeight: fontWeightBold,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    emptyText: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '500',
      marginTop: 4,
      textAlign: 'center',
    },
    emptyAction: {
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      minHeight: 44,
      paddingHorizontal: 16,
    },
    emptyActionText: {
      color: appcolor.light,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    calendarSheet: { backgroundColor: appcolor.light },
    calendarActionSheetContainer: {
      backgroundColor: appcolor.light,
      paddingBottom: insets.bottom,
    },
  });

  const renderItem = ({ item, index }) => {
    if (item?.isHeader) {
      const groupCount =
        item.id === 'header_shop'
          ? data.filter(it => !isWorkingPlanItem(it)).length
          : data.filter(it => isWorkingPlanItem(it)).length;
      return (
        <View key={item.id} style={styles.listHeader}>
          <Text style={styles.listHeaderText}>{item.title}</Text>
          <View style={styles.listHeaderBadge}>
            <Text style={styles.listHeaderBadgeText}>{groupCount}</Text>
          </View>
        </View>
      );
    }
    const selectShop = () => {
      onSelectShop(item);
    };
    const photoList = JSON.parse(item.PhotoList || '[]');
    const imageOverview = photoList.find(e => e.PhotoType === 'Overview');
    const isWorkingPlan = isWorkingPlanItem(item);
    const photoPath = imageOverview?.PhotoPath
      ? imageOverview?.PhotoPath?.indexOf('file://') > -1 ||
        imageOverview?.PhotoPath?.indexOf('https://') > -1 ||
        !imageOverview?.PhotoPath?.includes('uploaded')
        ? imageOverview?.PhotoPath
        : URLDEFAULT + imageOverview?.PhotoPath
      : null;
    return (
      <View style={styles.cardWrap} key={index}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={TOUCH_HIT_SLOP}
          onPress={selectShop}
          style={styles.shopCard}
        >
          {photoPath ? (
            <Image
              resizeMode="cover"
              source={{ uri: photoPath }}
              style={styles.imageOverview}
            />
          ) : (
            <Image
              resizeMode="cover"
              source={require('../../Themes/Images/noimage.png')}
              style={styles.imageOverview}
            />
          )}
          <View style={styles.infoWrap}>
            {isWorkingPlan ? (
              <>
                <Text
                  numberOfLines={2}
                  style={styles.shopName}
                >{`Lịch làm việc ${userinfo?.groupType || ''}`}</Text>
                <View style={styles.rowMeta}>
                  <SpiralIcon
                    color={appcolor.primary}
                    name="calendar"
                    size={14}
                    style={styles.metaIcon}
                    type="feather"
                  />
                  <Text numberOfLines={1} style={styles.desShop}>
                    {getWorkingDate(item)}
                  </Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{'Working plan'}</Text>
                </View>
              </>
            ) : (
              <>
                <Text numberOfLines={2} style={styles.shopName}>
                  {item.ShopName || 'Cửa hàng'}
                </Text>
                <View style={styles.rowMeta}>
                  <SpiralIcon
                    color={appcolor.primary}
                    name="hash"
                    size={14}
                    style={styles.metaIcon}
                    type="feather"
                  />
                  <Text numberOfLines={1} style={styles.desShop}>
                    {item.ShopCode || ''}
                  </Text>
                </View>
                <View style={styles.rowMeta}>
                  <SpiralIcon
                    color={appcolor.primary}
                    name="map-pin"
                    size={14}
                    style={styles.metaIcon}
                    type="feather"
                  />
                  <Text numberOfLines={2} style={styles.desShop}>
                    {item.ShopAddress || ''}
                  </Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.chevronWrap}>
            <SpiralIcon
              color={appcolor.primary}
              name="chevron-right"
              size={20}
              type="feather"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <SpiralIcon
          color={appcolor.primary}
          name="inbox"
          size={28}
          type="feather"
        />
      </View>
      <Text style={styles.emptyTitle}>{'Không có dữ liệu'}</Text>
      <Text style={styles.emptyText}>
        {'Chưa có báo cáo Zalo cho ngày đã chọn.'}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        hitSlop={TOUCH_HIT_SLOP}
        onPress={LoadData}
        style={styles.emptyAction}
      >
        <SpiralIcon
          color={appcolor.light}
          name="refresh-cw"
          size={16}
          type="feather"
        />
        <Text style={styles.emptyActionText}>{'Tải lại'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <HeaderCustom
          title={kpiinfo?.menuNameVN}
          leftFunc={() => navigation.goBack()}
          rightFunc={onShowDate}
          iconRight={'calendar'}
        />
        {loading ? <LoadingView isLoading={loading} title=" " /> : null}
        <CustomListView
          renderItem={renderItem}
          data={displayData}
          estimatedItemSize={132}
          extraData={[data, selected]}
          showsVerticalScrollIndicator={false}
          ListEmpty={renderEmpty()}
          onRefresh={LoadData}
          isRefresh={false}
          containerStyle={styles.content}
          contentContainerStyle={styles.listContent}
        />
      </View>
      <ActionSheet
        id="calender-sheet"
        containerStyle={styles.calendarActionSheetContainer}
      >
        <View style={styles.calendarSheet}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedDotColor: appcolor.primary,
              },
            }}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
