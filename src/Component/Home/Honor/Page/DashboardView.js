import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import * as Progress from 'react-native-progress';
import { DataSummary } from '../../../../Controller/DashboardController';
import CustomSlideView from '../../../../Control/Custom/CustomSlideView';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const DASHBOARD_MENU_TYPE = 'MENU';
const DASHBOARD_HEIGHT = 230;
const SLIDE_GAP = 12;
const HORIZONTAL_PADDING = 16;

const DASHBOARD_TYPES = {
  attendant: 'ATTENDANT',
  sellOut: 'SELLOUT',
};

const normalizeDashboardType = value => {
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    return null;
  }

  try {
    return JSON.parse(normalizedValue);
  } catch (_error) {
    return normalizedValue.replace(/^['"]|['"]$/g, '');
  }
};

const getDashboardMenu = async () => {
  let dashboardTypes = [];

  await DataSummary(DASHBOARD_MENU_TYPE, data => {
    const menuList = data?.[0]?.menuList;
    if (typeof menuList !== 'string') {
      return;
    }

    dashboardTypes = [
      ...new Set(
        menuList.split(',').map(normalizeDashboardType).filter(Boolean),
      ),
    ];
  });

  return dashboardTypes;
};

const getDashboardData = async type => {
  let dashboardData = [];

  await DataSummary(type, data => {
    dashboardData = Array.isArray(data) ? data : [];
  });

  return dashboardData;
};

const fetchAvailableDashboards = async () => {
  const configuredTypes = await getDashboardMenu();
  const dashboards = await Promise.all(
    configuredTypes.map(async type => ({
      type,
      data: await getDashboardData(type),
    })),
  );

  return dashboards.filter(item => item.data.length > 0);
};

const displayValue = value => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  return String(value).trim();
};

const displayAmount = value => {
  const normalizedValue = displayValue(value);
  if (/^[a-zA-ZÀ-ỹ]+$/.test(normalizedValue)) {
    return `0 ${normalizedValue}`;
  }
  return normalizedValue;
};

const clampProgress = value => Math.max(0, Math.min(value, 1));

const getSellOutProgress = item => {
  const percentValue = Number(item.percentValue);
  if (Number.isFinite(percentValue) && item.percentValue !== null) {
    return clampProgress(percentValue / 100);
  }

  const actual = Number(item.actualPercent) || 0;
  const target = Number(item.targetPercent) || 0;
  return target > 0 ? clampProgress(actual / target) : 0;
};

const getAttendanceProgress = item => {
  const actual = Number(item.aValue) || 0;
  const target = Number(item.tValue) || 0;
  return target > 0 ? clampProgress(actual / target) : 0;
};

const createSlides = dashboards => {
  const slides = [];

  dashboards.forEach((dashboard, idx) => {
    if (dashboard.type === DASHBOARD_TYPES.attendant) {
      dashboard.data.forEach((item, index) => {
        slides.push({
          key: `${dashboard.type}_${idx}_${index}`,
          kind: DASHBOARD_TYPES.attendant,
          type: dashboard.type,
          item,
        });
      });
      return;
    }

    if (dashboard.type === DASHBOARD_TYPES.sellOut) {
      slides.push({
        key: `${dashboard.type}_${idx}`,
        kind: DASHBOARD_TYPES.sellOut,
        type: dashboard.type,
        item: dashboard.data[0],
      });
      return;
    }

    slides.push({
      key: `${dashboard.type}_${idx}`,
      kind: 'DEFAULT',
      type: dashboard.type,
      data: dashboard.data,
    });
  });

  return slides;
};

