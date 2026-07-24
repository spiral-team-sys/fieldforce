import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AttendantController } from '../../Controller/AttendantController';
import CustomListView from '../../Control/Custom/CustomListView';
import { Icon, Image, Text } from '@rneui/base';
import { LOCATION_INFO } from '../../Utils/LocationInfo';
import {
  checkAndRequestPermission,
  LOCATION_PERMISSION,
} from '../../Utils/permissions';
import { deviceWidth, fontWeightBold } from '../../Themes/AppsStyle';
import LottieView from 'lottie-react-native';
import { alertConfirm, TODAY } from '../../Core/Utility';
import RNRestart from 'react-native-restart-newarch';
import { VALID_ATTENDANCE } from './utils/validAttendance';
import moment from 'moment';
import { setCameraInfo, SetKpiInfo, setLocationInfo } from '../../Redux/action';
import { toastError } from '../../Utils/configToast';
import { checkLinkType, UUIDGenerator } from '../../Core/Helper';
import { ATTENDANT_API } from '../../API/AttendantAPI';
import ViewPictures from '../../Control/Gallary/ViewPictures';
import { SheetManager } from 'react-native-actions-sheet';
import { isValidField } from '../../Utils/validateData';
import SheetNote from './control/SheetNote';
import { LoadingView } from '../../Control/ItemLoading';
import { SYNC_DATA_ATT } from '../../Core/URLs';
import { FlashList } from '@shopify/flash-list';

