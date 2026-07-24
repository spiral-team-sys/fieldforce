import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, Badge, Button } from '@rneui/themed';
import { Store, DeleteItem } from '../Core/SqliteDbContext';
import GmailStyleSwipeableRow from '../Core/GmailStyleSwipeableRow';
import Moment from 'moment';
import { AppNameBuild, DEFAULT_COLOR, psvApp } from '../Core/URLs';
import { useSelector } from 'react-redux';
import NativeCamera from '../Control/NativeCamera';
import { getPhotosReportByGuiId } from '../Controller/WorkController';
import ViewPictures from '../Control/Gallary/ViewPictures';
import SpiralIcon from '../Control/Icon/SpiralIcon';

const takePhotoCell = (e, guiid, workinfo, navigation, kpiId) => {
  let item = {
    reportId: kpiId,
    shopId: workinfo.shopId,
    shopCode: workinfo.shopCode,
    guiId: guiid,
    photoType: 'PROMOTION',
    photoDate: workinfo.workDate,
  };

  navigation.navigate('Camera', item);
};
const uploadFileCell = async (e, guiid, workinfo, loadData, kpiId) => {
  const photoinfo = {
    shopId: workinfo.shopId,
    shopCode: workinfo.shopCode,
    reportId: kpiId,
    photoDate: workinfo.workDate,
    photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
    fileUpload: 0,
    dataUpload: 0,
    photoPath: null,
    photoType: 'PROMOTION',
    guid: guiid,
    photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
  };
  await NativeCamera.imageGalleryLaunch(photoinfo, loadData);
};
const deleteItemPromotion = async (item, selloutLoad) => {
  await Store().then(db => {
    DeleteItem(db, 'promotion', { Id: item.Id });
  });
  selloutLoad();
};
export const PromotionResRow = ({
  item,
  index,
  navigation,
  loadData,
  showDetail,
  listReport,
}) => {
  const { kpiinfo, appcolor, workinfo } = useSelector(state => state.GAppState);
  const [pictureShow, setPictureShow] = useState({
    visible: false,
    photos: [],
    index: 0,
  });

  const deleteItemSellout = async (item, selloutLoad) => {
    await Store().then(db => {
      DeleteItem(db, 'promotion', { Id: item.Id });
    });
    selloutLoad();
  };
  const showALbumCell = async guiid => {
    const photos = await getPhotosReportByGuiId(
      kpiinfo.kpiId,
      guiid,
      workinfo.shopId,
      workinfo.workDate,
    );
    setPictureShow({ visible: true, photos, index: 0 });
  };
  return (
    <>
      <GmailStyleSwipeableRow
        enableRight={item.upload == 0 ? false : true}
        deleteItem={() =>
          item.upload == 0
            ? deleteItemPromotion(item, loadData)
            : alert('Không thể xoá dữ liệu đã gửi rồi.')
        }
      >
        <TouchableOpacity
          onPress={() => item.upload == 0 && showDetail(item)}
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginTop: index > 0 ? 10 : 0,
          }}
        >
          <View
            style={{
              padding: 8,
              borderRadius: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: appcolor.surface,
            }}
          >
            <Badge
              containerStyle={{ width: '15%' }}
              status={item.upload == 0 ? 'error' : 'success'}
              badgeStyle={{ height: 40, width: 40, borderRadius: 20 }}
              value={item.upload == 0 ? 'NO' : 'OK'}
            ></Badge>

            <View style={{ flexDirection: 'column', width: '85%' }}>
              <Text
                style={{
                  padding: 5,
                  fontSize: 17,
                  fontWeight: 'bold',
                  textAlign: 'left',
                  color: appcolor.dark,
                }}
              >
                {`${item.titlePromotion !== null && item.titlePromotion.length > 0
                    ? item.titlePromotion
                    : 'CTKM'
                  }`}
              </Text>
              <Text
                style={{
                  width: '100%',
                  height: 0.6,
                  backgroundColor: appcolor.greydark,
                  paddingStart: 10,
                  paddingEnd: 10,
                  marginBottom: 4,
                  marginTop: 4,
                  width: '50%',
                }}
              ></Text>
              {item.competitorName !== 'undefined' &&
                item.competitorName !== null &&
                item.competitorName !== undefined && (
                  <Text style={{ color: appcolor.dark }}>
                    {'Hãng: ' + item.competitorName}
                  </Text>
                )}
              {item.categoryName !== 'undefined' &&
                item.categoryName !== null &&
                item.categoryName !== undefined &&
                item.categoryName !== '0' && (
                  <Text style={{ color: appcolor.dark }}>
                    {'Ngành hàng: ' + item.categoryName}
                  </Text>
                )}
              {item.content !== 'undefined' &&
                item.content !== null &&
                item.content !== undefined && (
                  <Text style={{ color: appcolor.dark }}>
                    {'Nội dung: ' + item.content}
                  </Text>
                )}
              <Text style={{ color: appcolor.dark }}>
                {'Từ ngày: ' +
                  item.fromDate +
                  ', ' +
                  'Đến ngày: ' +
                  item.toDate}
              </Text>
            </View>
            {item.upload == 0 && (
              <SpiralIcon
                containerStyle={{ height: 40, width: 40 }}
                name="trash-outline"
                type="ionicon"
                onPress={() => deleteItemSellout(item, loadData)}
                color={DEFAULT_COLOR}
                size={30}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 5,
            }}
          >
            <Button
              containerStyle={{
                width: AppNameBuild !== psvApp ? '33%' : '49%',
              }}
              buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
              onPress={e => {
                item.upload == 0 &&
                  takePhotoCell(
                    e,
                    item.guiId,
                    workinfo,
                    navigation,
                    kpiinfo.kpiId,
                  );
              }}
              icon={
                <SpiralIcon
                  color={appcolor.dark}
                  name="camera"
                  type="ionicon"
                  size={33}
                />
              }
            />
            {listReport.isHideUpload != 1 && (
              <Button
                containerStyle={{ width: '33%' }}
                buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
                onPress={e => {
                  item.upload == 0 &&
                    uploadFileCell(
                      e,
                      item.guiId,
                      workinfo,
                      loadData,
                      kpiinfo.kpiId,
                    );
                }}
                icon={
                  <SpiralIcon
                    color={appcolor.dark}
                    name="attach"
                    type="ionicon"
                    size={33}
                  />
                }
              />
            )}
            <Button
              containerStyle={{
                width: AppNameBuild !== psvApp ? '33%' : '49%',
              }}
              buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
              onPress={() => showALbumCell(item.guiId)}
              icon={
                <View>
                  <SpiralIcon
                    color={appcolor.dark}
                    name="photo"
                    type="font-awesome"
                    size={30}
                  />
                  <Badge
                    value={item.numPhoto}
                    textStyle={{ fontSize: 12 }}
                    badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                    status="primary"
                    containerStyle={{
                      position: 'absolute',
                      top: -8,
                      right: -15,
                    }}
                  />
                </View>
              }
            />
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </GmailStyleSwipeableRow>
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.photos}
        initialIndex={pictureShow.index}
        onSwipeDown={() =>
          setPictureShow({ visible: false, photos: [], index: 0 })
        }
        isUseDelete
        onDeleteImage={loadData}
      />
    </>
  );
};
