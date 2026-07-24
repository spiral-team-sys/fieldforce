import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import PageHeader from '../../Content/PageHeader';
import { appcolor } from '../../Themes/AppColor';

const ReportDisplay = ({ navigation, route }) => {
  const [isLoading, setLoading] = useState(false);
  const [mData, setData] = useState([]);
  const [mDataMain, setDataMain] = useState([]);

  const LoadData = async () => {};

  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({});

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <PageHeader
        Title={route?.params?.titlePage}
        leftclick={() => navigation.goBack()}
        //rightclick={isOldDay ? null : !isUpload ? UploadData : null}
        righticon="cloud-upload-alt"
      />
      <View></View>
    </KeyboardAvoidingView>
  );
};

export default ReportDisplay;
