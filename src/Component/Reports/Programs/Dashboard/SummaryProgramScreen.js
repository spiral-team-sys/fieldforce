import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { LoadingView } from '../../../../Control/ItemLoading';
import SummaryDashboardPage from './Page/SummaryDashboardPage';
import { getMetricData } from './Control/summaryMetrics';
import {
  applySummaryFilterSort,
  DEFAULT_SUMMARY_FILTER_SORT,
} from './Control/summaryFilterSort';

const SummaryProgramScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterSort, setFilterSort] = useState(DEFAULT_SUMMARY_FILTER_SORT);

  const filteredData = useMemo(() => {
    return applySummaryFilterSort(apiData, filterSort);
  }, [apiData, filterSort]);

  const metrics = useMemo(() => {
    return getMetricData(filteredData);
  }, [filteredData]);

  const defaultApiParams = useMemo(() => {
    const start = moment().startOf('quarter');
    const end = moment().endOf('quarter');
    return {
      fromDate: start.format('YYYYMMDD'),
      toDate: end.format('YYYYMMDD'),
      fromdate: start.format('YYYY-MM-DD'),
      todate: end.format('YYYY-MM-DD'),
      employeeId: null,
      dealerId: null,
      programId: null,
    };
  }, []);

  const buildApiParams = useCallback(
    (filterInput = {}) => {
      const normalizeYMD = (value, fallback) => {
        if (value === null || value === undefined || value === '')
          return fallback;
        const text = `${value}`.trim();
        if (/^\d{8}$/.test(text)) return text;

        const parsed = moment(
          text,
          ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY', 'YYYYMMDD'],
          true,
        );
        return parsed.isValid() ? parsed.format('YYYYMMDD') : fallback;
      };

      const normalizeDashDate = (value, fallback) => {
        if (value === null || value === undefined || value === '')
          return fallback;
        const text = `${value}`.trim();

        const parsed = moment(
          text,
          ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY', 'YYYYMMDD'],
          true,
        );
        return parsed.isValid() ? parsed.format('YYYY-MM-DD') : fallback;
      };

      const rawFrom = filterInput?.fromDate ?? filterInput?.fromdate;
      const rawTo = filterInput?.toDate ?? filterInput?.todate;

      const fromDate = normalizeYMD(rawFrom, defaultApiParams.fromDate);
      const toDate = normalizeYMD(rawTo, defaultApiParams.toDate);
      const fromdate = normalizeDashDate(rawFrom, defaultApiParams.fromdate);
      const todate = normalizeDashDate(rawTo, defaultApiParams.todate);

      const hasValidRange = Number(fromDate) <= Number(toDate);

      return {
        fromDate: hasValidRange ? fromDate : defaultApiParams.fromDate,
        toDate: hasValidRange ? toDate : defaultApiParams.toDate,
        fromdate: hasValidRange ? fromdate : defaultApiParams.fromdate,
        todate: hasValidRange ? todate : defaultApiParams.todate,
        employeeId: filterInput?.employeeId ?? defaultApiParams.employeeId,
        dealerId: filterInput?.dealerId ?? defaultApiParams.dealerId,
        programId: filterInput?.programId ?? defaultApiParams.programId,
      };
    },
    [defaultApiParams],
  );

  const LoadData = useCallback(
    async (isPullRefresh = false) => {
      isPullRefresh ? setRefreshing(true) : setLoading(true);
      setErrorMessage('');

      const routeFilter =
        route?.params?.params || route?.params?.filter || route?.params || {};
      const params = buildApiParams(routeFilter);

      await DashboardAPI.GetDashboardReport(params, (mData, message) => {
        if (message) {
          setErrorMessage(message);
          setApiData([]);
          isPullRefresh ? setRefreshing(false) : setLoading(false);
          return;
        }

        const payload = mData || [];
        setApiData(payload);
        isPullRefresh ? setRefreshing(false) : setLoading(false);
      });
    },
    [buildApiParams, route?.params],
  );

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    LoadData();
  }, [LoadData]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1 },
  });

  const onOpenDetail = (detailData = filteredData, typeData = null) => {
    navigation.navigate('summaryprogramdetail', {
      rawData: detailData,
      filterSort,
      typeData,
    });
  };

  const onRefresh = () => {
    LoadData(true);
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={'Thống kê chương trình'} leftFunc={onBack} />
      <View style={styles.contentContainer}>
        <LoadingView
          isLoading={isLoading}
          title={'Đang cập nhật thống kê'}
          styles={{ paddingTop: 8 }}
        />
        {!isLoading && (
          <SummaryDashboardPage
            appcolor={appcolor}
            metrics={metrics}
            rawData={filteredData}
            filterSort={filterSort}
            onChangeFilterSort={setFilterSort}
            onCardPress={onOpenDetail}
            errorMessage={errorMessage}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

export default SummaryProgramScreen;
