import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, Text, TouchableOpacity, } from "react-native";
import { useSelector } from "react-redux";
import CustomListView from "./Custom/CustomListView";
import { SearchData } from "./SearchData/SearchData";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fontWeightBold } from "../Themes/AppsStyle";
import { groupDataByKey } from "../Core/Helper";
import FilterSheet from "../Component/PlanWorking/History/Attendance/Items/FilterSheet";
import { Button } from "@rneui/base";
import _ from 'lodash';

const ModalItem = ({ dataModal, actionChooseItem, actionClearItem, actionCloseModal, actionSearch, groupType = 'EMPLOYEE', filterDataBy }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataSelect, setDataSelect] = useState([])

    const LoadData = () => {
        let data = []
        switch (groupType) {
            case "EMPLOYEE":
                data = groupDataByKey({ arr: dataModal.dataSelect, key: 'typeId' }).arr
                break;
            default:
                data = dataModal.dataSelect
                break;
        }
        setDataSelect(data)
    }

    const getTitleModal = () => {
        switch (groupType) {
            case "EMPLOYEE":
                return "nhân viên"
            case "SHOP":
                return "cửa hàng"
            case "POSITION":
                return "vị trí"
            default:
                return ""
        }
    }

    useEffect(() => {
        LoadData()
    }, [dataModal.dataSelect])
    //
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.light },
        modalStyle: { flex: 1, backgroundColor: appcolor.light },
        filterStyle: { marginStart: 8, marginEnd: 8 },
        itemModal: { backgroundColor: appcolor.surface, marginBottom: 8, borderRadius: 8, padding: 10 },
        titleName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 11, fontWeight: '500', color: appcolor.placeholder },
        groupName: { fontSize: 13, fontWeight: '500', color: appcolor.primary, marginBottom: 4, padding: 8 },
        headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        buttonContainer: { width: 120, alignSelf: 'center', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
        buttonClose: { width: 120, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.primary, padding: 6, paddingHorizontal: 24 },
        titleButtonClose: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.primary },
    })
    const renderItemModal = ({ item, index }) => {
        let value = null
        let subValue = null
        let sub2Value = null
        let address = null
        switch (groupType) {
            case "EMPLOYEE":
                value = item.employeeName
                subValue = item.employeeCode
                sub2Value = item.typeName
                break;
            case "SHOP":
                value = item.shopName
                subValue = item.shopCode
                address = item.address
                break;
            case "POSITION":
                value = item.typeName
                break;
        }
        const chooseItem = () => {
            actionChooseItem(item)
        }
        const backgroundColor = item.isSelect == 1 ? appcolor.primary : appcolor.surface
        const textColor = item.isSelect == 1 ? appcolor.light : appcolor.dark
        const subTextColor = item.isSelect == 1 ? appcolor.light : appcolor.gray
        return (
            <View>
                {item.isParent && sub2Value && <Text style={styles.groupName}>{sub2Value}</Text>}
                <TouchableOpacity style={[styles.itemModal, { backgroundColor }]} onPress={item.isSelect == 1 ? actionClearItem : chooseItem}>
                    <View style={styles.headerTitle}>
                        <Text style={[styles.titleName, { color: textColor }]}>{index + 1}. {value}</Text>
                        {(item?.numAttendant || null) !== null && <Text style={[styles.subTitleName, { color: textColor }]}>{`${item.numAttendant}`}</Text>}
                    </View>
                    {subValue && <Text style={[styles.subTitleName, { color: subTextColor }]}>{`Code: ${subValue}`}</Text>}
                    {address && <Text style={[styles.subTitleName, { color: subTextColor }]}>{`Địa chỉ: ${address}`}</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <Modal visible={dataModal.visible}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={actionCloseModal}
        >
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light, padding: 8 }}>
                    <Text style={[styles.titleName, { textAlign: 'center' }]}>{`Tìm kiếm`}</Text>
                    <FilterSheet
                        groupType={groupType}
                        filterDataBy={filterDataBy}
                    />
                    <SearchData
                        placeholder={`Tìm kiếm ${getTitleModal()}`}
                        onSearchData={actionSearch}
                    />
                    <CustomListView
                        containerStyle={{ padding: 8 }}
                        data={dataSelect}
                        extraData={dataSelect}
                        renderItem={renderItemModal}
                    />
                    <Button
                        type='outline'
                        title='Đóng'
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonClose}
                        titleStyle={styles.titleButtonClose}
                        onPress={actionCloseModal}
                    />
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    )
}
export default ModalItem;
