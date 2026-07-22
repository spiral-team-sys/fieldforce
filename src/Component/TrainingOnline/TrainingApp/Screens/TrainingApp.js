import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { TrainingAPI } from '../../../../API/TrainingAPI'
import { useSelector } from 'react-redux'
import { HeaderCustom } from '../../../../Content/HeaderCustom'
import moment from 'moment'
import { fontWeightBold } from '../../../../Themes/AppsStyle'
import _ from 'lodash'
import LoadingViewLG from '../../../../Control/ItemLoading/LoadingViewLG'
import { RefreshControl } from 'react-native'
import { ToastSuccess } from '../../../../Core/Helper'
import { SheetManager } from 'react-native-actions-sheet'
import LessonSheet from '../Sheet/LessonSheet'
import { Icon } from '@rneui/base'

const activeList = {
    ALL: '0',
    EXPIRED: '1',
    ACTIVE: '2, 3',
}
const TrainingApp = ({ navigation, route }) => {
    const { appcolor, kpiinfo, tokenAutoLogin } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [loading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [refreshing, setRefreshing] = useState(false)
    const [dataSum, setDataSum] = useState([])
    const [statusFilter, setStatusFilter] = useState('0')
    const [statusHeader, setStatusHeader] = useState('')
    const [activeOptions, setActiveOptions] = useState(activeList.ALL)
    const [loadingFilter, setLoadingFilter] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        setPageNumber(1)
        const searchLessonInfo = {
            statusList: '0',
            activeList: activeList.ALL,
            pageNumber: 1,
            pageSize: 10,
            isCountResult: 1
        }
        await TrainingAPI.SearchLesson(searchLessonInfo, tokenAutoLogin, (res) => {
            setData(res.data)
            setDataMain(res.data)
            setDataSum(res.dataSum)
        })
        await setLoading(false)
    }

    const LoadMoreData = async () => {
        await setRefreshing(true)
        const searchLessonInfo = {
            statusList: statusFilter,
            activeList: activeOptions,
            pageNumber: pageNumber + 1,
            pageSize: 10,
            isCountResult: 1
        }
        setPageNumber(pageNumber + 1)
        await TrainingAPI.SearchLesson(searchLessonInfo, tokenAutoLogin, async (res) => {
            setData([...data, ...res.data])
            setDataMain([...dataMain, ...res.data])
            await setRefreshing(false)
        })
    }

    const goBack = () => {
        if (route.params?.isResultExam || route.params?.isPrepareExam) {
            navigation.replace('Home', { welcome: 0 })
        } else {
            navigation.goBack()
        }
    }

    const onFilter = () => {
        SheetManager.show('sheetLesson')
    }

    const onFilterHeader = async (item) => {
        const nextStatusHeader = statusHeader === item.code ? null : item.code
        const nextStatus = statusHeader === item.code ? '0' : (item.code === 'NotPass' ? '1,2' : '3')
        await setLoadingFilter(true)
        setStatusFilter(nextStatus)
        setPageNumber(1)
        const searchLessonInfo = {
            statusList: nextStatus,
            activeList: activeOptions,
            isCountResult: 1
        }
        await TrainingAPI.SearchLesson(searchLessonInfo, tokenAutoLogin, (res) => {
            setData(res.data)
            setDataMain(res.data)
            setDataSum(res.dataSum)
            setStatusHeader(nextStatusHeader)
        })
        await setLoadingFilter(false)
    }

    const handlerFilter = (data) => {
        setData(data.data)
        setDataMain(data.data)
        setDataSum(data.dataSum)
    }

    const onActiveOptions = (activeOptions) => {
        setActiveOptions(activeOptions)
        if (activeOptions === activeList.ALL) {
            LoadData()
        }
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { height: '100%', width: '100%', backgroundColor: appcolor.light },
        contentContainer: { flexGrow: 1, padding: 12 },
        lessonCard: { flex: 1, marginHorizontal: 8, backgroundColor: appcolor.light, borderRadius: 12, padding: 8, marginBottom: 8, alignItems: 'center', flexDirection: 'row', shadowColor: appcolor.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
        progressContainer: { marginTop: 8, alignItems: 'flex-start', justifyContent: 'center' },
        lessonContent: { flex: 1 },
        dateContainer: { flexDirection: 'row', alignItems: 'center' },
        dateText: { fontSize: 10, color: appcolor.dark, marginRight: 8 },
        lessonTitle: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        lessonProgress: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark, marginLeft: 8 },
        buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8, marginRight: 16 },
        buttonText: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.primary },
        button: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: appcolor.primary + '50', alignItems: 'center', justifyContent: 'center' },
        textBottom: { fontSize: 12, color: appcolor.dark, marginRight: 8, fontWeight: fontWeightBold, textAlign: 'right', },
        loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
        filterButton: { borderWidth: 1, borderColor: appcolor.primary, padding: 8, borderRadius: 12, marginRight: 12, flexDirection: 'row', alignItems: 'center' },
        filterText: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.dark },
        filterValue: { fontSize: 9, fontWeight: fontWeightBold, color: appcolor.light, textAlign: 'center', textAlignVertical: 'center' },
        filterValueContainer: { backgroundColor: appcolor.primary, borderRadius: 50, padding: 4, marginLeft: 4, width: 25, height: 25, alignItems: 'center', justifyContent: 'center' },
        loadingFilter: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
    })

    const renderLessonItem = ({ item, index }) => {
        const onPrepare = () => {
            navigation.navigate('prepareExam', { data: item })
        }

        const onLearn = () => {
            // navigation.navigate('trainingLearn', { data: item })
            ToastSuccess('Chức năng đang phát triển', 'Thông báo', 'top')
        }

        return (
            <View key={index} style={{ flexDirection: 'row' }}>
                <View style={styles.lessonCard}>
                    <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={{ uri: item.lessonThumbnailLink }} style={{ width: 50, height: 50, borderRadius: 8 }} resizeMode='center' />
                    </View>
                    <View style={styles.lessonContent}>
                        <Text style={styles.lessonTitle}>
                            {item.scheduleName}
                        </Text>
                        {item.lastTestDate.lD > 0 && <Text style={[styles.dateText, { fontWeight: fontWeightBold, }]}>Ngày làm bài: {moment(item.lastTestDate.sD, "DD/MM/YYYY HH:mm:ss:SSS").format('DD/MM/YYYY')}</Text>}
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>
                                {moment(item.fromDate.sD, "DD/MM/YYYY HH:mm:ss:SSS").format('DD/MM/YYYY')} - {moment(item.fromDate.sD, "DD/MM/YYYY HH:mm:ss:SSS").format('DD/MM/YYYY')}
                            </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            {item.scheduleType == 0 || item.scheduleType == 1 && <TouchableOpacity style={styles.button} onPress={onLearn}>
                                <Text style={styles.buttonText}>{'Học bài'}</Text>
                            </TouchableOpacity>}
                            {item.scheduleType == 3 && <TouchableOpacity style={styles.button} onPress={onPrepare}>
                                <Text style={styles.buttonText}>{'Làm bài'}</Text>
                            </TouchableOpacity>}
                        </View>

                        <View style={[styles.progressContainer, { minWidth: '15%', width: `${item.percent}%`, borderRadius: 12, backgroundColor: item.status == 0 ? appcolor.surface : item.status == 1 ? appcolor.warning : item.status == 2 ? appcolor.danger : appcolor.success }]}>
                            <Text style={[styles.lessonProgress, { color: item.status === 0 ? appcolor.dark : appcolor.light }]}>
                                {item.percent || 0}%
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name='book' type='font-awesome' size={12} color={appcolor.dark} style={{ marginRight: 4 }} />
                                <Text style={styles.textBottom}>{item.totalQuestion} câu</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name='clock-o' type='font-awesome' size={12} color={appcolor.dark} style={{ marginRight: 4 }} />
                                <Text style={[styles.textBottom, { color: appcolor.danger }]}>{moment(item.toDate.sD, "DD/MM/YYYY HH:mm:ss:SSS").fromNow()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name='check' type='font-awesome' size={12} color={appcolor.danger} style={{ marginRight: 4 }} />
                                <Text style={styles.textBottom}>{item.scheduleStatus}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const ListHeaderComponent = () => {
        return (
            <ScrollView style={{ marginBottom: 8, marginLeft: 8 }} horizontal>
                {dataSum.map((item, index) => {
                    const onPress = () => {
                        onFilterHeader(item)
                    }
                    return (
                        <TouchableOpacity activeOpacity={0.8} onPress={onPress} key={index} style={[styles.filterButton, { backgroundColor: item.code === statusHeader ? appcolor.primary : appcolor.light }]}>
                            <Text style={[styles.filterText, { color: item.code === statusHeader ? appcolor.light : appcolor.dark }]}>{item.code === 'NotPass' ? 'Chưa hoàn thành' : 'Hoàn thành'}</Text>
                            <View style={styles.filterValueContainer}>
                                <Text style={styles.filterValue}>{item.value}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        )
    }

    if (loading) return <LoadingViewLG isLoading={loading} styles={styles.loading} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom title={kpiinfo.menuNameVN || 'Đào tạo'} leftFunc={goBack} rightFunc={onFilter} iconRight={'filter'} />
            <View style={styles.contentContainer}>
                <FlashList
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={LoadData} />}
                    data={data}
                    renderItem={renderLessonItem}
                    estimatedItemSize={100}
                    extraData={[data, dataMain]}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={ListHeaderComponent}
                    ListFooterComponent={() => {
                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                {refreshing ?
                                    <ActivityIndicator size="small" color={appcolor.primary} /> :
                                    <Text style={{ fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark }}>Không có dữ liệu</Text>
                                }
                            </View>
                        )
                    }}
                    onEndReachedThreshold={0.1}
                    onEndReached={() => {
                        if (!loading && dataMain.length > 0 && data.length === dataMain.length) {
                            setPageNumber(pageNumber + 1)
                            LoadMoreData()
                        }
                    }}
                />
                {loadingFilter && <ActivityIndicator size="large" color={appcolor.primary} style={styles.loadingFilter} />}
            </View>
            <LessonSheet onUpdateData={handlerFilter} onActiveOptions={onActiveOptions} activeOptions={activeOptions} />
        </View>
    )
}

export default TrainingApp