import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CheckBox } from '@rneui/themed';
// //import { ACTION } from "../../../../../Core/ReduxController";
import { SET_EmployeeInfo } from "../../../../../Redux/action";

export const ItemChoose = ({ itemMain, keyValue }) => {
    const { appcolor, employeeInfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [defaultValue, setDefaultValue] = useState('')
    const dispatch = useDispatch()

    const LoadData = async () => {
        const _listCheck = JSON.parse(itemMain.FilterList || '[]')
        await setData(_listCheck)
        await setDefaultValue(employeeInfo[keyValue] || '')
    }

    const onChangeValue = async (item) => {
        employeeInfo[keyValue] = item.itemName
        setDefaultValue(item.itemName)
        await dispatch(SET_EmployeeInfo(employeeInfo))
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', marginVertical: 5 },
        contentValue: { width: '100%', borderRadius: 8, padding: 3, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.grayLight, flexDirection: 'row' },
        titleValueView: { fontSize: 14, fontWeight: '500', color: appcolor.dark },
        checkboxContainer: { padding: 0, borderWidth: 0, backgroundColor: appcolor.transparent },
    })
    const renderItem = (item, index) => {
        const onChecked = () => {
            onChangeValue(item)
        }
        return (
            <View key={`itcb_${index}`}>
                <CheckBox
                    title={item.itemName}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.titleValueView}
                    checkedColor={appcolor.blacklight}
                    checked={defaultValue == item.itemName}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    size={20}
                    onPress={onChecked}
                />
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentValue}>
                {data !== null && data.length > 0 &&
                    data.map((item, index) => {
                        return renderItem(item, index)
                    })
                }
            </View>
        </View>
    )
}