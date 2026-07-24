import React from 'react';
import { StyleSheet, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import SummaryFilterSortPanel from './SummaryFilterSortPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SummaryFilterSortSheet = ({ id, appcolor, value, onChange }) => {
  const insets = useSafeAreaInsets();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: appcolor.light,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 24,
    },
    content: {
      padding: 10,
      paddingTop: 14,
    },
  });

  return (
    <ActionSheet
      id={id}
      containerStyle={StyleSheet.flatten([
        styles.container,
        { paddingBottom: insets.bottom },
      ])}
      gestureEnabled
    >
      <View style={styles.content}>
        <SummaryFilterSortPanel
          appcolor={appcolor}
          value={value}
          onChange={onChange}
          isSheet
        />
      </View>
    </ActionSheet>
  );
};

export default SummaryFilterSortSheet;
