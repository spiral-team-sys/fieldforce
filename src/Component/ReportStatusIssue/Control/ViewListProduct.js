import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { deviceHeight, deviceWidth } from '../../Home';
import { Icon } from '@rneui/themed';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import _ from 'lodash';
import { groupDataByKey, removeVietnameseTones } from '../../../Core/Helper';
import { DEFAULT_LIGHT_COLOR } from '../../../Core/URLs';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const ViewListProduct = ({
  dataProducts,
  modalConfig,
  handleCloseModal,
  styles,
  type,
  handleSelectChange,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const [itemSelect, setItemSelect] = useState({});
  const [data, setData] = useState({
    dataView: [],
    dataMain: [],
    dataSelect: [],
  });
  const [loading, setLoading] = useState([]);
  const [search, _setItemSearch] = useState({ text: '', isSearch: false });

  const loadData = () => {
    setLoading(true);
    const itemS = modalConfig.itemSelect;
    const dataS = JSON.parse(itemS.dataSelect || '[]');
    const dataSMap = new Map(dataS.map(item => [item.Id, true]));
    // Cập nhật mảng gốc với trường `isSelect`
    const updatedLargeArray = dataProducts.map(item => ({
      ...item,
      isSelect: dataSMap.has(item.Id) ? 1 : 0, // Kiểm tra tồn tại trong mảng nhỏ
    }));
    setItemSelect(itemS);
    setData({
      dataView: updatedLargeArray,
      dataMain: updatedLargeArray,
      dataSelect: dataS,
    });
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProduct = item => {
    item.isSelect = item.isSelect == 1 ? 0 : 1;
    let dataSelectNew = [...data.dataSelect];
    if (item.isSelect == 1) {
      dataSelectNew.push(item);
    } else {
      dataSelectNew = _.filter(dataSelectNew, it => it.Id !== item.Id);
    }
    data.dataSelect = dataSelectNew;
    handleSelectChange(dataSelectNew);
    setMutate(e => !e);
  };
  const onContentChangeText = (item, text) => {
    const dataSelectNew = data.dataSelect.map(it => ({
      ...it,
      [itemSelect.subInfo]:
        it.Id == item.Id ? text : it[itemSelect.subInfo] || null,
    }));

    data.dataSelect = dataSelectNew;
    handleSelectChange(dataSelectNew);
    setMutate(e => !e);
  };

  const onSearchData = text => {
    setLoading(true);
    search.text = text;
    const listUpdate = _searchData(data.dataMain);
    const { arr } = groupDataByKey({
      arr: listUpdate,
      key: 'CategoryId',
    });
    data.dataView = arr;
    setMutate(e => !e);
    setLoading(false);
  };
  const _searchData = filterList => {
    const valueSearch = removeVietnameseTones(search.text).toLowerCase();
    const searchData = _.filter(
      filterList,
      e =>
        removeVietnameseTones(e.ProductName).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.Category).toLowerCase().match(valueSearch) ||
        removeVietnameseTones(e.ProductCode).toLowerCase().match(valueSearch),
    );
    return searchData;
  };

  const renderItem = ({ item, index }) => {
    const itemValue =
      item.isSelect == 1
        ? data.dataSelect.filter(it => it.Id == item.Id)[0] || null
        : null;

    return (
      <View style={{ width: '100%' }}>
        {item.isParent && item.CategoryId !== undefined && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: appcolor.primary,
              padding: 8,
              borderRadius: 5,
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 'bold',
                color: appcolor.white,
              }}
            >
              {' '}
              {item.Category}
            </Text>
          </View>
        )}
        <View
          style={{
            width: '100%',
            padding: 4,
            borderBottomColor: appcolor.darklight,
            borderBottomWidth: 1,
          }}
        >
          <TouchableOpacity
            onPress={() => handleSelectProduct(item)}
            style={{
              justifyContent: 'center',
              backgroundColor:
                item.isSelect == 1 ? DEFAULT_LIGHT_COLOR : appcolor.transparent,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: 'bold', color: appcolor.dark }}
            >
              {' '}
              {item.ProductName}
            </Text>
          </TouchableOpacity>
          {item.isSelect == 1 && itemSelect.subInfoName && (
            <View style={{ width: '100%' }}>
              <FormGroup
                editable={type == 'PLUS'}
                useClearAndroid={false}
                multiline
                defaultValue={itemValue[itemSelect.subInfo] || ''}
                placeholder={'Nhập ' + itemSelect.subInfoName}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                handleChangeForm={text => onContentChangeText(item, text)}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: appcolor.light,
      }}
    >
      <Modal
        animationType="slide"
        onRequestClose={() => {
          handleCloseModal();
        }}
        style={{ flex: 1 }}
        visible={modalConfig.visible}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              borderRadius: 5,
              marginVertical: 16,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: 'bold', color: appcolor.dark }}
            >
              Danh sách sản phẩm
            </Text>
          </View>

          {!loading && (
            <FormGroup
              editable
              placeholder="Tìm kiếm sản phẩm"
              iconName="search"
              defaultValue={search.text}
              iconColor={search.isSearch ? appcolor.light : appcolor.primary}
              // useClearAndroid={search.text !== null && search.text.length > 0}
              placeholderColor={
                search.isSearch ? appcolor.surface : appcolor.primary
              }
              containerStyle={
                search.isSearch
                  ? {
                    margin: 8,
                    padding: Platform.OS == 'android' ? 3 : 5,
                    paddingHorizontal: 8,
                    borderRadius: 20,
                    backgroundColor: appcolor.primary,
                    borderWidth: 0.5,
                  }
                  : {
                    margin: 8,
                    padding: Platform.OS == 'android' ? 3 : 5,
                    paddingHorizontal: 8,
                    borderRadius: 20,
                    backgroundColor: appcolor.light,
                    borderWidth: 0.5,
                    borderColor: appcolor.primary,
                  }
              }
              inputStyle={
                search.isSearch
                  ? { fontSize: 13, color: appcolor.light, fontWeight: '500' }
                  : { fontSize: 13, color: appcolor.primary }
              }
              handleChangeForm={onSearchData}
              onClearTextAndroid={onSearchData}
              useClearAndroid={true}
            // onFocus={onFocusSearch}
            // onEndEditing={onFocusSearch}
            />
          )}
          {!loading && (
            <FlashList
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 8 }}
              extraData={[data.dataView]}
              data={data.dataView}
              estimatedItemSize={60}
              renderItem={renderItem}
            />
          )}
        </View>
        <TouchableOpacity
          onPress={handleCloseModal}
          style={{ position: 'absolute', right: 20, top: 20, zIndex: 1000 }}
        >
          <SpiralIcon
            size={18}
            name="close"
            containerStyle={{ opacity: 0.8 }}
            reverse
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
