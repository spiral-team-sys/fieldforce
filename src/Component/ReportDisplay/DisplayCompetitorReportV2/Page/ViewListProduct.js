
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { clearAllDataCompetitor, deleteItemDisplayCompetitor, getListCategoryDisplay, getListCompetitorProductV2, getListSubCategoryDisplay, getTabCompetitorReport } from "../../../../Controller/DisplayController";
import { Message, ToastError, groupDataByKey, removeVietnameseTones } from "../../../../Core/Helper";
import { StyleSheet } from "react-native";
import { deviceHeight, deviceWidth } from "../../../Home";
import { LoadingView } from "../../../../Control/ItemLoading";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FormGroup from "../../../../Content/FormGroup";
import _ from 'lodash'
import { minWidthTab } from "../../../../Core/Utility";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { FlashList } from "@shopify/flash-list";
import { InputItemProduct } from "../Control/InputItemProduct";
import { ViewItemInput } from "../Control/ViewItemInput";
import { Icon } from '@rneui/themed';
import { MenuButton } from "../Control/MenuButton";
import { InputNewProduct } from "../Control/InputNewProduct";
import { fontWeightBold } from "../../../../Themes/AppsStyle";

const listInputDefault = [
    { id: 1, name: 'Trưng bày', displayType: 'quantity', placeholder: 'Số lượng', type: 'quantity', min: 0, max: 100 },
    { id: 2, name: 'thực bán', displayType: 'netValue', placeholder: 'Giá', type: 'price', min: 1000 },
    { id: 3, name: 'Niêm yết', displayType: 'priceValue', placeholder: 'Giá', type: 'price', min: 1000 },
    { id: 4, name: 'FSM Incentive', displayType: 'fsmValue', placeholder: 'Tiền thưởng', type: 'price', min: 1000 },
]

