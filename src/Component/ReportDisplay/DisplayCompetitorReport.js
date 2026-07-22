import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Keyboard, StyleSheet } from "react-native";
import { insertCompetitorByCateResult, getUploadDisplayCompetitorResult, getStatusCompetitorResult, uploadDataDisplayCompe, getPhotosReport, getAllPhotos } from '../../Controller/WorkController'
import { checkNetwork, ConvertToInt } from "../../Core/Utility";
import { groupDataByKey, Message } from '../../Core/Helper';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
////import { NumericFormat } from "react-number-format";;
import { getListByCompetitor } from '../../Controller/DisplayController'
import { LoadingView } from '../../Control/ItemLoading/index';
import { PhotoItems } from '../EPSON/PhotoItems';
import moment from 'moment';
import { toastError } from '../../Utils/configToast';
import CustomTab from '../../Control/Custom/CustomTab';
import CustomListView from '../../Control/Custom/CustomListView';
import { fontWeightBold, styleDefault } from '../../Themes/AppsStyle';
import UploadController from '../../Controller/UploadController';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';

const REPORT_TABS = [
    { tabName: 'Nhập liệu' },
    { tabName: 'Hình ảnh' },
];

const DisplayCompetitorReport = ({ navigation }) => {
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const reportItem = useMemo(() => JSON.parse(kpiinfo?.reportItem || '{}'), [kpiinfo?.reportItem]);

    const [showProgress, setProgress] = useState(false);
    const [reload, setReload] = useState(false)
    const [Status, setStatus] = useState(false);
    const [lstShow, setLstShow] = useState([]);
    const [photoReloadKey, setPhotoReloadKey] = useState(0);

    const styles = useMemo(() => createStyles(appcolor), [appcolor]);
    const photoList = useMemo(() => Array.isArray(reportItem?.ImageByList) ? reportItem.ImageByList : [], [reportItem?.ImageByList]);
    const photoDataReportId = kpiinfo.id || kpiinfo.kpiId;
    const photoReportIds = useMemo(() => [...new Set([photoDataReportId, kpiinfo.kpiId].filter(Boolean))], [kpiinfo.kpiId, photoDataReportId]);

    const loadDataShow = useCallback(async () => {
        const lstRes = await getStatusCompetitorResult(workinfo);
        const isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
        const day = parseInt(moment(new Date()).format('YYYYMMDD'), 10)
        if (workinfo.workDate === day) {
            setStatus(isUpload)
        } else {
            setStatus(1)
        }
        const dataCompetitor = await getListByCompetitor(workinfo);
        const { arr } = await groupDataByKey({
            arr: dataCompetitor,
            key: 'divisionId'
        })
        setLstShow(arr)
    }, [workinfo])

    useEffect(() => {
        loadDataShow();
        return () => false;
    }, [loadDataShow, reload])

    const validateRequiredPhotos = useCallback(async () => {
        if (Number(reportItem?.isConstraint) !== 1 || photoList.length === 0) {
            return true;
        }

        const requiredTotalImage = ConvertToInt(reportItem?.image) || 0;
        if (requiredTotalImage > 0) {
            let totalPhoto = 0;
            for (const reportId of photoReportIds) {
                const photos = await getAllPhotos(reportId, workinfo.shopId, workinfo.workDate) || [];
                totalPhoto += photos.length || 0;
            }

            if (totalPhoto < requiredTotalImage) {
                toastError('Thông báo', `Vui lòng chụp tối thiểu ${requiredTotalImage} hình ảnh trước khi gửi. (${totalPhoto}/${requiredTotalImage})`);
                return false;
            }

            return true;
        }

        const missingPhotos = [];
        for (const photoItem of photoList) {
            const requiredCount = ConvertToInt(photoItem.numberIMG) || 0;
            if (requiredCount <= 0) {
                continue;
            }

            let photoCount = 0;
            for (const reportId of photoReportIds) {
                const photos = await getPhotosReport(reportId, photoItem.code, workinfo.shopId, workinfo.workDate) || [];
                photoCount += photos.length || 0;
            }
            if (photoCount < requiredCount) {
                missingPhotos.push(`${photoItem.nameVN || photoItem.name}: ${photoCount}/${requiredCount}`);
            }
        }

        if (missingPhotos.length > 0) {
            toastError('Thông báo', `Vui lòng chụp đủ hình ảnh trước khi gửi.\n${missingPhotos.join('\n')}`);
            return false;
        }

        return true;
    }, [photoList, photoReportIds, reportItem?.image, reportItem?.isConstraint, workinfo.shopId, workinfo.workDate])

    const uploadPhotosAndRefresh = useCallback(async () => {
        if (photoList.length === 0 || !photoDataReportId) {
            return;
        }

        for (const reportId of photoReportIds) {
            const photos = await getAllPhotos(reportId, workinfo.shopId, workinfo.workDate) || [];
            if (photos.length === 0) {
                continue;
            }

            const result = await UploadController.DataPhoto({
                shopId: workinfo.shopId,
                workDate: workinfo.workDate,
                reportId
            });
            if (result.statusId !== 200 && result.messager !== 'Không có dữ liệu hình ảnh để gửi') {
                toastError('Hình ảnh', result.messager || 'Gửi dữ liệu hình ảnh không thành công.');
                return;
            }

            const refreshedPhotos = await getAllPhotos(reportId, workinfo.shopId, workinfo.workDate) || [];
            const pendingFiles = refreshedPhotos.filter(photo => Number(photo.fileUpload) !== 1 && photo.photoPath);
            if (pendingFiles.length > 0) {
                await uploadAllDataPhoto(pendingFiles, true, true);
            }
        }

        setPhotoReloadKey(key => key + 1);
    }, [photoDataReportId, photoList.length, photoReportIds, workinfo.shopId, workinfo.workDate])

    const UploadData = useCallback(async (competitorRes) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        const isNetwork = await checkNetwork();
        if (!isNetwork) {
            toastError('Thông báo', 'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.');
            return
        }

        setProgress(true);
        await uploadDataDisplayCompe(competitorRes, work, async () => {
            await uploadPhotosAndRefresh();
            setProgress(false);
            setReload(e => !e)
        }, async () => {
            setProgress(false);
        })
    }, [kpiinfo.kpiId, uploadPhotosAndRefresh, workinfo])

    const uploadAction = useCallback(async () => {
        Keyboard.dismiss();
        const competitorRes = await getUploadDisplayCompetitorResult(workinfo);
        const lstDataUpload = competitorRes.filter(it => it.quantity === 'null' || it.quantity === null)
        if (competitorRes.length === 0) {
            toastError('Thông báo', 'Bạn chưa làm báo cáo.')
            return
        }
        if (lstDataUpload.length > 0) {
            toastError('Thông báo', 'Vui lòng làm hết báo cáo, trước khi gửi.');
            return;
        }
        const isValidPhoto = await validateRequiredPhotos();
        if (!isValidPhoto) {
            return;
        }

        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(competitorRes));
    }, [UploadData, validateRequiredPhotos, workinfo])

    const InsertPrice = useCallback(async (item) => {
        const itemInsert = {
            workId: item.workId || workinfo.workId,
            workDate: item.workDate || workinfo.workDate,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            quantity: item.quantity,
            divisionId: item.divisionId,
            division: item.division,
            upload: 0
        }
        await insertCompetitorByCateResult(itemInsert);
    }, [workinfo])

    const onChangeTextValue = useCallback(async (item, index, text) => {
        let mPrice = 0

        if (text === '') {
            mPrice = null
        } else {
            const value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
            mPrice = (value === '' || value === null) ? null : parseInt(value, 10);
        }
        const itemUpdate = { ...item, quantity: mPrice }
        setLstShow(data => data.map((it, idx) => idx === index ? itemUpdate : it))
        await InsertPrice(itemUpdate);
    }, [InsertPrice])

    const sumQuantityByCate = useCallback((competitorId) => {
        let totalItem = 0;
        lstShow.forEach(i => {
            if (String(i.divisionId) === String(competitorId)) {
                totalItem += ConvertToInt(i.quantity) || 0
            }
        })
        return totalItem;
    }, [lstShow])

    const renderItem = useCallback(({ item, index }) => {
        const isUpload = Number(Status) === 1
        const totalRow = lstShow.length
        const totalByCate = sumQuantityByCate(item.divisionId)
        const changeTextItem = async (text) => {
            await onChangeTextValue(item, index, text)
        }
        return (
            <View key={index} style={styles.itemContainer}>
                {item.isParent &&
                    <Text style={styles.groupTitle} numberOfLines={2}>
                        {item.division} - Total: {totalByCate}
                    </Text>
                }
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryName}>
                        {item.categoryName}
                    </Text>
                    <NumericFormat
                        value={item.quantity === 0 ? 0 : (item.quantity || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={styles.quantityInput}
                                keyboardType='numeric'
                                placeholder='Số lượng'
                                placeholderTextColor={appcolor.greydark}
                                editable={!isUpload} selectTextOnFocus={!isUpload}
                                onChangeText={changeTextItem}
                            />
                        }
                    />
                </View>
                {
                    index === totalRow - 1 && index > 10 && <View>
                        <Text style={styles.endListText}>{'Đã xem hết'}</Text>
                    </View>
                }
            </View>
        )
    }, [Status, appcolor.greydark, lstShow.length, onChangeTextValue, styles, sumQuantityByCate])

    const renderInputTab = useCallback(() => (
        <View style={styles.tabContent}>
            <CustomListView
                data={lstShow}
                extraData={{ Status, totalRow: lstShow.length }}
                renderItem={renderItem}
                estimatedItemSize={58}
                showsVerticalScrollIndicator={false}
            />
        </View>
    ), [Status, lstShow, renderItem, styles])

    const renderPhotoTab = useCallback(() => (
        <View style={[styles.tabContent]}>
            <PhotoItems
                key={`photo-items-${photoReloadKey}`}
                usedHeader={false} navigation={navigation}
                route={{ params: { Photos: photoList, dataImageList: photoList, Status: Status } }} />
        </View>
    ), [Status, navigation, photoList, photoReloadKey, styles])

    const renderTab = useCallback((item) => {
        if (item.tabName === 'Hình ảnh') {
            return renderPhotoTab();
        }

        return renderInputTab();
    }, [renderInputTab, renderPhotoTab])

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight='cloud-upload-alt'
                rightFunc={Number(Status) === 0 ? () => uploadAction() : null}
                leftFunc={() => navigation.goBack()}
            />
            <LoadingView title={'Vui lòng chờ ...'} isLoading={showProgress} styles={styles.loadingView} />
            <View style={styles.itemContainer}>
                <CustomTab
                    data={REPORT_TABS}
                    keyTabName='tabName'
                    renderItem={renderTab}
                />
            </View>

        </View>
    )
}

