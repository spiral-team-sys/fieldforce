import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActionItem } from '../../../../Control/ActionItem';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

const FloatActionPOP = ({
  visible,
  type,
  title,
  handlerChange,
  handlerVisible,
}) => {
  const _fadeInDown = FadeInDown.duration(500).withInitialValues({
    transform: [{ translateY: 420 }],
  });
  const _fadeOutDown = FadeOutDown.duration(100).withInitialValues({
    transform: [{ translateY: 420 }],
  });
  const typeFilter = {
    FILTER_STATUS: 'FILTER_STATUS',
    FILTER_INPUT: 'FILTER_INPUT',
  };

  const styles = StyleSheet.create({
    mainContainer: {
      alignItems: 'flex-end',
      position: 'absolute',
      bottom: 16,
      end: 16,
      zIndex: 1000,
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
          typeAction={typeFilter.FILTER_STATUS}
          title="Lọc trạng thái"
          iconName={type == typeFilter.FILTER_STATUS ? 'close' : 'options'}
          onPress={handlerChange}
        />
        <ActionItem
          typeAction={typeFilter.FILTER_INPUT}
          title="Lọc dữ liệu"
          iconName={type == typeFilter.FILTER_INPUT ? 'close' : 'calculator'}
          onPress={handlerChange}
        />
      </Animated.View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {visible && renderItemMenu()}
      <ActionItem
        isMain
        typeAction="MAIN"
        title={title}
        iconName={visible || type !== null ? 'close' : 'funnel'}
        onPress={handlerVisible}
      />
    </View>
  );
};

export default FloatActionPOP;
