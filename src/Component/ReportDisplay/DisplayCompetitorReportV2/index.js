
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { checkLockReport } from "../../../Controller/ShopController";
import { getAllPhotosUpload, getDisplayResult, getPhotosReport } from "../../../Controller/WorkController";
import moment from "moment";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { useSelector } from "react-redux";
import { StyleSheet } from "react-native";
import { getCompetitorReportResult, getCompetitorResult, getListCompetitorProductV2, insertListProduct, uploadDataCompetitorReport } from "../../../Controller/DisplayController";
import { ViewListProduct } from "./Page/ViewListProduct";
import { LoadingView } from "../../../Control/ItemLoading";
import { deviceHeight } from "../../Home";
import { Message, ToastError, ToastSuccess } from "../../../Core/Helper";
import { checkNetwork } from "../../../Core/Utility";
const listInputDefault = [
    { id: 1, name: 'Trưng bày', displayType: 'quantity', placeholder: 'Số lượng', type: 'quantity', min: 0, isZero: 1, isRequired: 1 },
    { id: 2, name: 'thực bán', displayType: 'netValue', placeholder: 'giá', type: 'price', min: 1000, isZero: 1, isRequiredPrice: 1 },
    { id: 3, name: 'Niêm yết', displayType: 'priceValue', placeholder: 'giá', type: 'price', min: 1000, isZero: 1 },
    { id: 4, name: 'FSM Incentive', displayType: 'fsmValue', placeholder: 'Giá', type: 'price', min: 1000 },
]
export const DisplayCompetitorReportV2 = ({ navigation, route }) => {
    const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(state => state.GAppState)
    const [settings, setSettings] = useState({ isLockReport: false, isUploaded: false, isLoading: true })
    const [isLoading, setLoading] = useState(true)
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const listInput = lstReport?.listInput?.length ? lstReport?.listInput : listInputDefault

    const loadData = async () => {
        !isLoading && await setLoading(true)
        const lockReport = await checkLockReport(shopinfo)
        const lstResults = await getCompetitorReportResult(workinfo);
        if (lstResults?.length == 0) {
            await insertListProduct(workinfo)
        }
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            settings.isLockReport = lockReport
            settings.isUploaded = lstResults[0]?.upload == 1 || false
            settings.isLoading = false
        } else {
            settings.isLockReport = lockReport
            settings.isUploaded = true
            settings.isLoading = false
        }

        await setLoading(false)
    }

    useEffect(() => {
        const _load = loadData()
        return () => _load
    }, [])

    const onBack = () => {
        navigation.goBack()
    }

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        contentMain: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        progressStyle: { position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 },
    })

    const onValidated = async (listUpload) => {
        let countHave = 0
        for (let indexC = 0; indexC < listUpload?.length; indexC++) {
            const itemC = listUpload[indexC];

            for (let indexL = 0; indexL < listInput?.length || 0; indexL++) {
                const itemL = listInput[indexL]
                if ((itemC[itemL.displayType] == null || itemC[itemL.displayType] == undefined || (itemC[itemL.displayType] == 0 && itemL.isZero !== 1)) && itemL.isRequired == 1) {
                    ToastError(`Chưa nhập ${itemL.name} sản phẩm ${itemC.modelName} - ${itemC.categoryName} - ${itemC.division}`, 'Thông báo', 'top')
                    return false
                }
                if (itemC[itemL.displayType] !== null && itemC[itemL.displayType] !== undefined && (itemC[itemL.displayType] !== 0 || (itemC[itemL.displayType] == 0 && itemL.isZero !== 1)) &&
                    ((itemC[itemL.displayType] < ((itemL.min && itemL.min !== '') ? itemL.min : 1000) && itemL.min !== 0)
                        || itemC[itemL.displayType] > ((itemL.max && itemL.max !== '') ? itemL.max : 1000000000)
                        || (itemC[itemL.displayType] % ((itemL.min && itemL.min !== '') ? itemL.min : 1000 > 0) && itemL.min !== 0)
                    )
                ) {
                    ToastError(`Sai định dạng ${itemL.name} sản phẩm ${itemC.modelName} - ${itemC.categoryName} - ${itemC.division}`, 'sản phẩm', 'top')
                    return false
                }

                if ((itemC.quantity === 'null' || itemC.quantity === null || itemC.quantity === 0) && itemC.isAddProduct == 1) {
                    ToastError('Số lượng sản đã nhập thêm phải lớn hơn 0. Hãng: ' + itemC.division + '  - Loại : ' + itemC.categoryName + '  - sản phẩm: ' + itemC.modelName, 'Thông báo', 'top');
                    return;
                }
            }
        }

        if (listUpload?.length == countHave) {
            ToastError(`Bạn chưa nhập bất kì dữ liệu nào!`, 'Thông báo', 'top')
            return false
        }
        return true
    }

    const uploadAction = async () => {
        const listProduct = await getListCompetitorProductV2(workinfo)
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

        if (settings.isUploaded === true) {
            ToastError("Báo cáo đã khóa");
            return;
        }

        if (resDisplay.length === 0) {
            ToastError('Vui lòng làm báo cáo');
            return;
        }

        let checkPrice = resDisplay.filter(it => (it.quantity !== 'null' && it.quantity !== null) &&
            (it.priceValue !== null && it.priceValue !== 'null' && (it.priceValue < 1000 || it.priceValue % 1000 > 0) ||
                it.fsmValue !== null && it.fsmValue !== 'null' && (it.fsmValue < 1000 || it.fsmValue % 1000 > 0) ||
                it.netValue !== null && it.netValue !== 'null' && (it.netValue < 1000 || it.netValue % 1000 > 0)));
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
        //console.log(items, 'check item');
        if (items.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === items[0].displayCompetitorId)
            ToastError('Bạn đã nhập Giá nhưng chưa nhập số lượng. Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
            return;
        }

        let checkItemAdd = resDisplay.filter(it => (it.quantity === 'null' || it.quantity === null || it.quantity === 0) &&
            (it.isAddProduct === 1));
        if (checkItemAdd.length > 0) {
            let product = listProduct.filter(it => it.displayCompetitorId === checkItemAdd[0].displayCompetitorId)
            ToastError('Số lượng sản phẩm đã thêm phải lớn hơn 0. Hãng: ' + product[0].division + '  - Loại : ' + product[0].categoryName + '  - sản phẩm: ' + product[0].modelName, 'Thông báo', 'top');
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

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Báo cáo trưng bày'}
                iconRight='cloud-upload-alt'
                leftFunc={onBack}
                // rightFunc={uploadAction}
                rightFunc={!settings.isLockReport ? (!settings.isUploaded ? () => uploadAction() : null) : () => {
                    ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')
                }}
            />
            {/* // Product Field */}
            <View style={styles.contentMain}>
                {
                    isLoading &&
                    // <ActivityIndicator style={styles.loadingView} color={appcolor.primary} />
                    <View style={styles.progressStyle}>
                        <LoadingView title={'Đang tải dữ liệu...'} isLoading={isLoading} styles={{ marginTop: 8 }} />
                    </View>
                }
                {
                    !isLoading &&
                    <ViewListProduct navigation={navigation} Status={settings.isUploaded ? 1 : 0} />
                }
            </View>
        </View>
    )
}



