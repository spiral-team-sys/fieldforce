import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { checkNetwork, deviceHeight } from '../../../Core/Utility';
import {
  getDisplayProduct,
  getlistTabCompetitor,
  isPhotoNoData,
} from '../../../Controller/DisplayController';
import {
  getAllPhotos,
  getAllPhotosUpload,
  getDisplayResult,
  getPhotosReport,
} from '../../../Controller/WorkController';
import RNFS from 'react-native-fs';
import { Message, ToastError } from '../../../Core/Helper';
import UploadController from '../../../Controller/UploadController';
import { InputDisplayStock } from '../../ReportDisplay/Cuckoo/InputDisplayStock';
import { SceneMap } from 'react-native-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { TabForm } from '../../../Control/TabForm';
import { checkLockReport } from '../../../Controller/ShopController';
import moment from 'moment';

export const DisplayCombineBeko = ({ navigation, route }) => {
  const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [reload, setReload] = useState(false);
  const lstReport = JSON.parse(kpiinfo?.reportItem);
  const [Status, setStatus] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'first', title: 'Nhập Liệu' },
    { key: 'second', title: 'Hình Ảnh' },
  ]);
  const [settings, setSettings] = useState({
    isLockReport: false,
    isUploaded: false,
  });

  const listInput = [
    { id: 1, name: 'Trưng bày', displayType: 'quanity' },
    { id: 2, name: 'Tồn kho', displayType: 'quantityStock' },
    { id: 3, name: 'Đề xuất', displayType: 'quantitySuggest' },
    { id: 4, name: 'Thực bán', displayType: 'price' },
    // { id: 5, name: 'FSM Incentive', displayType: 'fsmValue', },
  ];

  const loadData = async () => {
    const lockReport = await checkLockReport(shopinfo);
    const lstResults = await getDisplayResult(workinfo);
    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setSettings({
        isLockReport: lockReport,
        isUploaded: lstResults[0]?.upload == 1 || false,
      });
    } else {
      await setSettings({
        isLockReport: lockReport,
        isUploaded: true,
      });
    }

    // let lstRes = await getDisplayResult(workinfo);
    // let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
    // await setStatus(isUpload)
  };

  useEffect(() => {
    loadData();
    return () => reload;
  }, []);

  const uploadAction = async () => {
    // await Keyboard.dismiss()
    const listProduct = await getDisplayProduct(workinfo);
    let resDisplay = await getDisplayResult(workinfo);
    let resPhotos = await getAllPhotosUpload(
      kpiinfo.kpiId,
      workinfo.shopId,
      workinfo.workDate,
    );
    let noteStr = '';

    //check limit photo
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
    if (isConstraint !== undefined && isConstraint === 1) {
      if (numLimitPhoto !== undefined && numLimitPhoto === 0) {
        const LstMenuPhotos = lstReport?.ImageByList || [];
        for (let index = 0; index < LstMenuPhotos.length; index++) {
          const it = LstMenuPhotos[index];
          let lstPhoto = await getPhotosReport(
            kpiinfo.kpiId,
            it.code,
            workinfo.shopId,
            workinfo.workDate,
          );
          if (lstPhoto.length < it.numberIMG) {
            noteStr +=
              'Vui lòng chụp ' +
              it.numberIMG +
              ' tấm hình cho ' +
              it.nameVN +
              '.\n';
          }
        }
      }
      if (
        numLimitPhoto !== undefined &&
        numLimitPhoto > 0 &&
        resPhotos.length < numLimitPhoto
      ) {
        noteStr += 'Vui lòng chụp ' + numLimitPhoto + ' tấm hình cho báo cáo.';
      }
    }

    if (settings.isUploaded) {
      ToastError('Báo cáo đã khóa');
      return;
    }

    // // Check Report
    if (resDisplay.length == 0 && lstReport?.isDisplayBlank !== 1) {
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
          (item.price !== null &&
            item.price !== 'null' &&
            (item.price < 10000 || item.price % 1000 > 0)) ||
          (item.fsmValue !== null &&
            item.fsmValue !== 'null' &&
            (item.fsmValue < 1000 || item.fsmValue % 1000 > 0))
        ) {
          ToastError(
            `Giá sản phẩm ${item.productName} ngành hàng ${item.categoryName} sai định dạng`,
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
            `Chưa nhập giá ${item.productName} ngành hàng ${item.categoryName}`,
            'Giá',
            'top',
          );
          return;
        }
        if (
          (item.quanity === 'null' || item.quanity === null) &&
          ((item.price !== 'null' && item.price !== null && item.price > 0) ||
            (item.fsmValue !== 'null' &&
              item.fsmValue !== null &&
              item.fsmValue > 0))
        ) {
          ToastError(
            `Chưa nhập số lượng ${item.productName} ngành hàng ${item.categoryName}`,
            'Số lượng',
            'top',
          );
          return;
        }

        if (
          (item.quanity === 'null' || item.quanity === null) &&
          ((item.quantityStock !== 'null' &&
            item.quantityStock !== null &&
            item.price >= 0) ||
            (item.quantitySuggest !== 'null' &&
              item.quantitySuggest !== null &&
              item.quantitySuggest >= 0))
        ) {
          ToastError(
            `Chưa nhập số lượng ${item.productName} ngành hàng ${item.categoryName}`,
            'Số lượng',
            'top',
          );
          return;
        }
      }
    }

    let itemsUpload = resDisplay.filter(
      it => it.quanity !== 'null' && it.quanity !== null,
    );
    if (itemsUpload.length === 0 && lstReport?.isDisplayBlank !== 1) {
      ToastError('Vui lòng làm báo cáo');
      return;
    }
    if (noteStr !== '') {
      ToastError(noteStr);
      return;
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => UploadData(itemsUpload),
    );
  };
  const UploadData = async resDisplay => {
    const work = { ...workinfo, reportId: kpiinfo.kpiId };
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    await UploadController.DataDisplay(
      resDisplay,
      work,
      async () => {
        await loadData();
      },
      async () => {},
    );
  };

  const reloadView = async () => {
    await setReload(e => !e);
  };
  // View Action Sheet
  const middleAction = async () => {
    // await setMode(actionMode.TOOLS)
    // SheetManager.show('actionDisplay')
  };

  const ViewItemInput = () => {
    return (
      <InputDisplayStock
        Status={settings.isUploaded ? 1 : 0}
        navigation={navigation}
        listInput={listInput}
        reloadView={reloadView}
      />
    );
  };
  const ViewItemPhoto = () => {
    return (
      <PhotoItems
        usedHeader={false}
        navigation={navigation}
        route={{
          params: {
            Photos: lstReport?.ImageByList || [],
            Status: settings.isUploaded ? 1 : 0,
          },
        }}
      />
    );
  };
  const renderScene = SceneMap({
    first: ViewItemInput,
    second: ViewItemPhoto,
  });
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN}
        // iconMiddle='poll-h'
        iconRight={
          !settings.isLockReport
            ? !settings.isUploaded
              ? 'cloud-upload-alt'
              : null
            : 'user-lock'
        }
        rightFunc={
          !settings.isLockReport
            ? !settings.isUploaded
              ? () => uploadAction()
              : null
            : () => {
                ToastSuccess(
                  'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
                );
              }
        }
        // middleFunc={middleAction}
        leftFunc={() => navigation.goBack()}
      />

      {routes.length > 0 && (
        <TabForm
          renderScene={renderScene}
          initialPage={0}
          routes={routes}
          positionTabBar={'bottom'}
          swipeEnabled={false}
        />
      )}
    </View>
  );
};

// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, Dimensions, DeviceEventEmitter } from "react-native"
// import { alertError, alertNotify, alertWarning, checkNetwork, alertConfirm } from '../../../Core/Utility';
// // import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
// import { DEFAULT_COLOR, _competitorName } from '../../../Core/URLs';
// import { Message, MessageInfo } from '../../../Core/Helper';
// import { getPhotosDisplayBeko } from '../../../Controller/MasterController';
// import { uploadDisplayData } from '../../../Controller/WorkController';
// import DisplayBK from './DisplayBK';
// import { PhotoCustom } from '../../../Content/PhotosCustom';
// import { dataDisplayResult, getPhotoUploadByType, getDisplayBKUpload, getDisplayProduct, displayTabData } from '../../../Controller/DisplayController';
// import { checkImageBeko } from '../../../Controller/CheckDataController';
// import { uploadAllDataPhoto } from '../../../Controller/PhotoController';
// import { HeaderCustom } from '../../../Content/HeaderCustom';
// import { useSelector } from 'react-redux';
// import { LoadingView } from '../../../Control/ItemLoading/index';
// import DisplayAndStock from '../../ReportDisplay/Beko/DisplayAndStock';
// import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
// import { TabForm } from '../../../Control/TabForm';
// import RNFS from 'react-native-fs'
// import UploadController from '../../../Controller/UploadController';

// export const DisplayCombineBeko = ({ navigation, route }) => {
//     const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState)
//     const [lstRequestPhotos, setLstRequestPhotos] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [upload, setUpload] = useState(0)
//     const [dataDisplay, setDataDisplay] = useState({ dataView: [], dataMain: [], tabData: [] })
//     const refDisplay = useRef();
//     const [routes, setRoutes] = useState([
//         { key: "first", title: 'Trưng bày' },
//         { key: "second", title: "Hình ảnh" },
//     ]);

//     useEffect(() => {
//         checkDataUpload()
//     }, [])

