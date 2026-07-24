import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';
import { Avatar } from '@rneui/themed';
import { SYNC_DATA_ATT } from '../../../../Core/URLs';
import { useSelector, useDispatch } from 'react-redux';
import { checkLinkType } from '../../../../Core/Helper';
import { GetWorkHistory } from '../../../../Controller/WorkController';
import { SetReport, SetShopInfo } from '../../../../Redux/action';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import moment from 'moment';

const WorkHistory = ({ onSelectedTab }) => {
  const [worklist, setWorklist] = useState([]);
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const dispatch = useDispatch();

  const LoadHistory = async () => {
    const result = await GetWorkHistory(shopinfo);
    setWorklist(result);
  };

  const handlerOnClickItem = async item => {
    const shopConfig = item.shopConfig;
    let shopInfo = shopinfo;
    await dispatch(SetReport(item));
    await dispatch(SetShopInfo({ ...shopInfo, config: shopConfig || '{}' }));
    await onSelectedTab();
    await DeviceEventEmitter.emit(SYNC_DATA_ATT, item);
    await DeviceEventEmitter.emit('WORK_LOAD', item);
  };

  useEffect(() => {
    if (shopinfo !== undefined) {
      LoadHistory();
    }
  }, [shopinfo]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: {
      flex: 1,
      backgroundColor: appcolor.light,
      margin: 8,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      padding: 8,
      borderRadius: 8,
      borderColor: appcolor.surface,
      shadowColor: appcolor.greylight,
      shadowOffset: { width: 1, height: 0 },
      shadowRadius: 3,
      shadowOpacity: 0.3,
      elevation: 3,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 80,
      overflow: 'hidden',
      backgroundColor: appcolor.surface,
    },
    titleView: { width: '80%', padding: 8 },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    subTitleWorkTime: {
      fontSize: 11,
      fontWeight: '500',
      fontStyle: 'italic',
      color: appcolor.greylight,
    },
    subTitleTime: {
      position: 'absolute',
      bottom: 8,
      end: 8,
      fontSize: 11,
      fontWeight: '500',
      fontStyle: 'italic',
      textAlign: 'right',
      color: appcolor.greylight,
    },
  });

  const renderItem = ({ item, index }) => {
    const imageUrl = checkLinkType(item.imageUrl);
    const onClickItem = async () => {
      handlerOnClickItem(item);
    };

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={onClickItem}>
        <Avatar
          source={{ uri: imageUrl }}
          containerStyle={styles.avatarContainer}
        />
        <View style={styles.titleView}>
          <Text style={styles.titleName}>{item.shopName}</Text>
          <Text style={styles.subTitleName}>{item.address}</Text>
          <Text style={styles.subTitleWorkTime}>{`Bắt đầu làm việc: ${moment(
            item.workTime,
            'YYYYMMDDHHmmss',
          ).format('HH:mm:ss')}`}</Text>
        </View>
        <Text style={styles.subTitleTime}>
          {moment(item.workDate, 'YYYYMMDD').format('dddd, L')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <CustomListView
        key="dataReportHistory"
        keyExtractor={(_, index) => index.toString()}
        data={worklist}
        renderItem={renderItem}
      />
    </View>
  );
};

export default WorkHistory;
