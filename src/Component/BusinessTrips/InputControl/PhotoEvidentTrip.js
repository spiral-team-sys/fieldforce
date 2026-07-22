import React, { use, useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Modal } from "react-native";
import { Text, Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { TODAY } from "../../../Core/Utility";
import moment from "moment";
import NativeCamera from "../../../Control/NativeCamera";
import { deletePhoto, getDataPhotos } from "../../../Controller/PhotoController";
import { MultipleShowImage } from "../../../Control/MultipleShowImage";
import { URLDEFAULT } from "../../../Core/URLs";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 4;

export const PhotoEvidentTrip = ({ _guid, listPhoto, itemInput, reload, listField, photoType, isLockAdd = false, handlerAddImage }) => {
    const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState)
    const [images, setImages] = useState([]);
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [_mutate, setMutate] = useState(false)
    const [isSystemImage, setIsSystemImage] = useState(false)

    const normalizeSystemPhotos = (data) => {
        if (!data) return []
        let photos = data
        if (typeof data === 'string') {
            try {
                photos = JSON.parse(data)
            } catch {
                photos = []
            }
        }

        return photos.map((item, index) => ({
            photoPath: item.photoPath,
            photo: item.photo || ('/uploaded/' + TODAY + '/' + item.photoPath.substring(item.photoPath.lastIndexOf('/') + 1, item.photoPath?.length)),
            photoDate: TODAY,
            photoType: photoType || 'workingschedule',
            guid: item.guid || _guid,
            isSystem: true
        }))
    }
    const getFileName = (path = '') => {
        if (!path) return ''

        const parts = path.split('/')
        return parts[parts.length - 1]
    }
    const mergeImages = (local = [], system = []) => {
        const map = new Map()
        // ưu tiên local
        local.forEach(img => {
            const key = getFileName(img.photoPath)
            map.set(key, img)
        })
        // chỉ thêm system nếu chưa có
        system.forEach(img => {
            const key = getFileName(img.photoPath)
            if (!map.has(key)) {
                map.set(key, img)
            }
        })
        return Array.from(map.values())
    }

    const loadData = async () => {
        const localPhotos = await getDataPhotos(userinfo.employeeId, TODAY, photoType || 'workingschedule', kpiinfo.id, _guid, false) || []
        const dataPhotoLocal = localPhotos.map(element => {
            let fileName = element.photoPath
            if (!element.photoPath.includes('uploaded')) {
                let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                fileName = '/uploaded/' + (element.photoDate || TODAY) + '/' + ImgName
            }
            return { ...element, photo: fileName }
        })
        const systemPhotos = normalizeSystemPhotos(listPhoto)
        const merged = mergeImages(dataPhotoLocal, systemPhotos)

        if (listPhoto.length == 0 && dataPhotoLocal.length > 0) {
            // !isLockAdd && (itemInput[listField || 'evidence'] = JSON.stringify(merged))
            handlerAddImage && handlerAddImage(merged, 'new')
        }

        setImages(merged)
    }

    useEffect(() => {
        loadData()
    }, [itemInput, reload])

    const addFromCamera = async (type) => {
        const photoinfo = {
            "shopId": userinfo.employeeId,
            "shopCode": userinfo.employeeId,
            "reportId": kpiinfo.id,
            "photoDate": TODAY,
            "photoTime": new Date().getTime(),
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "photoType": photoType || 'WorkingSchedule',
            "shopLat": 0,
            "shopLong": 0,
            "guid": _guid,
            "photoFullTime": moment().format("YYYY-MM-DD HH:mm:ss")
        }
        if (type == 'CAMERA') {
            await NativeCamera.cameraStart(photoinfo, (result) => { actionCallBackResult(photoinfo, result) })
        } else {
            await NativeCamera.imageGalleryLaunch(photoinfo, (result) => { actionCallBackResult(photoinfo, result) })
        }
    };

    const onAddImage = (photo, dataNewPhoto) => {
        let ImgName = dataNewPhoto.photoPath.substring(dataNewPhoto.photoPath.lastIndexOf('/') + 1, dataNewPhoto.photoPath.length);
        let fileName = '/uploaded/' + (dataNewPhoto.photoDate || TODAY) + '/' + ImgName
        handlerAddImage({ ...photo, id: dataNewPhoto.id, photoPath: dataNewPhoto.photoPath, photo: fileName }, 'add')
    }

    const actionCallBackResult = async (photoinfo, result) => {
        if (result.statusId == 200) {
            const dataPhotoLocal = await getDataPhotos(userinfo.employeeId, TODAY, photoType || 'workingschedule', kpiinfo.id, _guid, false)
            const systemPhotos = normalizeSystemPhotos(listPhoto)
            const merged = mergeImages(dataPhotoLocal || [], systemPhotos || [])
            handlerAddImage && onAddImage(photoinfo, result.data[0])
            await handlerChangeImage(merged)
            loadData()
        }
    }
    const handlerShowImage = (index) => {
        itemShowImage.visible = true
        itemShowImage.photos = images
        itemShowImage.index = index
        setMutate(e => !e)
    }
    const handlerCloseShowImage = () => {
        itemShowImage.visible = false
        itemShowImage.photos = []
        itemShowImage.index = 0
        setMutate(e => !e)
    }

    const removeImage = async (item) => {
        const newListImage = images.filter(it => it.photoPath != item.photoPath)
        if (item.id !== undefined) {
            await deletePhoto(item)
        }
        handlerAddImage && await handlerAddImage(item, 'remove')
        await handlerChangeImage(newListImage)
    };

    const handlerChangeImage = (data) => {
        let newListImage = [...data]
        const dataPhotoLocal = newListImage.map(element => {
            let fileName = element.photoPath
            if (!element.photoPath.includes('uploaded')) {
                let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                fileName = '/uploaded/' + (element.photoDate || TODAY) + '/' + ImgName
            }
            return { ...element, photo: fileName }
        })
        setImages(newListImage)
    }

    const renderItem = ({ item, index }) => {
        const imageUrl = item.photoPath !== null ? (item.photoPath?.indexOf('file://') > -1 || item.photoPath?.indexOf('https://') > -1 ? item.photoPath : URLDEFAULT + item.photoPath) : null
        return (
            <TouchableOpacity
                onPress={() => handlerShowImage(index)}
                style={styles.imageWrap}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {
                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeImage(item)}
                    >
                        <Icon type='ionicon' name="trash-bin" color={appcolor.red} size={20} />
                    </TouchableOpacity>
                }
            </TouchableOpacity>
        )
    };

    const styles = StyleSheet.create({
        mainContainer: { padding: 4, },
        container: { flexDirection: "row" },
        btnText: { padding: 4, fontSize: 14, fontWeight: "700", color: appcolor.dark, },
        actionBox: { width: ITEM_WIDTH, height: ITEM_WIDTH, padding: 4, justifyContent: "center", },
        actionBtn: { backgroundColor: appcolor.light, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, padding: 6, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'center', alignItems: "center" },
        actionText: { padding: 4, fontSize: 12, fontWeight: "500", color: appcolor.dark, },
        imageWrap: { width: ITEM_WIDTH, height: ITEM_WIDTH, marginLeft: 10, borderRadius: 8, overflow: "hidden", elevation: 3, backgroundColor: appcolor.light, },
        image: { width: "100%", height: "100%", resizeMode: "cover", },
        removeBtn: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", },
    });

    return (
        <View style={styles.mainContainer}>
            <Text style={styles.btnText}>Hình ảnh</Text>
            <View style={styles.container}>
                {
                    !isSystemImage && <View style={styles.actionBox}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => addFromCamera('CAMERA')}>
                            <Icon name="photo-camera" size={24} color={appcolor.primary} />
                            <Text style={styles.actionText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { marginTop: 12 }]}
                            onPress={() => addFromCamera('GALLERY')}
                        >
                            <Icon name="collections" size={24} color={appcolor.success} />
                            <Text style={styles.actionText}>Thư viện</Text>
                        </TouchableOpacity>
                    </View>
                }
                <FlatList
                    data={images}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 12 }}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                />
            </View>
            <Modal visible={itemShowImage.visible}>
                <MultipleShowImage
                    key='showOrderImage'
                    listItem={itemShowImage.photos || []}
                    closeShowImage={handlerCloseShowImage}
                    indexItem={itemShowImage.index}
                    isViewOnly={true}
                />
            </Modal>
        </View>
    );
}



