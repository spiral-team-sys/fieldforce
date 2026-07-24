import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { CONTENT_COLOR } from '../../Core/URLs';
import WavyHeader from './WavyHeader';

export default function ScreenOne() {
  return (
    <View style={styles.container}>
      <WavyHeader customStyles={styles.svgCurve} flip={false} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Work Menu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svgCurve: {
    position: 'absolute',
    width: Dimensions.get('window').width,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    marginTop: 50,
    marginHorizontal: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: CONTENT_COLOR,
    textAlign: 'center',
    marginTop: 35,
  },
});
