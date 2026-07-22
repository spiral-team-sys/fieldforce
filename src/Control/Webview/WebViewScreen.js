import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import LottieView from "lottie-react-native";
import { Icon, Text } from "@rneui/themed";
import { useSelector } from "react-redux";
import { alertConfirm, ERROR_HTML } from "../../Core/Utility";

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0, maximum-scale=0, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `

const WebViewScreen = ({ pageName, urlPage, onClose, isConfirmExits = true, isDownloadFile = false, onDownloadFile }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [error, setError] = useState(null)
    // 
    const onExit = () => {
        isConfirmExits ?
            alertConfirm("Thông báo", "Bạn muốn thoát khỏi trang này?", onClose)
            :
            onClose()
    }
    const onDownload = () => {
        if (onDownloadFile) {
            onDownloadFile()
        }
    }
    const onHttpError = (e) => {
        const { nativeEvent } = e;
        setError(nativeEvent.statusCode)
    }
    // 
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.dark },
        titlePageName: { width: '80%', fontSize: 14, fontWeight: '500', color: appcolor.light, padding: 8 },
        headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 },
        contentErrorView: { paddingTop: 20, alignSelf: 'center' },
        titleError: { color: appcolor.danger, textAlign: 'center' }
    })
    const renderError = () => {
        return (
            <View style={styles.errorContainer}>
                <LottieView autoPlay style={{ height: '100%' }} source={require('../../Themes/lotties/error_page.json')} />
                <View style={styles.contentErrorView}>
                    <Text style={styles.titleError}>Địa chỉ truy cập không tồn tại</Text>
                    <Text style={styles.titleError}>{urlPage}</Text>
                </View>
            </View>
        )
    }
    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.titlePageName}>{pageName}{error}</Text>
                {isDownloadFile && (
                    <TouchableOpacity onPress={onDownload} style={{ padding: 8 }}>
                        <Icon type="ionicon" name="download-outline" color={appcolor.light} />
                    </TouchableOpacity>
                )}
                <View style={{ width: 8 }} />
                <TouchableOpacity onPress={onExit} style={{ padding: 8 }}>
                    <Icon type="ionicon" name="close" color={appcolor.light} />
                </TouchableOpacity>
            </View>
            <WebView
                bounces={false}
                incognito
                javaScriptEnabled
                domStorageEnabled
                allowsLinkPreview
                startInLoadingState
                setDisplayZoomControls={false}
                scalesPageToFit
                setBuiltInZoomControls={false}
                source={urlPage ? { uri: urlPage } : { html: ERROR_HTML }}
                style={{ flex: 1 }}
                injectedJavaScript={Platform.OS == 'ios' ? INJECTEDJAVASCRIPT : null}
                renderError={renderError}
                onHttpError={onHttpError}
                androidHardwareAccelerationDisabled={false}
                setSupportMultipleWindows={false}
                allowsBackForwardNavigationGestures
            />
        </SafeAreaView>
    )
}

export default WebViewScreen;
