import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity, RefreshControl } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import RNQRGenerator from 'rn-qr-generator';
import { Image } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome5'
import WebView from 'react-native-webview';
import { onShareLocalFile, ToastSuccess } from '../../Core/Helper';
import { HeaderCustom } from '../../Content/HeaderCustom'
import { useSelector } from 'react-redux';
import * as Progress from 'react-native-progress';
import { deviceHeight, deviceWidth } from '../../Themes/AppsStyle';
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";

const TrainingResults = ({ navigation, route }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [QRCodeValue, setQRCode] = useState(null)

    const loadData = async () => {
        const { uri } = await RNQRGenerator.generate({
            value: route.params?.LinkTraining,
            height: 300,
            width: 300,
        })

        await setQRCode(uri);
    }
    const handlerCopyLink = () => {
        ToastSuccess('Đã sao chép liên kết')
        Clipboard.setString(route.params?.LinkTraining)
    }
    const handlerShareLink = async () => {
        const option = {
            title: "Đường dẫn đào tạo",
            message: route.params?.LinkTraining,
            url: route.params?.LinkTraining
        }
        await onShareLocalFile(option);
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.homebackground },
        bgQRStyle: {
            width: '100%', height: '96%', borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.light, backgroundColor: appcolor.light, alignSelf: 'center',
            margin: 8, alignItems: 'center'
        }
    })

    useEffect(() => {
        loadData()
        return () => false
    }, [])
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={route.params.titlePage || kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
            />
            <Tabs.Container
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        scrollEnabled={true}
                        tabStyle={{ minWidth: deviceWidth / 2, height: 42 }}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        style={{ backgroundColor: appcolor.light }}
                    />
                )}
                containerStyle={{ backgroundColor: appcolor.surface }}>
                <Tabs.Tab key={'QR Code'} label={'QR Code'} name={'QR Code'} >
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <RenderViewQRCode
                            appcolor={appcolor}
                            style={styles}
                            QRValue={QRCodeValue}
                            LinkTraining={route.params?.LinkTraining}
                            tabLabel={'QR Code'}
                            copyLink={handlerCopyLink}
                            shareLink={handlerShareLink} />
                    </View>
                </Tabs.Tab>
                {/* <Tabs.Tab key={'Evaluate'} label={'Đánh giá'} name={'Đánh giá'} >
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <RenderEvaluate
                            style={styles}
                            appcolor={appcolor}
                            tabLabel={'Đánh giá'}
                            LinkEvaluate={route.params?.LinkEvaluate} />
                    </View>
                </Tabs.Tab> */}
                <Tabs.Tab key={'Training Results'} label={'Kết quả'} name={'Kết quả'} >
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <RenderTrainingResult
                            style={styles}
                            appcolor={appcolor}
                            tabLabel={'Training Results'}
                            LinkResult={route.params?.LinkResult} />
                    </View>
                </Tabs.Tab>
            </Tabs.Container>
        </View>
    )
}
const RenderViewQRCode = ({ QRValue, shareLink, style, copyLink, appcolor }) => {
    return (
        <View style={style.bgQRStyle}>
            <Image style={{ width: 300, height: 300, margin: 4 }} source={{ uri: QRValue }} />
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={copyLink} style={{ width: '50%', margin: 3 }}>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 0.5, borderRadius: 15, padding: 5, borderColor: appcolor.dark, marginTop: 12 }}>
                        <Icon name='copy' color={appcolor.primary} solid size={18} style={{ padding: 3, paddingEnd: 8 }} />
                        <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '500' }} >Sao chép liên kết</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={shareLink} style={{ width: '40%', margin: 3 }}>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 0.5, borderRadius: 15, padding: 5, borderColor: appcolor.dark, marginTop: 12 }}>
                        <Icon color={appcolor.primary} name='share' solid size={18} style={{ padding: 3, paddingEnd: 8 }} />
                        <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '500' }} >Chia sẻ</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0, maximum-scale=0, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `
const RenderTrainingResult = ({ style, appcolor, LinkResult }) => {
    const _refWeb = useRef()
    const [load, setLoad] = useState(false)
    return (
        <View style={style.bgQRStyle}>
            <ScrollView
                style={{ width: '100%', height: '100%' }}
                scrollEnabled={true}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl
                    title='Cập nhật lại kết quả'
                    refreshing={load}
                    onRefresh={() => {
                        _refWeb.current.reload()
                        setLoad(false)
                    }}
                />
                }
                contentContainerStyle={{ flex: 1 }}>
                <WebView
                    key='training'
                    ref={_refWeb}
                    cacheEnabled={false}
                    setDisplayZoomControls={false}
                    setBuiltInZoomControls={false}
                    scalesPageToFit={Platform.OS == 'android' ? false : true}
                    style={{ flex: 1 }}
                    pullToRefreshEnabled={true}
                    domStorageEnabled={true}
                    injectedJavaScript={Platform.OS === 'ios' ? INJECTEDJAVASCRIPT : null}
                    onMessage={(event) => { }}
                    source={{ uri: LinkResult }}
                    bounces={0}
                    startInLoadingState={true}
                    renderLoading={() => <Progress.CircleSnail color={appcolor.primary}
                        thickness={5} size={50} indeterminate={true}
                        style={{ position: 'absolute', top: deviceHeight / 2.8, zIndex: 7, alignSelf: "center" }} />}
                />
            </ScrollView>
        </View>
    )
}
const RenderEvaluate = ({ style, appcolor, LinkEvaluate }) => {
    const _refWeb = useRef()
    const [load, setLoad] = useState(false)
    return (
        <View style={style.bgQRStyle}>
            <ScrollView
                style={{ width: '100%', height: '100%' }}
                scrollEnabled={true}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl
                    title='Cập nhật lại kết quả'
                    refreshing={load}
                    onRefresh={() => {
                        _refWeb.current.reload()
                        setLoad(false)
                    }}
                />
                }
                contentContainerStyle={{ flex: 1 }}>
                <WebView
                    key='evaluate'
                    ref={_refWeb}
                    cacheEnabled={false}
                    setDisplayZoomControls={false}
                    setBuiltInZoomControls={false}
                    scalesPageToFit={Platform.OS == 'android' ? false : true}
                    style={{ flex: 1 }}
                    pullToRefreshEnabled={true}
                    domStorageEnabled={true}
                    injectedJavaScript={Platform.OS === 'ios' ? INJECTEDJAVASCRIPT : null}
                    onMessage={(event) => { }}
                    source={{ uri: LinkEvaluate }}
                    bounces={0}
                    startInLoadingState={true}
                    renderLoading={() => <Progress.CircleSnail color={appcolor.primary}
                        thickness={5} size={50} indeterminate={true}
                        style={{ position: 'absolute', top: deviceHeight / 2.8, zIndex: 7, alignSelf: "center" }} />}
                />
            </ScrollView>
        </View>
    )
}
export default TrainingResults;