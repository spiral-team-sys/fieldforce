import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { ActionItem } from '../../../../Control/ActionItem';

export const FloatActionButton = ({
  visible = true,
  info,
  groupInfo,
  tabInfo,
  showMenu,
  handlerChange,
  containerStyle = {},
}) => {
  const { isEdit } = useSelector(state => state.GAppState);
  const _fadeInDown = FadeInDown.duration(500).withInitialValues({
    transform: [{ translateY: 420 }],
  });
  const _fadeOutDown = FadeOutDown.duration(100).withInitialValues({
    transform: [{ translateY: 420 }],
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
      bottom: 120,
      end: 8,
      zIndex: 1000,
      ...containerStyle,
    },
    contentMenu: { alignItems: 'flex-end' },
  });
  const renderItemMenu = () => {
    return (
      <Animated.View
        entering={_fadeInDown}
        exiting={_fadeOutDown}
        style={styles.contentMenu}
      >
        <ActionItem
          typeAction="SORT_NONE"
          title="Sản phẩm không trưng bày"
          iconName={info.type == 'SORT' ? 'close' : 'funnel-outline'}
          onPress={handlerChange}
        />
        <ActionItem
          typeAction="SORT"
          title="Sản phẩm có trưng bày"
          iconName={info.type == 'SORT' ? 'close' : 'funnel-outline'}
          onPress={handlerChange}
        />

        <ActionItem
          visible={isEdit}
          typeAction="DELETE"
          title={`Xóa dữ liệu ngành hàng ${tabInfo.tabName} - ${groupInfo.groupName}`}
          iconName="trash-bin-outline"
          onPress={handlerChange}
        />

        <ActionItem
          visible={isEdit}
          typeAction="CAMERA"
          title="Chụp hình sản phẩm"
          iconName="camera-outline"
          onPress={handlerChange}
        />
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
