import { iteratee } from "lodash";
import Moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Keyboard } from "react-native";
import ActionSheet from "react-native-actions-sheet";
//import DatePicker from "react-native-date-picker";
;
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { insertItemAceess } from "../../Controller/AccessoriesController";
import { ToastError, UUIDGenerator } from "../../Core/Helper";
import { deviceHeight, deviceWidth } from "../../Core/Utility";

const AccessoriesModal = ({ closedModal, loadDataAccessories, data }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const [vendorList, setVendorList] = useState([])
    const [yearList, setYearList] = useState([])
    const [categorySelect, setCategorySelect] = useState({})
    const [categoryTypeSelect, setCategoryTypeSelect] = useState({})
    const [dataTypeByCategory, setDataTypeByCategory] = useState({})
    const [itemSave, setItemSave] = useState([])
    const [note, setNote] = useState(null)
    const [mode, setMode] = useState('')
    const lstReport = JSON.parse(kpiinfo?.reportItem);
    const [_, setMutate] = useState(false)

    const _RefType = useRef()
    const _BottomSheet = useRef()

    const getDataSheet = async () => {
        if (vendorList.length === 0) {
            if (lstReport) {
                try {
                    if (lstReport?.dataSheet) {
                        await setVendorList(lstReport?.dataSheet?.vendor);
                        if (lstReport?.dataSheet?.year) {
                            let arrYear = [];
                            var startPoint = 0;
                            var endPoint = 0;
                            let jsonYear = lstReport?.dataSheet?.year
                            jsonYear.map(y => {
                                if (startPoint === 0 && y.id === 1) {
                                    startPoint = parseFloat(y.name)
                                }
                                if (endPoint === 0 && y.id === 2) {
                                    endPoint = parseFloat(y.name)
                                }
                            })
                            if (startPoint !== 0 && endPoint !== 0) {
                                for (let index = startPoint; index < endPoint; index++) {
                                    arrYear.push({ id: index, name: index })
                                }
                                arrYear.reverse();
                                await setYearList(arrYear);
                            }
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
    useEffect(() => {
        getDataSheet()
        return () => false;
    }, [])

    const handleChangeItem = async (event, item) => {
        let value = event !== '' ? event : null
        itemSave.map(it => {
            if (it.decimalValue == 1 && it.itemId == item.itemId) {
                it.decimalVal = (value && value !== 0) ? value : null
            } else if (item.numberValue == 1 && it.itemId == item.itemId) {
                it.numberVal = (value && value > 0) ? parseInt(value) : null
            } else if (item.textValue == 1 && it.itemId == item.itemId) {
                it.textVal = value
            }
        })
    }
    const rightFunction = async () => {
        await _BottomSheet.current.show()
    }
    const renderItemShopinfo = ({ item }) => {
        return (
            <FormGroup
                containerStyle={{ width: '100%', borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                key={'decimalres' + item.itemId}
                defaultValue={item.dateValue == 1 ? item.dateVal :
                    item.decimalValue == 1 ? (item.decimalVal ? item.decimalVal.toString() : '') :
                        item.numberValue == 1 ? (item.numberVal ? item.numberVal.toString() : '') :
                            item.yearValue == 1 ? (item.yearVal ? item.yearVal.toString() : '') :
                                item.selectValue == 1 ? item.selectVal :
                                    item.textValue == 1 ? item.textVal : ''}
                keyboardType={item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? null : (item.textValue === 1 ? 'default' : 'decimal-pad')}
                editable={item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? false : true}
                iconRight={item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? "caret-down" : null}
                iconRightStyle={{ color: appcolor.primary }}
                inputStyle={{ minHeight: item.textValue == 1 ? 80 : null }}
                rightFunc={() => item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? rightFunction() : null}
                title={item.itemNameVN}
                useClearAndroid={item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? false : true}
                // onEndEditing={(e) => handleChangeItem(e, item)}
                handleChangeForm={(text) => handleChangeItem(text, item)}
                onClearTextAndroid={() => item.dateValue == 1 || item.yearValue == 1 || item.selectValue == 1 ? null : handleChangeItem('', item)}
                placeholder={item.textValue === 1 ? 'Nhập ghi chú ở đây' :
                    item.dateValue === 1 ? 'Chọn ngày' :
                        item.yearValue === 1 ? 'chọn năm' :
                            item.numberValue === 1 ? 'Nhập ' + item.itemNameVN :
                                item.decimalValue === 1 ? 'Nhập ' + item.itemNameVN :
                                    item.selectValue === 1 ? 'Chọn người bán' : null}
            />
        )
    }
    const ViewInput = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: "center", width: '100%' }}>
                <FlatList
                    style={{ width: '100%' }}
                    key={'item shop info'}
                    keyExtractor={(_, index) => index.toString()}
                    data={itemSave}
                    renderItem={renderItemShopinfo}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
    const RenderItemType = ({ }) => {
        const itemType = data.dataItemType.filter(it => it.shopProfileId === categoryTypeSelect.shopProfileId) || [];
        (itemSave.length === 0 || itemSave.length !== itemType.length || itemSave[0].shopProfileId !== itemType[0].shopProfileId) && createItem()
        return (
            <View style={{ padding: 10, width: '100%' }} >
                {
                    itemType[0].textValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].numberValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].decimalValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].dateValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].yearValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].selectValue === 1 && itemType[0].shopProfileId !== 101 &&
                    <ViewInput />
                }
                {
                    itemType[0].shopProfileId === 101 &&
                    <ViewInput />
                }
            </View>
        )
    }
    const createItem = async () => {
        const itemType = await data.dataItemType.filter(it => it.shopProfileId === categoryTypeSelect.shopProfileId) || []
        let itemR = []
        let guiId = UUIDGenerator()
        itemType.forEach(it => {
            itemR.push({
                workId: workinfo.workId,
                categoryId: it.categoryId,
                categoryName: it.categoryName,
                categoryType: it.categoryType,
                dateValue: it.dateValue,
                decimalValue: it.decimalValue,
                functionInput: it.functionInput,
                itemId: it.itemId,
                itemNameVN: it.itemNameVN,
                numberValue: it.numberValue,
                selectValue: it.selectValue,
                shopProfileId: it.shopProfileId,
                textValue: it.textValue,
                yearValue: it.yearValue,

                dateVal: null,
                numberVal: null,
                selectVal: null,
                decimalVal: null,
                textVal: null,
                yearVal: null,
                note: null,
                guiId: guiId,
                upload: 0
            })
        })
        await setItemSave(itemR)
    }
    const handleChangeType = async (item) => {
        const itemType = data.dataItemType.filter(it => it.shopProfileId === item.shopProfileId) || []
        if (itemType[0].textValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('textVal')
        } else if (itemType[0].numberValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('numberVal')
        } else if (itemType[0].decimalValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('decimalVal')
        } else if (itemType[0].dateValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('DATE')
        } else if (itemType[0].yearValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('YEAR')
        } else if (itemType[0].selectValue === 1 && itemType[0].shopProfileId !== 101) {
            await setMode('VENDOR')
        } else if (itemType[0].shopProfileId === 101) {
            await setMode('SHOPINFO_DATE')
        }
    }
    const handleTypeSelect = async (item) => {
        await setCategoryTypeSelect(item)
        await setItemSave([])
        await setNote('')
        await handleChangeType(item)
        await createItem()
    }
    const renderListType = ({ item }) => {
        const onPress = () => {
            handleTypeSelect(item)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    backgroundColor: categoryTypeSelect.shopProfileId === item.shopProfileId ? appcolor.primary : appcolor.surface,
                    marginHorizontal: 5, borderRadius: 50
                }}>
                <Text style={{
                    color: categoryTypeSelect.shopProfileId === item.shopProfileId ? appcolor.white : appcolor.dark,
                    padding: 10, marginHorizontal: 10
                }}>{item.categoryType}</Text>
            </TouchableOpacity>
        )
    }
    const handleSelectCategory = async (item) => {
        const dataTypeF = await data?.dataType.filter(it => it.categoryId === item.categoryId)
        await setCategorySelect(item)
        await setDataTypeByCategory(dataTypeF)
        await setCategoryTypeSelect({})
        await scrollOnPress()
    }
    const renderItemCategory = ({ item, index }) => {
        const onPress = () => {
            handleSelectCategory(item)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ backgroundColor: categorySelect?.categoryId === item.categoryId ? appcolor.primary : appcolor.surface, marginHorizontal: 5, borderRadius: 50 }}>
                <Text style={{
                    color: categorySelect?.categoryId === item.categoryId ? appcolor.white : appcolor.dark, padding: 10, marginHorizontal: 10
                }}>{item.categoryName}</Text>
            </TouchableOpacity>
        )
    }
    const scrollOnPress = () => {
        _RefType.current.scrollToOffset({ animated: true, offset: 0 })
    }
    const handleSelectVendor = async (item) => {
        await itemSave.map(it => {
            it.selectValue == 1 ? it.selectVal = item.nameVN : null
        })
        await setMutate(e => !e)
    }
    const renderItemVendor = ({ item }) => {
        const itemVendor = itemSave.find(it => it.selectValue == 1)
        const onPress = () => {
            handleSelectVendor(item)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ backgroundColor: itemVendor.selectVal == item.name ? appcolor.primary : appcolor.surface, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 }}>
                <Text style={{ color: itemVendor.selectVal == item.name ? appcolor.white : appcolor.dark, }}>{item.nameVN}</Text>
            </TouchableOpacity>
        )
    }
    const handleSelectYear = async (item) => {
        await itemSave.map(it => {
            it.yearValue == 1 ? it.yearVal = item.name : null
        })
        await setMutate(e => !e)
    }
    const renderItemYear = ({ item }) => {
        const itemYear = itemSave.find(it => it.yearValue == 1)
        const onPress = () => {
            handleSelectYear(item)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ backgroundColor: itemYear.yearVal === item.name ? appcolor.primary : appcolor.surface, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 }}>
                <Text style={{ color: itemYear.yearVal === item.name ? appcolor.white : appcolor.dark, }}>{item.name}</Text>
            </TouchableOpacity>
        )
    }
    const onChangeDate = async (selectedDate) => {
        let currentDate = ''
        itemSave.forEach(it => {
            it.dateValue === 1 ? (currentDate = selectedDate || it.dateVal) : null
        })
        itemSave.map(it => it.dateValue === 1 ? (it.dateVal = currentDate) : null)
        await setMutate(e => !e)
    }
    const RenderCalendarBS = ({ currentDB, onSelect }) => {
        let dateCurrent = currentDB
        if (Array.isArray(currentDB)) {
            currentDB.forEach(it => it.dateValue === 1 ? dateCurrent = it.dateVal : null)
        }
        const [dateShow, setDateShow] = useState(dateCurrent ? (new Date(dateCurrent)) : new Date()) //currentBS.selectedDay
        const onDateChange = async (event) => {
            await setDateShow(event)
            await onSelect(Moment(event).format("YYYY-MM-DD"))
        }
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: appcolor.surface, borderRadius: 10, marginBottom: 5 }}>
                    <DatePicker style={{ width: deviceWidth, height: deviceHeight / 4 }} textColor={appcolor.dark}
                        mode="date" date={dateShow} onDateChange={onDateChange} />
                </View>
            </View>
        )
    }
    const HeaderSheet = () => {
        const onPress = () => {
            _BottomSheet.current.hide()
        }
        return (
            <View style={{ width: '100%', padding: 10, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                <Text style={{ color: appcolor.dark, fontSize: 18, fontWeight: '600', paddingLeft: 10, textAlign: "center", textAlignVertical: "center" }}>{categoryTypeSelect.categoryType}</Text>
                <TouchableOpacity
                    onPress={onPress}
                    style={{ padding: 8, justifyContent: 'center', alignItems: 'center' }} >
                    <Icon name='times' color={appcolor.primary} size={24} />
                </TouchableOpacity>
            </View>
        )
    }
    const loadOnSave = async () => {
        await setCategorySelect({})
        await setCategoryTypeSelect({})
    }
    const onSaveAccessories = async () => {
        Keyboard.dismiss();
        if (Object.keys(categorySelect).length === 0) {
            ToastError('Bạn chưa chọn ngành hàng!')
            return
        }
        if (Object.keys(categoryTypeSelect).length === 0) {
            ToastError('Bạn chưa chọn loại ngành hàng!')
            return
        }
        let str = ''
        itemSave.map(async it => {
            if (it.dateValue === 1) {
                if (it.dateVal == '' || it.dateVal == null) {
                    str += 'Bạn chưa chọn ' + it.itemNameVN + '!'
                    ToastError('Bạn chưa chọn ' + it.itemNameVN + '!')
                    return
                }

            } else if (it.yearValue === 1) {

                if (it.yearVal == '' || it.yearVal == null) {
                    str += 'Bạn chưa chọn ' + it.itemNameVN + '!'
                    ToastError('Bạn chưa chọn ' + it.itemNameVN + '!')
                    return
                }

            } else if (it.selectValue === 1 && it.itemNameVN === 'Vendor') {
                if (it.selectVal == '' || it.selectVal == null) {
                    str += 'Bạn chưa chọn người bán!'
                    ToastError('Bạn chưa chọn người bán!')
                    return
                }
            } else if (it.numberValue === 1) {
                if (it.numberVal == '' || it.numberVal == null) {
                    str += 'Bạn chưa nhập ' + it.itemNameVN + '!'
                    ToastError('Bạn chưa nhập ' + it.itemNameVN + '!')
                    return
                }
            } else if (it.decimalValue === 1) {
                if (it.decimalVal == '' || it.decimalVal == null) {
                    str += 'Bạn chưa nhập ' + it.itemNameVN + '!'
                    ToastError('Bạn chưa nhập ' + it.itemNameVN + '!')
                    return
                }
            } else if (it.textValue === 1) {
                if (it.textVal == '' || it.textVal == null) {
                    str += 'Bạn chưa nhập ghi chú!'
                    ToastError('Bạn chưa nhập ghi chú!')
                    return
                } else if (it.textVal.length < 5) {
                    str += 'Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.'
                    ToastError('Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.')
                    return
                }
            }

            if (note !== null) {
                if (note.length < 5 && note.length !== 0) {
                    str += 'Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.'
                    ToastError('Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.')
                    return
                } else if (note.length == 0) {
                    it.note = null
                    return
                }
                it.note = note
            }
        })
        if (str == '') {
            itemSave.forEach(async it => {
                if (it && it.itemId !== null) {
                    await insertItemAceess(it, workinfo.workId);
                    await loadOnSave()
                }
            })
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight={'save'}
                iconLeft='times'
                leftFunc={() => closedModal()}
                rightFunc={() => onSaveAccessories()}
            />
            <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                <View style={{ width: '100%', backgroundColor: appcolor.light, flexDirection: 'row', padding: 8, alignItems: 'center' }}>
                    <Text style={{ color: appcolor.dark, margin: 5, fontSize: 14, fontWeight: '600', }}>Ngành hàng :</Text>
                    <FlatList
                        horizontal
                        key={'category'}
                        keyExtractor={(_, index) => index.toString()}
                        data={data.dataCategory}
                        renderItem={renderItemCategory}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={{ width: '100%', backgroundColor: appcolor.light, flexDirection: 'row', padding: 8, alignItems: 'center' }}>
                    <Text style={{ color: appcolor.dark, margin: 5, fontSize: 14, fontWeight: '600', }}>Loại :</Text>
                    {
                        Object.keys(categorySelect).length !== 0 &&
                        <FlatList
                            ref={_RefType}
                            horizontal
                            key={'categoryType'}
                            keyExtractor={(_, index) => index.toString()}
                            data={dataTypeByCategory}
                            renderItem={renderListType}
                            showsHorizontalScrollIndicator={false}
                        />
                    }
                </View>
                {
                    Object.keys(categoryTypeSelect).length !== 0 &&
                    <View style={{ maxHeight: '50%', width: '100%' }}>
                        <RenderItemType />
                    </View>
                }
                {
                    Object.keys(categoryTypeSelect).length !== 0 &&
                    <View style={{ marginHorizontal: 5 }}>
                        <FormGroup
                            title={'Ghi chú (Tối thiểu 5 ký tự)'}
                            containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                            handleChangeForm={setNote}
                            defaultValue={note} editable
                            inputStyle={{ minHeight: 80 }}
                            numberOfLines={3} multiline={true}
                            onClearTextAndroid={() => setNote('')}
                            placeholder='Nhập ghi chú'
                        />
                    </View>
                }
            </View>
            <ActionSheet ref={_BottomSheet}>
                {
                    mode === 'VENDOR' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5 }}>
                        <HeaderSheet />
                        <FlatList
                            scrollEnabled
                            keyExtractor={(_, index) => index.toString()}
                            data={vendorList}
                            renderItem={renderItemVendor}
                            numColumns={1}
                        />
                    </View>
                }
                {
                    mode === 'YEAR' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FlatList
                                // style={{ width: deviceWidth, height: deviceHeight / 2, backgroundColor: 'red' }}
                                keyExtractor={(_, index) => index.toString()}
                                data={yearList}
                                renderItem={renderItemYear}
                            />
                        </ScrollView>
                    </View>
                }
                {
                    mode === 'DATE' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <RenderCalendarBS
                            currentDB={itemSave}
                            onSelect={onChangeDate}
                        />
                    </View>

                }
                {
                    mode === 'SHOPINFO_DATE' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <RenderCalendarBS
                            currentDB={itemSave}
                            onSelect={onChangeDate}
                        />
                    </View>
                }
            </ActionSheet>
        </View >
    )
}
export default AccessoriesModal