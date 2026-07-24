import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { POPAPI, POPKey } from '../../../API/POPAPI';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { FlashList } from '@shopify/flash-list';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../Themes/AppsStyle';
import { Icon, Text } from '@rneui/base';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import FollowTimeline from './Page/FollowTimeline';
import FollowDetails from './Page/FollowDetails';
import {
  removeVietnameseTones,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import { POPController } from './Controller/POPController';
import { alertConfirm, isValid } from '../../../Core/Utility';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CustomTab from '../../../Control/Custom/CustomTab';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const POPFollowScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [itemOrder, setItemOrder] = useState({});
  const [_mutate, setMutate] = useState(false);
  const [messageError, setMessageError] = useState(null);
  //
  const LoadData = async () => {
    await setLoading(true);
    await POPAPI.GetDataFollow(mData => {
      setData(mData);
      setDataMain(mData);
    });
    await setLoading(false);
  };
  const UploadData = itemReject => {
    // Type
    const itemUpload = itemReject || itemOrder;
    let typeUpdate = null;
    if (itemOrder.Status) {
      switch (itemOrder.Status) {
        case 'SEND':
          typeUpdate = POPKey.UPDATEORDER;
          break;
        case 'DELIVERY':
          typeUpdate = POPKey.CONFIRM;
          break;
      }
    } else {
      typeUpdate = POPKey.REJECT;
    }
    // Valid
    const isValid = validData(itemUpload);
    if (!isValid) return;

    // Upload
    const titleUpload = itemReject
      ? `Bạn có muốn hủy đơn hàng này không?`
      : itemOrder.Status == 'DELIVERY'
        ? `Kiểm tra số lượng sản phẩm và xác nhận nhận hàng`
        : `Bạn có muốn cập nhật đơn hàng này không?`;
    alertConfirm(
      `${itemUpload.OrderNo}`,
      titleUpload,
      async () => {
        const params = {
          typeUpdate: typeUpdate,
          itemUpload: JSON.stringify(itemUpload),
        };
        await POPAPI.UpdatePOP(
          params,
          message => {
            ToastSuccess(message, 'Thông báo', 'top');
            LoadData();
            DeviceEventEmitter.emit('RELOAD_MENU_POP');
            SheetManager.hide('follow-detail-sheet');
          },
          error => {
            setMessageError(
              error || 'Dữ liệu không thể cập nhật, Vui lòng kiểm tra lại',
            );
          },
        );
      },
      () => { },
      'Đồng ý',
      'Hủy',
    );
  };
  const validData = item => {
    if (item.Status == `DELIVERY`) {
      const dataContent = JSON.parse(item.Content || '[]');
      for (let index = 0; index < dataContent.length; index++) {
        const e = dataContent[index];
        if (!isValid(e.QuantityDamaged)) {
          setMessageError(
            `${e.POPName} - Số lượng hư hỏng không được để trống`,
          );
          return false;
        }
        if (!isValid(e.QuantityPickup)) {
          setMessageError(
            `${e.POPName} - Số lượng nhận được không được để trống`,
          );
          return false;
        }
        if (e.QuantityDamaged > e.QuantityPickup) {
          setMessageError(
            `${e.POPName} - Số lượng hư hỏng không được lớn hơn số lượng nhận được`,
          );
          return false;
        }
      }
    }
    setMessageError(null);
    return true;
  };
  // Handler
  const handlerUpdateData = params => {
    const { orderNo, newContent } = params;
    setItemOrder(prev => ({ ...prev, Content: JSON.stringify(newContent) }));
    setData(prev =>
      POPController.updateContentOrder(prev, orderNo, newContent),
    );
    setDataMain(prev =>
      POPController.updateContentOrder(prev, orderNo, newContent),
    );
  };
  // Action
  const onSearchData = text => {
    search.text = text;
    setMutate(e => !e);
    const searchList = _searchData(dataMain);
    setData(searchList);
  };
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    return filterList.map(group => {
      const detailArr = JSON.parse(group.detailData || '[]');
      const filteredDetails = detailArr.filter(e =>
        removeVietnameseTones(e.OrderNo || '')
          .toLowerCase()
          .includes(valueSearch),
      );
      return {
        ...group,
        detailData: JSON.stringify(filteredDetails),
      };
    });
  };
  const onCloseSheet = () => {
    SheetManager.hide('follow-detail-sheet');
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    const update_order = DeviceEventEmitter.addListener(
      'UPDATE_ORDER_POP',
      handlerUpdateData,
    );
    LoadData();
    return () => {
      update_order.remove();
    };
  }, []);
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, height: 550 },
    itemContainer: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    contentTab: { flex: 1, width: deviceWidth },
    itemTab: {
      flex: 1,
      backgroundColor: appcolor.light,
      marginHorizontal: 4,
      marginTop: 4,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    iconDeleteStyle: { position: 'absolute', top: 0, end: 0, padding: 8 },
    sheetContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8 },
    viewContent: { flex: 1 },
    viewHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    actionButton: { flexDirection: 'row', alignItems: 'center' },
    buttonUpdate: {
      backgroundColor: appcolor.primary,
      padding: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginStart: 8,
    },
    titleUpdate: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    buttonClose: {
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.primary,
      padding: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginStart: 8,
    },
    titleClose: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      top: 0,
      end: 0,
      start: 0,
      bottom: 0,
    },
  });
  const renderTab = (item, index) => {
    const dataDetails = JSON.parse(item.detailData || '[]');
    if (dataDetails == null || dataDetails.length == 0) return <View />;
    return (
      <View key={index} style={styles.itemTab}>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataDetails}
          extraData={[data, dataDetails]}
          renderItem={renderItem}
          estimatedItemSize={deviceWidth}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 5 }} />
          }
        />
      </View>
    );
  };
  const renderItem = ({ item }) => {
    const onPressDetail = () => {
      SheetManager.show('follow-detail-sheet', { payload: item });
    };
    const onPressDelete = () => UploadData(item);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={onPressDetail}>
        <Text style={styles.titleName}>{`${item.OrderNo}`}</Text>
        <Text style={styles.subTitleName}>{`${item.OrderStatus}`}</Text>
        {item.BillCode && (
          <Text style={styles.subTitleName}>{`${item.BillCode}`}</Text>
        )}
        <Text style={styles.subTitleName}>{`${item.Address}`}</Text>
        <Text style={styles.subTitleName}>{`${item.CreateOrder}`}</Text>
        <Text style={styles.subTitleName}>{`${item.CreatedDate}`}</Text>
        {item.isDeleteOrder == 1 && (
          <SpiralIcon
            type="ionicon"
            name="trash"
            color={appcolor.redgray}
            size={24}
            containerStyle={styles.iconDeleteStyle}
            onPress={onPressDelete}
          />
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route.params.popMenu.menuName || `Quản lí đơn hàng`}
        leftFunc={onBack}
      />
      <View style={styles.contentContainer}>
        <SearchData
          placeholder={`Tìm kiếm đơn hàng`}
          value={search.text}
          onSearchData={onSearchData}
          containerStyle={{ margin: 8 }}
          inputStyle={{ fontSize: 12 }}
        />
        <CustomTab
          data={data}
          dataCountItem={data}
          keySummaryName="detailData"
          keyTabName="statusName"
          renderItem={renderTab}
        />
      </View>
      <ActionSheet
        id="follow-detail-sheet"
        containerStyle={StyleSheet.flatten([
          styles.sheetContainer,
          { paddingBottom: insets.bottom },
        ])}
        onBeforeShow={setItemOrder}
      >
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.viewHead}>
          <Text style={styles.titleHead}>{itemOrder.OrderNo}</Text>
          <View style={styles.actionButton}>
            <TouchableOpacity style={styles.buttonClose} onPress={onCloseSheet}>
              <Text style={styles.titleClose}>{`Đóng`}</Text>
            </TouchableOpacity>
            {(itemOrder.Status == 'SEND' || itemOrder.Status == 'DELIVERY') && (
              <TouchableOpacity
                style={styles.buttonUpdate}
                onPress={() => {
                  UploadData();
                }}
                disabled={isLoading}
              >
                <Text
                  style={{
                    ...styles.titleUpdate,
                    color: isLoading ? appcolor.primary : appcolor.white,
                  }}
                >
                  {itemOrder.Status == 'DELIVERY' ? `Nhận hàng` : `Cập nhật`}
                </Text>
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={appcolor.white}
                    style={styles.loadingView}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
        {/* Content */}
        <FollowTimeline itemMain={itemOrder} />
        <FollowDetails itemMain={itemOrder} messageError={messageError} />
      </ActionSheet>
    </View>
  );
};

export default POPFollowScreen;
