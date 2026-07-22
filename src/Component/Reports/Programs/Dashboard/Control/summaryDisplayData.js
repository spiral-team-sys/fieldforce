const getString = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

const getNumber = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/,/g, '').replace(/\s/g, '')
        if (!normalized.length) return 0
        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
    }

    return 0
}

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.rows)) return payload.rows
    if (payload && typeof payload === 'object') return [payload]
    return []
}

const normalizeTypeData = (value) => getString(value).toUpperCase().replace(/\s+/g, '_')

const pickFirstText = (row, aliases = [], fallback = '') => {
    for (let i = 0; i < aliases.length; i += 1) {
        const value = getString(row?.[aliases[i]])
        if (value) return value
    }
    return fallback
}

const pickFirstNumber = (row, aliases = []) => {
    for (let i = 0; i < aliases.length; i += 1) {
        const value = getNumber(row?.[aliases[i]])
        if (value || value === 0) return value
    }
    return 0
}

export const DISPLAY_SORT_OPTIONS = {
    SHOP: 'SHOP',
    DISTRIBUTOR: 'DISTRIBUTOR',
    PROGRAM: 'PROGRAM',
}

export const DISPLAY_STATUS_OPTIONS = {
    ALL: 'ALL',
    PASS: 'PASS',
    FAIL: 'FAIL',
}

export const DEFAULT_DISPLAY_FILTER_SORT = {
    keyword: '',
    status: DISPLAY_STATUS_OPTIONS.ALL,
    sortBy: DISPLAY_SORT_OPTIONS.SHOP,
}

export const getDisplayRows = (payload) => {
    const rows = getRows(payload)
    return rows.filter((row) =>
        normalizeTypeData(row?.typeData || row?.TypeData || row?.type || row?.Type) === 'DISPLAY'
    )
}

export const isDisplayPassRow = (row) => {
    const actual = pickFirstNumber(row, [
        'actual', 'actualDisplay', 'displayActual', 'displayCount', 'passCount',
    ])
    const target = pickFirstNumber(row, [
        'target', 'targetDisplay', 'displayTarget', 'targetCount', 'totalTarget',
    ])

    if (target > 0) return actual >= target
    return false
}

export const isDisplayFailRow = (row) => !isDisplayPassRow(row)

export const applyDisplayFilterSort = (payload, filterSort = DEFAULT_DISPLAY_FILTER_SORT) => {
    const rows = getDisplayRows(payload).map((row, index) => {
        const distributorName = pickFirstText(row, ['dealerName'])
        const distributorCode = pickFirstText(row, ['dealerCode'])
        const shopName = pickFirstText(row, ['shopName'])
        const shopCode = pickFirstText(row, ['shopCode'])
        const programName = pickFirstText(row, ['programName'])

        return {
            ...row,
            _displayKey: `${index}-${shopName}-${programName}-${distributorName}`,
            _shopName: shopName,
            _shopCode: shopCode,
            _programName: programName,
            _distributorName: distributorName,
            _distributorCode: distributorCode,
        }
    })

    const keyword = getString(filterSort?.keyword).toLowerCase()
    let filteredRows = rows

    if (keyword) {
        filteredRows = filteredRows.filter((row) => {
            const haystack = [
                row._shopName,
                row._shopCode,
                row._programName,
                row._distributorName,
                row._distributorCode,
            ].join(' ').toLowerCase()
            return haystack.includes(keyword)
        })
    }

    if (filterSort?.status === DISPLAY_STATUS_OPTIONS.PASS) {
        filteredRows = filteredRows.filter(isDisplayPassRow)
    } else if (filterSort?.status === DISPLAY_STATUS_OPTIONS.FAIL) {
        filteredRows = filteredRows.filter(isDisplayFailRow)
    }

    const sortBy = filterSort?.sortBy || DISPLAY_SORT_OPTIONS.SHOP
    const sortMap = {
        [DISPLAY_SORT_OPTIONS.SHOP]: (row) => `${row._shopName} ${row._programName} ${row._distributorName}`,
        [DISPLAY_SORT_OPTIONS.DISTRIBUTOR]: (row) => `${row._distributorName} ${row._shopName} ${row._programName}`,
        [DISPLAY_SORT_OPTIONS.PROGRAM]: (row) => `${row._programName} ${row._shopName} ${row._distributorName}`,
    }

    const sorter = sortMap[sortBy] || sortMap[DISPLAY_SORT_OPTIONS.SHOP]
    return [...filteredRows].sort((a, b) => sorter(a).localeCompare(sorter(b), 'vi', { sensitivity: 'base' }))
}

export const getDisplayMetricData = (payload) => {
    const rows = getDisplayRows(payload)
    const shopMap = new Map()
    const distributorSet = new Set()
    const programSet = new Set()

    rows.forEach((row, index) => {
        const shopKey = pickFirstText(row, ['shopId'], `display-shop-${index}`)
        const distributorKey = pickFirstText(row, ['dealerCode'])
        const programKey = pickFirstText(row, ['programId'])
        const actual = pickFirstNumber(row, [
            'actual', 'actualDisplay', 'displayActual', 'displayCount', 'passCount',
        ])
        const target = pickFirstNumber(row, [
            'target', 'targetDisplay', 'displayTarget', 'targetCount', 'totalTarget',
        ])

        if (distributorKey) distributorSet.add(distributorKey)
        if (programKey) programSet.add(programKey)

        if (!shopMap.has(shopKey)) {
            shopMap.set(shopKey, { actual: 0, target: 0 })
        }

        const current = shopMap.get(shopKey)
        current.actual += actual
        current.target += target
    })

    const shopList = Array.from(shopMap.values())
    const shopTotal = shopList.length
    const actualTotal = shopList.reduce((sum, item) => sum + item.actual, 0)
    const targetTotal = shopList.reduce((sum, item) => sum + item.target, 0)
    const metTargetCount = shopList.reduce((sum, item) => {
        if (item.target > 0) return item.actual >= item.target ? sum + 1 : sum
        return sum
    }, 0)
    const notMetTargetCount = Math.max(shopTotal - metTargetCount, 0)

    // Row-level execution counts (mỗi row = 1 lần thực hiện)
    const execTotal = rows.length
    const execPassCount = rows.reduce((sum, row) => {
        const actual = pickFirstNumber(row, [
            'actual', 'actualDisplay', 'displayActual', 'displayCount', 'passCount',
        ])
        const target = pickFirstNumber(row, [
            'target', 'targetDisplay', 'displayTarget', 'targetCount', 'totalTarget',
        ])
        return target > 0 && actual >= target ? sum + 1 : sum
    }, 0)
    const execFailCount = Math.max(execTotal - execPassCount, 0)

    return {
        shopTotal,
        distributorTotal: distributorSet.size,
        programTotal: programSet.size,
        metTargetCount,
        notMetTargetCount,
        passRate: shopTotal > 0 ? (metTargetCount / shopTotal) * 100 : 0,
        notMetRate: shopTotal > 0 ? (notMetTargetCount / shopTotal) * 100 : 0,
        completionRate: targetTotal > 0 ? (actualTotal / targetTotal) * 100 : 0,
        actualSaleTotal: actualTotal,
        targetSaleTotal: targetTotal,
        execTotal,
        execPassCount,
        execFailCount,
        execPassRate: execTotal > 0 ? (execPassCount / execTotal) * 100 : 0,
    }
}
