import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import ModalItem from '../../Control/ModalItem';
import {
  GET_ConfigSellOut,
  GET_RequiredSellOut,
} from '../../Controller/MasterController';
import { groupDataByKey, checkIMEI, debounce } from '../../Core/Helper';
// //import NumberFormat from "react-number-format";
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { typemodal } from '../../Core/KEYs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  alertToast,
  alertWarning,
  onValidPhoneNumber,
  ConvertToInt,
  alertNotify,
} from '../../Core/Utility';
import { CheckIMEISellout } from '../../Controller/WorkController';
import {
  reportSellOut_SAVE,
  reportSellOut_UPDATE,
  V2_SaveItemSellOut,
} from '../../Controller/SellOutController';

const CreateSellOutItem = ({
  navigation,
  workinfo,
  dataShop,
  dataCompetitor,
  dataCategory,
  dataSubCategory,
  dataSegment,
  dataSubSegment,
  dataProduct,
  isWorking,
  viewItemHistory,
  guiId,
  actionBack,
  sellOutId,
}) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [dataMasterList, setDataMasterList] = useState([]);
  const [dataModal, setDataModal] = useState({
    typeModal: '',
    titleModal: '',
    visible: false,
    dataSelect: [],
    dataFilter: [],
  });
  const [itemSellOut, setItemSellOut] = useState({
    isLockInfo: false,
    isCompetitor: false,
    shopId: workinfo.shopId,
    shopName: workinfo.shopName,
    productId: 0,
    productCode: '',
    productName: 'Chọn sản phẩm',
    competitorId: 0,
    competitorName: 'Chọn hãng',
    categoryId: 0,
    categoryName: 'Chọn ngành hàng',
    subCategoryId: 0,
    subCategoryName: 'Chọn ngành hàng nhỏ',
    segmentId: 0,
    segmentName: 'Chọn loại',
    subSegmentId: 0,
    subSegmentName: 'Chọn loại nhỏ',
    colorId: 0,
    colorName: 'Chọn màu',
    genderId: 0,
    genderName: 'Chọn giới tính',
    ageId: 0,
    ageName: 'Chọn tuổi',
    quantity: 1,
    price: '',
    customerName: '',
    phoneNumber: '',
    customerAddress: '',
    imei: '',
    note: '',
  });
  const LoadData = async () => {
    await GET_ConfigSellOut(isWorking, async mData => {
      const { arr } = await groupDataByKey({
        arr: mData,
        key: 'groupId',
      });
      await setDataMasterList(arr);
    });
  };
  const resetItemSellOut = () => {
    if (itemSellOut.isLockInfo) {
      setItemSellOut({
        ...itemSellOut,
        shopId: 0,
        shopName: 'Chọn cửa hàng',
        productId: 0,
        productName: 'Chọn sản phẩm',
        competitorId: 0,
        competitorName: 'Chọn hãng',
        categoryId: 0,
        categoryName: 'Chọn ngành hàng',
        subCategoryId: 0,
        subCategoryName: 'Chọn ngành hàng nhỏ',
        segmentId: 0,
        segmentName: 'Chọn loại',
        subSegmentId: 0,
        subSegmentName: 'Chọn loại nhỏ',
        colorId: 0,
        colorName: 'Chọn màu',
        quantity: 1,
        price: '',
        imei: '',
        note: '',
      });
    } else {
      setItemSellOut({
        ...itemSellOut,
        shopId: 0,
        shopName: 'Chọn cửa hàng',
        productId: 0,
        productName: 'Chọn sản phẩm',
        competitorId: 0,
        competitorName: 'Chọn hãng',
        categoryId: 0,
        categoryName: 'Chọn ngành hàng',
        subCategoryId: 0,
        subCategoryName: 'Chọn ngành hàng nhỏ',
        segmentId: 0,
        segmentName: 'Chọn loại',
        subSegmentId: 0,
        subSegmentName: 'Chọn loại nhỏ',
        colorId: 0,
        colorName: 'Chọn màu',
        genderId: 0,
        genderName: 'Chọn giới tính',
        ageId: 0,
        ageName: 'Chọn tuổi',
        quantity: 1,
        price: '',
        customerName: '',
        phoneNumber: '',
        customerAddress: '',
        imei: '',
        note: '',
      });
    }
    actionBack();
  };
  const handlerSave = async () => {
    // Check Data Required
    let errorStr = null;
    await GET_RequiredSellOut(async mData => {
      if (mData.length > 0) {
        for (let i = 0, lengthLst = mData.length; i < lengthLst; i++) {
          const item = mData[i];
          switch (item.ref_Code) {
            case typemodal.SHOP_MODAL:
              if (itemSellOut.shopId == 0) errorStr = 'Chưa chọn cửa hàng';
              break;
            case typemodal.COMPETITOR_MODAL:
              if (itemSellOut.competitorId == 0) errorStr = 'Chưa chọn hãng';
              break;
            case typemodal.CATEGORY_MODAL:
              if (itemSellOut.categoryId == 0)
                errorStr = 'Chưa chọn nghành hàng';
              break;
            case typemodal.SUB_CATEGORY_MODAL:
              if (itemSellOut.subCategoryId == 0)
                errorStr = 'Chưa chọn nghành hàng nhỏ';
              break;
            case typemodal.SEGMENT_MODAL:
              if (itemSellOut.segmentId == 0) errorStr = 'Chưa chọn loại';
              break;
            case typemodal.SUB_SEGMENT_MODAL:
              if (itemSellOut.subSegmentId == 0)
                errorStr = 'Chưa chọn loại nhỏ';
              break;
            case typemodal.PRODUCT_MODAL:
              if (itemSellOut.productId == 0) errorStr = 'Chưa chọn sản phẩm';
              break;
            case typemodal.COLOR_MODAL:
              if (itemSellOut.colorId == 0) errorStr = 'Chưa chọn màu sắc';
              break;
            case typemodal.GENDER_MODAL:
              if (itemSellOut.genderId == 0) errorStr = 'Chưa chọn giới tính';
              break;
            case typemodal.AGE_MODAL:
              if (itemSellOut.ageId == 0) errorStr = 'Chưa chọn tuổi';
              break;
            case typemodal.QUANTITY:
              if (itemSellOut.quantity == 0 || itemSellOut.quantity == '')
                errorStr = 'Chưa nhập số lượng (Số lượng phải lớn hơn 0)';
              break;
            case typemodal.PRICE:
              if (itemSellOut.price == 0 || itemSellOut.price == '')
                errorStr = 'Chưa nhập giá';
              break;
            case typemodal.CUSTOMER:
              if (
                itemSellOut.customerName == 0 ||
                itemSellOut.customerName == ''
              )
                errorStr = 'Chưa nhập tên khách hàng';
              if (itemSellOut.customerName.length < 5)
                errorStr =
                  'Tên khách hàng quá ngắn vui lòng nhập thêm (Họ/Tên Đệm/Tên (Tối thiểu 5 ký tự))';
              break;
            case typemodal.CUSTOMER_ADDRESS:
              if (
                itemSellOut.customerAddress == 0 ||
                itemSellOut.customerAddress == ''
              )
                errorStr = 'Chưa nhập địa chỉ của khách hàng';
              break;
            case typemodal.PHONE:
              if (itemSellOut.phoneNumber == 0 || itemSellOut.phoneNumber == '')
                errorStr = 'Chưa nhập số điện thoại';
              errorStr = onValidPhoneNumber(itemSellOut.phoneNumber);
              break;
            case typemodal.SCAN_IMEI:
              if (itemSellOut.imei == 0 || itemSellOut.imei == '')
                errorStr = 'Chưa nhập số IMEI';
              if (itemSellOut.imei.length < item.textValue)
                errorStr =
                  'Số IMEI chưa đúng định dạng (Tối thiểu ' +
                  item.textValue +
                  ' ký tự)';
              const checkIMEILocal = await CheckIMEISellout(itemSellOut.imei);
              if (checkIMEILocal.length > 0)
                errorStr = 'Số IMEI đã được nhập, vui lòng không nhập trùng';
              const checkIMEIServer = await checkIMEI(
                itemSellOut.imei,
                itemSellOut.productCode,
              );
              if (checkIMEIServer !== null && checkIMEIServer.length > 0)
                errorStr =
                  'Số IMEI đã được nhập lên hệ thống, vui lòng không nhập lại số IMEI này';
              break;
            default:
              errorStr = null;
              break;
          }
        }
      }
    });
    if (errorStr !== null && errorStr.length > 0) {
      alertWarning(errorStr);
    } else {
      const itemSave = {
        workId: workinfo.workId,
        shopId: itemSellOut.shopId,
        auditDate: workinfo.workDate,
        productId: itemSellOut.productId,
        productName: itemSellOut.productName,
        serial: itemSellOut.imei,
        competitorId: itemSellOut.competitorId,
        competitorName:
          itemSellOut.competitorId > 0 ? itemSellOut.competitorName : '',
        categoryId: itemSellOut.categoryId,
        categoryName:
          itemSellOut.categoryId > 0 ? itemSellOut.categoryName : '',
        segmentId: itemSellOut.segmentId,
        segment: itemSellOut.segmentId > 0 ? itemSellOut.segmentName : '',
        SubSegmentId: itemSellOut.subSegmentId,
        SubSegment:
          itemSellOut.subSegmentId > 0 ? itemSellOut.subSegmentName : '',
        quantity: ConvertToInt(itemSellOut.quantity),
        price: ConvertToInt(itemSellOut.price || 0),
        sellComment: itemSellOut.note,
        custName: itemSellOut.customerName,
        custAddress: itemSellOut.customerAddress,
        custPhone: itemSellOut.phoneNumber,
        gender: itemSellOut.genderId > 0 ? itemSellOut.genderName : '',
        age: itemSellOut.ageId > 0 ? itemSellOut.ageName : '',
        color: itemSellOut.colorId > 0 ? itemSellOut.colorName : '',
        guiId: guiId,
        upload: 0,
      };
      await V2_SaveItemSellOut(itemSave, viewItemHistory, message =>
        alertNotify(message),
      );
      await resetItemSellOut();
    }
  };
  const handlerShowItemChoose = async (titleHeader, type, listData) => {
    switch (type) {
      case typemodal.SHOP_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataShop,
          dataFilter: dataShop,
        });
        break;
      case typemodal.PRODUCT_MODAL:
        const productList = dataProduct.filter(
          i =>
            (i.type == itemSellOut.competitorId ||
              itemSellOut.competitorId == 0) &&
            (i.categoryId == itemSellOut.categoryId ||
              itemSellOut.categoryId == 0) &&
            (i.subCatId == itemSellOut.subCategoryId ||
              itemSellOut.subCategoryId == 0) &&
            (i.segmentId == itemSellOut.segmentId ||
              itemSellOut.segmentId == 0) &&
            (i.SubSegmentId == itemSellOut.subSegmentId ||
              itemSellOut.subSegmentId == 0),
        );
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: productList,
          dataFilter: productList,
        });
        break;
      case typemodal.COMPETITOR_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataCompetitor,
          dataFilter: dataCompetitor,
        });
        break;
      case typemodal.CATEGORY_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataCategory,
          dataFilter: dataCategory,
        });
        break;
      case typemodal.SUB_CATEGORY_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataSubCategory,
          dataFilter: dataSubCategory,
        });
        break;
      case typemodal.SEGMENT_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataSegment,
          dataFilter: dataSegment,
        });
        break;
      case typemodal.SUB_SEGMENT_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: dataSubSegment,
          dataFilter: dataSubSegment,
        });
        break;
      case typemodal.COLOR_MODAL:
      case typemodal.GENDER_MODAL:
      case typemodal.AGE_MODAL:
        await setDataModal({
          typeModal: type,
          titleModal: titleHeader,
          visible: true,
          dataSelect: listData,
          dataFilter: listData,
        });
        break;
      default:
        await setDataModal({
          typeModal: type,
          titleModal: '',
          visible: true,
          dataSelect: [],
          dataFilter: [],
        });
        break;
    }
  };
  const handlerTextChange = debounce(async (text, type) => {
    const value = text;
    switch (type) {
      case typemodal.QUANTITY:
        await setItemSellOut({ ...itemSellOut, quantity: value });
        break;
      case typemodal.PRICE:
        await setItemSellOut({ ...itemSellOut, price: value });
        break;
      case typemodal.SCAN_IMEI:
        await setItemSellOut({ ...itemSellOut, imei: value });
        break;
      case typemodal.CUSTOMER:
        await setItemSellOut({ ...itemSellOut, customerName: value });
        break;
      case typemodal.CUSTOMER_ADDRESS:
        await setItemSellOut({ ...itemSellOut, customerAddress: value });
        break;
      case typemodal.PHONE:
        await setItemSellOut({ ...itemSellOut, phoneNumber: value });
        break;
      case typemodal.NOTE:
        await setItemSellOut({ ...itemSellOut, note: value });
        break;
      default:
        break;
    }
  }, 500);
  const handlerCloseModal = async () => {
    await setDataModal({ ...dataModal, visible: false });
  };
  const handlerSeachModal = async text => {
    if (text.length > 0) {
      let lstFilter = dataModal.dataFilter.filter(i =>
        i.name.toLowerCase().match(text.toLowerCase()),
      );
      await setDataModal({ ...dataModal, dataSelect: lstFilter });
    } else {
      await setDataModal({ ...dataModal, dataSelect: dataModal.dataFilter });
    }
  };
  const handlerChooseItem = async item => {
    const idValue = item.id;
    const nameValue = item.name;
    switch (dataModal.typeModal) {
      case typemodal.SHOP_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          shopId: idValue,
          shopName: nameValue,
        });
        break;
      case typemodal.COMPETITOR_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          competitorId: idValue,
          competitorName: nameValue,
          productId: 0,
          productName: 'Chọn sản phẩm',
        });
        break;
      case typemodal.CATEGORY_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          categoryId: idValue,
          categoryName: nameValue,
          productId: 0,
          productName: 'Chọn sản phẩm',
        });
        break;
      case typemodal.SUB_CATEGORY_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          subCategoryId: idValue,
          subCategoryName: nameValue,
          productId: 0,
          productName: 'Chọn sản phẩm',
        });
        break;
      case typemodal.SEGMENT_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          segmentId: idValue,
          segmentName: nameValue,
          productId: 0,
          productName: 'Chọn sản phẩm',
        });
        break;
      case typemodal.SUB_SEGMENT_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          subSegmentId: idValue,
          subSegmentName: nameValue,
          productId: 0,
          productName: 'Chọn sản phẩm',
        });
        break;
      case typemodal.PRODUCT_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          productId: idValue,
          productName: nameValue,
          productCode: item.productCode,
        });
        break;
      case typemodal.COLOR_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          colorId: idValue,
          colorName: nameValue,
        });
        break;
      case typemodal.GENDER_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          genderId: idValue,
          genderName: nameValue,
        });
        break;
      case typemodal.AGE_MODAL:
        await setItemSellOut({
          ...itemSellOut,
          ageId: idValue,
          ageName: nameValue,
        });
        break;
      default:
        break;
    }
    await setDataModal({ ...dataModal, visible: false });
  };
  const handlerClearItem = async item => {};
  const handlerHoldCustomer = async () => {
    !itemSellOut.isLockInfo && alertToast('Giữ thông tin khách hàng');
    await setItemSellOut({
      ...itemSellOut,
      isLockInfo: !itemSellOut.isLockInfo,
    });
  };
  const handlerScanBarCode = async type => {
    let settingCamera = {
      ...workinfo,
      QRCode: 1,
      callBack: handlerSaveBarCode,
    };
    navigation.navigate('Camera', settingCamera);
  };
  const handlerSaveBarCode = async barcode => {
    await setItemSellOut({ ...itemSellOut, imei: barcode[0].data });
  };
  const getValueByType = type => {
    switch (type) {
      case typemodal.SHOP_MODAL:
        return itemSellOut.shopName;
      case typemodal.PRODUCT_MODAL:
        return itemSellOut.productName;
      case typemodal.COMPETITOR_MODAL:
        return itemSellOut.competitorName;
      case typemodal.CATEGORY_MODAL:
        return itemSellOut.categoryName;
      case typemodal.SUB_CATEGORY_MODAL:
        return itemSellOut.subCategoryName;
      case typemodal.SEGMENT_MODAL:
        return itemSellOut.segmentName;
      case typemodal.SUB_SEGMENT_MODAL:
        return itemSellOut.subSegmentName;
      case typemodal.COLOR_MODAL:
        return itemSellOut.colorName;
      case typemodal.GENDER_MODAL:
        return itemSellOut.genderName;
      case typemodal.AGE_MODAL:
        return itemSellOut.ageName;
      case typemodal.QUANTITY:
        return itemSellOut.quantity;
      case typemodal.PRICE:
        return itemSellOut.price;
      case typemodal.CUSTOMER:
        return itemSellOut.customerName;
      case typemodal.CUSTOMER_ADDRESS:
        return itemSellOut.customerAddress;
      case typemodal.PHONE:
        return itemSellOut.phoneNumber;
      case typemodal.SCAN_IMEI:
        return itemSellOut.imei;
      case typemodal.NOTE:
        return itemSellOut.note;
      default:
        return '';
    }
  };
  const renderItem = ({ item, index }) => {
    const placeholder = (item.selectValue > 0 ? 'Chọn ' : 'Nhập ') + item.name;
    const valueItem = getValueByType(item.ref_Code);
    const iconLockInfo = itemSellOut.isLockInfo ? 'lock' : 'unlock';
    const maxLengthText = item.textValue > 1 ? item.textValue : undefined;
    return (
      <View key={index} style={{ width: '100%' }}>
        {item.isParent && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 8,
              paddingEnd: 16,
            }}
          >
            <Text style={styles.titleGroup}>{item.groupName}</Text>
            {item.groupId == 2 && (
              <TouchableOpacity onPress={handlerHoldCustomer}>
                <SpiralIcon
                  type="font-awesome-6"
                  style={{ padding: 8 }}
                  name={iconLockInfo}
                  size={23}
                  color={appcolor.dark}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
        {item.textValue > 0 && (
          <RenderTextInput
            styles={styles}
            appcolor={appcolor}
            titleHeader={item.name}
            typeModal={item.ref_Code}
            placeholderName={placeholder}
            textValue={valueItem}
            maxLength={maxLengthText}
            onTextChange={handlerTextChange}
            actionScan={handlerScanBarCode}
          />
        )}
        {item.numberValue > 0 && (
          <RenderNumberInput
            styles={styles}
            appcolor={appcolor}
            titleHeader={item.name}
            typeModal={item.ref_Code}
            placeholderName={placeholder}
            t
            textValue={valueItem}
            maxLength={item.numberValue > 1 ? item.numberValue : undefined}
            onTextChange={handlerTextChange}
          />
        )}
        {item.decimalValue > 0 && (
          <RenderNumberInput
            styles={styles}
            appcolor={appcolor}
            titleHeader={item.name}
            typeModal={item.ref_Code}
            placeholderName={placeholder}
            t
            textValue={valueItem}
            maxLength={item.decimalValue > 1 ? item.decimalValue : undefined}
            onTextChange={handlerTextChange}
          />
        )}
        {item.selectValue > 0 && (
          <RenderChooseItem
            appcolor={appcolor}
            styles={styles}
            titleHeader={item.name}
            typeModal={item.ref_Code}
            placeholderName={placeholder}
            valueChoose={valueItem}
            showItemChoose={handlerShowItemChoose}
          />
        )}
        {item.filterList !== null && item.filterList.length > 0 && (
          <RenderChooseItem
            appcolor={appcolor}
            styles={styles}
            titleHeader={item.name}
            typeModal={item.ref_Code}
            placeholderName={placeholder}
            listData={JSON.parse(item.filterList)}
            valueChoose={valueItem}
            showItemChoose={handlerShowItemChoose}
          />
        )}
      </View>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemChooseMain: {
      backgroundColor: appcolor.homebackground,
      padding: 8,
      margin: 8,
      borderRadius: 8,
      marginTop: 0,
    },
    itemHeader: {
      color: appcolor.dark,
      fontSize: 15,
      fontWeight: '700',
      padding: 8,
      paddingTop: 0,
    },
    itemValue: {
      width: '95%',
      padding: 8,
      backgroundColor: appcolor.light,
      color: appcolor.dark,
    },
    titleGroup: {
      width: '90%',
      color: appcolor.primary,
      fontWeight: 'bold',
      fontSize: 18,
      padding: 8,
      marginStart: 8,
      textAlignVertical: 'center',
    },
    textInput: {
      width: '100%',
      backgroundColor: appcolor.light,
      padding: 8,
      color: appcolor.dark,
      paddingStart: 8,
    },
  });
  useEffect(() => {
    LoadData();
    return () => false;
  }, [itemSellOut]);
  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS == 'ios' ? 60 : 0}
      >
        <HeaderCustom
          title="Thêm số bán"
          iconLeft={'times'}
          iconRight={'save'}
          leftFunc={() => resetItemSellOut()}
          rightFunc={() => handlerSave()}
        />
        <FlatList
          style={{ marginBottom: Platform.OS == 'ios' ? 18 : 8, marginTop: 8 }}
          keyExtractor={(_, index) => index.toString()}
          data={dataMasterList}
          renderItem={renderItem}
          removeClippedSubviews={true}
        />
        <ModalItem
          dataModal={dataModal}
          actionCloseModal={handlerCloseModal}
          actionChooseItem={handlerChooseItem}
          actionClearItem={handlerClearItem}
          actionSearch={handlerSeachModal}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};
