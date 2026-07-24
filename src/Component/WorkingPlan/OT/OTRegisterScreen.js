import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { getMasterlist } from '../../../Controller/MasterController';
import { GetPhotosList, GetTimeOT } from '../../../Controller/PhotoController';
import { AttendantController } from '../../../Controller/AttendantController';
import { MessageInfo, ToastError } from '../../../Core/Helper';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import OTRegisterForm from './Register/OTRegisterForm';

const OTRegisterScreen = ({ navigation, route }) => {
  const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(true);
  const [masterOT, setMasterOT] = useState([]);
  const [dataOTSummary, setDataOTSummary] = useState([]);
  const [message, setMessage] = useState(null);
  const [registeredTime, setRegisteredTime] = useState(null);

  const workDate = shopinfo?.auditDate || workinfo?.workDate;
  const shopData = { ...shopinfo, auditDate: workDate };

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    setRegisteredTime(null);

    try {
      if (!shopinfo?.shopId || !workDate) {
        setMessage('Không tìm thấy thông tin cửa hàng để đăng ký tăng ca.');
        return;
      }

      const checkInList = await GetPhotosList(shopinfo.shopId, workDate, 1);
      if (checkInList.length === 0) {
        const text = 'Bạn chưa check in, chưa thể đăng ký tăng ca được.';
        setMessage(text);
        MessageInfo(text);
        handleClose();
        return;
      }

      const masterList = await getMasterlist('OT');
      setMasterOT(masterList);

      await AttendantController.GetOTSummary(
        shopinfo.shopId,
        async dataSummary => {
          setDataOTSummary(dataSummary);
        },
      );

      const registeredOT = await GetTimeOT(shopinfo.shopId, workDate, '1');
      const timeOT = registeredOT?.[0]?.timeOT;
      if (timeOT !== undefined && timeOT !== null) {
        setRegisteredTime(timeOT);
      }
    } catch (error) {
      ToastError('Không tải được dữ liệu đăng ký tăng ca.', 'Tăng ca', 'top');
      setMessage('Không tải được dữ liệu đăng ký tăng ca.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, backgroundColor: appcolor.light },
    message: {
      padding: 16,
      color: appcolor.dark,
      fontSize: 14,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={
          route?.params?.titlePage || kpiinfo?.menuNameVN || 'Đăng ký tăng ca'
        }
        leftFunc={() => navigation.goBack()}
      />
      <View style={styles.contentContainer}>
        <LoadingView isLoading={loading} title="Đang tải dữ liệu" />
        {!loading && message !== null && (
          <Text style={styles.message}>{message}</Text>
        )}
        {!loading && message === null && (
          <OTRegisterForm
            dataOTSummary={dataOTSummary}
            masterOT={masterOT}
            shopinfo={shopData}
            initialRegisteredTime={registeredTime}
            onClose={handleClose}
          />
        )}
      </View>
    </View>
  );
};

export default OTRegisterScreen;
