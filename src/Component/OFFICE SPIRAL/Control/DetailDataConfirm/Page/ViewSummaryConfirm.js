import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { deviceWidth } from '../../../../../Core/Utility';
import { useSelector } from 'react-redux';
import _ from 'lodash';

export const ViewSummaryConfirm = ({
  itemMain,
  dataSummary,
  actionSelected,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);

  const LoadData = () => {
    setDataMain(dataSummary);
  };

  const handlerConfirmItem = (item, itemMain) => {
    actionSelected(item, itemMain);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataSummary]);

  const styles = StyleSheet.create({
    itemMain: {
      width: deviceWidth / 4.5,
      padding: 8,
      alignSelf: 'center',
      alignItems: 'center',
    },
    subTitleView: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    titleChangeType: {
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
    },
    titleChangeValue: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
  });

  return (
    dataMain !== null &&
    dataMain.length > 0 &&
    dataMain.map((item, index) => {
      const dataConfirm = item.DataConfirm || [];
      const onSelected = () => {
        handlerConfirmItem(item, itemMain);
      };
      return (
        <TouchableOpacity key={`item_emp_${index}`} onPress={onSelected}>
          <Text
            style={styles.subTitleView}
          >{`${item.EmployeeCode} - ${item.EmployeeName}`}</Text>
          <SummaryByEmployee data={dataConfirm} styles={styles} />
        </TouchableOpacity>
      );
    })
  );
};
const SummaryByEmployee = ({ data, styles }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  return (
    <ScrollView
      contentContainerStyle={{ width: '100%', justifyContent: 'center' }}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
    >
      {data !== null &&
        data.length > 0 &&
        data.map((item, index) => {
          return (
            <View key={`item_emp_${index}`} style={styles.itemMain}>
              <SpiralIcon
                name={item.IconStatus}
                size={21}
                color={appcolor[item.ColorStatus]}
              />
              <Text style={styles.titleChangeType}>{item.TitleTypeChange}</Text>
              <Text style={styles.titleChangeValue}>{item.ChangeValue}</Text>
            </View>
          );
        })}
    </ScrollView>
  );
};
