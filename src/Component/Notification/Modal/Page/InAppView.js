import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useSelector } from 'react-redux';
import { NotificationAPI } from '../../../../API/NotificationAPI';
import Toast from 'react-native-toast-message';
import { Button } from '@rneui/base';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormGroup from '../../../../Content/FormGroup';
import { alertWarning, checkUrlExists } from '../../../../Core/Utility';
import { GetToken } from '../../../../Core/Helper';
import { AppNameBuild } from '../../../../Core/URLs';
import deviceInfoModule from 'react-native-device-info';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import WebViewUI from '../../../../Content/WebViewUI';
import { Buffer } from 'buffer';

const InAppView = ({ title, body, inAppId, isViewDetail, onClose }) => {
  const [inAppMess, setinAppMess] = useState({});
  const [config, setConfig] = useState([]);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [log, setLog] = useState({});
  const [visibleWebView, setVisibleWebView] = useState(false);
  const [urlSite, setUrlSite] = useState({ hyperLink: '', titleName: '' });

  const safeClose = typeof onClose === 'function' ? onClose : () => {};

  const onload = async () => {
    if (!inAppId) return;
    const results = await NotificationAPI.GetInApp(inAppId, isViewDetail);
    if (results.statusId === 200) {
      if ((await results?.data.length) > 0) {
        const item = results.data[0];
        await setinAppMess(item);
        await setConfig(JSON.parse(item.config));
      } else {
        safeClose();
      }
      setLog({ opentime: moment().format('YYYY-MM-DD HH:mm:ss') });
    } else {
      safeClose();
    }
  };

  useEffect(() => {
    const _load = onload();
    return () => _load;
  }, [inAppId]);

  const onPostLog = async () => {
    if (!inAppId) {
      safeClose();
      return;
    }
    const feedback = log?.feedback || '';
    const configNote = config?.filter(i => i.name == 'FeedBack')[0] || {};
    if (configNote?.noteLength > 0) {
      if (feedback.length < configNote.noteLength) {
        alertWarning(
          `Vui lòng nhập ${configNote.label} tối thiểu ${configNote.noteLength} kí tự (${feedback.length}/${configNote.noteLength})`,
        );
        return;
      }
    }
    const logInfo = {
      inAppId: inAppId,
      opentime: log.opentime,
      closetime: moment().format('YYYY-MM-DD HH:mm:ss'),
      feedback: log?.feedback || null,
    };
    const resutl = await NotificationAPI.PostLog([logInfo]);
    if (resutl.statusId === 200) {
      await AsyncStorage.removeItem('messages');
      await safeClose();
    } else {
      await Toast.show({ type: 'error', text1: 'Lỗi', text2: resutl.messager });
    }
  };

  const handlerChangeText = text => {
    setLog({ ...log, feedback: text });
  };

  const openUrlByWebView = (url, titlePage = 'Trình duyệt') => {
    setUrlSite({ hyperLink: url, titleName: titlePage || 'Trình duyệt' });
    setVisibleWebView(true);
  };

  const appendAppShare = (url, appShare) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}appshare=${appShare}`;
  };

  const eventStateUrlChange = async event => {
    if (!event.url || event.url === 'about:blank') {
      return;
    }

    const token = await GetToken();
    const deviceId = await deviceInfoModule.getUniqueId();
    const shareInfo = {
      employeeId: userinfo.employeeId,
      employeeName: userinfo.employeeName,
      accountId: userinfo.accountId,
      typeId: userinfo.typeId,
      loginName: userinfo.loginName,
      mobile: userinfo.mobile,
      deviceId: deviceId,
      AppId: AppNameBuild,
      token: token,
    };
    const app_access = Buffer.from(JSON.stringify(shareInfo), 'utf8').toString(
      'base64',
    );

    if (
      event.url.includes('spiral.com.vn') ||
      event.url.includes('sucbat.com.vn')
    ) {
      openUrlByWebView(appendAppShare(event.url, app_access), inAppMess?.title);
    } else {
      const newUrl =
        !event.url.startsWith('http://') && !event.url.startsWith('https://')
          ? `https://${event.url}`
          : event.url;
      const checkUrl = await checkUrlExists(newUrl);
      if (checkUrl) {
        openUrlByWebView(appendAppShare(newUrl, app_access), inAppMess?.title);
      } else {
        alertWarning(`Đường dẫn ${event.url} không đúng định dạng!`);
      }
    }
  };

  const shouldStartLoadWithRequest = request => {
    if (!request.url || request.url === 'about:blank') {
      return true;
    }

    eventStateUrlChange(request);
    return false;
  };

  const contentHtml = inAppMess?.content || body || '';
  const titleText = inAppMess?.title || title || 'InApp';
  const createdDate = inAppMess?.createdDate;

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8 },
    headerContainer: { padding: 8, paddingBottom: 0 },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    titleClose: { fontSize: 13, fontWeight: '500', color: appcolor.primary },
    viewContent: {
      flex: 1,
      margin: 8,
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.surface,
      overflow: 'hidden',
    },
    closeButton: {
      width: 150,
      alignItems: 'center',
      alignSelf: 'center',
      padding: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.light,
      borderRadius: 8,
      marginBottom: 16,
    },
  });

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.titleName}>{titleText}</Text>
      </View>
      <View style={styles.viewContent}>
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled={true}
          showsVerticalScrollIndicator={false}
          startInLoadingState
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
          source={{
            html: `<html>
                    <head><meta name="viewport" content="width=device-width, initial-scale=0.0">
                    <style>
                    </style>
                    </head><body style="font-size:${
                      Platform.OS === 'android' ? '350%;' : '100%'
                    } ">
                        ${contentHtml || '<p>Không có nội dung</p>'}
                        ${
                          createdDate
                            ? `<div style="text-align:end;color:red;width:100%;font-style:italic">Đã đăng ${moment(
                                createdDate,
                              ).calendar()}</div>`
                            : ''
                        }
                         <div style="width: 100%;background:#f1f1f1;padding-left:-3px;border-radius: 24px;">
                            <p style="text-align:center;font-weight:600;padding-top:30px">Công ty TNHH Sức Bật</p>
                            <p style="text-align:center;">27b Nguyễn Đình Chiểu, P.Đa Kao, Quận 1, TP.HCM</p>
                            <p style="text-align:center;font-weight:600;padding-bottom:10px">copyright®2022</p>
                        </div>
                    </body></html>`,
          }}
        />
      </View>
      <ToolKit
        onPostLog={onPostLog}
        close={safeClose}
        config={config}
        appcolor={appcolor}
        handlerChangeText={handlerChangeText}
      />

      {config?.length == 0 && onClose && (
        <TouchableOpacity onPress={safeClose} style={styles.closeButton}>
          <Text style={styles.titleClose}>Đóng</Text>
        </TouchableOpacity>
      )}
      <Modal
        style={{ backgroundColor: appcolor.light }}
        animationType="slide"
        visible={visibleWebView}
      >
        <SafeAreaView style={{ width: '100%', height: '100%' }}>
          <WebViewUI
            pageName={urlSite.titleName}
            urlPage={urlSite.hyperLink}
            onClose={() => setVisibleWebView(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const ToolKit = ({ config, appcolor, onPostLog, close, handlerChangeText }) => {
  const [count, setCount] = useState(30);
  useEffect(() => {
    let _cleartime = setTimeout(() => {
      if (count !== 0) setCount(count - 1);
    }, 1000);
    return () => clearInterval(_cleartime);
  }, [count]);
  return (
    <View style={{ padding: 3, backgroundColor: appcolor.light }}>
      {config
        ?.filter(it => it.name == 'FeedBack')
        .map(element => {
          return (
            <FormGroup
              key={element.name}
              editable
              multiline
              title={element.label}
              placeholder={`Nhập ${element.label}`}
              containerStyle={{
                padding: 3,
                fontSize: 13,
                backgroundColor: appcolor.surface,
                borderRadius: 5,
              }}
              handleChangeForm={handlerChangeText}
            />
          );
        })}
      <View
        style={{
          justifyContent: 'center',
          marginBottom: 7,
          minHeight: 40,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {config
          ?.filter(it => it.name !== 'FeedBack')
          .map(element => {
            return (
              <ButtonAction
                key={element.name}
                element={element}
                close={close}
                onPostLog={onPostLog}
              />
            );
          })}
      </View>
    </View>
  );
};

const ButtonAction = ({ element, close, onPostLog }) => {
  const [count, setCount] = useState(element.timer);
  useEffect(() => {
    let _cleartime = setTimeout(() => {
      if (count !== 0) setCount(count - 1);
    }, 1000);
    return () => clearInterval(_cleartime);
  }, [count]);

  const { appcolor } = useSelector(state => state.GAppState);
  const colorButton =
    element.name === 'SkipButton'
      ? appcolor.danger
      : element.name === 'ReadButton'
      ? appcolor.primary
      : appcolor.surface;
  const styles = StyleSheet.create({
    buttonClose: {
      flexGrow: 0.3,
      alignSelf: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      padding: 6,
      paddingHorizontal: 24,
      backgroundColor: appcolor.light,
    },
    buttonRead: {
      flexGrow: 0.3,
      alignSelf: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      padding: 6,
      paddingHorizontal: 24,
      backgroundColor: colorButton,
    },
    buttonContainer: {
      flexGrow: 0.3,
      alignSelf: 'center',
      borderRadius: 8,
      overflow: 'hidden',
      marginVertical: 8,
      marginEnd: 3,
    },
    titleButtonClose: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: element.name === 'SkipButton' ? appcolor.primary : appcolor.light,
    },
  });
  const pressItem = () => {
    element.name === 'SkipButton' ? close() : onPostLog();
  };
  const styleButton =
    element.name === 'SkipButton' ? styles.buttonClose : styles.buttonRead;
  return (
    <Button
      key={element.name}
      title={count > 0 ? `${count}` : element.label}
      onPress={pressItem}
      disabled={count !== 0}
      buttonStyle={styleButton}
      containerStyle={styles.buttonContainer}
      titleStyle={styles.titleButtonClose}
    />
  );
};

export default React.memo(InAppView);
