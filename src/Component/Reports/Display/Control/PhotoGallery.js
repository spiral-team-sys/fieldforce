import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { deviceHeight, optionConfirm } from '../../../../Core/Utility';
import { FlashList } from '@shopify/flash-list';
import { Icon, Image, Text } from '@rneui/themed';
import moment from 'moment';
import { MultipleShowImage } from '../../../../Control/MultipleShowImage';
import { SheetManager } from 'react-native-actions-sheet';
import { ButtonAction } from './ButtonAction';
import { deletePhotoByList } from '../../../../Controller/PhotoController';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const PhotoGallery = ({ data, keyValue }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [itemHead, setItemHead] = useState({});
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [isRemoveImage, setRemoveImage] = useState(false);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    if (data !== null && data.length > 0) {
      await setDataPhoto(data);
      await setItemHead(data[0] || {});
    } else {
      await setDataPhoto(data);
    }
    // onCloseView()
  };
  // Handler
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
  const onCloseView = () => {
    SheetManager.hide(`photodisplay_${keyValue}`);
  };
  const onDeletePhoto = () => {
    if (!isRemoveImage) {
      let options =
        dataPhoto.length > 1
          ? [
            { text: 'Đóng' },
            {
              text: 'Xóa từng tấm',
              onPress: () => {
                actionDeletePhoto('ONLY');
              },
            },
            {
              text: `Xóa tất cả ${dataPhoto.length} tấm`,
              onPress: () => {
                actionDeletePhoto('ALL');
              },
            },
          ]
          : [
            { text: 'Đóng' },
            {
              text: `Đồng ý`,
              onPress: () => {
                actionDeletePhoto('ALL');
              },
            },
          ];
      optionConfirm(
        'Thông báo',
        `Bạn có muốn xóa hình ảnh ${itemHead.photoDesc} không ?`,
        options,
      );
    } else {
      setRemoveImage(false);
    }
  };

  const actionDeletePhoto = async type => {
    if (type == 'ALL') {
      await deletePhotoByList(dataPhoto);
      await DeviceEventEmitter.emit('RELOAD_PHOTO_DISPLAY');
      onCloseView();
    }
    if (type == 'ONLY') setRemoveImage(true);
  };
  const actionDeleteOnlyPhoto = async item => {
    await deletePhotoByList([item]);
    await DeviceEventEmitter.emit('RELOAD_PHOTO_DISPLAY');
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [data]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight / (dataPhoto.length > 3 ? 1 : 1.6),
      backgroundColor: appcolor.light,
    },
    itemMain: { margin: 8 },
    titleHead: {
      width: '60%',
      fontSize: 15,
      fontWeight: fontWeightBold,
      alignSelf: 'center',
      color: appcolor.primary,
    },
    viewPhoto: { borderRadius: 5, overflow: 'hidden' },
    viewPosition: {
      width: 80,
      position: 'absolute',
      justifyContent: 'center',
      top: 0,
      end: 0,
      padding: 8,
      backgroundColor: appcolor.dark,
      opacity: 0.8,
      zIndex: 10,
      borderBottomStartRadius: 5,
    },
    titleTimeView: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      textAlign: 'center',
    },
    buttonCloseView: { padding: 8, paddingTop: 0 },
    contentAction: {
      padding: 8,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
      marginTop: 15,
    },
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
  const headeView = () => {
    return (
      <View style={styles.contentAction}>
        <Text
          style={styles.titleHead}
        >{`Hình ảnh ${itemHead.photoDesc} - Tổng ${dataPhoto.length} tấm`}</Text>
        <ButtonAction type="CANCEL" title="Đóng" handlerPress={onCloseView} />
        <ButtonAction
          type="REMOVE_IMAGE"
          title={isRemoveImage ? 'Hủy xóa' : `Xóa ${dataPhoto.length} hình`}
          handlerPress={onDeletePhoto}
        />
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerShowImage(index);
    };
    const onRemovePhoto = () => {
      actionDeleteOnlyPhoto(item);
    };
    return (
      <View key={`pg_item_${index}`} style={styles.itemMain}>
        <TouchableOpacity style={styles.viewPhoto} onPress={onPress}>
          <View style={styles.viewPosition}>
            <Text style={styles.titleTimeView}>
              {moment(item.photoFullTime).format('HH:mm:ss')}
            </Text>
          </View>
          <Image
            source={{ uri: item.photoPath }}
            style={{ width: '100%', height: deviceHeight / 5 }}
          />
        </TouchableOpacity>
        {isRemoveImage && (
          <TouchableOpacity
            style={styles.actionRemoveView}
            onPress={onRemovePhoto}
          >
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
      <SafeAreaView>{headeView()}</SafeAreaView>
      <FlashList
        data={dataPhoto}
        extraData={[isRemoveImage, data]}
        keyExtractor={(item, _index) => item.id.toString()}
        estimatedItemSize={100}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <ViewPictures
        visible={itemShowImage.visible}
        images={itemShowImage.photos || []}
        initialIndex={itemShowImage.index}
        onSwipeDown={handlerCloseShowImage}
      />
    </View>
  );
};
