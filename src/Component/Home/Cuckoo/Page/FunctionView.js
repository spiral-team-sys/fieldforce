import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
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
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
      reload_store.remove();
    };
  }, [isReloadData]);

  // View
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      padding: 8,
      marginTop: 8,
      borderTopStartRadius: 16,
      borderTopEndRadius: 16,
      backgroundColor: appcolor.light,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <MenuList
        menus={dataMenu}
        navigation={navigation}
        onRefresh={handlerDownloadData}
      />
    </View>
  );
};

export default FunctionView;
