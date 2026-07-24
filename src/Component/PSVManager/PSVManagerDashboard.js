import React, { useRef, useEffect } from 'react';
import { View, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { Fragment, useState } from 'react';
import { ChartNationwide } from './ChartNationwide';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ChartByRegion } from './ChartByRegion';
import { ChartBySubCate } from './ChartBySubCate';
import { ChartByDealer } from './ChartByDealer';
import { ChartTopSKU } from './ChartTopSKU';
import { ChartTopStore } from './ChartTopStore';
import {
  PSVManagerSONW,
  PSVManagerSObyRegion,
  PSVManagerSObyDealer,
  PSVManagerSObyCate,
  PSVManagerSOTopStore,
  PSVManagerSOTopSKU,
} from '../../Controller/PSVManagerController';
export const PSVManagerDashboard = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [filterOption, setFilter] = useState({});
  const [loading, setLoading] = useState(false);
  const [data1, setD1] = useState([]);
  const [data2, setD2] = useState([]);
  const [data3, setD3] = useState([]);
  const [data4, setD4] = useState([]);
  const [data5, setD5] = useState([]);
  const [data6, setD6] = useState([]);
  const onSearch = async () => {
    await setLoading(true);
    const filter = {
      AreaCode: null,
      DealerCode: null,
      CategoryId: null,
      PositionId: null,
    };
    await setFilter(filter);
    const d1 = await PSVManagerSONW(filter);
    await setD1(d1);
    const d2 = await PSVManagerSObyRegion(filter);
    await setD2(d2);
    const d3 = await PSVManagerSObyDealer(filter);
    await setD3(d3);
    const d4 = await PSVManagerSObyCate(filter);
    await setD4(d4);
    const d5 = await PSVManagerSOTopStore(filter);
    await setD5(d5);
    const d6 = await PSVManagerSOTopSKU(filter);
    await setD6(d6);
    await setTimeout(() => {
      setLoading(false);
    }, 100);
  };
  useEffect(() => {
    onSearch();
    return () => loading;
  }, []);
  return (
    <SafeAreaView>
      {/* <HeaderCustom title="Home" iconRight="search" rightFunc={() => onSearch} /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            title="Loading..."
            tintColor="blue"
            onRefresh={() => onSearch()}
            refreshing={loading}
          />
        }
      >
        <View style={{ backgroundColor: appcolor.surface }}>
          {data1.length > 0 && <ChartNationwide key="1" chartdata={data1} />}
          {data2.length > 0 && <ChartByRegion key="2" chartdata={data2} />}
          {data3.length > 0 && <ChartByDealer key="3" chartdata={data3} />}
          {data4.length > 0 && <ChartBySubCate key="4" chartdata={data4} />}
          {data5.length > 0 && <ChartTopStore key="5" chartdata={data5} />}
          {data6.length > 0 && <ChartTopSKU key="6" chartdata={data6} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
