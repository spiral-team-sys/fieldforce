import { Text } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";
import { parseTextValues } from "./ItemHelpers";

const ItemHashTag = ({ item, onUpdateItem }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [inputValue, setInputValue] = useState('')
    const [hashtags, setHashtags] = useState([])

    const normalizeTag = (value) => {
        if (value === null || value === undefined) return ''
        return `${value}`.trim().replace(/^#+/, '').replace(/\s+/g, '')
    }

    const parseInputTags = (text = '') => {
        return `${text}`
            .split(/[\s,\n]+/)
            .map(tag => normalizeTag(tag))
            .filter(Boolean)
    }

    const setValueToItem = (tagList = []) => {
        const valueMain = tagList.length > 0 ? tagList.map(tag => `#${tag}`).join(', ') : ''
        item.Value = valueMain
        onUpdateItem && onUpdateItem(item)
    }

    const loadData = () => {
        const savedTags = parseTextValues(item?.Value)
            .map(tag => normalizeTag(tag))
            .filter(Boolean)

        setHashtags([...new Set(savedTags)])
        setInputValue('')
    }

    const addTags = (tags = []) => {
        const normalized = tags.map(tag => normalizeTag(tag)).filter(Boolean)
        if (normalized.length === 0) return

        const nextTags = [...new Set([...hashtags, ...normalized])]
        setHashtags(nextTags)
        setValueToItem(nextTags)
    }

    const onChangeInput = (text) => {
        if (/[\s,\n]$/.test(text)) {
            addTags(parseInputTags(text))
            setInputValue('')
            return
        }

        setInputValue(text)
    }

    const onSubmitInput = () => {
        if (!inputValue.trim()) return
        addTags(parseInputTags(inputValue))
        setInputValue('')
    }

    const removeTag = (tag) => {
        const nextTags = hashtags.filter(itemTag => itemTag !== tag)
        setHashtags(nextTags)
        setValueToItem(nextTags)
    }

    const onKeyPress = ({ nativeEvent }) => {
        if (nativeEvent?.key === 'Backspace' && !inputValue && hashtags.length > 0) {
            const nextTags = hashtags.slice(0, -1)
            setHashtags(nextTags)
            setValueToItem(nextTags)
        }
    }

    useEffect(() => {
        loadData()
    }, [item])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        inputWrapper: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderColor: hashtags.length > 0 ? appcolor.grayLight : appcolor.red, borderWidth: 0.5, marginTop: 8, minHeight: 42 },
        chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, backgroundColor: appcolor.primary + '20', paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, marginVertical: 4 },
        chipText: { fontSize: 12, color: appcolor.primary, fontWeight: '600' },
        inputContainer: { padding: 0, borderWidth: 0, marginTop: 0, marginBottom: 0, flex: 1, minWidth: 120 },
        inputStyle: { flex: 1, minWidth: 120, fontSize: 12, color: appcolor.dark, paddingTop: 6, paddingBottom: 6, paddingHorizontal: 0 },
        hintText: { marginTop: 6, fontSize: 11, color: appcolor.placeholderText, fontStyle: 'italic' },
    })

    return (
        <View style={styles.mainContainer}>
            <View style={styles.inputWrapper}>
                {hashtags.map(tag => (
                    <TouchableOpacity key={tag} style={styles.chip} onPress={() => removeTag(tag)}>
                        <Text style={styles.chipText}>#{tag}</Text>
                    </TouchableOpacity>
                ))}
                <FormGroup
                    editable={true}
                    useClearAndroid={false}
                    clearButtonMode="never"
                    keyboardType='default'
                    multiline={false}
                    value={inputValue}
                    placeholder={`${item?.ItemName || 'mục này'}`}
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.inputStyle}
                    handleChangeForm={onChangeInput}
                    onSubmitEditing={onSubmitInput}
                    onBlur={onSubmitInput}
                    onKeyPress={onKeyPress}
                    returnKeyType='done'
                    autoCorrect={false}
                    autoCapitalize='none'
                />
            </View>
        </View>
    )
}

export default ItemHashTag;