import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { deviceHeight } from '../../../Themes/AppsStyle';
import CustomListView from '../../../Control/Custom/CustomListView';
import { menuController } from '../../../Controller/MenuController';
import MenuList from '../../../Content/Menu/MenuList';
import { DashboardView } from './Page/DashboardView';
import useNotification from '../../../Hooks/useNotification';
import { HeaderCustom } from '../../../Content/HeaderCustom';

const HomeSignify = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const { countNotification } = useNotification();
  const [dataMenu, setDataMenu] = useState([]);

  // Handler
  const LoadData = async () => {
    await menuController.getMenu(0, setDataMenu);
  };

  const onReloadData = () => {
    DeviceEventEmitter.emit('REDOWNLOAD_DATA');
  };

  const onOpenDrawMenu = () => {
    navigation.openDrawer();
  };
  const onShowNotification = () => {
    navigation.navigate('Notification');
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [isReloadData, countNotification]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { width: '100%', height: deviceHeight, padding: 8 },
  });

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        isHome
        title="TRANG CHỦ"
        countNotify={countNotification}
        iconLeft="bars"
        iconRight="bell"
        leftFunc={onOpenDrawMenu}
        rightFunc={onShowNotification}
      />
      <View style={styles.contentContainer}>
        <CustomListView
          data={['']}
          ListHeader={
            <DashboardView navigation={navigation} isLoadMain={isReloadData} />
          }
          renderItem={() => (
            <MenuList menus={dataMenu} navigation={navigation} />
          )}
          onRefresh={onReloadData}
          bottomView={{ paddingBottom: deviceHeight / 8 }}
        />
      </View>
    </View>
  );
};

export default HomeSignify;
