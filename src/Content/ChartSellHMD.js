import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Platform, Text, View, RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { AppNameBuild, DEFAULT_COLOR, nokiaApp } from "../Core/URLs";


export const ChartSellHMD = ({ pageIndex, chartList, showDetailHome, LoadData, loading, pageSelected, appcolor }) => {
    const [dataGroup, setDataGroup] = useState([])
    const [dataChart, setDataChart] = useState([])
    const [dataChartF, setDataChartF] = useState([])
    const [itemF, setItemF] = useState(0)

    const loadData = async () => {
        if (chartList[pageIndex] !== undefined) {
            setDataGroup([])
            setDataChartF([])
            let lstTem = [];
            let itemC = chartList[pageIndex];
            const lstKey = Object.keys(itemC);
            lstKey.map((item, index) => {
                (item !== 'pageName' && item !== 'Type' && item !== 'Detail' && item !== 'id') && lstTem.push({ title: item, id: index, value: itemC[item] === '' ? '0' : itemC[item] })
            })
            setItemF(lstTem.length)
            setDataGroup(lstTem)
            let lstItemTem = [];
            let items = itemC.Detail;
            if (items !== "" && items !== undefined) {
                try {
                    let itemsDetail = JSON.parse(items)
                    setDataChartF(itemsDetail)
                    itemsDetail.map((item, index) => {
                        index < 4 && lstItemTem.push(item)
                    })
                    setDataChart(lstItemTem)
                } catch (error) { }
            }
        }
    }
    useEffect(() => {
        setDataChart([]);
        setDataChartF([]);
        loadData();
        return () => false
    }, [])
    const renderItem = ({ item, index }) => {
        const lstKey = Object.keys(item);
        let lengthKey = (item.HighLight !== null && item.HighLight !== undefined) ? (lstKey.length - 1) : lstKey.length
        return (
            <View key={index + "-02iii"}>
                <View style={{ width: '100%' }}>
                    <View style={{
                        flexDirection: 'row', marginBottom: 5, marginLeft: 25, padding: 3,
                        alignItems: 'center', backgroundColor: index === 0 && appcolor.primary
                    }}>
                        {
                            index === 0 &&
                            lstKey.map((itemK, indexk) =>
                                itemK !== 'HighLight' &&
                                <Text key={index + "das" + indexk}
                                    lineBreakMode={'clip'} numberOfLines={3}
                                    style={{
                                        fontSize: 10, fontWeight: '500', color: DEFAULT_COLOR, borderColor: '#fff', paddingTop: 2, paddingBottom: 2,
                                        width: indexk === 0 ? (Dimensions.get('window').width / 2.7) : Dimensions.get('window').width / (2.3 * (lengthKey - 1)),
                                        color: index === 0 && appcolor.dark,
                                        textAlign: 'center'
                                    }}>{itemK}</Text>

                            )
                        }
                    </View>
                </View>
                <View style={{ height: 35, width: '100%' }}>
                    <View style={{ flexDirection: 'row', marginLeft: 25, alignItems: 'center', backgroundColor: (item.HighLight !== undefined && item.HighLight !== null && item.HighLight !== '') ? item.HighLight : null }}>
                        {
                            lstKey.map((itemK, indexk) =>
                                itemK !== 'HighLight' &&
                                <Text key={"d820j" + indexk}
                                    lineBreakMode={'clip'} numberOfLines={3}
                                    style={{
                                        fontSize: 11, fontWeight: '600',
                                        width: indexk === 0 ? (Dimensions.get('window').width / 2.7) : Dimensions.get('window').width / (2.3 * (lengthKey - 1)),
                                        textAlign: indexk === 0 ? 'left' : 'center',
                                        color: appcolor.dark
                                    }}>{item[itemK]}</Text>
                            )
                        }
                    </View>
                    <View style={{ height: 0.4, backgroundColor: 'lightgray', marginTop: 7, marginBottom: 7, marginLeft: 30 }}></View>
                </View>
            </View>
        )
    }
    const setColor = (id) => {
        let color = 'black'
        switch (id) {
            case 1:
                color = 'red'
                break;
            case 2:
                color = 'green'
                break;
            case 3:
                color = '#e09e07'
                break;
            default:
                color = 'blue'
                break;
        }

        return color
    }
    const renderItemGroup = ({ item, index }) => {
        return (
            <View key={"hhkak-" + index} style={{ height: 60, width: dataGroup.length > 1 ? Dimensions.get('window').width / dataGroup.length - 15 : Dimensions.get('window').width - 55, padding: 5 }}>
                <Text style={{ color: setColor(item.id), textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>{item.value}</Text>
                <Text style={{ color: setColor(item.id), textAlign: 'center', fontSize: 12, fontStyle: 'italic' }}>{item.title}</Text>
            </View>
        )
    }
    const showDetail = () => {
        showDetailHome(dataChartF)
    }
    return (
        <View>
            <ScrollView
                style={{ width: '100%', height: '100%' }}
                nestedScrollEnabled={true}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        color={'blue'}
                        titleColor={'red'}
                        tintColor={'red'}
                        title={'Đang tải dữ liệu...'}
                        onRefresh={() => LoadData()} />
                }
                showsVerticalScrollIndicator={false}>
                <View style={{ width: '100%', height: 60 }}>
                    {
                        dataGroup?.length > 0 &&
                        <FlatList
                            style={{ paddingLeft: 20 }}
                            keyExtractor={item => item.id}
                            data={dataGroup}
                            renderItem={renderItemGroup}
                            numColumns={dataGroup.length}
                        />
                    }
                </View>
                <View style={{ width: '100%', height: '100%', paddingTop: 8, paddingRight: 10 }}>
                    <TouchableOpacity onPress={showDetail}>
                        <FlatList
                            keyExtractor={item => item.id}
                            data={dataChart}
                            renderItem={renderItem}
                            numColumns={1}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {
                (AppNameBuild === nokiaApp && pageIndex === pageSelected) &&
                <View style={{ width: '100%', bottom: Platform.OS === 'android' ? 40 : 10, right: 5, alignItems: 'flex-end', position: 'absolute' }}>
                    <TouchableOpacity onPress={showDetail}>
                        <Text style={{
                            paddingLeft: 35, fontStyle: 'italic', fontWeight: '700', color: appcolor.blue, fontSize: 11,
                            textDecorationLine: 'underline'
                        }}>Chi tiết</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
} 