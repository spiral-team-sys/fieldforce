import React, { useState } from 'react'
import { Input } from '@rneui/base'

const InputItem = ({ item, index, itemParent, onChangeItem }) => {
    const [answer, setAnswer] = useState('')

    const onChangeText = useCallback((text) => {
        setAnswer(text)
        onChangeItem(text)
    }, [onChangeItem])

    return (
        <Input
            placeholder='Nhập câu trả lời'
            style={{ width: '100%', height: 40, borderWidth: 1, borderColor: appcolor.surface, borderRadius: 12, padding: 12, marginBottom: 8 }}
            defaultValue={answer}
            onChangeText={onChangeText}
        />
    )
}
export default React.memo(InputItem)