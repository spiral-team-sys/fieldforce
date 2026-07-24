import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
  SafeAreaView,
  PermissionsAndroid,
} from 'react-native';
import { deviceWidth } from '../../Themes/AppsStyle';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  deletePhotoByPath,
  getAllPhotosLocal,
  InsertPhotosItem,
} from '../../Controller/PhotoController';
import {
  groupDataByKey,
  Message,
  onShareLocalFile,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../../Core/Helper';
import { APPNAME, URLDEFAULT, _competitorName } from '../../Core/URLs';
import ImageZoom from '../../Content/ImageZoom';
import { Icon } from '@rneui/themed';
import RNFS from 'react-native-fs';
import CacheImage from '../../Core/CacheImage';
import { MultipleShowImage } from '../../Control/MultipleShowImage';

import LinearGradient from 'react-native-linear-gradient';
import { DrawWithOptions } from '@archireport/react-native-svg-draw';
import ViewShot from 'react-native-view-shot';
import moment from 'moment';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import FormGroup from '../../Content/FormGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PhotoList = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState({
    groupPhoto: [],
    groupPhotoF: [],
    listPhoto: [],
    listByGroup: [],
  });
  const [visibleModal, setVisibleModal] = useState(false);
  const [mode, setMode] = useState('');
  const [itemPhoto, setItemPhoto] = useState({});
  const [imageIndex, setImageIndex] = useState('');
  const [listSelect, setListSelect] = useState([]);
  const [isLongPress, setLongPresss] = useState(false);
  const [urlShare, setUrlShare] = useState([]);
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const [isSelectAll, setSelectAll] = useState(false);
  const [itemSortFeild, setItemSortFeild] = useState({
    sortFeild: 'shopId',
    titleFeild: 'shopName',
  });
  const [search, setSearch] = useState('');

  const loadData = async () => {
    const res = await getAllPhotosLocal(itemSortFeild.sortFeild);
    const { arr } = groupDataByKey({
      arr: res,
      key: itemSortFeild.sortFeild,
    });
    const result = await groupByShop(
      arr,
      itemSortFeild.sortFeild,
      itemSortFeild.titleFeild,
    );
    // res?.sort((a, b) => a.id < b.id);
    await setData({
      groupPhoto: result,
      groupPhotoF: result,
      listPhoto: res,
      listByGroup: [],
    });
  };

  const groupByShop = (arr, sortFeild, titleFeild) => {
    const listGroup = [];
    arr.map(it => {
      if (it.isParent) {
        const listByDate = [];
        arr.map(item => {
          if (it[sortFeild] === item[sortFeild]) {
            listByDate.push({ ...item, isCheck: false });
          }
        });
        listGroup.push({
          title: it[titleFeild],
          groupId: it[sortFeild],
          dataGroup: listByDate,
          isCheckAll: false,
        });
      }
    });
    return listGroup;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCloseSelect = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    data.groupPhoto.map(it => {
      it.dataGroup.map(item => {
        item.isCheck = false;
      });
    });
    data.listPhoto.map(it => (it.isCheck = false));
    await setListSelect([]);
    await setUrlShare([]);
    await setLongPresss(false);
  };
  const handleSelectTask = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const arrSelect = isSelectAll ? [] : data.listPhoto;
    const arrPath = [];
    data.groupPhoto.map(it => {
      if (isSelectAll === true) {
        it.isCheckAll = false;
      } else {
        it.isCheckAll = true;
      }
      it.dataGroup.map(item => {
        if (!isSelectAll) {
          let pathFile = '';
          if (item.photoPath.includes('uploaded')) {
            const name = item.photoPath.substring(
              item.photoPath.lastIndexOf('/') + 1,
              item.photoPath?.length,
            );
            const extension = Platform.OS === 'android' ? 'file://' : '';
            const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
            pathFile = `${path}${name}`;
          } else {
            pathFile = item.photoPath;
          }
          arrPath.push(pathFile);
        }
        item.isCheck = !isSelectAll;
      });
    });

    data.listPhoto.map(it => (it.isCheck = !isSelectAll));

    await setSelectAll(e => !e);
    await setUrlShare(arrPath);
    await setListSelect(arrSelect);
    await filterPhoto('', 'task');
    // await
  };

  const onSelectAllItem = async item => {
    let listSelectF = [];
    const extension = Platform.OS === 'android' ? 'file://' : '';
    const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
    if (item.isCheckAll === true) {
      listSelectF = listSelect.filter(
        it => it[itemSortFeild.sortFeild] !== item.groupId,
      );
      data.listPhoto.map(it => {
        it[itemSortFeild.sortFeild] === item.groupId && (it.isCheck = false);
      });
      item.dataGroup.map(it => {
        const name = it.photoPath.substring(
          it.photoPath.lastIndexOf('/') + 1,
          it.photoPath?.length,
        );
        const indexUrl = urlShare.findIndex(
          itm =>
            itm ===
            (it.photoPath.includes('uploaded') ? path + name : it.photoPath),
        );
        urlShare.splice(indexUrl, 1);
        it.isCheck = false;
      });
      isSelectAll === true && setSelectAll(false);
    } else {
      listSelectF = listSelect.filter(
        it => it[itemSortFeild.sortFeild] !== item.groupId,
      );
      data.listPhoto.map(it => {
        it[itemSortFeild.sortFeild] === item.groupId && (it.isCheck = true);
      });
      item.dataGroup.map(it => {
        const name = it.photoPath.substring(
          it.photoPath.lastIndexOf('/') + 1,
          it.photoPath?.length,
        );
        const indexUrl = urlShare.findIndex(
          itm =>
            itm ==
            (it.photoPath.includes('uploaded') ? path + name : it.photoPath),
        );
        if (indexUrl < 0) {
          urlShare.push(
            it.photoPath.includes('uploaded')
              ? path + it.photoPath
              : it.photoPath,
          );
        }
        listSelectF.push(it);
        it.isCheck = true;
      });
    }
    item.isCheckAll = !item.isCheckAll;
    setListSelect(listSelectF);
  };

  const handleSelectPhoto = async (type, item) => {
    if (type === 'edit') {
      if (listSelect?.length === 1) {
        await setMode(type);
        await setItemPhoto(listSelect[0]);
        await setVisibleModal(true);
      } else {
        ToastError('Chọn 1 ảnh khi chỉnh sửa', 'Thông báo', 'top');
      }
    } else if (type === 'photo') {
      const sortBy =
        itemSortFeild.sortFeild === 'shopId' ? 'shopId' : 'photoDate';
      const dataPhoto =
        data.groupPhoto.find(it => it.groupId === item[sortBy])?.dataGroup ||
        [];
      const indexItem = dataPhoto.findIndex(
        it => it.photoPath === item.photoPath,
      );
      data.listByGroup = dataPhoto;

      // const indexItem = data.listPhoto.findIndex(it => it.photoPath === item.photoPath)

      await setMode(type);
      await setImageIndex(indexItem);
      await setVisibleModal(true);
    } else if (type === 'select') {
      item.isCheck = !item.isCheck;
      let arrUrl = [];
      let arrItemSelect = [];

      data.groupPhoto.map(it => {
        if (
          it.groupId === item[itemSortFeild.sortFeild] &&
          it.isCheckAll === true
        ) {
          it.isCheckAll = false;
        }
      });
      data.listPhoto.map(it => {
        if (it.photoPath === item.photoPath) {
          it.isCheck = item.isCheck;
        }
      });

      const name = item.photoPath.substring(
        item.photoPath.lastIndexOf('/') + 1,
        item.photoPath?.length,
      );
      const extension = Platform.OS === 'android' ? 'file://' : '';
      const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
      const pathFile = item.photoPath.includes('uploaded')
        ? `${path}${name}`
        : item.photoPath;

      const indexUrl = urlShare.findIndex(it => it === pathFile);
      if (indexUrl !== -1) {
        arrUrl = urlShare.filter((it, idx) => idx !== indexUrl);
        arrItemSelect = listSelect.filter(
          it => it.photoPath !== item.photoPath,
        );
        setListSelect(arrItemSelect);
      } else {
        arrUrl = [...urlShare, pathFile];
        listSelect.push(item);
      }

      await setUrlShare(arrUrl);
      if (isSelectAll) {
        setSelectAll(false);
      }
    }
  };

  const handleLongSelect = async item => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.isCheck = true;
    data.listPhoto.map(it => {
      it.photoPath === item.photoPath && (it.isCheck = item.isCheck);
    });
    const name = item.photoPath.substring(
      item.photoPath.lastIndexOf('/') + 1,
      item.photoPath?.length,
    );
    const extension = Platform.OS === 'android' ? 'file://' : '';
    const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
    const pathFile = item.photoPath.includes('uploaded')
      ? `${path}${name}`
      : item.photoPath;
    await listSelect.push(item);
    await setUrlShare([...urlShare, pathFile]);
    await setLongPresss(true);
  };

  const handlerCloseModal = async isDelete => {
    await setMode('');
    await setItemPhoto({});
    await setImageIndex('');
    await setVisibleModal(false);
    if (isDelete) {
      await handleCloseSelect();
      await setData({ groupPhoto: [], groupPhotoF: [], listPhoto: [] });
      await loadData();
    }
  };

  const shareScreen = async () => {
    const arrBase64 = [];
    for (let index = 0; index < urlShare?.length; index++) {
      const it = urlShare[index];
      let pathFile = '';
      if (it?.includes('uploaded') || it?.indexOf('https://') > -1) {
        const name = it?.substring(it?.lastIndexOf('/') + 1, it?.length);
        const extension = Platform.OS === 'android' ? 'file://' : '';
        const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
        pathFile = `${path}${name}`;
      } else {
        pathFile = it;
      }
      RNFS.exists(pathFile).then(async exists => {
        if (!exists) {
          ToastError('Xảy ra lỗi khi tải lên hình ảnh!!!', 'Thông báo', 'top');
          return;
        }
      });
      let ImageAsBase64 = await RNFS.readFile(pathFile, 'base64');
      arrBase64.push(`data:image/jpg;base64,${ImageAsBase64}`);
    }
    const url = arrBase64.length > 1 ? 'urls' : 'url';
    const option = await {
      title: 'Tin nhắn',
      message: userinfo.employeeName + ' chia sẻ hình ảnh',
      [url]: arrBase64.length > 1 ? arrBase64 : arrBase64[0],
    };
    await onShareLocalFile(option);
  };
  const handlerDeleteImage = async () => {
    data.groupPhoto.map(it => {
      const itemdsas = it.dataGroup.filter(item => item.isCheck !== true);
      it.dataGroup = itemdsas;
    });
    data.listPhoto = data.listPhoto.filter(item => item.isCheck !== true);
    setListSelect([]);
    setUrlShare([]);
    listSelect.map(async it => {
      await deletePhotoByPath(it);
    });
    ToastSuccess('Đã xoá hình ảnh!', 'Thông báo', 'top');
    SheetManager.hide('ref_MultiDelete');
  };

  const saveImage = async () => {
    try {
      if (Platform.OS === 'android') {
        ToastSuccess('Đang tiến hành...');
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
            alert('Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!');
            return;
          }
        } else {
          listSelect.map(async it => {
            let photoPath = it.photoPath;
            if (
              it.photoPath.indexOf('https://') > -1 ||
              it.photoPath.includes('uploaded')
            ) {
              const name = it.photoPath.substring(
                it.photoPath.lastIndexOf('/') + 1,
                it.photoPath?.length,
              );
              const extension = Platform.OS === 'android' ? 'file://' : '';
              const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
              photoPath = `${path}${name}`;
            }
            await CameraRoll.save(photoPath, { type: 'photo', album: APPNAME })
              .then(res => {
                console.log(res);
                ToastSuccess('Lưu ảnh thành công!!');
              })
              .catch(error => {
                console.log(error);
                console.log('check');
                ToastError('Lưu ảnh không thành công!!!');
                return;
              });
          });
        }
      } else {
        await listSelect.map(async it => {
          let photoPath = it.photoPath;
          if (
            it.photoPath.indexOf('https://') > -1 ||
            it.photoPath.includes('uploaded')
          ) {
            const name = it.photoPath.substring(
              it.photoPath.lastIndexOf('/') + 1,
              it.photoPath?.length,
            );
            const extension = Platform.OS === 'android' ? 'file://' : '';
            const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
            photoPath = `${path}${name}`;
          }
          // let path = (it.photoPath.indexOf('file://') > -1 || it.photoPath.indexOf('https://') > -1 || !it.photoPath.includes('uploaded') ? it.photoPath : URLDEFAULT + it.photoPath)
          await CameraRoll.save(photoPath, { type: 'photo', album: APPNAME })
            .then(res => {
              console.log('***RES**');
              console.log(res);
              console.log('***RES**');
              ToastSuccess('Lưu ảnh thành công!!');
            })
            .catch(error => {
              console.log('*****');
              console.log(error);
              console.log('*****');
              result = false;
              ToastError('Lưu ảnh không thành công!!!');
              return;
            });
        });
      }
      SheetManager.hide('ref_saveMultiImage');
    } catch (err) {
      console.log(err);
      ToastError('Lỗi, Ứng dụng chưa được cấp quyền');
    }
  };

  const filterPhoto = async (text, type) => {
    if (isLongPress && type !== 'task') {
      await handleCloseSelect();
    }
    if (text) {
      const dataFilter = [];
      data.groupPhotoF.map(it => {
        const newDataShow = it.dataGroup.filter(item => {
          const nameFilter = item[
            itemSortFeild.sortFeild === 'shopId' ? 'photoDate' : 'shopName'
          ]
            ? item[
                itemSortFeild.sortFeild === 'shopId' ? 'photoDate' : 'shopName'
              ]
                .toString()
                .toUpperCase()
            : ''.toUpperCase();
          const textSearch = text.toUpperCase();
          return nameFilter.indexOf(textSearch) > -1;
        });
        dataFilter.push({ ...it, dataGroup: newDataShow });
      });
      data.groupPhoto = dataFilter;
      // setArrDataShow(newDataShow)
      setSearch(text);
    } else {
      data.groupPhoto = data.groupPhotoF;
      // setArrDataShow(arrDataShowF)
      // setDone(false)
      setSearch(text);
    }
  };

  const sortData = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    const sortBy =
      itemSortFeild.sortFeild === 'shopId' ? 'photoDate' : 'shopId';
    const title =
      itemSortFeild.titleFeild === 'shopName' ? 'photoDate' : 'shopName';
    const dataSort = data.listPhoto?.sort((a, b) => a[sortBy] < b[sortBy]);
    const { arr } = groupDataByKey({
      arr: dataSort,
      key: sortBy,
    });
    const result = await groupByShop(arr, sortBy, title);
    // res?.sort((a, b) => a.id < b.id);
    setItemSortFeild({ sortFeild: sortBy, titleFeild: title });
    await setData({
      groupPhoto: result,
      groupPhotoF: result,
      listPhoto: data.listPhoto,
    });
  };
  const handleSaveImage = async () => {
    await saveImage();
    data.groupPhoto.map(it => {
      it.dataGroup.map(item => {
        item.isCheck = false;
      });
    });
    data.listPhoto.map(it => (it.isCheck = false));
    await setListSelect([]);
    await setUrlShare([]);
  };
  const handleSelectSave = async () => {
    // setMutate(e => !e)
    SheetManager.show('ref_saveMultiImage');
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ flex: 1 }}>
        {item.dataGroup?.length > 0 && (
          <View
            style={{
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                padding: 10,
                fontWeight: '600',
                fontSize: 14,
                color: appcolor.dark,
              }}
            >
              {item.title}
            </Text>
            {isLongPress && (
              <TouchableOpacity
                onPress={() => onSelectAllItem(item)}
                // onLongPress={() => !isLongPress ? handleLongSelect(item) : null}
                style={{
                  padding: 5,
                  borderRadius: 20,
                  backgroundColor: appcolor.surface,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                  paddingHorizontal: 10,
                  borderWidth: 0.3,
                  borderColor: item.isCheckAll ? appcolor.info : appcolor.dark,
                }}
              >
                <Text
                  style={{
                    fontWeight: '300',
                    fontSize: 12,
                    color: item.isCheckAll ? appcolor.info : appcolor.dark,
                  }}
                >
                  {item.isCheckAll ? 'Bỏ chọn' : 'chọn tất cả'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            keyExtractor={(_, index) => index.toString()}
            data={item.dataGroup}
            renderItem={renderItemGroup}
            numColumns={4}
          />
        </View>
      </View>
    );
  };
  const renderItemGroup = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          handleSelectPhoto(isLongPress ? 'select' : 'photo', item)
        }
        onLongPress={() => (!isLongPress ? handleLongSelect(item) : null)}
        style={{ margin: 1 }}
      >
        <View
          style={{
            width: (deviceWidth - 16) / 4,
            borderRadius: 10,
            height: 130,
            backgroundColor: appcolor.surface,
          }}
        >
          {item.photoPath.includes('uploaded') ? (
            <CacheImage
              containerStyle={{ borderRadius: 10 }}
              resizeMode={'cover'}
              source={{
                uri:
                  item.photoPath !== null &&
                  (item.photoPath.indexOf('file://') > -1 ||
                  item.photoPath.indexOf('https://') > -1
                    ? item.photoPath
                    : URLDEFAULT + item.photoPath),
              }}
            />
          ) : (
            <ImageBackground
              imageStyle={{
                borderRadius: 5,
                backgroundColor: appcolor.surface,
              }}
              style={{ height: '100%', width: '100%' }}
              source={{ uri: item.photoPath }}
            />
          )}
        </View>
        {isLongPress && (
          <SpiralIcon
            type="feather"
            name={item.isCheck ? 'check-circle' : 'circle'}
            size={20}
            containerStyle={{
              position: 'absolute',
              bottom: 5,
              right: 5,
              width: 20,
              height: 20,
            }}
            color={item.isCheck ? appcolor.success : appcolor.white}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        rightFunc={() => sortData()}
        iconRight={'sort'}
        title={kpiinfo?.menuNameVN || 'Danh sách hình ảnh'}
      />

      <FormGroup
        containerStyle={{
          backgroundColor: appcolor.light,
          margin: 8,
          marginBottom: 0,
          alignSelf: 'center',
        }}
        inputStyle={{ fontSize: 13, color: appcolor.dark }}
        placeholder="Tìm kiếm hình ảnh"
        editable
        onEndEditing={() => {}}
        onClearTextAndroid={filterPhoto}
        iconName="search"
        value={search}
        handleChangeForm={filterPhoto}
      />
      <View style={{ flex: 1, padding: 4, backgroundColor: appcolor.light }}>
        {isLongPress && (
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => handleCloseSelect()}
                style={{
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 10,
                  borderRadius: 10,
                }}
              >
                <SpiralIcon
                  type="feather"
                  name="x"
                  size={30}
                  color={appcolor.dark}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Đã chọn : {listSelect?.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleSelectTask()}
              style={{
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10,
                borderRadius: 10,
              }}
            >
              <SpiralIcon
                type="font-awesome-5"
                name="tasks"
                size={25}
                color={isSelectAll ? appcolor.primary : appcolor.dark}
              />
            </TouchableOpacity>
          </View>
        )}
        {data.groupPhoto?.length > 0 ? (
          <FlatList
            key={'listGroupPhoto'}
            keyExtractor={(_, index) => index.toString()}
            data={data.groupPhoto}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 200 }} />}
            renderItem={renderItem}
          />
        ) : (
          <View style={{ paddingTop: 30 }}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                textAlign: 'center',
                color: appcolor.dark,
              }}
            >
              Chưa có dữ liệu hình ảnh
            </Text>
          </View>
        )}
      </View>
      {isLongPress && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 70,
            borderTopStartRadius: 10,
            borderTopEndRadius: 10,
            width: '100%',
            backgroundColor: appcolor.surface,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <View style={{ padding: 5, flex: 1 }}>
            <TouchableOpacity
              onPress={() => handleSelectSave()}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                type="feather"
                name="save"
                size={20}
                color={appcolor.dark}
              />
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 12,
                  color: appcolor.dark,
                }}
              >
                lưu
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 5, flex: 1 }}>
            <TouchableOpacity
              onPress={() => handleSelectPhoto('edit')}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                type="feather"
                name="edit"
                size={20}
                color={appcolor.dark}
              />
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 12,
                  color: appcolor.dark,
                }}
              >
                Sửa
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 5, flex: 1 }}>
            <TouchableOpacity
              onPress={() => shareScreen()}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                type="fontawe-some"
                name="share"
                size={20}
                color={appcolor.dark}
              />
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 12,
                  color: appcolor.dark,
                }}
              >
                Chia sẻ
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 5, flex: 1 }}>
            <TouchableOpacity
              onPress={() => SheetManager.show('ref_MultiDelete')}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                type="feather"
                name="trash-2"
                size={20}
                color={appcolor.dark}
              />
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 12,
                  color: appcolor.dark,
                }}
              >
                Xoá
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ActionSheet
        id={'ref_MultiDelete'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            height: 160,
            width: deviceWidth,
            backgroundColor: appcolor.light,
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
          }}
        >
          <View
            style={{
              height: 100,
              width: deviceWidth,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 18,
                color: appcolor.dark,
                padding: 5,
              }}
            >
              Xoá
            </Text>
            <Text
              style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}
            >
              Xoá {listSelect?.length} mục đã chọn?
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: 60,
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              onPress={() => SheetManager.hide('ref_MultiDelete')}
              style={{
                height: 40,
                width: '30%',
                marginLeft: 40,
                backgroundColor: appcolor.surface,
                padding: 8,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 16,
                  color: appcolor.dark,
                }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlerDeleteImage()}
              style={{
                height: 40,
                width: '30%',
                marginRight: 40,
                backgroundColor: appcolor.info,
                padding: 8,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 16,
                  color: appcolor.light,
                }}
              >
                Xoá
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
      <ActionSheet
        id={'ref_saveMultiImage'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            height: 160,
            width: deviceWidth,
            backgroundColor: appcolor.light,
            borderTopEndRadius: 20,
            borderTopStartRadius: 20,
          }}
        >
          <View
            style={{
              height: 100,
              width: deviceWidth,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 18,
                color: appcolor.dark,
                padding: 5,
              }}
            >
              Lưu hình
            </Text>
            <Text
              style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}
            >
              Lưu {listSelect.length} hình?
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: 60,
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              onPress={() => SheetManager.hide('ref_saveMultiImage')}
              style={{
                height: 40,
                width: '30%',
                marginLeft: 40,
                backgroundColor: appcolor.surface,
                padding: 8,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 16,
                  color: appcolor.dark,
                }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSaveImage()}
              style={{
                height: 40,
                width: '30%',
                marginRight: 40,
                backgroundColor: appcolor.info,
                padding: 8,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 16,
                  color: appcolor.light,
                }}
              >
                Lưu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
      <Modal visible={visibleModal} style={{ flex: 1 }}>
        {mode == 'photo' && (
          <MultipleShowImage
            key={'ShowItemImage'}
            listItem={data.listByGroup}
            closeShowImage={value => handlerCloseModal(value)}
            indexItem={imageIndex}
            isUseTool={true}
            isShowText={true}
            sortFeild={itemSortFeild.sortFeild}
          />
        )}
        {mode == 'edit' && (
          <ModalEditImage
            itemPhoto={itemPhoto}
            data={data}
            onClose={handlerCloseModal}
            appcolor={appcolor}
            itemSortFeild={itemSortFeild}
          />
        )}
      </Modal>
    </View>
  );
};

