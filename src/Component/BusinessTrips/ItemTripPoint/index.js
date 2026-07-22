import React from "react";
import { useSelector } from "react-redux";
import { AppNameBuild, aquaApp, bshApp, lgApp, sharpApp, toshibaApp } from "../../../Core/URLs";
import { View } from "react-native";
import { ItemTripPointDefault } from "./ItemTripPointDefault";
import { ItemTripPointToshiba } from "./itemTripPointToshiba";
import { ItemTripPointSharp } from "./ItemTripPointSharp";
import { ItemTripPointAqua } from "./ItemTripPointAqua";
import { ItemTripPointBosch } from "./ItemTripPointBosch";
import { ItemTripPointLG } from "./ItemTripPointLG";

export const ItemTripPointView = ({ item, index, quotaData, itemTrips, itemPoint, typeVehicle, config, dateFilter, dataProvince }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const ItemView = () => {
        switch (AppNameBuild) {
            case toshibaApp:
                return <ItemTripPointToshiba
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                />
            case sharpApp:
                return <ItemTripPointSharp
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                />
            case aquaApp:
                return <ItemTripPointAqua
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                    dateFilter={dateFilter}
                />
            case bshApp:
                return <ItemTripPointBosch
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                />
            case lgApp:
                return <ItemTripPointLG
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                    dataProvince={dataProvince}
                />
            default:
                return <ItemTripPointDefault
                    key={`${AppNameBuild}_Point_${index}`}
                    quotaData={quotaData}
                    config={config}
                    index={index}
                    item={item}
                    itemTrips={itemTrips}
                    itemPoint={itemPoint}
                    typeVehicle={typeVehicle}
                    dateFilter={dateFilter}
                    dataProvince={dataProvince}
                />
        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            {ItemView()}
        </View>
    )
}