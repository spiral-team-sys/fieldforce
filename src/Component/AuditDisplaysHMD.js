import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableHighlight, TouchableOpacity, TextInput, ImageBackground, FlatList, StyleSheet } from "react-native";
import PageHeader from '../Content/PageHeader';
import { insertDisplayResult, getItemsAuditDisplay, getGroupAudit, getAuditDisplayResult, getAuditDisplayYESResult, updateHavePack, updateNoteCommon, getPhotosAuditUploaded, getPhotosReport, getPhotosAuditPackBy, existAddAuDisRes, existNoChangeItem, existAuditResItem, deleteAuditDisplayResult, deleteNoChangeRes, checkResAuditDisplay, checkItemsAuditDisplay, deletePhotosAuditUploaded } from '../Controller/WorkController'
import { updateAuditDisplayResult } from '../Controller/WorkController'
import * as Progress from 'react-native-progress';
import { checkNetwork, alertToast, minWidthTab, deviceWidth } from "../Core/Utility";
import { Message, MessageInfo } from '../Core/Helper';
import { AppNameBuild, nokiaApp, URL_UPLOAD_AUDIT_DISPLAY } from '../Core/URLs';
import { Token } from '../Core/Helper';
import Moment from 'moment';
import { RadioButton } from '../Core/RadioButton';
// import ScrollableTabView, { ScrollableTabBar } from "react-native-scrollable-tab-view"
import AuditItemsHMDContent from '../Content/AuditItemsHMDContent';
import { PhotoCustomHMD } from '../Component/HMD/PhotoCustomHMD';
import { getRequestPhotos } from '../Controller/MasterController';
import { UpdateStatusPhotoData, uploadAllDataPhoto } from '../Controller/PhotoController';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { appcolor } from '../Themes/AppColor';

