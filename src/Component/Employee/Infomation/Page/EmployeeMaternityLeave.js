import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Calendar } from 'react-native-calendars';
import { Badge, CheckBox, Icon } from '@rneui/themed';
import FileViewer from 'react-native-file-viewer';

import { useSelector } from 'react-redux';
import RNFS from 'react-native-fs';
import {
  isCancel,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import {
  deleteItemPhotoByType,
  deleteItemPhotoDuplicate,
  getPhotoByType,
} from '../../../../Controller/DisplayController';
import {
  Employee,
  getProfileEmployee,
} from '../../../../Controller/EmployeeController';
import { GetByListCode } from '../../../../Controller/MasterController';
import {
  Message,
  MessageInfo,
  ToastError,
  UUIDGenerator,
  groupDataByKey,
} from '../../../../Core/Helper';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { LoadingView } from '../../../../Control/ItemLoading';
import GmailStyleSwipeableRow from '../../../../Core/GmailStyleSwipeableRow';
import { deviceHeight, deviceWidth } from '../../../Home';
import { ModalNotify } from '../../../../Control/ModalNotify';
import FormGroup from '../../../../Content/FormGroup';
import UploadController from '../../../../Controller/UploadController';
import { URLDEFAULT } from '../../../../Core/URLs';
import NativeCamera from '../../../../Control/NativeCamera';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import WebViewScreen from '../../../../Control/Webview/WebViewScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MATERNITY_PHOTO_TYPE = 'MATERNITY_LEAVE';
const DEFAULT_MATERNITY_OPTION = { birthTime: 1, childCount: 1 };
const PREGNANCY_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

const safeJsonParse = (value, fallback) => {
  try {
    if (value !== null && value !== undefined && typeof value !== 'string') {
      return value;
    }
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const EmployeeMaternityLeave = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataMaternityLeave: [],
    dataReason: [],
    dataPhoto: [],
    dataFile: {},
  });
  const [isMaternityLeave, setMaternityLeave] = useState(false);
  const [selectReason, setSelectReason] = useState({});
  const [ortherReason, setOrtherReason] = useState('');
  const [dateSelect, setDateSelect] = useState({
    fromDate: moment(new Date()).format('YYYYMMDD'),
    toDate: moment(new Date()).format('YYYYMMDD'),
  });
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
  const [typeDate, setTypeDate] = useState('fromDate');
  const [imageIndex, setImageIndex] = useState(0);
  const [showProgress, setProgress] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [modeEvident, setMode] = useState(0);
  const [isVisible, setVisible] = useState(false);
  const [messager, setMessager] = useState();
  const [maternityOption, setMaternityOption] = useState(
    DEFAULT_MATERNITY_OPTION,
  );
  const [isVisibleImage, setVisibleImage] = useState(false);
  const [pdfViewer, setPdfViewer] = useState({
    visible: false,
    url: '',
    title: 'Tệp tin',
  });
  const [isLockReason, setIsLockReason] = useState(false);
  const [configMaternity, setConfigMaternity] = useState({});
  const titleNotify = 'Lưu ý dành cho nhân viên nghỉ thai sản';

  const styles = StyleSheet.create({
    maternityOptionContainer: {
      borderWidth: 0.5,
      borderColor: '#bbb',
      borderRadius: 10,
      padding: 5,
      marginBottom: 8,
      backgroundColor: appcolor.light,
    },
    optionTitle: {
      color: appcolor.dark,
      fontSize: 13,
      padding: 5,
      fontWeight: '700',
    },
    optionText: { fontWeight: '500', color: appcolor.dark },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    checkboxContainer: {
      padding: 0,
      margin: 0,
      borderWidth: 0,
      backgroundColor: appcolor.transparent,
    },
    monthInfo: {
      color: appcolor.primary,
      fontSize: 12,
      paddingHorizontal: 5,
      paddingBottom: 4,
      fontWeight: '500',
    },
    optionItem: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: appcolor.light,
      marginBottom: 6,
    },
  });

  const getDefaultDateSelect = () => {
    const today = moment().format('YYYYMMDD');
    return { fromDate: today, toDate: today };
  };

  const getDefaultCalendar = (date = moment().format('YYYYMMDD')) => {
    const dateKey = moment(date, 'YYYYMMDD').format('YYYY-MM-DD');
    const selectedDate = {
      [dateKey]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    };
    return {
      markedDatesDefault: selectedDate,
      markedDates: selectedDate,
      reportDate: '',
    };
  };

  const getDefaultReason = (config = configMaternity) => {
    const defaultReason = safeJsonParse(config.reasonMaternityDefault) || [];
    return defaultReason.length > 0 ? defaultReason[0] : {};
  };

  const checkMonths = (endDate, selectDate) => {
    const end = new Date(endDate);
    const select = new Date(selectDate);
    // So sánh endDate với ngày sau 6 tháng
    return end < select;
  };

  const getMaternityMonthLimit = (
    option = maternityOption,
    config = configMaternity,
  ) => {
    const baseMonth = config?.maxMonthMaternity || config?.maxMonthResign || 6;
    const birthTime = parseInt(option.birthTime || 1, 10);
    const childCount = parseInt(option.childCount || 1, 10);
    return baseMonth + (birthTime === 2 ? 1 : 0) + (childCount >= 2 ? 1 : 0);
  };

  const normalizeNumberInRange = (value, min, max) => {
    const numberValue = parseInt(value, 10);
    if (Number.isNaN(numberValue)) {
      return '';
    }
    return Math.min(Math.max(numberValue, min), max);
  };

  const toDateByMonth = (
    dateString,
    option = maternityOption,
    config = configMaternity,
  ) => {
    const fromDate = new Date(dateString);
    const monthsLater = new Date(fromDate);
    monthsLater.setMonth(
      monthsLater.getMonth() + getMaternityMonthLimit(option, config),
    );
    return moment(monthsLater).subtract(1, 'days').format('YYYY-MM-DD');
  };

  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    const todate = toDateByMonth(
      typeDate == 'fromDate'
        ? dateString
        : moment(dateSelect.fromDate, 'YYYYMMDD').format('YYYY-MM-DD'),
    );
    if (typeDate == 'toDate') {
      const result = checkMonths(todate, dateString);
      if (result) {
        ToastError(
          `Ngày đi làm lại phải nằm trong vòng ${getMaternityMonthLimit()} tháng kể từ ngày nghỉ!`,
          'Thông báo',
          'top',
        );
        return;
      }
    }

    if (dateString !== null && dateString !== undefined) {
      const markedDates = {};
      markedDates[dateString] = {
        selected: true,
        selectedColor: appcolor.primary,
        textColor: appcolor.white,
      };
      setDataCalendar({
        ...dataCalendar,
        markedDates: markedDates,
      });
      const nextDateSelect = {
        ...dateSelect,
        [typeDate]: moment(dateString, 'YYYY-MM-DD').format('YYYYMMDD'),
      };
      if (typeDate == 'fromDate') {
        nextDateSelect.toDate = moment(todate, 'YYYY-MM-DD').format('YYYYMMDD');
      }
      setDateSelect(nextDateSelect);
    } else {
      setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
      });
      setDateSelect({ ...dateSelect, [typeDate]: dateString });
    }
  };

  const loadData = async (config = configMaternity) => {
    setProgress(true);
    try {
      await deleteItemPhotoByType(MATERNITY_PHOTO_TYPE);

      const dataMaternityLeave = await Employee.getMaternityInfo(
        'EmployeeMaternity',
      );
      const listReason = await GetByListCode(`'DetailReasonResign'`);
      const { arr } = groupDataByKey({
        arr: listReason,
        key: 'groupId',
      });

      if (dataMaternityLeave.statusId === 200) {
        if (
          dataMaternityLeave?.data?.length > 0 &&
          dataMaternityLeave?.data[0]?.isDelete !== 1
        ) {
          const maternityInfo = dataMaternityLeave.data[0];
          const listPhoto = safeJsonParse(maternityInfo?.photo, []).map(it => ({
            photoPath: it.photo,
          }));
          const fileMaternity = safeJsonParse(maternityInfo?.resignFile, {});
          const itemReason = arr.find(it => it.id == maternityInfo?.reasonId);
          const birthTime = normalizeNumberInRange(
            maternityInfo?.birthTime || maternityInfo?.maternityBirthTime || 1,
            1,
            10,
          );
          const childCount = normalizeNumberInRange(
            maternityInfo?.childCount ||
              maternityInfo?.maternityChildCount ||
              1,
            1,
            2,
          );

          setMaternityLeave(true);
          setIsLockReason(config.isLockReason === 1);
          setMaternityOption({
            birthTime: birthTime || 1,
            childCount: childCount || 1,
          });
          setOrtherReason(maternityInfo?.notes);
          setSelectReason(itemReason);
          setDateSelect({
            fromDate: maternityInfo?.fromDate,
            toDate: maternityInfo?.toDate || maternityInfo?.fromDate,
          });
          setData({
            dataMaternityLeave: maternityInfo || [],
            dataReason: arr,
            dataPhoto: listPhoto,
            dataFile: fileMaternity,
          });
        } else {
          setIsLockReason(config.isLockReason === 1);
          setSelectReason(getDefaultReason(config));
          setData(current => ({ ...current, dataReason: arr }));
        }
      } else {
        ToastError('Lỗi kết nối');
      }
    } catch (error) {
      ToastError('Lỗi kết nối');
    } finally {
      setProgress(false);
    }
  };
  const loadDataConfig = async () => {
    try {
      const dataConfig = await Employee.getMaternityInfo('ConfigMaternity');
      const dataConfigMaternity = dataConfig?.data?.[0] || {};
      const config =
        safeJsonParse(dataConfigMaternity?.configMaternity, [])?.[0] || {};
      setConfigMaternity(config);
      return config;
    } catch (error) {
      setConfigMaternity({});
      return {};
    }
  };
  useEffect(() => {
    const init = async () => {
      const config = await loadDataConfig();
      await loadData(config);
    };
    init();
  }, []);

  const takePhoto = async () => {
    const guiIdPhoto = UUIDGenerator();
    let photoinfo = {};
    photoinfo = {
      photoType: MATERNITY_PHOTO_TYPE,
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
  };
  const reloadpage = async () => {
    const itemPhotoByGuiId = await getPhotoByType(MATERNITY_PHOTO_TYPE);
    setData(current => ({ ...current, dataPhoto: itemPhotoByGuiId }));
  };
  const uploadFile = async () => {
    const guiIdPhoto = UUIDGenerator();
    const photoinfo = {
      photoType: MATERNITY_PHOTO_TYPE,
      dataUpload: 0,
      fileUpload: 0,
      shopId: 0,
      photoPath: null,
      guiId: guiIdPhoto,
      guid: guiIdPhoto,
      photoDate: moment(new Date()).format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    const options = {
      mediaType: 'photo',
      maxWidth: 1336,
      maxHeight: 1336,
      quality: 1,
      includeBase64: true,
      selectionLimit: 0,
    };

    await NativeCamera.imageGalleryLaunch(photoinfo, reloadpage, options);
  };
  const getFileUrl = uri => {
    return uri?.includes('https') ? uri : `${URLDEFAULT}${uri}`;
  };
  const getPdfViewerUrl = url => {
    return Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
          url,
        )}`
      : url;
  };
  const openPdfViewer = (url, title = 'Tệp tin') => {
    setPdfViewer({ visible: true, url: getPdfViewerUrl(url), title });
  };
  const openFileSample = pathFile => {
    FileViewer.open(pathFile || '', {
      showOpenWithDialog: true,
      showAppsSuggestions: false,
      onDismiss: () => console.log(pathFile),
    }).catch(err => {
      console.log('Lỗi mở file:', err);
      MessageInfo('Không thể mở tệp tin, vui lòng kiểm tra lại file trên máy!');
    });
  };
  const handleSelectFile = async (
    uri,
    title = data.dataFile?.name || 'Tệp tin',
  ) => {
    if (!uri) {
      MessageInfo('Không tìm thấy tệp tin!');
      return;
    }
    if (!uri?.startsWith('file://')) {
      openPdfViewer(getFileUrl(uri), title);
      return;
    }
    if (uri?.startsWith('file://')) {
      const localPath = uri.replace('file://', '');
      const exists = await RNFS.exists(localPath);
      if (exists) {
        openFileSample(localPath);
        return;
      }
      MessageInfo('Không tìm thấy tệp tin!');
    }
  };

  const uploadPdf = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      const [response] = await pick({
        presentationStyle: 'pageSheet',
        type: types.pdf,
      });
      if (!response) {
        return;
      }
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

      const [copyResult] = await keepLocalCopy({
        files: [
          {
            uri: response.uri,
            type: response.type,
            fileName: response.name || 'maternity.pdf',
          },
        ],
        destination: 'documentDirectory',
      });
      const fileUpload = {
        ...response,
        uri: copyResult?.localUri || response.uri,
      };
      await UploadController.uploadFilePDF(
        [fileUpload],
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        async result => {
          let dataFile = {};
          const itemResult = result.find(it => it.fileUri === fileUpload.uri);
          if (itemResult?.filePath !== undefined) {
            dataFile = {
              filePath: itemResult.filePath,
              name: fileUpload.name,
              uri: fileUpload.uri,
              size: fileUpload.size,
            };
          }
          setData(current => ({ ...current, dataFile: dataFile }));
        },
        () => {
          MessageInfo(
            'Lỗi khi gửi tệp tin lên hệ thống, vui lòng thử lại sau!',
          );
        },
        'maternity',
      );
    } catch (err) {
      if (!isCancel(err)) {
        console.log('upload pdf error', err);
        MessageInfo('Lỗi khi thực hiện gửi tệp tin, vui lòng thử lại sau!');
      }
    }
  };

  const handleSelectMode = type => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (type === 'PHOTO') {
      setMode(modeEvident === 1 ? 0 : 1);
    } else if (type === 'FILE') {
      setMode(modeEvident === 2 ? 0 : 2);
    }
  };

  const uploadAction = async () => {
    if (isSubmitting) {
      ToastError('Đang gửi dữ liệu, vui lòng chờ!', 'Thông báo', 'top');
      return;
    }

    const birthTime = parseInt(maternityOption.birthTime, 10);
    const childCount = parseInt(maternityOption.childCount, 10);
    if (Number.isNaN(birthTime) || birthTime < 1 || birthTime > 10) {
      ToastError('Số lần mang thai phải từ 1 đến 10!', 'Thông báo', 'top');
      return;
    }
    if (Number.isNaN(childCount) || childCount < 1 || childCount > 2) {
      ToastError(
        'Bạn chưa chọn thông tin sinh từ 2 con trở lên!',
        'Thông báo',
        'top',
      );
      return;
    }
    if (Object.keys(selectReason).length === 0) {
      ToastError('Bạn chưa chọn lí do xin nghỉ!!!', 'Thông báo', 'top');
      return;
    }
    // if (selectReason.id === 100 || data.dataReason?.length == 0) {
    if (ortherReason === '') {
      ToastError('Bạn chưa nhập lí do chi tiết!!!', 'Thông báo', 'top');
      return;
    }
    if (ortherReason.length > 0 && ortherReason.length < 5) {
      ToastError(
        'Bạn nhập lí do chi tiết quá ngắn, tối thiểu 5 kí tự!!!',
        'Thông báo',
        'top',
      );
      return;
    }
    // }

    const currentDate = moment(new Date()).format('YYYYMMDD');
    const maternityFromDate = moment(dateSelect.fromDate.toString()).format(
      'YYYYMMDD',
    );
    const maternityToDate = moment(dateSelect.toDate.toString()).format(
      'YYYYMMDD',
    );
    const selectPastDate = configMaternity?.selectPastDate || 0;

    if (maternityFromDate <= currentDate && selectPastDate !== 1) {
      ToastError('Ngày nghỉ phải lớn hơn ngày hiện tại', 'Thông báo', 'top');
      return;
    }

    const countDayMaternity = moment(maternityFromDate, 'YYYYMMDD').diff(
      moment(currentDate, 'YYYYMMDD'),
      'days',
    );
    const minDateMaternity =
      configMaternity?.minDateMaternity || configMaternity?.minDateResign || 0;
    if (countDayMaternity <= minDateMaternity && minDateMaternity !== 0) {
      ToastError(
        `Ngày nghỉ phải sau ${minDateMaternity} ngày so với ngày hiện tại!`,
        'Thông báo',
        'top',
      );
      return;
    }

    if (currentDate === maternityToDate) {
      ToastError(`Bạn chưa chọn ngày đi làm lại!`, 'Thông báo', 'top');
      return;
    }
    if (dateSelect.fromDate >= maternityToDate) {
      ToastError(
        `Bạn ngày đi làm lại phải lớn hơn ngày nghỉ!`,
        'Thông báo',
        'top',
      );
      return;
    }
    const toDate = toDateByMonth(
      moment(dateSelect.fromDate, 'YYYYMMDD').format('YYYY-MM-DD'),
    );
    const isOverMaternityLimit = checkMonths(
      toDate,
      moment(maternityToDate, 'YYYYMMDD').format('YYYY-MM-DD'),
    );
    if (isOverMaternityLimit) {
      ToastError(
        `Ngày đi làm lại phải nằm trong vòng ${getMaternityMonthLimit()} tháng kể từ ngày nghỉ!`,
        'Thông báo',
        'top',
      );
      return;
    }

    setSubmitting(true);
    try {
      const profileEmployee = await getProfileEmployee(userinfo.employeeId);
      const dataProfile = profileEmployee?.table1?.[0];
      if (
        dataProfile?.workingStatusId !== 1 &&
        configMaternity?.isCheckFile === 1
      ) {
        if (
          (data?.dataPhoto === undefined || data?.dataPhoto?.length === 0) &&
          Object.keys(data.dataFile).length === 0
        ) {
          ToastError(
            'Bạn chưa chụp hình/chọn file PDF đơn xin nghỉ thai sản!!!',
          );
          setSubmitting(false);
          return;
        }
      }

      let dataPhoto = [];
      // const notifyContent = `Nhân viên ${route?.params?.employeeInfo?.employeeName || ''} đã gửi yêu cầu xin nghỉ thai sản vào ${moment(new Date()).format('YYYY-MM-DD')}.`
      const notifyContent =
        'Nhân viên ' +
        (route?.params?.employeeInfo?.employeeName || '') +
        ' đã gửi yêu cầu xin nghỉ thai sản vào ' +
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
        employeeId:
          route?.params?.employeeInfo?.employeeId || userinfo.employeeId,
        workingStatus: 4,
        fromDate: maternityFromDate,
        toDate: maternityToDate,
        notes: ortherReason || '',
        reasonId: selectReason.id,
        photo: JSON.stringify(dataPhoto),
        resignFile: JSON.stringify(data.dataFile || {}),
        birthTime: birthTime,
        childCount: childCount,
        maternityBirthTime: birthTime,
        maternityChildCount: childCount,
        confirm: 3,
        notifyContent: notifyContent,
      };
      await UploadController.PostFile();
      Message(
        'Chú ý',
        `Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?`,
        async () => {
          try {
            const notifyNote = 'SEND';
            const group =
              route?.params?.employeeInfo?.groupType || userinfo.groupType;
            const sendResult = await Employee.sendEmployeeMaternity(
              JSON.stringify(dataUpload),
              dataPhoto,
              notifyNote,
              group,
              null,
            );
            if (
              sendResult?.statusId === 200 ||
              (sendResult?.statusId === 500 &&
                sendResult?.messager?.includes('mail'))
            ) {
              setData(current => ({
                ...current,
                dataMaternityLeave:
                  sendResult?.data?.[0] || current.dataMaternityLeave,
              }));
              setMaternityLeave(true);
              if (sendResult.statusId === 500) {
                ToastError(sendResult.messager);
              }
            } else {
              ToastError(sendResult?.messager || 'Lỗi kết nối!');
            }
          } catch (error) {
            ToastError('Lỗi kết nối!');
          } finally {
            setSubmitting(false);
          }
        },
        () => setSubmitting(false),
      );
    } catch (error) {
      setSubmitting(false);
      ToastError('Lỗi kết nối!');
    }
  };

  const selectItem = (type, typeDateSelect) => {
    if (type === 'CALENDAR') {
      SheetManager.show('calendarSheet', { payload: typeDateSelect });
    } else if (type === 'REASON') {
      !isLockReason && SheetManager.show('reasonSheet');
    } else if (type === 'PREGNANCY') {
      SheetManager.show('pregnancySheet');
    } else if (type === 'IMAGE_ZOOM') {
      setVisibleImage(true);
    } else if (type == 'FILE') {
      handleSelectFile(data.dataFile?.filePath || data.dataFile?.uri);
    }
  };

  const closeSheet = type => {
    if (type === 'CALENDAR') {
      SheetManager.hide('calendarSheet');
    } else if (type === 'REASON') {
      SheetManager.hide('reasonSheet');
    } else if (type === 'PREGNANCY') {
      SheetManager.hide('pregnancySheet');
    } else if (type === 'IMAGE_ZOOM') {
      setVisibleImage(false);
    }
  };
  const handleSelectReason = item => {
    setSelectReason(item);
  };
  const deletePhoto = async it => {
    deleteItemPhotoDuplicate(it);
    setData(current => ({
      ...current,
      dataPhoto: current.dataPhoto.filter(item => item.id !== it.id),
    }));
  };
  const deleteFile = async () => {
    setData(current => ({ ...current, dataFile: {} }));
  };

  const onGoBack = async () => {
    if (!isMaternityLeave) {
      data.dataPhoto.forEach(it => {
        deleteItemPhotoDuplicate(it);
      });
    }
    navigation.goBack();
  };

  const handleResentMaternity = async () => {
    setData({ ...data, dataMaternityLeave: [], dataPhoto: [] });
    setSelectReason(getDefaultReason());
    setOrtherReason('');
    setDateSelect(getDefaultDateSelect());
    setDataCalendar(getDefaultCalendar());
    setMaternityOption(DEFAULT_MATERNITY_OPTION);
    setIsLockReason(configMaternity?.isLockReason === 1);
    setMaternityLeave(false);
  };
  const deleteMaternity = async () => {
    if (isSubmitting) {
      return;
    }
    Message('Chú ý', `Bạn có chắc chắn muốn huỷ yêu cầu?`, async () => {
      setSubmitting(true);
      try {
        const notifyContent =
          'Nhân viên ' +
          (userinfo.employeeName || '') +
          ' đã huỷ yêu cầu xin nghỉ thai sản vào ' +
          moment(new Date()).format('YYYY-MM-DD HH:mm') +
          '.';
        const dataUpload = {
          ...data.dataMaternityLeave,
          isDelete: 1,
          notifyContent: notifyContent,
        };
        const notifyNote = 'DELETE';
        const group =
          route?.params?.employeeInfo?.groupType || userinfo.groupType;
        const result = await Employee.sendEmployeeMaternity(
          JSON.stringify(dataUpload),
          null,
          notifyNote,
          group,
          null,
        );
        if (
          result?.statusId === 200 ||
          (result?.statusId === 500 && result?.messager?.includes('mail'))
        ) {
          setData({
            ...data,
            dataMaternityLeave: [],
            dataPhoto: [],
            dataFile: {},
          });
          setSelectReason(getDefaultReason());
          setOrtherReason('');
          setDateSelect(getDefaultDateSelect());
          setDataCalendar(getDefaultCalendar());
          setMaternityOption(DEFAULT_MATERNITY_OPTION);
          data.dataPhoto.forEach(it => {
            deleteItemPhotoDuplicate(it);
          });
          setMaternityLeave(false);
        } else {
          ToastError('Lỗi kết nối!');
        }
      } catch (error) {
        ToastError('Lỗi kết nối!');
      } finally {
        setSubmitting(false);
      }
    });
  };

  const onViewNoteMaternity = maternityConfirmNote => {
    setMessager(
      <View style={{ height: deviceHeight * 0.4 }}>
        <ScrollView style={{ width: deviceWidth * 0.8, marginBottom: 10 }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}
            >
              {maternityConfirmNote}
            </Text>
          </View>
        </ScrollView>
      </View>,
    );
    handleVisibleModal(true);
  };

  const handleVisibleModal = visible => {
    setVisible(visible);
  };
  const handleBeforeCalendar = dateType => {
    setTypeDate(dateType);
    setDataCalendar(
      getDefaultCalendar(dateSelect[dateType] || moment().format('YYYYMMDD')),
    );
  };
  const updateMaternityOption = nextOption => {
    setMaternityOption(nextOption);
    if (
      !isMaternityLeave &&
      nextOption.birthTime !== '' &&
      dateSelect.fromDate
    ) {
      setDateSelect({
        ...dateSelect,
        toDate: moment(
          toDateByMonth(
            moment(dateSelect.fromDate, 'YYYYMMDD').format('YYYY-MM-DD'),
            nextOption,
          ),
          'YYYY-MM-DD',
        ).format('YYYYMMDD'),
      });
    }
  };
  const handleChangeBirthTime = birthTime => {
    updateMaternityOption({ ...maternityOption, birthTime });
    closeSheet('PREGNANCY');
  };
  const handleChangeChildCount = () => {
    const childCount =
      parseInt(maternityOption.childCount || 1, 10) >= 2 ? 1 : 2;
    updateMaternityOption({ ...maternityOption, childCount });
  };
  const renderChildCountOption = () => (
    <CheckBox
      title={'Sinh từ 2 con trở lên'}
      checked={parseInt(maternityOption.childCount || 1, 10) >= 2}
      onPress={() => (!isMaternityLeave ? handleChangeChildCount() : null)}
      disabled={isMaternityLeave}
      checkedColor={appcolor.primary}
      uncheckedColor={appcolor.grayLight}
      containerStyle={styles.checkboxContainer}
      textStyle={styles.optionText}
      iconType="material-community"
      checkedIcon="checkbox-marked"
      uncheckedIcon="checkbox-blank-outline"
      size={20}
    />
  );
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        leftFunc={() => onGoBack()}
        title={route?.params?.menuitem?.menuNameVN || `Xin nghỉ thai sản`}
        iconRight={
          !isMaternityLeave
            ? 'cloud-upload-alt'
            : data.dataMaternityLeave.confirm === 3
            ? 'trash'
            : null
        }
        rightFunc={() =>
          !isMaternityLeave
            ? uploadAction()
            : data.dataMaternityLeave.confirm === 3
            ? deleteMaternity()
            : null
        }
        disabled={isSubmitting}
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
          {isMaternityLeave && (
            <View
              style={{
                padding: 10,
                width: deviceWidth,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  color={
                    data.dataMaternityLeave?.confirm == 1
                      ? appcolor.success
                      : data.dataMaternityLeave?.confirm == 0
                      ? appcolor.danger
                      : appcolor.warning
                  }
                  name={'check'}
                  type="font-awesome"
                  size={20}
                  style={{ padding: 5 }}
                />
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 16,
                    paddingLeft: 10,
                    color:
                      data.dataMaternityLeave?.confirm == 1
                        ? appcolor.success
                        : data.dataMaternityLeave?.confirm == 0
                        ? appcolor.danger
                        : appcolor.warning,
                  }}
                >
                  {data.dataMaternityLeave?.confirmContent}
                </Text>
              </View>
              {data.dataMaternityLeave?.confirm == 0 && (
                <TouchableOpacity
                  onPress={() => handleResentMaternity()}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '600',
                      textDecorationLine: 'underline',
                      fontSize: 16,
                      paddingLeft: 10,
                      color:
                        data.dataMaternityLeave?.confirm == 1
                          ? appcolor.success
                          : data.dataMaternityLeave?.confirm == 0
                          ? appcolor.danger
                          : appcolor.warning,
                    }}
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
              <RefreshControl
                refreshing={showProgress}
                onRefresh={() => loadData()}
              />
            }
          >
            <View style={{ flexDirection: 'column', padding: 10 }}>
              {data.dataReason?.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    !isMaternityLeave ? selectItem('REASON') : null
                  }
                >
                  <FormGroup
                    key={'selectReason'}
                    rightFunc={() =>
                      !isMaternityLeave ? selectItem('REASON') : null
                    }
                    iconRight={!isMaternityLeave ? 'caret-down' : null}
                    iconRightStyle={{ color: appcolor.primary }}
                    title={!isMaternityLeave ? 'Chọn lí do xin nghỉ' : 'Lí do'}
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
                containerStyle={{
                  borderWidth: 0.5,
                  borderColor: '#bbb',
                  borderRadius: 10,
                }}
                iconRightStyle={{ color: appcolor.primary }}
                inputStyle={{ height: 80, maxHeight: 120 }}
                multiline
                title={'Lí do Chi tiết'}
                placeholder={'Nhập lí do'}
                value={ortherReason || ''}
                handleChangeForm={setOrtherReason}
                onClearTextAndroid={setOrtherReason}
                placeholderTextColor={appcolor.greydark}
                editable={!isMaternityLeave}
              />
              <TouchableOpacity
                onPress={() =>
                  !isMaternityLeave ? selectItem('PREGNANCY') : null
                }
              >
                <FormGroup
                  rightFunc={() =>
                    !isMaternityLeave ? selectItem('PREGNANCY') : null
                  }
                  iconRight={!isMaternityLeave ? 'caret-down' : null}
                  iconRightStyle={{ color: appcolor.primary }}
                  title={'Lần mang thai'}
                  value={
                    maternityOption.birthTime
                      ? `Lần ${maternityOption.birthTime}`
                      : '--Chọn--'
                  }
                  useClearAndroid={false}
                />
              </TouchableOpacity>
              <View style={styles.maternityOptionContainer}>
                <Text style={styles.optionTitle}>Thông tin sinh con</Text>
                <View style={styles.optionRow}>{renderChildCountOption()}</View>
                <Text style={styles.monthInfo}>
                  Thời gian nghỉ tối đa: {getMaternityMonthLimit()} tháng
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  !isMaternityLeave ? selectItem('CALENDAR', 'fromDate') : null
                }
              >
                <FormGroup
                  key={'selectCalendar'}
                  rightFunc={() =>
                    !isMaternityLeave
                      ? selectItem('CALENDAR', 'fromDate')
                      : null
                  }
                  iconRight={!isMaternityLeave ? 'caret-down' : null}
                  iconRightStyle={{ color: appcolor.primary }}
                  title={
                    !isMaternityLeave ? 'Chọn ngày bắt đầu nghỉ' : 'Từ ngày'
                  }
                  value={moment(dateSelect.fromDate.toString()).format(
                    'DD/MM/yyyy',
                  )}
                  useClearAndroid={false}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  !isMaternityLeave ? selectItem('CALENDAR', 'toDate') : null
                }
              >
                <FormGroup
                  key={'selectCalendar'}
                  rightFunc={() =>
                    !isMaternityLeave ? selectItem('CALENDAR', 'toDate') : null
                  }
                  iconRight={!isMaternityLeave ? 'caret-down' : null}
                  iconRightStyle={{ color: appcolor.primary }}
                  title={
                    !isMaternityLeave
                      ? 'Chọn Ngày kết thúc kỳ thai sản'
                      : 'đến ngày'
                  }
                  value={moment(dateSelect.toDate?.toString()).format(
                    'DD/MM/yyyy',
                  )}
                  useClearAndroid={false}
                />
              </TouchableOpacity>

              {isMaternityLeave && data.dataMaternityLeave.confirm !== 3 && (
                <FormGroup
                  key={'SupConformNote'}
                  multiline={true}
                  iconRightStyle={{ color: appcolor.primary }}
                  title={'Quản lí ghi chú'}
                  value={data.dataMaternityLeave.confirmNote}
                  useClearAndroid={false}
                />
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                padding: 10,
                width: '100%',
                justifyContent: 'space-between',
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelectMode('PHOTO')}
                  style={{
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                    backgroundColor:
                      modeEvident == 1 ? appcolor.primary : appcolor.light,
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

              {modeEvident == 1 && !isMaternityLeave && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => takePhoto()}
                    style={{
                      height: 35,
                      width: 35,
                      marginLeft: 2,
                      borderRadius: 50,
                      alignItems: 'center',
                      backgroundColor: appcolor.primary,
                      justifyContent: 'center',
                    }}
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
                    style={{
                      height: 35,
                      width: 35,
                      marginLeft: 2,
                      borderRadius: 50,
                      backgroundColor: appcolor.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
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
              {modeEvident == 2 && !isMaternityLeave && (
                <View
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <TouchableOpacity
                    onPress={() => uploadPdf()}
                    style={{
                      height: 35,
                      width: 35,
                      marginLeft: 2,
                      borderRadius: 50,
                      alignItems: 'center',
                      backgroundColor: appcolor.primary,
                      justifyContent: 'center',
                    }}
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
              <View style={{ margin: 7 }}>
                {data.dataPhoto.map((it, index) => {
                  return (
                    <GmailStyleSwipeableRow
                      key={'delete_' + index}
                      enableRight={isMaternityLeave}
                      deleteItem={() => deletePhoto(it)}
                    >
                      <TouchableOpacity
                        style={{
                          borderWidth: 0.5,
                          borderColor: appcolor.dark,
                          borderRadius: 12,
                        }}
                        key={index}
                        onPress={() => {
                          setImageIndex(index);
                          selectItem('IMAGE_ZOOM');
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              isMaternityLeave &&
                              it.photoPath.includes('uploaded')
                                ? URLDEFAULT + it.photoPath
                                : it.photoPath || '',
                          }}
                          style={{
                            width: '100%',
                            minHeight: 230,
                            borderRadius: 12,
                          }}
                        />
                      </TouchableOpacity>
                    </GmailStyleSwipeableRow>
                  );
                })}
              </View>
            )}
            {modeEvident == 2 && Object.keys(data.dataFile).length > 0 && (
              <View style={{}}>
                <GmailStyleSwipeableRow
                  key={'delete_file'}
                  enableRight={isMaternityLeave}
                  deleteItem={() => deleteFile()}
                >
                  <TouchableOpacity
                    key={'ItemDoc_Maternity'}
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      marginRight: 5,
                      backgroundColor: appcolor.surface,
                      padding: 4,
                      borderRadius: 8,
                    }}
                    onPress={() => selectItem('FILE')}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 65,
                        backgroundColor: appcolor.light,
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <SpiralIcon
                        name="file-pdf"
                        type="font-awesome-5"
                        size={25}
                        color={'red'}
                      />
                    </View>
                    <View style={{ flex: 9.5 / 10 }}>
                      <View
                        style={{
                          paddingLeft: 8,
                          flex: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          style={{
                            fontWeight: '500',
                            fontSize: 15,
                            color: appcolor.dark,
                          }}
                        >
                          {data.dataFile?.name}
                        </Text>
                        <Text
                          style={{
                            fontWeight: '300',
                            fontSize: 12,
                            color: appcolor.dark,
                            fontStyle: 'italic',
                          }}
                        >
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
          {!isMaternityLeave && configMaternity?.maternityLetterSample && (
            <TouchableOpacity
              onPress={() =>
                handleSelectFile(
                  configMaternity?.maternityLetterSample,
                  'Mẫu đơn xin nghỉ',
                )
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appcolor.primary,
                margin: 12,
                borderRadius: 8,
                borderWidth: 0.6,
                padding: 8,
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  paddingLeft: 10,
                  color: appcolor.white,
                }}
              >
                Mẫu đơn xin nghỉ
              </Text>
            </TouchableOpacity>
          )}
          {isMaternityLeave && configMaternity?.maternityConfirmNote && (
            <TouchableOpacity
              onPress={() =>
                onViewNoteMaternity(configMaternity?.maternityConfirmNote)
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: appcolor.primary,
                margin: 12,
                borderRadius: 8,
                borderWidth: 0.6,
                padding: 8,
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  paddingLeft: 10,
                  color: appcolor.white,
                }}
              >
                Lưu ý sau khi xin nghỉ
              </Text>
            </TouchableOpacity>
          )}

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
            onBeforeShow={handleBeforeCalendar}
          >
            <View
              style={{
                height: deviceHeight / 2,
                marginTop: 10,
                marginBottom: 20,
                backgroundColor: appcolor.surface,
                width: '100%',
                padding: 5,
              }}
            >
              <Calendar
                firstDay={1}
                current={moment(
                  dateSelect[typeDate] || new Date(),
                  'YYYYMMDD',
                ).format('yyyy-MM-DD')}
                minDate={
                  configMaternity?.selectPastDate
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
            // gestureEnabled={true}
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
                    <View key={`reasonMaternity_${idx}`} style={{ padding: 4 }}>
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
                        key={'itemMaternitys_' + idx}
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
            id={'pregnancySheet'}
            defaultOverlayOpacity={0.3}
            closeOnPressBack={true}
            indicatorColor={appcolor.primary}
            containerStyle={{
              backgroundColor: appcolor.surface,
              padding: 5,
              height: deviceHeight * 0.45,
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
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: appcolor.primary,
                  padding: 8,
                }}
              >
                Chọn lần mang thai
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {PREGNANCY_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={`pregnancy_${item}`}
                    onPress={() => handleChangeBirthTime(item)}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          maternityOption.birthTime === item
                            ? appcolor.primary
                            : appcolor.light,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color:
                          maternityOption.birthTime === item
                            ? appcolor.white
                            : appcolor.dark,
                      }}
                    >
                      Lần {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ActionSheet>
          <ViewPictures
            visible={isVisibleImage}
            images={data.dataPhoto}
            initialIndex={imageIndex}
            onSwipeDown={() => closeSheet('IMAGE_ZOOM')}
          />
          <Modal
            visible={pdfViewer.visible}
            animationType="slide"
            onRequestClose={() =>
              setPdfViewer({ ...pdfViewer, visible: false })
            }
          >
            <WebViewScreen
              pageName={pdfViewer.title}
              urlPage={pdfViewer.url}
              onClose={() => setPdfViewer({ ...pdfViewer, visible: false })}
              isConfirmExits={false}
            />
          </Modal>
          {isVisible && (
            <ModalNotify
              messager={messager}
              visible={isVisible}
              handleVisibleModal={handleVisibleModal}
              titleNotify={titleNotify}
            />
          )}
        </View>
      )}
    </View>
  );
};
