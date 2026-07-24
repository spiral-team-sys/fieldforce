import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TextInput, Dimensions, KeyboardAvoidingView, Modal, FlatList, TouchableOpacity, Keyboard, StyleSheet } from "react-native";
import { Icon, Button, CheckBox, Divider } from '@rneui/themed';
import { getDisplayResult, insertDisplay, insertPriceOfDisplay, getDisplayHistory, deleteAllDisplayResult, getCompetitorProductBy, getProductDisplayReport, getAllProduct, getDisplayUpload, uploadDisplayData, getAllPhotosUpload, getPhotosReport } from '../../Controller/WorkController'
import { updateNoteDisplayReport, getNoteDisplayReport } from '../../Controller/WorkController'
import * as Progress from 'react-native-progress';
import { checkNetwork, Capitalize, deviceWidth, deviceHeight, alertPrint, minWidthTab } from "../../Core/Utility";
import { Message, MessageInfo, ToastError } from '../../Core/Helper';
import { AppNameBuild, _competitorId } from '../../Core/URLs';
import Moment from 'moment';
import { All_Select } from '../common';
import { isIphoneX } from '../../Core/is-iphone-x';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';
import UploadController from '../../Controller/UploadController';
const HEADER_SIZE = Platform.OS == 'android' ? 50 : (isIphoneX() ? 90 : 20);
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view"
import { scaleSize } from '../../Themes/AppsStyle';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
// //import NumberFormat from "react-number-format";
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

