import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import AttendanceList from "../../../../Content/Attendance/AttendanceList";
import KPIList from "../../../../Content/Menu/KPIList";

const WorkPage = ({ navigation }) => {
    const { appcolor, shopinfo } = useSelector(state => state.GAppState)

    useEffect(() => {
        return () => false
    }, [shopinfo])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentAttendance: { width: '100%', height: '28%' },
        contentKPI: { width: '100%', height: '72%' },
    })

    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentAttendance}>
                <AttendanceList navigation={navigation} />
            </View>
            <View style={styles.contentKPI}>
                <KPIList />
            </View>
        </View>
    )
}

export default WorkPage;