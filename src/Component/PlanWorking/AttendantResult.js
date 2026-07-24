import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { GetHistoryAttendant } from '../../Controller/HistoryController';
import { groupDataByKey } from '../../Core/Helper';
import moment from 'moment';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading/index';
import { URLDEFAULT, DEFAULT_COLOR } from '../../Core/URLs';
import { Image } from '@rneui/themed';
import CalendarStrip from 'react-native-calendar-strip';
import { useSelector } from 'react-redux';
import ModalItem from '../../Control/ModalItem';
import { Modal } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { deviceWidth, deviceHeight } from '../Home';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const AttendantResult = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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
  const filterSheet = useRef();
  const [groupType, setGroupType] = useState('EMPLOYEE');

  const LoadData = async mDate => {
    setRefreshing(true);
    setConfigDate({});
    const AttendantDate = moment(
      mDate !== undefined
        ? mDate
        : route.params?.planDate !== undefined
        ? route.params?.planDate
        : moment(),
    ).format('YYYYMMDD');
    await GetHistoryAttendant(
      AttendantDate,
      async (mDataHistory, employeeList) => {
        const dataGroup = await groupBySort(mDataHistory, groupType);
        await setDataAtendant({
          mData: dataGroup.listSort,
          mDataMain: dataGroup.arr,
          mDataEmployee: employeeList,
        });
        await setDataModal({
          dataEmployees: employeeList,
          dataSelect:
            groupType === 'EMPLOYEE' ? employeeList : dataGroup.listSort,
          dataFilter:
            groupType === 'EMPLOYEE' ? employeeList : dataGroup.listSort,
          visible: false,
        });
        await ConfigCalendar(AttendantDate);
      },
    );
    setRefreshing(false);
  };

  const groupBySort = async (data, groupType) => {
    const dataGroup = [];
    let field = '';
    let fieldName = '';

    const fieldMap = {
      EMPLOYEE: { field: 'employeeId', fieldName: 'employeeName' },
      SHOP: { field: 'shopId', fieldName: 'shopName' },
      POSITION: { field: 'typeId', fieldName: 'typeName' },
    };

    const { field: selectedField, fieldName: selectedFieldName } =
      fieldMap[groupType] || fieldMap['EMPLOYEE'];
    field = selectedField;
    fieldName = selectedFieldName;

    const sortByType = await data.sort((a, b) => b[field] - a[field]);
    const { arr } = groupDataByKey({
      arr: sortByType,
      key: field,
    });

    arr.forEach(it => {
      if (it.isParent) {
        const listByType = [];
        let countAttendant = 0;

        arr.forEach(item => {
          if (item[field] === it[field]) {
            listByType.push(item);
            const photoList = JSON.parse(item.photoList || '[]');
            if (photoList.length > 0) {
              countAttendant++;
            }
          }
        });

        dataGroup.push({
          [fieldName]: it[fieldName],
          dataByType: listByType,
          numAttendant: countAttendant,
        });
      }
    });

    const listSort = dataGroup.sort((a, b) => b.numAttendant - a.numAttendant);
    return { listSort, arr };
  };

  const ConfigCalendar = async dateSelect => {
    let customDatesStyles = [];
    const ok = '#ff6600';
    customDatesStyles.push({
      startDate: new Date(),
      dateNameStyle: { color: ok },
      dateNumberStyle: { color: ok },
      highlightDateNameStyle: { color: ok },
      highlightDateNumberStyle: { color: ok },
    });
    await setConfigDate({
      dateChoose:
        dateSelect == undefined ? moment().format('YYYY-MM-DD') : dateSelect,
      customDatesStyles: customDatesStyles,
    });
  };
  const showModalView = async () => {
    let title = '';
    switch (groupType) {
      case 'EMPLOYEE':
        title = 'Danh sách nhân viên';
        break;
      case 'SHOP':
        title = 'Danh sách cửa hàng';
        break;
      case 'POSITION':
        title = 'Danh sách chức vụ';
        break;
      default:
        break;
    }
    await setDataModal({ ...dataModal, titleModal: title, visible: true });
  };
  const searchModal = async text => {
    if (!text) {
      await setDataModal({ ...dataModal, dataSelect: dataModal.dataFilter });
      return;
    }

    const searchText = text.toLowerCase();
    const fieldMap = {
      EMPLOYEE: 'employeeName',
      SHOP: 'shopName',
      POSITION: 'typeName',
    };
    const searchField = fieldMap[groupType] || 'employeeName';

    const filterShift = dataModal.dataFilter.filter(item =>
      item[searchField].toLowerCase().includes(searchText),
    );

    await setDataModal({ ...dataModal, dataSelect: filterShift });
  };
  const chooseItemModal = async item => {
    const fieldMap = {
      EMPLOYEE: 'employeeCode',
      SHOP: 'shopName',
      POSITION: 'typeName',
    };
    const itemField = fieldMap[groupType] || 'employeeCode';

    const lstFilter = dataAttendant.mDataMain.filter(
      i => i[itemField] === item[itemField],
    );
    const dataGroup = await groupBySort(lstFilter, groupType);
    const updates = {
      dataAtendant: { ...dataAttendant, mData: dataGroup.listSort },
      dataModal: {
        ...dataModal,
        dataSelect: dataModal.dataFilter.map(i => ({
          ...i,
          isSelect: i[itemField] === item[itemField] ? 1 : 0,
        })),
        visible: false,
      },
    };

    setDataAtendant(updates.dataAtendant);
    setDataModal(updates.dataModal);
  };
  const clearItemModal = async (item, index) => {
    dataModal.dataSelect[index].isSelect = 0;
    dataModal.dataFilter[index].isSelect = 0;
    const dataGroup = await groupBySort(dataAttendant.mDataMain, groupType);
    setDataAtendant({ ...dataAttendant, mData: dataGroup.listSort });
    setDataModal({ ...dataModal, visible: false });
  };
  const renderItem = ({ item, index }) => {
    const fieldMap = {
      EMPLOYEE: {
        fieldName: 'employeeName',
        iconName: 'user',
        title: 'Nhân viên: ',
      },
      SHOP: { fieldName: 'shopName', iconName: 'store', title: 'Cửa hàng: ' },
      POSITION: {
        fieldName: 'typeName',
        iconName: 'user-tie',
        title: 'Chức vụ: ',
      },
    };

    const { fieldName, iconName, title } =
      fieldMap[groupType] || fieldMap['EMPLOYEE'];
    const sortDataByType = item.dataByType.sort(
      (a, b) =>
        JSON.parse(b.photoList || '[]').length -
        JSON.parse(a.photoList || '[]').length,
    );

    return (
      <View
        key={`indexx__${index}`}
        style={{ flex: 1, backgroundColor: appcolor.homebackground }}
      >
        <View style={styles.titleContainer}>
          <SpiralIcon
            solid
            name={iconName}
            size={18}
            style={{ color: appcolor.black, paddingEnd: 8 }}
          />
          <Text
            style={{
              width: '95%',
              color: appcolor.black,
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            {title} {item[fieldName]}
          </Text>
        </View>
        <FlatList
          style={{ flex: 1 }}
          key={`listByType_${index}`}
          keyExtractor={(_, index) => index.toString()}
          data={sortDataByType}
          renderItem={renderItemSort}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      </View>
    );
  };

  const renderItemSort = ({ item, index }) => {
    const fieldMap = {
      EMPLOYEE: { fieldName: 'shopName', iconName: 'user' },
      SHOP: { fieldName: 'employeeName', iconName: 'store' },
      POSITION: { fieldName: 'typeName', iconName: 'user-tie' },
    };

    const { fieldName, iconName } = fieldMap[groupType] || fieldMap['EMPLOYEE'];
    const isShowOverView = item.isShowOverView === 1;
    const containerWidth = isShowOverView ? deviceWidth - (20 + 110) : '100%';
    const overViewPath = item?.overViewPath?.includes('https')
      ? item.overViewPath
      : `${URLDEFAULT}${item.overViewPath}`;

    return (
      <View key={index} style={styles.itemContainer}>
        <View
          style={{
            width: containerWidth,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <SpiralIcon name={iconName} size={21} color={appcolor.dark} />
          <Text
            style={{
              width: '95%',
              paddingStart: 8,
              paddingEnd: 8,
              fontSize: 15,
              fontWeight: '700',
              color: appcolor.dark,
            }}
          >
            {index + 1}. {item[fieldName]}
          </Text>
        </View>
        <View
          style={{
            flex: 2,
            flexDirection: 'row',
            paddingTop: 8,
            paddingBottom: 8,
            borderBottomWidth: 0.5,
            borderBottomColor: appcolor.dark,
          }}
        >
          <View style={{ width: containerWidth }}>
            <Text style={{ width: '100%', fontSize: 14, color: appcolor.dark }}>
              Mã cửa hàng: {item.shopCode}
            </Text>
            <Text style={{ width: '100%', fontSize: 14, color: appcolor.dark }}>
              Địa chỉ: {item.address}
            </Text>
            <Text
              style={{
                width: '100%',
                fontSize: 14,
                fontWeight: '600',
                color: appcolor.tomato,
              }}
            >
              Ca làm việc: {item.shiftName}
            </Text>
          </View>
        </View>
        {isShowOverView && (
          <TouchableOpacity
            onPress={() =>
              setDataModalPhoto({
                imageList: [
                  {
                    photoPath: item.overViewPath,
                    AttendantPhoto: item.overViewPath,
                  },
                ],
                imageIndex: 0,
                visiblePhoto: true,
              })
            }
            style={{
              height: 100,
              width: 100,
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: appcolor.surface,
              borderRadius: 12,
            }}
          >
            <Image
              source={{ uri: overViewPath }}
              style={{ width: 100, height: 100, borderRadius: 12 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        <Text
          style={{
            width: '100%',
            fontSize: 15,
            textAlign: 'center',
            padding: 8,
            fontWeight: '700',
            color: appcolor.bluenavylight,
          }}
        >
          Total Time: {item.totalTime}
        </Text>
        {item.overTime !== '0' && (
          <Text
            style={{
              width: '100%',
              fontSize: 15,
              textAlign: 'center',
              paddingBottom: 8,
              fontWeight: '600',
              fontStyle: 'italic',
              color: appcolor.success,
            }}
          >
            Tổng thời gian làm thêm giờ: {item.overTime}
          </Text>
        )}
        <PhotoAttendant
          styles={styles}
          lstPhoto={JSON.parse(item.photoList || '[]')}
          showPhoto={index =>
            setDataModalPhoto({
              imageList: JSON.parse(item.photoList || '[]'),
              imageIndex: index,
              visiblePhoto: true,
            })
          }
        />
      </View>
    );
  };
  useEffect(() => {
    LoadData();
    return () => refreshing;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.homebackground },
    itemContainer: {
      flex: 1,
      margin: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: appcolor.light,
    },
    titleContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: appcolor.yellowdark,
    },
    filterStyle: { marginStart: 8, marginEnd: 8 },
  });
  const filterDataBy = async type => {
    if (groupType === type) return;
    setRefreshing(true);
    try {
      const currentData = [...dataAttendant.mDataMain];
      const dataGroup = await groupBySort(currentData, type);
      const updates = {
        groupType: type,
        dataAtendant: {
          ...dataAttendant,
          mData: dataGroup.listSort,
          mDataMain: dataGroup.arr,
        },
        dataModal: {
          ...dataModal,
          dataSelect:
            type === 'EMPLOYEE' ? dataModal.dataEmployees : dataGroup.listSort,
          dataFilter:
            type === 'EMPLOYEE' ? dataModal.dataEmployees : dataGroup.listSort,
        },
      };
      setGroupType(updates.groupType);
      setDataAtendant(updates.dataAtendant);
      setDataModal(updates.dataModal);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openSheet = () => {
    filterSheet.current.show();
  };

  return (
    <View style={styles.mainContainer}>
      {dataModalPhoto.visiblePhoto && (
        <ModalShowImage
          imageList={dataModalPhoto.imageList}
          imageIndex={dataModalPhoto.imageIndex}
          actionClose={() =>
            setDataModalPhoto({ ...dataModalPhoto, visiblePhoto: false })
          }
          appcolor={appcolor}
        />
      )}
      <HeaderCustom
        title={route?.params?.title || 'Lịch sử chấm công'}
        iconMiddle="search"
        iconRight="filter"
        leftFunc={() => navigation.goBack()}
        middleFunc={showModalView}
        rightFunc={() => openSheet()}
      />
      <CalendarStrip
        key={`calendar_${configDate.dateChoose}`}
        style={{ flexDirection: 'row', height: 100, alignItems: 'center' }}
        shouldAllowFontScaling={false}
        minDate={'2019-01-01'}
        calendarHeaderStyle={{ color: 'white', marginBottom: 16, fontSize: 16 }}
        calendarColor={DEFAULT_COLOR}
        dateNumberStyle={{ color: 'white', fontSize: 14 }}
        dateNameStyle={{ color: 'white', fontSize: 12 }}
        customDatesStyles={configDate.customDatesStyles}
        highlightDateContainerStyle={{ backgroundColor: 'white' }}
        highlightDateNumberStyle={{ color: 'black', fontSize: 14 }}
        highlightDateNameStyle={{ color: 'black', fontSize: 12 }}
        disabledDateNameStyle={{ color: 'grey', fontSize: 12 }}
        disabledDateNumberStyle={{ color: 'grey', fontSize: 14 }}
        iconLeft={require('../../Themes/Images/chevron-left.png')}
        iconRight={require('../../Themes/Images/chevron-right.png')}
        iconContainer={{ flex: 0.1 }}
        selectedDate={configDate.dateChoose}
        scrollToOnSetSelectedDate={false}
        onDateSelected={date => {
          LoadData(date);
        }}
      />
      <LoadingView
        isLoading={refreshing}
        title={'Đang cập nhật dữ liệu'}
        styles={{ zIndex: 12, marginTop: 8 }}
      />
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={(_, index) => index.toString()}
        data={dataAttendant.mData}
        renderItem={renderItem}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={LoadData} />
        }
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
      />
      <ActionSheet
        ref={filterSheet}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <ViewFilterSheet
          appcolor={appcolor}
          filterSheet={filterSheet}
          filterDataBy={filterDataBy}
          groupType={groupType}
        />
      </ActionSheet>
    </View>
  );
};

const ViewFilterSheet = ({
  appcolor,
  filterSheet,
  filterDataBy,
  groupType,
}) => {
  return (
    <View
      style={{
        height: deviceHeight / 3,
        backgroundColor: appcolor.light,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <Text
          style={{
            fontSize: 21,
            padding: 8,
            fontWeight: '700',
            color: appcolor.dark,
            textAlign: 'center',
          }}
        >
          Chế độ xem
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 5,
            width: deviceWidth * 0.9,
            borderRadius: 50,
            backgroundColor:
              groupType === 'EMPLOYEE' ? appcolor.surface : appcolor.light,
          }}
          onPress={() => filterDataBy('EMPLOYEE')}
        >
          <Text
            style={{
              fontSize: 16,
              margin: 5,
              padding: 5,
              fontWeight: '700',
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Theo nhân viên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 5,
            width: deviceWidth * 0.9,
            borderRadius: 50,
            backgroundColor:
              groupType === 'SHOP' ? appcolor.surface : appcolor.light,
          }}
          onPress={() => filterDataBy('SHOP')}
        >
          <Text
            style={{
              fontSize: 16,
              margin: 5,
              padding: 8,
              fontWeight: '700',
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Theo cửa hàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 5,
            width: deviceWidth * 0.9,
            borderRadius: 50,
            backgroundColor:
              groupType === 'POSITION' ? appcolor.surface : appcolor.light,
          }}
          onPress={() => filterDataBy('POSITION')}
        >
          <Text
            style={{
              fontSize: 16,
              margin: 5,
              padding: 11,
              fontWeight: '700',
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Theo chức vụ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const renderItemPhoto = (item, index, showPhoto, appcolor) => {
  const _imageUri = item?.AttendantPhoto?.includes('https')
    ? item.AttendantPhoto
    : `${URLDEFAULT}${item.AttendantPhoto}`;
  return (
    <View
      key={`idx_photo_${index}`}
      style={{ width: '49%', marginRight: 7, alignSelf: 'center' }}
    >
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          backgroundColor: appcolor.lightgray,
        }}
      >
        <TouchableOpacity onPress={() => showPhoto(index)}>
          <Image
            source={{ uri: _imageUri }}
            style={{ width: 180, height: 120, borderRadius: 5 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <Text
          style={{ fontWeight: '600', marginTop: 3, color: appcolor.danger }}
        >
          {item.AttendantType}
        </Text>
        <Text style={{ fontWeight: '500', color: appcolor.info }}>
          {item.Distance}
        </Text>
        <Text style={{ fontWeight: '600', color: appcolor.dark }}>
          {item.AttendentTime}
        </Text>
      </View>
    </View>
  );
};
const PhotoAttendant = ({ lstPhoto, showPhoto }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lstPhoto}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) =>
          renderItemPhoto(item, index, showPhoto, appcolor)
        }
        removeClippedSubviews={true}
        numColumns={2}
      />
    </View>
  );
};
const ModalShowImage = ({ imageList, imageIndex, actionClose, appcolor }) => {
  imageList.map(it => (it.photoPath = it.AttendantPhoto));
  return (
    <View style={{ width: '100%', height: '100%', borderRadius: 5 }}>
      <MultipleShowImage
        key={'ShowItemImage'}
        listItem={imageList}
        closeShowImage={actionClose}
        indexItem={imageIndex}
      />
    </View>
  );
};

export default AttendantResult;
