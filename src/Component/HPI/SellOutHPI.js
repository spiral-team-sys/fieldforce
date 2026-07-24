import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { _competitorId } from '../../Core/URLs';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { SelloutAPI } from '../../API/SelloutAPI';
import { MessageAction, ToastError, ToastSuccess } from '../../Core/Helper';
import GmailStyleSwipeableRow from '../../Core/GmailStyleSwipeableRow';
import moment from 'moment';
import { LoadingView } from '../../Control/ItemLoading';
import { alertWarning } from '../../Core/Utility';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const styles = StyleSheet.create({
  separator: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
  },
});

const SellOutHPI = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [sodate, setDate] = useState(workinfo.workDate);
  const [Sellouts, setSellouts] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    markedDates: {
      [moment(new Date()).format('YYYY-MM-DD').toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    reportDate: '',
  });

  const onLoad = async () => {
    await setShowProgress(true);
    const result = await SelloutAPI.GetbyShop(workinfo.shopId, sodate);
    if (result.statusId === 200) await setSellouts(result.data);
    else {
      await ToastError(result.messager);
    }
    await setShowProgress(false);
  };
  useEffect(() => {
    const load = onLoad();
    return () => {
      load;
    };
  }, []);
  const onSearch = () => {
    SheetManager.show('sheetFilter');
  };
  const handleShowItem = item => {
    navigation.navigate('sellouthpinput', { ItemSaved: item, onLoad: onLoad });
  };
  const deleteItemSellOut = async item => {
    MessageAction('Bạn có chắc chắn muốn xoá số bán này?', async () => {
      const custlist = JSON.parse(item.customerInfo || '[]');
      const sellOutdetail = {
        ProductId: item.productId,
        ProductCode: item.productCode,
        CustName: item.contactName,
        CustPhone: item.phone,
        CustAddress: item.address,
        Quantity: 1,
        Note: item.note,
        IMEI1: item.imeI1,
        IsDelete: 1,
        Id: item.id,
      };
      const sopost = {
        ShopId: workinfo.shopId,
        SellDate: moment().format('YYYY-MM-DD'),
        Details: JSON.stringify([sellOutdetail]),
        Photos: item.customerInfo,
      };
      const result = await SelloutAPI.PostSellOut(sopost);
      if (result.status == 200) {
        onLoad();
        ToastSuccess('Xoá dữ liệu bán hàng thành công!!');
      } else ToastError(result.messeger);
    });
  };
  const SOItem = ({ item, index }) => {
    // console.log(item)
    return (
      <GmailStyleSwipeableRow
        key={`kj${index}12`}
        enableRight={false}
        deleteItem={() => deleteItemSellOut(item)}
      >
        <TouchableOpacity
          onPress={() => handleShowItem(item)}
          key={`${index}as`}
          style={{
            flex: 1,
            backgroundColor: appcolor.success,
            margin: 5,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              width: '90%',
              borderRadius: 8,
              padding: 5,
              backgroundColor: appcolor.surface,
              marginBottom: 2,
            }}
          >
            <View style={{ padding: 1 }}>
              {item.contactName && (
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: '500',
                    fontSize: 12,
                    padding: 1,
                  }}
                >
                  Khách hàng : {item.contactName || ''}
                </Text>
              )}
              {item.phone && (
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: '500',
                    fontSize: 12,
                    padding: 1,
                  }}
                >
                  Số điện thoại : {item.phone | ''}
                </Text>
              )}
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', padding: 1 }}
            >
              {item.productCode && (
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: '500',
                    fontSize: 12,
                  }}
                >
                  Mã :{item.productCode}
                  {`${item.category && ` - Ngành hàng : ${item.category}`}`}
                </Text>
              )}
            </View>
            {item?.segment && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '500',
                  fontSize: 12,
                  padding: 1,
                }}
              >{`Loại ${item?.segment}`}</Text>
            )}
            {item?.subSegment && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '500',
                  fontSize: 12,
                  padding: 1,
                }}
              >{`Model ${item?.subSegment}`}</Text>
            )}
            {item.imeI1 !== null && item.imeI1 !== '' && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '500',
                  fontSize: 12,
                  padding: 1,
                }}
              >{`IMEI : ${item?.imeI1}`}</Text>
            )}
            {item.price !== null &&
              item.quantity !== undefined &&
              item.price !== '' && (
                <Text
                  style={{
                    color: appcolor.dark,
                    fontWeight: '500',
                    fontSize: 12,
                    padding: 1,
                  }}
                >{`Giá : ${item?.price} VNĐ`}</Text>
              )}
            {item?.note && (
              <Text
                style={{
                  color: appcolor.dark,
                  fontWeight: '500',
                  fontSize: 12,
                  padding: 1,
                }}
              >{`Ghi chú ${item?.note}`}</Text>
            )}
          </View>
          {item.quantity !== undefined && item.quantity !== null && (
            <View
              style={{
                width: '10%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: appcolor.white,
                  fontWeight: '500',
                  fontSize: 14,
                }}
              >
                {item.quantity || 0}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </GmailStyleSwipeableRow>
    );
  };
  // handle select date when change working status
  const handlerSelectCalendar = async date => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      const markedDates = {};
      markedDates[dateString] = {
        selected: true,
        selectedColor: appcolor.primary,
        textColor: appcolor.white,
      };
      await setDataCalendar({
        ...dataCalendar,
        markedDates: markedDates,
      });
      await setDate(moment(dateString).format('YYYYMMDD'));
    } else {
      await setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
      });
    }
  };
  const filterByDate = () => {
    onLoad();
    SheetManager.hide('sheetFilter');
  };
  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
    <View
      style={{ height: '100%', width: '100%', backgroundColor: appcolor.light }}
    >
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={`Báo cáo số bán ${moment(
          sodate?.toString() || new Date(),
        ).format('yyyy/MM/DD')}`}
        iconRight={'filter'}
        rightFunc={onSearch}
      />
      {showProgress && (
        <LoadingView
          title={'Đang tải dữ liệu...'}
          isLoading={showProgress}
          styles={{ marginTop: 8 }}
        />
      )}
      <SpiralIcon
        color={appcolor.primary}
        onPress={() =>
          navigation.navigate('sellouthpinput', { onLoad: onLoad })
        }
        size={45}
        name="add-circle-outline"
        containerStyle={{
          position: 'absolute',
          bottom: 10,
          zIndex: 100,
          right: 20,
        }}
        type="ionicon"
      />
      {!showProgress && (
        <FlatList
          data={Sellouts}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={SOItem}
          keyExtractor={(item, index) => `a2o${index}`}
        />
      )}
      <ActionSheet
        id="sheetFilter"
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ paddingVertical: 10 }}>
          <Calendar
            firstDay={1}
            current={moment(sodate?.toString() || new Date()).format(
              'yyyy-MM-DD',
            )}
            maxDate={moment(new Date()).format('yyyy-MM-DD')}
            monthFormat={'MM - yyyy'}
            hideExtraDays={true}
            theme={{
              backgroundColor: appcolor.light,
              calendarBackground: appcolor.surface,
              todayTextColor: appcolor.highlightDate,
              selectedDayTextColor: appcolor.white,
              dayTextColor: appcolor.dark,
              monthTextColor: appcolor.dark,
            }}
            markedDates={dataCalendar.markedDates}
            onDayPress={date => handlerSelectCalendar(date)}
          />
          <View
            style={{
              paddingBottom: 30,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => filterByDate()}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                backgroundColor: appcolor.primary,
                borderRadius: 50,
                width: '50%',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: appcolor.white,
                  fontWeight: '500',
                }}
              >
                Tìm kiếm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
export default SellOutHPI;
