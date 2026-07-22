import React from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';

const groupData = (data) => {
    return data.reduce((acc, item) => {
        if (!acc[item.incentiveName]) acc[item.incentiveName] = [];
        acc[item.incentiveName].push(item);
        return acc;
    }, {});
};

const RenderKPI6 = ({ dataKPI, navigation }) => {

    const grouped = groupData(dataKPI);

    console.log(grouped, 'dataKPIdataKPIdataKPI');

    const IncentiveCard = ({ item }) => {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.incentiveName}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>{item.progressTitle}</Text>
                    <Text style={styles.value}>
                        {item.totalProgress}
                        {item.progressTitle.includes('%') ? '%' : ''}
                    </Text>
                </View>

                {item.rank && (
                    <View style={styles.row}>
                        <Text style={styles.label}>{item.rankTitle}</Text>
                        <Text style={[styles.value, getRankColor(item.rank)]}>{item.rank}</Text>
                    </View>
                )}

                <View style={styles.row}>
                    <Text style={styles.label}>{item.amountTitle}</Text>
                    <Text style={styles.value}>{parseInt(item.amountIncentive).toLocaleString()} đ</Text>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            contentContainerStyle={styles.container}
            data={dataKPI}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <IncentiveCard item={item} />}
        />
    );

    // return (
    //     <ScrollView style={styles.container}>
    //         {Object.entries(grouped).map(([incentiveName, entries], index) => (
    //             <View key={index} style={styles.card}>
    //                 <Text style={styles.header}>{incentiveName}</Text>
    //                 {entries.map((item, idx) => (
    //                     <View key={idx} style={styles.row}>
    //                         <Text style={styles.percent}>{item.totalProgress}{item.progressTitle.includes('%') ? '%' : ''}</Text>
    //                         <Text style={styles.rank}>{item.rank || '-'}</Text>
    //                         <Text style={styles.bonus}>
    //                             {item.amountTitle}: {item.amountIncentive} đ
    //                         </Text>
    //                     </View>
    //                 ))}
    //             </View>
    //         ))}
    //     </ScrollView>
    // );
};

const getRankColor = (rank) => {
    switch (rank) {
        case 'A':
            return { color: 'green' };
        case 'B':
            return { color: 'orange' };
        case 'C':
            return { color: 'red' };
        default:
            return { color: '#333' };
    }
};

const IncentiveList = () => {

};
const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        color: '#666',
    },
    value: {
        fontWeight: '600',
        color: '#222',
    },
});
export default RenderKPI6;
