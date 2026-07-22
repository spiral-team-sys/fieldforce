import React from 'react';
import { View, Image, Text } from "react-native"
import { useSelector } from "react-redux"

export const Footer = () => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    return (
        <View style={{ backgroundColor: appcolor.light, height: 100, }}>
            <View>
                <Image resizeMode="repeat"
                    style={{ alignContent: 'center', width: 'auto', height: '100%', opacity: 0.6 }}
                    source={{ uri: 'https://spiral.com.vn/Content/images/logo.png' }} />
                <View style={{ alignItems: 'center', padding: 7, width: "100%", top: '30%', position: 'absolute' }}>
                    <Text style={{ color: appcolor.danger, fontWeight: 'bold' }}>Công ty TNHH Sức bật</Text>
                    <Text style={{ color: appcolor.danger }}>27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh</Text>
                </View>
            </View>
        </View>
    )
}