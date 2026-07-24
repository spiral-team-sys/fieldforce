import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { REPORT } from '../../../API/ReportAPI';
import { toastError } from '../../../Utils/configToast';
import { SearchData } from '../../../Control/SearchData/SearchData';
import { LoadingView } from '../../../Control/ItemLoading';
import CustomListView from '../../../Control/Custom/CustomListView';
import { Avatar, ButtonGroup, Icon, Text } from '@rneui/base';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import {
  formatReportTemplateJsonString,
  parseReportTemplateJsonString,
} from './ShareHelper';
import moment from 'moment';
import _ from 'lodash';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const ShareReportScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const [selectedGroupByItem, setSelectedGroupByItem] = useState({});
  const config = JSON.parse(kpiinfo.reportItem || '{}');
  //
  const LoadData = async () => {
    await setLoading(true);
    const params = {
      shopId: shopinfo.shopId || 0,
      reportId: kpiinfo.id,
      typeReport: config.reportName || 'DEFAULT',
    };
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      setData(mData);
      setDataMain(mData);
    });
    await setLoading(false);
  };
  //
  const handleShareReport = item => {
    try {
      // Data
      const templateJsonString = formatReportTemplateJsonString(item);
      const template = parseReportTemplateJsonString(templateJsonString);
      // Photo
      const photoJsonString = JSON.parse(item.dataPhoto || '[]');
      //
      navigation.navigate('contentdetail', {
        draftContent: template,
        photoSurvey: photoJsonString,
      });
    } catch (error) {
      toastError('Lỗi', 'Không thể tạo bản draft: ' + error.message);
    }
  };
  //
  const onSearchData = text => {
    const keyword = `${text || ''}`.trim().toLowerCase();

    if (!keyword) {
      setData(dataMain);
      return;
    }

    const filteredData = dataMain.filter(item => {
      const dataReport = JSON.parse(item.dataReport || '[]');
      const reportContent = dataReport
        .map(
          reportItem =>
            `${reportItem.ItemName || ''} ${getDisplayValue(reportItem.Value)}`,
        )
        .join(' ')
        .toLowerCase();
      const searchSource = [
        item.customerName,
        item.address,
        item.shopCode,
        item.shopName,
        item.createdBy,
        reportContent,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchSource.includes(keyword);
    });

    setData(filteredData);
  };
  //
  const onShowDetails = item => {
    item.isShowDetails = !item.isShowDetails;
    setMutate(e => !e);
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: appcolor.loadingContent,
    },
    contentContainer: { flex: 1, padding: 8 },
    itemContainer: {
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      marginBottom: 8,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.surface,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      overflow: 'hidden',
    },
    viewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      padding: 8,
    },
    viewAvatar: { marginRight: 12 },
    titleName: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
    subTitleName: { fontSize: 12, color: appcolor.placeholderText },
    subTitleTime: {
      fontSize: 11,
      fontStyle: 'italic',
      color: appcolor.placeholderText,
      textAlign: 'right',
      padding: 8,
      paddingTop: 0,
    },
    itemInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 2,
    },
    itemTagReport: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 4,
      flexWrap: 'wrap',
    },
    viewTag: {
      backgroundColor: appcolor.primary + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 4,
      marginBottom: 4,
    },
    detailsContainer: {
      margin: 8,
      marginTop: 0,
      paddingTop: 8,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      overflow: 'hidden',
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    detailsLabel: {
      flex: 1,
      fontSize: 12,
      color: appcolor.dark,
      paddingRight: 8,
      fontWeight: fontWeightBold,
    },
    detailsValue: {
      flex: 1,
      fontSize: 12,
      color: appcolor.dark,
      textAlign: 'right',
    },
    detailsDivider: {
      height: 1,
      backgroundColor: appcolor.grayLight + '70',
      marginHorizontal: 10,
    },
    groupTabsContainer: {
      paddingHorizontal: 6,
      backgroundColor: appcolor.light,
    },
    groupTabsButton: {
      height: 32,
      backgroundColor: appcolor.surface,
      borderColor: appcolor.transparent,
      borderRadius: 8,
      overflow: 'hidden',
    },
    groupTabsSelected: { backgroundColor: appcolor.primary, borderRadius: 8 },
    textGroupButton: {
      fontSize: 12,
      color: appcolor.light,
      fontWeight: fontWeightBold,
    },
    shareButtonContainer: {
      paddingHorizontal: 8,
      paddingBottom: 8,
      paddingTop: 2,
      alignItems: 'flex-end',
    },
    shareButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowOpacity: 0.25,
      shadowColor: appcolor.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
    },
    shareButtonText: {
      fontSize: 12,
      color: appcolor.light,
      fontWeight: fontWeightBold,
      marginLeft: 6,
    },
    buttonShare: {
      width: 38,
      height: 38,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      backgroundColor: appcolor.surface,
      position: 'absolute',
      top: 8,
      end: 8,
      zIndex: 10,
    },
  });
  const getDisplayValue = rawValue => {
    const toValueString = valueList => {
      return valueList
        .map(valueItem => {
          if (_.isObject(valueItem)) {
            return valueItem?.Value;
          }
          return valueItem;
        })
        .filter(
          valueItem =>
            valueItem !== null &&
            valueItem !== undefined &&
            `${valueItem}`.trim() !== '',
        )
        .join(', ');
    };

    if (Array.isArray(rawValue)) {
      const parsedValue = toValueString(rawValue);
      return parsedValue || '-';
    }

    if (typeof rawValue === 'string') {
      const textValue = rawValue.trim();
      if (textValue.startsWith('[') && textValue.endsWith(']')) {
        try {
          const valueArray = JSON.parse(textValue);
          if (Array.isArray(valueArray)) {
            const parsedValue = toValueString(valueArray);
            return parsedValue || '-';
          }
        } catch (error) { }
      }
      return textValue || '-';
    }

    if (
      rawValue === null ||
      rawValue === undefined ||
      `${rawValue}`.trim() === ''
    ) {
      return '-';
    }

    return `${rawValue}`;
  };
  const renderReportDetails = (
    dataReport,
    groupReportName,
    selectedIndex = 0,
    onSelectGroup,
  ) => {
    if (!Array.isArray(dataReport) || dataReport.length === 0) {
      return null;
    }

    const reportByGroup = _.groupBy(
      dataReport,
      itemReport => itemReport.GroupName || 'Chi tiết',
    );
    const groups =
      Array.isArray(groupReportName) && groupReportName.length > 0
        ? groupReportName
          .map(itemGroup => itemGroup.GroupName || 'Chi tiết')
          .map(groupName => [groupName, reportByGroup[groupName] || []])
        : Object.entries(reportByGroup);
    const groupLabels = groups.map(([groupName]) => groupName);
    const activeIndex = Math.min(selectedIndex, Math.max(groups.length - 1, 0));
    const selectedGroup = groups[activeIndex];

    return (
      <View style={styles.detailsContainer}>
        {groupLabels.length > 1 && (
          <View style={styles.groupTabsContainer}>
            <ButtonGroup
              buttons={groupLabels}
              selectedIndex={activeIndex}
              onPress={onSelectGroup}
              containerStyle={styles.groupTabsButton}
              innerBorderStyle={{ color: appcolor.transparent, width: 0 }}
              selectedButtonStyle={styles.groupTabsSelected}
              textStyle={styles.subTitleName}
              selectedTextStyle={styles.textGroupButton}
            />
          </View>
        )}
        {selectedGroup && (
          <View key={`${selectedGroup[0]}-${activeIndex}`}>
            {selectedGroup[1].map((itemReport, indexReport) => (
              <View
                key={`${selectedGroup[0]}-${itemReport.ItemName || 'item'
                  }-${indexReport}`}
              >
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>
                    {itemReport.ItemName || 'Nội dung'}
                  </Text>
                  <Text style={styles.detailsValue}>
                    {getDisplayValue(itemReport.Value)}
                  </Text>
                </View>
                {indexReport < selectedGroup[1].length - 1 && (
                  <View style={styles.detailsDivider} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const dataReport = JSON.parse(item.dataReport || '[]');
    const groupReportName = _.unionBy(dataReport, 'GroupName');
    const itemKey = `${item.id || item.createdDate || 'report'}-${index}`;
    const selectedIndex = selectedGroupByItem[itemKey] ?? 0;
    const onSelectGroup = groupIndex =>
      setSelectedGroupByItem(prevState => ({
        ...prevState,
        [itemKey]: groupIndex,
      }));
    const onPress = () => onShowDetails(item);
    const onSharePress = () => handleShareReport(item);
    return (
      <View>
        {/* Infomation */}
        <View style={styles.itemContainer}>
          <TouchableOpacity style={styles.buttonShare} onPress={onSharePress}>
            <SpiralIcon
              name="share-social-outline"
              type="ionicon"
              size={20}
              color={appcolor.gray}
            />
          </TouchableOpacity>
          {/* // Header */}
          <TouchableOpacity style={styles.viewHeader} onPress={onPress}>
            <Avatar
              title={item.customerName ? item.customerName[0] : '?'}
              size={42}
              rounded
              containerStyle={[
                styles.viewAvatar,
                { backgroundColor: appcolor.surface },
              ]}
              titleStyle={{ color: appcolor.primary, fontSize: 18 }}
            />
            <View>
              <Text style={styles.titleName}>{`KH: ${item.customerName}`}</Text>
              <View style={styles.itemInfoHeader}>
                <SpiralIcon
                  name="location-outline"
                  type="ionicon"
                  size={12}
                  color={appcolor.gray}
                  style={{ paddingEnd: 4 }}
                />
                <Text
                  style={[styles.subTitleName, { width: '70%' }]}
                  numberOfLines={2}
                >
                  {item.address}
                </Text>
              </View>
              <View style={styles.itemInfoHeader}>
                <SpiralIcon
                  name="business-outline"
                  type="ionicon"
                  size={12}
                  color={appcolor.gray}
                  style={{ paddingEnd: 4 }}
                />
                <Text
                  style={[styles.subTitleName, { width: '89%' }]}
                  numberOfLines={2}
                >{`[${item.shopCode}] - ${item.shopName}`}</Text>
              </View>
              {!item.isShowDetails && (
                <View style={styles.itemTagReport}>
                  {groupReportName.map((itemGroup, indexGroup) => (
                    <View key={indexGroup} style={styles.viewTag}>
                      <Text
                        style={[
                          styles.subTitleName,
                          {
                            color: appcolor.primary,
                            fontWeight: fontWeightBold,
                          },
                        ]}
                      >
                        {itemGroup.GroupName}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
          {/* // Details */}
          {item.isShowDetails &&
            renderReportDetails(
              dataReport,
              groupReportName,
              selectedIndex,
              onSelectGroup,
            )}
          <Text style={styles.subTitleTime}>{`${moment(
            item.createdDate,
          ).fromNow()}`}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Share Report'}
        leftFunc={onBack}
      />
      <SearchData
        placeholder="Tìm kiếm thông tin"
        onSearchData={onSearchData}
      />
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      <View style={styles.contentContainer}>
        <CustomListView
          data={data}
          extraData={data}
          renderItem={renderItem}
          onRefresh={LoadData}
        />
      </View>
    </View>
  );
};

export default ShareReportScreen;
