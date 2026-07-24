import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import { deviceHeight } from '../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { toastError } from '../../../Utils/configToast';
import Clipboard from '@react-native-clipboard/clipboard';
import { AI } from '../../../API/AI';
import CustomListView from '../../../Control/Custom/CustomListView';
import { Image } from '@rneui/themed';
import { URLDEFAULT } from '../../../Core/URLs';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

const ContentDetailScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { draftContent: initialContent, photoSurvey: initialPhotoSurvey } =
    route.params || {};

  const [draftContent, setDraftContent] = useState(initialContent || '');
  const [photoSurvey] = useState(initialPhotoSurvey || []);
  const [originalDraftContent, setOriginalDraftContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onBack = () => navigation.goBack();

  const handleCopyToClipboard = () => {
    Clipboard.setString(draftContent);
  };

  const onDoneEdit = () => {
    setKeyboardHeight(0);
    Keyboard.dismiss();
  };

  const handleTranslateDraft = async () => {
    setIsTranslating(true);
    if (!originalDraftContent) setOriginalDraftContent(draftContent);
    const translated = await AI.translateText(draftContent);
    setDraftContent(translated);
    setIsTranslating(false);
  };

  const handleRestoreOriginal = () => {
    setDraftContent(originalDraftContent);
    setOriginalDraftContent(null);
  };

  const togglePhotoSelection = index => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleShareText = async () => {
    try {
      setIsSharing(true);
      const selectedItems = photoSurvey.filter((_, i) =>
        selectedIndices.has(i),
      );
      let urlImages = [];
      if (selectedItems.length > 0) {
        const tempDir = RNFS.TemporaryDirectoryPath;
        const downloads = selectedItems.map(async (item, i) => {
          const photoPath =
            item.PhotoPath.startsWith('file://') ||
            item.PhotoPath.startsWith('http')
              ? item.PhotoPath
              : `${URLDEFAULT}${item.PhotoPath}`;
          const toFile = `${tempDir}/share_${Date.now()}_${i}.jpg`;
          await RNFS.downloadFile({
            fromUrl:
              Platform.OS === 'android'
                ? photoPath
                : photoPath.replace(/\\/g, '//'),
            toFile,
            cacheable: true,
          }).promise;
          return Platform.OS === 'android' ? `file://${toFile}` : toFile;
        });
        urlImages = await Promise.all(downloads);
      }
      const urlKey = urlImages.length > 1 ? 'urls' : 'url';
      const shareOptions = {
        title: 'Chia sẻ báo cáo home visit',
        message: draftContent,
        ...(urlImages.length > 0 && {
          [urlKey]: urlImages.length > 1 ? urlImages : urlImages[0],
          type: 'image/jpeg',
        }),
      };
      console.log(shareOptions);

      await RNShare.open(shareOptions);
    } catch (error) {
      if (error?.message !== 'User did not share') {
        toastError('Lỗi', 'Không thể chia sẻ: ' + error.message);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentWrapper: { flex: 1, position: 'relative' },
    textInput: {
      flex: 1,
      fontSize: 12,
      color: appcolor.dark,
      lineHeight: 20,
      padding: 12,
      textAlignVertical: 'top',
    },
    translatingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light + 'CC',
    },
    translatingText: { fontSize: 13, color: appcolor.primary, marginTop: 8 },
    footer: {
      paddingTop: 8,
      paddingBottom: 24,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      flexDirection: 'row',
      gap: 8,
    },
    header: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      flexDirection: 'row',
      gap: 8,
    },
    btn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 4,
    },
    btnSecondary: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: appcolor.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: appcolor.primary,
      flexDirection: 'row',
      gap: 4,
    },
    btnText: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.light,
      padding: 4,
    },
    btnTextSecondary: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.primary,
    },
    itemPhotoContainer: {
      width: 120,
      height: 120,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: appcolor.surface,
      marginEnd: 8,
    },
    selectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    unselectedDim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    photoSection: {
      width: '100%',
      height: 168,
      borderTopWidth: 1,
      borderTopColor: appcolor.grayLight,
      padding: 8,
      marginBottom: 16,
    },
    photoSectionLabel: {
      fontSize: 11,
      color: appcolor.blacklight,
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    keyboardBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      paddingVertical: 6,
      paddingHorizontal: 16,
      alignItems: 'flex-end',
      zIndex: 10,
    },
    keyboardBarBtn: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sharingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light + 'CC',
      zIndex: 99,
    },
  });

  const renderItemPhoto = ({ item, index }) => {
    const isSelected = selectedIndices.has(index);
    return (
      <TouchableOpacity
        key={index}
        style={styles.itemPhotoContainer}
        onPress={() => togglePhotoSelection(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: `${URLDEFAULT}${item.PhotoPath}` }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <SpiralIcon
              name="checkmark-circle"
              type="ionicon"
              size={28}
              color="#fff"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title="Bản draft báo cáo" leftFunc={onBack} />
      <View style={styles.header}>
        {originalDraftContent ? (
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleRestoreOriginal}
          >
            <SpiralIcon
              name="refresh-outline"
              type="ionicon"
              size={16}
              color={appcolor.primary}
            />
            <Text style={styles.btnTextSecondary}>Bản gốc</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleTranslateDraft}
            disabled={isTranslating}
          >
            <SpiralIcon
              name="language-outline"
              type="ionicon"
              size={16}
              color={appcolor.primary}
            />
            <Text style={styles.btnTextSecondary}>
              {isTranslating ? 'Đang dịch...' : 'Dịch'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={handleCopyToClipboard}
        >
          <SpiralIcon
            name="copy-outline"
            type="ionicon"
            size={16}
            color={appcolor.primary}
          />
          <Text style={styles.btnTextSecondary}>Sao chép</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={handleShareText}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color={appcolor.light} />
          ) : (
            <>
              <SpiralIcon
                name="share-social-outline"
                type="ionicon"
                size={16}
                color={appcolor.light}
              />
              <Text style={styles.btnText}>Chia sẻ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentWrapper}>
        <TextInput
          style={styles.textInput}
          value={draftContent}
          onChangeText={setDraftContent}
          multiline
          editable={!isTranslating}
          scrollEnabled
          placeholder="Chỉnh sửa nội dung báo cáo..."
          placeholderTextColor={appcolor.placeholderText}
        />
        {isTranslating && (
          <View style={styles.translatingOverlay}>
            <ActivityIndicator size="large" color={appcolor.primary} />
            <Text style={styles.translatingText}>Đang dịch...</Text>
          </View>
        )}
        <View style={{ height: deviceHeight / 5 }} />
      </ScrollView>
      <View style={styles.photoSection}>
        <Text style={styles.photoSectionLabel}>
          Chọn ảnh đính kèm ({selectedIndices.size}/{photoSurvey.length})
        </Text>
        <CustomListView
          horizontal
          data={photoSurvey}
          extraData={selectedIndices}
          renderItem={renderItemPhoto}
          endView={{ paddingEnd: 0 }}
        />
      </View>
      {keyboardHeight > 0 && (
        <TouchableOpacity
          style={[
            styles.keyboardBar,
            {
              bottom:
                Platform.OS === 'ios' ? keyboardHeight : keyboardHeight + 16,
            },
          ]}
          onPress={onDoneEdit}
          activeOpacity={1}
        >
          <View style={styles.keyboardBarBtn}>
            <SpiralIcon
              name="checkmark-done-outline"
              type="ionicon"
              size={14}
              color={appcolor.light}
            />
            <Text style={styles.btnText}>Hoàn thành</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ContentDetailScreen;
