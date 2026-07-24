import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import ViewShot from 'react-native-view-shot';
import { Image, Text } from '@rneui/base';
import { deviceWidth, fontWeightBold } from '../../Themes/AppsStyle';
import {
  GetEmployeeInfo,
  onShareLocalFile,
  StringTobase64,
} from '../../Core/Helper';
import WebViewScreen from '../../Control/Webview/WebViewScreen';
import moment from 'moment';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const NotificationDetailScreen = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemData, setItemData] = useState(route.params);
  const [_mutate, setMutate] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const viewShotRef = useRef(null);

  const onGoPage = async () => {
    let pageName = itemData.hyperLinks.replace(/(\r\n|\n|\r)/gm, '');
    const index = pageName.indexOf('http', 0);
    pageName = pageName.substring(index, pageName.length);
    if (pageName?.includes('http')) {
      const employeeInfo = await GetEmployeeInfo();
      const shareInfo = {
        employeeId: employeeInfo.employeeId,
        employeeName: employeeInfo.employeeName,
        accountId: employeeInfo.accountId,
        typeId: employeeInfo.typeId,
        loginName: employeeInfo.loginName,
        mobile: employeeInfo?.mobile || null,
      };
      if (pageName.includes('spiral.com.vn')) {
        const app_access = await StringTobase64(JSON.stringify(shareInfo));
        itemData.urlSite = pageName.includes('?')
          ? `${pageName}&appShare=${app_access}`
          : `${pageName}?appShare=${app_access}`;
        setMutate(e => !e);
      } else {
        itemData.urlSite = pageName;
        setMutate(e => !e);
      }
      setShowSheet(true);
    } else {
      navigation.navigate(pageName);
    }
  };
  const onBack = () => {
    navigation.goBack();
  };
  const onCloseDetails = () => {
    setShowSheet(false);
  };
  const onShare = async () => {
    const path = await viewShotRef.current.capture();
    const option = {
      title: 'Tin nhắn',
      message: itemData.title,
      url: path,
    };
    await onShareLocalFile(option);
  };

  useEffect(() => {
    return () => false;
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    contentContainer: { flex: 1, backgroundColor: appcolor.light },
    titleName: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      padding: 8,
      paddingBottom: 0,
      color: appcolor.dark,
    },
    imageStyle: { width: '100%', height: 200, borderRadius: 8, padding: 8 },
    bodyName: {
      fontSize: 13,
      backgroundColor: appcolor.light,
      color: appcolor.dark,
      padding: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      margin: 8,
    },
    titleInfo: { fontWeight: fontWeightBold, padding: 8, color: appcolor.info },
    dateName: {
      fontSize: 12,
      color: appcolor.greydark,
      textAlign: 'right',
      fontStyle: 'italic',
      paddingHorizontal: 16,
    },
    buttonGoView: {
      width: '30%',
      alignItems: 'center',
      margin: 8,
      marginHorizontal: 16,
      padding: 8,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      borderRadius: 20,
    },
    titleGo: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.primary,
    },
  });
  const renderBodyContent = content => {
    let bodyView = [];
    content?.split(' ').forEach((element, index) => {
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
            style={{ width: deviceWidth - 20, borderRadius: 10, height: 240 }}
            source={{ uri: imageUrl }}
          />,
        );
      } else if (element.includes('http')) {
        bodyView.push(
          <Text
            key={index.toString()}
            onPress={() => onGoPage(element)}
            style={styles.titleInfo}
          >
            {'Chi tiết'}
          </Text>,
        );
      } else {
        bodyView.push(
          <React.Fragment key={index.toString()}>
            {`${element} `}
          </React.Fragment>,
        );
      }
    });
    return bodyView;
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title="Chi tiết thông báo"
        iconRight="share"
        leftFunc={onBack}
        rightFunc={onShare}
      />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.8 }}>
          <Text style={styles.titleName}>{itemData.title}</Text>
          {itemData.hyperLinks !== null &&
            (itemData?.hyperLinks?.includes('.png') ||
              itemData?.hyperLinks?.includes('.jpg') ||
              itemData?.hyperLinks?.includes('.jpeg')) && (
              <Image
                style={styles.imageStyle}
                source={{ uri: itemData?.hyperLinks }}
              />
            )}
          <Text style={styles.bodyName}>
            {renderBodyContent(itemData?.body || '')}
          </Text>
          <Text style={styles.dateName}>
            {moment(itemData.createdDate).format('dddd DD, MM/YYYY HH:mm:ss')}
          </Text>
          {itemData.hyperLinks && (
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity style={styles.buttonGoView} onPress={onGoPage}>
                <Text style={styles.titleGo}>{`Xem ngay`}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ViewShot>
      </ScrollView>

      <Modal
        visible={showSheet}
        animationType="fade"
        onRequestClose={onCloseDetails}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <WebViewScreen
            pageName={itemData?.title}
            urlPage={itemData?.urlSite}
            onClose={onCloseDetails}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default NotificationDetailScreen;
