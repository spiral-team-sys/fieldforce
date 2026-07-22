import React, { useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { clearDataTrackingSellOut, getDataCompetitor, getListCatProduct, getTrackingSellOutResult, updateItemTrackingSellOut, uploadTrackingSellOut } from "../../Controller/SellOutController";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { useSelector } from "react-redux";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab } from "../../Core/Utility";
////import { NumericFormat } from "react-number-format";;
import { isNotInteger, Message, ToastError, ToastSuccess } from "../../Core/Helper";
import FormGroup from "../../Content/FormGroup";
import { Icon } from '@rneui/themed';
import ActionSheet from "react-native-actions-sheet";
import { LoadingView } from "../../Control/ItemLoading";
import moment from "moment";
import { checkLockReport } from "../../Controller/ShopController";

export const ReportCheckSell = ({ navigation, route }) => {
    const { kpiinfo, appcolor, workinfo, shopinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataTab: [], dataCompetitor: [], dataCompetitorF: [] })
    const [_, setMutate] = useState(false)
    const [search, setSearch] = useState('')
    const ref_bottomSheet = useRef()
    const [isDone, setDone] = useState(false)
    const [showProgress, setProgress] = useState(false)
    const [Status, setStatus] = useState(0)
    const [isLockReport, setLockReport] = useState(false)
    const styles = StyleSheet.create({
        sheetContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, width: '100%' },
        sheetTitle: { color: appcolor.dark, fontSize: 18, fontWeight: '700', paddingTop: 4 },
        sheetSubTitle: { color: appcolor.greydark || appcolor.placeholderText, fontSize: 12, paddingTop: 4, paddingBottom: 12 },
        sheetAction: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, marginTop: 8, borderRadius: 12, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.light },
        sheetActionDanger: { borderColor: appcolor.danger, backgroundColor: appcolor.light },
        sheetIconView: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.grayLight },
        sheetIconDanger: { backgroundColor: appcolor.surface },
        sheetActionText: { color: appcolor.dark, flex: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
        sheetActionTextDanger: { color: appcolor.danger }
    })

    useEffect(() => {
        const _load = loadData()
        return () => _load
    }, [])

    const loadData = async () => {
        await setProgress(true)
        const isCheck = await checkLockReport(shopinfo)
        await setLockReport(isCheck)
        let lstRes = await getTrackingSellOutResult(workinfo);
        let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setStatus(isUpload)
        } else {
            await setStatus(1)
        }
        const listTab = await getListCatProduct()
        const listData = await getDataCompetitor(workinfo)
        await setData({ dataTab: listTab, dataCompetitor: listData, dataCompetitorF: listData })
        setTimeout(async () => { await setProgress(false) }, 1000)
    }
    const uploadAction = async () => {
        await Keyboard.dismiss()
        let lstRes = await getTrackingSellOutResult(workinfo);
        let noteStr = '';

        if (Status === 1) {
            ToastError("Báo cáo đã khóa");
            return;
        }

        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate !== day) {
            ToastError('Bạn đang báo cáo dữ liệu ngày cũ!')
            return
        }

        if (lstRes.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        let checkAmount = lstRes.filter(it => (it.quantity !== 'null' && it.quantity !== null) &&
            (it.amount !== null && it.amount !== 'null' && (it.amount < 10000 || it.amount % 1000 > 0)));
        if (checkAmount.length > 0) {
            let competitor = data.dataCompetitorF.filter(it => it.id === checkAmount[0].id)
            ToastError('Vui lòng nhập giá đúng định dạng. Hãng: ' + competitor[0].competitorName + ' - Ngành hàng : ' + competitor[0].categoryName, "Thông báo", "top");
            return;
        }

        let items = lstRes.filter(it => (it.quantity === 'null' || it.quantity === null) &&
            ((it.amount !== 'null' && it.amount !== null && it.amount > 0)));
        // console.log(items, 'check item');
        if (items.length > 0) {
            let competitor = data.dataCompetitorF.filter(it => it.id === items[0].id)
            ToastError('Bạn đã nhập tổng tiền nhưng chưa nhập số lượng. Hãng: ' + competitor[0].competitorName + ' - Ngành hàng : ' + competitor[0].categoryName, 'Thông báo', 'top');
            return;
        }

        let checkQuantity = lstRes.filter(it => (it.quantity === 0 && it.quantity !== null) &&
            ((it.amount !== 'null' && it.amount !== null && it.amount > 0)));
        // console.log(items, 'check item');
        if (checkQuantity.length > 0) {
            let competitor = data.dataCompetitorF.filter(it => it.id === checkQuantity[0].id)
            ToastError('Bạn đã nhập tổng tiền nhưng số lượng phải lớn hơn 0. Hãng: ' + competitor[0].competitorName + ' - Ngành hàng : ' + competitor[0].categoryName, 'Thông báo', 'top');
            return;
        }

        let itemsUpload = lstRes.filter(it => it.quantity !== 'null' && it.quantity !== null);
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        if (noteStr !== '') {
            ToastError(noteStr);
            return
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload));
    }
    const UploadData = async (lstRes) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await uploadTrackingSellOut(lstRes, work, async () => {
            await loadData();
        }, async () => {
        })
    }
    const filterProduct = async (text) => {
        let dataSearch = []
        if (isDone)
            dataSearch = data.dataCompetitorF.filter(it => (it.quantity !== null && it.quantity >= 0) || (it.amount !== null && it.amount >= 0))
        else
            dataSearch = data.dataCompetitorF

        if (text !== null && text.length > 0) {
            const mResult = await dataSearch.filter((it) => {
                const nameProduct = it.competitorName ? it.competitorName.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return nameProduct.indexOf(textData) > -1
            })
            data.dataCompetitor = mResult;
        } else {
            data.dataCompetitor = dataSearch;
        }
        setMutate(e => !e)
    }
    const filterDoneProduct = async () => {
        if (!isDone) {
            let lstRes = data.dataCompetitor.filter(it => (it.quantity !== null && it.quantity >= 0) || (it.amount !== null && it.amount >= 0))
            data.dataCompetitor = lstRes;
        } else {
            data.dataCompetitor = data.dataCompetitorF;
        }
        await setDone(e => !e)
    }
    const setClearAll = async () => {
        if (Status !== 1) {
            Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
                async () => {
                    await clearDataTrackingSellOut(workinfo);
                    await setDone(false)
                    await loadData()
                    ref_bottomSheet.current?.hide()
                })
        } else {
            ToastError('Dữ liệu đã được gửi lên hệ thống bạn không thể xóa!')
            ref_bottomSheet.current?.hide()
        }
    }
    const onChangeValue = async (item, text, type) => {
        let display = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
        if (isNotInteger(display))
            display = '';
        let intValue = display === '' ? null : parseInt(display);
        if (intValue || (intValue === 0 && type == 'quantity')) {
            item[type] = intValue
        } else {
            item[type] = null
        }
        setMutate(e => !e)
        // const index = data.dataCompetitorF.findIndex(it => it.id === item.id)
        updateItemTrackingSellOut(item, workinfo)
    }
    const onEndChangeValue = async (item, text) => {
        if (text && text < 10000) {
            item.amountValueError = 1
            item.amount = null
            ToastError('nhập số tiền phải lớn hơn 10000!!', 'Thông báo', 'top')
            setMutate(e => !e)
            updateItemTrackingSellOut(item, workinfo)
            return
        } else if (text && text % 1000 > 0) {
            item.amountValueError = 1
            item.amount = null
            ToastError('nhập số tiền không được lẻ!!', 'Thông báo', 'top')
            setMutate(e => !e)
            updateItemTrackingSellOut(item, workinfo)
            return
        } else {
            item.amountValueError = 0
            setMutate(e => !e)
        }
    }
    const renderItem = ({ item, index }) => {

        const onChangeText = (text, type) => {
            onChangeValue(item, text, type)
        }
        const onEndChangeAmount = (event) => {
            let value = event.nativeEvent.text !== null && event.nativeEvent.text.length > 0 ? event.nativeEvent.text.toString().replace(/,/g, '') : null
            if (isNotInteger(value))
                value = '';
            let intValue = value === '' ? null : parseInt(value);
            onEndChangeValue(item, intValue)
        }

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1, padding: 5, marginBottom: 8, borderRadius: 5, alignItems: 'center', backgroundColor: appcolor.surface, borderBottomColor: appcolor.greydark }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '600', textAlign: 'left' }}>{index + 1}. {item.competitorName}</Text>
                </View>

                <NumericFormat
                    value={item.quantity === 0 ? 0 : (item.quantity || '')}
                    displayType='text'
                    thousandSeparator={true}
                    renderText={value =>
                        <TextInput
                            textAlign={'center'}
                            value={value}
                            style={{
                                fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500',
                                width: '25%', textAlign: 'center', borderWidth: 0.5, borderRadius: 7, borderColor: appcolor.greydark, height: 35
                            }}
                            keyboardType='numeric'
                            placeholder='Số lượng'
                            placeholderTextColor={appcolor.greydark}
                            editable={item.upload === 1 ? false : true}
                            selectTextOnFocus={item.upload === 1 ? false : true}
                            onChangeText={text => onChangeText(text, 'quantity')}
                        // onEndEditing={e => endInputDisplay(item, e)}
                        />
                    }
                />

                <NumericFormat
                    value={item.amount || ''}
                    displayType='text'
                    thousandSeparator={true}
                    renderText={value =>
                        <TextInput
                            textAlign={'center'}
                            value={value}
                            style={{
                                fontSize: 12, color: appcolor.dark,
                                backgroundColor: item.amountValueError === 1 ? appcolor.warning : appcolor.light,
                                borderWidth: 0.5,
                                fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 7,
                                borderColor: appcolor.greydark, height: 35, left: 2, width: '25%',
                            }}
                            keyboardType='numeric'
                            placeholder='Tổng tiền'
                            placeholderTextColor={appcolor.greydark}
                            editable={item.upload === 1 ? false : true}
                            selectTextOnFocus={item.upload === 1 ? false : true}
                            onChangeText={text => onChangeText(text, 'amount')}
                            onEndEditing={e => onEndChangeAmount(e)}
                        />
                    }
                />
            </View>
        )
    }
    const ViewItem = () => {
        return (
            data.dataTab?.map((it, indexCate) => {
                let dataByCategoryId = data.dataCompetitor.filter(item => it.categoryId === item.categoryId)
                const totalRow = dataByCategoryId.length
                return (
                    <Tabs.Tab key={it.categoryName + indexCate} label={it.categoryName + `${totalRow !== 0 ? ` (${totalRow})` : ''}`}
                        name={it.categoryName + `${totalRow !== 0 ? `(${totalRow})` : ''}`} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            {!showProgress &&
                                <FlatList
                                    contentContainerStyle={{ paddingBottom: 30 }}
                                    key={(item) => item.id}
                                    keyExtractor={(item, index) => item + index}
                                    data={dataByCategoryId}
                                    initialNumToRender={10}
                                    // updateCellsBatchingPeriod={20}
                                    removeClippedSubviews={true}
                                    windowSize={10}
                                    renderItem={renderItem}
                                    ListFooterComponent={
                                        <View style={{ height: deviceHeight / 2.5 }}>
                                            <Text style={{ width: '100%', color: appcolor.dark, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>Đã xem hết</Text>
                                        </View>}
                                />
                            }
                        </View>
                    </Tabs.Tab >
                )
            })
        )
    }
    const openSheet = async () => {
        await Keyboard.dismiss()
        ref_bottomSheet.current.show()
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconRight={!isLockReport ? (Status !== 1 ? 'cloud-upload-alt' : null) : 'user-lock'}
                rightFunc={() => !isLockReport ? (Status !== 1 ? uploadAction() : null) : ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')}
                leftFunc={() => navigation.goBack()}
                middleFunc={openSheet}
                iconMiddle='poll-h'
            />
            <FormGroup
                editable
                containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, alignSelf: 'center' }}
                inputStyle={{ fontSize: 14, color: appcolor.dark }}
                placeholder='Tìm kiếm sản phẩm'
                iconName='search'
                onClearTextAndroid={filterProduct}
                handleChangeForm={filterProduct}
            />
            {
                data.dataTab?.length > 0 &&
                <Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            tabStyle={{ minWidth: minWidthTab(data.dataTab), height: 42 }}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    {ViewItem()}
                </Tabs.Container>
            }
            <ActionSheet
                ref={ref_bottomSheet}
                headerAlwaysVisible={true}
                defaultOverlayOpacity={0.3}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.light, alignSelf: 'center', padding: 10 }}
            >
                <View style={styles.sheetContainer}>
                    <Text style={styles.sheetTitle}>Công cụ</Text>
                    <Text style={styles.sheetSubTitle}>Quản lý nhanh dữ liệu sell-out đã nhập</Text>
                    <TouchableOpacity style={styles.sheetAction} onPress={() => filterDoneProduct()}>
                        <View style={styles.sheetIconView}>
                            <Icon name={!isDone ? 'checkmark-circle-outline' : 'check-circle'} type={!isDone ? 'ionicon' : ''} size={22} color={!isDone ? appcolor.dark : appcolor.success} />
                        </View>
                        <Text style={styles.sheetActionText}>Sản phẩm đã nhập</Text>
                        <Icon name='chevron-forward' type='ionicon' size={18} color={appcolor.greydark || appcolor.placeholderText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sheetAction, styles.sheetActionDanger]} onPress={() => setClearAll()}>
                        <View style={[styles.sheetIconView, styles.sheetIconDanger]}>
                            <Icon name={'trash'} type={'ionicon'} size={22} color={appcolor.danger} />
                        </View>
                        <Text style={[styles.sheetActionText, styles.sheetActionTextDanger]}>Xóa dữ liệu đã nhập</Text>
                        <Icon name='chevron-forward' type='ionicon' size={18} color={appcolor.danger} />
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            {
                showProgress &&
                <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 2 }}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
        </View>
    )
}
