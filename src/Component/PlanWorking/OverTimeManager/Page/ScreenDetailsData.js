import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text } from "@rneui/themed";
import { useSelector } from "react-redux";
import { groupDataByKey, MessageAction, MessageInfo, removeVietnameseTones } from "../../../../Core/Helper";
import { SheetManager } from "react-native-actions-sheet";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import { FlashList } from "@shopify/flash-list";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import { GroupListData } from "../../../../Control/GroupListData";
import { OVERTIMEAPI } from "../../../../API/OverTimeAPI";
import { alertNotify, TODAY } from "../../../../Core/Utility";
import FormGroup from "../../../../Content/FormGroup";
import moment from "moment";
import _ from 'lodash';

export const ScreenDetailsData = ({ data }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [dataMain, setDataMain] = useState([])
    const [dataDetails, setDataDetails] = useState([])
    const [_mutate, setMutate] = useState(false)
    let debounceTimeout
    //
    const LoadData = async () => {
        const { arr } = groupDataByKey({ arr: data, key: 'WorkingDay' })
        await setDataMain(arr)
        await setDataDetails(arr)
    }
    const onUpdateItem = async (itemUpdate) => {
        const isValid = validData(itemUpdate)
        if (!isValid) {
            return
        }
        const dataMessage = await getDataMessageRemove(itemUpdate)

        const itemUpload = {
            typeAction: 'REMOVE',
            shopId: itemUpdate.ShopId,
            reportId: kpiinfo.id,
            photoDate: TODAY,
            jsonData: JSON.stringify([itemUpdate]),
            jsonPhoto: '[]',
            dataMessage: JSON.stringify(dataMessage)
        }
        MessageAction(`Bạn có muốn "Gửi yêu cầu cập nhật đề xuất" đăng kí tăng ca không ?`, async () => {
            await OVERTIMEAPI.SaveManagerOT(itemUpload, async (result) => {
                MessageInfo(result.messager)
                DeviceEventEmitter.emit('RELOAD_DATA_OT')
            })
        })
    }
    const validData = (item) => {
        if (item.isNote == 1 && (item.employeeNote || '').length == 0) {
            alertNotify('Vui lòng nhập lí do thay đổi')
            return false
        }
        return true;
    }
    const getDataMessageRemove = (requestInfo) => {
        const workingDay = moment(requestInfo.WorkingDay).format('DD/MM/YYYY')
        const _title = `Hủy đề xuất tăng ca ngày ${workingDay}`
        const _content = `Hủy đề xuất tăng ca ngày ${workingDay}: Nhân viên ${requestInfo.EmployeeName} - Ca làm việc: ${requestInfo.ShiftName} (${requestInfo.TimeFrom} - ${requestInfo.TimeTo})`
        return [{ title: _title, content: _content, parentList: dataMain.parentList }]
    }
    // Handler
    const handlerSearchByGroup = (item, keyValue, isMultiple) => {
        const lstChange = _.map(dataMain, (it, _idx) => {
            if (item.keyValue == it[keyValue])
                return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 }
            else
                return isMultiple ? it : { ...it, isChooseTag: 0 }
        })
        //
        const dataChange = _searchData(lstChange)
        setDataMain(lstChange)
        setDataDetails(dataChange)
    }
    const onSearchData = (text) => {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            search.text = text
            const lstFilter = _searchData(dataMain)
            setDataDetails(lstFilter)
        }, 100)
    }
    const _searchData = (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        //
        let dataChooseTag = _.filter(filterList, (e) => e.isChooseTag == 1)
        if (dataChooseTag.length == 0)
            dataChooseTag = filterList
        //
        const searchData = _.filter(dataChooseTag, (e) => (
            removeVietnameseTones(e.EmployeeName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.EmployeeCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.ShopName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.ShopCode).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.WorkingDayView).toLowerCase().match(valueSearch)
        ))
        return searchData
    }
    const onCloseView = () => {
        SheetManager.hide('requestmanager')
    }
    const handlerChangeNote = (text, item) => {
        item.employeeNote = text
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        LoadData()
    }, [data])
    // View
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.light, width: '100%', height: '100%', padding: 8 },
        itemContainer: { width: '100%', overflow: 'hidden' },
        itemContent: { width: deviceWidth - 16, alignSelf: 'center', padding: 8, borderWidth: 0.5, borderColor: appcolor.darklight, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
        titleHead: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, padding: 8 },
        titleHeadName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, padding: 8, textAlign: 'center' },
        titleContent: { fontSize: 12, fontWeight: '500', color: appcolor.greylight, paddingStart: 5 },
        titleTimeContent: { fontSize: 11, fontWeight: '500', color: appcolor.darkgraymedium, fontStyle: 'italic', textAlign: 'right' },
        contentHead: { width: '100%', height: 38, flexDirection: 'row', alignItems: 'center' },
        statusBackground: { position: 'absolute', top: 0, end: 0, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3 },
        titleStatus: { padding: 5, fontSize: 11, fontWeight: '500', color: appcolor.dark },
        bottomView: { paddingBottom: 32 },
        inputSearch: { fontSize: 12 },
        searchContainer: { marginHorizontal: 8 },
        viewHeader: { flexDirection: 'row', alignItems: 'center', padding: 8 },
        noteContainer: { paddingVertical: 2, paddingHorizontal: 8, marginTop: 8, borderRadius: 8, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        noteStyle: { fontSize: 12, color: appcolor.primary },
    })
    const renderItem = ({ item, index }) => {
        const onRemove = () => onUpdateItem(item)
        const onChangeNoteReject = (text) => handlerChangeNote(text, item)
        return (
            <View key={index} style={styles.itemContainer}>
                {item.isParent &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                        <Icon name="calendar" type="ionicon" size={18} color={appcolor.danger} />
                        <Text style={styles.titleHead}>{`Ngày ${item.WorkingDayView}`}</Text>
                    </View>
                }
                <View style={styles.itemContent}>
                    <View style={styles.contentHead}>
                        <Icon name="home" type="ionicon" size={18} color={appcolor.darkgraymedium} />
                        <Text style={{ ...styles.titleContent, fontWeight: fontWeightBold, color: appcolor.dark }}>{`${item.ShopName}`}</Text>
                        <TouchableOpacity
                            disabled={item.isDelete == 0}
                            style={{ ...styles.statusBackground, backgroundColor: appcolor[item.ColorStatusConfirm || 'light'] }}
                            onPress={onRemove}>
                            <Text style={styles.titleStatus}>{item.StatusConfirm}</Text>
                            {item.isDelete == 1 && <Icon type="ionicon" name="trash" size={18} />}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.titleContent}>{`- Nhân viên: ${item.EmployeeName} (${item.EmployeeCode})`}</Text>
                    <Text style={styles.titleContent}>{`- Tăng ca: ${item.ShiftName} (${item.TimeFrom} ~ ${item.TimeTo})`}</Text>
                    <Text style={styles.titleContent}>{`- Tổng thời gian: ${item.TotalTimeView}`}</Text>
                    <Text style={styles.titleContent}>{`- ${item.Note}`}</Text>
                    {item.ConfirmNote && <Text style={{ ...styles.titleContent, color: appcolor.danger, fontStyle: 'italic' }}>{`Quản lí ghi chú: ${item.ConfirmNote}`}</Text>}
                    <FormGroup
                        editable
                        visible={item.isNote == 1}
                        placeholder='Nhập ghi chú'
                        value={item.employeeNote}
                        useClearAndroid={false}
                        containerStyle={styles.noteContainer}
                        inputStyle={styles.noteStyle}
                        handleChangeForm={onChangeNoteReject}
                    />
                    <Text style={styles.titleTimeContent}>{`${moment(item.CreatedDate).fromNow()}`}</Text>
                </View>
            </View>
        )
    }
    return (
        <SafeAreaView style={styles.mainContainer}>
            <TouchableOpacity onPress={onCloseView} style={styles.viewHeader}>
                <Icon type="ionic" name="arrow-back" size={18} color={appcolor.dark} />
                <Text style={styles.titleHeadName}>{`Danh sách đăng kí OT`}</Text>
            </TouchableOpacity>
            <SearchData
                placeholder='Tìm kiếm'
                inputStyle={styles.inputSearch}
                containerStyle={styles.searchContainer}
                onSearchData={onSearchData}
            />
            <GroupListData
                dataMain={dataMain}
                keyName='StatusConfirm'
                keyValue='StatusConfirm'
                handlerChange={handlerSearchByGroup}
            />
            <FlashList
                keyExtractor={(_item, index) => index.toString()}
                data={dataDetails}
                extraData={[dataDetails]}
                renderItem={renderItem}
                estimatedItemSize={100}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={styles.bottomView} />}
            />
        </SafeAreaView>
    )
}

