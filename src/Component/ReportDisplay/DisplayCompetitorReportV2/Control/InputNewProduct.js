import React, { forwardRef, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { deviceWidth } from '../../../Home';
import { useSelector } from 'react-redux';
import {
  Message,
  ToastError,
  ToastSuccess,
  groupDataByKey,
} from '../../../../Core/Helper';
import {
  addItemDisplayCompetitor,
  getListCompetitorProductV2,
} from '../../../../Controller/DisplayController';
import ActionSheet from 'react-native-actions-sheet';
import { removeAccents } from '../../../../Core/Utility';
import { AddNewListInput } from './AddNewListInput';
import { LoadingView } from '../../../../Control/ItemLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let itemAddProduct = {
  categoryId: 0,
  categoryName: '',
  displayComment: null,
  division: '',
  divisionId: 0,
  fsmValue: null,
  isAddProduct: 1,
  isFsmValueError: 0,
  isNetValue: 0,
  isPriceError: 0,
  modelName: '',
  netValue: null,
  priceValue: null,
  quantity: null,
  subCatId: 0,
  subCategory: '',
  upload: 0,
  workDate: '',
  workId: 0,
};

export const InputNewProduct = forwardRef((props, ref) => {
  const insets = useSafeAreaInsets();
  const { listInput, data, tabInfo, handleSaveProduct } = props;
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [_mutate, setMutate] = useState(false);
  const [productItem, setProductItem] = useState({ ...itemAddProduct });
  const [stepCreate, setStepCreate] = useState(1);
  const [isLoading, setLoading] = useState(false);
  //
  const LoadData = async () => {
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      padding: 8,
      backgroundColor: appcolor.light,
      zIndex: 100,
    },
    progressStyle: {
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10000,
    },
  });

  const uploadProduct = async itemsUpload => {
    const result = await addItemDisplayCompetitor(itemsUpload);
    if (result) {
      await setLoading(true);
      const dataNew = await loadDataNew();
      data.dataShowF = dataNew;
      data.dataShow = dataNew;
      await setProductItem({ ...itemAddProduct });
      await setStepCreate(1);
      await ToastSuccess('Đã lưu sản phẩm!', 'thông báo', 'top');
      await handleSaveProduct();
      await setLoading(false);
    }
  };

  const loadDataNew = async () => {
    const listProduct = await getListCompetitorProductV2(workinfo);
    const { arr } = groupDataByKey({
      arr: listProduct,
      key: 'divisionId',
      keyLayer2: 'categoryId',
      keyLayer3: 'subCatId',
    });
    return arr;
  };

  const onSelectCategory = itemCategory => {
    setProductItem({
      ...productItem,
      categoryId:
        productItem.categoryId === itemCategory.categoryId
          ? 0
          : itemCategory.categoryId,
      categoryName:
        productItem.categoryName === itemCategory.categoryName
          ? ''
          : itemCategory.categoryName,
      subCatId: 0,
      subCategory: '',
    });
  };

  const renderCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          marginEnd: 5,
          padding: 8,
          minWidth: 50,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor:
            productItem.categoryId === item.categoryId
              ? appcolor.primary
              : appcolor.surface,
          borderColor: appcolor.greydark,
          borderWidth: 0.2,
          borderRadius: 50,
        }}
        onPress={() => onSelectCategory(item)}
      >
        <Text
          style={{
            color:
              productItem.categoryId === item.categoryId
                ? appcolor.white
                : appcolor.dark,
          }}
        >
          {item.categoryName}
        </Text>
      </TouchableOpacity>
    );
  };
  const ViewCategory = () => {
    const dataSubCat = data.dataSubCategory.filter(
      it => it.categoryId === productItem.categoryId,
    );
    return (
      <View>
        <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
          <Text
            style={{
              width: '30%',
              color: appcolor.dark,
              justifyContent: 'center',
              padding: 8,
            }}
          >
            Ngành hàng :
          </Text>
          <View style={{ width: '70%' }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={data.dataCategory}
              renderItem={renderCategory}
            />
          </View>
        </View>
        {productItem.categoryId !== 0 && (
          <ViewSubCategory
            dataSubCat={dataSubCat}
            productItem={productItem}
            appcolor={appcolor}
          />
        )}
      </View>
    );
  };

  const handlePrev = () => {
    setStepCreate(1);
  };
  const handleNext = () => {
    if (productItem.modelName === '') {
      ToastError('Bạn chưa điền tên sản phẩm!', 'Lỗi', 'top');
      return;
    } else if (productItem.categoryId === 0) {
      ToastError('Bạn chưa chọn ngành hàng!', 'Lỗi', 'top');
      return;
    } else if (productItem.subCatId === 0) {
      ToastError('Bạn chưa chọn ngành hàng nhỏ!', 'Lỗi', 'top');
      return;
    }
    setStepCreate(2);
  };

  const saveProduct = async () => {
    let value = removeAccents(
      productItem.modelName.replace(/ /g, '').toUpperCase(),
    );
    let itemsUpload = [
      {
        categoryId: productItem.categoryId,
        categoryName: productItem.categoryName,
        subCatId: productItem.subCatId,
        subCategory: productItem.subCategory,
        displayComment: null,
        division: tabInfo.tabName,
        divisionId: tabInfo.tabId,
        fsmValue: productItem.fsmValue,
        isAddProduct: 1,
        modelName: value,
        netValue: productItem.netValue,
        priceValue: productItem.priceValue,
        quantity: productItem.quantity || 1,
        workDate: workinfo.workDate.toString(),
        workId: workinfo.workId,
      },
    ];
    Message('Chú ý', 'Bạn có chắc chắn muốn lưu sản phẩm?', async () =>
      uploadProduct(itemsUpload),
    );
  };
  const onChangeText = text => {
    productItem.modelName = text;
  };

  const AddNewProduct = () => {
    return (
      <View style={{ width: '100%', height: '100%' }}>
        <View style={{ width: '100%' }}>
          <View style={{ paddingTop: 10, margin: 10 }}>
            <TextInput
              editable={true}
              selectTextOnFocus={true}
              autoCorrect={false}
              onChangeText={onChangeText}
              style={{
                padding: 10,
                color: appcolor.dark,
                height: 40,
                textAlign: 'left',
                borderWidth: 0.4,
                borderRadius: 10,
                borderColor: appcolor.dark,
                backgroundColor: appcolor.light,
              }}
              placeholderTextColor={appcolor.greydark}
              defaultValue={productItem.modelName}
              placeholder="Nhập tên sản phẩm"
            />
          </View>
          <ViewCategory />
        </View>
        <View
          style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderRadius: 50,
              backgroundColor: appcolor.primary,
              borderColor: appcolor.greydark,
              borderWidth: 0.2,
              flex: 1,
              padding: 8,
              justifyContent: 'center',
              alignItems: 'center',
              margin: 5,
            }}
            onPress={handleNext}
          >
            <Text
              style={[
                { width: '80%', textAlign: 'center' },
                { color: appcolor.white },
              ]}
            >
              Tiếp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View key={`InputNewProduct`} style={styles.mainContainer}>
      <ActionSheet
        ref={ref}
        id="SheetNewProduct"
        defaultOverlayOpacity={0.3}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        closable={stepCreate == 1 ? true : false}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View
          style={{
            width: deviceWidth,
            height: deviceWidth + 150,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {stepCreate == 1 ? (
            <AddNewProduct />
          ) : (
            <AddNewListInput
              listInput={listInput}
              handlePrev={handlePrev}
              saveProduct={saveProduct}
              productItem={productItem}
            />
          )}
          {isLoading && (
            <View style={styles.progressStyle}>
              <LoadingView
                title={'Đang tải dữ liệu...'}
                isLoading={isLoading}
                styles={{ marginTop: 8 }}
              />
            </View>
          )}
        </View>
      </ActionSheet>
    </View>
  );
});

