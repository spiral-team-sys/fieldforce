import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
// import ScrollableTabView, { ScrollableTabBar } from "react-native-scrollable-tab-view";
////import { NumericFormat } from "react-number-format";;
import { useSelector } from "react-redux";
import FormGroup from "../../../Content/FormGroup";
import { displayTabData, getDisplayProduct, updateItemDisplay } from "../../../Controller/DisplayController";
import { getPureNumber } from "../../../Core/Helper";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view"
import { deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { LoadingView } from "../../../Control/ItemLoading";

const TYPE = {
    quanity: "quanity",
    quantityStock: "quantityStock",
    quantitySuggest: "quantitySuggest",
    price: "price"
}
const DisplayAndStock = ({ loading, dataDisplay }) => {
    const { appcolor, workinfo } = useSelector(state => state.GAppState)
    // const [loading, setLoading] = useState(false)
    const [isLockReport, setLockReport] = useState(false)
    // const [dataDisplay, setDataDisplay] = useState({ dataView: [], dataMain: [], tabData: [] })
    const [_, setMutate] = useState(false)

    const LoadData = async () => {
        await setLoading(true)
        const lstTabData = await displayTabData(workinfo)
        const lstDisplay = await getDisplayProduct(workinfo)
        await setDataDisplay({ dataView: lstDisplay, dataMain: lstDisplay, tabData: lstTabData })
        setTimeout(async () => { await setLoading(false) }, 100)
    }
    const handlerChangeText = async (item, value, type) => {
        const resultValue = getPureNumber(value)
        switch (type) {
            case TYPE.quanity:
                item.quanity = resultValue
                break
            case TYPE.quantityStock:
                item.quantityStock = resultValue
                break
            case TYPE.quantitySuggest:
                item.quantitySuggest = resultValue
                break
            case TYPE.price:
                item.price = resultValue
                break
        }
        updateItemDisplay(item, workinfo)
        await setMutate(e => !e)
    }
    const handlerFilter = async (str) => {
        let mDataFilter = [];
        if (str !== null && str !== undefined && str.length > 0) {
            mDataFilter = dataDisplay.dataMain.filter(i => (
                i.productName.toLowerCase().match(str.toLowerCase())
            ))
        } else {
            mDataFilter = dataDisplay.dataMain
        }
        await setDataDisplay({ ...dataDisplay, dataView: mDataFilter })
    }
    useEffect(() => {
        // LoadData()
        return () => loading;
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        filterView: { margin: 8, backgroundColor: appcolor.surface },

        viewTab: { backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth, height: deviceHeight },
        titleView: { flex: 1, fontSize: 14, fontWeight: '700', marginBottom: 5 },
        inputView: { flexDirection: 'row' },
        itemInputStyle: { fontSize: 13, padding: 8, margin: 3, backgroundColor: appcolor.surface, borderRadius: 5, color: appcolor.dark },
        progressStyle: { position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 }
    })
    const renderItem = ({ item, index }) => {
        return (
            <View key={`ID_${index}`} style={{ padding: 7, backgroundColor: appcolor.danger }}>
                <Text style={styles.titleView}>{`${index + 1}. ${item.productName}`}</Text>
                <View key={'inputDisplay'} style={styles.inputView}>
                    <RenderInputNumber
                        viewStyle={{ ...styles.itemInputStyle, }}
                        key='quanity' placeholder='Trưng bày' appcolor={appcolor} itemValue={item.quanity} isUploaded={item.upload}
                        handlerChangeText={(value) => { handlerChangeText(item, value, TYPE.quanity) }} />
                    <RenderInputNumber
                        viewStyle={{ ...styles.itemInputStyle }}
                        key='quantityStock' placeholder='Tồn kho' appcolor={appcolor} itemValue={item.quantityStock} isUploaded={item.upload}
                        handlerChangeText={(value) => { handlerChangeText(item, value, TYPE.quantityStock) }} />
                    <RenderInputNumber
                        viewStyle={{ ...styles.itemInputStyle, }}
                        key='quantitySuggest' placeholder='Đề xuất' appcolor={appcolor} itemValue={item.quantitySuggest} isUploaded={item.upload}
                        handlerChangeText={(value) => { handlerChangeText(item, value, TYPE.quantitySuggest) }} />
                    <RenderInputNumber
                        viewStyle={{ ...styles.itemInputStyle, }}
                        key='price' placeholder='Giá' appcolor={appcolor} itemValue={item.price} isUploaded={item.upload}
                        handlerChangeText={(value) => { handlerChangeText(item, value, TYPE.price) }} />
                </View>
            </View>
        )
    }
    // const displayProduct = () => {
    //     return (

    //     )
    // }
    return (
        <View style={styles.mainContainer}>
            <FormGroup
                editable
                containerStyle={styles.filterView}
                placeholder={'Tìm kiếm sản phẩm'}
                iconName='search'
                handleChangeForm={handlerFilter}
            />

            <Tabs.Container
                containerStyle={{ backgroundColor: appcolor.surface }}

                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.light }}
                        tabStyle={{ minWidth: minWidthTab(dataDisplay.tabData), height: 36 }}
                    />
                )}>{
                    dataDisplay.tabData.map((item, index) => {
                        var dataResult = dataDisplay.dataMain.filter(i => i.categoryId == item.tabId)
                        return (
                            <Tabs.Tab key={`${index} (${dataResult.length})1`}
                                label={`${item.tabName} (${dataResult.length})`}
                                name={`${item.tabName} (${dataResult.length})`} >
                                <Tabs.FlatList
                                    renderItem={renderItem}
                                    removeClippedSubviews={true}
                                    initialNumToRender={7}
                                    showsVerticalScrollIndicator={false}
                                    key="dataDisplayInput"
                                    keyExtractor={(_, index) => index.toString()}
                                    ListFooterComponent={
                                        <View style={{ height: deviceHeight / 3 }} >
                                            <Text style={{ flex: 1, textAlign: 'center', padding: 8, fontWeight: '700', color: appcolor.danger }}>Đã xem hết</Text>
                                        </View>
                                    }
                                    data={dataResult}>
                                </Tabs.FlatList>
                            </Tabs.Tab>
                        )
                    })}
            </Tabs.Container>

            {
                loading &&
                <View style={styles.progressStyle}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={loading} styles={{ marginTop: 8 }} />
                </View>
            }
        </View>
    )
}
const RenderInputNumber = ({ appcolor, itemValue, placeholder, isUploaded, handlerChangeText, handlerEdit, viewStyle }) => {
    return (
        <NumericFormat
            value={itemValue}
            displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
            renderText={value =>
                <TextInput
                    textAlign={'center'}
                    value={value}
                    style={viewStyle}
                    keyboardType='numeric'
                    placeholder={placeholder}
                    placeholderTextColor={appcolor.greydark}
                    editable={!isUploaded} selectTextOnFocus={!isUploaded}
                    onChangeText={handlerChangeText}
                    onEndEditing={handlerEdit}>
                </TextInput>
            }
        />
    )
}
export default DisplayAndStock;
