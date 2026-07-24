const getString = value => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const getNumber = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').replace(/\s/g, '');
    if (!normalized.length) return 0;
    const parsed = Number(normalized);
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

const normalizeTypeData = value =>
  getString(value).toUpperCase().replace(/\s+/g, '_');

const pickFirstText = (row, aliases = [], fallback = '') => {
  for (let i = 0; i < aliases.length; i += 1) {
    const value = getString(row?.[aliases[i]]);
    if (value) return value;
  }
  return fallback;
};

const pickFirstNumber = (row, aliases = []) => {
  for (let i = 0; i < aliases.length; i += 1) {
    const value = getNumber(row?.[aliases[i]]);
    if (value || value === 0) return value;
  }
  return 0;
};

export const SALE_SORT_OPTIONS = {
  SHOP: 'SHOP',
  DISTRIBUTOR: 'DISTRIBUTOR',
  PROGRAM: 'PROGRAM',
};

export const SALE_STATUS_OPTIONS = {
  ALL: 'ALL',
  PASS: 'PASS',
  FAIL: 'FAIL',
};

export const DEFAULT_SALE_FILTER_SORT = {
  keyword: '',
  status: SALE_STATUS_OPTIONS.ALL,
  sortBy: SALE_SORT_OPTIONS.SHOP,
};

export const getTypeDataRows = (payload, typeData = '') => {
  const rows = getRows(payload);
  const types = Array.isArray(typeData) ? typeData : [typeData];
  const normalizedTypes = types
    .map(item => normalizeTypeData(item))
    .filter(Boolean);

  if (!normalizedTypes.length) return rows;

  return rows.filter(row =>
    normalizedTypes.includes(
      normalizeTypeData(
        row?.typeData || row?.TypeData || row?.type || row?.Type,
      ),
    ),
  );
};

export const getSaleRows = payload => {
  return getTypeDataRows(payload, 'SALE');
};

export const isSalePassRow = row => {
  const actualSale = pickFirstNumber(row, ['actual']);
  const targetSale = pickFirstNumber(row, ['target']);
  const completionPercent =
    actualSale > 0 && targetSale > 0 ? (actualSale / targetSale) * 100 : 0;

  if (targetSale > 0) return actualSale >= targetSale;
  return completionPercent >= 100;
};

export const isSaleFailRow = row => !isSalePassRow(row);

export const applySaleFilterSort = (
  payload,
  filterSort = DEFAULT_SALE_FILTER_SORT,
) => {
  const rows = getSaleRows(payload).map((row, index) => {
    const distributorName = pickFirstText(row, ['dealerName']);
    const distributorCode = pickFirstText(row, ['dealerCode']);
    const shopName = pickFirstText(row, ['shopName']);
    const shopCode = pickFirstText(row, ['shopCode']);
    const programName = pickFirstText(row, ['programName']);

    return {
      ...row,
      _saleKey: `${index}-${shopName}-${programName}-${distributorName}`,
      _shopName: shopName,
      _shopCode: shopCode,
      _programName: programName,
      _distributorName: distributorName,
      _distributorCode: distributorCode,
    };
  });

  const keyword = getString(filterSort?.keyword).toLowerCase();
  let filteredRows = rows;

  if (keyword) {
    filteredRows = filteredRows.filter(row => {
      const haystack = [
        row._shopName,
        row._shopCode,
        row._programName,
        row._distributorName,
        row._distributorCode,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }

  if (filterSort?.status === SALE_STATUS_OPTIONS.PASS) {
    filteredRows = filteredRows.filter(isSalePassRow);
  } else if (filterSort?.status === SALE_STATUS_OPTIONS.FAIL) {
    filteredRows = filteredRows.filter(isSaleFailRow);
  }

  const sortBy = filterSort?.sortBy || SALE_SORT_OPTIONS.SHOP;
  const sortMap = {
    [SALE_SORT_OPTIONS.SHOP]: row =>
      `${row._shopName} ${row._programName} ${row._distributorName}`,
    [SALE_SORT_OPTIONS.DISTRIBUTOR]: row =>
      `${row._distributorName} ${row._shopName} ${row._programName}`,
    [SALE_SORT_OPTIONS.PROGRAM]: row =>
      `${row._programName} ${row._shopName} ${row._distributorName}`,
  };

  const sorter = sortMap[sortBy] || sortMap[SALE_SORT_OPTIONS.SHOP];
  return [...filteredRows].sort((a, b) =>
    sorter(a).localeCompare(sorter(b), 'vi', { sensitivity: 'base' }),
  );
};

export const getTypeDataMetricData = (payload, typeData = 'SALE') => {
  const rows = getTypeDataRows(payload, typeData);
  const shopMap = new Map();
  const distributorSet = new Set();
  const programSet = new Set();

  rows.forEach((row, index) => {
    const shopKey = pickFirstText(row, ['shopId'], `sale-shop-${index}`);
    const distributorKey = pickFirstText(row, ['dealerCode']);
    const programKey = pickFirstText(row, ['programId']);
    const actualSale = pickFirstNumber(row, ['actual']);
    const targetSale = pickFirstNumber(row, ['target']);
    const completionPercent =
      actualSale > 0 && targetSale > 0 ? (actualSale / targetSale) * 100 : 0;

    if (distributorKey) distributorSet.add(distributorKey);
    if (programKey) programSet.add(programKey);

    if (!shopMap.has(shopKey)) {
      shopMap.set(shopKey, {
        actualSale: 0,
        targetSale: 0,
        completionPercent: 0,
        hasCompletionPercent: false,
      });
    }

    const current = shopMap.get(shopKey);
    current.actualSale += actualSale;
    current.targetSale += targetSale;
    if (completionPercent || completionPercent === 0) {
      current.completionPercent += completionPercent;
      current.hasCompletionPercent = true;
    }
  });

  const shopList = Array.from(shopMap.values());
  const shopTotal = shopList.length;
  const actualSaleTotal = shopList.reduce(
    (sum, item) => sum + item.actualSale,
    0,
  );
  const targetSaleTotal = shopList.reduce(
    (sum, item) => sum + item.targetSale,
    0,
  );
  const metTargetCount = shopList.reduce((sum, item) => {
    if (item.targetSale > 0) {
      return item.actualSale >= item.targetSale ? sum + 1 : sum;
    }

    if (item.hasCompletionPercent) {
      return item.completionPercent >= 100 ? sum + 1 : sum;
    }

    return sum;
  }, 0);
  const notMetTargetCount = Math.max(shopTotal - metTargetCount, 0);

  return {
    shopTotal,
    distributorTotal: distributorSet.size,
    programTotal: programSet.size,
    metTargetCount,
    notMetTargetCount,
    passRate: shopTotal > 0 ? (metTargetCount / shopTotal) * 100 : 0,
    notMetRate: shopTotal > 0 ? (notMetTargetCount / shopTotal) * 100 : 0,
    completionRate:
      targetSaleTotal > 0 ? (actualSaleTotal / targetSaleTotal) * 100 : 0,
    actualSaleTotal,
    targetSaleTotal,
  };
};

export const getSaleMetricData = payload => {
  return getTypeDataMetricData(payload, 'SALE');
};
