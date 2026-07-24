import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Calendar } from 'react-native-calendars';
import { Badge, Icon } from '@rneui/themed';
import { launchImageLibrary } from 'react-native-image-picker';

import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import {
  deleteItemPhotoByType,
  deleteItemPhotoDuplicate,
  getPhotoByType,
} from '../../Controller/DisplayController';
import {
  Employee,
  getProfileEmployee,
} from '../../Controller/EmployeeController';
import { GetByListCode } from '../../Controller/MasterController';
import { InsertPhotosItem } from '../../Controller/PhotoController';
import GmailStyleSwipeableRow from '../../Core/GmailStyleSwipeableRow';
import {
  Message,
  MessageInfo,
  UUIDGenerator,
  groupDataByKey,
} from '../../Core/Helper';
import { AppNameBuild, URLDEFAULT } from '../../Core/URLs';
import { deviceHeight, deviceWidth } from '../Home';
import { openFileViewer } from '../../Core/Utility';
import RNFS from 'react-native-fs';
import { pick, types } from '@react-native-documents/picker';
import UploadController from '../../Controller/UploadController';
import { ModalNotify } from '../../Control/ModalNotify';
import NativeCamera from '../../Control/NativeCamera';
import { Linking } from 'react-native';
import { toastError } from '../../Utils/configToast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const EmployeeResigns = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataResigns: {},
    dataReason: [],
    dataPhoto: [],
    dataPhotoSystem: [],
    dataFile: {},
  });
  const [isResigned, setResigned] = useState(false);
  const [selectReason, setSelectReason] = useState({});
  const [ortherReason, setOrtherReason] = useState('');
  const [dateSelect, setDateSelect] = useState(
    moment(new Date()).format('YYYY-MM-DD'),
  );
  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    markedDates: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    reportDate: '',
  });
  const [imageIndex, setImageIndex] = useState(0);
  const [showProgress, setProgress] = useState(false);
  const [countUpload, setCountUpload] = useState(0);
  const [_Mutate, setMutate] = useState(false);
  const [modeEvident, setMode] = useState(1); // 0:none, 1:photo, 2:file
  const [isVisible, setVisible] = useState(false);
  const [messager, setMessager] = useState();
  const [disableOK, setDisableOK] = useState(true);
  const [isModalResign, setIsModalResign] = useState(false);
  const titleNotify = 'Lưu ý dành cho nhân viên nghỉ việc';
  const [alertResignDate, setAlertResignDate] = useState('');
  const refImageSheet = useRef([]);
  const [configResign, setConfigResingn] = useState(null);

  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      const markedDates = {};
      markedDates[dateString] = {
        selected: true,
        selectedColor: appcolor.primary,
        textColor: appcolor.white,
      };
      await setDataCalendar({
        ...dataCalendar,
        markedDates: markedDates,
      });
      setDateSelect(dateString);
    } else {
      await setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
      });
      setDateSelect(dateString);
    }

    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    checkContract(currentDate, dateString);
    closeSheet('CALENDAR');
  };

  const checkContract = (dateCheck, dateString, config = configResign) => {
    const contractNoticeDays = config?.contractNoticeDays;
    if (contractNoticeDays > 0 && dateCheck && dateString) {
      const countDayResign = moment(dateString, 'YYYY-MM-DD').diff(
        dateCheck,
        'days',
      );
      // thêm note nếu route.params?.noteResignByEmployee có tồn tại
      if (countDayResign < contractNoticeDays) {
        const dateLimit = moment(dateCheck)
          .add(contractNoticeDays, 'days')
          .format('YYYY-MM-DD');
        const dateLate = moment(dateLimit, 'YYYY-MM-DD').diff(
          dateString,
          'days',
        );
        const costViolate = config?.salaryDefault
          ? (countDayResign > contractNoticeDays
              ? contractNoticeDays
              : dateLate) *
            (config?.salaryDefault / 30)
          : 0;
        let contentAlert = `*Cảnh báo vi phạm thời gian báo trước: \n- Số ngày nhân viên cần báo trước: ${contractNoticeDays} ngày\n- Số ngày nhân viên báo trước: ${countDayResign} ngày\n- Số ngày vi phạm: ${
          dateLate > contractNoticeDays ? contractNoticeDays : dateLate
        } ngày\n- Ngày nghỉ sớm nhất đúng quy định: ${dateLimit}\n${
          costViolate > 0
            ? `- Mức phạt vi phạm: ${costViolate.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}`
            : ''
        }${
          config?.noteResignByEmployee
            ? `\n- ${config.noteResignByEmployee}`
            : ''
        }`;
        setAlertResignDate(contentAlert);
      } else {
        setAlertResignDate(
          `${
            config?.noteResignByEmployee
              ? `\n- ${config.noteResignByEmployee}`
              : ''
          }`,
        );
      }
    }
  };

  const getConfirmContent = confirm => {
    if (confirm === 1) {
      return 'Đồng ý';
    }
    if (confirm === 0) {
      return 'Từ chối';
    }
    return 'Chờ xác nhận';
  };

  const normalizeDataResigns = (item = {}) => {
    const confirm = Number(item.confirm ?? 3);
    return {
      ...item,
      confirm,
      confirmContent: item.confirmContent || getConfirmContent(confirm),
    };
  };

  const getConfirmIcon = confirm => {
    if (confirm === 1) {
      return 'check';
    }
    if (confirm === 0) {
      return 'times';
    }
    return 'clock-o';
  };

  const loadData = async (config = configResign) => {
    await setProgress(true);
    await deleteItemPhotoByType('LEAVE_JOB');
    const dataResigns = await Employee.getResignInfo('EmployeeBreak');

    const listReason = await GetByListCode(`'DetailReasonResign'`);
    const { arr } = groupDataByKey({
      arr: listReason,
      key: 'groupId',
    });

    if (dataResigns.statusId === 200) {
      const contentData = normalizeDataResigns(dataResigns.data?.[0] || {});
      if (dataResigns.data?.length > 0 && contentData?.isDelete !== 1) {
        setResigned(true);
        const listPhoto = [];
        const fileResign = JSON.parse(contentData?.resignFile || '{}');
        JSON.parse(contentData?.photo || '[]').map(it =>
          listPhoto.push({ photoPath: it.photo }),
        );

        const itemReason = arr.find(it => it.id == contentData?.reasonId);
        setData(prev => ({
          ...prev,
          dataPhotoSystem: listPhoto,
          dataResigns: contentData,
          dataReason: arr,
          dataPhoto: listPhoto,
          dataFile: fileResign,
        }));

        await setOrtherReason(contentData?.notes);
        await setSelectReason(itemReason);
        await setDateSelect(contentData?.fromDate);
        checkContract(
          moment(contentData.createdDate).format('YYYY-MM-DD'),
          moment(contentData.fromDate, 'YYYYMMDD').format('YYYY-MM-DD'),
          config,
        );

        if (
          config?.resignRegisterView !== null &&
          config?.resignRegisterView !== undefined
        ) {
          const resignRegisterView = JSON.parse(
            config?.resignRegisterView || '[]',
          );
          await handleLoadImageSize(resignRegisterView);
          await onViewNoteResign(
            config?.resignConfirmNote,
            resignRegisterView,
            contentData || {},
          );
        }
      } else {
        await setData(prev => ({ ...prev, dataReason: arr }));
        await setMutate(e => !e);
      }
    } else {
      await toastError('Lỗi kết nối');
    }
    await setProgress(false);
  };
  const LoadDataConfig = async () => {
    const dataConfig = await Employee.getResignInfo('ConfigResign');
    const dataConfigResigns = dataConfig.data?.[0] || {};
    const ConfigResigns =
      JSON.parse(dataConfigResigns?.configResign || '[]')?.[0] || {};

    setConfigResingn(ConfigResigns);
    await loadResignRegisterView(ConfigResigns);

    return ConfigResigns;
  };
  const loadResignRegisterView = async ConfigResigns => {
    if (
      ConfigResigns?.resignRegisterView !== null &&
      ConfigResigns?.resignRegisterView !== undefined
    ) {
      const resignRegisterView = JSON.parse(
        ConfigResigns?.resignRegisterView || '[]',
      );
      await handleLoadImageSize(resignRegisterView);
      await onViewNoteResign(
        ConfigResigns?.resignConfirmNote,
        resignRegisterView,
        data.dataResigns,
      );
    }
  };
  useEffect(() => {
    const init = async () => {
      const config = await LoadDataConfig();
      await loadData(config);
    };
    init();
    return () => false;
  }, []);

  const takePhoto = async () => {
    const guiIdPhoto = UUIDGenerator();
    let photoinfo = {};
    photoinfo = {
      photoType: 'LEAVE_JOB',
      dataUpload: 0,
      fileUpload: 0,
      shopId: 0,
      photoPath: null,
      guiId: guiIdPhoto,
      photoDate: moment(new Date()).format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, reloadpage);
    // navigation.navigate('CameraReport', { ...photoinfo, callBackReport: reloadpage, closeTakePhoto: true });
  };
  const reloadpage = async () => {
    const itemPhotoByGuiId = await getPhotoByType('LEAVE_JOB');
    setData(prev => ({ ...prev, dataPhoto: itemPhotoByGuiId }));
  };
  const uploadFile = async () => {
    const guiIdPhoto = UUIDGenerator();
    let photoinfo = {};
    let options = {
      mediaType: 'photo',
      maxWidth: 1336,
      maxHeight: 1336,
      quality: 1,
      includeBase64: true,
    };

    await launchImageLibrary(options, async response => {
      if (!response.didCancel) {
        let { assets } = (await response) || [];
        if (assets !== undefined) {
          await assets?.forEach(async res => {
            const newImageUrl = await NativeCamera.resizeImage(await res.uri);
            photoinfo = {
              shopId: 0,
              photoPath: newImageUrl?.uri || res.uri,
              photoDate: moment(new Date()).format('YYYYMMDD'),
              photoType: 'LEAVE_JOB',
              photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
              fileUpload: 0,
              dataUpload: 0,
              guid: guiIdPhoto,
              photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
            };
            await InsertPhotosItem(photoinfo);
            await reloadpage(guiIdPhoto);
          });
        }
      }
    });
  };
  const openFileSample = pathFile => {
    openFileViewer(
      pathFile || '',
      e => {
        console.log(pathFile);
      },
      false,
    );
  };
  const downloadFile = (uri, path) => {
    RNFS.downloadFile({ fromUrl: URLDEFAULT + uri, toFile: path }).promise.then(
      res => {
        if (res.statusCode == 200) {
          openFileSample(path);
        } else {
          MessageInfo(`Xảy ra lỗi khi tải file!`);
          return;
        }
      },
    );
  };
  const handleSelectFile = async uri => {
    let fileUri = uri?.includes('https') ? uri : `${URLDEFAULT}${uri}`;
    if (fileUri.length > 0) {
      const name = uri.substring(uri.lastIndexOf('/') + 1, uri.length);
      const extension = Platform.OS === 'android' ? 'file://' : '';
      const path = `${extension}${RNFS.CachesDirectoryPath}/Resign/`;
      const pathFile = `${path}${name}`;
      RNFS.exists(pathFile).then(exists => {
        if (exists) {
          openFileSample(pathFile);
        } else {
          RNFS.mkdir(path).catch(err => {
            console.log('mkdir error', err);
          });
          downloadFile(uri, pathFile);
        }
      });
    }
  };

  const uploadPdf = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      const [response] = await pick({
        presentationStyle: 'pageSheet',
        type: types.pdf,
      });
      const regex = /\s/;
      let isError = false;
      const checkWhiteSpaceName = regex.test(response.name);
      if (checkWhiteSpaceName) {
        isError = true;
        MessageInfo('Tên tệp tin có chứa khoảng trắng!');
        return;
      }
      if (isError) {
        return;
      }

      await UploadController.uploadFilePDF(
        [{ ...response }],
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        async result => {
          let dataFile = {};
          const itemResult = result.find(it => it.fileUri === response.uri);
          if (itemResult?.filePath !== undefined) {
            dataFile = {
              filePath: itemResult.filePath,
              name: response.name,
              uri: response.uri,
              size: response.size,
            };
          }
          await setData(prev => ({ ...prev, dataFile: dataFile }));
        },
        () => {
          MessageInfo(
            'Lỗi khi gửi tệp tin lên hệ thống, vui lòng thử lại sau!',
          );
        },
        'resign',
      );
    } catch (err) {
      console.log('cancel');
      // MessageInfo('Lỗi khi thực hiện gửi tệp tin, vui lòng thử lại sau!')
    }
  };

  const handleSelectMode = type => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (type == 'PHOTO') {
      setMode(modeEvident == 1 ? 0 : 1);
    } else if (type == 'FILE') {
      setMode(modeEvident == 2 ? 0 : 2);
    }
  };

  const uploadAction = async () => {
    let count = countUpload;

    if (count === 0) {
      count = count + 1;
      if (Object.keys(selectReason).length === 0) {
        toastError('Bạn chưa chọn lí do nghỉ việc!!!', 'Thông báo', 'top');
        return;
      }
      // if (selectReason.id === 100 || data.dataReason?.length == 0) {
      if (ortherReason === '') {
        toastError('Bạn chưa nhập lí do chi tiết!!!', 'Thông báo', 'top');
        return;
      }
      if (ortherReason.length > 0 && ortherReason.length < 5) {
        toastError(
          'Bạn nhập lí do chi tiết quá ngắn, tối thiểu 5 kí tự!!!',
          'Thông báo',
          'top',
        );
        return;
      }
      // }

      const currentDate = moment(new Date()).format('YYYYMMDD');
      const resignsDate = moment(dateSelect.toString()).format('YYYYMMDD');

      const selectPastDate = configResign?.selectPastDate || 0;

      if (resignsDate <= currentDate && selectPastDate !== 1) {
        toastError('Ngày nghỉ phải lớn hơn ngày hiện tại', 'Thông báo', 'top');
        return;
      }

      const countDayResign = moment(resignsDate, 'YYYY-MM-DD').diff(
        moment(currentDate, 'YYYY-MM-DD'),
        'days',
      );
      const minDateResign = configResign?.minDateResign || 0;
      if (countDayResign <= minDateResign && minDateResign !== 0) {
        toastError(
          `Ngày nghỉ phải sau ${minDateResign} ngày so với ngày hiện tại!`,
          'Thông báo',
          'top',
        );
        return;
      }

      const profileEmployee = await getProfileEmployee(userinfo.employeeId);
      const dataProfile = profileEmployee.table1[0];
      if (dataProfile.workingStatusId !== 1 && configResign?.isCheckFile == 1) {
        if (
          (data?.dataPhoto == undefined || data?.dataPhoto?.length === 0) &&
          Object.keys(data.dataFile).length == 0
        ) {
          toastError('Bạn chưa chụp hình/chọn file PDF đơn xin nghỉ việc!!!');
          return;
        }
      }

      let dataPhoto = [];
      // const notifyContent = `Nhân viên ${route?.params?.employeeInfo?.employeeName || ''} đã gửi yêu cầu xin nghỉ việc vào ${moment(new Date()).format('YYYY-MM-DD')}.`
      const notifyContent =
        'Nhân viên ' +
        (userinfo.employeeName || '') +
        ' đã gửi yêu cầu xin nghỉ việc vào ' +
        moment(new Date()).format('YYYY-MM-DD HH:mm') +
        '.';
      data.dataPhoto?.forEach(element => {
        let ImgName = element.photoPath.substring(
          element.photoPath.lastIndexOf('/') + 1,
          element.photoPath.length,
        );
        let fileName = '/uploaded/' + element.photoDate + '/' + ImgName;
        dataPhoto.push({ photo: fileName, photoPath: fileName });
      });
      let dataUpload = {
        employeeId: userinfo.employeeId,
        workingStatus: 3,
        fromDate: resignsDate,
        notes: ortherReason || '',
        reasonId: selectReason.id,
        photo: JSON.stringify(dataPhoto),
        resignFile: JSON.stringify(data.dataFile || {}),
        confirm: 3,
        confirmContent: getConfirmContent(3),
        notifyContent: notifyContent,
      };
      await UploadController.PostFile();
      Message(
        'Chú ý',
        `Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?`,
        async () => {
          await setCountUpload(count);
          const notifyNote = 'SEND';
          const group = userinfo.groupType;
          const result = await Employee.sendEmployeeResigns(
            JSON.stringify(dataUpload),
            dataPhoto,
            notifyNote,
            group,
            null,
          );
          if (
            result.statusId === 200 ||
            (result.statusId === 500 && result.messager.includes('mail'))
          ) {
            const nextDataResigns = normalizeDataResigns(
              result.data?.[0] || dataUpload,
            );
            setData(prev => ({ ...prev, dataResigns: nextDataResigns }));
            await setResigned(true);
            if (result.statusId == 500) {
              toastError(result.messager);
            }
          } else {
          }
        },
      );
    } else {
      toastError('Double', 'Thông báo', 'top');
    }
  };
  const handleDateSelect = async date => {
    let dateCV = moment(date).format('YYYYMMDD');
    // parseInt(date.replace(/-/gm, ''))
    let currentDate = moment(new Date()).format('YYYYMMDD');
    if (dateCV <= currentDate) {
      toastError('Ngày nghỉ phải sau ngày hiện tại!', 'Lỗi', 'top');
      return;
    }
    setDateSelect(dateCV);
  };

  const selectItem = type => {
    if (type === 'CALENDAR') {
      SheetManager.show('calendarSheet');
    } else if (type === 'REASON') {
      SheetManager.show('reasonSheet');
    } else if (type === 'IMAGE_ZOOM') {
      SheetManager.show('imageSheet');
    } else if (type == 'FILE') {
      handleSelectFile(data.dataFile?.filePath);
    }
  };

  const closeSheet = async type => {
    if (type === 'CALENDAR') {
      SheetManager.hide('calendarSheet');
    } else if (type === 'REASON') {
      SheetManager.hide('reasonSheet');
    } else if (type === 'IMAGE_ZOOM') {
      await SheetManager.hide('imageSheet');
      isModalResign === true && (await setVisible(true));
      await setIsModalResign(false);
    }
  };
  const handleSelectReason = item => {
    setSelectReason(item);
    closeSheet('REASON');
  };
  const deletePhoto = async it => {
    if (it.id !== undefined) {
      deleteItemPhotoDuplicate(it);
      const listPhoto = data.dataPhoto.filter(item => item.id !== it.id);
      setData(prev => ({ ...prev, dataPhoto: listPhoto }));
    }
  };
  const deleteFile = async it => {
    setData(prev => ({ ...prev, dataFile: {} }));
    setMutate(e => !e);
  };

  const onGoBack = async () => {
    if (!isResigned) {
      data.dataPhoto.map(it => {
        it.id !== undefined && deleteItemPhotoDuplicate(it);
      });
    }
    navigation.goBack();
  };

  const handleResentResign = async () => {
    setData(prev => ({ ...prev, dataResigns: {}, dataPhoto: [] }));
    setSelectReason({});
    setOrtherReason('');
    setDateSelect(moment(new Date()).format('YYYYMMDD'));
    setResigned(false);
  };
  const deleteResign = async () => {
    Message('Chú ý', `Bạn có chắc chắn muốn huỷ yêu cầu?`, async () => {
      const notifyContent =
        'Nhân viên ' +
        (userinfo.employeeName || '') +
        ' đã huỷ yêu cầu xin nghỉ việc vào ' +
        moment(new Date()).format('YYYY-MM-DD HH:mm') +
        '.';
      const dataUpload = {
        ...(data.dataResigns || {}),
        isDelete: 1,
        notifyContent: notifyContent,
      };
      const notifyNote = 'DELETE';
      const group = userinfo.groupType;
      const result = await Employee.sendEmployeeResigns(
        JSON.stringify(dataUpload),
        null,
        notifyNote,
        group,
        null,
      );
      if (
        result.statusId === 200 ||
        (result.statusId === 500 && result.messager.includes('mail'))
      ) {
        setData(prev => ({
          ...prev,
          dataResigns: {},
          dataPhoto: [],
          dataFile: {},
        }));
        setSelectReason({});
        setOrtherReason('');
        setDateSelect(moment(new Date()).format('YYYYMMDD'));
        setDataCalendar({
          markedDatesDefault: {
            [moment(new Date()).format('YYYY-MM-DD').toString()]: {
              selected: true,
              marked: true,
              selectedColor: appcolor.primary,
            },
          },
          markedDates: {
            [moment(new Date()).format('YYYY-MM-DD').toString()]: {
              selected: true,
              marked: true,
              selectedColor: appcolor.primary,
            },
          },
          reportDate: '',
        });
        setCountUpload(0);
        data.dataPhoto.map(it => {
          it.id !== undefined && deleteItemPhotoDuplicate(it);
        });
        setResigned(false);
      } else {
        toastError('Lỗi kết nối!');
      }
    });
  };

  const handleViewImage = async item => {
    setIsModalResign(true);
    setImageIndex(0);
    setData(prev => ({
      ...prev,
      dataPhoto: [
        {
          photoPath: URLDEFAULT + item.Url.replace(/\\/g, '/'),
          nameView: item.FileName,
        },
      ],
    }));
    await setVisible(false);
    await SheetManager.show('imageSheet');
  };

  const ResignConfirmNote = ({ note }) => {
    const phoneRegex = /(\d{10})/g;
    const phone = note.match(phoneRegex);

    const onCallPhone = phone => {
      let phoneNumber = '';
      if (Platform.OS === 'android') {
        phoneNumber = `tel:${phone}`;
      } else {
        phoneNumber = `telprompt:${phone}`;
      }
      Linking.openURL(phoneNumber);
    };

    return (
      <TouchableOpacity onPress={() => onCallPhone(phone)}>
        <Text style={{ fontSize: 14, color: appcolor.dark }}>
          {note.split('\n').map((line, index) => {
            const parts = line.split(phoneRegex);
            return (
              <Text key={index}>
                {parts.map((part, i) =>
                  phoneRegex.test(part) ? (
                    <Text
                      key={i}
                      style={{ fontWeight: 'bold', color: appcolor.danger }}
                    >
                      {part}
                    </Text>
                  ) : (
                    <Text
                      key={i}
                      style={{ fontSize: 14, color: appcolor.dark }}
                    >
                      {part}
                    </Text>
                  ),
                )}
                {'\n'}
              </Text>
            );
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  const onShowNoteResign = () => {
    const parsedView = JSON.parse(configResign?.resignRegisterView || '[]');
    return (
      <View style={{ height: deviceHeight * 0.6 }}>
        <ScrollView
          style={{ width: deviceWidth, marginBottom: 10 }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;

            if (isCloseToBottom) {
              setDisableOK(false);
            }
          }}
          scrollEventThrottle={400}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {parsedView.length > 0 && (
              <View style={{ width: '100%' }}>
                {parsedView.map((item, index) => (
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '90%',
                    }}
                    key={index}
                    onPress={() => handleViewImage(item)}
                  >
                    <Image
                      source={
                        item.URI
                          ? { uri: URLDEFAULT + item.Url.replace(/\\/g, '/') }
                          : require('../../Themes/Images/noimage.png')
                      }
                      resizeMode="stretch"
                      style={{ width: 400, height: 400 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {configResign?.resignConfirmNote && (
              <View style={{ width: '80%', padding: 10 }}>
                <ResignConfirmNote note={configResign?.resignConfirmNote} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const getImageSize = (uri, index) => {
    Image.getSize(uri, (width, height) => {
      const ratio = height / width;
      refImageSheet.current[index] = deviceWidth * ratio;
    });
  };

  const handleLoadImageSize = resignRegisterView => {
    resignRegisterView.forEach((item, index) => {
      const uri = URLDEFAULT + item.Url.replace(/\\/g, '/');
      getImageSize(uri, index);
    });
  };

  const onViewNoteResign = async (resignConfirmNote, resignRegisterView) => {
    let viewNoteResign = [];
    const parsedView = resignRegisterView || [];

    viewNoteResign.push(
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {parsedView.length > 0 && (
          <View style={{ width: '100%' }}>
            {parsedView.map((item, index) => {
              const uri = URLDEFAULT + item.Url.replace(/\\/g, '/');
              console.log(uri);

              return (
                <TouchableOpacity
                  key={'ImageNote_' + index}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                  onPress={() => handleViewImage(item)}
                >
                  <Image
                    source={{ uri: URLDEFAULT + item.Url.replace(/\\/g, '/') }}
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      height: refImageSheet.current[index] || 200,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {resignConfirmNote && (
          <View style={{ width: '80%', padding: 10 }}>
            <ResignConfirmNote note={resignConfirmNote} />
          </View>
        )}
      </View>,
    );
    setMessager(
      <View style={{ height: deviceHeight * 0.6, width: deviceWidth * 0.9 }}>
        <ScrollView
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;

            if (isCloseToBottom) {
              setDisableOK(false);
            }
          }}
          scrollEventThrottle={16}
          style={{ width: '100%', marginBottom: 10 }}
        >
          {viewNoteResign[0]}
        </ScrollView>
      </View>,
    );
    await handleVisibleModal(true);
  };

  const handleVisibleModal = async visible => {
    setData(prev => ({ ...prev, dataPhoto: prev.dataPhotoSystem }));
    await setVisible(visible);
  };
  const onShowNotice = () => {
    handleVisibleModal(true);
    onShowNoteResign();
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    headerContainer: {
      padding: 10,
      width: deviceWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: { fontWeight: '600', fontSize: 16, paddingLeft: 10 },
    headerRight: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerLink: {
      fontWeight: '600',
      textDecorationLine: 'underline',
      fontSize: 16,
      paddingLeft: 10,
    },
    contentContainer: { flexDirection: 'column', padding: 10 },
    buttonContainer: {
      flexDirection: 'row',
      padding: 10,
      width: '100%',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 20,
    },
    buttonLeft: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoButton: {
      height: 40,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      borderWidth: 0.6,
      borderColor: appcolor.primary,
    },
    photoButtonActive: { backgroundColor: appcolor.primary },
    photoButtonInactive: { backgroundColor: appcolor.light },
    photoIconContainer: {
      height: 35,
      width: 35,
      marginLeft: 2,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoIconContainerActive: { backgroundColor: appcolor.white },
    photoIconContainerInactive: { backgroundColor: appcolor.primary },
    photoButtonText: { fontWeight: '600', marginHorizontal: 8, fontSize: 14 },
    photoButtonTextActive: { color: appcolor.white },
    photoButtonTextInactive: { color: appcolor.primary },
    badgeContainer: { position: 'absolute', top: -10, right: -10 },
    badgeStyle: { width: 25, height: 25, borderRadius: 12.5 },
    badgeText: { fontSize: 12 },
    actionButton: {
      height: 35,
      width: 35,
      marginLeft: 2,
      borderRadius: 50,
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      justifyContent: 'center',
    },
    actionIcon: { color: appcolor.white },
    imageContainer: { margin: 7 },
    imageButton: {
      borderWidth: 0.5,
      borderColor: appcolor.dark,
      borderRadius: 12,
    },
    image: { width: '100%', minHeight: 230, borderRadius: 12 },
    fileContainer: {
      flexDirection: 'row',
      width: '100%',
      marginRight: 5,
      backgroundColor: appcolor.surface,
      padding: 4,
      borderRadius: 8,
    },
    fileIconContainer: {
      width: 50,
      height: 65,
      backgroundColor: appcolor.light,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileContent: { flex: 9.5 / 10 },
    fileTextContainer: { paddingLeft: 8, flex: 1, justifyContent: 'center' },
    fileName: { fontWeight: '500', fontSize: 15, color: appcolor.dark },
    fileInfo: {
      fontWeight: '300',
      fontSize: 12,
      color: appcolor.dark,
      fontStyle: 'italic',
    },
    noticeButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      margin: 12,
      borderRadius: 8,
      borderWidth: 0.6,
      padding: 8,
    },
    noticeText: {
      fontWeight: '600',
      fontSize: 16,
      paddingLeft: 10,
      color: appcolor.white,
    },
  });

  return (
    <View style={styles.container}>
      <HeaderCustom
        leftFunc={() => onGoBack()}
        title={route?.params?.menuitem?.menuNameVN || `Xin nghỉ việc`}
        iconRight={
          !isResigned
            ? 'cloud-upload-alt'
            : data.dataResigns?.confirm === 3
            ? 'trash'
            : null
        }
        rightFunc={() =>
          !isResigned
            ? uploadAction()
            : data.dataResigns?.confirm === 3
            ? deleteResign()
            : null
        }
      />

      {showProgress && (
        <LoadingView
          title={'Đang tải dữ liệu...'}
          isLoading={showProgress}
          styles={{ marginTop: 8 }}
        />
      )}
      {!showProgress && (
        <View style={{ flex: 1 }}>
          {isResigned && (
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <SpiralIcon
                  color={
                    data.dataResigns?.confirm == 1
                      ? appcolor.success
                      : data.dataResigns?.confirm == 0
                      ? appcolor.danger
                      : appcolor.warning
                  }
                  name={getConfirmIcon(data.dataResigns?.confirm)}
                  type="font-awesome"
                  size={20}
                  style={{ padding: 5 }}
                />
                <Text
                  style={[
                    styles.headerText,
                    {
                      color:
                        data.dataResigns?.confirm == 1
                          ? appcolor.success
                          : data.dataResigns?.confirm == 0
                          ? appcolor.danger
                          : appcolor.warning,
                    },
                  ]}
                >
                  {data.dataResigns?.confirmContent}
                </Text>
              </View>
              {data.dataResigns?.confirm == 0 && (
                <TouchableOpacity
                  onPress={() => handleResentResign()}
                  style={styles.headerRight}
                >
                  <Text
                    style={[
                      styles.headerLink,
                      {
                        color:
                          data.dataResigns?.confirm == 1
                            ? appcolor.success
                            : data.dataResigns?.confirm == 0
                            ? appcolor.danger
                            : appcolor.warning,
                      },
                    ]}
                  >
                    Gửi lại
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView
            style={{ height: '100%', width: '100%' }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={showProgress} onRefresh={loadData} />
            }
          >
            <View style={styles.contentContainer}>
              {data.dataReason?.length > 0 && (
                <TouchableOpacity
                  onPress={() => (!isResigned ? selectItem('REASON') : null)}
                >
                  <FormGroup
                    key={'selectReason'}
                    rightFunc={() =>
                      !isResigned ? selectItem('REASON') : null
                    }
                    iconRight={!isResigned ? 'caret-down' : null}
                    iconRightStyle={{ color: appcolor.primary }}
                    title={!isResigned ? 'Chọn lí do nghỉ việc' : 'Lí do'}
                    value={
                      selectReason?.name
                        ? `${selectReason?.groupName} : ${selectReason?.name}`
                        : '--Chọn--'
                    }
                    multiline={true}
                    useClearAndroid={false}
                  />
                </TouchableOpacity>
              )}
              <FormGroup
                key={'NoteDetail'}
                containerStyle={{
                  borderWidth: 0.5,
                  borderColor: '#bbb',
                  borderRadius: 10,
                }}
                iconRightStyle={{ color: appcolor.primary }}
                inputStyle={{ minHeight: 80, maxHeight: 250 }}
                multiline
                title={'Lí do Chi tiết'}
                placeholder={'Nhập lí do'}
                value={ortherReason || ''}
                handleChangeForm={setOrtherReason}
                onClearTextAndroid={setOrtherReason}
                placeholderTextColor={appcolor.greydark}
                editable={!isResigned}
              />
              {configResign?.contractNoticeDays > 0 &&
                alertResignDate?.length > 0 && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: appcolor.danger,
                      marginVertical: 8,
                      marginHorizontal: 4,
                    }}
                  >
                    Cảnh báo: {alertResignDate}
                  </Text>
                )}
              <TouchableOpacity
                onPress={() => (!isResigned ? selectItem('CALENDAR') : null)}
              >
                <FormGroup
                  key={'selectCalendar'}
                  rightFunc={() =>
                    !isResigned ? selectItem('CALENDAR') : null
                  }
                  iconRight={!isResigned ? 'caret-down' : null}
                  iconRightStyle={{ color: appcolor.primary }}
                  title={!isResigned ? 'Chọn ngày nghỉ' : 'Ngày nghỉ'}
                  value={moment(dateSelect.toString()).format('DD/MM/yyyy')}
                  useClearAndroid={false}
                />
              </TouchableOpacity>

              {isResigned &&
                data.dataResigns?.confirm !== 3 &&
                data.dataResigns?.confirmNote && (
                  <FormGroup
                    key={'SupConformNote'}
                    rightFunc={() =>
                      !isResigned ? selectItem('CALENDAR') : null
                    }
                    multiline={true}
                    iconRight={!isResigned ? 'caret-down' : null}
                    iconRightStyle={{ color: appcolor.primary }}
                    title={'Quản lí ghi chú'}
                    value={data.dataResigns?.confirmNote}
                    useClearAndroid={false}
                  />
                )}
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonLeft}>
                <TouchableOpacity
                  onPress={() => handleSelectMode('PHOTO')}
                  style={[
                    styles.photoButton,
                    {
                      backgroundColor:
                        modeEvident == 1 ? appcolor.primary : appcolor.light,
                    },
                  ]}
                >
                  <View
                    style={{
                      height: 35,
                      width: 35,
                      marginLeft: 2,
                      borderRadius: 50,
                      backgroundColor:
                        modeEvident == 1 ? appcolor.white : appcolor.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <SpiralIcon
                      color={
                        modeEvident == 1 ? appcolor.primary : appcolor.white
                      }
                      name="images"
                      type="font-awesome-5"
                      size={16}
                    />
                  </View>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 8,
                      fontSize: 14,
                      color:
                        modeEvident == 1 ? appcolor.white : appcolor.primary,
                    }}
                  >
                    Hình ảnh
                  </Text>
                  <Badge
                    value={
                      data.dataPhoto?.length > 0 ? data.dataPhoto.length : 0
                    }
                    textStyle={{ fontSize: 12 }}
                    badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                    containerStyle={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSelectMode('FILE')}
                  style={{
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                    backgroundColor:
                      modeEvident == 2 ? appcolor.primary : appcolor.light,
                    marginLeft: 8,
                    borderWidth: 0.6,
                    borderColor: appcolor.primary,
                  }}
                >
                  <View
                    style={{
                      height: 35,
                      width: 35,
                      marginLeft: 2,
                      borderRadius: 50,
                      backgroundColor:
                        modeEvident == 2 ? appcolor.white : appcolor.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <SpiralIcon
                      color={
                        modeEvident == 2 ? appcolor.primary : appcolor.white
                      }
                      name="file-pdf"
                      type="font-awesome-5"
                      size={16}
                    />
                  </View>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 8,
                      fontSize: 14,
                      color:
                        modeEvident == 2 ? appcolor.white : appcolor.primary,
                    }}
                  >
                    Tệp tin
                  </Text>
                  <Badge
                    value={Object.keys(data.dataFile).length > 0 ? 1 : 0}
                    textStyle={{ fontSize: 12 }}
                    badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                    containerStyle={{
                      position: 'absolute',
                      top: -8,
                      right: -15,
                    }}
                  />
                </TouchableOpacity>
              </View>

              {modeEvident == 1 && !isResigned && (
                <View style={styles.buttonLeft}>
                  <TouchableOpacity
                    onPress={() => takePhoto()}
                    style={styles.actionButton}
                  >
                    <SpiralIcon
                      color={appcolor.white}
                      name="camera"
                      type="font-awesome-5"
                      size={16}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => uploadFile()}
                    style={styles.actionButton}
                  >
                    <SpiralIcon
                      color={appcolor.white}
                      name="attach"
                      type="ionicon"
                      size={16}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {modeEvident == 2 && !isResigned && (
                <View style={styles.buttonLeft}>
                  <TouchableOpacity
                    onPress={() => uploadPdf()}
                    style={styles.actionButton}
                  >
                    <SpiralIcon
                      color={appcolor.white}
                      name="file-pdf"
                      type="font-awesome-5"
                      size={16}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {modeEvident == 1 && data.dataPhoto?.length > 0 && (
              <View style={styles.imageContainer}>
                {data.dataPhoto.map((it, index) => {
                  return (
                    <GmailStyleSwipeableRow
                      key={`photo_${index}`}
                      enableRight={isResigned}
                      deleteItem={() => deletePhoto(it)}
                    >
                      <TouchableOpacity
                        style={styles.imageButton}
                        onPress={() => {
                          setImageIndex(index), selectItem('IMAGE_ZOOM');
                        }}
                      >
                        <Image
                          source={
                            it.photoPath
                              ? {
                                  uri:
                                    isResigned &&
                                    it.photoPath.includes('uploaded')
                                      ? URLDEFAULT + it.photoPath
                                      : it.photoPath || '',
                                }
                              : require('../../Themes/Images/noimage.png')
                          }
                          style={styles.image}
                        />
                      </TouchableOpacity>
                    </GmailStyleSwipeableRow>
                  );
                })}
              </View>
            )}
            {modeEvident == 2 && Object.keys(data.dataFile).length > 0 && (
              <View>
                <GmailStyleSwipeableRow
                  key={'delete_file'}
                  enableRight={isResigned}
                  deleteItem={() => deleteFile()}
                >
                  <TouchableOpacity
                    key={'ItemDoc_Resign'}
                    style={styles.fileContainer}
                    onPress={() => selectItem('FILE')}
                  >
                    <View style={styles.fileIconContainer}>
                      <SpiralIcon
                        name="file-pdf"
                        type="font-awesome-5"
                        size={25}
                        color={'red'}
                      />
                    </View>
                    <View style={styles.fileContent}>
                      <View style={styles.fileTextContainer}>
                        <Text numberOfLines={2} style={styles.fileName}>
                          {data.dataFile?.name}
                        </Text>
                        <Text style={styles.fileInfo}>
                          {(data.dataFile?.size >= 1000000
                            ? (data.dataFile?.size / 1000000).toFixed(2) +
                              'MB, '
                            : (data.dataFile.size / 1000).toFixed(2) + 'KB, ') +
                            'PDF tài liệu'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </GmailStyleSwipeableRow>
              </View>
            )}
          </ScrollView>
          {!isResigned && configResign?.resignLetterSample && (
            <TouchableOpacity
              onPress={() =>
                handleSelectFile(configResign?.resignLetterSample || '')
              }
              style={styles.noticeButton}
            >
              <Text style={styles.noticeText}>Mẫu đơn nghỉ việc</Text>
            </TouchableOpacity>
          )}
          {isResigned &&
            configResign?.resignConfirmNote &&
            !configResign?.resignRegisterView && (
              <TouchableOpacity
                onPress={onShowNotice}
                style={styles.noticeButton}
              >
                <Text style={styles.noticeText}>Lưu ý sau khi nghỉ việc</Text>
              </TouchableOpacity>
            )}
        </View>
      )}
      <View>
        <ActionSheet
          id={'calendarSheet'}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            backgroundColor: appcolor.surface,
            paddingBottom: insets.bottom,
          }}
          closeOnPressBack={true}
          gestureEnabled={true}
          indicatorColor={appcolor.primary}
        >
          <View
            style={{
              height: deviceHeight / 2,
              marginTop: 10,
              marginBottom: 20,
              backgroundColor: appcolor.light,
              justifyContent: 'center',
              width: '100%',
              padding: 5,
            }}
          >
            <Calendar
              firstDay={1}
              current={moment(new Date()).format('yyyy-MM-DD')}
              minDate={
                configResign?.selectPastDate == 1
                  ? null
                  : moment(new Date()).format('yyyy-MM-DD')
              }
              monthFormat={'MM - yyyy'}
              hideExtraDays={true}
              theme={{
                backgroundColor: appcolor.light,
                calendarBackground: appcolor.surface,
                todayTextColor: appcolor.highlightDate,
                selectedDayTextColor: appcolor.white,
                dayTextColor: appcolor.dark,
                monthTextColor: appcolor.dark,
              }}
              markedDates={dataCalendar.markedDates}
              onDayPress={date => handlerSelectCalendar(date)}
            />
          </View>
        </ActionSheet>
        <ActionSheet
          id={'reasonSheet'}
          defaultOverlayOpacity={0.3}
          closeOnPressBack={true}
          indicatorColor={appcolor.primary}
          containerStyle={{
            backgroundColor: appcolor.surface,
            padding: 5,
            height: deviceHeight * 0.7,
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              padding: 8,
              marginBottom: 20,
              paddingTop: 20,
              backgroundColor: appcolor.surface,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {data.dataReason.map((it, idx) => {
                return (
                  <View key={`itemResigns_${idx}`} style={{ padding: 4 }}>
                    {it.isParent && (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: appcolor.transparent,
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      >
                        <SpiralIcon
                          name="tag"
                          color={appcolor.primary}
                          type={'font-awesome-5'}
                          size={16}
                          style={{ marginEnd: 8 }}
                        />
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: appcolor.primary,
                          }}
                        >
                          {it.groupName}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      key={'itemResigns_' + idx}
                      onPress={() => handleSelectReason(it)}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor:
                          selectReason?.id === it.id
                            ? appcolor.primary
                            : appcolor.light,
                        marginBottom: 4,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color:
                            selectReason?.id === it.id
                              ? appcolor.white
                              : appcolor.dark,
                        }}
                      >
                        {it.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ActionSheet>
        <ActionSheet
          id="imageSheet"
          containerStyle={{ paddingBottom: insets.bottom }}
        >
          <View style={{ height: deviceHeight, width: deviceWidth }}>
            <MultipleShowImage
              key={'ShowItemImage'}
              listItem={data.dataPhoto}
              closeShowImage={() => closeSheet('IMAGE_ZOOM')}
              indexItem={imageIndex}
            />
          </View>
        </ActionSheet>
        {isVisible && (
          <ModalNotify
            messager={messager}
            titleConfirm={'Đã đọc hiểu'}
            visible={isVisible}
            handleVisibleModal={handleVisibleModal}
            titleNotify={titleNotify}
            disableOK={disableOK}
            isUseHintArrow={true}
          />
        )}
      </View>
    </View>
  );
};
