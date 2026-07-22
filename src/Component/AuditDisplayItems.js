import React, { Component } from 'react';
import { View, Text, TouchableHighlight, TouchableOpacity, Dimensions, TextInput, ImageBackground, StyleSheet } from "react-native";
import PageHeader from '../Content/PageHeader';
import { getItemsProgramDisplay, getItemsAuditDisplayMitsu, getGroupAudit, getAuditDisplayResult, updateHavePack, getPhotosAuditUploaded, getPhotosReport } from '../Controller/WorkController'
import { updateAuditDisplayResult } from '../Controller/WorkController'
import * as Progress from 'react-native-progress';
import { checkNetwork, deviceWidth, minWidthTab } from "../Core/Utility";
import { Message, MessageInfo } from '../Core/Helper';
import { AppNameBuild, nokiaApp, URL_UPLOAD_AUDIT_DISPLAY } from '../Core/URLs';
import { Token } from '../Core/Helper';
import Moment from 'moment';
import { RadioButton } from '../Core/RadioButton';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { appcolor } from '../Themes/AppColor';
import AuditItemsContent from '../Content/AuditItemsContent';
import { PhotoCustom } from '../Content/PhotosCustom';
import { getRequestPhotos } from '../Controller/MasterController';
import { uploadAllDataPhoto } from '../Controller/PhotoController';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'

const styles = StyleSheet.create({
  line: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 4,
    marginTop: 4
  },
  viewEnter: {
    borderWidth: 1,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    borderColor: '#F2F2F2',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    marginTop: 10
  },
  labelSellout: {
    padding: 3,
    color: 'black',
    fontWeight: '600',
    fontSize: 17
  }
});

export default class AuditDisplayItems extends Component {

