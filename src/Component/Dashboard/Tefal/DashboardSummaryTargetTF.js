import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import { Icon } from '@rneui/base';
import { TouchableOpacity } from 'react-native';
import { DataSummary } from '../../../Controller/DashboardController';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const DashboardSummaryTargetTF = ({ navigation, typeDashboard }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const LoadData = async () => {
    setLoading(true);
    DataSummary(typeDashboard, mData => {
      if (mData.length > 0) {
        setData(mData);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    LoadData();
  }, []);

  const onDetail = () => {
    navigation.navigate(data?.[0]?.pageName);
  };

  const styles = StyleSheet.create({
    card: {
      width: '100%',
      padding: 16,
      backgroundColor: appcolor.light,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    titleDashboard: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      alignSelf: 'center',
      color: appcolor.dark,
      marginLeft: 8,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
      backgroundColor: appcolor.primary + '20',
      padding: 8,
      borderRadius: 12,
      marginRight: 12,
    },
    metricsContainer: { justifyContent: 'space-between' },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: appcolor.background,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: appcolor.grey,
      marginBottom: 8,
      fontWeight: '500',
    },
    metricValue: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    targetValue: { color: appcolor.primary },
    actualValue: { color: appcolor.success },
    detailButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary + '20',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginTop: 12,
    },
    detailText: {
      fontSize: 12,
      color: appcolor.primary,
      fontWeight: fontWeightBold,
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: appcolor.light }}
      onPress={onDetail}
    >
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <SpiralIcon
                name="chart-bar"
                type="font-awesome-5"
                size={18}
                color={appcolor.primary}
              />
            </View>
            <Text style={styles.titleDashboard}>{'Tổng số target'}</Text>
          </View>
          <TouchableOpacity
            onPress={loading ? null : LoadData}
            style={{
              borderRadius: 30,
              borderWidth: 0.3,
              borderColor: appcolor.dark,
              padding: 2,
              backgroundColor: appcolor.surface,
              overflow: 'hidden',
            }}
          >
            <IconAnimation
              isLoop={loading}
              sourceIcon={require('../../../Themes/lotties/sync_load.json')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Target</Text>
              <Text style={[styles.metricValue, styles.targetValue]}>
                {data?.[0]?.target}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Actual</Text>
              <Text style={[styles.metricValue, styles.actualValue]}>
                {data?.[0]?.actual}
              </Text>
            </View>
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailText}>Xem chi tiết</Text>
            <SpiralIcon
              name="arrow-right"
              type="font-awesome-5"
              size={10}
              color={appcolor.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DashboardSummaryTargetTF;
