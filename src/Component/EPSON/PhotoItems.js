import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Icon, Badge, Divider } from '@rneui/themed';
import { getPhotosReport } from '../../Controller/WorkController';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { scaleSize } from '../../Themes/AppsStyle';
import { deviceHeight, deviceWidth } from '../Home';
import DeviceInfo from 'react-native-device-info';
import { BottomConfirm } from '../../Control/BottomConfirm';
import { ToastError, ToastSuccess, UUIDGenerator } from '../../Core/Helper';
import { deletePhotoByList } from '../../Controller/PhotoController';
import ImageZoom from '../../Content/ImageZoom';
import ActionSheet from 'react-native-actions-sheet';
import UploadController from '../../Controller/UploadController';
import NativeCamera from '../../Control/NativeCamera';
import moment from 'moment';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { taskList } from '../../Core/Table';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { APPNAME, URLDEFAULT } from '../../Core/URLs';
import Svg, { Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// isDrawInfo : Thêm thông tin shop vào hình ảnh chụp
export const PhotoItems = ({ navigation, route, usedHeader = true }) => {
  const insets = useSafeAreaInsets();
  const [locked, setLocked] = useState(
    route.params.Status === 1 ? true : false,
  );
  const keyPhoto = route.params.keyPhoto;

  const { kpiinfo, workinfo, appcolor, shopinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [deleted, setDeteted] = useState(false);
  const [lstShow, setLstShow] = useState([]);
  const [template, setTemplate] = useState({});
  const [removeList, setRemove] = useState([]);
  const [ErrorPage, setErrorPage] = useState([]);
  const [photoGroup, setPhotoGroup] = useState([]);
  const [imageIndex, setImageIndex] = useState([]);
  const [isVisible, setVisible] = useState(false);
  const isTakeInOther = route.params.isTakeInOther || false;
  const dataKPIData = route.params.kpiData || {};
  const reportId = isTakeInOther
    ? dataKPIData.id || dataKPIData.kpiId
    : kpiinfo.id || kpiinfo.kpiId;

  const itemReport = JSON.parse(kpiinfo.reportItem || '{}') || {};
  const [itemImage, setItemImage] = useState({
    uri: '',
    heightViewShot: 0,
    widthViewShot: 0,
  });
  const _confirmSheet = useRef();
  const _errorPage = useRef();
  let canvasRef = useRef();

  const loadPhotoItems = async (_template, lockedStatus) => {
    let lstTem = [];
    let isLock = lockedStatus;
    for (const item of _template || []) {
      let photoType =
        keyPhoto !== undefined && keyPhoto !== ''
          ? item.code + '_' + keyPhoto
          : item.code;
      let lstPhoto =
        (await getPhotosReport(
          reportId,
          photoType,
          workinfo.shopId,
          workinfo.workDate,
        )) || [];
      const photoSize = lstPhoto.length || 0;
      //Kiem tra upload du lieu
      if (photoSize > 0 && !route?.params?.lockByStatus) {
        isLock = lstPhoto[0].dataUpload === 1 ? true : false;
        setLocked(isLock);
      }
      //Add take icon
      const deviveId = await DeviceInfo.getDeviceId();
      if (isLock === false) {
        lstPhoto.unshift({
          photoName: 'camera',
          photoType: photoType,
          reportId: reportId,
          shopId: workinfo.shopId,
          shopCode: workinfo.shopCode,
          photoDate: workinfo.workDate,
          photoDesc: item.nameVN,
          guid: deviveId,
          photoPath: null,
        });
      }
      lstTem.push({ ...item, numPhoto: photoSize, photoGroup: lstPhoto });
    }
    setLocked(isLock);
    setLstShow(lstTem);
    return lstTem;
  };
  const MapData = async () => {
    // const item = await JSON.parse(kpiinfo.reportItem) || {}
    const photoByReport = route.params?.dataImageList || itemReport.ImageByList;
    const _template =
      keyPhoto !== undefined && keyPhoto !== '' && !isTakeInOther
        ? await photoByReport[keyPhoto]
        : (await photoByReport) || [];
    await loadPhotoItems(_template, route?.params?.Status === 1 ? true : false);
    setTemplate(_template);
  };
  useEffect(() => {
    const _mapData = MapData();
    return () => _mapData;
  }, []);
  useEffect(() => {
    let _load = false;
    if (itemImage.uri?.length > 0) {
      // setTimeout(() => {
      //     captureAndSaveImage();
      // }, 400)
      _load = captureAndSaveImage();
    }
    return () => _load;
  }, [itemImage]);

  const callBack = async () => {
    await loadPhotoItems(template, locked);
  };
  const callBackPhoto = async res => {
    if (res.statusId === 200) {
      await callBack();
      if (itemReport.isDrawInfo == 1 && res !== null && res !== undefined) {
        await reloadCanvas(res);
      }
    }
  };
  const reloadCanvas = async result => {
    Image.getSize(
      result?.data[0]?.uri,
      (width, height) => {
        setItemImage({
          uri: result?.data[0]?.uri,
          heightViewShot: height * (deviceWidth / width),
          widthViewShot: deviceWidth,
        });
      },
      () => {},
    );
  };
  const takePhoto = async item => {
    if (route.params.Status) return;
    const optionCustom = {
      mediaType: 'photo',
      cameraType: Platform.OS === 'android' ? 'front' : 'back',
      quality: 0.9,
      saveToPhotos: false,
      includeBase64: true,
      selectionLimit: 0,
      maxHeight: 1336,
      maxWidth: 1336,
    };
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: reportId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: item.photoType,
      photoDesc: item.photoDesc,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: shopinfo.latitude,
      shopLong: shopinfo.longitude,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(
      photoinfo,
      callBackPhoto,
      itemReport?.isDrawInfo == 1 ? optionCustom : null,
    );
  };
  const onSelected = (item, parent) => {
    const listSelected = [...lstShow];
    const index = listSelected.findIndex(a => a.code === parent.code);
    let _photoList = listSelected[index].photoGroup;
    const i = _photoList.findIndex(a => a.id === item.id);
    let row = item;
    row.selected = item.selected === 1 ? 0 : 1;
    //Set RemoveList
    let _remove = removeList;
    if (item.selected === 1) {
      _remove.push({ id: row.id });
      setRemove(_remove);
    } else {
      const afterList = _remove.filter(d => d.id !== row.id);
      setRemove(afterList);
    }
    _photoList[i] = row;
    listSelected[index].photoGroup = _photoList;
    setLstShow(listSelected);
  };
  const onShowImage = async (parent, index) => {
    await setImageIndex(index);
    await setPhotoGroup(parent.photoGroup);
    await setVisible(true);
  };
  const rowPhoto = (item, index, parent) => {
    return (
      <View
        key={index + '_pdd'}
        style={{
          backgroundColor: appcolor.surface,
          width: deviceWidth / 3,
          height: deviceWidth / 3,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <View>
          {item.photoPath === null ? (
            <TouchableOpacity
              disabled={deleted ? true : false}
              onPress={() => takePhoto(item)}
            >
              <SpiralIcon
                color={appcolor.primary}
                name={item?.photoName || 'camera'}
                type="ionicon"
                size={65}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ marginEnd: 7, backgroundColor: appcolor.surface }}>
              <TouchableOpacity
                onPress={() => onShowImage(parent, index)}
                onLongPress={
                  locked || (item.dataUpload == 1 && item.fileUpload == 1)
                    ? null
                    : () => setDeteted(true)
                }
              >
                <Image
                  style={{ width: deviceWidth / 3, height: deviceWidth / 3 }}
                  source={{ uri: item.photoPath }}
                />
                <SpiralIcon
                  containerStyle={{
                    position: 'absolute',
                    left: 10,
                    top: 10,
                    display: deleted ? 'none' : 'flex',
                  }}
                  // color={item?.fileUpload > 0 ? appcolor.success : appcolor.danger}
                  color={
                    item?.fileUpload == 1 && item?.dataUpload == 1
                      ? appcolor.success
                      : item?.fileUpload == 1 && item?.dataUpload == 0
                      ? appcolor.warning
                      : item?.fileUpload == 0 && item?.dataUpload == 1
                      ? appcolor.tomato
                      : appcolor.greydark
                  }
                  name={item?.fileUpload > 0 ? 'check-circle' : 'circle'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSelected(item, parent)}
                style={{
                  display: deleted === true ? 'flex' : 'none',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: appcolor.grey,
                    opacity: 0.7,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {item.selected === 1 ? (
                    <SpiralIcon
                      name={'check-circle'}
                      color={appcolor.danger}
                      size={64}
                    />
                  ) : (
                    <View
                      style={{
                        display: deleted === true ? 'flex' : 'none',
                        borderWidth: 3,
                        borderColor: appcolor.dark,
                        height: 50,
                        width: 50,
                        borderRadius: 90,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  const rowItem = ({ item }) => {
    const photoGroup = item.photoGroup;
    return (
      <View style={{ padding: 7 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              fontWeight: 'bold',
              color: appcolor.dark,
              fontSize: scaleSize(20),
            }}
          >
            {item.nameVN}
          </Text>
          <Badge value={item?.numPhoto} />
        </View>
        {item.numberIMG > 0 && (
          <Text
            style={{
              color:
                item.numPhoto < item.numberIMG
                  ? appcolor.danger
                  : appcolor.dark,
              textDecorationLine:
                item.numPhoto < item.numberIMG ? 'underline' : 'none',
              fontSize: scaleSize(12),
              fontStyle: 'italic',
            }}
          >
            {(item.subName ? item.subName : '') +
              (item.numberIMG ? `(Chụp tối thiểu ${item.numberIMG} tấm)` : '')}
          </Text>
        )}
        <View
          style={{
            backgroundColor: appcolor.light,
            padding: 7,
            borderRadius: 12,
            marginTop: 7,
          }}
        >
          <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
            {photoGroup?.map((v, i) => {
              return rowPhoto(v, i, item);
            })}
          </ScrollView>
        </View>
      </View>
    );
  };
  const onDeleteFile = () => {
    deletePhotoByList(removeList);
    _confirmSheet.current.hide();
    setRemove([]);
    setDeteted(false);
    setTimeout(() => {
      callBack();
    }, 400);
    ToastSuccess('Đã xóa', 'Deleted', 'top');
  };
  const onUpload = async () => {
    // const item = JSON.parse(kpiinfo.reportItem) || {}
    const imageGroup =
      route.params?.dataImageList || itemReport?.ImageByList || [];
    const uiTask = [
      <Text
        key={'aaa'}
        style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18) }}
      >
        Bạn chưa chụp đủ hình ảnh các hạng mục
      </Text>,
    ];
    const photoChecks = await Promise.all(
      (imageGroup || []).map(async (item, index) => {
        let photoType = `${item.code}`;
        let lstPhoto =
          (await getPhotosReport(
            reportId,
            photoType,
            workinfo.shopId,
            workinfo.workDate,
          )) || [];
        const photoSize = lstPhoto.length || 0;
        return {
          isEnough: photoSize >= item.numberIMG,
          content: (
            <View key={index + '-29dkl'}>
              <View style={{ padding: 7, flexDirection: 'row' }}>
                <Text
                  style={{
                    flexGrow: 1,
                    textDecorationLine:
                      item.numberIMG > photoSize ? 'underline' : 'none',
                    padding: 3,
                    color:
                      item.numberIMG > photoSize
                        ? appcolor.danger
                        : appcolor.dark,
                  }}
                >
                  {item.nameVN}
                </Text>
                <Text style={{ padding: 3, color: appcolor.dark }}>
                  {photoSize}/{item.numberIMG}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />
            </View>
          ),
        };
      }),
    );
    uiTask.push(...photoChecks.map(item => item.content));
    const isDone = photoChecks.every(item => item.isEnough);
    if (isDone === false) {
      setErrorPage(uiTask);
      _errorPage.current.show();
    } else {
      const info = {
        shopId: workinfo.shopId,
        workDate: workinfo.workDate,
        reportId: reportId,
      };
      const result = await UploadController.DataPhoto(info);
      if (result.statusId === 200) {
        await QueryStringSql(
          `UPDATE ${taskList.tableName} SET taskDone=1,taskAlter='Đã hoàn thành' WHERE shopId=${workinfo.shopId} AND reportId=${reportId}`,
        );
        setLocked(true);
        await loadPhotoItems(template, true);
        await UploadController.PostFile();
        await loadPhotoItems(template, true);
      }
      await ToastSuccess(result.messager);
    }
  };
  const captureAndSaveImage = async () => {
    try {
      const uri = await canvasRef?.current?.capture();
      if (Platform.OS === 'android') {
        const granted =
          Platform.Version < 33 &&
          (await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Yêu cầu quyền',
              message: 'Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục',
            },
          ));
        if (
          granted !== PermissionsAndroid.RESULTS.GRANTED &&
          Platform.Version < 33 &&
          Platform.OS === 'android'
        ) {
          alert('Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!');
          return;
        } else {
          await CameraRoll.save(uri, { type: 'photo', album: APPNAME });
        }
      } else {
        await CameraRoll.save(uri, { type: 'photo', album: APPNAME })
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            console.log(error);
          });
      }
      setItemImage({ heightViewShot: 0, widthViewShot: 0, uri: '' });
    } catch (error) {
      console.log(error);
      ToastError('Lỗi, Ứng dụng chưa được cấp quyền : ' + error);
    }
  };
  return (
    <View style={{ height: '100%', backgroundColor: appcolor.surface }}>
      {route.params.hideIcon ? (
        <HeaderCustom
          title={dataKPIData?.menuNameVN || kpiinfo.menuNameVN}
          leftFunc={() => navigation.goBack()}
        />
      ) : (
        usedHeader && (
          <HeaderCustom
            title={dataKPIData?.menuNameVN || kpiinfo.menuNameVN}
            rightFunc={
              !locked &&
              parseInt(moment(new Date()).format('YYYYMMDD')) ==
                workinfo.workDate
                ? () => onUpload()
                : null
            }
            iconRight={route.params.Status !== 1 ? 'cloud-upload-alt' : null}
            leftFunc={() => navigation.goBack()}
          />
        )
      )}
      {itemImage.uri?.length > 0 && (
        <ViewShot
          key={'imageSave'}
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: -10000,
            width:
              itemImage.widthViewShot === 0 ? '100%' : itemImage.widthViewShot,
            height:
              itemImage.heightViewShot === 0 ? '80%' : itemImage.heightViewShot,
          }}
          options={{ format: 'jpg', quality: 0.8 }}
        >
          <Image
            source={{ uri: itemImage.uri }}
            style={{
              width: itemImage.widthViewShot,
              height: itemImage.heightViewShot,
            }}
          />
          <Svg
            height={itemImage.heightViewShot}
            width={itemImage.widthViewShot}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <SvgText
              x="10"
              y="12"
              fill="red"
              fontSize="7px"
              fontFamily="Arial"
              fontWeight="bold"
            >
              {shopinfo.shopName} - {shopinfo.shopCode}
            </SvgText>
            <SvgText
              x="10"
              y="20"
              fill="red"
              fontSize="7px"
              fontFamily="Arial"
              fontWeight="bold"
            >
              {shopinfo.address}
            </SvgText>
            <SvgText
              x={10}
              y={itemImage.heightViewShot - 10}
              fill="red"
              fontSize="7px"
              fontFamily="Arial"
              fontWeight="bold"
            >
              {dataKPIData?.menuNameVN || kpiinfo.menuNameVN} ||{' '}
              {moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}
            </SvgText>
          </Svg>
        </ViewShot>
      )}
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled
        data={lstShow}
        showsVerticalScrollIndicator={false}
        renderItem={rowItem}
      ></FlatList>
      <TouchableOpacity
        onPress={() =>
          removeList.length === 0
            ? setDeteted(false)
            : _confirmSheet.current.show()
        }
        style={{ display: deleted > 0 ? 'flex' : 'none' }}
      >
        <View
          style={{
            backgroundColor: appcolor.dark,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            justifyContent: 'center',
          }}
        >
          <SpiralIcon
            name={
              removeList.length === 0 ? 'rotate-left' : 'restore-from-trash'
            }
            size={32}
            color={appcolor.danger}
          />
          <Text
            style={{
              textAlignVertical: 'center',
              color: appcolor.light,
              fontSize: 18,
            }}
          >
            {removeList.length === 0
              ? 'Hủy bỏ'
              : '(' + removeList.length + ')Xóa'}
          </Text>
        </View>
      </TouchableOpacity>
      <BottomConfirm
        onConfirm={onDeleteFile}
        ref={_confirmSheet}
        title={`Bạn chắc chắn muốn xóa ${removeList.length} hình đã chọn?`}
      />
      <Modal key={'showImageModal'} visible={isVisible}>
        <MultipleShowImage
          key={'ShowItemImage'}
          listItem={photoGroup}
          closeShowImage={() => setVisible(false)}
          indexItem={imageIndex}
          isTakeInOther={isTakeInOther}
          isUseTool={true}
        />
      </Modal>
      <ActionSheet
        id="sheetalter"
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        ref={_errorPage}
      >
        <View style={{ marginBottom: 50 }}>{ErrorPage}</View>
      </ActionSheet>
    </View>
  );
};
