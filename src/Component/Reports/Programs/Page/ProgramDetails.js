import { Text } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceHeight, fontWeightBold } from "../../../../Themes/AppsStyle";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebViewScreen from "../../../../Control/Webview/WebViewScreen";
import { URL_WEB } from "../../../../Core/URLs";

const ProgramDetails = ({ item, isShowDetails = true }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [uriDocument, setUriDocument] = useState({ uri: null, pageName: null, isShow: false })
    const productContent = (item?.models && item.models.trim().length > 0 ? item.models : item?.modelList || '').replace(/,/g, '\n')
    //
    const dataFiles = JSON.parse(item.files || '[]')
    // const productList = JSON.parse(item.modelList || '[]')
    // const heightProductView = (productList.length * 21) > 300 ? 300 : productList.length * 21
    // 
    const onShowDocument = (files) => {
        const linkView = Platform.OS == 'android' ? `https://docs.google.com/gview?embedded=true&url=${URL_WEB}${files.link}` : `${URL_WEB}${files.link}`
        setUriDocument({ uri: linkView, pageName: files.fileName })
    }

    const onCloseModal = () => {
        setUriDocument({ uri: null, pageName: null, isShow: false })
    }

    useEffect(() => {
        return () => { false }
    }, [item])

    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.light, marginBottom: 8 },
        label: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
        value: { fontSize: 13, color: appcolor.dark, marginRight: 4 },
        subValue: { fontSize: 12, color: appcolor.placeholderText },
        cardContent: { backgroundColor: appcolor.surface, padding: 8, borderRadius: 8, marginBottom: 8, marginTop: 4 },
        cardContentItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
        confirmInfo: { marginTop: 6 },
        modalContainer: { width: '100%', height: '100%' },
    })

    const renderItemDocument = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => onShowDocument(item)}>
                <Text style={[styles.value, { color: appcolor.primary, textDecorationLine: 'underline', fontStyle: 'italic' }]}>{item.fileName}</Text>
            </TouchableOpacity>
        )
    }
    if (!isShowDetails) return <View />
    return (
        <View style={styles.mainContainer}>
            <Text style={styles.label}>{`Sản phẩm ${item.totalProduct}`}</Text>
            <ScrollView style={[styles.cardContent, { height: 200 }]} nestedScrollEnabled>
                <Text style={[styles.subValue]}>{productContent}</Text>
                <View style={{ height: 24 }} />
            </ScrollView>
            <Text style={styles.label}>Mô tả</Text>
            <Text style={styles.value}>{item.descriptionInfo}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Xem tài liệu</Text>
            <CustomListView
                data={dataFiles}
                renderItem={renderItemDocument}
                bottomView={{ paddingBottom: 0 }}
            />
            <Modal
                presentationStyle='fullScreen'
                statusBarTranslucent
                backdropColor={appcolor.black}
                style={{ flex: 1, backgroundColor: appcolor.black }}
                visible={uriDocument.isShow}
                animationType='fade'>
                <SafeAreaProvider>
                    <SafeAreaView edges={['top', 'bottom']} style={styles.modalContainer}>
                        <WebViewScreen
                            pageName={uriDocument?.pageName}
                            urlPage={uriDocument.uri}
                            onClose={onCloseModal}
                        />
                    </SafeAreaView>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}

export default ProgramDetails;