import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { useSelector } from "react-redux";
import { _competitorId, _competitorName } from "../../../Core/URLs";
import { deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { clearAllDataDisplay, getDisplayProduct, getlistTabCompetitor, updateItemDisplay } from '../../../Controller/DisplayController'
import { getAllPhotos, updateNoteDisplayReport, updateShelveDisplayReport } from "../../../Controller/WorkController";
// import NumberFormat from "react-number-format";
import { groupDataByKey, Message, ToastError, ToastSuccess, UUIDGenerator } from "../../../Core/Helper";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FormGroup from "../../../Content/FormGroup";
import { Badge, Icon } from '@rneui/themed';
import { LoadingView } from "../../../Control/ItemLoading";
;
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { GetByListCode } from "../../../Controller/MasterController";
import NativeCamera from "../../../Control/NativeCamera";
import { REPORT } from "../../../API/ReportAPI";

export const InputDisplayStockHSS = memo(({ navigation, route, Status, listInput, reloadView, lstReport }) => {
    const { appcolor, kpiinfo, workinfo, shopinfo, userinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataTab: [], dataShow: [], dataShowF: [] })
    const [listMaster, setListMaster] = useState({})
    const [showProgress, setProgress] = useState(false)
    const [isDone, setDone] = useState(false)
    const [_, setMutate] = useState(false)
    const ref_toolsSheet = useRef()
    const tabRef = useRef()
    const [listPhotoByCategory, setPhotoByCategory] = useState([])

    const loadData = async () => {
        await setProgress(true)
        const listTab = await getlistTabCompetitor(_competitorId)
        let listProduct = []
        if (lstReport.isProductByShop == 1) {
            const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
            await REPORT.GetDataReportByShop_RealTime(params, async (mData) => {
                const detailProduct = mData[0]?.details || null
                if (detailProduct) {
                    listProduct = await getDisplayProduct(workinfo, _competitorId, lstReport, (shopinfo?.dealerId || 0), detailProduct)
                } else {
                    listProduct = await getDisplayProduct(workinfo, _competitorId, lstReport, (shopinfo?.dealerId || 0))
                }
            })
        } else {
            listProduct = await getDisplayProduct(workinfo, _competitorId, lstReport, (shopinfo?.dealerId || 0))
        }

        const { arr } = groupDataByKey({
            arr: listProduct,
            key: 'categoryId',
            keyLayer2: 'subCatId'
        })
        await setData({ ...data, dataTab: listTab, dataShow: arr, dataShowF: arr })
        if (lstReport?.isNoteBySKU == 1) {
            await loadListMaster()
        }
        setTimeout(async () => { await setProgress(false) }, 100)
    }

    const loadListMaster = async () => {
        const listNote = lstReport?.listNote
        let listMaster = {}
        for (let index = 0; index < listNote?.length; index++) {
            const item = listNote[index];
            if (item.typeValue == 'selectText') {
                const dataByList = await GetByListCode(`'${item.listCode}'`)
                listMaster[item.noteType] = dataByList
            }
        }
        await setListMaster(listMaster)
    }
    useEffect(() => {
        const _load = loadData()
        return () => { _load }
    }, [])
    useFocusEffect(
        useCallback(() => {
            if (lstReport?.isTakeByCate == 1) {
                countNumPhoto()
            }
            return () => false;
        }, [])
    );

    const filterDoneProduct = () => {
        if (!isDone) {
            let lstRes = data.dataShow.filter(it => (it.quanity !== null && it.quanity >= 0) ||
                (it.price !== null && it.price >= 0) ||
                (it.quantityStock !== null && it.quantityStock >= 0) ||
                (it.quantitySuggest !== null && it.quantitySuggest >= 0) ||
                (it.fsmValue !== null && it.fsmValue >= 0) ||
                (it.tagPOPId !== null && it.tagPOPId >= 0))
            data.dataShow = lstRes;
        } else {
            data.dataShow = data.dataShowF;
        }
        setDone(e => !e)
    }
    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = data.dataShowF.filter(it =>
                (it.quanity !== null && it.quanity >= 0) ||
                (it.price !== null && it.price >= 0) ||
                (it.quantityStock !== null && it.quantityStock >= 0) ||
                (it.quantitySuggest !== null && it.quantitySuggest >= 0) ||
                (it.fsmValue !== null && it.fsmValue >= 0) ||
                (it.tagPOPId !== null && it.tagPOPId >= 0))
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
    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllDataDisplay(workinfo);
                    await reloadView()
                    await setDone(false)
                    await loadData()
                    ref_toolsSheet.current?.hide()
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            ref_toolsSheet.current?.hide()
        }
    }

    const onUpdateNote = async (note, categoryName) => {
        let itemNote = {
            workId: workinfo.workId,
            displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
            displayComment: note || '',
            division: _competitorName
        }
        data.dataShow.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
        data.dataShowF.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
        await updateNoteDisplayReport(itemNote);
    }
    const endUpdateNote = async (note, categoryName) => {
        let itemNote = {
            workId: workinfo.workId,
            displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
            displayComment: '',
            division: _competitorName
        }
        if (note?.length > 0 && note?.length < 5) {
            ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự.', 'Thông báo', 'top');
            data.dataShow.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
            data.dataShowF.map(it => it.categoryName === categoryName ? (it.displayComment = note || '') : null)
            await updateNoteDisplayReport(itemNote);
            return
        }
        note?.length > 5 && ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
    }
    const onUpdateShelves = async (quantity, categoryName) => {
        let itemShelve = {
            workId: workinfo.workId,
            displayRef: data.dataTab[tabRef.current.getCurrentIndex()].displayRef,
            quantityShelves: quantity == 0 ? 0 : (quantity || null),
            division: _competitorName
        }
        data.dataShow.map(it => it.categoryName === categoryName ? (it.quantityShelves = (quantity == 0 ? 0 : (quantity || null))) : null)
        data.dataShowF.map(it => it.categoryName === categoryName ? (it.quantityShelves = (quantity == 0 ? 0 : (quantity || null))) : null)
        await updateShelveDisplayReport(itemShelve);
    }
    const keyExtractor = useCallback((it) => it.productId.toString(), [])
    const getItemLayout = (data, index) => ({
        length: lstReport.isNoteBySKU == 1 ? (lstReport.listInput.length > 1 ? 210 : 180) : 150,
        offset: (lstReport.isNoteBySKU == 1 ? (lstReport.listInput.length > 1 ? 210 : 180) : 150) * index,
        index
    })
    const handlerTakePhotoTemplate = (categoryName) => {
        navigation.navigate('photogroup', { Status: Status, keyPhoto: categoryName, hideIcon: true, dataImageList: lstReport?.ImageByList || [] })
    }
    const showAlbum = (categoryName) => {
        let item = {
            "reportId": kpiinfo.kpiId,
            "shopId": workinfo.shopId,
            "photoType": categoryName,
            "photoDate": workinfo.workDate,
            reloadView: countNumPhoto
        }
        navigation.navigate('AlbumPhoto', item);
    }
    // View Item Product by Competitor
    const countNumPhoto = async () => {
        let resPhotos = await getAllPhotos(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        listPhotoByCategory.length !== resPhotos.length ? await setPhotoByCategory(resPhotos) : []
    }

    const takePhoto = async (categoryName) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": categoryName,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.cameraStart(photoinfo, countNumPhoto);
    }
    const ViewItem = () => {
        return (
            data.dataTab.map(it => {
                let listDataByCate = []
                listDataByCate = data.dataShow.filter(item => item.categoryName === it.categoryName)
                const totalRow = listDataByCate.length

                return (
                    <Tabs.Tab key={it.categoryName + `(${totalRow})`} label={it.categoryName + `(${totalRow})`} name={it.categoryName + `(${totalRow})`}>
                        <View style={Styles.viewTabStyle}>
                            <HeaderTab key={'header_' + it.categoryName} listDataByCate={listDataByCate} listPhotoByCategory={listPhotoByCategory} itemTab={it} onUpdateNote={onUpdateNote}
                                endUpdateNote={endUpdateNote} onUpdateShelves={onUpdateShelves} lstReport={lstReport} Status={Status} handlerTakePhotoTemplate={handlerTakePhotoTemplate} takePhoto={takePhoto} showAlbum={showAlbum} />
                            <View style={{ flex: 1, minHeight: deviceHeight * 0.5 }}>
                                <FlatList
                                    windowSize={5}
                                    getItemLayout={getItemLayout}
                                    removeClippedSubviews={true}
                                    key={it.categoryId}
                                    data={listDataByCate}
                                    initialNumToRender={5}
                                    keyExtractor={keyExtractor}
                                    ListFooterComponent={<Text style={Styles.footerStyle} >Đã xem hết</Text>}
                                    renderItem={({ item, index }) =>
                                        <RenderItem item={item} index={index} data={data} Styles={Styles}
                                            listInput={listInput} appcolor={appcolor} workinfo={workinfo}
                                            Status={Status} lstReport={lstReport} listMaster={listMaster} />}
                                />

                                {/* <FlashList
                                    // windowSize={5}
                                    estimatedItemSize={lstReport.isNoteBySKU == 1 ? (lstReport.listInput.length > 1 ? 210 : 180) : 150}
                                    getItemLayout={getItemLayout}
                                    // removeClippedSubviews={true}
                                    // CellRendererComponent={}
                                    key={it.categoryId}
                                    data={listDataByCate}
                                    // initialNumToRender={4}
                                    keyExtractor={keyExtractor}
                                    ListFooterComponent={<Text style={Styles.footerStyle} >Đã xem hết</Text>}
                                    renderItem={({ item, index }) =>
                                        <RenderItem item={item} index={index} data={data} Styles={Styles}
                                            listInput={listInput} appcolor={appcolor} workinfo={workinfo}
                                            Status={Status} lstReport={lstReport} listMaster={listMaster} />}
                                /> */}
                            </View>
                        </View >
                    </Tabs.Tab >
                )
            })
        )
    }
    const openSheet = () => {
        Keyboard.dismiss()
        ref_toolsSheet.current.show()
    }
    const Styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.surface },
        headerStyle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 5 },
        searchStyle: { borderColor: appcolor.grayLight, borderWidth: 0.5, backgroundColor: appcolor.light, padding: 3, width: '88%', marginBottom: 0 },
        buttonHeaderStyle: { width: '10%', height: 38, backgroundColor: appcolor.grayLight, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
        progressStyle: { position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 },
        actionSheetStyle: { padding: 8, width: '100%', height: '30%' },
        buttonSheetStyle: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5, marginTop: 12 },
        textSheetStyle: { width: '80%', textAlign: 'center' },
        titleStyle: { color: appcolor.dark, fontSize: 14, fontWeight: '600' },
        viewTabStyle: { flex: 1, backgroundColor: appcolor.surface, marginTop: 42, padding: 5, width: deviceWidth, display: !showProgress ? 'flex' : 'none' },
        inputNoteStyle: { flex: 1, padding: 10, color: appcolor.dark, minHeight: 40, maxHeight: 100, textAlign: 'left', borderWidth: 0.4, borderRadius: 10, borderColor: appcolor.dark, backgroundColor: appcolor.light },
        itemStyle: {
            height: listInput.length < 4 ?
                (lstReport.isNoteBySKU == 1 ? (lstReport.listInput.length > 1 ? 190 : 150) : 110)
                : (lstReport.isNoteBySKU == 1 ? (lstReport.listInput.length > 1 ? 230 : 190) : 150), backgroundColor: appcolor.light, justifyContent: 'center', padding: 5, margin: 5, elevation: 2, borderRadius: 10
        },
        textItemStyle: { color: appcolor.dark, fontSize: 12, fontStyle: 'italic' },
        itemInputStyle: { height: 50, marginEnd: 2, },
        textInputStyle: { height: 30, fontSize: 13, color: appcolor.dark, fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: appcolor.greydark, padding: 8, marginBottom: 2 },
        titleInputStyle: { textAlign: 'center', color: appcolor.dark, fontSize: 12 },
        footerStyle: { height: deviceHeight / 2, textAlign: 'center', color: appcolor.dark },
    })

    return (
        <View style={Styles.container}>
            <View style={Styles.headerStyle}>
                <FormGroup
                    containerStyle={Styles.searchStyle}
                    inputStyle={{ fontSize: 14, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    iconName='search'
                    onClearTextAndroid={filterProduct}
                    handleChangeForm={filterProduct}
                />
                <TouchableOpacity
                    onPress={openSheet}
                    style={Styles.buttonHeaderStyle}>
                    <Icon name='ellipsis-vertical' type='ionicon' size={21} color={appcolor.dark} />
                </TouchableOpacity>
            </View>
            <View style={Styles.container}>
                {
                    data.dataTab.length > 0 && data.dataShowF.length > 0 &&
                    <Tabs.Container
                        ref={tabRef}
                        renderTabBar={(props) => (
                            <MaterialTabBar
                                {...props}
                                scrollEnabled={true}
                                // tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42, }}
                                tabStyle={{ borderRadius: 8, backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab), height: 38, borderColor: appcolor.grayLight, borderWidth: 1, marginHorizontal: 5 }}
                                labelStyle={{ fontSize: 14, fontWeight: "600" }}
                                indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.primary}
                                style={{ backgroundColor: appcolor.surface }}
                            />
                        )}
                        headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
                        containerStyle={{ backgroundColor: appcolor.surface }}
                    >
                        {ViewItem()}
                    </Tabs.Container>
                }
            </View>
            {
                showProgress &&
                <View style={Styles.progressStyle}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
            <ActionSheet
                ref={ref_toolsSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >

                <View style={Styles.actionSheetStyle}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
                        <TouchableOpacity onPress={filterDoneProduct}>
                            <View style={{
                                backgroundColor: isDone ? appcolor.light : appcolor.surface,
                                borderWidth: isDone ? 0.5 : 0,
                                borderColor: appcolor.success,
                                width: '100%', flexDirection: 'row', alignItems: 'center',
                                padding: 5, marginTop: 8, borderRadius: 5
                            }}>
                                <Icon name={'keyboard'} size={18} color={appcolor.success} />
                                <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>Xem dữ liệu đã nhập</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            Status != 1 && <TouchableOpacity
                                onPress={setClearAll}>
                                <View style={{
                                    backgroundColor: appcolor.surface,
                                    borderWidth: 0,
                                    borderColor: appcolor.success,
                                    width: '100%', flexDirection: 'row', alignItems: 'center',
                                    padding: 5, marginTop: 8, borderRadius: 5
                                }}>
                                    <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                                    <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }} >Xóa dữ liệu đã nhập</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </ActionSheet >
        </View>
    )
})

