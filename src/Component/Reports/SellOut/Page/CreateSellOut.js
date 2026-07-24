import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  TextInput,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import {
  getCategorySO,
  getProductSO,
} from '../../../../Controller/ProductController';
import { V2_SaveItemSellOut } from '../../../../Controller/SellOutController';
import {
  ToastError,
  ToastSuccess,
  UUIDGenerator,
} from '../../../../Core/Helper';
import { _competitorId } from '../../../../Core/URLs';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { TYPE_INPUT } from '../Controls';
import {
  ITEM_CODE_MAP,
  getReportDateText,
  getConfigItemsSorted,
  getConfigItemsByTab,
  getSummaryRowsFromConfig,
  buildSellOutSaveItem,
} from '../Utils/sellOutCreateHelper';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

// #region constants
const FORM_INIT = {
  quantity: '1',
  price: '',
  serial: '',
  IMEI2: '',
  customer: '',
  phone: '',
  address: '',
  sellComment: '',
};
// #endregion

const CreateSellOut = ({ config, onSaved }) => {
  const { appcolor, workinfo } = useSelector(state => state.GAppState);

  // #region state
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [activeTab, setActiveTab] = useState('core');
  const [formValues, setFormValues] = useState(FORM_INIT);
  const [dynamicValues, setDynamicValues] = useState({});
  const [dataInput, setDataInput] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  // #endregion

  // #region LoadData
  useEffect(() => {
    const loadData = async () => {
      const [lstProducts, lstCategories] = await Promise.all([
        getProductSO(_competitorId),
        getCategorySO(),
      ]);
      setAllProducts(lstProducts);
      setCategories(lstCategories);
    };
    loadData();
  }, []);

  useEffect(() => {
    setDataInput(JSON.parse(config?.dataInput || '[]'));
  }, [config]);
  // #endregion

  // #region derived data
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return allProducts.filter(p => p.category === selectedCategory.name);
  }, [allProducts, selectedCategory]);

  const qtyValue = useMemo(
    () => parseInt(formValues.quantity, 10) || 0,
    [formValues.quantity],
  );
  const priceValue = useMemo(
    () => parseInt(formValues.price, 10) || 0,
    [formValues.price],
  );
  const amountValue = useMemo(
    () => qtyValue * priceValue,
    [qtyValue, priceValue],
  );

  const reportDateText = useMemo(
    () => getReportDateText(workinfo?.workDate),
    [workinfo?.workDate],
  );

  const configItemsSorted = useMemo(() => {
    return getConfigItemsSorted(dataInput);
  }, [dataInput]);

  const configCoreItems = useMemo(() => {
    return getConfigItemsByTab(configItemsSorted, 'core');
  }, [configItemsSorted]);

  const configCustomerItems = useMemo(() => {
    return getConfigItemsByTab(configItemsSorted, 'customer');
  }, [configItemsSorted]);

  const summaryQuickRows = useMemo(() => {
    return getSummaryRowsFromConfig({
      configItemsSorted,
      reportDateText,
      selectedProduct,
      qtyValue,
      priceValue,
      formValues,
      dynamicValues,
    });
  }, [
    configItemsSorted,
    reportDateText,
    selectedProduct,
    qtyValue,
    priceValue,
    formValues.serial,
    formValues.customer,
    formValues.address,
    formValues.phone,
    dynamicValues,
  ]);
  // #endregion

  // #region handlers
  const handleFieldChange = useCallback((key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDynamicChange = useCallback((key, value) => {
    setDynamicValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectCategory = cat => {
    setSelectedCategory(cat);
    setSelectedProduct(null);
    setShowCatModal(false);
  };

  const handleSelectProduct = prod => {
    setSelectedProduct(prod);
    setShowProdModal(false);
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      ToastError('Vui lòng chọn sản phẩm');
      return;
    }
    const qty = parseInt(formValues.quantity, 10);
    if (!qty || qty <= 0) {
      ToastError('Số lượng không hợp lệ');
      return;
    }
    Keyboard.dismiss();
    setIsSaving(true);
    const price = parseInt(formValues.price, 10) || 0;
    const item = buildSellOutSaveItem({
      guiId: UUIDGenerator(),
      workinfo,
      selectedProduct,
      qty,
      price,
      formValues,
    });
    await V2_SaveItemSellOut(item, false, msg => {
      setIsSaving(false);
      ToastSuccess(msg);
      typeof onSaved === 'function' && onSaved();
    });
  };
  // #endregion

  // #region styles
  const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1, paddingHorizontal: 10 },
    pageTitle: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginTop: 4,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    section: {
      marginBottom: 12,
      backgroundColor: appcolor.light,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      padding: 10,
      shadowColor: appcolor.grayLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      paddingHorizontal: 2,
      paddingVertical: 6,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fieldTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 6,
      paddingHorizontal: 2,
    },
    selectBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 10,
      backgroundColor: appcolor.light,
      marginBottom: 8,
    },
    selectText: { fontSize: 13, color: appcolor.dark, flex: 1 },
    placeholderText: { fontSize: 13, color: appcolor.placeholderText, flex: 1 },
    inputWrap: {
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
      backgroundColor: appcolor.light,
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 6,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: appcolor.dark,
      opacity: 0.9,
      marginBottom: 4,
    },
    inputText: {
      fontSize: 14,
      color: appcolor.dark,
      minHeight: 36,
      paddingVertical: 6,
      paddingHorizontal: 0,
    },
    inputReadonly: {
      fontSize: 14,
      color: appcolor.dark,
      minHeight: 36,
      paddingVertical: 8,
    },
    row2: { flexDirection: 'row', gap: 6 },
    col2: { flex: 1 },
    tabsWrap: {
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
      borderRadius: 14,
      padding: 5,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
    },
    tabBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    tabBtnActive: {
      backgroundColor: appcolor.primary,
      shadowColor: appcolor.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 1,
    },
    tabLeft: { alignItems: 'center', flexDirection: 'row' },
    tabCount: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 6,
      backgroundColor: appcolor.light,
    },
    tabCountText: {
      fontSize: 11,
      color: appcolor.primary,
      fontWeight: fontWeightBold,
    },
    tabCountTextActive: { color: appcolor.primary },
    tabText: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '700',
      marginLeft: 6,
    },
    tabTextActive: { color: appcolor.white },
    summaryCard: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: appcolor.primary,
      marginBottom: 10,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
    },
    summaryHeader: {
      backgroundColor: appcolor.primary,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryHeaderText: {
      color: appcolor.white,
      fontSize: 13,
      fontWeight: fontWeightBold,
    },
    summarySaveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 8,
      opacity: isSaving ? 0.7 : 1,
    },
    summarySaveBtnText: {
      color: appcolor.primary,
      fontSize: 12,
      fontWeight: fontWeightBold,
      marginLeft: 6,
    },
    summaryBody: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
    summaryQuickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 6,
    },
    summaryQuickItem: {
      width: '49%',
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: appcolor.surface,
    },
    summaryQuickLabel: { color: appcolor.placeholderText, fontSize: 11 },
    summaryQuickValue: {
      color: appcolor.dark,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
    },
    textHint: {
      fontSize: 11,
      color: appcolor.placeholderText,
      marginTop: -2,
      marginBottom: 6,
      paddingHorizontal: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: appcolor.light,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '70%',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
    },
    modalTitle: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 12,
      textAlign: 'center',
    },
    modalItem: {
      paddingVertical: 13,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    modalItemText: { fontSize: 14, color: appcolor.dark },
  });
  // #endregion

  // #region render helpers
  const renderInputField = ({
    inputKey,
    title,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    editable = true,
  }) => {
    return (
      <View style={styles.inputWrap} key={inputKey}>
        <Text style={styles.inputLabel}>{title}</Text>
        {editable ? (
          <TextInput
            value={value || ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={appcolor.placeholderText}
            style={styles.inputText}
            keyboardType={keyboardType}
            autoCorrect={false}
            autoComplete="off"
          />
        ) : (
          <Text style={styles.inputReadonly}>{value || '-'}</Text>
        )}
      </View>
    );
  };

  const renderDynamicField = (item, index) => {
    const key = item.FieldKey || `dynamic_${index}`;
    switch (item.TypeInput) {
      case TYPE_INPUT.number:
        return renderInputField({
          inputKey: key,
          title: item.ItemName,
          value: dynamicValues[key] || '',
          onChangeText: v => handleDynamicChange(key, v),
          placeholder: item.TextValue || 'Nhập số',
          keyboardType: 'number-pad',
        });
      case TYPE_INPUT.phone:
        return renderInputField({
          inputKey: key,
          title: item.ItemName,
          value: dynamicValues[key] || '',
          onChangeText: v => handleDynamicChange(key, v),
          placeholder: item.TextValue || 'Nhập số điện thoại',
          keyboardType: 'phone-pad',
        });
      default:
        return renderInputField({
          inputKey: key,
          title: item.ItemName,
          value: dynamicValues[key] || '',
          onChangeText: v => handleDynamicChange(key, v),
          placeholder: item.TextValue || 'Nhập dữ liệu',
        });
    }
  };

  const renderConfigMappedField = (item, index) => {
    const mapInfo = ITEM_CODE_MAP[item.ItemCode];
    if (!mapInfo) return renderDynamicField(item, index);

    if (mapInfo.field === 'reportDate') {
      return renderInputField({
        inputKey: `mapped_${item.ItemCode}_${index}`,
        title: item.ItemName,
        value: reportDateText,
        editable: false,
      });
    }

    if (mapInfo.field === 'productName') {
      return (
        <View key={`mapped_${item.ItemCode}_${index}`}>
          <Text style={styles.fieldTitle}>{item.ItemName}</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowCatModal(true)}
          >
            <Text
              style={
                selectedCategory ? styles.selectText : styles.placeholderText
              }
            >
              {selectedCategory?.name || '-- Chọn nhóm sản phẩm --'}
            </Text>
            <SpiralIcon
              name="chevron-down"
              type="font-awesome-5"
              size={13}
              color={appcolor.dark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectBox, !selectedCategory && { opacity: 0.5 }]}
            onPress={() => selectedCategory && setShowProdModal(true)}
            disabled={!selectedCategory}
          >
            <Text
              style={
                selectedProduct ? styles.selectText : styles.placeholderText
              }
            >
              {selectedProduct?.productName || '-- Chọn sản phẩm --'}
            </Text>
            <SpiralIcon
              name="chevron-down"
              type="font-awesome-5"
              size={13}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        </View>
      );
    }

    switch (mapInfo.field) {
      case 'quantity':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.quantity,
          onChangeText: v => handleFieldChange('quantity', v),
          placeholder: '0',
          keyboardType: 'number-pad',
        });
      case 'price':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.price,
          onChangeText: v => handleFieldChange('price', v),
          placeholder: '0',
          keyboardType: 'number-pad',
        });
      case 'serial':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.serial,
          onChangeText: v => handleFieldChange('serial', v),
          placeholder: 'Nhap serial hoac IMEI',
        });
      case 'customer':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.customer,
          onChangeText: v => handleFieldChange('customer', v),
          placeholder: 'Nhap ten',
        });
      case 'address':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.address,
          onChangeText: v => handleFieldChange('address', v),
          placeholder: 'Nhap dia chi',
        });
      case 'phone':
        return renderInputField({
          inputKey: `mapped_${item.ItemCode}_${index}`,
          title: item.ItemName,
          value: formValues.phone,
          onChangeText: v => handleFieldChange('phone', v),
          placeholder: 'Nhap so dien thoai',
          keyboardType: 'phone-pad',
        });
      default:
        return renderDynamicField(item, index);
    }
  };

  const SelectModal = ({
    visible,
    onClose,
    title,
    data,
    onSelect,
    nameKey,
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>
          <CustomListView
            data={data}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.modalItemText}>{item[nameKey]}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(_, i) => i.toString()}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const SummaryTable = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryHeaderText}>Thông tin số bán</Text>
        <TouchableOpacity
          style={styles.summarySaveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          <SpiralIcon
            name="save"
            type="font-awesome-5"
            size={16}
            color={appcolor.primary}
          />
          <Text style={styles.summarySaveBtnText}>
            {isSaving ? 'Đang lưu' : 'Lưu'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summaryBody}>
        <View style={styles.summaryQuickGrid}>
          {summaryQuickRows.map((row, index) => (
            <View
              key={`summary_quick_${index}`}
              style={styles.summaryQuickItem}
            >
              <Text style={styles.summaryQuickLabel}>{row.label}</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.summaryQuickValue}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const TabButton = ({ id, label, iconName, count }) => (
    <TouchableOpacity
      style={[styles.tabBtn, activeTab === id && styles.tabBtnActive]}
      onPress={() => setActiveTab(id)}
    >
      <View style={styles.tabLeft}>
        <SpiralIcon
          name={iconName}
          type="font-awesome-5"
          size={12}
          color={activeTab === id ? appcolor.white : appcolor.dark}
        />
        <Text
          style={[styles.tabText, activeTab === id && styles.tabTextActive]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.tabCount}>
        <Text
          style={[
            styles.tabCountText,
            activeTab === id && styles.tabCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'core') {
      return (
        <View style={styles.section}>
          {configCoreItems.length > 0 ? (
            configCoreItems.map((item, index) =>
              renderConfigMappedField(item, index),
            )
          ) : (
            <Text style={styles.textHint}>
              Khong co cau hinh nhap lieu nhom Don hang
            </Text>
          )}
        </View>
      );
    }

    if (activeTab === 'customer') {
      return (
        <View style={styles.section}>
          {configCustomerItems.length > 0 ? (
            configCustomerItems.map((item, index) =>
              renderConfigMappedField(item, index),
            )
          ) : (
            <Text style={styles.textHint}>
              Khong co cau hinh nhap lieu nhom Thong tin khach hang
            </Text>
          )}
        </View>
      );
    }

    return null;
  };
  // #endregion

  // #region view
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <CustomListView
        data={['SELLOUT']}
        ListHeader={<SummaryTable />}
        renderItem={() => {
          return (
            <View style={styles.tabsWrap}>
              <TabButton
                id="core"
                label="Chung"
                iconName="receipt"
                count={configCoreItems.length}
              />
              <TabButton
                id="customer"
                label="Khach hang"
                iconName="user"
                count={configCustomerItems.length}
              />
            </View>
          );
        }}
        ListFooter={renderTabContent()}
      />

      <SelectModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        title="Chọn nhóm sản phẩm"
        data={categories}
        onSelect={handleSelectCategory}
        nameKey="name"
      />
      <SelectModal
        visible={showProdModal}
        onClose={() => setShowProdModal(false)}
        title="Chọn sản phẩm"
        data={filteredProducts}
        onSelect={handleSelectProduct}
        nameKey="productName"
      />
    </KeyboardAvoidingView>
  );
  // #endregion
};

export default CreateSellOut;
