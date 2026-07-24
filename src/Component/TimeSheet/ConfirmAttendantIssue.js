import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { Badge, Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import {
  getDataSuggestTimeSheet,
  UpdateSuggestTimeSheet,
} from '../../Controller/TimeSheetController';
import CacheImage from '../../Core/CacheImage';
import {
  groupDataByKey,
  MessageAction,
  MessageInfo,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { URLDEFAULT } from '../../Core/URLs';
import { deviceHeight, deviceWidth } from '../../Core/Utility';
import { REPORT } from '../../API/ReportAPI';
import { PhotoInput } from './Page/PhotoInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const itemTimeSheet = [
  {
    code: 2,
    id: 2,
    name: 'Submit',
    nameVN: 'Chờ xác nhận',
    nameData: 'dataSubmit',
    nameJson: 'jsonDataSubmit',
  },
  {
    code: 3,
    id: 3,
    name: 'Confirm',
    nameVN: 'Xác nhận',
    nameData: 'dataConfirm',
    nameJson: 'jsonDataConfirm',
  },
  {
    code: 4,
    id: 4,
    name: 'Reject',
    nameVN: 'Từ chối',
    nameData: 'dataReject',
    nameJson: 'jsonDataReject',
  },
  {
    code: 5,
    id: 5,
    name: 'Lock',
    nameVN: 'Khóa',
    nameData: 'dataLock',
    nameJson: 'jsonDataLock',
  },
];
const DATE = new Date();

export const ConfirmAttendantIssue = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { menuitem } = route?.params || {};
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const [indexTab, setIndexTab] = useState(itemTimeSheet[0]);
  const [itemDate, setItemDate] = useState({
    fromDate: '',
    toDate: '',
    currentYear: parseInt(moment().format('YYYY')),
    currentMonth: parseInt(moment().format('MM')),
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    dataSubmit: [],
    dataConfirm: [],
    dataReject: [],
    dataLock: [],
  });
  const tabRef = useRef();
  const monthSheet = useRef();
  const [filter, setFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });
  const config = JSON.parse(kpiinfo.reportItem || '{}');

  const loadAllData = async (fromDate, toDate) => {
    await setLoading(true);
    let groupData = {
      dataSubmit: [],
      dataConfirm: [],
      dataReject: [],
      dataLock: [],
    };
    let jsonData = {
      jsonDataSubmit: '',
      jsonDataConfirm: '',
      jsonDataReject: '',
      jsonDataLock: '',
    };
    await itemTimeSheet.map(async it => {
      jsonData[it.nameJson] = JSON.stringify({
        pageType: kpiinfo.id,
        fromDate: fromDate || moment().format('YYYYMM01'),
        toDate: toDate || moment().format('YYYYMMDD'),
        statusId: it.code,
      });
    });

    const listData = [
      getDataSuggestTimeSheet(jsonData.jsonDataSubmit, 'dataSubmit', 2),
      getDataSuggestTimeSheet(jsonData.jsonDataConfirm, 'dataConfirm', 3),
      getDataSuggestTimeSheet(jsonData.jsonDataReject, 'dataReject', 4),
      getDataSuggestTimeSheet(jsonData.jsonDataLock, 'dataLock', 5),
    ];
    await Promise.all(listData)
      .then(async datas => {
        await datas.map(async res => {
          if (res.statusId === 200) {
            const { arr } = groupDataByKey({
              arr: res.data,
              key: 'employeeId',
            });
            groupData[res.nameData] =
              res.code > 2
                ? filterData(arr).length > 0
                  ? filterData(arr)
                  : []
                : arr;
          } else {
            MessageInfo(res.messager);
          }
        });
      })
      .catch(error => {
        console.log('error');
      });
    await setData(groupData);
    await setLoading(false);
    // await setData({ dataDefault: dataDefault, dataSubmit: dataSubmit, dataConfirm: dataConfirm, dataReject: dataReject, dataLock: dataLock })
  };

  const loadAllDataNew = async (fromDate, toDate) => {
    await setLoading(true);
    let dataGroup = {
      dataDefault: [],
      dataSubmit: [],
      dataConfirm: [],
      dataReject: [],
      dataLock: [],
    };
    const jsonFilter = {
      reportId: kpiinfo.id,
      pageType: kpiinfo.id,
      fromDate: fromDate || moment().format('YYYYMM01'),
      toDate: toDate || moment().format('YYYYMMDD'),
      statusId: 1,
    };

    await REPORT.GetDataReportByShop_RealTime(jsonFilter, async mData => {
      const dataDefault = JSON.parse(mData[0].dataDefault || '[]');
      const dataSubmit = JSON.parse(mData[0].dataSubmit || '[]');
      const dataConfirm = JSON.parse(mData[0].dataConfirm || '[]');
      const dataReject = JSON.parse(mData[0].dataReject || '[]');
      const dataLock = JSON.parse(mData[0].dataLock || '[]');
      dataGroup = {
        dataDefault: groupData(dataDefault, 'dataDefault'),
        dataSubmit: groupData(dataSubmit, 'dataSubmit'),
        dataConfirm: groupData(dataConfirm, 'dataConfirm'),
        dataReject: groupData(dataReject, 'dataReject'),
        dataLock: groupData(dataLock, 'dataLock'),
      };
      setData(dataGroup);
    });

    await setLoading(false);
  };

  const groupData = useCallback((data, tabType) => {
    let dataGroup = [];
    const { arr } = groupDataByKey({
      arr: data,
      key: 'employeeId',
    });
    dataGroup =
      tabType !== 'dataDefault' && tabType !== 'dataSubmit'
        ? filterData(arr).length > 0
          ? filterData(arr)
          : []
        : arr;
    return dataGroup;
  }, []);

  const filterData = data => {
    let dataFilter = [];
    data.map(item => {
      if (item.isParent) {
        let dataByEmployee = [];
        data.map(it => {
          if (it.employeeId === item.employeeId) {
            dataByEmployee.push(it);
          }
        });
        dataFilter.push({
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          dataByEmployee: dataByEmployee,
          totalRow: data.length,
        });
      }
    });
    return dataFilter;
  };

  const loadData = async (fromDate, toDate, itemTab, itemTabUpdate) => {
    await setLoading(true);
    let jsonTab = JSON.stringify({
      pageType: kpiinfo.id,
      fromDate: fromDate || moment().format('YYYYMM01'),
      toDate: toDate || moment().format('YYYYMMDD'),
      statusId: itemTab.code,
    });
    let jsonTabUpdate = JSON.stringify({
      pageType: kpiinfo.id,
      fromDate: fromDate || moment().format('YYYYMM01'),
      toDate: toDate || moment().format('YYYYMMDD'),
      statusId: itemTabUpdate.code,
    });
    let dataTab = [];
    let dataTabUpdate = [];
    const listData = [
      getDataSuggestTimeSheet(jsonTab, itemTab.nameData, itemTab.code),
      getDataSuggestTimeSheet(
        jsonTabUpdate,
        itemTabUpdate.nameData,
        itemTabUpdate.code,
      ),
    ];
    await Promise.all(listData)
      .then(async datas => {
        await datas.map(async res => {
          if (res.statusId === 200) {
            const { arr } = groupDataByKey({
              arr: res.data,
              key: 'employeeId',
            });
            if (res.code == itemTab.code) {
              dataTab =
                res.code > 2
                  ? filterData(arr).length > 0
                    ? filterData(arr)
                    : []
                  : arr;
            } else {
              dataTabUpdate =
                res.code > 2
                  ? filterData(arr).length > 0
                    ? filterData(arr)
                    : []
                  : arr;
            }
          } else {
            MessageInfo(res.messager);
          }
        });
      })
      .catch(error => {
        console.log('error');
      });
    await setData({
      ...data,
      [itemTab.nameData]: dataTab,
      [itemTabUpdate.nameData]: dataTabUpdate,
    });
    await setLoading(false);

    // await setLoading(true)
    // let arrData = []
    // let json = JSON.stringify({ "fromDate": fromDate || moment().format("YYYYMM01"), "toDate": toDate || moment().format("YYYYMMDD"), "statusId": item?.code || 2 })
    // const res = await getDataSuggestTimeSheet(json, item ? item.nameData : 'dataSubmit', item?.code || 2 )
    // if (res.statusId === 200) {
    //     const { arr } = groupDataByKey({
    //         arr: res.data,
    //         key: "employeeId"
    //     })
    //     arrData = (res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr)
    //     // res.code > 2 ? (setData({ ...data, [item.nameData]: res.code > 2 ? (filterData(arr).length > 0 ? filterData(arr) : []) : arr })) : (setData({ ...data, dataSubmit: arr }))
    // } else {
    //     MessageInfo(res.messager)
    // }
    // await setData({ ...data, [item ? item.nameData : 'dataSubmit' ]: arrData })
    // await setLoading(false)
  };

  useEffect(() => {
    // loadAllData()
    loadAllDataNew();
    return () => false;
  }, []);

  const handleSelectTab = (item, index) => {
    setIndexTab(item);
    tabRef.current.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };

  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handleSelectTab(item, index);
    };
    return (
      <TouchableOpacity
        key={`fa${index}2lla`}
        onPress={onPress}
        style={{
          minWidth: 50,
          padding: 8,
          borderRadius: 40,
          backgroundColor:
            indexTab.code == item.code ? appcolor.primary : appcolor.light,
          marginRight: item.code == 5 ? 20 : 5,
          marginHorizontal: 5,
        }}
      >
        <Text
          style={{
            color: indexTab.code == item.code ? appcolor.white : appcolor.dark,
            fontWeight: '600',
            fontSize: 16,
          }}
        >
          {item.nameVN}
        </Text>
        {(data[item.nameData][0]?.totalRow > 0 ||
          data[item.nameData].length > 0) && (
            <Badge
              value={
                item.code > 2
                  ? data[item.nameData][0]?.totalRow || 0
                  : data[item.nameData].length
              }
              status={'warning'}
              containerStyle={{ position: 'absolute', top: -5, right: -5 }}
            />
          )}
      </TouchableOpacity>
    );
  };

  const onSelectYear = searchInfo => {
    setFilter({ ...filter, ...searchInfo });
  };

  const handleCloseMonth = async () => {
    let coverMonth =
      filter.month < 10
        ? '0' + filter.month.toString()
        : filter.month.toString();
    let coverYear = filter.year.toString();
    let coverDay = new Date(coverYear, coverMonth, 0).getDate().toString();
    setItemDate({
      ...itemDate,
      fromDate: `${coverYear}${coverMonth}01`,
      toDate: `${coverYear}${coverMonth}${coverDay}`,
      currentMonth: filter.month,
    });
    // loadAllData(`${coverYear}${coverMonth}01`, `${coverYear}${coverMonth}${coverDay}`)
    loadAllDataNew(
      `${coverYear}${coverMonth}01`,
      `${coverYear}${coverMonth}${coverDay}`,
    );
  };

  const handlerSubmitAll = async type => {
    try {
      if (indexTab.code !== 2) return;
      const indexTabUpdate = itemTimeSheet.find(
        it => it.code == (type == 3 ? indexTab.code + 1 : indexTab.code + 2),
      );
      MessageAction(
        'Bạn chắc chắn muốn ' +
        (type == 3 ? 'xác nhận' : 'từ chối') +
        ` tất cả (${data.dataSubmit.length}) đề xuất của nhân viên?`,
        async () => {
          setLoading(true);
          try {
            let ok = 0,
              fail = 0;
            for (const it of data.dataSubmit) {
              const isSkipReason =
                Number(it.isCountExplain) === 1 ||
                Number(it.isCountExplain) === 2;
              const notify = `Người quản lí ${userinfo.groupType || ''} đã ${type == 3 ? 'đồng ý' : 'từ chối'
                } đề xuất chấm công ngày ${it.workDate}${type === 3 || isSkipReason ? '' : ' với lí do : '
                }`;
              const payload = JSON.stringify({
                reportId: kpiinfo.id,
                employeeId: it.employeeId,
                workDate: it.workDate,
                tabId: it.tabId,
                statusId: type,
                note: type === 3 ? '' : '',
                notify,
              });
              const res = await UpdateSuggestTimeSheet(payload);
              if (res?.statusId === 200) ok++;
              else fail++;
            }
            await loadAllDataNew(itemDate.fromDate, itemDate.toDate);
            if (fail === 0) {
              ToastSuccess(`Đã xử lý ${ok}/${data.dataSubmit.length} bản ghi.`);
            } else {
              ToastError(`Thành công ${ok}, thất bại ${fail}.`);
            }
          } catch (err) {
            ToastError('Có lỗi khi xử lý xác nhận tất cả.');
          } finally {
            setLoading(false);
          }
        },
      );
    } catch (e) {
      ToastError('Có lỗi khi xử lý xác nhận tất cả.');
    }
  };

  const showMonth = async () => {
    await monthSheet.current.show();
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.bluelight }}>
      <HeaderCustom
        rightFunc={() => showMonth()}
        iconRight="calendar"
        // titleRight={removeList?.length + ""}
        leftFunc={() => navigation.goBack()}
        title={menuitem?.menuNameVN || 'Xác nhận chấm công'}
      />
      <View
        style={{
          height: '100%',
          backgroundColor: appcolor.surface,
          width: deviceWidth,
        }}
      >
        <View style={{ padding: 5, borderRadius: 40, margin: 5 }}>
          <FlatList
            ref={tabRef}
            data={itemTimeSheet}
            contentContainerStyle={{ borderRadius: 40, padding: 5 }}
            style={{ borderRadius: 40 }}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          {
            loading && (
              <LoadingView isLoading={loading} title="Đang lấy dữ liệu" />
            )
            // <View style={{ width: '100%', position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
            //     <Progress.CircleSnail thickness={1} size={65} indeterminate={true} />
            //     <Text style={{ color: '#007AFF' }}>Đang lấy dữ liệu...</Text>
            // </View>
          }
          {!loading && indexTab.code < 3 && (
            <View style={{ flex: 1 }}>
              {config.isConfirmAll && data.dataSubmit.length > 0 && (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handlerSubmitAll(3)}
                    style={{
                      padding: 8,
                      borderRadius: 10,
                      backgroundColor: appcolor.primary,
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: appcolor.light,
                        fontWeight: '500',
                        fontSize: 12,
                      }}
                    >
                      Xác nhận tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              <FlatList
                key={'listTimeSheet'}
                data={
                  indexTab.code == 2
                    ? data.dataSubmit
                    : indexTab.code == 3
                      ? data.dataConfirm
                      : indexTab.code == 4
                        ? data.dataReject
                        : data.dataLock
                }
                keyExtractor={(_, index) => index.toString()}
                style={{
                  padding: 5,
                  flex: 1,
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40,
                }}
                renderItem={({ item, index }) => (
                  <RenderItemTimeSheet
                    item={item}
                    index={index}
                    appcolor={appcolor}
                    indexTab={indexTab}
                    itemDate={itemDate}
                    loadAllDataNew={loadAllDataNew}
                    data={data}
                  />
                )}
                ListFooterComponent={
                  <View
                    style={{ height: deviceHeight / 2, width: deviceWidth }}
                  />
                }
                showsHorizontalScrollIndicator={false}
                refreshing={loading}
                onRefresh={() =>
                  //loadAllData(itemDate.fromDate, itemDate.toDate)
                  loadAllDataNew(itemDate.fromDate, itemDate.toDate)
                }
              />
            </View>
          )}
          {!loading && indexTab.code > 2 && (
            <FlatList
              key={`listTimeSheet_${indexTab.code}`}
              data={
                indexTab.code == 3
                  ? data.dataConfirm
                  : indexTab.code == 4
                    ? data.dataReject
                    : data.dataLock
              }
              keyExtractor={(_, index) => index.toString()}
              style={{
                padding: 5,
                flex: 1,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              }}
              renderItem={({ item, index }) => (
                <ViewTimeSheet
                  item={item}
                  index={index}
                  appcolor={appcolor}
                  indexTab={indexTab}
                  itemDate={itemDate}
                  loadAllDataNew={loadAllDataNew}
                  data={data}
                />
              )}
              ListFooterComponent={
                <View
                  style={{ height: deviceHeight / 2, width: deviceWidth }}
                />
              }
              showsHorizontalScrollIndicator={false}
              refreshing={loading}
              onRefresh={() =>
                //loadAllData(itemDate.fromDate, itemDate.toDate)
                loadAllDataNew(itemDate.fromDate, itemDate.toDate)
              }
            />
          )}
        </View>
      </View>

      <ActionSheet
        ref={monthSheet}
        containerStyle={{
          backgroundColor: appcolor.surface,
          borderWidth: 0.2,
          borderColor: appcolor.dark,
          paddingBottom: insets.bottom,
        }}
        onClose={() => handleCloseMonth()}
        initialOffsetFromBottom={1}
        gestureEnabled={true}
        indicatorColor={'#f0f0f0'}
        defaultOverlayOpacity={0.5}
      >
        <View
          style={{ width: deviceWidth, minHeight: '50%', paddingBottom: 30 }}
        >
          <YearMonthSelected
            option={filter}
            onYearMonth={search => onSelectYear(search)}
            numMonth={4}
          />
        </View>
      </ActionSheet>
    </View>
  );
};

