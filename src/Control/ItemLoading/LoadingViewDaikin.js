import React, { useEffect, useState } from 'react';
import { View, Text } from "react-native";
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native'
const LoadingViewDaikin = ({ title, isLoading, styles }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    useEffect(() => {
        return () => false
    }, [])
    return (
        isLoading ?
            <View style={[styles, { width: '100%', alignItems: 'center' }]}>
                <LottieView style={{ width: 100, height: 80 }} autoPlay source={require('../../Themes/lotties/loading_dks.json')} />
                <Text style={{ color: appcolor.redgray, fontWeight: '700', position: 'absolute', top: 8 }}>{title || 'Đang tải dữ liệu'}</Text>
            </View>
            : null
    )
}
export default LoadingViewDaikin;