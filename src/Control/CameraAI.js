import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { RNCamera } from 'react-native-camera';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { ACTION } from '../Redux/types';;

const CameraAI = React.forwardRef((props, ref) => {
    const [box, setBox] = useState(null);
    const photo = props.route.params || {}
    const { appcolor } = useSelector(state => state.GAppState)
    const cameraRef = useRef();
    const [count, setCount] = useState(60)
    const dispatch = useDispatch()
    const [fileOption, setFileOption] = useState(props.fileOption || {
        quality: 0.7,
        base64: true
    })
    const [camOption, setCamOption] = useState(props.camOption || {
        type: RNCamera.Constants.Type.front,
        flashMode: RNCamera.Constants.FlashMode.auto,
        zoom: 0.0
    })
    const handlerFace = ({ faces }) => {
        if (faces[0]) {
            const fistFaceId = faces[0]
            setBox({
                boxs: {
                    width: fistFaceId.bounds.size.width,
                    height: fistFaceId.bounds.size.height,
                    x: fistFaceId.bounds.origin.x,
                    y: fistFaceId.bounds.origin.y,
                    yawAngle: fistFaceId.yawAngle,
                    rollAngle: fistFaceId.rollAngle,
                },
                rightEyePosition: fistFaceId.rightEyePosition,
                leftEyePosition: fistFaceId.leftEyePosition,
                bottomMounthPosition: fistFaceId.bottomMounthPosition,
            });
        } else {
            setBox(null);
        }
    };
    const handledBarCode = ({ barcodes }) => {

    }
    const handlerTextReg = (textReg => {
        console.log(textReg)
    })
    const takePicture = async () => {
        if (cameraRef) {
            const data = await cameraRef.current.takePictureAsync(fileOption);
            const fileinfo = { ...photo, ...data }
            dispatch({ type: ACTION.SET_FILEINFO, fileinfo })
            props.navigation.navigate("reviewphoto")
        }
    };
    const cameraSwitch = () => {
        const _cam = { ...camOption }
        _cam.type = _cam.type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back
        setCamOption(_cam)
    }
    const onZoom = (value) => {
        const _zoom = { ...camOption }
        const vZoom = isNaN(_zoom.zoom) ? 0 : parseFloat(_zoom.zoom)
        // console.log(vZoom)
        if ((vZoom === 1.0 && value > 0.0) || (vZoom === 0.0 && value < 0.0))
            return
        else {
            _zoom.zoom = vZoom + value;
            setCamOption(_zoom)
        }
    }
    const onFlashMode = (mode) => {
        const _flashMode = { ...camOption }
        _flashMode.flashMode = mode
        setCamOption(_flashMode)
    }
    useEffect(() => {
        const interval = setTimeout(() => {
            if (count !== 0)
                setCount(count - 1)
            else {
                props.navigation.goBack()
            }
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [count])
    return (
        <View style={styles.container}>
            <RNCamera
                ref={cameraRef}
                style={styles.preview}
                type={camOption.type}
                autoFocus=""
                zoom={camOption.zoom}
                flashMode={camOption.flashMode}
                androidCameraPermissionOptions={{
                    title: 'Cho phép truy cập máy ảnh',
                    message: 'Bạn cần cho phép ứng dụng quyền truy cập máy ảnh',
                    buttonPositive: 'Đồng ý',
                    buttonNegative: 'Từ chối',
                }}
                androidRecordAudioPermissionOptions={{
                    title: 'Cho phép truy cập microphone',
                    message: 'Ứng dụng cần bạn cho phép truy cập microphone',
                    buttonPositive: 'Đồng ý',
                    buttonNegative: 'Từ chối',
                }}
                onFacesDetected={camOption.useFace ? handlerFace : null}
                faceDetectionLandmarks={camOption.useFace ? RNCamera.Constants.FaceDetection.Landmarks.all : RNCamera.Constants.FaceDetection.Landmarks.none}
                onTextRecognized={camOption.useText ? handlerTextReg : null}
                onGoogleVisionBarcodesDetected={camOption.useBarcode ? handledBarCode : null}
            />
            {
                camOption.zoom !== 0 &&
                <Text style={{ fontWeight: '500', textAlign: 'center', fontSize: 14, color: appcolor.danger, opacity: .8, position: 'absolute', top: 100, width: '100%' }}>
                    Đang phóng to {camOption.zoom < 0 ? 0 : parseInt(camOption.zoom * 10)}x
                </Text>
            }
            <Text style={{
                position: 'absolute', top: 50, width: '100%', textAlign: 'center',
                color: appcolor.warning, fontWeight: '600', fontSize: 50
            }}>{count}s</Text>
            {box && (
                <>
                    <Image
                        source={require('./../Themes/Images/thunglife.png')}
                        style={styles.glasses({
                            rightEyePosition: box.rightEyePosition,
                            leftEyePosition: box.leftEyePosition,
                            yawAngle: box.yawAngle,
                            rollAngle: box.rollAngle,
                        })}
                    />
                    <View
                        style={styles.bound({
                            width: box.boxs.width,
                            height: box.boxs.height,
                            x: box.boxs.x,
                            y: box.boxs.y,
                        })}
                    />
                </>
            )}
            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => SheetManager.show('settings')}
                    style={{
                        backgroundColor: appcolor.transparent, borderRadius: 5, padding: 7,
                        paddingHorizontal: 12, alignSelf: 'center', margin: 12, flexGrow: 1
                    }}>
                    <Icon size={33} color={appcolor.primary} name='settings' />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePicture} style={{
                    backgroundColor: appcolor.transparent, borderRadius: 5, padding: 7,
                    paddingHorizontal: 12, alignSelf: 'center', margin: 12, flexGrow: 1
                }}>
                    <Icon size={46} color={appcolor.primary} name='camera' />
                </TouchableOpacity>
                <TouchableOpacity onPress={cameraSwitch}
                    style={{
                        backgroundColor: appcolor.transparent, borderRadius: 5, padding: 7,
                        paddingHorizontal: 12, alignSelf: 'center', margin: 12, flexGrow: 1
                    }}>
                    <Icon size={33} color={appcolor.primary} name='flip-camera-ios' />
                </TouchableOpacity>
            </View>
            <ActionSheet id='settings'>
                <View style={{ margin: 7 }}>
                    <Text style={{ color: appcolor.dark }}>Đèn flash</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => onFlashMode(RNCamera.Constants.FlashMode.auto)}
                            style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }}>
                            <Icon name='flash-auto'
                                color={camOption.flashMode ===
                                    RNCamera.Constants.FlashMode.auto ? appcolor.primary : appcolor.dark
                                } />
                            <Text style={{ color: appcolor.dark }}>Tự động</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onFlashMode(RNCamera.Constants.FlashMode.off)}
                            style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }}>
                            <Icon name='flash-off'
                                color={camOption.flashMode ===
                                    RNCamera.Constants.FlashMode.off ? appcolor.primary : appcolor.dark
                                }
                            />
                            <Text style={{ color: appcolor.dark }}>Tắt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onFlashMode(RNCamera.Constants.FlashMode.on)}
                            style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }}>
                            <Icon name='flash-on' color={camOption.flashMode ===
                                RNCamera.Constants.FlashMode.on ? appcolor.primary : appcolor.dark
                            }
                            />
                            <Text style={{ color: appcolor.dark }}>Bật</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ color: appcolor.dark }}>Phóng to/thu nhỏ</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }} onPress={() => setCamOption({ ...camOption, zoom: 0.0 })}>
                            <Icon name='autorenew' color={camOption.zoom !== 0 ? appcolor.primary : appcolor.dark} />
                            <Text style={{ color: appcolor.dark }}>Mặc định</Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={camOption.zoom === 1.0 ? true : false}
                            style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }} onPress={() => onZoom(0.1)}>
                            <Icon name='zoom-in' />
                            <Text style={{ color: appcolor.dark }}>Phóng to</Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={camOption.zoom === 0.0 ? true : false}
                            style={{ alignItems: 'center', padding: 7, marginHorizontal: 7, flexGrow: 1 }} onPress={() => onZoom(-0.1)}>
                            <Icon name='zoom-out' />
                            <Text style={{ color: appcolor.dark }}>Thu nhỏ</Text>
                        </TouchableOpacity>


                    </View>
                </View>
            </ActionSheet>
        </View>
    );
})
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    bound: ({ width, height, x, y }) => {
        return {
            position: 'absolute',
            top: y,
            left: x,
            height,
            width,
            borderWidth: 5,
            borderColor: 'red',
            zIndex: 3000,
        };
    },
    glasses: ({ rightEyePosition, leftEyePosition, yawAngle, rollAngle }) => {
        return {
            position: 'absolute',
            top: rightEyePosition.y - 60,
            left: rightEyePosition.x - 50,
            resizeMode: 'contain',
            width: Math.abs(leftEyePosition.x - rightEyePosition.x) + 100,
        };
    },
});
export default CameraAI;