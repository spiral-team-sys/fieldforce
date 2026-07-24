import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { formatNumber } from '../../../Core/Helper';
import { CostItemView } from './CostItemView';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';
import moment from 'moment';

export const ViewResultDefault = ({ tripResult }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const tripRanges = Array.isArray(tripResult.tripDateRanges)
    ? tripResult.tripDateRanges
    : [];

  const styles = StyleSheet.create({
    contentView: {
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
      padding: 8,
      margin: 8,
      borderRadius: 10,
    },
    contentOnly: {
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
    rangeCard: {
      backgroundColor: appcolor.surface,
      padding: 12,
      marginHorizontal: 8,
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: appcolor.lightgrey,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
  if (tripRanges.length === 0) {
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
          >{`${tripResult.provinceFrom}`}</Text>
          <Text
            style={styles.titleBodyLine}
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
              <CostItemView
                title={`Di chuyển`}
                name={`${tripResult.supportKM}`}
                iconName="road"
              />
            )}
            <CostItemView
              title="Phương tiện khác"
              name={tripResult.supportVehicalOther}
              iconName="car"
            />
            <CostItemView
              title="Nghỉ qua đêm"
              name={tripResult.supportNight}
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
            >{`${tripResult.provinceTo}`}</Text>
            <Text
              style={styles.titleBodyLine}
            >{`${tripResult.addressTo}`}</Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View>
      {tripRanges.length > 0 &&
        tripRanges.map((r, idx) => (
          <View key={`range_${idx}`} style={styles.rangeCard}>
            <Text
              style={{
                position: 'absolute',
                right: 12,
                top: 10,
                fontSize: 13,
                fontWeight: '800',
                color: appcolor.tomato,
              }}
            >
              {`${r.dayValue}N ${r.nightValue}Đ`}
            </Text>
            <View
              style={{ width: 120, alignItems: 'flex-start', marginEnd: 10 }}
            >
              <Text style={styles.titleDateLine}>
                {moment(r.dateFilterFrom, 'DD/MM/YYYY').format('DD/MM/YYYY')}
              </Text>
              <Text style={{ ...styles.titleDateLine, paddingTop: 4 }}>
                {moment(r.dateFilterTo, 'DD/MM/YYYY').format('DD/MM/YYYY')}
              </Text>
            </View>
            <View style={{ ...styles.lineView, height: 54, marginEnd: 10 }}>
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
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: appcolor.info,
                }}
              >{`Ngày ${idx + 1}`}</Text>
              <Text
                style={{ fontSize: 13, color: appcolor.dark, marginTop: 2 }}
              >
                {r.dayAndNight}
              </Text>
            </View>
          </View>
        ))}

      <View
        style={tripRanges.length > 0 ? styles.contentOnly : styles.contentView}
      >
        <View
          style={{ width: tripRanges.length > 0 ? '100%' : deviceWidth / 1.4 }}
        >
          <Text
            style={styles.titleDateLine}
          >{`${tripResult.provinceFrom}`}</Text>
          <Text
            style={styles.titleBodyLine}
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
              <CostItemView
                title={`Di chuyển`}
                name={`${tripResult.supportKM}`}
                iconName="road"
              />
            )}
            <CostItemView
              title="Phương tiện khác"
              name={tripResult.supportVehicalOther}
              iconName="car"
            />
            <CostItemView
              title="Nghỉ qua đêm"
              name={tripResult.supportNight}
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
            >{`${tripResult.provinceTo}`}</Text>
            <Text
              style={styles.titleBodyLine}
            >{`${tripResult.addressTo}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
