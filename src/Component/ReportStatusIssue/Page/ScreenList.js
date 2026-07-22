import React, { useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, FlatList, Platform, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon, Text } from '@rneui/themed';
import { deviceHeight } from "../../../Themes/AppsStyle";
import { REPORT } from "../../../API/ReportAPI";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { deviceWidth, minWidthTab, optionConfirm } from "../../../Core/Utility";
import { PhotoView } from "../Control/View/PhotoView";
import { GroupView } from "../Control/View/GroupView";
import _ from 'lodash'
import { ToastError, removeVietnameseTones } from "../../../Core/Helper";
import { ISSUEAPI } from "../../../API/IssueAPI";
import moment from "moment";
import FormGroup from "../../../Content/FormGroup";

export const ScreenList = ({ }) => {
    const { appcolor, shopinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [isLoading, setLoading] = useState(false)
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [dataTab, setDataTab] = useState([])
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [_mutate, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
        await REPORT.GetDataReportByShop_RealTime(params, async (mData) => {
            const tabList = _.uniqBy(mData, 'issueStatus')
            await setDataTab(tabList)
            await setData(mData)
            await setDataMain(mData)
        })
        await setLoading(false)
    }
    const _checkReupdateStatus = async (params) => {
        await ISSUEAPI.checkDataReupdate(params, (result) => {
            result.statusId !== 200 &&
                ToastError(result.messager, 'Lỗi dữ liệu', 'top')
            if (result.data !== null && result.data.length > 0) {
                const options = [{ text: 'Đồng ý' }]
                optionConfirm('Thông báo', 'Quản lý của bạn yêu cầu bạn cập nhật lại danh sách vấn đề, Vui lòng kiểm tra thông tin ở mục "Cập nhật lại"', options)
            }
        })
    }
    // Handler
    const handlerSearchByGroup = async (item, _type) => {
        const listChooseTag = _.map(dataMain, (it, _idx) => {
            if (item.groupIssueId == it.groupIssueId) {
                return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 }
            } else {
                return it
            }
        })
        //
        const filterList = _.filter(listChooseTag, (e) => e.isChooseTag == 1)
        if (filterList !== null && filterList.length > 0) {
            const tabList = _.uniqBy(filterList, 'issueStatus')
            await setDataTab([])
            await setDataTab(tabList)
            await setData(filterList)
        } else {
            const tabList = _.uniqBy(listChooseTag, 'issueStatus')
            await setDataTab([])
            await setDataTab(tabList)
            setData(listChooseTag)
        }
        await setDataMain(listChooseTag)
    }
    const handlerCloseTag = async () => {
        const listChooseTag = _.map(dataMain, (it, _idx) => {
            return { ...it, isChooseTag: 0 }
        })
        //
        const tabList = _.uniqBy(listChooseTag, 'issueStatus')
        await setDataTab([])
        await setDataTab(tabList)
        await setData(listChooseTag)
        await setDataMain(listChooseTag)
    }
    const handlerUpdateItem = (item) => {
        DeviceEventEmitter.emit('UPDATE_ISSUE_ITEM', item)
    }
    const onSearchData = (text) => {
        search.text = text
        setMutate(e => !e)
        //
        const textValue = removeVietnameseTones(text).toLowerCase()
        const listFilter = _.filter(dataMain, (e) => removeVietnameseTones(e.groupIssueName || '').toLowerCase().match(textValue) ||
            removeVietnameseTones(e.issueStatusName || '').toLowerCase().match(textValue) ||
            removeVietnameseTones(e.noteIssue || '').toLowerCase().match(textValue) ||
            removeVietnameseTones(e.issueComments || '').toLowerCase().match(textValue) ||
            removeVietnameseTones(e.employeeName || '').toLowerCase().match(textValue)
        )
        const tabList = _.uniqBy(listFilter, 'issueStatus')
        setDataTab(tabList)
        setData(listFilter)
    }
    const onFocusSearch = () => {
        search.isSearch = !search.isSearch
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        const _load = LoadData()
        const _reloadData = DeviceEventEmitter.addListener('RELOAD_DATA_ISSUE', LoadData)
        return () => {
            _load
            _reloadData.remove()
        }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: deviceWidth, height: '100%' },
        itemMain: { width: '100%', padding: 8, marginBottom: 4, marginTop: 4, borderRadius: 8, shadowOpacity: 0.5, elevation: 3, backgroundColor: appcolor.light, shadowColor: appcolor.dark, shadowOffset: { width: 3, height: 0 } },
        titleHead: { width: '100%', fontSize: 14, color: appcolor.blacklight, fontWeight: Platform.OS == 'ios' ? '600' : '700', paddingHorizontal: 8 },
        titleContent: { width: '100%', fontSize: 14, color: appcolor.greylight, paddingHorizontal: 8 },
        titleTimer: { width: '100%', fontSize: 12, fontStyle: 'italic', color: appcolor.greylight, textAlign: 'right', marginTop: 8, paddingHorizontal: 8 },
        headerContainerStyle: { backgroundColor: appcolor.light, shadowColor: appcolor.transparent },
        contentMain: { width: deviceWidth, height: '100%', paddingTop: 40 },
        groupViewHead: { width: '100%', borderTopWidth: 0.5, borderTopColor: appcolor.light, backgroundColor: appcolor.light },
        itemLoading: { padding: 8, margin: 8 },
        headerContentView: { width: '100%', flexDirection: "row", alignItems: 'center', padding: 8, paddingTop: 0, paddingStart: 0 },
        contentDataItem: { width: '100%' },
        searchContainer: { margin: 8, marginBottom: 1, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchStyle: { fontSize: 14, color: appcolor.dark },
        searchContainerInput: { margin: 8, marginBottom: 1, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 14, color: appcolor.light, fontWeight: Platform.OS == 'ios' ? '600' : '700' },
    })
    const renderItem = ({ item, index }) => {
        const photos = JSON.parse(item.imageIssues || [])
        const onPress = () => {
            handlerUpdateItem(item)
        }
        return (
            <TouchableOpacity key={`slis_${index}`} style={styles.itemMain} onPress={onPress} disabled={item.isUpdate == 0} >
                <View style={styles.headerContentView}>
                    <Icon type="ionicon" name={item.iconStatus} size={21} color={appcolor[item.colorStatus]} />
                    <View style={styles.contentDataItem}>
                        <Text style={styles.titleContent}>{`${item.groupIssueName}`}</Text>
                        <Text style={styles.titleHead}>{`${item.noteIssue}`}</Text>
                        {item.issueComments && <Text style={styles.titleHead}>{`Ghi chú: ${item.issueComments}`}</Text>}
                    </View>
                </View>
                <PhotoView photos={photos} indexMain={index} />
                <Text style={styles.titleTimer}>{`Cập nhật bởi: ${item.createByName} - ${moment(item.createdDate).fromNow()}`}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <FormGroup
                editable
                placeholder='Tìm kiếm'
                iconName='search'
                defaultValue={search.text}
                iconColor={search.isSearch ? appcolor.light : appcolor.primary}
                useClearAndroid={search.text !== null && search.text.length > 0}
                placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
                containerStyle={search.isSearch ? styles.searchContainerInput : styles.searchContainer}
                inputStyle={search.isSearch ? styles.searchInputStyle : styles.searchStyle}
                handleChangeForm={onSearchData}
                onClearTextAndroid={onSearchData}
                onFocus={onFocusSearch}
                onEndEditing={onFocusSearch}
            />
            <View style={styles.groupViewHead}>
                {isLoading ?
                    <View style={styles.itemLoading}>
                        <ActivityIndicator size='small' color={appcolor.primary} />
                    </View>
                    :
                    <GroupView dataMain={dataMain} handlerChange={handlerSearchByGroup} handlerCloseTag={handlerCloseTag} />
                }
            </View>
            {dataTab !== null && dataTab.length > 0 &&
                <Tabs.Container
                    pagerProps={{ scrollEnabled: false }}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled
                            labelStyle={{ fontSize: 14, fontWeight: '700' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.greylight}
                            activeColor={appcolor.primary}
                            tabStyle={{ backgroundColor: appcolor.light, minWidth: minWidthTab(dataTab), height: 38 }}
                        />
                    )}
                    headerContainerStyle={styles.headerContainerStyle}>
                    {dataTab.map((item, index) => {
                        const _dataIssues = _.filter(data, (e) => e.issueStatus == item.issueStatus)
                        const titleHead = `${item.issueStatusName}${_dataIssues.length > 0 ? ` (${_dataIssues.length})` : ''}`
                        return (
                            <Tabs.Tab key={`tabiis_${index}`} label={titleHead} name={titleHead} >
                                <View style={styles.contentMain}>
                                    <FlatList
                                        key={`item_image_${index}`}
                                        keyExtractor={(_item, index) => index.toString()}
                                        data={_dataIssues}
                                        renderItem={renderItem}
                                        contentContainerStyle={{ paddingHorizontal: 8 }}
                                        estimatedItemSize={100}
                                        getItemLayout={(_data, index) => (
                                            { length: deviceWidth, offset: deviceWidth * index, index }
                                        )}
                                        ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 5 }} />}
                                        refreshControl={<RefreshControl refreshing={false} onRefresh={LoadData} />}
                                    />
                                </View>
                            </Tabs.Tab>
                        )
                    })}
                </Tabs.Container>
            }
        </View>
    )
}