const ModalEditImage = gestureHandlerRootHOC(
  ({
    appcolor,
    data,
    onClose,
    itemPhoto,
    showReview = false,
    itemSortFeild,
  }) => {
    const [ImagePath, setImagePath] = useState('');
    const [pathReview, setPathReview] = useState('');
    const [viewSize, setViewSize] = useState({
      widthViewShot: 0,
      heightViewShot: 0,
    });
    const [isShowReview, setShowReview] = useState(showReview);
    const viewShot = useRef();
    const [idRandom, setIdRandom] = useState();
    useEffect(() => {
      loadData();
      getRandomId();
      return () => false;
    }, []);
    const getRandomId = () => {
      let idRandom = Math.floor(Math.random() * 100000) + 1;
      const arrDuplicate = data.listPhoto.filter(it => it.id === idRandom);
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
          () => {},
        );
      } else {
        ToastError('Xảy ra lỗi khi lưu!', 'Lỗi');
        onClose();
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
          const path = `${extension}${
            Platform.OS === 'android'
              ? RNFS.PicturesDirectoryPath
              : RNFS.LibraryDirectoryPath
          }/${APPNAME}/`;
          const file_path = `${path}${fileName}`;

          RNFS.mkdir(path).catch(err => {
            //console.log('mkdir error', err);
          });
          RNFS.writeFile(file_path, viewShotBase64, 'base64').catch(error => {
            alert(JSON.stringify(error));
          });

          let itemGroup = {
            ...itemPhoto,
            id: idRandom,
            isCheck: false,
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
          const indexGroup = data.groupPhoto.findIndex(
            it => it.groupId === itemPhoto[itemSortFeild.sortFeild],
          );
          data.groupPhoto[indexGroup].dataGroup = [
            ...data.groupPhoto[indexGroup].dataGroup,
            itemGroup,
          ];
          const arrListPhoto = [...data.listPhoto, itemGroup];
          data.listPhoto = arrListPhoto.sort(
            (a, b) => a[itemSortFeild] - b[itemSortFeild],
          );
          await onClose();
          await ToastSuccess('Đã lưu chỉnh sửa');
        },
      );
    };
    const onGobackReview = async () => {
      await setShowReview(false);
      await setPathReview('');
    };
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {isShowReview ? (
          <View style={{ width: '100%', height: '100%' }}>
            <HeaderCustom
              iconRight={'save'}
              leftFunc={() => onGobackReview()}
              rightFunc={() => SavePhoto()}
            />
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: appcolor.light,
              }}
            >
              <ViewShot
                style={{
                  width:
                    viewSize.widthViewShot === 0
                      ? '100%'
                      : viewSize.widthViewShot,
                  height:
                    viewSize.heightViewShot === 0
                      ? '80%'
                      : viewSize.heightViewShot,
                }}
                ref={viewShot}
                options={{ format: 'jpg', quality: 0.8, result: 'base64' }}
              >
                <ImageZoom ImagePath={pathReview} />
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ paddingLeft: 10, paddingTop: 5 }}>
                    <Text
                      style={{
                        color: 'red',
                        width: '100%',
                        fontWeight: '600',
                        textAlign: 'left',
                        fontSize: 10,
                      }}
                    >
                      {`${itemPhoto.address}`}
                    </Text>
                    <Text
                      style={{
                        color: 'red',
                        fontWeight: '600',
                        textAlign: 'left',
                        fontSize: 10,
                      }}
                    >
                      {`${
                        itemPhoto.shopName
                      } [${itemPhoto.wShopCode?.toUpperCase()}]`}
                    </Text>
                  </View>
                  {(URLDEFAULT.includes('spiral') ||
                    URLDEFAULT.includes('sucbat')) && (
                    <Image
                      source={require('../../Themes/Images/watermark.png')}
                      resizeMode={'contain'}
                      style={{ height: 300, opacity: 0.5, width: '100%' }}
                    ></Image>
                  )}
                  <View style={{ paddingRight: 10, paddingBottom: 5 }}>
                    <Text
                      style={{
                        color: 'red',
                        width: '100%',
                        fontWeight: '600',
                        textAlign: 'right',
                        fontSize: 10,
                      }}
                    >
                      {`${itemPhoto.photoFullTime}`}
                    </Text>
                  </View>
                </View>
              </ViewShot>
            </View>
          </View>
        ) : (
          <SafeAreaView
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: appcolor.black,
            }}
          >
            {ImagePath !== '' && ImagePath?.length > 0 && (
              <DrawWithOptions
                close={() => onClose()}
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
