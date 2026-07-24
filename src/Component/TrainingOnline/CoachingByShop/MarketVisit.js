import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
} from 'react-native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  Message,
  MessageInfo,
  UUIDGenerator,
  deleteReportEdit,
  groupDataByKey,
  updateReportEdit,
} from '../../../Core/Helper';
import { Icon, Text } from '@rneui/base';
import { TODAY, alertConfirm, deviceHeight } from '../../../Core/Utility';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import { InputInList } from './Control/InputInList';
import { ItemInput } from './Control/ItemInput';
import { LoadingView } from '../../../Control/ItemLoading';
import { REPORT } from '../../../API/ReportAPI';
import {
  deleteDataRaw,
  itemUploaded,
  saveJsonData,
} from '../../../Controller/ReportController';
import { PhotoControlView } from './Control/PhotoControlView';
import moment from 'moment';
import NativeCamera from '../../../Control/NativeCamera';
import {
  getAllPhotosUploaded,
  getPhotosReport,
} from '../../../Controller/WorkController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { TouchableOpacity } from 'react-native';
import _ from 'lodash';
import ViewPictures from '../../../Control/Gallary/ViewPictures';
import { toastError } from '../../../Utils/configToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const MarketVisit = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [isUploaded, setUploaded] = useState(false);
  const [dataMarket, setDataMarket] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const listReport = JSON.parse(kpiinfo.reportItem || '{}');
  const configStore = JSON.parse(shopinfo.config || '{}');
  const [dataPhoto, setDataPhoto] = useState([]);
  const [pictureShow, setPictureShow] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  //
  const LoadData = async () => {
    await setLoading(true);
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
      mesager && toastError('Thông báo', mesager);
      const { arr } = await groupDataByKey({
        arr: mData,
        key: 'GroupId',
      });
      await setDataMarket(arr);
    });
    const items = await itemUploaded(shopinfo, kpiinfo.id);
    await callBackPhoto();
    await setUploaded(items.isUploaded);
    await setLoading(false);
  };
  const UploadData = async () => {
    if (checkInput()) {
      await setLoading(true);
      alertConfirm(
        'Thông báo',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        async () => {
          await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
          await LoadData();
        },
      );
      await setLoading(false);
    }
  };
  // Handler
  const checkInput = () => {
    for (let index = 0; index < dataMarket.length; index++) {
      const item = dataMarket[index];

      if (item.IsRequired == 1) {
        if (item.Id == 1) {
          const dataFilter = JSON.parse(item.FilterList || '[]');
          for (let j = 0; j < dataFilter.length; j++) {
            const child = dataFilter[j];
            if (child.ItemValue !== 0 && (child.ItemValue || null) == null) {
              toastError(
                'Thông báo',
                `Chưa nhập dữ liệu ${item.ItemName} - ${child.ItemName}`,
              );
              return false;
            }
          }
        } else {
          if ((item.ItemValue || null) == null) {
            toastError('Thông báo', `Chưa nhập dữ liệu ${item.ItemName}`);
            return false;
          }
        }
      }

      if (item.ImageItem == 1 && listReport.isCheckImage == 1) {
        let listPhoto = dataPhoto || [];
        if (listReport.checkByCode !== 1) {
          listPhoto = dataPhoto.filter(it => it.photoType == item.Code);
        }

        if (listPhoto?.length == 0) {
          MessageInfo(
            `Chưa chụp hình ${listReport.checkByCode !== 1 ? '"của ' + item.ItemName + '" ' : ''
            }báo cáo (${listPhoto?.length}/${listReport?.limitPhoto || 1})`,
          );
          return false;
        } else if (listPhoto.length < (listReport?.limitPhoto || 1)) {
          MessageInfo(
            `Chưa chụp đủ hình ${listReport.checkByCode !== 1 ? '"của ' + item.ItemName + '" ' : ''
            }của báo cáo (${listPhoto?.length}/${listReport?.limitPhoto || 1})`,
          );
          return false;
        }
      }
    }
    // listReport
    return true;
  };
  const handlerChangeTextInList = (dataMain, indexItem, indexMain, text) => {
    dataMain[indexItem].ItemValue = text;
    dataMarket[indexMain].FilterList = JSON.stringify(dataMain);
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
    if (configStore.checkReportEdit == 1) {
      updateReportEdit({
        shopId: shopinfo.shopId,
        reportId: kpiinfo.kpiId,
        menuNameVN: kpiinfo.menuNameVN,
      });
    }
  };
  const handlerChangeTextItem = (indexMain, text) => {
    dataMarket[indexMain].ItemValue = text;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
    if (configStore.checkReportEdit == 1) {
      updateReportEdit({
        shopId: shopinfo.shopId,
        reportId: kpiinfo.kpiId,
        menuNameVN: kpiinfo.menuNameVN,
      });
    }
  };
  const handlerChooseItem = (item, indexMain) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dataMarket[indexMain].ItemValue = item.itemName;
    const dataDependent = _.filter(
      dataMarket,
      it => it.ItemDependent == (dataMarket[indexMain]?.RefId || 0),
    );
    if (dataDependent.length > 0) {
      for (let i = 0; i < dataDependent.length; i++) {
        const itemDependent = dataDependent[i];
        const indexByItem = _.findIndex(dataMarket, {
          RefId: itemDependent.RefId,
        });
        dataMarket[indexByItem].ItemValue = null;
      }
    }
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
    if (configStore.checkReportEdit == 1) {
      updateReportEdit({
        shopId: shopinfo.shopId,
        reportId: kpiinfo.kpiId,
        menuNameVN: kpiinfo.menuNameVN,
      });
    }
  };
  const handlerCameraAction = async item => {
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: `${item.Code}`,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: shopinfo.latitude,
      shopLong: shopinfo.longitude,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, callBackPhoto);
  };
  const handlerViewPhoto = async item => {
    const photos = await getPhotosReport(
      kpiinfo.id,
      `${item.Code}`,
      shopinfo.shopId,
      TODAY,
    );
    setPictureShow({ visible: true, photos, index: 0 });
  };
  const callBackPhoto = async () => {
    const listPhoto = await getAllPhotosUploaded(
      kpiinfo.kpiId,
      shopinfo.shopId,
      TODAY,
    );
    if ((dataPhoto || []).length !== listPhoto.length) {
      setDataPhoto(listPhoto);
    }
  };
  const closePictureViewer = () => {
    setPictureShow({ visible: false, photos: [], index: 0 });
  };

  //
  useEffect(() => {
    const _loaddata = LoadData();
    return () => _loaddata;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    titleHeader: {
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.dark,
      padding: 8,
    },
    itemText: {
      width: '80%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
    },
  });

  const setClearAll = async () => {
    if (!isUploaded) {
      Message('Chú ý', 'Bạn có chắc chắn muốn tải lại dữ liệu?', async () => {
        deleteDataRaw(shopinfo.shopId, kpiinfo.id);
        if (configStore.checkReportEdit == 1) {
          deleteReportEdit({
            shopId: shopinfo?.shopId,
            reportId: kpiinfo?.kpiId,
          });
        }
        LoadData();
        setMutate(e => !e);
        SheetManager.hide('ref_bottomSheet');
      });
    } else {
      toastError(
        'Thông báo',
        'Dữ liệu đã được gửi lên hệ thống bạn không thể tải lại!',
      );
      SheetManager.hide('ref_bottomSheet');
    }
  };
  const openSheet = async () => {
    await Keyboard.dismiss();
    SheetManager.show('ref_bottomSheet');
  };
  const itemCheck = item => {
    const itemMain =
      _.filter(dataMarket, itemM => itemM.RefId == item.ItemDependent)[0] ||
      null;
    const listMainCheck = itemMain
      ? JSON.parse(itemMain?.FilterList || '[]')
      : [];
    const itemCheck =
      _.filter(
        listMainCheck,
        itemM => itemM.itemName == itemMain.ItemValue,
      )[0] || null;
    return itemCheck ? itemCheck.itemId == item.IdDependent : true;
  };

  const renderItem = ({ item, index }) => {
    const onTextInList = (dataMain, indexItem, text) => {
      handlerChangeTextInList(dataMain, indexItem, index, text);
    };
    const onText = text => {
      handlerChangeTextItem(index, text);
    };
    const onChooseItem = itemChoose => {
      handlerChooseItem(itemChoose, index);
    };
    const filterList = JSON.parse(item.FilterList || '[]');
    const lockItem = item.ItemDependent ? itemCheck(item) : false;
    const isRequired = item.IsRequired == 1 ? ' *' : '';
    const lockTitle =
      item.ItemDependent && lockItem ? '(KHÔNG CẦN TRẢ LỜI)' : '';

    if (lockItem) return <View key={`typ_${index}`} />;
    return (
      <View key={`typ_${index}`} style={{ padding: 4 }}>
        {item.isParent && item.GroupName !== undefined && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: appcolor.primary,
              padding: 8,
              borderRadius: 5,
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 'bold',
                color: appcolor.white,
              }}
            >
              {' '}
              {item.GroupName}
            </Text>
          </View>
        )}
        <Text style={styles.titleHeader}>
          {item.ItemName}{' '}
          {
            <Text style={[styles.titleHeader, { color: appcolor.danger }]}>
              {' '}
              {isRequired}
            </Text>
          }{' '}
          {lockTitle}
        </Text>
        {item.NumberValue == 2 && (
          <InputInList
            isUploaded={isUploaded}
            typeKeyboard="numeric"
            dataInput={filterList}
            handlerChangeText={onTextInList}
          />
        )}
        {item.NumberValue == 1 && (
          <ItemInput
            typeKeyboard="numeric"
            handlerChangeText={onText}
            defaultValue={item.ItemValue}
            isUploaded={isUploaded}
          />
        )}
        {item.TextValue == 1 && (
          <ItemInput
            typeKeyboard="default"
            handlerChangeText={onText}
            defaultValue={item.ItemValue}
            isUploaded={isUploaded}
          />
        )}
        {item.SelectValue == 1 && (
          <MutipleItemSelected
            isUploaded={isUploaded}
            containerStyle={{ paddingTop: 0, paddingBottom: 0 }}
            defaultValue={item.ItemValue}
            dataItems={filterList}
            onItemChoose={onChooseItem}
          />
        )}
        {item.ImageItem == 1 && (
          <PhotoControlView
            itemHeader={item}
            index={index}
            isUploaded={isUploaded}
            dataPhoto={dataPhoto}
            handlerCamera={handlerCameraAction}
            handlerAlbums={handlerViewPhoto}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        leftFunc={() => {
          navigation.goBack();
        }}
        rightFunc={!isUploaded ? UploadData : null}
        middleFunc={!isUploaded ? openSheet : null}
        iconMiddle="poll-h"
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <FlatList
        key="marketvisit"
        keyExtractor={(_item, index) => index.toString()}
        data={dataMarket}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={{ paddingBottom: deviceHeight / 2 }} />
        }
      />

      <ActionSheet
        id="ref_bottomSheet"
        headerAlwaysVisible={true}
        defaultOverlayOpacity={0.1}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
        containerStyle={{
          backgroundColor: appcolor.light,
          alignSelf: 'center',
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ padding: 8, width: '100%', marginBottom: 38 }}>
          <View style={{ width: '100%' }}>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 17,
                fontWeight: '600',
                padding: 8,
              }}
            >
              Công cụ
            </Text>
            <TouchableOpacity
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                justifyContent: 'space-between',
                borderRadius: 20,
                borderWidth: 0.5,
                borderColor: appcolor.danger,
                marginBottom: 5,
              }}
              onPress={() => setClearAll()}
            >
              <Text
                style={{
                  color: appcolor.danger,
                  width: '80%',
                  textAlign: 'center',
                }}
              >
                Xóa dữ liệu đã nhập
              </Text>
              <SpiralIcon
                name={'trash'}
                type={'ionicon'}
                size={23}
                color={appcolor.danger}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.photos}
        initialIndex={pictureShow.index}
        onSwipeDown={closePictureViewer}
        isUseDelete={!isUploaded}
        onDeleteImage={callBackPhoto}
      />
    </View>
  );
};
