import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { MessageInfo, ToastError } from '../../../Core/Helper';
import { Text } from '@rneui/themed';
import { TODAY, alertConfirm, deviceHeight } from '../../../Core/Utility';
import { MutipleItemSelected } from '../../../Control/MutipleItemSelected';
import { InputInList } from './Control/InputInList';
import { ItemInput } from './Control/ItemInput';
import { LoadingView } from '../../../Control/ItemLoading';
import { REPORT } from '../../../API/ReportAPI';
import {
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
import { UUIDGenerator } from '../../../../Core/Helper';

export const MarketVisit = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [isUploaded, setUploaded] = useState(false);
  const [dataMarket, setDataMarket] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const listReport = JSON.parse(kpiinfo.reportItem || '{}');
  const [dataPhoto, setDataPhoto] = useState([]);
  //
  const LoadData = async () => {
    await setLoading(true);
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
      mesager && ToastError(mesager);
      await setDataMarket(mData);
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
      if (item.Id == 1) {
        const dataFilter = JSON.parse(item.FilterList || '[]');
        for (let j = 0; j < dataFilter.length; j++) {
          const child = dataFilter[j];
          if ((child.ItemValue || null) == null) {
            ToastError(
              `Chưa nhập dữ liệu ${item.ItemName} - ${child.ItemName}`,
            );
            return false;
          }
        }
      } else {
        if ((item.ItemValue || null) == null) {
          ToastError(`Chưa nhập dữ liệu ${item.ItemName}`);
          return false;
        }
      }
      if (item.ImageItem == 1 && listReport.isCheckImage == 1) {
        let listPhoto = dataPhoto || [];
        if (listReport.checkByCode !== 1) {
          listPhoto = dataPhoto.filter(it => it.photoType == item.Code);
        }

        if (listPhoto?.length == 0) {
          MessageInfo(
            `Chưa chụp hình ${
              listReport.checkByCode !== 1 ? '"của ' + item.ItemName + '" ' : ''
            }báo cáo (${listPhoto?.length}/${listReport?.limitPhoto || 1})`,
          );
          return false;
        } else if (listPhoto.length < (listReport?.limitPhoto || 1)) {
          MessageInfo(
            `Chưa chụp đủ hình ${
              listReport.checkByCode !== 1 ? '"của ' + item.ItemName + '" ' : ''
            }của báo cáo (${listPhoto?.length}/${listReport?.limitPhoto || 1})`,
          );
          return false;
        }
      }
    }
    // listReport
    console.log('check');
    return true;
  };
  const handlerChangeTextInList = (dataMain, indexItem, indexMain, text) => {
    dataMain[indexItem].ItemValue = text;
    dataMarket[indexMain].FilterList = JSON.stringify(dataMain);
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
  };
  const handlerChangeTextItem = (indexMain, text) => {
    dataMarket[indexMain].ItemValue = text;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
  };
  const handlerChooseItem = (item, indexMain) => {
    dataMarket[indexMain].ItemValue = item.itemName;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMarket);
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
  const callBackPhoto = async result => {
    const listPhoto = await getAllPhotosUploaded(
      kpiinfo.kpiId,
      shopinfo.shopId,
      TODAY,
    );
    setDataPhoto(listPhoto);
  };
  const handlerViewPhoto = item => {
    let itemPhoto = {
      reportId: kpiinfo.id,
      shopId: shopinfo.shopId,
      photoType: `${item.Code}`,
      photoDate: TODAY,
    };
    navigation.navigate('AlbumPhoto', itemPhoto);
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
  });
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
    return (
      <View key={`typ_${index}`}>
        <Text style={styles.titleHeader}>{item.ItemName}</Text>
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
    </View>
  );
};
