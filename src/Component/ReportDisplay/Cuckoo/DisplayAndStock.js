import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { checkNetwork, deviceHeight } from '../../../Core/Utility';
import {
  getDisplayProduct,
  getlistTabCompetitor,
} from '../../../Controller/DisplayController';
import {
  getAllPhotos,
  getAllPhotosUpload,
  getDisplayResult,
  getPhotosReport,
} from '../../../Controller/WorkController';
import { Message, ToastError } from '../../../Core/Helper';
import UploadController from '../../../Controller/UploadController';
import { InputDisplayStock } from './InputDisplayStock';
import { SceneMap } from 'react-native-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { TabForm } from '../../../Control/TabForm';
import moment from 'moment';

/***
 *  "checkAllProduct" : ràng bắt buộc nhập tất cả sản phẩm quanity trước khi gửi
        "checkStock" : ràng bắt buộc nhập tất cả sản phẩm bao gồm cả quanity và stock trước khi gửi
 *  "image": Số lượng hình ảnh cần chụp
    "isConstraint" : bật kiểm tra hình ảnh
    "ImageByList" : template hình ảnh theo cate
 * 
 */

export const DisplayAndStock = ({ navigation, route }) => {
  const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
  const [reload, setReload] = useState(false);
  const lstReport = JSON.parse(kpiinfo?.reportItem);
  const [Status, setStatus] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'first', title: 'Nhập Liệu' },
    { key: 'second', title: 'Hình Ảnh' },
  ]);
  // console.log(kpiinfo);
  const listInput = [
    { id: 1, name: 'Trưng bày', displayType: 'quanity' },
    { id: 2, name: 'Tồn kho', displayType: 'quantityStock' },
    { id: 3, name: 'Đề xuất', displayType: 'quantitySuggest' },
    { id: 4, name: 'Thực bán', displayType: 'price' },
    { id: 5, name: 'FSM Incentive', displayType: 'fsmValue' },
  ];
  const loadData = async () => {
    let lstRes = await getDisplayResult(workinfo);
    let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0;
    let day = parseInt(moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setStatus(isUpload);
    } else {
      await setStatus(1);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadAction = async () => {
    await Keyboard.dismiss();
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

    if (Status === 1) {
      ToastError('Báo cáo đã khóa');
      return;
    }

    if (resDisplay.length === 0) {
      ToastError('Vui lòng làm báo cáo');
      return;
    }

    if (lstReport.checkAllProduct == 1) {
      if (lstReport.checkStock == 1) {
        const dataByStock = resDisplay.filter(
          it =>
            it.quanity !== 'null' &&
            it.quanity !== null &&
            it.quantityStock !== 'null' &&
            it.quantityStock !== null,
        );
        if (dataByStock.length !== listProduct.length) {
          ToastError(
            'Vui lòng nhập số lượng trưng bày, tồn kho tất cả sản phẩm trước khi gửi!',
          );
          return;
        }
      } else {
        if (resDisplay.length !== listProduct.length) {
          ToastError(
            'Vui lòng nhập số lượng trưng bày tất cả sản phẩm trước khi gửi!',
          );
          return;
        }
      }
    }

    let checkPrice = resDisplay.filter(
      it =>
        it.quanity !== 'null' &&
        it.quanity !== null &&
        ((it.price !== null &&
          it.price !== 'null' &&
          (it.price < 10000 || it.price % 1000 > 0)) ||
          (it.fsmValue !== null &&
            it.fsmValue !== 'null' &&
            (it.fsmValue < 1000 || it.fsmValue % 1000 > 0))),
    );
    if (checkPrice.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkPrice[0].productId,
      );
      ToastError(
        'Vui lòng nhập giá đúng định dạng. Hãng: ' +
          product[0].division +
          '  - Loại : ' +
          product[0].categoryName +
          '  - sản phẩm: ' +
          product[0].productName,
        'Thông báo',
        'top',
      );
      return;
    }

    let checkFsmValue = resDisplay.filter(
      it =>
        (it.price === 'null' || it.price === null) &&
        it.fsmValue !== 'null' &&
        it.fsmValue !== null &&
        it.fsmValue > 0,
    );
    if (checkFsmValue.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkFsmValue[0].productId,
      );
      ToastError(
        'Bạn đã nhập Tiền thưởng nhưng chưa nhập Giá . Hãng: ' +
          product[0].division +
          '  - Loại : ' +
          product[0].categoryName +
          '  - sản phẩm: ' +
          product[0].productName,
        'Thông báo',
        'top',
      );
      return;
    }

    let items = resDisplay.filter(
      it =>
        (it.quanity === 'null' || it.quanity === null) &&
        ((it.price !== 'null' && it.price !== null && it.price > 0) ||
          (it.fsmValue !== 'null' && it.fsmValue !== null && it.fsmValue > 0)),
    );
    if (items.length > 0) {
      let product = listProduct.filter(
        it => it.productId === items[0].productId,
      );
      ToastError(
        'Bạn đã nhập Giá nhưng chưa nhập số lượng. Hãng: ' +
          product[0].division +
          '  - Loại : ' +
          product[0].categoryName +
          '  - sản phẩm: ' +
          product[0].productName,
        'Thông báo',
        'top',
      );
      return;
    }

    let checkQuantity = resDisplay.filter(
      it =>
        (it.quanity === 'null' || it.quanity === null) &&
        ((it.quantityStock !== 'null' &&
          it.quantityStock !== null &&
          it.price >= 0) ||
          (it.quantitySuggest !== 'null' &&
            it.quantitySuggest !== null &&
            it.quantitySuggest >= 0)),
    );
    if (checkQuantity.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkQuantity[0].productId,
      );
      ToastError(
        'Bạn chưa nhập số lượng trưng bày. Hãng: ' +
          product[0].division +
          '  - Loại : ' +
          product[0].categoryName +
          '  - sản phẩm: ' +
          product[0].productName,
        'Thông báo',
        'top',
      );
      return;
    }

    let itemsUpload = resDisplay.filter(
      it => it.quanity !== 'null' && it.quanity !== null,
    );
    if (itemsUpload.length === 0) {
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

  const ViewItemInput = () => {
    return (
      <InputDisplayStock
        Status={Status}
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
            Status: Status,
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
        iconRight="cloud-upload-alt"
        rightFunc={Status !== 1 ? () => uploadAction() : null}
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
