import React, { useEffect, useRef, useState } from "react";
import { LayoutAnimation, Text, TouchableOpacity, UIManager, View } from "react-native";
import { useSelector } from "react-redux";
import { formatNumber } from "../../../Core/Helper";
import { ItemResultInvoice } from "../ItemResultHome/itemResultInvoice";
import _ from "lodash"
import { deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Icon } from '@rneui/themed';
import { ScrollView } from "react-native-actions-sheet";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const InvoiceResultDefault = ({ styles, dataBill, filterInvoice, handleReloadInvoice, handlerUploadDocument, ItemView, handleOnScroll, currentItem }) => {
    const [dataStatus, setDataStatus] = useState([])
    const { appcolor } = useSelector(state => state.GAppState)
    const refInvoice = useRef()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoadDone, setLoadDone] = useState(false)
    useEffect(() => {
        loadbillStatus()
        return () => false
    }, [])

    const loadbillStatus = () => {
        setLoadDone(false)
        const listData = JSON.parse(dataBill.dataDetail[0]?.listTab || '[]')

        setDataStatus(listData)
        setLoadDone(true)
    }
    useEffect(() => {
        if (isLoadDone) {
            refInvoice.current !== null ?
                setTimeout(() => refInvoice.current?.setIndex(currentItem?.currentIndexHome || 0) || null, 300)
                : null
        }
        return () => false
    }, [isLoadDone])

    const renderItemInvoice = (item, index) => {

        return (
            <ItemResultInvoice
                key={`Invoice_${index}`}
                styles={styles}
                index={index}
                item={item}
                ItemView={ItemView}
                filterInvoice={filterInvoice}
                handleReloadInvoice={handleReloadInvoice}
                handlerUploadDocument={handlerUploadDocument}
                currentIndexHome={currentIndex}
            />
        )
    }
    return (
        <View style={{ width: '100%', height: '100%' }}>
            <ViewInvoiceDefault dataBill={dataBill} styles={styles} />
            {(dataStatus?.length > 0 && dataBill?.dataDetail?.length > 0) &&
                <Tabs.Container
                    ref={refInvoice}
                    pagerProps={{
                        scrollEnabled: false
                    }}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            style={{ borderRadius: 10, margin: 5 }}
                            labelStyle={{ fontSize: 13, fontWeight: '700' }}
                            indicatorStyle={{ backgroundColor: appcolor.transparent }}
                            inactiveColor={appcolor.greylight}
                            activeColor={appcolor.red}
                            tabStyle={{ borderRadius: 20, backgroundColor: appcolor.placeholderBody, minWidth: minWidthTab(dataStatus), height: 35, marginEnd: 8 }}
                            scrollEnabled={true}
                        />
                    )}
                    styles={{ borderRadius: 20 }}
                    containerStyle={{ width: '100%', }}
                    onIndexChange={(e) => setCurrentIndex(e)}

                    headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
                >
                    {dataStatus.map((item, index) => {

                        const dataInvoice = _.filter(dataBill.dataDetail, { statusId: item.Id })
                        return (
                            dataInvoice.length > 0 ?
                                <Tabs.Tab
                                    key={`bill_${index} (${dataInvoice.length})`}
                                    label={`${item.nameVN} (${dataInvoice.length})`}
                                    name={`${item.nameVN} (${dataInvoice.length})`}>
                                    <View style={{ flex: 1, paddingTop: 45, width: deviceWidth, }}>
                                        <ScrollView
                                            onScroll={() => filterInvoice.loadYearMonth ? handleOnScroll() : null}
                                            scrollEventThrottle={30}
                                            contentContainerStyle={{ paddingBottom: deviceHeight / 2 }}
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator={false}>
                                            {dataInvoice.map((item, index) => {
                                                return renderItemInvoice(item, index)
                                            })}
                                        </ScrollView>
                                    </View>
                                </Tabs.Tab>
                                :
                                null
                        )
                    })}
                </Tabs.Container>
            }
        </View>
    )
}
const ViewInvoiceDefault = ({ dataBill, styles }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [showItem, setShowItem] = useState(false)

    const confirmCosts = `Chi phí được quyết toán kỳ này ${dataBill?.dataDefault?.confirmCosts > 0 ? formatNumber(dataBill?.dataDefault?.confirmCosts, ',') : 0} VNĐ`
    const prevCosts = `Chi phí đã chuyển từ kỳ trước sang ${dataBill?.dataDefault?.prevCosts > 0 ? formatNumber(dataBill?.dataDefault?.prevCosts, ',') : 0} VNĐ`
    const waitCosts = `Chi phí chờ duyệt ${dataBill?.dataDefault?.waitCosts > 0 ? formatNumber(dataBill?.dataDefault?.waitCosts, ',') : 0} VNĐ`
    const nextCosts = `Chi phí chuyển kỳ sau ${dataBill?.dataDefault?.nextCosts > 0 ? formatNumber(dataBill?.dataDefault?.nextCosts, ',') : 0} VNĐ`
    const cancelCosts = `Chi phí bỏ quyết toán ${dataBill?.dataDefault?.cancelCosts > 0 ? formatNumber(dataBill?.dataDefault?.cancelCosts, ',') : 0} VNĐ`

    const handleShowItem = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowItem(e => !e)
    }
    return (
        <TouchableOpacity
            style={{ backgroundColor: appcolor.primary, margin: 5, borderRadius: 8, padding: 5 }}
            onPress={handleShowItem}
        >
            <View style={{ width: '100%' }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: appcolor.white, textAlign: 'center', padding: 5 }}>{userinfo.employeeCode}-{userinfo.employeeName}</Text>
                {/* <ItemView styleView={styles.contentTopView} value={buhCosts} iconName='road' /> */}
                <ItemViewDefault styleView={styles.contentTopView} value={confirmCosts} iconName='hotel' />
                {showItem &&
                    <View>
                        <ItemViewDefault styleView={styles.contentTopView} value={prevCosts} iconName='calendar-alt' />
                        <ItemViewDefault styleView={styles.contentTopView} value={waitCosts} iconName='road' />

                        <ItemViewDefault styleView={styles.contentTopView} value={nextCosts} iconName='utensils' />
                        <ItemViewDefault styleView={styles.contentTopView} value={cancelCosts} iconName='utensils' />
                    </View>
                }
            </View>
        </TouchableOpacity>
    )
}
const ItemViewDefault = ({ value, iconName, styleView }) => {
    const { appcolor } = useSelector((state) => state.GAppState)
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
            <Icon type="font-awesome-5" name={iconName} size={14} color={appcolor.white} style={{ width: 30, padding: 5 }} />
            <Text style={styleView}>
                {value}
            </Text>
        </View>
    )
}

