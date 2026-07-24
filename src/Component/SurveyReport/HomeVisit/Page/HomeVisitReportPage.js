import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { REPORT } from '../../../../API/ReportAPI';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { Icon, Text } from '@rneui/base';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import { LoadingView } from '../../../../Control/ItemLoading';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import { alertConfirm } from '../../../../Core/Utility';
import SurveyItemDetails from './SurveyItemDetails';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CustomTab from '../../../../Control/Custom/CustomTab';
import { groupDataByKey } from '../../../../Core/Helper';
import moment from 'moment';
import _ from 'lodash';

const HomeVisitReportPage = ({
  navigation,
  headerTitle,
  enableCreatePlan = false,
  onCreatePlan,
  onSurveyItem,
}) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [search, _setItemSearch] = useState({ text: '' });
  const [editConfig, setEditConfig] = useState({
    visible: false,
    item: null,
    details: [],
  });

  const normalizeText = text => {
    return `${text || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const parseDataDetails = detailsText => {
    try {
      const details = JSON.parse(detailsText || '[]');
      return Array.isArray(details) ? details : [];
    } catch (error) {
      return [];
    }
  };

  const _searchData = (text, sourceData = dataMain) => {
    const keyword = normalizeText(text);
    if (!keyword) return sourceData;

    return sourceData.reduce((result, item) => {
      const details = parseDataDetails(item.dataDetails);
      const parentText = normalizeText(
        `${item.titleName} ${item.employeeAction}`,
      );
      if (parentText.includes(keyword)) {
        result.push(item);
        return result;
      }

      const matchedDetails = details.filter(detail => {
        const detailText = normalizeText(
          `${detail.ItemName} ${detail.Value} ${detail.DescriptionName}`,
        );
        return detailText.includes(keyword);
      });

      if (matchedDetails.length > 0) {
        result.push(item);
      }
      return result;
    }, []);
  };

  const LoadData = async () => {
    await setLoading(true);
    const params = {
      shopId: shopinfo.shopId || 0,
      reportId: kpiinfo.id,
    };
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      const groupList = _.unionBy(mData, 'groupName');
      const { arr } = groupDataByKey({ arr: mData, keyGroup: 'id' });
      setDataGroup(groupList);
      setDataMain(arr);
      setData(_searchData(search.text, arr));
    });
    await setLoading(false);
  };

  const onSearchData = (text = '') => {
    _setItemSearch({ text });
    setExpandedItems({});
    setData(_searchData(text));
  };

  const onBack = () => {
    navigation.goBack();
  };

  const onDeleteItem = item => {
    if (!item) return;
    alertConfirm(
      'Xóa dữ liệu',
      'Bạn có chắc muốn xóa mục này không?',
      async () => {
        await setLoading(true);
        const payload = { ...item, typeAction: 'DELETE' };
        const result = await REPORT.UploadDataRaw_Realtime(
          payload,
          shopinfo,
          kpiinfo.id,
        );
        if (result?.statusId == 200) {
          toastSuccess(
            result?.messager || 'Xóa dữ liệu thành công',
            'Thông báo',
            'top',
          );
          await LoadData();
        } else {
          toastError('Thông báo', result?.messager || 'Xóa dữ liệu thất bại');
        }
        await setLoading(false);
      },
    );
  };

  const onEditItem = item => {
    const dataDetails = parseDataDetails(item?.dataDetails);
    setEditConfig({ visible: true, item: item || null, details: dataDetails });
  };

  const onCloseEditModal = () => {
    setEditConfig({ visible: false, item: null, details: [] });
  };

  const onEditDetailChanged = (itemUpdated, index) => {
    setEditConfig(prev => {
      const details = [...(prev.details || [])];
      details[index] = { ...itemUpdated };
      if (itemUpdated?.distance != null) {
        const distIdx = details.findIndex(d => d.KeyValue === 'distance');

        if (distIdx !== -1 && distIdx !== index) {
          details[distIdx] = {
            ...details[distIdx],
            Value: itemUpdated.distance,
          };
        }
      }
      return { ...prev, details };
    });
  };

  const onSaveEditItem = async () => {
    if (!editConfig.item) return;
    await setLoading(true);
    const payload = (editConfig.details || []).map(detail => ({
      ...detail,
      id: editConfig.item.id,
      typeAction: 'UPDATE',
    }));
    const result = await REPORT.UploadDataRaw_Realtime(
      payload,
      shopinfo,
      kpiinfo.id,
    );
    if (result?.statusId == 200) {
      toastSuccess(
        result?.messager || 'Cập nhật dữ liệu thành công',
        'Thông báo',
        'top',
      );
      onCloseEditModal();
      await LoadData();
    } else {
      toastError('Thông báo', result?.messager || 'Cập nhật dữ liệu thất bại');
    }
    await setLoading(false);
  };

  useEffect(() => {
    const reloaddata = DeviceEventEmitter.addListener(
      'reloadhomevisit',
      LoadData,
    );
    LoadData();
    return () => {
      reloaddata.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: {
      marginHorizontal: 10,
      marginTop: 10,
      backgroundColor: appcolor.light,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.surface,
      overflow: 'hidden',
    },
    viewHeader: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      backgroundColor: appcolor.primary,
    },
    headerLeft: { flex: 1, paddingRight: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    orderBadge: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
      marginRight: 8,
    },
    orderBadgeText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      flexShrink: 1,
    },
    subTitleName: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    headerRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 6 },
    subTimeTitle: {
      fontSize: 11,
      color: appcolor.dark,
      fontStyle: 'italic',
      textAlign: 'right',
      marginTop: 8,
    },
    timeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    itemDetailContainer: {
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: appcolor.surface,
    },
    itemDetailContainerLast: { borderBottomWidth: 0, paddingBottom: 0 },
    titleDetailName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      maxWidth: '40%',
    },
    valueText: {
      fontSize: 12,
      color: appcolor.dark,
      textAlign: 'right',
      lineHeight: 18,
      width: '60%',
      paddingEnd: 4,
    },
    viewMoreButton: {
      marginTop: 6,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    viewMoreText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    viewDetails: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: appcolor.light,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      gap: 8,
    },
    actionButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.surface,
      backgroundColor: appcolor.light,
    },
    actionButtonDelete: {
      borderColor: appcolor.red,
      backgroundColor: appcolor.red + '15',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      paddingHorizontal: 16,
    },
    actionDeleteText: { color: appcolor.red },
    modalBackdrop: { flex: 1, backgroundColor: appcolor.light },
    modalContainer: {
      flex: 1,
      backgroundColor: appcolor.light,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    modalList: { flex: 1 },
    modalTitle: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 8,
    },
    modalItemContainer: {
      marginBottom: 10,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.surface,
    },
    modalSubTitle: { fontSize: 11, color: appcolor.greydark, marginTop: 2 },
    modalActionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      paddingTop: 10,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: appcolor.surface,
    },
    modalActionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalActionPrimary: { backgroundColor: appcolor.primary },
    modalActionText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    modalActionPrimaryText: { color: appcolor.light },
    requireText: { fontSize: 12, color: appcolor.red },
  });

  const onToggleExpand = itemKey => {
    setExpandedItems(prevState => ({
      ...prevState,
      [itemKey]: !prevState[itemKey],
    }));
  };

  const renderItemDetail = ({ item, index }, totalItems) => {
    const isLastItem = index === totalItems - 1;
    if (item.Value === undefined || item.Value === null || item.Value === '')
      return null;
    //
    const listInputValue =
      item.ItemType == 'listinput' &&
      _.map(
        JSON.parse(item.Value || '[]'),
        v => `${v.ItemName}: ${v.Value}`,
      ).join('\n');
    return (
      <View
        style={[
          styles.itemDetailContainer,
          isLastItem && styles.itemDetailContainerLast,
        ]}
      >
        <Text style={styles.titleDetailName}>{item.ItemName}</Text>
        <Text style={styles.valueText}>{`${listInputValue || item.Value} ${
          item.DescriptionName || ''
        }`}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const dataDetails = parseDataDetails(item.dataDetails);
    const itemKey = `${item.id || index}`;
    const isExpanded = !!expandedItems[itemKey];
    const visibleDetails = isExpanded ? dataDetails : dataDetails.slice(0, 4);
    const hasMoreDetails = dataDetails.length > 4;
    const onPress = () => onSurveyItem(item);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        disabled={item.isSurvey !== 1}
        onPress={onPress}
      >
        {item.isParent && (
          <View style={styles.viewHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.titleName} numberOfLines={2}>
                  {item.titleName}
                </Text>
              </View>
              <Text style={styles.subTitleName}>{`Người thực hiện: ${
                item.employeeAction || 'Chưa có thông tin'
              }`}</Text>
            </View>
            <View style={styles.headerRight}>
              {item.isEdit == 1 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEditItem(item)}
                  activeOpacity={0.8}
                >
                  <SpiralIcon
                    name="create"
                    type="ionicon"
                    size={16}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              )}
              {item.isRemove == 1 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDeleteItem(item)}
                  activeOpacity={0.8}
                >
                  <SpiralIcon
                    name="trash-outline"
                    type="ionicon"
                    size={16}
                    color={appcolor.dark}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        <View style={styles.viewDetails}>
          <CustomListView
            data={visibleDetails}
            extraData={[visibleDetails.length, isExpanded]}
            renderItem={params =>
              renderItemDetail(params, visibleDetails.length)
            }
            bottomView={{ paddingBottom: 0 }}
          />
          {hasMoreDetails && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => onToggleExpand(itemKey)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewMoreText}>
                {isExpanded
                  ? 'Thu gọn'
                  : `Xem thêm ${dataDetails.length - 4} thông tin`}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.subTimeTitle}>
            {moment(item.createdDate).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItemEdit = ({ item, index }) => {
    return (
      <View style={styles.modalItemContainer}>
        <Text style={[styles.titleDetailName, { maxWidth: '100%' }]}>
          {item?.ItemName || `Thông tin ${index + 1}`}
          {item.IsRequired == 1 && <Text style={styles.requireText}>*</Text>}
        </Text>
        {!!item?.DescriptionName && (
          <Text style={styles.modalSubTitle}>{item.DescriptionName}</Text>
        )}
        <SurveyItemDetails
          itemMain={item}
          onSaveData={itemUpdated => onEditDetailChanged(itemUpdated, index)}
        />
      </View>
    );
  };

  const renderTab = item => {
    const dataItem = _.filter(data, d => d.groupName === item.groupName);
    return (
      <CustomListView
        data={dataItem}
        extraData={[dataItem, expandedItems]}
        renderItem={renderItem}
        onRefresh={LoadData}
      />
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={headerTitle}
        leftFunc={onBack}
        rightType={enableCreatePlan ? 'ionicon' : undefined}
        iconRight={enableCreatePlan ? 'calendar-outline' : undefined}
        rightFunc={enableCreatePlan ? onCreatePlan : undefined}
      />
      <SearchData
        placeholder="Tìm kiếm dữ liệu"
        value={search.text}
        onSearchData={onSearchData}
      />
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      {dataGroup.length > 0 ? (
        <CustomTab
          data={dataGroup}
          dataMain={data}
          keyTabName="groupName"
          renderItem={renderTab}
        />
      ) : (
        <CustomListView
          data={data}
          extraData={[data, expandedItems]}
          renderItem={renderItem}
          onRefresh={LoadData}
          bottomView={{ paddingBottom: 48 }}
        />
      )}
      <Modal
        visible={editConfig.visible}
        transparent
        animationType="fade"
        statusBarTranslucent={false}
        onRequestClose={onCloseEditModal}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chỉnh sửa dữ liệu</Text>
              <View style={styles.modalList}>
                <CustomListView
                  data={editConfig.details}
                  extraData={editConfig.details}
                  renderItem={renderItemEdit}
                  bottomView={{
                    paddingBottom: Platform.OS === 'ios' ? deviceHeight / 3 : 8,
                  }}
                />
              </View>
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={onCloseEditModal}
                >
                  <Text style={styles.modalActionText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalActionPrimary]}
                  onPress={onSaveEditItem}
                >
                  <Text
                    style={[
                      styles.modalActionText,
                      styles.modalActionPrimaryText,
                    ]}
                  >
                    Cập nhật
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default HomeVisitReportPage;
