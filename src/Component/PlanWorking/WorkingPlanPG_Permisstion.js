import React, { useEffect, useState, useMemo } from 'react';
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
  ImageBackground,
} from 'react-native';
import { Image, Icon as ICO } from '@rneui/themed';
import {
  GET_ListWeek,
  PLAN_ChangeShift,
  PLAN_WorkingLate,
  REGISTERPLAN_SavePlan,
  V2_REGISTERPLAN_GetCopyPlan,
  V2_REGISTERPLAN_GetByWeek,
  GetConfigPlan,
} from '../../Controller/PlanController';
import { URLDEFAULT } from '../../Core/URLs';
import {
  alertWarning,
  alertConfirm,
  alertNotify,
  insets,
} from '../../Core/Utility';
import { groupDataByKey, debounce, UUIDGenerator } from '../../Core/Helper';
import moment from 'moment';
import lodash from 'lodash';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import NativeCamera from '../../Control/NativeCamera';
import UploadController from '../../Controller/UploadController';
import { deviceWidth, styleDefault } from '../../Themes/AppsStyle';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  GetPhotosEvident,
  deletePhoto,
} from '../../Controller/PhotoController';
import { useSelector } from 'react-redux';
import { LoadingView } from '../../Control/ItemLoading/index';
import FormGroup from '../../Content/FormGroup';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CustomListView from '../../Control/Custom/CustomListView';
import { Divider } from '@rneui/base';
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
const SUBMIT_OFFSET = 'SUBMIT_OFFSET';
const SHIFT = 'SHIFT';
const WEEK = 'WEEK';
const IMAGE = 'IMAGE';
const OFFSET = 'OFFSET';

