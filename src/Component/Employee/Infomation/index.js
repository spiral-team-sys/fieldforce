import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeAPI } from '../../../API/EmployeeAPI';
import { ScreenEmployeeInfo } from './Page/ScreenEmployeeInfo';
import { ButtonAction } from './Control/ButtonAction';
import LinearGradient from 'react-native-linear-gradient';
import { deviceHeight } from '../../../Themes/AppsStyle';
import { ToastError, ToastSuccess } from '../../../Core/Helper';
import moment from 'moment';
import { insets, optionConfirm } from '../../../Core/Utility';
import dvhcvn from '../../../Themes/filedata/dvhcvn.json';
import dvhc2025 from '../../../Themes/filedata/dvhc2025.json';
import { FloatActionButton } from './Control/FloatActionButton';
import {
  SET_EmployeeInfo,
  SET_MasterData,
  SET_RegionData,
  SetUserInfo,
} from '../../../Redux/action';
import _ from 'lodash';
import CustomListView from '../../../Control/Custom/CustomListView';

export const EmployeeInfo = ({ navigation }) => {
  const { appcolor, userinfo, employeeInfo } = useSelector(
    state => state.GAppState,
  );
  const [isLoading, setLoading] = useState(false);
  const [configPage, setConfigPage] = useState({});
  const [configMaternity, setConfigMaternity] = useState({});
  const [menu, setMenu] = useState({
    isOpenCamera: false,
    isOpen: false,
    type: null,
    title: null,
  });
  const [_mutate, setMutate] = useState(false);
  const dispatch = useDispatch();
  //
  const LoadData = async () => {
    await setLoading(true);
    await EmployeeAPI.getDataEmployeeInfo(
      async (mEmployee, mMasterData, mConfigPage, messager) => {
        messager && ToastError(messager);
        await asyncUserNewInfo(mEmployee);
        await setConfigPage(
          JSON.parse(mConfigPage.configResign || '{}')[0] || {},
        );
        await setConfigMaternity(
          JSON.parse(mConfigPage.configMaternity || '{}')[0] || {},
        );
        await dispatch(SET_EmployeeInfo(mEmployee));
        await dispatch(
          SET_MasterData(JSON.parse(mMasterData.masterList || '[]')),
        );
        await dispatch(
          SET_RegionData(
            JSON.parse(
              JSON.stringify(
                (mConfigPage.isUseRegionLocal == 1
                  ? dvhc2025.data
                  : dvhcvn.data) || [],
              ),
            ),
          ),
        );
      },
    );
    await setLoading(false);
  };

  const asyncUserNewInfo = async mEmployee => {
    const newInfo = {
      ...userinfo,
      employeeCode: mEmployee.employeeCode,
      employeeName: mEmployee.fullName,
      address: mEmployee.address,
      loginName: mEmployee.username,
      photo: mEmployee.photo,
    };
    await dispatch(SetUserInfo(newInfo));
  };

  // Handler
  const handlerGoBack = async () => {
    DeviceEventEmitter.emit('REVALID_EMPLOYEEINFO');
    navigation.goBack();
  };
  const onGetInformation = async data => {
    const arrayInfo = data.split('|');
    const info = {
      ...employeeInfo,
      identityCardNumber: arrayInfo[0],
      identityCardNumberOld: arrayInfo[1],
      identityCardDate: moment(arrayInfo[6], 'DDMMYYYY').format('DD/MM/YYYY'),
      fullName: arrayInfo[2],
      birthday: moment(arrayInfo[3], 'DDMMYYYY').format('DD/MM/YYYY'),
      gender: arrayInfo[4],
      permanentAddress: arrayInfo[5],
    };
    //
    const options = [
      { text: 'Bỏ qua' },
      {
        text: 'Cập nhật',
        onPress: async () => {
          await EmployeeAPI.saveDataEmployeeInfo(
            info,
            async (statusId, message) => {
              statusId == 200
                ? ToastSuccess(message, 'Thông báo', 'top')
                : ToastError(message, 'Lỗi dữ liệu', 'top');
            },
          );
          await LoadData();
        },
      },
    ];
    optionConfirm('Cập nhật dữ liệu', data, options);
  };
  const onActionMenuFAB = async () => {
    setMenu(current => ({ ...current, isOpen: !current.isOpen }));
  };
  const handlerChangeFAB = async type => {
    switch (type) {
      case 'QRCODE':
        navigation.navigate('qrcode', { onSuccess: onGetInformation });
        break;
      case 'RESIGN':
        navigation.navigate('employeeresigns');
        break;
      case 'MATERNITY':
        navigation.navigate('employeematernityleave', {
          employeeInfo: userinfo,
          minDateResign: configMaternity.minDateMaternity,
          selectPastDate: configMaternity.selectPastDate,
          resignLetterSample: configMaternity.maternityLetterSample,
          isCheckFile: configMaternity.isCheckFile || 1,
          resignConfirmNote: configMaternity.resignConfirmNote,
          reasonMaternityDefault: configMaternity.reasonMaternityDefault,
          maxMonthResign: configMaternity.maxMonthResign,
        });
        break;
    }
    setMenu(current => ({ ...current, isOpen: false }));
  };
  //
  useEffect(() => {
    const reload_employee = DeviceEventEmitter.addListener(
      'RELOAD_EMPLOYEE',
      LoadData,
    );
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
      reload_employee.remove();
    };
  }, []);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.primary,
      paddingTop: insets().top,
    },
    headMain: { width: '100%', height: '15%' },
    viewHeadMain: { width: '100%', height: '100%' },
    contentMain: { width: '100%', height: '100%', marginTop: 32 },
    buttonCloseView: {
      position: 'absolute',
      top: 0,
      start: 8,
      zIndex: 1000,
      elevation: 1000,
    },
    gradientView: { width: '100%', height: '100%', zIndex: 0 },
    viewLoading: { position: 'absolute', top: 0, end: 0, start: 0, bottom: 0 },
    overflowView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundColor: appcolor.dark,
      opacity: 0.8,
      justifyContent: 'center',
      zIndex: 20,
      elevation: 20,
    },
    fabLayer: {
      position: 'absolute',
      top: 0,
      end: 0,
      bottom: 0,
      start: 0,
      zIndex: 100,
      elevation: 100,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 3 }}
        colors={[appcolor.primary, appcolor.light]}
        style={styles.gradientView}
      >
        <View style={styles.buttonCloseView}>
          <ButtonAction
            iconName="arrow-back"
            typeAction="CLOSE"
            onPress={handlerGoBack}
          />
        </View>
        {isLoading && (
          <ActivityIndicator
            color={appcolor.light}
            style={styles.viewLoading}
          />
        )}
        {/* // Content Info */}
        {!isLoading && (
          <CustomListView
            data={['']}
            renderItem={() => (
              <ScreenEmployeeInfo
                key={`itemEmployeeInfo`}
                navigation={navigation}
              />
            )}
            onRefresh={LoadData}
            bottomView={{ paddingBottom: 32 }}
          />
        )}
        {menu.isOpen ? (
          <View pointerEvents="none" style={styles.overflowView} />
        ) : (
          <View />
        )}
        <View pointerEvents="box-none" style={styles.fabLayer}>
          <FloatActionButton
            info={menu}
            showMenu={onActionMenuFAB}
            handlerChange={handlerChangeFAB}
            configPage={configPage}
            configMaternity={configMaternity}
          />
        </View>
      </LinearGradient>
    </View>
  );
};
