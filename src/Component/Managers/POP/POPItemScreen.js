import React, { useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { POPAPI, POPKey } from '../../../API/POPAPI';
import {
  debounce,
  removeVietnameseTones,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { Image, Text } from '@rneui/base';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../Themes/AppsStyle';
import { LoadingView } from '../../../Control/ItemLoading';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import FormGroup from '../../../Content/FormGroup';
import { POPController } from './Controller/POPController';
import _ from 'lodash';
import CustomTab from '../../../Control/Custom/CustomTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POPItemScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [itemMenu, setItemMenu] = useState({});
  const [itemEdit, setItemEdit] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);
  const inputRef = useRef();
  //
  const LoadData = async () => {
    !isLoading && (await setLoading(true));
    const params = route.params?.popMenu || {};
    if (params?.wareHouseId) {
      await setItemMenu(params);
      await POPAPI.GetDataWarehouse(params, async (mData, message) => {
        message && ToastError(message, 'Thông báo', 'top');
        await setDataMain(mData);
        await setData(mData);
      });
    } else {
      ToastError('Không có dữ liệu sản phẩm', params.menuName, 'top');
      onBack();
    }
    await setLoading(false);
  };
  const UploadData = async () => {
    await setLoading(true);
    const params = {
      typeUpdate: POPKey.UPDATEWARE,
      itemUpload: JSON.stringify(data),
    };
    await POPAPI.UpdatePOP(params, async message => {
      message && ToastSuccess(message);
      await LoadData();
    });
    await setLoading(false);
  };
  // Handler
  const handlerShowDetail = item => {
    SheetManager.show('product-view-sheet', { payload: item });
  };
  const handlerOpenEdit = () => {
    inputRef.current?.focus();
  };
  // Action
  const onSearchData = debounce(async text => {
    search.text = text;
    setMutate(e => !e);
    const searchList = _searchData(dataMain);
    setData(searchList);
  }, 200);
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    return filterList.map(group => {
      const detailArr = JSON.parse(group.detailData || '[]');
      const filteredDetails = detailArr.filter(e =>
        removeVietnameseTones(e.POPName || '')
          .toLowerCase()
          .includes(valueSearch),
      );
      return {
        ...group,
        detailData: JSON.stringify(filteredDetails),
      };
    });
  };
  const onEditNumber = text => {
    const value = text !== null ? parseInt(text) : null;
    if (value !== null && itemEdit.Quantity < parseInt(value)) {
      itemEdit.DamagedInWarehouse = null;
      ToastError(
        'Số lượng hư hỏng không được lớn hơn số lượng trong kho đang có',
        'Thông báo',
        'top',
      );
    } else {
      itemEdit.DamagedInWarehouse = value;
    }
    setData(prev => POPController.updateDetailData(prev, itemEdit));
    setDataMain(prev => POPController.updateDetailData(prev, itemEdit));
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    LoadData();
  }, []);
  // View
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
    imageView: { width: '100%', height: 80 },
    viewImage: { overflow: 'hidden', borderRadius: 8 },
    viewInfo: { paddingVertical: 8 },
    loadingView: {
      backgroundColor: appcolor.light,
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      justifyContent: 'center',
      zIndex: 1,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      minHeight: 38,
    },
    titleNumberItem: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '500',
    },
    titleNumberEdit: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: fontWeightBold,
      textDecorationLine: 'underline',
    },
    viewQuantity: {
      position: 'absolute',
      top: 4,
      end: 4,
      backgroundColor: appcolor.redgray,
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 28,
      borderWidth: 1,
      borderColor: appcolor.surface,
    },
    titleQuantity: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.white,
    },
    sheetContainer: {
      height: 230,
      padding: 8,
      margin: 4,
      elevation: 3,
      shadowOpacity: 0.3,
    },
    editMain: { padding: 5, backgroundColor: appcolor.placeholderBody },
    editView: { fontSize: 13, color: appcolor.dark },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
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
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View
              style={{
                paddingBottom:
                  deviceHeight / (dataDetails.length > 6 ? 1.8 : 5),
              }}
            />
          }
        />
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const imageURI = item.Image
      ? { uri: item.Image }
      : require('../../../Themes/Images/noimage.png');
    const isWarehouse =
      (itemMenu.isWarehouse || 0) == 0 && itemMenu.isWarningItem == 0;
    const onPress = () => handlerShowDetail(item);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={onPress}
        disabled={!isWarehouse}
      >
        <View style={styles.viewImage}>
          <Image
            source={imageURI}
            style={styles.imageView}
            resizeMode="cover"
            resizeMethod="resize"
          />
        </View>
        <View style={styles.viewQuantity}>
          <Text style={styles.titleQuantity}>{`${item.Quantity}`}</Text>
        </View>
        <View style={styles.viewInfo}>
          <Text style={styles.titleName}>{`${index + 1}. ${
            item.POPName
          }`}</Text>
          {isWarehouse && (
            <Text style={styles.titleNumberItem}>{`Hư hỏng khi vận chuyển: ${
              item.DamagedShipping || 0
            }`}</Text>
          )}
          {isWarehouse && (
            <Text style={styles.titleNumberItem}>{`Hư hỏng khi nhập kho: ${
              item.DamagedInWarehouse || 0
            }`}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  if (isLoading)
    return (
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
    );
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={itemMenu.menuName}
        subTitle={`${itemMenu.wareHouseId} - ${itemMenu.wareHouseName}`}
        iconRight="cloud-upload-alt"
        leftFunc={onBack}
        rightFunc={
          (itemMenu.isWarehouse || 0) == 0 &&
          itemMenu.isWarningItem == 0 &&
          UploadData
        }
      />
      <View style={styles.contentContainer}>
        <SearchData
          placeholder={`Tìm kiếm sản phẩm`}
          value={search.text}
          onSearchData={onSearchData}
          containerStyle={{ margin: 8 }}
          inputStyle={{ fontSize: 12 }}
        />
        <CustomTab
          data={data}
          dataCountItem={data}
          keySummaryName="detailData"
          keyTabName="groupName"
          renderItem={renderTab}
        />
      </View>
      <ActionSheet
        id="product-view-sheet"
        keyboardHandlerEnabled
        onBeforeShow={setItemEdit}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.viewImage}>
            <Image
              source={
                itemEdit.Image
                  ? { uri: itemEdit.Image }
                  : require('../../../Themes/Images/noimage.png')
              }
              style={{ width: '100%', height: 120 }}
              resizeMode="cover"
              resizeMethod="resize"
            />
          </View>
          <View style={styles.viewQuantity}>
            <Text style={styles.titleQuantity}>{`${itemEdit.Quantity}`}</Text>
          </View>
          <TouchableOpacity style={styles.viewInfo} onPress={handlerOpenEdit}>
            <Text
              style={{ ...styles.titleName, minHeight: 0 }}
            >{`${itemEdit.POPName}`}</Text>
            {(itemMenu.isWarehouse || 0) == 0 && (
              <Text
                style={styles.titleNumberItem}
              >{`Số lượng trong kho: ${itemEdit.Quantity}`}</Text>
            )}
            {(itemMenu.isWarehouse || 0) == 0 && (
              <Text
                style={styles.titleNumberItem}
              >{`Hư hỏng khi vận chuyển: ${itemEdit.DamagedShipping}`}</Text>
            )}
            {(itemMenu.isWarehouse || 0) == 0 && (
              <Text
                style={styles.titleNumberEdit}
              >{`Số lượng hư hỏng khi nhập kho: ${
                itemEdit.DamagedInWarehouse || '0'
              }`}</Text>
            )}
            <FormGroup
              inputRefFull={inputRef}
              editable
              selectTextOnFocus
              keyboardType="numeric"
              value={`${itemEdit.DamagedInWarehouse || ''}`}
              containerStyle={styles.hiddenInput}
              handleChangeForm={onEditNumber}
            />
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </View>
  );
};

export default POPItemScreen;
