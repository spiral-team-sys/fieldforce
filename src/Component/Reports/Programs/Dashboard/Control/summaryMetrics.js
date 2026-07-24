const getNumber = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const normalize = value.replace(/,/g, '').replace(/\s/g, '');
    if (!normalize.length) return 0;
    const parsed = Number(normalize);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getRows = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (payload && typeof payload === 'object') return [payload];
  return [];
};

const getString = value => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const pickFirst = (row, keys = []) => {
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = getString(row?.[key]);
    if (value) return value;
  }
  return '';
};

const countUniqueByAliases = (rows = [], aliases = []) => {
  const uniqueValues = new Set();
  rows.forEach(row => {
    for (let i = 0; i < aliases.length; i += 1) {
      const alias = aliases[i];
      const value = row?.[alias];
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ''
      ) {
        uniqueValues.add(String(value).trim());
        break;
      }
    }
  });
  return uniqueValues.size;
};

const countUniqueByKey = (rows = [], key) => {
  if (!key) return 0;
  const uniqueValues = new Set();
  rows.forEach(row => {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      uniqueValues.add(String(value).trim());
    }
  });
  return uniqueValues.size;
};

const findNumericByAliases = (rows = [], aliases = []) => {
  let total = 0;
  rows.forEach(row => {
    aliases.forEach(alias => {
      const value = getNumber(row?.[alias]);
      if (value > 0) total += value;
    });
  });
  return total;
};

const countByPredicate = (rows = [], predicate) => {
  return rows.reduce((sum, row) => (predicate(row) ? sum + 1 : sum), 0);
};

export const getMetricData = payload => {
  const rows = getRows(payload);

  const registerPassKeys = [
    'registerPass',
    'totalRegisterPass',
    'registeredProgram',
    'totalRegistered',
    'daDangKy',
    'dangKyDat',
  ];
  const registerFailKeys = [
    'registerFail',
    'totalRegisterFail',
    'unRegisteredProgram',
    'totalUnregistered',
    'chuaDangKy',
    'dangKyRot',
  ];
  const registerTotalKeys = [
    'registerTotal',
    'totalRegister',
    'totalProgramRegister',
    'tongDangKy',
    'totalProgram',
  ];

  const billPassKeys = [
    'billPass',
    'totalBillPass',
    'invoicePass',
    'totalInvoicePass',
    'hoaDonDat',
    'hoadonPass',
  ];
  const billFailKeys = [
    'billFail',
    'totalBillFail',
    'invoiceFail',
    'totalInvoiceFail',
    'hoaDonRot',
    'hoadonFail',
  ];

  const resultPassKeys = [
    'resultPass',
    'totalResultPass',
    'programPass',
    'totalProgramPass',
    'cuaHangDat',
    'statusResultPass',
  ];
  const resultFailKeys = [
    'resultFail',
    'totalResultFail',
    'programFail',
    'totalProgramFail',
    'cuaHangRot',
    'statusResultFail',
  ];

  let registerPass = findNumericByAliases(rows, registerPassKeys);
  let registerFail = findNumericByAliases(rows, registerFailKeys);
  let registerTotal = findNumericByAliases(rows, registerTotalKeys);

  let billPass = findNumericByAliases(rows, billPassKeys);
  let billFail = findNumericByAliases(rows, billFailKeys);

  let resultPass = findNumericByAliases(rows, resultPassKeys);
  let resultFail = findNumericByAliases(rows, resultFailKeys);

  if (!resultPass && !resultFail) {
    resultPass = countByPredicate(rows, row => Number(row?.statusResult) === 1);
    resultFail = countByPredicate(rows, row => Number(row?.statusResult) === 0);
  }

  if (!billPass && !billFail) {
    billPass = countByPredicate(rows, row => {
      const status = Number(row?.billStatus);
      const statusName = (row?.billStatusName || row?.billConfirmName || '')
        .toString()
        .toLowerCase();
      return status === 1 || /pass|success|dat|duyet/.test(statusName);
    });
    billFail = countByPredicate(rows, row => {
      const status = Number(row?.billStatus);
      const statusName = (row?.billStatusName || row?.billConfirmName || '')
        .toString()
        .toLowerCase();
      return (
        status === 0 ||
        status === 2 ||
        /fail|reject|rot|khongdat/.test(statusName)
      );
    });
  }

  if (!registerPass && !registerFail) {
    registerPass = countByPredicate(rows, row => {
      const val =
        row?.confirmStatus || row?.registerStatus || row?.statusName || '';
      return /dang ky|da dang ky|approved|success|dat/i.test(String(val));
    });
    registerFail = countByPredicate(rows, row => {
      const val =
        row?.confirmStatus || row?.registerStatus || row?.statusName || '';
      return /chua dang ky|reject|fail|pending|rot|khongdat/i.test(String(val));
    });
  }

  if (!registerTotal) {
    const uniqueProgram = new Set(
      rows
        .map(row => row?.programId)
        .filter(v => v !== null && v !== undefined),
    );
    registerTotal =
      uniqueProgram.size > 0 ? uniqueProgram.size : registerPass + registerFail;
  }

  const shopTotal = countUniqueByKey(rows, 'shopId');
  const dealerTotal = countUniqueByKey(rows, 'dealerCode');
  const programTotal = countUniqueByKey(rows, 'programId');

  return {
    shopTotal,
    dealerTotal,
    programTotal,
    registerPass,
    registerFail,
    registerTotal,
    billPass,
    billFail,
    resultPass,
    resultFail,
  };
};

export const SUMMARY_SORT_OPTIONS = {
  EMPLOYEE: 'EMPLOYEE',
  SHOP: 'SHOP',
  PROGRAM: 'PROGRAM',
};

export const getSummaryListData = (
  payload,
  sortBy = SUMMARY_SORT_OPTIONS.EMPLOYEE,
) => {
  const rows = getRows(payload);

  const list = rows.map((row, index) => {
    const employeeName =
      pickFirst(row, [
        'employeeName',
        'staffName',
        'fullName',
        'userName',
        'employee',
      ]) || 'Chưa có NV';
    const shopName =
      pickFirst(row, ['shopName', 'storeName', 'outletName', 'shop']) ||
      'Chưa có shop';
    const programName =
      pickFirst(row, [
        'programName',
        'displayName',
        'programTypeName',
        'program',
      ]) || 'Chưa có chương trình';

    const employeeCode = pickFirst(row, [
      'employeeCode',
      'staffCode',
      'userCode',
    ]);
    const shopCode = pickFirst(row, ['shopCode', 'storeCode', 'outletCode']);
    const status = pickFirst(row, [
      'confirmStatus',
      'statusName',
      'billStatusName',
      'billConfirmName',
    ]);

    return {
      id: `${index}-${employeeName}-${shopName}-${programName}`,
      employeeName,
      employeeCode,
      shopName,
      shopCode,
      programName,
      status,
    };
  });

  const sortMap = {
    [SUMMARY_SORT_OPTIONS.EMPLOYEE]: item =>
      `${item.employeeName} ${item.shopName} ${item.programName}`,
    [SUMMARY_SORT_OPTIONS.SHOP]: item =>
      `${item.shopName} ${item.employeeName} ${item.programName}`,
    [SUMMARY_SORT_OPTIONS.PROGRAM]: item =>
      `${item.programName} ${item.shopName} ${item.employeeName}`,
  };

  const sorter = sortMap[sortBy] || sortMap[SUMMARY_SORT_OPTIONS.EMPLOYEE];

  return [...list].sort((a, b) =>
    sorter(a).localeCompare(sorter(b), 'vi', { sensitivity: 'base' }),
  );
};
