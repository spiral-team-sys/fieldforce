import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '@rneui/themed';
import {
  GetEmployeeInfo,
  StringTobase64,
  onShareLocalFile,
} from '../Core/Helper';
import WebViewUI from '../Content/WebViewUI';
import ViewShot from 'react-native-view-shot';
import { HeaderCustom } from '../Content/HeaderCustom';
import moment from 'moment';
import { useSelector } from 'react-redux';
import SpiralIcon from '../Control/Icon/SpiralIcon';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
  },
});

const NotifyDetail = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const [showView, setShowView] = useState(false);
  const [urlSite, setUrlSite] = useState('');
  const refShot = useRef(null);
  const data = route.params || {};

  const ShareScreen = async () => {
    const path = await refShot.current.capture();
    const option = {
      title: 'Tin nhắn',
      message: route.params.title,
      url: path,
    };
    await onShareLocalFile(option);
  };

  const gotoPage = async link => {
    link = link.replace(/(\r\n|\n|\r)/gm, '');
    const index = link.indexOf('http', 0);
    link = link.substring(index, link.length);

    if (link?.includes('http')) {
      const einfo = await GetEmployeeInfo();
      const shareInfo = {
        employeeId: einfo.employeeId,
        employeeName: einfo.employeeName,
        accountId: einfo.accountId,
        typeId: einfo.typeId,
        loginName: einfo.loginName,
        mobile: einfo.mobile,
      };
      if (link.includes('spiral.com.vn')) {
        const app_access = await StringTobase64(JSON.stringify(shareInfo));
        if (link.includes('?')) {
          setUrlSite(link + '&appShare=' + app_access);
        } else {
          setUrlSite(link + '?appShare=' + app_access);
        }
      } else {
        setUrlSite(link);
      }
      setShowView(true);
    } else {
      navigation.navigate(link);
    }
  };

  const CreateBody = content => {
    const arrString = content?.split(' ');
    let bodyView = [];

    arrString.forEach((element, index) => {
      if (
        element.includes('http') &&
        (element?.includes('.jpg') ||
          element?.includes('.jpeg') ||
          element?.includes('.png'))
      ) {
        bodyView.push(
          <Text style={{ color: appcolor.dark }} key={'t' + index.toString()}>
            -------------------------------
          </Text>,
        );
        const imageUrl = element.replace(/(\r\n|\n|\r)/gm, '');
        bodyView.push(
          <Image
            key={index.toString()}
            style={{
              width: Dimensions.get('window').width - 20,
              borderRadius: 10,
              height: 240,
            }}
            source={{
              uri: imageUrl,
            }}
          />,
        );
      } else if (element.includes('http')) {
        bodyView.push(
          <Text
            key={index.toString()}
            onPress={() => gotoPage(element)}
            style={{ fontWeight: '600', padding: 2, color: appcolor.info }}
          >
            {'Chi tiết>>'}
          </Text>,
        );
      } else {
        bodyView.push(
          <React.Fragment key={index.toString()}>
            {element + ' '}
          </React.Fragment>,
        );
      }
    });
    return bodyView;
  };

  return (
    <View style={styles.content}>
      <HeaderCustom
        rightFunc={ShareScreen}
        leftFunc={() => navigation.goBack()}
        title="Chi tiết thông báo"
        iconRight="share"
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 15 }}
        style={{ height: '94%', backgroundColor: appcolor.light }}
      >
        <ViewShot
          style={{ padding: 12 }}
          ref={refShot}
          options={{ format: 'jpg', quality: 0.8 }}
        >
          <Text
            style={{
              fontSize: 19,
              fontWeight: 'bold',
              paddingBottom: 10,
              color: appcolor.dark,
            }}
          >
            {data.title}
          </Text>
          {data.hyperLinks !== null &&
            (data?.hyperLinks?.includes('.png') ||
              data?.hyperLinks?.includes('.jpg') ||
              data?.hyperLinks?.includes('.jpeg')) && (
              <Image
                style={{ borderRadius: 10, padding: 10, height: 160 }}
                source={{
                  uri: data?.hyperLinks,
                  headers: { Authorization: 'someAuthToken' },
                }}
              />
            )}
          <Text
            style={{ backgroundColor: appcolor.light, color: appcolor.dark }}
          >
            {CreateBody(data?.body || '')}
          </Text>
          <Text
            style={{
              color: appcolor.dark,
              width: '100%',
              padding: 5,
              textAlign: 'right',
            }}
          >
            {moment(data.createdDate).calendar()}
          </Text>
          {data.hyperLinks !== null &&
            data.hyperLinks !== '' &&
            data.hyperLinks !== 'null' && (
              <View
                style={{
                  alignItems: 'flex-end',
                  marginBottom: 10,
                  display:
                    !data?.hyperLinks?.includes('.png') &&
                      !data?.hyperLinks.includes('.jpg') &&
                      !data.hyperLinks.includes('.jpeg')
                      ? 'flex'
                      : 'none',
                }}
              >
                <TouchableOpacity
                  style={{
                    padding: 7,
                    flexDirection: 'row',
                    borderWidth: 0.5,
                    borderColor: appcolor.primary,
                  }}
                  onPress={() => gotoPage(data.hyperLinks)}
                >
                  <SpiralIcon
                    color={appcolor.primary}
                    name="hand-o-right"
                    type="font-awesome"
                    size={20}
                  />
                  <Text style={{ color: appcolor.primary }}>Đi đến</Text>
                </TouchableOpacity>
              </View>
            )}
        </ViewShot>
      </ScrollView>
      <Modal
        style={{ backgroundColor: appcolor.light }}
        animationType="slide"
        visible={showView}
      >
        <WebViewUI
          pageName={data.title}
          urlPage={urlSite}
          onClose={() => setShowView(false)}
        />
      </Modal>
    </View>
  );
};

export default NotifyDetail;
