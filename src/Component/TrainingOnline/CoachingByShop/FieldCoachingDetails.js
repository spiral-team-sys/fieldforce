import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  alertConfirm,
  alertWarning,
  deviceHeight,
} from '../../../Core/Utility';
import { Icon, Text } from '@rneui/base';
import FormGroup from '../../../Content/FormGroup';
import {
  ToastSuccess,
  formatNumber,
  groupDataByKey,
} from '../../../Core/Helper';
import { LoadingView } from '../../../Control/ItemLoading';
import { COACHING } from '../../../API/CoachingAPI';

export const FieldCoachingDetails = ({
  itemCoaching,
  dataGroup,
  dataDetails = [],
  onSaveData,
  onCloseView,
}) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [coachingList, setCoachingList] = useState([]);
  //
  const parseList = value => {
    try {
      if (Array.isArray(value)) {
        return value;
      }
      return JSON.parse(value || '[]');
    } catch (_e) {
      return [];
    }
  };
  const getValueByKeys = (item, keys) => {
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (item?.[key] !== undefined && item?.[key] !== null) {
        return `${item[key]}`;
      }
    }
    return null;
  };
  const LoadData = async () => {
    const details =
      parseList(dataDetails).length > 0
        ? parseList(dataDetails)
        : parseList(itemCoaching?.DataSurvey);
    const groups = parseList(dataGroup);
    const groupNameById = {};
    const groupIds = groups
      .map(item => {
        const groupId = getValueByKeys(item, [
          'ParentId',
          'parentId',
          'Id',
          'id',
          'GroupId',
          'groupId',
          'GroupID',
        ]);
        if (groupId !== null) {
          groupNameById[groupId] =
            item.GroupName || item.groupName || item.ItemName || item.name;
        }
        return groupId;
      })
      .filter(item => item !== null);

    let listShow = details;
    if (groupIds.length > 0) {
      const dataFilter = details.filter(item => {
        const itemParentId = getValueByKeys(item, [
          'ParentId',
          'parentId',
          'GroupId',
          'groupId',
          'GroupID',
        ]);
        return groupIds.includes(itemParentId);
      });

      if (dataFilter.length > 0) {
        listShow = dataFilter;
      }
    }

    listShow = listShow.map(item => {
      const itemParentId = getValueByKeys(item, [
        'ParentId',
        'parentId',
        'GroupId',
        'groupId',
        'GroupID',
      ]);
      return {
        ...item,
        ParentId:
          item.ParentId ??
          item.parentId ??
          item.GroupId ??
          item.groupId ??
          item.GroupID,
        GroupName:
          item.GroupName || item.groupName || groupNameById[itemParentId] || '',
      };
    });

    const { arr } = await groupDataByKey({
      arr: listShow,
      key: 'ParentId',
    });
    await setCoachingList(arr);
  };
  const UploadData = async () => {
    for (let index = 0; index < coachingList.length; index++) {
      const item = coachingList[index];
      if ((item?.ItemValue || null) == null) {
        alertWarning(`Chưa chấm điểm ${item.ItemName}`);
        return;
      }
    }
    alertConfirm(
      'Thông báo',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await setLoading(true);
        await COACHING.UploadDataByEmployee(
          shopinfo.shopId,
          kpiinfo.id,
          coachingList,
          async message => {
            message && ToastSuccess(message, 'Thông báo', 'top');
            itemCoaching.isUploaded = 1;
            await setLoading(false);
            await onCloseView(itemCoaching);
          },
        );
      },
    );
  };
  // Handler
  const onChangeValue = (value, indexItem) => {
    const item = coachingList[indexItem];
    let inputValue = value;
    if (value !== null && value.length > 0) {
      if (item.MaxScore > 0 && Number(value) > Number(item.MaxScore)) {
        inputValue = item.MaxScore;
      }
    }
    const listUpdate = coachingList.map((it, index) =>
      index === indexItem ? { ...it, ItemValue: inputValue } : it,
    );
    setCoachingList(listUpdate);
    itemCoaching.DataSurvey = JSON.stringify(listUpdate);
    onSaveData();
  };
  //
  useEffect(() => {
    const _setdetail = LoadData();
    return () => _setdetail;
  }, [itemCoaching?.EmployeeCode, dataGroup, dataDetails]);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      height: '100%',
      width: '100%',
      backgroundColor: appcolor.light,
    },
    titleAction: {
      width: '75%',
      fontSize: 15,
      fontWeight: '700',
      color: appcolor.primary,
      padding: 8,
      marginStart: 8,
      marginEnd: 8,
    },
    itemMain: { padding: 8 },
    titleView: {
      width: '80%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      padding: 5,
      paddingEnd: 8,
    },
    headerView: {
      width: '100%',
      fontSize: 14,
      fontWeight: '600',
      color: appcolor.red,
      padding: 5,
    },
    inputContainer: { minWidth: 80, margin: 0, padding: 0 },
    inputView: {
      color: appcolor.dark,
      fontSize: 12,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 5,
      textAlign: 'center',
      marginEnd: 8,
    },
    viewUpload: {
      width: 80,
      backgroundColor: appcolor.primary,
      padding: 8,
      borderRadius: 50,
      justifyContent: 'center',
    },
  });
  const renderItem = (item, index) => {
    const handlerChangeValue = text => {
      onChangeValue(text, index);
    };
    return (
      <View key={`kkp_P_${index}`} style={styles.itemMain}>
        {item.isParent && (
          <Text style={styles.headerView}>{`${item.GroupName}`}</Text>
        )}
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <Text style={styles.titleView}>{`${index + 1}. ${
            item.ItemName || item.itemName || ''
          }`}</Text>
          <FormGroup
            editable={(itemCoaching?.isUploaded || 0) == 0}
            nonBorder
            noneRadius
            useClearAndroid={false}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputView}
            keyboardType="numeric"
            clearButtonMode="never"
            placeholder={`${item.MinScore || 0}-${item.MaxScore || 0}`}
            value={formatNumber(item?.ItemValue || null)}
            handleChangeForm={handlerChangeValue}
          />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <Text
          style={styles.titleAction}
        >{`${itemCoaching.EmployeeCode} - ${itemCoaching.EmployeeName}`}</Text>
        {(itemCoaching?.isUploaded || 0) == 0 && (
          <TouchableOpacity style={styles.viewUpload} onPress={UploadData}>
            <SpiralIcon
              type="font-awesome-5"
              name="cloud-upload-alt"
              color={appcolor.light}
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>
      <LoadingView isLoading={loading} title="Vui lòng chờ" />
      <ScrollView
        style={{ flex: 1, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {coachingList !== null &&
          coachingList.length > 0 &&
          coachingList.map((item, index) => {
            return renderItem(item, index);
          })}
        {(!coachingList || coachingList.length === 0) && (
          <Text
            style={{
              padding: 16,
              color: appcolor.greydark,
              textAlign: 'center',
            }}
          >
            Không có tiêu chí đánh giá
          </Text>
        )}
        <View style={{ paddingBottom: deviceHeight / 2 }} />
      </ScrollView>
    </View>
  );
};
