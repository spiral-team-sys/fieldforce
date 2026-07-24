import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { FlatList, Image, KeyboardAvoidingView, Platform, TextInput } from "react-native"
import { Modal, Text, TouchableOpacity, View } from "react-native"
import { Icon } from '@rneui/themed'
import { launchImageLibrary } from "react-native-image-picker"

import NumberFormat from "react-number-format"
import { useSelector } from "react-redux"
import FormGroup from "../../Content/FormGroup"
import NativeCamera from "../../Control/NativeCamera"
import { deletePhoto, InsertPhotosItem } from "../../Controller/PhotoController"
import { getPhotosByGuiId } from "../../Controller/WorkController"
import { ToastError, UUIDGenerator } from "../../Core/Helper"
import { deviceHeight, deviceWidth } from "../Home"

export const ItemDecorForm = ({ item, index, template, data, KeyStore }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [templateItem, setTemplateItem] = useState(template)
    const [visibleItem, setVisibleItem] = useState(false)
    const [currentInfo, setCurrentInfo] = useState({ currentItem: {}, currentIndex: 0, currentTemplate: {}, indexTemplate: 0 })
    const [isShowImage, setIsShowImage] = useState(false)
    const [dataImage, setDataImage] = useState({ isShowPhoto: false, listPhoto: [], indexPhoto: 0 })

    const handleTouchAdd = async (itemTemplate, indexTemp) => {
        if (itemTemplate.guiId == undefined || itemTemplate.guiId == null || itemTemplate.guiId == '') {
            const guiId = UUIDGenerator()
            itemTemplate.guiId = guiId
        }
        currentInfo.currentIndex = index
        currentInfo.currentItem = item
        currentInfo.currentTemplate = itemTemplate
        currentInfo.indexTemplate = indexTemp
        await setVisibleItem(e => !e)
    }

    const handleChangeValue = async (newTemplate) => {
        item.template = newTemplate
        await setTemplateItem(JSON.parse(newTemplate))
        await AsyncStorage.setItem(KeyStore, JSON.stringify(data))
    }
    const handleSelectCloseItem = async (itemTemplate, indexTemp) => {
        const newTemplate = [...templateItem].filter((it, idx) => idx !== indexTemp)
        const listPhoto = await getPhotosByGuiId(itemTemplate.guiId, workinfo.shopId)
        listPhoto.forEach(item => {
            deletePhoto(item)
        })
        item.template = JSON.stringify(newTemplate)
        await setTemplateItem(newTemplate)
        await AsyncStorage.setItem(KeyStore, JSON.stringify(data))
    }

    const handleShowImage = async (itemImage, listImage, indexImage) => {
        dataImage.listPhoto = itemImage
        dataImage.indexPhoto = indexImage
        await setIsShowImage(true)
    }
    const handleVisible = async () => {
        await setIsShowImage(e => !e)
    }

    return (
        <View>
            <View style={{}}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: appcolor.dark }}>{item.itemName}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '500', color: appcolor.dark, paddingRight: 30 }}>Kích thước</Text>
                </View>
                <View style={{ justifyContent: 'space-between' }}>
                    {
                        templateItem.map((a, idx) => {
                            return (
                                <View key={'decorSize_' + index + '_' + idx} style={{ width: '100%', alignItems: 'flex-end' }} >

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        {(a.newName?.length > 0 && a.newName !== undefined && a.newName !== null && a.newName !== '') ?
                                            <View style={{ width: '40%' }}><Text style={{ color: appcolor.dark, fontWeight: '600', fontSize: 11 }}>{a.newName}</Text></View>
                                            : <View></View>
                                        }
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            {
                                                idx !== 0 &&
                                                <TouchableOpacity
                                                    onPress={() => handleTouchAdd(a, idx)}
                                                    key={`${idx}poq`} style={{ flexDirection: 'row', padding: 6, marginTop: 3, borderRadius: 10, backgroundColor: appcolor.surface, minWidth: 100 }}>
                                                    {
                                                        (a.key.map((l, idx) => <Text key={`kl${idx}21`} style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>{l} {a?.value[idx] || 0} </Text>))
                                                    }
                                                    <Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark }}>
                                                        {item?.unit}
                                                    </Text>
                                                </TouchableOpacity>
                                            }
                                            <TouchableOpacity onPress={() => idx == 0 ? handleTouchAdd(a, idx) : (a.isUpload == 1 ? null : handleSelectCloseItem(a, idx))}
                                                style={{
                                                    padding: 3, marginHorizontal: 6, marginTop: 3, height: 25, width: idx == 0 ? '60%' : 25, justifyContent: "center", alignItems: 'center',
                                                    borderRadius: 50, backgroundColor: (a.isUpload !== 1 || idx == 0) ? appcolor.surface : appcolor.transparent, flexDirection: 'row'
                                                }}>
                                                {idx == 0 && <Text style={{ fontSize: 11, fontWeight: '500', color: appcolor.dark, paddingHorizontal: 10 }}>Thêm kích thước</Text>}
                                                {
                                                    (a.isUpload !== 1 || idx == 0) &&
                                                    <SpiralIcon size={14} name={idx == 0 ? 'plus' : "times"} type={'font-awesome-5'} color={idx == 0 ? appcolor.success : appcolor.danger} />
                                                }
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
            </View>
            <Modal
                key={'itemDecor_' + index}
                visible={visibleItem}
                animationType="fade"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: isShowImage == true ? appcolor.light : 'rgba(0,0,0,0.2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {
                        isShowImage == true ?
                            <View style={{ flex: 1 }}>
                                <ViewImageSheet dataImage={dataImage} handleVisible={handleVisible} />
                            </View>
                            :
                            <View style={{ flex: 1 }}>
                                <KeyboardAvoidingView
                                    style={{ flexDirection: 'column', justifyContent: 'flex-start' }}
                                    behavior={Platform.OS == "ios" ? "padding" : "padding"}
                                    enabled keyboardVerticalOffset={Platform.OS !== "ios" ? 1 : 50}>
                                    <TouchableOpacity onPress={() => setVisibleItem(e => !e)} style={{ height: deviceHeight / 2.2, width: deviceWidth, }} />
                                    <View style={{ height: deviceHeight / 1.5, width: deviceWidth, backgroundColor: appcolor.light, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 10, }}>
                                        <TouchableOpacity
                                            onPress={() => setVisibleItem(e => !e)}
                                            style={{ height: 30, width: 100, marginTop: 10, borderRadius: 6, borderWidth: 0.8, borderColor: appcolor.danger, justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <Text style={{ fontWeight: '500', fontSize: 14, color: appcolor.danger, textAlign: 'center' }}>Đóng</Text>
                                        </TouchableOpacity>
                                        <AddItem item={item} index={index} closeModal={() => setVisibleItem(e => !e)} itemTemplate={JSON.stringify(currentInfo.currentTemplate)} KeyStore={KeyStore}
                                            indexTemplate={currentInfo.indexTemplate} template={templateItem} handleChangeValue={handleChangeValue} handleShowImage={handleShowImage} />
                                    </View>
                                </KeyboardAvoidingView>
                            </View>
                    }
                </View>
            </Modal >
        </View>
    )

}
const ViewImageSheet = ({ dataImage, handleVisible }) => {
    const [listImage, setListImage] = useState({})
    const appcolor = useSelector(state => state.GAppState.appcolor)

    useEffect(() => {
        loadData()
        return () => false
    }, [])
    const loadData = () => {
        const itemImage = dataImage.listPhoto
        setListImage(itemImage)
    }
    return (
        <View style={{ width: deviceWidth, height: deviceHeight }}>
            <TouchableOpacity
                onPress={() => handleVisible()}
                style={{
                    position: 'absolute', right: 20, top: Platform.OS == 'ios' ? 40 : 20, zIndex: 100, height: 30, width: 100,
                    borderRadius: 6, borderWidth: 0.8, borderColor: appcolor.danger, justifyContent: 'center', alignItems: 'center'
                }}
            >
                <Text style={{ fontWeight: '500', fontSize: 14, color: 'red', textAlign: 'center' }}>Đóng</Text>
            </TouchableOpacity>
            {
                listImage?.photoPath !== undefined &&
                <Image source={{ uri: listImage.photoPath }} resizeMode={'contain'} style={{ width: '100%', height: '100%' }} />
            }
        </View>

    )
}

const AddItem = ({ item, index, itemTemplate, indexTemplate, template, handleChangeValue, handleShowImage, closeModal, KeyStore }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    const [itemValue, setItemValue] = useState({ ...JSON.parse(itemTemplate || {}) })
    const [_, setMutate] = useState(false)
    const onChangeValue = (text, idx) => {
        let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        itemValue.value[idx] = intValue

        setMutate(e => !e)
    }
    const endChangeValue = (e, idx) => {
        let value = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : ''
        let intValue = value === '' ? null : parseInt(value);
        setMutate(e => !e)
    }
    const handleOnChangeName = (text) => {
        itemValue.newName = text
        setMutate(e => !e)
    }
    const handleSelectAdd = async () => {
        const countTemplate = template.length

        if (item.note !== null && (itemValue.newName == null || itemValue.newName == undefined || itemValue.newName == '')) {
            ToastError('Bạn chưa nhập tên!!', 'Thông báo', 'Top')
            return
        }
        for (let idx = 0; idx < itemValue.value?.length; idx++) {
            const it = itemValue.value[idx];
            if (itemValue.key[idx] !== 'Cao') {
                if (it == null) {
                    ToastError('Bạn chưa nhập hết các kích thước!!', 'Thông báo', 'Top')
                    return
                }
                if (item.minSizeLimit > 0 && it < item.minSizeLimit) {
                    ToastError(`Kích thước bạn nhập phải lớn hơn hoặc bằng ${item.minSizeLimit}!!`, 'Thông báo', 'Top')
                    return
                }
                if (item.maxSizeLimit > 0 && it > item.maxSizeLimit) {
                    ToastError(`Kích thước bạn nhập phải nhỏ hơn ${item.maxSizeLimit}!!`, 'Thông báo', 'Top')
                    return
                }
            }
        }

        // if (countTemplate > 1) {
        //     let templateCheck = [...template].filter((it, idx) => idx !== indexTemplate)
        //     for (let idx = 0; idx < templateCheck.length; idx++) {
        //         const it = templateCheck[idx];
        //         let countError = 0
        //         for (let idx2 = 0; idx2 < it?.value?.length; idx2++) {
        //             const it2 = it?.value[idx2];
        //             if (it2 == itemValue.value[idx2]) {
        //                 countError = countError + 1
        //             }
        //         }
        //         if (countError == it?.value?.length) {
        //             ToastError('Kích thước này bạn đã nhập rồi!!', 'Thông báo', 'Top')
        //             return
        //         }
        //     }
        // }
        const listPhoto = await getPhotosByGuiId(itemValue.guiId, workinfo.shopId)
        if (listPhoto.length < item.limitImage) {
            ToastError(`Số lượng hình ảnh phải lớn hơn hoặc bằng ${item.limitImage} tấm !(${listPhoto.length}/${item.limitImage})`, 'Thông báo', 'Top')
            return
        }
        let newTemplate = [...template]
        if (indexTemplate == 0) {
            newTemplate.push({ ...itemValue, isShowAdd: 0 })
        } else {
            newTemplate[indexTemplate] = { ...itemValue, isShowAdd: 0 }
        }
        newTemplate.map((it, idx) => {
            idx == 0 && (it.guiId = null)
            if (indexTemplate == 0 && countTemplate == 1) {
                it.isShowAdd = 0
            } else {
                if (idx == indexTemplate) it.isShowAdd = 0
            }
        })
        handleChangeValue(JSON.stringify(newTemplate))
        closeModal()
    }

    return (
        <View style={{ width: '100%' }} >

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end', marginTop: 6 }}>
                {
                    item.note !== null &&
                    <FormGroup
                        iconName={'pen-fancy'}
                        multiline={true} selectTextOnFocus={true}
                        containerStyle={{ backgroundColor: appcolor.light, width: '100%', minHeight: 30, padding: 3, marginTop: 3, marginBottom: 0, borderColor: appcolor.grayLight, borderWidth: 0.5, }}
                        inputStyle={{ fontSize: 13, color: appcolor.dark, borderColor: appcolor.greydark }}
                        placeholder={item.note}
                        editable
                        onClearTextAndroid={handleOnChangeName}
                        handleChangeForm={handleOnChangeName}
                        defaultValue={itemValue.newName || ''}
                    />
                }
            </View>
            <View style={{ paddingVertical: 5, height: 40, flexDirection: 'row' }}>
                {
                    itemValue.key.map((it, idx) => {
                        return (
                            <View key={`${index}_${indexTemplate}_${idx}`} style={{ flex: 1, padding: 3, flexDirection: 'row', alignItems: 'center' }} >

                                <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '400', paddingRight: 5 }}>{it}</Text>
                                <NumberFormat
                                    value={itemValue?.value[idx] == 0 ? 0 : (itemValue?.value[idx] || '')}
                                    displayType='text'
                                    thousandSeparator={true}
                                    renderText={value =>
                                        <TextInput
                                            textAlign={'center'}
                                            value={value}
                                            style={{
                                                height: 30, fontSize: 13, color: appcolor.dark, fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 5,
                                                borderColor: appcolor.greydark, padding: 5, marginBottom: 2, backgroundColor: appcolor.light, minWidth: 70
                                            }}
                                            selectTextOnFocus
                                            keyboardType='numeric'
                                            placeholder={`(${item.unit})`}
                                            placeholderTextColor={appcolor.greydark}
                                            // editable={item.upload !== 1}
                                            // selectTextOnFocus={item.upload !== 1}
                                            onChangeText={(text) => onChangeValue(text, idx)}
                                            onEndEditing={endChangeValue}
                                        />
                                    }
                                />
                            </View>
                        )
                    })
                }

            </View>
            <View>
                <ViewPhotoDecor key={'ViewInvoicephoto'} guiId={itemValue.guiId} item={itemValue} handleShowImage={handleShowImage} />
            </View>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                    onPress={() => itemValue.isUpload == 1 ? null : handleSelectAdd()}
                    style={{ height: 30, width: 50, borderRadius: 8, backgroundColor: appcolor.info, opacity: itemValue.isUpload == 1 ? 0.5 : 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: appcolor.white, fontWeight: '600', fontSize: 14 }}>{indexTemplate == 0 ? 'Thêm' : 'Sửa'}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}
