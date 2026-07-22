import React, { useEffect, useState } from "react";
import { Alert, Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Image, Text } from "@rneui/base";
import _ from 'lodash';
import { deviceHeight, fontWeightBold } from "../../Themes/AppsStyle";
import { URLDEFAULT } from "../../Core/URLs";
import { MultipleShowImage } from "../../Control/MultipleShowImage";
import { getPhotoReportZalo, updatePhotoReportZalo } from "../../Controller/PhotoController";
import CustomListView from "../../Control/Custom/CustomListView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TOUCH_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 }

export const PhotoGallery = ({ dataMain, data, onHide, config, reloadData, onApplyPhotos }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const insets = useSafeAreaInsets()
    const androidBottomInset = Platform.OS === 'android' ? insets.bottom : 0
    const galleryHeight = deviceHeight - androidBottomInset - (Platform.OS === 'android' ? 8 : 0)
    const [dataPhoto, setDataPhoto] = useState([])
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [isRemoveImage, _setRemoveImage] = useState(false)
    const [_mutate, setMutate] = useState(false)
    //
    const LoadData = async () => {
        const localImage = await getPhotoReportZalo(dataMain.ShopId, kpiinfo.id)
        if (localImage.length > 0) {
            const mergedData = _.unionBy(JSON.parse(localImage[0].jsonPhoto), data, 'PhotoID')
            setDataPhoto(mergedData)
        } else {
            setDataPhoto(data)
        }
    }

    // Handler
    const handlerShowImage = (item, index) => {
        const updatedDataPhoto = dataPhoto.map(item => { return { ...item, photoPath: item.PhotoPath } })
        itemShowImage.visible = true
        itemShowImage.photos = updatedDataPhoto
        itemShowImage.index = index
        setMutate(e => !e)
    }
    const handlerCloseShowImage = () => {
        itemShowImage.visible = false
        itemShowImage.photos = []
        itemShowImage.index = 0
        setMutate(e => !e)
    }
    //    
    const handlerSelectImage = async (id) => {
        const imagesUpdate = dataPhoto.map(photo =>
            photo.PhotoID === id ? { ...photo, isChoose: !photo.isChoose } : photo
        );
        setDataPhoto(imagesUpdate);
        await updatePhotoReportZalo(dataMain.ShopId, kpiinfo.id, imagesUpdate);
    };

    const handlerCancel = async () => {
        const updateData = _.map(dataPhoto, (e) => { return { ...e, isChoose: false } })
        setDataPhoto(updateData)
        await updatePhotoReportZalo(dataMain.ShopId, kpiinfo.id, updateData);
    }
    const handlerSelectAll = async () => {
        const updateData = _.map(dataPhoto, (e) => { return { ...e, isChoose: true } })
        setDataPhoto(updateData)
        await updatePhotoReportZalo(dataMain.ShopId, kpiinfo.id, updateData)
    }
    const onConfirm = async () => {
        const selectedPhotos = dataPhoto.filter(item => item.isChoose)
        if (config !== undefined && config?.ConstrainImage == 1 && selectedPhotos.length < Number(config.Image || 0)) {
            Alert.alert('Thông báo', `Vui lòng chọn tối thiểu ${config.Image} tấm hình`)
        } else {
            await updatePhotoReportZalo(dataMain.ShopId, kpiinfo.id, dataPhoto)
            onApplyPhotos && onApplyPhotos(dataPhoto)
            onHide()
            reloadData(e => !e)
        }
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [data])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: galleryHeight, backgroundColor: appcolor.light },
        header: { alignItems: "center", justifyContent: 'center', minHeight: 48 + (Platform.OS === 'ios' ? insets.top : 0), paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 8, paddingBottom: 8 },
        headerButton: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 8, position: 'absolute', top: 0 },
        headerButtonSafe: { top: Platform.OS === 'ios' ? insets.top : 8 },
        headerButtonLeft: { left: 0 },
        headerButtonRight: { right: 0 },
        headerButtonText: { color: appcolor.primary, fontSize: 14, fontWeight: fontWeightBold },
        titleHeader: { color: appcolor.dark, fontSize: 14, fontWeight: fontWeightBold, textAlign: 'center' },
        itemWrap: { flexDirection: 'row', padding: 4 },
        imageButton: { width: '100%' },
        image: { width: '100%', height: 100, borderRadius: 6, borderColor: appcolor.light, borderWidth: 0.5 },
        selectedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: appcolor.dark, borderRadius: 6, opacity: 0.3 },
        selectButton: { minHeight: 44, minWidth: 44, position: 'absolute', right: 4, top: 4, alignItems: 'flex-end' },
        footerSpace: { paddingBottom: Platform.OS === 'ios' ? 88 : deviceHeight / 10 + androidBottomInset }
    })

    const renderItem = ({ item, index }) => {
        const onPress = () => {
            handlerShowImage(item, index)
        }
        const onSelectImage = () => {
            handlerSelectImage(item.PhotoID, item)
        }
        const photoPath = (item.PhotoPath.indexOf('file://') > -1 || item.PhotoPath.indexOf('https://') > -1 || !item.PhotoPath.includes('uploaded')) ? item.PhotoPath : URLDEFAULT + item.PhotoPath
        return (
            <View key={index} style={styles.itemWrap}>
                <TouchableOpacity activeOpacity={0.7} style={styles.imageButton} onPress={onPress}>
                    <Image
                        source={{ uri: photoPath }}
                        style={styles.image}
                    />
                    {item.isChoose && <View style={styles.selectedOverlay} />}
                    <TouchableOpacity activeOpacity={0.7} hitSlop={TOUCH_HIT_SLOP} onPress={onSelectImage} style={styles.selectButton}>
                        <Icon
                            name={item.isChoose ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            type="material-community"
                            color={item.isChoose ? appcolor.primary : appcolor.light}
                            size={22}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.7} hitSlop={TOUCH_HIT_SLOP} style={[styles.headerButton, styles.headerButtonSafe, styles.headerButtonLeft]} onPress={onConfirm}>
                    <Text style={styles.headerButtonText}>{'Trở về'}</Text>
                </TouchableOpacity>
                <View>
                    {dataPhoto.filter(item => item.isChoose).length > 0 ? <Text style={styles.titleHeader}>{`Đã chọn ${dataPhoto.filter(item => item.isChoose).length} ảnh`}</Text> : <Text style={styles.titleHeader}>{'Hình ảnh'} </Text>}
                </View>
                {dataPhoto.filter(item => item.isChoose).length > 0 ? <TouchableOpacity activeOpacity={0.7} hitSlop={TOUCH_HIT_SLOP} onPress={handlerCancel} style={[styles.headerButton, styles.headerButtonSafe, styles.headerButtonRight]}>
                    <Text style={styles.headerButtonText}>{'Bỏ chọn'}</Text>
                </TouchableOpacity> : <TouchableOpacity activeOpacity={0.7} hitSlop={TOUCH_HIT_SLOP} onPress={handlerSelectAll} style={[styles.headerButton, styles.headerButtonSafe, styles.headerButtonRight]}>
                    <Text style={styles.headerButtonText}>{'Chọn tất cả'}</Text>
                </TouchableOpacity>}
            </View>
            <CustomListView
                numColumns={3}
                data={dataPhoto || []}
                extraData={[isRemoveImage, data]}
                estimatedItemSize={100}
                renderItem={renderItem}
                ListFooter={<View style={styles.footerSpace} />}
                showsVerticalScrollIndicator={false}
            />
            <Modal visible={itemShowImage.visible}>
                <MultipleShowImage
                    key='showdisplayimage'
                    listItem={itemShowImage.photos || []}
                    indexItem={itemShowImage.index}
                    isZaloButton={true}
                    handlerSelectPhoto={handlerSelectImage}
                    closeShowImage={handlerCloseShowImage}

                    dataPhoto={dataPhoto}
                />
            </Modal>
        </View>
    )
}
