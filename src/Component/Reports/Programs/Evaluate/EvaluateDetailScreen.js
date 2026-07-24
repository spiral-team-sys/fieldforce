import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { Icon } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import moment from 'moment';
import { alertConfirm, checkNetwork, TODAY } from '../../../../Core/Utility';
import { deletePhotoByList } from '../../../../Controller/PhotoController';
import {
  checkLinkType,
  getStore,
  removeStore,
  saveStore,
} from '../../../../Core/Helper';
import { REPORT } from '../../../../API/ReportAPI';
import CustomListView from '../../../../Control/Custom/CustomListView';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import NativeCamera from '../../../../Control/NativeCamera';
import LoadingDefault from '../../../../Control/ItemLoading/LoadingDefault';
import { getDataPhotoByGUID } from '../../../../Controller/ReportController';
import { PROGRAM_KEY } from '../../../../Core/KEYs';
import ReviewDisplay from '../Page/ReviewDisplay';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const FORM_ID = {
  REVIEW: 1,
};
const EvaluateDetailScreen = ({ navigation, route }) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({});
  const [dataMain, setDataMain] = useState([]);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [photo, _setPhoto] = useState({ visible: false, data: [], index: 0 });
  const [_mutate, setMutate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formId, setFormId] = useState(null);

  const getStorageKey = () => {
    const { dataItem, itemVerify } = route?.params || {};
    return `${PROGRAM_KEY.DATA_EVALUATE}_${shopinfo.shopId}_${shopinfo.auditDate}_${dataItem?.programId}_${itemVerify?.id}`;
  };
  const LoadData = async () => {
    const { dataItem, itemVerify } = route?.params;
    await getDataPhotoByGUID(
      kpiinfo.id,
      shopinfo.shopId,
      dataItem.guid,
      setDataPhoto,
    );
    const dataVerify = JSON.parse(dataItem?.verifyList || '[]')?.filter(
      it => it.id === itemVerify.id,
    );
    const savedData = await getStore(getStorageKey());
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData({ ...dataItem, ...parsedData });
    } else {
      setData(dataItem);
    }
    setDataMain(dataVerify);
    setFormId(itemVerify?.id);
  };
  const onSubmit = async () => {
    const isValid = await validData();
    if (!isValid) return;
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      toastError(
        'Kết nối mạng',
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    alertConfirm(
      'Gửi đánh giá',
      'Bạn có chắc chắn muốn gửi đánh giá không ?',
      async () => {
        await setLoading(true);
        const result = await REPORT.UploadDataRaw_Realtime(
          data,
          shopinfo,
          kpiinfo.id,
        );
        if (result.statusId == 200) {
          toastSuccess('Thông báo', result.messager);
          await removeStore(getStorageKey());
          DeviceEventEmitter.emit('RELOAD_DATA_EVALUATE');
          navigation.goBack();
        } else {
          toastError('Thông báo', result.messager);
        }
        await setLoading(false);
      },
    );
  };
  const validData = async () => {
    if (formId == FORM_ID.REVIEW) {
      if (data.inputPassed == null || data.inputPassed == undefined) {
        toastError(
          'Thông báo',
          'Vui lòng chọn trạng thái đánh giá trưng bày trước khi gửi đánh giá',
        );
        return false;
      }
      if (data.inputNote == null || data.inputNote == undefined) {
        toastError(
          'Thông báo',
          'Vui lòng nhập ghi chú đánh giá trước khi gửi đánh giá',
        );
        return false;
      }
      if (data.inputNote.length < 5) {
        toastError('Thông báo', 'Ghi chú đánh giá không được ít hơn 5 ký tự');
        return false;
      }
    }
    for (const item of dataMain) {
      const photoList = dataPhoto.filter(
        it => it.photoType === `PROGRAM_REVIEW_${data.programId}_${item.id}`,
      );
      if (photoList.length == 0) {
        toastError(
          'Thông báo',
          `Vui lòng chụp hình trưng bày cho ${item.name} trước khi gửi đánh giá`,
        );
        return false;
      }
    }
    return true;
  };
  //
  const handlerShowImage = (item, index, photoList = []) => {
    if (photoList.some(it => it.isDelete)) {
      handlerSelectPhoto(item);
    } else {
      photo.visible = true;
      photo.data = photoList;
      photo.index = index;
    }
    setMutate(e => !e);
  };
  const handlerCloseImage = () => {
    photo.visible = false;
    photo.data = [];
    photo.index = 0;
    setMutate(e => !e);
  };
  const handlerSelectPhoto = async item => {
    const updateData = dataPhoto.map(it => {
      return {
        ...it,
        isDelete: it.guid == item.guid ? !it.isDelete : it.isDelete,
      };
    });
    setDataPhoto(updateData);
  };
  const handlerGoBack = () => {
    navigation.goBack();
    DeviceEventEmitter.emit('RELOAD_DATA_EVALUATE');
  };
  const handlerButtonCamera = (photoType, isDelete, photoList) => {
    const dataDelete = photoList.filter(it => it.isDelete);
    if (isDelete) {
      alertConfirm(
        'Xóa hình ảnh',
        `Bạn có chắc chắn muốn xóa ${dataDelete?.length} hình ảnh không ?`,
        async () => {
          await deletePhotoByList(dataDelete);
          await LoadData();
        },
      );
    } else {
      onCapture(photoType);
    }
  };
  const onChangeReviewData = async updatedData => {
    setData(updatedData);
    await saveStore(getStorageKey(), JSON.stringify(updatedData));
  };
  const onCapture = async photoType => {
    const templateInfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      latitude: shopinfo.latitude,
      longitude: shopinfo.longitude,
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: photoType,
      photoDesc: data.programName || 'Chụp hình đánh giá',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      guid: data.guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    //
    await NativeCamera.cameraStart(templateInfo, async result => {
      if (result?.statusId === 200) {
        await getDataPhotoByGUID(
          kpiinfo.id,
          shopinfo.shopId,
          data.guid,
          setDataPhoto,
        );
      } else {
        result.messager && toastError('Máy ảnh', result.messager);
      }
    });
  };

  useEffect(() => {
    LoadData();
  }, []);

  const renderInputForm = () => {
    switch (formId) {
      case FORM_ID.REVIEW:
        return <ReviewDisplay data={data} onChangeData={onChangeReviewData} />;
      default:
        return <View />;
    }
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, padding: 12 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
      marginTop: 8,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    captureCardHorizontal: { alignItems: 'center', justifyContent: 'center' },
    captureIconWrap: {
      width: 86,
      height: 86,
      borderRadius: 86,
      backgroundColor: appcolor.grayLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: 16,
    },
    photoList: { flex: 1 },
    photoListContent: { alignItems: 'center', paddingRight: 8 },
    photoItem: {
      width: 86,
      height: 86,
      marginRight: 8,
      borderRadius: 86,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    photoImage: { width: '100%', height: '100%', borderRadius: 86 },
    badgeText: {
      color: appcolor.light,
      fontSize: 11,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    badgeContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: appcolor.red,
      borderRadius: 28,
      minWidth: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.black,
      opacity: 0.8,
      zIndex: 1000,
    },
  });
  const renderItem = (item, index, photoList) => {
    const onPress = () => handlerShowImage(item, index, photoList);
    const onLongPress = () => handlerSelectPhoto(item);
    return (
      <TouchableOpacity
        onLongPress={data.isLocked == 1 ? null : onLongPress}
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.photoItem}
      >
        {item.isDelete && (
          <View style={styles.deleteContainer}>
            <SpiralIcon
              name="checkmark-circle"
              type="ionicon"
              size={24}
              color={appcolor.primary}
            />
          </View>
        )}
        <Image
          source={{ uri: checkLinkType(item.photoPath) }}
          style={styles.photoImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };
  const renderItemGroup = ({ item, index }) => {
    const photoType = `PROGRAM_REVIEW_${data.programId}_${item.id}`;
    const photoList = dataPhoto.filter(it => it.photoType === photoType);
    const isDelete = photoList.some(it => it.isDelete);
    const onPress = () => handlerButtonCamera(photoType, isDelete, photoList);
    return (
      <View key={index} style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{item.name}</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={styles.captureCardHorizontal}
            disabled={data.isLocked == 1}
            onPress={onPress}
          >
            <View style={styles.captureIconWrap}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{photoList.length}</Text>
              </View>
              <SpiralIcon
                name="camera"
                type="ionicon"
                size={32}
                color={appcolor.primary}
              />
            </View>
          </TouchableOpacity>
          {isDelete && data.isLocked !== 1 && (
            <TouchableOpacity
              style={styles.captureCardHorizontal}
              onPress={onPress}
            >
              <View style={styles.captureIconWrap}>
                <SpiralIcon
                  name="trash"
                  type="ionicon"
                  size={32}
                  color={appcolor.primary}
                />
              </View>
            </TouchableOpacity>
          )}
          <FlatList
            horizontal
            data={photoList}
            keyExtractor={(photoItem, photoIndex) =>
              `${photoItem?.guid || photoItem?.photoPath || 'photo'
              }_${photoIndex}`
            }
            renderItem={({ item: photoItem, index: photoIndex }) =>
              renderItem(photoItem, photoIndex, photoList)
            }
            showsHorizontalScrollIndicator={false}
            style={styles.photoList}
            contentContainerStyle={styles.photoListContent}
          />
        </View>
      </View>
    );
  };
  if (loading)
    return (
      <LoadingDefault isLoading={loading} title={'Đang gửi đánh giá...'} />
    );

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={data.programName}
        leftFunc={handlerGoBack}
        iconRight={data.isLocked == 1 ? null : 'cloud-upload-alt'}
        rightFunc={data.isLocked == 1 ? null : () => onSubmit()}
      />
      <View style={styles.contentContainer}>
        {renderInputForm()}
        <CustomListView
          data={dataMain}
          renderItem={renderItemGroup}
          bottomView={{ paddingBottom: 0 }}
        />
      </View>

      <ViewPictures
        visible={photo.visible}
        images={photo.data}
        initialIndex={photo.index}
        onSwipeDown={handlerCloseImage}
      />
    </View>
  );
};

export default EvaluateDetailScreen;
