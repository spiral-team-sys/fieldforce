import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { DashboardAPI } from '../../../../API/DashboardAPI';
import { ToastError, groupDataByKey } from '../../../../Core/Helper';
import { LoadingView } from '../../../../Control/ItemLoading';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Text } from '@rneui/base';
import { PhotoGallery } from '../Controls/View/PhotoGallery';
import { GroupType } from '../../Controls/GroupType';
import _ from 'lodash';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export const DisplayShareDetails = ({}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataTab, setDataTab] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [indexGroup, _setIndexGroup] = useState({
    groupId: 0,
    groupName: null,
    dataDetails: [],
  });
  //
  const LoadData = async () => {
    await setLoading(true);
    const itemFilter = {
      dashboardType: 'DISPLAYSHARE',
      shopId: shopinfo?.shopId || 0,
    };
    await DashboardAPI.GetDashboardDetails(
      itemFilter,
      async (mData, messager) => {
        messager && ToastError(messager, 'Lỗi dữ liệu', 'top');
        const _data = JSON.parse(mData[0].jsonData || '[]');
        const _photo = JSON.parse(mData[0].jsonPhoto || '[]');
        const _tabList = _.uniqBy(_data, 't1');
        const _listData = _.filter(_data, e => e.isChooseTag == 1);
        const { arr } = await groupDataByKey({
          arr: _listData,
          key: 'n1',
          keyLayer2: 'n2',
        });
        //
        await setDataTab(_tabList);
        await setData(arr);
        await setDataMain(_data);
        await setDataPhoto(_photo);
      },
    );
    await setLoading(false);
  };
  // Handler
  const onClose = () => {
    SheetManager.hide('detailDashboardPhoto');
  };
  const handlerSearchByGroup = async (item, keyValue) => {
    indexGroup.groupId = item.keyValue;
    indexGroup.groupName = item.keyName;
    //
    const listChooseGroup = _.map(dataMain, (it, _idx) => {
      if (item.keyValue == it[keyValue]) return { ...it, isChooseTag: 1 };
      else return { ...it, isChooseTag: 0 };
    });
    const _tabList = _.uniqBy(listChooseGroup, 't1');
    const _listData = _.filter(listChooseGroup, e => e.isChooseTag == 1);
    const { arr } = await groupDataByKey({
      arr: _listData,
      key: 'n1',
      keyLayer2: 'n2',
    });
    //
    await Promise.all([
      await setDataMain(listChooseGroup),
      await setDataTab(_tabList),
      await setData(arr),
    ]);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', backgroundColor: appcolor.light },
    contentMain: { width: '100%', height: '100%' },
    itemMain: { width: '100%' },
    titleHeaderClose: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },
    viewHeader: {
      width: 80,
      borderWidth: 0.5,
      borderColor: appcolor.light,
      backgroundColor: appcolor.dark,
      padding: 8,
      borderRadius: 5,
      margin: 8,
      position: 'absolute',
      end: 0,
      top: 0,
    },
    contentPhotos: { width: '100%', height: '100%' },
    listPhotoView: { width: '100%', height: '100%', marginTop: 50 },
    searchContainer: {
      width: '100%',
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
    },
    searchContainerInput: {
      width: '100%',
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      borderWidth: 0.5,
    },
    searchInputStyle: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: '500',
    },
    searchStyle: { fontSize: 13, color: appcolor.primary },
    titleGroup1: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      marginTop: 8,
    },
    titleGroup2: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
    },
    titleItem: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.dark,
      width: '70%',
    },
    titleItemValue: {
      width: '30%',
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'right',
    },
    viewItemValue: {
      width: '100%',
      flexDirection: 'row',
      padding: 8,
      backgroundColor: appcolor.surface,
      borderRadius: 3,
      marginTop: 1,
    },
  });
  const renderItem = ({ item, index }) => {
    const keyLayer2 = item[`${item.n1}${item.n2}`];
    return (
      <View key={`dsdi_${index}`} style={styles.itemMain}>
        {item.isParent && <Text style={styles.titleGroup1}>{item.n1}</Text>}
        {keyLayer2 && <Text style={styles.titleGroup2}>{item.n2}</Text>}
        <View style={styles.viewItemValue}>
          <Text style={styles.titleItem}>{item.n3}</Text>
          <Text style={styles.titleItemValue}>{item.itemValue}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={{ zIndex: 1000 }}
      />
      {/* // Content Main */}
      <View style={styles.contentMain}>
        {dataTab !== null && dataTab.length > 1 && (
          <GroupType
            dataMain={dataTab}
            keyValue="t1"
            keyName="tn1"
            handlerChange={handlerSearchByGroup}
          />
        )}
        <FlatList
          keyExtractor={(_item, index) => index.toString()}
          data={data}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
        />
      </View>
      <ActionSheet
        id="detailDashboardPhoto"
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <SafeAreaView style={styles.contentPhotos}>
          <TouchableOpacity style={styles.viewHeader} onPress={onClose}>
            <Text style={styles.titleHeaderClose}>ĐÓNG</Text>
          </TouchableOpacity>
          <View style={styles.listPhotoView}>
            <PhotoGallery data={dataPhoto} />
          </View>
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
