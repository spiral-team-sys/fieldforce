import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Icon, Text } from "@rneui/base";
import { useSelector } from "react-redux";
import _ from 'lodash'
import { formatNumber, groupDataByKey } from "../../../../../Core/Helper";

export const ListItemView = ({ dataMain, callBackRender, timeLoading = 2000 }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    //
    const LoadData = async () => {
        const itemMain = (dataMain[0] || {})
        const { arr } = await groupDataByKey({
            arr: dataMain,
            key: itemMain.keyMain || 'EmployeeId',
            keyLayer2: itemMain.keyGroup || 'WorkDate'
        })
        await setData(arr)

        await setTimeout(async () => {
            await callBackRender(false)
        }, timeLoading);
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [dataMain])
    // View
    const styles = StyleSheet.create({
        itemMain: { width: '100%', padding: 5 },
        itemMainViewBy: { width: '100%', padding: 8, backgroundColor: appcolor.placeholderBody, borderRadius: 8, marginVertical: 4, flexDirection: 'row', alignItems: 'center' },
        titleGroupHead: { width: '60%', fontSize: 14, color: appcolor.primary, fontWeight: Platform.OS == 'ios' ? '600' : '700' },
        titlePrice: { width: '30%', fontSize: 13, color: appcolor.primary, fontWeight: Platform.OS == 'ios' ? '600' : '700', textAlign: 'right' },
        titleContent: { width: '100%', fontSize: 13, color: appcolor.blacklight, fontWeight: '500' },
        titleContentStrong: { width: '70%', fontSize: 13, color: appcolor.blacklight, fontWeight: Platform.OS == 'ios' ? '600' : '700' },
        viewHead: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        viewHeadItem: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
        viewContent: { width: '100%', backgroundColor: appcolor.placeholderBody, padding: 8, borderRadius: 5 },
        titlePriceItem: { width: '30%', fontSize: 13, color: appcolor.blacklight, fontWeight: Platform.OS == 'ios' ? '600' : '700', textAlign: 'right' },
        badgeQuantity: { width: 28, height: 28, backgroundColor: appcolor.blacklight, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginEnd: 8 },
        titleBadge: { fontSize: 13, fontWeight: 'bold', color: appcolor.light },
        confirmBox: { width: '100%', marginTop: 8, padding: 8, borderRadius: 12, backgroundColor: appcolor.light, borderWidth: 1, borderColor: appcolor.grayLight },
        confirmHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        confirmTitleView: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingEnd: 8 },
        confirmTitle: { marginStart: 6, fontSize: 13, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.dark },
        confirmBadge: { minHeight: 28, paddingHorizontal: 8, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
        confirmBadgeText: { fontSize: 11, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.light },
        confirmRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
        confirmLabel: { width: 84, fontSize: 12, fontWeight: '500', color: appcolor.placeholderText },
        confirmValue: { flex: 1, fontSize: 12, fontWeight: '500', color: appcolor.dark },
        confirmNote: { flex: 1, fontSize: 12, fontWeight: '500', color: appcolor.danger, fontStyle: 'italic' }
    })
    const renderItem = ({ item, index }) => {
        const keyLayer2 = item[`${item[item.keyMain || 'EmployeeId']}${item[item.keyGroup || 'WorkDate']}`]
        const dataSum = _.filter(data, (e) => e[item.keyMain || 'EmployeeId'] == item[item.keyMain || 'EmployeeId'])
        const totalSale = _.sumBy(dataSum, 'SaleValue')
        //
        const itemSum = _.filter(data, (e) =>
            e[item.keyMain || 'EmployeeId'] == item[item.keyMain || 'EmployeeId'] &&
            e[item.keyGroup || 'WorkDate'] == item[item.keyGroup || 'WorkDate']
        )
        const totalItemSale = _.sumBy(itemSum, 'SaleValue') || ''
        const hasConfirmStatus = item.IsConfirm !== undefined && item.IsConfirm !== null && item.IsConfirm !== ''
        const hasConfirmName = item.FullName !== undefined && item.FullName !== null && `${item.FullName}`.trim() !== ''
        const hasConfirmNote = item.ConfirmNote !== undefined && item.ConfirmNote !== null && `${item.ConfirmNote}`.trim() !== ''
        const hasConfirmInfo = hasConfirmStatus || hasConfirmName || hasConfirmNote
        const isApproved = item.IsConfirm === true || item.IsConfirm === 1 || item.IsConfirm === '1' || `${item.IsConfirm}`.toLowerCase() === 'true'
        const confirmColor = hasConfirmStatus ? (isApproved ? appcolor.success : appcolor.danger) : appcolor.primary
        const confirmText = isApproved ? 'Đã duyệt' : 'Không được duyệt'
        if (item.viewBy) {
            return (
                <View style={styles.itemMainViewBy}>
                    <View style={styles.badgeQuantity}>
                        <Text style={styles.titleBadge}>{`${item.Quantity || ''}`}</Text>
                    </View>
                    <View style={styles.viewContent}>
                        <Text style={styles.titleContent}>{`${item[item.viewBy]}`}</Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View key={`${index}_iig3`} style={styles.itemMain} >
                    {item.isParent ?
                        <View style={styles.viewHead}>
                            <Icon type="ionicon" name={item.iconG3 || "person-circle"} size={18} color={appcolor.primary} style={{ paddingEnd: 8 }} />
                            <Text style={styles.titleGroupHead}>{item.n3}</Text>
                            <Text style={styles.titlePrice}>{`${formatNumber((totalSale || 0), ',')} ${item.UnitPrice}`}</Text>
                        </View>
                        : null}
                    <View style={styles.viewContent}>
                        {keyLayer2 ?
                            <View style={styles.viewHeadItem}>
                                <Text style={styles.titleContentStrong}>{`${item[item.keyGroupName || 'DateView']}`}</Text>
                                <Text style={styles.titlePriceItem}>{`${formatNumber(totalItemSale, ',')} ${item.UnitPrice}`}</Text>
                            </View>
                            : null}
                        <Text style={styles.titleContent}>{`Sản phẩm: ${item.ProductName}`}</Text>
                        {item.OrderValue !== undefined ? <Text style={styles.titleContent}>{`Số lượng: ${item.OrderValue}`}</Text> : null}
                        {item.Price !== undefined ? <Text style={styles.titleContent}>{`Giá: ${item.Price} ${item.UnitPrice}`}</Text> : null}
                        {item.PriceNPP !== undefined ? <Text style={styles.titleContent}>{`Giá NPP: ${item.PriceNPP} ${item.UnitPrice}`}</Text> : null}
                        {item.PercentShareDetail !== undefined ? <Text style={styles.titleContent}>{`Tỉ lệ: ${item.PercentShareDetail}%`}</Text> : null}
                        {item.SalePrice !== undefined ? <Text style={styles.titleContent}>{`Doanh số: ${item.SalePrice} ${item.UnitPrice}`}</Text> : null}
                        {hasConfirmInfo ?
                            <View style={styles.confirmBox}>
                                <View style={styles.confirmHeader}>
                                    <View style={styles.confirmTitleView}>
                                        <Icon type="ionicon" name="shield-checkmark-outline" size={18} color={confirmColor} />
                                        <Text style={styles.confirmTitle}>Thông tin duyệt</Text>
                                    </View>
                                    {hasConfirmStatus ?
                                        <View style={[styles.confirmBadge, { backgroundColor: confirmColor }]}>
                                            <Text style={styles.confirmBadgeText}>{confirmText}</Text>
                                        </View>
                                        : null}
                                </View>
                                {hasConfirmName ?
                                    <View style={styles.confirmRow}>
                                        <Text style={styles.confirmLabel}>Người duyệt</Text>
                                        <Text style={styles.confirmValue}>{`${item.FullName}`}</Text>
                                    </View>
                                    : null}
                                {hasConfirmNote ?
                                    <View style={styles.confirmRow}>
                                        <Text style={styles.confirmLabel}>Ghi chú</Text>
                                        <Text style={styles.confirmNote}>{`${item.ConfirmNote}`}</Text>
                                    </View>
                                    : null}
                            </View>
                            : null}
                    </View>
                </View>
            )
        }
    }
    return (
        <View style={{ width: '100%', paddingHorizontal: 3 }}>
            {data.map((item, index) => renderItem({ item, index }))}
        </View>
    )
}
