import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import FormGroup from '../../../../Content/FormGroup';
import { LoadingView } from '../../../../Control/ItemLoading';
import NativeCamera from '../../../../Control/NativeCamera';
import { GetShopLists } from '../../../../Controller/ShopController';
import { alertConfirm, isValid } from '../../../../Core/Utility';
import {
  CheckLocation,
  cleanURL,
  isPhone,
  LocationEnabled,
  toTitleCaseText,
  UUIDGenerator,
} from '../../../../Core/Helper';
import { REPORT } from '../../../../API/ReportAPI';
import {
  deleteOldPhotosByReport,
  deletePhotoByPath,
} from '../../../../Controller/PhotoController';
import DynamicField from './Control/DynamicField';
import PhotoField from './Control/PhotoField';
import {
  buildPhotoMap,
  getRequestDataJson,
  getRequestGuid,
  getRequestPhotos,
  getSelectedLabel,
  getSelectedOptions,
  getSelectedValue,
  hasPhotoValue,
  isSuccessResponse,
  normalizeMaster,
  STATUS_LABELS,
} from './StoreRequestUtils';
import { toastError, toastSuccess } from '../../../../Utils/configToast';

const PHOTO_REQUIRED_TYPES = ['photo'];
const VALUE_REQUIRED_TYPES = [
  'text',
  'phone',
  'number',
  'selected',
  'shop',
  'region',
  'link',
];
const DEFAULT_TEXT_MIN_LENGTH = 5;
const DEFAULT_PHOTO_MIN_COUNT = 1;

const getSelectedNameField = (refName = '') => {
  return refName.endsWith('Id')
    ? `${refName.slice(0, -2)}Name`
    : `${refName}Name`;
};

const isLinkValue = value => {
  const text = (value || '').toString().trim();
  if (!text) return false;
  return /^https?:\/\/[^\s]+\.[^\s]+$/i.test(text);
};

const isTitleCaseTextField = (item = {}) => {
  return (
    item.Ref_Code === 'text' &&
    (item.Ref_Id == 1 || item.Ref_ID == 1 || item.ref_Id == 1)
  );
};

