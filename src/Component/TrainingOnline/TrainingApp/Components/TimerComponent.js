import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { fontWeightBold } from '../../../../Themes/AppsStyle'

const TimerComponent = React.memo(({ timeLeft, totalTime }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }, [])

    const getProgressPercentage = useCallback(() => {
        if (totalTime === 0) return 0
        return ((timeLeft / totalTime) * 100)
    }, [timeLeft, totalTime])

    const getTimeColor = useCallback(() => {
        const percentage = getProgressPercentage()
        if (percentage > 50) return appcolor.success
        if (percentage > 20) return appcolor.warning
        return appcolor.danger
    }, [getProgressPercentage, appcolor])

    const styles = useMemo(() => StyleSheet.create({
        containerTime: {
            width: '100%', backgroundColor: appcolor.surface, padding: 16,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        },
        timeInfo: { flex: 1 },
        textTime: { fontSize: 18, fontWeight: fontWeightBold, color: appcolor.dark, marginBottom: 4 },
        textLabel: { fontSize: 12, color: appcolor.dark, opacity: 0.7 },
        progressContainer: { flex: 1, marginLeft: 16 },
        progressBar: { height: 6, backgroundColor: appcolor.light, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
        progressFill: { height: 6, borderRadius: 3, backgroundColor: getTimeColor() },
    }), [appcolor])

    return (
        <View style={styles.containerTime}>
            <View style={styles.timeInfo}>
                <Text style={styles.textTime}>{formatTime(timeLeft)}</Text>
                <Text style={styles.textLabel}>Thời gian còn lại</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        {
                            width: `${getProgressPercentage()}%`,
                            backgroundColor: getTimeColor()
                        }
                    ]} />
                </View>
            </View>
        </View>
    )
})
export default TimerComponent