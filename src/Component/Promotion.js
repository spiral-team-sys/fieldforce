import React, { useState, useEffect, useCallback } from 'react';
import { View, Dimensions, FlatList, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { Store } from '../Core/SqliteDbContext';
import { ToastError, ToastSuccess, UUIDGenerator } from '../Core/Helper';
import { DEFAULT_COLOR } from '../Core/URLs';
import moment from 'moment';
import {
  getPhotosReportByGuiId,
  PromotionGetList,
} from '../Controller/WorkController';
import * as Progress from 'react-native-progress';
import { PromotionModel } from '../Content/PromotionModel';
import { PromotionResRow } from '../Content/PromotionResRow';
import { getLstCompetitorsMitsu } from '../Controller/CompetitorController';
import { getCategoryPromotion } from '../Controller/ProductController';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../Content/HeaderCustom';
import UploadController from '../Controller/UploadController';
import { PromotionItemUpload } from '../Controller/PromotionController';
import { alertConfirm } from '../Core/Utility';
import { checkLockReport } from '../Controller/ShopController';
import SpiralIcon from '../Control/Icon/SpiralIcon';

const styles = StyleSheet.create({
  separator: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
  },
});

const keyExtractor = (_item, index) => `promotion_${index}`;
const Separator = () => <View style={styles.separator} />;

const Promotion = ({ navigation }) => {
  const workinfo = useSelector(state => state.GAppState.workinfo);
  const kpiinfo = useSelector(state => state.GAppState.kpiinfo);
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const shopinfo = useSelector(state => state.GAppState.shopinfo);

  const [sellouts, setSellouts] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [guiId, setGuiId] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(0);
  const [loadHistory, setLoadHistory] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [isLockReport, setIsLockReport] = useState(false);
  const [listReport, setListReport] = useState({});
  const [isOldDay, setIsOldDay] = useState(false);

  // --- actions ---

  const mapItem = useCallback(
    async item => {
      const lst = await getPhotosReportByGuiId(
        kpiinfo.kpiId,
        item.guiId,
        workinfo.shopId,
        workinfo.workDate,
      );
      setSellouts(prev =>
        prev.map(s =>
          s.guiId === item.guiId ? { ...s, numPhoto: lst.length } : s,
        ),
      );
    },
    [kpiinfo.kpiId, workinfo.shopId, workinfo.workDate],
  );

  const promotionLoad = useCallback(() => {
    Store().then(async () => {
      const lst = await PromotionGetList(workinfo);
      setSellouts(lst);
      lst.forEach(item => {
        if (item.guiId != null) mapItem(item);
      });
    });
  }, [workinfo, mapItem]);

  const loadData = useCallback(async () => {
    const [lstcategory, lstcompetitor, isCheck] = await Promise.all([
      getCategoryPromotion(),
      getLstCompetitorsMitsu(),
      checkLockReport(shopinfo),
    ]);
    const day = parseInt(moment().format('YYYYMMDD'));
    setCategories(lstcategory);
    setCompetitors(lstcompetitor);
    setIsLockReport(isCheck);
    setIsOldDay(workinfo.workDate !== day);
    setListReport(JSON.parse(kpiinfo.reportItem || '{}'));
  }, [workinfo, shopinfo, kpiinfo.reportItem]);

  useEffect(() => {
    loadData();
    promotionLoad();
    const unsubscribe = navigation.addListener('focus', promotionLoad);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- handlers ---

  const handleAddNew = useCallback(() => {
    const day = parseInt(moment().format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      setShowForm(true);
      setGuiId(UUIDGenerator());
      setLoading(prev => prev + 1);
    } else {
      ToastError('Bạn đang báo cáo dữ liệu ngày cũ!');
    }
  }, [workinfo.workDate]);

  const handleClose = useCallback(async () => {
    await promotionLoad();
    setShowForm(false);
    setLoadHistory(false);
  }, [promotionLoad]);

  const handleUpload = useCallback(async () => {
    const { res } = await PromotionItemUpload(workinfo);
    if (res != null && res.length > 0) {
      alertConfirm(
        'Gửi báo cáo',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không?',
        async () => {
          const workTem = { ...workinfo, reportId: kpiinfo.id };
          await UploadController.DataPromotion(
            workTem,
            async () => {
              setShowProgress(false);
              await promotionLoad();
            },
            () => setShowProgress(false),
          );
        },
      );
    } else {
      ToastSuccess('Đã gửi hết dữ liệu');
    }
  }, [workinfo, kpiinfo.id, promotionLoad]);

  const handleReloadCombo = useCallback(() => {
    setCategories(prev => [...prev]);
    setCompetitors(prev => [...prev]);
  }, []);

  const handleShowDetail = useCallback(item => {
    setShowForm(true);
    setLoading(prev => prev + 1);
    setLoadHistory(true);
    setItemSelected(item);
  }, []);

  // --- derived data ---

  const handleRightHeader = useCallback(() => {
    if (isLockReport) {
      ToastSuccess(
        'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
      );
    } else if (!isOldDay) {
      handleUpload();
    }
  }, [isLockReport, isOldDay, handleUpload]);

  // --- view render blocks ---

  const renderItem = useCallback(
    ({ item, index }) => (
      <PromotionResRow
        item={item}
        index={index}
        navigation={navigation}
        listReport={listReport}
        loadData={promotionLoad}
        showDetail={handleShowDetail}
      />
    ),
    [navigation, listReport, promotionLoad, handleShowDetail],
  );

  return (
    <View
      style={{ height: '100%', width: '100%', backgroundColor: appcolor.light }}
    >
      {!showForm && (
        <View style={{ flex: 1 }}>
          <HeaderCustom
            title={kpiinfo.menuNameVN}
            iconRight={!isLockReport ? 'cloud-upload-alt' : 'user-lock'}
            leftFunc={() => navigation.goBack()}
            rightFunc={handleRightHeader}
          />
          <FlatList
            data={sellouts}
            ItemSeparatorComponent={Separator}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
          />
          {showProgress && (
            <Progress.Circle
              color={DEFAULT_COLOR}
              thickness={5}
              size={90}
              indeterminate
              style={{
                position: 'absolute',
                alignSelf: 'center',
                marginTop: Dimensions.get('window').height / 2,
              }}
            />
          )}
          <SpiralIcon
            iconStyle={{ color: DEFAULT_COLOR }}
            onPress={handleAddNew}
            containerStyle={{
              position: 'absolute',
              zIndex: 10,
              right: 20,
              bottom: 40,
              maxHeight: 40,
            }}
            size={40}
            name="add-circle-outline"
            type="ionicon"
          />
        </View>
      )}
      {showForm && (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
          <PromotionModel
            Categories={categories}
            Competitors={competitors}
            Closed={handleClose}
            guiId={guiId}
            navigation={navigation}
            loaddata={handleReloadCombo}
            loading={loading}
            loadHistory={loadHistory}
            ItemSaved={itemSelected}
            listReport={listReport}
          />
        </View>
      )}
    </View>
  );
};

export default Promotion;