const ViewPhotoDecor = ({ guiId, item, handleShowImage }) => {
    const { workinfo, kpiinfo, appcolor } = useSelector(state => state.GAppState)
    const [isShowDelete, setShowDelete] = useState(false)
    const [listPhotoItem, setListPhotoItem] = useState()
    const [numDelete, setNumDelete] = useState(0)
    useEffect(() => {
        loadListPhoto()
        return () => false
    }, [])

    const loadListPhoto = async () => {
        const listPhoto = await getPhotosByGuiId(guiId, workinfo.shopId)
        setListPhotoItem(listPhoto || [])
    }

    const RenderItemPhoto = ({ item, index }) => {
        const onLongPressImage = () => {
            item.isDelete = item.isDelete ? false : true;
            (item.photoPath !== null && !isShowDelete) ? setNumDelete(1) : setNumDelete(0)
            if (isShowDelete) {
                listPhotoItem.map(it => {
                    it.isDelete = false
                })
            }
            setShowDelete(e => !e)
        }
        const pressOnShowDelete = () => {
            const count = item.isDelete ? (numDelete - 1) : (numDelete + 1)
            item.isDelete = item.isDelete ? false : true;
            setNumDelete(count)
        }
        return (
            <TouchableOpacity key={index} onLongPress={() => onLongPressImage()}
                onPress={() => isShowDelete ? pressOnShowDelete() : handleShowImage(item, listPhotoItem, index)}
                style={{ width: deviceWidth / 5, height: deviceWidth / 5, backgroundColor: appcolor.light, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}  >
                <Image source={{ uri: item.photoPath }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                {
                    isShowDelete &&
                    <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 12, justifyContent: 'center', alignItems: "center", backgroundColor: appcolor.black, opacity: 0.5 }}>
                        <SpiralIcon
                            color={appcolor.red}
                            name={item.isDelete ? 'check-circle' : 'circle'}
                            type='font-awesome-5'
                            size={40}
                        />
                    </View>
                }
            </TouchableOpacity>
        )
    }

    const deletePhotoSelect = async () => {
        const listSelect = listPhotoItem.filter(it => it.isDelete == true)
        const listPhoto = listPhotoItem.filter(it => it.isDelete !== true)
        // listSelect.map(it => dele)
        await deletePhotoByList(listSelect)
        await setListPhotoItem(listPhoto)
        await setShowDelete(e => !e)

    }
    const takePhoto = async () => {

        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": "DECOR_IMAGE",
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "guid": guiId,
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        }
        await NativeCamera.cameraStart(photoinfo, loadListPhoto);
    };

    const uploadFilePhoto = async () => {
        let photoinfo = {};
        let options = {
            mediaType: 'photo', quality: 1, includeBase64: true, selectionLimit: 10
        };
        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                let { assets } = await response || []
                if (assets !== undefined) {
                    await assets?.forEach(async res => {
                        const newImageUrl = await NativeCamera.resizeImage(await res.uri)
                        let timePhotoInsert = await new Date().getTime() + (Math.floor(Math.random() * 112) + 1)
                        photoinfo = {
                            shopId: workinfo.shopId,
                            shopCode: workinfo.shopCode,
                            reportId: kpiinfo.kpiId,
                            photoPath: newImageUrl?.uri || res.uri,
                            photoDate: workinfo.workDate,
                            photoType: "DECOR_IMAGE",
                            photoTime: timePhotoInsert,
                            fileUpload: 0,
                            dataUpload: 0,
                            guid: guiId,
                            photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                        }

                        await InsertPhotosItem(photoinfo);
                        await loadListPhoto()
                    });
                }
            }
        });
    }

    return (
        <View style={{ width: '100%' }}>
            <View style={{ width: '100%', }} >
                {
                    item.isUpload !== 1 &&
                    <View style={{ padding: 3, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>

                        <View style={{ width: '50%', flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => takePhoto()}
                                style={{ flexDirection: 'row', minHeight: 30, width: '40%', marginRight: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.grayLight }}>
                                <View style={{}}>
                                    <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => uploadFilePhoto()}
                                style={{ flexDirection: 'row', minHeight: 30, width: '40%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: appcolor.grayLight }}>

                                <View style={{ flex: 1 }}>
                                    <SpiralIcon name='attach' color={appcolor.primary} type='ionicon' size={22}></SpiralIcon>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {
                            isShowDelete &&
                            <TouchableOpacity style={{ width: '30%', justifyContent: 'flex-end', alignItems: 'flex-end' }} onPress={() => deletePhotoSelect()}>
                                <SpiralIcon iconStyle={{ color: appcolor.red }} style={{}} size={30} name={'trash'} type='ionicon' />
                            </TouchableOpacity>
                        }
                    </View>
                }
                <FlatList
                    horizontal
                    key={'listPhoto'}
                    keyExtractor={(_, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    data={listPhotoItem}
                    renderItem={({ item, index }) => <RenderItemPhoto item={item} index={index} />}
                />
            </View>
        </View>
    )
}


