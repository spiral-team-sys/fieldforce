import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../Content/FormGroup';
import _ from 'lodash';
import { TYPE } from '../Component/BusinessTrips/UtilityBusiness';
import { type } from '../Core/Utility';
import { removeVietnameseTones } from '../Core/Helper';

export const MutipleItemSelected = ({
  titleName,
  iconName,
  defaultValue,
  defaultValueDistrict,
  defaultValueMulti = [],
  dataItems,
  containerStyle,
  mulipleChoose = false,
  isHorizontal = true,
  onItemChoose,
  isRequire = false,
  typeItem,
  isFilter = false,
  placeholder = null,
  paddingBottom = 0,
  signleAnimation = false,
  isUploaded = false,
  isUseEatDay = false,
  isViewMulti = false,
  maxMultiSelect = 0,
  isSelectDistrict = 0,
  itemMain = null,
  filterStyle,
  focusSelected = false,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataFilter, setDataFilter] = useState([]);
  const [dataDistrict, setDataDistrict] = useState([]);
  const [dataDistrictFilter, setDataDistrictFilter] = useState([]);
  const [itemSelect, setItemSelect] = useState({});
  const scrollRef = useRef(null);
  const districtScrollRef = useRef(null);
  const itemLayoutsRef = useRef({});
  const didFocusSelectedRef = useRef(false);
  const [_mutate, setMutate] = useState(false);
  const [search, setSearch] = useState(null);
  const [searchDistrict, setSearchDistrict] = useState(null);

  const styles = StyleSheet.create({
    mainContainer: { flexGrow: 1, padding: 8, marginBottom: 1 },
    itemContent: {
      flexGrow: 1,
      backgroundColor: appcolor.light,
      borderRadius: 5,
      padding: 8,
      margin: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    selectedItemContent: {
      borderWidth: 1.2,
      backgroundColor: appcolor.surface,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 4,
      elevation: 2,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '300',
      color: appcolor.dark,
      textAlign: 'center',
      marginStart: 8,
      marginEnd: 8,
    },
    selectedItemName: { fontWeight: '800' },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    filterItemContent: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      padding: 3,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
  });
  const normalizeText = t =>
    removeVietnameseTones((t || '').toString())
      .toLowerCase()
      .trim();
  const getSearchText = (item = {}) => {
    const keys = [
      'itemName',
      'name',
      'Name',
      'NameVN',
      'label',
      'title',
      'itemCode',
      'code',
      'Code',
      'value',
      'Value',
      'itemValue',
      'id',
      'Id',
      'dealerName',
      'dealerCode',
      'shopName',
      'shopCode',
      'provinceName',
      'districtName',
      'townName',
      'district',
      'description',
      'desc',
      'note',
    ];
    return normalizeText(
      keys
        .map(key => item?.[key])
        .filter(Boolean)
        .join(' '),
    );
  };
  const isMatchSearch = (item, text) => {
    const searchValue = normalizeText(text);
    if (!searchValue) return true;
    const itemText = getSearchText(item);
    const keywords = searchValue.split(/\s+/).filter(Boolean);
    return keywords.every(keyword => itemText.includes(keyword));
  };
  const sortSelectedFirst = (list = [], selectedValue) => {
    const selected = normalizeText(selectedValue);
    if (!selected) return list;
    return [...(list || [])].sort((a, b) => {
      const aName = normalizeText(a.itemName || a.name);
      const bName = normalizeText(b.itemName || b.name);
      if (aName === selected && bName !== selected) return -1;
      if (bName === selected && aName !== selected) return 1;
      return 0;
    });
  };
  const getSelectedIndex = (list = [], selectedValue) => {
    const selected = normalizeText(selectedValue);
    if (!selected) return -1;
    return (list || []).findIndex(
      item => normalizeText(item.itemName || item.name) === selected,
    );
  };
  const scrollToSelectedIndex = (list = [], selectedValue) => {
    const selectedIndex = getSelectedIndex(list, selectedValue);
    if (selectedIndex < 0) return;
    scrollToIndex(selectedIndex);
  };
  const scrollToIndex = selectedIndex => {
    setTimeout(() => {
      const layout = itemLayoutsRef.current[selectedIndex];
      const fallbackOffset = selectedIndex * 120;
      scrollRef.current?.scrollTo({
        x: isHorizontal ? Math.max((layout?.x ?? fallbackOffset) - 12, 0) : 0,
        y: isHorizontal ? 0 : Math.max((layout?.y ?? fallbackOffset) - 12, 0),
        animated: true,
      });
    }, 150);
  };
  const setDataItem = async () => {
    itemLayoutsRef.current = {};
    // await setDataFilter(dataItems)
    if (defaultValueDistrict && defaultValue) {
      const listDistrict = _.filter(
        dataItems,
        i => (i.itemName || i.name) == defaultValue,
      );
      const dataByItem = listDistrict[0]?.level2s || [];
      if (signleAnimation && defaultValueDistrict) {
        const districtSorted = [...dataByItem].sort((a, b) => {
          const aName = normalizeText(a.itemName || a.name);
          const bName = normalizeText(b.itemName || b.name);
          const selected = normalizeText(defaultValueDistrict);
          if (aName === selected && bName !== selected) return -1;
          if (bName === selected && aName !== selected) return 1;
          return 0;
        });
        setDataDistrict(districtSorted);
      } else {
        setDataDistrict(dataByItem);
      }
    }
    if (signleAnimation && defaultValue) {
      const sorted = sortSelectedFirst(dataItems, defaultValue);
      await setDataFilter(sorted);
    } else {
      await setDataFilter(dataItems);
    }
    if (
      focusSelected &&
      defaultValue &&
      didFocusSelectedRef.current !== defaultValue
    ) {
      didFocusSelectedRef.current = defaultValue;
      scrollToSelectedIndex(dataItems, defaultValue);
    }
  };
  const singleSelected = (item, _index) => {
    const selectedName = item.itemName || item.name;
    if (isViewMulti == true && typeof defaultValue == 'object') {
      let dataSelectVehcle = [...defaultValue];
      if (
        dataSelectVehcle?.some(
          it => (it.code || it.level1_id) == (item.code || item.level1_id),
        )
      ) {
        dataSelectVehcle = dataSelectVehcle.filter(
          it => (it.code || it.level1_id) != (item.code || item.level1_id),
        );
      } else {
        dataSelectVehcle.push(item);
      }
      defaultValue =
        (dataSelectVehcle?.length || 0) > maxMultiSelect
          ? [item]
          : dataSelectVehcle;
    } else {
      defaultValue = selectedName;
    }
    if (isSelectDistrict == 1) {
      defaultValueDistrict = null;
      const dataByItem = item.level2s;
      setDataDistrict(dataByItem);
    }
    signleAnimation &&
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    setMutate(e => !e);
    focusSelected && scrollToIndex(_index);

    onItemChoose(item, typeItem, itemMain);
  };
  const handlerSelectDistrict = item => {
    let typeDistrict;
    switch (typeItem) {
      case TYPE.PROVINCE_FROM:
        typeDistrict = TYPE.DISTRICT_FROM;
        break;
      case TYPE.PROVINCE_TO:
        typeDistrict = TYPE.DISTRICT_TO;
        break;
    }
    defaultValueDistrict = item.itemName || item.name;
    onItemChoose(item, typeDistrict, itemMain);
  };
  const handlerChangeValue = (text, item, index, type) => {
    if (type == 'EAT') {
      item.eatDay = parseInt(text || 0);
      defaultValueMulti[index].eatDay = parseInt(text || 0);
    } else {
      item.numberDay = parseInt(text || 0);
      defaultValueMulti[index].numberDay = parseInt(text || 0);
    }
    setMutate(e => !e);
  };
  const mutipleSelected = (item, typeSelect) => {
    let itemValue;
    if (isSelectDistrict == 1) {
      if (typeSelect == 'PROVINCE') {
        const listDistrict = _.filter(
          dataItems,
          i => (i.itemName || i.name) == item.name,
        );
        const dataByItem = listDistrict[0]?.level2s || [];
        setDataDistrict(dataByItem);
        setItemSelect(item);
        return;
      }

      const indexView = defaultValueMulti.length;
      itemValue = {
        itemName: itemSelect.itemName || itemSelect.name,
        provinceCode: itemSelect.provinceCode || itemSelect.level1_id,
        provinceName: itemSelect.itemName || itemSelect.name,
        district: item.district || item.name,
        districtCode: item.districtCode || item.level2_id,
      };
      defaultValueMulti.push({
        ...itemValue,
        idx: indexView,
        numberDay: '',
        eatDay: '',
      });
      onItemChoose(item, typeItem, defaultValueMulti);
      setDataDistrict([]);
      setDataDistrictFilter([]);
      setItemSelect([]);
    } else {
      const indexView = defaultValueMulti.length;
      defaultValueMulti.push({
        ...item,
        idx: indexView,
        numberDay: '',
        eatDay: '',
      });
      onItemChoose(item, typeItem, defaultValueMulti);
    }
  };
  const deleteSelected = async item => {
    await _.remove(defaultValueMulti, item);
    setMutate(e => !e);
  };
  const filterItem = text => {
    setSearch(text);
    const listFilter = _.filter(dataItems, i => isMatchSearch(i, text));
    itemLayoutsRef.current = {};
    setDataFilter(listFilter);
    if (normalizeText(text).length === 0 && defaultValue) {
      scrollToSelectedIndex(dataItems, defaultValue);
    } else {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }
  };
  const clearFilterItem = () => {
    setSearch('');
    itemLayoutsRef.current = {};
    setDataFilter(dataItems);
    defaultValue
      ? scrollToSelectedIndex(dataItems, defaultValue)
      : scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };
  const filterItemDistrict = text => {
    setSearchDistrict(text);
    const listFilter = _.filter(dataDistrict, i => isMatchSearch(i, text));
    setDataDistrictFilter(listFilter);
    districtScrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  };
  const renderItem = (item, index) => {
    const onPress = () => {
      mulipleChoose
        ? mutipleSelected(item, 'PROVINCE')
        : singleSelected(item, index);
    };
    const colorSelected = item.isColor || appcolor.primary;
    const isSelected =
      isViewMulti == true && typeof defaultValue == 'object'
        ? defaultValue.length > 0 &&
          defaultValue?.findIndex(it => it.code == item.code) !== -1
        : (item.itemName || item.name) == defaultValue ||
          (mulipleChoose &&
            (itemSelect.itemName || itemSelect.name) ==
              (item.itemName || item.name));
    const styleView = isSelected
      ? [
          styles.itemContent,
          styles.selectedItemContent,
          { borderColor: colorSelected },
        ]
      : styles.itemContent;

    const styleTitle = isSelected
      ? [styles.itemName, styles.selectedItemName, { color: colorSelected }]
      : styles.itemName;

    return (
      <TouchableOpacity
        key={`${typeItem}_${index}`}
        style={styleView}
        onPress={isUploaded ? null : onPress}
        onLayout={event => {
          itemLayoutsRef.current[index] = event.nativeEvent.layout;
        }}
      >
        <Text style={styleTitle}>{item.itemName || item.name}</Text>
      </TouchableOpacity>
    );
  };
  const renderItemDistrict = (item, index) => {
    const onPress = () => {
      mulipleChoose
        ? mutipleSelected(item, 'DISTRICT')
        : handlerSelectDistrict(item, index);
    };
    const colorSelected = item.isColor || appcolor.primary;
    const styleView =
      (item.itemName || item.name) == defaultValueDistrict
        ? { ...styles.itemContent, borderWidth: 1, borderColor: colorSelected }
        : styles.itemContent;
    const styleTitle =
      (item.itemName || item.name) == defaultValueDistrict
        ? { ...styles.itemName, fontWeight: '700', color: colorSelected }
        : styles.itemName;
    return (
      <TouchableOpacity
        key={`${typeItem}_District_${index}`}
        style={styleView}
        onPress={onPress}
      >
        <Text style={styleTitle}>{item.itemName || item.name}</Text>
      </TouchableOpacity>
    );
  };
  const renderItemValue = (item, index) => {
    const onDelete = () => {
      deleteSelected(item, index);
    };
    const onEditValue = text => {
      handlerChangeValue(text, item, index);
    };
    const onEditEatValue = text => {
      handlerChangeValue(text, item, index, 'EAT');
    };
    if (!item.districtCode && isSelectDistrict == 1) return;

    return (
      <View
        key={`${typeItem}__${index}`}
        style={{
          width: '90%',
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'center',
          padding: 5,
        }}
      >
        <TouchableOpacity onPress={onDelete}>
          <SpiralIcon
            type="font-awesome-5"
            style={{ textAlign: 'center', marginEnd: 8 }}
            name={'minus-circle'}
            size={20}
            color={appcolor.red}
          />
        </TouchableOpacity>
        <View style={{ width: isUseEatDay == true ? '50%' : '70%' }}>
          <Text
            style={{
              width: '100%',
              color: appcolor.info,
              textAlign: 'left',
              fontWeight: '700',
            }}
          >{`${index + 1}. ${item.itemName || item.name}`}</Text>
          {isSelectDistrict == 1 && item.district && (
            <Text
              style={{
                width: '100%',
                color: appcolor.info,
                textAlign: 'left',
                fontWeight: '700',
              }}
            >{`  ${item.district}`}</Text>
          )}
        </View>
        <FormGroup
          selectTextOnFocus={true}
          keyboardType="numeric"
          containerStyle={{
            width: isUseEatDay == true ? '25%' : '30%',
            borderRadius: 8,
            marginBottom: 0,
            padding: 0,
            marginStart: 8,
            backgroundColor: 'transparent',
          }}
          inputStyle={{
            textAlign: 'center',
            fontSize: 12,
            backgroundColor: 'transparent',
          }}
          editable
          defaultValue={`${item.numberDay}`}
          placeholder={`Lưu trú`}
          useClearAndroid={false}
          handleChangeForm={onEditValue}
        />
        {isUseEatDay == true && (
          <FormGroup
            selectTextOnFocus={true}
            keyboardType="numeric"
            containerStyle={{
              width: '25%',
              borderRadius: 8,
              marginBottom: 0,
              padding: 0,
              marginStart: 8,
              backgroundColor: 'transparent',
            }}
            inputStyle={{
              textAlign: 'center',
              fontSize: 12,
              backgroundColor: 'transparent',
            }}
            editable
            defaultValue={`${item.eatDay}`}
            placeholder={`Ngày ăn`}
            useClearAndroid={false}
            handleChangeForm={onEditEatValue}
          />
        )}
      </View>
    );
  };
  useEffect(() => {
    const _setdata = setDataItem();
    return () => _setdata;
  }, [dataItems, defaultValue]);

  const isSearching = normalizeText(search).length > 0;
  const isDistrictSearching = normalizeText(searchDistrict).length > 0;
  const dataView = dataFilter;
  const dataDistrictView = isDistrictSearching
    ? dataDistrictFilter
    : dataDistrict;

  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          marginBottom: isFilter ? 5 : 0,
        }}
      >
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      {placeholder !== null && placeholder.length > 0 && (
        <Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
      )}
      {isFilter && (
        <FormGroup
          editable
          containerStyle={[styles.filterItemContent, filterStyle]}
          handleChangeForm={filterItem}
          placeholder="Tìm kiếm"
          value={search}
          onClearTextAndroid={clearFilterItem}
        />
      )}

      <ScrollView
        key={`${typeItem}_mutipleItemList`}
        ref={scrollRef}
        contentContainerStyle={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: paddingBottom,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        horizontal={isHorizontal}
      >
        {(dataView || []).map((item, index) => {
          return renderItem(item, index);
        })}
      </ScrollView>
      {(defaultValue || defaultValueMulti) &&
        (dataDistrictView?.length > 0 || isDistrictSearching) &&
        isSelectDistrict == 1 && (
          <View style={{ paddingTop: 4 }}>
            {isFilter && (
              <FormGroup
                editable
                containerStyle={styles.filterItemContent}
                handleChangeForm={filterItemDistrict}
                placeholder="Tìm kiếm"
                value={searchDistrict}
                onClearTextAndroid={() => setSearchDistrict('')}
              />
            )}
            <ScrollView
              key={`${typeItem}_mutipleItemListDistrict`}
              ref={districtScrollRef}
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: paddingBottom,
              }}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              horizontal={isHorizontal}
            >
              {(dataDistrictView || []).map((item, index) => {
                return renderItemDistrict(item, index);
              })}
            </ScrollView>
          </View>
        )}
      {defaultValueMulti !== null && defaultValueMulti?.length > 0 && (
        <ScrollView
          key={`${typeItem}_mutipleValueList`}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {defaultValueMulti.map((item, index) => {
            return renderItemValue(item, index);
          })}
        </ScrollView>
      )}
    </View>
  );
};
