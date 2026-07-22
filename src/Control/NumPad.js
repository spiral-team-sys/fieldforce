import React, { useState } from "react"
import { Keyboard, Platform, TextInput, TouchableOpacity, View } from "react-native"
import { Icon } from '@rneui/themed'
import { useSelector } from "react-redux"
import { scaleSize } from "../Themes/AppsStyle"

export const NumPad = React.forwardRef((props, refNumPad) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { item, key, value, index, totalRow, placeholderText, handerNumberChange, upload, editable, containerStyle } = props
    const [refInput, _unSet] = useState({})
    const downAction = () => {
        const e = !isNaN(value) && value > 0 ? parseInt(value) - 1 : null
        handerNumberChange !== undefined && handerNumberChange(item, e)
    }
    const upAction = () => {
        const e = value === null || isNaN(value) ? 1 : parseInt(value) + 1
        // console.log(item, e)
        handerNumberChange !== undefined && handerNumberChange(item, e)
    }
    const onNumInput = (item, i) => {
        const e = isNaN(parseInt(i)) ? null : parseInt(i)
        handerNumberChange !== undefined && handerNumberChange(item, e)
    }
    return (
        <View style={{ ...containerStyle, flexDirection: 'row', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 0.3, }}>
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={downAction} disabled={upload} style={{ padding: 7 }}>
                    <Icon color={appcolor.dark} name="minus" type="font-awesome-5" />
                </TouchableOpacity>
            </View>
            <View style={{ flexGrow: 1, minWidth: 50, alignItems: 'center', }}>
                <TextInput keyboardType="number-pad"
                    onChangeText={(e) => onNumInput(item, e)}
                    autoCapitalize="none"
                    ref={(e) => refInput[index] = e}
                    selectTextOnFocus
                    placeholder={placeholderText}
                    placeholderTextColor={appcolor.placeholderText}
                    editable={editable != undefined ? editable : !upload}
                    key={key}
                    maxlength={8}
                    defaultValue={value === null || isNaN(value) ? '' : value.toLocaleString("en-US")}
                    blurOnSubmit={false}
                    autoCorrect={false}
                    onSubmitEditing={() => { (totalRow - 1) === index ? Keyboard.dismiss() : refInput[index + 1]?.focus() }}
                    returnKeyType={Platform.OS === 'android' ? "next" : 'done'}
                    style={{
                        backgroundColor: upload ? appcolor.lightgray : appcolor.light,
                        padding: 7, width: '100%',
                        fontSize: scaleSize(14), color: appcolor.dark, textAlign: 'right'
                    }} />
            </View>
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={upAction} disabled={upload}
                    style={{ padding: 7 }}>
                    <Icon name="plus" color={appcolor.dark} type="font-awesome-5" />
                </TouchableOpacity>
            </View>
        </View>
    )
})