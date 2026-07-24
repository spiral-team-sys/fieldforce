import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/themed';
import {
  groupDataByKey,
  removeVietnameseTones,
} from '../../../../../Core/Helper';
import FormGroup from '../../../../../Content/FormGroup';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import { FlashList } from '@shopify/flash-list';
import NativeCamera from '../../../../../Control/NativeCamera';
import { getDataPhotos } from '../../../../../Controller/PhotoController';
import { optionConfirm, TODAY } from '../../../../../Core/Utility';
import { MultipleShowImage } from '../../../../../Control/MultipleShowImage';
import moment from 'moment';
import _ from 'lodash';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

export const ReasonList = ({ data, info }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [dataReason, setDataReason] = useState([]);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [images, _setImages] = useState({ data: [], isShow: false, index: 0 });
  const [_mutate, setMutate] = useState(false);
  //
  const LoadData = async () => {
    await getDataPhotos(
      info.shopId,
      TODAY,
      'OT_EVIDENT',
      kpiinfo.id,
      info.guid,
      false,
      setDataPhoto,
    );
    const { arr } = groupDataByKey({
      arr: data,
      key: 'ReasonType',
    });
    await setDataMain(arr);
    await setDataReason(arr);
  };
  // Handler
  const onItemChoose = item => {
    item.reasonId = item.ReasonId;
    item.reasonName = item.ReasonName;
    //
    const objectUpdate = { item, type: 'REASON' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    setMutate(e => !e);
  };
  const onChangeOther = (text, item) => {
    item.reasonId = item.ReasonId;
    item.reasonName = item.ReasonName;
    item.reasonOther = text;
    //
    const objectUpdate = { item, type: 'REASON' };
    DeviceEventEmitter.emit('UPDATE_REQUEST_INFO', objectUpdate);
    setMutate(e => !e);
  };
  const handlerSearchInfo = text => {
    const valueSearch = removeVietnameseTones(text).toLowerCase();
    const lstFilter = _.filter(dataMain, e => {
      return removeVietnameseTones(e.ReasonName)
        .toLowerCase()
        .match(valueSearch);
    });
    setDataReason(lstFilter);
  };
  const handlerTakePicture = async () => {
    let photoinfo = {
      photoType: 'OT_EVIDENT',
      dataUpload: 0,
      fileUpload: 0,
      shopId: info.shopId,
      reportId: kpiinfo.id,
      photoPath: null,
      guid: info.guid,
      photoDate: moment().format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    const options = [
      { text: 'Hủy' },
      {
        text: 'Chụp hình',
        onPress: async () =>
          await NativeCamera.cameraStart(photoinfo, LoadData),
      },
      {
        text: 'Thư viện',
        onPress: async () =>
          await NativeCamera.imageGalleryLaunch(photoinfo, LoadData),
      },
    ];
    optionConfirm('Hình ảnh chứng minh', 'Vui lòng chọn hình ảnh', options);
  };
  const handlerViewPicture = () => {
    images.data = dataPhoto;
    images.isShow = true;
    images.index = 0;
    setMutate(e => !e);
  };
  const onCloseShowImage = () => {
    images.data = [];
    images.isShow = false;
    images.index = 0;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [data]);

  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    itemMainContainer: {
      width: '100%',
      alignItems: 'center',
      padding: 5,
      paddingHorizontal: 5,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    inputContainer: {
      backgroundColor: appcolor.background,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 5,
    },
    inputStyle: { fontSize: 12, color: appcolor.homebackground },
    inputReasonStyle: { fontSize: 12, color: appcolor.dark },
    contentItem: { flex: 1 },
    itemContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 5,
    },
    titleMain: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.blacklight,
      padding: 5,
      paddingHorizontal: 0,
    },
    subTitleMain: { fontSize: 11, fontWeight: '500', color: appcolor.gray },
    viewIconSelected: { padding: 8, paddingStart: 0, justifyContent: 'center' },
    contentImage: { width: '100%', flexDirection: 'row' },
    viewCamera: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      marginHorizontal: 4,
      padding: 8,
      borderRadius: 8,
    },
    viewAlbum: {
      width: 100,
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      marginHorizontal: 4,
      padding: 8,
      borderRadius: 8,
    },
    titleCamera: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    viewCircle: {
      width: 18,
      height: 18,
      backgroundColor: appcolor.redgray,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 8,
      end: 8,
    },
    titleCount: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      onItemChoose(item);
    };
    const onChangeOtherNote = text => {
      onChangeOther(text, item);
    };
    const isChoose = info.reasonId == item.ReasonId;
    const colorChoose = isChoose ? appcolor.success : appcolor.grayLight;
    return (
      <View style={styles.itemMainContainer}>
        <View style={styles.itemContainer}>
          <View
            style={{ padding: 8, paddingStart: 0, justifyContent: 'center' }}
          >
            <SpiralIcon
              type="ionicon"
              name={isChoose ? 'checkmark-circle' : 'add-circle-outline'}
              size={24}
              color={colorChoose}
            />
          </View>
          <View style={{ width: '90%' }}>
            <TouchableOpacity key={`spi_${index}`} onPress={onPress}>
              <Text style={styles.titleMain}>{`${index + 1}. ${item.ReasonName
                }`}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {item.ReasonId == 100 && (
          <FormGroup
            value={info.reasonOther || null}
            editable
            multiline
            useClearAndroid={false}
            placeholder="Nhập lí do"
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputReasonStyle}
            handleChangeForm={onChangeOtherNote}
          />
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SearchData
        placeholder="Tìm kiếm lí do"
        iconName="comment-alt"
        inputStyle={styles.inputStyle}
        onSearchData={handlerSearchInfo}
      />
      <View style={styles.contentItem}>
        <View style={styles.contentImage}>
          <TouchableOpacity
            style={styles.viewCamera}
            onPress={handlerTakePicture}
          >
            <Text style={styles.titleCamera}>{`Hình ảnh chứng minh`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewAlbum}
            onPress={handlerViewPicture}
          >
            <SpiralIcon
              type="ionicon"
              name="images"
              size={18}
              color={appcolor.primary}
            />
            <View style={styles.viewCircle}>
              <Text style={styles.titleCount}>{dataPhoto.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          data={dataReason}
          extraData={[dataReason]}
          renderItem={renderItem}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ paddingBottom: 32 }} />}
        />
      </View>
      <Modal visible={images.isShow}>
        <MultipleShowImage
          key="showimageot"
          listItem={images.data || []}
          indexItem={images.index}
          closeShowImage={onCloseShowImage}
        />
      </Modal>
    </View>
  );
};
