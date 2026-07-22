
import RNFS from 'react-native-fs';
import { toastError } from '../Utils/configToast'
import { PROJECTCODE } from '../Core/URLs';

const translateText = async (text) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ content: text })
        }
        const response = await fetch('https://ai-api.spiral.com.vn/api/translate', requestInfo)
        const result = await response.json()
        if (result.success) {
            return result.content
        } else {
            toastError('Lỗi dịch', result.message || 'Không thể dịch văn bản')
            return text
        }
    } catch (error) {
        toastError('Lỗi dịch', 'Hệ thống đang quá tải, vui lòng thử lại sau')
        return text
    }
}

/**
 * So sánh khuôn mặt trong ảnh chụp với ảnh hồ sơ của người dùng.
 * @param {string} imagePath - Đường dẫn file ảnh trên thiết bị
 * @param {string|number} employeeId - Mã nhân viên
 * @param {string} projectCode - Mã dự án / cửa hàng
 * @returns {{ success: boolean, similarity: number, message: string }}
 */
const compareFaces = async (imagePath, employeeId, info = {}) => {
    try {
        if (!imagePath) {
            return { success: false, similarity: 0, message: 'Không có ảnh để xác thực' };
        }

        const filePath = imagePath.startsWith('file://') ? imagePath.slice(7) : imagePath;
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
            return { success: false, similarity: 0, message: 'File ảnh không tồn tại trên thiết bị' };
        }

        const fileName = filePath.split('/').pop() || 'image.jpg';
        const uri = `file://${filePath}`;

        const formData = new FormData();
        formData.append('employeeId', String(employeeId));
        formData.append('projectCode', String(PROJECTCODE));
        formData.append('shopName', String(info.shopName || ''));
        formData.append('shopCode', String(info.shopCode || ''));
        formData.append('shopAddress', String(info.shopAddress || ''));
        formData.append('latitude', String(info.latitude || ''));
        formData.append('longitude', String(info.longitude || ''));
        formData.append('image', { uri, type: 'image/jpeg', name: fileName });
        //
        const response = await fetch('https://flask.spiral.com.vn/verify-byfile', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
        });
        const result = await response.json();
        console.log('[compareFaces]', result);
        if (!response.ok || result.error) {
            return {
                success: false,
                similarity: 0,
                pathSuccess: result.image_path,
                verifyTime: result.verifyTime,
                message: result.error || result.message || 'Xác thực thất bại',
            };
        }
        return {
            success: result.matched === true,
            similarity: result.score ?? 0,
            pathSuccess: result.image_path ?? null,
            verifyTime: result.verifyTime,
            message: result.message || 'Xác thực thành công',
        };
    } catch (_error) {
        console.log('[compareFaces] error', _error);
        return { success: false, similarity: 0, message: 'Hệ thống đang quá tải, vui lòng thử lại sau' };
    }
}

export const AI = { translateText, compareFaces }