const CardHeader = ({ appcolor, icon, title, loading, onRefresh }) => {
  const styles = StyleSheet.create({
    container: {
      height: 44,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      marginStart: 8,
      fontSize: 13,
      fontWeight: '800',
      color: appcolor.dark,
    },
    refresh: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <SpiralIcon
        name={icon}
        type="ionicon"
        size={18}
        color={appcolor.secondary}
      />
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <TouchableOpacity
        disabled={loading}
        style={styles.refresh}
        onPress={onRefresh}
      >
        {loading ? (
          <ActivityIndicator size="small" color={appcolor.secondary} />
        ) : (
          <SpiralIcon
            name="refresh"
            type="ionicon"
            size={20}
            color={appcolor.placeholderText}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const SellOutCard = ({ appcolor, item, navigation, loading, onRefresh }) => {
  const progress = getSellOutProgress(item);
  const percent = Math.round(progress * 100);
  const pageName = item.pageName;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    body: { flex: 1, paddingHorizontal: 14, paddingBottom: 12 },
    progressRow: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    progressCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    percent: { fontSize: 25, fontWeight: '900', color: appcolor.dark },
    complete: {
      marginTop: 1,
      fontSize: 8,
      fontWeight: '700',
      color: appcolor.placeholderText,
    },
    metrics: { flexDirection: 'row', gap: 10 },
    metric: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E8E9F2',
      backgroundColor: '#F8F9FB',
    },
    metricAccent: { borderColor: '#DFDEFF', backgroundColor: '#F8F7FF' },
    metricLabel: {
      fontSize: 8,
      fontWeight: '800',
      color: appcolor.placeholderText,
    },
    metricValue: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '900',
      color: appcolor.dark,
    },
    actualValue: { color: appcolor.secondary },
  });

  const content = (
    <>
      <CardHeader
        appcolor={appcolor}
        icon="radio-button-on-outline"
        title="Tiến độ số bán"
        loading={loading}
        onRefresh={onRefresh}
      />
      <View style={styles.body}>
        <View style={styles.progressRow}>
          <Progress.Circle
            progress={progress}
            size={106}
            thickness={13}
            color={appcolor.secondary}
            unfilledColor="#F0F1F5"
            borderWidth={0}
            strokeCap="butt"
          />
          <View style={styles.progressCenter}>
            <Text style={styles.percent}>{percent}%</Text>
            <Text style={styles.complete}>HOÀN THÀNH</Text>
          </View>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>CHỈ TIÊU DOANH SỐ</Text>
            <Text numberOfLines={1} style={styles.metricValue}>
              {displayAmount(item.targetValue)}
            </Text>
          </View>
          <View style={[styles.metric, styles.metricAccent]}>
            <Text style={[styles.metricLabel, styles.actualValue]}>
              DOANH THU THỰC TẾ
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.metricValue, styles.actualValue]}
            >
              {displayAmount(item.v2)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  if (!pageName) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={() =>
        navigation.navigate(pageName, {
          typeDashboard: DASHBOARD_TYPES.sellOut,
        })
      }
    >
      {content}
    </TouchableOpacity>
  );
};