// import KeyboardSpacer from 'react-native-keyboard-spacer';
export const DisplayReport = ({ navigation, route }) => {
    const [arrTagShow, setArrTagShow] = useState([]);
    const [arrDataShow, setArrDataShow] = useState([]);
    const [arrDataShowF, setArrDataShowF] = useState([]);
    const [competitorSelect, setCompetitorSelect] = useState(null);
    const [Lstcompetitor, setLstcompetitor] = useState([]);
    const [noteSaved, setNoteSaved] = useState('');
    const [isHiddenNote, setNote] = useState(true);
    const [showProgress, setProgress] = useState(false);
    const [isDone, setDone] = useState(false);
    const [Status, setStatus] = useState(false);
    const { shopinfo, appcolor, workinfo, kpiinfo, userinfo } = useSelector(state => state.GAppState);
    const [isClear, setClear] = useState(0);
    const [indexTab, setIndexTab] = useState(0);
    const [reload, setReload] = useState(0);
    const [mode, setMode] = useState();
    const [search, setSearch] = useState('');
    const [LstMenuPhotos, setLstMenuPhotos] = useState([]);
    const [numLimitPhoto, setNumLimitPhoto] = useState();
    const [isConstraint, setConstraint] = useState();

    const loadCompetitor = async () => {
        let competitors = [];
        let comTem = await getCompetitorProductBy(_competitorId);
        let itemComTem = { id: 0, name: All_Select };
        competitors.push(itemComTem);
        comTem.map(itemc => {
            competitors.push(itemc);
        })

        await setLstcompetitor(competitors);
    }
    const loadDataShow = async () => {
        await setArrDataShow([]);
        let lstItemsProgram = await getProductDisplayReport(competitorSelect, search);
        await setArrDataShowF(lstItemsProgram);
        await MapItemRes(lstItemsProgram, indexTab);
    }
    const checkLastItem = (lst, count) => {
        var last = false
        if (lst.length === count) {
            var sizeDevice = count * 55;
            if (sizeDevice > deviceHeight) {
                last = true;
            }
        }
        return last
    }
    const MapItemRes = async (lstData, i) => {
        let lstRes = await getDisplayResult(workinfo);
        let isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
        // lstRes.length > 0 && setNoteCommon(lstRes[0].note);
        setStatus(isUpload)

        let lstTab = [];
        let lstCate = [];
        lstData.map((it, index) => {
            let itemCate = it.categoryName
            if (!lstCate.includes(itemCate)) {
                lstCate.push(itemCate);
                let lstFil = lstData.filter(it => it.division.includes(itemCate))
                lstTab.push({ id: index, name: itemCate, idCom: it.type, countRes: 0 });
            }
        })
        await setArrTagShow(lstTab);

        let lstFilter = lstData.filter(it => it.categoryName.includes(lstTab[i].name))
        let lstMap = [];
        var count = 0;
        lstFilter.map(it => {
            count += 1;
            let check = checkLastItem(lstFilter, count);
            let itemsHave = lstRes.filter(ir => ir.productId === it.productId)

            if (!isDone) {
                if (itemsHave.length > 0) {
                    let note = itemsHave[0].note;
                    console.log('NNNN ', itemsHave[0])
                    lstMap.push({ ...it, display: itemsHave[0].quanity, price: itemsHave[0].price, upload: isUpload, note: note, lastItem: check });

                }
                else {
                    lstMap.push({ ...it, upload: isUpload, lastItem: check });
                }
            }
            else {
                let lstDone = itemsHave.filter(it => (it.quanity !== 'null' && it.quanity !== null) || (it.price !== 'null' && it.price !== null))
                if (lstDone.length > 0) {
                    let note = lstDone[0].note;
                    lstMap.push({ ...it, display: lstDone[0].quanity, price: lstDone[0].price, upload: isUpload, note: note, lastItem: check });

                }
            }

        })

        await setArrDataShow(lstMap);
    }
    const getMenuPhotos = async () => {
        let lstReport = kpiinfo?.reportItem;
        if (lstReport) {
            try {
                let reportJson = JSON.parse(lstReport);

                if (reportJson.isConstraint !== undefined) {
                    setConstraint(reportJson.isConstraint);
                }

                if (reportJson.image !== undefined) {
                    setNumLimitPhoto(reportJson.image);
                }

                let itemTem = [];
                if (reportJson.ImageByList) {
                    // let keysCat = Object.keys(reportJson.ImageByList);
                    // console.log('ZZZZ ',keysCat);
                    await setLstMenuPhotos(reportJson.ImageByList);
                }

            } catch (error) {
                console.log(error)
            }
        }
    }
    useEffect(() => {
        getMenuPhotos();
        insertHistory();
        loadCompetitor();
        loadDataShow();
        return () => false;
    }, [indexTab, isDone, isClear, search, reload])
    const reloadView = async () => {
        await setArrTagShow([]);
        indexTab !== 0 ? await setIndexTab(0) : await setReload(reload + 1);
    }
    const insertHistory = async () => {
        var resDisplay = [];
        resDisplay = await getDisplayUpload(workinfo.workId);

        if (isClear === 0 && (resDisplay && resDisplay.length === 0)) {
            let displayHistory = await getDisplayHistory(workinfo);
            // console.log('His: ', displayHistory);
            let lstProduct = await getAllProduct();

            displayHistory.map(async (itemHis) => {
                let itemsHave = resDisplay.filter(itemRes => itemRes.productId === itemHis.productId)
                if (itemsHave.length === 0) {
                    let lstHave = lstProduct.filter(itemP => itemP.productId === itemHis.productId)
                    if (lstHave !== undefined && Array.isArray(lstHave)) {
                        let item = lstHave[0];
                        let itemInsert = {
                            workId: workinfo.workId,
                            productId: item.productId,
                            subCatId: item.categoryId,
                            quanity: itemHis.hDisplay,
                            price: itemHis.hPrice,
                            displayRef: item.category,
                            subCategory: item.subCategory,
                            division: item.division,
                            displayComment: '',
                            upload: 0
                        }

                        await insertDisplay(itemInsert);
                    }
                }
            });
        }
    }
    const checkConstraintIMG = (finish) => {
        let noteStr = '';
        let res = true;
        arrTagShow.map((itT) => {
            if (LstMenuPhotos[itT.name]) {
                let lstTem = LstMenuPhotos[itT.name];
                lstTem.map(async it => {
                    let photoType = 'Display' + '_' + it.code
                    let lstPhoto = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate);
                    if (lstPhoto.length < it.numberIMG && res) {
                        console.log(it.nameVN)
                        noteStr += itT.name + ': Vui lòng chụp ' + it.numberIMG + ' tấm hình cho ' + it.nameVN + ', ';
                        finish(noteStr);
                        res = false;
                    }
                })
            }
        })

        return noteStr;
    }
    const uploadAction = async () => {
        Keyboard.dismiss();

        let resDisplay = await getDisplayResult(workinfo);
        let resPhotos = await getAllPhotosUpload(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);

        let noteStr = '';
        if (isConstraint !== undefined && isConstraint === 1) {

            if (numLimitPhoto !== undefined && numLimitPhoto > 0 && resPhotos.length < numLimitPhoto) {
                noteStr += 'Vui lòng chụp ' + numLimitPhoto + ' tấm hình cho báo cáo.';
            }

            if (numLimitPhoto !== undefined && numLimitPhoto === 0) {
                await checkConstraintIMG((res) => { noteStr = res });
            }
        }

        if (Status !== 0) {
            ToastError("Báo cáo đã khóa");
            return;
        }

        if (resDisplay.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        let items = resDisplay.filter(it => (it.quanity === 'null' || it.quanity === null) && (it.price !== 'null' && it.price !== null && it.price > 0));
        if (items.length > 0) {
            let product = arrDataShowF.filter(it => it.productId === items[0].productId)
            ToastError('Bạn đã nhập giá nhưng chưa nhập số lượng. Hãng: ' + product[0].marketName + ' - sản phẩm: ' + product[0].productName);
            return;
        }

        let itemsUpload = resDisplay.filter(it => it.quanity !== 'null' && it.quanity !== null);
        console.log('up: ', itemsUpload)
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        if (noteStr !== '') {
            ToastError(noteStr);
            return
        }

        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload, resPhotos));
    }
    const setClearAll = async () => {
        await deleteAllDisplayResult(workinfo.workId);
        await setClear(isClear + 1);
    }
    const UploadData = async (resDisplay, resPhotos) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }



        if (AppNameBuild === 'lg') {
            UploadController.DataDisplay(resDisplay, work, async () => {
                await setProgress(false);
                await loadDataShow();
            }, async () => {
                await setProgress(false);
            })
        }
        else {
            const date = moment(new Date()); // Thursday Feb 2015
            const countDate = date.day();

            if (Array.isArray(resDisplay) && resDisplay.length == 0) {
                ToastError('Bạn chưa làm báo cáo.');
                return
            }

            await setProgress(true);
            uploadDisplayData(resDisplay, resPhotos, workinfo, async (message) => {
                await setProgress(false);
                loadDataShow();
                resPhotos.length > 0 ? UploadFilePhoto(resPhotos) : MessageInfo(message);
            }, async () => {
                await setProgress(false);
            })
        }

    }
    const UploadFilePhoto = async (lstPhotos) => {
        await uploadAllDataPhoto(lstPhotos);
    }
    const cancelNote = async () => {
        await setNote(true);
        await setNoteSaved('');
        await setMode();
    }
    const updateNote = async () => {
        if (noteSaved === undefined) {
            ToastError('Vui lòng nhập ghi chú.');
            return
        }

        if (noteSaved.length > 1 && noteSaved.length < 10) {
            ToastError('Vui lòng nhập ghi chú ít nhất 10 ký tự.');
            return
        }

        setNote(false);
        let itemNote = {
            workId: workinfo.workId,
            displayRef: arrTagShow[indexTab].name,
            displayComment: noteSaved,
            division: competitorSelect
        }

        console.log(itemNote)
        updateNoteDisplayReport(itemNote);
        await setMode();
    }
    const handleChangeTab = async (i, from) => {
        await setIndexTab(i);
    }
    const setCompeSelect = async (name) => {
        await setCompetitorSelect(name);
        await setMode();
        await reloadView();
    }
    const updateSearch = async (search) => {

        if (search !== '') {
            await setSearch(search);
            // setArrDataShow(arrDataShowF.filter(item => item.productName.toLowerCase().match(search.toLowerCase())))
        }
        else {
            await setSearch(search);
            // setArrDataShow(arrDataShowF)
        }
    };
    const ViewItem = () => {
        return (
            arrTagShow.map(it => {
                return (
                    <Tabs.Tab key={Capitalize(it.name)} label={Capitalize(it.name)} name={Capitalize(it.name)} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            <View style={{
                                backgroundColor: appcolor.surface, flexDirection: 'row',
                                justifyContent: 'space-between', padding: 12
                            }}>
                                {
                                    (userinfo.typeId === 138 || userinfo.typeId === 139 || userinfo.typeId === 140 || userinfo.typeId === 60) ?
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('PhotoItems', { Photos: (arrTagShow[indexTab].name) ? LstMenuPhotos[arrTagShow[indexTab].name] : [], Status: Status })}
                                                style={{ height: 40, width: '45%', marginRight: 2 }}>
                                                <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={25} />
                                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Chụp hình</Text>
                                            </TouchableOpacity>
                                            <View style={{ width: 2, backgroundColor: appcolor.light }} />
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    let lst = await getNoteDisplayReport(workinfo.workId, arrTagShow[indexTab].name, competitorSelect)
                                                    if (lst) {
                                                        console.log(lst)
                                                        lst.length > 0 && await setNoteSaved(lst[0].displayComment);
                                                    }
                                                    await setMode('NOTE')
                                                }}
                                                style={{ height: 40, width: '45%', marginRight: 2 }}>
                                                <SpiralIcon name='create-outline' color={appcolor.primary} type='ionicon' size={25} />
                                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Ghi chú</Text>
                                            </TouchableOpacity>
                                        </View> :
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <TouchableOpacity
                                                onPress={() => Status !== 1 && takePhoto(navigation, workinfo, kpiinfo, competitorSelect, arrTagShow[indexTab].name)}
                                                style={{ height: 40, width: '45%', marginRight: 2 }}>
                                                <SpiralIcon name='camera' color={appcolor.primary} type='ionicon' size={25} />
                                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Chụp hình</Text>
                                            </TouchableOpacity>
                                            <View style={{ width: 2, backgroundColor: appcolor.light }} />

                                            <TouchableOpacity
                                                onPress={() => showAlbum(navigation, workinfo, kpiinfo, competitorSelect, arrTagShow[indexTab].name)}
                                                style={{ height: 40, width: '45%', marginRight: 2 }}>
                                                <SpiralIcon name='image' color={appcolor.primary} type='ionicon' size={25} />
                                                <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, fontSize: scaleSize(12) }}>Xem hình</Text>
                                            </TouchableOpacity>
                                        </View>
                                }

                            </View>
                            <View style={styles.line}></View>
                            <FlatList
                                contentContainerStyle={{ paddingBottom: 30 }}
                                key={(item) => item.id}
                                keyExtractor={(item, index) => item + index}
                                data={arrDataShow}
                                updateCellsBatchingPeriod={20}
                                windowSize={10}
                                renderItem={
                                    ({ item }) => <RenderItemData item={item} details={arrDataShow} setDetails={setArrDataShow} route={route} appcolor={appcolor} workinfo={workinfo} />
                                }
                            />
                            {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 30 : null} /> */}
                        </View>
                    </Tabs.Tab>
                )
            })

        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight={Status === 0 ? 'cloud-upload-alt' : 'check'}
                leftFunc={() => navigation.goBack()}
                rightFunc={() => uploadAction()}
            />

            <View style={{ backgroundColor: appcolor.light, width: '100%', height: Dimensions.get('window').height - HEADER_SIZE }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                    <View style={{ flexDirection: 'column', width: '45%', height: 'auto', alignSelf: 'center' }}>
                        <Text style={{ width: '100%', height: 'auto', textAlign: 'center', fontSize: 13, padding: 5, fontWeight: '600' }}>
                            {'Chọn hãng'}</Text>
                    </View>
                    <CheckBox
                        containerStyle={{
                            width: '40%', backgroundColor: appcolor.light, borderColor: appcolor.light, height: 30,
                            padding: 2, right: 10
                        }}
                        title='Đã nhập'
                        textStyle={{ fontSize: 11, color: appcolor.dark }}
                        checked={isDone}
                        onPress={async () => await setDone(isDone === true ? false : true)}
                    />
                    <Button
                        disabled={Status === 1 ? true : false}
                        buttonStyle={{ backgroundColor: 'clear', borderWidth: 1, borderColor: appcolor.darklight }}
                        containerStyle={{ height: 40, width: '15%', padding: 2, right: 15 }}
                        titleStyle={{ textAlign: 'center', fontSize: 11, fontWeight: '500', color: appcolor.dark }}
                        title='Clear'
                        onPress={() => setClearAll()}
                    ></Button>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
                    <Button
                        buttonStyle={{ backgroundColor: 'clear', borderWidth: 1, borderColor: appcolor.darklight, height: 35 }}
                        containerStyle={{ height: 40, paddingLeft: 20, width: '40%' }}
                        titleStyle={{ textAlign: 'center', fontSize: 11, fontWeight: '500', color: appcolor.dark }}
                        title={competitorSelect || All_Select}
                        onPress={() => setMode('COMPE')}
                    ></Button>
                    <TextInput
                        // autoFocus={true}// selection={{start:0, end:0}} 
                        onChangeText={updateSearch}
                        defaultValue={search}
                        placeholder='Nhập sản phẩm cần tìm.'
                        placeholderTextColor={appcolor.greydark}
                        style={{
                            backgroundColor: appcolor.light, color: appcolor.dark,
                            borderWidth: 0.5, borderRadius: 5, padding: 7, height: 35,
                            justifyContent: 'flex-start', borderColor: 'lightgray',
                            fontSize: 13, marginRight: 10, marginLeft: 10,
                            width: '60%'
                        }}
                    />
                </View>

                {
                    arrTagShow.length > 0 &&
                    <Tabs.Container
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, fontWeight: '600' }}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                scrollEnabled={true}
                                style={{ backgroundColor: appcolor.light }}
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 36 }}
                            />
                        )}>

                        {ViewItem()}
                    </Tabs.Container>
                    // <ScrollableTabView
                    //     initialPage={0}
                    //     tabBarTextStyle={{ color: appcolor.primary }}
                    //     tabBarBackgroundColor={appcolor.surface}
                    //     tabBarUnderlineStyle={{ backgroundColor: appcolor.primary }}
                    //     onChangeTab={({ i, from }) => i != from && handleChangeTab(i, from)}
                    //     renderTabBar={() => <ScrollableTabBar
                    //         tabStyle={{ height: 38 }} style={{ height: 38 }} />}
                    // >
                    //     {
                    //         arrTagShow.map(it =>
                    //             <ViewItem key={it.id} tabLabel={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} ></ViewItem>
                    //         )
                    //     }
                    // </ScrollableTabView> : <ViewItem tabLabel={''} ></ViewItem>
                }

            </View>
            <Modal
                animated={true}
                animationType="slide"
                visible={mode != undefined ? true : false}
                transparent={true}
                swipeDirection='down' style={{ justifyContent: 'flex-end' }}
                onDismiss={() => cancelNote()}
            >
                {
                    mode === 'NOTE' &&
                    <View style={{ zIndex: 1, width: '100%', height: Dimensions.get('window').height }}>
                        <View
                            style={{ zIndex: 2, position: 'absolute', height: '100%', width: '100%', backgroundColor: '#D3D3D3', opacity: 0.5 }}
                            onStartShouldSetResponder={(e) => cancelNote()}
                        />
                        <View style={{ zIndex: 3, position: isHiddenNote ? 'absolute' : 'relative', width: '80%', height: 'auto', opacity: 1.0, backgroundColor: appcolor.light, borderRadius: 15, flexDirection: 'column', marginTop: Dimensions.get("window").height / 3, marginLeft: Dimensions.get("window").width / 2 - (40 * Dimensions.get("window").width) / 100 }}>
                            <Text style={{ marginBottom: 15, marginTop: 15, paddingLeft: 5, color: appcolor.dark }}>Ghi chú</Text>
                            <View style={{ height: 0.8, backgroundColor: appcolor.dark }}></View>
                            <Text style={{ marginBottom: 15, marginTop: 20, paddingLeft: 5, color: appcolor.dark }}>Nhập ghi chú ở dưới đây:</Text>
                            <TextInput
                                editable={Status === 0 ? true : false} selectTextOnFocus={Status === 0 ? true : false}
                                numberOfLines={6}
                                multiline={true}
                                autoFocus
                                blurOnSubmit={true}
                                autoCorrect={false}
                                onChangeText={text => setNoteSaved(text)}
                                style={{
                                    margin: 5,
                                    padding: 10,
                                    color: appcolor.dark,
                                    height: 105,
                                    textAlign: 'left',
                                    borderWidth: 0.6,
                                    borderColor: appcolor.dark,
                                    backgroundColor: appcolor.light
                                }}
                                placeholderTextColor={appcolor.dark}
                                defaultValue={(typeof noteSaved === 'undefined') ? '' : noteSaved}
                                placeholder='Nhập ghi chú ở đây.'
                            />
                            <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', height: 50, width: '100%', padding: 5 }}>
                                <Button
                                    buttonStyle={{ width: '90%', backgroundColor: appcolor.primary, borderRadius: 15 }}
                                    title='Huỷ'
                                    onPress={(e) => cancelNote()}
                                />
                                {
                                    Status === 0 &&
                                    <Button
                                        buttonStyle={{ width: '90%', backgroundColor: appcolor.primary, borderRadius: 15 }}
                                        title='Lưu'
                                        onPress={(e) => updateNote()}
                                    />

                                }
                            </View>
                        </View>
                    </View>
                }
                {
                    mode === 'COMPE' &&
                    <View style={{ backgroundColor: appcolor.light, flex: 1, paddingTop: 35, justifyContent: 'flex-end' }}>
                        <SpiralIcon name='close-circle-outline' type='ionicon' size={30} color={appcolor.primary}
                            onPress={(e) => cancelNote()} containerStyle={{ alignItems: 'flex-end', paddingRight: 15 }} />
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 30 }}
                            key={(item) => item.id}
                            keyExtractor={(item, index) => item + index}
                            data={Lstcompetitor}
                            renderItem={
                                ({ item }) => <RenderItem item={item} route={route} appcolor={appcolor} setCompetitorSelect={(name) => setCompeSelect(name)} />
                            }
                        />
                    </View>
                }
            </Modal>
            {
                showProgress && <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }}><Progress.Circle thickness={1} size={65} indeterminate={true} />
                    <Text style={{ color: '#007AFF' }}>...</Text></View>
            }
        </View>
    )
}
const takePhoto = (navigation, workinfo, kpiinfo, competitorSelect, categoryName) => {

    let item = {
        "reportId": kpiinfo.kpiId,
        "shopId": workinfo.shopId,
        "shopCode": workinfo.shopCode,
        "photoType": 'DISPLAY_' + competitorSelect + '_' + categoryName,
        "photoDate": workinfo.workDate
    }
    // console.log(item)
    navigation.navigate('Camera', item);
}
const showAlbum = (navigation, workinfo, kpiinfo, competitorSelect, categoryName) => {
    let item = {
        "reportId": kpiinfo.kpiId,
        "shopId": workinfo.shopId,
        "photoType": 'DISPLAY_' + competitorSelect + '_' + categoryName,
        "photoDate": workinfo.workDate
    }
    // console.log(item)
    navigation.navigate('AlbumPhoto', item);
}
const RenderItem = ({ item, route, appcolor, setCompetitorSelect }) => {
    return (
        <TouchableOpacity onPress={() => setCompetitorSelect(item.name)}>
            <View style={{ justifyContent: 'flex-start', width: '100%', padding: 12 }}>
                <Text style={{ textAlignVertical: 'center', textAlign: 'center', color: appcolor.dark }}>{item.name}</Text>
                <View style={{ borderColor: appcolor.surface, borderWidth: 1, marginTop: 12, width: '100%' }} />
            </View>
        </TouchableOpacity>
    )
}
const RenderItemData = ({ item, details, setDetails, route, appcolor, workinfo }) => {
    const [detailsTem] = useState(details)
    const [inputDisplay, setInputDisplay] = useState(item.display === 'null' ? null : item.display);
    const [inputPrice, setInputPrice] = useState(item.price);

    const InsertDisplay = async (workinfo, item, display) => {
        let itemInsert = {
            workId: workinfo.workId,
            productId: item.productId,
            subCatId: item.categoryId,
            displayRef: item.category,
            quanity: display,
            subCategory: item.subCatId,
            division: item.division,
            displayComment: item.displayComment !== null && item.displayComment !== undefined ? item.displayComment : '',
            upload: 0
        }

        await insertDisplay(itemInsert);
    }
    const InsertPrice = async (workinfo, item, price) => {
        let itemInsert = {
            workId: workinfo.workId,
            productId: item.productId,
            subCatId: item.categoryId,
            displayRef: item.category,
            price: price || 0,
            subCategory: item.subCatId,
            division: item.division,
            displayComment: item.displayComment !== null && item.displayComment !== undefined ? item.displayComment : '',
            upload: 0
        }

        await insertPriceOfDisplay(itemInsert);
    }
    const endInputDisplay = async (item) => {
        let display = inputDisplay;

        await InsertDisplay(workinfo, item, (display !== '' && display !== undefined) ? parseInt(display) : null)
        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId);
        detailsTem[indexD].display = display;
    }
    const endInputPrice = async (item, e) => {
        let numberInput = inputPrice;

        if (parseInt(numberInput) < 1000000) {
            setInputPrice(null);
            numberInput = null;
            ToastError("Nhập giá không được nhỏ 1.000.000");
        }

        await InsertPrice(workinfo, item, (numberInput !== '' && numberInput !== undefined) ? parseInt(numberInput) : null)
        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId);
        detailsTem[indexD].price = numberInput

    }
    const changeValueDisplay = async (text) => {
        (text !== '') ? await setInputDisplay(parseInt(text)) : setInputDisplay();
    }
    const changeValuePrice = async (text) => {
        var display = text.length > 0 ? text.toString().replace(/,/g, '') : '';
        if (display !== '') {
            await setInputPrice(parseInt(display))
            await InsertPrice(workinfo, item, parseInt(display))
        } else {
            setInputPrice();
            await InsertPrice(workinfo, item, null)
        }

    }
    return (
        // ("headerId" in item) ?
        // <View style={{ flexDirection: 'column',backgroundColor: appcolor.primary,height:44,justifyContent:'center' }}>
        //     <Text style={{ fontSize: 13, color: appcolor.darklight, fontWeight: '600', textAlign: 'left',paddingLeft:15 }}>{item.headerName}</Text>
        // </View>:

        !item.lastItem ?
            <View style={{ width: '100%', alignItems: 'center', height: 55, marginBottom: 12 }} onPress={() => this.onItemPress(item)} >
                <View style={{ flexDirection: 'row', width: '100%', padding: 12, alignItems: 'center', backgroundColor: appcolor.surface }}>
                    <View style={{ width: '50%', flexDirection: 'column' }}>
                        <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '600', textAlign: 'left' }}>{item.productName}</Text>
                        <Text style={{ fontSize: 11, color: appcolor.dark, fontStyle: 'italic', fontWeight: '600', textAlign: 'left' }}>{item.productCode}</Text>
                    </View>

                    <TextInput
                        textAlign={'center'}
                        style={{
                            fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500',
                            width: '25%', textAlign: 'center', borderWidth: 0.5, borderRadius: 7, borderColor: appcolor.light, height: 35
                        }}
                        keyboardType='numeric'
                        placeholder='nhập số lượng'
                        placeholderTextColor={appcolor.dark}
                        editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                        onChangeText={async text => {
                            changeValueDisplay(text)
                        }}
                        onEndEditing={e => endInputDisplay(item)}
                    >{inputDisplay}
                    </TextInput>

                    <NumberFormat
                        value={inputPrice || ''}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{
                                    fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, borderWidth: 0.5,
                                    fontWeight: '500', textAlign: 'center', borderWidth: 1, borderRadius: 7,
                                    borderColor: appcolor.light, height: 35, left: 2, width: '25%',
                                }}
                                keyboardType='numeric'
                                placeholder='nhập giá'
                                placeholderTextColor={appcolor.dark}
                                editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                                onChangeText={async text => {
                                    changeValuePrice(text)
                                }}
                                onEndEditing={e => endInputPrice(item, e)}
                            >
                            </TextInput>
                        }
                    />
                </View>
            </View> :
            <View>
                <Text style={{ width: '100%', textAlign: 'center' }}>{'Đã xem hết'}</Text>
            </View>


    )
}