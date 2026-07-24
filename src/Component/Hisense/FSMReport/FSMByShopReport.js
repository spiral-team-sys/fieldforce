
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
//import { NumericFormat } from "react-number-format";
import { useSelector } from "react-redux";
import { REPORT } from "../../../API/ReportAPI";
import FormGroup from "../../../Content/FormGroup";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { getCategoryPromotion } from "../../../Controller/ProductController";
import { getDataPhotoByReport, getPhotoRawReport, insertRawReport, itemUploaded, saveJsonData } from "../../../Controller/ReportController";
import { formatPhone, isPhone, ToastError, ToastSuccess, UUIDGenerator } from "../../../Core/Helper";
import { alertConfirm, deviceHeight, deviceWidth, minWidthTab, TODAY } from "../../../Core/Utility";
import { Badge, Icon } from '@rneui/themed';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
;
import moment from "moment";
import NativeCamera from "../../../Control/NativeCamera";
import { useFocusEffect } from "@react-navigation/native";
import { URLDEFAULT } from "../../../Core/URLs";
import { deletePhoto } from "../../../Controller/PhotoController";
import { LoadingView } from "../../../Control/ItemLoading";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// config 
// isCheckEnoughFSMCate : kiểm tra số lượng nhập hết theo cate chưa
// isCheckEnoughFSM : kiểm tra số thông tin đã nhập có bằng số lượng FSM không
// isCheckHaveInfo : kiểm tra cate đó đã nhập thông tin nếu đã nhập số lượng chưa
// limitPhoto : số lượng hình ảnh cần để gửi báo cáo

