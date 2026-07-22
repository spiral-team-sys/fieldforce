import React, { forwardRef, useEffect, useMemo } from 'react';
import { View, SafeAreaView, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from "react-native"
import { ListItem, Icon } from '@rneui/themed'
import { useState } from "react"
import { useSelector } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
////import { NumericFormat } from "react-number-format";;
import { distanceBetween2Points, removeVietnameseTones } from '../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import _ from 'lodash';
import CustomListView from './Custom/CustomListView';

export const SearchStore = forwardRef((props, ref) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const shoplist = props.route.params.shoplist;
    const [query, setQuery] = useState('');
    const [currentPos, setCurrent] = useState({ latitude: 0, longitude: 0 })
    const [shopsF, setShopsF] = useState();
    const [shops, setShops] = useState(shoplist);
    const [textSelect, setTextSelect] = useState('')

    const filterOptions = [
        { key: 'DISTANCE_UP', icon: 'sort-numeric-up-alt', text: 'Khoảng cách tăng dần' },
        { key: 'DISTANCE_DOWN', icon: 'sort-numeric-down-alt', text: 'Khoảng cách giảm dần' },
        { key: 'LEVEL_UP', icon: 'sort-alpha-up-alt', text: 'Quy mô A->Z' },
        { key: 'LEVEL_DOWN', icon: 'sort-alpha-down-alt', text: 'Quy mô Z->A' }
    ];

    const LoadData = async () => {
        await setShopsF(shoplist)
        await setShops(shoplist)
        await requestMylocation()
    }

    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [])

    const styles = StyleSheet.create({
        itemText: { fontSize: 14, color: appcolor.dark },
        safeAreaContainer: { flex: 1, backgroundColor: appcolor.light, paddingTop: Platform.OS == 'android' ? 56 : 45 },
        searchContainer: { flexDirection: 'row', alignContent: 'center' },
        textInput: { width: "95%", height: 50, paddingLeft: 55, marginBottom: 15, borderRadius: 30, opacity: 0.8, marginLeft: 10, color: appcolor.dark, padding: 10, backgroundColor: appcolor.homebackground },
        backButton: { position: 'absolute', left: 14, top: 3 },
        filterButton: { position: 'absolute', right: 14, top: 3 },
        iconContainer: { justifyContent: 'center', height: 44, width: 44, borderRadius: 30, backgroundColor: appcolor.grayLight },
        actionSheetContainer: { backgroundColor: appcolor.light },
        actionSheetContent: { padding: 8, width: '100%', minHeight: 240 },
        actionSheetInner: { width: '100%' },
        actionSheetTitle: { width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark },
        filterOptionText: { width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 },
        shopItemContainer: { padding: 10, backgroundColor: appcolor.light, borderRadius: 10, margin: 10, elevation: 10, shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 10 },
        distanceText: { color: appcolor.danger }
    })

    const contains = (shop, query) => {
        const { shopCode, shopName, address, levelName } = shop;
        const searchFields = [
            removeVietnameseTones(shopCode?.toLowerCase() || ''),
            removeVietnameseTones(shopName?.toLowerCase() || ''),
            removeVietnameseTones(address?.toLowerCase() || ''),
            removeVietnameseTones(levelName?.replace(/\s/g, "").toLowerCase() || '')
        ];

        return searchFields.some(field => field.includes(query));
    };

    const filteredShops = useMemo(() => {
        if (!query || !shopsF) return shopsF;
        const formattedQuery = removeVietnameseTones(query).toLowerCase();
        return _.filter(shopsF, shop => contains(shop, formattedQuery));
    }, [query, shopsF]);

    const sortShops = async (type) => {
        if (type !== textSelect) {
            await setTextSelect(type)
            let shopSort = shops
            switch (type) {
                case 'DISTANCE_UP':
                    await shopSort.forEach(async (it) => {
                        it.distant = ((it.latitude > 0 && currentPos?.latitude > 0) ? await distanceBetween2Points(currentPos.latitude, currentPos.longitude, it.latitude, it.longitude) : null)
                    })
                    const numAscendingUp = await [...shopSort].sort((a, b) => a.distant - b.distant)
                    setShopsF(numAscendingUp);
                    setShops(numAscendingUp);
                    break
                case 'DISTANCE_DOWN':
                    await shopSort.forEach(async (it) => {
                        it.distant = ((it.latitude > 0 && currentPos?.latitude > 0) ? await distanceBetween2Points(currentPos.latitude, currentPos.longitude, it.latitude, it.longitude) : null)
                    })
                    const numAscendingDown = await [...shopSort].sort((a, b) => b.distant - a.distant)
                    setShopsF(numAscendingDown);
                    setShops(numAscendingDown);
                    break
                case 'LEVEL_UP':
                    const leverSortUp = [...shopSort].sort((a, b) => {
                        let comparison = 0;
                        if (a.levelName > b.levelName) {
                            comparison = 1;
                        } else if (a.levelName < b.levelName) {
                            comparison = -1;
                        }
                        return comparison;
                    });
                    setShopsF(leverSortUp);
                    setShops(leverSortUp);
                    break
                case 'LEVEL_DOWN':
                    const leverSortDown = [...shopSort].sort((a, b) => {
                        let comparison = 0;
                        if (a.levelName < b.levelName) {
                            comparison = 1;
                        } else if (a.levelName > b.levelName) {
                            comparison = -1;
                        }
                        return comparison;
                    });
                    setShopsF(leverSortDown);
                    setShops(leverSortDown);
                    break
            }
        } else {
            setShopsF(shopsF)
            setShops(shops)
            setTextSelect('')
        }
    }
    const renderitem = ({ item, index }) => {
        const _distant = item.latitude > 0 && currentPos?.latitude > 0 ? distanceBetween2Points(currentPos.latitude, currentPos.longitude, item.latitude, item.longitude) : null
        const onPress = () => {
            onSelected(item)
        }
        return (
            <TouchableOpacity key={index} style={styles.shopItemContainer} onPress={onPress}>
                <Text style={styles.itemText}>{item.shopCode + " - " + item.shopName}</Text>
                <Text style={styles.itemText}>{item.address}</Text>
                {item.levelName && <Text style={styles.itemText}>{item.levelName}</Text>}
                {item.shopFormat && <Text style={styles.itemText}>{item.shopFormat}</Text>}
                {item.dealerName && <Text style={styles.itemText}>{item.dealerName}</Text>}
                <NumericFormat key={item.shopId + "-fe"}
                    displayType="text" prefix={'KM'}
                    thousandSeparator={true} format='####'
                    value={_distant}
                    renderText={(value) => <Text style={styles.distanceText}>{
                        _distant !== null ? "Khoảng cách " + value + " Km" : 'Chưa xác định được khoảng cách'}
                    </Text>}
                />
            </TouchableOpacity>
        )
    }
    const handleSearch = (text) => {
        setQuery(text);
        setShops(text ? filteredShops : shopsF);
    };
    const onSelected = (item) => {
        props.route.params.callBack(item);
        props.navigation.goBack();
    }
    const requestMylocation = async () => {
        await Geolocation.getCurrentPosition(async (position) => {
            await setCurrent({ "latitude": position.coords.latitude, "longitude": position.coords.longitude })
        }, (err) => {
            console.log(err, 'location error')
        });
    }

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Tìm kiếm của hàng..."
                    value={query}
                    autoFocus
                    onChangeText={handleSearch}
                    placeholderTextColor={appcolor.greydark}
                    style={styles.textInput}
                />
                <TouchableOpacity
                    onPress={() => props.navigation.goBack()}
                    style={styles.backButton}>
                    <Icon containerStyle={styles.iconContainer} color={appcolor.dark}
                        name="long-arrow-left" type="font-awesome" size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => SheetManager.show('sheetSearchStore')}
                    style={styles.filterButton}>
                    <Icon containerStyle={styles.iconContainer} color={appcolor.dark}
                        name="filter" type="font-awesome" size={24} />
                </TouchableOpacity>
            </View>
            <CustomListView
                key="shopId"
                data={shops}
                renderItem={renderitem}
            />
            <ActionSheet
                id={'sheetSearchStore'}
                defaultOverlayOpacity={0.3}
                containerStyle={styles.actionSheetContainer}
                closeOnPressBack
                gestureEnabled
                indicatorColor={appcolor.primary} >
                <View style={styles.actionSheetContent}>
                    {filterOptions.map((item, index) => {
                        return (
                            <TouchableOpacity style={{ flex: 1, marginTop: 6 }} key={index} onPress={() => sortShops(item.key)}>
                                <View style={{ backgroundColor: textSelect === item.key ? appcolor.light : appcolor.surface, borderWidth: textSelect === item.key ? 0.5 : 0, borderColor: appcolor.success, width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 }}>
                                    <Icon name={item.icon} type={'font-awesome-5'} size={18} color={appcolor.primary} />
                                    <Text style={{ fontSize: 14, color: appcolor.dark, marginLeft: 8 }}>{item.text}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ActionSheet>
        </SafeAreaView>
    )
})