const ViewSubCategory = ({ dataSubCat, productItem, appcolor }) => {
  const [_, setMutate] = useState(false);
  const onSelectSubCategory = itemCategory => {
    productItem.subCatId =
      productItem.subCatId === itemCategory.subCatId
        ? 0
        : itemCategory.subCatId;
    productItem.subCategory =
      productItem.subCategory === itemCategory.subCategory
        ? ''
        : itemCategory.subCategory;
    setMutate(e => !e);
  };
  const renderSubCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          marginEnd: 5,
          padding: 8,
          minWidth: 50,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor:
            productItem.subCatId === item.subCatId
              ? appcolor.primary
              : appcolor.surface,
          borderColor: appcolor.greydark,
          borderWidth: 0.2,
          borderRadius: 50,
        }}
        onPress={() => onSelectSubCategory(item)}
      >
        <Text
          style={{
            color:
              productItem.subCatId === item.subCatId
                ? appcolor.white
                : appcolor.dark,
          }}
        >
          {item.subCategory}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
      <Text
        style={{
          width: '40%',
          color: appcolor.dark,
          justifyContent: 'center',
          padding: 8,
        }}
      >
        Ngành hàng nhỏ :
      </Text>
      <View style={{ width: '60%' }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dataSubCat}
          renderItem={renderSubCategory}
        />
      </View>
    </View>
  );
};
