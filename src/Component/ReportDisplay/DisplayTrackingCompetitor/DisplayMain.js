import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { _competitorName } from '../../../Core/URLs';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import {
  getAllListTrackResLG,
  getAllListTrackUpload,
  getListCategoryTracking,
  getListDataTracking,
} from '../../../Controller/TrackingDetailController';
import { checkNetwork } from '../../../Core/Utility';
import { MessageAction, ToastError, ToastSuccess } from '../../../Core/Helper';
import UploadController from '../../../Controller/UploadController';
import { SceneMap } from 'react-native-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { TrackingCompetitor } from './TrackingCompetitor';
import { TabForm } from '../../../Control/TabForm';
import {
  getAllPhotosUpload,
  getPhotosReport,
  getPhotosReportByCate,
} from '../../../Controller/WorkController';
import { checkLockReport } from '../../../Controller/ShopController';
import moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

/** 
 * Config
 * "image": Số lượng hình ảnh cần chụp
    "isConstraint" : bật kiểm tra hình ảnh
    "isTakeByCate" , Có chụp hình theo cate không
    "isTakeTemplate" : có chụp theo template không
    "imageByCate" : có kiểm tra hình ảnh theo cate không
    ImageByList : template hình ảnh theo cate

*/

export const DisplayMain = ({ navigation, route }) => {
  const [Status, setStatus] = useState(false);
  const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [reload, setReload] = useState(0);
  const [isLockReport, setLockReport] = useState(false);
  const [isDone, setDone] = useState(false);
  const [toolAction, setToolAction] = useState(null);
  const ref_bottomSheet = useRef();
  const insets = useSafeAreaInsets();

  const reportItem = JSON.parse(kpiinfo?.reportItem);
  const reportId = kpiinfo.id || kpiinfo.kpiId;
  const routes = [
    { key: 'first', title: 'Nhập liệu' },
    { key: 'second', title: 'Hình ảnh' },
  ];
  //
  const checkUploaded = async () => {
    const isCheck = await checkLockReport(shopinfo);
    await setLockReport(isCheck);
    const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
    let lstResDSUpload = await getAllListTrackUpload(
      workinfo,
      reportItem.DisplayCompetitor,
    );
    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setStatus(lstResDSUpload.length === 0 ? false : true);
    } else {
      await setStatus(true);
    }
  };
  useEffect(() => {
    const _check = checkUploaded();
    return () => _check;
  }, []);

  const uploadData = async () => {
    const _valid = await validData();
    if (!_valid) return;
    MessageAction(
      'Bạn có muốn tiếp tục gửi báo cáo không ? (Sau khi gửi dữ liệu sẽ không thể điều chỉnh)',
      uploadAction,
    );
  };
  const validData = async () => {
    const {
      isConstraint,
      isTakeByCate,
      isTakeTemplate,
      imageByCate,
      DisplayCompetitor,
      ImageByList,
      isCheckAll,
      image,
      isOnlyItem,
    } = reportItem;
    //
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return false;
    }
    // Check Data
    let lstReuslt = await getAllListTrackResLG(workinfo, DisplayCompetitor);
    if (lstReuslt == null || lstReuslt.length == 0) {
      ToastError(
        'Vui lòng nhập dữ liệu đầy đủ trước khi gửi báo cáo lên hệ thống',
      );
      return false;
    }
    if (isCheckAll == 1) {
      const dataTrackingList = await getListDataTracking(
        workinfo,
        DisplayCompetitor,
      );
      if (dataTrackingList !== null && dataTrackingList.length > 0) {
        for (let index = 0; index < dataTrackingList.length; index++) {
          const item = dataTrackingList[index];
          if (item.display == null) {
            ToastError(
              `Vui lòng nhập dữ liệu ${item.competitorName} - ${isOnlyItem == 1 ? `Đối thủ` : item.category || ''
              }`,
            );
            return false;
          }
        }
      }
    }
    // Check Photo
    if (isConstraint !== undefined && isConstraint === 1) {
      let noteStr = '';
      const resPhotos = await getAllPhotosUpload(
        reportId,
        workinfo.shopId,
        workinfo.workDate,
      );
      const lstTab = await getListCategoryTracking(DisplayCompetitor);
      //
      if (isTakeByCate == 1) {
        if (isTakeTemplate == 1) {
          if (image !== undefined && image > 0) {
            if (imageByCate == 1) {
              for (let index = 0; index < lstTab.length; index++) {
                const itT = lstTab[index];
                let lstPhoto = await getPhotosReportByCate(
                  reportId,
                  `_${itT.category}`,
                  workinfo.shopId,
                  workinfo.workDate,
                );
                if (lstPhoto.length < image) {
                  ToastError(
                    `Vui lòng chụp ${image} tấm hình cho ${itT.category}. (${lstPhoto.length}/${image})`,
                  );
                  return false;
                }
              }
            }
            if (resPhotos.length < image) {
              ToastError(
                `Vui lòng chụp ${image} tấm hình cho báo cáo.(${resPhotos.length}/${image})`,
              );
              return false;
            }
          } else {
            const LstMenuPhotos = ImageByList || [];
            for (let index = 0; index < lstTab.length; index++) {
              const itT = lstTab[index];
              if (LstMenuPhotos[itT.category]?.length > 0) {
                let lstTem = LstMenuPhotos[itT.category];
                for (let index = 0; index < lstTem.length; index++) {
                  const itL = lstTem[index];
                  let photoType = itL.code + '_' + itT.category;
                  let lstPhoto = await getPhotosReport(
                    reportId,
                    photoType,
                    workinfo.shopId,
                    workinfo.workDate,
                  );
                  if (lstPhoto.length < itL.numberIMG) {
                    noteStr +=
                      itT.category +
                      ': Vui lòng chụp ' +
                      itL.numberIMG +
                      ' tấm hình cho ' +
                      itL.nameVN +
                      ', ';
                  }
                }
                if (noteStr !== '') {
                  ToastError(noteStr);
                  return false;
                }
              }
            }
          }
        } else if (image !== undefined && image > 0) {
          if (imageByCate == 1) {
            for (let index = 0; index < lstTab.length; index++) {
              const itT = lstTab[index];
              let lstPhoto = await getPhotosReport(
                reportId,
                itT.category,
                workinfo.shopId,
                workinfo.workDate,
              );
              if (lstPhoto.length < image) {
                ToastError(
                  `Vui lòng chụp ${image} tấm hình cho ${itT.category}. (${lstPhoto.length}/${image})`,
                );
                return false;
              }
            }
          } else if (resPhotos.length < image) {
            ToastError(
              `Vui lòng chụp ${image} tấm hình cho báo cáo.(${resPhotos.length}/${image})`,
            );
            return false;
          }
        }
      } else {
        if (image !== undefined && image === 0) {
          const LstMenuPhotos = ImageByList || [];
          for (let index = 0; index < LstMenuPhotos.length; index++) {
            const it = LstMenuPhotos[index];
            let lstPhoto = await getPhotosReport(
              reportId,
              it.code,
              workinfo.shopId,
              workinfo.workDate,
            );
            if (lstPhoto.length < it.numberIMG) {
              ToastError(
                `Vui lòng chụp ${it.numberIMG} tấm hình cho ${it.nameVN}.(${lstPhoto.length}/${it.numberIMG})`,
              );
              return false;
            }
          }
        }
        if (image !== undefined && image > 0 && resPhotos.length < image) {
          ToastError(
            `Vui lòng chụp ${image} tấm hình cho báo cáo.(${resPhotos.length}/${image})`,
          );
          return false;
        }
      }
    }
    //
    return true;
  };
  const uploadAction = async () => {
    await UploadController.DataTrackingCompetitor(
      { ...workinfo, reportId },
      reportItem.DisplayCompetitor,
      async () => {
        await setReload(reload + 1);
        await checkUploaded();
      },
    );
  };
  const openSheet = () => {
    Keyboard.dismiss();
    ref_bottomSheet.current?.show();
  };
  const filterDoneData = async () => {
    const nextDone = !isDone;
    await setDone(nextDone);
    setToolAction({
      type: 'FILTER_DONE',
      enabled: nextDone,
      id: new Date().getTime(),
    });
    ref_bottomSheet.current?.hide();
  };
  const setClearAll = async () => {
    if (Status || isLockReport) {
      ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!');
      ref_bottomSheet.current?.hide();
      return;
    }
    MessageAction(
      'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
      async () => {
        await setDone(false);
        setToolAction({ type: 'CLEAR_DATA', id: new Date().getTime() });
        ref_bottomSheet.current?.hide();
      },
    );
  };
  const renderScene = SceneMap({
    first: () => (
      <TrackingCompetitor
        key={'trackingCompetitor'}
        navigation={navigation}
        route={route}
        combine={true}
        reload={reload}
        Status={Status}
        toolAction={toolAction}
      />
    ),
    second: () =>
      reportItem.isTakeByCate == 1 ? null : (
        <PhotoItems
          key={'PhotoItem'}
          usedHeader={false}
          navigation={navigation}
          route={{
            params: { Photos: reportItem.ImageByList || [], Status: Status },
          }}
        />
      ),
  });
  const styles = StyleSheet.create({
    sheetContainer: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 28,
      width: '100%',
    },
    sheetTitle: {
      color: appcolor.dark,
      fontSize: 18,
      fontWeight: '700',
      paddingTop: 4,
    },
    sheetSubTitle: {
      color: appcolor.greydark || appcolor.placeholderText,
      fontSize: 12,
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
    sheetActionDanger: { borderColor: appcolor.danger },
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
      fontSize: 14,
      fontWeight: '600',
    },
    sheetActionTextDanger: { color: appcolor.danger },
  });
  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        title={route.params.titlePage}
        leftFunc={() => navigation.goBack()}
        iconMiddle="poll-h"
        middleFunc={openSheet}
        iconRight={
          !isLockReport ? (!Status ? 'cloud-upload-alt' : null) : 'user-lock'
        }
        rightFunc={() =>
          !isLockReport
            ? !Status
              ? uploadData()
              : null
            : ToastSuccess(
              'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
            )
        }
      />
      <TabForm
        initialPage={0}
        routes={
          reportItem.isTakeByCate == 1
            ? [{ key: 'first', title: 'Nhập liệu' }]
            : reportItem.tabList || routes
        }
        positionTabBar={'top'}
        swipeEnabled={false}
        renderScene={renderScene}
      />
      <ActionSheet
        ref={ref_bottomSheet}
        headerAlwaysVisible={true}
        defaultOverlayOpacity={0.3}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: appcolor.light,
          padding: 10,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>Công cụ</Text>
          <Text style={styles.sheetSubTitle}>
            Quản lý nhanh dữ liệu trưng bày đối thủ
          </Text>
          <TouchableOpacity style={styles.sheetAction} onPress={filterDoneData}>
            <View style={styles.sheetIconView}>
              <SpiralIcon
                name={!isDone ? 'checkmark-circle-outline' : 'check-circle'}
                type={!isDone ? 'ionicon' : ''}
                size={22}
                color={!isDone ? appcolor.dark : appcolor.success}
              />
            </View>
            <Text style={styles.sheetActionText}>Dữ liệu đã nhập</Text>
            <SpiralIcon
              name="chevron-forward"
              type="ionicon"
              size={18}
              color={appcolor.greydark || appcolor.placeholderText}
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
              style={[styles.sheetActionText, styles.sheetActionTextDanger]}
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
    </View>
  );
};
