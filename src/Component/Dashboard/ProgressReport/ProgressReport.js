import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  GetDataProgressAttendant,
  GetDataProgressReport,
} from '../../../Controller/DashboardController';
import ProgressBarCustom from '../../../Control/ProgressBarCustom';
import { groupDataByKey } from '../../../Core/Helper';
import { Icon } from '@rneui/themed';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingView } from '../../../Control/ItemLoading/index';
import { SheetManager } from 'react-native-actions-sheet';
import { removeDuplicate } from '../../../Core/Utility';
import { DashboardSynthesis } from '../DashboardSynthesis';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import CustomListView from '../../../Control/Custom/CustomListView';
import ListTime from './List/ListTime';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const DATE = new Date();
const ProgressReport = ({ navigation, route }) => {
  const [filter, setFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });
  const { appcolor } = useSelector(state => state.GAppState);
  const [refreshing, setRefreshing] = useState(false);
  const [mData, setData] = useState([]);
  const [dataAttendant, setDataAttendant] = useState([]);
  const [dataEmployee, setDataEmployee] = useState([]);
  const [employee, setSelectEmp] = useState({});
  const [_, setMutate] = useState(false);
  const dispath = useDispatch();

  // #region Load Data
  const LoadData = async months => {
    await setRefreshing(true);
    const monthChoose = months > 0 ? +months : filter.month;
    await GetDataProgressAttendant(
      monthChoose,
      filter.year,
      async dataAttendantResult => {
        await setDataAttendant(dataAttendantResult);
      },
    );
    await GetDataProgressReport(monthChoose, filter.year, async dataResult => {
      const { arr } = groupDataByKey({
        arr: dataResult,
        key: 'employeeName',
      });
      await setData(arr);
      let _emplist = await removeDuplicate(dataResult, 'employeeId');
      await setDataEmployee(_emplist);
    });
    await setRefreshing(false);
  };
  // #endregion

  // #region Handler
  const handlerGetData = async () => {
    await setRefreshing(true);
    await LoadData(0);
    SheetManager.hide('sheetTime');
    await setRefreshing(false);
  };
  // #endregion

  // #region Action
  const onSelectEmployee = item => {
    employee.employeeId === undefined || employee.employeeId !== item.employeeId
      ? setSelectEmp(item)
      : setSelectEmp({});
  };
  const onShowDetailProgress = async (item, index) => {
    mData[index].isShowView = !item.isShowView;
    setMutate(e => !e);
  };
  const onShowDashboard = item => {
    dispath({
      type: 'SELECT_SHOP',
      shopinfo: JSON.parse(
        mData.filter(e => e.shopId == item.shopId)[0].shopInfo,
      )[0],
    });
    navigation.navigate('profileshops');
  };
  const onSelectYear = searchInfo => {
    setFilter({ ...filter, ...searchInfo });
  };
  // #endregion
  useEffect(() => {
    const _load = LoadData(0);
    return () => _load;
  }, []);

  // #region Style
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.surface,
    },
    viewTitleShop: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 8,
      backgroundColor: appcolor.surface,
      borderWidth: 1,
      borderColor: appcolor.primary,
    },
    itemShop: {
      flex: 1,
      margin: 5,
      padding: 5,
      borderRadius: 10,
      backgroundColor: appcolor.light,
    },
    titleShop: {
      flex: 1,
      fontSize: 15,
      color: appcolor.primary,
      paddingHorizontal: 10,
      fontWeight: '700',
    },
    detailHint: {
      color: appcolor.primary,
      fontSize: 12,
      fontWeight: fontWeightBold,
      marginRight: 8,
    },
    detailIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.primary,
    },
    totalTargetView: {
      width: '98%',
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '500',
      padding: 5,
      color: appcolor.dark,
    },
    labelDetail: {
      width: '50%',
      fontSize: 12,
      color: appcolor.dark,
      textAlign: 'center',
      padding: 3,
    },
    employeeContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      margin: 8,
    },
    viewEmployeeIcon: {
      backgroundColor: appcolor.yellowdark,
      padding: 8,
      borderRadius: 50,
    },
    viewEmployeeName: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '90%',
    },
    titleName: {
      width: '90%',
      fontSize: 15,
      color: appcolor.primary,
      padding: 8,
      fontWeight: '700',
    },
    viewDashboard: {
      backgroundColor: appcolor.primary + '20',
      padding: 4,
      borderRadius: 10,
    },
    textDashboard: {
      padding: 7,
      fontSize: 12,
      color: appcolor.primary,
      fontWeight: fontWeightBold,
    },
    viewItemCategoryTarget: {
      width: '100%',
      flexDirection: 'row',
      padding: 5,
      alignSelf: 'center',
    },
    viewItemReport: { width: '100%', flexDirection: 'row' },
    viewDetailReport: { width: '100%', marginBottom: 5, padding: 8 },
    viewTitleReport: { width: '100%', flexDirection: 'row' },
    viewBorderReport: {
      borderWidth: 1,
      borderColor: appcolor.surface,
      width: '95%',
      marginBottom: 8,
    },
    viewItemQuantity: {
      width: '100%',
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
    },
    viewCategoryTarget: {
      width: '90%',
      backgroundColor: appcolor.placeholderBody,
      borderRadius: 8,
      alignSelf: 'center',
    },
    viewTitleCategoryTarget: {
      width: '100%',
      flexDirection: 'row',
      padding: 5,
    },
    viewDetail: { width: '100%', backgroundColor: appcolor.light },
    viewTotalTarget: { flex: 1 },
  });
  // #endregion

  // #region View
  const renderItem = ({ item, index }) => {
    const { arr } = groupDataByKey({
      arr: JSON.parse(item?.dataDetail || '{}'),
      key: 'ShopId',
    });
    const iconViewDetail = item.isShowView == 1 ? 'chevron-up' : 'chevron-down';
    const onShowDetail = () => {
      onShowDetailProgress(item, index);
    };

    const itemAttendant =
      dataAttendant?.filter(it => it.employeeId == item.employeeId)[0] || {};
    const percentAttendant = (
      (itemAttendant.actual / itemAttendant.target) *
      100
    ).toFixed(0);
    const titleNameAttendant = `${itemAttendant.groupName}: ${itemAttendant.actual}/${itemAttendant.target}`;

    const dataCategoryTarget = JSON.parse(item.categoryTarget || '[]');
    const info = JSON.parse(item.productInfo || '[]');
    return employee.employeeId !== undefined &&
      employee.employeeId !== item.employeeId ? (
      <View />
    ) : (
      <View key={`${index}982qkj`} style={styles.itemShop}>
        {item.isParent && (
          <View style={styles.employeeContainer}>
            <View style={styles.viewEmployeeIcon}>
              <SpiralIcon
                name="user"
                size={15}
                color={appcolor.black}
                type="font-awesome-5"
              />
            </View>
            <View style={styles.viewEmployeeName}>
              <Text style={styles.titleName}>{item.employeeName}</Text>
              {JSON.parse(mData[0].shopInfo || '[]')?.length > 0 && (
                <TouchableOpacity onPress={() => onShowDashboard(item)}>
                  <View style={styles.viewDashboard}>
                    <Text style={styles.textDashboard}>{'Xem thống kê'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {item.isParent && Object.keys(itemAttendant).length > 0 && (
          <View style={styles.viewTotalTarget}>
            <Text style={styles.totalTargetView}>{titleNameAttendant}</Text>
            <ProgressBarCustom
              viewPercent={true}
              progressValue={percentAttendant}
              titleName={''}
              titleValue={''}
              colorPercent={appcolor.success}
            />
          </View>
        )}
        {/* Category Target */}
        {dataCategoryTarget?.length > 0 && (
          <View style={styles.viewCategoryTarget}>
            <View style={styles.viewTitleCategoryTarget}>
              <Text
                style={{
                  ...styles.labelDetail,
                  textAlign: 'left',
                  width: '30%',
                  fontWeight: 'bold',
                  color: appcolor.dark,
                }}
              >
                {'Ngành hàng'}
              </Text>
              <Text
                style={{
                  ...styles.labelDetail,
                  fontWeight: 'bold',
                  color: appcolor.dark,
                  width: '25%',
                }}
              >
                {'Target'}
              </Text>
              <Text
                style={{
                  ...styles.labelDetail,
                  fontWeight: 'bold',
                  color: appcolor.dark,
                  width: '25%',
                }}
              >
                {'Actual'}
              </Text>
              <Text
                style={{
                  ...styles.labelDetail,
                  fontWeight: 'bold',
                  color: appcolor.dark,
                  width: '20%',
                }}
              >
                {'%'}
              </Text>
            </View>
            {dataCategoryTarget.map((t, ix) => {
              return (
                <RenderItemCategoryTarget
                  key={`category_target_${item.employeeId}_${ix}`}
                  item={t}
                />
              );
            })}
          </View>
        )}
        {/* Header Total */}
        <Text style={styles.totalTargetView}>
          {' '}
          {item.titleTarget + item.valueTarget}
        </Text>
        <ProgressBarCustom
          viewPercent={true}
          progressValue={item.tPercent || 0}
          titleName={''}
          titleValue={''}
        />
        {/* / */}
        <TouchableOpacity onPress={onShowDetail} activeOpacity={0.75}>
          <View style={styles.viewTitleShop}>
            <SpiralIcon
              name="store"
              size={21}
              color={appcolor.primary}
              type="font-awesome-5"
            />
            <Text style={styles.titleShop}>{item.shopName}</Text>
            <Text style={styles.detailHint}>
              {item.isShowView == 1 ? 'Thu gọn' : 'Chi tiết'}
            </Text>
            <View style={styles.detailIconWrap}>
              <SpiralIcon
                name={iconViewDetail}
                size={13}
                color={appcolor.light}
                type="font-awesome-5"
              />
            </View>
          </View>
        </TouchableOpacity>
        {/* Content */}
        {item.isShowView == 1 && (
          <View style={styles.viewDetail}>
            {info?.length > 0 && (
              <DashboardSynthesis
                key={'SYNTHESIS_REPORT_' + index}
                info={info[0]}
                sendNavigate={navigation}
              />
            )}
            <View style={styles.viewDetailReport}>
              {/* Title Decription */}
              <View style={styles.viewTitleReport}>
                <Text
                  style={{
                    ...styles.labelDetail,
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: appcolor.dark,
                  }}
                >
                  {'Tiêu đề'}
                </Text>
                <Text
                  style={{
                    ...styles.labelDetail,
                    fontWeight: 'bold',
                    color: appcolor.dark,
                    width: '25%',
                  }}
                >
                  {'Hôm nay'}
                </Text>
                <Text
                  style={{
                    ...styles.labelDetail,
                    fontWeight: 'bold',
                    color: appcolor.dark,
                    width: '25%',
                  }}
                >
                  {'Tháng'}
                </Text>
              </View>
              {/* // */}
              <View style={styles.viewBorderReport} />
              <View style={styles.viewItemQuantity}>
                <Text style={{ ...styles.labelDetail, textAlign: 'left' }}>
                  {'Total (Số lượng)'}
                </Text>
                <Text style={{ ...styles.labelDetail, width: '25%' }}>
                  {item.tQuantityByDay}
                </Text>
                <Text style={{ ...styles.labelDetail, width: '25%' }}>
                  {item.tQuantityByShop}
                </Text>
              </View>
              <View style={styles.viewItemQuantity}>
                <Text style={{ ...styles.labelDetail, textAlign: 'left' }}>
                  {'Total (Amount)'}
                </Text>
                <Text style={{ ...styles.labelDetail, width: '25%' }}>
                  {item.tAmountByDay}
                </Text>
                <Text style={{ ...styles.labelDetail, width: '25%' }}>
                  {item.tAmountByShop}
                </Text>
              </View>
            </View>
            {/* Detail Category */}
            {arr?.length > 0 &&
              arr?.map((item, index) => {
                return (
                  <RenderItemReport
                    key={`item_report_${item.ShopId || item.CategoryName
                      }_${index}`}
                    item={item}
                    index={index}
                    arr={arr}
                  />
                );
              })}
          </View>
        )}
      </View>
    );
  };
  const RenderItemReport = ({ item, index, arr }) => {
    return (
      <>
        <View style={styles.viewItemReport}>
          <Text style={{ ...styles.labelDetail, textAlign: 'left' }}>
            {item.CategoryName}
          </Text>
          <Text style={{ ...styles.labelDetail, width: '25%' }}>
            {item.TQuantityByDay}
          </Text>
          <Text style={{ ...styles.labelDetail, width: '25%' }}>
            {item.TQuantityByCate}
          </Text>
        </View>
        {index !== arr.length - 1 && <View style={styles.viewBorderReport} />}
      </>
    );
  };
  const RenderItemCategoryTarget = ({ item }) => {
    return (
      <View style={styles.viewItemCategoryTarget}>
        <Text
          style={{ ...styles.labelDetail, width: '30%', textAlign: 'left' }}
        >
          {item.CategoryName}
        </Text>
        <Text style={{ ...styles.labelDetail, width: '25%' }}>
          {item.Target}
        </Text>
        <Text style={{ ...styles.labelDetail, width: '25%' }}>
          {item.Actual}
        </Text>
        <Text style={{ ...styles.labelDetail, width: '20%' }}>
          {item.PercentValue || 0}
        </Text>
      </View>
    );
  };
  if (refreshing)
    return <LoadingView isLoading={refreshing} title="Đang cập nhật dữ liệu" />;
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={`${route.params?.menuitem.menuNameVN} ${filter.monthname}`}
        iconRight="search"
        leftFunc={() => navigation.goBack()}
        rightFunc={() => SheetManager.show('sheetTime')}
      />
      <CustomListView
        renderItem={renderItem}
        data={mData}
        onRefresh={() => LoadData(0)}
      />
      <ListTime
        filter={filter}
        data={dataEmployee}
        employee={employee}
        handlerGetData={handlerGetData}
        onSelectEmployee={onSelectEmployee}
        onSelectYear={onSelectYear}
      />
    </View>
  );
};

export default ProgressReport;