    constructor(props) {
        super(props)
        this.state = {
            togPhoto: 0,
            countPhoto: 0,
            progress: 0,
            indeterminate: true,
            showProgress: false,
            showProgressPhoto: false,
            workinfo: this.props.route.params.workinfo,
            lstShow: [],
            DisplayItem: this.props.route.params.DisplayItem,
            isHiddenNote: true,
            cateSaved: '',
            subCateSaved: '',
            Status: 0,
            isHavePack: null,
            lstGroup: [],
            groupName: '',
            isPhotoView: false,
            lstRequestPhotos: [],
            noteCommon: '',
            questionShop: ''
        }
    }
    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    setShowProgressPhoto = (check) => {
        this.setState({ showProgressPhoto: check });
    }
    DisplayItemMap(lstItemsProgram, resDisplay) {

        let MapArr = [];
        let itemMap = {};
        let items = {};
        let refName = '';
        let subItems = [];

        lstItemsProgram.map((item, i) => {
            let ItemRes = [];
            let ItemsAdd = [];

            if (Array.isArray(resDisplay)) {
                let itemsHave = resDisplay.filter(itemRes => itemRes.itemId === item.id)
                if (itemsHave.length > 0) {
                    ItemRes = itemsHave;
                }

                ItemsAdd = resDisplay.filter(itemRes => itemRes.target === -1 && itemRes.displayRef === (this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName))
                // ItemsAdd.sort(function(a, b){
                //     return b.id - a.id;
                // });
            }

            var isnew = 0;
            if (!itemMap[item.refName]) {

                itemMap[item.refName] = [];
                items = {};
                refName = '';
                subItems = [];
                isnew = 1;

                let itemInputt = {
                    itemName: 'Thêm ' + item.refName, itemId: item.id,
                    refName: item.refName, subCat: item.code, displayComment: '',
                    upload: 0, fieldSetting: item.fieldSetting, kpi1: 0,
                    kpi2: 0, kpi3: 0, kpi7: 0, kpi4: 0, kpi5: 1
                }

                AppNameBuild === nokiaApp && itemMap[item.refName].push(itemInputt)

                if (ItemsAdd.length > 0) {
                    ItemsAdd.map(itemA => {
                        let itemInput = {
                            itemName: itemA.kpi4Name, refId: itemA.kpi4,
                            refName: '', upload: 0, fieldSetting: item.fieldSetting, kpi1: item.kpi1,
                            kpi2: item.kpi2, kpi3: item.kpi3, kpi7: item.kpi7, kpi4: item.kpi4, kpi5: item.kpi5, itemId: itemA.itemId,
                            rkpi1: itemA.kpi1, rkpi2: itemA.kpi2, rkpi3: itemA.kpi3, rkpi4: itemA.kpi4, rkpi5: itemA.kpi5, rkpi7: itemA.kpi7,
                            kpi1Holder: item.kpi1Holder, kpi2Holder: item.kpi2Holder, target: itemA.target
                        }

                        itemMap[item.refName].push(itemInput);
                    })
                }
            }

            let itemInput = {
                itemName: item.itemName, itemId: item.id,
                refName: item.refName, subCat: item.code, displayComment: '',
                upload: 0, fieldSetting: item.fieldSetting, kpi1: item.kpi1,
                kpi2: item.kpi2, kpi3: item.kpi3, kpi7: item.kpi7, kpi4: item.kpi4,
                kpi1Holder: item.kpi1Holder, kpi2Holder: item.kpi2Holder
            }

            if (ItemRes.length > 0) {
                itemInput.quanity = ItemRes[0].quanity;
                itemInput.rkpi1 = ItemRes[0].kpi1;
                itemInput.rkpi2 = ItemRes[0].kpi2;
                itemInput.rkpi3 = ItemRes[0].kpi3;
                itemInput.rkpi4 = ItemRes[0].kpi4;
                itemInput.rkpi4Name = ItemRes[0].kpi4Name;
                itemInput.rkpi7 = ItemRes[0].kpi7;
                itemInput.displayComment = ItemRes[0].displayComment;
                itemInput.upload = ItemRes[0].upload

                if (ItemRes[0].upload == 1) {
                    this.setState({
                        Status: 1,
                        isHavePack: ItemRes[0].havePack === 'YES' ? true : false,
                        noteCommon: ItemRes[0].comment
                    });
                }
            }

            itemMap[item.refName].push(itemInput);
            items = itemMap[item.refName];
            refName = item.refName;

            if (isnew == 1) {
                refName != '' && MapArr.push({ title: { name: refName }, data: items })
            }
        })

        return MapArr;
    }
    async componentDidMount() {
        // alertPrint(this.props.route.params.DisplayItem.fieldSetting)
        await this.setState({ questionShop: this.props.route.params.DisplayItem.fieldSetting })
        await this.loadGroup()
        await this.refreshData();
    }

