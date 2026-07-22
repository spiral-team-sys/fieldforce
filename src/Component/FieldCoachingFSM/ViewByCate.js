
import React, { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
////import { NumericFormat } from "react-number-format";;
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { deviceHeight, TODAY } from "../../Core/Utility";
import { Badge, Icon } from '@rneui/themed';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
;
import moment from "moment";
import NativeCamera from "../../Control/NativeCamera";
import { _competitorId, _competitorName } from "../../Core/URLs";
import { deletePhoto } from "../../Controller/PhotoController";
import { scaleSize } from "../../Themes/AppsStyle";
import { ViewListPhoto } from "./ViewListPhoto";
import { saveJsonData } from "../../Controller/ReportController";
import { UUIDGenerator } from "../../Core/Helper";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ViewByCate = ({ itemTab, indexTab, data, countNumPhoto, listPhoto, listPhotoMain, isUploaded, contentSelect }) => {
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [dataSubCate, setDataSubCate] = useState(JSON.parse(itemTab.listSubCate || '[]'))
    const [dataP, setDataP] = useState({ dataProduct: data.listProduct.filter(it => it.categoryId == itemTab.id), dataProductF: data.listProduct.filter(it => it.categoryId == itemTab.id) })
    const [showList, setShowList] = useState({ isShowList: false, dataShow: [], itemSelect: {}, typeShow: '' })
    const [_, setMutate] = useState(false)
    const [isSelectOther, setSelectOther] = useState(true)
    const [dataModal, setDataModal] = useState({ isVisible: false, dataPhotoBySubCate: [] })
    const [dataImage, setDataImage] = useState({ itemPhoto: [], indexPhoto: 0 })
    const [dataPhotoAll, setDataPhotoAll] = useState({ listPhotoMain: [] })

    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        setDataPhotoAll({ listPhotoMain: listPhotoMain })
        return () => { isMounted = false }
    }, [listPhotoMain])

    const handleChangeQuantity = async (text, it) => {
        let quanity = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        const index = dataSubCate.findIndex(itP => itP.id === it.id)
        dataSubCate[index].quantityFSM = (quanity == null ? null : parseInt(quanity))
        dataSubCate[index].contentTraining = contentSelect.itemSelect?.name || null

        const indexMain = data.dataMain.findIndex(itP => itP.id === itemTab.id)
        data.dataMain[indexMain].listSubCate = JSON.stringify(dataSubCate)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        await setMutate(e => !e)
    }
    const showListSelect = async (it, type) => {
        showList.isShowList = !showList.isShowList
        showList.itemSelect = it
        showList.typeShow = type
        setMutate(e => !e)
        await SheetManager.show('SheetByCate_' + itemTab.id)
    }

    const selectByList = async (it) => {
        const index = dataSubCate.findIndex(itP => itP.id === showList.itemSelect.id)
        if (it.id == 100) {
            showList.itemSelect.contentTraining = null
            dataSubCate[index].contentTraining = null
            await setSelectOther(e => !e)
        } else {
            dataSubCate[index].contentTraining = it.name
            await setMutate(e => !e)
            await setSelectOther(false)
        }

        const indexMain = data.dataMain.findIndex(itP => itP.id === itemTab.id)
        data.dataMain[indexMain].listSubCate = JSON.stringify(dataSubCate)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
    }
    const onChangeNote = async (text) => {
        const index = dataSubCate.findIndex(it => it.id === showList.itemSelect.id)
        dataSubCate[index].contentTraining = ((text !== null && text?.length > 0) ? text : null);
        showList.itemSelect.contentTraining = ((text !== null && text?.length > 0) ? text : null);
        // await updateItemDisplay(item, workinfo)
        const indexMain = data.dataMain.findIndex(itP => itP.id === itemTab.id)
        data.dataMain[indexMain].listSubCate = JSON.stringify(dataSubCate)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        await setMutate(e => !e)
    }
    const selectItem = async (item) => {
        let productSelect = [...JSON.parse(showList.itemSelect?.productList || '[]') || []]
        const indexSubCate = dataSubCate.findIndex(it => it.id === showList.itemSelect.id)
        const indexP = productSelect.findIndex(it => it.id == item.id)
        if (indexP == -1) {
            productSelect.push(item)
            showList.itemSelect.productList = JSON.stringify(productSelect)
            dataSubCate[indexSubCate].productList = JSON.stringify(productSelect)
        } else {
            const filterData = productSelect.filter(it => it.id !== item.id);
            showList.itemSelect.productList = JSON.stringify(filterData)
            dataSubCate[indexSubCate].productList = JSON.stringify(filterData)
        }

        const indexMain = data.dataMain.findIndex(itP => itP.id === itemTab.id)
        data.dataMain[indexMain].listSubCate = JSON.stringify(dataSubCate)
        await saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, data.dataMain)
        await setMutate(e => !e)
    }

    const filterProduct = async (text) => {
        if (text !== null && text.length > 0) {
            const mResult = await dataP.dataProductF.filter((it) => {
                const nameProduct = it.name ? it.name.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return nameProduct.indexOf(textData) > -1
            })
            dataP.dataProduct = mResult;
        } else {
            dataP.dataProduct = dataP.dataProductF;
        }
        setMutate(e => !e)
    }

    const takePhoto = async (it) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'FSM_REPORT_' + itemTab.id + '_' + it.id,
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

    const chosesPhoto = async (it) => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'FSM_REPORT_' + itemTab.id + '_' + it.id,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": UUIDGenerator(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.imageGalleryLaunch(photoinfo, countNumPhoto);
    }

    const handleShowImage = async (itemImage, indexImage) => {
        dataImage.itemPhoto = itemImage
        dataImage.indexPhoto = indexImage
        SheetManager.show('imageSheetModal_' + itemTab.id)
    }
    const handleVisibleImage = async () => {
        await setDataModal({ isVisible: false, dataPhotoBySubCate: [] })
    }

    const handleDeletePhoto = (item) => {
        deletePhoto(item)
        const listFilter = dataPhotoAll.listPhotoMain.filter(it => it.id !== item.id)
        dataPhotoAll.listPhotoMain = listFilter
        listPhoto.listPhotoArr = listFilter
        const listFilterByType = dataPhotoAll.listPhotoMain.filter(it => it.photoType.includes(item.photoType))
        setDataModal({ ...dataModal, dataPhotoBySubCate: listFilterByType })
    }
    const handleShowPhoto = (it, listPhotoSubCat) => {
        setDataModal({ isVisible: true, dataPhotoBySubCate: listPhotoSubCat })
    }

    const RenderItemProduct = ({ item, index }) => {
        const onPressItem = async () => {
            await selectItem(item)
        }
        const indexP = JSON.parse(showList.itemSelect?.productList || '[]')?.findIndex(it => it.id == item.id)
        const keyLayer3 = item[`${item.category}${item.subCategory}${item.segment}`];
        return (
            <View key={'itemProduct_' + item.productId + index} style={{ width: '100%' }}>

                {
                    (keyLayer3 && item.segment) &&
                    <View style={{ flex: 1, padding: 8, marginTop: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: appcolor.info, fontSize: 16, paddingLeft: 8, fontWeight: '600' }}>{item.segment}</Text>
                    </View>
                }
                <TouchableOpacity
                    disabled={isUploaded}
                    key={item.id + item.name + showList.itemSelect?.id}
                    style={{ backgroundColor: indexP == -1 ? appcolor.grayLight : appcolor.primary, flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 1, borderRadius: 8, }}
                    onPress={onPressItem}>
                    <Text style={{ width: '80%', fontSize: scaleSize(15), fontWeight: '500', color: indexP == -1 ? appcolor.dark : appcolor.white }} >{item.name}</Text>
                </TouchableOpacity>
            </View >
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginHorizontal: 10, marginTop: 10 }}>
                {
                    dataSubCate.map((it, idx) => {
                        const listPhotoSubCat = dataPhotoAll.listPhotoMain.filter(itP => itP.photoType == ('FSM_REPORT_' + itemTab.id + '_' + it.id))
                        return (
                            <View key={'itemSubCate_' + idx} style={{ backgroundColor: appcolor.light, borderRadius: 10, marginBottom: 5 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: '600', width: '50%', padding: 8, fontSize: 18, color: appcolor.primary, }}>{it.name}</Text>
                                    <View style={{ height: 40, width: '48%', flexDirection: 'row', padding: 3, justifyContent: 'flex-end' }}>
                                        {
                                            !isUploaded &&
                                            <TouchableOpacity
                                                onPress={() => takePhoto(it)}
                                                style={{ flexDirection: 'row', width: '33%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                <Icon name='camera' color={appcolor.primary} type='ionicon' size={22}></Icon>
                                            </TouchableOpacity>
                                        }
                                        {
                                            !isUploaded &&
                                            <TouchableOpacity
                                                onPress={() => chosesPhoto(it)}
                                                style={{ flexDirection: 'row', width: '33%', padding: 3, marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                                <Icon name='attach-outline' color={appcolor.primary} type='ionicon' size={22}></Icon>
                                            </TouchableOpacity>
                                        }
                                        <TouchableOpacity
                                            onPress={() => handleShowPhoto(it, listPhotoSubCat)}
                                            style={{ flexDirection: 'row', width: '33%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.surface }}>
                                            <View style={{ flex: 1, padding: 3, }}>
                                                <Icon name='images' color={appcolor.primary} type='ionicon' size={20}></Icon>
                                            </View>
                                            <Badge badgeStyle={{ position: 'absolute', bottom: 2, right: 0, }} value={listPhotoSubCat.length} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ paddingHorizontal: 10 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8, paddingHorizontal: 16 }}>{'Nhập số lượng học viên'}</Text>
                                    <NumericFormat
                                        value={it.quantityFSM == 0 ? '0' : (it.quantityFSM || 'SL')}
                                        displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                                        renderText={value =>
                                            <TextInput
                                                value={value}
                                                style={{
                                                    fontSize: 13, padding: 8, width: '100%',
                                                    backgroundColor: appcolor.surface, borderRadius: 5, color: appcolor.dark,
                                                }}
                                                keyboardType='numeric'
                                                placeholder={'SL'}
                                                placeholderTextColor={appcolor.greydark}
                                                editable={!isUploaded}
                                                onChangeText={(text) => handleChangeQuantity(text, it)}
                                            >
                                            </TextInput>
                                        }
                                    />
                                </View>

                                <View key={'SelectProduct_' + idx} style={{ paddingHorizontal: 10 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, padding: 8 }}>Sản phẩm</Text>
                                    <TouchableOpacity onPress={() => showListSelect(it, 'PRODUCT')} style={{
                                        width: '100%', marginBottom: 4, shadowColor: appcolor.black, bottom: 2,
                                        shadowOffset: { width: 0, height: 1 }, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                        shadowOpacity: 0.2, shadowRadius: 5, elevation: 2
                                    }}>
                                        <View style={{ backgroundColor: appcolor.surface, width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35, padding: 3, borderRadius: 4, borderColor: appcolor.grayLight }}>
                                            <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, width: '80%' }}>{JSON.parse(it.productList || '[]')?.length > 0 ? JSON.parse(it.productList || '[]')?.map((it, idx) => { return (idx == 0 ? '' : '\n') + it.name }) : 'Chọn sản phẩm'}</Text>
                                            <Icon type="font-awesome-5" color={appcolor.dark} name={"caret-down"} style={{ paddingHorizontal: 10 }} size={14} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView >
            <Modal
                key={'Modal_' + itemTab.id}
                visible={dataModal.isVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1 }}>
                    <ViewListPhoto listPhoto={dataModal.dataPhotoBySubCate} handleVisible={handleVisibleImage} handleShowImage={handleShowImage} isUploaded={isUploaded} handleDeletePhoto={handleDeletePhoto} />
                </View>
            </Modal>
            <ActionSheet
                id={'SheetByCate_' + itemTab.id}
                keyboardHandlerEnabled={false}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                {
                    showList.typeShow == 'PRODUCT' ?
                        <View key={'sheetByProduct_' + itemTab.id} style={{ backgroundColor: appcolor.surface }}>
                            <FormGroup
                                containerStyle={{
                                    borderColor: appcolor.grayLight, borderWidth: 0.5,
                                    backgroundColor: appcolor.light, padding: 3,
                                    width: '96%', margin: 10
                                }}
                                inputStyle={{ fontSize: 14, color: appcolor.dark }}
                                placeholder='Tìm kiếm sản phẩm' editable
                                iconName='search'
                                onClearTextAndroid={filterProduct}
                                handleChangeForm={filterProduct}
                            />
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ marginHorizontal: 10, marginTop: 10 }}>
                                {
                                    dataP.dataProduct.map((item, index) => {
                                        return (item.categoryId == itemTab.id && item.subCategory == showList.itemSelect.name) ? <RenderItemProduct key={'product_' + item.productId + '_' + index} item={item} index={index} /> : null
                                    })
                                }
                                <View style={{ height: deviceHeight / 3 }} />
                            </ScrollView>
                        </View>
                        :
                        <View key={'CONTENT_' + itemTab.id} style={{ height: deviceHeight / 1.6 }}>
                            <ScrollView nestedScrollEnabled style={{ marginHorizontal: 10, marginTop: 10 }}>
                                {
                                    data.listMaster?.map((itSelect, idxSelect) => {
                                        return (
                                            <TouchableOpacity disabled={isUploaded} key={itSelect.id} onPress={() => selectByList(itSelect)} style={{
                                                width: '100%', marginBottom: 4,
                                            }}>
                                                <View style={{
                                                    backgroundColor: itSelect.name == showList.itemSelect.contentTraining ? appcolor.light : appcolor.surface,
                                                    width: '100%', flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 35,
                                                    padding: 3, borderRadius: 4, borderWidth: 0.5,
                                                    borderColor: (itSelect.name == showList.itemSelect.contentTraining) || (isSelectOther && itSelect.id == 100) ? appcolor.success : appcolor.grayLight
                                                }}>
                                                    <Text style={{ fontSize: 12, fontWeight: '400', color: appcolor.dark, paddingHorizontal: 8 }}>{itSelect.name}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                                {
                                    isSelectOther &&
                                    <FormGroup
                                        key={'noteOther_' + itemTab.id}
                                        iconName={'comment-alt'}
                                        multiline={true} selectTextOnFocus={true}
                                        containerStyle={{
                                            backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3,
                                            marginTop: 4, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5,
                                        }}
                                        inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.grayLight }}
                                        placeholder='Nhập ghi chú...'
                                        editable={true}
                                        onClearTextAndroid={() => onChangeNote('')}
                                        handleChangeForm={(text) => onChangeNote(text)}
                                        defaultValue={showList.itemSelect.contentTraining || ''}
                                    />
                                }
                            </ScrollView>
                        </View>
                }
            </ActionSheet >
        </View >
    )
}