const ViewTimeSheet = ({
  item,
  index,
  appcolor,
  indexTab,
  loadAllDataNew,
  itemDate,
  data,
}) => {
  const [isShowTimeSheet, setShowTimeSheet] = useState(false);
  const [itemTab, setItemTab] = useState(indexTab);
  if (indexTab.code !== itemTab.code) {
    setShowTimeSheet(false);
    setItemTab(indexTab);
  }
  return (
    <View key={`${indexTab.code}`}>
      <TouchableOpacity
        onPress={() => (indexTab.code > 2 ? setShowTimeSheet(e => !e) : null)}
        style={{
          padding: 8,
          marginTop: index !== 0 ? 20 : 5,
          margin: 5,
          borderRadius: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <SpiralIcon
            size={20}
            color={appcolor.dark}
            style={{ paddingRight: 20 }}
            name={isShowTimeSheet ? 'chevron-down' : 'chevron-right'}
            type="font-awesome-5"
          />
          <Text
            style={{ color: appcolor.dark, fontWeight: '900', fontSize: 16 }}
          >{`${item.employeeName}`}</Text>
        </View>
        <Text style={{ color: appcolor.dark, fontWeight: '900', fontSize: 18 }}>
          {item.dataByEmployee.length}
        </Text>
      </TouchableOpacity>
      {isShowTimeSheet && (
        <FlatList
          key={`listItem_${indexTab.code}`}
          data={item.dataByEmployee}
          keyExtractor={(_, index) => index.toString()}
          style={{
            padding: 5,
            flex: 1,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}
          renderItem={({ item, index }) => (
            <RenderItemTimeSheet
              key={`${indexTab.code}_TimeSheet_${item.workDate}`}
              item={item}
              index={index}
              appcolor={appcolor}
              indexTab={indexTab}
              itemDate={itemDate}
              loadAllDataNew={loadAllDataNew}
              data={data}
            />
          )}
          ListFooterComponent={
            index + 1 == item.totalRow ? (
              <View style={{ height: deviceHeight / 2, width: deviceWidth }} />
            ) : (
              <View />
            )
          }
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const RenderItemTimeSheet = ({
  item,
  index,
  indexTab,
  loadAllDataNew,
  itemDate,
  data,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const [note, setNote] = useState('');
  const shopSheet = useRef();
  const [isShowShop, setShowShop] = useState(false);
  // const shopDetail = JSON.parse(item.shopDetail || '[]')
  const shopDetail = Array.isArray(item.shopDetail)
    ? item.shopDetail
    : JSON.parse(item.shopDetail ?? '[]');
  const [listPhotoItem, setListPhotoItem] = useState([]);
  const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const config = JSON.parse(kpiinfo.reportItem || '{}');
  const [configCheckTimeStore, setConfigCheckTimeStore] = useState({
    isCheckTimeStore: item.isCheckTimeStore || 0,
    isAddNewStore: item.isAddNewStore || 0,
    isEditShopEmpty: item.isEditShopEmpty || 0,
  });
  const isSkipReason =
    Number(item.isCountExplain) === 1 || Number(item.isCountExplain) === 2;

  const loadListPhoto = () => {
    const listEvident = JSON.parse(item.evidence || '[]');
    setListPhotoItem(listEvident);
  };
  useEffect(() => {
    if (JSON.parse(item.evidence || '[]').length > 0) {
      loadListPhoto();
    }
    return () => false;
  }, []);

  const renderItemShop = (item, index) => {
    const listEvidence = item.Evidence
      ? Array.isArray(item.Evidence)
        ? item.Evidence
        : JSON.parse(item.Evidence)
      : [];
    return (
      <View
        key={`${item.workDate}_${index}`}
        style={{
          width: '100%',
          padding: 8,
          backgroundColor: appcolor.light,
          marginVertical: 5,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 16,
            padding: 5,
            color: appcolor.dark,
          }}
        >
          {item.ShopName}
        </Text>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              CheckIn
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              {item.TimeCI}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              CheckOut
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              {item.TimeCO}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              Tổng thời gian
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              {item.TotalTime}
            </Text>
          </View>
        </View>
        {(item.ShopId > 0 || configCheckTimeStore.isEditShopEmpty == 1) &&
          configCheckTimeStore.isCheckTimeStore == 1 && (
            <View
              style={{ justifyContent: 'space-between', flexDirection: 'row' }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  CheckIn
                </Text>
                <FormGroup
                  value={item.TimeCI_Update || ''}
                  inputStyle={{
                    padding: 0,
                    margin: 0,
                    height: 28,
                    textAlign: 'center',
                  }}
                  containerStyle={{
                    margin: 4,
                    marginRight: 5,
                    borderWidth: 1,
                    marginBottom: 2,
                  }}
                  editable={false}
                  placeholder={'Nhập CI'}
                  useClearAndroid={false}
                  keyboardType="number-pad"
                  onEndEditing={() => handlerEndEditTime(item)}
                  handleChangeForm={value => handlerEditTime(value, item, 'CI')}
                  multiline
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  CheckOut
                </Text>
                <FormGroup
                  value={item.TimeCO_Update || ''}
                  inputStyle={{
                    padding: 0,
                    margin: 0,
                    height: 28,
                    textAlign: 'center',
                  }}
                  containerStyle={{
                    margin: 4,
                    marginRight: 5,
                    borderWidth: 1,
                    marginBottom: 2,
                  }}
                  editable={false}
                  placeholder={'Nhập CO'}
                  useClearAndroid={false}
                  keyboardType="number-pad"
                  onEndEditing={() => handlerEndEditTime(item)}
                  handleChangeForm={value => handlerEditTime(value, item, 'CO')}
                  multiline
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  Tổng thời gian
                </Text>
                <FormGroup
                  value={item.TotalTime_Update || ''}
                  inputStyle={{
                    padding: 0,
                    margin: 0,
                    height: 28,
                    textAlign: 'center',
                  }}
                  containerStyle={{
                    margin: 4,
                    marginRight: 5,
                    borderWidth: 1,
                    marginBottom: 2,
                  }}
                  editable={false}
                  placeholder={'Tổng thời gian'}
                  useClearAndroid={false}
                  onEndEditing={() => handlerEndEditTime(item)}
                  handleChangeForm={value => handlerEditTime(value, item, 'CO')}
                  multiline
                />
              </View>
            </View>
          )}
        {listEvidence?.length > 0 &&
          configCheckTimeStore.isCheckTimeStore == 1 && (
            <PhotoInput
              _guid={item.guid}
              itemInput={item}
              listPhoto={indexTab != 1 ? listEvidence : null}
              indexTab={indexTab}
            />
          )}
      </View>
    );
  };

  const handleSubmit = async type => {
    if (type !== 3) {
      if (note === '') {
        ToastError(
          'Nhập ghi chú khi ' +
          (type == 3 ? 'đồng ý' : 'từ chối') +
          ', ngày ' +
          item.workDate +
          '!!!',
        );
        return;
      } else if (note.replace(/ /g, '').length < 5) {
        ToastError(
          'Nhập ghi chú ít nhất 5 kí tự, ngày ' + item.workDate + '!!!',
        );
        return;
      }
    }
    let notify =
      'Người quản lí đã ' +
      (type == 3 ? 'đồng ý' : 'từ chối') +
      ' đề xuất chấm công ngày ' +
      item.workDate +
      (type == 3 || isSkipReason ? '' : ' với lí do : ' + note);
    let dataSubmit = JSON.stringify({
      reportId: kpiinfo.id,
      employeeId: item.employeeId,
      workDate: item.workDate,
      tabId: item.tabId,
      statusId: type,
      note: note,
      notify: notify,
    });
    let indexTabUpdate = itemTimeSheet.find(
      it => it.code == (type == 3 ? indexTab.code + 1 : indexTab.code + 2),
    );
    MessageAction(
      'Bạn chắc chắn muốn ' +
      (type == 3 ? 'đồng ý' : 'từ chối') +
      ' đề xuất của nhân viên : ' +
      item.employeeName +
      ' ngày : ' +
      item.workDate +
      '?',
      async () => {
        const result = await UpdateSuggestTimeSheet(dataSubmit);
        if (result.statusId === 200) {
          await loadAllDataNew(itemDate.fromDate, itemDate.toDate);
          await ToastSuccess(result?.messager);
        } else {
          ToastError(result?.messager);
        }
      },
    );
  };

  const openSheet = type => {
    if (type === 'SHOW_SHOP') {
      shopSheet.current.show();
      setShowShop(true);
    }
  };

  const showItemImage = async indexImage => {
    await setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage });
    await setVisible(true);
  };
  if (loading) return <LoadingView isLoading={loading} />;
  return (
    <View key={'ConfirmSheet_' + item.workDate}>
      {item.isParent && indexTab.code < 3 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View
            style={{
              padding: 8,
              marginTop: index !== 0 ? 20 : 5,
              margin: 5,
              borderRadius: 10,
              flexDirection: 'row',
            }}
          >
            <Text
              style={{ color: appcolor.dark, fontWeight: '900', fontSize: 16 }}
            >{`${item.employeeName}`}</Text>
          </View>
        </View>
      )}
      <View
        style={{
          flex: 1,
          padding: 5,
          backgroundColor: appcolor.light,
          margin: 5,
          borderRadius: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 8,
          }}
        >
          <Text
            style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}
          >
            {item.workDate}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 14,
                paddingRight: 5,
                color: appcolor.dark,
              }}
            >
              {moment(item.endTime).calendar()}{' '}
            </Text>
            <SpiralIcon
              size={17}
              color={appcolor.dark}
              name={'stopwatch'}
              type="font-awesome-5"
            />
          </View>
        </View>
        <View
          onPress={() => setShowTime(e => !e)}
          style={{ justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View
              onPress={() => setShowTime(e => !e)}
              style={{ flex: 1, padding: 5, flexDirection: 'row' }}
            >
              <Text style={{ fontSize: 12, color: appcolor.dark }}>
                Tổng thời gian :{' '}
              </Text>
              <Badge value={item.totalActual} status={'error'} />
            </View>
            <View style={{ flex: 1, padding: 5 }}>
              <Text style={{ fontSize: 12, color: appcolor.dark }}>
                Tại cửa hàng : {item.timeInStore}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, padding: 5 }}>
              <Text style={{ fontSize: 12, color: appcolor.dark }}>
                Thời gian bắt đầu : {item.timeCI}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 5 }}>
              <Text style={{ fontSize: 12, color: appcolor.dark }}>
                Thời gian kết thúc : {item.timeCO}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => openSheet('SHOW_SHOP')}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 10,
            margin: 5,
            borderWidth: 0.2,
            borderColor: appcolor.dark,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row' }}>
              <SpiralIcon
                size={18}
                color={appcolor.dark}
                style={{ height: 20, width: 20 }}
                name={isShowShop ? 'chevron-down' : 'chevron-right'}
                type="font-awesome-5"
              />
              <Text style={{ color: appcolor.dark, paddingLeft: 10 }}>
                Cửa hàng đi trong ngày{' '}
              </Text>
            </View>
            <Text style={{ color: appcolor.dark }}>
              {item.totalShopActual}{' '}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: appcolor.surface,
            padding: 5,
            margin: 5,
            borderRadius: 8,
            height: 35,
            paddingLeft: 12,
          }}
        >
          <Text
            style={{ color: appcolor.dark, fontWeight: '500', fontSize: 14 }}
          >
            {item.shiftCode || `${indexTab.code == 1 ? 'Chọn ca' : ''}`}
          </Text>
        </View>
        <View>
          {!isSkipReason && item.subNote && (
            <FormGroup
              value={`Lí do : ${item.subNote || ''}`}
              containerStyle={{
                marginLeft: 5,
                padding: 5,
                marginBottom: 5,
                marginRight: 5,
                borderWidth: 0.2,
              }}
              editable={false}
              multiline
            />
          )}
          {item.submitNote != undefined &&
            item.submitNote != null &&
            item.submitNote != '' && (
              <FormGroup
                value={`${'Ghi chú : '}${item.submitNote || ''}`}
                containerStyle={{
                  marginLeft: 5,
                  marginRight: 5,
                  borderWidth: 0.2,
                  marginBottom: 5,
                  padding: 5,
                }}
                editable={false}
                multiline
              />
            )}
          {item.subNoteLevel1 != undefined &&
            item.subNoteLevel1 != null &&
            item.subNoteLevel1 != '' && (
              <FormGroup
                value={`${item.titleNoteLevel1
                    ? item.titleNoteLevel1
                    : 'Quản lí ghi chú : '
                  }${item.subNoteLevel1 || ''}`}
                containerStyle={{
                  marginLeft: 5,
                  marginRight: 5,
                  borderWidth: 0.2,
                  marginBottom: 5,
                  padding: 5,
                }}
                editable={false}
                multiline
              />
            )}
          {((indexTab.code != 5 &&
            indexTab.code != 2 &&
            item.confirmNote != '' &&
            item.confirmNote) ||
            indexTab.code == 2) && (
              <FormGroup
                value={
                  indexTab.code == 2
                    ? note
                    : `${item.titleNoteLevel2
                      ? item.titleNoteLevel2
                      : 'Quản lí ghi chú : '
                    }${item.confirmNote || ''}`
                }
                containerStyle={{
                  marginLeft: 5,
                  marginRight: 5,
                  borderWidth: 0.8,
                  marginBottom: 0,
                  padding: 5,
                  color: appcolor.dark,
                }}
                editable={indexTab.code == 2 ? true : false}
                placeholder={'Nhập ghi chú'}
                placeholderColor={appcolor.placeholderText}
                handleChangeForm={text => setNote(text)}
              />
            )}
        </View>
        <ViewPhotoEvidence
          key={`photoById_${item.tabId}_${item.attendantId}`}
          listPhotoItem={listPhotoItem}
          showItemImage={showItemImage}
          itemMain={item}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {indexTab.code < 3 ? (
            <View style={{ flexDirection: 'row', padding: 5 }}>
              <SpiralIcon
                size={17}
                name={'clock'}
                color={appcolor.dark}
                type="font-awesome-5"
              />
              <Text style={{ paddingLeft: 5, color: appcolor.dark }}>
                Đếm ngược :{' '}
              </Text>
              <CountTime item={item} />
            </View>
          ) : (
            <View>
              {indexTab.code != 5 && (
                <View style={{ flexDirection: 'row', padding: 5 }}>
                  <SpiralIcon
                    size={17}
                    name={'clock'}
                    color={appcolor.dark}
                    type="font-awesome-5"
                  />
                  <Text
                    style={{
                      paddingLeft: 5,
                      color: appcolor.dark,
                      fontSize: 12,
                    }}
                  >
                    {' '}
                    Thời gian {indexTab.nameVN} :{' '}
                    {moment(item.confirmTime).calendar()}
                  </Text>
                </View>
              )}
              {indexTab.code != 5 && (
                <View style={{ flexDirection: 'row', padding: 5 }}>
                  <SpiralIcon
                    size={17}
                    name={'user'}
                    color={appcolor.dark}
                    type="font-awesome-5"
                  />
                  <Text
                    style={{
                      paddingLeft: 5,
                      color: appcolor.dark,
                      fontSize: 12,
                    }}
                  >
                    {indexTab.nameVN} bởi : {item.confirmBy}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={{ flexDirection: 'row' }}>
            {indexTab.code == 2 && (
              <TouchableOpacity
                onPress={() => handleSubmit(3)}
                style={{
                  minWidth: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: appcolor.grayLight,
                }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  xác nhận
                </Text>
              </TouchableOpacity>
            )}
            {indexTab.code == 2 && (
              <TouchableOpacity
                onPress={() => handleSubmit(4)}
                style={{
                  minWidth: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: appcolor.grayLight,
                  marginLeft: 5,
                }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: 12,
                    color: appcolor.dark,
                  }}
                >
                  Từ chối
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ActionSheet
          ref={shopSheet}
          containerStyle={{
            backgroundColor: appcolor.surface,
            borderWidth: 0.2,
            borderColor: appcolor.dark,
            paddingBottom: insets.bottom,
          }}
          onClose={() => setShowShop(e => !e)}
          initialOffsetFromBottom={1}
          gestureEnabled={false}
          indicatorColor={'#f0f0f0'}
          defaultOverlayOpacity={0.5}
          nestedScrollEnabled={true}
        >
          <View
            style={{
              padding: 5,
              paddingBottom: 30,
              width: deviceWidth,
              maxHeight: deviceHeight / 1.5,
              minHeight: deviceHeight / 2.5,
            }}
          >
            <ScrollView>
              {shopDetail.length > 0 &&
                shopDetail.map((it, index) => {
                  return renderItemShop(it, index);
                })}
            </ScrollView>
          </View>
        </ActionSheet>
        <Modal id={'imageSheet'} visible={visible} containerStyle={{ flex: 1 }}>
          <MultipleShowImage
            key={'ShowItemImage'}
            listItem={dataPhoto.listPhoto}
            closeShowImage={() => setVisible(false)}
            indexItem={dataPhoto.indexImage}
          />
        </Modal>
      </View>
    </View>
  );
};
const ViewPhotoEvidence = ({ listPhotoItem, showItemImage, itemMain }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const handleSelectImage = async indexImage => {
    showItemImage(indexImage);
  };

  const RenderItemPhoto = ({ item, index }) => {
    const onSelectImage = () => {
      handleSelectImage(index);
    };
    // console.log('item.photoPath', item.photoPath !== null ? (item.photoPath.indexOf('file://') > -1 || item.photoPath.indexOf('https://') > -1 ? item.photoPath : URLDEFAULT + item.photoPath) : null)
    return (
      <TouchableOpacity
        key={itemMain.workDate + index}
        style={{
          borderRadius: 12,
          width: deviceWidth / 5,
          height: deviceWidth / 5,
          backgroundColor: appcolor.surface,
          margin: 5,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => onSelectImage()}
      >
        <CacheImage
          resizeMode={'cover'}
          containerStyle={{ borderRadius: 12 }}
          source={{
            uri:
              item.photoPath !== null
                ? item.photoPath.indexOf('file://') > -1 ||
                  item.photoPath.indexOf('https://') > -1
                  ? item.photoPath
                  : URLDEFAULT + item.photoPath
                : null,
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      key={'Photo_' + itemMain.workDate}
      style={{ flexDirection: 'column', width: '100%' }}
    >
      <View
        style={{
          padding: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: appcolor.dark, padding: 5 }}>{'Hình ảnh'}</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {listPhotoItem.length > 0 && (
          <FlatList
            horizontal
            key={'listPhoto'}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            data={listPhotoItem}
            renderItem={({ item, index }) => (
              <RenderItemPhoto
                item={item}
                index={index}
                listPhotoItem={listPhotoItem}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};
const CountTime = ({ item }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isStop, setStop] = useState(false);
  const startTimeRef = useRef();
  const calculateTimeLeft = () => {
    const newTime = new Date();
    const difference = moment(item.endTime, 'YYYY-MM-DD HH:mm:ss').diff(
      moment(newTime, 'YYYY-MM-DD HH:mm:ss'),
    );
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    if (difference < 0) {
      setStop(true);
    }
    return timeLeft;
  };

  const countDown = () => {
    if (!isStop) {
      setRemainingTime(calculateTimeLeft());
      startTimeRef.current = requestAnimationFrame(countDown);
    }
  };

  useEffect(() => {
    startTimeRef.current = requestAnimationFrame(countDown);
    return () => cancelAnimationFrame(startTimeRef.current);
  });

  useEffect(() => {
    setRemainingTime(calculateTimeLeft());
  }, []);
  return !isStop ? (
    <Text style={{ color: appcolor.dark }}>
      {remainingTime.days > 0 ? `${remainingTime.days} ngày ` : ''}
      {remainingTime.hours < 10 ? '0' : ''}
      {remainingTime.hours}:{remainingTime.minutes < 10 ? '0' : ''}
      {remainingTime.minutes}:{remainingTime.seconds < 10 ? '0' : ''}
      {remainingTime.seconds}
    </Text>
  ) : (
    <Text style={{ color: appcolor.red }}>đã hết hạn</Text>
  );
};
