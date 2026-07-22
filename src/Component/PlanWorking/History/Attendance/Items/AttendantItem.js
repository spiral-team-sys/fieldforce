import React, { memo, useCallback, useMemo, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Image } from '@rneui/themed'
import { Divider } from "@rneui/base"
import { useSelector } from "react-redux"
import { URLDEFAULT } from "../../../../../Core/URLs"
import { fontWeightBold } from "../../../../../Themes/AppsStyle"
import PhotoAttendant from "./PhotoAttendant"

const fieldMap = {
    'EMPLOYEE': { fieldName: "shopName", subFieldName: "shopCode" },
    'SHOP': { fieldName: "employeeName", subFieldName: "employeeCode" },
    'POSITION': { fieldName: "employeeName", subFieldName: 'shopName' },
}

const AttendantItem = memo(({ item, index, groupType, onShowPhoto }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isShowAttendance, setShowAttendance] = useState(true)
    const { fieldName, subFieldName } = fieldMap[groupType] || fieldMap['EMPLOYEE']
    const isShowOverView = item.isShowOverView === 1
    const overViewPath = item?.overViewPath?.includes('https')
        ? item.overViewPath
        : `${URLDEFAULT}${item.overViewPath}`
    const photos = useMemo(() => JSON.parse(item.photoList || '[]'), [item.photoList])
    const handleShowPhoto = useCallback((idx) => onShowPhoto(photos, idx), [onShowPhoto, photos])

    const onShowAttentdance = useCallback(() => {
        setShowAttendance(prev => !prev)
    }, [])

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, margin: 8, marginBottom: 0, borderRadius: 8, backgroundColor: appcolor.light },
        fieldName: { width: '100%', fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        rowContent: { width: '100%' },
        itemText: { width: '100%', fontSize: 12, color: appcolor.dark },
        itemShift: { width: '100%', fontSize: 12, color: appcolor.dark },
        divider: { marginTop: 8 },
        overviewBtn: { height: 100, width: 100, position: 'absolute', top: 10, right: 10, backgroundColor: appcolor.surface, borderRadius: 12 },
        overviewImg: { width: 100, height: 100, borderRadius: 12 },
        totalTime: { width: '100%', fontSize: 12, textAlign: 'center', padding: 8, fontWeight: fontWeightBold, color: appcolor.blacklight, textDecorationLine: 'underline' },
        overTime: { width: '100%', fontSize: 12, textAlign: 'center', paddingBottom: 8, fontWeight: '600', fontStyle: 'italic', color: appcolor.success },
    }), [appcolor])

    return (
        <View key={index} style={styles.container}>
            <Text style={styles.fieldName}>{item[fieldName]}</Text>
            <View style={styles.rowContent}>
                {subFieldName && <Text style={styles.itemText}>{item[subFieldName]}</Text>}
                <Text style={styles.itemText}>ĐC: {item.address}</Text>
                <Text style={styles.itemShift}>Ca làm việc: {item.shiftName}</Text>
                <Text style={styles.itemShift}>Total Time: {item.totalTime}</Text>
            </View>
            <Divider style={styles.divider} />
            {isShowOverView && (
                <TouchableOpacity
                    onPress={() => onShowPhoto([{ photoPath: item.overViewPath, AttendantPhoto: item.overViewPath }], 0)}
                    style={styles.overviewBtn}>
                    <Image source={{ uri: overViewPath }} style={styles.overviewImg} resizeMode="cover" resizeMethod="resize" />
                </TouchableOpacity>
            )}
            {photos.length > 0 && (
                <TouchableOpacity onPress={onShowAttentdance}>
                    <Text style={styles.totalTime}>Chi tiết hình ảnh chấm công</Text>
                </TouchableOpacity>
            )}
            {isShowAttendance && photos.length > 0 &&
                <PhotoAttendant lstPhoto={photos} showPhoto={handleShowPhoto} />
            }
            {item.overTime !== '0' && (
                <Text style={styles.overTime}>
                    Tổng thời gian làm thêm giờ: {item.overTime}
                </Text>
            )}
        </View>
    )
})

export default AttendantItem
