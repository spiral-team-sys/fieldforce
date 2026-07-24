import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import Moment from 'moment';
import * as Progress from 'react-native-progress';

import { HeaderCustom } from '../../../Content/HeaderCustom';
import { ToastError, ToastSuccess, UUIDGenerator } from '../../../Core/Helper';
import { DEFAULT_COLOR } from '../../../Core/URLs';
import {
  getPhotosReportByGuiId,
  PromotionGetList,
} from '../../../Controller/WorkController';
import { PromotionModel } from './Page/PromotionModel';
import { PromotionResRow } from './Page/PromotionResRow';
import { getLstCompetitorsMitsu } from '../../../Controller/CompetitorController';
import { getCategoryPromotion } from '../../../Controller/ProductController';
import UploadController from '../../../Controller/UploadController';
import { PromotionItemUpload } from '../../../Controller/PromotionController';
import { alertConfirm } from '../../../Core/Utility';
import { checkLockReport } from '../../../Controller/ShopController';
import CustomListView from '../../../Control/Custom/CustomListView';

const PromotionScreen = ({ navigation }) => {
  const { workinfo, kpiinfo, appcolor, shopinfo } = useSelector(
    state => state.GAppState,
  );

  const [sellouts, setSellouts] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [display, setDisplay] = useState('none');
  const [guiId, setGuiId] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(0);
  const [loadHistory, setLoadHistory] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [isLockReport, setIsLockReport] = useState(false);
  const [listReport, setListReport] = useState({});
  const [status, setStatus] = useState(false);

  const mapItem = useCallback(
    async item => {
      const lst = await getPhotosReportByGuiId(
        kpiinfo.kpiId,
        item.guiId,
        workinfo.shopId,
        workinfo.workDate,
      );
      setSellouts(prevSellouts =>
        prevSellouts.map(itemS =>
          itemS.guiId === item.guiId
            ? { ...itemS, numPhoto: lst.length }
            : itemS,
        ),
      );
    },
    [kpiinfo.kpiId, workinfo],
  );

  const promotionLoad = useCallback(async () => {
    const lst = await PromotionGetList(workinfo);
    setSellouts(lst);
    lst.forEach(itemR => {
      if (itemR.guiId !== undefined && itemR.guiId !== null) {
        mapItem(itemR);
      }
    });
  }, [mapItem, workinfo]);

  const loadData = useCallback(async () => {
    const lstcategory = await getCategoryPromotion();
    const lstcompetitor = await getLstCompetitorsMitsu();
    const isCheck = await checkLockReport(shopinfo);
    const day = parseInt(Moment(new Date()).format('YYYYMMDD'));
    const isOldDay = workinfo.workDate !== day;
    const report = JSON.parse(kpiinfo.reportItem || '{}');

    setCompetitors(lstcompetitor);
    setCategories(lstcategory);
    setIsLockReport(isCheck);
    setStatus(isOldDay);
    setListReport(report);
  }, [kpiinfo.reportItem, shopinfo, workinfo.workDate]);

  const onBack = () => {
    navigation.goBack();
  };

  const addNew = () => {
    const day = parseInt(Moment().format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      setDisplay('flex');
      setGuiId(UUIDGenerator());
      setLoading(prevLoading => prevLoading + 1);
    } else {
      ToastError('Bạn đang báo cáo dữ liệu ngày cũ!');
    }
  };

  const closeModel = async () => {
    await promotionLoad();
    setDisplay('none');
    setLoadHistory(false);
  };

  const upload = async () => {
    const { res } = await PromotionItemUpload(workinfo);

    if (res != null && res.length > 0) {
      alertConfirm(
        'Gửi báo cáo',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không?',
        async () => {
          const workTem = { ...workinfo, reportId: kpiinfo.id };
          setShowProgress(true);
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
  };

  const reloadDataCombo = () => {
    setCategories([...categories]);
    setCompetitors([...competitors]);
  };

  const showDetail = async itemAccept => {
    setDisplay('flex');
    setLoading(prevLoading => prevLoading + 1);
    setLoadHistory(true);
    setItemSelected(itemAccept);
  };

  useEffect(() => {
    loadData();
    promotionLoad();

    const unsubscribe = navigation.addListener('focus', promotionLoad);
    return unsubscribe;
  }, [loadData, navigation, promotionLoad]);

  const showList = display == 'none' ? 'flex' : 'none';

  const styles = StyleSheet.create({
    mainContainer: {
      height: '100%',
      width: '100%',
      backgroundColor: appcolor.light,
    },
    listContainer: { flex: 1, display: showList },
    modelContainer: { flex: 1, display, backgroundColor: appcolor.light },
    progress: {
      position: 'absolute',
      alignSelf: 'center',
      marginTop: Dimensions.get('window').height / 2,
    },
    addButton: {
      position: 'absolute',
      zIndex: 10,
      right: 20,
      bottom: 40,
      maxHeight: 40,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.listContainer}>
        <HeaderCustom
          title={kpiinfo.menuNameVN}
          iconRight={!isLockReport ? 'cloud-upload-alt' : 'user-lock'}
          leftFunc={onBack}
          rightFunc={() =>
            !isLockReport
              ? status
                ? null
                : upload()
              : ToastSuccess(
                  'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
                )
          }
        />

        <CustomListView
          data={sellouts}
          extraData={[sellouts, listReport]}
          renderItem={({ item, index }) => (
            <PromotionResRow
              item={item}
              index={index}
              navigation={navigation}
              listReport={listReport}
              loadData={promotionLoad}
              showDetail={showDetail}
            />
          )}
        />

        {showProgress === true && (
          <Progress.Circle
            color={DEFAULT_COLOR}
            thickness={5}
            size={90}
            indeterminate={true}
            style={styles.progress}
          />
        )}
        <SpiralIcon
          disabledStyle={{ backgroundColor: 'clear' }}
          iconStyle={{ color: DEFAULT_COLOR }}
          onPress={addNew}
          containerStyle={styles.addButton}
          size={40}
          name="add-circle-outline"
          type="ionicon"
        />
      </View>
      <View style={styles.modelContainer}>
        <PromotionModel
          Categories={categories}
          Competitors={competitors}
          Closed={closeModel}
          guiId={guiId}
          navigation={navigation}
          loaddata={reloadDataCombo}
          loading={loading}
          loadHistory={loadHistory}
          ItemSaved={itemSelected}
          listReport={listReport}
        />
      </View>
    </View>
  );
};

export default PromotionScreen;
