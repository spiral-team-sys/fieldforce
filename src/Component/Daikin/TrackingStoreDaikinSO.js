import React, { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { isPhone, ToastError, ToastSuccess } from "../../Core/Helper";
import { GetListTrackingStore, uploadTrackingStore } from "../../Controller/TrackingDetailController";
// import NumberFormat from "react-number-format";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import _ from "lodash";
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab, removeAccents } from "../../Core/Utility";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { CheckBox, Divider, Icon } from '@rneui/themed';
import { LoadingView } from "../../Control/ItemLoading";
import { GetShopManager } from "../../Controller/ShopController";
import { URLDEFAULT } from "../../Core/URLs";

const listSelect = [
    { id: 0, name: 'No', nameVN: 'Không' },
    { id: 1, name: 'Yes', nameVN: 'Có' }
]

export const TrackingStoreDaikinSO = ({ navigation, route }) => {
    const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataListMaster: [], dataGroup: [] })
    const [listShop, setListShop] = useState([])
    const [listShopM, setListShopM] = useState([])
    const [itemShop, setItemShop] = useState({})
    const [loading, setLoading] = useState(false)
    const [showTracking, setShowTracking] = useState(false)
    const [search, setSearch] = useState('')

    const loadData = async () => {
        await setLoading(true)
        const result = await GetShopManager();
        setListShop(result.data)
        setListShopM(result.data)
        await setLoading(false)
    }

    const loadDataByShop = async (shopId) => {
        await setLoading(true)
        await GetListTrackingStore(shopId, kpiinfo.id, async (dataTracking) => {
            const groupTab = _.uniqBy(dataTracking?.table1 || [], 'groupId')
            await setData({ dataListMaster: dataTracking?.table1, dataGroup: groupTab })
            await setItemShop(dataTracking.table[0])
            await setShowTracking(true)
            dataTracking.table?.length > 0 && await setLoading(false)
        })

    }

    useEffect(() => {
        loadData()
        return () => false
    }, [])

    const onNumberChanged = (item, text) => {
        if (item.decimalValue == 1) {
            const validator = /^[+-]?\d*(?:[.,]\d*)?$/;
            if (validator.test(text)) {
                text = text.replace(",", ".") //this is optional
                itemShop[item.ref_Code] = text
            }
            else {
                itemShop[item.ref_Code] = text.substring(0, text.length - 1)
            }
        } else {
            let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
            let intValue = value === null ? null : parseInt(value);
            if ((intValue > 0 || intValue === 0) && intValue != null) {
                itemShop[item.ref_Code] = intValue
            } else {
                itemShop[item.ref_Code] = null
            }
        }
    }

    const onTextChanged = (item, text) => {
        if (item.ref_Code.includes('VN')) {
            const fieldItem = item.ref_Code.replace("VN", "")
            itemShop[fieldItem] = removeAccents(text)
        }
        itemShop[item.ref_Code] = text
    }
    const onSelectAddress = (item, itemRegion) => {
        itemShop[item.ref_Code] = itemRegion.regionId
    }
    const onChangePhone = (item, text) => {
        if (text !== null) {
            let itemValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
            if (text?.length == 10)
                itemValue = text.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
            (!itemShop[item.ref_Code] || itemValue == '' || itemValue?.length < 11) && (itemShop[item.ref_Code] = itemValue)
        } else {
            itemShop[item.ref_Code] = null
        }
    }
    const onSelectCheck = (item, it) => {
        itemShop[item.ref_Code] = it.id
    }

    const onCloseSheet = (item, dataSelect) => {
        const arrFilter = dataSelect.filter(it => it.isSelect == true)
        if (dataSelect.length > 0) {
            if (arrFilter.length > 0) {
                itemShop[item.ref_Code] = arrFilter[0].Id
            } else {
                itemShop[item.ref_Code] = 0
            }
        }
    }

    const uploadData = async () => {
        const checkPhone = isPhone(itemShop.phone)
        if (!checkPhone) {
            ToastError('Số điện thoại sai định dạng')
            return
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        await uploadTrackingStore(itemShop.shopId, itemShop, async (result) => {

            if (result.status == 200 || result.statusId == 200) {
                ToastSuccess(result.messeger)
                // await loadData()
            } else
                ToastError(result.messeger)
        })
    }

    const renderItem = ({ item, index }) => {

        return (
            <TouchableOpacity
                onPress={() => loadDataByShop(item.shopId)}
                style={{ padding: 5, backgroundColor: appcolor.light, marginHorizontal: 5, marginBottom: 5, flexDirection: "row", borderRadius: 10 }}>
                <View style={{ borderRadius: 5, backgroundColor: appcolor.surface, height: 70, width: 70 }}>
                    <Image source={{ uri: item.imageUrl !== null ? (item.imageUrl.indexOf('file://') > -1 || item.imageUrl.indexOf('https://') > -1 ? item.imageUrl : URLDEFAULT + item.imageUrl) : null }}
                        style={{ width: '100%', height: '100%', borderRadius: 5 }} />
                </View>
                <View style={{ margin: 5, justifyContent: 'space-between', flex: 1 }}>
                    <View>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>{item.shopName}</Text>
                        <Text style={{ fontWeight: '300', fontSize: 12, color: appcolor.dark }}>{item.shopCode}</Text>
                    </View>
                    <Text style={{ fontWeight: '300', fontSize: 12, color: appcolor.placeholderText, fontStyle: 'italic' }}>Địa chỉ : {item.address}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const onGoBack = async () => {
        if (showTracking) {
            await setShowTracking(false)
            await setLoading(false)
        } else {
            navigation.goBack()
        }
    }

    const filterProduct = async (text) => {
        if (text) {
            const newDataShow = listShopM.filter(it => {
                const nameProduct = it.shopName ? it.shopName.toUpperCase() : ''.toUpperCase()
                const textSearch = text.toUpperCase()
                return nameProduct.indexOf(textSearch) > -1
            })
            setListShop(newDataShow)
            setSearch(text)
        } else {

            setListShop(listShopM)
            setSearch(text)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconMiddle='poll-h'
                iconRight='cloud-upload-alt'
                leftFunc={() => onGoBack()}
                rightFunc={(showTracking && !loading) ? () => uploadData() : null}
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />

            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS === "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}>
                {
                    (data.dataGroup.length > 0 && showTracking && !loading) &&
                    <View style={{ width: '100%', height: '100%' }}>
                        <Tabs.Container
                            pagerProps={{
                                scrollEnabled: false
                            }}
                            renderTabBar={props => (
                                <MaterialTabBar
                                    {...props}
                                    style={{ margin: 5 }}
                                    labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                    indicatorStyle={{ backgroundColor: appcolor.transparent }}
                                    inactiveColor={appcolor.greylight}
                                    activeColor={appcolor.info}
                                    tabStyle={{ margin: 5, borderRadius: 30, backgroundColor: appcolor.surface, minWidth: minWidthTab(data.dataGroup), height: 38 }}
                                    scrollEnabled={true}
                                />
                            )}
                            containerStyle={{ backgroundColor: appcolor.surface }}>
                            {data.dataGroup?.map((it, i) => {
                                let dataByGroup = _.filter(data.dataListMaster, (item) => { return item.groupId == it.groupId })
                                return (
                                    <Tabs.Tab key={`itemssv_${i}`} label={it.groupName} name={it.groupName} >
                                        <View style={{ flex: 1, backgroundColor: appcolor.light, marginTop: 62, padding: 5, width: deviceWidth }}>
                                            <ViewShopInfo
                                                dataByGroup={dataByGroup}
                                                onNumberChanged={onNumberChanged}
                                                onChangePhone={onChangePhone}
                                                onTextChanged={onTextChanged}
                                                onSelectAddress={onSelectAddress}
                                                onSelectCheck={onSelectCheck}
                                                itemShop={itemShop}
                                                onCloseSheet={onCloseSheet}
                                            />
                                        </View>
                                    </Tabs.Tab>
                                )
                            })}
                        </Tabs.Container>
                    </View>

                }
                {
                    (!showTracking && !loading) &&
                    <View style={{ width: '100%', height: '100%', marginTop: 10 }}>
                        <FormGroup
                            containerStyle={{ backgroundColor: appcolor.light, marginBottom: 0, width: '95%', alignSelf: 'center' }}
                            inputStyle={{ fontSize: 13, color: appcolor.dark }}
                            placeholder='Tìm kiếm sản phẩm' editable
                            // onEndEditing={() => setDone(false)}
                            onClearTextAndroid={filterProduct}
                            iconName='search'
                            useClearAndroid
                            value={search} handleChangeForm={filterProduct}
                        />
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginBottom: 7, height: 0.2 }} />
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            key={'listShop'}
                            data={listShop}
                            renderItem={renderItem}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </View>
                }
            </KeyboardAvoidingView>
        </View>
    )
}
const ViewItemSelect = ({ dataSelect, handlerCloseSheet }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_, setMutate] = useState(false)

    const onSelectItem = (item) => {
        dataSelect.map(it => it.Id !== item.Id && (it.isSelect = false))
        item.isSelect = item.isSelect ? false : true
        setMutate(e => !e)
        handlerCloseSheet()
    }

    const renderItemSelect = ({ item, index }) => {
        return (
            <TouchableOpacity
                onPress={() => onSelectItem(item)}
                style={{
                    padding: 8, minHeight: 40, justifyContent: 'center', alignItems: 'center',
                    borderRadius: 50, marginBottom: 8, backgroundColor: item.isSelect ? appcolor.light : appcolor.surface,
                    borderWidth: item.isSelect ? 1 : 0, borderColor: appcolor.tomato
                }}>
                <Text style={{ fontSize: 14, fontWeight: '400', color: item.isSelect ? appcolor.tomato : appcolor.dark, textAlign: "center" }}>{item.Name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ padding: 5, paddingBottom: 30 }}>
            <FlatList
                keyExtractor={(_, index) => index.toString()}
                data={dataSelect}
                renderItem={renderItemSelect}
            />
        </View>
    )
}

