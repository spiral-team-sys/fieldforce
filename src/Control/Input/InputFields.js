import React, {
  forwardRef,
  memo,
  useRef,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { Input } from '@rneui/themed';
import { useSelector } from 'react-redux';

const InputFields = forwardRef(
  ({ label, placeholder, errorMessage, ...props }, ref) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const {
      keyboardType,
      value,
      iconLeft,
      iconRight,
      onRightPress,
      onLeftPress,
      index = 0,
      isScrollToIndex = false,
      visible = true,
      onChangeText,
    } = props;
    const [isInput, setInput] = useState(false);
    const inputRef = useRef(null);
    const valueRef = useRef('');
    //
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        inputRef.current?.clear();
        valueRef.current = '';
      },
      getValue: () => valueRef.current,
    }));
    // Handler
    const handlerFocus = () => {
      isScrollToIndex && DeviceEventEmitter.emit('SCROLL_TO_INDEX', index);
      setInput(true);
    };
    const handlerEndEdit = () => {
      setInput(false);
    };
    const handleChangeText = useCallback(
      text => {
        valueRef.current = text;
        if (onChangeText) onChangeText(text);
      },
      [props],
    );
    // View
    const styles = StyleSheet.create({
      container: { flex: 1, marginVertical: 4 },
      inputMain: { marginBottom: 0, paddingBottom: 0 },
      inputContainer: {
        paddingHorizontal: 0,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: isInput ? appcolor.light : appcolor.surface,
        borderWidth: 0.6,
        borderColor: isInput ? appcolor.primary : appcolor.surface,
      },
      inputBorder: { borderBottomWidth: 0 },
      inputText: {
        fontSize: 12,
        color: appcolor.dark,
        fontWeight: '500',
        padding: 8,
        paddingTop: 0,
        paddingStart: 4,
      },
      errorStyle: { height: 0, padding: 0, margin: 0 },
      leftIconContainer: {
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      },
      rightIconContainer: {
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginEnd: 8,
      },
    });
    if (!visible) return null;
    return (
      <View style={styles.container}>
        <Input
          {...props}
          ref={inputRef}
          placeholder={placeholder}
          errorMessage={errorMessage}
          value={`${value || ''}`}
          // settings
          keyboardType={keyboardType || 'default'}
          // styles
          style={styles.inputMain}
          errorStyle={styles.errorStyle}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBorder}
          inputStyle={styles.inputText}
          // icon
          leftIcon={
            iconLeft && {
              type: 'ionicon',
              name: iconLeft,
              color: appcolor.dark,
              size: 18,
              containerStyle: { marginStart: 8 },
              onPress: onLeftPress,
            }
          }
          leftIconContainerStyle={styles.leftIconContainer}
          rightIcon={
            iconRight && {
              type: 'ionicon',
              name: iconRight,
              color: appcolor.dark,
              size: 18,
              containerStyle: { marginStart: 8 },
              onPress: onRightPress,
            }
          }
          rightIconContainerStyle={styles.rightIconContainer}
          // events
          onFocus={handlerFocus}
          onEndEditing={handlerEndEdit}
          onChangeText={handleChangeText}
        />
      </View>
    );
  },
);

export default memo(InputFields);
