import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../../../Core/Helper';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

export const TableGroupData = ({
  data,
  titleActual,
  titleTarget,
  titlePercent,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataTable, setDataTable] = useState([]);
  //
  const LoadData = async () => {
    await setDataTable(data);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [data]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      backgroundColor: appcolor.light,
      padding: 8,
    },
    itemMain: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      borderRadius: 3,
      borderBottomColor: appcolor.greylight,
      marginTop: 1,
    },
    itemTitle: { width: '22%' },
    titleView: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      fontStyle: 'italic',
      textAlign: 'center',
      color: appcolor.greylight,
    },
    groupListData: { width: '100%' },
  });
  const renderHeader = () => {
    return (
      <View style={{ ...styles.itemMain, paddingBottom: 8, paddingTop: 0 }}>
        <View style={{ ...styles.itemTitle, width: '34%', paddingStart: 8 }} />
        <View style={styles.itemTitle}>
          <Text
            style={{
              ...styles.titleView,
              color: appcolor.success,
              fontSize: 13,
            }}
          >
            {titleActual || 'Actual'}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{ ...styles.titleView, color: appcolor.red, fontSize: 13 }}
          >
            {titleTarget || 'Target'}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{ ...styles.titleView, color: appcolor.info, fontSize: 13 }}
          >
            {titlePercent || 'Percent'}
          </Text>
        </View>
      </View>
    );
  };
  const itemView = (
    item,
    index,
    paddingValue,
    colorTitle,
    fontWeight,
    fontSize,
    colorValue,
    itemId,
  ) => {
    const _backgroudColor =
      item.groupOrder == 1
        ? appcolor.surface
        : item.groupOrder == 2
        ? appcolor.placeholderBody
        : appcolor.light;
    const _fontWeight = fontWeight || fontWeightBold;
    const _fontSize = fontSize || 14;
    return (
      <View
        key={`${itemId}_View_${index}`}
        style={{ ...styles.itemMain, backgroundColor: _backgroudColor }}
      >
        <View
          style={{
            ...styles.itemTitle,
            width: '34%',
            paddingStart: paddingValue || 8,
          }}
        >
          <Text
            style={{
              ...styles.titleView,
              textAlign: 'left',
              color: colorTitle || appcolor.dark,
              fontSize: fontSize || 15,
              fontWeight: fontWeight || 'bold',
            }}
          >
            {item.itemName}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{
              ...styles.titleView,
              color: colorValue || appcolor.success,
              fontWeight: _fontWeight,
              fontSize: _fontSize,
            }}
          >
            {item.actual > 0 ? formatNumber(item.actual, ',') : 0}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{
              ...styles.titleView,
              color: colorValue || appcolor.red,
              fontWeight: _fontWeight,
              fontSize: _fontSize,
            }}
          >
            {item.target > 0 ? formatNumber(item.target, ',') : 0}
          </Text>
        </View>
        <View style={styles.itemTitle}>
          <Text
            style={{
              ...styles.titleView,
              color: colorValue || appcolor.info,
              fontWeight: _fontWeight,
              fontSize: _fontSize,
            }}
          >{`${item.percentValue}%`}</Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const dataGroup = item.dataGroup || [];
    return (
      <View key={`${item.itemId}_td_${index}`}>
        {itemView(item, index)}
        <View style={styles.groupListData}>
          {dataGroup !== null &&
            dataGroup.length > 0 &&
            dataGroup.map((it, idx) => {
              const dataGroup2 = it.dataGroup || [];
              return (
                <View key={`${item.itemId}_Group_${idx}`}>
                  {itemView(
                    it,
                    idx,
                    20,
                    appcolor.dark,
                    fontWeightBold,
                    13,
                    appcolor.dark,
                  )}
                  <View style={styles.groupListData}>
                    {dataGroup2 !== null &&
                      dataGroup2.length > 0 &&
                      dataGroup2.map((it2, idx2) => {
                        return itemView(
                          it2,
                          idx2,
                          40,
                          appcolor.greylight,
                          '500',
                          13,
                          appcolor.greylight,
                          item.itemId,
                        );
                      })}
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {renderHeader()}
      <FlashList
        keyExtractor={(item, _index) => item.itemId.toString()}
        estimatedItemSize={80}
        data={dataTable}
        extraData={[dataTable]}
        renderItem={renderItem}
        drawDistance={dataTable.length * 100}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
