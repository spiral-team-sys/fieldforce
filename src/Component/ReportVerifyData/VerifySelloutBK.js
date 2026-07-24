import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import FormGroup from '../../Content/FormGroup';
import { LoadingView } from '../../Control/ItemLoading';
import {
  GetListSelloutVerify,
  SendAllVerify,
} from '../../Controller/SellOutController';
import {
  formatPhone,
  groupDataByKey,
  isPhone,
  Message,
  MessageInfo,
} from '../../Core/Helper';
import { deviceHeight, deviceWidth } from '../Home';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { URLDEFAULT } from '../../Core/URLs';
import ViewPictures from '../../Control/Gallary/ViewPictures';
import { Badge, Icon } from '@rneui/themed';
import moment from 'moment';
import { getPhotosByGuiIdUpload } from '../../Controller/WorkController';
import {
  deletePhoto,
  InsertPhotosItem,
} from '../../Controller/PhotoController';
import { launchImageLibrary } from 'react-native-image-picker';
import NativeCamera from '../../Control/NativeCamera';
import { checkNetwork } from '../../Core/Utility';
import { IconAnimation } from '../../Control/IconAnimation/IconAnimation';
import { MutipleItemSelected } from '../../Control/MutipleItemSelected';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastError } from '../../Utils/configToast';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const parseJsonArray = value => {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsedValue = JSON.parse(value || '[]');
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (_error) {
    return [];
  }
};

const parseJsonObject = value => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  try {
    const parsedValue = JSON.parse(value || '{}');
    return parsedValue &&
      typeof parsedValue === 'object' &&
      !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch (_error) {
    return {};
  }
};

