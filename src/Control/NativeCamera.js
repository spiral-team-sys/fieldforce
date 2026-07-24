import { Platform, Linking } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { alertConfirm } from '../Core/Utility';
import {
  InsertPhotosItem,
  UpdatePhotosDataStatus,
  UpdatePhotosFileStatus,
  UpdateUrlPhotosShop,
  uploadAllDataPhoto,
  uploadPhotoData,
} from '../Controller/PhotoController';
import { check, PERMISSIONS, request } from 'react-native-permissions';

import moment from 'moment';
import { defaultSetting, ToastError, UUIDGenerator } from '../Core/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
// import ImageResizer from '@bam.tech/react-native-image-resizer';

const imageOptions = {
  mediaType: 'photo',
  cameraType: Platform.OS === 'android' ? 'front' : 'back',
  quality: 0.9,
  saveToPhotos: true,
  includeBase64: true,
  selectionLimit: 0,
  maxHeight: 1920,
  maxWidth: 1024,
};
const videoOptions = {
  mediaType: 'video',
  videoQuality: 'medium',
  durationLimit: 60,
  saveToPhotos: false,
};

const shouldRequestLegacyStoragePermission = () => {
  return Platform.OS === 'android' && Number(Platform.Version || 0) < 29;
};

const callbackAction = result => {
  if (result === 'blocked' || result === 'unavailable') {
    alertConfirm(
      'Chú ý',
      'Ứng dụng chưa được cấp quyền, vui lòng cấp quyền để tiếp tục thực hiện',
      actionYes,
      null,
      'Cài đặt',
      'Từ chối',
    );
    return false;
  }
  return true;
};
const actionYes = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};
const cameraStart = async (iphotoinfo, fResult, customOption) => {
  let allow = true;
  if (Platform.OS === 'ios') {
    // * IOS
    allow = await check(PERMISSIONS.IOS.CAMERA).then(res =>
      callbackAction(res),
    );
    await request(PERMISSIONS.IOS.CAMERA);
  } else {
    // * ANDROID
    allow = await check(PERMISSIONS.ANDROID.CAMERA).then(callbackAction);
    await request(PERMISSIONS.ANDROID.CAMERA);

    if (shouldRequestLegacyStoragePermission()) {
      allow = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(
        callbackAction,
      );
      await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }
  }
  if (allow) {
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || (await defaultSetting);
    //
    imageOptions.saveToPhotos = settings.exportPhotoReport || false;
    const options =
      customOption !== undefined &&
      customOption !== null &&
      Object.keys(customOption || null)?.length > 0
        ? customOption
        : { ...imageOptions, quality: 0.8 };
    return ImagePicker.launchCamera(options, res =>
      actionAfterTakeImage('CAMERA', res, iphotoinfo, fResult),
    );
  }
};
const videoStart = async (ivideoinfo, fResult, customOption) => {
  try {
    let allow = true;
    if (Platform.OS === 'ios') {
      allow = await check(PERMISSIONS.IOS.CAMERA).then(callbackAction);
      await request(PERMISSIONS.IOS.CAMERA);
    } else {
      allow = await check(PERMISSIONS.ANDROID.CAMERA).then(callbackAction);
      await request(PERMISSIONS.ANDROID.CAMERA);

      if (shouldRequestLegacyStoragePermission()) {
        allow = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(
          callbackAction,
        );
        await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      }
    }

    if (allow) {
      const json = await AsyncStorage.getItem('SETTINGS');
      const settings = JSON.parse(json) || defaultSetting;

      videoOptions.saveToPhotos = settings.exportPhotoReport || false;
      const options =
        customOption && Object.keys(customOption).length > 0
          ? customOption
          : videoOptions;
      return ImagePicker.launchCamera(options, res =>
        actionAfterTakeVideo('VIDEO', res, ivideoinfo, fResult),
      );
    }
  } catch (e) {
    console.log('VideoStart Error:', e);
  }
};
const imageGalleryLaunch = async (iphotoinfo, payload, customOption) => {
  try {
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || (await defaultSetting);
    //
    imageOptions.saveToPhotos = settings.exportPhotoReport || false;
    const options =
      customOption !== undefined &&
      customOption !== null &&
      Object.keys(customOption)?.length > 0
        ? customOption
        : imageOptions;
    ImagePicker.launchImageLibrary(options, res =>
      res.assets
        ? actionAfterTakeImage('GALLERY', res, iphotoinfo, payload)
        : actionAfterTakeImage('GALLERY', null, iphotoinfo, payload),
    );
  } catch (e) {
    console.log(e);
  }
};
const videoGalleryLaunch = async (iphotoinfo, payload, customOption) => {
  try {
    const json = await AsyncStorage.getItem('SETTINGS');
    const settings = (await JSON.parse(json)) || (await defaultSetting);
    //
    videoOptions.saveToPhotos = settings.exportPhotoReport || false;
    const options =
      customOption !== undefined &&
      customOption !== null &&
      Object.keys(customOption)?.length > 0
        ? customOption
        : videoOptions;
    ImagePicker.launchImageLibrary(options, res =>
      res.assets
        ? actionAfterTakeVideo('GALLERY', res, iphotoinfo, payload)
        : actionAfterTakeVideo('GALLERY', null, iphotoinfo, payload),
    );
  } catch (e) {
    console.log(e);
  }
};
const resizeImage = async uri => {
  try {
    let maxWidth = 1280,
      maxHeight = 1280,
      quality = 80;

    let infoImageConvert;
    const path = `${
      RNFS.DocumentDirectoryPath
        ? RNFS.DocumentDirectoryPath
        : RNFS.LibraryDirectoryPath
    }/Photo/`;
    // Tạo thư mục nếu nó không tồn tại
    const dirExists = await RNFS.exists(path);
    if (!dirExists) {
      await RNFS.mkdir(path);
    }
    return await ImageResizer.createResizedImage(
      uri,
      maxWidth,
      maxHeight,
      'JPEG',
      quality,
      0,
      path,
    );
  } catch (error) {
    console.error('Error resizing image:', error);
    return null;
  }
};
const changeImageInfo = async arrImage => {
  const newArrayImage = [];
  for (let i = 0; i < (arrImage.length || 0); i++) {
    let item = arrImage[i];
    const newImageUrl = (await resizeImage(await item.uri)) || item;
    const newItem = {
      ...item,
      fileName: newImageUrl.name,
      photoPath: newImageUrl.uri,
      uri: newImageUrl.uri,
    };
    newArrayImage.push(newItem);
  }
  return newArrayImage;
};

