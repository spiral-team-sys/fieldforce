import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { ScreenList } from '../Page/ScreenList';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ScreenCreate } from '../Page/ScreenCreate';
import { deviceHeight } from '../../../Core/Utility';
import { ScreenListManager } from '../Page/ScreenListManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeReportStatusIssueManager = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [typeAction, _setTypeAction] = useState({ type: 'UPDATE', item: {} });
  const [_mutate, setMutate] = useState(false);
  // Handler
  const onBack = () => {
    navigation.goBack();
  };
  const onCreate = () => {
    typeAction.type = 'PLUS';
    typeAction.item = {};
    setMutate(e => !e);
    SheetManager.show('createissue');
  };
  const onUpdate = item => {
    typeAction.type = 'UPDATE';
    typeAction.item = item;
    setMutate(e => !e);
    //
    SheetManager.show('createissue');
  };
  //
  useEffect(() => {
    const _updateissue = DeviceEventEmitter.addListener(
      'UPDATE_ISSUE_ITEM',
      onUpdate,
    );
    return () => {
      _updateissue.remove();
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    inputSearchContainer: { margin: 8, padding: 5 },
    titleSearchStyle: { fontSize: 13, color: appcolor.dark },
    contentMain: { width: '100%', height: '100%' },
    contentCreate: { width: '100%', height: '100%' },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={onBack}
        // iconRight='notes-medical'
        // rightFunc={onCreate}
      />
      {/* // Content Data */}
      <View style={styles.contentMain}>
        <ScreenListManager key="listissuemanager" />
        <ActionSheet
          id="createissue"
          closeOnTouchBackdrop={false}
          closeOnPressBack={false}
          containerStyle={{
            width: '100%',
            height: deviceHeight / 1.4,
            paddingBottom: insets.bottom,
          }}
        >
          <ScrollView
            style={styles.contentCreate}
            showsVerticalScrollIndicator={false}
          >
            <ScreenCreate type={typeAction.type} itemMain={typeAction.item} />
          </ScrollView>
        </ActionSheet>
      </View>
    </View>
  );
};
