import { Icon, Image, Text } from '@rneui/base';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import NativeCamera from '../../../../Control/NativeCamera';
import { checkLinkType, UUIDGenerator } from '../../../../Core/Helper';
import { TODAY } from '../../../../Core/Utility';
import { normalizePhotoItems } from './ItemHelpers';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const THUMB_SIZE = 80;

const ItemPhoto = ({ item, paramShop, onUpdateItem }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [photos, setPhotos] = useState([]);
  const [viewPhoto, setViewPhoto] = useState({ visible: false, index: 0 });

  // item.Value chỉ lưu tổng số ảnh — danh sách ảnh giữ local trong state

  const updateItemValue = nextPhotos => {
    item.Value = nextPhotos.length > 0 ? `${nextPhotos.length}` : '';
    onUpdateItem && onUpdateItem(item);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleCaptureResult = async result => {
    if (result?.statusId !== 200) return;
    const newPhotos = (
      Array.isArray(result?.data) ? result.data : [result?.data]
    )
      .map((photo, i) => {
        const photoPath = photo?.photoPath || photo?.uri || '';
        if (!photoPath) return null;
        return {
          id: `${Date.now()}_${i}_${photoPath}`,
          photoPath,
          fileName:
            photo?.fileName ||
            photoPath.split('/').pop() ||
            `photo_${Date.now()}_${i}.jpg`,
        };
      })
      .filter(Boolean);
    if (newPhotos.length === 0) return;
    const merged = [...photos];
    newPhotos.forEach(p => {
      if (!merged.some(exist => exist.photoPath === p.photoPath))
        merged.push(p);
    });
    setPhotos(merged);
    updateItemValue(merged);
  };

  const capturePhoto = async () => {
    const photoInfo = {
      shopId: shopinfo?.shopId || paramShop?.shopId || 0,
      shopCode: shopinfo?.shopCode || paramShop?.shopCode || '',
      reportId: kpiinfo?.id || 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      photoType: `${item.ItemCode}`,
      photoDesc: `SURVEY_HOMEVISIT`,
      shopLat: 0,
      shopLong: 0,
      guid: await UUIDGenerator(),
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoInfo, handleCaptureResult);
  };

  const captureLibrary = async () => {
    const photoInfo = {
      shopId: shopinfo?.shopId || paramShop?.shopId || 0,
      shopCode: shopinfo?.shopCode || paramShop?.shopCode || '',
      reportId: kpiinfo?.id || 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      photoType: `${item.ItemCode}`,
      photoDesc: `SURVEY_HOMEVISIT`,
      shopLat: 0,
      shopLong: 0,
      guid: await UUIDGenerator(),
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoInfo, handleCaptureResult);
  };

  const removePhoto = photoId => {
    const next = photos.filter(p => p.id !== photoId);
    setPhotos(next);
    updateItemValue(next);
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    mainContainer: { marginTop: 10 },
    listContent: { gap: 8, paddingRight: 4 },
    // Add button
    viewActionAdd: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    addButton: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: appcolor.primary,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary + '0D',
    },
    addLabel: {
      fontSize: 10,
      color: appcolor.primary,
      marginTop: 3,
      fontWeight: '600',
    },
    // Thumbnail
    thumbWrap: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: appcolor.surface,
    },
    thumbImage: { width: '100%', height: '100%' },
    deleteButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: appcolor.black + 'CC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Counter
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 4,
    },
    counterText: { fontSize: 11, color: appcolor.placeholderText },
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setPhotos(normalizePhotoItems(item?.Value));
  }, [item]);

  const renderAddButton = () => (
    <View style={styles.viewActionAdd}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={capturePhoto}
        activeOpacity={0.7}
      >
        <SpiralIcon
          name="camera-alt"
          type="material-icons"
          size={26}
          color={appcolor.primary}
        />
        <Text style={styles.addLabel}>Chụp ảnh</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={captureLibrary}
        activeOpacity={0.7}
      >
        <SpiralIcon
          name="photo-library"
          type="material-icons"
          size={26}
          color={appcolor.primary}
        />
        <Text style={styles.addLabel}>Thư viện</Text>
      </TouchableOpacity>
    </View>
  );

  const renderThumb = ({ item: photo, index }) => (
    <TouchableOpacity
      style={styles.thumbWrap}
      onPress={() => setViewPhoto({ visible: true, index })}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: checkLinkType(photo.photoPath) }}
        style={styles.thumbImage}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removePhoto(photo.id)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <SpiralIcon
          name="close"
          type="material-icons"
          size={13}
          color={appcolor.white}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {photos.length > 0 && (
        <View style={styles.counterRow}>
          <SpiralIcon
            name="photo-library"
            type="material-icons"
            size={14}
            color={appcolor.placeholderText}
          />
          <Text style={styles.counterText}>{photos.length} ảnh</Text>
        </View>
      )}
      <FlatList
        horizontal
        data={photos}
        renderItem={renderThumb}
        keyExtractor={p => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderAddButton}
      />
      <ViewPictures
        visible={viewPhoto.visible}
        images={photos}
        initialIndex={viewPhoto.index}
        onSwipeDown={() => setViewPhoto({ visible: false, index: 0 })}
      />
    </View>
  );
};

export default ItemPhoto;
