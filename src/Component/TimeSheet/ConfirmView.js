import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from "moment"
import React, { Fragment, useEffect, useState } from "react"
import { Image, ScrollView, View, Text, TouchableOpacity, TextInput } from "react-native"
import { Icon, SpeedDial } from '@rneui/themed'
import { useSelector } from "react-redux"
import NativeCamera from "../../Control/NativeCamera"
import { URLDEFAULT } from "../../Core/URLs"
const TIMESHEET = {
    DATA_SHEET: 'TABLE0',
    MASTERDATA: 'MASTER',
    CAMERA: 'Camera',
    GALLERY: 'Gallery'
}
import { deviceWidth } from "../../Core/Utility"
const widthImage = (deviceWidth / 2) - 28

export const ConfirmView = ({ data, onLock }) => {
    const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState)
    const [listOT, setListOT] = useState([])
    const [listShift, setListShift] = useState([])
    const [confirm, setConfirm] = useState({})
    const detail = JSON.parse(data.detail || '[]')
    const [open, setOpen] = useState(false)
    const [listPhoto, setPhoto] = useState([])
    const photoTemplate = {
        photoType: 'ISSUE_FILE',
        photoPath: null,
        reportId: kpiinfo.id,
        photoDate: moment(data.workDate, "YYYY-MM-DD").format('YYYYMMDD'),
        photoTime: moment().format('YYYYMMDDHHmmss'),
        shopId: 0
    }
    const onCheckBeforceLock = () => {
        if (confirm.shiftTS === undefined || confirm.shiftTS === null) {
            alert("Bạn chưa chọn ca xác nhận")
        } else if (confirm.noteTS === undefined || confirm.noteTS === null) {
            alert("Bạn chưa nhập ghi chú")
        }
        else {
            const _finalConfirm = { ...data, ...confirm }
            _finalConfirm.photoTimeSheet = JSON.stringify(listPhoto)
            onLock(_finalConfirm)
        }
    }
    useEffect(() => {
        AsyncStorage.getItem(TIMESHEET.MASTERDATA).then(jsonData => {
            const info = JSON.parse(jsonData)
            setListShift(info.table)
            setListOT(info.table1)
        })
        setConfirm({
            shiftTS: data.shiftTS,
            noteTS: data.noteTS,
            timeOT: data.timeOT
        })
        const photo = JSON.parse(data.photoTimeSheet || '[]')
        setPhoto(photo)
    }, [])
    const onSelectTag = (item, tagId) => {
        const tagName = `${tagId}name`
        const editConfirm = { ...confirm }
        if (item.value === confirm[tagId]) {
            delete editConfirm[tagId]
            delete editConfirm[tagName]
        } else {
            editConfirm[tagId] = item.value
            editConfirm[tagName] = item.nameVN || item.name
        }
        setConfirm(editConfirm)
    }
    const CardTemplate = ({ item, index }) => {
        return (
            <View key={`${index}02ma`}
                style={{ backgroundColor: data.color !== '' ? data.color : appcolor.light, borderRadius: 12, margin: 3, padding: 7 }}>
                <Image resizeMode="contain" style={{ width: widthImage, height: deviceWidth * 0.4 }}
                    source={{ uri: `${URLDEFAULT}${item?.photoPath}` }} />
                <Text style={{ color: appcolor.dark, fontSize: 12, textAlign: 'center' }}>
                    {item.attendantType % 2 === 0 ? 'CheckIn ' : 'CheckOut '}
                    {item.photoTime}
                </Text>
            </View>
        )
    }
    const showPhoto = (value) => {
        if (value.statusId === 200) {
            const _tempList = [...listPhoto]
            value.data?.forEach(file => {
                const _fileTemp = { ...photoTemplate, photoPath: file.uri, photoName: file.fileName }
                _tempList.push(_fileTemp)
            })
            setPhoto(_tempList)
        }
    }
    const onChoosePhoto = (MODE) => {
        const photo = { ...photoTemplate }
        if (MODE === TIMESHEET.CAMERA)
            NativeCamera.cameraStart(photo, value => showPhoto(value))
        else if (MODE === TIMESHEET.GALLERY)
            NativeCamera.imageGalleryLaunch(photo, value => showPhoto(value))
    }
    const photoView = ({ item, index }) => {
        const photoPath = item.photoPath?.includes('http') ? item.photoPath : `${URLDEFAULT}${item.photoPath}`
        return (
            <View key={`${index}kajhd`} style={{
                backgroundColor: appcolor.light, padding: 12,
                alignItems: 'center', justifyContent: 'flex-start', marginEnd: 7
            }}>
                <TouchableOpacity onPress={() => { }}>
                    <Image style={{ minWidth: 100, minHeight: 100 }}
                        source={{ uri: photoPath }} />
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ backgroundColor: appcolor.surface, margin: 7 }}>
            <ScrollView>
                <View style={{ flexDirection: 'row', backgroundColor: appcolor.light }}>
                    <Text style={{ flexGrow: 1, color: appcolor.dark, fontWeight: '600' }}>{data.employeeCode} {data.employeeName}</Text>
                    <Text numberOfLines={1} style={{}}>{moment(data.workDate, 'YYYY-MM-DD').format('dddd, DD MMMM yy')}</Text>
                </View>
                <ScrollView showsHorizontalScrollIndicator={false} style={{ flex: 1 }} horizontal>
                    {detail.map((v, i) => {
                        return (
                            <CardTemplate key={`${i}nkal`} item={v} index={i} />
                        )
                    })}
                </ScrollView>
                <View style={{ paddingTop: 0 }}>
                    <View>
                        <Text style={{ color: appcolor.dark, fontWeight: '600' }}>Thông tin chấm công</Text>
                    </View>
                    <View style={{ padding: 12, margin: 3, backgroundColor: appcolor.light }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ flexGrow: 1, color: appcolor.dark, fontSize: 10 }}>Ca làm việc</Text>
                            <Text style={{ color: appcolor.dark, textAlign: 'right', fontSize: 13, fontWeight: '600' }}>
                                {`${data.shiftType} - ${data.shiftName} ${data.timePlan || ''}`}
                            </Text>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginBottom: 3, width: '100%' }} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ flexGrow: 1, color: appcolor.dark, fontSize: 10 }}>Tổng thời gian</Text>
                            <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '600' }}>{`${data.timeActual || '0-'}`} </Text>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginBottom: 3, width: '100%' }} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ flexGrow: 1, color: appcolor.dark, fontSize: 10 }}>Số phút đi trễ</Text>
                            <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '600' }}>{`${data.timeLate || '0'}`} </Text>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginBottom: 3, width: '100%' }} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ flexGrow: 1, color: appcolor.dark, fontSize: 10 }}>Số phút về sớm</Text>
                            <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '600' }}>{`${data.timeEarlier || '0'}`} </Text>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginBottom: 3, width: '100%' }} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ flexGrow: 1, color: appcolor.dark, fontSize: 10 }}>Tăng ca(giờ)</Text>
                            <Text style={{ color: appcolor.dark, fontSize: 13, fontWeight: '600' }}>{`${data.timeOT || '0'}`} </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginEnd: 7, }}>
                        <Text style={{ flexGrow: 1, color: appcolor.dark, fontWeight: '600' }}>Thông tin xác nhận </Text>
                        {data.confirmedTime !== null && <Text style={{ textAlignVertical: 'center', fontWeight: '700', textDecorationLine: 'line-through', textAlign: 'right', fontSize: 10, color: appcolor.danger }}>
                            Xác nhận {data.confirmedTime || ''}</Text>
                        }
                    </View>
                    <View style={{ padding: 12, margin: 3, backgroundColor: appcolor.light }}>
                        <Text numberOfLines={1} style={{ color: appcolor.dark, padding: 3 }}>
                            Ca {confirm.shiftTSname || ''}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled style={{ height: 120 }}>
                            <View style={{
                                flexDirection: 'column', flexWrap: 'wrap',
                            }} >
                                {
                                    listShift.map((t, i) => {
                                        return (
                                            <Fragment key={`1e${i}a88a`}>
                                                <View key={`${i}assa`}
                                                    style={{
                                                        backgroundColor: t.value === confirm.shiftTS ? appcolor.primary : appcolor.surface,
                                                        borderRadius: 22, marginTop: 3, marginEnd: 3
                                                    }}>
                                                    <TouchableOpacity onPress={() => onSelectTag(t, "shiftTS")}>
                                                        <Text style={{
                                                            fontSize: 12,
                                                            padding: 7, color: t.value === confirm.shiftTS ? appcolor.light : appcolor.greylight
                                                        }}>{t.name}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </Fragment>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView>
                        <Text style={{ fontWeight: '700', color: appcolor.dark, padding: 3 }}>
                            Giờ tăng ca {confirm.timeOTname}
                        </Text>
                        <ScrollView horizontal>
                            {
                                listOT.map((t, i) => {
                                    return (
                                        <View key={`${i}jka`}
                                            style={{ backgroundColor: t.value === confirm.timeOT ? appcolor.primary : appcolor.surface, borderRadius: 22, marginEnd: 7 }}>
                                            <TouchableOpacity onPress={() => onSelectTag(t, "timeOT")}>
                                                <Text style={{
                                                    paddingTop: 3, paddingBottom: 3, paddingLeft: 7, paddingRight: 7,
                                                    color: t.value === confirm.timeOT ? appcolor.light : appcolor.greylight
                                                }}>{t.nameVN}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                    <View>
                        <Text style={{ color: appcolor.dark, fontWeight: '600' }}>Ghi chú</Text>
                        <TextInput multiline={true} numberOfLines={3}
                            editable={data.lock > 0 ? false : true}
                            onChangeText={(e) => setConfirm({ ...confirm, noteTS: e })}
                            placeholder="Nhập ghi chú..."
                            style={{
                                textAlignVertical: 'top', fontSize: 12, margin: 3,
                                backgroundColor: appcolor.light, zIndex: -2, color: appcolor.dark
                            }}>
                            {confirm.noteTS || ''}
                        </TextInput>
                    </View>
                    <View style={{ marginLeft: 7, marginEnd: 7, minHeight: 50 }}>
                        <Text style={{ color: appcolor.dark, fontWeight: '600' }}>Hình ảnh</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {listPhoto.map((item, index) => photoView({ item, index }))}
                        </ScrollView>
                    </View>
                    {
                        (userinfo.groupType === 'SUP' && (data.confirmedBy == null || data.confirmedBy == undefined || data.confirmedBy === userinfo.employeeId)) &&
                        <View style={{
                            display: data.lock > 0 ? 'none' : 'flex',
                            borderTopLeftRadius: 40, borderBottomLeftRadius: 40, borderRadius: 12, margin: 7,
                            flexDirection: 'row', backgroundColor: appcolor.light
                        }}>
                            <TouchableOpacity onPress={() => onCheckBeforceLock()} style={{ flexDirection: 'row', borderRadius: 42, alignItems: 'center', backgroundColor: appcolor.success }}>
                                <Icon size={20} name="lock" raised />
                                <Text style={{ color: appcolor.white, padding: 12 }}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    }

                </View>
            </ScrollView>
            {
                (userinfo.groupType === 'SUP') &&
                <SpeedDial
                    style={{ display: data.lock > 0 ? 'none' : 'flex' }}
                    isOpen={open}
                    icon={{ name: 'add-a-photo', color: '#fff' }}
                    openIcon={{ name: 'close', color: '#fff' }}
                    onOpen={() => setOpen(!open)}
                    onClose={() => setOpen(!open)}>
                    <SpeedDial.Action
                        icon={{ name: 'camera', color: '#fff' }}
                        title="Chụp hình"
                        onPress={() => onChoosePhoto(TIMESHEET.CAMERA)}
                    />
                    <SpeedDial.Action
                        icon={{ name: 'photo', color: '#fff' }}
                        title="Chọn từ thư viện"
                        onPress={() => onChoosePhoto(TIMESHEET.GALLERY)}
                    />
                </SpeedDial>
            }
        </View>
    )
}