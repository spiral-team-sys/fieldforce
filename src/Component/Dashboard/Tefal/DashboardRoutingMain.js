import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { DashboardRoutingTF } from './DashboardRoutingTF';
import { deviceHeight } from '../../Home';

export const DashboardRoutingMain = ({
  navigation,
  typeDashboard,
  handlerScrollItem,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState({ dataDashboard: [], itemMain: {} });
  const [_, setMutate] = useState(false);

  const LoadData = () => {
    setLoading(true);
    DataSummary(typeDashboard, mData => {
      dataMain.dataDashboard = JSON.parse(mData[0].chartData || '[]');
      // dataMain.itemMain = mData[0]
      setMutate(e => !e);
    });
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);
  const handleRefreshData = () => {
    LoadData();
  };
  // console.log(dataMain.dataDashboard.chartData, 'dataMain.dataDashboard.chartData');
  return (
    <View style={{ width: '100%', minHeight: deviceHeight / 5 }}>
      <DashboardRoutingTF
        navigation={navigation}
        data={dataMain.dataDashboard[0]}
        loading={loading}
        handleRefreshData={handleRefreshData}
      />
    </View>
  );
};
