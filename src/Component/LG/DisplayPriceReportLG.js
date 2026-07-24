import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, Text, TextInput, FlatList, TouchableOpacity, Keyboard, KeyboardAvoidingView, Pressable, RefreshControl, StyleSheet } from "react-native";
import { Icon, Button, Badge } from '@rneui/themed';
import { getDisplayResult, getAllPhotosUpload, getPhotosReport, getAllPhotos } from '../../Controller/WorkController'
import { updateNoteDisplayReport, getNoteDisplayReport } from '../../Controller/WorkController'
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab, } from "../../Core/Utility";
import { isNotInteger, Message, ToastError, ToastSuccess } from '../../Core/Helper';
import { _competitorId, _competitorName } from '../../Core/URLs'
import UploadController from '../../Controller/UploadController';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { scaleSize } from '../../Themes/AppsStyle';
import NumberFormat from 'react-number-format';
import { useFocusEffect } from '@react-navigation/native';
import FormGroup from '../../Content/FormGroup';
import { clearAllDataDisplay, getDisplayProduct, getlistTabCompetitor, updateItemDisplay } from '../../Controller/DisplayController'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { LoadingView } from '../../Control/ItemLoading';
import { GetByListCode } from '../../Controller/MasterController';
import { checkLockReport } from '../../Controller/ShopController';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    line: {
        width: '100%',
        height: 0.6,
        backgroundColor: '#e9e9e9',
        paddingStart: 10,
        paddingEnd: 10,
        marginBottom: 4,
        marginTop: 4
    }
});

