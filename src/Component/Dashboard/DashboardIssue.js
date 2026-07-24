import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Divider } from '@rneui/base';
import { useSelector } from 'react-redux';
import { groupDataByKey } from '../../Core/Helper';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';
import ImageZoom from '../../Content/ImageZoom';
import { URLDEFAULT } from '../../Core/URLs';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const DashboardIssue = ({ info }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [viewDetail, setViewDetail] = useState(false);
  let viewAll = [];
  const data = info !== null ? JSON.parse(info.chartData) : [];
  const dataPhoto = info !== null ? JSON.parse(info.dataPhoto) : [];

  if (Array.isArray(data) && data.length > 0) {
    viewAll.push(
      <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            width: '50%',
            alignItems: 'center',
            color: appcolor.dark,
            fontWeight: '500',
            paddingBottom: 8,
          }}
        ></Text>
        <Text
          style={{
            width: '50%',
            textAlign: 'center',
            color: appcolor.dark,
            fontWeight: '500',
            paddingBottom: 8,
          }}
        >
          Thực tế
        </Text>
      </View>,
    );
    viewAll.push(
      <Divider
        key="313a"
        style={{
          backgroundColor: appcolor.grayLight,
          height: 1,
          width: '100%',
        }}
      />,
    );
    data.forEach((item, index) => {
      viewAll.push(
        <View
          key={index.toString()}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: '50%', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 15,
                color: appcolor.dark,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              {item.RTime}
            </Text>
          </View>
          <View style={{ width: '50%', alignItems: 'center' }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 14,
                color: appcolor.tomato,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              {item.Actual}
            </Text>
          </View>
        </View>,
      );
      viewAll.push(
        <Divider
          key={'so' + index.toString()}
          style={{
            backgroundColor: appcolor.grayLight,
            height: 1,
            width: '100%',
          }}
        />,
      );
    });
  } else {
    viewAll.push(
      <Text
        key="s1oi"
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 15,
          color: appcolor.danger,
        }}
      >
        Chưa có dữ liệu báo cáo vấn đề
      </Text>,
    );
  }
  return (
    <TouchableOpacity onPress={() => setViewDetail(e => !e)}>
      <View
        style={{
          backgroundColor: appcolor.surface,
          padding: 8,
          borderRadius: 10,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SpiralIcon color={appcolor.info} name="chart-area" size={23} />
          <Text
            style={{
              marginEnd: 8,
              color: appcolor.dark,
              marginStart: 8,
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            {' '}
            {info !== null ? info.chartName : ''}
          </Text>
        </View>
        <View style={{ marginTop: 12 }}>{viewAll}</View>
      </View>

      <Modal visible={viewDetail}>
        <DetailData
          title={info.chartName}
          data={JSON.parse(info.detailData)}
          dataPhoto={dataPhoto}
          appcolor={appcolor}
          onClose={() => setViewDetail(false)}
        />
      </Modal>
    </TouchableOpacity>
  );
};

export const DetailData = ({ title, data, dataPhoto, appcolor, onClose }) => {
  const insets = useSafeAreaInsets();
  const [lstPhoto, setLstPhoto] = useState([]);
  const bottomSheet = useRef();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  const showImage = isShow => {
    isShow ? bottomSheet.current.show() : bottomSheet.current.hide();
  };

  const onShowImage = item => {
    const index = dataPhoto.findIndex(it => it.photoPath == item.photoPath);
    setImageIndex(index);
    showImage(true);
  };

  const LoadData = async () => {
    const arrPhoto = [];
    const { arr } = groupDataByKey({
      arr: dataPhoto,
      key: 'photoDate',
    });
    arr.map(it => {
      if (it.isParent) {
        const lstItem = [];
        arr.map(item => {
          item.photoDate === it.photoDate && lstItem.push(item);
        });
        arrPhoto.push({
          listPhoto: lstItem,
          title: moment(it.photoDate.toString()).format('YYYY-MM-DD'),
        });
      }
    });
    await setLstPhoto(arrPhoto);
  };

  useEffect(() => {
    LoadData();
  }, []);
  // const showImage = (path) => {
  //     setImageUrl(path);
  //     path ? bottomSheet.current.show() : bottomSheet.current.hide()
  // }

  const renderItemPhoto = ({ item, index }) => {
    return (
      <View style={{ flex: 1, padding: 5, paddingLeft: 10 }}>
        <View
          style={{
            width: '100%',
            borderRadius: 5,
            backgroundColor: appcolor.surface,
            padding: 10,
            marginVertical: 5,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: 'bold',
              fontStyle: 'italic',
              color: appcolor.dark,
            }}
          >
            {item.photoNote}
          </Text>
        </View>
        <TouchableOpacity
          style={{ borderRadius: 10, borderRadius: 10 }}
          onPress={() => onShowImage(item)}
        >
          <ImageBackground
            imageStyle={{ borderRadius: 10 }}
            source={{
              uri:
                item.photoPath.indexOf('https://') === -1
                  ? URLDEFAULT + item.photoPath
                  : item.photoPath,
            }}
            style={{ width: '100%', borderRadius: 10, height: 130, zIndex: 3 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ flex: 1, borderRadius: 10 }}>
        <View
          style={{
            width: '100%',
            borderRadius: 5,
            backgroundColor: appcolor.secondary,
            padding: 10,
            marginVertical: 5,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: 'bold',
              fontStyle: 'italic',
              color: appcolor.dark,
            }}
          >
            {item.title}
          </Text>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          keyExtractor={(_, index) => index.toString()}
          data={item.listPhoto}
          renderItem={renderItemPhoto}
        />
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <SafeAreaView
        style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: appcolor.primary,
          padding: 5,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}
        >
          <SpiralIcon
            name={'times'}
            size={scaleSize(23)}
            solid={true}
            color={appcolor.white}
          />
        </TouchableOpacity>
        <Text
          style={{
            width: '80%',
            textAlign: 'center',
            fontSize: scaleSize(18),
            fontWeight: '700',
            padding: 5,
            color: appcolor.white,
          }}
        >
          {title}
        </Text>
      </SafeAreaView>
      {lstPhoto.length > 0 && (
        <Tabs.Container
          renderTabBar={props => (
            <MaterialTabBar
              {...props}
              scrollEnabled={true}
              tabStyle={{
                minWidth: deviceWidth / (lstPhoto.length > 0 ? 1 : 0),
                height: 42,
              }}
              labelStyle={{ fontSize: 14, fontWeight: '600' }}
              indicatorStyle={{ backgroundColor: appcolor.primary }}
              inactiveColor={appcolor.dark}
              activeColor={appcolor.dark}
              style={{ backgroundColor: appcolor.light }}
            />
          )}
          containerStyle={{ backgroundColor: appcolor.surface }}
        >
          <Tabs.Tab
            key={'Hình ảnh báo cáo'}
            label={'Hình ảnh báo cáo'}
            name={'Hình ảnh báo cáo'}
          >
            <View
              key={'Hình ảnh báo cáo'}
              style={{
                backgroundColor: appcolor.light,
                marginTop: 40,
                padding: 6,
                width: deviceWidth,
              }}
            >
              <FlatList
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                keyExtractor={(_, index) => index.toString()}
                data={lstPhoto}
                renderItem={renderItem}
              />
              <ActionSheet
                ref={bottomSheet}
                containerStyle={{ paddingBottom: insets.bottom }}
              >
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: appcolor.light,
                  }}
                >
                  <MultipleShowImage
                    key={'ShowItemImage'}
                    listItem={dataPhoto}
                    closeShowImage={() => showImage(false)}
                    indexItem={imageIndex}
                    isShowTitle={true}
                    titleFeild="photoNote"
                  />
                  {/* <ImageZoom ImagePath={imageUrl} />
                                    <TouchableOpacity onPress={() => showImage(null)}
                                        style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}>
                                        <SpiralIcon name='times' type='font-asomeware-5' size={30} color={appcolor.dark} />
                                    </TouchableOpacity> */}
                </View>
              </ActionSheet>
            </View>
          </Tabs.Tab>
        </Tabs.Container>
      )}
    </View>
  );
};
