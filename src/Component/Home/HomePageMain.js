import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  BackHandler,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_SESSION_EXPIRED_EVENT } from '../../Core/Helper';
import {
  AppNameBuild,
  aquaApp,
  cuckooApp,
  dsmHvnApp,
  honorApp,
  lgApp,
  officeApp,
  psvApp,
  signifyApp,
} from '../../Core/URLs';
import { Employee } from '../../Controller/EmployeeController';
import { optionConfirm } from '../../Core/Utility';
import { SET_EmployeeInfo } from '../../Redux/action';
import SyncData from '../../Control/SyncData/SyncData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
//
import HomeLG from './LG/HomeLG';
import HomeHonor from './Honor/HomeHonor';
import HomeCuckoo from './Cuckoo/HomeCuckoo';
import HomeOffice from './Office/HomeOffice';
import HomeSignify from './Signify/HomeSignify';
import HomePSV from './PSV/HomePSV';
import { Home } from '../Home';
import { HomeAqua } from '../Aqua/HomeAqua';

const HomePageMain = ({ navigation, route }) => {
  const { employeeInfo, appcolor } = useSelector(state => state.GAppState);
  const [isReloadData, setReloadData] = useState(null);
  const syncRef = useRef();
  const dispatch = useDispatch();
  const onBackHandler = async () => false;

  // Handler
  const handlerLoadData = async () => {
    setReloadData(e => !e);
    await AsyncStorage.setItem('LastSyncData', moment().format('YYYYMMDD'));
  };
  const validDataEmployeeInfo = React.useCallback(async () => {
    const onActionUpdate = () => {
      navigation.navigate('Profile');
    };
    await Employee.validData_EmployeeInfo(async (statusId, message) => {
      const _valueRequired =
        statusId === 500 && message !== null && message.length > 0;
      const currentRequired = employeeInfo?.requiredData;
      if (currentRequired !== _valueRequired) {
        dispatch(
          SET_EmployeeInfo({ ...employeeInfo, requiredData: _valueRequired }),
        );
      }
      if (message !== null && message.length > 0) {
        const options =
          statusId === 500
            ? [{ text: 'Cập nhật ngay', onPress: onActionUpdate }]
            : [{ text: 'Bỏ qua' }, { text: 'Đồng ý', onPress: onActionUpdate }];
        optionConfirm('Thông báo', message, options);
      }
    });
  }, [dispatch, employeeInfo]);
  // Effect
  useEffect(() => {
    const back_handler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackHandler,
    );
    const valid_employee = DeviceEventEmitter.addListener(
      'REVALID_EMPLOYEEINFO',
      validDataEmployeeInfo,
    );
    const auth_expired = DeviceEventEmitter.addListener(
      AUTH_SESSION_EXPIRED_EVENT,
      () => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      },
    );
    validDataEmployeeInfo();
    return () => {
      auth_expired.remove();
      valid_employee.remove();
      back_handler.remove();
    };
  }, []);
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
  });
  // Page View
  const componentMap = {
    [aquaApp]: HomeAqua,
    [honorApp]: HomeHonor,
    [lgApp]: HomeLG,
    [cuckooApp]: HomeCuckoo,
    [officeApp]: HomeOffice,
    [dsmHvnApp]: HomeOffice,
    [signifyApp]: HomeSignify,
    [psvApp]: HomePSV,
  };
  const SelectedComponent = componentMap[AppNameBuild] || Home;
  return (
    <View style={styles.mainContainer}>
      <SyncData ref={syncRef} onCompleted={handlerLoadData} />
      <SelectedComponent
        key={AppNameBuild}
        isReloadData={isReloadData}
        navigation={navigation}
        route={route}
      />
    </View>
  );
};

export default HomePageMain;
