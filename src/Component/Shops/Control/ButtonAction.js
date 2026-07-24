import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export const ButtonAction = ({
  itemStore,
  reportItem,
  handlerPressButton,
  TYPE,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataConfig, setDataConfig] = useState(
    JSON.parse(itemStore?.dataConfig || '[]'),
  );

  const ActionPress = ({ title, onPress, colorAction }) => {
    const actionItem = () => {
      onPress();
    };
    return (
      <TouchableOpacity
        style={{
          margin: 3,
          padding: 8,
          backgroundColor: colorAction,
          borderRadius: 3,
        }}
        onPress={actionItem}
      >
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: appcolor.light }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };
  const RenderItemButton = ({ item }) => {
    switch (item.code) {
      case TYPE.INSTORE_SHARE:
        return (
          <ActionPress
            title={item.name}
            colorAction={item.color || appcolor.redgray}
            onPress={() => handlerPressButton(itemStore, TYPE.INSTORE_SHARE)}
          />
        );
      case TYPE.SHOW_DASHBOARD:
        return (
          <ActionPress
            title={item.name || 'Thống kê'}
            colorAction={item.color || appcolor.info}
            onPress={() => handlerPressButton(itemStore, TYPE.SHOW_DASHBOARD)}
          />
        );
      case TYPE.SELLOUT:
        return (
          <ActionPress
            title={item.name || 'Thêm số bán'}
            colorAction={item.color || appcolor.redgray}
            onPress={() => handlerPressButton(itemStore, TYPE.SELLOUT)}
          />
        );
      case TYPE.SHOW_SUMMARY:
        return (
          <ActionPress
            title={item.name || 'Xem tổng'}
            colorAction={item.color || appcolor.primary}
            onPress={() => handlerPressButton(itemStore, TYPE.SHOW_SUMMARY)}
          />
        );
      case TYPE.UPDATE_INFO:
        return (
          <ActionPress
            title={item.name || 'Cập nhật thông tin'}
            colorAction={item.color || appcolor.redgray}
            onPress={() => handlerPressButton(itemStore, TYPE.UPDATE_INFO)}
          />
        );
      case TYPE.PHOTO_DISPLAY:
        return (
          <ActionPress
            title={item.name || 'Hình trưng bày'}
            colorAction={item.color || appcolor.primary}
            onPress={() => handlerPressButton(itemStore, TYPE.PHOTO_DISPLAY)}
          />
        );
      case TYPE.ANOTHER_ROUTE:
        return (
          <ActionPress
            title={item.name || 'Báo cáo'}
            colorAction={item.color || appcolor.primary}
            onPress={() => handlerPressButton(itemStore, TYPE.ANOTHER_ROUTE)}
          />
        );
    }
  };
  // const RenderViewButton = () => {
  //     console.log(item, 'check item');
  // }

  return (
    <View
      style={{ width: '100%', flexDirection: 'row-reverse', flexWrap: 'wrap' }}
    >
      {dataConfig?.map((item, index) => {
        return (
          <RenderItemButton
            key={`${itemStore.shopId}_${index}_${item.id}`}
            item={item}
          />
        );
      })}
    </View>
  );
};
