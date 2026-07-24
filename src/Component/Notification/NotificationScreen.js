import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  getDataNotify,
  makeReadAllNotify,
  readNotifyUpdate,
} from '../../Controller/NotificationController';
import { alertConfirm, minWidthTab } from '../../Core/Utility';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { Avatar, Text } from '@rneui/base';
import { ColorRand, GetEmployeeInfo, StringTobase64 } from '../../Core/Helper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTab from '../../Control/Custom/CustomTab';
import CustomListView from '../../Control/Custom/CustomListView';
import WebViewScreen from '../../Control/Webview/WebViewScreen';
import useNotification from '../../Hooks/useNotification';
import InAppView from './Modal/Page/InAppView';
import moment from 'moment';
import _ from 'lodash';

const NotificationScreen = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { handlerCountNotification } = useNotification();
  const [isLoading, setLoading] = useState(true);
  const [itemInApp, setItemInApp] = useState({ showInApp: false, id: 0 });
  const [itemLink, setItemLink] = useState({ urlPage: null, titleName: null });
  const [dataNotification, setDataNotification] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const [showInApp, setShowInApp] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  //
  const LoadData = async () => {
    await setLoading(true);
    await getDataNotify(mData => {
      const grouplist = _.unionBy(mData, 'typeReport');
      setDataGroup(grouplist);
      setDataNotification(mData);
    });
    await setLoading(false);
  };
  // Handler
  const handlerReadAll = () => {
    alertConfirm(
      'Thông báo',
      'Bạn có muốn đọc tất cả các tin nhắn',
      async () => {
        await makeReadAllNotify();
        await LoadData();
        await handlerCountNotification();
      },
    );
  };
  const handlerShowDetail = async item => {
    if (item.typeReport == 'InApp') {
      if (item.hyperLinks !== null) {
        await onShowLinks(item.hyperLinks, item.title, item);
      } else {
        await setItemInApp(item);
        await setShowInApp(true);
      }
    } else {
      await onShowLinks(item.hyperLinks, item.title, item);
    }
  };
  // Actions
  const onShowNotification = async item => {
    item.seen = 1;
    setMutate(e => !e);
    //
    await handlerCountNotification();
    await readNotifyUpdate(item.id);
    if (item.typeReport == 'InApp') {
      await setItemInApp(item);
      await setShowInApp(true);
    } else {
      navigation.navigate('NotificationDetail', item);
    }
  };
  const onShowLinks = async (hyperLink, titlePage, item) => {
    let url_view = '';
    if (hyperLink.includes('http') || hyperLink.includes('https')) {
      const EmployeeInfo = await GetEmployeeInfo();
      const shareInfo = {
        employeeId: EmployeeInfo.employeeId,
        employeeName: EmployeeInfo.employeeName,
        accountId: EmployeeInfo.accountId,
        typeId: EmployeeInfo.typeId,
        loginName: EmployeeInfo.loginName,
        mobile: EmployeeInfo.mobile,
      };
      if (
        hyperLink.includes('spiral.com.vn') ||
        hyperLink.includes('sucbat.com.vn')
      ) {
        const app_access = StringTobase64(JSON.stringify(shareInfo));
        url_view = hyperLink.includes('?')
          ? `${hyperLink}&appShare=${app_access}`
          : `${hyperLink}?appShare=${app_access}`;
      } else {
        url_view = hyperLink;
      }
      setItemLink({ titleName: titlePage, urlPage: url_view });
      setShowNotificationSheet(true);
    } else if (hyperLink.includes('Upload/')) {
      await setItemInApp(item);
      await setShowInApp(true);
    } else {
      navigation.navigate(hyperLink);
    }
  };
  const onBack = () => {
    navigation.goBack();
  };
  const onCloseInApp = () => {
    setShowInApp(false);
  };
  const onCloseDetails = () => {
    setItemLink({ urlPage: null, titleName: null });
    setShowNotificationSheet(false);
  };
  useEffect(() => {
    LoadData();
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    contentMain: { flex: 1, backgroundColor: appcolor.light },
    headerTab: { backgroundColor: appcolor.primary },
    labelTabStyle: { fontSize: 14, color: appcolor.light, fontWeight: '500' },
    indicatorStyle: { backgroundColor: appcolor.light },
    tabStyle: { minWidth: minWidthTab(dataGroup), height: 38 },
    tabContainer: { backgroundColor: appcolor.primary },
    contentTabItem: { flex: 1 },
    containerTabStyle: { flex: 1, backgroundColor: appcolor.light },
    itemNotification: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      padding: 8,
      margin: 8,
      marginBottom: 0,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 1 },
      shadowColor: appcolor.grayLight,
      shadowRadius: 8,
    },
    viewNumber: { marginRight: 8 },
    contentTitle: { width: '90%' },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    bodyName: { fontSize: 12, fontWeight: '500', color: appcolor.greydark },
    dateName: { fontSize: 11, color: appcolor.greylight, fontStyle: 'italic' },
    viewReadNow: { paddingHorizontal: 8 },
    readNow: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      textDecorationLine: 'underline',
      color: appcolor.bluenavylight,
      textAlign: 'right',
    },
    contentSheet: { width: '100%', height: '100%' },
  });

  const renderTabContent = item => {
    const data = _.filter(dataNotification, { typeReport: item.typeReport });
    return (
      <View style={styles.contentTabItem}>
        <CustomListView
          data={data}
          extraData={data}
          renderItem={renderItem}
          bottomView={{ paddingBottom: 164 }}
        />
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const onPress = () => onShowNotification(item);
    const onPressDetail = () => handlerShowDetail(item);
    const seened = item.seen == 1;
    return (
      <TouchableOpacity
        style={{
          ...styles.itemNotification,
          backgroundColor: seened ? appcolor.light : appcolor.grayLight,
        }}
        onPress={onPress}
      >
        <Avatar
          title={`${index + 1}`}
          rounded
          size="small"
          containerStyle={{
            ...styles.viewNumber,
            backgroundColor: ColorRand(index),
          }}
        />
        <View style={styles.contentTitle}>
          <Text style={styles.titleName}>{item.title}</Text>
          <Text style={styles.bodyName} numberOfLines={3} ellipsizeMode="tail">
            {item.body || `Nhấn vào để xem chi tiết`}
          </Text>
          <Text style={styles.dateName}>
            {moment(item.createdDate).fromNow()}
          </Text>
          {item.hyperLinks && (
            <TouchableOpacity
              style={styles.viewReadNow}
              onPress={onPressDetail}
            >
              <Text style={styles.readNow}>{`Xem ngay`}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  if (isLoading)
    return <ActivityIndicator color={appcolor.primary} size={'small'} />;
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={'Thông báo'}
        iconRight="clipboard-check"
        rightFunc={handlerReadAll}
        leftFunc={onBack}
      />
      <View style={styles.contentMain}>
        <CustomTab
          keyTabName="typeReport"
          data={dataGroup}
          dataMain={dataNotification}
          scrollEnabled={true}
          renderItem={renderTabContent}
        />
      </View>
      <Modal
        visible={showInApp}
        animationType="fade"
        onRequestClose={onCloseInApp}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <InAppView
            isViewDetail={1}
            inAppId={itemInApp.id}
            onClose={onCloseInApp}
          />
        </SafeAreaProvider>
      </Modal>
      <Modal
        visible={showNotificationSheet}
        animationType="fade"
        onRequestClose={onCloseDetails}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: appcolor.primary }}>
            <WebViewScreen
              pageName={itemLink?.titleName}
              urlPage={itemLink?.urlPage}
              onClose={onCloseDetails}
            />
          </View>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default NotificationScreen;