const formStyles = StyleSheet.create({
  cancelContainer: { padding: 5 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    paddingTop: 2,
  },
  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: { paddingVertical: 10 },
  formScroll: { flexGrow: 0, maxHeight: deviceHeight * 0.34 },
  formContent: { paddingBottom: 8 },
  inputText: { minHeight: 40, maxHeight: 56, paddingVertical: 6 },
  sendingContainer: { flexDirection: 'row', alignItems: 'center', padding: 3 },
  sendingText: { fontWeight: '500', fontSize: 14, padding: 3 },
  submitButton: {
    minWidth: 60,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  sheetContainer: { height: deviceHeight * 0.68, padding: 10 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetCloseButton: {
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetActionGroup: { flexDirection: 'row', justifyContent: 'flex-end' },
  sheetIconButton: {
    minHeight: 44,
    minWidth: 56,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    marginLeft: 8,
  },
  sheetPhotoWrap: { maxHeight: deviceWidth / 5.5 + 12 },
  sheetFormWrap: { flex: 1 },
});

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const VerifySelloutBK = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({
    dataSellOut: [],
    dataFilter: [],
    listMaster: [],
  });
  const [filterMonth, setFilterMonth] = useState({
    year: new Date().getFullYear(),
    yearname: `Năm ${new Date().getFullYear()}`,
    month: new Date().getMonth() + 1,
    monthname: `Tháng ${new Date().getMonth() + 1}`,
    loadYearMonth: false,
    jsonFilter: {},
  });
  const LoadData = async (year, month) => {
    setLoading(true);
    try {
      const response = await GetListSelloutVerify(month, year);
      if (response?.statusId === 200 && Array.isArray(response.data)) {
        const dataMaster = parseJsonArray(response.data[0]?.masterList);
        setData({
          dataSellOut: response.data,
          dataFilter: response.data,
          listMaster: dataMaster,
        });
      } else {
        toastError(
          'Lỗi',
          `Lỗi kết nối hệ thống: ${response?.messager || 'Không thể tải dữ liệu'
          }`,
        );
      }
    } catch (error) {
      toastError('Lỗi', error?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const currentDate = new Date();
    LoadData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, []);

  const onFilterChange = search => {
    if (search.year && search.month) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFilterMonth(search);
      LoadData(search.year, search.month);
    }
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Kiểm tra xác thực hoá đơn'}
        iconRight="cloud-upload-alt"
        iconMiddle="search"
        // rightFunc={UploadData}
        middleFunc={() => SheetManager.show('filterMonth')}
        leftFunc={() => navigation.goBack()}
      />
      <LoadingView isLoading={isLoading} title={'Đang cập nhật dữ liệu'} />
      <View style={{ flex: 1 }}>
        {!isLoading && data.listMaster?.length > 0 && (
          <ViewListItemVerify
            data={data}
            setData={setData}
            styles={styles}
            LoadDataMain={LoadData}
            filterMonth={filterMonth}
          />
        )}
      </View>
      <ActionSheet
        id={'filterMonth'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ height: 200 }}>
          <YearMonthSelected
            option={filterMonth}
            onYearMonth={search => onFilterChange(search)}
            numMonth={4}
          />
        </View>
      </ActionSheet>
    </View>
  );
};

const ViewListItemVerify = ({
  data,
  setData,
  styles,
  LoadDataMain,
  filterMonth,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [listItemByTab, setListItemByTab] = useState([]);
  const [listTab, setListTab] = useState([]);
  const [listHistory, setListHistory] = useState([]);
  const [dataPhoto, setDataPhoto] = useState({
    listPhoto: [],
    indexImage: 0,
    mode: 'ITEM',
  });
  const [visible, setVisible] = useState(false);
  const [currentInfo, setCurrentInfo] = useState({
    currentItem: {},
    indexItem: 0,
  });
  const [currentTab, setCurrentTab] = useState({});
  const [search, setSearch] = useState('');
  const tabRef = useRef();
  const [isSendData, setSendData] = useState(false);

  useEffect(() => {
    const nextTabs =
      data.listMaster?.map(it => ({
        ...it,
        totalRow: data.dataSellOut.filter(item => item.status == it.id).length,
      })) || [];
    const selectedTab =
      currentTab.id || currentTab?.id == 0 ? currentTab : nextTabs[0];
    const dataByTab = data.dataSellOut.filter(
      it => it.status === selectedTab?.id,
    );
    const { arr } = groupDataByKey({
      arr: dataByTab,
      key: 'shopId',
      keyLayer2: 'sellDate',
    });
    const normalizedSearch = search.trim().toLowerCase();
    const visibleItems = normalizedSearch
      ? arr.filter(item =>
        item.productName?.toLowerCase().includes(normalizedSearch),
      )
      : arr;

    setCurrentTab(selectedTab);
    setListTab(nextTabs);
    setListItemByTab(visibleItems);
  }, [currentTab, data, search]);

  const handleShowHistory = item => {
    const list = parseJsonArray(item.listResult);
    if (list.length > 0) {
      setListHistory(list);
      SheetManager.show('historyVerify');
    }
  };
  const handleShowNoteCancel = (item, index) => {
    setCurrentInfo({ currentItem: item, indexItem: index });
    SheetManager.show('CancelBill');
  };

  const handleSelectImage = (listPhotoItem, indexImage) => {
    setDataPhoto({
      listPhoto: listPhotoItem,
      indexImage: indexImage,
      mode: 'ITEM',
    });
    setVisible(true);
  };

  const handleSelectImageVerify = (listPhoto, indexImage) => {
    SheetManager.hide('historyVerify');
    setDataPhoto({
      listPhoto: listPhoto,
      indexImage: indexImage,
      mode: 'HISTORY',
    });
    setVisible(true);
  };
  const handleSelectImageEdit = (listPhoto, indexImage) => {
    SheetManager.hide('takePhotoSheet');
    setDataPhoto({
      listPhoto: listPhoto,
      indexImage: indexImage,
      mode: 'EDIT',
    });
    setVisible(true);
  };
  const handleDeletePhoto = async (listPhoto, itemPhoto) => {
    await deletePhoto(itemPhoto);
    const listAfterDelete = listPhoto.filter(
      it => it.photoPath !== itemPhoto.photoPath,
    );
    const nextListPhoto = JSON.stringify(listAfterDelete);
    updateDataItem({ listPhoto: nextListPhoto });
    setCurrentInfo(previousInfo => ({
      ...previousInfo,
      currentItem: { ...previousInfo.currentItem, listPhoto: nextListPhoto },
    }));
  };
  const handleCloseImage = () => {
    setVisible(false);
    if (dataPhoto.mode === 'HISTORY') {
      SheetManager.show('historyVerify');
    } else if (dataPhoto.mode === 'EDIT') {
      SheetManager.show('takePhotoSheet');
    }
  };

  const handleShowTakePhoto = (item, index) => {
    setCurrentInfo({ currentItem: item, indexItem: index });
    SheetManager.show('takePhotoSheet');
  };

  const handleChangeCurrentItem = (fieldName, value) => {
    updateDataItem({ [fieldName]: value });
    setCurrentInfo(previousInfo => ({
      ...previousInfo,
      currentItem: { ...previousInfo.currentItem, [fieldName]: value },
    }));
  };

  const updateDataItem = changes => {
    const detailId = currentInfo.currentItem.detailId;
    const updateList = (list = []) =>
      list.map(item =>
        item.detailId == detailId ? { ...item, ...changes } : item,
      );

    setData(previousData => ({
      ...previousData,
      dataSellOut: updateList(previousData.dataSellOut),
      dataFilter: updateList(previousData.dataFilter),
    }));
    setListItemByTab(previousList => updateList(previousList));
  };

  const scrollOnPress = (item, index) => {
    tabRef.current.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };

  const handleChangeTab = (item, index) => {
    scrollOnPress(item, index);
    setSearch('');
    setCurrentTab(item);
  };

  const handleSendItem = (type, noteCancel) => {
    const listPhoto = parseJsonArray(currentInfo.currentItem.listPhoto);
    const listPhotoF = listPhoto.filter(it => it.isPhotoSystem !== 1);
    const listEdit = parseJsonArray(currentInfo.currentItem.listMasterEdit);
    const itemConfig = parseJsonObject(currentInfo.currentItem.config);
    if (type == 'submit') {
      if (
        ((currentInfo.currentItem.status !== 4 && listPhotoF.length == 0) ||
          (currentInfo.currentItem?.status == 4 && listPhoto.length == 0)) &&
        currentInfo.currentItem?.isLockCheckImage !== 1
      ) {
        MessageInfo('Bạn phải chụp hình hoá đơn trước khi gửi!');
        return;
      }
      if (
        (currentInfo.currentItem.status !== 4 &&
          listPhotoF.length < currentInfo.currentItem.numPhoto) ||
        (currentInfo.currentItem?.status == 4 &&
          listPhoto.length < currentInfo?.currentItem?.numPhoto)
      ) {
        MessageInfo(
          `Số lượng hình ảnh phải tối thiểu : ${currentInfo.currentItem.numPhoto} hình!!`,
        );
        return;
      }
      for (let index = 0; index < listEdit.length; index++) {
        const element = listEdit[index];
        if (
          element.ref_Name === 'serial' &&
          (element?.isRequired === 1 || element.isRequired === 3) &&
          (currentInfo.currentItem?.serial === null ||
            currentInfo?.currentItem?.serial === '')
        ) {
          MessageInfo(`Số Seri không được để trống`);
          return;
        }
        if (
          element.ref_Name === 'serial' &&
          element?.isRequired !== 2 &&
          element.isRequired !== 3 &&
          currentInfo.currentItem?.serial !== null &&
          currentInfo?.currentItem?.serial !== '' &&
          currentInfo?.currentItem?.serial?.length !== element.numberValue
        ) {
          MessageInfo(
            `Số Seri chưa đúng định dạng, Seri phải đủ ${element.numberValue} kí tự`,
          );
          return;
        }
        if (
          element.ref_Name === 'serial' &&
          currentInfo?.currentItem?.serial !== null &&
          currentInfo.currentItem.serial !== ''
        ) {
          if (
            itemConfig?.serialOnlyNumber == 1 &&
            /\D/.test(currentInfo.currentItem.serial)
          ) {
            MessageInfo(
              `Số Seri chỉ chứa số và không chứa kí tự hoặc kí tự đặc biệt!`,
            );
            return;
          }
        }
        if (
          element.ref_Name === 'itemClassify' &&
          element.isRequired === 1 &&
          (currentInfo?.currentItem?.itemClassify === null ||
            currentInfo?.currentItem?.itemClassify === '' ||
            currentInfo?.currentItem?.itemClassify === 'null')
        ) {
          MessageInfo(`Bạn chưa chọn loại hàng hoá`);
          return;
        }
        if (
          element.ref_Name === 'statusVerify' &&
          element.isRequired === 1 &&
          (currentInfo?.currentItem?.statusVerify === null ||
            currentInfo?.currentItem?.statusVerify === '' ||
            currentInfo?.currentItem?.statusVerify === 'null')
        ) {
          MessageInfo(`Bạn chưa chọn Trạng thái hàng hoá`);
          return;
        }

        if (
          element.ref_Name === 'customer' &&
          element.isRequired === 1 &&
          !currentInfo.currentItem?.customer
        ) {
          MessageInfo('Tên khách hàng không được để trống');
          return;
        }
        if (
          element.ref_Name === 'customer' &&
          element.isRequired === 1 &&
          currentInfo.currentItem.customer.length < element.numberValue
        ) {
          MessageInfo(
            `Tên khách hàng ngắn, nhập ít nhất ${element.numberValue} ký tự`,
          );
          return;
        }
        if (
          element.ref_Name === 'phone' &&
          element.isRequired === 1 &&
          (currentInfo.currentItem?.phone === null ||
            currentInfo.currentItem?.phone === '')
        ) {
          MessageInfo(`Số điện thoại không được để trống`);
          return;
        }
        if (
          element.ref_Name === 'billCode' &&
          element.isRequired === 1 &&
          (currentInfo.currentItem?.billCode === null ||
            currentInfo.currentItem?.billCode === '')
        ) {
          MessageInfo(`Số hoá đơn không được để trống`);
          return;
        }
        if (
          currentInfo.currentItem?.phone !== null &&
          currentInfo.currentItem?.phone !== ''
        ) {
          const checkPhone = isPhone(currentInfo.currentItem?.phone);
          if (!checkPhone) {
            MessageInfo(`Số điện thoại không đúng định dạng`);
            return;
          }
        }
      }
    } else {
      const normalizedNote = noteCancel?.trim() || '';
      if (!normalizedNote) {
        MessageInfo(`Bạn phải nhập ghi chú trước khi huỷ hoá đơn!`);
        return;
      }
      if (normalizedNote.length < 5) {
        MessageInfo(`Ghi chú phải lớn hơn 5 ký tự!`);
        return;
      }
    }

    Message(
      'Chú ý',
      `Bạn có chắc chắn muốn ${type == 'submit' ? 'gửi lại' : 'huỷ'} hoá đơn?`,
      async () => {
        setSendData(true);
        const isNetwork = await checkNetwork();
        if (!isNetwork) {
          MessageInfo(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
            'Kết nối mạng',
            'top',
          );
          setSendData(false);
          return;
        }
        try {
          await SendAllVerify(
            currentInfo.currentItem,
            listPhoto,
            type,
            noteCancel,
            async result => {
              if (result.status === 200) {
                if (type == 'submit') {
                  if (currentInfo.currentItem.status !== 4) {
                    handleChangeStatus(2);
                  } else {
                    if (
                      currentInfo.currentItem.serial !== null &&
                      currentInfo.currentItem.serial !== undefined &&
                      currentInfo.currentItem.serial !== ''
                    ) {
                      handleChangeStatus(0);
                    } else {
                      handleChangeStatus(1);
                    }
                  }
                  await SheetManager.hide('takePhotoSheet');
                } else if (type == 'cancel') {
                  handleChangeStatus(-2);
                  await SheetManager.hide('CancelBill');
                }
              }
              MessageInfo(result.messeger);
              setSendData(false);
            },
          );
        } catch (error) {
          MessageInfo(error?.message || 'Không thể gửi dữ liệu');
          setSendData(false);
        }
      },
    );
  };
  const handleChangeStatus = statusInfo => {
    const changes = {};
    if (statusInfo == 2 || statusInfo == -2) {
      changes.status = statusInfo;
      changes.isShowSend = 0;
      changes.isEditInfo = 0;
    } else {
      changes.isEditInfo = statusInfo;
    }
    const listSystemPhoto = parseJsonArray(currentInfo.currentItem.listPhoto);
    if (listSystemPhoto.length > 0) {
      changes.listPhoto = JSON.stringify(
        listSystemPhoto.map(item => {
          const imageName = item.photoPath.substring(
            item.photoPath.lastIndexOf('/') + 1,
            item.photoPath.length,
          );
          return {
            ...item,
            photoPath: '/uploaded/' + item.photoDate + '/' + imageName,
            isSystemPhoto: 1,
          };
        }),
      );
    }
    updateDataItem(changes);
    setCurrentInfo(previousInfo => ({
      ...previousInfo,
      currentItem: { ...previousInfo.currentItem, ...changes },
    }));
  };

  const renderItem = ({ item, index }) => {
    const onSelectHistory = () => {
      handleShowHistory(item, index);
    };
    const onSelectCancel = () => {
      handleShowNoteCancel(item, index);
    };

    const keyLayer2 = item[`${item.sellDate}${item.shopId}`];
    return (
      <View key={'ItemSell_' + index} style={{ paddingHorizontal: 8 }}>
        {item.isParent && (
          <View style={{ padding: 8 }}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 16,
                color: appcolor.tomato,
              }}
            >
              {item.shopName}
            </Text>
          </View>
        )}
        {keyLayer2 && (
          <View
            style={{
              padding: 6,
              backgroundColor: appcolor.greydark,
              borderRadius: 6,
              marginBottom: 5,
            }}
          >
            <Text
              style={{ fontWeight: '600', fontSize: 14, color: appcolor.white }}
            >
              {item.sellDate}
            </Text>
          </View>
        )}
        <View
          style={{
            backgroundColor: appcolor.success,
            paddingTop: 2,
            borderRadius: 8,
            flexDirection: 'row',
            minHeight: 120,
            marginBottom: 5,
          }}
        >
          <View
            style={{
              borderLeftWidth: 0.5,
              borderBottomWidth: 0.5,
              borderColor: appcolor.greylight,
              backgroundColor: appcolor.light,
              width: '85%',
              padding: 8,
              borderBottomLeftRadius: 8,
              borderTopLeftRadius: 8,
              justifyContent: 'center',
            }}
          >
            {item.shopName != null &&
              item.shopName != 'null' &&
              item.shopName != undefined &&
              item.shopName != '' && (
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Cửa hàng : `}
                  {item.shopName}
                </Text>
              )}
            {item.billCode != null &&
              item.billCode != 'null' &&
              item.billCode != undefined &&
              item.billCode != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Số hoá đơn : `}
                  {item.billCode}
                </Text>
              )}
            {item.sellDate != null &&
              item.sellDate != 'null' &&
              item.sellDate != undefined &&
              item.sellDate != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Ngày bán : `}
                  {item.sellDate}
                </Text>
              )}
            {item.productName != null &&
              item.productName != 'null' &&
              item.productName != undefined &&
              item.productName != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Sản phẩm : `}
                  {item.productName}
                </Text>
              )}
            {item.quantity != null &&
              item.quantity != 'null' &&
              item.quantity != undefined &&
              item.quantity != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Số lượng : `}
                  {item.quantity}
                </Text>
              )}
            {item.serial != null &&
              item.serial != 'null' &&
              item.serial != undefined &&
              item.serial != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Số serial : `}
                  {item.serial}
                </Text>
              )}
            {item.customer != null &&
              item.customer != 'null' &&
              item.customer != undefined &&
              item.customer != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Khách hàng : `}
                  {item.customer}
                </Text>
              )}
            {item.phone != null &&
              item.phone != 'null' &&
              item.phone != undefined &&
              item.phone != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Số điện thoại : `}
                  {item.phone}
                </Text>
              )}
            {item.address != null &&
              item.address != 'null' &&
              item.address != undefined &&
              item.address != '' && (
                <Text
                  style={{
                    fontWeight: '400',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  {`Địa chỉ : `}
                  {item.address}
                </Text>
              )}
            {item.dealineNote != null &&
              item.dealineNote != 'null' &&
              item.dealineNote != undefined &&
              item.dealineNote != '' && (
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: appcolor.danger,
                  }}
                >
                  {`Admin ghi chú : `}
                  {item.dealineNote}
                </Text>
              )}
            {item.confirmedNote != null &&
              item.confirmedNote != 'null' &&
              item.confirmedNote != undefined &&
              item.confirmedNote != '' && (
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: appcolor.danger,
                  }}
                >
                  {`Lí do từ chối : `}
                  {item.confirmedNote}
                </Text>
              )}
            <Text
              style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}
            >
              {`Hình đã chụp : `}
              {parseJsonArray(item.listPhoto).length}
            </Text>
            <View style={{}}>
              <ShowPhotoItem
                itemSell={item}
                listPhoto={parseJsonArray(item.listPhoto)}
                handleSelectImage={handleSelectImage}
                handleDeletePhoto={handleDeletePhoto}
                isSendData={isSendData}
              />
            </View>
            {item.dealine && (
              <View style={{ flexDirection: 'row', padding: 3 }}>
                <SpiralIcon
                  color={appcolor.red}
                  name={'clock'}
                  type={'font-awesome-5'}
                  size={14}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: appcolor.red,
                    fontWeight: '600',
                    paddingLeft: 5,
                  }}
                >
                  Thời hạn : {moment(item.dealine).format('YYYY-MM-DD')}
                  {item.isEndDeadline === 1 && ` -> ${item.endTitle}`}
                </Text>
              </View>
            )}
          </View>
          <View style={{ justifyContent: 'space-between', width: '15%' }}>
            {item.isShowCancel == 1 && (
              <TouchableOpacity
                key={'CancelBill'}
                onPress={onSelectCancel}
                style={{
                  backgroundColor: appcolor.light,
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                  flex: 1,
                  marginRight: 3,
                  marginBottom: 2,
                  marginTop: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  color={appcolor.danger}
                  name={'trash-alt'}
                  type={'font-awesome-5'}
                  size={20}
                />
              </TouchableOpacity>
            )}
            {item.isHideHistory !== 1 && (
              <TouchableOpacity
                key={'showHistory'}
                onPress={onSelectHistory}
                style={{
                  backgroundColor: appcolor.light,
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                  flex: 1,
                  marginRight: 3,
                  marginBottom: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  color={appcolor.primary}
                  name={'history'}
                  type={'font-awesome-5'}
                  size={20}
                />
                <Badge
                  containerStyle={{ position: 'absolute', top: 4, end: 4 }}
                  textStyle={{
                    color: appcolor.white,
                    fontSize: 9,
                    fontWeight: '500',
                  }}
                  badgeStyle={{
                    minWidth: 16,
                    height: 16,
                    backgroundColor: appcolor.danger,
                    borderRadius: 50,
                  }}
                  value={parseJsonArray(item.listResult).length}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              key={'takePictureBTT'}
              onPress={() => handleShowTakePhoto(item, index)}
              style={{
                backgroundColor: appcolor.light,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                flex: 1,
                marginRight: 3,
                marginBottom: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                color={appcolor.primary}
                name={'edit'}
                type={'font-awesome-5'}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const takePhoto = async () => {
    const photoinfo = {
      shopId: currentInfo.currentItem.shopId,
      shopCode: currentInfo.currentItem.shopCode,
      reportId: 5,
      photoDate: moment(new Date()).format('YYYYMMDD'),
      photoTime: new Date().getTime(),
      photoType: 'SELLOUT_INVOICE',
      photoDesc: 'VERIFY',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      guid: currentInfo.currentItem.guiId,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, loadListPhoto);
  };

  const loadListPhoto = async () => {
    const listPhoto = await getPhotosByGuiIdUpload(
      currentInfo.currentItem.guiId,
      currentInfo.currentItem.shopId,
    );
    const itemData = data.dataFilter.find(
      it => it.detailId == currentInfo.currentItem.detailId,
    );
    const listPhotoBackup = parseJsonArray(itemData?.listPhotoBackup);
    const nextListPhoto = JSON.stringify([...listPhotoBackup, ...listPhoto]);
    updateDataItem({ listPhoto: nextListPhoto });
    setCurrentInfo(previousInfo => ({
      ...previousInfo,
      currentItem: { ...previousInfo.currentItem, listPhoto: nextListPhoto },
    }));
  };

  const uploadFilePhoto = async () => {
    let photoinfo = {};
    let options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 10,
    };
    await launchImageLibrary(options, async response => {
      if (!response.didCancel) {
        let { assets } = (await response) || [];
        if (assets !== undefined) {
          await assets?.forEach(async res => {
            let timePhotoInsert =
              (await new Date().getTime()) +
              (Math.floor(Math.random() * 112) + 1);
            const newImageUrl = await NativeCamera.resizeImage(await res.uri);
            photoinfo = {
              shopId: currentInfo.currentItem.shopId,
              shopCode: currentInfo.currentItem.shopCode,
              reportId: 5,
              photoPath: newImageUrl?.uri || res.uri,
              photoDate: moment(new Date()).format('YYYYMMDD'),
              photoType: 'SELLOUT_INVOICE',
              photoDesc: 'VERIFY',
              photoTime: timePhotoInsert,
              fileUpload: 0,
              dataUpload: 0,
              guid: currentInfo.currentItem.guiId,
              photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
            };

            await InsertPhotosItem(photoinfo);
            await loadListPhoto();
          });
        }
      }
    });
  };

  const handlerSearch = text => {
    setSearch(text);
  };

  const handlerAddPhoto = type => {
    if (
      currentInfo.currentItem.isEditInfo == 2 ||
      currentInfo.currentItem.isEditInfo == 3
    ) {
      if (type === 'TAKEPHOTO') {
        takePhoto();
      } else if (type === 'UPLOADFILE') {
        uploadFilePhoto();
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      {listTab?.length > 1 && (
        <View
          style={{
            width: deviceWidth,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingVertical: 10,
          }}
        >
          <FlatList
            key={'listTab'}
            showsHorizontalScrollIndicator={false}
            ref={tabRef}
            style={{ flex: 1, marginHorizontal: 10, paddingTop: 4 }}
            horizontal
            data={listTab}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 6,
                    marginRight: 13,
                    borderRadius: 6,
                    backgroundColor:
                      currentTab.id == item.id
                        ? appcolor.primary
                        : appcolor.light,
                  }}
                  onPress={() => handleChangeTab(item, index)}
                >
                  <Badge
                    containerStyle={{ position: 'absolute', top: 0, end: -10 }}
                    textStyle={{
                      color: appcolor.white,
                      fontSize: 10,
                      fontWeight: '500',
                    }}
                    badgeStyle={{
                      minWidth: 15,
                      height: 15,
                      backgroundColor: appcolor.danger,
                      borderRadius: 50,
                    }}
                    value={item.totalRow}
                  />
                  <Text
                    style={{
                      fontWeight: '500',
                      fontSize: 14,
                      color:
                        currentTab.id == item.id
                          ? appcolor.white
                          : appcolor.dark,
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
      <FormGroup
        containerStyle={{
          backgroundColor: appcolor.grayLight,
          margin: 5,
          alignSelf: 'center',
        }}
        inputStyle={{ fontSize: 13, color: appcolor.dark }}
        placeholder="Tìm kiếm"
        editable
        iconName="search"
        value={search}
        handleChangeForm={handlerSearch}
      />

      {listItemByTab.length > 0 && currentTab.id !== undefined && (
        <FlatList
          showsVerticalScrollIndicator={false}
          key={'listItem'}
          keyExtractor={(item, index) =>
            `${item.detailId || item.guiId || `${item.shopId}_${item.sellDate}`
            }_${index}`
          }
          data={listItemByTab}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() =>
                LoadDataMain(filterMonth.year, filterMonth.month)
              }
            />
          }
          renderItem={renderItem}
          ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
        />
      )}
      <ActionSheet
        id={'historyVerify'}
        gestureEnabled
        // style={{ backgroundColor: appcolor.light }}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            height: deviceHeight - 200,
            backgroundColor: appcolor.light,
          }}
        >
          <ViewHistoryVerify
            listHistory={listHistory}
            handleSelectImageVerify={handleSelectImageVerify}
          />
        </View>
      </ActionSheet>
      <ActionSheet
        id={'CancelBill'}
        gestureEnabled={!isSendData}
        closeOnTouchBackdrop={!isSendData}
        // style={{ backgroundColor: appcolor.light }}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ height: 300, backgroundColor: appcolor.light }}>
          <ViewCancelNote
            itemInfo={currentInfo}
            handleSendItem={handleSendItem}
            isSendData={isSendData}
          />
        </View>
      </ActionSheet>

      <ActionSheet
        gestureEnabled={false}
        closeOnTouchBackdrop={isSendData == false ? true : false}
        id={'takePhotoSheet'}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={[
            formStyles.sheetContainer,
            { backgroundColor: appcolor.light },
          ]}
        >
          <View style={formStyles.sheetHeader}>
            <TouchableOpacity
              onPress={() =>
                isSendData == false ? SheetManager.hide('takePhotoSheet') : null
              }
              style={[
                formStyles.sheetCloseButton,
                { borderColor: appcolor.danger, opacity: isSendData ? 0.5 : 1 },
              ]}
            >
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'red',
                  textAlign: 'center',
                }}
              >
                Đóng
              </Text>
            </TouchableOpacity>
            {(currentInfo.currentItem.isEditInfo == 2 ||
              currentInfo.currentItem.isEditInfo == 3) &&
              isSendData == false && (
                <View style={formStyles.sheetActionGroup}>
                  <TouchableOpacity
                    style={[
                      formStyles.sheetIconButton,
                      { backgroundColor: appcolor.primary },
                    ]}
                    onPress={() => handlerAddPhoto('TAKEPHOTO')}
                  >
                    <SpiralIcon
                      color={appcolor.white}
                      name="camera"
                      type="ionicon"
                      size={18}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      formStyles.sheetIconButton,
                      { backgroundColor: appcolor.primary },
                    ]}
                    onPress={() => handlerAddPhoto('UPLOADFILE')}
                  >
                    <SpiralIcon
                      color={appcolor.white}
                      name="attach"
                      type="ionicon"
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              )}
          </View>

          <View style={formStyles.sheetPhotoWrap}>
            <ShowPhotoItem
              itemSell={currentInfo?.currentItem}
              listPhoto={parseJsonArray(currentInfo?.currentItem?.listPhoto)}
              handleSelectImage={handleSelectImageEdit}
              handleDeletePhoto={handleDeletePhoto}
              isSendData={isSendData}
            />
          </View>
          <View style={formStyles.sheetFormWrap}>
            <ViewInputSellout
              itemInfo={currentInfo}
              handleChangeCurrentItem={handleChangeCurrentItem}
              handleSendItem={handleSendItem}
              isSendData={isSendData}
            />
          </View>
        </View>
      </ActionSheet>
      <ViewPictures
        visible={visible}
        images={dataPhoto.listPhoto}
        initialIndex={dataPhoto.indexImage}
        onSwipeDown={handleCloseImage}
      />
    </View>
  );
};
const ViewCancelNote = ({ itemInfo, handleSendItem, isSendData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [noteCancel, setNoteCancel] = useState('');

  useEffect(() => {
    setNoteCancel('');
  }, [itemInfo.currentItem.detailId]);

  const handleChangeNote = text => {
    setNoteCancel(text);
  };

  const onCancelItem = () => {
    handleSendItem('cancel', noteCancel);
  };

  return (
    <View style={formStyles.cancelContainer}>
      <FormGroup
        title={'Ghi chú huỷ hoá đơn'}
        key={'CancelBill_' + itemInfo.indexItem}
        value={noteCancel}
        handleChangeForm={text => handleChangeNote(text)}
        onClearTextAndroid={() => handleChangeNote('')}
        keyboardType={'default'}
        placeholder={'Nhập ghi chú ở đây'}
        multiline
        editable={!isSendData}
      />
      <View style={formStyles.actionRow}>
        <TouchableOpacity
          disabled={isSendData}
          onPress={onCancelItem}
          style={[
            formStyles.cancelButton,
            { backgroundColor: appcolor.tomato, opacity: isSendData ? 0.5 : 1 },
          ]}
        >
          <Text style={[formStyles.buttonText, { color: appcolor.white }]}>
            Huỷ hoá đơn
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const ViewInputSellout = ({
  itemInfo,
  handleChangeCurrentItem,
  handleSendItem,
  isSendData,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const listEdit = parseJsonArray(itemInfo.currentItem.listMasterEdit);
  const itemConfig = parseJsonObject(itemInfo.currentItem.config);
  const isEditable = itemInfo.currentItem.isEditInfo !== 0 && !isSendData;

  const handleOnChangeInput = (itemM, text) => {
    if (isEditable) {
      if (itemM.ref_Name === 'serial') {
        let nextValue = text;
        if (
          itemConfig?.serialOnlyNumber == 1 &&
          (itemInfo.currentItem.isEditInfo == 1 ||
            itemInfo.currentItem.isEditInfo == 3)
        ) {
          nextValue = text !== null ? text.replace(/\D/g, '') : null;
        }
        handleChangeCurrentItem(itemM.ref_Name, nextValue);
      } else if (itemM.ref_Code === 'phone') {
        if (text !== null) {
          let textValue = text
            .replace(/\D+/g, '')
            .replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
          if (text?.length == 11) {
            textValue = text
              .replace(/\D+/g, '')
              .replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
          }

          if (
            !itemInfo.currentItem[itemM.ref_Name] ||
            textValue == '' ||
            textValue?.length < 12
          ) {
            handleChangeCurrentItem(itemM.ref_Name, textValue);
          }
        } else {
          handleChangeCurrentItem(itemM.ref_Name, null);
        }
      } else {
        handleChangeCurrentItem(itemM.ref_Name, text);
      }
    }
  };
  const onSendItem = () => {
    if (isEditable) {
      handleSendItem('submit');
    }
  };
  const handlerSelectItem = (itemSelect, typeItem) => {
    if (!isEditable) {
      return;
    }
    handleChangeCurrentItem(typeItem, itemSelect.itemName);
  };
  const displayItem = () => {
    return listEdit?.map((itemM, index) => {
      switch (itemM.ref_Code) {
        case 'template':
          return (
            <FormGroup
              title={itemM.nameVN}
              key={index + '_' + itemM.ref_Name}
              value={
                itemConfig.serialOnlyNumber == 1
                  ? itemInfo.currentItem[itemM.ref_Name]?.replace(/\D/g, '') ||
                  ''
                  : itemInfo.currentItem[itemM.ref_Name] || ''
              }
              handleChangeForm={text => handleOnChangeInput(itemM, text)}
              onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
              keyboardType={itemConfig.serialOnlyNumber ? 'numeric' : 'default'}
              inputStyle={formStyles.inputText}
              placeholder={itemM.textValue}
              maxLength={itemM.numberValue}
              editable={itemM.ref_Id !== 1 && isEditable}
            />
          );
        case 'phone':
          return (
            <FormGroup
              title={itemM.nameVN}
              key={itemM.ref_Name}
              value={formatPhone(itemInfo.currentItem[itemM.ref_Name] || '')}
              onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
              handleChangeForm={text => handleOnChangeInput(itemM, text)}
              placeholder={itemM.textValue}
              keyboardType={'phone-pad'}
              inputStyle={formStyles.inputText}
              maxLength={itemM.numberValue}
              editable={itemM.ref_Id !== 1 && isEditable}
            />
          );
        case 'text':
        case 'textCode':
          return (
            <FormGroup
              title={itemM.nameVN}
              key={index + '_' + itemM.ref_Name}
              value={itemInfo.currentItem[itemM.ref_Name] || ''}
              handleChangeForm={text => handleOnChangeInput(itemM, text)}
              onClearTextAndroid={() => handleOnChangeInput(itemM, null)}
              keyboardType={'default'}
              editable={itemM.ref_Id !== 1 && isEditable}
              inputStyle={formStyles.inputText}
              placeholder={'Nhập ' + itemM.nameVN + ' ở đây'}
            />
          );
        case 'itemSelected':
          const data = parseJsonArray(itemM.filterList);
          return (
            <MutipleItemSelected
              key={'itemSelected_' + index}
              isRequire={itemM.isRequired == 1}
              typeItem={itemM.ref_Name}
              isUploaded={itemM.ref_Id === 1 || !isEditable}
              isFilter={data.length > 5}
              titleName={itemM.name}
              dataItems={data}
              defaultValue={itemInfo.currentItem[itemM.ref_Name] || ''}
              onItemChoose={handlerSelectItem}
            />
          );
      }
    });
  };

  return (
    <View
      key={'EditSellout_' + itemInfo.indexItem}
      style={formStyles.formContainer}
    >
      <ScrollView
        style={formStyles.formScroll}
        contentContainerStyle={formStyles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {displayItem()}
      </ScrollView>
      <View style={formStyles.actionRow}>
        {isSendData && (
          <View style={formStyles.sendingContainer}>
            <SpiralIconAnimation
              isLoop={isSendData}
              sourceIcon={require('../../Themes/lotties/sync_load.json')}
            />
            <Text style={[formStyles.sendingText, { color: appcolor.dark }]}>
              Đang gửi ...
            </Text>
          </View>
        )}
        {itemInfo.currentItem.isShowSend == 1 && !isSendData && (
          <TouchableOpacity
            onPress={onSendItem}
            style={[
              formStyles.submitButton,
              { backgroundColor: appcolor.primary },
            ]}
          >
            <Text style={[formStyles.buttonText, { color: appcolor.white }]}>
              Gửi
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
const ShowPhotoItem = ({
  itemSell,
  listPhoto,
  handleSelectImage,
  handleDeletePhoto,
  isSendData,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const renderItem = ({ item, index }) => {
    const photoPath = item.photoPath || item.AttendantPhoto || '';
    const photoUrl = photoPath.includes('uploaded')
      ? URLDEFAULT + photoPath
      : photoPath;
    const onSelectImage = () => {
      handleSelectImage(listPhoto, index);
    };
    const onDeletePhoto = () => {
      handleDeletePhoto(listPhoto, item);
    };
    return (
      <View style={{ marginRight: 5 }}>
        <TouchableOpacity
          key={'photo_' + index}
          onPress={() => onSelectImage()}
          style={{
            width: deviceWidth / 5.5,
            height: deviceWidth / 5.5,
            backgroundColor: appcolor.grey,
            margin: 2,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', height: '100%', borderRadius: 12 }}
          />
        </TouchableOpacity>
        {item?.isPhotoSystem !== 1 &&
          (itemSell?.isEditInfo === 2 || itemSell?.isEditInfo === 3) && (
            <TouchableOpacity
              style={{
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 5,
                right: 5,
                borderRadius: 10,
                backgroundColor: appcolor.danger,
              }}
              disabled={isSendData}
              onPress={onDeletePhoto}
            >
              <SpiralIcon
                color={appcolor.white}
                name="times"
                type="font-awesome-5"
                size={14}
              />
            </TouchableOpacity>
          )}
      </View>
    );
  };
  return (
    <View style={{}}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        key={'listPhotoItem'}
        horizontal
        keyExtractor={(item, index) =>
          `${item.photoPath || item.photoTime || 'photo'}_${index}`
        }
        data={listPhoto}
        renderItem={renderItem}
      />
    </View>
  );
};
const ViewHistoryVerify = ({ listHistory, handleSelectImageVerify }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const renderItemHistory = item => {
    const itemSellOut = parseJsonArray(item.dataInput)[0] || {};
    const dataPhoto = parseJsonArray(item.dataPhoto);
    return (
      <View
        style={{
          padding: 5,
          backgroundColor: appcolor.surface,
          borderRadius: 10,
          marginBottom: 5,
        }}
      >
        <View style={{ padding: 5, justifyContent: 'center' }}>
          <Text
            style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}
          >
            {`Ngày bán : `}
            {itemSellOut.sellDate}
          </Text>
          <Text
            style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}
          >
            {`Số serial : `}
            {itemSellOut.imei1}
          </Text>
          <Text
            style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}
          >
            {`Số lượng : `}
            {itemSellOut.quantity}
          </Text>
          <Text
            style={{ fontWeight: '600', fontSize: 14, color: appcolor.danger }}
          >
            {`Lí do : `}
            {itemSellOut.confirmedNote}
          </Text>
          <Text
            style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}
          >
            {`Cập nhật lúc : `}
            {moment(item.createdDate).format('YYYY-MM-DD HH:mm')}
          </Text>
        </View>
        <View style={{}}>
          <ShowPhotoItem
            listPhoto={dataPhoto}
            handleSelectImage={handleSelectImageVerify}
          />
        </View>
      </View>
    );
  };
  return (
    <View
      style={{
        padding: 5,
        flex: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <ScrollView scrollEnabled>
        {listHistory.map((item, index) => {
          return (
            <View
              key={`${item.id || item.createdDate || 'itemVerify'}_${index}`}
            >
              {renderItemHistory(item)}
            </View>
          );
        })}
        <View style={{ height: deviceHeight / 3 }} />
      </ScrollView>
    </View>
  );
};
