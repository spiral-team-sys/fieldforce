import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";
import { Button, Icon, Image } from "@rneui/base";
import NativeCamera from "../../../../../Control/NativeCamera";
import { getDataPhotoByGUID } from "../../../../../Controller/ReportController";
import { alertConfirm, optionConfirm, TODAY } from "../../../../../Core/Utility";
import ViewPictures from "../../../../../Control/Gallary/ViewPictures";
import { deletePhotoByList } from "../../../../../Controller/PhotoController";
import moment from "moment";

const ItemCapture = ({ dataRegister }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [dataPhoto, setDataPhoto] = useState([])
    const [viewPhoto, setViewPhoto] = useState({ visible: false, data: [], index: 0 })
    const [modeView, setModeView] = useState({ mode: null, data: [] })

    const LoadData = async () => {
        await getDataPhotoByGUID(kpiinfo.id, shopinfo.shopId, dataRegister.GuidRegister, setDataPhoto)
    }
    const handlerActionButton = () => {
        if (modeView.mode === 'delete' && modeView.data.length > 0) {
            onDeletePictures()
        } else {
            dataRegister.isAllowGallery ? (
                optionConfirm('Chọn hình ảnh', 'Bạn muốn chụp mới hay chọn từ thư viện?', [
                    { text: 'Chụp mới', onPress: onCapturePicture },
                    { text: 'Thư viện', onPress: onSelectFromGallery },
                    { text: 'Hủy', style: 'cancel' }
                ])
            ) :
                onCapturePicture()
        }
    }
    const handlerCaptureResult = async (result) => {
        if (result.statusId == 200) {
            await LoadData()
        }
    }
    const onCapturePicture = async () => {
        const photoInfo = {
            "shopId": shopinfo.shopId,
            "shopCode": shopinfo.shopCode || '',
            "reportId": kpiinfo.id,
            "photoDate": TODAY,
            "photoTime": new Date().getTime(),
            "photoType": `POLICY_PROGRAM_${dataRegister.ProgramId}`,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "guid": dataRegister.GuidRegister,
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.cameraStart(photoInfo, handlerCaptureResult)
    }
    const onSelectFromGallery = async () => {
        const photoInfo = {
            "shopId": shopinfo.shopId,
            "shopCode": shopinfo.shopCode || '',
            "reportId": kpiinfo.id,
            "photoDate": TODAY,
            "photoTime": new Date().getTime(),
            "photoType": `POLICY_PROGRAM_${dataRegister.ProgramId}`,
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "guid": dataRegister.GuidRegister,
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.imageGalleryLaunch(photoInfo, handlerCaptureResult)
    }
    const onShowPicture = (item, index) => {
        if (modeView.mode === 'delete' && modeView.data.length > 0) {
            onChoosePicture(item)
        } else {
            setViewPhoto({
                visible: true,
                data: dataPhoto,
                index: index
            })
        }
    }
    const onClosePicture = () => {
        setViewPhoto({
            visible: false,
            data: [],
            index: 0
        })
    }
    const onChoosePicture = (item) => {
        const newData = dataPhoto.map(it => {
            if (it.id === item.id) {
                it.isSelected = !it.isSelected
            }
            return it
        })
        setModeView({ mode: 'delete', data: newData.filter(i => i.isSelected) })
        setDataPhoto(newData)
    }
    const onDeletePictures = async () => {
        alertConfirm('Xác nhận', `Bạn có chắc chắn muốn xóa ${modeView.data.length} hình đã chọn không?`, async () => {
            await deletePhotoByList(modeView.data)
            await LoadData()
            setModeView({ mode: null, data: [] })
        }, () => {
            LoadData()
        })
    }

    useEffect(() => {
        LoadData()
    }, [dataRegister])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', minHeight: 80, backgroundColor: appcolor.light, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
        buttonContainer: { width: 64, height: 64, borderRadius: 64, overflow: 'hidden' },
        buttonUpload: { width: 64, height: 64, borderRadius: 64, borderWidth: 1, borderColor: appcolor.primary, padding: 4 },
        titleButtonUpload: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.primary },
        itemContainer: { width: 64, height: 64, borderRadius: 64, backgroundColor: appcolor.surface, overflow: 'hidden' },
        imageStyle: { width: 64, height: 64 },
        overlayContainer: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.black, opacity: 0.8, zIndex: 1000 },
        deleteContainer: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.black, opacity: 0.8, zIndex: 1000 },
    })
    const renderItem = ({ item, index }) => {
        const onPress = () => onShowPicture(item, index)
        const onLongPress = () => onChoosePicture(item)
        return (
            <TouchableOpacity
                key={`${item?.id || item?.photoPath || 'photo'}_${index}`}
                style={styles.itemContainer}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                {item.isSelected &&
                    <View style={styles.deleteContainer}>
                        <Icon name='trash' type='ionicon' size={20} color={appcolor.red} />
                    </View>
                }
                <Image
                    source={{ uri: item.photoPath }}
                    style={styles.imageStyle}
                    resizeMethod="scale"
                    resizeMode="cover"
                />
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <Button
                type="outline"
                icon={<Icon type="ionicon" name={modeView.mode === 'delete' ? 'trash' : 'camera'} size={24} color={modeView.mode === 'delete' ? appcolor.red : appcolor.primary} />}
                containerStyle={styles.buttonContainer}
                buttonStyle={[styles.buttonUpload, { borderColor: modeView.mode === 'delete' ? appcolor.red : appcolor.primary }]}
                titleStyle={styles.titleButtonUpload}
                onPress={handlerActionButton}
            />
            {dataPhoto.map((item, index) => renderItem({ item, index }))}
            <ViewPictures
                visible={viewPhoto.visible}
                images={viewPhoto.data}
                initialIndex={viewPhoto.index}
                onSwipeDown={onClosePicture}
            />
        </View>
    )
}

export default ItemCapture;