    uploadAction = async () => {
        let resPho = true
        this.state.lstRequestPhotos.map(async itemMast => {
            const lstitemPhoto = await getPhotosReport(this.props.route.params.workinfo.reportId, this.props.route.params.DisplayItem.id + '_' + itemMast.code, this.state.workinfo.shopId, this.state.workinfo.workDate);

            if (itemMast.numberValue > 0) {
                if (lstitemPhoto.length < itemMast.numberValue) {
                    MessageInfo('Vui lòng chụp đủ số lượng hình cho: ' + itemMast.name + ' (' + itemMast.numberValue + ' tấm )')
                    resPho = false
                }
            }
        })

        let lstItemsProgram = await getItemsProgramDisplay(this.props.route.params.DisplayItem.id, '', '');
        let resDisplay = await getAuditDisplayResult(this.state.workinfo.workId, this.props.route.params.DisplayItem.id);
        let resPhotos = await getPhotosAuditUploaded(this.props.route.params.workinfo.reportId, this.state.workinfo.shopId, this.state.workinfo.workDate, '' + this.props.route.params.DisplayItem.name);
        // if(Array.isArray(resDisplay) && resDisplay.length==0)
        // {
        //     alert('Bạn chưa làm báo cáo.');
        //     return
        // }

        if (this.state.questionShop !== '' && this.state.questionShop !== null) {
            if (this.state.isHavePack === null) {
                MessageInfo('Bạn chưa chọn câu trả lời ( ' + this.state.questionShop + ' ?)')
                return
            }
            else {
                if (this.state.isHavePack === false) {
                    if (this.state.noteCommon === '') {
                        MessageInfo('Vui lòng nhập lý do khi bạn chọn cửa hàng không trưng bày theo gói.')
                        return
                    }
                    else {
                        if (this.state.noteCommon.length < 10) {
                            MessageInfo('Vui lòng nhập lý do nhiều hơn 10 ký tự.')
                            return
                        }

                    }
                }
            }
        }


        // if(lstItemsProgram.length !== resDisplay.length)
        // {
        //     alert('Vui lòng làm hết báo cáo.');
        //     return 
        // }

        if (resPho === true) {
            Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => this.UploadData(resDisplay, resPhotos));
        }

    }
    UploadData = async (resDisplay, resPhotos) => {
        let isNetwork = await checkNetwork();

        if (!isNetwork) {
            alert("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        this.setShowProgress(true);

        let access_token = await Token();
        try {
            let items = [];
            resDisplay.forEach((item, index) => {
                let dataItem = {
                    "displayId": item.displayId,
                    "itemId": item.target === -1 ? index : item.itemId,
                    "quanity": item.quanity,
                    "displayRef": item.displayRef,
                    "displayComment": JSON.stringify({ kpi1: item.kpi1, kpi2: item.kpi2, kpi3: item.kpi3, kpi4: item.kpi4, kpi7: item.kpi7 }),
                    "addId": item.kpi4
                }
                items.push(dataItem);
            });

            let itemsPhoto = [];
            resPhotos.forEach(photoInfo => {
                let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
                // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
                let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
                let dataItem = {
                    "shopId": photoInfo.shopId,
                    "photoName": ImgName,
                    "latitude": photoInfo.latitude,
                    "longitude": photoInfo.longitude,
                    "accuracy": 8,
                    "reportId": photoInfo.reportId,
                    "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    "photoType": '' + photoInfo.photoType,
                    "photoDate": photoInfo.photoDate,
                    "photoPath": pathPhoto
                }
                itemsPhoto.push(dataItem);
            });

            let UploadJson = {
                DisplayId: this.props.route.params.DisplayItem.id,
                ShopId: this.state.workinfo.shopId, WorkDate: Moment(new Date).format('YYYY-MM-DD'),
                Details: JSON.stringify(items),
                Photos: JSON.stringify(itemsPhoto),
                DisplayResult: this.state.questionShop === '1' ? (this.state.isHavePack === true ? 'YES' : 'NO') : 'YES',
                Comment: this.state.noteCommon
            }

            await fetch(URL_UPLOAD_AUDIT_DISPLAY, {
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token,
                },
                body: JSON.stringify(UploadJson)
            })
                .then(response => {
                    return response.json();
                })
                .then(async responseJson => {
                    // alertPrint(responseJson)
                    if (responseJson.status == 200) {
                        this.setShowProgress(false);
                        updateHavePack(this.state.workinfo, this.props.route.params.DisplayItem.id, this.state.isHavePack === true ? 'YES' : 'NO', this.state.noteCommon)
                        let isUpdate = updateAuditDisplayResult(this.state.workinfo, this.props.route.params.DisplayItem.id);

                        this.setShowProgressPhoto(true);
                        var count = 0;
                        this.setState({ togPhoto: lstPhotos.length })
                        this.RunUploading()
                        resPhotos.length > 0 && uploadAllDataPhoto(resPhotos, () => {
                            count += 1;
                            this.setState({ countPhoto: count })
                        }, () => { });

                        this.refreshData();
                    }
                    else {
                        alert(responseJson.messeger);
                        return false;
                    }
                })
                .catch(error => {
                    return false;
                });
        }
        catch (error) {
            //console.log(error);
        }
    }
    refreshData = () => {
        if (this.state.lstGroup.length > 0) {
            if (this.state.groupName !== 'PHOTOS') {
                this.loadDataShow('', this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName);
            }
        }
    }
    async loadGroup() {
        let total = await getGroupAudit(this.props.route.params.DisplayItem.id);

        let MapArr = [];
        let itemMap = {};
        total.map((item, i) => {
            if (!itemMap[item.refName]) {
                itemMap[item.refName] = [];
                MapArr.push(item.refName)
            }
        })

        let lstPhoto = await getRequestPhotos(this.props.route.params.DisplayItem.id)
        // alertPrint(lstPhoto)
        if (lstPhoto !== undefined) {
            this.setState({ lstRequestPhotos: lstPhoto })
            lstPhoto.length > 0 && MapArr.push('PHOTOS')
        }

        this.setState({ lstGroup: MapArr })
    }
    loadDataShow = async (search, refName) => {
        let lstItemsProgram = await getItemsAuditDisplayMitsu(this.props.route.params.DisplayItem.id, search, refName);
        // alertPrint(lstItemsProgram)
        let resDisplay = await getAuditDisplayResult(this.state.workinfo.workId, this.props.route.params.DisplayItem.id);
        // alertPrint(resDisplay)
        this.setState({ lstShow: [] });
        await this.setState({
            lstShow: this.DisplayItemMap(lstItemsProgram, resDisplay),
        });
    }
    RunUploading() {
        let progress = this.state.countPhoto;
        this.setState({ progress });
        setTimeout(() => {
            this.setState({ indeterminate: false });
            var mytime = setInterval(() => {
                progress += this.state.countPhoto / this.state.togPhoto;
                if (progress > 1) {
                    progress = 1;
                    this.setShowProgressPhoto(false)
                    clearInterval(mytime);
                }
                this.setState({ progress });
            }, 500);
        }, 1500);
    }
    updateSearch = (search) => {
        this.setState({ search: search });
        this.loadDataShow(search, this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName);
    };
    getMasterPhoto = async () => {
        let lstPhoto = await getRequestPhotos(this.props.route.params.DisplayItem.id)
        if (lstPhoto !== undefined) {
            this.setState({ lstRequestPhotos: lstPhoto })
        }
    }
    chooseHaveDisplayPack = async (check) => {
        await this.setState({ isHavePack: check, noteCommon: '' })

        this.getMasterPhoto()
    }
    updateNoteCommon = async (text) => {
        let itemUpdate = {
            workId: this.props.route.params.workinfo.workId,
            displayComment: text
        }

        this.setState({ noteCommon: text })
        // updateNoteStock(itemUpdate)

        // this.getMasterPhoto()
    }
    RenderTabItem = () => {
        return (
            this.state.lstGroup.map(item => {
                return (
                    <Tabs.Tab key={item} label={item} name={item} >
                        <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            <Text tabLabel={item}></Text>
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }
    renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
        return <TouchableHighlight
            key={`${name}_${page}`}
            onPress={() => onPressHandler(page)}
            onLayout={onLayoutHandler}
            style={{ flex: 1, width: 100, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: isTabActive ? 'lightgray' : 'white' }}
            underlayColor="#aaaaaa"
        >
            <Text style={{ color: isTabActive ? 'red' : 'black', borderWidth: 1, borderColor: 'transparent', borderBottomColor: isTabActive ? 'red' : 'transparent' }}>{name}</Text>
            {/* <Text style={styles.line}></Text> */}
        </TouchableHighlight>;
    }
    changeTabAction = async (value) => {
        if (this.state.lstShow.length > 0) {
            await this.setState({ groupName: this.state.lstGroup[value.i], isPhotoView: false })
            if (this.state.lstGroup[value.i] !== 'PHOTOS') {
                this.loadDataShow('', this.state.lstGroup[value.i])
            }
            else {
                await this.setState({ isPhotoView: true })
            }
        }
    }
    render() {

        const lstShowAll = this.state.lstShow;
        return (
            <ImageBackground style={{ height: '100%', width: '100%' }}>
                <PageHeader
                    leftclick={() => this.props.navigation.goBack()}
                    Title={this.props.route.params.DisplayItem.name}
                    righticon='cloud-upload-alt'
                    rightclick={() => this.uploadAction()}
                />
                {
                    (this.state.questionShop !== '' && this.state.questionShop !== null) &&
                    <View style={{
                        ...styles.viewEnter, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, marginRight: 10, marginBottom: 5,
                        marginTop: 5
                    }}>
                        <Text lineBreakMode='middle' numberOfLines={2} style={{ ...styles.labelSellout, width: '65%' }} >{this.state.questionShop}</Text>
                        <TouchableOpacity style={{ alignItems: 'center', padding: 2 }} onPress={() => this.chooseHaveDisplayPack(true)} disabled={this.state.Status === 0 ? false : true}>
                            <RadioButton selected={this.state.isHavePack === true ? true : false} />
                            <Text style={{ marginTop: 8, paddingLeft: 1 }}>Có</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', padding: 2 }} onPress={() => this.chooseHaveDisplayPack(false)} disabled={this.state.Status === 0 ? false : true}>
                            <RadioButton selected={this.state.isHavePack === false ? true : false} />
                            <Text style={{ marginTop: 8, paddingLeft: 1 }}>Không</Text>
                        </TouchableOpacity>
                    </View>
                }
                {
                    (this.state.questionShop !== '' && this.state.questionShop !== null && this.state.isHavePack === false) &&
                    <TextInput
                        onChangeText={(text) => this.updateNoteCommon(text)}
                        defaultValue={this.state.noteCommon}
                        numberOfLines={3} multiline={true}
                        placeholder='Nhập ghi chú ở đây'
                        style={{
                            backgroundColor: 'white',
                            borderWidth: 1, height: 70, borderRadius: 5,
                            justifyContent: 'flex-start', borderColor: 'lightgray',
                            fontSize: 15, marginRight: 10, marginLeft: 10
                        }}
                    ></TextInput>
                }
                {
                    <View>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, alignItems: 'center', paddingTop: 2, paddingBottom: 2 }}>
                            <TextInput
                                keyboardType={'default'}
                                backgroundColor={'white'}
                                onChangeText={this.updateSearch}
                                defaultValue={this.state.search}
                                style={{ fontSize: 15, color: 'black', minHeight: 37, textAlign: 'center', borderWidth: 0.6, borderColor: 'gray', width: '99%' }}
                                placeholder={'Nhập tìm kiếm ở đây.'}
                            />
                        </View>

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
                                    tabStyle={{ minWidth: minWidthTab(this.state.lstGroup), height: 36 }}
                                />
                            )}>
                            {this.RenderTabItem()}
                        </Tabs.Container>
                        {/* <ScrollableTabView
                            tabBarUnderlineStyle={{ backgroundColor: 'transparent' }}
                            style={{ marginTop: 10, height: '100%' }}
                            initialPage={0}
                            renderTabBar={() => <ScrollableTabBar renderTab={this.renderTab} tabStyle={{ height: 38 }} style={{ height: 38, backgroundColor: 'white' }} />}
                            onChangeTab={this.changeTabAction}
                        >
                            {
                                this.RenderTabItem()
                            }
                        </ScrollableTabView> */}

                        {this.state.isPhotoView === false && <AuditItemsContent ProductItems={this.state.lstShow} workinfo={this.state.workinfo} DisplayItem={this.state.DisplayItem} loadData={this.refreshData} Status={this.state.Status} RefName={this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName} />}
                        {this.state.isPhotoView === true && <PhotoCustom Photos={this.state.lstRequestPhotos} Workinfo={this.state.workinfo} DisplayId={this.state.DisplayItem.id} Props={this.props} ReportId={this.props.route.params.workinfo.reportId} Status={this.state.Status}></PhotoCustom>}
                    </View>
                }

                {
                    this.state.showProgress === true && <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }}><Progress.Circle thickness={1} size={65} indeterminate={true} /><Text style={{ color: '#007AFF' }}>Đang upload báo cáo...</Text></View>
                }
                {
                    this.state.showProgressPhoto === true && <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }}><Progress.Circle showsText={true} progress={this.state.progress} thickness={1} size={65} /><Text style={{ color: '#007AFF' }}>Đang upload hình...</Text></View>
                }
            </ImageBackground>
        )
    }
}