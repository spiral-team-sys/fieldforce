import { Divider, Icon } from "@rneui/themed";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export const InfoBlock = ({ title, children, styles }) => {
    return (
        <View style={styles.infoBlock}>
            <Text style={styles.infoBlockTitle}>{title}</Text>
            <Divider style={{ marginVertical: 10 }} />
            {children}
        </View>
    );
}

export const InfoRow = ({ label, value, styles, onCopy, copyColor }) => {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            {onCopy ? (
                <View style={styles.infoValueRow}>
                    <Text style={styles.infoValue}>{value || "--"}</Text>
                    <TouchableOpacity
                        onPress={onCopy}
                        accessibilityRole="button"
                        accessibilityLabel={`Sao chép ${label}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Icon name="copy-outline" type="ionicon" size={18} color={copyColor} />
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.infoValue}>{value || "--"}</Text>
            )}
        </View>
    );
}

export const CountTime = ({ item }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const startTimeRef = useRef(null);
    const calculateTimeLeft = useCallback(() => {
        const newTime = new Date();
        const difference = moment(item.endTime, 'YYYY-MM-DD HH:mm:ss').diff(moment(newTime, 'YYYY-MM-DD HH:mm:ss'));

        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return timeLeft;
    }, [item.endTime]);

    const countDown = useCallback(() => {
        const timeLeft = calculateTimeLeft();
        setRemainingTime(timeLeft);
        if (
            timeLeft.days > 0 ||
            timeLeft.hours > 0 ||
            timeLeft.minutes > 0 ||
            timeLeft.seconds > 0
        ) {
            startTimeRef.current = requestAnimationFrame(countDown);
        }
    }, [calculateTimeLeft]);

    useEffect(() => {
        startTimeRef.current = requestAnimationFrame(countDown);
        return () => cancelAnimationFrame(startTimeRef.current);
    }, [countDown]);
    return (
        <Text style={{ color: appcolor.dark }}>{(remainingTime.days > 0) ? `${remainingTime.days} ngày ` : ''}{remainingTime.hours < 10 ? '0' : ''}{remainingTime.hours}:{remainingTime.minutes < 10 ? '0' : ''}{remainingTime.minutes}:{remainingTime.seconds < 10 ? '0' : ''}{remainingTime.seconds}{remainingTime.days == 0 && remainingTime.hours == 0 && remainingTime.minutes == 0 && remainingTime.seconds == 0 && item.confirm == 0 ? ' - Hết thời gian giải trình' : ''}</Text>
    );
}
