import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "@rneui/themed";
import { useSelector } from "react-redux";
import { deviceHeight, fontWeightBold } from "../../../../Themes/AppsStyle";
import { FlashList } from "@shopify/flash-list";
import FormGroup from "../../../../Content/FormGroup";
import { alertWarning } from "../../../../Core/Utility";
import _ from 'lodash';

const InputItem = ({ isShow = false, item, dataItem, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [data, setData] = useState([]);

    const onSetNoDisplay = useCallback(() => {
        const value = item.Display == 0 ? null : 0
        const dataRemove = _.map(dataItem, (e) => _.omit(e, 'ItemQuantity'));
        item.data = dataRemove
        item.Display = value
        item.NoteProduct = null
        handlerChange(item);
    }, [item, handlerChange]);

    useEffect(() => {
        setData(dataItem);
    }, [item, dataItem]);

    const handlerChangeValue = useCallback((text, itemChild) => {
        const value = text !== null && text !== '' ? parseInt(text) : null
        if (value == 0) {
            alertWarning('Số lượng trưng bày theo vị trí phải lớn hơn 0, Nếu bằng 0 vui lòng chọn "Sản phẩm không trưng bày"')
            return
        } if (value >= 2) {
            alertWarning('Số lượng trưng bày theo vị trí lớn hơn 2, Bạn có chắc nhập đúng không?')
        }
        itemChild.ItemQuantity = value
        const validItems = dataItem.filter(e => e.ItemQuantity !== null && e.ItemQuantity !== undefined);
        const summaryDisplay = validItems.length > 0 ? _.sumBy(validItems, 'ItemQuantity') : null;
        item.Display = summaryDisplay
        //
        handlerChange(item);

    }, [item, handlerChange]);

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', paddingBottom: 16 },
        contentMain: { width: '100%', height: deviceHeight / 2, backgroundColor: appcolor.light },
        itemMain: { backgroundColor: appcolor.light, borderRadius: 4, marginEnd: 3, marginTop: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: appcolor.surface },
        titleHead: { color: appcolor.dark, fontSize: 15, textAlign: 'center', marginTop: 8, fontWeight: fontWeightBold },
        titleName: { width: '70%', fontSize: 13, padding: 8, paddingStart: 16, color: appcolor.dark, fontWeight: fontWeightBold },
        dotView: { width: 3, height: 3, borderRadius: 5, backgroundColor: appcolor.greylight, marginStart: 8 },
        actionView: { backgroundColor: 'red', borderRadius: 3, paddingHorizontal: 3 },
        inputContainer: { width: 80, margin: 4 },
        inputStyle: { fontSize: 12, textAlign: 'center', color: appcolor.dark },
        headerView: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },

        titleNoDisplay: { fontSize: 13, color: item.Display == 0 ? appcolor.white : appcolor.black, fontWeight: '500' },
        buttonNoDisplay: { borderWidth: 1, borderColor: appcolor.surface, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
        containerNoDisplay: { backgroundColor: item.Display == 0 ? appcolor.redgray : appcolor.light, marginTop: 8, elevation: 3, shadowColor: appcolor.grayLight, shadowRadius: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, borderRadius: 20 }
    });
    const renderItem = useCallback((params) => {
        const { item } = params
        const onChangeValue = (text) => handlerChangeValue(text, item)
        const displayValue = `${item.ItemQuantity !== null && item.ItemQuantity !== undefined ? item.ItemQuantity : ''}`
        return (
            <View style={styles.itemMain}>
                <Text style={styles.titleName}>{item.ItemName}</Text>
                <FormGroup
                    editable
                    value={`${displayValue}`}
                    keyboardType='numeric'
                    placeholder='Số lượng'
                    useClearAndroid={false}
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.inputStyle}
                    handleChangeForm={onChangeValue}
                />
            </View>
        );
    }, [item, appcolor, handlerChangeValue]);

    if (!isShow) return null
    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerView}>
                <Text style={styles.titleHead}>{item.ProductName}</Text>
                <Button
                    type="outline"
                    title={`Sản phẩm không trưng bày`}
                    titleStyle={styles.titleNoDisplay}
                    buttonStyle={styles.buttonNoDisplay}
                    containerStyle={styles.containerNoDisplay}
                    onPress={onSetNoDisplay}
                />
            </View>
            <View style={styles.contentMain}>
                <FlashList
                    keyExtractor={(_item, index) => index.toString()}
                    data={data}
                    extraData={[data, dataItem]}
                    renderItem={renderItem}
                    estimatedItemSize={100}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default React.memo(InputItem);
