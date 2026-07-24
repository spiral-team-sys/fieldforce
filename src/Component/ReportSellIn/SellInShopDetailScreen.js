import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge, Icon as ICO, Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
////import { NumericFormat } from "react-number-format";;
import { REPORT } from '../../API/ReportAPI';
import { SellInAPI } from '../../API/SellInApi';
import { getConfirmSellInList } from '../../Controller/SellInController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { alertConfirm } from '../../Core/Utility';
import { ToastError, ToastSuccess } from '../../Core/Helper';
import { URLDEFAULT } from '../../Core/URLs';
import { scaleSize } from '../../Themes/AppsStyle';
import ViewPictures from '../../Control/Gallary/ViewPictures';
import CustomListView from '../../Control/Custom/CustomListView';

const SellInShopDetailScreen = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const {
    shopInfo,
    statusInfo,
    listReport,
    dataFilter: dataFilterRoute,
  } = route.params;
  const [data, setData] = useState(shopInfo.dataOrders || []);
  const [dataConfirmValue, setDataConfirmValue] = useState([]);
  const [visibleOption, setVisibleOption] = useState(false);
  const [isDelete, setDelete] = useState(0);
  const [titleDelete, setTitleDelete] = useState('Xóa');
  const [loading, setLoading] = useState(false);
  const [orderExpand, setOrderExpand] = useState('');
  const [photoViewer, setPhotoViewer] = useState({
    visible: false,
    photos: [],
    index: 0,
  });

  useEffect(() => {
    LoadData();
    const reloadData = DeviceEventEmitter.addListener(
      'RELOAD_DATA_SELLIN',
      LoadData,
    );
    return () => reloadData.remove();
  }, []);

  const LoadData = async () => {
    setLoading(true);
    try {
      const confirmValue = await getConfirmSellInList();
      const dataFilter = {
        shopId: shopInfo.shopId || 0,
        fromDate: dataFilterRoute?.FromDate || null,
        toDate: dataFilterRoute?.ToDate || null,
        reportId: kpiinfo.id,
      };

      await REPORT.GetDataReportByShop_RealTime(
        dataFilter,
        async (mData, message) => {
          message && ToastError(message);
          const itemData = Array.isArray(mData) ? mData[0] : mData;
          const jsonData = itemData?.jsonData
            ? JSON.parse(itemData.jsonData || '[]')
            : Array.isArray(mData)
            ? mData
            : [];
          const dataOrders = handlerGetShopOrders(jsonData);
          setData(dataOrders);
        },
      );

      setDataConfirmValue(confirmValue);
      setDelete(0);
      setVisibleOption(false);
    } catch (error) {
      ToastError(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlerGetShopOrders = jsonData => {
    if (!Array.isArray(jsonData)) return shopInfo.dataOrders || [];
    if (jsonData[0]?.dataShop !== undefined) {
      const statusData =
        jsonData.find(item => item.statusId == statusInfo.statusId) || {};
      const dataShop =
        statusData.dataShop || _.flatMap(jsonData, item => item.dataShop || []);
      const shopData =
        dataShop.find(item => item.shopId == shopInfo.shopId) || {};
      return handlerBuildOrderList(shopData);
    }
    if (
      jsonData[0]?.dataOrders !== undefined ||
      jsonData[0]?.dataDetail !== undefined
    ) {
      const shopData =
        jsonData.find(item => item.shopId == shopInfo.shopId) || {};
      return handlerBuildOrderList(shopData);
    }
    return handlerBuildOrderList({ dataDetail: jsonData });
  };

  const handlerBuildOrderList = shopData => {
    if (Array.isArray(shopData.dataOrders)) return shopData.dataOrders;
    const dataDetail = shopData.dataDetail || [];
    return _(dataDetail)
      .groupBy('orderNo')
      .map((items, orderNo) => ({
        orderNo,
        totalOrderRevenue: _.sumBy(items, it => Number(it.revenue || 0)),
        dataDetail: items,
      }))
      .value();
  };

  const handlerGetPhotos = item => {
    const dataDetail = item.dataDetail || [item];
    const photos = [];
    dataDetail.forEach(detail => {
      if (Array.isArray(detail.photos)) {
        photos.push(...detail.photos);
        return;
      }
      if (typeof detail.photos === 'string') {
        try {
          photos.push(...JSON.parse(detail.photos || '[]'));
        } catch {}
      }
    });
    return _.uniqBy(photos, 'photoPath');
  };

  const handlerGetOrderQuantity = item => {
    return _.sumBy(item.dataDetail || [], it => Number(it.quantityValue || 0));
  };

  const handlerGetOrderDate = item => {
    const firstItem = item.dataDetail?.[0] || {};
    return firstItem.date
      ? moment(firstItem.date).format('DD/MM/YYYY')
      : firstItem.workDate;
  };

  const handlerGetOrderKey = (item, index) => {
    return `${item.orderNo || 'ORDER'}_${index}`;
  };

  const handlerGetDeleteItems = () => {
    return _.flatMap(
      data.filter(item => item.isChoose === 1),
      item => item.dataDetail || [],
    );
  };

  const handlerToggleOrder = (item, index) => {
    if (visibleOption && handlerCanDeleteOrder(item)) {
      onSelectItemDel(item, index);
      return;
    }
    const key = handlerGetOrderKey(item, index);
    setOrderExpand(orderExpand === key ? '' : key);
  };

  const handlerCanDeleteOrder = item => {
    return !_.some(item.dataDetail || [], detail => detail.confirmBy != null);
  };

  const handlerGetConfirmInfo = item => {
    return (
      _.find(item.dataDetail || [], detail => detail.confirmBy != null) || {}
    );
  };

  const handlerUpdateOrderDetail = async (order, confirmed, statusUpdate) => {
    const firstItem = order.dataDetail?.[0];
    if (!firstItem) return;
    onUpdateOrder(firstItem, confirmed, statusUpdate);
  };

  const renderProductDetail = (detail, idx) => (
    <View key={`${detail.orderId || idx}_detail`} style={styles.productDetail}>
      {!!detail.confirmTime && (
        <RenderItemText
          appcolor={appcolor}
          type="Info"
          titleName="Thời gian xác nhận: "
          itemValue={moment(detail.confirmTime).format('HH:mm - DD/MM/YYYY')}
        />
      )}
      {!!detail.confirmNote && (
        <RenderItemText
          appcolor={appcolor}
          type="Info"
          titleName="Ghi chú xác nhận: "
          itemValue={detail.confirmNote}
        />
      )}
      <RenderItemText
        appcolor={appcolor}
        type="Info"
        titleName="Mã sản phẩm: "
        itemValue={detail.productId}
      />
      <RenderItemText
        appcolor={appcolor}
        type="Info"
        titleName="Sản phẩm: "
        itemValue={`${detail.categoryName || ''} ${detail.productName || ''}`}
      />
      <RenderItemText
        appcolor={appcolor}
        type="Info"
        titleName="Số lượng: "
        itemValue={detail.quantityValue || 0}
      />
      {detail.price !== null &&
        detail.price !== undefined &&
        detail.price !== 0 && (
          <RenderItemText
            appcolor={appcolor}
            type="Price"
            titleName="Giá: "
            itemValue={detail.price}
          />
        )}
      {detail.revenue !== null && detail.revenue !== undefined && (
        <RenderItemText
          appcolor={appcolor}
          type="Price"
          titleName="Doanh thu: "
          itemValue={detail.revenue}
        />
      )}
    </View>
  );

  const onCreateOrder = () => {
    navigation.navigate('createsellinbyshop', {
      listReport: {
        ...listReport,
        shopId: shopInfo.shopId,
        shopName: shopInfo.shopName,
      },
      itemSave: {
        ShopId: shopInfo.shopId,
        ShopName: shopInfo.shopName,
      },
    });
  };

  const onLongPressDel = item => {
    if (!handlerCanDeleteOrder(item)) return;
    setVisibleOption(true);
    setDelete(1);
    setTitleDelete('Xóa (1)');
    const indexItem = data.findIndex(it => it.orderNo == item.orderNo);
    if (indexItem >= 0) {
      data[indexItem].isChoose = 1;
      setData([...data]);
    }
  };

  const onSelectItemDel = item => {
    const nextCount = item.isChoose == 1 ? isDelete - 1 : isDelete + 1;
    const indexItem = data.findIndex(it => it.orderNo == item.orderNo);
    if (indexItem >= 0) {
      data[indexItem].isChoose = item.isChoose == 1 ? 0 : 1;
      setData([...data]);
    }
    setDelete(nextCount);
    setTitleDelete(`Xóa (${nextCount})`);
    if (nextCount <= 0) {
      setVisibleOption(false);
      setTitleDelete('Xóa');
    }
  };

  const onDelete = async () => {
    const listDelete = handlerGetDeleteItems();
    if (listDelete.length === 0) {
      ToastError('Không có dữ liệu để xoá');
      return;
    }
    alertConfirm(
      'Xóa dữ liệu',
      `Bạn có chắc chắn muốn xoá hoá đơn đã chọn không ?`,
      async () => {
        const result = await SellInAPI.DeleleList(JSON.stringify(listDelete));
        if (result.statusId === 200) {
          ToastSuccess(`Đã xoá ${listDelete.length}`);
          setDelete(0);
          setVisibleOption(false);
          navigation.goBack();
          DeviceEventEmitter.emit('RELOAD_DATA_SELLIN');
          return;
        }
        ToastError(`Có lỗi trong lúc xoá dữ liệu ${result.messager}`);
      },
      () => {},
      'Đồng ý',
      'Huỷ',
    );
  };

  const onUpdateOrder = async (item, confirmed, statusUpdate) => {
    alertConfirm(
      statusUpdate,
      `Xác nhận ${statusUpdate} đơn hàng này không ?`,
      async () => {
        item.confirmed = confirmed;
        const result = await SellInAPI.UpdateOrder(JSON.stringify(item));
        if (result.statusId == 200) {
          ToastSuccess(result.messager);
          DeviceEventEmitter.emit('RELOAD_DATA_SELLIN');
        } else {
          ToastError(result.messager);
        }
      },
      () => {},
      'Đồng ý',
      'Huỷ',
    );
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    shopHeader: {
      margin: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: appcolor.surface,
    },
    shopName: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      letterSpacing: -0.3,
      color: appcolor.dark,
    },
    shopMeta: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '400',
      color: appcolor.placeholderText,
      marginTop: 4,
    },
    shopRevenue: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '700',
      color: appcolor.primary,
      marginTop: 4,
    },
    shopAddress: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      color: appcolor.greydark,
      marginTop: 8,
    },
    statusText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      color: appcolor.primary,
      marginTop: 8,
    },
    itemStyle: {
      position: 'relative',
      backgroundColor: appcolor.surface,
      marginHorizontal: 8,
      marginBottom: 8,
      padding: 12,
      paddingRight: 56,
      borderRadius: 16,
    },
    textButtonAction: {
      color: appcolor.light,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      borderRadius: 6,
      borderWidth: 0.5,
      padding: 8,
    },
    buttonAction: { minHeight: 44, justifyContent: 'center', marginRight: 8 },
    groupPhotoContainer: {
      width: '100%',
      marginTop: 12,
      paddingTop: 12,
      gap: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
    },
    productDetail: {
      paddingVertical: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
    },
    orderTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: appcolor.dark,
    },
    photoTitle: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      color: appcolor.dark,
    },
    photoList: { gap: 12, paddingRight: 8 },
    photoItem: { width: 144, gap: 4 },
    photoImage: {
      width: 144,
      height: 112,
      borderRadius: 16,
      backgroundColor: appcolor.surface,
    },
    photoTime: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    badgeContainer: { position: 'absolute', top: 12, right: 12 },
    listContent: { paddingBottom: 24 },
  });

  const renderItem = ({ item, index }) => {
    const photos = handlerGetPhotos(item);
    const onShowPhoto = photoIndex =>
      setPhotoViewer({ visible: true, photos, index: photoIndex });
    const orderKey = handlerGetOrderKey(item, index);
    const isExpand = orderExpand === orderKey;
    const confirmInfo = handlerGetConfirmInfo(item);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={
          handlerCanDeleteOrder(item) ? () => onLongPressDel(item) : null
        }
        onPress={() => handlerToggleOrder(item, index)}
      >
        <View style={styles.itemStyle}>
          {!!confirmInfo.statusOrder && (
            <RenderItemText
              appcolor={appcolor}
              type="Status"
              titleName="Trạng thái: "
              itemValue={confirmInfo.statusOrder}
              colorByRow={confirmInfo.colorStatus}
            />
          )}
          {confirmInfo.confirmBy != null && (
            <RenderItemText
              appcolor={appcolor}
              type="Status"
              titleName="Xác nhận bởi "
              itemValue={confirmInfo.confirmByName || confirmInfo.confirmBy}
              colorByRow={confirmInfo.colorStatus}
            />
          )}
          <Text style={styles.orderTitle}>{item.orderNo || 'Hóa đơn'}</Text>
          <RenderItemText
            appcolor={appcolor}
            type="Info"
            titleName="Ngày: "
            itemValue={handlerGetOrderDate(item)}
          />
          <RenderItemText
            appcolor={appcolor}
            type="Info"
            titleName="Tổng số lượng: "
            itemValue={handlerGetOrderQuantity(item)}
          />
          <RenderItemText
            appcolor={appcolor}
            type="Price"
            titleName="Tổng doanh thu: "
            itemValue={
              item.totalOrderRevenue ||
              _.sumBy(item.dataDetail || [], it => Number(it.revenue || 0))
            }
          />
          {isExpand && (
            <View style={styles.groupPhotoContainer}>
              <Text style={styles.photoTitle}>Chi tiết hóa đơn</Text>
              {(item.dataDetail || []).map(renderProductDetail)}
              {photos.length > 0 && (
                <>
                  <Text
                    style={styles.photoTitle}
                  >{`${photos.length} hình ảnh`}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoList}
                  >
                    {photos.map((photo, photoIndex) => (
                      <TouchableOpacity
                        key={`${photo.photoPath}_${photoIndex}`}
                        activeOpacity={0.7}
                        style={styles.photoItem}
                        onPress={() => onShowPhoto(photoIndex)}
                      >
                        <Image
                          source={{
                            uri:
                              photo.photoPath?.includes('http') ||
                              photo.photoPath?.includes('file://')
                                ? photo.photoPath
                                : `${URLDEFAULT}${photo.photoPath}`,
                          }}
                          resizeMode="cover"
                          style={styles.photoImage}
                        />
                        {photo.photoTime && (
                          <Text style={styles.photoTime}>
                            {moment(photo.photoTime).format(
                              'HH:mm - DD/MM/YYYY',
                            )}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          )}
          {_.some(item.dataDetail || [], detail => detail.isConfirm == 1) && (
            <View
              style={{
                borderTopWidth: 0.3,
                borderTopColor: appcolor.greydark,
                marginTop: 8,
              }}
            >
              <ScrollView
                style={{ width: '100%', padding: 8 }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {dataConfirmValue.map((it, idx) => (
                  <TouchableOpacity
                    key={`${idx}_confirm`}
                    onPress={() =>
                      handlerUpdateOrderDetail(item, it.numberValue, it.name)
                    }
                    style={styles.buttonAction}
                  >
                    <Text
                      style={{
                        ...styles.textButtonAction,
                        color: appcolor[it.isColor],
                      }}
                    >
                      {it.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {item.isChoose == 1 && (
            <View style={styles.badgeContainer}>
              <ICO name="check" reverse color={appcolor.danger} size={18} />
            </View>
          )}
          {item.isChoose != 1 && (
            <Badge
              containerStyle={styles.badgeContainer}
              textStyle={{
                fontSize: 15,
                fontWeight: '500',
                color: appcolor.light,
              }}
              badgeStyle={{
                backgroundColor:
                  confirmInfo.confirmBy != null
                    ? appcolor.success
                    : appcolor.primary,
                height: 40,
                width: 40,
                borderRadius: 20,
              }}
              value={(item.dataDetail || []).length}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {isDelete > 0 ? (
        <HeaderCustom
          title={titleDelete}
          rightFunc={onDelete}
          iconRight="trash"
        />
      ) : (
        <HeaderCustom
          leftFunc={() => navigation.goBack()}
          title="Chi tiết Sell In"
          iconRight="plus"
          rightFunc={onCreateOrder}
        />
      )}
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{shopInfo.shopName || 'Cửa hàng'}</Text>
        <Text style={styles.shopMeta}>{`${data.length} đơn hàng`}</Text>
        {shopInfo.totalRevenue !== null &&
          shopInfo.totalRevenue !== undefined && (
            <NumericFormat
              value={shopInfo.totalRevenue}
              displayType="text"
              thousandSeparator
              renderText={formattedValue => (
                <Text
                  style={styles.shopRevenue}
                >{`Doanh thu: ${formattedValue} đ`}</Text>
              )}
            />
          )}
        {!!shopInfo.dealerName && (
          <Text style={styles.shopMeta}>{`NPP: ${shopInfo.dealerName}`}</Text>
        )}
        {!!shopInfo.addressName && (
          <Text style={styles.shopAddress}>{shopInfo.addressName}</Text>
        )}
        {!!statusInfo.statusName && (
          <Text style={styles.statusText}>{statusInfo.statusName}</Text>
        )}
      </View>
      <CustomListView
        data={data}
        extraData={[data, orderExpand]}
        renderItem={renderItem}
        onRefresh={LoadData}
        isRefresh={loading}
        contentContainerStyle={styles.listContent}
        ListEmpty={
          !loading ? (
            <Text style={styles.shopMeta}>Không có dữ liệu</Text>
          ) : null
        }
      />
      <ViewPictures
        visible={photoViewer.visible}
        images={photoViewer.photos}
        initialIndex={photoViewer.index}
        onSwipeDown={() =>
          setPhotoViewer({ visible: false, photos: [], index: 0 })
        }
      />
    </View>
  );
};

const RenderItemText = ({
  type,
  titleName,
  itemValue,
  appcolor,
  colorByRow = 'dark',
}) => {
  const colorItem = appcolor.dark;
  return (
    <View style={{ width: '100%', height: 'auto' }}>
      <View style={{ width: '90%', padding: 3 }}>
        {type == 'Status' && (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              fontWeight: '700',
              color: appcolor[colorByRow || 'dark'],
              fontStyle: 'italic',
            }}
          >
            {titleName}
            {itemValue}
          </Text>
        )}
        {type == 'Info' && (
          <Text
            style={{
              width: '100%',
              fontSize: scaleSize(12),
              lineHeight: 18,
              color: colorItem,
            }}
          >
            {titleName}
            {itemValue}
          </Text>
        )}
        {type == 'Price' && (
          <NumericFormat
            value={itemValue}
            displayType="text"
            thousandSeparator
            renderText={formattedValue => (
              <Text
                style={{
                  fontWeight: '700',
                  color: appcolor.dark,
                  fontSize: scaleSize(13),
                  lineHeight: 18,
                }}
              >
                {`${titleName}${formattedValue} đ`}
              </Text>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default SellInShopDetailScreen;
