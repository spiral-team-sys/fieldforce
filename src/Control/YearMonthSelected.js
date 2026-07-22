
import React, { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

export const YearMonthSelected = ({ option, contanerStyle, numMonth, onYearMonth }) => {
    const [listMonth, setMonth] = useState([])
    const [listYear, setYear] = useState([])
    const [selected, setSelected] = useState({})
    const { appcolor } = useSelector(state => state.GAppState)
    const monthColumn = numMonth > 0 ? numMonth : 4
    useEffect(() => {
        var _month = [], _year = []
        for (let index = 1; index < 13; index++) {
            _month.push({ "value": index, "name": `Tháng ${index}` })
        }
        setMonth(_month)
        //year bind
        const _currentY = new Date().getFullYear()
        const _currentM = new Date().getMonth() + 1
        for (let index = (_currentY - 3); index < (_currentY + 2); index++) {
            _year.push({ "value": index, "name": `Năm ${index}` })
        }
        if (option.year !== undefined)
            setSelected(option)
        else
            setSelected({ "month": _currentM, "monthname": `Tháng ${_currentM}`, "year": _currentY, "yearname": `Năm ${_currentY}` })
        _year = _year.sort((a, b) => { return a > b })
        setYear(_year)
        return () => false
    }, [])
    const onSelected = (item, tagId) => {
        const tagName = `${tagId}name`
        const edit = { ...selected }
        //Unselect
        if (item.value === selected[tagId]) {
            delete edit[tagId]
            delete edit[tagName]
        } else {
            edit[tagId] = item.value
            edit[tagName] = item.name
        }
        setSelected(edit)
        onYearMonth(edit)
    }
    return (
        <View style={[styles.container, { backgroundColor: appcolor.light }, contanerStyle]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {
                    listYear.map((y, i) => {
                        return (
                            <View style={[styles.yearItem, {
                                backgroundColor: selected.year === y.value ? appcolor.primary : appcolor.surface
                            }]}
                                key={`hada${i}`}>
                                <TouchableOpacity onPress={() => onSelected(y, "year")}>
                                    <Text numberOfLines={1} style={{ color: selected.year === y.value ? appcolor.white : appcolor.dark }}>{y.name}</Text>
                                </TouchableOpacity>
                            </View>)
                    })
                }
            </ScrollView>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginVertical: 7, width: '100%' }} />
            <View style={styles.monthWrap}>
                {
                    listMonth.map((item, i) => {
                        return (
                            <View key={`${i}jkao`} style={[styles.monthItem, { flexBasis: `${100 / monthColumn}%` }]}>
                                <TouchableOpacity
                                    onPress={() => onSelected(item, "month")}
                                    style={[styles.monthButton, {
                                        backgroundColor: selected.month === item.value ? appcolor.primary : appcolor.surface
                                    }]}>
                                    <Text numberOfLines={1} style={{ color: selected.month === item.value ? appcolor.white : appcolor.dark }}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>)
                    })
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 180,
        padding: 8,
    },
    yearItem: {
        minHeight: 35,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        marginEnd: 7,
    },
    monthWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthItem: {
        paddingEnd: 7,
        paddingBottom: 10,
    },
    monthButton: {
        minHeight: 36,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 7,
    },
})
