import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { uploadTimeOT } from '../../../../Controller/WorkController';
import { UpdateTimeOT } from '../../../../Controller/PhotoController';
import { ToastError, ToastSuccess } from '../../../../Core/Helper';
import OTActionRow from './Control/OTActionRow';
import OTNoteInput from './Control/OTNoteInput';
import OTStatusCard from './Control/OTStatusCard';
import OTSummarySection from './Control/OTSummarySection';
import OTTimeSelector from './Control/OTTimeSelector';
import { toastError } from '../../../../Utils/configToast';

const NOTE_MIN_LENGTH = 10;

const OTRegisterForm = ({
  dataOTSummary = [],
  masterOT = [],
  shopinfo,
  initialRegisteredTime = null,
  onClose,
  onRegistered,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [note, setNote] = useState(null);
  const [itemSelect, setItemSelect] = useState({});
  const [localSummary, setLocalSummary] = useState(dataOTSummary);
  const [submitting, setSubmitting] = useState(false);
  const [registeredTime, setRegisteredTime] = useState(initialRegisteredTime);

  useEffect(() => {
    setLocalSummary(dataOTSummary);
  }, [dataOTSummary]);

  useEffect(() => {
    setRegisteredTime(initialRegisteredTime);
  }, [initialRegisteredTime]);

  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  const summaryItems = useMemo(() => {
    if (!Array.isArray(localSummary)) return [];

    return localSummary.map(item => ({
      value: item.totalOT ?? item.TotalOT ?? item.value ?? 0,
      title: item.title ?? item.Title ?? item.name ?? item.nameVN ?? '',
      limitOT: item.limitOT,
    }));
  }, [localSummary]);

  const timeOptions = useMemo(() => {
    return Array.isArray(masterOT) ? masterOT : [];
  }, [masterOT]);

  const selectedTime = useMemo(() => {
    const timeValue = parseFloat(itemSelect?.ref_Code || 0);
    return Number.isNaN(timeValue) ? 0 : timeValue;
  }, [itemSelect]);

  const isRegistered = registeredTime !== null;
  const monthLimit = summaryItems?.[0]?.limitOT;
  const totalMonth = summaryItems?.[0]?.value || 0;

  const handleSelectTime = useCallback(item => {
    setItemSelect(item);
    setNote(null);
  }, []);

  const handleChangeNote = useCallback(text => {
    setNote(text);
  }, []);

  const handleClearNote = useCallback(() => {
    setNote('');
  }, []);

  const updateSummaryAfterRegister = useCallback(overTime => {
    setLocalSummary(summary => {
      if (!Array.isArray(summary) || summary.length === 0) return summary;

      return summary.map((item, index) => {
        if (index !== 0) return item;
        const currentTotal = parseFloat(item.totalOT || 0);
        return {
          ...item,
          totalOT: Number.isNaN(currentTotal)
            ? overTime
            : currentTotal + overTime,
        };
      });
    });
  }, []);

  const validateForm = useCallback(() => {
    const noteText = note?.trim() || '';

    if (Object.keys(itemSelect).length === 0) {
      toastError('Lý do', 'Bạn chưa chọn thời gian tăng ca!', 'top');
      return false;
    }

    if (noteText.length === 0) {
      toastError('Lý do', 'Bạn chưa nhập lý do!');
      return false;
    }

    if (noteText.length < NOTE_MIN_LENGTH) {
      toastError('Lý do', 'Lý do tối thiểu 10 kí tự!');
      return false;
    }

    const confirmMonth = localSummary?.[0];
    if (confirmMonth != undefined) {
      const sumOT = parseFloat(confirmMonth.totalOT || 0) + selectedTime;
      if (sumOT >= confirmMonth.limitOT) {
        toastError(
          'Tăng ca',
          `Giờ tăng ca của bạn đã ${confirmMonth.limitOT} giờ hoặc hơn`,
        );
        return false;
      }
    }

    return true;
  }, [itemSelect, localSummary, note, selectedTime]);

  const confirmOT = useCallback(async () => {
    if (submitting || registeredTime !== null || !validateForm()) return;

    const noteText = note.trim();

    setSubmitting(true);
    await uploadTimeOT(
      shopinfo.shopId,
      shopinfo.auditDate,
      selectedTime,
      noteText,
      async responseJson => {
        let result = false;
        if (responseJson.status === 200) {
          result = await UpdateTimeOT(
            selectedTime,
            noteText,
            shopinfo.shopId,
            shopinfo.auditDate,
            '0',
          );
        }

        if (result) {
          setRegisteredTime(selectedTime);
          updateSummaryAfterRegister(selectedTime);
          ToastSuccess(responseJson.messeger);
          onRegistered &&
            onRegistered({ timeOT: selectedTime, note: noteText });
        } else {
          toastError('Lỗi', 'Lỗi khi gửi dữ liệu!');
        }
      },
    );
    setSubmitting(false);
  }, [
    note,
    onRegistered,
    registeredTime,
    selectedTime,
    shopinfo,
    submitting,
    updateSummaryAfterRegister,
    validateForm,
  ]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <OTStatusCard
          appcolor={appcolor}
          isRegistered={isRegistered}
          registeredTime={registeredTime}
          totalMonth={totalMonth}
        />

        <OTSummarySection
          appcolor={appcolor}
          items={summaryItems}
          monthLimit={monthLimit}
        />

        {!isRegistered && (
          <>
            <OTTimeSelector
              appcolor={appcolor}
              data={timeOptions}
              disabled={submitting}
              onSelect={handleSelectTime}
              selectedItem={itemSelect}
              selectedTime={selectedTime}
            />

            <OTNoteInput
              appcolor={appcolor}
              note={note}
              onChangeNote={handleChangeNote}
              onClearNote={handleClearNote}
              submitting={submitting}
            />
          </>
        )}
      </View>

      <OTActionRow
        appcolor={appcolor}
        isRegistered={isRegistered}
        onClose={onClose}
        onSubmit={confirmOT}
        submitting={submitting}
      />
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      alignSelf: 'stretch',
      backgroundColor: appcolor.light,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
    },
  });

export default OTRegisterForm;
