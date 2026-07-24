import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  BackHandler,
  DeviceEventEmitter,
  Text,
} from 'react-native';
import { TrainingAPI } from '../../../../API/TrainingAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import LoadingViewLG from '../../../../Control/ItemLoading/LoadingViewLG';
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle';
import _ from 'lodash';
import {
  deleteDataRawTraining,
  getDataByReport,
  saveJsonData,
} from '../../../../Controller/ReportController';
import { checkNetwork, TODAY } from '../../../../Core/Utility';
import QuestionItem from '../Items/QuestionItem';
import { AppState } from 'react-native';
import { Message, MessageAcept, ToastError } from '../../../../Core/Helper';
import { TouchableOpacity } from 'react-native';
import TimerComponent from '../Components/TimerComponent';
import { FlashList } from '@shopify/flash-list';
import { Icon } from '@rneui/base';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const TrainingExam = ({ navigation, route }) => {
  const { appcolor, kpiinfo, tokenAutoLogin } = useSelector(
    state => state.GAppState,
  );
  const { data, times } = route.params;
  const [dataExam, setDataExam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isDoing, setIsDoing] = useState(false);
  const [message, setMessage] = useState('');
  const [isShowListQuestion, setIsShowListQuestion] = useState(true);
  const intervalRef = useRef(null);
  const flatListRef = useRef(null);

  const LoadData = async () => {
    try {
      await setLoading(true);
      const value = await AsyncStorage.getItem('AutoLoginTrainee');
      const { erpToken } = JSON.parse(value) || '{}';
      const getDataExam = (await getDataByReport(0, kpiinfo.id || 3)) || {};
      if (getDataExam?.data?.length > 0) {
        const isDoingExam = await AsyncStorage.getItem('isDoingExam');
        const { timer, isDoing, totalTimeLocal, lastUpdateTime } =
          JSON.parse(isDoingExam) || '{}';
        const now = Date.now();
        const lastUpdate = lastUpdateTime || now;
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        const newTimeLeft = Math.max(0, timer - elapsedSeconds);
        if (isDoing && newTimeLeft > 0) {
          setTimeLeft(newTimeLeft);
          setTotalTime(totalTimeLocal || timer);
          setIsDoing(isDoing);

          AsyncStorage.setItem(
            'isDoingExam',
            JSON.stringify({
              timer: newTimeLeft,
              isDoing: true,
              totalTimeLocal: totalTimeLocal || timer,
              lastUpdateTime: now,
            }),
          );
        } else if (newTimeLeft === 0) {
          setTimeLeft(0);
          setTotalTime(0);
          setIsDoing(false);

          MessageAcept(
            'Thông báo',
            'Bạn đã hết thời gian làm bài, hãy nộp bài',
            async () => {
              await onSubmitOverTime();
            },
          );
        }
        setIsDoing(true);
        setDataExam(getDataExam.data);
      } else {
        const isConnected = await checkNetwork();
        if (!isConnected) {
          ToastError(
            'Lỗi kết nối',
            'Kết nối dữ liệu Wifi/4G không ổn định, Vui lòng kiểm tra lại',
          );
          await setLoading(false);
          await setDataExam([]);
          return;
        }
        await TrainingAPI.GetDataExam(
          { scheduleSysCode: data?.scheduleSysCode, times: times + 1 },
          erpToken,
          result => {
            if (result.sysCode == 1) {
              setMessage(result.sysName);
            } else {
              const dataUpdate = _.map(result.listQuestion, item => {
                return {
                  ...item,
                  lessonName: data.lessonName,
                };
              });
              setMessage('');
              setDataExam(dataUpdate);
              const timerInSeconds = (result.timer || 0) * 60;
              setTotalTime(timerInSeconds);
              setTimeLeft(timerInSeconds);
              AsyncStorage.setItem(
                'isDoingExam',
                JSON.stringify({
                  timer: timerInSeconds,
                  isDoing: true,
                  totalTimeLocal: timerInSeconds,
                  lastUpdateTime: Date.now(),
                }),
              );
              saveJsonData(0, kpiinfo.id || 3, TODAY, dataUpdate);
            }
          },
        );
      }
      setIsDoing(true);
      await setLoading(false);
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    LoadData();
  }, [data?.scheduleSysCode]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => { });
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime <= 1 ? 0 : prevTime - 1;
        if (newTime === 0) {
          clearInterval(intervalRef.current);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        AsyncStorage.setItem(
          'isDoingExam',
          JSON.stringify({
            timer: timeLeft,
            isDoing: true,
            totalTimeLocal: totalTime,
            lastUpdateTime: Date.now(),
          }),
        );
      }
      if (nextAppState === 'active') {
        const isDoingExam = await AsyncStorage.getItem('isDoingExam');
        const { timer, isDoing, totalTimeLocal, lastUpdateTime } =
          JSON.parse(isDoingExam) || '{}';

        const now = Date.now();
        const lastUpdate = lastUpdateTime || now;
        const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
        const newTimeLeft = Math.max(0, timer - elapsedSeconds);
        setTimeLeft(newTimeLeft);
        setTotalTime(totalTimeLocal);
        setIsDoing(isDoing);
        AsyncStorage.setItem(
          'isDoingExam',
          JSON.stringify({
            timer: newTimeLeft,
            isDoing: true,
            totalTimeLocal: totalTimeLocal,
            lastUpdateTime: now,
          }),
        );
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [timeLeft, totalTime]);

  const handlerAnswer = useCallback(
    (item, index, itemParent) => {
      setDataExam(prev => {
        const updateData = _.map(prev || [], it => {
          if (it.questionSysCode === itemParent.questionSysCode) {
            return {
              ...it,
              answerKey: item.code,
              codeDisplay: item.codeDisplay,
              isNotDone: false,
              listAnswer: _.map(it.listAnswer || [], itChild => {
                if (itChild.code === item.code) {
                  return { ...itChild };
                }
                return itChild;
              }),
            };
          }
          return it;
        });
        saveJsonData(0, kpiinfo.id || 3, TODAY, updateData);
        return updateData;
      });
      TrainingAPI.SaveAnswer(
        {
          sysCode: itemParent.sysCode,
          answerKey: item.code,
          answerContent: item.answerContent,
        },
        tokenAutoLogin,
      );
    },
    [kpiinfo.id],
  );

  const onSubmit = useCallback(async () => {
    const isConnected = await checkNetwork();
    if (!isConnected) {
      ToastError(
        'Lỗi kết nối',
        'Kết nối dữ liệu Wifi/4G không ổn định, Vui lòng kiểm tra lại',
      );
      return;
    }
    if (dataExam.filter(item => item.answerKey == '')?.length > 0) {
      MessageAcept(
        'Thông báo',
        'Bạn có câu hỏi chưa làm, hãy xem lại các câu hỏi chưa làm',
        async () => {
          const updateData = _.map(dataExam, item => {
            if (item.answerKey == '') {
              return { ...item, isNotDone: true };
            } else {
              return { ...item, isNotDone: false };
            }
          });
          setIsShowListQuestion(true);
          setDataExam(updateData);
          saveJsonData(0, kpiinfo.id || 3, TODAY, updateData);
        },
      );
    } else {
      Message('Chú ý', 'Bạn có chắc chắn muốn nộp bài không ?', async () => {
        await setLoading(true);
        const getDataExam = (await getDataByReport(0, kpiinfo.id || 3)) || {};
        await TrainingAPI.SubmitExam(
          { listQuestion: getDataExam.data },
          tokenAutoLogin,
          async result => {
            if (result.sysCode == 1) {
              await clearInterval(intervalRef.current);
              await navigation.navigate('resultExam', { data: result });
              await setLoading(false);
            } else {
              await clearInterval(intervalRef.current);
              await deleteDataRawTraining(0, kpiinfo.id || 3);
              await AsyncStorage.removeItem('isDoingExam');
              await DeviceEventEmitter.emit('reloadExam');
              await navigation.navigate('resultExam', { data: result });
              await setLoading(false);
            }
          },
          async error => {
            await clearInterval(intervalRef.current);
            await navigation.navigate('resultExam', { data: error });
            await setLoading(false);
          },
        );
      });
    }
  }, [dataExam, navigation, kpiinfo.id]);

  const onSubmitOverTime = useCallback(async () => {
    await setLoading(true);
    const getDataExam = (await getDataByReport(0, kpiinfo.id || 3)) || {};
    await TrainingAPI.SubmitExam(
      { listQuestion: getDataExam.data },
      tokenAutoLogin,
      async result => {
        if (result.sysCode == 1) {
          await clearInterval(intervalRef.current);
          await navigation.navigate('resultExam', { data: result });
          await setLoading(false);
        } else {
          await deleteDataRawTraining(0, kpiinfo.id || 3);
          await AsyncStorage.removeItem('isDoingExam');
          await DeviceEventEmitter.emit('reloadExam');
          await navigation.navigate('resultExam', { data: result });
          await setLoading(false);
        }
      },
      async error => {
        await clearInterval(intervalRef.current);
        await navigation.navigate('resultExam', { data: error });
        await setLoading(false);
      },
    );
  }, [dataExam, navigation, kpiinfo.id]);

  const handlerFlagQuestion = data => {
    setDataExam(data);
  };

  const onGotoQuestion = index => {
    flatListRef.current.scrollToIndex({ index: index, animated: true });
  };

  const renderItemNoAnswer = useCallback(
    ({ item, index }) => {
      const mainIndex = _.findIndex(
        dataExam,
        question => question.questionSysCode === item.questionSysCode,
      );
      return (
        <TouchableOpacity
          style={[
            styles.containerNoAnswer,
            {
              backgroundColor: item.isFlag ? appcolor.primary : appcolor.light,
              borderColor: item.isNotDone ? appcolor.danger : appcolor.surface,
            },
          ]}
          onPress={() => onGotoQuestion(mainIndex)}
          key={index}
        >
          <View style={styles.noAnswer}>
            <Text
              style={[
                styles.textNoAnswer,
                { color: item.isFlag ? appcolor.light : appcolor.dark },
              ]}
            >
              {mainIndex + 1}
            </Text>
            <Text
              style={[
                styles.textAnswer,
                { color: item.isFlag ? appcolor.light : appcolor.primary },
              ]}
            >
              {item.codeDisplay}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [dataExam, appcolor],
  );

  const onToggleListQuestion = useCallback(() => {
    setIsShowListQuestion(!isShowListQuestion);
  }, [isShowListQuestion]);

  const onGoback = async () => {
    await AsyncStorage.removeItem('isDoingExam');
    await DeviceEventEmitter.emit('reloadExam');
    await deleteDataRawTraining(0, kpiinfo.id || 3);
    navigation.reset({
      index: 0,
      routes: [{ name: 'traineeApp', params: { isPrepareExam: true } }],
    });
  };

  const styles = StyleSheet.create({
    mainContainer: { flexGrow: 1, backgroundColor: appcolor.light },
    textQuestion: {
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      marginBottom: 8,
    },
    textAnswer: { fontSize: 11, color: appcolor.dark, width: '80%' },
    containerAnswer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.surface,
      padding: 12,
      marginBottom: 8,
    },
    iconAnswer: { marginRight: 8 },
    containerQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    containerNoAnswer: {
      marginTop: 4,
      width: 50,
      height: 50,
      marginRight: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noAnswer: { alignItems: 'center', justifyContent: 'space-between' },
    textNoAnswer: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    message: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    textAnswer: {
      fontSize: 11,
      color: appcolor.dark,
      width: '80%',
      textAlign: 'center',
      fontWeight: fontWeightBold,
    },
    containerQuestion: { width: '100%', height: '100%' },
    iconListQuestion: { width: '100%' },
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
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={data?.lessonName || dataExam[0]?.lessonName || 'Đào tạo'}
        rightFunc={isDoing && dataExam.length > 0 ? onSubmit : undefined}
        iconRight={'cloud-upload-alt'}
      />
      <TimerComponent timeLeft={timeLeft} totalTime={totalTime} />
      <TouchableOpacity
        style={styles.iconListQuestion}
        onPress={onToggleListQuestion}
      >
        <SpiralIcon
          name={isShowListQuestion ? 'caret-up' : 'caret-down'}
          type="font-awesome-5"
          size={20}
          color={appcolor.dark}
        />
      </TouchableOpacity>
      {message !== '' && message !== undefined && (
        <Text style={styles.message}>{`${message}`}</Text>
      )}
      {dataExam.length == 0 && (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: fontWeightBold,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {'Không thể lấy dữ liệu bài thi, nhấn về trang chủ để quay lại'}
          </Text>
          <TouchableOpacity onPress={onGoback}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: fontWeightBold,
                color: appcolor.primary,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {'Về trang chủ'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {isShowListQuestion && (
        <View>
          <FlatList
            data={dataExam}
            renderItem={renderItemNoAnswer}
            keyExtractor={(_, index) => index.toString()}
            numColumns={5}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 8,
            }}
          />
        </View>
      )}
      <View style={styles.containerQuestion}>
        <FlashList
          extraData={[dataExam]}
          estimatedItemSize={100}
          ref={flatListRef}
          data={dataExam}
          renderItem={({ item, index }) => (
            <QuestionItem
              key={item.questionSysCode}
              data={dataExam}
              item={item}
              index={index}
              onFlagQuestion={handlerFlagQuestion}
              onAnswerPress={handlerAnswer}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ paddingBottom: deviceHeight / 1.2 }} />
          }
          contentContainerStyle={{ padding: 12 }}
        />
      </View>
    </View>
  );
};

export default React.memo(TrainingExam);
