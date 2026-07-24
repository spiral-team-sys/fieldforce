import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { ScreenProductDisplay } from './Page/ScreenProductDisplay';
import { alertConfirm, alertNotify } from '../../../Core/Utility';
import { REPORT } from '../../../API/ReportAPI';
import { ToastError, ToastSuccess } from '../../../Core/Helper';
import {
  checkRawReport,
  removeRawReport,
} from '../../../Controller/ReportController';
import { LoadingView } from '../../../Control/ItemLoading';
import { ScreenChecking } from './Page/ScreenChecking';
import { SheetManager } from 'react-native-actions-sheet';
import { DisplayEdit } from './Control/DisplayEdit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DISPLAY } from '../../../API/DisplayAPI';
import { SET_IsEdit } from '../../../Redux/action';
import { toastError } from '../../../Utils/configToast';
import _ from 'lodash';

const DisplayScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo, isEdit } = useSelector(
    state => state.GAppState,
  );
  const dispatch = useDispatch();
  const [isUploading, setUploading] = useState(false);
  const [isLockField, setLockField] = useState(true);
  const [isToggleEdit, setIsToggleEdit] = useState(false);
  const [jsonPhoto, setJsonPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //
  const LoadDataDisplay = async type => {
    try {
      await setIsLoading(true);
      const storedData = await AsyncStorage.getItem(`${shopinfo.shopId}_EDIT`);
      const parseStored = storedData ? JSON.parse(storedData) : null;

      if (parseStored?.isEdit) {
        dispatch(SET_IsEdit(true));
      } else {
        const formMode = !isEdit || type === 'UPLOAD' ? 0 : 1;
        const itemFilter = {
          shopId: shopinfo.shopId,
          reportId: kpiinfo.id,
          formMode,
          typeReport: 'PRODUCT',
        };
        await DISPLAY.GetDataDisplayByShop(
          itemFilter,
          async (mData, message) => {
            message && ToastError(message, 'Thông báo', 'top');
            if (mData && mData.length > 0) {
              setJsonPhoto(mData[0].jsonPhoto);
            } else {
              console.error('error');
            }
          },
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const UploadData = async () => {
    const { isValid, message } = await onValidData();
    if (!isValid) return;
    //
    alertConfirm(
      'Gửi dữ liệu',
      message ||
        'Sau khi gửi dữ liệu bạn sẽ thoát chế độ "Chỉnh sửa", Bạn có chắc chắn không ?',
      async () => {
        await setUploading(true);
        const result = await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
        if (result.statusId == 200) {
          await removeRawReport(shopinfo.shopId, kpiinfo.id);
          ToastSuccess(result.messager, 'Thông báo', 'top');
          dispatch(SET_IsEdit(false));
          await AsyncStorage.removeItem(`${shopinfo.shopId}_EDIT`);
          LoadDataDisplay('UPLOAD');
        } else {
          ToastError(result.messager, 'Lỗi dữ liệu', 'top');
        }
        await setUploading(false);
        await setIsToggleEdit(false);
      },
    );
  };
  const EditData = async () => {
    setIsToggleEdit(true);
    SheetManager.show('sheet_editdisplay');
  };
  const handlerToogle = () => {
    setIsToggleEdit(false);
  };
  // Action
  const onValidData = async () => {
    const configPage = JSON.parse(kpiinfo.reportItem || '{}');
    const itemData = await checkRawReport(shopinfo.shopId, kpiinfo.id);
    const dataUpload = JSON.parse(itemData.data[0]?.jsonData || '[]');
    const _isData = _.filter(
      dataUpload,
      e => (e.Display || e.Price) !== null || e.DisplayArea !== null,
    );
    if (_isData.length === 0) {
      ToastError(
        'Vui lòng nhập dữ liệu đầy đủ trước khi gửi dữ liệu lên hệ thống',
        'Dữ liệu trống',
        'top',
      );
      return false;
    }
    // Check Full Data
    let checkData = {
      displayAreaEmpty: [],
      displayAreaListEmpty: [],
      displayEmpty: [],
      displayNoteEmpty: [],
      displayValues: [],
      displayAreaValues: [],
    };
    if (dataUpload !== null && dataUpload.length > 0) {
      for (let index = 0; index < dataUpload.length; index++) {
        const item = dataUpload[index];
        if (configPage.isInputArea) {
          const dataAreaList = item.DisplayAreaList || [];
          const checkListArea = _.filter(
            dataAreaList,
            e => e.ItemQuantity !== null && e.ItemQuantity !== undefined,
          );
          if (item.Display > 0 && checkListArea.length == 0) {
            if (configPage?.checkByCompetitor) {
              const isIncluded = configPage?.checkByCompetitor
                .split(',')
                .includes(item.CompetitorName);
              if (isIncluded) checkData.displayAreaListEmpty.push(item);
            } else {
              checkData.displayAreaListEmpty.push(item);
            }
          }
          if (item.Display == 0) {
            if (
              item.CompetitorName == 'LG' &&
              (item.NoteProduct || null) == null
            ) {
              checkData.displayNoteEmpty.push(item);
            }
          } else {
            const checkAreaValues = _.filter(
              dataAreaList,
              e => e.ItemQuantity >= 2,
            );
            if (checkAreaValues.length > 0) {
              checkData.displayAreaValues.push(item);
            }
          }
        } else {
          if ((item.Display || null) !== null) {
            if (item.Display > 0) {
              if (item.CompetitorName == 'LG' && item.DisplayArea == null) {
                checkData.displayAreaEmpty.push(item);
              }
              if (item.Display >= 2) {
                checkData.displayValues.push(item);
              }
            } else {
              if (
                item.CompetitorName == 'LG' &&
                (item.NoteProduct || null) == null
              ) {
                checkData.displayNoteEmpty.push(item);
              }
            }
          } else {
            if (item.isCheckFullDisplay) {
              checkData.displayEmpty.push(item);
            }
          }
        }
        //
      }
    }
    // Alert Message Error
    if (configPage.isInputArea) {
      if (checkData.displayAreaListEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayAreaListEmpty);
        alertNotify(`Chưa nhập số lượng theo vị trí :\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayNoteEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayNoteEmpty);
        alertNotify(`Ghi chú sản phẩm không có trưng bày:\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayAreaValues.length > 0) {
        return {
          isValid: true,
          message: `Chú ý: Dữ liệu trưng bày có sản phẩm nhập vị trí lớn hơn 2 sản phẩm.\n\nSau khi gửi dữ liệu bạn sẽ thoát chế độ "Chỉnh sửa", Bạn có muốn gửi dữ liệu không?`,
        };
      }
    } else {
      if (checkData.displayAreaEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayAreaEmpty);
        alertNotify(`Chưa nhập dữ liệu "Vị trí":\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayEmpty);
        alertNotify(`Chưa nhập "Số lượng trưng bày":\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayNoteEmpty.length > 0) {
        const message = generateGroupedMessage(checkData.displayNoteEmpty);
        alertNotify(`Ghi chú sản phẩm không có trưng bày:\n${message}`);
        return { isValid: false, message: null };
      }
      if (checkData.displayValues.length > 0) {
        return {
          isValid: true,
          message: `Dữ liệu trưng bày có sản phẩm trưng bày lớn hơn 2 sản phẩm, Bạn có muốn gửi dữ liệu không?`,
        };
      }
    }
    //
    return { isValid: true, message: null };
  };
  const generateGroupedMessage = data => {
    const groupData = _.groupBy(data, 'CompetitorName');
    const result = Object.entries(groupData)
      .map(([competitor, itemsByCompetitor]) => {
        const categories = _.groupBy(itemsByCompetitor, 'CategoryName');
        const categoryStrings = Object.entries(categories)
          .map(([category, itemsByCategory]) => {
            const products = itemsByCategory
              .map(item => ` - ${item.ProductName}`)
              .join('\n');
            return `Ngành hàng ${category}:\n${products}`;
          })
          .join('\n');
        return `${competitor}\n${categoryStrings}`;
      })
      .join('\n\n');
    return result;
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    LoadDataDisplay();
  }, []);
  //

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentMain: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    opacityView: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 2,
      top: 0,
      backgroundColor: appcolor.light,
      opacity: 0.8,
    },
    loadingView: {
      width: '100%',
      height: '90%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        subTitle={isEdit ? 'Chế độ chỉnh sửa' : 'Chế độ chỉ xem'}
        iconRight={isEdit ? 'cloud-upload-alt' : 'edit'}
        leftFunc={onBack}
        rightFunc={() => (isEdit ? UploadData() : EditData())}
        disabled={isLoading}
      />
      <ScreenChecking
        key={`checking`}
        navigation={navigation}
        onLockField={setLockField}
      />
      {/* // Product Field */}
      <View style={styles.contentMain}>
        {/* // Action Loading */}
        {isUploading && <View style={styles.opacityView} />}
        <LoadingView
          isLoading={isUploading}
          title="Đang gửi dữ liệu lên hệ thống"
          styles={styles.loadingView}
        />
        {!isLockField && <ScreenProductDisplay key={`product-display`} />}
      </View>
      <DisplayEdit
        isLoading={isLoading}
        isToggleEdit={isToggleEdit}
        dataEdit={jsonPhoto}
        navigation={navigation}
        handlerToggle={handlerToogle}
      />
    </View>
  );
};
export default DisplayScreen;
