import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { groupDataByKey, ToastError } from '../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/themed';
import { deviceHeight, optionConfirm } from '../../../../Core/Utility';
import { ButtonAction } from './ButtonAction';
// import Mailer from "react-native-mail";
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { EmployeeAPI } from '../../../../API/EmployeeAPI';
import { HeaderCustom } from '../../../../Content/HeaderCustom';

export const SupportInfo = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [masterData, setMasterData] = useState([]);
  //
  const LoadData = async () => {
    await EmployeeAPI.getDataContactInfo(async mMasterData => {
      const masterList = JSON.parse(mMasterData[0]?.filterList || '[]');
      await setMasterData(masterList);
    });
  };
  // Handler
  const handlerActionInfo = (type, item) => {
    switch (type) {
      case 'ZALO':
        const phoneNumber = item.PhoneNumber;
        Linking.openURL(`https://zalo.me/${phoneNumber}`);
        break;
      case 'CALL':
        const optionPhone = [
          { text: 'Đóng' },
          {
            text: 'Gọi ngay',
            onPress: () => {
              onCallAction(item.PhoneNumber);
            },
          },
        ];
        optionConfirm(item.FullName, item.PhoneNumber, optionPhone);
        break;
      case 'EMAIL':
        const optionEmail = [
          { text: 'Đóng' },
          {
            text: 'Gửi ngay',
            onPress: () => {
              onEmailAction(item.Email);
            },
          },
        ];
        optionConfirm(item.FullName, item.Email, optionEmail);
        break;
    }
  };
  const onCallAction = phoneNumber => {
    let call =
      Platform.OS == 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.canOpenURL(call)
      .then(supported => {
        if (!supported) {
          ToastError(
            'Số điện thoại không đúng hoặc sai định dạng, vui lòng kiểm tra và thử lại sau',
            'Số điện thoại',
          );
        } else {
          return Linking.openURL(call);
        }
      })
      .catch(error => {
        ToastError(`Lỗi: ${error}`);
      });
  };
  const onEmailAction = email => {
    // try {
    //     Mailer.mail({
    //         subject: 'Support Mail',
    //         recipients: [email],
    //         isHTML: true
    //     }, (error, event) => {
    //         error !== null &&
    //             Alert.alert(
    //                 `Lỗi Email: ${error}`, event,
    //                 [{ text: 'Ok', onPress: () => console.log('OK: Email Error Response') }, { text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response') }],
    //                 { cancelable: true }
    //             )
    //     });
    // } catch (e) {
    //     console.log(e, 'ERROR Email');
    // }
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemMain: {
      alignItems: 'center',
      margin: 5,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      overflow: 'hidden',
    },
    viewPhotoText: {
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      padding: 3,
      backgroundColor: appcolor.light,
    },
    titlePhotoText: {
      fontSize: 24,
      color: appcolor.primary,
      fontWeight: '600',
    },
    titleName: {
      fontSize: 14,
      padding: 7,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    descriptionName: {
      fontSize: 13,
      fontStyle: 'italic',
      fontWeight: '500',
      color: appcolor.dark,
    },
    contentAction: {
      flexDirection: 'row',
      end: 0,
      top: 0,
      bottom: 0,
      paddingVertical: 5,
    },
  });
  const renderItem = ({ item, index }) => {
    const onPress = type => {
      handlerActionInfo(type, item);
    };
    return (
      <View key={`si_item_${index}`} style={styles.itemMain}>
        <Text style={styles.titleName}>{item.FullName}</Text>
        <Text style={styles.descriptionName}>{item.Description}</Text>
        <Text style={styles.descriptionName}>{`SĐT: ${item.PhoneNumber}`}</Text>
        <Text style={styles.descriptionName}>{`Email: ${item.Email}`}</Text>
        <View style={styles.contentAction}>
          <TouchableOpacity
            onPress={() => onPress('ZALO')}
            style={{
              marginLeft: 5,
              shadowColor: appcolor.dark,
              shadowOffset: { width: 3, height: 0 },
              elevation: 3,
              shadowOpacity: 0.5,
            }}
          >
            <Image
              source={require('../../../../Themes/Images/zalo.png')}
              style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
          <ButtonAction
            typeAction="CALL"
            iconName="call-outline"
            iconSize={18}
            onPress={onPress}
          />
          <ButtonAction
            typeAction="EMAIL"
            iconName="mail-outline"
            iconSize={18}
            onPress={onPress}
          />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title="Thông tin liên hệ"
      />
      <FlashList
        key={`datasupport_info`}
        keyExtractor={(_, index) => index.toString()}
        data={masterData}
        estimatedItemSize={100}
        renderItem={renderItem}
        scrollEnabled
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
