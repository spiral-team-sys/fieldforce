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

const safeParseArray = (value) => {
    if (Array.isArray(value)) return value
    if (!value && value !== 0) return []

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch (e) {
        return []
    }
}

const pickMetricFromRows = (rows = [], aliases = []) => {
    for (let i = 0; i < rows.length; i += 1) {
        const value = pickFirstNumber(rows[i], aliases)
        if (value > 0) return value
    }
    return 0
}

export const DELIVERY_SORT_OPTIONS = {
    SHOP: 'SHOP',
    DISTRIBUTOR: 'DISTRIBUTOR',
    PROGRAM: 'PROGRAM',
}

export const DELIVERY_STATUS_OPTIONS = {
    ALL: 'ALL',
    PASS: 'PASS',
    FAIL: 'FAIL',
}

export const DEFAULT_DELIVERY_FILTER_SORT = {
    keyword: '',
    status: DELIVERY_STATUS_OPTIONS.ALL,
    sortBy: DELIVERY_SORT_OPTIONS.SHOP,
}

export const getDeliveryRows = (payload) => {
    const rows = getRows(payload)
    return rows.filter((row) =>
        normalizeTypeData(row?.typeData || row?.TypeData || row?.type || row?.Type) === 'DELIVERY'
    )
}

export const isDeliveryPassRow = (row) => {
    const actual = pickFirstNumber(row, [
        'actual', 'Actual', 'actualDelivery', 'ActualDelivery', 'deliveryActual', 'DeliveryActual', 'deliveryCount', 'DeliveryCount', 'passCount', 'PassCount',
    ])
    const target = pickFirstNumber(row, [
        'target', 'Target', 'targetDelivery', 'TargetDelivery', 'deliveryTarget', 'DeliveryTarget', 'targetCount', 'TargetCount', 'totalTarget', 'TotalTarget',
    ])
    if (target > 0) return actual >= target
    return false
}

export const isDeliveryFailRow = (row) => !isDeliveryPassRow(row)

