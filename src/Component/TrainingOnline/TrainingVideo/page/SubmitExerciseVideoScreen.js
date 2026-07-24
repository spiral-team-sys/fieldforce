import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import Video from 'react-native-video';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { Button, Text, Card, Icon } from '@rneui/base';
import {
  MessageInfo,
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../../../../Core/Helper';
// import moment from 'moment';
import {
  TODAY,
  alertConfirm,
  alertWarning,
  getFilePathFromContentUri,
  type,
} from '../../../../Core/Utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadController from '../../../../Controller/UploadController';

import { TouchableOpacity } from 'react-native';
import { REPORT } from '../../../../API/ReportAPI';
import { URLDEFAULT } from '../../../../Core/URLs';
import { Video as VideoCompress } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { ProgressView } from '../control/ProgressView';
// import { launchImageLibrary } from 'react-native-image-picker';

const SubmitExerciseVideoScreen = ({ route, navigation }) => {
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const { exercise, answerId } = route.params;
  const [isProgress, setProgress] = useState(false);
  const [isUploadData, setUploadData] = useState(false);

  const [duration, setDuration] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const [dataVideo, setDataVideo] = useState({
    videoUri: null,
    duration: null,
    size: null,
    type: null,
    name: null,
    guid: null,
    videoSystem: null,
    typeAction: 'INSERT',
  });
  let oldData = {};
  let isPicking = false;

  const LoadData = async () => {
    const keyStorage = `${userinfo.employeeId}_${kpiinfo.id}_${TODAY}_${exercise.exerciseId}_TrainingVideo`;
    const dataAsync = (await AsyncStorage.getItem(keyStorage)) || '{}';
    const answerData = JSON.parse(exercise.answerData || '[]')[0] || {};
    const dataParse = answerData.videoUri ? answerData : JSON.parse(dataAsync);

    if (dataParse.videoUri) {
      const newUlr = dataParse.videoUri.includes('uploaded')
        ? URLDEFAULT + dataParse.videoUri
        : dataParse.videoUri || null;
      oldData = {
        videoUri: newUlr || null,
        duration: dataParse.duration || null,
        size: dataParse.size || null,
        type: dataParse.type || null,
        name: dataParse.name || null,
        videoSystem: answerData.videoUri ? newUlr : null,
        typeAction: answerData.videoUri ? 'UPDATE' : dataVideo.typeAction,
      };
      await setDataVideo({
        videoUri: newUlr || null,
        duration: dataParse.duration || null,
        size: dataParse.size || null,
        type: dataParse.type || null,
        name: dataParse.name || null,
        videoSystem: answerData.videoUri ? newUlr : null,
        typeAction: answerData.videoUri ? 'UPDATE' : dataVideo.typeAction,
      });
    }
  };

  useEffect(() => {
    const _load = LoadData();
    return () => {
      _load;
    };
  }, []);

  const compressAndGetSize = async videoUri => {
    try {
      const compressedUri = await VideoCompress.compress(videoUri, {
        // compressionMethod: 'auto',
        compressionMethod: 'manual',
        bitrate: 1200000, // 720p chất lượng khá
        removeAudio: false,
      });
      const fileInfo = await RNFS.stat(compressedUri);
      return { compressedUri, sizeInMB: fileInfo.size };
    } catch (error) {
      MessageInfo('❌ Lỗi nén video: ' + error);
      return null;
    }
  };

  const pickVideo = async () => {
    if (isPicking) return; // Nếu đang chọn, không làm gì cả
    isPicking = true;
    try {
      // const res = await DocumentPicker.pickSingle({
      //     type: DocumentPicker.types.video,
      // });
      const res = await pick({
        type: types.video,
      });

      await setProgress(true);

      const newUriCompress = await compressAndGetSize(res.uri);
      const fileExtension = res.name?.split('.').pop();
      const _guid = UUIDGenerator();

      const fileUri = await getFilePathFromContentUri(
        newUriCompress.compressedUri,
        `${_guid}.${fileExtension}`,
      );
      if (!fileUri) {
        MessageInfo('Lỗi khi xử lí file video ' + res.uri);
        return;
      }

      if (res.type !== 'video/mp4' && res.type !== 'video/quicktime') {
        MessageInfo('Chỉ cho phép chọn video .mp4');
        return;
      }
      if (dataVideo.videoUri == fileUri) {
        await setProgress(false);
        return;
      } else {
        dataVideo.name = res.name;
        dataVideo.size = newUriCompress.sizeInMB;
        dataVideo.type = res.type;
        dataVideo.videoUri = fileUri;
        await setProgress(false);
        await setVideoLoading(true);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        MessageInfo('Không thể chọn video.');
      }
      await setProgress(false);
    } finally {
      isPicking = false;
      await setProgress(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    content: { paddingBottom: 40 },
    card: { borderRadius: 10, padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold' },
    description: { fontSize: 14, color: appcolor.dark, marginBottom: 10 },
    note: { fontStyle: 'italic', color: appcolor.greylight },
    fileInfo: { marginTop: 10, color: 'green', fontSize: 13 },
    duration: { marginTop: 10, fontWeight: 'bold', fontSize: 14 },
    video: {
      width: '100%',
      height: 200,
      backgroundColor: appcolor.dark,
      borderRadius: 10,
      marginTop: 15,
    },
    pickButton: {
      backgroundColor: appcolor.primary,
      paddingVertical: 12,
      borderRadius: 8,
    },
  });

  const handleVideoLoad = async meta => {
    const realDurationSec = meta.duration;
    const settings = JSON.parse(exercise.settings || '[]')[0] || {};
    const minMinutes = settings.minMinutes || 1;
    const maxMinutes = settings.maxMinutes || 4;
    const minSec = minMinutes * 60;
    const maxSec = maxMinutes * 60;

    if (realDurationSec < minSec || realDurationSec > maxSec) {
      Alert.alert(
        'Video không hợp lệ',
        `Video dài ${parseInt(Math.round(realDurationSec) / 60)} phút ${
          Math.round(realDurationSec) % 60
        } giây, yêu cầu từ ${minMinutes} đến ${maxMinutes} phút.`,
      );

      await setDataVideo({ ...oldData });
      await setVideoLoading(false);
      return;
    }
    dataVideo.duration = realDurationSec;
    await setDuration(realDurationSec);
    await setVideoLoading(false);
  };

  const validData = async () => {
    if (!dataVideo.videoUri && (dataVideo.videoUri?.lenght || 0) == 0) {
      alertWarning(`Bạn chưa chọn video để gửi!`);
      return false;
    }
    if (dataVideo.videoSystem && dataVideo.videoSystem == dataVideo.videoUri) {
      alertWarning(`Video này đã được gửi lên!`);
      return false;
    }
    if (
      (dataVideo.size / (1024 * 1024)).toFixed(2) > (exercise?.limitSize || 40)
    ) {
      alertWarning(`Video có dung lượng quá lớn!`);
      return false;
    }
    return true;
  };

  const uploadData = async () => {
    const _valid = await validData();
    if (_valid) {
      const today = new Date();
      const _guid = dataVideo.guid || UUIDGenerator();
      const fileExtension = dataVideo.name.split('.').pop();
      const videoPath = `/uploaded/video/${TODAY}/${_guid}.${fileExtension}`;
      const filePath = dataVideo.videoUri.startsWith('file://')
        ? dataVideo.videoUri
        : `file://${dataVideo.videoUri}`;
      const formData = new FormData();
      formData.append('VideoDate', TODAY);
      formData.append('Video', {
        uri: filePath,
        name: dataVideo.name,
        type: dataVideo.type,
      });
      formData.append('VideoName', `${_guid}.${fileExtension}`);
      formData.append('VideoType', dataVideo.type);
      // console.log(formData, 'formDataformDataformData');

      alertConfirm(
        'Gửi dự liệu lên hệ thống',
        `Bạn có muốn gửi dữ liệu đã nhập như bên dưới không ?`,
        async () => {
          await setProgress(true);

          try {
            await UploadController.UploadVideo(
              filePath,
              formData,
              dataVideo,
              async result => {
                if (result.statusId === 200) {
                  const dataUpload = [
                    {
                      typeAction: dataVideo.typeAction || 'INSERT',
                      videoDuration: Math.round(dataVideo.duration),
                      videoSize: dataVideo.size,
                      videoPath: result.messager || videoPath,
                      videoName: dataVideo.name,
                      exerciseId: exercise.exerciseId,
                      sendDate: today,
                      videoType: dataVideo.type,
                      itemId: exercise.itemId,
                      answerId: answerId,
                    },
                  ];
                  const shop = { shopId: 0, auditDate: TODAY };
                  const uploadRealtime = await REPORT.UploadDataRaw_Realtime(
                    [...dataUpload],
                    shop,
                    kpiinfo.id,
                  );
                  if (uploadRealtime.statusId == 200) {
                    await setProgress(false);
                    await DeviceEventEmitter.emit('RELOAD_VIEW_TRAINING');
                    await navigation.goBack();
                    await ToastSuccess(
                      uploadRealtime.messager,
                      'Thông báo',
                      'top',
                    );
                  } else {
                    await setProgress(false);
                    ToastError(uploadRealtime.messager, 'Thông báo', 'top');
                  }
                }
              },
              async error => {
                console.log(error, 'errorerrorerror');
                await ToastError(
                  `${error.statusId}: ${error.messager}`,
                  'Cảnh báo',
                  'top',
                );
                await setProgress(false);
              },
            );
          } catch (e) {
            await setProgress(false);
            await MessageInfo('Đã xảy ra lỗi khi gửi Video' + '\n' + e);
          }
        },
      );
    }
  };

  const handleSelectVideo = async () => {
    await navigation.navigate('videoplay', {
      urlVideo: dataVideo.videoUri,
      item: dataVideo,
      guid: null,
      lockTracking: true,
    });
  };

  const ViewDescriptItem = () => {
    const { itemDecription } = exercise;
    const listDescription = JSON.parse(itemDecription || '[]');
    return (
      <View style={{ padding: 4 }}>
        {listDescription?.map((item, index) => (
          <View key={index} style={{ marginBottom: 4 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <SpiralIcon
                name="check-circle"
                type="feather"
                size={16}
                color={appcolor.primary}
              />
              <Text style={{ marginLeft: 6, fontWeight: '600', fontSize: 16 }}>
                {item.title}
              </Text>
            </View>
            <Text
              style={{
                marginLeft: 22,
                color: appcolor.greylight,
                lineHeight: 16,
              }}
            >
              {item.content}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Bài tập'}
        leftFunc={() => navigation.goBack()}
        iconRight="cloud-upload-alt"
        rightFunc={dataVideo.videoUri ? () => uploadData() : null}
      />
      {isProgress && (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ProgressView title={'xử lí dữ liệu Video ...'} progressSize={60} />
        </View>
      )}

      {!isProgress && (
        <ScrollView contentContainerStyle={styles.content}>
          <Card containerStyle={styles.card}>
            <Card.Title style={styles.title}>{exercise.itemName}</Card.Title>
            <Card.Divider />
            <ViewDescriptItem />
            <Button
              title="Chọn video"
              onPress={pickVideo}
              icon={
                <SpiralIcon
                  name="upload"
                  type="feather"
                  color="white"
                  style={{ marginRight: 8 }}
                />
              }
              buttonStyle={styles.pickButton}
              containerStyle={{ marginTop: 20 }}
            />
            {dataVideo.name && (
              <Text style={styles.fileInfo}>
                🎞{' '}
                <Text style={styles.fileInfo}>
                  {dataVideo.name}{' '}
                  {dataVideo.size &&
                    dataVideo.size > 0 &&
                    `- ${(dataVideo.size / (1024 * 1024)).toFixed(2)}MB`}
                </Text>
              </Text>
            )}
            {videoLoading && (
              <ActivityIndicator
                style={{ marginTop: 10 }}
                color={appcolor.primary}
              />
            )}
            {dataVideo.videoUri && (
              <>
                <TouchableOpacity onPress={() => handleSelectVideo()}>
                  <Video
                    source={{ uri: dataVideo.videoUri }}
                    paused
                    onLoad={handleVideoLoad}
                    style={styles.video}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {!videoLoading && dataVideo.duration && (
                  <Text style={styles.duration}>
                    ⏱ Thời lượng: {Math.round(dataVideo.duration)} giây (~
                    {(dataVideo.duration / 60).toFixed(0)} phút)
                  </Text>
                )}
              </>
            )}
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

export default SubmitExerciseVideoScreen;
