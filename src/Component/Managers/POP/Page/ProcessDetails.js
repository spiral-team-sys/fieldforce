import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../../Themes/AppsStyle';
import { Text } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';
import { groupDataByKey } from '../../../../Core/Helper';
import CustomListView from '../../../../Control/Custom/CustomListView';

const ProcessDetails = ({ itemDetail = {} }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataProduct, setDataProduct] = useState([]);

  const LoadData = async () => {
    const productlist = JSON.parse(itemDetail.jsonDetails || '[]');
    const { arr } = groupDataByKey({
      arr: productlist,
      key: 'ProductName',
    });
    setDataProduct(arr);
  };

  useEffect(() => {
    LoadData();
  }, [itemDetail]);

  const heightView =
    dataProduct.length > 2
      ? dataProduct.length * 50 > deviceHeight
        ? deviceHeight
        : dataProduct.length * 80
      : 200;
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: heightView,
      backgroundColor: appcolor.light,
      padding: 8,
    },
    itemContainer: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    titleShop: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textAlign: 'center',
    },
    titleShopCode: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.primary,
      textAlign: 'center',
      marginBottom: 4,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      marginStart: 8,
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
  });

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.itemContainer}>
        {item.isParent && (
          <Text style={styles.titleName}>{`${index + 1}. ${
            item.ProductName
          }`}</Text>
        )}
        <Text style={styles.subTitleName}>{item.POPName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleShop}>{itemDetail.shopName}</Text>
      <Text style={styles.titleShopCode}>{itemDetail.shopCode}</Text>
      <CustomListView />
    </View>
  );
};

export default ProcessDetails;
