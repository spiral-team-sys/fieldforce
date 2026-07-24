import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';

import { ACTION } from '../../../Core/ReduxController';
import NativeCamera from '../../../Control/NativeCamera';
import { TODAY } from '../../../Core/Utility';
import moment from 'moment';
import { GetPhotosByType } from '../../../Controller/PhotoController';
import _ from 'lodash';
import { getPhotoByType } from '../../../Controller/DisplayController';
import { Badge } from '@rneui/base';
import { UUIDGenerator } from '../../../Core/Helper';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const photoType = 'KPI_SCORE';
export const ViewListKPIV2 = ({
  dataItem,
  dataGroup,
  dataPhoto,
  showALbumByItem,
  settings,
  dataKPI,
  dataKPIHistory,
  configData,
  countByData,
  configTableData,
  handleSelectHistory,
}) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const dispatch = useDispatch();

  const styles = StyleSheet.create({
    root: { flex: 1 },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      padding: 8,
    },
    totalText: { fontWeight: '500', fontSize: 18, color: appcolor.success },
    groupWrap: { width: '100%', padding: 4 },
    groupHeader: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      padding: 4,
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      zIndex: 1000,
      marginBottom: 4,
    },
    groupHeaderLeft: { justifyContent: 'center', width: '80%' },
    groupHeaderTitle: { fontWeight: '500', fontSize: 15, color: appcolor.dark },
    groupHeaderDesc: {
      fontWeight: '500',
      fontSize: 10,
      color: appcolor.placeholderText,
    },
    groupHeaderRight: {
      padding: 10,
      width: '20%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    groupHeaderTotal: { fontWeight: '500', fontSize: 16, color: appcolor.dark },
    groupHistoryWrap: { justifyContent: 'flex-end', flexDirection: 'row' },
    groupHistoryBtn: {
      flexDirection: 'row',
      padding: 8,
      justifyContent: 'flex-end',
      backgroundColor: appcolor.primary,
      borderRadius: 8,
      zIndex: 1000,
    },
    groupHistoryText: {
      fontWeight: '500',
      fontSize: 15,
      color: appcolor.white,
    },
    groupShowDetail: { width: '100%', zIndex: 10 },
    groupShowDetailNone: { display: 'none' },
    groupDivider: { padding: 4, marginBottom: 4, marginTop: 8 },
    noteForm: { backgroundColor: appcolor.placeholderBody, margin: 8 },
    flatListContent: { zIndex: 10 },
    itemKPIWrap: { flex: 1 },
    itemKPIBtn: {},
    itemKPIContent: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    itemKPIContentLock: { opacity: 0.4 },
    itemKPIIcon: { textAlign: 'center' },
    itemKPIName: {
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
      padding: 8,
      width: '75%',
    },
    itemKPIPointWrap: { alignItems: 'center', padding: 4, width: '16%' },
    itemKPIPoint: { color: appcolor.dark, fontSize: 14, fontWeight: '500' },
    noteFormItem: {
      flex: 1,
      backgroundColor: appcolor.placeholderBody,
      margin: 8,
    },
    groupNoteForm: { backgroundColor: appcolor.placeholderBody, margin: 8 },
    showDetail: { width: '100%', zIndex: 10 },
    showDetailNone: { display: 'none' },
    divider: { padding: 4, marginBottom: 4, marginTop: 8 },
    scrollBottom: { height: 100 },
  });

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

  const handleNoteItem = (text, item) => {
    const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);
    const detail = JSON.parse(dataKPI[indexData].detail);
    const indexDetail = detail.findIndex(i => i.KPIId == item.KPIId);

    const itemDetail = detail[indexDetail];
    itemDetail.note = text;
    item.note = text;
    dataKPI[indexData].detail = JSON.stringify(detail);
    dataKPI[indexData].groupDetail = JSON.stringify(dataGroup);
  };
  const handlerAnswer = (item, index, currentTab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        if (configData.noteByItem == 1) {
          it.note = null;
        }
      }
      dataItem.map(it => {
        if (it.SubGroupId == item.SubGroupId) {
          it.IsChecked = it.KPIId == item.KPIId ? value : 0;
          if (configData.noteByItem == 1) {
            it.note = null;
          }
        }
      });
      dataKPI[indexData].detail = JSON.stringify(detail);
      dataKPI[indexData].groupDetail = JSON.stringify(dataGroup);
    } else {
      const itemDetail = detail[indexDetail];
      itemDetail.IsChecked = value;
      item.IsChecked = value;
      if (configData.noteByItem == 1) {
        itemDetail.note = null;
        item.note = null;
      }
      dataKPI[indexData].detail = JSON.stringify(detail);
      dataKPI[indexData].groupDetail = JSON.stringify(dataGroup);
    }
    countByData(dataKPI);
    setMutate(e => !e);
  };
  const takePicture = async (item, type) => {
    const _guid = item.guid ? item.guid : UUIDGenerator();
    if (!item.guid) {
      const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);
      const detail = JSON.parse(dataKPI[indexData].detail);
      const indexDetail = detail.findIndex(i => i.KPIId == item.KPIId);
      const itemDetail = detail[indexDetail];
      itemDetail.guid = _guid;
      item.guid = _guid;
      dataKPI[indexData].detail = JSON.stringify(detail);
      dataKPI[indexData].groupDetail = JSON.stringify(dataGroup);
    }
    const photoinfo = {
      shopId: 0,
      shopCode: 0,
      reportId: kpiinfo.id,
      photoDate: TODAY,
      photoTime: new Date().getTime(),
      photoType: photoType + `_${settings.userId}`,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: 0,
      shopLong: 0,
      guid: _guid,
      photoFullTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    await actionPhoto(photoinfo, type, item);
  };
  const actionPhoto = async (photoinfo, type, item) => {
    switch (type) {
      case 'TAKE':
        await NativeCamera.cameraStart(photoinfo, () => {
          actionCallBackResult(item);
        });
        break;
      case 'UPLOAD':
        await NativeCamera.imageGalleryLaunch(photoinfo, () => {
          actionCallBackResult(item);
        });
        break;
    }
  };
  const actionCallBackResult = async item => {
    const listPhoto = await getPhotoByType(
      photoType + `_${settings.userId}`,
      item.guid,
    );
    let newPhotoList = [];
    listPhoto.map(it => {
      let ImgName = it.photoPath.substring(
        it.photoPath.lastIndexOf('/') + 1,
        it.photoPath.length,
      );
      let fileName = '/uploaded/' + it.photoDate + '/' + ImgName;

      newPhotoList.push({
        id: it.id,
        guid: it.guid,
        photoDate: it.photoDate,
        photoFullTime: it.photoFullTime,
        reportId: it.reportId,
        photoType: it.photoType,
        photoPath: it.photoPath,
        url: fileName,
      });
    });
    const indexData = dataKPI.findIndex(i => i.groupId == item.GroupId);
    const detail = JSON.parse(dataKPI[indexData].detail);
    const indexDetail = detail.findIndex(i => i.KPIId == item.KPIId);
    const itemDetail = detail[indexDetail];
    itemDetail.listPhoto = JSON.stringify(newPhotoList || []);
    item.listPhoto = JSON.stringify(newPhotoList || []);
    dataKPI[indexData].detail = JSON.stringify(detail);
    dataKPI[indexData].groupDetail = JSON.stringify(dataGroup);
    await setMutate(e => !e);
  };
  const RenderItemKPI = ({ item, index, currentTab }) => {
    const onPressItem = () => {
      handlerAnswer(item, index, currentTab);
    };
    let dataPhotoByItem = JSON.parse(item.listPhoto || '[]');
    return (
      <View key={`item_${index}`} style={styles.itemKPIWrap}>
        <TouchableOpacity
          key={`iiemwd_${index}`}
          activeOpacity={item.isLock == 1 ? 1 : 0.4}
          onPress={item.isLock == 1 ? null : onPressItem}
          style={styles.itemKPIBtn}
        >
          <View
            style={[
              styles.itemKPIContent,
              item.isLock == 1 && styles.itemKPIContentLock,
              { opacity: undefined },
            ]}
          >
            <SpiralIcon
              style={styles.itemKPIIcon}
              type="font-awesome-5"
              name={item.IsChecked == 1 ? 'check-circle' : 'circle'}
              size={18}
              color={item.IsChecked == 1 ? appcolor.success : appcolor.dark}
            />
            <Text style={styles.itemKPIName}>{`${item.KPIName}`}</Text>
            <View style={styles.itemKPIPointWrap}>
              <Text style={styles.itemKPIPoint}>{`${item.mPoint}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {item.IsChecked == 1 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 8,
            }}
          >
            {configData.isTakePicture == 1 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'column' }}>
                  <TouchableOpacity
                    onPress={() => takePicture(item, 'TAKE')}
                    style={{
                      width: 50,
                      height: 40,
                      backgroundColor: appcolor.light,
                      borderWidth: 0.5,
                      borderRadius: 5,
                      borderColor: appcolor.greydark,
                      marginRight: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <SpiralIcon
                      color={appcolor.dark}
                      name="camera"
                      type="ionicon"
                      size={20}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => takePicture(item, 'UPLOAD')}
                    style={{
                      width: 50,
                      height: 40,
                      backgroundColor: appcolor.light,
                      borderWidth: 0.5,
                      borderRadius: 5,
                      borderColor: appcolor.greydark,
                      marginRight: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <SpiralIcon
                      color={appcolor.dark}
                      name="attach"
                      type="ionicon"
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    dataPhotoByItem?.length > 0
                      ? showALbumByItem(dataPhotoByItem, item)
                      : null
                  }
                  style={{
                    width: 50,
                    height: 80,
                    backgroundColor: appcolor.light,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    borderColor: appcolor.greydark,
                    marginRight: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <SpiralIcon
                    color={appcolor.dark}
                    name="images"
                    type="ionicon"
                    size={20}
                  />
                  <Badge
                    value={dataPhotoByItem?.length || 0}
                    textStyle={{ fontSize: 10 }}
                    badgeStyle={{ width: 20, height: 20, borderRadius: 12.5 }}
                    status="primary"
                    containerStyle={{ position: 'absolute', top: 2, right: 2 }}
                  />
                </TouchableOpacity>
              </View>
            )}
            {configData.noteByItem == 1 && item.IsChecked == 1 && (
              <FormGroup
                containerStyle={styles.noteFormItem}
                editable={item.isLock == 0}
                title="Ghi chú"
                placeholder="Nhập ghi chú"
                defaultValue={item.note}
                handleChangeForm={text => handleNoteItem(text, item)}
                onClearTextAndroid={text => handleNoteItem(text, item)}
              />
            )}
          </View>
        )}
      </View>
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
    <View style={styles.root}>
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>
          {configTableData?.titlePoint || 'Tổng điểm'}
        </Text>
        <Text style={styles.totalText}>{countTotal || 0}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {dataGroup.map((it, idx) => {
          const { dataByGroup, totalByGroup } = filterData(it);
          const noteAction = text => {
            handlerNote(text, it, idx);
          };
          const dataHistoryByGroup =
            dataKPIHistory?.length > 0
              ? dataKPIHistory?.filter(
                  ith =>
                    ith.GroupId == it.GroupId &&
                    ith.SubGroupId == it.SubGroupId,
                )
              : [];
          return (
            <View key={'ViewGroup_' + idx} style={styles.groupWrap}>
              {(dataGroup?.length > 1 ||
                configTableData?.showGroupDetail == 1) && (
                <View>
                  <TouchableOpacity
                    onPress={() => onPressShow(it)}
                    style={styles.groupHeader}
                  >
                    <View style={styles.groupHeaderLeft}>
                      <Text style={styles.groupHeaderTitle}>
                        {it.SubGroupName}
                      </Text>
                      {it.Decription && (
                        <Text style={styles.groupHeaderDesc}>
                          {it.Decription}
                        </Text>
                      )}
                    </View>
                    <View style={styles.groupHeaderRight}>
                      {configData.byShop == 0 && (
                        <Text style={styles.groupHeaderTotal}>
                          ({totalByGroup || 0})
                        </Text>
                      )}
                      <SpiralIcon
                        name={
                          it.isShowDetail ? 'chevron-down' : 'chevron-right'
                        }
                        type="font-awesome-5"
                        size={20}
                        color={appcolor.dark}
                      />
                    </View>
                  </TouchableOpacity>
                  {dataHistoryByGroup?.length > 0 && (
                    <View style={styles.groupHistoryWrap}>
                      <TouchableOpacity
                        onPress={() => handleSelectHistory(dataHistoryByGroup)}
                        style={styles.groupHistoryBtn}
                      >
                        <Text style={styles.groupHistoryText}>
                          Lịch sử chấm điểm
                        </Text>
                        {it.Decription && (
                          <Text style={styles.groupHeaderDesc}>
                            {it.Decription}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              <View
                style={[
                  it.isShowDetail ||
                  (dataGroup?.length == 1 &&
                    configTableData?.showGroupDetail !== 1)
                    ? styles.groupShowDetail
                    : styles.groupShowDetailNone,
                ]}
              >
                {configData.noteByGroup == 1 && (
                  <FormGroup
                    containerStyle={styles.groupNoteForm}
                    editable={it.isLock == 0}
                    title="Ghi chú"
                    placeholder="Nhập ghi chú"
                    defaultValue={it.note}
                    handleChangeForm={noteAction}
                    onClearTextAndroid={noteAction}
                  />
                )}
                <FlatList
                  key={`${it.GroupId}_${it.SubGroupId}_${idx}`}
                  contentContainerStyle={styles.flatListContent}
                  scrollEnabled={false}
                  extraData={dataByGroup}
                  keyExtractor={(_item, index) => index.toString()}
                  data={dataByGroup}
                  removeClippedSubviews={true}
                  initialNumToRender={10}
                  maxToRenderPerBatch={1}
                  updateCellsBatchingPeriod={100}
                  windowSize={7}
                  renderItem={({ item, index }) => (
                    <RenderItemKPI item={item} index={index} currentTab={it} />
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
              <Card.Divider style={styles.divider} />
            </View>
          );
        })}
        <View style={styles.scrollBottom} />
      </ScrollView>
    </View>
  );
};
