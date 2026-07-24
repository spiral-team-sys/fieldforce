import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Icon, Button, Badge } from '@rneui/themed';
import { AppNameBuild, mitsuApp, nokiaApp, psvApp } from '../Core/URLs';
import Moment from 'moment';
import { ToastError, ToastSuccess } from '../Core/Helper';
import ActionSheet from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../Themes/AppsStyle';
import { HeaderCustom } from './HeaderCustom';
import FormGroup from './FormGroup';
import {
  InsertItemsPromotion,
  updateItemsPromotion,
} from '../Controller/PromotionController';
import { getPhotosReportByGuiId } from '../Controller/WorkController';
import NativeCamera from '../Control/NativeCamera';
import { Calendar } from 'react-native-calendars';
import ViewPictures from '../Control/Gallary/ViewPictures';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const itemDetail = {
  categoryId: null,
  categoryName: '',
  competitorId: null,
  competitorName: '',
  promotionId: 0,
  titlePromotion: '',
  content: '',
  fromDate: new Date(),
  toDate: new Date(),
  guiId: null,
  upload: 0,
};
/**
 * Config
 * isCheckTitle : kiểm tra tựa đề chương trình
 * isCheckImage : kiểm tra hình ảnh chương trình
 * isCheckContent : kiểm tra nội dung chương trình
 */

