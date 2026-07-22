import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Capitalize, checkNetwork, alertWarning, minWidthTab, deviceWidth } from '../../Core/Utility';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { MessageAction, MessageInfo } from '../../Core/Helper';
import { Button } from '@rneui/themed';
import ActionSheet from "react-native-actions-sheet";
import { insertReasonPOP } from '../../Controller/POPController';
import { getListTrack, getAllListTrackRes, UploadTrackingDisplay, insertTrackingBK } from '../../Controller/TrackingDetailController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view"

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

export const InstoreShareBK = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const [arrDataShowF, setArrDataShowF] = useState([])
    const [arrReason, setArrReason] = useState([])
    const [indexTab, setIndexTab] = useState(0)
    const [selectedPOPId, setSelectPOPId] = useState()
    const ref_bottomSheet = useRef()
    const [uploaded, setUploaded] = useState()

    const MapItemRes = async (lstTrack, i) => {
        await setArrDataShow([]);
        let lstRes = await getAllListTrackRes(route.params.workinfo);
        let isUpload = 0
        if (lstRes !== undefined) {
            lstRes.length > 0 && lstRes[0].upload
            isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
            setUploaded(isUpload)

        }
        let lstTab = [];
        let lstName = [];
        lstTrack.map((it, index) => {
            let itemStr = it.category

            if (!lstName.includes(itemStr)) {
                lstName.push(itemStr)
                lstTab.push({ id: index, name: itemStr, idCom: it.categoryId, countRes: 0 });
            }
        })
        await setArrTagShow(lstTab);
        let lstFilter = lstTrack.filter(it => it.category.includes(lstTab[i].name))
        let lstMap = [];
        let lstComId = []
        lstFilter.map(it => {
            if (!lstComId.includes(it.competitorId)) {
                lstComId.push(it.competitorId)
                lstMap.push({ compId: it.competitorId, compName: it.competitorName })
            }
            if (lstRes !== undefined) {
                let itemsHave = lstRes.filter(ir => ir.categoryId === it.categoryId && ir.competitorId === it.competitorId && ir.subCatId === it.subCatId && ir.itemId === it.id)
                if (itemsHave.length > 0) {
                    lstMap.push({ ...it, display: itemsHave[0].display, upload: isUpload })
                }
                else {
                    lstMap.push({ ...it, upload: isUpload })
                }
            }
            else {
                lstMap.push({ ...it, upload: isUpload })
            }
        })
        await setArrDataShow(lstMap)
    }
    const loadData = async () => {
        setLoading(true)
        let lstTrack = await getListTrack();
        setArrDataShowF(lstTrack);
        await MapItemRes(lstTrack, indexTab);
        setLoading(false);
    }
    const reloadData = async () => {
        await MapItemRes(arrDataShowF, indexTab)
    }
    useEffect(() => {
        loadData();
    }, [])
    const uploadTrackingDisplay = async () => {

        let lstRes = await getAllListTrackRes(route.params.workinfo)
        if (lstRes.length === 0) {
            alertWarning('Vui lòng làm báo cáo trước khi bấm gửi.')
            return
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        MessageAction('Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await UploadTrackingDisplay(route.params.workinfo, lstRes, [], '', async () => {
                await loadData();
            })
        })
    }
    const handleChangeTab = async (i, from) => {
        setIndexTab(i);
        await MapItemRes(arrDataShowF, i)
    }
    const handleReason = async (item) => {
        ref_bottomSheet.current.hide();
        let itemHave = arrDataShowF.filter(it => it.popId === selectedPOPId)
        if (itemHave.length > 0) {
            await insertReasonPOP(route.params.workinfo, itemHave[0], item)
            reloadData()
        }
    }
    const ViewItem = () => {
        return (
            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1, flexDirection: 'column' }}
                    behavior={Platform.OS === 'android' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 130}>
                    <FlatList
                        contentContainerStyle={{ paddingBottom: 30 }}
                        key={(item) => item.id}
                        keyExtractor={(item, index) => item + index}
                        data={arrDataShow}
                        renderItem={
                            ({ item }) => <RenderItemData item={item} details={arrDataShow} setDetails={setArrDataShow} reloadData={reloadData} route={route} bottomSheet={ref_bottomSheet} setSelectPOPId={setSelectPOPId} appcolor={appcolor} />
                        }
                    />
                </KeyboardAvoidingView>
            </View>
        )
    }
    const renderItem = ({ item }) => (
        <View style={{ marginBottom: 3, alignContent: 'center' }}>
            <Button
                onPress={() => handleReason(item)}
                containerStyle={{ height: 35, backgroundColor: appcolor.white }}
                buttonStyle={{ height: 35, backgroundColor: appcolor.white }}
                title={item.name} titleStyle={{ color: '#000' }} />
            <View style={styles.line}></View>
        </View>
    )
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.homebackground }}>
            <HeaderCustom
                title={route.params.titlePage}
                leftFunc={() => navigation.goBack()}
                iconRight={uploaded === 0 ? 'cloud-upload-alt' : 'check'}
                rightFunc={() => uploaded !== 1 ? uploadTrackingDisplay() : MessageInfo('Dữ liệu đã được gửi.')} />
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
                    {
                        arrTagShow.map((it, index) =>
                            <Tabs.Tab key={Capitalize(it.name)} label={Capitalize(it.name)} name={Capitalize(it.name)} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                    <ViewItem key={index} tabLabel={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} ></ViewItem>
                                </View>
                            </Tabs.Tab>
                        )
                    }
                </Tabs.Container>
                // <ScrollableTabView
                //     onChangeTab={({ i, from }) => i != from && handleChangeTab(i, from)}
                //     tabBarBackgroundColor={appcolor.light}
                //     tabBarTextStyle={{ fontSize: 15, color: appcolor.dark }}
                //     tabBarUnderlineStyle={{ height: 3, backgroundColor: appcolor.yellowdark }}
                //     renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 42 }} style={{ height: 42 }} />}>
                //     {
                //         arrTagShow.map((it, index) =>
                //             <ViewItem key={index} tabLabel={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} ></ViewItem>
                //         )
                //     }
                // </ScrollableTabView> : <ViewItem tabLabel={''} />
            }
            <ActionSheet
                ref={ref_bottomSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 20, height: '60%', bottom: 30 }} >
                <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                        contentContainerStyle={{ bottom: 20 }}
                        style={{ height: '90%' }}
                        key={(item) => item.Id}
                        data={arrReason}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </ActionSheet>
        </View>
    )
}
const RenderItemData = ({ item, details, setDetails, reloadData, route, bottomSheet, setSelectPOPId, appcolor }) => {
    const [detailsTem] = useState(details)
    const [inputText, setInputText] = useState(item.display === 'null' ? null : item.display);
    const editInputChange = async (item) => {
        await insertTrackingBK(route.params.workinfo, item, inputText !== '' ? parseInt(inputText) : null)

        let indexD = detailsTem.findIndex(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId && it.itemId === item.itemId)
        let itemD = detailsTem.filter(it => it.categoryId === item.categoryId && it.competitorId === item.competitorId && it.itemId === item.itemId)

        let itemUpdate = { ...itemD[0], display: inputText };

        await detailsTem.splice(indexD, 1);
        await detailsTem.push(itemUpdate);
    }
    const onChangeText = async (text) => {
        if (text !== '') {
            if (parseInt(text) === 0) {
                setInputText()
                MessageInfo('số lượng lớn hơn 0');
                return;
            }
            else {
                await setInputText(parseInt(text))
                await insertTrackingBK(route.params.workinfo, item, text !== '' ? parseInt(text) : null)
            }
        }
    }
    return (
        <View style={{ width: '100%', alignItems: 'center' }} onPress={() => this.onItemPress(item)} >
            {
                ('compId' in item) ?
                    <Text style={{ width: '100%', textAlign: 'left', padding: 8, fontSize: 17, fontWeight: '700', color: appcolor.bluesky }}>{item.compName}</Text>
                    :
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: appcolor.light, padding: 12, marginBottom: 1 }}>
                        <Text style={{ fontSize: 14, color: appcolor.dark, fontWeight: '600', textAlign: 'left', width: '70%' }}>{item.competitorName + ' ' + item.subCategory}</Text>
                        <TextInput
                            style={{ fontSize: 13, color: appcolor.dark, backgroundColor: appcolor.homebackground, fontWeight: '500', width: '30%', textAlign: 'center', borderWidth: 0.5, borderRadius: 8, borderColor: appcolor.greylight, padding: 8 }}
                            placeholder='Số lượng' placeholderTextColor={appcolor.grey}
                            keyboardType={'number-pad'}
                            editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                            onChangeText={onChangeText}
                        // onEndEditing={e => editInputChange(item)}
                        >
                            {inputText}
                        </TextInput>
                    </View>
            }
        </View>
    )
}