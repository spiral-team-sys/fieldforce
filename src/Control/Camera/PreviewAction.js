import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Image, Text } from '@rneui/base';
import LoadingDefault from '../ItemLoading/LoadingDefault';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../Themes/AppsStyle';

const PreviewAction = ({
  isLoading = false,
  photoUri = null,
  onSuccess,
  onReject,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const isSubmittingRef = useRef(false);

  // Handler
  const resetPicture = async () => {
    isSubmittingRef.current = false;
    onReject();
  };
  const savePicture = async () => {
    if (isSubmittingRef.current || isLoading) {
      return;
    }
    isSubmittingRef.current = true;
    try {
      await onSuccess(photoUri);
    } finally {
      isSubmittingRef.current = false;
    }
  };
  //
  useEffect(() => {
    isSubmittingRef.current = false;
  }, [photoUri]);

  // View
  const styles = StyleSheet.create({
    previewContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.black,
    },
    preview: { width: deviceWidth, height: deviceHeight },
    previewButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 24,
    },
    actionPreview: {
      width: '35%',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 32,
    },
    titlePreviewAction: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.white,
    },
    loadingView: { position: 'absolute', zIndex: 1 },
  });

  return (
    <View style={styles.previewContainer}>
      <LoadingDefault
        isLoading={isLoading}
        title="Đang lưu dữ liệu"
        color={appcolor.primary}
        styles={styles.loadingView}
      />
      <Image
        source={{ uri: `file://${photoUri}` }}
        style={styles.preview}
        resizeMode="contain"
        resizeMethod="resize"
      />
      <View style={styles.previewButton}>
        <TouchableOpacity
          style={styles.actionPreview}
          onPress={resetPicture}
          disabled={isLoading}
        >
          <Text style={styles.titlePreviewAction}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionPreview}
          onPress={savePicture}
          disabled={isLoading}
        >
          <Text style={styles.titlePreviewAction}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default PreviewAction;
