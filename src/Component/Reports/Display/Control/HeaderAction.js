import moment from 'moment';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import NativeCamera from '../../../../Control/NativeCamera';
import { Icon, Text } from '@rneui/themed';
import { optionConfirm } from '../../../../Core/Utility';
import { dataPhotoReport } from '../../../../Controller/PhotoController';
import { REPORT } from '../../../../API/ReportAPI';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { groupDataByKey, UUIDGenerator } from '../../../../Core/Helper';
import { PhotoGallery } from './PhotoGallery';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { ACTION } from '../../../../Redux/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HeaderAction = forwardRef((props, _ref) => {
  const insets = useSafeAreaInsets();
  const {
    item,
    keyGroup,
    keyValue,
    keyName,
    isNote = false,
    isCapture = true,
    handlerNote,
    isShow = true,
    isEdit,
  } = props;
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const dispatch = useDispatch();
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
  const onShowPhoto = () => {
    dataPhoto !== null &&
      dataPhoto.length > 0 &&
      SheetManager.show(`photodisplay_${keyValue}`);
  };
  const onActionNote = () => {
    handlerNote && handlerNote(item);
  };
  const onActionCamera = async () => {
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
    dispatch({ type: ACTION.ACTIVE_CAMERA, activeCamera: true });
    await NativeCamera.cameraStart(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
      dispatch({ type: ACTION.ACTIVE_CAMERA, activeCamera: false });
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
      'RELOAD_PHOTO_DISPLAY',
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
      flexDirection: 'row',
      position: 'absolute',
      end: 8,
      alignSelf: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    cameraView: {
      minWidth: 60,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
      borderRadius: 50,
      marginStart: 8,
      zIndex: 5,
    },
    badgeLengthView: {
      backgroundColor: appcolor.light,
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

  if (!isShow) return <View />;
  return (
    <View key={`${keyGroup}_${keyValue}`} style={styles.mainContainer}>
      {isCapture && (
        <TouchableOpacity style={styles.cameraView} onPress={onActionCamera}>
          <SpiralIcon
            type="ionicon"
            name="camera"
            size={24}
            color={appcolor.primary}
          />
        </TouchableOpacity>
      )}
      {isCapture && (
        <TouchableOpacity style={styles.cameraView} onPress={onShowPhoto}>
          <SpiralIcon
            type="ionicon"
            name="images"
            size={20}
            color={appcolor.primary}
          />
          <View style={styles.badgeLengthView}>
            <Text style={styles.titleBadge}>{dataPhoto.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {isNote && (
        <TouchableOpacity style={styles.cameraView} onPress={onActionNote}>
          <SpiralIcon
            type="ionicon"
            name="chatbubble"
            size={20}
            color={appcolor.primary}
          />
        </TouchableOpacity>
      )}
      <ActionSheet
        id={`photodisplay_${keyValue}`}
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <PhotoGallery data={dataPhoto} keyValue={keyValue} />
      </ActionSheet>
    </View>
  );
});
