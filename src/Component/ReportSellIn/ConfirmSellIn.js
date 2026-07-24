import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';
import { Calendar } from 'react-native-calendars';
import FormGroup from '../../Content/FormGroup';
import { Icon } from '@rneui/themed';
import { groupDataByKey } from '../../Core/Helper';
// import  { NumericFormat } from "react-number-format";
import { getSellInByServer } from '../../Controller/SellInController';
import { LoadingView } from '../../Control/ItemLoading';
import { deviceHeight } from '../Home';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ConfirmSellIn = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const bottomSheet = useRef();
  const [search, setSearch] = useState('');
  const [data, setData] = useState({
    dataShow: [],
    dataShowF: [],
    dataSellIn: [],
  });
  const [showProgress, setProgress] = useState(false);
  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [moment(new Date()).format('YYYYMMDD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    markingTypeDefault: 'custom',
    markingType: 'custom',
    markedDates: {
      [moment(new Date()).format('YYYYMM01').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.yellowdark,
      },
    },
    isStartDay: false,
    isEndDay: false,
    startDate: '',
    endDate: '',
  });
  const loadData = async (fromDate, toDate) => {
    await setProgress(true);
    const json = {
      ShopId: workinfo?.shopId || 0,
      FromDate: fromDate || moment(new Date()).format('YYYYMM01'),
      ToDate: toDate || moment(new Date()).format('YYYYMMDD'),
    };
    await getSellInByServer(json, async mData => {
      const { arr } = groupDataByKey({
        arr: mData,
        key: 'workDate',
      });
      groupData(arr);
    });
    await setProgress(false);
  };
  const groupData = data => {
    let dataGroup = [];
    data.map(it => {
      if (it.isParent) {
        let dataByDate = [];
        data.map(item => {
          item.workDate === it.workDate && dataByDate.push({ ...item });
        });
        // let dataSort = dataByShopId.sort((a, b) => a.orderDate - b.orderDate)
        // const { arr } = groupDataByKey({
        //     arr: dataByDate,
        //     key: 'workDate',
        // })
        dataGroup = [
          ...dataGroup,
          {
            date: it.date,
            workDate: it.workDate,
            dataByDate: dataByDate,
          },
        ];
      }
    });
    setData({ dataShow: dataGroup, dataShowF: dataGroup, dataSellIn: data });
  };
  useEffect(() => {
    loadData();
    return () => false;
  }, []);
  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      if (
        dataCalendar.startDate === dateString ||
        dateString < dataCalendar.startDate
      ) {
        await setDataCalendar({
          markedDates: dataCalendar.markedDatesDefault,
          markingType: dataCalendar.markingTypeDefault,
          isStartDay: false,
          isEndDay: false,
          startDate: '',
          endDate: '',
        });
      }
      if (!dataCalendar.isStartDay) {
        const markedDates = {};
        markedDates[dateString] = {
          startingDay: true,
          color: '#ffa500',
          textColor: appcolor.dark,
        };
        await setDataCalendar({
          ...dataCalendar,
          markedDates: markedDates,
          markingType: 'period',
          isStartDay: true,
          isEndDay: false,
          startDate: dateString,
          endDate: '',
        });
      } else {
        const markedDates = dataCalendar.markedDates;
        //
        let startDate = moment(dataCalendar.startDate);
        let endDate = moment(dateString);
        let range = endDate.diff(startDate, 'days');

        if (range > 0) {
          for (let i = 1; i <= range; i++) {
            let tempDate = startDate.add(1, 'day');
            tempDate = moment(tempDate).format('YYYY-MM-DD');
            if (i < range) {
              markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
            } else {
              markedDates[tempDate] = {
                endingDay: true,
                color: '#ffa500',
                textColor: 'white',
              };
            }
          }
          await setDataCalendar({
            ...dataCalendar,
            markedDates: markedDates,
            markingType: 'period',
            isStartDay: false,
            isEndDay: true,
            startDate: dataCalendar.startDate,
            endDate: moment(dateString).format('YYYY-MM-DD'),
          });
        }
      }
    } else {
      await setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
        markingType: dataCalendar.markingTypeDefault,
        isStartDay: false,
        isEndDay: false,
        startDate: '',
        endDate: '',
      });
    }
  };
  const filterItem = async text => {
    if (text !== null && text.length > 0) {
      let dataFilter = [];
      await data.dataShowF.map(it => {
        let result = it.dataByDate.filter(item => {
          const nameProduct = item.productName
            ? item.productName.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return nameProduct.indexOf(textData) > -1;
        });
        dataFilter = [
          ...dataFilter,
          {
            date: it.date,
            workDate: it.workDate,
            dataByDate: result,
          },
        ];
      });
      data.dataShow = dataFilter;
      setSearch(text);
    } else {
      data.dataShow = data.dataShowF;
      setSearch(text);
    }
  };
  const selectItem = () => {
    bottomSheet.current.show();
  };
  const loadDataByDate = () => {
    loadData(
      moment(dataCalendar.startDate || new Date()).format('YYYYMM01'),
      moment(
        dataCalendar.endDate
          ? dataCalendar.endDate
          : dataCalendar.startDate
          ? dataCalendar.startDate
          : new Date(),
      ).format('YYYYMMDD'),
    );
    setSearch('');
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={'Chi tiết đơn hàng'}
        iconRight="cloud-upload-alt"
        leftFunc={() => navigation.goBack()}
      />
      <View style={{ padding: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            padding: 5,
            color: appcolor.dark,
          }}
        >
          Chọn ngày :
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{
              height: 40,
              width: '85%',
              alignItems: 'center',
              padding: 8,
              justifyContent: 'center',
              backgroundColor: appcolor.light,
              borderWidth: 0.5,
              borderColor: '#bbb',
              borderRadius: 10,
            }}
            onPress={selectItem}
          >
            <Text style={{ color: appcolor.dark, fontSize: 14 }}>
              {moment(dataCalendar.startDate || new Date()).format(
                '01/MM/yyyy',
              ) +
                ` - ` +
                moment(
                  dataCalendar.endDate
                    ? dataCalendar.endDate
                    : dataCalendar.startDate
                    ? dataCalendar.startDate
                    : new Date(),
                ).format('DD/MM/yyyy')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 40,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              backgroundColor: appcolor.light,
              borderWidth: 0.5,
              borderColor: '#bbb',
              borderRadius: 10,
            }}
            onPress={loadDataByDate}
          >
            <SpiralIcon
              name="search"
              type="font-awesome"
              size={18}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8 }}>
        <FormGroup
          containerStyle={{
            backgroundColor: appcolor.grayLight,
            margin: 8,
            padding: 3,
            paddingEnd: 8,
            borderWidth: 0.2,
            borderColor: appcolor.graydark,
          }}
          inputStyle={{ fontSize: 13, color: appcolor.dark }}
          placeholder="Tìm kiếm sản phẩm"
          editable
          iconName="search"
          onClearTextAndroid={filterItem}
          value={search}
          handleChangeForm={filterItem}
        />
        <View style={{ flex: 1 }}>
          {!showProgress && (
            <FlatList
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{}}
              key={item => item.id}
              keyExtractor={(item, index) => item + index}
              data={data.dataShow}
              initialNumToRender={10}
              // updateCellsBatchingPeriod={20}
              removeClippedSubviews={true}
              windowSize={10}
              renderItem={({ item, index }) => (
                <RenderItemByShop
                  item={item}
                  index={index}
                  appcolor={appcolor}
                  data={data}
                />
              )}
            />
          )}
        </View>
      </View>
      {showProgress && (
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: deviceHeight / 2,
          }}
        >
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={showProgress}
            styles={{ marginTop: 8 }}
          />
        </View>
      )}
      <ActionSheet
        ref={bottomSheet}
        containerStyle={{
          backgroundColor: appcolor.grayLight,
          padding: 5,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
        defaultOverlayOpacity={0.3}
      >
        <View style={{ padding: 8, marginBottom: 20 }}>
          <Calendar
            firstDay={1}
            current={moment().format('yyyy-MM-DD')}
            monthFormat={'MM - yyyy'}
            hideExtraDays={true}
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            theme={{
              backgroundColor: appcolor.light,
              calendarBackground: appcolor.light,
              todayTextColor: appcolor.highlightDate,
              selectedDayTextColor: 'blue',
              dayTextColor: appcolor.dark,
              monthTextColor: appcolor.dark,
            }}
            markingType={dataCalendar.markingType}
            markedDates={dataCalendar.markedDates}
            onDayPress={handlerSelectCalendar}
          />
        </View>
      </ActionSheet>
    </View>
  );
};
const RenderItemByShop = ({ item, index, appcolor, data }) => {
  const [isShowItem, setShowItem] = useState(false);
  return item.dataByDate.length > 0 ? (
    <View style={{ backgroundColor: appcolor.surface, paddingBottom: 10 }}>
      <TouchableOpacity
        onPress={() => setShowItem(e => !e)}
        style={{
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: appcolor.primary,
          borderRadius: 10,
        }}
      >
        <SpiralIcon
          name={isShowItem ? 'chevron-down' : 'chevron-right'}
          type="font-awesome"
          size={18}
          style={{
            height: 25,
            width: 25,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          color={appcolor.white}
        />
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            paddingLeft: 10,
            color: appcolor.white,
          }}
        >
          {item.date}
        </Text>
      </TouchableOpacity>
      {isShowItem && (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{}}
          key={item => item.id}
          keyExtractor={(item, index) => item + index}
          data={item.dataByDate}
          initialNumToRender={10}
          // updateCellsBatchingPeriod={20}
          removeClippedSubviews={true}
          windowSize={10}
          renderItem={({ item, index }) => (
            <RenderItemOrder
              item={item}
              index={index}
              appcolor={appcolor}
              data={data}
            />
          )}
        />
      )}
    </View>
  ) : (
    <View></View>
  );
};
const RenderItemOrder = ({ item, index, appcolor, data }) => {
  const [_, setMutate] = useState(false);
  return (
    <View style={{ padding: 5, backgroundColor: appcolor.surface }}>
      <View
        style={{ backgroundColor: appcolor.light, padding: 5, borderRadius: 8 }}
      >
        <View
          style={{
            flexDirection: 'row',
            padding: 5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}
          >
            Số hoá đơn : {item.orderNo}
          </Text>
        </View>
        <Text
          style={{
            fontWeight: '600',
            fontSize: 14,
            paddingLeft: 5,
            color: appcolor.dark,
          }}
        >
          NPP : {item.dealerName}
        </Text>
        <View style={{ padding: 5, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 13,
                color: appcolor.dark,
                width: '50%',
              }}
            >
              Tên sản phẩm :
            </Text>
            <View
              style={{
                width: '50%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              {item.quantityValue && (
                <Text
                  style={{
                    fontSize: 13,
                    color: appcolor.dark,
                    width: '40%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Số lượng
                </Text>
              )}

              {item.price !== null && (
                <Text
                  style={{
                    fontSize: 13,
                    color: appcolor.dark,
                    width: '60%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Giá NPP
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ width: '50%', paddingRight: 5 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: appcolor.dark,
                }}
              >
                {item.productName}
              </Text>
            </View>
            <View
              style={{
                width: '50%',
                flexDirection: 'row',
                paddingTop: 5,
                justifyContent: 'flex-end',
              }}
            >
              {item.quantityValue && (
                <View style={{ width: '40%', alignItems: 'center' }}>
                  <NumericFormat
                    value={item.quantityValue || ''}
                    displayType="text"
                    thousandSeparator={true}
                    renderText={value => (
                      <Text
                        style={{
                          fontSize: 12,
                          color: appcolor.dark,
                          backgroundColor: appcolor.light,
                          borderWidth: 0.5,
                          fontWeight: '500',
                          textAlign: 'center',
                          borderWidth: 0.5,
                          borderRadius: 7,
                          padding: 5,
                          borderColor: appcolor.greydark,
                          height: 25,
                          left: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        {value}
                      </Text>
                    )}
                  />
                </View>
              )}
              {item.price !== null && (
                <View
                  style={{ width: '60%', alignItems: 'center', paddingLeft: 5 }}
                >
                  <NumericFormat
                    value={
                      item.price === null || item.price === undefined
                        ? ''
                        : item.price
                    }
                    displayType="text"
                    thousandSeparator={true}
                    renderText={value => (
                      <Text
                        style={{
                          fontSize: 12,
                          color: appcolor.dark,
                          backgroundColor: appcolor.light,
                          borderWidth: 0.5,
                          fontWeight: '500',
                          textAlign: 'center',
                          borderWidth: 0.5,
                          borderRadius: 7,
                          padding: 5,
                          borderColor: appcolor.greydark,
                          height: 25,
                          left: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        {value}
                      </Text>
                    )}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
