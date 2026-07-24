import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Platform,
  RefreshControl,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
} from 'react-native';
import { Text, ListItem } from '@rneui/themed';
import {
  SR_PLAN_GETLIST,
  PLANSR_ACTION,
} from '../../Controller/PlanController';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import { groupDataByKey } from '../../Core/Helper';
import {
  alertWarning,
  alertNotify,
  alertConfirm,
  alertError,
  TODAY,
} from '../../Core/Utility';
import FormGroup from '../../Content/FormGroup';

import { DEFAULT_COLOR } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading/index';
import { useSelector } from 'react-redux';

const paddingTopIPX = Platform.OS == 'ios' ? 20 : 0;
const WorkingPlanSR = ({ navigation, route }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [searchText, setSearchText] = useState('');
  const [dateSelected, setDateSelect] = useState(
    moment(new Date()).format('YYYY-MM-DD'),
  );
  const [isSave, setSaved] = useState(TODAY);
  const [dataPlan, setDataPlan] = useState([]);
  const [mainData, setMainData] = useState([]);

  const [dataIndexChange, setDataIndexChange] = useState(false);

  const [markedDates, setMarkedDates] = useState([]);
  const [customDatesStyles, setCustomDatesStyles] = useState([]);
  const [typeBS, setTypeBS] = useState(null);
  const [itemPlan, setItemPlan] = useState({});
  const [refreshing, setRefreshing] = useState(true);
  const [visibleBS, setVisibleBS] = useState(false);
  const [mDataModalBS, setDataModalBS] = useState([]);
  const [FilterDataModalBS, setFilterDataModalBS] = useState([]);
  const [dataMainIndex, setMainIndex] = useState(false);
  const [_, setMutate] = useState(false);
  const [titleLoading, setTitleLoading] = useState(null);

  const LoadDataPlan = async mDate => {
    setTitleLoading('Đang cập nhật dữ liệu');
    setRefreshing(true);
    setDataIndexChange(false);
    setSearchText('');
    setDateSelect(moment(mDate).format('YYYY-MM-DD'));
    const iDate = parseInt(moment(mDate).format('YYYYMMDD'));
    setSaved(iDate);
    const dataHeader = {
      PlanDate: parseInt(moment(mDate).format('YYYYMMDD')),
      Week: moment(mDate).isoWeek() + 1,
      Year: moment(mDate).year(),
    };
    await SR_PLAN_GETLIST(
      dataHeader,
      async (mDataPlan, mDataWeek) => {
        const { arr } = groupDataByKey({
          arr: mDataPlan,
          key: 'auditDate',
        });
        await setDataPlan(arr);
        await setMainData(arr);
        await dataMarkedDates(mDataWeek);
        setRefreshing(false);
      },
      error => {
        //console.log(error, "ErrorPlanList");
        alertError('Dữ liệu lỗi, vui lòng thử lại sau');
        setRefreshing(false);
      },
    );
  };
  const toggleSwitch = (item, index, value) => {
    let valueChange = value ? 1 : 0;

    let statusChange = item.status;
    let lastStatus = null;
    if (valueChange === item.statusMain) {
      statusChange = item.statusMain;
      lastStatus = null;
    } else {
      statusChange = valueChange;
      lastStatus = valueChange == 0 ? 'DEL' : 'ADD';
    }
    // Update dong gia
    dataPlan[0].lastStatus = lastStatus;
    //
    dataPlan[index].status = statusChange;
    dataPlan[index].lastStatus = lastStatus;
    dataPlan[index].confirmShop = 3;
    mainData[item.mainIndex].status = statusChange;
    mainData[item.mainIndex].lastStatus = lastStatus;
    mainData[item.mainIndex].confirmShop = 3;

    setMutate(e => !e);
    setDataIndexChange(true);
  };
  const clearItemSelect = (item, index, typeBS) => {
    mDataModalBS[index].isSelect = 0;
    let listIndex = JSON.parse(dataPlan[0].listIndex);
    // for (let i = 0, lenList = listIndex.length; i < lenList; i++) {
    const mainIndex = listIndex[0].MainIndex;
    if (typeBS == 'SHIFT') {
      dataPlan[mainIndex].shiftChange = 'Chọn loại nghỉ phép';
      dataPlan[mainIndex].reasonName = 'Chọn lí do thay đổi';
      dataPlan[mainIndex].ref_Code = null;
      dataPlan[mainIndex].isLocked = 0;
      dataPlan[mainIndex].notes = null;
      dataPlan[mainIndex].supConfirm = 0;
    }

    if (typeBS == 'NOTE') {
      dataPlan[mainIndex].reasonName = 'Chọn lí do thay đổi';
      dataPlan[mainIndex].notes = null;
      if (
        item.shiftChange == undefined ||
        item.shiftChange == 'Chọn loại nghỉ phép'
      ) {
        dataPlan[mainIndex].ref_Code = null;
        dataPlan[mainIndex].isLocked = 0;
      } else {
        dataPlan[mainIndex].ref_Code = 'OFF';
        dataPlan[mainIndex].isLocked = 1;
      }
    }
    // }
    setMutate(e => !e);
    setVisibleBS(false);
    setDataIndexChange(true);
  };
  const onChangeMinute = ({
    item,
    index,
    value,
    isPress = true,
    isPlus,
    keyBusy,
  }) => {
    let valueTime;
    if (!isPress) {
      valueTime = parseInt(value);
    } else {
      valueTime =
        keyBusy == 'timeLate'
          ? isPlus
            ? item.timeLate + 5
            : item.timeLate - 5
          : isPlus
          ? item.timeEarlier + 5
          : item.timeEarlier - 5;
    }
    if (valueTime > 90) valueTime = 90;

    switch (keyBusy) {
      case 'timeLate':
        if (valueTime !== item.timeLate) {
          setDataIndexChange(true);
        } else {
          setDataIndexChange(false);
        }
        dataPlan[index].timeLate = valueTime > 0 ? valueTime : 0;
        break;
      case 'timeEarlier':
        if (valueTime !== item.timeEarlier) {
          setDataIndexChange(true);
        } else {
          setDataIndexChange(false);
        }
        dataPlan[index].timeEarlier = valueTime > 0 ? valueTime : 0;
        break;
    }

    setMutate(e => !e);
  };
  const handlerClearTextAndroid = async () => {
    setSearchText('');
  };
  const handlenotes = async (index, text, item, typeInput) => {
    switch (typeInput) {
      case 'SHIFT':
      case 'SHOP':
        dataPlan[index].notes = text;
        mainData[item.mainIndex].notes = text;
        break;
      case 'LATE':
        dataPlan[index].noteLate = text;
        mainData[item.mainIndex].noteLate = text;
        break;
      case 'EARLIER':
        dataPlan[index].noteEarlier = text;
        mainData[item.mainIndex].noteEarlier = text;
        break;
    }
  };
  const searchShiftAction = text => {
    if (text.length > 0) {
      const filterShift =
        typeBS == 'SHIFT'
          ? FilterDataModalBS.filter(
              i =>
                i.Name.toLowerCase().match(text.toLowerCase()) ||
                i.Ref_Code.toLowerCase().match(text.toLowerCase()),
            )
          : typeBS == 'NOTE'
          ? FilterDataModalBS.filter(
              i =>
                (i.title !== undefined &&
                  i.title.toLowerCase().match(text.toLowerCase())) ||
                i.Ref_Code.toLowerCase().match(text.toLowerCase()),
            )
          : FilterDataModalBS.filter(
              i =>
                i.ShopName !== undefined &&
                i.ShopName.toLowerCase().match(text.toLowerCase()),
            );
      setDataModalBS(filterShift);
    } else {
      setDataModalBS(FilterDataModalBS);
    }
  };
  const searchShops = text => {
    setSearchText(text);
    if (text && text !== undefined) {
      let filterShops = mainData.filter(
        i =>
          i.mainIndex === 0 ||
          i.shopName.toLowerCase().match(text.toLowerCase()) ||
          i.address.toLowerCase().match(text.toLowerCase()) ||
          i.shopCode.toLowerCase().match(text.toLowerCase()),
      );
      setDataPlan(filterShops);
    } else {
      setDataPlan(mainData);
    }
  };
  const dataMarkedDates = mDataWeek => {
    let markedDates = [],
      customDatesStyles = [];
    mDataWeek.forEach(e => {
      let i = 0;
      let date = moment(e.planDate).format('YYYY-MM-DD');
      let dots = [];
      dots.push({ color: e.colorPlan });
      markedDates.push({ date, dots });
      i++;
    });
    const ok = '#ff6600';
    customDatesStyles.push({
      startDate: new Date(),
      dateNameStyle: { color: ok },
      dateNumberStyle: { color: ok },
      highlightDateNameStyle: { color: ok },
      highlightDateNumberStyle: { color: ok },
    });
    setMarkedDates(markedDates);
    setCustomDatesStyles(customDatesStyles);
  };
  const handleSelectedChange = (item, index, value, typeBS) => {
    let listIndex = JSON.parse(dataPlan[0].listIndex);
    //console.log(listIndex);

    let checkOff = item.Ref_Code == 'OFF' ? 1 : 0;
    switch (typeBS) {
      case 'SHIFT':
        for (let i = 0, lenList = listIndex.length; i < lenList; i++) {
          let mainIndex = listIndex[i].MainIndex;
          if (mainIndex === 0) {
            dataPlan[mainIndex].shiftChange = value;
            dataPlan[mainIndex].reasonName = 'Chọn lí do thay đổi';
            dataPlan[mainIndex].ref_Code = item.Ref_Code;
            dataPlan[mainIndex].supConfirm = 3;
            //
            mainData[mainIndex].shiftChange = value;
            mainData[mainIndex].reasonName = 'Chọn lí do thay đổi';
            mainData[mainIndex].ref_Code = item.Ref_Code;
            mainData[mainIndex].supConfirm = 3;
          }
          dataPlan[mainIndex].isLocked = checkOff;
          mainData[mainIndex].isLocked = checkOff;
        }
        setDataIndexChange(true);
        handlerChangeDataBS(item);
        break;
      case 'NOTE':
        for (let i = 0, lenList = listIndex.length; i < lenList; i++) {
          let mainIndex = listIndex[i].MainIndex;
          if (mainIndex === 0) {
            dataPlan[mainIndex].reasonName = value;
            mainData[mainIndex].reasonName = value;
          }
          dataPlan[mainIndex].isLocked = checkOff;
          mainData[mainIndex].isLocked = checkOff;
        }
        setDataIndexChange(true);
        setVisibleBS(false);
        break;
      default:
        setDataIndexChange(false);
        break;
    }

    setMutate(e => !e);
  };
  const handlerChangeDataBS = item => {
    let changeItem = JSON.parse(dataPlan[0].refList).filter(
      i => i.Ref_Code == item.Ref_Code,
    );
    let dataModal = changeItem.map(i =>
      i.title == item.notes ? { ...i, isSelect: 1 } : i,
    );
    setDataModalBS(dataModal);
    setFilterDataModalBS(dataModal);
    setTypeBS('NOTE');
  };
  const handlerSave = async () => {
    setSearchText(null);
    if (!dataIndexChange) {
      alertWarning('Bạn chưa thực hiện thay đổi nào');
      return;
    }

    alertConfirm(
      'Thông báo',
      'Bạn có muốn thay đổi lịch làm việc như bên dưới không ?',
      async () => {
        let countShopAdd = 0;
        let contentMessage = '';
        let checkData = null;
        let dataSave = [];

        let itemOFF = dataPlan[0];
        // Check Off
        let dataShiftOFF = JSON.parse(itemOFF.shiftList).filter(
          c => c.Name == itemOFF.shiftChange,
        );
        let dataNote = JSON.parse(
          itemOFF.refList !== null ? itemOFF.refList : '[]',
        ).filter(s => s.title == itemOFF.reasonName);

        if (dataShiftOFF.length > 0 && dataNote.length == 0) {
          checkData = 'Vui lòng nhập lí do xin nghỉ phép';
        } else if (
          dataShiftOFF.length == 0 &&
          dataNote.length > 0 &&
          dataNote[0].Ref_Code == 'OFF'
        ) {
          checkData = 'Vui lòng chọn loại nghỉ phép';
        } else {
          if (dataNote.length > 0 && dataNote[0].Id == 100) {
            if (itemOFF.notes == null || itemOFF.notes.length == 0) {
              checkData = 'Vui lòng nhập lí do khác';
            } else if (itemOFF.notes.length < 5) {
              checkData = 'Lí do quá ngắn, vui lòng nhập lại';
            }
          }
        }
        let itemSaveOFF = {
          PlanId: itemOFF.planId,
          ShopId: itemOFF.shopId,
          PlanDate: itemOFF.auditDate,
          Status: itemOFF.status ? 1 : 0,
          LastStatus: itemOFF.lastStatus,
          ShiftType: itemOFF.shiftType,
          ShiftChange: dataShiftOFF.length > 0 ? dataShiftOFF[0].Code : null,
          ReasonId: dataNote.length > 0 ? dataNote[0].Id : null,
          Notes:
            dataNote.length > 0
              ? dataNote[0].Id == 100
                ? itemOFF.notes
                : dataNote[0].title
              : null,
          SupConfirm: itemOFF.supConfirm,
        };
        dataSave.push(itemSaveOFF);
        // Data Status Add Shop
        dataPlan.forEach((i, index) => {
          if (index == 0) return;
          // Check Add-Del Shop
          if (i.confirmShop == 3) {
            if (i.lastStatus == 'ADD' || i.lastStatus == 'DEL') {
              if (i.auditDate == moment(new Date()).format('YYYY-MM-DD')) {
                countShopAdd++;
              }
              if (
                moment(new Date()).isoWeek() == moment(dateSelected).isoWeek()
              ) {
                if (dataNote.length == 0) {
                  if (i.notes == null || i.notes.length == 0) {
                    checkData =
                      'Vui lòng nhập lí do thay đổi cửa hàng ' + i.shopName;
                  } else if (i.notes.length < 5) {
                    checkData =
                      'Lí do thay đổi cửa hàng ' + i.shopName + ' quá ngắn';
                  }
                }
              }
              let itemSave = {
                PlanId: i.planId,
                ShopId: i.shopId,
                PlanDate: i.auditDate,
                Status: i.status ? 1 : 0,
                LastStatus: i.lastStatus,
                ShiftType: i.shiftType,
                ShiftChange: null,
                ReasonId: null,
                Notes: i.notes,
                ConfirmPlan: i.confirmShop,
              };
              dataSave.push(itemSave);
            }
          }
          contentMessage =
            'Nhân viên ' +
            i.fullName +
            ' yêu cầu thay đổi lịch làm việc ngày ' +
            i.dateView;
        });
        if (checkData !== null) {
          alertWarning(checkData);
          return;
        }

        const data = {
          dataPlan: JSON.stringify(dataSave),
          contentMessage: contentMessage,
        };
        const result = await PLANSR_ACTION(data, itemOFF.parentList);
        if (result.statusId === 200) {
          alertNotify(result.messager);
          await LoadDataPlan(dateSelected);
        } else {
          alertError(result.messager);
        }
      },
    );
  };
  const RenderPressable = ({
    index,
    item,
    styles,
    appcolor,
    typeBS,
    listSelect,
    value,
    titleStyle = null,
  }) => {
    const handlePress = () => {
      switch (typeBS) {
        case 'NOTE':
          let changeItem =
            item.ref_Code == null
              ? listSelect.filter(i => i.Ref_Code == 'ON')
              : listSelect.filter(i => i.Ref_Code == item.ref_Code);
          setDataModalBS(
            changeItem.map(i =>
              i.title == item.reasonName ? { ...i, isSelect: 1 } : i,
            ),
          );
          setVisibleBS(true);
          setFilterDataModalBS(changeItem);
          break;
        case 'SHIFT':
          setDataModalBS(
            listSelect.map(i =>
              i.Name == item.shiftChange ? { ...i, isSelect: 1 } : i,
            ),
          );
          setFilterDataModalBS(listSelect);
          setVisibleBS(true);
          break;
        default:
          setDataModalBS(listSelect);
          setFilterDataModalBS(listSelect);
          setVisibleBS(true);
          break;
      }
      setTypeBS(typeBS);
      setItemPlan(item);
    };
    return (
      <View>
        <TouchableOpacity
          disabled={item.isLockShift == 1 ? true : false}
          style={[
            styles.inputShop,
            { flex: 1, flexDirection: 'row', alignItems: 'center' },
          ]}
          onPress={handlePress}
        >
          <Text
            style={{ ...titleStyle, color: appcolor.dark }}
            accessibilityHint="test"
          >
            {value}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const RenderTextInput = ({
    index,
    typeInput,
    item,
    value,
    styles,
    handlenotes,
    isLock,
  }) => {
    const handleChange = inputText => {
      handlenotes(index, inputText, item, typeInput);
    };
    return (
      <TextInput
        editable={isLock == 1 ? false : true}
        blurOnSubmit={true}
        defaultValue={value}
        multiline={true}
        style={[styles, { color: appcolor.dark }]}
        placeholderTextColor={appcolor.gray}
        placeholder="Ghi chú..."
        onChangeText={handleChange}
      />
    );
  };
  const renderItem = ({ item, index }) => {
    const isLockSwitch = item.isLockStatus === 1 ? true : false;
    const highlightShop =
      item.lastStatus !== null ? styles.shopAddContainer : styles.shopContainer;
    const colorStatusShift =
      item.colorStatusShift == '#' ? appcolor.dark : item.colorStatusShift;
    const colorConfirmShop =
      item.confirmShop == 1
        ? 'green'
        : item.confirmShop == -1
        ? appcolor.danger
        : appcolor.rejection;
    return (
      <View key={index}>
        {item.isParent && (
          <View style={{ flex: 1 }}>
            {item.checkWP > 0 && (
              <View style={styles.viewWorking}>
                {item.shiftName !== null && (
                  <Text
                    style={[
                      styles.titleView,
                      { color: appcolor.bluenavylight },
                    ]}
                  >
                    {'Ca hiện tại: ' + item.shiftName}
                  </Text>
                )}
                <Text style={[styles.titleView, { color: colorStatusShift }]}>
                  {item.shiftStatus}
                </Text>
                {item.supNote !== null && item.supNote.length > 0 && (
                  <Text style={[styles.titleView, { color: colorStatusShift }]}>
                    {item.supNote}
                  </Text>
                )}
                <RenderPressable
                  item={item}
                  styles={styles}
                  appcolor={appcolor}
                  typeBS="SHIFT"
                  listSelect={JSON.parse(item.shiftList)}
                  value={item.shiftChange}
                />
                <Text style={styles.titleView}>Lí do thay đổi</Text>
                <RenderPressable
                  index={index}
                  item={item}
                  styles={styles}
                  appcolor={appcolor}
                  typeBS="NOTE"
                  listSelect={JSON.parse(item.refList)}
                  value={item.reasonName}
                />
                <RenderTextInput
                  index={index}
                  typeInput="SHIFT"
                  item={item}
                  isLock={item.isLockShift}
                  value={item.notes}
                  handlenotes={handlenotes}
                  styles={[styles.inputShop, { marginTop: 5 }]}
                />
              </View>
            )}
          </View>
        )}
        {item.statusChangeShop !== undefined &&
          item.statusChangeShop.length > 0 && (
            <Text
              style={[
                styles.titleView,
                { color: colorConfirmShop, fontWeight: '500' },
              ]}
            >
              {' '}
              {item.statusChangeShop}
            </Text>
          )}
        {item.shopId !== item.employeeId && (
          <ListItem.Content
            style={[highlightShop, { borderLeftColor: item.colorPlan }]}
          >
            <View style={{ flex: 1 }}>
              <View style={[styles.itemShopContainer, { padding: 5 }]}>
                <View style={styles.iconContainer}>
                  <SpiralIcon
                    type="font-awesome-6"
                    name="store"
                    size={16}
                    style={styles.iconHeaderStyle}
                  />
                </View>
                <Text style={[styles.titleView, { width: '75%' }]}>
                  {item.shopName}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  {item.isLocked == 0 && (
                    <Switch
                      disabled={isLockSwitch}
                      style={styles.styleSwitchView}
                      ios_backgroundColor={appcolor.gray}
                      trackColor={{
                        true: appcolor.success,
                        false: appcolor.greylight,
                      }}
                      thumbColor={appcolor.dark}
                      //Event
                      value={item.status == 1}
                      onValueChange={value => toggleSwitch(item, index, value)}
                    />
                  )}
                </View>
              </View>
              <Text
                style={{
                  flex: 1,
                  paddingTop: 3,
                  paddingStart: 5,
                  fontSize: 13,
                  color: appcolor.dark,
                }}
              >
                {item.shopCode}
              </Text>
              <Text
                style={{
                  flex: 1,
                  paddingTop: 3,
                  paddingStart: 5,
                  fontSize: 13,
                  color: appcolor.dark,
                }}
              >
                {item.address}
              </Text>
              <RenderTextInput
                index={index}
                typeInput="SHOP"
                item={item}
                isLock={item.isLockStatus}
                value={item.notes}
                handlenotes={handlenotes}
                styles={[styles.inputShop, { marginTop: 5 }]}
              />
              {item.confirmPlanNote !== null &&
                item.confirmPlanNote.length > 0 && (
                  <Text
                    style={{
                      flex: 1,
                      padding: 8,
                      fontSize: 13,
                      color: appcolor.danger,
                    }}
                  >
                    {item.confirmPlanNote}
                  </Text>
                )}
            </View>
          </ListItem.Content>
        )}
      </View>
    );
  };
  const renderItemModal = (item, index, typeBS) => {
    const value =
      typeBS == 'SHIFT'
        ? item.Name
        : typeBS == 'NOTE'
        ? item.title
        : item.ShopName;
    const mPress = () => {
      handleSelectedChange(item, index, value, typeBS);
    };
    return (
      <ListItem
        bottomDivider
        onPress={mPress}
        containerStyle={{ backgroundColor: appcolor.background }}
      >
        <ListItem.Content>
          <ListItem.Title style={{ color: appcolor.dark, fontSize: 14 }}>
            {value}
          </ListItem.Title>
        </ListItem.Content>
        {item.isSelect == 1 && (
          <TouchableOpacity
            onPress={() => clearItemSelect(item, index, typeBS)}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="backspace"
              size={18}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        )}
      </ListItem>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    shopContainer: {
      margin: 5,
      padding: 5,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: appcolor.greylight,
    },
    shopAddContainer: {
      margin: 5,
      padding: 5,
      borderWidth: 1.5,
      borderRadius: 8,
      borderColor: appcolor.yellow,
      backgroundColor: appcolor.greylight,
    },
    itemShopContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 0,
      width: '100%',
    },
    itemShopText: {
      color: appcolor.dark,
      fontSize: 13,
      width: '90%',
      padding: 3,
    },
    iconContainer: {
      width: '10%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconHeaderStyle: { color: appcolor.bluenavylight },
    iconStyle: { color: appcolor.greylight },
    inputShop: {
      flex: 1,
      borderColor: appcolor.darklight,
      borderWidth: 0.5,
      borderRadius: 3,
      padding: 8,
    },
    checkBoxContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      width: '50%',
    },
    filterStyle: {
      width: '95%',
      fontSize: 13,
      alignSelf: 'center',
      borderWidth: 0.5,
      borderRadius: 8,
      borderColor: appcolor.greylight,
      padding: 8,
    },
    titleView: {
      color: appcolor.dark,
      fontWeight: '700',
      fontSize: 15,
      padding: 3,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      padding: 8,
    },
    viewWorking: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: appcolor.homebackground,
      padding: 8,
      margin: 8,
    },
    styleSwitchView: {
      ...(Platform.OS === 'ios' && {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
      }),
    },
    itemChangeTime: { flexDirection: 'row' },
  });
  useEffect(() => {
    LoadDataPlan();
  }, []);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 50}
    >
      <View style={{ flex: 1 }}>
        <HeaderCustom
          title={
            route?.params?.titlePage !== undefined &&
            route?.params?.titlePage.length > 0
              ? route?.params?.titlePage
              : 'Lịch làm việc SR'
          }
          leftFunc={() => navigation.goBack()}
          iconRight="cloud-upload-alt"
          rightFunc={handlerSave}
        />
        <View style={styles.mainContainer}>
          <CalendarStrip
            scrollable={true}
            scrollerPaging={true}
            style={{
              flexDirection: 'row',
              height: 80,
              paddingTop: 8,
              paddingBottom: 8,
            }}
            minDate={'2023-01-01'}
            calendarHeaderStyle={{ color: 'white', marginBottom: 16 }}
            calendarColor={DEFAULT_COLOR}
            dateNumberStyle={{ color: 'white' }}
            dateNameStyle={{ color: 'white' }}
            customDatesStyles={customDatesStyles}
            highlightDateContainerStyle={{ backgroundColor: 'white' }}
            highlightDateNumberStyle={{ color: 'black' }}
            highlightDateNameStyle={{ color: 'black' }}
            disabledDateNameStyle={{ color: 'grey' }}
            disabledDateNumberStyle={{ color: 'grey' }}
            iconLeft={require('../../Themes/Images/chevron-left.png')}
            iconRight={require('../../Themes/Images/chevron-right.png')}
            iconContainer={{ flex: 0.1 }}
            markedDates={markedDates}
            //Event
            scrollToOnSetSelectedDate={false}
            selectedDate={dateSelected}
            onDateSelected={date => {
              LoadDataPlan(date);
            }}
          />

          <FormGroup
            containerStyle={{ margin: 8, padding: 0, paddingEnd: 8 }}
            inputStyle={{ fontSize: 14 }}
            iconName="search"
            placeholder={'Tìm kiếm cửa hàng'}
            value={searchText}
            editable
            handleChangeForm={searchShops}
          />
          <LoadingView title={titleLoading} isLoading={refreshing} />
          <ScrollView
            style={{ flex: 1, paddingBottom: paddingTopIPX }}
            refreshControl={
              <RefreshControl
                progressBackgroundColor={appcolor.warning}
                colors={[appcolor.info, appcolor.warning]}
                titleColor={appcolor.onBackground}
                tintColor={appcolor.onBackground}
                refreshing={false}
                onRefresh={() => LoadDataPlan(dateSelected)}
              />
            }
          >
            <FlatList
              extraData={dataPlan}
              keyExtractor={(_, index) => index.toString()}
              data={dataPlan}
              renderItem={renderItem}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={20}
              windowSize={10}
            />
          </ScrollView>
        </View>

        <Modal animationType="slide" visible={visibleBS}>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: appcolor.background }}
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          >
            <View
              style={{
                padding: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: paddingTopIPX,
              }}
            >
              <Text
                h4
                style={{
                  padding: 8,
                  fontWeight: '500',
                  color: appcolor.dark,
                  textAlign: 'center',
                }}
              >
                {typeBS == 'SHIFT'
                  ? 'Xin phép'
                  : typeBS == 'NOTE'
                  ? 'Lí do chuyển ca'
                  : 'Danh sách cửa hàng'}
              </Text>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => setVisibleBS(false)}
              >
                <SpiralIcon
                  type="font-awesome-6"
                  name="times"
                  size={25}
                  color={appcolor.onSurfaceSecond}
                />
              </TouchableOpacity>
            </View>

            <FormGroup
              containerStyle={styles.filterStyle}
              placeholder={'Tìm kiếm ...'}
              defaultValue={searchText}
              editable
              handleChangeForm={searchShiftAction}
              multiline
              iconName="search"
            />
            <FlatList
              data={mDataModalBS}
              extraData={mDataModalBS}
              listKey="mDataModalBS"
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) =>
                renderItemModal(item, index, typeBS)
              }
            />
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};
export default WorkingPlanSR;
