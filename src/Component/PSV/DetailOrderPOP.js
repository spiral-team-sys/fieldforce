
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import { updateOrderPOP, uploadConfirmPOP } from '../../Controller/POPController';
import { getPhotosPOP } from '../../Controller/WorkController';
import { DEFAULT_COLOR } from '../../Core/URLs';
import { MessageAction, MessageInfo } from '../../Core/Helper';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { DetailOrderItem } from '../../Content/DetailOrderItem';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { deviceWidth } from '../../Core/Utility';

export const DetailOrderPOP = ({ navigation, route }) => {
    const [steps, setSteps] = useState([])
    const [details, setDetails] = useState([])
    const { appcolor } = useSelector(state => state.GAppState)
    const loadData = async () => {
        try {
            let lstStatus = await JSON.parse(route.params.step)
            setSteps(lstStatus);
            let lstDetail = await JSON.parse(route.params.content)
            setDetails(lstDetail);
        } catch (error) {
            //console.log(error)
        }
    }
    useEffect(() => {
        loadData();
    }, [])
    const showIconName = (step) => {
        let icon = ''
        switch (step) {
            case 1:
                icon = 'cart'
                break;
            case 2:
                icon = 'home'
                break;
            case 3:
                icon = 'car'
                break;
            case 4:
                icon = 'checkbox'
                break;
            default:
                icon = 'cart-outline'
                break;
        }

        return icon;
    }
    const backgroundColorTop = (step) => {
        return (step === 1) ? 'tranparent' : DEFAULT_COLOR
    }
    const backgroundColorBottom = (step) => {
        return (step === (steps.length)) ? 'tranparent' : DEFAULT_COLOR
    }
    const renderItemData = ({ item }) => (
        <View style={{ height: 200, width: '100%', flexDirection: 'row' }} onPress={() => this.onItemPress(item)} >
            <View style={{ flexDirection: 'column' }}>
                <View style={{ width: 1, left: 55, backgroundColor: backgroundColorTop(item.Step), height: '38%' }}></View>
                <SpiralIcon
                    name={showIconName(item.Step)}
                    color={'white'} type='ionicon' size={30}
                    containerStyle={{ left: 30, backgroundColor: DEFAULT_COLOR, borderRadius: 25, width: 50, height: 50 }}
                    iconStyle={{ top: 7 }}>
                </SpiralIcon>
                <View style={{ width: 1, left: 55, backgroundColor: backgroundColorBottom(item.Step), height: '38%' }}></View>
            </View>
            <View style={{ padding: 8, flexDirection: 'column' }}>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', left: 50, fontSize: 15, color: DEFAULT_COLOR, fontWeight: '700', padding: 5, textDecorationLine: 'underline' }}>
                    {item.TitleOrder}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', left: 50, fontSize: 13, color: 'green', fontWeight: '700', padding: 5 }}>
                    {item.DetailOrder}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', left: 50, fontSize: 13, color: 'black', padding: 5 }}>
                    {item.CreatedDate}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', left: 50, fontSize: 13, color: 'black', padding: 5 }}>
                    {'Kho ghi chú: ' + (item.StatusNote === undefined ? '' : item.StatusNote)}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', left: 50, fontSize: 13, color: 'black', padding: 5 }}>
                    {'Nhân viên ghi chú: ' + (item.EmployeeNote === undefined ? '' : item.EmployeeNote)}
                </Text>
            </View>
        </View>
    )
    const ViewStatusBill = () => {
        return (
            <View>
                <FlatList

                    key={(item) => item.id}
                    keyExtractor={(item, index) => item + index}
                    data={steps}
                    renderItem={renderItemData}
                    numColumns={1}
                />
            </View>
        )
    }
    const ViewDetailBill = () => {
        return (
            <View>
                <FlatList
                    key={(item) => item.id}
                    keyExtractor={(item, index) => item + index}
                    data={details}
                    renderItem={({ item }) => details.length > 0 && <DetailOrderItem item={item} details={details} setDetails={setDetails} route={route} />}
                    numColumns={1}
                />
            </View>
        )
    }
    const UpdateOrder = async () => {
        let OrderNo = route.params.orderNo.replace('Mã đơn hàng: ', '')

        if (details.length === 0) {
            MessageInfo('Không có danh sách POP để xác nhận.');
            return
        }

        updateOrderPOP(OrderNo, details, () => {
            route.params.callBack()
            navigation.goBack()
        })
    }
    const CancelOrder = async () => {
        let OrderNo = route.params.orderNo.replace('Mã đơn hàng: ', '')

        MessageAction('Bạn muốn huỷ đơn hàng này?', () => {
            updateOrderPOP(OrderNo, [], () => {
                route.params.callBack()
                navigation.goBack()
            })
        })
    }
    const ConfirmOrder = async () => {
        let OrderNo = route.params.orderNo.replace('Mã đơn hàng: ', '')
        let workDate = parseInt(moment(new Date()).format('YYYYMMDD'))
        let resPhotos = await getPhotosPOP(workDate, OrderNo)

        if (details.length === 0) {
            MessageInfo('Không có danh sách POP để xác nhận.');
            return
        }

        let lstNonePickup = details.filter(it => it.QuantityPickup === undefined || it.QuantityPickup === null)

        if (lstNonePickup.length > 0) {
            MessageInfo('Nhập số lượng nhận.');
            return
        }

        let lstNoneDamaged = details.filter(it => it.QuantityDamaged === undefined || it.QuantityDamaged === null)

        if (lstNoneDamaged.length > 0) {
            MessageInfo('Nhập số lượng hư hỏng.');
            return
        }
        else {
            if (resPhotos.length === 0) {
                MessageInfo('Bạn đã nhập số lượng hư hỏng vui lòng chụp hình.');
                return
            }
        }

        uploadConfirmPOP(OrderNo, details, resPhotos, () => {
            route.params.callBack()
            navigation.goBack()
        })
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom title="Chi tiết đơn hàng"
                leftFunc={() => navigation.goBack()}
            />
            {/* <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}
            >
                <ViewStatusBill tabLabel={'Trạng thái đơn hàng'} />
                <ViewDetailBill tabLabel={'Chi tiết đơn hàng'} />
            </ScrollableTabView> */}
            < Tabs.Container
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.light }}
                        tabStyle={{ minWidth: deviceWidth / 2, height: 36 }}
                    />
                )}>
                <Tabs.Tab key={'Trạng thái đơn hàng'} label={'Trạng thái đơn hàng'} name={'Trạng thái đơn hàng'} >
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <ViewStatusBill tabLabel={'Trạng thái đơn hàng'} />
                    </View>
                </Tabs.Tab>
                <Tabs.Tab key={'Chi tiết đơn hàng'} label={'Chi tiết đơn hàng'} name={'Chi tiết đơn hàng'} >
                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                        <ViewDetailBill tabLabel={'Chi tiết đơn hàng'} />
                    </View>
                </Tabs.Tab>
            </Tabs.Container>
            {
                (route.params.orderStatus.includes('đang vận chuyển')) &&
                <View style={{ height: 90, alignContent: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
                    <Button
                        title={' Hư hỏng'}
                        titleStyle={{ fontSize: 15, fontWeight: '600' }}
                        buttonStyle={{ backgroundColor: DEFAULT_COLOR, alignContent: 'center' }}
                        containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center' }}
                        icon={
                            <SpiralIcon type='ionicon' name='camera' size={35} color={'#fff'}></SpiralIcon>
                        }
                        onPress={() => {
                            navigation.navigate('damageNote', route.params);
                        }}
                    >
                    </Button>
                    <Button
                        title={' Xác nhận'}
                        titleStyle={{ fontSize: 15, fontWeight: '600' }}
                        buttonStyle={{ backgroundColor: DEFAULT_COLOR, alignContent: 'center' }}
                        containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center' }}
                        icon={
                            <SpiralIcon type='ionicon' name='save' size={35} color={'#fff'}></SpiralIcon>
                        }
                        onPress={() => ConfirmOrder()}
                    >
                    </Button>
                </View>
            }
            {
                (route.params.orderStatus.includes('chờ xác nhận')) &&
                <View style={{ height: 90, alignContent: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 5, bottom: 10 }}>
                    <Button
                        title={' Cập nhật đơn hàng'}
                        titleStyle={{ fontSize: 15, fontWeight: '600' }}
                        buttonStyle={{ backgroundColor: 'green', alignContent: 'center', top: 7 }}
                        containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center', backgroundColor: 'green' }}
                        onPress={() => UpdateOrder()}
                    >

                    </Button>
                    <Button
                        title={' Huỷ đơn hàng'}
                        titleStyle={{ fontSize: 15, fontWeight: '600' }}
                        buttonStyle={{ backgroundColor: 'red', alignContent: 'center', top: 7 }}
                        containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center', backgroundColor: 'red' }}
                        onPress={() => CancelOrder()}
                    >
                    </Button>
                </View>
            }
        </View>
    )
}