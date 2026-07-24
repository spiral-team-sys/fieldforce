import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon } from '@rneui/themed';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useSelector } from 'react-redux';
import ImageZoom from '../Content/ImageZoom';
import {
  deletePhotoByPath,
  InsertPhotosItem,
} from '../Controller/PhotoController';
import CacheImage from '../Core/CacheImage';
import { APPNAME, URLDEFAULT } from '../Core/URLs';
import { deviceWidth } from '../Core/Utility';
import { deviceHeight, fontWeightBold } from '../Themes/AppsStyle';
import RNFS from 'react-native-fs';
import {
  Message,
  MessageInfo,
  onShareLocalFile,
  UUIDGenerator,
} from '../Core/Helper';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import moment from 'moment';
import { DrawWithOptions } from '@archireport/react-native-svg-draw';
import LinearGradient from 'react-native-linear-gradient';
import { HeaderCustom } from '../Content/HeaderCustom';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from './Icon/SpiralIcon';

const TOUCH_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
const getDisplayPhotoPath = photoPath => {
  if (!photoPath) return '';
  return photoPath.indexOf('file://') > -1 ||
    photoPath.indexOf('https://') > -1 ||
    !photoPath.includes('uploaded')
    ? photoPath
    : URLDEFAULT + photoPath;
};

