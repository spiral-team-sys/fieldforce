import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { Badge, Image } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../../Content/HeaderCustom";
import { LoadingView } from "../../../../Control/ItemLoading";
import { NumPad_V2 } from "../../../../Control/NumPad_V2";
import { updatePOP } from "../../../../Controller/POPController";
import GmailStyleSwipeableRow from "../../../../Core/GmailStyleSwipeableRow";
import { Message, ToastError, ToastSuccess } from "../../../../Core/Helper";
import { checkNetwork, deviceHeight, isValid } from "../../../../Core/Utility";
import { deviceWidth } from "../../../../Themes/AppsStyle";

export const OrderPOPDetail = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataOrderDetail, setOrderDetail] = useState({})
    const [data, setData] = useState([{ orderStatus: [] }, { orderDetail: [] }])
    const [loading, setLoading] = useState(false)
    const [reloadNum, setReloadNum] = useState(0)
    const [_, setMutate] = useState(false)
    const [isUpdate, setUpdate] = useState(false)
    const ref_tab = useRef()

    const LoadData = async () => {
        await setLoading(true)
        const dataOrder = await route.params.dataOrderDetail
        await setOrderDetail(dataOrder)
        await setData([
            { orderStatus: JSON.parse(dataOrder?.step || '[]') },
            { orderDetail: JSON.parse(dataOrder?.content || '[]') }
        ])
        await setLoading(false)
    }
    useEffect(() => {
        LoadData()
        return () => loading
    }, [])

    const uploadAction = async (type) => {
        const dataUpload = data[1]?.orderDetail
        if (dataOrderDetail.status === 'DELIVERY') {
            for (let index = 0; index < dataUpload.length; index++) {
                const item = dataUpload[index];
                if (!isValid(item.QuantityDamaged)) {
                    ToastError(`${item.POPName} - Số lượng hư hỏng không được để trống`, 'Thông báo', 'top')
                    return
                }
                if (!isValid(item.QuantityPickup)) {
                    ToastError(`${item.POPName} - Số lượng nhận được không được để trống`, 'Thông báo', 'top')
                    return
                }
                if (item.QuantityDamaged > item.QuantityPickup) {
                    ToastError(`${item.POPName} - Số lượng hư hỏng không được lớn hơn số lượng nhận được`, 'Thông báo', 'top')
                    return
                }

            }
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                return
            }

            const jsonUpload = { ...dataOrderDetail, content: JSON.stringify(dataUpload) }
            await updatePOP(type, JSON.stringify(jsonUpload), async (success) => {
                if (success.statusId) {
                    ToastSuccess(success.messager, 'Thông báo', 'top');
                    (type === 'CONFIRM' || type === 'REJECT') ? await confirmOrder() : await setUpdate(true)
                }
            }, async (error) => {
                ToastError(error.messager, 'Thông báo', 'top')
            })
        });
    }
    const confirmOrder = async () => {
        await navigation.goBack()
        await DeviceEventEmitter.emit('RELOAD_VIEW', null)
    }
    const renderOrderStatusItem = ({ item, index }) => {
        const iconName = item.Step == 1 ? 'shopping-cart' : (item.Step == 2 ? 'check' : (item.Step == 3 ? 'people-carry' : 'clipboard-check'))
        const colorName = item.Step == 1 ? appcolor.bluenavylight : (item.Step == 2 ? appcolor.rejection : (item.Step == 3 ? appcolor.redgray : appcolor.success))
        return (
            <View key={`id_pop_oo_${index}`} style={{ flex: 1 }}>
                {index > 0 &&
                    <View style={{ width: 80, marginLeft: 10, justifyContent: "center", alignItems: 'center' }}>
                        <View style={{ height: 50, width: 3, backgroundColor: appcolor.blacklight }} />
                    </View>
                }
                <View style={{ paddingLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ height: 80, width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 50, backgroundColor: appcolor.surface, borderWidth: 2, borderColor: appcolor.blacklight }}>
                        <View style={{ backgroundColor: colorName, height: 60, width: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 50 }}>
                            <Icon size={23} name={iconName} type='font-awessome-5' color={appcolor.white} />
                        </View>
                    </View>
                    <View style={{ width: deviceWidth / 1.38, paddingLeft: 8 }}>
                        <Text style={{ color: appcolor.blacklight, fontWeight: '700', fontSize: 16 }}>{item.TitleOrder}</Text>
                        {item.DetailOrder !== undefined && <Text style={{ color: appcolor.blacklight, fontWeight: '400', fontSize: 12 }}>{item.DetailOrder}</Text>}
                        {item.CreatedDate !== undefined && <Text style={{ color: appcolor.blacklight, fontWeight: '400', fontSize: 12 }}>{item.CreatedDate}</Text>}
                        {item.StatusNote !== undefined && <Text style={{ color: appcolor.blacklight, fontWeight: '400', fontSize: 12 }}>{item.StatusNote}</Text>}
                        {item.EmployeeNote !== undefined && <Text style={{ color: appcolor.blacklight, fontWeight: '400', fontSize: 12 }}>{item.EmployeeNote}</Text>}
                    </View>
                </View>
            </View>
        )
    }
    const handerNumberChange = (item, value, field) => {
        if (field === 'UserInput' && value > item.Quantity) {
            ToastError("Số lượng đặt hàng không được lớn hơn số lượng kho tổng!!", "Thông báo", "top");
            setReloadNum(reloadNum + 1)
            return;
        }
        if (field === 'QuantityDamaged' && value > item.QuantityPickup) {
            ToastError("Số lượng hư hỏng không được lớn hơn số lượng nhận được!!", "Thông báo", "top");
            setReloadNum(reloadNum + 1)
            return;
        }

        item[field] = value
        setMutate(e => !e)
    }
    const deleteItemOrder = (item) => {
        data[1].orderDetail = data[1].orderDetail.filter(it => (it.POPId !== item.POPId || it.popId !== item.popId));
        setMutate(e => !e)
    }
    const renderOrderDetailItem = ({ item, index }) => {
        return (
            <GmailStyleSwipeableRow
                enableRight={dataOrderDetail.status !== 'SEND'}
                deleteItem={() => deleteItemOrder(item)}>
                <View key={`item_order_${index}`} style={{ backgroundColor: appcolor.surface, padding: 5, borderRadius: 10, marginBottom: 5 }} >
                    <Text style={{ padding: 5, fontWeight: '700', color: appcolor.dark }}>{item.POPName || item.popName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: appcolor.light, width: 90, height: 90, borderRadius: 15, padding: 8, marginLeft: 10 }}>
                            {item.Image !== null && item.Image?.length > 0 && !item.Image?.includes('noimage') ?
                                <Image source={{ uri: item.Image }} style={{ width: '100%', height: '100%' }} /> :
                                <AnimatedLottieView autoPlay={false} source={require('../../../../Themes/lotties/no_image.json')} />
                            }
                            {(item.Quantity || item.Quantity === 0) &&
                                <Badge
                                    containerStyle={{ position: 'absolute', top: -5, end: -10 }}
                                    textStyle={{ color: appcolor.light, fontSize: 13, fontWeight: '600' }}
                                    badgeStyle={{ minWidth: 30, height: 25, backgroundColor: appcolor.dark, borderRadius: 50 }}
                                    value={item.Quantity}
                                />
                            }

                        </View>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'column', paddingLeft: 8, flex: 1, }}>
                            {
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                                    <Text style={{ flex: 3 / 5, color: appcolor.dark, fontWeight: '500', fontSize: 11 }}>Số lượng đề xuất : </Text>
                                    <View style={{ flex: 2 / 5 }}>
                                        <NumPad_V2
                                            inputStyle={{ backgroundColor: appcolor.light, width: 40, padding: 6 }}
                                            index={index} iconSize={10}
                                            value={item.UserInput}
                                            placeholderText={'SL'}
                                            item={item} showIcon={dataOrderDetail.status === 'SEND'}
                                            editable={dataOrderDetail.status === 'SEND'} reloadNum={reloadNum}
                                            handerNumberChange={(item, value) => handerNumberChange(item, value, 'UserInput')}
                                        />
                                    </View>
                                </View>
                            }
                            {
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                                    <Text style={{ flex: 3 / 5, color: appcolor.dark, fontWeight: '500', fontSize: 11, }}>Số lượng kho điều chỉnh : </Text>
                                    <View style={{ flex: 2 / 5 }}>
                                        <NumPad_V2
                                            inputStyle={{ backgroundColor: appcolor.light, width: 40, padding: 6 }}
                                            index={index} iconSize={10}
                                            value={item.QuantityEdit}
                                            placeholderText={'SL'}
                                            item={item} showIcon={false}
                                            editable={false} reloadNum={reloadNum}
                                            handerNumberChange={(item, value) => handerNumberChange(item, value, 'QuantityEdit')}
                                        />
                                    </View>
                                </View>
                            }
                            {
                                (dataOrderDetail.status === 'DELIVERY' || dataOrderDetail.status === 'PASS') &&
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                                    <Text style={{ flex: 3 / 5, color: appcolor.dark, fontWeight: '500', fontSize: 11 }}>Số lượng hư hỏng : </Text>
                                    <View style={{ flex: 2 / 5, }}>
                                        <NumPad_V2
                                            inputStyle={{ backgroundColor: appcolor.light, width: 40, padding: 6 }}
                                            index={index} iconSize={10}
                                            value={item.QuantityDamaged}
                                            placeholderText={'SL'}
                                            item={item} showIcon={dataOrderDetail.status === 'DELIVERY'}
                                            editable={dataOrderDetail.status === 'DELIVERY'} reloadNum={reloadNum}
                                            handerNumberChange={(item, value) => handerNumberChange(item, value, 'QuantityDamaged')}
                                        />
                                    </View>
                                </View>
                            }
                            {
                                (dataOrderDetail.status === 'DELIVERY' || dataOrderDetail.status === 'PASS') &&
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                                    <Text style={{ flex: 3 / 5, color: appcolor.dark, fontWeight: '500', fontSize: 11 }}>Số lượng nhận được : </Text>
                                    <View style={{ flex: 2 / 5, }}>
                                        <NumPad_V2
                                            containerStyle={{ width: '100%' }}
                                            inputStyle={{ backgroundColor: appcolor.light, width: 40, padding: 6 }}
                                            index={index}
                                            showIcon={dataOrderDetail.status === 'DELIVERY'}
                                            value={item.QuantityPickup}
                                            item={item} iconSize={10}
                                            placeholderText={'SL'}
                                            editable={dataOrderDetail.status === 'DELIVERY'} reloadNum={reloadNum}
                                            handerNumberChange={(item, value) => handerNumberChange(item, value, 'QuantityPickup')}
                                        />
                                    </View>
                                </View>
                            }
                        </View>
                    </View>
                </View>
            </GmailStyleSwipeableRow>
        )
    }
    const OrderTab = () => {
        return (
            data !== null && data.length > 0 && data.map((item, index) => {
                const totalRow = item.orderDetail?.length || 0
                const titleLabel = index == 0 ? 'Trạng thái' : 'Đơn hàng' + `${totalRow > 0 ? ` (${totalRow})` : ''}`
                return (
                    <Tabs.Tab
                        key={`tab_order_${index}`}
                        label={titleLabel}
                        name={titleLabel}
                    >
                        <View style={{ flex: 1, backgroundColor: appcolor.light, marginTop: 50, padding: 8, width: deviceWidth }}>
                            <FlatList
                                style={{ flex: 1, marginBottom: 8 }}
                                key={`orderPOPStatus ${index}`}
                                keyExtractor={(_, index) => index.toString()}
                                data={item.orderStatus || item.orderDetail}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={<View style={{ height: 200 }} />}
                                renderItem={index == 0 ? renderOrderStatusItem : renderOrderDetailItem}
                            />
                        </View>
                    </Tabs.Tab >
                )
            })
        )
    }
    const onGoBack = () => {
        isUpdate ? confirmOrder() : navigation.goBack()
    }
    return (
        <View style={{ width: '100%', height: deviceHeight, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={dataOrderDetail.orderNo}
                leftFunc={onGoBack}
                iconLeft='times'
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' styles={{ backgroundColor: appcolor.light }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? "padding" : null}
                enabled keyboardVerticalOffset={-10}
                style={{ flex: 1, backgroundColor: appcolor.transparent }}>
                <Tabs.Container
                    ref={ref_tab}
                    containerStyle={{ backgroundColor: appcolor.light, flex: 1 }}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, color: appcolor.dark, fontWeight: '700' }}
                            indicatorStyle={{ backgroundColor: appcolor.grey }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.primary}
                            tabStyle={{ minWidth: deviceWidth / 2, height: 42 }}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}>
                    {OrderTab()}
                </Tabs.Container>
            </KeyboardAvoidingView>
            {
                (dataOrderDetail.status === 'SEND' || dataOrderDetail.status === 'DELIVERY') &&
                <View style={{ position: 'absolute', width: deviceWidth, padding: 10, bottom: 20, backgroundColor: appcolor.transparent, justifyContent: 'space-between', flexDirection: "row", flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => uploadAction('UPDATEORDER')}
                        style={{ flex: 1, backgroundColor: appcolor.light, margin: 5, padding: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.info }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.info, textAlign: 'center' }}>Cập nhật đơn hàng</Text>
                    </TouchableOpacity>
                    {
                        dataOrderDetail.status === 'DELIVERY' ?
                            <TouchableOpacity
                                onPress={() => uploadAction('CONFIRM')}
                                style={{ flex: 1, backgroundColor: appcolor.light, margin: 5, padding: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.success }}>
                                <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.success, textAlign: 'center' }}>Đã nhận hàng</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                onPress={() => uploadAction('REJECT')}
                                style={{ flex: 1, backgroundColor: appcolor.light, margin: 5, padding: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.danger }}>
                                <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.danger, textAlign: 'center' }}>Huỷ đơn hàng</Text>
                            </TouchableOpacity>
                    }
                </View>
            }
        </View>
    )
}