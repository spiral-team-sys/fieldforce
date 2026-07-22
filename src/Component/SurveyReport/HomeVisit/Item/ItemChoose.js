import { Icon, Text } from "@rneui/base";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import { parseJsonArray, normalizeText } from "./ItemHelpers";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ItemChoose = ({ item, onUpdateItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [modalVisible, setModalVisible] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [listItems, setListItems] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)

    const normalizeListItems = (items = []) => {
        return items
            .map((x, index) => ({
                ItemId: x?.ItemId || x?.itemId || index + 1,
                Name: `${x?.Name || x?.name || x?.ItemName || ''}`.trim(),
            }))
            .filter(x => !!x.Name)
    }

    const getSavedSelectedItem = (items = []) => {
        const savedName = `${item?.Value || ''}`.trim()
        if (!savedName) return null
        return items.find(x => x.Name === savedName) || null
    }

    const loadData = () => {
        const items = normalizeListItems(parseJsonArray(item?.ListItems))
        setListItems(items)
        setSelectedItem(getSavedSelectedItem(items))
    }

    useEffect(() => {
        loadData()
    }, [item])

    const filteredItems = useMemo(() => {
        const q = normalizeText(searchText)
        if (!q) return listItems
        return listItems.filter(x => normalizeText(x.Name).includes(q))
    }, [listItems, searchText])

    const openModal = () => {
        setSearchText('')
        setSelectedItem(getSavedSelectedItem(listItems))
        setModalVisible(true)
    }

    const onSelectItem = (row) => {
        setSelectedItem(row)
        item.Value = row?.Name || ''
        onUpdateItem && onUpdateItem(item)
        setModalVisible(false)
    }

    const handleCancel = () => {
        setSelectedItem(getSavedSelectedItem(listItems))
        setModalVisible(false)
    }

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, marginTop: 8, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.greydark, backgroundColor: appcolor.light },
        selectButtonIncomplete: { borderColor: appcolor.red },
        selectButtonText: { fontSize: 13, color: appcolor.dark, flex: 1, paddingRight: 8 },
        modalBackdrop: { flex: 1 },
        modalContainer: { flex: 1, backgroundColor: appcolor.light },
        modalHeader: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: appcolor.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        modalTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.white, flex: 1 },
        modalCloseIcon: { fontSize: 18, color: appcolor.white, fontWeight: fontWeightBold },
        modalCloseButton: { padding: 6, marginLeft: 12 },
        searchWrapper: { paddingHorizontal: 8, paddingTop: 4, borderBottomColor: appcolor.grayLight, borderBottomWidth: 0.5, backgroundColor: appcolor.white },
        listContainer: { flex: 1, backgroundColor: appcolor.light },
        itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: appcolor.surface },
        itemRowSelected: { backgroundColor: appcolor.surface },
        itemName: { fontSize: 13, color: appcolor.dark, fontWeight: '500', flex: 1, paddingRight: 8 },
        modalFooter: { paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 0 : 16, paddingHorizontal: 16, borderTopColor: appcolor.grayLight, borderTopWidth: 1, backgroundColor: appcolor.light },
        buttonContainerRow: { flexDirection: 'row', gap: 12 },
        secondaryButton: { flex: 1, paddingVertical: 8, borderRadius: 10, borderColor: appcolor.blacklight, borderWidth: 1, alignItems: 'center' },
        secondaryButtonText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
    })

    const renderItem = ({ item: row }) => {
        const selected = selectedItem?.ItemId === row.ItemId
        return (
            <TouchableOpacity style={[styles.itemRow, selected && styles.itemRowSelected]} onPress={() => onSelectItem(row)}>
                <Text style={styles.itemName}>{row.Name}</Text>
                {selected && <Icon name='check-circle' type='material-icons' size={20} color={appcolor.primary} />}
            </TouchableOpacity>
        )
    }

    const displayLabel = `${item?.Value || ''}`.trim() || 'Nhấn để chọn'

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity style={[styles.selectButton, !`${item?.Value || ''}`.trim() && styles.selectButtonIncomplete]} onPress={openModal}>
                <Text style={styles.selectButtonText}>{displayLabel}</Text>
                <Icon name='chevron-right' type='material-icons' size={20} color={appcolor.placeholderText} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType='fade' transparent statusBarTranslucent={false} onRequestClose={handleCancel}>
                <SafeAreaProvider>
                    <SafeAreaView style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Chọn giá trị</Text>
                                <TouchableOpacity onPress={handleCancel} style={styles.modalCloseButton}>
                                    <Text style={styles.modalCloseIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchWrapper}>
                                <SearchData
                                    placeholder='Tìm kiếm...'
                                    value={searchText}
                                    onSearchData={setSearchText}
                                />
                            </View>

                            <View style={styles.listContainer}>
                                <CustomListView
                                    data={filteredItems}
                                    renderItem={renderItem}
                                    extraData={selectedItem}
                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}

export default ItemChoose;