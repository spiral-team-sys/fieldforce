import React, { useEffect, useState } from "react";
import { View, FlatList, Pressable, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { TODAY } from "../../../Core/Utility";
import moment from "moment";
import NativeCamera from "../../../Control/NativeCamera";
import { deletePhoto, getDataPhotos } from "../../../Controller/PhotoController";
import { URLDEFAULT } from "../../../Core/URLs";
import ViewPictures from "../../../Control/Gallary/ViewPictures";

const PHOTO_SIZE = 96;

export const PhotoInput = ({ _guid, listPhoto = [], enableTakePhoto, reload, shopId, shopCode, photoType, photoDate, handlerAddImage }) => {
    const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState)
    const [images, setImages] = useState([]);
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [_mutate, setMutate] = useState(false)
    const [loadingAction, setLoadingAction] = useState('')
    const currentPhotoDate = photoDate || TODAY

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
            photo: item.photo || ('/uploaded/' + (item.photoDate || currentPhotoDate) + '/' + item.photoPath.substring(item.photoPath.lastIndexOf('/') + 1, item.photoPath?.length)),
            photoDate: item.photoDate || currentPhotoDate,
            photoType: photoType || kpiinfo.id.toString(),
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
        try {
            const localPhotos = await getDataPhotos(shopId || userinfo.employeeId, currentPhotoDate, photoType || kpiinfo.id.toString(), kpiinfo.id, _guid, false) || [];

            const dataPhotoLocal = localPhotos.map(element => {
                let fileName = element.photoPath;
                if (element.photoPath && !element.photoPath.includes('uploaded')) {
                    let ImgName = element.photoPath.substring(
                        element.photoPath.lastIndexOf('/') + 1,
                        element.photoPath.length
                    );
                    fileName = '/uploaded/' + (element.photoDate || currentPhotoDate) + '/' + ImgName;
                }
                return { ...element, photo: fileName };
            });

            const systemPhotos = normalizeSystemPhotos(listPhoto || []);
            const merged = mergeImages(dataPhotoLocal, systemPhotos);

            if ((!listPhoto || listPhoto.length === 0) && dataPhotoLocal.length > 0) {
                handlerAddImage && handlerAddImage(merged);
            }

            setImages(merged);
        } catch (error) {
            console.log("loadData PhotoInput error", error);
            setImages([]);
        }
    };

    useEffect(() => {
        setImages([]); // reset trước để tránh hiện ảnh item cũ
        loadData();
    }, [_guid, reload, currentPhotoDate, JSON.stringify(listPhoto)]);

    const addFromCamera = async (type) => {
        if (loadingAction) return

        const photoinfo = {
            "shopId": shopId || userinfo.employeeId,
            "shopCode": shopCode || userinfo.employeeId,
            "reportId": kpiinfo.id,
            "photoDate": currentPhotoDate,
            "photoTime": new Date().getTime(),
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "photoType": photoType || kpiinfo.id.toString(),
            "shopLat": 0,
            "shopLong": 0,
            "guid": _guid,
            "photoFullTime": moment().format("YYYY-MM-DD HH:mm:ss")
        }
        try {
            setLoadingAction(type)
            if (type == 'CAMERA') {
                await NativeCamera.cameraStart(photoinfo, (result) => { actionCallBackResult(photoinfo, result) })
            } else {
                await NativeCamera.imageGalleryLaunch(photoinfo, (result) => { actionCallBackResult(photoinfo, result) })
            }
        } finally {
            setLoadingAction('')
        }
    };

    const onAddImage = (merged) => {
        const newDataPhoto = merged.map(element => {
            let fileName = element.photoPath
            if (!element.photoPath.includes('uploaded')) {
                let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                fileName = '/uploaded/' + (element.photoDate || currentPhotoDate) + '/' + ImgName
            }
            return { ...element, photo: fileName }
        })
        return newDataPhoto
    }

    const actionCallBackResult = async (photoinfo, result) => {
        if (result.statusId == 200) {
            const dataPhotoLocal = await getDataPhotos(shopId || userinfo.employeeId, currentPhotoDate, photoType || kpiinfo.id.toString(), kpiinfo.id, _guid, false)
            const systemPhotos = normalizeSystemPhotos(listPhoto)
            const merged = mergeImages(dataPhotoLocal || [], systemPhotos || [])
            const newDataPhoto = onAddImage(merged)
            handlerAddImage && handlerAddImage(newDataPhoto)
            setImages(newDataPhoto)
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
        handlerAddImage && await handlerAddImage(newListImage)
        await setImages(newListImage)
    };

    const renderItem = ({ item, index }) => {
        const photoPath = item.photoPath || item.photo || '';
        const imageUrl =
            photoPath.startsWith('file://') || photoPath.startsWith('https://')
                ? photoPath
                : `${URLDEFAULT}${photoPath}`;
        return (
            <Pressable
                onPress={() => handlerShowImage(index)}
                style={({ pressed }) => [styles.imageWrap, pressed && styles.pressed]}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {
                    enableTakePhoto &&
                    <Pressable
                        hitSlop={8}
                        style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
                        onPress={() => removeImage(item)}
                    >
                        <View style={styles.removeIcon}>
                            <Icon type='ionicon' name="trash-outline" color={appcolor.danger} size={18} />
                        </View>
                    </Pressable>
                }
            </Pressable>
        )
    };

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', gap: 16, padding: 8, backgroundColor: appcolor.surface, borderRadius: 16, borderCurve: 'continuous' },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
        titleGroup: { flex: 1 },
        title: { fontSize: 16, lineHeight: 22, fontWeight: "700", color: appcolor.dark },
        description: { fontSize: 12, lineHeight: 16, fontWeight: "500", color: appcolor.placeholderText },
        countBadge: { minWidth: 44, height: 28, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.light, borderRadius: 9999 },
        countText: { fontSize: 12, lineHeight: 16, fontWeight: "700", color: appcolor.primary },
        actionBox: { flexDirection: 'row', gap: 12 },
        actionBtn: { flex: 1, minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'center', alignItems: "center", gap: 8, backgroundColor: appcolor.light, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1, borderColor: appcolor.grayLight },
        actionBtnDisabled: { opacity: 0.5 },
        actionText: { fontSize: 14, lineHeight: 18, fontWeight: "600", color: appcolor.dark },
        galleryContent: { gap: 12, paddingRight: 4 },
        imageWrap: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 16, borderCurve: 'continuous', overflow: "hidden", backgroundColor: appcolor.light, borderWidth: 1, borderColor: appcolor.grayLight },
        image: { width: "100%", height: "100%", resizeMode: "cover" },
        pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
        removeBtn: { position: "absolute", top: 0, right: 0, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
        removeBtnPressed: { opacity: 0.7, transform: [{ scale: 0.92 }] },
        removeIcon: { width: 32, height: 32, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.light },
        emptyState: { minHeight: PHOTO_SIZE, padding: 16, gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.light, borderRadius: 16, borderCurve: 'continuous', borderWidth: 1, borderStyle: 'dashed', borderColor: appcolor.grayLight },
        emptyTitle: { fontSize: 14, lineHeight: 18, fontWeight: "600", color: appcolor.dark },
        emptyDescription: { fontSize: 12, lineHeight: 16, fontWeight: "500", color: appcolor.placeholderText, textAlign: 'center' },
    });
    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    <Text style={styles.title}>Hình ảnh</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{images.length}</Text>
                </View>
            </View>
            {
                enableTakePhoto && (
                    <View style={styles.actionBox}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Chụp ảnh"
                            accessibilityState={{ disabled: Boolean(loadingAction), busy: loadingAction === 'CAMERA' }}
                            activeOpacity={0.7}
                            disabled={Boolean(loadingAction)}
                            style={[
                                styles.actionBtn,
                                Boolean(loadingAction) && styles.actionBtnDisabled
                            ]}
                            onPress={() => addFromCamera('CAMERA')}>
                            {loadingAction === 'CAMERA'
                                ? <ActivityIndicator size="small" color={appcolor.primary} />
                                : <Icon name="photo-camera" size={22} color={appcolor.primary} />}
                            <Text style={styles.actionText}>Chụp ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Chọn ảnh từ thư viện"
                            accessibilityState={{ disabled: Boolean(loadingAction), busy: loadingAction === 'GALLERY' }}
                            activeOpacity={0.7}
                            disabled={Boolean(loadingAction)}
                            style={[
                                styles.actionBtn,
                                Boolean(loadingAction) && styles.actionBtnDisabled
                            ]}
                            onPress={() => addFromCamera('GALLERY')}>
                            {loadingAction === 'GALLERY'
                                ? <ActivityIndicator size="small" color={appcolor.success} />
                                : <Icon name="collections" size={22} color={appcolor.success} />}
                            <Text style={styles.actionText}>Thư viện</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            {images.length > 0 ? (
                <FlatList
                    data={images}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryContent}
                    keyExtractor={(item, index) =>
                        `${item.photoPath || item.photo || "img"}_${index}`
                    }
                    renderItem={renderItem}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Icon type="ionicon" name="images-outline" size={28} color={appcolor.placeholderText} />
                    <Text style={styles.emptyTitle}>Chưa có hình ảnh</Text>
                    <Text style={styles.emptyDescription}>
                        {enableTakePhoto
                            ? 'Chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện.'
                            : 'Chưa có ảnh được cung cấp cho nội dung này.'}
                    </Text>
                </View>
            )}
            <ViewPictures
                visible={itemShowImage.visible}
                images={itemShowImage.photos || []}
                initialIndex={itemShowImage.index}
                onSwipeDown={handlerCloseShowImage}
            />
        </View>
    );
}
