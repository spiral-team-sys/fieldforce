import React, { memo, useCallback, useEffect, useState } from 'react';
import { Platform, View, Text, Keyboard, TouchableOpacity, KeyboardAvoidingView, ScrollView, Modal, Image } from "react-native";
import { Avatar, Switch, Icon } from '@rneui/themed'
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { formatPhone, groupDataByKey, isPhone, Message, MessageAction, MessageInfo, UUIDGenerator } from '../../Core/Helper';
import FormGroup from '../../Content/FormGroup';
import { AppNameBuild, lgApp, URLDEFAULT } from '../../Core/URLs';
import { deviceHeight, scaleSize } from '../../Themes/AppsStyle';
import { Employee } from '../../Controller/EmployeeController';
import { launchImageLibrary } from 'react-native-image-picker';

import { InsertPhotosItem } from '../../Controller/PhotoController';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { deviceWidth } from '../Home';
import { deleteItemPhotoByType, deleteItemPhotoDuplicate, getPhotoByType } from '../../Controller/DisplayController';
import NativeCamera from '../../Control/NativeCamera';
import { MultipleShowImage } from '../../Control/MultipleShowImage';
import UploadController from '../../Controller/UploadController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import CustomListView from '../../Control/Custom/CustomListView';
import { StyleSheet } from 'react-native';
import LoadingDefault from '../../Control/ItemLoading/LoadingDefault';
import DeviceCheckModal from './DeviceCheckModal';
// const HEADER_SIZE = Platform.OS == 'android' ? 10 : (isIphoneX() ? 50 : 20);

