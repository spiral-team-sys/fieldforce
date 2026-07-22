import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import moment from "moment";
import { DashboardAPI } from "../../../../../API/DashboardAPI";
import { getMetricData } from "../Control/summaryMetrics";
import SummaryModuleCard from "./SummaryModuleCard";

/**
 * Standalone widget for "Thống kê chương trình đăng ký".
 * Fetches its own data — can be placed on any screen/home page.
 *
 * Props:
 *  - appcolor   (required) – theme colors from redux
 *  - params     (optional) – override API params { fromDate, toDate, employeeId, dealerId, programId }
 *  - onPress    (optional) – tap handler (e.g. navigate to full dashboard)
 */
const RegisterProgramWidget = ({ appcolor, params, onPress }) => {
    const [metrics, setMetrics] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const passColor = appcolor.success || '#2E7D32'
    const failColor = appcolor.danger || appcolor.red || '#C62828'
    const neutralColor = appcolor.dark

    const defaultParams = useMemo(() => {
        const start = moment().startOf('month').format('YYYYMMDD')
        const end = moment().endOf('month').format('YYYYMMDD')
        return {
            fromDate: start,
            toDate: end,
            fromdate: moment().startOf('month').format('YYYY-MM-DD'),
            todate: moment().endOf('month').format('YYYY-MM-DD'),
            employeeId: null,
            dealerId: null,
            programId: null,
        }
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        setErrorMessage('')
        const apiParams = { ...defaultParams, ...(params || {}) }
        await DashboardAPI.GetDashboardReport(apiParams, (mData, message) => {
            if (message) {
                setErrorMessage(message)
                setMetrics(null)
            } else {
                setMetrics(getMetricData(mData || []))
            }
            setLoading(false)
        })
    }, [defaultParams, params])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const segments = metrics ? [
        { key: 'rp', label: 'Đã đăng ký', value: metrics.registerPass, color: passColor },
        { key: 'rf', label: 'Chưa đăng ký', value: metrics.registerFail, color: failColor },
        {
            key: 'ro',
            label: 'Khác',
            value: Math.max(0, metrics.registerTotal - metrics.registerPass - metrics.registerFail),
            color: appcolor.warning || '#F39C12',
        },
    ] : []

    const rows = metrics ? [
        { label: 'Đã đăng ký', value: metrics.registerPass, valueStyle: { color: passColor } },
        { label: 'Chưa đăng ký', value: metrics.registerFail, valueStyle: { color: failColor } },
        { label: 'Tổng chương trình', value: metrics.registerTotal, valueStyle: { color: neutralColor }, isDivider: true },
    ] : []

    const styles = StyleSheet.create({
        loadingBox: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
            borderRadius: 22,
            backgroundColor: appcolor.surface,
            borderWidth: 1,
            borderColor: appcolor.grayLight,
            marginVertical: 7,
        },
        errorBox: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
            borderRadius: 22,
            backgroundColor: appcolor.surface,
            borderWidth: 1,
            borderColor: `${failColor}33`,
            marginVertical: 7,
            paddingHorizontal: 16,
        },
        errorText: { fontSize: 12, color: failColor, textAlign: 'center', fontWeight: '600' },
        wrapper: { opacity: typeof onPress === 'function' ? 1 : 1 },
    })

    if (isLoading) {
        return (
            <View style={styles.loadingBox}>
                <ActivityIndicator color={appcolor.primary} size="small" />
                <Text style={{ marginTop: 8, fontSize: 12, color: appcolor.placeholderText || appcolor.dark }}>
                    Đang tải dữ liệu...
                </Text>
            </View>
        )
    }

    if (errorMessage) {
        return (
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        )
    }

    if (!metrics) return null

    const card = (
        <SummaryModuleCard
            appcolor={appcolor}
            title={'Thống kê chương trình đăng ký'}
            subtitle={'Theo dõi tỷ lệ đăng ký theo tháng hiện tại'}
            centerLabel={'CT'}
            accentColors={[appcolor.primary, appcolor.info || '#1F6FEB']}
            segments={segments}
            rows={rows}
        />
    )

    if (typeof onPress === 'function') {
        return <TouchableOpacity activeOpacity={0.85} onPress={onPress}>{card}</TouchableOpacity>
    }

    return card
}

export default RegisterProgramWidget;
