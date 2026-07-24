import React, { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { REPORT } from '../../../../API/ReportAPI';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import LoadingDefault from '../../../../Control/ItemLoading/LoadingDefault';
import { formatNumber } from '../../../../Core/Helper';
import ViewPictures from '../../../../Control/Gallary/ViewPictures';
import { toastError } from '../../../../Utils/configToast';
import _ from 'lodash';
import { URLDEFAULT } from '../../../../Core/URLs';

const EvaluateScreen = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewPhoto, _setViewPhoto] = useState({
    visible: false,
    data: [],
    index: 0,
  });
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    const params = {
      shopId: shopinfo.shopId,
      reportId: kpiinfo.id,
    };
    //
    await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
      message && toastError('Thông báo', message);
      setData(mData);
    });
    await setLoading(false);
  };

  const onSwipeDown = () => {
    viewPhoto.visible = false;
    viewPhoto.data = [];
    viewPhoto.index = 0;
    setMutate(e => !e);
  };

  const handlerEvaluateDetail = (itemGroup, item) => {
    if (item.id === 2) {
      navigation.navigate('uploaddeliveryslip', { data: itemGroup });
      return;
    }
    navigation.navigate('evaluatedetail', {
      dataItem: itemGroup,
      itemVerify: item,
    });
  };

  const handlerShowImage = (photoIndex, photoList = []) => {
    viewPhoto.visible = true;
    viewPhoto.data = photoList;
    viewPhoto.index = photoIndex;
    setMutate(e => !e);
  };

  useEffect(() => {
    const _reload = DeviceEventEmitter.addListener(
      'RELOAD_DATA_EVALUATE',
      LoadData,
    );
    LoadData();
    return () => {
      _reload.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    card: {
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 0.5,
      margin: 8,
      borderColor: appcolor.grayLight,
      padding: 8,
      elevation: 2,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleName: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    statusTag: {
      borderRadius: 20,
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 20,
      marginRight: 8,
      width: '20%',
    },
    statusText: {
      fontSize: 12,
      color: appcolor.light,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    labelName: { fontSize: 12, color: appcolor.dark },
    valueName: {
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
    subValueName: {
      fontSize: 11,
      color: appcolor.placeholderText,
      fontStyle: 'italic',
    },
    row: { marginTop: 8 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    photoImage: { width: 120, height: 120, borderRadius: 8, marginEnd: 8 },
    cardContent: { flex: 1, marginBottom: 8 },
    cardContentItem: { flex: 1 },
    titlePhoto: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    countPhoto: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    photoItem: {
      marginTop: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: appcolor.light,
    },
    countPhotoText: { fontSize: 12, color: appcolor.light },
    rowAward: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerRowContent: { flexDirection: 'column', width: '70%' },
    passedName: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    historyContainer: {
      marginTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: appcolor.grayLight,
      paddingTop: 10,
    },
    historyTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    historyTitleIcon: { fontSize: 13, marginRight: 4 },
    historyTitle: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    historyItem: {
      backgroundColor: appcolor.surface,
      borderRadius: 10,
      padding: 10,
      marginBottom: 6,
    },
    historyTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    historyDate: { fontSize: 11, color: appcolor.placeholderText },
    historyReviewer: {
      fontSize: 11,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      flex: 1,
      textAlign: 'right',
      marginLeft: 6,
    },
    historyBadge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginHorizontal: 6,
    },
    historyBadgeText: {
      fontSize: 11,
      color: appcolor.light,
      fontWeight: fontWeightBold,
    },
    historyNote: {
      fontSize: 11,
      color: appcolor.dark,
      fontStyle: 'italic',
      marginTop: 6,
    },
    historyPhotoRow: {
      flexDirection: 'row',
      marginTop: 8,
      flexWrap: 'wrap',
      gap: 6,
    },
    historyPhoto: { width: 68, height: 68, borderRadius: 10 },
  });
  const renderItem = ({ item: programItem, index: programIndex }) => {
    const verifyList = JSON.parse(programItem.verifyList || '[]');
    const jsonHistory = JSON.parse(programItem.jsonHistory || '[]');
    return (
      <>
        {verifyList?.length > 0 && (
          <View style={styles.card}>
            <View style={{ width: '100%' }}>
              <View style={styles.headerRow}>
                <View style={styles.headerRowContent}>
                  <Text style={styles.titleName} numberOfLines={2}>
                    {programItem.programName}
                  </Text>
                  <Text
                    style={styles.subValueName}
                  >{`${programItem.fromDate} - ${programItem.toDate}`}</Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: appcolor.surface,
                  padding: 8,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <View style={styles.rowAward}>
                  <Text style={styles.labelName}>Hình thức thưởng</Text>
                  {programItem.awardValue && (
                    <Text style={styles.valueName}>{`${formatNumber(
                      programItem.awardValue,
                      ',',
                    )} ${programItem.awardTypeName || ''}`}</Text>
                  )}
                </View>
                {programItem.totalAwardValue > 0 && (
                  <Text style={styles.valueName}>{`Tổng thưởng: ${formatNumber(
                    programItem.totalAwardValue,
                    ',',
                  )} VNĐ`}</Text>
                )}
                {programItem.awardName && (
                  <Text
                    style={[
                      styles.subValueName,
                      { textAlign: 'right', marginTop: 4 },
                    ]}
                  >
                    {programItem.awardName}
                  </Text>
                )}
              </View>
              <View style={styles.cardContent}>
                <CustomListView
                  data={verifyList}
                  renderItem={groups =>
                    renderItemGroup(
                      groups.item,
                      groups.index,
                      programItem,
                      programIndex,
                    )
                  }
                  bottomView={{ paddingBottom: 0 }}
                />
              </View>

              {/* Lịch sử đánh giá */}
              {jsonHistory.length > 0 && (
                <View style={styles.historyContainer}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyTitle}>
                      Lịch sử đánh giá trưng bày
                    </Text>
                  </View>
                  {jsonHistory.map((h, hIdx) => {
                    const isPassed = h.PassedName === 'Đạt';
                    const badgeColor = isPassed
                      ? appcolor.success
                      : appcolor.red;
                    const historyPhotos = h.jsonPhoto || [];
                    const photoListForViewer = historyPhotos.map(p => ({
                      photoPath: URLDEFAULT + p.PhotoPath,
                      photoType: p.PhotoType,
                    }));
                    return (
                      <View key={hIdx} style={styles.historyItem}>
                        <View style={styles.historyTopRow}>
                          <Text style={styles.historyDate}>{h.ReportDate}</Text>
                          <View
                            style={[
                              styles.historyBadge,
                              { backgroundColor: badgeColor },
                            ]}
                          >
                            <Text style={styles.historyBadgeText}>
                              {h.PassedName}
                            </Text>
                          </View>
                        </View>
                        {!!h.ReviewNote && (
                          <Text
                            style={[styles.historyNote, { marginBottom: 8 }]}
                          >
                            {h.ReviewNote}
                          </Text>
                        )}
                        {historyPhotos.length > 0 && (
                          <CustomListView
                            horizontal
                            data={historyPhotos}
                            renderItem={({ item: p, index: pIdx }) => (
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() =>
                                  handlerShowImage(pIdx, photoListForViewer)
                                }
                              >
                                <Image
                                  source={{ uri: URLDEFAULT + p.PhotoPath }}
                                  style={[
                                    styles.historyPhoto,
                                    { marginRight: 6 },
                                  ]}
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            )}
                            scrollEnabled={false}
                            ListEmpty={<View />}
                            containerStyle={{ marginTop: 8 }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </>
    );
  };
  const renderItemGroup = (item, index, itemGroup, indexGroup) => {
    const onPress = () => handlerEvaluateDetail(itemGroup, item);

    return (
      item.byShop == 1 && (
        <View style={styles.row}>
          <TouchableOpacity
            disabled={item.isLocked == 1}
            onPress={onPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              backgroundColor: appcolor.surface,
              borderRadius: 8,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: appcolor.dark,
                  fontWeight: fontWeightBold,
                }}
              >
                {index + 1}.
              </Text>
              <Text
                style={[
                  styles.labelName,
                  {
                    marginLeft: 4,
                    fontWeight: fontWeightBold,
                    textDecorationLine:
                      item.isLocked == 1 ? 'line-through' : 'none',
                  },
                ]}
              >
                {item.name}
              </Text>
            </View>
            <Text
              style={[
                styles.valueName,
                { color: appcolor[item.passedColor || 'dark'] },
              ]}
            >
              {item.passedName}
            </Text>
          </TouchableOpacity>
        </View>
      )
    );
  };

  if (loading)
    return (
      <View style={styles.mainContainer}>
        <HeaderCustom
          title={kpiinfo.menuNameVN}
          leftFunc={() => navigation.goBack()}
        />
        <LoadingDefault
          isLoading={loading}
          styles={styles.loading}
          title={''}
        />
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
      />
      <CustomListView
        data={data}
        renderItem={renderItem}
        onRefresh={LoadData}
      />
      <ViewPictures
        visible={viewPhoto.visible}
        initialIndex={viewPhoto.index}
        images={viewPhoto.data}
        onSwipeDown={onSwipeDown}
      />
    </View>
  );
};

export default EvaluateScreen;
