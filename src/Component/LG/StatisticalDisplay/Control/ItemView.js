import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const ItemView = ({
  iconName,
  title,
  isTitle = false,
  contentStyle,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    return () => {
      isMounted = false;
    };
  }, []);

  const styles = StyleSheet.create({
    viewTitle: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },
    titleName: {
      width: '90%',
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    contentName: {
      width: '90%',
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
    },
  });

  if ((title || null) == null) return null;
  return (
    <View style={[styles.viewTitle, contentStyle]}>
      {iconName && (
        <SpiralIcon
          solid
          type="font-awesome-5"
          name={iconName}
          size={16}
          color={appcolor.primary}
          style={{ width: 24, marginEnd: 5 }}
        />
      )}
      {title && (
        <Text style={isTitle ? styles.titleName : styles.contentName}>
          {title}
        </Text>
      )}
    </View>
  );
};
