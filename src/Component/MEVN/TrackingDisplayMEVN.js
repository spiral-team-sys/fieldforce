import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native"
import { Capitalize, checkNetwork, deviceWidth, minWidthTab } from '../../Core/Utility';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { MessageAction, MessageInfo, ToastError, ToastSuccess } from '../../Core/Helper';
import { Button, Icon } from '@rneui/themed';
import { getListTrack, insertTracking, getAllListTrackRes, UploadTrackingDisplay, updateNoteTracking, getListDataTracking, getlistCompetitor, getListItemDisplayMEVN } from '../../Controller/TrackingDetailController';
import { getAllPhotosUpload } from '../../Controller/WorkController';
import { AppNameBuild } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import FormGroup from '../../Content/FormGroup';
import { useSelector } from 'react-redux';
import { LoadingView } from '../../Control/ItemLoading';
import moment from 'moment';

export const TrackingDisplayMEVN = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const [indexTab, setIndexTab] = useState(0)
    const [uploaded, setUploaded] = useState()
    const [noteCommon, setNoteCommon] = useState('')
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState)
    const reportItem = JSON.parse(kpiinfo?.reportItem)

    const loadData = async () => {
        await setLoading(true)
        let lstRes = await getAllListTrackRes(workinfo)
        let isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
        lstRes.length > 0 && setNoteCommon(lstRes[0].note);
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setUploaded(isUpload)
        } else {
            await setUploaded(1)
        }

        await setArrDataShow([]);
        let lstItemsProgram = await getListItemDisplayMEVN(workinfo, reportItem.TrackingDisplay)//list product all
        let competitors = await getlistCompetitor();//list competitor

        await setArrTagShow(competitors)
        await setArrDataShow(lstItemsProgram)
        await setLoading(false)
    }

    useEffect(() => {
        loadData();
        return () => false;
    }, [])

    const uploadTrackingDisplay = async () => {
        let resPhotos = await getAllPhotosUpload(kpiinfo.id, workinfo.shopId, workinfo.workDate);
        let lstRes = await getAllListTrackRes(workinfo)

        let lstUpload = lstRes.filter(it => it.display !== null && it.display !== 'null' && it.display !== undefined)
        if (AppNameBuild !== 'mevn') {
            if (lstUpload.length === 0) {
                ToastError('Vui lòng làm báo cáo trước khi bấm gửi.')
                return
            }
        }
        else {
            if (lstUpload.length === 0) {
                if (noteCommon === '' || noteCommon === null) {
                    ToastError('Chưa làm báo cáo. Vui lòng nhập ghi chú lý do (nhiều hơn 5 ký tự) sau đó gửi lại.');
                    return
                }
                else {
                    if (noteCommon.length < 5) {
                        ToastError('Vui lòng nhập ghi chú nhiều hơn 5 ký tự.');
                        return
                    }
                }
            }
        }


        if (resPhotos.length === 0) {
            ToastError('Bạn chưa chụp hình cho báo cáo.')
            return
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }



        MessageAction('Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await UploadTrackingDisplay({ ...workinfo, reportId: kpiinfo.id }, lstUpload, noteCommon, async (message) => {
                await loadData();
                await ToastSuccess(message);
            })
        })
    }
    const handleChangeTab = async (i, from) => {
        setIndexTab(i);
    }
    const takePhoto = () => {
        let comId = arrTagShow[indexTab].idCom;
        let imgType = '';
        if (comId != 40) {
            imgType = "DISPLAY_COMPETITOR_" + comId
        }
        else {
            imgType = "DISPLAY_" + comId
        }
        let item = {
            "reportId": route.params.reportId,
            "shopId": route.params.workinfo.shopId,
            "shopCode": route.params.workinfo.shopCode,
            "photoType": imgType,
            "photoDate": route.params.workinfo.workDate
        }

        navigation.navigate('Camera', { ...item, callBackReport: loadData });
    };
    const showALbum = () => {
        let comId = arrTagShow[indexTab].idCom;
        let imgType = '';
        if (comId != 40) {
            imgType = "DISPLAY_COMPETITOR_" + comId
        }
        else {
            imgType = "DISPLAY_" + comId
        }

        let item = {
            "reportId": route.params.reportId,
            "shopId": route.params.workinfo.shopId,
            "photoType": imgType,
            "photoDate": route.params.workinfo.workDate
        }

        navigation.navigate('AlbumPhoto', item);
    };
    const updateNoteCommon = async (text) => {
        await setNoteCommon(text);
        await updateNoteTracking(route.params.workinfo, text);
    }
    const ViewItem = () => {
        return (
            arrTagShow.map((it, index) => {
                const dataByCompetitorId = arrDataShow.filter(i => i.competitorId === it.idCom)
                const totalRow = dataByCompetitorId.length
                return (
                    <Tabs.Tab key={index + "Tabs"} name={Capitalize(it.name) + `${totalRow !== 0 ? `(${totalRow})` : ''}`}>
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
                                    <Button
                                        onPress={() => uploaded !== 1 && takePhoto()}
                                        icon={<Icon color={appcolor.dark} name='camera' type='ionicon' size={25}></Icon>}
                                        containerStyle={{ height: 40, backgroundColor: appcolor.light, width: '45%' }}
                                        buttonStyle={{ height: 40, backgroundColor: appcolor.light }}
                                        title={' Chụp hình'} titleStyle={{ color: appcolor.dark, fontSize: 12 }} />
                                    <Button
                                        onPress={() => showALbum()}
                                        icon={<Icon name='image' color={appcolor.dark} type='ionicon' size={25}></Icon>}
                                        containerStyle={{ height: 40, backgroundColor: appcolor.light, width: '45%' }}
                                        buttonStyle={{ height: 40, backgroundColor: appcolor.light }}
                                        title={' Album'} titleStyle={{ color: appcolor.dark, fontSize: 12 }} />
                                </View>

                                <KeyboardAvoidingView
                                    style={{ flex: 1 }}
                                    behavior={Platform.OS == "ios" ? "padding" : 'height'}
                                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 50}>
                                    <FlatList
                                        contentContainerStyle={{ paddingBottom: 30 }}
                                        key={(item) => item.id}
                                        removeClippedSubviews={false}
                                        keyExtractor={(item, index) => item + index}
                                        data={dataByCompetitorId}
                                        renderItem={
                                            ({ item, index }) => <RenderItemData
                                                item={item} index={index}
                                                details={arrDataShow} setDetails={setArrDataShow} route={route} />
                                        }
                                    />
                                </KeyboardAvoidingView>
                            </View>
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom
                title={route.params.titlePage}
                leftFunc={() => navigation.goBack()}
                iconRight={uploaded !== 1 ? 'cloud-upload-alt' : null}
                rightFunc={() => uploaded !== 1 ? uploadTrackingDisplay() : null}
            />
            {
                (AppNameBuild === 'mevn') &&
                <View style={{ padding: 7 }}>
                    <FormGroup
                        title={"Vui lòng làm báo cáo sau đó nhập ghi chú (*)"}
                        value={noteCommon} multiline={true} editable={true}
                        placeholder='Nhập ghi chú ở đây'
                        handleChangeForm={(text) => updateNoteCommon(text)}
                    />
                </View>
            }
            <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
                {
                    (arrTagShow.length > 0 && !loading) &&
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
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 42 }}
                            />
                        )}>
                        {ViewItem()}
                    </Tabs.Container>
                }
                {loading && <LoadingView title={'Đang tải dữ liệu...'} isLoading={loading} styles={{ marginTop: 8 }} />}
            </View>
        </View>
    )
}
const RenderItemData = ({ item, details, index, setDetails, route }) => {
    const [detailsTem] = useState(details)
    const [inputText, setInputText] = useState(item.display === 'null' ? null : item.display);
    const { appcolor } = useSelector(state => state.GAppState)

    const editInputChange = async (item) => {
        // alert(inputText)
        await insertTracking(route.params.workinfo, item, (inputText !== '' && inputText !== undefined && inputText !== null) ? parseInt(inputText) : null)

        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId)
        let itemD = detailsTem.filter(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId)

        let itemUpdate = { ...itemD[0], display: inputText };

        await detailsTem.splice(indexD, 1);
        await detailsTem.push(itemUpdate);
    }
    const onChangeDisplay = (text) => {
        if (text !== '') {
            setInputText(parseInt(text))
        }
        else {
            setInputText(null)
        }
    }
    return (
        <View key={`${index}juja92`}
            style={{
                marginLeft: 7, marginRight: 7, marginBottom: 7, padding: 12,
                backgroundColor: appcolor.light, alignItems: 'center'
            }} onPress={() => this.onItemPress(item)} >
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                {/* <Text>{JSON.stringify(item)}</Text> */}
                <Text style={{ fontSize: 13, color: appcolor.dark, textAlign: 'left', width: '60%' }}>{item.category}</Text>
                <TextInput
                    style={{
                        fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light,
                        width: '40%', textAlign: 'center', borderWidth: 0.7, borderRadius: 7, borderColor: 'lightgray', height: 35, paddingLeft: 10
                    }}
                    keyboardType='numeric'
                    placeholder='nhập số lượng'
                    placeholderTextColor={appcolor.placeholderText}
                    editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                    onChangeText={text => {
                        onChangeDisplay(text)
                    }}
                    onEndEditing={e => editInputChange(item)}
                >{inputText}
                </TextInput>
            </View>
        </View>
    )
}