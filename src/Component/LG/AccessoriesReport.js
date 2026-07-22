import React, { useEffect, useState } from "react";
import { FlatList, View, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import UploadController from "../../Controller/UploadController";
import { getListCategoryAccessories, getListItemAccessories, getListTypeAccessories, getLstAccessResult, getLstAccessUpload } from "../../Controller/AccessoriesController";
import { groupDataByKey, Message, ToastError } from "../../Core/Helper";
import { checkNetwork } from "../../Core/Utility";
import AccessoriesModal from "./AccessoriesModal";
import AccessoriesResRow from "./AccessoriesResRow";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { LoadingView } from '../../Control/ItemLoading/index'

const AccessoriesReport = ({ navigation, route }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataCategory: [], dataType: [], dataItemType: [] })
    const [dataShow, setDataShow] = useState()
    const [vendorList, setVendorList] = useState([])
    const [yearList, setYearList] = useState([])
    const lstReport = JSON.parse(kpiinfo?.reportItem);
    const [showModal, setShowModal] = useState('none')
    const [showList, setShowList] = useState('flex')
    const [showProgress, setProgress] = useState(false)

    const loadData = async () => {
        const dataCategory = await getListCategoryAccessories()
        const dataCategoryType = await getListTypeAccessories()
        const dataItemType = await getListItemAccessories()
        await setData({ dataCategory: dataCategory, dataType: dataCategoryType, dataItemType: dataItemType })
        const dataShow = await getLstAccessResult(workinfo.workId);
        const { arr } = await groupDataByKey({
            arr: dataShow,
            key: 'categoryId',
            keyLayer2: 'shopProfileId',
        })
        await setDataShow(arr)
    }
    const getDataSheet = async () => {
        if (vendorList.length === 0) {
            if (lstReport) {
                try {
                    if (lstReport?.dataSheet) {
                        await setVendorList(lstReport?.dataSheet?.vendor);
                        if (lstReport?.dataSheet?.year) {
                            let arrYear = [];
                            var startPoint = 0;
                            var endPoint = 0;
                            let jsonYear = lstReport?.dataSheet?.year
                            jsonYear.map(y => {
                                if (startPoint === 0 && y.id === 1) {
                                    startPoint = parseFloat(y.name)
                                }
                                if (endPoint === 0 && y.id === 2) {
                                    endPoint = parseFloat(y.name)
                                }
                            })
                            if (startPoint !== 0 && endPoint !== 0) {
                                for (let index = startPoint; index < endPoint; index++) {
                                    arrYear.push({ id: index, name: index })
                                }
                                arrYear.reverse();
                                await setYearList(arrYear);
                            }
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
    const closedModal = async () => {
        await setShowModal('none')
        await setShowList('flex')
        await loadData()
        Keyboard.dismiss();
    }
    const addAccessories = async () => {
        await setShowModal('flex')
        await setShowList('none')
    }
    useEffect(() => {
        loadData()
        getDataSheet()
        return () => false;
    }, [])
    const uploadAction = async () => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        let lstAccess = await getLstAccessUpload(workinfo.workId);
        if (lstAccess && lstAccess.length === 0) {
            ToastError('Vui lòng làm báo cáo sau đó thử lại.')
            return
        }

        let itemsUp = [];
        lstAccess.filter(ip => {
            let valRes = null;
            if (ip.dateValue === 1) {
                valRes = ip.dateVal;
            }
            else if (ip.selectValue === 1) {
                valRes = ip.selectVal;
            }
            else if (ip.yearValue === 1) {
                valRes = ip.yearVal;
            }
            else if (ip.numberValue === 1) {
                valRes = ip.numberVal;
            }
            else if (ip.decimalValue === 1) {
                valRes = ip.decimalVal;
            }
            else if (ip.textValue === 1) {
                valRes = ip.textVal;
            }
            if (valRes !== null) {
                let item = {
                    ShopId: workinfo.shopId,
                    WorkDate: workinfo.workDate,
                    ShopProfileId: ip.shopProfileId,
                    ItemId: ip.itemId,
                    ItemValues: valRes,
                    Note: ip.note,
                    GuiId: ip.guiId
                }
                itemsUp.push(item);
            }
        })
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUp, work));
    }
    const UploadData = async (itemsUp, work) => {
        await setProgress(true);
        await UploadController.DataAccessories(itemsUp, work, async () => {
            await setProgress(false);
            await loadData();
        }, async () => {
            await setProgress(false);
        })
    }
    return (
        <View style={{ flex: 1, }}>
            <View style={{ flex: 1, display: showList }}>
                <HeaderCustom
                    title={kpiinfo.menuNameVN}
                    iconRight='cloud-upload-alt'
                    leftFunc={() => navigation.goBack()}
                    rightFunc={() => uploadAction()}
                />
                <KeyboardAvoidingView
                    style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                    <FlatList
                        style={{ flex: 1 }}
                        key={'AccessorieResult'}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        data={dataShow}
                        renderItem={({ item, index }) => (
                            <AccessoriesResRow key={"result" + index} itemData={item} index={index} totalRow={dataShow.length} loadData={() => loadData()} vendorList={vendorList} yearList={yearList} />
                        )}
                    />
                </KeyboardAvoidingView>
                <View style={{ width: '100%', height: 100, position: 'absolute', bottom: 20 }}>
                    <Icon
                        iconStyle={{ color: appcolor.primary }}
                        onPress={() => addAccessories()}
                        containerStyle={{ position: 'absolute', bottom: 20, right: 30, maxHeight: 50 }}
                        size={45}
                        name='add-circle'
                        type='ionicon'
                    />
                </View>
            </View>
            <View style={{ flex: 1, display: showModal }}>
                <AccessoriesModal closedModal={() => closedModal()} loadDataAccessories={() => loadData()} data={data} />
            </View>
            <LoadingView isLoading={showProgress} title='Vui lòng chờ ...' />
        </View >
    )
}
export default AccessoriesReport