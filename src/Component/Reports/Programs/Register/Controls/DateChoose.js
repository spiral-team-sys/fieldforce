import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
//import DatePicker from "react-native-date-picker";
import { Text } from "@rneui/base";
import moment from "moment";

const DateChoose = ({ title, value, keyValue, onChooseDate, containerStyle }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isOpen, setOpen] = useState(false);
    const [dateValue, setDateValue] = useState(new Date());

    const handlerChange = () => {
        setOpen(true);
    }

    const handlerChooseDate = (date) => {
        setDateValue(date);
        const value = moment(date).format('YYYY-MM-DD')
        onChooseDate && onChooseDate(value, keyValue)
        setOpen(false)
    }

    const handlerCancel = () => {
        setOpen(false)
    }

    useEffect(() => {
        console.log(value);

    }, [])

    const styles = StyleSheet.create({
        mainContainer: { borderRadius: 8, borderColor: value ? appcolor.grayLight : appcolor.red, borderWidth: 0.5, backgroundColor: appcolor.light, padding: 10, margin: 8 },
        titleView: { textAlign: 'center', fontSize: 12, color: value ? appcolor.dark : appcolor.placeholderText }
    });

    return (
        <View style={containerStyle}>
            <TouchableOpacity onPress={handlerChange} style={styles.mainContainer}>
                <Text style={styles.titleView}>{value || title}</Text>
            </TouchableOpacity>
            <DatePicker
                modal
                theme="dark"
                mode="date"
                open={isOpen}
                date={dateValue}
                onConfirm={handlerChooseDate}
                onCancel={handlerCancel}
            />
        </View>
    );
}

export default DateChoose;