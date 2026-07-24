import { Dimensions, FlatList, Platform, View } from "react-native"
import React, { useEffect, useState } from 'react';
import { ListItem, Icon, Badge } from '@rneui/themed';
import { AppNameBuild, DEFAULT_COLOR } from "../../Core/URLs";
import { getPhotosReport } from "../../Controller/WorkController";
import { isIphoneX } from "../../Core/is-iphone-x";

export const PhotoCustomHMD = ({ Photos, Workinfo, DisplayId, Props, ReportId, Status, NoChange, HeightHeader, combine, navigation, DisplayItem }) => {

    const [reload, setReload] = useState(0)
    const [lstShow] = useState([])

    const MapData = async () => {
        await lstShow.splice(0)
        Photos.map(async (item) => {
            const lstPhoto = await getPhotosReport(ReportId, DisplayId + '_' + item.code, Workinfo.shopId, Workinfo.workDate);
            lstShow.push({ ...item, numPhoto: lstPhoto.length })
            Photos.length === lstShow.length && setReload(reload + 1)
        })
    }
    useEffect(() => {
        MapData()
    }, [])

    // useEffect(() => {
    //     let lst = lstShow
    //     lstShow.splice(0)
    //     lst.map(async (item) => {lstShow.push(item)})
    // },[reload])

    const callBack = () => {
        lstShow.splice(0)
        Photos.map(async (item) => {
            const lstPhoto = await getPhotosReport(ReportId, DisplayId + '_' + item.code, Workinfo.shopId, Workinfo.workDate);
            lstShow.push({ ...item, numPhoto: lstPhoto.length })
            Photos.length === lstShow.length && setReload(reload + 1)
        })
    }

    const takePhoto = (item) => {
        let itemInfo = {
            "reportId": ReportId,
            "shopId": Workinfo.shopId,
            "shopCode": Workinfo.shopCode,
            "photoType": DisplayId + '_' + item.code,
            "photoDate": Workinfo.workDate,
            "photoDesc": DisplayItem.name + '_' + item.code
        }

        combine ? navigation.navigate('Camera', { ...itemInfo, callBackReport: callBack }) : Props.navigation.navigate('Camera', { ...itemInfo, callBackReport: callBack });
    }

    const viewAlbum = (item) => {
        let itemInfo = {
            "reportId": ReportId,
            "shopId": Workinfo.shopId,
            "photoType": DisplayId + '_' + item.code,
            "photoDate": Workinfo.workDate
        }
        combine ? navigation.navigate('AlbumPhoto', itemInfo) : Props.navigation.navigate('AlbumPhoto', itemInfo);
    }
    const iPhonex = isIphoneX();
    const renderItem = ({ item }) => (
        <ListItem style={{ width: '50%', height: Dimensions.get('screen').width / 2 }}>
            <ListItem.Content style={{ height: '100%', alignItems: 'center', backgroundColor: DEFAULT_COLOR, padding: 10, borderRadius: 10 }}>
                <ListItem.Title lineBreakMode={'clip'} numberOfLines={3} style={{ fontSize: 15, marginTop: 8, color: 'white' }}>{item.name}</ListItem.Title>
                <ListItem.Title lineBreakMode={'clip'} numberOfLines={3} style={{ fontSize: 13, fontStyle: 'italic', color: 'white', marginBottom: 8 }}>{item.numberValue > 0 ? '(chụp ' + item.numberValue + ' tấm)' : ''}</ListItem.Title>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '70%' }}>
                    <SpiralIcon name='images' type='ionicon' color={'white'} size={35} onPress={() => viewAlbum(item)} />
                    <Badge
                        containerStyle={{ position: 'absolute', left: 35, backgroundColor: Platform.select({ android: DEFAULT_COLOR }) }}
                        badgeStyle={{ width: 35, height: 20, borderColor: Platform.select({ android: 'transparent', ios: 'white' }) }}
                        textStyle={{ fontSize: 13 }}
                        status={item.numberValue > 0 ? (item.numPhoto > 0 ? (item.numPhoto >= item.numberValue ? 'success' : 'warning') : 'error') : 'success'}
                        value={item.numPhoto}
                    ></Badge>
                    <SpiralIcon
                        disabledStyle={{ backgroundColor: 'transparent' }}
                        disabled={(Status === 0 && NoChange === 0) ? false : true}
                        color={(Status === 0 && NoChange === 0) ? 'white' : 'gray'}
                        name='camera' type='ionicon'
                        size={35}
                        onPress={() => takePhoto(item)}
                    ></SpiralIcon>
                </View>
            </ListItem.Content>
        </ListItem>
    )
    return (
        <View style={{ width: '100%', top: AppNameBuild === 'bk' ? 0 : 60, height: AppNameBuild === 'bk' ? '100%' : Platform.OS === 'android' ? Dimensions.get('screen').height - (HeightHeader + 160) : Dimensions.get('screen').height - (HeightHeader + (iPhonex ? 110 : 80)) }}>
            <FlatList
                scrollEnabled
                data={lstShow}
                renderItem={renderItem}
                numColumns={2}
            ></FlatList>
        </View>
    )
}