import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { alertConfirm } from '../Core/Utility';
import SpiralIcon from './Icon/SpiralIcon';

export const CountTimeAutoTake = ({
  cameraConfig,
  time,
  actionResult,
  disabled,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [timeTake, setTimeTake] = useState(0);
  const [startTime, setStartTime] = useState(false);
  const [isPressCamera, setPressCamera] = useState(false);

  const startCountDown = async () => {
    if (cameraConfig?.isChangeTake || false) {
      if (isPressCamera) {
        pressCamera();
      } else {
        alertConfirm(
          'Chấm công',
          `Nếu chọn tự động máy ảnh sẽ tự động chụp sau ${time} giây hoặc bạn sẽ bấm chụp bằng nút`,
          async () => {
            await setStartTime(true);
            await setTimeTake(time);
          },
          () => {
            setPressCamera(true);
          },
          'Tự động',
          'Tự chụp',
        );
      }
    } else {
      alertConfirm(
        'Chấm công',
        `Máy ảnh sẽ tự động chụp sau ${time} giây, Vui lòng đưa khuôn mặt vào máy ảnh để thực hiện chấm công`,
        async () => {
          await setStartTime(true);
          await setTimeTake(time);
        },
        null,
        'Đồng ý',
        'Hủy',
      );
    }
  };

  const pressCamera = () => {
    setPressCamera(false);
    actionResult();
  };

  useEffect(() => {
    if (startTime) {
      if (timeTake > 0) {
        const interval = setInterval(() => {
          setTimeTake(timeTake - 1);
        }, 1000);
        return () => clearInterval(interval);
      } else {
        pressCamera();
      }
    }
  }, [timeTake]);

  const styles = StyleSheet.create({
    mainContainer: {
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: appcolor.yellowdark,
    },
    placeholderText: {
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.dark,
      padding: 8,
    },
    viewTime: {
      minWidth: 60,
      minHeight: 60,
      backgroundColor: appcolor.white,
      borderRadius: 50,
      justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
    },
    titleTime: {
      fontSize: 38,
      fontWeight: '700',
      color: appcolor.black,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity onPress={startCountDown} disabled={disabled}>
      <View style={styles.viewTime}>
        {timeTake > 0 ? (
          <Text style={styles.titleTime}>{timeTake}</Text>
        ) : (
          <SpiralIcon
            name="camera"
            type="ionicon"
            size={32}
            color={appcolor.dark}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
