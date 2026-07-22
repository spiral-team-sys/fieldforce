import React, { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View, Text, ActivityIndicator, TextInput, StyleSheet } from "react-native";
import PageHeader from '../../Content/PageHeader';
import { Capitalize, deviceWidth, minWidthTab } from '../../Core/Utility';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { DEFAULT_COLOR, URL_INSTALL_POP } from '../../Core/URLs';
import { fetchGet, MessageAction, MessageInfo } from '../../Core/Helper';
import { Button, Image } from '@rneui/themed';
import { getReasonPOP } from '../../Controller/MasterController';
import ActionSheet from "react-native-actions-sheet";
import { getLstInstallPOP, insertInstallPOP, insertReasonPOP, uploadPOPSHOP } from '../../Controller/POPController';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { useSelector } from 'react-redux';

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

export const POPByShop = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const [arrDataShowF, setArrDataShowF] = useState([])
    const [arrReason, setArrReason] = useState([])
    const [indexTab, setIndexTab] = useState(0)
    const [selectedPOPId, setSelectPOPId] = useState()
    const ref_bottomSheet = useRef()
    const { appcolor } = useSelector(state => state.GAppState)

    const MapItemRes = async (lstOrder, i) => {
        let lstRes = await getLstInstallPOP(route.params.workinfo)

        let lstTab = [];
        let lstName = [];
        lstOrder.map((it, index) => {
            let itemStr = it.groupName
            let lstItemGroup = lstRes.filter(it => it.groupName === itemStr && it.installQuantity !== null && it.installQuantity !== 'null');

            if (!lstName.includes(itemStr)) {
                lstName.push(itemStr)
                lstTab.push({ id: index, name: itemStr, countRes: lstItemGroup.length });
            }
        })

        await setArrTagShow(lstTab);


        let lstFilter = lstOrder.filter(it => it.groupName.includes(lstTab[i].name))
        let lstMap = [];
        lstFilter.map(it => {
            let itemsHave = lstRes.filter(ir => ir.popId === it.popId)
            if (itemsHave.length > 0) {
                lstMap.push({ ...it, installQuantity: itemsHave[0].installQuantity, reasonId: itemsHave[0].reasonId, reasonName: itemsHave[0].reasonName })
            }
            else {
                lstMap.push(it)
            }
        })

        await setArrDataShow(lstMap)
    }
    const loadData = async () => {
        setLoading(true)
        let lstOrder = await fetchGet(URL_INSTALL_POP)
        setArrDataShowF(lstOrder)

        await MapItemRes(lstOrder, indexTab);
        setLoading(false)
    }
    const loadReason = async () => {
        let lstReason = await getReasonPOP();

        setArrReason(lstReason);
    }
    const reloadData = async () => {
        await MapItemRes(arrDataShowF, indexTab)
    }
    useEffect(() => {
        loadReason();
        loadData();
    }, [])
    const uploadPOPBySHop = async () => {
        let lstRes = await getLstInstallPOP(route.params.workinfo)
        if (lstRes.length === 0) {
            MessageInfo('Vui lòng làm báo cáo trước khi bấm gửi.')
            return
        }

        let lstHave = lstRes.filter(it => it.installQuantity !== undefined && it.installQuantity !== 'null' && it.installQuantity !== null)
        lstHave.map(it => {
            if (it.reasonId === null) {
                MessageInfo(it.popName + ': Bạn đã nhập số lượng nhưng chưa chọn trạng thái. Vui lòng chọn trạng thái')
                return;
            }
        })

        MessageAction('Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await uploadPOPSHOP(lstRes, route.params.workinfo, async () => {
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
            <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        colors={['blue', 'orange']}
                        titleColor={DEFAULT_COLOR}
                        tintColor={DEFAULT_COLOR}
                        title={'Đang tải dữ liệu...'}
                        onRefresh={() => {
                            loadData()
                        }} />
                }
            >
                <FlatList
                    style={{ height: '100%' }}
                    key={(item) => item.id}
                    keyExtractor={(item, index) => item + index}
                    data={arrDataShow}
                    renderItem={({ item }) => <RenderItemData item={item} details={arrDataShow} setDetails={setArrDataShow} reloadData={reloadData} route={route} bottomSheet={ref_bottomSheet} setSelectPOPId={setSelectPOPId} />}
                />
            </ScrollView>
        )
    }
    const renderItem = ({ item }) => (
        <View style={{ marginBottom: 3, alignContent: 'center' }}>
            <Button
                onPress={() => handleReason(item)}
                containerStyle={{ height: 35, backgroundColor: '#fff' }}
                buttonStyle={{ height: 35, backgroundColor: '#fff' }}
                title={item.name} titleStyle={{ color: '#000' }} />
            <View style={styles.line}></View>
        </View>
    )
    return (
        <View style={{ flex: 1 }}>
            <PageHeader
                Title={route.params.titlePage}
                leftclick={() => navigation.goBack()}
                righticon='cloud-upload-alt'
                rightcolor={'#fff'}
                rightclick={() => uploadPOPBySHop()}
            />
            {
                arrTagShow.length > 0 &&
                < Tabs.Container
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
                        arrTagShow.map(it =>
                            <Tabs.Tab key={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} label={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} name={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                    <ViewItem tabLabel={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} ></ViewItem>
                                </View>
                            </Tabs.Tab>
                        )
                    }
                </Tabs.Container>
                // <ScrollableTabView
                //     style={{ top: 15 }}
                //     initialPage={0}
                //     onChangeTab={({ i, from }) => i != from && handleChangeTab(i, from)}
                //     renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}
                // >
                //     {
                //         arrTagShow.map(it =>
                //             <ViewItem tabLabel={Capitalize(it.name) + `${it.countRes !== 0 ? `(${it.countRes})` : ''}`} ></ViewItem>
                //         )
                //     }
                // </ScrollableTabView> : <ViewItem tabLabel={''} ></ViewItem>
            }
            <ActionSheet
                ref={ref_bottomSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 20, height: '60%', bottom: 30 }}
            >
                <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                        contentContainerStyle={{ bottom: 20 }}
                        style={{ height: '90%' }}
                        key={(item) => item.Id}
                        data={arrReason}
                        renderItem={renderItem}
                    // numColumns={1} 
                    />
                </ScrollView>
            </ActionSheet>
        </View>
    )
}
const RenderItemData = ({ item, details, setDetails, reloadData, route, bottomSheet, setSelectPOPId }) => {
    const [detailsTem] = useState(details)
    const [inputText, setInputText] = useState(item.installQuantity === 'null' ? null : item.installQuantity);

    // useEffect(() => {
    //     const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',async () => {
    //         reloadData(detailsTem);
    //     });
    //     return () => {
    //         keyboardDidHideListener.remove();
    //     };
    // }, []);
    const editInputChange = async (text, item) => {
        let quantityMyHouse = item.quantityMyHouse || 0

        if (text !== '') {
            if (parseInt(text) > quantityMyHouse) {
                MessageInfo('số lượng lắp đặt không được lớn hơn số lượng tồn kho là: ' + quantityMyHouse);
                return;
            }
        }

        setInputText(text)
        // let indexD = detailsTem.findIndex(it=>it.popId === item.popId)
        // let itemUpdate = {...item,installQuantity:text};
        // await detailsTem.splice(indexD,1);
        // await detailsTem.push(itemUpdate);
        await insertInstallPOP(route.params.workinfo, item, text !== '' ? parseInt(text) : null)
    }
    return (
        <View style={{ height: 120, padding: 10, width: '100%' }} onPress={() => this.onItemPress(item)} >
            <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: '30%', paddingLeft: 10 }}>
                    <Image style={{ width: 100, height: 100, alignSelf: 'flex-start' }} source={{ uri: item.image }} PlaceholderContent={<ActivityIndicator />} />
                </View>

                <View style={{ flexDirection: 'column', width: '70%' }}>
                    {/* <Text>{JSON.stringify(item.reasonName)}</Text> */}
                    <View style={{ flexDirection: 'row', width: '100%', padding: 5, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '700', textAlign: 'left', width: '60%' }}>{item.popName}</Text>
                        <Button
                            buttonStyle={{ backgroundColor: '#fff' }}
                            titleStyle={{ color: 'black', fontWeight: '600', textAlign: 'center', fontSize: 12 }}
                            containerStyle={{ backgroundColor: '#fff', fontWeight: '600', width: '40%', textAlign: 'left', borderWidth: 1, borderRadius: 7, borderColor: 'lightgray', height: 35, paddingLeft: 10 }}
                            title={item.reasonName || '-- chọn --'}
                            onPress={() => {
                                bottomSheet.current.show();
                                setSelectPOPId(item.popId)
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', padding: 5, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '60%' }}>{'Tồn kho cá nhân: ' + item.quantityMyHouse || '0'}</Text>
                        <TextInput
                            onChangeText={(text) => editInputChange(text, item)}
                            style={{ fontSize: 12, color: 'black', backgroundColor: '#fff', fontWeight: '500', width: '40%', textAlign: 'center', borderWidth: 1, borderRadius: 7, borderColor: 'lightgray', height: 35, paddingLeft: 10 }}
                            keyboardType='numeric'
                            placeholder='nhập số lượng'
                            onEndEditing={() => reloadData()}
                        >{inputText}
                        </TextInput>
                    </View>
                </View>
            </View>
        </View>
    )
}