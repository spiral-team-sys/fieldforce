import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import PageHeader from '../Content/PageHeader';
import RNQRGenerator from 'rn-qr-generator';
import { Image } from '@rneui/themed';
import SpiralIcon from '../Control/Icon/SpiralIcon';
import { appcolor } from '../Themes/AppColor';
import { DEFAULT_COLOR, TRAINING_RESULT } from '../Core/URLs';
import { alertNotify, deviceWidth } from '../Core/Utility';
import WebView from 'react-native-webview';
import { GetEmployeeInfo } from '../Core/Helper';
import moment from 'moment';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { HeaderCustom } from '../Content/HeaderCustom';

const TrainingResults = ({ navigation, route }) => {
  const [EmployeeInfo, setEmployeeInfo] = useState({});
  const [QRCodeValue, setQRCode] = useState('');
  const [LinkTraining, setLinkTraining] = useState('');

  const loadData = async () => {
    const userInfo = await GetEmployeeInfo();
    await setEmployeeInfo(userInfo);
    await setLinkTraining(
      route?.params?.shopinfo.linkTraining + route?.params?.workinfo.guiid,
    );
    RNQRGenerator.generate({
      value:
        route?.params?.shopinfo.linkTraining + route?.params?.workinfo.guiid,
      height: 300,
      width: 300,
    })
      .then(async response => {
        const { uri } = response;
        await setQRCode(uri);
      })
      .catch(error => {});
  };
  const handlerCopyLink = () => {
    alertNotify('Đã sao chép liên kết');
    Clipboard.setString(LinkTraining);
  };
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: '100%' },
    bgQRStyle: {
      width: '95%',
      height: '96%',
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.greylight,
      backgroundColor: appcolor.white,
      alignSelf: 'center',
      margin: 8,
      alignItems: 'center',
    },
  });

  useEffect(() => {
    loadData();
  }, []);
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={route?.params.titlePage}
      />
      <Tabs.Container
        renderTabBar={props => (
          <MaterialTabBar
            {...props}
            labelStyle={{ fontSize: 14, fontWeight: '600' }}
            indicatorStyle={{ backgroundColor: appcolor.primary }}
            inactiveColor={appcolor.dark}
            activeColor={appcolor.dark}
            scrollEnabled={true}
            style={{ backgroundColor: appcolor.light }}
            tabStyle={{ minWidth: deviceWidth / 2, height: 36 }}
          />
        )}
      >
        <Tabs.Tab key={'QR Code'} label={'QR Code'} name={'QR Code'}>
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
            }}
          >
            <RenderViewQRCode
              QRValue={QRCodeValue}
              LinkTraining={LinkTraining}
              style={styles}
              tabLabel={'QR Code'}
              copyLink={handlerCopyLink}
            />
          </View>
        </Tabs.Tab>
        <Tabs.Tab
          key={'Training Results'}
          label={'Training Results'}
          name={'Training Results'}
        >
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
            }}
          >
            <RenderTrainingResult
              style={styles}
              tabLabel={'Training Results'}
              EmployeeCode={EmployeeInfo.employeeCode}
              Guiid={route?.params?.workinfo.guiid}
            />
          </View>
        </Tabs.Tab>
      </Tabs.Container>
      {/* <ScrollableTabView
                initialPage={0}
                tabBarBackgroundColor={appcolor.white}
                tabBarTextStyle={{ fontSize: 15, color: appcolor.dark }}
                tabBarUnderlineStyle={{ height: 2, backgroundColor: DEFAULT_COLOR }}
                renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}>
                <RenderViewQRCode QRValue={QRCodeValue} LinkTraining={LinkTraining} style={styles} tabLabel={'QR Code'} copyLink={handlerCopyLink} />
                <RenderTrainingResult style={styles} tabLabel={'Training Results'} EmployeeCode={EmployeeInfo.employeeCode} Guiid={route?.params?.workinfo.guiid} />
            </ScrollableTabView> */}
    </View>
  );
};

const RenderViewQRCode = ({ QRValue, LinkTraining, style, copyLink }) => {
  return (
    <View style={style.bgQRStyle}>
      <Image
        style={{ width: 300, height: 300, margin: 42 }}
        source={{ uri: QRValue }}
      />
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ width: '78%' }}>{LinkTraining}</Text>
        <View
          style={{
            marginStart: 8,
            borderWidth: 0.5,
            borderRadius: 50,
            padding: 12,
          }}
        >
          <SpiralIcon
            type="font-awesome-6"
            solid
            name="copy"
            size={18}
            onPress={copyLink}
          />
        </View>
      </View>
    </View>
  );
};
const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0, maximum-scale=0, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;
const RenderTrainingResult = ({ style, EmployeeCode, Guiid }) => {
  const today = moment(new Date()).format('YYYYMMDD');
  return (
    <View style={style.bgQRStyle}>
      <ScrollView
        style={{ width: '95%', height: '95%' }}
        scrollEnabled={true}
        scrollEventThrottle={16}
        contentContainerStyle={{ flex: 1 }}
      >
        <WebView
          key="training"
          scalesPageToFit={Platform.OS == 'android' ? false : true}
          scrollEnabled={true}
          style={{ flex: 1 }}
          domStorageEnabled={true}
          injectedJavaScript={Platform.OS === 'ios' ? INJECTEDJAVASCRIPT : null}
          onMessage={event => {}}
          source={{
            uri: TRAINING_RESULT + EmployeeCode + '-' + today + '/' + Guiid,
          }}
        />
      </ScrollView>
    </View>
  );
};

export default TrainingResults;
