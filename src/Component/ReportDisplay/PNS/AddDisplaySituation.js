import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Modal, Image } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  deleteItemPhotoByGuiId,
  deleteItemPhotoDuplicate,
  getPhotoByGuiId,
  getPhotoByType,
  insertDisplaySituation,
  updateDisplaySituation,
} from '../../../Controller/DisplayController';
import { MessageInfo, ToastSuccess, UUIDGenerator } from '../../../Core/Helper';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';
import ImageZoom from '../../../Content/ImageZoom';
import moment from 'moment';
import NativeCamera from '../../../Control/NativeCamera';

const itemDetail = {
  shopId: null,
  workId: null,
  reportDate: null,
  issueDisplay: '',
  displayItemName: '',
  note: '',
  guiId: null,
  upload: 0,
};

const AddDisplaySituation = ({
  loadData,
  onClose,
  ItemSaved,
  loadHistory,
  reload,
}) => {
  const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [itemShow, setItemShow] = useState(itemDetail);
  const [guiIdItem, setGuiIdItem] = useState();
  const [photo, setPhoto] = useState({
    arrPhoto: [],
    isReport: [],
    isProduct: [],
  });
  const [visibleModal, setVisibleModal] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const loadDataItem = async () => {
    if (loadHistory) {
      let item = {
        ...itemShow,
        Id: ItemSaved.Id,
        shopId: ItemSaved.shopId,
        workId: ItemSaved.workId,
        reportDate: ItemSaved.reportDate,
        issueDisplay: ItemSaved.issueDisplay,
        displayItemName: ItemSaved.displayItemName,
        note: ItemSaved.note,
        guiId: ItemSaved.guiId,
        upload: ItemSaved.upload,
      };
      setItemShow(item);
      setGuiIdItem(ItemSaved.guiId);
      loadPhoto();
    } else {
      const guiId = UUIDGenerator();
      setGuiIdItem(guiId);
      setItemShow({ ...itemShow, guiId: guiId });
    }
  };

  const loadPhoto = async () => {
    const guiId = loadHistory ? ItemSaved.guiId : guiIdItem;
    const listPhoto = await getPhotoByGuiId(guiId);
    const isReport =
      listPhoto.filter(it => it.photoType == `DISPLAY_REPORT_${guiId}`) || [];
    const isProduct =
      listPhoto.filter(it => it.photoType == `DISPLAY_PRODUCT_${guiId}`) || [];
    await setPhoto({
      arrPhoto: listPhoto,
      isReport: isReport,
      isProduct: isProduct,
    });
  };

  useEffect(() => {
    loadDataItem();
    return () => false;
  }, [reload]);

  const onSaveSituation = async () => {
    if (itemShow.issueDisplay === '' || itemShow.issueDisplay == null) {
      MessageInfo('Bạn chưa nhập thông tin / vấn đề trưng bày');
      return;
    }
    if (itemShow.displayItemName === '' || itemShow.displayItemName == null) {
      MessageInfo('Bạn chưa nhập tên chương trình');
      return;
    }
    if (itemShow.note === '' || itemShow.note == null) {
      MessageInfo('Bạn chưa nhập tình trạng');
      return;
    }

    let result = false;

    if (loadHistory) {
      result = await updateDisplaySituation(itemShow, workinfo);
    } else {
      const item = {
        shopId: shopinfo.shopId,
        workId: workinfo.workId,
        reportDate: workinfo.workDate,
        issueDisplay: itemShow.issueDisplay,
        displayItemName: itemShow.displayItemName,
        note: itemShow.note,
        guiId: itemShow.guiId,
        upload: itemShow.upload,
      };
      result = await insertDisplaySituation(item);
    }

    if (result) {
      closeOnSave();
      ToastSuccess('Lưu thành công!');
    }
  };

  const closeOnSave = async () => {
    await setItemShow(itemDetail);
    await setPhoto({ arrPhoto: [], isReport: [], isProduct: [] });
    await setGuiIdItem();
    await loadData();
    await onClose();
  };

  const closeModal = async () => {
    !loadHistory && deleteItemPhotoByGuiId(itemShow.guiId);
    setItemShow(itemDetail);
    setPhoto({ arrPhoto: [], isReport: [], isProduct: [] });
    setGuiIdItem();
    loadData();
    onClose();
  };
  const handlerOpenModal = path => {
    setVisibleModal(true);
    setImageUrl(path);
  };
  const handlerCloseModal = () => {
    setVisibleModal(false);
  };

  const takePhoto = async (item, tag) => {
    const reloadpage = async result => {
      if (result?.statusId !== 200) {
        return;
      }
      const itemPhotoByType = await getPhotoByType(tag);
      const itemPhoto =
        photo.arrPhoto.find(
          it => it.guid === item.guiId && it.photoType == tag,
        ) || {};
      (await Object.keys(itemPhoto).length) > 0 && itemPhotoByType.length > 1
        ? deleteItemPhotoDuplicate(itemPhoto)
        : null;
      await loadPhoto();
    };
    let photoinfo = {};
    photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoType: tag,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: item.guiId,
      photoDesc: `Display_${workinfo.workId}`,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, reloadpage);
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN}
        iconRight="save"
        iconLeft={'times'}
        rightFunc={() => onSaveSituation()}
        leftFunc={() => closeModal()}
      />
      <View style={{ flex: 1, backgroundColor: appcolor.surface, padding: 5 }}>
        <FormGroup
          rightFunc={() => {}}
          containerStyle={{
            borderWidth: 0.5,
            borderColor: '#bbb',
            borderRadius: 10,
          }}
          iconRightStyle={{ color: appcolor.primary }}
          inputStyle={{ height: 50, maxHeight: 120 }}
          multiline
          title={'Thông tin / Vấn đề trưng bày'}
          placeholder={'Nhập thông tin'}
          defaultValue={itemShow.issueDisplay}
          handleChangeForm={text =>
            setItemShow({ ...itemShow, issueDisplay: text })
          }
          onClearTextAndroid={() =>
            setItemShow({ ...itemShow, issueDisplay: '' })
          }
          placeholderTextColor={appcolor.greydark}
          editable
        />
        <FormGroup
          rightFunc={() => {}}
          containerStyle={{
            borderWidth: 0.5,
            borderColor: '#bbb',
            borderRadius: 10,
          }}
          iconRightStyle={{ color: appcolor.primary }}
          inputStyle={{ height: 50, maxHeight: 120 }}
          multiline
          title={'Tên chương trình'}
          placeholder={'Nhập tên chương trình'}
          defaultValue={itemShow.displayItemName}
          handleChangeForm={text =>
            setItemShow({ ...itemShow, displayItemName: text })
          }
          onClearTextAndroid={() =>
            setItemShow({ ...itemShow, displayItemName: '' })
          }
          placeholderTextColor={appcolor.greydark}
          editable
        />
        <FormGroup
          rightFunc={() => {}}
          containerStyle={{
            borderWidth: 0.5,
            borderColor: '#bbb',
            borderRadius: 10,
          }}
          iconRightStyle={{ color: appcolor.primary }}
          inputStyle={{ height: 50, maxHeight: 120 }}
          multiline
          title={'Tình trạng'}
          placeholder={'Nhập tình trạng'}
          defaultValue={itemShow.note}
          handleChangeForm={text => setItemShow({ ...itemShow, note: text })}
          onClearTextAndroid={() => setItemShow({ ...itemShow, note: '' })}
          placeholderTextColor={appcolor.greydark}
          editable
        />
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: '100%',
              height: photo.arrPhoto.length > 0 ? 150 : 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: '50%' }}>
              {photo.isReport
                ?.filter(it => it.photoPath)
                .map((it, index) => (
                  <TouchableOpacity
                    key={`report_${it.id || it.photoPath || index}`}
                    style={{
                      flex: 1,
                      margin: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: appcolor.dark,
                      borderWidth: 0.5,
                      borderRadius: 10,
                    }}
                    onPress={() => handlerOpenModal(it.photoPath)}
                  >
                    <Image
                      style={{
                        height: 130,
                        margin: 5,
                        width: 100,
                        borderRadius: 10,
                      }}
                      source={{ uri: it.photoPath }}
                    />
                  </TouchableOpacity>
                ))}
              {photo.isReport.length === 0 && photo.arrPhoto.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    margin: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: appcolor.dark,
                    borderWidth: 0.5,
                    borderRadius: 10,
                  }}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="mobile-alt"
                    color={appcolor.grey}
                    size={60}
                  />
                </View>
              )}
            </View>
            <View style={{ width: '50%' }}>
              {photo.isProduct
                ?.filter(it => it.photoPath)
                .map((it, index) => (
                  <TouchableOpacity
                    key={`product_${it.id || it.photoPath || index}`}
                    style={{
                      flex: 1,
                      margin: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: appcolor.dark,
                      borderWidth: 0.5,
                      borderRadius: 10,
                    }}
                    onPress={() => handlerOpenModal(it.photoPath)}
                  >
                    <Image
                      style={{
                        height: 100,
                        margin: 5,
                        width: 130,
                        borderRadius: 10,
                      }}
                      source={{ uri: it.photoPath }}
                    />
                  </TouchableOpacity>
                ))}
              {photo.isProduct.length === 0 && photo.arrPhoto.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    margin: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: appcolor.dark,
                    borderWidth: 0.5,
                    borderRadius: 10,
                  }}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name="mobile-alt"
                    style={{ transform: [{ rotate: '90deg' }] }}
                    color={appcolor.grey}
                    size={60}
                  />
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              padding: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 5,
                borderRadius: 5,
                margin: 5,
                borderWidth: 0.5,
                borderColor: appcolor.primary,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                takePhoto(itemShow, `DISPLAY_REPORT_${itemShow.guiId}`)
              }
            >
              <SpiralIcon
                type="font-awesome-6"
                name="mobile-alt"
                color={appcolor.primary}
                size={20}
              />
              <Text style={{ paddingLeft: 5, color: appcolor.dark }}>
                Biên bản
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 5,
                borderRadius: 5,
                margin: 5,
                borderWidth: 0.5,
                borderColor: appcolor.primary,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                takePhoto(itemShow, `DISPLAY_PRODUCT_${itemShow.guiId}`)
              }
            >
              <View style={{ width: 20, alignItems: 'center' }}>
                <SpiralIcon
                  name="mobile-alt"
                  type="font-awesome-5"
                  style={{ transform: [{ rotate: '90deg' }] }}
                  color={appcolor.primary}
                  size={20}
                />
              </View>
              <Text style={{ paddingLeft: 5, color: appcolor.dark }}>
                Sản phẩm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal visible={visibleModal} style={{ flex: 1 }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: appcolor.light,
          }}
        >
          <ImageZoom ImagePath={imageUrl} />
          <TouchableOpacity
            onPress={handlerCloseModal}
            style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="times"
              color={appcolor.dark}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};
export default AddDisplaySituation;
