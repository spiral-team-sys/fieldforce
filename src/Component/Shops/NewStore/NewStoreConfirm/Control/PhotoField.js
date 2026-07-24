import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { GetUrl } from '../../../../../Core/Helper';
import ViewPictures from '../../../../../Control/Gallary/ViewPictures';

const PhotoField = ({
  item,
  photo,
  error,
  disabled = false,
  onTakePhoto,
  onSelectPhoto,
  onRemovePhoto,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreview, setPreview] = useState(false);
  const photos = Array.isArray(photo) ? photo : photo ? [photo] : [];
  const allowSelectPhoto = item.Ref_id == 2 ? true : false;
  const previewPhotos = photos.map(photoItem => ({
    ...photoItem,
    photoPath:
      photoItem?.PhotoPath ||
      photoItem?.photoPath ||
      photoItem?.uri ||
      photoItem?.photoUrl,
    photoType: item.NameVN,
  }));

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 10,
      marginVertical: 7,
      padding: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    titleIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    title: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    countLabel: { color: appcolor.greylight, fontSize: 12, fontWeight: '600' },
    required: { color: appcolor.red, fontSize: 14 },
    photoBox: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      overflow: 'hidden',
    },
    emptyBox: {
      minHeight: 122,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    emptyText: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 10,
      textAlign: 'center',
    },
    emptyHint: {
      color: appcolor.greylight,
      fontSize: 12,
      marginTop: 3,
      textAlign: 'center',
    },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10 },
    photoItem: {
      width: '31%',
      aspectRatio: 1,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
    },
    image: { width: '100%', height: '100%' },
    removeButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.62)',
    },
    countBadge: {
      position: 'absolute',
      left: 6,
      bottom: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.62)',
    },
    countText: { color: appcolor.light, fontSize: 10, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 8, padding: 10, paddingTop: 0 },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    primaryAction: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    actionText: {
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: '700',
      marginStart: 6,
    },
    primaryActionText: { color: appcolor.light },
    error: {
      color: appcolor.red,
      fontSize: 11,
      fontStyle: 'italic',
      marginTop: 6,
      marginStart: 2,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleIcon}>
          <SpiralIcon
            name="camera"
            type="font-awesome-5"
            size={13}
            color={appcolor.primary}
          />
        </View>
        <Text style={styles.title}>
          {item.NameVN}{' '}
          {item.IsRequired && <Text style={styles.required}>*</Text>}
        </Text>
        <Text style={styles.countLabel}>{photos.length} hình</Text>
      </View>
      <View style={styles.photoBox}>
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((photoItem, index) => {
              const photoPath =
                photoItem?.PhotoPath ||
                photoItem?.photoPath ||
                photoItem?.uri ||
                photoItem?.photoUrl ||
                null;
              if (!photoPath) return null;
              return (
                <TouchableOpacity
                  key={`${item.Ref_Name}_${photoPath}_${index}`}
                  style={styles.photoItem}
                  onPress={() => {
                    setPreviewIndex(index);
                    setPreview(true);
                  }}
                >
                  <Image
                    source={{ uri: GetUrl(photoPath) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {!disabled && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemovePhoto(item, photoItem)}
                    >
                      <SpiralIcon
                        name="close"
                        type="ionicon"
                        size={18}
                        color={appcolor.light}
                      />
                    </TouchableOpacity>
                  )}
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <TouchableOpacity
            disabled={disabled}
            style={styles.emptyBox}
            onPress={() => onTakePhoto(item)}
          >
            <View style={styles.emptyIcon}>
              <SpiralIcon
                name="images"
                type="font-awesome-5"
                size={20}
                color={appcolor.primary}
              />
            </View>
            <Text style={styles.emptyText}>Chưa có hình ảnh</Text>
            <Text style={styles.emptyHint}>
              {allowSelectPhoto
                ? 'Chụp mới hoặc chọn từ thư viện'
                : 'Chụp hình để thêm ảnh'}
            </Text>
          </TouchableOpacity>
        )}
        {!disabled && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => onTakePhoto(item)}
            >
              <SpiralIcon
                name="camera"
                type="font-awesome-5"
                size={14}
                color={appcolor.light}
              />
              <Text style={[styles.actionText, styles.primaryActionText]}>
                Chụp hình
              </Text>
            </TouchableOpacity>
            {allowSelectPhoto && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onSelectPhoto(item)}
              >
                <SpiralIcon
                  name="images"
                  type="font-awesome-5"
                  size={14}
                  color={appcolor.dark}
                />
                <Text style={styles.actionText}>Chọn hình</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      {error ? <Text style={styles.error}>* {error}</Text> : null}
      <ViewPictures
        visible={isPreview}
        images={previewPhotos}
        initialIndex={previewIndex}
        onSwipeDown={() => setPreview(false)}
        isUseDelete={!disabled}
        onDeleteImage={photoDelete => onRemovePhoto(item, photoDelete)}
      />
    </View>
  );
};

export default PhotoField;
