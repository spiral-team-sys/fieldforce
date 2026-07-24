import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraFormat,
  useFrameProcessor,
  VisionCameraProxy,
  runAtTargetFps,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useIsFocused } from '@react-navigation/native';
import { Icon, Text } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { useSelector } from 'react-redux';
import { resizeImage } from '../../Core/Helper';
import LoadingDefault from '../ItemLoading/LoadingDefault';

import { AI } from '../../API/AI';
import { alertWarning, imageSize } from '../../Core/Utility';
import { VALID_LOCATION } from '../../Content/Attendance/utils/validLocation';
import { deviceWidth } from '../../Themes/AppsStyle';
import { LOCATION_INFO } from '../../Utils/LocationInfo';
import { CountTimeAutoTake } from '../CountTimeAutoTake';
import FaceScanFrame, { FACE_OVAL } from './FaceScanFrame';
import { toastError, toastInfo } from '../../Utils/configToast';

// const faceDetectorPlugin = VisionCameraProxy.initFrameProcessorPlugin('detectFaces', {
//     performanceMode: 'fast',
//     landmarkMode: 'all',
//     contourMode: 'none',
//     classificationMode: 'all',
//     minFaceSize: 0.15,
//     trackingEnabled: false,
// });

const faceDetectorPlugin = null;

