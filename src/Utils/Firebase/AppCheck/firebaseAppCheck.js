import appCheck from '@react-native-firebase/app-check';
import { NativeModules, Platform, Alert } from 'react-native';
import { alertError } from '../../../Core/Utility';
import { URLDEFAULT } from '../../../Core/URLs';

const { AppAttestModule, PlayIntegrityModule } = NativeModules;

const initializeAppCheck = () => {
    const provider = appCheck().newReactNativeFirebaseAppCheckProvider();
    if (Object.keys(provider).length === 0) {
        console.warn('⚠️ App Attest module is not available. Make sure you are running on a real iOS device with iOS 14 or later.');
    } else {
        provider.configureProvider({
            apple: {
                provider: 'appAttest',
            },
            android: {
                provider: 'playIntegrity',
            }
        });
        appCheck().activate(provider, true);
    }
};

const getKeyAppCheck = async () => {
    try {
        const keyId = await AppAttestModule.generateAttestationKey();
        console.log("Key ID của bạn là:", keyId);
        return keyId;
    } catch (error) {
        console.error(error);
        return null;
    }
}
const verifyDeviceSecurity = async () => {
    try {
        // 1. Giả lập chuỗi Challenge (Đáng lẽ lấy từ Server .NET về để chống Replay attack)
        const mockChallenge = "fieldforce_secure_challenge_2026";
        console.log('--- BẮT ĐẦU KIỂM TRA BẢO MẬT HỆ THỐNG ---');

        if (Platform.OS === 'ios') {
            // 🍏 LUỒNG CHẠY TRÊN IOS (BẢN ENTERPRISE)
            if (!AppAttestModule) {
                console.warn('⚠️ Module AppAttestModule chưa được liên kết thành công trong Xcode.');
                return false;
            }

            console.log('iOS: Đang sinh Key ID...');
            const keyId = await AppAttestModule.generateAttestationKey();

            console.log('iOS: Đang ký Challenge tạo chứng chỉ chứng thực...');
            const attestationObject = await AppAttestModule.attestKey(keyId, mockChallenge);

            console.log('✅ iOS OK! Dữ liệu sẵn sàng gửi qua .NET:', { keyId, attestationObject });
            Alert.alert("iOS Thành công", "Đã lấy được chuỗi chứng thực App Attest.");
            return { platform: 'ios', keyId, attestationObject };

        } else if (Platform.OS === 'android') {
            // 🤖 LUỒNG CHẠY TRÊN ANDROID (BẢN ENTERPRISE)
            if (!PlayIntegrityModule) {
                console.warn('⚠️ Module PlayIntegrityModule chưa được khai báo trong MainApplication.kt hoặc Package.');
                Alert.alert("Lỗi", "Không tìm thấy PlayIntegrityModule ở lớp Native.");
                return false;
            }

            console.log('Android: Đang yêu cầu Token từ Google Play Integrity API...');
            // Gọi hàm Kotlin chúng ta đã viết
            const integrityToken = await PlayIntegrityModule.getIntegrityToken(mockChallenge);

            console.log('✅ Android OK! Gửi chuỗi Token JWT này qua .NET để bóc tách:', integrityToken);
            Alert.alert("Android Thành công", "Đã lấy được Integrity Token mã hóa từ Google.");
            return { platform: 'android', integrityToken };
        }

    } catch (error) {
        console.error('❌ Lỗi quy trình kiểm tra thiết bị:', error);
        Alert.alert("Lỗi bảo mật", error.message);
        return false;
    }
};

export const APPCHECK = { initializeAppCheck, getKeyAppCheck, verifyDeviceSecurity };