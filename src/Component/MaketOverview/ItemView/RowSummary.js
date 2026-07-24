import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../Core/Utility';

export const RowSummary = ({ item, index, typeSelect, onSeleted }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const dataDetails = JSON.parse(item.dataDetails || '[]');

  const handlerSelected = () => {
    onSeleted(item);
  };
  const rowItemDetails = (item, index) => {
    return (
      <View
        key={`123_${index}`}
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          padding: 8,
        }}
      >
        <Text
          style={{
            ...styles.detailView,
            fontSize: 10,
            textAlign: 'left',
            color: appcolor.greylight,
          }}
        >
          {item.RTime}
        </Text>
        <Text style={{ ...styles.detailView }}>
          {item?.TargetValue || 0}
          {item.Unit}
        </Text>
        <Text style={{ ...styles.detailView }}>
          {item?.ActualValue || 0}
          {item.Unit}
        </Text>
        <Text style={{ ...styles.detailView }}>{item?.PercentText || '-'}</Text>
      </View>
    );
  };
  const renderDetails = () => {
    return (
      <View style={{ borderTopWidth: 0.3, borderTopColor: appcolor.greylight }}>
        {dataDetails !== null &&
          dataDetails.length > 0 &&
          dataDetails.map((item, index) => {
            return rowItemDetails(item, index);
          })}
      </View>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      backgroundColor:
        typeSelect === item.type ? appcolor.surface : appcolor.light,
      marginBottom: 3,
      borderRadius: 3,
    },
    typeTitle: { color: appcolor.greylight, fontSize: 10, margin: 3 },
    iconView: {
      width: deviceWidth / 4.2,
      fontWeight: '400',
      fontSize: 16,
      color: appcolor.danger,
    },
    itemView: {
      width: deviceWidth / 4.2,
      textAlign: 'center',
      fontSize: 13,
      color: appcolor.greylight,
      fontWeight: '700',
    },
    detailView: {
      width: deviceWidth / 4.2,
      textAlign: 'center',
      fontWeight: '400',
      fontSize: 11,
      color: appcolor.dark,
    },
  });
  return (
    <TouchableOpacity
      key={`${index}009q`}
      onPress={handlerSelected}
      style={styles.mainContainer}
    >
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <Text
          style={{
            ...styles.itemView,
            color: appcolor.greylight,
            fontSize: 10,
            textAlign: 'left',
          }}
        >
          {item.type}
        </Text>
        <Text style={{ ...styles.itemView, color: appcolor.danger }}>
          {item?.targetValue || 0}
          {item.unit}
        </Text>
        <Text style={{ ...styles.itemView, color: appcolor.success }}>
          {item?.actualValue || 0}
          {item.unit}
        </Text>
        <Text style={{ ...styles.itemView, color: appcolor.info }}>
          {item?.percentText || '-'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          padding: 8,
        }}
      >
        {typeSelect === item.type && renderDetails()}
      </View>
    </TouchableOpacity>
  );
};
