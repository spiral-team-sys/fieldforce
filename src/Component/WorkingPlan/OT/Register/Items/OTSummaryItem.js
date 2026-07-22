import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

const OTSummaryItem = ({ appcolor, item }) => {
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    return (
        <View style={styles.container}>
            <Text style={styles.value}>{item.value}</Text>
            <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        </View>
    );
};

const createStyles = (appcolor) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    value: {
        color: appcolor.primary,
        fontSize: 22,
        textAlign: 'center',
        fontWeight: '800'
    },
    title: {
        color: appcolor.dark,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4
    }
});

export default memo(OTSummaryItem);
