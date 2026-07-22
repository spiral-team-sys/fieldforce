import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Text } from '@rneui/base'
import { removeVietnameseTones } from '../../../../Core/Helper'
import { SearchData } from '../../../../Control/SearchData/SearchData'
import FilterList from '../Controls/FilterList'
import ShopItem from '../Items/ShopItem'
import _ from 'lodash'

/**
 * StepShop - Step 2: select shop
 * Props: shopOptions, filter, onSelectFilter, dataMain, searchShop, onSearchShop
 */
const StepShop = ({ shopOptions = [], filter, onSelectFilter, dataMain = [], searchShop, onSearchShop }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const normalizeText = (value) => removeVietnameseTones(String(value || '')).toLowerCase().trim()
    const styles = StyleSheet.create({
        sectionContainer: { width: '100%', marginBottom: 10, borderRadius: 10, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.white, padding: 8 },
        subTitleName: { fontSize: 11, fontWeight: '500', color: appcolor.placeholderText, marginBottom: 8 },
    })
    return (
        <>
            <SearchData
                placeholder="Tìm cửa hàng"
                onSearchData={onSearchShop}
            />
            <FilterList
                title={`Cửa hàng (${shopOptions.filter(o => o !== 'ALL').length})`}
                keyName="shop"
                options={shopOptions.filter(o => o === 'ALL' || normalizeText(o).includes(normalizeText(searchShop)))}
                filterValue={filter.shop}
                onSelect={onSelectFilter}
                renderItem={(shopName, isActive, onPressToggle) => {
                    const matched = _.filter(dataMain, e => {
                        const byArea = filter.area === 'ALL' || e.area === filter.area
                        const byProvince = filter.province === 'ALL' || e.province === filter.province
                        return byArea && byProvince && e.shopName === shopName
                    })
                    const shopCode = matched[0]?.shopCode || '--'
                    const employeeNames = matched.map(e => e.employeeName).filter(Boolean).join(', ')
                    return (
                        <ShopItem
                            name={shopName}
                            shopCode={shopCode}
                            employeeNames={employeeNames}
                            isActive={isActive}
                            onPress={onPressToggle}
                        />
                    )
                }}
            />
        </>
    )
}

export default StepShop