const styles = StyleSheet.create({
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

export default class AuditDisplaysHMD extends Component {

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
            isChangeMonth: null,
            lstGroup: [],
            groupName: '',
            isPhotoView: false,
            lstRequestPhotos: [],
            noteCommon: '',
            questionShop: [],
            HeightHeader: 50
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

        let lstNochange = resDisplay.filter(item => item.displayRef === 'NOCHANGE')
        lstNochange.length > 0 && this.setState({ Status: lstNochange[0].upload === 1 ? 1 : 0 });

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

                if (AppNameBuild === nokiaApp) {
                    itemMap[item.refName].push(itemInputt)
                }

                if (ItemsAdd.length > 0) {
                    ItemsAdd.map(itemA => {
                        let itemInput = {
                            itemName: itemA.kpi4Name, refId: itemA.kpi4,
                            refName: item.refName, upload: 0, fieldSetting: item.fieldSetting, kpi1: item.kpi1,
                            kpi2: item.kpi2, kpi3: item.kpi3, kpi7: item.kpi7, kpi4: item.kpi4, kpi5: item.kpi5, itemId: itemA.itemId,
                            rkpi1: itemA.kpi1, rkpi2: itemA.kpi2, rkpi3: itemA.kpi3, rkpi4: itemA.kpi4, rkpi5: itemA.kpi5, rkpi7: itemA.kpi7,
                            kpi1Holder: item.kpi1Holder, kpi2Holder: item.kpi2Holder, target: itemA.target, displayNameVN: itemA.displayNameVN
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
                kpi1Holder: item.kpi1Holder, kpi2Holder: item.kpi2Holder, displayNameVN: item.displayNameVN
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

                this.setState({ noteCommon: ItemRes[0].comment });
                if (ItemRes[0].upload == 1) {
                    let arrResult = ItemRes[0].havePack.split(',');
                    this.setState({
                        Status: 1,
                        isHavePack: arrResult[0] === 'YES' ? true : false,
                        isChangeMonth: arrResult[1] === 'YES' ? true : false
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

        await this.setState({ workinfo: this.props.route.params.workinfo })
        try {
            let questionLst = JSON.parse(this.props.route.params.DisplayItem.fieldSetting)
            let addAnswer = questionLst.map(itemq => itemq.question !== '' ? { ...itemq, answer: null } : itemq)
            questionLst.length > 0 && await this.setState({ questionShop: addAnswer })

            await this.setState({ isHavePack: null, noteCommon: '', HeightHeader: questionLst.length * 80 })
        } catch (error) {
            alertToast(error)
        }

        await this.loadGroup()
        await this.refreshData();

    }
    uploadAction = async () => {
        if (this.state.Status === 1) {
            MessageInfo('Bạn đã gửi báo cáo.')
            return
        }

        let lstQuestion = this.state.questionShop
        let DisplayItem = this.props.route.params.DisplayItem
        let workinfo = this.state.workinfo
        let itemsPack = await getItemsAuditDisplay(DisplayItem.id, '', '', workinfo.shopId)
        let lstItemsProgram = await checkItemsAuditDisplay(DisplayItem.id, workinfo.workId);
        let lstResItems = await checkResAuditDisplay(DisplayItem.id, workinfo.workId);

        let resDisplayAD = await getAuditDisplayResult(workinfo.workId, DisplayItem.id);
        let resPhotos = await getPhotosAuditUploaded(workinfo.reportId, workinfo.shopId, workinfo.workDate, '');

        let errorQuestion = ''

        for (let index = 0; index < lstQuestion.length; index++) {
            const itemQ = lstQuestion[index];
            if (itemQ.answer === null) {
                errorQuestion = 'Bạn chưa chọn câu trả lời cho câu hỏi: \n' + itemQ.name
                break
            }
        }

        if (errorQuestion !== '') {
            MessageInfo(errorQuestion);
            return;
        }


        if (this.state.isChangeMonth === true) {

            if (resDisplayAD.length === 0) {
                MessageInfo('Bạn chưa làm báo cáo')
                return
            }

            if (lstItemsProgram !== undefined) {
                if (lstItemsProgram.length > 0) {
                    MessageInfo(
                        lstItemsProgram[0].refName + ': Bạn chưa làm xong cho item: \n' + lstItemsProgram[0].itemName
                        + (lstItemsProgram[0].refName === 'PRODUCT' ? "\n( Nếu chọn 'Có' bạn phải nhập IMEI.)" :
                            "\n( Nếu chọn 'Có' bạn phải nhập số lượng, số lượng > 0 )")
                        // + (lstItemsProgram[0].refName === 'PRODUCT' ? "\n( Nếu chọn 'Có' bạn phải nhập IMEI, IMEI phải nhập đủ " + lstItemsProgram[0].kpi3 + ' số )' :
                        //     "\n( Nếu chọn 'Có' bạn phải nhập số lượng, số lượng > 0 )")
                    )
                    return
                }
            }

            if (lstResItems !== undefined) {
                if (lstResItems.length > 0) {
                    let strErr = ''
                    if (lstResItems[0].displayRef === 'PRODUCT') {
                        // strErr = "\n( Bạn phải nhập IMEI, IMEI phải nhập đủ " + 15 + ' số )'
                        strErr = "\n( Bạn phải nhập IMEI )"
                    }
                    else if (lstResItems[0].displayRef === 'POSM') {
                        strErr = "\n( Bạn phải nhập số lượng, số lượng > 0 )"
                    }
                    else if (lstResItems[0].displayRef === 'ISSUE') {
                        strErr = "\n( Vui lòng nhập vấn đề. )"
                    }

                    MessageInfo(lstResItems[0].displayRef + ': Bạn chưa làm xong cho item: \n' + lstResItems[0].kpi4Name + strErr)
                    return
                }
            }

            if (resDisplayAD.length > 0) {

                let itemHa = resDisplayAD.filter(item => item.kpi3 === 1 && item.kpi2 !== undefined && item.displayRef === 'PRODUCT')
                if (itemHa.length > 0) {
                    let item = itemHa[0]
                    if (item.kpi2.toString().length < 5) {
                        MessageInfo(item.displayRef + ': Bạn chưa làm xong cho item: \n' + item.kpi4Name + "\n( Bạn phải nhập IMEI")
                        // MessageInfo(item.displayRef + ': Bạn chưa làm xong cho item: \n' + item.kpi4Name + "\n( Bạn phải nhập IMEI, IMEI phải nhập đủ " + 15 + ' số )')
                        return
                    }
                }
            }

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

            if (lstQuestion.length > 0) {
                let errorStr = ''

                for (let index = 0; index < lstQuestion.length; index++) {
                    const itemQ = lstQuestion[index];


                    if (itemQ.answer === null) {
                        errorStr = 'Bạn chưa chọn câu trả lời cho câu hỏi: ' + itemQ.name
                        break
                    }

                    if (itemQ.id === 1) {
                        let resDisplay = await existAddAuDisRes(workinfo.workId, DisplayItem.id);

                        if (itemQ.answer === false) {
                            if (resDisplay.length === 0) {
                                errorStr = 'Bạn chưa thêm PRODUCT(POSM) thay thế. Vui lòng tick chọn có cho câu hỏi: \n' + itemQ.name
                                break
                            }

                            if (this.state.noteCommon === '' || this.state.noteCommon === null) {
                                errorStr = 'Vui lòng nhập lý do khi cửa hàng không trưng bày theo gói.'
                                break
                            }
                            else {
                                if (this.state.noteCommon.length < 10) {
                                    errorStr = 'Vui lòng nhập lý do nhiều hơn 10 ký tự.'
                                    break
                                }
                            }
                        }
                        else {
                            if (resDisplay.length > 0) {
                                errorStr = 'Bạn đã thêm PRODUCT(POSM) thay thế, vui lòng tick chọn không cho câu hỏi: ' + itemQ.name + ' (Hoặc bạn xoá các mục đã thêm)'
                            }
                        }

                    }
                    else if (itemQ.id === 2 && AppNameBuild === nokiaApp) {
                        let resItemRes = await getAuditDisplayYESResult(workinfo.workId, DisplayItem.id)
                        if (itemQ.answer === true) {
                            for (let index = 0; index < resItemRes.length; index++) {
                                const itemRS = resItemRes[index];

                                let photoType = 'Audit_' + DisplayItem.id + '_' + itemRS.displayRef + '_' + itemRS.itemId;

                                let lstPhoto = await getPhotosAuditPackBy(workinfo.reportId, workinfo.shopId, workinfo.workDate, photoType)
                                if (lstPhoto.length === 0) {
                                    let itemHave = itemsPack.filter(item => item.id === itemRS.itemId)

                                    if (itemRS.kpi4Name !== null) {
                                        errorStr = itemRS.displayRef + ": Vui lòng chụp hình cho (" + itemRS.kpi4Name + ")" //itemHave[0].itemName
                                        break;
                                    }
                                    else {
                                        if (itemHave.length > 0) {
                                            errorStr = itemRS.displayRef + ": Vui lòng chụp hình cho (" + itemHave[0].itemName + ")"
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                    }
                }

                if (errorStr !== '') {
                    MessageInfo(errorStr);
                    return
                }
            }

            if (resPho === true) {
                Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => this.UploadData(resDisplayAD, resPhotos));
            }
        }
        else {
            if (DisplayItem.visit === 0) {
                MessageInfo('Tháng này bạn chưa gửi báo cáo cho gói trưng bày này, vui lòng tích chọn CÓ (Có thay đổi gì so với lần trước không?), sau đó làm báo cáo và chụp hình đầy đủ.')
                return
            }

            Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => this.UploadData(resDisplayAD, resPhotos));
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
            let itemsPhoto = [];

            if (resDisplay.length > 0) {
                resDisplay.forEach((item, index) => {
                    let dataItem = {
                        "displayId": item.displayId,
                        "itemId": item.target === -1 ? item.kpi4 : item.itemId,
                        "quanity": item.quanity,
                        "displayRef": item.target === -1 ? item.displayRef : 'AuditDisplayItem',
                        "displayComment": JSON.stringify({ kpi1: item.kpi1, kpi2: item.kpi2 === 'null' || item.kpi2 === '' ? null : item.kpi2, kpi3: item.kpi3, kpi4: item.kpi4, kpi7: item.kpi7 }),
                        "addId": index
                    }
                    items.push(dataItem);
                });

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
                        "photoPath": pathPhoto,
                        "photoDesc": photoInfo.photoDesc
                    }
                    itemsPhoto.push(dataItem);
                });
            }

            let resAnswer = ''
            let isChange = false
            this.state.questionShop.map((itemA, index) => {
                let strQ = itemA.answer === true ? 'YES' : 'NO'
                if (index === 0) {
                    resAnswer = strQ
                }
                else if (index === 1) {
                    isChange = strQ
                    resAnswer += ',' + strQ
                }
                else {
                    resAnswer += ',' + strQ
                }
            })

            let UploadJson = {
                DisplayId: this.props.route.params.DisplayItem.id,
                ShopId: this.state.workinfo.shopId,
                WorkDate: Moment(new Date).format('YYYY-MM-DD'),
                Details: JSON.stringify(items),
                Photos: JSON.stringify(itemsPhoto),
                DisplayResult: isChange === 'NO' ? 'NOCHANGE' : resAnswer,
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
                .then(responseJson => {

                    if (responseJson.status == 200) {
                        this.setShowProgress(false);
                        updateHavePack(this.state.workinfo, this.props.route.params.DisplayItem.id, resAnswer, this.state.noteCommon)
                        let isUpdate = updateAuditDisplayResult(this.state.workinfo, this.props.route.params.DisplayItem.id);
                        resPhotos.length > 0 && uploadAllDataPhoto(resPhotos);
                        this.loadDataShow('', this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName);
                        this.refreshData();

                        resPhotos.map(async itemR => {
                            await UpdateStatusPhotoData(itemR.id)
                        })

                        alert(responseJson.messeger);
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
    refreshData = async () => {

        if (this.state.lstGroup.length > 0) {
            if (this.state.groupName !== 'PHOTOS') {
                let workinfo = this.state.workinfo;
                let DisplayItem = this.state.DisplayItem;
                let resAddDisplay = await existAddAuDisRes(workinfo.workId, DisplayItem.id);
                // let lstPhoto = await getPhotosAuditPack(workinfo.reportId,workinfo.shopId,this.state.workinfo.workDate,DisplayItem.id)
                let NoChangeItem = await existNoChangeItem(workinfo.workId, DisplayItem.id);
                let resItem = await existAuditResItem(workinfo.workId, DisplayItem.id);

                if (AppNameBuild === nokiaApp) {

                    if (resAddDisplay.length > 0) {
                        await this.setState({ questionShop: this.state.questionShop.map(itemq => itemq.id === 1 ? { ...itemq, answer: false } : itemq) })
                        await this.setState({ isHavePack: false, HeightHeader: this.state.questionShop.length * 80 + 70 })//,noteCommon:''
                    }
                    else {
                        await this.setState({ questionShop: this.state.questionShop.map(itemq => itemq.id === 1 ? { ...itemq, answer: true } : itemq) })
                        await this.setState({ isHavePack: true, HeightHeader: this.state.questionShop.length * 80 })//,noteCommon:''
                    }

                    if (NoChangeItem.length > 0) {
                        await this.setState({ questionShop: this.state.questionShop.map(itemq => itemq.id === 2 ? { ...itemq, answer: false } : itemq), isChangeMonth: false })
                    }
                    else {
                        resItem.length > 0 ? await this.setState({ questionShop: this.state.questionShop.map(itemq => itemq.id === 2 ? { ...itemq, answer: true } : itemq), isChangeMonth: true }) :
                            await this.setState({ questionShop: this.state.questionShop.map(itemq => itemq.id === 2 ? { ...itemq, answer: null } : itemq), isChangeMonth: null })
                    }
                }

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
        if (lstPhoto !== undefined) {
            this.setState({ lstRequestPhotos: lstPhoto })
            lstPhoto.length > 0 && MapArr.push('PHOTOS')
        }

        this.setState({ lstGroup: MapArr })
    }
    loadDataShow = async (search, refName) => {
        let lstItemsProgram = await getItemsAuditDisplay(this.props.route.params.DisplayItem.id, search, refName, this.state.workinfo.shopId);
        let resDisplay = await getAuditDisplayResult(this.state.workinfo.workId, this.props.route.params.DisplayItem.id);
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
    InsertNoChange = async () => {
        let workinfo = this.props.route.params.workinfo;
        let DisplayItem = this.props.route.params.DisplayItem;
        let itemInsert = {
            workId: workinfo.workId,
            displayId: DisplayItem.id,
            itemId: -1,
            displayRef: 'NOCHANGE',
            upload: 0
        }

        await insertDisplayResult(itemInsert, 0);
    }
    chooseHaveDisplayPack = async (item, check) => {
        let questionShop = this.state.questionShop;
        let workinfo = this.props.route.params.workinfo;
        let DisplayItem = this.props.route.params.DisplayItem;
        if (item.id === 1) {
            await this.setState({
                isHavePack: check, noteCommon: '',
                HeightHeader: !check ? questionShop.length * 80 + 70 : questionShop.length * 80,
                questionShop: questionShop.map(itemq => itemq.id === item.id ? { ...itemq, answer: check } : itemq)
            })
        }
        else if (item.id === 2) {
            await this.setState({ questionShop: questionShop.map(itemq => itemq.id === item.id ? { ...itemq, answer: check } : itemq), isChangeMonth: check })
            if (check === false) {
                await deleteAuditDisplayResult(workinfo.workId, DisplayItem.id);
                await deletePhotosAuditUploaded(workinfo.reportId, workinfo.shopId, workinfo.workDate, DisplayItem.id);
                await this.InsertNoChange()
                this.refreshData()
            }
            else {
                await deleteNoChangeRes(workinfo.workId, DisplayItem.id);
            }
        }
        else {
            await this.setState({ questionShop: questionShop.map(itemq => itemq.id === item.id ? { ...itemq, answer: check } : itemq) })
        }

        this.getMasterPhoto()
    }
    updateNoteCommon = async (text) => {
        this.setState({ noteCommon: text })
        updateNoteCommon(this.state.workinfo, this.props.route.params.DisplayItem.id, text)
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
    renderItem = ({ item }) => (
        <View style={{ ...styles.viewEnter, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, marginRight: 10, marginBottom: 2, marginTop: 2 }}>
            <Text lineBreakMode='middle' numberOfLines={2} style={{ ...styles.labelSellout, width: '65%' }} >{item.name}</Text>
            <TouchableOpacity style={{ alignItems: 'center', padding: 2 }} onPress={() => this.chooseHaveDisplayPack(item, true)} disabled={this.state.Status === 0 ? false : true}>
                <RadioButton selected={item.answer === null ? null : item.answer === true ? true : false} />
                <Text style={{ marginTop: 8, paddingLeft: 1 }}>Có</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', padding: 2 }} onPress={() => this.chooseHaveDisplayPack(item, false)} disabled={this.state.Status === 0 ? false : true}>
                <RadioButton selected={item.answer === null ? null : item.answer === false ? true : false} />
                <Text style={{ marginTop: 8, paddingLeft: 1 }}>Không</Text>
            </TouchableOpacity>
        </View>
    )
    render() {
        const lstShowAll = this.state.lstShow;
        let lstQuestion = this.state.questionShop;
        return (
            <ImageBackground style={{ height: '100%', width: '100%' }}>
                <PageHeader
                    leftclick={() => {
                        this.props.route.params.callBackDisPlay()
                        this.props.navigation.goBack()
                    }}
                    Title={this.props.route.params.DisplayItem.name}
                    righticon='cloud-upload-alt'
                    rightclick={() => this.uploadAction()}
                />
                {
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={lstQuestion}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ height: lstQuestion.length * 70 }}
                        numColumns={1} />
                }
                {
                    (this.state.questionShop.length > 0 && this.state.isHavePack === false) &&
                    <TextInput
                        editable={(this.state.Status === 0) ? true : false}
                        returnKeyLabel={(Platform.OS === 'ios') ? 'tiếp' : 'tiếp'}
                        returnKeyType={(Platform.OS === 'ios') ? 'done' : 'next'}
                        onChangeText={(text) => this.updateNoteCommon(text)}
                        defaultValue={this.state.noteCommon}
                        numberOfLines={3} multiline={true}
                        placeholder=' Nhập ghi chú ở đây'
                        style={{
                            backgroundColor: 'white',
                            borderWidth: 1, height: 60, borderRadius: 5,
                            justifyContent: 'flex-start', borderColor: 'lightgray',
                            fontSize: 15, marginRight: 10, marginLeft: 10
                        }}
                    ></TextInput>
                }
                {
                    // this.state.isHavePack &&
                    <View>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, alignItems: 'center', paddingTop: 2, paddingBottom: 2 }}>
                            <TextInput
                                keyboardType={'default'}
                                backgroundColor={'white'}
                                onChangeText={this.updateSearch}
                                defaultValue={this.state.search}
                                style={{ fontSize: 15, color: 'black', minHeight: 35, textAlign: 'center', borderWidth: 0.6, borderColor: 'gray', width: '99%' }}
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

                        {
                            this.state.isPhotoView === false &&
                            <AuditItemsHMDContent ProductItems={this.state.lstShow}
                                workinfo={this.state.workinfo} DisplayItem={this.state.DisplayItem} loadData={this.refreshData} Status={this.state.Status} NoChange={this.state.isChangeMonth === false ? 1 : 0}
                                RefName={this.state.groupName === '' ? this.state.lstGroup[0] : this.state.groupName}
                                PropsParent={this.props} HeightHeader={this.state.HeightHeader} ChangeInMonth={this.state.isChangeMonth}
                            />
                        }
                        {this.state.isPhotoView === true && <PhotoCustomHMD Photos={this.state.lstRequestPhotos} Workinfo={this.state.workinfo} DisplayId={this.state.DisplayItem.id} Props={this.props} ReportId={this.props.route.params.workinfo.reportId} Status={this.state.Status} NoChange={this.state.isChangeMonth === false ? 1 : 0} HeightHeader={this.state.HeightHeader} DisplayItem={this.state.DisplayItem} />}
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