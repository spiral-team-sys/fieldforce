import Moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { ToastAndroid, Platform, Alert, Dimensions } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { URLDEFAULT } from './URLs';
import base64 from 'react-native-base64';
import utf8 from 'utf8';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
let RNFS = require('react-native-fs');

export const insets = () => {
  const info = useSafeAreaInsets();
  return info;
};
export const imageSize = { width: 1080, height: 1920 };
export const deviceHeight = Dimensions.get('window').height;
export const deviceWidth = Dimensions.get('window').width;

export const unicodeToBase64 = str => {
  const bytes = utf8.encode(str);
  const encoded = base64.encode(bytes);
  return encoded;
};
export const base64ToUnicode = base64Str => {
  const bytes = base64.decode(base64Str);
  const decoded = utf8.decode(bytes);
  return decoded;
};
export function minWidthTab(data) {
  var width = 0;
  data == undefined || data == null
    ? (width = deviceHeight)
    : (width =
        data?.length > 4
          ? deviceWidth / 5
          : data?.length > 0 && data?.length < 5
          ? deviceWidth / data?.length
          : 0);
  return width;
}
export function removeAccents(str) {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D') || null
  );
}
export const TODAY = parseInt(Moment(new Date()).format('YYYYMMDD'));
export function DateFromInt(date) {
  let resultdate = Moment(date, 'YYYYMMDD');
  return Moment(resultdate).format('DD/MM/YYYY');
}
export function ConvertDateFromInt(date, in_format, out_format) {
  let resultdate = Moment(date, in_format);
  return Moment(resultdate).format(out_format);
}
export function ConvertToInt(str) {
  const regex = /,/gi;
  let strNumb = str + '';
  let numb = strNumb.replace(regex, '');
  return parseInt(numb);
}
export async function checkNetwork() {
  const check = await NetInfo.fetch();
  return check.isConnected;
  // return await (check.isConnected && check.isInternetReachable);
}
export async function isNetworkConnection() {
  const check = await NetInfo.fetch();
  return await check.isConnected;
}
export async function alertPrint(item, note) {
  alert(
    note !== undefined
      ? note + ' ' + JSON.stringify(item)
      : JSON.stringify(item),
  );
}
export function checkDateReport(workDate, status) {
  let res = true;
  if (parseInt(Moment(Date()).format('YYYYMMDD')) === workDate) {
    res = status === 0 ? true : false;
  } else {
    res = false;
  }

  // alert(res)
  return res;
}
export const ConvertSecondToTime = second => {
  let minutes = second / 60; // Tổng số phút
  let hours = Math.floor(minutes / 60); //Số giờ
  minutes = Math.floor(minutes % 60); // số phút còn lại
  return `${hours}h:${minutes}'`;
};
export function alertToast(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.CENTER);
  } else {
    // Alert.alert(message);
  }
}
export function alertToastThread(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.CENTER);
  } else {
  }
}
export function alertNotify(message) {
  Alert.alert('Thông báo', message);
}
export function alertConfirm(
  title,
  message,
  actionYes,
  actionNo,
  titleYes = 'Có',
  titleNo = 'Không',
) {
  Alert.alert(title, message, [
    { text: titleNo, onPress: actionNo },
    { text: titleYes, onPress: actionYes },
  ]);
}
export function alertError(message) {
  Alert.alert('Lỗi', message);
}
export function alertWarning(message) {
  Alert.alert('Chú ý', message);
}
export function optionConfirm(title, message, options) {
  Alert.alert(title, message, options);
}
export function Capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
const getDocumentFileName = fileInfo => {
  const fileName = fileInfo?.FileName || '';
  const fileType = fileInfo?.FileType || '';
  return fileType && !fileName.endsWith(fileType)
    ? `${fileName}${fileType}`
    : fileName;
};
const getDocumentDownloadPath = fileInfo => {
  const directoryPath =
    Platform.OS === 'android' && RNFS.DownloadDirectoryPath
      ? RNFS.DownloadDirectoryPath
      : RNFS.DocumentDirectoryPath;
  return `${directoryPath}/${getDocumentFileName(fileInfo)}`;
};
const getDocumentDownloadUrl = url => {
  return url?.includes('http') ? url : URLDEFAULT + url;
};
export const checkFileExist = async fileInfo => {
  try {
    if (!fileInfo) {
      return false;
    }
    const path = getDocumentDownloadPath(fileInfo);
    const isExists = await RNFS.exists(path);
    if (isExists) {
      return { status: true, path };
    }
    const oldPath = `${RNFS.DocumentDirectoryPath}/${getDocumentFileName(
      fileInfo,
    )}`;
    const isOldPathExists = await RNFS.exists(oldPath);
    return { status: isOldPathExists, path: oldPath };
  } catch (e) {
    //console.log(e)
    return { status: false };
  }
};
export const openFileViewer = (
  localPath,
  actionBack,
  isNotify = true,
  actionFalse,
) => {
  FileViewer.open(localPath, {
    showOpenWithDialog: true,
    showAppsSuggestions: true,
    onDismiss: actionBack,
  })
    .then(value => {
      console.log(value);
    })
    .catch(err => {
      if (isNotify) {
        alertError('Lỗi mở file:', err);
      } else {
        console.log('Lỗi mở file:', err);
        actionFalse();
      }
    });
};
export const downloadFile = async fileInfo => {
  try {
    if (!fileInfo) {
      return false;
    }
    const path = getDocumentDownloadPath(fileInfo);
    const fromUrl = encodeURI(getDocumentDownloadUrl(fileInfo.Url));
    console.log(fromUrl);
    console.log(path, 'path');
    const isExists = await RNFS.exists(path);
    let status = true;
    if (!isExists) {
      const downloadOptions = {
        fromUrl,
        toFile: path,
        background: true,
      };
      if (Platform.OS === 'android' && RNFS.DownloadDirectoryPath) {
        downloadOptions.addAndroidDownloads = {
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: getDocumentFileName(fileInfo),
          path,
        };
      }
      const result = await RNFS.downloadFile(downloadOptions).promise;
      status = result?.statusCode === 200;
    }
    return { status, path };
  } catch (e) {
    console.log('Document Error: ' + e);
    return { status: false };
  }
};

