import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text } from '@rneui/base';
import moment from 'moment';
import _ from 'lodash';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import FormGroup from '../../../Content/FormGroup';
import { REPORT } from '../../../API/ReportAPI';
import {
  MessageAcept,
  formatNumber,
  groupDataByKey,
} from '../../../Core/Helper';
import { alertConfirm, TODAY } from '../../../Core/Utility';
import {
  itemUploaded,
  saveJsonData,
} from '../../../Controller/ReportController';
import CustomListView from '../../../Control/Custom/CustomListView';
import LoadingDefault from '../../../Control/ItemLoading/LoadingDefault';
import { deviceHeight } from '../../../Themes/AppsStyle';
import NewOrderSection from './components/NewOrderSection';
import CompetitorSection from './components/CompetitorSection';

const SalesPromoterScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [isUploaded, setIsUploaded] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const config = JSON.parse(kpiinfo.reportItem || '{}');
  const yesNoOptions = Array.isArray(config?.yesNo) ? config.yesNo : [];
  const reasonOptions = Array.isArray(config?.reasonList)
    ? config.reasonList
    : [];
  const defaultItemValue = {
    itemValue: null,
    reasonId: null,
    price: '',
    otherProduct: '',
    detailReason: '',
    otherReason: '',
    selectedId: [],
    otherCompetitor: '',
  };

  useEffect(() => {
    LoadData();
  }, []);

  const LoadData = async () => {
    setLoading(true);
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(dataFilter, async (mData, mesager) => {
      mesager && MessageAcept('Thông báo', mesager, () => {});
      const { arr } = await groupDataByKey({ arr: mData, key: 'GroupId' });
      const nextDataMain = (arr || []).map(it => ({
        ...it,
        ItemValue: it?.ItemValue ?? it?.itemValue ?? null,
      }));
      const items = await itemUploaded(shopinfo, kpiinfo.id);
      setDataMain(nextDataMain);
      setCollapsedGroups(handlerBuildCollapsedGroups(nextDataMain));
      setIsUploaded(items?.isUploaded == 1);
    });
    setLoading(false);
  };

  const handlerBuildCollapsedGroups = arr => {
    return (arr || []).reduce((acc, it, index) => {
      const groupKey = (it?.GroupId ?? index).toString();
      acc[groupKey] = true;
      return acc;
    }, {});
  };

  const handlerSaveLocalData = async nextData => {
    await saveJsonData(
      shopinfo.shopId || 0,
      kpiinfo.id,
      shopinfo.auditDate,
      nextData || [],
    );
  };

  const handlerUpdateDataMain = nextData => {
    setDataMain(nextData);
    handlerSaveLocalData(nextData);
  };

  const handlerUpdateItemValue = (index, ItemValue) => {
    const dataUpdate = _.map(dataMain, (item, itemIndex) => {
      if (itemIndex !== index) return item;
      return { ...item, ItemValue };
    });
    handlerUpdateDataMain(dataUpdate);
  };

  const handlerGetPayloadFromItemValue = rawValue => {
    const handlerNormalizePayload = payload => {
      const nextPayload = { ...defaultItemValue, ...(payload || {}) };
      const {
        selectedIds,
        orderValue,
        reasonInput,
        competitorOtherText,
        ...restPayload
      } = nextPayload;
      const selectedId = Array.isArray(nextPayload?.selectedId)
        ? nextPayload.selectedId.map(id => Number(id))
        : Array.isArray(selectedIds)
        ? selectedIds.map(id => (Number(id) === 100 ? 0 : Number(id)))
        : [];

      return {
        ...defaultItemValue,
        ...restPayload,
        price: nextPayload?.price ?? orderValue ?? '',
        selectedId,
        otherProduct: nextPayload?.otherProduct ?? '',
        detailReason:
          nextPayload?.detailReason ??
          (Number(nextPayload?.itemValue) === 0 ? reasonInput ?? '' : ''),
        otherReason: nextPayload?.otherReason ?? '',
        otherCompetitor:
          nextPayload?.otherCompetitor ?? competitorOtherText ?? '',
      };
    };

    if (rawValue && typeof rawValue === 'object') {
      return handlerNormalizePayload(rawValue);
    }

    if (typeof rawValue === 'string' && rawValue.trim().startsWith('{')) {
      try {
        return handlerNormalizePayload(JSON.parse(rawValue));
      } catch (_) {
        return { ...defaultItemValue, itemValue: null };
      }
    }

    return { ...defaultItemValue, itemValue: rawValue ?? null };
  };

  const handlerGetDataListFromRaw = rawDataList => {
    if (Array.isArray(rawDataList)) return rawDataList;
    if (typeof rawDataList === 'string' && rawDataList.trim()) {
      try {
        const parsed = JSON.parse(rawDataList);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  };

  const handlerHasInputValue = value => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  const handlerIsItemCompletedForUpload = item => {
    const isRequired = Number(item?.IsRequired ?? item?.isRequired) === 1;
    if (!isRequired) return true;

    if (Number(item?.isSingleChoice) === 1 && Number(item?.IsNewOrder) === 1) {
      const payload = handlerGetPayloadFromItemValue(item?.ItemValue);
      const selectedValue = Number(payload?.itemValue);

      if (!handlerHasInputValue(payload?.itemValue)) return false;

      if (selectedValue === 0) {
        const otherReasonId = (reasonOptions || []).find(reason =>
          `${reason?.name || ''}`
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes('khac'),
        )?.id;
        if (
          !handlerHasInputValue(payload?.reasonId) ||
          !handlerHasInputValue(payload?.detailReason)
        )
          return false;
        if (
          (Number(payload?.reasonId) === 100 ||
            Number(payload?.reasonId) === Number(otherReasonId)) &&
          !handlerHasInputValue(payload?.otherReason)
        )
          return false;
        return true;
      }

      if (selectedValue === 1) {
        if (
          !handlerHasInputValue(payload?.price) ||
          !handlerHasInputValue(payload?.selectedId)
        )
          return false;
        if (
          (payload?.selectedId || []).some(id => Number(id) === 0) &&
          !handlerHasInputValue(payload?.otherProduct)
        )
          return false;
        return true;
      }

      return false;
    }

    if (
      Number(item?.isSingleChoice) === 1 &&
      Number(item?.IsCompetitor) === 1
    ) {
      const payload = handlerGetPayloadFromItemValue(item?.ItemValue);
      return handlerHasInputValue(payload?.itemValue);
    }

    return handlerHasInputValue(item?.ItemValue);
  };

  const handlerValidateData = () => {
    if (!Array.isArray(dataMain) || dataMain.length === 0) {
      MessageAcept('Thông báo', 'Chưa có dữ liệu để gửi', () => {});
      return false;
    }

    const missingRequiredItems = (dataMain || []).filter(
      item => !handlerIsItemCompletedForUpload(item),
    );
    if (missingRequiredItems.length > 0) {
      const previewNames = missingRequiredItems
        .map((item, idx) => `${idx + 1}. ${item?.KPIName || 'KPI chưa có tên'}`)
        .join('\n');
      MessageAcept(
        'Thiếu dữ liệu bắt buộc',
        `Vui lòng nhập đầy đủ các mục bắt buộc trước khi gửi:\n${previewNames}`,
        () => {},
      );
      return false;
    }

    return true;
  };

  const handlerGetGroupDataList = item => {
    const itemDataList = handlerGetDataListFromRaw(item?.DataList);
    if (itemDataList.length > 0) return itemDataList;
    return _.uniqBy(
      (dataMain || [])
        .filter(it => Number(it?.GroupId) === Number(item?.GroupId))
        .flatMap(it => handlerGetDataListFromRaw(it?.DataList)),
      it => `${it?.Id ?? ''}_${it?.KPIName ?? ''}_${it?.CompetitorName ?? ''}`,
    );
  };

  const onChooseYesNo = (index, item, optionValue, newOrderFlow = false) => {
    if (!newOrderFlow) {
      handlerUpdateItemValue(
        index,
        dataMain[index]?.ItemValue === optionValue ? null : optionValue,
      );
      return;
    }

    const currentPayload = handlerGetPayloadFromItemValue(
      dataMain[index]?.ItemValue,
    );
    if (currentPayload?.itemValue === optionValue) {
      handlerUpdateItemValue(index, null);
      return;
    }

    handlerUpdateItemValue(
      index,
      JSON.stringify({
        itemValue: optionValue,
        reasonId: optionValue === 0 ? currentPayload?.reasonId : null,
        price: optionValue === 1 ? currentPayload?.price ?? '' : '',
        selectedId: optionValue === 1 ? currentPayload?.selectedId ?? [] : [],
        otherProduct:
          optionValue === 1 ? currentPayload?.otherProduct ?? '' : '',
        detailReason:
          optionValue === 0 ? currentPayload?.detailReason ?? '' : '',
        otherReason: optionValue === 0 ? currentPayload?.otherReason ?? '' : '',
        otherCompetitor: currentPayload?.otherCompetitor ?? '',
      }),
    );
  };

  const onChooseReason = (index, item, reasonId) => {
    const currentPayload = handlerGetPayloadFromItemValue(
      dataMain[index]?.ItemValue,
    );
    handlerUpdateItemValue(
      index,
      JSON.stringify({
        itemValue: 0,
        reasonId: currentPayload?.reasonId === reasonId ? null : reasonId,
        price: '',
        selectedId: [],
        otherProduct: '',
        detailReason: currentPayload?.detailReason ?? '',
        otherReason: currentPayload?.otherReason ?? '',
        otherCompetitor: currentPayload?.otherCompetitor ?? '',
      }),
    );
  };

  const onChangePayloadValue = (index, key, value) => {
    const currentPayload = handlerGetPayloadFromItemValue(
      dataMain[index]?.ItemValue,
    );
    handlerUpdateItemValue(
      index,
      JSON.stringify({
        ...currentPayload,
        [key]: value,
      }),
    );
  };

  const onToggleDataListValue = (index, childId) => {
    const currentPayload = handlerGetPayloadFromItemValue(
      dataMain[index]?.ItemValue,
    );
    const nextId = Number(childId) === 100 ? 0 : Number(childId);
    const selectedId = Array.isArray(currentPayload?.selectedId)
      ? [...currentPayload.selectedId]
      : [];
    const findIndex = selectedId.findIndex(id => Number(id) === nextId);

    if (findIndex > -1) {
      selectedId.splice(findIndex, 1);
    } else {
      selectedId.push(nextId);
    }

    handlerUpdateItemValue(
      index,
      JSON.stringify({
        ...currentPayload,
        selectedId,
        otherProduct: selectedId.some(id => Number(id) === 0)
          ? currentPayload?.otherProduct ?? ''
          : '',
      }),
    );
  };

  const onChooseCompetitorValue = (index, childId, optionValue) => {
    const currentPayload = handlerGetPayloadFromItemValue(
      dataMain[index]?.ItemValue,
    );
    const selectedId = Array.isArray(currentPayload?.selectedId)
      ? [...currentPayload.selectedId]
      : [];
    const targetId = Number(childId);
    const selectedIndex = selectedId.findIndex(id => Number(id) === targetId);

    if (Number(optionValue) === 1 && selectedIndex === -1) {
      selectedId.push(targetId);
    } else if (selectedIndex > -1) {
      selectedId.splice(selectedIndex, 1);
    }

    handlerUpdateItemValue(
      index,
      JSON.stringify({
        ...currentPayload,
        itemValue: Number(optionValue),
        selectedId,
        otherCompetitor: selectedId.some(id => Number(id) === 0)
          ? currentPayload?.otherCompetitor ?? ''
          : '',
      }),
    );
  };

  const onChangeItemValue = (index, value) => {
    handlerUpdateItemValue(index, value);
  };

  const onUploadData = async () => {
    if (!handlerValidateData()) return;

    alertConfirm(
      'Gửi dữ liệu',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, bạn có chắc chắn không?',
      async () => {
        setLoading(true);
        await handlerSaveLocalData(dataMain);
        const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
        if (result?.statusId == 200) {
          setIsUploaded(1);
          MessageAcept(
            'Thông báo',
            result?.messager || 'Gửi dữ liệu thành công',
            () => navigation.goBack(),
          );
        } else {
          MessageAcept(
            'Lỗi dữ liệu',
            result?.messager || 'Gửi dữ liệu thất bại',
            () => {},
          );
        }
        setLoading(false);
      },
    );
  };

  const totalGroups = _.uniqBy(
    dataMain || [],
    it => `${it?.GroupId ?? ''}`,
  ).length;
  const reportDate = shopinfo?.auditDate || TODAY;

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: appcolor.light,
    },
    listHeaderWrap: {
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 10,
      backgroundColor: appcolor.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
    },
    listHeaderTitle: { fontSize: 13, color: appcolor.dark, fontWeight: '700' },
    listHeaderSub: { fontSize: 12, color: appcolor.greydark, marginTop: 4 },
    listHeaderInfoWrap: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: appcolor.grayLight,
      paddingTop: 8,
    },
    listHeaderInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    listHeaderInfoLabel: {
      fontSize: 12,
      color: appcolor.greydark,
      fontWeight: '600',
    },
    listHeaderInfoValue: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '700',
      flexShrink: 1,
      textAlign: 'right',
    },
    listHeaderStatus: {
      marginTop: 2,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: isUploaded == 1 ? appcolor.primary : appcolor.grayLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: appcolor.light,
    },
    listHeaderStatusText: {
      fontSize: 11,
      color: isUploaded == 1 ? appcolor.primary : appcolor.greydark,
      fontWeight: '700',
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: appcolor.primary,
      borderRadius: 10,
      marginTop: 8,
      marginBottom: 6,
    },
    groupHeaderText: {
      flex: 1,
      marginLeft: 8,
      marginRight: 8,
      fontSize: 13,
      lineHeight: 18,
      color: appcolor.light,
      fontWeight: '700',
    },
    itemCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.surface,
      padding: 12,
      marginBottom: 8,
    },
    itemName: {
      flex: 1,
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: '700',
      paddingRight: 6,
    },
    itemNameInline: {
      flex: 1,
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: '700',
      paddingRight: 8,
    },
    itemTitleRow: { flexDirection: 'row', alignItems: 'center' },
    inputWrap: { marginTop: 10 },
    yesNoRowInline: { flexDirection: 'row', alignItems: 'center', width: 140 },
    yesNoButtonInline: {
      flex: 1,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    yesNoButtonActive: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
    },
    yesNoButtonNegativeActive: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.surface,
    },
    yesNoTextInline: { fontSize: 12, color: appcolor.dark, fontWeight: '700' },
    yesNoTextActive: { fontSize: 12, color: appcolor.light },
    yesNoTextNegativeActive: { fontSize: 12, color: appcolor.primary },
    yesNoSeparatorInline: { width: 6 },
    optionListWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' },
    optionItem: {
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginRight: 8,
      marginBottom: 8,
    },
    optionItemText: { fontSize: 12, color: appcolor.dark, fontWeight: '600' },
    salesWrap: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 10,
      backgroundColor: appcolor.light,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    salesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 2,
    },
    salesLabel: { fontSize: 12, color: appcolor.primary, fontWeight: '600' },
    salesValue: { fontSize: 12, color: appcolor.dark, fontWeight: '700' },
    emptyWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
    },
    emptyText: {
      fontSize: 13,
      color: appcolor.placeholderText,
      textAlign: 'center',
    },
    reloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingVertical: 8,
      marginTop: 10,
    },
    reloadText: {
      fontSize: 13,
      color: appcolor.primary,
      fontWeight: '700',
      marginLeft: 6,
    },
  });

  const renderChoiceButtonsInline = (selectedValue, onPress) => {
    const hasSelectedValue =
      selectedValue !== null &&
      selectedValue !== undefined &&
      selectedValue !== '';
    return (
      <View style={styles.yesNoRowInline}>
        {yesNoOptions.map((option, optionIndex) => {
          const isActive =
            hasSelectedValue &&
            Number(selectedValue) === Number(option?.itemValue);
          const isYesOption = Number(option?.itemValue) === 1;
          return (
            <React.Fragment
              key={`choice_inline_${optionIndex}_${option?.itemValue}`}
            >
              {optionIndex > 0 && <View style={styles.yesNoSeparatorInline} />}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isUploaded == 1}
                onPress={() => isUploaded != 1 && onPress(option?.itemValue)}
                style={[
                  styles.yesNoButtonInline,
                  isActive &&
                    (isYesOption
                      ? styles.yesNoButtonActive
                      : styles.yesNoButtonNegativeActive),
                ]}
              >
                <Text
                  style={[
                    styles.yesNoTextInline,
                    isActive &&
                      (isYesOption
                        ? styles.yesNoTextActive
                        : styles.yesNoTextNegativeActive),
                  ]}
                >
                  {option?.itemName || ''}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderChipList = ({ list = [], keyPrefix = 'chip' }) => {
    return (
      <View style={styles.optionListWrap}>
        {list.map((child, childIndex) => (
          <View
            key={`${keyPrefix}_${child?.Id || childIndex}`}
            style={styles.optionItem}
          >
            <Text style={styles.optionItemText}>
              {child?.CompetitorName || child?.KPIName || ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHeader = (
    <View style={styles.listHeaderWrap}>
      <Text style={styles.listHeaderTitle}>Báo cáo Ghé thăm cửa hàng</Text>
      <Text style={styles.listHeaderSub}>
        Mở từng nhóm để nhập dữ liệu và nhấn gửi khi hoàn tất.
      </Text>
      <View style={styles.listHeaderInfoWrap}>
        <View style={styles.listHeaderInfoRow}>
          <Text style={styles.listHeaderInfoLabel}>Cửa hàng</Text>
          <Text style={styles.listHeaderInfoValue}>
            {shopinfo?.shopName || 'Chưa có thông tin'}
          </Text>
        </View>
        <View style={styles.listHeaderInfoRow}>
          <Text style={styles.listHeaderInfoLabel}>Ngày báo cáo</Text>
          <Text style={styles.listHeaderInfoValue}>
            {moment(`${reportDate}`, 'YYYYMMDD', true).isValid()
              ? moment(`${reportDate}`, 'YYYYMMDD').format('DD/MM/YYYY')
              : 'Chưa có thông tin'}
          </Text>
        </View>
        <View style={styles.listHeaderInfoRow}>
          <Text style={styles.listHeaderInfoLabel}>Nhóm KPI</Text>
          <Text
            style={styles.listHeaderInfoValue}
          >{`${totalGroups} nhóm`}</Text>
        </View>
        <View style={styles.listHeaderStatus}>
          <Text style={styles.listHeaderStatusText}>
            {isUploaded == 1
              ? 'Trạng thái: Đã gửi dữ liệu'
              : 'Trạng thái: Chưa gửi dữ liệu'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const groupDataList = handlerGetGroupDataList(item);
    const payload = handlerGetPayloadFromItemValue(item?.ItemValue);
    const hasItemValue =
      payload?.itemValue !== null &&
      payload?.itemValue !== undefined &&
      payload?.itemValue !== '';
    const isChooseYes = hasItemValue && Number(payload?.itemValue) === 1;
    const isChooseNo = hasItemValue && Number(payload?.itemValue) === 0;
    const isShowReasonList =
      Number(item?.isSingleChoice) === 1 && item.IsNewOrder == 1 && isChooseNo;
    const shouldShowSales = Number(item?.IsDisplaySales) === 1;
    const groupKey = (item?.GroupId ?? index).toString();
    const isCollapsed = collapsedGroups[groupKey] === true;

    return (
      <View>
        {item?.isParent && item?.GroupName !== undefined && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setCollapsedGroups(prev => ({
                ...prev,
                [groupKey]: !prev[groupKey],
              }))
            }
            style={styles.groupHeader}
          >
            <SpiralIcon
              name="layers"
              type="feather"
              size={16}
              color={appcolor.light}
            />
            <Text style={styles.groupHeaderText}>
              {item?.GroupName || `Nhóm ${index + 1}`}
            </Text>
            <SpiralIcon
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              type="feather"
              size={16}
              color={appcolor.light}
            />
          </TouchableOpacity>
        )}

        {!isCollapsed && (
          <View style={styles.itemCard}>
            {Number(item?.isSingleChoice) === 1 &&
            Number(item?.IsCompetitor) !== 1 ? (
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemNameInline}>
                  {item?.KPIName || 'Chưa có tên KPI'}
                </Text>
                {renderChoiceButtonsInline(payload?.itemValue, value =>
                  onChooseYesNo(index, item, value, item.IsNewOrder === 1),
                )}
              </View>
            ) : (
              <Text style={styles.itemName}>
                {item?.KPIName || 'Chưa có tên KPI'}
              </Text>
            )}

            {shouldShowSales && (
              <View style={styles.salesWrap}>
                {item.SalesLastMonth !== undefined && (
                  <View style={styles.salesRow}>
                    <Text style={styles.salesLabel}>Doanh số tháng trước</Text>
                    <Text style={styles.salesValue}>
                      {formatNumber(item?.SalesLastMonth ?? 0, '.')}
                    </Text>
                  </View>
                )}
                {item.SalesToDate !== undefined && (
                  <View style={styles.salesRow}>
                    <Text style={styles.salesLabel}>Doanh số tới hiện tại</Text>
                    <Text style={styles.salesValue}>
                      {formatNumber(item?.SalesToDate ?? 0, '.')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {!(item?.IsNewOrder === 1) &&
              Number(item?.IsCompetitor) !== 1 &&
              groupDataList.length > 0 &&
              item?.isParent &&
              renderChipList({
                list: groupDataList,
                keyPrefix: `readonly_${item?.Id || index}`,
              })}

            {Number(item?.IsCompetitor) === 1 && (
              <CompetitorSection
                item={item}
                index={index}
                payload={payload}
                groupDataList={groupDataList}
                yesNoOptions={yesNoOptions}
                isUploaded={isUploaded}
                onChooseCompetitorValue={onChooseCompetitorValue}
                onChangePayloadValue={onChangePayloadValue}
              />
            )}

            {item?.IsNewOrder === 1 && (
              <NewOrderSection
                item={item}
                index={index}
                payload={payload}
                groupDataList={groupDataList}
                reasonOptions={reasonOptions}
                isUploaded={isUploaded}
                isChooseYes={isChooseYes}
                isChooseNo={isChooseNo}
                isShowReasonList={isShowReasonList}
                onChooseReason={onChooseReason}
                onChangePayloadValue={onChangePayloadValue}
                onToggleDataListValue={onToggleDataListValue}
              />
            )}

            {Number(item?.Note) === 1 && Number(item?.isSingleChoice) !== 1 && (
              <View style={styles.inputWrap}>
                <FormGroup
                  editable={isUploaded != 1}
                  useClearAndroid={true}
                  title={'Nhập nội dung'}
                  placeholder={
                    item.GroupId == 1
                      ? 'Nhập chi tiết tên sản phẩm, cách nhau bởi dấu ","'
                      : 'Nhập nội dung'
                  }
                  value={(item?.ItemValue ?? '').toString()}
                  handleChangeForm={value => onChangeItemValue(index, value)}
                  onClearTextAndroid={() => onChangeItemValue(index, '')}
                />
              </View>
            )}

            {Number(item?.NumberWarning) === 1 &&
              Number(item?.isSingleChoice) !== 1 && (
                <View style={styles.inputWrap}>
                  <FormGroup
                    editable={isUploaded != 1}
                    useClearAndroid={true}
                    title={'Nhập số'}
                    placeholder={'Nhập số'}
                    value={formatNumber(item?.ItemValue ?? '', '.')}
                    keyboardType={'decimal-pad'}
                    handleChangeForm={value =>
                      onChangeItemValue(index, formatNumber(value, '.'))
                    }
                    onClearTextAndroid={() => onChangeItemValue(index, '')}
                  />
                </View>
              )}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>Chưa có dữ liệu KPI cho cửa hàng này</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={LoadData}
        style={styles.reloadButton}
      >
        <SpiralIcon
          name="refresh-ccw"
          type="feather"
          size={16}
          color={appcolor.primary}
        />
        <Text style={styles.reloadText}>Tải lại dữ liệu</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LoadingDefault isLoading={loading} title={'Đang tải dữ liệu KPI...'} />
    );
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Sales Promoter'}
        subTitle={shopinfo.shopName || ''}
        leftFunc={() => navigation.goBack()}
        iconRight={'cloud-upload-alt'}
        rightFunc={isUploaded == 1 ? null : onUploadData}
      />
      <CustomListView
        data={dataMain}
        renderItem={renderItem}
        ListHeader={renderHeader}
        ListEmpty={renderEmpty}
        extraData={dataMain}
        bottomView={{ paddingBottom: deviceHeight / 2 }}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

export default SalesPromoterScreen;
