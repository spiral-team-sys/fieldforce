import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  RefreshControl,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Image, ListItem, Divider, Icon as ICO } from '@rneui/themed';
import {
  GET_ListWeek,
  PLAN_ChangeShift,
  PLAN_WorkingLate,
  REGISTERPLAN_SavePlan,
  V2_REGISTERPLAN_GetCopyPlan,
  V2_REGISTERPLAN_GetByWeek,
} from '../../../Controller/PlanController';
import { URLDEFAULT } from '../../../Core/URLs';
import { alertWarning, alertConfirm, alertNotify } from '../../../Core/Utility';
import { groupDataByKey, debounce, UUIDGenerator } from '../../../Core/Helper';
import moment from 'moment';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

import NativeCamera from '../../../Control/NativeCamera';
import UploadController from '../../../Controller/UploadController';
import { deviceWidth } from '../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import {
  GetPhotosEvident,
  deletePhoto,
} from '../../../Controller/PhotoController';
import { useSelector } from 'react-redux';
import { LoadingView } from '../../../Control/ItemLoading/index';
const expandImage = 'IMAGE_SELECTION_EXPAND_MODAL';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const SUBMIT_SHIFT = 'SUBMIT_SHIFT';
const SUBMIT_LATE = 'SUBMIT_LATE';
const SUBMIT_EARLIER = 'SUBMIT_EARLIER';
const SUBMIT_IMAGE = 'SUBMIT_IMAGE';
const SHIFT = 'SHIFT';
const WEEK = 'WEEK';
const IMAGE = 'IMAGE';

