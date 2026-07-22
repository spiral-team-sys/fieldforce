import React, { PureComponent } from "react";
import { View, ImageBackground, Dimensions, FlatList, Text, StyleSheet } from "react-native";
import { Icon, Button } from '@rneui/themed';
import { Store, InsertItems } from "../../Core/SqliteDbContext";
import { GetEmployeeInfo, ToastError, ToastSuccess, UUIDGenerator } from '../../Core/Helper';
import { getPhotosReportByGuiId, SellOutUpload, uploadSelloutData, uploadSelloutWFH } from "../../Controller/WorkController";
import { AppNameBuild, _competitorId } from '../../Core/URLs';
import { TODAY, checkNetwork } from "../../Core/Utility";
import { Keyboard } from "react-native";

import moment from 'moment'
import { getResSellOut, getResSellOutWFH, SellOutSSUpload } from "../../Controller/SellOutController";
import { getStoreListSO } from "../../Controller/ShopController";
import { SelloutModel } from "../../Content/SelloutModel";
import { SelloutResRow } from "../../Content/SelloutResRow";
import { getRequestSellout, getRequestSelloutSS } from "../../Controller/MasterController";
import { getCategorySO, getSegmentSO, getSubSegmentSO, getProductSO, getNOSELLSO, getCompetitorSO } from "../../Controller/ProductController";
import ToastCustom from "../../Content/ToastCustom";
import { HeaderCustom } from '../../Content/HeaderCustom';
import UploadController from "../../Controller/UploadController";
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from "../../Core/ReduxController";
import { LoadingView } from "../../Control/ItemLoading/index";
import { SellOutInput } from "./SellOutInput";
const styles = StyleSheet.create({
  separator: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9'
  }
});

// import CreateSellOutItem from "./CreateSellOutItem";

