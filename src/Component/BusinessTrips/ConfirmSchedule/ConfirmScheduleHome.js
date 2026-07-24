import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import FormGroup from '../../../Content/FormGroup';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import moment from 'moment';
import {
  GetDataConfirmBusiness,
  UploadConfirmBusiness,
} from '../../../Controller/BussinessTripController';
import { PlanTrip } from './Control/PlanTrip';
import { ActualTrip } from './Control/ActualTrip';
import { Text } from '@rneui/themed';
import { alertConfirm, deviceHeight } from '../../../Core/Utility';
import { ToastError, ToastSuccess, groupDataByKey } from '../../../Core/Helper';
import { SheetManager } from 'react-native-actions-sheet';
import _ from 'lodash';
import { SearchActionSheet } from '../../../Control/SearchEmployee/SearchActionSheet';

export const ConfirmScheduleHome = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    fromDate: moment().startOf('month').format('DD/MM/YYYY'),
    toDate: moment().endOf('month').format('DD/MM/YYYY'),
    valueFromDate: moment().startOf('month').format('YYYYMMDD'),
    valueToDate: moment().endOf('month').format('YYYYMMDD'),
    fromDateCaculator: moment().startOf('month'),
    toDateCaculator: moment().endOf('month'),
    loadCalendar: false,
  });
  const [dataConfirmMain, setDataConfirmMain] = useState([]);
  const [dataConfirm, setDataConfirm] = useState([]);
  const [dataEmployee, setDataEmployee] = useState([]);
  //
  const LoadData = async (from, to) => {
    const fromValue =
      from !== undefined
        ? moment(from).format('YYYYMMDD')
        : filter.valueFromDate;
    const toValue =
      to !== undefined ? moment(to).format('YYYYMMDD') : filter.valueToDate;
    //
    await setLoading(true);
    await GetDataConfirmBusiness(
      fromValue,
      toValue,
      async (mData, mEmployee) => {
        const { arr } = await groupDataByKey({
          arr: mData,
          key: 'employeeId',
        });
        await setDataConfirmMain(arr);
        await setDataConfirm(arr);
        await setDataEmployee(mEmployee);
      },
    );
    await setLoading(false);

    await setFilter({
      ...filter,
      loadCalendar: false,
      fromDate:
        from !== undefined
          ? moment(from).format('DD/MM/YYYY')
          : filter.fromDate,
      toDate:
        to !== undefined ? moment(to).format('DD/MM/YYYY') : filter.toDate,
      valueFromDate: fromValue,
      valueToDate: toValue,
      fromDateCaculator:
        from !== undefined ? moment(from) : filter.fromDateCaculator,
      toDateCaculator: to !== undefined ? moment(to) : filter.toDateCaculator,
    });
  };
  const handlerUpload = async () => {
    const dataUpload = _.filter(dataConfirm, e => {
      return e.pressConfirm == true;
    });
    if (dataUpload !== null && dataUpload.length > 0) {
      for (let index = 0; index < dataUpload.length; index++) {
        const item = dataUpload[index];
        // Plan
        const dataPlan = JSON.parse(item.jsonPlan || '[]') || [];
        for (let p = 0; p < dataPlan.length; p++) {
          const plan = dataPlan[p];
          if (
            plan.ConfirmPlan == 0 &&
            (plan.ConfirmNote == undefined ||
              plan.ConfirmNote == null ||
              plan.ConfirmNote.length < 5)
          ) {
            ToastError(
              `Vui lòng nhập lí do từ chối chuyến đi của nhân viên ${item.employeeName} (Tối thiểu 5 kí tự)`,
              'Thông báo',
              'top',
            );
            return;
          }
        }
        // Actual
        const dataActual = JSON.parse(item.jsonActual || '[]');
        for (let a = 0; a < dataActual.length; a++) {
          const actual = dataActual[a];
          if (
            actual.ConfirmPlan == 0 &&
            (actual.ConfirmNote == undefined ||
              actual.ConfirmNote == null ||
              actual.ConfirmNote.length < 5)
          ) {
            ToastError(
              `Vui lòng nhập lí do từ chối chuyến đi của nhân viên ${
                item.EmployeeName || item.employeeName
              } (Tối thiểu 5 kí tự)`,
              'Thông báo',
              'top',
            );
            return;
          }
        }
      }
      // Return
      alertConfirm(
        'Xác nhận',
        'Bạn có đồng ý với các xác nhận như dưới, nếu có vui lòng xác nhận để gửi yêu cầu',
        async () => {
          await UploadConfirmBusiness(dataUpload, async result => {
            ToastSuccess(result.messeger);
            await LoadData();
          });
        },
      );
    }
  };
  // Handler
  const showCalendar = () => {
    setFilter({ ...filter, loadCalendar: !filter.loadCalendar });
  };
  const handlerViewByEmployee = employeeId => {
    if (employeeId == 0) {
      setDataConfirm(dataConfirmMain);
    } else {
      const dataByEmployee = _.filter(dataConfirmMain, e => {
        return e.employeeId == employeeId;
      });
      setDataConfirm(dataByEmployee);
    }
  };
  const onConfirmTrip = (value, type, jsonData, itemMain) => {
    itemMain.pressConfirm = value !== null;
    if (type == 'PLAN') {
      itemMain.jsonPlan = jsonData;
    }
    if (type == 'ACTUAL') {
      // console.log(jsonData);
      itemMain.jsonActual = jsonData;
    }
  };
  const onNoteChange = (type, jsonData, itemMain) => {
    if (type == 'PLAN') {
      itemMain.jsonPlan = jsonData;
    }
    if (type == 'ACTUAL') {
      itemMain.jsonActual = jsonData;
    }
  };
  // View
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    viewDate: {
      width: '100%',
      borderRadius: 5,
      alignItems: 'center',
      padding: 8,
    },
    contentView: { width: '100%' },
    titleHeader: {
      fontSize: 14,
      color: appcolor.info,
      fontWeight: '700',
      fontStyle: 'italic',
      padding: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const dataPlan = JSON.parse(item.jsonPlan || '[]');
    const dataActual = JSON.parse(item.jsonActual || '[]');
    const changeConfirm = (value, type, jsonData) => {
      onConfirmTrip(value, type, jsonData, item);
    };
    const changeNote = (type, jsonData) => {
      onNoteChange(type, jsonData, item);
    };
    return (
      <View key={`gghh_${index}`}>
        {item.isParent && (
          <Text style={styles.titleHeader}>{`${index + 1}. ${
            item.employeeCode
          } - ${item.employeeName}`}</Text>
        )}
        <View style={{ flexDirection: 'row' }}>
          {dataPlan !== null && dataPlan.length > 0 && (
            <PlanTrip
              type="PLAN"
              key={`$plan_${index}`}
              data={dataPlan}
              dataActual={dataActual}
              isCheckData={item.isCheckData == 1}
              indexMain={index}
              handlerConfirm={changeConfirm}
              handlerNote={changeNote}
            />
          )}
          {dataActual !== null && dataActual.length > 0 && (
            <ActualTrip
              type="ACTUAL"
              key={`$actual_${index}`}
              data={dataActual}
              dataPlan={dataPlan}
              isCheckData={item.isCheckData == 1}
              indexMain={index}
              handlerConfirm={changeConfirm}
              handlerNote={changeNote}
            />
          )}
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        iconMiddle="search"
        middleFunc={() => {
          SheetManager.show('employees');
        }}
        iconRight="cloud-upload-alt"
        rightFunc={handlerUpload}
      />
      <View style={styles.viewDate}>
        <FormGroup
          containerStyle={{ width: '100%', padding: 5 }}
          inputStyle={{
            fontSize: 14,
            fontWeight: '400',
            color: appcolor.greylight,
          }}
          title="Ngày công tác"
          iconRight="calendar-alt"
          value={`${filter.fromDate} - ${filter.toDate}`}
          rightFunc={showCalendar}
        />
        {filter.loadCalendar && <CalendarSelected onChangeData={LoadData} />}
      </View>
      <LoadingView isLoading={isLoading} title="Đang cập nhật dữ liệu" />
      <View style={styles.contentView}>
        <FlatList
          key="confirmbusiness"
          keyExtractor={(_item, index) => index.toString()}
          data={dataConfirm}
          renderItem={renderItem}
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 3 }} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <SearchActionSheet
        data={dataEmployee}
        actionResult={handlerViewByEmployee}
      />
    </View>
  );
};
