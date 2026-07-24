import React, { PureComponent } from "react";
import { View, FlatList, ImageBackground, Text, Platform, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { Icon, Button, ListItem } from '@rneui/themed';
import { GetEmployeeInfo, MessageInfo, Token, UploadData } from '../../Core/Helper';
import { getPhotosByGuiId, getPhotosByLstGuiId } from "../../Controller/WorkController";
import { _competitorId, URL_GETIMEI, URL_UPLOAD_PHOTOALLDATA, AppNameBuild } from '../../Core/URLs';
import { alertToast, checkNetwork } from "../../Core/Utility";
import moment from 'moment'
import { UpdateStatusPhotoData, uploadAllDataPhoto } from "../../Controller/PhotoController";
import { SelloutVerifyRow } from "../../Content/SelloutVerifyRow";
import Moment from 'moment';
import * as Progress from 'react-native-progress';
import { getRequestFilterVerifySO } from "../../Controller/MasterController";
import ActionSheet from "react-native-actions-sheet";
import { Modalize } from 'react-native-modalize';
import ActionFilter from "../ReportHistory/ActionFilter";
import { HeaderCustom } from '../../Content/HeaderCustom';
import { AppCreateAction } from "../../Core/ReduxController";
import { connect } from "react-redux";
import { bindActionCreators } from "@reduxjs/toolkit";

const styles = StyleSheet.create({
    separator: {
        width: '100%',
        height: 0.6,
        backgroundColor: '#e9e9e9'
    }
});

class VeryfySellout extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            guiId: '',
            IdNosell: 0,
            isHiddentNosell: false,
            idHaveNosell: false,
            loadHistory: false,
            itemSelected: null,
            showProgress: false,
            display: 'none',
            workinfo: this.props.route.params,
            reload: 0,
            isShowAlert: false,
            show: false,
            toDate: new Date(),
            loadAll: true,
            Sellouts: [],
            SelloutsF: [],
            arrShow: [],
            selectedStatus: '',
            selectedIdStatus: -1,
            toDay: moment(new Date()).format('YYYY-MM-DD').toString(),
            markingType: 'custom',
            markedDates: {},
            isStartDay: false,
            isEndDay: false,
            startDate: '',
            endDate: '',
            dateFilter: [],
            isFilter: false,
            EmployeeId: 0
        }
    }

    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    async selloutLoad() {
        this.loaddata(this.state.startDate, this.state.endDate);
    }
    async loaddata(startDate, endDate) {
        // this.setState({selectedStatus:'',selectedIdStatus:-1})
        this.setShowProgress(true);

        let token = await Token();
        let itemHeader = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }

        itemHeader = startDate !== null ? {
            ...itemHeader,
            startDate: Moment(startDate).format('yyyy-MM-DD'),
            endDate: Moment(endDate).format('yyyy-MM-DD')
        } : itemHeader

        let dataFetch = await fetch(URL_GETIMEI, {
            method: 'GET',
            headers: itemHeader
        });
        let dataSellout = await dataFetch.json()

        this.setShowProgress(false);

        this.setState({
            Sellouts: this.state.selectedIdStatus !== -1 ? dataSellout.filter(it => it.imeiStatus === this.state.selectedIdStatus) : dataSellout,
            SelloutsF: dataSellout
        });

        dataSellout.map(itemR => (itemR.guiId !== undefined) && this.mapItem(itemR))
        // this._modalize.close()
    }
    mapItem = async (item) => {
        let guiId = item.guiId === null || item.guiId === 'null' || item.guiId === '' ? this.state.EmployeeId + '_' + item.serial : item.guiId

        let lst = await getPhotosByGuiId(guiId, item.shopId);
        if (lst !== undefined && lst.length > 0) {

            let statusLst = lst.filter(itemP => itemP.dataUpload === 0 && itemP.fileUpload === 0)
            if (AppNameBuild === 'bk') {
                this.setState({ Sellouts: this.state.Sellouts.map(itemS => (itemS.guiId === guiId) ? { ...itemS, numPhoto: lst.length, status: statusLst.length > 0 ? 0 : 1 } : itemS) })
            }
            else {
                this.setState({ Sellouts: this.state.Sellouts.map(itemS => (itemS.serial === item.serial) ? { ...itemS, numPhoto: lst.length, status: statusLst.length > 0 ? 0 : 1 } : itemS) })
            }

        }
    }
    loadItemFilter = async () => {
        let lstMaster = await getRequestFilterVerifySO()
        this.setState({ arrShow: lstMaster })
    }
    async componentDidMount() {
        await this.setState({
            startDate: moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().endOf('month').format('YYYY-MM-DD')
        })
        await this.handlerSelectDate(this.state.startDate)
        await this.handlerSelectDate(this.state.endDate)
        await this.loadItemFilter();

        try {
            let Empinfo = await GetEmployeeInfo();
            let jsonEmp = Empinfo
            this.setState({ EmployeeId: jsonEmp.employeeId })
        } catch (error) {
            alert('error: get EmployeeId')
        }
    }
    async uploadSellout() {

        let itemsPhoto = [];
        let resPhotos = [];

        let guidLst = '';
        let count = 0
        this.state.Sellouts.forEach(async item => {
            count += 1;
            let guiid = item.guiId === null || item.guiId === 'null' || item.guiId === '' ? this.state.EmployeeId + '_' + item.serial : item.guiId;

            if (count === 1) {
                guidLst += "'" + guiid + "'"
            }
            else {
                guidLst += ',' + "'" + guiid + "'"
            }
        });

        if (guidLst != '') {
            let lstPhotos = await getPhotosByLstGuiId(guidLst);

            if (lstPhotos.length > 0) {
                lstPhotos.forEach(photoInfo => {
                    let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);

                    let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
                    let dataItem = {
                        "shopId": photoInfo.shopId,
                        "photoName": ImgName,
                        "latitude": photoInfo.latitude,
                        "longitude": photoInfo.longitude,
                        "accuracy": 8,
                        "reportId": -2,
                        "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        "photoType": "VERIFY_SELLOUT",
                        "photoDesc": photoInfo.photoDesc,
                        "photoDate": photoInfo.photoDate,
                        "photoPath": pathPhoto,
                        "guid": photoInfo.guid
                    }

                    itemsPhoto.push(dataItem);
                    resPhotos.push(photoInfo)
                });

                this.uploadItem(itemsPhoto, resPhotos)
            }
            else {
                MessageInfo('Không có dữ liệu để gửi.')
            }
        }
    }
    uploadItem = async (photos, photosRes) => {
        let isNetwork = await checkNetwork();

        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        this.setShowProgress(true);
        var SellInfo = {
            "Photos": JSON.stringify(photos)
        };

        var Results = await UploadData(URL_UPLOAD_PHOTOALLDATA, JSON.stringify(SellInfo));

        if (Results != null && Results.status == 200) {
            alertToast('Gửi dữ liệu thành công');
            photosRes.map(async itemR => {
                await UpdateStatusPhotoData(itemR.id)
            })

            await uploadAllDataPhoto(photosRes)
            await this.loaddata(this.state.startDate, this.state.endDate);
        } else {
            alert('Chưa gửi được dữ liệu');
        }

    }
    onChange = (event, selectedDate) => {
        let currentDate = selectedDate;
        this.setState({ toDate: currentDate, loadAll: false, Sellouts: [] });
        this.setState({ show: this.state.show ? false : true });
        this.loaddata(selectedDate)
    };
    hiddenCalender = (loadData) => {
        this.setState({ show: this.state.show ? false : true });
        if (loadData === true) {
            this.setState({ loadAll: true })
            this.loaddata(this.state.startDate, this.state.endDate)
        }
    }
    async OnItemClick(item) {
        this._bottomSheet.hide()
        await this.setState({ selectedStatus: item.name, selectedIdStatus: item.Id })

        if (item.Id !== 0) {
            let lstAdd = this.state.SelloutsF.filter(it => it.imeiStatus === item.Id);
            lstAdd.map(itemR => (itemR.guiId !== undefined) && this.mapItem(itemR))

            this.setState({ Sellouts: lstAdd })
            // dataSellout.map(itemR =>(itemR.guiId !== undefined) && this.mapItem(itemR))
        } else {
            let lstAdd = this.state.SelloutsF;
            lstAdd.map(itemR => (itemR.guiId !== undefined) && this.mapItem(itemR))

            this.setState({ Sellouts: lstAdd });
        }
    }
    renderItem = ({ item }) => (
        Platform.OS === 'android' ?
            <ListItem style={{ height: 55, width: '100%', bottom: 10, backgroundColor: this.props.appcolor.homebackground }} onPress={() => this.OnItemClick(item)} >
                <ListItem.Content style={{ height: '100%', alignItems: 'center', backgroundColor: this.props.appcolor.homebackground, borderRadius: 10 }}>
                    <ListItem.Title lineBreakMode={'clip'} numberOfLines={3} style={{ fontSize: 15, padding: 10, color: this.props.appcolor.dark }}>{item.name}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            :
            <TouchableOpacity onPress={() => this.OnItemClick(item)}>
                <Text style={{
                    fontSize: 16,
                    padding: 8, width: '100%', textAlign: 'center', color: this.props.appcolor.dark, backgroundColor: this.props.appcolor.light, borderRadius: 8, marginBottom: 8
                }}>{item.name}</Text>
            </TouchableOpacity>
    )
    handlerApplyFilter = (typeFilter) => {
        const sortList = [];
        if (typeFilter == 'APPLY') {
            if (this.state.dateFilter.length > 0) {
                this.state.dataRenderAll.filter(item => {
                    let items = this.state.dateFilter.filter(mFilter => item.dateView.indexOf(mFilter) > -1)
                    if (items.length > 0) {
                        sortList.push(item)
                    }
                })
            } else {
                sortList = { ...this.state.dataRenderAll };
            }
            this.setState({ lstHistoryReport: sortList, isFilter: true })
            filterRef.current.close();
        } else {
            this.setState({
                isFilter: false,
                dateFilter: [],
                lstHistoryReport: this.state.dataRenderAll,
                markedDates: this.markedDatesDefault, markingType: this.markingTypeDefault
            })
        }
    }
    handlerSelectDate = async (dateString) => {

        if (dateString !== null && dateString !== undefined) {
            if (dateString < this.state.startDate) {
                await this.setState({ startDate: dateString, endDate: '', isStartDay: false })
                this.handlerSelectDate(dateString)
            }
            else {
                if (!this.state.isStartDay) {
                    const markedDates = {};
                    const dateFilter = [];
                    markedDates[dateString] = { startingDay: true, color: '#ffa500', textColor: 'white' }
                    dateFilter.push(dateString);
                    this.setState({
                        dateFilter: dateFilter,
                        markingType: 'period',
                        markedDates: markedDates,
                        isStartDay: true,
                        isEndDay: false,
                        startDate: dateString,
                        // endDate:''
                    })
                } else {
                    const markedDates = { ...this.state.markedDates };
                    const dateFilter = this.state.dateFilter;
                    //
                    let startDate = moment(this.state.startDate);
                    let endDate = moment(dateString);
                    let range = endDate.diff(startDate, 'days')

                    await this.setState({ endDate: dateString })
                    if (range > 0) {
                        for (let i = 1; i <= range; i++) {
                            let tempDate = startDate.add(1, 'day');
                            tempDate = moment(tempDate).format('YYYY-MM-DD')
                            dateFilter.push(tempDate);
                            if (i < range) {
                                markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
                            } else {
                                markedDates[tempDate] = { endingDay: true, color: '#ffa500', textColor: 'white' };
                            }
                        }
                        this.setState({
                            dateFilter: dateFilter,
                            markingType: 'period',
                            markedDates: markedDates,
                            isStartDay: false,
                            isEndDay: true,
                            // startDate: ''
                        })
                    }

                    this.state.endDate !== '' && this.loaddata(this.state.startDate, this.state.endDate)
                }
            }


        } else {
            this.setState({ markedDates: this.markedDatesDefault, markingType: this.markingTypeDefault })
        }
    }
    render() {
        const show = this.state.display;
        const showlist = show == 'none' ? 'flex' : 'none';
        const workinfo = this.props.route.params;
        const appcolor = this.props.appcolor
        return (
            <ImageBackground style={{ height: '100%', width: '100%', backgroundColor: appcolor.light }}>
                <View style={{ flex: 1, display: showlist }}>
                    <HeaderCustom
                        title={this.props.route?.params?.titlePage}
                        iconRight='cloud-upload-alt'
                        leftFunc={() => this.props.navigation.goBack()}
                        rightFunc={() => this.uploadSellout()}
                    />
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 15 }}>
                        {/* <TouchableOpacity containerStyle={{width:'30%',backgroundColor:appcolor.primary}} onPress={e => this.hiddenCalender(e)} >
                        <Text 
                            style={{
                                marginLeft:5,
                                width:'100%',
                                alignContent:'center',
                                alignItems:'center',
                                alignSelf:'center',
                                textAlign:"center",
                                paddingTop:15,
                                paddingBottom:15,
                                color:'#fff'
                                }}>
                        {
                            this.state.loadAll ?  '-- Chọn ngày ở đây --':Moment(this.state.toDate).format('DD-MM-YYYY')
                        }
                        </Text>
                    </TouchableOpacity> */}
                        <TouchableOpacity containerStyle={{ width: '60%', backgroundColor: appcolor.primary }} onPress={e => {

                            this._modalize.open('top')
                        }} >
                            <Text
                                style={{
                                    marginLeft: 5,
                                    width: '100%',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    textAlign: "center",
                                    fontWeight: '700',
                                    paddingTop: 15,
                                    paddingBottom: 15,
                                    fontSize: 12,
                                    color: '#fff'
                                }}>
                                {this.state.startDate + '  ->  ' + this.state.endDate}
                            </Text>
                        </TouchableOpacity>
                        {
                            (this.state.arrShow !== undefined && this.state.arrShow.length > 0) &&
                            <TouchableOpacity containerStyle={{ width: '37%', borderColor: appcolor.primary, borderWidth: 0.3 }} onPress={e => this._bottomSheet.show()} >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text
                                        style={{
                                            width: '75%',
                                            fontWeight: '700',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                            textAlign: 'right',
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            fontSize: 12,
                                            color: appcolor.primary
                                        }}>
                                        {
                                            this.state.selectedStatus === '' ? this.state.arrShow[0].name : this.state.selectedStatus
                                        }
                                    </Text>
                                    <SpiralIcon containerStyle={{ width: '25%' }} type='ionicon' name='funnel-outline' size={28}></SpiralIcon>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                    <FlatList
                        data={this.state.Sellouts}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item, index }) => (<SelloutVerifyRow item={item} index={index} selloutLoad={() => this.selloutLoad()} Props={this.props} workinfo={workinfo} />)}
                        keyExtractor={(item, index) => `message ${index}`} />
                    {
                        this.state.show && (
                            <View>

                                {
                                    // Platform.OS == 'android' ?
                                    //  <DateTimePicker
                                    //     onAccessibilityEscape={() => alert(87)}
                                    //     style={{ marginLeft: Platform.OS === 'ios' ? 30 : null, marginBottom: 30 }}
                                    //     testID="dateTimePicker"
                                    //     // timeZoneOffsetInMinutes={0}
                                    //     value={this.state.toDate || new Date()}
                                    //     mode={'date'}
                                    //     is24Hour={true}
                                    //     display="default"
                                    //     onChange={(e, date) => {
                                    //         this.onChange(e, date)

                                    //     }}
                                    // /> :
                                    <View>
                                        <View style={{ alignSelf: "flex-end", flexDirection: 'row', justifyContent: 'space-between', height: 75, width: '100%', paddingBottom: 30 }}>
                                            <Button
                                                title=" Tất cả"
                                                titleStyle={{ fontSize: 11, color: 'black' }}
                                                buttonStyle={{ width: 100, height: 35, marginLeft: 10, borderRadius: 35 / 2, backgroundColor: 'white', borderColor: 'gray', borderWidth: 1 }}
                                                onPress={e => this.hiddenCalender(true)}
                                            />
                                            <Button
                                                title=" Đóng lịch"
                                                titleStyle={{ fontSize: 11, color: 'black' }}
                                                buttonStyle={{ width: 100, height: 35, marginRight: 10, borderRadius: 35 / 2, backgroundColor: 'white', borderColor: 'gray', borderWidth: 1 }}
                                                onPress={e => this.hiddenCalender(false)}
                                                icon={
                                                    <SpiralIcon
                                                        color='black'
                                                        name='close'
                                                        type='FontAwesome'
                                                        size={15}
                                                    />
                                                }
                                            />
                                        </View>
                                        {/* <DateTimePicker
                                                style={{ marginLeft: Platform.OS === 'ios' ? 30 : null, marginBottom: 30 }}
                                                testID="dateTimePicker"
                                                // timeZoneOffsetInMinutes={0}
                                                value={this.state.toDate || new Date()}
                                                mode={'date'}
                                                is24Hour={true}
                                                display="default"
                                                onChange={(e, date) => {
                                                    this.onChange(e, date)
                                                }}
                                            /> */}
                                    </View>
                                }

                            </View>
                        )}
                    {
                        this.state.showProgress === true && <Progress.Circle color={appcolor.primary} thickness={25} size={90} indeterminate={true} style={{ position: 'absolute', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }} />
                    }
                </View>
                <ActionSheet
                    ref={ref => this._bottomSheet = ref}
                    defaultOverlayOpacity={0.3}
                    containerStyle={{ padding: 8, height: '60%', width: '100%', backgroundColor: appcolor.homebackground }}>
                    <View style={{ backgroundColor: appcolor.homebackground, width: '100%', height: 250 }}>
                        <FlatList
                            key={(item) => item.id}
                            keyExtractor={(_, index) => index.toString()}
                            data={this.state.arrShow}
                            renderItem={this.renderItem}
                        />
                    </View>
                </ActionSheet>
                <Modalize ref={ref => this._modalize = ref} modalHeight={450} modalStyle={{ backgroundColor: appcolor.light }}>
                    <View View style={{ flex: 1, margin: 8 }}>
                        <ActionFilter handlerSelectDate={this.handlerSelectDate.bind(this)} mState={this.state} />
                    </View >
                </Modalize>
            </ImageBackground>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        GAppState: state.GAppState,
        appcolor: state.GAppState.appcolor,
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch),
    }
}
export default connect(mapStateToProps, mapDispathToProps)(VeryfySellout); 