const RenderChooseItem = ({
  styles,
  appcolor,
  titleHeader,
  valueChoose,
  showItemChoose,
  typeModal,
  listData,
}) => {
  const showItem = () => {
    showItemChoose(titleHeader, typeModal, listData);
  };
  return (
    <View style={styles.itemChooseMain}>
      <Text style={styles.itemHeader}>{titleHeader}</Text>
      <TouchableOpacity onPress={showItem}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: appcolor.light,
            alignItems: 'center',
          }}
        >
          <Text style={styles.itemValue}>{valueChoose}</Text>
          <SpiralIcon
            type="font-awesome-6"
            name="chevron-right"
            color={appcolor.dark}
            size={12}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
const RenderTextInput = ({
  styles,
  appcolor,
  titleHeader,
  textValue,
  onTextChange,
  typeModal,
  placeholderName,
  maxLength,
  actionScan,
}) => {
  const isScan = typeModal.includes('SCAN');
  const handleChange = value => {
    onTextChange(value, typeModal);
  };
  const scanBarCode = () => {
    actionScan(typeModal);
  };
  return (
    <View style={styles.itemChooseMain}>
      <Text style={styles.itemHeader}>{titleHeader}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          maxLength={maxLength}
          blurOnSubmit={true}
          defaultValue={textValue}
          style={{
            ...styles.textInput,
            width: isScan ? '89%' : '100%',
            marginEnd: 8,
          }}
          placeholderTextColor={appcolor.grey}
          placeholder={placeholderName}
          onChangeText={handleChange}
        />
        {isScan && (
          <View style={{ backgroundColor: appcolor.dark, borderRadius: 30 }}>
            <TouchableOpacity onPress={scanBarCode}>
              <SpiralIcon
                type="font-awesome-6"
                name="barcode"
                size={21}
                color={appcolor.light}
                style={{ padding: 8 }}
                solid
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
const RenderNumberInput = ({
  styles,
  appcolor,
  titleHeader,
  textValue,
  onTextChange,
  typeModal,
  placeholderName,
  maxLength,
}) => {
  const handleChange = async value => {
    await onTextChange(value, typeModal);
  };
  return (
    <View style={styles.itemChooseMain}>
      <Text style={styles.itemHeader}>{titleHeader}</Text>
      <NumberFormat
        style={{ width: '100%' }}
        displayType="text"
        thousandSeparator={true}
        value={textValue}
        renderText={values => (
          <TextInput
            keyboardType={'numeric'}
            maxLength={maxLength}
            style={styles.textInput}
            placeholderTextColor={appcolor.grey}
            placeholder={placeholderName}
            onChangeText={handleChange}
          >
            {values}
          </TextInput>
        )}
      />
    </View>
  );
};
export default CreateSellOutItem;
