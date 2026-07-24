import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Image, Text } from '@rneui/themed';
import { deviceHeight, deviceWidth } from '../../../../Core/Utility';
import { URLDEFAULT } from '../../../../Core/URLs';
import { MultipleShowImage } from '../../../../Control/MultipleShowImage';

export const PhotoView = ({ photos, indexMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [itemShowImage, setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    await setDataPhoto(photos);
  };
  // Handler
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
  }, [photos]);

  // View
  const sizeWidthImage = Math.round(
    dataPhoto.length < 5 ? deviceWidth / dataPhoto.length : deviceWidth / 5,
  );
  const styles = StyleSheet.create({
    mainContainer: { borderRadius: 5, overflow: 'hidden' },
    itemMain: {
      width: sizeWidthImage,
      marginEnd: 5,
      borderRadius: 5,
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
      handlerShowImage(index);
    };
    return (
      <TouchableOpacity
        key={`igsi_${index}_${indexMain}`}
        style={styles.itemMain}
        onPress={onPress}
      >
        <Image
          source={{ uri: `${URLDEFAULT}${item.photoPath}` }}
          style={{ height: deviceHeight / 8 }}
          resizeMethod="resize"
          resizeMode="cover"
          PlaceholderContent={<ActivityIndicator />}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FlatList
        horizontal
        nestedScrollEnabled
        key={`${indexMain}_photoViewIssue`}
        keyExtractor={(_item, index) => index.toString()}
        data={dataPhoto}
        renderItem={renderItem}
        removeClippedSubviews
        getItemLayout={(_data, index) => ({
          length: deviceWidth,
          offset: deviceWidth * index,
          index,
        })}
        style={{ width: deviceWidth - 32 }}
        showsHorizontalScrollIndicator={false}
      />
      <Modal visible={itemShowImage.visible}>
        <MultipleShowImage
          key={`${indexMain}_showviewimage`}
          listItem={itemShowImage.photos || []}
          closeShowImage={handlerHideImage}
          indexItem={itemShowImage.index}
        />
      </Modal>
    </View>
  );
};
