import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { FlashList } from '@shopify/flash-list';
import { itemUploaded } from '../../../../Controller/ReportController';
import { REPORT } from '../../../../API/ReportAPI';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/base';
import { groupDataByKey } from '../../../../Core/Helper';
import { LoadingView } from '../../../../Control/ItemLoading';

const POPInstallMenuScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [isUploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const LoadData = async () => {
    await setLoading(true);
    const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(params, mData => {
      const groupData = groupDataByKey({ arr: mData, key: 'MenuId' });
      setData(groupData.arr);
      setDataMain(groupData.arr);
    });
    const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id);
    await setUploaded(itemUpdate.isUploaded == 1);
    await setLoading(false);
  };

  useEffect(() => {
    const _reload = DeviceEventEmitter.addListener(
      'RELOAD_DATA_POP_INSTALL',
      LoadData,
    );
    LoadData();
    return () => {
      _reload.remove();
    };
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  const handlerPressMenu = async item => {
    const params = {
      dataMenu: item.JsonData ? JSON.parse(item.JsonData) : [],
      menu: { Name: item.MenuName, Id: item.MenuId },
      wareHouse: { Name: item.WareHouseName, Id: item.WareHouseId },
      dataMainLocal: dataMain,
      isUploaded: isUploaded,
    };
    navigation.navigate('popinstalldetail', params);
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, padding: 4, paddingTop: 0 },
    itemContainer: { flex: 1, paddingHorizontal: 8 },
    itemContent: {
      padding: 8,
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    titleMenu: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      marginStart: 8,
    },
    viewInfo: { flex: 1 },
    viewIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 4,
    },
    subTitleMenu: { fontSize: 12, fontWeight: '500', color: appcolor.dark },
    loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconForwardStyle: {
      position: 'absolute',
      end: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    emptyData: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    titleEmptyData: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      marginTop: 10,
    },
  });

  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerPressMenu(item);
    };
    return (
      <View style={styles.itemContainer}>
        {item.isParent && (
          <View style={styles.viewIcon}>
            <SpiralIcon
              name="settings"
              type="ionicon"
              color={appcolor.primary}
              size={24}
            />
            <Text style={styles.titleMenu}>{item.MenuName}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.itemContent}
          key={index}
          onPress={onPress}
        >
          <View style={styles.viewInfo}>
            <Text style={styles.subTitleMenu}>Kho: {item.WareHouseName}</Text>
            <Text style={styles.subTitleMenu}>
              Thời gian: Từ {item.FromDate} - {item.ToDate}
            </Text>
            <SpiralIcon
              name="chevron-forward"
              type="ionicon"
              color={appcolor.greylight}
              size={16}
              containerStyle={styles.iconForwardStyle}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading)
    return <LoadingView isLoading={loading} styles={styles.loadingView} />;
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={`${kpiinfo.menuNameVN || 'Lắp đặt POSM'}`}
        leftFunc={goBack}
      />
      <View style={styles.contentContainer}>
        <FlashList
          ref={listRef}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={LoadData} />
          }
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          keyExtractor={(_item, index) => index.toString()}
          data={data}
          extraData={[data]}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: deviceHeight / 10 }}
          ListEmptyComponent={
            <View style={styles.emptyData}>
              <Text style={styles.titleEmptyData}>Không có dữ liệu</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default POPInstallMenuScreen;
