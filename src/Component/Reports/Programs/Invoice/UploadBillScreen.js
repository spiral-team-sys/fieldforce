import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { Button, Divider, Icon, Image, Text } from '@rneui/base';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../../../Themes/AppsStyle';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { SELECTION } from '../../../../Control/Document/SelectionFiles';
import { UPLOADAPI } from '../../../../API/UploadAPI';
import { types } from '@react-native-documents/picker';
import { alertWarning, TODAY } from '../../../../Core/Utility';
import { toastError } from '../../../../Utils/configToast';
import useApp from '../../../../Hooks/useApp';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GetEmployeeInfo, UUIDGenerator } from '../../../../Core/Helper';
import NativeCamera from '../../../../Control/NativeCamera';
import { INVOICE_API } from '../../../../API/InvoiceAPI';
import moment from 'moment';
import _ from 'lodash';

const UploadBillScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { userinfo } = useApp();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isWaiting, setWaiting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [itemData, setItemData] = useState({});
  const [dataFiles, setDataFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const config = JSON.parse(kpiinfo.reportItem || '{}');
  //
  const LoadData = () => {
    const itemRoute = route?.params?.item || {};
    setItemData(itemRoute);
  };
  const UploadData = async () => {
    const isValid = await validData();
    if (!isValid) return;
    //
    await setLoading(true);
    await setUploadProgress({ current: 0, total: 0 });
    let employeeInfo = userinfo;
    if (Object.keys(userinfo).length == 0) {
      const _userinfo = await GetEmployeeInfo();
      employeeInfo = _userinfo;
    }
    //
    let dataUpload = [];
    for (let index = 0; index < dataFiles.length; index++) {
      const item = dataFiles[index];
      dataUpload.push({
        guid: UUIDGenerator(),
        reportDate: itemData.reportDate || TODAY,
        shopId: itemData.shopId || 0,
        programId: itemData.programId || 0,
        fileName: `${itemData.shopId || 0}_${item.name}`,
        fileType: types.pdf,
        localUrl: item.uri,
        url: `uploaded/invoice/${employeeInfo.employeeId}/${TODAY}/${
          itemData.shopId || 0
        }_${item.name}`,
      });
    }
    // Check File Invoice
    let isCheckFile = true;
    await INVOICE_API.CheckFileInvoice(dataUpload, result => {
      if (result && result.length > 0) {
        const listFileExist = _.map(result, e => e.fileName);
        if (listFileExist.length > 0) {
          const names = listFileExist.join(', ');
          alertWarning(
            `Các file: ${names} đã tồn tại trên hệ thống, Vui lòng kiểm tra lại`,
          );
          isCheckFile = false;
          return;
        }
      }
    });
    if (!isCheckFile) {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
      return;
    }
    //
    const itemUpload = {
      shopId: itemData.shopId || 0,
      reportId: kpiinfo.id,
      reportDate: itemData.reportDate || TODAY,
      jsonData: JSON.stringify(dataUpload),
      dataFiles: dataUpload,
    };
    await UPLOADAPI.UploadDataNonReport(
      itemUpload,
      (isUploaded, message) => {
        if (isUploaded) {
          setLoading(false);
          setUploadProgress({ current: 0, total: 0 });
          SheetManager.show('result-upload-sheet');
        } else {
          message && toastError('Thông báo', message);
          setLoading(false);
          setUploadProgress({ current: 0, total: 0 });
        }
      },
      progress => {
        setUploadProgress(progress);
      },
    );
  };
  const validData = async () => {
    if (dataFiles.length == 0) {
      toastError(
        'Dữ liệu trống',
        'Vui lòng chọn tối thiểu 1 file hóa đơn trước khi gửi lên hệ thống',
      );
      return false;
    }
    return true;
  };
  // Handlers
  const handleRemoveItem = item => {
    const dataUpdate = _.filter(dataFiles, e => e.name !== item.name);
    setDataFiles(dataUpdate);
  };
  const handleCaptureResult = result => {
    const map = _.map(result.data, e => {
      return {
        name: e.fileName,
        type: types.images,
        fileType: 'image',
        size: SELECTION.formatFileSize(e.fileSize),
        uri: e.uri,
      };
    });
    const dataUpdate = handleUpdateFiles(map);
    setDataFiles(dataUpdate);
  };
  const handleUpdateFiles = newFiles => {
    const map = new Map(dataFiles.map(i => [i.name, i]));
    newFiles.forEach(i => map.set(i.name, i));
    return Array.from(map.values());
  };
  // Actions
  const onChooseFile = async () => {
    await setWaiting(true);
    await SELECTION.selectionFiles(files => {
      const dataUpdate = handleUpdateFiles(files);
      setDataFiles(dataUpdate);
    });
    await setWaiting(false);
  };
  const onTakePicture = async () => {
    const photoInfo = {
      shopId: itemData.shopId || 0,
      shopCode: itemData.shopCode || '',
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: 'BILL_PROGRAM',
      photoDesc: `${itemData.programId || 0}`,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoInfo, handleCaptureResult);
  };
  const onBack = () => {
    navigation.goBack();
  };
  //
  useEffect(() => {
    LoadData();
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: { padding: 8, paddingHorizontal: 16 },
    contentItem: {
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      margin: 8,
      marginBottom: 0,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    contentUploadFile: {
      alignItems: 'center',
      padding: 16,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: appcolor.primary,
    },
    iconInfo: { marginEnd: 8 },
    itemInfo: { flexDirection: 'row', alignItems: 'center', margin: 4 },
    itemFileView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleInfoView: { width: '95%' },
    titleHead: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.placeholderText,
    },
    titleFileSupport: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.placeholderText,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    buttonUpload: {
      alignSelf: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      padding: 6,
      paddingHorizontal: 24,
    },
    titleButtonUpload: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      marginStart: 8,
    },
    viewFileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingBottom: 4,
    },
    circleViewItem: {
      width: 38,
      height: 38,
      borderRadius: 38,
      backgroundColor: appcolor.primary + 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: 8,
    },
    titleDescription: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.placeholderText,
      textAlign: 'center',
      padding: 16,
    },
  });
  const renderItem = ({ item }) => {
    const onRemove = () => handleRemoveItem(item);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemFileView}>
          <View style={[styles.itemFileView, { justifyContent: 'flex-start' }]}>
            <View style={styles.circleViewItem}>
              <SpiralIcon
                type="font-awesome-5"
                name={`file-${item.fileType}`}
                size={16}
                color={appcolor.primary}
              />
            </View>
            <View style={{ width: '80%' }}>
              <Text style={styles.titleName}>{`${item.name}`}</Text>
              <Text style={[styles.subTitleName, { fontSize: 11 }]}>
                {item.size}
              </Text>
            </View>
          </View>
          <SpiralIcon
            type="ionicon"
            name="close"
            size={21}
            color={appcolor.placeholderText}
            style={{ marginEnd: 8 }}
            onPress={onRemove}
          />
        </View>
        <Divider style={{ marginTop: 8 }} />
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title="Cập nhật hóa đơn"
        iconRight="cloud-upload-alt"
        leftFunc={onBack}
        rightFunc={UploadData}
      />
      <View style={styles.contentContainer}>
        {/* Program Infomarion */}
        {Object.keys(itemData).length > 0 && (
          <View style={styles.contentItem}>
            <View style={styles.itemInfo}>
              <SpiralIcon
                type="ionicon"
                name="business"
                size={16}
                color={appcolor.gray}
                style={styles.iconInfo}
              />
              <View style={styles.titleInfoView}>
                <Text style={styles.titleName}>{`${itemData.shopName}`}</Text>
                <Text
                  style={styles.subTitleName}
                >{`${itemData.shopCode}`}</Text>
                <Text style={styles.subTitleName}>{`${itemData.address}`}</Text>
              </View>
            </View>
            <View style={styles.itemInfo}>
              <SpiralIcon
                type="ionicon"
                name="storefront"
                size={16}
                color={appcolor.gray}
                style={styles.iconInfo}
              />
              <View style={styles.titleInfoView}>
                <Text style={styles.titleName}>{`${itemData.dealerName}`}</Text>
                <Text
                  style={styles.subTitleName}
                >{`${itemData.addressDealer}`}</Text>
              </View>
            </View>
            <View style={styles.itemInfo}>
              <SpiralIcon
                type="ionicon"
                name="ribbon"
                size={16}
                color={appcolor.gray}
                style={styles.iconInfo}
              />
              <View style={styles.titleInfoView}>
                <Text style={styles.titleName}>{itemData.programName}</Text>
                <Text
                  style={styles.subTitleName}
                >{`${itemData.fromDate} - ${itemData.toDate}`}</Text>
                <Text
                  style={styles.subTitleName}
                >{`${itemData.programTypeName}`}</Text>
              </View>
            </View>
          </View>
        )}
        {/* File Upload */}
        <TouchableOpacity
          style={[styles.contentItem, styles.contentUploadFile]}
          onPress={onChooseFile}
        >
          <SpiralIcon
            type="ionicon"
            name="cloud-upload-outline"
            size={42}
            color={appcolor.dark}
          />
          <Text
            style={[styles.titleName, { marginTop: 8 }]}
          >{`Chọn file từ thiết bị của bạn`}</Text>
          <Text style={styles.titleFileSupport}>{`Hỗ trợ định dạng: ${
            config.documentFormat || 'PDF'
          }`}</Text>
        </TouchableOpacity>
        {config.isCapture == 1 && (
          <>
            <Text
              style={[styles.subTitleName, { textAlign: 'center', padding: 4 }]}
            >
              or
            </Text>
            <Button
              type="outline"
              title="Chụp hình"
              icon={
                <SpiralIcon
                  type="font-awesome-5"
                  name="camera"
                  size={16}
                  color={appcolor.primary}
                />
              }
              buttonStyle={styles.buttonUpload}
              titleStyle={styles.titleButtonUpload}
              onPress={onTakePicture}
            />
          </>
        )}
        {/* Files View */}
        {isLoading && (
          <ActivityIndicator
            color={appcolor.primary}
            style={{ marginTop: 16 }}
          />
        )}
        <View style={styles.viewFileHeader}>
          <Text style={styles.subTitleName}>{`Danh sách`}</Text>
          <Text style={styles.subTitleName}>
            {isLoading && uploadProgress.total > 0
              ? `Đang tải lên: ${uploadProgress.current}/${uploadProgress.total} file`
              : `${dataFiles.length} files`}
          </Text>
        </View>
        <Divider color={appcolor.gray} style={{ marginHorizontal: 16 }} />
        {dataFiles.length > 0 && (
          <CustomListView
            data={dataFiles}
            extraData={dataFiles}
            renderItem={renderItem}
            bottomView={{ paddingBottom: 0 }}
            ListHeader={
              isWaiting && (
                <View>
                  <ActivityIndicator
                    color={appcolor.primary}
                    style={{ marginTop: 16 }}
                  />
                  <Text style={[styles.subTitleName, { textAlign: 'center' }]}>
                    Đang lấy dữ liệu file
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
      <ActionSheet
        id="result-upload-sheet"
        closable={false}
        closeOnPressBack={false}
        closeOnTouchBackdrop={false}
        drawUnderStatusBar
        statusBarTranslucent={false}
        safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        containerStyle={{
          height: deviceHeight / 1.9,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <SafeAreaView edges={['top', 'bottom']} style={{ padding: 16 }}>
          <Text
            style={[
              styles.titleHead,
              { textAlign: 'center', fontSize: 16, color: appcolor.dark },
            ]}
          >{`Cập nhật hóa đơn thành công`}</Text>
          <View
            style={{
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require(`../../../../Themes/Images/invoice.png`)}
              resizeMethod="scale"
              resizeMode="contain"
              style={{ width: deviceWidth - 64, height: deviceWidth * 0.7 }}
            />
            <ActivityIndicator color={appcolor.primary} size="small" />
            <Text style={styles.titleDescription}>
              Hệ thống đang phân tích dữ liệu từ file hóa đơn của bạn, Vui lòng
              bỏ qua và chờ thông tin chi tiết sau khi hoàn thành
            </Text>
          </View>
          <Button
            type="outline"
            title="Đồng ý"
            buttonStyle={styles.buttonUpload}
            titleStyle={[styles.titleButtonUpload, { marginStart: 0 }]}
            onPress={onBack}
          />
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};

export default UploadBillScreen;
