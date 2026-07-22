import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, TextInput, Platform, KeyboardAvoidingView, } from "react-native"
import { Capitalize, minWidthTab, } from '../../Core/Utility';
import { groupDataByKey, MessageInfo, ToastError } from '../../Core/Helper';
import Icon from '@react-native-vector-icons/fontawesome6';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { insertPriceISLG, insertTotalTrackingLG, getListDataTracking, getListCategoryTracking } from '../../Controller/TrackingDetailController';
import { useSelector } from 'react-redux';
// import NumberFormat from "react-number-format";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../Control/ItemLoading';
import { deviceHeight } from '../Home';

export const InstoreShareLG = ({ navigation, route, Status }) => {
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const { appcolor, kpiinfo, workinfo, userinfo } = useSelector(state => state.GAppState);
    const reportItem = JSON.parse(kpiinfo?.reportItem)

    const loadData = async () => {
        setLoading(true)
        const lstData = await getListDataTracking(workinfo, reportItem.InstoreShare)
        const lstTab = await getListCategoryTracking(reportItem.InstoreShare)
        const { arr } = groupDataByKey({
            arr: lstData,
            key: 'subCatId',
            keyLayer2: 'competitorId'
        })
        await setArrTagShow(lstTab);
        await setArrDataShow(arr)
        setLoading(false)
    }
    useEffect(() => {
        loadData();
        return () => loading;
    }, [])

    const ViewItem = () => {
        return (
            arrTagShow.map((it, i) => {
                const dataByCategoryId = arrDataShow.filter(i => i.categoryId === it.categoryId)
                const totalRow = dataByCategoryId.length
                return (
                    <Tabs.Tab key={it.categoryId} label={it.category + `${totalRow !== 0 ? ` (${totalRow})` : ''}`}
                        name={it.category + `${totalRow !== 0 ? ` (${totalRow})` : ''}`} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, width: deviceWidth }}>
                            <FlatList
                                key={(item) => item.id}
                                keyExtractor={(item, index) => item + index}
                                style={{ padding: 10 }}
                                data={dataByCategoryId}
                                scrollToOverflowEnabled={true}
                                removeClippedSubviews={false}
                                renderItem={
                                    ({ item, index }) => <RenderItemData item={item} index={index} details={arrDataShow} totalRow={totalRow} workinfo={workinfo} appcolor={appcolor} Status={Status} />
                                }
                                ListFooterComponent={<Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, padding: 8, height: deviceHeight / 2 }}>{'Đã xem hết'}</Text>}
                            />
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            {
                arrTagShow.length > 0 && !loading &&
                <Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, color: appcolor.primary, fontWeight: '600' }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 38 }}
                            scrollEnabled={true}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    {ViewItem()}
                </Tabs.Container>
            }
        </View>
    )
}
const RenderItemData = ({ item, index, details, workinfo, appcolor, Status, totalRow }) => {
    const [detailsTem] = useState(details)
    const [inputText, setInputText] = useState(item.display === 'null' ? null : item.display);
    const [inputPrice, setInputPrice] = useState(item.price === 'null' ? null : item.price);

    const editChangeQuanity = async (e) => {
        let numberInput = inputText;
        // if (parseInt(numberInput) === 0) {
        //     setInputText(null);
        //     numberInput = null;
        //     Platform.OS === 'ios' ? ToastError("Nhập số lượng lớn hơn 0") : MessageInfo('Nhập số lượng lớn hơn 0.');
        //     return
        // }

        await insertTotalTrackingLG(workinfo, item, numberInput !== '' && numberInput !== undefined && numberInput !== null ? parseInt(numberInput) : null)

        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId);
        detailsTem[indexD].display = numberInput
    }
    const onChangeQuanity = async (text) => {
        if (text !== '') {
            await setInputText(parseInt(text))
        }
        else {
            await setInputText()
        }
    }
    const editChangePrice = async (e) => {
        let numberInput = inputPrice;

        let lstCommon = detailsTem.filter(it => it.competitorId === item.competitorId && it.categoryId === item.categoryId);

        let itemQuanity = 0;
        lstCommon.map(it => {
            if (it.refName.includes('TOTAL') == false) {
                itemQuanity = itemQuanity + (it.display || 0)
            }
            else {
                if (parseInt(numberInput) < 10000) {
                    setInputPrice(null);
                    numberInput = null;
                    ToastError("Nhập giá không được nhỏ 10.000", "Lỗi", "top")
                }
                if (parseInt(numberInput) % 1000 > 0) {
                    setInputPrice(null);
                    numberInput = null;
                    ToastError("Nhập giá không được lẻ!", "Lỗi", "top")
                }

                if (parseInt(numberInput) < itemQuanity) {
                    setInputPrice(null);
                    numberInput = null;
                    ToastError("Tổng số lượng không thể nhỏ hơn số lượng thành phần", "Lỗi", "top")
                }
            }
        })

        await insertPriceISLG(workinfo, item, (numberInput !== '' && numberInput !== undefined && numberInput !== null) ? parseInt(numberInput) : null)

        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId);
        detailsTem[indexD].price = numberInput
    }
    const onChangePrice = async (text) => {
        let numTxt = text.length > 0 ? text.toString().replace(/,/g, '') : ''
        if (text !== '') {
            await setInputPrice(parseInt(numTxt));
        }
        else {
            await setInputPrice();
        }
    }

    const fontWeightTotal = item.refName.includes('TOTAL') == true ? '800' : '500'
    const colorTotal = item.refName.includes('TOTAL') == true ? appcolor.primary : appcolor.dark
    const keyLayer2 = `${item.subCatId}${item.competitorId}`

    return (
        <View key={`IS_${index}`} style={{ width: '100%', marginBottom: 1 }} onPress={() => this.onItemPress(item)} >
            {(item?.isParent && item?.subCatId !== undefined && item?.subCategory !== null && item.category == 'HA') &&
                <View style={{ flex: 1, padding: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, borderRadius: 6, marginTop: 10 }}>
                    <Text style={{ fontSize: scaleSize(19), fontWeight: '700', color: appcolor.white, paddingLeft: 10 }}>{item?.subCategory}</Text>
                </View>
            }
            {
                item[keyLayer2] &&
                <View style={{ flex: 1, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name='tags' style={{ color: appcolor.primary }} />
                    <Text style={{ fontSize: scaleSize(16), fontWeight: '700', color: appcolor.primary, paddingLeft: 10 }}>{item?.competitorName}</Text>
                </View>
            }
            <View style={{
                flexDirection: 'row', width: '100%', alignItems: 'center', padding: 7, marginBottom: 1,
                backgroundColor: appcolor.surface, marginRight: 5
            }}>
                <Text style={{ fontSize: scaleSize(12), color: colorTotal, fontWeight: fontWeightTotal, width: '40%' }}>{item.segment ? item.segment : item.refName}</Text>
                <View style={{ flexDirection: 'row', width: '60%', justifyContent: 'flex-end' }}>
                    {item.numberValue == 1 &&
                        <TextInput
                            style={{
                                fontSize: 13, color: colorTotal, backgroundColor: appcolor.light, fontWeight: fontWeightTotal,
                                width: '40%', textAlign: 'center', borderWidth: 0.5, borderRadius: 8, padding: 7, borderColor: appcolor.light
                            }}
                            keyboardType='numeric'
                            placeholder='Số lượng'
                            placeholderTextColor={appcolor.placeholderText}
                            editable={!Status}
                            selectTextOnFocus={!Status}
                            onChangeText={onChangeQuanity}
                            onEndEditing={editChangeQuanity}>{inputText}</TextInput>
                    }
                    {item.priceValue == 1 &&
                        <NumberFormat
                            value={inputPrice || ''}
                            displayType='text'
                            thousandSeparator={true}
                            renderText={value =>
                                <TextInput
                                    value={value}
                                    style={{
                                        fontSize: 13, color: colorTotal, backgroundColor: appcolor.light, fontWeight: fontWeightTotal,
                                        width: '60%', textAlign: 'center', borderWidth: 0.5, borderRadius: 8, padding: 7, borderColor: appcolor.light, marginStart: 8
                                    }}
                                    keyboardType='numeric'
                                    placeholder='Số tiền'
                                    placeholderTextColor={appcolor.placeholderText}
                                    editable={Status ? false : true}
                                    selectTextOnFocus={Status ? false : true}
                                    onChangeText={onChangePrice}
                                    onEndEditing={editChangePrice}></TextInput>
                            }
                        />
                    }
                </View>
            </View>
        </View>
    )
}