import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { getDataDisplaySurvey, getDisplaySurveyResult, getTabDisplaySurvey, uploadDisplaySurvey } from "../../../Controller/DisplayController";
import { groupDataByKey, Message, ToastError, ToastSuccess } from "../../../Core/Helper";
import { alertWarning, checkNetwork } from "../../../Core/Utility";
import { InputDisplaySurvey } from "./InputDisplaySurvey";
import { TabForm } from "../../../Control/TabForm";
import { SceneMap } from "react-native-tab-view";
import { PhotoItems } from "../../EPSON/PhotoItems";
import { getAllPhotosUpload, getPhotosReport } from "../../../Controller/WorkController";
import RNFS from 'react-native-fs'
import { checkLockReport } from "../../../Controller/ShopController";
import moment from "moment";

export const DisplaySurveyReport = ({ navigation, route }) => {
    const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const lstReport = JSON.parse(kpiinfo?.reportItem)
    const [data, setData] = useState({ listData: [], listTab: [] })
    const [Status, setStatus] = useState(0)
    const [isLockReport, setLockReport] = useState(false)
    const [showProgress, setProgress] = useState(false)
    const [routes, setRoutes] = useState([{ key: "first", title: "Nhập Liệu" }, { key: "second", title: "Hình Ảnh" },]);
    const listCheck = [{ id: 1, name: 'Yes', nameVN: 'có' }, { id: 2, name: 'No', nameVN: 'Không' }]
    const loadData = async () => {
        await setProgress(true)
        const isCheck = await checkLockReport(shopinfo)
        await setLockReport(isCheck)
        let lstRes = await getDisplaySurveyResult(workinfo);
        let isUpload = lstRes?.length > 0 ? lstRes[0].upload : 0
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setStatus(isUpload)
        } else {
            await setStatus(1)
        }
        const listData = await getDataDisplaySurvey(workinfo, lstReport?.DisplayId)
        const listTab = await getTabDisplaySurvey()
        const { arr } = await groupDataByKey({
            arr: listData,
            key: 'groupId',
            keyLayer2: 'itemName'
        })
        await setData({ listData: arr, listTab: listTab })
        setTimeout(async () => { await setProgress(false) }, 100)
    }

    useEffect(() => {
        loadData()
        return () => false;
    }, [])


    const uploadAction = async () => {
        let noteStr = '';
        let resPhotos = await getAllPhotosUpload(kpiinfo.kpiId, workinfo.shopId, workinfo.workDate);
        const checkDone = data.listData.filter(it => (it.posmValue === null || it.posmValue === 'null' || it.posmValue === '') && it.target == 1)
        console.log(resPhotos, 'test');
        if (checkDone.length > 0) {
            ToastError('Bạn phải hoàn thành các khảo sát có chấm đỏ trước khi gửi!!', "Thông báo", "top");
            return;
        }

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

        if (noteStr !== '') {
            alertWarning(noteStr);
            return
        }
        let itemsUpload = data.listData.filter(it => it.kpi1 !== -1);
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(itemsUpload));
    }
    const UploadData = async (resDisplay) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        await uploadDisplaySurvey(resDisplay, work, async () => {
            await loadData();
        }, async () => {
        })
    }

    const ViewItemInput = () => {
        return (
            <InputDisplaySurvey Status={Status} navigation={navigation} data={data} listCheck={listCheck} showProgress={showProgress} />
        );
    };
    const ViewItemPhoto = () => {
        return (
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
        );
    };
    const renderScene = SceneMap({
        first: ViewItemInput,
        second: ViewItemPhoto,
    });

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            <View style={{ flex: 1 }}>
                <HeaderCustom
                    title={kpiinfo?.menuNameVN}
                    iconRight={!isLockReport ? (Status !== 1 ? 'cloud-upload-alt' : null) : 'user-lock'}
                    rightFunc={() => !isLockReport ? (Status !== 1 ? uploadAction() : null) : ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo')}
                    leftFunc={() => navigation.goBack()}
                />
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
        </View >
    )
}
