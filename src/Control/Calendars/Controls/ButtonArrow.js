import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import SpiralIcon from '../../Icon/SpiralIcon';

export const ButtonArrow = ({
  iconName,
  colorIcon,
  sizeView,
  type,
  handlerPress,
  styleMain,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  const onPressButton = () => {
    handlerPress(type);
  };

  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainerDefault: {
      width: sizeView || 38,
      height: sizeView || 38,
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    mainButtonAction: { backgroundColor: 'transparent' },
  });

  return (
    <TouchableOpacity
      style={styleMain || styles.mainButtonAction}
      onPress={onPressButton}
    >
      <View style={styles.mainContainerDefault}>
        {iconName && (
          <SpiralIcon
            type="ionicon"
            name={iconName}
            size={18}
            color={colorIcon || appcolor.dark}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
