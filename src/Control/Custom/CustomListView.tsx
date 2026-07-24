import React, { forwardRef, memo } from 'react';
import {
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { deviceHeight } from '../../Themes/AppsStyle';

interface CustomListViewProps<T> {
  indexTab?: number;
  renderItem: FlashListProps<T>['renderItem'];
  data: T[];
  extraData?: any;
  horizontal?: boolean;
  numColumns?: number;
  ListHeader?: React.ReactNode;
  ListFooter?: React.ReactNode;
  ListEmpty?: React.ReactNode;
  bottomView?: ViewStyle;
  endView?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  onRefresh?: () => void;
  containerStyle?: ViewStyle;
  scrollEnabled?: boolean;
  pagingEnabled?: boolean;
  snapToInterval?: number;
  initialScrollIndex?: number;
  initialNumToRender?: number;
  estimatedItemSize?: number;
  stickyHeaderIndices?: number[] | null;
  contentContainerStyle?: ViewStyle;
  isRefresh?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onMomentumScrollEnd?: FlashListProps<T>['onMomentumScrollEnd'];
}

function _CustomListView<T>(
  props: CustomListViewProps<T>,
  ref: React.Ref<FlashList<T>>,
) {
  const { appcolor } = useSelector((state: any) => state.GAppState);

  const {
    indexTab,
    renderItem,
    data,
    extraData,
    horizontal = false,
    numColumns = 1,
    ListHeader,
    ListFooter,
    ListEmpty,
    bottomView,
    endView,
    showsVerticalScrollIndicator = false,
    onRefresh,
    containerStyle,
    scrollEnabled = true,
    pagingEnabled = false,
    snapToInterval,
    initialScrollIndex = 0,
    initialNumToRender = 0,
    estimatedItemSize = 125,
    stickyHeaderIndices = null,
    contentContainerStyle = {},
    isRefresh = false,
    onEndReached,
    onEndReachedThreshold = 0.5,
    onMomentumScrollEnd,
  } = props;

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, ...containerStyle },
    bottomView: { paddingBottom: deviceHeight / 3 },
    endView: { paddingEnd: 120 },
    subTitleName: {
      color: appcolor.dark,
      fontSize: 11,
      fontWeight: '500',
      padding: 8,
      textAlign: 'center',
    },
  });

  const renderItemWithTab: FlashListProps<T>['renderItem'] = params => {
    if (!renderItem) return <View />;
    const paramsWithTab = { ...params, indexTab };
    return indexTab !== undefined
      ? renderItem(paramsWithTab as any)
      : renderItem(params as any);
  };

  // HORIZONTAL LIST
  if (horizontal) {
    return (
      <View style={styles.mainContainer}>
        <FlashList<T>
          ref={ref}
          horizontal
          pagingEnabled={pagingEnabled}
          keyExtractor={(_item, index) => index.toString()}
          data={data}
          estimatedItemSize={estimatedItemSize}
          extraData={[extraData]}
          renderItem={renderItemWithTab}
          initialScrollIndex={initialScrollIndex}
          drawDistance={deviceHeight}
          showsHorizontalScrollIndicator={showsVerticalScrollIndicator}
          snapToInterval={snapToInterval}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          ListFooterComponent={
            ListFooter ? (
              <>{ListFooter}</>
            ) : (
              <View style={[styles.endView, endView]} />
            )
          }
          ListEmptyComponent={ListEmpty ? <>{ListEmpty}</> : null}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={contentContainerStyle}
        />
      </View>
    );
  }

  // VERTICAL LIST
  return (
    <View style={styles.mainContainer}>
      <FlashList<T>
        ref={ref}
        ListHeaderComponent={ListHeader ? <>{ListHeader}</> : null}
        keyExtractor={(_item, index) => index.toString()}
        data={data}
        extraData={[extraData]}
        estimatedItemSize={estimatedItemSize}
        numColumns={numColumns}
        drawDistance={deviceHeight}
        stickyHeaderIndices={stickyHeaderIndices || undefined}
        renderItem={renderItemWithTab}
        nestedScrollEnabled
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onMomentumScrollEnd={onMomentumScrollEnd}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={isRefresh} onRefresh={onRefresh} />
          ) : undefined
        }
        ListFooterComponent={
          <View style={[styles.bottomView, bottomView]}>
            {ListFooter ? ListFooter : null}
          </View>
        }
        ListEmptyComponent={
          ListEmpty ? (
            <>{ListEmpty}</>
          ) : (
            <Text style={styles.subTitleName}>Không có dữ liệu</Text>
          )
        }
        scrollEnabled={scrollEnabled}
        initialScrollIndex={initialScrollIndex}
        contentContainerStyle={contentContainerStyle}
      />
    </View>
  );
}

const CustomListView = forwardRef(_CustomListView) as <T>(
  props: CustomListViewProps<T> & { ref?: React.Ref<FlashList<T>> },
) => React.ReactElement;

export default CustomListView;
