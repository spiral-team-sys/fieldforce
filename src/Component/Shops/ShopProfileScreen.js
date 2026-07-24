import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ShopProfile } from './ShopProfile';
import { useSelector } from 'react-redux';

const ShopProfileScreen = ({ navigation }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={shopinfo.shopName}
      />
      <ShopProfile navigation={navigation} />
    </View>
  );
};

export default ShopProfileScreen;
