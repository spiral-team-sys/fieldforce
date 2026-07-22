import { Icon, Text } from "@rneui/base";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import CustomListView from "../../../../Control/Custom/CustomListView";
import { normalizeText, parseJsonArray, parseTextValues } from "./ItemHelpers";

const ItemEmployees = ({ item, onUpdateItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [listItems, setListItems] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [selectedItems, setSelectedItems] = useState([])

    const getSavedSelectedItems = (employees = []) => {
        const savedIds = parseJsonArray(item?.EmployeeIds).map(id => Number(id)).filter(Number.isFinite)
        if (savedIds.length > 0) {
            return employees.filter(emp => savedIds.includes(Number(emp?.EmployeeId)))
        }

        const savedNames = parseTextValues(item?.Value)
        if (savedNames.length === 0) return []
        return employees.filter(emp => savedNames.includes(emp?.EmployeeName))
    }

    const loadData = () => {
        const employees = parseJsonArray(item?.ListItems)
        setListItems(employees)
        setSelectedItems(getSavedSelectedItems(employees))
    }

    useEffect(() => {
        loadData()
    }, [item])

    // ─── Actions ──────────────────────────────────────────────────────────────
    const toggleSelect = (employee) => {
        setSelectedItems(prev => {
            const exists = prev.some(s => s.EmployeeId === employee.EmployeeId)
            return exists
                ? prev.filter(s => s.EmployeeId !== employee.EmployeeId)
                : [...prev, employee]
        })
    }

    const handleConfirm = () => {
        item.Value = selectedItems.map(emp => emp?.EmployeeName).filter(Boolean).join(', ')
        item.EmployeeIds = JSON.stringify(selectedItems.map(emp => emp?.EmployeeId).filter(id => id !== undefined && id !== null))
        onUpdateItem && onUpdateItem(item)
        setModalVisible(false)
    }

    const handleCancel = () => {
        setSelectedItems(getSavedSelectedItems(listItems))
        setModalVisible(false)
    }

    const openModal = () => {
        setSearchText('')
        setSelectedItems(getSavedSelectedItems(listItems))
        setModalVisible(true)
    }

    // ─── Styles ───────────────────────────────────────────────────────────────
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, marginTop: 8, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.greydark, backgroundColor: appcolor.light },
        selectButtonIncomplete: { borderColor: appcolor.red },
        selectButtonText: { fontSize: 13, color: appcolor.dark, flex: 1, paddingRight: 8 },
        selectedBadge: { backgroundColor: appcolor.primary, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 6 },
        selectedBadgeText: { color: appcolor.white, fontSize: 11, fontWeight: fontWeightBold },
        // Modal
        modalBackdrop: { flex: 1 },
        modalContainer: { flex: 1, backgroundColor: appcolor.light },
        modalHeader: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: appcolor.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        modalTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.white, flex: 1 },
        modalCloseIcon: { fontSize: 18, color: appcolor.white, fontWeight: fontWeightBold },
        modalCloseButton: { padding: 6, marginLeft: 12 },
        tabContainer: { flex: 1, backgroundColor: appcolor.light, paddingHorizontal: 8 },
        modalFooter: { paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 0 : 16, paddingHorizontal: 16, borderTopColor: appcolor.grayLight, borderTopWidth: 1, backgroundColor: appcolor.light },
        buttonContainerRow: { flexDirection: 'row', gap: 12 },
        secondaryButton: { flex: 1, paddingVertical: 8, borderRadius: 10, borderColor: appcolor.blacklight, borderWidth: 1, alignItems: 'center' },
        primaryButton: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: appcolor.primary, alignItems: 'center' },
        secondaryButtonText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center' },
        primaryButtonText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.white, textAlign: 'center' },
        searchWrapper: { paddingHorizontal: 8, paddingTop: 4, borderBottomColor: appcolor.grayLight, borderBottomWidth: 0.5, backgroundColor: appcolor.white },
        // List rows 
        employeeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: appcolor.surface },
        employeeRowSelected: { backgroundColor: appcolor.surface },
        employeeInfo: { flex: 1 },
        employeeCode: { fontSize: 11, color: appcolor.placeholderText, fontWeight: '500' },
        employeeName: { fontSize: 13, color: appcolor.dark, fontWeight: fontWeightBold },
    })

    // ─── Derived data ─────────────────────────────────────────────────────────
    const filteredItems = useMemo(() => {
        const q = normalizeText(searchText)
        if (!q) return listItems
        return listItems.filter(emp =>
            normalizeText(emp.EmployeeName).includes(q) ||
            normalizeText(emp.EmployeeCode).includes(q)
        )
    }, [listItems, searchText])

    const displayLabel = useMemo(() => {
        return item?.Value?.trim() ? item.Value : 'Nhấn để chọn người thực hiện'
    }, [item?.Value])

    const savedItems = useMemo(() => getSavedSelectedItems(listItems), [item?.EmployeeIds, item?.Value, listItems])

    // ─── Render helpers ───────────────────────────────────────────────────────
    const renderEmployeeItem = ({ item: row }) => {
        const selected = selectedItems.some(s => s.EmployeeId === row.EmployeeId)
        return (
            <TouchableOpacity style={[styles.employeeRow, selected && styles.employeeRowSelected]} onPress={() => toggleSelect(row)}>
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{row.EmployeeName}</Text>
                    <Text style={styles.employeeCode}>{row.EmployeeCode}</Text>
                </View>
                {selected && <Icon name='check-circle' type='material-icons' size={20} color={appcolor.primary} />}
            </TouchableOpacity>
        )
    }

    // ─── View ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity style={[styles.selectButton, savedItems.length === 0 && styles.selectButtonIncomplete]} onPress={openModal}>
                <Text style={styles.selectButtonText}>{displayLabel}</Text>
                {savedItems.length > 0 && (
                    <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>{savedItems.length}</Text>
                    </View>
                )}
                <Icon name='chevron-right' type='material-icons' size={20} color={appcolor.placeholderText} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType='fade' transparent statusBarTranslucent={false} onRequestClose={handleCancel}>
                <SafeAreaProvider>
                    <SafeAreaView style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{`Chọn người thực hiện (${selectedItems.length})`}</Text>
                                <TouchableOpacity onPress={handleCancel} style={styles.modalCloseButton}>
                                    <Text style={styles.modalCloseIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchWrapper}>
                                <SearchData
                                    placeholder='Tìm người thực hiện...'
                                    value={searchText}
                                    onSearchData={setSearchText}
                                />
                            </View>

                            <View style={styles.tabContainer}>
                                <CustomListView
                                    data={filteredItems}
                                    renderItem={renderEmployeeItem}
                                    extraData={selectedItems}
                                />
                            </View>

                            <View style={styles.modalFooter}>
                                <View style={styles.buttonContainerRow}>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                                        <Text style={styles.secondaryButtonText}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
                                        <Text style={styles.primaryButtonText}>Xác nhận{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}

export default ItemEmployees;