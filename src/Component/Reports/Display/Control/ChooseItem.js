import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";

const ChooseItem = ({ isShow = false, item, dataItem, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(dataItem);
    }, [dataItem]);

    const handlerChoose = useCallback((itemChild) => {
        const _value = item[item.keyValue] == itemChild.ItemName ? null : itemChild.ItemName
        const itemUpdate = { ...item, [item.keyValue]: _value }
        handlerChange(itemUpdate);
    }, [item, handlerChange]);

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', paddingBottom: 16 },
        contentMain: { width: '100%', paddingVertical: 8, flexWrap: 'wrap', flexDirection: 'row', paddingHorizontal: 5, justifyContent: 'center' },
        itemMain: { borderRadius: 4, marginEnd: 3, marginTop: 3 },
        titleHead: { color: appcolor.dark, fontSize: 14, textAlign: 'center', marginTop: 8, fontWeight: fontWeightBold },
        titleName: { width: deviceWidth / 3.5, fontSize: 13, padding: 8, color: appcolor.greylight, fontWeight: fontWeightBold, textAlign: 'center' },
        dotView: { width: 3, height: 3, borderRadius: 5, backgroundColor: appcolor.greylight, marginStart: 8 },
        actionView: { backgroundColor: 'red', borderRadius: 3, paddingHorizontal: 3 }
    });

    const renderItem = useCallback((it, index) => {
        const onPress = () => handlerChoose(it);
        const isSelected = item[item.keyValue] == it.ItemName
        const colorChoose = isSelected ? appcolor.light : appcolor.greylight;
        const backgroundColorChoose = isSelected ? appcolor.primary : appcolor.light;

        return (
            <View key={`ci-${index}`} style={styles.itemMain}>
                <TouchableOpacity onPress={onPress} style={{ ...styles.actionView, backgroundColor: backgroundColorChoose }}>
                    <Text style={{ ...styles.titleName, color: colorChoose }}>{it.ItemName}</Text>
                </TouchableOpacity>
            </View>
        );
    }, [item, appcolor, handlerChoose]);

    if (!isShow) return null
    return (
        <View style={styles.mainContainer}>
            <Text style={styles.titleHead}>{item.ProductName}</Text>
            <View style={styles.contentMain}>
                {data.length > 0 && data.map(renderItem)}
            </View>
        </View>
    );
};

export default React.memo(ChooseItem);
