import React, { forwardRef, useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";
import { deviceHeight, deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import { FlatList } from "react-native";
import { TouchableOpacity } from "react-native";
import { ViewItemInput } from "./ViewItemInput";

export const ViewItemProduct = forwardRef((props, ref) => {
    const { type, item, listInput, index, onEditing, handlerEndEditing } = props
    const { appcolor } = useSelector(state => state.GAppState)
    const [itemUpdate, setItemUdpate] = useState({})
    //
    const LoadData = async () => {
        await setItemUdpate(item)
        // if (type !== null && type.length > 0 && ref !== undefined)
        //     await ref.current.focus()
    }
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [item, type])
    // View
    const styles = StyleSheet.create({
        inputStyle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light },
        itemMain: { width: '100%', flexDirection: 'column', justifyContent: 'flex-end', padding: 4, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        titleHead: { width: deviceWidth, fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
    })

    return (
        <View key={`it_${itemUpdate.divisionId}_${index}_${itemUpdate.modelName}`} style={styles.itemMain}>
            <Text style={styles.titleHead}>{`${index + 1}. ${item.modelName}`}</Text>

            <TouchableOpacity key={`${item.displayCompetitorId}_${index}`} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {
                    listInput.map((it, idx) => {
                        return (
                            <ViewItemInput key={`${item.displayCompetitorId}_${index}_${it.id}`} itemInput={it} indexInput={idx} dataItem={item} indexItem={index} />
                        )
                    })
                }
            </TouchableOpacity>

        </View>
    )
})







