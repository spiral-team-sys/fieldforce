import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { deviceHeight } from '../../../../Core/Utility';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { ActionItem } from './ActionItem';

export const FloatActionButton = ({
  visible = true,
  info,
  showMenu,
  handlerChange,
}) => {
  const _fadeInDown = FadeInDown.duration(120).withInitialValues({
    transform: [{ translateY: 120 }],
  });
  const _fadeOutDown = FadeOutDown.duration(120).withInitialValues({
    transform: [{ translateY: 120 }],
  });
  //
  useEffect(() => {
    return () => false;
  }, [info]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      alignItems: 'flex-end',
      position: 'absolute',
      bottom: 24,
      end: 16,
      zIndex: 1000,
    },
    contentMenu: { alignItems: 'flex-end' },
  });
  const dataFilter = [
    {
      typeAction2: 'FILTER_UNVERIFIED_PHOTO_REVIEW',
      title2: 'Chưa gửi hình ảnh',
      typeAction: 'FILTER_VERIFIED_PHOTO_REVIEW',
      title: 'Đã gửi hình ảnh',
      iconName: 'image',
    },
    {
      typeAction2: 'FILTER_UNVERIFIED_INVOICE',
      title2: 'Chưa gửi hoá đơn',
      typeAction: 'FILTER_VERIFIED_INVOICE',
      title: 'Đã gửi hoá đơn',
      iconName: 'document',
    },
    {
      typeAction2: 'FILTER_UNVERIFIED_DELIVERY_SLIP',
      title2: 'Chưa gửi phiếu xuất',
      typeAction: 'FILTER_VERIFIED_DELIVERY_SLIP',
      title: 'Đã gửi phiếu xuất',
      iconName: 'receipt',
    },
  ];
  const renderItemMenu = () => {
    return (
      <Animated.View
        entering={_fadeInDown}
        exiting={_fadeOutDown}
        style={styles.contentMenu}
      >
        {dataFilter.map((item, index) => (
          <ActionItem
            key={index}
            visible={visible}
            typeAction={item.typeAction}
            title={item.title}
            typeAction2={item.typeAction2}
            title2={item.title2}
            iconName={item.iconName}
            onPress={handlerChange}
          />
        ))}
      </Animated.View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {visible && info.isOpen && renderItemMenu()}
      <ActionItem
        visible={visible}
        isMain
        typeAction="MAIN"
        title={info.title}
        title2={info.title2}
        iconName={
          info.isOpen
            ? 'chevron-down-outline'
            : info.type !== null && info.type.length > 0
            ? 'close'
            : 'settings'
        }
        onPress={showMenu}
      />
    </View>
  );
};
