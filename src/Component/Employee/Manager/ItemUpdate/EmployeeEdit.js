import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Avatar, Icon, Text } from '@rneui/themed';
import { URLDEFAULT } from '../../../../Core/URLs';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import ImageZoom from '../../../../Content/ImageZoom';
import {
  TODAY,
  alertConfirm,
  alertError,
  alertNotify,
  alertWarning,
  deviceHeight,
} from '../../../../Core/Utility';
import { LoadingView } from '../../../../Control/ItemLoading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { deviceWidth } from '../../../../Themes/AppsStyle';
import _ from 'lodash';
import { launchImageLibrary } from 'react-native-image-picker';
import { FieldCustom } from '../Control/FieldCustom';
import { GenderChoose } from '../Control/GenderChoose';
import { WorkingStatusChange } from '../Control/WorkingStatusChange';
import { ResignView } from '../Control/ResignView';
import { FromDateToDate } from '../Control/FromDateToDate';
import moment from 'moment';
import { Employee } from '../../../../Controller/EmployeeController';
import { DeviceEventEmitter } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EmployeeEdit = ({ itemEdit, onClose }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [isWarning, setWarning] = useState(false);
  const [employee, setEmployee] = useState(itemEdit);
  const [fieldWarning, setFieldWarning] = useState({
    lastName: null,
    fisrtName: null,
    mobile: null,
    address: null,
    email: null,
    gender: null,
    workingStatusName: null,
  });
  const [dataPhoto, setDataPhoto] = useState([
    {
      photoName: 'camera',
      photoType: 'LEAVE_JOB',
      reportId: 0,
      shopId: 0,
      shopCode: '0',
      photoDate: moment(new Date()).format('YYYYMMDD').toString(),
      photoPath: null,
    },
  ]);
  const [photoPath, setPhotoPath] = useState(null);
  const [_mutate, setMutate] = useState(false);
  const [configReport, _setConfigReport] = useState(
    JSON.parse(kpiinfo?.reportItem),
  );
  //
  const LoadData = async () => {
    await setLoading(true);
    await setLoading(false);
  };
  const updateProfile = async () => {
    if (checkInput()) {
      alertConfirm(
        'Cập nhật dữ liệu',
        'Bạn có muốn cập nhật các thay đổi không ?',
        handlerUpload,
      );
    }
  };
  const handlerUpload = async () => {
    const fileNameAvartar =
      employee.photo !== null
        ? employee.photo.substring(
            employee.photo.lastIndexOf('/') + 1,
            employee.photo.length,
          )
        : null;
    const fromDateValue =
      employee.fromDate !== null
        ? moment(employee.fromDate).format('YYYYMMDD')
        : null;
    const toDateValue =
      employee.toDate !== null
        ? moment(employee.toDate).format('YYYYMMDD')
        : null;
    const itemUpload = [
      {
        employeeId: employee.employeeId,
        fullName: `${employee.lastName || ''} ${employee.fisrtName || ''}`,
        fisrtName: employee.fisrtName || '',
        lastName: employee.lastName || '',
        gender: employee.gender,
        genderId: employee.genderId,
        mobile: employee.mobile || '',
        email: employee.email || '',
        address: employee.address || '',
        photo:
          fileNameAvartar !== null
            ? `/uploaded/${TODAY}/${fileNameAvartar}`
            : null,
        workingStatusId: employee.workingStatusId,
        workingStatusName: employee.workingStatusName,
        fromDate: fromDateValue,
        toDate: toDateValue,
        status: employee.status,
        reasonId: employee.reasonId,
        reasonName: employee.reasonName,
        noteResign: employee.noteResign,
        // photoResign: JSON.stringify(employee.photoResign)
      },
    ];
    //
    // Send Resgin By Employee
    if (employee.workingStatusId == 3) {
      const photoResign = await Employee.getPhotoResignByEmployee(
        employee.employeeCode,
      );
      let photoUpload = [];
      if (photoResign !== null && photoResign.length > 0) {
        photoResign?.forEach(item => {
          if (item.photoPath != null) {
            let ImgName = item.photoPath.substring(
              item.photoPath.lastIndexOf('/') + 1,
              item.photoPath.length,
            );
            let fileName = `'/uploaded/${item.photoDate}/${ImgName}`;
            photoUpload.push({
              guid: item.guid,
              photoType: item.photoType,
              photo: fileName,
              photoDate: item.photoDate,
              photoFullTime: item.photoFullTime,
            });
          }
        });
      }
      const notifyContent = `Quản lí ${
        userinfo.employeeName
      } đã cho nhân viên ${employee.lastName || ''} ${
        employee.fisrtName || ''
      } nghỉ việc vào ngày ${employee.fromDate} lúc ${moment(new Date()).format(
        'HH:mm',
      )}.`;
      const itemConfirm = {
        confirm: 1,
        employeeId: employee.employeeId,
        fromDate: fromDateValue,
        id: 0,
        isDelete: 0,
        notes: employee.notes || '',
        photo: JSON.stringify(photoUpload),
        reasonId: employee.reasonId,
        workingStatus: employee.workingStatusId,
        notifyContent: notifyContent,
      };
      // Send Data
      const result = await Employee.sendEmployeeResigns(
        JSON.stringify(itemConfirm),
        dataPhoto,
        'CONFIRM',
        userinfo.groupType || 'SUP',
        employee.employeeId,
      );
      if (result.statusId === 200 && result.data?.length > 0) {
        const json = {
          id: result.data[0]?.Id,
        };
        const resultSendMail = await Employee.sendMailEmployeeResign(
          JSON.stringify(json),
        );
        alertNotify(resultSendMail.messager);
      } else {
        alertError(result.messager);
      }
    }
    // Update profile info
    const updateProfile = await Employee.uploadProfile(
      JSON.stringify(itemUpload),
      dataPhoto,
    );
    if (updateProfile) {
      DeviceEventEmitter.emit('UPDATE_LIST_PROFILE');
      onClose();
    }
  };
  // Handler
  const checkInput = () => {
    if (configReport?.isShowResign == 1)
      if (
        employee.workingStatusId == 3 ||
        employee.workingStatusName == 'Nghỉ việc'
      ) {
        if (
          (employee.photoResign == null || employee.photoResign.length == 0) &&
          configReport?.isCheckResignImage == 1
        ) {
          alertWarning(
            'Vui lòng bổ sung hình ảnh "Đơn xin nghỉ việc" của nhân viên trước khi cập nhật thông tin',
          );
          return false;
        }
        if ((employee?.reasonId || 0) == 0) {
          alertWarning(
            'Vui lòng chọn "Nội dung nghỉ việc" của nhân viên trước khi cập nhật thông tin',
          );
          return false;
        }
        // Khác
        if (
          employee?.reasonId == 100 &&
          (employee.noteResign == null ||
            employee.noteResign.length == 0 ||
            employee.noteResign.length <= 10)
        ) {
          alertWarning(
            'Vui lòng nhập "Lí do" nghỉ việc chi tiết trước khi cập nhật thông tin',
          );
          return false;
        }
      }

    if (
      employee.workingStatusName !== 'Nghỉ việc' &&
      employee.workingStatusName !== 'Nhân viên chính thức'
    ) {
      if (employee.fromDate == null || employee.toDate == null) {
        alertWarning(
          `Vui lòng chọn thời gian Từ ngày - Đến ngày "${employee.workingStatusName}" trước khi cập nhật thông tin`,
        );
        return false;
      }
    }
    return true;
  };
  const onInput = async (type, text) => {
    switch (type) {
      case 'lastName':
        employee.lastName = text;
        break;
      case 'fisrtName':
        employee.fisrtName = text;
        break;
      case 'mobile':
        employee.mobile = text;
        break;
      case 'email':
        employee.email = text;
        break;
      case 'address':
        employee.address = text;
        break;
    }
    await setMutate(e => !e);
  };
  const onChooseGender = gender => {
    const genderName = gender == 1 ? 'Nữ' : gender == 2 ? 'Nam' : null;
    employee.genderId = gender;
    employee.gender = genderName;
    setMutate(e => !e);
  };
  const handlerViewImage = async () => {
    if (employee.photo == null || employee.photo == undefined) return;
    const path =
      employee.photo &&
      (employee.photo.includes('file://')
        ? employee.photo
        : URLDEFAULT + employee.photo);
    await setPhotoPath(path);
    await SheetManager.show('imageview');
  };
  const handlerChangeStatus = async (item, typeItem) => {
    switch (typeItem) {
      case 'workingstatus':
        const today = moment().format('YYYY-MM-DD');
        employee.workingStatusName = item.itemName;
        employee.workingStatusId = item.Id;
        employee.fromDate = item.Id == 3 ? today : null;
        employee.toDate = null;
        break;
      case 'reasonResign':
        employee.reasonName = item.itemName;
        employee.reasonId = item.ReasonId;
        break;
      default:
        break;
    }
    await setMutate(e => !e);
  };
  const handlerChangeDateResign = date => {
    employee.fromDate = date;
    setMutate(e => !e);
  };
  const onNoteResign = text => {
    employee.noteResign = text;
    setMutate(e => !e);
  };
  const actionGalaryProfile = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 1024,
      quality: 0.4,
      includeBase64: true,
    };
    await launchImageLibrary(options, async response => {
      if (!response.didCancel) {
        let { assets } = await response;
        employee.photo = assets[0]?.uri || employee.photo;
        await setMutate(e => !e);
      }
    });
  };
  const handlerChangeFromToDate = (from, to) => {
    employee.fromDate = from;
    employee.toDate = to;
    setMutate(e => !e);
  };
  const _handlerLockUser = () => {
    const valueContent =
      employee.status == 1
        ? 'Bạn có muốn khoá tài khoản này không ?'
        : 'Bạn có muốn mở tài khoản này không ?';
    alertConfirm('Cập nhật trạng thái', valueContent, () => {
      employee.userStatus = employee.status == 1 ? 'Đã khoá' : 'Đang hoạt động';
      employee.status = employee.status == 1 ? 0 : 1;
      setMutate(e => !e);
    });
  };
  const onPhotoResign = photo => {
    employee.photoResign = JSON.stringify(photo);
    setMutate(e => !e);
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.light,
    },
    mainItem: {
      margin: 8,
      borderWidth: 0.8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    titleEmployee: { fontSize: 16, fontWeight: '700', color: appcolor.light },
    subTitleEmployee: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.light,
      fontStyle: 'italic',
    },
    headerView: { width: '100%', flexDirection: 'row', zIndex: 1 },
    inputView: {
      width: '100%',
      height: deviceHeight,
      padding: 8,
      marginTop: 8,
    },
    iconType: { padding: 8 },
    actionAvatar: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      end: 0,
      backgroundColor: appcolor.light,
      borderRadius: 30,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    buttonUpdate: {
      padding: 8,
      margin: 8,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      borderRadius: 20,
      width: deviceWidth / 2.5,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          width: '100%',
          height: deviceHeight / 6,
          zIndex: -10,
          backgroundColor: employee.backgroundColor,
          position: 'absolute',
          top: -100,
        }}
      />
      {/* Content Header */}
      <View style={styles.headerView}>
        <View
          style={{
            alignSelf: 'center',
            width: '100%',
            backgroundColor: employee.backgroundColor || appcolor.primary,
            padding: 8,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.titleEmployee}>{employee.employeeName} </Text>
            <SpiralIcon
              solid
              name={employee.status == 1 ? 'check-circle' : 'times-circle'}
              type="font-awesome-5"
              size={15}
              color={employee.status == 1 ? appcolor.success : appcolor.red}
              style={{
                backgroundColor: appcolor.light,
                padding: 2,
                borderRadius: 20,
              }}
            />
          </View>
          <Text
            style={styles.subTitleEmployee}
          >{`Code: ${employee.employeeCode}`}</Text>
          <Text
            style={styles.subTitleEmployee}
          >{`User: ${employee.username}`}</Text>
        </View>
        <View style={{ position: 'absolute', end: 16, top: -8 }}>
          {employee.photo !== null ? (
            <Avatar
              rounded
              size="xlarge"
              source={{
                uri:
                  employee.photo &&
                  (employee.photo.includes('file://')
                    ? employee.photo
                    : URLDEFAULT + employee.photo),
              }}
              containerStyle={{ backgroundColor: appcolor.light, padding: 3 }}
              onPress={handlerViewImage}
            />
          ) : (
            <Avatar
              rounded
              size="xlarge"
              title={employee.shortName}
              titleStyle={{ color: appcolor.primary, fontWeight: '600' }}
              containerStyle={{
                borderWidth: 3,
                borderColor: appcolor.placeholderBody,
                padding: 3,
                backgroundColor: appcolor.light,
              }}
              onPress={handlerViewImage}
            />
          )}
          {/* <View style={styles.actionAvatar}>
                        <TouchableOpacity onPress={actionGalaryProfile}>
                            <SpiralIcon
                                name='pen'
                                type='font-awesome-5'
                                size={18}
                                color={appcolor.info}
                                style={{ padding: 10 }} />
                        </TouchableOpacity>
                    </View> */}
        </View>
      </View>
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <TouchableOpacity onPress={updateProfile} style={styles.buttonUpdate}>
        <Text
          style={{
            width: '100%',
            textAlign: 'center',
            color: appcolor.primary,
            fontWeight: '700',
            fontSize: 13,
          }}
        >
          Cập nhật thông tin
        </Text>
      </TouchableOpacity>
      {/* Content Input */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          width: '100%',
          height: deviceHeight,
          padding: 5,
          paddingTop: 8,
        }}
        nestedScrollEnabled
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%', height: '100%' }}
          extraHeight={deviceHeight / 4}
          enableOnAndroid
        >
          <FieldCustom
            keyItem="lastName"
            styles={styles}
            title="Họ"
            value={employee.lastName}
            placeholder="vd: Nguyen"
            isWarning={isWarning}
            titleWarning={fieldWarning.lastName}
            onInput={onInput}
          />
          <FieldCustom
            keyItem="fisrtName"
            styles={styles}
            title="Tên đệm & Tên"
            value={employee.fisrtName}
            placeholder="vd: Van A"
            isWarning={isWarning}
            titleWarning={fieldWarning.fisrtName}
            onInput={onInput}
          />
          <GenderChoose
            key="gender"
            styles={styles}
            title="Giới tính"
            value={employee.genderId}
            isWarning={isWarning}
            titleWarning={fieldWarning.gender}
            onChoose={onChooseGender}
          />
          <FieldCustom
            keyItem="mobile"
            styles={styles}
            title="Số điện thoại"
            value={employee.mobile}
            placeholder="###-###-####"
            isWarning={isWarning}
            titleWarning={fieldWarning.mobile}
            valueLength={10}
            onInput={onInput}
          />
          <FieldCustom
            keyItem="email"
            styles={styles}
            title="Email"
            value={employee.email}
            placeholder="@spiral.com.vn"
            isWarning={isWarning}
            titleWarning={fieldWarning.email}
            onInput={onInput}
          />
          <FieldCustom
            keyItem="address"
            styles={styles}
            title="Địa chỉ"
            value={employee.address}
            placeholder="Địa chỉ"
            isWarning={isWarning}
            titleWarning={fieldWarning.address}
            onInput={onInput}
          />
          <WorkingStatusChange
            key="workingStatusName"
            title="Trạng thái làm việc"
            value={employee.workingStatusName}
            statusList={JSON.parse(employee.workingStatusList)}
            onChange={handlerChangeStatus}
          />
          {/* Resign Employee */}
          {configReport?.isShowResign == 1 &&
            employee.workingStatusName == 'Nghỉ việc' && (
              <ResignView
                key="resign"
                title="Đơn xin nghỉ việc"
                employee={employee}
                photoResign={dataPhoto}
                dataReason={JSON.parse(employee?.workingStatusReason || '[]')}
                onDateChange={handlerChangeDateResign}
                handlerChoose={handlerChangeStatus}
                onChangeNoteResign={onNoteResign}
                onPhotoResign={onPhotoResign}
              />
            )}
          {employee.workingStatusName !== 'Nghỉ việc' &&
            employee.workingStatusName !== 'Nhân viên chính thức' && (
              <FromDateToDate
                title={employee.workingStatusName}
                fromDate={employee.fromDate}
                toDate={employee.toDate}
                onFilterChangeTime={handlerChangeFromToDate}
              />
            )}
          <View style={{ height: deviceHeight / 2 }} />
        </KeyboardAwareScrollView>
      </ScrollView>
      {/* Photo View */}
      <ActionSheet
        id="imageview"
        containerStyle={{
          backgroundColor: appcolor.dark,
          paddingBottom: insets.bottom,
        }}
        gestureEnabled
        drawUnderStatusBar={Platform.OS == 'ios'}
      >
        <SafeAreaView style={{ width: '100%', height: deviceHeight }}>
          <ImageZoom ImagePath={photoPath} />
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
