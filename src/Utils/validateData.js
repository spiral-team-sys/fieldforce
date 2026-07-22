import { toastError } from "./configToast";

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const isValidPassword = (password = null) => {
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    // return passwordRegex.test(password);
    const passwordValue = password?.trim()
    return passwordValue !== null && passwordValue?.length > 0
};
export const isValidChangePassword = (password = null) => {
    var passwordRegex = /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W])/;
    return passwordRegex.test(password);
};
export const isValidUsername = (username = null) => {
    // const usernameRegex = /^\w{3,}$/;
    // return username !== null && usernameRegex.test(username);
    const userValue = username?.trim()
    return userValue !== null && userValue?.length > 0
};
export const isTermsAgreed = (isAgreed) => {
    return isAgreed === true;
};
//
export const isValidData = (data = []) => {
    return data !== null && data.length > 0
}
export const isValidObject = (object = {}) => {
    return object !== null && Object.keys(object).length > 0
}
export const isValidField = (text = null) => {
    return text !== undefined && text !== null && text.trim().length > 0;
};
export const isValidBoolean = (boolean = null) => {
    return boolean !== null && boolean !== undefined
}
export const isValidNumber = (number = null) => {
    return number !== null
}
export const isValidCoordinate = (latitude, longitude) => {
    let error = null;
    if (!isValidNumber(latitude)) {
        error = 'Không có dữ liệu latitude';
        return error;
    }
    if (typeof latitude !== 'number') {
        error = "Định dạng latitude không đúng";
        return error
    }
    // 
    if (!isValidNumber(longitude)) {
        error = 'Không có dữ liệu longitude';
        return error;
    }
    if (typeof longitude !== 'number') {
        error = "Định dạng longitude không đúng";
        return error
    }
    return error;
};
//
export const validateLoginData = (username, password, isConfirmPolicy) => {
    const errors = {};
    if (!isValidUsername(username)) {
        errors.username = 'Tên đăng nhập phải dài ít nhất 3 ký tự và chỉ chứa chữ cái, số, hoặc dấu gạch dưới.';
    }
    if (!isValidPassword(password)) {
        errors.password = 'Mật khẩu không được để trống';
    }
    if (!isTermsAgreed(isConfirmPolicy)) {
        const terms = 'Bạn phải đồng ý với điều khoản và điều kiện.'
        errors.terms = terms
        toastError('Điều khoản và điều kiện', terms)
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
export const validateForgotPasswordData = (username, email) => {
    const errors = {};
    if (!isValidUsername(username)) {
        errors.username = 'Tên đăng nhập phải dài ít nhất 3 ký tự và chỉ chứa chữ cái, số, hoặc dấu gạch dưới.';
    }
    if (!isValidEmail(email)) {
        errors.email = 'Email chưa đúng định dạng, Vui lòng kiểm tra lại.';
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validTime = (selected) => {
    const date = new Date();
    const currentHour = date.getHours();
    const currentMinutes = date.getMinutes();

    const validSelected = selected.filter((time) => {
        const [selectedHour, selectedMinute = 0] = time.split(':').map(Number);
        if (selectedHour < currentHour) {
            return true;
        }
        if (selectedHour === currentHour && selectedMinute < currentMinutes) {
            return true;
        }
        return false;
    });

    return validSelected;
};
