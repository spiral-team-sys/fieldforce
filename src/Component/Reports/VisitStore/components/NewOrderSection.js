import React from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";
import { formatNumber } from "../../../../Core/Helper";

const NewOrderSection = ({
    item,
    index,
    payload,
    groupDataList,
    reasonOptions,
    isUploaded,
    isChooseYes,
    isChooseNo,
    isShowReasonList,
    onChooseReason,
    onChangePayloadValue,
    onToggleDataListValue
}) => {
    const { appcolor } = useSelector((state) => state.GAppState)

    const sectionStyles = StyleSheet.create({
        inputWrap: { marginTop: 10 },
        sectionTitle: { fontSize: 12, color: appcolor.dark, fontWeight: '700', marginTop: 10, marginBottom: 6 },
        optionListWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' },
        optionItem: { borderWidth: 1, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
        optionItemText: { fontSize: 12, color: appcolor.dark, fontWeight: '600' },
        optionItemNegativeActive: { borderColor: appcolor.success, backgroundColor: appcolor.success },
        optionItemTextNegativeActive: { color: appcolor.light },
    })

    const otherReason = (reasonOptions || []).find((reason) => {
        const reasonName = `${reason?.name || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        return reasonName.includes("khac")
    })
    const otherData = (groupDataList || []).find((child) => {
        const childName = `${child?.CompetitorName || child?.KPIName || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        return Number(child?.Id) === 100 || childName.includes("khac")
    })
    const selectedProductIds = Array.isArray(payload?.selectedId)
        ? payload.selectedId.map((id) => Number(id) === 0 ? 100 : Number(id))
        : []
    const showOtherDataInput = item?.IsNewOrder === 1
        && isChooseYes
        && selectedProductIds.some((id) => Number(id) === Number(otherData?.Id || 100))

    const renderChipList = ({ list = [], selectedIds = [], onPress = null, keyPrefix = "chip" }) => {
        return (
            <View style={sectionStyles.optionListWrap}>
                {list.map((child, childIndex) => {
                    const isActive = Array.isArray(selectedIds) && selectedIds.some((id) => Number(id) === Number(child?.Id))
                    if (typeof onPress !== "function") {
                        return (
                            <View key={`${keyPrefix}_${child?.Id || childIndex}`} style={sectionStyles.optionItem}>
                                <Text style={sectionStyles.optionItemText}>{child?.CompetitorName || child?.KPIName || ""}</Text>
                            </View>
                        )
                    }
                    return (
                        <TouchableOpacity
                            key={`${keyPrefix}_${child?.Id || childIndex}`}
                            activeOpacity={0.8}
                            disabled={isUploaded == 1}
                            onPress={() => isUploaded != 1 && onPress(child)}
                            style={[sectionStyles.optionItem, isActive && sectionStyles.optionItemNegativeActive]}
                        >
                            <Text style={[sectionStyles.optionItemText, isActive && sectionStyles.optionItemTextNegativeActive]}>{child?.CompetitorName || child?.KPIName || ""}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    return (
        <>
            {item?.IsNewOrder === 1 && isChooseYes && (
                <View style={sectionStyles.inputWrap}>
                    <FormGroup
                        editable={isUploaded != 1}
                        useClearAndroid={true}
                        title={"Nhập giá trị đơn hàng"}
                        placeholder={"Nhập giá trị đơn hàng"}
                        value={formatNumber(payload?.price ?? "", ".")}
                        keyboardType={"decimal-pad"}
                        handleChangeForm={(value) => onChangePayloadValue(index, "price", formatNumber(value, "."))}
                        onClearTextAndroid={() => onChangePayloadValue(index, "price", "")}
                    />
                </View>
            )}

            {item?.IsNewOrder === 1 && isChooseYes && groupDataList.length > 0 && (
                <>
                    <Text style={sectionStyles.sectionTitle}>{'Danh sách nhóm sản phẩm'}</Text>
                    {renderChipList({
                        list: groupDataList,
                        selectedIds: selectedProductIds,
                        onPress: (child) => onToggleDataListValue(index, child?.Id),
                        keyPrefix: `select_${item?.Id || index}`
                    })}
                </>
            )}
            {showOtherDataInput && (
                <View style={sectionStyles.inputWrap}>
                    <FormGroup
                        editable={isUploaded != 1}
                        useClearAndroid={true}
                        title={"Nhập sản phẩm khác"}
                        placeholder={"Nhập sản phẩm khác"}
                        value={(payload?.otherProduct ?? "").toString()}
                        handleChangeForm={(value) => onChangePayloadValue(index, "otherProduct", value)}
                        onClearTextAndroid={() => onChangePayloadValue(index, "otherProduct", "")}
                    />
                </View>
            )}
            {isShowReasonList && <Text style={sectionStyles.sectionTitle}>{'Lý do'}</Text>}
            {isShowReasonList && (
                <View style={sectionStyles.optionListWrap}>
                    {reasonOptions.map((reason) => {
                        const active = Number(payload?.reasonId) === Number(reason?.id)
                        return (
                            <TouchableOpacity
                                key={`reason_${item?.Id || index}_${reason?.id}`}
                                activeOpacity={0.8}
                                disabled={isUploaded == 1}
                                onPress={() => isUploaded != 1 && onChooseReason(index, item, reason?.id)}
                                style={[sectionStyles.optionItem, active && sectionStyles.optionItemNegativeActive]}
                            >
                                <Text style={[sectionStyles.optionItemText, active && sectionStyles.optionItemTextNegativeActive]}>{reason?.name || ""}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            )}

            {isShowReasonList && (Number(payload?.reasonId) === 100 || Number(payload?.reasonId) === Number(otherReason?.id)) && (
                <View style={sectionStyles.inputWrap}>
                    <FormGroup
                        editable={isUploaded != 1}
                        useClearAndroid={true}
                        title={"Nhập lý do"}
                        placeholder={"Nhập lý do"}
                        value={(payload?.otherReason ?? "").toString()}
                        handleChangeForm={(value) => onChangePayloadValue(index, "otherReason", value)}
                        onClearTextAndroid={() => onChangePayloadValue(index, "otherReason", "")}
                    />
                </View>
            )}

            {item?.IsNewOrder === 1 && isChooseNo && (
                <View style={sectionStyles.inputWrap}>
                    <FormGroup
                        editable={isUploaded != 1}
                        useClearAndroid={true}
                        title={"Nhập lý do chi tiết/hướng xử lý đã thực hiện"}
                        placeholder={"Nhập lý do chi tiết/hướng xử lý đã thực hiện"}
                        value={(payload?.detailReason ?? "").toString()}
                        handleChangeForm={(value) => onChangePayloadValue(index, "detailReason", value)}
                        onClearTextAndroid={() => onChangePayloadValue(index, "detailReason", "")}
                    />
                </View>
            )}
        </>
    )
}

export default NewOrderSection;
