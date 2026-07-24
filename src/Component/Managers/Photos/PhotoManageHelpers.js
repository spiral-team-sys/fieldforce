import moment from 'moment';
import { URLDEFAULT } from '../../../Core/URLs';

export const isRemotePath = (path = '') =>
  path.startsWith('http://') || path.startsWith('https://');
export const isLocalPath = (path = '') => path.startsWith('file://');
export const isUploaded = item => Number(item?.fileUpload) === 1;

export const getUploadedPhotoPath = (item = {}) => {
  const path = item?.photoPath || '';
  if (!path) return '';
  if (path.includes('uploaded')) return `${URLDEFAULT}${path}`;

  const normalizedPath = decodeURIComponent(path.split('?')[0] || '');
  const fileName = normalizedPath.substring(
    normalizedPath.lastIndexOf('/') + 1,
  );
  if (!fileName || !item?.photoDate) return path;

  return `${URLDEFAULT}/uploaded/${item.photoDate}/${fileName}`;
};

export const getPhotoUri = (item = {}) => {
  const path = item?.photoPath || '';
  if (!path) return '';
  if (isRemotePath(path)) return path;
  if (isUploaded(item)) return getUploadedPhotoPath(item);
  if (path.includes('uploaded')) return `${URLDEFAULT}${path}`;
  return path;
};

export const getReportName = (item, reportNameMap = {}) => {
  if (item?.reportId === 1) {
    const inOut =
      item?.photoType?.toString() === '0'
        ? 'Vào ca'
        : item?.photoType?.toString() === '1'
        ? 'Ra ca'
        : `Loại ${item?.photoType}`;
    return `Chấm công - ${inOut}`;
  }
  if (item?.reportId === -1) return 'Tổng quan cửa hàng';
  const reportName = reportNameMap[item?.reportId];
  return reportName || `Báo cáo #${item?.reportId || 0}`;
};

export const getPhotoTime = item => {
  if (item?.photoFullTime) {
    const full = moment(
      item.photoFullTime,
      ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601],
      true,
    );
    if (full.isValid()) return full.format('HH:mm:ss');
  }

  if (item?.photoDate && item?.photoTime) {
    const fromFields = moment(
      `${item.photoDate}${item.photoTime}`,
      'YYYYMMDDx',
      true,
    );
    if (fromFields.isValid()) return fromFields.format('HH:mm:ss');
  }

  if (item?.photoDate) {
    const fromDate = moment(`${item.photoDate}`, 'YYYYMMDD', true);
    if (fromDate.isValid()) return `${fromDate.format('DD/MM/YYYY')} --:--:--`;
  }

  return 'Không rõ thời gian';
};
