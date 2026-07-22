import { Text } from "@rneui/base";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
//import DatePicker from "react-native-date-picker";
import { useSelector } from "react-redux";

const ItemDateTime = ({ item, onUpdateItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isOpen, setOpen] = useState(false)
    const [dateValue, setDateValue] = useState(new Date())

    const inputType = `${item?.ItemType || 'text'}`.toLowerCase()

    const modeConfig = useMemo(() => {
        switch (inputType) {
            case 'time':
                return {
                    mode: 'time',
                    displayFormat: 'HH:mm',
                    saveFormat: 'HH:mm'
                }
            case 'datetime':
                return {
                    mode: 'datetime',
                    displayFormat: 'DD/MM/YYYY HH:mm',
                    saveFormat: 'YYYY-MM-DD HH:mm:ss'
                }
            case 'date':
            default:
                return {
                    mode: 'date',
                    displayFormat: 'DD/MM/YYYY',
                    saveFormat: 'YYYY-MM-DD'
                }
        }
    }, [inputType])

    const getInitialDate = () => {
        const value = `${item?.Value || ''}`
        if (!value) return new Date()

        if (inputType === 'time') {
            const parsedTime = moment(value, ['HH:mm:ss', 'HH:mm'], true)
            if (parsedTime.isValid()) {
                const now = new Date()
                now.setHours(parsedTime.hours(), parsedTime.minutes(), 0, 0)
                return now
            }
        }

        const parsedDate = moment(value, [
            'YYYY-MM-DD',
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD HH:mm',
            'DD/MM/YYYY',
            'DD/MM/YYYY HH:mm',
            moment.ISO_8601
        ], true)
        return parsedDate.isValid() ? parsedDate.toDate() : new Date()
    }

    const getDisplayValue = () => {
        const value = `${item?.Value || ''}`
        if (!value) return item?.DescriptionName || `Chọn ${item?.ItemName || 'thời gian'}`
        const parsed = getInitialDate()
        return moment(parsed).format(modeConfig.displayFormat)
    }

    const onOpenPicker = () => {
        setOpen(true)
    }

    const onCancel = () => {
        setOpen(false)
    }

    const onConfirm = (date) => {
        setDateValue(date)
        const value = moment(date).format(modeConfig.saveFormat)
        item.Value = value
        onUpdateItem && onUpdateItem(item)
        setOpen(false)
    }

    useEffect(() => {
        setDateValue(getInitialDate())
    }, [item])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        inputContainer: { paddingVertical: 14, paddingHorizontal: 10, borderRadius: 8, borderColor: item?.Value ? appcolor.grayLight : appcolor.red, borderWidth: 0.5, marginTop: 8 },
        titleValue: { fontSize: 12, color: item?.Value ? appcolor.dark : appcolor.placeholderText }
    })

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity onPress={onOpenPicker} style={styles.inputContainer}>
                <Text style={styles.titleValue}>{getDisplayValue()}</Text>
            </TouchableOpacity>

            <DatePicker
                modal
                mode={modeConfig.mode}
                open={isOpen}
                date={dateValue}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        </View>
    )
}

export default ItemDateTime;