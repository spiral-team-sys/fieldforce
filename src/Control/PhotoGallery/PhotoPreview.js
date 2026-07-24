import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { URLDEFAULT } from '../../Core/URLs';
import ImageViewer from 'react-native-image-zoom-viewer';
import { checkLinkType } from '../../Core/Helper';
import { isValidData } from '../../Utils/validateData';

const PhotoPreview = ({ photos, closeShowImage, index }) => {
  const [dataPhoto, setDataPhoto] = useState([]);

  useEffect(() => {
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        dataPhoto.push({
          ...photos[i],
          url: checkLinkType(photos[i].photoPath),
        });
      }
      setDataPhoto(dataPhoto);
    }
  }, [photos]);

  const styles = StyleSheet.create({});

  const renderIndicator = (currentIndex, allSize) => {
    const indexPhoto = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    const photoType = dataPhoto[indexPhoto]?.photoType;
    return (
      <View style={styles.countContainer}>
        {isValidData(dataPhoto) && photoType && (
          <Text style={styles.typeText}>{photoType}</Text>
        )}
        <Text style={styles.countText}>{`${currentIndex}/${allSize}`}</Text>
      </View>
    );
  };

  return (
    <ImageViewer
      imageUrls={dataPhoto}
      index={index}
      onSwipeDown={closeShowImage || null}
      enableSwipeDown={closeShowImage}
      renderIndicator={renderIndicator}
      onSave={closeShowImage}
    />
  );
};

export default PhotoPreview;
