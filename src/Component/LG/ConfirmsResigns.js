import moment from 'moment';
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { Employee } from '../../Controller/EmployeeController';
import {
  groupDataByKey,
  MessageAction2,
  MessageInfo,
  ToastError,
} from '../../Core/Helper';
import { URLDEFAULT } from '../../Core/URLs';
import { deviceWidth } from '../Home';
import CustomListView from '../../Control/Custom/CustomListView';
import ViewPictures from '../../Control/Gallary/ViewPictures';
import { GroupListData } from '../../Control/GroupListData';
import { fontWeightBold } from '../../Themes/AppsStyle';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 3, tabName: 'Chưa xác nhận' },
  { id: 1, tabName: 'Đồng ý' },
  { id: 0, tabName: 'Từ chối' },
];

const buildTabCounts = (arr, activeId = TABS[0].id) =>
  TABS.map(tab => ({
    ...tab,
    totalRow: arr.filter(it => it.confirm === tab.id).length,
    isChooseTag: tab.id === activeId,
  }));

// Compute contract violation alert string (pure function, no mutation)
const computeAlertItem = (item, dateCheck, dateResign) => {
  const contractNoticeDays = item.contractNoticeDays || 0;
  if (contractNoticeDays <= 0 || !dateCheck || !dateResign) return null;
  const countDayResign = moment(dateResign, 'YYYY-MM-DD').diff(
    dateCheck,
    'days',
  );
  if (countDayResign >= contractNoticeDays) return null;
  const dateLimit = moment(dateCheck)
    .add(contractNoticeDays, 'days')
    .format('YYYY-MM-DD');
  const dateLate = moment(dateLimit, 'YYYY-MM-DD').diff(dateResign, 'days');
  const violateDays =
    dateLate > contractNoticeDays ? contractNoticeDays : dateLate;
  const costViolate = item?.salaryDefault
    ? violateDays * (item.salaryDefault / 30)
    : 0;
  return [
    `*Cảnh báo vi phạm thời gian báo trước:`,
    `- Số ngày nhân viên cần báo trước: ${contractNoticeDays} ngày`,
    `- Số ngày nhân viên báo trước: ${countDayResign} ngày`,
    `- Số ngày vi phạm: ${violateDays} ngày`,
    `- Ngày nghỉ sớm nhất đúng quy định: ${dateLimit}`,
    costViolate > 0
      ? `- Mức phạt vi phạm: ${costViolate.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}`
      : '',
    item?.noteResignByEmployee ? `- ${item.noteResignByEmployee}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

// Pre-process raw API items once: parse photos + compute alertItem
const processItems = rawArr =>
  rawArr.map(item => ({
    ...item,
    _photos: JSON.parse(item.photo || '[]').map(it => ({
      photoPath: it.photo,
    })),
    alertItem:
      item.contractNoticeDays > 0
        ? computeAlertItem(
            item,
            moment(item.createdDate).format('YYYY-MM-DD'),
            moment(item.fromDate, 'YYYYMMDD').format('YYYY-MM-DD'),
          )
        : null,
  }));

// ─── Main Component ───────────────────────────────────────────────────────────

export const ConfirmsResigns = ({ navigation, route, isShowHeader = true }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [dataResigns, setDataResigns] = useState([]);
  const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 });
  const [refresh, setRefresh] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS[0]);
  const [visible, setVisible] = useState(false);
  const [visibleCalendar, setVisibleCalendar] = useState(false);
  const [itemSelect, setItemSelect] = useState({});

  // ─── Derived state — tabCounts & dataResignsByTab computed, not stored ──────
  const tabCounts = useMemo(
    () => buildTabCounts(dataResigns, currentTab.id),
    [dataResigns, currentTab.id],
  );
  const dataResignsByTab = useMemo(
    () => dataResigns.filter(it => it.confirm === currentTab.id),
    [dataResigns, currentTab.id],
  );

  // ─── Data loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setRefresh(true);
    const result = await Employee.getResignInfo('EmployeeConfirm');
    const { arr } = groupDataByKey({
      arr: result.data,
      key: 'confirm',
      keyLayer2: 'fromDate',
    });
    setDataResigns(processItems(arr));
    setRefresh(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // ─── Submit handlers ───────────────────────────────────────────────────────
  const uploadAction = useCallback(
    payload => {
      MessageAction2(
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        async () => {
          const result = await Employee.sendEmployeeResigns(
            JSON.stringify(payload),
            null,
            'CONFIRM',
            userinfo.groupType || 'SUP',
            payload.employeeId,
          );
          if (result) {
            if (payload.confirm === 1) {
              const mailResult = await Employee.sendMailEmployeeResign(
                JSON.stringify({ id: payload.id }),
              );
              if (mailResult.statusId !== 200) {
                ToastError('Xảy ra lỗi khi gửi mail');
              } else {
                MessageInfo('Đã gửi mail cho các phòng ban liên quan');
              }
            }
            loadData();
          }
        },
        () => {},
      );
    },
    [userinfo.groupType, loadData],
  );

  const handleSendConfirm = useCallback(
    item => {
      if (item.isConfirm !== 1 && item.isConfirm !== 0) {
        toastError('cảnh báo', 'Bạn chưa chọn đồng ý/từ chối yêu cầu');
        return;
      }
      if (item.isConfirm === 0) {
        if (!item.confirmNote) {
          ToastError('Bạn chưa ghi chú lí do từ chối');
          return;
        }
        if (item.confirmNote.length < 5) {
          ToastError('Ghi chú quá ngắn, ít nhất 5 kí tự');
          return;
        }
      }
      const confirm = item.isConfirm;
      const payload = {
        ...item,
        confirm,
        confirmContent: confirm === 1 ? 'Đồng ý' : 'Từ chối',
        notifyContent: `Quản lí ${userinfo.employeeName} đã ${
          confirm === 1 ? 'Đồng ý' : 'Từ chối'
        } yêu cầu xin nghỉ việc vào ${moment().format('YYYY-MM-DD HH:mm')}.`,
        confirmDate: moment().format('YYYY-MM-DD HH:mm'),
      };
      if (
        item.contractNoticeDays > 0 &&
        item.alertItem?.length > 0 &&
        confirm === 1 &&
        !item.confirmNote
      ) {
        MessageAction2(
          'Bạn chưa nhập ghi chú về việc vi phạm thời gian báo trước theo hợp đồng lao động. Bạn có chắc chắn muốn tiếp tục đồng ý cho nhân viên nghỉ việc không ?',
          () => uploadAction(payload),
          () => {},
        );
      } else {
        uploadAction(payload);
      }
    },
    [userinfo.employeeName, uploadAction],
  );

  // ─── Field change handlers — immutable state updates ──────────────────────
  const handleChangeConfirm = useCallback((value, itemId) => {
    setDataResigns(prev =>
      prev.map(it =>
        it.id === itemId
          ? { ...it, isConfirm: it.isConfirm === value ? null : value }
          : it,
      ),
    );
  }, []);

  const handleChangeNote = useCallback((text, itemId) => {
    setDataResigns(prev =>
      prev.map(it => (it.id === itemId ? { ...it, confirmNote: text } : it)),
    );
  }, []);

  // ─── Tab / image / calendar handlers ──────────────────────────────────────
  const handleChangeTab = useCallback((tabItem, key) => {
    const tab = TABS.find(t => t[key] === tabItem.keyValue);
    if (tab) setCurrentTab(tab);
  }, []);

  const handleSelectImage = useCallback((listPhotoItem, indexImage) => {
    setDataPhoto({ listPhoto: listPhotoItem, indexImage });
    setVisible(true);
  }, []);

  const handleSelectPencil = useCallback(item => {
    setItemSelect(item);
    setVisibleCalendar(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setItemSelect({});
    setVisibleCalendar(false);
  }, []);

  const handleSelectDate = useCallback(
    date => {
      setDataResigns(prev =>
        prev.map(it => {
          if (it.id !== itemSelect.id) return it;
          const updated = {
            ...it,
            fromDate: moment(date, 'YYYY-MM-DD').format('YYYYMMDD'),
          };
          return {
            ...updated,
            alertItem:
              updated.contractNoticeDays > 0
                ? computeAlertItem(
                    updated,
                    moment(updated.createdDate).format('YYYY-MM-DD'),
                    date,
                  )
                : null,
          };
        }),
      );
      setItemSelect({});
      setVisibleCalendar(false);
    },
    [itemSelect.id],
  );

  // ─── renderItem — stable reference prevents CustomListView from thrashing ──
  const renderItem = useCallback(
    ({ item }) => (
      <ResignCard
        item={item}
        appcolor={appcolor}
        onChangeConfirm={handleChangeConfirm}
        onChangeNote={handleChangeNote}
        onSendConfirm={handleSendConfirm}
        onSelectPencil={handleSelectPencil}
        onSelectImage={handleSelectImage}
      />
    ),
    [
      appcolor,
      handleChangeConfirm,
      handleChangeNote,
      handleSendConfirm,
      handleSelectPencil,
      handleSelectImage,
    ],
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[s.flex1, { backgroundColor: appcolor.light }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {isShowHeader && (
        <HeaderCustom
          leftFunc={() => navigation.goBack()}
          title={route?.params?.menuitem.menuNameVN || 'Yêu cầu nghỉ việc'}
        />
      )}
      <GroupListData
        dataMain={tabCounts}
        keyCountData="totalRow"
        keyValue="id"
        keyName="tabName"
        handlerChange={handleChangeTab}
      />
      <CustomListView
        data={dataResignsByTab}
        renderItem={renderItem}
        onRefresh={loadData}
      />
      <Modal
        visible={visibleCalendar}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <ViewCalendar
          itemEdit={itemSelect}
          closeCalendar={closeCalendar}
          handleSelectDate={handleSelectDate}
        />
      </Modal>
      <ViewPictures
        visible={visible}
        images={dataPhoto.listPhoto}
        onSwipeDown={() => setVisible(false)}
        initialIndex={dataPhoto.indexImage}
      />
      {refresh && (
        <LoadingView
          title="Đang tải dữ liệu..."
          isLoading
          styles={{ marginTop: 8 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

// ─── ResignCard — memoized: only re-renders when its own item changes ──────────

const ResignCard = memo(
  ({
    item,
    appcolor,
    onChangeConfirm,
    onChangeNote,
    onSendConfirm,
    onSelectPencil,
    onSelectImage,
  }) => {
    const isPending = item.confirm === 3;
    const statusColor =
      item.confirm === 3
        ? appcolor.warning
        : item.confirm === 1
        ? appcolor.success
        : appcolor.danger;

    const renderPhoto = ({ item: ph, index }) => (
      <TouchableOpacity onPress={() => onSelectImage(item._photos, index)}>
        <Image
          source={{ uri: URLDEFAULT + ph.photoPath }}
          style={[s.photoThumb, { backgroundColor: appcolor.surface }]}
        />
      </TouchableOpacity>
    );

    return (
      <View style={[s.cardWrapper, { backgroundColor: appcolor.light }]}>
        <View style={[s.card, { backgroundColor: appcolor.light }]}>
          {/* ── Header: status badge + confirm/reject toggles ── */}
          <View style={s.cardHeader}>
            <View
              style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}
            >
              <SpiralIcon
                name={
                  item.confirm === 3
                    ? 'clock'
                    : item.confirm === 1
                    ? 'check-circle'
                    : 'times-circle'
                }
                type="font-awesome-5"
                size={13}
                color={appcolor.greydark}
              />
              <Text style={[s.statusText, { color: appcolor.dark }]}>
                {item.confirmContent}
              </Text>
            </View>
            {isPending && (
              <View style={s.toggleRow}>
                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    {
                      borderColor:
                        item.isConfirm === 1
                          ? appcolor.success
                          : appcolor.grayLight,
                      backgroundColor:
                        item.isConfirm === 1
                          ? appcolor.success + '22'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => onChangeConfirm(1, item.id)}
                >
                  <SpiralIcon
                    name="check"
                    type="font-awesome-5"
                    size={12}
                    color={
                      item.isConfirm === 1 ? appcolor.success : appcolor.dark
                    }
                  />
                  <Text
                    style={[
                      s.toggleText,
                      {
                        color:
                          item.isConfirm === 1
                            ? appcolor.success
                            : appcolor.dark,
                      },
                    ]}
                  >
                    Đồng ý
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    {
                      borderColor:
                        item.isConfirm === 0
                          ? appcolor.danger
                          : appcolor.grayLight,
                      backgroundColor:
                        item.isConfirm === 0
                          ? appcolor.danger + '22'
                          : 'transparent',
                      marginStart: 6,
                    },
                  ]}
                  onPress={() => onChangeConfirm(0, item.id)}
                >
                  <SpiralIcon
                    name="times"
                    type="font-awesome-5"
                    size={12}
                    color={
                      item.isConfirm === 0 ? appcolor.danger : appcolor.dark
                    }
                  />
                  <Text
                    style={[
                      s.toggleText,
                      {
                        color:
                          item.isConfirm === 0
                            ? appcolor.danger
                            : appcolor.dark,
                      },
                    ]}
                  >
                    Từ chối
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[s.divider, { backgroundColor: appcolor.grayLight }]} />

          {/* ── Info rows ── */}
          <InfoRow
            icon="user"
            color={appcolor.primary}
            label="Nhân viên"
            value={item.employeeName}
            appcolor={appcolor}
          />
          {!!item.contractType && (
            <InfoRow
              icon="scroll"
              color={appcolor.info}
              label="Loại hợp đồng"
              value={item.contractType}
              appcolor={appcolor}
            />
          )}
          <View style={s.infoRow}>
            <View
              style={[s.iconWrap, { backgroundColor: appcolor.warning + '22' }]}
            >
              <SpiralIcon
                name="calendar-day"
                type="font-awesome-5"
                size={13}
                color={appcolor.dark}
              />
            </View>
            <Text style={[s.infoLabel, { color: appcolor.textLight }]}>
              Ngày nghỉ
            </Text>
            <Text style={[s.infoValue, { color: appcolor.dark, flex: 1 }]}>
              {moment(item.fromDate.toString()).format('YYYY-MM-DD')}
            </Text>
            {isPending && (
              <TouchableOpacity
                onPress={() => onSelectPencil(item)}
                style={[s.editBtn, { backgroundColor: appcolor.info + '22' }]}
              >
                <SpiralIcon
                  name="pencil-alt"
                  type="font-awesome-5"
                  size={13}
                  color={appcolor.info}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Contract warning ── */}
          {item.contractNoticeDays > 0 && !!item.alertItem && (
            <View
              style={[
                s.warningBox,
                {
                  backgroundColor: appcolor.danger + '15',
                  borderColor: appcolor.danger + '40',
                },
              ]}
            >
              <SpiralIcon
                name="exclamation-triangle"
                type="font-awesome-5"
                size={13}
                color={appcolor.danger}
                style={{ marginTop: 2 }}
              />
              <Text style={[s.warningText, { color: appcolor.danger }]}>
                {item.alertItem}
              </Text>
            </View>
          )}

          <InfoRow
            icon="sticky-note"
            color={appcolor.success}
            label="Lí do chính"
            value={item.reasonResign}
            appcolor={appcolor}
          />
          {!!item.notes && (
            <InfoRow
              icon="align-left"
              color={appcolor.dark}
              label="Lí do chi tiết"
              value={item.notes}
              appcolor={appcolor}
            />
          )}

          {/* ── Note input ── */}
          {(item.confirm !== 1 || (item.confirm === 1 && item.confirmNote)) && (
            <FormGroup
              iconName="comment-alt"
              multiline
              selectTextOnFocus
              containerStyle={[
                s.noteInput,
                { backgroundColor: appcolor.grayLight },
              ]}
              inputStyle={{ fontSize: 13, color: appcolor.dark }}
              placeholder="Nhập ghi chú..."
              editable={isPending}
              handleChangeForm={text => onChangeNote(text, item.id)}
              value={item.confirmNote || ''}
            />
          )}

          <CustomListView
            horizontal
            data={item._photos}
            renderItem={renderPhoto}
          />

          {/* ── Footer: timestamps + send button ── */}
          <View style={[s.cardFooter, { borderTopColor: appcolor.grayLight }]}>
            <View>
              <TimestampRow
                icon="paper-plane"
                label="Gửi lúc"
                value={moment(item.createdDate).format('YYYY-MM-DD HH:mm')}
                appcolor={appcolor}
              />
              {item.confirm !== 3 && (
                <TimestampRow
                  icon="check-double"
                  label={item.confirm === 1 ? 'Đồng ý lúc' : 'Từ chối lúc'}
                  value={moment(item.confirmDate).format('YYYY-MM-DD HH:mm')}
                  appcolor={appcolor}
                />
              )}
            </View>
            {isPending && (
              <TouchableOpacity
                onPress={() => onSendConfirm(item)}
                style={[s.sendBtn, { backgroundColor: appcolor.success }]}
                activeOpacity={0.75}
              >
                <SpiralIcon
                  name="paper-plane"
                  type="font-awesome-5"
                  size={14}
                  color={appcolor.white}
                />
                <Text style={[s.sendBtnText, { color: appcolor.white }]}>
                  Gửi
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ icon, color, label, value, appcolor }) => (
  <View style={s.infoRow}>
    <View style={[s.iconWrap, { backgroundColor: color + '22' }]}>
      <SpiralIcon name={icon} type="font-awesome-5" size={13} color={color} />
    </View>
    <Text style={[s.infoLabel, { color: appcolor.textLight }]}>{label}</Text>
    <Text style={[s.infoValue, { color: appcolor.dark }]}>{value}</Text>
  </View>
);

const TimestampRow = ({ icon, label, value, appcolor }) => (
  <View style={s.timestampRow}>
    <SpiralIcon
      name={icon}
      type="font-awesome-5"
      size={12}
      color={appcolor.textLight}
    />
    <Text style={[s.timestampText, { color: appcolor.textLight }]}>
      {label}: {value}
    </Text>
  </View>
);

const ViewCalendar = ({ itemEdit, closeCalendar, handleSelectDate }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const startDate = itemEdit?.fromDate
    ? moment(itemEdit.fromDate.toString()).format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD');
  const markedDates = {
    [startDate]: {
      selected: true,
      marked: true,
      selectedColor: appcolor.primary,
    },
  };

  return (
    <View style={s.calendarOverlay}>
      <View style={[s.calendarSheet, { backgroundColor: appcolor.surface }]}>
        <View
          style={[s.calendarHeader, { borderBottomColor: appcolor.grayLight }]}
        >
          <Text style={[s.calendarTitle, { color: appcolor.dark }]}>
            Chọn ngày nghỉ
          </Text>
          <TouchableOpacity
            onPress={closeCalendar}
            style={[s.closeBtn, { backgroundColor: appcolor.danger + '22' }]}
          >
            <SpiralIcon
              name="times"
              type="font-awesome-5"
              size={14}
              color={appcolor.danger}
            />
          </TouchableOpacity>
        </View>
        <Calendar
          firstDay={1}
          current={moment(startDate).format('YYYY-MM-DD')}
          monthFormat="MM - yyyy"
          hideExtraDays
          theme={{
            backgroundColor: appcolor.surface,
            calendarBackground: appcolor.surface,
            todayTextColor: appcolor.primary,
            selectedDayTextColor: appcolor.white,
            dayTextColor: appcolor.dark,
            monthTextColor: appcolor.dark,
          }}
          markedDates={markedDates}
          onDayPress={date => handleSelectDate(date.dateString)}
        />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex1: { flex: 1 },
  // Cards
  cardWrapper: { padding: 8, paddingTop: 0 },
  card: {
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#00000015',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: fontWeightBold, textAlign: 'center' },
  toggleRow: { flexDirection: 'row' },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleText: { fontSize: 12, fontWeight: fontWeightBold },
  divider: { height: 1, marginVertical: 8 },
  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
  },
  infoLabel: { fontSize: 12, fontWeight: '500', width: 100 },
  infoValue: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 6,
  },
  // Warning
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  warningText: { fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 18 },
  // Note input
  noteInput: { borderRadius: 10, margin: 4, marginTop: 8 },
  // Photos
  photoThumb: {
    width: deviceWidth / 4 - 12,
    height: deviceWidth / 4 - 12,
    borderRadius: 10,
    margin: 4,
  },
  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  timestampText: { fontSize: 12 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 20,
    width: 90,
    justifyContent: 'center',
  },
  sendBtnText: { fontSize: 12, fontWeight: fontWeightBold },
  // Calendar
  calendarOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  calendarSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  calendarTitle: { fontSize: 15, fontWeight: fontWeightBold },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
