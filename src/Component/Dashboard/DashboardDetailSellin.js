import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { formatNumber, groupDataByKey } from '../../Core/Helper';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { Badge } from '@rneui/base';
import { scaleSize } from '../../Themes/AppsStyle';

export const DashboardDetailSellin = ({ title, dataSellIn, onClose }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [data, setData] = useState([]);

  const LoadData = async () => {
    const { arr } = await groupDataByKey({
      arr: dataSellIn,
      key: 'DealerId',
      keyLayer2: 'Date',
    });
    await setData(arr);
  };
  const renderItem = ({ item, index }) => {
    const keyLayer2 = `${item.DealerId}${item.Date}`;
    return (
      <View key={index} style={styles.itemContainer}>
        {item.isParent && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: appcolor.secondary,
              padding: 5,
              borderRadius: 5,
              marginBottom: 8,
            }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="warehouse"
              color={appcolor.light}
              size={16}
              style={{ marginEnd: 8 }}
            />
            <Text style={styles.titleHead}>
              Nhà phân phối: {item.DealerName}
            </Text>
          </View>
        )}
        {item[keyLayer2] && <Text style={styles.titleSecond}>{item.Date}</Text>}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Badge
            containerStyle={{ alignSelf: 'center' }}
            status={appcolor.red}
            textStyle={{
              fontSize: 15,
              fontWeight: '500',
              color: appcolor.black,
              fontWeight: '700',
            }}
            badgeStyle={{
              backgroundColor: appcolor.yellowdark,
              borderColor: appcolor.yellowdark,
              height: 28,
              width: 28,
              borderRadius: 20,
            }}
            value={item.OrderValue}
          />
          <View style={styles.itemStyle} key={index}>
            <Text style={styles.itemText}>Cửa hàng: {item.ShopName}</Text>
            <Text style={styles.itemText}>Số hoá đơn: {item.OrderNo}</Text>
            <Text style={styles.itemText}>Sản phẩm: {item.ProductName}</Text>
            {item.Price && (
              <Text style={styles.itemText}>
                Giá: {formatNumber(item.Price, ',')}
              </Text>
            )}
            {item.PriceNPP && (
              <Text style={styles.itemText}>
                Giá NPP: {formatNumber(item.PriceNPP, ',')}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    LoadData();
    return () => false;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: { flex: 1, paddingBottom: 8, alignItems: 'center' },
    itemStyle: {
      alignSelf: 'center',
      width: '90%',
      borderRadius: 8,
      margin: 3,
      padding: 5,
      backgroundColor: appcolor.surface,
    },
    titleHead: {
      flex: 1,
      fontSize: 15,
      fontWeight: 'bold',
      color: appcolor.light,
    },
    itemText: { color: appcolor.dark, fontSize: 14, fontWeight: '500' },
    titleSecond: {
      width: '100%',
      color: appcolor.tomato,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 5,
      marginEnd: 32,
      textAlign: 'right',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView
        style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: appcolor.primary,
          padding: 5,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}
        >
          <SpiralIcon
            type="font-awesome-6"
            name={'times'}
            size={scaleSize(23)}
            solid={true}
            color={appcolor.white}
          />
        </TouchableOpacity>
        <Text
          style={{
            width: '80%',
            textAlign: 'center',
            fontSize: scaleSize(18),
            fontWeight: '700',
            padding: 5,
            color: appcolor.white,
          }}
        >
          {title}
        </Text>
      </SafeAreaView>
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          padding: 5,
          marginBottom: Platform.OS == 'ios' ? 8 : 0,
        }}
        keyExtractor={(_, index) => index.toString()}
        data={data}
        renderItem={renderItem}
      />
    </View>
  );
};