export const MultipleShowImage = ({
  containerStyle,
  listItem = [],
  indexItem = 0,
  closeShowImage,
  isShowTitle = false,
  titleFeild = '',
  isUseTool = false,
  useDeleteTool = true,
  useEditImage = true,
  isShowText = false,
  sortFeild = '',
  isZaloButton,
  handlerSelectPhoto,
  dataPhoto,
  isViewOnly = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  const headerHeight = 56;
  const toolBarHeight = isUseTool ? 72 : 0;
  const footerHeight = isZaloButton ? 56 : 0;
  const [pageNum, setPageNum] = useState(indexItem);
  const [data, setData] = useState({ listImage: [] });
  const [currentImage, setCurrentImage] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [isChange, setChange] = useState(false);
  const isChangeRef = useRef(false);
  const viewShotRef = useRef();
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.dark,
    },
    contentHeader: {
      width: '100%',
      height: headerHeight + insets.top,
      alignItems: 'center',
      zIndex: 20,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    titleCountPhoto: {
      color: appcolor.light,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      position: 'absolute',
      top: insets.top + 8,
      alignSelf: 'center',
      margin: 16,
    },
    titleHeaderClose: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },
    viewHeader: {
      width: 80,
      minHeight: 44,
      borderWidth: 0.5,
      borderColor: appcolor.light,
      backgroundColor: appcolor.dark,
      padding: 8,
      borderRadius: 6,
      margin: 8,
      position: 'absolute',
      end: 8,
      top: insets.top + 8,
      justifyContent: 'center',
    },
    viewer: { flex: 1, width: '100%', height: deviceHeight },
    footerContainer: { bottom: toolBarHeight + 8, zIndex: 30 },
    toolBar: {
      position: 'absolute',
      bottom: 0,
      height: 72,
      borderTopStartRadius: 12,
      borderTopEndRadius: 12,
      width: '100%',
      backgroundColor: appcolor.light,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      zIndex: 20,
    },
    toolItemWrap: { padding: 8, flex: 1 },
    toolButton: {
      width: '100%',
      minHeight: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolText: { fontWeight: '500', fontSize: 12, color: appcolor.dark },
    actionSheet: {
      height: 160,
      width: deviceWidth,
      backgroundColor: appcolor.light,
      borderTopEndRadius: 24,
      borderTopStartRadius: 24,
    },
    actionSheetContent: {
      height: 100,
      width: deviceWidth,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionSheetTitle: {
      fontWeight: '700',
      fontSize: 18,
      color: appcolor.dark,
      letterSpacing: -0.3,
      padding: 8,
    },
    actionSheetMessage: {
      fontWeight: '300',
      fontSize: 14,
      color: appcolor.dark,
    },
    actionSheetFooter: {
      flexDirection: 'row',
      height: 60,
      justifyContent: 'space-between',
    },
    actionButtonCancel: {
      height: 40,
      width: '30%',
      marginLeft: 40,
      backgroundColor: appcolor.surface,
      padding: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonConfirm: {
      height: 40,
      width: '30%',
      marginRight: 40,
      backgroundColor: appcolor.info,
      padding: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonCancelText: {
      fontWeight: '400',
      fontSize: 16,
      color: appcolor.dark,
    },
    actionButtonConfirmText: {
      fontWeight: '400',
      fontSize: 16,
      color: appcolor.light,
    },
    modalEdit: { flex: 1 },
    viewerFooter: {
      width: deviceWidth,
      minHeight: footerHeight || 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    zaloButton: {
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      paddingHorizontal: 16,
    },
    zaloText: {
      color: appcolor.light,
      fontSize: 16,
      fontWeight: fontWeightBold,
      letterSpacing: -0.3,
      marginRight: 8,
      marginTop: 2,
    },
  });
  const loadListImage = async () => {
    if (listItem !== null && listItem.length > 0) {
      let list = listItem
        .filter(it => it.photoPath)
        .map(it => ({ ...it, url: getDisplayPhotoPath(it.photoPath) }));
      const index = list.findIndex(
        it => it.photoPath === listItem[indexItem]?.photoPath,
      );
      const currentIndex = index >= 0 ? index : 0;
      await getSizeImage(list);
      await setCurrentImage(list[currentIndex] || {});
      await setPageNum(currentIndex);
      await setData({ listImage: list });
    }
  };

  const cacheImagePath = async uri => {
    const name = uri.substring(uri.lastIndexOf('/') + 1, uri.length);
    const extension = Platform.OS === 'android' ? 'file://' : '';
    const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
    const pathFile = `${path}${name}`;
    let newPath = '';
    await RNFS.exists(pathFile).then(exists => {
      if (exists) {
        newPath = pathFile;
      } else newPath = uri;
    });
    return newPath;
  };

  const getSizeImage = async list => {
    await Promise.all(
      list.map(async it => {
        const cachePath = await cacheImagePath(it.photoPath);
        const photoPath = getDisplayPhotoPath(cachePath);
        await Image.getSize(
          photoPath,
          (width, height) => {
            it.widthViewShot = deviceWidth;
            it.heightViewShot =
              height * (deviceWidth / width) > deviceHeight
                ? deviceHeight
                : height * (deviceWidth / width);
          },
          () => { },
        );
      }),
    );
  };

  useEffect(() => {
    loadListImage();
    return () => false;
  }, []);

  useEffect(() => {
    isChangeRef.current = isChange;
  }, [isChange]);

  const handleImageChange = (index = 0) => {
    setPageNum(index);
    setCurrentImage(data.listImage[index] || {});
  };

  const shareScreen = async () => {
    if (!currentImage?.photoPath) return;
    let arrBase64 = '';
    let ImageAsBase64 = '';
    const photoPath = getDisplayPhotoPath(currentImage.photoPath);
    if (photoPath.includes(URLDEFAULT) || photoPath.includes('https://')) {
      const name = photoPath.substring(
        photoPath.lastIndexOf('/') + 1,
        photoPath?.length,
      );
      const downloadDest = `${RNFS.CachesDirectoryPath}/${name}`;
      await RNFS.downloadFile({
        fromUrl: photoPath,
        toFile: downloadDest,
      }).promise;
      const option = {
        title: 'Tin nhắn',
        message: 'chia sẻ hình ảnh',
        url: `file://${downloadDest}`,
        type: 'image/jpeg',
      };
      await onShareLocalFile(option);
      await setTimeout(async () => {
        await RNFS.unlink(downloadDest);
      }, 10000);
    } else {
      let pathFile = '';
      if (
        photoPath.includes('uploaded') ||
        photoPath.indexOf('https://') > -1
      ) {
        const name = currentImage.photoPath.substring(
          currentImage.photoPath.lastIndexOf('/') + 1,
          currentImage.photoPath?.length,
        );
        const extension = Platform.OS === 'android' ? 'file://' : '';
        const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
        pathFile = `${path}${name}`;
      } else {
        pathFile = currentImage.photoPath;
      }
      RNFS.exists(pathFile).then(async exists => {
        if (!exists) {
          alert('Xảy ra lỗi khi tải lên hình ảnh!!!');
          return;
        }
      });
      ImageAsBase64 = await RNFS.readFile(pathFile, 'base64');
      arrBase64 = `data:image/jpg;base64,${ImageAsBase64}`;
      const option = await {
        title: 'Tin nhắn',
        message: 'chia sẻ hình ảnh',
        url: arrBase64,
      };
      await onShareLocalFile(option);
    }
  };
  const saveImage = async () => {
    if (!currentImage?.photoPath) return;
    try {
      const photoPath = getDisplayPhotoPath(currentImage.photoPath);
      const ref = viewShotRef[`${pageNum}`];
      let urlImages = [];
      await captureRef(ref, {
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      }).then(uri => {
        urlImages = `file://${uri}`;
      });
      if (
        urlImages !== '' ||
        photoPath.includes(URLDEFAULT) ||
        photoPath.includes('https://')
      ) {
        if (Platform.OS === 'android') {
          if (Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Yêu cầu quyền',
                message: 'Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục',
              },
            );
            if (
              granted !== PermissionsAndroid.RESULTS.GRANTED &&
              Platform.OS === 'android'
            ) {
              MessageInfo('Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!');
              return;
            }
            if (
              urlImages != '' &&
              !urlImages &&
              (photoPath.includes(URLDEFAULT) || photoPath.includes('https://'))
            ) {
              await saveImageByUrl(photoPath);
            } else {
              await saveImageCameraRoll(urlImages);
            }
          } else {
            if (
              urlImages == '' &&
              !urlImages &&
              (photoPath.includes(URLDEFAULT) || photoPath.includes('https://'))
            ) {
              await saveImageByUrl(photoPath);
            } else {
              await saveImageCameraRoll(urlImages);
            }
          }
        } else {
          if (
            urlImages == '' &&
            !urlImages &&
            (photoPath.includes(URLDEFAULT) || photoPath.includes('https://'))
          ) {
            await saveImageByUrl(photoPath);
          } else {
            await saveImageCameraRoll(urlImages);
          }
        }
        await setIsSave(false);
        await SheetManager.hide('ref_saveImage');
      }
    } catch (err) {
      console.log(err);
    }
  };
  const saveImageByUrl = async photoPath => {
    const name = photoPath.substring(
      photoPath.lastIndexOf('/') + 1,
      photoPath?.length,
    );
    const downloadDest = `${RNFS.CachesDirectoryPath}/${name}`;
    await RNFS.downloadFile({
      fromUrl: photoPath,
      toFile: downloadDest,
    }).promise;
    await saveImageCameraRoll(downloadDest);
    await setTimeout(async () => {
      await RNFS.unlink(downloadDest);
    }, 10000);
  };
  const saveImageCameraRoll = async path => {
    await CameraRoll.save(path, { type: 'photo', album: APPNAME })
      .then(res => {
        console.log('***RES**');
        console.log(res);
        console.log('***RES**');
        alert('Lưu ảnh thành công!!');
      })
      .catch(error => {
        console.log('*****');
        console.log(error);
        console.log('*****');
        alert('Lưu ảnh không thành công!!!');
      });
  };
  const handlerDeleteImage = async () => {
    if (!currentImage?.photoPath) return;
    const listDelete = data.listImage.filter(
      it => it.photoPath !== currentImage.photoPath,
    );
    await deletePhotoByPath(currentImage);
    data.listImage = listDelete;
    await setChange(true);
    SheetManager.hide('ref_delete');
  };
  const handleSelectSave = async () => {
    setIsSave(true);
    SheetManager.show('ref_saveImage');
  };
  const onCloseSave = () => {
    setIsSave(false);
  };
  const handleSelectEdit = () => {
    setVisibleModal(true);
  };
  const handlerCloseModal = async result => {
    if (result === true) {
      await setChange(true);
    }
    await setVisibleModal(false);
  };
  const renderImage = imageProps => {
    const imageUri = imageProps?.source?.uri;
    const index = data.listImage.findIndex(item => item.url === imageUri);
    const item = data.listImage[index >= 0 ? index : pageNum];
    if (!item) return <View />;
    return (
      <ShowImage
        item={item}
        index={index >= 0 ? index : pageNum}
        viewShotRef={viewShotRef}
        appcolor={appcolor}
        isSave={isSave}
        isShowText={isShowText}
        titleFeild={titleFeild}
        isShowTitle={isShowTitle}
        imageProps={imageProps}
      />
    );
  };
  const renderFooter = (currentIndex = pageNum) => {
    const footerImage = data.listImage[currentIndex] || currentImage;
    const matchedId =
      dataPhoto?.find(it => it.PhotoID === footerImage?.PhotoID)?.isChoose ||
      null;
    if (!isZaloButton) return <View />;
    if (!footerImage?.PhotoID) return <View />;
    return (
      <View style={styles.viewerFooter}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={TOUCH_HIT_SLOP}
          onPress={() => handlerSelectPhoto(footerImage.PhotoID)}
          style={styles.zaloButton}
        >
          <Text style={styles.zaloText}>{'Chọn'}</Text>
          <SpiralIcon
            name={matchedId ? 'check-circle' : 'checkbox-blank-circle-outline'}
            type="material-community"
            color={appcolor.light}
            size={32}
          />
        </TouchableOpacity>
      </View>
    );
  };
  if (isViewOnly) {
    const imageViewerUrls = listItem.map(item =>
      item.url ? item : { ...item, url: getDisplayPhotoPath(item.photoPath) },
    );
    return (
      <SafeAreaView style={[styles.mainContainer, containerStyle]}>
        <ImageViewer
          enableSwipeDown={true}
          onSwipeDown={() => closeShowImage(isChange)}
          index={indexItem}
          enableImageZoom={true}
          imageUrls={imageViewerUrls}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.mainContainer, containerStyle]}>
      <View style={styles.contentHeader}>
        <Text style={styles.titleCountPhoto}>{`${pageNum + 1}/${listItem.filter(it => it.photoPath)?.length
          }`}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={TOUCH_HIT_SLOP}
          style={styles.viewHeader}
          onPress={() => closeShowImage(isChange)}
        >
          <Text style={styles.titleHeaderClose}>ĐÓNG</Text>
        </TouchableOpacity>
      </View>
      {data.listImage?.length > 0 && (
        <ImageViewer
          imageUrls={data.listImage}
          index={pageNum}
          enableImageZoom={true}
          enableSwipeDown={true}
          style={styles.viewer}
          footerContainerStyle={styles.footerContainer}
          onSwipeDown={() => closeShowImage(isChangeRef.current)}
          onChange={handleImageChange}
          renderImage={renderImage}
          renderFooter={renderFooter}
          renderIndicator={() => <View />}
        />
      )}

      {isUseTool && (
        <View style={styles.toolBar}>
          <View style={styles.toolItemWrap}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => handleSelectSave()}
              style={styles.toolButton}
            >
              <SpiralIcon
                type="feather"
                name="save"
                size={20}
                color={appcolor.dark}
              />
              <Text style={styles.toolText}>lưu</Text>
            </TouchableOpacity>
          </View>
          {useEditImage && (
            <View style={styles.toolItemWrap}>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={TOUCH_HIT_SLOP}
                onPress={() => handleSelectEdit()}
                style={styles.toolButton}
              >
                <SpiralIcon
                  type="feather"
                  name="edit"
                  size={20}
                  color={appcolor.dark}
                />
                <Text style={styles.toolText}>Sửa</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.toolItemWrap}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => shareScreen()}
              style={styles.toolButton}
            >
              <SpiralIcon
                type="fontawe-some"
                name="share"
                size={20}
                color={appcolor.dark}
              />
              <Text style={styles.toolText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
          {useDeleteTool && (
            <View style={styles.toolItemWrap}>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={TOUCH_HIT_SLOP}
                onPress={() => SheetManager.show('ref_delete')}
                style={styles.toolButton}
              >
                <SpiralIcon
                  type="feather"
                  name="trash-2"
                  size={20}
                  color={appcolor.dark}
                />
                <Text style={styles.toolText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ActionSheet
        id={'ref_delete'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheet}>
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>Xoá</Text>
            <Text style={styles.actionSheetMessage}>Xoá hình này?</Text>
          </View>
          <View style={styles.actionSheetFooter}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => SheetManager.hide('ref_delete')}
              style={styles.actionButtonCancel}
            >
              <Text style={styles.actionButtonCancelText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => handlerDeleteImage()}
              style={styles.actionButtonConfirm}
            >
              <Text style={styles.actionButtonConfirmText}>Xoá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
      <ActionSheet
        id={'ref_saveImage'}
        onClose={() => onCloseSave()}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.actionSheet}>
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>Lưu hình</Text>
            <Text style={styles.actionSheetMessage}>Lưu hình này?</Text>
          </View>
          <View style={styles.actionSheetFooter}>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => {
                setIsSave(false);
                SheetManager.hide('ref_saveImage');
              }}
              style={styles.actionButtonCancel}
            >
              <Text style={styles.actionButtonCancelText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={() => saveImage()}
              style={styles.actionButtonConfirm}
            >
              <Text style={styles.actionButtonConfirmText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
      <Modal visible={visibleModal} style={styles.modalEdit}>
        <ModalEditImage
          itemPhoto={currentImage}
          data={data}
          onClose={handlerCloseModal}
          appcolor={appcolor}
          sortFeild={sortFeild}
        />
      </Modal>
    </SafeAreaView>
  );
};

const ShowImage = ({
  item,
  index,
  appcolor,
  titleFeild,
  viewShotRef,
  isSave,
  isShowText,
  isShowTitle,
  imageProps,
}) => {
  const imageStyle = imageProps?.style || {};
  const shotWidth = imageStyle.width || item.widthViewShot || deviceWidth;
  const shotHeight = imageStyle.height || item.heightViewShot || deviceHeight;
  const styles = StyleSheet.create({
    container: {
      width: shotWidth,
      height: shotHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewShot: {
      width: shotWidth,
      height: shotHeight,
      backgroundColor: appcolor.dark,
    },
    titleWrap: {
      width: '100%',
      padding: 8,
      position: 'absolute',
      top: 72,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleText: {
      fontWeight: '700',
      fontSize: 18,
      color: appcolor.dark,
      letterSpacing: -0.3,
    },
    textOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      right: 0,
      top: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'space-between',
    },
    topTextWrap: { paddingLeft: 12, paddingTop: 8 },
    bottomTextWrap: { paddingRight: 12, paddingBottom: 8 },
    overlayTextLeft: {
      color: appcolor.danger,
      width: '100%',
      fontWeight: '600',
      textAlign: 'left',
      fontSize: 10,
    },
    overlayTextRight: {
      color: appcolor.danger,
      width: '100%',
      fontWeight: '600',
      textAlign: 'right',
      fontSize: 10,
    },
    watermark: { height: 300, opacity: 0.5, width: '100%' },
  });
  return item.photoPath ? (
    <View style={styles.container}>
      <ViewShot
        style={styles.viewShot}
        ref={shot => (viewShotRef[`${index}`] = shot)}
        options={{ format: 'jpg', quality: 0.8 }}
      >
        {isShowTitle === true && (
          <View style={styles.titleWrap}>
            <Text style={styles.titleText}>{item[titleFeild] || ''}</Text>
          </View>
        )}
        {item?.photoPath?.includes('uploaded') ||
          item.photoPath.indexOf('https://') > -1 ? (
          <CacheImage
            source={{
              uri: getDisplayPhotoPath(item.photoPath),
            }}
          />
        ) : (
          <ImageZoom ImagePath={item.photoPath} />
        )}
        {isShowText && isSave && (
          <View style={styles.textOverlay}>
            <View style={styles.topTextWrap}>
              {item.titleView && (
                <Text style={styles.overlayTextLeft}>
                  {`${item.titleView}`}
                </Text>
              )}
              {(item.nameView || item.codeView) && (
                <Text style={styles.overlayTextLeft}>
                  {`${item.nameView || ''} [${item.codeView?.toUpperCase()}]`}
                </Text>
              )}
            </View>
            {(URLDEFAULT.includes('spiral') ||
              URLDEFAULT.includes('sucbat')) && (
                <ImageBackground
                  source={require('../Themes/Images/watermark.png')}
                  resizeMode={'contain'}
                  style={styles.watermark}
                />
              )}
            <View style={styles.bottomTextWrap}>
              {item.timeView && (
                <Text style={styles.overlayTextRight}>
                  {`${item.timeView}`}
                </Text>
              )}
            </View>
          </View>
        )}
      </ViewShot>
    </View>
  ) : (
    <View></View>
  );
};

const ModalEditImage = gestureHandlerRootHOC(
  ({ appcolor, data, onClose, itemPhoto, showReview = false, sortFeild }) => {
    const [ImagePath, setImagePath] = useState('');
    const [pathReview, setPathReview] = useState('');
    const [viewSize, setViewSize] = useState({
      widthViewShot: 0,
      heightViewShot: 0,
    });
    const [isShowReview, setShowReview] = useState(showReview);
    const viewShot = useRef();
    const [idRandom, setIdRandom] = useState();
    const styles = StyleSheet.create({
      root: { flex: 1, justifyContent: 'center' },
      reviewContainer: { width: '100%', height: '100%' },
      reviewBody: { flex: 1, justifyContent: 'center' },
      reviewShot: {
        width: viewSize.widthViewShot === 0 ? '100%' : viewSize.widthViewShot,
        height: viewSize.heightViewShot === 0 ? '80%' : viewSize.heightViewShot,
      },
      textOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        right: 0,
        top: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'space-between',
      },
      topTextWrap: { paddingLeft: 12, paddingTop: 8 },
      bottomTextWrap: { paddingRight: 12, paddingBottom: 8 },
      overlayTextLeft: {
        color: appcolor.danger,
        width: '100%',
        fontWeight: '600',
        textAlign: 'left',
        fontSize: 10,
      },
      overlayTextRight: {
        color: appcolor.danger,
        width: '100%',
        fontWeight: '600',
        textAlign: 'right',
        fontSize: 10,
      },
      watermark: { height: 300, opacity: 0.5, width: '100%' },
      drawContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: appcolor.black,
      },
    });
    useEffect(() => {
      loadData();
      getRandomId();
      return () => false;
    }, []);
    const getRandomId = () => {
      let idRandom = Math.floor(Math.random() * 100000) + 1;
      const arrDuplicate = data.listImage.filter(it => it.id === idRandom);
      if (arrDuplicate?.length > 0) {
        getRandomId();
      } else {
        setIdRandom(idRandom);
        return;
      }
    };
    const loadData = async () => {
      const name = itemPhoto.photoPath.substring(
        itemPhoto.photoPath.lastIndexOf('/') + 1,
        itemPhoto.photoPath?.length,
      );
      const extension = Platform.OS === 'android' ? 'file://' : '';
      const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
      const pathFile = itemPhoto.photoPath.includes('uploaded')
        ? `${path}${name}`
        : itemPhoto.photoPath;
      await setImagePath(pathFile);
    };

    const onSaveImage = async success => {
      if (success) {
        await setPathReview(await success);
        await setShowReview(true);
        Image.getSize(
          await success,
          (width, height) => {
            setViewSize({
              widthViewShot: deviceWidth,
              heightViewShot: height * (deviceWidth / width),
            });
          },
          () => { },
        );
      } else {
        alert('Xảy ra lỗi khi lưu!');
        onClose(false);
      }
    };

    const SavePhoto = async () => {
      Message(
        'Chú ý',
        'Sau khi lưu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        async () => {
          let timePhotoInsert = await parseInt(
            moment(new Date()).format('YYYYMMDDHHmmss'),
          );
          const guiId = UUIDGenerator();
          const fileName = guiId + '.jpg';
          const viewShotBase64 = await viewShot.current.capture();
          const extension = Platform.OS === 'android' ? 'file://' : '';
          const path = `${extension}${Platform.OS === 'android'
              ? RNFS.PicturesDirectoryPath
              : RNFS.LibraryDirectoryPath
            }/${APPNAME}/`;
          const file_path = `${path}${fileName}`;

          RNFS.mkdir(path).catch(() => { });
          RNFS.writeFile(file_path, viewShotBase64, 'base64').catch(error => {
            alert(JSON.stringify(error));
          });

          let itemGroup = {
            ...itemPhoto,
            id: idRandom,
            photoTime: timePhotoInsert,
            photoPath: file_path,
          };

          let itemUpload = {
            dataUpload: 0,
            fileUpload: 0,
            latitude: itemPhoto.latitude || 0,
            longitude: itemPhoto.longitude || 0,
            photoDate:
              itemPhoto.photoDate || moment(new Date()).format('YYYYMMDD'),
            photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            photoTime: timePhotoInsert,
            photoType: itemPhoto.photoType,
            reportId: itemPhoto.reportId,
            shopId: itemPhoto.shopId,
            shopCode: itemPhoto.wShopCode,
            shopLat: itemPhoto.shopLat,
            shopLong: itemPhoto.shopLong,
            photoPath: file_path,
            guid: guiId,
          };
          await InsertPhotosItem(itemUpload);
          const arrListPhoto = [...data.listImage, itemGroup];
          data.listImage = arrListPhoto.sort(
            (a, b) => a[sortFeild] - b[sortFeild],
          );
          await onClose(true);
          await alert('Đã lưu chỉnh sửa');
        },
      );
    };
    const onGobackReview = async () => {
      await setShowReview(false);
      await setPathReview('');
    };
    return (
      <View style={styles.root}>
        {isShowReview ? (
          <View style={styles.reviewContainer}>
            <HeaderCustom
              iconRight={'save'}
              leftFunc={() => onGobackReview()}
              rightFunc={() => SavePhoto()}
            />
            <View style={styles.reviewBody}>
              <ViewShot
                style={styles.reviewShot}
                ref={viewShot}
                options={{ format: 'jpg', quality: 0.8, result: 'base64' }}
              >
                <ImageZoom ImagePath={pathReview} />
                <View style={styles.textOverlay}>
                  <View style={styles.topTextWrap}>
                    <Text style={styles.overlayTextLeft}>
                      {`${itemPhoto.address}`}
                    </Text>
                    <Text style={styles.overlayTextLeft}>
                      {`${itemPhoto.shopName
                        } [${itemPhoto.wShopCode?.toUpperCase()}]`}
                    </Text>
                  </View>
                  {(URLDEFAULT.includes('spiral') ||
                    URLDEFAULT.includes('sucbat')) && (
                      <Image
                        source={require('../Themes/Images/watermark.png')}
                        resizeMode={'contain'}
                        style={styles.watermark}
                      ></Image>
                    )}
                  <View style={styles.bottomTextWrap}>
                    <Text style={styles.overlayTextRight}>
                      {`${itemPhoto.photoFullTime}`}
                    </Text>
                  </View>
                </View>
              </ViewShot>
            </View>
          </View>
        ) : (
          <SafeAreaView style={styles.drawContainer}>
            {ImagePath !== '' && ImagePath?.length > 0 && (
              <DrawWithOptions
                close={() => onClose(false)}
                takeSnapshot={uri => onSaveImage(uri)}
                linearGradient={LinearGradient}
                image={{ uri: ImagePath }}
              ></DrawWithOptions>
            )}
          </SafeAreaView>
        )}
      </View>
    );
  },
);
