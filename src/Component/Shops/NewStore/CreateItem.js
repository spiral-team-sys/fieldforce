import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  AppState,
  DeviceEventEmitter,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  CreateItemStore,
  GetConfigNewStore,
  getMasterNewStore,
} from '../../../Controller/ShopController';
import { Icon, Image, Slider, Text } from '@rneui/themed';
import FormGroup from '../../../Content/FormGroup';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import { RegionMain } from '../../../Control/RegionControl/RegionMain';
import { AutoCompleteAddress } from '../../BusinessTrips/AutoCompleteAddress';
import {
  alertConfirm,
  deviceHeight,
  deviceWidth,
  isValid,
} from '../../../Core/Utility';
import {
  CheckLocation,
  GetUrl,
  LocationEnabled,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
  isPhone,
} from '../../../Core/Helper';
import { LoadingView } from '../../../Control/ItemLoading';
import _ from 'lodash';
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import NativeCamera from '../../../Control/NativeCamera';
import ImageZoom from '../../../Content/ImageZoom';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import {
  PERMISSIONS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const CreateItem = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const [dataMaster, setDataMaster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeItem, setStoreItem] = useState({
    shopId: 0,
    shopCode: `${JSON.parse(kpiinfo.reportItem).codeCreate || 'SM.'
      }${Math.floor(Math.random() * 999999 + 100)}`,
    codeDealer: null,
    shopName: null,
    address: null,
    warehouseName: null,
    warehouseCode: null,
    dealerName: null,
    supDealerName: null,
    supType: '[]',
    dealerId: null,
    email: null,
    phone: null,
    storeSize: null,
    frequencyValue: null,
    frequency: 0,
    provinceCode: null,
    districtCode: null,
    townCode: null,
    provinceName: null,
    districtName: null,
    townName: null,
    potentialOutput: null,
    latitude: 0,
    longitude: 0,
    idStore: null,
    imageOverview: null,
    contactName: null,
    levelCode: null,
    level: null,
    shopFormatId: null,
    shopFormat: null,
  });
  // Location
  const getLocationLast = async () => {
    await Geolocation.getCurrentPosition(
      async info => {
        const guidValue = UUIDGenerator();
        await setStoreItem({
          ...storeItem,
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
          idStore: guidValue,
        });
      },
      error => {
        alertConfirm(
          'Cài đặt vị trí',
          'Vui lòng kiểm tra cài đặt vị trí của thiết bị và thử lại sau',
          async () => {
            if (Platform.OS == 'ios') {
              await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                .then(result => {
                  switch (result) {
                    case 'blocked':
                    case 'unavailable':
                    case 'limited':
                      openSettings().catch(e => {
                        console.log(e);
                      });
                      break;
                    case 'denied':
                      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                      break;
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                .then(result => {
                  switch (result) {
                    case 'blocked':
                    case 'unavailable':
                    case 'limited':
                      openSettings().catch(e => {
                        console.log(e);
                      });
                      break;
                    case 'denied':
                      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
                      break;
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            }
          },
          () => { },
          'Cài đặt',
          'Huỷ',
        );
      },
    );
  };
  //
  const configData = async () => {
    await setLoading(true);
    //
    await getLocationLast();
    await GetConfigNewStore(async mData => {
      await setDataMaster([]);
      await ResetInput();
      await setDataMaster(mData);
    });
    await setLoading(false);
  };
  // handler
  const handlerCreate = async () => {
    await checkInput(async (result, message) => {
      if (!result) {
        ToastError(message, 'Thông báo', 'top');
        return;
      } else {
        alertConfirm(
          'Thông báo',
          'Bạn có muốn tạo cửa hàng này không ?',
          async () => {
            const contentMassage = `Nhân viên (${userinfo.employeeCode}) ${userinfo.employeeName} - Tạo mới cửa hàng: (${storeItem.shopCode}) ${storeItem.shopName}`;
            await CreateItemStore(
              { ...storeItem, typeAction: 'INSERT' },
              contentMassage,
              async data => {
                if (data.status == 200) {
                  await DeviceEventEmitter.emit('updatealldata');
                  ToastSuccess(data.messeger, 'Thông báo', 'top');
                  await navigation.goBack();
                } else ToastError(data.messeger, 'Lỗi', 'top');
              },
            );
          },
        );
      }
    });
  };
  const checkInput = actionResult => {
    if (storeItem.imageOverview == null) {
      ToastError('Vui lòng chụp hình tổng quan cửa hàng');
      return;
    }
    for (let index = 0; index < dataMaster.length; index++) {
      const i = dataMaster[index];
      if (i.isRequired == 1) {
        if (i.ref_Code == 'shopAddress') {
          if (!isValid(storeItem.provinceCode)) {
            actionResult(false, 'Vui lòng chọn Tỉnh/Thành phố');
            return;
          }
          if (!isValid(storeItem.districtCode)) {
            actionResult(false, 'Vui lòng chọn Quận/Huyện');
            return;
          }
          if (!isValid(storeItem.townCode)) {
            actionResult(false, 'Vui lòng chọn Phường/Xã');
            return;
          }
        } else if (!isValid(storeItem[i.ref_Code] || null)) {
          actionResult(false, `Vui lòng nhập ${i.itemName}`);
          return;
        } else if (i.ref_Code == 'supType') {
          if (
            !isValid(storeItem[i.ref_Code] || null) ||
            (storeItem[i.ref_Code] || null) == '[]'
          ) {
            actionResult(false, `Vui lòng nhập ${i.itemName}`);
            return;
          }
        } else {
          if (isValid(storeItem.phone) && storeItem.phone.length > 0) {
            const checkPhone = isPhone(storeItem.phone);
            if (!checkPhone) {
              actionResult(false, 'Số điện thoại không đúng định dạng');
              return;
            }
          }
        }
      }
    }
    actionResult(true, null);
  };
  const ResetInput = async () => {
    const idStoreNew = UUIDGenerator();
    await setStoreItem({
      shopId: 0,
      shopCode: `${JSON.parse(kpiinfo.reportItem).codeCreate || 'SM.'
        }${Math.floor(Math.random() * 999999 + 100)}`,
      shopName: null,
      address: null,
      warehouseName: null,
      warehouseCode: null,
      dealerName: null,
      supDealerName: null,
      supType: '[]',
      dealerId: null,
      email: null,
      phone: null,
      storeSize: null,
      frequencyValue: null,
      frequency: 0,
      provinceCode: null,
      districtCode: null,
      townCode: null,
      provinceName: null,
      districtName: null,
      townName: null,
      potentialOutput: null,
      latitude: 0,
      longitude: 0,
      idStore: idStoreNew,
      imageOverview: null,
      contactName: null,
      levelCode: null,
      level: null,
      shopFormatId: null,
      shopFormat: null,
    });
  };
  const handlerAddressChoose = async (text, typeItem, _location) => {
    if (typeItem == 'address') {
      await setStoreItem({ ...storeItem, address: text });
    }
  };
  const handlerItemChangeText = (text, typeItem) => {
    switch (typeItem) {
      case 'shopName':
        setStoreItem({ ...storeItem, shopName: text });
        break;
      case 'codeDealer':
        setStoreItem({ ...storeItem, codeDealer: text });
        break;
      case 'email':
        setStoreItem({ ...storeItem, email: text });
        break;
      case 'phone':
        setStoreItem({ ...storeItem, phone: text });
        break;
      case 'storeSize':
        setStoreItem({ ...storeItem, storeSize: text });
        break;
      case 'potentialOutput':
        setStoreItem({ ...storeItem, potentialOutput: text });
        break;
      case 'frequency':
        setStoreItem({ ...storeItem, frequency: parseInt(text) || 0 });
        break;
      case 'contactName':
        setStoreItem({ ...storeItem, contactName: text });
        break;
      case 'address':
        setStoreItem({ ...storeItem, address: text });
        break;
      default:
        setStoreItem({ ...storeItem, [typeItem]: text });
        break;
    }
  };
  const handlerSelectItem = (item, type) => {
    switch (type) {
      case 'warehouse':
        setStoreItem({
          ...storeItem,
          warehouseCode: item.wareHouseCode,
          warehouseName: item.itemName,
        });
        break;
      case 'dealerName':
        setStoreItem({
          ...storeItem,
          dealerId: item.dealerId,
          dealerName: item.itemName,
        });
        break;
      case 'shopAddress':
        setStoreItem({
          ...storeItem,
          provinceCode: item.provinceCode,
          districtCode: item.districtCode,
          townCode: item.townCode,
          provinceName: item.provinceName,
          districtName: item.districtName,
          townName: item.townName,
        });
        break;
      case 'frequencyValue':
        setStoreItem({
          ...storeItem,
          frequency: item.itemValue,
          frequencyValue: item.itemName,
        });
        break;
      case 'potentialOutput':
        setStoreItem({ ...storeItem, potentialOutput: item.itemName });
        break;
      case 'level':
        setStoreItem({
          ...storeItem,
          levelCode: item.itemCode,
          level: item.itemName,
        });
        break;
      case 'shopFormat':
        setStoreItem({
          ...storeItem,
          shopFormatId: item.itemId,
          shopFormat: item.itemName,
        });
        break;
    }
  };
  const handlerSelectMultiItem = (type, dataItem) => {
    switch (type) {
      case 'supType':
        setStoreItem({ ...storeItem, supType: JSON.stringify(dataItem) });
        break;
    }
  };
  const handlerSetPhoto = async info => {
    await setStoreItem({ ...storeItem, imageOverview: info.imageUrl });
  };
  const takeOverview = async () => {
    if (storeItem.latitude == 0 || storeItem.longitude == 0) {
      ToastError('Thiết bị chưa lấy được toạ độ, Vui lòng thử lại sau ít phút');
      await getLocationLast();
    } else {
      const photoinfo = {
        shopId: 0,
        shopCode: storeItem.shopCode,
        reportId: -1,
        photoDate: moment().format('YYYYMMDD'),
        photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
        photoType: '-1',
        dataUpload: 0,
        fileUpload: 0,
        photoPath: null,
        latitude: storeItem.latitude,
        longitude: storeItem.longitude,
        guid: storeItem.idStore,
        photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      await CheckLocation(async () => {
        await LocationEnabled(async enabled => {
          if (enabled === true) {
            NativeCamera.cameraStart(photoinfo, {
              ...storeItem,
              callBackOverView: handlerSetPhoto,
            });
          }
        });
      });
    }
  };
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    titleShopCode: {
      width: '50%',
      alignSelf: 'center',
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '800',
      color: appcolor.info,
      padding: 8,
      margin: 8,
      borderWidth: 0.5,
      borderRadius: 10,
      borderColor: appcolor.greydark,
    },
    mainItem: {
      flexGrow: 1,
      flexDirection: 'row',
      padding: 8,
      marginBottom: 0,
    },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    overflowView: {
      width: deviceWidth,
      height: deviceHeight,
      position: 'absolute',
      zIndex: 1000,
      backgroundColor: appcolor.dark,
      opacity: 0.8,
      justifyContent: 'center',
    },
  });
  useEffect(() => {
    configData();
  }, []);
  const ViewImage = () => {
    return (
      <TouchableOpacity
        onPress={() =>
          storeItem.imageOverview !== null
            ? SheetManager.show('photoview')
            : takeOverview()
        }
      >
        <Image
          source={{ uri: GetUrl(storeItem.imageOverview) }}
          style={{ width: '100%', minHeight: 230, borderRadius: 12 }}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN || 'Tạo mới cửa hàng'}
        leftFunc={() => navigation.goBack()}
        iconRight="cloud-upload-alt"
        rightFunc={handlerCreate}
      />
      <LoadingView
        isLoading={loading}
        styles={{ marginTop: 8 }}
        title="Đang cập nhật dữ liệu"
      />
      <ScrollView
        contentContainerStyle={{ padding: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 15,
            fontWeight: '600',
            color: appcolor.dark,
            marginTop: 8,
          }}
        >
          Mã cửa hàng
        </Text>
        <Text style={styles.titleShopCode}>{storeItem.shopCode}</Text>
        <View style={styles.mainItem}>
          <SpiralIcon
            name={'camera'}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
          <Text style={styles.titleHeader}>
            {`Hình tổng quan cửa hàng`}
            <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
          </Text>
        </View>
        <View
          style={{
            margin: 8,
            backgroundColor: appcolor.surface,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={takeOverview}
            style={{
              position: 'absolute',
              end: 0,
              top: 0,
              zIndex: 10,
              padding: 16,
            }}
          >
            <SpiralIcon
              name="camera"
              type="font-awesome-5"
              color={appcolor.blacklight}
              size={28}
            />
          </TouchableOpacity>
          <ViewImage />
          {/* <TouchableOpacity onPress={() => storeItem.imageOverview !== null ? SheetManager.show('photoview') : takeOverview()}>
						<Image source={{ uri: GetUrl(storeItem.imageOverview) }} style={{ width: '100%', minHeight: 230, borderRadius: 12 }} />
					</TouchableOpacity> */}
        </View>
        {!loading &&
          dataMaster.length > 0 &&
          dataMaster.map((item, index) => {
            return (
              <RenderItemView
                key={`iifc_${index}`}
                storeItem={storeItem}
                item={item}
                handlerSelectItem={handlerSelectItem}
                handlerItemChangeText={handlerItemChangeText}
                handlerAddressChoose={handlerAddressChoose}
                handlerSelectMultiItem={handlerSelectMultiItem}
              />
            );
          })}
        <View style={{ height: deviceHeight / 2 }} />
      </ScrollView>
      <ActionSheet
        id="photoview"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: appcolor.light,
          }}
        >
          <ImageZoom ImagePath={storeItem.imageOverview} />
          <TouchableOpacity
            onPress={() => SheetManager.hide('photoview')}
            style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}
          >
            <SpiralIcon
              name="close"
              type="font-asomeware-5"
              size={30}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </View>
  );
};
const RenderItemView = ({
  storeItem,
  item,
  handlerSelectItem,
  handlerItemChangeText,
  handlerAddressChoose,
  handlerSelectMultiItem,
}) => {
  const data = JSON.parse(item.dataItem || '[]');
  let supData = [];
  if (item.filterList !== null) {
    if (storeItem.supType !== '[]') {
      supData = JSON.parse(storeItem.supType || '[]');
    } else {
      supData = _.filter(data, e => {
        return e.dealerName == storeItem[item.filterList];
      });
    }
  }
  switch (item.ref_Name) {
    case 'itemInput':
      return (
        <ItemInput
          typeFilter={item.ref_Code}
          isRequire={item.isRequired == 1}
          titleName={item.itemName}
          placeholder={item.placeholder}
          iconName={item.iconName}
          itemValue={storeItem[item.ref_Code]}
          onChangeText={handlerItemChangeText}
        />
      );
    case 'itemSelected':
      return (
        <MutipleItemSelected
          isRequire={item.isRequired == 1}
          typeItem={item.ref_Code}
          isFilter={data.length > 5}
          titleName={item.itemName}
          iconName={item.iconName}
          dataItems={data}
          placeholder={item.placeholder}
          defaultValue={storeItem[item.ref_Code]}
          onItemChoose={handlerSelectItem}
        />
      );
    case 'mutipleItemSelected':
      return (
        <MultipleSelect
          isRequire={item.isRequired == 1}
          typeItem={item.ref_Code}
          isFilter={data.length > 5}
          titleName={item.itemName}
          iconName={item.iconName}
          dataView={supData}
          placeholder={item.placeholder}
          onItemChange={handlerSelectMultiItem}
        />
      );
    case 'sliderView':
      return (
        <SliderView
          typeFilter={item.ref_Code}
          isRequire={item.isRequired == 1}
          titleName={item.itemName}
          iconName={item.iconName}
          maxLength={item.lengthValue}
          keyboardType="numeric"
          placeholder={`${item.placeholder} ${storeItem[item.ref_Code]
            } Lần/Tháng`}
          itemValue={storeItem[item.ref_Code]}
          onChangeText={handlerItemChangeText}
        />
      );
    case 'regionMain':
      return (
        <RegionMain
          typeFilter={item.ref_Code}
          isRequire={item.isRequired == 1}
          titleName={item.itemName}
          actionResult={handlerSelectItem}
        />
      );
    case 'autocomplete':
      return (
        <AutoCompleteAddress
          typeFilter={item.ref_Code}
          isRequire={item.isRequired == 1}
          titleName={item.itemName}
          placeholder={item.placeholder}
          iconName={item.iconName}
          itemValue={storeItem[item.ref_Code]}
          onChooseItem={handlerAddressChoose}
          isFreeText={true}
          handleTextChange={handlerAddressChoose}
        />
      );
    default:
      return null;
  }
};
const ItemInput = forwardRef((props, _ref) => {
  const {
    titleName,
    iconName,
    isRequire,
    onActionRight,
    typeFilter,
    itemValue,
    placeholder,
    onChangeText,
    keyboardType = 'default',
    editable = true,
    isViewInput = true,
    mobileLength = false,
  } = props;
  const { appcolor } = useSelector(state => state.GAppState);
  const widthItem = onActionRight !== undefined ? '86%' : '100%';
  const styles = StyleSheet.create({
    mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    inputView: {
      width: widthItem,
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 0,
    },
  });
  const onPress = () => {
    onActionRight(typeFilter, itemValue);
  };
  const handlerChangeValue = text => {
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  return (
    <View style={styles.mainItem}>
      <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      {placeholder && (
        <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      )}
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        {isViewInput && (
          <FormGroup
            keyboardType={keyboardType}
            containerStyle={styles.inputView}
            editable={editable}
            multiline
            useClearAndroid={false}
            value={itemValue}
            maxLength={mobileLength ? 10 : 10000}
            handleChangeForm={handlerChangeValue}
          />
        )}
        {onActionRight !== undefined && (
          <TouchableOpacity
            style={{
              width: '10%',
              padding: 10,
              marginStart: 10,
              backgroundColor: appcolor.info,
              borderRadius: 50,
            }}
            onPress={onPress}
          >
            <SpiralIcon
              type="font-awesome-5"
              name="search"
              size={18}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
const SliderView = ({
  titleName,
  iconName,
  isRequire,
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  maxLength,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    inputView: {
      width: '30%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      marginBottom: 0,
      marginEnd: 16,
    },
    viewItem: {
      fontSize: 16,
      fontWeight: '600',
      color: appcolor.dark,
      margin: 10,
    },
  });
  const handlerChangeValue = text => {
    itemValue = text;
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  return (
    <View style={styles.mainItem}>
      <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      {placeholder && (
        <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      )}
      <Slider
        step={1}
        orientation="horizontal"
        //
        style={{ width: '80%', alignSelf: 'center' }}
        thumbStyle={{ height: 20, width: 20 }}
        thumbTintColor={appcolor.dark}
        thumbTouchSize={{ width: 20, height: 20 }}
        trackStyle={{ height: 5, borderRadius: 20 }}
        //
        maximumTrackTintColor={appcolor.grayLight}
        minimumTrackTintColor={appcolor.redgray}
        maximumValue={maxLength}
        minimumValue={0}
        //
        value={itemValue}
        onSlidingComplete={handlerChangeValue}
      />
    </View>
  );
};
const MultipleSelect = ({
  titleName,
  iconName,
  typeItem,
  isRequire = false,
  dataView,
  onItemChange,
  containerStyle,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataItem, setDataItem] = useState([]);
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    setDataItem(dataView);
  };
  const handlerItemAction = (item, index) => {
    dataView[index].isChoose == 1;
    setMutate(e => !e);
    onItemChange(typeItem, dataView);
  };
  const renderItem = (item, index) => {
    const onPress = () => {
      item.isChoose = item.isChoose == 1 ? 0 : 1;
      handlerItemAction(item, index);
    };
    const styleView =
      item.isChoose == 1
        ? {
          ...styles.itemContent,
          borderWidth: 1,
          borderColor: appcolor.primary,
        }
        : styles.itemContent;
    const styleTitle =
      item.isChoose == 1
        ? { ...styles.itemName, fontWeight: '700', color: appcolor.primary }
        : styles.itemName;
    return (
      <TouchableOpacity
        key={`${typeItem}_${index}`}
        style={styleView}
        onPress={onPress}
      >
        <Text style={styleTitle}>{item.itemName}</Text>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    LoadData();
    return () => false;
  }, [dataView]);
  const styles = StyleSheet.create({
    mainContainer: { flexGrow: 1, padding: 8, marginBottom: 1 },
    itemContent: {
      flexGrow: 1,
      backgroundColor: appcolor.light,
      borderRadius: 5,
      padding: 8,
      margin: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '300',
      color: appcolor.dark,
      textAlign: 'center',
      marginStart: 8,
      marginEnd: 8,
    },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    filterItemContent: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      padding: 3,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },

    itemMain: {
      borderRadius: 5,
      borderWidth: 0.3,
      borderColor: appcolor.placeholderText,
      marginEnd: 8,
      marginTop: 5,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    itemMainChoose: {
      borderRadius: 5,
      backgroundColor: appcolor.primary,
      marginEnd: 8,
      marginTop: 5,
      justifyContent: 'center',
      alignSelf: 'center',
    },
  });
  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <View style={{ width: '100%', flexDirection: 'row' }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          minHeight: 50,
        }}
      >
        {dataView.map((item, i) => {
          return renderItem(item, i);
        })}
      </View>
    </View>
  );
};
export default CreateItem;
