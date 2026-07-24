import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ActionItem } from './ActionItem.js';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { deviceHeight, deviceWidth } from '../../../Home.js';

export const FloatActionButton = ({ info, showMenu, handlerChange }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const _fadeInDown = FadeInUp.duration(500).withInitialValues({
    transform: [{ translateY: 0 }],
  });
  const _fadeOutDown = FadeOutUp.duration(100).withInitialValues({
    transform: [{ translateY: 0 }],
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
      bottom: 16,
      end: 8,
      zIndex: 1000,
    },
    titleName: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: fontWeightBold,
      textAlign: 'center',
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
        {/* <ActionItem
                    typeAction='SORT'
                    title='sắp xếp theo'
                    iconName='funnel-outline'
                    onPress={handlerChange} /> */}
        <ActionItem
          typeAction="SEARCH"
          title="Tìm kiếm dữ liệu theo tháng"
          iconName="search"
          onPress={handlerChange}
        />
      </Animated.View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {info.isOpen && renderItemMenu()}
      <ActionItem
        isMain
        typeAction="MAIN"
        title={info.title}
        iconName={
          info.isOpen
            ? 'chevron-up-outline'
            : info.type !== null && info.type.length > 0
            ? 'close'
            : 'menu'
        }
        onPress={showMenu}
      />
    </View>
  );
};
