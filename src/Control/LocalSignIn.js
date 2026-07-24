import TouchID from 'react-native-touch-id';
const isFACEID = 1,
  isTOUCHID = 2,
  isEMPTY = 0,
  LOCALSECUIRY = 'LOCAL-SEC';
export const SERCURITY = { isFACEID, isTOUCHID, isEMPTY, LOCALSECUIRY };
const optionalConfigObject = {
  title: 'Xác thực bảo mật', // Android
  imageColor: '#e00606', // Android
  imageErrorColor: '#ff0000', // Android
  sensorDescription: 'Đặt vân tay xác thực', // Android
  sensorErrorDescription: 'Lỗi xác thực', // Android
  cancelText: 'Hủy', // Android
  fallbackLabel: 'Sử dụng mật khẩu điện thoại', // iOS (if empty, then label is hidden)
  unifiedErrors: true, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};
const isSupportID = actionResult => {
  const optionalConfigObject = {
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false, // if true is passed, itwill allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
  };
  TouchID.isSupported(optionalConfigObject)
    .then(biometryType => {
      // Success code
      if (biometryType === 'FaceID') {
        actionResult(isFACEID);
      } else {
        actionResult(isTOUCHID);
      }
    })
    .catch(error => {
      // Failure code
      actionResult(isEMPTY);
    });
};
const onAuthenticateID = async actionResult => {
  await TouchID.authenticate('Xác thực vân tay', optionalConfigObject)
    .then(() => {
      actionResult(1);
    })
    .catch(e => {
      actionResult(e);
    });
};
export const LocalSignIn = { isSupportID, onAuthenticateID };