const LG_WorkingPlanPC = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [mainData, setMainData] = useState([]);
  const [imageData, setImageData] = useState({});
  const [dataBS, setDataBS] = useState({});
  const [dataWeek, setDataWeek] = useState({});
  const [expanded, setExpanded] = useState({});
  const [currentBS, set_] = useState({});
  const [dataModified, set__] = useState({});
  const [currentWeek, setCurrentWeek] = useState({});
  const [shiftRegistered, setShiftRegistered] = useState({});
  const [visibleBS, setVisibleBS] = useState(false);
  const [_, setMutate] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [showIMV, setShowIMV] = useState(false);
  const [urlIMV, setUrlIMV] = useState();
  const listConfig = JSON.parse(kpiinfo?.reportItem || '{}');

  const loadListCopyPlan = async (currentWeek = null) => {
    await setRefreshing(true);
    try {
      setData([]);
      setImageData({});
      setExpanded({});
      let listWeek = [];
      let listPlan = [];

      await GET_ListWeek((_, responseJson) => {
        listWeek = responseJson || [];
        setDataWeek({ ...dataWeek, listWeek: responseJson || [] });
      });
      currentWeek = !currentWeek
        ? listWeek[0]
          ? listWeek.filter(e => e.value === moment().isoWeek())[0]
          : { value: moment().isoWeek() }
        : currentWeek;
      await V2_REGISTERPLAN_GetCopyPlan(
        currentWeek.fromDate,
        currentWeek.toDate,
        (_, responseJson) => {
          listPlan = responseJson;
        },
      );

      const { arr, anonymous } = groupDataByKey({
        arr: listPlan,
        key: 'workDate',
        func: mapDataAnonymous,
      });
      setData(JSON.parse(JSON.stringify(arr)));
      setMainData(JSON.parse(JSON.stringify(arr)));
      setDataBS({
        ...dataBS,
        shiftList: JSON.parse(arr?.[0]?.shiftList || '[]'),
        shiftListPrototype: JSON.parse(arr?.[0]?.shiftList || '[]'),
      });
      setShiftRegistered(anonymous.shiftRegistered || {});
      setCurrentWeek(currentWeek);
    } catch (e) {}
    await setRefreshing(false);
  };
  const callEffect = async (currentWeek = null) => {
    await setRefreshing(true);
    try {
      setData([]);
      setImageData({});
      setExpanded({});
      let listWeek = [];
      let listPlan = [];
      await GET_ListWeek((_, responseJson) => {
        listWeek = responseJson || [];
        setDataWeek({ ...dataWeek, listWeek: responseJson || [] });
      });
      currentWeek = !currentWeek
        ? listWeek[0]
          ? listWeek.filter(e => e.value === moment().isoWeek())[0]
          : { value: moment().isoWeek() }
        : currentWeek;
      // Get List Plan
      await V2_REGISTERPLAN_GetByWeek(
        currentWeek.fromDate,
        currentWeek.toDate,
        (_, responseJson) => {
          listPlan = responseJson || [];
        },
      );
      const { arr, anonymous } = groupDataByKey({
        arr: listPlan,
        key: 'workDate',
        func: mapDataAnonymous,
      });
      setData(JSON.parse(JSON.stringify(arr)));
      setMainData(JSON.parse(JSON.stringify(arr)));
      setDataBS({
        ...dataBS,
        shiftList: JSON.parse(arr?.[0]?.shiftList || '[]'),
        shiftListPrototype: JSON.parse(arr?.[0]?.shiftList || '[]'),
      });
      setShiftRegistered(anonymous.shiftRegistered || {});
      setCurrentWeek(currentWeek);
    } catch (e) {}
    await setRefreshing(false);
  };
  useEffect(() => {
    callEffect();
    return () => false;
  }, []);
  const mapDataAnonymous = (item, anonymous, index) => {
    // * Map Shift Registered
    const fromToObj = { code: item.shiftType };
    if (anonymous.shiftRegistered) {
      if (anonymous.shiftRegistered[item.workDate]) {
        anonymous.shiftRegistered[item.workDate][index] = fromToObj;
      } else {
        anonymous.shiftRegistered[item.workDate] = {};
        anonymous.shiftRegistered[item.workDate][index] = fromToObj;
      }
    } else {
      anonymous.shiftRegistered = {};
      anonymous.shiftRegistered[item.workDate] = {};
      anonymous.shiftRegistered[item.workDate][index] = fromToObj;
    }
  };
  const handleSubmit = (type, item) => {
    try {
      switch (type) {
        case SUBMIT_SHIFT:
          const currentDate = moment().format('YYYY-MM-DD');
          const countDayChange = moment(item.workDate, 'YYYY-MM-DD').diff(
            moment(currentDate, 'YYYY-MM-DD'),
            'days',
          );
          const minChangeDate = listConfig?.minChangeDate || 0;

          if (countDayChange <= minChangeDate && minChangeDate !== 0) {
            alertWarning(
              `Ngày đổi ca phải sau ${minChangeDate} ngày so với ngày hiện tại!`,
              'Thông báo',
              'top',
            );
            return;
          }

          if (!item.shiftChange) {
            alertWarning('Ca chuyển không được để trống');
            return;
          }
          if (
            item.shiftChange &&
            (!item.notes || item.notes?.trim().length < 5)
          ) {
            alertWarning(
              'Ghi chú không được để trống, ghi chú tối thiểu 5 ký tự',
            );
            return;
          }
          break;
        case SUBMIT_LATE:
          if (
            (item.timeLate &&
              (!item.noteLate || item.noteLate?.trim().length < 5)) ||
            (!item.timeLate && item.noteLate)
          ) {
            alertWarning(
              'Thời gian hoặc ghi chú không được để trống, ghi chú tối thiểu 5 ký tự',
            );
            return;
          }
          break;
        case SUBMIT_EARLIER:
          if (
            (item.timeEarlier &&
              (!item.noteEarlier || item.noteEarlier?.trim().length < 5)) ||
            (!item.timeEarlier && item.noteEarlier)
          ) {
            alertWarning(
              'Thời gian hoặc ghi chú không được để trống, ghi chú tối thiểu 5 ký tự',
            );
            return;
          }
          break;
      }
      alertConfirm(
        'Thông báo',
        `Bạn có chắc chắn muốn gửi ${
          type == SUBMIT_IMAGE ? 'hình ảnh' : 'đề xuất thay đổi'
        }?`,
        async () => {
          switch (type) {
            case SUBMIT_SHIFT:
              await PLAN_ChangeShift(
                {
                  ...item,
                  contentMessage:
                    'Nhân viên ' +
                    item.fullName +
                    ' yêu cầu thay đổi lịch làm việc ngày ' +
                    item.workDate,
                },
                e => onAfterUpdate(e),
              );
              break;
            case SUBMIT_LATE:
              await PLAN_WorkingLate(
                {
                  ...item,
                  contentMessage:
                    'Nhân viên ' +
                    item.fullName +
                    ' xin phép đi trễ ngày ' +
                    item.workDate,
                },
                true,
                e => onAfterUpdate(e),
              );
              break;
            case SUBMIT_EARLIER:
              await PLAN_WorkingLate(
                {
                  ...item,
                  contentMessage:
                    'Nhân viên ' +
                    item.fullName +
                    ' xin phép về sớm ngày ' +
                    item.workDate,
                },
                false,
                e => onAfterUpdate(e),
              );
              break;
            case SUBMIT_IMAGE:
              const workInfo = {
                shopId: item.shopId,
                workDate: item.auditDate,
                reportId: item.reportId,
              };
              const result = await UploadController.DataPhoto(workInfo);
              alertNotify(result.messager || '');
              if (result.statusId === 200) {
                await UploadController.PostFile();
              }
              await photoEvidentResult(item);
              break;
          }
        },
      );
    } catch (e) {
      console.log(e);
    }
  };
  const onAfterUpdate = result => {
    alertNotify(result.msg);
    if (result.status === 200) {
      callEffect(currentWeek);
    }
  };
  const onCopySavePlan = () => {
    try {
      if (data.length > 0) {
        // * Save
        for (let i = 0, lenData = data.length; i < lenData; i++) {
          const { shiftType, workDate, shopName } = data[i];
          const checkDataByDate = data.filter(
            item => item.workDate == workDate && item.shiftType !== null,
          );
          if (checkDataByDate.length == 0) {
            if (
              shiftType === null ||
              shiftType === '' ||
              shiftType === undefined
            ) {
              alertWarning(
                `Vui lòng chọn ca làm việc (Ngày: "${workDate}" - Shop: "${shopName}"`,
              );
              return;
            }
          }
        }
        alertConfirm(
          'Thông báo',
          'Bạn có muốn lưu lịch làm việc không?',
          async () => {
            await REGISTERPLAN_SavePlan(currentWeek.value, data, async msg => {
              alertNotify(msg);
              await callEffect(currentWeek);
            });
          },
        );
      } else {
        // * Copy
        alertConfirm(
          'Thông báo',
          'Hệ thống sẽ sao chép lịch làm việc của tuần gần nhất cho tuần này, bạn có muốn sao chép không?',
          async () => {
            await loadListCopyPlan(currentWeek);
          },
        );
      }
    } catch (e) {}
  };
  const assignData = (index, key, value) => {
    try {
      const mainIndex = data[index].stt;
      data[index][key] = value;
      mainData[mainIndex][key] = value;
    } catch (e) {}
  };
  const addToModifedList = index => {
    const mainIndex = data[index].stt;
    dataModified[mainIndex] = true;
  };
  const handleExpanded = (showState, hideState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    expanded[showState] = expanded[showState] === true ? false : true;
    expanded[hideState] = false;
    setMutate(e => !e);
  };
  const colorStatus = confirmedStatus => {
    return confirmedStatus === 1
      ? appcolor.helper
      : confirmedStatus === -1 || confirmedStatus === -2
      ? appcolor.danger
      : confirmedStatus === 3
      ? appcolor.rejection
      : appcolor.dark;
  };
  const handleDisplayBS = async (
    type,
    index = -1,
    isPastOrPresentWeek = true,
    item,
  ) => {
    let list = [],
      label = '';
    switch (type) {
      case WEEK:
        list = dataWeek.listWeek;
        label = currentWeek.label;
        break;
      case SHIFT:
        dataBS.shiftListPrototype = JSON.parse(item.shiftList);
        //
        const tempShift = [];
        const listShift = JSON.parse(JSON.stringify(dataBS.shiftListPrototype));
        for (let i = 0, lenArr = listShift.length; i < lenArr; i++) {
          let isValidShift = true,
            isShiftExisted = false;
          for (const value of Object.values(
            shiftRegistered[data[index].workDate],
          )) {
            if (listShift[i].Code === value.code) {
              listShift[i].isShiftExisted = true;
              isShiftExisted = true;
              isValidShift = false;
            }
          }
          if (isShiftExisted) {
            tempShift.push(listShift[i]);
          }
          if (isValidShift) {
            listShift[i].isShiftSelectable = true;
            tempShift.push(listShift[i]);
          }
        }
        dataBS.shiftList = tempShift;
        list = tempShift;
        // * case change future week's shift
        if (!isPastOrPresentWeek) {
          label = data[index].shiftType;
        } else {
          label = data[index].shiftChange;
        }
        break;
      case IMAGE:
        const imageData = await GetPhotosEvident(
          item.shopId,
          item.auditDate,
          item.reportId,
        );
        list = imageData;
        expandImage[expandImage] = false;
        break;
    }
    currentBS.type = type;
    currentBS.list = list;
    currentBS.index = index;
    currentBS.label = label;
    currentBS.isPastOrPresentWeek = isPastOrPresentWeek;
    setVisibleBS(true);
  };
  const onChangeNote = debounce((value, index, key) => {
    assignData(index, key, value);
    addToModifedList(index);
    switch (key) {
      case 'notes':
        if (!value) {
          assignData(index, 'forgotNoteShift', true);
        } else {
          assignData(index, 'forgotNoteShift', false);
        }
        if (value && value.length < 5) {
          assignData(index, 'forgotNoteShift', true);
        }
        break;
      case 'noteLate':
        const timeLate = data[index].timeLate;
        if ((timeLate === 0 || !timeLate) && value) {
          assignData(index, 'forgotTimeLate', true);
        } else if (timeLate && !value) {
          assignData(index, 'forgotNoteLate', true);
        } else if (
          (timeLate && value) ||
          ((timeLate === 0 || !timeLate) && !value)
        ) {
          assignData(index, 'forgotNoteLate', false);
          assignData(index, 'forgotTimeLate', false);
        }
        if (value && value.length < 5) {
          assignData(index, 'forgotNoteLate', true);
        }
        break;
      case 'noteEarlier':
        const timeEarlier = data[index].timeEarlier;
        if ((timeEarlier === 0 || !timeEarlier) && value) {
          assignData(index, 'forgotTimeEarlier', true);
        } else if (timeEarlier && !value) {
          assignData(index, 'forgotNoteEarlier', true);
        } else if (
          (timeEarlier && value) ||
          ((timeEarlier === 0 || !timeEarlier) && !value)
        ) {
          assignData(index, 'forgotNoteEarlier', false);
          assignData(index, 'forgotTimeEarlier', false);
        }
        if (value && value.length < 5) {
          assignData(index, 'forgotNoteEarlier', true);
        }
        break;
    }
    setMutate(e => !e);
  }, 700);
  const onChangeMinute = async ({
    value,
    isPress = true,
    index,
    isPlus,
    keyBusy,
  }) => {
    const mainIndex = data[index].stt;
    const prevValue = data[index][keyBusy];
    if (isPress) {
      const ceilNum = 5 * Math.ceil(prevValue / 5) - prevValue;
      const floorNum = prevValue - 5 * Math.floor(prevValue / 5);
      const nextValue =
        isPlus && prevValue <= 90
          ? ceilNum === 0 && prevValue < 90
            ? 5
            : ceilNum
          : prevValue > 0
          ? floorNum === 0
            ? -5
            : -floorNum
          : 0;
      if (prevValue !== undefined) {
        data[index][keyBusy] += nextValue;
        mainData[mainIndex][keyBusy] += nextValue;
      } else {
        data[index][keyBusy] = isPlus ? 5 : 0;
        mainData[mainIndex][keyBusy] = isPlus ? 5 : 0;
      }
    } else {
      if (isNaN(value)) return;
      let nextValue = null;
      if (value) {
        if (value >= 90) nextValue = 90;
        else if (value <= 0) nextValue = 0;
        else nextValue = +value;
      } else {
        nextValue = 0;
      }
      data[index][keyBusy] = nextValue;
      mainData[mainIndex][keyBusy] = nextValue;
    }
    addToModifedList(index);
    setMutate(e => !e);
    let checkNoteLate,
      checkNoteEarlier,
      checkTimeLate = false;
    if (keyBusy === 'timeLate') {
      // * Clear Forgot
      if (data[index][keyBusy] == 0 && data[index].noteLate) {
        checkTimeLate = true;
      }
      assignData(index, 'forgotTimeLate', checkTimeLate);
      // * Check Forgot Late
      if (
        (!data[index].noteLate ||
          (data[index].noteLate && data[index].noteLate.length < 5)) &&
        data[index][keyBusy]
      )
        checkNoteLate = true;
      else checkNoteLate = false;
      assignData(index, 'forgotNoteLate', checkNoteLate);
    }
    if (keyBusy === 'timeEarlier') {
      // * Clear Forgot
      assignData(index, 'forgotTimeEarlier', false);
      // * Check Forgot Late
      if (
        (!data[index].noteEarlier ||
          (data[index].noteEarlier && data[index].noteEarlier.length < 5)) &&
        data[index][keyBusy]
      )
        checkNoteEarlier = true;
      else checkNoteEarlier = false;
      assignData(index, 'forgotNoteEarlier', checkNoteEarlier);
    }
  };
  const onSelectItemBS = item => {
    const { type, index, isPastOrPresentWeek } = currentBS;
    switch (type) {
      case WEEK:
        setCurrentWeek(item);
        callEffect(item);
        break;
      case SHIFT:
        if (!item.isShiftSelectable && item.ShiftGroup == 'ON') {
          alertWarning('Trùng ca trong ngày!');
          return;
        }
        // * case change future week's shift
        if (!isPastOrPresentWeek) {
          assignData(index, 'shiftType', item.Code);
          assignData(index, 'shiftTypeName', item.Name);
        } else {
          assignData(index, 'shiftChange', item.Code);
          assignData(index, 'shiftChangeName', item.Name);
        }
        // * Reassign Shift Registered
        const mainIndex = data[index].stt;
        shiftRegistered[data[index].workDate] = {
          ...shiftRegistered[data[index].workDate],
          [mainIndex]: { code: item.Code },
        };
        assignData(index, 'forgotNoteShift', true);
        break;
    }
    setVisibleBS(false);
  };
  const onClearItemSelectedBS = index => {
    addToModifedList(index);
    clearValue(index);
    setVisibleBS(false);
  };
  const clearValue = index => {
    clearForgot(index);
    assignData(index, 'shiftChange', null);
    assignData(index, 'shiftChangeName', null);
    assignData(index, 'notes', null);
    // * Reassign from to
    const mainIndex = data[index].stt;
    delete shiftRegistered[data[index].workDate][mainIndex];
  };
  const clearForgot = index => {
    assignData(index, 'forgotSelectShift', false);
    assignData(index, 'forgotNoteShift', false);
  };
  const cameraLaunch = async item => {
    const photoinfo = {
      shopId: item.shopId,
      shopCode: item.shopCode,
      reportId: item.reportId,
      photoDate: item.auditDate,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_FILE',
      photoDesc: null,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, res =>
      photoEvidentResult(item, res),
    );
  };
  const imageGalleryLaunch = async item => {
    const photoinfo = {
      shopId: item.shopId,
      shopCode: item.shopCode,
      reportId: item.reportId,
      photoDate: item.auditDate,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_FILE',
      photoDesc: null,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, res =>
      photoEvidentResult(item, res),
    );
  };
  const photoEvidentResult = async (item, res) => {
    const imageData = await GetPhotosEvident(
      item.shopId,
      item.auditDate,
      item.reportId,
    );
    currentBS.list = imageData;
    setMutate(e => !e);
  };
  const onSaveImage = async res => {
    try {
      const { index } = currentBS;
      let photoMore = [];
      if (data[index].photoMore === undefined) {
        photoMore = [res.uri];
      } else {
        photoMore = JSON.parse(data[index].photoMore);
        photoMore.push(res.uri);
      }
      if (imageData[index] === undefined) {
        // * Data Submit
        imageData[index] = [
          { fileName: escape(res.fileName), imageBase64: res.base64 },
        ];
      } else {
        imageData[index].push({
          fileName: escape(res.fileName),
          imageBase64: res.base64,
        });
      }
      currentBS.list = photoMore;
      await assignData(index, 'photoMore', JSON.stringify(photoMore));
      expanded[expandImage] = false;
      setMutate(e => !e);
    } catch (e) {}
  };
  const handleRemoveImage = async (item, indexImage) => {
    currentBS.list.splice(indexImage, 1);
    await deletePhoto(item);
    setMutate(e => !e);
  };
  const renderItem = ({ item, index }) => {
    const {
      workDate,
      shopName,
      address,
      shiftTypeName,
      shiftChange,
      shiftChangeName,
      checkIn1,
      checkOut1,
      checkIn2,
      checkOut2,
      totalTime,
      isParent,
    } = item;
    const shiftExpand = `shift_${index}`;
    const busyExpand = `busy_${index}`;
    const confirmShift = item.confirm;
    const confirmLate = item.confirmLate;
    const confirmEarlier = item.confirmEarlier;

    const isShiftEditable = item.isShiftEditable == 1 ? false : true;
    const isLateEditable = item.isLateEditable == 1 ? false : true;
    const isEarlierEditable = item.isEarlierEditable == 1 ? false : true;

    return (
      <View
        key={index}
        style={{
          width: '100%',
          alignSelf: 'center',
          marginBottom: isParent ? 8 : 0,
        }}
      >
        {isParent && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padidng: 7,
              marginLeft: 15,
            }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="calendar-check"
              color={appcolor.dark}
              size={20}
            />
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 18,
                fontWeight: '700',
                marginLeft: 10,
              }}
            >
              {moment(workDate).format('dddd, DD MMMM YY')}
            </Text>
          </View>
        )}
        <View
          style={{
            backgroundColor: appcolor.light,
            borderRadius: 10,
            padding: 10,
            margin: 8,
          }}
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                width: '90%',
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 8,
                paddingEnd: 8,
              }}
            >
              <SpiralIcon
                type="font-awesome-6"
                name="store"
                size={17}
                style={{ width: 30, textAlign: 'center' }}
                color={appcolor.dark}
              />
              <Text
                style={{
                  color: appcolor.dark,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >{`Cửa hàng: ${shopName}`}</Text>
            </View>
            {item.isEvident == 1 && (
              <TouchableOpacity
                style={{
                  width: '10%',
                  alignItems: 'center',
                  backgroundColor: appcolor.bluenavylight,
                  padding: 8,
                  borderRadius: 20,
                }}
                onPress={() => handleDisplayBS(IMAGE, index, true, item)}
              >
                <SpiralIcon
                  type="font-awesome-6"
                  solid
                  name="file-image"
                  size={20}
                  color={appcolor.light}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="map-marked-alt"
              size={17}
              style={{ width: 30, textAlign: 'center' }}
              color={appcolor.dark}
            />
            <Text
              style={{ color: appcolor.dark, fontSize: 15 }}
            >{`Địa chỉ: ${address}`}</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              item.confirmPlan == 1
                ? null
                : handleDisplayBS(SHIFT, index, false, item);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 8,
              paddingBottom: 8,
              paddingEnd: 8,
            }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="business-time"
              size={17}
              style={{ width: 30, textAlign: 'center' }}
              color={appcolor.dark}
            />
            <Text
              style={{ color: appcolor.dark, fontSize: 15 }}
            >{`Ca hiện tại: ${shiftTypeName || ''}`}</Text>
          </TouchableOpacity>

          {item.confirmPlan == 1 &&
            shiftChange !== null &&
            shiftChange !== '' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingEnd: 8,
                }}
              >
                <SpiralIcon
                  type="font-awesome-6"
                  name="sync"
                  size={17}
                  style={{ width: 30, textAlign: 'center' }}
                  color={appcolor.dark}
                />
                <Text
                  style={{
                    color: appcolor.dark,
                    fontSize: 15,
                    fontStyle: 'italic',
                    paddingEnd: 8,
                  }}
                >{`Ca chuyển: ${shiftChangeName}`}</Text>
              </View>
            )}
          {item.confirmPlan == 1 && (
            <View>
              <View
                style={{
                  height: 0.5,
                  width: '100%',
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: appcolor.greylight,
                }}
              />
              <View style={{ flexDirection: 'row' }}>
                <View
                  style={[
                    styles.itemShopContainer,
                    { width: '49.5%', justifyContent: 'center' },
                  ]}
                >
                  <RenderExpandBtn
                    appcolor={appcolor}
                    setExpanded={setExpanded}
                    expanded={expanded}
                    isShift={true}
                    shiftStatus={item.shiftStatus ? item.shiftStatus : 'Đổi ca'}
                    colorStatus={colorStatus}
                    showState={shiftExpand}
                    hideState={busyExpand}
                    handleExpanded={handleExpanded}
                    confirmShift={confirmShift}
                  />
                </View>
                <View
                  style={{
                    height: 40,
                    width: '1%',
                    backgroundColor: 'rgb(50,51,52)',
                    borderRadius: 20,
                  }}
                />
                <View
                  style={[
                    styles.itemShopContainer,
                    { width: '49.5%', justifyContent: 'center' },
                  ]}
                >
                  <RenderExpandBtn
                    appcolor={appcolor}
                    setExpanded={setExpanded}
                    expanded={expanded}
                    lateStatus={item.lateStatus ? item.lateStatus : 'Đi trễ'}
                    earlierStatus={
                      item.earlierStatus ? item.earlierStatus : 'Về sớm'
                    }
                    showState={busyExpand}
                    hideState={shiftExpand}
                    handleExpanded={handleExpanded}
                    confirmLate={confirmLate}
                    confirmEarlier={confirmEarlier}
                    colorStatus={colorStatus}
                  />
                </View>
              </View>
            </View>
          )}
          {expanded[shiftExpand] === true && (
            <View style={styles.expandItem}>
              <View style={{ width: '95%' }}>
                {(confirmShift === 1 || confirmShift === -1) &&
                  item.confirmNote !== null && (
                    <View style={styles.iconContainer}>
                      <SpiralIcon
                        type="font-awesome-6"
                        name={confirmShift === 1 ? 'comment' : 'comment-slash'}
                        size={17}
                        style={[
                          styles.iconStyle,
                          {
                            color:
                              confirmShift === 1
                                ? appcolor.helper
                                : appcolor.danger,
                          },
                        ]}
                      />
                      <Text
                        style={{
                          color:
                            confirmShift === 1
                              ? appcolor.helper
                              : appcolor.danger,
                          padding: 7,
                        }}
                      >{`Ghi chú của quản lý: ${item.confirmNote || ''}`}</Text>
                    </View>
                  )}
                <View style={styles.iconContainer}>
                  <SpiralIcon
                    type="font-awesome-6"
                    name="sync"
                    size={17}
                    style={styles.iconStyle}
                  />
                  <RenderButtonDisplayBS
                    handleDisplayBS={handleDisplayBS}
                    item={item}
                    keyForgot={'forgotSelectShift'}
                    index={index}
                    styles={styles}
                    appcolor={appcolor}
                    value={'Chọn ca đổi'}
                    isEditable={isShiftEditable}
                    type={SHIFT}
                  />
                </View>
                <RenderTextNote
                  defaultValue={item.notes}
                  index={index}
                  item={item}
                  editable={isShiftEditable}
                  onChangeNote={onChangeNote}
                  appcolor={appcolor}
                  keyEdit={'notes'}
                  keyForgot={'forgotNoteShift'}
                />
                {isShiftEditable && (
                  <TouchableOpacity
                    onPress={() => handleSubmit(SUBMIT_SHIFT, item)}
                    style={{
                      height: 40,
                      marginTop: 10,
                      backgroundColor: appcolor.secondary,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: appcolor.white,
                      }}
                    >
                      Xin đổi ca
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {expanded[busyExpand] === true && (
            <View style={styles.expandItem}>
              <View style={{ width: '95%' }}>
                <View style={styles.iconContainer}>
                  <SpiralIcon
                    type="font-awesome-6"
                    name="clock"
                    size={17}
                    style={styles.iconStyle}
                  />
                  <Text style={{ color: appcolor.dark }}>
                    Xin đi trễ (phút)
                  </Text>
                </View>
                {(confirmLate === 1 || confirmLate === -1) && (
                  <View style={styles.iconContainer}>
                    <SpiralIcon
                      type="font-awesome-6"
                      name={confirmLate === 1 ? 'comment' : 'comment-slash'}
                      size={17}
                      style={[
                        styles.iconStyle,
                        {
                          color:
                            confirmLate === 1
                              ? appcolor.helper
                              : appcolor.danger,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        color:
                          confirmLate === 1 ? appcolor.helper : appcolor.danger,
                        padding: 7,
                      }}
                    >{`Ghi chú của quản lý: ${
                      item.confirmNoteLate || ''
                    }`}</Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <View style={{ width: '100%', marginBottom: 10 }}>
                    <RenderTextMinute
                      index={index}
                      item={item}
                      keyForgot={'forgotTimeLate'}
                      value={item.timeLate?.toString()}
                      styles={styles}
                      appcolor={appcolor}
                      onChangeMinute={onChangeMinute}
                      keyBusy={'timeLate'}
                      iconName="hourglass-start"
                      isBusyEditable={isLateEditable}
                    />
                  </View>
                  {isLateEditable && (
                    <RenderChangeMinute
                      keyBusy="timeLate"
                      index={index}
                      onChangeMinute={onChangeMinute}
                      appcolor={appcolor}
                    />
                  )}
                </View>
                <RenderTextNote
                  defaultValue={item.noteLate}
                  index={index}
                  item={item}
                  editable={isLateEditable}
                  onChangeNote={onChangeNote}
                  appcolor={appcolor}
                  keyEdit={'noteLate'}
                  keyForgot={'forgotNoteLate'}
                />
                {isLateEditable && (
                  <TouchableOpacity
                    onPress={() => handleSubmit(SUBMIT_LATE, item)}
                    style={{
                      height: 40,
                      marginTop: 10,
                      backgroundColor: appcolor.secondary,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: appcolor.white,
                      }}
                    >
                      Xin đi trễ
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={styles.iconContainer}>
                  <SpiralIcon
                    type="font-awesome-6"
                    name="clock"
                    size={17}
                    style={styles.iconStyle}
                  />
                  <Text style={{ color: appcolor.dark }}>
                    Xin về sớm (phút)
                  </Text>
                </View>
                {(confirmEarlier === 1 || confirmEarlier === -1) && (
                  <View style={styles.iconContainer}>
                    <SpiralIcon
                      type="font-awesome-6"
                      name={confirmEarlier === 1 ? 'comment' : 'comment-slash'}
                      size={17}
                      style={[
                        styles.iconStyle,
                        {
                          color:
                            confirmEarlier === 1
                              ? appcolor.helper
                              : appcolor.danger,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        color:
                          confirmEarlier === 1
                            ? appcolor.helper
                            : appcolor.danger,
                        padding: 7,
                      }}
                    >{`Ghi chú của quản lý: ${
                      item.confirmNoteEarlier || ''
                    }`}</Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <View style={{ width: '100%', marginBottom: 10 }}>
                    <RenderTextMinute
                      index={index}
                      item={item}
                      keyForgot={'forgotTimeEarlier'}
                      value={item.timeEarlier?.toString()}
                      styles={styles}
                      appcolor={appcolor}
                      onChangeMinute={onChangeMinute}
                      keyBusy={'timeEarlier'}
                      iconName="hourglass-end"
                      isBusyEditable={isEarlierEditable}
                    />
                  </View>
                  {isEarlierEditable && (
                    <RenderChangeMinute
                      keyBusy="timeEarlier"
                      index={index}
                      onChangeMinute={onChangeMinute}
                      appcolor={appcolor}
                    />
                  )}
                </View>
                <RenderTextNote
                  defaultValue={item.noteEarlier}
                  index={index}
                  item={item}
                  editable={isEarlierEditable}
                  onChangeNote={onChangeNote}
                  appcolor={appcolor}
                  keyEdit={'noteEarlier'}
                  keyForgot={'forgotNoteEarlier'}
                />
                {isEarlierEditable && (
                  <TouchableOpacity
                    onPress={() => handleSubmit(SUBMIT_EARLIER, item)}
                    style={{
                      height: 40,
                      marginTop: 10,
                      backgroundColor: appcolor.secondary,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: appcolor.white,
                      }}
                    >
                      Xin về sớm
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {disableCopyButton && (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 17,
                padding: 8,
                color: appcolor.dark,
              }}
            >
              {totalTime}
            </Text>
          )}
          {disableCopyButton && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignSelf: 'center',
              }}
            >
              <RenderViewPhotoAttendant
                setShowImage={setShowIMV}
                setUrl={setUrlIMV}
                imageURL={checkIn1}
                timeValue={item.timeIn1}
                appcolor={appcolor}
              />
              <RenderViewPhotoAttendant
                setShowImage={setShowIMV}
                setUrl={setUrlIMV}
                imageURL={checkOut1}
                timeValue={item.timeOut1}
                appcolor={appcolor}
              />
            </View>
          )}
          {disableCopyButton && item.photoAttendant > 2 && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignSelf: 'center',
              }}
            >
              <RenderViewPhotoAttendant
                setShowImage={setShowIMV}
                setUrl={setUrlIMV}
                imageURL={checkIn2}
                timeValue={item.timeIn2}
                appcolor={appcolor}
              />
              <RenderViewPhotoAttendant
                setShowImage={setShowIMV}
                setUrl={setUrlIMV}
                imageURL={checkOut2}
                timeValue={item.timeOut2}
                appcolor={appcolor}
              />
            </View>
          )}
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      height: '100%',
      borderTopLeftRadius: 30,
      backgroundColor: appcolor.homebackground,
      marginTop: 0,
      borderWidth: 0,
      borderTopRightRadius: 30,
      marginLeft: 0,
      marginRight: 0,
      width: deviceWidth,
    },
    shopContainer: {
      padding: 10,
      backgroundColor: appcolor.white,
      marginTop: 0,
    },
    itemShopContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 2,
      width: '100%',
    },
    itemShopText: {
      color: appcolor.dark,
      fontSize: 14,
      width: '90%',
      padding: 7,
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      padding: 5,
      paddingLeft: 0,
    },
    iconStyle: {
      color: appcolor.dark,
      marginRight: 0,
      width: '10%',
      textAlign: 'center',
    },
    workdateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: 10,
    },
    expandItem: {
      width: '100%',
      alignItems: 'center',
      display: 'flex',
      alignItems: 'center',
      padding: 7,
    },
    imageDetail: { textAlign: 'center', fontSize: 15 },
    styleViewSelectImage: {
      flexDirection: 'row',
      width: '95%',
      backgroundColor: appcolor.light,
      borderRadius: 10,
      padding: 8,
      alignSelf: 'center',
      marginTop: 8,
    },
  });

  const textCopyButton =
    currentWeek.isWeekNow == 0 && data.length === 0 ? 'Copy' : 'Save';
  // const disableCopyButton = currentWeek.year == moment().year() ? currentWeek.value <= moment().isoWeek() : (currentWeek.year > moment().year() ? false : true)
  const disableCopyButton = currentWeek.disableCopyButton == 1;

  const checkSaveWeekNow = currentWeek.checkSaveWeek == 1;
  const isConfirmPlan = mainData[0]?.isLockSavePlan == 1;

  const colorTextHeader = appcolor.light;
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.homebackground }}>
      {showIMV && (
        <View
          style={{
            width: '100%',
            height: '100%',
            marginTop: 30,
            borderRadius: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowIMV(false)}
            style={{ position: 'absolute', padding: 20, right: 5, zIndex: 2 }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="times"
              size={26}
              color={appcolor.dark}
            ></SpiralIcon>
          </TouchableOpacity>
          <ImageBackground
            source={{ uri: urlIMV }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 5,
              zIndex: 1,
            }}
            resizeMode={'contain'}
          />
        </View>
      )}
      <HeaderCustom
        title={route?.params?.menuitem.menuNameVN || 'Lịch làm việc PC'}
        iconRight={
          isConfirmPlan
            ? null
            : textCopyButton == 'Copy' && !disableCopyButton
            ? 'copy'
            : !disableCopyButton || checkSaveWeekNow
            ? 'cloud-upload-alt'
            : null
        }
        leftFunc={() => navigation.goBack()}
        rightFunc={() => {
          textCopyButton == 'Copy'
            ? onCopySavePlan()
            : !disableCopyButton || checkSaveWeekNow
            ? onCopySavePlan()
            : null;
        }}
      />
      <LoadingView
        title="Đang cập nhật dữ liệu"
        isLoading={refreshing}
        styles={{ marginTop: 8, zIndex: 100 }}
      />

      {currentWeek.label !== undefined && (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', height: 45 }}
        >
          <TouchableOpacity
            onPress={() => handleDisplayBS(WEEK)}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: appcolor.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                type="font-awesome-6"
                name="calendar-week"
                size={18}
                color={colorTextHeader}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: colorTextHeader,
                  marginLeft: 5,
                }}
              >
                {currentWeek.label || '-'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {!refreshing && data.length === 0 && (
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginTop: 20,
          }}
        >
          <Text style={{ color: appcolor.dark, fontSize: 18 }}>
            Không Có Dữ Liệu
          </Text>
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={data}
          nestedScrollEnabled={true}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              progressBackgroundColor={appcolor.yellow}
              colors={[appcolor.blue, appcolor.bluedark, appcolor.switchEnable]}
              title="Đang tải dữ liệu..."
              titleColor={appcolor.dark}
              tintColor={appcolor.dark}
              refreshing={false}
              onRefresh={() => callEffect(currentWeek)}
            />
          }
        />
      </KeyboardAvoidingView>
      <Modal animationType="slide" visible={visibleBS}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: appcolor.light,
              padding: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: appcolor.dark,
                  fontWeight: '700',
                }}
              >
                {currentBS.type === WEEK
                  ? 'Chọn Tuần'
                  : currentBS.type === SHIFT
                  ? 'Chọn Ca Làm Việc'
                  : 'Hình ảnh xác minh'}
              </Text>
              <TouchableOpacity onPress={() => setVisibleBS(false)}>
                <ICO name="close" size={28} color={appcolor.dark} />
              </TouchableOpacity>
            </View>
            {currentBS.type === IMAGE ? (
              <RenderImageModal
                styles={styles}
                appcolor={appcolor}
                currentBS={currentBS}
                data={data}
                handleExpanded={handleExpanded}
                handleRemoveImage={handleRemoveImage}
                handleSubmit={handleSubmit}
                cameraLaunch={cameraLaunch}
                imageGalleryLaunch={imageGalleryLaunch}
                expanded={expanded}
              />
            ) : (
              <RenderContentModal
                currentBS={currentBS}
                onSelectItemBS={onSelectItemBS}
                onClearItemSelectedBS={onClearItemSelectedBS}
                appcolor={appcolor}
              />
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
export default LG_WorkingPlanPC;

const RenderContentModal = ({
  appcolor,
  onSelectItemBS,
  currentBS,
  onClearItemSelectedBS,
}) => {
  const key = currentBS.type === WEEK ? 'label' : 'Name';
  const keyCheckExist = currentBS.type === WEEK ? 'label' : 'Code';
  return (
    <FlatList
      showsVerticalScrollIndicator={true}
      data={currentBS.list}
      listKey="list"
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => {
        const isExist = currentBS.label === item[keyCheckExist];
        return (
          <ListItem
            key={index}
            onPress={() => onSelectItemBS(item)}
            containerStyle={{
              marginStart: 8,
              marginEnd: 8,
              backgroundColor: isExist ? appcolor.grayLight : appcolor.light,
              borderBottomWidth: 0.5,
            }}
          >
            <ListItem.Content
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              {item.isShiftSelectable && (
                <SpiralIcon
                  type="font-awesome-6"
                  name="thumbs-up"
                  size={16}
                  style={{ color: appcolor.helper, marginRight: 7 }}
                />
              )}
              {item.isShiftExisted && (
                <SpiralIcon
                  type="font-awesome-6"
                  name="check-circle"
                  size={16}
                  style={{ color: appcolor.info, marginRight: 7 }}
                />
              )}
              {item.isShiftCoincident && (
                <SpiralIcon
                  type="font-awesome-6"
                  name="exclamation"
                  size={16}
                  style={{ color: appcolor.warning, marginRight: 7 }}
                />
              )}
              <ListItem.Title
                style={{ color: appcolor.dark, fontSize: 16, padding: 1 }}
              >
                {item[key]}
              </ListItem.Title>
            </ListItem.Content>
            {isExist &&
              currentBS.type !== WEEK &&
              currentBS.isPastOrPresentWeek && (
                <TouchableOpacity
                  onPress={() => onClearItemSelectedBS(currentBS.index)}
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
      }}
    />
  );
};
const RenderImageModal = ({
  currentBS,
  data,
  handleRemoveImage,
  handleSubmit,
  cameraLaunch,
  imageGalleryLaunch,
  styles,
  appcolor,
}) => {
  const takePhoto = () => {
    cameraLaunch(data?.[currentBS?.index]);
  };
  const choosePhoto = () => {
    imageGalleryLaunch(data?.[currentBS?.index]);
  };
  return (
    <View
      style={{
        backgroundColor: appcolor.light,
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <View style={{ width: '100%', height: '89%' }}>
        <View style={{ width: '100%' }}>
          <TouchableOpacity
            onPress={takePhoto}
            style={styles.styleViewSelectImage}
          >
            <SpiralIcon
              type="font-awesome-6"
              solid
              name="camera"
              size={24}
              style={{ width: 30, textAlign: 'center' }}
              color={appcolor.dark}
            />
            <Text style={{ fontSize: 18, marginLeft: 5, color: appcolor.dark }}>
              Chụp hình
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={choosePhoto}
            style={styles.styleViewSelectImage}
          >
            <SpiralIcon
              type="font-awesome-6"
              solid
              name="images"
              size={24}
              style={{ width: 30, textAlign: 'center' }}
              color={appcolor.dark}
            />
            <Text style={{ fontSize: 18, marginLeft: 5, color: appcolor.dark }}>
              Chọn hình từ thư viện
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{
            width: '100%',
            height: '100%',
            marginTop: 8,
            marginBottom: 8,
          }}
          showsVerticalScrollIndicator={true}
          data={currentBS.list}
          listKey="list"
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <View
                key={index}
                style={{
                  alignItems: 'center',
                  backgroundColor: appcolor.background,
                  marginTop: 8,
                }}
              >
                <Image
                  source={{ uri: item.photoPath }}
                  style={{
                    width: deviceWidth - 20,
                    height: deviceWidth / 2,
                    borderRadius: 8,
                    resizeMode: 'cover',
                  }}
                />
                <TouchableOpacity
                  onPress={() =>
                    item.dataUpload == 0 ? handleRemoveImage(item, index) : null
                  }
                  style={{ position: 'absolute', top: 5, right: 16 }}
                >
                  <SpiralIcon
                    type="font-awesome-6"
                    name={item.dataUpload == 0 ? 'times' : 'check'}
                    size={23}
                    color={
                      item.dataUpload == 0 ? appcolor.danger : appcolor.green
                    }
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
      <View style={{ height: '15%', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() =>
            handleSubmit(SUBMIT_IMAGE, data?.[currentBS?.index] || {})
          }
          style={{
            height: 40,
            backgroundColor: appcolor.secondary,
            width: deviceWidth / 2,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: appcolor.light }}>
            Gửi hình ảnh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const RenderExpandBtn = ({
  shiftStatus,
  lateStatus,
  earlierStatus,
  expanded,
  handleExpanded,
  showState,
  hideState,
  isShift,
  confirmShift,
  confirmLate,
  confirmEarlier,
  colorStatus,
  appcolor,
}) => {
  const handlePress = () => {
    handleExpanded(showState, hideState);
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SpiralIcon
        type="font-awesome-6"
        name={expanded[showState] === true ? 'chevron-down' : 'chevron-right'}
        size={15}
        style={{ color: appcolor.dark, minWidth: 18 }}
      />
      {isShift ? (
        <View>
          <Text
            style={{
              textAlign: 'center',
              color: colorStatus(confirmShift),
              fontSize: 16,
            }}
          >
            {shiftStatus}
          </Text>
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SpiralIcon
              type="font-awesome-6"
              name="hourglass-start"
              size={12}
              style={{ color: colorStatus(confirmLate), marginRight: 5 }}
            />
            <Text style={{ color: colorStatus(confirmLate), fontSize: 16 }}>
              {lateStatus}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SpiralIcon
              type="font-awesome-6"
              name="hourglass-end"
              size={12}
              style={{ color: colorStatus(confirmEarlier), marginRight: 5 }}
            />
            <Text style={{ color: colorStatus(confirmEarlier), fontSize: 16 }}>
              {earlierStatus}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
const RenderButtonDisplayBS = ({
  styles,
  index,
  item,
  keyForgot,
  type,
  handleDisplayBS,
  appcolor,
  value,
  isEditable,
}) => {
  const handlePress = () => {
    handleDisplayBS(type, index, true, item);
  };
  const checkForgot = item[keyForgot] === true;
  return (
    <TouchableOpacity
      disabled={!isEditable}
      onPress={handlePress}
      style={[styles.itemShopText, { backgroundColor: appcolor.light }]}
    >
      <Text style={{ color: checkForgot ? appcolor.warning : appcolor.dark }}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};
const RenderTextNote = ({
  index,
  item,
  defaultValue,
  keyEdit,
  keyForgot,
  onChangeNote,
  appcolor,
  editable,
}) => {
  const handleChange = e => {
    onChangeNote(e, index, keyEdit);
  };
  const checkForgot = item[keyForgot] === true;
  return (
    <View
      style={{
        backgroundColor: appcolor.light,
        borderColor: checkForgot ? appcolor.warning : appcolor.dark,
        borderWidth: 0.3,
        padding: 6,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <SpiralIcon
          type="font-awesome-6"
          style={{
            padding: 8,
            color: checkForgot ? appcolor.warning : appcolor.dark,
          }}
          name={'sticky-note'}
          size={18}
        />
        <TextInput
          defaultValue={defaultValue || ''}
          editable={editable}
          onChangeText={handleChange}
          multiline={true}
          scrollable={true}
          style={{
            color: checkForgot ? appcolor.warning : appcolor.dark,
            fontSize: 15,
            flex: 1,
            padding: 0,
            paddingLeft: 10,
          }}
          placeholder="Ghi chú... (tối thiểu 5 ký tự)"
          placeholderTextColor={
            checkForgot ? appcolor.warning : appcolor.greydark
          }
        />
      </View>
    </View>
  );
};
const RenderChangeMinute = ({ index, onChangeMinute, keyBusy, appcolor }) => {
  const minus = () => {
    onChangeMinute({ index, isPlus: false, keyBusy });
  };
  const plus = () => {
    onChangeMinute({ index, isPlus: true, keyBusy });
  };
  return (
    <View
      style={{
        position: 'absolute',
        flexDirection: 'row',
        height: '82%',
        right: 0,
      }}
    >
      <TouchableOpacity
        onPress={minus}
        style={{
          backgroundColor: appcolor.dark,
          width: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SpiralIcon
          type="font-awesome-6"
          name="minus"
          size={15}
          color={appcolor.light}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={plus}
        style={{
          backgroundColor: appcolor.dark,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          width: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SpiralIcon
          type="font-awesome-6"
          name="plus"
          size={15}
          color={appcolor.light}
        />
      </TouchableOpacity>
    </View>
  );
};
const RenderTextMinute = ({
  index,
  value,
  item,
  keyForgot,
  onChangeMinute,
  appcolor,
  keyBusy,
  iconName,
  isBusyEditable,
}) => {
  const handleChange = e => {
    onChangeMinute({ isPress: false, index, value: e, keyBusy });
  };
  const checkForgot = item[keyForgot] === true;
  return (
    <View
      style={{
        backgroundColor: appcolor.light,
        borderWidth: 0.3,
        borderColor: checkForgot ? appcolor.warning : appcolor.dark,
        padding: 6,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <SpiralIcon
          type="font-awesome-6"
          style={{
            padding: 8,
            color: checkForgot ? appcolor.warning : appcolor.dark,
          }}
          name={iconName}
          size={18}
        />
        <TextInput
          editable={isBusyEditable}
          value={value}
          onChangeText={handleChange}
          multiline={true}
          scrollable={true}
          style={{
            color: checkForgot ? appcolor.warning : appcolor.dark,
            fontSize: 15,
            flex: 1,
            padding: 0,
            paddingLeft: 10,
          }}
          placeholder="Phút..."
          keyboardType="numeric"
          placeholderTextColor={
            checkForgot ? appcolor.warning : appcolor.greydark
          }
        />
      </View>
    </View>
  );
};
const RenderViewPhotoAttendant = ({
  setShowImage,
  setUrl,
  imageURL,
  timeValue,
  appcolor,
}) => {
  const showPhoto = () => {
    setShowImage(true);
    setUrl(
      imageURL.indexOf('https://') === -1 ? URLDEFAULT + imageURL : imageURL,
    );
  };
  return (
    <View style={{ width: '50%', alignSelf: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          backgroundColor: appcolor.light,
        }}
      >
        {imageURL ? (
          <TouchableOpacity
            style={{ width: '90%', height: 120, borderRadius: 5 }}
            onPress={showPhoto}
          >
            <Image
              source={{
                uri:
                  imageURL.indexOf('https://') === -1
                    ? URLDEFAULT + imageURL
                    : imageURL,
              }}
              style={{ width: '100%', height: 120, borderRadius: 5 }}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: '90%', alignSelf: 'center' }}>
            <SpiralIcon
              type="font-awesome-6"
              name="image"
              size={30}
              style={{ width: '100%', textAlign: 'center', padding: 32 }}
              color={appcolor.dark}
            />
          </View>
        )}
        <Text style={{ color: appcolor.dark }}>{timeValue}</Text>
      </View>
    </View>
  );
};