const AttendanceCard = ({ appcolor, item, navigation, loading, onRefresh }) => {
  const progress = getAttendanceProgress(item);
  const percent = Math.round(progress * 100);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: appcolor.light,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start' },
    heading: { flex: 1, paddingEnd: 8 },
    title: { fontSize: 16, fontWeight: '900', color: appcolor.dark },
    subtitle: {
      marginTop: 4,
      fontSize: 9,
      fontWeight: '700',
      color: appcolor.placeholderText,
    },
    actions: { flexDirection: 'row', alignItems: 'center' },
    refresh: {
      width: 32,
      height: 32,
      marginStart: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    values: { marginTop: 18, flexDirection: 'row', alignItems: 'stretch' },
    valueBlock: { flex: 1 },
    divider: { width: 1, marginHorizontal: 16, backgroundColor: appcolor.grey },
    valueLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: appcolor.placeholderText,
    },
    value: {
      marginTop: 5,
      fontSize: 24,
      fontWeight: '900',
      color: appcolor.dark,
    },
    actualValue: { color: appcolor.secondary },
    description: { marginTop: 2, fontSize: 8, color: appcolor.placeholderText },
    progressLabel: {
      marginTop: 18,
      marginBottom: 7,
      fontSize: 10,
      fontWeight: '600',
      color: appcolor.placeholderText,
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: appcolor.grayLight,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: appcolor.secondary,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={() => navigation.navigate('attendanthistory')}
    >
      <View style={styles.topRow}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.title}>
            {item.dashboardName || 'Chấm công'}
          </Text>
          <Text style={styles.subtitle}>CHI TIẾT CHẤM CÔNG</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            disabled={loading}
            style={styles.refresh}
            onPress={onRefresh}
          >
            {loading ? (
              <ActivityIndicator size="small" color={appcolor.secondary} />
            ) : (
              <SpiralIcon
                name="refresh"
                type="ionicon"
                size={19}
                color={appcolor.placeholderText}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.values}>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>MỤC TIÊU</Text>
          <Text style={styles.value}>{displayValue(item.tValue)}</Text>
          <Text numberOfLines={1} style={styles.description}>
            {item.target?.trim()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>THỰC TẾ</Text>
          <Text style={[styles.value, styles.actualValue]}>
            {displayValue(item.aValue)}
          </Text>
          <Text numberOfLines={1} style={styles.description}>
            {item.actual?.trim()}
          </Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>{percent}% hoàn thành</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </TouchableOpacity>
  );
};

const DefaultCard = ({ appcolor, slide, loading, onRefresh }) => {
  const item = slide.data?.[0] || {};
  const title =
    item.title ||
    item.dashboardName ||
    item.chartName ||
    slide.type.replace(/_/g, ' ');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    text: {
      fontSize: 11,
      color: appcolor.placeholderText,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <CardHeader
        appcolor={appcolor}
        icon="analytics-outline"
        title={title}
        loading={loading}
        onRefresh={onRefresh}
      />
      <View style={styles.body}>
        <Text style={styles.text}>Dashboard đã có dữ liệu</Text>
      </View>
    </View>
  );
};

const DashboardView = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { width } = useWindowDimensions();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const slideWidth = width - HORIZONTAL_PADDING * 2;
  const slides = useMemo(() => createSlides(dashboards), [dashboards]);

  const loadDashboards = useCallback(async () => {
    setLoading(true);
    setDashboards(await fetchAvailableDashboards());
    setLoading(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      const dashboardData = await fetchAvailableDashboards();
      if (isActive) {
        setDashboards(dashboardData);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [isReloadData]);

  const styles = StyleSheet.create({
    mainContainer: {
      paddingTop: 14,
      paddingBottom: 4,
      backgroundColor: appcolor.surface,
    },
    slide: {
      height: DASHBOARD_HEIGHT,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      overflow: 'hidden',
    },
  });

  if (slides.length === 0) {
    return null;
  }

  const renderSlide = slide => {
    if (slide.kind === DASHBOARD_TYPES.sellOut) {
      return (
        <SellOutCard
          appcolor={appcolor}
          item={slide.item}
          navigation={navigation}
          loading={loading}
          onRefresh={loadDashboards}
        />
      );
    }

    if (slide.kind === DASHBOARD_TYPES.attendant) {
      return (
        <AttendanceCard
          appcolor={appcolor}
          item={slide.item}
          navigation={navigation}
          loading={loading}
          onRefresh={loadDashboards}
        />
      );
    }

    return (
      <DefaultCard
        appcolor={appcolor}
        slide={slide}
        loading={loading}
        onRefresh={loadDashboards}
      />
    );
  };

  return (
    <View style={styles.mainContainer}>
      <CustomSlideView
        data={slides}
        slideWidth={slideWidth}
        gap={SLIDE_GAP}
        horizontalPadding={HORIZONTAL_PADDING}
        showDots={slides.length > 1}
        slideStyle={styles.slide}
        renderItem={renderSlide}
      />
    </View>
  );
};

export default DashboardView;
