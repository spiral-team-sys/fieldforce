import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
} from 'react-native';
import { Icon } from '@rneui/themed';
import {
  GetPhotosByReportId,
  deletePhoto,
} from '../../Controller/PhotoController';
import PageHeader from '../../Content/PageHeader';

import moment, { max } from 'moment';
import {
  alertConfirm,
  alertNotify,
  checkNetwork,
  TODAY,
} from '../../Core/Utility';
import NativeCamera from '../../Control/NativeCamera';
import UploadController from '../../Controller/UploadController';
import GmailStyleSwipeableRow from '../../Core/GmailStyleSwipeableRow';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ToastError, UUIDGenerator } from '../../Core/Helper';
import { taskList } from '../../Core/Table';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const PhotoTag = ({ navigation }) => {
  const [photo, setPhoto] = useState([]);
  const { shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [comment, setComment] = useState(null);
  const [upload, setUpload] = useState(false);
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const maxValue = workinfo?.kpi?.refId || 0;
  const loadData = async () => {
    const res = await GetPhotosByReportId(
      shopinfo.shopId,
      workinfo.workDate,
      kpiinfo.id,
    );
    res?.sort((a, b) => a.id < b.id);
    if (res.length > 0) {
      let day = parseInt(moment(new Date()).format('YYYYMMDD'));
      res[0]?.dataUpload === 1 || workinfo.workDate !== day
        ? setUpload(true)
        : setUpload(false);
    }
    setPhoto(res);
  };
  useEffect(() => {
    loadData();
  }, []);
  const takePhoto = async () => {
    if (comment === null || comment.length < 5) {
      ToastError(
        'Bạn chưa nhập nội dung hoặc nội dung quá ngắn (tối thiểu 5 kí tự)',
      );
      return;
    }
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: workinfo.workId,
      photoDesc: comment,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, PhotoResult);
  };
  const PhotoResult = async res => {
    await setComment(null);
    await loadData();
  };
  const SendReport = async () => {
    if (photo === null || photo.length < 1) {
      ToastError('Chưa có dữ liệu báo cáo');
    } else {
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
              await setUpload(true);
              await UploadController.PostFile();
              await QueryStringSql(
                `UPDATE ${taskList.tableName} set taskDone=1 WHERE shopId=${shopinfo.shopId} and reportId=${kpiinfo.id}`,
              );
            }
          },
        );
      } else {
        ToastError('Không có kết nối mạng');
      }
    }
  };
  const deleteImage = async item => {
    await deletePhoto(item);
    await loadData();
  };
  const rowItem = ({ item, index }) => {
    return (
      <GmailStyleSwipeableRow
        enableRight={upload}
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
          {item?.photoDesc !== 'null' && (
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
          )}
          <View style={{ zIndex: 2, borderRadius: 10 }}>
            <TouchableOpacity>
              <ImageBackground
                style={{
                  zIndex: 1,
                  width: '100%',
                  height: 200,
                  borderRadius: 10,
                }}
                source={{ uri: item.photoPath }}
              >
                <View
                  style={{
                    padding: 4,
                    flex: 1,
                    width: '100%',
                    alignItems: 'flex-end',
                  }}
                >
                  <SpiralIcon
                    color={item.fileUpload ? appcolor.success : appcolor.danger}
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
      </GmailStyleSwipeableRow>
    );
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
        iconRight={!upload ? 'cloud-upload-alt' : null}
        title={kpiinfo?.menuNameVN || 'Chụp hình'}
      />
      <View style={{ flex: 1, padding: 7 }}>
        <View
          style={{
            display:
              (maxValue !== 0 && maxValue === photo?.length) ||
                upload ||
                TODAY !== workinfo.workDate
                ? 'none'
                : 'flex',
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
              multiline={true}
              placeholder="Nhập nội dụng ở đây"
              placeholderTextColor={appcolor.grey}
              numberOfLines={1}
              value={comment}
              onChangeText={e => setComment(e)}
              style={{
                minHeight: 40,
                padding: 7,
                color: appcolor.dark,
                maxWidth: '90%',
              }}
              maxLength={200}
            />
            {maxValue > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: appcolor.danger,
                }}
              >
                Bạn được chụp tối đa {maxValue} hình
              </Text>
            )}
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
    </View>
  );
};
