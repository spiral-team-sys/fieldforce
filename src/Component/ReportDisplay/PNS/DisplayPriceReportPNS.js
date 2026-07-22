import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, RefreshControl, StyleSheet } from "react-native";
import { Icon, Button, Badge, Text } from '@rneui/themed';
import { getDisplayResult, getAllPhotosUpload, getPhotosReport, getAllPhotos } from '../../../Controller/WorkController'
import { updateNoteDisplayReport, getNoteDisplayReport } from '../../../Controller/WorkController'
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab, } from "../../../Core/Utility";
import { groupDataByKey, isNotInteger, Message, MessageInfo, ToastError, ToastSuccess } from '../../../Core/Helper';
import { _competitorId, _competitorName } from '../../../Core/URLs'
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { scaleSize } from '../../../Themes/AppsStyle';
////import { NumericFormat } from "react-number-format";;
import { useFocusEffect } from '@react-navigation/native';
import FormGroup from '../../../Content/FormGroup';
import { clearAllDataDisplay, getCateSubmit, getDisplayProduct, getlistTabCompetitor, getListTagPOP, updateItemDisplay, uploadDisplayPOP } from '../../../Controller/DisplayController'
import ActionSheet from 'react-native-actions-sheet';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { LoadingView } from '../../../Control/ItemLoading';
import UploadController from '../../../Controller/UploadController';
import { checkLockReport } from '../../../Controller/ShopController';

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

