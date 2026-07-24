import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { Icon } from '@rneui/base';
import ListFalseSheet from '../Sheet/ListFalseSheet';
import {
  deleteDataRawTraining,
  getDataByReport,
} from '../../../../Controller/ReportController';
import { TrainingAPI } from '../../../../API/TrainingAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNetwork } from '../../../../Core/Utility';
import { ToastError } from '../../../../Core/Helper';
import LoadingViewLG from '../../../../Control/ItemLoading/LoadingViewLG';

const ResultExam = ({ navigation, route }) => {
  const { appcolor, kpiinfo, tokenAutoLogin } = useSelector(
    state => state.GAppState,
  );
  const { data } = route.params;
  const [dataResult, setDataResult] = useState(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDataResult(data);
  }, [data]);

  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerBackVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => {});
    };
  }, []);

  const goHome = async () => {
    await deleteDataRawTraining(0, kpiinfo.id || 3);
    await AsyncStorage.removeItem('isDoingExam');
    await DeviceEventEmitter.emit('reloadExam');
    navigation.reset({
      index: 0,
      routes: [{ name: 'traineeApp', params: { isResultExam: true } }],
    });
  };

  const goBack = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'traineeApp', params: { isResultExam: true } }],
    });
  };

  const onRetry = () => {
    navigation.reset({
      index: 0,
      routes: [
        { name: 'prepareExam', params: { data: data, isPrepareExam: true } },
      ],
    });
  };

  const onSubmit = async () => {
    const isConnected = await checkNetwork();
    if (isConnected) {
      const getDataExam = (await getDataByReport(0, kpiinfo.id || 3)) || {};
      await setLoading(true);
      if (getDataExam.data.length > 0) {
        await TrainingAPI.SubmitExam(
          { listQuestion: getDataExam.data },
          tokenAutoLogin,
          async result => {
            await deleteDataRawTraining(0, kpiinfo.id || 3);
            await AsyncStorage.removeItem('isDoingExam');
            await DeviceEventEmitter.emit('reloadExam');
            setDataResult(result);
          },
          async error => {
            await deleteDataRawTraining(0, kpiinfo.id || 3);
            await AsyncStorage.removeItem('isDoingExam');
            await DeviceEventEmitter.emit('reloadExam');
            setDataResult(error);
          },
        );
      } else {
        await deleteDataRawTraining(0, kpiinfo.id || 3);
        await AsyncStorage.removeItem('isDoingExam');
        await DeviceEventEmitter.emit('reloadExam');
        setDataResult({ ...data, dataLocal: 0 });
      }
      await setLoading(false);
    } else {
      ToastError(
        'Lỗi kết nối',
        'Kết nối dữ liệu Wifi/4G không ổn định, Vui lòng kiểm tra lại',
      );
    }
  };

  const onDetailListFalse = () => {
    SheetManager.show('detailListFalse');
  };

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: appcolor.light,
      alignContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    emojiContainer: { marginVertical: 50 },
    emoji: {
      width: 200,
      height: 200,
      alignSelf: 'center',
      resizeMode: 'center',
    },
    resultContainer: { alignItems: 'center', marginBottom: 30 },
    resultTitle: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      color: appcolor.primay,
      marginBottom: 8,
      textAlign: 'center',
    },
    resultSubtitle: {
      fontSize: 12,
      color: appcolor.dark,
      marginBottom: 4,
      textAlign: 'center',
    },
    lessonName: {
      fontSize: 14,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      width: '80%',
      backgroundColor: appcolor.primary,
      marginVertical: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 40,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 4,
    },
    statNumberWrong: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      marginBottom: 4,
    },
    statLabel: { fontSize: 12, color: appcolor.dark, textAlign: 'center' },
    statLabelWrongContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabelWrong: { fontSize: 12, color: appcolor.dark, textAlign: 'center' },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    homeButton: {
      flex: 1,
      height: 50,
      padding: 8,
      borderWidth: 1,
      borderColor: appcolor.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      backgroundColor: appcolor.light,
    },
    retryButton: {
      flex: 1,
      height: 50,
      backgroundColor: appcolor.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    homeButtonText: {
      fontSize: 12,
      color: appcolor.primary,
      fontWeight: fontWeightBold,
    },
    retryButtonText: {
      fontSize: 12,
      color: appcolor.light,
      fontWeight: fontWeightBold,
    },
    loading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading)
    return <LoadingViewLG isLoading={loading} styles={styles.loading} />;

  if (dataResult?.sysCode == 1)
    return (
      <View style={styles.mainContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.resultTitle}>Đã có lỗi xảy ra!</Text>
          <View style={styles.emojiContainer}>
            <Image
              source={require('../../../../Themes/Images/mark.png')}
              style={styles.emoji}
              resizeMode="contain"
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.homeButton} onPress={goHome}>
              <Text style={styles.homeButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
            {dataResult?.dataLocal !== 0 && (
              <TouchableOpacity style={styles.retryButton} onPress={onSubmit}>
                <Text style={styles.retryButtonText}>Nộp lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.emojiContainer}>
          <Image
            source={
              dataResult.status == 0
                ? require('../../../../Themes/Images/depressed.png')
                : require('../../../../Themes/Images/happy.png')
            }
            style={styles.emoji}
            resizeMode="contain"
          />
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{dataResult?.result}</Text>
          <Text style={styles.resultSubtitle}>
            Bạn phải đạt tối thiểu {dataResult?.target}% số điểm
          </Text>
          <Text style={styles.lessonName}>{dataResult?.lessonName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dataResult?.numOfTrue}</Text>
            <Text style={styles.statLabel}>Câu đúng</Text>
          </View>

          <TouchableOpacity style={styles.statItem} onPress={onDetailListFalse}>
            <Text style={styles.statNumberWrong}>{dataResult?.numOfFalse}</Text>
            <View style={styles.statLabelWrongContainer}>
              <Text style={styles.statLabelWrong}>Câu sai </Text>
              <SpiralIcon
                name="chevron-right"
                type="font-awesome"
                color={appcolor.dark}
                size={12}
                style={{ marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dataResult?.duration}</Text>
            <Text style={styles.statLabel}>Thời gian</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.homeButton} onPress={goBack}>
            <Text style={styles.homeButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Làm lại</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ListFalseSheet data={dataResult?.listQuestionFalse} />
    </View>
  );
};

export default ResultExam;
