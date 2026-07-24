import React, { useState } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { CalendarView } from '../Control/CalendarView';
import { WorkingPlanAPI } from '../../../API/WorkingPlanApi';
import moment from 'moment';
import { PlanDetailByDay } from '../Control/DetailDataPlan/PlanDetailByDay';
import CustomTab from '../../../Control/Custom/CustomTab';
import CustomListView from '../../../Control/Custom/CustomListView';
import MyTeam from './MyTeam';

export const PlanOffice = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataPlan, setDataPlan] = useState([]);
  const [indexTab, setTabActive] = useState(0);
  const [itemDayMain, setItemDayMain] = useState({});
  const [dataDetailByDay, setDataDetailByDay] = useState([]);
  const [filter, setFilter] = useState({
    month: moment().month() + 1,
    year: moment().year(),
  });
  //
  const LoadData = async (_year, _month) => {
    await setLoading(true);
    const result = await WorkingPlanAPI.PlanOfficeByMonth(
      _year || filter.year,
      _month || filter.month,
      indexTab,
    );
    if (result.statusId == 200) {
      await setDataPlan(result.data);
      await setDataDetailByDay([]);
    }
    await setLoading(false);
  };
  const GetDetailByDay = async itemDay => {
    await setItemDayMain(itemDay);
    await WorkingPlanAPI.PlanOfficeDetailByDay(itemDay, async mData => {
      await setDataDetailByDay(mData);
    });
  };
  // Handler
  const handlerChangeMonth = async (month, year) => {
    await setFilter({ year: year, month: month });
    await LoadData(year, month);
  };
  useEffect(() => {
    LoadData();
  }, []);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    headerContainer: { zIndex: 30, elevation: 30 },
    contentMain: { flex: 1, zIndex: 1 },
    detailView: { marginTop: 16 },
  });

  const renderTab = item => {
    // Plan
    if (item.tabId == 1)
      return (
        <CustomListView
          data={['']}
          containerStyle={{ padding: 8 }}
          ListHeader={
            <CalendarView
              dataPlanMonth={dataPlan}
              changeMonth={handlerChangeMonth}
              onDetailDay={GetDetailByDay}
            />
          }
          renderItem={() => {
            return (
              <View style={styles.detailView}>
                <PlanDetailByDay
                  dataDetails={dataDetailByDay}
                  itemDay={itemDayMain}
                  onCallBackData={GetDetailByDay}
                />
              </View>
            );
          }}
        />
      );
    // Team Plan
    if (item.tabId == 2) return <MyTeam filter={filter} />;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <HeaderCustom
          title={kpiinfo?.menuNameVN || 'Lịch làm việc'}
          leftFunc={() => navigation.goBack()}
        />
      </View>
      <View style={styles.contentMain}>
        <CustomTab
          data={[
            { tabId: 1, tabName: 'Lịch làm việc' },
            { tabId: 2, tabName: 'Thành viên' },
          ]}
          keyTabName="tabName"
          renderItem={renderTab}
        />
      </View>
    </View>
  );
};
