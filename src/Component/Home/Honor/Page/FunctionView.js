import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { menuController } from '../../../../Controller/MenuController';
import MenuList from '../../../../Content/Menu/MenuList';

const FunctionView = ({ navigation, isReloadData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMenu, setDataMenu] = useState([]);

  // Handler
  const LoadData = async () => {
    await menuController.getMenu(0, setDataMenu);
  };
  // Action
  const handlerDownloadData = () => {
    DeviceEventEmitter.emit('REDOWNLOAD_DATA');
  };
  //
  useEffect(() => {
    const reload_store = DeviceEventEmitter.addListener(
      'RELOAD_DATA_SHOP',
      LoadData,
    );
    LoadData();

    return () => {
      reload_store.remove();
    };
  }, [isReloadData]);

  // View
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
    title: {
      paddingHorizontal: 18,
      paddingBottom: 10,
      color: appcolor.dark,
      fontSize: 20,
      fontWeight: '800',
    },
    menuContainer: { flex: 1 },
  });
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>Chức năng</Text>
      <View style={styles.menuContainer}>
        <MenuList
          menus={dataMenu}
          navigation={navigation}
          onRefresh={handlerDownloadData}
        />
      </View>
    </View>
  );
};

export default FunctionView;
