import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { WorkingPlanAPI } from '../../API/WorkingPlanApi';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ToastError, ToastSuccess } from '../../Core/Helper';
import moment from 'moment';
import { Badge, Icon } from '@rneui/themed';
import { alertConfirm, deviceWidth } from '../../Core/Utility';
import { Text } from '@rneui/themed';
import { LoadingView } from '../../Control/ItemLoading/index';
import _ from 'lodash';
import FormGroup from '../../Content/FormGroup';
import { ACTION_CONFIRM_SR } from '../../Controller/PlanController';
import CustomListView from '../../Control/Custom/CustomListView';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const ConfirmPlanWeekly = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataConfirm, setDataConfirm] = useState([]);
  const [dataConfirmMain, setDataConfirmMain] = useState([]);
  const [dataWeekly, setDataWeekly] = useState([]);
  const [dataEmployee, setDataEmployee] = useState([]);
  const [filterData, setFilterData] = useState({
    fromDate: moment().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().endOf('month').format('YYYY-MM-DD'),
  });
  const [activeSlide, setActiveSlide] = useState(0);
  const [__, setMutate] = useState(false);
  const weekListRef = useRef(null);

  const LoadData = async (fromDate, toDate) => {
    const fromValue = fromDate || filterData.fromDate;
    const toValue = toDate || filterData.toDate;
    await setLoading(true);
    const result = await WorkingPlanAPI.GetConfirmPlanWeekly(
      fromValue,
      toValue,
    );
    if (result.statusId === 200) {
      const dataConfirmFilter = await result.data.table.filter(
        i => i.weekByYear == result.data.table1[0].weekNum,
      );
      await setDataConfirmMain(result.data.table);
      await setDataConfirm(dataConfirmFilter);
      await setDataWeekly(result.data.table1);
      await setDataEmployee(result.data.table2);
    } else {
      ToastError(result.messager);
    }
    await setLoading(false);
  };
  const handlerUpload = async () => {
    let listEmployees = [];
    if (dataConfirm !== null && dataConfirm.length > 0) {
      const planList = JSON.parse(dataConfirmMain[activeSlide].planList);
      for (let j = 0, lenList = planList.length; j < lenList; j++) {
        const item = planList[j];
        // if (item.ConfirmPlan == 3) {
        //     ToastError(`Chưa xác nhận ngày ${item.ShortDate}-${item.DateView}`, item.EmployeeName, 'top')
        //     return
        // }
        if (item.ConfirmPlan == -1) {
          if (item.SupNote == null || item.SupNote.length == 0) {
            ToastError(
              `Chưa nhập lí do từ chối ngày ${item.ShortDate}-${item.DateView}`,
              item.EmployeeName,
              'top',
            );
            return;
          }
        }
        listEmployees.push(item.EmployeeId);
      }
      alertConfirm(
        'Xác nhận',
        'Bạn có muốn phê duyệt/từ chối lịch làm việc như bên dưới không?',
        async () => {
          await setLoading(true);
          const employeeSend = _.uniqWith(listEmployees, _.isEqual);
          await ACTION_CONFIRM_SR(planList, employeeSend.join(','), message => {
            ToastSuccess(message);
            LoadData(filterData.fromDate, filterData.toDate);
          });
        },
      );
    }
  };
  const onChangeData = async index => {
    if (!dataWeekly[index]) return;
    await setLoading(true);
    const weekNum = dataWeekly[index].weekNum;
    const dataFilter = await dataConfirmMain.filter(
      i => i.weekByYear == weekNum,
    );
    await setDataConfirm(dataFilter);
    await setActiveSlide(index);
    await setLoading(false);
  };
  const onWeekScrollEnd = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / deviceWidth);
    if (index !== activeSlide) {
      onChangeData(index);
    }
  };
  const onRejectDay = async (item, indexMain) => {
    const dataUpdate = JSON.parse(dataConfirm[indexMain].planList || []);
    const dataReject = await dataUpdate.map(i =>
      i.Date === item.Date && i.ShopId === item.ShopId
        ? { ...i, ConfirmPlan: i.ConfirmPlan !== -1 ? -1 : 1 }
        : i,
    );
    //
    dataConfirm[indexMain].planList = JSON.stringify(dataReject);
    dataConfirmMain[activeSlide].planList = JSON.stringify(dataReject);
    setMutate(e => !e);
  };
  const onConfirmAll = async (item, valueConfirm, indexMain) => {
    const dataUpdate = JSON.parse(dataConfirm[indexMain].planList || []);
    const confirmAll = await dataUpdate.map(i =>
      i.WeekByYear == item.weekByYear && i.EmployeeId == item.employeeId
        ? { ...i, ConfirmPlan: valueConfirm }
        : i,
    );
    //
    dataConfirmMain[activeSlide].planList = JSON.stringify(confirmAll);
    dataConfirm[indexMain].planList = JSON.stringify(confirmAll);
    setMutate(e => !e);
  };
  const handlerChangeNote = (index, text, indexMain, item) => {
    const dataUpdate = JSON.parse(dataConfirm[indexMain].planList || []);
    dataUpdate[index].SupNote = text;
    //
    dataConfirmMain[activeSlide].planList = JSON.stringify(dataUpdate);
    dataConfirm[indexMain].planList = JSON.stringify(dataUpdate);
    setMutate(e => !e);
  };
  const handlerShowView = (item, index) => {
    dataConfirm[index].isShowView = !item.isShowView;
    setMutate(e => !e);
  };
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
    itemContainer: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: appcolor.light,
    },
    titleItem: {
      flex: 9,
      fontSize: 15,
      fontWeight: '600',
      color: appcolor.dark,
      padding: 8,
      margin: 3,
    },
    bodyItem: { flex: 1 },
    dayView: {
      flex: 8,
      padding: 5,
      fontSize: 15,
      fontWeight: '600',
      color: appcolor.info,
    },
    headerView: {
      backgroundColor: appcolor.light,
      flexDirection: 'row',
      width: deviceWidth,
      justifyContent: 'center',
    },
    dateDetailView: { fontSize: 14, fontWeight: '300', fontStyle: 'italic' },
    itemConfirmContainer: {
      padding: 8,
      marginBottom: 5,
      backgroundColor: appcolor.light,
      borderRadius: 8,
    },
    titleItemView: { fontSize: 14, fontWeight: '500', color: appcolor.dark },
    itemEmployeeContent: {
      backgroundColor: appcolor.light,
      borderRadius: 5,
      padding: 8,
      margin: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    itemEmployeeName: {
      fontSize: 14,
      fontWeight: '300',
      color: appcolor.dark,
      textAlign: 'center',
      marginStart: 8,
      marginEnd: 8,
    },
    paginationView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -8,
      marginBottom: 8,
    },
    paginationDot: { height: 5, borderRadius: 3, marginHorizontal: 3 },
    paginationDotActive: { width: 10, backgroundColor: appcolor.dark },
    paginationDotInactive: {
      width: 6,
      backgroundColor: appcolor.dark,
      opacity: 0.4,
    },
  });
  const paginationDot = () => {
    return (
      <View style={styles.paginationView}>
        {dataWeekly.map((_item, index) => (
          <View
            key={`week_dot_${index}`}
            style={[
              styles.paginationDot,
              index === activeSlide
                ? styles.paginationDotActive
                : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>
    );
  };
  const renderItemEmployee = ({ item, index }) => {
    const onShowView = () => {
      handlerShowView(item, index);
    };
    const onConfirm = () => {
      onConfirmAll(item, 1, index);
    };
    const onReject = () => {
      onConfirmAll(item, -1, index);
    };
    const planbyWeek = JSON.parse(item.planList) || [];
    return (
      <View key={`it_emp_${index}`}>
        <TouchableOpacity onPress={onShowView}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              backgroundColor: appcolor.light,
              padding: 5,
              borderRadius: 5,
            }}
          >
            <Text style={styles.dayView}>{`${index + 1}. ${item.employeeName
              }`}</Text>
            {item.isShowView == 1 && (
              <View style={{ flexDirection: 'row' }}>
                <SpiralIcon
                  name="check-square"
                  type="font-awesome-5"
                  size={28}
                  color={appcolor.success}
                  solid
                  style={{ padding: 3 }}
                  onPress={onConfirm}
                />
                <SpiralIcon
                  name="window-close"
                  type="font-awesome-5"
                  size={28}
                  color={appcolor.danger}
                  style={{ padding: 3 }}
                  onPress={onReject}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
        {item.isShowView == 1 && (
          <CustomListView
            key={'planconfirmtime'}
            data={planbyWeek}
            renderItem={({ item: itemPlan, index: indexPlan }) =>
              renderItemPlan(itemPlan, indexPlan, index)
            }
            showsVerticalScrollIndicator={false}
            estimatedItemSize={130}
            bottomView={{ paddingBottom: 0 }}
            containerStyle={{ minHeight: Math.max(planbyWeek.length * 130, 1) }}
          />
        )}
      </View>
    );
  };
  const renderItemPlan = (item, index, mainIndex) => {
    const onPressDay = () => {
      onRejectDay(item, mainIndex);
    };
    const onChangeText = text => {
      handlerChangeNote(index, text, mainIndex, item);
    };
    const styleItemReject =
      item.ConfirmPlan == -1
        ? { borderEndWidth: 10, borderEndColor: appcolor.danger }
        : item.ConfirmPlan == 1
          ? { borderEndWidth: 10, borderEndColor: appcolor.success }
          : {};
    return (
      <View key={`it_pl_${index}`}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              width: deviceWidth / 6,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 5,
            }}
          >
            <Badge status={item.ShortDate === 'CN' ? 'error' : 'success'} />
            <View style={{ justifyContent: 'center', marginLeft: 10 }}>
              <Text style={{ color: appcolor.dark, fontSize: 17 }}>
                {moment(item.Date).format('DD')}
              </Text>
              <Text
                style={{
                  color: appcolor.dark,
                  fontSize: 10,
                  textAlign: 'center',
                }}
              >
                {item.ShortDate}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 8 }} onPress={onPressDay}>
            <View style={[styles.itemConfirmContainer, styleItemReject]}>
              <Text style={styles.titleItemView}>{item.ShopName}</Text>
              <Text style={{ ...styles.titleItemView, fontWeight: '300' }}>
                {item.Address}
              </Text>
              <Text style={{ ...styles.titleItemView, fontWeight: '300' }}>
                Ca hiện tại: {item.ShiftType}
              </Text>
              {item.ShiftTypeUpdate !== null && (
                <Text
                  style={{
                    ...styles.titleItemView,
                    fontWeight: '400',
                    color: appcolor.tomato,
                  }}
                >
                  Ca thay đổi: {item.ShiftTypeUpdate}
                </Text>
              )}
              {item.Notes !== undefined && (
                <Text style={{ ...styles.titleItemView, fontWeight: '300' }}>
                  Lí do thay đổi: {item.Notes}
                </Text>
              )}
              {item.ConfirmPlan == -1 && (
                <FormGroup
                  containerStyle={{
                    marginTop: 5,
                    backgroundColor: appcolor.surface,
                  }}
                  title="Lí do từ chối"
                  editable
                  value={item.SupNote}
                  handleChangeForm={onChangeText}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderItemWeek = ({ item, index }) => {
    const countRequest = dataConfirm.length || 0;
    return (
      <View key={`it_wp_${index}`} style={styles.headerView}>
        <View style={{ flex: 8, alignSelf: 'center', padding: 16 }}>
          <Text
            style={{ fontSize: 23, color: appcolor.dark, fontWeight: '700' }}
          >
            {item.weekByYear}
          </Text>
          <Text
            style={styles.dateDetailView}
          >{`${item.fromDate} / ${item.toDate}`}</Text>
        </View>
        <View
          style={{
            flex: 2,
            backgroundColor: appcolor.yellowdark,
            alignItems: 'center',
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 23,
              color: appcolor.dark,
              fontWeight: '600',
              fontStyle: 'italic',
            }}
          >
            {countRequest}
          </Text>
          <Text style={styles.dateDetailView}>Yêu cầu</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route?.params?.menuitem.menuNameVN || 'Xác nhận LLV Tuần'}
        leftFunc={() => navigation.goBack()}
        rightFunc={handlerUpload}
        iconRight="cloud-upload-alt"
      />
      <View
        style={{
          width: deviceWidth,
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CustomListView
          ref={weekListRef}
          horizontal
          pagingEnabled
          snapToInterval={deviceWidth}
          data={dataWeekly}
          renderItem={renderItemWeek}
          onMomentumScrollEnd={onWeekScrollEnd}
          estimatedItemSize={deviceWidth}
          endView={{ paddingEnd: 0 }}
          containerStyle={{ width: deviceWidth }}
          initialScrollIndex={activeSlide}
        />
        {paginationDot()}
      </View>
      <LoadingView
        isLoading={loading}
        title="Đang cập nhật dữ liệu"
        styles={{ backgroundColor: appcolor.surface }}
      />
      {/* {!loading && dataConfirm.length == 0 &&
                <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '500', backgroundColor: appcolor.surface, padding: 16 }}>Không có dữ liệu xác nhận</Text>
            } */}
      <CustomListView
        key={`dataPlanbyWeek`}
        data={dataConfirm}
        showsVerticalScrollIndicator={false}
        renderItem={renderItemEmployee}
        estimatedItemSize={180}
        onRefresh={LoadData}
        isRefresh={false}
        containerStyle={{ backgroundColor: appcolor.surface, padding: 8 }}
        bottomView={{ paddingBottom: 23 }}
      />
    </View>
  );
};
