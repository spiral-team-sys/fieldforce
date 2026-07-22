import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "@rneui/base";
import { formatNumber } from "../../../../../Core/Helper";

const DISPLAY_COLOR = '#0DAE8B';

const SummaryDisplayCard = ({ appcolor, metrics = {}, onPress }) => {
    const styles = StyleSheet.create({
        pressable: { marginBottom: 12 },
        container: {
            borderRadius: 22,
            borderWidth: 1,
            borderColor: appcolor.grayLight,
            backgroundColor: appcolor.surface || appcolor.light,
            padding: 8,
            overflow: 'hidden',
        },
        header: {
            borderRadius: 18,
            backgroundColor: appcolor.light,
            padding: 8,
        },
        headerTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitleWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            paddingRight: 12,
        },
        headerIcon: {
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${DISPLAY_COLOR}14`,
            marginRight: 10,
        },
        headerEyebrow: {
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            color: DISPLAY_COLOR,
            letterSpacing: 0.3,
        },
        headerTitle: {
            marginTop: 2,
            fontSize: 18,
            fontWeight: '800',
            color: appcolor.dark,
        },
        headerSubtitle: {
            marginTop: 2,
            marginBottom: 8,
            fontSize: 11,
            fontWeight: '600',
            color: appcolor.placeholderText || appcolor.dark,
        },
        grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
        card: {
            width: '48.5%',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: appcolor.grayLight,
            backgroundColor: appcolor.light,
            padding: 12,
            marginBottom: 10,
        },
        cardTop: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        iconWrap: {
            width: 34,
            height: 34,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            marginVertical: 4,
            fontSize: 11,
            fontWeight: '700',
            color: appcolor.placeholderText || appcolor.dark,
        },
        value: { fontSize: 21, fontWeight: '800', color: appcolor.dark },
        valueCompact: { fontSize: 18 },
        subtitle: {
            fontSize: 11,
            fontWeight: '500',
            color: appcolor.placeholderText || appcolor.dark,
        },
        cornerDot: { width: 8, height: 8, borderRadius: 999 },
    })

    const toDisplay = (value, suffix = '') => {
        const parsed = Number(value) || 0
        if (suffix === '%') {
            const rounded = Math.round(parsed * 10) / 10
            const text = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
            return `${text}%`
        }
        return formatNumber(Math.round(parsed), ',') || '0'
    }

    const execTotal = Number(metrics.execTotal) || 0
    const execPassCount = Number(metrics.execPassCount) || 0
    const execFailCount = Number(metrics.execFailCount) || 0

    const items = [
        {
            key: 'store',
            title: 'Tổng cửa hàng',
            value: toDisplay(metrics.shopTotal),
            subtitle: `${toDisplay(metrics.programTotal)} Chương trình`,
            icon: 'storefront-outline',
            iconColor: '#00A6C7',
            iconBg: '#E4F7FB',
        },
        {
            key: 'shopPass',
            title: 'Shop đạt Display',
            value: toDisplay(metrics.metTargetCount),
            subtitle: `${toDisplay(metrics.passRate, '%')} Cửa hàng`,
            icon: 'checkmark-circle-outline',
            iconColor: '#1DBF73',
            iconBg: '#E7FAF1',
        },
        {
            key: 'shopFail',
            title: 'Shop không đạt Display',
            value: toDisplay(metrics.notMetTargetCount),
            subtitle: `${toDisplay(metrics.notMetRate, '%')} Cửa hàng`,
            icon: 'close-circle-outline',
            iconColor: '#F25555',
            iconBg: '#FFECEC',
        },
        {
            key: 'passCount',
            title: 'Lần thực hiện đạt',
            value: toDisplay(execPassCount),
            subtitle: `/ ${toDisplay(execTotal)} lần`,
            icon: 'ribbon-outline',
            iconColor: '#1DBF73',
            iconBg: '#E7FAF1',
            compact: true,
        },
        {
            key: 'failCount',
            title: 'Lần thực hiện không đạt',
            value: toDisplay(execFailCount),
            subtitle: `/ ${toDisplay(execTotal)} lần`,
            icon: 'alert-circle-outline',
            iconColor: '#F25555',
            iconBg: '#FFECEC',
            compact: true,
        },
        {
            key: 'passRate',
            title: 'Tỷ lệ hoàn thành',
            value: toDisplay(metrics.execPassRate, '%'),
            subtitle: `${toDisplay(execPassCount)}/${toDisplay(execTotal)} lần`,
            icon: 'trending-up-outline',
            iconColor: '#F5A623',
            iconBg: '#FFF6E2',
        },
    ]

    return (
        <TouchableOpacity
            style={styles.pressable}
            activeOpacity={onPress ? 0.95 : 1}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerTitleWrap}>
                            <View style={styles.headerIcon}>
                                <Icon type="ionicon" name="easel-outline" color={DISPLAY_COLOR} size={20} />
                            </View>
                            <View>
                                <Text style={styles.headerEyebrow}>Display</Text>
                                <Text style={styles.headerTitle}>Thống kê Display</Text>
                                <Text style={styles.headerSubtitle}>Tổng quan kết quả trưng bày theo chương trình</Text>
                            </View>
                        </View>
                        {onPress ? <Icon type="ionicon" name="chevron-forward" color={DISPLAY_COLOR} size={18} /> : null}
                    </View>

                    <View style={styles.grid}>
                        {items.map((item) => (
                            <View key={item.key} style={styles.card}>
                                <View style={styles.cardTop}>
                                    <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                                        <Icon type="ionicon" name={item.icon} color={item.iconColor} size={18} />
                                    </View>
                                    <View style={[styles.cornerDot, { backgroundColor: item.iconColor }]} />
                                </View>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={[styles.value, item.compact ? styles.valueCompact : null]} numberOfLines={1}>{item.value}</Text>
                                <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default SummaryDisplayCard;
