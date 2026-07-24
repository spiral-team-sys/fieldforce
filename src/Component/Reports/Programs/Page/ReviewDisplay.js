import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import FormGroup from '../../../../Content/FormGroup';

const ReviewDisplay = ({ data, onChangeData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [passed, setPassed] = useState(data?.inputPassed ?? null);
  const [note, setNote] = useState(data?.inputNote || '');

  useEffect(() => {
    if (data?.inputPassed !== undefined && data?.inputPassed !== null) {
      setPassed(data.inputPassed);
    }
    if (data?.inputNote !== undefined && data?.inputNote !== null) {
      setNote(data.inputNote);
    }
  }, [data?.inputPassed, data?.inputNote]);

  const styles = StyleSheet.create({
    contentContainer: { backgroundColor: appcolor.light },
    sectionTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      fontStyle: 'italic',
      marginTop: 8,
    },
    noteInput: {
      fontSize: 13,
      color: appcolor.dark,
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });

  const onChangePassed = index => {
    const updatedData = { ...data, inputPassed: index == 1 ? 1 : 0 };
    setPassed(index == 1 ? 1 : 0);
    onChangeData(updatedData);
  };
  const onChangeNote = text => {
    const updatedData = { ...data, inputNote: text };
    setNote(text);
    onChangeData(updatedData);
  };

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Đánh giá trưng bày</Text>
      <ButtonGroup
        buttons={['Không đạt', 'Đạt']}
        selectedIndex={passed == null ? undefined : passed ? 1 : 0}
        selectedButtonStyle={{
          backgroundColor: passed == 1 ? appcolor.primary : appcolor.danger,
        }}
        containerStyle={{
          height: 38,
          marginTop: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
        }}
        textStyle={{
          fontSize: 12,
          color: appcolor.dark,
          fontWeight: fontWeightBold,
        }}
        onPress={onChangePassed}
      />
      <FormGroup
        multiline
        editable={true}
        nonBorder
        noneRadius
        title="Ghi chú đánh giá"
        placeholder="Nhập ghi chú đánh giá"
        placeholderColor={appcolor.placeholderText}
        value={`${note || ''}`}
        handleChangeForm={onChangeNote}
        inputStyle={styles.noteInput}
        titleStyle={styles.sectionTitle}
        useClearAndroid={false}
      />
    </View>
  );
};

export default ReviewDisplay;