export const applyDeliveryFilterSort = (payload, filterSort = DEFAULT_DELIVERY_FILTER_SORT) => {
    const rows = getDeliveryRows(payload).map((row, index) => {
        const distributorName = pickFirstText(row, ['dealerName', 'DealerName', 'distributorName', 'DistributorName'])
        const distributorCode = pickFirstText(row, ['dealerCode', 'DealerCode', 'distributorCode', 'DistributorCode'])
        const shopName = pickFirstText(row, ['shopName', 'ShopName'])
        const shopCode = pickFirstText(row, ['shopCode', 'ShopCode'])
        const programName = pickFirstText(row, ['programName', 'ProgramName'])

        return {
            ...row,
            _deliveryKey: `${index}-${shopName}-${programName}-${distributorName}`,
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

    if (filterSort?.status === DELIVERY_STATUS_OPTIONS.PASS) {
        filteredRows = filteredRows.filter(isDeliveryPassRow)
    } else if (filterSort?.status === DELIVERY_STATUS_OPTIONS.FAIL) {
        filteredRows = filteredRows.filter(isDeliveryFailRow)
    }

    const sortBy = filterSort?.sortBy || DELIVERY_SORT_OPTIONS.SHOP
    const sortMap = {
        [DELIVERY_SORT_OPTIONS.SHOP]: (row) => `${row._shopName} ${row._programName} ${row._distributorName}`,
        [DELIVERY_SORT_OPTIONS.DISTRIBUTOR]: (row) => `${row._distributorName} ${row._shopName} ${row._programName}`,
        [DELIVERY_SORT_OPTIONS.PROGRAM]: (row) => `${row._programName} ${row._shopName} ${row._distributorName}`,
    }

    const sorter = sortMap[sortBy] || sortMap[DELIVERY_SORT_OPTIONS.SHOP]
    return [...filteredRows].sort((a, b) => sorter(a).localeCompare(sorter(b), 'vi', { sensitivity: 'base' }))
}

export const getDeliveryMetricData = (payload) => {
    const rows = getDeliveryRows(payload)
    const shopMap = new Map()
    const distributorSet = new Set()
    const programSet = new Set()
    const awardTypeSet = new Set()

    rows.forEach((row, index) => {
        const shopKey = pickFirstText(row, ['shopId'], `delivery-shop-${index}`)
        const distributorKey = pickFirstText(row, ['dealerCode'])
        const programKey = pickFirstText(row, ['programId'])
        const actual = pickFirstNumber(row, ['actual'])
        const target = pickFirstNumber(row, ['target'])
        const awardType = pickFirstText(row, ['awardType', 'AwardType', 'award_type', 'typeAward', 'TypeAward', 'awardName', 'AwardName', 'award_name'])
        const awardDetail = safeParseArray(row?.AwardDetail || row?.awardDetail)

        if (distributorKey) distributorSet.add(distributorKey)
        if (programKey) programSet.add(programKey)
        if (awardType) awardTypeSet.add(awardType)
        awardDetail.forEach((awardItem) => {
            const awardName = pickFirstText(awardItem, ['name', 'Name', 'awardName', 'AwardName'])
            if (awardName) awardTypeSet.add(awardName)
        })

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
            'actual', 'Actual', 'actualDelivery', 'ActualDelivery', 'deliveryActual', 'DeliveryActual', 'deliveryCount', 'DeliveryCount', 'passCount', 'PassCount',
        ])
        const target = pickFirstNumber(row, [
            'target', 'Target', 'targetDelivery', 'TargetDelivery', 'deliveryTarget', 'DeliveryTarget', 'targetCount', 'TargetCount', 'totalTarget', 'TotalTarget',
        ])
        return target > 0 && actual >= target ? sum + 1 : sum
    }, 0)
    const execFailCount = Math.max(execTotal - execPassCount, 0)
    const execPassRate = execTotal > 0 ? (execPassCount / execTotal) * 100 : 0

    // Award metrics
    const awardTypeCount = awardTypeSet.size
    const totalAwardQty = rows.reduce((sum, row) => {
        const directAwardQty = pickFirstNumber(row, [
            'awardQty', 'AwardQty', 'award_qty', 'awardQuantity', 'AwardQuantity', 'totalAward', 'TotalAward', 'l_total_award', 'awardCount', 'AwardCount', 'award_count',
        ])
        if (directAwardQty > 0) return sum + directAwardQty

        const awardDetail = safeParseArray(row?.AwardDetail || row?.awardDetail)
        const detailQty = awardDetail.reduce((awardSum, awardItem) => {
            const quantity = pickFirstNumber(awardItem, ['quantity', 'Quantity', 'qty', 'Qty', 'count', 'Count'])
            return awardSum + quantity
        }, 0)
        return sum + detailQty
    }, 0)

    const directShopTotal = pickMetricFromRows(rows, ['shopTotal', 'ShopTotal', 'totalStore', 'TotalStore', 'l_total_store', 'L_TOTAL_STORE'])
    const directPassShop = pickMetricFromRows(rows, ['metTargetCount', 'MetTargetCount', 'shopPass', 'ShopPass', 'l_delivery_shop_pass', 'L_DELIVERY_SHOP_PASS'])
    const directFailShop = pickMetricFromRows(rows, ['notMetTargetCount', 'NotMetTargetCount', 'shopFail', 'ShopFail', 'l_shop_not_pass', 'L_SHOP_NOT_PASS'])
    const directPassCount = pickMetricFromRows(rows, ['execPassCount', 'ExecPassCount', 'passCount', 'PassCount', 'l_delivery_pass_count', 'L_DELIVERY_PASS_COUNT'])
    const directTurnCount = pickMetricFromRows(rows, ['execTotal', 'ExecTotal', 'turnCount', 'TurnCount', 'l_turns', 'L_TURNS'])
    const directAwardType = pickMetricFromRows(rows, ['awardTypeCount', 'AwardTypeCount', 'l_total_award_type', 'L_TOTAL_AWARD_TYPE'])
    const directAwardQty = pickMetricFromRows(rows, ['totalAwardQty', 'TotalAwardQty', 'l_total_award_qty', 'L_TOTAL_AWARD_QTY', 'l_total_award', 'L_TOTAL_AWARD'])

    const normalizedShopTotal = directShopTotal > 0 ? directShopTotal : shopTotal
    const normalizedPassShop = directPassShop > 0 ? directPassShop : metTargetCount
    const normalizedFailShop = directFailShop > 0 ? directFailShop : Math.max(normalizedShopTotal - normalizedPassShop, 0)
    const normalizedExecTotal = directTurnCount > 0 ? directTurnCount : execTotal
    const normalizedExecPassCount = directPassCount > 0 ? directPassCount : execPassCount
    const normalizedExecFailCount = Math.max(normalizedExecTotal - normalizedExecPassCount, 0)
    const normalizedAwardTypeCount = directAwardType > 0 ? directAwardType : awardTypeCount
    const normalizedAwardQty = directAwardQty > 0 ? directAwardQty : totalAwardQty
    const normalizedPassRate = normalizedShopTotal > 0 ? (normalizedPassShop / normalizedShopTotal) * 100 : 0
    const normalizedNotMetRate = normalizedShopTotal > 0 ? (normalizedFailShop / normalizedShopTotal) * 100 : 0
    const normalizedExecPassRate = normalizedExecTotal > 0 ? (normalizedExecPassCount / normalizedExecTotal) * 100 : 0

    return {
        shopTotal: normalizedShopTotal,
        distributorTotal: distributorSet.size,
        programTotal: programSet.size,
        metTargetCount: normalizedPassShop,
        notMetTargetCount: normalizedFailShop,
        passRate: normalizedPassRate,
        notMetRate: normalizedNotMetRate,
        completionRate: targetTotal > 0 ? (actualTotal / targetTotal) * 100 : 0,
        actualSaleTotal: actualTotal,
        targetSaleTotal: targetTotal,
        execTotal: normalizedExecTotal,
        execPassCount: normalizedExecPassCount,
        execFailCount: normalizedExecFailCount,
        execPassRate: normalizedExecPassRate,
        awardTypeCount: normalizedAwardTypeCount,
        totalAwardQty: normalizedAwardQty,
    }
}
