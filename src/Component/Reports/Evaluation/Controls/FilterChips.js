import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Text } from '@rneui/base'
import { fontWeightBold } from '../../../../Themes/AppsStyle'

/**
 * FilterChips - reusable chip-based filter row
 * Props: title, keyName, options, filterValue, onSelect
 */
const FilterChips = ({ title, keyName, options = [], filterValue, onSelect }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const styles = StyleSheet.create({
        sectionContainer: { width: '100%', marginBottom: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.white, padding: 8 },
        sectionTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 6 },
        filterRow: { flexDirection: 'row', flexWrap: 'wrap' },
        filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 0.5, borderColor: appcolor.grayLight, marginRight: 6, marginBottom: 6 },
        filterChipActive: { backgroundColor: appcolor.primary, borderColor: appcolor.primary },
        filterChipText: { fontSize: 11, color: appcolor.dark, fontWeight: '500' },
        filterChipTextActive: { color: appcolor.light },
    })
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.filterRow}>
                {options.filter(item => item !== 'ALL').map((item, index) => {
                    const isActive = filterValue === item
                    return (
                        <TouchableOpacity
                            key={`${keyName}_${index}`}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => onSelect(keyName, isActive ? 'ALL' : item)}
                        >
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{item}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export default FilterChips
