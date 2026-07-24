import React, { useCallback, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { deviceWidth } from '../../Themes/AppsStyle';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomSlideViewProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Width of each slide. Defaults to 80% of screen width. */
  slideWidth?: number;
  /** Gap between slides in dp. Defaults to 12. */
  gap?: number;
  /** Horizontal padding around the carousel. Defaults to 16. */
  horizontalPadding?: number;
  showDots?: boolean;
  containerStyle?: ViewStyle;
  slideStyle?: ViewStyle;
  onSlideChange?: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function CustomSlideView<T>({
  data,
  renderItem,
  slideWidth = deviceWidth * 0.8,
  gap = 12,
  horizontalPadding = 16,
  showDots = true,
  containerStyle,
  slideStyle,
  onSlideChange,
}: CustomSlideViewProps<T>) {
  const { appcolor } = useSelector((state: any) => state.GAppState);
  const activeIndex = useRef(0);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const snapInterval = useMemo(() => slideWidth + gap, [slideWidth, gap]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { width: '100%', ...containerStyle },
        carousel: { width: '100%' },
        carouselContent: {
          paddingHorizontal: horizontalPadding,
          gap,
          alignItems: 'center',
        },
        slide: { width: slideWidth, overflow: 'hidden', ...slideStyle },
        dotsRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 8,
          gap: 6,
        },
        dot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: appcolor.border ?? '#ccc',
        },
        dotActive: {
          width: 14,
          height: 6,
          borderRadius: 3,
          backgroundColor: appcolor.primary,
        },
      }),
    [appcolor, slideWidth, gap, horizontalPadding, containerStyle, slideStyle],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const [dotIndex, setDotIndex] = React.useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / snapInterval);
      const clamped = Math.max(0, Math.min(idx, data.length - 1));
      if (clamped !== activeIndex.current) {
        activeIndex.current = clamped;
        if (showDots) setDotIndex(clamped);
        onSlideChange?.(clamped);
      }
    },
    [snapInterval, data.length, showDots, onSlideChange],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        nestedScrollEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.slide}>
            {renderItem(item, index)}
          </View>
        ))}
      </ScrollView>

      {showDots && data.length > 1 && (
        <View style={styles.dotsRow}>
          {data.map((_, i) => (
            <View
              key={i}
              style={i === dotIndex ? styles.dotActive : styles.dot}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default CustomSlideView;
