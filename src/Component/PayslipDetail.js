import React, { useState, useRef, useCallback, useEffect } from "react";
import { Text, View, ScrollView, Image, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from '@rneui/themed';
import { GetEmployeeInfo, StringTobase64, onShareLocalFile } from "../Core/Helper";
import WebViewUI from "../Content/WebViewUI";
import ViewShot from "react-native-view-shot";
import { HeaderCustom } from '../Content/HeaderCustom';
import moment from 'moment';
import { useSelector } from "react-redux";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start'
  }
});

const PaySlipDetail = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [option, setOption] = useState(route.params.title);
    const [showView, setShowView] = useState(false);
    const [urlSite, setUrlSite] = useState("");
    const refShot = useRef(null);
    const data = route.params || {};

    useEffect(() => { }, [])

    const ShareScreen = useCallback(async () => {
        const path = await refShot.current.capture();
        const option = {
            title: "Tin nhắn",
            message: route.params.title,
            url: path,
        };
        await onShareLocalFile(option);
    }, [route.params.title]);

    const gotoPage = useCallback(async (link) => {
        link = link.replace(/(\r\n|\n|\r)/gm, "");
        const index = link.indexOf("http", 0);
        link = link.substring(index, link.length);

        if (link?.includes('http')) {
            const einfo = await GetEmployeeInfo();
            const shareInfo = {
                employeeId: einfo.employeeId,
                employeeName: einfo.employeeName,
                accountId: einfo.accountId,
                typeId: einfo.typeId,
                loginName: einfo.loginName,
                mobile: einfo.mobile,
            };
            if (link.includes("spiral.com.vn")) {
                const app_access = await StringTobase64(JSON.stringify(shareInfo));
                setUrlSite(link.includes('?') ? link + "&appShare=" + app_access : link + "?appShare=" + app_access);
            } else {
                setUrlSite(link);
            }
            setShowView(true);
        } else {
            navigation.navigate(link);
        }
    }, [navigation]);

    const CreateBody = useCallback((content) => {
        console.log(ontent, 'contentcontent');

        const listContent = content.split("</br>");

        return listContent.map((row, index) => {
            const cols = row.split("<p>") || [row];
            return (
                <View key={`${index}arow`} style={{ padding: 3, flexDirection: 'row', borderBottomWidth: 0.6, borderColor: appcolor.grey }}>
                    {cols?.length > 0 && (
                        <View style={{ width: '70%' }}>
                            <Text style={{ fontWeight: '500', fontSize: 13, color: appcolor.dark }}>{cols[0]}</Text>
                        </View>
                    )}
                    {cols?.length > 1 && (
                        <View style={{ flexGrow: 1 }}>
                            <Text style={{ fontWeight: '500', fontSize: 13, textAlign: 'right', color: appcolor.dark }}>{cols[1]}</Text>
                        </View>
                    )}
                </View>
            );
        });
    }, [appcolor]);


    return (
        <View style={styles.content}>
            <HeaderCustom
                rightFunc={ShareScreen}
                leftFunc={() => navigation.goBack()}
                title={option || 'Chi tiết lương'}
                iconRight="share"
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 15 }} style={{ height: '94%', backgroundColor: appcolor.light }}>
                <ViewShot style={{ padding: 12 }} ref={refShot} options={{ format: "jpg", quality: 0.8 }}>
                    <Text style={{ fontSize: 19, fontWeight: "bold", paddingBottom: 10, color: appcolor.dark }}>{data.title}</Text>
                    {(data.hyperLinks !== null && (data?.hyperLinks?.includes('.png') || data?.hyperLinks?.includes('.jpg') || data?.hyperLinks?.includes('.jpeg'))) && (
                        <Image
                            style={{ borderRadius: 10, padding: 10, height: 160 }}
                            source={{
                                uri: data?.hyperLinks,
                                headers: { Authorization: 'someAuthToken' },
                                priority: FastImage.priority.normal,
                            }}
                        />
                    )}
                    <View style={{ backgroundColor: appcolor.light }}>
                        {CreateBody(data?.body || "")}
                    </View>
                    <Text style={{ color: appcolor.dark, width: '100%', padding: 5, textAlign: 'right' }}>
                        {moment(data.createdDate).calendar()}
                    </Text>
                    {data.hyperLinks !== null && data.hyperLinks !== "" && data.hyperLinks !== "null" && (
                        <View style={{ alignItems: 'flex-end', marginBottom: 10, display: ((!data?.hyperLinks?.includes('.png') && !data?.hyperLinks.includes('.jpg') && !data.hyperLinks.includes('.jpeg'))) ? "flex" : "none" }}>
                            <TouchableOpacity
                                style={{ padding: 7, flexDirection: 'row', borderWidth: 0.5, borderColor: appcolor.primary }}
                                onPress={() => gotoPage(data.hyperLinks)}
                            >
                                <Icon color={appcolor.primary} name="hand-o-right" type="font-awesome" size={20} />
                                <Text style={{ color: appcolor.primary }}>Đi đến</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ViewShot>
            </ScrollView>
            <Modal style={{ backgroundColor: appcolor.light }} animationType="slide" visible={showView}>
                <WebViewUI pageName={data.title} urlPage={urlSite} onClose={() => setShowView(false)} />
            </Modal>
        </View>
    );
};

export default PaySlipDetail;