export function PromotionModel({
  Categories,
  Competitors,
  guiId,
  Closed,
  navigation,
  loaddata,
  loading,
  ItemSaved,
  loadHistory,
  listReport,
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('');
  const [typeDate, setTypeDate] = useState();
  const bottomSheet = useRef();
  const [compeRef, setCompeRef] = useState(null);
  const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
  const [numPhoto, setNumPhoto] = useState(0);
  const [itemShow, setItemShow] = useState(itemDetail);
  const [pictureShow, setPictureShow] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const GuiID = loadHistory ? ItemSaved.guiId : guiId;

  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [Moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    markingTypeDefault: 'custom',
    markingType: 'custom',
    markedDates: {
      [Moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    isStartDay: false,
    isEndDay: false,
    startDate: '',
    endDate: '',
  });

  const countPhoto = async () => {
    let lst = await getPhotosReportByGuiId(
      kpiinfo.kpiId,
      GuiID,
      workinfo.shopId,
      workinfo.workDate,
    );
    await setNumPhoto(lst.length);
  };

  const loadData = () => {
    if (loadHistory) {
      let item = {
        ...itemShow,
        Id: ItemSaved.Id,
        categoryId: ItemSaved.categoryId,
        categoryName: ItemSaved.categoryName,
        competitorId: ItemSaved.competitorId,
        competitorName: ItemSaved.competitorName,
        content: ItemSaved.content,
        fromDate: ItemSaved.fromDate,
        guiId: ItemSaved.guiId,
        titlePromotion: ItemSaved.titlePromotion,
        toDate: ItemSaved.toDate,
        workId: ItemSaved.workId,
      };
      setItemShow(item);
    }
  };

  useEffect(() => {
    countPhoto();
    loadData();
  }, [loading]);

  // handle select date when change working status
  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      if (
        dataCalendar.startDate === dateString ||
        dateString < dataCalendar.startDate
      ) {
        await setDataCalendar({
          markedDates: dataCalendar.markedDatesDefault,
          markingType: dataCalendar.markingTypeDefault,
          isStartDay: false,
          isEndDay: false,
          startDate: '',
          endDate: '',
        });
      }
      if (!dataCalendar.isStartDay) {
        const markedDates = {};
        markedDates[dateString] = {
          startingDay: true,
          color: '#ffa500',
          textColor: appcolor.dark,
        };
        await setDataCalendar({
          ...dataCalendar,
          markedDates: markedDates,
          markingType: 'period',
          isStartDay: true,
          isEndDay: false,
          startDate: dateString,
          endDate: '',
        });
      } else {
        const markedDates = dataCalendar.markedDates;
        //
        let startDate = Moment(dataCalendar.startDate);
        let endDate = Moment(dateString);
        let range = endDate.diff(startDate, 'days');

        if (range > 0) {
          for (let i = 1; i <= range; i++) {
            let tempDate = startDate.add(1, 'day');
            tempDate = Moment(tempDate).format('YYYY-MM-DD');
            if (i < range) {
              markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
            } else {
              markedDates[tempDate] = {
                endingDay: true,
                color: '#ffa500',
                textColor: 'white',
              };
            }
          }
          await setDataCalendar({
            ...dataCalendar,
            markedDates: markedDates,
            markingType: 'period',
            isStartDay: false,
            isEndDay: true,
            startDate: dataCalendar.startDate,
            endDate: Moment(dateString).format('YYYY-MM-DD'),
          });
        }
      }
    } else {
      await setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
        markingType: dataCalendar.markingTypeDefault,
        isStartDay: false,
        isEndDay: false,
        startDate: '',
        endDate: '',
      });
    }
  };

  const showALbum = async () => {
    const photos = await getPhotosReportByGuiId(
      kpiinfo.kpiId,
      GuiID,
      workinfo.shopId,
      workinfo.workDate,
    );
    setPictureShow({ visible: true, photos, index: 0 });
  };
  const takePhoto = async () => {
    let item = {
      reportId: kpiinfo.kpiId,
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      photoType: 'PROMOTION',
      guid: GuiID,
      photoDate: workinfo.workDate,
      callBackReport: countPhoto,
    };
    // navigation.navigate('Camera', { ...item, callback: countPhoto() });
    await NativeCamera.cameraStart(item, result => {
      countPhoto(item, result);
    });
  };
  const uploadFile = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoType: 'PROMOTION',
      photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
      fileUpload: 0,
      dataUpload: 0,
      photoPath: null,
      guid: GuiID,
      photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, countPhoto);
  };
  const closeModal = () => {
    Closed();
    setItemShow(itemDetail);
    setDataCalendar({
      markedDatesDefault: {
        [Moment(new Date()).format('YYYY-MM-DD').toString()]: {
          selected: true,
          marked: true,
          selectedColor: appcolor.yellowdark,
        },
      },
      markingTypeDefault: 'custom',
      markingType: 'custom',
      markedDates: {
        [Moment(new Date()).format('YYYY-MM-DD').toString()]: {
          selected: true,
          marked: true,
          selectedColor: appcolor.yellowdark,
        },
      },
      isStartDay: false,
      isEndDay: false,
      startDate: '',
      endDate: '',
    });
  };
  const Save = async () => {
    if (itemShow.competitorId == null || itemShow.competitorId == undefined) {
      ToastError('Bạn chưa chọn hãng');
      return;
    }
    if (AppNameBuild !== nokiaApp) {
      if (itemShow.categoryId == null || itemShow.categoryId == undefined) {
        ToastError('Bạn chưa chọn ngành hàng');
        return;
      }
    }

    let fromdateConvert =
      parseInt(Moment(dataCalendar.startDate.toString()).format('YYYYMMDD')) ||
      parseInt(Moment(itemShow.fromDate.toString()).format('YYYYMMDD'));

    let todateConvert =
      parseInt(Moment(dataCalendar.endDate.toString()).format('YYYYMMDD')) ||
      (dataCalendar.startDate
        ? parseInt(Moment(dataCalendar.startDate.toString()).format('YYYYMMDD'))
        : parseInt(Moment(itemShow.toDate.toString()).format('YYYYMMDD')));

    if (fromdateConvert > todateConvert) {
      ToastError('Vui lòng chọn (từ ngày) sau (đến ngày)');
      return;
    }

    if (listReport.isCheckTitle == 1) {
      if (
        itemShow.titlePromotion === null ||
        itemShow.titlePromotion === '' ||
        itemShow.titlePromotion === undefined ||
        itemShow.titlePromotion === 'undefined'
      ) {
        ToastError('Vui lòng không để trống tựa đề chương trình.');
        return;
      }

      if (itemShow.titlePromotion.replace(/ /g, '').length < 5) {
        ToastError('Tựa đề chương trình ngắn, nhập ít nhất 5 ký tự');
        return;
      }
    }
    if (listReport.isCheckContent == 1) {
      if (
        itemShow.content === null ||
        itemShow.content === '' ||
        itemShow.content === undefined ||
        itemShow.content === 'undefined'
      ) {
        ToastError('Vui lòng không để trống nội dung.');
        return;
      }
      if (itemShow.content.replace(/ /g, '').length < 5) {
        ToastError('Nội dung ngắn, nhập ít nhất 5 ký tự');
        return;
      }
    }
    if (listReport.isCheckImage == 1 && numPhoto == 0) {
      ToastError(
        `Vui lòng chụp hình ảnh chương trình, ít nhất ${
          listReport.limitPhoto || 1
        } tấm hình`,
      );
      return;
    }

    if (AppNameBuild === mitsuApp) {
      if (
        itemShow.titlePromotion === null ||
        itemShow.titlePromotion === '' ||
        itemShow.titlePromotion === undefined ||
        itemShow.titlePromotion === 'undefined'
      ) {
        ToastError('Vui lòng không để trống tựa đề chương trình.');
        return;
      }

      if (itemShow.titlePromotion.length < 5) {
        ToastError('Tựa đề chương trình ngắn, nhập ít nhất 5 ký tự');
        return;
      }

      if (
        itemShow.content === null ||
        itemShow.content === '' ||
        itemShow.content === undefined ||
        itemShow.content === 'undefined'
      ) {
        ToastError('Vui lòng không để trống nội dung.');
        return;
      }

      if (itemShow.content.length < 5) {
        ToastError('Nội dung ngắn, nhập ít nhất 5 ký tự');
        return;
      }
    }

    if (AppNameBuild === psvApp) {
      if (
        itemShow.content === null ||
        itemShow.content === '' ||
        itemShow.content === undefined ||
        itemShow.content === 'undefined'
      ) {
        ToastError('Vui lòng không để trống nội dung.');
        return;
      }
      if (itemShow.content.replace(/ /g, '').length < 5) {
        ToastError('Nội dung ngắn, nhập ít nhất 5 ký tự');
        return;
      }
    }

    // Save
    let item = {
      workId: loadHistory ? itemShow.workId : workinfo.workId,
      categoryId: itemShow.categoryId,
      categoryName: itemShow.categoryName,
      competitorId: itemShow.competitorId,
      competitorName: itemShow.competitorName,
      promotionId: 0,
      titlePromotion: itemShow.titlePromotion,
      content: itemShow.content,
      fromDate: fromdateConvert,
      toDate: todateConvert,
      guiId: GuiID,
      upload: 0,
    };
    let result = false;
    if (loadHistory) {
      item.Id = itemShow.Id;
      result = await updateItemsPromotion(item);
    } else {
      result = await InsertItemsPromotion(item);
    }

    if (result) {
      closeModal();
      ToastSuccess('Lưu thành công!');
    }
  };
  const onSelectItem = (item, type) => {
    if (type == 'CATEGORY') {
      // setSelectedCategories(item);
      setItemShow({
        ...itemShow,
        categoryId: item.id,
        categoryName: item.name,
      });
    } else if (type == 'COMPE') {
      // setSelectedCompetitor(item);
      setItemShow({
        ...itemShow,
        competitorId: item.id,
        competitorName: item.name,
      });
    }
  };
  const RenderItemCate = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          padding: 8,
          minWidth: deviceWidth * 0.2,
          justifyContent: 'center',
          backgroundColor:
            itemShow.categoryId === item.id
              ? appcolor.primary
              : appcolor.surface,
          marginBottom: 5,
          alignItems: 'center',
          borderRadius: 50,
          marginHorizontal: 5,
        }}
        onPress={() => {
          onSelectItem(item, 'CATEGORY');
        }}
      >
        <Text
          style={{
            color:
              itemShow.categoryId === item.id ? appcolor.white : appcolor.dark,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  const scrollOnPress = index => {
    compeRef.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };
  const RenderItemCompe = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 50,
          marginHorizontal: 5,
          backgroundColor:
            itemShow.competitorId === item.id
              ? appcolor.primary
              : appcolor.surface,
          marginBottom: 5,
          padding: 10,
          minWidth: deviceWidth * 0.2,
        }}
        onPress={() => {
          onSelectItem(item, 'COMPE');
          scrollOnPress(index);
        }}
      >
        <Text
          style={{
            color:
              itemShow.competitorId === item.id
                ? appcolor.white
                : appcolor.dark,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  const selectItem = () => {
    bottomSheet.current.show();
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconLeft={'times'}
        leftFunc={() => closeModal()}
        iconRight={'save'}
        rightFunc={() => Save()}
      />
      <View style={{ margin: 10, flex: 1, backgroundColor: appcolor.light }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              marginTop: 10,
              paddingBottom: 5,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: appcolor.dark,
                margin: 5,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Hãng :{' '}
            </Text>
            <FlatList
              ref={ref => setCompeRef(ref)}
              horizontal
              data={Competitors}
              renderItem={RenderItemCompe}
              keyExtractor={(item, index) => `message ${index}`}
              style={{ width: '100%' }}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          {AppNameBuild !== nokiaApp && (
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: appcolor.dark,
                  margin: 5,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                Ngành hàng :{' '}
              </Text>
              <FlatList
                horizontal
                data={Categories}
                renderItem={RenderItemCate}
                keyExtractor={(item, index) => `message ${index}`}
                style={{ width: '100%' }}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {AppNameBuild !== nokiaApp && (
            <View>
              <View
                style={{ flex: 1, flexDirection: 'row', alignSelf: 'center' }}
              >
                <View
                  style={{
                    width: '100%',
                    marginTop: 5,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: appcolor.dark,
                      fontSize: 14,
                      fontWeight: '600',
                      width: '10%',
                    }}
                  >
                    Ngày
                  </Text>
                  <View
                    style={{
                      width: '90%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 5,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        width: '100%',
                        padding: 8,
                        backgroundColor: appcolor.surface,
                        borderWidth: 0.5,
                        borderColor: '#bbb',
                        borderRadius: 10,
                      }}
                      onPress={() => selectItem()}
                    >
                      <Text style={{ color: appcolor.dark, fontSize: 14 }}>
                        {Moment(
                          dataCalendar.startDate || itemShow.fromDate,
                        ).format('DD/MM/yyyy') +
                          ` - ` +
                          Moment(
                            dataCalendar.endDate ||
                              (dataCalendar.startDate
                                ? dataCalendar.startDate
                                : itemShow.toDate),
                          ).format('DD/MM/yyyy')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {AppNameBuild !== psvApp && (
                <View style={{ marginTop: 5 }}>
                  <FormGroup
                    rightFunc={() => {}}
                    containerStyle={{
                      borderWidth: 0.5,
                      borderColor: '#bbb',
                      borderRadius: 10,
                    }}
                    iconRightStyle={{ color: appcolor.primary }}
                    inputStyle={{ height: 80, maxHeight: 120 }}
                    multiline
                    title={'Tựa đề chương trình'}
                    placeholder={'Nhập tựa đề'}
                    value={itemShow.titlePromotion}
                    handleChangeForm={text =>
                      setItemShow({ ...itemShow, titlePromotion: text })
                    }
                    onClearTextAndroid={() =>
                      setItemShow({ ...itemShow, titlePromotion: '' })
                    }
                    placeholderTextColor={appcolor.greydark}
                    editable
                  />
                </View>
              )}
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            <FormGroup
              rightFunc={() => {}}
              containerStyle={{
                borderWidth: 0.5,
                borderColor: '#bbb',
                borderRadius: 10,
              }}
              iconRightStyle={{ color: appcolor.primary }}
              inputStyle={{ height: 80, maxHeight: 120 }}
              multiline
              title={'Nội dung'}
              placeholder={'Nhập nội dung'}
              defaultValue={itemShow.content}
              handleChangeForm={text =>
                setItemShow({ ...itemShow, content: text })
              }
              onClearTextAndroid={() =>
                setItemShow({ ...itemShow, content: '' })
              }
              placeholderTextColor={appcolor.greydark}
              editable
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            <Button
              containerStyle={{
                width: AppNameBuild !== psvApp ? '33%' : '49%',
                borderColor: 'gray',
                borderWidth: 1.0,
              }}
              buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
              onPress={e => {
                takePhoto();
              }}
              icon={
                <SpiralIcon
                  color={appcolor.dark}
                  name="camera"
                  type="ionicon"
                  size={30}
                />
              }
            />

            {listReport.isHideUpload !== 1 && (
              <Button
                containerStyle={{
                  width: '33%',
                  borderColor: 'gray',
                  borderWidth: 1.0,
                }}
                buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
                onPress={e => {
                  uploadFile();
                }}
                icon={
                  <SpiralIcon
                    color={appcolor.dark}
                    name="attach"
                    type="ionicon"
                    size={30}
                  />
                }
              />
            )}
            <Button
              containerStyle={{
                width: AppNameBuild !== psvApp ? '33%' : '49%',
                borderColor: 'gray',
                borderWidth: 1.0,
              }}
              buttonStyle={{ height: 45, backgroundColor: appcolor.surface }}
              onPress={showALbum}
              icon={
                <View>
                  <SpiralIcon
                    color={appcolor.dark}
                    name="photo"
                    type="font-awesome"
                    size={30}
                  />
                  <Badge
                    value={numPhoto || 0}
                    textStyle={{ fontSize: 12 }}
                    badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                    status="primary"
                    containerStyle={{
                      position: 'absolute',
                      top: -8,
                      right: -15,
                    }}
                  />
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
      <ActionSheet
        ref={bottomSheet}
        containerStyle={{
          backgroundColor: appcolor.grayLight,
          padding: 5,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
        defaultOverlayOpacity={0.3}
      >
        <View style={{ padding: 8, marginBottom: 20 }}>
          <Calendar
            firstDay={1}
            current={Moment().format('yyyy-MM-DD')}
            monthFormat={'MM - yyyy'}
            hideExtraDays={true}
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            theme={{
              backgroundColor: appcolor.light,
              calendarBackground: appcolor.light,
              todayTextColor: appcolor.highlightDate,
              selectedDayTextColor: 'blue',
              dayTextColor: appcolor.dark,
              monthTextColor: appcolor.dark,
            }}
            markingType={dataCalendar.markingType}
            markedDates={dataCalendar.markedDates}
            onDayPress={handlerSelectCalendar}
          />
        </View>
      </ActionSheet>
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.photos}
        initialIndex={pictureShow.index}
        onSwipeDown={() =>
          setPictureShow({ visible: false, photos: [], index: 0 })
        }
        isUseDelete
        onDeleteImage={countPhoto}
      />
    </View>
  );
}
