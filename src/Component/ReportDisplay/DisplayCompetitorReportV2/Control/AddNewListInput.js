import React, { forwardRef, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
// import NumberFormat from "react-number-format";
import { KeyboardInput } from "./KeyBoardInput";
import { ToastError } from "../../../../Core/Helper";

export const AddNewListInput = forwardRef((props, ref) => {
    const { listInput, handlePrev, saveProduct, productItem } = props
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)
    const [inputSelect, setInputSelect] = useState({ itemSelect: {}, indexSelect: null })
    //
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', padding: 8, backgroundColor: appcolor.light, zIndex: 10000 },
        inputContainer: { width: '100%', padding: 3, backgroundColor: appcolor.dark },
        inputStyle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light },
        inputHeader: { fontSize: 16, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: "center" },
    })

    const handlerSelectInput = (itemInput, indexInput) => {
        inputSelect.itemSelect = itemInput
        inputSelect.indexInput = indexInput
        setMutate(e => !e)
    }
    const handlerSelectNum = (number) => {
        const itemName = inputSelect.itemSelect?.displayType
        let isError = 0

        if (itemName !== undefined && itemName !== null) {
            let currentStr = productItem[itemName] ? JSON.stringify(productItem[itemName]) : null
            let newStr = null
            if (number == '_') {
                newStr = currentStr ? (currentStr?.slice(0, -1) || '') : '';
                productItem[itemName] = (newStr == '' ? null : parseInt(newStr))
            } else {
                newStr = ((currentStr || '') + number);
                if (newStr < ((inputSelect.itemSelect?.min && inputSelect.itemSelect?.min !== '') ? inputSelect.itemSelect?.min : 0)) {
                    ToastError(`Nhập ${inputSelect.itemSelect?.name} không được nhỏ hơn ${inputSelect.itemSelect?.min || 0}!`, "Lỗi", "top");
                }
                else if (newStr > ((inputSelect.itemSelect?.max && inputSelect.itemSelect?.max !== '') ? inputSelect.itemSelect?.max : 1000000000)) {
                    isError = 1;
                    ToastError(`Nhập ${inputSelect.itemSelect?.name} không được lớn hơn ${inputSelect.itemSelect?.max || 1000000000}!`, "Lỗi", "top");
                } else {
                    isError = 0
                }
                isError == 0 && (productItem[itemName] = parseInt(newStr))
            }
        }
        setMutate(e => !e)
    }

    const RenderItemInput = ({ itemInput, indexInput, }) => {
        return (
            <View style={{ flexDirection: 'column', width: deviceWidth / 2.2, justifyContent: "center", alignItems: "center", }}>
                <Text style={styles.inputHeader}>{`${itemInput.name} `}</Text>
                <TouchableOpacity
                    onPress={() => handlerSelectInput(itemInput, indexInput)}
                    style={{ width: '100%', justifyContent: "center", alignItems: 'center' }} >
                    <NumberFormat
                        value={productItem[itemInput.displayType] === 0 ? 0 : (productItem[itemInput.displayType] || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <View style={{
                                backgroundColor: inputSelect.itemSelect?.id == itemInput.id ? appcolor.primary : appcolor.surface,
                                width: 40, height: 30, borderRadius: 8, justifyContent: 'center', width: '80%', marginTop: 4
                            }}>
                                <Text style={{
                                    color: inputSelect.itemSelect?.id == itemInput.id ? appcolor.white
                                        : ((value == 0 || value.length > 0) && value !== null && value !== 'null' && value !== undefined && value !== '' ? appcolor.dark : appcolor.greydark),
                                    textAlign: "center", fontWeight: '600'
                                }}>
                                    {(value == 0 || value.length > 0) && value !== null && value !== 'null' && value !== undefined && value !== '' ? value : (itemInput.placeholder || 'Số lượng')}
                                </Text>
                            </View>
                            // <TextInput
                            //     textAlign={'center'}
                            //     value={value}
                            //     style={{
                            //         color: inputSelect.itemSelect?.id == itemInput.id ? appcolor.white : appcolor.dark,
                            //         width: 40, height: 30, backgroundColor: inputSelect.itemSelect?.id == itemInput.id ? appcolor.primary : appcolor.surface,
                            //         borderRadius: 8, justifyContent: 'center', textAlign: "center", width: '80%', marginTop: 4
                            //     }}
                            //     keyboardType='numeric'
                            //     editable={false}
                            //     placeholder={itemInput.placeholder}
                            //     placeholderTextColor={appcolor.greydark}
                            // // onChangeText={changeValue}
                            // // onEndEditing={endInput}
                            // />
                        }
                    />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ width: '100%', height: '100%' }}>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 20, height: 150, justifyContent: 'center', alignItems: 'center' }}>
                {
                    listInput.map((it, idx) => {
                        return (
                            <RenderItemInput key={`${it.id}`} itemInput={it} indexInput={idx} />
                        )
                    })
                }
                <View style={{ width: '100%', flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', borderRadius: 50, backgroundColor: appcolor.primary, borderColor: appcolor.greydark, borderWidth: 0.2, flex: 1, padding: 8, justifyContent: 'center', alignItems: "center", margin: 5 }}
                        onPress={handlePrev}
                    >
                        <Text style={[{ width: '80%', textAlign: 'center' }, { color: appcolor.white }]} >Quay lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', borderRadius: 50, backgroundColor: appcolor.primary, borderColor: appcolor.greydark, borderWidth: 0.2, flex: 1, padding: 8, justifyContent: 'center', alignItems: "center", margin: 5 }}
                        onPress={saveProduct}
                    >
                        <Text style={[{ width: '80%', textAlign: 'center' }, { color: appcolor.white }]} >Lưu</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <KeyboardInput onSelectNum={(number) => handlerSelectNum(number)} disableKeyboard={inputSelect.itemSelect?.id == undefined && inputSelect.itemSelect?.id == null} />
        </View>
    )
})
