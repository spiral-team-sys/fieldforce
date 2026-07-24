import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { TODAY, deviceWidth } from '../../../../Core/Utility';
import { View } from 'react-native';
import { Badge, Icon, Text } from '@rneui/base';
import _ from 'lodash';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const PhotoControlView = ({
  isUploaded,
  itemHeader,
  index,
  handlerCamera,
  handlerAlbums,
  dataPhoto,
}) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);

  const countPhoto = () => {
    const listPhoto = _.filter(
      dataPhoto,
      it => it.photoType == `${itemHeader.Code}`,
    );
    return listPhoto.length || 0;
  };

  const RenderButton = ({ iconName, titleName, onAtion }) => {
    const pressItem = () => {
      onAtion(itemHeader);
    };
    const numPhoto = countPhoto();
    return (
      <TouchableOpacity
        style={{
          width: deviceWidth / 5,
          backgroundColor: appcolor.surface,
          marginEnd: 3,
          marginStart: 3,
          borderRadius: 5,
        }}
        key={`iid_acc_${index}`}
        onPress={pressItem}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            padding: 5,
          }}
        >
          <SpiralIcon
            type="font-awesome-5"
            name={iconName}
            size={21}
            color={appcolor.yellow}
            solid
          />
          {/* <Text style={{ fontSize: 13, fontWeight: '400', color: appcolor.dark, padding: 5, marginStart: 5 }}>{titleName}</Text> */}
        </View>
        {iconName == 'image' && (
          <Badge
            value={numPhoto || 0}
            textStyle={{ fontSize: 12 }}
            badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
            status="primary"
            containerStyle={{ position: 'absolute', top: -4, right: -15 }}
          />
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        borderRadius: 5,
        padding: 5,
        paddingStart: 10,
      }}
    >
      {!isUploaded && (
        <RenderButton
          iconName="camera"
          titleName="Chụp hình"
          onAtion={handlerCamera}
        />
      )}
      <RenderButton
        iconName="image"
        titleName="Hình ảnh"
        onAtion={handlerAlbums}
      />
    </View>
  );
};
