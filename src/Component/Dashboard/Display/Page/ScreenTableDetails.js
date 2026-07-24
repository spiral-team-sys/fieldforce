import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import _ from 'lodash';

export const ScreenTableDetails = ({ data, groupName }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    const _data = _.filter(
      data,
      e => groupName !== null && e.GroupView == groupName,
    );
    await setMutate(e => !e);
    await setDataMain(_data);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [data, groupName]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      margin: 8,
      borderRadius: 5,
      overflow: 'hidden',
    },
    contentTableView: { width: '100%', minHeight: 50 },
    itemMain: { flexDirection: 'row', justifyContent: 'center' },
    headerMain: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 1,
    },
    itemHeaderView: {
      width: '20%',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      marginHorizontal: 0.5,
    },
    itemView: {
      width: '20%',
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      marginHorizontal: 0.5,
    },
    titleGroup: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      padding: 8,
    },
    titleValue: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
    viewTitlte: { width: '100%', flexDirection: 'row', alignItems: 'center' },
    titleTableView: {
      width: '70%',
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
      fontStyle: 'italic',
    },
  });
  const renderHeader = () => {
    const itemHeader = data[0] || {};
    return (
      <View style={styles.headerMain}>
        <View style={styles.itemHeaderView}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleGroup || 'Group'}
          </Text>
        </View>
        <View style={{ ...styles.itemHeaderView, width: '40%' }}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleModel || 'Model'}
          </Text>
        </View>
        <View style={{ ...styles.itemHeaderView, width: '20%' }}>
          <Text style={styles.titleGroup}>{itemHeader.TitlePW || 'PW'}</Text>
        </View>
        <View style={{ ...styles.itemHeaderView, width: '20%' }}>
          <Text style={styles.titleGroup}>
            {itemHeader.TitleCW || 'Latest'}
          </Text>
        </View>
      </View>
    );
  };
  const renderItemTotal = () => {
    const _sumCWTotal = _.sumBy(dataMain, 'CurrentDisplay');
    const _sumPWTotal = _.sumBy(dataMain, 'PastDisplay');
    return (
      <View style={styles.itemMain}>
        <View
          style={{ ...styles.itemView, backgroundColor: appcolor.grayLight }}
        >
          <Text style={styles.titleValue}>Total</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '40%',
            backgroundColor: appcolor.grayLight,
          }}
        >
          <Text style={styles.titleValue}>Total</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: appcolor.grayLight,
          }}
        >
          <Text style={styles.titleValue}>{_sumPWTotal}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: appcolor.grayLight,
          }}
        >
          <Text style={styles.titleValue}>{_sumCWTotal}</Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const backgroundColor =
      index % 2 == 0 ? appcolor.surface : appcolor.grayLight;
    return (
      <View key={`stb_item${index}`} style={styles.itemMain}>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.GroupName || '-'}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '40%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.ProductName || '-'}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.PastDisplay}</Text>
        </View>
        <View
          style={{
            ...styles.itemView,
            width: '20%',
            backgroundColor: backgroundColor,
          }}
        >
          <Text style={styles.titleValue}>{item.CurrentDisplay}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewTitlte}>
        <Text style={styles.titleTableView}>Danh sách SKU thay đổi</Text>
      </View>
      <View style={styles.contentTableView}>
        {renderHeader()}
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataMain}
          extraData={[dataMain, _mutate]}
          estimatedItemSize={50}
          renderItem={renderItem}
          ListHeaderComponent={renderItemTotal()}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      </View>
    </View>
  );
};
