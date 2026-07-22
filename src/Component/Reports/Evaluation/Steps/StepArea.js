import React from 'react'
import { useSelector } from 'react-redux'
import { removeVietnameseTones } from '../../../../Core/Helper'
import { SearchData } from '../../../../Control/SearchData/SearchData'
import FilterChips from '../Controls/FilterChips'
import FilterList from '../Controls/FilterList'
import ProvinceItem from '../Items/ProvinceItem'
import _ from 'lodash'

/**
 * StepArea - Step 1: select area and province
 * Props: areaOptions, provinceOptions, filter, onSelectFilter, dataMain, searchArea, onSearchArea
 */
const StepArea = ({ areaOptions = [], provinceOptions = [], filter, onSelectFilter, dataMain = [], searchArea, onSearchArea }) => {
    const normalizeText = (value) => removeVietnameseTones(String(value || '')).toLowerCase().trim()

    return (
        <>
            <SearchData
                placeholder="Tìm khu vực hoặc tỉnh/thành"
                onSearchData={onSearchArea}
            />
            <FilterChips
                title={`Khu vực (${areaOptions.filter(o => o !== 'ALL').length})`}
                keyName="area"
                options={areaOptions.filter(o => o === 'ALL' || normalizeText(o).includes(normalizeText(searchArea)))}
                filterValue={filter.area}
                onSelect={onSelectFilter}
            />
            <FilterList
                title={`Tỉnh/Thành phố (${provinceOptions.filter(o => o !== 'ALL').length})`}
                keyName="province"
                options={provinceOptions.filter(o => o === 'ALL' || normalizeText(o).includes(normalizeText(searchArea)))}
                filterValue={filter.province}
                onSelect={onSelectFilter}
                renderItem={(provinceName, isActive, onPressToggle) => {
                    const matched = _.filter(dataMain, e =>
                        (filter.area === 'ALL' || e.area === filter.area) && e.province === provinceName
                    )
                    const employeeCount = matched.length
                    const shopCount = _.uniqBy(matched, 'shopId').length
                    return (
                        <ProvinceItem
                            name={provinceName}
                            employeeCount={employeeCount}
                            shopCount={shopCount}
                            isActive={isActive}
                            onPress={onPressToggle}
                        />
                    )
                }}
            />
        </>
    )
}

export default StepArea
