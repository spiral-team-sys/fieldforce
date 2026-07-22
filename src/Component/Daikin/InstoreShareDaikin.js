import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native"
import { checkNetwork, minWidthTab, } from '../../Core/Utility';
import { debounce, groupDataByKey, MessageAction, ToastError } from '../../Core/Helper';
import { deviceWidth } from '../../Themes/AppsStyle';
import { insertTotalTrackingLG, getListDataTracking, getListCategoryTracking, getAllListTrackResLG } from '../../Controller/TrackingDetailController';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { scaleSize } from '../../Themes/AppsStyle';
import { useSelector } from 'react-redux';
// import NumberFormat from "react-number-format";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { LoadingView } from '../../Control/ItemLoading';
import { AppNameBuild, bekoApp } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom'
import FormGroup from '../../Content/FormGroup';
import UploadController from '../../Controller/UploadController';
import moment from 'moment';

export const InstoreShareDaikin = ({ navigation, route }) => {
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [loading, setLoading] = useState(false)
    const [isUploaded, setIsUploaded] = useState(false)
    const [arrTagShow, setArrTagShow] = useState([])
    const [arrDataShow, setArrDataShow] = useState([])
    const reportItem = JSON.parse(kpiinfo?.reportItem)
    const [_, setMutate] = useState(false);
    const tabRef = useRef()
    const loadData = async () => {
        await setLoading(true)
        const lstData = await getListDataTracking(workinfo, reportItem.InstoreShare)
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate === day) {
            await setIsUploaded(lstData[0].upload == 1)
        } else {
            await setIsUploaded(true)
        }

        const lstTab = await getListCategoryTracking(reportItem.InstoreShare)
        const { arr } = groupDataByKey({
            arr: lstData,
            key: AppNameBuild === bekoApp ? 'competitorId' : 'subCatId',
            keyLayer2: AppNameBuild === bekoApp ? 'subCatId' : 'competitorId'
        })
        await setArrTagShow(lstTab)
        await setArrDataShow(arr)
        await setLoading(false)
    }
    const handlerUploadData = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        let lstReuslt = await getAllListTrackResLG(workinfo, reportItem.InstoreShare)
        if (lstReuslt.length === 0) {
            ToastError('Vui lòng làm báo cáo trước khi gửi dữ liệu')
            return
        }
        MessageAction('Bạn có muốn tiếp tục gửi báo cáo không ? (Sau khi gửi dữ liệu sẽ không thể điều chỉnh)', async () => {
            await UploadController.DataInstoreShare({ ...workinfo, reportId: kpiinfo.kpiId }, reportItem.InstoreShare, async () => {
                loadData()
            })
        })
    }
    useEffect(() => {
        loadData();
        return () => loading;
    }, [])
    const onChangeTextValue = async (item, index, text) => {
        let mDisplay = 0
        if (text == '') {
            mDisplay = null
        } else {
            let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
            mDisplay = (value === '' || value === null) ? null : parseInt(value);
        }

        let indexD = arrDataShow.findIndex(it => it.id === item.id)
        arrDataShow[indexD].display = mDisplay
        await setMutate(e => !e)
        await insertTotalTrackingLG(workinfo, item, mDisplay)
    }
    const RenderItemData = ({ item, index }) => {
        const keyLayer2 = item[AppNameBuild === bekoApp ? `${item.competitorId}${item.subCatId}` : `${item.subCatId}${item.competitorId}`]
        const changeTextItem = (text) => {
            onChangeTextValue(item, index, text)
        }
        const fontWeightTotal = item.refName == 'TOTAL' ? '800' : '500'
        const colorTotal = item.refName == 'TOTAL' ? appcolor.primary : appcolor.dark
        return (
            <View key={`DS_${index}}`} style={{ width: '100%' }} >
                {item.isParent && item.subCategory !== null && item.subCategory.length > 0 &&
                    //  item.subCategory?.length > 0 &&
                    <View style={{ flex: 1, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: scaleSize(17), fontWeight: '700', color: appcolor.primary, paddingLeft: 10 }}>{`${AppNameBuild === bekoApp ? item.competitorName : item.subCategory}`}</Text>
                    </View>
                }
                {keyLayer2 &&
                    <View style={{ flex: 1, padding: 8, marginTop: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.grayLight, }}>
                        <Icon name='tags' style={{ color: appcolor.dark }} />
                        <Text style={{ color: appcolor.dark, fontSize: 14, paddingLeft: 8, fontWeight: '600' }}>{AppNameBuild === bekoApp ? item.subCategory : item.competitorName}</Text>
                    </View>
                }
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: appcolor.surface, padding: 7, marginBottom: 1 }}>
                    <Text style={{ fontSize: scaleSize(12), color: colorTotal, textAlign: 'left', width: '70%', fontWeight: fontWeightTotal }}>{item.segment ? item.segment : item.refName}</Text>
                    <NumberFormat
                        value={item.display === 0 ? 0 : (item.display || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{
                                    fontSize: scaleSize(12), color: colorTotal, fontWeight: fontWeightTotal,
                                    backgroundColor: appcolor.light,
                                    width: '30%', textAlign: 'center', borderRadius: 5, padding: 8
                                }}
                                selectTextOnFocus
                                keyboardType='numeric'
                                placeholder='Số lượng'
                                placeholderTextColor={appcolor.greydark}
                                editable={item.upload === 1 ? false : true}
                                onChangeText={changeTextItem}
                            />
                        }
                    />
                </View>
            </View>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                rightFunc={isUploaded ? null : handlerUploadData}
            />
            <LoadingView title={'Đang cập nhật dữ liệu'} isLoading={loading} styles={{ marginTop: 8 }} />
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 10} >
                {
                    arrTagShow.length > 0 && !loading &&
                    <Tabs.Container
                        ref={tabRef}
                        pagerProps={{ scrollEnabled: true, pagingEnabled: true }}
                        renderTabBar={props => (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 14, color: appcolor.light, fontWeight: '600' }}
                                inactiveColor={appcolor.dark}
                                activeColor={appcolor.dark}
                                tabStyle={{ minWidth: minWidthTab(arrTagShow), height: 38 }}
                                scrollEnabled={true}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                style={{ backgroundColor: appcolor.light }}
                            />
                        )} >
                        {arrTagShow.map((it, i) => {
                            let dataByCategoryId = arrDataShow.filter(data => data.categoryId == it.categoryId)
                            const totalRow = dataByCategoryId.length
                            const label = `${it.category || it.category_viVN} (${totalRow})`
                            return (
                                <Tabs.Tab key={i} label={label} name={label} >
                                    <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                        <FlatList
                                            extraData={arrDataShow}
                                            keyExtractor={(item, index) => item + index}
                                            data={dataByCategoryId}
                                            removeClippedSubviews={false}
                                            scrollToOverflowEnabled={true}
                                            nestedScrollEnabled={true}
                                            renderItem={RenderItemData}
                                            showsVerticalScrollIndicator={false}
                                            ListFooterComponent={<Text style={{ width: '100%', height: deviceWidth / 2, textAlign: 'center', color: appcolor.dark, padding: 8 }}>{dataByCategoryId.length > 10 ? 'Đã xem hết' : ''}</Text>}
                                        />
                                    </View>
                                </Tabs.Tab>
                            )
                        })}
                    </Tabs.Container>
                }
            </KeyboardAvoidingView>
        </View >
    )
}
