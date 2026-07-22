import React, { useEffect, useState } from 'react'
import { TrainingAPI } from '../../../../API/TrainingAPI'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceEventEmitter, StyleSheet, Text } from 'react-native'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { HeaderCustom } from '../../../../Content/HeaderCustom'
import { useSelector } from 'react-redux'
import { deviceHeight, fontWeightBold } from '../../../../Themes/AppsStyle'
import { Icon } from '@rneui/base'
import { FlashList } from '@shopify/flash-list'
import LoadingViewLG from '../../../../Control/ItemLoading/LoadingViewLG'
import moment from 'moment'
import { ToastError } from '../../../../Core/Helper'

const PrepareExam = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { data, isPrepareExam } = route.params
    const [dataExam, setDataExam] = useState([])
    const [loading, setLoading] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [message, setMessage] = useState('')
    const LoadData = async () => {
        await setLoading(true)
        const value = await AsyncStorage.getItem('AutoLoginTrainee')
        const { erpToken } = JSON.parse(value)
        const isDoingExam = await AsyncStorage.getItem('isDoingExam')
        const { isDoing, totalTimeLocal, timer, lastUpdateTime } = JSON.parse(isDoingExam) || {}
        await TrainingAPI.PrepareBeforeExam({ scheduleSysCode: data.scheduleSysCode }, erpToken, async (res) => {
            if (res.sysCode == 1) {
                setMessage(res.sysName)
            } else {
                setMessage('')
                setDataExam(res)
                if (isDoing && timer > 0) {
                    const now = Date.now()
                    const lastUpdate = lastUpdateTime || now
                    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000)
                    const newTimeLeft = Math.max(0, timer - elapsedSeconds)
                    setIsDoing(isDoing)

                    AsyncStorage.setItem('isDoingExam', JSON.stringify({
                        timer: newTimeLeft,
                        isDoing: newTimeLeft > 0,
                        totalTimeLocal: totalTimeLocal || timer,
                        lastUpdateTime: now,
                        times: res.times
                    }))
                }
            }
            setIsDoing(isDoing)
        })
        await setLoading(false)
    }

    useEffect(() => {
        const _load = DeviceEventEmitter.addListener('reloadExam', () => {
            LoadData()
        })
        LoadData()
        return () => {
            _load.remove()
        }
    }, [data])

    const styles = StyleSheet.create({
        mainContainer: { height: '100%', width: '100%' },
        title: { fontSize: 18, fontWeight: fontWeightBold, color: appcolor.dark, paddingHorizontal: 12, marginTop: 8 },
        iconContainer: { alignItems: 'flex-start', justifyContent: 'center', width: '100%', padding: 12 },
        icon: { borderRadius: 50, borderWidth: 1, borderColor: appcolor.primary, padding: 8, margin: 8 },
        containerIcon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        buttonDoExam: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: appcolor.primary, padding: 12, borderRadius: 12, width: '90%', },
        textDoExam: { color: appcolor.light, fontSize: 16, fontWeight: fontWeightBold, textAlign: 'center' },
        containerRules: { height: '100%', width: '100%', padding: 12 },
        viewContainerRules: { flexDirection: 'row', justifyContent: 'flex-start', padding: 12 },
        textRules: { fontSize: 14, color: appcolor.dark },
        dot: { width: '5%', fontSize: 20 },
        titleRules: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        containerTextRules: { width: '90%' },
        textTimeLeft: { fontSize: 12, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        textErrorMessage: { fontSize: 14, color: appcolor.danger, fontWeight: fontWeightBold, textAlign: 'center', marginBottom: 12 },
        loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }
    })
    const onDoExam = () => {
        const now = moment()
        const from = moment(data.fromDate.sD, 'DD/MM/YYYY HH:mm:ss')
        const to = moment(data.toDate.sD, 'DD/MM/YYYY HH:mm:ss')
        if (!dataExam.isAllowExam && from.isAfter(now)) {
            ToastError('Thông báo', `Chưa tới giờ làm, bài thi bắt đầu lúc ${from.format('HH:mm:ss')}`)
            return
        } else if (!dataExam.isAllowExam && to.isBefore(now)) {
            ToastError('Thông báo', `Đã hết giờ làm, bài thi kết thúc lúc ${to.format('HH:mm:ss')}`)
            return
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'trainingExam', params: { data: data, times: dataExam.times } }]
            })
        }
    }
    const goBack = () => {
        if (isPrepareExam) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'traineeApp', params: { isPrepareExam: true } }]
            })
        } else {
            navigation.goBack()
        }
    }
    const renderRules = ({ item, index }) => {
        return (
            <View style={styles.viewContainerRules} key={index}>
                <Text style={[styles.dot, { color: item.value ? appcolor.danger : appcolor.dark }]}>• </Text>
                <Text style={[styles.textRules, { color: item.value ? appcolor.danger : appcolor.dark }]}>{item.name}</Text>
            </View>
        )
    }

    if (loading) return <LoadingViewLG isLoading={loading} styles={styles.loading} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom title={'Khoá học'} leftFunc={goBack} />
            <Text style={styles.title}>{dataExam.lessonName}</Text>
            {dataExam?.listRule?.length > 0 && (
                <View style={styles.iconContainer}>
                    <View style={styles.containerIcon}>
                        <Icon style={styles.icon} name='list' type='font-awesome' size={20} color={appcolor.primary} />
                        <View style={styles.containerTextRules}>
                            <Text style={[styles.textRules, { fontWeight: fontWeightBold, color: appcolor.primary }]}>{dataExam.totalQuestion}</Text>
                            <Text style={styles.textRules}>{'câu hỏi trắc nghiệm'}</Text>
                        </View>
                    </View>
                    <View style={styles.containerIcon}>
                        <Icon style={styles.icon} name='clock-o' type='font-awesome' size={20} color={appcolor.primary} />
                        <View style={styles.containerTextRules}>
                            <Text style={[styles.textRules, { fontWeight: fontWeightBold, color: appcolor.primary }]}>{dataExam.timer} phút</Text>
                            <Text style={styles.textRules}>{'thời gian làm bài'}</Text>
                        </View>
                    </View>
                    <View style={styles.containerIcon}>
                        <Icon style={styles.icon} name='shield' type='font-awesome' size={20} color={appcolor.primary} />
                        <View style={styles.containerTextRules}>
                            <Text style={[styles.textRules, { fontWeight: fontWeightBold, color: appcolor.primary }]}>{dataExam.target}%</Text>
                            <Text style={styles.textRules}>{'tối thiểu để nhận chứng chỉ'}</Text>
                        </View>
                    </View>
                    <View style={styles.containerIcon}>
                        <Icon style={styles.icon} name='repeat' type='font-awesome' size={20} color={appcolor.primary} />
                        <View style={styles.containerTextRules}>
                            <Text style={[styles.textRules, { fontWeight: fontWeightBold, color: appcolor.primary }]}>{`${dataExam.times}/${dataExam.numOfTest} lần`}</Text>
                            <Text style={styles.textRules}>{`bạn có ${dataExam.numOfTest} lần để hoàn thành bài kiểm tra`}</Text>
                        </View>
                    </View>
                </View>
            )}
            {message !== '' && message !== undefined && <Text style={styles.textErrorMessage}>{message}</Text>}
            {dataExam.listRule?.length > 0 && (
                <View style={styles.containerRules}>
                    <Text style={styles.titleRules}>{'Vui lòng đọc kỹ quy định sau: '}</Text>
                    <View style={{ height: 1, backgroundColor: appcolor.dark, width: '100%', marginVertical: 12 }} />
                    <FlashList
                        data={dataExam.listRule}
                        extraData={[dataExam.listRule]}
                        renderItem={renderRules}
                        estimatedItemSize={100}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 10 }} />}
                    />
                </View>
            )}
            {data.errorMessage !== '' && data.errorMessage !== undefined && <Text style={styles.textErrorMessage}>{data.errorMessage}</Text>}
            <TouchableOpacity activeOpacity={0.8} style={[styles.buttonDoExam, { backgroundColor: dataExam.isAllowExam ? appcolor.primary : appcolor.greydark }]} onPress={onDoExam}>
                <Text style={styles.textDoExam}>{`${isDoing ? 'Tiếp tục làm bài' : dataExam.isAllowExam ? 'Bắt đầu ngay' : 'Khoá bài làm'}`}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default PrepareExam