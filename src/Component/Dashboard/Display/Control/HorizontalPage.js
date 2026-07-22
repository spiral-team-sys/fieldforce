import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import Orientation from "react-native-orientation-locker";
import { deviceHeight, deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import { Icon, Text } from "@rneui/base";
import { SearchData } from "../../../../Control/SearchData/SearchData";
import { removeVietnameseTones } from "../../../../Core/Helper";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import _ from "lodash";

const HorizontalPage = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [dataSearch, setDataSearch] = useState([])
    const [search, _setItemSearch] = useState({ text: '', growth: null, week: null, isSearch: false })
    const [_mutate, setMutate] = useState(false)
    const [infoTable, setInfoTable] = useState({ groupName: null, keyFilter: null, keyFilterName: null })

    const LoadData = () => {
        const data = route?.params?.data || [];
        const groupName = route?.params?.groupName || null;
        const { keyValue, keyName } = route?.params?.keyTable || null;
        //
        const _data = _.filter(data, (e) => groupName !== null && e.GroupView == groupName && (keyValue ? e.CompetitorId == keyValue : true))
        setInfoTable({ groupName, keyFilter: keyValue, keyFilterName: keyName })
        setData(data)
        setDataMain(_data)
        setDataSearch(_data)
    }

    const onSearchData = async (text) => {
        search.text = text
        const dataFilter = await _searchData(dataSearch)
        setDataMain(dataFilter)
        setMutate(e => !e)
    }
    const _searchData = async (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        let searchData = await _.filter(filterList, (e) => (
            removeVietnameseTones(e.TitleGroup).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.TitleModel).toLowerCase().match(valueSearch)
        ))
        if (search.growth !== null) {
            searchData = await _.filter(searchData, (e) => (
                e.growthT2 == search.growth || e.growthT3 == search.growth || e.growthT4 == search.growth
            ))
        }
        if (search.week !== null) {
            searchData = await _.filter(searchData, (e) => (
                search.growth == null || e[`growth${search.week}`] == search.growth
            ))
        }
        return searchData
    }
    const onTouchGrowth = async (type) => {
        const value = type == search.growth ? null : type
        search.growth = value
        const dataFilter = await _searchData(dataSearch)
        setDataMain(dataFilter)
        setMutate(e => !e)
    }

    const onTouchWeek = async (type) => {
        const value = type == search.week ? null : type
        search.week = value
        const dataFilter = await _searchData(dataSearch)
        setDataMain(dataFilter)
        setMutate(e => !e)
    }

    const onBack = () => {
        navigation.goBack();
    }

    useEffect(() => {
        LoadData()
        Orientation.lockToLandscape()
        return () => {
            Orientation.unlockAllOrientations()
        }
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8, paddingTop: 38 },
        contentTableView: { width: '100%', height: '100%' },
        itemMain: { flexDirection: 'row', marginBottom: 1 },
        headerMain: { flexDirection: 'row', marginBottom: 1 },
        itemHeaderView: { width: `${(100 / 6)}%`, backgroundColor: appcolor.primary, justifyContent: 'center', alignItems: 'center', marginHorizontal: 0.5 },
        itemView: { width: `${100 / 6}%`, flexDirection: 'row', backgroundColor: appcolor.grayLight, justifyContent: 'center', alignItems: 'center', marginHorizontal: 0.5 },
        titleGroup: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.light, padding: 8 },
        titleValue: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.dark, padding: 8 },
        viewTitle: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        titleTableView: { width: '60%', fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, padding: 8, paddingStart: 5, fontStyle: 'italic' },
        searchContainer: { marginTop: 0 },
        searchInput: { fontSize: 12 },
        viewStatus: { flexDirection: 'row', alignItems: 'center', marginEnd: 8 },
        iconStatus: { paddingHorizontal: 8 },
        iconViewStatus: { position: 'absolute', end: 8, top: 8 },
        viewDataTotal: { justifyContent: 'flex-end' },
        bottomView: { paddingBottom: deviceWidth / 4 }
    })

    const renderHeader = () => {
        const itemHeader = data[0] || {}
        const opacityFilter = (type) => { return (search.week || null) == null ? 1 : (search.week == type ? 1 : 0.5) }
        const onPress = (type) => {
            onTouchWeek(type)
        }
        return (
            <View style={styles.headerMain}>
                <View style={styles.itemHeaderView}>
                    <Text style={styles.titleGroup}>{itemHeader.TitleGroup || 'Group'}</Text>
                </View>
                <View style={styles.itemHeaderView}>
                    <Text style={styles.titleGroup}>{itemHeader.TitleModel || 'Model'}</Text>
                </View>
                <View style={styles.itemHeaderView}>
                    <Text style={styles.titleGroup}>{itemHeader.T1 || ''}</Text>
                </View>
                <TouchableOpacity style={styles.itemHeaderView} onPress={() => onPress('T2')}>
                    <View style={{ ...styles.itemHeaderView, width: '100%', opacity: opacityFilter('T2') }}>
                        <Text style={styles.titleGroup}>{itemHeader.T2 || ''}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemHeaderView} onPress={() => onPress('T3')}>
                    <View style={{ ...styles.itemHeaderView, width: '100%', opacity: opacityFilter('T3') }} onPress={() => onPress('T3')}>
                        <Text style={styles.titleGroup}>{itemHeader.T3 || ''}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemHeaderView} onPress={() => onPress('T4')}>
                    <View style={{ ...styles.itemHeaderView, width: '100%', opacity: opacityFilter('T4') }} onPress={() => onPress('T4')}>
                        <Text style={styles.titleGroup}>{itemHeader.T4 || ''}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const renderItemTotal = () => {
        const opacityFilter = (type) => { return (search.week || null) == null ? 1 : (search.week == type ? 1 : 0.5) }
        const _sumT1 = _.sumBy(dataMain, (e) => { return parseInt(e.T1) || 0 })
        const _sumT2 = _.sumBy(dataMain, (e) => { return parseInt(e.T2) || 0 })
        const _sumT3 = _.sumBy(dataMain, (e) => { return parseInt(e.T3) || 0 })
        const _sumT4 = _.sumBy(dataMain, (e) => { return parseInt(e.T4) || 0 })
        // 
        const iconNameStatus = (value1, value2) => { return value1 > value2 ? "caret-up" : value1 == value2 ? 'ellipse' : "caret-down" }
        const colorStatus = (value1, value2) => { return value1 > value2 ? appcolor.success : value1 == value2 ? appcolor.greylight : appcolor.redgray }

        return (
            <View style={styles.itemMain}>
                <View style={styles.itemView}>
                    <Text style={styles.titleValue}>{'Total'}</Text>
                </View>
                <View style={styles.itemView}>
                    <Text style={styles.titleValue}>{'Total'}</Text>
                </View>
                <View style={{ ...styles.itemView, opacity: opacityFilter('T1') }}>
                    <Text style={styles.titleValue}>{_sumT1}</Text>
                </View>
                <View style={{ ...styles.itemView, opacity: opacityFilter('T2') }}>
                    <Text style={styles.titleValue}>{_sumT2}</Text>
                    {_sumT2 > 0 && <Icon size={12} type="ionicon" name={iconNameStatus(_sumT2, _sumT1)} color={colorStatus(_sumT2, _sumT1)} containerStyle={styles.iconViewStatus} />}
                </View>
                <View style={{ ...styles.itemView, opacity: opacityFilter('T3') }}>
                    <Text style={styles.titleValue}>{_sumT3}</Text>
                    {_sumT3 > 0 && <Icon size={12} type="ionicon" name={iconNameStatus(_sumT3, _sumT2)} color={colorStatus(_sumT3, _sumT2)} containerStyle={styles.iconViewStatus} />}
                </View>
                <View style={{ ...styles.itemView, opacity: opacityFilter('T4') }}>
                    <Text style={styles.titleValue}>{_sumT4 > 0 ? _sumT4 : ''}</Text>
                    {_sumT4 > 0 && <Icon size={12} type="ionicon" name={iconNameStatus(_sumT4, _sumT3)} color={colorStatus(_sumT4, _sumT3)} containerStyle={styles.iconViewStatus} />}
                </View>
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        const opacityFilter = (type) => { return (search.week || null) == null ? 1 : (search.week == type ? 1 : 0.5) }
        const backgroundColor = index % 2 == 0 ? appcolor.surface : appcolor.grayLight
        return (
            <View key={index} style={styles.itemMain}>
                <View style={{ ...styles.itemView, backgroundColor }}>
                    <Text style={styles.titleValue}>{item.TitleGroup}</Text>
                </View>
                <View style={{ ...styles.itemView, backgroundColor }}>
                    <Text style={styles.titleValue}>{item.TitleModel}</Text>
                </View>
                <View style={{ ...styles.itemView, backgroundColor, opacity: opacityFilter('T1') }}>
                    <Text style={styles.titleValue}>{item.T1}</Text>
                </View>
                <View style={{ ...styles.itemView, backgroundColor, opacity: opacityFilter('T2') }}>
                    <Text style={styles.titleValue}>{item.T2}</Text>
                    <Icon size={12} type="ionicon" name={item.iconStatusT2} color={appcolor[item.colorStatusT2]} containerStyle={styles.iconViewStatus} />
                </View>
                <View style={{ ...styles.itemView, backgroundColor, opacity: opacityFilter('T3') }}>
                    <Text style={styles.titleValue}>{item.T3}</Text>
                    <Icon size={12} type="ionicon" name={item.iconStatusT3} color={appcolor[item.colorStatusT3]} containerStyle={styles.iconViewStatus} />
                </View>
                <View style={{ ...styles.itemView, backgroundColor, opacity: opacityFilter('T4') }}>
                    <Text style={styles.titleValue}>{item.T4}</Text>
                    <Icon size={12} type="ionicon" name={item.iconStatusT4} color={appcolor[item.colorStatusT4]} containerStyle={styles.iconViewStatus} />
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <View style={styles.viewTitle}>
                <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon type="ionic" name="arrow-back" size={18} color={appcolor.dark} />
                    <Text style={styles.titleTableView}>{`Danh sách SKU thay đổi ${infoTable.groupName} - ${infoTable.keyFilterName || 'Tất cả hãng'}`}</Text>
                </TouchableOpacity>
                <View style={styles.viewStatus}>
                    <Icon
                        type="ionicon"
                        name="caret-up"
                        size={24}
                        color={search.growth == 1 ? appcolor.success : appcolor.grey}
                        containerStyle={styles.iconStatus}
                        iconStyle={{ padding: 8 }}
                        onPress={() => onTouchGrowth(1)} />
                    <Icon
                        type="ionicon"
                        name="ellipse"
                        size={18}
                        color={search.growth == 0 ? appcolor.greylight : appcolor.grey}
                        containerStyle={styles.iconStatus}
                        iconStyle={{ padding: 8 }}
                        onPress={() => onTouchGrowth(0)} />
                    <Icon
                        type="ionicon"
                        name="caret-down"
                        size={24}
                        color={search.growth == -1 ? appcolor.redgray : appcolor.grey}
                        containerStyle={styles.iconStatus}
                        iconStyle={{ padding: 8 }}
                        onPress={() => onTouchGrowth(-1)} />
                </View>
            </View>
            <SearchData
                placeholder={'Tìm kiếm theo SKU'}
                containerStyle={styles.searchContainer}
                inputStyle={styles.searchInput}
                value={search.text}
                onSearchData={onSearchData}
            />
            <View style={styles.contentTableView}>
                {renderHeader()}
                <FlashList
                    keyExtractor={(_item, index) => index.toString()}
                    data={dataMain}
                    extraData={[dataMain]}
                    estimatedItemSize={50}
                    renderItem={renderItem}
                    ListHeaderComponent={renderItemTotal}
                    ListFooterComponent={<View style={styles.bottomView} />}
                    drawDistance={dataMain.length * 100}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                />
            </View>
        </View>
    )
}

export default HorizontalPage;