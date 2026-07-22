import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth } from '../Home';
import { FlashList } from '@shopify/flash-list';
import moment from 'moment';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { alertConfirm } from '../../Core/Utility';

export const DashboardWorkingPlan = ({ info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataSummary, setDataSummary] = useState([])
    const [dataSheet, setDataSheet] = useState([])
    //
    const handleSelectItem = (item) => {
        const dataPlanByItem = JSON.parse(item.DataPlan || '[]')
        SheetManager.show('sheetWorkingPlan', { payload: dataPlanByItem })
    }
    const onCallAction = (phoneNumber) => {
        alertConfirm('Gọi điện thoại', `Bạn có chắc muốn gọi đến số điện thoại ${phoneNumber} không?`, () => {
            let call = Platform.OS == "ios" ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`
            Linking.canOpenURL(call)
                .then(supported => {
                    if (!supported) {
                        ToastError('Số điện thoại không đúng hoặc sai định dạng, vui lòng kiểm tra và thử lại sau', 'Số điện thoại')
                    } else {
                        return Linking.openURL(call);
                    }
                }).catch(error => {
                    ToastError(`Lỗi: ${error}`)
                });
        }, () => { }, 'Gọi ngay', 'Không')
    }

    useEffect(() => {
        setDataSummary(JSON.parse(info.chartData || '[]'))
        return () => { false }
    }, [info])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', backgroundColor: appcolor.light, marginBottom: 12, paddingBottom: 8, borderRadius: 8, elevation: 3, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.5, shadowRadius: 8, overflow: 'hidden' },
        viewTitleChart: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingBottom: 0 },
        viewSheet: { width: '100%', height: deviceHeight / 1.6 },
        titleSheet: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 11, fontWeight: '500', color: appcolor.greylight },
        titleChart: { width: '90%', marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: fontWeightBold, fontSize: 14 },
        titleDetails: { fontSize: 12, fontWeight: '500', color: appcolor.blacklight, fontStyle: 'italic', textAlign: 'right', padding: 8, paddingEnd: 16, textDecorationLine: 'underline' },
        itemContainer: { backgroundColor: appcolor.surface, margin: 8, marginBottom: 0, borderRadius: 8, padding: 8, flexDirection: 'row' },
        viewCall: { position: 'absolute', end: 8, width: 38, height: 38, borderRadius: 38, backgroundColor: appcolor.light, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
        viewTitleDate: { flexDirection: 'row', alignItems: 'center' }
    })
    const renderItem = ({ item }) => {
        const onCall = () => onCallAction(item?.mobile)
        const onPress = () => handleSelectItem(item)
        return (
            <TouchableOpacity disabled={item.EmployeeId == 0} onPress={onPress} style={styles.itemContainer}>
                <View style={styles.viewTitleEmployee}>
                    <Text style={styles.titleName}>{item.FullName}</Text>
                    <Text style={styles.subTitleName}>{item.Experience}</Text>
                    <Text style={styles.subTitleName}>{item.ShiftName !== 'OFF' && item.TimeShift ? item.ShiftName + ': ' + item.TimeShift : item.ShiftName}</Text>
                    {item.CategoryName && <Text style={styles.subTitleName}>{item.CategoryName}</Text>}
                </View>
                <TouchableOpacity onPress={onCall} style={styles.viewCall}>
                    <Icon name="phone" size={16} color={appcolor.primary} />
                </TouchableOpacity>
            </TouchableOpacity >
        )
    }
    const renderItemPlan = ({ item }) => {
        return (
            <View style={{ ...styles.itemContainer, flexDirection: 'column' }}>
                <View style={styles.viewTitleDate}>
                    <Icon color={appcolor.greylight} name="calendar-day" size={16} style={{ marginEnd: 5 }} />
                    <Text style={styles.titleName}>{item.DayOfWeekVN}, {moment(item.Date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</Text>
                </View>
                <Text style={styles.subTitleName}>{`        ${item.ShiftType}: ${item.TimeShift}`}</Text>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer} >
            <View style={styles.viewTitleChart}>
                <Icon color={appcolor.primary} type="font-awesome-5" name="list" size={20} />
                <Text style={styles.titleChart}> {info !== null ? info.chartName : ''}</Text>
            </View>
            <FlashList
                keyExtractor={(_it, index) => index.toString()}
                data={dataSummary}
                extraData={[dataSummary]}
                renderItem={renderItem}
                estimatedItemSize={deviceWidth}
                showsVerticalScrollIndicator={false}
            />
            <ActionSheet id='sheetWorkingPlan' gestureEnabled onBeforeShow={setDataSheet} >
                <View style={styles.viewSheet}>
                    <Text style={styles.titleSheet}>Chi tiết kế hoạch làm việc</Text>
                    <FlashList
                        keyExtractor={(it, _index) => it.Date.toString()}
                        data={dataSheet}
                        extraData={[dataSheet]}
                        renderItem={renderItemPlan}
                        contentContainerStyle={{ paddingHorizontal: 8 }}
                        estimatedItemSize={deviceWidth}
                        ListFooterComponent={<View style={styles.bottomView} />}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                        nestedScrollEnabled
                    />
                </View>
            </ActionSheet>
        </View >
    )
}