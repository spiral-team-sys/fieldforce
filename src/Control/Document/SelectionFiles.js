import {
  pick,
  types,
  isCancel,
  keepLocalCopy,
} from '@react-native-documents/picker';
import { toastError } from '../../Utils/configToast';
import _ from 'lodash';

const formatFileSize = bytes => {
  if (!bytes || bytes === 0) return '0 KB';

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(0)} MB`;
};
const getNameFileType = type => {
  switch (type) {
    case types.pdf:
      return 'pdf';
    case 'image/jpg':
    case 'image/png':
    case 'image/jpeg':
      return 'image';
    default:
      return type;
  }
};

const selectionFiles = async actionResult => {
  try {
    const pickedFiles = await pick({
      type: [types.pdf, types.images],
      allowMultiSelection: true,
    });
    // Kiem tra tên file (không check extension)
    const validFiles = pickedFiles.filter(f => {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '');
      return !/[^a-zA-Z0-9_\-]/.test(nameWithoutExt);
    });

    const invalidFiles = pickedFiles.filter(f => {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '');
      return /[^a-zA-Z0-9_\-]/.test(nameWithoutExt);
    });

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ');
      toastError(
        'Cảnh báo',
        `Đã loại bỏ ${invalidFiles.length} file không hợp lệ (chứa dấu/khoảng trắng): ${invalidNames}`,
      );
    }

    if (validFiles.length === 0) {
      toastError('Lỗi dữ liệu', 'Không có file hợp lệ nào được chọn.');
      return;
    }
    //
    const copyResults = await keepLocalCopy({
      files: validFiles.map(f => ({
        uri: f.uri,
        type: f.type,
        fileName: f.name ?? 'noname',
      })),
      destination: 'documentDirectory',
    });
    //
    const files = validFiles.map((file, index) => ({
      name: file.name,
      type: file.type,
      fileType: getNameFileType(file.type),
      size: formatFileSize(file.size),
      uri: copyResults[index]?.localUri,
    }));

    actionResult && actionResult(files);
  } catch (err) {
    if (isCancel(err)) {
      console.log('User cancelled');
    } else {
      toastError('Lỗi dữ liệu', `${err}`);
    }
  }
};

export const SELECTION = { selectionFiles, formatFileSize };
