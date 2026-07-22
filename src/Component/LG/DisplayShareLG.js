import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native"
import { deviceHeight, minWidthTab, } from '../../Core/Utility';
import { groupDataByKey, ToastError } from '../../Core/Helper';
import { deviceWidth, fontWeightBold } from '../../Themes/AppsStyle';
import { insertTotalTrackingLG, getListDataTracking, getListCategoryTracking } from '../../Controller/TrackingDetailController';
import Icon from '@react-native-vector-icons/fontawesome6';
import { scaleSize } from '../../Themes/AppsStyle';
import { useSelector } from 'react-redux';
////import { NumericFormat } from "react-number-format";;
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../Control/ItemLoading';

export const DisplayShareLG = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const reportItem = JSON.parse(kpiinfo?.reportItem)

    const [_, setMutate] = useState(false);
    const tabRef = useRef()

    const loadData = async () => {
        await setLoading(true)
        const lstData = await getListDataTracking(workinfo, reportItem.DisplayShare)
        const lstTab = await getListCategoryTracking(reportItem.DisplayShare)
        const { arr } = groupDataByKey({
            arr: lstData,
            key: 'subCatId',
            keyLayer2: 'competitorId'
        })
        await setArrTagShow(lstTab)
        await setArrDataShow(arr)
        await setLoading(false)
    }
    useEffect(() => {
        loadData();
        return () => loading;
    }, [])
    const onChangeTextValue = async (item, index, text) => {
        let mDisplay = 0
        if (text == '') {
            mDisplay = null
        } else {
            let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
            mDisplay = (value === '' || value === null) ? null : parseInt(value);
        }

        let indexD = arrDataShow.findIndex(it => it.id === item.id)
        arrDataShow[indexD].display = mDisplay
        await setMutate(e => !e)
    }
    const editInputChange = async (item, index, e) => {
        let numberInput = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : null
        // if (parseInt(numberInput) === 0) {
        //     numberInput = null;
        //     await ToastError("Nhập số lượng lớn hơn 0");
        // }
        let indexD = arrDataShow.findIndex(it => it.id === item.id)
        // check HE
        // if (item.category !== 'HA') {
        // if (item.refName.includes('TOTAL') === true) {
        //     let lstCommon = arrDataShow.filter(it => it.competitorId === item.competitorId && it.categoryId === item.categoryId);
        //     let itemQuanity = 0;
        //     lstCommon.map(async it => {
        //         if (it.refName.includes('TOTAL') === false) {
        //             itemQuanity = itemQuanity + (it.display || 0)
        //         }
        //         else {

        //             if (parseInt(numberInput) < itemQuanity) {
        //                 arrDataShow[indexD].display = null
        //                 numberInput = null;
        //                 ToastError("Tổng số lượng không thể nhỏ hơn số lượng thành phần");
        //             }
        //         }
        //     })
        // }
        // else {
        //     let lstCommon = arrDataShow.filter(it => it.competitorId === item.competitorId && it.categoryId === item.categoryId && it.refName.includes('TOTAL') === true)
        //     lstCommon.map(async it => {
        //         let total = it.display;
        //         if (parseInt(numberInput) > parseInt(total) && total !== '' && total !== null) {
        //             arrDataShow[indexD].display = null
        //             numberInput = null;
        //             ToastError("Số lượng thành phần không thể lớn hơn tổng số lượng");
        //         }
        //     })
        // }
        // }
        await insertTotalTrackingLG(workinfo, item, (numberInput !== '' && numberInput !== null && numberInput !== undefined) ? parseInt(numberInput) : null)
        arrDataShow[indexD].display = (numberInput !== '' && numberInput !== null && numberInput !== undefined) ? parseInt(numberInput) : null;
        // item.category === 'HA' ? await setTotal(item) : await setMutate(e => !e)
    }
    const setTotal = async (item) => {
        let lstItem = arrDataShow.filter(it => it.isSum == item.isSum)
        let totalItem = 0
        lstItem.forEach((it) => {
            it.refName == 'SEGMENT' ? totalItem += parseInt(it.display || 0) : null;
        })
        lstItem.forEach(it => {
            if (it.refName.includes('TOTAL') == true) {
                let ind = arrDataShow.findIndex(ite => ite.id === it.id)
                arrDataShow[ind].display = totalItem;
                insertTotalTrackingLG(workinfo, it, parseInt(totalItem))
            }
        })
        await setMutate(e => !e)
    }
    const RenderItemData = ({ item, index }) => {
        const changeTextItem = (text) => {
            onChangeTextValue(item, index, text)
        }
        const endChangeTextItem = (e) => {
            editInputChange(item, index, e)
        }
        const fontWeightTotal = item.refName.includes('TOTAL') == true ? '800' : '500'
        const colorTotal = item.refName.includes('TOTAL') == true ? appcolor.primary : appcolor.dark
        const keyLayer2 = `${item.subCatId}${item.competitorId}`

        return (
            <View key={`DS_${index}_${item.id}}`} style={{ width: '100%' }} >
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
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: appcolor.surface, padding: 7, marginBottom: 1 }}>
                    <Text style={{ fontSize: scaleSize(12), color: colorTotal, textAlign: 'left', width: '70%', fontWeight: fontWeightTotal }}>{item.segment ? item.segment : item.refName}</Text>
                    <NumericFormat
                        value={item.display === 0 ? 0 : (item.display || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{
                                    fontSize: scaleSize(12), color: colorTotal, fontWeight: fontWeightTotal,
                                    backgroundColor: appcolor.light,
                                    width: '30%', textAlign: 'center', borderRadius: 5, padding: 8
                                }}
                                selectTextOnFocus
                                keyboardType='numeric'
                                placeholder='Số lượng'
                                placeholderTextColor={appcolor.greydark}
                                editable={item.upload !== 1}
                                // editable={item.upload === 1 ? false : ((item.category == 'HA' && item.refName.includes('TOTAL') == true) ? false : true)}
                                onChangeText={changeTextItem}
                                onEndEditing={endChangeTextItem}
                            />
                        }
                    />
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <LoadingView title={'Đang cập nhật dữ liệu'} isLoading={loading} styles={{ marginTop: 8 }} />
            {
                arrTagShow.length > 0 && !loading &&
                <Tabs.Container
                    ref={tabRef}
                    pagerProps={{ scrollEnabled: true, pagingEnabled: true }}
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, color: appcolor.primary, fontWeight: fontWeightBold }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 38 }}
                            scrollEnabled={true}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )} >
                    {arrTagShow.map((it, i) => {
                        let dataByCategoryId = arrDataShow.filter(data => data.categoryId == it.categoryId)
                        const totalRow = dataByCategoryId.length
                        return (
                            <Tabs.Tab key={i} label={it.category + `${totalRow !== 0 ? ` (${totalRow})` : ''}`}
                                name={it.category + `${totalRow !== 0 ? ` (${totalRow})` : ''}`} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                    <FlatList
                                        extraData={arrDataShow}
                                        keyExtractor={(item, index) => item + index}
                                        data={dataByCategoryId}
                                        removeClippedSubviews={false}
                                        scrollToOverflowEnabled={true}
                                        renderItem={RenderItemData}
                                        ListFooterComponent={<View style={{ height: deviceHeight / 2 }}>
                                            <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, padding: 8 }}>{'Đã xem hết'}</Text>
                                        </View>}
                                    />
                                </View>
                            </Tabs.Tab>
                        )
                    })
                    }
                </Tabs.Container>
            }
        </View>
    )
}
