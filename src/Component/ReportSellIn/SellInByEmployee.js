import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity, Modal, SafeAreaView, StatusBar, Platform, ScrollView, Image } from "react-native";
import { Badge, Divider, Icon as ICO } from '@rneui/themed';
import Icon from '@react-native-vector-icons/fontawesome6';
import { getConfirmSellInList, getSellInByServer, getStoreBySellIn } from '../../Controller/SellInController';
import { groupDataByKey, removeVietnameseTones, ToastError, ToastSuccess } from "../../Core/Helper";
import { Calendar } from "react-native-calendars";
import FormGroup from "../../Content/FormGroup";
import moment from 'moment';
////import { NumericFormat } from "react-number-format";;
import { HeaderCustom } from "../../Content/HeaderCustom";
import { useSelector } from "react-redux";
import { scaleSize } from "../../Themes/AppsStyle";
import { SellInAPI } from "../../API/SellInApi";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { alertConfirm, deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
import { useFocusEffect } from "@react-navigation/native";
import _ from 'lodash'
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { LoadingView } from "../../Control/ItemLoading";
import { REPORT } from "../../API/ReportAPI";
import { URLDEFAULT } from "../../Core/URLs";
import ViewPictures from "../../Control/Gallary/ViewPictures";

const SellInByEmployee = ({ navigation, route }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [searchText, setSearchText] = useState('')
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [tabList, setTabList] = useState([])
    const [dataStore, setDataStore] = useState([])
    const [dataConfirmValue, setDataConfirmValue] = useState([])
    const [dataStoreFilter, setDataStoreFilter] = useState([])
    const [visibleOption, setVisibleOption] = useState(false)
    const [isDetlete, setDelete] = useState(0)
    const [titleDelete, setTitleDelete] = useState('Xóa')
    const [isCreateView, setCreateView] = useState(false)
    const [isConfirm, setConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [photoViewer, setPhotoViewer] = useState({ visible: false, photos: [], index: 0 })
    const [itemShopChoose, setChooseShop] = useState({ "ShopName": 'Tìm kiếm', "ShopId": 0, "FromDate": '', "ToDate": '' })
    const [dataCalendar, setDataCalendar] = useState({
        "markedDatesDefault": { [moment(new Date()).format('YYYY-MM-DD').toString()]: { selected: true, marked: true, selectedColor: appcolor.yellowdark } },
        "markingTypeDefault": 'custom',
        "markingType": 'custom',
        "markedDates": { [moment(new Date()).format('YYYY-MM-DD').toString()]: { selected: true, marked: true, selectedColor: appcolor.yellowdark } },
        "isStartDay": false,
        "isEndDay": false,
        "startDate": '',
        "endDate": ''
    })
    const [_mutate, setMutate] = useState(false)
    const tabRef = useRef()
    const listReport = JSON.parse(route?.params?.menuitem?.reportItem || '{}')

    const loadData = async () => {
        await setLoading(true)
        setDelete(0)
        const lstStore = await getStoreBySellIn()
        const confirmValue = await getConfirmSellInList()
        await setDataConfirmValue(confirmValue)
        await setDataStore(lstStore)
        await setDataStoreFilter(lstStore)
        await getDataSellIn(itemShopChoose)
        const config = JSON.parse(kpiinfo?.reportItem || '{}')
        setConfirm((config?.isConfirm || 0) == 1)
        await setLoading(false)
    }
    // console.log('kpiinfo', kpiinfo)
    const getDataSellIn = async (dataChoose) => {
        await setData([])
        await setDataMain([])
        await setTabList([])
        const dataFilter = {
            shopId: dataChoose.ShopId || 0,
            fromDate: dataChoose.FromDate || null,
            toDate: dataChoose.ToDate || null,
            reportId: kpiinfo.id
        }

        await REPORT.GetDataReportByShop_RealTime(dataFilter, async (mData, message) => {
            message && ToastError(message)
            const itemData = Array.isArray(mData) ? mData[0] : mData
            const jsonData = JSON.parse(itemData?.jsonData || '[]')
            if (jsonData.length > 0) {
                const { arr } = groupDataByKey({
                    arr: jsonData,
                    key: "workDate"
                })
                const groupList = _.uniqBy(jsonData, 'statusOrder')

                await setTabList(groupList)
                await setDataMain(arr)
                await setData(arr)
            }
        })
    }
    const downloadDataByShop = async () => {
        let dataSend = {
            "ShopName": itemShopChoose.ShopName,
            "ShopId": itemShopChoose.ShopId,
            "FromDate": dataCalendar.startDate ? moment(dataCalendar.startDate).format('YYYYMMDD') : '',
            "ToDate": (dataCalendar.startDate && dataCalendar.endDate) ? moment(dataCalendar.endDate).format('YYYYMMDD') : '',
        }
        SheetManager.hide('filtersell')
        await getDataSellIn(dataSend)
    }
    const moveToCreateSellIn = () => {
        navigation.navigate('createsellinbyshop', { listReport: listReport })
        // setCreateView(true)
    }
    const resultEventCreate = async () => {
        setCreateView(false)
        await loadData()
    }
    const handlerChooseStore = async (item, index) => {
        dataStore[index].isChoose = !item.isChoose
        let dataChange = dataStore.map(i => (i.id !== item.id ? { ...i, isChoose: 0 } : i))
        await setChooseShop({ ...itemShopChoose, ShopName: item.name, ShopId: item.isChoose == 1 ? item.id : 0 })
        await setDataStore(dataChange)
        await setMutate(e => !e)
    }
    const handlerSelectCalendar = async (date) => {
        const dateString = date.dateString
        if (dateString !== null && dateString !== undefined) {
            if (dataCalendar.startDate === dateString || dateString < dataCalendar.startDate) {
                await setDataCalendar({
                    markedDates: dataCalendar.markedDatesDefault,
                    markingType: dataCalendar.markingTypeDefault,
                    isStartDay: false,
                    isEndDay: false,
                    startDate: '',
                    endDate: ''
                })
            }
            if (!dataCalendar.isStartDay) {
                const markedDates = {};
                markedDates[dateString] = { startingDay: true, color: '#ffa500', textColor: appcolor.dark }
                await setDataCalendar({
                    ...dataCalendar,
                    markedDates: markedDates,
                    markingType: 'period',
                    isStartDay: true,
                    isEndDay: false,
                    startDate: dateString,
                    endDate: ''
                })
                itemShopChoose.FromDate = moment(dateString).format('YYYYMMDD')
            } else {
                const markedDates = dataCalendar.markedDates
                //
                let startDate = moment(dataCalendar.startDate);
                let endDate = moment(dateString);
                let range = endDate.diff(startDate, 'days')

                if (range > 0) {
                    for (let i = 1; i <= range; i++) {
                        let tempDate = startDate.add(1, 'day');
                        tempDate = moment(tempDate).format('YYYY-MM-DD')
                        if (i < range) {
                            markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
                        } else {
                            markedDates[tempDate] = { endingDay: true, color: '#ffa500', textColor: 'white' };
                        }
                    }
                    await setDataCalendar({
                        ...dataCalendar,
                        markedDates: markedDates,
                        markingType: 'period',
                        isStartDay: false,
                        isEndDay: true,
                        startDate: dataCalendar.startDate,
                        endDate: moment(dateString).format('YYYY-MM-DD')
                    })
                    itemShopChoose.FromDate = moment(dataCalendar.startDate).format('YYYYMMDD')
                    itemShopChoose.ToDate = moment(dateString).format('YYYYMMDD')
                }
            }
        } else {
            await setDataCalendar({
                ...dataCalendar,
                markedDates: dataCalendar.markedDatesDefault,
                markingType: dataCalendar.markingTypeDefault,
                isStartDay: false,
                isEndDay: false,
                startDate: '',
                endDate: ''
            })
        }
    }
    const onLongPressDel = (item) => {
        setVisibleOption(true)
        setDelete(1)
        setTitleDelete('Xóa (1)')
        const indexItem = data.findIndex(it => it.orderId == item.orderId)
        data[indexItem].isChoose = 1
        setMutate(e => !e)
    }
    const onSelectItemDel = (item, index) => {
        if (item.isChoose == 0) {
            setDelete(isDetlete + 1)
            setTitleDelete('Xóa (' + (isDetlete + 1) + ")")
        } else {
            setDelete(isDetlete - 1)
            setTitleDelete('Xóa (' + (isDetlete - 1) + ")")
        }
        const indexItem = data.findIndex(it => it.orderId == item.orderId)
        data[indexItem].isChoose = item.isChoose == 1 ? 0 : 1
        setMutate(e => !e)
    }
    const showFilter = () => {
        // setModalVisible(true)
        SheetManager.show('filtersell')
    }
    const handlerFilterShop = async (value) => {
        setSearchText(value)
        let dataFilter = []
        if (value !== null && value !== undefined && value.length > 0) {
            dataFilter = dataStoreFilter.filter(i => i.name.toLowerCase().match(value.toLowerCase()))
        } else {
            dataFilter = dataStoreFilter
        }
        await setDataStore(dataFilter)
    }
    const onFilterOrder = (text) => {
        const valueSearch = removeVietnameseTones(text)
        const lstFilter = _.filter(dataMain, (e) => {
            return removeVietnameseTones(e.productName).toLowerCase().match(valueSearch.toLowerCase()) ||
                removeVietnameseTones(e.shopName).toLowerCase().match(valueSearch.toLowerCase()) ||
                removeVietnameseTones(e.orderNo).toLowerCase().match(valueSearch.toLowerCase())
        })
        setData(lstFilter)
    }
    const handlerUpdateOrder = async (item, confirmed, statusUpdate) => {
        alertConfirm(statusUpdate, `Xác nhận ${statusUpdate} đơn hàng này không ?`, async () => {
            item.confirmed = confirmed
            const result = await SellInAPI.UpdateOrder(JSON.stringify(item))
            if (result.statusId == 200) {
                ToastSuccess(result.messager)
                loadData()
            } else
                ToastError(result.messager)
        }, () => { }, 'Đồng ý', 'Huỷ')
    }
    //
    const renderItemShop = ({ item, index }) => {
        const isChooseStyle = item.isChoose == 1 ? appcolor.yellowdark : appcolor.grayLight
        const onPressItem = () => {
            handlerChooseStore(item, index)
        }
        return (
            <TouchableOpacity onPress={onPressItem} >
                <View style={{ ...styles.itemShopStyle, backgroundColor: isChooseStyle }} key={index}>
                    <Text style={{ width: '100%', fontSize: 16, color: appcolor.dark }}>{(index + 1) + '. ' + item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    const renderItem = ({ item, index }) => {
        let photos = []
        if (item.isParent) {
            data.filter(it => it.workDate == item.workDate).forEach(it => {
                if (Array.isArray(it.photos)) {
                    photos.push(...it.photos)
                } else if (typeof it.photos === 'string') {
                    try {
                        photos.push(...JSON.parse(it.photos || '[]'))
                    } catch { }
                }
            })
            photos = _.uniqBy(photos, 'photoPath')
        }

        const onPressItem = () => {
            onSelectItemDel(item, index)
        }
        const onLongPressItem = () => {
            onLongPressDel(item, index)
        }
        const onShowPhoto = (photoIndex) => {
            setPhotoViewer({ visible: true, photos, index: photoIndex })
        }
        return (
            <View key={"daa200-" + index}>
                {item.isParent && <RenderItemText appcolor={appcolor} type="Header" titleName="" itemValue={moment(item.date).format('dddd DD/MMM/YY')} />}
                {item.isParent && photos.length > 0 && (
                    <View style={styles.groupPhotoContainer}>
                        <Text style={styles.photoTitle}>{`${photos.length} hình ảnh`}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {photos.map((photo, photoIndex) => (
                                <TouchableOpacity
                                    key={`${photo.photoPath}_${photoIndex}`}
                                    activeOpacity={0.7}
                                    style={styles.photoItem}
                                    onPress={() => onShowPhoto(photoIndex)}
                                >
                                    <Image
                                        source={{
                                            uri: photo.photoPath?.includes('http') || photo.photoPath?.includes('file://')
                                                ? photo.photoPath
                                                : `${URLDEFAULT}${photo.photoPath}`
                                        }}
                                        resizeMode="cover"
                                        style={styles.photoImage}
                                    />
                                    {photo.photoTime && (
                                        <Text style={styles.photoTime}>
                                            {moment(photo.photoTime).format('HH:mm - DD/MM/YYYY')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onLongPress={item.confirmBy == null ? onLongPressItem : null}
                    onPress={(visibleOption && item.confirmBy == null) ? onPressItem : null}
                >
                    <View style={{ width: '100%', alignSelf: 'center' }}>
                        <View style={styles.itemStyle} key={index}>
                            {/* Status Order */}
                            {item.statusOrder !== null && item.statusOrder !== undefined && <RenderItemText appcolor={appcolor} type="Status" titleName="Trạng thái: " itemValue={item.statusOrder} colorByRow={item.colorStatus} />}
                            {item.confirmBy != null && <RenderItemText appcolor={appcolor} type="Status" titleName="Xác nhận bởi " itemValue={item.confirmByName} colorByRow={item.colorStatus} />}
                            {/* Detail Products */}
                            <RenderItemText appcolor={appcolor} type="Info" titleName="Mã đơn hàng: " itemValue={item.orderNo} />
                            <RenderItemText appcolor={appcolor} type="Info" titleName="NPP: " itemValue={item.dealerName} />
                            <RenderItemText appcolor={appcolor} type="ShopName" titleName="Cửa hàng: " itemValue={item.shopName} />
                            <RenderItemText appcolor={appcolor} type="Info" titleName="Sản phẩm: " itemValue={item.categoryName + " " + item.productName} />
                            {(item.priceCount !== null && item.priceCount !== undefined && item.priceCount !== '') && <RenderItemText appcolor={appcolor} type="PriceCount" itemValue={item.priceCount} />}
                            {(item.price !== null && item.price !== undefined && item.price !== 0) && <RenderItemText appcolor={appcolor} type="Price" titleName="Giá: " itemValue={item.price} />}
                            {(item.priceNPP !== null && item.priceNPP !== undefined && item.priceNPP !== 0) && <RenderItemText appcolor={appcolor} type="PriceNPP" titleName="Giá NPP: " itemValue={item.priceNPP} />}
                            {item.isConfirm == 1 &&
                                <View style={{ borderTopWidth: 0.3, borderTopColor: appcolor.greydark, marginTop: 5 }}>
                                    <ScrollView style={{ width: '100%', padding: 8 }} horizontal showsHorizontalScrollIndicator={false}>
                                        {dataConfirmValue.map((it, idx) => {
                                            const onPressValue = () => {
                                                handlerUpdateOrder(item, it.numberValue, it.name)
                                            }
                                            return (
                                                <TouchableOpacity key={`${idx}_AA`} onPress={onPressValue} style={styles.buttonAction} >
                                                    <Text style={{ ...styles.textButtonAction, color: appcolor[it.isColor] }}>{it.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                            }
                        </View>
                        {item.isChoose == 0 ?
                            <Badge
                                containerStyle={{ alignSelf: 'center', position: 'absolute', right: 10, top: '40%' }}
                                textStyle={{ fontSize: 15, fontWeight: '500', color: appcolor.light }}
                                badgeStyle={{ backgroundColor: item.confirmBy != null ? appcolor.success : appcolor.primary, height: 40, width: 40, borderRadius: 20 }}
                                value={item.quantityValue} />
                            :
                            <TouchableOpacity style={{ alignSelf: 'center', position: 'absolute', right: 10, top: '40%' }}>
                                <ICO name='check' reverse style={{ textAlign: 'center' }}
                                    color={appcolor.danger} size={18} />
                            </TouchableOpacity>
                        }
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    useFocusEffect(
        useCallback(() => {
            loadData()
            return () => false;
        }, [])
    );

    const styles = StyleSheet.create({
        actionView: { position: 'absolute', bottom: 38, end: 16, zIndex: 5, padding: 16, backgroundColor: appcolor.blacklight, borderRadius: 50, opacity: 0.9 },
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        buttonContainer: { borderRadius: 10, position: 'absolute', top: 0, right: 0, width: '30%', height: '80%', justifyContent: "center" },
        btnDeleteStyle: { position: 'absolute', top: 5, start: 58, width: '30%' },
        btnFilterStyle: { height: '100%', position: 'absolute', top: 5, start: 12, width: '50%' },
        contentStyles: { width: '100%', height: '100%', backgroundColor: appcolor.primary },
        itemStyle: { height: 'auto', borderRadius: 8, marginBottom: 8, padding: 7, backgroundColor: appcolor.light },
        itemShopStyle: { alignSelf: 'center', width: '100%', height: 'auto', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: appcolor.surface },
        badgeStyle: { textAlign: 'center', fontSize: 15, fontWeight: "600", color: appcolor.dark },
        bottomContainer: { width: '98%', height: 'auto', alignSelf: 'center' },
        filterStyle: { width: '100%', fontSize: 13, alignSelf: 'center', borderWidth: 0.5, borderColor: appcolor.greylight },
        buttonAction: { borderRadius: 5, marginEnd: 8, marginTop: 5 },
        textButtonAction: { color: appcolor.light, fontSize: 12, fontWeight: '600', borderRadius: 3, borderWidth: 0.5, padding: 8 },
        groupPhotoContainer: { width: '100%', marginBottom: 8, padding: 12, gap: 8, backgroundColor: appcolor.light, borderRadius: 16 },
        photoTitle: { fontSize: 14, lineHeight: 18, fontWeight: '600', color: appcolor.dark },
        photoList: { gap: 12, paddingRight: 8 },
        photoItem: { width: 144, gap: 4 },
        photoImage: { width: 144, height: 112, borderRadius: 16, backgroundColor: appcolor.surface },
        photoTime: { fontSize: 12, lineHeight: 16, fontWeight: '500', color: appcolor.placeholderText },
    })
    const onDelete = async () => {
        const _list = data.filter(d => d.isChoose === 1)
        if (_list.length > 0) {
            const result = await SellInAPI.DeleleList(JSON.stringify(_list));
            if (result.statusId === 200) {
                const { arr } = await groupDataByKey({ arr: result.data, key: "workDate" })
                await setData(arr)
                ToastSuccess(`Đã xoá ${isDetlete}`)
            } else {
                await ToastError(`Có lỗi trong lúc xoá dữ liệu ${result.messager}`)
            }
            setDelete(0)
        } else {
            ToastError("Không có dữ liệu để xoá")
        }
    }
    return (
        <View style={styles.mainContainer}>
            {isDetlete > 0 ?
                <HeaderCustom
                    title={titleDelete}
                    rightFunc={onDelete} iconRight="trash"
                />
                :
                <HeaderCustom
                    leftFunc={() => navigation.goBack()}
                    title={kpiinfo.menuNameVN || 'Tìm kiếm'}
                    iconMiddle='search'
                    iconRight='plus'
                    middleFunc={showFilter}
                    rightFunc={moveToCreateSellIn}
                />
            }
            <FormGroup
                editable
                placeholder='Tìm kiếm đơn hàng'
                iconName='search'
                containerStyle={{ margin: 8 }}
                handleChangeForm={onFilterOrder}
            />
            <LoadingView isLoading={loading} title={' '} />
            <View style={{ width: '100%', height: '100%' }}>
                {tabList !== null && tabList.length > 0 && tabList[0]?.statusOrder !== undefined ?
                    <View style={{ flex: 1 }}>
                        {data !== null && data.length > 0 &&
                            <Tabs.Container
                                ref={tabRef}
                                renderTabBar={props => (
                                    <MaterialTabBar
                                        {...props}
                                        style={{ margin: 5 }}
                                        labelStyle={{ fontSize: 14, fontWeight: '700' }}
                                        indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                        inactiveColor={appcolor.greylight}
                                        activeColor={appcolor.red}
                                        tabStyle={{ margin: 5, borderRadius: 5, backgroundColor: appcolor.surface, minWidth: minWidthTab(tabList), height: 38 }}
                                        scrollEnabled={true}
                                    />
                                )}
                                containerStyle={{ backgroundColor: appcolor.surface }}>
                                {tabList.length > 0 && tabList.map((it, i) => {
                                    let dataItem = _.filter(data, { statusOrder: it.statusOrder })
                                    const { arr } = groupDataByKey({
                                        arr: dataItem,
                                        key: 'date'
                                    })
                                    const title = `${it.statusOrder} (${dataItem.length || 0})`
                                    return (
                                        <Tabs.Tab key={`iod_${i}`} label={title} name={title} >
                                            <View style={{ marginTop: 62, padding: 5, width: deviceWidth }}>
                                                <FlatList
                                                    key={'lstconfirmorder'}
                                                    extraData={arr}
                                                    keyExtractor={(_item, index) => index.toString()}
                                                    data={arr}
                                                    removeClippedSubviews
                                                    renderItem={renderItem}
                                                    showsVerticalScrollIndicator={false}
                                                    refreshControl={<RefreshControl
                                                        refreshing={false}
                                                        onRefresh={loadData}
                                                    />}
                                                    ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                                                />
                                            </View>
                                        </Tabs.Tab>
                                    )
                                })}
                            </Tabs.Container>
                        }
                    </View>
                    :
                    <FlatList
                        style={{ width: '100%', height: '100%', padding: 8, marginBottom: 120 }}
                        key='dataSellIn'
                        keyExtractor={(_, index) => index.toString()}
                        data={data}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl
                                progressBackgroundColor={appcolor.warning}
                                colors={[appcolor.info, appcolor.danger, appcolor.warning]}
                                titleColor={appcolor.black}
                                tintColor={appcolor.black}
                                refreshing={loading}
                                title="Đang tải dữ liệu"
                                onRefresh={downloadDataByShop} />
                        }
                        ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                    />
                }
                {/* Filter */}
                <ActionSheet
                    id="filtersell"
                    initialOffsetFromBottom={1}
                    statusBarTranslucent
                    drawUnderStatusBar={Platform.OS == 'ios'}
                    gestureEnabled
                >
                    <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 12, backgroundColor: appcolor.light }}>
                        {/* Header */}
                        <View style={{ width: '100%', flexDirection: 'row', padding: 12 }}>
                            <Text style={{
                                textAlignVertical: 'center', start: 0, flexGrow: 1, color: appcolor.dark
                            }}>
                                Tìm kiếm cửa hàng
                            </Text>
                            <TouchableOpacity>
                                <Icon name='search' size={20} color={appcolor.primary} onPress={downloadDataByShop} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                        <Calendar
                            firstDay={1}
                            current={moment().format("yyyy-MM-DD")}
                            monthFormat={'MM - yyyy'}
                            hideExtraDays={true}
                            onPressArrowLeft={subtractMonth => subtractMonth()}
                            onPressArrowRight={addMonth => addMonth()}
                            theme={{
                                backgroundColor: appcolor.light,
                                calendarBackground: appcolor.light,
                                todayTextColor: appcolor.highlightDate,
                                selectedDayTextColor: 'blue',
                                dayTextColor: appcolor.dark,
                                monthTextColor: appcolor.dark
                            }}
                            markingType={dataCalendar.markingType}
                            markedDates={dataCalendar.markedDates}
                            onDayPress={handlerSelectCalendar}
                        />
                        <FormGroup
                            containerStyle={{ borderWidth: 0.3 }}
                            placeholder={"Tìm kiếm cửa hàng"} editable iconName='search'
                            value={searchText}
                            onClearTextAndroid={handlerFilterShop}
                            handleChangeForm={handlerFilterShop}
                        />
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                        <FlatList
                            style={{ width: '100%', padding: 8 }}
                            key='dataStoreList'
                            keyExtractor={(_, index) => index.toString()}
                            data={dataStore}
                            renderItem={renderItemShop}
                        />
                    </SafeAreaView>
                </ActionSheet>
            </View>
            <ViewPictures
                visible={photoViewer.visible}
                images={photoViewer.photos}
                initialIndex={photoViewer.index}
                onSwipeDown={() => setPhotoViewer({ visible: false, photos: [], index: 0 })}
            />
            {/* {isCreateView &&
                <Fragment>
                    {Platform.OS === 'ios' && <SafeAreaView style={{ backgroundColor: appcolor.primary }} />}
                    <View style={{ paddingTop: StatusBar.currentHeight }}>
                        <CreateSellInByShop navigation={navigation} resultEvent={resultEventCreate} dataWork={route?.params.workinfo} listReport={listReport} />
                    </View>
                </Fragment>
            } */}
        </View >
    )
}
const RenderItemText = ({ type, titleName, itemValue, appcolor, colorByRow = '#000' }) => {
    const colorItem = appcolor.dark
    return (
        <View style={{ width: '100%', height: 'auto' }}>
            <View style={{ width: '90%', padding: 3 }}>
                {type == "Status" && <Text style={{ fontSize: 13, fontWeight: "700", color: appcolor[colorByRow || 'dark'], fontStyle: 'italic' }}>{titleName}{itemValue}</Text>}
                {type == "Header" && <Text style={{ alignSelf: 'center', width: '100%', fontSize: 16, fontWeight: "700", color: colorItem, margin: 8 }}>{titleName}{itemValue}</Text>}
                {type == "ShopName" && <Text style={{ width: '100%', fontSize: scaleSize(14), color: colorItem, fontWeight: "600" }}>{titleName}{itemValue}</Text>}
                {type == "Info" && <Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{itemValue}</Text>}
                {type == "PriceCount" && <Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{itemValue}</Text>}
                {type == "Price" &&
                    <NumericFormat
                        key='quantity'
                        value={itemValue}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={values =>
                            <Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{values}</Text>
                        }
                    />
                }
                {type == "PriceNPP" &&
                    <NumericFormat
                        key='quantity'
                        value={itemValue}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={values =>
                            <Text style={{ width: '100%', fontSize: scaleSize(12), color: colorItem }}>{titleName}{values}</Text>
                        }
                    />
                }
            </View>
        </View>
    )
}
export default SellInByEmployee;