const StoreRequestFormScreen = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const routeShopInfo = route?.params?.shopinfo || {};
  const routeRequestData = route?.params?.requestData || null;
  const isHistoryView = route?.params?.isHistory === true;
  const hasShopInfo =
    routeShopInfo?.shopId !== null &&
    routeShopInfo?.shopId !== undefined &&
    routeShopInfo?.shopId > 0;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState(
    route?.params?.requestType || (hasShopInfo ? 'UPDATE' : 'OPEN'),
  );
  const [requestGuid, setRequestGuid] = useState(
    route?.params?.guid || UUIDGenerator(),
  );
  const [dataMaster, setDataMaster] = useState([]);
  const [formData, setFormData] = useState({});
  const [displayData, setDisplayData] = useState({});
  const [photoMap, setPhotoMap] = useState({});
  const [waitingRequest, setWaitingRequest] = useState(null);
  const [closeMode, setCloseMode] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [isTakePictureClose, setTakePictureClose] = useState(0);
  const [errors, setErrors] = useState({});
  const [gps, setGps] = useState({ latitude: 0, longitude: 0 });
  const reportId = route?.params?.reportId || kpiinfo?.id;
  const shopId = routeShopInfo?.shopId || route?.params?.shopId || 0;

  const waitingType = (
    waitingRequest?.typeWaiting ||
    waitingRequest?.TypeWaiting ||
    waitingRequest?.RequestType ||
    waitingRequest?.requestType ||
    ''
  )
    .toString()
    .toUpperCase();
  const isReadOnly = !!waitingRequest || isHistoryView;
  const waitingStatus = waitingRequest?.status || waitingRequest?.Status || 0;
  const confirmColor =
    waitingStatus == 1
      ? appcolor.success || appcolor.primary
      : waitingStatus == 3
      ? appcolor.warning || appcolor.primary
      : waitingStatus == 2
      ? appcolor.info || appcolor.primary
      : waitingStatus == -1 || waitingStatus == -2
      ? appcolor.red || appcolor.primary
      : appcolor.primary;

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
    body: { paddingTop: 10, paddingBottom: 40 },
    loadingText: {
      color: appcolor.greylight,
      fontSize: 13,
      textAlign: 'center',
      padding: 16,
    },
    waitingBox: {
      marginHorizontal: 10,
      marginTop: 10,
      padding: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: confirmColor,
    },
    waitingTitle: { color: appcolor.dark, fontSize: 14, fontWeight: '800' },
    waitingText: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    noteBox: {
      marginHorizontal: 10,
      marginVertical: 7,
      padding: 13,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    noteLabel: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 8,
    },
    noteValue: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 3,
    },
    confirmBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginBottom: 4,
    },
    confirmBadgeText: {
      color: appcolor.light,
      fontSize: 12,
      fontWeight: '800',
    },
    closeAction: {
      marginHorizontal: 10,
      marginTop: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.8,
      borderColor: appcolor.red || appcolor.primary,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    closeActionIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.red || appcolor.primary,
    },
    closeActionContent: { flex: 1, marginStart: 10 },
    closeActionText: { color: appcolor.dark, fontSize: 14, fontWeight: '800' },
    closeActionHint: {
      color: appcolor.greylight,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    closeHeader: {
      marginHorizontal: 10,
      marginTop: 10,
      padding: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.red || appcolor.grayLight,
    },
    closeTitle: {
      color: appcolor.red || appcolor.dark,
      fontSize: 15,
      fontWeight: '800',
    },
    closeSubTitle: {
      color: appcolor.greylight,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    noteInput: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 0,
      borderWidth: 0,
      overflow: 'hidden',
    },
    noteInputText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '500',
      paddingVertical: 10,
      minHeight: 76,
      textAlignVertical: 'top',
    },
    bottomSpace: { height: 80 },
  });

  const loadGps = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const coords = position.coords || {};
        setGps({
          latitude: coords.latitude || 0,
          longitude: coords.longitude || 0,
        });
      },
      () => setGps({ latitude: 0, longitude: 0 }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const isWaitingConfirmRequest = (request, dataJson) => {
    if (!hasShopInfo) return false;
    const statusName = request?.status;
    const statusValue = request?.status;
    const isWaitingStatus =
      statusValue == 2 ||
      statusValue == 3 ||
      statusName === 'Waiting Manager' ||
      statusName === 'Waiting Admin' ||
      statusName === 'Waitting Manager' ||
      statusName === 'Waitting Admin';
    return (
      isWaitingStatus ||
      request?.isHaveRequest == 1 ||
      request?.IsHaveRequest == 1 ||
      request?.IsWaitingConfirm == 1 ||
      request?.isWaitingConfirm == 1 ||
      request?.IsPending == 1 ||
      request?.isPending == 1
    );
  };

  const loadTemplate = async (type = requestType) => {
    if (routeRequestData) {
      applyRequestData(routeRequestData);
      return;
    }
    setLoading(true);
    const params = {
      reportId,
      shopId,
      requestType: type,
      typeReport: route?.params?.typeReport || 'Form',
    };

    await REPORT.GetDataReportByShop_RealTime(
      params,
      async (mData, message) => {
        if (message) toastError('Thông báo', message);
        const request = Array.isArray(mData) ? mData[0] || {} : mData || {};
        const master = normalizeMaster(
          request.dataMaster || request.DataMaster || [],
        );
        const guid = getRequestGuid(request) || requestGuid || UUIDGenerator();
        const dataJson = getRequestDataJson(request);

        setTakePictureClose(request?.isTakePictureClose || 0);
        setWaitingRequest(
          isWaitingConfirmRequest(request, dataJson) ? request : null,
        );
        setRequestGuid(guid);
        setDataMaster(master);
        setFormData(
          Object.keys(dataJson || {}).length > 0
            ? buildRegionFormData(master, dataJson)
            : buildDataJsonFromShopInfo(master),
        );
        setPhotoMap(buildPhotoMap(getRequestPhotos(request)));
        setErrors({});
      },
    );
    setLoading(false);
  };

  const applyRequestData = (request = {}) => {
    const master = normalizeMaster(
      request.dataMaster || request.DataMaster || [],
    );
    const guid = getRequestGuid(request) || requestGuid || UUIDGenerator();
    const dataJson = getRequestDataJson(request);
    setTakePictureClose(request?.isTakePictureClose || 0);
    setWaitingRequest(request);
    setRequestGuid(guid);
    setDataMaster(master);
    setFormData(
      Object.keys(dataJson || {}).length > 0
        ? buildRegionFormData(master, dataJson)
        : buildDataJsonFromShopInfo(master),
    );
    setPhotoMap(buildPhotoMap(getRequestPhotos(request)));
    setErrors({});
  };

  const buildDataJsonFromShopInfo = (master = []) => {
    const dataJson = {};
    (master || []).forEach(item => {
      const refName = item.Ref_Name;
      if (!refName || item.Ref_Code === 'photo') return;
      if (item.Ref_Code === 'region') {
        const regionId = routeShopInfo[refName];
        if (regionId !== undefined && regionId !== null)
          dataJson[refName] = regionId;
        if (
          routeShopInfo.provinceCode !== undefined &&
          routeShopInfo.provinceCode !== null
        )
          dataJson.provinceCode = routeShopInfo.provinceCode;
        if (
          routeShopInfo.provinceName !== undefined &&
          routeShopInfo.provinceName !== null
        )
          dataJson.provinceName = routeShopInfo.provinceName;
        if (
          routeShopInfo.wardCode !== undefined &&
          routeShopInfo.wardCode !== null
        )
          dataJson.wardCode = routeShopInfo.wardCode;
        if (
          routeShopInfo.wardName !== undefined &&
          routeShopInfo.wardName !== null
        )
          dataJson.wardName = routeShopInfo.wardName;
        return;
      }
      if (
        routeShopInfo[refName] !== undefined &&
        routeShopInfo[refName] !== null
      ) {
        dataJson[refName] = routeShopInfo[refName];
      }
    });
    return dataJson;
  };

  const buildRegionFormData = (master = [], dataJson = {}) => {
    const nextData = { ...(dataJson || {}) };
    (master || []).forEach(item => {
      if (item.Ref_Code !== 'region' || !item.Ref_Name) return;
      if (
        (nextData[item.Ref_Name] === null ||
          nextData[item.Ref_Name] === undefined ||
          nextData[item.Ref_Name] === '') &&
        nextData.wardCode
      ) {
        nextData[item.Ref_Name] = nextData.wardCode;
      }
    });
    return nextData;
  };

  const handleOpenCloseStore = () => {
    setCloseMode(true);
    setRequestType('CLOSE');
    setErrors({});
  };

  const handleChangeValue = (item, text) => {
    const value =
      item.Ref_Code === 'phone' || item.Ref_Code === 'number'
        ? text.replace(/\D+/g, '')
        : isTitleCaseTextField(item)
        ? toTitleCaseText(text)
        : text;
    setFormData({ ...formData, [item.Ref_Name]: value });
    if (errors[item.Ref_Name]) setErrors({ ...errors, [item.Ref_Name]: null });
  };

  const handleSelected = (option, refName) => {
    const value = getSelectedValue(option);
    const label = getSelectedLabel(option);
    setFormData({
      ...formData,
      [refName]: value,
      [getSelectedNameField(refName)]: label,
    });
    setDisplayData({ ...displayData, [refName]: label });
    if (errors[refName]) setErrors({ ...errors, [refName]: null });
  };

  const handleRegionSelect = (option, refName) => {
    if (!option || !refName) return;
    if (option.level1_id !== undefined) {
      setFormData({
        ...formData,
        provinceCode: option.provinceCode,
        provinceName: option.provinceName || option.name,
        wardCode: null,
        wardName: null,
        [refName]: null,
      });
      setDisplayData({
        ...displayData,
        [refName]: `Tỉnh/Thành phố: ${option.name}`,
      });
      return;
    }
    const nextFormData = {
      ...formData,
      [refName]: option.level2_id,
      provinceCode: option.provinceCode,
      provinceName: option.provinceName,
      wardCode: option.wardCode,
      wardName: option.wardName || option.name,
    };
    const nextDisplayData = {
      ...displayData,
      [refName]: [option.provinceName, option.wardName || option.name]
        .filter(Boolean)
        .join(' - '),
    };
    setFormData(nextFormData);
    setDisplayData(nextDisplayData);
    if (errors[refName]) setErrors({ ...errors, [refName]: null });
  };

  const handleOpenShopSelector = async item => {
    setLoading(true);
    const result = await GetShopLists();
    setLoading(false);
    const shoplist = result?.data || result || [];
    navigation.navigate('searchshop', {
      shoplist,
      callBack: shop => {
        setFormData({
          ...formData,
          [item.Ref_Name]: shop.shopId || shop.ShopId || shop.id,
        });
        setDisplayData({
          ...displayData,
          [item.Ref_Name]: `${shop.shopCode || shop.ShopCode || ''} - ${
            shop.shopName || shop.ShopName || ''
          }`,
        });
        if (errors[item.Ref_Name])
          setErrors({ ...errors, [item.Ref_Name]: null });
      },
    });
  };

  const handleScanLink = item => {
    navigation.navigate('qrcode', {
      onSuccess: value => {
        const linkValue = cleanURL((value || '').toString().trim());
        setFormData({ ...formData, [item.Ref_Name]: linkValue });
        if (errors[item.Ref_Name])
          setErrors({ ...errors, [item.Ref_Name]: null });
      },
    });
  };

  const getRealtimeGps = () => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          const coords = position.coords || {};
          const latitude = coords.latitude || gps.latitude;
          const longitude = coords.longitude || gps.longitude;
          resolve({ latitude, longitude });
        },
        () => resolve({ latitude: gps.latitude, longitude: gps.longitude }),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
  };

  const buildPhotoInfo = async item => {
    const currentGps = await getRealtimeGps();
    return {
      shopId,
      shopCode: formData.shopCode || null,
      reportId,
      photoDate: moment().format('YYYYMMDD'),
      photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
      photoType: item.Ref_Name,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      photoDesc: item.NameVN || '',
      latitude: currentGps.latitude,
      longitude: currentGps.longitude,
      guid: requestGuid,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
  };

  const handlePhotoResult = async (item, result) => {
    if (result?.statusId !== 200) return;
    const fileInfo = Array.isArray(result.fileInfo)
      ? result.fileInfo[0] || {}
      : result.fileInfo || {};
    const resultData = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];
    const dataPhotos = resultData
      .map(photo => photo?.photoPath || photo?.uri)
      .filter(Boolean)
      .map(photoPath => ({ ...fileInfo, photoPath }));
    const resultPhotos =
      dataPhotos.length > 0
        ? dataPhotos
        : Array.isArray(result.fileInfo)
        ? result.fileInfo
        : result.fileInfo
        ? [result.fileInfo]
        : [];
    const nextPhotos = resultPhotos
      .map(photo => {
        const photoPath = photo?.photoPath;
        if (!photoPath) return null;
        return {
          ...photo,
          PhotoType: photo.photoType || item.Ref_Name,
          PhotoPath: photoPath,
        };
      })
      .filter(Boolean);
    if (nextPhotos.length === 0) return;

    const currentPhotos = Array.isArray(photoMap[item.Ref_Name])
      ? photoMap[item.Ref_Name]
      : photoMap[item.Ref_Name]
      ? [photoMap[item.Ref_Name]]
      : [];
    const mergedPhotos = [...currentPhotos, ...nextPhotos].filter(
      (photo, index, list) => {
        const photoPath =
          photo.PhotoPath || photo.photoPath || photo.uri || photo.photoUrl;
        return (
          photoPath &&
          list.findIndex(
            it =>
              (it.PhotoPath || it.photoPath || it.uri || it.photoUrl) ===
              photoPath,
          ) === index
        );
      },
    );
    setPhotoMap({ ...photoMap, [item.Ref_Name]: mergedPhotos });
    if (errors[item.Ref_Name]) setErrors({ ...errors, [item.Ref_Name]: null });
  };

  const handleTakePhoto = async item => {
    await CheckLocation(async () => {
      await LocationEnabled(async enabled => {
        if (enabled === true) {
          const photoInfo = await buildPhotoInfo(item);
          NativeCamera.cameraStart(photoInfo, result =>
            handlePhotoResult(item, result),
          );
        }
      });
    });
  };

  const handleSelectPhoto = async item => {
    const photoInfo = await buildPhotoInfo(item);
    NativeCamera.imageGalleryLaunch(photoInfo, result =>
      handlePhotoResult(item, result),
    );
  };

  const handleRemovePhoto = async (item, photoRemove) => {
    const photoPathRemove =
      photoRemove?.PhotoPath ||
      photoRemove?.photoPath ||
      photoRemove?.uri ||
      photoRemove?.photoUrl;
    const nextPhotoMap = { ...photoMap };
    if (photoRemove) {
      const currentPhotos = Array.isArray(nextPhotoMap[item.Ref_Name])
        ? nextPhotoMap[item.Ref_Name]
        : nextPhotoMap[item.Ref_Name]
        ? [nextPhotoMap[item.Ref_Name]]
        : [];
      nextPhotoMap[item.Ref_Name] = currentPhotos.filter(photo => {
        const photoPath =
          photo?.PhotoPath || photo?.photoPath || photo?.uri || photo?.photoUrl;
        return photoPath !== photoPathRemove;
      });
      if (nextPhotoMap[item.Ref_Name].length === 0)
        delete nextPhotoMap[item.Ref_Name];
    } else {
      delete nextPhotoMap[item.Ref_Name];
    }
    setPhotoMap(nextPhotoMap);
    await deletePhotoByPath(photoPathRemove);
  };

  const validateForm = () => {
    if (closeMode) return validateCloseStore();
    const nextErrors = {};
    dataMaster.forEach(item => {
      const value = formData[item.Ref_Name];

      const textValue = (value || '').toString().trim();
      if (PHOTO_REQUIRED_TYPES.includes(item.Ref_Code)) {
        const minPhoto =
          parseInt(item.NumberValue || 0) || DEFAULT_PHOTO_MIN_COUNT;
        const photos = Array.isArray(photoMap[item.Ref_Name])
          ? photoMap[item.Ref_Name]
          : photoMap[item.Ref_Name]
          ? [photoMap[item.Ref_Name]]
          : [];
        if (item.IsRequired && !hasPhotoValue(photoMap, item.Ref_Name)) {
          nextErrors[item.Ref_Name] = `Vui lòng thêm ${item.NameVN}`;
          return;
        }
        if (item.IsRequired && photos.length < minPhoto) {
          nextErrors[
            item.Ref_Name
          ] = `Vui lòng thêm tối thiểu ${minPhoto} hình`;
          return;
        }
      }

      if (
        item.IsRequired &&
        VALUE_REQUIRED_TYPES.includes(item.Ref_Code) &&
        !isValid(value)
      ) {
        nextErrors[item.Ref_Name] = `Vui lòng nhập ${item.NameVN}`;
        return;
      }

      if (item.Ref_Code === 'text' && textValue.length > 0) {
        const minLength =
          parseInt(item.NumberValue || 0) || DEFAULT_TEXT_MIN_LENGTH;
        if (textValue.length < minLength) {
          nextErrors[
            item.Ref_Name
          ] = `${item.NameVN} tối thiểu ${minLength} ký tự`;
          return;
        }
      }

      if (
        item.Ref_Code === 'phone' &&
        textValue.length > 0 &&
        !isPhone(textValue)
      ) {
        nextErrors[item.Ref_Name] = `${item.NameVN} không đúng định dạng`;
        return;
      }

      if (
        item.Ref_Code === 'link' &&
        textValue.length > 0 &&
        !isLinkValue(cleanURL(textValue))
      ) {
        nextErrors[
          item.Ref_Name
        ] = `${item.NameVN} chưa đúng định dạng. Link cần bắt đầu bằng http:// hoặc https:// và có tên miền hợp lệ`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCloseStore = () => {
    const nextErrors = {};
    const noteValue = (closeNote || '').trim();
    const photos = Array.isArray(photoMap.CLOSE_IMAGE)
      ? photoMap.CLOSE_IMAGE
      : photoMap.CLOSE_IMAGE
      ? [photoMap.CLOSE_IMAGE]
      : [];
    if (!noteValue) nextErrors.CLOSE_NOTE = 'Vui lòng nhập lý do đóng cửa hàng';
    if (isTakePictureClose == 1 && photos.length === 0)
      nextErrors.CLOSE_IMAGE = 'Vui lòng chụp hình đóng cửa hàng';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getUploadedPhotoPath = photo => {
    const photoPath =
      photo?.PhotoPath || photo?.photoPath || photo?.uri || photo?.photoUrl;
    if (!photoPath) return null;
    if (photoPath.toLowerCase().startsWith('/uploaded/')) return photoPath;
    const imageName = photoPath.slice(
      photoPath.lastIndexOf('/', photoPath.length) + 1,
    );
    const photoDate =
      photo?.PhotoDate || photo?.photoDate || moment().format('YYYYMMDD');
    return `/uploaded/${photoDate}/${imageName}`;
  };

  const buildSubmitPhoto = (item, photo) => {
    const photoPath = getUploadedPhotoPath(photo);
    if (!photoPath) return null;
    return {
      photoFullTime:
        photo?.photoFullTime ||
        photo?.PhotoFullTime ||
        moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      guid: photo?.guid || photo?.Guid || requestGuid,
      photoPath,
      photoType: photo?.photoType || photo?.PhotoType || item.Ref_Name,
      photoDesc: photo?.photoDesc || photo?.PhotoDesc || item.NameVN || '',
      longitude: photo?.longitude || photo?.Longitude || gps.longitude,
      latitude: photo?.latitude || photo?.Latitude || gps.latitude,
    };
  };

  const buildSubmitData = () => {
    if (closeMode) return buildCloseSubmitData();
    const dataJson = { ...formData, ...gps };
    const jsonPhoto = [];
    dataMaster.forEach(item => {
      if (item.Ref_Code === 'photo') delete dataJson[item.Ref_Name];
      if (item.Ref_Code === 'gps') dataJson[item.Ref_Name] = getGpsText();
      if (item.Ref_Code === 'link' && dataJson[item.Ref_Name])
        dataJson[item.Ref_Name] = cleanURL(dataJson[item.Ref_Name]);
      if (
        item.Ref_Code === 'selected' &&
        dataJson[item.Ref_Name] &&
        !dataJson[getSelectedNameField(item.Ref_Name)]
      ) {
        const selectedOption = getSelectedOptions(item).find(
          option =>
            `${getSelectedValue(option)}` === `${dataJson[item.Ref_Name]}`,
        );
        const selectedLabel = getSelectedLabel(selectedOption);
        if (selectedLabel)
          dataJson[getSelectedNameField(item.Ref_Name)] = selectedLabel;
      }
      if (item.Ref_Code === 'photo') {
        const photos = Array.isArray(photoMap[item.Ref_Name])
          ? photoMap[item.Ref_Name]
          : photoMap[item.Ref_Name]
          ? [photoMap[item.Ref_Name]]
          : [];
        photos.forEach(photo => {
          const submitPhoto = buildSubmitPhoto(item, photo);
          if (submitPhoto) jsonPhoto.push(submitPhoto);
        });
      }
    });
    return {
      Guid: requestGuid,
      RequestType: requestType,
      shopId,
      DataJson: JSON.stringify(dataJson),
      JsonPhoto: JSON.stringify(jsonPhoto),
    };
  };

  const buildCloseSubmitData = () => {
    const closeItem = {
      Ref_Name: 'CLOSE_IMAGE',
      Ref_Code: 'photo',
      NameVN: 'Hình đóng cửa hàng',
    };
    const photos = Array.isArray(photoMap.CLOSE_IMAGE)
      ? photoMap.CLOSE_IMAGE
      : photoMap.CLOSE_IMAGE
      ? [photoMap.CLOSE_IMAGE]
      : [];
    const jsonPhoto = photos
      .map(photo => buildSubmitPhoto(closeItem, photo))
      .filter(Boolean);
    return {
      Guid: requestGuid,
      RequestType: 'CLOSE',
      shopId,
      Note: closeNote,
      DataJson: JSON.stringify({
        shopId,
        note: closeNote,
        latitude: gps.latitude,
        longitude: gps.longitude,
      }),
      JsonPhoto: JSON.stringify(jsonPhoto),
    };
  };

  const handleSubmit = async () => {
    console.log(buildSubmitData(), 'buildSubmitDatabuildSubmitData');

    if (isReadOnly) {
      toastError('Thông báo', 'Cửa hàng đang có yêu cầu chờ xác nhận');
      return;
    }

    if (!validateForm()) {
      toastError('Thông báo', 'Vui lòng kiểm tra thông tin bắt buộc');
      return;
    }
    alertConfirm(
      'Gửi yêu cầu',
      'Bạn có muốn gửi yêu cầu cửa hàng này không?',
      async () => {
        setSubmitting(true);
        const result = await REPORT.UploadDataRaw_Realtime(
          buildSubmitData(),
          { shopId, auditDate: moment().format('YYYYMMDD') },
          reportId,
        );
        setSubmitting(false);
        if (isSuccessResponse(result)) {
          toastSuccess(
            'Thông báo',
            result?.messager || result?.messeger || 'Gửi yêu cầu thành công',
          );
          DeviceEventEmitter.emit('RELOAD_STORE_REQUEST');
          navigation.goBack();
        } else {
          toastError(
            'Lỗi',
            result?.messager ||
              result?.messeger ||
              'Gửi yêu cầu không thành công',
          );
        }
      },
    );
  };

  const getGpsText = () => {
    if (!gps.latitude || !gps.longitude) return null;
    return `${gps.latitude}, ${gps.longitude}`;
  };

  const renderWaitingNotice = () => {
    if (!waitingRequest) return null;
    const titleConfirm =
      waitingRequest?.titleConfirm ||
      STATUS_LABELS[waitingStatus] ||
      'Yêu cầu đang chờ xác nhận';
    return (
      <View style={styles.waitingBox}>
        <View style={[styles.confirmBadge, { backgroundColor: confirmColor }]}>
          <Text style={styles.confirmBadgeText}>{titleConfirm}</Text>
        </View>
        <Text style={styles.waitingTitle}>Yêu cầu đang chờ xác nhận</Text>
        <Text style={styles.waitingText}>
          Bạn chỉ có thể xem thông tin, không thể chỉnh sửa hoặc gửi lại yêu cầu
          này.
        </Text>
      </View>
    );
  };

  const renderConfirmRow = (label, value) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <View>
        <Text style={styles.noteLabel}>{label}</Text>
        <Text style={styles.noteValue}>{value}</Text>
      </View>
    );
  };

  const renderConfirmInfo = () => {
    if (!waitingRequest) return null;
    const note = waitingRequest?.note || waitingRequest?.Note;
    const managerName =
      waitingRequest?.managerConfirmName || waitingRequest?.ManagerConfirmName;
    const managerNote =
      waitingRequest?.managerConfirmNote || waitingRequest?.ManagerConfirmNote;
    const adminName =
      waitingRequest?.adminConfirmName || waitingRequest?.AdminConfirmName;
    const adminNote =
      waitingRequest?.adminConfirmNote || waitingRequest?.AdminConfirmNote;
    const hasInfo =
      (waitingType === 'CLOSE' && note) ||
      managerName ||
      managerNote ||
      adminName ||
      adminNote;
    if (!hasInfo) return null;
    return (
      <View style={styles.noteBox}>
        {waitingType === 'CLOSE'
          ? renderConfirmRow('Ghi chú của bạn', note)
          : null}
        {renderConfirmRow('Quản lí', managerName)}
        {renderConfirmRow('Ghi chú quản lí', managerNote)}
        {renderConfirmRow('Admin', adminName)}
        {renderConfirmRow('Ghi chú admin', adminNote)}
      </View>
    );
  };

  const renderCloseWaitingView = () => {
    const photos = Object.values(photoMap || {}).reduce(
      (list, item) => list.concat(Array.isArray(item) ? item : [item]),
      [],
    );
    return (
      <View>
        {renderWaitingNotice()}
        {renderConfirmInfo()}
        <PhotoField
          item={{
            Ref_Name: 'CLOSE_IMAGE',
            NameVN: 'Hình ảnh đã chụp',
            IsRequired: 0,
          }}
          photo={photos}
          disabled
        />
      </View>
    );
  };

  const renderCloseStoreForm = () => {
    const closeItem = {
      Ref_Name: 'CLOSE_IMAGE',
      Ref_Code: 'photo',
      NameVN: 'Hình đóng cửa hàng',
      IsRequired: isTakePictureClose == 1 ? 1 : 0,
    };
    return (
      <View>
        <View style={styles.closeHeader}>
          <Text style={styles.closeTitle}>Đóng cửa hàng</Text>
          <Text style={styles.closeSubTitle}>
            Nhập lý do và chụp hình theo yêu cầu trước khi gửi xác nhận đóng cửa
            hàng.
          </Text>
        </View>
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>
            Lý do đóng cửa hàng <Text style={{ color: appcolor.red }}>*</Text>
          </Text>
          <FormGroup
            editable
            multiline
            value={closeNote}
            placeholder="Nhập lý do đóng cửa hàng"
            containerStyle={styles.noteInput}
            inputStyle={styles.noteInputText}
            handleChangeForm={text => {
              setCloseNote(text);
              if (errors.CLOSE_NOTE) setErrors({ ...errors, CLOSE_NOTE: null });
            }}
          />
          {errors.CLOSE_NOTE ? (
            <Text
              style={{
                color: appcolor.red,
                fontSize: 11,
                fontStyle: 'italic',
                marginTop: 4,
              }}
            >
              * {errors.CLOSE_NOTE}
            </Text>
          ) : null}
        </View>
        <PhotoField
          item={closeItem}
          photo={photoMap.CLOSE_IMAGE}
          error={errors.CLOSE_IMAGE}
          onTakePhoto={handleTakePhoto}
          onSelectPhoto={handleSelectPhoto}
          onRemovePhoto={handleRemovePhoto}
        />
      </View>
    );
  };

  useEffect(() => {
    const loadForm = async () => {
      await deleteOldPhotosByReport(shopId, reportId);
      loadGps();
      await loadTemplate();
    };
    loadForm();
    return () => false;
  }, []);

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route?.params?.title || kpiinfo?.menuNameVN || 'Store Request'}
        leftFunc={() => (closeMode ? setCloseMode(false) : navigation.goBack())}
        iconRight={isReadOnly ? null : 'cloud-upload-alt'}
        rightFunc={isReadOnly ? null : handleSubmit}
      />
      <LoadingView
        isLoading={loading || submitting}
        styles={{ marginTop: 8 }}
        title="Đang cập nhật dữ liệu"
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {closeMode ? (
          renderCloseStoreForm()
        ) : waitingType === 'CLOSE' ? (
          renderCloseWaitingView()
        ) : (
          <>
            {renderWaitingNotice()}
            {hasShopInfo && !isReadOnly && (
              <TouchableOpacity
                style={styles.closeAction}
                onPress={handleOpenCloseStore}
              >
                <View style={styles.closeActionIcon}>
                  <SpiralIcon
                    name="store-slash"
                    type="font-awesome-5"
                    size={15}
                    color={appcolor.light}
                  />
                </View>
                <View style={styles.closeActionContent}>
                  <Text style={styles.closeActionText}>Đóng cửa hàng</Text>
                  <Text style={styles.closeActionHint}>
                    Tạo yêu cầu đóng cửa hàng này
                  </Text>
                </View>
                <SpiralIcon
                  name="chevron-right"
                  type="font-awesome-5"
                  size={13}
                  color={appcolor.greylight}
                />
              </TouchableOpacity>
            )}
            {waitingRequest ? renderConfirmInfo() : null}
            {!loading && dataMaster.length === 0 ? (
              <Text style={styles.loadingText}>Không có cấu hình biểu mẫu</Text>
            ) : null}
            {!loading &&
              dataMaster.map(item => (
                <DynamicField
                  key={`${item.Ref_Name}_${item.Order}`}
                  item={item}
                  value={formData[item.Ref_Name]}
                  displayValue={displayData[item.Ref_Name]}
                  error={errors[item.Ref_Name]}
                  photo={photoMap[item.Ref_Name]}
                  gpsValue={getGpsText()}
                  disabled={isReadOnly}
                  onChange={handleChangeValue}
                  onSelect={handleSelected}
                  onRegionSelect={handleRegionSelect}
                  onScanLink={handleScanLink}
                  onOpenShopSelector={handleOpenShopSelector}
                  onTakePhoto={handleTakePhoto}
                  onSelectPhoto={handleSelectPhoto}
                  onRemovePhoto={handleRemovePhoto}
                />
              ))}
          </>
        )}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

export default StoreRequestFormScreen;
