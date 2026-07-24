import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export const IconAnimation = ({ isLoop, sourceIcon }) => {
  const ref = useRef();

  const playAnimation = () => {
    ref?.current.play() || null;
  };

  useEffect(() => {
    const _loopview = playAnimation();
    return () => _loopview;
  }, [isLoop]);

  return (
    <LottieView
      ref={ref}
      style={{
        width: 24,
        height: 24,
        backgroundColor: 'rgb(241,242,247)',
        borderRadius: 20,
      }}
      loop={isLoop}
      source={sourceIcon}
    />
  );
};
