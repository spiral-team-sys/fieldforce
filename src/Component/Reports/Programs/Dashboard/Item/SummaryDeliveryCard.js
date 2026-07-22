import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "@rneui/base";
import { formatNumber } from "../../../../../Core/Helper";

const DELIVERY_COLOR = '#F57C00';

const SummaryDeliveryCard = ({ appcolor, metrics = {}, onPress }) => {
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
            backgroundColor: `${DELIVERY_COLOR}14`,
            marginRight: 10,
        },
        headerEyebrow: {
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            color: DELIVERY_COLOR,
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
    const execPassRate = Number(metrics.execPassRate) || 0

    const items = [
        {
            key: 'store',
            title: 'TOTAL STORE',
            value: toDisplay(metrics.shopTotal),
            subtitle: `${toDisplay(metrics.programTotal)} Programs`,
            icon: 'storefront-outline',
            iconColor: '#F57C00',
            iconBg: '#FFF0E5',
        },
        {
            key: 'shopPass',
            title: 'L_DELIVERY_SHOP_PASS',
            value: toDisplay(metrics.metTargetCount),
            subtitle: `${toDisplay(metrics.passRate, '%')} Pass rate`,
            icon: 'checkmark-circle-outline',
            iconColor: '#1DBF73',
            iconBg: '#E7FAF1',
        },
        {
            key: 'shopFail',
            title: 'L_SHOP_NOT_PASS',
            value: toDisplay(metrics.notMetTargetCount),
            subtitle: `${toDisplay(metrics.notMetRate, '%')} Not met`,
            icon: 'close-circle-outline',
            iconColor: '#F25555',
            iconBg: '#FFECEC',
        },
        {
            key: 'passCount',
            title: 'L_DELIVERY_PASS_COUNT',
            value: toDisplay(execPassCount),
            subtitle: `${toDisplay(execPassCount)} / ${toDisplay(execTotal)} l_turns`,
            icon: 'cube-outline',
            iconColor: '#F57C00',
            iconBg: '#FFF0E5',
            compact: true,
        },
        {
            key: 'awardType',
            title: 'AWARD TYPE',
            value: toDisplay(metrics.awardTypeCount),
            subtitle: 'l_total_award_type',
            icon: 'trophy-outline',
            iconColor: '#F5A623',
            iconBg: '#FFF6E2',
            compact: true,
        },
        {
            key: 'awardTotal',
            title: 'L_TOTAL_AWARD',
            value: toDisplay(metrics.totalAwardQty),
            subtitle: 'l_total_award_qty',
            icon: 'trending-up-outline',
            iconColor: '#2AA7DE',
            iconBg: '#E6F6FD',
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
                                <Icon type="ionicon" name="cube-outline" color={DELIVERY_COLOR} size={20} />
                            </View>
                            <View>
                                <Text style={styles.headerEyebrow}>Delivery</Text>
                                <Text style={styles.headerTitle}>Delivery</Text>
                                <Text style={styles.headerSubtitle}>{`${toDisplay(execPassRate, '%')} completion`}</Text>
                            </View>
                        </View>
                        {onPress ? <Icon type="ionicon" name="chevron-forward" color={DELIVERY_COLOR} size={18} /> : null}
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

export default SummaryDeliveryCard;
