import moment from 'moment';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
// import { ConvertSecondToTime, deviceHeight, deviceWidth } from "../../Core/Utility"
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import LottieView from 'lottie-react-native';
import { URLDEFAULT } from '../../../Core/URLs';
import { scaleSize } from '../../../Themes/AppsStyle';
import { ConvertSecondToTime } from '../../../Core/Utility';
import { colorList } from '../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { deviceHeight, deviceWidth } from '../../Home';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';
export const DashboardRoutingTF = ({
  navigation,
  data,
  handleRefreshData,
  loading,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  var details = JSON.parse(data?.moreData || '[]');
  details = [...details, { viewMonth: true }];
  //    console.log(details)
  const [visitList, setVisitList] = useState([]);
  const [selected, setSelected] = useState({});
  const [jsonRoute, setJsonRouting] = useState([]);
  const showDetail = async item => {
    // console.log(item)
    await setSelected(item);
    await setVisitList(item.details);
    await setJsonRouting(item?.routeInfo || '[]');
    await SheetManager.show('shopList');
  };
  const rowItem = ({ item, index }) => {
    return (
      // item.viewMonth == undefined ?
      <TouchableOpacity
        onPress={() => showDetail(item)}
        key={index + 'dasd6aj'}
        style={{ marginRight: 7, height: 200 }}
      >
        <View
          style={{
            backgroundColor: appcolor.surface,
            padding: 8,
            borderRadius: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontWeight: '500',
                fontSize: scaleSize(16),
                color: appcolor.dark,
              }}
            >
              {item.workDate}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>
              Đã đi{' '}
            </Text>
            <Text
              style={{
                flexGrow: 1,
                textAlign: 'right',
                fontSize: scaleSize(16),
                color: appcolor.dark,
              }}
            >
              {item.shopActual || '0'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>
              Chỉ tiêu{' '}
            </Text>
            <Text
              style={{
                flexGrow: 1,
                textAlign: 'right',
                fontSize: scaleSize(16),
                color: appcolor.dark,
              }}
            >
              {item.shopPlan || '0'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scaleSize(11), color: appcolor.dark }}>
              Số km đã đi{' '}
            </Text>
            <Text
              style={{
                flexGrow: 1,
                fontWeight: '700',
                textAlign: 'right',
                fontSize: scaleSize(16),
                color: appcolor.success,
              }}
            >
              {item.distance}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      //     :
      // <TouchableOpacity onPress={() => navigation.navigate("routingmonth")}
      //     style={{ alignItems: 'center', justifyContent: 'center', marginEnd: 20, height: '100%' }}>
      //     <View style={{
      //         borderColor: appcolor.light, borderWidth: 2, borderRadius: 100,
      //         alignItems: 'center', justifyContent: 'center', marginEnd: 10,
      //     }}>
      //         <SpiralIcon name="arrow-right" size={20} containerStyle={{ alignSelf: 'center' }} color={appcolor.light} />
      //     </View>
      //     <Text style={{ color: appcolor.lightgray }}>Xem tất cả</Text>
      // </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: '100%', opacity: 0.9 }}>
      <TouchableOpacity
        onPress={loading ? null : handleRefreshData}
        style={{
          borderRadius: 30,
          borderWidth: 0.3,
          borderColor: appcolor.dark,
          padding: 5,
          position: 'absolute',
          end: 0,
          backgroundColor: appcolor.surface,
          position: 'absolute',
          top: 0,
          right: 10,
          zIndex: 1000,
        }}
      >
        <IconAnimation
          isLoop={false}
          sourceIcon={require('../../../Themes/lotties/sync_load.json')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('attendanthistory')}
        style={{ paddingTop: 30 }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexGrow: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: scaleSize(22),
                fontWeight: 'bold',
                color: appcolor.success,
                padding: 2,
              }}
            >
              {data?.aValue || '0'}
            </Text>
            <Text style={{ fontSize: scaleSize(12), color: appcolor.dark }}>
              {data?.aLable}
            </Text>
          </View>
          <View style={{ flexGrow: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: scaleSize(22),
                fontWeight: 'bold',
                color: appcolor.warning,
                padding: 2,
              }}
            >
              {data?.tValue}
            </Text>
            <Text style={{ fontSize: scaleSize(12), color: appcolor.dark }}>
              {data?.tLable}
            </Text>
          </View>
          <View style={{ flexGrow: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: scaleSize(22),
                fontWeight: 'bold',
                color: appcolor.info,
                padding: 2,
              }}
            >
              {data?.pValue || '0%'}
            </Text>
            <Text style={{ fontSize: scaleSize(12), color: appcolor.dark }}>
              {data?.pLable || '%'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: appcolor.primary,
          opacity: 0.2,
          borderRadius: 700,
          position: 'absolute',
          width: 170,
          height: 170,
          left: '-9%',
          top: '-9%',
        }}
      />
      <View
        style={{
          backgroundColor: appcolor.primary,
          opacity: 0.5,
          borderRadius: 700,
          position: 'absolute',
          width: 170,
          height: 170,
          right: '-20%',
          bottom: '-30%',
        }}
      />
      <View style={{ flexGrow: 1 }}></View>
      <View
        style={{
          marginVertical: 8,
          height: 100,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {rowItem({ item: details[0] })}
        <TouchableOpacity
          onPress={() => navigation.navigate('routingmonth')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginEnd: 20,
            height: '100%',
          }}
        >
          <View
            style={{
              borderColor: appcolor.light,
              borderWidth: 2,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              marginEnd: 10,
            }}
          >
            <SpiralIcon
              name="arrow-right"
              size={20}
              containerStyle={{ alignSelf: 'center' }}
              color={appcolor.light}
            />
          </View>
          <Text style={{ color: appcolor.lightgray }}>Xem tất cả</Text>
        </TouchableOpacity>

        {/* <FlashList
                    key='workdate'
                    data={details}
                    horizontal
                    estimatedItemSize={200}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={rowItem}
                /> */}
      </View>
      <ActionSheet
        bottomOffset={50}
        id="shopList"
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ height: deviceHeight - 40 }}>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <Text
              style={{
                width: '86%',
                textAlign: 'center',
                padding: 12,
                fontSize: scaleSize(18),
                color: appcolor.primary,
                fontWeight: 'bold',
              }}
            >
              Cửa hàng đi ngày {selected.workDate}
            </Text>
            <TouchableOpacity
              style={{ width: '12%', marginEnd: 10 }}
              onPress={() => SheetManager.hide('shopList')}
            >
              <SpiralIcon size={14} name="close" raised />
            </TouchableOpacity>
          </View>

          <Tabs.Container
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
                tabStyle={{ width: '50%', height: 42 }}
                style={{ backgroundColor: appcolor.primary }}
              />
            )}
          >
            <Tabs.Tab key={1} name="Lộ trình" label="Lộ trình">
              <View
                style={{
                  backgroundColor: appcolor.light,
                  marginTop: 40,
                  padding: 6,
                  width: deviceWidth,
                }}
              >
                <Routing route={selected} data={jsonRoute} />
              </View>
            </Tabs.Tab>
            <Tabs.Tab key={2} name="Chi tiết" label="Chi tiết">
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  marginTop: 40,
                  padding: 6,
                  width: deviceWidth,
                }}
              >
                <Detail visitList={visitList} />
              </View>
            </Tabs.Tab>
          </Tabs.Container>
        </View>
      </ActionSheet>
    </View>
  );
};
const Detail = ({ visitList }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const rowVisit = ({ item, index }) => {
    const _imageUri = item?.Photo?.includes('https')
      ? item.Photo
      : `${URLDEFAULT}${item.Photo}`;
    return (
      <View
        key={`${index}kah`}
        style={{ padding: 7, backgroundColor: appcolor.light, margin: 7 }}
      >
        <View style={{ padding: 7 }}>
          <Text style={{ fontWeight: '900', color: appcolor.dark }}>
            Cửa hàng {item.ShopCode} {item.ShopName}
          </Text>
          <Text style={{ color: appcolor.dark, fontSize: 12 }}>
            {item?.Address || ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={{ width: '30%', height: 120 }}
            source={{ uri: _imageUri }}
          />
          <View style={{ flexGrow: 1, width: '65%', marginLeft: 7 }}>
            <Text style={{ color: appcolor.dark }}>
              Thời gian đến cửa hàng {item.AttendantTime}
            </Text>
            <Text style={{ color: appcolor.dark, fontSize: 12 }}>
              {item?.TotalTime}
            </Text>
            <Text style={{ color: appcolor.dark, fontSize: 12 }}>
              {item?.ReportList}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <ScrollView>
      <FlatList
        data={visitList}
        showsVerticalScrollIndicator={false}
        renderItem={rowVisit}
      />
    </ScrollView>
  );
};
const Routing = ({ data, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const routeList = JSON.parse(data || '[]');
  var totalTime = routeList.length
    ? routeList
      ?.map(o => o.Duration.value)
      .reduce((a, c) => {
        return a + c;
      })
    : 0;
  totalTime = ConvertSecondToTime(totalTime);
  const rowTimeLine = ({ item, index }) => {
    // console.log(item)
    return (
      <View key={`${index}29a`} style={{ flexDirection: 'row' }}>
        <View
          style={{
            height: 100,
            top: -20,
            backgroundColor: appcolor.light,
            borderRadius: 70,
            borderColor: colorList[index],
            borderWidth: 2,
            width: '40%',
            alignSelf: 'flex-start',
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colorList[index], fontSize: 16 }}>Điểm đi</Text>
          <Text
            numberOfLines={4}
            style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}
          >
            {item.Start_Address}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            justifyContent: 'center',
            top: 26,
            width: 20,
            height: 3,
            backgroundColor: appcolor.warning,
          }}
        >
          {/* <View style={{ left: -18, width: 25, height: 25, borderWidth: 7, borderColor: appcolor.white, borderRadius: 20, backgroundColor: colorList[index] }} /> */}
        </View>
        <View
          style={{
            justifyContent: 'center',
            width: 10,
            height: 230,
            backgroundColor: colorList[index],
          }}
        ></View>
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            top: 40,
            width: 30,
            height: 3,
            backgroundColor: appcolor.danger,
          }}
        >
          <View
            style={{
              left: -18,
              width: 25,
              height: 25,
              borderWidth: 7,
              borderColor: appcolor.white,
              borderRadius: 20,
              backgroundColor: colorList[index],
            }}
          />
        </View>
        <View style={{ width: '40%' }}>
          <View
            style={{ height: 100, justifyContent: 'flex-end', marginBottom: 7 }}
          >
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {item.Distance?.text}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Di chuyển {item.Duration?.text}
            </Text>
          </View>
          <View
            style={{
              height: 100,
              backgroundColor: appcolor.light,
              borderRadius: 49,
              width: '100%',
              alignSelf: 'flex-end',
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: appcolor.danger,
                fontSize: 17,
              }}
            >
              Điểm đến
            </Text>
            <Text
              numberOfLines={4}
              style={{ textAlign: 'center', color: appcolor.dark, fontSize: 9 }}
            >
              {item.End_Address}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: appcolor.surface,
      }}
    >
      <FlatList
        contentContainerStyle={{ paddingTop: 30 }}
        showsVerticalScrollIndicator={false}
        data={routeList}
        ListFooterComponent={<View style={{ height: 100 }} />}
        renderItem={rowTimeLine}
      />
      <View
        style={{
          height: 100,
          backgroundColor: appcolor.light,
          width: '100%',
          padding: 12,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          position: 'absolute',
          bottom: 0,
        }}
      >
        <View style={{ flexDirection: 'row', paddingTop: 10 }}>
          <Text
            style={{
              flexGrow: 0.31,
              fontSize: 28,
              textAlign: 'right',
              fontWeight: 'bold',
              color: appcolor.danger,
            }}
          >
            {totalTime}
          </Text>
          <LottieView
            style={{
              height: 100,
              alignItems: 'center',
              top: -20,
              width: '20%',
            }}
            autoPlay
            autoSize
            source={require('../../../Themes/lotties/location-finding.json')}
          />
          <Text
            style={{
              fontSize: 30,
              flexGrow: 1,
              textAlign: 'right',
              fontWeight: 'bold',
              color: appcolor.danger,
            }}
          >
            {route?.distance}
          </Text>
        </View>
      </View>
    </View>
  );
};
