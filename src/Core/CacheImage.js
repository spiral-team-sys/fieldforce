import React, { forwardRef, useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import RNFS from 'react-native-fs';

const isInvalidUri = uri => {
  if (!uri) return true;
  const path = `${uri}`.trim().toLowerCase();
  return path === '' || path === 'null' || path === 'undefined';
};

const CacheImage = forwardRef(({ source, containerStyle, resizeMode }, ref) => {
  const [imageSource, setImageSource] = useState(null);
  const uri = source?.uri;

  useEffect(() => {
    let isMounted = true;

    const loadFile = path => {
      isMounted && setImageSource({ uri: path });
    };

    const downloadFile = async (fromUrl, toFile) => {
      try {
        await RNFS.downloadFile({ fromUrl, toFile }).promise;
        loadFile(toFile);
      } catch (err) {
        loadFile(fromUrl);
      }
    };

    const loadImage = async () => {
      setImageSource(null);
      if (isInvalidUri(uri)) return;

      try {
        const rawUri = `${uri}`.trim();
        const exists = await RNFS.exists(rawUri);
        if (exists) {
          loadFile(rawUri);
          return;
        }

        const name = rawUri.substring(
          rawUri.lastIndexOf('/') + 1,
          rawUri.length,
        );
        const extension = Platform.OS === 'android' ? 'file://' : '';
        const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
        const pathFile = `${path}${name}`;
        const cacheExists = await RNFS.exists(pathFile);
        if (cacheExists) {
          loadFile(pathFile);
          return;
        }

        await RNFS.mkdir(path).catch(() => {});
        await downloadFile(rawUri, pathFile);
      } catch (err) {
        loadFile(`${uri}`.trim());
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  const imageStyle = [{ height: '100%', width: '100%' }, containerStyle];

  if (!imageSource) {
    return <View style={imageStyle} />;
  }

  return (
    <Image
      ref={ref}
      style={imageStyle}
      source={imageSource}
      resizeMode={resizeMode == null ? 'contain' : resizeMode}
    />
  );
});

export default CacheImage;