export const ViewListProduct = ({ navigation, route, Status }) => {
    const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(state => state.GAppState)
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const [data, setData] = useState({ dataShow: [], dataShowF: [], dataTab: [], dataCategory: [], dataSubCategory: [] })
    const listInput = lstReport?.listInput?.length ? lstReport?.listInput : listInputDefault
    const [_mutate, setMutate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const [input, setInput] = useState({ item: {}, index: null, isHaveData: false })
    const [menu, _setMenu] = useState({ isOpenCamera: false, isOpen: false, type: null, title: null })
    const [indexTab, setIndexTab] = useState({ index: 0, tabId: 0, tabName: null })
    const listRef = useRef()
    const inputRef = useRef()
    const addRef = useRef()
    const [isProgress, setProgress] = useState(false)

    const loadDataView = async () => {
        // await setProgress(true)
        const listProduct = await getListCompetitorProductV2(workinfo)
        const listCompetitor = await getTabCompetitorReport()
        const listCategory = await getListCategoryDisplay()
        const listSubCategory = await getListSubCategoryDisplay(workinfo)
        const { arr } = groupDataByKey({
            arr: listProduct,
            key: 'divisionId',
            keyLayer2: 'categoryId',
            keyLayer3: 'subCatId'
        })
        data.dataShow = arr
        data.dataShowF = arr
        data.dataTab = listCompetitor
        data.dataCategory = listCategory
        data.dataSubCategory = listSubCategory
        input.item = arr[0]
        indexTab.tabId = listCompetitor[0].divisionId
        indexTab.tabName = listCompetitor[0].division
        // setTimeout(async () => { await setProgress(false) }, 100)
        setMutate(e => !e)
    }

    useEffect(() => {
        const _load = loadDataView()
        return () => _load
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        searchContainer: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { margin: 8, padding: Platform.OS == 'android' ? 3 : 5, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary },
        bottomView: { paddingBottom: deviceHeight / 2 },
        titleHead: { width: deviceWidth, fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        contentMain: { width: deviceWidth, height: '100%', paddingTop: 40, zIndex: 1 },
        inputStyle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light },
        inputMain: { width: '100%', flexDirection: 'column', justifyContent: 'flex-end', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        titleInputStyle: { width: deviceWidth - 100, fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        progressStyle: { width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, left: 0, zIndex: 10000 }
    })

    const onSearchData = (text) => {
        setLoading(true)
        search.text = text
        const listUpdate = _searchData(data.dataShowF)
        data.dataShow = listUpdate
        setMutate(e => !e)
        setLoading(false)
    }
    const _searchData = (filterList) => {
        const valueSearch = removeVietnameseTones(search.text).toLowerCase()
        const searchData = _.filter(filterList, (e) => (
            removeVietnameseTones(e.modelName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.categoryName).toLowerCase().match(valueSearch) ||
            removeVietnameseTones(e.subCategory).toLowerCase().match(valueSearch)
        ))
        return searchData
    }


    const handlerPressItem = async (item, index, type) => {
        input.item = await item
        input.index = await index
        if (type == 'INPUT') {
            await SheetManager.show('sheetInputProduct', { payload: item })
        } else {
            // await inputRef.current.show()
        }
        // await inputRef.current.show()
    }
    const deleteItemAdd = async (item) => {
        await setProgress(true)
        const dataDelete = data.dataShow.filter(it => it.displayCompetitorId !== item.displayCompetitorId)
        const { arr } = groupDataByKey({
            arr: dataDelete,
            key: 'divisionId',
            keyLayer2: 'categoryId',
            keyLayer3: 'subCatId'
        })
        data.dataShow = arr
        data.dataShowF = arr
        await deleteItemDisplayCompetitor(workinfo, item)
        await setMutate(e => !e)
        await setProgress(false)
    }

    const renderItem = ({ item, index }) => {
        const onPressItem = (type) => {
            handlerPressItem(item, index, type)
        }
        const onClickButton = () => {
            deleteItemAdd(item)
        }
        const keyLayer2 = item[`${item.divisionId}${item.categoryId}`];
        const keyLayer3 = item[`${item.divisionId}${item.categoryId}${item.subCatId}`];
        return (
            // <ViewItemProduct
            //     item={item}
            //     index={index}
            //     listInput={listInput}
            // />

            <View key={`it_${item.divisionId}_${index}_${item.modelName}`} style={styles.inputMain}>
                {keyLayer2 &&
                    <View style={{ flex: 1, flexDirection: 'row', padding: 8, alignItems: 'center', borderRadius: 8, backgroundColor: appcolor.primary }}>
                        <Text style={{ color: appcolor.white, fontSize: 16, fontWeight: '700' }}>{item.categoryName}</Text>
                    </View>
                }
                {keyLayer3 &&
                    <View style={{ flex: 1, flexDirection: 'row', padding: 8, alignItems: 'center' }}>
                        <Text style={{ color: appcolor.primary, fontSize: 16, fontWeight: '700' }}>{item.subCategory}</Text>
                    </View>
                }
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 2 }} >
                    <Text style={styles.titleInputStyle}>{`${index + 1}. ${item.modelName}`}</Text>
                    {
                        item.isAddProduct == 1 && item.upload !== 1 &&
                        <Icon name="minus-circle" type="font-awesome-5" size={22} onPress={onClickButton} color={appcolor.danger} style={{ marginEnd: 10 }} />
                    }
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: deviceWidth - (8 * 2) }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: (deviceWidth - ((12 * 2) + 50)) }}>
                        {
                            listInput.map((it, idx) => {
                                return (
                                    <ViewItemInput key={`${item.displayCompetitorId}_${index}_${it.id}`} itemInput={it} indexInput={idx} dataItem={item} indexItem={index} />
                                )
                            })
                        }

                    </View>
                    <TouchableOpacity
                        onPress={() => onPressItem('INPUT')}
                        key={`${item.displayCompetitorId}_${index}`} style={{ position: 'absolute', right: -4, height: 50, width: 50, justifyContent: "flex-end", flexDirection: 'row', alignItems: 'center' }} >
                        <Icon name={'edit'} type={'font-awesome-5'} size={24} color={appcolor.primary} />
                    </TouchableOpacity>

                </View>

            </View >
        )
    }
    const onEditing = async () => {
        try {
            await setMutate(e => !e)
        } catch (e) {
            ToastError(`${e} : check err!`, "Lỗi", "top");
        }

    }

    const onActionMenuFAB = async () => {
        switch (menu.type) {
            case 'SORT':
                if (!menu.isOpen) {
                    menu.isOpen = false
                    menu.type = null
                    menu.title = null
                    //
                    const dataUpdate = _searchData(dataMain, false)
                    const _tabList = _.unionBy(dataUpdate, configPage.keyTab)
                    await setDataTab([])
                    await setDataTab(_tabList)
                    await setData(dataUpdate)
                }
                break
            case 'CAMERA':
                if (!menu.isOpen) {
                    menu.isOpenCamera = false
                    menu.isOpen = false
                    menu.type = null
                    menu.title = null
                    setMutate(e => !e)
                }
                break
            default:
                // menu.isOpen = !menu.isOpen
                // setMutate(e => !e)
                break
        }
    }

    const filterDoneProduct = async (isDone) => {
        if (!isDone) {
            let lstRes = data.dataShowF.filter(it => (it.quantity !== null && it.quantity >= 0) ||
                (it.priceValue !== null && it.priceValue >= 0) ||
                (it.netValue !== null && it.netValue >= 0) ||
                (it.fsmValue !== null && it.fsmValue >= 0))
            data.dataShow = lstRes;
        } else {
            data.dataShow = data.dataShowF;
        }
        await setMutate(e => !e)
    }
    const filterAddProduct = async (isFilterAdd) => {
        if (!isFilterAdd) {
            let lstRes = data.dataShowF.filter(it => (it.isAddProduct === 1))
            data.dataShow = lstRes;
        } else {
            data.dataShow = data.dataShowF;
        }
        await setMutate(e => !e)
    }
    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllDataCompetitor(workinfo);
                    await loadDataView()
                    await setMutate(e => !e)
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            await setMutate(e => !e)
        }
    }

    const handlerChangeFAB = async (type, titleAction) => {
        // let optionReset = [{ text: 'Hủy' }, { text: 'Xác nhận', onPress: onResetData }]
        const isMenuAction = type == menu.type
        switch (type) {
            case "LIST_DONE":
                menu.isOpen = !menu.isOpen
                menu.type = isMenuAction ? null : type
                menu.title = isMenuAction ? null : titleAction
                filterDoneProduct(isMenuAction)
                break
            case "LIST_ADD":
                menu.isOpen = !menu.isOpen
                menu.type = isMenuAction ? null : type
                menu.title = isMenuAction ? null : titleAction
                filterAddProduct(isMenuAction)
                break
            case "DELETE":
                break
            case "RESET_DATA":
                setClearAll()
                break
            case "CAMERA":
                navigation.navigate('photogroup', { Status: Status, hideIcon: true, dataImageList: lstReport?.ImageByList || [] })
                break
            case "ADD":
                addRef.current.show();
                break
        }
    }
    const onTabChange = async (itemTab) => {
        try {
            const _itemDataTab = data.dataTab[itemTab.index].divisionId
            const _itemNameTab = data.dataTab[itemTab.index].division
            setIndexTab({
                ...indexTab,
                index: itemTab.index,
                tabId: _itemDataTab,
                tabName: _itemNameTab
            })
        } catch (e) {
            console.log('onTabChange: ', e);
        }
    }
    const handleSaveProduct = async () => {
        await setMutate(e => !e)
        await addRef.current.hide();
    }

    return (
        <View style={styles.mainContainer}>
            <FormGroup
                editable
                placeholder='Tìm kiếm sản phẩm'
                iconName='search'
                defaultValue={search.text}
                iconColor={search.isSearch ? appcolor.light : appcolor.primary}
                // useClearAndroid={search.text !== null && search.text.length > 0}
                placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
                containerStyle={search.isSearch ? styles.searchContainerInput : styles.searchContainer}
                inputStyle={search.isSearch ? styles.searchInputStyle : styles.searchStyle}
                handleChangeForm={onSearchData}
                onClearTextAndroid={onSearchData}
                useClearAndroid={true}
            // onFocus={onFocusSearch}
            // onEndEditing={onFocusSearch}
            />

            {data.dataTab !== undefined && data.dataTab !== null && data.dataTab.length > 0 &&
                <Tabs.Container
                    pagerProps={{ scrollEnabled: true, keyboardShouldPersistTaps: 'handled' }}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled
                            labelStyle={{ fontSize: 14, fontWeight: '700' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.greylight}
                            activeColor={appcolor.primary}
                            tabStyle={{ backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab), height: 38 }}
                        />
                    )}
                    onTabChange={onTabChange}
                >
                    {data.dataTab.map((item, index) => {
                        const _dataProduct = _.filter(data.dataShow, (e) => e.divisionId == item.divisionId)
                        const titleHead = `${item.division}${_dataProduct.length > 0 ? ` (${_dataProduct.length})` : ``}`
                        return (
                            <Tabs.Tab key={`tabCompe_${item.divisionId}`} label={titleHead} name={titleHead} >
                                <View style={styles.contentMain}>
                                    {!loading &&
                                        <FlashList
                                            ref={listRef}
                                            key={`${item.divisionId}`}
                                            keyExtractor={(it, _index) => it.displayCompetitorId.toString()}
                                            data={_dataProduct}
                                            extraData={[data.dataShow, _dataProduct, data.dataTab]}
                                            renderItem={renderItem}
                                            contentContainerStyle={{ paddingHorizontal: 8 }}
                                            estimatedItemSize={100}
                                            getItemLayout={(_data, idx) => ({ length: _data.length, offset: 100 * idx, idx })}
                                            ListFooterComponent={<View style={styles.bottomView} />}
                                            showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps='handled'
                                            nestedScrollEnabled
                                        />
                                    }
                                </View>
                            </Tabs.Tab>
                        )
                    })}
                </Tabs.Container>
            }
            {
                Object.keys(input.item).length > 0 &&
                <InputItemProduct
                    ref={inputRef}
                    listInput={listInput}
                    inputItem={input}
                    item={input.item}
                    index={input.index}
                    data={data}
                    onEditing={onEditing}
                />
            }

            <InputNewProduct
                ref={addRef}
                listInput={listInput}
                tabInfo={indexTab}
                data={data}
                handleSaveProduct={handleSaveProduct}
            />

            <MenuButton
                info={menu}
                tabInfo={indexTab}
                showMenu={onActionMenuFAB}
                handlerChange={handlerChangeFAB}
                Status={Status}

            />
            {
                isProgress &&
                <View style={styles.progressStyle}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={isProgress} styles={{ marginTop: 8 }} />
                </View>
            }
        </View>
    )
}





