import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ActionSheet from 'react-native-actions-sheet'
import { useSelector } from 'react-redux'
import { fontWeightBold } from '../../../../Themes/AppsStyle'

const FilterStatusResult = ({ id, value, onChangeFilter }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const currentYear = new Date().getFullYear()
    const confirmStatusList = [
        { key: 'CONFIRM_PASS', label: 'Đạt' },
        { key: 'CONFIRM_FAIL', label: 'Rớt' },
        { key: 'CONFIRM_NOT_YET', label: 'Chưa upload' },
        { key: 'CONFIRM_PENDING', label: 'Chờ duyệt' },
    ]

    const timeModeList = [
        { key: 'MONTH', label: 'Theo tháng' },
        { key: 'QUARTER', label: 'Theo quý' },
    ]
    const quarterList = [1, 2, 3, 4]

    const defaultFilter = {
        confirmStatus: 'ALL',
        timeMode: 'ALL',
        month: new Date().getMonth() + 1,
        year: currentYear,
        quarter: null,
    }

    const [localFilter, setLocalFilter] = useState(value || defaultFilter)

    useEffect(() => {
        setLocalFilter(value || defaultFilter)
    }, [value])

    const handleChangeFilter = (next) => {
        setLocalFilter(next)
        onChangeFilter(next)
    }

    const handleSelectConfirmStatus = (key) => {
        handleChangeFilter({
            ...localFilter,
            confirmStatus: localFilter.confirmStatus === key ? 'ALL' : key,
        })
    }

    const handleSelectTimeMode = (mode) => {
        const nextFilter = {
            ...localFilter,
            timeMode: localFilter.timeMode === mode ? 'ALL' : mode,
            quarter: mode === 'QUARTER' ? localFilter.quarter : null,
        }
        handleChangeFilter(nextFilter)
    }

    const handleSelectQuarter = (quarter) => {
        const nextFilter = {
            ...localFilter,
            timeMode: 'QUARTER',
            quarter,
        }
        handleChangeFilter(nextFilter)
    }

    const handleClearFilter = () => {
        handleChangeFilter(defaultFilter)
    }

    const styles = StyleSheet.create({
        container: { backgroundColor: appcolor.light, paddingBottom: 24 },
        content: { padding: 16 },
        title: { fontSize: 16, fontWeight: fontWeightBold, marginBottom: 8, color: appcolor.dark },
        section: { marginBottom: 8 },
        sectionTitle: { fontSize: 13, fontWeight: fontWeightBold, marginBottom: 8, color: appcolor.dark },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
        chip: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 0.5, justifyContent: 'center' },
        chipText: { fontSize: 12, color: appcolor.dark, fontWeight: '500' },
        monthQuarterLabel: { fontSize: 12, fontWeight: fontWeightBold, marginBottom: 4, color: appcolor.dark },
        clearButton: { minHeight: 44, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 0.5, justifyContent: 'center' },
        clearText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark },
    })

    return (
        <ActionSheet id={id} containerStyle={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    Lọc kết quả chương trình
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Kết quả chương trình
                    </Text>
                    <View style={styles.chipRow}>
                        {confirmStatusList.map((item, index) => {
                            const isSelected = localFilter.confirmStatus === item.key
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelectConfirmStatus(item.key)}
                                    style={[styles.chip, { backgroundColor: isSelected ? appcolor.primary : appcolor.surface, borderColor: isSelected ? appcolor.primary : appcolor.grayLight }]}
                                >
                                    <Text style={[styles.chipText, { color: isSelected ? appcolor.light : appcolor.dark }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Thời gian
                    </Text>
                    <View style={styles.chipRow}>
                        {timeModeList.map((item, index) => {
                            const isSelected = localFilter.timeMode === item.key
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelectTimeMode(item.key)}
                                    style={[styles.chip, { backgroundColor: isSelected ? appcolor.primary : appcolor.surface, borderColor: isSelected ? appcolor.primary : appcolor.grayLight }]}
                                >
                                    <Text
                                        style={[styles.chipText, { color: isSelected ? appcolor.light : appcolor.dark }]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {localFilter.timeMode !== 'ALL' &&
                        <View>
                            {localFilter.timeMode === 'QUARTER' &&
                                <View>
                                    <Text style={styles.monthQuarterLabel}>
                                        Quý
                                    </Text>
                                    <View style={styles.chipRow}>
                                        {quarterList.map((q) => {
                                            const isSelected = localFilter.quarter === q
                                            return (
                                                <TouchableOpacity
                                                    key={q}
                                                    activeOpacity={0.7}
                                                    onPress={() => handleSelectQuarter(q)}
                                                    style={[styles.chip, { backgroundColor: isSelected ? appcolor.primary : appcolor.surface, borderColor: isSelected ? appcolor.primary : appcolor.grayLight }]}
                                                >
                                                    <Text
                                                        style={[styles.chipText, { color: isSelected ? appcolor.light : appcolor.dark }]}
                                                    >
                                                        {`Quý ${q}`}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>
                            }
                        </View>
                    }
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleClearFilter}
                    style={[styles.clearButton, { backgroundColor: appcolor.surface, borderColor: appcolor.grayLight }]}
                >
                    <Text style={styles.clearText}>
                        Xóa bộ lọc
                    </Text>
                </TouchableOpacity>
            </View>
        </ActionSheet>
    )
}

export default FilterStatusResult
