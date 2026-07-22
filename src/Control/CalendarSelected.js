import React, { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import { Calendar, LocaleConfig } from "react-native-calendars"
import { useSelector } from "react-redux"
import moment from "moment"
import { alertWarning } from "../Core/Utility"

/* ================= LOCALE ================= */
LocaleConfig.locales.vi = {
    monthNames: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    monthNamesShort: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: "Hôm nay"
}
LocaleConfig.defaultLocale = 'vi'

/* ================= COMPONENT ================= */
export const CalendarSelected = ({
    onChangeData,
    isBetween = true,
    inMonth = false,
    lockOutMonth = false,
    disibleFuture = false,
    theme = {},
    minDate = null,
    maxDate = null,
    defaultDate = null,
    fromDate = null,
    toDate = null,
    month = null
}) => {

    const { appcolor } = useSelector(state => state.GAppState)

    /* ================= THEME ================= */
    const themeCalendar = {
        calendarBackground: theme.calendarBackground || appcolor.surface,
        todayTextColor: appcolor.dark,
        selectedDayTextColor: appcolor.dark,
        todayBackgroundColor: appcolor.switchDisible,
        dayTextColor: appcolor.dark,
        monthTextColor: appcolor.dark,
        textDayFontSize: 13,
        textMonthFontSize: 15,
        textDayHeaderFontSize: 13,
        textMonthFontWeight: 'bold',
    }

    /* ================= MODE ================= */
    const mode = useMemo(() => {
        if (fromDate && toDate) return 'range'
        if (isBetween) return 'empty'
        return 'single'
    }, [fromDate, toDate, isBetween])

    /* ================= CALENDAR CONFIG ================= */
    const calendarConfig = useMemo(() => {
        const base =
            fromDate ||
            defaultDate ||
            moment().format('YYYY-MM-DD')
        const monthValue = Number(month)
        let currentDate = base

        if (monthValue >= 1 && monthValue <= 12) {
            const baseMoment = moment(base)
            const candidates = [-1, 0, 1].map((yearOffset) =>
                baseMoment.clone().add(yearOffset, 'year').month(monthValue - 1).startOf('month')
            )
            const currentByRange = (minDate || maxDate)
                ? candidates.filter((date) => {
                    const isAfterMin = !minDate || date.isSameOrAfter(moment(minDate).startOf('month'), 'day')
                    const isBeforeMax = !maxDate || date.isSameOrBefore(moment(maxDate).endOf('month'), 'day')
                    return isAfterMin && isBeforeMax
                }).sort((a, b) =>
                    Math.abs(a.diff(baseMoment, 'months')) - Math.abs(b.diff(baseMoment, 'months'))
                )[0]
                : null

            currentDate = (currentByRange || baseMoment.clone().month(monthValue - 1).startOf('month')).format('YYYY-MM-DD')
        }

        if (inMonth) {
            const m = moment(currentDate)
            return {
                current: m.format('YYYY-MM-DD'),
                minDate: m.startOf('month').format('YYYY-MM-DD'),
                maxDate: m.endOf('month').format('YYYY-MM-DD')
            }
        }

        return {
            current: currentDate,
            minDate,
            maxDate
        }
    }, [inMonth, fromDate, defaultDate, minDate, maxDate, month])

    /* ================= STATE ================= */
    const [dataCalendar, setDataCalendar] = useState({
        markedDates: {},
        markingType: 'period',
        startDate: '',
        endDate: ''
    })

    /* ================= BUILD SINGLE ================= */
    const buildSingle = (date) => ({
        [date]: {
            startingDay: true,
            endingDay: true,
            color: appcolor.yellowdark,
            textColor: appcolor.dark
        }
    })

    /* ================= BUILD RANGE ================= */
    const buildRange = (start, end) => {
        let marked = {}
        const diff = moment(end).diff(moment(start), 'days')

        marked[start] = {
            startingDay: true,
            color: appcolor.primary,
            textColor: appcolor.dark
        }

        for (let i = 1; i <= diff; i++) {
            const d = moment(start).add(i, 'day').format('YYYY-MM-DD')
            marked[d] =
                i < diff
                    ? { color: appcolor.secondary, textColor: 'white' }
                    : { endingDay: true, color: appcolor.primary, textColor: 'white' }
        }

        return marked
    }

    /* ================= INIT ================= */
    useEffect(() => {
        if (mode === 'range') {
            setDataCalendar({
                markedDates: buildRange(fromDate, toDate),
                markingType: 'period',
                startDate: fromDate,
                endDate: toDate
            })
            return
        }

        if (mode === 'empty') {
            setDataCalendar({
                markedDates: {},
                markingType: 'period',
                startDate: '',
                endDate: ''
            })
            return
        }

        const date = defaultDate || moment().format('YYYY-MM-DD')

        setDataCalendar({
            markedDates: buildSingle(date),
            markingType: 'period',
            startDate: date,
            endDate: ''
        })
    }, [mode, fromDate, toDate, defaultDate])

    /* ================= HANDLER BETWEEN ================= */
    const handlerBetweenDay = ({ dateString }) => {
        if (disibleFuture && moment(dateString).isAfter(moment(), 'day')) {
            alertWarning('Vui lòng chọn ngày hôm nay hoặc ngày quá khứ')
            return
        }

        if (!dataCalendar.startDate || dataCalendar.endDate) {
            setDataCalendar({
                markedDates: buildSingle(dateString),
                markingType: 'period',
                startDate: dateString,
                endDate: ''
            })
            return
        }

        if (
            lockOutMonth &&
            moment(dataCalendar.startDate).format('MM') !== moment(dateString).format('MM')
        ) {
            alertWarning('Vui lòng chọn ngày trong cùng tháng')
            return
        }

        if (moment(dateString).isBefore(dataCalendar.startDate)) return

        setDataCalendar({
            markedDates: buildRange(dataCalendar.startDate, dateString),
            markingType: 'period',
            startDate: dataCalendar.startDate,
            endDate: dateString
        })

        onChangeData?.(dataCalendar.startDate, dateString, moment(dateString).format('MM'))
    }

    /* ================= HANDLER SINGLE ================= */
    const handlerSingleDay = ({ dateString }) => {
        if (disibleFuture && moment(dateString).isAfter(moment(), 'day')) {
            alertWarning('Vui lòng chọn ngày hôm nay hoặc ngày quá khứ')
            return
        }

        setDataCalendar({
            markedDates: buildSingle(dateString),
            markingType: 'period',
            startDate: dateString,
            endDate: ''
        })

        onChangeData?.(dateString, moment(dateString).format('MM'))
    }

    /* ================= RENDER ================= */
    return (
        <View style={{ width: '100%' }}>
            <Calendar
                key={calendarConfig.current}
                style={{ borderRadius: 8 }}
                firstDay={1}
                current={calendarConfig.current}
                minDate={calendarConfig.minDate}
                maxDate={calendarConfig.maxDate}
                monthFormat={'MMMM - yyyy'}
                hideExtraDays
                theme={themeCalendar}
                markingType={dataCalendar.markingType}
                markedDates={dataCalendar.markedDates}
                onDayPress={isBetween ? handlerBetweenDay : handlerSingleDay}
            />
        </View>
    )
}
