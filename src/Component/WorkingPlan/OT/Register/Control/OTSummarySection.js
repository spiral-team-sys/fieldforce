import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

import OTSummaryItem from '../Items/OTSummaryItem';

const OTSummarySection = ({ appcolor, items, monthLimit }) => {
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thống kê tăng ca</Text>
                {monthLimit !== undefined &&
                    <Text style={styles.sectionHint}>Giới hạn {monthLimit}h</Text>
                }
            </View>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryList}>
                    {items.map((item, index) => (
                        <OTSummaryItem
                            key={`OT_SUMMARY_${index}`}
                            appcolor={appcolor}
                            item={item}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const createStyles = (appcolor) => StyleSheet.create({
    section: {
        marginBottom: 12
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    sectionTitle: {
        flex: 1,
        color: appcolor.dark,
        fontSize: 13,
        fontWeight: '700'
    },
    sectionHint: {
        color: appcolor.greylight,
        fontSize: 11,
        fontWeight: '500'
    },
    summaryContainer: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: appcolor.surface,
        backgroundColor: appcolor.white || appcolor.light,
        paddingVertical: 8,
        paddingHorizontal: 4
    },
    summaryList: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default memo(OTSummarySection);
