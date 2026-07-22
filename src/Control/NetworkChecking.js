import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { deviceWidth } from '../Themes/AppsStyle';
const NetworkChecking = () => {
    const [isConnectionSlow, setIsConnectionSlow] = useState(false);
    const [isNetworkConnected, setIsNetworkConnected] = useState(true);
    const [__, setMutate] = useState(false);
    const checkPageLoadTime = async (url) => {
        try {
            const startTime = new Date().getTime();
            await fetch(url); // Tải nội dung của trang web từ URL cụ thể
            const endTime = new Date().getTime();
            const loadTime = endTime - startTime; // Tính thời gian tải trang

            // Kiểm tra nếu thời gian tải trang vượt quá ngưỡng tốc độ chấp nhận
            const standardLoadTime = 5000; // Giả sử ngưỡng là 5 giây
            if (loadTime > standardLoadTime) {
                setIsConnectionSlow(true);
            } else {
                setIsConnectionSlow(false);
            }
        } catch (error) {
            console.log(error.toString(), 'ERROR Checking Page Load Time');
            setIsConnectionSlow(true); // Xem xét là kết nối chậm nếu có lỗi xảy ra
        }
    };
    useEffect(() => {
        // Gọi hàm checkPageLoadTime để kiểm tra tốc độ tải trang từ URL cụ thể
        const url = 'https://google.com'; // Thay thế bằng URL của trang web bạn muốn kiểm tra
        checkPageLoadTime(url);

        // Thực hiện kiểm tra mỗi khi kết nối mạng thay đổi
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsNetworkConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const onCloseAlert = () => {
        setIsConnectionSlow(false);
        setIsNetworkConnected(true);
        setMutate(e => !e);
    };

    return (
        (isConnectionSlow || !isNetworkConnected) ? (
            <View style={{ position: 'absolute', width: deviceWidth, backgroundColor: 'black', opacity: 0.8, zIndex: 100000, elevation: 100000, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 10 }}>
                <TouchableOpacity onPress={onCloseAlert} style={{ padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={{ fontSize: 18, fontWeight: '700', marginLeft: 10, color: 'white' }}>
                        {!isNetworkConnected ? 'Không có kết nối mạng...' : 'Mạng không ổn định...'}
                    </Text>
                </TouchableOpacity>
            </View>
        ) : null
    );
};

export default NetworkChecking;
