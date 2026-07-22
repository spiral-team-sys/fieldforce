import React, { useEffect } from "react"
import LottieView from "lottie-react-native"
import { View, Text } from "react-native"
import { useSelector } from "react-redux"
import { scaleSize } from "../../Themes/AppsStyle"
import { AppNameBuild, signifyApp } from "../../Core/URLs"
import { checkNetwork } from "../../Core/Utility"
export const WelcomeAka = () => {
    const { appcolor } = useSelector(state => state.GAppState)
    useEffect(() => {
        checkNetwork()
        return () => false
    }, [])
    return (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: appcolor.primary }}>
            {
                AppNameBuild === signifyApp ?
                    <LottieView style={{ height: '60%' }} autoPlay source={require('../../Themes/lotties/cargill_welcome.json')} />
                    :
                    <LottieView style={{ height: '60%' }} autoPlay source={require('../../Themes/lotties/welcome2.json')} />
            }
            <Text style={{ width: '100%', textAlign: 'center', fontSize: scaleSize(40), color: appcolor.dark }}>Welcome,</Text>
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, flex: 1, alignItems: 'center' }}>
                <Text style={{ color: appcolor.dark, }}>Công ty TNHH Suc Bat</Text>
                <Text style={{ color: appcolor.dark }}>27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh</Text>
            </View>
        </View>
    )
}