const EditProfileEmployee = ({ navigation, route }) => {
    const { employee, workinfo, onClose } = route.params;
    const { appcolor, userinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [employeeProfile, setEmployeeProfile] = useState({ ...employee, notes: '', confirmNote: '' })
    const userStatusList = JSON.parse(employee.workingStatusList || '[]')
    const [listReason, setListReason] = useState([])
    const [showProgress, setProgress] = useState(false)
    const [_, setMutate] = useState(false)
    const [isLoadData, setLoadData] = useState(false)
    const genderList = [{ id: 1, name: 'Nữ' }, { id: 2, name: 'Nam' }]
    const [genderId, setGenderId] = useState(employee.gender === 'Nam' ? 2 : 1)
    const [workingStatusId, setWorkingStatusId] = useState(0)
    const [loadCalendar, setLoadCalendar] = useState(0)
    const [dataCalendar, setDataCalendar] = useState({
        "markedDatesDefault": { [moment(new Date()).format('YYYY-MM-DD').toString()]: { color: '#ffa500', startingDay: workingStatusId === 3 ? false : true, textColor: appcolor.dark } },
        "markingTypeDefault": 'period',
        "markedDates": { [moment(new Date()).format('YYYY-MM-DD').toString()]: { color: '#ffa500', startingDay: employee.toDate?.toString() ? true : false, textColor: appcolor.dark } },
        "markingType": 'period',
        "isStartDay": true,
        "isEndDay": false,
        "startDate": moment(new Date()).format('YYYY-MM-DD').toString(),
        "endDate": ''
    })
    const lstReport = JSON.parse(kpiinfo?.reportItem || '{}')
    const [numDelete, setNumDelete] = useState(0)
    const [isShowDelete, setIsShowDelete] = useState(false)
    const [listPhotoItem, setListPhotoItem] = useState([{
        photoName: "camera",
        photoType: 'LEAVE_JOB',
        reportId: 0,
        shopId: 0,
        shopCode: '0',
        photoDate: moment(new Date()).format('YYYYMMDD').toString(),
        photoPath: null
    }])
    const [visible, setVisible] = useState(false)
    const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 })

    const [alertResign, setAlertResign] = useState('');
    const [showModal, setShowModal] = useState(false)

    const loadWorkingId = () => {
        userStatusList.forEach(it => {
            if (it.WorkingStatusName == employee.workingStatusName) {
                if (it.Id === 3) {
                    setListPhotoItem([{
                        photoName: "camera",
                        photoType: 'LEAVE_JOB',
                        reportId: 0,
                        shopId: 0,
                        shopCode: '0',
                        photoDate: moment(new Date()).format('YYYYMMDD').toString(),
                        photoPath: null
                    }])
                }
                setWorkingStatusId(it.Id);
            }
        })
    }
    const deletePhoto = async () => {
        await deleteItemPhotoByType('LEAVE_JOB')
    }
    const loadDataCalendar = () => {
        if (employee.toDate) {
            setLoadCalendar(loadCalendar + 1)
            handlerSelectCalendar(moment(employee.toDate?.toString()).format('YYYY-MM-DD'))
        }
    }
    const checkLoad = async () => {
        const reasonData = JSON.parse(employee.workingStatusReason || '[]')
        const { arr } = await groupDataByKey({
            arr: reasonData,
            key: 'GroupId'
        })
        await setListReason(arr)
    }
    useEffect(() => {
        checkLoad()
        deletePhoto()
        loadWorkingId()
        loadDataCalendar()
    }, [])
    //Handle Upload profile
    const uploadAction = async () => {
        await Keyboard.dismiss()
        let fromdateConvert = parseInt(moment(dataCalendar.startDate || new Date()).format('YYYYMMDD')) || ''
        let todateConvert = parseInt(moment(dataCalendar.endDate).format('YYYYMMDD')) || ''

        if (workingStatusId !== 3) {
            if (employeeProfile.status === 0) {
                MessageInfo('Vui lòng mở khoá tài khoản trước khi gửi!')
                return
            }
        } else if (workingStatusId === 3 && fromdateConvert < parseInt(moment(new Date()).format('YYYYMMDD')) && AppNameBuild !== lgApp) {
            if (employeeProfile.status === 1) {
                MessageInfo('Vui lòng khoá tài khoản trước khi gửi!')
                return
            }
            if (!employeeProfile.reasonId && listReason.length > 0) {
                MessageInfo('Vui lòng chọn lí do nghỉ việc trước khi gửi!')
                return
            }
        }

        if (workingStatusId === 3 && lstReport?.isShowResign === 1) {
            if (listPhotoItem.length <= 1 && lstReport?.isCheckResignImage === 1 && employee.isUncheckImage !== 1) {
                MessageInfo('Bạn chưa chụp hình đơn xin nghỉ việc của nhân viên!')
                return
            }
            if (!employeeProfile.reasonId && listReason.length > 0) {
                MessageInfo('Vui lòng chọn lí do nghỉ việc trước khi gửi!')
                return
            }
        }

        if (workingStatusId === 3 && alertResign !== '' && employeeProfile.contractNoticeDays > 0 && ((employeeProfile.notes || '').length === 0)) {
            MessageAction('Bạn chưa nhập ghi chú về việc vi phạm thời gian báo trước theo hợp đồng lao động của nhân viên. Bạn có chắc chắn muốn tiếp tục cho nhân viên nghỉ việc không ?',
                async () => {
                    listPhotoItem.length > 1 && await UploadController.PostFile()
                    UploadData()
                }
            )
            return
        }

        listPhotoItem.length > 1 && await UploadController.PostFile()
        UploadData()

    }

    const UploadData = async () => {
        Message('Chú ý', 'Bạn chắc chắn muốn lưu thay đổi?', async () => {
            let fromdateConvert = parseInt(moment(dataCalendar.startDate || new Date()).format('YYYYMMDD')) || ''
            let todateConvert = parseInt(moment(dataCalendar.endDate).format('YYYYMMDD')) || ''

            // check change image
            let uploadPhoto = employeeProfile.photo?.includes('file://')
            let photoinfo = {
                reportId: workinfo.reportId,
                shopId: workinfo.shopId,
                shopCode: 'profile',
                photoDate: parseInt(moment(new Date()).format('YYYYMMDD')),
                photoType: 'EMPLOYEE_' + employeeProfile.employeeId,
                guid: UUIDGenerator(),
                photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
                photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                photoPath: employeeProfile.photo,
                latitude: 0,
                longitude: 0,
                fileUpload: 0,
                dataUpload: 0
            }

            uploadPhoto && await InsertPhotosItem(photoinfo);
            let ImgName = employeeProfile.photo && employeeProfile.photo.substring(employeeProfile.photo.lastIndexOf('/') + 1, employeeProfile.photo?.length);
            let fileName = '/uploaded/' + moment(new Date()).format("YYYYMMDD") + '/' + ImgName
            //Upload Data
            const itemUpload = [{
                employeeId: employeeProfile.employeeId,
                fullName: `${employeeProfile.lastName || ''} ${employeeProfile.fisrtName || ''}`,
                fisrtName: employeeProfile.fisrtName || '',
                lastName: employeeProfile.lastName || '',
                gender: genderId,
                mobile: employeeProfile.mobile || '',
                email: employeeProfile.email || '',
                city: employeeProfile.city || '',
                photo: employeeProfile.photo?.includes('file://') ? fileName : employeeProfile.photo,
                workingStatusName: workingStatusId,
                fromDate: employeeProfile.workingStatusName != 'Nhân viên chính thức' ? fromdateConvert : '',
                toDate: (employeeProfile.workingStatusName != 'Nhân viên chính thức' && employeeProfile.workingStatusId !== 3) ? (todateConvert ? todateConvert : fromdateConvert) : '',
                status: employeeProfile.status,
                reasonId: workingStatusId === 3 ? (lstReport?.isUseDetailReason === 1 ? (employeeProfile.detailReasonId || null) : (employeeProfile.reasonId || null)) : null
            }]
            if (workingStatusId === 3 && lstReport?.isShowResign === 1) {
                await setProgress(true);
                let photoUpload = [];
                listPhotoItem?.forEach(element => {
                    if (element.photoPath != null) {
                        let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                        let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
                        photoUpload.push({ photo: fileName, photoPath: fileName });
                    }
                });
                const notifyContent = `Quản lí ${userinfo.employeeName} đã cho nhân viên ${employeeProfile.lastName || ''} ${employeeProfile.fisrtName || ''} nghỉ việc vào ngày ${fromdateConvert} lúc ${moment(new Date()).format('HH:mm')}.`
                const itemConfirm = {
                    "confirm": 1,
                    "employeeId": employeeProfile.employeeId,
                    "fromDate": fromdateConvert,
                    "id": 0,
                    "isDelete": 0,
                    "notes": employeeProfile.notes || '',
                    "confirmNote": employeeProfile.confirmNote || '',
                    "photo": JSON.stringify(photoUpload),
                    "reasonId": employeeProfile.reasonId,
                    "workingStatus": workingStatusId,
                    "notifyContent": notifyContent
                }
                const notifyNote = 'CONFIRM'
                const group = userinfo.groupType || 'SUP'
                const userId = employeeProfile.employeeId
                const result = await Employee.sendEmployeeResigns(JSON.stringify(itemConfirm), listPhotoItem, notifyNote, group, userId)
                if (result.statusId === 200 || (result.statusId === 500 && result.messager.includes('mail'))) {
                    if (employeeProfile.isSendMailById == 1) {
                        const json = { id: result.data[0]?.id || result.data[0]?.Id }
                        const resultSendMail = await Employee.sendMailEmployeeResign(JSON.stringify(json))
                        if (resultSendMail.statusId !== 200) {
                            MessageInfo('Xảy ra lỗi khi gửi mail')
                        } else {
                            MessageInfo('Đã gửi mail cho các phòng ban liên quan')
                        }
                    } else {
                        if (result.statusId === 500 && result.messager.includes('mail')) {
                            MessageInfo('Thông tin nghỉ việc đã được cập nhật nhưng có lỗi xảy ra khi gửi mail thông báo cho các phòng ban liên quan. Vui lòng liên hệ quản lí để biết thêm chi tiết.')
                        } else {
                            MessageInfo('Thông tin nghỉ việc đã được cập nhật và đã gửi mail thông báo cho các phòng ban liên quan.')
                        }
                    }
                    setLoadData(true)
                    await setProgress(false);
                } else if (result.statusId === 200 && result.data?.length === 0) {
                    MessageInfo('Thông tin cập nhật nghỉ việc đã tồn tại')
                    await setProgress(false);
                } else {
                    MessageInfo(result.messager)
                    await setProgress(false);
                }
            } else {
                await setProgress(true);
                const result = await Employee.uploadProfile(JSON.stringify(itemUpload), uploadPhoto)
                if (result) {
                    setEmployeeProfile((data) => ({ ...data, fullName: `${employeeProfile.lastName || ''} ${employeeProfile.fisrtName || ''}` }))
                    setLoadData(true)
                    await setProgress(false);
                } else {
                    await setProgress(false);
                }
            }
        })
    }

    const handleConfirmDevice = async (needCheck, devices) => {
        const jsonData = {
            employeeId: employeeProfile.employeeId,
            checkIMEI: needCheck ? 1 : 0,
            imei: JSON.stringify(devices)
        }
        const titleNotify = (needCheck && employeeProfile.checkIMEI !== 1 ? 'Quản lí đã bật kiểm tra thiết bị của bạn' : !needCheck && employeeProfile.checkIMEI === 1 ? 'Quản lí đã tắt kiểm tra thiết bị của bạn' : 'Quản lí đã cập nhật thay đổi kiểm tra thiết bị của bạn')
        const contentNotify = (needCheck && employeeProfile.checkIMEI !== 1 ? 'Từ bây giờ bạn sẽ bị giới hạn đăng nhập trên một số thiết bị đã đăng kí. Nếu bạn đăng nhập trên thiết bị khác, bạn sẽ không thể truy cập vào ứng dụng cho đến khi quản lí cho phép.' : !needCheck && employeeProfile.checkIMEI === 1 ? 'Từ bây giờ bạn có thể đăng nhập trên nhiều thiết bị khác nhau mà không bị giới hạn.' : 'Quản lí đã cập nhật thay đổi kiểm tra thiết bị của bạn, vui lòng liên hệ với quản lí để biết thêm chi tiết.')

        const jsonUpload = {
            userId: employeeProfile.employeeId,
            titleMessage: titleNotify,
            contentMessage: contentNotify,
            jsonRegistry: JSON.stringify(jsonData),
            pageName: null
        }
        MessageAction('Ban có chắc chắn muốn cập nhật thay đổi này không?', async () => {
            const result = await Employee.UpdateRegistryDevice(jsonUpload)
            if (result.statusId === 200) {
                setEmployeeProfile((data) => ({ ...data, checkIMEI: needCheck ? 1 : 0 }))
                MessageInfo(result.messager)
            } else {
                MessageInfo(result.messager)
            }
        })
    }



    // Handle change item
    const handleChangeField = useCallback((field, text) => {
        setEmployeeProfile(prev => {
            if (prev[field] === text) return prev;
            return { ...prev, [field]: text };
        });
    }, []);
    const handleEndEditingField = useCallback((field, event) => {
        const text = event?.nativeEvent?.text ?? '';

        if (field === 'email') {
            if (text.includes(' ')) {
                MessageInfo('Email không được nhập khoảng trắng!');
                return;
            } else if (text.length > 0 && !text.includes('@')) {
                MessageInfo('Email không đúng định dạng !');
                return;
            }
        }

        if (field === 'mobile') {
            if (text.length > 0) {
                const checkPhone = isPhone(text);
                if (!checkPhone) {
                    MessageInfo('Số điện thoại không đúng định dạng');
                    return;
                }
            }
        }

        setEmployeeProfile(prev => {
            if (prev[field] === text) return prev;
            return { ...prev, [field]: text };
        });
    }, []);

    const handleChangeItem = (field, event) => {
        if (field === 'email') {
            if (event.nativeEvent.text.includes(' ')) {
                MessageInfo('Email không được nhập khoảng trắng!');
                setMutate(e => !e)
                return;
            } else if (!event.nativeEvent.text.includes("@")) {
                MessageInfo('Email không đúng định dạng !');
                setMutate(e => !e)
                return;
            }
        }
        if (field === 'mobile') {
            const checkPhone = isPhone(event.nativeEvent.text)
            if (!checkPhone) {
                MessageInfo('Số điện thoại không đúng định dạng');
                setMutate(e => !e)
                return
            }
        }
        setEmployeeProfile((data) => ({ ...data, [field]: event.nativeEvent.text }))
    }

    const openSheet = useCallback((mode) => {
        mode === 'GENDER'
            ? SheetManager.show('ref_genderSheet')
            : (mode === 'WORKING_REASON'
                ? SheetManager.show('ref_reasonSheet')
                : (mode === 'DETAIL_REASON'
                    ? SheetManager.show('ref_detailReasonSheet')
                    : SheetManager.show('ref_workStatusSheet')));
    }, []);

    //Handle change WorkingStatus
    const onChangeWorkingStatus = (item) => {
        setWorkingStatusId(item.Id)
        if (item.Id === 3) {
            dataCalendar.markingTypeDefault = 'simple'
            deleteItemPhotoByType('LEAVE_JOB')
            setListPhotoItem([{
                photoName: "camera",
                photoType: 'LEAVE_JOB',
                reportId: 0,
                shopId: 0,
                shopCode: '0',
                photoDate: moment(new Date()).format('YYYYMMDD').toString(),
                photoPath: null
            }])

        } else {
            dataCalendar.markingTypeDefault = 'period'
        }
        setEmployeeProfile((data) => ({ ...data, workingStatusName: item.WorkingStatusName }))
        handlerSelectCalendar(null, item.Id)
    }
    //Handler change Reason
    const onChangeReason = (item) => {
        setEmployeeProfile((data) => ({ ...data, reasonId: item.ReasonName !== employeeProfile.reasonName ? item.ReasonId : null, reasonName: item.ReasonName !== employeeProfile.reasonName ? item.ReasonName : '' }))
        SheetManager.hide('ref_reasonSheet')
    }

    //Handler change Detail Reason
    const onChangeDetailReason = (item) => {
        setEmployeeProfile((data) => ({ ...data, detailReasonId: item.DetailReasonName !== employeeProfile.detailReasonName ? item.DetailReasonId : null, detailReasonName: item.DetailReasonName !== employeeProfile.detailReasonName ? item.DetailReasonName : '' }))
        SheetManager.hideAll()
    }

    const onChangeGender = (item) => {
        setGenderId(item.id)
        setEmployeeProfile((data) => ({ ...data, gender: item.name }))
        SheetManager.hideAll()
    }
    //Handle change Status
    const onChangeStatus = (value) => {
        if (!value) {
            if (workingStatusId === 2 || workingStatusId === 1) {
                MessageInfo('Vui lòng cập nhật trạng thái làm việc trước khi khoá tài khoản!')
                return
            }
        } else if (value) {
            if (workingStatusId !== 2 && workingStatusId !== 1) {
                MessageInfo('Vui lòng cập nhật trạng thái làm việc trước khi mở tài khoản!')
                return
            }
        }
        setEmployeeProfile((data) => ({ ...data, status: value ? 1 : 0 }))
    }

    //handle Upload Avatar
    const uploadFile = async () => {
        let options = {
            mediaType: 'photo', maxWidth: 800, maxHeight: 1024, quality: 0.4, includeBase64: true
        };
        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                let { assets } = await response
                await assets?.forEach(async res => {
                    await setEmployeeProfile((data) => ({ ...data, photo: res.uri }))
                });
            }
        });
    }

    // handle select date when change working status
    const handlerSelectCalendar = async (date, itemId) => {
        const dateString = date?.dateString || date
        if (dateString !== null && dateString !== undefined) {
            if (itemId !== 3 && itemId !== 4) {
                if (dataCalendar.startDate === dateString || dateString < dataCalendar.startDate) {
                    await setDataCalendar({
                        markedDates: dataCalendar.markedDatesDefault,
                        markingType: dataCalendar.markingTypeDefault,
                        isStartDay: false,
                        isEndDay: false,
                        startDate: '',
                        endDate: ''
                    })
                }

                if (!dataCalendar.isStartDay) {
                    const markedDates = {};
                    markedDates[dateString] = { startingDay: true, color: '#ffa500', textColor: appcolor.dark }
                    await setDataCalendar({
                        ...dataCalendar,
                        markedDates: markedDates,
                        markingType: 'period',
                        isStartDay: true,
                        isEndDay: false,
                        startDate: dateString,
                        endDate: ''
                    })
                } else {
                    const markedDates = dataCalendar.markedDates
                    //
                    let startDate = moment(dataCalendar.startDate);
                    let endDate = moment(dateString);
                    let range = endDate.diff(startDate, 'days')
                    if (range > 0) {
                        for (let i = 1; i <= range; i++) {
                            let tempDate = startDate.add(1, 'day');
                            tempDate = moment(tempDate).format('YYYY-MM-DD')
                            if (i < range) {
                                markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
                            } else {
                                markedDates[tempDate] = { endingDay: true, color: '#ffa500', textColor: 'white' };
                            }
                        }
                        await setDataCalendar({
                            ...dataCalendar,
                            markedDates: markedDates,
                            markingType: 'period',
                            isStartDay: false,
                            isEndDay: true,
                            startDate: dataCalendar.startDate,
                            endDate: moment(dateString).format('YYYY-MM-DD')
                        })
                    }
                }
            } else {
                const markedDates = {};
                markedDates[dateString] = { selected: true, color: appcolor.primary, textColor: appcolor.white, }
                await setDataCalendar({
                    ...dataCalendar,
                    markingType: 'simple',
                    markedDates: markedDates,
                    startDate: dateString
                })
                checkContract(employeeProfile, moment(new Date()).format('YYYY-MM-DD'), dateString)
            }
        } else {
            if (itemId !== 3 && itemId !== 4) {
                checkContract(employeeProfile, moment(new Date()).format('YYYY-MM-DD'), dateString)
                await setDataCalendar({
                    ...dataCalendar,
                    markedDates: dataCalendar.markedDatesDefault,
                    markingType: dataCalendar.markingTypeDefault,
                    isStartDay: false,
                    isEndDay: false,
                    startDate: '',
                    endDate: ''
                })
            } else {
                const today = moment(new Date()).format('YYYY-MM-DD')
                checkContract(employeeProfile, today, today)
                await setDataCalendar({
                    ...dataCalendar,
                    markingType: 'simple',
                    markedDates:
                        { [today]: { selected: true, color: appcolor.primary, textColor: appcolor.white } },
                    startDate: today,
                    endDate: ''
                })
            }

        }
    }

    const checkContract = (item, dateCheck, dateResign) => {
        const contractNoticeDays = item.contractNoticeDays || 0
        if (contractNoticeDays > 0 && dateCheck && dateResign) {
            const countDayResign = moment(dateResign, 'YYYY-MM-DD').diff(dateCheck, 'days');

            if (countDayResign < contractNoticeDays) {
                const dateLimit = moment(dateCheck).add(contractNoticeDays, 'days').format('YYYY-MM-DD')
                const dateLate = moment(dateLimit, 'YYYY-MM-DD').diff(dateResign, 'days');
                const costViolate = item?.salaryDefault ? ((countDayResign > contractNoticeDays ? contractNoticeDays : dateLate) * (item?.salaryDefault / 30)) : 0
                // item.alertItem = `*Cảnh báo vi phạm thời gian báo trước: \n- Số ngày nhân viên cần báo trước: ${contractNoticeDays} ngày\n- Số ngày nhân viên báo trước: ${countDayResign} ngày\n- Số ngày vi phạm: ${dateLate} ngày\n- Ngày nghỉ sớm nhất đúng quy định: ${dateLimit}`
                setAlertResign(`*Cảnh báo vi phạm thời gian báo trước: \n- Số ngày nhân viên cần báo trước: ${contractNoticeDays} ngày\n- Số ngày nhân viên báo trước: ${countDayResign} ngày\n- Số ngày vi phạm: ${dateLate > contractNoticeDays ? contractNoticeDays : dateLate} ngày\n- Ngày nghỉ sớm nhất đúng quy định: ${dateLimit}\n${costViolate > 0 ? `- Mức phạt vi phạm: ${costViolate.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}` : ''}${item?.noteResignByEmployee ? `\n- ${item.noteResignByEmployee}` : ''}`)
            } else {
                setAlertResign(`${item?.noteResignByEmployee ? `\n- ${item.noteResignByEmployee}` : ''}`)
            }
        }
    }
    const handleSelectImage = async (listPhotoItem, indexImage) => {
        setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage })
        setVisible(true)
    }
    const takePhoto = async () => {
        const guiIdPhoto = UUIDGenerator()
        let photoinfo = {
            "photoType": 'LEAVE_JOB',
            "dataUpload": 0,
            "fileUpload": 0,
            "shopId": 0,
            "photoPath": null,
            "guiId": guiIdPhoto,
            "photoDate": moment(new Date()).format("YYYYMMDD"),
            "photoTime": new Date().getTime(),
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        }
        NativeCamera.cameraStart(photoinfo, reloadpage);
    }
    const reloadpage = async () => {
        const itemPhotoByGuiId = await getPhotoByType('LEAVE_JOB')
        await setListPhotoItem([{
            photoName: "camera",
            photoType: 'LEAVE_JOB',
            reportId: 0,
            shopId: 0,
            shopCode: '0',
            photoDate: moment(new Date()).format('YYYYMMDD').toString(),
            photoPath: null
        }, ...itemPhotoByGuiId
        ])
    }

    const uploadFilePhoto = async () => {
        const guiIdPhoto = UUIDGenerator()
        let photoinfo = {};
        let options = {
            mediaType: 'photo', maxWidth: 800, maxHeight: 1024, quality: 0.4, includeBase64: true
        };

        await launchImageLibrary(options, async (response) => {
            if (!response.didCancel) {
                let { assets } = await response || []
                if (assets !== undefined) {
                    await assets?.forEach(async res => {
                        photoinfo = {
                            shopId: 0,
                            photoPath: res.uri,
                            photoDate: moment(new Date()).format("YYYYMMDD"),
                            photoType: "LEAVE_JOB",
                            photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
                            fileUpload: 0,
                            dataUpload: 0,
                            guid: guiIdPhoto,
                            photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
                        }
                        await InsertPhotosItem(photoinfo);
                        await reloadpage(guiIdPhoto)

                    });
                }
            }
        });
    }

    const RenderItemPhoto = ({ item, index, listPhotoItem }) => {
        const onLongPressImage = () => {
            item.isDelete = item.isDelete ? false : true;
            (item.photoPath !== null && !isShowDelete) ? setNumDelete(1) : setNumDelete(0)
            if (isShowDelete) {
                listPhotoItem.map(it => {
                    it.isDelete = false
                })
            }
            setIsShowDelete(e => !e)
        }
        const pressOnShowDelete = () => {
            const count = item.isDelete ? (numDelete - 1) : (numDelete + 1)
            item.isDelete = item.isDelete ? false : true;
            setNumDelete(count)
        }
        const onSelectImage = () => {
            handleSelectImage(listPhotoItem, index)
        }
        return (
            item.photoPath === null ?
                <TouchableOpacity key={index} style={styles.itemPhoto} onLongPress={() => listPhotoItem.length > 1 ? onLongPressImage() : null}
                    onPress={() => isShowDelete ? null : SheetManager.show('ref_takePhoto')}
                >
                    <Icon
                        color={appcolor.primary}
                        name={'camera'}
                        type='ionicon'
                        size={40}
                    />
                </TouchableOpacity>
                :
                <TouchableOpacity key={index} onLongPress={() => onLongPressImage()} onPress={() => isShowDelete ? pressOnShowDelete() : onSelectImage()} style={styles.itemPhoto}  >
                    <Image source={{ uri: item.photoPath }} style={styles.itemInputPhotoImage} />
                    {
                        isShowDelete &&
                        <View style={styles.itemInputPhotoDelete}>
                            <Icon
                                color={appcolor.red}
                                name={item.isDelete ? 'check-circle' : 'circle'}
                                type='font-awesome-5'
                                size={40}
                            />
                        </View>
                    }
                </TouchableOpacity>
        )
    }

    const deleteItemImage = async () => {
        listPhotoItem.map(it => {
            if (it.isDelete) {
                const list = listPhotoItem.filter(item => item.id !== it.id)
                deleteItemPhotoDuplicate(it)
                setListPhotoItem(list)
            }
        })
        setNumDelete(0)
        setIsShowDelete(e => !e)
    }

    const cancelDelete = () => {
        listPhotoItem.map(it => {
            it.isDelete = false
        })
        setNumDelete(0)
        setIsShowDelete(e => !e)
    }
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleNextStep = async (refNameNext, refNameCurrent) => {
        await SheetManager.hide(refNameCurrent)
        await SheetManager.show(refNameNext)
    }
    const handlePrevStep = async (refNameCurrent, refNamePrev) => {
        await SheetManager.hide(refNameCurrent)
        await SheetManager.show(refNamePrev)
    }
    const onBack = () => {
        onClose(isLoadData)
        navigation.goBack()
    }

    const styles = StyleSheet.create({
        loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        container: { flex: 1, backgroundColor: appcolor.light },
        itemInputRow: { flexDirection: 'row', width: '100%', paddingTop: 8, alignItems: 'center' },
        itemInputLabel: { flex: 3 / 10, color: appcolor.dark, padding: 5 },
        itemInputForm: { flex: 7 / 10, padding: 5, borderColor: appcolor.grey, borderBottomWidth: 0.5 },
        itemInputPhotoImage: { width: '100%', height: '100%', borderRadius: 12 },
        itemInputPhotoDelete: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12, justifyContent: 'center', alignItems: "center", backgroundColor: appcolor.black, opacity: 0.5 },
        profileContainer: { flex: 1 },
        profileInnerContainer: { overflow: 'hidden', paddingBottom: 5 },
        profileAvatarBox: { width: '100%', justifyContent: 'center', alignItems: 'center', height: deviceHeight / 4 + 40, backgroundColor: appcolor.light },
        avatarOverlay: { borderRadius: 20 },
        profileKeyboardAvoiding: { flex: 1, flexDirection: 'column', justifyContent: 'center', paddingBottom: 100, padding: 12 },
        switch: { marginLeft: 8 },
        fullName: { color: appcolor.dark, fontSize: scaleSize(26), fontWeight: '500' },
        itemInputPhoto: { flexDirection: 'row', width: '100%', paddingTop: 8, alignItems: 'center' },
        itemInputPhotoText: { flex: 3 / 10, color: appcolor.dark, padding: 5 },
        itemInputPhotoList: { flex: 7 / 10, width: deviceWidth / 4, height: deviceWidth / 4, backgroundColor: appcolor.surface, padding: 2, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" },
        itemPhoto: { width: deviceWidth / 4.8, height: deviceWidth / 4.8, backgroundColor: appcolor.light, margin: 5, borderRadius: 12, justifyContent: 'center', alignItems: "center" },
        deleteItemImage: { width: '100%', height: 70, backgroundColor: appcolor.light, alignItems: "center", padding: 10 },
        deleteItemImageText: { fontWeight: '400', fontSize: 18, color: appcolor.danger },
        takePhotoContainer: { padding: 8, width: '100%', height: '50%' },
        takePhotoContainerText: { padding: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        takePhotoContainerTextTitle: { color: appcolor.dark, fontSize: 17, fontWeight: '600' },
        containerButtonCamera: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 },
        buttonCamera: { padding: 5, width: '48%', justifyContent: 'center', alignItems: 'center', borderColor: appcolor.dark, borderWidth: 0.5, borderRadius: 10, backgroundColor: appcolor.light, },
        textCamera: { color: appcolor.dark, padding: 5 },
        indicatorStyle: { marginVertical: 15 },
        containerWork: { padding: 8 },
        containerWorkButton: { flexDirection: 'row', justifyContent: 'flex-end' },
        buttonWork: { marginBottom: 5, padding: 10, borderRadius: 5, backgroundColor: appcolor.primary, justifyContent: 'center', alignItems: 'center' },
        textWork: { color: appcolor.white, fontSize: 14, fontWeight: '500' },
        containerWorkList: { flexDirection: 'row', flexWrap: "wrap", marginBottom: 20, marginTop: 20 },
        itemWork: { padding: 10, borderRadius: 10, borderBottomColor: appcolor.grey, borderBottomWidth: 1, margin: 5 },
        containerReason: { flexDirection: 'row', marginBottom: 20, justifyContent: 'center', width: '100%' },
        statusRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        avatarAccessory: { shadowColor: 'white' },
        avatarContainer: { padding: 8 },
        statusActive: { color: appcolor.success },
        statusInactive: { color: appcolor.danger }
    })

    if (showProgress) return <LoadingDefault isLoading={showProgress} styles={styles.loadingView} />
    return (
        <View style={styles.container}>
            <HeaderCustom title={'Hồ sơ nhân viên'} leftFunc={onBack} rightFunc={() => isShowDelete ? null : (isKeyboardVisible ? Keyboard.dismiss() : uploadAction())} iconRight={'cloud-upload-alt'} />
            <View style={styles.profileContainer}>
                <View style={styles.profileInnerContainer}>
                    <View style={styles.profileAvatarBox}>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                onPress={uploadFile}
                                size={deviceHeight / 5}
                                source={employeeProfile.photo !== null ? {
                                    uri: employeeProfile.photo && (employeeProfile.photo.includes('file://') ?
                                        employeeProfile.photo :
                                        (URLDEFAULT + employeeProfile.photo))
                                } : require('../../Themes/Images/noimage.png')}
                                title={employeeProfile.fisrtName?.substring(0, 1) || 'S'}
                                overlayContainerStyle={styles.avatarOverlay}
                            >
                                <Avatar.Accessory style={styles.avatarAccessory} size={28} onPress={uploadFile} />
                            </Avatar>
                        </View>
                        <Text style={styles.fullName}>{employeeProfile.fullName || ''}</Text>
                        <View style={styles.statusRow}>
                            <Text style={employeeProfile.status == 1 ? styles.statusActive : styles.statusInactive}>
                                {employeeProfile.status == 1 ? 'Đang hoạt động' : 'Đã khóa'}
                            </Text>
                            {/* 
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowModal(true)}
                                style={styles.deviceButton}
                            >
                                <Icon
                                    name="phone-portrait"
                                    type="ionicon"
                                    size={20}
                                    color={appcolor.primary}
                                />
                                <Text style={styles.deviceText}>
                                    Thiết bị
                                </Text>
                            </TouchableOpacity> */}
                            <Switch
                                style={styles.switch}
                                ios_backgroundColor={appcolor.greydark}
                                trackColor={{ true: appcolor.success, false: appcolor.greylight }}
                                thumbColor={appcolor.dark}
                                value={employeeProfile.status == 1 || false}
                                onValueChange={onChangeStatus}
                            />
                        </View>
                    </View>
                </View>
                <KeyboardAvoidingView
                    style={styles.profileKeyboardAvoiding}
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ItemInput
                            value={`${employeeProfile.lastName || ''} ${employeeProfile.fisrtName || ''}`}
                            title={'Họ và Tên'}
                            field={'fullName'}
                            editable={false}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.fisrtName || ''}
                            title={'Họ'}
                            placeholder={'Nhập họ'}
                            field={'fisrtName'}
                            editable={true}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.lastName || ''}
                            title={'Tên'}
                            placeholder={'Nhập Tên'}
                            field={'lastName'}
                            editable={true}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.gender || ''}
                            title={'Giới tính'}
                            placeholder={'Giới tính'}
                            field={'gender'}
                            sheetMode={'GENDER'}
                            editable={false}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.mobile || ''}
                            title={'Số điện thoại'}
                            placeholder={'Nhập số điện thoại'}
                            field={'mobile'}
                            editable={true}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.email || ''}
                            title={'Email'}
                            placeholder={'Email'}
                            field={'email'}
                            editable={true}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.city || ''}
                            title={'Địa chỉ'}
                            placeholder={'Thành phố'}
                            field={'city'}
                            editable={true}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.workingDate || ''}
                            title={'Ngày vào làm'}
                            field={'workingDate'}
                            editable={false}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        <ItemInput
                            value={employeeProfile.workingStatusName || ''}
                            title={'Trạng thái LV'}
                            field={'workingStatusName'}
                            editable={false}
                            sheetMode={'WORKING_STATUS'}
                            appcolor={appcolor}
                            styles={styles}
                            workingStatusId={workingStatusId}
                            dataCalendar={dataCalendar}
                            openSheet={openSheet}
                            onChangeText={handleChangeField}
                            onEndEditing={handleEndEditingField}
                        />

                        {(employeeProfile.workingStatusName !== 'Nhân viên chính thức' || workingStatusId !== 2) && (
                            <View>
                                {employeeProfile.contractNoticeDays > 0 && alertResign?.length > 0 && workingStatusId == 3 && (
                                    <Text style={{ fontSize: 14, color: appcolor.danger, marginBottom: 8, marginHorizontal: 4 }}>
                                        {alertResign}
                                    </Text>
                                )}

                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ItemInput
                                        value={employeeProfile.workingStatusName || ''}
                                        title={'Từ ngày/đến ngày'}
                                        field={'date'}
                                        editable={false}
                                        appcolor={appcolor}
                                        styles={styles}
                                        workingStatusId={workingStatusId}
                                        dataCalendar={dataCalendar}
                                        openSheet={openSheet}
                                        onChangeText={handleChangeField}
                                        onEndEditing={handleEndEditingField}
                                    />
                                </View>

                                {((employeeProfile.workingStatusName == 'Nghỉ việc' || workingStatusId === 3) && listReason.length > 0) && (
                                    <ItemInput
                                        value={employeeProfile.reasonName || ''}
                                        title={'Lí do nghỉ'}
                                        placeholder={'chọn lí do nghỉ'}
                                        field={'workingStatusReason'}
                                        sheetMode={'WORKING_REASON'}
                                        editable={false}
                                        isMultiline={true}
                                        appcolor={appcolor}
                                        styles={styles}
                                        workingStatusId={workingStatusId}
                                        dataCalendar={dataCalendar}
                                        openSheet={openSheet}
                                        onChangeText={handleChangeField}
                                        onEndEditing={handleEndEditingField}
                                    />
                                )}

                                {((employeeProfile.workingStatusName == 'Nghỉ việc' || workingStatusId === 3) && lstReport?.isShowResign === 1) && (
                                    <View style={{ width: '100%' }}>
                                        <ItemInput
                                            value={employeeProfile.notes || ''}
                                            title={'Lí do chi tiết'}
                                            placeholder={'Nhập lí do chi tiết'}
                                            field={'notes'}
                                            editable={true}
                                            appcolor={appcolor}
                                            styles={styles}
                                            workingStatusId={workingStatusId}
                                            dataCalendar={dataCalendar}
                                            openSheet={openSheet}
                                            onChangeText={handleChangeField}
                                            onEndEditing={handleEndEditingField}
                                        />

                                        <ItemInput
                                            value={employeeProfile.confirmNote || ''}
                                            title={'Quản lí ghi chú'}
                                            placeholder={'Nhập ghi chú'}
                                            field={'confirmNote'}
                                            editable={true}
                                            appcolor={appcolor}
                                            styles={styles}
                                            workingStatusId={workingStatusId}
                                            dataCalendar={dataCalendar}
                                            openSheet={openSheet}
                                            onChangeText={handleChangeField}
                                            onEndEditing={handleEndEditingField}
                                        />

                                        <View style={styles.itemInputPhoto}>
                                            <Text style={styles.itemInputPhotoText}>{'Đơn xin nghỉ'}</Text>
                                            <View style={styles.itemInputPhotoList}>
                                                <CustomListView
                                                    horizontal={true}
                                                    data={listPhotoItem}
                                                    extraData={listPhotoItem}
                                                    renderItem={({ item, index }) => (
                                                        <RenderItemPhoto
                                                            item={item}
                                                            index={index}
                                                            listPhotoItem={listPhotoItem}
                                                        />
                                                    )}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                    {
                        isShowDelete &&
                        <TouchableOpacity onPress={() => numDelete > 0 ? deleteItemImage() : cancelDelete()} style={styles.deleteItemImage}>
                            <Text style={styles.deleteItemImageText}>{numDelete > 0 ? 'Xoá(' + numDelete + ')' : 'Huỷ'}</Text>
                        </TouchableOpacity>
                    }
                </KeyboardAvoidingView>
            </View>
            <ActionSheet
                id='ref_takePhoto'
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
            >
                <View style={styles.takePhotoContainer}>
                    <View style={styles.takePhotoContainerText}>
                        <Text style={styles.takePhotoContainerTextTitle}>Chụp Hình</Text>
                    </View>
                    <View style={styles.containerButtonCamera}>
                        <TouchableOpacity
                            style={styles.buttonCamera}
                            onPress={() => takePhoto()}>
                            <Text style={styles.textCamera}>Máy ảnh</Text>
                            <Icon color={appcolor.dark} name='camera' type='ionicon' size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 5, width: '48%', justifyContent: 'center', alignItems: 'center', borderColor: appcolor.primary, borderWidth: 0.5, borderRadius: 10, backgroundColor: appcolor.light, }}
                            onPress={() => uploadFilePhoto()}
                        >
                            <Text style={styles.textCamera} >Chọn ảnh</Text>
                            <Icon color={appcolor.dark} name='attach' type='ionicon' size={30} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
            <ActionSheet
                id={'ref_workStatusSheet'}
                closeOnPressBack={false}
                gestureEnabled={true}
                indicatorStyle={styles.indicatorStyle}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.darklight }}
            >
                <View style={styles.containerWork}>
                    <View style={styles.containerWorkButton}>
                        {
                            workingStatusId == 3 && <TouchableOpacity style={styles.buttonWork}
                                onPress={() => handleNextStep('ref_reasonSheet', 'ref_workStatusSheet')}><Text style={styles.textWork}>Tiếp</Text></TouchableOpacity>
                        }
                    </View>
                    {
                        employeeProfile.workingStatusName !== 'Nhân viên chính thức' &&
                        <Calendar
                            firstDay={1}
                            style={{ height: 370 }}
                            current={moment(dataCalendar.startDate?.toString() || new Date()).format("yyyy-MM-DD")}
                            monthFormat={'MM - yyyy'}
                            hideExtraDays={true}
                            onPressArrowLeft={subtractMonth => subtractMonth()}
                            onPressArrowRight={addMonth => addMonth()}
                            theme={{
                                backgroundColor: appcolor.light,
                                calendarBackground: appcolor.surface,
                                todayTextColor: appcolor.highlightDate,
                                selectedDayTextColor: appcolor.white,
                                dayTextColor: appcolor.dark,
                                monthTextColor: appcolor.dark
                            }}
                            markingType={dataCalendar.markingType}
                            markedDates={dataCalendar.markedDates}
                            onDayPress={(date) => handlerSelectCalendar(date, workingStatusId)}
                        />
                    }
                    <View style={styles.containerWorkList}>
                        {
                            userStatusList.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => onChangeWorkingStatus(item)}
                                        style={[styles.itemWork, { backgroundColor: item.WorkingStatusName == employeeProfile.workingStatusName ? appcolor.primary : appcolor.surface, }]}>
                                        <Text style={{ fontSize: 12, color: item.WorkingStatusName == employeeProfile.workingStatusName ? appcolor.white : appcolor.dark }}>{item.WorkingStatusName}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </ActionSheet>
            <ActionSheet
                id={'ref_genderSheet'}
                closeOnPressBack={false}
                gestureEnabled={true}
                indicatorStyle={{ marginVertical: 15, }}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.darklight }}
            >
                <View style={styles.containerReason}>
                    {
                        genderList.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => onChangeGender(item)}
                                    style={{ padding: 10, flex: 1, alignItems: 'center', borderRadius: 10, backgroundColor: item.name == employeeProfile.gender ? appcolor.primary : appcolor.surface, borderBottomColor: appcolor.grey, borderBottomWidth: 1, margin: 5 }}>
                                    <Text numberOfLines={1} style={{ color: item.name == employeeProfile.gender ? appcolor.white : appcolor.dark }}>{item.name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </ActionSheet>
            <ActionSheet
                id={'ref_reasonSheet'}
                closeOnPressBack={false}
                indicatorStyle={{ marginVertical: 15, }}
                indicatorColor={appcolor.primary}
                containerStyle={{ backgroundColor: appcolor.darklight }}
            >
                <View style={{ flexDirection: 'row', flexWrap: "wrap", marginBottom: 20, marginTop: 10, maxHeight: 400 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
                            <TouchableOpacity style={{ marginBottom: 5, padding: 10, borderRadius: 5, backgroundColor: appcolor.primary, justifyContent: 'center', alignItems: 'center' }} onPress={() => handlePrevStep('ref_reasonSheet', 'ref_workStatusSheet')}>
                                <Text style={{ color: appcolor.white, fontSize: 14, fontWeight: '500' }}>Trước</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                listReason.map((it, idx) => {
                                    return (
                                        <View key={`${it.id}${idx}_reasonItem`} style={{ padding: 4 }}>
                                            {it.isParent &&
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.transparent, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                                                    <Icon name='tag' color={appcolor.primary} type={"font-awesome-5"} size={16} style={{ marginEnd: 8 }} />
                                                    <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: appcolor.primary }}>{it.GroupName}</Text>
                                                </View>
                                            }
                                            <TouchableOpacity
                                                key={'itemResigns_' + idx}
                                                onPress={() => onChangeReason(it)}
                                                style={{ padding: 10, borderRadius: 10, backgroundColor: it.ReasonName == employeeProfile.reasonName ? appcolor.primary : appcolor.light, marginBottom: 4, marginLeft: 8 }}>
                                                <Text style={{ fontSize: 13, color: it.ReasonName == employeeProfile.reasonName ? appcolor.white : appcolor.dark }}>{it.ReasonName}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>
            </ActionSheet>
            <Modal
                id={'imageSheet'}
                visible={visible}
                containerStyle={{ flex: 1 }}
            >
                <MultipleShowImage key={'ShowItemImage'} listItem={dataPhoto.listPhoto} closeShowImage={() => setVisible(false)} indexItem={dataPhoto.indexImage} />
            </Modal>

            <DeviceCheckModal
                visible={showModal}
                data={JSON.parse(employeeProfile.imei || '[]')}
                checkIMEI={employeeProfile.checkIMEI}
                onClose={() => setShowModal(false)}
                onConfirm={async ({ needCheck, devices }) => {
                    handleConfirmDevice(needCheck, devices)
                }}
            />
            {
                showProgress && <View style={{
                    position: 'absolute', alignItems: 'center', alignSelf: "center",
                    marginTop: deviceHeight / 2
                }}><Progress.Circle thickness={1} size={65} indeterminate={true} />
                    <Text style={{ color: '#007AFF' }}>...</Text></View>
            }
        </View>
    )
}

const ItemInput = memo(({
    value,
    title,
    placeholder,
    field,
    editable,
    sheetMode,
    isMultiline = false,
    appcolor,
    styles,
    workingStatusId,
    dataCalendar,
    openSheet,
    onChangeText,
    onEndEditing,
    listPhotoItem,
    RenderItemPhoto,
}) => {
    return (
        <View style={styles.itemInputRow}>
            <Text style={styles.itemInputLabel}>{title}</Text>

            {(field !== 'date' && field !== 'photo') && (
                <FormGroup
                    containerStyle={styles.itemInputForm}
                    numberOfLines={1}
                    value={
                        (field === 'mobile'
                            ? value
                            : field === 'workingDate'
                                ? moment(value).format('DD/MM/YYYY')
                                : value) || ''
                    }
                    keyboardType={field === 'mobile' ? 'numeric' : 'default'}
                    iconRight={
                        (field === 'workingStatusName' ||
                            field === 'workingStatusReason' ||
                            field === 'detailReasonName')
                            ? 'caret-down'
                            : field === 'gender'
                                ? 'venus-mars'
                                : null
                    }
                    rightFunc={() => openSheet(sheetMode)}
                    editable={editable}
                    useClearAndroid={false}
                    multiline={isMultiline}
                    placeholder={placeholder}
                    placeholderColor={appcolor.greydark}
                    handleChangeForm={(text) => onChangeText(field, text)}
                    onEndEditing={(e) => onEndEditing(field, e)}
                    selectTextOnFocus
                />
            )}

            {field === 'date' && (
                <View
                    style={{
                        flex: 7 / 10,
                        padding: 5,
                        borderRadius: 5,
                        backgroundColor: appcolor.surface,
                        margin: 5,
                        borderColor: appcolor.greydark,
                        borderWidth: 0.2,
                        borderBottomWidth: 0.4,
                        justifyContent: 'center',
                        flexDirection: 'row'
                    }}
                >
                    <Text style={{ textAlign: 'center', padding: 5, color: appcolor.dark }}>
                        {moment(dataCalendar.startDate || new Date()).format('DD/MM/YYYY')}
                        {(workingStatusId !== 3 && workingStatusId !== 4) && ' - '}
                        {(workingStatusId !== 3 && workingStatusId !== 4) &&
                            moment(
                                dataCalendar.startDate
                                    ? (dataCalendar.endDate ? dataCalendar.endDate : dataCalendar.startDate)
                                    : new Date()
                            ).format('DD/MM/YYYY')}
                    </Text>
                </View>
            )}

            {field === 'photo' && (
                <View style={{ flex: 7 / 10 }}>
                    <CustomListView
                        horizontal
                        data={listPhotoItem}
                        extraData={listPhotoItem}
                        renderItem={({ item, index }) => (
                            <RenderItemPhoto
                                item={item}
                                index={index}
                                listPhotoItem={listPhotoItem}
                            />
                        )}
                    />
                </View>
            )}
        </View>
    );
});

export default EditProfileEmployee
