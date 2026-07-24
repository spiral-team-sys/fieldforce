import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GetHistoryConfirm } from '../../../../Controller/PlanController';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@rneui/themed';
import { groupDataByKey, removeVietnameseTones } from '../../../../Core/Helper';
import FormGroup from '../../../../Content/FormGroup';
import { deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { LoadingView } from '../../../../Control/ItemLoading/index';
import { useSelector } from 'react-redux';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { deviceHeight, minWidthTab } from '../../../../Core/Utility';
import { YearMonthSelected } from '../../../../Control/YearMonthSelected';
import moment from 'moment';
import ItemShift from './Items/ItemShift';
import ItemLate from './Items/ItemLate';
import ItemEarlier from './Items/ItemEarlier';
import CustomListView from '../../../../Control/Custom/CustomListView';
import _ from 'lodash';
import CustomTab from '../../../../Control/Custom/CustomTab';
import ConfirmHeader from './ConfirmHeader';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const TYPE_SHIFT = 'SHIFT';
const TYPE_OFF = 'OFF';
const TYPE_LATE = 'LATE';
const TYPE_EARLIER = 'EARLIER';
const DATE = new Date();

const HistoryConfirm = ({ navigation, route }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ dataConfirm: [], dataMain: [] });
  const [dataEmployee, setDataEmployee] = useState([]);
  const [menuSelected, setMenuSelected] = useState({
    type: 'SHIFT',
    employeeId: '',
    month: '',
    year: '',
  });
  const [dataModal, setDataModal] = useState({ visibleModal: false, list: [] });
  const [showYear, setShowYear] = useState(false);
  const [showEmp, setShowEmp] = useState(false);
  const [filter, setFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        mainContainer: {
          width: '100%',
          height: '100%',
          backgroundColor: appcolor.light,
        },
        filterStyle: {
          width: '95%',
          fontSize: 10,
          alignSelf: 'center',
          borderWidth: 0.5,
          padding: 3,
        },
        employeeContainer: {
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          marginVertical: 4,
          paddingHorizontal: 12,
        },
        itemContainer: {
          flex: 1,
          marginHorizontal: 6,
          marginVertical: 4,
          padding: 10,
          backgroundColor: appcolor.light,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: appcolor.surface,
        },
        textItem: {
          fontWeight: '500',
          fontSize: 12,
          color: appcolor.dark,
          marginTop: 2,
        },
        shopName: {
          flex: 1,
          fontWeight: fontWeightBold,
          fontSize: 14,
          color: appcolor.dark,
          marginStart: 6,
        },
        addressText: {
          fontSize: 12,
          color: appcolor.greylight,
          marginTop: 3,
          marginBottom: 2,
        },
        shiftText: { fontSize: 12, color: appcolor.greylight, marginTop: 2 },
        employeeAvatar: {
          width: 32,
          height: 32,
          backgroundColor: appcolor.primary,
          borderRadius: 28,
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        employeeName: {
          color: appcolor.dark,
          fontWeight: fontWeightBold,
          fontSize: 15,
        },
        dateBadge: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 20,
          backgroundColor: appcolor.tomato,
        },
        dateBadgeText: {
          fontSize: 11,
          fontWeight: fontWeightBold,
          color: appcolor.light,
        },
        monthButton: { margin: 8, marginHorizontal: 14 },
        monthButtonInner: {
          backgroundColor: appcolor.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 9,
          paddingHorizontal: 16,
          borderRadius: 20,
        },
        monthButtonText: {
          color: appcolor.light,
          fontWeight: fontWeightBold,
          fontSize: 13,
          marginLeft: 6,
        },
        sheetHeader: {
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: appcolor.greylight,
        },
        sheetTitle: {
          fontWeight: fontWeightBold,
          fontSize: 14,
          color: appcolor.dark,
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        modalSheet: { flex: 1, backgroundColor: appcolor.light },
      }),
    [appcolor],
  );

  const LoadData = useCallback(
    async (typeConfirm, ChildEmployee, Month, Year) => {
      setMenuSelected({
        type: typeConfirm,
        employeeId: ChildEmployee,
        month: Month,
        year: Year,
      });
      setLoading(true);
      await GetHistoryConfirm(
        typeConfirm,
        ChildEmployee,
        Month,
        Year,
        (mData, mEmployee) => {
          setData({ dataConfirm: mData, dataMain: mData });
          setDataEmployee(mEmployee);
        },
      );
      setLoading(false);
    },
    [],
  );

  const handlerLoadType = useCallback(
    typeConfirm => {
      LoadData(typeConfirm, '', filter.month, filter.year);
    },
    [filter.month, filter.year, LoadData],
  );

  const handlerFilter = useCallback(
    text => {
      if (text) {
        const filtered = dataEmployee.filter(
          e =>
            removeVietnameseTones(e.employeeName)
              .toUpperCase()
              .indexOf(removeVietnameseTones(text).toUpperCase()) > -1,
        );
        setDataModal({ list: filtered, listFilter: filtered });
      } else {
        setDataModal({
          list: dataModal.listFilter,
          listFilter: dataModal.listFilter,
        });
      }
    },
    [dataModal.listFilter],
  );

  const showEmployee = useCallback(() => {
    setDataModal({ list: dataEmployee, listFilter: dataEmployee });
    setShowEmp(true);
  }, [dataEmployee]);

  const clearItemSelect = useCallback(() => {
    setDataModal({ list: [], listFilter: [] });
    LoadData(menuSelected.type, '', filter.month, filter.year);
  }, [menuSelected.type, filter.month, filter.year, LoadData]);

  const handleSelectedChange = useCallback(
    item => {
      setMenuSelected(prev => ({ ...prev, employeeId: item.employeeId }));
      setDataModal(prev => ({
        ...prev,
        list: prev.listFilter.map(i =>
          i.employeeId === item.employeeId
            ? { ...i, isSelect: item.isSelect === 1 ? 0 : 1 }
            : { ...i, isSelect: 0 },
        ),
      }));
      LoadData(menuSelected.type, item.employeeId, filter.month, filter.year);
    },
    [menuSelected.type, filter.month, filter.year, LoadData],
  );

  const onFilterChange = useCallback(searchInfo => {
    setFilter(prev => ({ ...prev, ...searchInfo }));
  }, []);

  const handlerChooseMonth = useCallback(() => {
    setShowYear(false);
    LoadData(
      menuSelected.type,
      menuSelected.employeeId,
      filter.month,
      filter.year,
    );
  }, [
    menuSelected.type,
    menuSelected.employeeId,
    filter.month,
    filter.year,
    LoadData,
  ]);

  const handleRefresh = useCallback(() => {
    LoadData(menuSelected.type, '', filter.month, filter.year);
  }, [menuSelected.type, filter.month, filter.year, LoadData]);

  useEffect(() => {
    LoadData(TYPE_SHIFT, '', filter.month, filter.year);
  }, []);

  const renderTab = item => {
    const { arr } = groupDataByKey({
      arr: JSON.parse(item.tabData),
      key: 'EmployeeId',
      keyLayer2: 'AuditDate',
    });
    return (
      <CustomListView
        data={arr}
        extraData={arr}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        bottomView={{ paddingBottom: deviceHeight / 3 }}
      />
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ flex: 1 }} key={index.toString()}>
        {item.isParent && (
          <View style={styles.employeeContainer}>
            <View style={styles.employeeAvatar}>
              <SpiralIcon
                name="user"
                type="font-awesome"
                size={16}
                color={appcolor.light}
              />
            </View>
            <Text style={styles.employeeName}>{item.EmployeeName}</Text>
          </View>
        )}
        <View style={styles.itemContainer}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <SpiralIcon
              name="store"
              type="font-awesome-5"
              size={14}
              color={appcolor.greylight}
            />
            <Text style={styles.shopName} numberOfLines={2}>
              {item.ShopName}
            </Text>
            {item[`${item.EmployeeId}${item.AuditDate}`] && (
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>
                  {moment(item.AuditDate, 'YYYYMMDD').format('D MMM')}
                </Text>
              </View>
            )}
          </View>
          {item.Address !== undefined && (
            <Text style={styles.addressText}>{item.Address}</Text>
          )}
          <Text style={styles.shiftText}>{item.ShiftName}</Text>
          {(menuSelected.type === TYPE_SHIFT ||
            menuSelected.type === TYPE_OFF) && (
              <ItemShift item={item} styles={styles} appcolor={appcolor} />
            )}
          {menuSelected.type === TYPE_LATE && (
            <ItemLate item={item} styles={styles} appcolor={appcolor} />
          )}
          {menuSelected.type === TYPE_EARLIER && (
            <ItemEarlier item={item} styles={styles} appcolor={appcolor} />
          )}
        </View>
      </View>
    );
  };

  const renderItemEmployee = ({ item, index }) => {
    const isSelected = item.isSelect === 1;
    return (
      <TouchableOpacity
        onPress={() => handleSelectedChange(item, index)}
        style={{
          backgroundColor: isSelected ? appcolor.primary : appcolor.light,
          padding: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: appcolor.greylight,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 36,
              marginEnd: 10,
              backgroundColor:
                item.isData > 0 ? appcolor.dark : appcolor.primary,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ fontWeight: '700', fontSize: 13, color: appcolor.light }}
            >
              {item.isData}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              color: isSelected ? appcolor.light : appcolor.dark,
              fontSize: 14,
            }}
          >
            {item.typeName + ': ' + item.employeeName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}
    >
      <HeaderCustom
        title={route?.params?.titlePage || 'Lịch sử xác nhận LLV'}
        iconRight="search"
        leftFunc={() => navigation.goBack()}
        rightFunc={showEmployee}
      />
      <View style={styles.mainContainer}>
        <TouchableOpacity
          onPress={() => setShowYear(true)}
          style={styles.monthButton}
          activeOpacity={0.8}
        >
          <View style={styles.monthButtonInner}>
            <SpiralIcon
              name="calendar-alt"
              type="font-awesome-5"
              size={13}
              color={appcolor.light}
            />
            <Text style={styles.monthButtonText}>
              {filter.monthname} / {filter.yearname}
            </Text>
          </View>
        </TouchableOpacity>
        <ConfirmHeader
          appcolor={appcolor}
          onSelectItem={handlerLoadType}
          menuSelected={menuSelected.type}
        />
        <LoadingView
          isLoading={loading}
          title="Đang cập nhật dữ liệu"
          styles={{ marginTop: 8 }}
        />
        <CustomTab
          data={data.dataConfirm}
          keyTabName="tabName"
          renderItem={renderTab}
        />
      </View>

      <Modal
        visible={showYear}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYear(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <YearMonthSelected
              option={filter}
              onYearMonth={onFilterChange}
              numMonth={4}
            />
            <TouchableOpacity
              onPress={handlerChooseMonth}
              style={{ borderTopWidth: 0.31, borderTopColor: appcolor.primary }}
            >
              <Text
                style={{
                  padding: 12,
                  textAlign: 'center',
                  color: appcolor.primary,
                  fontWeight: '600',
                }}
              >
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showEmp}
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setShowEmp(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Danh sách nhân viên</Text>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => setShowEmp(false)}
              >
                <SpiralIcon name="close" size={22} color={appcolor.dark} />
              </TouchableOpacity>
            </View>
            <SearchData
              placeholder="Tìm kiếm nhân viên"
              onSearchData={handlerFilter}
            />
            <CustomListView
              data={dataModal.list}
              extraData={dataModal.list}
              renderItem={renderItemEmployee}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};
export default HistoryConfirm;
