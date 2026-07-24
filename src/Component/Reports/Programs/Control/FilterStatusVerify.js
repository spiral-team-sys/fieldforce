import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import FormGroup from '../../../../Content/FormGroup';

const FILTER_SECTIONS = [
  {
    sectionTitle: 'Ảnh trưng bày',
    iconName: 'image',
    unverifiedType: 'FILTER_UNVERIFIED_PHOTO_REVIEW',
    verifiedType: 'FILTER_VERIFIED_PHOTO_REVIEW',
  },
  {
    sectionTitle: 'Hoá đơn',
    iconName: 'document-text',
    unverifiedType: 'FILTER_UNVERIFIED_INVOICE',
    verifiedType: 'FILTER_VERIFIED_INVOICE',
  },
  {
    sectionTitle: 'Phiếu xuất',
    iconName: 'receipt',
    unverifiedType: 'FILTER_UNVERIFIED_DELIVERY_SLIP',
    verifiedType: 'FILTER_VERIFIED_DELIVERY_SLIP',
  },
];

export const FilterStatusVerify = ({
  selectedType,
  createByValue,
  dealerValue,
  selectedCreators,
  selectedDealers,
  showCreateByFilter,
  showDealerFilter,
  suggestedCreators,
  suggestedDealers,
  onChangeCreateBy,
  onChangeDealer,
  onSelectCreator,
  onSelectDealer,
  onSelectFilter,
  onApplyFilter,
  onClearFilter,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const visibleCreators = (suggestedCreators || []).slice(0, 12);
  const visibleDealers = (suggestedDealers || []).slice(0, 12);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        filterSheetContent: {
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 20,
        },
        filterSheetTitle: {
          marginBottom: 10,
          fontSize: 15,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        createByContainer: {
          marginBottom: 10,
        },
        createByLabel: {
          fontSize: 12,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
          marginBottom: 6,
        },
        createByInput: {
          color: appcolor.dark,
          fontSize: 12,
          minHeight: 36,
        },
        creatorSuggestionWrap: {
          marginTop: 8,
          maxHeight: 120,
        },
        creatorSuggestionContent: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: 6,
          rowGap: 6,
          paddingRight: 2,
        },
        creatorSuggestionChip: {
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.white,
          borderRadius: 999,
          paddingVertical: 5,
          paddingHorizontal: 10,
        },
        creatorSuggestionChipActive: {
          borderColor: appcolor.primary,
          backgroundColor: appcolor.surface,
        },
        creatorSuggestionText: {
          fontSize: 11,
          color: appcolor.dark,
          fontWeight: fontWeightBold,
        },
        suggestionMoreText: {
          marginTop: 6,
          fontSize: 11,
          color: appcolor.greydark,
        },
        dealerContainer: {
          marginBottom: 10,
        },
        dealerLabel: {
          fontSize: 12,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
          marginBottom: 6,
        },
        dealerSuggestionWrap: {
          marginTop: 8,
          maxHeight: 120,
        },
        dealerSuggestionContent: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: 6,
          rowGap: 6,
          paddingRight: 2,
        },
        dealerSuggestionChip: {
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.white,
          borderRadius: 999,
          paddingVertical: 5,
          paddingHorizontal: 10,
        },
        dealerSuggestionChipActive: {
          borderColor: appcolor.primary,
          backgroundColor: appcolor.surface,
        },
        dealerSuggestionText: {
          fontSize: 11,
          color: appcolor.dark,
          fontWeight: fontWeightBold,
        },
        filterSectionBlock: {
          marginBottom: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          paddingVertical: 8,
          paddingHorizontal: 10,
          backgroundColor: appcolor.white,
        },
        filterSectionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 10,
        },
        filterSectionInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        },
        filterSectionTitle: {
          fontSize: 13,
          fontWeight: fontWeightBold,
          marginLeft: 8,
          color: appcolor.dark,
        },
        statusGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: appcolor.surface,
          borderRadius: 999,
          padding: 2,
          flexShrink: 0,
        },
        statusButton: {
          minWidth: 72,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          alignItems: 'center',
        },
        statusButtonActive: {
          backgroundColor: appcolor.primary,
        },
        statusLabel: {
          fontSize: 11,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        statusLabelActive: {
          color: appcolor.white,
        },
        actionRow: {
          marginTop: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 8,
        },
        actionButton: {
          flex: 1,
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: 'center',
          justifyContent: 'center',
        },
        clearButton: {
          borderWidth: 1,
          borderColor: appcolor.grayLight,
          backgroundColor: appcolor.white,
        },
        applyButton: {
          backgroundColor: appcolor.primary,
        },
        clearButtonText: {
          fontSize: 12,
          fontWeight: fontWeightBold,
          color: appcolor.dark,
        },
        applyButtonText: {
          fontSize: 12,
          fontWeight: fontWeightBold,
          color: appcolor.white,
        },
      }),
    [appcolor],
  );

  return (
    <View style={styles.filterSheetContent}>
      <Text style={styles.filterSheetTitle}>Lọc trạng thái</Text>
      {showCreateByFilter && (
        <View style={styles.createByContainer}>
          <Text style={styles.createByLabel}>Nhân viên</Text>
          <FormGroup
            editable={true}
            value={createByValue}
            handleChangeForm={onChangeCreateBy}
            placeholder="Tìm kiếm nhân viên..."
            containerStyle={{
              marginBottom: 0,
              borderColor: appcolor.grayLight,
              backgroundColor: appcolor.white,
            }}
            inputStyle={styles.createByInput}
          />
          {visibleCreators.length > 0 && (
            // Using ScrollView here because chip cloud with dynamic width + wrap is not suitable for CustomListView/FlashList.
            <ScrollView
              style={styles.creatorSuggestionWrap}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.creatorSuggestionContent}>
                {visibleCreators.map(name => {
                  const isActive = (selectedCreators || []).includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      activeOpacity={0.85}
                      style={[
                        styles.creatorSuggestionChip,
                        isActive && styles.creatorSuggestionChipActive,
                      ]}
                      onPress={() => onSelectCreator(name)}
                    >
                      <Text style={styles.creatorSuggestionText}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
          {suggestedCreators?.length > 12 && (
            <Text style={styles.suggestionMoreText}>
              Hiển thị 12/{suggestedCreators.length} gợi ý
            </Text>
          )}
        </View>
      )}
      {showDealerFilter && (
        <View style={styles.dealerContainer}>
          <Text style={styles.dealerLabel}>Nhà phân phối</Text>
          <FormGroup
            editable={true}
            value={dealerValue}
            handleChangeForm={onChangeDealer}
            placeholder="Tìm kiếm nhà phân phối..."
            containerStyle={{
              marginBottom: 0,
              borderColor: appcolor.grayLight,
              backgroundColor: appcolor.white,
            }}
            inputStyle={styles.createByInput}
          />
          {visibleDealers.length > 0 && (
            // Using ScrollView here because chip cloud with dynamic width + wrap is not suitable for CustomListView/FlashList.
            <ScrollView
              style={styles.dealerSuggestionWrap}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dealerSuggestionContent}>
                {visibleDealers.map(name => {
                  const isActive = (selectedDealers || []).includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      activeOpacity={0.85}
                      style={[
                        styles.dealerSuggestionChip,
                        isActive && styles.dealerSuggestionChipActive,
                      ]}
                      onPress={() => onSelectDealer(name)}
                    >
                      <Text style={styles.dealerSuggestionText}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
          {suggestedDealers?.length > 12 && (
            <Text style={styles.suggestionMoreText}>
              Hiển thị 12/{suggestedDealers.length} gợi ý
            </Text>
          )}
        </View>
      )}
      {FILTER_SECTIONS.map(item => (
        <View key={item.sectionTitle} style={styles.filterSectionBlock}>
          <View style={styles.filterSectionRow}>
            <View style={styles.filterSectionInfo}>
              <SpiralIcon
                type="ionicon"
                name={item.iconName}
                size={18}
                color={appcolor.primary}
              />
              <Text style={styles.filterSectionTitle}>{item.sectionTitle}</Text>
            </View>

            <View style={styles.statusGroup}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedType === item.unverifiedType &&
                    styles.statusButtonActive,
                ]}
                activeOpacity={0.85}
                onPress={() => onSelectFilter(item.unverifiedType)}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    selectedType === item.unverifiedType &&
                      styles.statusLabelActive,
                  ]}
                >
                  Chưa gửi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedType === item.verifiedType &&
                    styles.statusButtonActive,
                ]}
                activeOpacity={0.85}
                onPress={() => onSelectFilter(item.verifiedType)}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    selectedType === item.verifiedType &&
                      styles.statusLabelActive,
                  ]}
                >
                  Đã gửi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          activeOpacity={0.85}
          onPress={onClearFilter}
        >
          <Text style={styles.clearButtonText}>Xoá lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton]}
          activeOpacity={0.85}
          onPress={onApplyFilter}
        >
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
