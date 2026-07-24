import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { DailySummary } from '../Dashboard/Daily/DailySumary';
import { GetDailySummary } from '../../Controller/DashboardController';
import { deviceHeight } from '../../Themes/AppsStyle';

export const LGHomeDashboard = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [table, setTable] = useState([]);
  const [table1, setTable1] = useState([]);

  const onLoadData = async () => {
    await setLoading(true);
    const result = await GetDailySummary();
    await setTable(result.table || []);
    await setTable1(result.table1 || []);
    await setLoading(false);
  };

  useEffect(() => {
    onLoadData();
  }, []);

  return (
    <ScrollView
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: appcolor.light }}
      contentContainerStyle={{ paddingBottom: deviceHeight / 2 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          title="Đang cập nhật dữ liệu"
          onRefresh={onLoadData}
        />
      }
    >
      <DailySummary isLoading={loading} table={table} table1={table1} />
    </ScrollView>
  );
};
