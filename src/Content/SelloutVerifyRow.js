import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon, Badge, Button } from '@rneui/themed';
import { Store, DeleteItem } from "../Core/SqliteDbContext";
import { _competitorId } from "../Core/URLs";
import { launchImageLibrary } from 'react-native-image-picker';
import Moment from 'moment';
import { InsertPhotosItem } from "../Controller/PhotoController";
import { GetEmployeeInfo } from "../Core/Helper";
import { useSelector } from "react-redux";
import NativeCamera from "../Control/NativeCamera";

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'left'
  },
  line: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 4,
    marginTop: 4
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '500',
    padding: 5,
    textAlign: 'left'
  }
});

export const SelloutVerifyRow = ({ item, index, selloutLoad, ShowDetail, Props, workinfo }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [empId, setEmpId] = useState(0);

    const getEmployeeId = async () => {
        let Empinfo = await GetEmployeeInfo();
        let jsonEmp = Empinfo;
        setEmpId(jsonEmp.employeeId)
    }

    useEffect(() => {
        getEmployeeId()
    })

    const takePhotoCell = (e, itemRes) => {
        let item = {
            "shopId": itemRes.shopId,
            "shopCode": itemRes.shopId + '',
            "guiId": itemRes.guiId === null || itemRes.guiId === 'null' || itemRes.guiId === '' ? empId + '_' + itemRes.serial : itemRes.guiId,
            "photoDesc": itemRes.serial
        }
        Props.navigation.navigate('Camera', { ...item, callBackReport: selloutLoad });
    };
    const uploadFileCell = async (e, itemRes) => {
        let photoinfo = {};
        let options = {
            mediaType: 'photo', maxWidth: 500, maxHeight: 500, quality: 0.4, includeBase64: true
        };
        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                const newImageUrl = await NativeCamera.resizeImage(await response.uri)
                photoinfo = {
                    shopId: itemRes.shopId,
                    shopCode: itemRes.shopId + '',
                    guid: itemRes.guiId === null || itemRes.guiId === 'null' || itemRes.guiId === '' ? empId + '_' + itemRes.serial : itemRes.guiId,
                    photoDesc: itemRes.serial,
                    photoDate: parseInt(Moment(new Date()).format('YYYYMMDD')),
                    photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
                    photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                    photoPath: newImageUrl?.uri || response.uri,
                    fileUpload: 0,
                    dataUpload: 0
                }
                await InsertPhotosItem(photoinfo);
                selloutLoad()
            }
        });
    }
    const showALbumCell = (e, itemRes) => {
        let item = {
            "reportId": -2,
            "shopId": itemRes.shopId,
            "guiId": itemRes.guiId === null || itemRes.guiId === 'null' || itemRes.guiId === '' ? empId + '_' + itemRes.serial : itemRes.guiId,
            "photoDate": parseInt(Moment(new Date()).format('YYYYMMDD')),
        }
        Props.navigation.navigate('AlbumPhoto', item);
    };
    const deleteItemSellout = async (item, selloutLoad) => {
        await Store().then(db => {
            DeleteItem(db, 'sellOut', { sellId: item.sellId });
        })
        selloutLoad();
    }
    return (
        <View style={{ flexDirection: 'column', backgroundColor: appcolor.light }}>
            <View style={{ padding: 15 }}>
                {/* <Text>{JSON.stringify(item)}</Text> */}
                <View>
                    {
                        (item.custName !== undefined && item.custName !== 'undefined') &&
                        <Text style={{ ...styles.title, color: appcolor.dark }}>{'Khách hàng: ' + item.custName}</Text>
                    }
                    <Text style={styles.line}></Text>

                    {
                        (typeof item.productName !== 'undefined' && item.productName !== null) &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{'Sản phẩm: ' + item.productName}</Text>
                    }
                    {
                        (item.serial !== "undefined" && item.serial !== undefined) &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{'IMEI: ' + item.serial}</Text>
                    }
                    {
                        (item.confirmedNote !== undefined && item.confirmedNote !== null && item.confirmedNote !== 'undefined') &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.confirmedNote}</Text>
                    }
                    {
                        (item.custPhone !== "undefined" && item.custPhone !== undefined) &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.custPhone}</Text>
                    }
                    {
                        (item.custAddress !== undefined && item.custAddress !== null && item.custAddress !== 'undefined') &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.custAddress}</Text>
                    }
                    {
                        (item.competitorName !== undefined && item.competitorName !== 'undefined') &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.competitorName}</Text>
                    }
                    {
                        (typeof item.categoryName !== 'undefined' && item.categoryName !== null) &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.categoryName}</Text>
                    }
                    {
                        (typeof item.segment !== 'undefined' && item.segment !== 'null') &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{item.segment}</Text>
                    }
                    {
                        (item.optional !== undefined && item.optional !== null && item.optional !== 'undefined') &&
                        <Text style={{ ...{ ...styles.subTitle, color: appcolor.dark }, color: item.imeiStatus === 2 ? 'green' : (item.imeiStatus === 1 ? 'orange' : 'red') }}>{item.optional}</Text>
                    }
                    {
                        (item.tribeReason !== undefined && item.tribeReason !== null && item.tribeReason !== 'undefined') &&
                        <Text style={{ ...{ ...styles.subTitle, color: appcolor.dark }, color: item.imeiStatus === 2 ? 'green' : (item.imeiStatus === 1 ? 'orange' : 'red') }}>{item.tribeReason}</Text>
                    }
                    {
                        (item.imeiVerify !== undefined && item.imeiVerify !== null && item.imeiVerify !== 'undefined') &&
                        <Text style={{ ...{ ...styles.subTitle, color: appcolor.dark }, color: item.imeiStatus === 2 ? 'green' : (item.imeiStatus === 1 ? 'orange' : 'red') }}>{item.imeiVerify}</Text>
                    }
                    {
                        (item.sellDate !== undefined && item.sellDate !== null && item.sellDate !== 'undefined') &&
                        <Text style={{ ...styles.subTitle, color: appcolor.dark }}>{'Ngày: ' + item.sellDate}</Text>
                    }
                </View>
            </View>
            {
                (item.imeiStatus === 1 || item.imeiStatus === 3) &&
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
                    <Button
                        containerStyle={{ width: '33%' }}
                        buttonStyle={{ height: 45, backgroundColor: appcolor.light }}
                        onPress={e => {
                            (item.upload == 0) && takePhotoCell(e, item)
                        }}
                        icon={
                            <Icon
                                color={appcolor.dark}
                                name='camera'
                                type='ionicon'
                                size={33}
                            />
                        }
                    />
                    <Button
                        containerStyle={{ width: '33%' }}
                        buttonStyle={{ height: 45, backgroundColor: appcolor.light }}
                        onPress={e => {
                            (item.upload == 0) && uploadFileCell(e, item)
                        }}
                        icon={
                            <Icon
                                color={appcolor.dark}
                                name='attach'
                                type='ionicon'
                                size={33}
                            />
                        }
                    />
                    <Button
                        containerStyle={{ width: '33%' }}
                        buttonStyle={{ height: 45, backgroundColor: appcolor.light }}
                        onPress={e => showALbumCell(e, item)}
                        icon={
                            <View>
                                <Icon
                                    color={appcolor.dark}
                                    name='photo'
                                    type='font-awesome'
                                    size={30}
                                />
                                {
                                    item.numPhoto > 0 &&
                                    <Badge
                                        value={item.numPhoto}
                                        textStyle={{ fontSize: 12 }}
                                        badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                                        status={item.status === 1 ? 'success' : 'primary'}
                                        containerStyle={{ position: 'absolute', top: -8, right: -15 }}
                                        onPress={e => showALbumCell(e, item)}
                                    />
                                }
                            </View>
                        }
                    />
                </View>
            }
            <View style={styles.line}></View>
        </View>
    );
};