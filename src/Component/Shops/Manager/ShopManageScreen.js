import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import FormGroup from '../../../Content/FormGroup';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { SHOPAPI } from '../../../API/ShopAPI';
import Geolocation from '@react-native-community/geolocation';
import {
  CheckLocation,
  distanceBetween2Points,
  formatNumber,
  removeVietnameseTones,
  UUIDGenerator,
} from '../../../Core/Helper';
import { LoadingView } from '../../../Control/ItemLoading';
import { GroupListData } from '../../../Control/GroupListData';
import { Icon, Image, Text } from '@rneui/base';
import { URLDEFAULT } from '../../../Core/URLs';
import { deviceHeight, fontWeightBold } from '../../../Themes/AppsStyle';
import { TODAY, alertConfirm, checkNetwork } from '../../../Core/Utility';
import { REPORT } from '../../../API/ReportAPI';
import ActionList from './Page/ActionList';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ActionFilter } from '../Control/ActionFilter';
import { FloatActionButton } from './Controls/FloatActionButton';
import { MapApp } from '../../../Control/MapApp';
import CustomListView from '../../../Control/Custom/CustomListView';
import ViewPictures from '../../../Control/Gallary/ViewPictures';
import { PhotoInput } from '../../SaleExplain/Page/PhotoInput';
import { getDataPhotos } from '../../../Controller/PhotoController';
import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toastError, toastSuccess } from '../../../Utils/configToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const SHOP_EXPLAIN_PHOTO_TYPE = 'SHOP_EXPLAIN';

const parseReportItem = value => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (_e) {
    return {};
  }
};

const normalizeExplainPhotos = (photos = []) => {
  return photos.map(item => ({
    photoPath: item.photo || item.photoPath,
    photoDate: item.photoDate || TODAY,
    photoType: item.photoType || SHOP_EXPLAIN_PHOTO_TYPE,
    guid: item.guid,
  }));
};

const ShopManageScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, searchData } = useSelector(
    state => state.GAppState,
  );
  const [dataMain, setDataMain] = useState([]);
  const [dataShop, setDataShop] = useState([]);
  const [dataConfig, setDataConfig] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [myLocation, setMyLocation] = useState({ latitude: 0, longitude: 0 });
  const [isViewMap, setViewMap] = useState(false);
  const [search, _setItemSearch] = useState({
    text: '',
    groupByTag: null,
    isSearch: false,
  });
  const [itemFilter, setItemFilter] = useState({
    search: null,
    newest: false,
    headcount: null,
    byTag: null,
  });
  const [menu, _setMenu] = useState({
    isOpen: false,
    type: null,
    isViewProduct: false,
  });
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [explainForm, setExplainForm] = useState({
    shop: null,
    guid: '',
    reason: '',
    photos: [],
  });
  const [isSubmittingExplain, setSubmittingExplain] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const [mainReportId, SetMainReportId] = useState(null);
  const reportItem = parseReportItem(
    kpiinfo?.reportItem || kpiinfo?.ReportItem,
  );
  const isAddStoreTool = reportItem?.isAddStoreTool == 1;
  const getExplainStorageKey = shop =>
    `SHOP_EXPLAIN_${mainReportId || kpiinfo.id}_${shop?.shopId || 0}`;

  // Data
  const LoadData = async () => {
    await setLoading(true);
    await LoadMyLocation();
    const params = { reportId: mainReportId || kpiinfo.id };
    await REPORT.GetDataConfigReport(params, mData => {
      setDataConfig(mData);
    });
    await SHOPAPI.GetDataShopManager(async (mData, message) => {
      message && toastError('Thông báo', message);
      setDataMain(mData);
      setDataShop(mData);
    });
    await setLoading(false);
  };
  const LoadMyLocation = async () => {
    await CheckLocation(() => {
      Geolocation.getCurrentPosition(
        position => {
          setMyLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setMyLocation({ latitude: 0, longitude: 0 });
        },
      );
    });
  };
  // Handler
  const handlerFilterByRegion = async () => {
    const filterList = await _searchData(dataMain, itemFilter);
    await setDataShop(filterList);
  };
  const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
    const listChooseGroup = _.map(dataMain, (it, _idx) => {
      if (item.keyValue == it[keyValue])
        return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 };
      else return isMultiple ? it : { ...it, isChooseTag: 0 };
    });
    //
    const byTag = item.keyValue == itemFilter.byTag ? null : item.keyValue;
    itemFilter.byTag = byTag;
    const _shopByGroup = await _searchData(listChooseGroup, itemFilter);
    const _dataShow =
      _shopByGroup !== null && _shopByGroup.length > 0
        ? _shopByGroup
        : listChooseGroup;
    await setDataMain(listChooseGroup);
    await setDataShop(_dataShow);
  };
  const handlerFilterData = async item => {
    setItemFilter(item);
    const _datafilter = await _searchData(dataMain, item);
    await setDataShop(_datafilter);
  };
  // Action
  const onActionMenuFAB = () => {
    SheetManager.show('sheetSortStore');
  };
  const onOpenHeaderFunctions = () => {
    if (!isAddStoreTool) {
      onShowMap();
      return;
    }
    SheetManager.show('sheetShopManageFunctions');
  };
  const onCreateStoreRequest = async () => {
    await SheetManager.hide('sheetShopManageFunctions');
    navigation.navigate('storerequestform', {
      requestType: 'OPEN',
      requestTypeLocked: true,
      reportId: mainReportId || kpiinfo.id,
      shopId: 0,
      title: 'Tạo mới cửa hàng',
    });
  };
  const onOpenMapFunction = async () => {
    await SheetManager.hide('sheetShopManageFunctions');
    onShowMap();
  };
  const onOpenStoreRequestHistory = async () => {
    await SheetManager.hide('sheetShopManageFunctions');
    navigation.navigate('storerequestlist', {
      reportId: mainReportId || kpiinfo.id,
      typeReport: 'History',
      title: 'Lịch sử request cửa hàng',
    });
  };
  const getValidExplainCache = async shop => {
    const keyStore = getExplainStorageKey(shop);
    const dataCache = await AsyncStorage.getItem(keyStore);
    if (!dataCache) return null;

    let itemCache = {};
    try {
      itemCache = JSON.parse(dataCache || '{}');
    } catch (_error) {
      await AsyncStorage.removeItem(keyStore);
      return null;
    }
    if (itemCache.cacheDate !== TODAY) {
      await AsyncStorage.removeItem(keyStore);
      return null;
    }
    return itemCache;
  };
  const saveExplainCache = async (nextForm = explainForm) => {
    if (!nextForm?.shop) return;
    await AsyncStorage.setItem(
      getExplainStorageKey(nextForm.shop),
      JSON.stringify({
        cacheDate: TODAY,
        guid: nextForm.guid,
        reason: nextForm.reason,
      }),
    );
  };
  const onOpenExplainStore = async item => {
    const cache = await getValidExplainCache(item);
    const nextForm = {
      shop: item,
      guid: cache?.guid || UUIDGenerator(),
      reason: cache?.reason || '',
      photos: [],
    };
    setExplainForm(nextForm);
    await SheetManager.show('sheetShopExplain');
  };
  const onChangeExplainReason = async text => {
    const nextForm = { ...explainForm, reason: text };
    setExplainForm(nextForm);
    await saveExplainCache(nextForm);
  };
  const onChangeExplainPhotos = async photos => {
    const nextForm = { ...explainForm, photos: photos || [] };
    setExplainForm(nextForm);
    await saveExplainCache(nextForm);
  };
  const onCloseExplainSheet = async () => {
    await Keyboard.dismiss();
    await SheetManager.hide('sheetShopExplain');
  };
  const getLatestExplainPhotos = async () => {
    if (!explainForm.shop || !explainForm.guid) return [];
    const localPhotos = await getDataPhotos(
      explainForm.shop.shopId,
      TODAY,
      SHOP_EXPLAIN_PHOTO_TYPE,
      mainReportId || kpiinfo.id,
      explainForm.guid,
      false,
    );
    return localPhotos || explainForm.photos || [];
  };
  const onSubmitExplainStore = async () => {
    const reason = (explainForm.reason || '').trim();
    if (!explainForm.shop) return;
    if (reason.length < 5) {
      toastError(
        'Thông báo',
        'Vui lòng nhập lý do giải trình tối thiểu 5 ký tự',
      );
      return;
    }

    const latestPhotos = await getLatestExplainPhotos();
    if (latestPhotos.length === 0) {
      toastError('Thông báo', 'Vui lòng chụp ít nhất 1 hình giải trình');
      return;
    }

    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      toastError(
        'Kết nối mạng',
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    alertConfirm(
      'Gửi giải trình',
      'Bạn có chắc chắn muốn gửi giải trình cửa hàng này không?',
      async () => {
        setSubmittingExplain(true);
        const itemShop = explainForm.shop;
        const payload = {
          typeAction: 'EXPLAN_STORE',
          actionType: 'EXPLAN_STORE',
          shopId: itemShop.shopId,
          shopCode: itemShop.shopCode,
          shopName: itemShop.shopName,
          address: itemShop.address,
          guid: explainForm.guid,
          workDate: TODAY,
          reason,
          note: reason,
          explainNote: reason,
          verifyNote: reason,
          photos: JSON.stringify(normalizeExplainPhotos(latestPhotos)),
        };
        const result = await REPORT.UploadDataRaw_Realtime(
          payload,
          { shopId: itemShop.shopId, auditDate: TODAY },
          mainReportId || kpiinfo.id,
        );
        setSubmittingExplain(false);
        if (result.statusId == 200) {
          toastSuccess(
            'Thông báo',
            result.messager || 'Gửi giải trình thành công',
          );
          await AsyncStorage.removeItem(getExplainStorageKey(itemShop));
          setExplainForm({ shop: null, guid: '', reason: '', photos: [] });
          await SheetManager.hide('sheetShopExplain');
          await LoadData();
        } else {
          toastError(
            'Thông báo',
            result.messager || 'Gửi giải trình không thành công',
          );
        }
      },
    );
  };
  const onSearchData = async text => {
    search.text = text;
    setMutate(e => !e);
    const searchList = await _searchData(dataMain, itemFilter);
    await setDataShop(searchList);
  };
  const _searchData = async (filterList, itemFilter = {}) => {
    let mainDataSearch = await _.orderBy(
      filterList,
      ['sortLevel'],
      [itemFilter.newest ? 'desc' : 'asc'],
    );
    //
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    mainDataSearch = await _.filter(
      mainDataSearch,
      e =>
        removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.address).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.dealerName || 'none')
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.levelName || 'none')
          .toLowerCase()
          .match(valueSearch) ||
        removeVietnameseTones(e.groupView || 'none')
          .toLowerCase()
          .match(valueSearch),
    );

    if (itemFilter.headcount !== null) {
      mainDataSearch = await _.filter(
        mainDataSearch,
        e => e.headCountType == itemFilter.headcount,
      );
    }
    mainDataSearch = await _.filter(
      mainDataSearch,
      e =>
        (searchData.dealerName == null ||
          e.dealerName?.includes(searchData.dealerName)) &&
        (searchData.areaName == null ||
          e.areaName?.includes(searchData.areaName)) &&
        (searchData.provinceName == null ||
          e.province?.includes(searchData.provinceName)) &&
        (searchData.districtName == null ||
          e.district?.includes(searchData.districtName)),
    );
    if (itemFilter.byTag)
      mainDataSearch = await _.filter(
        mainDataSearch,
        e => e.groupView == itemFilter.byTag,
      );
    return mainDataSearch;
  };
  const onShowOverview = item => {
    itemShowImage.visible = true;
    itemShowImage.photos = [{ photoPath: `${URLDEFAULT}${item.imageUrl}` }];
    itemShowImage.index = 0;
    setMutate(e => !e);
  };
  const onShowMap = () => {
    setViewMap(e => !e);
  };
  const onBack = () => {
    navigation.goBack();
  };
  const onCloseImage = () => {
    itemShowImage.visible = false;
    itemShowImage.photos = [];
    itemShowImage.index = 0;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    if (!mainReportId) {
      SetMainReportId(kpiinfo.id);
    }
    const reloadListShop = DeviceEventEmitter.addListener(
      'reload_shop_manager',
      LoadData,
    );
    LoadData();
    return () => reloadListShop.remove();
  }, []);
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    handlerFilterByRegion();
    return () => {
      isMounted = false;
    };
  }, [searchData]);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1 },
    loadingView: {
      position: 'absolute',
      zIndex: 10,
      top: 0,
      end: 0,
      bottom: 0,
      start: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemContainer: {
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      marginHorizontal: 8,
      marginVertical: 4,
      overflow: 'hidden',
      shadowColor: appcolor.dark,
      shadowRadius: 8,
      shadowOffset: { width: 1, height: 3 },
      shadowOpacity: 0.5,
      elevation: 3,
    },
    styleOverview: { height: 280 },
    infoView: {
      backgroundColor: appcolor.light,
      padding: 8,
      paddingBottom: 0,
      position: 'absolute',
      start: 0,
      end: 0,
      bottom: 0,
    },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleSubName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.greylight,
    },
    titleTarget: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.greylight,
    },
    actionView: { width: '100%' },
    actionSheetView: { width: '100%', minHeight: deviceHeight / 5 },
    functionSheetView: {
      width: '100%',
      padding: 12,
      paddingBottom: 80,
      backgroundColor: appcolor.light,
    },
    functionTitle: {
      color: appcolor.dark,
      fontSize: 16,
      fontWeight: fontWeightBold,
      paddingHorizontal: 4,
      paddingBottom: 8,
    },
    functionGroup: { marginTop: 8 },
    functionGroupTitle: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: fontWeightBold,
      paddingHorizontal: 4,
      paddingVertical: 4,
      textTransform: 'uppercase',
    },
    functionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      marginTop: 8,
    },
    functionIcon: { width: 32, alignItems: 'center' },
    functionText: {
      flex: 1,
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
      marginStart: 8,
    },
    explainSheetView: {
      width: '100%',
      maxHeight: deviceHeight * 0.88,
      backgroundColor: appcolor.light,
      borderTopStartRadius: 16,
      borderTopEndRadius: 16,
    },
    explainContent: { padding: 14, paddingBottom: 28, gap: 12 },
    explainTitle: {
      color: appcolor.dark,
      fontSize: 18,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    explainSubTitle: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 17,
    },
    explainShopBox: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    explainShopName: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: fontWeightBold,
    },
    explainShopAddress: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    explainLabel: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: fontWeightBold,
      marginBottom: 6,
    },
    explainInput: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      minHeight: 96,
      paddingVertical: 4,
    },
    explainInputText: {
      color: appcolor.dark,
      fontSize: 13,
      minHeight: 84,
      textAlignVertical: 'top',
    },
    explainButton: {
      minHeight: 46,
      borderRadius: 8,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    explainButtonDisabled: { opacity: 0.65 },
    explainButtonText: {
      color: appcolor.light,
      fontSize: 14,
      fontWeight: fontWeightBold,
    },
    explainCancelButton: {
      minHeight: 42,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    explainCancelText: {
      color: appcolor.dark,
      fontSize: 13,
      fontWeight: '600',
    },
    overflowView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 1,
      backgroundColor: appcolor.dark,
      opacity: 0.65,
      justifyContent: 'center',
    },
    bottomView: { paddingBottom: 80 },
    lineView: {
      width: '100%',
      height: 1,
      backgroundColor: appcolor.surface,
      marginVertical: 6,
    },
  });

  const renderExplainSheet = () => {
    const selectedShop = explainForm.shop || {};
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.explainSheetView}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.explainContent}
        >
          <Text style={styles.explainTitle}>Giải trình cửa hàng</Text>
          <Text style={styles.explainSubTitle}>
            Nhập lý do, chụp hình xác nhận và gửi realtime lên hệ thống.
          </Text>
          <View style={styles.explainShopBox}>
            <Text style={styles.explainShopName}>
              {selectedShop.shopName || ''}
            </Text>
            <Text style={styles.explainShopAddress}>
              {selectedShop.address || ''}
            </Text>
          </View>
          <View>
            <Text style={styles.explainLabel}>
              Lý do giải trình <Text style={{ color: appcolor.red }}>*</Text>
            </Text>
            <FormGroup
              editable={!isSubmittingExplain}
              multiline
              value={explainForm.reason}
              placeholder="Nhập lý do giải trình"
              containerStyle={styles.explainInput}
              inputStyle={styles.explainInputText}
              handleChangeForm={onChangeExplainReason}
              onEndEditing={() => saveExplainCache()}
            />
          </View>
          {explainForm.guid ? (
            <PhotoInput
              _guid={explainForm.guid}
              enableTakePhoto={!isSubmittingExplain}
              reload={explainForm.guid}
              shopId={selectedShop.shopId}
              shopCode={selectedShop.shopCode}
              photoType={SHOP_EXPLAIN_PHOTO_TYPE}
              handlerAddImage={onChangeExplainPhotos}
            />
          ) : null}
          <TouchableOpacity
            disabled={isSubmittingExplain}
            style={[
              styles.explainButton,
              isSubmittingExplain && styles.explainButtonDisabled,
            ]}
            onPress={onSubmitExplainStore}
          >
            {isSubmittingExplain && (
              <ActivityIndicator size="small" color={appcolor.light} />
            )}
            <Text style={styles.explainButtonText}>
              {isSubmittingExplain ? 'Đang gửi...' : 'Gửi lên hệ thống'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isSubmittingExplain}
            style={styles.explainCancelButton}
            onPress={onCloseExplainSheet}
          >
            <Text style={styles.explainCancelText}>Đóng</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderItem = ({ item }) => {
    const handlerShowImage = () => onShowOverview(item);
    //
    const isOverviewImage = item.imageUrl;
    const imageOverview = isOverviewImage
      ? { uri: `${URLDEFAULT}${item.imageUrl}` }
      : require('../../../Themes/Images/store.png');
    const distance =
      item.latitude == 0
        ? 'Không xác định'
        : `${formatNumber(
          distanceBetween2Points(
            item.latitude,
            item.longitude,
            myLocation.latitude,
            myLocation.longitude,
          ).toFixed(0),
          ',',
        )} km`;
    //
    const dataTarget = JSON.parse(item.dataTarget || '[]');
    const strTarget =
      dataTarget.length > 0
        ? _.join(
          _.map(
            dataTarget,
            i => `${i.type} - ${formatNumber(i.amount, ',')}`,
          ),
          ' | ',
        )
        : null;
    return (
      <View style={styles.itemContainer}>
        <Image
          source={imageOverview}
          style={styles.styleOverview}
          resizeMethod="resize"
          resizeMode={!isOverviewImage ? 'center' : 'cover'}
          onPress={isOverviewImage ? handlerShowImage : null}
        />
        <View style={styles.infoView}>
          <Text style={styles.titleName}>{`${item.shopName}`}</Text>
          <Text style={styles.titleSubName}>{`Địa chỉ: ${item.address}`}</Text>
          <Text style={styles.titleSubName}>{`Khoảng cách: ${distance}`}</Text>
          {/* TypeInfo */}
          {item.levelName && (
            <Text style={styles.titleSubName}>{item.levelName}</Text>
          )}
          {item.shopFormat && (
            <Text style={styles.titleSubName}>{item.shopFormat}</Text>
          )}
          {item.dealerName && (
            <Text
              style={styles.titleSubName}
            >{`Loại hình: ${item.dealerName}`}</Text>
          )}
          {item.supType && (
            <Text style={styles.titleSubName}>{item.supType}</Text>
          )}
          {item.headCountType && (
            <Text style={styles.titleSubName}>{item.headCountType}</Text>
          )}
          {/* Target */}
          {strTarget && (
            <Text style={styles.titleTarget}>{`Target: ${strTarget}`}</Text>
          )}
          {/* // */}
          <View style={styles.lineView} />
          <View style={styles.actionView}>
            <ActionList
              navigation={navigation}
              data={dataConfig}
              info={item}
              onExplainStore={onOpenExplainStore}
            />
          </View>
        </View>
      </View>
    );
  };
  if (isViewMap)
    return (
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        <HeaderCustom title="Bản đồ" leftFunc={onShowMap} />
        <MapApp navigation={navigation} slist={dataShop} />
      </View>
    );
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Quản lí danh sách cửa hàng'}
        iconRight={isAddStoreTool ? 'th-large' : 'map'}
        leftFunc={onBack}
        rightFunc={onOpenHeaderFunctions}
      />
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      <View style={styles.contentContainer}>
        <SearchData
          placeholder={`Tìm kiếm cửa hàng`}
          onSearchData={onSearchData}
          containerStyle={{ margin: 8 }}
          inputStyle={{ fontSize: 12 }}
        />
        <GroupListData
          dataMain={dataShop}
          keyName="groupView"
          keyValue="groupView"
          handlerChange={handlerSearchByGroup}
        />
        <CustomListView
          data={dataShop}
          extraData={[dataShop]}
          renderItem={renderItem}
          onRefresh={LoadData}
        />
      </View>

      <ActionSheet
        id="sheetSortStore"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheetView}>
          <ActionFilter
            reportId={kpiinfo?.reportId}
            key="action-filter-shopmanager"
            itemFilter={itemFilter}
            handlerFilterData={handlerFilterData}
          />
        </View>
      </ActionSheet>
      <ActionSheet
        id="sheetShopManageFunctions"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.functionSheetView}>
          <Text style={styles.functionTitle}>Chức năng</Text>
          <View style={styles.functionGroup}>
            <Text style={styles.functionGroupTitle}>Bản đồ</Text>
            <TouchableOpacity
              style={styles.functionItem}
              onPress={onOpenMapFunction}
            >
              <View style={styles.functionIcon}>
                <SpiralIcon
                  name="map"
                  type="font-awesome-5"
                  size={18}
                  color={appcolor.primary}
                />
              </View>
              <Text style={styles.functionText}>Bản đồ cửa hàng</Text>
              <SpiralIcon
                name="chevron-right"
                type="font-awesome-5"
                size={14}
                color={appcolor.greylight}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.functionGroup}>
            <Text style={styles.functionGroupTitle}>Cửa hàng</Text>
            {isAddStoreTool && (
              <TouchableOpacity
                style={styles.functionItem}
                onPress={onCreateStoreRequest}
              >
                <View style={styles.functionIcon}>
                  <SpiralIcon
                    name="plus-circle"
                    type="font-awesome-5"
                    size={18}
                    color={appcolor.primary}
                  />
                </View>
                <Text style={styles.functionText}>Tạo mới cửa hàng</Text>
                <SpiralIcon
                  name="chevron-right"
                  type="font-awesome-5"
                  size={14}
                  color={appcolor.greylight}
                />
              </TouchableOpacity>
            )}
            {isAddStoreTool && (
              <TouchableOpacity
                style={styles.functionItem}
                onPress={onOpenStoreRequestHistory}
              >
                <View style={styles.functionIcon}>
                  <SpiralIcon
                    name="history"
                    type="font-awesome-5"
                    size={18}
                    color={appcolor.primary}
                  />
                </View>
                <Text style={styles.functionText}>Lịch sử request</Text>
                <SpiralIcon
                  name="chevron-right"
                  type="font-awesome-5"
                  size={14}
                  color={appcolor.greylight}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ActionSheet>
      <ActionSheet
        id="sheetShopExplain"
        gestureEnabled={!isSubmittingExplain}
        defaultOverlayOpacity={0.3}
        indicatorColor={appcolor.primary}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        {renderExplainSheet()}
      </ActionSheet>
      {menu.isOpen ? (
        <TouchableOpacity
          style={styles.overflowView}
          onPress={onActionMenuFAB}
        />
      ) : (
        <View />
      )}
      <FloatActionButton
        info={menu}
        containerStyle={{ bottom: 16 }}
        showMenu={onActionMenuFAB}
      />
      <ViewPictures
        visible={itemShowImage.visible}
        images={itemShowImage.photos}
        initialIndex={itemShowImage.index}
        onSwipeDown={onCloseImage}
      />
    </View>
  );
};

export default ShopManageScreen;
