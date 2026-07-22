import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, Modal, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Divider } from "@rneui/base";
import { useSelector } from "react-redux";
import { groupDataByKey } from "../../Core/Helper";
import { deviceWidth, scaleSize } from "../../Themes/AppsStyle";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { ImageDashboard } from "./ImageDashboard";

export const DashboardPromotion = ({ info }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [viewDetail, setViewDetail] = useState(false)
    let viewAll = [];
    const data = info !== null ? JSON.parse(info.chartData) : [];
    if (Array.isArray(data) && data.length > 0) {
        viewAll.push(
            <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ width: '50%', alignItems: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>

                </Text>
                <Text style={{ width: '50%', textAlign: 'center', color: appcolor.dark, fontWeight: '500', paddingBottom: 8 }}>
                    Thực tế
                </Text>
            </View>
        )
        viewAll.push(<Divider key="313a" style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        data.forEach((item, index) => {
            viewAll.push(
                <View key={index.toString()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: '50%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: appcolor.dark, paddingTop: 5, paddingBottom: 5 }}>{item.RTime}</Text>
                    </View>
                    <View style={{ width: '50%', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: appcolor.tomato, paddingTop: 5, paddingBottom: 5 }}>{item.Actual}</Text>
                    </View>
                </View>
            )
            viewAll.push(<Divider key={"so" + index.toString()} style={{ backgroundColor: appcolor.grayLight, height: 1, width: '100%' }} />)
        });
    } else {
        viewAll.push(<Text key="s1oi" style={{ width: '100%', textAlign: 'center', fontSize: 15, color: appcolor.danger }}>Chưa có dữ liệu báo cáo trưng bày</Text>)
    }
    return (
        <TouchableOpacity onPress={() => setViewDetail(e => !e)}>
            <View style={{ backgroundColor: appcolor.surface, padding: 8, borderRadius: 10, marginBottom: 8 }}>
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
            key: 'guiid'
        })
        arr.map(it => {
            if (it.isParent) {
                const lstItem = []
                arr.map(item => {
                    item.guiid === it.guiid && lstItem.push(item)
                })
                arrPhoto.push({
                    listPhoto: lstItem,
                    title: it.photoNote,
                })
            }
        })
        await setLstPhoto(arrPhoto)
    }
    const renderItem = ({ item, index }) => {
        return (
            <View key={index}>
                {item.isParent &&
                    <View style={{ flex: 1, borderRadius: 5, backgroundColor: appcolor.secondary, padding: 5, marginBottom: 5 }}>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: 'bold', fontStyle: 'italic', color: appcolor.black, textAlign: 'center' }}>{item.CategoryName}</Text>
                    </View>
                }
                <Text style={{ width: '100%', fontSize: 14, color: appcolor.tomato, fontWeight: '500', textAlign: 'center' }}>Từ ngày {item.FromDate} - Đến ngày {item.ToDate}</Text>
                <View style={{ flex: 1, flexDirection: 'row', padding: 8, margin: 5, backgroundColor: appcolor.surface, borderRadius: 5 }}>
                    <Text style={{ width: '100%', fontSize: 15, color: appcolor.dark, fontWeight: '700' }}>{index + 1}. Nội dung CTKM: {item.Content}</Text>
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
                        <Tabs.Tab key={'số liệu'} label={'số liệu'} name={'số liệu'} >
                            <View key={'số liệu'} style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, }} >
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    style={{ flex: 1, margin: 5, backgroundColor: appcolor.light }}
                                    keyExtractor={(_, index) => index.toString()}
                                    data={lstDetail}
                                    renderItem={renderItem}
                                />
                            </View>
                        </Tabs.Tab>
                    }
                    {
                        lstPhoto.length > 0 &&
                        <Tabs.Tab key={'Hình Ảnh'} label={'Hình Ảnh'} name={'Hình Ảnh'} >
                            <View key={'Hình Ảnh'} style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, }} >
                                <ImageDashboard lstPhoto={lstPhoto} appcolor={appcolor} dataPhoto={dataPhoto} />
                            </View>
                        </Tabs.Tab>
                    }
                </Tabs.Container>
            }
        </View>
    )
}