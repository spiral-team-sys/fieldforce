import React, { useEffect, useRef, useState } from 'react';
import { TODAY } from '../../../Core/Utility';
import CameraAction from '../CameraAction';
import { useSelector } from 'react-redux';
import { ATTENDANT_API } from '../../../API/AttendantAPI';
import { DeviceEventEmitter } from 'react-native';
import { InsertPhotosItem } from '../../../Controller/PhotoController';
import { toastError } from '../../../Utils/configToast';
import PreviewAction from '../PreviewAction';
import moment from 'moment';

const CameraPage = ({ callBackData }) => {
    const { shopinfo, workinfo } = useSelector(state => state.GAppState)
    const { cameraInfo } = useSelector(state => state.camera)
    const { locationInfo } = useSelector(state => state.location)
    const [isLoading, setLoading] = useState(false)
    const [photoUri, setPhotoUri] = useState(null);
    const [isResetCamera] = useState(false)
    const isSavingRef = useRef(false)
    // Handler
    const handlerSavePhoto = async (uri, time = null, isFaceVerify = false) => {
        if (isSavingRef.current) {
            return
        }
        isSavingRef.current = true
        await setLoading(true)
        try {
            const photoName = uri.substring(uri.lastIndexOf('/') + 1, uri.length);
            const photoinfo = {
                shopId: shopinfo.shopId,
                shopCode: shopinfo.shopCode,
                shopLat: shopinfo.latitude,
                shopLong: shopinfo.longitude,
                photoDate: TODAY,
                photoType: `${cameraInfo.photoType}`,
                photoTime: time ? moment(time, 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDDHHmmss') : moment().format('YYYYMMDDHHmmss'),
                photoFullTime: time ? time : moment().format('YYYY/MM/DD HH:mm:ss'),
                photoPath: isFaceVerify ? `/uploaded/${TODAY}/${photoName}` : uri,
                reportId: cameraInfo.reportId,
                guid: cameraInfo.guid,
                latitude: locationInfo.latitude,
                longitude: locationInfo.longitude,
                accuracy: locationInfo.accuracy,
                photoDesc: cameraInfo.photoDesc,
                fileUpload: 0,
                dataUpload: 0,
                workStatus: workinfo.workStatus,
                dataLocation: JSON.stringify(locationInfo)
            }
            await InsertPhotosItem(photoinfo);
            if (isFaceVerify) {
                await ATTENDANT_API.UploadDataAttendance(photoinfo, () => {
                    DeviceEventEmitter.emit('RELOAD_ATTENDANCE', photoinfo)
                    callBackData(cameraInfo.photoType)
                }, (title, message) => {
                    toastError(title, message)
                })
            } else {
                const result = await ATTENDANT_API.UploadAttendance(photoinfo, 'TAKE')
                if (result) {
                    DeviceEventEmitter.emit('RELOAD_ATTENDANCE', photoinfo)
                    callBackData(cameraInfo.photoType)
                }
            }
        } catch (e) {
            toastError('Lỗi khi lưu ảnh', `${e?.message || e}`)
        } finally {
            await setLoading(false)
            isSavingRef.current = false
        }
    }
    const handlerCloseCamera = (message) => {
        message && toastError('Thông báo', message)
        callBackData(null)
    }
    // Preview
    const handlerPreviewPicture = (uri) => {
        setPhotoUri(uri)
    }
    const handlerReject = () => {
        setPhotoUri(null)
    }
    //
    useEffect(() => {
        return () => false
    }, [])
    // View
    if (photoUri) {
        return <PreviewAction
            isLoading={isLoading}
            photoUri={photoUri}
            onSuccess={handlerSavePhoto}
            onReject={handlerReject}
        />
    }
    return <CameraAction
        cameraConfig={JSON.parse(shopinfo.cameraConfig || '{}')}
        resetCamera={isResetCamera}
        onClose={handlerCloseCamera}
        onPreview={handlerPreviewPicture}
        onAutoSave={handlerSavePhoto}
    />
};

export default CameraPage;
