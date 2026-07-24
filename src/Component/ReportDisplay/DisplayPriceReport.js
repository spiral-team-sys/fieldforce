import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import {
  getDisplayResult,
  getCompetitorProductBy,
  getAllPhotosUpload,
  getPhotosReport,
} from '../../Controller/WorkController';
import {
  clearAllDataDisplay,
  getAllDisplayProduct,
  getDataHistoryDisplayByShop,
  getlistTabCompetitor,
} from '../../Controller/DisplayController';
import { checkNetwork, deviceWidth, deviceHeight } from '../../Core/Utility';
import {
  groupDataByKey,
  Message,
  MessageAction,
  ToastError,
} from '../../Core/Helper';
import { _competitorId, _competitorName } from '../../Core/URLs';
import UploadController from '../../Controller/UploadController';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import FormGroup from '../../Content/FormGroup';
import ActionSheet from 'react-native-actions-sheet';
import { LoadingView } from '../../Control/ItemLoading';
import { InputDisplayReport } from './LG/InputDisplayReport';
import moment from 'moment';
import { REPORT } from '../../API/ReportAPI';
import _ from 'lodash';
import CustomListView from '../../Control/Custom/CustomListView';
import {
  fontWeightBold,
  scaleSize,
  styleDefault,
} from '../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const inputFields = [
  'quanity',
  'price',
  'fsmValue',
  'quantitySuggest',
  'quantityStock',
  'displayArea',
  'mockupValue',
  'tagPOPId',
  'tagDisplayId',
  'displayType',
  'displayComment',
  'productComment',
];

const hasInputValue = value => {
  return (
    value !== undefined && value !== null && value !== 'null' && value !== ''
  );
};

/**
    isMultiSendData : cho phép gửi dữ liệu nhiều lần lên hệ thống
    ImageByList : chụp hình theo danh sách 
    isByType : báo cáo trưng bày theo đối thủ hay không
    isConstraint : ràng hình ảnh
    minPrice : giá thấp nhất
    isUseStock : có nhập tồn kho không
    isConstraintPrice : có nhập giá không
    photoBySKU : chụp hình theo từng sản phẩm
    isAlbum : có cho chọn hình trong máy không
    isNoteBySKU : ghi chú theo từng sản phẩm
    placeholderStock : placeholder của tồn khi
 */

