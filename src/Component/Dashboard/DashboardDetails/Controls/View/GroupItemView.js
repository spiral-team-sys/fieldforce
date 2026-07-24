import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { deviceHeight } from '../../../../../Core/Utility';
import { SubGroupItemView } from './SubGroupItemView';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import _ from 'lodash';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

export const GroupItemView = ({ dataMain, reload }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const flashRef = useRef();
  //
  const LoadData = async () => {
    await setData(dataMain);
    if (dataMain && dataMain.length > 0)
      await flashRef?.current?.scrollToIndex({ index: 0, animated: true });
  };
  // Handler
  const onShopGroup = async item => {
    const listUpdate = _.map(data, e => {
      const choose = e.g1 == item.g1 && item.isChoose == 0 ? 1 : 0;
      return { ...e, isChoose: choose };
    });
    await setData(listUpdate);
  };
  const scrollToIndexMain = async indexMain => {
    await flashRef.current.scrollToIndex({ index: indexMain, animated: true });
  };
  //
  useEffect(() => {
    const _load = LoadData();
    const _scrollToItem = DeviceEventEmitter.addListener(
      'SCROLL_TO_ITEM',
      scrollToIndexMain,
    );
    return () => {
      _load;
      _scrollToItem.remove();
    };
  }, [dataMain]);
  // View
  const styles = StyleSheet.create({
    viewItemContentMain: { width: '100%' },
    itemMain: {
      width: '100%',
      padding: 8,
      borderRadius: 5,
      shadowOpacity: 0.5,
      elevation: 3,
      backgroundColor: appcolor.light,
      shadowOffset: { width: 3, height: 0 },
      shadowColor: appcolor.darkt,
      marginBottom: 4,
      marginTop: 4,
    },
    titleGroupHead: {
      width: '100%',
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: Platform.OS == 'ios' ? '600' : '700',
    },
    titleSubGroupHead: {
      width: '100%',
      fontSize: 12,
      color: appcolor.greylight,
      fontWeight: '500',
    },
    titleContentValue: {
      fontSize: 13,
      color: appcolor.greylight,
      fontWeight: '500',
    },
    viewHead: { width: '100%', flexDirection: 'row', alignItems: 'center' },
    viewSummary: { width: '92%' },
    subView: { width: '100%', paddingHorizontal: 8 },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      scrollToIndexMain(index);
      onShopGroup(item);
    };
    const subList = item.DataSubGroup || JSON.parse(item.dataSubGroup || '[]');
    return (
      <View key={`${index}_ig1`} style={styles.viewItemContentMain}>
        <TouchableOpacity style={styles.itemMain} onPress={onPress}>
          <View style={styles.viewHead}>
            <SpiralIcon
              type="ionicon"
              name={item.iconG1}
              size={18}
              color={appcolor.blacklight}
              style={{ paddingEnd: 8 }}
            />
            <View style={styles.viewSummary}>
              <Text style={styles.titleGroupHead}>{item.n1}</Text>
              {item.subn1 && (
                <Text style={styles.titleSubGroupHead}>{item.subn1}</Text>
              )}
              {item.totalSaleValue && (
                <Text style={styles.titleContentValue}>
                  {item.totalSaleValue}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {item.isChoose == 1 && (
          <View style={styles.subView}>
            <SubGroupItemView
              key={`sublist_${item.g1}_${index}`}
              dataMain={subList}
              indexMain={index}
            />
          </View>
        )}
      </View>
    );
  };
  return (
    <CustomListView
      ref={flashRef}
      data={data}
      extraData={data}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 5 }}
      onRefresh={reload}
      isRefresh={false}
      bottomView={{ paddingBottom: deviceHeight / 10 }}
      endView={{ paddingBottom: deviceHeight / 10 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
