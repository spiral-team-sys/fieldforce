import { useEffect, useState } from 'react';
import {
  MessageInfo,
  ToastSuccess,
  UUIDGenerator,
  deviceSize,
  formatDate,
  formatNumber,
  removeVietnameseTones,
} from '../../../Core/Helper';
import FormGroup from '../../../Content/FormGroup';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PhotoInput } from './PhotoInput';
import { InfoBlock, InfoRow } from '../Control/ExplanControl';
import { Button } from '@rneui/themed';
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';

const getTabField = (tab = {}) => tab.ref_Name || tab.ref_Field || 'confirm';

const normalizeTabValue = value => {
  if (value === false) return '0';
  if (value === true) return '1';
  return String(value);
};

const getDisplayStatusTab = (item = {}, dataTab = []) => {
  const customTab = dataTab.find(tab => {
    const field = getTabField(tab);
    return (
      tab.ref_Id != null &&
      field !== 'confirm' &&
      normalizeTabValue(item?.[field]) === normalizeTabValue(tab.ref_Id)
    );
  });

  if (customTab) return customTab;

  return dataTab.find(tab => {
    const field = getTabField(tab);
    return (
      tab.ref_Id != null &&
      field === 'confirm' &&
      normalizeTabValue(item?.confirm) === normalizeTabValue(tab.ref_Id)
    );
  });
};

const parseEndTime = value => {
  if (!value) return null;

  return moment(
    value,
    [
      moment.ISO_8601,
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY/MM/DD HH:mm:ss',
      'YYYYMMDDHHmmss',
      'YYYYMMDD',
    ],
    true,
  );
};

