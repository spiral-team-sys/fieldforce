import React, { useState, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import PageHeader from '../Content/PageHeader';
import SpiralIcon from '../Control/Icon/SpiralIcon';

import FormGroup from '../Content/FormGroup';
import {
  getListImageAudit,
  getPhotoAudit,
  updateFSMValue,
  UploadPhotoTraining,
  UploadDataTraining,
} from '../Controller/TrainingController';
import { GetWorkInfoBy } from '../Controller/WorkController';
import { Badge } from '@rneui/themed';
////import { NumericFormat } from "react-number-format";;
import Geolocation from '@react-native-community/geolocation';
import { alertNotify } from '../Core/Utility';
import { useSelector } from 'react-redux';
import moment from 'moment';
import NativeCamera from '../Control/NativeCamera';
import ViewPictures from '../Control/Gallary/ViewPictures';
import { HeaderCustom } from '../Content/HeaderCustom';

const FieldCoaching = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [mWORK, setWorkInfo] = useState({});
  const [itemFilter, setItemFiler] = useState('Tất cả');
  const [dataList, setDataList] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [dataPhoto, setDataPhoto] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [dataModalBS, setDataModalBS] = useState({ data: [] });
  const [dataLocation, setDataLocation] = useState({
    Latitude: 0,
    Longitude: 0,
    Accuracy: 0,
  });
  const [pictureShow, setPictureShow] = useState({
    visible: false,
    photos: [],
    index: 0,
  });

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      info => {
        const latitude = info.coords.latitude;
        const longitude = info.coords.longitude;
        const accuracy = info.coords.accuracy;
        setDataLocation({
          Latitude: latitude,
          Longitude: longitude,
          Accuracy: accuracy,
        });
      },
      error => console.log(error.message),
    );
  };
  const LoadData = async () => {
    await getLocation();
    const dataAudit = await getListImageAudit();
    const photoAudit = await getPhotoAudit(route?.params.workinfo);
    const workInfo = await GetWorkInfoBy(
      route?.params.workinfo.shopId,
      route?.params.workinfo.workDate,
    );

    await setWorkInfo(workInfo[0]);
    await setDataModalBS({ data: dataAudit });
    await setDataList(dataAudit.filter(i => i.Id > 0));
    await setDataMain(dataAudit.filter(i => i.Id > 0));
    await setDataPhoto(photoAudit);
  };
  const uploadData = async () => {
    const itemUpload = {
      shopId: shopinfo.shopId,
      guiid: mWORK.guiid,
      reportId: kpiinfo.kpiId,
      fsmValue: mWORK.fsmValue,
      photoDate: mWORK.workDate,
      workDate: mWORK.workDate,
    };
    await UploadDataTraining(itemUpload, async message => {
      alertNotify(message);
      await UploadPhotoTraining(mWORK);
    });
  };
  const handlerCallBack = async () => {
    await LoadData();
  };
  const handlerFilter = async () => {
    setModalVisible(true);
  };
  const handlerFilterProduct = async text => {
    const keyword = `${text || ''}`.trim().toUpperCase();
    const listData =
      keyword.length > 0
        ? dataMain.filter(i =>
            `${i.name || ''}`.toUpperCase().includes(keyword),
          )
        : dataMain;
    await setDataModalBS({
      data: [{ Id: 0, code: '', name: 'Tất cả' }, ...listData],
    });
  };
  const onSelectItem = async itemChoose => {
    await setItemFiler(itemChoose.name);
    await setModalVisible(false);
    if (itemChoose.name === 'Tất cả') {
      await setDataList(dataMain);
    } else {
      await setDataList(dataMain.filter(i => i.name === itemChoose.name));
    }
  };
  const addTextChanged = async value => {
    await updateFSMValue(mWORK, value);
    const workInfo = await GetWorkInfoBy(mWORK.shopId, mWORK.workDate);
    await setWorkInfo(workInfo[0]);
  };
  const takePictureAudit = async item => {
    let photoType = item.code;
    let itemPhoto = {
      guid: mWORK.guiid || route?.params.workinfo.guiid,
      reportId: kpiinfo.kpiId,
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      photoType: photoType,
      photoDate: shopinfo.auditDate,
      photoTime: new Date().getTime(),
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      latitude: dataLocation.Latitude,
      longitude: dataLocation.Longitude,
      accuracy: dataLocation.Accuracy,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(itemPhoto, handlerCallBack);
  };
  const showPhotoAudit = photos => {
    setPictureShow({ visible: true, photos, index: 0 });
  };
  const closePictureViewer = () => {
    setPictureShow({ visible: false, photos: [], index: 0 });
  };
  const renderItem = ({ item, index }) => {
    const photoList = dataPhoto.filter(i => i.photoType === item.code);
    const onPressItem = () => {
      takePictureAudit(item);
    };
    const onViewPhoto = () => {
      showPhotoAudit(photoList);
    };
    return (
      <View style={{ width: '100%' }} key={index.toString()}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            backgroundColor: appcolor.yellowdark,
            borderRadius: 5,
            padding: 8,
            marginBottom: 3,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity style={styles.actionButton} onPress={onPressItem}>
            <SpiralIcon
              type="font-awesome-6"
              name="camera"
              size={17}
              color={appcolor.dark}
              style={{ textAlign: 'center' }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onViewPhoto}>
            <SpiralIcon
              type="font-awesome-6"
              name="images"
              size={17}
              color={appcolor.dark}
              style={{ textAlign: 'center' }}
            />
            <Badge
              value={photoList.length || 0}
              textStyle={{ fontSize: 11 }}
              badgeStyle={{ width: 22, height: 22, borderRadius: 11 }}
              status="primary"
              containerStyle={{ position: 'absolute', top: -8, right: -10 }}
            />
          </TouchableOpacity>
          <Text style={styles.itemAudit}>{item.name}</Text>
        </View>
      </View>
    );
  };

  const renderItemSelect = ({ item, index }) => {
    const selectItem = () => {
      onSelectItem(item);
    };
    return (
      <TouchableOpacity onPress={selectItem}>
        <View
          style={{ borderBottomWidth: 0.5, borderBottomColor: appcolor.grey }}
        >
          <Text style={{ padding: 8, fontSize: 15 }}>
            {index + 1}. {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    selectStyle: {
      flexDirection: 'row',
      width: '95%',
      height: 'auto',
      alignSelf: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.grayLight,
      padding: 8,
      borderRadius: 8,
    },
    bottomContainer: { width: '98%', height: 'auto', alignSelf: 'center' },
    modalStyle: { width: '100%', height: '100%', padding: 32 },
    fsmStyle: {
      width: '95%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      margin: 8,
    },
    inputStyle: {
      width: '15%',
      height: 'auto',
      alignSelf: 'center',
      padding: 8,
      margin: 3,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: 'black',
    },
    actionButton: {
      width: 45,
      height: 32,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 6,
    },
    itemAudit: {
      flex: 1,
      paddingStart: 8,
      paddingEnd: 8,
      fontSize: 15,
      color: appcolor.dark,
      textAlignVertical: 'center',
    },
  });
  useEffect(() => {
    LoadData();
  }, []);
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        type="font-awesome"
        title={kpiinfo?.menuNameVN}
        iconRight={'cloud-upload-alt'}
        rightFunc={uploadData}
      />

      <View style={styles.fsmStyle}>
        <Text
          style={{
            marginStart: 8,
            fontSize: 13,
            color: appcolor.dark,
            fontWeight: '500',
          }}
        >
          Số lượng FSM tham gia đào tạo
        </Text>
        <View style={styles.inputStyle}>
          <NumericFormat
            value={mWORK.fsmValue}
            displayType="text"
            renderText={values => (
              <TextInput
                keyboardType="numeric"
                style={{ textAlign: 'center' }}
                value={values}
                onChangeText={addTextChanged}
              />
            )}
          />
        </View>
      </View>
      <RenderSelectItem
        styles={styles}
        onPress={handlerFilter}
        selectValue={itemFilter}
        appcolor={appcolor}
      />
      <FlatList
        style={{ margin: 8 }}
        key="FieldCoaching"
        keyExtractor={(_, index) => index.toString()}
        data={dataList}
        renderItem={renderItem}
      />
      <View style={styles.bottomContainer}>
        <Modal visible={isModalVisible}>
          <View style={styles.modalStyle}>
            {/* Header */}
            <View
              style={{ width: '100%', height: '8%', alignContent: 'center' }}
            >
              <Text
                style={{
                  position: 'absolute',
                  top: 20,
                  start: 0,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Tìm kiếm hình ảnh
              </Text>
              <SpiralIcon
                type="font-awesome-6"
                style={{ position: 'absolute', top: 16, end: 0 }}
                solid
                name="window-close"
                size={28}
                color="black"
                onPress={() => setModalVisible(false)}
              />
            </View>
            {/* Content */}
            {dataModalBS.data.length > 5 && (
              <FormGroup
                containerStyle={styles.filterStyle}
                placeholder={'Tìm kiếm...'}
                editable
                handleChangeForm={handlerFilterProduct}
                multiline
                iconName="search"
              />
            )}
            <FlatList
              key="dataSelect"
              keyExtractor={(_, index) => index.toString()}
              data={dataModalBS.data}
              renderItem={renderItemSelect}
            />
          </View>
        </Modal>
      </View>
      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.photos}
        initialIndex={pictureShow.index}
        onSwipeDown={closePictureViewer}
        isUseDelete
        onDeleteImage={handlerCallBack}
      />
    </View>
  );
};
const RenderSelectItem = ({
  typeView,
  styles,
  selectValue,
  onPress,
  appcolor,
}) => {
  const eventPress = () => {
    onPress(typeView, selectValue);
  };
  return (
    <TouchableOpacity onPress={eventPress}>
      <View style={styles.selectStyle}>
        <Text
          style={{ fontSize: 15, color: appcolor.black, fontWeight: '500' }}
        >
          {selectValue !== undefined ? selectValue : 'Tìm kiếm ...'}
        </Text>
        <SpiralIcon
          type="font-awesome-6"
          style={{ position: 'absolute', end: 8 }}
          name="chevron-down"
          size={13}
          color={appcolor.dark}
        />
      </View>
    </TouchableOpacity>
  );
};

export default FieldCoaching;