const DisplayPriceReportPNS = ({ navigation }) => {
    const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
    const [arrTabShow, setArrTabShow] = useState([]);
    const [arrDataShow, setArrDataShow] = useState([]);
    const [arrDataShowF, setArrDataShowF] = useState([]);
    const [noteSaved, setNoteSaved] = useState('');
    const [isHiddenNote, setNote] = useState(true);
    const [showProgress, setProgress] = useState(false);
    const [isDone, setDone] = useState(false);
    const [Status, setStatus] = useState(false);
    const [isClear, setClear] = useState(0);
    const [indexTab, setIndexTab] = useState(0);
    const [mode, setMode] = useState('TOOLS');
    const [search, setSearch] = useState('');
    const [lstPhotoByCategory, setPhotoByCategory] = useState([])
    const ref_bottomSheet = useRef()
    const tabRef = useRef()
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const [reportPOP, setReportPOP] = useState({ tagPOPId: '', tagDisplayId: '' })
    const [typePOP, setTypePOP] = useState()
    const [listPOP, setListPOP] = useState({ POP: [], display: [] })
    const [isLockReport, setLockReport] = useState(false)

    const loadDataShow = async () => {
        setProgress(true)
        try {
            const [
                checkLock,
                lstRes,
                listTagPOP,
                lstItemsProgram,
                lstTab
            ] = await Promise.all([
                checkLockReport(shopinfo),
                getDisplayResult(workinfo),
                getListTagPOP(),
                getDisplayProduct(workinfo),
                getlistTabCompetitor(_competitorId)
            ])
            let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
            const { arr } = groupDataByKey({
                arr: lstItemsProgram,
                key: 'categoryId',
                keyLayer2: 'subCatId'
            })
            setLockReport(checkLock)
            setStatus(isUpload)
            setArrTabShow(lstTab);
            setArrDataShow(arr);
            setArrDataShowF(arr);
            loadItemPOP(listTagPOP, arr)
        } finally {
            setProgress(false)
        }
    }

    const loadItemPOP = async (dataPOP, dataDisplay) => {
        const firstDisplay = dataDisplay[0] || {}
        const tagPOPId = dataPOP.POP.find(it => it.id === firstDisplay.tagPOPId)
        const tagDisplayId = dataPOP.Display.find(it => it.id === firstDisplay.tagDisplayId)
        setListPOP({ POP: dataPOP.POP, display: dataPOP.Display })
        setReportPOP({ tagPOPId: tagPOPId, tagDisplayId: tagDisplayId })
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

    const checkImageCate = (LstMenuPhotos, resDisplay, lstTab) => {
        lstTab.map(async itT => {
            if (LstMenuPhotos[itT.categoryName]) {
                let lstTem = LstMenuPhotos[itT.categoryName];
                let res = false
                lstTem.map(async item => {
                    let photoType = item.code + '_' + itT.categoryName
                    let lstPhoto = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate);
                    console.log(lstPhoto.length, itT);
                    if (lstPhoto.length > 0 && !res) {
                        const listByCate = resDisplay.filter(it => it.categoryId === itT.categoryId)
                        listByCate.length > 0 ? itT.isFalse = false : itT.isFalse = true
                        res = true
                    }
                })
            }
        })
    }

    const uploadAction = async () => {
        let resDisplay = await getDisplayResult(workinfo);
        const lstTab = await getlistTabCompetitor(_competitorId)//list tab
        // console.log(resDisplay, 'check');
        let resPhotos = await getAllPhotosUpload(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        let noteStr = '';
        const LstMenuPhotos = lstReport?.ImageByList || []
        await checkImageCate(LstMenuPhotos, resDisplay, lstTab)

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
                const listCate = await getCateSubmit(workinfo)
                let res = true
                for (let index = 0; index < listCate.length; index++) {
                    const itT = listCate[index];
                    if (LstMenuPhotos[itT.categoryName]) {
                        let lstTem = LstMenuPhotos[itT.categoryName];
                        for (let index = 0; index < lstTem.length; index++) {
                            const it = lstTem[index];
                            let photoType = it.code + '_' + itT.categoryName
                            let lstPhoto = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate);
                            if (lstPhoto.length < it.numberIMG && res) {
                                noteStr += 'Vui lòng chụp tối thiểu ' + it.numberIMG + ' tấm hình cho ' + it.nameVN + ' của ' + itT.categoryName + '(' + lstPhoto.length + '/' + it.numberIMG + ').\n';
                                res = false
                            }
                        }
                    }
                }
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

        let checkPrice = resDisplay.filter(it => (it.quanity !== 'null' && it.quanity !== null) && it.price !== null && it.price !== 'null' && (it.price < 10000 || it.price % 1000 > 0));
        if (checkPrice.length > 0) {
            let product = arrDataShowF.filter(it => it.productId === checkPrice[0].productId)
            MessageInfo('Vui lòng nhập giá đúng định dạng. Hãng: ' + product[0].division + ' - Ngành hàng : ' + product[0].categoryName + ' - sản phẩm: ' + product[0].productName, "Thông báo", "top");
            return;
        }

        let items = resDisplay.filter(it => (it.quanity === 'null' || it.quanity === null) && (it.price !== 'null' && it.price !== null && it.price > 0));
        if (items.length > 0) {
            let product = arrDataShowF.filter(it => it.productId === items[0].productId)
            MessageInfo('Bạn đã nhập giá nhưng chưa nhập số lượng. Hãng: ' + product[0].division + ' - Ngành hàng : ' + product[0].categoryName + ' - sản phẩm: ' + product[0].productName, "Thông báo", "top");
            return;
        }

        let itemsUpload = resDisplay.filter(it => it.quanity !== 'null' && it.quanity !== null);
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        let checkQuantityByCate = lstTab.filter(it => it.isFalse);
        if (checkQuantityByCate.length > 0) {
            let strErr = ''
            checkQuantityByCate.map(it => strErr += (it.categoryName + ", "))
            MessageInfo('Bạn đã chụp hình cho ngành hàng : ' + strErr + 'nhưng chưa nhập số lượng trưng bày', "Thông báo", "top");
            return;
        }

        if (noteStr !== '') {
            MessageInfo(noteStr);
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
    const handleChangeTab = async (i, from) => {
        await setIndexTab(i);
    }
    //Event search
    const filterDoneProduct = async () => {
        if (!isDone) {
            let lstRes = arrDataShow.filter(it => it.quanity !== null && it.quanity >= 0 || it.price !== null && it.price >= 0)
            setArrDataShow(lstRes)
        } else {
            setArrDataShow(arrDataShowF)
        }
        setDone(e => !e)
    }
    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = arrDataShowF.filter(it => it.quanity !== null && it.quanity >= 0 || it.price !== null && it.price >= 0)
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
                                <Icon name='camera' color={appcolor.primary} type='ionicon' size={25}></Icon>
                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Chụp hình</Text>
                            </View>
                            <Badge value={totalPhoto} />
                        </TouchableOpacity>
                        <View style={{ width: 2, backgroundColor: appcolor.white }} />
                        <TouchableOpacity
                            onPress={() => handlerNote(it.categoryName)}
                            style={{ height: 40, width: '45%', marginRight: 2 }}>
                            <Icon name='create-outline' color={appcolor.primary} type='ionicon' size={25}></Icon>
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
                        {
                            !showProgress &&
                            <View style={{ flex: 1, backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>

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
                                                ({ item, index }) => <RenderItemData isClear={isClear} setClear={() => setClear()} item={item} index={index} totalRow={totalRow} appcolor={appcolor} isDone={isDone} workinfo={workinfo} />
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
    const openSheet = async (type, popType) => {
        await setMode(type);
        if (type === 'POP') {
            await setTypePOP(popType)
        }
        await ref_bottomSheet.current.show('actiondisplay')
    }
    const handleSelectPOP = (item) => {
        if (reportPOP[typePOP]?.id === item.id) {
            setReportPOP({ ...reportPOP, [typePOP]: {} })
            uploadDisplayPOP(null, typePOP, workinfo)
        } else {
            setReportPOP({ ...reportPOP, [typePOP]: item })
            uploadDisplayPOP(item.id, typePOP, workinfo)
        }
    }
    const ButtonClearCate = () => {
        return (
            <TouchableOpacity
                style={{
                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                    borderColor: appcolor.danger, marginBottom: 5
                }}
                onPress={() => setClearAll(arrTabShow[tabRef.current.getCurrentIndex()])}>
                <Text style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }} >Xóa dữ liệu {(arrTabShow.length > 0 && tabRef) ? arrTabShow[(tabRef?.current?.getCurrentIndex() || 0)].categoryName : arrTabShow[0].categoryName} Đã nhập</Text>
                <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconRight={!isLockReport ? (Status !== 1 ? 'cloud-upload-alt' : null) : 'user-lock'}
                rightFunc={!isLockReport ? (Status !== 1 ? () => uploadAction() : null) : () => {
                    ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')
                }}
                leftFunc={() => navigation.goBack()}
                iconMiddle='poll-h'
                middleFunc={() => openSheet('TOOLS')}
            />
            <View style={{ backgroundColor: appcolor.light, flex: 1 }}>
                <FormGroup
                    containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, marginBottom: 0, alignSelf: 'center' }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    iconName='search'
                    onClearTextAndroid={filterProduct}
                    value={search} handleChangeForm={filterProduct}
                />
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity
                        onPress={() => openSheet('POP', 'tagPOPId')}
                        style={{
                            height: 40, flex: 1, margin: 5,
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                        <Icon name='tag' type='font-awesome' size={25} color={appcolor.white} style={{ height: 35, width: 35, backgroundColor: reportPOP.tagPOPId?.id ? reportPOP.tagPOPId.isColor : appcolor.primary, margin: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} />
                        <Text style={{ color: appcolor.dark, paddingLeft: 10 }} >POP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => openSheet('POP', 'tagDisplayId')}
                        style={{
                            height: 40, flex: 1, margin: 5,
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                        <Icon name='tag' type='font-awesome' size={25} color={appcolor.white} style={{ height: 35, width: 35, backgroundColor: reportPOP.tagDisplayId?.id ? reportPOP.tagDisplayId.isColor : appcolor.primary, margin: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }} />
                        <Text style={{ color: appcolor.dark, paddingLeft: 10 }} >Trưng bày</Text>
                    </TouchableOpacity>
                </View>
                {arrTabShow?.length > 0 && !showProgress &&
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
                {showProgress && <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />}
            </View>

            <ActionSheet
                key={'actiondisplay'}
                ref={ref_bottomSheet}
                headerAlwaysVisible={true}
                defaultOverlayOpacity={0.1}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.light, alignSelf: 'center' }}
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
                    <View style={{ padding: 8, width: '100%', marginBottom: 38 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600', padding: 8 }}>Công cụ</Text>
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.dark, marginBottom: 5
                                }}
                                onPress={() => filterDoneProduct()}>
                                <Text style={{ color: appcolor.dark, width: '80%', textAlign: 'center' }} >Sản phẩm đã nhập</Text>
                                <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={23} color={!isDone ? appcolor.dark : appcolor.success} />
                            </TouchableOpacity>
                            {!isLockReport && <ButtonClearCate />}

                            {
                                !isLockReport &&
                                <TouchableOpacity
                                    style={{
                                        width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                        borderColor: appcolor.danger, marginBottom: 5
                                    }}
                                    onPress={() => setClearAll()}>
                                    <Text style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }} >Xóa tất cả dữ liệu đã nhập</Text>
                                    <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                                </TouchableOpacity>
                            }

                        </View>
                    </View>
                }
                {
                    mode === 'POP' &&
                    <View style={{ padding: 8, width: '100%', height: deviceHeight / 2.5 }}>

                        <FlatList
                            contentContainerStyle={{ paddingBottom: 30 }}
                            key={(item) => item.id}
                            keyExtractor={(item, index) => index.toString()}
                            data={typePOP === 'tagPOPId' ? listPOP.POP : listPOP.display}
                            renderItem={
                                ({ item, index }) => {
                                    return (
                                        <TouchableOpacity
                                            key={`idd_p_${index}`}
                                            onPress={() => handleSelectPOP(item)}
                                            style={{ padding: 8, flexDirection: 'row', backgroundColor: reportPOP[typePOP]?.code === item.code ? appcolor.primary : appcolor.surface, borderRadius: 10, margin: 5, alignItems: 'center' }}>
                                            <View style={{ height: 20, width: 20, borderRadius: 40, backgroundColor: item.isColor }} />
                                            <Text style={{ fontSize: 12, paddingLeft: 10, width: '90%', color: reportPOP[typePOP]?.code === item.code ? appcolor.white : appcolor.dark }}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }
                            }
                        />
                    </View>
                }
            </ActionSheet>
        </View >
    )
}
export default DisplayPriceReportPNS

const RenderItemData = ({ item, isClear, totalRow, appcolor, workinfo, index, setClear, isDone }) => {
    const [inputDisplay, setInputDisplay] = useState(item.quanity);
    const [inputPrice, setInputPrice] = useState(item.price);
    const [colorInput, setColorInput] = useState({})
    const [countClear, setCountClear] = useState(0)
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

        if (intValue) {
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
    const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];

    return (
        <View style={{ width: '100%' }}>
            {(keyLayer2 && item.subCategory !== null && item.subCategory !== undefined) &&
                <View style={{ flex: 1, padding: 8, marginTop: 5, marginBottom: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, }}>
                    <Icon name='tags' type='font-awesome-5' size={15} color={appcolor.white} />
                    <Text style={{ color: appcolor.white, fontSize: 14, paddingLeft: 8, fontWeight: '600' }}>{item.subCategory}</Text>
                </View>
            }
            <View style={{ width: '100%', alignItems: 'center', marginBottom: 8 }} onPress={() => onItemPress(item)} >
                <View style={{
                    flexDirection: 'row', width: '100%', padding: 12, alignItems: 'center',
                    backgroundColor: appcolor.surface, borderRadius: 8
                }}>
                    <View style={{ width: '55%' }}>
                        <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '600' }}>{index + 1}. {item.productName}</Text>
                        <Text style={{ fontSize: 11, color: appcolor.greydark, fontStyle: 'italic', fontWeight: '600' }}>{item.productCode}</Text>
                    </View>

                    <NumericFormat
                        value={inputDisplay === 0 ? 0 : (inputDisplay || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{
                                    fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500',
                                    width: '20%', textAlign: 'center', borderWidth: 0.5, borderRadius: 7, borderColor: appcolor.greydark, height: 35
                                }}
                                keyboardType='numeric'
                                placeholder='SL'
                                placeholderTextColor={appcolor.greydark}
                                editable={item.upload === 1 ? false : true}
                                selectTextOnFocus={item.upload === 1 ? false : true}
                                onChangeText={changeValueDisplay}
                                onEndEditing={e => endInputDisplay(item, e)}
                            />
                        }
                    />
                    <NumericFormat
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
                                    borderWidth: 0.5,
                                    fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 7,
                                    borderColor: appcolor.greydark, height: 35, left: 2, width: '25%',
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
                </View>
            </View>
        </View>


    )
}





