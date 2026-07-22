import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, StyleSheet, FlatList, RefreshControl, Text, Platform, KeyboardAvoidingView, Modal, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { GetListInventory, UploadInventoryByEmployee } from "../../Controller/StockOutController";
import { groupDataByKey, isNotInteger } from "../../Core/Helper";
import FormGroup from "../../Content/FormGroup";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { DEFAULT_COLOR } from "../../Core/URLs";
////import { NumericFormat } from "react-number-format";;
import Icon from '@react-native-vector-icons/fontawesome6';
import { Divider } from '@rneui/themed';
import { getStoreBySellIn } from '../../Controller/SellInController'
import { Calendar } from "react-native-calendars";
import moment from 'moment';
import { ConvertToInt, alertNotify, deviceWidth, minWidthTab } from "../../Core/Utility";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { useSelector } from "react-redux";
import ActionSheet from "react-native-actions-sheet";
const InventoryByEmployee = React.forwardRef((props, ref) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [searchProductText, setSearchProduct] = useState('')
    const [searchText, setSearchText] = useState('')
    const [dataTab, setDataTab] = useState([])
    const _sheet = useRef()
    const [mData, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [loading, setLoading] = useState(false)
    const [dataStore, setDataStore] = useState([])
    const [dataStoreFilter, setDataStoreFilter] = useState([])
    const [dateSelect, setDateSelect] = useState(ConvertToInt(moment(new Date()).format('YYYYMMDD')))
    //..
    const [itemShopChoose, setChooseShop] = useState({ "ShopName": 'Tìm kiếm cửa hàng', "ShopId": 0, "WorkDate": ConvertToInt(moment(new Date()).format('YYYYMMDD')) })
    const [dataCalendar, setDataCalendar] = useState({
        "markingType": 'custom',
        "markedDates": { [moment(new Date()).format('YYYY-MM-DD').toString()]: { selected: true, marked: true, selectedColor: appcolor.yellowdark } }
    })
    //..
    const [_, setMutate] = useState(false)

    const LoadData = async () => {
        const lstStore = await getStoreBySellIn()
        await setDataStore(lstStore)
        await setDataStoreFilter(lstStore)
        await getDataStock(itemShopChoose)
    }
    const getDataStock = async (dataChoose) => {
        setLoading(true)
        await GetListInventory(dataChoose, async (dataResult) => {
            await setData([])
            await setDataMain([])
            await setDataTab([])

            await setData(dataResult)
            await setDataMain(dataResult)
            await setDataTab(dataResult.length > 0 ? JSON.parse(dataResult[0].tabData) : [])
        })
        setLoading(false)
    }
    const downloadDataByShop = async () => {
        let dataSend = {
            "ShopName": itemShopChoose.ShopName,
            "ShopId": itemShopChoose.ShopId,
            "WorkDate": dateSelect
        }
        await _sheet.current.hide()
        await getDataStock(dataSend)
    }
    const uploadData = async () => {
        let dataUpload = []
        dataMain.map(i => {
            if (i.stock !== '' && i.stock !== null && !isNaN(i.stock)) {
                let itemSave = {
                    ShopId: i.shopId,
                    WorkDate: i.workDate,
                    ProductId: i.productId,
                    Stock: parseInt(i.stock)
                }
                dataUpload.push(itemSave)
            }
        })
        // console.log(dataUpload);
        await UploadInventoryByEmployee(JSON.stringify(dataUpload), (message) => {
            alertNotify(message)
        })
    }
    const onChangeValue = async (index, item, text, type) => {
        console.log(index, item, "r" + text, type, 'item on change')
        mData[item.indexMain].stock = isNotInteger(text) ? null : text
        dataMain[item.indexMain].stock = isNotInteger(text) ? null : text
        await setMutate(e => !e)
    }
    const handlerFilter = async (value) => {
        setSearchText(value)
        let dataFilter = []
        if (value !== null && value !== undefined && value.length > 0) {
            dataFilter = dataStoreFilter.filter(i => i.name.toLowerCase().match(value.toLowerCase()))
        } else {
            dataFilter = dataStoreFilter
        }
        await setDataStore(dataFilter)
    }
    const handlerFilterProduct = async (value) => {
        setSearchProduct(value)
        let dataFilter = []
        if (value && value !== null && value !== undefined && value.length > 0) {
            dataFilter = dataMain.filter(i => i.productName.toLowerCase().match(value.toLowerCase()))
        } else {
            dataFilter = dataMain
        }
        await setData(dataFilter)
    }
    const handlerSelectCalendar = async (date) => {
        const dateString = date.dateString
        const markedDates = {};
        markedDates[dateString] = { selected: true, marked: true, selectedColor: appcolor.yellowdark }
        await setDataCalendar({ ...dataCalendar, markedDates: markedDates })
        await setDateSelect(ConvertToInt(moment(dateString).format('YYYYMMDD')))
    }
    const handlerChooseStore = async (item, index) => {
        dataStore[index].isChoose = !item.isChoose
        let dataChange = dataStore.map(i => (i.id !== item.id ? { ...i, isChoose: 0 } : i))

        await setChooseShop({ ...itemShopChoose, ShopName: item.name, ShopId: item.isChoose == 1 ? item.id : 0 })
        await setDataStore(dataChange)
        await setMutate(e => !e)
    }
    const renderTabView = () => {
        let dataInventory = []
        return (
            dataTab !== undefined && dataTab.map(item => {
                dataInventory = mData.filter(i => i.categoryId === item.tabId)
                const { arr } = groupDataByKey({
                    arr: dataInventory,
                    key: "subCategoryName"
                })
                return (
                    <Tabs.Tab key={`${item.tabId}dask`} name={item.tabName}>
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            <KeyboardAvoidingView
                                style={{ width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', padding: 8 }}
                                behavior={Platform.OS == "ios" ? "padding" : null}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} >
                                <FlatList
                                    style={{
                                        width: '100%', height: '98%',
                                        marginBottom: Platform.OS == 'ios' ? 30 : 0
                                    }}
                                    keyExtractor={(_, index) => index.toString()}
                                    data={arr} showsVerticalScrollIndicator={false}
                                    renderItem={renderItem}
                                    refreshControl={
                                        <RefreshControl
                                            progressBackgroundColor={appcolor.warning}
                                            colors={[appcolor.info, appcolor.danger, appcolor.warning]}
                                            titleColor={appcolor.black}
                                            tintColor={appcolor.black}
                                            refreshing={loading}
                                            title="Đang tải dữ liệu"
                                            onRefresh={LoadData} />
                                    }
                                />
                            </KeyboardAvoidingView>
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    const renderItem = ({ item, index }) => {
        // index < 4 && console.log(item);
        return (
            <View key={"8900" + index} style={{ flex: 1 }}>
                {
                    item.isParent && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name='tags' style={{ color: DEFAULT_COLOR }} />
                        <Text style={styles.titleSubCategory}>{item.subCategoryName}</Text>
                    </View>
                }
                <View style={styles.viewProduct}>
                    <Text style={styles.titleProduct}>{(index + 1) + ". " + item.productName}</Text>
                    <RenderInputNumber
                        index={index}
                        type={'QUANTITY'} styles={styles} itemInput={item} valueInput={item.stock}
                        placeholder={"Số lượng"}
                        onChangeText={onChangeValue}
                        appcolor={appcolor}
                    />
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </View>
        )
    }
    const renderItemShop = ({ item, index }) => {
        const isChooseStyle = item.isChoose == 1 ? appcolor.primary : appcolor.light
        const onPressItem = () => {
            handlerChooseStore(item, index)
        }
        return (
            <TouchableOpacity key={"shss" + index} onPress={onPressItem} >
                <View style={{ backgroundColor: isChooseStyle }} key={index}>
                    <Text style={{
                        width: '100%', textAlignVertical: 'center',
                        padding: 7, color: appcolor.dark
                    }}>{(index + 1) + '. ' + item.name}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </TouchableOpacity>
        )
    }
    useEffect(() => {
        LoadData()
        return () => false
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        titleSubCategory: { color: appcolor.primary, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 7, marginLeft: 5, textAlignVertical: 'center' },
        titleProduct: { width: '65%', fontWeight: '500', color: appcolor.dark, fontSize: 14, padding: 8 },
        viewProduct: {
            backgroundColor: appcolor.light, borderRadius: 5, margin: 5, padding: 5,
            flexDirection: 'row', alignItems: 'center'
        },
        inputNumber: {
            backgroundColor: appcolor.light, color: appcolor.dark, width: '100%',
            borderWidth: 2, borderColor: appcolor.surface, padding: 5, textAlign: 'right'
        },
        ViewInput: { width: '30%', margin: 5 },
        itemShopStyle: {
            alignSelf: 'center', width: '100%', height: 'auto', color: appcolor.dark, borderRadius: 8,
            padding: 7, marginBottom: 8, backgroundColor: appcolor.light
        },
        bottomContainer: { width: '98%', alignSelf: 'center' },
        btnFilterStyle: { height: '100%', marginTop: 8 },
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                leftFunc={() => props.navigation.goBack()}
                title={props.route?.params.titlePage || 'Báo cáo tồn kho'}
                iconRight='cloud-upload-alt'
                rightFunc={uploadData}
            />
            <TouchableOpacity onPress={() => _sheet.current.show()}>
                <View style={{
                    backgroundColor: appcolor.primary, flexDirection: 'row', zIndex: 1, padding: 7, marginTop: 1
                }}>
                    <Text style={{ flexGrow: 1, color: appcolor.white, fontWeight: '600' }}>
                        {itemShopChoose.ShopName}</Text>
                    <Icon name='filter' color={appcolor.white} size={21} solid />
                </View>
            </TouchableOpacity>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            {
                dataTab?.length > 0 &&
                <Tabs.Container
                    allowHeaderOverscroll
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.light }}
                            tabStyle={{ minWidth: minWidthTab(dataTab ? dataTab : 1), height: 42 }}
                        />
                    )}>
                    {
                        renderTabView()
                    }
                </Tabs.Container>
            }
            <View style={styles.bottomContainer} >
                <ActionSheet style={{ backgroundColor: appcolor.transparent }}
                    ref={_sheet}>
                    <View style={{
                        flexDirection: 'row', padding: 12
                    }}>
                        <Text style={{ flexGrow: 1, color: appcolor.dark, start: 0, textAlignVertical: 'center' }} >
                            Danh sách cửa hàng
                        </Text>
                    </View>
                    <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <SafeAreaView style={{ padding: 12 }}>
                            {/* Content */}
                            <Calendar
                                firstDay={1}
                                current={moment().format("yyyy-MM-DD")}
                                monthFormat={'MM - yyyy'}
                                hideExtraDays={true}
                                onPressArrowLeft={subtractMonth => subtractMonth()}
                                onPressArrowRight={addMonth => addMonth()}
                                theme={{
                                    borderRadius: 10,
                                    backgroundColor: appcolor.surface,
                                    calendarBackground: appcolor.surface,
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
                                containerStyle={{ ...styles.filterStyle, marginTop: 8 }}
                                placeholder={"Tìm kiếm cửa hàng"} editable multiline iconName='search'
                                value={searchText}
                                onClearTextAndroid={handlerFilter}
                                handleChangeForm={handlerFilter}
                            />
                            <FlatList
                                key='dataStoreList'
                                scrollEnabled={false}
                                keyExtractor={(_, index) => index.toString()}
                                data={dataStore}
                                renderItem={renderItemShop}
                            />

                        </SafeAreaView>
                    </ScrollView>
                    <TouchableOpacity onPress={downloadDataByShop}>
                        <View style={{ backgroundColor: appcolor.light, padding: 12 }}>
                            <Text style={{ textAlign: 'center', color: appcolor.primary }}>Áp dụng</Text>
                        </View>
                    </TouchableOpacity>
                </ActionSheet>
            </View>
        </View >
    )
})
const RenderInputNumber = ({ styles, valueInput, index, itemInput, placeholder, type, onChangeText, editable, appcolor }) => {
    // index < 10 && console.log(valueInput, 'check input');
    const onChange = async (item, text, type) => {
        await onChangeText(index, item, text, type)
    }
    return (
        <View style={styles.ViewInput} >
            <NumericFormat
                value={valueInput == 0 ? 0 : (valueInput || '')}
                displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                renderText={values => <TextInput
                    editable={editable}
                    keyboardType='numeric'
                    onChangeText={text => onChange(itemInput, text, type)}
                    style={styles.inputNumber}
                    placeholder={placeholder}
                    placeholderTextColor={appcolor.greydark}
                    selectTextOnFocus
                >{values}</TextInput>}
            />
        </View>
    )
}

export default InventoryByEmployee;