import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { getlistTabCompetitor } from "../../Controller/DisplayController";
import { clearAllPromotionPrice, clearPromotionPriceByCat, getListPromotion, getPromotionResult, updateItemPricePromotion, uploadPromotionPrice } from "../../Controller/PromotionController";
import { _competitorId, _competitorName } from "../../Core/URLs";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { Icon, } from '@rneui/themed';
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
import { Message, MessageAction } from "../../Core/Helper";
import { LoadingView } from "../../Control/ItemLoading";
import { checkLockReport } from "../../Controller/ShopController";
import { getCompetitorProductBy } from "../../Controller/WorkController";
import { MutipleItemSelected } from "../../Control/MutipleItemSelected";
import { isIphoneX } from "../../Core/is-iphone-x";
import moment from "moment";
import { toastError, toastSuccess } from "../../Utils/configToast";
// import { getCompetitorProductBy } from "../../Controller/WorkController";
const HEADER_SIZE = Platform.OS == 'android' ? 60 : (isIphoneX() ? 90 : 20);

const listPromotiponType = [
    { id: 1, name: 'Khuyến mãi' },
    { id: 2, name: 'Tặng quà' },
]

const parsePriceText = (text) => {
    const value = text !== null && text !== undefined && text.toString().length > 0
        ? text.toString().replace(/,/g, '')
        : ''
    const numberValue = value === '' ? null : parseInt(value)
    return Number.isNaN(numberValue) ? null : numberValue
}

