import LottieView from "lottie-react-native"
import React, { useEffect } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import ProgressBarCustom from "../Control/ProgressBarCustom"
import { deviceHeight, deviceWidth } from "../Core/Utility"
export const UpdateSystem = ({ percent, onUpdated }) => {
    useEffect(() => {
        console.log('updateing value', percent)
        return () => false
    }, [percent])
    const { appcolor } = useSelector(state => state.GAppState);
    return (
        <View style={{ width: deviceWidth, height: deviceHeight, backgroundColor: appcolor.surface }}>
            <View style={{ width: '100%', height: '70%' }}>
                <LottieView style={{ height: '100%' }} autoPlay source={require('../Themes/lotties/app-update.json')} />
            </View>
            <View style={{ padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: percent === 1 ? appcolor.danger : appcolor.dark, marginBottom: 3 }}>
                    {percent === 1 ? "(*) Nếu ứng dụng bạn chưa được cập nhật mới, vui lòng tắt đa nhiệm (đóng app) mở app lên lại" : "Đang tiến hành cập nhật hệ thống"}
                </Text>
                <ProgressBarCustom viewPercent={100} progressValue={Math.round(percent * 100)} isShowing={true} />
            </View>
            {percent === 1 &&
                <TouchableOpacity onPress={onUpdated}
                    style={{ backgroundColor: appcolor.danger, borderRadius: 20, margin: 7, alignContent: 'center' }}>
                    <Text style={{ color: appcolor.white, textAlign: 'center', padding: 12 }}>Hoàn thành </Text>
                </TouchableOpacity>
            }
        </View>
    )
}