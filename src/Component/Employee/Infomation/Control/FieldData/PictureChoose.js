import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Image, Text } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonAction } from '../ButtonAction';
import NativeCamera from '../../../../../Control/NativeCamera';
import moment from 'moment';
import { TODAY, deviceHeight } from '../../../../../Core/Utility';
import { MultipleShowImage } from '../../../../../Control/MultipleShowImage';
import { deviceWidth } from '../../../../../Themes/AppsStyle';
import { Employee } from '../../../../../Controller/EmployeeController';
import { REPORT } from '../../../../../API/ReportAPI';
import { URLDEFAULT } from '../../../../../Core/URLs';
import { deletePhotoByList } from '../../../../../Controller/PhotoController';
import _ from 'lodash';
import { SET_EmployeeInfo } from '../../../../../Redux/action';
import { UUIDGenerator } from '../../../../../Core/Helper';

export const PictureChoose = ({ itemMain, keyValue }) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [isRemoveImage, setRemoveImage] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const dispatch = useDispatch();
  //
  const LoadData = async resultData => {
    const _photoList = await Employee.GetPhotosProfile(TODAY, keyValue, true);
    let _photoUpdate = [];
    if (_photoList !== null && _photoList.length > 0) {
      for (let index = 0; index < _photoList.length; index++) {
        const info = _photoList[index];
        const fileName = info.photoPath.substring(
          info.photoPath.lastIndexOf('/') + 1,
          info.photoPath.length || 0,
        );
        const itemUpload = {
          ...info,
          photoPath: `/uploaded/${info.photoDate}/${fileName}`,
        };
        _photoUpdate.push(itemUpload);
      }
    }
    await setDataPhoto(_photoUpdate);
    resultData && (await resultData(_photoUpdate));
  };
  // Handler
  const handlerCameraAction = async () => {
    const photoinfo = {
      shopId: employeeInfo.employeeId,
      shopCode: employeeInfo.employeeCode,
      reportId: 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: keyValue,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: UUIDGenerator(),
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const handlerGalleryAction = async () => {
    const photoinfo = {
      shopId: employeeInfo.employeeId,
      shopCode: employeeInfo.employeeCode,
      reportId: 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: keyValue,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: UUIDGenerator(),
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const actionCallBackResult = async (photoInfo, result) => {
    if (result.statusId == 200) {
      await REPORT.UploadFilePhoto(async () => {
        await handlerUpdateData(photoInfo, result.data);
        await LoadData();
      });
    }
  };
  const handlerUpdateData = async (photoInfo, dataResult) => {
    // Data Upload File & Data
    let dataUpload = [];
    if (dataResult !== null && dataResult.length > 0) {
      for (let index = 0; index < dataResult.length; index++) {
        const info = dataResult[index];
        const itemUpload = {
          ...photoInfo,
          photoPath: `/uploaded/${photoInfo.photoDate}/${info.fileName}`,
        };
        dataUpload.push(itemUpload);
      }
    }
    //
    const mergeList = _.unionWith(dataUpload, dataPhoto, _.isEqual);
    employeeInfo[keyValue] = JSON.stringify(mergeList);
    await dispatch(SET_EmployeeInfo(employeeInfo));
  };
  const handlerShowImage = index => {
    itemShowImage.visible = true;
    itemShowImage.photos = dataPhoto;
    itemShowImage.index = index;
    setMutate(e => !e);
  };
  const handlerCloseShowImage = () => {
    itemShowImage.visible = false;
    itemShowImage.photos = [];
    itemShowImage.index = 0;
    setMutate(e => !e);
  };
  //
  const startRemoveImage = () => {
    setRemoveImage(true);
  };
  const closeActionRemove = () => {
    setRemoveImage(false);
  };
  const onRemoveAction = async item => {
    await deletePhotoByList([item]);
    await LoadData(async mDataResult => {
      employeeInfo[keyValue] = JSON.stringify(mDataResult);
      await dispatch(SET_EmployeeInfo(employeeInfo));
      //
      if (mDataResult == null || mDataResult.length == 0) setRemoveImage(false);
    });
  };
  //
  useEffect(() => {
    const _loadPhoto = LoadData();
    return () => _loadPhoto;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginVertical: 5 },
    contentValue: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      padding: 3,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    itemMain: {
      minWidth: deviceWidth / 2.5,
      height: deviceHeight / 7.5,
      margin: 8,
      marginEnd: 1,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: appcolor.grayLight,
      overflow: 'hidden',
    },
    itemHeaderMain: { minWidth: 20 },
    actionRemoveView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      end: 0,
      start: 0,
      zIndex: 100,
      justifyContent: 'center',
    },
    viewOpacityRemove: {
      backgroundColor: 'black',
      position: 'absolute',
      top: 0,
      bottom: 0,
      end: 0,
      start: 0,
      opacity: 0.5,
    },
  });
  const renderHeader = () => {
    return (
      <View style={styles.itemHeaderMain}>
        {!isRemoveImage && (
          <ButtonAction
            iconName="camera"
            iconSize={24}
            sizeView={46}
            onPress={handlerCameraAction}
          />
        )}
        {!isRemoveImage && (
          <ButtonAction
            iconName="images"
            iconSize={24}
            sizeView={46}
            onPress={handlerGalleryAction}
          />
        )}
        {isRemoveImage && (
          <ButtonAction
            iconName="close"
            iconSize={24}
            sizeView={46}
            onPress={closeActionRemove}
          />
        )}
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      isRemoveImage ? onRemoveAction(item) : handlerShowImage(index);
    };
    return (
      <View key={`it_ptl_${index}`} style={styles.itemMain}>
        <Image
          source={{ uri: `${URLDEFAULT}${item.photoPath}` }}
          style={{ width: deviceWidth / 2.5, height: deviceHeight / 7.5 }}
          resizeMode="cover"
          resizeMethod="resize"
          onPress={onPress}
          onLongPress={startRemoveImage}
        />
        {isRemoveImage && (
          <TouchableOpacity style={styles.actionRemoveView} onPress={onPress}>
            <View style={styles.viewOpacityRemove} />
            <SpiralIcon
              type="ionicon"
              name="trash-bin"
              color={appcolor.red}
              size={28}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentValue}>
        {renderHeader()}
        <FlashList
          horizontal
          key={`photolist_${keyValue}`}
          keyExtractor={(_item, index) => index.toString()}
          estimatedItemSize={50}
          data={dataPhoto}
          extraData={[isRemoveImage, dataPhoto]}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={<View style={{ paddingEnd: deviceWidth / 5 }} />}
        />
      </View>
      <Modal visible={itemShowImage.visible}>
        <MultipleShowImage
          key="showprofileimage"
          listItem={itemShowImage.photos || []}
          closeShowImage={handlerCloseShowImage}
          indexItem={itemShowImage.index}
        />
      </Modal>
    </View>
  );
};
