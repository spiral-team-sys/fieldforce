import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";

const LegendCustom = ({ legend = [], selectedValue, onSelectLine }) => {
    const { appcolor } = useSelector(state => state.GAppState);

    useEffect(() => { }, [selectedValue])

    const styles = StyleSheet.create({
        mainContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: appcolor.light },
        itemContainer: { flexDirection: 'row', alignItems: 'center' },
        dotView: { width: 8, height: 8, backgroundColor: 'black', borderRadius: 8, overflow: 'hidden' },
        titleName: { marginLeft: 5, color: appcolor.dark, fontSize: 11 }
    })

    const renderItem = (item, index) => {
        const onPress = () => onSelectLine(item)
        const backgroundColor = item.keyTable === selectedValue ? item.config.colorHex : appcolor.light;
        const dotColor = item.keyTable !== selectedValue ? item.config.colorHex : appcolor.light;
        const color = item.keyTable === selectedValue ? appcolor.light : appcolor.dark;
        return (
            <TouchableOpacity key={index} style={{ ...styles.itemContainer, backgroundColor, padding: 8, borderRadius: 8 }} onPress={onPress}>
                <View style={{ ...styles.dotView, backgroundColor: dotColor }} />
                <Text style={{ ...styles.titleName, color }}>{item.label}</Text>
            </TouchableOpacity>
        )
    }

    if (legend.length === 0)
        return null;
    return (
        <View style={styles.mainContainer}>
            {legend.map(renderItem)}
        </View>
    )
}

export default LegendCustom;