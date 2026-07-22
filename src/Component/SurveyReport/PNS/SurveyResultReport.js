import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { dataSurveyResult, getListDataTracking, updateItemSurvey } from "../../../Controller/TrackingDetailController";
import { checkLockReport } from '../../../Controller/ShopController'
import _ from "lodash";
import { alertWarning, checkNetwork } from "../../../Core/Utility";
import { Text } from '@rneui/themed';
import { LoadingView } from "../../../Control/ItemLoading";
import { Message } from "../../../Core/Helper";
import moment from "moment";
import CustomListView from "../../../Control/Custom/CustomListView";
import CustomTab from "../../../Control/Custom/CustomTab";
import { fontWeightBold } from "../../../Themes/AppsStyle";

const parseItemValues = (itemValues) => {
    try {
        const values = JSON.parse(itemValues || '[]')
        return Array.isArray(values) ? values : []
    } catch (_error) {
        return []
    }
}

const parseConfig = (reportItem) => {
    try {
        return JSON.parse(reportItem || '{}') || {}
    } catch (_error) {
        return {}
    }
}

export const SurveyResultReport = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [lockReport, setLockReport] = useState(false)
    const [isUploaded, setUploaded] = useState(false)
    const [data, setData] = useState([])
    const config = useMemo(() => parseConfig(kpiinfo?.reportItem), [kpiinfo?.reportItem])
    const tabRef = useRef()

    const styles = useMemo(() => createStyles(appcolor), [appcolor])

    const dataTab = useMemo(() => {
        const groupedData = _.groupBy(data, 'trackingId')
        return _.uniqBy(data, 'trackingId').map(item => ({
            ...item,
            dataItem: groupedData[item.trackingId] || []
        }))
    }, [data])

    const LoadData = useCallback(async () => {
        setLoading(true)
        try {
            const [isCheck, dataTracking] = await Promise.all([
                checkLockReport(shopinfo),
                getListDataTracking(workinfo, config?.TrackingId || 0)
            ])
            const normalizedData = dataTracking.map(item => ({
                ...item,
                dataAnswer: parseItemValues(item.itemValues)
            }))

            let day = parseInt(moment(new Date()).format('YYYYMMDD'))
            if (workinfo.workDate === day) {
                setUploaded(dataTracking[0]?.upload == 1 || false)
            } else {
                setUploaded(true)
            }

            setLockReport(isCheck)
            setData(normalizedData)
        } finally {
            setLoading(false)
        }
    }, [config?.TrackingId, shopinfo, workinfo])

    const uploadData = useCallback(async () => {
        const isConnected = await checkNetwork()
        if (!isConnected) {
            alertWarning('Vui lòng kiểm tra lại kết nối mạng và thử lại')
            return
        }
        // Check item by Config
        // {"TrackingId" : "39,40,41" ,"isCheckAll" : 1,"idCheckAll" :"41", "isCheckItem" : 1, "idCheckItem" : "39,40" }
        if (config.isCheckItem == 1) {
            const idChecking = config.idCheckItem.split(',')
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                const itemCheck = _.sumBy(_.filter(data, (e) => { return (e.trackingId == item.trackingId && e.textValue != null) }), 'textValue')
                if (idChecking.includes(`${item.trackingId}`)) {
                    if (itemCheck == 0 || itemCheck == 'null') {
                        alertWarning(`Chưa trả lời ${item.trackingName}`)
                        return
                    }
                }
            }
        }
        // Check data by Config
        if (config.isCheckAll == 1) {
            const idChecking = config.idCheckAll.split(',')
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                if (idChecking.includes(`${item.trackingId}`)) {
                    if (item.textValue == null || item.textValue.length == 0) {
                        alertWarning(`Chưa trả lời ${item.trackingName}: ${item.refName}`)
                        return
                    }
                }
            }
        }
        // Upload Data
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await dataSurveyResult(data, { ...workinfo, reportId: kpiinfo.kpiId }, config?.TrackingId, async () => {
                await LoadData();
            }, null)
        })
    }, [LoadData, config, data, kpiinfo.kpiId, workinfo])

    const handleChooseItem = useCallback((itemMain, itemAnswer) => {
        const value = itemMain.textValue == itemAnswer.ItemName ? '' : itemAnswer.ItemName
        setData(prevData => prevData.map(item => (
            item.id === itemMain.id
                ? { ...item, textValue: value }
                : item
        )))
        updateItemSurvey({
            workId: workinfo.workId,
            itemId: itemMain.id,
            textValue: value
        })
    }, [workinfo.workId])

    const renderItem = useCallback(({ item, index }) => (
        <RenderItem
            item={item}
            index={index}
            styles={styles}
            appcolor={appcolor}
            onChooseItem={handleChooseItem}
        />
    ), [appcolor, handleChooseItem, styles])

    const renderTab = useCallback((item) => (
        <View style={styles.listContainer}>
            <CustomListView
                data={item.dataItem}
                extraData={item.dataItem}
                renderItem={renderItem}
                estimatedItemSize={90}
                bottomView={styles.listBottom}
            />
        </View>
    ), [renderItem, styles])

    useEffect(() => {
        LoadData()
    }, [LoadData])

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo?.menuNameVN}
                iconRight='cloud-upload-alt'
                leftFunc={() => navigation.goBack()}
                rightFunc={(lockReport || isUploaded) ? null : uploadData}
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            <View style={styles.contentView}>
                <CustomTab
                    data={dataTab}
                    keyTabName='trackingName'
                    renderItem={renderTab}
                    tabRef={tabRef}
                />
            </View>
        </View>
    )
}

const createStyles = (appcolor) => StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentView: { flex: 1 },
    listContainer: { flex: 1, backgroundColor: appcolor.light, padding: 5 },
    listBottom: { paddingBottom: 16 },
    itemContainer: { paddingStart: 5, paddingEnd: 5 },
    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    titleHeader: { width: '100%', fontSize: 16, fontWeight: fontWeightBold, color: appcolor.redgray, padding: 8, fontStyle: 'italic' },
    itemView: { padding: 10, paddingStart: 12, paddingEnd: 12, borderRadius: 8, marginEnd: 8, marginBottom: 5, borderWidth: 0.3, borderColor: appcolor.grey },
    itemText: { color: appcolor.dark, fontSize: 14 }
})

const RenderItem = memo(({ item, index, styles, appcolor, onChooseItem }) => {
    return (
        <View key={`asd00_${index}`} style={styles.itemContainer}>
            {item.refName.length > 0 && <Text style={styles.titleHeader}>{`${item.refName}`}</Text>}
            <View style={styles.optionContainer}>
                {(item.dataAnswer || []).length > 0 && item.dataAnswer.map((e, i) => {
                    const onPressItem = () => {
                        onChooseItem(item, e)
                    }
                    const colorSelected = item.textValue == e.ItemName ? appcolor.yellowdark : appcolor.light
                    return (
                        <TouchableOpacity key={`${i}_kka`} onPress={item.upload == 1 ? null : onPressItem}>
                            <View style={[styles.itemView, { backgroundColor: colorSelected }]}>
                                <Text style={styles.itemText}>{e.ItemName}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })
                }
            </View>
        </View>
    )
})
