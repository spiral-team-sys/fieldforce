import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ListItem, Text } from '@rneui/themed';
import {
  getLstMessengerPayslip,
  updateMessenger,
} from '../Controller/WorkController';
import { HeaderCustom } from '../Content/HeaderCustom';
import { ColorRand } from '../Core/Helper';
import { scaleSize } from '../Themes/AppsStyle';
import LottieView from 'lottie-react-native';
import { LocalSignIn } from '../Control/LocalSignIn';
import moment from 'moment';

const PaySlip = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [idMessengerSelect, setIdMessengerSelect] = useState(0);
  const [lstNotify, setLstNotify] = useState([]);
  const [isSec, setIsSec] = useState(0);

  const LoadData = async () => {
    const data = (await getLstMessengerPayslip()) || [];
    setLstNotify(data);
  };
  const Authenticate = async () => {
    await LocalSignIn.isSupportID(e => {
      if (+e > 0) {
        LocalSignIn.onAuthenticateID(e => {
          setIsSec(e === 1 ? -1 : 1);
        });
      }
    });
  };

  useEffect(() => {
    Authenticate();
    LoadData();

    const unsubscribe = navigation.addListener('focus', () => {
      if (idMessengerSelect !== 0) {
        setLstNotify(prevLstNotify =>
          prevLstNotify.map(item =>
            item.id === idMessengerSelect ? { ...item, seen: 1 } : item,
          ),
        );
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [idMessengerSelect, navigation]);

  const onItemPress = useCallback(
    item => {
      setIdMessengerSelect(item.id);
      updateMessenger(item.id);
      navigation.navigate('o-payslip-detail', { ...item, option: 'payslip' });
    },
    [navigation],
  );
  console.log('lstNotify', lstNotify);
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: appcolor.light,
        }}
      >
        <HeaderCustom
          title="Quản lý tin nhắn lương"
          leftFunc={() => navigation.goBack()}
        />
        <ScrollView>
          {lstNotify.length > 0 &&
            lstNotify.map((item, i) => (
              <ListItem
                key={item.id}
                containerStyle={{ backgroundColor: appcolor.light }}
                onPress={() => onItemPress(item)}
                bottomDivider
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    backgroundColor: ColorRand(i),
                  }}
                >
                  <Text style={{ color: appcolor.dark }}>{i + 1}</Text>
                </View>
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      color: appcolor.dark,
                      fontSize: scaleSize(15),
                      fontWeight: item.seen !== 1 ? '700' : '300',
                    }}
                  >
                    {item.title}
                  </ListItem.Title>
                  <ListItem.Subtitle
                    style={{
                      color: appcolor.dark,
                      fontSize: scaleSize(13),
                      textAlign: 'right',
                      fontWeight: item.seen !== 1 ? '500' : '100',
                    }}
                    numberOfLines={3}
                    lineBreakMode="middle"
                  >
                    Đã nhận {moment(item.createdDate).calendar()}
                  </ListItem.Subtitle>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
        </ScrollView>
      </View>
      <Modal animationType="slide" visible={isSec > 0}>
        <View style={{ backgroundColor: appcolor.light, height: '100%' }}>
          <View style={{ height: '40%' }}>
            <LottieView
              autoPlay
              style={{ height: '100%' }}
              source={require('../Themes/lotties/security.json')}
            />
          </View>
          <View style={{ padding: 12 }}>
            <Text
              style={{
                textAlign: 'center',
                color: appcolor.dark,
                fontWeight: 'bold',
              }}
            >
              Xác thực thông tin
            </Text>
            <View style={{ paddingHorizontal: 12 }}>
              <Text style={{ color: appcolor.dark, textAlign: 'center' }}>
                Nhằm nâng cao tính bảo mật về lương bạn cần xác thực 2 bước
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                LocalSignIn.onAuthenticateID(e => {
                  e === 1 && setIsSec(-1);
                })
              }
            >
              <View style={{ alignItems: 'center', marginTop: 30 }}>
                {isSec === 1 ? (
                  <LottieView
                    autoPlay
                    style={{ height: 70, width: 70 }}
                    source={require('../Themes/lotties/faceid.json')}
                  />
                ) : (
                  <LottieView
                    autoPlay
                    style={{ height: 70, width: 70 }}
                    source={require('../Themes/lotties/fingerprint.json')}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 12 }}>
            <Text style={{ color: appcolor.danger, textAlign: 'center' }}>
              {`Ấn vào biểu tượng ${
                isSec === 1 ? 'khuôn mặt' : 'vân tay'
              } => Sử dụng ${isSec === 1 ? 'FaceID' : 'vân tay'} để mở khoá`}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaySlip;
