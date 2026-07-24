import { toCurrency } from '../../../../Core/Utility';

export const ITEM_CODE_MAP = {
  C1: { tab: 'core', field: 'reportDate', type: 'date' },
  C2: { tab: 'core', field: 'productName', type: 'readonly' },
  C3: { tab: 'core', field: 'quantity', type: 'number' },
  C4: { tab: 'core', field: 'price', type: 'number' },
  C5: { tab: 'core', field: 'serial', type: 'text' },
  C6: { tab: 'customer', field: 'customer', type: 'text' },
  C7: { tab: 'customer', field: 'address', type: 'text' },
  C8: { tab: 'customer', field: 'phone', type: 'phone' },
};

export const getReportDateText = workDate => {
  const d = `${workDate || ''}`;
  if (d.length !== 8) return d || '-';
  return `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`;
};

export const getConfigItemsSorted = (dataInput = []) => {
  return [...dataInput].sort((a, b) => (a.Order || 0) - (b.Order || 0));
};

export const getConfigItemsByTab = (items = [], tab) => {
  return items.filter(item => ITEM_CODE_MAP[item.ItemCode]?.tab === tab);
};

export const getSummaryRowsFromConfig = ({
  configItemsSorted = [],
  reportDateText,
  selectedProduct,
  qtyValue,
  priceValue,
  formValues,
  dynamicValues,
}) => {
  const amountValue = qtyValue * priceValue;

  return configItemsSorted.map((item, index) => {
    const mapInfo = ITEM_CODE_MAP[item.ItemCode];

    if (mapInfo?.field === 'reportDate') {
      return {
        label: item.ItemName || 'Ngay bao cao',
        value: reportDateText || '-',
      };
    }
    if (mapInfo?.field === 'productName') {
      return {
        label: item.ItemName || 'San pham',
        value: selectedProduct?.productName || 'Chua chon',
      };
    }
    if (mapInfo?.field === 'quantity') {
      return {
        label: item.ItemName || 'So luong',
        value: qtyValue > 0 ? `${qtyValue}` : '0',
      };
    }
    if (mapInfo?.field === 'price') {
      return {
        label: item.ItemName || 'Gia',
        value: priceValue > 0 ? `${toCurrency(priceValue)} VND` : '0 VND',
      };
    }
    if (mapInfo?.field === 'serial') {
      return {
        label: item.ItemName || 'SERIAL/IMEI',
        value: formValues.serial || '-',
      };
    }
    if (mapInfo?.field === 'customer') {
      return {
        label: item.ItemName || 'Khach hang',
        value: formValues.customer || '-',
      };
    }
    if (mapInfo?.field === 'address') {
      return {
        label: item.ItemName || 'Dia chi',
        value: formValues.address || '-',
      };
    }
    if (mapInfo?.field === 'phone') {
      return {
        label: item.ItemName || 'So dien thoai',
        value: formValues.phone || '-',
      };
    }

    const dynamicKey = item.FieldKey || `dynamic_${index}`;
    const dynamicValue = dynamicValues[dynamicKey];
    return {
      label: item.ItemName || `Truong ${index + 1}`,
      value:
        dynamicValue !== undefined &&
        dynamicValue !== null &&
        `${dynamicValue}`.trim().length > 0
          ? `${dynamicValue}`
          : '-',
    };
  });
};

export const buildSellOutSaveItem = ({
  guiId,
  workinfo,
  selectedProduct,
  qty,
  price,
  formValues,
}) => {
  return {
    guiId,
    workId: workinfo.workId,
    shopId: workinfo.shopId,
    reportDate: workinfo.workDate,
    productId: selectedProduct.productId,
    productCode: selectedProduct.productCode,
    productName: selectedProduct.productName,
    division: selectedProduct.division,
    category: selectedProduct.category,
    categoryId: selectedProduct.categoryId,
    quantity: qty,
    price,
    amount: price * qty,
    serial: formValues.serial || null,
    IMEI2: formValues.IMEI2 || null,
    customer: formValues.customer || null,
    phone: formValues.phone || null,
    address: formValues.address || null,
    sellComment: formValues.sellComment || null,
    upload: 0,
  };
};
