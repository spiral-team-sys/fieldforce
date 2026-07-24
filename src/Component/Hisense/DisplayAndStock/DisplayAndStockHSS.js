import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { checkNetwork } from '../../../Core/Utility';
import {
  getDataHistoryDisplayByShop,
  getDisplayProduct,
  getlistTabCompetitor,
} from '../../../Controller/DisplayController';
import {
  getAllPhotosUpload,
  getDisplayResult,
  getPhotosReport,
  getPhotosReportByCate,
} from '../../../Controller/WorkController';
import { Message, ToastError } from '../../../Core/Helper';
import UploadController from '../../../Controller/UploadController';
import { InputDisplayStockHSS } from './InputDisplayStockHSS';
import { SceneMap } from 'react-native-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { TabForm } from '../../../Control/TabForm';
import { checkLockReport } from '../../../Controller/ShopController';
import moment from 'moment';
import _ from 'lodash';
import RNFS from 'react-native-fs';
import filter from 'lodash';

/** 
 * Config
 * "image": Số lượng hình ảnh cần chụp
    "isConstraint" : bật kiểm tra hình ảnh
    "isTakeByCate" , Có chụp hình theo cate không
    "isTakeTemplate" : có chụp theo template không
    "imageByCate" : có kiểm tra hình ảnh theo cate không
        isCheckByProduct : kiểm tra hình ảnh theo sản phẩm (imageByCate phải bằng 1)
        numCheckProduct : số lượng cần kiểm tra (ví dụ : quantity > 3 -> bắt buộc chụp hình theo cate, thông báo hỏi chắc chắn muốn gửi)
        numPhotoByProduct : số lượng hình ảnh cần chụp tối đa theo sản phảm 
    "isDisplayBlank" : không điền số lượng trưng bày vẫn gửi được
    "isNeedShelve": có nhập quầy kệ không
    listInput : danh sách những dữ liệu cần nhập
    isCheckPOP : kiểm tra bắt buộc nhập POSM 
    ImageByList : template hình ảnh theo cate
    minPrice : giá trị giá nhập vào nhỏ nhất
    isNoteBySKU : nhập ghi chú theo sản phẩm
    listNote : danh sách note cần nhập
        typeValue : loại note nhập. (selectText/text)
        listCode : danh sách note nếu typeValue = 'selectText'
    checkNoteByDisplay : kiểm tra ràng note display (quanity == 0)
    checkNoteByPOP : kiểm tra ràng note POP (tagPOPId == 0)
    isCheckNote : kiểm tra ràng ghi chú
*/

