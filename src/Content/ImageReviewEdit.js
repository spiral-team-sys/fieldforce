import React from "react";
import { View, SafeAreaView } from 'react-native'
import { useSelector } from "react-redux";
import { Message, ToastError, ToastSuccess, UUIDGenerator } from "../Core/Helper";
import { UpdatePhotosEditItem } from "../Controller/PhotoController";
import { DrawWithOptions } from "@archireport/react-native-svg-draw";
import LinearGradient from 'react-native-linear-gradient';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
;
import { URLDEFAULT } from "../Core/URLs";

export const ImageReviewEdit = gestureHandlerRootHOC(({ itemPhoto, onClose, loadData }) => {
    const { appcolor } = useSelector((state) => state.GAppState)
    const onSaveImage = async (success) => {
        if (success) {
            Message('Chú ý', 'Sau khi lưu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
                let itemUpload = {
                    ...itemPhoto,
                    photoPath: await success,
                    guid: UUIDGenerator()
                }
                await UpdatePhotosEditItem(itemUpload)
                await loadData()
                await onClose()
                await ToastSuccess('Đã lưu chỉnh sửa')
            });
        } else {
            ToastError('Xảy ra lỗi khi lưu!', 'Lỗi')
            onClose()
        }
    }
    return (
        <SafeAreaView style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.black }}>
            <View style={{ width: '100%', height: '100%' }}>
                <DrawWithOptions
                    close={() => onClose()}
                    takeSnapshot={(uri) => onSaveImage(uri)}
                    linearGradient={LinearGradient}
                    image={{ uri: itemPhoto.photoPath !== null && (itemPhoto.photoPath.indexOf('file://') > -1 || itemPhoto.photoPath.indexOf('https://') > -1 ? itemPhoto.photoPath : URLDEFAULT + itemPhoto.photoPath) }}
                />
            </View>
        </SafeAreaView>
    );
});


// https://trainee.spiral.com.vn/rpByLoginID/?AppShare=base64