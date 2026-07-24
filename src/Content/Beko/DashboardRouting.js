import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { URLDEFAULT } from '../../Core/URLs';
import { scaleSize } from '../../Themes/AppsStyle';
import {
  ConvertSecondToTime,
  deviceHeight,
  deviceWidth,
} from '../../Core/Utility';
import { colorList } from '../../Core/Helper';
import LottieView from 'lottie-react-native';
import CustomTab from '../../Control/Custom/CustomTab';
import CustomListView from '../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const DashboardRouting = ({ navigation, data, onTitleResolved }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  let detailData = [];
  try {
    detailData = JSON.parse(data?.moreData || '[]');
  } catch (error) {
    detailData = [];
  }
  const details = [...detailData, { viewMonth: true }];

  useEffect(() => {
    if (typeof onTitleResolved === 'function' && data?.titleChart) {
      onTitleResolved(data.titleChart);
    }
  }, [data?.titleChart, onTitleResolved]);

  const [visitList, setVisitList] = useState([]);
  const [selected, setSelected] = useState({});
  const [jsonRoute, setJsonRouting] = useState([]);

  const styles = StyleSheet.create({
    container: { height: '100%' },
    summaryAction: { paddingTop: 8 },
    summaryRow: { flexDirection: 'row' },
    summaryItem: { flexGrow: 1, alignItems: 'center' },
    summaryValue: {
      fontSize: scaleSize(24),
      fontWeight: 'bold',
      color: appcolor.light,
      padding: 2,
    },
    summaryLabel: {
      fontSize: scaleSize(12),
      color: 'rgba(255,255,255,0.88)',
      fontWeight: '600',
    },
    decorativeCircle: {
      backgroundColor: appcolor.white,
      opacity: 0.1,
      borderRadius: 700,
      position: 'absolute',
      width: 170,
      height: 170,
      left: '-9%',
      top: '-9%',
    },
    spacer: { flex: 1 },
    listWrap: {
      height: 136,
      marginHorizontal: 12,
      marginTop: 8,
      marginBottom: 12,
    },
    listContent: { alignItems: 'center', paddingRight: 4 },
    detailCardPress: {
      width: deviceWidth * 0.58,
      height: 120,
      marginRight: 10,
    },
    detailCard: {
      flex: 1,
      backgroundColor: appcolor.light,
      padding: 12,
      borderRadius: 12,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailDate: {
      fontWeight: '500',
      fontSize: scaleSize(18),
      color: appcolor.dark,
    },
    detailLabel: { fontSize: scaleSize(11), color: appcolor.dark },
    detailValue: {
      flexGrow: 1,
      textAlign: 'right',
      fontSize: scaleSize(18),
      color: appcolor.dark,
    },
    detailDangerValue: {
      flexGrow: 1,
      fontWeight: '700',
      textAlign: 'right',
      fontSize: scaleSize(18),
      color: appcolor.danger,
    },
    moreWrap: {
      width: 90,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreIconWrap: {
      borderColor: appcolor.light,
      borderWidth: 2,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: 10,
    },
    moreText: {
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
      fontSize: scaleSize(12),
    },
    sheetContainer: { backgroundColor: appcolor.surface },
    sheetContent: { height: deviceHeight - 40 },
    sheetHeader: { flexDirection: 'row', width: '100%' },
    sheetTitle: {
      width: '86%',
      textAlign: 'center',
      padding: 12,
      fontSize: scaleSize(18),
      color: appcolor.primary,
      fontWeight: 'bold',
    },
    sheetCloseWrap: { width: '12%', marginEnd: 10 },
    routingTabWrap: {
      backgroundColor: appcolor.light,
      marginTop: 40,
      padding: 6,
      width: deviceWidth,
    },
    detailTabWrap: {
      backgroundColor: appcolor.surface,
      marginTop: 40,
      padding: 6,
      width: deviceWidth,
    },
  });

  const showDetail = async item => {
    setSelected(item);
    setVisitList(item.details);
    setJsonRouting(item?.routeInfo || '[]');
    SheetManager.show('shopList');
  };

  const rowItem = ({ item, index }) => {
    if (item.viewMonth === undefined) {
      return (
        <TouchableOpacity
          onPress={() => showDetail(item)}
          key={index + 'dasd6aj'}
          style={styles.detailCardPress}
        >
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailDate}>{item.workDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Đã đi </Text>
              <Text style={styles.detailValue}>{item.shopActual || '0'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chỉ tiêu </Text>
              <Text style={styles.detailValue}>{item.shopPlan || '0'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số km đã đi </Text>
              <Text style={styles.detailDangerValue}>{item.distance}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('routingmonth')}
        style={styles.moreWrap}
      >
        <View style={styles.moreIconWrap}>
          <SpiralIcon
            name="arrow-right"
            size={20}
            containerStyle={{ alignSelf: 'center' }}
            color={appcolor.light}
          />
        </View>
        <Text style={styles.moreText}>Xem tất cả</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[appcolor.primary, appcolor.info || '#1F6FEB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('attendanthistory')}
        style={styles.summaryAction}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data?.aValue || '0'}</Text>
            <Text style={styles.summaryLabel}>{data?.aLable}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data?.tValue}</Text>
            <Text style={styles.summaryLabel}>{data?.tLable}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data?.pValue || '0%'}</Text>
            <Text style={styles.summaryLabel}>{data?.pLable || '%'}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.decorativeCircle} />
      <View style={styles.spacer} />
      <View style={styles.listWrap}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {details.map((item, index) => (
            <React.Fragment key={`routing_detail_${item.workDate || index}`}>
              {rowItem({ item, index })}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
      <ActionSheet
        bottomOffset={50}
        id="shopList"
        containerStyle={StyleSheet.flatten([
          styles.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              Cửa hàng đi ngày {selected.workDate}
            </Text>
            <TouchableOpacity
              style={styles.sheetCloseWrap}
              onPress={() => SheetManager.hide('shopList')}
            >
              <SpiralIcon size={14} name="close" raised />
            </TouchableOpacity>
          </View>

          <CustomTab
            keyTabName="name"
            data={[{ name: 'Lộ trình' }, { name: 'Chi tiết' }]}
            dataMain={[]}
            scrollEnabled={false}
            renderItem={item => {
              if (item.name === 'Lộ trình') {
                return (
                  <View style={styles.routingTabWrap}>
                    <Routing route={selected} data={jsonRoute} />
                  </View>
                );
              } else if (item.name === 'Chi tiết') {
                return (
                  <View style={styles.detailTabWrap}>
                    <Detail visitList={visitList} />
                  </View>
                );
              }
              return null;
            }}
          />
        </View>
      </ActionSheet>
    </LinearGradient>
  );
};
const Detail = ({ visitList }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const rowVisit = ({ item, index }) => {
    const _imageUri = item?.Photo?.includes('https')
      ? item.Photo
      : `${URLDEFAULT}${item.Photo}`;
    return (
      <View
        key={`${index}kah`}
        style={{ padding: 7, backgroundColor: appcolor.light, margin: 7 }}
      >
        <View style={{ padding: 7 }}>
          <Text style={{ fontWeight: '900', color: appcolor.dark }}>
            Cửa hàng {item.ShopCode} {item.ShopName}
          </Text>
          <Text style={{ color: appcolor.dark, fontSize: 12 }}>
            {item?.Address || ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={{ width: '30%', height: 120 }}
            source={{ uri: _imageUri }}
          />
          <View style={{ flexGrow: 1, width: '65%', marginLeft: 7 }}>
            <Text style={{ color: appcolor.dark }}>
              Thời gian đến cửa hàng {item.AttendantTime}
            </Text>
            <Text style={{ color: appcolor.dark, fontSize: 12 }}>
              {item?.TotalTime}
            </Text>
            <Text style={{ color: appcolor.dark, fontSize: 12 }}>
              {item?.ReportList}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <CustomListView
      data={visitList}
      showsVerticalScrollIndicator={false}
      renderItem={rowVisit}
    />
  );
};
const Routing = ({ data, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const routeList = JSON.parse(data || '[]');
  var totalTime = routeList.length
    ? routeList
      ?.map(o => o.Duration.value)
      .reduce((a, c) => {
        return a + c;
      })
    : 0;
  totalTime = ConvertSecondToTime(totalTime);
  const rowTimeLine = ({ item, index }) => {
    // console.log(item)
    return (
      <View key={`${index}29a`} style={{ flexDirection: 'row' }}>
        <View
          style={{
            height: 100,
            top: -20,
            backgroundColor: appcolor.light,
            borderRadius: 70,
            borderColor: colorList[index],
            borderWidth: 2,
            width: '40%',
            alignSelf: 'flex-start',
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colorList[index], fontSize: 16 }}>Điểm đi</Text>
          <Text
            numberOfLines={4}
            style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}
          >
            {item.Start_Address}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            justifyContent: 'center',
            top: 26,
            width: 20,
            height: 3,
            backgroundColor: appcolor.warning,
          }}
        >
          {/* <View style={{ left: -18, width: 25, height: 25, borderWidth: 7, borderColor: appcolor.white, borderRadius: 20, backgroundColor: colorList[index] }} /> */}
        </View>
        <View
          style={{
            justifyContent: 'center',
            width: 10,
            height: 230,
            backgroundColor: colorList[index],
          }}
        ></View>
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            top: 40,
            width: 30,
            height: 3,
            backgroundColor: appcolor.danger,
          }}
        >
          <View
            style={{
              left: -18,
              width: 25,
              height: 25,
              borderWidth: 7,
              borderColor: appcolor.white,
              borderRadius: 20,
              backgroundColor: colorList[index],
            }}
          />
        </View>
        <View style={{ width: '40%' }}>
          <View
            style={{ height: 100, justifyContent: 'flex-end', marginBottom: 7 }}
          >
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {item.Distance?.text}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Di chuyển {item.Duration?.text}
            </Text>
          </View>
          <View
            style={{
              height: 100,
              backgroundColor: appcolor.light,
              borderRadius: 49,
              width: '100%',
              alignSelf: 'flex-end',
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: appcolor.danger,
                fontSize: 17,
              }}
            >
              Điểm đến
            </Text>
            <Text
              numberOfLines={4}
              style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}
            >
              {item.End_Address}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: appcolor.surface,
      }}
    >
      <CustomListView
        data={routeList}
        showsVerticalScrollIndicator={false}
        renderItem={rowTimeLine}
        ListHeader={<View style={{ height: 30 }} />}
        bottomView={{ height: 100 }}
      />
      <View
        style={{
          height: 100,
          backgroundColor: appcolor.light,
          width: '100%',
          padding: 12,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          position: 'absolute',
          bottom: 0,
        }}
      >
        <View style={{ flexDirection: 'row', paddingTop: 10 }}>
          <Text
            style={{
              flexGrow: 0.31,
              fontSize: 28,
              textAlign: 'right',
              fontWeight: 'bold',
              color: appcolor.danger,
            }}
          >
            {totalTime}
          </Text>
          <LottieView
            style={{
              height: 100,
              alignItems: 'center',
              top: -20,
              width: '20%',
            }}
            autoPlay
            autoSize
            source={require('../../Themes/lotties/location-finding.json')}
          />
          <Text
            style={{
              fontSize: 30,
              flexGrow: 1,
              textAlign: 'right',
              fontWeight: 'bold',
              color: appcolor.danger,
            }}
          >
            {route?.distance}
          </Text>
        </View>
      </View>
    </View>
  );
};
