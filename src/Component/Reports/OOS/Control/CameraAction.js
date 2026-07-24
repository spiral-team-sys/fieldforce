import moment from 'moment';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import NativeCamera from '../../../../Control/NativeCamera';
import { Icon, Text } from '@rneui/themed';
import { dataPhotoReport } from '../../../../Controller/PhotoController';
import { REPORT } from '../../../../API/ReportAPI';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { groupDataByKey, UUIDGenerator } from '../../../../Core/Helper';
import { PhotoGallery } from './PhotoGallery';
import { optionConfirm } from '../../../../Core/Utility';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CameraAction = forwardRef((props, _ref) => {
  const insets = useSafeAreaInsets();
  const { enable = false, keyGroup, keyValue, keyName } = props;
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  //
  const LoadData = async () => {
    try {
      const photos = await dataPhotoReport(
        shopinfo,
        kpiinfo.id,
        `${keyGroup}_${keyValue}`,
      );
      if (photos !== null && photos.length > 0) {
        const { arr } = await groupDataByKey({
          arr: photos,
          key: 'photoType',
        });
        setDataPhoto(arr);
      } else {
        setDataPhoto([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  // Handler
  const onActionCamera = () => {
    const options = [
      { text: 'Đóng' },
      { text: 'Chụp hình', onPress: handlerCameraAction },
      { text: 'Thư viện', onPress: handlerGalleryAction },
    ];
    optionConfirm('', `Hình ảnh ${keyName || ''}`, options);
  };
  const onShowPhoto = () => {
    dataPhoto !== null &&
      dataPhoto.length > 0 &&
      SheetManager.show(`photooos_${keyValue}`);
  };
  const handlerCameraAction = async () => {
    const _guid = UUIDGenerator();
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoDate: shopinfo.auditDate,
      photoTime: new Date().getTime(),
      photoType: `${keyGroup}_${keyValue}`,
      photoDesc: keyName,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: _guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const handlerGalleryAction = async () => {
    const _guid = UUIDGenerator();
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoDate: shopinfo.auditDate,
      photoTime: new Date().getTime(),
      photoType: `${keyGroup}_${keyValue}`,
      photoDesc: keyName,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: _guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const actionCallBackResult = async (_photoInfo, result) => {
    if (result.statusId == 200) {
      await REPORT.UploadFilePhoto(async () => {
        await LoadData();
      });
    }
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    const _reloadPhoto = DeviceEventEmitter.addListener(
      'RELOAD_PHOTO_OOS',
      LoadData,
    );
    return () => {
      isMounted = false;
      _reloadPhoto.remove();
    };
  }, [keyGroup, keyValue]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: 100,
      flexDirection: 'row',
      alignSelf: 'center',
      justifyContent: 'center',
      zIndex: 100,
      marginEnd: 10,
    },
    cameraView: {
      width: 50,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
      marginEnd: 0,
    },
    badgeLengthView: {
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 0 },
      shadowOpacity: 0.3,
      elevation: 3,
      paddingHorizontal: 5,
      borderRadius: 20,
      position: 'absolute',
      top: -5,
      end: 0,
    },
    titleBadge: {
      color: appcolor.dark,
      padding: 3,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
  });
  return enable ? (
    <View key={`${keyGroup}_${keyValue}`} style={styles.mainContainer}>
      <TouchableOpacity style={styles.cameraView} onPress={onShowPhoto}>
        <SpiralIcon
          type="ionicon"
          name="images"
          size={21}
          color={appcolor.greylight}
        />
        <View style={styles.badgeLengthView}>
          <Text style={styles.titleBadge}>{dataPhoto.length}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cameraView} onPress={onActionCamera}>
        <SpiralIcon
          type="ionicon"
          name="camera"
          size={24}
          color={appcolor.greylight}
        />
      </TouchableOpacity>
      <ActionSheet
        id={`photooos_${keyValue}`}
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <PhotoGallery data={dataPhoto} keyValue={keyValue} />
      </ActionSheet>
    </View>
  ) : (
    <View style={styles.mainContainer} />
  );
});
