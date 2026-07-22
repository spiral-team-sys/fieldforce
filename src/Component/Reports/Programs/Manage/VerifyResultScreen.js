import React, { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { INVOICE_API } from "../../../../API/InvoiceAPI";
import CustomTab from "../../../../Control/Custom/CustomTab";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { Button, Divider, Icon, Text } from "@rneui/base";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import { formatNumber, groupDataByKey, removeVietnameseTones } from "../../../../Core/Helper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebViewScreen from "../../../../Control/Webview/WebViewScreen";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import BillDetails from "../Page/BillDetails";
import { LoadingView } from "../../../../Control/ItemLoading";
import _ from 'lodash';

const VerifyResultScreen = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [dataGroup, setDataGroup] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [itemViewFile, setItemViewFile] = useState({ visible: false, uri: null, pageName: null })
    const [itemDetail, setItemDetail] = useState({})

    const LoadData = async () => {
        await setLoading(true)
        await INVOICE_API.GetStatusInvoice((mData) => {
            const groupList = _.unionBy(mData, 'billStatusName')
            setDataGroup(groupList)
            setDataMain(mData)
            setData(mData)
        })
        await setLoading(false)
    }
    // Actions
    const onShowFile = (item) => {
        const linkView = Platform.OS == 'android' ? `https://docs.google.com/gview?embedded=true&url=${item.url}` : `${item.url}`
        setItemViewFile({ visible: true, uri: linkView, pageName: item.guid })
    }
    const onCloseFile = () => {
        setItemViewFile({ visible: false })
    }
    const onShowDetailBill = (item, itemMain) => {
        const info = { ...item, ...itemMain }
        SheetManager.show('bill-detail-sheet', { payload: info })
    }
    const onCloseDetail = () => {
        SheetManager.hide('bill-detail-sheet')
    }
    const onShowDetail = (item) => {
        let visible = !(item.isVisible || false)
        const showList = _.map(data, (e) => {
            if (e.shopId == item.shopId) {
                return { ...e, isVisible: visible }
            } else {
                return { ...e, isVisible: false }
            }
        })
        setData(showList)
    }
    const onSearchData = (text) => {
        const dataFilter = _searchData(text)
        setData(dataFilter)
    }
    const _searchData = (text) => {
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        const searchData = _.filter(dataMain, (e) => (
            removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.shopCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.address).toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        containerStyle: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { flex: 1, padding: 8, margin: 16, marginBottom: 0, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
        itemInvoice: { flex: 1 },
        tabContainer: { flex: 1 },
        loadingView: { position: 'absolute', top: 0, end: 0, bottom: 0, start: 0, alignItems: 'center', justifyContent: 'center' },
        titleHead: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 12, color: appcolor.placeholderText, fontWeight: '500' },
        subTitleValue: { fontSize: 12, color: appcolor.dark, marginBottom: 2 },
        subTitleAction: { fontSize: 11, color: appcolor.placeholderText, textDecorationLine: 'underline' },
        viewItemHeader: { flexDirection: 'row', alignItems: 'center', padding: 8 },
        viewItemSummary: { flexDirection: 'row', alignItems: 'center', padding: 8 },
        viewIconHome: { width: 42, height: 42, borderRadius: 42, backgroundColor: appcolor.second, alignItems: 'center', justifyContent: 'center', marginEnd: 8 },
        viewItemStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        viewConfirmStatus: { minWidth: 100, backgroundColor: appcolor.surface, borderRadius: 8, padding: 4, paddingHorizontal: 8, alignItems: 'center' },
        viewBillInfo: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
        modalContainer: { width: '100%', height: '100%' },
        buttonContainer: { width: 120, alignSelf: 'center', borderRadius: 8, overflow: 'hidden', marginTop: 16, position: 'absolute', bottom: 16 },
        buttonClose: { width: 120, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.dark, padding: 6, paddingHorizontal: 24 },
        titleButtonClose: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark },
        sheetContent: { width: '100%', height: '100%', padding: 16 },
        viewIconShow: { position: 'absolute', end: 8, top: 0, bottom: 0, justifyContent: 'center' }
    })

    const renderTab = (item) => {
        const dataDetail = _.filter(data, (e) => item.billStatusName == e.billStatusName)
        const { arr } = groupDataByKey({ arr: dataDetail, key: 'shopId' })
        return (
            <View style={styles.tabContainer}>
                <CustomListView
                    data={arr}
                    extraData={arr}
                    renderItem={renderItem}
                    onRefresh={LoadData}
                />
            </View>
        )
    }
    const renderItem = ({ item }) => {
        const dataBillDetails = JSON.parse(item.jsonBillDetails || "[]")
        const onPressFile = () => onShowFile(item)
        const onPressShow = () => onShowDetail(item)
        //
        const detailBill = (
            <CustomListView
                data={dataBillDetails}
                extraData={dataBillDetails}
                renderItem={(info) => renderBillDetail({ item: info.item, itemMain: item })}
                bottomView={{ paddingBottom: 0 }}
            />
        )
        const itemSuccess = (
            <View>
                {/* Store Info */}
                {item.isParent && (
                    <TouchableOpacity onPress={onPressShow} activeOpacity={0.8}>
                        <View style={styles.viewItemHeader}>
                            <View style={styles.viewIconHome}>
                                <Icon type="ionicon" name="home" size={16} color={appcolor.light} />
                            </View>
                            <View style={{ width: '84%' }}>
                                <Text style={styles.titleName}>{item.shopName}</Text>
                                <Text style={styles.subTitleName}>{`Mã CH: ${item.shopCode}`}</Text>
                                <Text style={styles.subTitleName}>{`ĐC: ${item.storeAddress}`}</Text>
                                <Text style={styles.subTitleName}>{`NPP: ${item.dealerName}`}</Text>
                            </View>
                            <View style={styles.viewIconShow}>
                                <Icon type="ionicon" name={item.isVisible ? "chevron-up" : "chevron-down"} size={12} color={appcolor.placeholderText} />
                            </View>
                        </View>
                        <View style={styles.viewSummary}>

                        </View>
                        <Divider />
                    </TouchableOpacity>
                )}
                {/* Bill Info */}
                {item.isVisible &&
                    <View>
                        <View style={styles.itemContainer}>
                            <View style={styles.viewItemStatus}>
                                <TouchableOpacity onPress={onPressFile}>
                                    <Text style={[styles.subTitleName, { fontWeight: fontWeightBold }]}>{`${item.guid}`}</Text>
                                    <Text style={styles.subTitleAction}>{`Bấm để xem chi tiết File`}</Text>
                                </TouchableOpacity>
                                <View style={[styles.viewConfirmStatus, { backgroundColor: appcolor[item.billConfirmColor] }]}>
                                    <Text style={[styles.subTitleName, { color: appcolor.white }]}>{`${item.billConfirmName}`}</Text>
                                </View>
                            </View>
                            <Divider style={{ marginVertical: 8 }} />
                            <Text style={styles.titleName}>{`CT: ${item.programName}`}</Text>
                            <Text style={styles.subTitleValue}>{`${item.programTypeName}`}</Text>
                            <Text style={styles.subTitleValue}>{`${item.fromDate} - ${item.toDate}`}</Text>
                            <Divider style={{ marginVertical: 8 }} />
                            {detailBill}
                        </View>
                    </View>
                }
            </View>
        )
        const itemFail = (
            <View style={styles.itemContainer}>
                <View style={styles.viewItemStatus}>
                    <TouchableOpacity onPress={onPressFile}>
                        <Text style={styles.titleName}>{`${item.guid}`}</Text>
                        <Text style={styles.subTitleAction}>{`Bấm để xem chi tiết File`}</Text>
                    </TouchableOpacity>
                </View>
                {item.billStatus == 2 && (
                    <>
                        <Divider style={{ marginVertical: 8 }} />
                        <View style={[styles.viewConfirmStatus, { backgroundColor: appcolor[item.billConfirmColor], marginBottom: 8 }]}>
                            <Text style={[styles.subTitleName, { color: appcolor.white }]}>{`${item.billStatusReason}`}</Text>
                        </View>
                        {detailBill}
                    </>
                )}
            </View>
        )
        //
        return (
            item.billStatus == 1 ? itemSuccess : itemFail
        )
    }
    const renderBillDetail = ({ item, itemMain }) => {
        const jsonProducts = JSON.parse(item.jsonProducts || '[]')
        const total_amount_valid = jsonProducts.reduce((sum, product) => {
            if (product.detail_status !== 1) return sum
            return sum + Number(product.detail_line_amount || 0)
        }, 0)

        const onPressBill = () => onShowDetailBill(item, itemMain)
        return (
            <TouchableOpacity onPress={onPressBill}>
                <View style={styles.viewBillInfo}>
                    <View style={styles.itemInvoice}>
                        <Text style={[styles.titleName, { marginBottom: 2 }]}>{`Thông tin hóa đơn`}</Text>
                        <Text style={styles.subTitleValue}>{`Số HĐ: ${item.invoice_series}`}</Text>
                        <Text style={styles.subTitleValue}>{`Ngày HĐ: ${item.invoice_issue_date}`}</Text>
                        <Text style={styles.subTitleValue}>{`MST: ${item.buyer_tax_code}`}</Text>
                        <Text style={styles.subTitleValue}>{`Tổng tiền: ${formatNumber(item.total_amount, '.')} VNĐ`}</Text>
                        <Text style={styles.subTitleValue}>{`Tổng tiền hợp lệ: ${formatNumber(total_amount_valid, '.')} VNĐ`}</Text>
                    </View>
                    <View style={[styles.itemInvoice, { marginStart: 8 }]}>
                        <Text style={[styles.titleName, { marginBottom: 2 }]}>{`Tổng SKU: ${item.total_product} sản phẩm`}</Text>
                        <Text style={styles.subTitleValue}>{`Thuộc CT: ${item.total_product_accept}`}</Text>
                        <Text style={styles.subTitleValue}>{`Không thuộc CT: ${item.total_product_reject}`}</Text>
                        <Text style={styles.subTitleValue}>{`Không nhận dạng: ${item.total_product_none}`}</Text>
                    </View>
                </View>
                <Text style={[styles.subTitleAction, { textAlign: 'right' }]}>{`Xem chi tiết hóa đơn -->`}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Theo dõi kết quả'}
                leftFunc={onBack}
            />
            <SearchData
                placeholder='Tìm kiếm hóa đơn'
                onSearchData={onSearchData}
            />
            <LoadingView isLoading={isLoading} title='Đang tải dữ liệu' />
            <View style={styles.containerStyle}>
                {!isLoading &&
                    <CustomTab
                        data={dataGroup}
                        dataMain={data}
                        keyTabName="billStatusName"
                        renderItem={renderTab}
                    />
                }
            </View>
            <Modal
                visible={itemViewFile.visible}
                presentationStyle='fullScreen'
                statusBarTranslucent
                backdropColor={appcolor.black}
                style={{ flex: 1, backgroundColor: appcolor.black }}
                animationType='fade'>
                <SafeAreaProvider>
                    <WebViewScreen
                        pageName={itemViewFile?.pageName}
                        urlPage={itemViewFile.uri}
                        isConfirmExits={false}
                        onClose={onCloseFile}
                    />
                </SafeAreaProvider>
            </Modal>
            <ActionSheet id="bill-detail-sheet"
                drawUnderStatusBar
                statusBarTranslucent={false}
                safeAreaInsets={{ top: 56, bottom: 0, left: 0, right: 0 }}
                containerStyle={{ flex: 1, backgroundColor: appcolor.light }}
                onBeforeShow={setItemDetail}
            >
                <SafeAreaView edges={['top', 'bottom']} style={styles.sheetContent}>
                    <View style={styles.viewContent}>
                        <BillDetails item={itemDetail} />
                    </View>
                    <Button
                        type="outline"
                        title='Đóng'
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonClose}
                        titleStyle={styles.titleButtonClose}
                        onPress={onCloseDetail}
                    />
                </SafeAreaView>
            </ActionSheet>
        </View>
    )
}

export default VerifyResultScreen;