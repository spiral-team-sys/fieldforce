export const REQUEST_TYPES = [
  { value: 'OPEN', label: 'Open Store' },
  { value: 'UPDATE', label: 'Update Store' },
  { value: 'CLOSE', label: 'Close Store' },
];

export const STATUS_COLORS = {
  'Waiting Manager': 'warning',
  'Waiting Admin': 'info',
  'Waitting Manager': 'warning',
  'Waitting Admin': 'info',
  'Chờ Quản lí Xác nhận': 'warning',
  'Chờ Admin xác nhận': 'info',
  Completed: 'success',
  ManagerRejected: 'red',
  AdminRejected: 'red',
  Rejected: 'red',
};

export const REQUEST_TYPE_LABELS = {
  OPEN: 'Tạo mới',
  UPDATE: 'Cập nhật',
  CLOSE: 'Đóng cửa hàng',
};

export const STATUS_LABELS = {
  1: 'Completed',
  2: 'Waitting Admin',
  3: 'Waitting Manager',
  [-1]: 'ManagerRejected',
  [-2]: 'AdminRejected',
};

export const safeParseJson = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (_e) {
    return fallback;
  }
};

export const normalizeMaster = (dataMaster = []) => {
  const master = safeParseJson(
    dataMaster,
    Array.isArray(dataMaster) ? dataMaster : [],
  );
  return [...(master || [])].sort((a, b) => (a.Order || 0) - (b.Order || 0));
};

export const getRequestGuid = request => {
  return request?.guid || request?.Guid;
};

export const getRequestDataJson = request => {
  return safeParseJson(request?.dataJson || request?.DataJson || {}, {});
};

export const getRequestPhotos = request => {
  return safeParseJson(
    request?.photoList || request?.PhotoList || request?.PhotoJson || [],
    [],
  );
};

export const buildPhotoMap = (photos = []) => {
  const photoMap = {};
  (photos || []).forEach(photo => {
    const photoType = photo.PhotoType || photo.photoType;
    if (!photoType) return;
    if (!photoMap[photoType]) photoMap[photoType] = [];
    photoMap[photoType].push(photo);
  });
  return photoMap;
};

export const hasPhotoValue = (photoMap, refName) => {
  const photos = photoMap?.[refName];
  if (Array.isArray(photos)) return photos.length > 0;
  const photo = photos;
  const value = photo?.PhotoPath || photo?.photoPath || null;
  return value !== null && value !== undefined && value !== '';
};

export const getSelectedOptions = item => {
  const data = item.DataItem || [];
  const list = safeParseJson(data, Array.isArray(data) ? data : []);
  return (list || []).map(option => ({
    ...option,
    itemName: option.itemName,
    itemValue: option.itemValue,
    itemCode: option.itemCode,
  }));
};

export const getSelectedValue = item => {
  return item?.itemId;
};

export const getSelectedLabel = item => {
  return item?.itemName || '';
};

export const getListData = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const isSuccessResponse = response => {
  return response?.statusId === 200 || response?.status === 200;
};
