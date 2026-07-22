import { Text } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";
import DateChoose from "../Controls/DateChoose";
import { toastError } from "../../../../../Utils/configToast";

const ItemTime = ({ dataRegister, title }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)

    const onChooseDate = (date, keyValue) => {
        if (keyValue == 'ToDate') {
            const isValid = validDate(date)
            if (!isValid) {
                dataRegister[keyValue] = null
                setMutate(e => !e)
                return
            }
        }
        dataRegister[keyValue] = date
        setMutate(e => !e)
        DeviceEventEmitter.emit('UPDATE_ITEM_PROGRAM', dataRegister)
    }

    const validDate = (date) => {
        if (date < dataRegister.FromDate) {
            toastError('Lỗi chọn ngày', 'Vui lòng chọn ngày kết thúc lớn hơn hoặc bằng ngày bắt đầu')
            return false
        }
        return true
    }

    useEffect(() => {

    }, [dataRegister])

    const styles = StyleSheet.create({
        viewItemTime: {},
        titleHead: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, fontStyle: 'italic' },
        contentTime: { flexDirection: 'row', alignItems: 'center', },
        titleAction: { fontSize: 12, color: appcolor.dark },
        requireText: { fontSize: 12, color: appcolor.red },
        dateContainer: { flex: 1 }
    })

    console.log(dataRegister.FromDate, dataRegister.ToDate);


    return (
        <View style={styles.viewItemTime}>
            {title && <Text style={styles.titleHead}>{title} <Text style={styles.requireText}>*</Text></Text>}
            <View style={styles.contentTime}>
                <DateChoose
                    title='Từ ngày'
                    keyValue='FromDate'
                    value={dataRegister.FromDate}
                    containerStyle={styles.dateContainer}
                    onChooseDate={onChooseDate}
                />
                <DateChoose
                    title='Đến ngày'
                    keyValue='ToDate'
                    value={dataRegister.ToDate}
                    containerStyle={styles.dateContainer}
                    onChooseDate={onChooseDate}
                />
            </View>
        </View>
    )
}

export default ItemTime;