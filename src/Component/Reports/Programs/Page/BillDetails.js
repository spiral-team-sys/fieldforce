import { Divider, Icon, Text } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import { formatNumber } from "../../../../Core/Helper";
import CustomListView from "../../../../Control/Custom/CustomListView";

const BillDetails = ({ item }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const dataProduct = JSON.parse(item.jsonProducts || '[]')

    const totalAmountApproved = dataProduct.reduce((sum, product) => {
        if (product.detail_status !== 1) return sum
        return sum + Number(product.detail_line_amount || 0)
    }, 0)

    useEffect(() => {
        return () => { false }
    }, [item])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '97%', backgroundColor: appcolor.light, marginBottom: 8 },
        titleHead: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        titleName: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark },
        titleNameTable: { width: '18%', fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        valueNameTable: { width: '18%', fontSize: 12, fontWeight: '500', color: appcolor.dark, textAlign: 'center' },
        subTitleName: { fontSize: 12, color: appcolor.placeholderText, fontWeight: '500' },
        subTitleValue: { fontSize: 12, fontWeight: '500', color: appcolor.dark },
        subTitleStatus: { fontSize: 11, fontWeight: '500', color: appcolor.light },
        itemContainer: { marginBottom: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
        itemProductContainer: {},
        viewProductStatus: { flexDirection: 'row', alignItems: 'center' },
        viewHeader: { padding: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        viewInfo: { padding: 8 },
        viewStatus: { backgroundColor: appcolor.surface, padding: 4, paddingHorizontal: 8, margin: 8, marginStart: 0, marginBottom: 0, borderRadius: 4, alignItems: 'center' },
        columnTitle: { width: '45%' },
        columnValue: { width: '50%' },
        viewFooter: { alignItems: 'flex-end', paddingEnd: 8, paddingVertical: 4 }
    })
    // Bill Information
    const ItemBillInfo = (
        <View style={styles.itemContainer}>
            <View style={[styles.viewInfo, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <View style={styles.columnTitle}>
                    <Text style={styles.titleName}>{`Số hóa đơn: `}</Text>
                    <Text style={styles.titleName}>{`Ngày hóa đơn: `}</Text>
                    {item.fromDate && <Text style={styles.titleName}>{`Trong kì CT: `}</Text>}
                    <Text style={styles.titleName}>{`Cửa hàng: `}</Text>
                    <Text style={styles.titleName}>{`MST đăng ký: `}</Text>
                    <Text style={styles.titleName}>{`MST trên HĐ: `}</Text>
                </View>
                <View style={styles.columnValue}>
                    <Text style={styles.subTitleValue}>{`${item.invoice_series}`}</Text>
                    <Text style={styles.subTitleValue}>{`${item.invoice_issue_date}`}</Text>
                    {item.fromDate && <Text style={styles.subTitleValue}>{`${item.fromDate} - ${item.toDate}`}</Text>}
                    <Text style={styles.subTitleValue}>{`${item.shopName || 'N/A'}`}</Text>
                    <Text style={styles.subTitleValue}>{`${item.buyer_tax_code}`}</Text>
                    <Text style={styles.subTitleValue}>{`${item.buyer_tax_code}`}</Text>
                </View>
            </View>
        </View>
    )

    // Product Information
    const renderProductHeader = (
        <View style={styles.viewHeader}>
            <Text style={[styles.titleNameTable, { textAlign: 'left', width: '55%' }]}>{`Sản phẩm`}</Text>
            <Text style={[styles.titleNameTable, { width: '10%' }]}>{`SL`}</Text>
            <Text style={styles.titleNameTable}>{`Đ.Giá`}</Text>
            <Text style={styles.titleNameTable}>{`T.Tiền`}</Text>
        </View>
    )
    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemProductContainer}>
                <View style={styles.viewHeader}>
                    <View style={{ width: '55%' }}>
                        <Text style={[styles.valueNameTable, { textAlign: 'left', width: '100%', marginHorizontal: 0 }]}>{`${item.detail_item_name} `}<Icon type="ionicon" name={item.detail_status == 1 ? "checkmark-circle" : "close-circle"} size={13} color={appcolor[item.status_color]} /></Text>
                        <Text style={[styles.valueNameTable, { textAlign: 'left', width: '100%', marginHorizontal: 0 }]}>{`${item.confirm_name} `}</Text>
                    </View>
                    <Text style={[styles.valueNameTable, { width: '10%' }]}>{`${item.detail_quantity}`}</Text>
                    <Text style={styles.valueNameTable}>{`${formatNumber(item.detail_unit_price, '.')}`}</Text>
                    <Text style={styles.valueNameTable}>{`${formatNumber(item.detail_line_amount, '.')}`}</Text>
                </View>
            </View>
        )
    }
    const renderTotalAmount = (
        <>
            <View style={styles.viewFooter}>
                <Text style={[styles.titleName, { margin: 8, marginBottom: 0, fontSize: 14 }]}>{`Tổng tiền: `}<Text style={[styles.subTitleValue, { fontSize: 16 }]}>{`${formatNumber(item.total_amount, '.')} VNĐ`}</Text></Text>
                <Text style={[styles.titleName, { margin: 8, marginTop: 0, fontSize: 14 }]}>{`Tổng tiền hợp lệ: `}<Text style={[styles.subTitleValue, { fontSize: 16 }]}>{`${formatNumber(totalAmountApproved, '.')} VNĐ`}</Text></Text>
            </View>
        </>
    )
    const ItemProductInfo = () => (
        <View style={styles.itemContainer}>
            <CustomListView
                data={dataProduct}
                extraData={dataProduct}
                ListHeader={renderProductHeader}
                renderItem={renderItem}
                ListFooter={renderTotalAmount}
                bottomView={{ paddingBottom: 0 }}
            />
        </View>
    )
    return (
        <View style={styles.mainContainer}>
            <Text style={styles.titleHead}>{`Chi tiết hóa đơn`}</Text>
            <Text style={[styles.subTitleName, { textAlign: 'center', marginBottom: 8 }]}>{`${item.guuid}`}</Text>
            <CustomListView
                data={['MAIN']}
                ListHeader={ItemBillInfo}
                renderItem={ItemProductInfo}
                bottomView={{ paddingBottom: 0 }}
            />
        </View>
    )
}

export default BillDetails;