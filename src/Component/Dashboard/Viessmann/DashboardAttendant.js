import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { DataSummary } from '../../../Controller/DashboardController';
import { Icon, Text } from '@rneui/base';
import { deviceHeight } from '../../../Themes/AppsStyle';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';

export const DashboardAttendant = ({ navigation, typeDashboard }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataDashboard, setDataDashboard] = useState([]);
  const [itemMain, setItemMain] = useState({});
  const [isLoading, setLoading] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    await DataSummary(typeDashboard, async mData => {
      await setDataDashboard(mData);
      await setItemMain(mData[0] || {});
    });
    await setLoading(false);
  };
  // Handler
  const showDetails = () => {
    navigation.navigate('attendanthistory');
  };
  // View
  useEffect(() => {
    const _dashboard = LoadData();
    return () => _dashboard;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, padding: 8, minHeight: deviceHeight / 3.8 },
    titleDashboard: {
      width: '80%',
      fontSize: 16,
      fontWeight: '700',
      color: appcolor.blacklight,
    },
    headerContent: {
      flexDirection: 'row',
      marginBottom: 16,
      marginTop: 8,
      alignItems: 'center',
    },
    actionSync: {
      borderRadius: 30,
      borderWidth: 0.3,
      borderColor: appcolor.dark,
      padding: 5,
      position: 'absolute',
      end: 0,
    },
    actionDetails: {
      borderRadius: 5,
      borderWidth: 0.3,
      borderColor: appcolor.dark,
      padding: 8,
      position: 'absolute',
      end: 0,
    },
    contentItem: {
      width: '100%',
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'center',
    },
    viewPercent: {
      overflow: 'hidden',
      alignItems: 'center',
      minHeight: 38,
      position: 'absolute',
    },
    descriptionView: { flexDirection: 'row-reverse' },
  });
  const renderItem = (item, index) => {
    const timeLine = (
      <View
        style={{
          width: '80%',
          minHeight: 38,
          borderRadius: 8,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            ...styles.viewPercent,
            backgroundColor: appcolor.success,
            width: '100%',
            opacity: 0.1,
          }}
        />
        <View
          style={{
            ...styles.viewPercent,
            backgroundColor: appcolor.success,
            width: `${item.percent}%`,
            opacity: 0.8,
          }}
        />
        <Text
          style={{
            width: '100%',
            alignSelf: 'center',
            textAlign: 'right',
            padding: 5,
            fontSize: 13,
            fontWeight: '600',
            color: appcolor.dark,
            paddingEnd: 8,
          }}
        >{`${item.actual} / ${item.target}`}</Text>
      </View>
    );
    return (
      <View key={`dds_${index}`}>
        <View style={styles.contentItem}>
          <Text
            style={{
              width: '20%',
              fontSize: 13,
              fontWeight: '600',
              fontStyle: 'italic',
              color: appcolor.blacklight,
            }}
          >
            {item.titleName}
          </Text>
          {timeLine}
        </View>
      </View>
    );
  };
  return (
    <TouchableOpacity onPress={showDetails}>
      <View style={styles.mainContainer}>
        <View style={styles.headerContent}>
          <SpiralIcon
            name="chart-bar"
            type="font-awesome-5"
            size={18}
            color={appcolor.blacklight}
            style={{ padding: 5 }}
          />
          <Text style={styles.titleDashboard}>{itemMain.dashboardName}</Text>
          <TouchableOpacity
            onPress={isLoading ? null : LoadData}
            style={styles.actionSync}
          >
            <SpiralIconAnimation
              isLoop={isLoading}
              sourceIcon={require('../../../Themes/lotties/sync_load.json')}
            />
          </TouchableOpacity>
        </View>
        <View>
          <ScrollView
            key={'dashboardattvsm'}
            showsVerticalScrollIndicator={false}
          >
            {dataDashboard.map((item, index) => renderItem(item, index))}
          </ScrollView>
        </View>
        <View style={styles.descriptionView}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              color: appcolor.dark,
              marginStart: 8,
              marginEnd: 3,
            }}
          >
            {itemMain.descriptionTarget}
          </Text>
          <SpiralIcon
            name="square"
            type="font-awesome-5"
            solid
            size={15}
            color={appcolor.success}
            style={{ opacity: 0.1 }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              color: appcolor.dark,
              marginStart: 8,
              marginEnd: 8,
              opacity: 0.8,
            }}
          >
            {itemMain.descriptionActual}
          </Text>
          <SpiralIcon
            name="square"
            type="font-awesome-5"
            solid
            size={15}
            color={appcolor.success}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
