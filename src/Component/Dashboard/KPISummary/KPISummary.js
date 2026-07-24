import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  Text,
  UIManager,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { GetDataKPISummary } from '../../../Controller/KPIController';
import FormGroup from '../../../Content/FormGroup';
import { YearMonthSelected } from '../../../Control/YearMonthSelected';
import {
  deviceHeight,
  deviceWidth,
  scaleSize,
} from '../../../Themes/AppsStyle';
import moment from 'moment';
import { DATE } from '../../BusinessTrips/UtilityBusiness';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Divider, Icon } from '@rneui/base';
import { SafeAreaView } from 'react-native';
import { LoadingView } from '../../../Control/ItemLoading';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const KPISummary = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({ dataCalendar: [], dataMain: [] });
  const [loading, setLoading] = useState(false);
  const [dataModal, setDataModal] = useState({
    visible: false,
    dataShow: {},
    dayShow: 0,
    indexData: 0,
  });
  const [itemPressConfig, setItemPressConfig] = useState({
    pressMode: 'PRESS',
    showSheet: false,
  });
  const [itemCheck, setItemCheck] = useState([]);
  const [_mutate, setMutate] = useState(false);

  var [filter, setFilter] = useState({
    loadYearMonth: false,
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });

  const LoadData = async () => {
    await setLoading(true);
    const result = await GetDataKPISummary(filter.month, filter.year);
    if (result.statusId === 200) {
      await setData({ dataCalendar: result.data, dataMain: result.data });
    }
    await setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);

  // handlePressItem
  const onPressDay = (item, index) => {
    setDataModal({
      visible: true,
      dayShow: item.dayInt,
      dataShow: item,
      indexData: index,
    });
  };
  const onLongPress = item => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const value = itemPressConfig.pressMode == 'PRESS' ? 'LONG' : 'PRESS';
    itemPressConfig.pressMode = value;

    if (value == 'LONG') {
      item.isCheck = 1;
      setItemCheck([item]);
    } else {
      let dataUncheck = [];
      for (let index = 0; index < (data.dataCalendar?.length || 0); index++) {
        let itT = data.dataCalendar[index];
        dataUncheck.push({ ...itT, isCheck: 0 });
      }
      data.dataCalendar = dataUncheck;
      setItemCheck([]);
    }
  };
  const onLongMode = item => {
    const value = item.isCheck == 1 ? 0 : 1;
    item.isCheck = value;
    let listSelect = [...itemCheck];
    if (value == 1) {
      listSelect = [...listSelect, { ...item }];
    } else {
      listSelect = listSelect.filter(it => it.dayInt !== item.dayInt);
    }
    setItemCheck(listSelect);
  };

  // handleSelectMonth
  const showSelectYearMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter({
      ...filter,
      loadYearMonth: filter.loadYearMonth ? false : true,
    });
  };
  const onFilterChange = searchInfo => {
    filter = { ...filter, ...searchInfo };
    setFilter(filter);
  };
  const handlerChooseMonth = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    filter.loadYearMonth = false;
    await LoadData();
  };

  // Handle Bottom Sheet
  const closeBottomSheet = () => {
    setDataModal({ visible: false, dataShow: [], dayShow: 0, indexData: 0 });
  };
  const handleCheckDetail = () => {
    itemPressConfig.showSheet = true;
    setMutate(e => !e);
    SheetManager.show('SheetKPISummary');
  };

  // View item calendar
  const dayItem = ({ item, index }) => {
    const _widthItem = deviceWidth / 7 - 10;
    const _minHeight = deviceHeight / 6 - 20;
    const titleDate =
      item.titleDate !== undefined &&
      item.titleDate !== null &&
      item.titleDate?.length > 0
        ? item.titleDate
        : '';

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
          onPress={() =>
            item.enableDay === 1
              ? itemPressConfig.pressMode == 'PRESS'
                ? onPressDay(item)
                : onLongMode(item)
              : null
          }
          onLongPress={() => onLongPress(item)}
          style={{ minHeight: _minHeight }}
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
          {titleDate !== '' && (
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: appcolor.dark,
                borderRadius: 20,
                padding: 3,
                margin: 2,
              }}
            >
              <Text style={{ textAlign: 'center', color: appcolor.white }}>
                {titleDate}
              </Text>
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
            {item.note}
          </Text>
          {itemPressConfig.pressMode == 'LONG' && (
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
              color={item.isCheck ? appcolor.success : appcolor.dark}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: appcolor.light, flex: 1 }}>
      <HeaderCustom
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
        title={kpiinfo?.menuNameVN || 'Đăng ký lịch tháng'}
      />
      <FormGroup
        containerStyle={{ padding: 5, margin: 8 }}
        inputStyle={{ fontSize: 14, fontWeight: '400', color: appcolor.dark }}
        iconRight="calendar-alt"
        value={`Tháng ${filter.month} - Năm ${filter.year}`}
        rightFunc={showSelectYearMonth}
      />
      {filter.loadYearMonth && (
        <View style={{ height: 210 }}>
          <YearMonthSelected
            option={filter}
            onYearMonth={search => onFilterChange(search)}
            numMonth={4}
          />
          <TouchableOpacity
            onPress={() => handlerChooseMonth()}
            style={{
              marginBottom: 12,
              borderTopWidth: 0.31,
              borderTopColor: appcolor.primary,
            }}
          >
            <Text
              style={{
                padding: 12,
                textAlign: 'center',
                color: appcolor.primary,
              }}
            >
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      {itemPressConfig.pressMode == 'LONG' && (
        <View
          style={{
            flexDirection: 'row',
            padding: 12,
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => handleCheckDetail()}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
              paddingHorizontal: 16,
              backgroundColor: appcolor.grayLight,
              borderRadius: 4,
            }}
          >
            <SpiralIcon
              type="font-awesome-5"
              name={'not-equal'}
              size={18}
              color={appcolor.primary}
            />
            <Text
              style={{ fontWeight: '600', fontSize: 16, color: appcolor.dark }}
            >
              Xem
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ backgroundColor: appcolor.light, flex: 1 }}>
        <FlatList
          data={data.dataCalendar}
          numColumns={7}
          ListHeaderComponent={<WeekItem />}
          renderItem={dayItem}
          ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
        />
      </View>
      <Modal
        animationType="slide"
        style={{ flex: 1 }}
        visible={dataModal.visible}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
          <TouchableOpacity
            onPress={() => closeBottomSheet()}
            style={{
              position: 'absolute',
              right: 20,
              top: Platform.OS == 'ios' ? 40 : 20,
              zIndex: 100,
              borderRadius: 5,
              borderWidth: 1,
              padding: 3,
              paddingHorizontal: 10,
              borderColor: appcolor.primary,
            }}
          >
            <Text
              style={{
                fontWeight: '400',
                fontSize: 18,
                color: appcolor.primary,
              }}
            >
              Đóng
            </Text>
          </TouchableOpacity>
          <View style={{ paddingTop: 50 }}>
            <Text
              style={{
                textAlign: 'center',
                padding: 7,
                fontSize: scaleSize(14),
                fontWeight: 'bold',
                color: appcolor.primary,
              }}
            >
              Bạn đang xem KPI ngày{' '}
              {moment(dataModal.dayShow, 'YYYYMMDD').format(
                'dddd DD MMM, YYYY',
              )}
            </Text>
            <ViewSummary dataItem={dataModal.dataShow} appcolor={appcolor} />
          </View>
          {JSON.parse(dataModal.dataShow.listEmployees || '[]').length > 0 && (
            <ViewListEmployees dataItem={dataModal.dataShow} />
          )}
        </SafeAreaView>
      </Modal>
      {itemPressConfig.showSheet == true && (
        <ActionSheet
          id={'SheetKPISummary'}
          initialOffsetFromBottom={0.6}
          statusBarTranslucent
          gestureEnabled
          onClose={() => itemPressConfig.showSheet == false}
          drawUnderStatusBar={Platform.OS == 'ios'}
          containerStyle={{ paddingBottom: insets.bottom }}
        >
          {itemCheck?.length > 0 && <ViewCompareDate itemCheck={itemCheck} />}
        </ActionSheet>
      )}
    </View>
  );
};
const ViewListEmployees = ({ dataItem }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    listEmployee: JSON.parse(dataItem.listEmployees || '[]'),
    listEmployeeF: JSON.parse(dataItem.listEmployees || '[]'),
  });
  const [search, setSearch] = useState('');
  const [_, setMutate] = useState(false);

  const onPressShow = item => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.isShowDetail = item.isShowDetail ? false : true;
    setMutate(e => !e);
  };

  const contains = (employee, query) => {
    const { EmployeeName, EmployeeCode } = employee;
    let SEmployeeName =
      EmployeeName === null ? EmployeeName : EmployeeName?.toLowerCase();
    let SEmployeeCode =
      EmployeeCode === null ? EmployeeCode : EmployeeCode?.toLowerCase();
    if (SEmployeeName?.includes(query) || SEmployeeCode?.includes(query)) {
      return true;
    }
    return false;
  };
  const handleSearch = text => {
    const formattedQuery = text.toLowerCase();
    const filteredData = _.filter(data.listEmployeeF, employee => {
      return contains(employee, formattedQuery);
    });

    setSearch(text);
    if (formattedQuery === undefined || formattedQuery === '') {
      data.listEmployee = data.listEmployeeF;
    } else data.listEmployee = filteredData;
    setMutate(e => !e);
  };

  const renderItemEmployees = ({ item, index }) => {
    return (
      <View
        key={item.EmployeeId + '_' + dataItem.dayInt + '_' + index}
        style={{ width: '100%', padding: 4 }}
      >
        <TouchableOpacity
          onPress={() => onPressShow(item)}
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            padding: 4,
            backgroundColor: appcolor.surface,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          <View style={{ justifyContent: 'center', width: '80%' }}>
            <Text
              style={{ fontWeight: '500', fontSize: 15, color: appcolor.dark }}
            >
              {index + 1}. {item.EmployeeName} - {item.EmployeeCode}
            </Text>
          </View>
          <View
            style={{
              padding: 10,
              width: '20%',
              flexDirection: 'row',
              justifyContent:
                item.TitleDate?.length > 0 ? 'space-between' : 'flex-end',
            }}
          >
            {item.TitleDate?.length > 0 && (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  color: appcolor.dark,
                }}
              >
                ({item.TitleDate || 0})
              </Text>
            )}
            <SpiralIcon
              name={item.isShowDetail ? 'chevron-down' : 'chevron-right'}
              type="font-awesome-5"
              size={20}
              color={appcolor.dark}
            />
          </View>
        </TouchableOpacity>
        {/*  */}
        <View
          style={{
            width: '100%',
            display: item.isShowDetail ? 'flex' : 'none',
            zIndex: 10,
          }}
        >
          <ViewSummary dataItem={item} appcolor={appcolor} />
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: 'center',
          width: '100%',
          padding: 12,
          flexDirection: 'row',
        }}
      >
        <SpiralIcon
          name={'users'}
          type="font-awesome-5"
          size={20}
          color={appcolor.primary}
        />
        <Text
          style={{ fontWeight: '600', fontSize: 16, color: appcolor.primary }}
        >
          {' '}
          Số lượng nhân viên: {data?.listEmployee?.length || 0}
        </Text>
      </View>
      <FormGroup
        editable
        containerStyle={{
          backgroundColor: appcolor.surface,
          padding: 5,
          margin: 8,
        }}
        inputStyle={{ fontSize: 14 }}
        placeholder={`Tìm kiếm`}
        iconName="search"
        value={search}
        handleChangeForm={handleSearch}
      />
      <FlatList
        key={`${dataItem.dayInt}_List`}
        keyExtractor={(_item, index) => index.toString()}
        data={data.listEmployee}
        removeClippedSubviews={true}
        initialNumToRender={10}
        extraData={data.listEmployee}
        updateCellsBatchingPeriod={100}
        windowSize={10}
        renderItem={renderItemEmployees}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
      />
    </View>
  );
};
const ViewSummary = ({ dataItem, appcolor }) => {
  return (
    <View
      style={{
        padding: 4,
        borderRadius: 4,
        borderColor: appcolor.dark,
        borderWidth: 0.5,
        margin: 4,
      }}
    >
      <View style={{ flexDirection: 'row', padding: 2, alignItems: 'center' }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 14,
            color: appcolor.dark,
            padding: 2,
          }}
        >
          {dataItem?.countStoreTitle}
        </Text>
      </View>
      <Text
        style={{
          fontWeight: '500',
          fontSize: 14,
          color: appcolor.dark,
          padding: 2,
        }}
      >
        {dataItem?.countReportTitle}
      </Text>
      <Text
        style={{
          fontWeight: '500',
          fontSize: 14,
          color: appcolor.dark,
          padding: 2,
        }}
      >
        {dataItem?.countSellTitle}
      </Text>
      <Text
        style={{
          fontWeight: '500',
          fontSize: 14,
          color: appcolor.dark,
          padding: 2,
        }}
      >
        {dataItem?.totalAmountTitle}
      </Text>
      <Text
        style={{
          fontWeight: '500',
          fontSize: 14,
          color: appcolor.dark,
          padding: 2,
        }}
      >
        {dataItem?.averageTitle}
      </Text>
      <Text
        style={{
          fontWeight: '500',
          fontSize: 14,
          color: appcolor.dark,
          padding: 2,
        }}
      >
        {dataItem?.storeSellNewTitle}
      </Text>
    </View>
  );
};