export const DisplayPriceReport = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [data, setData] = useState({
    arrTabShow: [],
    dataTabByCompe: [],
    arrDataShow: [],
    arrDataShowF: [],
    lstCompetitor: [],
  });
  const [select, setSelect] = useState({
    competitorSelect: _competitorName,
    competitorIdSelect: _competitorId,
  });
  const [showProgress, setProgress] = useState(true);
  const [isDone, setDone] = useState(false);
  const [Status, setStatus] = useState(false);
  const [isClear, setClear] = useState(0);
  const competitorListRef = useRef();
  const ref_bottomSheet = useRef();
  const lstReport = JSON.parse(kpiinfo?.reportItem || '{}');
  const [reload, setReload] = useState(0);
  const [currentTab, setCurrentTab] = useState({ objTab: {} });
  const [_mutate, setMutate] = useState(false);
  const appStyles = useMemo(() => styleDefault(appcolor), [appcolor]);
  const styles = useMemo(() => {
    return StyleSheet.create({
      mainContainer: { flex: 1, backgroundColor: appcolor.light },
      searchInput: {
        backgroundColor: appcolor.grayLight,
        marginHorizontal: 8,
        marginTop: 8,
        marginBottom: 6,
        alignSelf: 'center',
      },
      searchText: { fontSize: scaleSize(12), color: appcolor.dark },
      competitorSection: {
        width: '100%',
        height: 52,
        justifyContent: 'center',
        backgroundColor: appcolor.light,
        paddingBottom: 4,
      },
      competitorList: { width: '100%', height: 44 },
      competitorButton: {
        minWidth: deviceWidth / 5,
        paddingVertical: 7,
        paddingHorizontal: 10,
        backgroundColor: appcolor.surface,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 4,
        marginVertical: 4,
      },
      competitorTitle: { fontSize: scaleSize(13) },
      contentContainer: { backgroundColor: appcolor.light },
      sheetContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 28,
        width: '100%',
      },
      sheetTitle: {
        color: appcolor.dark,
        fontSize: scaleSize(17),
        fontWeight: fontWeightBold,
        paddingTop: 4,
      },
      sheetSubTitle: {
        color: appcolor.greydark || appcolor.placeholderText,
        fontSize: scaleSize(11),
        paddingTop: 4,
        paddingBottom: 12,
      },
      sheetAction: {
        width: '100%',
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: appcolor.grayLight,
        backgroundColor: appcolor.light,
      },
      sheetActionDanger: {
        borderColor: appcolor.danger,
        backgroundColor: appcolor.light,
      },
      sheetIconView: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appcolor.grayLight,
      },
      sheetIconDanger: { backgroundColor: appcolor.surface },
      sheetActionText: {
        color: appcolor.dark,
        flex: 1,
        paddingHorizontal: 12,
        fontSize: scaleSize(13),
        fontWeight: fontWeightBold,
      },
      sheetActionDangerText: { color: appcolor.danger },
      loadingOverlay: {
        width: '100%',
        position: 'absolute',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: deviceHeight / 2,
      },
    });
  }, [appcolor]);
  const loadDataShow = async () => {
    await setProgress(true);
    let lstRes = await getDisplayResult(workinfo);
    let isUpload =
      lstReport?.isMultiSendData == 1
        ? 0
        : lstRes.length > 0
        ? lstRes[0].upload
        : 0;
    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setStatus(isUpload);
    } else {
      await setStatus(1);
    }

    let listProduct = [];
    if (lstReport.isProductByShop == 1) {
      const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
      await REPORT.GetDataReportByShop_RealTime(params, async mData => {
        const detailProduct =
          mData?.length > 0 ? mData[0]?.details || null : null;
        if (detailProduct) {
          listProduct = await getAllDisplayProduct(workinfo, detailProduct);
        } else {
          listProduct = await getAllDisplayProduct(workinfo);
        }
      });
    } else {
      listProduct = await getAllDisplayProduct(workinfo);
    }

    let competitors = await getCompetitorProductBy(
      _competitorId,
      lstReport?.isByType || 0,
    ); //list competitor
    const lstTab = await getlistTabCompetitor(); //list tab
    const lstTabByCompe = lstTab?.filter(it => it.divisionId === _competitorId);
    const { arr } = groupDataByKey({
      arr: listProduct,
      key: 'categoryId',
      keyLayer2: 'subCatId',
    });
    data.arrTabShow = lstTab;
    data.dataTabByCompe = lstTabByCompe;
    data.arrDataShow = arr;
    data.arrDataShowF = arr;
    data.lstCompetitor = competitors;
    setTimeout(async () => {
      await setProgress(false);
    }, 500);
  };

  useEffect(() => {
    loadDataShow();
    return () => false;
  }, []);

  const filterDoneProduct = async () => {
    let done = !isDone;
    let lstRes = data.arrDataShowF.filter(it => contains(it));

    if (done) {
      await setData({ ...data, arrDataShow: lstRes });
    } else {
      await setData({ ...data, arrDataShow: data.arrDataShowF });
    }
    await setDone(e => !e);
  };
  const filterProduct = async text => {
    if (text.length > 0) {
      let filterList = data.arrDataShowF.filter(
        i =>
          i.productName.toLowerCase().match(text.toLowerCase()) ||
          i.productCode.toLowerCase().match(text.toLowerCase()),
      );
      data.arrDataShow = filterList;
    } else {
      data.arrDataShow = data.arrDataShowF;
    }
    setMutate(e => !e);
  };

  const contains = item => {
    return inputFields.some(field => hasInputValue(item?.[field]));
  };

  const uploadAction = async () => {
    // let resDisplay = await getDisplayResult(workinfo);
    let resDisplay = _.filter(data.arrDataShowF, item => {
      return contains(item);
    });

    let resPhotos = await getAllPhotosUpload(
      kpiinfo.kpiId,
      workinfo.shopId,
      workinfo.workDate,
    );
    let noteStr = '';
    let isConstraint;
    let numLimitPhoto;

    if (lstReport) {
      try {
        if (lstReport?.isConstraint !== undefined) {
          isConstraint = lstReport?.isConstraint;
        }
        if (lstReport?.image !== undefined) {
          numLimitPhoto = lstReport?.image;
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (isConstraint !== undefined && isConstraint == 1) {
      if (
        numLimitPhoto !== undefined &&
        numLimitPhoto > 0 &&
        resPhotos.length < numLimitPhoto
      ) {
        noteStr += 'Vui lòng chụp ' + numLimitPhoto + ' tấm hình cho báo cáo.';
      }
      if (numLimitPhoto !== undefined && numLimitPhoto === 0) {
        const LstMenuPhotos = lstReport?.ImageByList || [];

        for (let index = 0; index < data.arrTabShow.length; index++) {
          const itT = data.arrTabShow[index];
          let lstTem = LstMenuPhotos[itT.categoryName];
          for (let idx = 0; idx < lstTem?.length || 0; idx++) {
            const it = lstTem[idx];
            let photoType = it.code + '_' + itT.categoryName;
            let lstPhoto = await getPhotosReport(
              kpiinfo.kpiId,
              photoType,
              workinfo.shopId,
              workinfo.workDate,
            );
            if (lstPhoto.length < it.numberIMG) {
              ToastError(
                itT.name ||
                  itT.categoryName +
                    ': Vui lòng chụp ' +
                    it.numberIMG +
                    ' tấm hình cho ' +
                    it.nameVN +
                    ', ',
              );
              return;
            }
          }
        }
      }
    }

    if (Status === 1) {
      ToastError('Báo cáo đã khóa');
      return;
    }

    // // Check Report
    if (resDisplay.length == 0) {
      ToastError(
        `Hoàn thành báo cáo trước khi gửi dữ liệu lên hệ thống`,
        'Dữ liệu báo cáo',
        'top',
      );
      return;
    } else {
      for (let index = 0; index < resDisplay.length; index++) {
        const item = resDisplay[index];
        if (
          item.price !== null &&
          item.price !== 'null' &&
          (item.price <
            (lstReport?.minPrice && lstReport?.minPrice !== ''
              ? lstReport?.minPrice
              : 1000) ||
            item.price %
              (lstReport?.minPrice && lstReport?.minPrice !== ''
                ? lstReport?.minPrice
                : 1000) >
              0)
        ) {
          ToastError(
            `Giá sản phẩm ${item.productName} - ${item.categoryName} - ${item.division} sai định dạng`,
            'Giá sản phẩm',
            'top',
          );
          return;
        }
        if (
          (item.price === 'null' || item.price === null) &&
          item.fsmValue !== 'null' &&
          item.fsmValue !== null &&
          item.fsmValue > 0
        ) {
          ToastError(
            `Chưa nhập giá ${item.productName} - ${item.categoryName} - ${item.division}`,
            'Giá',
            'top',
          );
          return;
        }
        if (
          (item.quanity === 'null' || item.quanity === null) &&
          item.price !== 'null' &&
          item.price !== null &&
          item.price > 0
        ) {
          ToastError(
            `Chưa nhập số lượng ${item.productName} - ${item.categoryName} - ${item.division}`,
            'Số lượng',
            'top',
          );
          return;
        }
        if (
          (item.quanity === 'null' || item.quanity === null) &&
          item.quantityStock !== 'null' &&
          item.quantityStock !== null &&
          item.price >= 0
        ) {
          ToastError(
            `Chưa nhập số lượng ${item.productName} - ${item.categoryName} - ${item.division}`,
            'Số lượng',
            'top',
          );
          return;
        }
        if (
          lstReport?.isConstraintPrice == 1 ||
          lstReport?.isConstraintPrice == 2
        ) {
          if (
            item.quanity !== 'null' &&
            item.quanity !== null &&
            item.quanity > 0 &&
            (item.price === 'null' || item.price === null || item.price === '')
          ) {
            ToastError(
              `Đã nhập số lượng, chưa nhập giá. ${item.productName} - ${item.categoryName} - ${item.division}`,
              'Giá',
              'top',
            );
            return;
          }
        }
        if (lstReport?.isUseStock == 2) {
          if (
            item.quanity !== 'null' &&
            item.quanity !== null &&
            item.quanity > 0 &&
            (item.quantityStock === 'null' ||
              item.quantityStock === null ||
              item.quantityStock === '')
          ) {
            ToastError(
              `Đã nhập số lượng, chưa nhập tồn kho. ${item.productName} - ${item.categoryName} - ${item.division}`,
              'Giá',
              'top',
            );
            return;
          }
        }
      }
    }

    let itemsUpload = resDisplay.filter(
      it => it.quanity !== 'null' && it.quanity !== null,
    );
    // console.log('up: ', itemsUpload)
    if (itemsUpload.length === 0) {
      ToastError('Vui lòng làm báo cáo');
      return;
    }

    if (noteStr !== '') {
      ToastError(noteStr);
      return;
    }

    if (Object.keys(lstReport || {}).length > 0) {
      try {
        let numCheckProduct = null;
        if (
          lstReport?.numCheckProduct !== undefined ||
          lstReport?.isCheckByProduct == 1
        ) {
          numCheckProduct = lstReport?.numCheckProduct || 1;
        }
        if (numCheckProduct) {
          const dataHistory = await getDataHistoryDisplayByShop(
            workinfo.shopId,
          );
          let satisfyConditions = _.filter(data.arrDataShowF, item => {
            const checkHistory = dataHistory.filter(
              it =>
                it.productId == item.productId &&
                it.hDisplay >= numCheckProduct,
            );
            if (
              item.quanity >= (numCheckProduct || 1) &&
              (checkHistory || [])?.length == 0
            )
              return true;
            else return false;
          });
          if (satisfyConditions.length > 0) {
            Message(
              'Chú ý',
              `Sản phẩm trưng bày mới nhập có số lượng >= ${numCheckProduct}, bạn có chắc chắn muốn gửi không?`,
              () => UploadData(data.arrDataShowF, resPhotos),
            );
          } else {
            Message(
              'Chú ý',
              'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
              () => UploadData(data.arrDataShowF, resPhotos),
            );
          }
        } else {
          Message(
            'Chú ý',
            'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
            () => UploadData(data.arrDataShowF, resPhotos),
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      Message(
        'Chú ý',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        () => UploadData(data.arrDataShowF, resPhotos),
      );
    }
  };

  const clearData = async () => {
    data.arrDataShowF.map(it => {
      it.quanity = null;
      it.price = null;
      it.displayComment = null;
      it.productComment = null;
    });
    setData({ ...data, arrDataShowF: data.arrDataShowF });
  };
  const clearDataByCate = async currentItem => {
    data.arrDataShowF.map(it => {
      if (
        it.categoryId == currentItem.categoryId &&
        it.divisionId == currentItem.divisionId
      ) {
        it.quanity = null;
        it.price = null;
        it.displayComment = null;
        it.productComment = null;
      }
    });
    setData({ ...data, arrDataShowF: data.arrDataShowF });
  };
  const setClearAll = async () => {
    if (Status !== 1) {
      Message(
        'Chú ý',
        'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
        async () => {
          await clearAllDataDisplay(workinfo);
          await setDone(false);
          await setClear(isClear + 1);
          await clearData();
          ref_bottomSheet.current?.hide();
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_bottomSheet.current?.hide();
    }
  };

  const UploadData = async (resDisplay, resPhotos) => {
    const work = { ...workinfo, reportId: kpiinfo.kpiId };
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    const resDisplayFilter = [];
    resDisplay.map(it =>
      resDisplayFilter.push({
        productId: it.productId,
        quanity: it.quanity,
        quantityStock: it.quantityStock,
        quanitySuggest: it.quanitySuggest,
        price: it.price,
        displayType: it.displayType,
        displayComment: it.displayComment,
        productComment: it.productComment,
      }),
    );

    await UploadController.DataDisplay(
      resDisplay,
      work,
      async () => {
        await loadDataShow();
        await setReload(reload + 1);
      },
      async () => {},
    );
  };

  // View Item Competitor
  const setCompeSelect = useCallback(async item => {
    setSelect({ competitorSelect: item?.name, competitorIdSelect: item?.id });
    setReload(e => e + 1);
  }, []);
  const scrollOnPress = useCallback(
    async (item, index) => {
      await setProgress(true);
      data.dataTabByCompe = data.arrTabShow?.filter(
        it => it.divisionId === item.id,
      );
      await setCompeSelect(item);
      await competitorListRef.current?.scrollToIndex({
        animated: true,
        index: index,
        viewPosition: 0.5,
      });
      await setProgress(false);
    },
    [data, setCompeSelect],
  );
  const RenderItemCompetitor = useCallback(
    ({ item, index }) => {
      const onPress = () => {
        scrollOnPress(item, index);
      };
      const colorTitle =
        select.competitorIdSelect === item.id
          ? appcolor.primary
          : appcolor.dark;
      const fontWeightTitle =
        select.competitorIdSelect === item.id ? '800' : 'normal';
      return (
        <TouchableOpacity
          key={`DD_${index}`}
          onPress={onPress}
          style={styles.competitorButton}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.competitorTitle,
              { color: colorTitle, fontWeight: fontWeightTitle },
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [
      appcolor,
      scrollOnPress,
      select.competitorIdSelect,
      styles.competitorButton,
      styles.competitorTitle,
    ],
  );

  const openSheet = () => {
    setMutate(e => !e); // làm mới lại view của actionSheet để hiện ngành hàng
    ref_bottomSheet.current.show();
  };
  const handlerClearByCategory = () => {
    if (Status !== 1) {
      const currentItem = data.dataTabByCompe[currentTab.objTab?.index || 0];
      MessageAction(
        `Bạn có muốn xoá dữ liệu ngành hàng ${currentItem.categoryName} hãng ${
          currentItem.division || _competitorName
        } đã nhập không ?`,
        async () => {
          await clearAllDataDisplay(workinfo, currentItem.categoryId);
          await setDone(false);
          await setClear(isClear + 1);
          await clearDataByCate(currentItem);
          ref_bottomSheet.current?.hide();
        },
      );
    } else {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_bottomSheet.current?.hide();
    }
  };
  const currentCategoryName =
    currentTab.objTab?.index !== undefined
      ? currentTab.objTab?.tabName || ''
      : data.dataTabByCompe[0]?.categoryName || '';
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        iconRight="cloud-upload-alt"
        rightFunc={Status !== 1 ? () => uploadAction() : null}
        leftFunc={() => navigation.goBack()}
        iconMiddle="poll-h"
        middleFunc={openSheet}
      />
      <View style={[appStyles.contentContainer, styles.contentContainer]}>
        <FormGroup
          containerStyle={styles.searchInput}
          inputStyle={styles.searchText}
          placeholder="Tìm kiếm sản phẩm"
          editable
          iconName="search"
          useClearAndroid={false}
          // onClearTextAndroid={filterProduct}
          // value={search}
          handleChangeForm={filterProduct}
        />
        {data.lstCompetitor.length > 1 && (
          <View style={styles.competitorSection}>
            <CustomListView
              horizontal
              ref={competitorListRef}
              containerStyle={styles.competitorList}
              data={data.lstCompetitor}
              renderItem={RenderItemCompetitor}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={deviceWidth / 5}
            />
          </View>
        )}
        {data.dataTabByCompe.length > 0 && !showProgress && (
          <InputDisplayReport
            navigation={navigation}
            appcolor={appcolor}
            workinfo={workinfo}
            kpiinfo={kpiinfo}
            data={data}
            select={select}
            Status={Status}
            isClear={isClear}
            showProgress={showProgress}
            reload={reload}
            currentTab={currentTab}
          />
        )}
      </View>
      <ActionSheet
        ref={ref_bottomSheet}
        headerAlwaysVisible={true}
        defaultOverlayOpacity={0.3}
        containerStyle={{
          padding: 10,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>Công cụ</Text>
          <Text style={styles.sheetSubTitle}>
            Quản lý nhanh dữ liệu trưng bày & giá trong báo cáo này
          </Text>
          <TouchableOpacity
            style={styles.sheetAction}
            onPress={filterDoneProduct}
          >
            <View style={styles.sheetIconView}>
              <SpiralIcon
                name={!isDone ? 'checkmark-circle-outline' : 'check-circle'}
                type={!isDone ? 'ionicon' : ''}
                size={22}
                color={!isDone ? appcolor.dark : appcolor.success}
              />
            </View>
            <Text style={styles.sheetActionText}>Sản phẩm đã nhập</Text>
            <SpiralIcon
              name="chevron-forward"
              type="ionicon"
              size={18}
              color={appcolor.greydark || appcolor.placeholderText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetAction, styles.sheetActionDanger]}
            onPress={handlerClearByCategory}
          >
            <View style={[styles.sheetIconView, styles.sheetIconDanger]}>
              <SpiralIcon
                name={'trash'}
                type={'ionicon'}
                size={22}
                color={appcolor.danger}
              />
            </View>
            <Text
              numberOfLines={2}
              style={[styles.sheetActionText, styles.sheetActionDangerText]}
            >{`Xóa dữ liệu ${currentCategoryName} đã nhập`}</Text>
            <SpiralIcon
              name="chevron-forward"
              type="ionicon"
              size={18}
              color={appcolor.danger}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetAction, styles.sheetActionDanger]}
            onPress={setClearAll}
          >
            <View style={[styles.sheetIconView, styles.sheetIconDanger]}>
              <SpiralIcon
                name={'trash'}
                type={'ionicon'}
                size={22}
                color={appcolor.danger}
              />
            </View>
            <Text
              style={[styles.sheetActionText, styles.sheetActionDangerText]}
            >
              Xóa dữ liệu đã nhập
            </Text>
            <SpiralIcon
              name="chevron-forward"
              type="ionicon"
              size={18}
              color={appcolor.danger}
            />
          </TouchableOpacity>
        </View>
      </ActionSheet>
      {showProgress && (
        <View style={styles.loadingOverlay}>
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={showProgress}
            styles={{ marginTop: 8 }}
          />
        </View>
      )}
    </View>
  );
};
