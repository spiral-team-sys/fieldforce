import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { formatPhone } from "../../../Core/Helper";
import { Icon } from '@rneui/themed';

export const InputByCode = ({ itemInput, indexInput, typeInput, handleChangeInput, handleSelectItem, type, styles }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)
    const onChangeValue = (text) => {
        // handleChangeInput
        if (typeInput == 'phone') {
            if (text !== null) {
                let textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
                if (text?.length == 11)
                    textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
                (!itemInput.value || textValue == '' || textValue?.length < 11) && (itemInput.value = textValue)
            } else {
                itemInput.value = null
            }
        } else {
            itemInput.value = text
        }
        handleChangeInput(itemInput)
        setMutate(e => !e)
    }
    const onSelectItem = () => {
        handleSelectItem(itemInput)
    }

    switch (typeInput) {
        case 'select':
            const dataSelect = JSON.parse(itemInput.dataSelect || '[]')
            return (
                <View style={{ padding: 4 }}>
                    <Text style={styles.titlePlaceholder}>{itemInput.nameVN}</Text>
                    {/* <TouchableOpacity
                        style={{ padding: 10, margin: 8, borderRadius: 8, backgroundColor: appcolor.surface, borderWidth: 0.6, borderColor: appcolor.dark }}
                        onPress={() => onSelectItem()}
                    >
                        <Text style={{ fontWeight: '500', fontSize: 14, color: appcolor.dark }}>{'Chọn ' + itemInput.nameVN}</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity onPress={() => onSelectItem()} style={{
                        padding: 4, margin: 8, borderRadius: 8, backgroundColor: appcolor.surface,
                        marginBottom: 4, shadowColor: appcolor.black,
                        shadowOffset: { width: 0, height: 0.5 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                        shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                    }}>
                        <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                            <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, width: '80%' }}>{dataSelect?.length > 0 ? dataSelect?.map((it, idx) => { return (idx == 0 ? '' : '\n') + it.ProductName }) : ('Chọn ' + itemInput.nameVN)}</Text>
                            <Icon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                        </View>
                    </TouchableOpacity>
                </View>
            )
        case 'text':
            return (
                <View style={{ padding: 4 }}>
                    <Text style={styles.titlePlaceholder}>{itemInput.nameVN}</Text>
                    <FormGroup
                        editable={type == 'PLUS'}
                        useClearAndroid={false}
                        multiline
                        defaultValue={itemInput.value}
                        placeholder={'Nhập thông tin ' + itemInput.nameVN}
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputStyle}
                        handleChangeForm={onChangeValue}
                    />
                </View>
            )
        case 'phone':
            return (
                <View style={{ padding: 4 }}>
                    <Text style={styles.titlePlaceholder}>{itemInput.nameVN}</Text>
                    <FormGroup
                        editable={type == 'PLUS'}
                        useClearAndroid={false}
                        multiline
                        value={formatPhone(itemInput.value || '')}
                        placeholder={'Nhập thông tin ' + itemInput.nameVN}
                        keyboardType={'phone-pad'}
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputStyle}
                        handleChangeForm={onChangeValue}
                    />
                </View>
            )
        default: return <></>
    }
}

