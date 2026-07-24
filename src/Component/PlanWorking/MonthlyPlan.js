import React, { useCallback, useRef } from 'react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WorkingPlanAPI } from '../../API/WorkingPlanApi';
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { LoadingView } from '../../Control/ItemLoading/index';
import {
  TODAY,
  alertNotify,
  countDuplicate,
  deviceHeight,
  deviceWidth,
  removeDuplicate,
} from '../../Core/Utility';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { scaleSize } from '../../Themes/AppsStyle';
import { Badge, Divider, Icon } from '@rneui/themed';
import FormGroup from '../../Content/FormGroup';
import _ from 'lodash';
import { BottomConfirm } from '../../Control/BottomConfirm';
import {
  MessageAction,
  ToastError,
  ToastSuccess,
  getDaysInMonth,
  removeVietnameseTones,
} from '../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REPORT } from '../../API/ReportAPI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const SHIFT_MODE = {
  ON: 'ON',
  OFF: 'OFF',
};
const _sheetheight = deviceHeight * 0.83;
const _scrollheight = deviceHeight * 0.7 - 190;
const _currentMonth = parseInt(moment().format('MM'));
const _currentYear = new Date().getFullYear();
export const MonthlyPlan = ({ navigation }) => {
  const { appcolor, userinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [lock, setLock] = useState(false);
  const [note, setNote] = useState(null);
  const [month, setMonth] = useState(_currentMonth);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState(SHIFT_MODE.ON);
  const [loading, setLoading] = useState(false);
  const _sheetAction = useRef();
  const [calendar, setCalendar] = useState([]);
  const [shoplist, setShopList] = useState([]);
  const [originalShopList, setOriginalShopList] = useState([]);
  const [shopData, setShops] = useState([]);
  const [tag, setTag] = useState([]);
  const [dayEdit, setDayEdit] = useState();
  const [tagSelect, setTagSelect] = useState([]);
  const [query, setQuery] = useState('');
  const [shift, setShift] = useState(null);
  const [shiftDefaulOn, setShiftDefaulOn] = useState(null);
  const [shiftDefaulOff, setShiftDefaulOff] = useState(null);
  const [shiftOn, setShiftOn] = useState(null);
  const [confirmMess, setConfirmMess] = useState(
    'Bạn xác nhận thông tin đăng kí như trên',
  );
  const [dailyshopSelect, setdailyShopSelect] = useState([]);
  const [listShopSelect, setListShopSelect] = useState({
    dailyshopSelect: [],
    shopData: [],
  });
  const [summary, setSummary] = useState({});
  const [isNoneShop, setNoneShop] = useState(false);
  const _confirm = useRef();
  const orderChangedRef = useRef(false);
  const [lockDay, setLockDay] = useState(false);
  const [_Mutate, setMutate] = useState(false);
  const [lockShift, setLockShift] = useState({
    isLockShiftOFF: 0,
    isLockShiftON: 0,
  });
  const insets = useSafeAreaInsets();

  //
  const config = JSON.parse(kpiinfo?.reportItem || '{}');
  //ShiftList
  const [shiflistRoot, setShiftListRoot] = useState([]);
  const [shiftlist, setShiftList] = useState([]);
  const onLoad = async (m, y) => {
    await setLoading(true);
    const KeyData = `MONTHLYPLAN${m}${y}`;
    const result = await WorkingPlanAPI.GetPlanByMonth(m, y);
    if (result.statusId === 200) {
      const localData = await AsyncStorage.getItem(KeyData);
      const local = await JSON.parse(localData);

      const table = (await result.data?.table) || [];
      const table1 = (await result.data?.table1) || [];
      var _off =
        (await result.data?.table2?.filter(a => a.shiftGroup === 'OFF')) || [];
      var _on =
        (await result.data?.table2?.filter(a => a.shiftGroup === 'ON')) || [];
      const province = await removeDuplicate(table1, 'province');
      await setTag(province);
      // await setShops(table1);
      listShopSelect.shopData = table1;
      setOriginalShopList(table1);
      let dataCalendar = table;
      await setShopList(table1);
      if (local && local.length > 0) {
        dataCalendar = mergeData(local, table);
        await AsyncStorage.setItem(KeyData, JSON.stringify(dataCalendar));
        await setCalendar(dataCalendar);
      }
      await setShiftList(_off);
      await setShiftListRoot(_off);
      await setShiftOn(_on);
      await setCalendar(dataCalendar);
      await Summary(dataCalendar);
    }
    await setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  const mergeData = (localData = [], serverData = []) => {
    const mergedMap = new Map();
    serverData.forEach(item => {
      mergedMap.set(item.dayInt, {
        ...item,
        planData: JSON.parse(item.planData || '[]'),
      });
    });

    localData.forEach(item => {
      const key = item.dayInt;
      const localPlans = JSON.parse(item.planData || '[]');

      const existing = mergedMap.get(key);
      mergedMap.set(key, {
        ...existing,
        isSendSystem: item.isSendSystem,
        planData: localPlans,
      });

      // if (mergedMap.has(key)) {
      //     const existing = mergedMap.get(key);
      //     // const mergedPlans = mergeShopPlans(localPlans, existing.planData);
      //     mergedMap.set(key, {
      //         ...existing,
      //         planData: localPlans,
      //     });
      // } else {
      //     mergedMap.set(key, {
      //         ...item,
      //         planData: localPlans,
      //     });
      // }
    });

    const mergedArray = Array.from(mergedMap.values()).map(item => ({
      ...item,
      planData:
        item.planData && item.planData.length > 0
          ? JSON.stringify(item.planData)
          : null,
    }));

    mergedArray.sort((a, b) => a.dayInt - b.dayInt);

    return mergedArray;
  };
  const mergeShopPlans = (localPlans, serverPlans) => {
    const map = new Map();
    for (let index = 0; index < serverPlans?.length || 0; index++) {
      const item = serverPlans[index];
      map.set(item.ShopId, item);
    }
    for (let index = 0; index < localPlans?.length || 0; index++) {
      const item = localPlans[index];
      map.set(item.ShopId, item);
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    const _load = onLoad(month, year);
    return () => _load;
  }, []);
  const onSelectTag = async item => {
    const tag = await [...tagSelect];
    const index = await tag.findIndex(a => a === item.province);
    if (index !== -1) {
      await tag.splice(index, 1);
    } else {
      await tag.push(item.province);
    }
    await handleSearch(query, tag);
    await setTagSelect(tag);
  };
  const onDayPress = (item, planData, shiftCode, shiftType) => {
    const { enableDay, lockCalendar } = item;
    orderChangedRef.current = false;
    // Reset shop selection and filters for new day
    listShopSelect.dailyshopSelect = [];
    setTagSelect([]);
    setQuery('');
    // Reset to original shop list
    setShopList([...originalShopList]);
    listShopSelect.shopData = [...originalShopList];
    // if (shiftType === SHIFT_MODE.ON) {
    //     setShiftDefaulOn(null)
    // } else {
    //     setShiftDefaulOff(null)
    // }
    // setShift(null)
    lockShift.isLockShiftON = item.isLockShiftON || 0;
    lockShift.isLockShiftOFF = item.isLockShiftOFF || 0;
    if (shiftType !== null && shiftType === SHIFT_MODE.ON) {
      setMode(SHIFT_MODE.ON);
      var clearOff = shiflistRoot.filter(a => {
        a.selected = 0;
        return a;
      });
      setShiftList(clearOff);
      const _temp = planData.map(a => a.ShopId);
      let _shiftON = [...shiftOn];
      _shiftON.forEach(s => {
        if (s.shiftCode === shiftCode) {
          s.selected = 1;
        } else s.selected = 0;
      });
      _shiftON = _shiftON.sort((a, b) =>
        b.shiftCode.localeCompare(a.shiftCode),
      );
      listShopSelect.dailyshopSelect = _temp; // Load existing plan for this day
      setShiftOn(_shiftON);
      setShift(shiftCode);
      setShiftDefaulOn(shiftCode);
      // setdailyShopSelect(_temp)
    } else if (shiftType !== null) {
      //OFF MODE
      // dailyshopSelect already reset at start of onDayPress
      setMode(SHIFT_MODE.OFF);
      // setdailyShopSelect([])
      //
      let _shiftlist = [...shiftlist];
      _shiftlist.forEach(s => {
        if (s.shiftCode === shiftCode) {
          s.selected = 1;
        } else s.selected = 0;
      });
      planData.length > 0 && setNote(planData[0].Note);
      setShiftList(_shiftlist);
      setShift(shiftCode);
      setShiftDefaulOff(shiftCode);
    } else {
      if (item.isLockShiftON == 1) {
        setMode(SHIFT_MODE.OFF);
      } else {
        setMode(SHIFT_MODE.ON);
      }
      // dailyshopSelect already reset at start of onDayPress
      const resetList = shiflistRoot.map(a =>
        a.selected === 1 ? { ...a, selected: 0 } : a,
      );
      setShiftList(resetList);
    }
    setDayEdit(item.dayInt);
    if (shiftType === SHIFT_MODE.ON && planData.length > 0) {
      sortShopDataBySelected(planData.map(a => a.ShopId));
    }

    shopDayPlan();
    if (enableDay === 0 || lockCalendar === 1) {
      setLockDay(true);
    } else {
      setLockDay(false);
    }
    _sheetAction.current.show();
  };
  const dayItem = ({ item, index }) => {
    const _widthItem = deviceWidth / 7 - 10;
    const _minHeight = deviceHeight / 6 - 20;
    const planData = JSON.parse(item.planData || '[]');
    const shiftType = planData.length > 0 ? planData[0].ShiftType : null;
    const shiftCode = planData.length > 0 ? planData[0].ShiftCode : null;
    const note = planData.length > 0 ? planData[0]?.Note : null;
    const planstatus = planData.length > 0 ? planData[0]?.Status : null;

    const planShiftOn = _.filter(
      planData,
      it => it.ShiftType === SHIFT_MODE.ON,
    );
    const isCheckMinimal =
      item.isCheckMinimal > 0
        ? item.isCheckMinimal == 2
          ? true
          : planShiftOn.length > 0
          ? true
          : false
        : false;
    const statusCheck =
      planShiftOn.length < (item.minimalStore || 0) ? false : true;
    const colorWarning =
      !statusCheck && isCheckMinimal ? item.colorWarning : null;
    const colorStatus =
      item.isSendSystem == 3
        ? appcolor.blue
        : planstatus === 3
        ? appcolor.yellow
        : planstatus === 1
        ? appcolor.success
        : appcolor.transparent;

    return (
      <View
        style={{
          borderLeftWidth: 0.2,
          borderBottomWidth: 0.2,
          minHeight: _minHeight,
          flexGrow: 1,
          width: _widthItem,
          opacity: item.enableDay === 1 ? 1 : 0.4,
        }}
        key={`s292${index}`}
      >
        <TouchableOpacity
          style={{ minHeight: _minHeight }}
          onPress={() => onDayPress(item, planData, shiftCode, shiftType)}
        >
          <Text
            style={{
              marginTop: 3,
              fontSize: scaleSize(12),
              textAlign: 'center',
              color: appcolor.dark,
            }}
          >
            {moment(item.date).format('D/M')}
          </Text>
          {shiftType !== null && shiftType === SHIFT_MODE.ON ? (
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: colorStatus,
                borderRadius: 20,
                padding: 3,
              }}
            >
              <Text style={{ textAlign: 'center', color: appcolor.white }}>
                {shiftCode}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: appcolor.white,
                }}
              >
                {planData.length}
              </Text>
            </View>
          ) : shiftType !== null && shiftType === SHIFT_MODE.OFF ? ( //OFF VIEW
            <View
              style={{
                backgroundColor: colorStatus,
                borderRadius: 20,
                padding: 3,
              }}
            >
              <Text style={{ textAlign: 'center', color: appcolor.white }}>
                {shiftCode}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {isCheckMinimal && (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                bottom: 0,
                padding: 3,
                backgroundColor: colorWarning || colorStatus,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 14,
                  color: appcolor.black,
                }}
              >{`${planShiftOn.length}/${item.minimalStore}`}</Text>
            </View>
          )}
          <Text
            numberOfLines={2}
            style={{
              paddingTop: 3,
              color: appcolor.danger,
              fontSize: scaleSize(10),
            }}
          >
            {note}
          </Text>
          {/* 
                    <View style={{
                        position: 'absolute', bottom: 0, width: '100%',
                        height: 6, backgroundColor: item.isSendSystem == 3 ? appcolor.blue : (planstatus === 3 ? appcolor.warning : planstatus === 1 ? appcolor.success : appcolor.transparent)
                    }}></View> */}
        </TouchableOpacity>
      </View>
    );
  };
  // Search are
  // const contains = (shop, query) => {
  //     const { shopCode, shopName, shopAddress, province } = shop;
  //     let Saddress = shopAddress === null ? shopAddress : shopAddress.toLowerCase();
  //     let SshopCode = shopCode === null ? shopCode : shopCode.toLowerCase();
  //     let SshopName = shopName === null ? shopName : shopName.toLowerCase();
  //     let sprovince = province === null ? province : province.toLowerCase();
  //     if (SshopName?.includes(query) || SshopCode.includes(query) || Saddress.includes(query) || sprovince.includes(query)) {
  //         return true;
  //     }
  //     return false;

  // };
  const contains = (item, query) => {
    const { shopCode, shopName, shopAddress, province } = item;
    let Saddress = shopAddress?.toLowerCase() || shopAddress;
    let SshopCode = shopCode?.toLowerCase() || shopCode;
    let SshopName = shopName?.toLowerCase() || shopName;
    let Sprovince = province?.toLowerCase() || province;
    return (
      removeVietnameseTones(Saddress)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SshopCode)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SshopName)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(Sprovince)?.match(removeVietnameseTones(query))
    );
  };
  const handleSearch = async (text, province) => {
    //Search
    let searchStore = [...shoplist];
    if (province !== undefined && province.length > 0) {
      searchStore = await shoplist.filter(a =>
        province.toString().includes(a.province),
      );
    }

    const formattedQuery = text?.toLowerCase()?.trim();
    if (formattedQuery === undefined || formattedQuery === '') {
      // setShops(searchStore);

      listShopSelect.shopData = searchStore;
      sortShopDataBySelected(listShopSelect.dailyshopSelect);

      await setQuery('');
    } else {
      const filteredData = await _.filter(searchStore, shop => {
        return contains(shop, formattedQuery);
      });
      // setShops(filteredData);
      listShopSelect.shopData = filteredData;
      sortShopDataBySelected(listShopSelect.dailyshopSelect);
      await setQuery(text);
    }
  };
  //Selected Shop
  const onShopPress = (item, index) => {
    // let dailyshop = [...dailyshopSelect]
    let dailyshop = [...listShopSelect.dailyshopSelect];
    const indexShop = dailyshop.indexOf(item.shopId);
    if (indexShop > -1) {
      //ton tai
      dailyshop.splice(indexShop, 1);
    } else {
      if (config.isSingleStore) {
        dailyshop = [item.shopId];
      } else {
        dailyshop.push(item.shopId);
      }
    }
    listShopSelect.dailyshopSelect = dailyshop;
    if (!lockDay && item.sortAble == 1) {
      sortShopDataBySelected(dailyshop);
    }
    setMutate(e => !e);
  };
  const onMoveShopOrder = (shopId, direction) => {
    const dailyshop = [...listShopSelect.dailyshopSelect];
    const currentIndex = dailyshop.indexOf(shopId);
    const nextIndex = currentIndex + direction;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= dailyshop.length) {
      return;
    }

    const swapShopId = dailyshop[nextIndex];
    dailyshop[nextIndex] = shopId;
    dailyshop[currentIndex] = swapShopId;
    listShopSelect.dailyshopSelect = dailyshop;
    sortShopDataBySelected(dailyshop);
    orderChangedRef.current = true;
    setMutate(e => !e);
  };
  const sortShopDataBySelected = (selectedShopIds = []) => {
    const selectedOrder = new Map(
      (selectedShopIds || []).map((shopId, index) => [shopId, index]),
    );
    const sortedShopData = [...listShopSelect.shopData].sort((a, b) => {
      const aSelected = selectedOrder.has(a.shopId);
      const bSelected = selectedOrder.has(b.shopId);
      if (aSelected && bSelected) {
        return selectedOrder.get(a.shopId) - selectedOrder.get(b.shopId);
      }
      if (aSelected) return -1;
      if (bSelected) return 1;
      return 0;
    });
    listShopSelect.shopData = sortedShopData;
  };
  const saveShopOrderChanges = async () => {
    if (!orderChangedRef.current || !dayEdit) {
      return;
    }

    const indexUpdate = calendar.findIndex(i => i.dayInt === dayEdit);
    const editItem = calendar[indexUpdate];
    const planData = JSON.parse(editItem?.planData || '[]');
    const isOnPlan =
      planData.length > 0 && planData[0].ShiftType === SHIFT_MODE.ON;

    if (!editItem || !isOnPlan) {
      orderChangedRef.current = false;
      return;
    }

    const selectedOrder = new Map(
      listShopSelect.dailyshopSelect.map((shopId, index) => [shopId, index]),
    );
    const originalPosition = new Map(
      planData.map((shop, index) => [shop.ShopId, index]),
    );
    const orderedPlanData = [...planData].sort((a, b) => {
      const aPosition = selectedOrder.has(a.ShopId)
        ? selectedOrder.get(a.ShopId)
        : Number.MAX_SAFE_INTEGER;
      const bPosition = selectedOrder.has(b.ShopId)
        ? selectedOrder.get(b.ShopId)
        : Number.MAX_SAFE_INTEGER;
      return aPosition === bPosition
        ? originalPosition.get(a.ShopId) - originalPosition.get(b.ShopId)
        : aPosition - bPosition;
    });

    if (
      orderedPlanData.some(
        (shop, index) => shop.ShopId !== planData[index].ShopId,
      )
    ) {
      const KeyData = `MONTHLYPLAN${month}${year}`;
      const updatedCalendar = [...calendar];
      updatedCalendar[indexUpdate] = {
        ...editItem,
        planData: JSON.stringify(orderedPlanData),
        isSendSystem: 3,
      };
      setCalendar(updatedCalendar);
      Summary(updatedCalendar);
      await AsyncStorage.setItem(KeyData, JSON.stringify(updatedCalendar));
    }

    orderChangedRef.current = false;
  };
  const onAcceptDays = () => {
    const KeyData = `MONTHLYPLAN${month}${year}`;
    const _calendar = [...calendar]; // Định nghĩa _calendar ở đây để dùng ở cả hai branch

    if (mode === SHIFT_MODE.ON) {
      if (shiftDefaulOn === null || shiftDefaulOn === '') {
        ToastError(
          'Bạn chưa chọn ca đi làm hoặc lý do nghỉ',
          'Chọn trạng thái',
          'top',
        );
        return;
      }
      const maxCall = config.maxCall || 0;
      if (
        maxCall > 0 &&
        listShopSelect.dailyshopSelect !== null &&
        listShopSelect.dailyshopSelect.length < maxCall
      ) {
        ToastError(
          `Vui lòng đăng kí đủ ${maxCall} call trong ngày`,
          'Tổng call đăng kí',
          'top',
        );
        return;
      }
      //
      let _shopSelect = [];
      listShopSelect.dailyshopSelect?.forEach(shopId => {
        _shopSelect.push({
          ShopId: shopId,
          ShiftType: SHIFT_MODE.ON,
          ShiftCode: shiftDefaulOn,
          Status: 3,
          Note: null,
        });
      });

      if (_shopSelect.length == 0 && isNoneShop) {
        _shopSelect.push({
          ShopId: userinfo.employeeId,
          ShiftType: SHIFT_MODE.ON,
          ShiftCode: shiftDefaulOn,
          Status: 3,
          Note: null,
        });
      }

      //update master
      const indexUpdate = _calendar.findIndex(i => i.dayInt === dayEdit);
      let editItem = _calendar[indexUpdate];
      editItem.planData = JSON.stringify(_shopSelect);
      editItem.isSendSystem = 3;

      _calendar[indexUpdate] = editItem;

      setCalendar(_calendar);
      Summary(_calendar);
      AsyncStorage.setItem(KeyData, JSON.stringify(_calendar));
      orderChangedRef.current = false;
      shopDayPlan();
      sortShopDataBySelected(listShopSelect.dailyshopSelect);
      setShopList([...listShopSelect.shopData]);
    } else {
      //OFF MODE
      //update master
      const indexUpdate = _calendar.findIndex(i => i.dayInt === dayEdit);
      let editItem = _calendar[indexUpdate];
      editItem.planData =
        shiftDefaulOff !== null
          ? JSON.stringify([
              {
                ShopId: userinfo.employeeId,
                ShiftType: SHIFT_MODE.OFF,
                ShiftCode: shiftDefaulOff,
                Status: 3,
                Note: note,
              },
            ])
          : null;
      _calendar[indexUpdate] = editItem;
      setCalendar(_calendar);
      Summary(_calendar);
      AsyncStorage.setItem(KeyData, JSON.stringify(_calendar));
      setShift(null);
      setShiftDefaulOff(null);
    }

    const currentIndex = _calendar.findIndex(i => i.dayInt === dayEdit);
    let nextDayIndex = currentIndex + 1;
    while (nextDayIndex < _calendar.length) {
      const candidate = _calendar[nextDayIndex];
      if (
        candidate &&
        candidate.enableDay === 1 &&
        moment(candidate.date).day() !== 0
      )
        break;
      nextDayIndex++;
    }
    if (currentIndex !== -1 && nextDayIndex < _calendar.length) {
      const nextDay = _calendar[nextDayIndex];
      if (nextDay) {
        // Reset state trước khi mở ngày kế tiếp
        setShift(null);
        setShiftDefaulOn(null);
        setShiftDefaulOff(null);
        setNote(null);
        listShopSelect.dailyshopSelect = [];

        // Clear selected state từ shift buttons
        let clearShiftsOn = [...shiftOn];
        clearShiftsOn.forEach(s => (s.selected = 0));
        setShiftOn(clearShiftsOn);

        let clearShiftsOff = [...shiftlist];
        clearShiftsOff.forEach(s => (s.selected = 0));
        setShiftList(clearShiftsOff);

        const nextPlanData = JSON.parse(nextDay.planData || '[]');
        const nextShiftCode =
          nextPlanData.length > 0 ? nextPlanData[0].ShiftCode : null;
        const nextShiftType =
          nextPlanData.length > 0 ? nextPlanData[0].ShiftType : null;

        // Mở sheet ngày tiếp theo ngay lập tức
        onDayPress(nextDay, nextPlanData, nextShiftCode, nextShiftType);
        return;
      }
    }

    // Nếu không có ngày tiếp theo thì mới đóng sheet
    _sheetAction.current.hide();
    // Reset filter khi đóng sheet
    setTagSelect([]);
    setQuery('');
    setShopList([...originalShopList]);
    handleSearch('', []);
  };
  //ON CHANGE SHIFT ON
  const onSelectON = (item, index) => {
    let _editOn = [...shiftOn];

    _editOn = _editOn.map(e => {
      if (e.shiftCode === item.shiftCode) {
        const newSelected = e.selected === 1 ? 0 : 1;

        // Cập nhật state liên quan
        if (newSelected === 1) {
          setNoneShop(e.noneShop === 1);
          setShift(e.shiftCode);
          setShiftDefaulOn(e.shiftCode);
        } else {
          setNoneShop(false);
          setShift(null);
          setShiftDefaulOn(null);
        }

        return { ...e, selected: newSelected };
      } else {
        return { ...e, selected: 0 }; // các item khác bỏ chọn
      }
    });

    _editOn.sort((a, b) => b.shiftCode.localeCompare(a.shiftCode));
    setShiftOn(_editOn);
  };

  // const onSelectON = (item, index) => {
  //     let _editOn = [...shiftOn]
  //     _editOn.forEach(e => {
  //         if (e.shiftCode === item.shiftCode) {
  //             item.selected === 0 ? setNoneShop(e.noneShop == 1) : setNoneShop(false)
  //             item.selected === 0 ? setShift(item.shiftCode) : setShift(null)
  //             e.selected = item.selected === 1 ? 0 : 1

  //             // if (item.selected === 0) {
  //             //     setNoneShop(e.noneShop == 1)
  //             //     setShift(item.shiftCode)
  //             //     e.selected = 1
  //             // } else {
  //             //     setNoneShop(false)
  //             //     setShift(null)
  //             //     e.selected = 0
  //             // }
  //         }
  //         else {
  //             e.selected = 0
  //         }
  //     })
  //     _editOn = _editOn.sort((a, b) => b.shiftCode.localeCompare(a.shiftCode))
  //     setShiftOn(_editOn)
  // }
  //OFF MODE
  const onSelectOFF = (item, index) => {
    let _editOff = [...shiftlist];
    _editOff.forEach(e => {
      if (e.shiftCode === item.shiftCode) {
        if (item.selected === 0) {
          setShift(item.shiftCode);
          setShiftDefaulOff(item.shiftCode);
          e.selected = 1;
        } else {
          setShift(null);
          setShiftDefaulOff(null);
          e.selected = 0;
        }
      } else {
        e.selected = 0;
      }
    });
    setShiftList(_editOff);
  };
  const onCalendar = value => {
    setCalendar([]);
    setLoading(true);
    let _month = month,
      _year = year;
    if (value === -1) {
      _month = month === 1 ? 12 : month - 1;
      _year = month === 1 ? year - 1 : year;
    } else if (value === 1) {
      _month = month === 12 ? 1 : month + 1;
      _year = month === 12 ? year + 1 : year;
    }
    setMonth(_month);
    setYear(_year);
    onLoad(_month, _year);
  };
  const Summary = calendar => {
    let offDay = 0,
      totalShop = 0,
      onDay = 0,
      noPlan = 0,
      phepTon = 0;
    let checkEnableDay = 0;
    calendar.forEach(e => {
      if (e.enableSum === 1) {
        const planData = JSON.parse(e.planData || '[]');
        if (planData.length > 0) {
          const itemPlan = planData[0] || {};
          phepTon = itemPlan.phepTon || 0;
          if (itemPlan.ShiftType === SHIFT_MODE.ON) {
            onDay++;
            totalShop += planData.length;
          } else {
            offDay++;
          }
        } else {
          noPlan++;
        }
      }
      if (e.lockCalendar !== 1 && checkEnableDay == 0) {
        checkEnableDay++;
      }
    });

    // const item = calendar.length > 0 && calendar[0];
    // item.lockCalendar === 1 ? setLock(true) : setLock(false)
    checkEnableDay == 1 ? setLock(false) : setLock(true);
    setSummary({
      onday: onDay,
      offday: offDay,
      totalshop: totalShop,
      noplan: noPlan,
      phepTon: phepTon,
    });
  };
  const duplicateWeek = result => {
    const weekList = removeDuplicate(calendar, 'weekly');
    let _result = true;
    weekList.forEach(w => {
      const shopweek = calendar.filter(
        sh => sh.weekly === w.weekly && sh.planData !== null,
      );
      let _temp = [];
      shopweek.forEach(shop => {
        const _stemp = JSON.parse(shop.planData).filter(
          a => a.ShiftType !== SHIFT_MODE.OFF,
        );
        _temp = _temp.concat(_stemp);
      });
      if (_temp.length > 0) {
        var _duplist = countDuplicate(_temp, 'ShopId');
        for (const [key, value] of Object.entries(_duplist)) {
          if (parseInt(value) > 1) {
            _result = false;
            break;
          }
        }
      }
    });
    setTimeout(() => {
      result(_result);
    }, 100);
  };
  const Valiaded = async result => {
    const dayFromRegister =
      config?.registerBy == 'month' ? getDaysInMonth(year, month) : 7;
    //

    const daysRemaining = calendar[0].daysRemaining || dayFromRegister;
    const daysRegister =
      summary.offday + summary.onday - (calendar[0].dayNone || 0);

    const dataFrequency = listShopSelect.shopData?.filter(
      i => i.highlightFrequency == 1,
    );
    if (daysRegister < daysRemaining) {
      result(
        500,
        `Bạn phải đăng kí ít nhất ${daysRemaining} ngày (${daysRegister}/${daysRemaining})`,
      );
      return;
    } else if (dataFrequency !== null && dataFrequency.length > 0) {
      for (let index = 0; index < dataFrequency.length; index++) {
        const element = dataFrequency[index];
        if (
          element.totalMonth == 1 &&
          element.actualFrequency < element.monthlyFrequency
        ) {
          result(
            500,
            `Bạn chưa đăng kí đủ tần suất ghé thăm cửa hàng ${element.shopName}`,
          );
          return;
        }
      }
    }
    for (let index = 0; index < calendar.length; index++) {
      const element = calendar[index];
      const planData = JSON.parse(element.planData || '[]');
      const planShiftOn = _.filter(
        planData,
        it => it.ShiftType === SHIFT_MODE.ON,
      );
      if (
        element.isConstraintPlan === 1 &&
        (element.isCheckMinimal == 2 ||
          (planShiftOn.length > 0 && element.isCheckMinimal == 1))
      ) {
        const minimalStore = element.minimalStore || 0;
        if (minimalStore > 0 && planShiftOn.length < minimalStore) {
          result(
            500,
            `Ngày ${moment(element.date).format(
              'DD/MM',
            )} bạn đăng kí số shop tối thiểu là ${minimalStore}`,
          );
          return;
        }
      }
    }

    //
    duplicateWeek(value => {
      if (value !== undefined) {
        setConfirmMess(
          'Lịch làm việc bạn đăng kí có cửa hàng đến trên 1 lần trong tuần,Bạn muốn tiếp tục đăng kí?',
        );
        value === false
          ? result(400, '')
          : result(200, `Bạn xác nhận đăng kí lịch làm việc`);
      } else {
        result(200, `Bạn xác nhận đăng kí lịch làm việc`);
      }
    });
  };
  const shopDayPlan = () => {
    const _tempShopData = [...listShopSelect.shopData];
    _tempShopData?.forEach(shop => {
      let _stringDay = 'Đã đăng kí ngày: ';
      let _count = 0;
      calendar.forEach(v => {
        if (v.planData !== null && v.planData.includes(shop.shopId)) {
          _stringDay += moment(v.date).format('D,');
          _count++;
        }
      });
      shop.dayPlan = _stringDay;
      shop.total = _count;
      shop.actualFrequency = _count;
    });
    listShopSelect.shopData = _tempShopData;
  };
  const onSummit = async () => {
    await Valiaded(async (statusId, message) => {
      if ((await statusId) === 500) {
        await ToastError(message, 'Lỗi dữ liệu đăng kí', 'top');
      } else if ((await statusId) === 400) {
        await _confirm.current.show();
      } else {
        await setConfirmMess('Bạn xác nhận thông tin đăng kí như trên');
        await _confirm.current.show();
      }
    });
  };
  const onConfirm = async () => {
    _confirm.current.hide();
    var dataUpload = [];
    for (let index = 0; index < calendar.length; index++) {
      const element = calendar[index];
      if (element.enableDay === 0) continue;
      const planData = JSON.parse(element?.planData || '[]');
      if (planData.length === 0) continue;
      planData.forEach((shops, shopIndex) => {
        dataUpload.push({
          ...shops,
          Order: shopIndex + 1,
          PlanDate: moment(element.date).format('YYYY-MM-DD'),
        });
      });
    }
    const notifyMessager = calendar[0]?.notifyMessager;
    const result = await WorkingPlanAPI.uploadPlanbyMonth(
      dataUpload,
      notifyMessager,
    );
    if (result.statusId === 200) {
      const KeyData = `MONTHLYPLAN${month}${year}`;
      await AsyncStorage.removeItem(KeyData);
      await onLoad(month, year);
      await ToastSuccess(result.messager, 'Success', 'top');
    } else {
      ToastError(result.messager, 'Lỗi');
    }
  };
  const deleteDataAsync = () => {
    MessageAction('Bạn có chắc chắn muốn xoá dữ liệu lưu tạm?', async () => {
      const KeyData = `MONTHLYPLAN${month}${year}`;
      await AsyncStorage.removeItem(KeyData);
      await onLoad(month, year);
    });
  };
  const ClearAllDataPlan = () => {
    MessageAction(
      'Bạn có chắc chắn muốn xoá tất cả kế hoạch đã đăng ký trong tháng?',
      async () => {
        const dataMain = [
          {
            typeSend: 'DELETE_ALL',
            month: month,
            year: year,
          },
        ];
        const shop = { shopId: 0, auditDate: TODAY };
        const result = await REPORT.UploadDataRaw_Realtime(
          dataMain,
          shop,
          kpiinfo.id,
        );
        if (result.statusId == 200) {
          ToastSuccess(
            `Đã xoá dữ liệu tháng ${month}/${year} trên hệ thống`,
            'Thông báo',
            'top',
          );
          const KeyData = `MONTHLYPLAN${month}${year}`;
          await AsyncStorage.removeItem(KeyData);
          await onLoad(month, year);
        }
      },
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        iconRight="cloud-upload-alt"
        iconMiddle={'eraser'}
        middleFunc={() => deleteDataAsync()}
        rightFunc={lock === false ? () => onSummit() : null}
        leftFunc={() => navigation.goBack()}
        title={kpiinfo?.menuNameVN || 'Đăng ký lịch tháng'}
      />
      <View
        style={{
          flexDirection: 'row',
          padding: 7,
          backgroundColor: appcolor.light,
        }}
      >
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: 'bold' }}
          >
            Ngày đi làm
          </Text>
          <Text style={{ fontSize: 20, color: appcolor.success }}>
            {summary?.onday || 0}
          </Text>
        </View>
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: 'bold' }}
          >
            Tổng Call ĐK
          </Text>
          <Text style={{ fontSize: 20, color: appcolor.info }}>
            {summary?.totalshop || 0}
          </Text>
        </View>
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: 'bold' }}
          >
            Chưa ĐK
          </Text>
          <Text style={{ fontSize: 20, color: appcolor.dark }}>
            {summary?.noplan || 0}
          </Text>
        </View>
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: 'bold' }}
          >
            Ngày nghỉ
          </Text>
          <Text style={{ fontSize: 20, color: appcolor.danger }}>
            {summary?.offday}
          </Text>
        </View>
        <View style={{ flexGrow: 1, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: 'bold' }}
          >
            Phép tồn
          </Text>
          <Text style={{ fontSize: 20, color: appcolor.info }}>
            {summary?.phepTon}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: '100%',
          height: '80%',
          backgroundColor: appcolor.light,
        }}
      >
        <LoadingView
          isLoading={loading}
          styles={{
            left: 0,
            right: 0,
            top: deviceHeight / 3,
            position: 'absolute',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            marginTop: 0.5,
            alignItems: 'center',
            backgroundColor: appcolor.primary,
          }}
        >
          <TouchableOpacity
            style={{ padding: 7 }}
            onPress={() => onCalendar(-1)}
          >
            <SpiralIcon
              size={scaleSize(20)}
              color={appcolor.white}
              name="arrow-left"
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ flexGrow: 1, alignItems: 'center' }}>
            <Text
              style={{
                color: appcolor.white,
                fontWeight: 'bold',
                fontSize: scaleSize(20),
              }}
            >
              {moment(`${year}-${month > 9 ? month : '0' + month}-01`).format(
                'MMMM, YYYY',
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onCalendar(1)}
            style={{ padding: 7 }}
          >
            <SpiralIcon
              size={scaleSize(20)}
              color={appcolor.white}
              name="arrow-right"
            />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: appcolor.light }}>
          <FlatList
            data={calendar}
            numColumns={7}
            ListHeaderComponent={<WeekItem />}
            renderItem={dayItem}
            ListFooterComponent={
              <View style={{ height: deviceHeight / 3.5 }} />
            }
          />
        </View>
        {config.isUseClearAll == 1 &&
          ((config.isLockCurrentMonth !== 1 &&
            month >= _currentMonth &&
            year >= _currentYear) ||
            (config.isLockCurrentMonth == 1 &&
              month > _currentMonth &&
              year >= _currentYear)) && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: appcolor.danger,
                  flexDirection: 'row',
                  width: '90%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 30,
                }}
                onPress={ClearAllDataPlan}
              >
                <SpiralIcon
                  size={20}
                  type="font-awesome-5"
                  color={appcolor.white}
                  name="trash"
                />
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: appcolor.white,
                    paddingHorizontal: 12,
                  }}
                >
                  Xoá lịch đã đăng kí
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
      <ActionSheet
        id="sheetPlan"
        ref={_sheetAction}
        onClose={saveShopOrderChanges}
        keyboardHandlerEnabled={false}
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ height: _sheetheight }}>
          <Text
            style={{
              textAlign: 'center',
              padding: 7,
              fontSize: scaleSize(14),
              fontWeight: 'bold',
              color: appcolor.primary,
            }}
          >
            Bạn đang xem lịch{' '}
            {moment(dayEdit, 'YYYYMMDD').format('dddd DD MMM, YYYY')}
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 7 }}>
            {lockShift.isLockShiftON != 1 && (
              <View
                style={{
                  padding: 7,
                  borderBottomLeftRadius: 22,
                  flexGrow: 1,
                  backgroundColor: appcolor.light,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setMode('ON');
                    // setShift(null)
                    // setShiftDefaulOn(null)
                    // let _shiftON = [...shiftOn]
                    // _shiftON.forEach(s => s.selected = 0)
                    // setShiftOn(_shiftON)
                    // let _shiftOFF = [...shiftlist]
                    // _shiftOFF.forEach(s => s.selected = 0)
                    // setShiftList(_shiftOFF)
                  }}
                >
                  <Text
                    style={{
                      color: mode === 'ON' ? appcolor.success : appcolor.dark,
                      textAlign: 'center',
                    }}
                  >
                    Đi làm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ width: 2, backgroundColor: appcolor.lightgrey }} />

            {lockShift.isLockShiftOFF != 1 && (
              <View
                style={{
                  flexGrow: 1,
                  borderBottomRightRadius: 22,
                  padding: 7,
                  backgroundColor: appcolor.light,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setMode('OFF');
                    // setShift(null)
                    // setShiftDefaulOff(null)
                    // let _shiftON = [...shiftOn]
                    // _shiftON.forEach(s => s.selected = 0)
                    // setShiftOn(_shiftON)
                    // let _shiftOFF = [...shiftlist]
                    // _shiftOFF.forEach(s => s.selected = 0)
                    // setShiftList(_shiftOFF)
                  }}
                >
                  <Text
                    style={{
                      color: mode === 'OFF' ? appcolor.danger : appcolor.dark,
                      textAlign: 'center',
                    }}
                  >
                    Nghỉ(Off)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {mode == SHIFT_MODE.ON ? (
            <ONPlan
              props={{
                navigation,
                shiftOn,
                lock,
                lockDay,
                tag,
                tagSelect,
                shopData: listShopSelect.shopData,
                dailyshopSelect: listShopSelect.dailyshopSelect,
                onSelectTag,
                handleSearch,
                onShopPress,
                onMoveShopOrder,
                onSelectON,
              }}
            />
          ) : (
            <OFFPlan props={{ shiftlist, note, onSelectOFF, setNote }} />
          )}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: appcolor.light,
              justifyContent: 'center',
              borderBottomRightRadius: 12,
              borderBottomLeftRadius: 12,
            }}
          >
            {lockDay === false && (
              <TouchableOpacity
                // disabled={(mode === SHIFT_MODE.ON && listShopSelect.dailyshopSelect?.length === 0 && !isNoneShop) || (mode === SHIFT_MODE.OFF && shiftDefaulOff === null) ? true : false}
                disabled={
                  mode === SHIFT_MODE.ON &&
                  listShopSelect.dailyshopSelect?.length === 0 &&
                  !isNoneShop
                    ? true
                    : false
                }
                onPress={() => onAcceptDays()}
                style={{ margin: 7, alignItems: 'center' }}
              >
                <Text
                  style={{
                    color: appcolor.primary,
                    padding: 8,
                    paddingBottom: 16,
                  }}
                >
                  {mode === SHIFT_MODE.ON &&
                    `(${listShopSelect.dailyshopSelect.length})`}
                  Xác nhận{' '}
                  {(mode === SHIFT_MODE.ON ? shiftDefaulOn : shiftDefaulOff) !==
                    null &&
                    `(${
                      mode === SHIFT_MODE.ON ? shiftDefaulOn : shiftDefaulOff
                    })`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ActionSheet>
      <BottomConfirm onConfirm={onConfirm} ref={_confirm} title={confirmMess} />
    </View>
  );
};
const ONPlan = ({ props }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);

  const {
    navigation,
    shiftOn,
    lock,
    lockDay,
    tag,
    tagSelect,
    shopData,
    dailyshopSelect,
    onSelectTag,
    handleSearch,
    onShopPress,
    onMoveShopOrder,
    onSelectON,
  } = props;
  const [dataShopF, setDataShopF] = useState([...shopData]);
  const loadDataShop = async () => {
    const dataF = shopData.filter(
      it => dailyshopSelect?.includes(it.shopId) || !lock,
    );
    await setDataShopF(dataF);
  };
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadDataShop();
    }
    return () => {
      isMounted = false;
    };
  }, [dailyshopSelect, shopData]);

  useEffect(() => {
    if (!Array.isArray(shiftOn) || shiftOn.length !== 1) {
      return;
    }

    const singleShift = shiftOn[0];
    const hasSelectedShift = shiftOn.some(it => it.selected === 1);

    if (!hasSelectedShift && singleShift) {
      onSelectON(singleShift, 0);
    }
  }, [shiftOn, onSelectON]);

  const gotoMap = () => {
    const strInplan = dailyshopSelect?.toString();
    var _shopTemp = shopData?.map(s => {
      strInplan.includes(s.shopId) ? (s.inPlan = 1) : (s.inPlan = 0);
      return s;
    });
    SheetManager.hide('sheetPlan');
    navigation.navigate('mapplan', { shops: _shopTemp });
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ padding: 7, minHeight: 50 }}
      >
        {shiftOn?.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={() => onSelectON(item, index)}
              key={`${index}alk2`}
            >
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor:
                    item.selected === 1 ? appcolor.info : appcolor.surface,
                  padding: 7,
                  marginRight: 7,
                  borderRadius: 22,
                }}
              >
                <Text
                  style={{
                    color: item.selected === 1 ? appcolor.white : appcolor.dark,
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  {item.shiftCode}
                </Text>
                <Text
                  style={{
                    color: item.selected === 1 ? appcolor.white : appcolor.dark,
                    fontSize: 10,
                  }}
                >
                  {item.shiftName.length < 20
                    ? `${item.shiftName}`
                    : `${item.shiftName.substring(0, 16)}...`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <FormGroup
        editable={true}
        useClearAndroid={false}
        handleChangeForm={e => handleSearch(e, tagSelect)}
        placeholder={`Tìm kiếm cửa hàng...`}
      />
      <Text
        style={{
          padding: 3,
          color: appcolor.dark,
          fontSize: scaleSize(12),
          marginLeft: 22,
        }}
      >
        Lọc theo tỉnh
      </Text>
      <View style={{ padding: 3 }}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          data={tag}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={() => onSelectTag(item)}>
                <View
                  style={{
                    height: 40,
                    marginEnd: 7,
                    padding: 12,
                    borderRadius: 22,
                    backgroundColor: tagSelect?.includes(item.province)
                      ? appcolor.primary
                      : appcolor.surface,
                  }}
                  key={`${index}-298`}
                >
                  <Text
                    style={{
                      color: tagSelect?.includes(item.province)
                        ? appcolor.white
                        : appcolor.dark,
                    }}
                  >
                    {item.province}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <View
          style={{
            marginTop: 7,
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
        <View style={{ height: _scrollheight, width: '100%', marginTop: 7 }}>
          <FlashList
            key={`dataregionlist`}
            scrollEnabled={true}
            keyExtractor={(item, _index) => item.shopId.toString()}
            estimatedItemSize={90}
            extraData={[dailyshopSelect, shopData, dataShopF]}
            data={dataShopF}
            renderItem={useCallback(({ item, index }) => {
              const selectedOrder = dailyshopSelect?.indexOf(item.shopId);
              const isSelected = selectedOrder > -1;
              const onItemPress = () => {
                if ((item.lockRegister || 0) == 0)
                  lock ? null : onShopPress(item, index);
              };
              return (
                <TouchableOpacity
                  style={{
                    display: isSelected ? 'flex' : lock ? 'none' : 'flex',
                  }}
                  onPress={onItemPress}
                >
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: isSelected
                        ? appcolor.success
                        : appcolor.light,
                    }}
                    key={`${index}-2sd8`}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: scaleSize(12),
                          color: isSelected ? appcolor.white : appcolor.dark,
                        }}
                      >
                        {isSelected ? selectedOrder + 1 : index + 1}){' '}
                        {item.shopCode} - {item.shopName} - {item.shopId}
                      </Text>
                      {isSelected &&
                        !lock &&
                        !lockDay &&
                        item.sortAble == 1 && (
                          <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                            <TouchableOpacity
                              disabled={selectedOrder === 0}
                              onPress={() => onMoveShopOrder(item.shopId, -1)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                marginRight: 8,
                                backgroundColor: appcolor.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: selectedOrder === 0 ? 0.4 : 1,
                              }}
                            >
                              <SpiralIcon
                                type="font-awesome-5"
                                size={18}
                                color={appcolor.success}
                                name="chevron-up"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              disabled={
                                selectedOrder === dailyshopSelect.length - 1
                              }
                              onPress={() => onMoveShopOrder(item.shopId, 1)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                backgroundColor: appcolor.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity:
                                  selectedOrder === dailyshopSelect.length - 1
                                    ? 0.4
                                    : 1,
                              }}
                            >
                              <SpiralIcon
                                type="font-awesome-5"
                                size={18}
                                color={appcolor.success}
                                name="chevron-down"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                    </View>
                    <Text
                      style={{
                        fontSize: scaleSize(10),
                        color: isSelected ? appcolor.white : appcolor.dark,
                      }}
                    >
                      {item.shopAddress} {item.province}
                    </Text>
                    <View style={{ flexDirection: 'row', padding: 3 }}>
                      <Text
                        style={{
                          color: isSelected
                            ? appcolor.white
                            : item.total > 4
                            ? appcolor.danger
                            : appcolor.dark,
                          fontSize: scaleSize(12),
                          flexGrow: 1,
                        }}
                      >
                        {item.dayPlan}
                      </Text>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: isSelected
                            ? appcolor.white
                            : item.total > 4
                            ? appcolor.danger
                            : appcolor.dark,
                          fontSize: 12,
                        }}
                      >
                        Tổng: {item.total || 0}
                      </Text>
                    </View>
                    {item.highlightFrequency == 1 && (
                      <View style={{ padding: 3 }}>
                        <Text
                          style={{
                            flexGrow: 1,
                            textAlign: 'right',
                            fontSize: 12,
                            fontWeight: '700',
                            fontStyle: 'italic',
                            color: isSelected
                              ? appcolor.white
                              : item.actualFrequency < item.monthlyFrequency
                              ? appcolor.tomato
                              : appcolor.dark,
                          }}
                        >{`${item.frequencyView}${item.actualFrequency}`}</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: appcolor.surface,
                      width: '100%',
                    }}
                  />
                </TouchableOpacity>
              );
            })}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={{ paddingBottom: deviceHeight / 5 }} />
            }
          />
        </View>

        {/* <FlatList
                        data={shopData}
                        ListFooterComponent={<View style={{ height: 40 }} />}
                        initialNumToRender={10}
                        renderItem={
                            ({ item, index }) => {
                                const onItemPress = () => {
                                    if ((item.lockRegister || 0) == 0)
                                        lock ? null : onShopPress(item, index)
                                }
                                return (
                                    <TouchableOpacity style={{ display: dailyshopSelect?.includes(item.shopId) ? 'flex' : lock ? 'none' : 'flex', }} onPress={onItemPress}>
                                        <View style={{
                                            padding: 12,
                                            backgroundColor: dailyshopSelect?.includes(item.shopId) ? appcolor.success : appcolor.light
                                        }}
                                            key={`${index}-2sd8`}>
                                            <Text style={{ fontSize: scaleSize(12), color: dailyshopSelect?.includes(item.shopId) ? appcolor.white : appcolor.dark }}>{index + 1}/  {item.shopCode} - {item.shopName}</Text>
                                            <Text style={{ fontSize: scaleSize(10), color: dailyshopSelect?.includes(item.shopId) ? appcolor.white : appcolor.dark }}>{item.shopAddress} {item.province}</Text>
                                            <View style={{ flexDirection: 'row', padding: 3 }}>
                                                <Text style={{ color: item.total > 4 ? appcolor.danger : appcolor.dark, fontSize: scaleSize(12), flexGrow: 1 }}>
                                                    {item.dayPlan}
                                                </Text>
                                                <Text style={{ fontWeight: 'bold', color: item.total > 4 ? appcolor.danger : appcolor.dark, fontSize: 12 }}>Tổng: {item.total || 0}</Text>
                                            </View>
                                            {item.highlightFrequency == 1 &&
                                                <View style={{ padding: 3 }}>
                                                    <Text style={{
                                                        flexGrow: 1, textAlign: 'right', fontSize: 12, fontWeight: '700', fontStyle: 'italic',
                                                        color: item.actualFrequency < item.monthlyFrequency ? appcolor.tomato : appcolor.dark
                                                    }}>{`${item.frequencyView}${item.actualFrequency}`}</Text>
                                                </View>
                                            }
                                        </View>
                                        <Divider />
                                    </TouchableOpacity>
                                )
                            }
                        }
                    /> */}
        {/* </ScrollView> */}
        <TouchableOpacity
          onPress={gotoMap}
          style={{ left: 20, position: 'absolute', bottom: 20 }}
        >
          <SpiralIcon
            name="map"
            color={appcolor.primary}
            reverse
            containerStyle={{ opacity: 0.8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const OFFPlan = ({ props }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { shiftlist, onSelectOFF, note, setNote } = props;

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <FormGroup
        containerStyle={{ marginLeft: 7, marginRight: 7 }}
        handleChangeForm={e => setNote(e)}
        value={note}
        onClearTextAndroid={e => setNote(null)}
        editable={true}
        placeholder="Ghi chú..."
        title={'Lý do nghỉ phép'}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: '100%', height: _scrollheight }}
      >
        {shiftlist !== null &&
          shiftlist.length > 0 &&
          shiftlist.map((item, index) => {
            return (
              <TouchableOpacity
                key={`${index}-2slld8`}
                onPress={() => onSelectOFF(item, index)}
              >
                <View
                  style={{
                    padding: 12,
                    backgroundColor:
                      item.selected === 1 ? appcolor.danger : appcolor.light,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Badge
                    value={item.shiftCode}
                    containerStyle={{ marginRight: 10 }}
                  />
                  <View style={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: 12, color: appcolor.dark }}>
                      {item.shiftNameVN}
                    </Text>
                    <Text style={{ fontSize: 10, color: appcolor.dark }}>
                      {item.shiftName}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};
const WeekItem = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 0.2 }}>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T2
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T3
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T4
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T5
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T6
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.dark,
        }}
      >
        T7
      </Text>
      <Text
        style={{
          textAlign: 'center',
          flexGrow: 1,
          fontWeight: 'bold',
          padding: 5,
          color: appcolor.danger,
        }}
      >
        CN
      </Text>
    </View>
  );
};
