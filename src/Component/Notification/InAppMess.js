import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Linking, SafeAreaView } from "react-native";
import WebView from "react-native-webview";
import { useSelector } from "react-redux";
import { NotificationAPI } from "../../API/NotificationAPI";
import Toast from "react-native-toast-message";
import { Icon } from '@rneui/themed';
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FormGroup from "../../Content/FormGroup";
import { alertWarning, checkUrlExists } from "../../Core/Utility";
import { GetToken } from "../../Core/Helper";
import { AppNameBuild } from "../../Core/URLs";
import deviceInfoModule from "react-native-device-info";
import base64 from "react-native-base64";

export const InAppMess = ({ props }) => {
    const [inAppMess, setinAppMess] = useState({})
    const { inAppId, close, isViewDetail } = props
    const [config, setConfig] = useState([])
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [log, setLog] = useState({})

    const onload = async () => {
        const results = await NotificationAPI.GetInApp(inAppId, isViewDetail)
        if (results.statusId === 200) {
            if (await results?.data.length > 0) {
                const item = results.data[0]
                await setinAppMess(item)
                await setConfig(JSON.parse(item.config))
            } else {
                close()
            }
            setLog({ "opentime": moment().format('YYYY-MM-DD HH:mm:ss') })
        } else {
            console.log('check load');
            close()
        }
    }
    useEffect(() => {
        const _load = onload()
        return () => _load;
    }, [inAppId])
    const onPostLog = async () => {
        const feedback = log?.feedback || ''
        const configNote = config?.filter(i => i.name == 'FeedBack')[0] || {}
        if (configNote?.noteLength > 0) {
            if (feedback.length < configNote.noteLength) {
                alertWarning(`Vui lòng nhập ${configNote.label} tối thiểu ${configNote.noteLength} kí tự (${feedback.length}/${configNote.noteLength})`)
                return
            }
        }
        //
        const logInfo = {
            inAppId: inAppId,
            opentime: log.opentime,
            closetime: moment().format("YYYY-MM-DD HH:mm:ss"),
            feedback: log?.feedback || null
        }
        const resutl = await NotificationAPI.PostLog([logInfo])
        if (resutl.statusId === 200) {
            await AsyncStorage.removeItem('messages');
            await close()
        } else {
            await Toast.show({ type: "error", text1: "Lỗi", text2: resutl.messager })
        }
    }
    const handlerChangeText = (text) => {
        setLog({ ...log, feedback: text })
    }
    const eventStateUrlChange = async (event) => {
        const token = await GetToken()
        const deviceId = await deviceInfoModule.getUniqueId();
        const shareInfo = {
            employeeId: userinfo.employeeId,
            employeeName: userinfo.employeeName,
            accountId: userinfo.accountId,
            typeId: userinfo.typeId,
            loginName: userinfo.loginName,
            mobile: userinfo.mobile,
            deviceId: deviceId,
            AppId: AppNameBuild,
            "token": token
        }
        const app_access = await base64.encode(JSON.stringify(shareInfo));
        const url = `${event.url}&appshare=${app_access}`
        if (event.url !== null && event.url !== "about:blank") {
            if (event.url.includes("spiral.com.vn") || event.url.includes("sucbat.com.vn")) {
                Linking.openURL(url)
                close()
            } else {
                const newUrl = !event.url.includes("http://") && !event.url.includes("https://") ? `https://${event.url}` : event.url
                const checkUrl = await checkUrlExists(newUrl)
                if (checkUrl) {
                    Linking.openURL(newUrl)
                    close()
                } else {
                    alertWarning(`Đường dẫn ${event.url} không đúng định dạng!`)
                }
            }
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
            <View style={{ padding: 3 }}>
                <Text style={{ color: appcolor.dark, fontWeight: '900', }}>{inAppMess?.title || 'InApp'}</Text>
            </View>
            <WebView style={{}}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                showsVerticalScrollIndicator={false}
                startInLoadingState
                onShouldStartLoadWithRequest={false}
                onNavigationStateChange={eventStateUrlChange}
                source={{
                    html: `<html>
                <head><meta name="viewport" content="width=device-width, initial-scale=0.0">
                <style>
                    img {width: 100%;}
                </style>
                </head><body style="font-size:${Platform.OS === 'android' ? "350%;" : "100%"} ">
                    ${inAppMess?.content}
                    <div style="text-align:end;color:red;width:100%;font-style:italic">
                    Đã đăng ${moment(inAppMess?.createdDate).calendar()}
                    </div>
                    <div style="width: 100%;background:#f1f1f1;padding-left:-3px;">
                        <p style="text-align:center;font-weight:600;padding-top:30px">Công ty TNHH Sức Bật</p>
                        <p style="text-align:center;">27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh</p>
                        <p style="text-align:center;font-weight:600;padding-bottom:10px">copyright®2022</p>
                    </div>
                </body></html>` }}
            />
            <ToolKit onPostLog={onPostLog} close={close} config={config} appcolor={appcolor} handlerChangeText={handlerChangeText} />
            {
                config?.length == 0 &&
                <TouchableOpacity onPress={close} style={{ position: 'absolute', right: 0, top: 20 }}>
                    <Icon size={16} name="close" containerStyle={{ opacity: 0.8 }} reverse />
                </TouchableOpacity>
            }

        </SafeAreaView>
    )
}
const ToolKit = ({ config, appcolor, onPostLog, close, handlerChangeText }) => {
    const [count, setCount] = useState(30)
    useEffect(() => {
        let _cleartime = setTimeout(() => {
            if (count !== 0)
                setCount(count - 1)
        }, 1000)
        return () => clearInterval(_cleartime)
    }, [count])
    return (
        <View style={{ padding: 3, backgroundColor: appcolor.light }}>
            {(config?.filter(it => it.name == 'FeedBack')).map((element, index) => {
                return (
                    <FormGroup
                        editable
                        multiline
                        title={element.label}
                        placeholder={`Nhập ${element.label}`}
                        containerStyle={{ padding: 3, fontSize: 13, backgroundColor: appcolor.surface, borderRadius: 5 }}
                        handleChangeForm={handlerChangeText}
                    />
                )
            })
            }
            <View style={{ justifyContent: 'center', marginBottom: 7, minHeight: 40, flexDirection: 'row', alignItems: 'center' }}>
                {(config?.filter(it => it.name !== 'FeedBack')).map((element, index) => {
                    return (
                        <ButtonAction
                            key={element.name}
                            element={element} close={close} onPostLog={onPostLog}
                        />
                    )
                })}
            </View>
        </View>
    )
}
const ButtonAction = ({ element, close, onPostLog }) => {
    const [count, setCount] = useState(element.timer)
    useEffect(() => {
        let _cleartime = setTimeout(() => {
            if (count !== 0)
                setCount(count - 1)
        }, 1000)
        return () => clearInterval(_cleartime)
    }, [count])

    const { appcolor } = useSelector(state => state.GAppState)
    const colorButton = element.name === 'SkipButton' ? appcolor.danger : element.name === 'ReadButton' ? appcolor.primary : appcolor.surface;
    const styles = StyleSheet.create({
        buttonClose: { flexGrow: 0.3, padding: 7, marginEnd: 3, backgroundColor: appcolor.light, borderWidth: 0.5 },
        buttonRead: { flexGrow: 0.3, padding: 7, marginEnd: 3, backgroundColor: colorButton }
    })
    const pressItem = () => {
        element.name === 'SkipButton' ? close() : onPostLog()
    }
    const styleButton = element.name === 'SkipButton' ? styles.buttonClose : styles.buttonRead
    return (
        <TouchableOpacity onPress={pressItem}
            disabled={count !== 0} style={styleButton} key={element.name}>
            <Text style={{ textAlign: 'center', fontSize: 14, color: appcolor.white }}>
                {count > 0 ? count : element.label}
            </Text>
        </TouchableOpacity>
    )
}