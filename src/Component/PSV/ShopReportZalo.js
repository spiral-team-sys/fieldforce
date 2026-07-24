import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Calendar } from 'react-native-calendars';
import { REPORT } from '../../API/ReportAPI';
import moment from 'moment';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import {
  getSelectedPhotos,
  parsePhotoList,
  PhotoGallery,
} from './PhotoGallery';
import RNFS from 'react-native-fs';
import {
  formatHtmlToText,
  getPhotoUri,
  onShareLocalFile,
} from '../../Core/Helper';
import { LoadingView } from '../../Control/ItemLoading';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { deviceHeight } from '../../Core/Utility';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  clearPhotoReportZalo,
  getPhotoReportZalo,
} from '../../Controller/PhotoController';
import CustomListView from '../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const isWorkingPlanItem = item =>
  `${item?.TableName || item?.tableName || ''}`.toLowerCase() === 'workingplan';
const TOUCH_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export const ShopReportZalo = ({ route, navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [selected, setSelected] = useState('');
  const [data, setData] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const [content, setContent] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataImage, setDataImages] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const { dataMain, date } = route.params;
  const isWorkingPlan = isWorkingPlanItem(dataMain);
  const reportDate = moment(selected || date || new Date()).format('YYYYMMDD');
  const refShoot = useRef(null);

  useEffect(() => {
    LoadData();
  }, [reloadData, reportDate]);

  useEffect(() => {
    LoadReport();
  }, []);

  const LoadReport = async () => {
    setLoading(true);
    if (isWorkingPlan) {
      setData([dataMain]);
      setLoading(false);
      return;
    }
    const result = await REPORT.GetDataReportZalo(reportDate, dataMain.ShopId);
    setData(result?.data);
    setLoading(false);
  };

  const LoadData = async () => {
    if (isWorkingPlan) {
      setDataImages([]);
      return;
    }
    const localImage = await getPhotoReportZalo(
      dataMain.ShopId,
      kpiinfo.id,
      reportDate,
    );
    if (localImage.length > 0) {
      setDataImages(parsePhotoList(localImage[0].jsonPhoto));
    } else {
      setDataImages([]);
    }
  };
  const onShowImage = photo => {
    const updatePhoto = photo.map(e => ({ ...e, photoPath: e.PhotoPath }));
    itemShowImage.visible = true;
    itemShowImage.index = 0;
    itemShowImage.photos = updatePhoto;
    setMutate(e => !e);
  };
  const shareScreen = async item => {
    setIsLoading(true);
    try {
      const isWorkingPlanEntry = isWorkingPlanItem(item);
      const joinedString = formatHtmlToText(item.Template || '');
      const textMessage = `${content || joinedString}`;
      Clipboard.setString(textMessage);

      if (isWorkingPlanEntry) {
        const option = { title: 'Tin nhắn', message: textMessage };
        await onShareLocalFile(option, () => { });
        return;
      }

      const urlImages = [];
      const ref = refShoot;
      const reportPhotos = parsePhotoList(item?.PhotoList);
      const filterPhotos = getSelectedPhotos(reportPhotos, dataImage);

      await captureRef(ref, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      }).then(uri => {
        // Platform.OS === 'android' ? urlImages.push(`file://${uri}`) : null
      });

      const downloadPromises = filterPhotos.map(async (imageUrl, i) => {
        let extension = Platform.OS === 'android' ? 'file://' : '';
        let albumPath = `${extension}${Platform.OS === 'android'
            ? RNFS.PicturesDirectoryPath
            : RNFS.LibraryDirectoryPath
          }`;
        let fileName = `${new Date().getTime()}_${i}.png`;
        let filePathInAlbum = `${albumPath}/${fileName}`;
        urlImages.push(filePathInAlbum);
        const photoPath = getPhotoUri(imageUrl?.PhotoPath);
        if (!photoPath) return;

        await RNFS.downloadFile({
          fromUrl:
            Platform.OS === 'android'
              ? `${photoPath}`
              : `${photoPath}`.replace(/\\/g, '//'),
          toFile: filePathInAlbum,
          background: true,
          discretionary: true,
          progressDivider: 10,
          cacheable: true,
        }).promise;
      });
      await Promise.all(downloadPromises);
      const url = urlImages.length > 1 ? 'urls' : 'url';
      const option = {
        title: 'Tin nhắn',
        message: textMessage,
        [url]: urlImages.length > 1 ? urlImages : urlImages[0],
        type: 'image/png',
      };
      await onShareLocalFile(option, () =>
        clearPhotoReportZalo(
          dataMain.ShopId,
          kpiinfo.id,
          setDataImages,
          reportDate,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };
  const onShowImages = (photos, ShopId, configData) => {
    SheetManager.show('displayimages-sheet', {
      payload: { data: photos, id: ShopId, config: configData },
    });
  };
  const handlerHideImage = () => {
    itemShowImage.visible = false;
    itemShowImage.index = 0;
    itemShowImage.photos = [];
    setMutate(e => !e);
  };
  const onHideImages = () => {
    SheetManager.hide('displayimages-sheet');
  };
  const handleDayPress = async day => {
    setSelected(day.dateString);
    if (isWorkingPlan) {
      return;
    }
    const workDate = moment(day.dateString).format('YYYYMMDD');
    const result = await REPORT.GetDataReportZalo(workDate, dataMain.ShopId);
    setData(result?.data);
  };
  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: appcolor.surface },
    content: { flex: 1 },
    keyboardView: { flex: 1 },
    emptyState: {
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderRadius: 16,
      justifyContent: 'center',
      margin: 16,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    emptyIcon: { marginBottom: 12 },
    emptyText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    emptyAction: {
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      borderRadius: 12,
      justifyContent: 'center',
      marginTop: 16,
      minHeight: 44,
      paddingHorizontal: 16,
    },
    emptyActionText: { color: appcolor.light, fontSize: 14, fontWeight: '600' },
    itemRoot: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    reportCard: {
      backgroundColor: appcolor.light,
      borderRadius: 16,
      elevation: 1,
      padding: 16,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    reportHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    reportTitleWrap: { flex: 1, paddingRight: 12 },
    reportTitle: {
      color: appcolor.primary,
      fontSize: 16,
      fontWeight: fontWeightBold,
      letterSpacing: -0.3,
    },
    reportSubtitle: {
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
    },
    reportIconWrap: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 16,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    viewShot: { width: '100%', backgroundColor: appcolor.light },
    inputWrap: {
      backgroundColor: appcolor.surface,
      borderRadius: 12,
      padding: 12,
    },
    reportInput: {
      color: appcolor.dark,
      fontSize: 14,
      minHeight: 160,
      padding: 0,
      textAlignVertical: 'top',
      width: '100%',
    },
    actionCard: {
      backgroundColor: appcolor.light,
      borderTopColor: appcolor.surface,
      borderTopWidth: 1,
      marginTop: 16,
      paddingTop: 16,
    },
    imageHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    imageTitleWrap: { alignItems: 'center', flexDirection: 'row' },
    imageIconWrap: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 12,
      height: 36,
      justifyContent: 'center',
      marginRight: 8,
      width: 36,
    },
    imageTitle: {
      color: appcolor.dark,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    imageBadge: {
      backgroundColor: appcolor.danger,
      borderRadius: 9999,
      marginLeft: 8,
      minWidth: 24,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    imageBadgeText: { color: appcolor.light, fontSize: 12, fontWeight: 'bold' },
    chooseImageButton: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
    },
    chooseImageText: {
      color: appcolor.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    imageButton: { marginRight: 12 },
    imageList: { height: 116, width: '100%' },
    imageListContent: { flexDirection: 'row', paddingRight: 4 },
    images: {
      width: 128,
      height: 96,
      borderRadius: 12,
      backgroundColor: appcolor.grey,
    },
    imageEmpty: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 12,
      flexDirection: 'row',
      minHeight: 72,
      paddingHorizontal: 16,
    },
    imageEmptyText: {
      color: appcolor.dark,
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 12,
    },
    shareWrap: { alignItems: 'center', marginTop: 16 },
    shareButton: {
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      borderRadius: 16,
      elevation: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: 20,
      paddingVertical: 12,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      width: '100%',
    },
    shareIcon: { marginRight: 8 },
    shareText: { color: appcolor.light, fontSize: 14, fontWeight: '600' },
    hiddenListEmpty: { height: 0 },
    listContent: { paddingBottom: 24 },
    footerSpace: { paddingBottom: deviceHeight / 10 },
    calendarSheet: { backgroundColor: appcolor.light },
    calendarActionSheetContainer: {
      backgroundColor: appcolor.light,
      paddingBottom: insets.bottom,
    },
    actionSheetContainer: {
      backgroundColor: appcolor.light,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      paddingBottom: insets.bottom,
    },
    photoGallerySheet: { width: '100%', height: '100%' },
    photoGallery: { flex: 1, paddingHorizontal: 20 },
  });

  const renderImages = (item, index) => {
    const photoPath = getPhotoUri(item?.PhotoPath);
    const onPress = () => {
      onShowImage(dataImage.filter(e => e.isChoose));
    };
    return (
      <View key={`${item?.PhotoID || item?.PhotoPath || 'photo'}_${index}`}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={TOUCH_HIT_SLOP}
          onPress={onPress}
          style={styles.imageButton}
        >
          {photoPath ? (
            <Image
              resizeMode="cover"
              source={{ uri: photoPath }}
              style={styles.images}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const PhotoList = parsePhotoList(item?.PhotoList);
    const selectedImages = getSelectedPhotos(PhotoList, dataImage);
    const sumImages = selectedImages.length;
    const showAllImages = () => {
      onShowImages(PhotoList, item.ShopId, item.Config);
    };
    const onShare = () => {
      shareScreen(item);
    };
    const joinedString = formatHtmlToText(item.Template || '');
    return (
      <View style={styles.itemRoot} key={index}>
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportTitleWrap}>
              <Text style={styles.reportTitle}>{'Nội dung báo cáo'}</Text>
              <Text style={styles.reportSubtitle}>
                {isWorkingPlanItem(item)
                  ? 'Lịch làm việc'
                  : dataMain.ShopCode || dataMain.ShopName || ''}
              </Text>
            </View>
            <View style={styles.reportIconWrap}>
              <SpiralIcon
                color={appcolor.primary}
                name="file-text"
                size={22}
                type="feather"
              />
            </View>
          </View>
          <ViewShot
            style={styles.viewShot}
            ref={refShoot}
            options={{
              fileName: 'fileName',
              format: 'png',
              quality: 1,
            }}
          >
            <View style={styles.inputWrap}>
              <TextInput
                scrollEnabled={false}
                style={styles.reportInput}
                multiline={true}
                defaultValue={joinedString}
                onChangeText={text => setContent(text)}
              />
            </View>
          </ViewShot>
          {item.Template ? (
            <View style={styles.actionCard}>
              {!isWorkingPlanItem(item) ? (
                <>
                  <View style={styles.imageHeader}>
                    <View style={styles.imageTitleWrap}>
                      <View style={styles.imageIconWrap}>
                        <SpiralIcon
                          color={appcolor.primary}
                          name="image"
                          size={18}
                          type="feather"
                        />
                      </View>
                      <Text style={styles.imageTitle}>{'Hình ảnh'}</Text>
                      {sumImages > 0 ? (
                        <View style={styles.imageBadge}>
                          <Text style={styles.imageBadgeText}>{sumImages}</Text>
                        </View>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      hitSlop={TOUCH_HIT_SLOP}
                      onPress={showAllImages}
                      style={styles.chooseImageButton}
                    >
                      <SpiralIcon
                        color={appcolor.primary}
                        name="plus"
                        size={16}
                        type="feather"
                      />
                      <Text style={styles.chooseImageText}>{'Chọn hình'}</Text>
                    </TouchableOpacity>
                  </View>

                  {sumImages > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.imageList}
                      contentContainerStyle={styles.imageListContent}
                    >
                      {selectedImages.map(renderImages)}
                    </ScrollView>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      hitSlop={TOUCH_HIT_SLOP}
                      onPress={showAllImages}
                      style={styles.imageEmpty}
                    >
                      <SpiralIcon
                        color={appcolor.primary}
                        name="image-plus"
                        size={22}
                        type="material-community"
                      />
                      <Text style={styles.imageEmptyText}>
                        {'Chưa chọn hình ảnh. Nhấn để chọn hình gửi kèm.'}
                      </Text>
                      <SpiralIcon
                        color={appcolor.primary}
                        name="chevron-right"
                        size={18}
                        type="feather"
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : null}

              <View style={styles.shareWrap}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={onShare}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  hitSlop={TOUCH_HIT_SLOP}
                >
                  {isLoading ? (
                    <ActivityIndicator color={appcolor.light} />
                  ) : (
                    <>
                      <SpiralIcon
                        color={appcolor.light}
                        name="share-2"
                        size={18}
                        style={styles.shareIcon}
                        type="feather"
                      />
                      <Text style={styles.shareText}>{'Chia sẻ nội dung'}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <HeaderCustom
        title={dataMain.ShopName || 'Lịch làm việc'}
        leftFunc={() => navigation.goBack()}
      />
      {loading ? <LoadingView isLoading={loading} title=" " /> : null}
      <View style={styles.content}>
        {data?.[0]?.Template == undefined && !loading ? (
          <View style={styles.emptyState}>
            <SpiralIcon
              color={appcolor.grey}
              name="inbox"
              size={28}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>{'Không có dữ liệu'}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={TOUCH_HIT_SLOP}
              onPress={LoadReport}
              style={styles.emptyAction}
            >
              <Text style={styles.emptyActionText}>{'Tải lại'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <CustomListView
            scrollEnabled={true}
            data={data || []}
            renderItem={renderItem}
            estimatedItemSize={50}
            extraData={[data, dataImage, reloadData]}
            showsVerticalScrollIndicator={false}
            ListEmpty={<View style={styles.hiddenListEmpty} />}
            containerStyle={styles.keyboardView}
            contentContainerStyle={styles.listContent}
          />
        </KeyboardAvoidingView>
      </View>
      <ActionSheet
        id="calender-sheet"
        containerStyle={styles.calendarActionSheetContainer}
      >
        <View style={styles.calendarSheet}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedDotColor: appcolor.primary,
              },
            }}
          />
        </View>
      </ActionSheet>
      <Modal visible={itemShowImage.visible}>
        <MultipleShowImage
          key="showimageprofile"
          listItem={itemShowImage.photos || []}
          indexItem={itemShowImage.index}
          closeShowImage={handlerHideImage}
        />
      </Modal>
      <ActionSheet
        id="displayimages-sheet"
        drawUnderStatusBar={true}
        containerStyle={styles.actionSheetContainer}
        onBeforeShow={setImages}
      >
        <View style={styles.photoGallerySheet}>
          <View style={styles.photoGallery}>
            <PhotoGallery
              dataMain={dataMain}
              data={images.data}
              shopId={images.id}
              reportDate={reportDate}
              onHide={onHideImages}
              config={images.config}
              reloadData={setReloadData}
              onApplyPhotos={setDataImages}
            />
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
