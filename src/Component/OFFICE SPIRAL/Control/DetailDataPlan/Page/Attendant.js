import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../../../../Core/Utility';
import { BORDER_WIDTH } from '../../UtilityOffice';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

export const Attendant = ({ dataDetails, itemMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemAttendant, setItemAttendant] = useState({});

  const LoadItemAttendant = () => {
    setItemAttendant(dataDetails[0] || {});
  };

  useEffect(() => {
    const _itemattendant = LoadItemAttendant();
    return () => _itemattendant;
  }, [dataDetails]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, marginTop: 8 },
    timeView: {
      width: deviceWidth / 2.2,
      padding: 8,
      borderWidth: BORDER_WIDTH,
      borderColor: appcolor.greylight,
      borderRadius: 5,
      marginBottom: 8,
      marginStart: 8,
    },
    titleTime: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      textAlign: 'center',
    },
    attendantHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.info,
      padding: 8,
      paddingTop: 0,
      textAlign: 'left',
      fontStyle: 'italic',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.attendantHeader}>{itemMain.titlePage}</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.timeView}>
          <SpiralIcon
            name="arrow-downward"
            color={appcolor.yellowdark}
            size={21}
          />
          <Text
            style={{
              ...styles.titleTime,
              color: appcolor[itemAttendant.HighlightCI],
            }}
          >
            {itemAttendant.TimeCI}
          </Text>
        </View>
        <View style={styles.timeView}>
          <SpiralIcon name="arrow-upward" color={appcolor.tomato} size={21} />
          <Text
            style={{
              ...styles.titleTime,
              color: appcolor[itemAttendant.HighlightCO],
            }}
          >
            {itemAttendant.TimeCO}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.timeView}>
          <SpiralIcon name="timelapse" color={appcolor.success} size={21} />
          <Text
            style={{
              ...styles.titleTime,
              color: appcolor[itemAttendant.HighlightTotalTime],
            }}
          >
            {itemAttendant.TotalTime}
          </Text>
        </View>
        <View style={styles.timeView}>
          <SpiralIcon name="work" color={appcolor.info} size={21} />
          <Text style={styles.titleTime}>{itemAttendant.WPShift}</Text>
        </View>
      </View>
    </View>
  );
};
