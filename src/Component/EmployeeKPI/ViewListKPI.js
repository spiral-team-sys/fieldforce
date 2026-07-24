import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { deviceHeight } from '../../Core/Utility';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ViewListKPI = ({ dataItem, dataGroup, dataKPI, configData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_, setMutate] = useState(false);

  const onPressShow = item => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.isShowDetail = item.isShowDetail ? false : true;
    setMutate(e => !e);
  };
  const countTotalByTab = () => {
    let totalByTab = 0;
    dataItem.map(it => {
      if (it.IsChecked == 1) {
        totalByTab = totalByTab + (it.Point || 0);
      }
    });
    return totalByTab;
  };
  let countTotal = countTotalByTab();

  const handlerAnswer = (item, index, currentTab) => {
    const value = item.IsChecked == 1 ? 0 : 1;
    const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);
    const detail = JSON.parse(dataKPI[indexData].detail);
    const indexDetail = detail.findIndex(i => i.KPIId == item.KPIId);

    if (item.isSingleChoice == 1) {
      for (let i = 0; i < detail.length; i++) {
        const it = detail[i];
        if (
          it.KPIId == item.KPIId &&
          (it.SubGroupId || 0) == (currentTab.SubGroupId || 0)
        ) {
          it.IsChecked = value;
        } else if ((it.SubGroupId || 0) == (currentTab.SubGroupId || 0)) {
          it.IsChecked = 0;
        }
      }
      dataItem.map(it => {
        if (it.SubGroupId == item.SubGroupId) {
          it.IsChecked = it.KPIId == item.KPIId ? value : 0;
        }
      });
      dataKPI[indexData].detail = JSON.stringify(detail);
    } else {
      const itemDetail = detail[indexDetail];
      itemDetail.IsChecked = value;
      item.IsChecked = value;
      dataKPI[indexData].detail = JSON.stringify(detail);
    }
    setMutate(e => !e);
  };

  const RenderItemKPI = ({ item, index, currentTab }) => {
    const onPressItem = () => {
      handlerAnswer(item, index, currentTab);
    };
    return (
      <TouchableOpacity
        key={`iiemwd_${index}`}
        onPress={item.isLock == 1 ? null : onPressItem}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: appcolor.grayLight,
          }}
        >
          <SpiralIcon
            style={{ textAlign: 'center' }}
            type="font-awesome-5"
            name={item.IsChecked == 1 ? 'check-circle' : 'circle'}
            size={18}
            color={item.IsChecked == 1 ? appcolor.success : appcolor.dark}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: appcolor.dark,
              padding: 8,
              width: '75%',
            }}
          >{`${item.KPIName}`}</Text>
          <View style={{ alignItems: 'center', padding: 4, width: '16%' }}>
            <Text
              style={{ color: appcolor.dark, fontSize: 14, fontWeight: '500' }}
            >{`${item.mPoint}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filterData = item => {
    const dataByGroup = dataItem.filter(
      itemD => itemD.SubGroupId == item.SubGroupId,
    );
    let totalByGroup = 0;
    dataByGroup.map(it => {
      if (it.IsChecked == 1) {
        totalByGroup = totalByGroup + (it.Point || 0);
      }
    });
    return { dataByGroup: dataByGroup, totalByGroup: totalByGroup };
  };
  const handlerNote = (text, item, i) => {
    const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);
    const detail = JSON.parse(dataKPI[indexData].detail);
    // const indexDetail = detail.findIndex(i => i.KPIId == item.KPIId)
    for (let i = 0; i < detail.length; i++) {
      const it = detail[i];
      if ((it.SubGroupId || 0) == (item.SubGroupId || 0)) {
        it.note = text;
      }
    }
    for (let i = 0; i < dataItem.length; i++) {
      const itD = dataItem[i];
      if ((itD.SubGroupId || 0) == (item.SubGroupId || 0)) {
        itD.note = text;
      }
    }
    dataKPI[indexData].detail = JSON.stringify(detail);
    item.note = text;
    setMutate(e => !e);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          padding: 8,
        }}
      >
        <Text
          style={{ fontWeight: '500', fontSize: 18, color: appcolor.success }}
        >
          Tổng điểm
        </Text>
        <Text
          style={{ fontWeight: '500', fontSize: 18, color: appcolor.success }}
        >
          {countTotal || 0}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {dataGroup.map((it, idx) => {
          const { dataByGroup, totalByGroup } = filterData(it);
          const noteAction = text => {
            handlerNote(text, it, idx);
          };

          return (
            <View
              key={'ViewGroup_' + idx}
              style={{ width: '100%', padding: 4 }}
            >
              {dataGroup?.length > 1 && (
                <TouchableOpacity
                  onPress={() => onPressShow(it)}
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: 4,
                    backgroundColor: appcolor.surface,
                    borderRadius: 8,
                    zIndex: 1000,
                  }}
                >
                  <View style={{ justifyContent: 'center', width: '80%' }}>
                    <Text
                      style={{
                        fontWeight: '500',
                        fontSize: 15,
                        color: appcolor.dark,
                      }}
                    >
                      {it.SubGroupName}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '500',
                        fontSize: 10,
                        color: appcolor.placeholderText,
                      }}
                    >
                      {it.Decription}
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: 10,
                      width: '20%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    {configData.byShop == 0 && (
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 16,
                          color: appcolor.dark,
                        }}
                      >
                        ({totalByGroup || 0})
                      </Text>
                    )}
                    <SpiralIcon
                      name={it.isShowDetail ? 'chevron-down' : 'chevron-right'}
                      type="font-awesome-5"
                      size={20}
                      color={appcolor.dark}
                    />
                  </View>
                </TouchableOpacity>
              )}
              <View
                style={{
                  width: '100%',
                  display:
                    it.isShowDetail || dataGroup?.length == 1 ? 'flex' : 'none',
                  zIndex: 10,
                }}
              >
                {configData.noteByGroup !== 1 && (
                  <FormGroup
                    containerStyle={{
                      backgroundColor: appcolor.placeholderBody,
                      margin: 8,
                    }}
                    editable={it.isLock == 0}
                    title="Ghi chú"
                    placeholder="Nhập ghi chú"
                    defaultValue={it.note}
                    handleChangeForm={noteAction}
                  />
                )}
                <FlatList
                  key={`${it.GroupId}_${it.SubGroupId}_${idx}`}
                  contentContainerStyle={{ zIndex: 10 }}
                  scrollEnabled={false}
                  extraData={dataByGroup}
                  keyExtractor={(_item, index) => index.toString()}
                  data={dataByGroup}
                  removeClippedSubviews={true}
                  initialNumToRender={2}
                  maxToRenderPerBatch={1}
                  updateCellsBatchingPeriod={100}
                  windowSize={7}
                  renderItem={({ item, index }) => (
                    <RenderItemKPI item={item} index={index} currentTab={it} />
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          );
        })}
        <View style={{ height: deviceHeight / 3 }} />
      </ScrollView>
    </View>
  );
};
