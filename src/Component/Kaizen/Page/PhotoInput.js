import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Modal } from "react-native";
import { Text, Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { TODAY } from "../../../Core/Utility";
import moment from "moment";
import NativeCamera from "../../../Control/NativeCamera";
import { deletePhoto, getDataPhotos } from "../../../Controller/PhotoController";
import { MultipleShowImage } from "../../../Control/MultipleShowImage";
import { URLDEFAULT } from "../../../Core/URLs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 4;

export const PhotoInput = ({ _guid, listPhoto, itemInput, reload }) => {
    const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState)
    const [images, setImages] = useState([]);
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [_mutate, setMutate] = useState(false)
    const [isSystemImage, setIsSystemImage] = useState(false)

    const loadData = async () => {
        if (listPhoto?.length > 0) {
            await setImages(listPhoto)
            await setIsSystemImage(true)
        } else {
            await getDataPhotos(userinfo.employeeId, TODAY, null, kpiinfo.id, _guid, false, setImages)
        }
    }
    useEffect(() => {
        loadData()
    }, [itemInput, reload])

    const addFromCamera = async (type) => {
        const photoinfo = {
            "shopId": userinfo.employeeId,
            "shopCode": userinfo.employeeCode,
            "reportId": kpiinfo.id,
            "photoDate": TODAY,
            "photoTime": new Date().getTime(),
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
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

    const actionCallBackResult = (photoinfo, result) => {
        if (result.statusId == 200) {
            const KeyStore = `KAIZEN_INPUTIDEA`
            AsyncStorage.setItem(KeyStore, JSON.stringify(itemInput));
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
        const newListImage = images.filter(it => it.id != item.id)
        await deletePhoto(item)
        await setImages(newListImage)
    };

    const renderItem = ({ item, index }) => {
        const imageUrl = item.isImageSystem == 1 ? URLDEFAULT + item.photoPath : item.photoPath
        return (
            <TouchableOpacity
                onPress={() => handlerShowImage(index)}
                style={styles.imageWrap}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {
                    item.isImageSystem !== 1 &&
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



