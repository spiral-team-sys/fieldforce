import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { PLANAPI } from '../../../../API/PlanAPI';
import { ToastError } from '../../../../Core/Helper';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import WeekView from '../../Controls/Calendar/WeekView';
import ByDateList from './ByDateList';
import ByDateOff from './ByDateOff';

const RegisterByDateScreen = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [isRefreshData, setRefreshData] = useState(false);
  const [dataCalendar, setDataCalendar] = useState([]);
  const [dataPlanMain, setDataPlanMain] = useState([]);
  const [itemDateChoose, setItemDateChoose] = useState(null);

  const LoadData = async () => {
    setRefreshData(e => !e);
    await PLANAPI.GetDataCalendar('BYDATE', (mData, message) => {
      message && ToastError(message, 'Thông báo', 'top');
      setDataCalendar(mData);
    });
  };
  const UploadData = async () => {
    !isLoading && (await setLoading(true));
    // await PLANAPI.UploadData((isSuccess, message) => {
    //     message && ToastError(message, 'Thông báo', 'top')
    // })
    await setLoading(false);
  };
  //
  const onBack = () => {
    navigation.goBack();
  };
  const onChooseDay = async item => {
    setItemDateChoose(item);
    await PLANAPI.GetDataByDate(item.WorkingDay, (mData, message) => {
      message && ToastError(message, 'Thông báo', 'top');
      setDataPlanMain(mData);
    });
  };
  //
  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentMain: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentShopList: { width: '100%', height: '90%' },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={onBack}
        rightFunc={UploadData}
      />
      <View style={styles.contentMain}>
        <WeekView
          isRefreshData={isRefreshData}
          data={dataCalendar}
          onChooseDay={onChooseDay}
        />
        <View style={styles.contentShopList}>
          <ByDateOff item={itemDateChoose} />
          <ByDateList dataMain={dataPlanMain} />
        </View>
      </View>
    </View>
  );
};

export default RegisterByDateScreen;
