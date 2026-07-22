import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Text } from '@rneui/base'
import { useSelector } from 'react-redux';
import { useInputStyle } from '../Hooks/styles/useInputStyle';
import SpiralIcon from '../Control/Icon/SpiralIcon';

const FormGroup = ({ title, value, defaultValue, placeholder, placeholderColor, editable, iconStyle,
    iconFunc, isSecure, handleChangeForm, iconName, iconRight, iconColor, rightFunc, maxLength,
    noneRadius, nonBorder, multiline, containerStyle, inputStyle, iconRightStyle,
    keyboardType = "default", returnKeyType = "done",
    disabledRightFunc = false, inputRef, inputRefFull, index, onSubmitEditing, blurOnSubmit = true, isFocusable,
    onClearTextAndroid, useClearAndroid = true, onEndEditing, numberOfLines, selectTextOnFocus, textAlignVertical,
    titleWarning, isWarning = false, clearButtonMode = 'while-editing', titleStyle, iconSizeRight, iconColorRight, onFocus, iconType
}) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const stylesInput = useInputStyle()
    const styles = StyleSheet.create({
        container: {
            borderWidth: editable && !nonBorder ? 1 : 0, marginBottom: 8, borderColor: appcolor.surface,
            backgroundColor: editable ? appcolor.light : (nonBorder ? appcolor.light : appcolor.surface),
            borderRadius: !noneRadius ? 8 : 0
        },
        title: { color: appcolor.dark, fontSize: 13, padding: 5, fontWeight: "700" },
        inputContainer: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
        icon: { paddingLeft: 8, color: iconColor || appcolor.dark, paddingRight: 8 },
        warningContent: { marginBottom: 0, flexDirection: 'row', alignItems: 'center' },
        titleWarning: { fontSize: 11, color: appcolor.red, fontWeight: '400', fontStyle: 'italic' }
    })
    return (
        <View style={[styles.container, containerStyle]}>
            {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
            <View style={styles.inputContainer}>
                {iconName && (
                    <TouchableOpacity onPress={iconFunc}>
                        <SpiralIcon
                            name={iconName}
                            type={iconType || "font-awesome-5"}
                            color={iconColor || appcolor.dark}
                            style={[styles.icon, iconStyle]}
                            size={16}
                        />
                    </TouchableOpacity>
                )}
                <TextInput
                    ref={Array.isArray(inputRef) && index !== undefined ? inputRef[index] : inputRefFull}
                    autoCorrect={false}
                    autoComplete="off"
                    value={value}
                    editable={editable || false}
                    defaultValue={defaultValue || ""}
                    style={[stylesInput.input, inputStyle]}
                    maxLength={maxLength}
                    clearButtonMode={clearButtonMode || "while-editing"}
                    blurOnSubmit={blurOnSubmit}
                    selectTextOnFocus={selectTextOnFocus || false}
                    focusable={isFocusable || false}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    scrollEnabled={multiline}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    returnKeyType={returnKeyType}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor || appcolor.placeholderText}
                    onChangeText={handleChangeForm}
                    onSubmitEditing={onSubmitEditing}
                    onEndEditing={onEndEditing}
                    onFocus={onFocus}
                    textAlignVertical={textAlignVertical}
                />
                {iconRight &&
                    <TouchableOpacity style={{ padding: 5 }} onPress={rightFunc} disabled={disabledRightFunc}>
                        <SpiralIcon type={iconType || "font-awesome-5"} color={iconColorRight || appcolor.dark} style={[styles.icon, iconRightStyle]} name={iconRight} size={iconSizeRight || 18} />
                    </TouchableOpacity>
                }
                {Platform.OS == 'android' && useClearAndroid && editable &&
                    <TouchableOpacity onPress={() => onClearTextAndroid !== undefined && onClearTextAndroid('')}>
                        <SpiralIcon color={iconColor || appcolor.dark} style={{ padding: 7 }} name='close' solid size={15} />
                    </TouchableOpacity>
                }
            </View>
            {isWarning && titleWarning && titleWarning !== null && titleWarning.length > 0 &&
                <View style={styles.warningContent}>
                    <Text style={styles.titleWarning}>* {titleWarning || 'Nội dung cảnh báo'}</Text>
                </View>
            }
        </View>
    )
}
export default FormGroup;