const AttendanceList = ({ navigation }) => {
  const { appcolor, shopinfo, workinfo, isEdit } = useSelector(
    state => state.GAppState,
  );
  const { locationInfo } = useSelector(state => state.location);
  const [isLoading, setLoading] = useState(true);
  const [isWaiting, setWaiting] = useState(false);
  const [pictureShow, _setPictureShow] = useState({
    visible: false,
    index: 0,
    dataShow: [],
  });
  const [dataAttendance, setDataAttendance] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const isPressingAttendanceRef = useRef(false);
  const isAcceptingNoteRef = useRef(false);
  const dispatch = useDispatch();
  //
  const LoadData = async workSelected => {
    setLoading(true);
    try {
      const config = JSON.parse(shopinfo.config || '{}');
      const currentWork = workSelected || workinfo || {};
      const shopId = currentWork?.shopId || shopinfo.shopId;
      const attendantDate =
        currentWork?.workDate || shopinfo.auditDate || shopinfo.auditdate;

      await ATTENDANT_API.GetDataAttendance({ shopId, attendantDate });

      const data = await AttendantController.GetAttendant(
        { ...shopinfo, shopId },
        attendantDate,
      );
      AttendantController.CreateTemplateAttendance(
        currentWork,
        locationInfo,
        data,
        config.numberAtt,
        (mAttendance, mSwiper) => {
          console.log(mAttendance);

          setDataAttendance(mAttendance);
        },
      );
    } catch (error) {
      toastError('Lỗi dữ liệu chấm công', `${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };
  const handlerGetLocation = () => {
    checkAndRequestPermission(LOCATION_PERMISSION);
    LOCATION_INFO.getCurrentLocation(
      async info => {
        dispatch(setLocationInfo(info));
      },
      error => {
        toastError('Lỗi lấy vị trí', error);
      },
    );
  };
  const handlerPressAttendance = async item => {
    if (isPressingAttendanceRef.current) return;

    isPressingAttendanceRef.current = true;
    let didNavigate = false;
    try {
      if (item.photoDate == TODAY) {
        const isValid = await VALID_ATTENDANCE.byShopConfig(navigation, {
          shopinfo,
          workinfo,
          isEdit,
          item,
        });
        if (!isValid) return;

        setWaiting(true);
        dispatch(setCameraInfo({ ...item, guid: UUIDGenerator() }));
        navigation.navigate('Camera');
        didNavigate = true;
      } else {
        alertConfirm(
          'Chấm công',
          'Bạn đang chấm công ngày cũ, vui lòng thoát ứng dụng và thử lại',
          () => {
            RNRestart.Restart();
          },
          () => {},
          'Đồng ý',
          'Đóng',
        );
      }
    } finally {
      setWaiting(false);
      if (!didNavigate) {
        isPressingAttendanceRef.current = false;
      }
    }
  };
  const handlerPressImage = item => {
    pictureShow.visible = true;
    pictureShow.index = 0;
    pictureShow.dataShow = [item];
    setMutate(e => !e);
  };
  const handlerCloseImage = () => {
    pictureShow.visible = false;
    pictureShow.dataShow = [];
    setMutate(e => !e);
  };
  const handlerReupload = async item => {
    const result = await ATTENDANT_API.UploadAttendance(item, 'REUPLOAD');
    if (result) LoadData();
  };
  const handlerReloadAttendance = async photoInfo => {
    await LoadData();
    if (Number(photoInfo?.photoType) % 2 === 0) {
      SheetManager.show('kpi-sheet');
    }
  };
  const onReportTo = itemMenu => {
    dispatch(SetKpiInfo(itemMenu));
    navigation.navigate(`${itemMenu.pageName}`, {
      workinfo: workinfo,
      titlePage: itemMenu.name,
      reportId: itemMenu.kpiId,
    });
  };
  // Action
  const onAcceptNote = itemNoteWork => {
    if (isAcceptingNoteRef.current) return;

    isAcceptingNoteRef.current = true;
    const config = JSON.parse(shopinfo?.config || '{}');
    if ((config?.shopNote || 0) == 0) {
      if (!isValidField(itemNoteWork.note) || itemNoteWork.note.length < 10) {
        toastError(
          itemNoteWork.titleAlert,
          'Vui lòng nhập nội dụng ghi chú & tối thiểu 10 kí tự',
        );
        isAcceptingNoteRef.current = false;
        return;
      }
    }
    //
    SheetManager.hide('note-attendance-sheet');
    LOCATION_INFO.getCurrentLocation(
      async info => {
        dispatch(setLocationInfo(info));
        dispatch(
          setCameraInfo({
            ...itemNoteWork.item,
            photoDesc: itemNoteWork.note,
            guid: UUIDGenerator(),
          }),
        );
        navigation.navigate('Camera');
      },
      error => {
        toastError('Lỗi lấy vị trí', error);
        isAcceptingNoteRef.current = false;
      },
    );
  };
  //
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      isPressingAttendanceRef.current = false;
      isAcceptingNoteRef.current = false;
    });
    const reload_attendance = DeviceEventEmitter.addListener(
      'RELOAD_ATTENDANCE',
      handlerReloadAttendance,
    );
    const sync_attendance = DeviceEventEmitter.addListener(
      SYNC_DATA_ATT,
      LoadData,
    );
    const report_to = DeviceEventEmitter.addListener('REPORT_TO', onReportTo);
    handlerGetLocation();
    LoadData();
    return () => {
      unsubscribeFocus();
      reload_attendance.remove();
      sync_attendance.remove();
      report_to.remove();
    };
  }, []);
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, padding: 8 },
    itemMain: {
      width: deviceWidth / 1.8,
      height: deviceWidth / 2.1,
      backgroundColor: appcolor.surface,
      marginHorizontal: 4,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: appcolor.surface,
      shadowColor: appcolor.grey,
      shadowOffset: { width: 1, height: 0 },
      shadowRadius: 8,
      shadowOpacity: 0.3,
      elevation: 3,
      overflow: 'hidden',
    },
    nonePhotoView: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
      alignSelf: 'center',
    },
    havePhotoView: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
      alignSelf: 'center',
    },
    contentImage: { flex: 1 },
    titleName: {
      position: 'absolute',
      top: 0,
      width: '100%',
      textAlign: 'center',
      padding: 8,
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    titleTime: {
      position: 'absolute',
      bottom: 0,
      textAlign: 'center',
      width: '100%',
      backgroundColor: appcolor.light,
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 2,
    },
    iconStatusContainer: { position: 'absolute', top: 8, right: 8 },
    preview: { width: '100%', height: '100%' },
    reuploadView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      justifyContent: 'center',
      backgroundColor: appcolor.white,
      opacity: 0.7,
    },
    sheetContainer: {
      width: '100%',
      height: 'auto',
      padding: 8,
      paddingBottom: 32,
    },
    titleAlert: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
      textAlign: 'center',
    },
  });
  const renderItem = ({ item }) => {
    const onPress = () => handlerPressAttendance(item);
    const onPressImage = () => handlerPressImage(item);
    const onReupload = () => handlerReupload(item);
    const photoPath = checkLinkType(item.photoPath);
    const colorStatus = item.fileUpload == 1 ? appcolor.success : appcolor.red;
    //
    const nonePhoto = (
      <TouchableOpacity style={styles.nonePhotoView} onPress={onPress}>
        <LottieView
          autoPlay
          style={{ height: '90%' }}
          source={require('../../Themes/lotties/facecico.json')}
        />
      </TouchableOpacity>
    );
    const havePhoto = (
      <View View style={styles.havePhotoView}>
        <View style={styles.contentImage}>
          <Image
            source={{ uri: photoPath }}
            resizeMethod="resize"
            resizeMode="cover"
            style={styles.preview}
            onPress={onPressImage}
          />
          <SpiralIcon
            color={colorStatus}
            containerStyle={styles.iconStatusContainer}
            name="checkmark-circle"
            size={24}
            type="ionicon"
            activeOpacity={0.7}
          />
        </View>
        {item.dataUpload === 0 && (
          <TouchableOpacity onPress={onReupload} style={styles.reuploadView}>
            <SpiralIcon
              color={appcolor.red}
              type="ionicon"
              name="sync-circle"
              size={68}
            />
          </TouchableOpacity>
        )}
      </View>
    );
    return (
      <View style={styles.itemMain}>
        {item.photoTime ? havePhoto : nonePhoto}
        <Text style={styles.titleName}>
          {item.photoType % 2 == 0 ? `IN` : 'OUT'}
        </Text>
        <Text style={styles.titleTime}>
          {item.photoTime
            ? moment(item.photoTime, 'YYYYMMDDHHmmss').format(
                'HH:mm:ss dddd DD/MM',
              )
            : ''}
        </Text>
      </View>
    );
  };
  if (isLoading || isWaiting)
    return (
      <LoadingView
        isLoading={isLoading || isWaiting}
        styles={{ flex: 1, justifyContent: 'center' }}
        title={isWaiting ? 'Đang xác định thông tin tọa độ' : null}
      />
    );
  return (
    <View style={styles.mainContainer}>
      <CustomListView
        horizontal
        data={dataAttendance}
        extraData={[dataAttendance]}
        renderItem={renderItem}
        endView={{ paddingEnd: 0 }}
      />
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.dataShow}
        initialIndex={pictureShow.index}
        onSwipeDown={handlerCloseImage}
      />
      {/* Action */}
      <SheetNote onAccept={onAcceptNote} />
    </View>
  );
};
export default AttendanceList;
