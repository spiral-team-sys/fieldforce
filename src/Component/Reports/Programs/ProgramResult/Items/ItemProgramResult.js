import { Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import { formatNumber } from '../../../../../Core/Helper';
import _ from 'lodash';
import { URLDEFAULT } from '../../../../../Core/URLs';
import ViewPictures from '../../../../../Control/Gallary/ViewPictures';

const ItemProgramResult = ({ data = [] }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataGroup, setDataGroup] = useState([]);
  const [dataView, setDataView] = useState([]);
  const [photo, _setPhoto] = useState({ visible: false, data: [], index: 0 });
  const [_mutate, setMutate] = useState(false);

  const LoadData = () => {
    const groupList = _.unionBy(data, 'TypeData');
    setDataGroup(groupList);
    setDataView(data);
  };

  const handlerShowImage = (index, dataPhotos) => {
    photo.visible = true;
    photo.index = index;
    photo.data = dataPhotos.map(item => ({
      ...item,
      photoPath: URLDEFAULT + item.PhotoPath,
    }));
    setMutate(e => !e);
  };
  const handlerCloseImage = () => {
    photo.visible = false;
    photo.index = 0;
    photo.data = [];
    setMutate(e => !e);
  };

  useEffect(() => {
    LoadData();
  }, [data]);

  const styles = StyleSheet.create({
    itemContainer: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 0 },
    groupTitle: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemContent: {
      flex: 1,
      backgroundColor: appcolor.light,
      marginVertical: 6,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      shadowOpacity: 0.06,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
      overflow: 'hidden',
    },
    cardBody: { padding: 12 },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      flex: 1,
    },
    subTitleName: { fontSize: 12, fontWeight: '500', color: appcolor.dark },
    awardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    awardText: {
      fontSize: 11,
      color: appcolor.placeholderText,
      fontStyle: 'italic',
    },
    progressSection: { marginTop: 8, alignItems: 'center' },
    titleValue: { fontSize: 22, fontWeight: 'bold', color: appcolor.dark },
    statusBadge: {
      alignSelf: 'flex-start',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.light,
    },
    viewResult: {
      width: '100%',
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      padding: 10,
      alignItems: 'center',
    },
    resultText: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.light,
      textAlign: 'center',
    },
    resultSubText: { fontSize: 11, color: appcolor.light, marginTop: 2 },
    reasonContainer: {
      marginHorizontal: 4,
      marginTop: 6,
      padding: 10,
      borderRadius: 8,
      backgroundColor: appcolor.surface,
      borderLeftWidth: 3,
      borderLeftColor: appcolor.warning,
    },
    reasonLabel: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.placeholderText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    reasonText: { fontSize: 12, color: appcolor.dark, lineHeight: 18 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginTop: 10,
      marginBottom: 6,
    },
    photosListContainer: { height: 100 },
    photoImage: {
      width: 96,
      height: 96,
      borderRadius: 10,
      backgroundColor: appcolor.grayLight,
    },
    photoWrapper: {
      marginRight: 8,
      borderRadius: 10,
      overflow: 'hidden',
      elevation: 1,
      shadowOpacity: 0.06,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
    },
    modelListContainer: {
      minHeight: 2,
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      padding: 8,
      marginTop: 4,
    },
    modelRow: {
      flex: 1,
      paddingVertical: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
  });
  const renderItem = ({ item }) => {
    const dataDetail = _.filter(dataView, e => e.TypeData == item.TypeData);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.groupTitle}>{`${item.TypeDataName}`}</Text>
        <CustomListView
          numColumns={1}
          data={dataDetail}
          extraData={dataDetail}
          renderItem={renderItemResult}
          bottomView={{ paddingBottom: 0 }}
          ListEmpty={<View />}
        />
      </View>
    );
  };
  const renderItemPhotos = ({ item, index, dataPhotos }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handlerShowImage(index, dataPhotos)}
        style={styles.photoWrapper}
      >
        <Image
          source={{ uri: URLDEFAULT + item.PhotoPath }}
          style={styles.photoImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderItemModel = ({ item }) => {
    return (
      <View style={styles.modelRow}>
        <Text style={[styles.subTitleName, { flex: 1 }]} numberOfLines={2}>
          {item.ProductName}
        </Text>
        {item.Quantity != null && (
          <Text
            style={[
              styles.subTitleName,
              { marginLeft: 8, fontWeight: fontWeightBold },
            ]}
          >
            {formatNumber(item.Quantity || 0, ',')}
          </Text>
        )}
      </View>
    );
  };

  const renderItemModelList = ({ item }) => {
    const modelList = JSON.parse(item.ModelList || '[]');
    return (
      <CustomListView
        data={modelList}
        renderItem={renderItemModel}
        bottomView={{ paddingBottom: 0 }}
        ListEmpty={<View />}
      />
    );
  };
  const renderItemResult = ({ item }) => {
    const colorStatus = appcolor[item.ColorStatusConfirm] || appcolor.dark;
    const awardText = JSON.parse(item.AwardDetail || '[]')
      .map(i => `${i.quantity} ${i.name}`)
      .join(', ');
    const photosList = JSON.parse(item.jsonPhotos || '[]');
    const photoListDisplay = JSON.parse(item.jsonPhotosDisplay || '[]');
    const modelGroupList = JSON.parse(item.jsonModelList || '[]');
    const hasProgress =
      item.Actual !== null &&
      item.Actual !== undefined &&
      item.TypeData !== 'SALE_ITEM';
    return (
      <View style={{ marginBottom: 8, flex: 1 }}>
        <View style={[styles.itemContent, { borderLeftColor: colorStatus }]}>
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={styles.titleName} numberOfLines={2}>
                {item.TitleName}
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: colorStatus }]}
              >
                <Text style={styles.statusText}>{item.StatusNameResult}</Text>
              </View>
            </View>
            {!!awardText && (
              <View style={styles.awardRow}>
                <Text style={styles.awardText}>{`${awardText}`}</Text>
              </View>
            )}
            {hasProgress && (
              <View style={styles.progressSection}>
                <Text style={styles.titleValue}>{`${formatNumber(
                  item.Actual || 0,
                  ',',
                )}/${formatNumber(item.Target || 0, ',')}`}</Text>
              </View>
            )}
            {(item.TypeData == 'SALE' || item.TypeData == 'SALE_ITEM') && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 6,
                }}
              >
                <Text style={[styles.subTitleName, { color: colorStatus }]}>
                  Đã đạt: {item.CompletionPercent || 0}%
                </Text>
                {item.TypeData == 'SALE' && (
                  <Text
                    style={[
                      styles.subTitleName,
                      { color: appcolor.placeholderText },
                    ]}
                  >
                    Còn lại: {formatNumber(item.RemainingAmount || 0, ',')}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        {!!item.ConfirmNote && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Ghi chú</Text>
            <Text style={styles.reasonText}>{item.ConfirmNote}</Text>
          </View>
        )}
        {photosList.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.sectionLabel}>
              Hình ảnh ({photosList.length})
            </Text>
            <View style={styles.photosListContainer}>
              <CustomListView
                horizontal
                data={photosList}
                renderItem={photo =>
                  renderItemPhotos({
                    item: photo.item,
                    index: photo.index,
                    dataPhotos: photosList,
                  })
                }
              />
            </View>
          </View>
        )}
        {photoListDisplay.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.sectionLabel}>
              Hình ảnh ({photoListDisplay.length})
            </Text>
            <View style={styles.photosListContainer}>
              <CustomListView
                horizontal
                data={photoListDisplay}
                renderItem={photo =>
                  renderItemPhotos({
                    item: photo.item,
                    index: photo.index,
                    dataPhotos: photoListDisplay,
                  })
                }
              />
            </View>
          </View>
        )}
        {modelGroupList.length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.sectionLabel}>Danh sách thưởng FOC</Text>
            <View style={styles.modelListContainer}>
              <CustomListView
                data={modelGroupList}
                renderItem={renderItemModelList}
                bottomView={{ paddingBottom: 0 }}
                ListEmpty={<View />}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View>
      <CustomListView
        data={dataGroup}
        extraData={dataGroup}
        renderItem={renderItem}
        bottomView={{ paddingBottom: 0 }}
        ListEmpty={<View />}
      />
      <ViewPictures
        visible={photo.visible}
        images={photo.data || []}
        initialIndex={photo.index}
        onSwipeDown={handlerCloseImage}
      />
    </View>
  );
};
export default ItemProgramResult;
