import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Image } from '@rneui/themed';
import { deletePhotoByList } from '../../../Controller/PhotoController';
import { TODAY, deviceHeight, deviceWidth } from '../../../Core/Utility';
import { ButtonAction } from './ButtonAction';
import NativeCamera from '../../../Control/NativeCamera';
import moment from 'moment';
import _ from 'lodash';
import { MultipleShowImage } from '../../../Control/MultipleShowImage';
import { GetPhotosIssue } from '../../../Controller/IssueController';
import { URLDEFAULT } from '../../../Core/URLs';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const PhotoList = ({ typeMain, itemIssue, callBackData }) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [isRemoveImage, setRemoveImage] = useState(false);
  const [dataImageRemove, setDataImageRemove] = useState([]);
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    const _photoList = await GetPhotosIssue(
      shopinfo.shopId || itemIssue.shopId,
      TODAY,
      kpiinfo.id,
      itemIssue.guid,
      typeMain == 'UPDATE',
    );
    switch (typeMain) {
      case 'PLUS':
        await setDataPhoto(_photoList);
        await callBackData(_photoList);
        break;
      case 'UPDATE':
        const mergeList = _.unionWith(
          _photoList,
          itemIssue.imageIssueList,
          _.isEqual,
        );
        await setDataPhoto(mergeList);
        await callBackData(mergeList);
        break;
    }
  };
  // Handler
  const onCameraAction = async () => {
    const photoinfo = {
      shopId: shopinfo.shopId || itemIssue.shopId,
      shopCode: shopinfo.shopCode || '',
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_REPORT',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: itemIssue.guid,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, actionCallBackResult);
  };
  const onGalleryAction = async () => {
    const photoinfo = {
      shopId: shopinfo.shopId || itemIssue.shopId,
      shopCode: shopinfo.shopCode || '',
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_REPORT',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: itemIssue.guid,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, actionCallBackResult);
  };
  const onRemoveAction = async () => {
    if (dataImageRemove !== null && dataImageRemove.length > 0) {
      await deletePhotoByList(dataImageRemove);
      await LoadData();
    }
    setRemoveImage(false);
    setDataImageRemove([]);
  };
  const actionCallBackResult = () => {
    LoadData();
  };
  const startRemoveImage = item => {
    handlerChooseImage(item);
    setRemoveImage(true);
  };
  const handlerChooseImage = item => {
    const valueDelete = !(item.isDelete || false);
    item.isDelete = valueDelete;
    if (valueDelete) dataImageRemove.push(item);
    else _.pullAll(dataImageRemove, [item]);
    if (dataImageRemove == null || dataImageRemove.length == 0)
      setRemoveImage(false);
    setMutate(e => !e);
  };
  const handlerShowImage = index => {
    itemShowImage.visible = true;
    itemShowImage.index = index;
    itemShowImage.photos = dataPhoto;
    setMutate(e => !e);
  };
  const handlerHideImage = () => {
    itemShowImage.visible = false;
    itemShowImage.index = 0;
    itemShowImage.photos = [];
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [itemIssue]);

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    itemMain: {
      minWidth: deviceWidth / 2.5,
      margin: 8,
      marginEnd: 1,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: appcolor.grayLight,
      overflow: 'hidden',
    },
    titleView: {
      width: '100%',
      fontSize: 14,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      color: appcolor.dark,
      textAlign: 'center',
    },
    viewOptionCamera: { width: '100%', flexDirection: 'row' },
    iconRemoveView: {
      position: 'absolute',
      top: 0,
      end: 0,
      zIndex: 1000,
      padding: 8,
    },
    opacityView: {
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      opacity: 0.6,
      zIndex: 100,
      position: 'absolute',
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      isRemoveImage ? handlerChooseImage(item) : handlerShowImage(index);
    };
    const onLongPress = () => {
      startRemoveImage(item);
    };
    const photoPath =
      item.photoPath !== null && item?.photoPath?.indexOf('file://') > -1
        ? item.photoPath
        : `${URLDEFAULT}${item.photoPath}`;
    return (
      <TouchableOpacity
        key={`igi_${index}`}
        style={styles.itemMain}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {isRemoveImage && <View style={styles.opacityView} />}
        {isRemoveImage && (item.isDelete || false) && (
          <View style={styles.iconRemoveView}>
            <SpiralIcon
              type="ionicon"
              name="trash"
              size={21}
              color={appcolor.red}
            />
          </View>
        )}
        <Image
          source={{ uri: photoPath }}
          style={{ width: '100%', height: deviceHeight / 3.5 }}
          resizeMode="cover"
          resizeMethod="resize"
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewOptionCamera}>
        <ButtonAction
          type="CAMERA"
          title="Chụp hình"
          iconName="camera"
          handlerPress={onCameraAction}
        />
        <ButtonAction
          type="LIBRARY"
          title="Chọn từ thư viện"
          iconName="image"
          handlerPress={onGalleryAction}
        />
        {isRemoveImage && (
          <ButtonAction
            type="REMOVE_IMAGE"
            title={
              dataImageRemove.length > 0
                ? `Xóa ${dataImageRemove.length} hình`
                : `Hủy`
            }
            iconName="trash"
            handlerPress={onRemoveAction}
          />
        )}
      </View>
      <FlatList
        horizontal
        key="photoListIssue"
        keyExtractor={(_item, index) => index.toString()}
        data={dataPhoto}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
      <Modal visible={itemShowImage.visible}>
        <MultipleShowImage
          key="showissueimage"
          listItem={itemShowImage.photos || []}
          closeShowImage={handlerHideImage}
          indexItem={itemShowImage.index}
        />
      </Modal>
    </View>
  );
};
