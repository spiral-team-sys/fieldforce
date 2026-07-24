import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Text } from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { GetDataDashboard } from '../../../../Controller/DashboardController';
import { deviceWidth } from '../../../../Core/Utility';
import { DashboardRouting } from '../../../../Content/Beko/DashboardRouting';
import { DashboardSellInTF } from '../../../Dashboard/Tefal/DashboardSellIn';
import { DashBoardTargetTF } from '../../../Dashboard/Tefal/DashBoardTargetTF';
import { getMetricData } from '../../../Reports/Programs/Dashboard/Control/summaryMetrics';
import SummaryProgramCard from '../../../Reports/Programs/Dashboard/Item/SummaryProgramCard';
import CustomSlideView from '../../../../Control/Custom/CustomSlideView';

const SLIDE_GAP = 12;
const SLIDE_HEIGHT = 292;
const PROGRAM_SUMMARY_TITLE = 'Thống kê chương trình đăng ký';
const PROGRAM_SUMMARY_SUBTITLE =
  'Tổng quan nhanh từ dashboard, nhấn để mở chi tiết.';

export const DashboardView = ({ navigation, isLoadMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [chartdata, setChartData] = useState([]);
  const [programMetrics, setProgramMetrics] = useState(null);
  const [dashboardTitles, setDashboardTitles] = useState({});
  const slideWidth = deviceWidth - 28;
  const slideHeight = SLIDE_HEIGHT;

  const createProgramSummaryParams = useCallback(() => {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    return {
      fromDate: startOfMonth.format('YYYYMMDD'),
      toDate: endOfMonth.format('YYYYMMDD'),
      fromdate: startOfMonth.format('YYYY-MM-DD'),
      todate: endOfMonth.format('YYYY-MM-DD'),
      employeeId: null,
      dealerId: null,
      programId: null,
    };
  }, []);

  const loadChart = useCallback(async () => {
    await GetDataDashboard(setChartData);
  }, []);

  const loadProgramSummary = useCallback(async () => {
    const params = createProgramSummaryParams();

    await DashboardAPI.GetDashboardReport(params, mData => {
      setProgramMetrics(getMetricData(mData || []));
    });
  }, [createProgramSummaryParams]);

  useEffect(() => {
    loadChart();
    loadProgramSummary();
  }, [isLoadMain, loadChart, loadProgramSummary]);

  const dashboardItems = useMemo(() => {
    return chartdata || [];
  }, [chartdata]);

  const slides = useMemo(() => {
    const list = [{ type: 'program' }];
    dashboardItems.forEach(item => list.push({ type: 'chart', ...item }));
    return list;
  }, [dashboardItems]);

  const getDashboardTitle = useCallback(pageName => {
    if (pageName === 'ROUTING') return 'Routing';
    if (pageName === 'SELLIN') return 'Sell In';
    return (pageName || 'Dashboard').replace(/_/g, ' ');
  }, []);

  const onResolveDashboardTitle = useCallback((pageName, title) => {
    if (!pageName || !title) return;
    setDashboardTitles(prev =>
      prev?.[pageName] === title ? prev : { ...prev, [pageName]: title },
    );
  }, []);

  const renderProgramSummarySlide = () => {
    if (!programMetrics) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Chưa có dữ liệu thống kê chương trình
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.heroCard}>
        <SummaryProgramCard
          appcolor={appcolor}
          metrics={programMetrics}
          showMeta={false}
          title={PROGRAM_SUMMARY_TITLE}
          subtitle={PROGRAM_SUMMARY_SUBTITLE}
          fillHeight
          containerStyle={{ height: slideHeight, marginBottom: 0 }}
          onPress={() => navigation.navigate('summaryprogram')}
        />
      </View>
    );
  };

  const renderDashboardContent = item => {
    if (item.pageName === 'ROUTING') {
      return (
        <DashboardRouting
          onTitleResolved={title =>
            onResolveDashboardTitle(item.pageName, title)
          }
          navigation={navigation}
          data={JSON.parse(item.chartData)[0] || {}}
        />
      );
    }

    if (item.pageName === 'SELLIN') {
      return (
        <DashboardSellInTF
          onTitleResolved={title =>
            onResolveDashboardTitle(item.pageName, title)
          }
          navigation={navigation}
          typeDashboard={item.pageName}
        />
      );
    }

    return (
      <DashBoardTargetTF
        onTitleResolved={title => onResolveDashboardTitle(item.pageName, title)}
        navigation={navigation}
        typeDashboard={item.pageName}
      />
    );
  };

  const styles = StyleSheet.create({
    container: { marginBottom: 14 },

    slideShell: {
      width: slideWidth,
      height: slideHeight,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    slideHeader: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 13,
    },
    slideHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    slideHeaderTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: appcolor.light,
    },
    slideHeaderSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      color: 'rgba(255,255,255,0.82)',
      marginTop: 4,
      maxWidth: '84%',
    },
    slideBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    slideBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: appcolor.light,
    },
    heroCard: { height: slideHeight },
    slideBody: {
      flex: 1,
    },
    slideBodySoft: {
      flex: 1,
      backgroundColor: appcolor.light,
    },
    contentFrame: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
    },
    contentFrameStrong: {
      backgroundColor: appcolor.surface,
    },
    contentCanvas: {
      flex: 1,
      overflow: 'hidden',
    },
    emptyBox: {
      width: slideWidth,
      height: slideHeight,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    emptyText: {
      fontSize: 12,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
      textAlign: 'center',
    },
  });

  const hasData = dashboardItems.length > 0 || !!programMetrics;

  const renderChartSlide = (pageName, content) => {
    const resolvedTitle =
      dashboardTitles?.[pageName] || getDashboardTitle(pageName);
    const config =
      pageName === 'ROUTING'
        ? {
            title: resolvedTitle,
            subtitle: 'Tuyến và độ phủ hiện tại',
            colors: [appcolor.primary, appcolor.info || '#1F6FEB'],
            bodyStyle: styles.slideBody,
            frameStyle: [styles.contentFrame, styles.contentFrameStrong],
          }
        : pageName === 'SELLIN'
        ? {
            title: resolvedTitle,
            subtitle: 'Hiệu quả nhập hàng',
            colors: [
              appcolor.success || '#2E7D32',
              appcolor.warning || '#F39C12',
            ],
            bodyStyle: styles.slideBody,
            frameStyle: styles.contentFrame,
          }
        : {
            title: resolvedTitle,
            subtitle: 'Theo dõi chỉ tiêu và tiến độ',
            colors: [appcolor.second || '#18A999', appcolor.primary],
            bodyStyle: styles.slideBodySoft,
            frameStyle: styles.contentFrame,
          };
    return (
      <View style={styles.slideShell}>
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.slideHeader}
        >
          <View style={styles.slideHeaderTop}>
            <View>
              <Text style={styles.slideHeaderTitle}>{config.title}</Text>
              <Text style={styles.slideHeaderSubtitle}>{config.subtitle}</Text>
            </View>
            <View style={styles.slideBadge}>
              <Text style={styles.slideBadgeText}>{pageName || 'ITEM'}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={config.bodyStyle}>
          <View style={config.frameStyle}>
            <View style={styles.contentCanvas}>{content}</View>
          </View>
        </View>
      </View>
    );
  };

  if (!hasData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CustomSlideView
        data={slides}
        slideWidth={slideWidth}
        gap={SLIDE_GAP}
        horizontalPadding={8}
        showDots={false}
        renderItem={item => {
          if (item.type === 'program') return renderProgramSummarySlide();
          return renderChartSlide(item.pageName, renderDashboardContent(item));
        }}
      />
    </View>
  );
};
