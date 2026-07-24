import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { Avatar, Icon, Text } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { URLDEFAULT } from '../../../../Core/URLs';
import { ButtonAction } from '../Control/ButtonAction';
import { groupDataByKey, UUIDGenerator } from '../../../../Core/Helper';
import { ItemDetails } from './ItemDetails';
import { TouchableOpacity } from 'react-native';
import {
  TODAY,
  alertWarning,
  deviceHeight,
  optionConfirm,
} from '../../../../Core/Utility';
import { EmployeeAPI } from '../../../../API/EmployeeAPI';
import NativeCamera from '../../../../Control/NativeCamera';
import { REPORT } from '../../../../API/ReportAPI';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { SET_EmployeeInfo, SetUserInfo } from '../../../../Redux/action';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import CustomListView from '../../../../Control/Custom/CustomListView';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import moment from 'moment';
import _ from 'lodash';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const ScreenEmployeeInfo = ({ navigation }) => {
  const { masterData, employeeInfo, appcolor, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [lockForm, setLockForm] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [info, setInfo] = useState({});
  const [data, setData] = useState([]);
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [_mutate, setMutate] = useState(false);
  const dispatch = useDispatch();

  const LoadData = async () => {
    const { arr } = await groupDataByKey({
      arr: masterData,
      key: 'GroupId',
    });
    //
    await setInfo(employeeInfo);
    await setData(arr);
  };
  const syncDataEmployee = async () => {
    await setLoading(true);
    await EmployeeAPI.saveDataEmployeeInfo(
      employeeInfo,
      async (statusId, message) => {
        if (statusId == 200) {
          DeviceEventEmitter.emit('RELOAD_EMPLOYEE');
          toastSuccess('Thông báo', message);
        } else {
          toastError('Thông báo', message);
        }
      },
    );
    await setLoading(false);
  };
  // Handler
  const onShowImage = () => {
    itemShowImage.visible = true;
    itemShowImage.index = 0;
    itemShowImage.photos = [{ photoPath: info.photo }];
    setMutate(e => !e);
  };
  const handlerHideImage = () => {
    itemShowImage.visible = false;
    itemShowImage.index = 0;
    itemShowImage.photos = [];
    setMutate(e => !e);
  };
  const onUpdateInfo = async item => {
    const _update = !(item.isUpdate || false);
    await setLockForm(_update);
    // Sync Data
    if (!_update) {
      const valid = await validData(item.DetailList);
      if (!valid) return;
      await syncDataEmployee();
    }
    //
    const listUpdate = _.map(data, e => {
      return e.GroupId == item.GroupId
        ? { ...e, isUpdate: _update }
        : { ...e, isUpdate: false };
    });
    await setData(listUpdate);
  };
  const onCancelUpdateInfo = async item => {
    const _update = !(item.isUpdate || false);
    await setLockForm(_update);
    const listUpdate = _.map(data, e => {
      return e.GroupId == item.GroupId
        ? { ...e, isUpdate: _update }
        : { ...e, isUpdate: false };
    });
    await setData(listUpdate);
  };
  const isValidDateValue = value => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const valueString = value.toString();
    return (
      moment(valueString, 'DD/MM/YYYY', true).isValid() ||
      moment(valueString, 'YYYY-MM-DD', true).isValid() ||
      moment(valueString, moment.ISO_8601, true).isValid()
    );
  };
  const validData = dataDetailList => {
    const dataRequired = _.filter(dataDetailList, e => e.IsRequired == 1);
    if (dataRequired !== null && dataRequired.length > 0) {
      let strError = '';
      for (let index = 0; index < dataRequired.length; index++) {
        const item = dataRequired[index];
        const _value = employeeInfo[item.Ref_Code] || null;
        if (
          _value == null ||
          _value.length < (item.MaxLength || 1) ||
          _value == '[]'
        )
          strError += `- ${item.ItemName}\n`;
      }
      if (strError !== null && strError.length > 0) {
        alertWarning(
          `Vui lòng nhập đầy đủ thông tin bắt buộc (Có gắn sao đỏ):\n${strError}`,
        );
        return false;
      }
    }
    const dataDateInvalid = _.filter(
      dataDetailList,
      e => e.Ref_Name === 'date' && !isValidDateValue(employeeInfo[e.Ref_Code]),
    );
    if (dataDateInvalid !== null && dataDateInvalid.length > 0) {
      const strError = _.map(
        dataDateInvalid,
        item => `- ${item.ItemName}`,
      ).join('\n');
      alertWarning(
        `Ngày tháng năm không hợp lệ, vui lòng nhập đúng định dạng DD/MM/YYYY:\n${strError}`,
      );
      return false;
    }
    return true;
  };
  const onOpenInfo = item => {
    const listUpdate = _.map(data, e => {
      const itemUpdate =
        e.GroupId == item.GroupId
          ? { ...e, isOpen: !(item.isOpen || false), isUpdate: false }
          : { ...e, isOpen: false, isUpdate: false };
      return itemUpdate;
    });
    setData(listUpdate);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  };
  const handlerChangeAvatar = () => {
    const options = [
      { text: 'Hủy' },
      { text: 'Máy ảnh', onPress: handlerCameraAction },
      { text: 'Thư viện', onPress: handlerGalleryAction },
    ];
    optionConfirm(
      'Thay đổi hình ảnh',
      'Bạn có thể tự chụp hình chân dung bằng Máy ảnh hoặc Chọn ảnh từ thư viện ảnh',
      options,
    );
  };
  const handlerCameraAction = async () => {
    const _guid = UUIDGenerator();
    const photoinfo = {
      shopId: employeeInfo.employeeId,
      shopCode: employeeInfo.employeeCode,
      reportId: 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: 'AVATAR',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: _guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const handlerGalleryAction = async () => {
    const _guid = UUIDGenerator();
    const photoinfo = {
      shopId: employeeInfo.employeeId,
      shopCode: employeeInfo.employeeCode,
      reportId: 0,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: 'AVATAR',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: _guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, result => {
      actionCallBackResult(photoinfo, result);
    });
  };
  const actionCallBackResult = async (photoInfo, result) => {
    if (result.statusId == 200) {
      await REPORT.UploadFilePhoto();
      const info = result.data[0] || {};
      employeeInfo.photo = `/uploaded/${photoInfo.photoDate}/${info.fileName}`;
      employeeInfo.avatarPath = info.uri;
      await dispatch(SET_EmployeeInfo(employeeInfo));
      if (userinfo.employeeId != undefined) {
        let newUserInfo = { ...userinfo };
        newUserInfo.photo = `/uploaded/${photoInfo.photoDate}/${info.fileName}`;
        await dispatch(SetUserInfo(newUserInfo));
      }
      await syncDataEmployee();
    }
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    //
    LoadData();
    const _syncData = DeviceEventEmitter.addListener(
      'SYNC_DATA_EMPLOYEE',
      syncDataEmployee,
    );
    return () => {
      isMounted = false;
      _syncData.remove();
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    titleHeadName: {
      width: '100%',
      fontSize: 18,
      fontWeight: '700',
      color: appcolor.light,
      textAlign: 'center',
    },
    titleContentName: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.surface,
      textAlign: 'center',
    },
    viewPhoto: { backgroundColor: appcolor.light, padding: 3 },
    viewPhotoText: {
      borderWidth: 3,
      borderColor: appcolor.grayLight,
      padding: 3,
      backgroundColor: appcolor.light,
    },
    titlePhotoText: {
      fontSize: 68,
      color: appcolor.primary,
      fontWeight: '600',
    },
    avatarView: { alignSelf: 'center', borderRadius: 100 },
    infoBasicView: { width: '100%', alignSelf: 'center', padding: 8 },
    actionAvatar: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      end: 0,
      backgroundColor: appcolor.light,
      borderRadius: 50,
    },
    contentMain: { width: '100%', height: '100%', padding: 12 },
    itemMain: { width: '100%' },
    parentView: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
      padding: 8,
      marginBottom: 0,
    },
    contentInfoMain: {
      width: '100%',
      minHeight: deviceHeight / 2.3,
      borderRadius: 16,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 0 },
      marginBottom: 8,
    },
    itemHeadName: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.surface,
      marginStart: 8,
    },
    itemEditName: {
      fontSize: 15,
      fontWeight: '500',
      color: appcolor.surface,
      textDecorationLine: 'underline',
      padding: 8,
      textAlign: 'right',
      fontStyle: 'italic',
    },
    endActionView: { position: 'absolute', end: 8, flexDirection: 'row' },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      onUpdateInfo(item);
    };
    const onCancel = () => {
      onCancelUpdateInfo(item);
    };
    const onPressOpen = () => {
      !lockForm && onOpenInfo(item);
    };
    const iconView =
      item.isOpen == 0 ? 'chevron-down-outline' : 'chevron-up-outline';
    return (
      <View key={`immmi_${index}`} style={styles.itemMain}>
        {item.isParent && (
          <TouchableOpacity style={styles.parentView} onPress={onPressOpen}>
            {item.isOpen == 1 && isLoading ? (
              <ActivityIndicator size="small" color={appcolor.light} />
            ) : (
              <SpiralIcon
                type="ionicon"
                name="information-circle"
                size={18}
                color={appcolor.surface}
              />
            )}
            <Text style={styles.itemHeadName}>{item.GroupName}</Text>
            {item.isEditData == 1 && item.isOpen == 1 ? (
              <View style={styles.endActionView}>
                {item.isUpdate && (
                  <TouchableOpacity onPress={onCancel} style={{ marginEnd: 8 }}>
                    <Text style={styles.itemEditName}>{'Hủy'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onPress}>
                  <Text style={styles.itemEditName}>
                    {item.isUpdate ? 'Lưu dữ liệu' : 'Chỉnh sửa'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.endActionView}>
                <SpiralIcon
                  type="ionicon"
                  name={iconView}
                  size={18}
                  color={appcolor.light}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
        {item.isOpen == 1 && (
          <View style={styles.contentInfoMain}>
            <ItemDetails navigation={navigation} itemMain={item} />
          </View>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.avatarView}>
        {info.photo ? (
          <Avatar
            rounded
            size="xlarge"
            source={{
              uri:
                (info.avatarPath || null) !== null
                  ? info.avatarPath
                  : info.photo.includes('file://')
                    ? info.photo
                    : `${URLDEFAULT}${info.photo}`,
            }}
            containerStyle={styles.viewPhoto}
            onPress={onShowImage}
          />
        ) : (
          <Avatar
            rounded
            size="xlarge"
            title={info.shortName}
            titleStyle={styles.titlePhotoText}
            containerStyle={styles.viewPhotoText}
          />
        )}
        <View style={styles.actionAvatar}>
          <ButtonAction
            typeAction="UPDATEPHOTO"
            iconName="camera"
            sizeView={38}
            iconSize={18}
            onPress={handlerChangeAvatar}
          />
        </View>
      </View>
      <View style={styles.infoBasicView}>
        <Text style={styles.titleHeadName}>{info.fullName}</Text>
        <Text style={styles.titleContentName}>{info.typeDescription}</Text>
      </View>
      <View style={styles.contentMain}>
        <CustomListView data={data} extraData={data} renderItem={renderItem} />
      </View>
      <ViewPictures
        visible={itemShowImage.visible}
        images={itemShowImage.photos || []}
        initialIndex={itemShowImage.index}
        onSwipeDown={handlerHideImage}
      />
    </SafeAreaView>
  );
};