class Sellout extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            WFHome: false,
            guiId: '',
            IdNosell: 0,
            isHiddentNosell: false,
            idHaveNosell: false,
            loadHistory: false,
            itemSelected: null,
            showProgress: false,
            display: 'none',
            Products: [],
            Competitors: [],
            Categories: [],
            Sellouts: [],
            Segment: [],
            SubSegment: [],
            workinfo: this.props.route?.params.workinfo,
            shopList: [],
            masterList: [],
            reload: 0,
            isShowAlert: false,
            typeId: null,
            auditDate: moment(new Date()).format('YYYYMMDD'),
            tickInfoSave: false
        }
    }
    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    async selloutLoad() {
        await this.loaddata();
    }
    async getListShop() {
        let shopList = [];
        shopList = await getStoreListSO('', this.state.auditDate)
        if (shopList.length === 0) {
            ToastError('Vui lòng bấm tải dữ liệu cho hôm nay')
            return
        }
        await this.setState({ shopList: shopList })
    }

    async loaddata() {
        this.state.WFHome && await this.getListShop();
        let employInfo = await GetEmployeeInfo()
        let lstMaster = [];
        try {
            let employInfoJson = employInfo
            this.setState({ typeId: employInfoJson.typeId })
            lstMaster = (employInfoJson.typeId !== 170) ? await getRequestSellout() : await getRequestSelloutSS();
        } catch (error) { }
        let lstCompetitor = await getCompetitorSO();
        let products = await getProductSO();
        // await console.log(products,"e");
        let category = await getCategorySO();
        let segment = await getSegmentSO();
        let subsegment = await getSubSegmentSO();
        let nosellProduct = await getNOSELLSO();
        this.setState({
            Products: products,
            Categories: category,
            Segment: segment,
            SubSegment: subsegment,
            masterList: lstMaster,
            Competitors: lstCompetitor
        });
        let sellout = []
        if (this.state.WFHome !== true) {
            const workinfo = this.state.workinfo;
            let sellout = await getResSellOut(workinfo);

            if (nosellProduct.length != 0) {
                this.setState({ IdNosell: nosellProduct[0].productId, idHaveNosell: false, isHiddentNosell: false })

                if (sellout.length > 0) {
                    this.setState({ isHiddentNosell: true })
                    let haveNosell = sellout.filter(item => item.productId === nosellProduct[0].productId)
                    if (haveNosell.length > 0) {
                        this.setState({ idHaveNosell: true })
                    }
                }
            }

            sellout.map(itemR => (itemR.guiId !== undefined && itemR.guiId !== null) && this.mapItem(itemR, workinfo))
            this.setState({ Sellouts: sellout });
        }
        else {
            sellout = await getResSellOutWFH(this.state.auditDate);
            this.setState({ Sellouts: sellout });
        }
    }
    mapItem = async (item, workinfo) => {
        let lst = await getPhotosReportByGuiId(0, item.guiId, workinfo.shopId, workinfo.workDate);
        await this.setState({ Sellouts: this.state.Sellouts.map(itemS => (itemS.guiId === item.guiId) ? { ...itemS, numPhoto: lst.length } : itemS) })
    }
    async componentDidMount() {
        this.props.route?.params.wfh !== undefined && await this.setState({ WFHome: this.props.route?.params.wfh })
        await this.setState({ workinfo: this.props.workinfo })
        await this.loaddata();
    }
    async AddSellOut() {
        const workinfo = this.state.workinfo;
        let workDate = this.state.WFHome ? parseInt(this.state.auditDate) : workinfo.workDate

        await this.setState({ display: 'flex', reload: this.state.reload + 1, loadHistory: false });

        this.setState({ guiId: UUIDGenerator() });

    }
    Closed() {
        this.selloutLoad();
        this.setState({ display: 'none', loadHistory: false });
        Keyboard.dismiss();
    }
    async Upload(res) {
        const workinfo = await this.props.workinfo;
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await this.setShowProgress(true);
        let workDate = await this.state.WFHome ? parseInt(this.state.auditDate) : workinfo.workDate


        await this.setShowProgress(true);
        if (AppNameBuild !== 'lg') {
            if (this.state.WFHome) {
                uploadSelloutWFH(res, this.state.auditDate, async () => {
                    this.setShowProgress(false);
                    await this.selloutLoad();
                }, () => {
                    this.setShowProgress(false);
                })
            }
            else {
                uploadSelloutData(res, workinfo, async () => {
                    this.setShowProgress(false);
                    await this.selloutLoad();
                }, () => {
                    this.setShowProgress(false);
                })
            }
        }
        else {
            let workTem = { ...workinfo, reportId: this.props.kpiinfo.id };
            await UploadController.DataSellout(workTem, async () => {
                this.setShowProgress(false);
                await this.selloutLoad();
            }, () => this.setShowProgress(false));
        }

    }
    async uploadSellout() {
        const workinfo = this.state.workinfo;
        await Store().then(async (db) => {

            const { res, err } = this.state.WFHome === false ? await SellOutUpload(db, workinfo) : await SellOutSSUpload(db, this.state.auditDate)

            if (res != null && res.length > 0) {
                ToastError('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => this.Upload(res));
            } else {
                ToastSuccess('Đã gửi hết dữ liệu');
            }
        });
    }
    showDetail = async (itemAccept) => {
        // console.log(itemAccept);
        await this.setState({ display: 'flex', reload: this.state.reload + 1, loadHistory: true, itemSelected: itemAccept });
    }
    nosellAction = async () => {
        if (this.state.IdNosell === 0) {
            ToastError("Chưa có dữ liệu của nosell");
            return
        }
        if (this.state.workinfo.workDate === TODAY) {
            await Store().then(async db => {
                const item = {
                    workId: this.state.workinfo.workId,
                    productId: this.state.IdNosell,
                    serial: '',
                    categoryId: 0,
                    categoryName: '',
                    segmentId: 0,
                    segment: '',
                    quantity: 0,
                    price: 0,
                    sellType: 109,
                    sellComment: '',
                    custName: '',
                    custAddress: '',
                    custPhone: '',
                    upload: 0
                }
                await InsertItems(db, 'sellOut', [item]);
                this.loaddata();
                this.setState({ idHaveNosell: true })
            });
            ToastSuccess('Đã lưu');
        }
    }
    render() {
        const show = this.state.display;
        const showlist = show == 'none' ? 'flex' : 'none';
        const workinfo = this.state.workinfo;
        const appcolor = this.props.appcolor
        return (
            <View style={{ height: '100%', width: '100%', backgroundColor: appcolor.surface }}>
                <View style={{ flex: 1, display: showlist }}>
                    <HeaderCustom
                        leftFunc={() => this.props.navigation.goBack()}
                        title='Báo cáo số bán'
                        iconRight='cloud-upload-alt'
                        rightFunc={() => this.uploadSellout()} />
                    <LoadingView isLoading={this.state.showProgress} styles={{ marginTop: 8 }} />
                    <FlatList
                        keyExtractor={(_, index) => index.toString()}
                        data={this.state.Sellouts}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item, index }) => (
                            <SelloutResRow key={"9992" + index} item={item} index={index} selloutLoad={() => this.selloutLoad()} ShowDetail={this.showDetail} Props={this.props} workinfo={workinfo} appcolor={this.props.appcolor} />
                        )}
                    />
                    <View style={{ width: '100%', height: 100 }}>
                        <Icon
                            iconStyle={{ color: appcolor.primary }}
                            disabled={this.state.idHaveNosell === false ? false : true}
                            onPress={() => this.AddSellOut()}
                            containerStyle={{ position: 'absolute', zIndex: 10, right: 20, bottom: 40, maxHeight: 50 }}
                            size={45}
                            name='add-circle-outline'
                            type='ionicon'
                        />
                        {
                            (this.state.IdNosell !== 0 && this.state.typeId !== 170) &&
                            <Button
                                buttonStyle={{ backgroundColor: appcolor.primary }}
                                disabled={this.state.idHaveNosell === false ? (this.state.isHiddentNosell === false ? false : true) : true}
                                onPress={() => this.nosellAction()}
                                containerStyle={{ width: 100, position: 'absolute', zIndex: 11, bottom: 40, left: 20, maxHeight: 50 }}
                                title='NO SELL'
                            />
                        }
                    </View>
                </View>
                <View style={{ display: show }}>
                    {/* <SellOutInput {...this.props} onDone={() => { this.setState({ display: 'none', }) }} /> */}
                    <SelloutModel />
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        GAppState: state.GAppState,
        appcolor: state.GAppState.appcolor,
        workinfo: state.GAppState.workinfo,
        shopinfo: state.GAppState.shopinfo,
        kpiinfo: state.GAppState.kpiinfo
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch),
    }
}
export default connect(mapStateToProps, mapDispathToProps)(Sellout);