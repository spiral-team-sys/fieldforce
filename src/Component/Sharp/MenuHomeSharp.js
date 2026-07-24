import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import DeviceInfo from 'react-native-device-info';
import { Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { GetEmployeeInfo, Token } from '../../Core/Helper';
import { ACTION } from '../../Core/ReduxController';
import { AppNameBuild, TRAINEEKEY } from '../../Core/URLs';
import { deviceWidth, TODAY } from '../../Core/Utility';
import { GetMenu } from '../../Controller/UserController';
import { scaleSize } from '../../Themes/AppsStyle';
import { getStoreList } from '../../Controller/WorkController';
import { Animated } from 'react-native';
// import ShopOneMoreToshiba from "../Shops/ShopOneMoreToshiba"

{
  /* userinfo.dropCategory : đóng danh sách shop Bên ngoài */
}

export const MenuHomeSharp = ({ navigation, isLoading, downloadData }) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataMenu: [],
    isShowToday: false,
    currentTab: 1,
  });
  const [dataMenu, setDataMenu] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState(null);
  const [selected, setSelected] = useState(false);
  const [isShowToday, setShowToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollX] = useState(new Animated.Value(0));

  const dispatch = useDispatch();

  const LoadData = async () => {
    await setLoading(true);
    const _menu = await GetMenu(0);

    let isHaveToday = false;
    await setData({
      dataMenu: [..._menu],
      isShowToday: isHaveToday,
      currentTab: isShowToday ? data.currentTab : 2,
    });
    await setLoading(false);
    // await setDataMenu(_menu)
  };
  const onItemPress = async item => {
    let token = await Token();
    const einfo = await GetEmployeeInfo();
    const deviceId = await DeviceInfo.getUniqueId();
    if (item.pageName.includes('trainee')) {
      await setSelected(item);
      const shareKey = {
        AccountId: einfo.accountId,
        CoachingID: 0,
        DeviceID: deviceId,
        EmployeeId: einfo.employeeId,
        LoginID: TRAINEEKEY,
        LoginIDForRP: '',
        ShopId: 0,
      };
      console.log(shareKey, 'shareKey');
      const appShare = await base64.encode(JSON.stringify(shareKey));
      const urlPage = item.reportItem + appShare;
      navigation.navigate('trainee', {
        pageName: item.menuNameVN,
        urlPage: urlPage,
      });
    } else if (item.reportItem !== null && item.reportItem.includes('https')) {
      await setSelected(item);
      const shareInfo = {
        employeeId: einfo.employeeId,
        employeeName: einfo.employeeName,
        accountId: einfo.accountId,
        typeId: einfo.typeId,
        loginName: einfo.loginName,
        mobile: einfo.mobile,
        menuId: item.id,
        deviceId: deviceId,
        AppId: AppNameBuild,
        token: token,
      };
      const app_access = await base64.encode(JSON.stringify(shareInfo));
      setUrl(item.reportItem + app_access);
      setSelected(true);
      setTitle(item.menuNameVN);
    } else {
      await dispatch({ type: ACTION.SET_KPIINFO, kpiinfo: item });
      if (item.pageName !== 'gallary')
        navigation.navigate(item.pageName, { menuitem: item });
      else navigation.navigate(item.pageName);
    }
  };
  // View
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [isLoading]);

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={'hk3d2-' + index}
        style={{
          width: deviceWidth * 0.44,
          height: deviceWidth * 0.3,
          marginRight: 12,
          borderRadius: 20,
          backgroundColor: appcolor.surface,
          marginBottom: 10,
        }}
        onPress={() => onItemPress(item)}
      >
        <View style={{ width: '100%', height: '100%', padding: 12 }}>
          <SpiralIcon
            containerStyle={{ alignItems: 'flex-start' }}
            name={item.iconName}
            color={appcolor.primary}
            type={item.iconType || 'font-awesome-5'}
            size={38}
          />
          <View style={{ flexGrow: 1 }} />
          <View style={{ width: '100%', bottom: 10, alignItems: 'flex-end' }}>
            <Text style={{ color: appcolor.dark, fontWeight: '700' }}>
              {item.menuNameVN}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                opacity: 0.3,
                fontWeight: '600',
                fontSize: scaleSize(9),
              }}
            >
              {item.menuName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: appcolor.transparent,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    titleMain: {
      padding: 0,
      fontSize: 18,
      fontWeight: '700',
      alignSelf: 'center',
      color: appcolor.dark,
    },
    titleMenu: {
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 5,
      minHeight: 30,
      textAlign: 'center',
    },
    itemMenuMain: { alignItems: 'center', padding: 8, borderRadius: 8 },
    scrollIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
    },
    indicator: {
      width: `${
        100 -
        (dataMenu.length <= 4
          ? 0
          : dataMenu.length * 10 - (dataMenu.length >= 10 ? 30 : 8))
      }%`,
      height: 6,
      borderRadius: 8,
      backgroundColor: appcolor.primary,
    },
    mainIndicator: {
      height: 6,
      width: '15%',
      backgroundColor: '#feeaeb',
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 8,
      overflow: 'hidden',
    },
  });
  const renderHorizontalList = () => {
    const chunks = [];
    const chunkSize = 2;
    for (let i = 0; i < (data.dataMenu?.length || 0); i += chunkSize) {
      chunks.push(data.dataMenu?.slice(i, i + chunkSize));
    }
    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            },
          )}
          scrollEventThrottle={16}
        >
          {chunks.map((chunk, index) => (
            <FlatList
              scrollEnabled={false}
              key={'Column_' + index}
              data={chunk}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              numColumns={1} // Chỉ hiển thị một cột (dọc)
            />
          ))}
        </ScrollView>
        <View
          style={{
            height: 10,
            width: '100%',
            borderRadius: 8,
            alignSelf: 'center',
            marginTop: 8,
            overflow: 'hidden',
          }}
        >
          <Indicators data={chunks} scrollX={scrollX} appcolor={appcolor} />
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {isLoading && <LoadingView isLoading={isLoading} title=" " />}
      {!isLoading && (
        <View style={{ width: deviceWidth, paddingLeft: 10 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '500',
              color: appcolor.primary,
              padding: 4,
            }}
          >
            Chức năng
          </Text>
          {renderHorizontalList()}
        </View>
      )}
    </View>
  );
};
const Indicators = React.memo(({ data, scrollX, appcolor }) => {
  const indicatorPosition = Animated.divide(scrollX, deviceWidth);

  return (
    <View
      style={{
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        marginTop: 8,
        left: 0,
        right: 0,
        justifyContent: 'center',
      }}
    >
      {data.map((_, index) => {
        const width = indicatorPosition.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [8, 0.1 * deviceWidth, 8], // Animation sẽ tăng chiều dài của Indicator ở vị trí hiện tại
          extrapolate: 'clamp',
        });
        return data.length / 2 > index ? (
          <Animated.View
            key={index}
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: appcolor.primary,
              marginHorizontal: 4,
              width,
            }}
          />
        ) : null;
      })}
    </View>
  );
});