const WorkingPlanPG_Permisstion = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [mainData, setMainData] = useState([]);
  const [imageData, setImageData] = useState({});
  const [dataBS, setDataBS] = useState({});
  const [dataWeek, setDataWeek] = useState({});
  const [expanded, setExpanded] = useState({});
  const [currentBS, setCurrentBS] = useState({});
  const [, setDataModified] = useState({});
  const [currentWeek, setCurrentWeek] = useState({});
  const [shiftRegistered, setShiftRegistered] = useState({});
  const [visibleBS, setVisibleBS] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [showIMV, setShowIMV] = useState(false);
  const [urlIMV, setUrlIMV] = useState();
  const [configplan, setConfigPlan] = useState({});
  const [noteEvident, setNoteEvident] = useState(null);
  const [visiblePlanByDate, setVisiblePlanByDate] = useState({});

  const loadListCopyPlan = async (currentWeek = null) => {
    setRefreshing(true);
    try {
      setData([]);
      setImageData({});
      setExpanded({});
      setVisiblePlanByDate({});
      let listWeek = [];
      let listPlan = [];

      await GET_ListWeek((_, responseJson) => {
        listWeek = responseJson || [];
        setDataWeek({ ...dataWeek, listWeek: responseJson || [] });
      });
      currentWeek = !currentWeek
        ? listWeek[0]
          ? listWeek.filter(e => e.isWeekNow === 1)[0]
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
        listType: JSON.parse(arr?.[0]?.listType || '[]'),
      });
      setShiftRegistered(anonymous.shiftRegistered || {});
      setCurrentWeek(currentWeek);
    } catch (e) { }
    setRefreshing(false);
  };
  const callEffect = async (currentWeek = null) => {
    setRefreshing(true);
    try {
      setData([]);
      setImageData({});
      setExpanded({});
      setVisiblePlanByDate({});
      let listWeek = [];
      let listPlan = [];
      await GET_ListWeek((_, responseJson) => {
        listWeek = responseJson || [];
        setDataWeek({ ...dataWeek, listWeek: responseJson || [] });
      });
      currentWeek = !currentWeek
        ? listWeek[0]
          ? listWeek.filter(e => e.isWeekNow === 1)[0]
          : { value: moment().isoWeek() }
        : currentWeek;

      await GetConfigPlan(
        currentWeek.fromDate,
        currentWeek.toDate,
        async resulst => {
          await setConfigPlan(resulst[0] || {});
        },
      );
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
    } catch (e) { }
    setRefreshing(false);
  };
  useEffect(() => {
    callEffect();
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
        case SUBMIT_OFFSET:
          if (!item.timeOffsetType) {
            alertWarning('Loại phép không được để trống');
            return;
          }
          if (!item.timeOffset) {
            alertWarning(`Vui lòng nhập thời gian cấn trừ phép`);
            return;
          }
          if (!item.noteOffset || item.noteOffset?.trim().length < 5) {
            alertWarning(
              'Ghi chú không được để trống, ghi chú tối thiểu 5 ký tự',
            );
            return;
          }
      }
      const alertConfirmMsg =
        item.isAlertRequestCount === 1 &&
          (type == SUBMIT_LATE || type == SUBMIT_EARLIER)
          ? `Bạn đã gửi ${item.requestCount} yêu cầu đi trễ/về sớm trong tháng này. Bạn có chắc chắn muốn tiếp tục gửi đề xuất thay đổi?`
          : 'Bạn có chắc chắn muốn gửi đề xuất thay đổi?';
      alertConfirm('Thông báo', alertConfirmMsg, async () => {
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
          case SUBMIT_OFFSET:
            await PLAN_WorkingLate(
              {
                ...item,
                contentMessage:
                  'Nhân viên ' +
                  item.fullName +
                  ' cấn trừ phép ngày ' +
                  item.workDate,
              },
              2,
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
      });
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
      const reportItem = JSON.parse(kpiinfo.reportItem || '{}');
      if (reportItem.isCheckAl === 1) {
        const dataFilterMonth = lodash.unionBy(data, 'monthValue');
        for (let index = 0; index < dataFilterMonth.length; index++) {
          const item = dataFilterMonth[index];
          const filterAL = lodash.filter(
            data,
            e =>
              e.monthValue == item.monthValue &&
              (e.shiftType == 'AL' || e.shiftChange == 'AL'),
          );
          if (filterAL.length > reportItem.maxALMonth) {
            alertWarning(
              `Bạn không được phép đăng kí Nghỉ phép năm nguyên ngày (AL) quá ${reportItem.maxALMonth} lần trong tháng ${item.monthValue}`,
            );
            return;
          }
        }
      }

      if (data.length > 0) {
        // * Save
        for (let i = 0, lenData = data.length; i < lenData; i++) {
          const {
            shiftType,
            workDate,
            shopName,
            notes,
            shiftGroup,
            isNoteCopy,
            shiftNoteCopy,
          } = data[i];
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

          if (isNoteCopy == 1) {
            const isListShiftNoteCopy = JSON.parse(shiftNoteCopy || '[]');
            const isCheckNoteCopy =
              isListShiftNoteCopy.length > 0
                ? isListShiftNoteCopy.filter(item => item.Code == shiftType)
                : shiftGroup;
            if (isCheckNoteCopy.length > 0 && (notes || '').length < 5) {
              alertWarning(
                `Vui lòng nhập lí do nghỉ (Ngày: "${workDate}" - Shop: "${shopName}"`,
              );
              return;
            }
            if (isCheckNoteCopy == 'OFF' && (notes || '').length < 5) {
              alertWarning(
                `Vui lòng nhập lí do nghỉ (Ngày: "${workDate}" - Shop: "${shopName}"`,
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
    } catch (e) {
      console.log('log', e);
    }
  };
  const assignData = (index, key, value) => {
    try {
      const mainIndex = data[index].stt;
      data[index][key] = value;
      mainData[mainIndex][key] = value;
    } catch (e) { }
  };
  const addToModifedList = index => {
    const mainIndex = data[index].stt;
    setDataModified(prev => ({ ...prev, [mainIndex]: true }));
  };
  const handleExpanded = (showState, hideState, hideState2) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    expanded[showState] = expanded[showState] === true ? false : true;
    expanded[hideState] = false;
    expanded[hideState2] = false;
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
    item = {},
  ) => {
    let list = [],
      label = '';
    switch (type) {
      case WEEK:
        list = dataWeek.listWeek || [];
        label = currentWeek.label;
        break;
      case SHIFT:
        dataBS.shiftListPrototype = JSON.parse(item.shiftList || '[]');
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
      case IMAGE: {
        const fetchedImages = await GetPhotosEvident(
          item.shopId,
          item.auditDate,
          item.reportId,
        );
        list = fetchedImages || [];
        expanded[expandImage] = false;
        break;
      }
      case OFFSET:
        const listType = JSON.parse(item.listType || '[]');
        label = item.timeOffsetType;
        list = listType;
        break;
    }
    setCurrentBS({
      type,
      list,
      index,
      label,
      isPastOrPresentWeek,
    });
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
      case 'noteOffset':
        const timeOffset = data[index].timeOffset;
        if ((timeOffset === 0 || !timeOffset) && value) {
          assignData(index, 'forgotTimeOffset', true);
        } else if (timeOffset && !value) {
          assignData(index, 'forgotNoteOffset', true);
        } else if (
          (timeOffset && value) ||
          ((timeOffset === 0 || !timeOffset) && !value)
        ) {
          assignData(index, 'forgotNoteOffset', false);
          assignData(index, 'forgotTimeOffset', false);
        }
        if (value && value.length < 5) {
          assignData(index, 'forgotNoteOffset', true);
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
    typeInput,
  }) => {
    const mainIndex = data[index].stt - 1;
    const prevValue = data[index][keyBusy] || 0;

    const isUnlimited = data[index].isLockMaxTime === 1;
    const numStep = typeInput == 'hour' ? 1 : 5;

    if (isPress) {
      const ceilNum = numStep * Math.ceil(prevValue / numStep) - prevValue;
      const floorNum = prevValue - numStep * Math.floor(prevValue / numStep);

      let delta = 0;
      if (isPlus) {
        if (!isUnlimited && prevValue >= 90) {
          delta = 0;
        } else {
          delta = ceilNum === 0 ? numStep : ceilNum;
        }
      } else {
        if (prevValue > 0) {
          delta = floorNum === 0 ? -numStep : -floorNum;
        } else {
          delta = 0;
        }
      }
      if (keyBusy === 'timeOffset') {
        if (!data[index]?.timeOffsetType) {
          alertWarning('Loại phép không được để trống');
          return;
        }
        const resultCheck = checkOffsetTime(prevValue + delta, data[index]);
        if (resultCheck.status === false) {
          alertWarning(resultCheck.messager);
          return;
        }
      }
      data[index][keyBusy] = prevValue + delta;
      mainData[mainIndex][keyBusy] = prevValue + delta;
    } else {
      if (isNaN(value)) return;

      let nextValue = 0;
      if (value !== null && value !== undefined && value !== '') {
        const numValue = +value;

        if (!isUnlimited && numValue >= 90) {
          nextValue = 90;
        } else if (numValue <= 0) {
          nextValue = 0;
        } else {
          nextValue = numValue;
        }
      }
      if (keyBusy === 'timeOffset') {
        const resultCheck = checkOffsetTime(nextValue, data[index]);
        if (resultCheck.status === false) {
          alertWarning(resultCheck.messager);
          return;
        }
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
    if (keyBusy === 'timeOffset') {
      // * Clear Forgot
      assignData(index, 'forgotTimeOffset', false);
      // * Check Forgot Offset
      if (
        (!data[index].noteOffset ||
          (data[index].noteOffset && data[index].noteOffset.length < 5)) &&
        data[index][keyBusy]
      )
        checkNoteEarlier = true;
      else checkNoteEarlier = false;
      assignData(index, 'forgotNoteOffset', checkNoteEarlier);
    }
  };
  const checkOffsetTime = (value, item) => {
    const listType = JSON.parse(item.listType || '[]');
    const typeOffset = listType.find(it => it.Code == item.timeOffsetType);
    const totalLateTime = data.reduce(
      (sum, it) =>
        it.timeOffset > 0 && it.stt !== item.stt
          ? sum + (it.timeOffset || 0)
          : sum,
      0,
    );
    if ((value || 0) + (totalLateTime || 0) > (typeOffset.remainingTime || 0)) {
      return {
        status: false,
        messager: `Tổng thời gian cấn trừ phép không được vượt quá ${typeOffset.remainingTime || 0
          } giờ`,
      };
    }
    return { status: true };
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
          assignData(index, 'shiftGroup', item.ShiftGroup);
        } else {
          assignData(index, 'shiftChange', item.Code);
          assignData(index, 'shiftChangeName', item.Name);
          assignData(index, 'shiftGroup', item.ShiftGroup);
        }
        // * Reassign Shift Registered
        const mainIndex = data[index].stt;
        shiftRegistered[data[index].workDate] = {
          ...shiftRegistered[data[index].workDate],
          [mainIndex]: { code: item.Code },
        };
        assignData(index, 'forgotNoteShift', true);
        break;
      case OFFSET:
        const itemEdit = data[index];
        if (itemEdit.timeOffsetType !== item.Code) {
          data[index].timeOffset = 0;
          mainData[itemEdit.stt - 1].timeOffset = 0;
        }
        assignData(index, 'timeOffsetType', item.Code);
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
    if (noteEvident !== null && noteEvident.length > 0) {
      const photoinfo = {
        shopId: item.shopId,
        shopCode: item.shopCode,
        reportId: item.reportId,
        photoDate: item.auditDate,
        photoTime: new Date().getTime(),
        photoType: 'ISSUE_FILE',
        photoDesc: noteEvident,
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
    } else {
      alertWarning('Vui lòng nhập ghi chú trước khi chụp hình');
    }
  };
  const imageGalleryLaunch = async item => {
    if (noteEvident !== null && noteEvident.length > 0) {
      const photoinfo = {
        shopId: item.shopId,
        shopCode: item.shopCode,
        reportId: item.reportId,
        photoDate: item.auditDate,
        photoTime: new Date().getTime(),
        photoType: 'ISSUE_FILE',
        photoDesc: noteEvident,
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
    } else {
      alertWarning('Vui lòng nhập ghi chú trước khi chọn hình ảnh');
    }
  };
  const photoEvidentResult = async (item, res) => {
    const imageData = await GetPhotosEvident(
      item.shopId,
      item.auditDate,
      item.reportId,
    );
    setCurrentBS(prev => ({ ...prev, list: imageData || [] }));
  };
  const onSaveImage = async res => {
    try {
      const { index } = currentBS;
      let photoMore = [];
      if (data[index].photoMore === undefined) {
        photoMore = [res.uri];
      } else {
        photoMore = JSON.parse(data[index].photoMore || '[]');
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
      setCurrentBS(prev => ({ ...prev, list: photoMore }));
      await assignData(index, 'photoMore', JSON.stringify(photoMore));
      expanded[expandImage] = false;
      setMutate(e => !e);
    } catch (e) { }
  };
  const handleRemoveImage = async (item, indexImage) => {
    const nextList = (currentBS.list || []).filter(
      (_, index) => index !== indexImage,
    );
    await deletePhoto(item);
    setCurrentBS(prev => ({ ...prev, list: nextList }));
  };
  const styles = useMemo(
    () =>
      StyleSheet.create({
        ...styleDefault(appcolor),
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
        listContent: { paddingBottom: 28 },
        listFooter: { height: Platform.OS === 'ios' ? 96 : 72 },
        weekWrapper: { padding: 8 },
        weekButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          backgroundColor: appcolor.primary,
          borderRadius: 8,
        },
        weekLabel: {
          flex: 1,
          fontSize: 15,
          fontWeight: '700',
          color: appcolor.dark,
        },
        planItem: { width: '100%', alignSelf: 'center', paddingHorizontal: 10 },
        dateHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 4,
          backgroundColor: appcolor.light,
          borderRadius: 8,
        },
        cardHeader: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        },
        shopTitleWrap: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        shopTitle: {
          flex: 1,
          color: appcolor.dark,
          fontSize: 15,
          fontWeight: '700',
          lineHeight: 20,
        },
        evidentButton: {
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: appcolor.bluenavylight,
          borderRadius: 22,
        },
        infoRow: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingTop: 10,
          gap: 10,
        },
        rowIcon: { width: 24, textAlign: 'center', marginTop: 2 },
        infoText: {
          flex: 1,
          color: appcolor.dark,
          fontSize: 14,
          lineHeight: 19,
        },
        shiftReadOnly: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingTop: 10,
          gap: 10,
        },
        shiftButton: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 8,
          marginTop: 8,
          backgroundColor: appcolor.surface,
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: appcolor.primary,
        },
        shiftButtonText: {
          flex: 1,
          color: appcolor.dark,
          fontSize: 14,
          fontWeight: '600',
        },
        italicText: { fontStyle: 'italic' },
        divider: {
          height: 1,
          width: '100%',
          marginTop: 12,
          marginBottom: 10,
          backgroundColor: appcolor.greylight,
        },
        actionRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        },
        actionChip: {
          minHeight: 48,
          justifyContent: 'center',
          backgroundColor: appcolor.surface,
          borderRadius: 10,
          paddingHorizontal: 10,
        },
        offsetChip: { width: '100%', marginTop: 8 },
        totalTime: {
          textAlign: 'center',
          fontSize: 15,
          paddingVertical: 10,
          color: appcolor.dark,
          fontWeight: '600',
        },
        photoRow: {
          width: '100%',
          flexDirection: 'row',
          alignSelf: 'center',
          gap: 10,
          marginBottom: 10,
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
          backgroundColor: appcolor.surface,
          borderRadius: 10,
          padding: 8,
          alignSelf: 'center',
          marginTop: 8,
        },
      }),
    [appcolor],
  );
  const disableCopyButton = currentWeek.disableCopyButton == 1;

  const renderItem = ({ item, index }) => {
    const {
      workDate,
      shopName,
      shopCode,
      address,
      shiftTypeName,
      shiftChange,
      shiftChangeName,
      checkIn1,
      checkOut1,
      checkIn2,
      checkOut2,
      checkIn3,
      checkOut3,
      totalTime,
      isParent,
    } = item;
    const shiftExpand = `shift_${index}`;
    const busyExpand = `busy_${index}`;
    const offsetExpand = `offset_${index}`;
    const confirmShift = item.confirm;
    const confirmLate = item.confirmLate;
    const confirmEarlier = item.confirmEarlier;
    const confirmOffset = item.confirmOffset;

    const isShiftEditable = item.isShiftEditable == 1 ? false : true;
    const isLateEditable = item.isLateEditable == 1 ? false : true;
    const isEarlierEditable = item.isEarlierEditable == 1 ? false : true;

    const isOffsetEditable = item.isOffsetEditable == 1 ? false : true;
    const isShowNote = JSON.parse(item.shiftNoteCopy || '[]').some(
      it => it.Code == item.shiftType,
    );

    const listType = JSON.parse(item.listType || '[]');
    const typeOffset = item.timeOffsetType
      ? listType.find(it => it.Code == item.timeOffsetType)
      : {};

    const dateText = moment(workDate).format('dddd, DD MMMM YY');

    const onVisiblePlan = () => {
      setVisiblePlanByDate(prev => ({
        ...prev,
        [workDate]: !prev[workDate],
      }));
    };
    const isVisiblePlan = true; // visiblePlanByDate[workDate] === true
    if (!isParent && !isVisiblePlan) return null;

    return (
      <View
        key={index}
        style={[styles.itemContainer, { marginTop: 0, marginBottom: 8 }]}
      >
        {isParent && (
          <TouchableOpacity onPress={onVisiblePlan} style={styles.dateHeader}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                flex: 1,
              }}
            >
              <SpiralIcon
                name="calendar-check"
                type="font-awesome-5"
                color={isVisiblePlan ? appcolor.primary : appcolor.dark}
                size={18}
              />
              <Text
                style={[
                  styles.titleName,
                  { color: isVisiblePlan ? appcolor.primary : appcolor.dark },
                ]}
                numberOfLines={1}
              >{`${dateText.charAt(0).toUpperCase() + dateText.slice(1)
                }`}</Text>
            </View>
            <SpiralIcon
              name={isVisiblePlan ? 'chevron-up' : 'chevron-down'}
              type="font-awesome-5"
              color={appcolor.greylight}
              size={8}
            />
          </TouchableOpacity>
        )}
        {isVisiblePlan && (
          <View style={{ padding: 8 }}>
            <Divider style={{ marginBottom: 8 }} />
            <View style={styles.cardHeader}>
              <View style={{ width: item.isEvident == 1 ? '85%' : '100%' }}>
                <Text
                  style={styles.titleName}
                  numberOfLines={2}
                >{`Cửa hàng: ${shopName}`}</Text>
                <Text
                  style={styles.subTitleName}
                  numberOfLines={2}
                >{`Code: ${shopCode}`}</Text>
                <Text style={styles.subTitleName}>{`Địa chỉ: ${address}`}</Text>
              </View>
              {item.isEvident == 1 && (
                <TouchableOpacity
                  style={styles.evidentButton}
                  onPress={() => handleDisplayBS(IMAGE, index, true, item)}
                >
                  <SpiralIcon
                    solid
                    name="file-image"
                    type="font-awesome-5"
                    size={16}
                    color={appcolor.light}
                  />
                </TouchableOpacity>
              )}
            </View>

            {item.confirmPlan == 1 ? (
              <View style={styles.shiftReadOnly}>
                <SpiralIcon
                  name="business-time"
                  type="font-awesome-5"
                  size={16}
                  style={styles.rowIcon}
                  color={appcolor.dark}
                />
                <Text style={styles.subTitleName}>{`Ca hiện tại: ${shiftTypeName || ''
                  }`}</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleDisplayBS(SHIFT, index, false, item)}
                style={styles.shiftButton}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <SpiralIcon
                    name="business-time"
                    type="font-awesome-5"
                    size={16}
                    style={styles.rowIcon}
                    color={appcolor.primary}
                  />
                  <Text
                    style={[styles.subTitleName, { color: appcolor.dark }]}
                    numberOfLines={1}
                  >{`Ca hiện tại: ${shiftTypeName || '-- Chọn ca --'}`}</Text>
                </View>
                <SpiralIcon
                  name="chevron-right"
                  type="font-awesome-5"
                  size={8}
                  color={appcolor.dark}
                />
              </TouchableOpacity>
            )}

            {item.confirmPlan == 1 &&
              shiftChange !== null &&
              shiftChange !== '' && (
                <View style={styles.infoRow}>
                  <SpiralIcon
                    name="sync"
                    type="font-awesome-5"
                    size={16}
                    style={styles.rowIcon}
                    color={appcolor.dark}
                  />
                  <Text
                    style={[styles.infoText, styles.italicText]}
                  >{`Ca chuyển: ${shiftChangeName}`}</Text>
                </View>
              )}
            {item.confirmPlan !== 1 && item.isNoteCopy == 1 && isShowNote && (
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
            )}
            {item.confirmPlan == 1 && (
              <View>
                <View style={styles.divider} />
                <View style={styles.actionRow}>
                  {item.isLockChangeExpand !== 1 && (
                    <View
                      style={[
                        styles.actionChip,
                        {
                          width: item.isLockShiftExpand !== 1 ? '49%' : '100%',
                        },
                      ]}
                    >
                      <RenderExpandBtn
                        appcolor={appcolor}
                        setExpanded={setExpanded}
                        expanded={expanded}
                        isShift={true}
                        shiftStatus={
                          item.shiftStatus ? item.shiftStatus : 'Đổi ca'
                        }
                        colorStatus={colorStatus}
                        showState={shiftExpand}
                        hideState={busyExpand}
                        hideState2={offsetExpand}
                        handleExpanded={handleExpanded}
                        confirmShift={confirmShift}
                      />
                    </View>
                  )}
                  {item.isLockShiftExpand !== 1 && (
                    <>
                      <View
                        style={[
                          styles.actionChip,
                          {
                            width:
                              item.isLockChangeExpand !== 1 ? '49%' : '100%',
                          },
                        ]}
                      >
                        <RenderExpandBtn
                          appcolor={appcolor}
                          setExpanded={setExpanded}
                          expanded={expanded}
                          lateStatus={
                            item.lateStatus ? item.lateStatus : 'Đi trễ'
                          }
                          earlierStatus={
                            item.earlierStatus ? item.earlierStatus : 'Về sớm'
                          }
                          showState={busyExpand}
                          hideState={shiftExpand}
                          hideState2={offsetExpand}
                          handleExpanded={handleExpanded}
                          confirmLate={confirmLate}
                          confirmEarlier={confirmEarlier}
                          colorStatus={colorStatus}
                        />
                      </View>
                    </>
                  )}
                </View>
                {item.isViewOffset == 1 && (
                  <>
                    <View style={[styles.actionChip, styles.offsetChip]}>
                      <RenderExpandBtn
                        appcolor={appcolor}
                        containerStyle={{ flex: 1, padding: 12 }}
                        setExpanded={setExpanded}
                        expanded={expanded}
                        isShift={true}
                        shiftStatus={
                          item.offsetStatus ? item.offsetStatus : 'Cấn trừ phép'
                        }
                        colorStatus={colorStatus}
                        showState={offsetExpand}
                        hideState={shiftExpand}
                        hideState2={busyExpand}
                        handleExpanded={handleExpanded}
                        confirmOffset={confirmOffset}
                      />
                    </View>
                  </>
                )}
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
                          name={
                            confirmShift === 1 ? 'comment' : 'comment-slash'
                          }
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
                        >{`Ghi chú của quản lý: ${item.confirmNote || ''
                          }`}</Text>
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
                            confirmLate === 1
                              ? appcolor.helper
                              : appcolor.danger,
                          padding: 7,
                        }}
                      >{`Ghi chú của quản lý: ${item.confirmNoteLate || ''
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
                        backgroundColor: appcolor.primary,
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
                        name={
                          confirmEarlier === 1 ? 'comment' : 'comment-slash'
                        }
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
                      >{`Ghi chú của quản lý: ${item.confirmNoteEarlier || ''
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
            {expanded[offsetExpand] === true && (
              <View style={styles.expandItem}>
                <View style={{ width: '95%' }}>
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
                      keyForgot={'forgotSelectOffset'}
                      index={index}
                      styles={styles}
                      appcolor={appcolor}
                      value={`Chọn loại phép${item.timeOffsetType ? `: ${typeOffset.Name}` : ''
                        }`}
                      isEditable={isOffsetEditable}
                      type={OFFSET}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', width: '100%' }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                      <RenderTextMinute
                        index={index}
                        item={item}
                        keyForgot={'forgotTimeOffset'}
                        value={item.timeOffset?.toString()}
                        styles={styles}
                        appcolor={appcolor}
                        onChangeMinute={onChangeMinute}
                        keyBusy={'timeOffset'}
                        iconName="alarm-on"
                        isBusyEditable={isOffsetEditable}
                        typeInput="hour"
                      />
                    </View>
                    {isOffsetEditable && (
                      <RenderChangeMinute
                        keyBusy="timeOffset"
                        index={index}
                        onChangeMinute={onChangeMinute}
                        appcolor={appcolor}
                        typeInput="hour"
                      />
                    )}
                  </View>
                  <RenderTextNote
                    defaultValue={item.noteOffset}
                    index={index}
                    item={item}
                    editable={isOffsetEditable}
                    onChangeNote={onChangeNote}
                    appcolor={appcolor}
                    keyEdit={'noteOffset'}
                    keyForgot={'forgotNoteOffset'}
                  />
                  {isOffsetEditable && (
                    <TouchableOpacity
                      onPress={() => handleSubmit(SUBMIT_OFFSET, item)}
                      style={{
                        height: 40,
                        marginTop: 10,
                        backgroundColor: appcolor.primary,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 16,
                          color: appcolor.light,
                        }}
                      >
                        Cấn trừ phép
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            {disableCopyButton && (
              <Text
                style={[styles.titleName, { padding: 8, textAlign: 'center' }]}
              >
                {totalTime}
              </Text>
            )}
            {disableCopyButton && (
              <View style={styles.photoRow}>
                <RenderViewPhotoAttendant
                  setShowImage={setShowIMV}
                  setUrl={setUrlIMV}
                  imageURL={checkIn1}
                  timeValue={item.timeIn1}
                  appcolor={appcolor}
                  highlightColor={item.highlightIn1}
                />
                <RenderViewPhotoAttendant
                  setShowImage={setShowIMV}
                  setUrl={setUrlIMV}
                  imageURL={checkOut1}
                  timeValue={item.timeOut1}
                  appcolor={appcolor}
                  highlightColor={item.highlightOut1}
                />
              </View>
            )}
            {disableCopyButton &&
              item.photoAttendant > 2 &&
              checkIn2 !== null && (
                <View style={styles.photoRow}>
                  <RenderViewPhotoAttendant
                    setShowImage={setShowIMV}
                    setUrl={setUrlIMV}
                    imageURL={checkIn2}
                    timeValue={item.timeIn2}
                    appcolor={appcolor}
                    highlightColor={item.highlightIn2}
                  />
                  <RenderViewPhotoAttendant
                    setShowImage={setShowIMV}
                    setUrl={setUrlIMV}
                    imageURL={checkOut2}
                    timeValue={item.timeOut2}
                    appcolor={appcolor}
                    highlightColor={item.highlightOut2}
                  />
                </View>
              )}
            {disableCopyButton &&
              item.photoAttendant > 4 &&
              checkIn3 !== null && (
                <View style={styles.photoRow}>
                  <RenderViewPhotoAttendant
                    setShowImage={setShowIMV}
                    setUrl={setUrlIMV}
                    imageURL={checkIn3}
                    timeValue={item.timeIn3}
                    appcolor={appcolor}
                    highlightColor={item.highlightIn3}
                  />
                  <RenderViewPhotoAttendant
                    setShowImage={setShowIMV}
                    setUrl={setUrlIMV}
                    imageURL={checkOut3}
                    timeValue={item.timeOut3}
                    appcolor={appcolor}
                    highlightColor={item.highlightOut3}
                  />
                </View>
              )}
          </View>
        )}
      </View>
    );
  };

  const textCopyButton =
    currentWeek.isWeekNow == 0 && data.length === 0 ? 'Copy' : 'Save';
  const checkSaveWeekNow = currentWeek.checkSaveWeek == 1;
  const isConfirmPlan = mainData[0]?.isLockSavePlan == 1;
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      {showIMV && (
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 5,
            marginTop: insets().top,
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
            />
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
      {currentWeek.label !== undefined && (
        <View style={styles.weekWrapper}>
          <TouchableOpacity
            onPress={() => handleDisplayBS(WEEK)}
            style={styles.weekButton}
          >
            <SpiralIcon
              type="font-awesome-5"
              name="calendar-week"
              size={18}
              color={appcolor.light}
            />
            <Text
              style={[styles.titleName, { color: appcolor.light }]}
              numberOfLines={1}
            >
              {currentWeek.label || '-'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <LoadingView
        title="Đang cập nhật dữ liệu"
        isLoading={refreshing}
        styles={styles.loadingView}
      />
      <CustomListView
        data={data}
        extraData={data}
        renderItem={renderItem}
        onRefresh={() => {
          callEffect(currentWeek);
        }}
      />
      {/* <FlatList data={data}
                    nestedScrollEnabled={true}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={<View style={styles.listFooter} />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl
                        progressBackgroundColor={appcolor.yellow}
                        colors={[appcolor.blue, appcolor.primary, appcolor.switchEnable]}
                        title="Đang tải dữ liệu..."
                        titleColor={appcolor.dark}
                        tintColor={appcolor.dark}
                        refreshing={false}
                        onRefresh={() => callEffect(currentWeek)} />}
                /> */}
      <Modal animationType="slide" visible={visibleBS} statusBarTranslucent>
        <SafeAreaProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: appcolor.light,
              padding: 8,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: 8,
                paddingBottom: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[styles.titleName, { fontSize: 18 }]}>
                {currentBS.type === WEEK
                  ? 'Chọn Tuần'
                  : currentBS.type === SHIFT
                    ? 'Chọn Ca Làm Việc'
                    : currentBS.type == OFFSET
                      ? 'Chọn loại phép'
                      : 'Hình ảnh xác minh'}
              </Text>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => setVisibleBS(false)}
              >
                <ICO
                  name="close-circle"
                  type="ionicon"
                  size={28}
                  color={appcolor.danger}
                />
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
                setNoteEvident={value => setNoteEvident(value)}
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
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};
export default WorkingPlanPG_Permisstion;

const RenderContentModal = ({
  appcolor,
  onSelectItemBS,
  currentBS,
  onClearItemSelectedBS,
}) => {
  const key = currentBS.type === WEEK ? 'label' : 'Name';
  const keyCheckExist = currentBS.type === WEEK ? 'label' : 'Code';
  const styles = StyleSheet.create({
    ...styleDefault(appcolor),
  });
  return (
    <CustomListView
      data={currentBS.list}
      bottomView={{ paddingBottom: 8 }}
      renderItem={({ item }) => {
        const isExist = currentBS.label === item[keyCheckExist];
        return (
          <TouchableOpacity
            onPress={() => onSelectItemBS(item)}
            style={[
              styles.itemContainer,
              { flexDirection: 'row', alignItems: 'center' },
            ]}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: 4,
              }}
            >
              {item.isShiftSelectable && (
                <SpiralIcon
                  type="font-awesome-6"
                  key="selectable"
                  name="thumbs-up"
                  size={16}
                  style={{ color: appcolor.dark, marginRight: 8 }}
                />
              )}
              {item.isShiftExisted && (
                <SpiralIcon
                  type="font-awesome-6"
                  key="existed"
                  name="check-circle"
                  size={16}
                  style={{ color: appcolor.primary, marginRight: 8 }}
                />
              )}
              {item.isShiftCoincident && (
                <SpiralIcon
                  type="font-awesome-6"
                  key="coincident"
                  name="exclamation"
                  size={16}
                  style={{ color: appcolor.warning, marginRight: 8 }}
                />
              )}
              <Text style={styles.titleName}>{item[key]}</Text>
            </View>
            {isExist &&
              currentBS.type !== WEEK &&
              currentBS.isPastOrPresentWeek && (
                <TouchableOpacity
                  key="clear"
                  onPress={() => onClearItemSelectedBS(currentBS.index)}
                >
                  <ICO
                    name="trash"
                    type="ionicon"
                    size={18}
                    color={appcolor.danger}
                  />
                </TouchableOpacity>
              )}
          </TouchableOpacity>
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
  setNoteEvident,
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
        backgroundColor: appcolor.surface,
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <View style={{ width: '100%', height: '89%' }}>
        <FormGroup
          editable
          placeholder="Ghi chú"
          containerStyle={{
            margin: 8,
            padding: 0,
            padding: 8,
            borderColor: appcolor.greylight,
          }}
          multiline={true}
          inputStyle={{ fontSize: 14 }}
          iconName="comment-alt"
          handleChangeForm={setNoteEvident}
        />
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
          showsVerticalScrollIndicator={false}
          data={currentBS.list}
          listKey="list"
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: appcolor.light,
                  margin: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    width: '95%',
                    textAlign: 'left',
                    color: appcolor.dark,
                    fontSize: 15,
                    fontWeight: '600',
                    margin: 8,
                    marginBottom: 0,
                  }}
                >
                  {item.photoDesc}
                </Text>
                <View
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
                      item.dataUpload == 0
                        ? handleRemoveImage(item, index)
                        : null
                    }
                    style={{ position: 'absolute', top: 5, right: 16 }}
                  >
                    <SpiralIcon
                      name={item.dataUpload == 0 ? 'times' : 'check'}
                      type="font-awesome-5"
                      size={23}
                      color={
                        item.dataUpload == 0 ? appcolor.danger : appcolor.green
                      }
                    />
                  </TouchableOpacity>
                </View>
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
  hideState2,
  isShift,
  confirmShift,
  confirmLate,
  confirmEarlier,
  colorStatus,
  appcolor,
  containerStyle,
  confirmOffset,
}) => {
  const handlePress = () => {
    handleExpanded(showState, hideState, hideState2);
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        containerStyle,
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <SpiralIcon
        type="font-awesome-6"
        name={expanded[showState] === true ? 'chevron-down' : 'chevron-right'}
        size={15}
        style={{ minWidth: 18 }}
        color={colorStatus(confirmOffset || confirmShift) || appcolor.dark}
      />
      {isShift ? (
        <View style={{ flexShrink: 1 }}>
          <Text
            style={{
              textAlign: 'center',
              color: colorStatus(confirmOffset || confirmShift),
              fontSize: 14,
              fontWeight: '600',
            }}
            numberOfLines={1}
          >
            {shiftStatus}
          </Text>
        </View>
      ) : (
        <View style={{ flexShrink: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SpiralIcon
              name="hourglass-start"
              type="font-awesome-5"
              size={12}
              color={colorStatus(confirmLate)}
            />
            <Text
              style={{
                color: colorStatus(confirmLate),
                fontSize: 14,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {lateStatus}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SpiralIcon
              name="hourglass-end"
              type="font-awesome-5"
              size={12}
              color={colorStatus(confirmEarlier)}
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                color: colorStatus(confirmEarlier),
                fontSize: 14,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
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
  const borderColor = checkForgot ? appcolor.yellow : appcolor.greylight;
  const textColor = checkForgot ? appcolor.yellow : appcolor.dark;
  return (
    <View
      style={{
        backgroundColor: appcolor.light,
        borderColor,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <SpiralIcon
          type="font-awesome-6"
          style={{ width: 26, textAlign: 'center', color: textColor }}
          name={'sticky-note'}
          size={16}
        />
        <TextInput
          defaultValue={defaultValue || ''}
          editable={editable}
          onChangeText={handleChange}
          multiline={true}
          scrollable={true}
          style={{
            color: textColor,
            fontSize: 14,
            flex: 1,
            paddingVertical: 6,
            paddingLeft: 10,
            minHeight: 38,
          }}
          placeholder="Ghi chú... (tối thiểu 5 ký tự)"
          placeholderTextColor={
            checkForgot
              ? appcolor.yellow
              : appcolor.placeholderText || appcolor.greydark
          }
        />
      </View>
    </View>
  );
};
const RenderChangeMinute = ({
  index,
  onChangeMinute,
  keyBusy,
  appcolor,
  typeInput = 'minute',
}) => {
  const minus = () => {
    onChangeMinute({ index, isPlus: false, keyBusy, typeInput });
  };
  const plus = () => {
    onChangeMinute({ index, isPlus: true, keyBusy, typeInput });
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
  typeInput = 'minute',
}) => {
  const handleChange = e => {
    onChangeMinute({ isPress: false, index, value: e, keyBusy, typeInput });
  };
  const checkForgot = item[keyForgot] === true;
  const placeholderText = typeInput === 'hour' ? 'Giờ...' : 'Phút...';
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
          placeholder={placeholderText}
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
  highlightColor,
}) => {
  const colorTime = highlightColor || appcolor.dark;
  const showPhoto = () => {
    setShowImage(true);
    setUrl(imageURL?.includes('https') ? imageURL : URLDEFAULT + imageURL);
  };
  return (
    <View style={{ flex: 1, alignSelf: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          backgroundColor: appcolor.surface,
          padding: 6,
        }}
      >
        {imageURL ? (
          <TouchableOpacity
            style={{
              width: '100%',
              height: 96,
              borderRadius: 8,
              overflow: 'hidden',
            }}
            onPress={showPhoto}
          >
            <Image
              source={{
                uri: imageURL?.includes('https://')
                  ? imageURL
                  : URLDEFAULT + imageURL,
              }}
              style={{ width: '100%', height: 96, borderRadius: 8 }}
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              width: '100%',
              height: 96,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SpiralIcon
              type="font-awesome-6"
              name="image"
              size={26}
              color={appcolor.dark}
            />
          </View>
        )}
        <Text style={{ color: colorTime, fontSize: 13, marginTop: 4 }}>
          {timeValue}
        </Text>
      </View>
    </View>
  );
};
