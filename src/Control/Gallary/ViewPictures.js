import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFS from 'react-native-fs';
import { Icon, Text } from '@rneui/themed';
import { deviceWidth, fontWeightBold } from '../../Themes/AppsStyle';
import { isValidData } from '../../Utils/validateData';
import { useSelector } from 'react-redux';
import { checkLinkType, Message } from '../../Core/Helper';
import CustomListView from '../Custom/CustomListView';
import { deletePhoto } from '../../Controller/PhotoController';
import _ from 'lodash';
import SpiralIcon from '../Icon/SpiralIcon';

const ViewPictures = ({
  visible = false,
  images = [],
  initialIndex = 0,
  onSwipeDown,
  isUseDelete = false,
  onDeleteImage,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(initialIndex);
  const [viewerKey, setViewerKey] = useState(0);
  const thumbnailRef = useRef(null);
  //
  const LoadData = () => {
    const photos = images.map(item => ({
      ...item,
      url: checkLinkType(item.photoPath || item.AttendantPhoto),
    }));
    setDataPhoto(photos);
  };
  const handlerSave = async url => {
    try {
      if (!url.startsWith('file://')) {
        console.log('Invalid local file URL.');
        return;
      }
      const PictureDir = RNFS.PicturesDirectoryPath;
      const fileName = url.split('/').pop();
      const targetPath = `${PictureDir}/${fileName}`;
      const localPath = url.startsWith('file://')
        ? url.replace('file://', '')
        : url;
      await RNFS.copyFile(localPath, targetPath);
    } catch (error) {
      console.log('Error saving image:', error);
    }
  };
  const handleThumbnailPress = idx => {
    if (idx === currentIdx) return;
    setCurrentIdx(idx);
    setViewerKey(k => k + 1);
  };
  const handleChange = idx => {
    const newIdx = idx ?? 0;
    setCurrentIdx(newIdx);
    thumbnailRef.current?.scrollToIndex({
      index: newIdx,
      animated: true,
      viewPosition: 0.5,
    });
  };
  const handleDeleteCurrent = () => {
    const itemDelete = dataPhoto[currentIdx];
    if (!itemDelete) return;

    Message(
      'Xóa hình',
      'Bạn có chắc chắn muốn xóa hình này không?',
      async () => {
        if (itemDelete?.id) {
          await deletePhoto(itemDelete);
        }
        const photos = dataPhoto.filter((_item, index) => index !== currentIdx);
        const nextIndex = Math.max(0, Math.min(currentIdx, photos.length - 1));

        setDataPhoto(photos);
        setCurrentIdx(nextIndex);
        setViewerKey(k => k + 1);
        onDeleteImage && onDeleteImage(itemDelete);

        if (_.isEmpty(photos)) {
          onSwipeDown && onSwipeDown();
        }
      },
      null,
      'Xóa',
      'Đóng',
    );
  };
  //
  useEffect(() => {
    LoadData();
  }, [images]);

  useEffect(() => {
    if (visible) {
      setCurrentIdx(initialIndex);
      setViewerKey(k => k + 1);
    }
  }, [visible, initialIndex]);
  //
  const THUMB_HEIGHT = 108;
  const styles = StyleSheet.create({
    countContainer: {
      position: 'absolute',
      bottom: dataPhoto.length > 1 ? THUMB_HEIGHT + 8 : deviceWidth / 10,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    countText: {
      color: appcolor.white,
      fontSize: 15,
      fontWeight: fontWeightBold,
      letterSpacing: 1,
    },
    typeText: {
      color: appcolor.white,
      fontSize: 12,
      fontWeight: '500',
      padding: 8,
    },
    thumbnailContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 8,
      backgroundColor: 'rgba(0,0,0,0.55)',
      zIndex: 10,
    },
    thumbWrapper: {
      marginHorizontal: 4,
      borderRadius: 4,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: appcolor.greylight,
    },
    thumbActive: { borderColor: appcolor.white },
    thumbImage: { width: 55, height: 55, backgroundColor: appcolor.greylight },
    thumbnailContent: { padding: 8, marginBottom: 12 },
    deleteButton: {
      position: 'absolute',
      top: 52,
      right: 14,
      zIndex: 20,
      minHeight: 42,
      paddingHorizontal: 14,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.danger || '#E5484D',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.45)',
    },
    deleteText: {
      marginLeft: 6,
      color: appcolor.white,
      fontSize: 13,
      fontWeight: fontWeightBold,
    },
  });
  const renderIndicator = (currentIndex, allSize) => {
    const indexPhoto = currentIndex > 0 ? currentIndex - 1 : currentIndex;

    const image = images[indexPhoto];
    const photoTypeNumber = Number(image?.photoType);
    const photoType =
      image?.reportId == 1 &&
        image?.photoType != null &&
        !Number.isNaN(photoTypeNumber)
        ? `${photoTypeNumber % 2 > 0 ? 'CHECK OUT' : 'CHECK IN'} ${photoTypeNumber + 1
        }`
        : image?.photoType;
    return (
      <View style={styles.countContainer}>
        {isValidData(images) && photoType && (
          <Text style={styles.typeText}>{photoType}</Text>
        )}
        <Text style={styles.countText}>{`${currentIndex}/${allSize}`}</Text>
      </View>
    );
  };
  const renderItemThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleThumbnailPress(index)}
      style={[styles.thumbWrapper, index === currentIdx && styles.thumbActive]}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.thumbImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (_.isEmpty(dataPhoto)) return <View />;
  return (
    <Modal
      visible={visible}
      onRequestClose={onSwipeDown}
      statusBarTranslucent
      backdropColor={appcolor.black}
    >
      <View style={{ flex: 1 }}>
        <ImageViewer
          key={viewerKey}
          imageUrls={dataPhoto}
          index={currentIdx}
          onSwipeDown={onSwipeDown || null}
          enableSwipeDown={onSwipeDown}
          renderIndicator={renderIndicator}
          onSave={handlerSave}
          onChange={handleChange}
        />
        {isUseDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCurrent}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SpiralIcon
              name="trash-outline"
              type="ionicon"
              size={21}
              color={appcolor.white}
            />
            <Text style={styles.deleteText}>Xóa ảnh</Text>
          </TouchableOpacity>
        )}
        {dataPhoto.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <CustomListView
              ref={thumbnailRef}
              data={dataPhoto}
              horizontal
              containerStyle={styles.thumbnailContent}
              endView={{ paddingEnd: 0 }}
              renderItem={renderItemThumbnail}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ViewPictures;
