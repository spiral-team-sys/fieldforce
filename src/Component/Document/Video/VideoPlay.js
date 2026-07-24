import React, { useRef, useState, useEffect } from 'react';
import Video from 'react-native-video';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Text,
} from 'react-native';
// import Orientation from 'react-native-orientation-locker';
import { Icon, Slider } from '@rneui/themed';
import { deviceWidth, scaleSize } from '../../../Themes/AppsStyle';
import { LoadingView } from '../../../Control/ItemLoading';
import { LogDataToServer } from '../../../API/NotificationAPI';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { MessageAction2 } from '../../../Core/Helper';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const VideoPlay = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const url = route.params.urlVideo;
  const item = route.params.item;
  const _guid = route.params.guid;
  const refVideo = useRef();
  const [duration, setDuration] = useState({
    numDuration: 0,
    minuteDuration: 0,
    secondsDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(true); // Trạng thái phát/tạm dừng
  const [_mutate, setMutate] = useState(false);
  const [configView, setConfigView] = useState({
    ConditionView: 0,
    IsViewVideo: 0,
  });
  const [isReloadSlider, setReloadSlider] = useState(false);
  const [isHideTool, setIsHideTool] = useState(false);

  const currentTimeRef = useRef(0); // Thời gian hiện tại không gây re-render

  const onBuffer = e => {
    console.log(e);
  };
  const videoError = e => {
    console.log(e);
    alert('Lỗi truy xuất video');
  };
  const onLoadStart = () => {
    // setLoading(false)
  };

  // Xử lý khi video đang phát
  const handleProgress = _.throttle(data => {
    if (
      Math.abs(data.currentTime - currentTimeRef.current) > 0.7 ||
      (currentTimeRef.current < duration.numDuration &&
        duration.numDuration - currentTimeRef.current < 2) ||
      data.currentTime == duration.numDuration
    ) {
      currentTimeRef.current =
        data.currentTime >= duration.numDuration
          ? duration.numDuration
          : data.currentTime; // Lưu thời gian hiện tại vào ref
      currentTimeRef.progressPercentage =
        data.currentTime >= duration.numDuration
          ? 100
          : (Math.floor(data.currentTime) / Math.floor(duration.numDuration)) *
          100;
      currentTimeRef.currentMinute =
        data.currentTime >= duration.numDuration
          ? duration.minuteDuration
          : Math.floor(data.currentTime / 60) == 0
            ? '00'
            : Math.floor(data.currentTime / 60);
      currentTimeRef.currentSeconds =
        data.currentTime >= duration.numDuration
          ? duration.secondsDuration
          : Math.floor(data.currentTime % 60) < 10
            ? '0' + Math.floor(data.currentTime % 60)
            : Math.floor(data.currentTime % 60);

      if (
        configView.ConditionView > 0 &&
        currentTimeRef.progressPercentage >= (configView.ConditionView || 0) &&
        configView.IsViewVideo != 1
      ) {
        configView.IsViewVideo = 1;
        route.params.item.IsViewVideo = 1;
        handleReloadSlider();
      }
      if (currentTimeRef.progressPercentage == 100) {
        currentTimeRef.current = data.currentTime;
      }
      if (
        data.currentTime >= duration.numDuration ||
        currentTimeRef.progressPercentage == 100
      ) {
        setPaused(true);
        refVideo.current.setNativeProps({ paused: true });
      }
      setMutate(e => !e);
    }
  }, 500);
  const handleReloadSlider = async () => {
    await setReloadSlider(true);
    LogDataToServer(5, JSON.stringify(item), 'LOG_VIEW');
    await setTimeout(async () => {
      await setReloadSlider(false);
    }, 10);
  };
  // Xử lý khi video sẵn sàng
  const handleLoad = data => {
    duration.numDuration = data.duration;
    duration.minuteDuration = Math.floor(data.duration / 60);
    duration.secondsDuration =
      Math.floor(data.duration % 60) < 10
        ? '0' + Math.floor(data.duration % 60)
        : Math.floor(data.duration % 60);

    const newItem = {
      ...item,
      guid: _guid,
      totalDuration: data.duration.toFixed(1) || 0,
    };
    LogDataToServer(5, JSON.stringify(newItem), 'VIDEO-START');

    refVideo.current.setNativeProps({ paused: true });
    setPaused(true);
    // setMutate(e => !e)
  };
  const handlerPlay = () => {
    if (
      Math.floor(currentTimeRef.current) >= Math.floor(duration.numDuration)
    ) {
      currentTimeRef.current = 0;
      currentTimeRef.progressPercentage = 0;
      currentTimeRef.currentMinute = '00';
      currentTimeRef.currentSeconds = '00';
      refVideo.current.seek(0);
    }
    if (refVideo.current) {
      setPaused(!paused);
      refVideo.current.setNativeProps({ paused: !paused }); // Hoặc false để phát
    }
    setMutate(e => !e);
  };
  const onChangeValueSlider = valueSlider => {
    const slideValue =
      valueSlider == duration.numDuration
        ? duration.numDuration
        : Math.floor(valueSlider);

    currentTimeRef.current =
      valueSlider >= duration.numDuration ? duration.numDuration : valueSlider; // Lưu thời gian hiện tại vào ref
    currentTimeRef.progressPercentage =
      valueSlider >= duration.numDuration
        ? 100
        : (valueSlider / duration.numDuration) * 100;
    currentTimeRef.currentMinute =
      valueSlider >= duration.numDuration
        ? duration.minuteDuration
        : Math.floor(valueSlider / 60) == 0
          ? '00'
          : Math.floor(valueSlider / 60);
    currentTimeRef.currentSeconds =
      valueSlider >= duration.numDuration
        ? duration.secondsDuration
        : Math.floor(valueSlider % 60) < 10
          ? '0' + Math.floor(valueSlider % 60)
          : Math.floor(valueSlider % 60);

    refVideo.current.seek(slideValue);
    setMutate(e => !e);
  };

  const handleOnBackView = () => {
    setPaused(true);
    refVideo.current.setNativeProps({ paused: true }); // Hoặc false để phát
    if (configView.IsViewVideo !== 1) {
      MessageAction2(
        'Bạn chưa xem hết video, có muốn thoát màn hình xem video không?',
        () => {
          navigation.goBack();
        },
        () => {
          setPaused(false);
          refVideo.current.setNativeProps({ paused: false }); // Hoặc false để phát
        },
      );
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    configView.ConditionView = item.ConditionView || 0;
    configView.IsViewVideo = item.IsViewVideo || 0;
    // Orientation.lockToLandscape();
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        !isHideTool && setIsHideTool(true);
      }, 10000);
    }, 2000);
    return () => {
      LogDataToServer(
        5,
        JSON.stringify({
          ...item,
          guid: _guid,
          totalDuration: duration.numDuration.toFixed(1) || 0,
        }),
        'VIDEO-STOP',
      );
      // Orientation.lockToPortrait();
      return false;
    };
  }, []);

  const handlePressScreen = () => {
    const isNewStatusView = !isHideTool;
    setIsHideTool(isNewStatusView);
    setTimeout(() => {
      !isNewStatusView && setIsHideTool(true);
    }, 10000);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden />

      <TouchableOpacity
        onPress={() => handleOnBackView()}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}
      >
        <SpiralIcon name="close" raised size={scaleSize(13)} />
      </TouchableOpacity>
      <Video
        source={{ uri: url }} // Can be a URL or a local file.
        ref={refVideo}
        resizeMode="contain"
        pictureInPicture={true}
        onLoadStart={onLoadStart}
        fullscreenOrientation="landscape"
        style={{ flex: 1 }} // Store reference
        onVideoBuffer={onBuffer} // Callback when remote video is buffering
        onVideoError={videoError} // Callback when video cannot be loaded
        onEnd={() => setPaused(!true)}
        onProgress={handleProgress} // Không gây re-render
        onLoad={handleLoad}
      />
      <TouchableOpacity
        onPress={() => handlePressScreen()}
        activeOpacity={1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: appcolor.transparent,
          padding: 20,
          alignItems: 'center',
          width: '100%',
        }}
      >
        {!isHideTool && (
          <TouchableOpacity
            activeOpacity={1}
            style={{ position: 'absolute', bottom: 20 }}
          >
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: deviceWidth - 40,
                height: '100%',
                borderRadius: 12,
              }}
            >
              {!loading && (
                <View
                  style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 3,
                    height: 40,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <View
                    style={{
                      width: '15%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14 }}>
                      {`${currentTimeRef.currentMinute || '00'}:${currentTimeRef.currentSeconds || '00'
                        }`}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 5,
                      borderRadius: 3,
                      width: `70%`,
                      justifyContent: 'center',
                    }}
                  >
                    {!isReloadSlider && (
                      <Slider
                        disabled={configView.IsViewVideo !== 1}
                        value={currentTimeRef.current || 0}
                        style={{ height: 0 }}
                        maximumValue={duration.numDuration || 0}
                        minimumValue={0}
                        animationType="spring"
                        step={0.9}
                        allowTouchTrack={false}
                        onSlidingComplete={onChangeValueSlider}
                        minimumTrackTintColor={appcolor.primary}
                        maximumTrackTintColor={appcolor.surface}
                        trackStyle={{ height: 4, backgroundColor: 'red' }}
                        thumbStyle={{
                          height: 12,
                          width: 12,
                          backgroundColor: 'transparent',
                        }}
                        thumbProps={{
                          children: (
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 50,
                                backgroundColor: appcolor.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            ></View>
                          ),
                        }}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      width: '15%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14 }}>
                      {`${Math.floor(duration.minuteDuration)}:${Math.floor(
                        duration.secondsDuration,
                      )}`}
                    </Text>
                  </View>
                </View>
              )}
              <View
                style={{
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: '100%',
                }}
              >
                <TouchableOpacity
                  onPress={() => handlerPlay()}
                  style={{ width: '30%' }}
                >
                  <SpiralIcon
                    name={paused ? 'play' : 'pause'}
                    size={30}
                    color="#fff"
                    type="font-awesome-5"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <LoadingView
        isLoading={loading}
        containerStyle={{
          height: 30,
          width: 30,
          position: 'absolute',
          top: '50%',
        }}
      />
    </SafeAreaView>
  );
};
