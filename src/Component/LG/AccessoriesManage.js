import { FlatList, ScrollView, TouchableOpacity, View, TextInput, Keyboard, Dimensions, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, CheckBox } from '@rneui/themed';
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { updateItemAceess, insertItemAceess, getLstCat, getLstSubCat, getLstAccess, getLstAccessResult, deleteItemAceess, updateNoteAceess, getLstAccessUpload } from "../../Controller/AccessoriesController";
import ActionSheet from "react-native-actions-sheet";
import FormGroup from "../../Content/FormGroup";
import { Message, ToastError } from "../../Core/Helper";
import Swiper from "react-native-swiper";
import Moment from 'moment';
import Icon from '@react-native-vector-icons/fontawesome6';
// import KeyboardSpacer from "react-native-keyboard-spacer";
import GmailStyleSwipeableRow from "../../Core/GmailStyleSwipeableRow";
import UploadController from "../../Controller/UploadController";
import { checkNetwork } from "../../Core/Utility";
import * as Progress from 'react-native-progress';
import { RenderCalendar } from "../../Core/DatePickerView";
import moment from "moment";


const styles = StyleSheet.create({
    line: {
        width: '100%',
        height: 0.6,
        backgroundColor: '#e9e9e9',
        paddingStart: 10,
        paddingEnd: 10,
        marginBottom: 4,
        marginTop: 4
    }
});

