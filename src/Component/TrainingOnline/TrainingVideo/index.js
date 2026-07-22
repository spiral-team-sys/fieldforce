import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, FlatList, ScrollView, View } from 'react-native';
import { Card, Text, Icon, Overlay } from '@rneui/base';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { TODAY, alertConfirm, type } from '../../../Core/Utility';
import Video from 'react-native-video';
import { deviceHeight, deviceWidth } from '../../Home';
import { DEFAULT_COLOR, URLDEFAULT } from '../../../Core/URLs';
import moment from 'moment';
import { TouchableOpacity } from 'react-native';
import { REPORT } from '../../../API/ReportAPI';
import { ToastError, ToastSuccess, compareTime, groupDataByKey } from '../../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { YearMonthSelected } from '../../../Control/YearMonthSelected';

const DATE = new Date()
const ExerciseListScreen = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
    const [filterMonth, setFilterMonth] = useState({ "year": new Date().getFullYear(), "yearname": `Năm ${new Date().getFullYear()}`, "month": new Date().getMonth() + 1, "monthname": `Tháng ${new Date().getMonth() + 1}`, "loadYearMonth": false, "jsonFilter": {} })
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({ dataMain: [] })
    const [_mutate, setMutate] = useState(false)
    const [modeOverlay, setModeOverlay] = useState({ visible: false, contentOverlay: '', })
    const [filter, setFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })

    const loadData = async () => {
        await setLoading(true)
        const params = { shopId: 0, reportId: kpiinfo.id, typeReport: 'LOADDATA', month: filter.month, year: filter.year }
        await REPORT.GetDataReportByShop_RealTime(params, async (mData) => {
            const { arr } = await groupDataByKey({
                arr: mData,
                key: 'exerciseId'
            })
            data.dataMain = arr
            await setMutate(e => !e)
        })
        await setLoading(false)
    }

    useEffect(() => {
        DeviceEventEmitter.addListener('RELOAD_VIEW_TRAINING', () => loadData())
        const _LoadList = loadData()
        return () => {
            DeviceEventEmitter.removeAllListeners('RELOAD_VIEW_TRAINING')
            _LoadList
        }
    }, [])

    const toggleOverlay = () => {
        setModeOverlay({ visible: false, contentOverlay: '' })
    }

    /** Handle Show Overlay */
    const handlePressDetail = (answerDataParse, index) => {
        const dataScore = answerDataParse?.dataScore || []
        const contentOverlay = <View style={{ height: deviceHeight * 0.6 }}>
            <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 20, fontWeight: '600', color: appcolor.primary }}>Chi tiết điểm</Text>
            <ScrollView style={{ flex: 1, marginVertical: 8 }} >
                {dataScore.map((item) => (
                    <View key={item.Id} style={{ backgroundColor: appcolor.surface, borderRadius: 10, padding: 12, marginBottom: 12, }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6, color: appcolor.dark, }}>{item.GroupName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <Icon name="star" type="feather" size={16} color={appcolor.warning} style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 14, color: appcolor.greylight, lineHeight: 20, flex: 1, }}>
                                {item.Score} điểm - {item.NameVN}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity
                    onPress={() => toggleOverlay()}
                    style={{
                        justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.6,
                        borderRadius: 20, backgroundColor: appcolor.surface, padding: 10,
                    }}
                >
                    <Text style={{ color: appcolor.dark }}>Đóng</Text>
                </TouchableOpacity>
            </View>
        </View>
        setModeOverlay({ visible: true, contentOverlay: contentOverlay })
    }
    const handlerViewDetailItem = (item) => {
        const { itemDecription } = item
        const listDescription = JSON.parse(itemDecription || '[]')

        const contentOverlay = <View style={{ height: deviceHeight * 0.6 }}>
            <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 20, fontWeight: '600', color: appcolor.primary }}>Chi tiết điểm</Text>
            <ScrollView style={{ flex: 1, marginVertical: 8 }} >
                {listDescription?.map((item, index) => (
                    <View key={index} style={{ marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Icon name="check-circle" type="feather" size={16} color={appcolor.primary} />
                            <Text style={{ marginLeft: 6, fontWeight: '600', fontSize: 16 }}>{item.title}</Text>
                        </View>
                        <Text style={{ marginLeft: 22, color: appcolor.greylight, lineHeight: 16 }}>{item.content}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity
                    onPress={() => toggleOverlay()}
                    style={{
                        justifyContent: 'center', alignItems: "center", width: deviceWidth * 0.6,
                        borderRadius: 20, backgroundColor: appcolor.surface, padding: 10,
                    }}
                >
                    <Text style={{ color: appcolor.dark }}>Đóng</Text>
                </TouchableOpacity>
            </View>
        </View>
        setModeOverlay({ visible: true, contentOverlay: contentOverlay })
    }
    const handleSelectVideo = async (answerData) => {
        const urlVideo = URLDEFAULT + answerData.videoUri
        await navigation.navigate("videoplay", { 'urlVideo': urlVideo, "item": answerData, "guid": null, lockTracking: true })
    }
    const handlerSelectSend = (item, answerId, checkTimeSend) => {
        if (checkTimeSend == 1) {
            ToastError('Đã qua thời gian gửi bài', 'Thông báo', 'top')
            return
        }
        navigation.navigate('SubmitExercise', { exercise: item, answerId: answerId })
    }
    const handlerConfrimExercise = async (answerId) => {
        if (!answerId) {
            ToastError('Lỗi khi lấy thông tin bài tập', 'Thông báo', 'top')
            return
        }

        const dataUpload = [{
            typeAction: 'CONFIRM',
            answerId: answerId
        }]
        alertConfirm('Xác nhận nộp bài', `Bạn có xác nhận muốn nộp bài không?`, async () => {
            const shop = { shopId: 0, auditDate: TODAY }
            const uploadRealtime = await REPORT.UploadDataRaw_Realtime([...dataUpload], shop, kpiinfo.id)
            if (uploadRealtime.statusId == 200) {
                await DeviceEventEmitter.emit('RELOAD_VIEW_TRAINING')
                await ToastSuccess(uploadRealtime.messager, 'Thông báo', 'top')
                // type == 'BACK' && await navigation.goBack()
            } else {
                ToastError(uploadRealtime.messager, 'Thông báo', 'top')
            }
        })
    }



    const renderItem = ({ item, index }) => {
        const { exerciseName, exerciseDescription, itemName, itemDecription, settings, answerData, dataScore, totalScore, leaderNote } = item;
        const itemSetting = JSON.parse(settings || '[]')[0]
        const minMinutes = itemSetting?.minMinutes || 1
        const maxMinutes = itemSetting?.maxMinutes || 4
        const answerDataParse = (JSON.parse(answerData || '[]')[0] || {})
        const checkTimeSend = compareTime(itemSetting.editEndTime)
        const checkTimeOpen = compareTime(itemSetting.editStartTime)
        const checkTimeConfirm = compareTime(itemSetting.deadline)

        return (
            <View style={{ padding: 12 }}>
                {
                    item.isParent && <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                        <Icon name='tags' type='font-awesome-5' color={appcolor.primary} style={{ padding: 8, }} size={20} />
                        <Text style={{ color: appcolor.primary, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 7, marginLeft: 5, textAlignVertical: 'center' }}>{exerciseName}</Text>
                    </View>
                }
                <Card containerStyle={{ borderRadius: 12, padding: 8, margin: 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
                        <Text style={{ marginBottom: 4, color: appcolor.dark, fontWeight: '700', fontSize: 18 }}>
                            {itemName}
                        </Text>
                        <TouchableOpacity onPress={() => handlerViewDetailItem(item)}>
                            <Icon name='info-circle' type='font-awesome-5' color={appcolor.primary} size={24} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="clock" type="feather" size={16} color={appcolor.greylight} />
                        <Text style={{ marginLeft: 6, color: appcolor.greylight }}>
                            Ngày bắt đầu: {itemSetting.editStartTime}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="flag" type="feather" size={16} color={appcolor.greylight} />
                        <Text style={{ marginLeft: 6, color: appcolor.greylight }}>
                            Ngày kết thúc: {itemSetting.editEndTime}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Icon name="calendar" type="feather" size={16} color={appcolor.greylight} />
                        <Text style={{ marginLeft: 6, color: appcolor.greylight }}>
                            Hạn chót: {itemSetting.deadline}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 4 }}>
                        <Icon name="video" type="feather" size={16} color={appcolor.greylight} />
                        <Text style={{ marginLeft: 6, color: appcolor.greylight }}>
                            Thời lượng video yêu cầu: {minMinutes}-{maxMinutes} phút
                        </Text>
                    </View>
                    <Card.Divider style={{ padding: 4, marginBottom: 4 }} />
                    {
                        answerDataParse?.videoUri &&
                        <TouchableOpacity
                            onPress={() => handleSelectVideo(answerDataParse)}
                            style={{ flexDirection: 'row' }}>
                            <Video
                                source={{ uri: URLDEFAULT + answerDataParse.videoUri }}
                                paused
                                // onLoad={handleVideoLoad}
                                style={{ width: deviceWidth / 3, height: (deviceWidth / 3 - 30), backgroundColor: appcolor.dark, borderRadius: 10 }}
                                resizeMode="contain"
                            />
                            <View style={{ padding: 4 }}>
                                <Text style={{ marginTop: 10, fontWeight: 'bold', fontSize: 12, }}>
                                    Tên: {answerDataParse.name}
                                </Text>
                                <Text style={{ marginTop: 10, fontWeight: '400', fontSize: 12, }}>
                                    Gửi lúc: {moment.utc(answerDataParse.sendDate).utcOffset(7).format('DD/MM/YYYY HH:mm')}
                                </Text>
                                <Text style={{ marginTop: 10, fontWeight: '400', fontSize: 12, }}>
                                    Thời lượng: {Math.round(answerDataParse.duration)} giây
                                </Text>
                            </View>
                        </TouchableOpacity>
                    }
                    {
                        answerDataParse?.scoreTotal > 0 &&
                        <>
                            <Card.Divider style={{ padding: 4, marginBottom: 4 }} />
                            <TouchableOpacity
                                onPress={() => handlePressDetail(answerDataParse, index)}
                                style={{
                                    backgroundColor: appcolor.surface, borderRadius: 10, padding: 8,
                                }}
                            >
                                <View style={{ flexDirection: 'row', marginBottom: 6, }}>
                                    <Icon name="award" type="feather" size={18} color={appcolor.success} style={{ marginRight: 6 }} />
                                    <Text style={{ fontSize: 14, color: appcolor.greylight, fontWeight: '500', }}>Tổng điểm: {answerDataParse?.scoreTotal || 0}</Text>
                                </View>

                                {answerDataParse?.leaderNote && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, }}>
                                        <Icon name="message-square" type="feather" size={18} color={appcolor.info} style={{ marginRight: 6 }} />
                                        <Text style={{ fontSize: 14, fontWeight: '500', }}>Ghi chú: {answerDataParse?.leaderNote}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                        </>
                    }
                    {
                        (answerDataParse?.isLockSend !== 1) &&
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            paddingVertical: 8,
                        }}>
                            {
                                checkTimeSend !== 1 && checkTimeOpen == 1 &&
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', marginRight: 16, paddingHorizontal: 8,
                                        paddingVertical: 6, backgroundColor: appcolor.light, borderRadius: 8,
                                    }}
                                    onPress={() => handlerSelectSend(item, answerDataParse?.answerId || null, compareTime(itemSetting.editEndTime))}
                                >
                                    <Icon name="edit" type="feather" size={16} color={appcolor.primary} style={{ marginRight: 6 }} />
                                    <Text style={{ color: appcolor.primary, fontSize: 14, fontWeight: '600', }}>
                                        {answerDataParse?.videoUri ? 'Gửi lại bài' : 'Bắt đầu làm bài'}
                                    </Text>
                                </TouchableOpacity>
                            }
                            {answerDataParse?.videoUri && answerDataParse?.confirmSend !== 1 && checkTimeConfirm !== 1 &&
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', marginRight: 16, paddingHorizontal: 8,
                                        paddingVertical: 6, backgroundColor: appcolor.light, borderRadius: 8,
                                    }}
                                    onPress={() => handlerConfrimExercise(answerDataParse?.answerId || null)}
                                >
                                    <Icon name="upload" type="feather" size={16} color={appcolor.primary} style={{ marginRight: 6 }} />
                                    <Text style={{ color: appcolor.primary, fontSize: 14, fontWeight: '600', }}>Nộp bài</Text>
                                </TouchableOpacity>
                            }
                        </View>

                        // <View style={{ flexDirection: 'row' }}>
                        //     <Text
                        //         style={{ color: appcolor.primary, padding: 8 }}
                        //         onPress={() => navigation.navigate('SubmitExercise', { exercise: item })}
                        //     >
                        //         {answerDataParse.uri ? '👉 Gửi lại' : '👉 Bắt đầu làm bài'}
                        //     </Text>
                        //     <Text
                        //         style={{ color: appcolor.primary, padding: 8 }}
                        //         onPress={() => navigation.navigate('SubmitExercise', { exercise: item })}
                        //     >
                        //         Nộp bài
                        //     </Text>
                        // </View>
                    }
                </Card>
            </View>
        );
    };

    const onSelectYear = (searchInfo) => {
        setFilter({ ...filter, ...searchInfo })
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F2F4F6' }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Bài tập'}
                leftFunc={() => navigation.goBack()}
                iconRight='calendar-alt'
                rightFunc={() => SheetManager.show("sheetFitterData")}
            />
            <View style={{ flex: 1 }}>
                {
                    !loading && data.dataMain?.length > 0 &&
                    <FlatList
                        data={data.dataMain}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                }
            </View>
            <Overlay
                isVisible={modeOverlay.visible}
                overlayStyle={{ backgroundColor: appcolor.light, borderRadius: 16, margin: 4, width: deviceWidth * 0.9, maxHeight: deviceHeight * 0.7 }}
                onBackdropPress={toggleOverlay}
                animationType={"fade"}
            >
                {modeOverlay.contentOverlay}
            </Overlay>
            <ActionSheet containerStyle={{ backgroundColor: appcolor.light }} id="sheetFitterData">
                <View>
                    <YearMonthSelected option={filter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                    <TouchableOpacity onPress={() => loadData()} style={{ borderTopColor: appcolor.surface, borderTopWidth: 1, alignItems: 'center' }}>
                        <Text style={{ color: appcolor.primary, padding: 7, marginBottom: 12 }}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
        </View>
    );
};

export default ExerciseListScreen;