const actionAfterTakeImage = async (type, ressult, iphotoinfo, fResult) => {
  if (ressult?.didCancel) {
    fResult({ statusId: 500 });
    return;
  }
  if (ressult === null) {
    if (iphotoinfo.reportId !== -1)
      fResult({ statusId: 400, messager: "Photo isn't take", data: [] });
    return;
  }
  let { assets, didCancel } = (await ressult) || [];
  if (didCancel) return;
  if (assets !== undefined) {
    let newArrImage = await changeImageInfo(assets);
    await newArrImage?.forEach(async res => {
      let timePhotoInsert =
        (await new Date().getTime()) + (Math.floor(Math.random() * 100) + 1);
      // const newImageUrl = await resizeImage(await res.uri)
      let fileInfo = await { ...iphotoinfo, photoPath: await res.uri };
      if (res.uri === undefined) return;
      if (type === 'GALLERY') {
        fileInfo = await {
          ...fileInfo,
          guid: iphotoinfo.guid || UUIDGenerator(),
          photoTime: timePhotoInsert,
          photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };
      }
      if (fileInfo.reportId === -1) {
        await InsertPhotosItem(fileInfo);
        let resUploadData = await uploadPhotoData(fileInfo);
        if (resUploadData) {
          await UpdatePhotosDataStatus(
            fileInfo.shopId,
            fileInfo.photoDate,
            fileInfo.photoType,
          );
          await uploadAllDataPhoto(
            [fileInfo],
            async () => {
              await UpdatePhotosFileStatus(
                fileInfo.shopId,
                fileInfo.photoDate,
                fileInfo.photoType,
              );
              let shopContent = { ...fResult, imageUrl: await res.uri };
              shopContent.imageUrl = fileInfo.photoPath;
              if (shopContent.latitude == 0 || shopContent.longitude == 0) {
                await UpdateUrlPhotosShop(
                  fileInfo.shopId,
                  fileInfo.photoPath,
                  fileInfo.latitude,
                  fileInfo.longitude,
                );
                shopContent.latitude = fileInfo.latitude;
                shopContent.longitude = fileInfo.longitude;
              } else {
                await UpdateUrlPhotosShop(
                  fileInfo.shopId,
                  fileInfo.photoPath,
                  shopContent.latitude,
                  shopContent.longitude,
                );
              }
              await fResult.callBackOverView(shopContent);
            },
            () => {
              ToastError(
                'Gửi File hình ảnh photo overview không thành công. Vui lòng bấm nút refresh trên tấm hình để gửi lại.',
              );
              return;
            },
          );
        } else {
          ToastError(
            'Gửi hình ảnh photo overview không thành công. Vui lòng bấm nút refresh trên tấm hình để gửi lại.',
          );
          return;
        }
      } else {
        await InsertPhotosItem(fileInfo);
        await fResult({
          statusId: 200,
          messager: 'success',
          data: (await newArrImage) || res,
          fileInfo: fileInfo,
        });
      }
      // await InsertPhotosItem(fileInfo);
      // await fResult({ statusId: 200, "messager": "success", data: await assets || res })
    });
  } else {
    const newImageUrl = await resizeImage(await ressult.uri);
    const fileInfo = await {
      ...iphotoinfo,
      photoPath: (await newImageUrl.uri) || (await ressult.uri),
    };
    if (res.uri === undefined) return;
    await InsertPhotosItem(fileInfo);
    await fResult({
      statusId: 200,
      messager: 'success',
      data: (await assets) || ressult,
      fileInfo: fileInfo,
    });
  }
};
const actionAfterTakeVideo = async (type, ressult, ivideoinfo, fResult) => {
  if (ressult === null) {
    return;
  }
  let { assets, didCancel } = (await ressult) || [];
  if (didCancel) return;
  if (assets !== undefined) {
    await assets?.forEach(async res => {
      let timeVideoInsert =
        (await new Date().getTime()) + (Math.floor(Math.random() * 100) + 1);
      let fileInfo = await { ...ivideoinfo, photoPath: await res.uri };
      if (res.uri === undefined) return;
      if (type === 'GALLERY') {
        fileInfo = await {
          ...fileInfo,
          guid: ivideoinfo.guid || (await UUIDGenerator.getRandomUUID()),
          photoTime: timeVideoInsert,
          photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
      }
      await InsertPhotosItem(fileInfo);
      await fResult({
        statusId: 200,
        messager: 'success',
        data: (await assets) || res,
      });
    });
  } else {
    await InsertPhotosItem({ ...ivideoinfo, photoPath: ressult.uri });
    await fResult({
      statusId: 200,
      messager: 'success',
      data: (await assets) || ressult,
    });
  }
};

const NativeCamera = {
  cameraStart,
  videoStart,
  imageGalleryLaunch,
  videoGalleryLaunch,
  actionAfterTakeImage,
  resizeImage,
};
export default NativeCamera;
