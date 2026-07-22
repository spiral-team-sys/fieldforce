const getString = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.rows)) return payload.rows
    if (payload && typeof payload === 'object') return [payload]
    return []
}

const pickFirst = (row, keys = []) => {
    for (let i = 0; i < keys.length; i += 1) {
        const value = getString(row?.[keys[i]])
        if (value) return value
    }
    return ''
}

export const SUMMARY_SORT_OPTIONS = {
    EMPLOYEE: 'EMPLOYEE',
    SHOP: 'SHOP',
    PROGRAM: 'PROGRAM',
}

export const SUMMARY_STATUS_OPTIONS = {
    ALL: 'ALL',
    PASS: 'PASS',
    FAIL: 'FAIL',
}

export const DEFAULT_SUMMARY_FILTER_SORT = {
    keyword: '',
    status: SUMMARY_STATUS_OPTIONS.ALL,
    sortBy: SUMMARY_SORT_OPTIONS.EMPLOYEE,
}

const normalizeSummaryRow = (row, index) => {
    const employeeName = pickFirst(row, ['employeeName', 'staffName', 'fullName', 'userName', 'employee'])
    const shopName = pickFirst(row, ['shopName', 'storeName', 'outletName', 'shop'])
    const programName = pickFirst(row, ['programName', 'displayName', 'programTypeName', 'program'])
    const employeeCode = pickFirst(row, ['employeeCode', 'staffCode', 'userCode'])
    const shopCode = pickFirst(row, ['shopCode', 'storeCode', 'outletCode'])
    const statusText = pickFirst(row, ['confirmStatus', 'statusName', 'billStatusName', 'billConfirmName'])

    return {
        ...row,
        _summaryKey: `${index}-${employeeName}-${shopName}-${programName}`,
        _employeeName: employeeName,
        _employeeCode: employeeCode,
        _shopName: shopName,
        _shopCode: shopCode,
        _programName: programName,
        _statusText: statusText,
    }
}

const isPassRow = (row) => {
    const statusResult = Number(row?.statusResult)
    const billStatus = Number(row?.billStatus)
    const statusText = getString(row?._statusText).toLowerCase()
    return statusResult === 1 || billStatus === 1 || /pass|success|dat|duyet/.test(statusText)
}

const isFailRow = (row) => {
    const statusResult = Number(row?.statusResult)
    const billStatus = Number(row?.billStatus)
    const statusText = getString(row?._statusText).toLowerCase()
    return statusResult === 0 || billStatus === 0 || billStatus === 2 || /fail|reject|rot|khongdat/.test(statusText)
}

export const applySummaryFilterSort = (payload, filterSort = DEFAULT_SUMMARY_FILTER_SORT) => {
    const rows = getRows(payload).map(normalizeSummaryRow)
    const keyword = getString(filterSort?.keyword).toLowerCase()

    let filteredRows = rows

    if (keyword) {
        filteredRows = filteredRows.filter((row) => {
            const haystack = [
                row._employeeName,
                row._employeeCode,
                row._shopName,
                row._shopCode,
                row._programName,
                row._statusText,
            ].join(' ').toLowerCase()
            return haystack.includes(keyword)
        })
    }

    if (filterSort?.status === SUMMARY_STATUS_OPTIONS.PASS) {
        filteredRows = filteredRows.filter(isPassRow)
    } else if (filterSort?.status === SUMMARY_STATUS_OPTIONS.FAIL) {
        filteredRows = filteredRows.filter(isFailRow)
    }

    const sortBy = filterSort?.sortBy || SUMMARY_SORT_OPTIONS.EMPLOYEE
    const sortMap = {
        [SUMMARY_SORT_OPTIONS.EMPLOYEE]: (row) => `${row._employeeName} ${row._shopName} ${row._programName}`,
        [SUMMARY_SORT_OPTIONS.SHOP]: (row) => `${row._shopName} ${row._employeeName} ${row._programName}`,
        [SUMMARY_SORT_OPTIONS.PROGRAM]: (row) => `${row._programName} ${row._shopName} ${row._employeeName}`,
    }

    const sorter = sortMap[sortBy] || sortMap[SUMMARY_SORT_OPTIONS.EMPLOYEE]

    return [...filteredRows].sort((a, b) => sorter(a).localeCompare(sorter(b), 'vi', { sensitivity: 'base' }))
}
