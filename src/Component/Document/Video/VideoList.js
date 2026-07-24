import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, View, ScrollView, StatusBar, Image, RefreshControl } from "react-native"
import { Text } from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Chip } from '../../../Control/Chip'
// import Orientation from 'react-native-orientation-locker';
import filter from 'lodash';
import { GetDocument } from '../../../Controller/DocumentController';
import FormGroup from '../../../Content/FormGroup';
import { deviceWidth } from '../../Home';
import { scaleSize } from '../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { colorList, UUIDGenerator } from '../../../Core/Helper';
import { URLDEFAULT } from '../../../Core/URLs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const VideoList = ({ navigation, route }) => {
    const insets = useSafeAreaInsets()
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [docGroup, set_] = useState(route.params.item);
    const [data, setData] = useState([]);
    const [_filter, setFilter] = useState([]);
    const [query, setQuery] = useState('');
    const [groupBy, setGroupBy] = useState("GroupName");
    const [groupData, setDataGroup] = useState([]);
    const [loading, setLoading] = useState(false);
    const [horizontal, setHorizontal] = useState(false);

    StatusBar.setHidden(true)
    const rightOption = () => {
        SheetManager.show('ToolSheet')
    }
    const LoadData = async () => {
        await setLoading(true);
        let _data = []
        if (route.params?.formType == 'DOCUMENT') {
            _data = route.params.documentData
        } else {
            const dataByType = await GetDocument('VIDEO');
            _data = JSON.parse(dataByType[0]?.dataStore || '[]')
        }
        await setFilter(_data);
        await dataGrouping(_data, groupBy);
        await setTimeout(() => {
            setLoading(false);
        }, 1000)
    }
    const dataGrouping = (_data, keyName) => {
        const unique = [...new Set(_data.sort((a, b) => a.sortDate < b.sortDate).map(item => item[keyName]))];
        setDataGroup(unique);
        setData(_data);
    }
    useEffect(() => {
        // Orientation.lockToPortrait();

        // const updateOrientation = (orientation) => {
        //     setOrientation(orientation);
        //   };

        //   Orientation.addOrientationListener(updateOrientation);

        //   return () => {
        //     Orientation.removeOrientationListener(updateOrientation);
        //   };



        LoadData()
        return () => {
            loading;
            // Orientation.unlockAllOrientations();
        }
    }, [])
    const itemList = (item, index, _filter) => {
        const pathJson = JSON.parse(item.FilePath);
        const videoUrl = ((item.HostName || URLDEFAULT) + pathJson[0].Url)
        const thumbnail = ((item.HostName || URLDEFAULT) + pathJson[0].Thumbnail)
        return (
            <View key={index + "ssq"} style={{
                backgroundColor: appcolor.greydark, marginBottom: 7, borderRadius: 12,
                borderColor: appcolor.transparent, height: 220, justifyContent: 'flex-start'
            }}>
                <TouchableOpacity onPress={() => handleSelectVideo(item, videoUrl)}>
                    {pathJson[0].Thumbnail !== undefined ?
                        <Image style={{ width: '100%', height: '100%' }}
                            resizeMode='cover'
                            source={{ uri: thumbnail }} /> :
                        <SpiralIcon name="play-circle" size={60}
                            color={appcolor.primary}
                            opacity={0.5}
                            containerStyle={{ height: '80%', justifyContent: 'center', }}
                            type="font-awesome-5" />
                    }
                    <View style={{ position: 'absolute', width: '100%', bottom: 0, backgroundColor: appcolor.darkgray, }}>
                        <Text numberOfLines={3} style={{
                            fontWeight: 'bold', color: appcolor.white, padding: 3,
                            fontSize: scaleSize(13),
                        }}>{item.DocumentName}</Text>
                        <Text numberOfLines={2} style={{
                            color: appcolor.white, padding: 3,
                            fontSize: scaleSize(12),
                        }}>{item.Description}</Text>
                        <Text style={{
                            fontSize: scaleSize(12), fontStyle: 'italic', color: appcolor.danger, textAlign: 'right', padding: 7,
                        }}>Đã đăng {item.Updated || ''}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const onSearch = text => {
        const formattedQuery = text?.toLowerCase() || "";
        const filteredData = filter(_filter, video => {
            return contains(video, formattedQuery);
        });
        setQuery(text);
        if (formattedQuery === "") {
            setData(_filter);
        } else {
            setData(filteredData);
        }
    }
    const contains = (item, query) => {
        try {
            const { documentName, description } = item;
            const VName = !documentName ? '' : documentName.toLowerCase();
            const VDesc = !description ? '' : description.toLowerCase();
            if (VName.includes(query) || VDesc.includes(query)) {
                return true;
            }
            return false;
        } catch (e) { }
    };
    const handleSelectVideo = async (item, videoUrl) => {
        await navigation.navigate("videoplay", { 'urlVideo': videoUrl, "item": item, "guid": UUIDGenerator() })
    }
    const itemGrid = (item, index, _filter) => {
        const pathJson = JSON.parse(item.FilePath);
        const videoUrl = ((item.HostName || URLDEFAULT) + pathJson[0].Url)
        const thumbnail = ((item.HostName || URLDEFAULT) + pathJson[0].Thumbnail)
        return (
            <View key={index + "sq"} style={{
                marginRight: 7, marginBottom: 7, backgroundColor: appcolor.greydark,
                borderColor: appcolor.transparent, borderWidth: 1, borderRadius: 12,
                height: deviceWidth / 3, width: deviceWidth / 3
            }}>
                <TouchableOpacity onPress={() => handleSelectVideo(item, videoUrl)}
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                >
                    {
                        pathJson[0].Thumbnail !== undefined ?
                            <Image style={{ borderRadius: 12, width: '100%', height: '100%' }} source={{ uri: thumbnail }} /> :
                            <SpiralIcon name="play-circle" size={45} color={appcolor.primary} opacity={0.5} type="font-awesome-5" />
                    }
                    <Text numberOfLines={2} style={{
                        width: '100%',
                        position: 'absolute', bottom: 0, backgroundColor: appcolor.lightgray,
                        marginTop: 7, fontSize: scaleSize(12),
                        textAlign: 'center', color: appcolor.dark,
                    }}>{item.DocumentName}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    const rowTemplate = (keyName, index) => {
        const _filter = data.filter(value => {
            return value[groupBy] === keyName
        })
        _filter.sort((a, b) => a.SortDate < b.SortDate);
        return (
            <View key={index + "_019"} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: scaleSize(20), fontWeight: '700', color: appcolor.dark, marginLeft: 17, padding: 7 }}>{keyName}</Text>
                    {
                        !horizontal && _filter.length > 3 ?
                            <TouchableOpacity onPress={() => navigation.navigate("videobytype", { "_filter": _filter, "title": keyName })}
                                style={{ position: 'absolute', right: 0, }}>
                                <Text style={{
                                    ontSize: scaleSize(12), fontWeight: '700',
                                    color: appcolor.info, marginLeft: 17, padding: 7
                                }}>Xem thêm</Text>
                            </TouchableOpacity> : null
                    }
                </View>
                <ScrollView horizontal={horizontal} showsHorizontalScrollIndicator={false}>
                    {
                        _filter.map((item, index) => {
                            if (index > 3)
                                return
                            if (index === 3 && horizontal)
                                return (
                                    <View key={index + "sq"} style={{
                                        padding: 8, marginRight: 7, alignItems: 'center',
                                        borderColor: appcolor.transparent, borderWidth: 1,
                                        borderRadius: 12, height: deviceWidth / 3, width: deviceWidth / 3
                                    }}>
                                        <TouchableOpacity style={{ height: '100%', justifyContent: 'space-around', }}
                                            onPress={() => navigation.navigate("videobytype", { "_filter": _filter, "title": keyName })}>
                                            <SpiralIcon name="arrow-right"
                                                size={53} color={appcolor.dark} type="font-awesome-5" />
                                            <Text style={{ fontSize: scaleSize(13), color: appcolor.dark }}>Xem thêm</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            else {
                                return horizontal ? itemGrid(item, index, _filter) : itemList(item, index, _filter)
                            }
                        })
                    }
                </ScrollView>
            </View>)
    }
    const ChangeGroup = (keyName) => {
        setGroupBy(keyName);
        dataGrouping(data, keyName);
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorList[6][1] }}>
            <HeaderCustom title="Video của bạn" rightFunc={() => rightOption()}
                iconRight="ellipsis-v" leftFunc={() => navigation.goBack()} />
            <View style={{
                height: '100%', width: '100%',
                shadowOpacity: 0.7, shadowColor: appcolor.light, shadowRadius: 10,
                paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 20,
                backgroundColor: appcolor.light, marginTop: 15, marginBottom: 0,
                borderWidth: 0, marginLeft: 0, marginRight: 0, marginTop: 0, overflow: 'hidden',
            }}>
                <FormGroup handleChangeForm={e => onSearch(e)} iconRight='search' editable placeholder='Tìm kiếm video' />
                <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            title="Đang cập nhật..."
                            refreshing={loading}
                            onRefresh={() => LoadData()}
                            titleColor={appcolor.danger}
                            tintColor={appcolor.danger}
                        />
                    }
                >
                    <View >
                        {
                            groupData.map((group, index) => {
                                return rowTemplate(group, index)
                            })
                        }
                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>

            <ActionSheet
                id={'ToolSheet'}
                headerAlwaysVisible
                containerStyle={{ backgroundColor: appcolor.light, paddingBottom: insets.bottom }}
            >
                <View style={{ width: '100%', backgroundColor: appcolor.light, }}>
                    <View style={{ margin: 7 }}>
                        <Text style={{ color: appcolor.dark, padding: 7, textDecorationLine: 'underline' }}>Xem theo</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Chip iconColor={appcolor.dark}
                                ContainderStyle={{
                                    marginRight: 12, borderRadius: 30,
                                    paddingLeft: 7, paddingRight: 7, flexDirection: 'row', backgroundColor: horizontal ? appcolor.info : appcolor.lightgray
                                }}
                                onChipPress={() => setHorizontal(true)}
                                title="Ngang" iconName="grip-horizontal" />
                            <Chip iconColor={appcolor.dark}
                                ContainderStyle={{
                                    borderRadius: 30, paddingLeft: 7,
                                    paddingRight: 7, flexDirection: 'row', backgroundColor: !horizontal ? appcolor.info : appcolor.lightgray
                                }} onChipPress={() => setHorizontal(false)}
                                title="Dọc" iconName="list" />
                        </View>
                    </View>
                    <View style={{ margin: 7 }}>
                        <Text style={{ color: appcolor.dark, padding: 7, textDecorationLine: 'underline' }}>Sắp xếp</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Chip ContainderStyle={{
                                marginRight: 12, borderRadius: 30,
                                paddingLeft: 7, paddingRight: 7, flexDirection: 'row', backgroundColor: groupBy === 'CreatedDate' ? appcolor.info : appcolor.lightgray
                            }} onChipPress={() => ChangeGroup("CreatedDate")}
                                title="Thời gian" iconColor={appcolor.dark}
                                iconName="clock" />
                            <Chip ContainderStyle={{
                                borderRadius: 30, paddingLeft: 7,
                                paddingRight: 7, flexDirection: 'row', backgroundColor: groupBy === 'GroupName' ? appcolor.info : appcolor.lightgray
                            }} title="Chủ đề" onChipPress={() => ChangeGroup("GroupName")}
                                iconColor={appcolor.dark}
                                iconName="layer-group" />
                        </View>
                    </View>
                    <View style={{ height: 20 }} />
                </View>
            </ActionSheet>
        </SafeAreaView>
    )
}