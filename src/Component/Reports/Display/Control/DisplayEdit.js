import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { removeRawReport } from '../../../../Controller/ReportController';
import { DISPLAY } from '../../../../API/DisplayAPI';
import { deviceWidth, TODAY } from '../../../../Core/Utility';
import { ToastError } from '../../../../Core/Helper';
import {
  SET_IsEdit,
  SET_IsLoading,
  SET_IsStartDisplay,
} from '../../../../Redux/action';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DisplayEdit = ({
  isToggleEdit,
  dataEdit,
  isLoading,
  navigation,
  handlerToggle,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, isEdit, shopinfo, kpiinfo, activeCamera } = useSelector(
    state => state.GAppState,
  );
  const [isWarning, setIsWarning] = useState(false);
  const [dataJsonPhoto, setDataJsonPhoto] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const hasShownEditPromptRef = useRef(false);
  const dispatch = useDispatch();
  //
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (
        nextAppState === 'background' &&
        isEdit &&
        !activeCamera &&
        !hasShownEditPromptRef.current
      ) {
        hasShownEditPromptRef.current = true;
        SheetManager.show('sheet_editdisplay');
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [isEdit, activeCamera]);

  useEffect(() => {
    if (!isLoading && !hasShownEditPromptRef.current) {
      hasShownEditPromptRef.current = true;
      SheetManager.show('sheet_editdisplay');
    }
  }, [isLoading]);
  //

  const LoadDataDisplay = async mode => {
    dispatch(SET_IsLoading(true));
    const itemFilter = {
      shopId: shopinfo.shopId,
      reportId: kpiinfo.id,
      formMode: mode,
      typeReport: 'PRODUCT',
    };
    await DISPLAY.GetDataDisplayByShop(itemFilter, async (mData, messager) => {
      if (mData?.length > 0 && mData !== null && mData !== undefined) {
        if (mData[0].jsonPhoto === null && mode === 1) {
          dispatch(SET_IsEdit(true));
          await AsyncStorage.setItem(
            `${shopinfo.shopId}_EDIT`,
            JSON.stringify({ displayDate: TODAY, isEdit: true }),
          );
        } else {
          SheetManager.show('sheet_editdisplay');
        }
        setDataJsonPhoto(mData[0].jsonPhoto);
      }
      if (messager !== null) ToastError(messager);
    });
    dispatch(SET_IsLoading(false));
  };
  //
  const onHideSheet = () => {
    SheetManager.hide('sheet_editdisplay');
  };
  const onUnderstand = () => {
    SheetManager.hide('sheet_editdisplay');
    navigation.goBack();
  };
  const onStartEdit = async () => {
    await SheetManager.hide('sheet_editdisplay');
    await LoadDataDisplay(1);
    dispatch(SET_IsStartDisplay(true));
  };
  const onPressYes = () => {
    onHideSheet();
  };
  const onPressNo = async () => {
    setIsWarning(true);
  };
  const onGoBack = async () => {
    await SheetManager.hide('sheet_editdisplay');
    setIsWarning(false);
    handlerToggle();
  };
  const onContinue = async () => {
    await SheetManager.hide('sheet_editdisplay');
    removeRawReport(shopinfo.shopId, kpiinfo.id);
    dispatch(SET_IsEdit(false));
    await AsyncStorage.removeItem(`${shopinfo.shopId}_EDIT`);
    setIsWarning(false);
    LoadDataDisplay(-1);
    handlerToggle();
  };
  const onCall = phone => {
    SheetManager.hide('sheet_editdisplay');
    navigation.goBack();
    setTimeout(() => {
      let phoneNumber = '';
      if (Platform.OS === 'android') {
        phoneNumber = `tel:${phone}`;
      } else {
        phoneNumber = `telprompt:${phone}`;
      }
      Linking.openURL(phoneNumber);
    }, 500);
  };
  //
  const styles = StyleSheet.create({
    titleNote: {
      color: appcolor.danger,
      textAlign: 'center',
      fontWeight: fontWeightBold,
      marginVertical: 7,
      fontSize: 16,
    },
    content: {
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      fontStyle: 'italic',
      marginBottom: 7,
      textAlign: 'center',
    },
    title: { color: appcolor.dark, fontWeight: fontWeightBold },
    value: {
      color: appcolor.danger,
      fontWeight: fontWeightBold,
      fontStyle: 'italic',
    },
    buttonYes: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: appcolor.primary,
      minWidth: 80,
    },
    buttonNo: {
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: appcolor.dark,
      minWidth: 80,
      marginEnd: 16,
    },
    buttonStart: {
      alignSelf: 'center',
      padding: 8,
      backgroundColor: appcolor.primary,
      borderRadius: 6,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    viewContent: { flexDirection: 'row', alignItems: 'center' },
    titleButton: {
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    description: { color: appcolor.dark, textAlign: 'center', fontSize: 13 },
    loadingView: {
      position: 'absolute',
      top: 0,
      bottom: deviceWidth / 3,
      start: 0,
      end: 0,
      justifyContent: 'center',
      zIndex: 1000,
    },
  });
  const CommonDisplay = ({ title, content, question, buttons }) => {
    return (
      <View style={{ paddingVertical: 15 }}>
        <View style={{ marginBottom: 15, marginLeft: 7 }}>
          <Text style={styles.titleNote}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
          <Text style={styles.content}>{question}</Text>
        </View>
        {buttons && buttons.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              marginBottom: 20,
            }}
          >
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={button.style}
                onPress={button.onPress}
              >
                <Text
                  style={{
                    color: button.textColor,
                    fontWeight: fontWeightBold,
                    textAlign: 'center',
                  }}
                >
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
  const InStatusEdit = () => {
    return (
      <CommonDisplay
        title={'Lưu ý'}
        content={
          'Bạn đang trong chế độ "Chỉnh sửa", vui lòng hoàn tất nhập liệu và gửi báo cáo'
        }
        question={'Bạn có muốn tiếp tục chỉnh sửa báo cáo?'}
        buttons={[
          {
            label: 'Không',
            onPress: onPressNo,
            style: styles.buttonNo,
            textColor: appcolor.dark,
          },
          {
            label: 'Có',
            onPress: onPressYes,
            style: styles.buttonYes,
            textColor: appcolor.light,
          },
        ]}
      />
    );
  };
  const DisplayStatus = () => {
    return (
      <View>
        <View style={{ marginTop: 7, marginLeft: 7 }}>
          <View style={{ marginVertical: 7 }}>
            <Text style={styles.content}>
              {'Bạn đang ở chế độ "Chỉ xem" nên không thể nhập liệu.'}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              {
                'Để làm báo cáo vui lòng chuyển qua chế độ "Chỉnh sửa" bằng cách bấm vào biểu tượng cây bút ở góc phải màn hình'
              }
            </Text>
          </View>
          <Text style={styles.titleNote}>{'Lưu ý'}</Text>
          <Text style={[styles.content, { textAlign: 'center' }]}>
            {
              'Khi bạn ở chế độ “Chỉnh sửa” thì những nhân viên khác sẽ ở chế độ “Chỉ xem”. Vì vậy sau khi nhập liệu xong phải bấm lưu báo cáo để thoát chế độ “Chỉnh sửa” nhường phiên làm việc cho nhân viên khác.'
            }
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'center',
            padding: 8,
            minWidth: 50,
            backgroundColor: appcolor.primary,
            borderRadius: 6,
            marginTop: 7,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{}}
            onPress={() => {
              onHideSheet();
            }}
          >
            <Text style={{ color: appcolor.light, fontSize: 14 }}>
              {'Đã hiểu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const InProcess = ({ item }) => {
    const value = typeof item === 'string' ? JSON.parse(item) : item;
    const onPress = () => {
      onCall(value?.Mobile);
    };
    return (
      <View style={{}}>
        <View style={{ marginLeft: 7 }}>
          <Text style={styles.titleNote}>{'Lưu ý'}</Text>
          <Text
            style={{ ...styles.content, textAlign: 'left' }}
          >{`${value?.TypeName} ${value?.FullName} đang chỉnh sửa báo cáo nên bạn không thể nhập liệu`}</Text>
          <View style={styles.viewContent}>
            <Text style={styles.title}>{`Thời gian chỉnh sửa: `}</Text>
            <Text style={styles.value}>{value?.EditDate}</Text>
          </View>
          <View style={[styles.viewContent, { marginBottom: 7 }]}>
            <Text style={styles.title}>{`Số đt liên hệ: `}</Text>
            <Text style={styles.value}>{value?.Mobile}</Text>
          </View>
          <Text style={{ ...styles.content, textAlign: 'left' }}>
            {'Bạn có thể bấm "Gọi" để liên hệ nhân viên đang chỉnh sửa báo cáo'}
          </Text>
        </View>
        <View
          style={{
            padding: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <TouchableOpacity style={styles.buttonNo} onPress={onUnderstand}>
            <Text style={styles.titleButton}>{'Đã hiểu'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonYes} onPress={onPress}>
            <Text style={{ ...styles.titleButton, color: appcolor.light }}>
              {'Gọi'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const StartEdit = () => {
    return (
      <CommonDisplay
        title={'Lưu ý'}
        content={
          'Khi bạn ở chế độ "Chỉnh sửa" thì các nhân viên khác sẽ ở chế độ "Chỉ xem", bạn có muốn bắt đầu chỉnh sửa báo cáo?'
        }
        buttons={[
          {
            label: 'Bắt đầu',
            onPress: onStartEdit,
            style: styles.buttonStart,
            textColor: appcolor.light,
          },
        ]}
      />
    );
  };
  const WarningEdit = () => {
    return (
      <CommonDisplay
        title={'Lưu ý'}
        content={
          'Nếu thoát chế độ "Chỉnh sửa" khi chưa gửi báo cáo thì những dữ liệu bạn đã nhập sẽ bị xóa. Bạn vẫn muốn tiếp tục thoát chế độ "Chỉnh sửa" mà không gửi báo cáo?'
        }
        buttons={[
          {
            label: 'Quay lại',
            onPress: onGoBack,
            style: styles.buttonNo,
            textColor: appcolor.dark,
          },
          {
            label: 'Tiếp tục',
            onPress: onContinue,
            style: styles.buttonYes,
            textColor: appcolor.light,
          },
        ]}
      />
    );
  };
  const renderItem = item => {
    if (appState === 'background') {
      return <InStatusEdit />;
    }
    if (isEdit) {
      if (isWarning) {
        return <WarningEdit />;
      }
      return <InStatusEdit />;
    } else {
      if (item) {
        return <InProcess item={item} />;
      }
      if (isToggleEdit) {
        return <StartEdit />;
      }
      return <DisplayStatus />;
    }
  };

  return (
    <ActionSheet
      isModal={false}
      containerStyle={{
        backgroundColor: appcolor.light,
        paddingBottom: insets.bottom,
      }}
      id="sheet_editdisplay"
      closeOnTouchBackdrop={isToggleEdit || isEdit}
      closeOnPressBack={isToggleEdit || isEdit}
    >
      {renderItem(dataJsonPhoto || dataEdit)}
    </ActionSheet>
  );
};
