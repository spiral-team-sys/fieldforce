import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import ImageZoom from '../../../Content/ImageZoom';
import {
  DataDisplaySituation,
  deleteItemDisplaySituation,
  deleteItemPhotoDuplicate,
  getDataDisplaySituation,
  getPhotoByType,
  getPhotoDisplaySituation,
} from '../../../Controller/DisplayController';
import GmailStyleSwipeableRow from '../../../Core/GmailStyleSwipeableRow';
import AddDisplaySituation from './AddDisplaySituation';
import moment from 'moment';
import { Message, ToastError } from '../../../Core/Helper';
import { checkNetwork } from '../../../Core/Utility';
import NativeCamera from '../../../Control/NativeCamera';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const DisplaySituation = ({ navigation }) => {
  const { appcolor, workinfo, shopinfo, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const styles = createStyles(appcolor);
  const [visibleModal, setVisibleModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadHistory, setLoadHistory] = useState(false);
  const [data, setData] = useState({ listData: [], listPhoto: [] });
  const [itemSave, setItemSave] = useState();
  const [Status, setStatus] = useState(0);
  const [showAdd, setShowAdd] = useState('none');
  const [showItem, setShowItem] = useState('flex');
  const [reload, setReload] = useState(0);

  const loadData = useCallback(async () => {
    const listData = await getDataDisplaySituation(workinfo);
    const photo = await getPhotoDisplaySituation(workinfo);
    let isUpload = listData.length > 0 ? listData[0].upload : 0;
    setStatus(isUpload);
    setData({ listData: listData, listPhoto: photo });
  }, [workinfo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadAction = () => {
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
          ToastError(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
          );
          return;
        }
        await DataDisplaySituation(
          data.listData,
          work,
          async () => {
            await loadData();
          },
          async () => { },
        );
      },
    );
  };

  const takePhoto = async (item, tag) => {
    const reloadpage = async result => {
      if (result?.statusId !== 200) {
        return;
      }
      const itemPhotoByType = await getPhotoByType(tag);
      const itemPhoto =
        data.listPhoto.find(
          it => it.guid === item.guiId && it.photoType === tag,
        ) || {};
      if (Object.keys(itemPhoto).length > 0 && itemPhotoByType.length > 1) {
        await deleteItemPhotoDuplicate(itemPhoto);
      }
      await loadData();
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

  const deleteItem = async item => {
    await deleteItemDisplaySituation(item);
    await loadData();
  };

  const handlerOnSelectItem = item => {
    setItemSave(item);
    setLoadHistory(true);
    addItemDisplay();
  };

  const renderItem = ({ item, index }) => {
    const arrPhoto = data.listPhoto.filter(it => it.guid === item.guiId);
    const reportPhotos =
      arrPhoto.filter(
        it => it.photoPath && it.photoType === `DISPLAY_REPORT_${item.guiId}`,
      ) || [];
    const productPhotos =
      arrPhoto.filter(
        it => it.photoPath && it.photoType === `DISPLAY_PRODUCT_${item.guiId}`,
      ) || [];
    return (
      <GmailStyleSwipeableRow
        key={item.id.toString()}
        enableRight={item.upload === 1 ? true : false}
        deleteItem={() => deleteItem(item)}
      >
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => Status !== 1 && handlerOnSelectItem(item)}
        >
          <Text style={styles.itemTitle}>
            {index + 1}. Thông tin/Vấn đề trưng bày : {item.issueDisplay}{' '}
          </Text>
          <Text style={styles.itemTitle}>
            Gói Trưng Bày : {item.displayItemName}{' '}
          </Text>
          <Text style={styles.itemNote}>Tình trạng : {item.note}</Text>
          <View style={styles.photoRow}>
            <View style={styles.photoColumn}>
              {reportPhotos.map((it, photoIndex) => (
                <TouchableOpacity
                  key={`report_${it.id || it.photoPath || photoIndex}`}
                  style={styles.photoWrapper}
                  onPress={() => handlerOpenModal(it.photoPath)}
                >
                  <Image
                    style={styles.reportImage}
                    source={{ uri: it.photoPath }}
                  />
                </TouchableOpacity>
              ))}
              {reportPhotos.length === 0 && arrPhoto.length > 0 && (
                <View style={styles.photoWrapper}>
                  <SpiralIcon
                    name="mobile-alt"
                    type="font-awesome-5"
                    color={appcolor.grey}
                    size={60}
                  />
                </View>
              )}
            </View>
            <View style={styles.photoColumn}>
              {productPhotos.map((it, photoIndex) => (
                <TouchableOpacity
                  key={`product_${it.id || it.photoPath || photoIndex}`}
                  style={styles.photoWrapper}
                  onPress={() => handlerOpenModal(it.photoPath)}
                >
                  <Image
                    style={styles.productImage}
                    source={{ uri: it.photoPath }}
                  />
                </TouchableOpacity>
              ))}
              {productPhotos.length === 0 && arrPhoto.length > 0 && (
                <View style={styles.photoWrapper}>
                  <SpiralIcon
                    name="mobile-alt"
                    type="font-awesome-5"
                    style={styles.productPlaceholderIcon}
                    color={appcolor.grey}
                    size={60}
                  />
                </View>
              )}
            </View>
          </View>
          {Status !== 1 && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(item, `DISPLAY_REPORT_${item.guiId}`)}
              >
                <SpiralIcon
                  name="mobile-alt"
                  type="font-awesome-5"
                  color={appcolor.primary}
                  size={20}
                />
                <Text style={styles.actionText}>Biên bản</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(item, `DISPLAY_PRODUCT_${item.guiId}`)}
              >
                <SpiralIcon
                  name="mobile-alt"
                  type="font-awesome-5"
                  style={styles.productActionIcon}
                  color={appcolor.primary}
                  size={20}
                />
                <Text style={styles.actionText}>Sản phẩm</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </GmailStyleSwipeableRow>
    );
  };
  const handlerOpenModal = path => {
    setImageUrl(path);
    setVisibleModal(true);
  };

  const handlerCloseModal = () => {
    setLoadHistory(false);
    setVisibleModal(false);
    setShowItem('flex');
    setShowAdd('none');
  };
  const addItemDisplay = () => {
    setShowAdd('flex');
    setShowItem('none');
    setReload(reload + 1);
  };

  const keyExtractor = useCallback(it => it.id.toString(), []);

  return (
    <View style={styles.container}>
      <View style={[styles.container, { display: showItem }]}>
        <HeaderCustom
          title={kpiinfo?.menuNameVN}
          iconRight="cloud-upload-alt"
          rightFunc={Status !== 1 ? () => uploadAction() : null}
          leftFunc={() => navigation.goBack()}
        />
        <View style={styles.container}>
          <FlatList
            keyExtractor={keyExtractor}
            data={data.listData}
            renderItem={renderItem}
            ListFooterComponent={<View style={styles.listFooter} />}
          />
          {Status !== 1 && (
            <View style={styles.addButtonContainer}>
              <SpiralIcon
                iconStyle={{ color: appcolor.primary }}
                onPress={() => addItemDisplay()}
                containerStyle={styles.addButton}
                size={45}
                name="add-circle"
                type="ionicon"
              />
            </View>
          )}
        </View>
      </View>
      <View style={[styles.container, { display: showAdd }]}>
        <AddDisplaySituation
          key={'addItem' + reload}
          loadData={loadData}
          onClose={handlerCloseModal}
          ItemSaved={itemSave}
          loadHistory={loadHistory}
          closeModal={value => setVisibleModal(value)}
          reload={reload}
        />
      </View>
      <Modal visible={visibleModal} style={styles.container}>
        <View style={styles.modalContainer}>
          <ImageZoom ImagePath={imageUrl} />
          <TouchableOpacity
            onPress={handlerCloseModal}
            style={styles.closeButton}
          >
            <SpiralIcon name="close" color={appcolor.dark} size={30} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: appcolor.surface,
    },
    itemContainer: {
      flex: 1,
      padding: 5,
      borderRadius: 5,
      backgroundColor: appcolor.light,
      borderWidth: 0.2,
      borderColor: appcolor.dark,
    },
    itemTitle: {
      color: appcolor.dark,
      fontWeight: '600',
      fontSize: 14,
      paddingLeft: 5,
    },
    itemNote: {
      color: appcolor.dark,
      fontSize: 12,
      paddingLeft: 5,
    },
    photoRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    photoColumn: {
      flex: 1,
    },
    photoWrapper: {
      flex: 1,
      margin: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: appcolor.dark,
      borderWidth: 0.5,
      borderRadius: 10,
    },
    reportImage: {
      height: 130,
      margin: 5,
      width: 100,
      borderRadius: 10,
    },
    productImage: {
      height: 100,
      margin: 5,
      width: 130,
      borderRadius: 10,
    },
    productPlaceholderIcon: {
      width: 60,
      transform: [{ rotate: '90deg' }],
    },
    actionRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    actionButton: {
      flex: 1,
      padding: 5,
      borderRadius: 5,
      margin: 5,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    productActionIcon: {
      width: 20,
      transform: [{ rotate: '90deg' }],
    },
    actionText: {
      paddingLeft: 5,
      color: appcolor.dark,
    },
    listFooter: {
      height: 100,
    },
    addButtonContainer: {
      width: '100%',
      height: 100,
      position: 'absolute',
      bottom: 20,
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 30,
      maxHeight: 50,
    },
    modalContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    closeButton: {
      position: 'absolute',
      right: 20,
      top: 40,
      zIndex: 100,
    },
  });
