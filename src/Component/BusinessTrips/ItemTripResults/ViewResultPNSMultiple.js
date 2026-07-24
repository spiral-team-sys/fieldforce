import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { formatNumber } from '../../../Core/Helper';
import { CostItemView } from './CostItemView';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import moment from 'moment';

export const ViewResultPNSMultiple = ({ tripResult }) => {
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
          <Text
            style={styles.titleDateLine}
          >{`${tripResult.addressFrom}`}</Text>
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
            {tripResult.kmValue > 0 ? (
              <CostItemView
                title={`Di chuyển ${tripResult.kmValue}km -`}
                name={`${tripResult.supportKM}`}
                iconName="road"
              />
            ) : (
              // <CostItemView  title={`Di chuyển`} name={`${tripResult.supportKM}`} iconName='road' />
              <CostItemView
                title={`Ngày di chuyển`}
                name={`${tripResult.daysMove} / ${formatNumber(
                  tripResult.daysMove * 250000,
                  ',',
                )} VNĐ`}
                iconName="road"
                isUnit={false}
                isFormat={false}
              />
            )}
            {/* <CostItemView  title='Nghỉ qua đêm' name={tripResult.supportNight} iconName='hotel' /> */}
            <CostItemView
              title="Di chuyển khác"
              name={tripResult.supportVehicalOther}
              iconName="road"
            />
            <CostItemView
              title="Lưu trú"
              name={tripResult.supportStay}
              iconName="hotel"
            />
            <CostItemView
              title="Ăn trưa"
              name={tripResult.supportLunch}
              iconName="utensils"
            />
            <CostItemView
              title="Ăn tối"
              name={tripResult.supportDinner}
              iconName="utensils"
            />
            <CostItemView
              title="Chi phí khác"
              name={tripResult.supportOther}
              iconName="money-bill"
            />
          </View>
          <View>
            <Text
              style={styles.titleDateLine}
            >{`${tripResult.addressTo}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
