import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { deviceWidth, fontWeightBold } from '../../Themes/AppsStyle';
import { GetSpiralForm } from '../../Controller/AdhocController';
import {
  ColorRand,
  StringTobase64,
  GetEmployeeInfo,
  removeVietnameseTones,
} from '../../Core/Helper';
import { ListItem, Avatar, Divider } from '@rneui/themed';
import WebViewUI from '../../Content/WebViewUI';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import moment from 'moment';
import CustomListView from '../../Control/Custom/CustomListView';
import WebViewScreen from '../../Control/Webview/WebViewScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AdhocList = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const { workinfo, titlePage, reportId } = route?.params || {};
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const [urlForm, setUrlForm] = useState('');
  const [itemSelected, setItemSelected] = useState({});
  const [visibleBS, setVisibleBS] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await GetSpiralForm(workinfo?.shopId);
    setData(data || []);
    setRefreshing(false);
  };
  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);
  const handleDisplayFormDetail = async item => {
    if (item.inApp !== 0) {
      navigation.navigate('adhocDetail', {
        formData: item?.formData || [],
        title: item.title,
        shopinfo: workinfo || {},
        publicKey: item.accessKey || '',
        webUrl: item.webUrl || '',
        isSubmitted: item.inApp === 2,
      });
    } else {
      const userInfo = await GetEmployeeInfo();
      let shareData = {
        accountId: userInfo.accountId,
        employeeId: userInfo.employeeId,
        employeeName: removeVietnameseTones(userInfo.employeeName),
        shopId: workinfo?.shopId || 0,
      };
      shareData = StringTobase64(JSON.stringify(shareData));
      setUrlForm(item.publicUrl + '&appShare=' + shareData);
      setItemSelected(item);
      setVisibleBS(true);
    }
  };
  const renderItem = useCallback(({ item, index }) => {
    return (
      <ListItem
        key={index}
        bottomDivider
        containerStyle={{ backgroundColor: appcolor.light }}
      >
        <TouchableOpacity
          onPress={() => handleDisplayFormDetail(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Avatar
            size="medium"
            backgroundColor={ColorRand(index)}
            rounded
            title={(index + 1).toString()}
          />
          <ListItem.Content style={{ marginLeft: 16 }}>
            <ListItem.Title
              style={{
                color: appcolor.dark,
                fontSize: 14,
                fontWeight: fontWeightBold,
              }}
            >
              {item.title}
            </ListItem.Title>
            <ListItem.Subtitle
              style={{
                fontSize: 12,
                color: appcolor.greylight,
                fontWeight: '500',
              }}
            >
              {item.subTitle}
            </ListItem.Subtitle>
            <Text
              style={{
                alignSelf: 'flex-end',
                textAlign: 'right',
                color: appcolor.greylight,
                fontSize: 11,
                fontStyle: 'italic',
              }}
            >
              {moment(item.createDate).calendar()}
            </Text>
          </ListItem.Content>
        </TouchableOpacity>
      </ListItem>
    );
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      backgroundColor: appcolor.light,
      height: '100%',
      width: deviceWidth,
      shadowOpacity: 0.7,
      shadowRadius: 10,
      marginTop: 0,
      overflow: 'hidden',
      borderWidth: 0,
      marginLeft: 0,
      marginRight: 0,
    },
  });
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.mainContainer}>
        <HeaderCustom
          leftFunc={() => navigation.goBack()}
          title={kpiinfo?.menuNameVN || 'Adhoc'}
        />
        <CustomListView
          data={data}
          extraData={data}
          renderItem={renderItem}
          onRefresh={loadData}
        />
      </View>
      <Modal
        visible={visibleBS}
        presentationStyle="fullScreen"
        statusBarTranslucent
        backdropColor={appcolor.black}
        style={{ flex: 1, backgroundColor: appcolor.black }}
        animationType="fade"
      >
        <SafeAreaProvider>
          <WebViewScreen
            pageName={itemSelected.title}
            urlPage={urlForm}
            isConfirmExits={false}
            onClose={() => setVisibleBS(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default AdhocList;
