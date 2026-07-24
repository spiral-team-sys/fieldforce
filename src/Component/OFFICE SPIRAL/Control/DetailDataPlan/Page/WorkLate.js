import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth, fontWeightBold } from '../../../../../Themes/AppsStyle';
import { BORDER_WIDTH } from '../../UtilityOffice';

export const WorkLate = ({ dataDetail, itemMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemData, setItemData] = useState({});

  const LoadData = () => {
    setItemData(dataDetail[0] || {});
  };

  useEffect(() => {
    const _itemdata = LoadData();
    return () => _itemdata;
  }, [dataDetail]);

  const styles = StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      width: deviceWidth - 32,
      backgroundColor: appcolor.light,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.greylight,
      paddingTop: 8,
      paddingBottom: 8,
    },
    lineStartView: {
      width: 5,
      minHeight: 50,
      backgroundColor:
        (itemData?.WPLateConfirm || 0) == 0
          ? appcolor.yellowdark
          : appcolor[itemData.colorStatusName],
    },
    contentSummary: { minHeight: 80, marginStart: 8, justifyContent: 'center' },
    titleSummary: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      marginBottom: 3,
    },
    descriptionSummary: {
      fontSize: 12,
      fontWeight: '400',
      color: appcolor.greylight,
      marginTop: 2,
    },
    viewStatus: {
      position: 'absolute',
      end: 8,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View style={styles.lineStartView} />
      <View style={styles.contentSummary}>
        <Text style={styles.titleSummary}>{itemMain.titlePage}</Text>
        {/* // Description */}
        {itemData.WPLate && (
          <Text
            style={styles.descriptionSummary}
          >{`Thời gian: ${itemData.WPLate}`}</Text>
        )}
        {itemData.WPLateNote && (
          <Text style={styles.descriptionSummary}>
            {itemData.WPLateNote || ''}
          </Text>
        )}
        {/* // Status Confirm */}
        {itemData.WPLateConfirmNote !== null &&
          itemData.WPLateConfirmNote !== undefined && (
            <Text
              style={styles.descriptionSummary}
            >{`QL ghi chú: ${itemData.WPLateConfirmNote}`}</Text>
          )}
      </View>
      <View style={styles.viewStatus}>
        <View
          style={{
            backgroundColor: appcolor[itemData.colorStatusName],
            borderRadius: 20,
            padding: 5,
            overflow: 'hidden',
          }}
        >
          <SpiralIcon
            name={itemData.iconStatusName}
            size={18}
            color={
              (itemData?.WPLateConfirm || null) !== null
                ? appcolor.light
                : appcolor.dark
            }
          />
        </View>
      </View>
    </View>
  );
};
