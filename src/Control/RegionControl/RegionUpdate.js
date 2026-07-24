import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import dvhc2025 from '../../Themes/filedata/dvhc2025.json';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { Icon } from '@rneui/themed';
import { fontWeightBold } from '../../Themes/AppsStyle';
import { removeVietnameseTones } from '../../Core/Helper';
import { SET_EmployeeInfo } from '../../Redux/action';
import _ from 'lodash';

const ITEM_WIDTH = 150;
const ITEM_MARGIN_RIGHT = 8;

const RegionUpdate = ({
  newRegionId,
  actionResult,
  titleName,
  isRequire,
  typeFilter,
  isEmployee = false,
  isView = false,
}) => {
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [dataProvince, setDataProvince] = useState([]);
  const [dataTown, setDataTown] = useState([]);
  const [dataFilterProvince, setDataFilterProvince] = useState([]);
  const [dataFilterTown, setDataFilterTown] = useState([]);
  const [itemChoose, setItemChoose] = useState(null);
  const [itemChooseTown, setItemChooseTown] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const refProvince = useRef(null);
  const refTown = useRef(null);
  const [search, _setSearch] = useState({
    searchProvince: '',
    searchTown: '',
    isFocusProvince: false,
    isFocusTown: false,
  });
  const dispatch = useDispatch();

  const LoadData = async () => {
    try {
      if (newRegionId !== null && newRegionId !== undefined) {
        await setLoading(true);
        const itemByRegionId = _.filter(dvhc2025.data, item =>
          item.level2s.find(it => it.level2_id == newRegionId),
        );
        const itemByTown = _.filter(
          itemByRegionId[0]?.level2s || [],
          item => item.level2_id == newRegionId,
        );
        //
        if (isView) {
          await setDataTown(itemByTown);
          await setDataProvince(itemByRegionId);
        } else {
          await setDataTown(itemByRegionId[0]?.level2s || []);
          await setDataProvince(dvhc2025.data);
        }
        await setItemChoose(itemByRegionId[0]?.level1_id);
        await setItemChooseTown(itemByTown[0]?.level2_id);
        //
        if (!isView) {
          setTimeout(() => {
            const itemProvinceIndex = _.findIndex(
              dvhc2025.data,
              item => item.level1_id == itemByRegionId[0].level1_id,
            );
            const itemTownIndex = _.findIndex(
              dataFilterTown.length > 0
                ? dataFilterTown
                : itemByRegionId[0]?.level2s || [],
              item => item.level2_id == newRegionId,
            );
            if (itemProvinceIndex > 0) {
              refProvince?.current?.scrollToIndex({
                animated: true,
                index: itemProvinceIndex,
              });
            }
            if (itemTownIndex > 0) {
              refTown?.current?.scrollToIndex({
                animated: true,
                index: itemTownIndex,
              });
            }
          }, 100);
        }
      } else if (!isView) {
        await setDataProvince(dvhc2025.data);
      }
    } catch (err) {
      console.log('Error LoadData:', err);
    } finally {
      await setLoading(false);
    }
  };

  useEffect(() => {
    LoadData();
  }, [isView]);

  const handlerItemChoose = (item, index) => {
    if (item.level1_id !== undefined) {
      const dataTown = dvhc2025.data.find(it => it.level1_id == item.level1_id);
      setDataTown(dataTown.level2s);
      refProvince.current.scrollToIndex({
        animated: true,
        index: index,
      });
      setItemChoose(item.level1_id);
      if (isEmployee) {
        employeeInfo.isChooseRegion = true;
        dispatch(SET_EmployeeInfo(employeeInfo));
      } else {
        actionResult(
          {
            ...item,
            provinceCode: item.provinceCode,
            provinceName: item.provinceName || item.name,
          },
          typeFilter,
        );
      }
    } else {
      refTown.current.scrollToIndex({
        animated: true,
        index: index,
      });
      setItemChooseTown(item.level2_id);
      if (isEmployee) {
        employeeInfo[typeFilter] = item.level2_id || '';
        dispatch(SET_EmployeeInfo(employeeInfo));
      } else {
        const provinceItem =
          dvhc2025.data.find(province =>
            (province.level2s || []).some(
              town => town.level2_id == item.level2_id,
            ),
          ) || {};
        actionResult(
          {
            ...item,
            provinceCode: provinceItem.provinceCode || null,
            provinceName:
              provinceItem.provinceName || provinceItem.name || null,
            wardCode: item.wardCode,
            wardName: item.wardName || item.name,
          },
          typeFilter,
        );
      }
    }
  };

  const filterItemProvince = text => {
    search.searchProvince = text;
    const searchValue = removeVietnameseTones(text).toLowerCase();
    const dataFilter = _.filter(dvhc2025.data, item =>
      removeVietnameseTones(item.name).toLowerCase().match(searchValue),
    );
    refProvince?.current?.scrollToIndex({
      animated: true,
      index: 0,
    });
    setDataFilterProvince(dataFilter);
  };

  const filterItemTown = async text => {
    search.searchTown = text;
    const searchValue = removeVietnameseTones(text).toLowerCase();
    const dataFilter = _.filter(dataTown, item =>
      removeVietnameseTones(item.name).toLowerCase().match(searchValue),
    );
    setDataFilterTown(dataFilter);
  };

  const onClearProvince = () => {
    search.searchProvince = '';
    setDataFilterProvince([]);
  };
  const onClearTown = () => {
    search.searchTown = '';
    setDataFilterTown([]);
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'center',
    },
    titleIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    titleHeader: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    section: { width: '100%', marginTop: 4 },
    sectionTitle: {
      color: appcolor.greylight,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 6,
      marginStart: 2,
    },
    filterItemContent: {
      width: '100%',
      backgroundColor: appcolor.light,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      overflow: 'hidden',
    },
    itemContent: {
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      width: ITEM_WIDTH,
      marginRight: ITEM_MARGIN_RIGHT,
      minHeight: 42,
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    itemName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'center',
    },
    selectedProvinceContent: {
      borderWidth: 1,
      borderColor: appcolor.second,
      backgroundColor: appcolor.surface,
    },
    selectedTownContent: {
      borderWidth: 1,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.surface,
    },
    selectedProvinceName: {
      color: appcolor.second,
      fontWeight: fontWeightBold,
    },
    selectedTownName: { color: appcolor.primary, fontWeight: fontWeightBold },
    viewItemContent: {
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.surface,
      marginBottom: 8,
    },
    wrapItem: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    textNoData: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.placeholderText,
      padding: 12,
      textAlign: 'center',
    },
    textRequire: { fontSize: 14, color: appcolor.red },
    loading: { position: 'absolute', end: 8 },
  });

  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerItemChoose(item, index);
    };
    const isProvinceSelected =
      item.level1_id !== undefined &&
      itemChoose !== null &&
      item.level1_id == itemChoose;
    const isTownSelected =
      item.level2_id !== undefined &&
      itemChooseTown !== null &&
      item.level2_id == itemChooseTown;

    const styleView = [
      styles.itemContent,
      isProvinceSelected && styles.selectedProvinceContent,
      isTownSelected && styles.selectedTownContent,
    ];
    const styleName = [
      styles.itemName,
      isProvinceSelected && styles.selectedProvinceName,
      isTownSelected && styles.selectedTownName,
    ];
    return (
      <TouchableOpacity
        style={styleView}
        key={index}
        disabled={isView}
        onPress={onPress}
      >
        <Text style={styleName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {(titleName || isLoading) && (
        <View style={styles.headerContainer}>
          {titleName && (
            <View style={styles.titleIcon}>
              <SpiralIcon
                name="location-arrow"
                type="font-awesome-5"
                size={13}
                color={appcolor.primary}
              />
            </View>
          )}
          {titleName && (
            <Text style={styles.titleHeader}>
              {`${titleName} `}
              {isRequire && <Text style={styles.textRequire}>*</Text>}
            </Text>
          )}
          {isLoading && <ActivityIndicator style={styles.loading} />}
        </View>
      )}
      {isView && (dataProvince?.length || 0) == 0 && (
        <View style={styles.wrapItem}>
          <Text style={styles.textNoData}>Chưa có dữ liệu</Text>
        </View>
      )}
      {isView && dataProvince?.length > 0 && (
        <View style={styles.wrapItem}>
          {dataProvince.map((item, index) => (
            <View
              style={[
                styles.itemContent,
                styles.viewItemContent,
                styles.selectedProvinceContent,
              ]}
              key={index}
            >
              <Text
                style={[styles.itemName, styles.selectedProvinceName]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>
          ))}
          {dataTown.map((item, index) => (
            <View
              style={[
                styles.itemContent,
                styles.viewItemContent,
                styles.selectedTownContent,
              ]}
              key={index}
            >
              <Text
                style={[styles.itemName, styles.selectedTownName]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      )}
      {!isView && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tỉnh/Thành phố</Text>
          <FormGroup
            defaultValue={search.searchProvince}
            editable={true}
            containerStyle={styles.filterItemContent}
            handleChangeForm={filterItemProvince}
            placeholder={'Tìm kiếm Tỉnh/Thành phố'}
            iconName="search"
            useClearAndroid
            onClearTextAndroid={onClearProvince}
          />
          <FlatList
            ref={refProvince}
            data={
              dataFilterProvince.length > 0 ? dataFilterProvince : dataProvince
            }
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            horizontal
            keyExtractor={item => item.level1_id.toString()}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH + ITEM_MARGIN_RIGHT,
              offset: (ITEM_WIDTH + ITEM_MARGIN_RIGHT) * index,
              index,
            })}
          />
        </View>
      )}
      {!isView && dataTown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phường/Xã</Text>
          <FormGroup
            defaultValue={search.searchTown}
            editable={true}
            containerStyle={styles.filterItemContent}
            handleChangeForm={filterItemTown}
            placeholder={'Tìm kiếm Phường/Xã'}
            iconName="search"
            useClearAndroid
            onClearTextAndroid={onClearTown}
          />
          <FlatList
            ref={refTown}
            data={dataFilterTown.length > 0 ? dataFilterTown : dataTown}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            horizontal
            keyExtractor={item => item.level2_id.toString()}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH + ITEM_MARGIN_RIGHT,
              offset: (ITEM_WIDTH + ITEM_MARGIN_RIGHT) * index,
              index,
            })}
          />
        </View>
      )}
    </View>
  );
};

export default RegionUpdate;
