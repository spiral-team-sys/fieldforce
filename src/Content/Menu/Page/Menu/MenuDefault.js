import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { deviceWidth } from '../../../../Core/Utility';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import CustomListView from '../../../../Control/Custom/CustomListView';
import _ from 'lodash';

const MenuDefault = ({ menus = [], onPress, onRefresh }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const cardGap = 6;
  const horizontalPadding = 12;
  const cardWidth = (deviceWidth - horizontalPadding * 2 - cardGap * 2) / 3.2;
  //
  const { flatData, stickyHeaderIndices } = useMemo(() => {
    const groups = _.groupBy(menus, 'groupReport');
    const data = [];
    const indices = [];
    Object.keys(groups).forEach(key => {
      if (key !== null && key !== undefined) {
        indices.push(data.length);
        data.push({ type: 'header', title: key });
      }
      _.chunk(groups[key], 3).forEach(rowItems => {
        data.push({ type: 'row', items: rowItems });
      });
    });
    return { flatData: data, stickyHeaderIndices: indices };
  }, [menus]);

  const styles = StyleSheet.create({
    sectionHeader: {
      marginTop: 4,
      marginHorizontal: horizontalPadding,
      padding: 8,
      backgroundColor: appcolor.primary + '12',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: appcolor.primary,
    },
    sectionHeaderText: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    rowContent: {
      flexDirection: 'row',
      padding: 8,
      justifyContent: 'space-between',
    },
    itemMain: {
      width: cardWidth,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      marginBottom: 0,
      marginTop: 0,
      padding: 8,
      borderRadius: 12,
      borderColor: appcolor.surface,
      overflow: 'hidden',
    },
    itemContent: { flex: 1, alignItems: 'center' },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 44,
      backgroundColor: appcolor.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    iconStyle: {
      shadowColor: appcolor.light,
      shadowOpacity: 0.6,
      shadowOffset: { width: 0, height: 3 },
    },
    titleName: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      width: '100%',
      textAlign: 'center',
    },
    subTitleName: {
      fontSize: 10,
      fontWeight: '400',
      color: appcolor.placeholderText,
      width: '100%',
      textAlign: 'center',
    },
    itemEmpty: { width: cardWidth },
  });

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }
    return (
      <View style={styles.rowContent}>
        {item.items.map(menuItem => (
          <TouchableOpacity
            key={String(menuItem.id)}
            style={styles.itemMain}
            onPress={() => onPress(menuItem)}
          >
            <View style={styles.itemContent}>
              <View style={styles.iconContainer}>
                <SpiralIcon
                  color={appcolor.primary}
                  name={menuItem.iconName}
                  type={menuItem.iconType || 'fontawesome'}
                  style={styles.iconStyle}
                  size={22}
                />
              </View>
              <Text style={styles.subTitleName}>{menuItem.menuName}</Text>
              <Text style={styles.titleName}>{menuItem.menuNameVN}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {item.items.length < 3 &&
          _.times(3 - item.items.length, idx => (
            <View key={`empty-${idx}`} style={styles.itemEmpty} />
          ))}
      </View>
    );
  };

  return (
    <CustomListView
      data={flatData}
      renderItem={renderItem}
      stickyHeaderIndices={stickyHeaderIndices}
      onRefresh={onRefresh}
      bottomView={{ paddingBottom: 0 }}
    />
  );
};

export default MenuDefault;
