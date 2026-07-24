import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { formatNumber } from '../../../Core/Helper';
import { CostItemView } from './CostItemView';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import moment from 'moment';

export const ViewResultGSV = ({ tripResult }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    contentView: {
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
      padding: 8,
      margin: 8,
      borderRadius: 10,
    },
    titleDateLine: {
      paddingStart: 8,
      paddingTop: 8,
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.dark,
    },
    titleBodyLine: {
      paddingStart: 8,
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.greylight,
    },
    lineView: {
      width: 1,
      height: '85%',
      backgroundColor: appcolor.bluenavylight,
      alignItems: 'center',
      alignSelf: 'center',
      marginEnd: 8,
    },
    costView: {
      backgroundColor: appcolor.light,
      padding: 8,
      borderRadius: 5,
      margin: 5,
    },
    itemCost: { fontSize: 13, fontWeight: '400' },
  });
  return (
    <View style={styles.contentView}>
      <Text
        style={{
          paddingTop: 8,
          fontSize: 13,
          fontWeight: '500',
          color: appcolor.tomato,
          position: 'absolute',
          marginStart: 12,
          alignSelf: 'center',
        }}
      >
        {`${tripResult.dayValue}N ${tripResult.nightValue}Đ`}
      </Text>
      <View
        style={{ width: deviceWidth / 8, alignItems: 'center', marginEnd: 8 }}
      >
        <Text style={styles.titleDateLine}>{`${moment(
          tripResult.dateFilterFrom,
          'DD/MM/YYYY',
        ).format('DD MMM')}`}</Text>
        <Text
          style={{ ...styles.titleDateLine, position: 'absolute', bottom: 14 }}
        >{`${moment(tripResult.dateFilterTo, 'DD/MM/YYYY').format(
          'DD MMM',
        )}`}</Text>
      </View>
      <View style={styles.lineView}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 50,
            borderWidth: 0.5,
            borderColor: appcolor.info,
            backgroundColor: appcolor.light,
          }}
        />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 50,
            backgroundColor: appcolor.info,
            bottom: 0,
            position: 'absolute',
          }}
        />
      </View>
      <View style={{ width: deviceWidth / 1.4 }}>
        <Text style={styles.titleDateLine}>{`${tripResult.provinceFrom}`}</Text>
        {/* <Text style={styles.titleBodyLine}>{`${tripResult.addressFrom}`}</Text> */}
        <View style={styles.costView}>
          <Text style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600' }}>
            {`Tổng chi phí: ${
              tripResult.totalSupport !== 0
                ? formatNumber(tripResult.totalSupport, ',')
                : 0
            } VNĐ`}
          </Text>
          <View
            style={{
              width: '100%',
              height: 0.5,
              backgroundColor: appcolor.greylight,
              marginTop: 5,
              marginBottom: 5,
            }}
          />
          <CostItemView
            title="Ăn uống"
            name={tripResult.supportLunch}
            iconName="utensils"
          />
          <CostItemView
            title="Khách sạn"
            name={tripResult.supportNight}
            iconName="hotel"
          />
          {/* <CostItemView title='Di chuyển' name={tripResult.totalKM} iconName='car' /> */}
          <CostItemView
            title={`Di chuyển`}
            name={`${tripResult.supportKM}`}
            iconName="road"
          />
          <CostItemView
            title={`Thuê xe`}
            name={`${tripResult.supportVehical}`}
            iconName="road"
          />

          {/* <View style={{ width: '100%', height: 0.5, backgroundColor: appcolor.greylight, marginTop: 5, marginBottom: 8 }} /> */}
          {/* <Text style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600', color: appcolor.tomato }}>
                            {`Hạn mức còn lại: ${formatNumber(tripResult.moneyLimit - tripResult.totalSupport, ',')} VNĐ`}
                        </Text> */}
        </View>
        <View>
          <Text style={styles.titleDateLine}>{`${tripResult.provinceTo}`}</Text>
          {/* <Text style={styles.titleBodyLine}>{`${tripResult.addressTo}`}</Text> */}
        </View>
      </View>
    </View>
  );
};
