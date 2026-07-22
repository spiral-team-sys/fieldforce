
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PageHeader from '../../Content/PageHeader';
import { fetchGet } from '../../Core/Helper';
import { DEFAULT_COLOR, URL_ORDERSPOP } from '../../Core/URLs';
import { Capitalize, deviceWidth, minWidthTab } from '../../Core/Utility';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'

export const FollowPOP = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const [arrDataShowF, setArrDataShowF] = useState([])
    const [indexTab, setIndexTab] = useState(0)
    const { appcolor } = useSelector(state => state.GAppState)
    const loadData = async () => {
        setLoading(true)
        let lstOrder = await fetchGet(URL_ORDERSPOP)
        setArrDataShowF(lstOrder)
        let lstTem = [];
        let lstName = [];
        lstOrder.map((it, index) => {
            let itemStr = it.orderStatus.replace('Trạng thái: ', '').replace('Đơn hàng ', '')

            if (!lstName.includes(itemStr)) {
                lstName.push(itemStr)
                lstTem.push({ id: index, name: itemStr });
            }
        })
        let lstSort = lstTem.sort((a, b) => a.name.localeCompare(b.name));
        Platform.OS === 'android' && lstSort.reverse();
        await setArrTagShow(lstSort);
        await setArrDataShow(lstOrder.filter(it => it.orderStatus.includes(lstSort[indexTab].name)))
        setLoading(false)
    }
    useEffect(() => {
        loadData();
        return () => false;
    }, [])

    const showDetailOrderPOP = (item) => {
        navigation.navigate('detailOrderPOP', { ...item, callBack: loadData })
    }
    const borderColor = (item) => {
        let color = ''
        switch (item.status) {
            case 'PASS':
                color = item.orderStatus.includes('đang vận chuyển') ? appcolor.orange : appcolor.success;
                break;
            case 'REJECT':
                color = appcolor.danger;
                break;
            default:
                color = appcolor.orange;
                break;
        }
        return color
    }
    const renderItemData = ({ item, index }) => (
        <View key={"3ss" + index} style={{ height: 'auto', padding: 10, width: '100%' }} onPress={() => showDetailOrderPOP(item)} >
            <TouchableOpacity style={{ borderRadius: 10, padding: 8, borderColor: borderColor(item), borderWidth: 1, opacity: 0.9, flexDirection: 'column' }} onPress={() => showDetailOrderPOP(item)}>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', fontSize: 17, color: 'black', fontWeight: '700', padding: 8 }}>
                    {item.orderNo}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', fontSize: 15, color: 'black', padding: 8 }}>
                    {item.createdDate}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', fontSize: 15, color: 'black', padding: 8 }}>
                    {item.orderStatus}
                </Text>
                <Text
                    editable={false}
                    style={{ textAlign: 'left', fontSize: 15, color: 'black', padding: 8 }}>
                    {'Địa chỉ giao hàng: ' + item.address}
                </Text>
            </TouchableOpacity>
        </View>
    )
    const ViewItem = () => {
        return (
            <View>
                <FlatList
                    style={{ height: '70%' }}
                    key={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            colors={['blue', 'orange']}
                            titleColor={DEFAULT_COLOR}
                            tintColor={DEFAULT_COLOR}
                            title={'Đang tải dữ liệu...'}
                            onRefresh={() => {
                                loadData()
                            }} />
                    }
                    keyExtractor={(item, index) => item + index}
                    data={arrDataShow}
                    renderItem={renderItemData}
                    numColumns={1}
                />
            </View>
        )
    }
    const handleChangeTab = (i, from) => {
        setIndexTab(i)
        setArrDataShow(arrDataShowF.filter(it => it.orderStatus.includes(arrTagShow[i].name)))
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom title={route.params.menuName}
                leftFunc={() => navigation.goBack()} />
            {
                arrTagShow?.length > 0 &&
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
                            tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 36 }}
                        />
                    )}>
                    {
                        arrTagShow.map(it =>
                            <Tabs.Tab key={Capitalize(it.name)} label={Capitalize(it.name)} name={Capitalize(it.name)} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                    <ViewItem tabLabel={Capitalize(it.name)} ></ViewItem>
                                </View>
                            </Tabs.Tab>
                        )
                    }
                </Tabs.Container>
                // <ScrollableTabView
                //     style={{ top: 15 }}
                //     initialPage={0}
                //     onChangeTab={({ i, from }) => i != from && handleChangeTab(i, from)}
                //     renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}>
                //     {
                //         arrTagShow?.map(it =>
                //             <ViewItem tabLabel={Capitalize(it.name)} ></ViewItem>
                //         )
                //     }
                // </ScrollableTabView> :
                // <ViewItem tabLabel={''} ></ViewItem>
            }
        </View>
    )
}