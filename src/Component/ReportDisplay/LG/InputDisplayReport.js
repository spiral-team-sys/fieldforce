import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, } from "react-native";
import { Icon, Button, Badge } from '@rneui/themed';
import { getAllPhotos, getPhotosReport } from '../../../Controller/WorkController'
import { updateItemDisplay } from '../../../Controller/DisplayController';
import { updateNoteDisplayReport, getNoteDisplayReport } from '../../../Controller/WorkController'
import { isNotInteger, ToastError, ToastSuccess, UUIDGenerator } from '../../../Core/Helper';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { fontWeightBold, scaleSize, styleDefault } from '../../../Themes/AppsStyle';
// import { NumericFormat } from 'react-number-format';
import ActionSheet from 'react-native-actions-sheet';

import moment from 'moment';
import NativeCamera from '../../../Control/NativeCamera';
import FormGroup from '../../../Content/FormGroup';
import ViewPictures from '../../../Control/Gallary/ViewPictures';
import CustomListView from '../../../Control/Custom/CustomListView';
import CustomTab from '../../../Control/Custom/CustomTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';


export const InputDisplayReport = ({ navigation, appcolor, workinfo, kpiinfo, data, select, Status, isClear, showProgress, reload, currentTab }) => {
    const insets = useSafeAreaInsets()
    const [noteSaved, setNoteSaved] = useState('');
    const [listPhotoByCategory, setPhotoByCategory] = useState([])
    const [dataTab, setDataTab] = useState([])
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [pictureShow, setPictureShow] = useState({ visible: false, photos: [], index: 0 })
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const ref_noteSheet = useRef()
    const ref_takePhotoSheet = useRef()
    const [itemProduct, setItemProduct] = useState({ itemSelect: {} })
    const appStyles = useMemo(() => styleDefault(appcolor), [appcolor])
    const styles = useMemo(() => StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        tabBody: { flex: 1, backgroundColor: appcolor.light, padding: 6, width: '100%', display: !showProgress ? 'flex' : 'none' },
        headerAction: { backgroundColor: appcolor.surface, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12 },
        headerActionRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        headerButton: { height: 42, alignItems: 'center', justifyContent: 'center' },
        headerButtonText: { width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) },
        headerDivider: { width: 1, height: 32, backgroundColor: appcolor.white },
        separator: { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: appcolor.greydark, opacity: 0.5, marginBottom: 4, marginTop: 4 },
        listWrap: { flex: 1 },
        listFooter: { width: '100%', textAlign: 'center', color: appcolor.dark, padding: 8, paddingBottom: 24 },
        noteSheet: { opacity: 1, borderRadius: 10, width: '100%', marginBottom: 24 },
        noteTitle: { padding: 8, color: appcolor.dark, fontWeight: fontWeightBold, fontSize: scaleSize(15) },
        noteInput: { margin: 5, padding: 10, color: appcolor.dark, minHeight: 105, textAlign: 'left', textAlignVertical: 'top', borderWidth: 0.4, borderRadius: 5, borderColor: appcolor.dark, backgroundColor: appcolor.light },
        noteButtonRow: { marginTop: 8, flexDirection: 'row', alignSelf: 'center', width: '100%', minHeight: 50, padding: 5 },
        photoSheet: { padding: 8, width: '100%', height: '50%' },
        photoSheetTitleWrap: { padding: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        photoSheetTitle: { color: appcolor.dark, fontSize: scaleSize(16), fontWeight: fontWeightBold },
        photoActionRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 },
        photoActionButton: { padding: 5, width: '48%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10, backgroundColor: appcolor.light },
        photoActionText: { color: appcolor.dark, padding: 5 }
    }), [appcolor, showProgress])

    const loadDataShow = async () => {
        setDataTab(data.dataTabByCompe)
        setActiveTabIndex(0)
    }
    useEffect(() => {
        loadDataShow();
        return () => false;
    }, [reload])
    useEffect(() => {
        countNumPhoto();
        return () => false;
    }, [])

    const cancelNote = () => {
        setNoteSaved('')
        ref_noteSheet.current?.hide();
    }
    const updateNote = async () => {
        if (noteSaved === undefined) {
            ToastError('Vui lòng nhập ghi chú.');
            return
        }

        if (noteSaved.length > 1 && noteSaved.length < 10) {
            ToastError('Vui lòng nhập ghi chú ít nhất 10 ký tự.', 'Thông báo', 'top');
            return
        }
        const activeTab = dataTab[activeTabIndex] || dataTab[0] || {}
        if (!activeTab?.displayRef) {
            ToastError('Không xác định được ngành hàng cần lưu ghi chú.', 'Thông báo', 'top');
            return
        }
        let itemNote = {
            workId: workinfo.workId,
            displayRef: activeTab.displayRef,
            displayComment: noteSaved,
            division: select.competitorSelect
        }
        ref_noteSheet.current?.hide();
        ToastSuccess('Đã lưu ghi chú!');
        updateNoteDisplayReport(itemNote);
    }

    //View Item Product by Competitor
    const countNumPhoto = async () => {
        let resPhotos = await getAllPhotos(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        listPhotoByCategory.length !== resPhotos.length ? await setPhotoByCategory(resPhotos) : []
        ref_takePhotoSheet.current?.hide()
    }
    const handleTakePicture = (item) => {
        if (lstReport?.isAlbum === 1) {
            (item?.productId !== undefined && item?.productId > 0 && (itemProduct.itemSelect = item))
            ref_takePhotoSheet.current.show()
        } else {
            Status !== 1 &&
                takePhoto(navigation, 'CAMERA', workinfo, kpiinfo, select.competitorSelect, item.categoryName, ref_takePhotoSheet, () => countNumPhoto())
        }
    }
    const showAlbum = async (categoryName) => {
        const photoType = 'DISPLAY_' + select.competitorSelect + '_' + categoryName
        const photos = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate)
        setPictureShow({ visible: true, photos, index: 0 })
    }

    const renderItemView = ({ item, index }) => {
        const totalPhoto = (lstReport?.photoBySKU == 1 ? (listPhotoByCategory?.filter(i => i.photoType?.includes(item.categoryName) && i.photoType?.includes(select.competitorSelect) && i.photoType?.includes(item.productId)) || []).length : 0)
        return <RenderItemData
            key={`KeyItem_${item.categoryId}_${index}_${item.productId}`}
            item={item} index={index}
            isClear={isClear} details={data.arrDataShowF} handleTakePicture={handleTakePicture}
            appcolor={appcolor} workinfo={workinfo} lstReport={lstReport} totalPhoto={totalPhoto} />
    }

    const handlerShowNote = async (displayRef) => {
        let lst = await getNoteDisplayReport(workinfo.workId, displayRef, select.competitorSelect)
        if (lst.length > 0)
            await setNoteSaved(lst[0].displayComment)
        ref_noteSheet.current.show();
    }

    const renderTabItem = (it, indexCate) => {
        const dataByCategoryId = data.arrDataShow?.filter(i => i.categoryName === it.categoryName && i.divisionId === select.competitorIdSelect && i.categoryId === it.categoryId)
        const totalPhoto = (listPhotoByCategory?.filter(i => i.photoType?.includes(it.categoryName) && i.photoType?.includes(select.competitorSelect)) || []).length
        return (
            <View key={it.categoryName + indexCate} style={styles.tabBody}>
                <View
                    key={'takePhoto' + indexCate}
                    style={styles.headerAction}>
                    <View style={styles.headerActionRow}>
                        <TouchableOpacity
                            onPress={() => handleTakePicture(it)}
                            style={[styles.headerButton, { width: lstReport?.isNoteBySKU == 1 ? '49%' : '34%' }]}>
                            <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={25} />
                            <Text style={styles.headerButtonText}>Chụp hình</Text>
                        </TouchableOpacity>
                        <View style={styles.headerDivider} />
                        <TouchableOpacity
                            onPress={() => showAlbum(it.categoryName)}
                            style={[styles.headerButton, { width: lstReport?.isNoteBySKU == 1 ? '49%' : '34%' }]}>
                            <View style={{ flex: 1, }}>
                                <Badge badgeStyle={{ position: 'absolute', top: -5, right: -2 }} value={totalPhoto} />
                                <SpiralIcon name='image' color={appcolor.primary} type='ionicon' size={25} />
                                <Text style={styles.headerButtonText}>Xem hình</Text>
                            </View>
                        </TouchableOpacity>
                        {lstReport?.isNoteBySKU !== 1 && <View style={styles.headerDivider} />}
                        {lstReport?.isNoteBySKU !== 1 &&
                            <TouchableOpacity
                                onPress={() => handlerShowNote(it.displayRef)}
                                style={[styles.headerButton, { width: '34%' }]}>
                                <SpiralIcon name='create-outline' color={appcolor.primary} type='ionicon' size={25} />
                                <Text style={styles.headerButtonText}>Ghi chú</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View >
                <View style={styles.separator} />
                <View style={styles.listWrap}>
                    <CustomListView
                        key={`CustomListView_${indexCate}_${it.categoryId}`}
                        data={dataByCategoryId}
                        renderItem={renderItemView}
                        containerStyle={{ flex: 1 }}
                        estimatedItemSize={100}
                    />
                </View>
            </View >
        )
    }

    const handleTakePicturePCS = async (type) => {
        const activeTab = dataTab[activeTabIndex] || dataTab[0] || {}
        if (!activeTab?.categoryName) {
            ToastError('Không xác định được ngành hàng cần chụp hình.', 'Thông báo', 'top');
            return
        }
        await takePhoto(navigation, type, workinfo, kpiinfo, select.competitorSelect, activeTab.categoryName, ref_takePhotoSheet, () => countNumPhoto(), itemProduct.itemSelect.productId)
    }

    return (
        <View style={styles.mainContainer}>
            <View style={[appStyles.contentContainer, styles.mainContainer]}>
                {
                    dataTab.length === data.dataTabByCompe.length &&
                    <CustomTab
                        keyTabName='categoryName'
                        data={dataTab}
                        dataMain={(data.arrDataShow || []).filter(i => i.divisionId === select.competitorIdSelect)}
                        renderItem={renderTabItem}
                        onTabChange={(i) => {
                            currentTab.objTab = i
                            setActiveTabIndex(i?.index || 0)
                        }}
                    />
                }
            </View>
            <ActionSheet
                ref={ref_noteSheet}
                defaultOverlayOpacity={0.1}
                containerStyle={{ backgroundColor: appcolor.surface, paddingBottom: insets.bottom }}
                onClose={() => cancelNote()}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                <View style={styles.noteSheet}>
                    <Text style={styles.noteTitle}>Ghi chú</Text>
                    <TextInput
                        editable={Status !== 1} selectTextOnFocus={Status !== 1}
                        numberOfLines={6}
                        multiline={true}
                        autoCorrect={false}
                        onChangeText={setNoteSaved}
                        style={styles.noteInput}
                        placeholderTextColor={appcolor.greydark}
                        defaultValue={noteSaved || ''}
                        placeholder='Nhập ghi chú ở đây.'
                    />
                    {
                        Status !== 1 &&
                        <View style={styles.noteButtonRow}>
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
            </ActionSheet>
            <ActionSheet
                ref={ref_takePhotoSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface, paddingBottom: insets.bottom }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
            >
                <View style={styles.photoSheet}>
                    <View style={styles.photoSheetTitleWrap}>
                        <Text style={styles.photoSheetTitle}>Chụp Hình</Text>
                    </View>
                    <View style={styles.photoActionRow}>
                        <TouchableOpacity
                            style={[styles.photoActionButton, { borderColor: appcolor.dark }]}
                            onPress={() => Status !== 1 && handleTakePicturePCS('CAMERA')}>
                            <Text style={styles.photoActionText}>Máy ảnh</Text>
                            <SpiralIcon color={appcolor.dark} name='camera' type='ionicon' size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.photoActionButton, { borderColor: appcolor.primary }]}
                            onPress={() => Status !== 1 && handleTakePicturePCS('GALLERY')}
                        >
                            <Text style={styles.photoActionText}>Chọn ảnh</Text>
                            <SpiralIcon color={appcolor.dark} name='attach' type='ionicon' size={30} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet >
            <ViewPictures
                visible={pictureShow.visible}
                images={pictureShow.photos}
                initialIndex={pictureShow.index}
                onSwipeDown={() => setPictureShow({ visible: false, photos: [], index: 0 })}
                isUseDelete={Status !== 1}
                onDeleteImage={countNumPhoto}
            />
        </View >
    )
}
const takePhoto = async (navigation, type, workinfo, kpiinfo, competitorSelect, categoryName, ref_takePhotoSheet, countNumPhoto, productId) => {
    const photoinfo = {
        "shopId": workinfo.shopId,
        "shopCode": workinfo.shopCode,
        "reportId": kpiinfo.kpiId,
        "photoDate": workinfo.workDate,
        "photoTime": new Date().getTime(),
        "photoType": 'DISPLAY_' + competitorSelect + '_' + categoryName + ((productId !== undefined && productId > 0) ? `_${productId}` : ''),
        "dataUpload": 0,
        "fileUpload": 0,
        "photoPath": null,
        "shopLat": null,
        "shopLong": null,
        "guid": UUIDGenerator(),
        "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    if (type === 'CAMERA') {
        await NativeCamera.cameraStart(photoinfo, countNumPhoto);
    } else {
        await NativeCamera.imageGalleryLaunch(photoinfo, countNumPhoto);
    }
}
const RenderItemData = memo(({ item, details, isClear, totalRow, appcolor, workinfo, index, lstReport, handleTakePicture, totalPhoto }) => {
    const [detailsTem] = useState(details)
    const [inputDisplay, setInputDisplay] = useState(item.quanity === 'null' ? null : item.quanity);
    const [inputStock, setInputStock] = useState(item.quantityStock === 'null' ? null : item.quantityStock);
    const [inputPrice, setInputPrice] = useState(item.price);
    const [colorInput, setColorInput] = useState({})
    const [countClear, setCountClear] = useState(0)
    const [inputNote, setInputNote] = useState(item.productComment)

    if ((!inputDisplay && item.quanity)) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && inputDisplay && isClear !== 0) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && isClear !== 0 && inputDisplay == 0 && isClear - countClear > 0) {
        setInputDisplay(null);
    }
    if ((!inputStock && item.quantityStock)) {
        setInputStock(item.quantityStock)
    } else if (!item.quantityStock && inputStock && isClear !== 0) {
        setInputStock(item.quantityStock)
    } else if (!item.quantityStock && isClear !== 0 && inputStock == 0 && isClear - countClear > 0) {
        setInputStock(null);
    }

    if ((!inputPrice && item.price)) {
        setInputPrice(item.price)
    } else if (!item.price && inputPrice && isClear !== 0) {
        setInputPrice(item.price)
    }

    const endInputDisplay = async (e, type) => {
        let display = (type == 'STOCK' ? inputStock : inputDisplay)
        let itemEdit = { ...item }
        if (type == 'STOCK') {
            itemEdit.quantityStock = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null
        } else {
            itemEdit.quanity = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null
        }
        await updateItemDisplay(itemEdit, workinfo)
        // let indexD = detailsTem.filter(it => it.categoryId == item.categoryId && it.productId == item.productId);
        // detailsTem[indexD].quanity = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null;
    }
    const endInputPrice = async (e) => {
        let numberInput = inputPrice;
        let isError = 0

        if (parseInt(numberInput) < ((lstReport?.minPrice && lstReport?.minPrice !== '') ? lstReport?.minPrice : 1000)) {
            setInputPrice(null);
            item.price = null
            numberInput = null;
            isError = 1;
            ToastError("Nhập giá không được nhỏ hơn " + (lstReport?.minPrice || 1000), "Lỗi", "top");
        } else if (parseInt(numberInput) % ((lstReport?.minPrice && lstReport?.minPrice !== '') ? lstReport?.minPrice : 1000) > 0) {
            setInputPrice(null);
            item.price = null
            numberInput = null;
            isError = 1;
            ToastError("Nhập giá không được lẻ", "lỗi", "top");
        } else {
            isError = 0
        }

        if (isError === 1) {
            if (Object.keys(colorInput).length === 0) {
                setColorInput({ index: index, categoryId: item.categoryId, productId: item.productId });
            }
        } else if (isError === 0) {
            if (Object.keys(colorInput).length > 0) {
                // let editValue = colorInput.filter(obj => (obj.index !== index || obj.categoryId !== item.categoryId || obj.productId !== item.productId));
                setColorInput({})
            }
        }

        let itemEdit = { ...item }
        itemEdit.price = (numberInput !== '' && numberInput !== undefined && numberInput !== null) ? parseInt(numberInput) : null
        await updateItemDisplay(itemEdit, workinfo)
    }
    const changeValueDisplay = async (text, type) => {
        isClear - countClear > 0 ? setCountClear(isClear) : null
        let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        if (isNotInteger(display))
            display = '';

        let intValue = display === '' ? null : parseInt(display);
        let itemEdit = { ...item }

        if (intValue > 0 || intValue === 0) {
            if (type == 'STOCK') {
                item.quantityStock = intValue
                itemEdit.quantityStock = intValue
                await setInputStock(intValue)
            } else {
                if (lstReport?.numCheckProduct > 0 && intValue > lstReport?.numCheckProduct) {
                    ToastError(`Số lượng trưng bày sản phẩm > ${lstReport?.numCheckProduct}`, "Cảnh báo", "top");
                }
                item.quanity = intValue
                itemEdit.quanity = intValue
                await setInputDisplay(intValue)
            }
        } else {
            if (type == 'STOCK') {
                item.quantityStock = null
                itemEdit.quantityStock = null
                await setInputStock()
            } else {
                item.quanity = null
                itemEdit.quanity = null
                await setInputDisplay();
            }
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

    const onChangeNote = async (text) => {

        let itemEdit = { ...item }
        item.productComment = text
        itemEdit.productComment = text
        await setInputNote(text)
        await updateItemDisplay(itemEdit, workinfo)
        // onUpdateNote(text, itemTab.categoryName)
    }
    const handleTakeBySKU = () => {
        handleTakePicture(item)
    }

    const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
    return (
        <View key={`KeyItem_${item.categoryId}_${item.subCatId}_${index}_${item.productId}`} style={{ width: '100%', alignItems: 'center', marginBottom: 5 }} onPress={() => this.onItemPress(item)} >
            <View style={{ width: '100%' }}>
                {(keyLayer2 && item.subCategory !== null && item.subCategory !== undefined) &&
                    <View style={{ padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, marginBottom: 5 }}>
                        <SpiralIcon name='tags' type='font-awesome-5' size={15} color={appcolor.white} />
                        <Text style={{ color: appcolor.white, fontSize: 14, paddingLeft: 8, fontWeight: '600' }}>{item.subCategory}</Text>
                    </View>
                }
            </View>
            <View style={{ width: '100%', padding: 8, backgroundColor: appcolor.surface, borderRadius: 5, alignItems: 'center', }}>
                <View style={{ flexDirection: (lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? 'column' : 'row', width: '100%', }}>
                    <View style={{ width: lstReport?.isConstraintPrice == 4 ? '70%' : '55%', paddingEnd: 3, flexDirection: 'row' }}>
                        {lstReport?.photoBySKU == 1 &&
                            <TouchableOpacity
                                onPress={() => handleTakeBySKU()}
                                style={{ height: 40, width: 40, borderRadius: 8, backgroundColor: appcolor.light, marginRight: 6, justifyContent: 'center', alignItems: 'center' }}>
                                {totalPhoto > 0 && <View style={{ position: 'absolute', top: -5, right: -5 }}>
                                    <Badge value={totalPhoto} />
                                </View>}
                                <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={25} />
                            </TouchableOpacity>
                        }

                        <View>
                            <Text style={{ fontSize: 14, color: appcolor.dark, fontWeight: '600', textAlign: 'left' }}>{index + 1}. {item.productName}</Text>
                            <Text style={{ fontSize: 12, color: appcolor.greydark, fontStyle: 'italic', fontWeight: '400', textAlign: 'left' }}>{item.productCode}</Text>
                        </View>

                    </View>
                    <View style={{ width: (lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '100%' : (lstReport?.isConstraintPrice == 4 ? '30%' : '45%'), flexDirection: 'column' }}>
                        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: lstReport?.isConstraintPrice == 4 ? 'flex-end' : 'center' }}>
                            <NumericFormat
                                key={`Quantity_${item.categoryId}_${item.subCatId}_${index}`}
                                value={inputDisplay === 0 ? 0 : (inputDisplay || '')}
                                displayType='text'
                                thousandSeparator={true}
                                renderText={value =>
                                    <TextInput
                                        textAlign={'center'}
                                        value={value}
                                        style={{
                                            fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500', marginEnd: 3,
                                            width: lstReport?.isConstraintPrice == 4 ? ((lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '50%' : '100%') :
                                                ((lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '30%' : '40%'),
                                            textAlign: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greydark, height: 35
                                        }}
                                        keyboardType='numeric'
                                        // placeholder={(lstReport?.placeholderQuantity && lstReport?.placeholderQuantity !== '') ? lstReport?.placeholderQuantity : 'Số lượng'}
                                        placeholder={item.unit || 'Số lượng'}
                                        placeholderTextColor={appcolor.greydark}
                                        editable={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                        selectTextOnFocus={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                        onChangeText={changeValueDisplay}
                                        onEndEditing={endInputDisplay}
                                    />
                                }
                            />
                            {
                                (lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) &&
                                <NumericFormat
                                    key={`Stock_${item.categoryId}_${item.subCatId}_${index}`}
                                    value={inputStock === 0 ? 0 : (inputStock || '')}
                                    displayType='text'
                                    thousandSeparator={true}
                                    renderText={value =>
                                        <TextInput
                                            textAlign={'center'}
                                            value={value}
                                            style={{
                                                fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500', marginEnd: 3,
                                                width: lstReport?.isConstraintPrice == 4 ? ((lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '50%' : '100%') : ((lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '30%' : '40%'),
                                                textAlign: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greydark, height: 35
                                            }}
                                            keyboardType='numeric'
                                            // placeholder={(lstReport?.placeholderQuantity && lstReport?.placeholderQuantity !== '') ? lstReport?.placeholderQuantity : 'Số lượng'}
                                            placeholder={lstReport?.placeholderStock || 'Số lượng'}
                                            placeholderTextColor={appcolor.greydark}
                                            editable={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                            selectTextOnFocus={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                            onChangeText={(text) => changeValueDisplay(text, 'STOCK')}
                                            onEndEditing={(event) => endInputDisplay(event, 'STOCK')}
                                        />
                                    }
                                />
                            }
                            {
                                (lstReport?.isConstraintPrice !== 3 && lstReport?.isConstraintPrice !== 4) &&
                                <NumericFormat
                                    key={`price_${item.categoryId}_${item.subCatId}_${index}`}
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
                                                fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greydark, height: 35, width: (lstReport?.isUseStock == 1 || lstReport?.isUseStock == 2) ? '38%' : '58%',
                                            }}
                                            keyboardType='numeric'
                                            placeholder='Giá'
                                            placeholderTextColor={appcolor.greydark}
                                            editable={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                            selectTextOnFocus={(item.upload !== 1) || (lstReport?.isMultiSendData == 1)}
                                            onChangeText={changeValuePrice}
                                            onEndEditing={endInputPrice}
                                        />
                                    }
                                />
                            }
                        </View>
                    </View>
                </View>
                {
                    lstReport?.isNoteBySKU == 1 &&
                    <View style={{ paddingTop: 8 }}>
                        <FormGroup
                            key={`Note_${item.categoryId}_${item.subCatId}_${index}`}
                            iconName={'comment-alt'}
                            selectTextOnFocus={true}
                            containerStyle={{ backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5, }}
                            inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                            placeholder='Nhập ghi chú...'
                            editable={(item.upload !== 1) || (lstReport?.isMultiSendData == 1) ? true : false}
                            onClearTextAndroid={() => onChangeNote('')}
                            handleChangeForm={(text) => onChangeNote(text)}
                            defaultValue={inputNote || ''}
                        />
                    </View>
                }
            </View>
        </View>
    )
})
