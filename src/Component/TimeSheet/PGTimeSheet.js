import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TimeSheetAPI } from '../../API/TimeSheetApi';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingView } from '../../Control/ItemLoading/index';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  alertError,
  checkNetwork,
  deviceHeight,
  deviceWidth,
} from '../../Core/Utility';
import { Badge, Icon } from '@rneui/base';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { MonthPGView } from './MonthPGView';
import { ConfirmView } from './ConfirmView';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import UploadController from '../../Controller/UploadController';
import { URLDEFAULT } from '../../Core/URLs';
import CustomListView from '../../Control/Custom/CustomListView';
import WebViewScreen from '../../Control/Webview/WebViewScreen';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import moment from 'moment';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const TIMESHEET = {
  DATA_SHEET: 'TABLE0',
  MASTERDATA: 'MASTER',
};
const DATE = new Date();
const defaultFilter = {
  year: DATE.getFullYear(),
  yearname: `Năm ${DATE.getFullYear()}`,
  month: DATE.getMonth() + 1,
  monthname: `Tháng ${DATE.getMonth() + 1}`,
};
export const PGTimeSheet = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [dataTS, setDataTS] = useState([]);
  const [detailEmployee, setDetailEmployee] = useState([]);
  const [eSelected, setSelected] = useState({});
  const [dayData, setdayData] = useState({});
  const [listWeek, setWeek] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewInfo, setViewInfo] = useState('');
  const [itemSelected, setItemSelected] = useState({});
  const [visibleBS, setVisibleBS] = useState(false);
  const [filter, setFilter] = useState(defaultFilter);

  const onLoad = async isSearch => {
    SheetManager.hideAll();
    if (filter.month === undefined || filter?.month === null) {
      alert('Bạn chưa chọn tháng muốn xem');
      return;
    }
    if (filter.year === undefined || filter?.year === null) {
      alert('Bạn chưa chọn năm muốn xem');
      return;
    }
    setViewInfo(`${filter.monthname}/${filter.year}`);
    const localData =
      isSearch !== undefined
        ? null
        : await AsyncStorage.getItem(TIMESHEET.DATA_SHEET);
    if (localData === undefined || localData === null) {
      if (await checkNetwork()) {
        setLoading(true);
        const jsonFilter = {
          fromDate: `${filter.year}${filter.month > 9 ? filter.month : '0' + filter.month
            }01`,
          supId: null,
          employeeId: null,
        };
        const result = await TimeSheetAPI.GetPGTimeSheet(
          JSON.stringify(jsonFilter),
        );
        if (result.statusId === 200) {
          const _table = result.data?.table || [];
          if (_table.length > 0) {
            const _strWeek = _table[0].listWeek;
            setWeek(JSON.parse(_strWeek));
          }
          setDataTS(_table);
          await AsyncStorage.setItem(
            TIMESHEET.DATA_SHEET,
            JSON.stringify(result.data?.table),
          );
        } else {
          alertError(result.messager);
        }
      } else {
        alertError('Không có kết nối mạng');
      }
    } else {
      setDataTS(JSON.parse(localData));
    }
    setLoading(false);
    const masterLocal = await AsyncStorage.getItem(TIMESHEET.MASTERDATA);
    if (masterLocal === null) {
      const masterlist = await TimeSheetAPI.GetMasterListData();
      if (masterlist.statusId === 200) {
        await AsyncStorage.setItem(
          TIMESHEET.MASTERDATA,
          JSON.stringify(masterlist.data || '{}'),
        );
      }
    }
  };
  const onEmployeePress = (item, eData) => {
    setDetailEmployee(eData);
    setSelected(item);
    SheetManager.show('sheetdetail');
  };
  const rowItem = ({ item, index }) => {
    const eData = JSON.parse(item.detail);
    const displayWeek = listWeek.filter(w => w.selected === 1)[0] || 1;
    return (
      <View
        key={`${index}4q9bye`}
        style={{ backgroundColor: appcolor.surface }}
      >
        <View style={{ color: appcolor.dark, flexDirection: 'row' }}>
          {userinfo.groupType === 'SUP' && (
            <Text
              style={{
                flexGrow: 1,
                marginLeft: 12,
                padding: 7,
                color: appcolor.dark,
                fontWeight: '700',
              }}
            >
              {item.employeeCode} {item.employeeName}
            </Text>
          )}
          {userinfo.groupType === 'SUP' && (
            <TouchableOpacity
              onPress={() => onEmployeePress(item, eData)}
              style={{ padding: 7 }}
            >
              <Text
                style={{
                  color: appcolor.dark,
                  fontSize: 12,
                  fontStyle: 'italic',
                  textAlign: 'right',
                }}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* <View style={{ padding: 2, alignItems: 'center', flexDirection: 'row', marginLeft: 10 }}>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>CC:{item.comWork || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>TT: {item.pcWork || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>NC:{item.pcPaid || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>NP: {item.al || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>DL:{item.ar || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>NL:{item.gov || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>SG: {item.pcLate || 0}</Text>
                    <Text style={{ color: appcolor.dark, flexGrow: 1, fontSize: 10 }}>OT:{item.weekOT || 0}</Text>
                </View> */}
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{
            backgroundColor: appcolor.light,
            borderRadius: 5,
            marginLeft: 10,
            marginEnd: 10,
            flexDirection: 'row',
          }}
        >
          {userinfo.groupType === 'SUP'
            ? eData?.map((ditem, i) => {
              if (ditem.week !== displayWeek.value) return;
              return (
                <View
                  key={`${i}$hiaj${ditem.employeeId}`}
                  style={{
                    width: deviceWidth / 7,
                    padding: 3,
                    alignItems: 'center',
                    borderRightColor: appcolor.surface,
                    borderRightWidth: 1,
                    opacity: ditem.shift === '' ? 0.6 : 1,
                    backgroundColor:
                      ditem.shift === ''
                        ? appcolor.grey
                        : ditem.color !== ''
                          ? ditem.color
                          : appcolor.light,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      onDayPress(ditem);
                    }}
                  >
                    <Text
                      style={{
                        color: appcolor.dark,
                        fontSize: 10,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {moment(ditem.workDate, 'YYYY-MM-DD').format('dd/DD')}
                    </Text>
                    {ditem.shift !== '' ? (
                      <View style={{}}>
                        <Badge
                          textStyle={{ color: appcolor.light }}
                          value={ditem.shift}
                          badgeStyle={{
                            backgroundColor: appcolor.dark,
                            borderWidth: 0,
                          }}
                        />
                        <Text
                          style={{
                            color: appcolor.dark,
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          {ditem.totalTime}
                        </Text>
                        <Text
                          style={{
                            color: appcolor.dark,
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          {ditem?.ot > 0 ? ditem?.ot : ''}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            color: appcolor.dark,
                            textAlign: 'center',
                          }}
                        >
                          Thg
                        </Text>
                        <Text
                          style={{
                            color: appcolor.dark,
                            textAlign: 'center',
                          }}
                        >
                          {moment(ditem.workDate, 'YYYY-MM-DD').format('M')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
            : eData?.length > 0 && (
              <MonthPGView
                info={item}
                gridColl={7}
                onPressDay={onDayPress}
                eData={eData}
              />
            )}
        </ScrollView>
      </View>
    );
  };
  const onFilterChange = searchInfo => {
    setFilter(searchInfo);
  };
  useEffect(() => {
    onLoad();
    return () => {
      AsyncStorage.removeItem(TIMESHEET.DATA_SHEET);
    };
  }, []);
  const onDayPress = async item => {
    setLoading(true);
    const parrams = {
      employeeId: item.employeeId,
      workDate: moment(item.workDate, 'YYYY-MM-DD').format('YYYYMMDD'),
    };
    const result = await TimeSheetAPI.GetConfirmDay(parrams);
    if (result.statusId === 200 && result?.data?.length > 0) {
      setdayData(result.data[0]);
    }
    setLoading(false);
    SheetManager.show('sheetconfirm');
  };
  const onGuid = async () => {
    const params = {
      urlPage: `${URLDEFAULT}guid/timesheetguid.html`,
      pageName: 'Chú thích các kí hiệu chấm công',
    };
    setItemSelected(params);
    setVisibleBS(true);

    // navigation.navigate("WebView", params)
  };
  const onConfirm = async info => {
    if (!(await checkNetwork())) {
      alert('Không có kết nối mạng');
      return;
    }
    setLoading(true);
    const confirm = {
      workDate: info.workDate,
      employeeId: info.employeeId,
      shift: info.shiftTS,
      timeOT: info.timeOT || 0,
      note: info.noteTS || null,
      photos: info.photoTimeSheet || '[]',
    };
    const resultCheck = await TimeSheetAPI.PostCheckTimeSheet(
      JSON.stringify(confirm),
    );
    if (resultCheck.statusId === 500) {
      alert(resultCheck.messager);
    } else {
      const result = await TimeSheetAPI.PostConfirmDay(JSON.stringify(confirm));
      if (result.statusId === 200) {
        const rowInfo = result.data[0] || {};
        SheetManager.hide('sheetconfirm');
        if (info?.photoTimeSheet?.length > 0) UploadController.PostFile();
        const _empData = dataTS.filter(
          a => a.employeeId === rowInfo.employeeId,
        )[0];
        if (_empData === undefined) {
          setLoading(false);
          return;
        }
        let detailEdit = JSON.parse(_empData.detail);
        const dayIndex = detailEdit.findIndex(
          a => a.workDate === rowInfo.workDate,
        );
        detailEdit[dayIndex] = rowInfo;
        _empData.detail = JSON.stringify(detailEdit);
        const empIndex = dataTS.findIndex(
          e => e.employeeId === rowInfo.employeeId,
        );
        const _dataEdit = [...dataTS];
        _dataEdit[empIndex] = _empData;
        setDataTS(_dataEdit);
        setSelected(rowInfo);
        setDetailEmployee(detailEdit);
      } else {
        alert(result.messager);
      }
    }
    setLoading(false);
  };
  const onDisplayWeek = week => {
    const _weekList = listWeek.map((w, i) => {
      return { ...w, selected: week.value === w.value ? 1 : 0 };
    });
    setWeek(_weekList);
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={`${kpiinfo?.menuNameVN || 'Chấm công'} ${viewInfo}`}
        iconMiddle="searchengin"
        rightFunc={() => onGuid()}
        iconRight="info"
        middleFunc={() => SheetManager.show('sheetsearch')}
        leftFunc={() => navigation.goBack()}
      />
      <View style={{ flex: 1 }}>
        <LoadingView styles={{ zIndex: 20 }} isLoading={loading} />
        <CustomListView data={dataTS} extraData={dataTS} renderItem={rowItem} />
      </View>
      <ActionSheet
        id="sheetsearch"
        containerStyle={{
          backgroundColor: appcolor.light,
          maxHeight: deviceHeight * 0.75,
          paddingBottom: insets.bottom,
        }}
        headerAlwaysVisible
        gestureEnabled
      >
        <ScrollView contentContainerStyle={styles.searchSheetContent}>
          <YearMonthSelected
            option={filter}
            onYearMonth={search => onFilterChange(search)}
            numMonth={4}
          />
          <View style={styles.weekWrap}>
            {listWeek.map((w, index) => {
              return (
                <View
                  key={`wea${index}`}
                  style={[
                    styles.weekItem,
                    {
                      backgroundColor:
                        w.selected === 1 ? appcolor.primary : appcolor.surface,
                    },
                  ]}
                >
                  <TouchableOpacity onPress={() => onDisplayWeek(w)}>
                    <Text
                      style={[
                        styles.weekText,
                        {
                          color:
                            w.selected === 1 ? appcolor.white : appcolor.dark,
                        },
                      ]}
                    >
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <View
            style={[
              styles.applyButtonWrap,
              { backgroundColor: appcolor.surface },
            ]}
          >
            <TouchableOpacity
              onPress={() => onLoad(true)}
              style={styles.applyButton}
            >
              <SpiralIcon name="search" color={appcolor.primary} />
              <Text
                style={{
                  color: appcolor.primary,
                  fontWeight: '600',
                  textAlign: 'center',
                  padding: 7,
                }}
              >
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ActionSheet>
      <ActionSheet
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
        headerAlwaysVisible
        gestureEnabled
        id="sheetdetail"
      >
        <ScrollView>
          <MonthPGView
            info={eSelected}
            gridColl={7}
            onPressDay={onDayPress}
            eData={detailEmployee}
          />
        </ScrollView>
      </ActionSheet>
      <ActionSheet
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
        headerAlwaysVisible
        id="sheetconfirm"
      >
        <TouchableOpacity
          onPress={() => SheetManager.hide('sheetconfirm')}
          style={{
            padding: 3,
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 12,
          }}
        >
          <SpiralIcon color={appcolor.primary} name="close" />
        </TouchableOpacity>
        <LoadingView
          styles={{
            marginLeft: '35%',
            marginTop: 100,
            zIndex: 20,
            position: 'absolute',
          }}
          isLoading={loading}
        />
        <ConfirmView
          onLock={info => onConfirm(info)}
          shiftCol={3}
          data={dayData}
        />
      </ActionSheet>

      <Modal
        visible={visibleBS}
        presentationStyle="fullScreen"
        statusBarTranslucent
        backdropColor={appcolor.black}
        style={{ flex: 1, backgroundColor: appcolor.black }}
        animationType="fade"
      >
        <SafeAreaProvider>
          <WebViewScreen
            pageName={itemSelected.pageName}
            urlPage={itemSelected.urlPage}
            isConfirmExits={false}
            onClose={() => setVisibleBS(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSheetContent: {
    paddingBottom: 34,
  },
  weekWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  weekItem: {
    borderRadius: 40,
    marginEnd: 12,
    marginBottom: 12,
  },
  weekText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  applyButtonWrap: {
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 2,
  },
  applyButton: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
});
