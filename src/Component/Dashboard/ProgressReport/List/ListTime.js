import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, Text } from '@rneui/base';
import ActionSheet from 'react-native-actions-sheet';
import { YearMonthSelected } from '../../../../Control/YearMonthSelected';
import { useSelector } from 'react-redux';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ListTime = ({
  data,
  employee,
  filter,
  handlerGetData,
  onSelectEmployee,
  onSelectYear,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    mainContainer: { backgroundColor: appcolor.light },
    itemContainer: { marginBottom: 16 },
    viewListTime: { margin: 7, backgroundColor: appcolor.light },
    titleName: { padding: 7, fontSize: 12, color: appcolor.dark },
    viewBorder: {
      borderColor: appcolor.surface,
      borderWidth: 1,
      width: '100%',
    },
    buttonApply: {
      borderTopColor: appcolor.surface,
      borderTopWidth: 1,
      alignItems: 'center',
    },
    textApply: {
      color: appcolor.primary,
      padding: 8,
      marginBottom: 8,
      marginTop: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      onSelectEmployee(item);
    };
    return (
      <View
        key={`${index}`}
        style={[
          styles.viewListTime,
          {
            backgroundColor:
              employee.employeeId === item.employeeId
                ? appcolor.primary
                : appcolor.light,
          },
        ]}
      >
        <TouchableOpacity onPress={onPress}>
          <Text
            style={[
              styles.titleName,
              {
                color:
                  employee.employeeId === item.employeeId
                    ? appcolor.light
                    : appcolor.dark,
              },
            ]}
          >
            {item.employeeCode} {item.employeeName}
          </Text>
        </TouchableOpacity>
        <View style={styles.viewBorder} />
      </View>
    );
  };
  return (
    <ActionSheet
      containerStyle={StyleSheet.flatten([
        styles.mainContainer,
        { paddingBottom: insets.bottom },
      ])}
      id="sheetTime"
    >
      <ScrollView>
        <View style={styles.itemContainer}>
          <YearMonthSelected
            option={filter}
            onYearMonth={search => onSelectYear(search)}
            numMonth={4}
          />
          <CustomListView
            isBottomView={false}
            renderItem={renderItem}
            data={data}
          />
          <TouchableOpacity onPress={handlerGetData} style={styles.buttonApply}>
            <Text style={styles.textApply}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ActionSheet>
  );
};
export default ListTime;
