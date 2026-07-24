import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../Themes/AppsStyle';
import { Icon, Text } from '@rneui/base';
import { DashboardAPI } from '../../../API/DashboardAPI';
import { ToastError } from '../../../Core/Helper';
import MultiGroupFilter from './Control/MultiGroupFilter';
import { ScreenDashboard } from './Page/ScreenDashboard';
import { ScreenTableProducts } from './Page/ScreenTableProducts';
import { setDashboardFilter } from '../../../Redux/action';
import _ from 'lodash';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const DashboardDisplayShare = ({
  info,
  isReload = false,
  navigation,
}) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [dataFilter, setDataFilter] = useState([]);
  const [dataTableDetails, setDataTableDetails] = useState([]);
  const [indexGroup, _setIndexGroup] = useState({
    groupId: 0,
    groupName: null,
    dataDetails: [],
  });
  const dispatch = useDispatch();
  //
  const LoadData = async () => {
    await DashboardAPI.GetMasterFilter(
      shopinfo.shopId,
      info.pageName,
      async (mData, message) => {
        message && ToastError(message, 'MasterFilter', 'top');
        await setDataFilter(mData);
        //
        if (mData.length > 0) {
          const itemChooseTag = mData[0];
          await LoadDataDashboard({
            group1: itemChooseTag.groupName1,
            group2: null,
            group3: null,
          });
        }
      },
    );
  };
  const LoadDataDashboard = async (filterObject = {}) => {
    await dispatch(setDashboardFilter({ [`${info.pageName}`]: filterObject }));
    await DashboardAPI.GetDashboardDisplayShare(
      shopinfo.shopId,
      filterObject,
      async (mData, message) => {
        message && ToastError(message, 'DisplayShare', 'top');
        //
        const item = mData[0] || {};
        const _data = JSON.parse(item.chartData || '[]');
        const _details = JSON.parse(item.detailData || '[]');
        //
        if (_data.length > 0) {
          indexGroup.groupId = _data[0].GroupId;
          indexGroup.groupName = _data[0].GroupName;
          indexGroup.dataDetails = _data[0].DataDetail;
        } else {
          indexGroup.groupId = 0;
          indexGroup.groupName = null;
          indexGroup.dataDetails = null;
        }
        //
        await setDataTableDetails(_details);
      },
    );
  };
  // Handler
  const onShowDetails = () => {
    navigation.navigate('displaydetails', {
      pageName: info.pageName,
      dataFilter: dataFilter,
    });
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [info, isReload]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      overflow: 'hidden',
      minHeight: deviceHeight / 3,
      backgroundColor: appcolor.light,
      marginBottom: 12,
      borderRadius: 8,
      elevation: 3,
      shadowColor: appcolor.surface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    contentMain: {
      width: deviceWidth,
      height: '100%',
      paddingTop: 40,
      zIndex: 1,
    },
    contentDashboard: { width: '100%', borderRadius: 8 },
    contentTableDetail: { width: '100%', borderRadius: 8 },
    viewTitleChart: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    titleChart: {
      width: '90%',
      marginEnd: 8,
      color: appcolor.dark,
      marginStart: 8,
      fontWeight: fontWeightBold,
      fontSize: 15,
    },
    titleDetails: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.blacklight,
      fontStyle: 'italic',
      textAlign: 'right',
      padding: 8,
      paddingEnd: 16,
      textDecorationLine: 'underline',
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View style={styles.viewTitleChart}>
        <SpiralIcon
          color={appcolor.primary}
          type="font-awesome-5"
          name="chart-line"
          size={23}
        />
        <Text style={styles.titleChart}>
          {' '}
          {info !== null ? info.chartName : ''}
        </Text>
      </View>
      <MultiGroupFilter
        isReloadFilter={isReload}
        pageName={info.pageName}
        data={dataFilter}
        handlerChangeData={LoadDataDashboard}
      />
      <TouchableOpacity
        style={{ alignSelf: 'flex-end' }}
        onPress={onShowDetails}
      >
        <Text style={styles.titleDetails}>{`Chi tiết trưng bày -->`}</Text>
      </TouchableOpacity>
      {indexGroup.dataDetails !== undefined &&
        indexGroup.dataDetails !== null &&
        indexGroup.dataDetails.length > 0 && (
          <View style={styles.contentDashboard}>
            <ScreenDashboard data={indexGroup.dataDetails} />
          </View>
        )}
      <View style={styles.contentTableDetail}>
        <ScreenTableProducts
          navigation={navigation}
          data={dataTableDetails}
          groupName={indexGroup.groupName}
        />
      </View>
    </View>
  );
};
