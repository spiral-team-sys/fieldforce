import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../../Content/HeaderCustom";
import { REPORT } from "../../../../../API/ReportAPI";
import CustomTab from "../../../../../Control/Custom/CustomTab";
import { toastError, toastSuccess } from "../../../../../Utils/configToast";
import { SearchData } from "../../../../../Control/SearchData/SearchData";
import CustomListView from "../../../../../Control/Custom/CustomListView";
import { Divider, Text } from "@rneui/base";
import { fontWeightBold, styleDefault } from "../../../../../Themes/AppsStyle";
import { removeVietnameseTones } from "../../../../../Core/Helper";
import { LoadingView } from "../../../../../Control/ItemLoading";
import FormGroup from "../../../../../Content/FormGroup";
import moment from "moment";
import _ from 'lodash';
import { NotificationAPI } from "../../../../../API/NotificationAPI";

// confirm values: 3 = pending, 1 = approved, -1 = rejected
const CONFIRM_PENDING = 3;
const CONFIRM_APPROVED = 1;
const CONFIRM_REJECTED = -1;

const RequestUpdateScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo, userinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [dataGroup, setDataGroup] = useState([])
    const [modalConfirm, setModalConfirm] = useState({ visible: false, item: null, error: null })
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
        await REPORT.GetDataReportByShop_RealTime(params, (mData, message) => {
            message && toastError('Thông báo', message)
            //
            const grouplist = _.unionBy(mData, 'weekNumber').map(item => { return { ...item, weekName: `Tuần ${item.weekNumber} ${item.timeWeek}` } })
            setData(mData)
            setDataMain(mData)
            setDataGroup(grouplist)
        })
        await setLoading(false)
    }
    const UploadData = async () => {
        if (isSubmitting) return
        if (!validData()) return
        //   
        await setIsSubmitting(true)
        const { item } = modalConfirm
        const dataRequest = {
            ...item,
            note: note.trim()
        }
        const result = await REPORT.UploadDataRaw_Realtime(dataRequest, shopinfo?.shopId || 0, kpiinfo.id)
        if (result.statusId == 200) {
            toastSuccess('Thành công', 'Đã gửi yêu cầu cập nhật trưng bày')
            setModalConfirm({ visible: false, item: null, error: null })
            await onSendNotification(dataRequest)
            await LoadData()
        } else {
            toastError('Thông báo', `Lỗi: ${result?.messager || 'Không xác định'}`)
        }
        await setIsSubmitting(false)
    }
    const onSendNotification = async (item) => {
        const dataNotify = {
            "title": `Yêu cầu cập nhật trưng bày`,
            "content": `Nhân viên ${userinfo.employeeName} gửi yêu cầu cập nhật trưng bày: Cửa hàng ${item.shopName} (${item.shopCode}) (Tuần ${item.weekNumber} ${item.timeWeek})`,
            "sendType": 'DisplayUpdate',
            "pageName": 'confirmupdatedisplay',
            "employees": `${item.employeeParent || ''}`,
        }
        await NotificationAPI.SendNotification(dataNotify)
    }
    const validData = () => {
        const { item } = modalConfirm
        if (item.reasonValue == null || item.reasonValue == '' || item.reasonValue == undefined) {
            const dataReason = JSON.parse(item?.jsonReason || '[]')
            const isChoose = _.some(dataReason, (o) => o.isChoose === true)
            if (!isChoose) {
                setModalConfirm({ ...modalConfirm, error: 'Vui lòng chọn lý do yêu cầu cập nhật' })
                return false
            }
        }
        if (!note || note.trim() === '') {
            setModalConfirm({ ...modalConfirm, error: 'Vui lòng nhập lý do yêu cầu cập nhật chi tiết' })
            return false
        } else {
            if (note.trim().length < 10) {
                setModalConfirm({ ...modalConfirm, error: 'Lý do yêu cầu cập nhật chi tiết phải có ít nhất 10 ký tự' })
                return false
            }
        }
        return true
    }
    const onSearchData = (text) => {
        if (!text || text.trim() === '') {
            setData(dataMain)
        } else {
            const keyword = removeVietnameseTones(text.trim().toLowerCase())
            const filtered = _.filter(dataMain, (o) =>
                removeVietnameseTones(o.shopName?.toLowerCase()).includes(keyword) ||
                removeVietnameseTones(o.shopCode?.toLowerCase()).includes(keyword)
            )
            setData(filtered)
        }
    }
    const onBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.navigate('Home')
        }
    }
    const onPressItem = (item) => {
        setNote('')
        setModalConfirm({ visible: true, item })
    }
    const onCloseModal = () => {
        if (isSubmitting) return
        setModalConfirm({ visible: false, item: null })
    }
    const getStatusColor = (confirm) => {
        if (confirm === CONFIRM_PENDING) return appcolor.warning
        if (confirm === CONFIRM_REJECTED) return appcolor.red
        return appcolor.success
    }
    const onChangeNote = (text) => {
        setNote(text)
        setModalConfirm({ ...modalConfirm, error: null })
    }
    const onChooseReason = (item, reason) => {
        const dataReason = JSON.parse(item?.jsonReason || '[]')
        const updatedReasons = dataReason.map(r => {
            if (r.ItemId === reason.ItemId) {
                return { ...r, isChoose: !r.isChoose }
            }
            return { ...r, isChoose: false }
        })
        const updatedItem = {
            ...item,
            reasonValue: reason.ItemName,
            jsonReason: JSON.stringify(updatedReasons)
        }
        setModalConfirm({ visible: true, item: updatedItem, error: null })
    }
    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        ...styleDefault(appcolor),
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        confirmTitleName: { fontSize: 12, fontWeight: '500', color: appcolor.red },
        subTitleTime: { fontSize: 11, fontWeight: '500', fontStyle: 'italic', textAlign: 'right', color: appcolor.greylight, marginTop: 4 },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 200 },
        modalContainer: { width: '100%', backgroundColor: appcolor.light, borderRadius: 12, padding: 16 },
        modalTitle: { fontSize: 16, fontWeight: fontWeightBold, color: appcolor.dark, textAlign: 'center', marginBottom: 8 },
        modalDivider: { height: 1, backgroundColor: appcolor.grayLight, marginVertical: 8 },
        modalShopName: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 4 },
        modalInfo: { fontSize: 12, fontWeight: '500', color: appcolor.greylight, marginBottom: 2 },
        noteInput: { borderWidth: 1, borderColor: appcolor.grayLight, borderRadius: 8, padding: 10, fontSize: 13, color: appcolor.dark, minHeight: 72, textAlignVertical: 'top', marginTop: 4 },
        modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
        modalBtn: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 8 },
        cancelBtn: { borderWidth: 1, borderColor: appcolor.grayLight },
        confirmBtn: {},
        modalBtnText: { fontSize: 14, fontWeight: fontWeightBold },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(255,255,255,0.5)' },
        actionReason: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 8, marginEnd: 8 },
        inputContainer: { minHeight: 80, marginTop: 8, marginBottom: 0, borderRadius: 8, backgroundColor: appcolor.light, borderWidth: 0.6, borderColor: appcolor.grey },
    })

    const renderConfirmModal = () => {
        const { item } = modalConfirm
        if (!item) return null
        //
        const dataReason = JSON.parse(item?.jsonReason || '[]')
        return (
            <Modal visible={modalConfirm.visible} statusBarTranslucent transparent animationType="fade" onRequestClose={onCloseModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Xác nhận yêu cầu cập nhật</Text>
                        {modalConfirm.error && (
                            <Text style={[styles.subTitleName, { color: appcolor.danger, textAlign: 'center' }]}>*{modalConfirm.error}</Text>
                        )}
                        <View style={styles.modalDivider} />
                        <Text style={styles.modalShopName}>{item.shopName}</Text>
                        <Text style={styles.modalInfo}>{`Mã CH: ${item.shopCode}`}</Text>
                        <Text style={styles.modalInfo}>{`ĐC: ${item.address}`}</Text>
                        <Text style={styles.modalInfo}>{`NV: ${item.employeeName} (${item.employeeCode})`}</Text>
                        <View style={styles.modalDivider} />
                        <Text style={styles.modalShopName}>{`Lý do`}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                            {dataReason.length > 0 ? (
                                dataReason.map((reason, index) => (
                                    <TouchableOpacity key={index} style={[styles.actionReason, { backgroundColor: reason.isChoose ? appcolor.primary : appcolor.surface }]} onPress={() => onChooseReason(item, reason)}>
                                        <Text style={[styles.subTitleName, { fontWeight: fontWeightBold, color: reason.isChoose ? appcolor.light : appcolor.placeholderText }]}>{`${reason.ItemName}`}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.subTitleName}>Không có lý do cụ thể</Text>
                            )}
                        </View>
                        <FormGroup
                            editable
                            multiline
                            value={note}
                            placeholder="Lý do yêu cầu cập nhật chi tiết"
                            useClearAndroid={false}
                            containerStyle={styles.inputContainer}
                            inputStyle={[styles.inputText, { textAlign: 'start', padding: 8 }]}
                            handleChangeForm={onChangeNote}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={onCloseModal} disabled={isSubmitting}>
                                <Text style={[styles.modalBtnText, { color: appcolor.greylight }]}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: appcolor.primary }]} onPress={UploadData} disabled={isSubmitting}>
                                {isSubmitting
                                    ? <ActivityIndicator size="small" color={appcolor.light} />
                                    : <Text style={[styles.modalBtnText, { color: appcolor.light }]}>Gửi yêu cầu</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    const renderTab = (item) => {
        const dataFilter = _.filter(data, (o) => o.weekNumber === item.weekNumber)
        return (
            <View style={{ flex: 1 }}>
                <CustomListView
                    data={dataFilter}
                    extraData={dataFilter}
                    renderItem={renderItem}
                    onRefresh={LoadData}
                />
            </View>
        )
    }
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => onPressItem(item)} disabled={item.confirm !== null}>
                {item.confirmStatus && <Text style={[styles.subTitleName, { color: getStatusColor(item.confirm), fontWeight: fontWeightBold }]}>{`${item.confirmStatus}`}</Text>}
                {/* // Shop Info */}
                <Text style={styles.titleName}>{`[${item.shopCode}]\n${item.shopName}`}</Text>
                <Text style={styles.subTitleName}>{`ĐC: ${item.address}`}</Text>
                {/* // Employee Info */}
                <Text style={styles.subTitleName}>{`Nhân viên thực hiện: ${item.employeeName}`}</Text>
                <Text style={styles.subTitleName}>{`Code NV: ${item.employeeCode}`}</Text>
                {item.reasonValue && <Text style={styles.subTitleName}>{`${item.reasonValue}`}</Text>}
                {item.requestNote && <Text style={styles.subTitleName}>{`Lý do chi tiết: ${item.requestNote}`}</Text>}
                {/* // Employee Info */}
                {item.confirmByName && (
                    <>
                        <Divider style={{ marginVertical: 4 }} />
                        <Text style={styles.subTitleName}>{`Quản lí xác nhận: ${item.confirmByName}`}</Text>
                        <Text style={styles.subTitleName}>{`Quản lí ghi chú: ${item.confirmNote}`}</Text>
                        <Text style={styles.subTitleName}>{moment(item.confirmDate).fromNow()}</Text>
                    </>
                )}
                {/* // Time */}
                <Text style={styles.subTitleTime}>{moment(item.createDate).fromNow()}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Yêu cầu cập nhật trưng bày'}
                leftFunc={onBack}
            />
            <SearchData
                placeholder="Tìm kiếm cửa hàng"
                onSearchData={onSearchData}
            />
            <LoadingView isLoading={isLoading} styles={styles.loadingView} />
            <CustomTab
                data={dataGroup}
                keyTabName="weekName"
                renderItem={renderTab}
            />
            {renderConfirmModal()}
        </View>
    )
}

export default RequestUpdateScreen;