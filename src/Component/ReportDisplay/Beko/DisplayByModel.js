import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { _competitorId, _competitorName } from '../../../Core/URLs';
import { checkNetwork, deviceHeight } from '../../../Core/Utility';
import {
  getDisplayProduct,
  getListDisplayByModel,
  uploadDataDisplayByModel,
} from '../../../Controller/DisplayController';
import {
  getAllPhotosUpload,
  getDisplayResult,
  getPhotosReport,
} from '../../../Controller/WorkController';
import { Message, ToastError } from '../../../Core/Helper';
import { SceneMap } from 'react-native-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { TabForm } from '../../../Control/TabForm';
import { InputDisplayByModel } from './InputDisplayByModel';
import { POSMContext } from '../../../Controller/POSMController';

export const DisplayByModel = ({ navigation, route }) => {
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
    { id: 3, name: 'Thực bán', displayType: 'priceValue' },
  ];

  const loadData = async () => {
    let lstRes = await getDisplayResult(workinfo);
    let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0;
    await setStatus(isUpload);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const uploadAction = async () => {
    await Keyboard.dismiss();
    const listProduct = await getDisplayProduct(workinfo);
    let resDisplay = await getListDisplayByModel(workinfo);
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

    let checkPrice = resDisplay.filter(
      it =>
        it.quanity !== 'null' &&
        it.quanity !== null &&
        it.price !== null &&
        it.price !== 'null' &&
        (it.price < 10000 || it.price % 1000 > 0),
    );
    // console.log(checkPrice, 'check price');
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

    let items = resDisplay.filter(
      it =>
        (it.quanity === 'null' || it.quanity === null) &&
        it.price !== 'null' &&
        it.price !== null &&
        it.price > 0,
    );
    // console.log(items, 'check item');
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

    let checkPOSM1 = resDisplay.filter(
      it =>
        (it.quanity === 'null' || it.quanity === null) &&
        it.displayValue !== 'null' &&
        it.displayValue !== null &&
        it.displayValue > 0,
    );
    // console.log(items, 'check item');
    if (checkPOSM1.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkPOSM1[0].productId,
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

    let checkPOSM2 = resDisplay.filter(
      it =>
        (it.displayValue === 'null' ||
          it.displayValue === null ||
          it.displayValue === 0) &&
        it.posmList !== 'null' &&
        it.posmList !== null &&
        it.posmList.length > 0,
    );
    // console.log(items, 'check item');
    if (checkPOSM2.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkPOSM2[0].productId,
      );
      ToastError(
        'Bạn chưa nhập số lượng POSM. Hãng: ' +
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

    let checkPOSMList = resDisplay.filter(
      it =>
        (it.posmList === 'null' ||
          it.posmList === null ||
          it.posmList.length === 0) &&
        it.displayValue !== 'null' &&
        it.displayValue !== null &&
        it.displayValue > 0,
    );
    const outGuid = await POSMContext.PosmInGuid(checkPOSMList[0].productId);
    // console.log(items, 'check item');
    if (checkPOSMList.length > 0 && outGuid.length > 0) {
      let product = listProduct.filter(
        it => it.productId === checkPOSMList[0].productId,
      );
      ToastError(
        'Bạn chưa chọn loại nhãn POSM. Hãng: ' +
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
        it.quantityStock !== 'null' &&
        it.quantityStock !== null &&
        it.price >= 0,
    );
    // console.log(items, 'check item');
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
    // console.log('up: ', itemsUpload)
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
    // console.log(work, resDisplay);
    await uploadDataDisplayByModel(
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
      <InputDisplayByModel
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
