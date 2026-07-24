import React, { useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { formatNumber } from '../../../Core/Helper';
import { CostItemView } from './CostItemView';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import moment from 'moment';
import { TouchableOpacity } from 'react-native';

export const ViewResultHafele = ({ tripResult }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [showStage, setShowStage] = useState();
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

  const addressTo =
    tripResult.provinceList[tripResult.provinceList.length - 1]?.addressPoint ||
    '';
  const onPressStage = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowStage(e => !e);
  };

  return (
    <View style={{ width: deviceWidth, padding: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tripResult.provinceList !== undefined &&
          tripResult.provinceList.length > 0 &&
          tripResult.provinceList.map((item, index) => {
            return (
              <Text
                key={`12qq_${index}`}
                style={{
                  ...styles.titleDateLine,
                  color: appcolor.info,
                  fontSize: 15,
                }}
              >
                {`${index > 0 ? '- ' : ''} ${item.provinceName} (${
                  item.numberDay
                })`}
              </Text>
            );
          })}
      </ScrollView>
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
          {`${tripResult.nightValue}Đ`}
        </Text>
        <View
          style={{ width: deviceWidth / 8, alignItems: 'center', marginEnd: 8 }}
        >
          <Text style={styles.titleDateLine}>{`${moment(
            tripResult.dateFilterFrom,
            'DD/MM/YYYY',
          ).format('DD MMM')}`}</Text>
          <Text
            style={{
              ...styles.titleDateLine,
              position: 'absolute',
              bottom: 14,
            }}
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
          <View style={styles.costView}>
            <Text
              style={{ ...styles.itemCost, fontSize: 14, fontWeight: '600' }}
            >
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
            <View style={{ width: '100%', height: 0.5, padding: 8 }} />
            <CostItemView
              title={`Số KM di chuyển`}
              name={`${tripResult.kmValue}`}
              unitTitle={'KM'}
              iconName="road"
            />
            <CostItemView
              title={`Di chuyển KM`}
              name={`${tripResult.supportKM}`}
              iconName="road"
            />
            <CostItemView
              title="Khách sạn"
              name={tripResult.supportNight}
              iconName="hotel"
            />
            <View style={{ width: '100%', height: 0.5, padding: 8 }} />
          </View>
          <View>
            <Text style={styles.titleDateLine}>{`${
              tripResult.addressTo || addressTo
            }`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