const RenderItemInput = ({ item, index, itemShop, showListSelect, onNumberChanged, onTextChanged, onSelectAddress, reloadView, onChangePhone, onSelectCheck }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const handlerOnChangeText = async (text) => {
        await onTextChanged(item, text)
        await reloadView()
    }
    const handlerOnChangeNumber = async (text) => {
        await onNumberChanged(item, text)
        await reloadView()
    }
    const handleChangePhone = async (text) => {
        await onChangePhone(item, text)
        await reloadView()
    }
    const handleSelectCheck = async (item, it) => {
        await onSelectCheck(item, it)
        await reloadView()
    }

    if (parseInt(item.numberValue) == 1) {
        return <NumberFormat
            key={`n${index}`}
            value={itemShop[item.ref_Code] ? itemShop[item.ref_Code] : ''}
            displayType={'text'}
            thousandSeparator
            renderText={value =>
                <FormGroup
                    editable={item.ref_Id !== 1 ? true : false}
                    key={index}
                    returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                    placeholder={'Số lượng ' + item.itemName}
                    value={itemShop[item.ref_Code]?.toString() || ''}
                    inputStyle={{ textAlign: 'left' }}
                    keyboardType="numeric" handleChangeForm={handlerOnChangeNumber}
                    containerStyle={{ backgroundColor: item.ref_Id == 1 ? appcolor.surface : appcolor.light, borderColor: appcolor.switchDisible, marginBottom: 0, padding: 3 }}
                    // onSubmitEditing={() => handlerTextInput(index, MasterList[index + 1] !== undefined ? MasterList[index + 1].ref_Id : 0)}
                    returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                    onClearTextAndroid={handlerOnChangeNumber}
                />
            } />
    } else if (parseInt(item.textValue) == 1) {
        return item.ref_Code.includes('phone') ?
            <View style={{ minHeight: 10, minWidth: 10 }}>
                <FormGroup
                    key={item.ref_Id}
                    value={itemShop[item.ref_Code] ? itemShop[item.ref_Code] : ''}
                    containerStyle={{ backgroundColor: item.ref_Id == 1 ? appcolor.surface : appcolor.light, borderColor: appcolor.switchDisible, marginBottom: 0, padding: 3 }}
                    onClearTextAndroid={handleChangePhone}
                    handleChangeForm={handleChangePhone}
                    placeholder={'Nhập ' + item.itemName}
                    keyboardType={'phone-pad'}
                    editable={item.ref_Id !== 1 ? true : false} />
            </View>
            :
            <View style={{ minHeight: 10, minWidth: 10 }}>
                <FormGroup
                    editable={item.ref_Id !== 1 ? true : false}
                    key={index}
                    placeholder={'Nhập ' + item.itemName}
                    containerStyle={{ backgroundColor: item.ref_Id == 1 ? appcolor.surface : appcolor.light, borderColor: appcolor.switchDisible, marginBottom: 0, padding: 3 }}
                    value={itemShop[item.ref_Code] ? itemShop[item.ref_Code] : ''}
                    inputStyle={{ textAlign: 'left' }}
                    keyboardType="default"
                    handleChangeForm={handlerOnChangeText}
                    onClearTextAndroid={handlerOnChangeText}
                />
            </View>
    } else if (parseInt(item.decimalValue) == 1) {
        return <FormGroup
            editable={item.ref_Id !== 1 ? true : false}
            key={index}
            returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
            placeholder={'Số lượng ' + item.itemName}
            containerStyle={{ backgroundColor: item.ref_Id == 1 ? appcolor.surface : appcolor.light, borderColor: appcolor.switchDisible, marginBottom: 0, padding: 3 }}
            value={itemShop[item.ref_Code]?.toString() || ''}
            inputStyle={{ textAlign: 'left' }}
            keyboardType="numeric" handleChangeForm={handlerOnChangeNumber}
            returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
            onClearTextAndroid={handlerOnChangeNumber}
        />
    } else if (parseInt(item.selectValue) == 1) {
        const itemName = JSON.parse(item.filterList || '[]').find(it => it.Id == itemShop[item.ref_Code])?.Name
        return <View style={{ minHeight: 10, minWidth: 10, borderRadius: 10, backgroundColor: appcolor.surface }}>
            <TouchableOpacity
                onPress={() => item.ref_Id !== 1 ? showListSelect(item) : null}
                style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}>
                <Text style={{ width: '90%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 5 }}>{itemName || '--chọn--'}</Text>
                <Icon type="font-awesome-5" color={appcolor.dark} containerStyle={{ padding: 10 }} style={{ color: appcolor.dark }} name={"caret-down"} size={18} />
            </TouchableOpacity>
        </View >
    } else {
        return <View style={{ minHeight: 10, minWidth: 10 }}>
            <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', justifyContent: JSON.parse(item.listItem || '[]').length > 2 ? 'flex-start' : 'flex-end' }}>
                {
                    listSelect.map(it => {
                        return (
                            <CheckBox
                                containerStyle={{ padding: 5, backgroundColor: appcolor.surface, borderColor: appcolor.transparent, width: '26%' }}
                                textStyle={{ fontSize: 12, fontWeight: '400', color: appcolor.dark }}
                                key={it.id} size={20}
                                title={it.nameVN}
                                checkedColor={appcolor.success}
                                checkedIcon='check-square-o'
                                uncheckedIcon='square-o'
                                onPress={() => item.ref_Id !== 1 ? handleSelectCheck(item, it) : null}
                                checked={itemShop[item.ref_Code] == it.id}
                            />
                        )
                    })
                }
            </View>
        </View>
    }
}

const ViewShopInfo = ({ dataByGroup, itemShop, onTextChanged, onNumberChanged, onChangePhone, onSelectAddress, onCloseSheet, onSelectCheck }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [__, setMutate] = useState(false)
    const [dataSelect, setDataSelect] = useState([])
    const [detailItemSelect, setDetailItemSelect] = useState({})
    const reloadView = () => {
        setMutate(e => !e)
    }

    const showListSelect = async (item) => {
        let listSelect = JSON.parse(item.filterList) || []
        listSelect.map(it => it.Id == itemShop[item.ref_Code] ? (it.isSelect = true) : (it.isSelect = false))
        await setDataSelect(listSelect)
        await setDetailItemSelect(item)
        SheetManager.show('ref_SelectSheet')
    }

    const handlerCloseSheet = async () => {
        await onCloseSheet(detailItemSelect, dataSelect)
        await SheetManager.hide('ref_SelectSheet')
        await reloadView()
    }
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ padding: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: appcolor.dark, padding: 5 }}>{item.itemName}</Text>
                <RenderItemInput item={item} index={index}
                    itemShop={itemShop}
                    showListSelect={showListSelect}
                    onNumberChanged={onNumberChanged}
                    onTextChanged={onTextChanged}
                    onChangePhone={onChangePhone}
                    onSelectAddress={onSelectAddress}
                    onSelectCheck={onSelectCheck}
                    reloadView={reloadView} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>

            <FlatList
                data={dataByGroup}
                renderItem={renderItem}
                ListFooterComponent={<View style={{ height: deviceHeight / 2 }} />}
            />
            {
                dataSelect.length > 0 ?
                    <ActionSheet
                        id={'ref_SelectSheet'}
                        gestureEnabled
                    >
                        <ViewItemSelect dataSelect={dataSelect} appcolor={appcolor} handlerCloseSheet={handlerCloseSheet} />
                    </ActionSheet>
                    : null
            }
        </View>
    )
}

