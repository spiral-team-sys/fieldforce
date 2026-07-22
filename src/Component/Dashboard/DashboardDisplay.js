import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, Modal, SafeAreaView } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";
import { groupDataByKey } from "../../Core/Helper";
import { scaleSize } from "../../Themes/AppsStyle";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { deviceWidth } from "../../Core/Utility";
import { ImageDashboard } from "./ImageDashboard";

export const DashboardDisplay = ({ sendNavigate, info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [viewDetail, setViewDetail] = useState(false)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        const isShowSubCate = data[0]?.isShowSubCate || 0
        const isShowhaveTarget = data[0]?.isShowhaveTarget || 0
        const isShowHaveSellout = data[0]?.isShowHaveSellout || 0



        if (isShowSubCate == 1) {
            const { arr } = groupDataByKey({
                arr: data,
                key: 'RGroup'
            })
            viewAll.push(
                <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <Text style={{ width: '20%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>

                    </Text>
                    <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        {isShowhaveTarget == 1 ? 'Chỉ tiêu' : ''}
                    </Text>
                    <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Thực tế
                    </Text>
                    {isShowHaveSellout == 1 &&
                        <Text style={{ width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>Đã bán</Text>
                    }
                    {isShowhaveTarget == 1 &&
                        <Text style={{ width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>Tỷ lệ (%)</Text>
                    }
                </View>
            )
            viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
            arr.forEach((item, index) => {
                viewAll.push(
                    <View key={index} style={{}}>
                        {item.isParent && item.RGroup !== null && item.RGroup?.length > 0 &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 5, marginTop: 8, }}>


                                <View style={{ width: '20%' }}>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: appcolor.primary }}> {item.RGroup}</Text>
                                </View>
                                <View style={{ width: '30%', alignItems: 'center' }}>
                                    {
                                        isShowhaveTarget == 1 &&
                                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary, paddingTop: 5, paddingBottom: 5 }}>{item.totalTargetByCate}</Text>
                                    }
                                </View>
                                <View style={{ width: '30%', alignItems: 'center', }}>
                                    <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary, paddingTop: 5, paddingBottom: 5 }}>{item.totalActualByCate}</Text>
                                </View>
                                {
                                    isShowHaveSellout == 1 &&
                                    <View style={{ width: '20%' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.totalSellByCate}</Text>
                                    </View>
                                }
                                {
                                    isShowhaveTarget == 1 &&
                                    <View style={{ width: '20%' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.primary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.totalPercentByCate}</Text>
                                    </View>
                                }
                            </View>
                        }

                        <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontSize: 15, paddingLeft: 12, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.RTime}</Text>
                            </View>
                            <View style={{ width: '30%', alignItems: 'center' }}>
                                {
                                    isShowhaveTarget == 1 &&
                                    <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                                }
                            </View>
                            <View style={{ width: '30%', alignItems: 'center', }}>
                                <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.second, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                            </View>
                            {
                                isShowHaveSellout == 1 &&
                                <View style={{ width: '20%' }}>
                                    <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Sell}</Text>
                                </View>
                            }
                            {
                                isShowhaveTarget == 1 &&
                                <View style={{ width: '20%' }}>
                                    <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                                </View>
                            }
                        </View>
                    </View>
                )
            });
        } else {
            viewAll.push(
                <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <Text style={{ width: '20%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    </Text>
                    <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Chỉ tiêu
                    </Text>
                    <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Thực tế
                    </Text>
                    <Text style={{ width: '20%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                        Tỷ lệ (%)
                    </Text>
                </View>
            )
            viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
            data.forEach((item, index) => {
                viewAll.push(
                    <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: '20%' }}>
                            <Text style={{ fontSize: 15, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.RTime}</Text>
                        </View>
                        <View style={{ width: '30%', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Target}</Text>
                        </View>
                        <View style={{ width: '30%', alignItems: 'center', }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.second, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                        </View>
                        <View style={{ width: '20%' }}>
                            <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.secondary, textAlign: 'center', paddingTop: 5, paddingBottom: 5 }}>{item.Percent}</Text>
                        </View>
                    </View>
                )
                viewAll.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
            });
        }
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu báo cáo trưng bày</Text>)
    }

    const onShowDetails = () => {
        sendNavigate.navigate('displaydetails')
    }

    return (
        <View style={{ flex: 1 }}>
            {/* <TouchableOpacity onPress={() => setViewDetail(e => !e)}> */}
            <TouchableOpacity onPress={onShowDetails} >
                <View style={{ flex: 1, backgroundColor: appcolor.surface, padding: 8, borderRadius: 10, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon color={appcolor.info} name="chart-area" size={23} />
                        <Text style={{ marginEnd: 8, color: appcolor.dark, marginStart: 8, fontWeight: '600', fontSize: 15 }}> {info !== null ? info.chartName : ''}</Text>
                    </View>
                    <View style={{ marginTop: 12 }}>
                        {viewAll}
                    </View>
                </View >

                <Modal visible={viewDetail}>
                    <DetailData title={info.chartName} data={JSON.parse(info.detailData)} dataPhoto={JSON.parse(info.dataPhoto)} appcolor={appcolor} onClose={() => setViewDetail(false)} />
                </Modal>
            </TouchableOpacity >
        </View>
    )
}

export const DetailData = ({ title, data, dataPhoto, appcolor, onClose }) => {
    const [lstDetail, setDetail] = useState([])
    const [lstPhoto, setLstPhoto] = useState(dataPhoto || [])
    const LoadData = async () => {
        const { arr } = await groupDataByKey({
            arr: data,
            key: "CategoryName"
        })
        await setDetail(arr)

    }
    const LoadDataPhoto = async () => {
        const arrPhoto = []
        const { arr } = groupDataByKey({
            arr: dataPhoto,
            key: 'photoType'
        })
        arr.map(it => {
            if (it.isParent) {
                const lstItem = []
                arr.map(item => {
                    item.photoType === it.photoType && lstItem.push(item)
                })
                arrPhoto.push({
                    listPhoto: lstItem,
                    title: it.photoType
                })
            }
        })
        await setLstPhoto(arrPhoto)
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={index + "_01kj"}>
                {item.isParent &&
                    <View style={{ flex: 1, borderRadius: 5, backgroundColor: appcolor.secondary, padding: 5 }}>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: 'bold', fontStyle: 'italic', color: appcolor.black, textAlign: 'center' }}>{item.CategoryName}</Text>
                    </View>
                }
                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 0.5, padding: 8, borderBottomColor: appcolor.grey }}>
                    <Text style={{ width: '90%', fontSize: 14, color: appcolor.dark, fontWeight: '500' }}>{item.ProductName}</Text>
                    <Text style={{ width: '10%', textAlign: 'center', color: appcolor.dark, fontSize: 15, fontWeight: '700' }}>{item.Display}</Text>
                </View>
            </View>
        )
    }
    useEffect(() => {
        LoadData()
        LoadDataPhoto()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <SafeAreaView style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.primary, padding: 5, alignItems: 'center' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}>
                    <Icon name={'times'} size={scaleSize(23)} solid={true} color={appcolor.white} />
                </TouchableOpacity>
                <Text style={{ width: '80%', textAlign: 'center', fontSize: scaleSize(18), fontWeight: '700', padding: 5, color: appcolor.white }}>{title}</Text>
            </SafeAreaView>
            {
                (lstDetail.length > 0 || lstPhoto.length > 0) &&
                <Tabs.Container
                    renderTabBar={(props) => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{
                                minWidth: deviceWidth / (lstPhoto.length > 0 ? 2 : 1),
                                height: 42,
                            }}
                            labelStyle={{ fontSize: 14, fontWeight: "600" }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}
                >
                    {
                        lstDetail.length > 0 &&
                        <Tabs.Tab key={'Số liệu'} label={'Số liệu'} name={'Số liệu'} >
                            <View key={'Số liệu'} style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, }} >
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    style={{ flex: 1, margin: 8 }}
                                    keyExtractor={(_, index) => index.toString()}
                                    data={lstDetail}
                                    renderItem={renderItem}
                                />
                            </View>
                        </Tabs.Tab>
                    }
                    {
                        lstPhoto.length > 0 &&
                        <Tabs.Tab key={'Hình ảnh'} label={'Hình ảnh'} name={'Hình ảnh'} >
                            <View key={'Hình ảnh'} style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, }} >
                                <ImageDashboard lstPhoto={lstPhoto} appcolor={appcolor} dataPhoto={dataPhoto} />
                            </View>
                        </Tabs.Tab>
                    }
                </Tabs.Container>
            }
        </View>
    )
}
