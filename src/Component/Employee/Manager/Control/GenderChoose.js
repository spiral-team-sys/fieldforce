import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckBox, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';

export const GenderChoose = ({ keyItem, title, value, onChoose }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const handlerCheckMale = () => {
    onChoose(2);
  };
  const handlerCheckFemale = () => {
    onChoose(1);
  };
  const styles = StyleSheet.create({
    mainItem: { flex: 1, padding: 8, paddingBottom: 0 },
    title: {
      color: appcolor.dark,
      fontSize: 13,
      padding: 5,
      fontWeight: '700',
    },
    checkboxContainer: {
      padding: 0,
      borderWidth: 0,
      backgroundColor: appcolor.transparent,
    },
  });
  return (
    <View key={keyItem} style={styles.mainItem}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ flexDirection: 'row' }}>
        <CheckBox
          title="Nam"
          containerStyle={styles.checkboxContainer}
          textStyle={{ fontWeight: '500', color: appcolor.dark }}
          checkedColor={appcolor.primary}
          checked={value == 2}
          onPress={handlerCheckMale}
        />
        <CheckBox
          title="Nữ"
          containerStyle={styles.checkboxContainer}
          checkedColor={appcolor.primary}
          textStyle={{ fontWeight: '500', color: appcolor.dark }}
          checked={value == 1}
          onPress={handlerCheckFemale}
        />
      </View>
    </View>
  );
};
