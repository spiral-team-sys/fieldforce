import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { normalize } from '../../Utils/scale';

export function useInputStyle() {
  const appcolor = useSelector(state => state.GAppState.appcolor);

  return useMemo(() => {
    const base = { color: appcolor.dark, flex: 1, padding: normalize(8) };
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version;

      if (androidVersion >= 35) {
        return StyleSheet.create({
          input: {
            ...base,
            paddingVertical: normalize(6),
          },
        });
      }
    }
    return StyleSheet.create({
      input: {
        ...base,
        paddingVertical: normalize(8),
      },
    });
  }, []);
}
