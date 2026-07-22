import React, { useEffect, useState } from "react"
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { Button, Text } from "@rneui/base";
import { useSelector } from "react-redux";
import FormGroup from "../../../../../Content/FormGroup";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";

const ItemInput = ({ dataRegister = {}, keyValue, title, keyboardType = 'default', isSeachData = false, onSearch, titleSearch, isChecking = false, editable = true }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)

    const onChangeValue = async (text, keyValue) => {
        dataRegister[keyValue] = text
        setMutate(e => !e)
        DeviceEventEmitter.emit('UPDATE_ITEM_PROGRAM', dataRegister)
    }

    const onSearchData = () => {
        onSearch(dataRegister[keyValue])
    }

    useEffect(() => {

    }, [])

    const styles = StyleSheet.create({
        titleHead: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, fontStyle: 'italic' },
        viewField: { flexDirection: 'row', alignItems: 'center' },
        inputContainer: { flex: 1, padding: 2, borderRadius: 8, borderColor: dataRegister[keyValue] ? appcolor.grayLight : appcolor.red, borderWidth: 0.5, margin: 8 },
        inputStyle: { fontSize: 12, color: appcolor.dark },
        requireText: { fontSize: 12, color: appcolor.red },
        buttonUpload: { minWidth: 80, height: 35, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.primary, paddingHorizontal: 16, marginEnd: 8 },
        titleButtonUpload: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.primary },
    })

    return (
        <View>
            {title && <Text style={styles.titleHead}>{title} {<Text style={styles.requireText}>*</Text>}</Text>}
            <View style={styles.viewField}>
                <FormGroup
                    editable={editable}
                    multiline
                    useClearAndroid={false}
                    keyboardType={keyboardType}
                    placeholder={`Nhập ${title?.toLowerCase() || ''}`}
                    value={`${dataRegister[keyValue] || ''}`}
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.inputStyle}
                    handleChangeForm={(text) => onChangeValue(text, keyValue)}
                />
                {isSeachData &&
                    <Button
                        loading={isChecking}
                        loadingProps={{ color: appcolor.primary }}
                        loadingStyle={{ marginBottom: 0 }}
                        type="outline"
                        title={titleSearch || 'Tìm kiếm'}
                        buttonStyle={styles.buttonUpload}
                        titleStyle={styles.titleButtonUpload}
                        onPress={onSearchData}
                    />
                }
            </View>
        </View>
    )
}

export default ItemInput;