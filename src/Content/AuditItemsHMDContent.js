import React, { Component, useState } from 'react';
import { Platform, View, Text, SectionList, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Dimensions, StyleSheet } from "react-native";
import { Icon, ListItem, Button, Badge } from '@rneui/themed';
import { existAuditDisplayResult, getAllProductList, existAuditData, insertDisplayResult, getPOSM, deleteItemPhotosAudit } from '../Controller/WorkController'
import Moment from 'moment';
import { DEFAULT_COLOR } from '../Core/URLs';
import ActionSheet from 'react-native-actions-sheet';
import { DeleteItem, Store } from '../Core/SqliteDbContext';
import { MessageInfo } from '../Core/Helper';
import LottieView from 'lottie-react-native';
import { isIphoneX } from "../Core/is-iphone-x";
import { CheckBox } from '@rneui/base';

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'left'
  },
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

const offsetKeyboard = (Platform.OS === 'android') ? 200 : 200;
const offsetSwitch = (Platform.OS === 'android') ? 1.1 : 0.8;

export default class AuditItemsHMDContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            togPhoto: 0,
            countPhoto: 0,
            progress: 0,
            indeterminate: true,
            showProgress: false,
            showProgressPhoto: false,
            workinfo: this.props.workinfo,
            lstShow: [],
            DisplayItem: this.props.DisplayItem,
            isHiddenNote: true,
            isHavePack: null,
            lstGroup: [],
            showProduct: false,
            lstProducts: [],
            isSelect: 0, // 0: product 1: POSM
            lstPOSMs: [],
            lstShows: [],
            search: '',
            itemAudit: null
        }
    }
    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    setShowProgressPhoto = (check) => {
        this.setState({ showProgressPhoto: check });
    }
    refreshView = async (item, type) => {
        if (type === 3 || type === 7 || type === 4) {
            this.props.loadData()
        }
    }
    async componentDidMount() {
        let lstPro = await getAllProductList('')
        let lstPosm = await getPOSM('')

        this.setState({ lstProducts: lstPro, lstPOSMs: lstPosm })
    }
    updateSearch = async (search) => {
        if (this.state.isSelect === 0) {
            this.setState({ search: search });
            let lstPro = await getAllProductList(search)
            await this.setState({ lstShows: lstPro })
        }
        else {
            this.setState({ search: search });
            let lstPosm = await getPOSM(search);
            await this.setState({ lstShows: lstPosm })
        }

    };
    chooseHaveDisplayPack = async (check) => {
        await this.setState({ isHavePack: check })
        this.state.isHavePack !== null && this.loadData();
    }
    updateNoteCommon = (text) => {
        let itemUpdate = {
            workId: this.props.workinfo.workId,
            displayComment: text
        }

        this.setState({ noteCommon: text })
        // updateNoteStock(itemUpdate)
    }
    RenderTabItem = () => {
        return (
            this.state.lstGroup.map(item => {
                return (
                    <Text tabLabel={item}></Text>
                )
            })
        )
    }
    showProductAction = async () => {
        await this.setState({ lstShows: [], search: '' })
        await this.setState({ isSelect: 0, lstShows: this.state.lstProducts })
        this.bottomSheet.show();
    }
    showPOSMAction = async () => {
        await this.setState({ lstShows: [], search: '' })
        await this.setState({ isSelect: 1, lstShows: this.state.lstPOSMs })
        this.bottomSheet.show();
    }
    closeBottomSheet = () => {
        this.bottomSheet.hide();
    }
    render() {
        const iPhonex = isIphoneX();
        const lstShowAll = this.props.ProductItems;
        return (
            <View style={{ width: '100%', top: 50, height: Platform.OS === 'android' ? Dimensions.get('screen').height - (this.props.HeightHeader + 160) : Dimensions.get('screen').height - (this.props.HeightHeader + (iPhonex ? 110 : 80)) }}>
                <KeyboardAvoidingView
                    style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }}
                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                    enabled
                    keyboardVerticalOffset={offsetKeyboard}>
                    <SectionList
                        contentContainerStyle={{ paddingBottom: this.props.HeightHeader }}
                        sections={lstShowAll}
                        ItemSeparatorComponent={RenderSeparatorStyle}
                        renderItem={({ item, index }) => (
                            <RenderRow item={item} index={index} Status={this.props.Status} refreshView={this.refreshView}
                                workinfo={this.state.workinfo} DisplayItem={this.state.DisplayItem}
                                Props={this.props} showProduct={this.showProductAction}
                                showPOSM={this.showPOSMAction} NoChange={this.props.NoChange}
                            />)}
                        keyExtractor={(item, index) => item + index}
                        initialNumToRender={1}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                    />
                </KeyboardAvoidingView>

                <ActionSheet

                    ref={ref => this.bottomSheet = ref}
                    defaultOverlayOpacity={0.3}
                    containerStyle={{ padding: 0, backgroundColor: 'white', height: '80%' }}
                >
                    <View style={{ height: '80%', backgroundColor: 'white', bottom: 0, top: 0 }}>
                        <Text style={{ ...styles.title, textAlign: 'center', top: 5, fontSize: 19, color: DEFAULT_COLOR }}>{this.props.RefName}</Text>
                        <Icon containerStyle={{ top: 3, right: 10, position: 'absolute' }} name='close-outline' type='ionicon' onPress={() => this.closeBottomSheet()} color={DEFAULT_COLOR} size={35}></Icon>
                        <View style={styles.line}></View>

                        <TextInput
                            onChangeText={this.updateSearch}
                            defaultValue={this.state.search}
                            placeholder='Nhập sản phẩm cần tìm.'
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1, height: 50, borderRadius: 5,
                                justifyContent: 'flex-start', borderColor: 'lightgray',
                                fontSize: 15, marginRight: 10, marginLeft: 10
                            }}
                        ></TextInput>

                        <View style={styles.line}></View>
                        <ScrollView nestedScrollEnabled={true} style={{ padding: 12 }}>
                            {
                                this.state.lstShows.map(item => (
                                    <ListItem bottomDivider onPress={() => selectItemProduct(item, this.state.workinfo, this.refreshView, this.state.DisplayItem, this.bottomSheet, this.props.RefName)} >
                                        <ListItem.Content style={{ height: '100%', borderRadius: 10, flexDirection: 'row' }}>
                                            <ListItem.Title lineBreakMode={'clip'} numberOfLines={3} style={{ fontSize: 17, fontWeight: '600' }}>{item.name}</ListItem.Title>
                                        </ListItem.Content>
                                    </ListItem>
                                ))
                            }
                        </ScrollView>
                    </View>
                </ActionSheet>
            </View>
        )

    }
}
const selectItemProduct = async (item, workinfo, refreshView, DisplayItem, bottomSheet, refName) => {

    let resDisplay = await existAuditDisplayResult(workinfo.workId, DisplayItem.id, item.id, refName);
    let dataDisplay = await existAuditData(DisplayItem.id, item.name, refName);

    if (resDisplay.length > 0) {
        MessageInfo(refName + ' này bạn đã thêm rồi ( ' + item.name + ' )')
        return
    }

    if (dataDisplay.length > 0) {
        MessageInfo('Danh sách sản phẩm ban đầu đã có sẵn sản phẩm này rồi ( ' + item.name + ' )')
        return
    }

    let itemInsert = {
        workId: workinfo.workId,
        itemId: item.id,
        displayId: DisplayItem.id,
        displayRef: refName,
        target: -1,
        upload: 0
    }

    itemInsert = { ...itemInsert, kpi4: item.id, kpi4Name: item.name, kpi3: 1 }

    await insertDisplayResult(itemInsert, 4);
    await refreshView(item, 4);
    bottomSheet.hide();
}
const RenderSeparatorStyle = () => {
    return (<View style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }} />);
};
const RemoveProduct = async (item, workinfo, refreshView) => {
    await Store().then(db => {
        DeleteItem(db, 'displayAudit', { workId: workinfo.workId, kpi4: item.refId });
    })
    refreshView(item, 4)
}
const RenderRow = ({ item, index, Status, refreshView, workinfo, DisplayItem, Props, showProduct, showPOSM, NoChange }) => {
    return (
        <View style={{ width: '100%' }}>
            {
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'space-between', paddingLeft: 10, paddingBottom: 10, paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', paddingBottom: 5, width: '90%' }}>{item.itemName}</Text>
                        {
                            item.target === -1 &&
                            <TouchableOpacity onPress={(e) => { RemoveProduct(item, workinfo, refreshView) }} disabled={(Status === 0 && NoChange === 0) ? false : true}>
                                <Icon
                                    containerStyle={{ left: 2, alignItems: 'flex-end' }}
                                    type='ionicon'
                                    color='red'
                                    name='remove-circle-outline'
                                    size={30}
                                    activeOpacity={1}
                                />
                            </TouchableOpacity>
                        }
                    </View>

                    {
                        item.itemName !== '' && RenderTypeRow(item, Status, refreshView, workinfo, DisplayItem, showProduct, showPOSM, Props, NoChange)
                    }
                </View>
            }
            <View style={styles.line} />
        </View>
    );
};
const onChangeDate = async (selectedDate, item, workinfo, refreshView, DisplayItem) => {
    let fromdateConvert = Moment(selectedDate).format('YYYY-MM-DD');

    let itemInsert = {
        workId: workinfo.workId,
        displayId: DisplayItem.id,
        itemId: item.itemId,
        itemName: item.itemName,
        kpi7: fromdateConvert,
        displayRef: item.refName,
        displaySubCat: item.subCat,
        displayComment: item.displayComment,
        upload: 0
    }

    await insertDisplayResult(itemInsert, 7);
    refreshView(item, 7);
};

