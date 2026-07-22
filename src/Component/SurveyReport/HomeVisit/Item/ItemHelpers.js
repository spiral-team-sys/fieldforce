export const normalizeText = (value = '') =>
    `${value}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

export const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value

    try {
        const parsed = JSON.parse(value || '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export const parseTextValues = (value = '') => {
    if (typeof value !== 'string' || !value.trim()) return []
    return value.split(',').map(text => text.trim()).filter(Boolean)
}

export const getItemInputType = (itemType) => `${itemType || 'text'}`.toLowerCase()

export const getKeyboardType = (itemType) => {
    switch (getItemInputType(itemType)) {
        case 'number':
            return 'number-pad'
        case 'phone':
            return 'phone-pad'
        default:
            return 'default'
    }
}

export const sanitizeItemValue = (text, itemType) => {
    let valueMain = text || ''

    if (getItemInputType(itemType) == 'number') {
        valueMain = valueMain.replace(/[^0-9]/g, '')
    }
    if (getItemInputType(itemType) == 'phone') {
        valueMain = valueMain.replace(/[^0-9]/g, '').slice(0, 11)
    }

    return valueMain
}

export const normalizeListInputItems = (items = []) => {
    return items
        .filter(item => item && (item.ItemName || item.itemName))
        .map((item, index) => ({
            ItemId: item.ItemId || item.itemId || index + 1,
            ItemName: item.ItemName || item.itemName || `Mục ${index + 1}`,
            ItemType: getItemInputType(item.ItemType || item.itemType),
            Value: `${item.Value || item.value || ''}`,
        }))
}

export const normalizePhotoItems = (value) => {
    return parseJsonArray(value)
        .map((photo, index) => {
            if (typeof photo === 'string') {
                return { id: `${index}_${photo}`, photoPath: photo, fileName: photo.split('/').pop() || `photo_${index + 1}.jpg` }
            }
            const photoPath = photo?.photoPath || photo?.uri || ''
            if (!photoPath) return null
            return {
                id: photo?.id || `${index}_${photoPath}`,
                photoPath,
                fileName: photo?.fileName || photoPath.split('/').pop() || `photo_${index + 1}.jpg`,
            }
        })
        .filter(Boolean)
}

export const mergeListInputItems = (item) => {
    const configItems = normalizeListInputItems(parseJsonArray(item?.ListItems))
    const savedItems = normalizeListInputItems(parseJsonArray(item?.Value))
    const baseItems = configItems.length > 0 ? configItems : savedItems

    return baseItems.map((configItem) => {
        const savedItem = savedItems.find(saved =>
            Number(saved.ItemId) === Number(configItem.ItemId) || saved.ItemName === configItem.ItemName
        )

        return {
            ...configItem,
            Value: `${savedItem?.Value || configItem?.Value || ''}`,
        }
    })
}