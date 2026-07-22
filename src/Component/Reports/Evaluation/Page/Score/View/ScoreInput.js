import { Icon, Text } from "@rneui/base";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import CustomListView from "../../../../../../Control/Custom/CustomListView";

const PRESETS = [0, 1, 2, 3, 4, 5];

const ScoreInput = ({
    styles,
    appcolor,
    activeTarget,
    activeTargetKey,
    currentTargets,
    currentMode,
    scores,
    notes,
    setActiveTargetKey,
    setNotes,
    onSelectScore,
    onStepUp,
    onStepDown,
}) => {
    if (!activeTarget) return null

    const currentScore = scores[activeTarget.key]
    const canUp = (currentScore ?? 0) < activeTarget.maxScore
    const canDown = (currentScore ?? 0) > 0

    return (
        <>
            {currentMode === 'subItems' && (
                <CustomListView
                    data={currentTargets}
                    extraData={[scores, notes, activeTargetKey]}
                    numColumns={2}
                    scrollEnabled={false}
                    containerStyle={styles.targetList}
                    contentContainerStyle={styles.targetListContent}
                    bottomView={{ paddingBottom: 0 }}
                    renderItem={({ item: target }) => {
                        const targetScore = scores[target.key]
                        const targetNote = notes[target.key]
                        const isActive = target.key === activeTarget.key
                        const isDone = targetScore !== undefined
                        return (
                            <View style={styles.targetItemWrap}>
                                <TouchableOpacity
                                    style={[styles.targetItem, isActive && styles.targetItemActive]}
                                    onPress={() => setActiveTargetKey(target.key)}
                                    activeOpacity={0.7} >
                                    <View style={styles.targetItemLeft}>
                                        <Text style={styles.targetItemLabel} numberOfLines={1}>{target.label}</Text>
                                        <Text style={styles.targetItemMeta}>{isDone ? 'Đã chấm' : 'Chưa chấm'}</Text>
                                        <Text style={styles.targetItemMeta}>{targetNote ? `Ghi chú: ${targetNote || ''}` : ''}</Text>
                                    </View>
                                    <Text style={styles.targetItemScore}>
                                        {targetScore != null ? targetScore.toFixed(1) : '-'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />
            )}
            <View style={styles.scorePanel}>
                <View style={styles.scorePanelHeader}>
                    {currentMode === 'subItems' && <Text style={styles.scorePanelTitle}>{`${activeTarget.label}`}</Text>}
                    {currentScore == null && <Text style={styles.scorePanelMode}>Chưa chấm điểm</Text>}
                </View>
                <View style={styles.scoreRow}>
                    <TouchableOpacity
                        style={[styles.stepperBtn, !canDown && styles.stepperBtnDisabled]}
                        onPress={() => onStepDown(activeTarget)}
                        disabled={!canDown}
                        activeOpacity={0.7}>
                        <Icon type='ionicon' name='remove' size={20} color={canDown ? appcolor.primary : appcolor.grayLight} />
                    </TouchableOpacity>
                    <View style={styles.stepperValueBox}>
                        <Text style={styles.stepperValueText}>
                            {currentScore != null ? currentScore.toFixed(1) : '—'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.stepperBtn, !canUp && styles.stepperBtnDisabled]}
                        onPress={() => onStepUp(activeTarget)}
                        disabled={!canUp}
                        activeOpacity={0.7}>
                        <Icon type='ionicon' name='add' size={20} color={canUp ? appcolor.primary : appcolor.grayLight} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.presetLabel}>Chọn nhanh</Text>
                <View style={styles.presetRow}>
                    {PRESETS.map(v => {
                        const isActive = currentScore === v
                        const isDisabled = v > activeTarget.maxScore
                        return (
                            <TouchableOpacity
                                key={`${activeTarget.key}_${v}`}
                                style={[styles.presetChip, isActive && styles.presetChipActive, isDisabled && { opacity: 0.35 }]}
                                onPress={() => onSelectScore(activeTarget.key, v)}
                                activeOpacity={0.7}
                                disabled={isDisabled}
                            >
                                <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>{v}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <Text style={styles.noteLabel}>Ghi chú</Text>
                <TextInput
                    style={styles.noteInput}
                    value={notes[activeTarget.key] || ''}
                    onChangeText={(text) => setNotes(prev => ({ ...prev, [activeTarget.key]: text }))}
                    placeholder='Nhập ghi chú'
                    placeholderTextColor={appcolor.placeholderText}
                    multiline
                    returnKeyType='done'
                />
            </View>
        </>
    )
}

export default ScoreInput;
