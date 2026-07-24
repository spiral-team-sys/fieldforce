import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';

import CustomListView from '../../../../../Control/Custom/CustomListView';
import OTTimeItem from '../Items/OTTimeItem';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const OTTimeSelector = ({
  appcolor,
  data,
  disabled,
  onSelect,
  selectedItem,
  selectedTime,
}) => {
  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  const renderItem = useCallback(
    ({ item }) => {
      const isSelected =
        selectedItem.listCode == item.listCode &&
        selectedItem.code == item.code;

      return (
        <OTTimeItem
          appcolor={appcolor}
          disabled={disabled}
          isSelected={isSelected}
          item={item}
          onSelect={onSelect}
        />
      );
    },
    [appcolor, disabled, onSelect, selectedItem],
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyBox}>
        <SpiralIcon
          name="clock"
          type="font-awesome-5"
          size={16}
          color={appcolor.greylight}
        />
        <Text style={styles.emptyText}>Không có dữ liệu thời gian tăng ca</Text>
      </View>
    ),
    [appcolor, styles],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chọn thời gian</Text>
        {selectedTime > 0 && (
          <Text style={styles.sectionHint}>Đang chọn {selectedTime}h</Text>
        )}
      </View>
      <CustomListView
        horizontal
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        data={data}
        extraData={selectedItem}
        ListEmpty={listEmpty}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    section: {
      marginBottom: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      flex: 1,
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '700',
    },
    sectionHint: {
      color: appcolor.greylight,
      fontSize: 11,
      fontWeight: '500',
    },
    listContainer: {
      // FlashList horizontal needs a stable cross-axis size to measure in this form.
      flex: 0,
      alignSelf: 'stretch',
      minHeight: 62,
    },
    listContent: {
      paddingRight: 12,
    },
    emptyBox: {
      alignSelf: 'stretch',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: appcolor.surface,
      backgroundColor: appcolor.light,
      paddingHorizontal: 12,
      paddingVertical: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
      textAlign: 'center',
    },
  });

export default memo(OTTimeSelector);
