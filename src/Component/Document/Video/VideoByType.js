import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';
import filter from 'lodash';
import { deviceWidth } from '../../Home';
import { scaleSize } from '../../../Themes/AppsStyle';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import FormGroup from '../../../Content/FormGroup';
import { UUIDGenerator } from '../../../Core/Helper';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';
// import Orientation from 'react-native-orientation-locker';

export const VideoByType = ({ navigation, route }) => {
    const { AppColor } = useSelector(state => state.GAppState);
    const { _filter, title } = route.params
    const [query, setQuery] = useState('');
    const [data, setData] = useState([]);
    useEffect(() => {
        _filter?.sort((a, b) => b.sortDate - a.sortDate);
        setData(_filter);
        // Orientation.lockToPortrait();
        // return () => {
        //     Orientation.lockToPortrait();
        //     return false;
        // };
    }, [])
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

    const rowTemplate = ({ item, index }) => {
        const pathJson = JSON.parse(item.filePath);
        const videoUrl = ((item.HostName || URLDEFAULT) + pathJson[0].Url)
        const thumbnail = ((item.HostName || URLDEFAULT) + pathJson[0].Thumbnail)
        return (
            <View>
                <View key={index + "lq"} style={{
                    padding: 3, marginRight: 7, marginBottom: 7, backgroundColor: AppColor.lightgray,
                    borderColor: AppColor.transparent, borderWidth: 1, borderRadius: 12,
                    height: (deviceWidth / 3), width: '99%', flexDirection: 'column'
                }}>
                    <TouchableOpacity onPress={() => handleSelectVideo(videoUrl, item)}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{
                                width: '34%', paddingLeft: 0, paddingTop: 0, paddingBottom: 0, paddingRight: 3,
                                borderRadius: 10, backgroundColor: AppColor.light,
                            }}>
                                {
                                    pathJson[0].Thumbnail !== undefined ?
                                        <Image style={{ borderRadius: 10, width: '100%', height: '100%' }} source={{ uri: thumbnail }} /> :
                                        <SpiralIcon
                                            name="stroopwafel" size={60}
                                            color={AppColor.danger}
                                            containerStyle={{ height: '100%', justifyContent: 'center', }}
                                            type="font-awesome-5" />
                                }
                            </View>
                            <View style={{ paddingLeft: 12, width: '64%', }}>
                                <Text numberOfLines={3} style={{
                                    fontWeight: 'bold', color: AppColor.dark,
                                    marginTop: 7, fontSize: scaleSize(13),
                                }}>{index + ". " + item.documentName + " " + (_filter.length - 1)}</Text>
                                <Text numberOfLines={2} style={{
                                    fontWeight: 'bold', color: AppColor.dark,
                                    marginTop: 7, fontSize: scaleSize(12),
                                }}>{item.description}</Text>
                                <Text style={{ fontSize: scaleSize(12), color: AppColor.dark, position: 'absolute', bottom: 0, right: 10 }}>Đã đăng {item.updated || ''}</Text>
                            </View>
                        </View>

                    </TouchableOpacity>
                </View>
                {index === (data.length - 1) && data.length > 5 ?
                    <View style={{ height: 80, width: '100%', }}>
                        <Text style={{ width: '100%', textAlign: 'center' }}>Bạn đã xem hết</Text>
                    </View> : null}
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColor.listcolors[6][1] }}>
            <HeaderCustom title={title}
                iconRight="ellipsis-v" leftFunc={() => navigation.goBack()} />
            <View style={{
                height: '100%', width: '100%',
                shadowOpacity: 0.7, shadowColor: AppColor.light, shadowRadius: 10,
                paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 20,
                borderTopLeftRadius: 30, backgroundColor: AppColor.light, marginTop: 15, marginBottom: 0,
                borderWidth: 0, borderTopRightRadius: 30, marginLeft: 0, marginRight: 0, marginTop: 0, overflow: 'hidden',
            }}>
                <FormGroup handleChangeForm={onSearch}
                    editable={true} placeholder="Tìm kiếm..." />
                <FlatList
                    data={data}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    key="id" initialNumToRender={8}
                    keyExtractor={(item) => item.id + "k"}
                    renderItem={rowTemplate}
                />

            </View>
        </SafeAreaView>)
}