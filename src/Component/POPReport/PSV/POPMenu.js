import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { POPMenuList } from '../../../Controller/POPController';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { Badge, Icon } from '@rneui/themed';
import { LoadingView } from '../../../Control/ItemLoading/index';
import { RefreshControl } from 'react-native';
import { ToastSuccess } from '../../../Core/Helper';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const POPMenu = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [dataMenu, setDataMenu] = useState([]);

  const ColorRand = index => {
    const colorList = [
      '#FF5F1F',
      '#32CD32',
      '#FFBA00',
      '#4169E1',
      '#822659',
      '#228B22',
      '#40B5AD',
      '#6495ED',
      '#FF3131',
    ];
    if (
      index === undefined ||
      (index !== undefined && index > colorList.length - 1)
    ) {
      index = ConvertToInt(Math.random() * colorList.length || 0);
    }
    index = index % colorList.length;
    return colorList[index];
  };
  const LoadMenu = async () => {
    await setLoading(true);
    await POPMenuList(async mData => {
      await setDataMenu(mData);
    });
    await setLoading(false);
  };
  const handlerItemPress = item => {
    console.log('item', item.pageName);
    if (item.pageName !== null && item.pageName.length > 0)
      navigation.navigate(item.pageName, { popMenu: item });
    else
      ToastSuccess(
        'Chức năng hiện tại đang trong quá trình hoàn thiện, Vui lòng bỏ qua mục này !',
      );
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
    itemView: {
      flex: 1,
      flexWrap: 'wrap',
      margin: 5,
      padding: 8,
      backgroundColor: appcolor.light,
      borderRadius: 10,
    },
    titleMenu: {
      width: '100%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'center',
      marginTop: 8,
    },
    titleDetailMenu: {
      width: '100%',
      fontSize: 18,
      fontWeight: '700',
      color: appcolor.dark,
      textAlign: 'center',
      marginTop: 8,
    },
  });
  const renderItem = ({ item, index }) => {
    const onItemPress = () => {
      handlerItemPress(item);
    };
    return (
      <TouchableOpacity
        key={`I_D_${index}`}
        style={{ flex: 1 }}
        onPress={onItemPress}
      >
        <View style={styles.itemView}>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                width: 70,
                height: 70,
                backgroundColor: appcolor.surface,
                padding: 16,
                borderRadius: 100,
                justifyContent: 'center',
              }}
            >
              <SpiralIcon
                name={item.imageItem}
                type="font-awesome-5"
                size={25}
                color={ColorRand(index)}
              />
              {item.numberNotify > 0 && (
                <Badge
                  containerStyle={{ position: 'absolute', top: -3, end: -10 }}
                  textStyle={{ fontSize: 13, color: appcolor.light }}
                  badgeStyle={{
                    backgroundColor: appcolor.alert,
                    width: 30,
                    height: 30,
                    borderRadius: 50,
                  }}
                  value={item.numberNotify > 99 ? '99+' : item.numberNotify}
                />
              )}
            </View>
            <View style={{ width: '100%' }}>
              {item.detailMenu !== null && item.detailMenu.length > 0 && (
                <Text style={styles.titleDetailMenu}>{item.detailMenu}</Text>
              )}
              <Text style={styles.titleMenu}>{item.menuName}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    LoadMenu();
    DeviceEventEmitter.addListener('RELOAD_POPMENU', () => {
      LoadMenu();
    });
    return () => loading;
  }, []);
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route.params?.menuitem.menuName}
        leftFunc={() => navigation.goBack()}
      />
      <LoadingView isLoading={loading} title=" " />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, margin: 8 }}
        key={'menuPOP'}
        keyExtractor={(_, index) => index.toString()}
        data={dataMenu}
        numColumns={2}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={LoadMenu} />
        }
      />
    </View>
  );
};
