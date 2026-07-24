import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/base';
import { SheetManager } from 'react-native-actions-sheet';
import SummaryProgramCard from '../Item/SummaryProgramCard';
import SummaryFilterSortSheet from '../Item/SummaryFilterSortSheet';
import SummaryDisplayCard from '../Item/SummaryDisplayCard';
import SummaryDeliveryCard from '../Item/SummaryDeliveryCard';
import { getMetricData } from '../Control/summaryMetrics';
import {
  getTypeDataMetricData,
  getTypeDataRows,
} from '../Control/summarySaleData';
import {
  getDisplayMetricData,
  getDisplayRows,
} from '../Control/summaryDisplayData';
import {
  getDeliveryMetricData,
  getDeliveryRows,
} from '../Control/summaryDeliveryData';
import SummarySaleCard from '../Item/SummarySaleCard';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const SummaryDashboardPage = ({
  appcolor,
  metrics,
  rawData = [],
  filterSort,
  onChangeFilterSort,
  onCardPress,
  errorMessage,
  isRefreshing,
  onRefresh,
}) => {
  const failColor = appcolor.danger || appcolor.red || '#C62828';
  const filterSheetId = 'summary-filter-sort-sheet';

  const currentStatusLabel =
    filterSort?.status === 'PASS'
      ? 'Pass'
      : filterSort?.status === 'FAIL'
        ? 'Fail'
        : 'Tất cả';

  const currentSortLabel =
    filterSort?.sortBy === 'SHOP'
      ? 'Shop'
      : filterSort?.sortBy === 'PROGRAM'
        ? 'Chương trình'
        : 'Nhân viên';

  const styles = StyleSheet.create({
    body: { flexGrow: 1, padding: 10, paddingBottom: 28 },
    errorCard: {
      backgroundColor: appcolor.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${failColor}33`,
      padding: 12,
      marginBottom: 10,
    },
    errorText: {
      fontSize: 12,
      color: failColor,
      textAlign: 'center',
      fontWeight: '600',
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: appcolor.dark,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: appcolor.placeholderText || appcolor.dark,
      fontWeight: '600',
    },
    filterAction: {
      borderRadius: 20,
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      padding: 12,
      marginBottom: 10,
    },
    filterActionTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    filterActionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: appcolor.dark,
    },
    filterActionSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.placeholderText || appcolor.dark,
    },
    filterMetaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
    filterMetaChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: appcolor.light,
      marginRight: 8,
      marginTop: 6,
    },
    filterMetaText: {
      fontSize: 11,
      fontWeight: '700',
      color: appcolor.primary,
    },
  });

  const openFilterSheet = () => {
    SheetManager.show(filterSheetId);
  };

  const programRows = getTypeDataRows(rawData, 'PROGRAM');
  const saleRows = getTypeDataRows(rawData, 'SALE');
  const displayRows = getDisplayRows(rawData);
  const deliveryRows = getDeliveryRows(rawData);

  const programMetrics =
    programRows.length > 0 ? getMetricData(programRows) : metrics;
  const saleMetrics = getTypeDataMetricData(rawData, 'SALE');
  const displayMetrics = getDisplayMetricData(rawData);
  const deliveryMetrics = getDeliveryMetricData(rawData);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.filterAction} onPress={openFilterSheet}>
          <View style={styles.filterActionTop}>
            <View>
              <Text style={styles.filterActionTitle}>Bộ lọc và sắp xếp</Text>
              <Text style={styles.filterActionSubtitle}>
                Nhấn để thay đổi trạng thái, từ khóa và cách sắp xếp
              </Text>
            </View>
            <SpiralIcon
              type="ionicon"
              name="options-outline"
              color={appcolor.primary}
              size={20}
            />
          </View>
          <View style={styles.filterMetaRow}>
            <View style={styles.filterMetaChip}>
              <Text
                style={styles.filterMetaText}
              >{`Trạng thái: ${currentStatusLabel}`}</Text>
            </View>
            <View style={styles.filterMetaChip}>
              <Text
                style={styles.filterMetaText}
              >{`Sắp xếp: ${currentSortLabel}`}</Text>
            </View>
            {filterSort?.keyword ? (
              <View style={styles.filterMetaChip}>
                <Text
                  style={styles.filterMetaText}
                >{`Từ khóa: ${filterSort.keyword}`}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        <SummaryProgramCard
          appcolor={appcolor}
          metrics={programMetrics}
          filterSort={filterSort}
          onPress={() =>
            onCardPress?.(
              programRows.length > 0 ? programRows : rawData,
              'PROGRAM',
            )
          }
        />

        <SummarySaleCard
          appcolor={appcolor}
          metrics={saleMetrics}
          onPress={() => onCardPress?.(saleRows, 'SALE')}
        />

        <SummaryDisplayCard
          appcolor={appcolor}
          metrics={displayMetrics}
          onPress={() => onCardPress?.(displayRows, 'DISPLAY')}
        />

        <SummaryDeliveryCard
          appcolor={appcolor}
          metrics={deliveryMetrics}
          onPress={() => onCardPress?.(deliveryRows, 'DELIVERY')}
        />
      </ScrollView>

      <SummaryFilterSortSheet
        id={filterSheetId}
        appcolor={appcolor}
        value={filterSort}
        onChange={onChangeFilterSort}
      />
    </>
  );
};

export default SummaryDashboardPage;
