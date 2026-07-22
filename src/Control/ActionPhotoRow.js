import React, { Component, useRef } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useSelector } from 'react-redux';

const ActionPhotoRow = ({ children, cameraAction, fileAction, viewAction, isCamera = true, isFile = true, isViewPhoto = true }) => {
  const { appcolor } = useSelector(state => state.GAppState)
  const swipeableRef = useRef()

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
          ]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  }
  const rightAction = (iconName, color, x, progress, handler) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      closeAction()
      handler()
    };
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }], marginTop: 3, marginBottom: 3 }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color, borderRadius: 8, marginStart: 3 }]}
          onPress={pressHandler}>
          <Icon name={iconName} size={21} color={appcolor.light} />
        </RectButton>
      </Animated.View>
    );
  }
  const renderRightActions = (progress) => {
    const sizeWidth = (isCamera || isFile) ? 192 : 128
    return (
      <View style={{ width: sizeWidth, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        {isCamera && rightAction('camera', '#336699', 192, progress, cameraAction)}
        {isFile && rightAction('paperclip', '#FFAC1C', 128, progress, fileAction)}
        {isViewPhoto && rightAction('image', '#C02739', 64, progress, viewAction)}
      </View>
    )
  }
  const closeAction = () => {
    swipeableRef?.current.close()
  }
  const styles = StyleSheet.create({
    leftAction: { flex: 1, backgroundColor: appcolor.info, justifyContent: 'center' },
    actionText: { color: appcolor.light, fontSize: 16, backgroundColor: 'transparent', padding: 10, },
    rightAction: { alignItems: 'center', flex: 1, justifyContent: 'center', }
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
  )
}

export default ActionPhotoRow; 