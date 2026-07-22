import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { getDataStoreList } from "../../../../Controller/ShopController";
import ShopList from "../../../Shops/List/ShopList";

const ShopView = ({ navigation, isReloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataShop, setDataShop] = useState([])

    // Handler
    const LoadData = async () => {
        await getDataStoreList(setDataShop)
    }
    //
    useEffect(() => {
        const reload_store = DeviceEventEmitter.addListener('RELOAD_DATA_SHOP', LoadData)
        let isMounted = true
        if (!isMounted)
            return
        LoadData()
        return () => {
            isMounted = false
            reload_store.remove()
        }
    }, [isReloadData])

    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        content: { flex: 1 },
        titleContent: { fontWeight: '900', color: appcolor.dark, padding: 7 }

    })
    return (
        <View style={styles.mainContainer}>
            <Text style={styles.titleContent}>Cửa hàng</Text>
            <ShopList navigation={navigation} data={dataShop} isViewHorizontal={true} />
        </View>
    )
}

export default ShopView