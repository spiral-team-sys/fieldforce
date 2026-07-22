import React, { useMemo } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { fontWeightBold, styleDefault } from "../../../../../Themes/AppsStyle"
import { useSelector } from "react-redux"

const FilterSheet = ({ filterDataBy, groupType }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const styles = useMemo(() => StyleSheet.create({
        ...styleDefault(appcolor),
        container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
        optionBtn: { padding: 8, width: '30%', borderRadius: 33, borderWidth: 0.5, borderColor: appcolor.grey, marginHorizontal: 4 },
        titleNameView: { textAlign: 'center', fontSize: 13, fontWeight: fontWeightBold, color: appcolor.primary },
    }), [appcolor])

    const getBackgroundColor = (type) => {
        return groupType === type ? appcolor.primary : appcolor.light
    }
    const getBorderColor = (type) => {
        return groupType === type ? appcolor.primary : appcolor.grey
    }
    const getTextColor = (type) => {
        return groupType === type ? appcolor.light : appcolor.grey
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: getBackgroundColor('EMPLOYEE'), borderColor: getBorderColor('EMPLOYEE') }]}
                onPress={() => filterDataBy('EMPLOYEE')}>
                <Text style={[styles.titleName, styles.titleNameView, { color: getTextColor('EMPLOYEE') }]}>Nhân viên</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: getBackgroundColor('SHOP'), borderColor: getBorderColor('SHOP') }]}
                onPress={() => filterDataBy('SHOP')}>
                <Text style={[styles.titleName, styles.titleNameView, { color: getTextColor('SHOP') }]}>Cửa hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: getBackgroundColor('POSITION'), borderColor: getBorderColor('POSITION') }]}
                onPress={() => filterDataBy('POSITION')}>
                <Text style={[styles.titleName, styles.titleNameView, { color: getTextColor('POSITION') }]}>Chức vụ</Text>
            </TouchableOpacity>
        </View>
    )
}

export default FilterSheet
