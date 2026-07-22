import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import { useSelector } from 'react-redux'
import { Button, Divider, Icon } from '@rneui/themed'
import { HeaderCustom } from '../../../../Content/HeaderCustom'
import CustomTab from '../../../../Control/Custom/CustomTab'
import CustomListView from '../../../../Control/Custom/CustomListView'
import { REPORT } from '../../../../API/ReportAPI'
import { formatNumber, removeVietnameseTones } from '../../../../Core/Helper'
import { deviceHeight, deviceWidth, fontWeightBold } from '../../../../Themes/AppsStyle'
import LoadingDefault from '../../../../Control/ItemLoading/LoadingDefault'
import ProgramDetails from '../Page/ProgramDetails'
import { toastError } from '../../../../Utils/configToast'
import { SearchData } from '../../../../Control/SearchData/SearchData'
import { INVOICE_API } from '../../../../API/InvoiceAPI'
import { alertConfirm } from '../../../../Core/Utility'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import { FilterStatusVerify } from '../Control/FilterStatusVerify'
import moment from 'moment'
import _ from 'lodash'

const VERIFY_TYPE_ID = {
    PHOTO_REVIEW: 1,
    INVOICE: 4,
    DELIVERY_SLIP: 2,
}
const ApprovalStatusScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [dataGroup, setDataGroup] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, _setSearch] = useState({ text: '', isSearch: false, type: null, createByKeyword: '', createByList: [], dealerKeyword: '', dealerList: [] })
    const [_mutate, setMutate] = useState(false)
    const uniqueCreators = useMemo(
        () =>
            _.chain(dataMain)
                .map(e => (e.createBy || '').trim())
                .filter(Boolean)
                .uniq()
                .sortBy(name => removeVietnameseTones(name).toLowerCase())
                .value(),
        [dataMain],
    )

    const hasMultipleCreators = uniqueCreators.length > 1
    const uniqueDealers = useMemo(
        () =>
            _.chain(dataMain)
                .map(e => (e.dealerName || '').trim())
                .filter(Boolean)
                .uniq()
                .sortBy(name => removeVietnameseTones(name).toLowerCase())
                .value(),
        [dataMain],
    )

    const hasMultipleDealers = uniqueDealers.length > 1

    const creatorSuggestions = useMemo(() => {
        const createBySearch = removeVietnameseTones(search.createByKeyword || '').toLowerCase().trim()
        const creatorList = uniqueCreators

        if (!createBySearch) return creatorList.slice(0, 12)

        return _.filter(
            creatorList,
            name => removeVietnameseTones(name).toLowerCase().includes(createBySearch),
        ).slice(0, 12)
    }, [search.createByKeyword, uniqueCreators])
    const dealerSuggestions = useMemo(() => {
        const dealerSearch = removeVietnameseTones(search.dealerKeyword || '').toLowerCase().trim()
        const dealerList = uniqueDealers

        if (!dealerSearch) return dealerList.slice(0, 12)

        return _.filter(
            dealerList,
            name => removeVietnameseTones(name).toLowerCase().includes(dealerSearch),
        ).slice(0, 12)
    }, [search.dealerKeyword, uniqueDealers])

    const LoadData = async () => {
        await setLoading(true)
        const params = {
            shopId: shopinfo.shopId || 0,
            reportId: kpiinfo.id
        }
        await REPORT.GetDataReportByShop_RealTime(params, async (mData, message) => {
            message && toastError('Thông báo', message)
            const grouplist = _.unionBy(mData, 'confirmStatus');
            setData(mData)
            setDataMain(mData)
            setDataGroup(grouplist);
        })
        await setLoading(false)
    }
    // 
    const handlerUpdateLocked = (item, dataSend) => {
        const dataUpdate = _.map(dataSend, (e) => {
            if (e.id === item.id) {
                return item
            }
            return e
        })
        if (dataUpdate.length === 0) return;
        setData(dataUpdate)
    }
    // Actions
    const onShowFilterSheet = () => {
        SheetManager.show('approval-filter-sheet')
    }
    const onSelectFilter = (type) => {
        const typeSelected = search.type === type ? null : type
        search.type = typeSelected
        setMutate(e => !e)
    }
    const onChangeCreateBy = (text) => {
        search.createByKeyword = text
        setMutate(e => !e)
    }
    const onChangeDealer = (text) => {
        search.dealerKeyword = text
        setMutate(e => !e)
    }
    const onApplyFilter = () => {
        const dataUpdate = _searchData({
            data: dataMain,
            filterType: search.type,
            searchText: search.text,
            createByList: hasMultipleCreators ? search.createByList : [],
            dealerList: hasMultipleDealers ? search.dealerList : [],
        })
        const dataShow = _.map(dataUpdate, (e) => { return { ...e, isShowStore: search.type ? true : false } })
        setData(dataShow)
        SheetManager.hide('approval-filter-sheet')
    }
    const onSelectCreator = (name) => {
        const currentList = search.createByList || []
        search.createByList = currentList.includes(name)
            ? _.filter(currentList, creator => creator !== name)
            : [...currentList, name]
        setMutate(e => !e)
    }
    const onSelectDealer = (name) => {
        const currentList = search.dealerList || []
        search.dealerList = currentList.includes(name)
            ? _.filter(currentList, dealer => dealer !== name)
            : [...currentList, name]
        setMutate(e => !e)
    }
    const onClearFilter = () => {
        search.type = null
        search.createByKeyword = ''
        search.createByList = []
        search.dealerKeyword = ''
        search.dealerList = []
        setMutate(e => !e)
        const dataUpdate = _searchData({
            data: dataMain,
            filterType: null,
            searchText: search.text,
            createByList: [],
            dealerList: [],
        })
        setData(dataUpdate)
        SheetManager.hide('approval-filter-sheet')
    }
    const onExpanded = (item, keyExpanded) => {
        item[keyExpanded] = !item[keyExpanded]
        setMutate(e => !e)
    }
    const onSearchData = (text) => {
        search.text = text
        setMutate(e => !e)
        //
        const dataFilter = _searchData({
            data: dataMain,
            filterType: search.type,
            searchText: text,
            createByList: hasMultipleCreators ? search.createByList : [],
            dealerList: hasMultipleDealers ? search.dealerList : [],
        })
        setData(dataFilter)
    }
    const onShowUploadBill = (item) => {
        navigation.navigate('uploadbill', { item })
    }
    const onShowUploadInvoice = (item) => {
        navigation.navigate('uploaddeliveryslip', { data: item, dataSend: data })
    }
    const onCancelRegister = (item) => {
        alertConfirm('Thông báo', 'Bạn có muốn hủy yêu cầu đăng kí gói trưng bày của cửa hàng này không', async () => {
            await INVOICE_API.UpdateInvoice('CANCEL', item, LoadData)
        })
    }
    const _searchData = ({ data, filterType, searchText, createByList, dealerList }) => {
        const valueSearch = removeVietnameseTones(searchText || '').toLowerCase()
        const normalizedCreateByList = _.map(createByList || [], name => removeVietnameseTones(name || '').toLowerCase().trim())
        const normalizedDealerList = _.map(dealerList || [], name => removeVietnameseTones(name || '').toLowerCase().trim())
        const statusMap = {
            FILTER_UNVERIFIED_DELIVERY_SLIP: (e) => e.isDoneDelivery !== 1,
            FILTER_VERIFIED_DELIVERY_SLIP: (e) => e.isDoneDelivery === 1,

            FILTER_UNVERIFIED_PHOTO_REVIEW: (e) => e.isDoneEvalute !== 1,
            FILTER_VERIFIED_PHOTO_REVIEW: (e) => e.isDoneEvalute === 1,

            FILTER_UNVERIFIED_INVOICE: (e) => e.isDoneInvoice !== 1,
            FILTER_VERIFIED_INVOICE: (e) => e.isDoneInvoice === 1,
        }

        // Map verifyId
        const verifyIdMap = {
            PHOTO_REVIEW: VERIFY_TYPE_ID.PHOTO_REVIEW,
            INVOICE: VERIFY_TYPE_ID.INVOICE,
            DELIVERY_SLIP: VERIFY_TYPE_ID.DELIVERY_SLIP,
        }

        const getVerifyId = (type) =>
            Object.keys(verifyIdMap).find(k => type?.includes(k))
                ? verifyIdMap[Object.keys(verifyIdMap).find(k => type?.includes(k))]
                : null

        return _.filter(data, (e) => {
            const matchSearch =
                !valueSearch ||
                removeVietnameseTones(e.programName).toLowerCase().includes(valueSearch) ||
                removeVietnameseTones(e.shopName).toLowerCase().includes(valueSearch) ||
                removeVietnameseTones(e.dealerName).toLowerCase().includes(valueSearch) ||
                removeVietnameseTones(e.address).toLowerCase().includes(valueSearch) ||
                removeVietnameseTones(e.addressDealer).toLowerCase().includes(valueSearch)

            if (!matchSearch) return false

            const createByValue = removeVietnameseTones(e.createBy || '').toLowerCase().trim()
            const matchCreateBy =
                normalizedCreateByList.length === 0 ||
                normalizedCreateByList.includes(createByValue)

            if (!matchCreateBy) return false

            const dealerValue = removeVietnameseTones(e.dealerName || '').toLowerCase().trim()
            const matchDealer =
                normalizedDealerList.length === 0 ||
                normalizedDealerList.includes(dealerValue)

            if (!matchDealer) return false

            const verifyId = getVerifyId(filterType)
            if (verifyId) {
                let verifyResult = JSON.parse(e.verifyResult || '[]')
                const hasVerify = verifyResult.some(v => v.id === verifyId)
                if (!hasVerify) return false
            }

            //
            const statusFn = statusMap[filterType]
            if (statusFn && !statusFn(e)) return false

            return true
        })
    }

    useEffect(() => {
        const _updateLocked = DeviceEventEmitter.addListener('UPDATE_LOCKED_DELIVERY_SLIP', handlerUpdateLocked)
        LoadData()
        return () => {
            _updateLocked.remove()
        }
    }, [])

    //
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        card: { backgroundColor: appcolor.light, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, padding: 8, margin: 8, elevation: 3, shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, },
        cardHeader: { alignItems: 'flex-start' },
        programName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 24, minWidth: 80, },
        statusText: { fontSize: 12, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        label: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
        value: { fontSize: 13, color: appcolor.dark, fontWeight: '500' },
        subValue: { fontSize: 11, color: appcolor.placeholderText, fontStyle: 'italic' },
        subConfirmValue: { fontSize: 12, color: appcolor.dark, fontStyle: 'italic' },
        shopRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
        shopImage: { width: 86, height: 86, borderRadius: 80, backgroundColor: appcolor.surface, marginRight: 8 },
        shopInfo: { width: '75%', marginEnd: 8 },
        cardContent: { backgroundColor: appcolor.surface, padding: 8, borderRadius: 8, marginBottom: 8, marginTop: 4 },
        headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        cardPressable: { paddingBottom: 4 },
        webView: { width: deviceWidth, height: deviceHeight },
        createDate: { alignItems: 'center' },
        viewMore: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
        cardContentItem: { flexDirection: 'row', alignItems: 'center', },
        itemContentProgram: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        buttonContainer: { width: 60, alignSelf: 'center', borderRadius: 8, overflow: 'hidden' },
        buttonUpload: { width: 60, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.primary, padding: 6, paddingHorizontal: 16 },
        titleButtonUpload: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.red },
        overflowView: { width: '100%', height: '100%', position: 'absolute', zIndex: 1, backgroundColor: appcolor.dark, opacity: 0.65, justifyContent: 'center' },
        actionSheetContainer: { paddingBottom: 24 },
        itemContentVerify: { flexDirection: 'row', alignItems: 'center' },
    })
    const renderItem = ({ item }) => {
        const onPress = () => onExpanded(item, 'isShowDetail')
        const onShowUpload = () => onShowUploadBill(item)
        const onPressUploadInvoice = () => onShowUploadInvoice(item)
        const onCancel = () => onCancelRegister(item)
        const dataVerrify = JSON.parse(item.verifyResult || '[]')
        const isShowDetail = item.isShowDetail || false
        return (
            <View style={[styles.card, { shadowColor: appcolor.light, borderWidth: 1 }]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.cardPressable}
                    onPress={onPress}>
                    <View style={styles.itemContentProgram}>
                        <Text style={[styles.label, { width: '50%' }]}>{`${item.fromDate} - ${item.toDate}`}</Text>
                        {item.isCancel == 1 ?
                            <Button
                                type="outline"
                                icon={<Icon type='font-awesome-5' name='trash' color={appcolor.red} size={16} />}
                                containerStyle={styles.buttonContainer}
                                buttonStyle={[styles.buttonUpload, { borderColor: appcolor.red }]}
                                titleStyle={styles.titleButtonUpload}
                                onPress={onCancel}
                            />
                            :
                            <View style={styles.viewRow}>
                                {item.isDoneInvoice == 0 && item.isUploadBill == 1 &&
                                    <Button
                                        type="outline"
                                        icon={<Icon type='font-awesome-5' name='file-pdf' color={appcolor.primary} size={16} />}
                                        containerStyle={[styles.buttonContainer, { marginEnd: 4 }]}
                                        buttonStyle={styles.buttonUpload}
                                        titleStyle={[styles.titleButtonUpload, { color: appcolor.primary }]}
                                        onPress={onShowUpload}
                                    />
                                }
                                {item.isDoneDelivery == 0 &&
                                    <Button
                                        type="outline"
                                        icon={<Icon type='font-awesome-5' name='file-alt' color={appcolor.primary} size={16} />}
                                        containerStyle={styles.buttonContainer}
                                        buttonStyle={styles.buttonUpload}
                                        titleStyle={[styles.titleButtonUpload, { color: appcolor.primary }]}
                                        onPress={onPressUploadInvoice}
                                    />
                                }
                            </View>
                        }
                    </View>
                    {dataVerrify.length > 0 &&
                        <CustomListView
                            data={dataVerrify}
                            renderItem={renderItemVerify}
                            bottomView={{ paddingBottom: 0 }}
                        />
                    }
                    <Divider color={appcolor.gray} style={{ marginTop: 8 }} />
                    <View style={styles.itemContentProgram}>
                        <View style={[styles.cardHeader, { width: '95%' }]}>
                            <View style={[styles.shopRow, { padding: 4 }]}>
                                <Icon name='business' type='ionicon' color={appcolor.dark} size={16} />
                                <View style={{ marginStart: 8 }}>
                                    <Text style={styles.label}>{item.shopName}</Text>
                                    <Text style={styles.subValue}>{item.shopCode}</Text>
                                    <Text style={styles.subValue}>{item.address}</Text>
                                </View>
                            </View>
                            <View style={[styles.shopRow, { padding: 4 }]}>
                                <Icon name='home' type='ionicon' color={appcolor.dark} size={16} />
                                <View style={{ marginStart: 8 }}>
                                    <Text style={styles.label}>{item.dealerName}</Text>
                                    <Text style={styles.subValue}>{item.addressDealer}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.viewMore}>
                        <Icon type='ionicon' name={!isShowDetail ? 'chevron-down' : 'chevron-up'} size={16} color={appcolor.gray} />
                    </View>
                </TouchableOpacity>
                <ProgramDetails
                    isShowDetails={isShowDetail}
                    item={item}
                />
                <Divider color={appcolor.gray} style={{ marginBottom: 8 }} />
                <View style={styles.createDate}>
                    <Text style={styles.subValue}>{`Tạo bởi: ${item.createBy} - ${moment(item.createdDate).fromNow()}`}</Text>
                    {item.confirm !== 3 && <Text style={[styles.subValue, { color: appcolor[item.confirmColor] }]}>{`Xác nhận từ ${item.fullName} - ${moment(item.confirmDate).fromNow()}`}</Text>}
                    {item.confirmNote && <Text style={[styles.subValue, { color: appcolor[item.confirmColor] }]}>{`Ghi chú: ${item.confirmNote}`}</Text>}
                </View>
            </View>
        )
    }
    const renderItemVerify = ({ item, index }) => {
        return (
            <View style={styles.itemContentVerify}>
                <Text style={[styles.subValue, { textDecorationLine: item.isDone === 1 ? 'line-through' : 'none' }]}>{index + 1}. {item.name}</Text>
                {item.isDone !== undefined && <Icon type='ionicon' name={item.isDone === 1 ? 'checkmark' : 'close'} size={16} color={item.isDone === 1 ? appcolor.success : appcolor.danger} />}
            </View>
        )
    }
    const renderItemGroup = ({ item }) => {
        const onPress = () => onExpanded(item, 'isShowStore')
        const dataDetails = _.filter(data, (e) => (e.confirmStatus == item.confirmStatus && e.programId == item.programId))
        const verifyList = JSON.parse(item.verifyList || '[]')
        const isShowStore = item.isShowStore || false
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={onPress}>
                    <View style={styles.headerContent}>
                        <View style={{ width: '95%' }}>
                            <Text style={styles.programName}>{item.programName}</Text>
                            <Text style={[styles.subValue, { fontSize: 12 }]}>{`Tổng ${dataDetails.length} cửa hàng tham gia: `}</Text>
                        </View>
                        <Icon type='ionicon' name={!isShowStore ? 'chevron-down' : 'chevron-up'} size={16} color={appcolor.gray} />
                    </View>
                    <View style={[styles.card, { backgroundColor: appcolor.surface, shadowColor: appcolor.light }]}>
                        <View style={styles.itemContentProgram}>
                            <Text style={styles.subConfirmValue}>{`Loại chương trình: `}</Text>
                            <Text style={styles.value}>{item.programTypeName || '--'}</Text>
                        </View>
                        <View style={styles.itemContentProgram}>
                            <Text style={styles.subConfirmValue}>{`Hình thức thưởng: `}</Text>
                            <Text style={styles.value}>
                                {item.awardValue ? `${formatNumber(item.awardValue, ',')} ${item.awardTypeName || ''}` : '--'}
                            </Text>
                        </View>
                        {item.targetAmount ? (
                            <View style={styles.itemContentProgram}>
                                <Text style={styles.subConfirmValue}>Doanh số mục tiêu: </Text>
                                <Text style={styles.value}>{formatNumber(item.targetAmount, ',')} VNĐ</Text>
                            </View>
                        ) : null}
                        {item.totalAwardValue ? (
                            <View style={styles.itemContentProgram}>
                                <Text style={styles.subConfirmValue}>Tổng thưởng: </Text>
                                <Text style={styles.value}>{formatNumber(item.totalAwardValue, ',')} VNĐ</Text>
                            </View>
                        ) : null}
                        {item.awardName && <Text style={[styles.value, { marginTop: 8 }]}>{item.awardName}</Text>}
                    </View>
                    {verifyList?.length > 0 &&
                        <View style={[styles.cardContent, { padding: 8, margin: 8 }]}>
                            <Text style={styles.label}>Dữ liệu cần xác minh</Text>
                            <CustomListView
                                data={verifyList}
                                renderItem={renderItemVerify}
                                bottomView={{ paddingBottom: 0 }}
                            />
                        </View>
                    }
                </TouchableOpacity>
                {isShowStore &&
                    <CustomListView
                        data={dataDetails}
                        ListHeader={<Text style={[styles.subValue, { textDecorationLine: 'underline', textAlign: 'center' }]}>Danh sách cửa hàng tham gia</Text>}
                        renderItem={renderItem}
                        bottomView={{ paddingBottom: 0 }}
                    />
                }
            </View >
        )
    }
    const renderTabItem = (tabItem) => {
        const dataByStatus = _.filter(data, (e) => e.confirmStatus == tabItem.confirmStatus)
        const dataGroupPrograms = _.unionBy(dataByStatus, 'programId')
        return (
            <CustomListView
                data={dataGroupPrograms}
                renderItem={renderItemGroup}
                onRefresh={LoadData}
            />
        )
    }
    if (loading) return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                iconRight="filter"
                rightType="ionicon"
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()} />
            <LoadingDefault isLoading={loading} styles={styles.loading} title={''} />
        </View>
    )
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
                rightFunc={onShowFilterSheet}
                iconRight="filter"
                rightType="ionicon"
            />
            <SearchData
                placeholder='Tìm kiếm dữ liệu'
                onSearchData={onSearchData}
                value={search.text}
            />
            <CustomTab
                keyTabName="confirmStatus"
                data={dataGroup}
                dataMain={data}
                renderItem={renderTabItem}
            />
            <ActionSheet
                id="approval-filter-sheet"
                containerStyle={[styles.actionSheetContainer, { backgroundColor: appcolor.light }]}
            >
                <FilterStatusVerify
                    selectedType={search.type}
                    createByValue={search.createByKeyword || ''}
                    selectedCreators={search.createByList || []}
                    dealerValue={search.dealerKeyword || ''}
                    selectedDealers={search.dealerList || []}
                    showCreateByFilter={hasMultipleCreators}
                    showDealerFilter={hasMultipleDealers}
                    suggestedCreators={creatorSuggestions}
                    suggestedDealers={dealerSuggestions}
                    onChangeCreateBy={onChangeCreateBy}
                    onChangeDealer={onChangeDealer}
                    onSelectCreator={onSelectCreator}
                    onSelectDealer={onSelectDealer}
                    onSelectFilter={onSelectFilter}
                    onApplyFilter={onApplyFilter}
                    onClearFilter={onClearFilter}
                />
            </ActionSheet>
        </View>
    )
}

export default ApprovalStatusScreen