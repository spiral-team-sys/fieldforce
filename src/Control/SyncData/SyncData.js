import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { toastError, toastInfo } from '../../Utils/configToast';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { checkNetwork } from '../../Core/Utility';
import { DOWNLOADAPI } from '../../API/DownloadAPI';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getPhotosNotUploadReport,
  uploadAllDataPhoto,
} from '../../Controller/PhotoController';
import useNotification from '../../Hooks/useNotification';
import { NotificationAPI } from '../../API/NotificationAPI';
import { UpdateApp } from '../../Core/Helper';

const SyncData = forwardRef((props, ref) => {
  const { onCompleted } = props;
  const { appcolor } = useSelector(state => state.GAppState);
  const { handlerCountNotification } = useNotification();
  const [isDownloading, setDownloading] = useState(false);
  const isDownloadingRef = useRef(false);
  //
  useImperativeHandle(ref, () => ({ onSyncData: handlerDownloadData }), []);
  //
  const handlerDownloadData = async () => {
    if (isDownloadingRef.current) {
      return;
    }
    isDownloadingRef.current = true;
    setDownloading(true);
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        toastError(
          'Kết nối mạng',
          'Kết nối thất bại, vui lòng kiểm tra lại 4G/Wifi sau đó thử lại',
        );
        return;
      }
      // Check Version
      let isUpdateNewApp = false;
      await UpdateApp(isNew => {
        isUpdateNewApp = isNew;
      });
      // Download Processing
      if (!isUpdateNewApp) {
        try {
          const isDownloaded = await DOWNLOADAPI.downloadAll(message =>
            toastInfo('Thông báo', message),
          );
          if (!isDownloaded) {
            await onCompleted(false);
            return;
          }
          await DOWNLOADAPI.downloadMenu();
          await NotificationAPI.GetDataNotify();
          await handlerUploadPending();
          await handlerCountNotification();
          await onCompleted(true);
        } catch (error) {
          // toastError('Lỗi đồng bộ', `DownloadData: ${error}`)
          onCompleted(false);
        }
      }
    } finally {
      isDownloadingRef.current = false;
      setDownloading(false);
    }
  };
  const handlerUploadPending = async () => {
    let dataPhoto = await getPhotosNotUploadReport();
    if (dataPhoto !== null && dataPhoto.length > 0)
      await uploadAllDataPhoto(dataPhoto);
  };
  //
  useEffect(() => {
    const reload_data = DeviceEventEmitter.addListener(
      'REDOWNLOAD_DATA',
      handlerDownloadData,
    );
    let isMounted = true;
    if (!isMounted) return;
    handlerDownloadData();
    return () => {
      reload_data.remove();
      isMounted = false;
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 1,
      backgroundColor: appcolor.primary,
      start: 0,
    },
    contentMain: {
      flex: 1,
      flexDirection: 'row',
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleView: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.light,
      marginStart: 8,
    },
  });

  if (!isDownloading) return <View />;
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.contentMain}>
        <ActivityIndicator size="small" color={appcolor.light} />
        <Text style={styles.titleView}>Đang đồng bộ dữ liệu hệ thống</Text>
      </View>
    </SafeAreaView>
  );
});
export default SyncData;
