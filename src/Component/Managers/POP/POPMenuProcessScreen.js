import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { FlashList } from "@shopify/flash-list";
import { LoadingView } from "../../../Control/ItemLoading";
import { Text, Icon } from "@rneui/base";


const POPMenuProcessScreen = ({ navigation, route }) => {
    const { popMenu } = route.params
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dataMenu, setDataMenu] = useState([])

    const LoadData = async () => {
        await setLoading(true)
        setDataMenu(JSON.parse(popMenu.reportItem))
        await setLoading(false)
    }

    const onBack = () => {
        navigation.goBack()
    }

    const onNavigateMenu = (item) => {
        navigation.navigate(item.pageName, { item })
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { padding: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8, margin: 8, backgroundColor: appcolor.light, elevation: 3, shadowOpacity: 0.3, shadowColor: appcolor.grayLight, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
        itemText: { fontSize: 13, fontWeight: '500', color: appcolor.dark, marginStart: 8 },
        itemContent: { flexDirection: 'row', alignItems: 'center' },
        loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' }
    })

    const renderItem = ({ item }) => {
        const onPress = () => {
            onNavigateMenu(item)
        }
        return (
            <TouchableOpacity key={item.menuId} style={styles.itemContainer} onPress={onPress}>
                <View style={styles.itemContent}>
                    <Icon type="entypo" name={item.iconName} size={22} color={appcolor.primary} />
                    <Text style={styles.itemText}>{item.menuName}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    if (loading) return <LoadingView isLoading={loading} styles={styles.loadingView} />
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={popMenu.menuName}
                leftFunc={onBack}
            />
            <FlashList
                data={dataMenu}
                renderItem={renderItem}
                estimatedItemSize={10}
                showsVerticalScrollIndicator={false}
                keyExtractor={(_item, index) => index.toString()}
                extraData={[dataMenu]}
            />
        </View>
    )
}

export default POPMenuProcessScreen;