import React, { useEffect, useState } from 'react'
import { View, Platform, TouchableOpacity, Text } from "react-native"
import { WebView } from 'react-native-webview'
import { Icon } from '@rneui/themed';
import { Message, deviceSize } from '../Core/Helper';
import { useSelector } from 'react-redux';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { scaleSize } from '../Themes/AppsStyle';
import webloading from '../Themes/lotties/webviewload.json'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0, maximum-scale=0, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `


const WebViewUI = ({ urlPage, onClose, pageName }) => {
    const [httpError, setError] = useState(200)
    const [loading, setLoading] = useState(false)
    const appcolor = useSelector(state => state.GAppState.appcolor)

    const ExistPage = () => {
        Message("Thông báo", "Bạn muốn thoát khỏi trang này?", () => {
            onClose();
        })
    }
    useEffect(() => {

    }, [urlPage])
    const errorPage = (e) => {
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <LottieView autoPlay style={{ height: '100%' }} source={require('../Themes/lotties/error_page.json')} />
                <View style={{ paddingTop: 20, alignSelf: 'center' }}>
                    <Text style={{ color: appcolor.danger, textAlign: 'center' }}>Địa chỉ truy cập không tồn tại</Text>
                    <Text style={{ color: appcolor.danger, textAlign: 'center', fontSize: 20 }}>{urlPage}</Text>
                </View>
            </View>
        )
    }
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: appcolor.dark, width: '80%' }}>{pageName}</Text>
                    <TouchableOpacity style={{ width: '10%', alignItems: 'center' }} onPress={() => ExistPage()}>
                        <Icon name="close" size={28} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
                {
                    loading && <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 12, backgroundColor: appcolor.surface }}>
                        <Text style={{ position: 'absolute', top: 20, left: '35%', alignItems: 'center', textAlign: 'center', padding: 12, color: appcolor.primary, fontSize: 12 }} >Đang tải trang</Text>
                        <LottieView autoPlay source={webloading} renderMode='AUTOMATIC' style={{ width: '100%', height: '70%' }} />
                    </View>
                }
                {<View style={{ flex: 1 }}>
                    {
                        httpError === 200 ?
                            <WebView
                                incognito={true}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                allowsLinkPreview
                                onHttpError={(syntheticEvent) => {
                                    const { nativeEvent } = syntheticEvent;
                                    setError(nativeEvent.statusCode)
                                }}
                                onLoadStart={() => setLoading(true)}
                                onLoadEnd={() => setLoading(false)}
                                setDisplayZoomControls={false}
                                scalesPageToFit={false}
                                setBuiltInZoomControls={false}
                                onLoadProgress={({ nativeEvent }) => {
                                    if (nativeEvent.progress === 1) {
                                        setLoading(false);
                                    }
                                }}
                                bounces={false}
                                startInLoadingState={true}
                                renderLoading={() => <Progress.CircleSnail color={appcolor.primary}
                                    thickness={5} size={50} indeterminate={true}
                                    style={{ position: 'absolute', top: deviceSize.dheight / 2.8, zIndex: 7, alignSelf: "center" }} />}
                                injectedJavaScript={Platform.OS === 'ios' ? INJECTEDJAVASCRIPT : null}
                                // containerStyle={{ height: Fheight, width: Fwidth, backgroundColor: appcolor.light }}
                                renderError={(e) => errorPage(e)}
                                source={{
                                    uri: urlPage,
                                }}>
                            </WebView>
                            :
                            <View style={{ width: '100%', height: '100%' }}>
                                <LottieView autoPlay style={{ height: '100%' }} source={require('../Themes/lotties/error_page.json')} />
                                <View style={{ paddingTop: 20, alignSelf: 'center' }}>
                                    <Text style={{ fontSize: scaleSize(20), color: appcolor.danger, textAlign: 'center' }}>Địa chỉ truy cập không tồn tại</Text>
                                </View>
                            </View>
                    }
                </View>
                }
                {/* </View> */}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
export default WebViewUI;