import React, { useRef } from 'react';
import { useSelector, useDispatch } from "react-redux"
import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { fontWeightBold } from '../../Themes/AppsStyle';
import WebView from 'react-native-webview';
import base64 from 'react-native-base64'
import { alertNotify, deviceWidth, } from '../../Core/Utility';
import { GetFormStatus } from '../../Controller/AdhocController';
import PagerView from 'react-native-pager-view';
import { SetFormStatus } from '../../Redux/action';
import { toastSuccess } from '../../Utils/configToast';

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width,initial-scale=0, maximum-scale=0, user-scalable=0.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `
export const AdhocNow = ({ data }) => {
    const { appcolor, userinfo, shopinfo } = useSelector(state => state.GAppState);
    const _pageRef = useRef();
    const dispath = useDispatch();

    const dataObj = {
        AccountId: userinfo.accountId,
        EmployeeId: userinfo.employeeId,
        ShopId: shopinfo?.shopId || 0
    }
    const base64Str = base64.encode(JSON.stringify(dataObj))
    const UrlNow = data.publicUrl + "&appShare=" + base64Str;

    const onFormCompleted = async () => {
        const result = await GetFormStatus(data.id);
        if (result.length < 1) {
            alertNotify("Bạn chưa thực hiện khảo sát & gửi bản khảo sát");
        } else {
            dispath(SetFormStatus(false))
            toastSuccess("Hoàn thành", "Cám ơn bạn đã hoàn thành bài khảo sát");
        }
    }
    const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: '#ffffff' },
        pager: { height: '100%', width: '100%', backgroundColor: '#ffffff' },
        page1: { alignItems: 'center', backgroundColor: '#ffffff' },
        title: { color: appcolor.dark, textAlign: 'center', fontSize: 18, padding: 8, fontWeight: fontWeightBold },
        lottieWrap: { height: '50%', width: '100%' },
        lottie: { height: '100%' },
        guid: { color: appcolor.primary, fontWeight: fontWeightBold, fontSize: 12, paddingHorizontal: 8, textAlign: 'center' },
        subTitle: { color: appcolor.dark, fontSize: 12, padding: 8, textAlign: 'center' },
        startBtn: { backgroundColor: '#ffffff', padding: 12, position: 'absolute', bottom: 50, justifyContent: 'center' },
        startBtnText: { color: appcolor.dark, fontSize: 13, fontWeight: fontWeightBold },
        page2: { height: '100%', alignItems: 'center' },
        webview: { width: deviceWidth },
        doneBtn: { margin: 8 },
        doneBtnText: { color: appcolor.dark, fontSize: 13, fontWeight: fontWeightBold },
    });
    return (
        <SafeAreaView style={styles.safeArea}>
            <PagerView ref={_pageRef} style={styles.pager} initialPage={0}>
                <View style={styles.page1} key="1">
                    <Text style={styles.title}>{data.title}</Text>
                    <View style={styles.lottieWrap}>
                        <LottieView autoPlay style={styles.lottie} source={require('../../Themes/lotties/checklist.json')} />
                    </View>
                    <Text style={styles.guid}>{data?.guid}</Text>
                    <Text style={styles.subTitle}>{data.subTitle}</Text>
                    <TouchableOpacity style={styles.startBtn} onPress={() => _pageRef.current.setPage(1)}>
                        <Text style={styles.startBtnText}>Bắt đầu thực hiện</Text>
                    </TouchableOpacity>
                </View>
                <View key="2">
                    <View style={styles.page2}>
                        <WebView
                            containerStyle={styles.webview}
                            scalesPageToFit={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            source={{ uri: UrlNow }}
                            incognito={true}
                            allowsLinkPreview
                            startInLoadingState={true}
                            injectedJavaScript={Platform.OS === 'ios' ? INJECTEDJAVASCRIPT : null}
                        />
                        <TouchableOpacity onPress={() => onFormCompleted()} style={styles.doneBtn}>
                            <Text style={styles.doneBtnText}>Hoàn thành</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </PagerView>
        </SafeAreaView>
    )
}