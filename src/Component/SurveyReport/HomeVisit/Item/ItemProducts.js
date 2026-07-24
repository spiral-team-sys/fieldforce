import { Icon, Text } from '@rneui/base';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import CustomListView from '../../../../Control/Custom/CustomListView';
import CustomTab from '../../../../Control/Custom/CustomTab';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { normalizeText, parseJsonArray, parseTextValues } from './ItemHelpers';

const ItemProducts = ({ item, onUpdateItem }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [listItems, setListItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const getSavedSelectedItems = (products = []) => {
    const savedIds = parseJsonArray(item?.ProductIds)
      .map(id => Number(id))
      .filter(Number.isFinite);
    if (savedIds.length > 0) {
      return products.filter(product =>
        savedIds.includes(Number(product?.ProductId)),
      );
    }

    const savedNames = parseTextValues(item?.Value);
    if (savedNames.length === 0) return [];
    return products.filter(product =>
      savedNames.includes(product?.ProductName),
    );
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      marginTop: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.greydark,
      backgroundColor: appcolor.light,
    },
    selectButtonIncomplete: { borderColor: appcolor.red },
    selectButtonText: {
      fontSize: 13,
      color: appcolor.dark,
      flex: 1,
      paddingRight: 8,
    },
    selectedBadge: {
      backgroundColor: appcolor.primary,
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginLeft: 6,
    },
    selectedBadgeText: {
      color: appcolor.white,
      fontSize: 11,
      fontWeight: fontWeightBold,
    },
    // Modal
    modalBackdrop: { flex: 1 },
    modalContainer: { flex: 1, backgroundColor: appcolor.primary },
    modalHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.white,
      flex: 1,
    },
    modalCloseIcon: {
      fontSize: 18,
      color: appcolor.white,
      fontWeight: fontWeightBold,
    },
    modalCloseButton: { padding: 6, marginLeft: 12 },
    tabContainer: { flex: 1, backgroundColor: appcolor.light },
    modalFooter: {
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 0 : 16,
      paddingHorizontal: 16,
      borderTopColor: appcolor.grayLight,
      borderTopWidth: 1,
      backgroundColor: appcolor.light,
    },
    buttonContainerRow: { flexDirection: 'row', gap: 12 },
    secondaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      borderColor: appcolor.blacklight,
      borderWidth: 1,
      alignItems: 'center',
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
    },
    primaryButtonText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.white,
      textAlign: 'center',
    },
    searchWrapper: {
      paddingHorizontal: 8,
      paddingTop: 4,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
      backgroundColor: appcolor.white,
    },
    // List rows
    groupHeader: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      backgroundColor: appcolor.primary + '20',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    groupHeaderText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    segmentText: {
      fontSize: 11,
      color: appcolor.placeholderText,
      marginLeft: 6,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: appcolor.surface,
    },
    productRowSelected: { backgroundColor: appcolor.surface },
    productInfo: { flex: 1 },
    productCode: {
      fontSize: 11,
      color: appcolor.placeholderText,
      fontWeight: '500',
    },
    productName: {
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
  });

  // ─── Actions ──────────────────────────────────────────────────────────────
  const loadData = () => {
    const products = parseJsonArray(item?.ListItems);
    setListItems(products);
    setSelectedItems(getSavedSelectedItems(products));
  };

  useEffect(() => {
    loadData();
  }, [item]);

  const toggleSelect = product => {
    setSelectedItems(prev => {
      const exists = prev.some(s => s.ProductId === product.ProductId);
      return exists
        ? prev.filter(s => s.ProductId !== product.ProductId)
        : [...prev, product];
    });
  };

  const handleConfirm = () => {
    item.Value = selectedItems
      .map(product => product?.ProductName)
      .filter(Boolean)
      .join(', ');
    item.ProductIds = JSON.stringify(
      selectedItems
        .map(product => product?.ProductId)
        .filter(id => id !== undefined && id !== null),
    );
    onUpdateItem && onUpdateItem(item);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setSelectedItems(getSavedSelectedItems(listItems));
    setModalVisible(false);
  };

  const openModal = () => {
    setSearchText('');
    setSelectedItems(getSavedSelectedItems(listItems));
    setModalVisible(true);
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = normalizeText(searchText);
    if (!q) return listItems;
    return listItems.filter(
      p =>
        normalizeText(p.ProductName).includes(q) ||
        normalizeText(p.ProductCode).includes(q) ||
        normalizeText(p.SubCategory).includes(q) ||
        normalizeText(p.Segment).includes(q),
    );
  }, [listItems, searchText]);

  const categories = useMemo(() => {
    const seen = new Set();
    return listItems.reduce((acc, p) => {
      if (p.CategoryName && !seen.has(p.CategoryName)) {
        seen.add(p.CategoryName);
        acc.push({ CategoryName: p.CategoryName });
      }
      return acc;
    }, []);
  }, [listItems]);

  const getGroupedData = categoryName => {
    const products = filteredItems.filter(p => p.CategoryName === categoryName);
    const result = [];
    const seen = new Set();
    products.forEach(p => {
      const key = `${p.SubCategory || ''}||${p.Segment || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          _isHeader: true,
          SubCategory: p.SubCategory || '',
          Segment: p.Segment || '',
          _key: key,
        });
      }
      result.push({ ...p, _isHeader: false });
    });
    return result;
  };

  const displayLabel = useMemo(() => {
    return item?.Value?.trim() ? item.Value : 'Chọn sản phẩm';
  }, [item?.Value]);

  const savedItems = useMemo(
    () => getSavedSelectedItems(listItems),
    [item?.ProductIds, item?.Value, listItems],
  );

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderProductItem = ({ item: row }) => {
    if (row._isHeader) {
      return (
        <View style={styles.groupHeader}>
          {row.SubCategory ? (
            <Text style={styles.groupHeaderText}>{row.SubCategory}</Text>
          ) : null}
          {row.Segment ? (
            <Text style={styles.segmentText}>• {row.Segment}</Text>
          ) : null}
        </View>
      );
    }
    const selected = selectedItems.some(s => s.ProductId === row.ProductId);
    return (
      <TouchableOpacity
        style={[styles.productRow, selected && styles.productRowSelected]}
        onPress={() => toggleSelect(row)}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{row.ProductName}</Text>
          <Text style={styles.productCode}>{row.ProductCode}</Text>
        </View>
        {selected && (
          <SpiralIcon
            name="check-circle"
            type="material-icons"
            size={20}
            color={appcolor.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderTabContent = tabItem => {
    const grouped = getGroupedData(tabItem.CategoryName);
    return (
      <CustomListView
        data={grouped}
        renderItem={renderProductItem}
        extraData={selectedItems}
      />
    );
  };

  // ─── View ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          savedItems.length === 0 && styles.selectButtonIncomplete,
        ]}
        onPress={openModal}
      >
        <Text style={styles.selectButtonText}>{displayLabel}</Text>
        {savedItems.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>{savedItems.length}</Text>
          </View>
        )}
        <SpiralIcon
          name="chevron-right"
          type="material-icons"
          size={20}
          color={appcolor.placeholderText}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent={false}
        onRequestClose={handleCancel}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn sản phẩm</Text>
                {selectedItems.length > 0 && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                      {selectedItems.length}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchWrapper}>
                <SearchData
                  placeholder="Tìm sản phẩm..."
                  value={searchText}
                  onSearchData={setSearchText}
                />
              </View>

              <View style={styles.tabContainer}>
                <CustomTab
                  keyTabName="CategoryName"
                  data={categories}
                  dataMain={filteredItems}
                  renderItem={renderTabContent}
                />
              </View>

              <View style={styles.modalFooter}>
                <View style={styles.buttonContainerRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.secondaryButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.primaryButtonText}>
                      Xác nhận
                      {selectedItems.length > 0
                        ? ` (${selectedItems.length})`
                        : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default ItemProducts;
