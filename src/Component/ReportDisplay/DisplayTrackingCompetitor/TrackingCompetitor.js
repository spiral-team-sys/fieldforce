import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { minWidthTab, removeDuplicate, } from '../../../Core/Utility';
import { groupDataByKey, ToastError, ToastSuccess, UUIDGenerator } from '../../../Core/Helper';
import { deviceWidth } from '../../../Themes/AppsStyle';
import { insertTotalTrackingLG, getListDataTracking, getListCategoryTracking, updateNoteTracking, updateCheckValueTracking, clearDataTrackingCompetitor } from '../../../Controller/TrackingDetailController';

import { scaleSize } from '../../../Themes/AppsStyle';
import { useSelector } from 'react-redux';
// import { NumericFormat } from 'react-number-format';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../../Control/ItemLoading';
import { AppNameBuild, bekoApp } from '../../../Core/URLs';
import FormGroup from '../../../Content/FormGroup';
import { TouchableOpacity } from 'react-native';
import { Badge } from '@rneui/themed';
import { getAllPhotos } from '../../../Controller/WorkController';
import { useFocusEffect } from '@react-navigation/native';

import moment from 'moment';
import NativeCamera from '../../../Control/NativeCamera';
import { NumPad_V2 } from '../../../Control/NumPad_V2';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../../Home';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TrackingCompetitor = ({ navigation, route, reload, Status, toolAction }) => {
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const [isDone, setDone] = useState(false)
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const reportItem = JSON.parse(kpiinfo?.reportItem)
    const reportId = kpiinfo.id || kpiinfo.kpiId
    const [_, setMutate] = useState(false);
    const [listPhotoByCategory, setPhotoByCategory] = useState([])
    const tabRef = useRef()
    const [open, setOpen] = useState(false);
    const styles = StyleSheet.create({
        parentHeader: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center'
        },
        parentTitle: {
            fontSize: scaleSize(15),
            fontWeight: '700',
            paddingLeft: 4
        },
        sectionHeader: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginTop: 4,
            flexDirection: 'row',
            alignItems: 'center'
        },
        sectionTitle: {
            fontSize: 13,
            paddingLeft: 7,
            fontWeight: '600',
            flexShrink: 1
        },
        itemCard: {
            width: '100%',
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginBottom: 2,
            borderRadius: 6
        },
        itemRow: {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            minHeight: 42
        },
        itemTitle: {
            fontSize: scaleSize(12),
            textAlign: 'left',
            width: '64%',
            paddingRight: 8
        },
        inputColumn: {
            width: '36%'
        },
        quantityInput: {
            fontSize: scaleSize(12),
            width: '100%',
            minHeight: 36,
            textAlign: 'center',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: Platform.OS === 'ios' ? 7 : 4
        },
        confirmActions: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginBottom: 3
        },
        confirmButton: {
            flex: 1,
            minHeight: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 6,
            borderWidth: 0.6,
            marginHorizontal: 2,
            paddingHorizontal: 3
        },
        confirmText: {
            fontSize: 10,
            paddingLeft: 3,
            fontWeight: '600'
        },
        noteContainer: {
            width: '100%',
            minHeight: 32,
            padding: 3,
            marginTop: 4,
            marginBottom: 0,
            borderWidth: 0.5,
            borderRadius: 6
        },
        tabContent: {
            marginTop: 40,
            paddingHorizontal: 4,
            paddingTop: 4,
            width: deviceWidth
        }
    })

    const isItemInputDone = (item) => {
        const hasDisplay = item.display !== null && item.display !== undefined
        const hasText = item.textValue !== null && item.textValue !== undefined && `${item.textValue}`.trim() !== ''
        const hasCheck = item.isChangeValue == 1 || item.isCheckValue == 1
        return hasDisplay || hasText || hasCheck
    }
    const mapDataShow = async (lstData) => {
        let lstTab = []
        lstTab = await createTabData(lstData)
        const { arr } = groupDataByKey({
            arr: lstData,
            key: reportItem.isViewByConfig == 1 ? (reportItem.viewByList?.key1 || 'categoryId') : (AppNameBuild === bekoApp ? 'competitorId' : 'subCatId'),
            keyLayer2: reportItem.isViewByConfig == 1 ? (reportItem.viewByList?.key2 || 'subCatId') : (AppNameBuild === bekoApp ? 'subCatId' : 'competitorId')
        })
        await setArrTagShow(lstTab)
        await setArrDataShow(arr)
    }
    const loadData = async (filterDone = isDone) => {
        await setLoading(true)
        let lstData = await getListDataTracking(workinfo, reportItem.DisplayCompetitor)
        if (filterDone) {
            lstData = lstData.filter(isItemInputDone)
        }
        await mapDataShow(lstData)
        await setLoading(false)
    }
    const createTabData = async (lstData) => {
        let listByConfig = []
        let lstTab = []
        if (reportItem.isViewByConfig == 1) {
            lstTab = removeDuplicate(lstData, reportItem.viewByList?.code)
        } else {
            lstTab = await getListCategoryTracking(reportItem.DisplayCompetitor)
        }
        for (let i = 0; i < lstTab?.length || 0; i++) {
            const item = lstTab[i]
            listByConfig.push({
                ...item,
                tabName: item[reportItem.viewByList?.name || 'category'],
                tabId: item[reportItem.viewByList?.code || 'categoryId']
            })
        }

        return listByConfig
    }
    useEffect(() => {
        loadData();
        return () => loading;
    }, [reload])
    useEffect(() => {
        const handlerToolAction = async () => {
            if (!toolAction?.type) {
                return
            }
            if (toolAction.type === 'FILTER_DONE') {
                const nextDone = toolAction.enabled === true
                await setDone(nextDone)
                await loadData(nextDone)
            }
            if (toolAction.type === 'CLEAR_DATA') {
                if (Status == 1) {
                    ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
                    return
                }
                await clearDataTrackingCompetitor(workinfo, reportItem.DisplayCompetitor)
                await setDone(false)
                await loadData(false)
                ToastSuccess('Đã xóa dữ liệu đã nhập', 'Thông báo', 'top')
            }
        }
        handlerToolAction()
    }, [toolAction])

    useFocusEffect(
        useCallback(() => {
            if (reportItem?.isTakeByCate == 1) {
                countNumPhoto()
            }
            return () => false;
        }, [])
    );

    //View Item Product by Competitor
    const countNumPhoto = async () => {
        let resPhotos = await getAllPhotos(reportId, workinfo.shopId, workinfo.workDate);
        listPhotoByCategory.length !== resPhotos.length ? await setPhotoByCategory(resPhotos) : []
    }

    const onChangeTextValue = async (item, index, text) => {
        let mDisplay = 0
        if (text == '' && text != 0) {
            mDisplay = null
        } else {
            if (item.isInputText == 1) {
                mDisplay = text
            } else {
                let value = text !== null && (text?.length > 0 || (typeof text == 'number' && text >= 0)) ? text.toString().replace(/,/g, '') : null
                mDisplay = (value === '' || value === null) ? null : parseInt(value);
            }
        }
        let indexD = arrDataShow.findIndex(it => it.id === item.id)
        if (item.isInputText == 1) {
            arrDataShow[indexD].textValue = mDisplay
        } else {
            item.display = mDisplay
            arrDataShow[indexD].display = mDisplay
        }
        await setMutate(e => !e)
        await insertTotalTrackingLG(workinfo, item, mDisplay)
    }
    const handleSelectCheckBox = async (item, value, fieldItem) => {
        const oppositeField = fieldItem == 'isCheckValue' ? 'isChangeValue' : 'isCheckValue';
        const wasChangeValue = item.isChangeValue == 1;
        const indexD = arrDataShow.findIndex(it => it.id === item.id)

        item[fieldItem] = value ? 1 : 0;
        if (value) {
            item[oppositeField] = 0;
        }

        if (
            (fieldItem == 'isChangeValue' && !value) ||
            (fieldItem == 'isCheckValue' && value && wasChangeValue)
        ) {
            item.display = item.oldDisplay
        }

        if (indexD >= 0) {
            arrDataShow[indexD] = item
        }
        await updateCheckValueTracking(workinfo, item)
        await setMutate(e => !e)
    }
    const handlerTakePhotoTemplate = (categoryName) => {
        navigation.navigate('photogroup', { Status: Status, keyPhoto: categoryName, hideIcon: true, dataImageList: reportItem?.ImageByList || [] })
    }
    const takePhoto = async (categoryName) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": reportId,
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
    const showAlbum = (categoryName) => {
        let item = {
            "reportId": reportId,
            "shopId": workinfo.shopId,
            "photoType": categoryName,
            "photoDate": workinfo.workDate,
            reloadView: countNumPhoto
        }
        navigation.navigate('AlbumPhoto', item);
    }

    //View Item Tracking
    const RenderItemData = ({ item, index }) => {
        const keyLayer2 = item[AppNameBuild === bekoApp ? `${item.competitorId}${item.subCatId}` : `${item.subCatId}${item.competitorId}`]
        const changeTextItem = (it, text) => {
            onChangeTextValue(it, index, text)
        }
        const fontWeightTotal = item.refName == 'TOTAL' ? '800' : '500'
        const colorTotal = item.refName == 'TOTAL' ? appcolor.primary : appcolor.dark
        const isConfirmItem = reportItem.isConfirmData == 1 && item.numberValue == 1 && item.oldEmployeeId > 0
        const isInputDisabled = item.upload === 1 || (isConfirmItem && (!item.isChangeValue || item.isChangeValue == 0))
        const ConfirmButton = ({ title, fieldItem, active, color }) => (
            <TouchableOpacity
                disabled={Status == 1}
                onPress={() => handleSelectCheckBox(item, !active, fieldItem)}
                style={[styles.confirmButton, {
                    borderColor: active ? color : appcolor.grayLight,
                    backgroundColor: appcolor.light
                }]}>
                <SpiralIcon name={active ? 'check-square' : 'square'} size={13} color={active ? color : appcolor.black} />
                <Text numberOfLines={1} style={[styles.confirmText, { color: appcolor.dark }]}>{title}</Text>
            </TouchableOpacity>
        )
        const ConfirmActions = () => (
            isConfirmItem &&
            <View style={styles.confirmActions}>
                <ConfirmButton title={'Đúng'} fieldItem={'isCheckValue'} active={item.isCheckValue == 1} color={appcolor.success} />
                <ConfirmButton title={'Sai'} fieldItem={'isChangeValue'} active={item.isChangeValue == 1} color={appcolor.danger} />
            </View>
        )

        return (
            <View key={`DS_${index}}`} style={{ width: '100%' }} >
                {item.isParent && ((AppNameBuild === bekoApp && item.competitorName != null && item.competitorName?.length > 0) || (item.subCategory !== null && item.subCategory?.length > 0)) &&
                    <View style={styles.parentHeader}>
                        <Text numberOfLines={1} style={[styles.parentTitle, { color: appcolor.primary }]}>{`${AppNameBuild === bekoApp ? item.competitorName : item.subCategory}`}</Text>
                    </View>
                }
                {keyLayer2 && ((AppNameBuild === bekoApp && item.subCategory !== null && item.subCategory?.length > 0) || (item.competitorName !== null && item.competitorName?.length > 0)) &&
                    <View style={[styles.sectionHeader, { backgroundColor: appcolor.grayLight }]}>
                        <SpiralIcon name='tags' style={{ color: appcolor.dark }} />
                        <Text numberOfLines={1} style={[styles.sectionTitle, { color: appcolor.dark }]}>{AppNameBuild === bekoApp ? item.subCategory : item.competitorName}</Text>
                    </View>
                }
                <View style={[styles.itemCard, { backgroundColor: appcolor.surface }]}>
                    <View style={styles.itemRow}>
                        <Text numberOfLines={2} style={[styles.itemTitle, { color: colorTotal, fontWeight: fontWeightTotal }]}>{item.segment ? item.segment : item.refName}</Text>
                        {
                            item.numberValue == 1 && reportItem.isUseNumPad == 1 &&
                            <View style={styles.inputColumn}>
                                <ConfirmActions />
                                <NumPad_V2
                                    inputStyle={[styles.quantityInput, {
                                        color: colorTotal,
                                        fontWeight: fontWeightTotal,
                                        backgroundColor: appcolor.light,
                                        borderWidth: isInputDisabled ? 1 : 0,
                                        borderColor: isInputDisabled ? appcolor.greydark : appcolor.transparent
                                    }]}
                                    showIcon={!isInputDisabled}
                                    index={index} iconSize={14}
                                    value={item.display}
                                    placeholderText={'SL'}
                                    upload={isInputDisabled}
                                    item={item}
                                    editable={!isInputDisabled}
                                    handerNumberChange={(it, e) => changeTextItem(it, e)}
                                />

                            </View>
                        }

                        {
                            item.numberValue == 1 && reportItem.isUseNumPad !== 1 &&
                            <View style={styles.inputColumn}>
                                <ConfirmActions />
                                <NumericFormat
                                    value={item.display === 0 ? 0 : (item.display || '')}
                                    displayType='text'
                                    thousandSeparator={true}
                                    renderText={value =>
                                        <TextInput
                                            textAlign={'center'}
                                            value={value}
                                            style={[styles.quantityInput, {
                                                color: colorTotal,
                                                fontWeight: fontWeightTotal,
                                                backgroundColor: appcolor.light,
                                                borderWidth: isInputDisabled ? 1 : 0,
                                                borderColor: isInputDisabled ? appcolor.greydark : appcolor.transparent
                                            }]}
                                            selectTextOnFocus
                                            keyboardType='numeric'
                                            placeholder='Số lượng'
                                            placeholderTextColor={appcolor.greydark}
                                            editable={!isInputDisabled}
                                            onChangeText={(e) => changeTextItem(item, e)}
                                        />
                                    }
                                />
                            </View>
                        }
                    </View>
                    {
                        item.isInputText == 1 &&
                        <FormGroup
                            key={item.id + '_' + index}
                            iconName={'comment-alt'}
                            multiline={true} selectTextOnFocus={true}
                            containerStyle={[styles.noteContainer, {
                                backgroundColor: appcolor.light,
                                borderColor: appcolor.grayLight
                            }]}
                            inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                            placeholder='Nhập nội dung...'
                            editable={item.upload === 1 ? false : true}
                            onClearTextAndroid={changeTextItem}
                            handleChangeForm={changeTextItem}
                            defaultValue={item.textValue || ''}
                        />
                    }
                </View>
            </View>
        )
    }

    const handleSelectButton = (type) => {
        if (type == 'FormNote') {
            SheetManager.show('sheetNote')
            setOpen(false)
        }
    }
    const handlerFormNoteChange = (text) => {
        arrDataShow.map(it => it.note = text)
        updateNoteTracking(workinfo, text, reportItem.DisplayCompetitor);
        setMutate(e => !e)
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <LoadingView title={'Đang cập nhật dữ liệu'} isLoading={loading} styles={{ marginTop: 8 }} />
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 10} >
                {
                    arrTagShow.length > 0 && !loading &&
                    <Tabs.Container
                        ref={tabRef}
                        pagerProps={{ scrollEnabled: true, pagingEnabled: true }}
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, color: appcolor.dark, fontWeight: '600' }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 38 }}
                                scrollEnabled={true}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                style={{ backgroundColor: appcolor.light }}
                            />
                        )} >
                        {arrTagShow.map((it, i) => {
                            let dataByCategoryId = arrDataShow.filter(data => data[reportItem.viewByList?.code || 'categoryId'] == it.tabId)
                            const totalRow = dataByCategoryId.length
                            const totalPhoto = listPhotoByCategory.length > 0 ? (listPhotoByCategory?.filter(i => i.photoType?.includes(it.tabName)) || []).length : 0
                            const _tabName = reportItem.isOnlyItem == 1 ? `Đối thủ ${totalRow !== 0 ? `(${totalRow})` : ''}` : `${it.tabName} ${totalRow !== 0 ? `(${totalRow})` : ''}`
                            return (
                                <Tabs.Tab key={i} label={_tabName} name={_tabName} >
                                    <View style={[styles.tabContent, { backgroundColor: appcolor.light }]}>
                                        <View style={{
                                            backgroundColor: appcolor.light, flexDirection: 'row',
                                            justifyContent: 'flex-end', width: '100%', marginBottom: 5
                                        }}>
                                            {
                                                reportItem?.isTakeByCate == 1 &&
                                                (reportItem?.isTakeTemplate == 1 ?
                                                    <TouchableOpacity
                                                        onPress={() => handlerTakePhotoTemplate(it.tabName)}
                                                        style={{ minHeight: 30, marginRight: 3, padding: 3, paddingVertical: 5, marginRight: 3, borderRadius: 6, backgroundColor: appcolor.surface }}>
                                                        <Badge badgeStyle={{ position: 'absolute', top: -8, right: -8 }} value={totalPhoto} />
                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 5 }}>
                                                            {
                                                                Status != 1 ?
                                                                    <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={16}></SpiralIcon>
                                                                    :
                                                                    <SpiralIcon name='images' color={appcolor.primary} type='ionicon' size={16}></SpiralIcon>
                                                            }
                                                            <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>{Status != 1 ? 'Chụp hình' : 'Xem hình'}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    :
                                                    <View style={{ flexDirection: 'row', width: '50%', justifyContent: "flex-end" }}>
                                                        {
                                                            Status != 1 && <TouchableOpacity
                                                                onPress={() => takePhoto(it.tabName)}
                                                                style={{ flexDirection: 'row', minHeight: 30, marginRight: 2, padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: appcolor.surface }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                    <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={16}></SpiralIcon>
                                                                    <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>Chụp hình</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        }
                                                        <TouchableOpacity
                                                            onPress={() => showAlbum(it.tabName)}
                                                            style={{ minHeight: 30, padding: 3, paddingVertical: 5, marginRight: 3, borderRadius: 6, backgroundColor: appcolor.surface }}>
                                                            <Badge badgeStyle={{ position: 'absolute', top: -8, right: -8 }} value={totalPhoto} />
                                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                <SpiralIcon name='images' color={appcolor.primary} type='ionicon' size={16}></SpiralIcon>
                                                                <Text style={{ color: appcolor.dark, fontSize: 12, paddingLeft: 3 }}>Xem hình</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            }
                                        </View>
                                        <FlatList
                                            extraData={arrDataShow}
                                            keyExtractor={(item, index) => item + index}
                                            data={dataByCategoryId}
                                            removeClippedSubviews={false}
                                            scrollToOverflowEnabled={true}
                                            nestedScrollEnabled={true}
                                            renderItem={RenderItemData}
                                            showsVerticalScrollIndicator={false}
                                            ListFooterComponent={<Text style={{ width: '100%', height: deviceWidth / 2, textAlign: 'center', color: appcolor.dark, padding: 8 }}>{dataByCategoryId.length > 10 ? 'Đã xem hết' : ''}</Text>}
                                        />
                                    </View>
                                </Tabs.Tab>
                            )
                        })}
                    </Tabs.Container>
                }

                {
                    reportItem.isUseTool == 1 &&
                    <TouchableOpacity style={{
                        width: 55, height: 55, position: "absolute", bottom: 40, end: 20, zIndex: 10, borderRadius: 50,
                        justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.primary
                    }}
                        onPress={() => handleSelectButton('FormNote')}>
                        <View style={{
                            alignItems: 'center', borderRadius: 30,
                        }}>
                            <SpiralIcon size={28} color={appcolor.white} name='comment' />
                        </View>
                    </TouchableOpacity>
                }
            </KeyboardAvoidingView>

            <ActionSheet
                id={'sheetNote'}
                keyboardHandlerEnabled={false}
                defaultOverlayOpacity={0.3}
                // onClose={handlerClose}
                gestureEnabled={true}
                containerStyle={{ backgroundColor: appcolor.light, paddingBottom: insets.bottom }}>
                <View style={{ width: '100%', height: deviceHeight * 0.6, alignContent: 'center', padding: 8 }}>
                    <FormGroup
                        key={'ViewFormNote'}
                        iconName={'comment-alt'}
                        multiline={true} selectTextOnFocus={true}
                        containerStyle={{
                            backgroundColor: appcolor.light, width: '100%', minHeight: 40,
                            paddingHorizontal: 10, paddingVertical: 8, marginTop: 8, borderColor: appcolor.grayLight, borderWidth: 1,
                            borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
                        }}
                        inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                        placeholder='Nhập nội dung...'
                        editable={true}
                        onClearTextAndroid={handlerFormNoteChange}
                        handleChangeForm={handlerFormNoteChange}
                        defaultValue={arrDataShow[0]?.note || ''}
                    />
                </View>
            </ActionSheet>
        </View >
    )
}
