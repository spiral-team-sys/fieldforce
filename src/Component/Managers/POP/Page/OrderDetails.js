import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon, Image, Text } from '@rneui/base';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import FormGroup from '../../../../Content/FormGroup';
import { FlashList } from '@shopify/flash-list';
import PlusMinusEdit from '../Controls/PlusMinusEdit';
import { POPController } from '../Controller/POPController';
import {
  Message,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../../../../Core/Helper';
import {
  alertError,
  alertWarning,
  optionConfirm,
} from '../../../../Core/Utility';
import { POPAPI } from '../../../../API/POPAPI';
import _ from 'lodash';
import moment from 'moment';
import { ATTENDANT_API } from '../../../../API/AttendantAPI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OrderDetails = ({}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [dataView, setDataView] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const orderRef = useRef({
    address: '',
    note: '',
    dataOrder: [],
    warehouseId: 0,
  });
  //
  const LoadData = (data = []) => {
    if (data.length == 0) {
      ToastError(`Bạn chưa thêm sản phẩm nào vào đơn hàng`, 'Đơn hàng', 'top');
      onBack();
    } else {
      orderRef.current.dataOrder = data;
      orderRef.current.warehouseId = data[0].WareHouseId;
      setDataView(data);
    }
  };
  const UploadDataOrder = async () => {
    const isValid = validData();
    if (!isValid) return;
    //
    const itemOrder = {
      WorkDate: moment().format('YYYYMMDD'),
      GuiId: UUIDGenerator(),
      Content: JSON.stringify(orderRef.current.dataOrder),
      WarehouseId: orderRef.current.warehouseId,
      Note: orderRef.current.note,
      AddressLine: orderRef.current.address,
    };
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await setLoading(true);
        await POPAPI.UploadDataOrder(itemOrder, message => {
          message && ToastSuccess(message, 'Thông báo', 'top');
          onBack();
          DeviceEventEmitter.emit('RELOAD_DATA_ITEM_ORDER');
          DeviceEventEmitter.emit('RELOAD_MENU_POP');
        });
        await setLoading(false);
      },
    );
  };
  const validData = () => {
    if (
      orderRef.current.address == null ||
      orderRef.current.address.trim().length < 10
    ) {
      alertWarning(
        `Vui lòng nhập địa chỉ nhận hàng rõ ràng để nhận đơn hàng này`,
      );
      return false;
    }
    return true;
  };
  // Handler
  const handlerSearchAddress = async () => {
    if (orderRef.current.address || userinfo.address)
      await ATTENDANT_API.LocationFromAddress(
        orderRef.current.address || userinfo.address,
        async location => {
          orderRef.current.address = location.address;
          setMutate(e => !e);
        },
      );
  };
  const handlerUpdateOrder = itemUpdate => {
    const dataUpdate = POPController.updateOrderData(dataView, itemUpdate);
    orderRef.current.dataOrder = dataUpdate;
    setDataView(dataUpdate);
    DeviceEventEmitter.emit('UPDATE_DATA_ORDER', dataUpdate);
    if (dataUpdate.length == 0) onBack();
  };
  // Action
  const onChangeValue = (text, type) => {
    switch (type) {
      case 'ADDRESS':
        orderRef.current.address = text;
        break;
      case 'NOTE':
        orderRef.current.note = text;
        break;
    }
  };
  const onDeleteOrder = () => {
    const options = [
      { text: 'Hủy' },
      {
        text: 'Đồng ý',
        onPress: () => {
          orderRef.current.dataOrder = [];
          DeviceEventEmitter.emit('UPDATE_DATA_ORDER', []);
          onBack();
        },
      },
    ];
    optionConfirm(
      'Thông báo',
      'Bạn có muốn xóa tất cả sản phẩm đơn hàng này không?',
      options,
    );
  };
  const onBack = () => {
    SheetManager.hide('order-details-sheet');
  };
  //
  useEffect(() => {
    handlerSearchAddress();
    return () => {
      false;
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8 },
    viewHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    viewContent: { width: '100%' },
    viewItemOrder: { width: '100%', height: '75%', padding: 8 },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    actionButton: { flexDirection: 'row', alignItems: 'center' },
    buttonSend: {
      backgroundColor: appcolor.primary,
      padding: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginStart: 8,
    },
    titleOrder: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    buttonBack: {
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.primary,
      padding: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginStart: 8,
    },
    titleBack: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    itemContainer: {
      flex: 1,
      flexDirection: 'row',
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
    viewImage: {
      width: '40%',
      overflow: 'hidden',
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
    },
    viewInfo: { width: '60%', paddingVertical: 8, marginStart: 8 },
    imageView: { width: '100%', height: '100%' },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleNumberItem: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    viewSummaryOrder: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    titleSummary: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textDecorationLine: 'underline',
    },
    buttonDelete: { padding: 8, borderRadius: 8, marginStart: 8 },
    titleDelete: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textDecorationLine: 'underline',
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
  const renderItem = ({ item, index }) => {
    const imageURI = item.Image
      ? { uri: item.Image }
      : require('../../../../Themes/Images/noimage.png');
    const totalValue = item.UserInput
      ? item.Quantity - item.UserInput
      : item.Quantity;
    const totalMyValue = item.UserInput
      ? item.QuantityMyHouse + item.UserInput
      : item.QuantityMyHouse;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.viewImage}>
          <Image
            source={imageURI}
            style={styles.imageView}
            resizeMode="cover"
            resizeMethod="resize"
          />
        </View>
        <View style={styles.viewInfo}>
          <Text style={styles.titleName}>{`${index + 1}. ${
            item.POPName
          }`}</Text>
          <Text
            style={styles.titleNumberItem}
          >{`Tồn kho tổng: ${totalValue}`}</Text>
          <Text
            style={styles.titleNumberItem}
          >{`Tồn kho cá nhân: ${totalMyValue}`}</Text>
          <PlusMinusEdit
            isDelete
            itemEdit={item}
            keyValue="UserInput"
            onChange={handlerUpdateOrder}
          />
        </View>
      </View>
    );
  };
  return (
    <ActionSheet
      id="order-details-sheet"
      containerStyle={StyleSheet.flatten([
        styles.mainContainer,
        { paddingBottom: insets.bottom },
      ])}
      onBeforeShow={LoadData}
    >
      {/* Header */}
      <View style={styles.viewHead}>
        <Text style={styles.titleHead}>{`Chi tiêt đơn hàng`}</Text>
        <View style={styles.actionButton}>
          <TouchableOpacity style={styles.buttonBack} onPress={onBack}>
            <Text style={styles.titleBack}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSend}
            onPress={UploadDataOrder}
            disabled={isLoading}
          >
            <Text
              style={{
                ...styles.titleOrder,
                color: isLoading ? appcolor.primary : appcolor.white,
              }}
            >
              Đặt hàng
            </Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={appcolor.white}
                style={styles.loadingView}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Content */}
      <View style={styles.viewContent}>
        <FormGroup
          editable
          multiline
          placeholder="Nhập địa chỉ nhận hàng"
          title="Địa chỉ"
          iconRight="search"
          defaultValue={orderRef.current.address || ''}
          useClearAndroid={false}
          handleChangeForm={text => onChangeValue(text, 'ADDRESS')}
          rightFunc={handlerSearchAddress}
        />
        <FormGroup
          editable
          multiline
          placeholder="Nhập ghi chú (Nếu có)"
          title="Ghi chú"
          defaultValue={orderRef.current.note || ''}
          useClearAndroid={false}
          handleChangeForm={text => onChangeValue(text, 'NOTE')}
        />
      </View>
      <View style={styles.viewItemOrder}>
        <View style={styles.viewSummaryOrder}>
          <Text
            style={styles.titleSummary}
          >{`Tổng ${dataView.length} sản phẩm`}</Text>
          <TouchableOpacity style={styles.buttonDelete} onPress={onDeleteOrder}>
            <Text style={styles.titleDelete}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataView}
          extraData={[dataView]}
          renderItem={renderItem}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ paddingBottom: 16 }} />}
        />
      </View>
    </ActionSheet>
  );
};

export default OrderDetails;
