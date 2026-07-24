import React, { Fragment, useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  AppState,
  VirtualizedList,
  ScrollView,
} from 'react-native';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deviceHeight, deviceWidth } from '../../Core/Utility';

import { Divider, Icon } from '@rneui/themed';

import { GetDataDashboard } from '../../Controller/DashboardController';
import { ColorRand } from '../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { IconAnimation } from '../../Control/IconAnimation/IconAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const tDay = new Date();
const totalDay = new Date(tDay.getFullYear(), tDay.getMonth() + 1, 0).getDate();
const currentDay = tDay.getDate();
export const QuickViewHPI = ({ navigation, refreshing }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([{ name: 1 }, { name: 2 }]);
  const [detaisl, setDetails] = useState([]);
  const [filter, setFilter] = useState([]);
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const appState = useRef(AppState.currentState);
  const [isRefresh, setRefresh] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const onLoad = async () => {
    await GetDataDashboard(result => {
      setData(result);
      if (result.length > 0) {
        const _details = JSON.parse(result[0].details || '[]');
        setDetails(_details);
        setFilter(_details);
      }
    });
  };
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        onLoad(); //load lai du lieu chart khi mo app
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    const _load = onLoad();
    return () => {
      _load;
      subscription.remove();
    };
  }, [refreshing]);
  const UIByCate = () => {
    var listCate = [];
    data?.forEach((item, index) => {
      if (index == 0) return null;
      else {
        listCate.push(
          <View
            key={`${index}1lak`}
            style={{
              padding: 7,
              justifyContent: 'flex-end',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              backgroundColor: appcolor.light,
              marginBottom: 7,
              marginRight: 10 * index,
              borderTopRightRadius: index == 1 ? 0 : 20,
              borderBottomRightRadius: 20,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => showDetail(item.category)}
            >
              <Text
                style={{
                  textAlign: 'right',
                  fontSize: 10,
                  color: ColorRand(index),
                }}
              >
                {item.category}
              </Text>
              <Text style={{ fontSize: 20, color: ColorRand(index) }}>
                {item.quantity || 0}
              </Text>
              {item?.amount && (
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 10,
                    color: ColorRand(index),
                  }}
                >
                  Số tiền
                  <Text style={{ fontSize: 20, color: ColorRand(index) }}>
                    {item.amount}
                  </Text>
                </Text>
              )}
            </TouchableOpacity>
          </View>,
        );
      }
    });
    return listCate;
  };
  const rowItem = ({ item, index }) => {
    return (
      <View style={{ padding: 7 }}>
        <Text style={{ color: appcolor.dark, fontSize: 10, fontWeight: '700' }}>
          {index + 1}) {item.category} {item.productName} imei {item.imei}
        </Text>
        {item?.moreinfo && (
          <Text
            style={{ fontSize: 10, fontWeight: '300', color: appcolor.dark }}
          >
            {item?.moreinfo || ''}
          </Text>
        )}
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
            marginTop: 7,
          }}
        />
      </View>
    );
  };
  const showDetail = category => {
    if (category == undefined) setFilter(detaisl);
    else {
      var bycate = detaisl.filter(c => c.category === category);
      setFilter(bycate);
    }
    SheetManager.show('details');
  };
  const reloadDashboard = async () => {
    await setRefresh(true);
    await onLoad();
    await setRefresh(false);
  };
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        padding: 7,
        flexDirection: 'row',
        backgroundColor: appcolor.light,
      }}
    >
      <View
        style={{
          top: -110,
          left: -40,
          shadowColor: appcolor.dark,
          shadowRadius: 28,
          zIndex: 2,
          shadowOffset: { width: 40, height: 40 },
          elevation: 13,
          transform: [{ rotateZ: '0deg' }],
          width: deviceHeight * 0.2,
          height: deviceHeight * 0.26,
          backgroundColor: appcolor.light,
          position: 'absolute',
          zIndex: 100,
          margin: 20,
          borderRadius: 500,
          alignContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          onPress={() => showDetail()}
          style={{
            width: '100%',
            height: '100%',
            padding: 20,
            justifyContent: 'flex-end',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 48,
              color: appcolor.primary,
            }}
          >
            {data?.length > 0 ? data[0].quantity : 0}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: appcolor.primary,
              fontSize: 10,
            }}
          >
            {data?.length > 0 ? data[0]?.unit : 'Số lượng'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          position: 'absolute',
          top: 10,
          zIndex: 122,
          color: appcolor.dark,
          fontSize: 11,
          marginLeft: 10,
        }}
      >
        {data?.length > 0 ? data[0].title : ''}
      </Text>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          right: 10,
          height: 30,
          width: 30,
          zIndex: 10000,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: appcolor.surface,
          borderRadius: 50,
        }}
        onPress={() => reloadDashboard()}
      >
        <IconAnimation
          isLoop={isRefresh}
          sourceIcon={require('../../Themes/lotties/refresh.json')}
        />
      </TouchableOpacity>

      <View
        style={{
          flexGrow: 1,
          backgroundColor: appcolor.surface,
          marginTop: 40,
        }}
      >
        {UIByCate()}
      </View>
      <ActionSheet
        id="details"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <ScrollView style={{ padding: 7, marginBottom: 30 }}>
          <VirtualizedList
            data={filter}
            getItemCount={() => filter.length}
            getItem={(_data, index) => _data[index]}
            keyExtractor={(_, i) => `ll${i}o2`}
            renderItem={rowItem}
          />
        </ScrollView>
        <TouchableOpacity
          onPress={() => SheetManager.hide('details')}
          style={{
            position: 'absolute',
            bottom: 10,
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <SpiralIcon raised name="close" size={18} color={appcolor.danger} />
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
};
