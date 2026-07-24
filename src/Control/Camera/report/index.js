import React, { useState, useEffect } from 'react';
import PreviewAction from '../PreviewAction';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceEventEmitter } from 'react-native';
import CameraReportAction from '../CameraReportAction';
import { alertNotify, TODAY } from '../../../Core/Utility';
import _ from 'lodash';
import moment from 'moment';
import { InsertPhotosItem } from '../../../Controller/PhotoController';
import { SetShopInfo } from '../../../Redux/action';
import { UpdateShopInfo } from '../../../Controller/ShopController';

const CameraReportPage = ({ callBackData, templateInfo }) => {
  const { shopinfo, workinfo } = useSelector(state => state.GAppState);
  const { cameraReportInfo } = useSelector(state => state.camera);
  const { locationInfo } = useSelector(state => state.location);
  const [isLoading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [isResetCamera, _setResetCamera] = useState(false);
  const dispatch = useDispatch();
  //
  const handlerSavePhoto = async uri => {
    await setLoading(true);
    const info = JSON.parse(templateInfo || '{}');
    const photoinfo = {
      shopId: info.shopId,
      shopCode: info.shopCode,
      shopLat: info.latitude,
      shopLong: info.longitude,
      photoDate: TODAY,
      photoType: info.photoType,
      photoTime: parseInt(moment().format('YYYYMMDDHHmmss')),
      photoFullTime: moment().format('YYYY/MM/DD HH:mm:ss'),
      photoPath: uri,
      reportId: info.reportId,
      guid: info.guid,
      latitude: locationInfo.latitude,
      longitude: locationInfo.longitude,
      accuracy: locationInfo.accuracy,
      photoDesc: info.photoDesc,
      fileUpload: 0,
      dataUpload: 0,
      workStatus: workinfo.workStatus,
      dataLocation: JSON.stringify(locationInfo),
    };
    await InsertPhotosItem(photoinfo);
    let eventDevice;
    switch (info.reportId) {
      case -1:
        const udpate_shopinfo = { ...shopinfo, imageUrl: uri };
        dispatch(SetShopInfo(udpate_shopinfo));
        await UpdateShopInfo(udpate_shopinfo);
        eventDevice = 'RELOAD_PHOTO_OVERVIEW';
        DeviceEventEmitter.emit('RELOAD_DATA_SHOP');
        break;
      default:
        eventDevice = 'RELOAD_PHOTO_REPORT';
        break;
    }
    DeviceEventEmitter.emit(eventDevice);
    callBackData();
    await setLoading(false);
  };
  const handlerPreviewPicture = uri => {
    setPhotoUri(uri);
  };
  const handlerReject = () => {
    setPhotoUri(null);
  };
  const handlerCloseCamera = message => {
    message && alertNotify(message);
    callBackData();
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    return () => {
      isMounted = false;
    };
  }, [cameraReportInfo]);

  // View
  if (photoUri)
    return (
      <PreviewAction
        isLoading={isLoading}
        photoUri={photoUri}
        onSuccess={handlerSavePhoto}
        onReject={handlerReject}
      />
    );
  //
  return (
    <CameraReportAction
      hasPermission
      isResetCamera={isResetCamera}
      onPreview={handlerPreviewPicture}
      onClose={handlerCloseCamera}
    />
  );
};
export default CameraReportPage;
