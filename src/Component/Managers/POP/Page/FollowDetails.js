import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { Image, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle';
import { FlashList } from '@shopify/flash-list';
import PlusMinusEdit from '../Controls/PlusMinusEdit';

const FollowDetails = ({ itemMain, messageError }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataContent, setDataContent] = useState([]);
  const [_mutate, setMutate] = useState(false);

  const LoadData = () => {
    setDataContent(JSON.parse(itemMain.Content || '[]'));
  };

  const onChangeValue = () => {
    const params = {
      orderNo: itemMain.OrderNo,
      newContent: dataContent,
    };
    DeviceEventEmitter.emit('UPDATE_ORDER_POP', params);
  };

  useEffect(() => {
    LoadData();
  }, [itemMain]);

  const styles = StyleSheet.create({
    mainContainer: {
      marginTop: 8,
      padding: 8,
      backgroundColor: appcolor.light,
    },
    titleOrder: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      paddingBottom: 4,
    },
    itemContainer: {
      flex: 1,
      flexDirection: 'row',
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
    viewListItem: { width: '100%', height: '80%' },
    viewImage: {
      width: '30%',
      overflow: 'hidden',
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
    },
    viewInfo: { width: '70%', paddingVertical: 8, marginStart: 8 },
    imageView: { width: '100%', height: '100%' },
    titleName: {
      width: '98%',
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleNumberItem: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    bottomView: { paddingBottom: 32 },
    messageError: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.redgray,
      paddingBottom: 8,
    },
  });
  const renderItem = ({ item }) => {
    const imageURI = item.Image
      ? { uri: item.Image }
      : require('../../../../Themes/Images/noimage.png');
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewImage}>
          <Image
            source={imageURI}
            style={styles.imageView}
            resizeMode="cover"
            resizeMethod="resize"
          />
        </View>
        <View style={styles.viewInfo}>
          <Text style={styles.titleName}>{`${item.POPName}`}</Text>
          <Text style={styles.titleNumberItem}>{`Số lượng kho điều chỉnh: ${
            item.QuantityEdit || 0
          }`}</Text>
          <PlusMinusEdit
            isEditable={itemMain.isEditOrder == 1}
            title="Số lượng đề xuất"
            itemEdit={item}
            keyValue="UserInput"
            onChange={onChangeValue}
          />
          {(itemMain.Status == 'DELIVERY' || itemMain.Status == 'PASS') && (
            <>
              <PlusMinusEdit
                isEditable={itemMain.isPickedOrder == 1}
                title="Số lượng hư hỏng"
                itemEdit={item}
                keyValue="QuantityDamaged"
                onChange={onChangeValue}
              />
              <PlusMinusEdit
                isEditable={itemMain.isPickedOrder == 1}
                title="Số lượng nhận được"
                itemEdit={item}
                keyValue="QuantityPickup"
                onChange={onChangeValue}
              />
            </>
          )}
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleOrder}>Chi tiết đơn hàng</Text>
      {messageError && <Text style={styles.messageError}>*{messageError}</Text>}
      <View style={styles.viewListItem}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataContent}
          extraData={[dataContent]}
          renderItem={renderItem}
          estimatedItemSize={deviceWidth}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.bottomView} />}
        />
      </View>
    </View>
  );
};

export default FollowDetails;
