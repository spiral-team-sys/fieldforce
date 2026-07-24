import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { fontWeightBold, scaleSize } from '../../Themes/AppsStyle';
import { Message, UUIDGenerator } from '../../Core/Helper';
import { toastError, toastSuccess } from '../../Utils/configToast';
import { _competitorId } from '../../Core/URLs';
import { TODAY, checkNetwork, deviceHeight } from '../../Core/Utility';

import moment from 'moment';
import {
  getResSellOut,
  SellOutGetList,
  SELLOUTContext,
} from '../../Controller/SellOutController';
import {
  checkLockReport,
  getStoreListSO,
} from '../../Controller/ShopController';
import { SelloutResRow } from '../../Content/SelloutResRow';
import { getRequestSellout } from '../../Controller/MasterController';
import {
  getCategorySO,
  getSegmentSO,
  getSubSegmentSO,
  getProductSO,
  getNOSELLSO,
  getSubCategorySO,
  getCompetitorSO,
} from '../../Controller/ProductController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import UploadController from '../../Controller/UploadController';
import { useSelector } from 'react-redux';
import { LoadingView } from '../../Control/ItemLoading/index';
import SelloutModel from '../../Content/SelloutModel';
import CustomListView from '../../Control/Custom/CustomListView';
import _ from 'lodash';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const Sellout = props => {
  const { appcolor, shopinfo, kpiinfo, workinfo } = useSelector(
    state => state.GAppState,
  );

  // #region State
  const [guiId, setGuiId] = useState('');
  const [IdNosell, setIdNosell] = useState(0);
  const [totalSell, setTotalSell] = useState(0);
  const [isHiddentNosell, setIsHiddentNosell] = useState(false);
  const [idHaveNosell, setIdHaveNosell] = useState(false);
  const [loadHistory, setLoadHistory] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [display, setDisplay] = useState(false);
  const [products, setProducts] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sellouts, setSellouts] = useState([]);
  const [segment, setSegment] = useState([]);
  const [subSegment, setSubSegment] = useState([]);
  const [shopList, setShopList] = useState([]);
  const [masterList, setMasterList] = useState([]);
  const [reload, setReload] = useState(0);
  const [isShowAlert, setIsShowAlert] = useState(false);
  const [typeId, setTypeId] = useState(null);
  const [auditDate, setAuditDate] = useState(
    moment(new Date()).format('YYYYMMDD'),
  );
  const [infoSave, setInfoSave] = useState({
    tickInfoSave: false,
    dataInfoSave: {},
  });
  const [lockReport, setLockReport] = useState(false);
  const [lstReport, setLstReport] = useState({});
  const [listVersion, setListVersion] = useState(0);
  // #endregion
  const currentDate = Number(moment(new Date()).format('YYYYMMDD'));
  const canEditSellout =
    Number(workinfo?.workDate) === currentDate && !lockReport;

  // #region selloutLoad
  const selloutLoad = async () => {
    const nosellProduct = await getNOSELLSO();
    const total = await SELLOUTContext.TotalSellOut(workinfo);
    let sellout = await getResSellOut(workinfo);
    if ((!sellout || sellout.length === 0) && total > 0) {
      sellout = await SellOutGetList(workinfo);
    }
    if (nosellProduct?.length > 0) {
      const nosellId = nosellProduct[0].productId;
      const haveNosell = sellout?.some(item => item.productId === nosellId);
      setIdNosell(nosellId);
      setIdHaveNosell(haveNosell);
      setIsHiddentNosell((sellout?.length || 0) > 0);
    } else {
      setIdNosell(0);
      setIdHaveNosell(false);
      setIsHiddentNosell(false);
    }
    setSellouts(previousSellouts => {
      if (
        (!sellout || sellout.length === 0) &&
        total > 0 &&
        previousSellouts.length > 0
      ) {
        return previousSellouts.map(item => ({ ...item, upload: 1 }));
      }
      return [...(sellout || [])];
    });
    setTotalSell(total);
    setListVersion(version => version + 1);
  };
  // #endregion

  // #region LoadData
  const LoadData = async () => {
    let lstMaster = await getRequestSellout();
    const shops = await getStoreListSO('', TODAY);
    const lstCompetitor = await getCompetitorSO();
    const products = await getProductSO(_competitorId);
    const category = await getCategorySO();
    const subcategory = await getSubCategorySO();
    const segment = await getSegmentSO();
    const subsegment = await getSubSegmentSO();
    const isCheck = await checkLockReport(shopinfo);
    const lstReport = JSON.parse(kpiinfo?.reportItem || '{}');
    setShopList(shops);
    setProducts(products);
    setCategories(category);
    setSubCategories(subcategory);
    setSegment(segment);
    setSubSegment(subsegment);
    setMasterList(lstMaster);
    setCompetitors(lstCompetitor);
    setLockReport(isCheck);
    setLstReport(lstReport);
    await selloutLoad();
  };
  // #endregion
  useEffect(() => {
    if (workinfo.shopId !== undefined) {
      LoadData();
    }
  }, [workinfo]);

  // #region onAddSellOut
  const onAddSellOut = async () => {
    if (canEditSellout) {
      setDisplay(true);
      setReload(reload + 1);
      setLoadHistory(false);
      setGuiId(UUIDGenerator());
    } else {
      toastError('Bạn đang báo cáo dữ liệu ngày cũ!');
    }
  };
  // #endregion

  // #region onClosed
  const onClosed = async () => {
    Keyboard.dismiss();
    setDisplay(false);
    setLoadHistory(false);
    setGuiId('');
    await selloutLoad();
  };
  // #endregion

  // #region Upload
  const Upload = async () => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      toastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    setShowProgress(true);
    const config = JSON.parse(kpiinfo.reportItem || '{}');
    await UploadController.DataSellout(
      { ...workinfo, reportId: config.isUseSellOut == 1 ? 5 : kpiinfo.id },
      async () => {
        setShowProgress(false);
        await selloutLoad();
      },
      () => setShowProgress(false),
    );
  };
  // #endregion

  // #region getYearAndMonth
  const getYearAndMonth = dateString => {
    const date = moment(dateString, 'YYYYMMDD');
    const year = date.year();
    const month = date.month() + 1;
    return { year, month };
  };
  // #endregion

  // #region onUploadSellout
  const onUploadSellout = async () => {
    // const config = JSON.parse(kpiinfo.reportItem || '{}')
    // const { res } = await SellOutUpload({ ...workinfo, reportId: config.isUseSellOut == 1 ? 5 : kpiinfo.id })

    // if (lstReport?.isCheckOldDate == 1) {
    //     let day = parseInt(moment(new Date()).format('YYYYMMDD'))
    //     if (workinfo.workDate !== day) {
    //         ToastError('Bạn đang báo cáo dữ liệu ngày cũ!')
    //         return
    //     }
    // }
    // if (lstReport?.isCheckOldMonth == 1) {
    //     const currenMonth = getYearAndMonth(moment(new Date()).format('YYYYMMDD'))
    //     const MonthSell = getYearAndMonth(workinfo.workDate)
    //     if (currenMonth.month !== MonthSell.month || currenMonth.year !== MonthSell.year) {
    //         ToastError('Bạn không thể gửi dữ liệu tháng trước!')
    //         return
    //     }
    // }

    // if (res != null && res.length > 0) {
    //     Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => Upload());
    // } else {
    //     ToastSuccess('Đã gửi hết dữ liệu');
    // }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => Upload(),
    );
  };
  // #endregion

  // #region onShowDetail
  const onShowDetail = async itemAccept => {
    if (!canEditSellout) {
      toastError('Bạn đang báo cáo dữ liệu ngày cũ!');
      return;
    }
    setDisplay(true);
    setReload(reload + 1);
    setLoadHistory(true);
    setItemSelected(itemAccept);
    setGuiId(itemAccept.guiId);
  };
  // #endregion

  // #region onNosellAction
  const onNosellAction = async () => {
    if (IdNosell === 0) {
      toastError('Chưa có dữ liệu của nosell');
      return;
    }
    if (!canEditSellout) {
      toastError('Bạn đang báo cáo dữ liệu ngày cũ!');
      return;
    }
    await SELLOUTContext.NoSell(workinfo, result => {
      LoadData();
      setIdHaveNosell(true);
      toastSuccess(result.messeger);
    });
  };
  // #endregion
  const canUseNosell =
    IdNosell !== 0 &&
    typeId !== 170 &&
    canEditSellout &&
    !idHaveNosell &&
    !isHiddentNosell;
  const canAddSellout = canEditSellout && !idHaveNosell;
  // #region View
  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: appcolor.surface,
      }}
    >
      {!display && (
        <View style={{ flex: 1 }}>
          <HeaderCustom
            leftFunc={() => props.navigation.goBack()}
            title="Báo cáo số bán"
            iconRight="cloud-upload-alt"
            rightFunc={lockReport ? null : onUploadSellout}
          />
          <LoadingView styles={{ zIndex: 200 }} isLoading={showProgress} />
          {sellouts?.length > 0 && (
            <View style={{ height: '100%', width: '100%' }}>
              <CustomListView
                key={`listSellOut-${listVersion}`}
                data={sellouts}
                extraData={[
                  sellouts,
                  totalSell,
                  idHaveNosell,
                  isHiddentNosell,
                  listVersion,
                ]}
                renderItem={({ item, index }) => (
                  <SelloutResRow
                    key={'9992' + index}
                    item={item}
                    index={index}
                    selloutLoad={selloutLoad}
                    ShowDetail={onShowDetail}
                    canEdit={canEditSellout}
                    onBlockedAction={() =>
                      toastError('Bạn đang báo cáo dữ liệu ngày cũ!')
                    }
                    Props={props}
                    workinfo={workinfo}
                    appcolor={appcolor}
                  />
                )}
                ListFooterComponent={
                  <View style={{ height: deviceHeight / 3, width: '100%' }} />
                }
                keyExtractor={(_, index) => index.toString()}
              />
            </View>
          )}
          {canAddSellout && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                position: 'absolute',
                zIndex: 10,
                right: 12,
                bottom: 32,
              }}
              onPress={onAddSellOut}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 30,
                  backgroundColor: appcolor.primary,
                }}
              >
                <Text
                  style={{
                    paddingStart: 16,
                    color: appcolor.white,
                    textAlignVertical: 'center',
                    fontSize: 14,
                    fontWeight: fontWeightBold,
                  }}
                >
                  Tổng số lượng {totalSell}
                </Text>
                <SpiralIcon
                  raised
                  size={16}
                  name="add-circle-outline"
                  type="ionicon"
                />
              </View>
            </TouchableOpacity>
          )}
          {canUseNosell && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                zIndex: 11,
                bottom: 40,
                left: 8,
                maxHeight: 50,
              }}
              onPress={onNosellAction}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 30,
                  backgroundColor: appcolor.light,
                }}
              >
                <SpiralIcon
                  size={20}
                  name="circle"
                  type="font-awesome-5"
                  color={appcolor.greylight}
                  containerStyle={{ padding: 10 }}
                />
                <Text
                  style={{
                    paddingEnd: 12,
                    color: appcolor.dark,
                    textAlignVertical: 'center',
                    fontSize: scaleSize(20),
                  }}
                >
                  No Sell
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      {display && (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
          <SelloutModel
            key={'createItemSellout'}
            Shops={shopList}
            Competitors={competitors}
            SubCategories={subCategories}
            Segments={segment}
            SubSegment={subSegment}
            Categories={categories}
            Products={products}
            Closed={onClosed}
            Props={props}
            ItemSaved={itemSelected}
            LoadHistory={loadHistory}
            MasterList={masterList}
            reload={reload}
            Toast={props.toastRef}
            guiId={guiId}
            lstReport={lstReport}
            infoSave={infoSave}
          />
        </View>
      )}
    </View>
  );
};
export default Sellout;
