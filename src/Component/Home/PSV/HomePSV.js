import React, { useEffect, useState } from 'react';
import { AppState, DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { menuController } from '../../../Controller/MenuController';
import useNotification from '../../../Hooks/useNotification';
import { useLocationTracker } from '../../../Control/useLocationTracker';
import DashboardView from './Page/DashboardView';
import CustomListView from '../../../Control/Custom/CustomListView';
import { deviceHeight } from '../../../Themes/AppsStyle';
import MenuList from '../../../Content/Menu/MenuList';

const HomePSV = ({ navigation, isReloadData }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const { countNotification } = useNotification();
  const { startTracking, stopTracking } = useLocationTracker(100000);
  const [dataMenu, setDataMenu] = useState([]);

  const LoadData = async () => {
    await menuController.getMenu(0, setDataMenu);
  };
  const onReloadData = () => {
    DeviceEventEmitter.emit('REDOWNLOAD_DATA');
  };

  useEffect(() => {
    LoadData();
  }, [isReloadData]);

  useEffect(() => {
    startTracking();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        startTracking();
      } else if (nextAppState === 'background') {
        stopTracking();
      }
    });
    return () => {
      subscription.remove();
      stopTracking();
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, backgroundColor: appcolor.transparent },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        isHome
        title={userinfo.employeeName}
        countNotify={countNotification}
        iconLeft="bars"
        iconRight="bell"
        leftFunc={() => navigation.openDrawer()}
        rightFunc={() => navigation.navigate('Notification')}
      />
      <View style={styles.contentContainer}>
        <CustomListView
          data={['menu']}
          ListHeader={
            <DashboardView
              navigation={navigation}
              isReloadData={isReloadData}
            />
          }
          renderItem={() => (
            <MenuList navigation={navigation} menus={dataMenu} />
          )}
          onRefresh={onReloadData}
          bottomView={{ paddingBottom: deviceHeight / 8 }}
        />
      </View>
    </View>
  );
};

export default HomePSV;
