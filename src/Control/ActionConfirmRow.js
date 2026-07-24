import React, { useRef } from 'react';
import { Animated, StyleSheet, View, I18nManager } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import SpiralIcon from './Icon/SpiralIcon';
import { useSelector } from 'react-redux';

const ActionConfirmRow = ({ children, confirmAction, rejectAction }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const swipeableRef = useRef();

  const leftAction = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={styles.leftAction} onPress={closeAction}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          Archive
        </Animated.Text>
      </RectButton>
    );
  };
  const rightAction = (iconName, color, x, progress, handler) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      closeAction();
      handler();
    };
    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: trans }],
          marginTop: 3,
          marginBottom: 3,
        }}
      >
        <RectButton
          style={[
            styles.rightAction,
            { backgroundColor: color, borderRadius: 8, marginStart: 3 },
          ]}
          onPress={pressHandler}
        >
          <SpiralIcon
            type="font-awesome-6"
            name={iconName}
            size={21}
            color={appcolor.light}
          />
        </RectButton>
      </Animated.View>
    );
  };
  const renderRightActions = progress => {
    return (
      <View
        style={{
          width: 128,
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        }}
      >
        {rightAction('check', '#086e19', 128, progress, confirmAction)}
        {rightAction('times', '#C02739', 64, progress, rejectAction)}
      </View>
    );
  };
  const closeAction = () => {
    swipeableRef?.current.close();
  };
  const styles = StyleSheet.create({
    leftAction: {
      flex: 1,
      backgroundColor: appcolor.info,
      justifyContent: 'center',
    },
    actionText: {
      color: appcolor.light,
      fontSize: 16,
      backgroundColor: 'transparent',
      padding: 10,
    },
    rightAction: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  });
  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
};

export default ActionConfirmRow;
