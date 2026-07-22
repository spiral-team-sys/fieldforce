import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Text } from '@rneui/base'
import { fontWeightBold } from '../../../../Themes/AppsStyle'

/**
 * FilterList - reusable vertical list filter
 * Props: title, keyName, options, filterValue, onSelect, getSubTitle, renderItem
 *   renderItem(item, isActive, onPressToggle) — custom item renderer; overrides default if provided
 */
const FilterList = ({ title, keyName, options = [], filterValue, onSelect, getSubTitle, renderItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const styles = StyleSheet.create({
        sectionContainer: { width: '100%', marginBottom: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.white, padding: 8 },
        sectionTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 6 },
        listOptionWrap: { width: '100%' },
        listOptionItem: { width: '100%', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.white, marginBottom: 6 },
        listOptionItemActive: { backgroundColor: appcolor.primary, borderColor: appcolor.primary },
        listOptionTitle: { fontSize: 12, color: appcolor.dark, fontWeight: '600' },
        listOptionTitleActive: { color: appcolor.light },
        listOptionSubTitle: { fontSize: 11, color: appcolor.placeholderText, marginTop: 2 },
        listOptionSubTitleActive: { color: appcolor.light },
    })
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.listOptionWrap}>
                {options.filter(item => item !== 'ALL').map((item, index) => {
                    const isActive = filterValue === item
                    const onPressToggle = () => onSelect(keyName, isActive ? 'ALL' : item)
                    if (renderItem) {
                        return <React.Fragment key={`${keyName}_list_${index}`}>{renderItem(item, isActive, onPressToggle)}</React.Fragment>
                    }
                    const subTitle = getSubTitle ? getSubTitle(item) : ''
                    return (
                        <TouchableOpacity
                            key={`${keyName}_list_${index}`}
                            style={[styles.listOptionItem, isActive && styles.listOptionItemActive]}
                            onPress={onPressToggle}
                        >
                            <Text style={[styles.listOptionTitle, isActive && styles.listOptionTitleActive]}>{item}</Text>
                            {!!subTitle && <Text style={[styles.listOptionSubTitle, isActive && styles.listOptionSubTitleActive]}>{subTitle}</Text>}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export default FilterList
