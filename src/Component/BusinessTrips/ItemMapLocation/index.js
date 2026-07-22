import React from "react";
import { useSelector } from "react-redux";
import { AppNameBuild, aquaApp, bshApp, sharpApp, toshibaApp } from "../../../Core/URLs";
import { View } from "react-native";
import { ItemLocationDefault } from "./ItemLocationDefault";

export const ItemMapLocation = ({ dataProvince, itemTrips, ItemInput, quotaData, dateFilter, config }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const ItemView = () => {
        switch (AppNameBuild) {
            default:
                return <ItemLocationDefault
                    key={`${AppNameBuild}_Map`}
                    // styles={styles}
                    quotaData={quotaData}
                    config={config}
                    dataProvince={dataProvince}
                    itemTrips={itemTrips}
                    ItemInput={ItemInput}
                    dateFilter={dateFilter}
                />
        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            {ItemView()}
        </View>
    )
}