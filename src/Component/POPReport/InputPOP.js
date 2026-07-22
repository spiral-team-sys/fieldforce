import { useSelector, } from "react-redux"
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, Platform, Keyboard, KeyboardAvoidingView, ScrollView, TouchableOpacity, } from "react-native"
// import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import { POSMContext } from "../../Controller/POSMController";
import { checkNetwork, deviceHeight, deviceWidth, minWidthTab, TODAY } from "../../Core/Utility";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { Badge, Divider, Icon } from '@rneui/themed';
import { scaleSize } from "../../Themes/AppsStyle";
import ActionSheet from "react-native-actions-sheet";
import { PhotoItems } from "../EPSON/PhotoItems";
import { getPhotosReport } from "../../Controller/WorkController";
import { isNotInteger, ToastError, ToastSuccess } from "../../Core/Helper";
import { DEFAULT_COLOR } from '../../Core/URLs';
import FormGroup from "../../Content/FormGroup";
import filter from "lodash";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view"
import { SceneMap } from "react-native-tab-view"
import { TabForm } from "../../Control/TabForm";

export const InputPOP = ({ navigation }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
    const _sheet = useRef();
    const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
    const [groupData, setGroup] = useState([]);
    const [query, setQuery] = useState('');
    const [countInput, setCountInput] = useState(0)
    const [countPhoto, setCountPhoto] = useState(0)
    const [rootData, setRootData] = useState([]);
    const [data, setData] = useState([]);
    const [upload, setUpload] = useState(workinfo.workDate !== TODAY ? true : false);
    const [refInput, nonSet] = useState({})
    const [note, setNote] = useState(null)
    const [reloadPhoto, setLoadPhoto] = useState(0);
    const [result, setResult] = useState([])
    const [routes, setRoutes] = useState([
        { key: "first", title: "Nhập Liệu" },
        { key: "second", title: "Hình Ảnh" },
    ])

    //end search product
    const loadData = async () => {
        const res = await POSMContext.PosmGroup();
        const result = await POSMContext.GetList(workinfo);
        if (result.length > 0) {
            console.log(result[0].upload)
            await setUpload(result[0].upload === 1 ? true : false)
            await setNote(result[0].posmNote)
            await setLoadPhoto(reloadPhoto + 1)
        }
        await setData(result);
        await setRootData(result);
        await setGroup(res);
    }
    useEffect(() => {
        loadData()
        return () => false;
    }, [])
    const styles = StyleSheet.create({
        mainContainer: {
            height: '100%', width: deviceWidth, shadowOpacity: 0.7, shadowColor: appcolor.light, shadowRadius: 10,
            borderTopLeftRadius: 30, backgroundColor: appcolor.light, marginTop: 0,
            borderWidth: 0, borderTopRightRadius: 30, marginLeft: 0, marginRight: 0,
        },
        inputContainer: {
            backgroundColor: appcolor.background, width: '100%', borderRadius: 2, borderColor: appcolor.darkslategray,
            borderWidth: 1, textAlign: 'right', paddingRight: 10, color: appcolor.onBackground,
        },
        viewHeaderTab: { backgroundColor: '#004d40', width: '100%', height: '5%' },
        titleSubCategory: { color: DEFAULT_COLOR, fontSize: 16, fontWeight: '700' },
        titleProduct: { fontWeight: '500', color: 'black', fontSize: 14, padding: 8 },
        inputNumber: { backgroundColor: appcolor.light, width: '90%', padding: 5, textAlign: 'center', borderColor: appcolor.dark, borderWidth: 0.5 },
        ViewInput: { width: '30%', margin: 5 },
        styleModal: { flex: 1, backgroundColor: appcolor.white, padding: 16, paddingTop: 50, overflow: 'hidden' },
        modalHeader: { padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
    })
    const handerNumberChange = (item, e) => {
        let text = e !== null && e.length > 0 ? e.toString().replace(/,/g, '') : 'null'
        if (isNotInteger(text))
            text = '';

        let intValue = text === '' ? null : parseInt(text);
        let itemEdit = {}
        itemEdit = {
            ...item,
            posmValue: intValue,
        }
        POSMContext.SaveItem(itemEdit)
        const _listUpdate = [...data];
        const index = data.findIndex(v => v.itemId === item.itemId);
        _listUpdate[index] = itemEdit;
        setData(_listUpdate);
    }
    const showResult = async () => {
        const res = await POSMContext.taskDone(workinfo);
        let _result = [], _totalInput = 0
        await res?.forEach((v) => {
            _totalInput += v?.totalInput || 0
            _result.push({ "title": v.groupName, "value": `${v?.totalInput || 0} đã lắp` })
        });
        await setCountInput(_totalInput)
        //kiem tra du lieu hinh anh
        let _countPhoto = 0
        await reportItem.ImageByList?.forEach(async (item, index) => {
            let photoType = `${item.code}`
            let lstPhoto = await getPhotosReport(kpiinfo.kpiId, photoType, workinfo.shopId, workinfo.workDate) || [];
            const photoSize = await lstPhoto.length || 0
            _countPhoto += photoSize;
            // console.log(_countPhoto, "reportItem")
            await _result.push({
                "title": `${item.nameVN}`, value: `(${photoSize / item.numberIMG})`, "done": item.numberIMG > photoSize ? false : true
            })
        })
        await setResult(_result);
        await _sheet.current.show()
        await setTimeout(() => {
            setCountPhoto(_countPhoto)
        }, 1500)
    }
    const onSummitReport = async () => {
        if (countInput === 0) {
            ToastError(`Bạn chưa nhập dữ liệu ${countInput}`, "error", "top")
        } else if (countPhoto === 0) {
            ToastError(`Bạn chưa chụp hình ${countPhoto}`, "error", "top")
        }
        else if (await checkNetwork()) {
            //update note
            await POSMContext.UpdateNote(workinfo, note)
            //
            await POSMContext.UploadReport({ ...workinfo, reportId: kpiinfo.kpiId }, (result) => {
                if (result.statusId === 200) {
                    loadData()
                }
                ToastSuccess(result.messager, "Send", 'top');
                _sheet.current.hide()
            })
        } else {
            ToastError("Không có kết nối mạng", "error", "top");
        }
    }
    const renderRow = ({ item, index }) => {
        const totalRow = item.totalRow;
        return (
            <View key={"dss" + index} style={{ padding: 5, borderRadius: 8, marginBottom: 7, backgroundColor: appcolor.light }}>
                <View style={{ padding: 3, flex: 1, flexDirection: 'row' }}>
                    <Badge status="warning" value={index + 1} />
                    <Text style={{ marginStart: 3, fontSize: 14, fontWeight: 'bold', color: appcolor.dark }}>{item.itemNameVN || item.itemName}</Text>
                </View>
                <View style={{ padding: 3, flex: 1, flexDirection: 'row' }}>
                    <Text style={{ color: appcolor.dark, opacity: 0.8, fontSize: 12, fontStyle: 'italic' }}>{item.note}</Text>
                </View>
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '40%', justifyContent: 'flex-end' }}>
                        <TextInput keyboardType="number-pad"
                            onChangeText={(e) => handerNumberChange(item, e)}
                            autoCapitalize="none"
                            ref={(e) => refInput[index] = e}
                            selectTextOnFocus
                            placeholder="Số lượng lắp đặt"
                            placeholderTextColor={appcolor.placeholderText}
                            editable={!upload}
                            key={item.itemId}
                            maxlength={8}
                            defaultValue={
                                item.posmValue === null || isNaN(item.posmValue) ? '' :
                                    item.posmValue.toLocaleString("en-US")
                            }
                            blurOnSubmit={false}
                            autoCorrect={false}
                            onSubmitEditing={() => { (totalRow - 1) === index ? Keyboard.dismiss() : refInput[index + 1]?.focus() }}
                            returnKeyType={Platform.OS === 'android' ? "next" : 'done'}
                            style={{
                                backgroundColor: upload ? appcolor.lightgray : appcolor.light, width: '90%', marginTop: 10,
                                padding: 7,
                                borderColor: appcolor.dark, borderWidth: 0.51,
                                fontSize: scaleSize(14), color: appcolor.dark, textAlign: 'right'
                            }} />
                    </View>
                    {
                        totalRow > 8 && (totalRow - 1) === index &&
                        <View style={{ width: '100%', justifyContent: 'center', marginTop: 20, height: 50, backgroundColor: appcolor.surface, }}>
                            <Text style={{ textAlign: 'center', color: appcolor.placeholderText }}>Đã xem hết</Text>
                        </View>
                    }
                </View>
            </View>
        )
    }
    const onSearch = text => {
        const formattedQuery = text?.toLowerCase()?.trim();
        if (formattedQuery === undefined || formattedQuery === '') {
            setData(rootData);
            setQuery('');
        } else {
            setQuery(text);
            const filteredData = filter(rootData, posm => {
                return contains(posm, formattedQuery);
            });
            setData(filteredData);
        }
    }
    // Search are
    const contains = (posm, query) => {
        const { itemName, note } = posm;
        let sname = itemName === null ? itemName : itemName.toLowerCase();
        let snote = note === null ? note : note.toLowerCase();
        if (sname.includes(query) || snote.includes(query)) {
            return true;
        }
        return false;
    };
    const ViewPOPInput = () => {
        return (
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
                        tabStyle={{ minWidth: minWidthTab(groupData), height: 36 }}
                    />
                )}>
                {
                    groupData.map((g, index) => {
                        const _temp = data.filter(e => {
                            if (e.groupName === g.groupName) {
                                e.totalRow = g.totalRow
                                return e
                            }
                        })
                        return (
                            <Tabs.Tab key={g.groupName} label={g.groupName} name={g.groupName} >
                                <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                    {/* <View style={{ flex: 1, }} key={index.toString()} tabLabel={g.groupName + "(" + _temp.length + ")"}> */}
                                    <FlatList data={_temp} key="itemId"
                                        style={{ padding: 7, marginBottom: 7, backgroundColor: appcolor.surface }}
                                        scrollToOverflowEnabled={true}
                                        initialNumToRender={7}
                                        keyExtractor={(_, index) => index.toString()}
                                        renderItem={renderRow} />
                                    {/* </View> */}
                                </View>
                            </Tabs.Tab>
                        )
                    })
                }
            </Tabs.Container>
        )
    }
    const ViewPhotoInput = () => {
        return (
            !upload ?
                <PhotoItems
                    usedHeader={false} navigation={navigation}
                    route={{ params: { Photos: reportItem.ImageByList || [], Status: 0 } }} />
                :
                <View>
                    <PhotoItems
                        usedHeader={false} navigation={navigation}
                        route={{ params: { Photos: reportItem.ImageByList || [], Status: 1 } }} />
                </View>

        )
    }

    const renderScene = SceneMap({
        first: () => <ViewPOPInput />,
        second: () => <ViewPhotoInput />,
    });
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? "padding" : "height"}
            enabled keyboardVerticalOffset={-10}
            style={{ flex: 1, backgroundColor: appcolor.transparent }}>
            <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                <HeaderCustom leftFunc={() => navigation.goBack()}
                    rightFunc={showResult}
                    iconRight={upload ? "poll" : "cloud-upload-alt"}
                    title={kpiinfo.name} />

                <TabForm routes={routes} renderScene={renderScene} positionTabBar={'bottom'} />

                {/* <ScrollableTabView initialPage={0} renderTabBar={() => <ScrollableTabBar />}
                    tabBarPosition="bottom" tabBarTextStyle={{ paddingBottom: 12, paddingTop: 12 }}
                    tabBarUnderlineStyle={{ backgroundColor: appcolor.light, position: 'absolute', top: 0 }}
                    tabBarBackgroundColor={appcolor.primary}
                    locked={true}
                    tabBarInactiveTextColor={appcolor.dark}
                    tabBarActiveTextColor={appcolor.white} >
                    <View tabLabel="Nhập liệu" style={[styles.mainContainer]} >
                        <FormGroup handleChangeForm={onSearch} editable={true}
                            placeholder="Tìm kiếm thông tin..." />
                        <ScrollableTabView tabBarActiveTextColor={appcolor.primary}
                            tabBarInactiveTextColor={appcolor.dark}
                            tabBarUnderlineStyle={{ backgroundColor: appcolor.primary }}
                            initialPage={0} renderTabBar={() => <ScrollableTabBar />}>
                            {
                                groupData.map((g, index) => {
                                    const _temp = data.filter(e => {
                                        if (e.groupName === g.groupName) {
                                            e.totalRow = g.totalRow
                                            return e
                                        }
                                    })
                                    return (
                                        <View style={{ flex: 1, }} key={index.toString()}
                                            tabLabel={g.groupName + "(" + _temp.length + ")"}>

                                            <FlatList data={_temp} key="itemId"
                                                style={{ padding: 7, marginBottom: 7, backgroundColor: appcolor.surface }}
                                                scrollToOverflowEnabled={true}
                                                initialNumToRender={7}
                                                keyExtractor={(_, index) => index.toString()}
                                                renderItem={renderRow} />
                                        </View>)
                                })
                            }

                        </ScrollableTabView>

                    </View >
                    <View tabLabel={`Hình ảnh`}>
                        {!upload ?
                            <PhotoItems
                                usedHeader={false} navigation={navigation}
                                route={{ params: { Photos: reportItem.ImageByList || [], Status: 0 } }} />
                            :
                            <View>
                                <PhotoItems
                                    usedHeader={false} navigation={navigation}
                                    route={{ params: { Photos: reportItem.ImageByList || [], Status: 1 } }} />
                            </View>
                        }
                    </View>
                </ScrollableTabView> */}
                <ActionSheet
                    containerStyle={{ backgroundColor: appcolor.light }}
                    ref={_sheet}>
                    {
                        <View style={{ height: '85%' }}>
                            <FormGroup editable={true} handleChangeForm={e => setNote(e)}
                                placeholder="Nhập ghi chú..."
                                title="Ghi chú thêm thông tin" />
                            <Text style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18) }}>
                                {
                                    upload ? "Báo cáo đã gửi lên hệ thống" : "Thông tin lắp đặt"
                                }
                            </Text>
                            <ScrollView style={{ height: deviceHeight * 0.3 }}>
                                <FlatList
                                    data={result}
                                    renderItem={
                                        ({ item, index }) => {
                                            return (
                                                <View key={`${index}Ho928`} style={{ padding: 7, flexDirection: 'row', width: '100%', }}>
                                                    <Text style={{
                                                        flexGrow: 1,
                                                        textDecorationLine: item.done === false ? 'line-through' : 'none',
                                                        padding: 3, color: item.done === false ? appcolor.danger : appcolor.dark
                                                    }}>{item.title}</Text>
                                                    <Text style={{ padding: 3, color: appcolor.dark }}>{item.value}</Text>
                                                </View>
                                            )
                                        }
                                    }
                                />
                            </ScrollView>
                            <TouchableOpacity
                                style={{
                                    width: '100%', position: 'absolute', bottom: 0,
                                    padding: 7, alignItems: 'center',
                                    display: upload === true ? 'none' : 'flex'
                                }}
                                onPress={() => {
                                    onSummitReport()
                                }}>
                                <Text style={{ color: appcolor.primary, fontSize: scaleSize(18) }}>Gửi báo cáo</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </ActionSheet>
            </View >
        </KeyboardAvoidingView>
    )
}