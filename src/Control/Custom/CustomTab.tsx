import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import type {
  CollapsibleRef,
  OnTabChangeCallback,
} from 'react-native-collapsible-tab-view';
import {
  deviceHeight,
  deviceWidth,
  fontWeightBold,
} from '../../Themes/AppsStyle';
import { minWidthTab } from '../../Core/Utility';
import { useSelector } from 'react-redux';

interface CustomTabProps {
  keyTabName?: string;
  data?: Record<string, unknown>[];
  dataMain?: Record<string, unknown>[];
  initialTabName?: string;
  scrollEnabled?: boolean;
  renderItem?: (
    item: Record<string, unknown>,
    index: number,
  ) => React.ReactNode;
  onTabChange?: OnTabChangeCallback;
  tabRef?: React.RefObject<CollapsibleRef> | null;
}

const CustomTab = ({
  keyTabName = 'ItemName',
  data = [],
  dataMain = [],
  initialTabName,
  scrollEnabled = true,
  renderItem,
  onTabChange,
  tabRef = null,
}: CustomTabProps) => {
  const { appcolor } = useSelector((state: any) => state.GAppState);
  const dataTab = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const hasData = dataTab.length > 0;

  const tabCountByName = useMemo(() => {
    if (!Array.isArray(dataMain) || dataMain.length === 0)
      return {} as Record<string, number>;
    return dataMain.reduce((acc: Record<string, number>, row) => {
      const key = `${row?.[keyTabName] ?? ''}`;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [dataMain, keyTabName]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        viewTabContainer: { width: '100%', height: '100%' },
        contentDataMain: {
          width: deviceWidth,
          height: '100%',
          paddingTop: 45,
          zIndex: 1,
        },
        labelStyle: { fontSize: 12, fontWeight: fontWeightBold },
        indicatorStyle: { backgroundColor: appcolor.primary },
        tabStyle: {
          backgroundColor: appcolor.light,
          minWidth: minWidthTab(dataTab),
          height: 42,
        },
      }),
    [appcolor, dataTab],
  );

  const renderTabBar = useCallback(
    (props: any) => (
      <MaterialTabBar
        {...props}
        scrollEnabled
        labelStyle={styles.labelStyle}
        indicatorStyle={styles.indicatorStyle}
        inactiveColor={appcolor.placeholderText}
        activeColor={appcolor.primary}
        tabStyle={styles.tabStyle}
      />
    ),
    [styles, appcolor],
  );

  const renderItemTab = () => {
    return dataTab.map((item, index) => {
      const tabName = `${item?.[keyTabName] ?? ''}`;
      const itemCount = tabCountByName[tabName] || 0;
      const titleTab =
        dataMain.length > 0 ? `${tabName} (${itemCount})` : tabName;
      return (
        <Tabs.Tab key={`${tabName}_${index}`} label={titleTab} name={titleTab}>
          <View style={styles.contentDataMain}>
            {renderItem ? renderItem(item, index) : null}
          </View>
        </Tabs.Tab>
      );
    });
  };

  if (!hasData)
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: appcolor.dark, fontSize: 13 }}>
          Không có dữ liệu
        </Text>
      </View>
    );

  return (
    <View style={styles.viewTabContainer}>
      <Tabs.Container
        ref={tabRef}
        initialTabName={initialTabName}
        pagerProps={
          {
            scrollEnabled: scrollEnabled,
            keyboardShouldPersistTaps: 'handled',
          } as any
        }
        onTabChange={onTabChange || undefined}
        renderTabBar={renderTabBar}
      >
        {renderItemTab()}
      </Tabs.Container>
    </View>
  );
};

export default CustomTab;