export const DisplayAndStockHSS = ({ navigation, route }) => {
  const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [reload, setReload] = useState(false);
  const lstReport = JSON.parse(kpiinfo?.reportItem);
  const [routes, setRoutes] = useState([
    { key: 'first', title: 'Nhập Liệu' },
    { key: 'second', title: 'Hình Ảnh' },
  ]);
  const [settings, setSettings] = useState({
    isLockReport: false,
    isUploaded: false,
    isLoading: true,
  });
  const listInput = lstReport?.listInput?.length
    ? lstReport?.listInput
    : [
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
        isLoading: false,
      });
    } else {
      await setSettings({
        isLockReport: lockReport,
        isUploaded: true,
        isLoading: false,
      });
    }

    // let lstRes = await getDisplayResult(workinfo);
    // let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
    // await setStatus(isUpload)
  };

  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);

  const contains = (item, query) => {
    for (let indexL = 0; indexL < lstReport?.listInput?.length || 0; indexL++) {
      const itemL = lstReport?.listInput[indexL];
      if (
        item[itemL.displayType] !== null &&
        item[itemL.displayType] !== undefined &&
        (item[itemL.displayType] > 0 ||
          (item[itemL.displayType] == 0 && itemL.isZero == 1))
      )
        return true;
    }
    for (let indexN = 0; indexN < lstReport?.listNote?.length || 0; indexN++) {
      const itemN = lstReport?.listNote[indexN];
      if (
        item[itemN.noteType] !== null &&
        item[itemN.noteType] !== undefined &&
        item[itemN.displayType] !== ''
      )
        return true;
    }
    return false;
  };
  const containsEmpty = (item, query) => {
    if ((lstReport?.listInput?.length || 0) == 0) return false;
    for (let indexL = 0; indexL < lstReport?.listInput?.length || 0; indexL++) {
      const itemL = lstReport?.listInput[indexL];
      if (
        item[itemL.displayType] == null ||
        item[itemL.displayType] == undefined ||
        item[itemL.displayType] == 0
      )
        return true;
    }
    return false;
  };

  const onValidatedPhoto = async (listTab, resDisplay, displayByQuantity) => {
    let resPhotos = await getAllPhotosUpload(
      kpiinfo.kpiId,
      workinfo.shopId,
      workinfo.workDate,
    );
    let noteStr = '';
    //check limit photo
    let isConstraint;
    let numLimitPhoto;
    let numCheckProduct;

    if (lstReport) {
      try {
        if (lstReport?.isConstraint !== undefined) {
          isConstraint = lstReport?.isConstraint;
        }
        if (lstReport?.image !== undefined) {
          numLimitPhoto = lstReport?.image;
        }
        if (
          lstReport?.numCheckProduct !== undefined ||
          lstReport?.isCheckByProduct == 1
        ) {
          numCheckProduct = lstReport?.numCheckProduct || 3;
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (lstReport.isNeedShelve == 1) {
      const dataByCate = _.uniqBy(resDisplay, 'categoryId');
      const tempReport = lstReport.ImageByList || [];
      for (let index = 0; index < listTab.length; index++) {
        const itT = listTab[index];
        const listByTab = dataByCate.filter(
          it =>
            it.categoryId == itT.categoryId &&
            it.quantityShelves !== null &&
            it.quantityShelves !== 'null' &&
            it.quantityShelves !== '',
        );
        if (listByTab.length == 0) {
          noteStr += `Bạn chưa nhập quầy kệ ngành hàng : ${itT.categoryName} !!`;
          ToastError(noteStr);
          return false;
        }
        const listCheckPhoto = dataByCate.filter(
          it =>
            it.categoryId == itT.categoryId &&
            it.quantityShelves !== null &&
            it.quantityShelves !== 'null' &&
            it.quantityShelves !== '' &&
            it.quantityShelves !== 0,
        );
        if (listCheckPhoto.length > 0) {
          if (tempReport[itT.displayRef]?.length > 0) {
            let itemTemp = tempReport[itT.displayRef];
            for (let indexT = 0; indexT < itemTemp.length; indexT++) {
              const itLT = itemTemp[indexT];
              let photoType = itLT.code + '_' + itT.displayRef;
              let lstPhoto = await getPhotosReport(
                kpiinfo.kpiId,
                photoType,
                workinfo.shopId,
                workinfo.workDate,
              );
              if (
                lstPhoto.length < itLT.numberIMG &&
                itLT.nameVN.includes('Quầy kệ')
              ) {
                noteStr +=
                  itT.categoryName +
                  ': Vui lòng chụp tối thiểu ' +
                  itLT.numberIMG +
                  ' tấm hình cho ' +
                  itLT.nameVN +
                  '!!';
                ToastError(noteStr);
                return false;
              }
            }
          }
        }
      }
    }

    //
    if (lstReport?.imageByCate == 1 && lstReport?.isCheckByProduct == 1) {
      const dataHistory = await getDataHistoryDisplayByShop(workinfo.shopId);
      let satisfyConditions = filter(displayByQuantity, item => {
        const checkHistory = dataHistory.filter(
          it =>
            it.productId == item.productId && it.hDisplay >= numCheckProduct,
        );
        if (
          item.quanity >= (numCheckProduct || 3) &&
          (checkHistory || [])?.length == 0
        )
          return true;
        else return false;
      });

      if (
        lstReport?.isTakeTemplate == 1 &&
        lstReport?.imageByCate == 1 &&
        satisfyConditions?.length > 0
      ) {
        for (let index = 0; index < listTab.length; index++) {
          const itT = listTab[index];
          const listByCateT = filter(satisfyConditions, item => {
            if (item.categoryId == itT.categoryId) return true;
            else return false;
          });
          if (listByCateT?.length > 0) {
            let lstPhoto = await getPhotosReportByCate(
              kpiinfo.kpiId,
              '_' + itT.displayRef,
              workinfo.shopId,
              workinfo.workDate,
            );
            if (lstPhoto.length < (lstReport.numPhotoByProduct || 1)) {
              noteStr += `Vui lòng chụp tối đa ${
                lstReport.numPhotoByProduct || 1
              } tấm hình cho ${itT.categoryName}. (${lstPhoto.length}/${
                lstReport.numPhotoByProduct || 1
              })`;
              ToastError(noteStr);
              return false;
            }
          }
        }
      } else if (lstReport?.imageByCate == 1) {
        for (let index = 0; index < listTab.length; index++) {
          const itT = listTab[index];
          const listByCate = filter(satisfyConditions, item => {
            if (item.categoryId == itT.categoryId) return true;
            else return false;
          });
          if (listByCate?.length > 0) {
            let lstPhoto = await getPhotosReport(
              kpiinfo.kpiId,
              itT.displayRef,
              workinfo.shopId,
              workinfo.workDate,
            );
            if (lstPhoto.length < (lstReport.numPhotoByProduct || 1)) {
              noteStr += `Vui lòng chụp tối đa ${
                lstReport.numPhotoByProduct || 1
              } tấm hình cho ${itT.categoryName}. (${lstPhoto.length}/${
                lstReport.numPhotoByProduct || 1
              })`;
              ToastError(noteStr);
              return false;
            }
          }
        }
      }
    }

    if (isConstraint !== undefined && isConstraint === 1) {
      if (lstReport?.isTakeByCate == 1) {
        if (lstReport?.isTakeTemplate == 1) {
          if (numLimitPhoto !== undefined && numLimitPhoto > 0) {
            if (lstReport?.imageByCate == 1) {
              for (
                let index = 0;
                index <
                (lstReport?.isCheckByDisplay == 1
                  ? displayByQuantity.length
                  : listTab.length);
                index++
              ) {
                const itT =
                  lstReport?.isCheckByDisplay == 1
                    ? displayByQuantity[index]
                    : listTab[index];
                let lstPhoto = await getPhotosReportByCate(
                  kpiinfo.kpiId,
                  '_' + itT.displayRef,
                  workinfo.shopId,
                  workinfo.workDate,
                );
                if (lstPhoto.length < numLimitPhoto) {
                  noteStr += `Vui lòng chụp ${numLimitPhoto} tấm hình cho ${itT.categoryName}. (${lstPhoto.length}/${numLimitPhoto})`;
                  ToastError(noteStr);
                  return false;
                }
              }
            } else if (resPhotos.length < numLimitPhoto) {
              noteStr += `Vui lòng chụp ${numLimitPhoto} tấm hình cho báo cáo.(${resPhotos.length}/${numLimitPhoto})`;
              ToastError(noteStr);
              return false;
            }
          } else {
            const LstMenuPhotos = lstReport.ImageByList || [];
            for (
              let index = 0;
              index <
              (lstReport?.isCheckByDisplay == 1
                ? displayByQuantity.length
                : listTab.length);
              index++
            ) {
              const itT =
                lstReport?.isCheckByDisplay == 1
                  ? displayByQuantity[index]
                  : listTab[index];
              if (LstMenuPhotos[itT.displayRef]?.length > 0) {
                let lstTem = LstMenuPhotos[itT.displayRef];
                for (let index = 0; index < lstTem.length; index++) {
                  const itL = lstTem[index];
                  let photoType = itL.code + '_' + itT.displayRef;
                  let lstPhoto = await getPhotosReport(
                    kpiinfo.kpiId,
                    photoType,
                    workinfo.shopId,
                    workinfo.workDate,
                  );
                  if (lstPhoto.length < itL.numberIMG) {
                    noteStr +=
                      itT.categoryName +
                      ': Vui lòng chụp ' +
                      itL.numberIMG +
                      ' tấm hình cho ' +
                      itL.nameVN +
                      ', ';
                    ToastError(noteStr);
                    return false;
                  }
                }
              }
            }
          }
        } else if (numLimitPhoto !== undefined && numLimitPhoto > 0) {
          if (lstReport?.imageByCate == 1) {
            for (
              let index = 0;
              index <
              (lstReport?.isCheckByDisplay == 1
                ? displayByQuantity.length
                : listTab.length);
              index++
            ) {
              const itT =
                lstReport?.isCheckByDisplay == 1
                  ? displayByQuantity[index]
                  : listTab[index];
              let lstPhoto = await getPhotosReport(
                kpiinfo.kpiId,
                itT.displayRef,
                workinfo.shopId,
                workinfo.workDate,
              );
              if (lstPhoto.length < numLimitPhoto) {
                noteStr += `Vui lòng chụp ${numLimitPhoto} tấm hình cho ${itT.categoryName}. (${lstPhoto.length}/${numLimitPhoto})`;
                ToastError(noteStr);
                return false;
              }
            }
          } else if (resPhotos.length < numLimitPhoto) {
            noteStr += `Vui lòng chụp ${numLimitPhoto} tấm hình cho báo cáo.(${resPhotos.length}/${numLimitPhoto})`;
            ToastError(noteStr);
            return false;
          }
        }
      } else {
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
              noteStr += `Vui lòng chụp ${it.numberIMG} tấm hình cho ${it.nameVN}.(${lstPhoto.length}/${it.numberIMG})`;
              ToastError(noteStr);
              return false;
            }
          }
        }
        if (
          numLimitPhoto !== undefined &&
          numLimitPhoto > 0 &&
          resPhotos.length < numLimitPhoto
        ) {
          noteStr += `Vui lòng chụp ${numLimitPhoto} tấm hình cho báo cáo.(${resPhotos.length}/${numLimitPhoto})`;
          ToastError(noteStr);
          return false;
        }
      }
    }
    return true;
  };

  const onValidatedData = (
    listTab,
    listProduct,
    resDisplay,
    displayByQuantity,
  ) => {
    // let noteStr = '';
    if (displayByQuantity.length == 0 && lstReport?.isDisplayBlank !== 1) {
      ToastError(
        `Hoàn thành báo cáo trước khi gửi dữ liệu lên hệ thống`,
        'Dữ liệu báo cáo',
        'top',
      );
      return false;
    } else {
      for (let index = 0; index < resDisplay.length; index++) {
        const item = resDisplay[index];
        for (
          let indexL = 0;
          indexL < lstReport?.listInput?.length || 0;
          indexL++
        ) {
          const itemL = lstReport?.listInput[indexL];
          if (
            (item[itemL.displayType] == null ||
              item[itemL.displayType] == undefined ||
              (item[itemL.displayType] == 0 && itemL.isZero !== 1)) &&
            itemL.isRequired == 1
          ) {
            ToastError(
              `Chưa nhập ${itemL.name} sản phẩm ${item.productName} - ${item.categoryName}`,
              'Thông báo',
              'top',
            );
            return false;
          }
          if (
            item[itemL.displayType] !== null &&
            item[itemL.displayType] !== undefined &&
            (item[itemL.displayType] !== 0 ||
              (item[itemL.displayType] == 0 && itemL.isZero !== 1)) &&
            (item[itemL.displayType] <
              ((itemL.min || itemL.min == 0) && itemL.min !== ''
                ? itemL.min
                : 1000) ||
              item[itemL.displayType] >
                (itemL.max && itemL.max !== '' ? itemL.max : 1000000000) ||
              item[itemL.displayType] %
                (itemL.min && itemL.min !== '' ? itemL.min || 1 : 1000 > 0))
          ) {
            ToastError(
              `Sai định dạng ${itemL.name} sản phẩm ${item.productName} - ${item.categoryName}`,
              'sản phẩm',
              'top',
            );
            return false;
          }
        }
        if (lstReport.isCheckNote == 1 && lstReport.isNoteBySKU == 1) {
          for (let iNote = 0; iNote < lstReport?.listNote || 0; iNote++) {
            const itemNote = lstReport?.listNote[iNote];
            if (
              (item[itemNote.noteType] == null ||
                item[itemNote.noteType] == '') &&
              item.quanity !== null &&
              item.quanity >= 0 &&
              itemNote.isRequired == 1
            ) {
              ToastError(
                `Chưa nhập ${itemNote.name} ${item.productName} ngành hàng ${item.categoryName}`,
                'Ghi chú',
                'top',
              );
              return false;
            }
          }
        }
      }
    }

    if (lstReport?.isConstraintEmpty == 1) {
      const resDisplayEmpty = filter(listProduct, item => {
        return containsEmpty(item);
      });
      if (lstReport.isNoteBySKU == 1) {
        const listNote = lstReport.listNote || [];
        for (let indexP = 0; indexP < resDisplayEmpty.length; indexP++) {
          const itemP = resDisplayEmpty[indexP];
          for (let iNote = 0; iNote < listNote.length || 0; iNote++) {
            const itemNote = listNote[iNote];
            for (
              let indexL = 0;
              indexL < lstReport?.listInput?.length || 0;
              indexL++
            ) {
              const itemL = lstReport?.listInput[indexL];
              if (
                itemNote.subCode == itemL.id &&
                (itemP[itemNote.noteType] == null ||
                  itemP[itemNote.noteType] == '') &&
                (itemP[itemL.displayType] == null ||
                  itemP[itemL.displayType] == undefined ||
                  itemP[itemL.displayType] == 0)
              ) {
                ToastError(
                  `Chưa nhập ${itemNote.name} ${itemP.productName} ngành hàng ${itemP.categoryName}`,
                  'Ghi chú',
                  'top',
                );
                return false;
              }
            }
          }
        }
      }
    }

    if (resDisplay.length === 0 && lstReport?.isDisplayBlank !== 1) {
      ToastError('Vui lòng làm báo cáo');
      return false;
    }
    return true;
  };
  const uploadAction = async () => {
    // await Keyboard.dismiss()
    if (settings.isUploaded) {
      ToastError('Báo cáo đã khóa');
      return;
    }

    const listProduct = await getDisplayProduct(
      workinfo,
      _competitorId,
      lstReport,
      shopinfo?.dealerId || 0,
    );
    const resDisplay = filter(listProduct, item => {
      return contains(item);
    });

    const listTab = await getlistTabCompetitor(_competitorId);
    // let resDisplay = await getDisplayResult(workinfo, kpiinfo.kpiId, lstReport.isNeedShelve, lstReport.isByDealer);
    let displayByQuantity = resDisplay.filter(
      it => it.quanity !== null && it.quanity !== 'null',
    );
    let resPhotos = await getAllPhotosUpload(
      kpiinfo.kpiId,
      workinfo.shopId,
      workinfo.workDate,
    );
    let noteStr = '';
    const checkValidatedPhoto = await onValidatedPhoto(
      listTab,
      resDisplay,
      displayByQuantity,
    );
    if (checkValidatedPhoto) {
      const checkValidatedData = await onValidatedData(
        listTab,
        listProduct,
        resDisplay,
        displayByQuantity,
      );
      if (checkValidatedData) {
        if (lstReport) {
          try {
            let numCheckProduct = null;
            if (
              lstReport?.numCheckProduct !== undefined ||
              lstReport?.isCheckByProduct == 1
            ) {
              numCheckProduct = lstReport?.numCheckProduct || 3;
            }
            if (numCheckProduct) {
              const dataHistory = await getDataHistoryDisplayByShop(
                workinfo.shopId,
              );

              let satisfyConditions = _.filter(displayByQuantity, item => {
                const checkHistory = dataHistory.filter(
                  it =>
                    it.productId == item.productId &&
                    it.hDisplay >= numCheckProduct,
                );
                if (
                  item.quanity >= (numCheckProduct || 3) &&
                  (checkHistory || [])?.length == 0
                )
                  return true;
                else return false;
              });
              if (satisfyConditions.length > 0) {
                Message(
                  'Chú ý',
                  `Sản phẩm trưng bày mới nhập có số lượng >= ${numCheckProduct}, bạn có chắc chắn muốn gửi không?`,
                  () => UploadData(listProduct),
                );
              } else {
                Message(
                  'Chú ý',
                  'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
                  () => UploadData(listProduct),
                );
              }
            } else {
              Message(
                'Chú ý',
                'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
                () => UploadData(listProduct),
              );
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          Message(
            'Chú ý',
            'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
            () => UploadData(listProduct),
          );
        }
      }
    }
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
  const ViewItemInput = () => {
    return (
      <InputDisplayStockHSS
        Status={settings.isUploaded ? 1 : 0}
        navigation={navigation}
        listInput={listInput}
        reloadView={reloadView}
        lstReport={lstReport}
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
            dataImageList: lstReport?.ImageByList || [],
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
      {lstReport?.isTakeByCate == 1
        ? settings.isLoading == false && (
            <InputDisplayStockHSS
              Status={settings.isUploaded ? 1 : 0}
              navigation={navigation}
              listInput={listInput}
              reloadView={reloadView}
              lstReport={lstReport}
            />
          )
        : routes.length > 0 &&
          settings.isLoading == false && (
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
