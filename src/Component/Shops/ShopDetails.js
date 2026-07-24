import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector, useDispatch } from 'react-redux';
import { UpdateLocationStoreList } from '../../Controller/PhotoController';
import { TODAY } from '../../Core/Utility';
import { getIdMaxOverview } from '../../Controller/WorkController';
import {
  CheckLocation,
  LocationEnabled,
  ToastError,
  formatPhone,
  checkLinkType,
  UUIDGenerator,
} from '../../Core/Helper';
import FormGroup from '../../Content/FormGroup';
import ShopLocation from './ShopLocation';
import NativeCamera from '../../Control/NativeCamera';
import moment from 'moment';
import { SetShopInfo } from '../../Redux/action';
import { useIsFocused } from '@react-navigation/native';
import { LOCATION_INFO } from '../../Utils/LocationInfo';
import { UpdateShopInfo } from '../../Controller/ShopController';
import ViewPictures from '../../Control/Gallary/ViewPictures';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const ShopDetails = ({ navigation }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [isNullPhotoShop, setIsNullPhotoShop] = useState(false);
  const [isPermissLocation, setIsPermissLocation] = useState(false);
  const [pictureShow, _setPictureShow] = useState({
    visible: false,
    index: 0,
    dataShow: [],
  });
  const [isMap, setIsMap] = useState(false);
  const [isFileUpload, setIsFileUpload] = useState(-1);
  const [urlImage, setUrlImage] = useState(null);
  const [latitudePo, setLatitudePo] = useState(0);
  const [longitudePo, setLongitudePo] = useState(0);
  const [_mutate, setMutate] = useState(false);
  //
  const path = checkLinkType(shopinfo?.imageUrl);
  const config = JSON.parse(shopinfo?.config || '{}') || {};
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const loadData = async () => {
    let urlOverview = (await shopinfo?.imageUrl) || null;
    if (urlOverview !== null) {
      setUrlImage(urlOverview);
    } else {
      setIsNullPhotoShop(true);
    }

    let lstOverview = await getIdMaxOverview(shopinfo.shopId, TODAY);
    if (lstOverview.length > 0) {
      let url = lstOverview[0].photoPath;
      if (url !== '') {
        setUrlImage(null);
        setUrlImage(url);
        setIsFileUpload(lstOverview[0].fileUpload);

        await delay(1000);
        if (isNullPhotoShop === true) {
          await UpdateLocationStoreList(
            lstOverview[0].latitude,
            lstOverview[0].longitude,
            shopinfo.shopId,
          );
          dispatch(
            SetShopInfo({
              ...shopinfo,
              latitude: lstOverview[0].latitude,
              longitude: lstOverview[0].longitude,
            }),
          );
        }
      }
    } else {
      let urlOverview = shopinfo.imageUrl || null;
      if (urlOverview !== null) {
        setUrlImage(urlOverview);
      }
    }
  };
  const callBackOverView = async info => {
    await dispatch(SetShopInfo({ ...shopinfo, imageUrl: info.imageUrl }));
    await UpdateShopInfo({ ...shopinfo, imageUrl: info.imageUrl });
    await DeviceEventEmitter.emit('RELOAD_DATA_SHOP');
  };
  const getLocationLast = () => {
    LOCATION_INFO.getCurrentLocation(
      info => {
        setLatitudePo(info.latitude);
        setLongitudePo(info.longitude);
      },
      error => {
        ToastError(error.message);
      },
    );
  };
  const takeOverview = async () => {
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: -1,
      photoDate: shopinfo.auditDate || TODAY,
      photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
      photoType: '-1',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      latitude: latitudePo,
      longitude: longitudePo,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };

    await LocationEnabled(async enabled => {
      if (enabled === true) {
        if (
          (shopinfo.latitude == 0 || shopinfo.longitude == 0) &&
          (!photoinfo.latitude || !photoinfo.longitude)
        ) {
          await getLocationLast();
          await takeOverview();
        } else {
          NativeCamera.cameraStart(photoinfo, {
            ...shopinfo,
            callBackOverView,
          });
        }
      } else {
        CheckLocation(() => {
          setIsPermissLocation(true);
        });
        await delay(1000);
        if (isPermissLocation === true) {
          LocationEnabled(() =>
            NativeCamera.cameraStart(photoinfo, {
              ...shopinfo,
              callBackOverView,
            }),
          );
        }
      }
    });
  };
  const handlerPressImage = () => {
    pictureShow.visible = true;
    pictureShow.index = 0;
    pictureShow.dataShow = [{ photoPath: urlImage, photoType: 'OVERVIEW' }];
    setMutate(e => !e);
  };
  const handlerCloseImage = () => {
    pictureShow.visible = false;
    pictureShow.dataShow = [];
    setMutate(e => !e);
  };

  useEffect(() => {
    loadData();
    getLocationLast();

    const goShopMapListener = DeviceEventEmitter.addListener(
      'GO_SHOP_MAP',
      async () => {
        setIsMap(true);
      },
    );

    return () => {
      goShopMapListener.remove();
    };
  }, [isFocused]);

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      width: '100%',
      backgroundColor: appcolor.light,
    },
    headerContainer: {
      padding: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    scrollView: { flex: 1 },
    buttonContainer: { flexDirection: 'row', backgroundColor: appcolor.light },
    mapButton: {
      borderRadius: 50,
      padding: 5,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      height: 35,
      marginEnd: 5,
    },
    mapButtonText: {
      alignSelf: 'center',
      fontWeight: '500',
      paddingLeft: 10,
      paddingRight: 10,
    },
    imageButton: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      borderRadius: 50,
    },
    imageButtonText: {
      alignSelf: 'center',
      fontWeight: '700',
      paddingLeft: 10,
      paddingRight: 10,
    },
    updateButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      borderRadius: 50,
      marginStart: 5,
    },
    updateButtonText: {
      alignSelf: 'center',
      fontWeight: '500',
      color: appcolor.white,
      paddingLeft: 10,
      paddingRight: 10,
    },
    imageContainer: { justifyContent: 'flex-end', margin: 7 },
    imageWrapper: {
      width: '100%',
      minHeight: 230,
      backgroundColor: appcolor.surface,
      borderRadius: 12,
    },
    image: { width: '100%', minHeight: 230, borderRadius: 12 },
    cameraButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.blacklight,
      borderRadius: 5,
      padding: 5,
      opacity: 0.8,
    },
    cameraButtonText: {
      alignSelf: 'center',
      fontWeight: '700',
      color: appcolor.light,
    },
    mapContainer: { width: '100%', minHeight: 230 },
    formContainer: {
      padding: 5,
      paddingBottom: 150,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    actionSheetContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    closeButton: { position: 'absolute', right: 20, top: 40, zIndex: 100 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ScrollView
          style={styles.scrollView}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => setIsMap(!isMap)}
              style={[
                styles.mapButton,
                {
                  backgroundColor: isMap ? appcolor.primary : appcolor.surface,
                },
              ]}
            >
              <SpiralIcon
                size={20}
                color={isMap ? appcolor.white : appcolor.dark}
                name={'map'}
                type="fontasomeware"
              />
              <Text
                style={[
                  styles.mapButtonText,
                  { color: isMap ? appcolor.white : appcolor.dark },
                ]}
              >
                {'Bản đồ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsMap(!isMap)}
              style={[
                styles.imageButton,
                {
                  backgroundColor: isMap ? appcolor.surface : appcolor.primary,
                },
              ]}
            >
              <SpiralIcon
                iconStyle={{
                  color: isMap ? appcolor.dark : appcolor.white,
                  paddingLeft: 10,
                }}
                size={30}
                name="image"
                type="ionicon"
              />
              <Text
                style={[
                  styles.imageButtonText,
                  { color: isMap ? appcolor.dark : appcolor.white },
                ]}
              >
                Hình tổng quan
              </Text>
            </TouchableOpacity>

            {config.storeUpdate == 1 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('updatestore')}
                style={styles.updateButton}
              >
                <SpiralIcon
                  iconStyle={{ color: appcolor.white, paddingLeft: 10 }}
                  size={20}
                  name="home"
                  type="ionicon"
                />
                <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.imageContainer}>
        {!isMap ? (
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={handlerPressImage}
          >
            <Image source={{ uri: path }} style={styles.image} />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={takeOverview}
            >
              <SpiralIcon
                iconStyle={{ color: appcolor.light }}
                size={30}
                name="camera-outline"
                type="ionicon"
              />
              <Text style={styles.cameraButtonText}>Chụp hình</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <View style={styles.mapContainer}>
            <ShopLocation />
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <FormGroup title="Mã cửa hàng" value={shopinfo.shopCode} />
          <FormGroup
            title="Cửa hàng"
            value={shopinfo.shopName}
            editable={false}
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin'}
          />
          <FormGroup
            key="province"
            title="Tỉnh/TP"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin Tỉnh/TP'}
            value={shopinfo.province}
          />
          <FormGroup
            key="district"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin quận/huyện'}
            title="Quận/huyện"
            value={shopinfo.district}
          />
          <FormGroup
            key="town"
            title="Phường/xã"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin phường/xã'}
            value={shopinfo.town}
          />
          <FormGroup
            key="address"
            editable={false}
            title="Số nhà/Đường"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin nhà/Đường'}
            value={shopinfo.address}
          />
          <FormGroup key="region" title="Khu vực" value={shopinfo.region} />
          <FormGroup key="area" title="Vùng" value={shopinfo.area} />
          <FormGroup
            key="storeSize"
            title="Diện tích"
            editable={false}
            value={shopinfo.storeSize?.toString() || ''}
            keyboardType="numeric"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin diện tích'}
          />
          <FormGroup
            key="contactName"
            title="Người liên hệ"
            editable={false}
            value={shopinfo.contactName}
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin tên người liên hệ'}
          />
          <FormGroup
            key="phone"
            title="Số điện thoại"
            value={formatPhone(shopinfo.phone || '')}
            keyboardType="numeric"
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin số điện thoại'}
            editable={false}
          />
          <FormGroup
            key="email"
            title="Email"
            value={shopinfo.email}
            editable={false}
            placeholderTextColor={appcolor.greydark}
            placeholder={'Chưa có thông tin email'}
          />
        </View>
      </ScrollView>

      <ViewPictures
        visible={pictureShow.visible}
        images={pictureShow.dataShow}
        initialIndex={pictureShow.index}
        onSwipeDown={handlerCloseImage}
      />
      {/* <ActionSheet ref={bottomSheet}>
                <View style={styles.actionSheetContainer}>
                    <ImageZoom ImagePath={path} />
                    <TouchableOpacity
                        onPress={() => showOverView(null)}
                        style={styles.closeButton}
                    >
                        <SpiralIcon name='close' type='font-asomeware-5' size={30} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
            </ActionSheet> */}
    </View>
  );
};

export default ShopDetails;