const DisplayPriceReportLG = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
    const [arrTabShow, setArrTabShow] = useState([]);
    const [arrDataShow, setArrDataShow] = useState([]);
    const [arrDataShowF, setArrDataShowF] = useState([]);
    const [listMaster, setListMaster] = useState([])
    const [noteSaved, setNoteSaved] = useState('');
    const [isHiddenNote, setNote] = useState(true);
    const [showProgress, setProgress] = useState(false);
    const [isDone, setDone] = useState(false);
    const [Status, setStatus] = useState(false);
    const [isClear, setClear] = useState(0);
    const [isFilterCheck, setFilterCheck] = useState(false)
    const [mode, setMode] = useState('TOOLS');
    const [search, setSearch] = useState('');
    const [lstPhotoByCategory, setPhotoByCategory] = useState([])
    const ref_bottomSheet = useRef()
    const tabRef = useRef()
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const [settings, setSettings] = useState({ isLockReport: false, isUploaded: false })
    const [dataItem, setDataItem] = useState({ itemInfo: {}, isChange: 0, itemArea: null })

    const loadDataShow = async () => {
        await setProgress(true)
        // lock report 
        const lockReport = await checkLockReport(shopinfo)
        const lstResults = await getDisplayResult(workinfo);
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setSettings({
                isLockReport: lockReport,
                isUploaded: lstResults[0]?.upload == 1 || false
            })
        } else {
            await setSettings({
                isLockReport: lockReport,
                isUploaded: true
            })
        }

        // 
        let lstRes = await getDisplayResult(workinfo);
        let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
        await setStatus(isUpload)
        const lstItemsProgram = await getDisplayProduct(workinfo)
        const lstTab = await getlistTabCompetitor(_competitorId)//list tab
        const listMaster = await GetByListCode(`'DisplayArea'`)
        await setArrTabShow(lstTab);
        await setArrDataShow(lstItemsProgram);
        await setArrDataShowF(lstItemsProgram);
        await setListMaster(listMaster)
        setTimeout(async () => { await setProgress(false) }, 1000)
    }

    useEffect(() => {
        loadDataShow();
        return () => showProgress;
    }, [])
    useFocusEffect(
        useCallback(() => {
            countNumPhoto()
            return () => false;
        }, [])
    );
    const checkConstraintIMG = (finish) => {
        const LstMenuPhotos = lstReport.ImageByList || []
        let noteStr = '';
        let res = true;
        arrTabShow.map((itT) => {
            if (LstMenuPhotos[itT.name]) {
                let lstTem = LstMenuPhotos[itT.name];
                lstTem.map(async it => {
                    let photoType = 'Display' + '_' + it.code
                    let lstPhoto = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate);
                    if (lstPhoto.length < it.numberIMG && res) {
                        // console.log(it.nameVN)
                        noteStr += itT.name + ': Vui lòng chụp ' + it.numberIMG + ' tấm hình cho ' + it.nameVN + ', ';
                        finish(noteStr);
                        res = false;
                    }
                })
            }
        })

        return noteStr;
    }
    const uploadAction = async () => {
        let resDisplay = await getDisplayResult(workinfo);
        let resPhotos = await getAllPhotosUpload(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        let noteStr = '';
        //check limit photo
        let isConstraint
        let numLimitPhoto
        if (lstReport) {
            try {
                if (lstReport.isConstraint !== undefined) {
                    isConstraint = lstReport.isConstraint;
                }
                if (lstReport.image !== undefined) {
                    numLimitPhoto = lstReport.image
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (isConstraint !== undefined && isConstraint === 1) {
            if (numLimitPhoto !== undefined && numLimitPhoto > 0 && resPhotos.length < numLimitPhoto) {
                noteStr += 'Vui lòng chụp ' + numLimitPhoto + ' tấm hình cho báo cáo.';
            }
            if (numLimitPhoto !== undefined && numLimitPhoto === 0) {
                await checkConstraintIMG((res) => { noteStr = res });
            }
        }

        if (Status === 1) {
            ToastError("Báo cáo đã khóa");
            return;
        }

        if (resDisplay.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        if (lstReport.isConstraintPrice == 2 || lstReport.isConstraintPrice == 3) {
            let checkArea = resDisplay.filter(it => (it.quanity === 'null' || it.quanity === null) && (it.displayArea !== 'null' && it.displayArea !== null && it.displayArea.length > 0));
            if (checkArea.length > 0) {
                let product = arrDataShowF.filter(it => it.productId === checkArea[0].productId)
                ToastError('Bạn chọn khu vực trưng bày nhưng chưa nhập số lượng. - Ngành hàng : ' + product[0].categoryName + ' - sản phẩm: ' + product[0].productName, "Thông báo", "top");
                return;
            }
        }
        if (lstReport.isConstraintPrice == 1 || lstReport.isConstraintPrice == 2) {
            let checkConstraintArea = resDisplay.filter(it => (it.quanity !== 'null' && it.quanity !== null) && (it.price === 'null' || it.price === null));
            if (checkConstraintArea.length > 0) {
                let product = arrDataShowF.filter(it => it.productId === checkConstraintArea[0].productId)
                ToastError('Bạn nhập số lượng nhưng chưa nhập giá. - Ngành hàng : ' + product[0].categoryName + ' - sản phẩm: ' + product[0].productName, "Thông báo", "top");
                return;
            }
        }

        let checkPrice = resDisplay.filter(it => (it.quanity !== 'null' && it.quanity !== null) && it.price !== null && it.price !== 'null' && (it.price < 10000 || it.price % 1000 > 0));
        if (checkPrice.length > 0) {
            let product = arrDataShowF.filter(it => it.productId === checkPrice[0].productId)
            ToastError('Vui lòng nhập giá đúng định dạng. Hãng: ' + product[0].division + '     - Loại : ' + product[0].categoryName + '     - sản phẩm: ' + product[0].productName, "Thông báo", "top");
            return;
        }

        let items = resDisplay.filter(it => (it.quanity === 'null' || it.quanity === null) && (it.price !== 'null' && it.price !== null && it.price > 0));
        if (items.length > 0) {
            let product = arrDataShowF.filter(it => it.productId === items[0].productId)
            ToastError('Bạn đã nhập giá nhưng chưa nhập số lượng. Hãng: ' + product[0].division + '     - Loại : ' + product[0].categoryName + '     - sản phẩm: ' + product[0].productName, "Thông báo", "top");
            return;
        }

        let itemsUpload = resDisplay.filter(it => it.quanity !== 'null' && it.quanity !== null);
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        if (noteStr !== '') {
            ToastError(noteStr);
            return
        }

        // console.log(itemsUpload, 'check upload');
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload, resPhotos));
    }
    //Clear all data input
    const clearData = async () => {
        arrDataShowF.map(it => {
            it.quanity = null
            it.price = null
            it.displayComment = null
        })
        await setArrDataShow(arrDataShowF)
    }
    const setClearAll = async (itemCategory) => {
        if (Status !== 1) {
            Message('Chú ý', `Bạn có chắc chắn muốn xóa hết dữ liệu ${itemCategory ? itemCategory.categoryName : ''} đã nhập ?`,
                async () => {
                    await clearAllDataDisplay(workinfo, itemCategory?.categoryId || null);
                    await setDone(false);
                    // await setClear(isClear + 1);
                    // await clearData()
                    await loadDataShow()
                    ref_bottomSheet.current?.hide()
                    await loadDataShow()
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            ref_bottomSheet.current?.hide()
        }
    }

    // Upload data
    const UploadData = async (resDisplay, resPhotos) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await UploadController.DataDisplay(resDisplay, work, async () => {
            await loadDataShow();
        }, async () => {
        })


    }
    // Node if no display
    const cancelNote = async () => {
        if ('NOTE') {
            setNoteSaved('');
        }
    }
    const updateNote = async () => {
        if (noteSaved?.length > 0 && noteSaved?.length < 5) {
            ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự.', 'Thông báo', 'top');
            return
        }
        setNote(false);
        let itemNote = {
            workId: workinfo.workId,
            displayRef: arrTabShow[tabRef.current.getCurrentIndex()].displayRef,
            displayComment: noteSaved || '',
            division: _competitorName
        }
        ref_bottomSheet.current.hide()
        await updateNoteDisplayReport(itemNote);
        ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
        await setMode('');
    }

    //Event search
    const filterDoneProduct = async () => {
        if (!isDone) {
            let lstRes = arrDataShow.filter(it => it.quanity !== null && it.quanity >= 0 || it.price !== null && it.price >= 0 || it.isCheck === 1 || it.displayArea !== null)
            const filterCheck = lstRes.filter(it => it.isCheck === 1)
            filterCheck.length > 0 ? setFilterCheck(true) : setFilterCheck(false)
            setArrDataShow(lstRes)
        } else {
            setArrDataShow(arrDataShowF)
        }
        setDone(e => !e)
    }
    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = arrDataShowF.filter(it => it.quanity !== null && it.quanity >= 0 || it.price !== null && it.price >= 0 || it.displayArea !== null)
        else
            dataSearch = arrDataShowF

        if (text !== null && text.length > 0) {
            const mResult = await dataSearch.filter((it) => {
                const nameProduct = it.productName ? it.productName.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return nameProduct.indexOf(textData) > -1
            })
            setArrDataShow(mResult)
            setSearch(text)
        } else {
            setArrDataShow(dataSearch)
            setSearch(text)
        }
    }
    const countNumPhoto = async () => {
        let listPhoto = await getAllPhotos(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        setPhotoByCategory(listPhoto)
    }
    const handlerTakePhoto = (categoryName) => {
        navigation.navigate('photogroup', { Status: Status, keyPhoto: categoryName, hideIcon: true })
    }
    const handlerNote = async (categoryName) => {
        let lst = await getNoteDisplayReport(workinfo.workId, categoryName, _competitorName)
        if (lst !== null && lst.length > 0) {
            lst.length > 0 && await setNoteSaved(lst[0].displayComment);
        }
        await openSheet('NOTE')
    }

    const HeaderTabView = ({ it, totalPhoto }) => {

        return (
            <View style={styles.container}>
                <View style={{
                    backgroundColor: appcolor.surface, flexDirection: 'row',
                    justifyContent: 'space-between', padding: 12
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <TouchableOpacity
                            onPress={() => handlerTakePhoto(it.categoryName)}
                            style={{ flexDirection: 'row', height: 40, width: '45%', marginRight: 2, justifyContent: 'center' }}>
                            <View style={{ marginLeft: 15 }}>
                                <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={25}></SpiralIcon>
                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Chụp hình</Text>
                            </View>
                            <Badge value={totalPhoto} />
                        </TouchableOpacity>
                        <View style={{ width: 2, backgroundColor: appcolor.white }} />
                        <TouchableOpacity
                            onPress={() => handlerNote(it.categoryName)}
                            style={{ height: 40, width: '45%', marginRight: 2 }}>
                            <SpiralIcon name='create-outline' color={appcolor.primary} type='ionicon' size={25}></SpiralIcon>
                            <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Ghi chú</Text>
                        </TouchableOpacity>
                    </View>


                </View >
                <View style={styles.line}></View>
            </View>

        )
    }

    const ViewItem = () => {
        let dataByCategoryId = []
        return (
            arrTabShow?.map((it, indexCate) => {
                dataByCategoryId = arrDataShow?.filter(i => i.categoryName === it.categoryName)
                const totalRow = dataByCategoryId.length
                const totalPhoto = (lstPhotoByCategory?.filter(i => i.photoType.includes(it.categoryName)) || []).length
                return (
                    <Tabs.Tab key={it.categoryName + indexCate} label={it.categoryName + `${totalRow !== 0 ? ` (${totalRow})` : ''}`}
                        name={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} >
                        {!showProgress &&
                            <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>

                                <View key={'takePhoto' + indexCate} style={{ flex: 1, }}>

                                    <KeyboardAvoidingView
                                        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                                        behavior={Platform.OS == "ios" ? "padding" : null}
                                        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                                        <FlatList
                                            contentContainerStyle={{ paddingBottom: 30 }}
                                            key={(item) => item.id}
                                            keyExtractor={(item, index) => item + index}
                                            data={dataByCategoryId}
                                            initialNumToRender={10}
                                            // updateCellsBatchingPeriod={20}
                                            removeClippedSubviews={true}
                                            windowSize={10}
                                            ListHeaderComponent={<HeaderTabView it={it} totalPhoto={totalPhoto} />}
                                            renderItem={
                                                ({ item, index }) => <RenderItemData
                                                    isClear={isClear} setClear={() => setClear()}
                                                    item={item} index={index} totalRow={totalRow} appcolor={appcolor}
                                                    isDone={isDone} workinfo={workinfo} isFilterCheck={isFilterCheck}
                                                    lstReport={lstReport} listMaster={listMaster} arrDataShow={arrDataShow} dataByCategoryId={dataByCategoryId}
                                                    showSheetPosition={showSheetPosition} dataItem={dataItem} />
                                            }
                                            ListFooterComponent={
                                                <View style={{ height: deviceHeight / 2.5 }}>
                                                    <Text style={{ width: '100%', color: appcolor.dark, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>Đã xem hết</Text>
                                                </View>}
                                            refreshControl={<RefreshControl
                                                refreshing={false}
                                                onRefresh={loadDataShow}
                                            />}
                                        />
                                    </KeyboardAvoidingView>
                                </View >
                            </View>
                        }
                    </Tabs.Tab >
                )
            })
        )
    }
    const openSheet = async (type) => {
        await setMode(type);
        ref_bottomSheet.current.show()
    }
    const ButtonClearCate = () => {
        return (
            <TouchableOpacity
                style={{
                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                    borderColor: appcolor.danger, marginBottom: 5
                }}
                onPress={() => setClearAll(arrTabShow[tabRef.current.getCurrentIndex()])}>
                <Text style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }} >Xóa dữ liệu {arrTabShow[tabRef.current.getCurrentIndex()].categoryName} Đã nhập</Text>
                <SpiralIcon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
            </TouchableOpacity>
        )
    }
    const showSheetPosition = (item) => {
        setDataItem({ itemInfo: item, isChange: 0, itemArea: (item.displayArea != null && item.displayArea.length > 0) ? JSON.parse(item.displayArea) : null })
        SheetManager.show('ref_positionSheet')
    }
    const handleSelectItemSheet = async (item) => {
        const itemUpdate = { ...dataItem.itemInfo, displayArea: dataItem.itemArea?.id === item.id ? null : JSON.stringify(item) }
        setDataItem({ itemInfo: itemUpdate, isChange: 1, itemArea: dataItem.itemArea?.id === item.id ? null : item })
        SheetManager.show('ref_positionSheet')
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                // iconRight='cloud-upload-alt'
                // rightFunc={Status !== 1 ? () => uploadAction() : null}
                iconRight={!settings.isLockReport ? (!settings.isUploaded ? 'cloud-upload-alt' : null) : 'user-lock'}
                rightFunc={!settings.isLockReport ? (!settings.isUploaded ? () => uploadAction() : null) : () => {
                    ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')
                }}
                leftFunc={() => navigation.goBack()}
            />
            <View style={{ backgroundColor: appcolor.light, flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <FormGroup
                        containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, padding: 3, paddingEnd: 8, width: '80%' }}
                        inputStyle={{ fontSize: 13, color: appcolor.dark }}
                        placeholder='Tìm kiếm sản phẩm' editable
                        iconName='search'
                        onClearTextAndroid={filterProduct}
                        value={search} handleChangeForm={filterProduct}
                    />
                    <TouchableOpacity
                        onPress={() => openSheet('TOOLS')}
                        style={{
                            height: 40, width: '10%',
                            backgroundColor: appcolor.grayLight, borderRadius: 40,
                            marginRight: 15,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <SpiralIcon name='ellipsis-vertical' type='ionicon' size={25} color={appcolor.dark} />
                    </TouchableOpacity>

                </View>

                {
                    arrTabShow?.length > 0 &&
                    <Tabs.Container
                        ref={tabRef}
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                tabStyle={{ minWidth: minWidthTab(arrTabShow), height: 42 }}
                                scrollEnabled={true}
                                style={{ backgroundColor: appcolor.light }}
                            />
                        )}
                        containerStyle={{ backgroundColor: appcolor.surface }}>
                        {ViewItem()}
                    </Tabs.Container>
                }
            </View>

            <ActionSheet
                ref={ref_bottomSheet}
                headerAlwaysVisible={true}
                defaultOverlayOpacity={0.1}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.light, alignSelf: 'center', paddingBottom: insets.bottom }}
                onClose={() => cancelNote()}  >
                {
                    mode === 'NOTE' &&
                    <View style={{ opacity: 1.0, borderRadius: 10, width: '100%', marginBottom: 24 }}>
                        <Text style={{ padding: 8, color: appcolor.dark, fontWeight: 'bold', fontSize: 16 }}>Ghi chú</Text>
                        <TextInput
                            editable={Status !== 1 ? true : false} selectTextOnFocus={Status !== 1 ? true : false}
                            numberOfLines={6}
                            multiline={true}
                            autoCorrect={false}
                            onChangeText={setNoteSaved}
                            style={{
                                margin: 5,
                                padding: 10,
                                color: appcolor.dark,
                                height: 105,
                                textAlign: 'left',
                                borderWidth: 0.4,
                                borderRadius: 5,
                                borderColor: appcolor.dark,
                                backgroundColor: appcolor.light
                            }}
                            placeholderTextColor={appcolor.greydark}
                            defaultValue={noteSaved || ''}
                            placeholder='Nhập ghi chú ở đây.'
                        />
                        {Status !== 1 &&
                            <View style={{ marginTop: 8, flexDirection: 'row', alignSelf: 'center', width: '100%', height: 50, padding: 5 }}>
                                <Button
                                    titleStyle={{ color: appcolor.primary, fontSize: 14 }}
                                    buttonStyle={{ width: '90%', backgroundColor: appcolor.light, borderColor: appcolor.primary, borderWidth: 1, borderRadius: 5 }}
                                    title='Huỷ'
                                    onPress={() => cancelNote()}
                                />
                                <Button
                                    titleStyle={{ color: appcolor.light, fontSize: 14 }}
                                    buttonStyle={{ width: '94%', backgroundColor: appcolor.primary, borderColor: appcolor.primary, borderWidth: 1, borderRadius: 5 }}
                                    title='Lưu'
                                    onPress={() => updateNote()}
                                />
                            </View>
                        }
                    </View>
                }
                {
                    mode === 'TOOLS' &&
                    <View style={{ padding: 8, width: '100%', height: '40%' }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600', padding: 8 }}>Công cụ</Text>
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.dark, marginBottom: 5
                                }}
                                onPress={() => filterDoneProduct()}>
                                <Text style={{ color: appcolor.dark, width: '80%', textAlign: 'center' }} >Sản phẩm đã nhập</Text>
                                <SpiralIcon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={23} color={!isDone ? appcolor.dark : appcolor.success} />
                            </TouchableOpacity>
                            <ButtonClearCate />
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.danger, marginBottom: 5
                                }}
                                onPress={() => setClearAll()}>
                                <Text style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }} >Xóa tất cả dữ liệu đã nhập</Text>
                                <SpiralIcon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </ActionSheet>
            {/* <ActionSheet
                id={'ref_positionSheet'}
                gestureEnabled
                onClose={() => setDataItem({ itemInfo: {}, isChange: 0, itemArea: {} })}
            >
                <View style={{
                    width: '100%', flexDirection: 'row', padding: 5, marginBottom: 20, justifyContent: 'space-between'
                }}>
                    {
                        listMaster.map((it, index) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => handleSelectItemSheet(it)}
                                    key={'posion_' + index}
                                    style={{ width: '30%', padding: 10, borderRadius: 5, backgroundColor: (dataItem.itemArea != null && dataItem.itemArea.id == it.id) ? appcolor.primary : appcolor.surface, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Text style={{ paddingLeft: 3, fontWeight: '400', fontSize: 12, color: (dataItem.itemArea != null && dataItem.itemArea.id == it.id) ? appcolor.white : appcolor.dark }}>{it.name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </ActionSheet > */}

            {
                showProgress &&
                <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
        </View >
    )
}
export default DisplayPriceReportLG

