import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, DeviceEventEmitter, SafeAreaView } from 'react-native';
import { getDataNotify, fetchDataNotify, readNotifyUpdate, makeReadAllNotify } from '../Controller/NotificationController';
import { Avatar } from '@rneui/base';
import { ColorRand, GetEmployeeInfo, StringTobase64, removeVietnameseTones } from '../Core/Helper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';
import WebViewUI from '../Content/WebViewUI';
import { HeaderCustom } from '../Content/HeaderCustom'
import { useSelector } from 'react-redux';
import { TODAY, alertConfirm, removeDuplicate, deviceWidth, minWidthTab } from '../Core/Utility';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../Control/ItemLoading/index'
import { InAppMess } from './Notification/InAppMess';
import { FlashList } from '@shopify/flash-list';

const ManageNotify = ({ navigation }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [urlSite, setUrlSite] = useState({ hyperLink: '', titleName: '' })
    const [dataNotify, setDataNotify] = useState([])
    const [dataHeader, setDataHeader] = useState([])
    const [loading, setLoading] = useState(false)
    const [visibleWebView, setVisibleWebView] = useState(false)
    const [inAppShow, setInAppShow] = useState({ showInApp: false, messengerId: 0 })
    const [_, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        await fetchDataNotify();
        const mData = await getDataNotify();
        const dataFilter = mData.filter(it => (moment(it.createdDate || '').format('YYYY-MM-DD') >= (moment().subtract(3, 'M').format('YYYY-MM-DD'))) || (it.seen != 1))
        const { data, header } = mapDataAnonymous(dataFilter)
        await setDataNotify(data);
        await setDataHeader(header);
        await setLoading(false)
    }
    const mapDataAnonymous = (arr) => {
        let data = {}, header = []
        const _header = removeDuplicate(arr, "typeReport")
        header = _header.map(a => a.typeReport)
        header?.forEach((value, index) => {
            const _list = arr.filter(a => a.typeReport === value)
            data[index] = _list || []
        });
        return { data, header }
    }
    const showDetailNotify = async (item) => {
        item.seen = 1
        await readNotifyUpdate(item.id)
        if (item.typeReport == 'InApp') {
            setInAppShow({ showInApp: true, messengerId: item.id })
        } else {
            navigation.navigate('NotifyDetail', item)
        }
        setMutate(e => !e)
    }
    const handlerMakeReadAll = async () => {
        alertConfirm('Thông báo', 'Bạn có muốn đọc tất cả các tin nhắn', async () => {
            await makeReadAllNotify()
            await LoadData()
        })
    }
    const showLinks = async (hyperLink, titlePage) => {
        let url_view = ''
        if (hyperLink.includes('http') || hyperLink.includes('https')) {
            const EmployeeInfo = await GetEmployeeInfo();
            const shareInfo = {
                employeeId: EmployeeInfo.employeeId,
                employeeName: removeVietnameseTones(EmployeeInfo.employeeName),
                accountId: EmployeeInfo.accountId,
                typeId: EmployeeInfo.typeId,
                loginName: EmployeeInfo.loginName,
                mobile: EmployeeInfo.mobile,
            }
            if (hyperLink.includes("spiral.com.vn") || hyperLink.includes("sucbat.com.vn")) {
                const app_access = StringTobase64(JSON.stringify(shareInfo));
                url_view = hyperLink.includes('?') ? hyperLink + "&appShare=" + app_access : hyperLink + "?appShare=" + app_access
            } else {
                url_view = hyperLink
            }
            setUrlSite({ titleName: titlePage, hyperLink: url_view })
            setVisibleWebView(true)
        } else {
            setUrlSite({ titleName: '', hyperLink: hyperLink })
            setVisibleWebView(false)
            navigation.navigate(hyperLink);
        }
    }
    const showInApp = async () => {

    }
    const onCloseCallBack = () => {
        DeviceEventEmitter.emit('RELOAD_NOTIFY_LIST')
        navigation.goBack()
    }
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.light, width: '100%', height: '100%' },
        viewItem: { width: '100%', flex: 1, backgroundColor: appcolor.greylight, borderRadius: 10, marginBottom: 7 },
        viewHiddenLink: { width: '30%', alignItems: 'flex-end' },
        titleHyperLinks: { fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline', color: appcolor.bluenavylight, padding: 7, paddingEnd: 3 }
    })
    const renderItem = ({ item, index }) => {
        const notifyDate = moment(item.createdDate).format('YYYYMMDD')
        const dateSend = notifyDate === TODAY ? moment(item.createdDate).format("HH:mm") : moment(item.createdDate).format("DD/MMM/YY")
        const readStatus = item.seen !== 1 ? 'bold' : 'normal'
        const ViewDetailNofity = () => {
            showDetailNotify(item)
        }
        const showDetailNow = () => {
            if (item.typeReport == 'InApp') {
                if (item.hyperLinks !== null) {
                    showLinks(item.hyperLinks, item.title)
                } else {
                    setInAppShow({ showInApp: true, messengerId: item.id })
                }
            } else {
                showLinks(item.hyperLinks, item.title)
            }
        }
        return (
            <View key={`na${index}}`} style={[styles.viewItem]}>
                <TouchableOpacity onPress={ViewDetailNofity}>
                    <View style={{
                        flexDirection: 'row',
                        borderRadius: 10, padding: 12, alignItems: 'center', backgroundColor: appcolor.light
                    }}>
                        <Avatar rounded size="small" containerStyle={{ backgroundColor: ColorRand(index), marginRight: 10 }} title={(index + 1).toString()} />
                        <View style={{ width: '90%' }}>
                            <Text style={{ width: '100%', color: appcolor.dark, fontWeight: readStatus, fontSize: 16 }} >{item.title}</Text>
                            <Text style={{ fontWeight: readStatus, color: appcolor.dark }} numberOfLines={2} ellipsizeMode='tail'>{item.body}</Text>
                            <Text style={{ textAlign: 'left', fontWeight: readStatus, fontStyle: 'italic', color: appcolor.dark, fontSize: 13, paddingTop: 3, paddingEnd: 8 }}>{dateSend}</Text>
                            {item.hyperLinks !== null && item.hyperLinks?.length > 0 &&
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <TouchableOpacity style={styles.viewHiddenLink} onPress={showDetailNow}>
                                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                                            <Text style={styles.titleHyperLinks}>Xem ngay</Text>
                                            <Icon name='arrow-alt-circle-right' solid size={18} color={appcolor.info} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer} >
            <HeaderCustom
                leftFunc={onCloseCallBack}
                title='Quản lý thông báo'
                iconRight='check-double'
                rightFunc={() => handlerMakeReadAll()}
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            {
                !loading && dataHeader?.length > 0 && <Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 15, color: appcolor.light, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.white }}
                            inactiveColor={appcolor.white}
                            activeColor={appcolor.white}
                            tabStyle={{ minWidth: minWidthTab(dataHeader), height: 42 }}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.primary }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface, flex: 1 }}>
                    {
                        dataHeader?.map((keyHeader, idx) => {
                            const dataKey = dataNotify[idx];
                            return (
                                <Tabs.Tab key={`mens${idx}`} label={keyHeader === null ? `Khác (${dataKey.length})` : `${keyHeader} (${dataKey.length})`}
                                    name={keyHeader === null ? 'Khác' : `${keyHeader} (${dataKey.length})`}>
                                    <View style={{ flex: 1, backgroundColor: appcolor.surface, marginTop: 40, padding: 6, width: deviceWidth }}>
                                        <FlashList
                                            key={keyHeader + "2"}
                                            data={dataKey}
                                            estimatedItemSize={300}
                                            showsVerticalScrollIndicator={false}
                                            keyExtractor={(item, i) => i.toString()}
                                            renderItem={renderItem} />
                                    </View>
                                </Tabs.Tab>
                            )
                        })
                    }
                </Tabs.Container>
            }

            <Modal
                style={{ backgroundColor: appcolor.light }}
                animationType="slide" visible={visibleWebView}>
                <WebViewUI pageName={urlSite.titleName}
                    urlPage={urlSite.hyperLink}
                    onClose={() => setVisibleWebView(false)} />
            </Modal>

            <Modal visible={inAppShow.showInApp}>
                <SafeAreaView style={{ width: '100%', height: '100%' }}>
                    <InAppMess props={{
                        isViewDetail: 1,
                        inAppId: inAppShow.messengerId,
                        close: () => setInAppShow({ showInApp: false, messengerId: 0 })
                    }} />
                </SafeAreaView>
            </Modal>
        </View>
    )
}
export default ManageNotify;