export const onValidPassword = dataPassword => {
  const { oldPassword, newPassword, confirmNewPassword } = dataPassword || {};
  if (!oldPassword) {
    alertWarning('Mật khẩu cũ không được để trống!');
    return false;
  }
  if (!newPassword) {
    alertWarning('Mật khẩu mới không được để trống!');
    return false;
  }
  if (newPassword !== confirmNewPassword) {
    alertWarning('Mật khẩu xác nhận không khớp với mật khẩu mới!');
    return false;
  }
  const regCheck =
    /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9\!\@\#\$\%\^\&\*\~\,\.\(\)\-]{8,}$/g;
  if (!regCheck.test(newPassword)) {
    alertWarning('Mật khẩu phải có chữ cái, chữ số và phải tối thiểu 8 ký tự!');
    return false;
  }
  return true;
};

export const onValidPhoneNumber = (phoneNumber, isRule = false) => {
  if (isRule) {
    const regexPhoneFormat = /\((84|0[1-9]{3})\)+\ +([0-9]{3})\ +([0-9]{3})/g;
    if (!regexPhoneFormat.test(phoneNumber)) {
      return 'Số điện thoại không đúng định dạng';
    }
  } else {
    const regexPhone = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!regexPhone.test(phoneNumber)) {
      return 'Số điện thoại không đúng định dạng';
    }
  }
  return null;
};
export const removeDuplicate = (array, key) => {
  const unique = array.reduce((accumulator, current) => {
    if (!accumulator.some(x => x[key] === current[key])) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);
  return unique;
};
export const countDuplicate = (array, key) => {
  var map = array.reduce(function (prev, cur) {
    prev[cur[key]] = (prev[cur[key]] || 0) + 1;
    return prev;
  }, {});
  return map;
};
export const toCurrency = number => {
  if (!number) return '';
  return number
    .toString()
    .match(/[0-9]/g)
    .join('')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const isValid = valueCheck => {
  if (!isNaN(Number(valueCheck))) {
    return valueCheck !== undefined && valueCheck !== null && valueCheck !== '';
  } else {
    return (
      valueCheck !== undefined && valueCheck !== null && valueCheck.length > 0
    );
  }
};
export const findFirstLetterPosition = str => {
  // Tìm vị trí của chữ cái đầu tiên trong chuỗi
  for (let i = 0; i < str.length; i++) {
    if (/[a-zA-Z]/.test(str[i])) {
      return i;
    }
  }
  // Trả về -1 nếu không tìm thấy chữ cái
  return -1;
};
export const containsSpecialCharacters = str => {
  const specialCharRegex = /[^a-zA-Z0-9]/g;
  return specialCharRegex.test(str);
};
export const isFloat = value => {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    !Number.isInteger(value)
  );
};

export const checkUrlExists = async url => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
export const ERROR_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            text-align: center;
            padding: 20px;
        }
        .error-icon {
            font-size: 48px;
            color: #ff4444;
            margin-bottom: 20px;
        }
        .error-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
        }
        .error-message {
            font-size: 16px;
            color: #666;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="error-icon">⚠️</div>
    <h1 class="error-title">Không tìm thấy trang</h1>
    <p class="error-message">URL không hợp lệ hoặc trang không tồn tại.</p>
</body>
</html>
`;
