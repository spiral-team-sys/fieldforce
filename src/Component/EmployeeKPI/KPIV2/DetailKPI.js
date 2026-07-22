import React, { memo } from "react";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Text } from "@rneui/base";
import { UIManager } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const DetailKPI = ({ item, dataKPI, configData, configTableData, handleSelectItemTab }) => {
    const { appcolor, kpiSummary } = useSelector(state => state.GAppState)
    // const styles = StyleSheet.create({
    //     titleView: { fontSize: 14, fontStyle: 'italic', fontWeight: '700', color: appcolor.dark },
    //     titleResultView: { fontSize: 14, fontStyle: 'italic', fontWeight: '700', color: appcolor.success }
    // })
    // const itemKPI = dataKPI[0] || {}
    // const dateTitle = itemKPI?.auditDate !== null ? `Ngày ${itemKPI?.auditDate}` : 'Ngày chấm điểm:'
    // const employeeTitle = item.userId > 0 ? `Nhân viên (${item.employeeCode}) - ${item.fullName}` : 'Nhân viên:'
    // const shopTitle = item.shopId > 0 ? `Cửa hàng (${item.shopCode}) - ${item.shopName}` : 'Cửa hàng:'
    return (
        <View style={{ flexDirection: 'column', padding: 8, }}>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '80%' }}>
                    <Text style={styles.titleView}>{dateTitle}</Text>
                    {configData.byShop !== 0 && <Text style={styles.titleView}>{shopTitle}</Text>}
                    <Text style={styles.titleView}>{employeeTitle}</Text>
                    {configData.byShop !== 0 && <Text style={styles.titleResultView}>{itemKPI?.resultItem || ''}</Text>}

                </View>
                <View style={{ width: '18%', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.primary, margin: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: appcolor.dark }}>{configTableData?.titlePoint || 'Tổng'}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: appcolor.dark }}>{kpiSummary[0]?.totalSummary || 0}</Text>
                </View>
            </View>
            <Text key={`TotalKPI`} style={{ fontSize: 14, fontWeight: '600', color: appcolor.dark }}>
                {configTableData?.titleDetail || 'Điểm thành phần'}
            </Text>
            <ScrollView
                style={{ alignSelf: 'center', width: '100%', height: 40 }}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
            >
                {kpiSummary?.map((item, index) => {
                    return index > 0 ?
                        <TouchableOpacity onPress={() => handleSelectItemTab(item)} key={'TotalKPI_' + index} style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                            <View style={{ padding: 4, backgroundColor: appcolor.surface, borderRadius: 8 }}>
                                <Text key={`NumPoint`}
                                    style={{ color: appcolor.info, fontSize: 15 }}>{`${item.groupName} (${item.totalByGroup})`}</Text>
                            </View>
                        </TouchableOpacity>

                        : null
                })}
            </ScrollView> */}
        </View>
    )
}