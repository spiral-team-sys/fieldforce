import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import AttendantItem from './AttendantItem';

const fieldMap = {
  EMPLOYEE: {
    fieldName: 'employeeName',
    iconName: 'user',
    title: 'Nhân viên: ',
  },
  SHOP: { fieldName: 'shopName', iconName: 'store', title: 'Cửa hàng: ' },
  POSITION: { fieldName: 'typeName', iconName: 'user-tie', title: 'Chức vụ: ' },
};

const AttendantGroup = memo(({ item, groupType, onShowPhoto }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { fieldName, iconName, title } =
    fieldMap[groupType] || fieldMap['EMPLOYEE'];

  const sortedItems = useMemo(() => {
    return [...item.dataByType]
      .map(i => ({ ...i, _photoCount: JSON.parse(i.photoList || '[]').length }))
      .sort((a, b) => b._photoCount - a._photoCount);
  }, [item.dataByType]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        groupCard: {
          flex: 1,
          backgroundColor: appcolor.light,
          margin: 8,
          borderWidth: 1,
          borderColor: appcolor.primary + '15',
          borderRadius: 8,
          overflow: 'hidden',
        },
        titleContainer: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
          backgroundColor: appcolor.primary + '15',
        },
        groupIcon: { color: appcolor.primary, paddingEnd: 8 },
        groupTitle: {
          width: '95%',
          color: appcolor.primary,
          fontSize: 13,
          fontWeight: fontWeightBold,
        },
      }),
    [appcolor],
  );

  const renderSubItem = useCallback(
    ({ item: subItem, index }) => (
      <AttendantItem
        item={subItem}
        index={index}
        groupType={groupType}
        onShowPhoto={onShowPhoto}
      />
    ),
    [groupType, onShowPhoto],
  );

  return (
    <View style={styles.groupCard}>
      <View style={styles.titleContainer}>
        <SpiralIcon
          type="font-awesome-6"
          solid
          name={iconName}
          size={16}
          style={styles.groupIcon}
        />
        <Text style={styles.groupTitle}>
          {title} {item[fieldName]}
        </Text>
      </View>
      <CustomListView
        data={sortedItems}
        renderItem={renderSubItem}
        bottomView={{ paddingBottom: 0 }}
        scrollEnabled={false}
      />
    </View>
  );
});

export default AttendantGroup;