const createStyles = (appcolor) => StyleSheet.create({
    ...styleDefault(appcolor),
    mainContainer: { flex: 1, backgroundColor: appcolor.surface },
    loadingView: { marginTop: 8 },
    tabContent: { flex: 1, width: '100%', backgroundColor: appcolor.light, padding: 6 },
    itemContainer: { flex: 1 },
    groupTitle: {
        padding: 8,
        color: appcolor.primary,
        fontSize: 15,
        fontWeight: fontWeightBold,
        backgroundColor: appcolor.surface
    },
    rowContainer: {
        flex: 1,
        backgroundColor: appcolor.light,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    categoryName: {
        flex: 1,
        padding: 8,
        paddingRight: 12,
        color: appcolor.dark,
        fontSize: 14,
        fontWeight: fontWeightBold,
        flexShrink: 1
    },
    quantityInput: {
        width: '28%',
        minWidth: 88,
        maxWidth: 130,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 12,
        color: appcolor.dark,
        backgroundColor: appcolor.light,
        fontWeight: '500',
        textAlign: 'center',
        borderWidth: 0.5,
        borderRadius: 7,
        borderColor: appcolor.greydark
    },
    endListText: {
        width: '100%',
        textAlign: 'center',
        color: appcolor.primary,
        padding: 8,
        paddingBottom: 10
    },
    listFooter: { height: 100 }
});

export default DisplayCompetitorReport;