export const VerifyDetailModal = ({
  visible,
  item,
  role,
  onClose,
  onSubmitExplain,
  onLeaderConfirm,
  lableStatus,
  dataTab = [],
  submitting,
  styles,
  dataInput,
  appcolor,
}) => {
  const [form, setForm] = useState({
    id: null,
    guid: null,
    verifyNote: '',
    verifyIMEI: '',
    photos: [],
    confirmNote: '',
  });

  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        guid: item.guid || UUIDGenerator(),
        verifyNote: item.verifyNote || '',
        verifyIMEI: item.verifyIMEI || '',
        photos: item.photos || [],
        confirmNote: item.confirmNote || '',
      });
    }
  }, [item]);

  if (!item) return null;

  const isEmployee = role === 'employee';
  const isLeader = role === 'leader';

  const confirmValue =
    item.confirm === null || item.confirm === undefined || item.confirm === ''
      ? null
      : Number(item.confirm);
  const isLeaderLockAction = Number(item.isLeaderLockAction);
  const endTime = parseEndTime(item.endTime);
  const isNotExpired =
    !item.endTime || !endTime.isValid() || moment().isSameOrBefore(endTime);
  const canEmployeeEdit =
    isEmployee && (confirmValue === 0 || confirmValue === -1) && isNotExpired;

  const canLeaderAction =
    isLeader && confirmValue === 3 && isLeaderLockAction !== 1;
  const datePC = [item.startDatePC, item.endDatePC]
    .filter(Boolean)
    .map(formatDate)
    .join(' - ');
  const explainRequired =
    item.yeuCauGiaiTrinh === false || item.yeuCauGiaiTrinh == 0
      ? 'Không cần giải trình'
      : 'Cần giải trình';
  const displayStatusTab = getDisplayStatusTab(item, dataTab);
  const statusLabel =
    displayStatusTab?.nameVN || lableStatus[item.confirm] || '';
  const hasAction = canEmployeeEdit || canLeaderAction;

  const onChange = (field, value) => {
    if (typeof field === 'string') {
      setForm(prev => ({ ...prev, [field]: value }));
      return;
    }

    const textValue = field.ref_Code === 'number' ? formatNumber(value) : value;
    setForm(prev => ({ ...prev, [field.ref_Name]: textValue }));
  };

  const validateEmployeeSubmit = async () => {
    if (!canEmployeeEdit) {
      MessageInfo(
        'Thời gian giải trình đã kết thúc, bạn không thể gửi giải trình.',
      );
      return false;
    }
    for (let idx = 0; idx < dataInput.length; idx++) {
      const itemInput = dataInput[idx];
      if (itemInput.isRequired == 1) {
        if (itemInput.ref_Code == 'text' || itemInput.ref_Code == 'number') {
          const textValue = removeVietnameseTones(
            form[itemInput.ref_Name] || '',
          );
          if (
            textValue == '' ||
            (itemInput.numberValue > 0 &&
              textValue.length !== itemInput.numberValue) ||
            (!itemInput.numberValue && textValue.length < 0)
          ) {
            if (itemInput.numberValue) {
              MessageInfo(
                `Dữ liệu "${itemInput.nameVN}" là bắt buộc và phải đúng ${itemInput.numberValue} ký tự, vui lòng kiểm tra lại!`,
              );
              return false;
            }
            MessageInfo(
              `Dữ liệu "${itemInput.nameVN}" là bắt buộc, vui lòng kiểm tra lại!`,
            );
            return false;
          }
        }
        if (itemInput.ref_Code == 'images') {
          const listPhoto = form[itemInput.ref_Name] || [];
          if (listPhoto.length < (itemInput.numberValue || 1)) {
            MessageInfo(
              `Số lượng "${itemInput.nameVN}" không đủ, vui lòng kiểm tra lại(${
                listPhoto.length
              }/${itemInput.numberValue || 1})!`,
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmitExplain = async () => {
    if (!(await validateEmployeeSubmit())) return;
    onSubmitExplain({
      ...item,
      ...form,
    });
  };

  const handleLeaderConfirm = confirmValue => {
    if (confirmValue === -1 && !form.confirmNote?.trim()) {
      MessageInfo('Vui lòng nhập lý do từ chối.');
      return;
    }

    onLeaderConfirm({
      id: item.id,
      shopId: item.shopId,
      confirm: confirmValue,
      confirmNote: form.confirmNote || '',
      typeAction: 'leader',
    });
  };

  const handleCopy = (label, value) => {
    if (value === null || value === undefined || value === '') return;

    Clipboard.setString(String(value));
    ToastSuccess(`Đã sao chép ${label}`);
  };

  const handlerCloseModal = () => {
    item.guid = form.guid; // Cập nhật guid mới cho item khi đóng modal
    item.photos = form.photos || []; // Cập nhật photos mới cho item khi đóng modal
    item.confirmNote = form.confirmNote; // Cập nhật confirmNote mới cho item khi đóng modal
    item.verifyIMEI = form.verifyIMEI; // Cập nhật verifyIMEI mới cho item khi đóng modal
    item.verifyNote = form.verifyNote; // Cập nhật verifyNote mới cho item khi đóng modal
    onClose();
  };

  const InputList = () => {
    return dataInput?.map((it, id) => {
      switch (it.ref_Code) {
        case 'text':
        case 'number':
          return (
            <View key={`input_${id}`}>
              <Text style={styles.label}>{`Nội dung ${it.nameVN}`}</Text>
              <FormGroup
                style={[
                  styles.input,
                  styles.textArea,
                  !canEmployeeEdit && styles.disabledInput,
                ]}
                multiline
                editable={canEmployeeEdit}
                useClearAndroid={false}
                value={form[it.ref_Name]}
                keyboardType={
                  it.ref_Code === 'number' ? 'number-pad' : 'default'
                }
                placeholder={it.description || `Nhập ${it.nameVN}...`}
                handleChangeForm={text => onChange(it, text)}
                textAlignVertical="top"
              />
            </View>
          );
        case 'images':
          return (
            <View key={`input_${id}`}>
              {form.guid != null && (
                <PhotoInput
                  key={`photo_${item.id}_${form.guid || 'no-guid'}`}
                  enableTakePhoto={canEmployeeEdit}
                  _guid={form.guid}
                  shopId={item.shopId}
                  shopCode={item.shopCode}
                  photoType={'SaleExplain'}
                  listPhoto={form[it.ref_Name] || []}
                  handlerAddImage={value => onChange(it, value)}
                />
              )}
            </View>
          );
      }
    });
  };

  return (
    <Modal
      visible={visible}
      style={{ width: deviceSize.dwidth, height: deviceSize.dheight / 2 }}
      animationType="slide"
      onRequestClose={handlerCloseModal}
    >
      <View style={[styles.modalContainer, { height: deviceSize.dheight }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi tiết giải trình</Text>
          <TouchableOpacity onPress={handlerCloseModal}>
            <Text style={styles.modalClose}>Đóng</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <FlatList
            data={[{ key: 'employeeExplain' }]}
            keyExtractor={flatItem => flatItem.key}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator
            ListHeaderComponent={
              <InfoBlock title="Thông tin bán hàng" styles={styles}>
                <InfoRow
                  label="Ngày bán"
                  value={formatDate(item.salesDate)}
                  styles={styles}
                />
                <InfoRow
                  label="Mã shop"
                  value={item.ShopCode || item.shopCode}
                  styles={styles}
                />
                <InfoRow label="Shop" value={item.shopNameVN} styles={styles} />
                <InfoRow label="Channel" value={item.channel} styles={styles} />
                <InfoRow
                  label="Yêu cầu giải trình"
                  value={explainRequired}
                  styles={styles}
                />
                <InfoRow label="Model" value={item.model} styles={styles} />
                <InfoRow label="SKU" value={item.sku} styles={styles} />
                <InfoRow
                  label="SN"
                  value={item.sn}
                  styles={styles}
                  copyColor={appcolor.info}
                  onCopy={item.sn ? () => handleCopy('SN', item.sn) : undefined}
                />
                <InfoRow
                  label="IMEI1"
                  value={item.imei1}
                  styles={styles}
                  copyColor={appcolor.info}
                  onCopy={
                    item.imei1
                      ? () => handleCopy('IMEI1', item.imei1)
                      : undefined
                  }
                />
                <InfoRow
                  label="IMEI2"
                  value={item.imei2}
                  styles={styles}
                  copyColor={appcolor.info}
                  onCopy={
                    item.imei2
                      ? () => handleCopy('IMEI2', item.imei2)
                      : undefined
                  }
                />
                <InfoRow
                  label="Lý do cần GT"
                  value={item.lyDoCanGT}
                  styles={styles}
                />
                <InfoRow
                  label="FF ghi chú GT"
                  value={item.ffcommentGiaiTrinh}
                  styles={styles}
                />
                <InfoRow
                  label="Trạng thái"
                  value={statusLabel}
                  styles={styles}
                />
                <InfoRow
                  label="Hạn xử lý"
                  value={formatDate(item.endTime)}
                  styles={styles}
                />
              </InfoBlock>
            }
            renderItem={() => (
              <InfoBlock title="Giải trình nhân viên" styles={styles}>
                {InputList()}
              </InfoBlock>
            )}
            ListFooterComponent={
              <View>
                {(confirmValue === -1 || confirmValue === 1) && (
                  <InfoBlock title="Kết quả duyệt" styles={styles}>
                    <InfoRow
                      label="Người duyệt"
                      value={item.confirmBy ? `${item.confirmBy}` : ''}
                      styles={styles}
                    />
                    <InfoRow
                      label="Thời gian duyệt"
                      value={formatDate(item.confirmTime)}
                      styles={styles}
                    />
                    <InfoRow
                      label="Ghi chú duyệt"
                      value={item.confirmNote || ''}
                      styles={styles}
                    />
                  </InfoBlock>
                )}

                {isLeader && (
                  <InfoBlock title="Xử lý quản lí" styles={styles}>
                    <Text style={styles.label}>{'Ghi chú quản lí'}</Text>
                    <FormGroup
                      style={[
                        styles.input,
                        styles.textArea,
                        !canLeaderAction && styles.disabledInput,
                      ]}
                      editable={canLeaderAction}
                      multiline
                      useClearAndroid={false}
                      value={form.confirmNote}
                      placeholder="Nhập ghi chú confirm / reject..."
                      handleChangeForm={text => onChange('confirmNote', text)}
                      textAlignVertical="top"
                    />
                  </InfoBlock>
                )}

                <View style={{ height: 112 }} />
              </View>
            }
          />
        </View>
        {hasAction && (
          <View
            style={[styles.bottomActions, { height: deviceSize.dheight * 0.1 }]}
          >
            {canEmployeeEdit && (
              <Button
                title={submitting ? 'Đang gửi...' : 'Gửi giải trình'}
                onPress={handleSubmitExplain}
                disabled={submitting}
                buttonStyle={styles.primaryButton}
              />
            )}

            {canLeaderAction && (
              <View style={styles.leaderActionRow}>
                <Button
                  title="Từ chối"
                  onPress={() => handleLeaderConfirm(-1)}
                  disabled={submitting}
                  buttonStyle={[
                    styles.secondaryButton,
                    { backgroundColor: appcolor.danger },
                  ]}
                  containerStyle={styles.leaderActionButton}
                />
                <Button
                  title="Đồng ý"
                  onPress={() => handleLeaderConfirm(1)}
                  disabled={submitting}
                  buttonStyle={styles.primaryButton}
                  containerStyle={styles.leaderActionButton}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};
