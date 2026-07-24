import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Text, Badge } from '@rneui/themed';
import { fontWeightBold } from '../Themes/AppsStyle';
import {
  AppNameBuild,
  artApp,
  mitsuApp,
  demoApp,
  hafeleApp,
  CONTENT_COLOR,
  DEFAULT_COLOR,
  bekoApp,
  psvApp,
  daikinApp,
} from '../Core/URLs';
import SpiralIcon from '../Control/Icon/SpiralIcon';

export const HeaderCustom = ({
  iconLeft,
  iconMiddle,
  iconRight,
  leftFunc,
  middleFunc,
  rightFunc,
  title,
  subTitle,
  titleRight,
  countNotify,
  isHome = false,
  rightType,
  leftType,
  middleType,
  disabled,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  // Style Color
  let bgColorHeader = appcolor.primary;
  switch (AppNameBuild) {
    case bekoApp:
      bgColorHeader = appcolor.homebackground;
      break;
    case daikinApp:
    case psvApp:
      bgColorHeader = appcolor.light;
      break;
    default:
      bgColorHeader = appcolor.primary;
      break;
  }
  let colorContent = CONTENT_COLOR;
  switch (AppNameBuild) {
    case daikinApp:
    case bekoApp:
    case psvApp:
      colorContent = isHome ? appcolor.dark : appcolor.light;
      break;
    default:
      colorContent = CONTENT_COLOR;
      break;
  }
  let bgColorBadgeMessage = appcolor.danger;
  switch (AppNameBuild) {
    case mitsuApp:
    case demoApp:
    case hafeleApp:
      bgColorBadgeMessage = appcolor.light;
      break;
    case artApp:
      bgColorBadgeMessage = appcolor.light;
      break;
    default:
      bgColorBadgeMessage = appcolor.danger;
      break;
  }
  //
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      backgroundColor: isHome ? bgColorHeader : DEFAULT_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 52,
      paddingVertical: 4,
      position: 'relative',
      zIndex: 1000,
      elevation: 12,
    },
    headerRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftView: {
      width: '20%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: 8,
    },
    leftAction: { padding: 10, paddingRight: 15, borderRadius: 20, width: 45 },
    middleView: {
      width: '60%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    middleAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleMiddle: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: colorContent,
    },
    subTitleMiddle: {
      textAlign: 'center',
      fontSize: 12,
      color: colorContent,
      fontStyle: 'italic',
    },
    rightView: {
      width: '20%',
      display: 'flex',
      paddingRight: 12,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    rightAction: {
      position: 'relative',
      padding: 10,
      paddingLeft: 15,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleRight: {
      color: appcolor.dark,
      fontSize: 15,
      fontWeight: fontWeightBold,
    },
    badgeContainer: { position: 'absolute', top: -8, right: -16 },
    badgeStyle: {
      width: 25,
      borderRadius: 25,
      backgroundColor: bgColorBadgeMessage,
      borderColor: bgColorBadgeMessage,
    },
    badgeTextStyle: { fontSize: 9, color: appcolor.light },
  });

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.leftView}>
          {typeof leftFunc === 'function' && (
            <TouchableOpacity onPress={leftFunc} style={styles.leftAction}>
              <SpiralIcon
                name={iconLeft || 'chevron-left'}
                size={21}
                type={leftType || 'font-awesome-5'}
                color={colorContent}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.middleView}>
          {typeof middleFunc === 'function' ? (
            <TouchableOpacity onPress={middleFunc} style={styles.middleAction}>
              {iconMiddle && (
                <SpiralIcon
                  name={iconMiddle}
                  type={middleType || 'font-awesome-5'}
                  size={20}
                  style={{ marginEnd: 4 }}
                  color={colorContent}
                />
              )}
              <Text style={styles.titleMiddle}>{title}</Text>
            </TouchableOpacity>
          ) : (
            title && (
              <Text numberOfLines={2} style={styles.titleMiddle}>
                {title}
              </Text>
            )
          )}
          {(subTitle || null) !== null && (
            <Text style={styles.subTitleMiddle}>{subTitle}</Text>
          )}
        </View>
        <View style={styles.rightView}>
          {typeof rightFunc === 'function' && (
            <TouchableOpacity
              disabled={disabled}
              onPress={rightFunc}
              style={styles.rightAction}
            >
              {
                <View>
                  {typeof iconRight === 'string' && (
                    <SpiralIcon
                      size={21}
                      type={rightType || 'font-awesome-5'}
                      name={iconRight}
                      color={colorContent}
                    />
                  )}
                  {typeof iconRight === 'string' && countNotify > 0 && (
                    <Badge
                      status="error"
                      value={countNotify > 99 ? '99+' : countNotify}
                      textStyle={styles.badgeTextStyle}
                      badgeStyle={styles.badgeStyle}
                      containerStyle={styles.badgeContainer}
                      onPress={rightFunc}
                    />
                  )}
                </View>
              }

              {typeof titleRight === 'string' && (
                <Text style={styles.titleRight}>{titleRight}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
