import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { Icon, Text } from '@rneui/themed';
import { toastError, toastInfo } from '../../Utils/configToast';
import RNFS from 'react-native-fs';
import { resizeImage } from '../../Core/Helper';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { imageSize, insets } from '../../Core/Utility';
import { useSelector } from 'react-redux';
import CustomListView from '../Custom/CustomListView';
import LoadingDefault from '../ItemLoading/LoadingDefault';
import _ from 'lodash';

const CameraReportAction = forwardRef((props, _ref) => {
  const { onPreview, onClose } = props;
  const { appcolor } = useSelector(state => state.GAppState);
  const isFocused = useIsFocused();
  const [flash, setFlash] = useState('off');
  const [waitingPhoto, setWaitingPhoto] = useState(false);
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { photoResolution: { width: imageSize.width, height: imageSize.height } },
  ]);
  // Multiple
  const [listCamera, setListCamera] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(device);
  //
  const onCameraError = useCallback(error => {
    console.log(`Máy ảnh gặp lỗi. Vui lòng kiểm tra thiết bị.: ${error}`);
  }, []);
  //
  const takePicture = async () => {
    try {
      setWaitingPhoto(true);
      if (!cameraRef.current || !device) {
        toastInfo(
          'Thông báo',
          'Máy ảnh không hoạt động, vui lòng kiểm tra thiết bị.',
        );
        setWaitingPhoto(false);
        return;
      }
      const photo = await cameraRef.current.takePhoto({
        photoCodec: 'jpeg',
        qualityPrioritization: 'speed',
        format: format,
      });
      const imageResult = await resizeImage(photo.path, photo);
      if (imageResult) {
        await RNFS.unlink(photo.path);
        cameraRef.current.pausePreview?.();
        onPreview(imageResult);
      } else {
        toastError(
          'Thông báo',
          'Lỗi tạo hình ảnh trên thiết bị, Vui lòng đóng máy ảnh sau đó thử lại',
        );
      }
    } catch (error) {
      console.log(error);
      toastInfo('Thông báo', 'Không thể chụp ảnh. Vui lòng thử lại.');
    } finally {
      setWaitingPhoto(false);
    }
  };
  const toggleFlash = () => {
    if (device?.hasTorch) {
      setFlash(prev => (prev === 'off' ? 'on' : 'off'));
    } else {
      toastInfo('Thông báo', 'Máy ảnh không hỗ trợ đèn flash.');
    }
  };
  //
  useEffect(() => {
    const fetchCameras = async () => {
      const availableCameras = await Camera.getAvailableCameraDevices().filter(
        e => e.position == 'back' && !e.isMultiCam,
      );
      setListCamera(availableCameras);
    };
    fetchCameras();
  }, []);

  useEffect(() => {
    let countdown = 0;
    const interval = setInterval(() => {
      if (device || countdown >= 10) {
        clearInterval(interval);
        if (!device) {
          onClose &&
            onClose('Máy ảnh không khởi động. Vui lòng kiểm tra thiết bị.');
        }
      }
      countdown += 1;
    }, 1000);
    return () => clearInterval(interval);
  }, [device, onClose]);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stopRecording?.();
        cameraRef.current = null;
      }
    };
  }, [isFocused]);
  //
  const styles = StyleSheet.create({
    cameraContainer: { flex: 1 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.light,
    },
    waitingView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonMain: {
      width: '100%',
      flexDirection: 'row',
      position: 'absolute',
      bottom: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonItem: { width: '33%', alignItems: 'center' },
    actionCapture: {
      borderWidth: 3,
      borderRadius: 54,
      borderColor: appcolor.white,
      alignSelf: 'center',
    },
    actionFlash: { padding: 8, borderRadius: 32 },
    actionChangeCamera: { padding: 8, borderRadius: 32 },
    opacityView: {
      backgroundColor: appcolor.dark,
      opacity: 0.4,
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
    },
    actionChangeWide: {
      padding: 8,
      borderRadius: 32,
      top: 14,
      end: 14,
      position: 'absolute',
      backgroundColor: appcolor.light,
    },
    contentCameras: {
      position: 'absolute',
      top: insets().top,
      end: 8,
      zIndex: 20,
    },
    titleCamera: {
      fontSize: 14,
      margin: 8,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    itemMainCamera: {
      width: 48,
      height: 48,
      marginBottom: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listDeviceCamera: { width: 50, marginTop: 8 },
  });
  const renderItemCamera = ({ item, index }) => {
    const onPress = () => {
      setSelectedCamera(item);
    };
    return (
      <TouchableOpacity
        key={index}
        style={styles.itemMainCamera}
        onPress={onPress}
      >
        <View
          style={{
            ...styles.opacityView,
            backgroundColor: appcolor.white,
            opacity: 0.6,
          }}
        />
        <Text style={styles.titleCamera}>C.{index + 1}</Text>
      </TouchableOpacity>
    );
  };
  if (!device)
    return (
      <View style={styles.loadingContainer}>
        <LoadingDefault
          isLoading={true}
          color={appcolor.primary}
          title="Đang khởi động máy ảnh"
        />
      </View>
    );
  return (
    <View style={styles.cameraContainer}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          isActive={isFocused}
          device={selectedCamera}
          torch={flash}
          outputOrientation="preview"
          photo={true}
          audio={false}
          video={false}
          enableZoomGesture
          style={StyleSheet.absoluteFill}
          onError={onCameraError}
        />
      )}
      <View style={styles.contentCameras}>
        <View style={styles.listDeviceCamera}>
          <CustomListView
            data={listCamera}
            extraData={[listCamera]}
            renderItem={renderItemCamera}
          />
        </View>
      </View>
      <View style={styles.actionButtonMain}>
        <View style={styles.actionButtonItem} />
        <View style={styles.actionButtonItem}>
          <TouchableOpacity
            style={styles.actionCapture}
            disabled={waitingPhoto}
            onPress={takePicture}
          >
            <View style={styles.opacityView} />
            <SpiralIcon
              type="ionicon"
              name="ellipse"
              color={appcolor.white}
              size={54}
            />
            {waitingPhoto && (
              <ActivityIndicator
                size="small"
                color={appcolor.greydark}
                style={styles.waitingView}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtonItem}>
          {device?.hasTorch && (
            <TouchableOpacity
              style={styles.actionFlash}
              disabled={waitingPhoto}
              onPress={toggleFlash}
            >
              <View style={styles.opacityView} />
              <SpiralIcon
                type="ionicon"
                name={flash === 'on' ? 'flash' : 'flash-off'}
                color={appcolor.white}
                size={32}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});
export default CameraReportAction;
