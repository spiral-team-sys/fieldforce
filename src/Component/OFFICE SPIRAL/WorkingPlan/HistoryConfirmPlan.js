import React from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

export const HistoryConfirmPlan = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);

  useEffect(() => {
    return () => false;
  }, []);

  return <View></View>;
};