export const AccessoriesManage = ({ navigation, route }) => {
    const { kpiinfo, workinfo, appcolor } = useSelector(state => state.GAppState);
    const _bottomSheet = useRef();
    const swiperRef = useRef();
    const [arrTagShow] = useState([{ id: 1, name: 'NGÀNH HÀNG' }, { id: 2, name: 'LOẠI' }]);
    const [loadCat, setLoadCat] = useState(0);
    const [loadSubCat, setLoadSubCat] = useState(0);
    const [showProgress, setProgress] = useState(false);
    const [pageNum, setPageNum] = useState(0);
    const [Status, setStatus] = useState(0);
    const [note, setNote] = useState('');
    const [mode, setMode] = useState();

    const [dataList, setDataList] = useState([]);
    const [arrCat, setArrCat] = useState([]);
    const [arrInput, setArrInput] = useState([]);
    const [arrSheet, setArrSheet] = useState([]);
    const [lstShowRes, setLstShowRes] = useState([]);
    const [vendorList, setVendorList] = useState([]);
    const [yearList, setYearList] = useState([]);

    const [catSelect, setCatSelect] = useState();
    const [subCatSelect, setSubCatSelect] = useState();
    const [dateSelect, setDateSelect] = useState(new Date());
    const [valSelect, setValselect] = useState();
    const [itemEdit, setItemEdit] = useState();
    const handleCatClick = () => setLoadCat(loadCat + 1);
    const handleSubCatClick = () => setLoadSubCat(loadSubCat + 1);
    const uploadAction = async () => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        let lstAccess = await getLstAccessUpload(workinfo.workId);
        if (lstAccess && lstAccess.length === 0) {
            ToastError('Vui lòng làm báo cáo sau đó thử lại.')
            return
        }

        let itemsUp = [];
        lstAccess.filter(ip => {
            let valRes = null;

            if (ip.dateValue === 1) {
                valRes = ip.dateVal;
            }
            else if (ip.selectValue === 1) {
                valRes = ip.selectVal;
            }
            else if (ip.yearValue === 1) {
                valRes = ip.yearVal;
            }
            else if (ip.numberValue === 1) {
                valRes = ip.numberVal;
            }
            else if (ip.decimalValue === 1) {
                valRes = ip.decimalVal;
            }
            else if (ip.textValue === 1) {
                valRes = ip.textVal;
            }

            if (valRes !== null) {
                let item = {
                    ShopId: workinfo.shopId,
                    WorkDate: workinfo.workDate,
                    ShopProfileId: ip.shopProfileId,
                    ItemId: ip.itemId,
                    ItemValues: valRes,
                    Note: ip.note
                }

                itemsUp.push(item);
            }

        })


        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUp, work));
    }
    const UploadData = async (itemsUp, work) => {
        await setProgress(true);
        UploadController.DataAccessories(itemsUp, work, async () => {
            await setProgress(false);
            await loadDataRes();
        }, async () => {
            await setProgress(false);
        })
    }
    const getDataSheet = async () => {
        if (vendorList.length === 0) {
            let lstReport = kpiinfo?.reportItem;
            if (lstReport) {
                try {
                    let reportJson = JSON.parse(lstReport);
                    if (reportJson?.dataSheet) {
                        await setVendorList(reportJson?.dataSheet?.vendor);

                        if (reportJson?.dataSheet?.year) {
                            let arrYear = [];
                            var startPoint = 0;
                            var endPoint = 0;

                            let jsonYear = reportJson?.dataSheet?.year
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
    const loadDataRes = async () => {
        let lstAccess = await getLstAccessResult(workinfo.workId);
        if (lstAccess) {
            let lstTem = [];
            let lstIdCat = [];
            let lstSubCat = [];
            let haveNote = false;
            lstAccess.map((it, index) => {
                if (!lstIdCat.includes(it.categoryId)) {
                    lstIdCat.push(it.categoryId)
                    lstTem.push({ HeaderId: it.categoryId, HeaderName: it.categoryName })
                }
                if (!lstSubCat.includes(it.categoryType)) {
                    haveNote = false;
                    lstSubCat.push(it.categoryType);
                    lstTem.push({ subHeader: it.categoryType })
                }
                if (haveNote === false && it.note) {
                    haveNote = true
                    lstTem.push({ noteCategory: it.note, categoryType: it.categoryType, categoryId: it.categoryId, upload: it.upload })
                }

                lstTem.push(it);
                if (index === 0) {
                    let day = parseInt(moment(new Date()).format('YYYYMMDD'))
                    if (workinfo.workDate === day) {
                        setStatus(it.upload === 1 ? 1 : 0)
                    } else {
                        setStatus(1)
                    }
                }
            })
            await setLstShowRes(lstTem);
        }

    }
    const loadData = async () => {
        if (dataList.length === 0) {
            let lstAccess = await getLstAccess();
            setDataList(lstAccess);
            await loadDataCat();

            if (lstShowRes.length === 0) {
                await loadDataRes()
            }
        }
    }
    const loadDataCat = async () => {
        let lstTem = await getLstCat();
        await setArrCat(lstTem);
    }
    const resetArrSheet = async (arr) => {
        await setArrSheet([]);
        await setArrSheet(arr);
    }
    const loadDataSubCat = async (catName) => {
        let lstTem = await getLstSubCat(catName);
        await resetArrSheet(lstTem)
    }

    useEffect(() => {
        if (loadCat !== 0) {
            setSubCatSelect();
            resetArrSheet(arrCat)
        }
        return () => false;
    }, [loadCat])
    useEffect(() => {
        if (loadSubCat !== 0 && catSelect) {
            loadDataSubCat(catSelect.name);
            setPageNum(1);
        }
        return () => false;
    }, [loadSubCat])
    useEffect(() => {
        if (catSelect) {
            loadDataSubCat(catSelect.name);
            setPageNum(1);
        }
        return () => false;
    }, [catSelect])
    useEffect(() => {
        arrSheet.length > 0 && _bottomSheet.current.show()
    }, [arrSheet])
    useEffect(() => {
        loadData();
        getDataSheet();
        return () => false;
    })

    const OnSaveResult = async () => {
        Keyboard.dismiss();
        let itemI = null

        arrInput.map(async ip => {
            itemI = await createItem(ip);
            if (ip.dateValue === 1) {
                itemI = { ...itemI, dateVal: dateSelect }
            }
            else if (ip.yearValue === 1) {
                itemI = { ...itemI, yearVal: valSelect }
            }
            else if (ip.selectValue === 1 && ip.itemNameVN === 'Vendor') {
                itemI = { ...itemI, selectVal: valSelect }
            }
            else if (ip.numberValue === 1) {
                itemI = ip.numberVal ? { ...itemI, numberVal: ip.numberVal } : ToastError('Vui lòng nhập chọn done sau đó bấm thêm')
            }
            else if (ip.decimalValue === 1) {
                itemI = ip.decimalVal ? { ...itemI, decimalVal: ip.decimalVal } : ToastError('Vui lòng nhập chọn done sau đó bấm thêm')
            }
            else if (ip.textValue === 1) {
                itemI = ip.textVal ? { ...itemI, textVal: ip.textVal } : ToastError('Vui lòng nhập chọn done sau đó bấm thêm')
            }

            if (note) {
                if (note.length < 5) {
                    ToastError('Ghi chú ngắn, Vui lòng nhập ghi chú ít nhất 5 ký tự.')
                    return
                }
                itemI = { ...itemI, note: note }
            }

            if (itemI && itemI.itemId !== null) {
                await insertItemAceess(itemI, workinfo.workId);
            }

            await loadDataRes();
        })
    }
    const handleClickSelect = async (item) => {
        await setMode(
            item.dateValue === 1 ? 'DATE' :
                item.yearValue === 1 ? 'YEAR' :
                    item.selectValue === 1 ? ((item.selectValue === 1 && item.itemNameVN === 'Vendor') ? 'VENDOR' : 'SELECT') : undefined
        );

        await _bottomSheet.current.show();
    }
    const handleClickSelectRes = async (item) => {
        await setMode(
            item.dateValue === 1 ? 'DATER' :
                item.yearValue === 1 ? 'YEARR' :
                    item.selectValue === 1 ? ((item.selectValue === 1 && item.itemNameVN === 'Vendor') ? 'VENDORR' : 'SELECTR') : undefined
        );
        await setItemEdit(item)
        await _bottomSheet.current.show();
    }
    const handleChangeFormC = async (text, item) => {
        let textRes = text || '';

        let indexI = arrInput.findIndex(it => it.itemId === item.itemId)
        // console.log(indexI+' LLLL ',item)
        if (item.numberValue === 1) {
            arrInput[indexI].numberVal = textRes !== '' ? parseInt(textRes) : null
        }
        else if (item.decimalValue === 1) {
            arrInput[indexI].decimalVal = textRes !== '' ? parseInt(textRes) : null
        }
        else if (item.textValue === 1) {
            arrInput[indexI].textVal = textRes !== '' ? textRes : null
        }
        else {
            await setValselect(textRes);
        }
    }
    const createItem = async (ip) => {
        let itemR = {
            workId: workinfo.workId,
            categoryId: ip.categoryId,
            categoryName: ip.categoryName,
            categoryType: ip.categoryType,
            dateValue: ip.dateValue,
            decimalValue: ip.decimalValue,
            functionInput: ip.functionInput,
            itemId: ip.itemId,
            itemNameVN: ip.itemNameVN,
            numberValue: ip.numberValue,
            selectValue: ip.selectValue,
            shopProfileId: ip.shopProfileId,
            textValue: ip.textValue,
            yearValue: ip.yearValue,
            upload: 0
        };
        return itemR;
    }
    const handleChangeResCus = async (text, ip) => {

        if (text) {
            let quantity = parseInt(text);
            await setValselect(text)
            let itemI = await createItem(ip);

            if (ip.numberValue === 1) {
                itemI = (quantity ? { ...itemI, numberVal: quantity } : ToastError('Vui lòng nhập chọn done sau đó bấm lưu'))
            }
            if (ip.decimalValue === 1) {
                itemI = (quantity ? { ...itemI, decimalVal: quantity } : ToastError('Vui lòng nhập chọn done sau đó bấm lưu'))
            }
            if (ip.textValue === 1) {
                itemI = (quantity ? { ...itemI, textVal: quantity } : ToastError('Vui lòng nhập chọn done sau đó bấm lưu'))
            }

            if (itemI) {
                await updateItemAceess(itemI);
                await loadDataRes();
                // resetForm();
            }
        }
    }
    const updateNote = async (text, item) => {
        lstShowRes.filter((r, index) => {
            if (r.categoryType === item.categoryType) {
                lstShowRes[index].note = text;
                lstShowRes[index].noteCategory = text;
            }
        });

        await updateNoteAceess(item, text, workinfo);
    }
    const deleteItem = async (item) => {
        await deleteItemAceess(item, workinfo.workId);
        await loadDataRes();
    }
    const renderItemInput = ({ item }) => {
        return (
            <View style={{ flexGrow: 1 }}>
                {/* <Text>{JSON.stringify(item)}</Text> */}
                {
                    (item.dateValue === 1) &&
                    (
                        <FormGroup
                            containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                            key={item.itemId}
                            defaultValue={dateSelect || ''}
                            rightFunc={() => handleClickSelect(item)}
                            iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                            title={item.itemNameVN}
                            useClearAndroid={false}
                        />
                    )
                }
                {
                    (item.selectValue === 1 || item.yearValue === 1) &&
                    (
                        <FormGroup
                            containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                            key={item.itemId}
                            defaultValue={valSelect ? valSelect.toString() : ''}
                            rightFunc={() => handleClickSelect(item)}
                            iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                            title={item.itemNameVN}
                            useClearAndroid={false}
                        />
                    )
                }
                {
                    (item.numberValue === 1) &&
                    <FormGroup
                        containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                        key={'numres' + item.itemId}
                        defaultValue={item.numberVal || ''}
                        keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                        editable={true}
                        title={item.itemNameVN}
                        useClearAndroid={false}
                        // onEndEditing={(e) => handleChangeForm(e, item)}
                        handleChangeForm={(text) => handleChangeFormC(text, item)}
                    />
                }
                {
                    (item.decimalValue === 1) &&
                    <FormGroup
                        containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                        key={'numres' + item.itemId}
                        defaultValue={item.decimalVal || ''}
                        keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                        editable={true}
                        title={item.itemNameVN}
                        useClearAndroid={false}
                        // onEndEditing={(e) => handleChangeForm(e, item)}
                        handleChangeForm={(text) => handleChangeFormC(text, item)}
                    />
                }
                {
                    (item.textValue === 1) &&
                    <FormGroup
                        containerStyle={{ borderWidth: 1, borderColor: appcolor.darklight, borderRadius: 5 }}
                        key={'numres' + item.itemId}
                        defaultValue={item.textVal || ''}
                        keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                        editable={true}
                        title={item.itemNameVN}
                        useClearAndroid={false}
                        // onEndEditing={(e) => handleChangeForm(e, item)}
                        handleChangeForm={(text) => handleChangeFormC(text, item)}
                    />
                }

            </View>
        )
    }
    const renderItemRes = ({ item }) => {
        return (
            <GmailStyleSwipeableRow
                enableRight={(item.upload === 1 || 'HeaderName' in item || 'subHeader' in item || 'noteCategory' in item) ? true : false}
                key={item.itemId}
                deleteItem={() => deleteItem(item)}>
                <View style={{ flexGrow: 1, paddingBottom: 5 }}>
                    {'HeaderName' in item &&
                        <View style={{ width: '100%', height: 40, backgroundColor: appcolor.primary, justifyContent: 'center', paddingLeft: 10, borderRadius: 10 }}>
                            <Text style={{ width: '100%', color: appcolor.light, }}>
                                {item.HeaderName}
                            </Text>
                        </View>
                    }
                    {'subHeader' in item &&
                        <View style={{ width: '90%', height: 40, backgroundColor: appcolor.primary, justifyContent: 'center', paddingLeft: 20, borderRadius: 10, opacity: 0.7 }}>
                            <Text style={{ width: '100%', color: appcolor.light }}>
                                {item.subHeader}
                            </Text>
                        </View>
                    }
                    {
                        'noteCategory' in item &&
                        <>
                            <FormGroup
                                containerStyle={{ width: '90%' }}
                                inputStyle={{ height: 60 }}
                                editable={item.upload === 1 ? false : true}
                                key='yearres'
                                defaultValue={item.noteCategory}
                                title={'Ghi chú'}
                                useClearAndroid={false}
                                multiline={true}
                                numberOfLines={3}
                                placeholder={'Nhập ghi chú ở đây'}
                                handleChangeForm={(text) => updateNote(text, item)}
                            />
                            <CheckBox
                                checked={item.upload === 1 ? true : false}
                                containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                            />
                        </>
                    }

                    {/* <Text>{JSON.stringify(item)}</Text> */}
                    {
                        (item.dateValue === 1) &&
                        (
                            <>
                                <FormGroup
                                    containerStyle={{ width: '90%' }}
                                    key={'dateres' + item.itemId}
                                    defaultValue={item.dateVal || ''}
                                    disabledRightFunc={item.upload === 1 ? true : false}
                                    rightFunc={() => handleClickSelectRes(item)}
                                    iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                                    title={item.itemNameVN}
                                    useClearAndroid={false}
                                />
                                <CheckBox
                                    checked={item.upload === 1 ? true : false}
                                    containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                                />
                            </>
                        )
                    }
                    {
                        (item.yearValue === 1) &&
                        (
                            <>
                                <FormGroup
                                    containerStyle={{ width: '90%' }}
                                    key={'yearres' + item.itemId}
                                    defaultValue={item.yearVal + ''}
                                    disabledRightFunc={item.upload === 1 ? true : false}
                                    rightFunc={() => handleClickSelectRes(item)}
                                    iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                                    title={item.itemNameVN}
                                    useClearAndroid={false}
                                />
                                <CheckBox
                                    checked={item.upload === 1 ? true : false}
                                    containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                                />
                            </>
                        )
                    }
                    {
                        (item.selectValue === 1) &&
                        (
                            <>
                                <FormGroup
                                    containerStyle={{ width: '90%' }}
                                    key={'selectres' + item.itemId}
                                    disabledRightFunc={item.upload === 1 ? true : false}
                                    defaultValue={item.selectVal + ''}
                                    rightFunc={() => handleClickSelectRes(item)}
                                    iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                                    title={item.itemNameVN}
                                    useClearAndroid={false}
                                />
                                <CheckBox
                                    checked={item.upload === 1 ? true : false}
                                    containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                                />
                            </>
                        )
                    }
                    {
                        (item.numberValue === 1) &&
                        <>
                            <FormGroup
                                containerStyle={{ width: '90%' }}
                                key={'numres' + item.itemId}
                                defaultValue={item.numberVal + '' || ''}
                                keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                                editable={item.upload === 1 ? false : true}
                                title={item.itemNameVN}
                                useClearAndroid={false}
                                handleChangeForm={(text) => handleChangeResCus(text, item)}
                            />
                            <CheckBox
                                checked={item.upload === 1 ? true : false}
                                containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                            />
                        </>
                    }
                    {
                        (item.decimalValue === 1) &&
                        <>
                            <FormGroup
                                containerStyle={{ width: '90%' }}
                                key={'decimalres' + item.itemId}
                                defaultValue={item.decimalVal + '' || ''}
                                keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                                editable={item.upload === 1 ? false : true}
                                title={item.itemNameVN}
                                useClearAndroid={false}
                                handleChangeForm={(text) => handleChangeResCus(text, item)}
                            />
                            <CheckBox
                                checked={item.upload === 1 ? true : false}
                                containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                            />
                        </>
                    }
                    {
                        (item.textValue === 1) &&
                        <>
                            <FormGroup
                                containerStyle={{ width: '90%' }}
                                key={'textvalres' + item.itemId}
                                defaultValue={item.textVal || ''}
                                keyboardType={item.textValue === 1 ? 'default' : 'numeric'}
                                editable={item.upload === 1 ? false : true}
                                title={item.itemNameVN}
                                useClearAndroid={false}
                                handleChangeForm={(text) => handleChangeResCus(text, item)}
                            />
                            <CheckBox
                                checked={item.upload === 1 ? true : false}
                                containerStyle={{ height: 40, width: 40, position: 'absolute', right: -10 }}
                            />
                        </>
                    }

                </View>
            </GmailStyleSwipeableRow>
        )
    }
    const resetBottomSheet = async () => {
        await setMode()
        _bottomSheet.current.hide()
    }
    const resetForm = async () => {
        await setArrInput([]);
        await setCatSelect();
        await setSubCatSelect();
        await setNote('');
    }
    const ViewItem = () => {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    contentContainerStyle={{ padding: 8 }}
                    style={{ maxHeight: (arrInput && arrInput.length > 0) ? arrInput.length * 70 : 0, minHeight: 100 }}
                    extraData={arrInput}
                    key={(item) => item.id}
                    data={arrInput}
                    keyExtractor={(item, index) => item + index}
                    updateCellsBatchingPeriod={20}
                    windowSize={10}
                    renderItem={renderItemInput}
                />
                <Button containerStyle={{
                    width: '100%', height: 50,
                    backgroundColor: appcolor.tranparents,
                    alignItems: 'flex-end', right: 15, padding: 5
                }}
                    buttonStyle={{ backgroundColor: appcolor.primary }}
                    onPress={OnSaveResult} title={'Thêm'}></Button>
                <Icon sfize={25} name={'caret-up'} style={{ width: '100%', textAlign: 'center' }} onPress={() => resetForm()}></Icon>
                <View style={[styles.line, { backgroundColor: appcolor.darklight }]}></View>
            </View>
        )
    }
    const reloadCombineResult = async (item) => {
        await setArrInput([]);
        let lstFilter = dataList.filter(it => it.shopProfileId === item.shopProfileId)
        await setArrInput(lstFilter)
        _bottomSheet.current.hide()
    }
    const renderItemSelect = ({ item }) => {

        return (
            <TouchableOpacity onPress={async () => {
                if (pageNum === 0) {
                    // resetForm();
                    await setCatSelect(item);
                    setPageNum(1);
                }
                else if (pageNum === 1) {
                    await setSubCatSelect(item);
                    await reloadCombineResult(item);
                }

            }}>
                <View style={{ width: '100%', height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700' }}>{item.name}</Text>
                </View>
                <View style={[styles.line, { backgroundColor: appcolor.darklight }]}></View>
            </TouchableOpacity>
        )
    }
    const ViewSelect = () => {
        return (
            <ScrollView key={'ViewSelect'} style={{ flexGrow: 1 }} >
                {/* <Swiper
                ref={swiperRef}
                index={pageNum}
                loop={false}
                onIndexChanged={setPageNum}>
                { */}
                <FlatList
                    extraData={arrSheet}
                    key={(item) => item.id}
                    // keyExtractor={(_, index) => index.toString()}
                    data={arrSheet}
                    keyExtractor={(item, index) => item + index}
                    updateCellsBatchingPeriod={20}
                    windowSize={10}
                    renderItem={renderItemSelect}
                />
                {/* }
            </Swiper> */}
            </ScrollView>
        )
    }
    const renderItemVendor = ({ item }, type) => {
        return (
            <TouchableOpacity onPress={async () => {
                if (type === 'VENDOR' || type === 'YEAR') {
                    await setValselect(item.name);
                    await resetBottomSheet();
                }
                else if (type === 'VENDORR' || type === 'YEARR') {
                    if (itemEdit) {
                        let itemI = await createItem(itemEdit);
                        itemI = (itemI.selectValue === 1) ? { ...itemI, selectVal: item.name } : (itemI.yearValue === 1 ? { ...itemI, yearVal: item.name } : itemI)
                        if (itemI) {
                            await updateItemAceess(itemI);
                            await loadDataRes();
                            resetBottomSheet();
                        }
                    }
                }
            }}>
                <View style={{ width: '100%', height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700' }}>{item.name}</Text>
                </View>
                <View style={[styles.line, { backgroundColor: appcolor.darklight }]}></View>
            </TouchableOpacity>
        )
    }
    const handleDate = async (date, type) => {
        if (subCatSelect && type === 'DATE') {
            await setDateSelect(date)
            var index = arrInput.findIndex(it => it.shopProfileId === subCatSelect.shopProfileId)
            arrInput[index].dateVal = date;
            resetBottomSheet();
        }
        else {
            await setDateSelect(date);
            if (itemEdit) {
                let itemI = await createItem(itemEdit);
                itemI = { ...itemI, dateVal: date }

                if (itemI) {
                    await updateItemAceess(itemI);
                    await loadDataRes();
                    resetBottomSheet();
                }
            }

        }
    }
    const ModeView = (type) => {
        var uiviews = [];
        switch (type) {
            case 'DATE':
            case 'DATER':
                uiviews.push(
                    <View key={'date'} style={{ height: '80%' }}>
                        <RenderCalendar appcolor={appcolor}
                            currentDate={dateSelect}
                            handleDisplay={date => handleDate(date, type)}
                        // onSelect={onChangeDate}
                        />
                    </View>
                )
                break;
            case 'VENDOR':
            case 'VENDORR':
                uiviews.push(
                    <ScrollView key='vendor' style={{ height: '60%' }}>
                        <FlatList
                            scrollEnabled
                            data={vendorList}
                            renderItem={item => renderItemVendor(item, type)}
                            numColumns={1}
                        ></FlatList>
                    </ScrollView>
                )
                break;
            case 'YEAR':
            case 'YEARR':
                uiviews.push(
                    <ScrollView key={'year'} style={{ height: '60%' }}>
                        <FlatList
                            scrollEnabled
                            data={yearList}
                            renderItem={item => renderItemVendor(item, type)}
                            numColumns={1}
                        ></FlatList>
                    </ScrollView>
                )
                break;
            default:
                uiviews.push(
                    <View key={'default'} style={{ height: '75%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', height: 50 }} >
                            {
                                pageNum !== 0 &&
                                <TouchableOpacity style={{ width: '33%' }} onPress={async () => {
                                    await setPageNum(0);
                                    await setArrSheet(arrCat);
                                }}>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: appcolor.dark, textAlign: 'left' }}>{'Quay lại'}</Text>
                                </TouchableOpacity>
                            }
                            <Text style={{ fontSize: 15, fontWeight: '700', width: pageNum !== 0 ? '33%' : '100%', color: appcolor.dark, textAlign: 'center' }}>{arrTagShow[pageNum].name}</Text>
                        </View>
                        <View style={[styles.line, { backgroundColor: appcolor.dark }]}></View>

                        <View style={{ flexGrow: 1 }}>
                            {ViewSelect()}
                        </View>
                    </View>
                )
                break;
        }

        return uiviews
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight={Status === 0 ? 'cloud-upload-alt' : 'check'}
                leftFunc={() => navigation.goBack()}
                rightFunc={() => Status === 0 ? uploadAction() : ToastError('Đã gửi báo cáo.')}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>

                <TouchableOpacity style={{ width: '48%' }}
                    onPress={async () => handleCatClick()}
                >
                    <FormGroup
                        containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, padding: 3, paddingEnd: 8, width: '80%' }}
                        rightFunc={handleCatClick}
                        iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                        title={'Ngành hàng'}
                        value={catSelect?.name || '--- chon --'}
                        useClearAndroid={false}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={{ width: '48%' }}
                    onPress={async () => handleSubCatClick()}

                >
                    <FormGroup
                        containerStyle={{ backgroundColor: appcolor.grayLight, margin: 8, padding: 3, paddingEnd: 8, width: '80%' }}
                        rightFunc={handleSubCatClick}
                        iconRight="caret-down" iconRightStyle={{ color: appcolor.primary }}
                        title={'Loại'}
                        value={subCatSelect?.name || '--- chon --'}
                        useClearAndroid={false}
                    />
                </TouchableOpacity>

            </View>
            {
                subCatSelect &&
                <FormGroup
                    containerStyle={{ marginHorizontal: 10, maxHeight: 100, borderWidth: 1, borderColor: appcolor.darklight }}
                    inputStyle={{ height: 70 }}
                    editable={Status === 1 ? false : true}
                    key='notecommon'
                    defaultValue={note}
                    title={'Ghi chú'}
                    useClearAndroid={false}
                    multiline={true}
                    numberOfLines={3}
                    placeholder={'Nhập ghi chú ở đây'}
                    handleChangeForm={(text) => setNote(text)}
                />
            }

            {arrInput.length > 0 && <ViewItem />}

            {/* Result List */}
            <FlatList
                style={{ flex: 1, backgroundColor: appcolor.darklight }}
                contentContainerStyle={{ padding: 5 }}
                extraData={lstShowRes}
                key={(item) => item.id}
                data={lstShowRes}
                keyExtractor={(item, index) => item + index}
                updateCellsBatchingPeriod={20}
                windowSize={10}
                renderItem={renderItemRes}
            />
            {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 30 : null} /> */}

            {/* Bottom sheet */}
            <ActionSheet
                onClose={async () => {
                    await setPageNum(0);
                    await setMode();
                }}
                ref={_bottomSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 8, flexGrow: 1, backgroundColor: appcolor.homebackground }}>
                {ModeView(mode)}
            </ActionSheet>

            {
                showProgress && <View style={{
                    position: 'absolute', alignItems: 'center', alignSelf: "center",
                    marginTop: Dimensions.get('window').height / 2
                }}><Progress.Circle thickness={1} size={65} indeterminate={true} />
                    <Text style={{ color: '#007AFF' }}>...</Text></View>
            }

        </View>
    )
}