export const FSMByShopReport = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [data, setData] = useState({ dataTab: [], dataMain: [] })
    const [loading, setLoading] = useState(false)
    const [isUploaded, setUploaded] = useState(false)
    const [currentTab, setCurrentTab] = useState(0)
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
    const tabRef = useRef()
    const [_, setMutate] = useState(false)
    const [isVisible, setVisible] = useState(false)
    const [itemSelectEdit, setItemSelectEdit] = useState({ itemEdit: {}, indexTab: 0 })
    const lstReport = JSON.parse(kpiinfo?.reportItem || '[]')
    const [listPhoto, setListPhoto] = useState([])
    const [dataImage, setDataImage] = useState({ itemPhoto: [], indexPhoto: 0 })

    const loadData = async () => {
        await setLoading(true)
        await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
            if (mData !== null && mData.length > 0) {
                setData({ dataTab: mData, dataMain: mData })
            } else {
                const lstTabData = await getCategoryPromotion(workinfo)
                const dataInsert = {
                    shopId: dataFilter.shopId,
                    reportDate: workinfo.workDate,
                    jsonData: JSON.stringify(lstTabData || []),
                    jsonPhoto: '[]',
                    isUploaded: 0
                }
                await insertRawReport(dataInsert, dataFilter.reportId)
                setData({ dataTab: lstTabData, dataMain: lstTabData })
            }
        })
        const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id)
        await setUploaded(itemUpdate.isUploaded == 1)
        await countNumPhoto()
        await setLoading(false)
    }

    useEffect(() => {
        loadData()
        return () => false
    }, [])

    useFocusEffect(
        useCallback(() => {
            countNumPhoto()
            return () => false;
        }, [])
    );

    const handlerAddItem = async (itemAdd, itemTab, indexTab) => {
        const listEmployees = JSON.parse(data.dataMain[indexTab].listEmployees || '[]')
        if (listEmployees.length > 0) {
            const randomNumber = Math.floor(Math.random() * 200) + 1;
            if (listEmployees[randomNumber] !== undefined) {
                await handlerAddItem(itemAdd, itemTab, indexTab)
                return
            }
            let listEmployeesNew = [...listEmployees, { ...itemAdd, id: randomNumber }]
            data.dataMain[indexTab].listEmployees = JSON.stringify(listEmployeesNew)
            await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        } else {
            data.dataMain[indexTab].listEmployees = JSON.stringify([{ ...itemAdd, id: 0 }])
            await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        }
        await setMutate(e => !e)
    }

    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }

    const handleChangeItem = (text, type) => {
        if (type == 'NAME') {
            itemSelectEdit.itemEdit.name = text
            setItemSelectEdit({ itemEdit: { ...itemSelectEdit.itemEdit, name: text }, indexTab: itemSelectEdit.indexTab })
        } else {
            if (text !== null) {
                let textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
                if (text?.length == 11)
                    textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
                (!itemSelectEdit.itemEdit.phone || textValue == '' || textValue?.length < 12) && setItemSelectEdit({ itemEdit: { ...itemSelectEdit.itemEdit, phone: textValue }, indexTab: itemSelectEdit.indexTab })
            } else {
                setItemSelectEdit({ itemEdit: { ...itemSelectEdit.itemEdit, phone: null }, indexTab: itemSelectEdit.indexTab })
            }
        }
    }
    const handleOnEditItem = async () => {
        if (itemSelectEdit.itemEdit.name === null || itemSelectEdit.itemEdit.name === '') {
            await ToastError(`Tên không được để trống`, "Lỗi", "top")
            return
        }
        if (itemSelectEdit.itemEdit.phone === null || itemSelectEdit.itemEdit.phone === '') {
            await ToastError(`Số điện thoại không được để trống`, "Lỗi", "top")
            return
        }
        if (itemSelectEdit.itemEdit.phone !== null && itemSelectEdit.itemEdit.phone !== '') {
            const checkPhone = isPhone(itemSelectEdit.itemEdit.phone)
            if (!checkPhone) {
                await ToastError(`Số điện thoại không đúng định dạng`, "Lỗi", "top")
                return
            }
        }
        let listEmployees = JSON.parse(data.dataMain[itemSelectEdit.indexTab].listEmployees || '[]')
        const indexItem = listEmployees.findIndex(it => it.id == itemSelectEdit.itemEdit.id)
        listEmployees[indexItem] = itemSelectEdit.itemEdit
        data.dataMain[itemSelectEdit.indexTab].listEmployees = JSON.stringify(listEmployees)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        await handleVisibleModal(false)
    }

    const handleSelectEdit = async (itemEdit, indexTab) => {
        await setItemSelectEdit({ itemEdit: { ...itemEdit }, indexTab: indexTab })
        await handleVisibleModal(true)
    }

    const handleSelectDelete = async (itemDelete, indexTab) => {
        let listEmployees = JSON.parse(data.dataMain[indexTab].listEmployees || '[]')
        const listEmpNew = listEmployees.filter(it => it.id !== itemDelete.id)
        data.dataMain[indexTab].listEmployees = JSON.stringify(listEmpNew)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        setMutate(e => !e)
    }

    const handleSelectTab = (indexTab) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentTab(indexTab)
    }

    const showAlbum = (categoryName) => {
        let item = {
            "reportId": kpiinfo.kpiId,
            "shopId": workinfo.shopId,
            "photoType": 'FSM_REPORT',
            "photoDate": workinfo.workDate,
            reloadView: countNumPhoto
        }
        navigation.navigate('AlbumPhoto', item);
    }

    const takePhoto = async () => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'FSM_REPORT',
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

    const countNumPhoto = async () => {
        let dataPhoto = []
        dataPhoto = await getPhotoRawReport(dataFilter)
        if (dataPhoto.length > 0) {
            listPhoto.length !== dataPhoto.length ? await setListPhoto(dataPhoto) : []
        } else {
            dataPhoto = await getDataPhotoByReport(kpiinfo.id, shopinfo.shopId)
            listPhoto.length !== dataPhoto.length ? await setListPhoto(dataPhoto) : []
        }
    }
    const uploadData = async () => {
        const checkData = await validationData()
        if (checkData) {
            alertConfirm('Thông báo', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
                const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id)
                if (result.statusId === 200) {
                    await loadData()
                    await ToastSuccess(`Đã gửi dữ liệu lên hệ thống`, "Thông báo", "top")
                } else if (result.statusId === 200) {
                    await ToastError(`Xảy ra lỗi khi gửi dữ liệu lên hệ thống!`, "Thông báo", "top")
                }
            })
        }
    }

    const validationData = async () => {
        let countQuantity = 0
        for (let index = 0; index < data.dataMain.length; index++) {
            const itemMain = data.dataMain[index];
            if (itemMain.quantityFSM !== undefined && itemMain.quantityFSM > 0) {
                countQuantity = countQuantity + itemMain.quantityFSM
            }
        }
        if (countQuantity == 0) {
            ToastError(`Bạn chưa điền số lượng FSM cho bất kì ngành hàng nào!`, 'Thông báo', 'top')
            return false
        }
        for (let index = 0; index < data.dataMain.length; index++) {
            const itemMain = data.dataMain[index];
            const listEmp = JSON.parse(itemMain.listEmployees || '[]')

            if (lstReport.isCheckEnoughFSMCate == 1 && (itemMain.quantityFSM == undefined || itemMain.quantityFSM == null)) {
                ToastError(`Ngành hàng ${itemMain.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
                return false
            }
            if (lstReport.isCheckHaveInfo == 1 && (listEmp.length == 0 && itemMain.quantityFSM !== undefined && itemMain.quantityFSM > 0)) {
                ToastError(`Ngành hàng ${itemMain.name} bạn đã nhập số lượng FSM nhưng chưa nhập thông tin nhân viên!`, 'Thông báo', 'top')
                return false
            }
            if (listEmp.length > 0 && (itemMain.quantityFSM == undefined || itemMain.quantityFSM == null || itemMain.quantityFSM == 0)) {
                ToastError(`Ngành hàng ${itemMain.name} bạn đã nhập thông tin nhân viên nhưng chưa nhập số lượng FSM!`, 'Thông báo', 'top')
                return false
            }
            if (lstReport.isCheckEnoughFSM == 1 && itemMain.quantityFSM !== undefined && itemMain.quantityFSM > 0 && listEmp.length !== itemMain.quantityFSM) {
                ToastError(`Ngành hàng ${itemMain.name} số nhân viên bạn nhập ${listEmp.length < itemMain.quantityFSM ? 'ít hơn' : 'nhiều hơn'} so với số lượng FSM đã nhập!`, 'Thông báo', 'top')
                return false
            }
        }

        // if (lstReport.isCheckEnoughFSMCate == 1) {
        //     for (let index = 0; index < data.dataMain.length; index++) {
        //         const itemMain = data.dataMain[index];
        //         if (itemMain.quantityFSM == undefined || itemMain.quantityFSM == null) {
        //             ToastError(`Ngành hàng ${itemMain.name} bạn chưa điền số lượng FSM!`, 'Thông báo', 'top')
        //             return false
        //         }
        //     }
        // }

        // if (lstReport.isCheckHaveInfo == 1) {
        //     for (let index = 0; index < data.dataMain.length; index++) {
        //         const itemMain = data.dataMain[index];
        //         const listEmp = JSON.parse(itemMain.listEmployees || '[]')
        //         if (listEmp.length == 0 && itemMain.quantityFSM !== undefined && itemMain.quantityFSM > 0) {
        //             ToastError(`Ngành hàng ${itemMain.name} bạn đã nhập số lượng FSM nhưng chưa nhập thông tin nhân viên!`, 'Thông báo', 'top')
        //             return false
        //         }
        //     }
        // }
        // if (lstReport.isCheckEnoughFSM == 1) {
        //     for (let index = 0; index < data.dataMain.length; index++) {
        //         const itemMain = data.dataMain[index];
        //         const listEmp = JSON.parse(itemMain.listEmployees || '[]')
        //         if (itemMain.quantityFSM !== undefined && itemMain.quantityFSM > 0 && listEmp.length !== itemMain.quantityFSM) {
        //             ToastError(`Ngành hàng ${itemMain.name} số nhân viên bạn nhập ${listEmp.length < itemMain.quantityFSM ? 'ít hơn' : 'nhiều hơn'} so với số lượng FSM đã nhập!`, 'Thông báo', 'top')
        //             return false
        //         }
        //     }
        // }
        const dataPhoto = await getDataPhotoByReport(kpiinfo.id, shopinfo.shopId)
        if (lstReport.limitPhoto !== undefined && lstReport.limitPhoto > 0 && dataPhoto.length < ((lstReport.limitPhoto !== undefined) ? lstReport.limitPhoto : 1)) {
            ToastError(`bạn phải chụp tối thiểu ${(lstReport.limitPhoto !== undefined) ? lstReport.limitPhoto : 1} tấm hình! (${dataPhoto.length}/${(lstReport.limitPhoto !== undefined && lstReport.limitPhoto > 0) ? lstReport.limitPhoto : 1})`, 'Thông báo', 'top')
            return false
        }
        return true
    }
    const handleShowImage = async (itemImage, indexImage) => {
        dataImage.itemPhoto = itemImage
        dataImage.indexPhoto = indexImage
        SheetManager.show('imageSheetModal')
    }
    const handleVisibleImage = async () => {
        // dataImage.isShowPhoto ? (dataImage.isShowPhoto = false) : null
        // await setVisibleModalPhoto(e => !e)
        SheetManager.hide('imageSheetModal')
    }

    const handleDeletePhoto = (item) => {
        deletePhoto(item)
        const listFilter = listPhoto.filter(it => it.id !== item.id)
        setListPhoto(listFilter)
    }

    const HeaderView = ({ }) => {
        return (
            <View style={{ flexDirection: 'row', height: 45, width: deviceWidth, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleSelectTab(0)} style={{ height: 40, width: isUploaded ? '48%' : '38%', padding: 3 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, backgroundColor: currentTab == 0 ? appcolor.light : appcolor.surface }} >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Thông tin</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 40, width: isUploaded ? '48%' : '58%', flexDirection: 'row', padding: 3, justifyContent: 'space-between' }}>
                    {/* <View style={{ flexDirection: 'row', width: '50%', justifyContent: 'flex-end' }}> */}
                    {
                        !isUploaded &&
                        <TouchableOpacity
                            onPress={() => takePhoto()}
                            style={{ flexDirection: 'row', width: '48%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                            <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity
                        onPress={() => handleSelectTab(1)}
                        style={{ flexDirection: 'row', width: isUploaded ? '100%' : '48%', padding: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: currentTab == 1 ? appcolor.light : appcolor.surface }}>
                        <View style={{ flex: 1 }}>
                            <Badge badgeStyle={{ position: 'absolute', top: 0, right: 5, }} value={listPhoto.length} />
                            <SpiralIcon name='images' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                        </View>
                    </TouchableOpacity>
                </View>
                {/* <TouchableOpacity
                        style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, backgroundColor: currentTab == 1 ? appcolor.light : appcolor.surface }}
                        onPress={() => currentTab == 0 ? handleSelectTab(1) : null}
                    >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Hình ảnh</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        )
    }
    const ViewItem = () => {
        return (
            data.dataTab.map((it, idx) => {
                const listEmp = JSON.parse(data.dataMain[idx].listEmployees || '[]')

                return (
                    <Tabs.Tab key={`id_${idx}}`} label={`${it.name} ${listEmp.length > 0 ? '(' + listEmp.length + ')' : ''}`} name={`${it.name} ${listEmp.length > 0 ? '(' + listEmp.length + ')' : ''}`} >
                        <View style={{ flex: 1, backgroundColor: appcolor.surface, marginTop: 50, padding: 6, width: deviceWidth }}>
                            {
                                !isUploaded &&
                                <HeaderViewByCate key={idx} itemTab={it} indexTab={idx} data={data} dataFilter={dataFilter} handlerAddItem={handlerAddItem} />

                            }
                            {/* {
                                listEmp.length > 0 && */}
                            <View style={{ padding: 5, backgroundColor: appcolor.light, marginTop: 10, borderRadius: 10 }}>
                                <ScrollView>
                                    {
                                        listEmp.map((item, index) => {
                                            return <RenderItemData key={idx + '_' + index} item={item} index={index} indexTab={idx} handleSelectEdit={handleSelectEdit} handleSelectDelete={handleSelectDelete} isUploaded={isUploaded} />
                                        })
                                    }
                                    <View style={{ paddingBottom: listEmp.length > 10 ? deviceHeight / 2.5 : 0 }} />
                                </ScrollView>
                                {/* <FlatList
                                    extraData={listEmp}
                                    keyExtractor={(_item, index) => index.toString()}
                                    data={listEmp}
                                    renderItem={({ item, index }) => <MemoizedComponent item={item} index={index} indexTab={idx} handleSelectEdit={handleSelectEdit} handleSelectDelete={handleSelectDelete} isUploaded={isUploaded} />}
                                    // getItemLayout={getItemLayout}
                                    // removeClippedSubviews
                                    showsVerticalScrollIndicator={false}
                                    ListFooterComponent={<View style={{ paddingBottom: listEmp.length > 10 ? deviceHeight / 2.5 : 0 }} />}
                                /> */}
                            </View>
                            {/* } */}

                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                rightFunc={isUploaded ? null : uploadData}
            />
            <View style={{ flex: 1 }}>
                <HeaderView />
                <View style={{ display: currentTab == 1 ? "flex" : "none", flex: 1 }}>
                    <ViewListPhoto listPhoto={listPhoto} handleShowImage={handleShowImage} isUploaded={isUploaded} handleDeletePhoto={handleDeletePhoto} />
                </View>
                {loading && <LoadingView title={'Đang tải dữ liệu...'} isLoading={loading} styles={{ marginTop: 8 }} />}

                <KeyboardAvoidingView
                    style={{ flex: 1, flexDirection: 'column', display: currentTab == 0 ? "flex" : "none", justifyContent: 'center', marginTop: 5, paddingTop: 5, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: appcolor.surface }}
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                    {
                        data.dataTab.length > 0 &&
                        <Tabs.Container
                            ref={tabRef}
                            renderTabBar={(props) => (
                                <MaterialTabBar
                                    {...props}
                                    scrollEnabled={true}
                                    // tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42, }}
                                    tabStyle={{ borderRadius: 8, backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab), height: 38, marginTop: 5, borderColor: appcolor.grayLight, borderWidth: 1, marginHorizontal: 5 }}
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
                </KeyboardAvoidingView>
            </View>
            <ActionSheet
                id={'imageSheetModal'}
                containerStyle={{ height: deviceHeight, width: deviceWidth, backgroundColor: appcolor.light, paddingBottom: insets.bottom }}
            >
                <ViewImageSheet dataImage={dataImage} handleVisible={handleVisibleImage} />
            </ActionSheet>
            <Modal
                visible={isVisible}
                animationType="fade"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', }}>
                    <View style={{
                        justifyContent: 'space-between', backgroundColor: appcolor.light, borderRadius: 20, padding: 20,
                        alignItems: 'center', shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2, },
                        shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
                    }}>
                        <Text style={{ color: appcolor.dark, padding: 10, fontWeight: '600', fontSize: 18, }}>{'Chỉnh sửa thông tin'}</Text>
                        <View style={{ width: deviceWidth * 0.8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '30%' }}>
                                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, marginHorizontal: 5 }}>Tên FSM :</Text>
                                </View>
                                <FormGroup
                                    containerStyle={{ width: '70%', height: 32, padding: 0, borderColor: appcolor.grey, borderRadius: 5, margin: 0, marginBottom: 0 }}
                                    key={'editName'}
                                    numberOfLines={1}
                                    defaultValue={
                                        itemSelectEdit.itemEdit.name || ''
                                        // (field === 'mobile' ? formatPhone(value || '') : value) || ''
                                    }
                                    keyboardType={'default'}
                                    // rightFunc={() => openSheet(sheetMode)}
                                    editable={true}
                                    useClearAndroid={true}
                                    onClearTextAndroid={() => handleChangeItem('', 'NAME')}
                                    placeholder={'Nhập tên FSM'}
                                    placeholderTextColor={appcolor.greydark}
                                    // onEndEditing={(e) => handleChangeItem(field, e)}
                                    handleChangeForm={(text) => handleChangeItem(text, 'NAME')}
                                    selectTextOnFocus
                                />
                            </View>
                            <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 3 }}>
                                <View style={{ width: '30%' }}>
                                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, marginHorizontal: 5 }}>Sđt :</Text>
                                </View>
                                <FormGroup
                                    containerStyle={{ width: '70%', height: 32, padding: 0, borderColor: appcolor.grey, borderRadius: 5, margin: 0, marginBottom: 0 }}
                                    key={'editPhone'}
                                    numberOfLines={1}
                                    value={formatPhone(itemSelectEdit.itemEdit.phone || '')}
                                    keyboardType={'numeric'}
                                    editable={true}
                                    useClearAndroid={true}
                                    onClearTextAndroid={() => handleChangeItem('', 'PHONE')}
                                    placeholder={'Nhập số điện thoại'}
                                    placeholderTextColor={appcolor.greydark}
                                    // onEndEditing={(e) => handleChangeItem(field, e)}
                                    handleChangeForm={(text) => handleChangeItem(text, 'PHONE')}
                                    selectTextOnFocus
                                />
                            </View>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: deviceWidth * 0.7, marginTop: 20, height: 50 }}>
                            <TouchableOpacity
                                onPress={() => setVisible(false)}
                                style={{ justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.3, borderRadius: 20, backgroundColor: appcolor.surface, padding: 10, }}
                            >
                                <Text style={{ color: appcolor.dark }}>Huỷ bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleOnEditItem()}
                                style={{ justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.3, borderRadius: 20, backgroundColor: appcolor.surface, padding: 10, marginLeft: 10 }}
                            >
                                <Text style={{ color: appcolor.dark }}>Sửa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const ViewListPhoto = ({ listPhoto, handleShowImage, isUploaded, handleDeletePhoto }) => {
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [_, setMutate] = useState(false)
    const [listPhotoClone, setListPhotoClone] = useState(listPhoto)

    useEffect(() => {
        const _load = setListPhotoClone(listPhoto)
    }, [listPhoto])

    const handleSelectDelete = (item) => {
        handleDeletePhoto(item)

        // setMutate(e => !e)
    }
    const handleLongPress = () => {
        listPhotoClone.map(it => it.isDelete = it.isDelete == true ? false : true)
        setMutate(e => !e)
    }

    const handleSelectImage = (item, index) => {
        handleShowImage(item, index)
    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, borderRadius: 10, marginHorizontal: 5, marginTop: 5 }}>
                <TouchableOpacity
                    onLongPress={() => !isUploaded ? handleLongPress() : null}
                    style={{ borderRadius: 10, flex: 1 }}
                    onPress={() => handleSelectImage(item, index)}
                >
                    <Image source={{ uri: item.photoPath.includes('uploaded') ? (URLDEFAULT + item.photoPath) : (item.photoPath || '') }}
                        style={{ width: '100%', height: 130, zIndex: 3, borderRadius: 10 }} />
                </TouchableOpacity>
                {
                    (item.isDelete == true && !isUploaded) &&
                    <TouchableOpacity
                        onPress={() => handleSelectDelete(item)}
                        style={{ flexDirection: 'row', padding: 5, alignItems: 'center', position: 'absolute', top: 5, right: 5, borderRadius: 5, backgroundColor: 'rgba(241,242,247,0.5)' }}>
                        <SpiralIcon color={appcolor.danger} name='trash-alt' type='font-awesome-5' size={18} style={{ paddingHorizontal: 10 }} />
                    </TouchableOpacity>
                }
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface, width: deviceWidth, paddingTop: 5, marginTop: 5, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <FlatList
                style={{ padding: 5 }}
                keyExtractor={(item, index) => index.toString()}
                data={listPhotoClone}
                renderItem={renderItem}
                numColumns={2}
            />
        </View>
    )
}

const ViewImageSheet = ({ dataImage, handleVisible }) => {
    const [itemPhoto, setItemPhoto] = useState({})
    const appcolor = useSelector(state => state.GAppState.appcolor)

    useEffect(() => {
        loadData()
        return () => false
    }, [])
    const loadData = () => {
        const itemImage = dataImage.itemPhoto
        setItemPhoto(itemImage)
    }
    return (
        <View style={{ width: '100%', height: '100%' }}>
            <TouchableOpacity onPress={() => handleVisible()}
                style={{ position: 'absolute', right: 20, top: Platform.OS == 'ios' ? 40 : 20, zIndex: 100, borderRadius: 5, borderWidth: 1, padding: 3, paddingHorizontal: 10, borderColor: appcolor.primary }}>
                <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}>Đóng</Text>
            </TouchableOpacity>
            {
                itemPhoto?.photoPath !== undefined &&
                <Image source={{ uri: itemPhoto.photoPath.includes('uploaded') ? (URLDEFAULT + itemPhoto.photoPath) : (itemPhoto.photoPath || '') }} resizeMode={'contain'} style={{ width: '100%', height: '100%' }} />
            }
        </View>

    )
}

const RenderItemData = memo(({ item, index, indexTab, handleSelectEdit, handleSelectDelete, isUploaded }) => {
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const onSelectEdit = () => {
        handleSelectEdit(item, indexTab)
    }
    const onSelectDelete = () => {
        handleSelectDelete(item, indexTab)
    }
    return (
        <View style={{ padding: 5, borderRadius: 5, backgroundColor: appcolor.surface, marginTop: index == 0 ? 0 : 5, flexDirection: 'row' }}>
            <View style={{ width: '80%' }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Tên : </Text>
                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{item.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', paddingTop: 3 }}>
                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>Sđt : </Text>
                    <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{item.phone}</Text>
                </View>
            </View>
            {
                !isUploaded &&
                <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
                    <TouchableOpacity
                        style={{ padding: 5, borderRadius: 50, backgroundColor: appcolor.light, }}
                        onPress={() => onSelectEdit()}
                    >
                        <SpiralIcon name={'edit'} size={16} solid={true} type='font-awesome-5' color={appcolor.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ padding: 5, borderRadius: 50, backgroundColor: appcolor.light, marginLeft: 5 }}
                        onPress={() => onSelectDelete()}
                    >
                        <SpiralIcon name={'trash-alt'} size={16} solid={true} type='font-awesome-5' color={appcolor.red} />
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
})

const HeaderViewByCate = ({ itemTab, indexTab, data, dataFilter, handlerAddItem }) => {
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [itemAdd, setItemAdd] = useState({ name: '', phone: '' })
    const [quantityByCate, setQuantityByCate] = useState(itemTab.quantityFSM || '')

    const handleOnChangeItem = (text, type) => {
        if (type == 'NAME') {
            setItemAdd({ ...itemAdd, name: text })
        } else {
            if (text !== null) {
                let textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
                if (text?.length == 11)
                    textValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
                (!itemAdd.phone || textValue == '' || textValue?.length < 12) && setItemAdd({ ...itemAdd, phone: textValue })
            } else {
                setItemAdd({ ...itemAdd, phone: null })
            }
        }
    }

    const handleChangeQuantity = async (text) => {
        let quanity = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        setQuantityByCate(quanity == null ? '' : parseInt(quanity))
        data.dataMain[indexTab].quantityFSM = (quanity == null ? null : parseInt(quanity))
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
    }
    const handlerSelectAdd = async () => {
        if (itemAdd.name === null || itemAdd.name === '') {
            await ToastError(`Tên không được để trống`, "Lỗi", "top")
            return
        }
        if (itemAdd.phone === null || itemAdd.phone === '') {
            await ToastError(`Số điện thoại không được để trống`, "Lỗi", "top")
            return
        }
        if (itemAdd.phone !== null && itemAdd.phone !== '') {
            const checkPhone = isPhone(itemAdd.phone)
            if (!checkPhone) {
                await ToastError(`Số điện thoại không đúng định dạng`, "Lỗi", "top")
                return
            }
        }

        await handlerAddItem(itemAdd, itemTab, indexTab)
        await setItemAdd({ name: '', phone: '' })
    }

    return (
        <View style={{}}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.light, borderRadius: 10, marginBottom: 5 }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Nhập số lượng FSM</Text>
                <NumericFormat
                    value={quantityByCate}
                    displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                    renderText={value =>
                        <TextInput
                            textAlign={'center'}
                            value={value}
                            style={{ fontSize: 13, padding: 8, margin: 3, marginHorizontal: 8, backgroundColor: appcolor.surface, borderRadius: 5, color: appcolor.dark, minWidth: 60 }}
                            keyboardType='numeric'
                            placeholder={'SL'}
                            placeholderTextColor={appcolor.greydark}
                            // editable={!isUploaded} selectTextOnFocus={!isUploaded}
                            onChangeText={handleChangeQuantity}
                        // onEndEditing={handlerEdit}
                        >
                        </TextInput>
                    }
                />
            </View>
            <View style={{ padding: 5, flexDirection: "row", backgroundColor: appcolor.light, borderRadius: 10 }}>
                <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: '30%' }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, marginHorizontal: 5 }}>Tên FSM :</Text>
                        </View>
                        <FormGroup
                            containerStyle={{ width: '70%', height: 32, padding: 0, borderColor: appcolor.grey, borderRadius: 5, margin: 0, marginBottom: 0 }}
                            key={'nameByTab_' + indexTab}
                            numberOfLines={1}
                            defaultValue={
                                itemAdd.name || ''
                                // (field === 'mobile' ? formatPhone(value || '') : value) || ''
                            }
                            keyboardType={'default'}
                            // rightFunc={() => openSheet(sheetMode)}
                            editable={true}
                            useClearAndroid={true}
                            onClearTextAndroid={() => handleOnChangeItem('', 'NAME')}
                            placeholder={'Nhập tên FSM'}
                            placeholderTextColor={appcolor.greydark}
                            // onEndEditing={(e) => handleChangeItem(field, e)}
                            handleChangeForm={(text) => handleOnChangeItem(text, 'NAME')}
                            selectTextOnFocus
                        />
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 3 }}>
                        <View style={{ width: '30%' }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, marginHorizontal: 5 }}>Sđt :</Text>
                        </View>
                        <FormGroup
                            containerStyle={{ width: '70%', height: 32, padding: 0, borderColor: appcolor.grey, borderRadius: 5, margin: 0, marginBottom: 0 }}
                            key={'editByTab_' + indexTab}
                            numberOfLines={1}
                            value={formatPhone(itemAdd.phone || '')}
                            keyboardType={'numeric'}
                            // rightFunc={() => openSheet(sheetMode)}
                            editable={true}
                            useClearAndroid={true}
                            onClearTextAndroid={() => handleOnChangeItem('', 'PHONE')}
                            placeholder={'Nhập số điện thoại'}
                            placeholderTextColor={appcolor.greydark}
                            // onEndEditing={(e) => handleChangeItem(field, e)}
                            handleChangeForm={(text) => handleOnChangeItem(text, 'PHONE')}
                            selectTextOnFocus
                        />
                    </View>
                </View>
                <View style={{ width: '20%', minHeight: 30 }}>
                    <TouchableOpacity
                        onPress={() => handlerSelectAdd()}
                        style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: appcolor.primary, borderRadius: 8, marginLeft: 5 }}
                    >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.white, marginHorizontal: 5 }}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}



