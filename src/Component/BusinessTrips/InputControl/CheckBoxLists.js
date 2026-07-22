
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import CustomListView from "../../../Control/Custom/CustomListView";
import CheckBoxs from "./CheckBoxs";
import { useSelector } from "react-redux";
import { Icon } from "@rneui/themed";
import { PhotoEvidentTrip } from "./PhotoEvidentTrip";

export const CheckBoxLists = ({ dataCheck, handleSelectCheckBox, guid, itemTrips }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [_mutate, setMutate] = useState(false)

    useEffect(() => {
        setMutate(e => !e)
        return
    }, [dataCheck])

    const handlerAddImage = (photo, type) => {
        let dataPhotoByType = JSON.parse(itemTrips?.photoByType || '[]') || []
        if (type === 'add') {
            itemTrips.photoByType = JSON.stringify([...dataPhotoByType, photo])
        } else if (type === 'remove') {
            itemTrips.photoByType = JSON.stringify(dataPhotoByType.filter(i => i.photoPath !== photo.photoPath))
        } else if (type === 'new') {
            itemTrips.photoByType = JSON.stringify(photo)
        }
        setMutate(e => !e)
    }

    const renderItem = ({ item, index }) => {
        const listPhotoByType = JSON.parse(itemTrips?.photoByType || '[]') || []
        const listPhotoByCode = listPhotoByType.filter(i => i.photoType === 'Workingschedule_' + item.fieldCost) || []
        return (
            <View key={'ListType_' + index} style={{ paddingLeft: 16 }}>
                <CheckBoxs
                    disabled={false}
                    titleCheckBox={item.itemName}
                    contentContainerStyle={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItem: 'center' }}
                    itemCheck={item} indexCheck={index}
                    checkBoxStyle={{ width: '100%', justifyContent: 'center', alignItem: 'center' }}
                    size={18}
                    handleSelectCheckBox={handleSelectCheckBox}
                />
                {
                    (item.isChoose == 1 && item.isNeedEvident == 1) &&
                    <PhotoEvidentTrip
                        _guid={guid} itemInput={itemTrips}
                        listPhoto={listPhotoByCode}
                        photoType={'Workingschedule_' + item.fieldCost}
                        photoTypeMain={'Workingschedule_'}
                        isLockAdd={true}
                        handlerAddImage={handlerAddImage} />
                }
            </View>
        )
    }
    return (
        <View style={{ flexGrow: 1, padding: 8, marginBottom: 1, paddingLeft: 12 }}>
            <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
                <Icon type="font-awesome-5" style={{ textAlign: 'center', marginEnd: 8 }} name={"spell-check"} size={20} color={appcolor.dark} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: appcolor.dark }}>Chọn loại chi phí</Text>
            </View>
            <View style={{ width: '100%' }}>
                {
                    dataCheck.map((item, index) => {
                        return (
                            renderItem({ item, index })
                        )
                    })
                }
            </View>
        </View>
    )
}