const RenderTypeRow = (item, Status, refreshView, workinfo, DisplayItem, showProduct, showPOSM, Props, NoChange) => {

    // 1: Text - 2: Number

    const [todoText, setTodoText] = useState((item.rkpi1 !== 'undefined' && item.rkpi1 !== null && item.rkpi1 !== undefined) ? item.rkpi1 + '' : '');
    const [todoNumber, setTodoNumber] = useState((item.rkpi2 !== 'undefined' && item.rkpi2 !== null && item.rkpi2 !== undefined) ? item.rkpi2 + '' : '');
    const [product, setProduct] = useState((item.rkpi4Name !== 'undefined' && item.rkpi4Name !== null && item.rkpi4Name !== undefined) ? item.rkpi4Name + '' : '');

    const saveQRCode = (barcode) => {

        InsertDefault(barcode[0].data, item, workinfo, refreshView, DisplayItem, 2)
        refreshView({}, 4)
    }
    const scanQRCODE = () => {
        let settingCamera = { ...workinfo, QRCode: 1, callBack: saveQRCode };
        Props.PropsParent.navigation.navigate('Camera', settingCamera);
    }
    const refreshCall = () => {
        refreshView({}, 4)
    }
    const takePhoto = (itemS) => {
        let item = {
            "reportId": workinfo.reportId,
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "photoType": 'Audit_' + DisplayItem.id + '_' + itemS.refName + '_' + itemS.itemId,
            "photoDate": workinfo.workDate,
            "photoDesc": DisplayItem.name + '_' + itemS.refName + '_' + itemS.itemName
        }

        Props.PropsParent.navigation.navigate('Camera', { ...item, callBackReport: refreshCall });
    };

    const showAlbumS = (itemS) => {
        let item = {
            "reportId": workinfo.reportId,
            "shopId": workinfo.shopId,
            "photoType": 'Audit_' + DisplayItem.id + '_' + itemS.refName + '_' + itemS.itemId,
            "photoDate": workinfo.workDate,
            "photoDesc": DisplayItem.name + '_' + itemS.refName + '_' + itemS.itemName
        }

        Props.PropsParent.navigation.navigate('AlbumPhoto', { ...item, callBackReport: refreshCall });
    };

    return (
        <View style={{ justifyContent: 'space-between', flexDirection: 'column' }}>
            {
                (item.kpi1 !== null && item.kpi1 !== 0) &&
                <View>
                    <TextInput
                        returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                        returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                        keyboardType={item.kpi1 === 1 ? 'default' : 'numeric'}
                        editable={(Status === 0 && NoChange === 0) ? true : false}
                        backgroundColor={(Status === 0 && NoChange === 0) ? 'white' : 'gray'}
                        onChangeText={text => {
                            InsertDefault(text, item, workinfo, refreshView, DisplayItem, 1)
                        }}
                        defaultValue={todoText}
                        style={{ fontSize: 15, color: 'black', minHeight: 37, textAlign: 'center', borderWidth: 0.6, borderColor: 'gray', width: '98%', height: 45, marginTop: 3 }}
                        placeholder={item.kpi1Holder !== 'null' ? item.kpi1Holder : 'Vui lòng nhập số lượng'}
                    />
                    {
                        (item.kpi7 === 1) &&
                        <View style={{ flexDirection: "row", left: 5, width: '100%', justifyContent: 'flex-start' }}>
                            <Button
                                containerStyle={{ width: '33%' }}
                                buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                onPress={e => {
                                    (Status == 0 && NoChange === 0) && takePhoto(item)
                                }}
                                icon={
                                    <Icon
                                        color='black'
                                        name='camera'
                                        type='ionicon'
                                        size={33}
                                    />
                                }
                            />
                            <Button
                                containerStyle={{ width: '33%' }}
                                buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                onPress={e => {
                                    showAlbumS(item)
                                }}
                                icon={
                                    <View>
                                        <Icon
                                            color='black'
                                            name='photo'
                                            type='font-awesome'
                                            size={30}
                                        />
                                        {/* <Badge
                                    value={item.numPhoto}
                                    textStyle={{fontSize:12}}
                                    badgeStyle={{width:25,height:25,borderRadius:12.5}}
                                    status='primary'
                                    containerStyle={{ position: 'absolute', top: -8, right: -15 }}
                                    onPress={e => showAlbumS(item)} 
                                /> */}
                                    </View>
                                }
                            />
                        </View>
                    }
                </View>
            }
            {
                (item.kpi2 !== null && item.kpi2 !== 0) &&
                <View style={{ flexDirection: 'column' }}>
                    <TextInput
                        returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                        returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                        keyboardType={item.kpi2 === 1 ? 'default' : 'numeric'}
                        editable={(Status === 0 && NoChange === 0) ? true : false}
                        backgroundColor={(Status === 0 && NoChange === 0) ? 'white' : 'gray'}
                        onChangeText={text => {
                            if (isNaN(text) && item.kpi2 === 2) {
                                setTodoNumber('');
                                InsertDefault('', item, workinfo, refreshView, DisplayItem, 2)
                                alert('Bạn phải nhập số cho mục số lượng.');
                                return
                            }

                            InsertDefault(text, item, workinfo, refreshView, DisplayItem, 2)
                        }}
                        defaultValue={todoNumber}
                        style={{ fontSize: 15, color: 'black', minHeight: 37, textAlign: 'center', borderWidth: 0.6, borderColor: 'gray', width: '98%', height: 45, marginTop: 3 }}
                        placeholder={item.kpi2Holder !== 'null' ? item.kpi2Holder : item.kpi2 > 1 ? 'Nhập số lượng' : 'Nhập nội dung'}
                    />
                    {
                        (item.kpi7 === 1) &&
                        <View style={{ flexDirection: "row", left: 5, width: '100%', justifyContent: 'flex-start' }}>
                            <Button
                                containerStyle={{ width: '33%' }}
                                buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                onPress={e => {
                                    (Status == 0 && NoChange === 0) && takePhoto(item)
                                }}
                                icon={
                                    <Icon
                                        color='black'
                                        name='camera'
                                        type='ionicon'
                                        size={33}
                                    />
                                }
                            />
                            <Button
                                containerStyle={{ width: '33%' }}
                                buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                onPress={e => {
                                    showAlbumS(item)
                                }}
                                icon={
                                    <View>
                                        <Icon
                                            color='black'
                                            name='photo'
                                            type='font-awesome'
                                            size={30}
                                        />
                                        {/* <Badge
                                        value={item.numPhoto}
                                        textStyle={{fontSize:12}}
                                        badgeStyle={{width:25,height:25,borderRadius:12.5}}
                                        status='primary'
                                        containerStyle={{ position: 'absolute', top: -8, right: -15 }}
                                        onPress={e => showAlbumS(item)} 
                                    /> */}
                                    </View>
                                }
                            />
                        </View>
                    }
                </View>
            }
            {/* {
            (item.kpi4 !== null && item.kpi4 !== 0) &&
            <View style={{flexDirection:'row',width:'40%'}}>
                <TextInput
                    numberOfLines={3}
                    keyboardType={item.kpi4 === 1 ? 'default':'number-pad'}
                    editable = {false}
                    backgroundColor = {(Status === 0) ? 'white':'gray'}
                    onChangeText={text=>{
                        InsertDefault(text,item,workinfo,refreshView,DisplayItem,1)
                    }}
                    defaultValue={product}
                    style={{fontSize:15,color:'black',minHeight:55,textAlign:'center',borderWidth:0.6,borderColor:'gray',width:'70%',backgroundColor:'lightgray'}}
                    placeholder= {'SP thay thế'}
                />
                <TouchableOpacity onPress= {(e)=>{showProduct(item)}} disabled={Status === 0 ? false:true}>
                <Icon
                    containerStyle={{left:2,alignItems:'flex-end'}}
                    type='ionicon'
                    color='black'
                    name='add-circle-outline'
                    size={30} 
                    activeOpacity={1}
                />
                </TouchableOpacity>
            </View>
        } */}

            {
                (item.kpi5 === 1) &&
                <View style={{ flexDirection: 'row', width: '40%', justifyContent: 'space-between', height: 30 }}>
                    <TouchableOpacity onPress={(e) => {
                        if (Props.RefName === 'PRODUCT') {
                            showProduct()
                        } else if (Props.RefName === 'POSM') {
                            showPOSM()
                        }
                        else if (Props.RefName === 'ISSUE') {
                            showPOSM()
                        }
                        else {
                            showProduct()
                        }
                    }} disabled={(Status === 0 && NoChange === 0) ? false : true}>
                        <Icon
                            containerStyle={{ left: 2, alignItems: 'flex-end' }}
                            type='ionicon'
                            color='green'
                            name='add-circle-outline'
                            size={30}
                            activeOpacity={1}
                        />
                    </TouchableOpacity>
                </View>
            }
            {

                (item.kpi3 !== null && item.kpi3 !== 0) &&
                <View style={{ flexDirection: 'column' }}>
                    {
                        (item.refName !== 'ISSUE' && item.target !== -1) &&
                        ((item.refName === 'POSM') ?
                            <View style={{ justifyContent: 'flex-start', flexDirection: 'row', width: '100%', height: 60, paddingRight: 35 }}>
                                <CheckBox
                                    disabled={(Status !== 0) ? true : (NoChange === 1 ? true : false)}
                                    containerStyle={{ width: '18%' }}
                                    textStyle={{ fontSize: 10, left: -10 }}
                                    center={false}
                                    title="Có"
                                    checkedIcon="dot-circle-o"
                                    uncheckedIcon="circle-o"
                                    checked={item.rkpi3 === 1 ? true : false}
                                    onPress={() => setCheckBox(item, workinfo, refreshView, DisplayItem, 'yes')}
                                />
                                <CheckBox
                                    disabled={(Status !== 0) ? true : (NoChange === 1 ? true : false)}
                                    containerStyle={{ width: '24%' }}
                                    textStyle={{ fontSize: 10, left: -10 }}
                                    center={false}
                                    title="Không"
                                    checkedIcon="dot-circle-o"
                                    uncheckedIcon="circle-o"
                                    checked={item.rkpi3 === 0 ? true : false}
                                    onPress={() => setCheckBox(item, workinfo, refreshView, DisplayItem, 'no')}
                                />
                                <CheckBox
                                    disabled={(Status !== 0) ? true : (NoChange === 1 ? true : false)}
                                    containerStyle={{ width: '64%' }}
                                    textStyle={{ fontSize: 9, left: -10 }}
                                    center={false}
                                    title={`  Hết \n(Có triển khai nhưng đã hết)`}
                                    checkedIcon="dot-circle-o"
                                    uncheckedIcon="circle-o"
                                    checked={item.rkpi3 === 2 ? true : false}
                                    onPress={() => setCheckBox(item, workinfo, refreshView, DisplayItem, 'out')}
                                />
                            </View> :
                            <View style={{ justifyContent: 'flex-start', flexDirection: 'row', width: '100%', height: 45 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ alignSelf: 'center', fontSize: 15 }}>CÓ</Text>
                                    <Switch
                                        // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
                                        style={{ marginRight: 1, transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }] }}
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor="#f5dd4b"//{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={valueS => ToggleSwitchYES(valueS, item, workinfo, refreshView, DisplayItem)}
                                        value={item.rkpi3 === 1 ? true : false}
                                        disabled={(Status !== 0) ? true : (NoChange === 1 ? true : false)}

                                    />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ alignSelf: 'center', fontSize: 15 }}>KHÔNG</Text>
                                    <Switch
                                        // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
                                        style={{ marginRight: 1, transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }] }}
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor="#f5dd4b"//{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={valueS => ToggleSwitchNO(valueS, item, workinfo, refreshView, DisplayItem)}
                                        value={item.rkpi3 === 0 ? true : false}
                                        disabled={(Status !== 0) ? true : (NoChange === 1 ? true : false)}
                                    />
                                </View>
                            </View>)
                    }

                    {
                        (item.rkpi3 === 1) &&
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                            {
                                // item.refName !== 'POSM' &&
                                <View style={{ width: '63%', flexDirection: 'row', justifyContent: 'flex-start', }}>
                                    <TextInput
                                        returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                                        returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                                        keyboardType={(item.refName === 'POSM' && item.kpi3 > 1) ? 'numeric' : 'default'}//item.kpi3 > 1 ? 'numeric' : 'default'
                                        editable={(Status === 0 && NoChange === 0) ? true : false}
                                        backgroundColor={(Status === 0 && NoChange === 0) ? 'white' : 'gray'}
                                        // maxLength={item.kpi3}
                                        onChangeText={text => {
                                            // if(isNaN(text) && item.kpi3 > 1)
                                            // {
                                            //     setTodoNumber('');
                                            //     InsertDefault('',item,workinfo,refreshView,DisplayItem,2)
                                            //     alert('Bạn phải nhập số cho mục này.');
                                            //     return
                                            // }

                                            InsertDefault(text, item, workinfo, refreshView, DisplayItem, 2)
                                        }}
                                        defaultValue={todoNumber}
                                        style={{ fontSize: 15, color: 'black', minHeight: 37, textAlign: 'center', borderWidth: 0.6, borderColor: 'gray', width: '79%', height: 45, marginTop: 3 }}
                                        placeholder={item.kpi2Holder !== 'null' ? item.kpi2Holder : item.refName === 'PRODUCT' ? 'Vui lòng nhập IMEI' : item.kpi3 > 1 ? 'Vui lòng nhập số lượng' : ''}
                                    />
                                    {
                                        item.refName === 'PRODUCT' &&
                                        <TouchableOpacity onPress={() => (Status === 0 && NoChange === 0) && scanQRCODE()}>
                                            <View style={{ height: 55, width: 55, left: 5, top: 5 }}>
                                                {
                                                    <LottieView
                                                        style={{ width: 40, height: 40 }}
                                                        source={require('../Themes/Images/barcode-scanner.json')}
                                                        autoPlay
                                                        loop={true}
                                                    />
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    }
                                </View>
                            }

                            <View style={{ flexDirection: "row", left: 2, justifyContent: item.refName === 'PRODUCT' ? 'flex-end' : 'flex-start', width: '35%' }}>
                                <Button
                                    // containerStyle={{width:'33%'}}
                                    buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                    onPress={e => {
                                        (Status == 0 && NoChange === 0) && takePhoto(item)
                                    }}
                                    icon={
                                        <Icon
                                            color='black'
                                            name='camera'
                                            type='ionicon'
                                            size={30}
                                        />
                                    }
                                />
                                <Button
                                    // containerStyle={{width:'33%'}}
                                    buttonStyle={{ height: 45, backgroundColor: 'transparent' }}
                                    onPress={e => {
                                        showAlbumS(item)
                                    }}
                                    icon={
                                        <View>
                                            <Icon
                                                color='black'
                                                name='photo'
                                                type='font-awesome'
                                                size={30}
                                            />
                                            {/* <Badge
                                            value={item.numPhoto}
                                            textStyle={{fontSize:12}}
                                            badgeStyle={{width:25,height:25,borderRadius:12.5}}
                                            status='primary'
                                            containerStyle={{ position: 'absolute', top: -8, right: -15 }}
                                            onPress={e => showAlbumS(item)} 
                                        /> */}
                                        </View>
                                    }
                                />
                            </View>
                        </View>
                    }
                </View>
            }
            {
                // (item.kpi5 !== null && item.kpi5 !== 0) &&
                //     <DatePicker
                //         style={{width: '98%',marginTop:3}}
                //         disabled={Status === 0 ? false:true}
                //         customStyles={{ 
                //             placeholderText:{color:'gray'},
                //             dateText:{textAlign:'center',fontSize:15,}, 
                //             dateInput: { alignItems: 'center', borderWidth: 0.5, borderRadius: 8,backgroundColor:'lightgray' } }}
                //         date={item.rkpi7 !== 'undefined' && item.rkpi7 !== null && item.rkpi7 !== undefined ? Moment(item.rkpi7).format('YYYY-MM-DD') : null}
                //         mode='date'
                //         placeholder="chọn ngày"
                //         format="YYYY-MM-DD"
                //         minDate="1890-01-01"
                //         confirmBtnText="Confirm"
                //         cancelBtnText="Cancel"
                //         showIcon={false}
                //         onDateChange={(date) => { onChangeDate(date,item,workinfo,refreshView,DisplayItem) }}
                //     />
            }
        </View>
    )
}
const InsertDefault = (text, item, workinfo, refreshView, DisplayItem, type) => {

    let itemInsert = {
        workId: workinfo.workId,
        displayId: DisplayItem.id,
        itemId: item.itemId,
        itemName: item.itemName,
        displayRef: item.refName,
        displaySubCat: item.subCat,
        displayComment: item.displayComment !== null ? item.displayComment : '',
        upload: 0
    }

    switch (type) {
        case 1:
            itemInsert = { ...itemInsert, kpi1: (text != '' ? (isNaN(text) ? text : parseFloat(text)) : '') }
            break
        case 2:
            itemInsert = { ...itemInsert, kpi2: (text != '' ? (isNaN(text) ? text : parseFloat(text)) : '') }
            break
    }

    insertDisplayResult(itemInsert, type);
    refreshView();
}
const setCheckBox = async (item, workinfo, refreshView, DisplayItem, type) => {
    var result = -1;
    switch (type) {
        case 'yes':
            result = 1;
            break;
        case 'no':
            result = 0;
            break;
        case 'out':
            result = 2;
            break;
        default:
            break;
    }

    let itemInsert = {
        workId: workinfo.workId,
        displayId: DisplayItem.id,
        itemId: item.itemId,
        itemName: item.itemName,
        kpi3: result,
        kpi2: '',
        displayRef: item.refName,
        displaySubCat: item.subCat,
        displayComment: item.displayComment,
        upload: 0
    }

    await insertDisplayResult(itemInsert, 3);
    if (result !== 1) {
        let photoType = 'Audit_' + DisplayItem.id + '_' + item.refName + '_' + item.itemId
        await deleteItemPhotosAudit(workinfo.reportId, workinfo.shopId, workinfo.workDate, photoType)
    }

    refreshView(item, 3);
};
const ToggleSwitchYES = async (value, item, workinfo, refreshView, DisplayItem) => {

    let itemInsert = {
        workId: workinfo.workId,
        displayId: DisplayItem.id,
        itemId: item.itemId,
        itemName: item.itemName,
        kpi3: (value === true ? 1 : -1),
        displayRef: item.refName,
        displaySubCat: item.subCat,
        displayComment: item.displayComment,
        upload: 0
    }

    await insertDisplayResult(itemInsert, 3);
    refreshView(item, 3);
};

const ToggleSwitchNO = async (value, item, workinfo, refreshView, DisplayItem) => {
    let itemInsert = {
        workId: workinfo.workId,
        displayId: DisplayItem.id,
        itemId: item.itemId,
        itemName: item.itemName,
        kpi3: (value === true ? 0 : -1),
        kpi2: null,
        displayRef: item.refName,
        displaySubCat: item.subCat,
        displayComment: item.displayComment,
        upload: 0
    }

    await insertDisplayResult(itemInsert, 3);
    let photoType = 'Audit_' + DisplayItem.id + '_' + item.refName + '_' + item.itemId
    await deleteItemPhotosAudit(workinfo.reportId, workinfo.shopId, workinfo.workDate, photoType)
    refreshView(item, 3)
};