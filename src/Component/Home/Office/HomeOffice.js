import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import HeaderView from './Page/HeaderView';
import { deviceHeight } from '../../../Themes/AppsStyle';
import { SummaryOffice } from '../../OFFICE SPIRAL/Summary/SummaryOffice';
import CustomListView from '../../../Control/Custom/CustomListView';
import { menuController } from '../../../Controller/MenuController';
import MenuList from '../../../Content/Menu/MenuList';

const HomeOffice = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState([]);
  // Handler
  const LoadData = async () => {
    await menuController.getMenu(0, setDataMenu);
  };
  const onReloadData = () => {
    DeviceEventEmitter.emit('REDOWNLOAD_DATA');
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, [isReloadData]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    contentContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.surface,
      padding: 16,
    },
  });
  return (
    <SafeAreaView style={styles.mainContainer}>
      <HeaderView navigation={navigation} />
      <View style={styles.contentContainer}>
        <CustomListView
          data={['']}
          ListHeader={<MenuList menus={dataMenu} navigation={navigation} />}
          renderItem={() => {
            return (
              <SummaryOffice
                navigation={navigation}
                isLoadMain={isReloadData}
              />
            );
          }}
          onRefresh={onReloadData}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeOffice;
