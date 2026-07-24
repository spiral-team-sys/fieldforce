import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import { formatNumber } from '../../../../../Core/Helper';

const SummaryProgramCard = ({
  appcolor,
  metrics = {},
  filterSort,
  showMeta = true,
  title = 'Thống kê chương trình',
  subtitle = 'Tổng hợp nhanh đăng ký, hóa đơn và kết quả theo bộ lọc hiện tại.',
  containerStyle,
  fillHeight = false,
  showTapHint = true,
  onPress,
}) => {
  const filterLabel =
    filterSort?.status === 'PASS'
      ? 'Chỉ dữ liệu Pass'
      : filterSort?.status === 'FAIL'
      ? 'Chỉ dữ liệu Fail'
      : 'Toàn bộ dữ liệu';

  const sortLabel =
    filterSort?.sortBy === 'SHOP'
      ? 'Sắp xếp theo shop'
      : filterSort?.sortBy === 'PROGRAM'
      ? 'Sắp xếp theo chương trình'
      : 'Sắp xếp theo nhân viên';

  const renderValue = value => formatNumber(value || 0, ',') || '0';

  const styles = StyleSheet.create({
    wrapper: { borderRadius: 22, overflow: 'hidden', marginBottom: 12 },
    gradient: { padding: 16, paddingBottom: 18 },
    gradientFill: { flex: 1, justifyContent: 'space-between' },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: appcolor.light,
      width: '100%',
      marginBottom: 6,
      marginEnd: 6,
    },
    heroSubtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.82)',
      lineHeight: 18,
      maxWidth: '88%',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: appcolor.light },
    statGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statCard: {
      width: '32%',
      borderRadius: 18,
      padding: 12,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    statValue: { fontSize: 24, fontWeight: '800', color: appcolor.light },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.82)',
      marginTop: 4,
    },
    bottomRow: { flexDirection: 'row', flexWrap: 'wrap' },
    metaChip: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.12)',
      marginRight: 8,
      marginBottom: 8,
    },
    metaText: { fontSize: 11, fontWeight: '600', color: appcolor.light },
    tapHintWrap: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.2)',
    },
    tapHintText: {
      fontSize: 11,
      textAlign: 'right',
      fontWeight: '700',
      color: 'rgba(255,255,255,0.9)',
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.wrapper, containerStyle]}>
        <LinearGradient
          colors={[
            appcolor.primary,
            appcolor.info || '#1F6FEB',
            appcolor.second || '#18A999',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, fillHeight ? styles.gradientFill : null]}
        >
          <View style={styles.topRow}>
            <View style={{ width: '68%' }}>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{'PROGRAMS'}</Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {renderValue(metrics.shopTotal)}
              </Text>
              <Text style={styles.statLabel}>Cửa hàng</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {renderValue(metrics.dealerTotal)}
              </Text>
              <Text style={styles.statLabel}>Nhà phân phối</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {renderValue(metrics.programTotal)}
              </Text>
              <Text style={styles.statLabel}>Chương trình</Text>
            </View>
          </View>

          {showMeta ? (
            <View style={styles.bottomRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{filterLabel}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{sortLabel}</Text>
              </View>
              {filterSort?.keyword ? (
                <View style={styles.metaChip}>
                  <Text
                    style={styles.metaText}
                  >{`Từ khóa: ${filterSort.keyword}`}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {showTapHint ? (
            <View style={styles.tapHintWrap}>
              <Text style={styles.tapHintText}>
                Nhấn vào thẻ để xem chi tiết
              </Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default SummaryProgramCard;
