import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, TextInput, Dimensions, FlatList, TouchableOpacity, Keyboard } from "react-native";
import { Icon } from '@rneui/themed';
import { getStockoutResult } from '../../Controller/WorkController'
import { checkNetwork, deviceWidth, minWidthTab } from "../../Core/Utility";
import { isNotInteger, Message, ToastError, ToastSuccess } from '../../Core/Helper';
import { _competitorId } from '../../Core/URLs';
import { isIphoneX } from '../../Core/is-iphone-x';
import UploadController from '../../Controller/UploadController';
const HEADER_SIZE = Platform.OS == 'android' ? 60 : (isIphoneX() ? 90 : 20);
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { checkLockReport } from '../../Controller/ShopController';
import { clearAllDataStock, getlistTabByCategory, getStockProduct, updateStockItem, updateStockNote } from '../../Controller/StockOutController'
// import NumberFormat from "react-number-format";
import FormGroup from '../../Content/FormGroup';
import ActionSheet from 'react-native-actions-sheet';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../Control/ItemLoading';
import moment from 'moment';

export const StockReport = ({ navigation }) => {
    const [arrTagShow, setArrTagShow] = useState([]);
    const [arrDataShow, setArrDataShow] = useState([]);
    const [arrDataShowF, setArrDataShowF] = useState([]);

    const [isLockReport, setLockReport] = useState(false);
    const [showProgress, setProgress] = useState(false);
    const [isDone, setDone] = useState(false);
    const [Status, setStatus] = useState(false);
    const { appcolor, workinfo, kpiinfo, userinfo, shopinfo } = useSelector(state => state.GAppState);
    const [isClear, setClear] = useState(0);
    const [mode, setMode] = useState('TOOLS');
    const [search, setSearch] = useState('');
    const ref_bottomSheet = useRef()
    const [note, setNote] = useState('')
    const loadDataShow = async () => {
        await setProgress(true)
        const isCheck = await checkLockReport(shopinfo)
        await setLockReport(isCheck)
        let lstRes = await getStockoutResult(workinfo);
        let isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setStatus(isUpload)
        } else {
            await setStatus(1)
        }
        await setArrDataShowF([]);
        await setArrDataShow([]);
        const lstItemsProgram = await getStockProduct(workinfo);
        const lstTab = await getlistTabByCategory(_competitorId)
        setNote(lstItemsProgram[0]?.displayComment || '')
        await setArrTagShow(lstTab);
        await setArrDataShowF(lstItemsProgram);
        await setArrDataShow(lstItemsProgram);
        setTimeout(async () => { await setProgress(false) }, 100)
    }

    const filterDoneData = async () => {
        let done = !isDone
        let lstData = arrDataShow.filter(it => it.quanity !== null && it.quanity >= 0)
        if (done) {
            await setArrDataShow(lstData)
        } else {
            await setArrDataShow(arrDataShowF)
            await setSearch('')
        }
        await setDone(e => !e)
    }

    const filterProduct = async (text) => {
        if (text) {
            const newDataShow = arrDataShowF.filter(it => {
                const nameProduct = it.productName ? it.productName.toUpperCase() : ''.toUpperCase()
                const textSearch = text.toUpperCase()
                return nameProduct.indexOf(textSearch) > -1
            })
            setArrDataShow(newDataShow)
            setSearch(text)
        } else {
            setArrDataShow(arrDataShowF)
            setDone(false)
            setSearch(text)
        }
    }

    useEffect(() => {
        // insertHistory();
        loadDataShow();
        return () => {
            Keyboard?.dismiss()
            false
        };
    }, [])

    const uploadAction = async () => {
        await Keyboard.dismiss()
        if (Status === 1) {
            ToastError("Báo cáo đã khóa");
            return;
        }
        let resStock = await getStockoutResult(workinfo);
        let itemsUpload = resStock.filter(it => it.quanity !== 'null' && it.quanity !== null);

        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }
        // console.log(itemsUpload, 'itemsUpload')
        // console.log(resStock, 'resStock')
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(resStock));
    }
    const UploadData = async (resStock) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        await UploadController.DataStock(resStock, work, async () => {
            await loadDataShow();
        }, async () => {
        })
    }

    const clearData = async () => {
        arrDataShowF.map(it => {
            it.quanity = null
        })
        await setArrDataShow(arrDataShowF)
    }

    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearAllDataStock(workinfo)
                    await setDone(false)
                    // await setClear(isClear + 1);
                    // await clearData()
                    await loadDataShow()
                    ref_bottomSheet.current?.hide()
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            ref_bottomSheet.current?.hide()
        }
    }

    const ViewItem = () => {
        let dataByCategoryId = []
        return (
            arrTagShow.map(it => {
                dataByCategoryId = arrDataShow?.filter(i => i.categoryName === it.categoryName)
                const totalRow = dataByCategoryId.length
                return (
                    <Tabs.Tab key={it.categoryName} label={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`}
                        name={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, display: !showProgress ? 'flex' : 'none' }}>

                            {/* <View style={{ flex: 1 }} key={it.categoryId + "_Oo"} tabLabel={Capitalize(it.categoryName) + `${dataByCategoryId.length !== 0 ? `(${dataByCategoryId.length})` : ''}`} > */}
                            {/* <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? "padding" : null}
                            enabled keyboardVerticalOffset={-10}
                            style={{ flex: 1, backgroundColor: appcolor.transparent }}> */}
                            <FlatList
                                contentContainerStyle={{ paddingBottom: 30 }}
                                key={(item) => item.id}
                                keyExtractor={(item, index) => item + index}
                                data={dataByCategoryId}
                                initialNumToRender={20}
                                updateCellsBatchingPeriod={20}
                                removeClippedSubviews={false}
                                windowSize={10}
                                renderItem={
                                    ({ item, index }) => <RenderItemData item={item} details={arrDataShowF} isClear={isClear} totalRow={totalRow} index={index}
                                        dataFilter={arrDataShow} appcolor={appcolor} workinfo={workinfo} />
                                }
                            />
                            {/* </KeyboardAvoidingView> */}
                            {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 40 : null} /> */}
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }

    const handleEndChangeNote = async () => {
        if (note?.length > 0 && note?.length < 5) {
            ToastError('Vui lòng nhập ghi chú ít nhất 5 ký tự!!', 'Thông báo', 'top');
            setNote('')
            return
        }

        const result = await updateStockNote(note, workinfo)
        if (result) {
            note?.length !== 0 && ToastSuccess('Đã lưu ghi chú.', 'Thông báo', 'top');
        } else {
            ToastError('Lưu ghi chú lỗi!!', 'Thông báo', 'top');
        }

    }

    const openSheet = () => {
        Keyboard.dismiss()
        ref_bottomSheet.current.show()
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight={!isLockReport ? (Status !== 1 ? 'cloud-upload-alt' : null) : 'user-lock'}
                leftFunc={() => navigation.goBack()}
                rightFunc={() => !isLockReport ? (Status !== 1 ? uploadAction() : null) : ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')}
                iconMiddle='poll-h'
                middleFunc={openSheet}
            />

            <View style={{ backgroundColor: appcolor.light, width: '100%', height: Dimensions.get('window').height - HEADER_SIZE }}>
                <FormGroup
                    containerStyle={{ backgroundColor: appcolor.light, margin: 8, marginBottom: 0, alignSelf: 'center' }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark }}
                    placeholder='Tìm kiếm sản phẩm' editable
                    onEndEditing={() => setDone(false)}
                    onClearTextAndroid={filterProduct}
                    iconName='search'
                    value={search} handleChangeForm={filterProduct}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <FormGroup
                        iconName={'comment-alt'}
                        multiline={true} selectTextOnFocus={true}
                        containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, flex: 1 }}
                        inputStyle={{ fontSize: 13, color: appcolor.dark }}
                        placeholder='Nhập ghi chú...' editable
                        onEndEditing={handleEndChangeNote}
                        onClearTextAndroid={handleEndChangeNote}
                        handleChangeForm={setNote}
                        value={note || ''}
                    />
                </View>
                {
                    arrTagShow.length > 0 && !showProgress &&
                    <Tabs.Container
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 42 }}
                                scrollEnabled={true}
                                style={{ backgroundColor: appcolor.light }}
                            />
                        )}
                        containerStyle={{ backgroundColor: appcolor.surface }}
                    >
                        {ViewItem()}
                    </Tabs.Container>
                }
                {showProgress && <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />}
            </View>

            <ActionSheet
                ref={ref_bottomSheet}
                headerAlwaysVisible={true}
                defaultOverlayOpacity={0.3}
                indicatorColor={appcolor.primary}
                containerStyle={{ padding: 10 }}
            >
                {
                    mode === 'TOOLS' &&
                    <View style={{ padding: 8, width: '100%', marginBottom: 38 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600', padding: 8 }}>Công cụ</Text>
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.dark
                                }}
                                onPress={() => filterDoneData()}>
                                <Text style={{ color: appcolor.dark, width: '80%', textAlign: 'center' }} >Sản phẩm đã nhập</Text>
                                <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={23} color={!isDone ? appcolor.dark : appcolor.success} />
                            </TouchableOpacity>
                            {/* <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center',  }}> */}
                            <TouchableOpacity
                                style={{
                                    width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 12, justifyContent: 'space-between', borderRadius: 20, borderWidth: 0.5,
                                    borderColor: appcolor.danger
                                }}
                                onPress={() => setClearAll()}>
                                <Text style={{ color: appcolor.danger, width: '80%', textAlign: 'center' }} >Xóa dữ liệu đã nhập</Text>
                                <Icon name={'trash'} type={'ionicon'} size={23} color={appcolor.danger} />
                            </TouchableOpacity>
                            {/* </View> */}
                        </View>
                    </View>
                }
            </ActionSheet>
        </View>
    )
}

const RenderItemData = ({ item, isClear, appcolor, workinfo, totalRow, index }) => {
    const [inputDisplay, setInputDisplay] = useState(item.quanity);
    const [countClear, setCountClear] = useState(0)

    if ((!inputDisplay && item.quanity)) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && inputDisplay && isClear !== 0) {
        setInputDisplay(item.quanity)
    } else if (!item.quanity && isClear !== 0 && inputDisplay == 0 && isClear - countClear > 0) {
        setInputDisplay(null);
    }
    const editInputChange = async (e) => {
        let display = e.nativeEvent.text !== null && e.nativeEvent.text.length > 0 ? e.nativeEvent.text.toString().replace(/,/g, '') : null;
        let itemEdit = { ...item }
        itemEdit.quanity = (display !== '' && display !== undefined && display !== null) ? parseInt(display) : null
        await updateStockItem(itemEdit, workinfo)
    }
    const changeValueStock = async (text) => {
        isClear - countClear > 0 ? setCountClear(isClear) : null
        let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        if (isNotInteger(display))
            display = '';

        let intValue = display === '' ? null : parseInt(display);
        let itemEdit = { ...item }
        if (intValue || intValue === 0) {
            item.quanity = intValue
            itemEdit.quanity = intValue
            await setInputDisplay(intValue)
        } else {
            item.quanity = null
            itemEdit.quanity = null
            await setInputDisplay();
        }
        await updateStockItem(itemEdit, workinfo)
    }
    return (
        <View key={"tock" + item.productCode} style={{ width: '100%', alignItems: 'center' }} onPress={() => this.onItemPress(item)}>
            <View style={{ padding: 8, flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: appcolor.surface, marginBottom: 3, borderRadius: 5 }}>
                <View style={{ width: '70%', paddingEnd: 5 }}>
                    <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '600', textAlign: 'left' }}>{index + 1}. {item.productName}</Text>
                    <Text style={{ fontSize: 11, color: appcolor.dark, textAlign: 'left' }}>{item.productCode}</Text>
                </View>
                <NumberFormat
                    value={inputDisplay === 0 ? 0 : (inputDisplay || '')}
                    displayType='text'
                    thousandSeparator={true}
                    renderText={value =>
                        <TextInput
                            style={{
                                fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500',
                                width: '30%', textAlign: 'center',
                                borderWidth: 0.5, borderRadius: 5, borderColor: appcolor.greydark, height: 35,
                                textAlignVertical: 'center'
                            }}
                            value={value}
                            keyboardType={'numeric'}
                            placeholder={'Số lượng'}
                            placeholderTextColor={appcolor.greydark}
                            editable={item.upload === 1 ? false : true}
                            selectTextOnFocus={item.upload === 1 ? false : true}
                            onChangeText={
                                changeValueStock
                            }
                            onEndEditing={editInputChange}
                        >
                            {/* {inputDisplay?.toString()} */}
                        </TextInput>
                    } />
            </View>
            {
                index === totalRow - 1 && index > 10 && <View>
                    <Text style={{ width: '100%', height: 40, color: appcolor.dark, textAlign: 'center' }}>{'Đã xem hết'}</Text>
                </View>
            }
        </View>
    )
}