const ViewCompareDate = ({ itemCheck }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const renderItemCheck = (item, index) => {
    return (
      <View key={'keyView_' + index} style={{ flex: 1 }}>
        <View
          key={'keyItemCheck_' + index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
          }}
        >
          <View
            style={{
              width: '20%',
              alignItems: 'center',
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: appcolor.dark,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {moment(item.date).format('D/M')}
            </Text>
          </View>
          <View
            style={{
              width: '15%',
              alignItems: 'center',
              padding: 2,
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 10,
                color: appcolor.dark,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {item.countStoreDay || 0}
              {item.targetStoreDay !== undefined &&
              item.targetStoreDay !== null &&
              item.targetStoreDay > 0
                ? '/' + item.targetStoreDay
                : ''}
            </Text>
          </View>
          <View
            style={{
              width: '15%',
              alignItems: 'center',
              padding: 2,
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 10,
                color: appcolor.dark,
                paddingTop: 4,
                paddingBottom: 4,
                zIndex: 1000,
              }}
            >
              {item.countSellDay || 0}
            </Text>
          </View>
          <View
            style={{
              width: '25%',
              alignItems: 'center',
              padding: 2,
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 10,
                color: appcolor.dark,
                textAlign: 'center',
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {item.totalAmountByDay || 0}
            </Text>
          </View>
          <View style={{ width: '25%', alignItems: 'center', padding: 2 }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 10,
                color: appcolor.dark,
                textAlign: 'center',
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {item.averageByDay || 0}
            </Text>
          </View>
        </View>
        <Divider
          key={'ItemCheck' + index.toString()}
          style={{
            backgroundColor: appcolor.grayLight,
            height: 1,
            width: '100%',
          }}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 8 }}>
      <View style={{ alignItems: 'center', paddingTop: 12, padding: 8 }}>
        <View
          key="e92"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <View
            style={{
              width: '20%',
              alignItems: 'center',
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '700',
                paddingBottom: 8,
              }}
            >{`Ngày`}</Text>
          </View>
          <View
            style={{
              width: '15%',
              alignItems: 'center',
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '700',
                paddingBottom: 8,
              }}
            >{`Shop`}</Text>
          </View>
          <View
            style={{
              width: '15%',
              alignItems: 'center',
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '700',
                paddingBottom: 8,
              }}
            >{`Đơn`}</Text>
          </View>
          <View
            style={{
              width: '25%',
              alignItems: 'center',
              borderRightWidth: 0.5,
              borderRightColor: appcolor.dark,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '700',
                paddingBottom: 8,
              }}
            >{`Doanh thu`}</Text>
          </View>
          <View style={{ width: '25%', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: '700',
                paddingBottom: 8,
              }}
            >{`Bình quân`}</Text>
          </View>
        </View>
        <Divider
          key={'ItemCheckDefault'}
          style={{
            backgroundColor: appcolor.grayLight,
            height: 1,
            width: '100%',
          }}
        />

        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        >
          {itemCheck.map((it, idx) => {
            return renderItemCheck(it, idx);
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
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
