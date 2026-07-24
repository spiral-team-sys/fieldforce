import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  View,
  StyleSheet,
} from 'react-native';
import { GetHistoryAttendant } from '../../../../Controller/HistoryController';
import { removeVietnameseTones } from '../../../../Core/Helper';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { LoadingView } from '../../../../Control/ItemLoading/index';
import { DEFAULT_COLOR } from '../../../../Core/URLs';
import CalendarStrip from 'react-native-calendar-strip';
import { useSelector } from 'react-redux';
import ModalItem from '../../../../Control/ModalItem';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import CustomListView from '../../../../Control/Custom/CustomListView';
import AttendantGroup from './Items/AttendantGroup';
import moment from 'moment';
const PAGE_SIZE = 10;

const calendarStyles = StyleSheet.create({
  strip: { flexDirection: 'row', height: 86, alignItems: 'center' },
  header: { color: 'white', fontSize: 14, marginTop: 8 },
  dateNumber: { color: 'white', fontSize: 14 },
  dateName: { color: 'white', fontSize: 12 },
  highlightDateContainer: { backgroundColor: 'white', borderRadius: 8 },
  highlightDateNumber: { color: 'black', fontSize: 14 },
  highlightDateName: { color: 'black', fontSize: 12 },
  disabledDateName: { color: 'grey', fontSize: 12 },
  disabledDateNumber: { color: 'grey', fontSize: 14 },
  iconContainer: { flex: 0.1 },
});

const AttendantHistoryScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [refreshing, setRefreshing] = useState(false);
  const [dataModalPhoto, setDataModalPhoto] = useState({
    visiblePhoto: false,
    imageList: [],
    imageIndex: 0,
  });
  const [dataModal, setDataModal] = useState({
    titleModal: '',
    visible: false,
    dataSelect: [],
    dataFilter: [],
    dataEmployees: [],
  });
  const [dataAttendant, setDataAtendant] = useState({
    mData: [],
    mDataMain: [],
    mDataEmployee: [],
  });
  const [configDate, setConfigDate] = useState({
    dateChoose: route.params?.planDate,
    customDatesStyles: [],
  });
  const rawDataRef = useRef([]);
  const allGroupedDataRef = useRef([]);
  const listRef = useRef();
  const [groupType, setGroupType] = useState('EMPLOYEE');

  const LoadData = async mDate => {
    setRefreshing(true);
    const AttendantDate = moment(
      mDate !== undefined
        ? mDate
        : configDate.dateChoose !== undefined
        ? configDate.dateChoose
        : moment(),
    ).format('YYYYMMDD');
    await GetHistoryAttendant(AttendantDate, (mDataHistory, employeeList) => {
      rawDataRef.current = mDataHistory;
      const listSort = groupBySort(mDataHistory, groupType);
      allGroupedDataRef.current = listSort;
      setDataAtendant({
        mData: listSort.slice(0, PAGE_SIZE),
        mDataMain: mDataHistory,
        mDataEmployee: employeeList,
      });
      setDataModal({
        dataEmployees: employeeList,
        dataSelect: groupType === 'EMPLOYEE' ? employeeList : listSort,
        dataFilter: groupType === 'EMPLOYEE' ? employeeList : listSort,
        visible: false,
      });
      ConfigCalendar(AttendantDate);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
    setRefreshing(false);
  };
  const groupBySort = useCallback((data, type) => {
    const fieldMap = {
      EMPLOYEE: {
        field: 'employeeId',
        fieldName: 'employeeName',
        subName: 'employeeCode',
      },
      SHOP: {
        field: 'shopId',
        fieldName: 'shopName',
        subName: 'shopCode',
        address: 'address',
      },
      POSITION: { field: 'typeId', fieldName: 'typeName' },
    };
    const { field, fieldName, subName, address } =
      fieldMap[type] || fieldMap['EMPLOYEE'];
    const groupMap = new Map();
    for (const item of data) {
      const key = item[field];
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          name: item[fieldName],
          subName: item[subName],
          address: item[address] || null,
          items: [],
          count: 0,
        });
      }
      const group = groupMap.get(key);
      group.items.push(item);
      if (
        item.photoList &&
        item.photoList !== '[]' &&
        item.photoList !== 'null'
      ) {
        group.count++;
      }
    }
    const groupResult = Array.from(groupMap.values())
      .map(g => ({
        [fieldName]: g.name,
        [subName]: g.subName,
        address: g.address,
        dataByType: g.items,
        numAttendant: g.count,
      }))
      .sort((a, b) => b.numAttendant - a.numAttendant);
    return groupResult;
  }, []);
  const ConfigCalendar = dateSelect => {
    let customDatesStyles = [];
    const ok = appcolor.light;
    customDatesStyles.push({
      startDate: new Date(),
      dateNameStyle: { color: ok },
      dateNumberStyle: { color: ok },
      highlightDateNameStyle: { color: ok },
      highlightDateNumberStyle: { color: ok },
    });
    setConfigDate({
      dateChoose:
        dateSelect == undefined ? moment().format('YYYY-MM-DD') : dateSelect,
      customDatesStyles: customDatesStyles,
    });
  };
  const showModalView = () => {
    const titleMap = {
      EMPLOYEE: 'Danh sách nhân viên',
      SHOP: 'Danh sách cửa hàng',
      POSITION: 'Danh sách chức vụ',
    };
    setDataModal(prev => ({
      ...prev,
      titleModal: titleMap[groupType] || '',
      visible: true,
    }));
  };
  const searchModal = text => {
    if (!text) {
      setDataModal({ ...dataModal, dataSelect: dataModal.dataFilter });
    } else {
      const searchText = removeVietnameseTones(text.toLowerCase());
      const filterShift = dataModal.dataFilter.filter(
        item =>
          removeVietnameseTones(item?.employeeName?.toLowerCase()).includes(
            searchText,
          ) ||
          removeVietnameseTones(item?.employeeCode?.toLowerCase()).includes(
            searchText,
          ) ||
          removeVietnameseTones(item?.shopName?.toLowerCase()).includes(
            searchText,
          ) ||
          removeVietnameseTones(item?.shopCode?.toLowerCase()).includes(
            searchText,
          ) ||
          removeVietnameseTones(item?.address?.toLowerCase()).includes(
            searchText,
          ) ||
          removeVietnameseTones(item?.typeName?.toLowerCase()).includes(
            searchText,
          ),
      );
      setDataModal({ ...dataModal, dataSelect: filterShift });
    }
  };
  const chooseItemModal = item => {
    const fieldMap = {
      EMPLOYEE: 'employeeCode',
      SHOP: 'shopName',
      POSITION: 'typeName',
    };
    const itemField = fieldMap[groupType] || 'employeeCode';
    const lstFilter = rawDataRef.current.filter(
      i => i[itemField] === item[itemField],
    );
    const listSort = groupBySort(lstFilter, groupType);
    allGroupedDataRef.current = listSort;
    setDataAtendant(prev => ({ ...prev, mData: listSort.slice(0, PAGE_SIZE) }));
    setDataModal(prev => ({
      ...prev,
      dataSelect: prev.dataFilter.map(i => ({
        ...i,
        isSelect: i[itemField] === item[itemField] ? 1 : 0,
      })),
      visible: false,
    }));
  };
  const clearItemModal = () => {
    const listSort = groupBySort(rawDataRef.current, groupType);
    allGroupedDataRef.current = listSort;
    setDataAtendant(prev => ({ ...prev, mData: listSort.slice(0, PAGE_SIZE) }));
    setDataModal(prev => ({
      ...prev,
      dataSelect: prev.dataFilter.map(i => ({
        ...i,
        isSelect: 0,
      })),
      visible: false,
    }));
  };
  const loadMoreData = useCallback(() => {
    setDataAtendant(prev => {
      const currentLen = prev.mData.length;
      const all = allGroupedDataRef.current;
      if (currentLen >= all.length) return prev;
      return { ...prev, mData: all.slice(0, currentLen + PAGE_SIZE) };
    });
  }, []);
  const handleShowPhoto = useCallback((imageList, imageIndex) => {
    setDataModalPhoto({ imageList, imageIndex, visiblePhoto: true });
  }, []);

  const filterDataBy = useCallback(
    type => {
      if (groupType === type) return;
      setRefreshing(true);
      InteractionManager.runAfterInteractions(() => {
        try {
          const listSort = groupBySort(rawDataRef.current, type);
          allGroupedDataRef.current = listSort;
          setGroupType(type);
          setDataAtendant(prev => ({
            ...prev,
            mData: listSort.slice(0, PAGE_SIZE),
            mDataMain: rawDataRef.current,
          }));
          setDataModal(prev => ({
            ...prev,
            dataSelect: type === 'EMPLOYEE' ? prev.dataEmployees : listSort,
            dataFilter: type === 'EMPLOYEE' ? prev.dataEmployees : listSort,
          }));
        } catch (error) {
          console.error('Lỗi:', error);
        } finally {
          setRefreshing(false);
        }
      });
    },
    [groupType, groupBySort],
  );

  useEffect(() => {
    LoadData();
    return () => refreshing;
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        loadingView: {
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.5)',
        },
        filterStyle: { marginStart: 8, marginEnd: 8 },
      }),
    [appcolor],
  );

  const renderListFooter = useMemo(() => {
    if (dataAttendant.mData.length >= allGroupedDataRef.current.length)
      return undefined;
    return <ActivityIndicator style={{ padding: 16 }} color={appcolor.light} />;
  }, [dataAttendant.mData.length, appcolor.light]);
  const renderItem = useCallback(
    ({ item }) => (
      <AttendantGroup
        item={item}
        groupType={groupType}
        onShowPhoto={handleShowPhoto}
      />
    ),
    [groupType, handleShowPhoto],
  );
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route?.params?.title || 'Lịch sử chấm công'}
        iconRight="search"
        leftFunc={() => navigation.goBack()}
        rightFunc={showModalView}
      />
      <CalendarStrip
        key={`calendar_${configDate.dateChoose}`}
        style={calendarStyles.strip}
        shouldAllowFontScaling={false}
        minDate={'2023-01-01'}
        calendarHeaderStyle={calendarStyles.header}
        calendarColor={DEFAULT_COLOR}
        dateNumberStyle={calendarStyles.dateNumber}
        dateNameStyle={calendarStyles.dateName}
        customDatesStyles={configDate.customDatesStyles}
        highlightDateContainerStyle={calendarStyles.highlightDateContainer}
        highlightDateNumberStyle={calendarStyles.highlightDateNumber}
        highlightDateNameStyle={calendarStyles.highlightDateName}
        disabledDateNameStyle={calendarStyles.disabledDateName}
        disabledDateNumberStyle={calendarStyles.disabledDateNumber}
        iconLeft={require('../../../../Themes/Images/chevron-left.png')}
        iconRight={require('../../../../Themes/Images/chevron-right.png')}
        iconContainer={calendarStyles.iconContainer}
        selectedDate={configDate.dateChoose}
        scrollToOnSetSelectedDate={false}
        onDateSelected={date => {
          LoadData(date);
        }}
      />
      <LoadingView isLoading={refreshing} title={'Đang cập nhật dữ liệu'} />
      <CustomListView
        ref={listRef}
        data={dataAttendant.mData}
        extraData={[dataAttendant.mData, groupType]}
        renderItem={renderItem}
        onRefresh={LoadData}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooter={renderListFooter}
      />
      <ModalItem
        styles={styles}
        dataModal={dataModal}
        groupType={groupType}
        actionResultModal={() => setDataModal({ ...dataModal, visible: false })}
        actionCloseModal={() => setDataModal({ ...dataModal, visible: false })}
        actionSearch={searchModal}
        actionChooseItem={chooseItemModal}
        actionClearItem={clearItemModal}
        filterDataBy={filterDataBy}
      />
      <ViewPictures
        images={dataModalPhoto.imageList}
        initialIndex={dataModalPhoto.imageIndex}
        visible={dataModalPhoto.visiblePhoto}
        onSwipeDown={() =>
          setDataModalPhoto({ ...dataModalPhoto, visiblePhoto: false })
        }
      />
    </View>
  );
};

export default AttendantHistoryScreen;