const CameraAction = forwardRef((props, _ref) => {
  const { isResetCamera, onClose, cameraConfig, onPreview, onAutoSave } = props;
  const { appcolor, shopinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [waitingPhoto, setWaitingPhoto] = useState(false);
  const [faceVerifyStatus, setFaceVerifyStatus] = useState('idle'); // 'idle' | 'verifying' | 'verified' | 'failed'
  const faceVerifyStatusRef = useRef('idle');
  const verifyingStartRef = useRef(null);
  const autoCaptureFiredRef = useRef(false);
  const verifyTimeRef = useRef(null);
  const photoPathRef = useRef(null);
  const isFaceVerifyEnabled = cameraConfig?.isFaceVerify === true;
  const [flash, setFlash] = useState('off');
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const frontCameraId = devices.findIndex(
    device => device.position === 'front',
  );
  const backCameraId = devices.findIndex(device => device.position === 'back');
  const [cameraPosition, setCameraPosition] = useState(frontCameraId);
  const device = devices[cameraPosition];
  const format = useCameraFormat(device, [
    { photoResolution: { width: imageSize.width, height: imageSize.height } },
  ]);
  const [count, setCount] = useState(0);
  const [countDistance, setCountDistance] = useState(0);
  const [message, setMessage] = useState('');
  const [isCheckingDistance, setIsCheckingDistance] = useState(true);
  const isFaceDetectEnabled = cameraConfig?.isFaceDetect === true;
  const [faceCount, setFaceCount] = useState(0);
  const faceCountRef = useRef(0);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const blinkPhaseRef = useRef('idle'); // 'idle' | 'open' | 'closed' | 'verified'
  const [inlineMessage, setInlineMessage] = useState({
    text: '',
    type: 'info',
  });
  const inlineMsgTimerRef = useRef(null);
  const locationInfoRef = useRef(null);
  //
  const showMessage = useCallback((text, type = 'info') => {
    if (inlineMsgTimerRef.current) clearTimeout(inlineMsgTimerRef.current);
    setInlineMessage({ text, type });
    inlineMsgTimerRef.current = setTimeout(
      () => setInlineMessage({ text: '', type: 'info' }),
      3500,
    );
  }, []);
  const updateFaceData = useMemo(
    () =>
      Worklets.createRunOnJS((count, avgEyeOpen) => {
        faceCountRef.current = count;
        setFaceCount(prev => (prev === count ? prev : count));
        const needsFaceDetect = isFaceDetectEnabled || isFaceVerifyEnabled;
        if (!needsFaceDetect || count !== 1) {
          if (count !== 1) {
            blinkPhaseRef.current = 'idle';
            setLivenessVerified(false);
            if (isFaceVerifyEnabled) {
              faceVerifyStatusRef.current = 'idle';
              setFaceVerifyStatus('idle');
            }
          }
          return;
        }
        // Step 2 (blink/liveness) only starts after Step 1 (identity verify) passes
        const canRunBlink =
          isFaceDetectEnabled ||
          (isFaceVerifyEnabled && faceVerifyStatusRef.current === 'verified');
        if (!canRunBlink) return;
        if (blinkPhaseRef.current === 'verified') return;
        const phase = blinkPhaseRef.current;
        if ((phase === 'idle' || phase === 'open') && avgEyeOpen >= 0) {
          if (avgEyeOpen > 0.7) {
            blinkPhaseRef.current = 'open';
          } else if (avgEyeOpen < 0.25 && phase === 'open') {
            blinkPhaseRef.current = 'closed';
          }
        } else if (phase === 'closed' && avgEyeOpen >= 0 && avgEyeOpen > 0.7) {
          blinkPhaseRef.current = 'verified';
          setLivenessVerified(true);
        }
      }),
    [isFaceDetectEnabled, isFaceVerifyEnabled],
  );
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (faceDetectorPlugin == null) {
        return;
      }
      runAtTargetFps(5, () => {
        'worklet';
        try {
          const faces = faceDetectorPlugin.call(frame);
          const validFaces = Array.isArray(faces)
            ? faces.filter(f => f?.hasRequiredFeatures === true)
            : [];
          const count = validFaces.length;
          const first = count === 1 ? validFaces[0] : null;
          const avgEyeOpen = first
            ? ((first.leftEyeOpenProbability ?? -1) +
                (first.rightEyeOpenProbability ?? -1)) /
              2
            : -1;
          updateFaceData(count, avgEyeOpen);
        } catch (e) {
          updateFaceData(0, -1);
        }
      });
    },
    [updateFaceData],
  );
  //
  const onCameraError = useCallback(_error => {}, []);
  // AutoSave
  const handlerCapture = async () => {
    if (
      isFaceDetectEnabled &&
      !isFaceVerifyEnabled &&
      (faceCount !== 1 || !livenessVerified)
    ) {
      showMessage(
        faceCount === 0
          ? 'Không phát hiện khuôn mặt. Vui lòng đưa khuôn mặt vào khung hình.'
          : faceCount > 1
          ? 'Phát hiện nhiều hơn một khuôn mặt. Vui lòng chỉ để một người trong khung hình.'
          : 'Vui lòng nháy mắt để xác nhận khuôn mặt thật.',
      );
      return;
    }
    if (isFaceVerifyEnabled) {
      if (faceCount !== 1) {
        showMessage(
          'Không phát hiện khuôn mặt. Vui lòng đưa khuôn mặt vào khung hình.',
        );
        return;
      }
      if (faceVerifyStatus !== 'verified') {
        showMessage(
          'Bước 1/3: Vui lòng chờ hệ thống xác minh danh tính hoàn tất.',
        );
        return;
      }
      if (!livenessVerified) {
        showMessage('Bước 2/3: Vui lòng nháy mắt để xác nhận khuôn mặt thật.');
        return;
      }
    }
    await setWaitingPhoto(true);
    if (isFaceDetectEnabled) {
      const faceStable = await new Promise(resolve => {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 500;
          if (faceCountRef.current !== 1) {
            clearInterval(interval);
            resolve(false);
            return;
          }
          if (elapsed >= 1000) {
            clearInterval(interval);
            resolve(true);
          }
        }, 500);
      });
      if (!faceStable) {
        setWaitingPhoto(false);
        alertWarning(
          'Vui lòng giữ nguyên khuôn mặt trong khung hình trong khi chụp ảnh. Hệ thống cần thời gian để xác nhận khuôn mặt ổn định trước khi chụp. Vui lòng thử lại.',
        );
        return;
      }
    }
    //
    if (isFaceVerifyEnabled) {
      if (cameraConfig.isAutoCapture) {
        let countdown = cameraConfig.autoCaptureTime;
        const interval = setInterval(async () => {
          setCount(countdown);
          if (countdown == 0) {
            AutoTakePhoto();
            clearInterval(interval);
          }
          countdown -= 1;
        }, 1000);
      } else {
        AutoTakePhoto();
      }
    } else {
      if (cameraConfig.isAutoCapture) {
        let countdown = cameraConfig.autoCaptureTime;
        const interval = setInterval(async () => {
          setCount(countdown);
          if (countdown == 0) {
            takePhoto();
            clearInterval(interval);
          }
          countdown -= 1;
        }, 1000);
      } else {
        takePhoto();
      }
    }
  };
  const AutoTakePhoto = async () => {
    try {
      if (!cameraRef.current || !device) {
        showMessage('Máy ảnh không hoạt động, vui lòng kiểm tra thiết bị.');
        setWaitingPhoto(false);
        return;
      }
      //
      await onAutoSave?.(photoPathRef.current, verifyTimeRef.current, true);
    } catch (error) {
      showMessage(`Không thể chụp ảnh. Vui lòng thử lại sau (${error})`);
    } finally {
      setWaitingPhoto(false);
    }
  };
  // DefaultSave
  const takePhoto = async () => {
    try {
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
      const imageResult = await resizeImage(
        photo.path,
        photo,
        cameraPosition == frontCameraId,
      );
      if (imageResult) {
        await RNFS.unlink(photo.path);
        cameraRef.current.pausePreview?.();
        onPreview(imageResult);
      } else {
        toastError(
          'Thông báo',
          'Lỗi tạo hình ảnh trên thiết bị. Vui lòng thử lại.',
        );
      }
    } catch (error) {
      toastInfo(
        'Thông báo',
        `Không thể chụp ảnh. Vui lòng thử lại sau (${error})`,
      );
    } finally {
      setWaitingPhoto(false);
    }
  };
  //
  const toggleCamera = async () => {
    const positionValue =
      cameraPosition == backCameraId ? frontCameraId : backCameraId;
    if (positionValue == frontCameraId) setFlash('off');
    blinkPhaseRef.current = 'idle';
    setLivenessVerified(false);
    faceVerifyStatusRef.current = 'idle';
    setFaceVerifyStatus('idle');
    setCameraPosition(positionValue);
  };
  const toggleFlash = () => {
    if (device?.hasTorch) {
      setFlash(prev => (prev === 'off' ? 'on' : 'off'));
    } else {
      showMessage('Máy ảnh không hỗ trợ đèn flash.');
    }
  };
  // #region FaceVerifyStatus log
  useEffect(() => {
    if (faceVerifyStatus == null) {
      faceVerifyStatusRef.current = 'idle';
      verifyingStartRef.current = null;
      setFaceVerifyStatus('idle');
      return;
    }
  }, [faceVerifyStatus]);
  // #region Auto-capture sau khi quét khuôn mặt thành công
  useEffect(() => {
    if (isCheckingDistance || waitingPhoto) return;
    if ((cameraConfig?.timeAutoTake || 0) > 0) return;
    const isVerifySuccess =
      isFaceVerifyEnabled &&
      faceVerifyStatus === 'verified' &&
      livenessVerified;
    const isDetectSuccess =
      isFaceDetectEnabled &&
      !isFaceVerifyEnabled &&
      faceCount === 1 &&
      livenessVerified;
    if ((isVerifySuccess || isDetectSuccess) && !autoCaptureFiredRef.current) {
      autoCaptureFiredRef.current = true;
      if (verifyTimeRef.current && photoPathRef.current) {
        setWaitingPhoto(true);
        (async () => {
          try {
            await onAutoSave?.(
              photoPathRef.current,
              verifyTimeRef.current,
              true,
            );
          } catch (e) {
            alertWarning(`Lỗi khi lưu ảnh: ${e?.message || e}`);
          } finally {
            setWaitingPhoto(false);
          }
        })();
      } else {
        handlerCapture();
      }
      return;
    }
    // Reset cờ khi điều kiện không còn thỏa (khuôn mặt rời khỏi khung hoặc verify reset)
    if (
      !livenessVerified ||
      (isFaceVerifyEnabled && faceVerifyStatus !== 'verified')
    ) {
      autoCaptureFiredRef.current = false;
      verifyTimeRef.current = null;
    }
  }, [
    faceVerifyStatus,
    livenessVerified,
    faceCount,
    waitingPhoto,
    isCheckingDistance,
  ]);
  // #region Realtime Face Verify
  useEffect(() => {
    if (!isFaceVerifyEnabled || isCheckingDistance) return;
    const interval = setInterval(async () => {
      // Normalize null/undefined ref tránh treo luồng
      if (faceVerifyStatusRef.current == null) {
        faceVerifyStatusRef.current = 'idle';
        verifyingStartRef.current = null;
        setFaceVerifyStatus('idle');
      }
      // Recover nếu bị treo ở 'verifying' quá 15 giây
      if (
        faceVerifyStatusRef.current === 'verifying' &&
        verifyingStartRef.current != null &&
        Date.now() - verifyingStartRef.current > 15000
      ) {
        faceVerifyStatusRef.current = 'idle';
        verifyingStartRef.current = null;
        setFaceVerifyStatus('idle');
      }
      // Step 1: only run if face is present, not already verifying/verified
      if (
        faceCountRef.current !== 1 ||
        faceVerifyStatusRef.current === 'verifying' ||
        faceVerifyStatusRef.current === 'verified' ||
        !cameraRef.current
      )
        return;
      faceVerifyStatusRef.current = 'verifying';
      verifyingStartRef.current = Date.now();
      setFaceVerifyStatus('verifying');
      try {
        const photo = await cameraRef.current.takePhoto({
          photoCodec: 'jpeg',
          qualityPrioritization: 'speed',
          format: format,
        });
        const imageResult = await resizeImage(
          photo.path,
          photo,
          cameraPosition == frontCameraId,
        );
        if (!imageResult) {
          showMessage('Lỗi tạo hình ảnh trên thiết bị. Vui lòng thử lại.');
          return;
        }
        const info = {
          shopName: shopinfo?.shopName || '',
          shopCode: shopinfo?.shopCode || '',
          shopAddress: shopinfo?.address || '',
          latitude: locationInfoRef.current?.latitude || '',
          longitude: locationInfoRef.current?.longitude || '',
        };
        const result = await AI.compareFaces(
          imageResult,
          userinfo?.employeeId,
          info,
        );
        RNFS.unlink(imageResult).catch(() => {});
        const nextStatus = result?.success === true ? 'verified' : 'failed';
        faceVerifyStatusRef.current = nextStatus;
        verifyingStartRef.current = null;
        setFaceVerifyStatus(nextStatus);
        if (result?.success) {
          showMessage('Xác minh danh tính thành công!', 'info');
          verifyTimeRef.current = result.verifyTime ?? null;
          photoPathRef.current = imageResult;
        } else {
          showMessage(
            `${result?.message || 'Khuôn mặt không khớp, đang thử lại...'}`,
            'error',
          );
          blinkPhaseRef.current = 'idle';
          setLivenessVerified(false);
          setTimeout(() => {
            if (faceVerifyStatusRef.current === 'failed') {
              faceVerifyStatusRef.current = 'idle';
              setFaceVerifyStatus('idle');
            }
          }, 2000);
        }
      } catch (_e) {
        faceVerifyStatusRef.current = 'idle';
        verifyingStartRef.current = null;
        setFaceVerifyStatus('idle');
        setLivenessVerified(false);
        showMessage('Lỗi kết nối khi xác minh. Vui lòng thử lại.', 'error');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isFaceVerifyEnabled, isCheckingDistance, userinfo?.photo]);
  // #region Valid Location
  const handlerMessage = message => {
    setMessage(message);
  };
  const handlerGoback = () => {
    onClose && onClose('');
  };
  useEffect(() => {
    let seconds = 0;
    let isCancelled = false;
    let isChecked = false;
    setCountDistance(0);
    const interval = setInterval(() => {
      if (isCancelled) return;

      seconds += 1;
      setCountDistance(seconds);

      if (seconds < 2) return;

      clearInterval(interval);
      if (isChecked) return;
      isChecked = true;
      setIsCheckingDistance(true);

      LOCATION_INFO.getCurrentLocation(async locationinfo => {
        if (isCancelled) return;
        //
        locationInfoRef.current = locationinfo;
        //
        await VALID_LOCATION.checkDistance(
          shopinfo,
          locationinfo,
          6,
          handlerMessage,
          handlerGoback,
        );
        if (!isCancelled) {
          setIsCheckingDistance(false);
          // Reset face state so verification re-runs fresh after location is confirmed
          blinkPhaseRef.current = 'idle';
          setLivenessVerified(false);
          faceVerifyStatusRef.current = 'idle';
          setFaceVerifyStatus('idle');
        }
      });
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [shopinfo?.shopId]);

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
    if (isResetCamera && cameraRef.current) {
      cameraRef.current.stopRecording?.();
      cameraRef.current = null;
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stopRecording?.();
        cameraRef.current = null;
      }
    };
  }, [isResetCamera, isFocused]);
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
    verifyingOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
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
    textCount: { fontSize: 120, color: appcolor.white },
    countdown: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    messageContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 150,
      width: deviceWidth / 1.2,
    },
    textMessage: { color: appcolor.white, fontSize: 16 },
    faceHint: {
      position: 'absolute',
      top: FACE_OVAL.bottom + 14,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.60)',
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
    },
    faceHintText: {
      color: appcolor.white,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    captureDisabled: { opacity: 0.4 },
    inlineMsg: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: 130,
      maxWidth: deviceWidth * 0.85,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    inlineMsgError: { backgroundColor: 'rgba(180,0,0,0.82)' },
    inlineMsgInfo: { backgroundColor: 'rgba(0,0,0,0.68)' },
    inlineMsgText: { color: appcolor.white, fontSize: 14, textAlign: 'center' },
  });
  if (device == null)
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
      {(isFocused || waitingPhoto) && (
        <Camera
          ref={cameraRef}
          isActive={isFocused || waitingPhoto}
          device={device}
          isMirrored={false}
          torch={flash}
          outputOrientation="preview"
          photo={true}
          audio={false}
          video={false}
          style={StyleSheet.absoluteFill}
          onError={onCameraError}
          frameProcessor={
            (isFaceDetectEnabled || isFaceVerifyEnabled) && !isCheckingDistance
              ? frameProcessor
              : undefined
          }
        />
      )}
      {(isFaceDetectEnabled || isFaceVerifyEnabled) && !isCheckingDistance && (
        <FaceScanFrame
          verifyStatus={isFaceVerifyEnabled ? faceVerifyStatus : 'idle'}
          livenessVerified={livenessVerified}
          faceCount={faceCount}
        />
      )}
      {count > 0 && (
        <View style={styles.countdown}>
          <Text style={styles.textCount}>{count}</Text>
        </View>
      )}
      {(isFaceDetectEnabled || isFaceVerifyEnabled) &&
        message == '' &&
        !isCheckingDistance && (
          <View style={styles.faceHint}>
            <Text style={styles.faceHintText}>
              {faceCount === 0
                ? 'Đưa khuôn mặt vào khung hình'
                : faceCount > 1
                ? `Phát hiện ${faceCount} khuôn mặt — chỉ để 1 người`
                : isFaceVerifyEnabled
                ? faceVerifyStatus !== 'verified'
                  ? faceVerifyStatus === 'verifying'
                    ? '🔍 Bước 1/3: Đang xác minh danh tính...'
                    : faceVerifyStatus === 'failed'
                    ? '✗ Bước 1/3: Không nhận ra, đang thử lại...'
                    : '⏳ Bước 1/3: Đang phân tích khuôn mặt...'
                  : !livenessVerified
                  ? '👁 Bước 2/3: nháy mắt để xác nhận'
                  : '✓ Bước 2/3: Xác nhận xong — Đang chụp ảnh...'
                : !livenessVerified
                ? 'Hãy nháy mắt để xác nhận'
                : '✓ Xác nhận khuôn mặt thành công'}
            </Text>
          </View>
        )}
      <View style={styles.actionButtonMain}>
        <View style={styles.actionButtonItem}>
          {cameraConfig?.isFlipCamera && (
            <TouchableOpacity
              style={styles.actionChangeCamera}
              disabled={waitingPhoto}
              onPress={toggleCamera}
            >
              <View style={styles.opacityView} />
              <SpiralIcon
                type="ionicon"
                name="sync"
                color={appcolor.white}
                size={32}
              />
            </TouchableOpacity>
          )}
        </View>

        {waitingPhoto && (
          <ActivityIndicator
            size="small"
            color={appcolor.white}
            style={styles.waitingView}
          />
        )}
        {message == '' && (
          <View style={styles.actionButtonItem}>
            {(cameraConfig?.timeAutoTake || 0) > 0 ? (
              <CountTimeAutoTake
                cameraConfig={cameraConfig || {}}
                time={cameraConfig?.timeAutoTake || 0}
                actionResult={handlerCapture}
                disabled={
                  waitingPhoto ||
                  isCheckingDistance ||
                  (isFaceDetectEnabled &&
                    !isFaceVerifyEnabled &&
                    (faceCount !== 1 || !livenessVerified)) ||
                  (isFaceVerifyEnabled &&
                    (faceVerifyStatus !== 'verified' || !livenessVerified))
                }
              />
            ) : (
              !isFaceDetectEnabled && (
                <TouchableOpacity
                  style={[
                    styles.actionCapture,
                    (isCheckingDistance ||
                      (isFaceDetectEnabled &&
                        !isFaceVerifyEnabled &&
                        (faceCount !== 1 || !livenessVerified)) ||
                      (isFaceVerifyEnabled &&
                        (faceVerifyStatus !== 'verified' ||
                          !livenessVerified))) &&
                      styles.captureDisabled,
                  ]}
                  disabled={
                    waitingPhoto ||
                    isCheckingDistance ||
                    (isFaceDetectEnabled &&
                      !isFaceVerifyEnabled &&
                      (faceCount !== 1 || !livenessVerified)) ||
                    (isFaceVerifyEnabled &&
                      (faceVerifyStatus !== 'verified' || !livenessVerified))
                  }
                  onPress={handlerCapture}
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
              )
            )}
          </View>
        )}
        <View style={styles.actionButtonItem}>
          {cameraPosition === backCameraId && device?.hasTorch && (
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
        {(isCheckingDistance || message !== '') && (
          <View style={styles.messageContainer}>
            <LoadingDefault
              isLoading={true}
              color={appcolor.white}
              title={message !== '' ? message : 'Đang xác định vị trí...'}
              colorTitle={appcolor.white}
            />
          </View>
        )}
      </View>
      {inlineMessage.text !== '' && (
        <View
          style={[
            styles.inlineMsg,
            inlineMessage.type === 'error'
              ? styles.inlineMsgError
              : styles.inlineMsgInfo,
          ]}
        >
          <Text style={styles.inlineMsgText}>{inlineMessage.text}</Text>
        </View>
      )}
    </View>
  );
});

export default CameraAction;
