import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Core/Utility';
import { Icon } from '@rneui/themed';
import { URLDEFAULT, _competitorId, _competitorName } from '../../Core/URLs';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ViewListPhoto = ({
  listPhoto,
  isUploaded,
  handleDeletePhoto,
  handleVisible,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_, setMutate] = useState(false);
  const [listPhotoClone, setListPhotoClone] = useState(listPhoto);
  const [isShowImage, setIsShowImage] = useState(false);
  const [dataImage, setDataImage] = useState({ itemPhoto: [], indexPhoto: 0 });

  useEffect(() => {
    const _load = setListPhotoClone(listPhoto);
  }, [listPhoto]);

  const handleSelectDelete = item => {
    handleDeletePhoto(item);
  };
  const handleLongPress = () => {
    listPhotoClone.map(
      it => (it.isDelete = it.isDelete == true ? false : true),
    );
    setMutate(e => !e);
  };

  const handleSelectImage = (item, index) => {
    dataImage.itemPhoto = item;
    dataImage.indexPhoto = index;
    setIsShowImage(true);
  };

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{ flex: 1, borderRadius: 10, marginHorizontal: 5, marginTop: 5 }}
      >
        <TouchableOpacity
          onLongPress={() => (!isUploaded ? handleLongPress() : null)}
          style={{ borderRadius: 10, flex: 1 }}
          onPress={() => handleSelectImage(item, index)}
        >
          <Image
            source={{
              uri: item.photoPath.includes('uploaded')
                ? URLDEFAULT + item.photoPath
                : item.photoPath || '',
            }}
            style={{ width: '100%', height: 130, zIndex: 3, borderRadius: 10 }}
          />
        </TouchableOpacity>
        {item.isDelete == true && !isUploaded && (
          <TouchableOpacity
            onPress={() => handleSelectDelete(item)}
            style={{
              flexDirection: 'row',
              padding: 5,
              alignItems: 'center',
              position: 'absolute',
              top: 5,
              right: 5,
              borderRadius: 5,
              backgroundColor: 'rgba(241,242,247,0.5)',
            }}
          >
            <SpiralIcon
              color={appcolor.danger}
              name="trash-alt"
              type="font-awesome-5"
              size={18}
              style={{ paddingHorizontal: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const handleVisibleImage = () => {
    setIsShowImage(false);
  };

  return isShowImage ? (
    <View
      style={{
        flex: 1,
        backgroundColor: appcolor.surface,
        width: deviceWidth,
        paddingTop: 5,
        marginTop: 5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <ViewImageSheet
        dataImage={dataImage}
        handleVisible={handleVisibleImage}
      />
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor: appcolor.surface,
        width: deviceWidth,
        paddingTop: 5,
        marginTop: 5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => handleVisible()}
        style={{
          position: 'absolute',
          right: 20,
          top: Platform.OS == 'ios' ? 40 : 20,
          zIndex: 100,
          borderRadius: 5,
          borderWidth: 1,
          padding: 3,
          paddingHorizontal: 10,
          borderColor: appcolor.primary,
        }}
      >
        <Text
          style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}
        >
          Đóng
        </Text>
      </TouchableOpacity>

      <FlatList
        style={{ padding: 5, marginTop: 70 }}
        keyExtractor={(item, index) => index.toString()}
        data={listPhotoClone}
        renderItem={renderItem}
        numColumns={2}
      />
    </View>
  );
};

const ViewImageSheet = ({ dataImage, handleVisible }) => {
  const [itemPhoto, setItemPhoto] = useState({});
  const appcolor = useSelector(state => state.GAppState.appcolor);

  useEffect(() => {
    loadData();
    return () => false;
  }, []);
  const loadData = () => {
    const itemImage = dataImage.itemPhoto;
    setItemPhoto(itemImage);
  };
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <TouchableOpacity
        onPress={() => handleVisible()}
        style={{
          position: 'absolute',
          right: 20,
          top: Platform.OS == 'ios' ? 40 : 20,
          zIndex: 100,
          borderRadius: 5,
          borderWidth: 1,
          padding: 3,
          paddingHorizontal: 10,
          borderColor: appcolor.primary,
        }}
      >
        <Text
          style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}
        >
          Đóng
        </Text>
      </TouchableOpacity>
      {itemPhoto?.photoPath !== undefined && (
        <Image
          source={{
            uri: itemPhoto.photoPath.includes('uploaded')
              ? URLDEFAULT + itemPhoto.photoPath
              : itemPhoto.photoPath || '',
          }}
          resizeMode={'contain'}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  );
};
