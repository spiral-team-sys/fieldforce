import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, DeviceEventEmitter } from 'react-native';
import { _competitorId } from '../Core/URLs';
const delay = ms => new Promise(res => setTimeout(res, ms));
import { HeaderCustom } from '../Content/HeaderCustom';
export const deviceHeight = Dimensions.get('window').height;
export const deviceWidth = Dimensions.get('window').width;
import { useSelector } from 'react-redux';
import Login from './Login';
import moment from 'moment';
import { MainMenu } from '../Content/MainMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastSuccess } from '../Core/Helper';
import { APPDOWNLOAD, downloadAll } from '../Controller/DownloadDataController';
import { GetMenu } from '../Controller/UserController';
import { getStoreList } from '../Controller/WorkController';
import { fetchDataNotify } from '../Controller/NotificationController';
const LASTSYNC = 'LastSyncData';

export const Home = ({ props, navigation }) => {
  const { userinfo, appcolor } = useSelector(state => state.GAppState);
  const [menus, setMenu] = useState([]);
  const [badge, setBadge] = useState(0);
  const [refreshing, setRefesh] = useState(false);
  useEffect(() => {
    const _load = userinfo.employeeId !== undefined ? SyncdataApp(true) : null;
    return () => _load;
  }, [userinfo]);
  const SyncdataApp = async serverSync => {
    await setRefesh(true);
    const _hour = parseInt(moment().format('H'));
    if (serverSync === true || _hour < 18) {
      //đồng bồ trên hệ thống truoc 18h || or tự đồng bộ
      await downloadAll(async e => {
        await ToastSuccess(e, 'Sync data', 'top');
        await DeviceEventEmitter.emit('RELOAD_SHOP', true);
        await AsyncStorage.setItem(LASTSYNC, moment().format('YYYYMMDD'));
      });
      await APPDOWNLOAD.downloadMenu();
    }
    const _menu = await GetMenu(0);
    await setMenu(_menu);
    //Local load
    const _shops = await getStoreList('', moment.format('YYYYMMDD'));
    setRefesh(false);
    await fetchDataNotify(async () => {
      await setBadge();
    });
  };
  return userinfo.employeeId !== undefined ? (
    <View style={{ backgroundColor: appcolor.light, marginBottom: 20 }}>
      <HeaderCustom
        isHome={true}
        title={userinfo.employeeName}
        iconLeft="bars"
        countNotify={badge}
        iconRight="bell"
        rightFunc={() => navigation.navigate('Notification')}
        leftFunc={() => navigation.openDrawer()}
      />
      <View style={{ padding: 7, top: 0 }}>
        <View
          style={{
            borderColor: 2,
            borderRadius: 12,
            backgroundColor: appcolor.primary,
          }}
        >
          <Text style={{ padding: 10, color: appcolor.white, fontSize: 17 }}>
            {'Chức năng'}
          </Text>
          <View
            style={{
              borderWidth: 0.5,
              borderColor: appcolor.greylight,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              backgroundColor: appcolor.light,
              padding: 5,
            }}
          >
            <MainMenu navigation={navigation} menus={menus} />
          </View>
        </View>
      </View>
    </View>
  ) : (
    <Login />
  );
};
