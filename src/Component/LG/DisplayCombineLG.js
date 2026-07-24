import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native';
import { _competitorName } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { DisplayShareLG } from './DisplayShareLG';
import { InstoreShareLG } from './InstoreShareLG';
import { useSelector } from 'react-redux';
import {
  getAllListTrackResLG,
  getAllListTrackUpload,
  getListDataTracking,
} from '../../Controller/TrackingDetailController';
import { checkNetwork } from '../../Core/Utility';
import { MessageAction, ToastError, ToastSuccess } from '../../Core/Helper';
import UploadController from '../../Controller/UploadController';
import { SceneMap } from 'react-native-tab-view';
import { TabForm } from '../../Control/TabForm';
import moment from 'moment';

export const DisplayCombineLG = ({ navigation, route }) => {
  const [Status, setStatus] = useState(false);
  const { workinfo, kpiinfo } = useSelector(state => state.GAppState);
  const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
  const [routes, setRoutes] = useState([
    { key: 'first', title: reportItem.title1 || 'Display Share' },
    { key: 'second', title: reportItem.title2 || 'Instore Share' },
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState({ isShow: false });

  const checkUploaded = async () => {
    const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
    const totalTrackingId = `${reportItem.DisplayShare},${reportItem.InstoreShare}`;
    let lstResDSUpload = await getAllListTrackUpload(workinfo, totalTrackingId);

    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setStatus(lstResDSUpload.length === 0 ? false : true);
    } else {
      await setStatus(true);
    }
  };
  useEffect(() => {
    var _Load;
    _Load = checkUploaded();
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        isKeyboardVisible.isShow = true;
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        isKeyboardVisible.isShow = false;
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      _Load;
    };
    return () => false;
  }, []);

  const uploadAction = async () => {
    Keyboard.dismiss();
    var count = 0;
    var str = '';
    const lstDisplayShare = await getListDataTracking(
      workinfo,
      reportItem.DisplayShare,
    );
    const lstInstoreShare = await getListDataTracking(
      workinfo,
      reportItem.InstoreShare,
    );
    const lstResDS = lstDisplayShare.filter(
      it =>
        (it.display !== null && it.display !== 'null') ||
        (it.price !== null && it.price !== 'null'),
    );
    const lstResIS = lstInstoreShare.filter(
      it =>
        (it.display !== null && it.display !== 'null') ||
        (it.price !== null && it.price !== 'null'),
    );

    if (lstResDS.length === 0) {
      count += 1;
      // resWar += 'Chưa làm báo cáo Display share. '
    }
    if (lstResIS.length === 0) {
      count += 1;
      // resWar += 'Chưa làm báo cáo Instore share.'
    } else if (lstResIS.length !== 0) {
      lstResIS.forEach(it => {
        if (
          (it.display === null || it.display === 'null') &&
          (it.price !== null || it.price !== 'null')
        ) {
          str == ''
            ? (str += `Báo cáo ${reportItem.title2 || 'Instore share'} loại : ${
                it.category_viVN
              } bạn nhập giá nhưng không nhập số lượng!`)
            : null;
        }
      });
    }
    if (count === 2) {
      ToastError(
        `Bạn chưa làm cả 2 báo cáo ${
          reportItem.title1 || 'Display Share'
        } và báo cáo ${reportItem.title2 || 'Instore Share'}`,
      );
      return;
    }
    if (str !== '') {
      ToastError(str);
      return;
    } else if (lstResDS.length < lstDisplayShare.length) {
      ToastError(
        `Bạn chưa hoàn thành báo cáo ${
          reportItem.title1 || 'Display Share'
        }, vui lòng nhập tất cả thông tin!`,
      );
      return;
    } else if (lstResIS.length < lstInstoreShare.length) {
      ToastError(
        `Bạn chưa hoàn thành báo cáo ${
          reportItem.title2 || 'Instore share'
        }, vui lòng nhập tất cả thông tin!`,
      );
      return;
    }

    MessageAction(
      'Bạn có muốn gửi báo cáo không ? (Sau khi gửi dữ liệu sẽ không thể điều chỉnh)',
      () => gotoActionUpload(),
    );
  };
  const gotoActionUpload = async () => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    UploadData();
  };
  const UploadData = async () => {
    const totalTrackingId = `${reportItem.DisplayShare},${reportItem.InstoreShare}`;
    await UploadController.DataReportShare(
      {
        ...workinfo,
        reportId: kpiinfo.kpiId,
        totalTrackingId: totalTrackingId,
      },
      async () => {
        await checkUploaded();
      },
    );
  };
  const renderScene = SceneMap({
    first: () => (
      <DisplayShareLG
        key={'formDisplayShare'}
        tabLabel={reportItem.title1 || 'Display Share'}
        route={route}
        combine={true}
        Status={Status}
      />
    ),
    second: () => (
      <InstoreShareLG
        key={'formInstoreShare'}
        tabLabel={reportItem.title2 || 'Instore Share'}
        route={route}
        combine={true}
        Status={Status}
      />
    ),
  });

  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        title={route.params.titlePage}
        leftFunc={() => navigation.goBack()}
        iconRight={!Status ? 'cloud-upload-alt' : 'check'}
        rightFunc={
          !Status
            ? () =>
                isKeyboardVisible.isShow ? Keyboard.dismiss() : uploadAction()
            : null
        }
      />
      {/* <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null} > */}
      {/* <Tab /> */}
      <TabForm
        initialPage={0}
        renderScene={renderScene}
        routes={routes}
        swipeEnabled={false}
      />
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};
