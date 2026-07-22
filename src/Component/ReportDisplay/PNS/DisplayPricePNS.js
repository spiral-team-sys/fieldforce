import React, { useCallback, useState, useEffect, useMemo } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from '@rneui/themed';
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import FormGroup from "../../../Content/FormGroup";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { actualPhoto, checkPhotoByProduct, clearAllDataDisplay, getDisplayProduct, getlistTabCompetitor, getListTagPOP, isPhotoNoData, updateItemDisplay, uploadDisplayPOP } from "../../../Controller/DisplayController";
import { checkLockReport } from "../../../Controller/ShopController";
import { getAllPhotos, getDisplayResult, getNoteDisplayReport, updateNoteDisplayReport } from "../../../Controller/WorkController";
import { cleanNumberString, formatNumber, groupDataByKey, Message, MessageAction, ToastSuccess } from "../../../Core/Helper";
import { _competitorId, _competitorName } from "../../../Core/URLs";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { LoadingView } from "../../../Control/ItemLoading";
import _, { debounce } from 'lodash';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import UploadController from "../../../Controller/UploadController";
import moment from "moment";
import CustomListView from "../../../Control/Custom/CustomListView";
import { toastError } from "../../../Utils/configToast";

const actionMode = {
    NOTE: 'NOTE',
    TAG_POP: 'TAG_POP',
    TAG_DISPLAY: 'TAG_DISPLAY',
    TOOLS: 'TOOLS'
}
const parseNumberInput = (text) => {
    const value = cleanNumberString(text, ',')
    return value.length > 0 ? parseInt(value, 10) : null
}
export const DisplayPricePNS = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(state => state.GAppState)
    const [settings, setSettings] = useState({ isLockReport: false, isUploaded: false })
    const [loading, setLoading] = useState(false)
    const [dataTagReport, setDataTagReport] = useState({ POP: [], Display: [] })
    const [dataTab, setDataTab] = useState([])
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [mode, setMode] = useState(null)
    const [itemNote, setItemNote] = useState({})
    const [isShowInput, setShowInput] = useState(false)
    const [tagItemView, setTagItemView] = useState({ popId: 0, popColor: appcolor.primary, displayId: 0, displayColor: appcolor.primary })
    const [isPOP, setPOPView] = useState(false)
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [photoByCategory, setPhotoByCategory] = useState([])
    const configReport = useMemo(() => JSON.parse(kpiinfo?.reportItem || '{}'), [kpiinfo?.reportItem])
    const reportId = kpiinfo.id || kpiinfo.kpiId
    const openActionSheet = useCallback((nextMode) => {
        setMode(nextMode)
        requestAnimationFrame(() => {
            SheetManager.show('actionDisplay')
        })
    }, [])
    const loadPhotoCount = useCallback(async () => {
        const listPhoto = await getAllPhotos(reportId, workinfo.shopId, workinfo.workDate)
        setPhotoByCategory(listPhoto || [])
    }, [reportId, workinfo.shopId, workinfo.workDate])
    const LoadData = async (nextActiveTabIndex = 0) => {
        setLoading(true)
        try {
            const [
                lockReport,
                lstResults,
                tagPOP,
                displayProduct,
                tabCompetitor,
                listPhoto
            ] = await Promise.all([
                checkLockReport(shopinfo),
                getDisplayResult(workinfo),
                getListTagPOP(),
                getDisplayProduct(workinfo),
                getlistTabCompetitor(_competitorId),
                getAllPhotos(reportId, workinfo.shopId, workinfo.workDate)
            ])
            const status = lstResults[0]?.upload == 1 || false
            const day = parseInt(moment(new Date()).format('YYYYMMDD'))
            const itemTag = displayProduct[0] || {}

            setSettings({ isLockReport: lockReport, isUploaded: workinfo.workDate === day ? status : true })
            setDataTagReport(tagPOP)
            setDataTab(tabCompetitor)
            setData(displayProduct)
            setDataMain(displayProduct)
            setPhotoByCategory(listPhoto || [])
            setActiveTabIndex(Math.min(nextActiveTabIndex, Math.max(tabCompetitor.length - 1, 0)))
            setTagItemView({
                popId: itemTag.tagPOPId,
                popColor: itemTag.popColor || appcolor.primary,
                displayId: itemTag.tagDisplayId,
                displayColor: itemTag.displayColor || appcolor.primary
            })
            setPOPView(configReport.isPOP == 1)
            setShowInput(false)
        } finally {
            setLoading(false)
        }
    }

    const contains = (item) => {
        if (item.quanity != null || item.price != null || item.fsmValue != null
            || item.quantitySuggest != null || item.quantityStock != null
            || item.displayArea != null || item.mockupValue != null
            || item.tagPOPId != null || item.productComment != null) {
            return true
        }
        return false;
    };
    const uploadAction = async () => {
        const isNetwork = await checkNetwork();
        if (!isNetwork) {
            toastError('Kết nối mạng', "Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        const listProduct = await getDisplayProduct(workinfo)
        const dataDisplay = _.filter(listProduct, item => {
            return contains(item);
        });

        const configData = JSON.parse(kpiinfo?.reportItem) || {}
        // const dataDisplay = await getDisplayResult(workinfo, kpiinfo.id)
        const configPhoto = configData.ImageByList || []
        const isConstraint = configData.isConstraint || 0
        const isPrice = configData.isPrice || 0 == 1
        const lstCheckPhoto = await checkPhotoByProduct(workinfo, kpiinfo.id)
        // Check Photo      
        if (isConstraint == 1) {
            for (let index = 0; index < lstCheckPhoto.length; index++) {
                const item = lstCheckPhoto[index];
                const configItem = configPhoto[item.categoryName]
                for (let j = 0; j < configItem.length; j++) {
                    const jItem = configItem[j];
                    const photoType = `${jItem.code}_${item.categoryName}`
                    const actual = await actualPhoto(workinfo, kpiinfo.id, photoType)
                    if (actual < jItem.numberIMG) {
                        toastError('Hình ảnh', `Chưa chụp đầy đủ hình ${jItem.name} ngành hàng ${item.categoryName} (${actual}/${jItem.numberIMG} tấm)`)
                        return
                    }
                }
            }
        }
        // Check Report 
        if (dataDisplay.length == 0) {
            toastError('Dữ liệu báo cáo', `Hoàn thành báo cáo trước khi gửi dữ liệu lên hệ thống`)
            return
        } else {
            for (let index = 0; index < dataDisplay.length; index++) {
                const item = dataDisplay[index];
                //
                // Check Price when Quantity > 0 
                if (isPrice && item.quanity !== null && item.quanity > 0) {
                    if (item.price == 'null' || item.price == null) {
                        toastError('Giá sản phẩm', `Giá sản phẩm ${item.productName} ngành hàng ${item.categoryName} chưa nhập`)
                        return
                    }
                }
                //
                if (item.price !== 'null' && item.price !== null && (item.price < 10000 || item.price % 1000 > 0)) {
                    toastError('Giá sản phẩm', `Giá sản phẩm ${item.productName} ngành hàng ${item.categoryName} sai định dạng`)
                    return
                }
                if ((item.quanity == 'null' || item.quanity == null) && (item.price !== 'null' && item.price !== null && item.price > 0)) {
                    toastError('Số lượng', `Chưa nhập số lượng ${item.productName} ngành hàng ${item.categoryName}`, 'top')
                    return
                }
                if (item.productComment != null && item.productComment != '') {
                    if (item.quanity == 'null' || item.quanity == null) {
                        toastError('Số lượng', `Chưa nhập số lượng ${item.productName} ngành hàng ${item.categoryName}`, 'top')
                        return
                    }
                    if (item.productComment?.length < 5) {
                        toastError('Ghi chú', `Ghi chú ít nhất 5 kí tự, sản phẩm ${item.productName} ngành hàng ${item.categoryName}`, 'top')
                        return
                    }
                }
            }
            const lstNoData = await isPhotoNoData(workinfo, kpiinfo.id)
            if (lstNoData.length > 0) {
                for (let index = 0; index < lstNoData.length; index++) {
                    const item = lstNoData[index];
                    if (item.countPhoto > 0) {
                        toastError('Dữ liệu', `Chưa nhập dữ liệu ngành hàng ${item.categoryName} (Đã chụp hình nhưng chưa nhập dữ liệu)`, 'top')
                        return
                    }
                }
            }
        }

        const dataRes = []

        listProduct.map(it => {
            dataRes.push({
                productId: it.productId,
                quanity: it.quanity,
                price: it.price,
                tagPOPId: it.tagPOPId,
                tagDisplayId: it.tagDisplayId,
                displayComment: it.displayComment,
                productComment: it.productComment
            })
        })

        // Upload result
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await UploadController.DataDisplay(dataRes, { ...workinfo, reportId: kpiinfo.id }, async () => {
                await LoadData()
            })
        })
    }
    // View Action Sheet
    const middleAction = async () => {
        openActionSheet(actionMode.TOOLS)
    }
    const tagPOPAction = () => {
        if (settings.isUploaded) {
            return
        } else {
            openActionSheet(actionMode.TAG_POP)
        }
    }
    const tagDisplayAction = () => {
        if (settings.isUploaded) {
            return
        } else {
            openActionSheet(actionMode.TAG_DISPLAY)
        }
    }
    const handlerCameraAction = useCallback(async (item) => {
        navigation.navigate('photogroup', { Status: settings.isUploaded, keyPhoto: item.categoryName, hideIcon: true })
    }, [navigation, settings.isUploaded])
    const handlerNoteAction = useCallback(async (item) => {
        const dataNote = await getNoteDisplayReport(workinfo.workId, item.displayRef, _competitorName)
        const notes = dataNote.length > 0 && dataNote[0]
        await setItemNote(notes)
        //
        openActionSheet(actionMode.NOTE)
    }, [openActionSheet, workinfo.workId])
    // handler
    const handlerClearAll = () => {
        MessageAction('Bạn có muốn xoá tất cả dữ liệu đã nhập không ?', async () => {
            await clearAllDataDisplay(workinfo, null);
            await LoadData()
            await setShowInput(false)
            SheetManager.hide('actionDisplay')
        })
    }
    const handlerClearByCategory = (itemCategory) => {
        if (!itemCategory?.categoryId) {
            toastError('Dữ liệu', 'Không xác định được ngành hàng cần xoá', 'top')
            return
        }
        const currentTabIndex = activeTabIndex
        MessageAction(`Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.categoryName} đã nhập không ?`, async () => {
            await clearAllDataDisplay(workinfo, itemCategory.categoryId);
            await LoadData(currentTabIndex)
            await setShowInput(false)
            SheetManager.hide('actionDisplay')
        })
    }
    const handlerShowItemInput = (show) => {
        setShowInput(show)
        if (show) {
            const dataInput = _.filter(dataMain, (i) => {
                return (i.quanity !== null && i.quanity >= 0) || (i.price !== null && i.price >= 0) || (i.productComment != null && i.productComment !== '')
            })
            setData(dataInput)
        } else {
            setData(dataMain)
        }
    }
    const handlerTag = (item, type) => {
        if (type == actionMode.TAG_POP) {
            setTagItemView({ ...tagItemView, popId: item.id, popColor: item.isColor })
            uploadDisplayPOP(item.id, 'tagPOPId', workinfo)
        }
        if (type == actionMode.TAG_DISPLAY) {
            setTagItemView({ ...tagItemView, displayId: item.id, displayColor: item.isColor })
            uploadDisplayPOP(item.id, 'tagDisplayId', workinfo)
        }
        SheetManager.hide('actionDisplay')
    }
    const handlerSaveNote = (note) => {
        setItemNote({ ...itemNote, displayComment: note || '' })
    }
    const handlerCloseNote = async (note) => {
        if (note !== null && note.length > 0 && note.length < 5) {
            toastError('Ghi chú', `Nhập ghi chú tối thiểu 5 kí tự`, 'top')
            return
        }
        const itemSave = {
            workId: workinfo.workId,
            displayRef: itemNote.displayRef,
            displayComment: note || '',
            division: _competitorName
        }
        await setItemNote({ ...itemNote, displayComment: itemSave.displayComment })
        await updateNoteDisplayReport(itemSave)
        SheetManager.hide('actionDisplay')
    }
    //
    const filterProduct = debounce((text) => {
        if (isShowInput) {
            const dataInput = _.filter(dataMain, (i) => {
                return (i.quanity !== null && i.quanity >= 0) || (i.price !== null && i.price >= 0) || (i.productComment != null && i.productComment !== '')
            })
            if (text !== null && text.length > 0) {
                const filterList = _.filter(dataInput, (i) => {
                    return i.productName.toLowerCase().match(text.toLowerCase()) || i.productCode.toLowerCase().match(text.toLowerCase())
                })
                setData(filterList)
            } else {
                setData(dataInput)
            }
        } else {
            if (text !== null && text.length > 0) {
                const filterList = _.filter(dataMain, (i) => {
                    return i.productName.toLowerCase().match(text.toLowerCase()) || i.productCode.toLowerCase().match(text.toLowerCase())
                })
                setData(filterList)
            } else {
                setData(dataMain)
            }
        }
    }, 500)
    const dataByTab = useMemo(() => {
        return dataTab.map((it) => {
            const dataItem = data.filter(e => e.categoryId == it.categoryId)
            const totalPhoto = (photoByCategory?.filter(photo => photo.photoType?.includes(it.categoryName)) || []).length
            const { arr } = groupDataByKey({
                arr: dataItem,
                key: 'subCatId'
            })
            return { tab: it, items: arr, totalPhoto }
        })
    }, [data, dataTab, photoByCategory])
    const activeTabName = useMemo(() => {
        const activeItem = dataByTab[activeTabIndex] || dataByTab[0]
        if (!activeItem) {
            return undefined
        }
        return `${activeItem.tab.categoryName} (${activeItem.items.length || 0})`
    }, [activeTabIndex, dataByTab])
    useEffect(() => {
        LoadData()
        return () => loading
    }, [])
    useFocusEffect(
        useCallback(() => {
            loadPhotoCount()
        }, [loadPhotoCount])
    )
    const styles = useMemo(() => StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        tagMain: { flexDirection: 'row', margin: 8, alignItems: 'center' },
        tagButtonPOP: { padding: 8, backgroundColor: tagItemView.popColor, borderRadius: 10, flexDirection: 'row' },
        tagButtonDisplay: { padding: 8, backgroundColor: tagItemView.displayColor, borderRadius: 10, flexDirection: 'row' },
        tagTitle: { paddingStart: 8, paddingEnd: 8, fontSize: 13, fontWeight: '500', color: appcolor.dark },
        contentView: { flex: 1 },
        tabBody: { flex: 1, marginTop: 40, backgroundColor: appcolor.light, padding: 6, width: deviceWidth, alignSelf: 'center' },
        mainItem: { width: '100%', marginBottom: 3, backgroundColor: appcolor.light },
        titleHeader: { fontSize: 15, fontWeight: '700', fontStyle: 'italic', color: appcolor.info, marginBottom: 5, marginTop: 5 },
        titleContent: { fontSize: 14, color: appcolor.dark, fontWeight: '500' }
    }), [appcolor, tagItemView.displayColor, tagItemView.popColor])

    const renderItem = useCallback(({ item, index }) => {
        return (
            <View key={`ood_oo_${index}`} style={styles.mainItem}>
                {item.isParent && <Text style={styles.titleHeader}>{item.subCategory}</Text>}
                <View style={{ flex: 1, backgroundColor: appcolor.surface, borderRadius: 5 }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1.15, padding: 6 }}>
                            <Text style={styles.titleContent}>{`${(index + 1)}. ${item.productName}`}</Text>
                            <Text style={{ ...styles.titleContent, fontSize: 12, color: appcolor.greydark }}>{item.productCode}</Text>
                        </View>
                        <View style={{ flex: 0.95, paddingVertical: 6, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center' }}>
                            <InputQuantity item={item} index={index} />
                            <InputPrice item={item} index={index} />
                        </View>
                    </View>
                    {configReport?.isUseNoteBySKU == 1 &&
                        <View style={{ flex: 1, paddingHorizontal: 8 }}>
                            <InputNoteProduct item={item} index={index} />
                        </View>
                    }
                </View>
            </View>
        )
    }, [appcolor, configReport?.isUseNoteBySKU, styles])
    const tabContent = useMemo(() => (
        <View style={styles.contentView}>
            <Tabs.Container
                key={`display-price-tabs-${dataTab.length}-${data.length}`}
                initialTabName={activeTabName}
                onIndexChange={setActiveTabIndex}
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        tabStyle={{ minWidth: minWidthTab(dataTab), height: 38 }}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.light }}
                    />
                )}
                containerStyle={{ backgroundColor: appcolor.surface }}>
                {dataByTab.length > 0 && dataByTab.map(({ tab: it, items: arr, totalPhoto }, i) => {
                    const labelItem = `${it.categoryName} (${arr.length || 0})`
                    return (
                        <Tabs.Tab key={`iid-i_${i}`} label={labelItem} name={labelItem} >
                            <View style={styles.tabBody}>
                                <CustomListView
                                    extraData={arr}
                                    data={arr}
                                    containerStyle={{ flex: 1 }}
                                    contentContainerStyle={{ paddingBottom: 24 }}
                                    ListHeader={
                                        <HeaderItemView
                                            index={i}
                                            itemHeader={it}
                                            totalPhoto={totalPhoto}
                                            handlerCamera={handlerCameraAction}
                                            handlerNote={handlerNoteAction}
                                        />}
                                    initialNumToRender={2}
                                    renderItem={renderItem}
                                    showsVerticalScrollIndicator={false}
                                    ListFooter={
                                        <Text style={{ width: '100%', textAlign: 'center', fontSize: 13, color: appcolor.dark, padding: 8, paddingBottom: 24 }}>
                                            {arr.length > 10 ? 'Đã xem hết' : ''}
                                        </Text>
                                    }
                                />
                            </View>
                        </Tabs.Tab>
                    )
                })}
            </Tabs.Container>
        </View>
    ), [activeTabName, appcolor, data.length, dataByTab, dataTab, handlerCameraAction, handlerNoteAction, renderItem, styles.contentView, styles.tabBody])
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconMiddle='poll-h'
                iconRight={!settings.isLockReport ? (!settings.isUploaded ? 'cloud-upload-alt' : null) : 'user-lock'}
                rightFunc={!settings.isLockReport ? (!settings.isUploaded ? () => uploadAction() : null) : () => {
                    ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')
                }}
                middleFunc={middleAction}
                leftFunc={() => navigation.goBack()}
            />
            <FormGroup
                editable
                selectTextOnFocus
                containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, marginBottom: 0, alignSelf: 'center' }}
                inputStyle={{ fontSize: 13, color: appcolor.dark }}
                placeholder='Tìm kiếm sản phẩm'
                iconName='search'
                onClearTextAndroid={filterProduct}
                handleChangeForm={filterProduct}
            />
            {!loading && isPOP &&
                <View style={styles.tagMain}>
                    <TouchableOpacity onPress={tagPOPAction} style={styles.tagButtonPOP}>
                        <Icon name='tag' size={18} color={appcolor.light} />
                    </TouchableOpacity>
                    <Text style={styles.tagTitle}>POP</Text>
                    <TouchableOpacity onPress={tagDisplayAction} style={styles.tagButtonDisplay}>
                        <Icon name='tag' size={18} color={appcolor.light} />
                    </TouchableOpacity>
                    <Text style={styles.tagTitle}>Trưng bày</Text>
                </View>
            }
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            {!loading && dataByTab.length > 0 && tabContent}
            <ActionSheet
                id="actionDisplay"
                gestureEnabled >
                <View style={{ padding: 8, width: '100%' }}>
                    {mode == actionMode.TOOLS &&
                        <ToolsAction
                            clearAllData={handlerClearAll}
                            clearByCategory={handlerClearByCategory}
                            itemInput={handlerShowItemInput}
                            dataTab={dataTab}
                            activeTabIndex={activeTabIndex}
                            showInputView={isShowInput}
                            isLock={settings.isUploaded}
                        />
                    }
                    {mode == actionMode.NOTE &&
                        <NoteAction
                            settings={settings}
                            noteValue={itemNote}
                            onChangeNote={handlerSaveNote}
                            onClose={handlerCloseNote}
                        />}
                    {mode == actionMode.TAG_POP &&
                        <TagAction
                            title='POP'
                            mode={actionMode.TAG_POP}
                            dataTag={dataTagReport.POP}
                            handlerAction={handlerTag}
                        />}
                    {mode == actionMode.TAG_DISPLAY &&
                        <TagAction
                            title='Trưng bày'
                            mode={actionMode.TAG_DISPLAY}
                            dataTag={dataTagReport.Display}
                            handlerAction={handlerTag}
                        />}
                </View>
            </ActionSheet>
        </View>
    )
}
const InputNoteProduct = ({ item, index }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [___, setMutate] = useState(false)
    const changeNote = (text) => {
        const noteProduct = text !== null && text !== '' && text.length > 0 ? text : null
        item.productComment = noteProduct
        setMutate(e => !e)
        updateItemDisplay(item, workinfo)
    }
    return (
        <View key={`Note_${index}_${item.productId}`} style={{ flex: 1 }}>
            <FormGroup
                editable={item.upload == 0}
                multiline
                containerStyle={{ backgroundColor: appcolor.light }}
                placeholder={'Ghi chú sản phẩm ' + item.productName}
                value={item.productComment || ''}
                handleChangeForm={changeNote}
                useClearAndroid={true}
                onClearTextAndroid={changeNote}
            />
        </View>
    )
}
const InputQuantity = ({ item, index }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [___, setMutate] = useState(false)
    const changeValue = (text) => {
        item.quanity = parseNumberInput(text)
        setMutate(e => !e)
        updateItemDisplay(item, workinfo)
    }
    const inputStyle = {
        height: 34,
        fontSize: 12,
        color: appcolor.dark,
        paddingVertical: 4,
        paddingHorizontal: 6,
        backgroundColor: appcolor.light,
        fontWeight: '500',
        textAlign: 'center',
        borderRadius: 4
    }
    return (
        <View key={`ppd_${index}`} style={{ flex: 0.8, alignSelf: 'center' }}  >
            <TextInput
                value={formatNumber(item.quanity, ',')}
                onChangeText={changeValue}
                style={inputStyle}
                keyboardType='numeric'
                placeholder='SL'
                placeholderTextColor={appcolor.greydark}
                editable={item.upload == 0}
                selectTextOnFocus
            />
        </View>
    )
}
const InputPrice = ({ item, index }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [_, setMutate] = useState(false)
    const changeValue = (text) => {
        item.price = parseNumberInput(text)
        setMutate(e => !e)
        updateItemDisplay(item, workinfo)
    }
    const checkValuePrice = async () => {
        const priceValue = parseInt(item.price)
        if (Number.isNaN(priceValue)) {
            item.price = null
            item.checkValue = 0
            setMutate(e => !e)
            await updateItemDisplay(item, workinfo)
            return
        }
        if (priceValue < 10000) {
            toastError("Thông báo", `Giá sản phẩm ${item.productName} không được nhỏ hơn 10,000 VNĐ`);
            item.price = null
            item.checkValue = 1
            setMutate(e => !e)
            await updateItemDisplay(item, workinfo)
            return
        } else if (priceValue % 1000 > 0) {
            toastError("Thông báo", `Giá sản phẩm ${item.productName} không được nhập số lẻ`);
            item.price = null
            item.checkValue = 1
            setMutate(e => !e)
            await updateItemDisplay(item, workinfo)
            return
        } else {
            item.checkValue = 0
            setMutate(e => !e)
        }
    }
    const styles = StyleSheet.create({
        styleInput: {
            height: 34,
            fontSize: 12,
            color: appcolor.dark,
            paddingVertical: 4,
            paddingHorizontal: 6,
            fontWeight: '500',
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: item.checkValue == 0 ? appcolor.light : appcolor.warning,
        }
    })
    return (
        <View key={`ppd_${index}`} style={{ flex: 1.45, alignSelf: 'center', marginStart: 4 }}  >
            <TextInput
                value={formatNumber(item.price, ',')}
                onChangeText={changeValue}
                style={styles.styleInput}
                keyboardType='numeric'
                placeholder='Giá'
                placeholderTextColor={appcolor.greydark}
                editable={item.upload == 0}
                selectTextOnFocus
                onEndEditing={checkValuePrice}
            />
        </View>
    )
}
const ToolsAction = ({ clearAllData, clearByCategory, itemInput, activeTabIndex = 0, dataTab, showInputView = false, isLock = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isShowInput, setShowInput] = useState(showInputView)
    const itemTab = dataTab[activeTabIndex] || dataTab[0] || {}
    // 
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
    //
    const RenderButton = ({ title, iconName, iconColor, actionPress, isShowInput = false }) => {
        const styleView = {
            backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
            borderWidth: isShowInput ? 0.5 : 0,
            borderColor: appcolor.success,
            width: '100%', flexDirection: 'row', alignItems: 'center',
            padding: 5, marginTop: 8, borderRadius: 5
        }
        return (
            <TouchableOpacity onPress={actionPress}>
                <View style={styleView}>
                    <Icon name={iconName} size={18} color={iconColor} />
                    <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>{title}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
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
            {!isLock && itemTab?.categoryId && <RenderButton
                title={`Xoá dữ liệu ngành hàng ${itemTab.categoryName || ''}`}
                iconName='trash'
                iconColor={appcolor.red}
                actionPress={onDeleteByCategory} />
            }
        </View>
    )
}
const NoteAction = ({ noteValue, onChangeNote, onClose, settings }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const onChangeText = (text) => {
        noteValue.displayComment = text
        onChangeNote(text)
    }
    const onCloseNote = () => [
        onClose(noteValue.displayComment)
    ]
    return (
        <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '600', color: appcolor.dark, marginBottom: 8 }}>Ghi chú</Text>
            <FormGroup
                editable={!settings.isUploaded}
                multiline
                placeholder={'Nhập ghi chú'}
                value={noteValue.displayComment || ''}
                handleChangeForm={onChangeText}
            />
            {!settings.isUploaded &&
                <TouchableOpacity
                    style={{ width: deviceWidth / 3, backgroundColor: appcolor.surface, marginEnd: 3, marginStart: 3, borderRadius: 5, alignSelf: 'center' }}
                    key={`close_iim`} onPress={onCloseNote}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.yellow, padding: 8, marginStart: 5, textAlign: 'center' }}>Xác nhận</Text>
                </TouchableOpacity>
            }
        </View>
    )
}
const TagAction = ({ dataTag, title, handlerAction, mode }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const listData = dataTag || []
    const renderItemTag = ({ item, index }) => {
        const onPressItem = () => {
            handlerAction(item, mode)
        }
        return (
            <TouchableOpacity onPress={onPressItem} >
                <View key={`iid_tag_${index}`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.surface, padding: 5, borderRadius: 5, marginTop: 8 }}>
                    <View style={{ height: 20, width: 20, borderRadius: 40, backgroundColor: item.isColor }} />
                    <Text style={{ width: '100%', fontSize: 13, fontWeight: '400', padding: 8, color: appcolor.dark }}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ width: '100%', height: deviceHeight / 2.5, paddingBottom: deviceHeight / 20 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '600', color: appcolor.dark }}>{title}</Text>
            {/* Dùng CustomListView thay FlatList theo rules */}
            <CustomListView
                data={listData}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItemTag}
                showsVerticalScrollIndicator={false}
                ListEmpty={<Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, padding: 12 }}>Không có dữ liệu {title}</Text>}
            />
        </View>
    )
}
const HeaderItemView = ({ itemHeader, index, totalPhoto = 0, handlerCamera, handlerNote }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const RenderButton = ({ iconName, titleName, onAtion }) => {
        const pressItem = () => {
            onAtion(itemHeader)
        }
        return (
            <TouchableOpacity
                style={{ width: deviceWidth / 2.2, backgroundColor: appcolor.surface, marginEnd: 3, marginStart: 3, borderRadius: 5 }}
                key={`iid_acc_${index}`} onPress={pressItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', padding: 5 }}>
                    <Icon name={iconName} size={21} color={appcolor.yellow} solid />
                    <Text style={{ fontSize: 13, fontWeight: '400', color: appcolor.dark, padding: 5, marginStart: 5 }}>{titleName}</Text>
                    {iconName === 'camera' &&
                        <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: appcolor.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginStart: 2 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: appcolor.light }}>{totalPhoto}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ width: '100%', flexDirection: 'row', borderRadius: 5, justifyContent: 'center' }}>
            <RenderButton iconName='camera' titleName='Chụp hình' onAtion={handlerCamera} />
            <RenderButton iconName='comment-alt' titleName='Ghi chú' onAtion={handlerNote} />
        </View>
    )
}
