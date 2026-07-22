import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderBusiness } from "./HeaderBusiness";
import { ACTION_UPLOAD, MODE } from "./UtilityBusiness";
import { alertConfirm, alertNotify } from "../../Core/Utility";
import { UploadBusiness } from "../../Controller/BussinessTripController";
import { LoadingView } from "../../Control/ItemLoading/index"
import { ItemTripResults } from "./ItemTripResults";
import moment from "moment";
import { AppNameBuild, psvApp } from "../../Core/URLs";
import { SetBusinesTrips } from "../../Redux/action";
import UploadController from "../../Controller/UploadController";

export const TripResult = ({ onBack, onNext, isUpdate, isReConfirm, isPlusPlan = false, quotaData }) => {
    const { appcolor, tripResult, kpiinfo } = useSelector(state => state.GAppState)

    const [loading, setLoading] = useState(false)
    const isSubmittingRef = useRef(false)
    const dispatch = useDispatch()
    const typeArrow = { titleHeader: 'Tóm tắt chuyến đi', typeBack: 'arrow-back', typeForward: 'send' }
    const config = JSON.parse(kpiinfo?.reportItem || '{}')
    const isCopyEnabled = config.isCopy == 1

    const handlerSave = async () => {
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true

        alertConfirm("Xác nhận", "Bạn có đồng ý với chi phí công tác và thời gian của chuyến đi như trên, nếu có vui lòng xác nhận để gửi yêu cầu", async () => {
            setLoading(true)

            try {
                const itemTripsView = {
                    loadCalendar: false,
                    fromDate: tripResult.fromDate,
                    toDate: tripResult.toDate,
                    dateFilterFrom: tripResult.dateFilterFrom,
                    dateFilterTo: tripResult.dateFilterTo
                }

                const baseUpload = {
                    ...tripResult,
                    moneyLimit: (tripResult.moneyLimit - tripResult.totalSupport),
                    provinceWorking: JSON.stringify(tripResult.provinceList) || null,
                    movingSteps: JSON.stringify(tripResult.movingSteps) || null,
                    typeAdvance: JSON.stringify(tripResult.typeAdvance) || null,
                    typeVehicle: typeof tripResult.typeVehicle == 'object' ? JSON.stringify(tripResult.typeVehicle) || null : tripResult.typeVehicle,
                    listTypeCost: JSON.stringify(tripResult.listTypeCost) || null,
                }
                let action = ACTION_UPLOAD.INSERT
                // Update item
                if (isUpdate) {
                    action = ACTION_UPLOAD.UPDATE
                    // ReConfirm Actual
                } else if (isReConfirm) {
                    action = ACTION_UPLOAD.RECONFIRM
                } else {
                    if (AppNameBuild == psvApp)
                        if ((tripResult.fromDate.toString()).substring(0, 6) == moment().format('YYYYMM')) {
                            action = ACTION_UPLOAD.PLUS
                        }
                }
                await UploadController.PostFile()

                const uploadOnce = (payload) => {
                    return new Promise((resolve) => {
                        UploadBusiness(action, payload, async (data) => resolve(data))
                    })
                }

                const ranges = Array.isArray(tripResult.tripDateRanges) ? tripResult.tripDateRanges : []
                if (isCopyEnabled && !isUpdate && !isReConfirm && ranges.length > 0) {
                    for (let i = 0; i < ranges.length; i++) {
                        const r = ranges[i]
                        const itemUpload = {
                            ...baseUpload,
                            fromDate: r.fromDate,
                            toDate: r.toDate,
                            dateFilterFrom: r.dateFilterFrom,
                            dateFilterTo: r.dateFilterTo,
                            dayValue: r.dayValue,
                            nightValue: r.nightValue,
                            dayAndNight: r.dayAndNight,
                        }
                        await uploadOnce(itemUpload)
                    }
                    await dispatch(SetBusinesTrips(itemTripsView))
                    await onNext(MODE.RESULT)
                    alertNotify(`Đã gửi ${ranges.length} lịch công tác`)
                } else {
                    const data = await uploadOnce(baseUpload)
                    await dispatch(SetBusinesTrips(itemTripsView))
                    await onNext(MODE.RESULT)
                    alertNotify(data.messeger)
                }
            } finally {
                setLoading(false)
                isSubmittingRef.current = false
            }
        }, () => {
            isSubmittingRef.current = false
        }, 'Xác nhận', 'Huỷ')
    }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderBusiness
                typeArrow={typeArrow}
                onBack={() => onBack(MODE.RESULT)}
                onForward={handlerSave}
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu đăng kí' />
            {!loading && <ItemTripResults tripResult={tripResult} quotaData={quotaData} />}
        </View>
    )
}
