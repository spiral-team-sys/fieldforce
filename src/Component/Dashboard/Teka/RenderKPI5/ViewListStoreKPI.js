import React, { useEffect, useState, } from "react"
import { View, Text, FlatList } from "react-native"
import { useSelector } from "react-redux";
import _ from "lodash";
import { FlashList } from "@shopify/flash-list";
import { deviceWidth } from "../../../Home";
import { formatNumber } from "../../../../Core/Helper";

export const ViewListStoreKPI = ({ dataModal }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [data, setData] = useState({ dataGroup: [], itemView: {} })
    const [_mutate, setMutate] = useState(false)

    const loadData = () => {
        data.dataGroup = dataModal.dataGroup
        data.itemView = dataModal.itemView
        setMutate(e => !e)
    }
    useEffect(() => {
        const _load = loadData()
        return () => _load;
    }, [])

    const renderItem = ({ item, index }) => {
        const group = JSON.parse(data.itemView[item] || '{}')
        return (
            <View style={{ flexDirection: 'column', width: '100%', justifyContent: "center", alignItems: "center" }}>
                <RenderDataKPI key={`item_${data.itemView[item]}}_`} group={group} dataItem={data.itemView} type={`GROUP_${index}`} />
            </View>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            {
                data.dataGroup?.length > 0 &&
                <FlashList
                    key={`ListStore_${dataModal.itemView?.employeeId}`}
                    keyExtractor={(it, _index) => it?.toString()}
                    data={data.dataGroup}
                    extraData={[data.dataGroup]}
                    renderItem={renderItem}
                    estimatedItemSize={100}
                    getItemLayout={(_data, idx) => ({ length: _data.length, offset: 100 * idx, idx })}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    nestedScrollEnabled
                />
            }

        </View >
    )
}

const RenderDataKPI = ({ group, type, dataItem }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    let count = 0
    const renderItemView = ({ item, index }) => {
        return (
            <View key={`${type}_${index}`} style={{ flex: 1, padding: 8 }}>
                <View style={{ backgroundColor: appcolor.surface, borderRadius: 8, padding: 4 }}>
                    <View style={{ borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.light, paddingVertical: 4 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, textAlign: 'center' }}>{`${item}`}</Text>
                    </View>
                    <View style={{ borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.transparent, paddingVertical: 4 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, textAlign: 'center' }}>{`${dataItem[group.itemField[index]] > 0 ? formatNumber(dataItem[group.itemField[index]], ',') : dataItem[group.itemField[index]]?.length > 0 ? dataItem[group.itemField[index]] : '-'} `}</Text>
                    </View>
                </View>
            </View>
        )
    }

    group.itemField.map(it => {
        dataItem[it] == null && (count = count + 1)
    })

    return (
        group.itemField?.length !== count ?
            <View style={{ width: '100%' }}>
                <View style={{ backgroundColor: group.color || appcolor.primary, borderRadius: 8, padding: 8, margin: 4 }}>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.white }}>{`${group.titleGroup}`}</Text>
                </View>
                {/* DataItem */}
                <FlatList
                    scrollEnabled={false}
                    key={`FlashList_${type}`}
                    data={group.titleItem}
                    contentContainerStyle={{ width: deviceWidth, }}
                    renderItem={renderItemView}
                    numColumns={4}
                    listKey={type}
                    keyExtractor={(_, index) => index.toString()}
                />
            </View>
            :
            <></>
    )
}


