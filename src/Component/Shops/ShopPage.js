import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import { Button } from '@rneui/themed';
import ShopDetails from './ShopDetails';
import ReportHistory from './Work/Page/WorkHistory';
import { DEFAULT_COLOR, GO_OVERVIEW } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { ShopProfile } from './ShopProfile';
import { ShopTask } from './ShopTask';
import { GetPhotosList, GetTimeOT } from '../../Controller/PhotoController';
import { MessageInfo } from '../../Core/Helper';
import { GetMenu } from '../../Controller/UserController';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { deviceWidth } from '../Home';

const ShopPage = ({ navigation, route }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);

  const [noteSaved, setNoteSaved] = useState('');
  const [isNoteAttendant, setIsNoteAttendant] = useState(false);
  const [OTSign, setOTSign] = useState(0);
  const [countAttendant, setCountAttendant] = useState(0);
  const [isRegistOT, setIsRegistOT] = useState(false);
  const [masterOT, setMasterOT] = useState([]);
  const [indexTab, setIndexTab] = useState(2);
  const [overTime, setOverTime] = useState(0);

  const _refTabView = useRef(null);

  useEffect(() => {
    if (shopinfo !== undefined) {
      loadOT();
      loadConfig();
    }

    if (_refTabView.current !== null) {
      setTimeout(() => _refTabView.current.setIndex(2));
    }

    const subscription = DeviceEventEmitter.addListener(
      GO_OVERVIEW,
      async () => {
        if (_refTabView.current !== null) {
          setTimeout(() => _refTabView.current.setIndex(0));
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const loadConfig = async () => {
    let configInfo = shopinfo.config;
    if (configInfo != undefined && configInfo != null) {
      try {
        let jsonRes = await JSON.parse(configInfo);
        setNumberAtt(jsonRes.numberAtt);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const loadOT = async () => {
    let masterList = await GetMenu(2);
    setMasterOT(masterList);
  };

  // const shopData = (data) => { // TODO: check if this is needed
  //   if (AppNameBuild === 'hmd') {
  //     setShopinfo({ ...shopinfo, imageUrl: data.imageUrl });
  //   } else {
  //     setShopinfo({ ...shopinfo, latitude: data.latitude, longitude: data.longitude, imageUrl: data.imageUrl });
  //   }
  // };

  const isShowNoteForm = value => {
    setIsNoteAttendant(value);
  };

  const cancelNote = () => {
    isShowNoteForm(false);
  };

  const validateNote = async () => {
    if (noteSaved === '' || noteSaved === ' ') {
      alert('Vui lòng không để trống ghi chú');
      return;
    }
    isShowNoteForm(false);
    _Attendant.startCameraAttendant(noteSaved);
  };

  const checkOTmustCI = async () => {
    let arrRes = await GetPhotosList(
      route.params.shopInfo.shopId,
      route.params.shopInfo.auditDate,
      1,
    );
    setCountAttendant(arrRes.length);
  };

  const checkExistRegistOT = async () => {
    let arrRes = await GetTimeOT(
      route.params.shopInfo.shopId,
      route.params.shopInfo.auditDate,
      '1',
    );
    if (arrRes.length > 0) {
      if (arrRes[0].timeOT !== undefined && arrRes[0].timeOT !== null) {
        setIsRegistOT(true);
        setOverTime(arrRes[0].timeOT);
      }
    }
  };

  const handlerOT = async () => {
    if (masterOT.length > 0) {
      await checkOTmustCI();
      await checkExistRegistOT();

      if (countAttendant === 0) {
        MessageInfo('Bạn chưa check in, chưa thể đăng ký tăng ca được.');
        return;
      }

      if (isRegistOT) {
        MessageInfo(
          'Bạn đã đăng ký tăng ca với thời gian là : ' + overTime + 'h',
        );
        return;
      }

      setOTSign(OTSign + 1);
    }
  };

  let numAtt = 2;
  let configInfo = shopinfo?.config || undefined;
  if (configInfo != undefined && configInfo != null) {
    let jsonRes = JSON.parse(configInfo);
    numAtt = jsonRes.numberAtt;
  }
  const checkEnableOT = masterOT.length > 0 && indexTab === 2;

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={shopinfo.shopName}
        iconRight={checkEnableOT ? 'clock' : null}
        leftFunc={() => navigation.goBack()}
        rightFunc={checkEnableOT ? handlerOT : null}
      />
      <View
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          backgroundColor: appcolor.light,
        }}
      >
        <Tabs.Container
          ref={_refTabView}
          pagerProps={{
            scrollEnabled: false,
          }}
          initialTabName="Công việc"
          onIndexChange={index => setIndexTab(index)}
          renderTabBar={props => (
            <MaterialTabBar
              {...props}
              labelStyle={{
                fontSize: 15,
                color: appcolor.light,
                fontWeight: '600',
              }}
              indicatorStyle={{ backgroundColor: appcolor.white }}
              inactiveColor={appcolor.white}
              activeColor={appcolor.white}
              tabStyle={{ minWidth: deviceWidth / 4, height: 42 }}
              scrollEnabled={true}
              style={{ backgroundColor: appcolor.primary }}
            />
          )}
        >
          <Tabs.Tab key={1} name="Cửa hàng" label="Cửa hàng">
            <View
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <ShopDetails navigation={navigation} />
            </View>
          </Tabs.Tab>
          <Tabs.Tab key={2} name="Thống kê" label="Thống kê">
            <View
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <ShopProfile navigation={navigation} />
            </View>
          </Tabs.Tab>
          <Tabs.Tab key={3} name="Công việc" label="Công việc">
            <View
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <ShopTask
                navigation={navigation}
                OTSign={OTSign}
                NumberAtt={numAtt}
                shopId={shopinfo?.shopId}
                OTSummary={overTime}
              />
            </View>
          </Tabs.Tab>
          <Tabs.Tab key={4} name="Lịch sử" label="Lịch sử">
            <View
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <ReportHistory
                onSelectedTab={() => _refTabView.current.setIndex(2)}
              />
            </View>
          </Tabs.Tab>
        </Tabs.Container>
      </View>
      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent={true}
        visible={isNoteAttendant}
      >
        <View
          style={{
            zIndex: 1,
            flex: 0,
            width: '100%',
            height: Dimensions.get('window').height,
          }}
        >
          <View
            style={{
              zIndex: 2,
              position: 'absolute',
              height: '100%',
              width: '100%',
              backgroundColor: '#D3D3D3',
              opacity: 0.5,
            }}
            onStartShouldSetResponder={e => cancelNote()}
          />
          <View
            style={{
              zIndex: 3,
              position: 'relative',
              width: '80%',
              height: 'auto',
              opacity: 1.0,
              backgroundColor: 'white',
              borderRadius: 15,
              flexDirection: 'column',
              marginTop: Dimensions.get('window').height / 3,
              marginLeft:
                Dimensions.get('window').width / 2 -
                (40 * Dimensions.get('window').width) / 100,
            }}
          >
            <Text style={{ marginBottom: 15, marginTop: 15, paddingLeft: 5 }}>
              Ghi chú
            </Text>
            <View style={{ height: 0.8, backgroundColor: 'black' }}></View>
            <Text style={{ marginBottom: 15, marginTop: 20, paddingLeft: 5 }}>
              Nhập ghi chú ở dưới đây:
            </Text>
            <TextInput
              numberOfLines={6}
              multiline={true}
              autoFocus
              autoCorrect={false}
              onChangeText={text => setNoteSaved(text)}
              style={{
                margin: 5,
                padding: 10,
                color: 'black',
                height: 105,
                textAlign: 'left',
                borderWidth: 0.6,
                borderColor: 'black',
              }}
              defaultValue={noteSaved || ''}
              placeholder="Nhập ghi chú ở đây."
            />
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: 50,
                width: '100%',
                padding: 5,
              }}
            >
              <Button
                buttonStyle={{
                  width: '90%',
                  backgroundColor: DEFAULT_COLOR,
                  borderRadius: 15,
                }}
                title="Huỷ"
                onPress={cancelNote}
              />
              <Button
                buttonStyle={{
                  width: '90%',
                  backgroundColor: DEFAULT_COLOR,
                  borderRadius: 15,
                }}
                title="Lưu"
                onPress={validateNote}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopPage;
