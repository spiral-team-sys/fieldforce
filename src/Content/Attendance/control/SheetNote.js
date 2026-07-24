import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import FormGroup from '../../FormGroup';
import ButtonConfirm from './ButtonConfirm';
import { getMasterlist } from '../../../Controller/MasterController';
import { Text } from '@rneui/base';
import { deviceWidth, fontWeightBold } from '../../../Themes/AppsStyle';
import { isValidField } from '../../../Utils/validateData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SheetNote = ({ onAccept }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  const [itemNote, setItemNote] = useState({});
  const [noteText, setNoteText] = useState('');
  const [selectedReason, setSelectedReason] = useState({});
  const [dataReason, setDataReason] = useState([]);
  //
  const LoadData = async () => {
    if (isValidField(itemNote.type)) {
      await getMasterlist(itemNote.type, setDataReason);
    }
  };
  // Handler
  const handlerAccept = () => {
    const note = [selectedReason.name, noteText]
      .map(value => value?.trim())
      .filter(Boolean)
      .join(' - ');

    onAccept({
      ...itemNote,
      note,
      reasonId: selectedReason.id || itemNote.reasonId || 0,
    });
  };
  const handlerCancel = () => {
    SheetManager.hide('note-attendance-sheet');
  };
  // Action
  const onShowSheet = data => {
    const noteData = data?.payload || data || {};
    setItemNote(noteData);
    setNoteText(noteData.note || '');
    setSelectedReason({});
  };
  const onChangeNote = text => {
    setNoteText(text);
  };
  const onChooseReason = item => {
    setSelectedReason(item || {});
  };
  const onClearNote = () => {
    setNoteText('');
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [itemNote.type]);

  const styles = StyleSheet.create({
    actionSheetContainer: {
      backgroundColor: appcolor.light,
      paddingBottom: insets.bottom,
    },
    sheetContainer: {
      width: '100%',
      height: 'auto',
      padding: 8,
      paddingBottom: 32,
      backgroundColor: appcolor.light,
    },
    contentReason: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    itemMainReason: {
      width: deviceWidth / 3.5,
      minHeight: 80,
      padding: 8,
      borderWidth: 0.5,
      borderColor: appcolor.surface,
      borderRadius: 8,
      marginTop: 8,
      marginEnd: 8,
      justifyContent: 'center',
    },
    titleReason: {
      fontSize: 13,
      fontWeight: '400',
      color: appcolor.greylight,
      textAlign: 'center',
    },
    titleReasonChoose: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textAlign: 'center',
    },
  });
  const renderItemReason = (item, index) => {
    const onPress = () => {
      onChooseReason(item);
    };
    return (
      <TouchableOpacity
        key={index}
        style={styles.itemMainReason}
        onPress={onPress}
      >
        <Text
          style={
            selectedReason.id == item.id
              ? styles.titleReasonChoose
              : styles.titleReason
          }
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <ActionSheet
      id="note-attendance-sheet"
      onBeforeShow={onShowSheet}
      closeOnTouchBackdrop={false}
      containerStyle={styles.actionSheetContainer}
    >
      <View style={styles.sheetContainer}>
        <FormGroup
          editable={
            itemNote.type == 'NOTE' ||
            itemNote.type == 'NoteReport' ||
            itemNote.reasonId == 0 ||
            itemNote.reasonId == 100
          }
          multiline
          title={itemNote.titleAlert}
          placeholder="Nhập lý do"
          value={noteText}
          inputStyle={{ minHeight: 56 }}
          handleChangeForm={onChangeNote}
          onClearTextAndroid={onClearNote}
        />
        <View style={styles.contentReason}>
          {dataReason.map(renderItemReason)}
        </View>
        <ButtonConfirm onAccept={handlerAccept} onCannel={handlerCancel} />
      </View>
    </ActionSheet>
  );
};
export default SheetNote;
