import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  LayoutAnimation,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  DataKPI,
  DataScoreKPI,
  UploadScoreKPI,
} from '../../../API/KPIEmployeeAPI';
import {
  MessageInfo,
  ToastError,
  ToastSuccess,
  groupDataByKey,
} from '../../../Core/Helper';
import { LoadingView } from '../../../Control/ItemLoading/index';
import FormGroup from '../../../Content/FormGroup';
import { Icon, Text } from '@rneui/themed';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import {
  TODAY,
  alertConfirm,
  deviceHeight,
  deviceWidth,
  minWidthTab,
  removeDuplicate,
} from '../../../Core/Utility';
import _, { debounce } from 'lodash';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import moment from 'moment';
import { ViewListKPIV2 } from './ViewListKPIV2';
import { UIManager } from 'react-native';
import { YearMonthSelected } from '../../../Control/YearMonthSelected';
import { DATE } from '../../BusinessTrips/UtilityBusiness';
import { HeaderInfoKPI } from './HeaderInfo';
import { ModalNotify } from '../../../Control/ModalNotify';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import KPIGroupView from './ViewHistoryKPI';
import { SetKpiSummary } from '../../../Redux/action';
import CustomListView from '../../../Control/Custom/CustomListView';

import { deletePhotoByList } from '../../../Controller/PhotoController';
import { MultipleShowImage } from '../../../Control/MultipleShowImage';
import { URLDEFAULT } from '../../../Core/URLs';
import UploadController from '../../../Controller/UploadController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ScoreKPIV2 = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const configData = JSON.parse(kpiinfo?.reportItem || '{}');
  const tabRef = useRef();
  const [loading, setLoading] = useState(false);
  const [dataScore, setDataScore] = useState({
    shopList: [],
    employeeList: [],
  });
  const [dataAll, setDataAll] = useState({ dataFilter: [], mDataFilter: [] });
  const [dataPhoto, setDataPhoto] = useState({ listDataPhoto: [] });
  const [dataKPI, setDataKPI] = useState([]);
  const [settings, setSettings] = useState({
    shopId: 0,
    shopName: '',
    shopCode: '',
    userId: 0,
    fullName: '',
    employeeCode: '',
    resultItem: '',
    totalKpi: 0,
  });
  const [dateKPI, setDateKPI] = useState({
    value: moment().format('YYYYMMDD'),
    date: moment().format('YYYY-MM-DD'),
    isView: false,
  });
  const [_mutate, setMutate] = useState(false);
  var [filter, setFilter] = useState({
    loadYearMonth: false,
    date: moment().format('YYYYMMDD'),
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });
  const [isShowResult, setShowResult] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const dispatch = useDispatch();
  const [configTableData, setConfigTableData] = useState({});
  const [isVisible, setVisible] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [configKPI, setConfigKPI] = useState({ isLockSend: 0 });
  const [detailData, setDetailData] = useState([]);
  const [dataPhotoItem, setDataPhotoItem] = useState({
    itemSelect: {},
    listPhoto: [],
  });
  const [itemShowImage, _setItemShowImage] = useState({
    visible: false,
    photos: [],
    index: 0,
  });
  const [photoTool, setPhotoTool] = useState({
    isShowDelete: 0,
    listDelete: [],
  });

  const LoadData = async () => {
    await setLoading(true);
    await DataScoreKPI(
      configData.byShop || 0,
      filter.month,
      filter.year,
      async ({ messager, data }) => {
        messager !== null && ToastError(messager);
        messager == null &&
          setDataScore({
            shopList: data?.table || [],
            employeeList: data?.table1 || [],
          });
        setConfigTableData(
          JSON.parse(data?.table1?.[0]?.configTableData || '{}'),
        );
        if (messager == null && configData.byShop == 0) {
          const listEmp = await removeDuplicate(
            data?.table1 || [],
            'employeeId',
          );
          setDataAll({ dataFilter: listEmp, mDataFilter: listEmp });
          // setMDataFilter
        } else {
          setDataAll({
            dataFilter: data?.table || [],
            mDataFilter: data?.table || [],
          });
        }
      },
    );
    // await getDataKPI()

    // await showFilterData()
    await setLoading(false);
  };
  const getDataKPI = async (shopId, userId, workDate) => {
    await setLoading(true);
    const selectedShopId =
      configData.byShop == 0 ? 0 : shopId || settings.shopId;
    await DataKPI(
      userId || settings.userId,
      selectedShopId,
      workDate || dateKPI.value,
      async ({ messager, data }) => {
        if (messager !== null) {
          ToastError(messager);
        } else {
          const itemKPI = data?.[0] || {};
          setConfigKPI({ isLockSend: itemKPI.isLockSend || 0 });
          await groupDataKPI(data || []);
          // await setDataKPI(data)
        }
      },
    );
    await setLoading(false);
  };
  const countByData = dataGroup => {
    let arrTotal = [];
    let arrKPI = [];
    let totalKpi = 0;
    for (let i = 0; i < dataGroup.length; i++) {
      const item = dataGroup[i];
      const dataDetail = JSON.parse(item.detail || '[]');
      let totalByGroup = 0;
      for (let idx = 0; idx < dataDetail.length; idx++) {
        const it = dataDetail[idx];
        if (it.IsChecked == 1) {
          totalByGroup = totalByGroup + (it.Point || 0);
        }
        if (totalByGroup > it.GroupPoint) {
          totalByGroup = it.GroupPoint;
        }
      }
      totalKpi = totalKpi + totalByGroup;
      arrTotal.push({
        groupId: item.groupId,
        groupName: item.groupName,
        totalByGroup: totalByGroup,
      });
    }

    arrKPI = [{ totalSummary: totalKpi }, ...arrTotal];
    dispatch(SetKpiSummary(arrKPI || []));
  };
  const configDataITem = async data => {
    let dataGroup = [...data];
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      const dataTab = JSON.parse(item.detail || '[]');
      const listTab = await removeDuplicate(dataTab, 'SubGroupId');
      dataGroup[index].groupDetail = JSON.stringify(listTab);
    }
    countByData(dataGroup);
    return dataGroup;
  };
  const groupDataKPI = async data => {
    const dataGroup = await configDataITem(data);
    await setDataKPI(dataGroup);
    //
  };

  const validateQuantity = () => {
    let listGroup = [];
    if (configData.isCheckNote == 1) {
      for (let index = 0; index < dataKPI.length; index++) {
        const item = dataKPI[index];
        if (item.isLock !== 1 && (!item.note || item.note.length == 0)) {
          const dataByGroup = JSON.parse(item.detail || '[]');
          const dataCheck = _.filter(dataByGroup, e => e.IsChecked == 1);
          if (dataCheck.length > 0) {
            listGroup.push(item.groupName);
          }
        }
      }
    }
    if (listGroup.length > 0) {
      return {
        valid: false,
        message: `Chưa nhập ghi chú : ${listGroup.join(', ')}`,
      };
    }

    for (let index = 0; index < dataKPI.length; index++) {
      const item = dataKPI[index];
      const dataByGroup = JSON.parse(item.detail || '[]');
      const dataCheck = _.filter(
        dataByGroup,
        e => e.IsChecked == 1 && e.isLock !== 1,
      );
      let listKPICheck = [];
      for (let index = 0; index < dataCheck.length; index++) {
        const itemCheck = dataCheck[index];
        if (
          itemCheck.IsRequiredNote == 1 &&
          (!itemCheck.note || itemCheck.note?.length == 0)
        ) {
          listKPICheck.push(itemCheck.KPIName);
        }
      }
      if (listKPICheck.length > 0) {
        return {
          valid: false,
          message: `Chưa nhập ghi chú nhóm ${
            item.groupName
          }\nKPI: ${listKPICheck.join('\n')}`,
        };
      }
    }

    return { valid: true };
  };

  const UploadData = async () => {
    const result = validateQuantity();
    if (!result.valid) {
      MessageInfo(result.message);
      return;
    }
    alertConfirm(
      'Gửi dữ liệu',
      'Sau khi gửi bảng chấm điểm KPI dữ liệu sẽ khoá, Vui lòng kiểm tra kỹ trước khi xác nhận',
      async () => {
        await UploadScoreKPI(dataKPI, async info => {
          if (info.status == 200) {
            await ToastSuccess(info.messeger);
            await setIsUpdate(true);
            await UploadController.PostFile();
            await getDataKPI(settings.shopId, settings.userId, dateKPI.value);
            await LoadData();
          } else ToastError(info.messeger);
        });
      },
      null,
      'Xác nhận',
      'Huỷ',
    );
  };
  // Handler Action
  const handlerAnswer = (item, index) => {
    const value = item.IsChecked == 1 ? 0 : 1;
    const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);

    const detail = JSON.parse(dataKPI[indexData].detail);
    const itemDetail = detail[index];
    itemDetail.IsChecked = value;

    dataKPI[indexData].detail = JSON.stringify(detail);
    setMutate(e => !e);
  };
  const showFilterData = async () => {
    if (isUpdate == true) {
      await LoadData();
    }
    await setShowResult(true);

    // SheetManager.show('sheetFilterKPI')
  };
  const showCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDateKPI({ ...dateKPI, isView: !dateKPI.isView });
  };
  const hanlerChooseDate = date => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const dateView = moment(date).format('DD MMM, YYYY');
    const dateValue = moment(date).format('YYYYMMDD');
    dataKPI.map((item, index) => {
      item.auditDate = dateView;
      item.workDate = dateValue;
    });
    setDateKPI({ value: dateValue, date: date, isView: false });
    getDataKPI(0, settings.userId, dateValue);
    setMutate(e => !e);
  };
  const handlerChooseItem = async item => {
    if (item.typeName == 'STORE') {
      const employeeList = dataScore.employeeList.filter(
        i => i.shopId == item.shopId,
      );
      setDataAll({ dataFilter: employeeList, mDataFilter: employeeList });
      setSettings({
        ...settings,
        shopId: item.shopId,
        shopName: item.shopName,
        shopCode: item.shopCode,
      });
    } else {
      await getDataKPI(settings.shopId, item.employeeId, dateKPI.value);
      // SheetManager.hide('sheetFilterKPI')
      setShowResult(false);
      setIsUpdate(false);
      setSettings({
        ...settings,
        userId: item.employeeId,
        fullName: item.employeeName,
        employeeCode: item.employeeCode,
        totalKpi: item.numTotalKPI,
      });
      if (configData.byShop == 0) {
        const listEmp = await removeDuplicate(
          dataScore.employeeList,
          'employeeId',
        );
        setDataAll({ dataFilter: listEmp, mDataFilter: listEmp });
      } else {
        setDataAll({
          dataFilter: dataScore.shopList,
          mDataFilter: dataScore.shopList,
        });
        // setDataFilter(dataScore.shopList)
      }
    }
  };
  const handlerNote = (text, item, i) => {
    dataKPI[i].note = text;
    setMutate(e => !e);
  };

  const handlerFilterItem = debounce(async text => {
    // {"employeeCode": "072098002261", "employeeId": 32355, "employeeName": "Phạm Tiến", "numTotalKPI": "100", "shopId": 455964, "totalKPI": "Điểm KPI : 100 Điểm", "typeName": "EMPLOYEE", "typePG": null}
    const filterList = _.filter(dataScore.employeeList, i => {
      const employeeName = i.employeeName || '';
      const employeeCode = i.employeeCode || '';
      const typePG = i.typePG || '';
      const listEmployee = JSON.stringify(dataShopByEmp(i));
      return (
        employeeName.toLowerCase().match(text.toLowerCase()) ||
        employeeCode.toLowerCase().match(text.toLowerCase()) ||
        typePG.toLowerCase().match(text.toLowerCase()) ||
        listEmployee.toLowerCase().match(text.toLowerCase())
      );
    });
    const listEmp = await removeDuplicate(filterList, 'employeeId');
    setDataAll({ ...dataAll, dataFilter: listEmp });
  }, 200);
  //
  useEffect(() => {
    LoadData();
    return () => loading;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentView: { flex: 1 },
    titleHeader: {
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 8,
    },
    pointView: { alignItems: 'center', padding: 8 },
    viewDate: { margin: 8 },
    titleFilter: {
      textAlign: 'center',
      padding: 12,
      fontWeight: '600',
      fontSize: 18,
      color: appcolor.dark,
    },
    filterItemRow: { flexDirection: 'row', justifyContent: 'space-between' },
    filterItemIndex: {
      width: '12%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: appcolor.surface,
      borderWidth: 0,
    },
    filterItemIndexText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
    },
    filterItemInfo: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      width: '67%',
      paddingBottom: 2,
      alignSelf: 'center',
      borderColor: appcolor.surface,
      borderWidth: 0,
    },
    filterItemInfoText: {
      padding: 8,
      paddingBottom: 0,
      fontSize: 14,
      fontWeight: '600',
      color: appcolor.dark,
    },
    filterItemInfoSubText: {
      padding: 8,
      paddingTop: 0,
      paddingBottom: 0,
      fontSize: 13,
      fontWeight: '400',
      color: appcolor.greylight,
    },
    filterItemInfoPG: {
      padding: 8,
      paddingTop: 0,
      fontSize: 13,
      paddingBottom: 0,
      fontWeight: '400',
      color: appcolor.greylight,
    },
    filterItemShopList: { borderRadius: 4, padding: 4, left: 4, minHeight: 25 },
    filterItemShopListTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: appcolor.dark,
      width: '80%',
    },
    filterItemShopListText: {
      fontSize: 12,
      fontWeight: '400',
      color: appcolor.dark,
      width: '80%',
    },
    filterItemPointBtn: {
      width: '18%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      borderColor: appcolor.surface,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    filterItemPointBtnText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
    },
    filterItemWarning: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 0,
      height: 0,
      borderTopWidth: 12,
      borderLeftWidth: 12,
      borderTopColor: 'red',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      borderStyle: 'solid',
    },
    detailView: {},
    detailDateTitle: { padding: 8 },
    detailDateTitleText: {
      fontWeight: '600',
      fontSize: 14,
      color: appcolor.primary,
    },
    detailGroupTitle: { padding: 8 },
    detailGroupTitleText: {
      fontWeight: '600',
      fontSize: 13,
      color: appcolor.primary,
    },
    detailSubTitle: {
      padding: 6,
      backgroundColor: appcolor.greydark,
      borderRadius: 6,
    },
    detailSubTitleText: {
      fontWeight: '600',
      fontSize: 12,
      color: appcolor.white,
    },
    detailRow: { flexDirection: 'row' },
    detailRowName: { width: '80%' },
    detailRowNameText: { fontWeight: '400', fontSize: 12, marginTop: 4 },
    detailRowNameTextWarning: { color: appcolor.warning },
    detailRowNameTextNormal: { color: appcolor.dark },
    detailRowPoint: {
      width: '20%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailRowPointText: { fontWeight: '600', fontSize: 12 },
    detailRowPointTextWarning: { color: appcolor.warning },
    detailRowPointTextNormal: { color: appcolor.dark },
    tabTitleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    tabTitleIndex: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      width: '12%',
      paddingBottom: 2,
      justifyContent: 'center',
      alignItems: 'center',
      height: 30,
    },
    tabTitleInfo: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      width: '67%',
      paddingBottom: 2,
      justifyContent: 'center',
      alignItems: 'center',
      height: 30,
    },
    tabTitleIndexText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
    },
    tabTitlePoint: {
      width: '18%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 4,
      justifyContent: 'center',
      alignItems: 'center',
      height: 30,
    },
    tabContent: { width: '100%', height: deviceHeight },
    tabScroll: { width: '100%', height: deviceHeight },
    tabBottomSpacer: { height: deviceHeight / 4 },
    tabContainer: { flex: 1, display: 'flex', backgroundColor: appcolor.light },
    tabContentView: {
      backgroundColor: appcolor.light,
      padding: 5,
      width: deviceWidth,
      flexGrow: 1,
    },
    tabContentContainer: { paddingTop: 62, paddingBottom: 120 },
    modalDetail: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalDetailContent: { height: deviceHeight * 0.4, width: deviceWidth - 80 },
    yearMonthView: {
      paddingBottom: 14,
      marginBottom: 12,
      backgroundColor: appcolor.light,
    },
    yearMonthPanel: { paddingBottom: 4 },
    yearMonthBtn: {
      marginTop: 8,
      backgroundColor: appcolor.primary,
      borderRadius: 10,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    yearMonthBtnText: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      textAlign: 'center',
      color: appcolor.white,
      fontWeight: '700',
      fontSize: 15,
    },
  });

  const onFilterChange = searchInfo => {
    filter = { ...filter, ...searchInfo };
    setFilter(filter);
  };

  const dataShopByEmp = item => {
    let listShop = [];
    const listStoreFilter = dataScore.employeeList.filter(
      it => it.employeeId == item.employeeId,
    );
    for (let i = 0; i < dataScore.shopList.length; i++) {
      const itemS = dataScore.shopList[i];
      const listF = listStoreFilter.filter(it => it.shopId == itemS.shopId);
      if (listF.length > 0) {
        listShop.push(itemS);
      }
    }
    return listShop;
  };

  const showSelectYearMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter({
      ...filter,
      loadYearMonth: filter.loadYearMonth ? false : true,
    });
  };

  const handlerChooseMonth = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (filter.month > moment().month() + 1 && filter.year >= moment().year()) {
      ToastError('Bạn không được chấm KPI lớn hơn tháng hiện tại!!');
      return;
    }

    const currentMonth = moment().month() + 1;
    const currentYear = moment().year();
    let dayByMonth = moment().format('YYYYMMDD');
    if (currentMonth == filter.month && currentYear == filter.year) {
      dayByMonth = dayByMonth;
    } else {
      const lastDay = moment(`${filter.year}-${filter.month}`, 'YYYY-MM').endOf(
        'month',
      );
      dayByMonth = lastDay.format('YYYYMMDD');
    }

    filter = { ...filter, date: dayByMonth, loadYearMonth: false };
    setFilter(filter);
    setDateKPI({
      value: dayByMonth,
      date: moment(dayByMonth).format('YYYY-MM-DD'),
      isView: false,
      auditDate: moment(dayByMonth).format('DD MMM, YYYY'),
    });
    await LoadData();
  };

  const renderItemFilter = ({ item, index }) => {
    const onChoose = () => {
      handlerChooseItem(item);
    };
    const titleShop = `CH: (${item.shopCode}) - ${item.shopName}`;
    const titleEmployee = `NV: ${item.employeeName}`;
    const dataItem = dataShopByEmp(item);
    const numStore = dataItem.length || 0;
    return (
      <View
        key={`filterItem_${item.employeeId || item.shopId}_${index}`}
        onPress={onChoose}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            width: '12%',
            backgroundColor: appcolor.surface,
            borderRadius: 8,
            marginBottom: 4,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: item.colorHaveScore
              ? item.colorHaveScore
              : appcolor.surface,
            borderWidth: item.colorHaveScore ? 0.6 : 0,
          }}
        >
          <Text style={styles.tabTitleIndexText}>{`${index + 1}`}</Text>
        </View>
        <TouchableOpacity
          onPress={onChoose}
          style={{
            backgroundColor: appcolor.surface,
            borderRadius: 8,
            marginBottom: 4,
            width: '67%',
            paddingBottom: 2,
            alignSelf: 'center',
            borderColor: item.colorHaveScore
              ? item.colorHaveScore
              : appcolor.surface,
            borderWidth: item.colorHaveScore ? 0.6 : 0,
          }}
        >
          <Text
            style={{
              padding: 8,
              paddingBottom: 0,
              fontSize: 14,
              fontWeight: '600',
              color: appcolor.dark,
            }}
          >
            {item.typeName == 'STORE' ? titleShop : titleEmployee}
          </Text>
          <Text
            style={{
              padding: 8,
              paddingTop: 0,
              paddingBottom: 0,
              fontSize: 13,
              fontWeight: '400',
              color: appcolor.greylight,
            }}
          >
            {item.typeName == 'STORE'
              ? `Đc: ${item.address}`
              : `Code: ${item.employeeCode}`}
          </Text>
          {item.typeName !== 'STORE' &&
            item.typePG !== undefined &&
            item.typePG !== null && (
              <Text
                style={{
                  padding: 8,
                  paddingTop: 0,
                  fontSize: 13,
                  paddingBottom: 0,
                  fontWeight: '400',
                  color: appcolor.greylight,
                }}
              >
                {item.typePG}
              </Text>
            )}
          {configData.byShop == 0 && dataItem.length > 0 && (
            <View
              style={{ borderRadius: 4, padding: 4, left: 4, minHeight: 25 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: appcolor.dark,
                  width: '80%',
                }}
              >
                Cửa hàng phụ trách ({numStore})
              </Text>
              {numStore < 10 && (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: appcolor.dark,
                    width: '80%',
                  }}
                >
                  {dataItem?.map((it, idx) => {
                    return (
                      it.shopName +
                      '(' +
                      it.shopCode +
                      ')' +
                      `${dataItem.length - 1 == idx ? '' : ', '}`
                    );
                  })}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSelectKPI(item)}
          style={{
            width: '18%',
            backgroundColor: appcolor.surface,
            borderRadius: 8,
            marginBottom: 4,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 10,
            borderColor: item.colorScore ? item.colorScore : appcolor.surface,
            borderWidth: item.colorScore ? 0.6 : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          activeOpacity={0.7}
        >
          {item.isWarning == 1 && (
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 0,
                height: 0,
                borderTopWidth: 12,
                borderLeftWidth: 12,
                borderTopColor: 'red',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderStyle: 'solid',
              }}
            />
          )}
          <Text style={styles.tabTitleIndexText}>{`${item.numTotalKPI}`}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItemDetail = (item, index) => {
    const keyLayer2 =
      item[`${item[item.g1 || 'WorkDate']}${item[item.g2 || 'GroupId']}`];
    const keyLayer3 =
      item[
        `${item[item.g1 || 'WorkDate']}${item[item.g2 || 'GroupId']}${
          item[item.g3 || 'SubGroupId']
        }`
      ];
    return (
      <View
        key={`ItemDetail_${item.KPIId}_${item.WorkDate}_${index}`}
        style={styles.detailItem}
      >
        {item.isParent && item.HiddenG1 !== 1 && (
          <View
            key={'DateTitleDetail_' + item.KPIId}
            style={styles.detailDateTitle}
          >
            <Text style={styles.detailDateTitleText}>
              {item[item.g1 || 'WorkDate']}
            </Text>
          </View>
        )}
        {keyLayer2 && item.HiddenG2 !== 1 && (
          <View
            key={'GroupTitleDetail_' + item.KPIId}
            style={styles.detailGroupTitle}
          >
            <Text style={styles.detailGroupTitleText}>
              {item[item.g2 || 'GroupName']}
            </Text>
          </View>
        )}
        {keyLayer3 && item.SubGroupId && item.HiddenG3 !== 1 && (
          <View
            key={'SubTitleDetail_' + item.KPIId}
            style={styles.detailSubTitle}
          >
            <Text style={styles.detailSubTitleText}>
              {item[item.g3 || 'SubGroupName']}
            </Text>
          </View>
        )}
        <View key={'Detail_' + item.KPIId} style={styles.detailRow}>
          <View style={styles.detailRowName}>
            <Text
              style={[
                styles.detailRowNameText,
                item.isWarning == 1
                  ? styles.detailRowNameTextWarning
                  : styles.detailRowNameTextNormal,
              ]}
            >
              {item[item.ItemField || 'KPIName']}
            </Text>
            {item.Note != null && item.Note !== '' && (
              <Text style={{ fontSize: 12, color: appcolor.dark }}>
                {
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 14,
                      color: appcolor.dark,
                    }}
                  >
                    Ghi chú:
                  </Text>
                }{' '}
                {`${item.Note}`}
              </Text>
            )}
          </View>
          <View style={styles.detailRowPoint}>
            <Text
              style={[
                styles.detailRowPointText,
                item.isWarning == 1
                  ? styles.detailRowPointTextWarning
                  : styles.detailRowPointTextNormal,
              ]}
            >
              {item.Point}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const handleSelectKPI = async item => {
    const dataKpi = JSON.parse(item.dataKpi || '[]');
    const { arr } = groupDataByKey({
      arr: dataKpi,
      key: item.g1 || 'WorkDate',
      keyLayer2: item.g2 || 'GroupId',
      keyLayer3: item.g3 || 'SubGroupId',
    });
    if (arr?.length == 0) {
      return;
    }
    await setDetailData(arr);
    await handleVisibleModal(true);
  };

  const onShowDetail = () => {
    return (
      <View key={'ViewDetail'} style={styles.modalDetailContent}>
        {detailData.length > 0 && (
          <ScrollView
            nestedScrollEnabled={true}
            style={{ flex: 1, marginBottom: 10 }}
          >
            {detailData.map((it, index) => {
              return renderItemDetail(it, index);
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const handleGoBack = () => {
    dispatch(SetKpiSummary([]));
    navigation.goBack();
  };

  const handleSelectItemTab = itemTab => {
    const indexTab = dataKPI.findIndex(
      itemT => itemT.groupId == itemTab.groupId,
    );
    tabRef.current?.setIndex(indexTab);
  };

  const handleVisibleModal = async visible => {
    await setVisible(visible);
    if (!visible) {
      setDetailData([]);
    }
  };

  const handleSelectHistory = async dataHistoryView => {
    if (dataHistoryView?.length > 0) {
      SheetManager.show('viewSheetHistory', { payload: dataHistoryView });
    }
  };

  const showALbumByItem = (dataPhotoItem, itemSelect) => {
    const dataSelect = { listPhoto: dataPhotoItem, itemSelect: itemSelect };
    SheetManager.show('ref_photoItem', { payload: dataSelect });
  };
  const handlerShowImage = index => {
    itemShowImage.visible = true;
    itemShowImage.photos = dataPhotoItem.listPhoto;
    itemShowImage.index = index;
    setMutate(e => !e);
  };
  const handlerPressItem = item => {
    item.isSelect = item.isSelect == 1 ? 0 : 1;
    photoTool.isShowDelete = item.isSelect == 1 ? 1 : 0;
    if (item.isSelect == 1) {
      photoTool.listDelete.push(item);
    } else {
      photoTool.listDelete = _.filter(
        photoTool.listDelete,
        it => it.id !== item.id,
      );
    }
    setMutate(e => !e);
  };
  const onDeletePhoto = () => {
    // photoTool.listDelete
    const listDelete = _.filter(photoTool.listDelete, it => it.isSystem != 1);
    deletePhotoByList(listDelete);
    const newListPhoto = _.filter(
      dataPhotoItem?.listPhoto || [],
      it => it.isSelect !== 1,
    );

    const indexData = dataKPI.findIndex(
      i => i.groupId == dataPhotoItem.itemSelect.GroupId,
    );
    if (indexData < 0) {
      return;
    }
    const detail = JSON.parse(dataKPI[indexData].detail);
    const indexDetail = detail.findIndex(
      i => i.KPIId == dataPhotoItem.itemSelect.KPIId,
    );
    if (indexDetail < 0) {
      return;
    }
    const itemDetail = detail[indexDetail];
    itemDetail.listPhoto =
      newListPhoto?.length > 0 ? JSON.stringify(newListPhoto) : null;
    dataPhotoItem.itemSelect.listPhoto =
      newListPhoto?.length > 0 ? JSON.stringify(newListPhoto) : null;
    dataKPI[indexData].detail = JSON.stringify(detail);

    dataPhotoItem.listPhoto = newListPhoto;
    photoTool.listDelete = [];
    photoTool.isShowDelete = 0;
    setMutate(e => !e);
  };
  const handlerCloseShowImage = () => {
    itemShowImage.visible = false;
    itemShowImage.photos = [];
    itemShowImage.index = 0;
    setMutate(e => !e);
  };
  const onCloseSheet = () => {
    photoTool.listDelete = [];
    photoTool.isShowDelete = 0;
    setDataPhotoItem({ itemSelect: {}, listPhoto: [] });
  };

  if (!isShowResult) {
    return (
      <View style={{ flex: 1, backgroundColor: appcolor.primary }}>
        <HeaderCustom
          title={kpiinfo.menuNameVN}
          iconRight="cloud-upload-alt"
          rightFunc={
            configKPI.isLockSend == 1
              ? null
              : !isShowResult
              ? configData.isLockSend == 1
                ? null
                : dateKPI.value == TODAY
                ? UploadData
                : configData.isLockHistory == 1
                ? null
                : UploadData
              : null
          }
          leftFunc={isShowResult == false ? showFilterData : handleGoBack}
        />

        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
          <View style={styles.viewDate}>
            <View style={{ flexDirection: 'row' }}>
              <FormGroup
                containerStyle={{
                  width: configData.isUseViewHistory == 1 ? '80%' : '100%',
                  padding: 5,
                  backgroundColor: appcolor.placeholderBody,
                }}
                inputStyle={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: appcolor.greylight,
                }}
                title="Ngày chấm điểm"
                iconRight="calendar-alt"
                value={dateKPI.date}
                rightFunc={showCalendar}
              />
              {configData.isUseViewHistory == 1 && (
                <TouchableOpacity
                  onPress={() => handleSelectHistory()}
                  style={{
                    width: '20%',
                    marginBottom: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <SpiralIcon
                    name="history"
                    type="font-awesome"
                    size={30}
                    color="#333"
                    containerStyle={{ alignItems: 'center' }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {dateKPI.isView && (
              <CalendarSelected
                onChangeData={hanlerChooseDate}
                isBetween={false}
                disibleFuture={configData.isFuture == 1}
                defaultDate={dateKPI.date}
                maxDate={moment().format('YYYY-MM-DD')}
              />
            )}
          </View>
          {dataKPI.length > 0 && (
            <HeaderInfoKPI
              handleSelectItemTab={handleSelectItemTab}
              item={settings}
              configData={configData}
              dataKPI={dataKPI}
              dataShopByEmp={dataShopByEmp}
              configTableData={configTableData}
            />
          )}
          <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
          <View style={styles.contentView}>
            <Tabs.Container
              ref={tabRef}
              renderTabBar={props => (
                <MaterialTabBar
                  {...props}
                  style={{ margin: 5 }}
                  labelStyle={{ fontSize: 14, fontWeight: '600' }}
                  indicatorStyle={{ backgroundColor: appcolor.transparent }}
                  inactiveColor={appcolor.greylight}
                  activeColor={appcolor.info}
                  tabStyle={{
                    margin: 5,
                    borderRadius: 30,
                    backgroundColor: appcolor.surface,
                    minWidth: minWidthTab(dataKPI),
                    height: 38,
                  }}
                  scrollEnabled={true}
                />
              )}
              containerStyle={{ backgroundColor: appcolor.surface, flex: 1 }}
            >
              {dataKPI.length > 0 &&
                dataKPI.map((it, i) => {
                  let dataItem = JSON.parse(it.detail) || [];
                  let dataGroup = JSON.parse(it.groupDetail) || [];
                  const noteAction = text => {
                    handlerNote(text, it, i);
                  };
                  const dataKPIHistory = JSON.parse(it.dataKPI || '[]');
                  return (
                    <Tabs.Tab
                      key={`itemOsas_${i}`}
                      label={it.groupName}
                      name={it.groupName}
                    >
                      <Tabs.ScrollView
                        style={styles.tabContentView}
                        contentContainerStyle={styles.tabContentContainer}
                        showsVerticalScrollIndicator={false}
                      >
                        {configData.noteByGroup !== 1 &&
                          configData.noteByItem !== 1 && (
                            <FormGroup
                              containerStyle={{
                                backgroundColor: appcolor.placeholderBody,
                                margin: 8,
                              }}
                              editable={it.isLock == 0}
                              title="Ghi chú"
                              placeholder="Nhập ghi chú"
                              defaultValue={it.note}
                              handleChangeForm={noteAction}
                              onClearTextAndroid={noteAction}
                            />
                          )}
                        <ViewListKPIV2
                          dataItem={dataItem}
                          dataPhoto={dataPhoto}
                          settings={settings}
                          showALbumByItem={showALbumByItem}
                          dataGroup={dataGroup}
                          dataKPI={dataKPI}
                          dataKPIHistory={dataKPIHistory}
                          configData={configData}
                          countByData={countByData}
                          configTableData={configTableData}
                          handleSelectHistory={handleSelectHistory}
                        />
                      </Tabs.ScrollView>
                    </Tabs.Tab>
                  );
                })}
            </Tabs.Container>
          </View>
        </View>
        <ActionSheet
          id="viewSheetHistory"
          onBeforeShow={setDataHistory}
          nestedScrollEnabled
          gestureEnabled
          containerStyle={{ paddingBottom: insets.bottom }}
        >
          <Text
            style={styles.titleFilter}
          >{`Lịch sử chấm điểm nhân viên`}</Text>
          <View>
            {dataHistory?.length > 0 && (
              <KPIGroupView dataHistory={dataHistory} />
            )}
          </View>
        </ActionSheet>
        {isVisible && (
          <View style={styles.modalDetail}>
            <ModalNotify
              titleNotify={'Chi tiết'}
              isMessageView={true}
              messager={onShowDetail}
              visible={isVisible}
              handleVisibleModal={handleVisibleModal}
              titleConfirm={'Đóng'}
            />
          </View>
        )}
        <ActionSheet
          id={'ref_photoItem'}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            backgroundColor: appcolor.surface,
            paddingBottom: insets.bottom,
          }}
          closeOnPressBack={true}
          gestureEnabled={true}
          onClose={() => onCloseSheet()}
          onBeforeShow={data => setDataPhotoItem(data)}
          indicatorColor={appcolor.primary}
        >
          <View
            style={{
              padding: 8,
              paddingBottom: 30,
              flexDirection: 'row',
              flexWrap: 'wrap',
              height: deviceHeight * 0.6,
            }}
          >
            {dataPhotoItem?.listPhoto?.length > 0 &&
              dataPhotoItem.listPhoto?.map((it, idx) => {
                return (
                  <TouchableOpacity
                    key={it.id + idx}
                    onPress={() => handlerShowImage(idx)}
                    style={{
                      width: (deviceWidth - 16) / 3,
                      height: (deviceWidth - 16) / 3,
                      borderRadius: 12,
                      padding: 2,
                    }}
                  >
                    <Image
                      source={{
                        uri: it.photoPath.includes('uploaded')
                          ? URLDEFAULT + it.photoPath
                          : it.photoPath || '',
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => handlerPressItem(it)}
                      style={{ position: 'absolute', top: 4, right: 4 }}
                    >
                      <SpiralIcon
                        color={appcolor.primary}
                        name={
                          it.isSelect == 1
                            ? 'close-circle-outline'
                            : 'ellipse-outline'
                        }
                        type="ionicon"
                        size={40}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            {photoTool.isShowDelete == 1 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 40,
                  height: 60,
                  width: '100%',
                  paddingHorizontal: 40,
                }}
              >
                <TouchableOpacity
                  key={'DeletePhoto'}
                  onPress={() => onDeletePhoto()}
                  style={{
                    backgroundColor: appcolor.primary,
                    flex: 1,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: appcolor.white,
                      fontWeight: '700',
                    }}
                  >
                    Xoá {`(${photoTool?.listDelete?.length || 0})`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ActionSheet>
        <Modal visible={itemShowImage.visible}>
          <MultipleShowImage
            key="showprofileimage"
            listItem={itemShowImage.photos || []}
            closeShowImage={handlerCloseShowImage}
            indexItem={itemShowImage.index}
          />
        </Modal>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.primary }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        rightFunc={
          configKPI.isLockSend == 1
            ? null
            : !isShowResult
            ? configData.isLockSend == 1
              ? null
              : dateKPI.value == TODAY
              ? UploadData
              : configData.isLockHistory == 1
              ? null
              : UploadData
            : null
        }
        leftFunc={isShowResult == false ? showFilterData : handleGoBack}
      />
      <View style={{ padding: 10, backgroundColor: appcolor.light }}>
        <FormGroup
          containerStyle={{ padding: 5 }}
          inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.dark }}
          iconRight="calendar-alt"
          value={`Tháng ${filter.month} - Năm ${filter.year}`}
          rightFunc={showSelectYearMonth}
        />
        {filter.loadYearMonth && (
          <View style={styles.yearMonthView}>
            <YearMonthSelected
              option={filter}
              contanerStyle={styles.yearMonthPanel}
              onYearMonth={search => onFilterChange(search)}
              numMonth={4}
            />
            <TouchableOpacity
              onPress={() => handlerChooseMonth()}
              style={styles.yearMonthBtn}
            >
              <Text style={styles.yearMonthBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        )}
        <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
        <View
          style={{
            width: '100%',
            height: deviceHeight,
            paddingBottom: deviceHeight / 4.5,
          }}
        >
          <FormGroup
            editable
            containerStyle={{ backgroundColor: appcolor.surface, padding: 5 }}
            inputStyle={{ fontSize: 14 }}
            placeholder={`Tìm kiếm`}
            iconName="search"
            handleChangeForm={handlerFilterItem}
            onClearTextAndroid={handlerFilterItem}
          />
          <View
            key={`11)__title`}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View
              style={{
                backgroundColor: appcolor.surface,
                borderRadius: 8,
                marginBottom: 4,
                width: '12%',
                paddingBottom: 2,
                justifyContent: 'center',
                alignItems: 'center',
                height: 30,
              }}
            >
              <Text style={styles.tabTitleIndexText}>
                {configTableData?.titleRow || 'STT'}
              </Text>
            </View>
            <View style={styles.tabTitleInfo}>
              <Text style={styles.tabTitleIndexText}>
                {configTableData?.titleInfo || 'Thông tin'}
              </Text>
            </View>
            <View style={styles.tabTitlePoint}>
              <Text style={styles.tabTitleIndexText}>
                {configTableData?.titlePoint || 'Điểm'}
              </Text>
            </View>
          </View>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={styles.tabScroll}
          >
            <CustomListView
              data={dataAll.dataFilter}
              extraData={dataAll.dataFilter}
              renderItem={renderItemFilter}
            />
            <View key="bottomSpacer" style={styles.tabBottomSpacer} />
          </ScrollView>
        </View>
      </View>
      {isVisible && (
        <View style={styles.modalDetail}>
          <ModalNotify
            titleNotify={'Chi tiết'}
            isMessageView={true}
            messager={onShowDetail}
            visible={isVisible}
            handleVisibleModal={handleVisibleModal}
            titleConfirm={'Đóng'}
          />
        </View>
      )}
    </View>
  );
};