//     const checkDataUpload = async () => {
//         await setLoading(true)
//         await loadPhotoMaster();
//         let mDataResult = await dataDisplayResult(workinfo, _competitorName);
//         (mDataResult.length > 0 && mDataResult[0].upload === 1) && setUpload(upload + 1)
//         const lstTabData = await displayTabData(workinfo)
//         const lstDisplay = await getDisplayProduct(workinfo)
//         await setDataDisplay({ dataView: lstDisplay, dataMain: lstDisplay, tabData: lstTabData })
//         setTimeout(async () => { await setLoading(false) }, 100)

//     }
//     // Progess Waiting
//     const loadPhotoMaster = async () => {
//         let lstPhoto = await getPhotosDisplayBeko()
//         if (lstPhoto !== undefined) {
//             await setLstRequestPhotos(lstPhoto)
//             // lstPhoto.length > 0 && MapArr.push('PHOTOS')
//         }
//         // this.setState({lstGroup:MapArr})
//     }
//     // Upload Data
//     const handlerCheckTargetPhoto = async () => {
//         // lstRequestPhotos.map(async itemMast => {
//         //     const lstitemPhoto = await getPhotosReport(workinfo.reportId, 333 + '_' + itemMast.code, workinfo.shopId, workinfo.workDate);
//         // if (itemMast.numberValue > 0) {
//         //     if (lstitemPhoto.length < itemMast.numberValue && resPho === true) {
//         // MessageInfo('Vui lòng chụp đủ số lượng hình cho: ' + itemMast.name + ' (' + itemMast.numberValue + ' tấm )')
//         //     }
//         // }
//         // })
//         let checkImageResult = await checkImageBeko(workinfo.shopId, workinfo.workDate)
//         if (checkImageResult !== null && checkImageResult.length > 0) {
//             alertConfirm('Xác nhận', 'Bạn chưa chụp đủ hình trưng bày, Bạn có muốn tiếp tục không?', async () => {
//                 await actionUploadData();
//             })
//         } else {
//             await actionUploadData();
//         }
//     }
//     const actionUploadData = async () => {
//         let mDisplayUpload = await getDisplayBKUpload(workinfo.workId);
//         let mPhotoUpload = await getPhotoUploadByType(kpiinfo.id, workinfo.shopId, workinfo.workDate, '333_');
//         let mPhotoCompetitor = []
//         let mDisplayCompetitorUpload = []

//         if (Array.isArray(mDisplayUpload) && mDisplayUpload.length == 0) {
//             alertWarning('Vui lòng làm đẩy đủ báo cáo ' + _competitorName + ' trước khi gửi báo cáo');
//             return;
//         }
//         Message('Gửi báo cáo', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => uploadDisplay(mDisplayUpload, mDisplayCompetitorUpload, mPhotoUpload, mPhotoCompetitor));
//     }
//     const uploadDisplay = async (resDisplay, dataDisplayCompetitor, dataPhoto, dataPhotoCompetitor) => {
//         let isNetwork = await checkNetwork();
//         if (!isNetwork) {
//             alertError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
//             return;
//         }
//         const work = { ...workinfo, reportId: kpiinfo.kpiId };
//         await UploadController.DataDisplay(resDisplay, work, async () => {
//             await checkDataUpload();
//         }, async () => {
//         })
//     }
//     const uploadPhoto = async (dataPhoto) => {
//         await uploadAllDataPhoto(dataPhoto);
//     }
//     const renderScene = SceneMap({
//         first: () => <DisplayAndStock key={'formDisplay'} tabLabel='Trưng bày' loading={loading} dataDisplay={dataDisplay} />,
//         second: () => <PhotoCustom key={'formPhotos'} tabLabel="Hình ảnh" Photos={lstRequestPhotos} Workinfo={workinfo} DisplayId={333} route={route} ReportId={kpiinfo.id} Status={upload} NoChange={0} HeightHeader={150} combine={true} navigation={navigation}></PhotoCustom>

//     });
//     const onGoback = () => {
//         DeviceEventEmitter.removeAllListeners("JUMP_TOTAB");
//         navigation.goBack();
//     }
//     return (
//         <View style={{ flex: 1 }}>
//             <HeaderCustom
//                 title={route.params.titlePage}
//                 leftFunc={() => onGoback()}
//                 iconRight={upload == 1 ? 'check' : 'cloud-upload-alt'}
//                 rightFunc={() => upload === 1 ? MessageInfo('Dữ liệu đã được gửi.') : handlerCheckTargetPhoto()}
//             />
//             {
//                 routes.length > 0 && <TabForm initialPage={0} renderScene={renderScene} routes={routes} swipeEnabled={false} positionTabBar={'bottom'} />
//             }
//         </View>
//     )
// }
