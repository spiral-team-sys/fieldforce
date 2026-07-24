import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const AnswerItem = React.memo(({ item, index, itemParent, onPress }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        textAnswer: { fontSize: 11, color: appcolor.dark, width: '80%' },
        containerAnswer: {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: appcolor.surface,
          padding: 12,
          marginBottom: 8,
        },
        iconAnswer: { marginRight: 8 },
      }),
    [appcolor],
  );
  return (
    <TouchableOpacity key={index} onPress={onPress}>
      <View
        style={[
          styles.containerAnswer,
          {
            borderColor:
              itemParent.answerKey === item.code
                ? appcolor.second
                : appcolor.surface,
            backgroundColor:
              itemParent.answerKey === item.code
                ? appcolor.primary + '10'
                : 'transparent',
          },
        ]}
      >
        <SpiralIcon
          name={
            itemParent.answerKey === item.code
              ? 'radio-button-checked'
              : 'radio-button-unchecked'
          }
          size={20}
          color={
            itemParent.answerKey === item.code ? appcolor.second : appcolor.dark
          }
          style={styles.iconAnswer}
        />
        <Text style={styles.textAnswer}>
          {item.codeDisplay}. {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
export default AnswerItem;
