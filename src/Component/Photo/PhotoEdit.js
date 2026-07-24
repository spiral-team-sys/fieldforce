import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Modal,
} from 'react-native';
import { Icon } from '@rneui/themed';
import {
  GetPhotosByReportId,
  deletePhoto,
} from '../../Controller/PhotoController';
import {
  alertConfirm,
  alertNotify,
  checkNetwork,
  deviceWidth,
} from '../../Core/Utility';
import UploadController from '../../Controller/UploadController';
import GmailStyleSwipeableRow from '../../Core/GmailStyleSwipeableRow';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ToastError } from '../../Core/Helper';
import { ImageReviewEdit } from '../../Content/ImageReviewEdit';
import ImageZoom from '../../Content/ImageZoom';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { taskList } from '../../Core/Table';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const PhotoEdit = ({ navigation, route }) => {
  const [photo, setPhoto] = useState([]);
  const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const [comment, setComment] = useState(null);
  const [itemPhoto, setItemPhoto] = useState({});
  const [mode, setMode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);

  const loadData = async () => {
    const res = await GetPhotosByReportId(
      shopinfo.shopId,
      workinfo.workDate,
      kpiinfo.id,
    );
    res?.sort((a, b) => a.id < b.id);
    setPhoto(res);
  };

  useEffect(() => {
    loadData();
  }, []);
  const takePhoto = async () => {
    if (comment === null) {
      await ToastError('Bạn chưa nhập nội dung!');
      return;
    }
    if (comment?.length < 5) {
      await ToastError('Bạn nhập nội dung quá ngắn (tối thiểu 5 kí tự)!');
      return;
    }
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoType: workinfo.workId,
      photoDesc: comment,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
    };
    navigation.navigate('Camera', {
      ...photoinfo,
      callBackReport: PhotoResult,
      closeTakePhoto: true,
    });
  };
  const editPhoto = item => {
    if (!item.guid) {
      setMode('edit');
      setItemPhoto(item);
      setVisibleModal(true);
    } else {
      setMode('photo');
      setImageUrl(item.photoPath);
      setVisibleModal(true);
    }
  };
  const PhotoResult = async res => {
    await setComment(null);
    await loadData();
  };
  const SendReport = async () => {
    let lstUpload = photo.filter(it => it.dataUpload === 0);
    if (photo === null || photo.length < 1) {
      await ToastError('Chưa có dữ liệu báo cáo!');
      return;
    } else if (lstUpload.length == 0) {
      await ToastError('Đã gửi hết dữ liệu báo cáo!');
      return;
    }
    let items = photo.filter(it => !it.guid);
    if (items.length > 0) {
      ToastError('Bạn chưa đánh dấu vị trí bị lỗi!');
      return;
    }
    if (await checkNetwork()) {
      await alertConfirm(
        'Gửi báo cáo',
        'Sau khi gửi báo cáo bạn không thể thay đổi dữ liệu',
        async () => {
          const filter = {
            shopId: shopinfo.shopId,
            workDate: workinfo.workDate,
            reportId: kpiinfo.id,
          };
          const result = await UploadController.DataPhoto(filter);
          alertNotify(result.messager);
          if (result.statusId === 200) {
            await UploadController.PostFile();
            await loadData();
            await QueryStringSql(
              `UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${workinfo.shopId} and reportId=${kpiinfo.id}`,
            );
          }
        },
      );
    } else {
      ToastError('Không có kết nối mạng');
    }
  };
  const deleteImage = async item => {
    await deletePhoto(item);
    await loadData();
  };

  const rowItem = ({ item, index }) => {
    return (
      <GmailStyleSwipeableRow
        enableRight={item.dataUpload === 1}
        deleteItem={() => deleteImage(item)}
      >
        <View
          key={index.toString()}
          style={{
            backgroundColor: appcolor.grayLight,
            padding: 10,
            borderRadius: 10,
            flex: 1,
            marginBottom: 7,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {item?.photoDesc !== 'null' && (
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text
                  style={{
                    width: '100%',
                    padding: 4,
                    fontWeight: 'bold',
                    color: appcolor.dark,
                  }}
                >
                  {item?.photoDesc || ''}
                </Text>
              </View>
            )}
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                style={{ color: item?.guid ? appcolor.success : appcolor.info }}
              >
                {!item?.guid ? 'Bấm vào hình để vẽ' : ''}
              </Text>
            </View>
          </View>
          <View
            style={{
              zIndex: 2,
              borderColor: appcolor.dark,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <View
                style={{
                  height: 200,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  style={{
                    width: deviceWidth * 0.9,
                    height: 200,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    editPhoto(item);
                  }}
                >
                  <ImageBackground
                    style={{
                      zIndex: 1,
                      width: '95%',
                      height: '95%',
                      borderRadius: 10,
                    }}
                    source={{ uri: item.photoPath }}
                  >
                    <View
                      style={{
                        padding: 4,
                        flex: 1,
                        width: '95%',
                        height: '95%',
                        alignItems: 'flex-end',
                      }}
                    >
                      <SpiralIcon
                        color={
                          item.fileUpload ? appcolor.success : appcolor.danger
                        }
                        type="font-awesome-5"
                        solid
                        size={30}
                        name={'circle'}
                      />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </GmailStyleSwipeableRow>
    );
  };
  const handlerCloseModal = () => {
    setMode('');
    setVisibleModal(false);
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: appcolor.homebackground,
      }}
    >
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        rightFunc={SendReport}
        iconRight={'cloud-upload-alt'}
        title={kpiinfo?.menuNameVN || 'Chụp hình'}
      />
      <View style={{ flex: 1, padding: 7, backgroundColor: appcolor.surface }}>
        <View
          style={{
            flexGrow: 0.2,
            backgroundColor: appcolor.light,
            paddingLeft: 7,
            paddingRight: 7,
            borderRadius: 10,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flexGrow: 0.9 }}>
            <Text style={{ fontSize: 13, color: appcolor.dark }}>
              Nhập nội dung
            </Text>
            <TextInput
              placeholder="Nhập nội dụng ở đây"
              placeholderTextColor={appcolor.grey}
              // numberOfLines={}
              multiline
              value={comment}
              onChangeText={setComment}
              style={{ minHeight: 40, padding: 7, color: appcolor.dark }}
            />
          </View>
          <View
            style={{
              flexGrow: 0.1,
              backgroundColor: appcolor.homebackground,
              paddingTop: 8,
              paddingBottom: 8,
              marginEnd: -10,
              borderTopLeftRadius: 45,
              borderBottomLeftRadius: 45,
            }}
          >
            <TouchableOpacity onPress={() => takePhoto()}>
              <SpiralIcon name="camera" color={appcolor.info} size={45} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          style={{ flex: 0.8, marginTop: 10 }}
          data={photo}
          key="id"
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={rowItem}
        ></FlatList>
      </View>
      <Modal visible={visibleModal} style={{ flex: 1 }}>
        {mode == 'photo' && (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: appcolor.light,
            }}
          >
            <ImageZoom ImagePath={imageUrl} />
            <TouchableOpacity
              onPress={handlerCloseModal}
              style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}
            >
              <SpiralIcon
                name="close"
                type="font-asomeware-5"
                color={appcolor.dark}
                size={30}
              />
            </TouchableOpacity>
          </View>
        )}
        {mode == 'edit' && (
          <ImageReviewEdit
            itemPhoto={itemPhoto}
            loadData={loadData}
            onClose={handlerCloseModal}
          />
        )}
      </Modal>
    </View>
  );
};
