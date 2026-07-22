import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, View, Image, Text, Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { deviceHeight, deviceWidth } from '../../../Themes/AppsStyle';
import { URLDEFAULT } from '../../../Core/URLs';
import { Switch } from 'react-native';
import { Icon } from '@rneui/themed';
import FormGroup from '../../../Content/FormGroup';
import filter from 'lodash';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { MessageInfo, groupDataByKey } from '../../../Core/Helper';
import { AppCreateAction } from '../../../Core/ReduxController';
import { MapApp } from '../../../Control/MapApp';
import { Linking } from 'react-native';

export const ViewListSelect = ({ navigation, employees }) => {
    const { appcolor, kpiinfo, listDataStore } = useSelector((state) => state.GAppState);
    const [storeSelect, setStoreSelect] = useState([]);
    const [isMaps, setIsMaps] = useState(false);
    const [isShowMenu, setIsShowMenu] = useState(false);

    const dispatch = useDispatch();
    useEffect(() => {
        if (listDataStore?.length > 0) {
            const filterIsChose = listDataStore?.filter((item) => item.IsChose === 1);
            const { arr } = groupDataByKey({
                arr: filterIsChose,
                key: 'employeeId',
            });
            setStoreSelect(arr);
        } else {
            loadByEmployee()
        }
    }, [listDataStore]);

    const loadByEmployee = async () => {
        const listSelect = []
        for (let i = 0; i < employees.length; i++) {
            const itemE = employees[i]
            const KEYSTORE_REPORT = `D${moment(new Date()).format('YYYYMMDD')}S${itemE.employeeId
                }R${kpiinfo.id}N${'EMPLOYEESTORE'}`;
            const json = await AsyncStorage.getItem(KEYSTORE_REPORT);
            const storeList = await JSON.parse(json);
            for (let j = 0; j < storeList?.length || 0; j++) {
                const itemS = storeList[j]
                if (itemS.IsChose == 1) {
                    listSelect.push({ ...itemS })
                }
            }
        }
        if (listSelect?.length > 0) {
            dispatch(AppCreateAction.SetListDataStore(listSelect));
        }
    }

    const handleGotoMaps = () => {
        setIsMaps(e => !e);
    };

    const handleClearListStore = () => {
        dispatch({ type: ACTION.CLEAR_LIST_DATA_STORE });
        setIsShowMenu(false);
    };

    const renderStoreSelect = ({ item, index }) => {
        const sourceImage =
            item.imageUrl !== null
                ? item.imageUrl?.indexOf('file://') === -1 &&
                    item.imageUrl?.indexOf('https://') === -1
                    ? URLDEFAULT + item.imageUrl
                    : item.imageUrl
                : null;

        return (
            <View
                key={'itemStore_' + index}
                style={{ padding: 4, width: deviceWidth, backgroundColor: appcolor.surface }}
            >
                {item.isParent &&
                    <Text
                        style={{
                            color: appcolor.dark,
                            fontWeight: '600',
                            fontSize: 12,
                            paddingRight: 16,
                            marginBottom: index === 0 ? 8 : 0,
                        }}
                    >
                        {`${item.employeeName} - ${item.employeeCode}`}
                    </Text>
                }
                <TouchableOpacity
                    onPress={handleGotoMaps}
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        padding: 8,
                        marginLeft: 32,
                        backgroundColor: appcolor.light,
                        borderRadius: 16,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            const lat = item.latitude;
                            const long = item.longitude;
                            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
                            // Mở Google Maps
                            Linking.openURL(url);
                        }}
                        style={{ position: 'absolute', top: 8, right: 8, zIndex: 1000, padding: 8 }}
                    >
                        <Icon
                            style={{ textAlign: 'center' }}
                            type="font-awesome-5"
                            name={'map-marker-alt'}
                            size={22}
                            color={appcolor.red}
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            left: -16,
                            width: (deviceWidth - 16) * 0.25,
                            height: (deviceWidth - 16) * 0.25,
                            backgroundColor: appcolor.surface,
                            padding: 8,
                            borderRadius: 12,
                        }}
                    >
                        <View style={{ flex: 1, borderRadius: 8, backgroundColor: appcolor.light }}>
                            {sourceImage !== null && (
                                <Image
                                    resizeMode="cover"
                                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                    source={{ uri: sourceImage }}
                                />
                            )}
                        </View>
                    </View>
                    <View style={{ width: '70%', width: (deviceWidth - 16) * 0.7, paddingLeft: 8 }}>
                        <Text
                            style={{
                                color: appcolor.dark,
                                fontWeight: '600',
                                fontSize: 16,
                                marginBottom: 8,
                                paddingRight: 16,
                            }}
                        >
                            {item.shopName}
                        </Text>
                        <Text style={{ color: appcolor.dark, fontWeight: '600', fontSize: 12 }}>
                            {item.addressVN}
                        </Text>
                        {item.level !== null && item.level !== undefined && (
                            <Text style={{ color: appcolor.dark, fontWeight: '400', fontSize: 12 }}>
                                {item.levelName}
                            </Text>
                        )}
                        {item.totalLastDate !== null && item.totalLastDate !== undefined && (
                            <Text style={{ color: appcolor.dark, fontWeight: '400', fontSize: 12 }}>
                                {item.totalText}
                            </Text>
                        )}
                        {item.totalMTD !== null && item.totalMTD !== undefined && (
                            <Text style={{ color: appcolor.dark, fontWeight: '400', fontSize: 12 }}>
                                {item.totalMTDText}
                            </Text>
                        )}
                    </View>

                </TouchableOpacity>
            </View>
        );
    };
    const handleRightClick = () => {
        setIsShowMenu(!isShowMenu);
    };

    // <TouchableOpacity
    //       onPress={() => {
    //         // Đường dẫn tới Google Maps với latitude và longitude
    //         const lat = this.state.region.latitude;
    //         const long = this.state.region.longitude;
    //         const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;

    //         // Mở Google Maps
    //         Linking.openURL(url);
    //       }}
    //       style={{ position: 'absolute', bottom: 16, left: 16, backgroundColor: 'white', padding: 8 }}>
    //       <Text>Open in Google Maps</Text>
    //     </TouchableOpacity>

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            {isMaps &&
                <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                    <TouchableOpacity onPress={() => handleGotoMaps()}
                        style={{ borderRadius: 50, borderWidth: 0.6, padding: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.light, margin: 5, borderColor: appcolor.primary }}>
                        <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}>Quay lại</Text>
                    </TouchableOpacity>
                    <MapApp navigation={navigation} slist={listDataStore} />
                </View>}
            {(!isMaps && storeSelect.length > 0) && (
                <FlatList
                    style={{ height: deviceHeight / 3 }}
                    data={storeSelect}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderStoreSelect}
                />
            )}

            {isShowMenu && (
                <TouchableOpacity
                    style={{
                        backgroundColor: 'red',
                        position: 'absolute',
                        right: 50,
                        top: -80,
                        width: 120,
                        height: 70,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={handleClearListStore}
                >
                    <View style={{}}>
                        <View
                            style={{ position: 'absolute', right: -12 }}
                        >
                            <Icon
                                type="antdesign"
                                name="caretright"
                                size={24}
                                color={'red'}
                            />
                        </View>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 16,
                                textAlign: 'center',
                            }}
                        >
                            {'Xóa danh sách cửa hàng'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

        </View>
    );
};
