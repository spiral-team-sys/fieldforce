import { Text } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../../../Themes/AppsStyle";
import QuizView from "./View/QuizView";
import ResultView from "./View/ResultView";
import ScoringHeader from "./View/ScoringHeader";
import TasksView from "./View/TasksView";
import { alertNotify } from "../../../../../Core/Utility";

const DEFAULT_MAX_SCORE = 5;
const SCORE_STEP = 0.1;

const round1 = (n) => Math.round(n * 10) / 10;

const getQuestionTitle = (question = {}) => question.groupName || question.kpiName || question.kpi || '—';

const getQuestionSubItems = (question = {}) => {
    if (!Array.isArray(question?.subItems)) return [];
    return question.subItems.filter(sub => String(sub?.kpiName || sub?.kpi || '').trim());
};

const getScoreTargetKey = ({ question, questionIndex, subItem, subIndex }) => {
    const baseKey = String(question?.id ?? question?.kpiId ?? question?.groupId ?? questionIndex);
    if (subItem) {
        const subKey = String(subItem?.kpi ?? subIndex);
        return `${baseKey}__${subKey}`;
    }
    return `${baseKey}__group`;
};

const EmployeeScoring = ({ item, onClose, onUploadData }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [scores, setScores] = useState({})
    const [notes, setNotes] = useState({})
    const [tasks, setTasks] = useState('')
    const [activeTargetKey, setActiveTargetKey] = useState(null)
    const [isShowResult, setIsShowResult] = useState(false)
    const [isShowTasks, setIsShowTasks] = useState(false)
    const [isUploading, setUploading] = useState(false)

    const handleUpload = async () => {
        const dataUpload = buildUploadPayload()
        if (!validData(dataUpload)) {
            setIsShowResult(false)
            return
        }
        await setUploading(true)
        onUploadData && await onUploadData(dataUpload)
    }

    const validData = (dataUpload) => {
        if (dataUpload.isNoted == 1) {
            const missingNoteItems = []
            dataUpload.groups?.forEach(group => {
                group.items?.forEach(item => {
                    if (!item.note || item.note.trim() === '') {
                        if (group.groupName == item.label) {
                            missingNoteItems.push(`• ${item.label}`)
                        } else {
                            missingNoteItems.push(`• [${group.groupName}]: ${item.label}`)
                        }
                    }
                })
            })
            if (missingNoteItems.length > 0) {
                alertNotify(`Vui lòng nhập ghi chú cho các mục sau:\n${missingNoteItems.join('\n')}`)
                return false
            }
        }
        return true
    }

    // ─── Actions ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const loading_upload = DeviceEventEmitter.addListener('SCORING_DONE_UPLOAD', () => setUploading(false))
        const raw = JSON.parse(item?.kpiList || '[]')
        const qs = raw.filter(q => q.kpiName || q.kpi)
        setQuestions(qs.length > 0 ? qs : raw)
        setScores({})
        setNotes({})
        setTasks('')
        setCurrentIndex(0)
        setIsShowResult(false)
        setIsShowTasks(false)
        return () => { loading_upload.remove() }
    }, [item])

    // ─── Derived data ─────────────────────────────────────────────────────────
    const total = questions.length
    const currentQ = questions[currentIndex] || {}
    const progress = total > 0 ? (currentIndex + 1) / total : 0

    const scoringTargets = questions.flatMap((question, questionIndex) => {
        const subItems = getQuestionSubItems(question)
        if (subItems.length > 0) {
            return subItems.map((subItem, subIndex) => ({
                questionIndex,
                key: getScoreTargetKey({ question, questionIndex, subItem, subIndex }),
                id: subItem?.kpi,
                label: subItem?.kpiName,
                maxScore: Number(question?.point || DEFAULT_MAX_SCORE),
                mode: 'subItem',
            }))
        }
        return [{
            questionIndex,
            key: getScoreTargetKey({ question, questionIndex }),
            id: question?.kpi,
            label: getQuestionTitle(question),
            maxScore: Number(question?.point || DEFAULT_MAX_SCORE),
            mode: 'group',
        }]
    })
    const currentTargets = scoringTargets.filter(target => target.questionIndex === currentIndex)
    const currentMode = currentTargets.some(target => target.mode === 'subItem') ? 'subItems' : 'groupName'
    const activeTarget = currentTargets.find(target => target.key === activeTargetKey) || currentTargets[0] || null

    useEffect(() => {
        if (currentTargets.length === 0) {
            setActiveTargetKey(null)
            return
        }
        if (currentTargets.some(target => target.key === activeTargetKey)) return
        const firstUnscoredTarget = currentTargets.find(target => scores[target.key] === undefined)
        setActiveTargetKey((firstUnscoredTarget || currentTargets[0]).key)
    }, [activeTargetKey, currentTargets, scores])

    const scoreValues = Object.values(scores)
    const groupScoreAverages = questions.map((_, qIdx) => {
        const gTargets = scoringTargets.filter(t => t.questionIndex === qIdx)
        if (gTargets.length === 0) return 0
        const gSum = round1(gTargets.reduce((s, t) => s + (scores[t.key] ?? 0), 0))
        return round1(gSum / gTargets.length)
    })
    const totalScore = questions.length > 0 && scoreValues.length > 0
        ? round1(groupScoreAverages.reduce((a, b) => a + b, 0) / questions.length)
        : 0
    const answeredCount = Object.keys(scores).length
    const allQuestionsAnswered = scoringTargets.length > 0 && answeredCount === scoringTargets.length
    const currentTargetsAnswered = currentTargets.every(target => scores[target.key] !== undefined)
    // ─── Handlers ─────────────────────────────────────────────────────────────
    const onSelectScore = (targetKey, score) => setScores(prev => ({ ...prev, [targetKey]: round1(score) }))
    const onStepUp = (target) => {
        const currentScore = scores[target.key] ?? 0
        if (currentScore < target.maxScore) onSelectScore(target.key, Math.min(target.maxScore, round1(currentScore + SCORE_STEP)))
    }
    const onStepDown = (target) => {
        const currentScore = scores[target.key] ?? 0
        if (currentScore > 0) onSelectScore(target.key, Math.max(0, round1(currentScore - SCORE_STEP)))
    }
    const onNext = () => {
        if (currentIndex < total - 1) {
            if (item?.isNoted == 1) {
                const missing = currentTargets.filter(t => !notes[t.key] || notes[t.key].trim() === '')
                if (missing.length > 0) {
                    alertNotify(`Vui lòng nhập ghi chú cho:\n${missing.map(t => `• ${t.label}`).join('\n')}`)
                    return
                }
            }
            setCurrentIndex(i => i + 1)
        }
    }
    const onPrev = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1) }
    const onSubmit = () => {
        if (item?.isNoted == 1) {
            const missing = scoringTargets.filter(t => !notes[t.key] || notes[t.key].trim() === '')
            if (missing.length > 0) {
                alertNotify(`Vui lòng nhập ghi chú cho các mục:\n${missing.map(t => `• ${t.label}`).join('\n')}`)
                return
            }
        }
        setIsShowTasks(true)
    }
    const onConfirmTasks = () => { setIsShowTasks(false); setIsShowResult(true) }
    const onBackToScoring = () => setIsShowTasks(false)
    const onRetry = () => { setScores({}); setNotes({}); setTasks(''); setCurrentIndex(0); setIsShowResult(false); setIsShowTasks(false) }

    const buildUploadPayload = () => {
        const groupMap = {}
        questions.forEach((question, qIdx) => {
            const gName = question.groupName || getQuestionTitle(question)
            if (!groupMap[gName]) groupMap[gName] = { groupName: gName, groupId: question.groupId, items: [] }
            scoringTargets
                .filter(t => t.questionIndex === qIdx)
                .forEach(t => groupMap[gName].items.push({
                    id: t.id,
                    label: t.label,
                    mode: t.mode,
                    score: scores[t.key] ?? 0,
                    note: notes[t.key] || ''
                }))
        })
        const groups = Object.values(groupMap).map(g => {
            const gScore = round1(g.items.reduce((s, t) => s + t.score, 0))
            return { ...g, totalScore: gScore }
        })
        return {
            shopId: item?.shopId || 0,
            employeeId: item?.employeeId,
            isNoted: item?.isNoted || false,
            totalScore,
            tasks,
            groups
        }
    }
    // ─── Styles ───────────────────────────────────────────────────────────────
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.light },
        loadingView: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.5)' },
        // Header
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
        headerName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginLeft: 6, flexShrink: 1 },
        headerCode: { fontSize: 11, color: appcolor.placeholderText, marginLeft: 4 },
        headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        // Progress bar
        progressFill: { height: 3, backgroundColor: appcolor.primary, borderTopEndRadius: 8, borderBottomEndRadius: 8 },
        // Question card
        questionCard: { margin: 10, marginBottom: 6, padding: 8, borderRadius: 8, backgroundColor: appcolor.surface, borderWidth: 0.5, borderColor: appcolor.grayLight },
        questionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        questionNumber: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.primary },
        groupTag: { padding: 8, paddingHorizontal: 12, backgroundColor: appcolor.primary + '18', borderRadius: 8 },
        groupTagText: { fontSize: 12, color: appcolor.primary, fontWeight: fontWeightBold },
        // Score input
        scorePanel: { marginHorizontal: 10, marginBottom: 8, padding: 10, borderRadius: 10, backgroundColor: appcolor.surface, borderWidth: 0.5, borderColor: appcolor.grayLight },
        scorePanelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
        scorePanelTitle: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.primary },
        scorePanelMode: { fontSize: 10, color: appcolor.primary, fontWeight: fontWeightBold },
        targetList: { marginHorizontal: 10, marginBottom: 8 },
        targetListContent: { paddingBottom: 2 },
        targetItemWrap: { flex: 1, paddingHorizontal: 3, marginBottom: 6 },
        targetItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.grayLight, backgroundColor: appcolor.surface, minHeight: 58 },
        targetItemActive: { borderColor: appcolor.primary, backgroundColor: appcolor.primary + '12' },
        targetItemLeft: { flex: 1, marginRight: 8 },
        targetItemLabel: { fontSize: 12, color: appcolor.dark, fontWeight: fontWeightBold },
        targetItemMeta: { fontSize: 10, color: appcolor.placeholderText, marginTop: 2 },
        targetItemScore: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.primary },
        scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
        stepperBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: appcolor.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: appcolor.light },
        stepperBtnDisabled: { borderColor: appcolor.grayLight },
        stepperValueBox: { flex: 1, alignItems: 'center', marginHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: appcolor.light },
        stepperValueText: { fontSize: 30, fontWeight: fontWeightBold, color: appcolor.dark },
        presetLabel: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.placeholderText, marginBottom: 6 },
        presetRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
        presetChip: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: appcolor.grayLight, backgroundColor: appcolor.light },
        presetChipActive: { borderColor: appcolor.primary, backgroundColor: appcolor.primary },
        presetChipText: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        presetChipTextActive: { color: appcolor.light },
        noteLabel: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.placeholderText, marginTop: 12, marginBottom: 6 },
        noteInput: { borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: appcolor.dark, backgroundColor: appcolor.light, minHeight: 70, textAlignVertical: 'top' },
        // Tasks page
        tasksSection: { marginHorizontal: 10, marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: appcolor.surface, borderWidth: 0.5, borderColor: appcolor.grayLight },
        tasksTitle: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 4 },
        tasksSubtitle: { fontSize: 11, color: appcolor.placeholderText, marginBottom: 10 },
        tasksInput: { borderWidth: 0.5, borderColor: appcolor.grayLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, fontSize: 13, color: appcolor.dark, backgroundColor: appcolor.light, minHeight: 160, textAlignVertical: 'top' },
        // Summary - note & tasks
        summaryNoteRow: { paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight + '80' },
        summaryNoteText: { fontSize: 11, fontStyle: 'italic', color: appcolor.placeholderText },
        summaryTasksCard: { borderRadius: 8, backgroundColor: appcolor.surface, borderWidth: 0.5, borderColor: appcolor.grayLight, padding: 10 },
        summaryTasksText: { fontSize: 13, color: appcolor.dark, lineHeight: 18 },
        summaryTasksEmpty: { fontSize: 12, fontStyle: 'italic', color: appcolor.placeholderText },
        // Navigation
        navRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
        navBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: appcolor.primary },
        navBtnPrimary: { backgroundColor: appcolor.primary, borderColor: appcolor.primary },
        navBtnPrimaryDisabled: { backgroundColor: appcolor.grayLight, borderColor: appcolor.grayLight },
        navBtnText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.primary },
        navBtnTextPrimary: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.light },
        // Result screen
        resultScroll: { flex: 1 },
        resultScoreWrap: { alignItems: 'center', minWidth: 70 },
        resultScoreValue: { fontSize: 30, fontWeight: fontWeightBold, color: appcolor.light },
        resultBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, margin: 10 },
        resultBannerText: { flex: 1 },
        resultBannerTitle: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.light, marginBottom: 2 },
        resultBannerSub: { fontSize: 12, color: appcolor.light },
        statBox: { borderRadius: 8, padding: 8, alignItems: 'center' },
        statValue: { fontSize: 18, fontWeight: fontWeightBold, color: appcolor.light },
        actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
        actionBtn: { flexDirection: 'row', padding: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: appcolor.grayLight, gap: 6 },
        actionBtnText: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.dark },
        // Summary
        summarySection: { marginHorizontal: 10, marginBottom: 10 },
        summaryTitle: { fontSize: 11, fontWeight: fontWeightBold, color: appcolor.placeholderText, marginBottom: 6, textTransform: 'uppercase', textAlign: 'center' },
        summaryQCard: { borderRadius: 8, backgroundColor: appcolor.surface, borderWidth: 0.5, borderColor: appcolor.grayLight, marginBottom: 8, overflow: 'hidden' },
        summaryQHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        summaryQName: { flex: 1, fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark, marginRight: 8 },
        summaryQScoreWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
        summaryQScore: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.primary },
        summaryQMax: { fontSize: 11, color: appcolor.placeholderText },
        summarySubRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight + '80' },
        summarySubName: { flex: 1, fontSize: 12, color: appcolor.dark, marginRight: 8 },
        summarySubScore: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.primary },
        summarySubMax: { fontSize: 10, color: appcolor.placeholderText },
    })

    if (total === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <ScoringHeader styles={styles} appcolor={appcolor} item={item} onClose={onClose} />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: appcolor.placeholderText, fontSize: 14 }}>Không có tiêu chí đánh giá</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (isShowResult) {
        return (
            <ResultView
                styles={styles}
                appcolor={appcolor}
                item={item}
                questions={questions}
                scoringTargets={scoringTargets}
                scores={scores}
                notes={notes}
                tasks={tasks}
                totalScore={totalScore}
                isUploading={isUploading}
                getQuestionTitle={getQuestionTitle}
                onClose={onClose}
                onRetry={onRetry}
                onUpload={handleUpload}
            />
        )
    }

    if (isShowTasks) {
        return (
            <TasksView
                styles={styles}
                appcolor={appcolor}
                item={item}
                tasks={tasks}
                setTasks={setTasks}
                onClose={onClose}
                onBack={onBackToScoring}
                onConfirm={onConfirmTasks}
            />
        )
    }

    return (
        <QuizView
            styles={styles}
            appcolor={appcolor}
            item={item}
            total={total}
            currentIndex={currentIndex}
            currentQ={currentQ}
            progress={progress}
            allQuestionsAnswered={allQuestionsAnswered}
            currentTargetsAnswered={currentTargetsAnswered}
            scoreInputProps={{
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
            }}
            onClose={onClose}
            onPrev={onPrev}
            onNext={onNext}
            onSubmit={onSubmit}
        />
    )
}

export default EmployeeScoring;
