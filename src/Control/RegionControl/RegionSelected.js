import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import _ from 'lodash'
import { deviceWidth } from "../../Core/Utility";

const TYPE = {
    REGION: 'REGION',
    PROVINCE: 'PROVINCE',
    DISTRICT: 'DISTRICT',
    TOWN: 'TOWN'
}
export const RegionSelected = ({ defaultValue, dataItems, containerStyle, mulipleChoose = false, isHorizontal = true, onItemChoose, typeItem, isFilter = false, placeholder, itemColor, editable = true }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataFilter, setDataFilter] = useState([])
    // const [ref, setRef] = useState()
    const ref = useRef()
    const styles = StyleSheet.create({
        mainContainer: { flexGrow: 1, marginBottom: 1 },
        itemContent: { backgroundColor: appcolor.light, borderRadius: 5, padding: 8, margin: 5, borderWidth: 0.5, borderColor: appcolor.grayLight },
        itemName: { fontSize: 14, fontWeight: '300', color: appcolor.dark, textAlign: 'center', marginStart: 8, marginEnd: 8 },
        titleHeader: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, marginStart: 8 },
        filterItemContent: { width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, padding: 3, marginTop: 5 },
    })
    const setDataItem = async () => {
        await setDataFilter(dataItems)
        setTimeout(() => {
            const indexView = _.findIndex(dataItems, (i) => { return i.itemName == defaultValue })
            singleSelected(defaultValue, indexView)
            // ref?.current?.scrollToIndex({
            //     animated: true,
            //     index: indexView < 0 ? 0 : indexView,
            //     viewPosition: 0.5
            // })
        }, 100);
    }
    const singleSelected = (itemName, index) => {
        defaultValue = itemName
        ref?.current?.scrollToIndex({
            animated: true,
            index: index < 0 ? 0 : index,
            viewPosition: 0.5
        })
    };
    const filterItem = (text) => {
        const dataFilter = dataItems.filter(i => i.itemName.toLowerCase().match(text.toLowerCase()) || i.itemNameEn.toLowerCase().match(text.toLowerCase()))
        setDataFilter(dataFilter)
    }
    const renderItem = ({ item, index }) => {
        const onPress = () => {
            editable ? onItemChoose(item, typeItem) : null
            // mulipleChoose ? mutipleSelected(item.itemName) : singleSelected(item.itemName, index)

        }
        const styleView = item.itemName == defaultValue ? { ...styles.itemContent, borderWidth: 1, borderColor: itemColor || appcolor.primary } : styles.itemContent
        const styleTitle = item.itemName == defaultValue ? { ...styles.itemName, fontWeight: '700', color: itemColor || appcolor.primary } : styles.itemName
        return (
            <TouchableOpacity key={`itemmuti_${index}`} style={styleView} onPress={onPress}>
                <Text style={styleTitle}>{item.itemName}</Text>
            </TouchableOpacity>
        )
    }
    const getItemLayout = (data, index) => (
        { length: 130, offset: 130 * index, index }
    );
    useEffect(() => {
        setDataItem()
        return () => false
    }, [dataItems])
    return (
        <View style={[styles.mainContainer, containerStyle]}>
            {isFilter &&
                <FormGroup
                    editable={editable}
                    containerStyle={styles.filterItemContent}
                    handleChangeForm={filterItem}
                    placeholder={placeholder || 'Tìm kiếm'}
                    iconName='search'
                />
            }
            {dataFilter.length > 0 &&
                <FlatList
                    ref={ref}
                    key={'regionItemList'}
                    keyExtractor={(_, index) => index.toString()}
                    data={dataFilter.length > 0 ? dataFilter : dataItems}
                    getItemLayout={getItemLayout}
                    renderItem={renderItem}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal={isHorizontal}
                />
            }
        </View>
    )
}   