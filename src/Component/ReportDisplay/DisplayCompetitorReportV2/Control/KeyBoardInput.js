import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { deviceHeight, deviceWidth } from '../../../Home';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';

export const KeyboardInput = ({ onSelectNum, disableKeyboard }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const data = useMemo(
    () => ['1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '0', '_'],
    [],
  );

  const handlePress = useCallback(
    number => {
      onSelectNum(number);
    },
    [disableKeyboard],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableWithoutFeedback
        onPress={() =>
          disableKeyboard || item == ' ' ? null : handlePress(item)
        }
      >
        <View
          style={
            item === '0'
              ? [
                  styles.button,
                  styles.zeroButton,
                  { backgroundColor: '#DDDDDD' },
                ]
              : [
                  styles.button,
                  {
                    backgroundColor:
                      item == ' ' || item == '_'
                        ? appcolor.transparent
                        : '#DDDDDD',
                  },
                ]
          }
        >
          {item == '_' ? (
            <SpiralIcon
              name={'backspace'}
              type={'font-awesome-5'}
              size={24}
              color={appcolor.primary}
            />
          ) : (
            <Text style={styles.buttonText}>{item}</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    ),
    [handlePress],
  );

  const styles = StyleSheet.create({
    container: {
      width: deviceWidth,
      height: deviceWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flatListContent: { alignItems: 'center' },
    button: {
      margin: 10,
      borderRadius: 10,
      width: 80,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disableKeyboard ? 0.5 : 1,
    },
    zeroButton: { marginBottom: 50 },
    buttonText: { fontSize: 28, color: '#333', fontFamily: 'Arial' },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item}
        numColumns={3} // Hiển thị 3 cột
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};
