import React from 'react';
import { StyleSheet, View } from 'react-native';
import { deviceHeight } from '../../Themes/AppsStyle';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { ActionItem } from '../ActionItem';

export const FAB = ({
  visible = true,
  title = 'Tùy chọn',
  isOpen = false,
  onToggle,
  actions = [],
  bottomOffset = deviceHeight / 8,
}) => {
  const _fadeInDown = FadeInDown.duration(220).withInitialValues({
    transform: [{ translateY: 120 }],
  });
  const _fadeOutDown = FadeOutDown.duration(120).withInitialValues({
    transform: [{ translateY: 120 }],
  });

  const styles = StyleSheet.create({
    mainContainer: {
      alignItems: 'flex-end',
      position: 'absolute',
      bottom: bottomOffset,
      end: 8,
      zIndex: 1000,
    },
    contentMenu: { alignItems: 'flex-end' },
  });

  const handleToggle = () => {
    typeof onToggle === 'function' && onToggle(!isOpen);
  };

  const handlePressAction = (typeAction, actionTitle) => {
    const action = actions.find(a => a.typeAction === typeAction);
    action?.onPress?.({ typeAction, title: actionTitle });
  };

  const renderItemMenu = () => {
    const visibleActions = actions.filter(a => a?.visible !== false);
    if (visibleActions.length === 0) return null;
    return (
      <Animated.View
        entering={_fadeInDown}
        exiting={_fadeOutDown}
        style={styles.contentMenu}
      >
        {visibleActions.map(a => (
          <ActionItem
            key={a.typeAction}
            typeAction={a.typeAction}
            title={a.title}
            iconName={a.iconName}
            onPress={handlePressAction}
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {visible && isOpen && renderItemMenu()}
      <ActionItem
        visible={visible}
        isMain
        typeAction="MAIN"
        title={title}
        iconName={isOpen ? 'chevron-down-outline' : 'funnel-outline'}
        onPress={handleToggle}
      />
    </View>
  );
};
