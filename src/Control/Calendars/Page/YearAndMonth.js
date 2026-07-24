import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

export const YearAndMonth = ({}) => {
  const { appcolor } = useSelector(state => state.GAppState);

  useEffect(() => {}, []);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
  });

  return <View style={styles.mainContainer}></View>;
};
