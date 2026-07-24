import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { groupDataByKey } from '../../../../Core/Helper';

import NativeCamera from '../../../../Control/NativeCamera';
import {
  deleteItemPhotoDuplicate,
  getPhotoByType,
} from '../../../../Controller/DisplayController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  alertConfirm,
  deviceHeight,
  deviceWidth,
} from '../../../../Core/Utility';
import { TouchableOpacity } from 'react-native';
import { Icon, Image, Text } from '@rneui/themed';
import FormGroup from '../../../../Content/FormGroup';
import { CalendarSelected } from '../../../../Control/CalendarSelected';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native';
import { MultipleShowImage } from '../../../../Control/MultipleShowImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

export const ResignView = ({
  title,
  employee,
  dataReason = [],
  onDateChange,
  handlerChoose,
  onChangeNoteResign,
  onPhotoResign,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
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
  const [dataMainReason, setDataMainReason] = useState([]);
  const [listReason, setListReason] = useState([]);
  const [indexImage, setIndexImage] = useState(0);
  const [countDelete, setCountDelete] = useState(0);
  const [_mutate, setMutate] = useState(false);

  const configData = async () => {
    const { arr } = await groupDataByKey({
      arr: dataReason,
      key: 'GroupId',
    });
    await setDataMainReason(arr);
    await setListReason(arr);
  };
  // Handler
  const handlerTakePicture = async () => {
    let photoinfo = {
      photoType: 'LEAVE_JOB',
      dataUpload: 0,
      fileUpload: 0,
      shopId: 0,
      photoPath: null,
      guid: employee.employeeCode,
      photoDate: moment(new Date()).format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, reloadpage);
  };
  const handlerTakeGalary = async () => {
    let photoinfo = {
      photoType: 'LEAVE_JOB',
      dataUpload: 0,
      fileUpload: 0,
      shopId: 0,
      photoPath: null,
      guid: employee.employeeCode,
      photoDate: moment(new Date()).format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, reloadpage);
  };
  const reloadpage = async () => {
    const itemPhoto = await getPhotoByType('LEAVE_JOB', employee.employeeCode);
    const data = [
      {
        photoName: 'camera',
        photoType: 'LEAVE_JOB',
        reportId: 0,
        shopId: 0,
        shopCode: '0',
        photoDate: moment(new Date()).format('YYYYMMDD').toString(),
        photoPath: null,
      },
      ...itemPhoto,
    ];
    await setDataPhoto(data);
    await onPhotoResign(data);
  };
  const handlerTimeWork = () => {
    SheetManager.show('calendarview');
  };
  const onFilterChangeTime = calendar => {
    onDateChange(calendar);
  };
  const handlerReason = () => {
    SheetManager.show('reasonview');
  };
  const onSeachReason = text => {
    const filterList = _.filter(dataMainReason, e => {
      return e.itemName.toLowerCase().match(text.toLowerCase());
    });
    setListReason(filterList);
    setMutate(e => !e);
  };
  const handleChangeNote = text => {
    onChangeNoteResign(text);
  };
  const onDeleteImage = async () => {
    if (dataPhoto !== null && dataPhoto.length > 0) {
      for (let index = 0; index < dataPhoto.length; index++) {
        const item = dataPhoto[index];
        item.isDelete == 1 && (await deleteItemPhotoDuplicate(item));
      }
    }
    setCountDelete(0);
    reloadpage();
  };
  useEffect(() => {
    const _config = configData();
    return () => _config;
  }, []);
  //
  const styles = StyleSheet.create({
    mainItem: {
      flex: 1,
      backgroundColor: appcolor.light,
      padding: 8,
      paddingBottom: 0,
    },
    title: {
      color: appcolor.dark,
      fontSize: 13,
      padding: 5,
      fontWeight: '700',
    },
    subtitle: {
      color: appcolor.info,
      fontSize: 13,
      padding: 5,
      fontWeight: '700',
      fontStyle: 'italic',
    },
    contentView: {
      width: '65%',
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      padding: 8,
      marginEnd: 8,
    },
    contentFile: {
      width: '35%',
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      padding: 8,
    },
    itemContent: {
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 5,
      padding: 8,
      marginBottom: 5,
    },
    itemValue: { fontSize: 13, fontWeight: '500' },
    contentPhoto: { width: deviceWidth / 8, margin: 5, alignSelf: 'center' },
    itemPhoto: {
      width: deviceWidth / 8,
      height: deviceWidth / 5.5,
      padding: 8,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      justifyContent: 'center',
    },
    titleHeader: {
      color: appcolor.info,
      fontSize: 18,
      padding: 8,
      fontWeight: '600',
      textAlign: 'center',
    },
    seachView: {
      padding: 3,
      margin: 8,
      backgroundColor: appcolor.placeholderBody,
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: appcolor.info,
      padding: 5,
      marginTop: 8,
    },
    reasonTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: appcolor.dark,
      padding: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const handlerPhotoPlus = () => {
      alertConfirm(
        'Đơn xin nghỉ',
        'Chụp hình bằng máy ảnh hoặc chọn hình ảnh từ thư viện',
        () => {
          handlerTakePicture(item);
        },
        () => {
          handlerTakeGalary(item);
        },
        'Chụp hình',
        'Thư viện',
      );
    };
    const handlerShowImage = () => {
      setIndexImage(index);
      SheetManager.show('imagereview');
    };
    const countItemDelete = () => {
      const value =
        (item?.isDelete || 0) == 1 ? countDelete - 1 : countDelete + 1;
      item.isDelete = item?.isDelete || 0 == 1 ? 0 : 1;
      setCountDelete(value);
    };
    return (
      <View key={`popo_${index}`} style={styles.contentPhoto}>
        {/* Plus Photo */}
        {index == 0 ? (
          <View style={styles.itemPhoto}>
            {countDelete == 0 ? (
              <TouchableOpacity onPress={handlerPhotoPlus}>
                <SpiralIcon name="camera" color={appcolor.primary} size={32} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onDeleteImage}
                style={{ alignItems: 'center' }}
              >
                <SpiralIcon
                  name="trash"
                  type="font-awesome-5"
                  color={appcolor.primary}
                  size={28}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: appcolor.light,
                    position: 'absolute',
                    bottom: 0,
                    top: 8,
                  }}
                >
                  {countDelete}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Content Photo */
          <View
            style={{
              ...styles.itemPhoto,
              borderColor: appcolor.grayLight,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              onPress={countDelete > 0 ? countItemDelete : handlerShowImage}
              onLongPress={countItemDelete}
            >
              {(item?.isDelete || 0) == 0 ? (
                <Image
                  source={{ uri: item.photoPath }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <SpiralIcon
                  name="check-circle"
                  type="font-awesome-5"
                  color={appcolor.primary}
                  size={24}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  const renderItemSelected = (item, index) => {
    const onItemChoose = () => {
      handlerChoose(item, 'reasonResign');
    };
    const colorItem =
      employee.reasonName == item.itemName ? appcolor.primary : appcolor.dark;
    const fontWeightItem = employee.reasonName == item.itemName ? '700' : '400';
    return (
      <View
        key={`stm_${index}`}
        style={{
          width: '100%',
          borderBottomColor: appcolor.grayLight,
          borderBottomWidth: 0.5,
        }}
      >
        {item.isParent && (
          <Text style={styles.groupTitle}>{item.GroupName}</Text>
        )}
        <TouchableOpacity onPress={onItemChoose}>
          <Text
            style={{
              ...styles.reasonTitle,
              color: colorItem,
              fontWeight: fontWeightItem,
            }}
          >
            {item.itemName}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const mainContentReason = () => {
    return listReason.map((item, index) => {
      return renderItemSelected(item, index);
    });
  };
  return (
    <View style={styles.mainItem}>
      <Text style={styles.title}>
        {title}
        <Text style={{ color: appcolor.red, fontSize: 13 }}>*</Text>
      </Text>
      {/* // View Main Resign */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View style={styles.contentView}>
          <Text style={styles.subtitle}>{`Thời gian`}</Text>
          <TouchableOpacity
            style={styles.itemContent}
            onPress={handlerTimeWork}
          >
            <Text style={styles.itemValue}>
              {employee.fromDate || 'Ngày nghỉ việc'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>{`Nội dung nghỉ việc`}</Text>
          <TouchableOpacity style={styles.itemContent} onPress={handlerReason}>
            <Text style={styles.itemValue}>
              {employee.reasonName || 'Nội dung nghỉ việc'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>{`Lí do (Nếu có)`}</Text>
          <View style={{ padding: 0 }}>
            <FormGroup
              editable
              multiline
              value={employee.noteResign}
              containerStyle={{
                borderWidth: 0.5,
                borderColor: appcolor.grayLight,
                margin: 0,
                padding: 2,
                paddingTop: 3,
                color: appcolor.dark,
                borderRadius: 5,
              }}
              inputStyle={{ fontSize: 13 }}
              useClearAndroid={false}
              handleChangeForm={handleChangeNote}
            />
          </View>
        </View>
        {/* // Image File Resign */}
        <View style={styles.contentFile}>
          <Text style={styles.subtitle}>Đơn xin</Text>
          <FlatList
            key="listphotoresign"
            data={dataPhoto}
            renderItem={renderItem}
            numColumns={2}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      {/* // Calendar View */}
      <ActionSheet
        id="calendarview"
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ width: '100%', paddingBottom: 16 }}>
          <Text style={styles.titleHeader}>{`Thời gian nghỉ việc`}</Text>
          <CalendarSelected
            theme={{ calendarBackground: appcolor.light }}
            onChangeData={onFilterChangeTime}
            isBetween={false}
          />
        </View>
      </ActionSheet>
      {/* // Reason View */}
      <ActionSheet
        id="reasonview"
        gestureEnabled
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <SafeAreaView style={{ width: '100%', height: deviceHeight / 1.5 }}>
          <FormGroup
            editable
            containerStyle={styles.seachView}
            inputStyle={{ fontSize: 14 }}
            handleChangeForm={onSeachReason}
            iconName="search"
            placeholder="Tìm kiếm lí do"
          />
          <ScrollView
            style={{ padding: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {mainContentReason()}
            <View style={{ height: deviceHeight / 5 }} />
          </ScrollView>
        </SafeAreaView>
      </ActionSheet>
      {/* // Image Review */}
      <ActionSheet
        id="imagereview"
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{
          backgroundColor: '#000',
          paddingBottom: insets.bottom,
        }}
      >
        <SafeAreaView style={{ width: '100%', height: deviceHeight }}>
          <MultipleShowImage
            key={'imagereview'}
            listItem={dataPhoto}
            closeShowImage={() => SheetManager.hide('imagereview')}
            indexItem={indexImage}
          />
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
