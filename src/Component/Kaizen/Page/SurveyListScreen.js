import React, { useMemo, useState, useCallback } from 'react'
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { Icon } from '@rneui/themed'
import { PhotoInput } from './PhotoInput'
import { deviceWidth } from '../../../Themes/AppsStyle'

const SurveyListScreen = ({ data = [], onCloseModal }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [collapsedSections, setCollapsedSections] = useState({})

    const normalizedData = useMemo(() => {
        const dataMap = new Map()

        ;(data || []).forEach((item, index) => {
            const key = item?._rowKey || item?.guid || `${item?.id || 'item'}_${item?.createdDate || index}_${item?.employeeId || item?.employeeName || ''}`
            if (!dataMap.has(key)) {
                dataMap.set(key, { ...item, _rowKey: key })
            }
        })

        return Array.from(dataMap.values())
    }, [data])

    const sections = useMemo(() => {
        const map = {}

        normalizedData.forEach(item => {
            if (!map[item.employeeName]) {
                map[item.employeeName] = []
            }
            map[item.employeeName].push(item)
        })

        return Object.keys(map).map(key => ({
            title: key,
            data: map[key]
        }))
    }, [normalizedData])

    const toggleSection = useCallback((title) => {
        setCollapsedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }, [])

    const formatDate = (dateString) => {
        const d = new Date(dateString)
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')
            }/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }

    const stats = useMemo(() => {
        const now = new Date()
        const startOfWeek = new Date(now)
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
        startOfWeek.setDate(now.getDate() - dayOfWeek)
        startOfWeek.setHours(0, 0, 0, 0)
        const thisMonth = normalizedData.filter(item => {
            const d = new Date(item.createdDate)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length
        const thisWeek = normalizedData.filter(item => new Date(item.createdDate) >= startOfWeek).length
        return { total: normalizedData.length, thisMonth, thisWeek }
    }, [normalizedData])

    const renderItem = ({ item, section }) => {
        const dataPhoto = JSON.parse(item.listPhoto || '[]');
        if (collapsedSections[section.title]) return null

        // const itemSelect = 'Phân loại đề xuất'
        const itemSelect = JSON.parse(item.classify || '{}')

        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.employee}>{item.employeeName}</Text>

                    <View style={[styles.badge, { backgroundColor: appcolor.primary || '#2979FF' }]}>
                        <Text style={styles.badgeText}>{item.type}</Text>
                    </View>
                </View>

                <Text style={styles.date}>
                    {formatDate(item.createdDate)}
                </Text>
                {
                    Object.keys(itemSelect).length > 0 &&
                    <View style={{ width: deviceWidth }}>
                        <Text style={styles.label}>Phân loại đề xuất : {itemSelect.id == 100 && itemSelect.nameVN}</Text>
                        {itemSelect.id !== 100 && <Text style={styles.content}>{itemSelect.id == 100 ? `${itemSelect.nameVN}` : `${itemSelect.groupName} : ${itemSelect.nameVN}`}</Text>}
                        {item.noteClassify && <Text style={styles.content}>Nội dung khác : {item.noteClassify}</Text>}
                    </View>
                }
                <Text style={styles.label}>Hiện trạng :</Text>
                <Text style={styles.content}>{item.current}</Text>

                <Text style={styles.label}>Đề xuất :</Text>
                <Text style={styles.content}>{item.propose}</Text>
                {
                    item.listPhoto && dataPhoto.length > 0 &&
                    <View key={`Photo_${item.id}`}>
                        <PhotoInput _guid={item.guid} listPhoto={dataPhoto} isHideCamera={true} />
                    </View>
                }
            </View>
        )
    }
    const styles = StyleSheet.create({
        container: { flex: 1, paddingBottom: 50, backgroundColor: appcolor.light },
        summary: { paddingHorizontal: 16, paddingVertical: 8 },
        sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: appcolor.surface, },
        sectionTitle: { fontWeight: '600', fontSize: 14 },
        card: { backgroundColor: appcolor.light, marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: appcolor.success, elevation: 2 },
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        employee: { fontWeight: '600', fontSize: 15 },
        badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
        badgeText: { color: appcolor.light, fontSize: 12 },
        date: { color: appcolor.greydark, marginVertical: 6, fontSize: 12 },
        label: { marginTop: 8, fontWeight: '600', fontSize: 13 },
        content: { marginTop: 4, color: appcolor.dark, fontSize: 13 },
        screenTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, color: appcolor.dark },
        statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 14, gap: 8 },
        statCard: { flex: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
        statNumber: { fontSize: 30, fontWeight: '800', color: '#fff' },
        statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 3, textAlign: 'center' },
        closeButton: { position: 'absolute', right: 20, top: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: appcolor.dark, justifyContent: 'center', alignItems: 'center', elevation: 5 }
    })


    return (
        <SafeAreaView edges={['bottom']} style={styles.container}>
            <Text style={styles.screenTitle}>Đã đề xuất</Text>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: appcolor.primary }]}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Tổng{`\n`}cộng</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#007DBA' }]}>
                    <Text style={styles.statNumber}>{stats.thisMonth}</Text>
                    <Text style={styles.statLabel}>Tháng{`\n`}này</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                    <Text style={styles.statLabel}>Tuần{`\n`}này</Text>
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item, index) => (item?._rowKey || item?.guid || `${item?.id || 'item'}_${index}`).toString()}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section }) => (
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => toggleSection(section.title)}
                    >
                        <Text style={styles.sectionTitle}>
                            🏢 {section.title} ({section.data.length})
                        </Text>

                        <Icon
                            name={collapsedSections[section.title] ? 'chevron-forward' : 'chevron-down'}
                            type="ionicon"
                            size={18}
                        />
                    </TouchableOpacity>
                )}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
            {!!onCloseModal && (
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onCloseModal}
                >
                    <Icon name="close" type="ionicon" size={22} color="#fff" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    )
}

export default SurveyListScreen

