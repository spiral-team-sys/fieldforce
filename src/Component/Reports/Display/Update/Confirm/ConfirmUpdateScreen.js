import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Divider, Text } from '@rneui/base';
import { REPORT } from '../../../../../API/ReportAPI';
import { HeaderCustom } from '../../../../../Content/HeaderCustom';
import { toastError, toastSuccess } from '../../../../../Utils/configToast';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import { fontWeightBold, styleDefault } from '../../../../../Themes/AppsStyle';
import { removeVietnameseTones } from '../../../../../Core/Helper';
import { NotificationAPI } from '../../../../../API/NotificationAPI';
import moment from 'moment';
import _ from 'lodash';

// confirm values: 3 = pending, 1 = approved, -1 = rejected
const CONFIRM_PENDING = 3;
const CONFIRM_APPROVED = 1;
const CONFIRM_REJECTED = -1;

const ConfirmUpdateScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmNote, setConfirmNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // #region actions
  const LoadData = async () => {
    setIsLoading(true);
    const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      //
      setData(mData);
      setDataMain(mData);
    });
    setIsLoading(false);
  };

  const onBack = () => navigation.goBack();
  const onPressItem = item => {
    if (!item.isConfirm) return;
    setSelectedItem(item);
    setConfirmNote('');
    setModalVisible(true);
  };
  const onCloseModal = () => {
    if (isSubmitting) return;
    setModalVisible(false);
    setSelectedItem(null);
  };
  const onSubmitConfirm = async confirmValue => {
    if (isSubmitting || !selectedItem) return;
    const payload = {
      ...selectedItem,
      confirm: confirmValue,
      confirmNote: confirmNote.trim(),
    };
    if (!validData(payload)) return;
    await setIsSubmitting(true);
    const result = await REPORT.UploadDataRaw_Realtime(
      payload,
      shopinfo?.shopId || 0,
      kpiinfo.id,
    );
    if (result.statusId == 200) {
      await onSendNotification(payload);
      toastSuccess(
        'Thành công',
        confirmValue === CONFIRM_APPROVED
          ? 'Đã xác nhận yêu cầu'
          : 'Đã từ chối yêu cầu',
      );
      setModalVisible(false);
      setSelectedItem(null);
      await LoadData();
    } else {
      toastError('Thông báo', `Lỗi: ${result?.messager || 'Không xác định'}`);
    }
    await setIsSubmitting(false);
  };
  const onSendNotification = async item => {
    const dataNotify = {
      title: `${
        item.confirm === CONFIRM_APPROVED ? 'Xác nhận' : 'Từ chối'
      } yêu cầu cập nhật trưng bày`,
      content: `Quản lí ${userinfo.employeeName} ${
        item.confirm === CONFIRM_APPROVED ? 'Đã xác nhận' : 'Đã từ chối'
      } yêu cầu cập nhật trưng bày: Cửa hàng ${item.shopName} (${
        item.shopCode
      }), ${item.confirmNote ? `Ghi chú: ${item.confirmNote}` : ''}`,
      sendType: 'DisplayUpdate',
      pageName:
        item.confirm === CONFIRM_APPROVED ? 'confirmupdatedisplay' : null,
      employees: `${
        item.confirm === CONFIRM_APPROVED
          ? item.employeeParent
          : item.employeeId || ''
      }`,
    };
    await NotificationAPI.SendNotification(dataNotify);
  };
  const validData = payload => {
    if (
      payload.confirm === CONFIRM_REJECTED &&
      (!payload.confirmNote || payload.confirmNote.trim() === '')
    ) {
      setErrorMessage('Vui lòng nhập ghi chú khi từ chối yêu cầu');
      return false;
    }
    return true;
  };
  const onSearchData = text => {
    if (!text || text.trim() === '') {
      setData(dataMain);
    } else {
      const keyword = removeVietnameseTones(text.trim().toLowerCase());
      const filtered = _.filter(
        dataMain,
        o =>
          removeVietnameseTones((o.shopName || '').toLowerCase()).includes(
            keyword,
          ) ||
          removeVietnameseTones((o.shopCode || '').toLowerCase()).includes(
            keyword,
          ) ||
          removeVietnameseTones((o.employeeName || '').toLowerCase()).includes(
            keyword,
          ),
      );
      setData(filtered);
    }
  };
  const onChangeConfirmNote = text => {
    setConfirmNote(text);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };
  // #endregion

  useEffect(() => {
    LoadData();
  }, []);

  // #region styles
  const styles = StyleSheet.create({
    ...styleDefault(appcolor),
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: {
      margin: 8,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
    },
    statusText: { fontSize: 12, fontWeight: fontWeightBold, marginBottom: 4 },
    shopName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    infoText: { fontSize: 12, color: appcolor.greylight, marginTop: 2 },
    noteText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: appcolor.primary,
      marginTop: 4,
    },
    timeText: {
      fontSize: 11,
      fontStyle: 'italic',
      color: appcolor.greylight,
      textAlign: 'right',
      marginTop: 6,
    },
    badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    // modal
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 200,
    },
    modalBox: {
      width: '100%',
      backgroundColor: appcolor.light,
      borderRadius: 12,
      padding: 16,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
      marginBottom: 8,
    },
    divider: {
      height: 1,
      backgroundColor: appcolor.grayLight,
      marginVertical: 8,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.greylight,
      marginBottom: 1,
    },
    sectionValue: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 4,
    },
    sectionValueSm: {
      fontSize: 12,
      color: appcolor.greylight,
      marginBottom: 2,
    },
    noteInput: {
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
      color: appcolor.dark,
      minHeight: 72,
      textAlignVertical: 'top',
      marginTop: 4,
    },
    btnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 8,
    },
    btn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnLabel: { fontSize: 14, fontWeight: fontWeightBold },
  });
  // #endregion

  // #region render helpers
  const getStatusColor = confirm => {
    if (confirm === CONFIRM_PENDING) return appcolor.warning;
    if (confirm === CONFIRM_REJECTED) return appcolor.red;
    return appcolor.success;
  };

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.confirm);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onPressItem(item)}
        disabled={!item.isConfirm}
        activeOpacity={0.6}
      >
        {item.confirmStatus && (
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.confirmStatus}
          </Text>
        )}
        <Text
          style={styles.shopName}
        >{`[${item.shopCode}] ${item.shopName}`}</Text>
        <Text style={styles.infoText}>{`ĐC: ${item.address}`}</Text>
        <Text
          style={styles.infoText}
        >{`NV: ${item.employeeName} (${item.employeeCode})`}</Text>
        <Divider style={{ marginVertical: 4 }} />
        {item.reasonValue && (
          <Text style={styles.infoText}>{`${item.reasonValue}`}</Text>
        )}
        {item.requestNote && (
          <Text
            style={styles.infoText}
          >{`Lý do chi tiết: ${item.requestNote}`}</Text>
        )}
        <Text style={styles.infoText}>{`Thời gian gửi: ${moment(
          item.createdDate,
        ).format('HH:mm - DD/MM/YYYY')}`}</Text>

        {item.confirmByName && (
          <View
            style={[
              styles.itemContainer,
              { backgroundColor: appcolor.surface, borderWidth: 0 },
            ]}
          >
            <Text
              style={[styles.shopName, { color: statusColor }]}
            >{`${item.typeConfirm}`}</Text>
            <Text
              style={styles.infoText}
            >{`Quản lí xác nhận: ${item.confirmByName}`}</Text>
            <Text
              style={styles.infoText}
            >{`Quản lí ghi chú: ${item.confirmNote}`}</Text>
            <Text style={styles.infoText}>{`Thời gian xác nhận: ${moment(
              item.confirmDate,
            ).format('HH:mm - DD/MM/YYYY')}`}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderModal = () => {
    if (!selectedItem) return null;
    return (
      <Modal
        visible={modalVisible}
        statusBarTranslucent
        transparent
        animationType="fade"
        onRequestClose={onCloseModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Xác nhận yêu cầu cập nhật trưng bày
            </Text>
            {errorMessage && (
              <Text
                style={[
                  styles.subTitleName,
                  { color: appcolor.danger, textAlign: 'center' },
                ]}
              >
                *{errorMessage}
              </Text>
            )}
            <View style={styles.divider} />
            {/* Shop info */}
            <Text style={styles.sectionLabel}>Cửa hàng</Text>
            <Text
              style={styles.sectionValue}
            >{`[${selectedItem.shopCode}] ${selectedItem.shopName}`}</Text>
            <Text
              style={styles.sectionValueSm}
            >{`ĐC: ${selectedItem.address}`}</Text>
            <View style={styles.divider} />
            {/* Employee info */}
            <Text style={styles.sectionLabel}>Nhân viên yêu cầu</Text>
            <Text
              style={styles.sectionValue}
            >{`${selectedItem.employeeName} (${selectedItem.employeeCode})`}</Text>
            {/* Request note */}
            {selectedItem.requestNote ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>Ghi chú yêu cầu</Text>
                {selectedItem.reasonValue && (
                  <Text
                    style={[styles.sectionValueSm, { fontStyle: 'italic' }]}
                  >
                    {selectedItem.reasonValue}
                  </Text>
                )}
                <Text style={[styles.sectionValueSm, { fontStyle: 'italic' }]}>
                  {selectedItem.requestNote}
                </Text>
              </>
            ) : null}
            <View style={styles.divider} />
            {/* Confirm note */}
            <Text style={styles.sectionLabel}>Ghi chú xác nhận</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập ghi chú..."
              placeholderTextColor={appcolor.gray}
              value={confirmNote}
              onChangeText={onChangeConfirmNote}
              multiline
              numberOfLines={3}
              maxLength={300}
              editable={!isSubmitting}
            />
            {/* Actions */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { borderWidth: 1, borderColor: appcolor.grayLight },
                ]}
                onPress={onCloseModal}
                disabled={isSubmitting}
              >
                <Text style={[styles.btnLabel, { color: appcolor.greylight }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: appcolor.red || appcolor.danger },
                ]}
                onPress={() => onSubmitConfirm(CONFIRM_REJECTED)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={appcolor.light} />
                ) : (
                  <Text style={[styles.btnLabel, { color: appcolor.light }]}>
                    Từ chối
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: appcolor.success || appcolor.primary },
                ]}
                onPress={() => onSubmitConfirm(CONFIRM_APPROVED)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={appcolor.light} />
                ) : (
                  <Text style={[styles.btnLabel, { color: appcolor.light }]}>
                    Xác nhận
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  // #endregion

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN || 'Xác nhận cập nhật trưng bày'}
        leftFunc={onBack}
      />
      <SearchData
        placeholder="Tìm kiếm cửa hàng / nhân viên"
        onSearchData={onSearchData}
      />
      <CustomListView
        data={data}
        extraData={data}
        renderItem={renderItem}
        onRefresh={LoadData}
        isLoading={isLoading}
      />
      {renderModal()}
    </View>
  );
};

export default ConfirmUpdateScreen;
