import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ActionItem } from './ActionItem';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const FloatActionButton = ({
  info,
  showMenu,
  handlerChange,
  configPage = {},
  configMaternity = {},
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const _fadeInDown = FadeInUp.duration(500).withInitialValues({
    transform: [{ translateY: 0 }],
  });
  const isEnable = value =>
    value === true ||
    value === 1 ||
    value === '1' ||
    `${value}`.toLowerCase() === 'true';
  //
  useEffect(() => {
    return () => false;
  }, [info]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      alignItems: 'flex-end',
      position: 'absolute',
      top: 11,
      end: 8,
      zIndex: 101,
      elevation: 101,
    },
    titleName: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    contentMenu: { alignItems: 'flex-end', zIndex: 102, elevation: 102 },
  });
  const renderItemMenu = () => {
    return (
      <Animated.View
        key={`employee_fab_menu_${info.isOpen ? 'open' : 'close'}`}
        entering={_fadeInDown}
        style={styles.contentMenu}
      >
        <ActionItem
          typeAction="QRCODE"
          title="Quét mã QR - CCCD"
          iconName="qr-code-outline"
          onPress={handlerChange}
        />
        {isEnable(configPage?.isShowResign) && (
          <ActionItem
            typeAction="RESIGN"
            title="Xin nghỉ việc"
            iconName="log-out-outline"
            onPress={handlerChange}
          />
        )}
        {isEnable(configMaternity?.isShowMaternity) && (
          <ActionItem
            typeAction="MATERNITY"
            title="Xin nghỉ thai sản"
            iconName="log-out-outline"
            onPress={handlerChange}
          />
        )}
      </Animated.View>
    );
  };
  return (
    <View style={styles.mainContainer}>
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
      {info.isOpen && renderItemMenu()}
    </View>
  );
};
