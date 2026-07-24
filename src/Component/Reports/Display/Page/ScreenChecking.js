import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { REPORT } from '../../../../API/ReportAPI';
import { ToastError } from '../../../../Core/Helper';
import { Text } from '@rneui/base';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ScreenChecking = ({ navigation, onLockField }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [itemChecking, setItemChecking] = useState({});

  const LoadData = useCallback(async () => {
    try {
      await REPORT.WorkingCheckReport(
        shopinfo.shopId,
        kpiinfo.id,
        async (mData, message) => {
          if (message) {
            ToastError(message);
          }
          const item = mData[0] || {};
          if (item.statusId === 500) {
            SheetManager.show('checkingdisplay', { payload: item });
            onLockField(true);
          } else {
            onLockField(false);
          }
        },
      );
    } catch (error) {
      console.error(error);
    }
  }, [shopinfo.shopId, kpiinfo.id, onLockField]);

  const handlerCloseAction = () => {
    navigation.goBack();
  };

  useEffect(() => {
    LoadData();
    return () => {};
  }, [LoadData]);

  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleStatus: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
    actionClose: {
      backgroundColor: appcolor.blacklight,
      paddingHorizontal: 16,
      marginTop: 16,
      borderRadius: 5,
    },
    titleClose: {
      fontWeight: fontWeightBold,
      fontSize: 13,
      color: appcolor.light,
      padding: 8,
    },
    lottieView: { width: '100%', height: '35%' },
  });

  return (
    <ActionSheet
      id="checkingdisplay"
      closable={false}
      onBeforeShow={setItemChecking}
      drawUnderStatusBar={Platform.OS == 'ios'}
      animated={false}
      containerStyle={{ paddingBottom: insets.bottom }}
    >
      <View style={styles.mainContainer}>
        <LottieView
          autoPlay
          loop={false}
          style={styles.lottieView}
          source={require('../../../../Themes/lotties/alertwarning.json')}
        />
        <Text style={styles.titleStatus}>{`${
          itemChecking.titleStatus
        }\n(Bắt đầu làm ${moment(itemChecking.beginTime).fromNow()})`}</Text>
        <TouchableOpacity
          style={styles.actionClose}
          onPress={handlerCloseAction}
        >
          <Text style={styles.titleClose}>Đồng ý</Text>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};
