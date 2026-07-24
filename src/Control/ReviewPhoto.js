import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import SpiralIcon from './Icon/SpiralIcon';
const ReviewPhoto = React.forwardRef((props, ref) => {
  const { photoinfo, appcolor } = useSelector(state => state.GAppState);
  const [count, setCount] = useState(30);
  if (photoinfo.base64) {
    delete photoinfo.base64;
  }
  // console.log(photoinfo, "result")
  useEffect(() => {
    const interval = setTimeout(() => {
      if (count !== 0) setCount(count - 1);
      else {
        props.navigation.goBack();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [count]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          zIndex: 1,
          position: 'absolute',
          top: 40,
          width: '100%',
        }}
      >
        <TouchableOpacity style={{ padding: 12 }}>
          <SpiralIcon
            raised
            size={16}
            color={appcolor.primary}
            name="arrow-back"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ justifyContent: 'center', padding: 12, flexGrow: 1 }}
        >
          <Text style={{ color: appcolor.danger, fontWeight: '700' }}>
            Hình sẽ bị huỷ sau {count}s
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 12 }}>
          <SpiralIcon size={16} raised color={appcolor.primary} name="save" />
        </TouchableOpacity>
      </View>
      <Image
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
        source={{ uri: photoinfo.uri }}
      />
    </SafeAreaView>
  );
});
export default ReviewPhoto;
