import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, Modal, Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { REPORT } from "../../../API/ReportAPI";
import { Text } from '@rneui/themed';
import FormGroup from "../../../Content/FormGroup";
;
import { StatusList } from "../Control/StatusList";
import { GroupList } from "../Control/GroupList";
import { PhotoList } from "../Control/PhotoList";
import { ButtonAction } from "../Control/ButtonAction";
import { SheetManager } from "react-native-actions-sheet"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { alertConfirm, alertWarning, checkNetwork } from "../../../Core/Utility";
import { deletePhotoByGuid } from "../../../Controller/PhotoController";
import { ToastError, ToastSuccess, UUIDGenerator, groupDataByKey } from "../../../Core/Helper";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import { deviceHeight, deviceWidth } from "../../Home";
import { InputByCode } from "../Control/InputByCode";
import { ViewListProduct } from "../Control/ViewListProduct";

export const ScreenCreate = ({ type, itemMain = {} }) => {
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [itemIssue, setItemIssue] = useState({
        guid: null,
        issueNote: null,
        groupIssueId: 0,
        groupIssueName: null,
        statusIssueId: 1,
        statusIssueName: 'Chờ xử lý',
        imageIssueList: [],
        imageIssueLength: 0,
        employeeId: 0,
        shopId: 0,
        reportDate: null,
        issueComments: null,
        issueByGroup: null,

    })
    const [dataGroup, setDataGroup] = useState([])
    const [dataStatus, setDataStatus] = useState([])
    const [dataProducts, setDataProducts] = useState([])
    const [modalConfig, setModalConfig] = useState({ visible: false, itemSelect: {} })
    const [_mutate, setMutate] = useState(false)
    //
    const LoadConfig = async () => {
        const params = { shopId: shopinfo.shopId || itemMain.shopId, reportId: kpiinfo.id }
        await REPORT.GetDataConfigReport(params, async (mData) => {
            const _item = mData[0] || {}
            const _groupIssue = JSON.parse(_item.groupIssue || '[]')
            const _statusIssue = JSON.parse(_item.statusIssue || '[]')
            const _dataProduct = JSON.parse(_item.dataProduct || '[]')
            const { arr } = groupDataByKey({
                arr: _dataProduct,
                key: 'CategoryId'
            })
            await setDataGroup(_groupIssue)
            await setDataStatus(_statusIssue)
            await setDataProducts(arr)
        })
        // 
        if (type == 'PLUS') {
            const guid = await getGUIDLocal()
            itemIssue.guid = guid || null
        } else {
            const photoIssue = JSON.parse(itemMain.imageIssues || '[]')
            const _itemUpdate = {
                guid: itemMain.guid || null,
                issueNote: itemMain.noteIssue || null,
                groupIssueId: itemMain.groupIssueId,
                groupIssueName: itemMain.groupIssueName,
                statusIssueId: itemMain.issueStatus,
                statusIssueName: itemMain.issueStatusName,
                imageIssueList: photoIssue || [],
                imageIssueLength: photoIssue.length || 0,
                employeeId: itemMain.employeeId,
                shopId: itemMain.shopId,
                reportDate: itemMain.reportDate,
                issueComments: itemMain.issueComments
            }
            await setItemIssue(_itemUpdate)
        }
        await setMutate(e => !e)
    }
    const getGUIDLocal = async () => {
        const _guid = UUIDGenerator()
        const localGuid = await AsyncStorage.getItem('ISSUE_GUID') || ''
        if (localGuid !== null && localGuid.length > 0) {
            return localGuid
        } else {
            await AsyncStorage.setItem('ISSUE_GUID', _guid)
            return _guid
        }
    }
    // Handler
    const onSaveIssue = async () => {
        const _valid = await validData()
        if (_valid) {
            alertConfirm('Tạo vấn đề', `Bạn có muốn ${type == 'PLUS' ? 'Tạo' : 'Cập nhật'} dữ liệu đã khai báo như bên dưới không ?`, async () => {
                const result = await REPORT.UploadDataRaw_Realtime({ ...itemIssue, typeAction: type }, shopinfo, kpiinfo.id)
                if (result.statusId == 200) {
                    DeviceEventEmitter.emit('RELOAD_DATA_ISSUE')
                    ToastSuccess(result.messager, 'Thông báo', 'top')
                    await AsyncStorage.removeItem('ISSUE_GUID')
                    await onResetIssue()
                    await LoadConfig()
                    type == 'UPDATE' && SheetManager.hide('createissue')
                } else {
                    ToastError(result.messager, 'Thông báo', 'top')
                }
            })
        }
    }
    const onCancelIssue = async () => {
        if (type == 'PLUS' && itemIssue.imageIssueLength > 0) {
            alertConfirm('Chú ý', 'Dữ liệu khởi tạo vấn đề của bạn hiện tại sẽ bị xóa, Bạn có muốn đóng không ?', () => {
                deletePhotoByGuid(itemIssue.guid)
                SheetManager.hide('createissue')
            })
            return;
        }
        SheetManager.hide('createissue')
    }
    const onResetIssue = async () => {
        const _guid = await getGUIDLocal()
        await setItemIssue({
            guid: _guid,
            issueNote: null,
            groupIssueId: 0,
            groupIssueName: null,
            statusIssueId: 1,
            statusIssueName: 'Chờ xử lý',
            imageIssueList: [],
            imageIssueLength: 0,
            employeeId: 0,
            shopId: 0,
            reportDate: null
        })
    }
    const validData = async () => {
        let strError = ''
        // Create Issue
        if (type == 'PLUS') {
            if (itemIssue.groupIssueId == 0)
                strError += `- Chưa chọn loại vấn đề\n`
            if (itemIssue.issueNote == null || itemIssue.issueNote.length == 0)
                strError += `- Chưa nhập nội dung vấn đề\n`
            if (itemIssue.imageIssueLength == 0)
                strError += `- Chưa thêm hình ảnh vấn đề\n`
        }
        // Update Issue
        if (type == 'UPDATE') {
            if (itemIssue.statusIssueId == 0)
                strError += `- Chưa chọn trạng thái\n`
            if (itemIssue.groupIssueId == 0)
                strError += `- Chưa chọn loại vấn đề\n`
        }
        //
        if (strError !== null && strError.length > 0) {
            alertWarning(strError)
            return false
        }
        // Network
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            alertWarning(`Vui lòng kiểm tra lại kết nối mạng, Sau đó gửi lại dữ liệu`)
            return false
        }
        return true
    }
    const onContentChangeText = (text) => {
        itemIssue.issueNote = text
        setMutate(e => !e)
    }
    const onCommentChangeText = (text) => {
        itemIssue.issueComments = text
        setMutate(e => !e)
    }
    const onItemChange = (item, type) => {
        switch (type) {
            case 'STATUS':
                itemIssue.statusIssueId = item.IssueStatus
                itemIssue.statusIssueName = item.ItemName
                break
            case 'GROUP':
                itemIssue.groupIssueId = item.GroupIssueId
                itemIssue.groupIssueName = item.ItemName
                itemIssue.issueByGroup = item.FilterList
                break
        }
        setMutate(e => !e)
    }
    const onButtonPress = (type) => {
        switch (type) {
            case 'CREATE':
                onSaveIssue()
                break
            case 'CANCEL':
                onCancelIssue()
                break
        }
    }
    const handlerCountImage = (data) => {
        itemIssue.imageIssueLength = data.length
        itemIssue.imageIssueList = JSON.stringify(data)
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        const _config = LoadConfig()
        return () => _config
    }, [itemIssue.shopId])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%' },
        contentMain: { padding: 8, width: '100%' },
        contentAction: { padding: 8, width: '100%', flexDirection: 'row', justifyContent: 'flex-end', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        titleHead: { fontSize: 18, fontWeight: fontWeightBold, color: appcolor.primary, position: 'absolute', start: 2, top: 8, padding: 8 },
        titlePlaceholder: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.greylight, fontStyle: 'italic' },
        inputContainer: { margin: 8, padding: 5, borderColor: appcolor.greylight, borderWidth: 0.5, borderRadius: 5 },
        inputStyle: { fontSize: 13, color: appcolor.dark },
        itemMain: { width: '100%' },
        contentImage: { width: '100%', padding: 8, paddingHorizontal: 0 }
    })
    const handleChangeInput = (itemChange) => {
        const dataList = JSON.parse(itemIssue.issueByGroup || '[]')
        let dataNew = []
        for (let i = 0; i < dataList.length; i++) {
            const it = dataList[i]
            if (it.code == itemChange.code) {
                dataNew.push({ ...itemChange })
            } else {
                dataNew.push({ ...it })
            }
        }
        itemIssue.issueByGroup = JSON.stringify(dataNew || '[]')
    }
    const handleSelectItem = (itemSelect) => {
        setModalConfig({ visible: true, itemSelect: itemSelect })
    }
    const handleCloseModal = () => {
        setModalConfig({ visible: false, itemSelect: {} })
    }
    const handleSelectChange = (dataSelect) => {
        const dataList = JSON.parse(itemIssue.issueByGroup || '[]')
        const itemCheck = modalConfig.itemSelect
        let dataNew = []
        for (let i = 0; i < dataList.length; i++) {
            const it = dataList[i]
            if (it.code == itemCheck.code) {
                const itemChange = {
                    ...itemCheck,
                    dataSelect: JSON.stringify(dataSelect)
                }
                dataNew.push({ ...itemChange })
            } else {
                dataNew.push({ ...it })
            }
        }
        itemIssue.issueByGroup = JSON.stringify(dataNew || '[]')
    }
    const ViewItemByList = () => {
        const dataList = JSON.parse(itemIssue.issueByGroup || '[]')
        return (
            <View style={{ width: '100%', borderRadius: 8, borderColor: appcolor.primary, borderWidth: 0.6, padding: 8 }}>
                {
                    dataList.map((it, idx) => {
                        return <InputByCode
                            key={'InputByCode_' + idx} itemInput={it}
                            indexInput={idx} typeInput={it.typeInput}
                            handleChangeInput={handleChangeInput}
                            handleSelectItem={handleSelectItem}
                            styles={styles} type={type}
                        />
                    })
                }
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.contentAction}>
                <Text style={styles.titleHead}>{`${type == 'PLUS' ? 'Tạo' : 'Cập nhật'} vấn đề`}</Text>
                <ButtonAction
                    type='CANCEL'
                    title='Đóng'
                    handlerPress={onButtonPress} />
                <ButtonAction
                    type='CREATE'
                    title={`${type == 'PLUS' ? 'Tạo vấn đề' : 'Cập nhật'}`}
                    handlerPress={onButtonPress} />
            </View>
            <View style={styles.contentMain}>
                {/* // Status */}
                {type !== 'PLUS' &&
                    <View style={styles.itemMain}>
                        <Text style={styles.titlePlaceholder}>Trạng thái</Text>
                        <StatusList
                            defaultValue={itemIssue.statusIssueId}
                            dataMain={dataStatus}
                            handlerChange={onItemChange} />
                    </View>
                }

                {/* // Group */}
                <View style={styles.itemMain}>
                    <Text style={styles.titlePlaceholder}>Loại vấn đề</Text>
                    <GroupList
                        isEnableChoose={type == 'PLUS'}
                        defaultValue={itemIssue.groupIssueId}
                        dataMain={dataGroup}
                        handlerChange={onItemChange} />
                </View>
                {
                    JSON.parse(itemIssue.issueByGroup || '[]').length > 0 &&
                    <View style={styles.itemMain}>
                        <ViewItemByList />
                    </View>
                }
                {/* // Content */}
                <View style={styles.itemMain}>
                    <Text style={styles.titlePlaceholder}>Nội dung</Text>
                    <FormGroup
                        editable={type == 'PLUS'}
                        useClearAndroid={false}
                        multiline
                        defaultValue={itemIssue.issueNote}
                        placeholder='Nhập vấn đề'
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputStyle}
                        handleChangeForm={onContentChangeText}
                    />
                </View>
                <View style={styles.itemMain}>
                    <Text style={styles.titlePlaceholder}>Ghi chú (Nếu có)</Text>
                    <FormGroup
                        editable
                        useClearAndroid={false}
                        multiline
                        defaultValue={itemIssue.issueComments}
                        placeholder='Nhập ghi chú'
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputStyle}
                        handleChangeForm={onCommentChangeText}
                    />
                </View>
                {/* // Images */}
                <View style={styles.itemMain}>
                    <Text style={styles.titlePlaceholder}>{`Hình ảnh (${itemIssue.imageIssueLength} Tấm)`}</Text>
                    <View style={styles.contentImage}>
                        <PhotoList typeMain={type} itemIssue={itemIssue} callBackData={handlerCountImage} />
                    </View>
                </View>
                {/* // */}
            </View>
            {
                modalConfig.visible && <ViewListProduct dataProducts={dataProducts} modalConfig={modalConfig} handleCloseModal={handleCloseModal} styles={styles} type={type} handleSelectChange={handleSelectChange} />
            }
        </View>
    )
}