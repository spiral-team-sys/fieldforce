import React, { Fragment } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import GmailStyleSwipeableRow from '../Core/GmailStyleSwipeableRow';
import { Icon, Badge, Button } from '@rneui/themed';
import { Store, DeleteItem } from "../Core/SqliteDbContext";
import { _competitorId } from "../Core/URLs";
import { scaleSize } from '../Themes/AppsStyle';
import { launchImageLibrary } from 'react-native-image-picker';
import Moment from 'moment';
import { InsertPhotosItem } from "../Controller/PhotoController";
import { useSelector } from "react-redux";
import { toCurrency } from "../Core/Utility";
import LottieView from "lottie-react-native";
import NativeCamera from "../Control/NativeCamera";

export const SelloutResRow = ({ item, index, selloutLoad, ShowDetail, Props, workinfo, canEdit = true, onBlockedAction }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const productCode = `${item?.productCode || item?.ProductCode || ''}`.trim().toUpperCase()
    const isNoSell = productCode === 'NOSELL' || item?.noSell === 1
    const takePhotoCell = (e, guiid) => {
        let item = {
            "reportId": 0,
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "guiId": guiid,
            "photoDate": workinfo.workDate
        }
        Props.navigation.navigate('Camera', { ...item, callBackReport: selloutLoad });
    };
    const uploadFileCell = async (e, guiid) => {
        let photoinfo = {};
        let options = {
            mediaType: 'photo', maxWidth: 800, maxHeight: 800, quality: 0.8, includeBase64: true
        };
        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                const newImageUrl = await NativeCamera.resizeImage(await response.uri)
                photoinfo = {
                    reportId: 0,
                    shopId: workinfo.shopId,
                    shopCode: workinfo.shopCode,
                    guid: guiid,
                    photoDate: workinfo.workDate,
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
    const showALbumCell = (e, guiid) => {
        let item = {
            "reportId": 0,
            "shopId": workinfo.shopId,
            "guiId": guiid,
            "photoDate": workinfo.workDate
        }
        Props.navigation.navigate('AlbumPhoto', item);
    };
    const deleteItemSellout = async (item, selloutLoad) => {
        if (!canEdit) {
            onBlockedAction?.();
            return;
        }
        await Store().then(db => {
            DeleteItem(db, 'sellOut', { sellId: item.sellId });
        })
        selloutLoad();
    }
    if (isNoSell) {
        return <GmailStyleSwipeableRow
            enableRight={!canEdit || item.upload === 1 ? true : false}
            key={item.sellId?.toString() || `nosell-${index}`}
            deleteItem={() => deleteItemSellout(item, selloutLoad)}>
            <View style={{ width: '100%', minHeight: 240, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.light }}>
                <LottieView autoPlay style={{ height: 90, width: '100%' }}
                    source={require("../Themes/lotties/nosell.json")} />

                <Text style={{ width: '100%', color: appcolor.danger, fontSize: scaleSize(20), fontWeight: '900', padding: 12, position: 'absolute', top: 0, left: 0 }}>
                    Hôm nay, không bán được sản phẩm nào
                    ({item.productName})
                </Text>
            </View>
        </GmailStyleSwipeableRow>

    } else {
        return (
            <GmailStyleSwipeableRow
                enableRight={!canEdit || item.upload === 1 ? true : false}
                key={item.sellId.toString()}
                deleteItem={() => deleteItemSellout(item, selloutLoad)}>
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.light, borderRadius: 12 }}>
                    <Fragment>
                        <TouchableOpacity style={{ flexGrow: 0.9 }}
                            onPress={() => (item.productCode !== 'NOSELL' && item.upload == 0) && (canEdit ? ShowDetail(item) : onBlockedAction?.())}>
                            <View style={{ flex: 1, borderRadius: 10, padding: 7, marginRight: 35 }}>
                                <View style={{ padding: 7 }}>
                                    <Text style={{ color: appcolor.dark, fontSize: scaleSize(18) }}>
                                        {`${item.division || ''} ${item.productCode} ${item.productName}`}
                                    </Text>
                                    {item.price > 0 &&
                                        <Text style={{ color: appcolor.primary, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                            {
                                                `Giá bán ${toCurrency(item.price || '')} VND`
                                            }
                                        </Text>
                                    }
                                    <Text style={{ fontSize: scaleSize(12), color: appcolor.dark }}>
                                        {
                                            `${item.category} ${item.subcategory || ''}/${item.segment}`
                                        }
                                    </Text>
                                    {(item.serial !== undefined && item.serial !== '' && item.serial != null) &&
                                        <Text style={{ color: appcolor.dark }}>{'IMEI: ' + item.serial}</Text>
                                    }
                                    {(item.IMEI2 !== undefined && item.IMEI2 !== '' && item.IMEI2 != null) &&
                                        <Text style={{ color: appcolor.dark }}>{'IMEI2: ' + item.IMEI2}</Text>
                                    }
                                    <Text style={{ color: appcolor.dark, fontSize: scaleSize(12), fontStyle: 'italic' }}>
                                        {
                                            `Khách hàng ${item.customer || ''} ${item.address || ''} ${item.phone || ''} ${item.sellComment || ''} ${Moment(item.reportDate?.toString() || new Date()).format("YYYY-MM-DD")} `
                                        }
                                    </Text>
                                </View>

                            </View>
                            {item.numPhoto > 0 &&
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%', marginTop: 15 }}>
                                        <Button
                                            containerStyle={{ width: '33%' }}
                                            buttonStyle={{ height: 45, backgroundColor: 'white' }}
                                            onPress={e => {
                                                (item.upload == 0) && takePhotoCell(e, item.guiId)
                                            }}
                                            icon={
                                                <Icon
                                                    color='black'
                                                    name='camera'
                                                    type='ionicon'
                                                    size={33}
                                                />
                                            }
                                        />
                                        <Button
                                            containerStyle={{ width: '33%' }}
                                            buttonStyle={{ height: 45, backgroundColor: 'white' }}
                                            onPress={e => {
                                                (item.upload == 0) && uploadFileCell(e, item.guiId)
                                            }}
                                            icon={
                                                <Icon
                                                    color='black'
                                                    name='attach'
                                                    type='ionicon'
                                                    size={33}
                                                />
                                            }
                                        />
                                        <Button
                                            containerStyle={{ width: '33%' }}
                                            buttonStyle={{ height: 45, backgroundColor: 'white' }}
                                            onPress={e => showALbumCell(e, item.guiId)}
                                            icon={
                                                <View>
                                                    <Icon
                                                        color='black'
                                                        name='photo'
                                                        type='font-awesome'
                                                        size={30}
                                                    />
                                                    <Badge
                                                        value={item.numPhoto}
                                                        textStyle={{ fontSize: 12 }}
                                                        badgeStyle={{ width: 25, height: 25, borderRadius: 12.5 }}
                                                        status='primary'
                                                        containerStyle={{ position: 'absolute', top: -8, right: -15 }}
                                                        onPress={e => showALbumCell(e, item.guiId)}
                                                    />
                                                </View>
                                            }
                                        />
                                    </View>

                                </View>}
                        </TouchableOpacity>
                        <View style={{
                            flexGrow: 0.1, backgroundColor: item.upload === 0 ? appcolor.danger : appcolor.info, alignSelf: 'center',
                            width: 44, height: 44, borderRadius: 64, justifyContent: 'center', position: 'absolute', right: 10,
                        }}>
                            <Text style={{ fontSize: scaleSize(16), color: appcolor.white, textAlign: 'center' }}>{item.quantity}</Text>
                        </View>
                    </Fragment>
                </View>
            </GmailStyleSwipeableRow>
        );
    }

};
