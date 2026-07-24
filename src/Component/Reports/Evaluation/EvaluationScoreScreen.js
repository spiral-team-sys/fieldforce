import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { REPORT } from '../../../API/ReportAPI';
import { toastError, toastSuccess } from '../../../Utils/configToast';
import { LoadingView } from '../../../Control/ItemLoading';
import { SearchData } from '../../../Control/SearchData/SearchData';
import CustomTab from '../../../Control/Custom/CustomTab';
import CustomListView from '../../../Control/Custom/CustomListView';
import { Icon, Text } from '@rneui/base';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EmployeeScoring from './Page/Score/EmployeeScoring';
import { alertNotify, TODAY } from '../../../Core/Utility';
import { groupDataByKey } from '../../../Core/Helper';
import _ from 'lodash';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const EvaluationScoreScreen = ({ navigation }) => {
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [itemScore, setItemScore] = useState({});

  const LoadData = async () => {
    await setLoading(true);
    const params = {
      shopId: shopinfo.shopId,
      reportId: kpiinfo.id,
    };
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      const grouplist = _.unionBy(mData, 'provinceName');
      const { arr } = groupDataByKey({
        arr: mData,
        key: 'shopId',
      });
      setDataGroup(grouplist);
      setData(arr);
      setDataMain(arr);
    });
    await setLoading(false);
  };

  const UploadData = async dataUpload => {
    const info = {
      shopId: shopinfo.shopId || 0,
      auditDate: TODAY,
    };
    const result = await REPORT.UploadDataRaw_Realtime(
      dataUpload,
      info,
      kpiinfo.id,
    );
    if (result.statusId == 200) {
      setVisibleModal(false);
      LoadData();
      toastSuccess('Thông báo', result.messager || 'Đánh giá thành công');
    } else {
      alertNotify(result.messager || 'Đánh giá thất bại');
    }
    DeviceEventEmitter.emit('SCORING_DONE_UPLOAD');
  };

  const onSearchData = text => {
    if (!text || text.trim() === '') {
      setData(dataMain);
      setDataGroup(_.unionBy(dataMain, 'provinceName'));
      return;
    }
    //
    const keyword = text.trim().toLowerCase();
    const filtered = _.filter(
      dataMain,
      e =>
        (e.shopName && e.shopName.toLowerCase().includes(keyword)) ||
        (e.shopCode && e.shopCode.toLowerCase().includes(keyword)) ||
        (e.employeeName && e.employeeName.toLowerCase().includes(keyword)) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(keyword)),
    );
    //
    const { arr } = groupDataByKey({
      arr: filtered,
      key: 'shopId',
    });
    setData(arr);
    setDataGroup(_.unionBy(arr, 'provinceName'));
  };

  const onShowScoring = item => {
    setItemScore(item);
    setVisibleModal(true);
  };

  const onCloseScoring = () => {
    setVisibleModal(false);
  };

  const onBack = () => {
    navigation.goBack();
  };

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
      zIndex: 10,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    tabContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: {
      padding: 8,
      margin: 8,
      marginBottom: 0,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 11,
      color: appcolor.greylight,
      fontWeight: '500',
    },
    viewTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    viewInfo: { flex: 1 },
    viewShopInfo: {
      padding: 8,
      margin: 8,
      marginBottom: 0,
      backgroundColor: appcolor.primary + '20',
      borderRadius: 8,
    },
    titleShop: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    subTitleShop: { fontSize: 12, fontWeight: '500', color: appcolor.primary },
    viewSummary: {
      marginTop: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.surface,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
      paddingVertical: 4,
      paddingHorizontal: 6,
      marginBottom: 2,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    colGroup: {
      width: '50%',
      fontSize: 10,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    colName: { flex: 1, fontSize: 10, color: appcolor.dark },
    colPoint: {
      width: 30,
      fontSize: 10,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      textAlign: 'center',
    },
    colHeaderText: {
      fontSize: 10,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    viewTasks: {
      marginTop: 6,
      padding: 8,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    tasksLabel: {
      fontSize: 10,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    tasksText: { fontSize: 11, color: appcolor.dark, lineHeight: 16 },
  });

  const renderTab = item => {
    const dataDetails = _.filter(
      data,
      e => e.provinceName === item.provinceName,
    );
    return (
      <View style={styles.tabContainer}>
        <CustomListView
          data={dataDetails}
          extraData={dataDetails}
          renderItem={renderItem}
          onRefresh={LoadData}
        />
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const onPress = () => onShowScoring(item);
    //
    const dataResult = groupDataByKey({
      arr: JSON.parse(item.jsonDetail || '[]'),
      key: 'KPIGroup',
    }).arr;
    const sumEmployee = _.sumBy(data, e => (e.shopId === item.shopId ? 1 : 0));
    //
    return (
      <View>
        {item.isParent && (
          <View style={styles.viewShopInfo}>
            <Text style={styles.titleShop}>{item.shopName}</Text>
            <Text style={styles.subTitleName}>{`Code: ${item.shopCode}`}</Text>
            <Text
              style={styles.subTitleName}
            >{`Tổng: ${sumEmployee} nhân viên có lịch đánh giá hôm nay`}</Text>
            <Text
              style={styles.subTitleName}
            >{`CoVisit: ${item.coVisit}`}</Text>
          </View>
        )}
        <View style={styles.itemContainer}>
          <TouchableOpacity
            style={styles.viewTitle}
            onPress={onPress}
            activeOpacity={0.6}
            disabled={item.isEvaluated}
          >
            <SpiralIcon
              name="person-circle"
              type="ionicon"
              size={32}
              color={appcolor.primary}
              style={{ marginEnd: 8 }}
            />
            <View style={styles.viewInfo}>
              <Text style={styles.titleName}>{`${item.employeeName}`}</Text>
              <Text
                style={styles.subTitleName}
              >{`Code: ${item.employeeCode}`}</Text>
              <Text
                style={[
                  styles.subTitleName,
                  {
                    color: item.isEvaluated
                      ? appcolor.success
                      : appcolor.greylight,
                    textDecorationLine: 'underline',
                  },
                ]}
              >{`${item.statusName}`}</Text>
            </View>
            {!item.isEvaluated && (
              <SpiralIcon
                name="chevron-forward"
                type="ionicon"
                size={12}
                color={appcolor.greylight}
              />
            )}
          </TouchableOpacity>
          {item.isEvaluated && (
            <View style={styles.viewSummary}>
              <CustomListView
                data={dataResult}
                extraData={dataResult}
                renderItem={renderItemResult}
                bottomView={{ paddingBottom: 0 }}
              />
            </View>
          )}
          {item.isEvaluated && !!item.tasks && (
            <View style={styles.viewTasks}>
              <Text style={styles.tasksLabel}>Công việc cần làm</Text>
              <Text style={styles.tasksText}>{item.tasks}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.colGroup, styles.colHeaderText]}>Tiêu chí</Text>
      <Text style={[styles.colName, styles.colHeaderText]}>Ghi chú</Text>
      <Text style={[styles.colName, styles.colHeaderText]}>Mục</Text>
      <Text style={[styles.colPoint, styles.colHeaderText]}>Điểm</Text>
    </View>
  );

  const renderItemResult = ({ item, index }) => {
    return (
      <View>
        {index === 0 && renderTableHeader()}
        <View style={styles.tableRow}>
          {item.isParent ? (
            <Text style={styles.colGroup}>{item.KPIGroup}</Text>
          ) : (
            <Text style={styles.colGroup} numberOfLines={2}></Text>
          )}
          <Text style={styles.colName}>{item.Note ?? '-'}</Text>
          <Text style={styles.colName}>
            {item.KPIName == item.KPIGroup ? '-' : item.KPIName}
          </Text>
          <Text style={styles.colPoint}>{item.Point ?? '-'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Đánh giá nhân viên'}
        leftFunc={onBack}
      />
      <SearchData
        placeholder="Tìm kiếm nhân viên"
        onSearchData={onSearchData}
      />
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      <CustomTab
        data={dataGroup}
        dataMain={data}
        keyTabName="provinceName"
        renderItem={renderTab}
      />
      <Modal
        visible={visibleModal}
        animationType="fade"
        statusBarTranslucent
        backdropColor={appcolor.light}
      >
        <SafeAreaProvider>
          <EmployeeScoring
            item={itemScore}
            onClose={onCloseScoring}
            onUploadData={UploadData}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default EvaluationScoreScreen;
