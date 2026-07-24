import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { REPORT } from '../../../API/ReportAPI';
import { toastError } from '../../../Utils/configToast';
import { LoadingView } from '../../../Control/ItemLoading';
import PlanEvaluation from './Page/PlanEvaluation';

const EvaluationPermisionScreen = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);

  const LoadData = async () => {};

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Đánh giá nhân viên'}
        leftFunc={onBack}
      />
      <PlanEvaluation />
    </View>
  );
};

export default EvaluationPermisionScreen;
