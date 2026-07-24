import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import {
  POPTotalWarehouse,
  UploadPOPOrder,
} from '../../../Controller/POPController';
import { checkNetwork, deviceWidth } from '../../../Core/Utility';
import FormGroup from '../../../Content/FormGroup';
import { Badge, Text, Image } from '@rneui/themed';
import AnimatedLottieView from 'lottie-react-native';
import { useRef } from 'react';
import {
  Message,
  MessageInfo,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../../../Core/Helper';
import { deviceHeight } from '../../../Themes/AppsStyle';
import moment from 'moment';
import { AttendantController } from '../../../Controller/AttendantController';
import { NumPad_V2 } from '../../../Control/NumPad_V2';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import GmailStyleSwipeableRow from '../../../Core/GmailStyleSwipeableRow';

export const POPOrderItem = ({ navigation, route }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataGroup, setDataGroup] = useState([]);
  const [dataProduct, setDataProduct] = useState({
    dataView: [],
    dataFilter: [],
  });
  const [itemSelect, setItemSelect] = useState({ groupId: 0 });
  const [listOrder, setListOrder] = useState([]);
  const [_, setMutate] = useState(false);
  const [employeeAddress, setEmpoyeeAddres] = useState(userinfo.address || '');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [isOrder, setIsOrder] = useState(false);
  const [reloadNum, setReloadNum] = useState(0);
  const ref_group = useRef();
  const [isVisible, setVisible] = useState(false);
  const [isSendPOP, setSendPOP] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    await POPTotalWarehouse(1, async mData => {
      setItemSelect({ groupId: mData[0].groupId });
      await setDataGroup(mData);
      await setDataProduct({
        dataView: JSON.parse(mData[0].detailData),
        dataFilter: JSON.parse(mData[0].detailData),
      });
    });
    await setLoading(false);
  };
  useEffect(() => {
    LoadData();
    return () => loading;
  }, []);
  const onGoBack = () => {
    if (isSendPOP) {
      navigation.goBack();
      DeviceEventEmitter.emit('RELOAD_POPMENU', null);
    } else {
      navigation.goBack();
    }
  };
  const uploadAction = async () => {
    const listUpload = listOrder.filter(
      it => it.UserInput >= 0 && it.UserInput !== null,
    );
    if (listUpload.length == 0) {
      handleCloseModal();
      ToastError('Chưa có đơn hàng nào!', 'Thông báo', 'top');
      return;
    }
    if (employeeAddress.length < 5) {
      MessageInfo('Địa chỉ nhận hàng quá ngắn (tối thiểu 5 kí tự)!');
      return;
    }
    const jsonUpload = JSON.stringify(listUpload);
    const itemOrder = {
      WorkDate: parseInt(moment(new Date()).format('YYYYMMDD')),
      EmployeeId: userinfo.employeeId,
      WarehouseId: listUpload[0].WareHouseId,
      Step: 1,
      Status: 'SEND',
      GuiId: UUIDGenerator(),
      Content: jsonUpload,
      Note: note,
      AddressLine: employeeAddress,
    };

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
          ToastError(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
          );
          return;
        }
        await UploadPOPOrder(
          JSON.stringify(itemOrder),
          async success => {
            if (success.statusId) {
              await setVisible(false);
              await setListOrder([]);
              await setSendPOP(true);
              ToastSuccess(success.messager, 'Thông báo', 'top');
              await LoadData();
            }
          },
          async error => {},
        );
      },
    );
  };
  const filterOrderData = async () => {
    let orderFilter = !isOrder;
    let lstData = dataProduct.dataFilter.filter(
      it => it.UserInput !== null && it.UserInput > 0,
    );
    if (orderFilter) {
      await setDataProduct({ ...dataProduct, dataView: lstData });
    } else {
      await setDataProduct({
        ...dataProduct,
        dataView: dataProduct.dataFilter,
      });
      await setSearch('');
    }
    await setIsOrder(e => !e);
  };
  const filterProduct = async str => {
    let mDataFilter = [];
    if (str !== null && str !== undefined && str.length > 0) {
      mDataFilter = dataProduct.dataFilter.filter(i =>
        i.POPName.toLowerCase().match(str.toLowerCase()),
      );
    } else {
      mDataFilter = dataProduct.dataFilter;
    }
    setDataProduct({ ...dataProduct, dataView: mDataFilter });
    setSearch(str);
  };
  const handlerItemSelect = async (item, index) => {
    setItemSelect({ groupId: item.groupId });
    let dataProducts = JSON.parse(item.detailData);
    let dataViewSearch = dataProducts.filter(i =>
      i.POPName.toLowerCase().match(search.toLowerCase()),
    );
    let dataViewFilter = dataProducts.filter(
      it => it.UserInput !== null && it.UserInput > 0,
    );
    await setDataProduct({
      dataView:
        isOrder === true
          ? dataViewFilter
          : search.length > 0
          ? dataViewSearch
          : dataProducts,
      dataFilter: dataProducts,
    });
    ref_group.current.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };
  const RenderItemGroup = ({ item, index }) => {
    const onPress = () => {
      handlerItemSelect(item, index);
    };
    const widthItem = deviceWidth / 4;
    const backgroundColor =
      itemSelect.groupId === item.groupId ? appcolor.surface : appcolor.light;
    const colorTitle =
      itemSelect.groupId === item.groupId ? appcolor.danger : appcolor.dark;
    const fontWeightTitle =
      itemSelect.groupId === item.groupId ? '700' : 'normal';
    const totalRow =
      JSON.parse(item.detailData || [])?.filter(i =>
        isOrder
          ? i.UserInput !== null && i.UserInput > 0
          : i.POPName.toLowerCase().match(search.toLowerCase()),
      ).length || 0;
    return (
      <TouchableOpacity
        key={`DD_${index}`}
        onPress={onPress}
        style={{
          minWidth: widthItem,
          padding: 8,
          backgroundColor: backgroundColor,
          alignItems: 'center',
          borderRadius: 20,
          margin: 5,
          borderWidth: 1,
          borderColor: appcolor.light,
        }}
      >
        <Text
          style={{
            color: colorTitle,
            fontSize: 14,
            fontWeight: fontWeightTitle,
          }}
        >{`${item.groupName} (${totalRow})`}</Text>
      </TouchableOpacity>
    );
  };
  const handerNumberChange = (item, value) => {
    if (value > item.Quantity) {
      MessageInfo(
        'Số lượng đặt hàng không được lớn hơn số lượng kho tổng!!',
        'Thông báo',
        'top',
      );
      setReloadNum(reloadNum + 1);
      return;
    }
    let orderItem = {
      ...item,
      UserInput: value ? value : null,
      QuantityEdit: value ? value : null,
    };
    const listOrderIndex = listOrder.findIndex(it => it.POPId === item.POPId);
    const indexGroup = dataGroup.findIndex(
      it => it.groupId === itemSelect.groupId,
    );
    const indexProduct = dataProduct.dataView.findIndex(
      it => it.POPId === item.POPId,
    );
    const indexProductF = dataProduct.dataFilter.findIndex(
      it => it.POPId === item.POPId,
    );
    dataProduct.dataView[indexProduct] = orderItem;
    dataProduct.dataFilter[indexProductF] = orderItem;
    dataGroup[indexGroup].detailData = JSON.stringify(dataProduct.dataFilter);
    if (value > 0 && value !== null) {
      if (listOrderIndex === -1) {
        setListOrder([...listOrder, orderItem]);
      } else {
        listOrder[listOrderIndex] = orderItem;
        setMutate(e => !e);
      }
    } else {
      const listOrderFilter = listOrder.filter(it => it.POPId !== item.POPId);
      setListOrder(listOrderFilter);
    }
  };
  const handerSheetNumberChange = (item, value) => {
    if (value > item.Quantity) {
      MessageInfo(
        'Số lượng đặt hàng không được lớn hơn số lượng kho tổng!!',
        'Thông báo',
        'top',
      );
      setReloadNum(reloadNum + 1);
      return;
    }
    let orderItem = {
      ...item,
      UserInput: value ? value : null,
      QuantityEdit: value ? value : null,
    };
    const listOrderIndex = listOrder.findIndex(it => it.POPId === item.POPId);
    const indexGroup = dataGroup.findIndex(
      it => it.groupId === itemSelect.groupId,
    );
    const indexProduct = dataProduct.dataView.findIndex(
      it => it.POPId === item.POPId,
    );
    const indexProductF = dataProduct.dataFilter.findIndex(
      it => it.POPId === item.POPId,
    );
    dataProduct.dataView[indexProduct] = orderItem;
    dataProduct.dataFilter[indexProductF] = orderItem;
    dataGroup[indexGroup].detailData = JSON.stringify(dataProduct.dataFilter);

    if (listOrderIndex === -1) {
      setListOrder([...listOrder, orderItem]);
    } else {
      listOrder[listOrderIndex] = orderItem;
      setMutate(e => !e);
    }
  };
  const RenderItem = ({ item, index }) => {
    return (
      <View
        key={`I_P_P_${index}`}
        style={{
          flex: 1,
          padding: 8,
          flexDirection: 'row',
          borderBottomWidth: 0.5,
          borderColor: appcolor.light,
        }}
      >
        <View
          style={{
            backgroundColor: appcolor.light,
            width: 100,
            height: 100,
            borderRadius: 15,
            padding: 8,
          }}
        >
          {item.Image !== null && item.Image?.length > 0 ? (
            <Image
              source={{ uri: item.Image }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <AnimatedLottieView
              autoPlay={false}
              source={require('../../../Themes/lotties/no_image.json')}
            />
          )}
        </View>
        <View
          style={{
            flex: 1,
            padding: 5,
            paddingLeft: 20,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.titleItem}>{`${index + 1}. ${
              item.POPName
            }`}</Text>
            {item.Quantity ? (
              <Text style={{ ...styles.textItem, color: appcolor.red }}>
                Tồn kho tổng : {item.Quantity}
              </Text>
            ) : null}
            {item.QuantityMyHouse == 0 || item.QuantityMyHouse ? (
              <Text style={styles.textItem}>
                Tồn kho cá nhân : {item.QuantityMyHouse}
              </Text>
            ) : null}
          </View>
        </View>
        <NumPad_V2
          containerStyle={{
            width: '30%',
            bottom: 8,
            end: 8,
            position: 'absolute',
          }}
          index={index}
          value={item.UserInput}
          item={item}
          editable={true}
          reloadNum={reloadNum}
          placeholderText={'SL'}
          handerNumberChange={handerNumberChange}
        />
      </View>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.surface,
    },
    titleItem: {
      width: '100%',
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 5,
    },
    textItem: { color: appcolor.dark, fontSize: 12, fontWeight: '600' },
    numberItem: {
      width: '100%',
      color: appcolor.greylight,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
    },
    inputStyle: {
      fontSize: 14,
      color: appcolor.dark,
      backgroundColor: appcolor.light,
      fontWeight: '500',
      alignSelf: 'center',
      width: '50%',
      textAlign: 'center',
      borderWidth: 0.5,
      borderRadius: 10,
      borderColor: appcolor.grayLight,
      height: 38,
    },
  });
  const handlerClearOrder = item => {
    Message(
      'Chú ý',
      `Bạn có chắc chắn muốn xóa sản phẩm ${item.POPName} đã đặt này không?`,
      async () => {
        let orderItem = { ...item, UserInput: null, QuantityEdit: null };
        const listFilter = listOrder.filter(it => it.POPId !== item.POPId);
        const indexProduct = dataProduct.dataView.findIndex(
          it => it.POPId === item.POPId,
        );
        const indexProductF = dataProduct.dataFilter.findIndex(
          it => it.POPId === item.POPId,
        );
        const indexGroup = dataGroup.findIndex(
          it => it.groupId === itemSelect.groupId,
        );
        dataProduct.dataView[indexProduct] = orderItem;
        dataProduct.dataFilter[indexProductF] = orderItem;
        dataGroup[indexGroup].detailData = JSON.stringify(
          dataProduct.dataFilter,
        );
        setListOrder(listFilter);
      },
    );
  };
  const handlerChangeText = (text, type) => {
    if (type === 'ADDRESS') {
      setEmpoyeeAddres(text);
    } else if (type === 'NOTE') {
      setNote(text);
    }
  };
  const openSheet = async (item, type) => {
    await Keyboard.dismiss();
    if (type === 'CHECK_ORDER') {
      if (listOrder.length > 0) {
        setVisible(true);
      } else {
        ToastError('Chưa có đơn hàng nào!', 'Thông báo', 'top');
        return;
      }
    }
  };
  const handlerAddress = async () => {
    await AttendantController.LocationFromAddress(
      employeeAddress,
      async dataLocation => {
        setEmpoyeeAddres(dataLocation.address);
      },
      () => alertError('Không tìm thấy địa chỉ, vui lòng kiểm tra và thử lại'),
    );
  };
  const handleCloseModal = () => {
    const listOrderFilter = listOrder.filter(
      it => it.UserInput >= 0 && it.UserInput !== null,
    );
    setListOrder(listOrderFilter);
    setVisible(false);
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={
          route.params?.popMenu.wareHouseName || route.params?.popMenu.menuName
        }
        leftFunc={() => onGoBack()}
        rightFunc={() => openSheet(null, 'CHECK_ORDER')}
        iconRight={'shopping-cart'}
        iconMiddle="poll-h"
        middleFunc={() => (!loading ? filterOrderData() : null)}
      />

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <FormGroup
            editable
            containerStyle={{
              width: '95%',
              backgroundColor: appcolor.grayLight,
              padding: 5,
              margin: 8,
              alignSelf: 'center',
            }}
            inputStyle={{ fontSize: 14, color: appcolor.dark }}
            placeholder="Tìm kiếm sản phẩm"
            iconName="search"
            value={search}
            onClearTextAndroid={filterProduct}
            handleChangeForm={filterProduct}
          />
        </View>
        <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
        <View style={{ width: '100%' }}>
          <FlatList
            key={'headeritem'}
            ref={ref_group}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingRight: 10 }}
            snapToAlignment="start"
            decelerationRate="fast"
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dataGroup}
            renderItem={RenderItemGroup}
          />
        </View>

        <FlatList
          style={{ padding: 8 }}
          key={'productlistpop'}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          data={dataProduct.dataView}
          renderItem={RenderItem}
        />
      </View>
      <Modal visible={isVisible}>
        <SafeAreaView style={{ width: '100%', height: '100%' }}>
          <HeaderCustom
            isHome
            title="Đơn hàng của bạn"
            leftFunc={() => setVisible(false)}
            rightFunc={uploadAction}
            iconLeft="times"
            iconRight="cloud-upload-alt"
          />
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%', height: deviceHeight }}
            extraHeight={deviceHeight / 4}
            enableOnAndroid
          >
            <FormGroup
              containerStyle={{ margin: 8 }}
              inputStyle={{ flex: 1 }}
              title={'Địa chỉ nhận hàng'}
              editable
              multiline
              value={employeeAddress || ''}
              keyboardType={'default'}
              placeholder={'Nhập địa chỉ nhận hàng'}
              handleChangeForm={text => handlerChangeText(text, 'ADDRESS')}
              rightFunc={handlerAddress}
              useClearAndroid={false}
              iconRight="search"
            />
            <FormGroup
              containerStyle={{ margin: 8 }}
              title={'Ghi chú'}
              editable
              multiline
              value={note || ''}
              keyboardType={'default'}
              placeholder={'Nhập nội dung ghi chú'}
              handleChangeForm={text => handlerChangeText(text, 'NOTE')}
            />
            {listOrder.length > 0 &&
              listOrder.map((item, index) => {
                return (
                  <GmailStyleSwipeableRow
                    key={`item_sw_${index}`}
                    deleteItem={() => handlerClearOrder(item)}
                  >
                    <View
                      style={{
                        flex: 1,
                        padding: 8,
                        flexDirection: 'row',
                        borderBottomWidth: 0.6,
                        borderColor: appcolor.grayLight,
                        backgroundColor: appcolor.light,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: appcolor.surface,
                          width: 80,
                          height: 80,
                          borderRadius: 15,
                          padding: 8,
                        }}
                      >
                        {item.Image !== null && item.Image?.length > 0 ? (
                          <Image
                            source={{ uri: item.Image }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <AnimatedLottieView
                            autoPlay={false}
                            source={require('../../../Themes/lotties/no_image.json')}
                          />
                        )}
                        <Badge
                          containerStyle={{
                            position: 'absolute',
                            top: -5,
                            end: -10,
                          }}
                          textStyle={{
                            color: appcolor.light,
                            fontSize: 11,
                            fontWeight: '500',
                          }}
                          badgeStyle={{
                            minWidth: 30,
                            height: 25,
                            backgroundColor: appcolor.blacklight,
                            borderRadius: 50,
                          }}
                          value={item.Quantity}
                        />
                      </View>
                      <View style={{ flex: 1, padding: 5, paddingLeft: 18 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.titleItem}>{`${index + 1}. ${
                            item.POPName
                          }`}</Text>
                          <Text
                            style={{
                              ...styles.textItem,
                              color: appcolor.greylight,
                            }}
                          >
                            Tồn kho cá nhân : {item.QuantityMyHouse || 0}
                          </Text>
                        </View>
                        <NumPad_V2
                          containerStyle={{
                            width: '50%',
                            alignSelf: 'flex-end',
                          }}
                          inputStyle={{ backgroundColor: appcolor.surface }}
                          index={index}
                          value={item.UserInput}
                          item={item}
                          editable={true}
                          reloadNum={reloadNum}
                          placeholderText={'Số lượng'}
                          handerNumberChange={handerSheetNumberChange}
                        />
                      </View>
                    </View>
                  </GmailStyleSwipeableRow>
                );
              })}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
