import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { DashboardAPI } from "../../../../API/DashboardAPI";
import { ToastError } from "../../../../Core/Helper";
import { LoadingView } from "../../../../Control/ItemLoading";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { GroupItemView } from "../Controls/View/GroupItemView";
import { Text } from "@rneui/base";
import { PhotoGallery } from "../Controls/View/PhotoGallery";
import { SafeAreaView } from "react-native-safe-area-context";
import { fontWeightBold } from "../../../../Themes/AppsStyle";
import MultiGroupFilter from "../../Display/Control/MultiGroupFilter";
import _ from 'lodash';
import { ACTION } from "../../../../Core/ReduxController";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { setDashboardFilter } from "../../../../Redux/action";

export const DisplayDetails = ({ pageName, masterFilter }) => {
    const { appcolor, shopinfo } = useSelector(state => state.GAppState)
    const { dashboardFilter } = useSelector(state => state.dashboard)
    const [isLoading, setLoading] = useState(false)
    const [dataTab, setDataTab] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [dataPhoto, setDataPhoto] = useState([])
    const [indexGroup, _setIndexGroup] = useState({ groupId: 0, groupName: null, dataDetails: [] })
    const dispatch = useDispatch()
    //
    const LoadData = async (filter = null) => {
        await setLoading(true)
        const itemFilter = {
            dashboardType: 'DISPLAY',
            shopId: shopinfo?.shopId || 0,
            jsonFilter: await JSON.stringify(filter || dashboardFilter[`${pageName}`])
        }
        await DashboardAPI.GetDashboardDetails(itemFilter, async (mData, messager) => {
            messager && ToastError(messager, 'Lỗi dữ liệu', 'top')
            const _data = JSON.parse(mData[0].jsonData || '[]')
            const _photo = JSON.parse(mData[0].jsonPhoto || '[]')
            const _tabList = _.uniqBy(_data, 't1')
            const _listData = _.filter(_data, (e) => e.isChooseTag == 1)
            //  
            await setDataTab(_tabList)
            await setData(_listData)
            await setDataMain(_data)
            await setDataPhoto(_photo)
        })
        await setLoading(false)
    }

    // Handler
    const onClose = () => {
        SheetManager.hide('detailDashboardPhoto')
    }
    const handlerChangeData = async (filterObject = {}) => {
        await dispatch(setDashboardFilter({ [`${pageName}`]: filterObject }))
        await LoadData(filterObject)
    }
    //
    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        const reload_dashboard = DeviceEventEmitter.addListener('RELOAD_DASHBOARD_DETATLS_DISPLAY', LoadData)
        LoadData(null)
        return () => {
            isMounted = false
            reload_dashboard.remove()
        }
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentMain: { flex: 1 },
        itemMain: { width: '100%', padding: 8 },
        titleHeaderClose: { color: appcolor.light, fontSize: 13, fontWeight: '700', textAlign: 'center' },
        viewHeader: { width: 80, borderWidth: 0.5, borderColor: appcolor.light, backgroundColor: appcolor.dark, padding: 8, borderRadius: 5, margin: 8, position: 'absolute', end: 0, top: 0 },
        contentPhotos: { width: '100%', height: '100%' },
        listPhotoView: { width: '100%', height: '100%', marginTop: 8 },
        searchContainer: { width: '100%', padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { width: '100%', padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary },
        titleNoneImage: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.danger, textAlign: 'center' },
        filterView: { flex: 0.1 }
    })
    return (
        <View style={styles.mainContainer}>
            {/* // Content Main */}
            <View style={styles.contentMain}>
                {
                    masterFilter?.length > 0 &&
                    <MultiGroupFilter
                        isReloadFilter={isLoading}
                        data={masterFilter}
                        pageName={pageName}
                        containerStyle={styles.filterView}
                        handlerChangeData={handlerChangeData}
                    />
                }
                <LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' styles={{ zIndex: 1000 }} />
                <GroupItemView dataMain={data} reload={LoadData} />
            </View>
            <ActionSheet id="detailDashboardPhoto" drawUnderStatusBar={false}>
                <HeaderCustom
                    title='Hình ảnh trưng bày'
                    containerStyle={styles.viewHeader}
                    titleStyle={styles.titleHeaderClose}
                    leftFunc={onClose}
                />
                <View style={styles.listPhotoView}>
                    {dataPhoto.length == 0 && <Text style={styles.titleNoneImage}>Không có hình ảnh</Text>}
                    <PhotoGallery data={dataPhoto} />
                </View>
            </ActionSheet>
        </View>
    )
}