import moment from 'moment';
import _ from 'lodash';

// Extract province from address string
export const extractProvinceFromAddress = address => {
  if (!address) return 'N/A';
  const addressParts = address.split(',').map(part => part.trim());
  return addressParts.length > 0
    ? addressParts[addressParts.length - 1]
    : 'N/A';
};

// Get value from dataReport array by KeyValue
export const getValueByKey = (dataReport, keyValue) => {
  const item = dataReport.find(d => d.KeyValue === keyValue);
  return item ? item.Value : '';
};
export const getValueByItem = (
  dataReport,
  keyValue,
  defaultValue = 'Value',
) => {
  const item = dataReport.find(d => d.KeyValue === keyValue);
  return item ? item[defaultValue] : '';
};

// Parse JSON array safely
export const parseArray = value => {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
};

// Get display value from raw report value (handles arrays, JSON strings, primitives)
export const getDisplayValue = rawValue => {
  const toValueString = valueList => {
    return valueList
      .map(valueItem => {
        if (_.isObject(valueItem)) return valueItem?.Value;
        return valueItem;
      })
      .filter(
        valueItem =>
          valueItem !== null &&
          valueItem !== undefined &&
          `${valueItem}`.trim() !== '',
      )
      .join(', ');
  };

  if (Array.isArray(rawValue)) {
    return toValueString(rawValue) || '-';
  }

  if (typeof rawValue === 'string') {
    const textValue = rawValue.trim();
    if (textValue.startsWith('[') && textValue.endsWith(']')) {
      try {
        const valueArray = JSON.parse(textValue);
        if (Array.isArray(valueArray)) {
          return toValueString(valueArray) || '-';
        }
      } catch (error) {}
    }
    return textValue || '-';
  }

  if (
    rawValue === null ||
    rawValue === undefined ||
    `${rawValue}`.trim() === ''
  ) {
    return '-';
  }

  return `${rawValue}`;
};

// Build structured report payload from a raw report item
export const formatReportPayload = item => {
  const dataReport = JSON.parse(item.dataReport || '[]');
  const customerName = getValueByKey(dataReport, 'customerName') || 'N/A';
  const phoneNumber = getValueByKey(dataReport, 'phoneNumber') || 'N/A';
  const address = getValueByKey(dataReport, 'address') || 'N/A';
  const distance = getValueByKey(dataReport, 'distance') || 'N/A';
  const purchasedProduct =
    getValueByKey(dataReport, 'purchasedProduct') || 'N/A';
  const salespersonName = getValueByKey(dataReport, 'salespersonName') || 'N/A';
  const purchaseDate = getValueByKey(dataReport, 'purchaseDate') || 'N/A';
  const age = getValueByKey(dataReport, 'age') || 'N/A';
  const occupation = getValueByKey(dataReport, 'occupation') || 'N/A';
  const estimatedIncome = getValueByKey(dataReport, 'estimatedIncome') || 'N/A';
  const description = getValueByKey(dataReport, 'description') || 'N/A';
  const hashtag =
    `${getValueByKey(dataReport, 'hashtag') || '#Homevisit'}`
      .replace(/,/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '#Homevisit';
  const houseType = getValueByKey(dataReport, 'houseType') || 'N/A';
  const customerNote = getValueByKey(dataReport, 'customerNote') || 'N/A';
  const customerPurchaseJourney =
    getValueByKey(dataReport, 'customerPurchaseJourney') || '';
  const currentHomeAppliancesStatus =
    getValueByKey(dataReport, 'currentHomeAppliancesStatus') || '';

  const province = getValueByItem(dataReport, 'address', 'Province') || 'N/A';
  const region = getValueByItem(dataReport, 'address', 'Area') || 'N/A';
  const reportDate = item.createdDate
    ? moment(item.createdDate).format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD');

  const journeyList = parseArray(customerPurchaseJourney)
    .map(a => `${a?.ItemName}: ${a?.Value}` || 'N/A')
    .filter(j => j !== null && j !== undefined && `${j}`.trim() !== '');

  const appliancesList = parseArray(currentHomeAppliancesStatus)
    .map(a => `${a?.ItemName}: ${a?.Value}` || 'N/A')
    .filter(a => a !== null && a !== undefined && `${a}`.trim() !== '');

  return {
    header: { gtmRegion: region, province, reportDate, hashtag },
    customerInfo: { customerName, phoneNumber, address, houseType, distance },
    purchaseInfo: {
      purchasedProduct,
      shopName: item.shopName || 'N/A',
      shopCode: item.shopCode || 'N/A',
      salespersonName,
      purchaseDate,
    },
    customerPortrait: { age, occupation, estimatedIncome, description },
    purchaseJourney: journeyList,
    customerVOC: customerNote,
    homeAppliancesStatus: appliancesList,
    reporter: item.createdBy || 'N/A',
  };
};

// Format report as text template
export const formatReportTemplate = item => {
  const payload = formatReportPayload(item);
  const journeyText =
    payload.purchaseJourney.length > 0
      ? payload.purchaseJourney.join('\n')
      : 'N/A';
  const appliancesText =
    payload.homeAppliancesStatus.length > 0
      ? payload.homeAppliancesStatus.join('\n')
      : 'N/A';

  return `GTM + ${payload.header.gtmRegion} - BÁO CÁO HOME VISIT
Khu vực: ${payload.header.province} | Ngày: ${payload.header.reportDate} - Khảo sát người dùng
${payload.header.hashtag}
═══════════════════════════════════════

1. THÔNG TIN KHÁCH HÀNG
- Khách hàng: ${payload.customerInfo.customerName}
- Điện thoại: ${payload.customerInfo.phoneNumber}
- Địa chỉ: ${payload.customerInfo.address}
- Loại nhà: ${payload.customerInfo.houseType}
- Khoảng cách từ shop: ${payload.customerInfo.distance}

2. THÔNG TIN MUA HÀNG
- Sản phẩm mua: ${payload.purchaseInfo.purchasedProduct}
- Nơi mua: ${payload.purchaseInfo.shopName}
- NV bán hàng: ${payload.purchaseInfo.salespersonName}
- Ngày mua: ${payload.purchaseInfo.purchaseDate}

3. CHÂN DUNG KHÁCH HÀNG
- Độ tuổi: ${payload.customerPortrait.age}
- Nghề nghiệp: ${payload.customerPortrait.occupation}
- Thu nhập (Ước tính): ${payload.customerPortrait.estimatedIncome}
- Mô tả thêm: ${payload.customerPortrait.description}

4. HÀNH TRÌNH MUA HÀNG
${journeyText}

5. Ý KIẾN / CẢM NHẬN CỦA KHÁCH HÀNG SAU SỬ DỤNG
${payload.customerVOC}

6. HIỆN TRẠNG THIẾT BỊ TẠI GIA
${appliancesText}

Người báo cáo: ${payload.reporter}`;
};

// Serialize template to JSON string (for safe transfer) then parse back
export const formatReportTemplateJsonString = item =>
  JSON.stringify(formatReportTemplate(item));

export const parseReportTemplateJsonString = (templateJsonString = '') => {
  try {
    return JSON.parse(templateJsonString);
  } catch {
    return templateJsonString || '';
  }
};
