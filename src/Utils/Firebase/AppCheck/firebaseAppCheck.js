import appCheck from '@react-native-firebase/app-check';
import { NativeModules, Platform, Alert } from 'react-native';

const { AppAttestModule, PlayIntegrityModule } = NativeModules;

/**
 * 1. Khởi tạo và kích hoạt Firebase App Check nội bộ trong App.
 * Tự động chọn App Attest cho iOS và Play Integrity cho Android để bảo vệ API Firebase.
 */
const initializeAppCheck = async () => {
  try {
    // Tạo cấu hình Provider mặc định từ SDK Firebase RN
    const provider = appCheck().newReactNativeFirebaseAppCheckProvider();

    provider.configureProvider({
      apple: {
        // Sử dụng 'appAttest' (Khuyên dùng cho iOS 14+), hoặc đổi thành 'deviceCheck' nếu chạy Simulator
        provider: Platform.OS === 'ios' ? 'appAttest' : 'debug',
      },
      android: {
        // Sử dụng 'playIntegrity' cho các thiết bị Android có Google Play Services
        provider: 'playIntegrity',
      },
    });

    // Kích hoạt App Check (true = tự động làm mới Token ngầm)
    await appCheck().activate(provider, true);
    console.log('✅ Firebase App Check đã được kích hoạt thành công.');
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Firebase App Check:', error);
  }
};

/**
 * 2. Lấy Key ID duy nhất từ Apple App Attest (Chỉ dùng riêng cho iOS)
 */
const getKeyAppCheck = async () => {
  if (Platform.OS !== 'ios') {
    console.warn('⚠️ Hàm getKeyAppCheck chỉ hỗ trợ trên nền tảng iOS.');
    return null;
  }

  try {
    if (!AppAttestModule) {
      throw new Error(
        'AppAttestModule chưa được liên kết thành công trong Xcode.',
      );
    }
    const keyId = await AppAttestModule.generateAttestationKey();
    console.log('🍏 Key ID App Attest của bạn là:', keyId);
    return keyId;
  } catch (error) {
    console.error('❌ Lỗi sinh Key ID:', error);
    return null;
  }
};

/**
 * 3. Kiểm tra bảo mật thiết bị nâng cao và lấy chuỗi chứng thực gửi về Server Backend (.NET)
 * Hàm này dùng để chặn đứng mã độc, thiết bị Root/Jailbreak hoặc App giả mạo tấn công API riêng.
 */
const verifyDeviceSecurity = async () => {
  try {
    // LƯU Ý: Chuỗi Challenge này ĐÁNG LẼ phải được gọi lấy từ Server .NET của bạn về trước
    // để đảm bảo tính duy nhất theo thời gian (chống Replay Attack).
    const mockChallenge = 'fieldforce_secure_challenge_2026';
    console.log('--- BẮT ĐẦU KIỂM TRA BẢO MẬT HỆ THỐNG NATIVE ---');

    if (Platform.OS === 'ios') {
      // 🍏 LUỒNG CHẠY TRÊN iOS (Yêu cầu thiết bị thật)
      if (!AppAttestModule) {
        console.warn(
          '⚠️ Module AppAttestModule chưa được liên kết thành công trong Xcode.',
        );
        Alert.alert('Lỗi', 'Không tìm thấy AppAttestModule ở lớp Native.');
        return false;
      }

      console.log('iOS: Đang sinh hoặc tái sử dụng Key ID...');
      const keyId = await AppAttestModule.generateAttestationKey();

      console.log(
        'iOS: Đang ký Challenge tạo chứng chỉ chứng thực (Attestation Object)...',
      );
      const attestationObject = await AppAttestModule.attestKey(
        keyId,
        mockChallenge,
      );

      console.log('✅ iOS Bảo mật OK! Dữ liệu sẵn sàng gửi qua .NET:', {
        keyId,
        attestationObject,
      });
      Alert.alert('iOS Thành công', 'Đã lấy được chuỗi chứng thực App Attest.');
      return {
        platform: 'ios',
        keyId,
        attestationObject,
        challenge: mockChallenge,
      };
    } else if (Platform.OS === 'android') {
      // 🤖 LUỒNG CHẠY TRÊN ANDROID
      if (!PlayIntegrityModule) {
        console.warn(
          '⚠️ Module PlayIntegrityModule chưa được khai báo trong MainApplication.kt hoặc Package.',
        );
        Alert.alert('Lỗi', 'Không tìm thấy PlayIntegrityModule ở lớp Native.');
        return false;
      }

      console.log(
        'Android: Đang yêu cầu Token từ Google Play Integrity API...',
      );
      // Gọi hàm từ lớp Kotlin ở Native đưa vào chuỗi thách thức
      const integrityToken = await PlayIntegrityModule.getIntegrityToken(
        mockChallenge,
      );

      console.log(
        '✅ Android Bảo mật OK! Gửi chuỗi Token JWT này qua .NET để bóc tách:',
        integrityToken,
      );
      Alert.alert(
        'Android Thành công',
        'Đã lấy được Integrity Token mã hóa từ Google.',
      );
      return { platform: 'android', integrityToken, challenge: mockChallenge };
    }
  } catch (error) {
    console.error('❌ Lỗi quy trình kiểm tra thiết bị tự động:', error);
    Alert.alert(
      'Lỗi bảo mật hệ thống',
      error.message || 'Thiết bị không vượt qua bài kiểm tra toàn vẹn.',
    );
    return false;
  }
};

export const APPCHECK = {
  initializeAppCheck,
  getKeyAppCheck,
  verifyDeviceSecurity,
};
