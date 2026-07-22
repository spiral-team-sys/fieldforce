import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import ItemInput from "../Item/ItemInput";
import ItemDateTime from "../Item/ItemDateTime";
import ItemAddress from "../Item/ItemAddress";
import ItemChoose from "../Item/ItemChoose";
import ItemEmployees from "../Item/ItemEmployees";
import ItemInputList from "../Item/ItemInputList";
import ItemHashTag from "../Item/ItemHashTag";
import ItemPhoto from "../Item/ItemPhoto";
import ItemProducts from "../Item/ItemProducts";

const SurveyItemDetails = ({ itemMain, paramShop, onSaveData }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const handleUpdateItem = async (itemUpdated) => {
        onSaveData && onSaveData(itemUpdated)
    }

    useEffect(() => {
        return () => false
    }, [itemMain])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light }
    })

    const renderItem = () => {
        const itemType = `${itemMain?.ItemType || 'text'}`.toLowerCase()
        switch (itemType) {
            case 'text':
            case 'number':
            case 'phone':
                return <ItemInput item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'hashtag':
                return <ItemHashTag item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'date':
            case 'time':
            case 'datetime':
                return <ItemDateTime item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'address':
                return <ItemAddress item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'choose':
                return <ItemChoose item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'list':
                return <ItemProducts item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'listinput':
                return <ItemInputList item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'employee':
                return <ItemEmployees item={itemMain} onUpdateItem={handleUpdateItem} />
            case 'photo':
                return <ItemPhoto item={itemMain} paramShop={paramShop} onUpdateItem={handleUpdateItem} />
            default:
                return <ItemInput item={itemMain} onUpdateItem={handleUpdateItem} />
        }
    }

    return (
        <View style={styles.mainContainer}>
            {renderItem()}
        </View>
    )
}

export default SurveyItemDetails;