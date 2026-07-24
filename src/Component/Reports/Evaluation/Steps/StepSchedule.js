import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import { CalendarSelected } from '../../../../Control/CalendarSelected';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import moment from 'moment';
import { REPORT } from '../../../../API/ReportAPI';
import { toastError } from '../../../../Utils/configToast';
import CustomListView from '../../../../Control/Custom/CustomListView';
import _ from 'lodash';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';
/**
 * StepSchedule - Step 4: configure date, co-visit, criteria and submit
 * Props: selectedPC, workDate, setWorkDate, coVisitName, setCoVisitName,
 *        selectedCriteria, onChooseCriteria, selectedCriteriaCate, onChooseCriteriaCategory,
 *        onSubmitSchedule, isShowCalendar, setShowCalendar
 *
 * Data structure: Each criterion item contains { key, kpiName, isCategory, categories[] }
 * Categories are loaded from API and stored within each item
 */
const StepSchedule = ({
  selectedPC = [],
  workDate,
  setWorkDate,
  coVisitName,
  setCoVisitName,
  selectedCriteria = [],
  onChooseCriteria,
  selectedCriteriaCate = {},
  onChooseCriteriaCategory,
  onSubmitSchedule,
  isShowCalendar,
  setShowCalendar,
}) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [criteriaList, setCriteriaList] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  const LoadData = async () => {
    const params = {
      reportId: kpiinfo.id,
      shopId: shopinfo.shopId,
      typeReport: 'KPILIST',
    };
    await REPORT.GetDataConfigReport(params, (mData, message) => {
      message && toastError('Thông báo', message);
      console.log(mData, 'GetDataConfigReport KPILIST');

      if (mData && Array.isArray(mData)) {
        const grouped = _.groupBy(mData, 'groupId');
        const result = Object.values(grouped).map(items => ({
          groupId: items[0].groupId,
          groupName: items[0].groupName,
          mainItem: items[0],
          items: items,
        }));
        setCriteriaList(result);
      } else {
        setCriteriaList([]);
      }
    });
  };
  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    sectionContainer: {
      width: '100%',
      marginBottom: 10,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.white,
      padding: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 6,
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginBottom: 8,
    },
    formActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectDateButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.surface,
    },
    selectDateText: { fontSize: 12, fontWeight: '600', color: appcolor.dark },
    inputCoVisit: {
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      marginTop: 8,
      paddingHorizontal: 10,
      color: appcolor.dark,
      fontSize: 12,
      height: 40,
      backgroundColor: appcolor.surface,
    },
    pcInfoBox: {
      marginTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
      paddingTop: 8,
    },
    criteriaItem: {
      width: '100%',
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    criteriaText: {
      marginLeft: 6,
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '500',
    },
    groupHeader: {
      backgroundColor: appcolor.primary,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginTop: 8,
      marginBottom: 4,
      borderRadius: 6,
    },
    groupHeaderText: {
      color: appcolor.light,
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    subWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 10,
      paddingBottom: 6,
    },
    subChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginRight: 6,
      marginTop: 6,
      backgroundColor: appcolor.surface,
      maxWidth: '100%',
    },
    subChipActive: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary + '20',
    },
    subChipText: {
      marginLeft: 6,
      fontSize: 12,
      color: appcolor.dark,
      flexShrink: 1,
    },
    subChipTextActive: {
      color: appcolor.blacklight,
      fontSize: 12,
      fontWeight: '500',
    },
    criteriaCategoryWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
      marginBottom: 6,
      paddingLeft: 26,
    },
    filterChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      marginRight: 6,
      marginBottom: 6,
    },
    filterChipActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    filterChipText: { fontSize: 11, color: appcolor.dark, fontWeight: '500' },
    filterChipTextActive: { color: appcolor.light },
    calendarContainer: {
      marginTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
      paddingTop: 8,
    },
    actionSchedule: {
      marginTop: 8,
      borderRadius: 8,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    actionScheduleDisable: { backgroundColor: appcolor.grayLight },
    actionScheduleText: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
  });

  const toggleGroupExpand = groupId => {
    setExpandedGroups({
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId],
    });
  };

  const getCriteriaIdentity = (criteria = {}) => {
    return String(
      criteria.id ??
      criteria.Id ??
      `${criteria.groupId || ''}_${criteria.kpi || ''}_${criteria.kpiName || ''
      }`,
    );
  };

  const buildGroupSelectionItem = group => {
    const mainItem = group.mainItem || (group.items || [])[0] || {};
    const subItems = (group.items || []).filter(item =>
      String(item.kpiName || '').trim(),
    );
    return {
      ...mainItem,
      id: `group_${group.groupId}`,
      selectionType: 'group',
      groupId: group.groupId,
      groupName: group.groupName,
      kpiName: '',
      hasSubItems: subItems.length > 0,
    };
  };

  const onChooseGroup = group => {
    const groupItems = group.items || [];
    const groupSelectionItem = buildGroupSelectionItem(group);
    const subItems = groupItems.filter(item =>
      String(item.kpiName || '').trim(),
    );
    const hasSubItems = subItems.length > 0;
    if (!groupSelectionItem) return;

    const groupId = getCriteriaIdentity(groupSelectionItem);
    const isGroupSelected = selectedCriteria.some(
      c => getCriteriaIdentity(c) === groupId,
    );
    groupSelectionItem.isChooseGroup = !isGroupSelected;
    groupSelectionItem.isChoose = false;

    if (isGroupSelected) {
      onChooseCriteria(groupSelectionItem);
      setExpandedGroups({ ...expandedGroups, [group.groupId]: false });
    } else {
      onChooseCriteria(groupSelectionItem);
      setExpandedGroups({ ...expandedGroups, [group.groupId]: hasSubItems });
    }
  };

  const renderItem = ({ item }) => {
    const group = item;
    const items = group.items || [];
    const subItems = items.filter(subItem =>
      String(subItem.kpiName || '').trim(),
    );
    const hasSubItems = subItems.length > 0;
    const isExpanded = hasSubItems && expandedGroups[group.groupId];
    const groupSelectionItem = buildGroupSelectionItem(group);
    const isGroupSelected = selectedCriteria.some(
      c => getCriteriaIdentity(c) === getCriteriaIdentity(groupSelectionItem),
    );

    return (
      <View key={group.groupId}>
        <TouchableOpacity
          style={[
            styles.groupHeader,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
          onPress={() => onChooseGroup(group)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <SpiralIcon
              type="ionicon"
              name={isGroupSelected ? 'checkbox' : 'square-outline'}
              size={20}
              color={appcolor.light}
            />
            <Text style={[styles.groupHeaderText, { flex: 1, marginStart: 8 }]}>
              {group.groupName}
            </Text>
          </View>
          {hasSubItems && (
            <SpiralIcon
              type="ionicon"
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={appcolor.light}
            />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subWrap}>
            {subItems.map(subItem => {
              const subSelectionItem = { ...subItem, selectionType: 'sub' };
              const isSelected = selectedCriteria.some(
                c =>
                  getCriteriaIdentity(c) ===
                  getCriteriaIdentity(subSelectionItem),
              );
              return (
                <TouchableOpacity
                  key={getCriteriaIdentity(subItem)}
                  style={[styles.subChip, isSelected && styles.subChipActive]}
                  onPress={() => onChooseCriteria(subSelectionItem)}
                >
                  <Text
                    style={[
                      styles.subChipText,
                      isSelected && styles.subChipTextActive,
                    ]}
                    numberOfLines={0}
                  >
                    {subItem.kpiName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Thiết lập lịch đánh giá PC</Text>
      <View style={styles.formActionRow}>
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => setShowCalendar(e => !e)}
        >
          <Text style={styles.selectDateText}>{`Ngày đánh giá: ${moment(
            workDate,
          ).format('DD/MM/YYYY')}`}</Text>
        </TouchableOpacity>
        <Text
          style={styles.subTitleName}
        >{`Đã chọn: ${selectedPC.length} PC`}</Text>
      </View>
      {isShowCalendar && (
        <View style={styles.calendarContainer}>
          <CalendarSelected
            isBetween={false}
            disibleFuture={false}
            defaultDate={workDate}
            onChangeData={date => setWorkDate(date)}
          />
        </View>
      )}
      <TextInput
        value={coVisitName}
        style={styles.inputCoVisit}
        onChangeText={setCoVisitName}
        placeholder="Nhập tên Co-visit"
        placeholderTextColor={appcolor.placeholderText}
      />
      <View style={[styles.pcInfoBox, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Chọn tiêu chí đánh giá</Text>
        <CustomListView
          data={criteriaList}
          extraData={criteriaList}
          renderItem={renderItem}
          bottomView={{ paddingBottom: 0 }}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.actionSchedule,
          selectedPC.length === 0 && styles.actionScheduleDisable,
        ]}
        onPress={onSubmitSchedule}
      >
        <Text style={styles.actionScheduleText}>Lên lịch đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StepSchedule;
