import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { REPORT } from '../../../../API/ReportAPI';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import CustomTab from '../../../../Control/Custom/CustomTab';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { Text } from '@rneui/base';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import SurveyItemDetails from '../Page/SurveyItemDetails';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import { Message } from '../../../../Core/Helper';
import {
  deleteDataRaw,
  removeRawReport,
  saveJsonData,
} from '../../../../Controller/ReportController';
import {
  alertConfirm,
  alertNotify,
  onValidPhoneNumber,
  TODAY,
} from '../../../../Core/Utility';
import _ from 'lodash';
import { LoadingView } from '../../../../Control/ItemLoading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const parseJsonArray = value => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeText = text => {
  return `${text || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const HomeVisitScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [search, _setItemSearch] = useState({ text: '' });
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    const params = {
      shopId: shopinfo.shopId || 0,
      reportId: kpiinfo.id,
    };
    console.log(params);

    await REPORT.GetDataReportByShop(params, async (mData, message) => {
      message && toastError('Thông báo', message);
      const groupList = _.unionBy(mData, 'GroupName');
      await setDataGroup(groupList);
      await setDataMain(mData);
      await setData(mData);
    });
    const _lastUpdate = await AsyncStorage.getItem(`lastupdate_${kpiinfo.id}`);
    await setLastUpdate(_lastUpdate);
    await setLoading(false);
  };

  const UploadData = async () => {
    const isValid = validData();
    if (!isValid) return;
    //
    alertConfirm(
      'Gửi dữ liệu',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await setLoading(true);
        const paramShop = {
          shopId: shopinfo.shopId || 0,
          auditDate: shopinfo.auditDate || TODAY,
        };
        const result = await REPORT.UploadDataRaw(paramShop, kpiinfo.id);
        if (result.statusId == 200) {
          await removeRawReport(shopinfo.shopId || 0, kpiinfo.id);
          toastSuccess(result.messager, 'Thông báo', 'top');
          DeviceEventEmitter.emit('reloadhomevisit');
          onBack();
        } else {
          toastError(result.messager, 'Lỗi dữ liệu', 'top');
        }
        await setLoading(false);
      },
    );
  };

  const validData = () => {
    const missingRequired = [];
    const invalidPhones = [];

    for (let i = 0; i < dataMain.length; i++) {
      const item = dataMain[i];
      const value = `${item?.Value || ''}`.trim();
      const itemType = `${item?.ItemType || ''}`.toLowerCase();

      if (itemType === 'listinput') {
        const listValues = parseJsonArray(item?.Value);
        const missingFields = listValues.filter(
          inputItem => !`${inputItem?.Value || ''}`.trim(),
        );

        if (
          item?.IsRequired == 1 &&
          (listValues.length === 0 || missingFields.length > 0)
        ) {
          const missingNames = missingFields
            .map(inputItem => inputItem?.ItemName)
            .filter(Boolean);
          missingRequired.push(
            missingNames.length > 0
              ? `${
                  item?.ItemName || item.GroupName || 'Câu hỏi'
                }: ${missingNames.join(', ')}`
              : item?.ItemName || item.GroupName || 'Câu hỏi',
          );
        }

        continue;
      }

      if (item?.IsRequired == 1 && !value) {
        missingRequired.push(item?.ItemName || item.GroupName || 'Câu hỏi');
      }

      if (itemType === 'phone' && value) {
        const phoneError = onValidPhoneNumber(value);
        if (phoneError) {
          invalidPhones.push(`${item?.ItemName || 'Số điện thoại'}: ${value}`);
        }
      }
    }

    if (missingRequired.length > 0 || invalidPhones.length > 0) {
      const messageParts = [];
      if (missingRequired.length > 0) {
        messageParts.push(
          `Vui lòng điền đầy đủ thông tin cho:\n${missingRequired.join('\n')}`,
        );
      }
      if (invalidPhones.length > 0) {
        messageParts.push(
          `Số điện thoại không hợp lệ:\n${invalidPhones.join('\n')}`,
        );
      }
      alertNotify(messageParts.join('\n\n'));
      return false;
    }

    return true;
  };

  const handleSaveData = async itemUpdated => {
    const distanceValue = itemUpdated?.distance;
    const itemGroupId = itemUpdated?.GroupId ?? itemUpdated?.groupId;
    const shouldUpdateDistance = distanceValue != null && itemGroupId != null;

    const applyDistanceValue = (source = []) => {
      if (!shouldUpdateDistance) return source;
      return source.map(detail => {
        const detailGroupId = detail?.GroupId ?? detail?.groupId;
        const keyValue = `${
          detail?.KeyValue ?? detail?.keyValue ?? ''
        }`.toLowerCase();
        if (detailGroupId === itemGroupId && keyValue === 'distance') {
          return { ...detail, Value: distanceValue };
        }
        return detail;
      });
    };

    const nextDataMain = applyDistanceValue(dataMain);
    if (shouldUpdateDistance) {
      setDataMain(nextDataMain);
      setData(prev => applyDistanceValue(prev));
    }
    await saveJsonData(shopinfo.shopId || 0, kpiinfo.id, TODAY, nextDataMain);
  };

  const onBack = () => {
    navigation.goBack();
  };

  const onRenewData = () => {
    Message('Chú ý', 'Bạn có chắc chắn muốn tải lại dữ liệu?', async () => {
      await deleteDataRaw(shopinfo.shopId || 0, kpiinfo.id);
      await setData([]);
      await setDataMain([]);
      await LoadData();
    });
  };

  const onSearchData = (text = '') => {
    _setItemSearch({ text });
    const keyword = normalizeText(text);

    if (!keyword) {
      setData(dataMain);
      setDataGroup(_.unionBy(dataMain, 'GroupName'));
      return;
    }

    const filterData = _.filter(dataMain, item => {
      const groupName = normalizeText(item?.GroupName);
      const itemName = normalizeText(item?.ItemName);
      const descriptionName = normalizeText(item?.DescriptionName);
      const value = normalizeText(item?.Value);
      return (
        groupName.includes(keyword) ||
        itemName.includes(keyword) ||
        descriptionName.includes(keyword) ||
        value.includes(keyword)
      );
    });

    setData(filterData);
    setDataGroup(_.unionBy(filterData, 'GroupName'));
  };

  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    viewHeader: { paddingHorizontal: 12, paddingVertical: 16 },
    itemContainer: {
      flex: 1,
      padding: 8,
      paddingHorizontal: 14,
      backgroundColor: appcolor.light,
      borderRadius: 8,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: { fontSize: 11, color: appcolor.greydark, marginTop: 4 },
    requireText: { fontSize: 12, color: appcolor.red },
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
  });

  const renderTab = item => {
    const dataItem = _.filter(data, d => d.GroupId === item.GroupId);
    return (
      <CustomListView
        data={dataItem}
        extraData={[dataItem]}
        renderItem={renderItem}
        bottomView={{ paddingBottom: deviceHeight / 1.8 }}
      />
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.titleName}>
          {item.ItemName}{' '}
          {item.IsRequired == 1 && <Text style={styles.requireText}>*</Text>}
        </Text>
        {item.DescriptionName && (
          <Text style={styles.subTitleName}>{item.DescriptionName}</Text>
        )}
        <SurveyItemDetails itemMain={item} onSaveData={handleSaveData} />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Home Visit'}
        subTitle={lastUpdate}
        middleType="ionicon"
        iconMiddle="refresh"
        iconRight="cloud-upload-alt"
        middleFunc={onRenewData}
        leftFunc={onBack}
        rightFunc={UploadData}
      />
      <SearchData
        placeholder="Tìm kiếm thông tin"
        value={search.text}
        onSearchData={onSearchData}
      />
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      {!isLoading && (
        <CustomTab
          data={dataGroup}
          keyTabName="GroupName"
          renderItem={renderTab}
        />
      )}
    </View>
  );
};

export default HomeVisitScreen;
