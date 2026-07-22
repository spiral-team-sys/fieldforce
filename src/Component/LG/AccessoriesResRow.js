import Moment from "moment";
import React, { useRef, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { deleteItemAceess, deleteNoteAccess, updateItemAceess, updateNoteAceess } from "../../Controller/AccessoriesController";
import { deviceHeight, deviceWidth } from "../../Core/Utility";
//import DatePicker from "react-native-date-picker";
import { debounce, ToastError } from "../../Core/Helper";
import GmailStyleSwipeableRow from "../../Core/GmailStyleSwipeableRow";

const AccessoriesResRow = ({ itemData, index, totalRow, loadData, vendorList, yearList }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const keyLayer2 = itemData[`${itemData.categoryId}${itemData.shopProfileId}`]
    const [mode, setMode] = useState('')
    const _BottomSheet = useRef()
    const handleChangeItem = async (event, item) => {
        let value = event !== '' ? event : null
        let str = ''
        if (item.decimalValue == 1) {
            if (value == null) {
                str += 'Bạn chưa nhập ' + item.itemNameVN
            } else if (parseInt(value) == 0) {
                str += 'Nhập ' + item.itemNameVN + ' không được bằng 0!'
            } else {
                item.decimalVal = value
            }
        } else if (item.numberValue == 1) {
            if (value == null) {
                str += 'Bạn chưa nhập ' + item.itemNameVN
            } else if (parseInt(value) == 0) {
                str += 'Nhập ' + item.itemNameVN + ' không được bằng 0!'
            } else {
                item.numberVal = parseInt(value)

            }
        } else if (item.textValue == 1) {
            if (value != null || value.length < 5) {
                str += 'Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.'
            } else {
                item.textVal = value
            }
        }
        if (str != '') {
            await ToastError(str, 'Thông báo', 'top')
            await loadData()
            return
        }
        await updateItemAceess(item);
    }
    const HeaderSheet = () => {
        const onPress = () => {
            _BottomSheet.current.hide()
        }
        return (
            <View style={{ width: '100%', padding: 10, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                <Text style={{ color: appcolor.dark, fontSize: 18, fontWeight: '600', paddingLeft: 10, textAlign: "center", textAlignVertical: "center" }}>{itemData.categoryType}</Text>
                <TouchableOpacity
                    onPress={onPress}
                    style={{ padding: 8, justifyContent: 'center', alignItems: 'center' }} >
                    <Icon name='times' color={appcolor.primary} size={24} />
                </TouchableOpacity>
            </View>
        )
    }
    const handleSelectVendor = async (itemV) => {
        itemData.selectVal = itemV.nameVN
        await updateItemAceess(itemData);
        await loadData()
    }
    const renderItemVendor = ({ item }) => {
        const onPress = () => { handleSelectVendor(item) }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ backgroundColor: itemData.selectVal == item.nameVN ? appcolor.primary : appcolor.surface, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 }}>
                <Text style={{ color: itemData.selectVal == item.nameVN ? appcolor.white : appcolor.dark, }}>{item.nameVN}</Text>
            </TouchableOpacity>
        )
    }
    const handleSelectYear = async (item) => {
        itemData.yearVal = item.name
        await updateItemAceess(itemData);
        await loadData()
    }
    const renderItemYear = ({ item }) => {
        const onPress = () => {
            handleSelectYear(item)
        }
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{ backgroundColor: itemData.yearVal === item.name ? appcolor.primary : appcolor.surface, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 }}
            >
                <Text style={{ color: itemData.yearVal === item.name ? appcolor.white : appcolor.dark, }}>{item.name}</Text>
            </TouchableOpacity>
        )
    }
    const onChangeDate = async (selectedDate) => {
        let currentDate = selectedDate || itemData.dateVal
        itemData.dateVal = currentDate
        await updateItemAceess(itemData);
        await loadData()
    }
    const RenderCalendarBS = ({ currentDB, onSelect }) => {
        const [dateShow, setDateShow] = useState(currentDB ? (new Date(currentDB)) : new Date()) //currentBS.selectedDay
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
    const rightFunction = async () => {
        if (itemData.textValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('textVal')
        } else if (itemData.numberValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('numberVal')
        } else if (itemData.decimalValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('decimalVal')
        } else if (itemData.dateValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('DATE')
        } else if (itemData.yearValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('YEAR')
        } else if (itemData.selectValue === 1 && itemData.shopProfileId !== 101) {
            await setMode('VENDOR')
        } else if (itemData.shopProfileId === 101) {
            await setMode('SHOPINFO_DATE')
        }
        await _BottomSheet.current.show()
    }
    const handleChangeNote = debounce(async (text) => {
        if (text != null && text.length > 0 && text.length < 5) {
            ToastError('Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.', 'Thông báo', 'top')
            return
        }
        await updateNoteAceess(itemData, text, workinfo)
    }, 500)
    const deleteItem = async (item) => {
        await deleteItemAceess(item, workinfo.workId);
        await loadData();
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light, borderRadius: 5, marginBottom: 5 }}>
            <GmailStyleSwipeableRow
                key={itemData.shopProfileId.toString()}
                enableRight={itemData.upload === 1 ? true : false}
                deleteItem={() => deleteItem(itemData)}>
                <View style={{ flex: 1 }}>
                    {keyLayer2 &&
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name='tags' style={{ padding: 8, color: appcolor.primary }} />
                            <Text style={{ color: appcolor.primary, fontSize: 16, fontWeight: '700' }}>{`${itemData.categoryName} - ${itemData.categoryType}`}</Text>
                        </View>
                    }
                    {keyLayer2 && <FormGroup
                        title={"Ghi chú (Tối thiểu 5 ký tự)"}
                        containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                        handleChangeForm={handleChangeNote}
                        defaultValue={itemData.note}
                        editable={itemData.upload == 1 ? false : true}
                        numberOfLines={3} multiline={true}
                        useClearAndroid={false}
                        placeholder='Nhập ghi chú'
                    />}
                    <FormGroup
                        containerStyle={{ width: '100%', borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                        key={'decimalres' + itemData.itemId}
                        defaultValue={itemData.dateValue == 1 ? itemData.dateVal :
                            itemData.decimalValue == 1 ? (itemData.decimalVal ? itemData.decimalVal.toString() : '') :
                                itemData.numberValue == 1 ? (itemData.numberVal ? itemData.numberVal.toString() : '') :
                                    itemData.yearValue == 1 ? (itemData.yearVal ? itemData.yearVal.toString() : '') :
                                        itemData.selectValue == 1 ? itemData.selectVal :
                                            itemData.textValue == 1 ? itemData.textVal : ''}
                        keyboardType={itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? null : (itemData.textValue === 1 ? 'default' : 'numeric')}
                        editable={itemData.upload == 1 ? false : ((itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1) ? false : true)}
                        iconRight={itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? "caret-down" : null}
                        iconRightStyle={{ color: appcolor.primary }}
                        inputStyle={{ minHeight: itemData.textValue == 1 ? 80 : null }}
                        rightFunc={() => (itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1) && itemData.upload == 0 ? rightFunction() : null}
                        title={itemData.itemNameVN}
                        useClearAndroid={false}
                        handleChangeForm={(text => handleChangeItem(text, itemData))}
                        onClearTextAndroid={() => itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? null : handleChangeItem('', itemData)}
                        placeholder={itemData.textValue === 1 ? 'Nhập ghi chú ở đây' :
                            itemData.dateValue === 1 ? 'Chọn ngày' :
                                itemData.yearValue === 1 ? 'chọn năm' :
                                    itemData.numberValue === 1 ? 'Nhập ' + itemData.itemNameVN :
                                        itemData.decimalValue === 1 ? 'Nhập ' + itemData.itemNameVN :
                                            itemData.selectValue === 1 ? 'Chọn người bán' : null}
                    />
                </View>
            </GmailStyleSwipeableRow>

            <ActionSheet
                ref={_BottomSheet}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >
                {mode === 'VENDOR' &&
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
                {mode === 'YEAR' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FlatList
                                keyExtractor={(_, index) => index.toString()}
                                data={yearList}
                                renderItem={renderItemYear}
                            />
                        </ScrollView>
                    </View>
                }
                {mode === 'DATE' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <RenderCalendarBS
                            currentDB={itemData.dateVal}
                            onSelect={onChangeDate}
                        />
                    </View>
                }
                {mode === 'SHOPINFO_DATE' &&
                    <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}>
                        <HeaderSheet />
                        <RenderCalendarBS
                            currentDB={itemData.dateVal}
                            onSelect={onChangeDate}
                        />
                    </View>
                }
            </ActionSheet>
        </View>
    )
    // return (
    //     <View style={{ flex: 1, flexDirection: 'row', backgroundColor: appcolor.light }}>
    //         <View style={{ flex: 1 }}>
    //             {
    //                 itemData.isParent &&
    //                 <View style={{ padding: 8, backgroundColor: appcolor.primary, flex: 1, borderRadius: 10, margin: 5 }}>
    //                     <Text style={{ color: appcolor.white, paddingLeft: 10 }}>{itemData.categoryName}</Text>
    //                 </View>
    //             }
    //             {
    //                 keyLayer2 &&
    //                 <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
    //                     <Icon name='tags' style={{ padding: 8, color: appcolor.primary }} />
    //                     <Text style={{ color: appcolor.primary, fontSize: 16, fontWeight: '700' }}>{itemData.categoryType}</Text>
    //                 </View>
    //             }
    //             <View style={{ flex: 1, marginHorizontal: 10 }}>

    //                 {
    //                     keyLayer2 && itemData.note !== null && itemData.note !== '' &&
    //                     <GmailStyleSwipeableRow
    //                         enableRight={itemData.upload === 1 ? true : false}
    //                         key={itemData.shopProfileId.toString()}
    //                         deleteItem={() => deleteNote(itemData)}
    //                     >
    //                         <FormGroup
    //                             title={"Ghi chú"}
    //                             containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
    //                             onEndEditing={(e) => handleChangeNote(e)}
    //                             defaultValue={itemData.note}
    //                             editable={itemData.upload == 1 ? false : true}
    //                             inputStyle={{ minHeight: 80 }}
    //                             numberOfLines={3} multiline={true}
    //                             useClearAndroid={false}
    //                             placeholder='Nhập ghi chú ở đây'
    //                         />
    //                     </GmailStyleSwipeableRow>
    //                 }
    //                 <GmailStyleSwipeableRow
    //                     enableRight={itemData.upload === 1 ? true : false}
    //                     key={itemData.itemId.toString()}
    //                     deleteItem={() => deleteItem(itemData)} >
    //                     <FormGroup
    //                         containerStyle={{ width: '100%', borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
    //                         key={'decimalres' + itemData.itemId}
    //                         defaultValue={itemData.dateValue == 1 ? itemData.dateVal :
    //                             itemData.decimalValue == 1 ? (itemData.decimalVal ? itemData.decimalVal.toString() : '') :
    //                                 itemData.numberValue == 1 ? (itemData.numberVal ? itemData.numberVal.toString() : '') :
    //                                     itemData.yearValue == 1 ? (itemData.yearVal ? itemData.yearVal.toString() : '') :
    //                                         itemData.selectValue == 1 ? itemData.selectVal :
    //                                             itemData.textValue == 1 ? itemData.textVal : ''}
    //                         keyboardType={itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? null : (itemData.textValue === 1 ? 'default' : 'numeric')}
    //                         editable={itemData.upload == 1 ? false : ((itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1) ? false : true)}
    //                         iconRight={itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? "caret-down" : null}
    //                         iconRightStyle={{ color: appcolor.primary }}
    //                         inputStyle={{ minHeight: itemData.textValue == 1 ? 80 : null }}
    //                         rightFunc={() => (itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1) && itemData.upload == 0 ? rightFunction() : null}
    //                         title={itemData.itemNameVN + ' ' + itemData.categoryType}
    //                         useClearAndroid={false}
    //                         // onEndEditing={(e) => handleChangeItem(e, itemData)}
    //                         handleChangeForm={(text => handleChangeItem(text, itemData))}
    //                         onClearTextAndroid={() => itemData.dateValue == 1 || itemData.yearValue == 1 || itemData.selectValue == 1 ? null : handleChangeItem('', itemData)}
    //                         placeholder={itemData.textValue === 1 ? 'Nhập ghi chú ở đây' :
    //                             itemData.dateValue === 1 ? 'Chọn ngày' :
    //                                 itemData.yearValue === 1 ? 'chọn năm' :
    //                                     itemData.numberValue === 1 ? 'Nhập ' + itemData.itemNameVN :
    //                                         itemData.decimalValue === 1 ? 'Nhập ' + itemData.itemNameVN :
    //                                             itemData.selectValue === 1 ? 'Chọn người bán' : null}
    //                     />
    //                 </GmailStyleSwipeableRow>
    //             </View>
    //             {index === totalRow - 1 && index >= 3 && <View style={{ width: '100%', textAlign: 'center', color: appcolor.dark, height: 80 }}></View>}
    //         </View>
    //         <ActionSheet
    //             ref={_BottomSheet}
    //             closeOnPressBack={true}
    //             gestureEnabled={true}
    //             indicatorColor={appcolor.primary}
    //         >
    //             {
    //                 mode === 'VENDOR' &&
    //                 <View style={{ width: deviceWidth, height: deviceHeight / 1.5 }}                    >
    //                     <HeaderSheet />
    //                     <FlatList
    //                         scrollEnabled
    //                         keyExtractor={(_, index) => index.toString()}
    //                         data={vendorList}
    //                         renderItem={renderItemVendor}
    //                         numColumns={1}
    //                     />
    //                 </View>
    //             }
    //             {
    //                 mode === 'YEAR' &&
    //                 <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}                    >
    //                     <HeaderSheet />
    //                     <ScrollView showsVerticalScrollIndicator={false}>
    //                         <FlatList
    //                             // style={{ width: deviceWidth, height: deviceHeight / 2, backgroundColor: 'red' }}
    //                             keyExtractor={(_, index) => index.toString()}
    //                             data={yearList}
    //                             renderItem={renderItemYear}
    //                         />
    //                     </ScrollView>
    //                 </View>
    //             }
    //             {
    //                 mode === 'DATE' &&
    //                 <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}                    >
    //                     <HeaderSheet />
    //                     <RenderCalendarBS
    //                         currentDB={itemData.dateVal}
    //                         onSelect={onChangeDate}
    //                     />
    //                 </View>

    //             }
    //             {
    //                 mode === 'SHOPINFO_DATE' &&
    //                 <View style={{ width: deviceWidth, height: deviceHeight / 1.5, paddingBottom: 50 }}                    >
    //                     <HeaderSheet />
    //                     <RenderCalendarBS
    //                         currentDB={itemData.dateVal}
    //                         onSelect={onChangeDate}
    //                     />
    //                 </View>

    //             }
    //         </ActionSheet>
    //     </View>
    // )
}
export default AccessoriesResRow;