import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Badge } from '@rneui/themed'
import { GetPhotosByReportId } from '../../Controller/PhotoController';
import UploadController from '../../Controller/UploadController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Message, ToastError, ToastSuccess } from '../../Core/Helper';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { taskList } from '../../Core/Table';
import _ from 'lodash';
import { REPORT } from '../../API/ReportAPI';
import { useFocusEffect } from '@react-navigation/native';
import CustomListView from '../../Control/Custom/CustomListView';
import { styleDefault } from '../../Themes/AppsStyle';

/**
 * 
    isRequired = 0 : không ràng chụp hình
    isRequired = 1 : ràng chụp hình theo số lượng bắt buộc 
    isRequired = 2 : ràng chụp hình theo số lượng quy định trong template
    isRequired = 3 : ràng chụp hình nếu như có hình ảnh thì sẽ kiểm tra theo template
 */

const parseJSON = (value, fallback) => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value !== 'string') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        return fallback
    }
}

const getTemplateByCode = (source, code) => {
    if (!source) return []
    const template = typeof source === 'string' ? parseJSON(source, []) : source
    if (Array.isArray(template)) return template
    return template?.[code] || []
}

export const PhotoByList = ({ navigation, route }) => {
    const { appcolor, shopinfo, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const defaultStyles = styleDefault(appcolor)
    const isTakeInOther = route.params?.isTakeInOther || false
    const dataKPIData = route.params?.kpiData || {}
    const [data, setData] = useState({ dataView: [], dataPhoto: [], dataConfig: {} })
    const [isLock, setLocked] = useState(0)

    const loadData = async () => {
        const dataFilter = { shopId: shopinfo.shopId, reportId: isTakeInOther == true ? dataKPIData.id : kpiinfo.id }
        await REPORT.GetDataConfigReport(dataFilter, async (mData, message) => {
            if (message) {
                ToastError(message)
                return
            }
            const _item = mData?.[0] || {}
            const dataConfig = parseJSON(_item?.dataConfig, {})
            const dataView = parseJSON(_item?.dataView, [])
            await setData(prev => ({
                ...prev,
                dataConfig: dataConfig || {},
                dataView: Array.isArray(dataView) ? dataView : []
            }))
        })
    }
    const loadPhoto = async () => {
        const res = await GetPhotosByReportId(shopinfo.shopId, workinfo.workDate, isTakeInOther == true ? dataKPIData.id : kpiinfo.id);
        const dataPhoto = Array.isArray(res) ? res : []
        await setData(prev => ({ ...prev, dataPhoto }))
        await setLocked(dataPhoto[0]?.dataUpload || 0)
    }

    useEffect(() => {
        loadData();
    }, [])

    useFocusEffect(
        useCallback(() => {
            loadPhoto()
        }, [])
    );

    const SendReport = async () => {

        const res = await GetPhotosByReportId(shopinfo.shopId, workinfo.workDate, isTakeInOther == true ? dataKPIData.id : kpiinfo.id);
        const listResults = _.filter(res, (it) => it.dataUpload == 0)
        if (!res || res.length == 0) {
            ToastError(`Bạn phải chụp hình trước khi gửi báo cáo`);
            return false
        }
        if (listResults.length == 0) {
            ToastError(`Báo cáo hình ảnh đã được gửi dữ liệu`);
            return false
        }

        if (data.dataConfig?.isConstraint == 1) {
            const numLimitPhoto = data.dataConfig?.numConstrain || 1
            if (numLimitPhoto !== undefined && numLimitPhoto > 0 && res?.length < numLimitPhoto) {
                ToastError(`Vui lòng chụp ${numLimitPhoto} tấm hình cho báo cáo.(${res?.length}/${numLimitPhoto})`);
                return false
            }
        } else if (data.dataConfig?.isConstraint == 2) {
            for (let index = 0; index < data.dataView?.length; index++) {
                const itemM = data.dataView[index]
                const listByItemM = _.filter(res, (it) => it.photoType?.includes(`${itemM.code}`))
                if (itemM.isRequired == 1) {
                    if (itemM.numberValue !== undefined && itemM.numberValue > 0 && listByItemM?.length < itemM.numberValue) {
                        ToastError(`Vui lòng chụp ${itemM.numberValue} tấm hình cho ${itemM.name}.(${listByItemM?.length}/${itemM.numberValue})`);
                        return false
                    }
                } else if (itemM.isRequired == 2) {
                    const filterList = parseJSON(itemM.filterList, [])
                    if (filterList?.length > 0) {
                        for (let idxP = 0; idxP < filterList.length; idxP++) {
                            const itL = filterList[idxP]
                            let photoType = itL.code + '_' + itemM.code
                            const listByTemplate = _.filter(res, (it) => it.photoType == photoType);
                            if (listByTemplate?.length < itL.numberIMG) {
                                ToastError(`${itemM.name} : Vui lòng chụp ${itL.numberIMG} tấm hình cho ${itL.nameVN}`);
                                return false;
                            }
                        }
                    }

                } else if (itemM.isRequired == 3 && listByItemM.length > 0) {
                    const filterList = parseJSON(itemM.filterList, [])
                    if (filterList?.length > 0) {
                        for (let idxP = 0; idxP < filterList.length; idxP++) {
                            const itL = filterList[idxP]
                            let photoType = itL.code + '_' + itemM.code
                            const listByTemplate = _.filter(res, (it) => it.photoType == photoType);
                            if (listByTemplate?.length < itL.numberIMG) {
                                ToastError(`${itemM.name} : Vui lòng chụp ${itL.numberIMG} tấm hình cho ${itL.nameVN}`);
                                return false;
                            }
                        }
                    }

                }
            }
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => onUploadData());
    }
    const onUploadData = async () => {
        const info = {
            shopId: workinfo.shopId,
            workDate: workinfo.workDate,
            reportId: isTakeInOther == true ? dataKPIData.id : kpiinfo.id
        }
        const result = await UploadController.DataPhoto(info)
        if (result.statusId === 200) {
            await QueryStringSql(`UPDATE ${taskList.tableName} SET taskDone=1,taskAlter='Đã hoàn thành' WHERE shopId=${workinfo.shopId} AND reportId=${isTakeInOther == true ? dataKPIData.id : kpiinfo.id}`)
            await UploadController.PostFile();
            await loadPhoto()
            await setLocked(1);
        }
        await ToastSuccess(result.messager)
    }

    const handlerSelectItem = async (item, listByItem) => {
        let listTakePhoto = parseJSON(item?.filterList, [])
        if (!listTakePhoto || listTakePhoto?.length == 0) {
            listTakePhoto = getTemplateByCode(route.params?.dataImageList, item.code)
            if (!listTakePhoto || listTakePhoto?.length == 0) {
                listTakePhoto = getTemplateByCode(data.dataConfig?.ImageByList, item.code)
            }
        }
        const itemStatus = listByItem[0]?.dataUpload || 0
        await navigation.navigate('photogroup', { Status: itemStatus, dataImageList: listTakePhoto || [], keyPhoto: item.code, kpiData: isTakeInOther == true ? dataKPIData : kpiinfo, isTakeInOther: true, hideIcon: true })
    }

    const renderItem = ({ item, index }) => {
        const listByItem = _.filter(data.dataPhoto, (e) => e.photoType?.includes(item.code)) || []
        const itemStatus = listByItem[0]?.dataUpload || 0
        return (
            <TouchableOpacity
                onPress={() => handlerSelectItem(item, listByItem)}
                key={`${item.id}_${index}`}
                style={styles.itemContainer}>
                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    {item.descriptionName && <Text style={styles.itemDescription}>{item.descriptionName}</Text>}
                </View>
                <Badge badgeStyle={[styles.badge, { backgroundColor: itemStatus == 1 ? appcolor.success : appcolor.primary }]} textStyle={styles.badgeText} value={listByItem.length} />
            </TouchableOpacity>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { backgroundColor: appcolor.homebackground },
        listContainer: { flex: 1, backgroundColor: appcolor.surface },
        itemContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 4,
            marginHorizontal: 8,
            marginRight: 16,
            paddingVertical: 4,
            borderRadius: 8,
            shadowOpacity: 0.5,
            elevation: 3,
            backgroundColor: appcolor.light,
            shadowColor: appcolor.dark,
            shadowOffset: { width: 3, height: 0 }
        },
        itemContent: { width: '90%', padding: 8, paddingVertical: 12 },
        itemTitle: { fontWeight: '600', fontSize: 14, color: appcolor.dark },
        itemDescription: { width: '100%', fontSize: 13, fontWeight: '500', color: appcolor.greylight, fontStyle: 'italic' },
        badge: { right: -14, borderRadius: 50, minWidth: 40, height: 40, marginRight: 10 },
        badgeText: { fontSize: 14 }
    })
    return (
        <View style={[defaultStyles.contentContainer, styles.mainContainer]}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                rightFunc={isLock == 1 ? null : SendReport}
                iconRight={"cloud-upload-alt"}
                title={(isTakeInOther == true ? dataKPIData?.menuNameVN : kpiinfo?.menuNameVN) || "Chụp hình"} />
            <View style={styles.listContainer}>
                <CustomListView
                    key={`ListTakePhoto`}
                    data={data.dataView}
                    extraData={[data.dataView, data.dataPhoto, isLock]}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    estimatedItemSize={100}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    )
}
