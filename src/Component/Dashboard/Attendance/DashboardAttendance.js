import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { LGPLanbyWeekly } from "../../../Controller/DashboardController";
import { TODAY } from "../../../Core/Utility";
import { Icon, Text } from "@rneui/base";
import { deviceWidth } from "../../../Themes/AppsStyle";
import moment from "moment";
import CustomListView from "../../../Control/Custom/CustomListView";

const DashboardAttendance = ({ navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const refList = useRef(null)
    //
    const LoadData = async (pageNum, date) => {
        await setLoading(true);
        const jsonCalendar = await AsyncStorage.getItem('CALENDAR_DATA')
        const localData = await JSON.parse(jsonCalendar)
        const hour = parseInt(moment().format("H"))
        const filter = JSON.stringify({
            "pageNum": pageNum || 0,
            "planDate": date || moment().format("YYYY-MM-DD"),
        })
        const result = (jsonCalendar === null || hour !== 21) ? await LGPLanbyWeekly(filter) : localData
        if (result.statusId === 200) {
            let itemData = result?.data || [];
            if (itemData.length === 7) {
                await itemData.unshift({ "dayName": "arrow-left", "pageNum": -7, "date": itemData[0].date });
                await itemData.push({ "dayName": "arrow-right", "pageNum": 7, "date": itemData[7].date });
            }
            await setData(itemData)
            if (itemData.length > 5)
                await refList.current.scrollToIndex({ index: 4, animated: true, viewPosition: 0.5 });
            await AsyncStorage.setItem('CALENDAR_DATA', JSON.stringify(result))
        }
        await setLoading(false);
    }
    // Handler

    // Action

    //
    useEffect(() => {
        LoadData()
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, },
        itemArrowMain: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
        itemDayMain: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8, paddingEnd: 0 },
        buttonArrow: { width: 50, height: 50, padding: 8, borderRadius: 50, backgroundColor: appcolor.light, alignContent: 'center', alignSelf: 'center', justifyContent: 'center' },
        itemContentDay: { shadowOpacity: 0.8, width: deviceWidth / 7, flex: 1, shadowOffset: { width: 0.4, height: 4 }, paddingTop: 8, borderRadius: 8, elevation: 5, justifyContent: 'flex-start', alignItems: 'center' },
        dayView: { width: 30, height: 30, backgroundColor: appcolor.white, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
        titleDay: { textAlign: 'center', color: appcolor.black, fontSize: 9 },
        underView: { borderTopWidth: 1, borderColor: appcolor.grayLight, width: 10, },
        titleDate: { textAlign: 'center', fontSize: 10, color: appcolor.black },
        titleContent: { fontSize: 11, color: appcolor.black, textAlign: 'center' },
        titleValueContent: { fontSize: 9, color: appcolor.white, textAlign: 'center' }
    })
    const renderItem = ({ item }) => {
        const dayInt = parseInt(moment(item.date, 'YYYY-MM-DD').format("YYYYMMDD"))
        const dayColor = dayInt === TODAY ? appcolor.redgray : appcolor.primary;
        const onArrowPress = () => LoadData(item.pageNum, item.date)
        const onDayPress = () => { navigation.navigate("attendanthistory", { planDate: moment(item.date).format('YYYY-MM-DD') }) }
        //
        const renderArrow = () => (
            <TouchableOpacity style={styles.itemArrowMain} onPress={onArrowPress}>
                <View style={styles.buttonArrow}>
                    <Icon color={appcolor.primary} type="ionicon" size={16} name='caret-back' />
                </View>
            </TouchableOpacity>
        )
        const renderDay = () => (
            <TouchableOpacity style={styles.itemDayMain} onPress={onDayPress}>
                <View style={{ ...styles.itemContentDay, backgroundColor: dayColor }}>
                    <View style={styles.dayView}>
                        <Text style={styles.titleDay}>{item.dayName}</Text>
                        <View style={styles.underView} />
                        <Text style={styles.titleDate}>{moment(item.date).format("DD")}</Text>
                    </View>
                    <Text style={{ ...styles.titleContent, paddingTop: 8 }}>{item.target || '-'}</Text>
                    <Text style={styles.titleValueContent}>{item.l1}</Text>
                    <Text style={styles.titleContent}>{item.i}</Text>
                    <Text style={styles.titleValueContent}>{item.l2}</Text>
                    <Text style={styles.titleContent}>{item.o}</Text>
                    <Text style={styles.titleContent}>{item.actual}</Text>
                </View>
            </TouchableOpacity>
        )
        return ((item.pageNum === 7 || item.pageNum === -7) ? renderArrow() : renderDay())
    }
    return (
        <View style={styles.mainContainer}>
            <FlatList
                ref={refList}
                data={data}
                keyExtractor={(_item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
            />
        </View>

    )
}
export default DashboardAttendance;