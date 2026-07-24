import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';

export const FilterByTag = ({ tagValue, actionResult }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemTag, setItemTag] = useState(null);

  const LoadTag = () => {
    setItemTag(tagValue || 'Dealer');
  };

  const onDealerTag = () => {
    setItemTag('Dealer');
    actionResult('Dealer');
  };
  const onStoreTag = () => {
    setItemTag('Store');
    actionResult('Store');
  };
  const onWorkDateTag = () => {
    setItemTag('WorkDate');
    actionResult('WorkDate');
  };
  const onEmployeeTag = () => {
    setItemTag('Employee');
    actionResult('Employee');
  };

  useEffect(() => {
    const _load = LoadTag();
    return () => _load;
  }, [tagValue]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', padding: 8 },
    titleHead: {
      fontSize: 14,
      color: appcolor.greylight,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
    },
    titleButton: {
      minWidth: 60,
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      textAlign: 'center',
    },
    titleButtonSelect: {
      minWidth: 60,
      fontSize: 13,
      color: appcolor.light,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
      textAlign: 'center',
    },
    viewAction: { width: '100%', flexDirection: 'row', paddingTop: 8 },
    viewButton: {
      padding: 8,
      borderRadius: 5,
      shadowOpacity: 0.5,
      elevation: 3,
      backgroundColor: appcolor.light,
      marginEnd: 8,
    },
    viewButtonSelect: {
      padding: 8,
      borderRadius: 5,
      shadowOpacity: 0.5,
      elevation: 3,
      backgroundColor: appcolor.primary,
      marginEnd: 8,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.titleHead}>Xem theo</Text>
      <View style={styles.viewAction}>
        <TouchableOpacity
          style={
            itemTag == 'Dealer' ? styles.viewButtonSelect : styles.viewButton
          }
          onPress={onDealerTag}
        >
          <Text
            style={
              itemTag == 'Dealer'
                ? styles.titleButtonSelect
                : styles.titleButton
            }
          >
            Nhà phân phối
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            itemTag == 'Store' ? styles.viewButtonSelect : styles.viewButton
          }
          onPress={onStoreTag}
        >
          <Text
            style={
              itemTag == 'Store' ? styles.titleButtonSelect : styles.titleButton
            }
          >
            Cửa hàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            itemTag == 'WorkDate' ? styles.viewButtonSelect : styles.viewButton
          }
          onPress={onWorkDateTag}
        >
          <Text
            style={
              itemTag == 'WorkDate'
                ? styles.titleButtonSelect
                : styles.titleButton
            }
          >
            Ngày
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            itemTag == 'Employee' ? styles.viewButtonSelect : styles.viewButton
          }
          onPress={onEmployeeTag}
        >
          <Text
            style={
              itemTag == 'Employee'
                ? styles.titleButtonSelect
                : styles.titleButton
            }
          >
            Nhân viên
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
