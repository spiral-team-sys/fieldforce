import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MenuPSVHeader = ({ appcolor, menuCount }) => {
  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>PSV WORKSPACE</Text>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Chức năng</Text>
        <View style={styles.viewCount}>
          <Text style={styles.count}>{`${menuCount} tiện ích`}</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    header: {
      marginHorizontal: 12,
      marginTop: 10,
      marginBottom: 14,
      padding: 15,
      borderRadius: 18,
      backgroundColor: appcolor.primary,
    },
    eyebrow: {
      color: appcolor.white,
      opacity: 0.7,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    title: {
      color: appcolor.white,
      fontSize: 18,
      fontWeight: '800',
    },
    count: {
      color: appcolor.white,
      fontSize: 11,
      fontWeight: '700',
    },
    viewCount: {
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.16)',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
  });

export default memo(MenuPSVHeader);
