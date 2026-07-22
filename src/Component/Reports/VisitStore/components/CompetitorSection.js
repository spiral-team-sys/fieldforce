import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/base";
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";

const CompetitorSection = ({
    item,
    index,
    payload,
    groupDataList,
    yesNoOptions,
    isUploaded,
    onChooseCompetitorValue,
    onChangePayloadValue
}) => {
    const { appcolor } = useSelector((state) => state.GAppState)
    const [choiceMap, setChoiceMap] = useState({})

    const sectionStyles = StyleSheet.create({
        inputWrap: { marginTop: 10 },
        competitorQuestionWrap: { marginTop: 10 },
        competitorQuestionRow: { borderWidth: 1, borderColor: appcolor.grayLight, backgroundColor: appcolor.light, borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
        competitorName: { flex: 1, fontSize: 12, color: appcolor.dark, fontWeight: '700', paddingRight: 8 },
        competitorActionRow: { flexDirection: 'row', alignItems: 'center', width: 128 },
        competitorChoice: { flex: 1, borderWidth: 1, borderColor: appcolor.grayLight, borderRadius: 10, backgroundColor: appcolor.light, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
        competitorChoiceActive: { borderColor: appcolor.primary, backgroundColor: appcolor.primary },
        competitorChoiceNegativeActive: { borderColor: appcolor.primary, backgroundColor: appcolor.surface },
        competitorChoiceText: { fontSize: 12, color: appcolor.dark, fontWeight: '700' },
        competitorChoiceTextActive: { color: appcolor.light },
        competitorChoiceGap: { width: 6 },
    })

    const competitorDataList = Array.isArray(groupDataList) ? groupDataList : []
    const otherCompetitorItem = competitorDataList.find((it) => Number(it?.Level) === 2) || competitorDataList.find((it) => Number(it?.Id) === 100)
    const selectedYesIds = Array.isArray(payload?.selectedId) ? payload.selectedId.map((id) => Number(id)) : []

    useEffect(() => {
        setChoiceMap((prev) => {
            const nextMap = { ...prev }
            selectedYesIds.forEach((id) => {
                nextMap[`${id}`] = 1
            })
            Object.keys(nextMap).forEach((key) => {
                if (!selectedYesIds.some((id) => Number(id) === Number(key)) && Number(nextMap[key]) === 1) {
                    delete nextMap[key]
                }
            })
            return nextMap
        })
    }, [JSON.stringify(selectedYesIds)])

    const isChooseYesOtherCompetitor = !!otherCompetitorItem && ((Number(choiceMap[`${otherCompetitorItem?.Id}`]) === 1) || selectedYesIds.some((id) => Number(id) === Number(otherCompetitorItem?.Id)))

    return (
        <>
            {groupDataList.length > 0 && (
                <View style={sectionStyles.competitorQuestionWrap}>
                    {competitorDataList.map((child, childIndex) => {
                        const selectedValue = Number(choiceMap[`${child?.Id}`])
                        const isYes = selectedValue === 1 || selectedYesIds.some((id) => Number(id) === Number(child?.Id))
                        return (
                            <View key={`competitor_${item?.Id || index}_${child?.Id || childIndex}`} style={sectionStyles.competitorQuestionRow}>
                                <Text style={sectionStyles.competitorName}>{child?.CompetitorName || child?.KPIName || ""}</Text>
                                <View style={sectionStyles.competitorActionRow}>
                                    {yesNoOptions.map((option, optionIndex) => {
                                        const active = Number(option?.itemValue) === 1
                                            ? isYes
                                            : (isUploaded == 1 ? !isYes : selectedValue === 0)
                                        const isYesOption = Number(option?.itemValue) === 1
                                        return (
                                            <React.Fragment key={`competitor_yesno_${item?.Id || index}_${child?.Id || childIndex}_${optionIndex}`}>
                                                {optionIndex > 0 && <View style={sectionStyles.competitorChoiceGap} />}
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    disabled={isUploaded == 1}
                                                    onPress={() => {
                                                        if (isUploaded == 1) return
                                                        setChoiceMap((prev) => {
                                                            const nextMap = { ...prev }
                                                            const key = `${child?.Id}`
                                                            const current = Number(nextMap[key])
                                                            const nextValue = Number(option?.itemValue)
                                                            if (current === nextValue) {
                                                                delete nextMap[key]
                                                            } else {
                                                                nextMap[key] = nextValue
                                                            }
                                                            return nextMap
                                                        })
                                                        onChooseCompetitorValue(index, child?.Id, option?.itemValue)
                                                    }}
                                                    style={[
                                                        sectionStyles.competitorChoice,
                                                        active && (isYesOption ? sectionStyles.competitorChoiceActive : sectionStyles.competitorChoiceNegativeActive)
                                                    ]}
                                                >
                                                    <Text style={[
                                                        sectionStyles.competitorChoiceText,
                                                        active && (isYesOption ? sectionStyles.competitorChoiceTextActive : { color: appcolor.primary })
                                                    ]}>{option?.itemName || ""}</Text>
                                                </TouchableOpacity>
                                            </React.Fragment>
                                        )
                                    })}
                                </View>
                            </View>
                        )
                    })}
                </View>
            )}

            {groupDataList.length > 0 && isChooseYesOtherCompetitor && (
                <View style={sectionStyles.inputWrap}>
                    <FormGroup
                        editable={isUploaded != 1}
                        useClearAndroid={true}
                        title={"Nhập đối thủ khác"}
                        placeholder={"Nhập đối thủ khác"}
                        value={(payload?.otherCompetitor ?? "").toString()}
                        handleChangeForm={(value) => onChangePayloadValue(index, "otherCompetitor", value)}
                        onClearTextAndroid={() => onChangePayloadValue(index, "otherCompetitor", "")}
                    />
                </View>
            )}
        </>
    )
}

export default CompetitorSection;
