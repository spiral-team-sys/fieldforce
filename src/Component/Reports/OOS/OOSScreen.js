import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { alertConfirm, alertWarning } from '../../../Core/Utility';
import { REPORT } from '../../../API/ReportAPI';
import { ToastError, ToastSuccess } from '../../../Core/Helper';
import {
  checkRawReport,
  getDataPhotoByReport,
  removeRawReport,
} from '../../../Controller/ReportController';
import { LoadingView } from '../../../Control/ItemLoading';
import { ScreenProductOOS } from './Page/ScreenProductOOS';
import { ScreenWareType } from './Page/ScreenWareType';
import _ from 'lodash';

const OOSScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isUploading, setUploading] = useState(false);
  const [isActionType, setActionType] = useState(false);
  //
  const UploadData = async () => {
    const _valid = await onValidData();
    if (!_valid) return;
    alertConfirm(
      'Gửi dữ liệu',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await setUploading(true);
        const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
        if (result.statusId == 200) {
          await removeRawReport(shopinfo.shopId, kpiinfo.id);
          ToastSuccess(result.messager, 'Thông báo', 'top');
        } else {
          ToastError(result.messager, 'Lỗi dữ liệu', 'top');
        }
        await setUploading(false);
      },
    );
  };
  // Handler
  const onValidData = async () => {
    const itemData = await checkRawReport(shopinfo.shopId, kpiinfo.id);
    const dataUpload = JSON.parse(itemData.data[0]?.jsonData || '[]');
    const _isData = _.filter(
      dataUpload,
      e => e.OOS !== undefined && e.OOS !== null,
    );
    //
    if (_isData == null || _isData.length == 0) {
      ToastError(
        'Vui lòng nhập dữ liệu đầy đủ trước khi gửi dữ liệu lên hệ thống',
        'Dữ liệu trống',
        'top',
      );
      return false;
    } else {
      const photoReport = await getDataPhotoByReport(
        kpiinfo.id,
        shopinfo.shopId,
      );
      const configPage = JSON.parse(kpiinfo.reportItem || '{}');
      let strError = '';
      for (let index = 0; index < _isData.length; index++) {
        const e = _isData[index];
        if (e.OOS == 1) {
          const _photoType = `${e[configPage.keyGroupName]}_${e.ProductId}`;
          const _checkPhoto = _.filter(
            photoReport,
            it => it.photoType == _photoType,
          );
          if (_checkPhoto.length < (e.photoLimit || 0)) {
            strError += `Chụp hình sản phẩm ${e.ProductName} (${
              _checkPhoto.length
            }/${e.photoLimit || 0})\n`;
          }
        }
      }
      if (strError !== null && strError.length > 0) {
        alertWarning(strError);
        return false;
      }
    }
    return true;
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentMain: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    opacityView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 2,
      top: 0,
      backgroundColor: appcolor.light,
      opacity: 0.8,
    },
    loadingView: {
      width: '100%',
      height: '90%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={onBack}
        rightFunc={UploadData}
      />
      {/* // Product Field */}
      <View style={styles.contentMain}>
        {/* // Action Loading */}
        {isUploading && <View style={styles.opacityView} />}
        <LoadingView
          isLoading={isUploading}
          title="Đang gửi dữ liệu lên hệ thống"
          styles={styles.loadingView}
        />
        <ScreenWareType key={`warehouse-oos`} actionType={setActionType} />
        <ScreenProductOOS key={`product-oos`} isActionType={isActionType} />
      </View>
    </View>
  );
};
export default OOSScreen;
