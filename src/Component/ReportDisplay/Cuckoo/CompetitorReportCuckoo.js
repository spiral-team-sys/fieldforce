import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, Keyboard, View } from "react-native";
import { SceneMap } from "react-native-tab-view";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { TabForm } from "../../../Control/TabForm";
import { getCompetitorReportResult, getCompetitorResult, getListCompetitorProduct, uploadDataCompetitorReport } from "../../../Controller/DisplayController";
import { PhotoItems } from "../../EPSON/PhotoItems";
import { InputCompetitorReport } from "./InputCompetitorReport";
import RNFS from 'react-native-fs'
import { Message, ToastError } from "../../../Core/Helper";
import { getAllPhotosUpload, getPhotosReport } from "../../../Controller/WorkController";
import { checkNetwork } from "../../../Core/Utility";
import moment from "moment";


export const CompetitorReportCuckoo = ({ navigation, route }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const [Status, setStatus] = useState(0)
    const [reload, setReload] = useState(false)
    const [routes, setRoutes] = useState([
        { key: "first", title: "Nhập Liệu" },
        { key: "second", title: "Hình Ảnh" },
    ]);
    const [isLoading, setLoading] = useState(true)

    const loadData = async () => {
        !isLoading && await setLoading(true)
        let lstRes = await getCompetitorReportResult(workinfo);
        let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setStatus(isUpload)
        } else {
            await setStatus(1)
        }
        await setLoading(false)
    }
    useEffect(() => {
        const _load = loadData()
        return () => _load
    }, [])

    const uploadAction = async () => {
        await Keyboard.dismiss()
        const listProduct = await getListCompetitorProduct(workinfo)
        let resDisplay = await getCompetitorResult(workinfo);
        let resPhotos = await getAllPhotosUpload(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        let noteStr = '';

        //check limit photo
        let isConstraint
        let numLimitPhoto
        if (lstReport) {
            try {
                if (lstReport?.isConstraint !== undefined) {
                    isConstraint = lstReport?.isConstraint;
                }
                if (lstReport?.image !== undefined) {
                    numLimitPhoto = lstReport?.image
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (isConstraint !== undefined && isConstraint === 1) {
            if (numLimitPhoto !== undefined && numLimitPhoto === 0) {
                const LstMenuPhotos = lstReport?.ImageByList || []
                for (let index = 0; index < LstMenuPhotos.length; index++) {
                    const it = LstMenuPhotos[index];
                    let lstPhoto = await getPhotosReport(kpiinfo.kpiId, it.code, workinfo.shopId, workinfo.workDate);
                    if (lstPhoto.length < it.numberIMG) {
                        noteStr += 'Vui lòng chụp ' + it.numberIMG + ' tấm hình cho ' + it.nameVN + '.\n';
                    }
                }
            }
            if (numLimitPhoto !== undefined && numLimitPhoto > 0 && resPhotos.length < numLimitPhoto) {
                noteStr += 'Vui lòng chụp ' + numLimitPhoto + ' tấm hình cho báo cáo.';
            }
        }

        if (Status === 1) {
            ToastError("Báo cáo đã khóa");
            return;
        }

        if (resDisplay.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        let checkPrice = resDisplay.filter(it => (it.quantity !== 'null' && it.quantity !== null) &&
            (it.priceValue !== null && it.priceValue !== 'null' && (it.priceValue < 10000 || it.priceValue % 1000 > 0) ||
                it.fsmValue !== null && it.fsmValue !== 'null' && (it.fsmValue < 1000 || it.fsmValue % 1000 > 0) ||
                it.netValue !== null && it.netValue !== 'null' && (it.netValue < 10000 || it.netValue % 1000 > 0)));
        // console.log(checkPrice, 'check price');
        if (checkPrice.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === checkPrice[0].displayCompetitorId)
            ToastError('Vui lòng nhập giá đúng định dạng. Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, "Thông báo", "top");
            return;
        }

        let checkFsmValue = resDisplay.filter(it => (it.netValue === 'null' || it.netValue === null) &&
            (it.fsmValue !== 'null' && it.fsmValue !== null && it.fsmValue > 0));
        if (checkFsmValue.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === checkFsmValue[0].displayCompetitorId)
            ToastError('Bạn đã nhập Tiền thưởng nhưng chưa nhập Giá . Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
            return;
        }
        let checkPriceValue = resDisplay.filter(it => (it.netValue === 'null' || it.netValue === null) &&
            (it.priceValue !== 'null' && it.priceValue !== null && it.priceValue > 0));
        if (checkPriceValue.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === checkPriceValue[0].displayCompetitorId)
            ToastError('Bạn đã nhập Niêm yết nhưng chưa nhập Giá . Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
            return;
        }

        let items = resDisplay.filter(it => (it.quantity === 'null' || it.quantity === null) &&
            ((it.priceValue !== 'null' && it.price !== null && it.price > 0) ||
                (it.netValue !== 'null' && it.netValue !== null && it.netValue > 0) ||
                (it.fsmValue !== 'null' && it.fsmValue !== null && it.fsmValue > 0)));
        // console.log(items, 'check item');
        if (items.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === items[0].displayCompetitorId)
            ToastError('Bạn đã nhập Giá nhưng chưa nhập số lượng. Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
            return;
        }

        let checkItemAdd = resDisplay.filter(it => (it.quantity === 'null' || it.quantity === null || it.quantity === 0) &&
            (it.isAddProduct === 1));
        if (checkItemAdd.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === checkItemAdd[0].displayCompetitorId)
            ToastError('Số lượng sản đã phẩm thêm phải lớn hơn 0. Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
            return;
        }

        let itemsUpload = resDisplay.filter(it => it.quantity !== 'null' && it.quantity !== null);
        // console.log('up: ', itemsUpload)
        if (itemsUpload.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        if (noteStr !== '') {
            ToastError(noteStr);
            return
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload));
    }
    const UploadData = async (resDisplay) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await uploadDataCompetitorReport(resDisplay, work, async () => {
            await loadData();
        }, async () => {
        })
    }
    const reloadView = async () => {
        await setReload(e => !e)
    }

    const ViewItemInput = () => {
        return !isLoading ?
            <InputCompetitorReport Status={Status} navigation={navigation} reloadView={reloadView} />
            : null
    };
    const ViewItemPhoto = () => {
        return !isLoading ?
            <PhotoItems
                usedHeader={false}
                navigation={navigation}
                route={{
                    params: {
                        Photos: lstReport?.ImageByList || [],
                        Status: Status,
                    },
                }}
            />
            :
            null
    };
    const renderScene = SceneMap({
        first: ViewItemInput,
        second: ViewItemPhoto,
    });

    const goBackForm = () => {
        DeviceEventEmitter.removeAllListeners('JUMP_TOTAB')
        navigation.goBack()
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconRight='cloud-upload-alt'
                rightFunc={Status !== 1 ? () => uploadAction() : null}
                leftFunc={() => goBackForm()}
            />
            <View style={{ flex: 1 }}>
                {routes.length > 0 && (
                    <TabForm
                        renderScene={renderScene}
                        initialPage={0}
                        routes={routes}
                        positionTabBar={"bottom"}
                        swipeEnabled={false}
                    />
                )}
            </View>
        </View>
    )
}