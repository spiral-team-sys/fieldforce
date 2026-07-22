import React, { useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { LoadingView } from "../../../../Control/ItemLoading";
import { POPFollowOrder, updatePOP } from "../../../../Controller/POPController";
import { Message, ToastError, ToastSuccess } from "../../../../Core/Helper";
import { checkNetwork, deviceWidth, minWidthTab } from "../../../../Core/Utility";
import { deviceHeight } from "../../../../Themes/AppsStyle";

export const FollowOrderList = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataFollow, setDataFollow] = useState([])
    const [dataTag, setDataTag] = useState([])
    const [loading, setLoading] = useState(false)
    const ref_tab = useRef()
    const [reload, setReload] = useState(0)

    const LoadData = async () => {
        await setLoading(true)
        await POPFollowOrder(async (mData) => {
            await setDataFollow(mData.table)
            await setDataTag(mData.table1)
        })
        await setLoading(false)
    }
    const handlerBack = async () => {
        DeviceEventEmitter.emit('RELOAD_POPMENU')
        navigation.goBack()
    }
    useEffect(() => {
        LoadData()
        DeviceEventEmitter.addListener('RELOAD_VIEW', (res) => {
            reloadView()
        });
        return () => false
    }, [reload])

    const reloadView = () => {
        setReload(reload + 1)
    }

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemMain: { margin: 5, padding: 8, borderRadius: 10, backgroundColor: appcolor.light },
        titleOrder: { width: deviceWidth - 80, fontSize: 15, fontWeight: '700', color: appcolor.dark },
        titleBodyOrder: { width: deviceWidth - 40, fontSize: 13, fontWeight: '500', color: appcolor.greylight },
    })
    const handleShowDetailItem = async (item) => {
        const indexTab = await ref_tab.current.getCurrentIndex()
        const itemTab = dataTag[indexTab]
        await navigation.navigate('orderfollowdetail', { dataOrderDetail: item, itemTab: itemTab })
    }
    const handlerClearOrder = (item) => {
        Message('Chú ý', `Bạn có chắc chắn muốn huỷ ${item.orderNo} không?`, async () => {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                return
            }

            await updatePOP('REJECT', JSON.stringify(item), async (success) => {
                if (success.statusId) {
                    await ToastSuccess(success.messager, 'Thông báo', 'top');
                    await LoadData()
                }
            }, async (error) => {
                ToastError(error.messager)
            })
        });
    }
    const renderItem = ({ item, index }) => {
        const showDetailItem = () => {
            handleShowDetailItem(item)
        }
        return (
            <TouchableOpacity key={`flo_${index}`} style={styles.itemMain} onPress={showDetailItem} >
                <Text style={styles.titleOrder}>{item.orderNo}</Text>
                <Text style={styles.titleBodyOrder}>{`${item.orderStatus}`}</Text>
                {item.billCode !== null && <Text style={styles.titleBodyOrder}>{`${item.billCode}`}</Text>}
                <Text style={styles.titleBodyOrder}>{`${item.address}`}</Text>
                <Text style={styles.titleBodyOrder}>{`${item.createOrder}`}</Text>
                <Text style={styles.titleBodyOrder}>{`${item.createdDate}`}</Text>
                {
                    item.status === 'SEND' &&
                    <TouchableOpacity
                        onPress={() => handlerClearOrder(item)}
                        style={{
                            height: 38, width: 38,
                            position: 'absolute', top: 5, right: 5,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Icon
                            iconStyle={{ color: appcolor.red }}
                            size={23} name='trash' type='ionicon'
                        />
                    </TouchableOpacity>
                }
            </TouchableOpacity>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={{ height: deviceHeight / 10 }}>
                <HeaderCustom
                    title={route.params?.popMenu.wareHouseName || route.params?.popMenu.menuName}
                    leftFunc={handlerBack}
                />
            </View>
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' styles={{ backgroundColor: appcolor.surface }} />
            <Tabs.Container
                ref={ref_tab}
                containerStyle={{ backgroundColor: appcolor.surface, flex: 1 }}
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 13, color: appcolor.primary, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.primary}
                        tabStyle={{ minWidth: minWidthTab(dataTag), height: 42, elevation: 0, shadowOffset: { width: 0, height: 0 } }}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.surface }}
                    />
                )}>
                {dataTag?.map((item, idx) => {
                    const dataFollowItem = dataFollow.filter(i => i.status == item.code)
                    const totalItem = dataFollowItem.length || 0
                    return (
                        <Tabs.Tab
                            key={`tab_order_${idx}`}
                            label={`${item.statusName} (${totalItem})`}
                            name={`${item.statusName} (${totalItem})`}>
                            <View style={{ flex: 1, backgroundColor: appcolor.surface, marginTop: 40, padding: 6, width: deviceWidth }}>
                                <FlatList
                                    style={{ flex: 1, marginBottom: 8 }}
                                    key={`orderPOPList`}
                                    keyExtractor={(_, index) => index.toString()}
                                    data={dataFollowItem}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={renderItem}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={false}
                                            onRefresh={LoadData}
                                        />
                                    }
                                />
                            </View>
                        </Tabs.Tab>
                    )
                })}
            </Tabs.Container>
        </View>
    )
}