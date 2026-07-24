import React, { memo, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import SpiralIcon from '../../../../../Control/Icon/SpiralIcon';

const DashboardSlide = ({ appcolor, children, item, loading }) => {
  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  return (
    <View style={styles.slideShell}>
      <LinearGradient
        colors={[appcolor.primary, appcolor.info]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slideHeader}
      >
        <View style={styles.slideHeaderRow}>
          <View style={styles.slideIcon}>
            <SpiralIcon
              name={item.icon}
              type="feather"
              size={17}
              color={appcolor.white}
            />
          </View>
          <View style={styles.slideTitleWrap}>
            <Text numberOfLines={1} style={styles.slideTitle}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={styles.slideSubtitle}>
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.slideBadge}>
            <Text numberOfLines={1} style={styles.slideBadgeText}>
              {item.type}
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.body}>{children}</View>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color={appcolor.primary} />
        </View>
      )}
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    slideShell: {
      flex: 1,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    slideHeader: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    slideHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    slideIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    slideTitleWrap: {
      flex: 1,
    },
    slideTitle: {
      color: appcolor.white,
      fontSize: 15,
      fontWeight: '800',
    },
    slideSubtitle: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 11,
      marginTop: 2,
    },
    slideBadge: {
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.16)',
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    slideBadgeText: {
      color: appcolor.white,
      fontSize: 10,
      fontWeight: '700',
    },
    body: {
      flex: 1,
      backgroundColor: appcolor.light,
    },
    loading: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: appcolor.loadingContent,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
  });

export default memo(DashboardSlide);
