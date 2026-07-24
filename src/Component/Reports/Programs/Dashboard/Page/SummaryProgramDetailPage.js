import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import { formatNumber } from '../../../../../Core/Helper';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../../Control/Custom/CustomListView';

const getString = value => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeForSearch = value => {
  return getString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

const pickFirstText = (row, aliases = [], fallback = '-') => {
  for (let i = 0; i < aliases.length; i += 1) {
    const value = getString(row?.[aliases[i]]);
    if (value) return value;
  }
  return fallback;
};

const toNumber = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').replace(/\s/g, '');
    if (!normalized.length || normalized === '-') return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickFirstNumber = (row, aliases = []) => {
  for (let i = 0; i < aliases.length; i += 1) {
    const value = toNumber(row?.[aliases[i]]);
    if (value !== null) return value;
  }
  return null;
};

const pickFirstPercent = (row, aliases = []) => {
  for (let i = 0; i < aliases.length; i += 1) {
    const raw = row?.[aliases[i]];
    if (typeof raw === 'string' && raw.includes('%')) return raw.trim();

    const numValue = toNumber(raw);
    if (numValue !== null) {
      if (numValue >= 0 && numValue <= 1) {
        const percent = numValue * 100;
        return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
      }
      return `${Number.isInteger(numValue) ? numValue : numValue.toFixed(1)}%`;
    }
  }
  return '-';
};

const formatNumeric = (value, suffix = '') => {
  if (value === null || value === undefined) return '-';
  const parsed = toNumber(value);
  if (parsed === null) return getString(value) || '-';
  const abs = Math.abs(parsed);
  const display = abs >= 1000 ? formatNumber(parsed, ',') : String(parsed);
  return suffix ? `${display}${suffix}` : display;
};

const getTypeLabel = row => {
  const rawType = pickFirstText(
    row,
    ['type', 'typeName', 'programTypeName', 'displayTypeName', 'displayType'],
    '-',
  );
  const normalized = normalizeForSearch(rawType);
  if (normalized.includes('delivery')) return 'DELIVERY';
  if (normalized.includes('display')) return 'DISPLAY';
  return rawType.toUpperCase();
};

const getMonthLabel = row => {
  const rawMonth = pickFirstText(
    row,
    ['monthLabel', 'monthName', 'periodName', 'month', 'reportMonth'],
    '-',
  );
  if (rawMonth !== '-') {
    if (/month|thang/i.test(rawMonth)) return rawMonth;
    const monthNumber = toNumber(rawMonth);
    if (monthNumber !== null && monthNumber >= 1 && monthNumber <= 12)
      return `Month ${monthNumber}`;
    return rawMonth;
  }

  const monthNumber = toNumber(row?.month);
  const yearNumber = toNumber(row?.year);
  if (monthNumber !== null && monthNumber >= 1 && monthNumber <= 12) {
    return yearNumber !== null
      ? `Month ${monthNumber}/${yearNumber}`
      : `Month ${monthNumber}`;
  }

  return '-';
};

const getStatusLabel = row =>
  pickFirstText(
    row,
    [
      'confirmStatus',
      'statusName',
      'billStatusName',
      'billConfirmName',
      'status',
    ],
    '-',
  );

const getStatusTone = (row, statusLabel) => {
  const statusResult = toNumber(row?.statusResult);
  const billStatus = toNumber(row?.billStatus);
  const normalized = normalizeForSearch(statusLabel);

  if (
    statusResult === 1 ||
    billStatus === 1 ||
    /pass|success|dat|duyet/.test(normalized)
  )
    return 'pass';
  if (
    statusResult === 0 ||
    billStatus === 0 ||
    billStatus === 2 ||
    /fail|reject|rot|khongdat/.test(normalized)
  )
    return 'fail';
  return 'neutral';
};

const getPassPercent = (row, typeLabel) => {
  const explicitPercent = pickFirstPercent(row, [
    'passPercent',
    'passRate',
    'passPercentRate',
    'actualSaleRatePercent',
  ]);
  if (explicitPercent !== '-') return explicitPercent;

  if (typeLabel === 'DELIVERY') {
    const deliveryPercent = pickFirstPercent(row, ['deliveryRate']);
    if (deliveryPercent !== '-') return deliveryPercent;
  }

  if (typeLabel === 'DISPLAY') {
    const displayPercent = pickFirstPercent(row, ['displayRate']);
    if (displayPercent !== '-') return displayPercent;
  }

  return pickFirstPercent(row, ['saleRate', 'displayRate', 'deliveryRate']);
};

const getAwardTags = row => {
  const detailText = pickFirstText(
    row,
    [
      'deliveryAward',
      'awardName',
      'rewardName',
      'giftName',
      'award',
      'AwardName',
    ],
    '',
  );
  const normalizedDetail = getString(detailText);
  if (normalizedDetail) {
    return normalizedDetail
      .split(/,|;|\||•/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  const awardDetailRaw = getString(row?.AwardDetail || row?.awardDetail);
  if (awardDetailRaw) {
    try {
      const parsed = JSON.parse(awardDetailRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => {
            const quantity = getString(item?.quantity);
            const name = getString(item?.name);
            return [quantity, name].filter(Boolean).join(' ');
          })
          .filter(Boolean);
      }
    } catch (_error) {
      return [awardDetailRaw];
    }
  }

  const awardValue = pickFirstNumber(row, ['awardValue', 'totalAwardValue']);
  const awardType = pickFirstText(row, ['awardTypeName'], '');
  if (awardValue !== null)
    return [`${formatNumeric(awardValue)} ${awardType}`.trim()];

  return [];
};

const SummaryProgramDetailPage = ({ appcolor, data = [] }) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const [keyword, setKeyword] = useState('');

  const preparedData = useMemo(() => {
    const normalizedKeyword = normalizeForSearch(keyword);

    const mapped = data.map(item => {
      const distributorName = pickFirstText(item, [
        'dealerName',
        'distributorName',
        'nppName',
      ]);
      const distributorCode = pickFirstText(
        item,
        ['dealerCode', 'distributorCode', 'nppCode'],
        '',
      );
      const storeName = pickFirstText(item, [
        'shopName',
        'storeName',
        'outletName',
      ]);
      const storeCode = pickFirstText(
        item,
        ['shopCode', 'storeCode', 'outletCode'],
        '',
      );
      const programName = pickFirstText(item, [
        'programName',
        'displayName',
        'programTypeName',
        'program',
      ]);
      const programId =
        pickFirstText(
          item,
          ['programId', 'idProgram', 'programCode', 'displayId'],
          '',
        ) || programName;
      const typeLabel = getTypeLabel(item);
      const monthLabel = getMonthLabel(item);
      const statusLabel = getStatusLabel(item);
      const passPercent = getPassPercent(item, typeLabel);
      const awardTags = getAwardTags(item);

      return {
        item,
        distributorName,
        distributorCode,
        storeName,
        storeCode,
        programId,
        programName,
        typeLabel,
        monthLabel,
        statusLabel,
        passPercent,
        awardTags,
      };
    });

    const filtered = normalizedKeyword
      ? mapped.filter(row => {
          const haystack = [
            row.distributorName,
            row.distributorCode,
            row.storeName,
            row.storeCode,
            row.programId,
            row.programName,
            row.typeLabel,
            row.monthLabel,
            row.statusLabel,
            row.passPercent,
            row.awardTags.join(' '),
          ].join(' ');
          return normalizeForSearch(haystack).includes(normalizedKeyword);
        })
      : mapped;

    return filtered;
  }, [data, keyword]);

  const previewData = useMemo(
    () => preparedData.slice(0, visibleCount),
    [preparedData, visibleCount],
  );
  const { displayList, stickyHeaderIndices } = useMemo(() => {
    const groupedMap = new Map();

    previewData.forEach((row, index) => {
      const groupKey = row.programId || row.programName || '-';
      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          programId: groupKey,
          programName: row.programName || '-',
          items: [],
        });
      }

      groupedMap.get(groupKey).items.push({ ...row, displayIndex: index + 1 });
    });

    const flatList = [];
    const stickyIndices = [];

    groupedMap.forEach(group => {
      stickyIndices.push(flatList.length);
      flatList.push({
        type: 'group',
        programId: group.programId,
        programName: group.programName,
        totalItems: group.items.length,
      });

      group.items.forEach(row => {
        flatList.push({
          type: 'row',
          ...row,
        });
      });
    });

    return {
      displayList: flatList,
      stickyHeaderIndices: stickyIndices,
    };
  }, [previewData]);
  const canLoadMore = preparedData.length > visibleCount;
  const shownCount = previewData.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: appcolor.light,
      padding: 4,
      marginBottom: 14,
    },
    listContainer: { flex: 1, minHeight: 1 },
    filterBlock: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      padding: 10,
    },
    countRow: {
      margin: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    countText: { fontSize: 11, fontWeight: '700', color: appcolor.primary },
    countSubText: {
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
    },
    emptyBox: {
      marginTop: 12,
      borderRadius: 14,
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
    },
    emptyText: {
      fontSize: 12,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
      textAlign: 'center',
    },
    sectionHeaderWrap: { paddingTop: 4, backgroundColor: appcolor.light },
    sectionHeader: {
      borderTopStartRadius: 8,
      borderTopEndRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: `${appcolor.primary}12`,
      padding: 8,
    },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: appcolor.primary },
    sectionMeta: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
    },
    card: {
      marginTop: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      padding: 12,
    },
    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
    indexBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${appcolor.primary}14`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIndex: { fontSize: 11, fontWeight: '800', color: appcolor.primary },
    mainContent: { flex: 1, marginLeft: 10 },
    titleText: { fontSize: 13, fontWeight: '800', color: appcolor.dark },
    subText: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
    },
    programText: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      color: appcolor.primary,
    },
    badgeColumn: { marginLeft: 10, alignItems: 'flex-end' },
    chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    chipTypeDisplay: { backgroundColor: '#E4F7FB' },
    chipTypeDelivery: { backgroundColor: '#FFF0E5' },
    chipTypeTextDisplay: { color: '#00A6C7' },
    chipTypeTextDelivery: { color: '#F57C00' },
    chipStatusPass: { marginTop: 6, backgroundColor: '#E4F8EE' },
    chipStatusFail: { marginTop: 6, backgroundColor: '#FFEAEA' },
    chipStatusNeutral: { marginTop: 6, backgroundColor: '#EEF1F5' },
    chipStatusTextPass: { color: '#13A66A' },
    chipStatusTextFail: { color: '#E24B4B' },
    chipStatusTextNeutral: { color: appcolor.placeholderText || appcolor.dark },
    chipText: { fontSize: 10, fontWeight: '800' },
    metricGrid: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    metricBox: {
      width: '24%',
      borderRadius: 12,
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      paddingVertical: 8,
      paddingHorizontal: 6,
    },
    metricLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: appcolor.placeholderText || appcolor.dark,
      textAlign: 'center',
    },
    metricValue: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '800',
      color: appcolor.dark,
      textAlign: 'center',
    },
    awardRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' },
    awardChip: {
      marginRight: 6,
      marginBottom: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: '#FFBE8A',
      backgroundColor: '#FFF4EC',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    awardText: { fontSize: 10, fontWeight: '700', color: '#F57C00' },
    dividerText: {
      marginTop: 8,
      fontSize: 10,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
    },
    loadMoreBtn: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.primary,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: `${appcolor.primary}12`,
    },
    loadMoreText: { fontSize: 12, fontWeight: '700', color: appcolor.primary },
  });

  const renderDisplayItem = ({ item }) => {
    if (item.type === 'group') {
      return (
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.programName}</Text>
            <Text style={styles.sectionMeta}>{`${formatNumeric(
              item.totalItems,
            )} mục`}</Text>
          </View>
        </View>
      );
    }

    const dataItem = item.item;
    const distributorName = item.distributorName;
    const distributorCode = item.distributorCode;
    const storeName = item.storeName;
    const storeCode = item.storeCode;
    const typeLabel = item.typeLabel;
    const monthLabel = item.monthLabel;
    const statusLabel = item.statusLabel;
    const awardTags = item.awardTags;

    const actualSale = pickFirstNumber(dataItem, [
      'actual',
      'actualSale',
      'actualSaleRate',
      'actualValue',
      'actualAmount',
    ]);
    const target = pickFirstNumber(dataItem, [
      'target',
      'targetAmount',
      'targetValue',
    ]);
    const totalSalePass = pickFirstText(
      dataItem,
      ['totalSalePass', 'totalSaleResult'],
      '-',
    );
    const passPercent = item.passPercent;
    const primaryText = storeCode ? `${storeName} (${storeCode})` : storeName;
    const secondaryText = distributorCode
      ? `${distributorName} (${distributorCode})`
      : distributorName;
    const statusTone = getStatusTone(dataItem, statusLabel);
    const typeChipStyle =
      typeLabel === 'DELIVERY'
        ? styles.chipTypeDelivery
        : styles.chipTypeDisplay;
    const typeTextStyle =
      typeLabel === 'DELIVERY'
        ? styles.chipTypeTextDelivery
        : styles.chipTypeTextDisplay;
    const statusChipStyle =
      statusTone === 'pass'
        ? styles.chipStatusPass
        : statusTone === 'fail'
        ? styles.chipStatusFail
        : styles.chipStatusNeutral;
    const statusTextStyle =
      statusTone === 'pass'
        ? styles.chipStatusTextPass
        : statusTone === 'fail'
        ? styles.chipStatusTextFail
        : styles.chipStatusTextNeutral;

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.indexBox}>
            <Text style={styles.rowIndex}>{`#${item.displayIndex}`}</Text>
          </View>

          <View style={styles.mainContent}>
            <Text style={styles.titleText} numberOfLines={1}>
              {primaryText}
            </Text>
            <Text style={styles.subText} numberOfLines={1}>
              {secondaryText}
            </Text>
            <Text style={styles.programText} numberOfLines={1}>
              {item.programName}
            </Text>
          </View>

          <View style={styles.badgeColumn}>
            <View style={[styles.chip, typeChipStyle]}>
              <Text style={[styles.chipText, typeTextStyle]}>{typeLabel}</Text>
            </View>
            <View style={[styles.chip, statusChipStyle]}>
              <Text style={[styles.chipText, statusTextStyle]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Month</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {monthLabel}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Actual</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {formatNumeric(actualSale)}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Target</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {formatNumeric(target)}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Pass %</Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {passPercent}
            </Text>
          </View>
        </View>

        <Text
          style={styles.dividerText}
          numberOfLines={1}
        >{`Kết quả: ${totalSalePass}`}</Text>

        {awardTags.length ? (
          <View style={styles.awardRow}>
            {awardTags.map((award, index) => (
              <View key={`${award}-${index}`} style={styles.awardChip}>
                <Text style={styles.awardText} numberOfLines={1}>
                  {award}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SearchData
        placeholder={'Tìm theo NPP, cửa hàng, chương trình...'}
        value={keyword}
        onSearchData={text => {
          setKeyword(text || '');
          setVisibleCount(20);
        }}
      />
      <View style={styles.countRow}>
        <Text style={styles.countText}>{`Tổng: ${formatNumeric(
          preparedData.length,
        )} mục`}</Text>
        <Text style={styles.countSubText}>{`Đang hiển thị: ${formatNumeric(
          shownCount,
        )}`}</Text>
      </View>
      <View style={styles.listContainer}>
        <CustomListView
          data={displayList}
          extraData={displayList}
          renderItem={renderDisplayItem}
          stickyHeaderIndices={stickyHeaderIndices}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 12 }}
          ListEmpty={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Không có dữ liệu chi tiết theo bộ lọc hiện tại
              </Text>
            </View>
          }
          ListFooter={
            canLoadMore ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => setVisibleCount(prev => prev + 20)}
              >
                <Text
                  style={styles.loadMoreText}
                >{`Xem thêm 20 mục thống kê (${formatNumeric(
                  preparedData.length - visibleCount,
                )} còn lại)`}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </View>
  );
};

export default SummaryProgramDetailPage;
