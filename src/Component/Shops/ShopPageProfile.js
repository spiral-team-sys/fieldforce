import React from 'react';
import { View } from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ShopProfile } from './ShopProfile';
import { useSelector } from 'react-redux';

export const ShopPageProfile = ({ navigation }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  return (
    <View style={{ backgroundColor: appcolor.light, height: '100%' }}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={shopinfo.shopName}
      />
      <ShopProfile navigation={navigation} />
    </View>
  );
};