const HeaderTab = ({ listDataByCate, listPhotoByCategory, itemTab, onUpdateNote, endUpdateNote, onUpdateShelves, lstReport, Status, handlerTakePhotoTemplate, takePhoto, showAlbum }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isShowNote, setShowNote] = useState(true)
    const [inputShelves, setInputShelves] = useState(listDataByCate[0]?.quantityShelves?.toString() == 0 ? 0 : listDataByCate[0]?.quantityShelves?.toString() || '')
    const [inputNote, setInputNote] = useState(listDataByCate[0]?.displayComment || '')

    const onChangeNote = async (text) => {
        await setInputNote(text)
        onUpdateNote(text, itemTab.categoryName)
    }
    const totalPhoto = listPhotoByCategory.length > 0 ? (listPhotoByCategory?.filter(i => i.photoType?.includes(itemTab.displayRef)) || []).length : 0
    const endChangeNote = async (event) => {
        await setInputNote(event.nativeEvent.text)
        endUpdateNote(event.nativeEvent.text, itemTab.categoryName)
    }

    const onChangeShelve = async (text) => {
        let intValue = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        intValue = parseInt(intValue)
        intValue = isNaN(intValue) ? null : Math.round(intValue);
        await setInputShelves(intValue == null ? intValue : intValue.toString())
        onUpdateShelves(intValue, itemTab.categoryName)
    }

    const handleSelectButton = (status) => {
        setShowNote(status)
    }

    return (
        <View>
            <View style={{
                backgroundColor: appcolor.surface, flexDirection: 'row',
                justifyContent: 'space-between', width: '100%', marginBottom: 5
            }}>
                <View style={{ flexDirection: 'row', width: lstReport?.isTakeByCate == 1 ? (lstReport?.isTakeTemplate == 1 ? '72%' : '50%') : '100%' }}>
                    {/* {
                        lstReport?.isNoteBySKU !== 1 && */}
                    <TouchableOpacity
                        key={'NoteButton'}
                        onPress={() => handleSelectButton(true)}
                        style={{ flexDirection: 'row', backgroundColor: isShowNote ? appcolor.primary : appcolor.light, paddingLeft: 5, minHeight: 30, padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 6, }}>
                        <View style={{ flexDirection: 'row', paddingLeft: 3, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name='comment-alt' color={isShowNote ? appcolor.white : appcolor.primary} type='font-awesome-5' size={16}></Icon>
                            <Text style={{ color: isShowNote ? appcolor.white : appcolor.dark, fontSize: 12, paddingLeft: 5 }}>Ghi chú</Text>
                        </View>
                    </TouchableOpacity>
                    {/* } */}
                    {
                        (lstReport?.isNeedShelve == 1 || lstReport?.isNeedShelve == 2) &&
                        <TouchableOpacity
                            key={'ShelvesButton'}
                            onPress={() => handleSelectButton(false)}
                            style={{ flexDirection: 'row', minHeight: 30, backgroundColor: isShowNote ? appcolor.light : appcolor.primary, padding: 3, marginLeft: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 6, }}>
                            <View style={{ flexDirection: 'row', paddingLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name='library-outline' color={isShowNote ? appcolor.primary : appcolor.white} type='ionicon' size={16}></Icon>
                                <Text style={{ color: isShowNote ? appcolor.dark : appcolor.white, fontSize: 12, paddingLeft: 3 }}>Quầy kệ {(inputShelves !== null && inputShelves !== undefined && inputShelves !== '') ? (': ' + (inputShelves == 0 ? 0 : inputShelves || '')) : ''}</Text>
                            </View>
                        </TouchableOpacity>
                    }

                </View>

                {
                    lstReport?.isTakeByCate == 1 &&
                    (lstReport?.isTakeTemplate == 1 ?
                        <TouchableOpacity
                            key={'ImageButton'}
                            onPress={() => handlerTakePhotoTemplate(itemTab.displayRef)}
                            style={{ minHeight: 30, marginRight: 3, padding: 3, paddingVertical: 5, marginRight: 3, borderRadius: 6, backgroundColor: appcolor.light }}>
                            <Badge badgeStyle={{ position: 'absolute', top: -8, right: -8 }} value={totalPhoto} />
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 5 }}>
                                {
                                    Status != 1 ?
                                        <Icon name='camera' color={appcolor.primary} type='ionicon' size={16}></Icon>
                                        :
                                        <Icon name='images' color={appcolor.primary} type='ionicon' size={16}></Icon>
                                }
                                <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>{Status != 1 ? 'Chụp hình' : 'Xem hình'}</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <View style={{ flexDirection: 'row', width: '50%', justifyContent: "flex-end" }}>
                            {
                                Status != 1 && <TouchableOpacity
                                    key={'TakePictureButton'}
                                    onPress={() => takePhoto(itemTab.displayRef)}
                                    style={{ flexDirection: 'row', minHeight: 30, marginRight: 2, padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: appcolor.light }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name='camera' color={appcolor.primary} type='ionicon' size={16}></Icon>
                                        <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>Chụp hình</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity
                                key={'ViewImageButton'}
                                onPress={() => showAlbum(itemTab.displayRef)}
                                style={{ minHeight: 30, padding: 3, paddingVertical: 5, marginRight: 3, borderRadius: 6, backgroundColor: appcolor.light }}>
                                <Badge badgeStyle={{ position: 'absolute', top: -8, right: -8 }} value={totalPhoto} />
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name='images' color={appcolor.primary} type='ionicon' size={16}></Icon>
                                    <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>Xem hình</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </View >
            <View>
                <ViewInputHeader isShowNote={isShowNote} inputNote={inputNote} inputShelves={inputShelves} appcolor={appcolor} endChangeNote={endChangeNote} onChangeNote={onChangeNote} onChangeShelve={onChangeShelve} Status={Status} lstReport={lstReport} />
            </View>
        </View>
    )
}
const ViewInputHeader = ({ isShowNote, inputNote, inputShelves, appcolor, endChangeNote, onChangeNote, onChangeShelve, Status, lstReport }) => {

    return (
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ display: isShowNote == true ? 'flex' : 'none' }}>
                {/* {
                    lstReport?.isNoteBySKU !== 1 && */}
                <FormGroup
                    key={'NoteInput'}
                    iconName={'comment-alt'}
                    multiline={true} selectTextOnFocus={true}
                    containerStyle={{ backgroundColor: Status !== 1 ? appcolor.light : appcolor.grayLight, width: '100%', minHeight: 30, padding: 3, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5, }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                    placeholder={lstReport.placeholderNote || 'Nhập ghi chú...'}
                    editable={Status !== 1 ? true : false}
                    onClearTextAndroid={() => onChangeNote('')}
                    handleChangeForm={(text) => onChangeNote(text)}
                    defaultValue={inputNote || ''}
                />
                {/* } */}
            </View>
            <View style={{ display: isShowNote == false ? 'flex' : 'none' }}>
                <FormGroup
                    key={'ShelveInput'}
                    iconName={'comment-alt'} selectTextOnFocus={true}
                    containerStyle={{ backgroundColor: Status !== 1 ? appcolor.light : appcolor.grayLight, width: '100%', minHeight: 30, padding: 3, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5, }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                    placeholder='Nhập số lượng quầy kệ'
                    keyboardType="numeric"
                    editable={Status !== 1 ? true : false}
                    onClearTextAndroid={() => onChangeShelve('')}
                    handleChangeForm={(text) => onChangeShelve(text)}
                    value={inputShelves || ''}
                />
            </View>
        </View>
    )
}
const RenderItem = ({ item, index, data, Styles, workinfo, listInput, appcolor, Status, lstReport, listMaster }) => {
    const [itemDisplay, _] = useState(item)
    const keyExtractor = useCallback((it) => it.id.toString(), [])
    const getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index
    })
    const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
    return (

        <View key={`${item.categoryId}_${item.subCatId}_${item.productId}`} style={{}}>
            {(keyLayer2 && item.subCategory) &&
                <View style={{ flex: 1, padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: appcolor.primary, fontSize: 16, paddingLeft: 8, fontWeight: '600' }}>{item.subCategory}</Text>
                </View>
            }
            <View style={Styles.itemStyle}>
                <Text style={Styles.titleStyle}>{`${index + 1}. ` + item.productName}</Text>
                <Text style={Styles.textItemStyle}>{item.productCode}</Text>
                <View>
                    <FlatList
                        key={itemDisplay.productId + '_ListInput'}
                        data={listInput}
                        getItemLayout={getItemLayout}
                        removeClippedSubviews={true}
                        renderItem={({ item, index }) => <RenderItemInput key={itemDisplay.productId + '_' + index} itemInput={item} indexInput={index} item={itemDisplay} Styles={Styles} listInput={listInput} appcolor={appcolor} data={data} workinfo={workinfo} Status={Status} lstReport={lstReport} />}
                        style={{ padding: 5 }}
                        numColumns={(listInput.length > 4 || listInput.length === 3) ? 3 : 2}
                        initialNumToRender={5}
                        keyExtractor={keyExtractor}
                    />
                </View>
                {
                    lstReport?.isNoteBySKU == 1 &&
                    <RenderItemNote key={'noteByProduct_' + itemDisplay.productId} lstReport={lstReport} appcolor={appcolor} item={itemDisplay} listMaster={listMaster} data={data} workinfo={workinfo} Status={Status} />
                }
            </View>
        </View>
    )
}
const RenderItemNote = ({ lstReport, appcolor, item, listMaster, data, workinfo, Status }) => {
    const [showList, setShowList] = useState({ isShowList: false, dataShow: [], noteSelect: {} })
    const [_, setMutate] = useState(false)
    const [isSelectOther, setSelectOther] = useState(true)
    const showListSelect = async (it) => {
        const listBySelect = listMaster[it.noteType]
        showList.isShowList = !showList.isShowList
        showList.dataShow = listBySelect
        showList.noteSelect = it
        setMutate(e => !e)
        await SheetManager.show('productSheet_' + item.productId)
    }
    const selectByList = async (it) => {
        const value = it.name == item[showList.noteSelect?.noteType] ? null : it.name
        const indexF = data.dataShowF.findIndex(itP => itP.productId === item.productId && itP.workId === item.workId)
        const index = data.dataShow.findIndex(itP => itP.productId === item.productId && itP.workId === item.workId)
        if (it.id == 100) {
            data.dataShowF[indexF][showList.noteSelect?.noteType] = null
            data.dataShow[index][showList.noteSelect?.noteType] = null
            item[showList.noteSelect?.noteType] = null
            await updateItemDisplay(item, workinfo)
            await setSelectOther(e => !e)
        } else {

            data.dataShowF[indexF][showList.noteSelect?.noteType] = value;
            data.dataShow[index][showList.noteSelect?.noteType] = value;
            item[showList.noteSelect?.noteType] = value;
            await updateItemDisplay(item, workinfo)
            await setMutate(e => !e)
            await setSelectOther(false)
            await SheetManager.hide('productSheet_' + item.productId)
        }
    }
    const onChangeNote = async (text) => {
        const indexF = data.dataShowF.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        const index = data.dataShow.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        data.dataShowF[indexF][showList.noteSelect?.noteType] = ((text !== null && text?.length > 0) ? text : null);
        data.dataShow[index][showList.noteSelect?.noteType] = ((text !== null && text?.length > 0) ? text : null);
        item[showList.noteSelect?.noteType] = ((text !== null && text?.length > 0) ? text : null);
        await updateItemDisplay(item, workinfo)
        await setMutate(e => !e)
    }

    return (
        <View style={{ paddingTop: 2 }}>
            {
                lstReport.listNote?.map((it, idx) => {
                    return it.typeValue == 'selectText' ?
                        <View key={it.noteType + "_" + idx + item.productId}>
                            <TouchableOpacity key={it.noteType} onPress={() => Status !== 1 ? showListSelect(it) : null} style={{
                                width: '100%', marginBottom: 4, shadowColor: appcolor.black, bottom: 2,
                                shadowOffset: { width: 0, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                            }}>
                                <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                                    <Text style={{ fontSize: 12, fontWeight: '400', color: item[it.noteType] ? appcolor.dark : appcolor.placeholderText }}>{item[it.noteType] || it.name}</Text>
                                    <Icon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                                </View>
                            </TouchableOpacity>

                        </View>
                        :
                        <FormGroup
                            key={it.noteType + item.productId}
                            iconName={'comment-alt'}
                            multiline={true} selectTextOnFocus={true}
                            containerStyle={{ backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3, marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5, }}
                            inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                            placeholder='Nhập ghi chú...'
                            // editable={item.upload !== 1 ? true : false}
                            onClearTextAndroid={() => onChangeNote('')}
                            handleChangeForm={(text) => onChangeNote(text)}
                            defaultValue={item[it.noteType] || ''}
                        />
                })
            }
            <ActionSheet
                id={'productSheet_' + item.productId}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >

                <View style={{ height: deviceHeight / 1.6 }}>
                    <ScrollView style={{ marginHorizontal: 10 }}>
                        {
                            showList.dataShow?.map((itSelect, idxSelect) => {
                                return (
                                    <TouchableOpacity key={`${item.productId}_` + itSelect.id} onPress={() => selectByList(itSelect)} style={{
                                        width: '100%', marginBottom: 4,
                                    }}>
                                        <View style={{
                                            backgroundColor: itSelect.name == item[showList.noteSelect?.noteType] ? appcolor.light : appcolor.surface,
                                            width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35,
                                            padding: 3, borderRadius: 4, borderWidth: 0.5,
                                            borderColor: (itSelect.name == item[showList.noteSelect?.noteType]) || (isSelectOther && itSelect.id == 100) ? appcolor.success : appcolor.grayLight
                                        }}>
                                            <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark }}>{itSelect.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                        {
                            isSelectOther &&
                            <FormGroup
                                key={'noteOther_' + item.productId}
                                iconName={'comment-alt'}
                                multiline={true} selectTextOnFocus={true}
                                containerStyle={{
                                    backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3,
                                    marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                }}
                                inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                                placeholder='Nhập ghi chú...'
                                editable={item.upload !== 1 ? true : false}
                                onClearTextAndroid={() => onChangeNote('')}
                                handleChangeForm={(text) => onChangeNote(text)}
                                defaultValue={item[showList.noteSelect?.noteType] || ''}
                            />
                        }
                    </ScrollView>
                </View>
            </ActionSheet >

        </View>
    )

}
const RenderItemInput = ({ itemInput, indexInput, item, Styles, listInput, appcolor, data, workinfo, Status, lstReport }) => {
    const [input, setInput] = useState(itemInput.displayType == 'fsmValue' ? (item.fsmValue || '') :
        itemInput.displayType == 'price' ? (item.price || '') :
            itemInput.displayType == 'quanity' ? (item.quanity === 0 ? 0 : (item.quanity || '')) :
                itemInput.displayType == 'quantityStock' ? (item.quantityStock === 0 ? 0 : (item.quantityStock || '')) :
                    itemInput.displayType == 'tagPOPId' ? (item.tagPOPId === 0 ? 0 : (item.tagPOPId || '')) :
                        (item.quantitySuggest === 0 ? 0 : (item.quantitySuggest || '')));
    const [_, setmutate] = useState()

    const changeValue = async (text) => {
        let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        if (intValue && intValue > 0) {
            item[itemInput.displayType] = intValue
        } else if ((itemInput.displayType === 'quanity' || itemInput.displayType === 'quantityStock' || itemInput.displayType === 'quantitySuggest' || itemInput.displayType === 'tagPOPId') && intValue === 0) {
            item[itemInput.displayType] = 0
            intValue = 0
        } else {
            item[itemInput.displayType] = null
            intValue = null
        }

        setInput(intValue)

        // // const indexF = data.dataShowF.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        // // const index = data.dataShow.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        // // console.log(index);
        // // console.log(indexF);

        // data.dataShowF[indexF][itemInput.displayType] = intValue;
        // data.dataShow[index][itemInput.displayType] = intValue;
        await updateItemDisplay(item, workinfo)
    }

    const endInput = async (e) => {
        let value = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        let isError = 0
        if (intValue < ((lstReport?.minPrice && lstReport?.minPrice !== '') ? lstReport?.minPrice : 1000) && (itemInput.displayType === 'price' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            ToastError("Nhập số tiền không được nhỏ hơn " + (lstReport?.minPrice || 1000) + "!", "Lỗi", "top");
        } else if (intValue % ((lstReport?.minPrice && lstReport?.minPrice !== '') ? lstReport?.minPrice : 1000) > 0 && (itemInput.displayType === 'price' || itemInput.displayType === 'fsmValue')) {
            item[itemInput.displayType] = null
            intValue = null;
            isError = 1;
            setInput(null)
            ToastError("Nhập số tiền không được lẻ!", "lỗi", "top");
        } else if (lstReport?.numCheckProduct > 0 && intValue >= lstReport?.numCheckProduct && itemInput.displayType === 'quanity') {
            ToastError(`Số lượng trưng bày sản phẩm > ${lstReport?.numCheckProduct}`, "Cảnh báo", "top");
        } else {
            isError = 0
        }

        // const indexF = data.dataShowF.findIndex(it => it.productId === item.productId && it.workId === item.workId)
        // console.log(indexF, 'indexFindexF');
        // data.dataShowF[indexF][itemInput.displayType] = intValue;
        if (itemInput.displayType === 'price') {
            // data.dataShowF[indexF].priceError = isError;
            item.priceError = isError;
            setmutate(e => !e)
        } else if (itemInput.displayType === 'fsmValue') {
            // data.dataShowF[indexF].fsmValueError = isError;
            item.fsmValueError = isError;
            setmutate(e => !e)
        }
        await updateItemDisplay(item, workinfo)
    }
    const indexItem = (listInput.length > 4 || listInput.length === 3) ? 2 : 1
    return (
        <View key={item.productId + '_' + listInput.id} style={[Styles.itemInputStyle, { width: ((indexInput > 2 && indexInput < 5) || (listInput.length % 2 === 0)) ? '49.5%' : '33%' }]}>
            {indexItem >= indexInput && <Text style={Styles.titleInputStyle}>{itemInput.name}</Text>}
            <NumberFormat
                value={input === 0 ? 0 : (input || '')}
                displayType='text'
                thousandSeparator={true}
                renderText={value =>
                    <TextInput
                        textAlign={'center'}
                        value={value}
                        style={[Styles.textInputStyle, { backgroundColor: (itemInput.displayType === 'fsmValue' && item.fsmValueError === 1) || (itemInput.displayType === 'price' && item.priceError === 1) ? appcolor.warning : appcolor.light }]}
                        keyboardType='numeric'
                        placeholder={itemInput.displayType === 'fsmValue' ? 'Tiền thưởng' : (itemInput.displayType === 'price' ? 'Giá' : 'Số lượng')}
                        placeholderTextColor={appcolor.greydark}
                        editable={Status !== 1 ? true : false}
                        selectTextOnFocus={item.upload !== 1}
                        onChangeText={changeValue}
                        onEndEditing={endInput}
                    />
                }
            />
            {indexInput > indexItem && <Text style={Styles.titleInputStyle}>{itemInput.name}</Text>}
        </View>
    )
}
