import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
//import DatePicker from "react-native-date-picker";
import { Icon, Text } from "@rneui/themed";
import moment from "moment";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

const TimeChoose = ({ visible = true, dateValue, title, stepTime, keyValue, onChooseTime }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isOpen, setOpen] = useState(false);
    const [timeValue, setTimeValue] = useState(dateValue ? new Date(dateValue) : moment().startOf("day").toDate());

    const handlerChange = () => {
        setOpen(true);
    }
    const handlerChooseTime = (time) => {
        const roundedMoment = moment(time);
        const minutes = roundedMoment.minutes();
        const remainder = minutes % stepTime;

        if (remainder !== 0)
            roundedMoment.add(stepTime - remainder, 'minutes');
        roundedMoment.seconds(0);
        roundedMoment.milliseconds(0);
        const isAccepted = onChooseTime ? onChooseTime(keyValue, roundedMoment) !== false : true;
        setTimeValue(isAccepted ? roundedMoment.toDate() : (dateValue ? new Date(dateValue) : moment().startOf("day").toDate()))
        setOpen(false)
    }
    useEffect(() => {
        setTimeValue(dateValue ? new Date(dateValue) : moment().startOf("day").toDate());
        setOpen(false);
    }, [dateValue])

    const styles = StyleSheet.create({
        containerStyle: { flex: 1, marginHorizontal: 4 },
        mainContainer: {
            minHeight: 52,
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: appcolor.primary + "45",
            backgroundColor: appcolor.light,
            flexDirection: "row",
            alignItems: "center"
        },
        iconContainer: {
            width: 28,
            height: 28,
            borderRadius: 9,
            backgroundColor: appcolor.primary + "12",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 7
        },
        content: { flex: 1 },
        label: { fontSize: 10, fontWeight: fontWeightBold, color: appcolor.placeholderText },
        value: { fontSize: 14, lineHeight: 19, fontWeight: "700", color: appcolor.primary },
        datetimepicker: { backgroundColor: appcolor.light }
    });
    if (!visible) return <View />
    return (
        <View style={styles.containerStyle}>
            <TouchableOpacity activeOpacity={0.8} onPress={handlerChange} style={styles.mainContainer}>
                <View style={styles.iconContainer}>
                    <Icon name="clock" type="feather" size={15} color={appcolor.primary} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.label}>{title}</Text>
                    <Text style={styles.value}>{moment(timeValue).format("HH:mm")}</Text>
                </View>
            </TouchableOpacity>
            <DatePicker
                modal
                open={isOpen}
                mode="time"
                date={timeValue}
                locale="vi-VN"
                is24hourSource="locale"
                minuteInterval={stepTime}
                style={styles.datetimepicker}
                theme="light"
                buttonColor={appcolor.primary}
                onConfirm={handlerChooseTime}
                onCancel={() => setOpen(false)}
            />
        </View>
    );
}

export default TimeChoose;