const RenderItemData = ({ item, isClear, totalRow, appcolor, workinfo, index, setClear, isDone, isFilterCheck, lstReport, listMaster, showSheetPosition, dataItem, arrDataShow, dataByCategoryId }) => {

    const [inputDisplay, setInputDisplay] = useState(item.quanity);
    const [inputPrice, setInputPrice] = useState(item.price);
    const [colorInput, setColorInput] = useState({})
    const [countClear, setCountClear] = useState(0)
    const [isCheck, setCheck] = useState(item.isCheck)
    const [_, setMutate] = useState(false)
    const [isShowArea, setShowArea] = useState(false)

    // console.log(!inputDisplay && !item.quanity, !item.quanity && isClear !== 0 && inputDisplay, 'check clear');
    if (!inputDisplay && item.quanity) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && isClear !== 0 && inputDisplay) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && isClear !== 0 && inputDisplay == 0 && isClear - countClear > 0) {
        setInputDisplay(null);
    }
    if ((!inputPrice && item.price)) {
        setInputPrice(item.price)
    } else if (!item.price && inputPrice && isClear !== 0) {
        setInputPrice(item.price)
    }

    // if (dataItem.isChange == 1 && dataItem.itemInfo?.productId === item.productId) {
    //     item.displayArea = dataItem.itemInfo?.displayArea
    //     dataItem.isChange = 0
    //     setMutate(e => !e)
    //     updateItemDisplay(item, workinfo)
    // }

    const endInputDisplay = async (item) => {
        let display = inputDisplay;
        let itemEdit = { ...item }
        itemEdit.quanity = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null
        await updateItemDisplay(itemEdit, workinfo)
    }
    const endInputPrice = async (item, e, index) => {

        let numberInput = inputPrice;
        let isError = 0
        if (parseInt(numberInput) < 10000) {
            item.price = null
            await setInputPrice(null);
            numberInput = null;
            isError = 1;
            ToastError("Nhập giá không được nhỏ 10.000", "Thông báo", "top");
        } else if (parseInt(numberInput) % 1000 > 0) {
            item.price = null
            await setInputPrice(null);
            numberInput = null;
            isError = 1;
            ToastError("Nhập giá không được lẻ", "Thông báo", "top");
        } else {
            isError = 0
        }

        if (isError === 1) {
            if (Object.keys(colorInput).length === 0) {
                setColorInput({ index: index, categoryId: item.categoryId, productId: item.productId });
            }
        } else if (isError === 0) {
            if (Object.keys(colorInput).length > 0) {
                setColorInput({})
            }
        }
        let itemEdit = { ...item }
        itemEdit.price = (numberInput !== '' && numberInput !== undefined && numberInput !== null) ? parseInt(numberInput) : null
        await updateItemDisplay(itemEdit, workinfo)
    }
    const changeValueDisplay = async (text) => {
        isClear - countClear > 0 ? setCountClear(isClear) : null
        let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        if (isNotInteger(display))
            display = '';

        let intValue = display === '' ? null : parseInt(display);
        let itemEdit = { ...item }

        if (intValue || intValue === 0) {
            item.quanity = intValue
            itemEdit.quanity = intValue
            await setInputDisplay(intValue)
        } else {
            item.quanity = null
            itemEdit.quanity = null
            await setInputDisplay();
        }
        await updateItemDisplay(itemEdit, workinfo)
    }
    const changeValuePrice = async (text) => {

        let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        if (isNotInteger(display))
            display = '';

        let intValue = display === '' ? null : parseInt(display);
        let itemEdit = { ...item }
        if (intValue && intValue > 0) {
            item.price = intValue
            itemEdit.price = intValue
            await setInputPrice(intValue)
        } else {
            item.price = null
            itemEdit.price = null
            await setInputPrice();
        }
        await updateItemDisplay(itemEdit, workinfo)
    }
    const handleSelectCheckBox = async () => {
        item.isCheck = item.isCheck === 1 ? 0 : 1
        await setCheck(item.isCheck)
    }

    const handleShowPositionSheet = () => {
        item.isShowArea = item.isShowArea ? false : true
        // arrDataShow.map(it => it.productId == item.productId ? (it.isShowArea = it.isShowArea ? false : true) : null)
        // dataByCategoryId.map(it => it.productId == item.productId ? (it.isShowArea = it.isShowArea ? false : true) : null)
        // setShowArea(e => !e)
        setMutate(e => !e)
        // showSheetPosition(item)
    }
    const onSelectArea = (itemArea) => {
        item.isShowArea = itemArea.id === JSON.parse(item.displayArea)?.id ? true : false
        item.displayArea = itemArea.id === JSON.parse(item.displayArea)?.id ? null : JSON.stringify(itemArea)
        updateItemDisplay(item, workinfo)
        setMutate(e => !e)
    }

    return (
        <View style={{ width: '100%', alignItems: 'center', minHeight: 55, borderRadius: 5 }} onPress={() => onItemPress(item)} >
            <View style={{
                flexDirection: 'row', width: '100%', padding: 5, alignItems: 'center', borderRadius: 5,
                backgroundColor: (isDone && isFilterCheck &&
                    ((isCheck === 0 && inputDisplay > 0) ||
                        (isCheck === 1 && (inputDisplay === 0 || inputDisplay == null))))
                    ? appcolor.warning :
                    appcolor.surface
            }}>
                <TouchableOpacity
                    onPress={() => handleSelectCheckBox()}
                    style={{
                        width: '10%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <SpiralIcon color={isCheck === 1 ? appcolor.success : appcolor.dark} size={25} name={isCheck === 1 ? "check-square" : "square"} type="feather" />
                </TouchableOpacity>
                <View style={{ width: '45%', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '600', textAlign: 'left' }}>{index + 1}. {item.productName}</Text>
                    <Text style={{ fontSize: 11, color: appcolor.dark, fontStyle: 'italic', fontWeight: '600', textAlign: 'left' }}>{item.productCode}</Text>
                </View>
                <View style={{ width: '45%', flexDirection: 'column' }}>
                    <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: lstReport.isConstraintPrice == 4 ? 'flex-end' : 'center' }}>
                        <NumberFormat
                            value={inputDisplay === 0 ? 0 : (inputDisplay || '')}
                            displayType='text'
                            thousandSeparator={true}
                            renderText={value =>
                                <TextInput
                                    textAlign={'center'}
                                    value={value}
                                    style={{
                                        fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500', marginTop: 3,
                                        width: '40%', textAlign: 'center', borderWidth: 0.5, borderRadius: 7, borderColor: appcolor.greydark, height: 35
                                    }}
                                    keyboardType='numeric'
                                    placeholder='Số lượng'
                                    placeholderTextColor={appcolor.greydark}
                                    editable={item.upload === 1 ? false : true}
                                    selectTextOnFocus={item.upload === 1 ? false : true}
                                    onChangeText={changeValueDisplay}
                                    onEndEditing={e => endInputDisplay(item, e)}
                                />
                            }
                        />
                        {
                            (lstReport.isConstraintPrice !== 3 && lstReport.isConstraintPrice !== 4) &&
                            <NumberFormat
                                value={inputPrice || ''}
                                displayType='text'
                                thousandSeparator={true}
                                renderText={value =>
                                    <TextInput
                                        textAlign={'center'}
                                        value={value}
                                        style={{
                                            fontSize: 12, color: appcolor.dark,
                                            backgroundColor: Object.keys(colorInput).length === 0 ||
                                                (colorInput.categoryId !== item.categoryId && colorInput.index !== index && colorInput.productId !== item.productId) ? appcolor.light : appcolor.warning,
                                            borderWidth: 0.5, marginTop: 3,
                                            fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 7,
                                            borderColor: appcolor.greydark, height: 35, left: 2, width: '58%',
                                        }}
                                        keyboardType='numeric'
                                        placeholder='Giá'
                                        placeholderTextColor={appcolor.greydark}
                                        editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                                        onChangeText={changeValuePrice}
                                        onEndEditing={e => endInputPrice(item, e, index)}
                                    />
                                }
                            />
                        }
                        {
                            (lstReport.isConstraintPrice == 2 || lstReport.isConstraintPrice == 3) &&
                            <TouchableOpacity
                                onPress={() => item.upload === 1 ? null : handleShowPositionSheet()}
                                key={'itemPosition_' + index}
                                style={{
                                    width: lstReport.isConstraintPrice == 2 ? '100%' : '58%', flexDirection: 'row', justifyContent: 'center', marginTop: 3,
                                    alignItems: 'center', padding: 8, borderRadius: 5, borderColor: appcolor.dark, backgroundColor: appcolor.light, left: 2,
                                    borderWidth: 0.4, borderBottomColor: appcolor.dark, borderColor: appcolor.dark, borderBottomWidth: 1.2, borderRightColor: appcolor.dark, borderRightWidth: 1.2
                                }}
                            >
                                <Text style={{ color: (item.displayArea && item.displayArea.length > 0) ? appcolor.dark : appcolor.dark, fontSize: 12, fontWeight: '400' }} >{(item.displayArea && item.displayArea.length > 0) ? (JSON.parse(item.displayArea).name) : 'Chọn vị trí'}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
            {
                item.isShowArea &&
                <View style={{
                    width: '100%', backgroundColor: (isDone && isFilterCheck &&
                        ((isCheck === 0 && inputDisplay > 0) ||
                            (isCheck === 1 && (inputDisplay === 0 || inputDisplay == null))))
                        ? appcolor.warning :
                        appcolor.surface, borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
                    flexDirection: 'row', padding: 5, justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap'
                }}>
                    {
                        listMaster.map((it, indexArea) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => onSelectArea(it)}
                                    key={item.productId + '_posion_' + indexArea}
                                    style={{ width: '30%', padding: 5, borderRadius: 20, backgroundColor: appcolor.light, flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}
                                >
                                    <View style={{ height: 18, width: 18, borderRadius: 30, borderColor: appcolor.dark, borderWidth: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ height: 12, width: 12, borderRadius: 30, backgroundColor: (item.displayArea && item.displayArea.length > 0 && JSON.parse(item.displayArea).id == it.id) ? appcolor.success : appcolor.transparent }} />
                                    </View>
                                    <Text style={{ flex: 1, paddingLeft: 3, fontWeight: '400', fontSize: 12, color: (item.displayArea && item.displayArea.length > 0 && JSON.parse(item.displayArea).id == it.id) ? appcolor.success : appcolor.dark, textAlign: 'center' }}>{it.name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            }
        </View>
    )
}

