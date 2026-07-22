import React, { useRef, useCallback } from 'react';
import { StyleSheet, Text, I18nManager } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const GmailStyleSwipeableRow = ({
  children,
  deleteItem,
  enableLeft,
  enableRight,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const swipeableRowRef = useRef(null);

  const onClose = useCallback(() => {
    swipeableRowRef.current?.close();
  }, []);

  const handleDeleteItem = useCallback(() => {
    if (deleteItem) deleteItem();
    swipeableRowRef.current?.close();
  }, [deleteItem]);

  // const leftScale = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       {
  //         scale: interpolate(
  //           dragX.value,
  //           [0, 100],
  //           [0, 1],
  //           Extrapolation.CLAMP
  //         )
  //       }
  //     ]
  //   };
  // });
  // const rightScale = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       {
  //         scale: interpolate(
  //           dragX.value,
  //           [0, -100],
  //           [0, 1],
  //           Extrapolation.CLAMP
  //         )
  //       }
  //     ]
  //   };
  // });

  const renderLeftActions = (_progress, dragX) => {

    return (
      <RectButton style={[styles.actionSwipe, { backgroundColor: appcolor.success, flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse' }]} onPress={onClose}>
        <AnimatedIcon
          name="archive"
          size={30}
          color={appcolor.white}
          style={[styles.actionIcon]}
        />
      </RectButton>
    );
  };

  const renderRightActions = (_progress, dragX) => {
    return (
      <RectButton style={[styles.actionSwipe, { backgroundColor: appcolor.danger, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]} onPress={handleDeleteItem}>
        <Text style={{ color: appcolor.white }}>Xóa</Text>
        <AnimatedIcon
          name="delete-forever"
          size={30}
          color={appcolor.white}
          style={[styles.actionIcon]}
        />
      </RectButton>
    );
  };

  const styles = StyleSheet.create({
    actionIcon: { width: 40, marginHorizontal: 10 },
    actionSwipe: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' }
  });

  return (
    <Swipeable
      ref={swipeableRowRef}
      friction={2}
      containerStyle={{ marginTop: 7, marginLeft: 7, marginRight: 7, borderRadius: 12 }}
      leftThreshold={80}
      rightThreshold={40}
      renderLeftActions={enableLeft ? renderLeftActions : null}
      renderRightActions={!enableRight ? renderRightActions : null}
    >
      {children}
    </Swipeable>
  );
};

export default GmailStyleSwipeableRow;