const formatPriceText = (value) => {
    if (value === null || value === undefined || value === '') return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getPriceError = (value, retailPrice, discountPrice) => {
    if (value === null || value === undefined || value === '') return 0
    if (value < 10000) return 1
    if (value % 1000 > 0) return 1
    if (retailPrice !== null && retailPrice !== undefined && discountPrice !== null && discountPrice !== undefined && retailPrice < discountPrice) return 1
    return 0
}

const hasPriceValue = (value) => value !== 'null' && value !== null && value !== undefined

const getPromotionInputRows = (rows = []) => {
    return rows.filter(it => hasPriceValue(it.retailPrice) || hasPriceValue(it.discountPrice) || it.promotionType !== null)
}

export const PromotionPriceReport = ({ navigation, route }) => {
    const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataTab: [], dataShow: [], dataShowF: [], dataTabByCompe: [], dataCompetitor: [] })
    const [showProgress, setProgress] = useState(false);
    const [Status, setStatus] = useState(0)
    const [isDone, setDone] = useState(false)
    const [_, setMutate] = useState(false)
    const [isLockReport, setLockReport] = useState(false)
    const lstReport = JSON.parse(kpiinfo?.reportItem || '{}')
    const [competitorName, setCompetitorName] = useState('')
    const [isClearByCate, setClearByCate] = useState({ isClearByCate: 0 })
    const [isClearAll, setIsClearAll] = useState(0)


    const loadData = async () => {
        await setProgress(true)
        const checkLock = await checkLockReport(shopinfo)
        await setLockReport(checkLock)
        let lstRes = await getPromotionResult(workinfo);
        let isUpload = lstRes.length > 0 ? (lstRes[0].upload || 0) : 0
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setStatus(isUpload)
        } else {
            await setStatus(1)
        }

        const competitors = await getCompetitorProductBy(_competitorId, lstReport?.isByType || 0);//list competitor
        const dataTab = await getlistTabCompetitor(_competitorId, lstReport?.isByType || 0)
        const lstTabByCompe = dataTab?.filter(it => it.divisionId === _competitorId)
        const dataShow = await getListPromotion(workinfo, lstReport?.isByType || 0)
        setData({ ...data, dataTab: dataTab, dataShow: dataShow, dataShowF: dataShow, dataTabByCompe: lstTabByCompe, dataCompetitor: competitors })
        setCompetitorName(_competitorName)
        setTimeout(async () => { await setProgress(false) }, 100)
    }

    useEffect(() => {
        loadData()
        return () => showProgress;
    }, [])
    const uploadAction = async () => {
        Keyboard.dismiss()
        let resPrice = getPromotionInputRows(data.dataShowF);
        let noteStr = '';
        if (Status === 1) {
            toastError("Cảnh báo", "Báo cáo đã khóa");
            return;
        }

        if (resPrice.length === 0) {
            toastError("Cảnh báo", "Vui lòng làm báo cáo");
            return;
        }

        let checkPrice = resPrice.filter(it => (it.retailPrice !== 'null' && it.retailPrice !== null) && it.discountPrice !== null && it.discountPrice !== 'null' && (it.discountPrice < 10000 || it.discountPrice % 1000 > 0 || it.retailPrice < 10000 || it.retailPrice % 1000 > 0));
        if (checkPrice.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkPrice[0].productId)
            toastError("Thông báo", 'Vui lòng nhập giá đúng định dạng.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkPricePromotion = resPrice.filter(it => (it.retailPrice !== 'null' && it.retailPrice !== null && it.retailPrice > 0) && (it.promotionType > 0 && it.promotionType !== 2) && (it.discountPrice === 'null' || it.discountPrice === null));
        if (checkPricePromotion.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkPricePromotion[0].productId)
            toastError("Thông báo", 'Bạn đã nhập Niêm yết nhưng chưa nhập Khuyến mãi.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let items = resPrice.filter(it => (it.retailPrice === 'null' || it.retailPrice === null) && (it.discountPrice !== 'null' && it.discountPrice !== null && it.discountPrice > 0));
        if (items.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === items[0].productId)
            toastError("Thông báo", 'Bạn đã nhập Khuyến mãi nhưng chưa nhập Niêm yết.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkDiscountPrice = resPrice.filter(it => (it.retailPrice !== 'null' && it.retailPrice !== null) && it.discountPrice !== null && it.discountPrice !== 'null' && (it.retailPrice < it.discountPrice));
        if (checkDiscountPrice.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkDiscountPrice[0].productId)
            toastError("Thông báo", 'Nhập giá niêm yết phải lớn hơn giá Khuyến mãi!.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkPromotionType = resPrice.filter(it => ((it.retailPrice !== 'null' && it.retailPrice !== null) || (it.discountPrice !== null && it.discountPrice !== 'null')) && it.promotionType === 0);
        if (checkPromotionType.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkPromotionType[0].productId)
            toastError("Thông báo", 'Bạn chưa chọn loại khuyến mãi!.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkIsSelectType = resPrice.filter(it => ((it.retailPrice === 'null' || it.retailPrice === null) && (it.discountPrice === null || it.discountPrice === 'null')) && it.promotionType > 0);
        if (checkIsSelectType.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkIsSelectType[0].productId)
            toastError("Thông báo", 'Bạn đã chọn loại khuyến mãi nhưng chưa nhập giá!.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkLenghtGiftName = resPrice.filter(it => (it.promotionType == 2 && (it.giftName?.length > 0 && it.giftName?.length < 5)));
        if (checkLenghtGiftName.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkLenghtGiftName[0].productId)
            toastError("Thông báo", 'Tên quà tặng quá ngắn, tối thiểu 5 kí tự!.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let checkPromotionGift = resPrice.filter(it => (it.promotionType == 2 && (it.giftName == null || it.giftName === '' || (it.giftName?.length > 0 && it.giftName?.length < 5))));
        if (checkPromotionGift.length > 0) {
            let product = data.dataShowF.filter(it => it.productId === checkPromotionGift[0].productId)
            toastError("Thông báo", 'Bạn chọn tặng quà nhưng chưa nhập tên quà tặng!.' + (data.dataTab.length > 1 ? (' - Ngành hàng : ' + product[0].categoryName) : '') + '\n- Sản phẩm: ' + product[0].productName);
            return;
        }

        let itemsUpload = resPrice.filter(it => it.retailPrice !== 'null' && it.retailPrice !== null);
        if (itemsUpload.length === 0) {
            toastError("Cảnh báo", 'Vui lòng làm báo cáo');
            return;
        }

        if (noteStr !== '') {
            toastError("Cảnh báo", noteStr);
            return
        }

        for (const item of itemsUpload) {
            await updateItemPricePromotion(item)
        }

        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload));
    }
    const UploadData = async (resPrice) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            toastError("Cảnh báo", "Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await uploadPromotionPrice(resPrice, work, async () => {
            await loadData();
        }, async () => {
            // await setProgress(false);
        })
    }

    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = data.dataShowF.filter(it =>
                it.retailPrice !== null && it.retailPrice >= 0
                || it.discountPrice !== null && it.discountPrice >= 0)
        else
            dataSearch = data.dataShowF

        if (text !== null && text.length > 0) {
            const mResult = await dataSearch.filter((it) => {
                const nameProduct = it.productName ? it.productName.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return nameProduct.indexOf(textData) > -1
            })
            data.dataShow = mResult;
        } else {
            data.dataShow = dataSearch;
        }
        setMutate(e => !e)
    }

    const openSheet = () => {
        Keyboard.dismiss()
        SheetManager.show('actionStock')
    }
    const handlerSelectCompetitor = async (item) => {
        await setProgress(true)
        await setCompetitorName(item.itemName)
        const dataTabByCompe = data.dataTab.filter(it => it.divisionId == item.id)
        data.dataTabByCompe = dataTabByCompe
        await setProgress(false)
    }
    const ViewItemPromotion = () => {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS === "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
                {
                    data.dataTabByCompe.length > 0 &&
                    <ViewContent data={data} showProgress={showProgress} isClearByCate={isClearByCate} isClearAll={isClearAll} Status={Status} />
                }
            </KeyboardAvoidingView>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                title={kpiinfo.menuNameVN}
                iconRight={!isLockReport ? (Status !== 1 ? 'cloud-upload-alt' : null) : 'user-lock'}
                rightFunc={!isLockReport ? (Status !== 1 ? () => uploadAction() : null) : () => { toastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo') }}
                middleFunc={openSheet}
                iconMiddle='poll-h'
            />

            <View style={{ backgroundColor: appcolor.light, width: '100%', height: Dimensions.get('window').height - HEADER_SIZE }}>
                <FormGroup
                    editable
                    containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, alignSelf: 'center' }}
                    inputStyle={{ fontSize: 14, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm'
                    iconName='search'
                    onClearTextAndroid={filterProduct}
                    handleChangeForm={filterProduct}
                />
                {
                    lstReport?.isByType === 1 &&
                    <MutipleItemSelected
                        typeItem={'COMPETITOR'}
                        containerStyle={{ flexGrow: 0 }}
                        dataItems={data.dataCompetitor}
                        defaultValue={competitorName}
                        onItemChoose={handlerSelectCompetitor}
                    />
                }
                <ViewItemPromotion />
            </View>
            {
                showProgress &&
                <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
        </View>
    )
}
const ViewContent = ({ data, Status }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [dataTab, setDataTab] = useState([])
    const [isDone, setDone] = useState(false)
    const [isClearByCate, setClearByCate] = useState({ isClearByCate: 0, isClear: 0, isClearAll: 0 })
    const tabRef = useRef()
    const [mode, setMode] = useState('TOOLS');

    const loadDataTab = async () => {
        await setDataTab(data.dataTabByCompe)
    }

    useEffect(() => {
        loadDataTab()
        return () => false
    }, [data.dataTabByCompe])

    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllPromotionPrice(workinfo);
                    await clearAll()
                    await setDone(false)
                    await setClearByCate({ ...isClearByCate, isClear: isClearByCate.isClear + 1, isClearAll: 1 })
                    SheetManager.hide('actionStock')
                })
        } else {
            toastError("Cảnh báo", 'Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            SheetManager.hide('actionStock')
        }
    }
    const handlerClearByCategory = async (itemCategory) => {
        if (Status != 1) {
            MessageAction(`Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} thuộc hãng ${itemCategory.division} đã nhập không ?`, async () => {
                await clearPromotionPriceByCat(workinfo, itemCategory)
                await clearDataByCate(itemCategory)
                await setClearByCate({ ...itemCategory, isClearByCate: isClearByCate.isClearByCate + 1 })
                SheetManager.hide('actionStock')
            })
        } else {
            toastError("Cảnh báo", 'Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            SheetManager.hide('actionStock')
        }
    }
    const clearAll = () => {
        data.dataShowF.map(it => {
            it.retailPrice = null
            it.discountPrice = null
            it.promotionType = 0
            it.giftName = ""
            it.retailError = 0
            it.discountError = 0
        })
        data.dataShow = data.dataShowF
    }
    const clearDataByCate = (itemCategory) => {
        data.dataShow.map(it => {
            if (it.categoryId == itemCategory.categoryId && it.divisionId == itemCategory.divisionId) {
                it.retailPrice = null
                it.discountPrice = null
                it.promotionType = 0
                it.giftName = ""
                it.retailError = 0
                it.discountError = 0
            }
        })
        data.dataShowF.map(it => {
            if (it.categoryId == itemCategory.categoryId && it.divisionId == itemCategory.divisionId) {
                it.retailPrice = null
                it.discountPrice = null
                it.promotionType = 0
                it.giftName = ""
                it.retailError = 0
                it.discountError = 0
            }
        })
    }

    const filterDoneData = async () => {
        if (!isDone) {
            let lstRes = data.dataShow.filter(it => it.retailPrice !== null && it.retailPrice >= 0 || it.discountPrice !== null && it.discountPrice >= 0 || it.promotionType > 0)
            data.dataShow = lstRes;
        } else {
            data.dataShow = data.dataShowF;
        }
        await setDone(e => !e)
    }

    const ViewItem = () => {
        return (
            dataTab.map((it, indexCate) => {
                let dataByCategoryId = []
                dataByCategoryId = data.dataShow?.filter(i => i.categoryName === it.categoryName && i.divisionId == it.divisionId)
                const totalRow = dataByCategoryId?.length || 0
                return (
                    <Tabs.Tab key={`TV_IIT_${indexCate}`}
                        label={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`}
                        name={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} >
                        <ViewListItem dataByCategoryId={dataByCategoryId} indexCate={indexCate} data={data} isClearByCate={isClearByCate} />
                    </Tabs.Tab>
                )
            })
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {
                (dataTab?.length === data.dataTabByCompe.length) &&
                <Tabs.Container
                    ref={tabRef}
                    key={'TapCategory'}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.dark }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.light }}
                            tabStyle={{ minWidth: minWidthTab(dataTab), height: 38 }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    {ViewItem()}
                </Tabs.Container>
            }
            <ActionSheet
                id="actionStock"
                gestureEnabled
                defaultOverlayOpacity={0.25}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.surface }}>
                <View style={{ padding: 14, width: '100%' }}>
                    {mode == 'TOOLS' &&
                        <ToolsAction
                            clearAllData={setClearAll}
                            clearByCategory={handlerClearByCategory}
                            itemInput={filterDoneData}
                            dataTab={data.dataTabByCompe}
                            tabRef={tabRef}
                            showInputView={isDone}
                            isLock={Status === 1}
                        />
                    }
                </View>
            </ActionSheet>
        </View>

    )
}

const ViewListItem = ({ dataByCategoryId, indexCate, data, isClearByCate }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const renderItem = useCallback(({ item, index }) => {
        return (<RenderItemProduct item={item} index={index} data={data} appcolor={appcolor} listPromotiponType={listPromotiponType} isClearByCate={isClearByCate} />)
    }, [appcolor, data, isClearByCate])

    return (
        <Tabs.FlatList
            key={`item_cate_${indexCate}`}
            keyExtractor={(item, index) => `${item.Id || item.productId || index}`}
            style={{ width: '100%', marginTop: 5, width: deviceWidth, backgroundColor: appcolor.light, padding: 5 }}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            data={dataByCategoryId}
            ListFooterComponent={<Text style={{ height: deviceHeight / 2, textAlign: 'center' }} >Đã xem hết</Text>}
            renderItem={renderItem}
        />
    )
}

const RenderItemProductComponent = ({ item, index, data, listPromotiponType, appcolor, reload, isClearByCate }) => {
    const [inputRetailPrice, setInputRetail] = useState(item.retailPrice || '')
    const [inputDiscountPrice, setInputDiscount] = useState(item.discountPrice || '')
    const [promotionType, setPromotionType] = useState(item.promotionType || 0)
    const [inputGiftName, setInputGiftName] = useState(item.giftName != 'null' ? item.giftName : '')
    const [retailError, setRetailError] = useState(item.retailError || 0)
    const [discountError, setDiscountError] = useState(item.discountError || 0)
    const promotionSheet = useRef()
    const countClear = useRef(0)
    const styles = useMemo(() => StyleSheet.create({
        card: { backgroundColor: appcolor.surface, width: '100%', marginTop: 6, borderRadius: 8, padding: 10 },
        productName: { fontSize: 14, fontWeight: '700', color: appcolor.dark, lineHeight: 19 },
        productCode: { color: appcolor.dark, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
        controlRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
        selectButton: { flex: 1.05, minHeight: 42, backgroundColor: appcolor.light, borderRadius: 8, borderColor: appcolor.greydark, borderWidth: 0.5, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
        selectText: { color: appcolor.dark, fontSize: 13, fontWeight: '600', textAlign: 'center' },
        priceInput: { flex: 1, minHeight: 42, fontSize: 13, color: appcolor.dark, fontWeight: '600', textAlign: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greydark, paddingHorizontal: 6 },
        giftInput: { borderWidth: 0.5, borderColor: appcolor.greydark, borderRadius: 8, marginTop: 8 },
        sheetContent: { paddingHorizontal: 14, paddingBottom: 24 },
        sheetHeader: { alignItems: 'center', paddingTop: 8, paddingBottom: 12 },
        sheetTitle: { fontSize: 17, fontWeight: '700', color: appcolor.dark },
        sheetSubTitle: { fontSize: 12, color: appcolor.greydark, marginTop: 4 },
        typeOption: { width: '100%', minHeight: 50, paddingHorizontal: 12, marginTop: 8, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.greydark, backgroundColor: appcolor.surface, flexDirection: 'row', alignItems: 'center' },
        typeOptionActive: { borderColor: appcolor.primary, backgroundColor: appcolor.light },
        typeOptionText: { flex: 1, fontSize: 14, color: appcolor.dark, fontWeight: '600' },
        typeOptionTextActive: { color: appcolor.primary },
    }), [appcolor])

    const resetInput = useCallback(() => {
        item.retailPrice = null, item.discountPrice = null, item.promotionType = 0, item.giftName = '', item.retailError = 0, item.discountError = 0
        setInputRetail('')
        setInputDiscount('')
        setPromotionType(0)
        setInputGiftName('')
        setRetailError(0)
        setDiscountError(0)
    }, [item])

    useEffect(() => {
        if (isClearByCate.isClear !== 0 && (isClearByCate.isClear - countClear.current > 0)) {
            countClear.current = isClearByCate.isClear
            resetInput()
        }
    }, [isClearByCate.isClear, resetInput])

    useEffect(() => {
        if (isClearByCate.isClearByCate !== 0
            && (isClearByCate.isClearByCate - countClear.current > 0)
            && isClearByCate.categoryId === item.categoryId
            && isClearByCate.divisionId === item.divisionId) {
            countClear.current = isClearByCate.isClearByCate
            resetInput()
        }
    }, [isClearByCate, item.categoryId, item.divisionId, resetInput])

    const syncPriceToData = useCallback((priceType, intValue, isError) => {
        item[priceType] = intValue
        if (priceType === 'retailPrice') {
            item.retailError = isError
        } else {
            item.discountError = isError
        }
        const indexF = data.dataShowF.findIndex(it => it.Id === item.Id)
        const index = data.dataShow.findIndex(it => it.Id === item.Id)
        if (index >= 0) {
            data.dataShow[index][priceType] = intValue
            data.dataShow[index][priceType === 'retailPrice' ? 'retailError' : 'discountError'] = isError
        }
        if (indexF >= 0) {
            data.dataShowF[indexF][priceType] = intValue
            data.dataShowF[indexF][priceType === 'retailPrice' ? 'retailError' : 'discountError'] = isError
        }
    }, [data, item])

    const syncPriceErrorsToData = useCallback((nextRetailError, nextDiscountError) => {
        item.retailError = nextRetailError
        item.discountError = nextDiscountError
        const indexF = data.dataShowF.findIndex(it => it.Id === item.Id)
        const index = data.dataShow.findIndex(it => it.Id === item.Id)
        if (index >= 0) {
            data.dataShow[index].retailError = nextRetailError
            data.dataShow[index].discountError = nextDiscountError
        }
        if (indexF >= 0) {
            data.dataShowF[indexF].retailError = nextRetailError
            data.dataShowF[indexF].discountError = nextDiscountError
        }
    }, [data, item])

    const changeValuePromotion = useCallback((text, priceType) => {
        isClearByCate.isClearAll === 1 ? (isClearByCate.isClear - countClear.current > 0 ? (countClear.current = isClearByCate.isClear) : null)
            : (isClearByCate.isClearByCate - countClear.current > 0 ? (countClear.current = isClearByCate.isClearByCate) : null)

        const intValue = parsePriceText(text)
        const nextRetailPrice = priceType === 'retailPrice' ? intValue : item.retailPrice
        const nextDiscountPrice = priceType === 'discountPrice' ? intValue : item.discountPrice
        const nextRetailError = getPriceError(nextRetailPrice, nextRetailPrice, nextDiscountPrice)
        const nextDiscountError = getPriceError(nextDiscountPrice, nextRetailPrice, nextDiscountPrice)
        const isError = priceType === 'retailPrice' ? nextRetailError : nextDiscountError
        syncPriceToData(priceType, intValue, isError)
        syncPriceErrorsToData(nextRetailError, nextDiscountError)
        if (priceType === 'retailPrice') {
            setInputRetail(intValue || '')
        } else {
            setInputDiscount(intValue || '')
        }
        setRetailError(nextRetailError)
        setDiscountError(nextDiscountError)
    }, [isClearByCate, item, syncPriceErrorsToData, syncPriceToData])

    const endInputPromotion = useCallback(async (e, priceType) => {
        let intValue = parsePriceText(e.nativeEvent.text)
        let isError = 0
        if (intValue !== null && intValue < 10000) {
            item[priceType] = null
            intValue = null;
            isError = 1;
            toastError("Cảnh báo", "Nhập giá không được nhỏ 10.000!", "top");
        } else if (intValue % 1000 > 0) {
            item[priceType] = null
            intValue = null;
            isError = 1;
            toastError("Cảnh báo", "Nhập giá không được lẻ!", "top");
        } else if (item.retailPrice !== null && item.discountPrice !== null && item.retailPrice < item.discountPrice) {
            item[priceType] = null
            intValue = null;
            isError = 1;
            if (priceType === 'discountPrice') {
                toastError("Cảnh báo", "Nhập giá Khuyến mãi không được lớn hơn giá niêm yết!", "top");
            } else {
                toastError("Cảnh báo", "Nhập giá niêm yết phải lớn hơn giá Khuyến mãi!", "top");
            }
        } else {
            isError = 0
        }

        syncPriceToData(priceType, intValue, isError)
        const nextRetailPrice = priceType === 'retailPrice' ? intValue : item.retailPrice
        const nextDiscountPrice = priceType === 'discountPrice' ? intValue : item.discountPrice
        const nextRetailError = priceType === 'retailPrice' ? isError : getPriceError(nextRetailPrice, nextRetailPrice, nextDiscountPrice)
        const nextDiscountError = priceType === 'discountPrice' ? isError : getPriceError(nextDiscountPrice, nextRetailPrice, nextDiscountPrice)
        syncPriceErrorsToData(nextRetailError, nextDiscountError)
        if (priceType === 'retailPrice') {
            setInputRetail(intValue || '')
        } else {
            setInputDiscount(intValue || '')
        }
        setRetailError(nextRetailError)
        setDiscountError(nextDiscountError)
        await updateItemPricePromotion(item)
    }, [item, syncPriceErrorsToData, syncPriceToData])
    const onSelectType = () => {
        promotionSheet.current.show()
    }
    const onChangeGiftName = useCallback((text) => {
        item.giftName = text || ''
        const index = data.dataShow.findIndex(it => it.Id === item.Id)
        const indexF = data.dataShowF.findIndex(it => it.Id === item.Id)
        if (index >= 0) data.dataShow[index].giftName = text || '';
        if (indexF >= 0) data.dataShowF[indexF].giftName = text || '';
        setInputGiftName(text)
    }, [data, item])
    const onEndChangeGiftName = useCallback(async (e) => {
        let value = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString() : ''
        if (value.replace(/ /g, '').length > 0 && value.replace(/ /g, '').length < 5) {
            toastError("Cảnh báo", "Tên quà tặng quá ngắn, tối thiểu 5 kí tự!", "top");
            item.giftName = ''
            const index = data.dataShow.findIndex(it => it.Id === item.Id)
            const indexF = data.dataShowF.findIndex(it => it.Id === item.Id)
            if (index >= 0) data.dataShow[index].giftName = '';
            if (indexF >= 0) data.dataShowF[indexF].giftName = '';
            await setInputGiftName('')
            await updateItemPricePromotion(item)
            return;
        }
        await updateItemPricePromotion(item)
    }, [data, item])
    const onSelectItem = async (itemType) => {
        isClearByCate.isClearAll === 1 ? (isClearByCate.isClear - countClear.current > 0 ? (countClear.current = isClearByCate.isClear) : null)
            : (isClearByCate.isClearByCate - countClear.current > 0 ? (countClear.current = isClearByCate.isClearByCate) : null)

        if (promotionType === itemType.id) {
            item.promotionType = 0
            await setPromotionType(0)
        } else {
            item.promotionType = await itemType.id
            await setPromotionType(itemType.id)
        }
        if (itemType.id !== 2) {
            item.giftName = ''
            await setInputGiftName('')
        }
        const index = data.dataShow.findIndex(it => it.Id === item.Id)
        const indexF = data.dataShowF.findIndex(it => it.Id === item.Id)
        if (index >= 0) {
            data.dataShow[index].promotionType = item.promotionType
            data.dataShow[index].giftName = item.giftName
        }
        if (indexF >= 0) {
            data.dataShowF[indexF].promotionType = item.promotionType
            data.dataShowF[indexF].giftName = item.giftName
        }
        await updateItemPricePromotion(item)
        await promotionSheet.current.hide()
    }
    let type = promotionType === 0 ? 'Chọn loại' : (listPromotiponType.find(i => i.id === promotionType)?.name || 'Chọn loại')
    const retailPriceText = useMemo(() => formatPriceText(inputRetailPrice), [inputRetailPrice])
    const discountPriceText = useMemo(() => formatPriceText(inputDiscountPrice), [inputDiscountPrice])
    return (
        <View key={'item__ii_' + index} style={styles.card}>
            <Text numberOfLines={2} style={styles.productName}>{`${index + 1}. ${item.productName}`}</Text>
            <Text numberOfLines={1} style={styles.productCode}>{item.productCode}</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity
                    key={'promotionType' + index}
                    style={styles.selectButton}
                    onPress={() => onSelectType(item)}>
                    <Text numberOfLines={1} style={styles.selectText}>{type}</Text>
                </TouchableOpacity>
                <TextInput
                    textAlign={'center'}
                    value={retailPriceText}
                    style={[styles.priceInput, { backgroundColor: retailError === 1 ? appcolor.warning : appcolor.light }]}
                    keyboardType='numeric'
                    placeholder='Niêm yết'
                    placeholderTextColor={appcolor.greydark}
                    editable={item.upload !== 1}
                    selectTextOnFocus={item.upload !== 1}
                    onChangeText={text => changeValuePromotion(text, 'retailPrice')}
                    onEndEditing={e => endInputPromotion(e, 'retailPrice')}
                />
                <TextInput
                    textAlign={'center'}
                    value={discountPriceText}
                    style={[styles.priceInput, { backgroundColor: discountError === 1 ? appcolor.warning : appcolor.light }]}
                    keyboardType='numeric'
                    placeholder='Khuyến mãi'
                    placeholderTextColor={appcolor.greydark}
                    editable={item.upload !== 1}
                    selectTextOnFocus={item.upload !== 1}
                    onChangeText={text => changeValuePromotion(text, 'discountPrice')}
                    onEndEditing={e => endInputPromotion(e, 'discountPrice')}
                />
            </View>

            {promotionType === 2 &&
                <FormGroup
                    key={'promotionType' + index}
                    onClearTextAndroid={onChangeGiftName}
                    rightFunc={() => Platform.OS === 'ios' ? onChangeGiftName('') : null}
                    iconRight={Platform.OS === 'ios' ? 'times' : null}
                    value={inputGiftName}
                    containerStyle={styles.giftInput}
                    multiline
                    handleChangeForm={onChangeGiftName}
                    onEndEditing={onEndChangeGiftName}
                    placeholder={'Tên quà'}
                    placeholderTextColor={appcolor.greydark}
                    editable
                />
            }
            <ActionSheet
                key={'Sheet' + index}
                ref={promotionSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
            >
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Chọn loại khuyến mãi</Text>
                        <Text style={styles.sheetSubTitle}>Chạm lại loại đang chọn để bỏ chọn</Text>
                    </View>
                    <View style={{ width: '100%' }}>
                        {
                            listPromotiponType.map((itemType, indexType) => {
                                const isActive = promotionType === itemType.id
                                return (
                                    <TouchableOpacity
                                        key={`type_${itemType.id}_${indexType}`}
                                        onPress={() => { onSelectItem(itemType) }}
                                        style={[styles.typeOption, isActive && styles.typeOptionActive]}>
                                        <Text numberOfLines={1} style={[styles.typeOptionText, isActive && styles.typeOptionTextActive]}>{itemType.name}</Text>
                                        {isActive && <Icon type='font-awesome-5' name='check-circle' size={18} color={appcolor.primary} solid />}
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </ActionSheet>
        </View >
    )
}

const RenderItemProduct = memo(RenderItemProductComponent)

const ToolsAction = ({ clearAllData, clearByCategory, itemInput, tabRef, dataTab, showInputView = false, isLock = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isShowInput, setShowInput] = useState(showInputView)
    const itemTab = tabRef?.current !== null ? dataTab[tabRef?.current.getCurrentIndex()] : {}
    const styles = useMemo(() => StyleSheet.create({
        container: { width: '100%', paddingBottom: deviceHeight / 24 },
        title: { width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '700', color: appcolor.dark, marginBottom: 10 },
        subTitle: { width: '100%', textAlign: 'center', fontSize: 12, fontWeight: '500', color: appcolor.greydark, marginBottom: 8 },
        actionRow: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 8, borderRadius: 10, backgroundColor: appcolor.light },
        actionRowActive: { borderWidth: 0.8, borderColor: appcolor.success, backgroundColor: appcolor.surface },
        iconBox: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
        titleAction: { flex: 1, fontSize: 14, fontWeight: '600', color: appcolor.dark },
        dangerText: { color: appcolor.danger || appcolor.red },
    }), [appcolor])

    const onShow = () => {
        const isShow = !isShowInput
        itemInput(isShow)
        setShowInput(isShow)
    }
    const onDeleteAll = () => {
        clearAllData()
    }
    const onDeleteByCategory = () => {
        clearByCategory(itemTab)
    }
    const RenderButton = ({ title, iconName, iconColor, actionPress, isShowInput = false }) => {
        const isDanger = iconName === 'trash'
        return (
            <TouchableOpacity onPress={actionPress}>
                <View style={[styles.actionRow, isShowInput && styles.actionRowActive]}>
                    <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
                        <Icon type='font-awesome-5' name={iconName} size={17} color={iconColor} />
                    </View>
                    <Text numberOfLines={2} style={[styles.titleAction, isDanger && styles.dangerText]}>{title}</Text>
                    {isShowInput && <Icon type='font-awesome-5' name='check' size={14} color={appcolor.success} />}
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Công cụ</Text>
            <Text style={styles.subTitle}>Thao tác nhanh cho dữ liệu khuyến mãi</Text>
            <RenderButton
                title='Xem dữ liệu đã nhập'
                iconName='keyboard'
                iconColor={appcolor.success}
                isShowInput={isShowInput}
                actionPress={onShow} />
            {!isLock && <RenderButton
                title='Xoá tất cả dữ liệu'
                iconName='trash'
                iconColor={appcolor.red}
                actionPress={onDeleteAll} />
            }
            {!isLock && <RenderButton
                title={`Xoá dữ liệu ngành hàng ${itemTab.categoryName || ''}`}
                iconName='trash'
                iconColor={appcolor.red}
                actionPress={onDeleteByCategory} />
            }
        </View>
    )
}
