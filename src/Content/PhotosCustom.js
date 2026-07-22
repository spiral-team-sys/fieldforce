import { Dimensions, FlatList, Platform, Text, View, TouchableOpacity, StyleSheet } from "react-native"
import React, { useEffect, useState } from 'react';
import { AppNameBuild } from "../Core/URLs";
import { getPhotosReport } from "../Controller/WorkController";
import Icon from '@react-native-vector-icons/fontawesome6';
import { isIphoneX } from "../Core/is-iphone-x";
import { deviceWidth } from "../Themes/AppsStyle";
import { useSelector } from "react-redux";

export const PhotoCustom = ({ Photos, Workinfo, DisplayId, Props, ReportId, Status, NoChange, HeightHeader, combine, navigation }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
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
        return () => reload
    }, [])

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
            "photoDate": Workinfo.workDate
        }
        combine ? navigation.navigate('Camera', { ...itemInfo, callBackReport: callBack }) : Props.navigation.navigate('Camera', { ...itemInfo, callBackReport: callBack });
    }

    const viewAlbum = (item) => {
        let itemInfo = {
            "titlePage": item.name,
            "reportId": ReportId,
            "shopId": Workinfo.shopId,
            "photoType": DisplayId + '_' + item.code,
            "photoDate": Workinfo.workDate
        }
        combine ? navigation.navigate('AlbumPhoto', itemInfo) : Props.navigation.navigate('AlbumPhoto', itemInfo);
    }
    const iPhonex = isIphoneX();
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.homebackground, width: '100%', top: AppNameBuild === 'bk' ? 0 : 60, height: AppNameBuild === 'bk' ? '100%' : Platform.OS === 'android' ? Dimensions.get('screen').height - (HeightHeader + 160) : Dimensions.get('screen').height - (HeightHeader + (iPhonex ? 110 : 80)) },
        viewMainPhoto: { backgroundColor: appcolor.light, width: deviceWidth / 2 - 10, alignItems: 'center', margin: 5, borderRadius: 8 },
        styleTakePhoto: { width: '100%', alignItems: 'center', padding: 8 },
        viewPhoto: { width: '100%', padding: 8, borderBottomStartRadius: 8, borderBottomEndRadius: 8, borderTopWidth: 0.5, borderTopColor: appcolor.grey, alignItems: 'center' },
        itemPhotoCount: { width: '100%', alignSelf: 'center' }
    })
    const renderItem = ({ item, index }) => {
        const takePhotoDisplay = () => {
            takePhoto(item)
        }
        const viewPhotoDisplay = () => {
            viewAlbum(item)
        }
        const disableCamera = Status === 0 && NoChange === 0 ? false : true
        const colorStatusUpload = item.numberValue > 0 ? (item.numPhoto > 0 ? (item.numPhoto >= item.numberValue ? appcolor.green : appcolor.warning) : appcolor.danger) : appcolor.green
        const colorText = item.numberValue > 0 ? (item.numPhoto > 0 ? (item.numPhoto >= item.numberValue ? appcolor.white : appcolor.dark) : appcolor.white) : appcolor.white
        return (
            <View key={index} style={styles.viewMainPhoto} >
                <TouchableOpacity onPress={!disableCamera ? takePhotoDisplay : null} >
                    <View style={styles.styleTakePhoto}>
                        <Text style={{ fontSize: 15, color: appcolor.dark, marginBottom: 5, fontWeight: '600', height: deviceWidth / 10, alignItems: 'center', justifyContent: 'space-around' }} >{item.name}</Text>
                        <Icon name={!disableCamera ? "camera" : "ban"} size={56} color={appcolor.dark} />
                    </View>
                </TouchableOpacity>
                <View style={{ ...styles.viewPhoto, backgroundColor: colorStatusUpload }}>
                    <TouchableOpacity style={{ width: '100%' }} onPress={viewPhotoDisplay}>
                        <Text style={{ fontSize: 14, color: colorText, width: '100%', textAlign: 'center' }} >{item.numPhoto}{item.numberValue > 0 ? '/' + item.numberValue : ''} Tấm hình</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <FlatList
                style={{ width: '100%', alignSelf: 'center' }}
                scrollEnabled
                key='photoDisplay'
                keyExtractor={(_, index) => index.toString()}
                data={lstShow}
                renderItem={renderItem}
                numColumns={2}
            />
        </View>
    )
}